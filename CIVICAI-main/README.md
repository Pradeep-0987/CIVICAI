# CivicAI Complaint Management App

A simple Node.js + Express complaint management application with user authentication and file uploads.

## Features

- User signup and login
- Submit complaints with optional file attachments
- Admin dashboard to view and manage complaints
- Basic static frontend under `public/`

## Project Structure

- `server.js` - Main Express server
- `routes/auth.js` - Authentication routes
- `routes/complaints.js` - Complaint routes
- `middleware/authMiddleware.js` - Authentication middleware
- `models/User.js` - Mongoose user model
- `models/Complaint.js` - Mongoose complaint model
- `public/` - Frontend HTML/CSS/JS files
- `uploads/` - Uploaded files storage

## Setup

1. Install dependencies:

```bash
cd civicai
npm install
```

2. Start MongoDB (e.g., `mongod`).

3. Run the app:

```bash
node server.js
```

4. Open browser at `http://localhost:3000`.

## Notes

- Ensure your MongoDB instance is running locally.
- Default app listens on port `3000`.

## License

MIT
