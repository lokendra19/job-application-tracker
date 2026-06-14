from datetime import datetime
from bson import ObjectId

class UserModel:
    def __init__(self, db):
        self.collection = db.users

    def create_user(self, name, email, password_hash):
        user = {
            'name': name,
            'email': email,
            'password': password_hash,
            'profile_photo': None,
            'resume_url': None,
            'role': 'user',
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'reset_token': None,
            'reset_token_expires': None,
        }
        result = self.collection.insert_one(user)
        return str(result.inserted_id)

    def find_by_email(self, email):
        return self.collection.find_one({'email': email})

    def find_by_id(self, user_id):
        return self.collection.find_one({'_id': ObjectId(user_id)})

    def update_user(self, user_id, data):
        data['updated_at'] = datetime.utcnow()
        self.collection.update_one({'_id': ObjectId(user_id)}, {'$set': data})

    def set_reset_token(self, email, token, expires):
        self.collection.update_one(
            {'email': email},
            {'$set': {'reset_token': token, 'reset_token_expires': expires}}
        )

    def find_by_reset_token(self, token):
        return self.collection.find_one({'reset_token': token})

    def get_all_users(self):
        return list(self.collection.find({'role': 'user'}, {'password': 0}))

    def serialize(self, user):
        if not user:
            return None
        return {
            'id': str(user['_id']),
            'name': user.get('name'),
            'email': user.get('email'),
            'profile_photo': user.get('profile_photo'),
            'resume_url': user.get('resume_url'),
            'role': user.get('role', 'user'),
            'created_at': user.get('created_at', datetime.utcnow()).isoformat(),
        }
