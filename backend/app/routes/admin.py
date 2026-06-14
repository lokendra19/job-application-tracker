from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import UserModel
from app.models.application import ApplicationModel

admin_bp = Blueprint('admin', __name__)

def require_admin(f):
    from functools import wraps
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user_model = UserModel(db)
        user = user_model.find_by_id(user_id)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

@admin_bp.route('/users', methods=['GET'])
@require_admin
def get_users():
    user_model = UserModel(db)
    users = user_model.get_all_users()
    return jsonify({'users': [user_model.serialize(u) for u in users]})

@admin_bp.route('/stats', methods=['GET'])
@require_admin
def get_stats():
    user_model = UserModel(db)
    app_model = ApplicationModel(db)
    total_users = len(user_model.get_all_users())
    return jsonify({
        'total_users': total_users,
    })

@admin_bp.route('/users/<user_id>/deactivate', methods=['PATCH'])
@require_admin
def deactivate_user(user_id):
    user_model = UserModel(db)
    user_model.update_user(user_id, {'is_active': False})
    return jsonify({'message': 'User deactivated'})
