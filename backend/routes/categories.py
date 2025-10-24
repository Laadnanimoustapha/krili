from flask import Blueprint, request, jsonify
from models import db, Category

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
def get_categories():
    """Get all categories"""
    categories = Category.query.all()
    
    return jsonify([cat.to_dict() for cat in categories]), 200

@categories_bp.route('/<category_id>', methods=['GET'])
def get_category(category_id):
    """Get single category"""
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    return jsonify(category.to_dict()), 200

@categories_bp.route('', methods=['POST'])
def create_category():
    """Create new category (admin only)"""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('slug'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if Category.query.filter_by(slug=data['slug']).first():
        return jsonify({'message': 'Category slug already exists'}), 409
    
    category = Category(
        name=data['name'],
        slug=data['slug'],
        description=data.get('description'),
        icon=data.get('icon')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201
