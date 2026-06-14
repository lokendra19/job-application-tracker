from datetime import datetime
from bson import ObjectId

class ResumeModel:
    def __init__(self, db):
        self.collection = db.resumes

    def create(self, user_id, name, file_url, ats_score=None):
        resume = {
            'user_id': user_id,
            'name': name,
            'file_url': file_url,
            'ats_score': ats_score,
            'is_active': False,
            'created_at': datetime.utcnow(),
        }
        result = self.collection.insert_one(resume)
        return str(result.inserted_id)

    def get_by_user(self, user_id):
        return list(self.collection.find({'user_id': user_id}).sort('created_at', -1))

    def get_by_id(self, resume_id, user_id):
        return self.collection.find_one({'_id': ObjectId(resume_id), 'user_id': user_id})

    def delete(self, resume_id, user_id):
        self.collection.delete_one({'_id': ObjectId(resume_id), 'user_id': user_id})

    def set_active(self, resume_id, user_id):
        self.collection.update_many({'user_id': user_id}, {'$set': {'is_active': False}})
        self.collection.update_one(
            {'_id': ObjectId(resume_id), 'user_id': user_id},
            {'$set': {'is_active': True}}
        )

    def update_score(self, resume_id, ats_score):
        self.collection.update_one(
            {'_id': ObjectId(resume_id)},
            {'$set': {'ats_score': ats_score}}
        )

    def serialize(self, resume):
        if not resume:
            return None
        return {
            'id': str(resume['_id']),
            'user_id': resume.get('user_id'),
            'name': resume.get('name'),
            'file_url': resume.get('file_url'),
            'ats_score': resume.get('ats_score'),
            'is_active': resume.get('is_active', False),
            'created_at': resume.get('created_at', datetime.utcnow()).isoformat(),
        }
