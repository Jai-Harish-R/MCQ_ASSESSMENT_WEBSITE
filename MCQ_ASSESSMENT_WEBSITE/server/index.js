const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' as a predefined service
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Test the transporter connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error.message);
    console.log('WARNING: If using Gmail, you likely need an "App Password" instead of your raw password.');
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

// API Route for evaluation / email sending
app.post('/api/evaluate', async (req, res) => {
  try {
    const { studentEmail, score, totalQuestions, teacherEmail, testTitle } = req.body;

    if (!studentEmail || score === undefined || totalQuestions === undefined) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }

    const title = testTitle || 'Assessment';

    // HTML Email Template
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e40af; text-align: center;">Assessment Results</h2>
        <p>Hello,</p>
        <p>You have recently completed the assessment for <strong>${title}</strong>.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #475569; font-size: 14px; text-transform: uppercase; font-weight: bold;">Your Score</p>
          <h1 style="margin: 10px 0; color: #1e293b; font-size: 36px;">
            ${score} <span style="font-size: 20px; color: #64748b;">/ ${totalQuestions}</span>
          </h1>
          <p style="margin: 0; color: #059669; font-weight: bold;">
            ${Math.round((score / totalQuestions) * 100)}%
          </p>
        </div>

        <p>If you have any questions about these results, please reach out to your instructor${teacherEmail ? ` at <a href="mailto:${teacherEmail}">${teacherEmail}</a>` : ''}.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 10px;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Secure Assessment Platform<br />
          Please do not reply directly to this automated email.
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Assessment System" <${process.env.SMTP_EMAIL}>`,
      to: studentEmail,
      subject: `Results for ${title}`,
      html: htmlBody,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);

    res.status(200).json({ status: 'success', message: 'Evaluation processed and email sent.' });
  } catch (error) {
    console.error('Error in /api/evaluate:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Internal server error.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
