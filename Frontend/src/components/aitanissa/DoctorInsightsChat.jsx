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

    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:3053/doctor_insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorId,
          question
        })
      });

      const data = await response.json();

      let formattedResponse = 'No response received';

      if (data && data.response) {
        // Remove all asterisks from the response
        formattedResponse = data.response.replace(/\*/g, '');
      } else if (data && typeof data === 'object') {
        // Format any object response and remove asterisks
        formattedResponse = JSON.stringify(data).replace(/\*/g, '');
      }

      const newBotMessage = {
        id: Date.now() + 1,
        text: formattedResponse,
        sender: 'bot'
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setQuestion('');
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error connecting to the server: ${error.message}`,
        sender: 'bot'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-4 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center drop-shadow-lg">Doctor Insights</h1>
      </header>

      {/* Doctor ID Input */}
      <section className="bg-white px-6 py-4 shadow-md border-b sm:px-8">
        <div className="mx-auto max-w-lg">
          <label htmlFor="doctorId" className="block text-sm font-semibold text-green-700 mb-2">
            Doctor ID
          </label>
          <input
            type="text"
            id="doctorId"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
            placeholder="Enter your doctor ID"
          />
        </div>
      </section>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto space-y-6 max-w-lg">
          {messages.length === 0 ? (
            <div className="text-center text-green-600 py-10">
              <p className="text-lg font-medium">Ask a question to get started</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex animate-fadeIn ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-xl px-5 py-3 shadow-lg transition-transform transform hover:scale-105 max-w-full ${
                    message.sender === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-green-800 border border-green-200'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{message.text}</pre>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white text-green-800 rounded-xl px-5 py-3 shadow-lg max-w-full">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Question Input */}
      <footer className="bg-white px-4 py-4 border-t sm:px-6">
        <form onSubmit={handleSubmit} className="mx-auto flex space-x-2 max-w-lg">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
            placeholder="Ask a question..."
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-3 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 disabled:bg-green-400"
            disabled={loading || !doctorId.trim() || !question.trim()}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default DoctorInsightsChat;