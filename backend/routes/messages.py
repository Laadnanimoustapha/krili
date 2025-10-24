from flask import Blueprint, request, jsonify
from models import db, Message, User
from auth import token_required

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('', methods=['POST'])
@token_required
def send_message():
    """Send a message"""
    data = request.get_json()
    
    # Validation
    if not data or not data.get('recipient_id') or not data.get('content'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if recipient exists
    recipient = User.query.get(data['recipient_id'])
    if not recipient:
        return jsonify({'message': 'Recipient not found'}), 404
    
    message = Message(
        sender_id=request.user_id,
        recipient_id=data['recipient_id'],
        subject=data.get('subject'),
        content=data['content']
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent successfully',
        'data': message.to_dict()
    }), 201

@messages_bp.route('/inbox', methods=['GET'])
@token_required
def get_inbox():
    """Get user inbox"""
    messages = Message.query.filter_by(recipient_id=request.user_id).order_by(Message.created_at.desc()).all()
    
    return jsonify([msg.to_dict() for msg in messages]), 200

@messages_bp.route('/sent', methods=['GET'])
@token_required
def get_sent():
    """Get sent messages"""
    messages = Message.query.filter_by(sender_id=request.user_id).order_by(Message.created_at.desc()).all()
    
    return jsonify([msg.to_dict() for msg in messages]), 200

@messages_bp.route('/<message_id>/read', methods=['PUT'])
@token_required
def mark_as_read(message_id):
    """Mark message as read"""
    message = Message.query.get(message_id)
    
    if not message:
        return jsonify({'message': 'Message not found'}), 404
    
    if message.recipient_id != request.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    message.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Message marked as read'}), 200

@messages_bp.route('/<message_id>', methods=['DELETE'])
@token_required
def delete_message(message_id):
    """Delete a message"""
    message = Message.query.get(message_id)
    
    if not message:
        return jsonify({'message': 'Message not found'}), 404
    
    if message.recipient_id != request.user_id and message.sender_id != request.user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({'message': 'Message deleted'}), 200
