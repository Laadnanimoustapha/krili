from flask import Blueprint, request, jsonify
from models import db, Wishlist, Item
from auth import token_required

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('', methods=['GET'])
@token_required
def get_wishlist():
    """Get user wishlist"""
    wishlist_items = Wishlist.query.filter_by(user_id=request.user_id).all()
    
    return jsonify([item.to_dict() for item in wishlist_items]), 200

@wishlist_bp.route('', methods=['POST'])
@token_required
def add_to_wishlist():
    """Add item to wishlist"""
    data = request.get_json()
    
    if not data or not data.get('item_id'):
        return jsonify({'message': 'Item ID is required'}), 400
    
    # Check if item exists
    item = Item.query.get(data['item_id'])
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    # Check if already in wishlist
    existing = Wishlist.query.filter_by(user_id=request.user_id, item_id=data['item_id']).first()
    if existing:
        return jsonify({'message': 'Item already in wishlist'}), 409
    
    wishlist = Wishlist(user_id=request.user_id, item_id=data['item_id'])
    
    db.session.add(wishlist)
    db.session.commit()
    
    return jsonify({
        'message': 'Item added to wishlist',
        'wishlist': wishlist.to_dict()
    }), 201

@wishlist_bp.route('/<item_id>', methods=['DELETE'])
@token_required
def remove_from_wishlist(item_id):
    """Remove item from wishlist"""
    wishlist = Wishlist.query.filter_by(user_id=request.user_id, item_id=item_id).first()
    
    if not wishlist:
        return jsonify({'message': 'Item not in wishlist'}), 404
    
    db.session.delete(wishlist)
    db.session.commit()
    
    return jsonify({'message': 'Item removed from wishlist'}), 200
