# Krili Backend API

A comprehensive Python Flask backend for the Krili peer-to-peer rental marketplace.

## Features

- **User Management**: Registration, authentication, profile management
- **Item Listings**: Create, update, delete rental items with images
- **Rentals**: Booking system with status tracking
- **Reviews**: Rating and feedback system for items and users
- **Messaging**: User-to-user communication
- **Wishlist**: Save favorite items
- **Categories**: Organize items by category
- **Search & Filtering**: Advanced search with sorting options

## Setup

### Prerequisites
- Python 3.8+
- PostgreSQL (or any SQLAlchemy-compatible database)
- pip

### Installation

1. **Clone and navigate to backend folder**
\`\`\`bash
cd backend
\`\`\`

2. **Create virtual environment**
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

3. **Install dependencies**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. **Configure environment variables**
\`\`\`bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
\`\`\`

5. **Initialize database**
\`\`\`bash
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
>>>     db.create_all()
>>> exit()
\`\`\`

6. **Run the server**
\`\`\`bash
python app.py
\`\`\`

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-token` - Verify JWT token

### Users
- `GET /api/users/<user_id>` - Get user profile
- `GET /api/users/profile` - Get current user profile (requires auth)
- `PUT /api/users/profile` - Update profile (requires auth)
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/<user_id>/items` - Get user's items
- `GET /api/users/<user_id>/reviews` - Get user's reviews

### Items
- `GET /api/items` - Get all items (with filtering, sorting, pagination)
- `GET /api/items/<item_id>` - Get item details
- `POST /api/items` - Create item (requires auth)
- `PUT /api/items/<item_id>` - Update item (requires auth)
- `DELETE /api/items/<item_id>` - Delete item (requires auth)
- `POST /api/items/<item_id>/images` - Add item image (requires auth)
- `GET /api/items/featured` - Get featured items

### Rentals
- `POST /api/rentals` - Create rental booking (requires auth)
- `GET /api/rentals/<rental_id>` - Get rental details (requires auth)
- `GET /api/rentals/user/rentals` - Get user's rentals (requires auth)
- `GET /api/rentals/owner/rentals` - Get rentals for owned items (requires auth)
- `PUT /api/rentals/<rental_id>/status` - Update rental status (requires auth)
- `POST /api/rentals/<rental_id>/cancel` - Cancel rental (requires auth)

### Reviews
- `POST /api/reviews` - Create review (requires auth)
- `GET /api/reviews/item/<item_id>` - Get item reviews
- `GET /api/reviews/user/<user_id>` - Get user reviews

### Messages
- `POST /api/messages` - Send message (requires auth)
- `GET /api/messages/inbox` - Get inbox (requires auth)
- `GET /api/messages/sent` - Get sent messages (requires auth)
- `PUT /api/messages/<message_id>/read` - Mark as read (requires auth)
- `DELETE /api/messages/<message_id>` - Delete message (requires auth)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/<category_id>` - Get category details
- `POST /api/categories` - Create category

### Wishlist
- `GET /api/wishlist` - Get user wishlist (requires auth)
- `POST /api/wishlist` - Add to wishlist (requires auth)
- `DELETE /api/wishlist/<item_id>` - Remove from wishlist (requires auth)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your_token_here>
\`\`\`

## Database Schema

The backend uses SQLAlchemy ORM with the following main models:
- **User**: User accounts and profiles
- **Item**: Rental item listings
- **ItemImage**: Images for items
- **Category**: Item categories
- **Rental**: Booking transactions
- **Review**: Ratings and feedback
- **Message**: User messages
- **Wishlist**: Saved items

## Deployment

When you're ready to connect this backend to your frontend:

1. Update the frontend API base URL to point to your hosted backend
2. Set up environment variables on your hosting platform
3. Configure CORS settings for your frontend domain
4. Set up a production database (PostgreSQL recommended)
5. Use a production WSGI server like Gunicorn

\`\`\`bash
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
\`\`\`

## Notes

- All timestamps are in UTC
- Passwords are hashed using bcrypt
- Database connection string should be set in environment variables
- JWT secret key should be changed in production
