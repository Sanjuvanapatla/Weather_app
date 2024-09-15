# Weather_app

## Description
This project is a weather application that allows users to register, log in, and fetch weather data based on a location. It uses JWT for authentication and SQLite for storing user and search history data.

## Features
- User Registration
- User Login with JWT Authentication
- Fetch Weather Data from OpenWeatherMap API
- Retrieve Search History

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   
Navigate into the project directory:

bash
Copy code
cd your-repo-name

2.Install dependencies:
npm install

3.Create a .env file in the root directory with the following content:
makefile

OPENWEATHERMAP_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here

3.Start the server:
npm start

4.API Endpoints
1. Register a new user
Endpoint: POST http://localhost:3000/auth/register
Content-Type: application/json
Request Body:

json
Copy code
{
    "username": "testuser",
    "password": "testpassword"
}
2. Login to get the JWT token
Endpoint: POST http://localhost:3000/auth/login
Content-Type: application/json
Request Body:

json
Copy code
{
    "username": "testuser",
    "password": "testpassword"
}
Response:

json
Copy code
{
    "auth": true,
    "token": "YOUR_JWT_TOKEN_HERE"
}
3. Search for weather data
Endpoint: GET http://localhost:3000/api/weather?location=Delhi
Content-Type: application/json
Headers:


Authorization: Bearer YOUR_JWT_TOKEN_HERE
Response:

json

{
    "temperature": 293.15,
    "humidity": 73,
    "wind_speed": 3.09,
    "condition": "clear sky"
}

4. Retrieve the search history
Endpoint: GET http://localhost:3000/api/history
Content-Type: application/json
Headers:
Authorization: Bearer YOUR_JWT_TOKEN_HERE

