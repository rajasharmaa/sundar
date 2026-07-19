# Damodar Traders Backend API

A RESTful API built with Node.js, Express, and MongoDB for the Damodar Traders admin panel.

## Features

- 🔐 JWT Authentication
- 🛡️ Security with Helmet and Rate Limiting
- ☁️ Cloudinary Image Upload
- 📊 Analytics and Statistics
- 📦 Product Management
- 📨 Inquiry Management
- 📈 Data Analytics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
5. Configure your environment variables in `.env`

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
REFRESH_SECRET=your_refresh_secret_key
REFRESH_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/status` - Check authentication status

### Products
- `GET /api/admin/products` - Get all products
- `GET /api/admin/products/:id` - Get product by ID
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Inquiries
- `GET /api/admin/inquiries` - Get all inquiries
- `PUT /api/admin/inquiries/:id/status` - Update inquiry status
- `DELETE /api/admin/inquiries/:id` - Delete inquiry

### Analytics
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/products/analytics/size-distribution` - Get size distribution
- `GET /api/admin/products/analytics/price-range` - Get price range analytics
- `GET /api/admin/products/filter/by-size` - Filter products by criteria

### Public
- `POST /api/public/inquiries` - Submit inquiry

## Project Structure

```
backend/
├── config/
│   ├── database.js      # Database configuration
│   └── cloudinary.js    # Cloudinary configuration
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── productController.js   # Product management
│   ├── inquiryController.js   # Inquiry management
│   └── analyticsController.js # Analytics logic
├── middleware/
│   ├── auth.js      # Authentication middleware
│   └── upload.js    # File upload middleware
├── models/
│   ├── Product.js   # Product schema
│   └── Inquiry.js   # Inquiry schema
├── routes/
│   ├── admin.js     # Admin routes
│   └── public.js    # Public routes
├── uploads/         # Uploaded files (auto-created)
├── .env             # Environment variables
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Helmet security headers
- CORS configuration
- Rate limiting
- Input validation
- File upload validation

## Error Handling

The API includes comprehensive error handling for:
- Database errors
- Validation errors
- Authentication errors
- File upload errors
- Rate limiting

## Logging

All requests are logged using Morgan middleware for monitoring and debugging.

## License

MIT