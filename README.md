## Notes App / https://360notes.netlify.app/

A full-stack AI-powered Notes Management application built with Node.js, Express, MongoDB, Netlify Functions, and vanilla JavaScript.

The application allows users to securely create, edit, delete, search, organize, and manage personal notes with authentication, a modern responsive UI, and AI-powered assistance for note creation, summaries, tags, and knowledge retrieval.

## Features
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
AI-generated note drafts from a topic
AI automatic summaries for notes
AI-generated tags for notes
Editable tags by user
Ask AI questions based on saved notes
AI-assisted personal knowledge retrieval

## AI Features

### AI Note Generation
Users can enter a topic, and the AI generates a structured note draft. The generated note is placed inside the writing section, allowing the user to review, edit, and save it manually.

### Automatic AI Summary
When a note is saved, the backend can generate a short AI summary for the note and store it with the note document in MongoDB.

### Automatic AI Tags
The AI can analyze the note content and generate relevant tags. Users can also manually edit tags before saving or updating notes.

### Ask AI About Notes
Users can ask a question, and the AI answers based only on their saved notes. This allows quick knowledge retrieval without manually searching through all notes.
  
## Installation & Setup
1. Clone Repository
git clone https://github.com/Pasha806/notes-api.git <br>
cd notes-api
2. Install Dependencies <br>
npm install
3. Create .env

Create a .env file in the root folder: <br>
MONGO_URI=your_mongodb_connection_string <br>
JWT_SECRET=your_secret_key <br>
GEMINI_API_KEY=your_gemini_api_key <br>
Run Locally <br>
Development Mode <br>
npm run dev <br>
Production Mode <br>
npm start 


## Author
Developed by Hamza Imran
