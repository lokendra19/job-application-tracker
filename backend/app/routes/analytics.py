from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.application import ApplicationModel
from app.models.interview import InterviewModel
from collections import defaultdict
import calendar
from datetime import datetime

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    user_id = get_jwt_identity()
    app_model = ApplicationModel(db)

    stats_raw = app_model.get_stats(user_id)
    stats = defaultdict(int)
    for item in stats_raw:
        stats[item['_id']] = item['count']

    total = sum(stats.values())
    offers = stats.get('Offer', 0)
    interviews = stats.get('Interview', 0) + stats.get('HR Round', 0)
    rejections = stats.get('Rejected', 0)
    success_rate = round((offers / total * 100), 1) if total > 0 else 0

    monthly_raw = app_model.get_monthly_counts(user_id)
    monthly = []
    for item in monthly_raw:
        month_name = calendar.month_abbr[item['_id']['month']]
        monthly.append({'month': f"{month_name} {item['_id']['year']}", 'count': item['count']})

    interview_model = InterviewModel(db)
    upcoming = [i for i in interview_model.get_by_user(user_id)
                if i.get('date') and i['date'] >= datetime.utcnow().date().isoformat()]

    return jsonify({
        'total_applications': total,
        'interviews_scheduled': interviews,
        'rejections': rejections,
        'offers': offers,
        'success_rate': success_rate,
        'status_distribution': dict(stats),
        'monthly_applications': monthly,
        'upcoming_interviews': len(upcoming),
    })

@analytics_bp.route('/company-insights', methods=['GET'])
@jwt_required()
def company_insights():
    user_id = get_jwt_identity()
    app_model = ApplicationModel(db)
    apps = app_model.get_by_user(user_id)

    company_map = defaultdict(lambda: {'count': 0, 'statuses': []})
    for a in apps:
        name = a.get('company_name', 'Unknown')
        company_map[name]['count'] += 1
        company_map[name]['statuses'].append(a.get('status'))

    top_companies = sorted(company_map.items(), key=lambda x: x[1]['count'], reverse=True)[:10]
    result = [{'company': c, 'count': d['count'], 'statuses': d['statuses']} for c, d in top_companies]

    return jsonify({'top_companies': result})

@analytics_bp.route('/insights-text', methods=['GET'])
@jwt_required()
def insights_text():
    user_id = get_jwt_identity()
    app_model = ApplicationModel(db)
    apps = app_model.get_by_user(user_id)
    monthly = app_model.get_monthly_counts(user_id)

    insights = []
    stats = defaultdict(int)
    for a in apps:
        stats[a.get('status')] += 1

    total = sum(stats.values())
    if total == 0:
        return jsonify({'insights': ['Start adding applications to see insights!']})

    offer_rate = round(stats.get('Offer', 0) / total * 100, 1)
    interview_rate = round((stats.get('Interview', 0) + stats.get('HR Round', 0)) / total * 100, 1)
    rejection_rate = round(stats.get('Rejected', 0) / total * 100, 1)

    if offer_rate > 10:
        insights.append(f"Your offer rate of {offer_rate}% is excellent — keep up the great work!")
    elif offer_rate > 5:
        insights.append(f"Your offer rate is {offer_rate}% — you're getting good results.")
    else:
        insights.append(f"Your offer rate is {offer_rate}% — consider improving your resume and cover letters.")

    if interview_rate > 30:
        insights.append(f"Great interview conversion rate at {interview_rate}% — your applications are strong.")
    else:
        insights.append(f"Your interview rate is {interview_rate}% — try tailoring applications more to job descriptions.")

    if len(monthly) >= 2:
        last = monthly[-1]['count']
        prev = monthly[-2]['count']
        if prev > 0:
            change = round((last - prev) / prev * 100)
            if change > 0:
                insights.append(f"Applications increased by {change}% this month — momentum is building!")
            else:
                insights.append(f"Applications decreased by {abs(change)}% this month — try to apply more consistently.")

    return jsonify({'insights': insights})
