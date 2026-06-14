from datetime import datetime
from bson import ObjectId

class InterviewModel:
    def __init__(self, db):
        self.collection = db.interviews

    def create(self, user_id, data):
        interview = {
            'user_id': user_id,
            'application_id': data.get('application_id'),
            'company': data.get('company', ''),
            'job_title': data.get('job_title', ''),
            'date': data.get('date'),
            'time': data.get('time'),
            'type': data.get('type', 'Video'),
            'meeting_link': data.get('meeting_link', ''),
            'notes': data.get('notes', ''),
            'reminder_sent': False,
            'created_at': datetime.utcnow(),
        }
        result = self.collection.insert_one(interview)
        return str(result.inserted_id)

    def get_by_user(self, user_id):
        return list(self.collection.find({'user_id': user_id}).sort('date', 1))

    def get_by_id(self, interview_id, user_id):
        return self.collection.find_one({'_id': ObjectId(interview_id), 'user_id': user_id})

    def update(self, interview_id, user_id, data):
        self.collection.update_one(
            {'_id': ObjectId(interview_id), 'user_id': user_id},
            {'$set': data}
        )

    def delete(self, interview_id, user_id):
        self.collection.delete_one({'_id': ObjectId(interview_id), 'user_id': user_id})

    def serialize(self, interview):
        if not interview:
            return None
        return {
            'id': str(interview['_id']),
            'user_id': interview.get('user_id'),
            'application_id': interview.get('application_id'),
            'company': interview.get('company'),
            'job_title': interview.get('job_title'),
            'date': interview.get('date'),
            'time': interview.get('time'),
            'type': interview.get('type'),
            'meeting_link': interview.get('meeting_link'),
            'notes': interview.get('notes'),
            'reminder_sent': interview.get('reminder_sent', False),
            'created_at': interview.get('created_at', datetime.utcnow()).isoformat(),
        }
