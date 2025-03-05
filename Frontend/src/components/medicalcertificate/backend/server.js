const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Endpoint to generate a certificate using the Gemeni API
app.post('/generate', async (req, res) => {
  const { name, age, diagnosis, details } = req.body;

  // Construct the prompt for certificate generation
  const prompt = `Generate a medical certificate for a patient named ${name}, aged ${age}, diagnosed with ${diagnosis}. Additional details: ${details}.`;

  // Replace with your actual Gemeni API endpoint and key
  const apiUrl = 'https://api.gemeni.ai/generate';
  try {
    const response = await axios.post(apiUrl, {
      prompt,
      max_tokens: 200  // Adjust as needed
    }, {
      headers: {
        'Authorization': 'AIzaSyCw0xpPJR6XxDv0eN9KXLKZEaEujHEYHzY', // Replace with your actual key
        'Content-Type': 'application/json'
      }
    });

    // Assume the API returns the certificate text under the key "text"
    const certificate = response.data.text || "Certificate generation failed.";
    res.json({ certificate });
  } catch (error) {
    console.error("Error calling Gemeni API:", error);
    res.status(500).json({ certificate: "Error generating certificate." });
  }
});

// Endpoint to generate a PDF from the certificate text
app.post('/generate', async (req, res) => {
    const { name, age, diagnosis, details } = req.body;
    const prompt = `Generate a medical certificate for a patient named ${name}, aged ${age}, diagnosed with ${diagnosis}. Additional details: ${details}.`;
  
    const apiUrl = 'https://api.gemeni.ai/generate'; // Update this with your correct endpoint
    try {
      const response = await axios.post(apiUrl, {
        prompt,
        max_tokens: 200  // Adjust as needed
      }, {
        headers: {
          'Authorization': 'Bearer YOUR_GEMENI_API_KEY', // Update with your actual API key
          'Content-Type': 'application/json'
        }
      });
      
      // Log the full response for debugging
      console.log("Gemeni API response:", response.data);
      
      const certificate = response.data.text || "Certificate generation failed.";
      res.json({ certificate });
    } catch (error) {
      console.error("Error calling Gemeni API:", error.response ? error.response.data : error.message);
      res.status(500).json({ certificate: "Error generating certificate." });
    }
  });
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
