from .auth import auth_bp
from .users import users_bp
from .items import items_bp
from .rentals import rentals_bp
from .reviews import reviews_bp
from .messages import messages_bp
from .categories import categories_bp
from .wishlist import wishlist_bp

__all__ = [
    'auth_bp',
    'users_bp',
    'items_bp',
    'rentals_bp',
    'reviews_bp',
    'messages_bp',
    'categories_bp',
    'wishlist_bp'
]
