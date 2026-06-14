# CareerFlow AI — Setup Guide

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (free tier works)
- Anthropic API key (for AI features)

---

## 1. Clone & Structure

```
job-application-tracker/
├── frontend/     ← React app
├── backend/      ← Flask API
└── SETUP.md
```

---

## 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your values:
#   MONGODB_URI=mongodb+srv://...
#   ANTHROPIC_API_KEY=sk-ant-...
#   SECRET_KEY=your-long-random-secret
#   JWT_SECRET_KEY=another-random-secret
#   FRONTEND_URL=http://localhost:3000

# Run the server
python run.py
# API available at http://localhost:5000
```

---

## 3. Frontend Setup

```bash
cd frontend

# Copy env file
copy .env.example .env
# Edit .env:
#   REACT_APP_API_URL=http://localhost:5000/api

# Install dependencies
npm install

# Start dev server
npm start
# App available at http://localhost:3000
```

---

## 4. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → Create free cluster
2. Under Database Access → Add database user
3. Under Network Access → Allow 0.0.0.0/0 (or your IP)
4. Get connection string → replace in `.env` as `MONGODB_URI`
5. The app will auto-create collections on first use

---

## 5. Anthropic API Key

1. Go to https://console.anthropic.com
2. Create API key
3. Add to backend `.env` as `ANTHROPIC_API_KEY`
4. AI features (Resume Analyzer, Job Match, Cover Letter, Interview Prep) require this

---

## 6. Deploy to Production

### Backend → Render.com

1. Push backend folder to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn run:app --bind 0.0.0.0:$PORT`
6. Add environment variables in Render dashboard
7. Deploy → get URL like `https://careerflow-api.onrender.com`

### Frontend → Vercel

1. Push frontend folder to GitHub
2. Go to https://vercel.com → New Project
3. Import frontend repo
4. Add env variable: `REACT_APP_API_URL=https://careerflow-api.onrender.com/api`
5. Deploy → get URL like `https://careerflow.vercel.app`

---

## 7. First Admin User

After registering the first user, manually set their role to admin in MongoDB:

```javascript
// In MongoDB Atlas Data Explorer or Compass
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 8. Features Summary

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| Application CRUD | ✅ |
| Kanban Board (drag-drop) | ✅ |
| Analytics Dashboard | ✅ |
| AI Resume Analyzer | ✅ |
| AI Job Match Score | ✅ |
| AI Cover Letter Generator | ✅ |
| AI Interview Prep | ✅ |
| Resume Manager | ✅ |
| Interview Scheduler | ✅ |
| Dark / Light Mode | ✅ |
| CSV Export / Import | ✅ |
| PWA Support | ✅ |
| Admin Panel | ✅ |
| Responsive Design | ✅ |

---

## 9. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/applications/ | List applications |
| POST | /api/applications/ | Create application |
| PUT | /api/applications/:id | Update application |
| DELETE | /api/applications/:id | Delete application |
| PATCH | /api/applications/:id/status | Update status |
| GET | /api/applications/export/csv | Export CSV |
| POST | /api/applications/import/csv | Import CSV |
| GET | /api/analytics/overview | Stats overview |
| POST | /api/ai/analyze-resume | Analyze resume PDF |
| POST | /api/ai/job-match | Job match score |
| POST | /api/ai/cover-letter | Generate cover letter |
| POST | /api/ai/interview-prep | Interview questions |
| GET | /api/resumes/ | List resumes |
| POST | /api/resumes/ | Upload resume |
| GET | /api/interviews/ | List interviews |
| POST | /api/interviews/ | Schedule interview |
| GET | /api/admin/users | Admin: list users |
