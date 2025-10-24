from flask import Blueprint, request, jsonify
from models import db, User
from auth import token_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user profile"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@users_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile"""
    user = User.query.get(request.user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(user.to_dict(include_email=True)), 200

@users_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile"""
    user = User.query.get(request.user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    allowed_fields = ['first_name', 'last_name', 'bio', 'phone', 'address', 'city', 'state', 'zip_code', 'country', 'profile_picture']
    
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict(include_email=True)
    }), 200

@users_bp.route('/search', methods=['GET'])
def search_users():
    """Search users by username"""
    query = request.args.get('q', '')
    
    if len(query) < 2:
        return jsonify({'message': 'Query must be at least 2 characters'}), 400
    
    users = User.query.filter(User.username.ilike(f'%{query}%')).limit(10).all()
    
    return jsonify([user.to_dict() for user in users]), 200

@users_bp.route('/<user_id>/items', methods=['GET'])
def get_user_items(user_id):
    """Get all items listed by a user"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    items = [item.to_dict() for item in user.items if item.is_active]
    
    return jsonify(items), 200

@users_bp.route('/<user_id>/reviews', methods=['GET'])
def get_user_reviews(user_id):
    """Get reviews for a user"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    reviews = [review.to_dict() for review in user.reviews_received]
    
    return jsonify(reviews), 200
