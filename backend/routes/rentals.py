from flask import Blueprint, request, jsonify
from models import db, Rental, Item
from auth import token_required
from datetime import datetime

rentals_bp = Blueprint('rentals', __name__)

@rentals_bp.route('', methods=['POST'])
@token_required
def create_rental():
    """Create new rental booking"""
    data = request.get_json()
    
    # Validation
    required_fields = ['item_id', 'start_date', 'end_date']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    item = Item.query.get(data['item_id'])
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    if item.owner_id == request.user_id:
        return jsonify({'message': 'Cannot rent your own item'}), 400
    
    # Parse dates
    try:
        start_date = datetime.fromisoformat(data['start_date'])
        end_date = datetime.fromisoformat(data['end_date'])
    except ValueError:
        return jsonify({'message': 'Invalid date format'}), 400
    
    if start_date >= end_date:
        return jsonify({'message': 'End date must be after start date'}), 400
    
    # Calculate rental duration and price
    rental_duration_days = (end_date - start_date).days
    total_price = rental_duration_days * item.price_per_day
    
    rental = Rental(
        item_id=data['item_id'],
        renter_id=request.user_id,
        start_date=start_date,
        end_date=end_date,
        rental_duration_days=rental_duration_days,
        total_price=total_price,
        pickup_location=data.get('pickup_location'),
        return_location=data.get('return_location'),
        notes=data.get('notes')
    )
    
    db.session.add(rental)
    db.session.commit()
    
    return jsonify({
        'message': 'Rental created successfully',
        'rental': rental.to_dict(include_item=True)
    }), 201

@rentals_bp.route('/<rental_id>', methods=['GET'])
@token_required
def get_rental(rental_id):
    """Get rental details"""
    rental = Rental.query.get(rental_id)
    
    if not rental:
        return jsonify({'message': 'Rental not found'}), 404
    
    # Check authorization
    if rental.renter_id != request.user_id and rental.item.owner_id != request.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    return jsonify(rental.to_dict(include_item=True, include_renter=True)), 200

@rentals_bp.route('/user/rentals', methods=['GET'])
@token_required
def get_user_rentals():
    """Get all rentals for current user"""
    status = request.args.get('status')
    
    query = Rental.query.filter_by(renter_id=request.user_id)
    
    if status:
        query = query.filter_by(status=status)
    
    rentals = query.all()
    
    return jsonify([rental.to_dict(include_item=True) for rental in rentals]), 200

@rentals_bp.route('/owner/rentals', methods=['GET'])
@token_required
def get_owner_rentals():
    """Get all rentals for items owned by current user"""
    status = request.args.get('status')
    
    items = Item.query.filter_by(owner_id=request.user_id).all()
    item_ids = [item.id for item in items]
    
    query = Rental.query.filter(Rental.item_id.in_(item_ids))
    
    if status:
        query = query.filter_by(status=status)
    
    rentals = query.all()
    
    return jsonify([rental.to_dict(include_item=True, include_renter=True) for rental in rentals]), 200

@rentals_bp.route('/<rental_id>/status', methods=['PUT'])
@token_required
def update_rental_status(rental_id):
    """Update rental status"""
    rental = Rental.query.get(rental_id)
    
    if not rental:
        return jsonify({'message': 'Rental not found'}), 404
    
    # Check authorization - only owner can update status
    if rental.item.owner_id != request.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('status'):
        return jsonify({'message': 'Status is required'}), 400
    
    valid_statuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({'message': 'Invalid status'}), 400
    
    rental.status = data['status']
    db.session.commit()
    
    return jsonify({
        'message': 'Rental status updated',
        'rental': rental.to_dict(include_item=True)
    }), 200

@rentals_bp.route('/<rental_id>/cancel', methods=['POST'])
@token_required
def cancel_rental(rental_id):
    """Cancel rental"""
    rental = Rental.query.get(rental_id)
    
    if not rental:
        return jsonify({'message': 'Rental not found'}), 404
    
    if rental.renter_id != request.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    if rental.status in ['completed', 'cancelled']:
        return jsonify({'message': 'Cannot cancel this rental'}), 400
    
    rental.status = 'cancelled'
    db.session.commit()
    
    return jsonify({'message': 'Rental cancelled successfully'}), 200
