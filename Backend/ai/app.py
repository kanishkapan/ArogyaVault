from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API key is missing! Set it in the .env file.")

# Configure Gemini AI
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")

# MongoDB Connection
MONGO_URI = "mongodb+srv://tannisa:YXmXxB8C19yRxAFr@arogya-vault.3bg8o.mongodb.net/arogya-vault"
client = MongoClient(MONGO_URI)
db = client["arogya-vault"]
db = client["arogya-vault"]
collection = db["healthrecords"]
collection2=db["medicalleaves"]
users_collection = db["users"]
appointments_collection = db["appointments"]
health_records_collection = db["healthrecords"]
leave_collection = db["medicalleaves"]

# Helper function to fetch user names by ID
def get_user_name(user_id):
    user = users_collection.find_one({"_id": ObjectId(user_id)}, {"name": 1})
    return user["name"] if user else "Unknown"

# Helper function to format MongoDB documents safely
def convert_objectid(data):
    """Recursively converts ObjectId fields to strings in a dictionary or list"""
    if isinstance(data, list):
        return [convert_objectid(doc) for doc in data]
    if isinstance(data, dict):
        return {k: str(v) if isinstance(v, ObjectId) else v for k, v in data.items()}
    return data


# ✅ Fetch Student Health Records (Secure)
@app.route("/disease_prediction", methods=["POST"])
def disease_prediction():
    try:
        data = request.json
        symptoms = data.get("symptoms")

        if not symptoms:
            return jsonify({"error": "Symptoms are required"}), 400

        # Convert symptoms list to a formatted string
        symptoms_text = ", ".join(symptoms)

        # Secure Gemini AI prompt
        gemini_prompt = f"""
        A patient is experiencing the following symptoms: {symptoms_text}.
        Based on these symptoms, predict the most likely disease or condition.
        Provide a detailed explanation along with possible treatments.
        Do not include any technical terms, IDs, or unnecessary database details.
        """

        # Generate response using Gemini AI
        response = model.generate_content(gemini_prompt)
        final_prediction = response.text if response and response.text else "Gemini AI could not generate a prediction."

        return jsonify({"status": "success", "prediction": final_prediction})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# ✅ AI-Powered Medical Record Retrieval (No IDs)
@app.route("/ask_question", methods=["POST"])
def ask_question():
    try:
        data = request.json
        user_question = data.get("question")
        student_id = data.get("studentId")

        if not user_question or not student_id:
            return jsonify({"error": "Question and Student ID are required"}), 400

        # Fetch student name
        student = users_collection.find_one({"_id": ObjectId(student_id)}, {"name": 1})
        student_name = student["name"] if student else "Unknown Patient"

        # Fetch medical records
        records = list(collection.find({"studentId": ObjectId(student_id)}))
        if not records:
            return jsonify({"error": "No medical history found for this patient"}), 404

        enriched_records = []
        for record in records:
            doctor = users_collection.find_one({"_id": ObjectId(record["doctorId"])}, {"name": 1})
            doctor_name = doctor["name"] if doctor else "Unknown Doctor"

            enriched_records.append({
                "Date": record.get("createdAt", "Unknown"),
                "Diagnosis": record.get("diagnosis", "Not specified"),
                "Doctor": doctor_name,
                "Treatment": record.get("treatment", "Not specified"),
                "Prescription": record.get("prescription", "Not specified")
            })

        # Secure Gemini AI prompt
        gemini_prompt = f"""
        You are assisting {student_name} with their medical history.
        Do **not** include any database-related terms, IDs, or unnecessary details.

        Patient: {student_name}

        Medical History:
        {enriched_records}

        Answer the following question in a natural and professional manner:
        "{user_question}"
        """

        # Generate response using Gemini AI
        response = model.generate_content(gemini_prompt)
        final_answer = response.text if response and response.text else "I couldn't generate an answer."

        return jsonify({"status": "success", "answer": final_answer})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500



# ✅ AI-Powered Doctor Insights (Secure)
@app.route("/doctor_insights", methods=["POST"])
def doctor_insights():
    try:
        data = request.json
        doctor_id = data.get("doctorId")
        user_question = data.get("question")

        if not doctor_id or not user_question:
            return jsonify({"error": "Doctor ID and question are required"}), 400

        doctor_name = get_user_name(doctor_id)

        # Fetch doctor's upcoming appointments
        appointments = list(appointments_collection.find({"doctorId": ObjectId(doctor_id)}))
        enriched_appointments = []
        for appointment in appointments:
            student_name = get_user_name(appointment["studentId"])
            enriched_appointments.append({
                "Patient": student_name,
                "Date": appointment.get("date", "Unknown"),
                "Time": appointment.get("timeSlot", "Unknown"),
                "Status": appointment.get("status", "Unknown")
            })

        # Fetch health records of treated patients
        health_records = list(health_records_collection.find({"doctorId": ObjectId(doctor_id)}))
        enriched_health_records = []
        for record in health_records:
            student_name = get_user_name(record["studentId"])
            enriched_health_records.append({
                "Patient": student_name,
                "Diagnosis": record.get("diagnosis", "Not specified"),
                "Treatment": record.get("treatment", "Not specified"),
                "Prescription": record.get("prescription", "Not specified"),
                "Date": record.get("createdAt", "Unknown")
            })

        # AI Prompt
        gemini_prompt = f"""
        You are assisting Dr. {doctor_name} with patient records.

        Your Upcoming Appointments:
        {enriched_appointments}

        Your Past Treatments:
        {enriched_health_records}

        Answer the following question:
        "{user_question}"
        """

        response = model.generate_content(gemini_prompt)
        final_answer = response.text if response and response.text else "I couldn't generate an answer."

        return jsonify({"status": "success", "answer": final_answer})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# ✅ AI-Powered Leave Records (Secure)
@app.route("/leave_related", methods=["POST"])
def leave_related():
    try:
        data = request.json
        student_id = data.get("studentId")
        user_question = data.get("question")

        if not student_id or not user_question:
            return jsonify({"error": "Student ID and question are required"}), 400

        student_name = get_user_name(student_id)

        # Fetch student's leave records
        leaves = list(leave_collection.find({"studentId": ObjectId(student_id)}))
        formatted_leaves = [
            {
                "Status": leave.get("status", "Unknown"),
                "Date Applied": leave.get("createdAt", "Unknown")
            }
            for leave in leaves
        ]

        # AI Prompt
        gemini_prompt = f"""
        You are assisting {student_name} with their leave history.

        Leave History:
        {formatted_leaves}

        Answer the following question:
        "{user_question}"
        """

        response = model.generate_content(gemini_prompt)
        final_answer = response.text if response and response.text else "I couldn't generate an answer."

        return jsonify({"status": "success", "answer": final_answer})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# Run Flask app
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3083, debug=True)
