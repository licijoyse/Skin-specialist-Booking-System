from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import mysql

doctor_bp = Blueprint('doctor', __name__)

# 1. Registration Endpoint
@doctor_bp.route('/register', methods=['POST'])
def register_doctor():
    data = request.get_json()
    doctorId = data.get('doctorId')
    username = data.get('username')
    password = data.get('password')
    if not doctorId or not username or not password:
        return jsonify({"error": "Missing required fields"}), 400
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM doctors WHERE doctorId = %s", (doctorId,))
    if cur.fetchone():
        cur.close()
        return jsonify({"error": "Doctor ID already exists"}), 409

    hashed_password = generate_password_hash(password)
    cur.execute(
        "INSERT INTO doctors (doctorId, username, password) VALUES (%s, %s, %s)",
        (doctorId, username, hashed_password)
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Doctor registered successfully"}), 201

# 2. Login Endpoint
@doctor_bp.route('/login', methods=['POST'])
def login_doctor():
    data = request.get_json()
    doctorId = data.get('doctorId')
    password = data.get('password')
    if not doctorId or not password:
        return jsonify({"error": "Missing required fields"}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM doctors WHERE doctorId = %s", (doctorId,))
    doctor = cur.fetchone()
    cur.close()
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    stored_password = doctor[3]
    if not check_password_hash(stored_password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "doctor": {
            "doctorId": doctor[1],
            "username": doctor[2]
        }
    }), 200

# 3. Add Slot Endpoint
@doctor_bp.route('/add_slot', methods=['POST'])
def add_slot():
    data = request.get_json()
    doctorId = data.get('doctorId')
    date = data.get('date')
    time = data.get('time')
    if not doctorId or not date or not time:
        return jsonify({"error": "Missing required fields"}), 400
#checking slots before inserting for avoiding double booking
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM slots WHERE doctorId = %s AND date = %s AND time = %s",
                (doctorId, date, time))
    if cur.fetchone():
        cur.close()
        return jsonify({"error": "This slot already exists"}), 409

    cur.execute("INSERT INTO slots (doctorId, date, time, status) VALUES (%s, %s, %s, %s)",
                (doctorId, date, time, 'available'))
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Slot added successfully"}), 201

# 4. Retrieve Slots for a Doctor
@doctor_bp.route('/slots/<doctorId>', methods=['GET'])
def get_slots(doctorId):
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, date, time, status FROM slots WHERE doctorId = %s", (doctorId,))
    rows = cur.fetchall()
    cur.close()
    slot_list = [
        {
            "id": row[0],
            "date": row[1].strftime("%Y-%m-%d") if row[1] else None,
            "time": str(row[2]),
            "status": row[3]
        }
        for row in rows
    ]
    return jsonify(slot_list), 200

# 5. Remove Slot Endpoint
@doctor_bp.route('/remove_slot/<int:slotId>', methods=['DELETE'])
def remove_slot(slotId):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM slots WHERE id = %s", (slotId,))
    slot = cur.fetchone()
    if not slot:
        cur.close()
        return jsonify({"error": "Slot not found"}), 404

    cur.execute("DELETE FROM slots WHERE id = %s", (slotId,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Slot removed successfully"}), 200

# 6. Confirm Slot Endpoint
@doctor_bp.route('/confirm_slot/<int:slotId>', methods=['PUT'])
def confirm_slot(slotId):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM slots WHERE id = %s", (slotId,))
    slot = cur.fetchone()
    if not slot:
        cur.close()
        return jsonify({"error": "Slot not found"}), 404

    cur.execute("UPDATE slots SET status = %s WHERE id = %s", ("confirmed", slotId))
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Slot confirmed successfully"}), 200

# 7. Get Doctors by Location
@doctor_bp.route('/by_location/<string:city>', methods=['GET'])
def get_doctors_by_location(city):
    cur = mysql.connection.cursor()
    cur.execute(""" 
        SELECT doctorId, name, specialty, contact, image, rating 
        FROM doctorsprofiles
        WHERE LOWER(city) = LOWER(%s)
    """, (city,))
    doctors = cur.fetchall()
    cur.close()

    doctor_list = [
        {
            "doctorId": row[0],
            "name": row[1],
            "specialty": row[2],
            "contact": row[3],
            "image": row[4],
            "rating": row[5]
        }
        for row in doctors
    ]
    return jsonify(doctor_list), 200
##

@doctor_bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    doctorId = data.get("doctorId")
    username = data.get("username")
    new_password = data.get("newPassword")

    if not doctorId or not username or not new_password:
        return jsonify({"error": "All fields are required"}), 400

    conn = mysql.connection  # Updated to use mysql.connection
    cursor = conn.cursor()

    # Check if doctor ID and username match
    cursor.execute("SELECT * FROM doctors WHERE doctorId=%s AND username=%s", (doctorId, username))
    doctor = cursor.fetchone()

    if not doctor:
        return jsonify({"error": "Doctor ID and Username do not match"}), 404

    hashed_password = generate_password_hash(new_password)
    cursor.execute("UPDATE doctors SET password=%s WHERE doctorId=%s AND username=%s",
                   (hashed_password, doctorId, username))
    conn.commit()  # This commits the changes to the database

    return '', 204  # No content response to avoid any alert message
