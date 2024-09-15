import express from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./weather.db');

// Create Users and Search History tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    location TEXT,
    weather_data TEXT,
    search_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(403).send('No token provided.');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send('Failed to authenticate token.');
    req.userId = decoded.id;
    next();
  });
}

// User Registration API
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
    if (err) return res.status(500).send('Error registering user.');
    res.send('User registered successfully.');
  });
});

// User Login API
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) return res.status(404).send('User not found.');

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send('Invalid password.');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ auth: true, token });
  });
});

// Weather Data API
app.get('/api/weather', verifyToken, async (req, res) => {
  const location = req.query.location;
  if (!location) return res.status(400).send('Location is required.');

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}`);
    const data = await response.json();
    if (data.cod !== 200) return res.status(404).send(data.message);

    const weatherData = {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      condition: data.weather[0].description
    };

    // Store search history in the database
    db.run(`INSERT INTO search_history (user_id, location, weather_data) VALUES (?, ?, ?)`, 
    [req.userId, location, JSON.stringify(weatherData)], function(err) {
      if (err) return res.status(500).send('Error saving search history.');
    });

    res.json(weatherData);
  } catch (error) {
    res.status(500).send('Error fetching weather data.');
  }
});

// Search History API
app.get('/api/history', verifyToken, (req, res) => {
  db.all(`SELECT * FROM search_history WHERE user_id = ? ORDER BY search_timestamp DESC`, 
  [req.userId], (err, rows) => {
    if (err) return res.status(500).send('Error retrieving search history.');
    res.json(rows);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
