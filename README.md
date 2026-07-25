# DevNotes

DevNotes is a full-stack web application designed for developers to manage knowledge bases, tools, frameworks, and code snippets.

## Features

- **Backend Architecture**: Built with a Model-View-Controller (MVC) pattern using Node.js and Express.
- **Security**: Includes `helmet` for HTTP headers and `express-rate-limit` for request throttling.
- **API Documentation**: Integrated with Swagger UI for exploring and testing API endpoints.
- **Performance**: Utilizes payload compression on the backend and in-memory token caching on the frontend.
- **Testing**: Includes automated testing using Jest and Supertest, with mocked database interactions.
- **Deployment Ready**: Configured with a Dockerfile for the backend and a `vercel.json` for frontend client-side routing.
- **CI/CD**: Uses GitHub Actions for automated testing on code pushes.

## Tech Stack

- **Frontend**: React, Redux Toolkit, React Router, Supabase Auth
- **Backend**: Node.js, Express, Jest, Morgan
- **Database**: Supabase (PostgreSQL)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Supabase account and project

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   The API documentation will be available at `http://localhost:5000/api-docs`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```

## Running Tests
To run the automated tests for the backend:
```bash
cd backend
npm test
```
