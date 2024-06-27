require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const API_URL = 'https://api.anthropic.com/v1/messages';

app.post('/api/chat', async (req, res) => {
  console.log('Received request:', JSON.stringify(req.body, null, 2));
  
  try {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not set in the environment variables');
    }

    // 將 "human" 角色更改為 "user"
    const messages = req.body.messages.map(msg => ({
      ...msg,
      role: msg.role === 'human' ? 'user' : msg.role
    }));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        ...req.body,
        messages: messages
      })
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? 'Is set' : 'Is NOT set');
});