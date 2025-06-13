# Daftra Project Documentation

## Project Architecture

### Frontend (React)
- **Location**: `/public/frontend`
- **Port**: 5173
- **Key Features**:
  - React-based SPA
  - Token-based authentication
  - Protected routes
  - Local storage for token management

### Backend (Laravel)
- **Location**: `/`
- **Port**: 8000
- **Framework**: Laravel with Sanctum
- **Database**: MySQL

## Security Implementation

### Authentication (Laravel Sanctum)
- Token-based authentication system
- Protected routes using `api.token` middleware
- Token storage in localStorage
- Automatic token expiration and revocation
- CSRF protection for web applications

### Input Sanitization
- Login form validation
- XSS protection
- SQL injection prevention
- Request validation middleware
- Input sanitization on all endpoints

### Rate Limiting
1. **Authentication Routes** (10 requests/minute):
   - `/api/login`
   - `/api/register`
   - `/api/user`
   - `/api/logout`

2. **Product Routes** (60 requests/minute):
   - `/api/products`
   - `/api/products/{product}`
   - `/api/products/categories`

3. **General API** (120 requests/minute):
   - Cart endpoints
   - Transaction endpoints
   - Other API endpoints

## Protected Routes

### Authentication Required
- All product endpoints
- User profile endpoints
- Cart management
- Transaction processing

### Public Routes
- Login
- Registration
- Public product listings

## API Structure

### Authentication Flow
1. User submits credentials
2. Backend validates with Sanctum
3. Token generated and returned
4. Frontend stores token
5. Token used in Authorization header

### Response Format
```json
{
    "data": [],
    "total": "number",
    "per_page": "number",
    "current_page": "number",
    "last_page": "number"
}
```

## Setup Instructions

### Frontend 
```bash
cd public/frontend
npm install
npm run dev
```

### Backend
```bash
composer install
php artisan migrate:fresh --seed
php artisan serve
```

## Test Credentials
- Email: muhammedk.aldin@gmail.com
- Password: Test@123456

## Security Headers
- Rate limit information
- Token validation
- CSRF protection
- CORS configuration

## Time Tracking
- Estimated time : 9 h
- Actual time : 8 h
- Recieve date : 12/6/2025 - 6 PM
- Submition date : 13/6/2025 - 2 AM 