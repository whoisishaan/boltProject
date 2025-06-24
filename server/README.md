# Mindmap Backend Server

This is the backend API server for the mindmap application, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the server directory:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mindmap_db
PORT=3001

# CORS Configuration  
FRONTEND_URL=http://localhost:5173
```

### 3. Prepare Your MongoDB Database

#### Option A: Import Existing JSON Files

If you have mindmap JSON files in the `/mindmaps` folder, you can import them into MongoDB:

```bash
# Import each mindmap file
mongoimport --db mindmap_db --collection mindmaps --file ../mindmaps/development.json
mongoimport --db mindmap_db --collection mindmaps --file ../mindmaps/dsa.json
mongoimport --db mindmap_db --collection mindmaps --file ../mindmaps/dbms.json
mongoimport --db mindmap_db --collection mindmaps --file ../mindmaps/networking.json
mongoimport --db mindmap_db --collection mindmaps --file ../mindmaps/operating-systems.json
```

#### Option B: Use MongoDB Compass or Studio 3T

1. Connect to your MongoDB instance
2. Create database: `mindmap_db`
3. Create collection: `mindmaps`
4. Import the JSON files from the `/mindmaps` directory

#### Option C: Use the API to Create Mindmaps

Once the server is running, you can POST mindmap data to `/api/mindmaps`

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Mindmaps
- `GET /api/mindmaps` - Get all mindmaps (metadata only)
- `GET /api/mindmaps/:id` - Get specific mindmap by MongoDB ObjectId
- `GET /api/mindmaps/title/:title` - Get mindmap by title (case-insensitive)
- `POST /api/mindmaps` - Create new mindmap
- `PUT /api/mindmaps/:id` - Update existing mindmap
- `DELETE /api/mindmaps/:id` - Delete mindmap

### Example API Usage

```bash
# Get all mindmaps
curl http://localhost:3001/api/mindmaps

# Get specific mindmap
curl http://localhost:3001/api/mindmaps/507f1f77bcf86cd799439011

# Create new mindmap
curl -X POST http://localhost:3001/api/mindmaps \
  -H "Content-Type: application/json" \
  -d @mindmap-data.json
```

## Database Schema

### Collection: `mindmaps`

Each document follows this structure:

```json
{
  "_id": "ObjectId",
  "metadata": {
    "title": "string",
    "description": "string", 
    "version": "string",
    "created": "ISO date string",
    "lastModified": "ISO date string"
  },
  "nodes": [
    {
      "id": "string",
      "title": "string",
      "level": "number",
      "position": { "x": "number", "y": "number" },
      "color": "string",
      "parent": "string",
      "relationshipLabel": "string",
      "children": "array"
    }
  ],
  "topLevelConnections": [
    {
      "from": "string",
      "to": "string", 
      "label": "string"
    }
  ]
}
```

## Troubleshooting

### Connection Issues

1. **MongoDB not running**: Make sure MongoDB is started
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

2. **Wrong connection string**: Check your `MONGODB_URI` in `.env`

3. **Database doesn't exist**: MongoDB will create the database automatically when you insert the first document

### CORS Issues

If you get CORS errors, make sure:
- The `FRONTEND_URL` in `.env` matches your React app URL
- Both frontend and backend are running on the correct ports

### Port Conflicts

If port 3001 is in use, change the `PORT` in `.env` and update the frontend's `VITE_API_URL`

## Development

### Adding New Features

1. Add new routes in `server.js`
2. Update the API documentation
3. Test with curl or Postman
4. Update the frontend API service

### Database Indexes

For better performance with large datasets, consider adding indexes:

```javascript
// In MongoDB shell
db.mindmaps.createIndex({ "metadata.title": 1 })
db.mindmaps.createIndex({ "metadata.created": -1 })
```

## Production Deployment

1. Set production environment variables
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Enable authentication and security features
4. Use a process manager like PM2
5. Set up proper logging and monitoring

```bash
# Example PM2 deployment
pm2 start server.js --name "mindmap-api"
```