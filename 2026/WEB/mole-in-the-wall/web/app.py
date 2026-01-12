from flask import Flask, render_template, request, redirect, send_from_directory, jsonify, make_response
import os
import jwt
import json

app = Flask(__name__)
app.secret_key = os.urandom(16)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "config", "security.json")

with open(CONFIG_PATH) as f:
    SECURITY_CONFIG = json.load(f)

os.environ["JWT_SECRET"] = "g0ld3n_fr3ddy_w1ll_a1ways_b3_w@tch1ng_y0u"
JWT_SECRET = "g0ld3n_fr3ddy_w1ll_a1ways_b3_w@tch1ng_y0u"
JWT_ALG = SECURITY_CONFIG["jwt"]["algorithm"]
REQUIRED_CLAIMS = SECURITY_CONFIG["jwt"]["required_claims"]
JWT_ISSUER = SECURITY_CONFIG.get("issuer")
JWT_AUDIENCE = SECURITY_CONFIG.get("audience")

API_KEY = "t#at_purpl3_guy"
FLAG = "RUSEC{m1cro$oft_n3ver_mad3_g00d_aut0m4t1on}"
EXPORT_FILENAME = "myscripts.zip"

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET not set")

@app.route("/", methods=["GET"])
def index():
    return render_template("home.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        token = request.form.get("token", "")
        claims = verify_jwt(token)
        if not claims or any(claims.get(k) != v for k, v in REQUIRED_CLAIMS.items()):
            error = "Unauthorized personnel. Security configuration required."
        else:
            return send_from_directory("static", EXPORT_FILENAME, as_attachment=True)
    resp = make_response(render_template("login.html", error=error))
    resp.headers["X-Auth-Notice"] = "Night shift security tokens only"
    resp.headers["X-Config-Note"] = "legacy config mounted from /debug"
    return resp

@app.route("/debug/config/<path:name>")
def debug_config(name):
    if name == "security.json":
        return jsonify({
            "issuer": JWT_ISSUER,
            "audience": JWT_AUDIENCE,
            "notes": "JWT secret was scooped at runtime - Mike Schmidt",
            "jwt": {
                "algorithm": JWT_ALG,
                "required_claims": REQUIRED_CLAIMS
            }
        })
    if name == ".env":
        return jsonify({
            "JWT_SECRET": os.environ.get("JWT_SECRET")
        })
    
    return send_from_directory(os.path.join(BASE_DIR, "config"), name)

def verify_jwt(token):
    try:
        return jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALG],
            options={"require": list(REQUIRED_CLAIMS.keys())}
        )
    except jwt.InvalidTokenError:
        return None

@app.route("/static/css/style.css")
def style_css():
    css = """
    body {
        background-color: #fafafa;
    }
    """
    resp = make_response(css)
    resp.headers["Content-Type"] = "text/css"
    return resp

@app.route("/download")
def download():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return redirect("/login")
    token = auth.split(" ", 1)[1]
    claims = verify_jwt(token)
    if not claims or any(claims.get(k) != v for k, v in REQUIRED_CLAIMS.items()):
        return redirect("/login")
    return send_from_directory("static", EXPORT_FILENAME, as_attachment=True)

@app.route("/api/run-flow", methods=["POST"])
def run_flow():
    raw = request.data.decode("utf-8", errors="ignore")
    try:
        data = json.loads(raw)
        user_input = data.get("input", "")
    except Exception:
        user_input = ""
    if user_input == API_KEY:
        return jsonify({"result": FLAG})
    return jsonify({"error": "invalid input"}), 403

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
