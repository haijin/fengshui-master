"""
Local development server
Usage: python server.py
Serves static files + /api/submit-contact endpoint on http://localhost:5000
"""

import json
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from supabase import create_client

load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="")


# ── Static files ─────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


# ── API ───────────────────────────────────────────────────────────────────────

@app.route("/api/submit-contact", methods=["POST"])
def submit_contact():
    payload = request.get_json(silent=True) or {}

    name    = (payload.get("name") or "").strip()
    email   = (payload.get("email") or "").strip()
    phone   = (payload.get("phone") or "").strip() or None
    service = (payload.get("service") or "").strip() or None
    message = (payload.get("message") or "").strip() or None

    if not name or not email:
        return jsonify({"error": "姓名和电子邮箱为必填项"}), 400

    supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_ANON_KEY"])
    supabase.table("contacts").insert({
        "name":    name,
        "email":   email,
        "phone":   phone,
        "service": service,
        "message": message,
    }).execute()

    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
