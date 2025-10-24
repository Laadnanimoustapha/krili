from flask import Blueprint, request, jsonify
from models import db, Item, Category, ItemImage
from auth import token_required
from sqlalchemy import or_

items_bp = Blueprint('items', __name__)

@items_bp.route('', methods=['GET'])
def get_items():
    """Get all items with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    sort_by = request.args.get('sort_by', 'created_at')
    
    query = Item.query.filter_by(is_active=True)
    
    if category:
        query = query.filter_by(category_id=category)
    
    if search:
        query = query.filter(or_(
            Item.title.ilike(f'%{search}%'),
            Item.description.ilike(f'%{search}%')
        ))
    
    # Sorting
    if sort_by == 'price_low':
        query = query.order_by(Item.price_per_day.asc())
    elif sort_by == 'price_high':
        query = query.order_by(Item.price_per_day.desc())
    elif sort_by == 'rating':
        query = query.order_by(Item.rating.desc())
    else:
        query = query.order_by(Item.created_at.desc())
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'items': [item.to_dict(include_owner=True) for item in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page
    }), 200

@items_bp.route('/<item_id>', methods=['GET'])
def get_item(item_id):
    """Get single item details"""
    item = Item.query.get(item_id)
    
    if not item or not item.is_active:
        return jsonify({'message': 'Item not found'}), 404
    
    return jsonify(item.to_dict(include_owner=True)), 200

@items_bp.route('', methods=['POST'])
@token_required
def create_item():
    """Create new item listing"""
    data = request.get_json()
    
    # Validation
    required_fields = ['title', 'description', 'category_id', 'price_per_day', 'location']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check category exists
    category = Category.query.get(data['category_id'])
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    item = Item(
        title=data['title'],
        description=data['description'],
        category_id=data['category_id'],
        owner_id=request.user_id,
        price_per_day=data['price_per_day'],
        price_per_week=data.get('price_per_week'),
        price_per_month=data.get('price_per_month'),
        location=data['location'],
        condition=data.get('condition', 'good')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item created successfully',
        'item': item.to_dict(include_owner=True)
    }), 201

@items_bp.route('/<item_id>', methods=['PUT'])
@token_required
def update_item(item_id):
    """Update item listing"""
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    if item.owner_id != request.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update allowed fields
    allowed_fields = ['title', 'description', 'price_per_day', 'price_per_week', 'price_per_month', 'location', 'condition', 'availability_status']
    
    for field in allowed_fields:
        if field in data:
            setattr(item, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Item updated successfully',
        'item': item.to_dict(include_owner=True)
    }), 200

@items_bp.route('/<item_id>', methods=['DELETE'])
@token_required
def delete_item(item_id):
    """Delete item listing"""
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    if item.owner_id != request.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    item.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'}), 200

@items_bp.route('/<item_id>/images', methods=['POST'])
@token_required
def add_item_image(item_id):
    """Add image to item"""
    item = Item.query.get(item_id)
    
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    if item.owner_id != request.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('image_url'):
        return jsonify({'message': 'Image URL is required'}), 400
    
    image = ItemImage(
        item_id=item_id,
        image_url=data['image_url'],
        is_primary=data.get('is_primary', False)
    )
    
    db.session.add(image)
    db.session.commit()
    
    return jsonify({
        'message': 'Image added successfully',
        'image': image.to_dict()
    }), 201

@items_bp.route('/featured', methods=['GET'])
def get_featured_items():
    """Get featured items"""
    items = Item.query.filter_by(is_featured=True, is_active=True).limit(8).all()
    
    return jsonify([item.to_dict(include_owner=True) for item in items]), 200
