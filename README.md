# Bolt Project

A modern mind mapping and visualization tool with hierarchical navigation and interactive features.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or remote instance)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/whoisishaan/boltProject.git
   cd boltProject
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   Create `.env` files in both `server/` and `client/` directories:

   **server/.env**
   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

   **client/.env**
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

## Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm start
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

## Available Scripts

### Server
- `npm run dev` - Start development server with hot-reload
- `npm start` - Start production server
- `npm test` - Run tests

### Client
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Project Structure

```
project/
├── client/               # Frontend React application
├── server/               # Backend Node.js server
└── README.md            # This file
```

## License

This project is licensed under the MIT License.
