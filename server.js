const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'Test@gmail.com',
    pass: 'Password',
  },
});

// API endpoint to upload a file
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;

    // Send an email with the uploaded file
    const mailOptions = {
      from: 'Dethsakda.meekrailat@gmail.com',
      to: 'recipient@example.com',
      subject: 'File Upload',
      text: 'Here is the uploaded file:',
      attachments: [
        {
          filename: req.file.originalname,
          path: filePath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Failed to send email.');
      } else {
        console.log('Email sent:', info.response);
        // Optionally, you can delete the uploaded file after sending the email
        fs.unlinkSync(filePath);
        res.status(200).send('File uploaded and email sent.');
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
