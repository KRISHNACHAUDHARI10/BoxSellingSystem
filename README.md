# 📦 **Box Selling System** 📦

<div align="center">
  <h2>🛒 <strong><em>Premium E-Commerce Platform</em></strong> 🛒</h2>
  <p><strong><em>A comprehensive e-commerce platform built with the MERN stack, specializing in box sales with complete client-side shopping experience and administrative management tools.</em></strong></p>
  
  ![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)
  ![MERN Stack](https://img.shields.io/badge/Stack-MERN-brightgreen.svg)
  ![Industry Ready](https://img.shields.io/badge/Industry-Ready-blue.svg)
</div>

## 🚀 **Features** ✨

### 🛍️ **Client Side Features**
- 🏪 **Product Catalog**: *Browse and search through various box products*
- 🔐 **User Authentication**: *Secure registration and login system*
- 🛒 **Shopping Cart**: *Add, remove, and manage items in cart*
- 📦 **Order Management**: *Place orders and track order history*
- 👤 **User Profile**: *Manage personal information and addresses*
- 💳 **Payment Integration**: *Secure payment processing*
- 📱 **Responsive Design**: *Optimized for desktop and mobile devices*

### 👨‍💼 **Admin Side Features**
- 📊 **Dashboard**: *Comprehensive overview of sales and analytics*
- 📝 **Product Management**: *Add, edit, delete, and manage box inventory*
- 📋 **Order Management**: *View, process, and update order status*
- 👥 **User Management**: *Manage customer accounts and information*
- 📈 **Analytics**: *Sales reports and performance metrics*
- 📦 **Inventory Tracking**: *Real-time stock management*

## 🛠️ **Technology Stack** 💻

### 🎨 **Frontend**
- ⚛️ **React.js** - *User interface library*
- 🔄 **Redux** - *State management*
- 🧭 **React Router** - *Navigation and routing*
- 🌐 **Axios** - *HTTP client for API calls*
- 🎨 **CSS3/SCSS** - *Styling and responsive design*

### ⚙️ **Backend**
- 🟢 **Node.js** - *Runtime environment*
- 🚀 **Express.js** - *Web application framework*
- 🍃 **MongoDB** - *NoSQL database*
- 📄 **Mongoose** - *MongoDB object modeling*
- 🔐 **JWT** - *Authentication and authorization*
- 🔒 **Bcrypt** - *Password hashing*

### 🔧 **Development Tools**
- 🔄 **Nodemon** - *Development server auto-restart*
- ⚡ **Concurrently** - *Run multiple commands simultaneously*
- 🌍 **dotenv** - *Environment variable management*

## 📋 **Prerequisites** ✅

**Before running this project, make sure you have the following installed:**
- 🟢 **Node.js** *(v14 or higher)*
- 🍃 **MongoDB** *(local installation or MongoDB Atlas)*
- 📦 **npm** *or* **yarn** *package manager*

## ⚙️ **Installation & Setup** 🚀

### 1️⃣ **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/boxsellingsystem.git
   cd boxsellingsystem
   ```

### 2️⃣ **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

### 3️⃣ **Environment Configuration**
   
   *Create a `.env` file in the root directory:*
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/boxsellingsystem
   JWT_SECRET=your_jwt_secret_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

### 4️⃣ **Database Setup**
   - ✅ *Ensure MongoDB is running locally or configure MongoDB Atlas*
   - 🔄 *The application will create necessary collections automatically*

### 5️⃣ **Run the application**
   ```bash
   # Run both client and server concurrently
   npm run dev
   
   # Or run separately
   # Server only
   npm run server
   
   # Client only
   npm run client
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order status (Admin)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/stats` - Get dashboard statistics

## 📱 Screenshots

[Add screenshots of your application here]

## 🎯 Project Structure

```
boxsellingsystem/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store and slices
│   │   ├── utils/         # Utility functions
│   │   └── App.js
├── server/                 # Express backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── server.js
├── uploads/              # File uploads directory
└── README.md
```

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku account and install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new app: `heroku create your-app-name`
4. Set environment variables in Heroku dashboard
5. Deploy: `git push heroku main`

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_production_jwt_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Thanks to the MERN stack community for excellent documentation
- Inspiration from various e-commerce platforms
- Special thanks to all contributors and testers

## 📞 Support

If you have any questions or need support, please open an issue or contact me directly.

---

⭐ **Star this repository if you found it helpful!** ⭐
