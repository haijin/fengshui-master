"""
Vercel Serverless Function — Contact Form → Supabase (direct REST API)
POST /api/submit-contact
"""

import json
import os
import urllib.request
import urllib.error
import urllib.parse
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):

    # ------------------------------------------------------------------ CORS
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    # ------------------------------------------------------------------ POST
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            payload = json.loads(body or "{}")

            name    = (payload.get("name") or "").strip()
            email   = (payload.get("email") or "").strip()
            phone   = (payload.get("phone") or "").strip() or None
            service = (payload.get("service") or "").strip() or None
            message = (payload.get("message") or "").strip() or None

            if not name or not email:
                self._respond(400, {"error": "姓名和电子邮箱为必填项"})
                return

            # Verify reCAPTCHA token
            secret_key = os.environ.get("RECAPTCHA_SECRET_KEY", "")
            if secret_key and secret_key != "YOUR_RECAPTCHA_SECRET_KEY":
                token = (payload.get("recaptcha_token") or "").strip()
                if not token:
                    self._respond(400, {"error": "reCAPTCHA 验证失败"})
                    return
                verify_data = urllib.parse.urlencode({
                    "secret": secret_key,
                    "response": token,
                }).encode()
                verify_req = urllib.request.Request(
                    "https://www.google.com/recaptcha/api/siteverify",
                    data=verify_data,
                    method="POST",
                )
                with urllib.request.urlopen(verify_req) as vr:
                    result = json.loads(vr.read())
                if not result.get("success") or result.get("score", 0) < 0.5:
                    self._respond(400, {"error": "reCAPTCHA 验证失败，请重试"})
                    return

            supabase_url = os.environ["SUPABASE_URL"]
            api_key      = os.environ["SUPABASE_ANON_KEY"]

            row = {"name": name, "email": email,
                   "phone": phone, "service": service, "message": message}

            req = urllib.request.Request(
                url=f"{supabase_url}/rest/v1/contacts",
                data=json.dumps(row).encode(),
                headers={
                    "apikey":        api_key,
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type":  "application/json",
                    "Prefer":        "return=minimal",
                },
                method="POST",
            )
            with urllib.request.urlopen(req) as resp:
                resp.read()

            self._respond(200, {"success": True})

        except urllib.error.HTTPError as exc:
            body = exc.read().decode()
            print(f"[submit-contact] Supabase HTTP {exc.code}: {body}")
            self._respond(500, {"error": f"Supabase error {exc.code}: {body}"})
        except Exception as exc:
            print(f"[submit-contact] error: {exc}")
            self._respond(500, {"error": str(exc)})

    # ------------------------------------------------------------------ util
    def _respond(self, status: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass
