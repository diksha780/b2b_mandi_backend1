// backend/index.js

// ... (top imports and app setup)

// 1. Ensure dotenv is loaded AT THE VERY TOP
require('dotenv').config(); // THIS MUST BE AT THE TOP

// ... (other imports)
const express = require('express');
const cors = require('cors');
// const fetch = require('node-fetch')

const app = express(); 
// 2. Ensure CORS origin uses FRONTEND_URL from .env
app.use(express.json());
// 4. Constants for Resend API


// --- CRUCIAL DEBUGGING LOG ---
const frontendUrl = process.env.FRONTEND_URL;
console.log('--- Vercel Backend CORS Debug: FRONTEND_URL is set to:', frontendUrl);

app.use(cors({
  origin: frontendUrl, // Uses the variable we are debugging
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Explicitly allow common methods
  credentials: true, // If your frontend sends cookies or authorization headers
  optionsSuccessStatus: 204, // Recommended for preflight requests
}));

const RESEND_API_URL = 'https://api.resend.com/emails';
// ... (your /api/send-verification-email endpoint)

// app.post('/api/send-verification-email', async (req, res) => {
//   const { email, verificationUrl } = req.body;
app.post('/verify-email', async (req, res) => {
  const { email, verificationUrl } = req.body;
  
  // ... (validation)
// Basic validation (add more robust validation in a real app)
if (!email || !verificationUrl) {
    return res.status(400).json({ message: 'Email and verification URL are required.' });
    }
    
  try {
    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, // Uses API key from .env
      },
      body: JSON.stringify({
        // Uses SENDER_NAME and SENDER_EMAIL from .env
        from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
        to: [email],
        subject: 'Action Required: Verify Your Email Address for Your B2B Mandi Platform',
        html: `
          <p>Hello,</p>
          <p>Thank you for signing up for Your B2B Mandi Platform. To activate your supplier account, please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify My Email Address</a></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>If you did not sign up for this account, please ignore this email.</p>
          <p>Regards,<br/>The B2B Mandi Platform Team</p>
        `,
      }),
    });
    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      // If Resend returns an error (e.g., API key invalid, sender not verified)
      console.error('Error from Resend API:', resendData);
      return res.status(resendResponse.status).json({ message: resendData.message || 'Failed to send verification email via Resend.' });
    }

    console.log(`Verification email successfully requested from Resend for: ${email}. Resend ID: ${resendData.id}`);
    res.status(200).json({ message: 'Verification email sent successfully!' });

  } catch (error) {
    console.error('Server error sending verification email:', error);
    res.status(500).json({ message: 'Internal server error during email sending process.' });
  }
});

// 7. Start the server
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

    // ... (error handling and response)

//   } catch (error) {
//     // ...
//   }
// });

// ... (app.listen)