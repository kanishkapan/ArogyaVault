import React, { useState, useEffect } from "react";
import { api } from "../../axios.config.js"; // Axios instance
import { Link } from 'react-router-dom';
import { Bell, Settings, Search, Upload, Calendar, FileText, MessageCircle } from "lucide-react";

const Dashboard = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null); // State for selected record

  // Fetch health records
  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        const response = await api.get("/health-record");
        if (Array.isArray(response.data)) {
          setHealthRecords(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setHealthRecords([]);
        }
      } catch (err) {
        console.error("Error fetching health records:", err);
        setError("Failed to load health records.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecords();
  }, []);

  const viewHealthRecordDetails = async (id) => {
    try {
      const response = await api.get(`/health-record/${id}`);
      setSelectedRecord(response.data); // Update state with selected record details
    } catch (err) {
      console.error("Error fetching health record details:", err);
      alert("Failed to load health record details.");
    }
  };

  const deleteHealthRecord = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this record?");
      if (!confirmDelete) return;

      await api.delete(`/health-record/${id}/delete`);
      alert("Health record deleted successfully.");
      setHealthRecords(healthRecords.filter((record) => record._id !== id));
    } catch (err) {
      console.error("Error deleting health record:", err);
      alert("Failed to delete health record.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 border-r">
        <h2 className="text-xl font-bold text-blue-600 mb-6">MediSense</h2>
        <nav className="space-y-2">
          {["Dashboard", "Appointments", "Patients", "Doctors", "Departments", "Analytics", "Reports", "Settings"].map((item) => (
            <Link key={item} to={`/${item.toLowerCase()}`} className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              <span className="ml-2 text-lg font-medium">{item}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Search className="w-6 h-6 text-gray-400" />
            <Bell className="w-6 h-6 text-gray-400" />
            <Settings className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Action Buttons & History */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {[
            { title: "Health Records", action: "Upload Health Record", color: "bg-blue-600", icon: Upload, history: "Last uploaded: Blood Test Report - 10th March 2025" },
            { title: "Leave Applications", action: "Apply for Leave", color: "bg-green-600", icon: FileText, history: "Last leave applied: 5th March 2025 (Medical Leave)" },
            { title: "Appointments", action: "Book Appointment", color: "bg-purple-600", icon: Calendar, history: "Next appointment: 15th March 2025 - Dr. Smith (Dermatology)" },
            { title: "AI Chatbot", action: "AI Chatbot", color: "bg-yellow-500", icon: MessageCircle, history: "Last query: 'Best home remedies for fever?'" },
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">{item.title}</h2>
              <button className={`flex items-center justify-center ${item.color} text-white p-4 rounded-xl shadow-md w-full mb-4 text-lg font-semibold`}>
                <item.icon className="mr-2" /> {item.action}
              </button>
              <p className="text-gray-800 text-lg font-medium bg-gray-100 p-4 rounded-lg shadow-sm">{item.history}</p>
            </div>
          ))}
        </div>

        {/* Health Records Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Health Records</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : healthRecords.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">ID</th>
                  <th className="px-4 py-2 border-b text-left">Diagnosis</th>
                  <th className="px-4 py-2 border-b text-left">Date</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {healthRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-4 py-2 border-b">{record._id}</td>
                    <td className="px-4 py-2 border-b">{record.diagnosis}</td>
                    <td className="px-4 py-2 border-b">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border-b">
                      {/* View Details */}
                      <button onClick={() => viewHealthRecordDetails(record._id)} className="text-blue-600 hover:underline mr-4">
                        View
                      </button>

                      {/* Delete Record */}
                      <button onClick={() => deleteHealthRecord(record._id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No health records found.</p> // Message when no records are available
          )}
        </div>

        {/* Display Selected Record Details */}
        {selectedRecord && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Health Record Details</h2>
            <p><strong>ID:</strong> {selectedRecord._id}</p>
            <p><strong>Diagnosis:</strong> {selectedRecord.diagnosis}</p>
            <p><strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}</p>
            <p><strong>Treatment:</strong> {selectedRecord.treatment || "N/A"}</p>
            <p><strong>Prescription:</strong> {selectedRecord.prescription || "N/A"}</p>
            <button onClick={() => setSelectedRecord(null)} className="text-red-600 hover:underline">Close</button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default Dashboard;
