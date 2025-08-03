const express = require('express');
const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 5000; // Force port 5000 for Replit

const server = http.createServer(app);

// Enable CORS with specific allowed origins
const allowedOrigins = ['https://ismsuser.adani.com', 'https://ismsdashboard.adani.com'];

const corsOptions = {
 origin: (origin, callback) => {
   if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
     // Allow requests with no origin (like mobile apps or curl requests)
     callback(null, true);
   } else {
     callback(new Error('Not allowed by CORS'));
   }
 },
 optionsSuccessStatus: 200,
};

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));

app.use(express.json());

// Authentication middleware using ACCESS_TOKEN
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] || req.headers['access-token'] || process.env.ACCESS_TOKEN;
    const expectedToken = process.env.ACCESS_TOKEN || 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa';
    
    if (!token || token !== expectedToken) {
        return res.status(401).json({ error: 'Access denied. Invalid token.' });
    }
    next();
};

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/indexChairmanDaily', (req, res) => {
  res.sendFile(__dirname + '/views/indexChairmanDaily.html');
});

app.get('/indexChairmanMonthly', (req, res) => {
  res.sendFile(__dirname + '/views/indexChairmanMonthly.html');
});

var index = require('./routes/index');
app.use('/index', index);

// Middleware to restrict HTTP methods
const methodNotAllowed = (req, res, next) => {
  const allowedMethods = ['GET', 'POST'];
  if (!allowedMethods.includes(req.method)) {
    res.setHeader('X-Method-Not-Allowed', 'true');
    res.status(405).json({ message: 'Method Not Allowed' });
  } else {
    next();
  }
};

// Apply method restriction middleware globally
app.use(methodNotAllowed);

// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
