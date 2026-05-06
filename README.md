Notes App

A full-stack Notes Management application built with Node.js, Express, MongoDB, and vanilla JavaScript.
The application allows users to securely create, edit, delete, search, and organize personal notes with authentication and a modern responsive UI.

Features
User Signup & Login Authentication
JWT-based protected routes
Private user-specific notes
Create, Edit, Delete notes
Search notes by title/content
Debounced search input
Pagination support
Date filtering
Dark Mode toggle
Responsive premium UI
Toast notifications
MongoDB Atlas database integration

Installation & Setup
1. Clone Repository
git clone https://github.com/Pasha806/notes-api.git
cd notes-api
2. Install Dependencies
npm install
3. Create .env

Create a .env file in the root folder:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
Run Locally
Development Mode
npm run dev
Production Mode
npm start

App runs on:

http://localhost:5000

Author
Developed by Hamza Imran
