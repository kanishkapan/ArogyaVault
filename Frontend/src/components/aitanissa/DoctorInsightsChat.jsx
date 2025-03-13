import React, { useState } from 'react';

const DoctorInsightsChat = () => {
  const [doctorId, setDoctorId] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!doctorId.trim() || !question.trim()) {
      return;
    }
    
    const newUserMessage = {
      id: Date.now(),
      text: question,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:3053/doctor_insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          question
        }),
      });
      
      const data = await response.json();
      
      // Process the response to remove ** markers
      const formattedResponse = data.response ? data.response.replace(/\*\*/g, '') : 'No response received';
      
      const newBotMessage = {
        id: Date.now() + 1,
        text: formattedResponse,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, newBotMessage]);
      setQuestion('');
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Error connecting to the server. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Doctor Insights</h1>
      </div>
      
      {/* Doctor ID Input */}
      <div className="bg-white p-4 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
            Doctor ID
          </label>
          <input
            type="text"
            id="doctorId"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your doctor ID"
          />
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Ask a question to get started
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs md:max-w-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Question Input */}
      <div className="bg-white p-4 border-t">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask a question..."
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
            disabled={loading || !doctorId.trim() || !question.trim()}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorInsightsChat;