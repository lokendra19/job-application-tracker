from datetime import datetime
from bson import ObjectId

STATUSES = ['Wishlist', 'Applied', 'Assessment', 'Interview', 'HR Round', 'Offer', 'Rejected']

class ApplicationModel:
    def __init__(self, db):
        self.collection = db.applications

    def create(self, user_id, data):
        app = {
            'user_id': user_id,
            'company_name': data.get('company_name', ''),
            'job_title': data.get('job_title', ''),
            'location': data.get('location', ''),
            'salary': data.get('salary', ''),
            'job_type': data.get('job_type', 'Full-time'),
            'job_url': data.get('job_url', ''),
            'application_date': data.get('application_date', datetime.utcnow().isoformat()),
            'status': data.get('status', 'Applied'),
            'notes': data.get('notes', ''),
            'resume_used': data.get('resume_used', ''),
            'recruiter_name': data.get('recruiter_name', ''),
            'recruiter_email': data.get('recruiter_email', ''),
            'recruiter_phone': data.get('recruiter_phone', ''),
            'interview_feedback': data.get('interview_feedback', ''),
            'priority': data.get('priority', 'Medium'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = self.collection.insert_one(app)
        return str(result.inserted_id)

    def get_by_user(self, user_id, filters=None, sort_by='created_at', sort_order=-1, search=None):
        query = {'user_id': user_id}
        if filters:
            if filters.get('status'):
                query['status'] = filters['status']
            if filters.get('job_type'):
                query['job_type'] = filters['job_type']
        if search:
            query['$or'] = [
                {'company_name': {'$regex': search, '$options': 'i'}},
                {'job_title': {'$regex': search, '$options': 'i'}},
                {'location': {'$regex': search, '$options': 'i'}},
            ]
        return list(self.collection.find(query).sort(sort_by, sort_order))

    def get_by_id(self, app_id, user_id):
        return self.collection.find_one({'_id': ObjectId(app_id), 'user_id': user_id})

    def update(self, app_id, user_id, data):
        data['updated_at'] = datetime.utcnow()
        self.collection.update_one(
            {'_id': ObjectId(app_id), 'user_id': user_id},
            {'$set': data}
        )

    def delete(self, app_id, user_id):
        self.collection.delete_one({'_id': ObjectId(app_id), 'user_id': user_id})

    def update_status(self, app_id, user_id, status):
        self.collection.update_one(
            {'_id': ObjectId(app_id), 'user_id': user_id},
            {'$set': {'status': status, 'updated_at': datetime.utcnow()}}
        )

    def get_stats(self, user_id):
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {'_id': '$status', 'count': {'$sum': 1}}}
        ]
        return list(self.collection.aggregate(pipeline))

    def get_monthly_counts(self, user_id):
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$group': {
                '_id': {
                    'year': {'$year': '$created_at'},
                    'month': {'$month': '$created_at'}
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id.year': 1, '_id.month': 1}},
            {'$limit': 12}
        ]
        return list(self.collection.aggregate(pipeline))

    def serialize(self, app):
        if not app:
            return None
        return {
            'id': str(app['_id']),
            'user_id': app.get('user_id'),
            'company_name': app.get('company_name'),
            'job_title': app.get('job_title'),
            'location': app.get('location'),
            'salary': app.get('salary'),
            'job_type': app.get('job_type'),
            'job_url': app.get('job_url'),
            'application_date': app.get('application_date'),
            'status': app.get('status'),
            'notes': app.get('notes'),
            'resume_used': app.get('resume_used'),
            'recruiter_name': app.get('recruiter_name'),
            'recruiter_email': app.get('recruiter_email'),
            'recruiter_phone': app.get('recruiter_phone'),
            'interview_feedback': app.get('interview_feedback'),
            'priority': app.get('priority'),
            'created_at': app.get('created_at', datetime.utcnow()).isoformat(),
            'updated_at': app.get('updated_at', datetime.utcnow()).isoformat(),
        }
