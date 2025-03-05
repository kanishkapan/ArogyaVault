import { useState } from "react";
import React from "react";
export default function Login() {
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [extra, setExtra] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { role, name, email, extra };
    
    try {
      const response = await fetch("https://your-backend-url.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log("Success:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-12 rounded-xl shadow-lg max-w-6xl w-full flex flex-col md:flex-row items-center">
        {/* Left Image Section */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="/path-to-your-image.png"
            alt="Healthcare Workers"
            className="w-full h-auto max-w-lg"
          />
        </div>
        
        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="flex items-center space-x-6 mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  checked={role === "patient"}
                  onChange={() => setRole("patient")}
                  className="form-radio text-green-500"
                />
                <span>Patient</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  checked={role === "doctor"}
                  onChange={() => setRole("doctor")}
                  className="form-radio text-green-500"
                />
                <span>Doctor</span>
              </label>
            </div>

            {/* Input Fields */}
            <input
              type="text"
              placeholder="What should we call u ?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
            />
            <input
              type="email"
              placeholder="Where to mail ?"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
            />
            <textarea
              placeholder="Extra Field"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300 h-32"
            ></textarea>

            {/* Login Button */}
            <button type="submit" className="w-full mt-4 p-4 bg-black text-white rounded-lg hover:bg-gray-800">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}