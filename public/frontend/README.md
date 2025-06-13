# API Documentation

## API Endpoints

### Authentication Endpoints

#### Login (Sanctum)
- **URL**: `http://localhost:8000/api/login`
- **Method**: `POST`
- **Description**: Authenticate user and get Laravel Sanctum token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "string", // Laravel Sanctum Bearer Token
    "user": {
      "id": "number",
      "name": "string",
      "email": "string"
    }
  }
  ```

#### Get User Profile
- **URL**: `http://localhost:8000/api/user`
- **Method**: `GET`
- **Description**: Get authenticated user's profile using Sanctum token
- **Headers**: `Authorization: Bearer {sanctum_token}`
- **Response**:
  ```json
  {
    "id": "number",
    "name": "string",
    "email": "string"
  }
  ```

### Product Endpoints

#### Get Products
- **URL**: `http://localhost:8000/api/products`
- **Method**: `GET`
- **Description**: Get paginated list of products
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 7)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "name": "string",
        "description": "string",
        "category": "string",
        "price": "number",
        "stock": "number",
        "image_url": "string",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "total": "number",
    "per_page": "number",
    "current_page": "number",
    "last_page": "number"
  }
  ```

#### Get Product By ID
- **URL**: `http://localhost:8000/api/products/getProductById`
- **Method**: `POST`
- **Description**: Get detailed information about a specific product by its ID or array of Ids to use for The Cart Page
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "id": "number | number[]"  // Single product ID or array of product IDs
  }
  ```
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "name": "string",
        "description": "string",
        "category": "string",
        "price": "number",
        "stock": "number",
        "image_url": "string",
        "created_at": "string",
        "updated_at": "string"
      }
    ]
  }
  ```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 8000

### Frontend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The frontend will be available at `http://localhost:5173`

### Backend Setup
1. Navigate to the backend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
4. The backend will be available at `http://localhost:8000`

## Authentication Flow

1. User submits login credentials (email and password)
2. Backend validates credentials using Laravel Sanctum
3. On successful authentication, Sanctum generates a bearer token
4. Frontend stores the Sanctum token in localStorage
5. Token is included in subsequent API requests in the Authorization header as `Bearer {token}`
6. Protected routes check for valid Sanctum token before allowing access

## Test Credentials

You can use the following test credentials to access the system:

- **Email**: muhammedk.aldin@gmail.com
- **Password**: Test@123456

## Running Both Backend and Frontend

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Security Notes

- All API endpoints except login require Laravel Sanctum authentication
- Sanctum tokens are used for authentication
- Tokens are stored in localStorage
- Protected routes are implemented on both frontend and backend
- Passwords are hashed on the backend
- Sanctum provides CSRF protection for web applications
- Token expiration and revocation is handled by Sanctum
- API rate limiting is implemented through Sanctum middleware