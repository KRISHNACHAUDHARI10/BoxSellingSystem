import React from "react";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";

export default function Blog() {
  const categories = [
    { id: "packaging-tips", name: "Packaging Tips" },
    { id: "sustainability", name: "Sustainability" },
    { id: "industry-insights", name: "Industry Insights" },
    { id: "custom-design", name: "Custom Design" },
    { id: "product-guides", name: "Product Guides" },
  ];

  const blogPosts = [
    {
      id: 2,
      title: "Sustainable Packaging: Your Brand's Green Future",
      excerpt:
        "Learn how eco-friendly packaging solutions can reduce your carbon footprint while maintaining product protection and visual appeal.",
      category: "sustainability",
      author: "Mohit Gupta",
      date: "2025-08-25",
      readTime: "7 min read",
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Sweet Success: Packaging Confectionery Products",
      excerpt:
        "From chocolates to candies, discover the best packaging solutions that keep your sweet treats fresh and appealing to customers.",
      category: "product-guides",
      author: "Darshan Deshmukh",
      date: "2025-08-22",
      readTime: "4 min read",
      image:
        "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Custom Box Design Trends for 2025",
      excerpt:
        "Stay ahead of the curve with the latest design trends in custom packaging that will make your products stand out on shelves.",
      category: "custom-design",
      author: "Tejas Jagdale",
      date: "2025-08-20",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      title: "E-commerce Packaging: Balancing Protection and Cost",
      excerpt:
        "Optimize your shipping costs while ensuring product safety with our comprehensive guide to e-commerce packaging solutions.",
      category: "industry-insights",
      author: "Sunder Pichai",
      date: "2025-08-18",
      readTime: "8 min read",
      image:
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      title: "10 Creative Ways to Repurpose Your Boxes",
      excerpt:
        "Transform your used boxes into useful household items with these creative DIY ideas that promote sustainability and creativity.",
      category: "sustainability",
      author: "Krishna Chaudhari",
      date: "2025-08-15",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 7,
      title: "Luxury Perfume Box Packaging Ideas",
      excerpt:
        "Premium designs and materials that elevate your perfume packaging game.",
      category: "product-guides",
      author: "Rohit Sharma",
      date: "2025-08-12",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 8,
      title: "Eco-Friendly Materials You Should Try",
      excerpt:
        "Discover biodegradable and recyclable materials making waves in packaging.",
      category: "sustainability",
      author: "Aarav Patel",
      date: "2025-08-10",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 9,
      title: "Innovative Packaging Automation for 2025",
      excerpt:
        "How automation is changing packaging operations across industries.",
      category: "industry-insights",
      author: "Ananya Mehta",
      date: "2025-08-08",
      readTime: "9 min read",
      image:
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 10,
      title: "Creative Branding with Custom Boxes",
      excerpt: "Learn how your box design can reinforce your brand identity.",
      category: "custom-design",
      author: "Priya Singh",
      date: "2025-08-05",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div
      className="bg-green-50 min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <main className="container mx-auto px-6 py-12">
        {/* Blog Posts Grid */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-8 text-center">
            Latest Articles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      <Tag className="w-3 h-3 inline mr-1" />
                      {categories.find((cat) => cat.id === post.category)?.name}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString("en-GB")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">
                      {post.readTime}
                    </span>
                    <button className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
