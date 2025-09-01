# 📦 Box Manufacturing & Selling System

<div align="center">

![Box Selling System](https://img.shields.io/badge/Box%20Selling%20System-v1.0.0-blue?style=for-the-badge&logo=box&logoColor=white)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge&logo=mongodb&logoColor=white)
![Industry Project](https://img.shields.io/badge/Industry-Project-orange?style=for-the-badge&logo=building&logoColor=white)

**A comprehensive full-stack e-commerce platform for box manufacturing and selling business**

[🚀 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](https://github.com/KRISHNACHAUDHARI10/boxsellingsystem/issues) • [✨ Request Feature](https://github.com/KRISHNACHAUDHARI10/boxsellingsystem/issues)

</div>

---

## 🌟 **Project Overview**

The **Box Manufacturing & Selling System** is a modern, full-featured e-commerce platform built with the MERN stack. This industry-level project provides a complete solution for box manufacturing businesses, featuring separate client and admin interfaces with real-time capabilities.

### 🎯 **Key Highlights**
- **⏱️ Development Time**: 2 months of intensive development
- **🏗️ Architecture**: Full-stack MERN application
- **🎨 Dynamic Interface**: Fully responsive and dynamic UI
- **🔧 Industry Standard**: Production-ready code structure
- **⚡ Real-time Features**: Socket.IO integration for live updates

---

## 🚀 **Features**

### 🛒 **Customer Features**
- **User Authentication** - Secure login/register system
- **Product Catalog** - Browse extensive box collections
- **Smart Search** - Advanced product search functionality
- **Shopping Cart** - Add/remove items with real-time updates
- **Wishlist** - Save favorite products for later
- **Order Management** - Track order status and history
- **Responsive Design** - Optimized for all devices
- **Real-time Notifications** - Instant order updates

### 👨‍💼 **Admin Features**
- **Dashboard Analytics** - Comprehensive business insights
- **Product Management** - Full CRUD operations for products
- **Category Management** - Organize products efficiently
- **Order Processing** - Complete order lifecycle management
- **User Management** - Customer account administration
- **Banner Management** - Homepage slider and banner control
- **Contact Management** - Handle customer inquiries
- **Email Management** - Newsletter and communication system

### 🔧 **Technical Features**
- **RESTful API** - Well-structured backend architecture
- **Real-time Communication** - Socket.IO integration
- **Image Upload** - Cloudinary integration for media management
- **Payment Integration** - Razorpay payment gateway
- **Data Validation** - Comprehensive input validation
- **Error Handling** - Robust error management system
- **Security** - JWT authentication and bcrypt encryption

---

## 🛠️ **Tech Stack**

### **Frontend (Client & Admin)**
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.7-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-7.3.1-0081CB?style=flat-square&logo=material-ui&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.10.0-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101?style=flat-square&logo=socket.io&logoColor=white)

### **Backend**
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5.1.0-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=json-web-tokens&logoColor=white)

### **Additional Services**
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payment-528FF0?style=flat-square&logo=razorpay&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Integration-FFCA28?style=flat-square&logo=firebase&logoColor=black)

---

## 📁 **Project Structure**

```
boxsellingsystem/
├── 📁 server/                 # Backend Node.js application
│   ├── 📁 routes/            # API routes
│   ├── 📁 models/            # MongoDB schemas
│   ├── 📁 middleware/        # Custom middleware
│   ├── 📁 helper/            # Helper functions
│   ├── 📁 uploads/           # Static file storage
│   ├── 📄 index.js           # Server entry point
│   └── 📄 package.json       # Server dependencies
│
├── 📁 client/                # Customer frontend
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable components
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 utils/         # Utility functions
│   │   ├── 📄 App.js         # Main app component
│   │   └── 📄 index.js       # React entry point
│   └── 📄 package.json       # Client dependencies
│
├── 📁 admin/                 # Admin panel frontend
│   ├── 📁 src/
│   │   ├── 📁 components/    # Admin components
│   │   ├── 📁 pages/         # Admin pages
│   │   ├── 📄 App.js         # Admin app component
│   │   └── 📄 index.js       # Admin entry point
│   └── 📄 package.json       # Admin dependencies
│
└── 📄 README.md              # Project documentation
```

---

## 🚀 **Installation & Setup**

### **Prerequisites**
- **Node.js** (v14 or higher)
- **MongoDB** (Local or Atlas)
- **Git**

### **1. Clone Repository**
```bash
git clone https://github.com/KRISHNACHAUDHARI10/boxsellingsystem.git
cd boxsellingsystem
```

### **2. Backend Setup**
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your environment variables
# DATABASE_URL=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# CLOUDINARY_CLOUD_NAME=your_cloudinary_name
# RAZORPAY_KEY=your_razorpay_key
# ... other configurations

# Start server
npm start
```

### **3. Client Setup**
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Start client application
npm start
```

### **4. Admin Panel Setup**
```bash
# Navigate to admin directory
cd ../admin

# Install dependencies
npm install

# Start admin panel
npm start
```

---

## 📱 **Application URLs**

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | `http://localhost:3001` | Server & API endpoints |
| **Client App** | `http://localhost:3000` | Customer interface |
| **Admin Panel** | `http://localhost:3002` | Admin dashboard |

---

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/users/signup` - User registration
- `POST /api/users/signin` - User login
- `POST /api/admin/login` - Admin login

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products/create` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### **Cart & Orders**
- `POST /api/cart/add` - Add to cart
- `GET /api/cart` - Get cart items
- `POST /api/orders/create` - Create order
- `GET /api/orders/user/:userId` - Get user orders

### **Categories**
- `GET /api/category` - Get all categories
- `POST /api/category/create` - Create category (Admin)

*[View complete API documentation →](docs/api.md)*

---

## 🎨 **Screenshots**

<div align="center">

### **🏠 Homepage**
![Homepage](https://via.placeholder.com/800x400/4285f4/ffffff?text=Homepage+Screenshot)

### **📱 Product Catalog**
![Product Catalog](https://via.placeholder.com/800x400/34a853/ffffff?text=Product+Catalog)

### **🛒 Shopping Cart**
![Shopping Cart](https://via.placeholder.com/800x400/fbbc05/ffffff?text=Shopping+Cart)

### **👨‍💼 Admin Dashboard**
![Admin Dashboard](https://via.placeholder.com/800x400/ea4335/ffffff?text=Admin+Dashboard)

</div>

---

## 🌐 **Key Dependencies**

### **Backend Dependencies**
```json
{
  "express": "^5.1.0",
  "mongoose": "^8.16.3",
  "socket.io": "^4.8.1",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^6.0.0",
  "cloudinary": "^2.7.0",
  "razorpay": "^2.9.6",
  "cors": "^2.8.5"
}
```

### **Frontend Dependencies**
```json
{
  "react": "^19.1.0",
  "react-router-dom": "^7.6.3",
  "@mui/material": "^7.3.1",
  "axios": "^1.10.0",
  "socket.io-client": "^4.8.1",
  "react-toastify": "^11.0.5",
  "bootstrap": "^5.3.7"
}
```

---

## 👨‍💻 **Developer Information**

<div align="center">

### **Krishna Chaudhari**
*PG MCA Student & Full-Stack Developer*

[![GitHub](https://img.shields.io/badge/GitHub-KRISHNACHAUDHARI10-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/KRISHNACHAUDHARI10)
[![Phone](https://img.shields.io/badge/Phone-9512707825-25D366?style=for-the-badge&logo=phone&logoColor=white)](tel:+919512707825)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](#)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](#)

</div>

---

## 🤝 **Contributing**

Contributions are welcome! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **💾 Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **📤 Push** to the branch (`git push origin feature/AmazingFeature`)
5. **🔄 Open** a Pull Request

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🎯 **Future Enhancements**

- [ ] **Mobile App** - React Native implementation
- [ ] **PWA Features** - Progressive Web App capabilities
- [ ] **Advanced Analytics** - Business intelligence dashboard
- [ ] **Multi-language Support** - Internationalization
- [ ] **AI Recommendations** - Product recommendation system
- [ ] **Advanced Filters** - Enhanced search and filtering
- [ ] **Bulk Orders** - B2B functionality
- [ ] **Inventory Management** - Stock tracking system

---

## 🙏 **Acknowledgments**

- **React Team** for the amazing frontend framework
- **MongoDB** for the flexible database solution
- **Express.js** for the robust backend framework
- **Material-UI** for the beautiful components
- **Socket.IO** for real-time capabilities
- **Cloudinary** for media management
- **Razorpay** for payment processing

---

## 📊 **Project Stats**

![GitHub repo size](https://img.shields.io/github/repo-size/KRISHNACHAUDHARI10/boxsellingsystem?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/KRISHNACHAUDHARI10/boxsellingsystem?style=for-the-badge)
![GitHub top language](https://img.shields.io/github/languages/top/KRISHNACHAUDHARI10/boxsellingsystem?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/KRISHNACHAUDHARI10/boxsellingsystem?style=for-the-badge)

---

<div align="center">

### **⭐ Star this repository if you found it helpful!**

**Made with ❤️ by [Krishna Chaudhari](https://github.com/KRISHNACHAUDHARI10)**

*"Building the future of box manufacturing industry, one line of code at a time."*

</div>
