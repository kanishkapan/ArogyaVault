from flask import Flask, request, jsonify, g
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import google.generativeai as genai
import os
import jwt
from functools import wraps

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# MongoDB Connection
MONGO_URI = "mongodb+srv://tannisa:YXmXxB8C19yRxAFr@arogya-vault.3bg8o.mongodb.net/arogya-vault"
client = MongoClient(MONGO_URI)
db = client["arogya-vault"]
collection = db["healthrecords"]
collection2=db["medicalleaves"]
users_collection = db["users"]
appointments_collection = db["appointments"]

# Load API Key from .env
from dotenv import load_dotenv
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API")
JWT_SECRET = os.getenv("JWT_SECRET")  # Add this to your .env file

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API key is missing! Set it in the .env file.")

if not JWT_SECRET:
    raise ValueError("❌ JWT_SECRET is missing! Set it in the .env file.")

# Configure Gemini AI
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")

# Auth middleware function with updated token structure
def auth_middleware(roles=[]):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            print("---- Auth Middleware Debug ----")
            print("All cookies:", request.cookies)
            token = request.cookies.get('jwt')
            print("JWT cookie present:", token is not None)
            
            if not token:
                # Also check Authorization header as fallback
                auth_header = request.headers.get('Authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                    print("Using token from Authorization header")
                else:
                    print("No JWT token found in cookies or Authorization header")
                    return jsonify({"message": "Unauthorized"}), 401
                
            try:
                # Decode the JWT token - ensure proper options
                decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"require": ["exp"]})
                print(f"JWT decoded successfully. User ID: {decoded.get('id')}, Role: {decoded.get('role')}")

                # Store user in Flask's g object - note we're mapping 'id' to '_id'
                g.user = {
                    "_id": decoded.get('id'),  # Map 'id' from token to '_id' in g.user
                    "role": decoded.get('role')
                }
                
                # Check if user has required role
                if roles and g.user.get('role') not in roles:
                    print(f"Access denied. User role: {g.user.get('role')}, Required roles: {roles}")
                    return jsonify({"message": "Access Denied"}), 403
                    
                return f(*args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                print("Token expired")
                return jsonify({"message": "Token expired"}), 401
            except jwt.InvalidTokenError as e:
                print(f"Invalid token: {str(e)}")
                return jsonify({"message": f"Invalid token: {str(e)}"}), 403
            except Exception as e:
                print(f"Error: {str(e)}")
                return jsonify({"message": f"Internal Server Error: {str(e)}"}), 500
                
        return decorated_function
    return decorator

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            print("---- Auth Middleware Debug ----")
            print("All cookies:", request.cookies)
            token = request.cookies.get('jwt')
            print("JWT cookie present:", token is not None)
            
            if not token:
                # Also check Authorization header as fallback
                auth_header = request.headers.get('Authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                    print("Using token from Authorization header")
                else:
                    print("No JWT token found in cookies or Authorization header")
                    return jsonify({"message": "Unauthorized"}), 401
                
            try:
                # Decode the JWT token - matched to Express structure
                decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                print(f"JWT decoded successfully. User ID: {decoded.get('id')}, Role: {decoded.get('role')}")
                
                # Store user in Flask's g object - note we're mapping 'id' to '_id'
                g.user = {
                    "_id": decoded.get('id'),  # Map 'id' from token to '_id' in g.user
                    "role": decoded.get('role')
                }
                
                # Check if user has required role
                if roles and g.user.get('role') not in roles:
                    print(f"Access denied. User role: {g.user.get('role')}, Required roles: {roles}")
                    return jsonify({"message": "Access Denied"}), 403
                    
                return f(*args, **kwargs)
                
            except jwt.ExpiredSignatureError:
                print("Token expired")
                return jsonify({"message": "Token expired"}), 401
            except jwt.InvalidTokenError as e:
                print(f"Invalid token: {str(e)}")
                return jsonify({"message": f"Invalid token: {str(e)}"}), 403
            except Exception as e:
                print(f"Error: {str(e)}")
                return jsonify({"message": f"Internal Server Error: {str(e)}"}), 500
                
        return decorated_function
    return decorator

# Helper function to convert MongoDB ObjectId to string
def convert_objectid(data):
    """Recursively converts ObjectId fields to strings in a dictionary or list"""
    if isinstance(data, list):
        return [convert_objectid(doc) for doc in data]
    if isinstance(data, dict):
        return {k: str(v) if isinstance(v, ObjectId) else v for k, v in data.items()}
    return data

# Debug endpoint to test authentication
@app.route("/auth-test", methods=["GET"])
@auth_middleware([])  # No role restriction for testing
def auth_test():
    """Simple endpoint to test if authentication works"""
    return jsonify({
        "message": "Authentication successful!",
        "user_id": g.user.get('_id'),
        "role": g.user.get('role')
    })

@app.route("/disease_prediction", methods=["POST"])
def disease_prediction():
    # No auth required for this endpoint
    try:
        data = request.json
        symptoms = data.get("symptoms")

        if not symptoms:
            return jsonify({"error": "Symptoms are required"}), 400

        # Convert symptoms list to a formatted string
        symptoms_text = ", ".join(symptoms)

        # Prepare Gemini AI prompt
        gemini_prompt = f"""
        A patient is experiencing the following symptoms: {symptoms_text}.
        Based on these symptoms, predict the most likely disease or condition.
        Provide a detailed explanation along with possible treatments.
        """

        # Generate response using Gemini AI
        response = model.generate_content(gemini_prompt)

        final_prediction = response.text if response and response.text else "Gemini AI could not generate a prediction."

        return jsonify({"status": "success", "prediction": final_prediction})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@app.route("/ask_question", methods=["POST"])
@auth_middleware(["student"])
def ask_question():
    try:
        data = request.json
        user_question = data.get("question")
        
        # Get student ID from the JWT token and convert to ObjectId
        student_id = g.user.get('_id')
        print(f"Using student ID from token: {student_id}")

        if not user_question:
            return jsonify({"error": "Question is required"}), 400

        # Fetch medical records - convert string ID to ObjectId
        records = list(collection.find({"studentId": ObjectId(student_id)}))
        if not records:
            return jsonify({"error": "No medical history found for this student"}), 404

        formatted_records = convert_objectid(records)

        # Prepare Gemini AI prompt
        gemini_prompt = f"""
        The following is the patient's medical history:
        {formatted_records}
        
        Based on this data, answer the following question:
        "{user_question}"
        """

        # Generate response using Gemini AI
        response = model.generate_content(gemini_prompt)

        final_answer = response.text if response and response.text else "Gemini AI could not generate an answer."

        return jsonify({"status": "success", "answer": final_answer})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/leaverelated", methods=["POST"])
@auth_middleware(["student"])
def leave_related_question():
    try:
        data = request.json
        user_question = data.get("question")
        
        # Get student ID from the JWT token and convert to ObjectId
        student_id = g.user.get('_id')
        print(f"Using student ID from token: {student_id}")

        if not user_question:
            return jsonify({"error": "Question is required"}), 400

        # Fetch leave records - convert string ID to ObjectId
        records = list(collection2.find({"studentId": ObjectId(student_id)}))
        if not records:
            return jsonify({"error": "No leave history found for this student"}), 404

        formatted_records = convert_objectid(records)

        # Prepare Gemini AI prompt
        gemini_prompt = f"""
        The following is the student's leave record history:
        {formatted_records}
        
        Based on this data, answer the following question:
        "{user_question}"
        """

        # Generate response using Gemini AI
        response = model.generate_content(gemini_prompt)

        final_answer = response.text if response and response.text else "Gemini AI could not generate an answer."

        return jsonify({"status": "success", "answer": final_answer})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/doctor_insights", methods=["POST"])
@auth_middleware(["doctor"])
def doctor_insights():
    try:
        data = request.json
        user_question = data.get("question")
        
        # Get doctor ID from the JWT token and convert to ObjectId
        doctor_id = g.user.get('_id')
        print(f"Using doctor ID from token: {doctor_id}")

        if not user_question:
            return jsonify({"error": "Question is required"}), 400

        # Fetch doctor details - convert string ID to ObjectId
        doctor = users_collection.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404

        # Fetch doctor's upcoming appointments - convert string ID to ObjectId
        appointments = list(appointments_collection.find({"doctorId": ObjectId(doctor_id)}))

        # Fetch student names for each appointment
        enriched_appointments = []
        for appointment in appointments:
            student = users_collection.find_one({"_id": ObjectId(appointment["studentId"])}, {"name": 1})
            student_name = student["name"] if student else "Unknown Student"
            appointment["studentName"] = student_name
            enriched_appointments.append(appointment)

        # Fetch all health records of patients treated by the doctor - convert string ID to ObjectId
        health_records = list(db["healthrecords"].find({"doctorId": ObjectId(doctor_id)}))

        # Fetch student names for each health record
        enriched_health_records = []
        for record in health_records:
            student = users_collection.find_one({"_id": ObjectId(record["studentId"])}, {"name": 1})
            student_name = student["name"] if student else "Unknown Patient"
            record["patientName"] = student_name
            enriched_health_records.append(record)

        # Convert MongoDB documents to JSON serializable format
        formatted_appointments = convert_objectid(enriched_appointments)
        formatted_health_records = convert_objectid(enriched_health_records)

        # Prepare prompt for Gemini AI
        gemini_prompt = f"""
        You are a doctor. Here is your information:

        Your Specialization: {doctor.get("specialization", "N/A")}
        Your Contact: {doctor.get("email")}, {doctor.get("phone")}

        Your Upcoming Appointments:
        {formatted_appointments}

        Your Past Treatments (Health Records):
        {formatted_health_records}

        Based on this data, answer the following question:
        "{user_question}"

        Always address the person asking as "You" instead of their name.
        """

        # Generate response using Gemini AI
        response = model.generate_content(gemini_prompt)
        final_answer = response.text if response and response.text else "Gemini AI could not generate an answer."

        return jsonify({"status": "success", "answer": final_answer})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Run Flask app
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)