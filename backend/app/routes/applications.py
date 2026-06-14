from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.application import ApplicationModel
import csv, io
from datetime import datetime

applications_bp = Blueprint('applications', __name__)

def get_model():
    return ApplicationModel(db)

@applications_bp.route('/', methods=['GET'])
@jwt_required()
def get_applications():
    user_id = get_jwt_identity()
    model = get_model()
    status = request.args.get('status')
    job_type = request.args.get('job_type')
    search = request.args.get('search')
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = int(request.args.get('sort_order', -1))
    filters = {}
    if status:
        filters['status'] = status
    if job_type:
        filters['job_type'] = job_type
    apps = model.get_by_user(user_id, filters, sort_by, sort_order, search)
    return jsonify({'applications': [model.serialize(a) for a in apps]})

@applications_bp.route('/', methods=['POST'])
@jwt_required()
def create_application():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data.get('company_name') or not data.get('job_title'):
        return jsonify({'error': 'Company name and job title are required'}), 400
    model = get_model()
    app_id = model.create(user_id, data)
    app = model.get_by_id(app_id, user_id)
    return jsonify({'application': model.serialize(app)}), 201

@applications_bp.route('/<app_id>', methods=['GET'])
@jwt_required()
def get_application(app_id):
    user_id = get_jwt_identity()
    model = get_model()
    app = model.get_by_id(app_id, user_id)
    if not app:
        return jsonify({'error': 'Application not found'}), 404
    return jsonify({'application': model.serialize(app)})

@applications_bp.route('/<app_id>', methods=['PUT'])
@jwt_required()
def update_application(app_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    model = get_model()
    app = model.get_by_id(app_id, user_id)
    if not app:
        return jsonify({'error': 'Application not found'}), 404
    model.update(app_id, user_id, data)
    updated = model.get_by_id(app_id, user_id)
    return jsonify({'application': model.serialize(updated)})

@applications_bp.route('/<app_id>', methods=['DELETE'])
@jwt_required()
def delete_application(app_id):
    user_id = get_jwt_identity()
    model = get_model()
    app = model.get_by_id(app_id, user_id)
    if not app:
        return jsonify({'error': 'Application not found'}), 404
    model.delete(app_id, user_id)
    return jsonify({'message': 'Application deleted'})

@applications_bp.route('/<app_id>/status', methods=['PATCH'])
@jwt_required()
def update_status(app_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    status = data.get('status')
    valid_statuses = ['Wishlist', 'Applied', 'Assessment', 'Interview', 'HR Round', 'Offer', 'Rejected']
    if status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    model = get_model()
    model.update_status(app_id, user_id, status)
    return jsonify({'message': 'Status updated'})

@applications_bp.route('/export/csv', methods=['GET'])
@jwt_required()
def export_csv():
    from flask import Response
    user_id = get_jwt_identity()
    model = get_model()
    apps = model.get_by_user(user_id)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Company', 'Job Title', 'Location', 'Salary', 'Type', 'Status', 'Date', 'URL', 'Notes'])
    for a in apps:
        s = model.serialize(a)
        writer.writerow([s['company_name'], s['job_title'], s['location'], s['salary'],
                         s['job_type'], s['status'], s['application_date'], s['job_url'], s['notes']])

    output.seek(0)
    return Response(output, mimetype='text/csv',
                    headers={'Content-Disposition': 'attachment; filename=applications.csv'})

@applications_bp.route('/import/csv', methods=['POST'])
@jwt_required()
def import_csv():
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    content = file.read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(content))
    model = get_model()
    count = 0
    for row in reader:
        model.create(user_id, {
            'company_name': row.get('Company', ''),
            'job_title': row.get('Job Title', ''),
            'location': row.get('Location', ''),
            'salary': row.get('Salary', ''),
            'job_type': row.get('Type', 'Full-time'),
            'status': row.get('Status', 'Applied'),
            'application_date': row.get('Date', ''),
            'job_url': row.get('URL', ''),
            'notes': row.get('Notes', ''),
        })
        count += 1
    return jsonify({'message': f'Imported {count} applications'})
