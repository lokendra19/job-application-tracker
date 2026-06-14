from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import bcrypt, db
from app.models.user import UserModel
import secrets
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

def get_user_model():
    return UserModel(db)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not all([name, email, password]):
        return jsonify({'error': 'All fields are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    user_model = get_user_model()
    if user_model.find_by_email(email):
        return jsonify({'error': 'Email already registered'}), 409

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user_id = user_model.create_user(name, email, password_hash)

    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    user = user_model.find_by_id(user_id)
    return jsonify({
        'message': 'Registration successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_model.serialize(user)
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not all([email, password]):
        return jsonify({'error': 'Email and password are required'}), 400

    user_model = get_user_model()
    user = user_model.find_by_email(email)

    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.get('is_active', True):
        return jsonify({'error': 'Account is deactivated'}), 403

    access_token = create_access_token(identity=str(user['_id']))
    refresh_token = create_refresh_token(identity=str(user['_id']))

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_model.serialize(user)
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user_model = get_user_model()
    user = user_model.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user_model.serialize(user)})

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    user_model = get_user_model()
    allowed = ['name', 'profile_photo']
    update_data = {k: v for k, v in data.items() if k in allowed}
    user_model.update_user(user_id, update_data)
    user = user_model.find_by_id(user_id)
    return jsonify({'user': user_model.serialize(user)})

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not all([current_password, new_password]):
        return jsonify({'error': 'Both passwords are required'}), 400
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    user_model = get_user_model()
    user = user_model.find_by_id(user_id)

    if not bcrypt.check_password_hash(user['password'], current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401

    password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user_model.update_user(user_id, {'password': password_hash})
    return jsonify({'message': 'Password updated successfully'})

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    user_model = get_user_model()
    user = user_model.find_by_email(email)
    if user:
        token = secrets.token_urlsafe(32)
        expires = datetime.utcnow() + timedelta(hours=1)
        user_model.set_reset_token(email, token, expires)
    # Always return success to prevent email enumeration
    return jsonify({'message': 'If that email exists, a reset link has been sent'})

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({'access_token': access_token})
