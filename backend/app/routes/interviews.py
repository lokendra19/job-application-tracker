from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.interview import InterviewModel

interviews_bp = Blueprint('interviews', __name__)

def get_model():
    return InterviewModel(db)

@interviews_bp.route('/', methods=['GET'])
@jwt_required()
def get_interviews():
    user_id = get_jwt_identity()
    model = get_model()
    interviews = model.get_by_user(user_id)
    return jsonify({'interviews': [model.serialize(i) for i in interviews]})

@interviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_interview():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data.get('company') or not data.get('date'):
        return jsonify({'error': 'Company and date are required'}), 400
    model = get_model()
    interview_id = model.create(user_id, data)
    interview = model.get_by_id(interview_id, user_id)
    return jsonify({'interview': model.serialize(interview)}), 201

@interviews_bp.route('/<interview_id>', methods=['PUT'])
@jwt_required()
def update_interview(interview_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    model = get_model()
    interview = model.get_by_id(interview_id, user_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    model.update(interview_id, user_id, data)
    updated = model.get_by_id(interview_id, user_id)
    return jsonify({'interview': model.serialize(updated)})

@interviews_bp.route('/<interview_id>', methods=['DELETE'])
@jwt_required()
def delete_interview(interview_id):
    user_id = get_jwt_identity()
    model = get_model()
    interview = model.get_by_id(interview_id, user_id)
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404
    model.delete(interview_id, user_id)
    return jsonify({'message': 'Interview deleted'})
