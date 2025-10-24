from flask import Blueprint, request, jsonify
from models import db, Review, Item, User, Rental
from auth import token_required

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('', methods=['POST'])
@token_required
def create_review():
    """Create a review"""
    data = request.get_json()
    
    # Validation
    required_fields = ['item_id', 'reviewed_user_id', 'rating']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if data['rating'] < 1 or data['rating'] > 5:
        return jsonify({'message': 'Rating must be between 1 and 5'}), 400
    
    # Check if item exists
    item = Item.query.get(data['item_id'])
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    # Check if reviewed user exists
    reviewed_user = User.query.get(data['reviewed_user_id'])
    if not reviewed_user:
        return jsonify({'message': 'User not found'}), 404
    
    review = Review(
        item_id=data['item_id'],
        reviewer_id=request.user_id,
        reviewed_user_id=data['reviewed_user_id'],
        rental_id=data.get('rental_id'),
        rating=data['rating'],
        title=data.get('title'),
        comment=data.get('comment')
    )
    
    db.session.add(review)
    
    # Update item and user ratings
    item.total_reviews += 1
    item.rating = (item.rating * (item.total_reviews - 1) + data['rating']) / item.total_reviews
    
    reviewed_user.total_reviews += 1
    reviewed_user.rating = (reviewed_user.rating * (reviewed_user.total_reviews - 1) + data['rating']) / reviewed_user.total_reviews
    
    db.session.commit()
    
    return jsonify({
        'message': 'Review created successfully',
        'review': review.to_dict()
    }), 201

@reviews_bp.route('/item/<item_id>', methods=['GET'])
def get_item_reviews(item_id):
    """Get reviews for an item"""
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    reviews = Review.query.filter_by(item_id=item_id).all()
    
    return jsonify([review.to_dict() for review in reviews]), 200

@reviews_bp.route('/user/<user_id>', methods=['GET'])
def get_user_reviews(user_id):
    """Get reviews for a user"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    reviews = Review.query.filter_by(reviewed_user_id=user_id).all()
    
    return jsonify([review.to_dict() for review in reviews]), 200
