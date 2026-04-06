const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function simulateUpload() {
  const filePath = path.join(__dirname, 'test-report.jpg');
  // Create a dummy image file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, 'dummy image content');
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('reportName', 'Test Report');
  
  try {
    // We need a token. Let's assume we can get one or the route is protected.
    // Actually, I'll check auth.js to see how to get a token.
    console.log('Attempting upload to http://localhost:3001/api/reports/upload');
    const response = await axios.post('http://localhost:3001/api/reports/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        // We need a Bearer token here. 
      }
    });
    console.log('Response:', response.data);
  } catch (err) {
    console.error('Upload failed:', err.response ? err.response.data : err.message);
  }
}

// simulateUpload();
