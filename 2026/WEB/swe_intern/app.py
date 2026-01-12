from flask import Flask, request, render_template, send_file
import jwt
import datetime
import os
# commment for testing
app = Flask(__name__)
app.config['SECRET_KEY'] = 'f0und_my_k3y_1_gu3$$'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    username = request.form.get('username', 'guest')
    payload = {
        'user': username,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30),
        'role': 'standard_user'
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")
    return render_template('index.html', token=token)

@app.route('/view')
def view():

    page = request.args.get('page')
    if not page:
        return "Missing 'page' parameter", 400
    base_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.abspath(os.path.join(base_dir, 'static', page))

    try:
        file_path = os.path.join('static', page)
        return send_file(file_path)
    except Exception:
        return "File not found or access denied.", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)