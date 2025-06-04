from flask import Flask
from flask_mysqldb import MySQL
from flask_cors import CORS
import os
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests
# MySQL configuration (update these with your XAMPP credentials)
app.config['MYSQL_HOST'] = os.getenv("DB_HOST", "localhost")
app.config['MYSQL_USER'] = os.getenv("DB_USER", "root")
app.config['MYSQL_PASSWORD'] = os.getenv("DB_PASSWORD", "")
app.config['MYSQL_DB'] = os.getenv("DB_NAME", "doclogs")
mysql = MySQL(app)
# Import and register the doctor blueprint
from routes.doctor_routes import doctor_bp
app.register_blueprint(doctor_bp, url_prefix='/doctors')
@app.route('/hello', methods=['GET'])
def hello():
    return {"message": "Hello from Flask!"}
@app.route('/', methods=['GET'])
def index():
    return {"message": "Welcome to the Doctor Appointment API"}, 200
if __name__ == '__main__':
    app.run(debug=True, port=5001)