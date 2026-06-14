from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.resume import ResumeModel
import os, uuid

resumes_bp = Blueprint('resumes', __name__)
UPLOAD_FOLDER = 'uploads/resumes'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_model():
    return ResumeModel(db)

@resumes_bp.route('/', methods=['GET'])
@jwt_required()
def get_resumes():
    user_id = get_jwt_identity()
    model = get_model()
    resumes = model.get_by_user(user_id)
    return jsonify({'resumes': [model.serialize(r) for r in resumes]})

@resumes_bp.route('/', methods=['POST'])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()
    if 'resume' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['resume']
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported'}), 400

    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    model = get_model()
    resume_name = request.form.get('name', file.filename)
    resume_id = model.create(user_id, resume_name, f'/api/resumes/file/{filename}')
    resume = model.get_by_id(resume_id, user_id)
    return jsonify({'resume': model.serialize(resume)}), 201

@resumes_bp.route('/file/<filename>', methods=['GET'])
@jwt_required()
def get_resume_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@resumes_bp.route('/<resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    user_id = get_jwt_identity()
    model = get_model()
    resume = model.get_by_id(resume_id, user_id)
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    file_url = resume.get('file_url', '')
    filename = file_url.split('/')[-1]
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    model.delete(resume_id, user_id)
    return jsonify({'message': 'Resume deleted'})

@resumes_bp.route('/<resume_id>/activate', methods=['PATCH'])
@jwt_required()
def activate_resume(resume_id):
    user_id = get_jwt_identity()
    model = get_model()
    resume = model.get_by_id(resume_id, user_id)
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    model.set_active(resume_id, user_id)
    return jsonify({'message': 'Resume set as active'})
