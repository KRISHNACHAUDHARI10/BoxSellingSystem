const { Product } = require("../models/product.js");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// GET /api/search - Main search endpoint
router.get("/", async (req, res) => {
  try {
    const {
      q: query,
      category,
      minPrice,
      maxPrice,
      rating,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    // Validate required query parameter
    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Build search filters
    const searchFilters = {
      $or: [
        { name: { $regex: query.trim(), $options: "i" } },
        { brand: { $regex: query.trim(), $options: "i" } },
        { catName: { $regex: query.trim(), $options: "i" } },
        { description: { $regex: query.trim(), $options: "i" } },
        { subCatName: { $regex: query.trim(), $options: "i" } }, // Added subcategory
        { tags: { $regex: query.trim(), $options: "i" } }, // Added tags if you have them
      ],
    };

    // Additional filters
    const additionalFilters = {};

    // Category filter
    if (category && category !== "all") {
      additionalFilters.catId = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      additionalFilters.price = {};
      if (minPrice) additionalFilters.price.$gte = parseFloat(minPrice);
      if (maxPrice) additionalFilters.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      additionalFilters.rating = { $gte: parseFloat(rating) };
    }

    // Combine all filters
    const finalFilter = {
      ...searchFilters,
      ...additionalFilters,
    };

    // Sort options
    const sortOptions = {};
    const validSortFields = [
      "name",
      "price",
      "rating",
      "createdAt",
      "updatedAt",
    ];

    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // Default sort
    }

    // Pagination
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
    const skip = (pageNumber - 1) * limitNumber;

    // Execute search with aggregation for better performance
    const searchResults = await Product.aggregate([
      { $match: finalFilter },
      {
        $addFields: {
          // Add relevance score based on match quality
          relevanceScore: {
            $sum: [
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$name",
                      regex: query.trim(),
                      options: "i",
                    },
                  },
                  10,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$brand",
                      regex: query.trim(),
                      options: "i",
                    },
                  },
                  8,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$catName",
                      regex: query.trim(),
                      options: "i",
                    },
                  },
                  6,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$description",
                      regex: query.trim(),
                      options: "i",
                    },
                  },
                  4,
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { relevanceScore: -1, ...sortOptions } },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $project: {
          name: 1,
          price: 1,
          oldPrice: 1,
          rating: 1,
          images: 1,
          brand: 1,
          catName: 1,
          subCatName: 1,
          description: { $substr: ["$description", 0, 150] }, // Limit description length
          discount: 1,
          countInStock: 1,
          isFeatured: 1,
          createdAt: 1,
          relevanceScore: 1,
        },
      },
    ]);

    // Get total count for pagination
    const totalResults = await Product.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalResults / limitNumber);

    // Response with comprehensive data
    res.json({
      success: true,
      data: {
        products: searchResults,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalResults,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
          limit: limitNumber,
        },
        searchInfo: {
          query: query.trim(),
          appliedFilters: {
            category: category || "all",
            priceRange: { min: minPrice, max: maxPrice },
            rating: rating || null,
          },
          sortBy,
          sortOrder,
        },
      },
      message: `Found ${totalResults} products matching "${query.trim()}"`,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during search",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/search/suggestions - Search suggestions/autocomplete
router.get("/suggestions", async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: [],
        },
      });
    }

    // Get suggestions from different fields
    const suggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { brand: { $regex: query, $options: "i" } },
            { catName: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          names: { $addToSet: "$name" },
          brands: { $addToSet: "$brand" },
          categories: { $addToSet: "$catName" },
        },
      },
      {
        $project: {
          suggestions: {
            $slice: [
              {
                $filter: {
                  input: {
                    $concatArrays: ["$names", "$brands", "$categories"],
                  },
                  cond: {
                    $regexMatch: {
                      input: "$$this",
                      regex: query,
                      options: "i",
                    },
                  },
                },
              },
              10, // Limit to 10 suggestions
            ],
          },
        },
      },
    ]);

    const suggestionList =
      suggestions.length > 0 ? suggestions[0].suggestions : [];

    res.json({
      success: true,
      data: {
        suggestions: suggestionList.slice(0, 8), // Limit to 8 suggestions
      },
    });
  } catch (error) {
    console.error("Suggestions Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching suggestions",
      data: { suggestions: [] },
    });
  }
});

// GET /api/search/popular - Get popular search terms
router.get("/popular", async (req, res) => {
  try {
    // This would typically come from a search analytics collection
    // For now, returning most common product names/brands
    const popularTerms = await Product.aggregate([
      {
        $group: {
          _id: "$catName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          term: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        popularSearches: popularTerms,
      },
    });
  } catch (error) {
    console.error("Popular searches Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching popular searches",
      data: { popularSearches: [] },
    });
  }
});

module.exports = router;
