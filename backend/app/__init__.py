from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient
from config.config import config
import os

bcrypt = Bcrypt()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, default_limits=[])
mongo_client = None
db = None

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    CORS(app, origins=[app.config['FRONTEND_URL'], 'http://localhost:3000'], supports_credentials=True)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)

    global mongo_client, db
    import ssl, certifi
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    mongo_client = MongoClient(
        app.config['MONGODB_URI'],
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=30000,
    )
    db = mongo_client.get_default_database()

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    from app.routes.auth import auth_bp
    from app.routes.applications import applications_bp
    from app.routes.ai_tools import ai_bp
    from app.routes.analytics import analytics_bp
    from app.routes.resumes import resumes_bp
    from app.routes.interviews import interviews_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(resumes_bp, url_prefix='/api/resumes')
    app.register_blueprint(interviews_bp, url_prefix='/api/interviews')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    return app
