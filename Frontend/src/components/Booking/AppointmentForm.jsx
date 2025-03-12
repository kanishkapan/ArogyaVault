import React, { useState, useEffect } from "react";
import { api } from "../../axios.config.js"; // Import API instance

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    timeSlot: "",
  });

  const [doctors, setDoctors] = useState([]);

  // Fetch available doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/user/doctors"); // Assuming endpoint returns list of doctors
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error.response?.data || error.message);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/appointment", formData);
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-100 p-8">
      {/* Left Section - Form */}
      <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-lg lg:w-1/2">
        <h2 className="text-4xl font-bold text-green-600 mb-4">Book Your Appointment</h2>
        <p className="text-gray-600 mb-6">Schedule your appointment easily with our doctors.</p>

        {/* Form Fields */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Doctor Selection */}
          <select
            name="doctorId"
            className="w-full border rounded-md p-3 text-gray-700"
            onChange={handleChange}
            value={formData.doctorId}
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            className="w-full border rounded-md p-3 text-gray-700"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="timeSlot"
            placeholder="Enter Time Slot (e.g., 10:00 AM)"
            className="w-full border rounded-md p-3 text-gray-700"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md text-lg font-semibold hover:bg-gray-800"
          >
            Book Appointment
          </button>
        </form>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:flex items-center justify-center w-full lg:w-1/2 p-6">
        <img
          src="/path-to-your-image.png" // Replace with actual image path
          alt="Doctor Consultation"
          className="w-full max-w-md rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default AppointmentForm;
