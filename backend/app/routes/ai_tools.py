from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
import os, io

ai_bp = Blueprint('ai', __name__)

def get_anthropic_client():
    import anthropic
    return anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY', ''))

def extract_text_from_pdf(file_bytes):
    import pdfplumber
    text = ''
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ''
    return text

@ai_bp.route('/analyze-resume', methods=['POST'])
@jwt_required()
def analyze_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400

    file = request.files['resume']
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported'}), 400

    resume_text = extract_text_from_pdf(file.read())

    client = get_anthropic_client()
    prompt = f"""Analyze the following resume and provide:
1. ATS Score (0-100) based on formatting, keywords, clarity
2. Key skills found (list)
3. Missing critical skills for modern job applications (list)
4. Resume strengths (list)
5. Specific improvement suggestions (list)

Resume text:
{resume_text[:4000]}

Respond in JSON format:
{{
  "ats_score": <number>,
  "skills_found": [<list of skills>],
  "missing_skills": [<list>],
  "strengths": [<list>],
  "suggestions": [<list>]
}}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    import json, re
    raw = message.content[0].text
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if json_match:
        result = json.loads(json_match.group())
    else:
        result = {"ats_score": 0, "skills_found": [], "missing_skills": [], "strengths": [], "suggestions": [raw]}

    return jsonify(result)

@ai_bp.route('/job-match', methods=['POST'])
@jwt_required()
def job_match():
    data = request.get_json()
    resume_text = data.get('resume_text', '')
    job_description = data.get('job_description', '')

    if not resume_text or not job_description:
        return jsonify({'error': 'Resume text and job description are required'}), 400

    client = get_anthropic_client()
    prompt = f"""Compare this resume against the job description and provide a match analysis.

Resume:
{resume_text[:2000]}

Job Description:
{job_description[:2000]}

Respond in JSON:
{{
  "match_percentage": <0-100>,
  "matching_skills": [<list>],
  "missing_skills": [<list>],
  "recommendations": [<list of improvements>],
  "summary": "<brief summary>"
}}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    import json, re
    raw = message.content[0].text
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if json_match:
        result = json.loads(json_match.group())
    else:
        result = {"match_percentage": 0, "matching_skills": [], "missing_skills": [], "recommendations": [], "summary": raw}

    return jsonify(result)

@ai_bp.route('/cover-letter', methods=['POST'])
@jwt_required()
def generate_cover_letter():
    data = request.get_json()
    company_name = data.get('company_name', '')
    job_role = data.get('job_role', '')
    experience = data.get('experience', '')
    skills = data.get('skills', '')
    user_name = data.get('user_name', '')

    if not all([company_name, job_role]):
        return jsonify({'error': 'Company name and job role are required'}), 400

    client = get_anthropic_client()
    prompt = f"""Write a professional cover letter for:
- Applicant: {user_name}
- Company: {company_name}
- Position: {job_role}
- Experience: {experience}
- Key Skills: {skills}

Write a compelling, personalized cover letter (3-4 paragraphs). Be professional, enthusiastic, and specific."""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    return jsonify({'cover_letter': message.content[0].text})

@ai_bp.route('/interview-prep', methods=['POST'])
@jwt_required()
def interview_prep():
    data = request.get_json()
    job_role = data.get('job_role', '')
    experience_level = data.get('experience_level', 'Mid-level')
    company = data.get('company', '')

    if not job_role:
        return jsonify({'error': 'Job role is required'}), 400

    client = get_anthropic_client()
    prompt = f"""Generate interview questions and suggested answers for:
- Role: {job_role}
- Level: {experience_level}
- Company: {company}

Provide 3 questions each for Technical, HR, and Behavioral categories.

Respond in JSON:
{{
  "technical": [{{"question": "...", "answer": "..."}}],
  "hr": [{{"question": "...", "answer": "..."}}],
  "behavioral": [{{"question": "...", "answer": "..."}}]
}}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    import json, re
    raw = message.content[0].text
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if json_match:
        result = json.loads(json_match.group())
    else:
        result = {"technical": [], "hr": [], "behavioral": [], "raw": raw}

    return jsonify(result)
