# 🌞 Sunleaf Technologies - E-Commerce Platform

A modern, full-stack e-commerce platform for solar energy and renewable energy products, featuring AI-powered solar quotations, M-Pesa payment integration, and a comprehensive admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PHP](https://img.shields.io/badge/PHP-7.4+-purple)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)

## ✨ Features

### 🛒 E-Commerce Core
- **Product Catalog** - Browse solar panels, batteries, inverters, and more
- **Smart Search** - Advanced filtering and search functionality
- **Shopping Cart** - Persistent cart with Zustand state management
- **Wishlist** - Save favorite products for later
- **Product Reviews** - Star ratings and customer feedback
- **Order Tracking** - Real-time order status updates

### 💳 Payment Integration
- **M-Pesa STK Push** - Seamless mobile money payments
- **Payment Verification** - Automatic callback handling
- **Multiple Payment Methods** - Cash on delivery, bank transfer

### 🤖 AI-Powered Features
- **Solar Quotation Tool** - Intelligent system recommendations using DeepSeek AI
- **Energy Analysis** - Appliance consumption calculations
- **Custom Quotes** - Personalized solar solutions

### 👨‍💼 Admin Dashboard
- **Dashboard Analytics** - Revenue, orders, and product metrics
- **Product Management** - CRUD operations with image upload
- **Order Management** - Status tracking and customer communication
- **Inventory Control** - Real-time stock levels and movement tracking
- **User Management** - Role-based access control
- **Content Management** - Dynamic banners and featured products
- **Reports & Analytics** - Sales trends and performance insights

### 🔐 Security Features
- **Session-based Authentication** - Secure user sessions
- **Rate Limiting** - Protection against brute force attacks
- **Email Verification** - Required before account activation
- **Password Hashing** - Bcrypt encryption
- **SQL Injection Prevention** - Prepared statements throughout
- **CORS Protection** - Whitelist-based origin validation

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS Modules
- **State Management:** Zustand
- **UI Components:** Material-UI, Radix UI
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Notifications:** React Toastify

### Backend
- **Language:** PHP 7.4+
- **Database:** MySQL 8.0+
- **Email:** PHPMailer
- **Environment:** Dotenv
- **Dependency Management:** Composer

### External Services
- **Payment:** M-Pesa (Safaricom)
- **AI:** DeepSeek API
- **Analytics:** Google Analytics 4
- **Email:** SMTP (Gmail)

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **PHP** 7.4 or higher
- **MySQL** 8.0 or higher
- **Composer** (for PHP dependencies)
- **XAMPP** or similar (Apache + MySQL + PHP)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sunleaf-technologies.git
cd sunleaf-technologies
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# Update NEXT_PUBLIC_API_URL to match your backend URL
```

### 3. Backend Setup

```bash
# Navigate to API directory
cd api

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Update database credentials, M-Pesa keys, email settings, etc.
```

### 4. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE sunleaft_sunleaftechnologies;"

# Import schema
mysql -u root -p sunleaft_sunleaftechnologies < api/migrations/production_complete_schema.sql

# (Optional) Import sample data
mysql -u root -p sunleaft_sunleaftechnologies < api/migrations/sample_data.sql
```

### 5. Configuration

#### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost/frontend2-dev/api
NEXT_PUBLIC_API_URL=http://localhost/frontend2-dev/api
NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost/frontend2-dev/api/public
```

#### Backend (api/.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=sunleaft_sunleaftechnologies

SPA_ORIGIN=http://localhost:3000

MPESA_ENV=sandbox
MPESA_SANDBOX_CONSUMER_KEY=your_key
MPESA_SANDBOX_CONSUMER_SECRET=your_secret
MPESA_SANDBOX_SHORTCODE=174379
MPESA_SANDBOX_PASSKEY=your_passkey

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

DEEPSEEK_API_KEY=your_api_key
```

### 6. Start Development Servers

```bash
# Start frontend (in project root)
npm run dev
# Frontend runs on http://localhost:3000

# Start backend (XAMPP)
# 1. Open XAMPP Control Panel
# 2. Start Apache and MySQL
# Backend runs on http://localhost/frontend2-dev/api
```

## 📁 Project Structure

```
sunleaf-technologies/
├── app/                        # Next.js App Router pages
│   ├── (Admin)/               # Admin dashboard routes
│   ├── (Client)/              # Client-facing routes
│   ├── login/                 # Authentication pages
│   └── product/               # Product pages
├── api/                       # PHP Backend
│   ├── admin/                 # Admin endpoints
│   ├── auth/                  # Authentication
│   ├── inventory/             # Inventory management
│   ├── mpesa/                 # M-Pesa integration
│   ├── solar/                 # AI solar quotations
│   └── migrations/            # Database migrations
├── components/                # React components
│   ├── admin/                 # Admin components
│   └── ui/                    # Reusable UI components
├── context/                   # React Context providers
├── store/                     # Zustand stores
├── styles/                    # CSS Modules
├── utils/                     # Utility functions
└── public/                    # Static assets
```

## 🔧 Configuration

### M-Pesa Setup

1. Register at [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Create a new app
3. Get your Consumer Key and Consumer Secret
4. Update `api/.env` with your credentials
5. Set callback URL: `https://yourdomain.com/api/mpesa/mpesa-callback.php`

### Email Setup

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Update `MAIL_USERNAME` and `MAIL_PASSWORD` in `api/.env`

### AI Solar Quotations

1. Sign up at [DeepSeek](https://www.deepseek.com)
2. Get your API key
3. Update `DEEPSEEK_API_KEY` in `api/.env`

## 🌐 Deployment

### Frontend (Vercel)

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel deploy
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_MEDIA_BASE_URL`

### Backend (cPanel/Shared Hosting)

1. Upload `api/` folder to your hosting
2. Create MySQL database
3. Import schema from `api/migrations/production_complete_schema.sql`
4. Copy `api/.env.example` to `api/.env`
5. Update environment variables
6. Run `composer install` via SSH or cPanel terminal
7. Set file permissions (755 for directories, 644 for files)

## 📚 API Documentation

### Authentication
- `POST /api/auth/login.php` - User login
- `POST /api/SignUp.php` - User registration
- `POST /api/auth/logout.php` - User logout
- `GET /api/check-auth.php` - Check authentication status

### Products
- `GET /api/getProductsClients.php` - Get products (with filters)
- `GET /api/getProductDetails.php?id={id}` - Get single product
- `GET /api/getTopDeals.php` - Get featured products
- `POST /api/admin/addProduct.php` - Create product (admin)
- `PUT /api/admin/updateProduct.php` - Update product (admin)

### Orders
- `POST /api/createOrder.php` - Create new order
- `GET /api/orders.php` - Get user orders
- `GET /api/admin/getOrders.php` - Get all orders (admin)
- `PUT /api/admin/updateOrderStatus.php` - Update order status (admin)

### Payments
- `POST /api/mpesa/mpesa-stkpush.php` - Initiate M-Pesa payment
- `POST /api/mpesa/mpesa-callback.php` - Payment callback
- `GET /api/mpesa/mpesa-status.php` - Check payment status

### Solar Quotations
- `POST /api/solar/analyzeAppliances.php` - Analyze energy needs
- `POST /api/solar/generateSolarQuote.php` - Generate AI quote

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Elan Walton** - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Safaricom for M-Pesa API
- DeepSeek for AI capabilities
- All contributors and users

## 📞 Support

For support, email support@sunleaftechnologies.co.ke or create an issue in this repository.

## 🔗 Links

- [Website](https://sunleaftechnologies.co.ke)
- [Documentation](https://docs.sunleaftechnologies.co.ke)
- [API Reference](https://api.sunleaftechnologies.co.ke/docs)

---

**Built with ❤️ for a sustainable future** 🌱
