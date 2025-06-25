const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/mindmaps_db";
const client = new MongoClient(uri);

// Configure multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|txt/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
}).single('file');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Global database connection
let db;

async function connectToDatabase() {
  try {
    await client.connect();
    // Explicitly specify the database name
    db = client.db("mindmaps_db");
    console.log(`✅ Connected to MongoDB database: ${db.databaseName}`);
    
    // Test the connection by checking collections
    const collections = await db.listCollections().toArray();
    console.log("📊 Available collections:", collections.map(c => c.name));
    
    // If no mindmaps collection exists, create it with sample data
    if (!collections.find(c => c.name === 'mindmaps')) {
      console.log("📝 Creating mindmaps collection with sample data...");
      await createSampleData();
    }
    
    return db;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    console.log("💡 Make sure MongoDB is running locally or update MONGODB_URI in .env");
    console.log("💡 To start MongoDB locally: brew services start mongodb-community (macOS) or sudo systemctl start mongod (Linux)");
    process.exit(1);
  }
}

// Create sample mindmap data if collection is empty
async function createSampleData() {
  try {
    const sampleMindmap = {
      metadata: {
        title: "Sample Database Management Systems",
        description: "Complete guide to database concepts and management",
        version: "1.0.0",
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      nodes: [
        {
          id: "relational-db",
          title: "Relational Databases",
          level: 0,
          position: { x: -200, y: 0 },
          color: "#DC2626",
          children: [
            {
              id: "sql",
              title: "SQL",
              level: 1,
              position: { x: -400, y: -150 },
              parent: "relational-db",
              color: "#EF4444",
              relationshipLabel: "queried with",
              children: [
                {
                  id: "ddl",
                  title: "DDL",
                  level: 2,
                  position: { x: -500, y: -250 },
                  parent: "sql",
                  color: "#F87171",
                  relationshipLabel: "data definition"
                },
                {
                  id: "dml",
                  title: "DML",
                  level: 2,
                  position: { x: -300, y: -250 },
                  parent: "sql",
                  color: "#F87171",
                  relationshipLabel: "data manipulation"
                }
              ]
            },
            {
              id: "normalization",
              title: "Normalization",
              level: 1,
              position: { x: 0, y: -150 },
              parent: "relational-db",
              color: "#EF4444",
              relationshipLabel: "organized by",
              children: [
                {
                  id: "1nf",
                  title: "1NF",
                  level: 2,
                  position: { x: -100, y: -250 },
                  parent: "normalization",
                  color: "#F87171",
                  relationshipLabel: "first normal form"
                },
                {
                  id: "2nf",
                  title: "2NF",
                  level: 2,
                  position: { x: 100, y: -250 },
                  parent: "normalization",
                  color: "#F87171",
                  relationshipLabel: "second normal form"
                }
              ]
            }
          ]
        },
        {
          id: "nosql-db",
          title: "NoSQL Databases",
          level: 0,
          position: { x: 200, y: 0 },
          color: "#059669",
          children: [
            {
              id: "document-db",
              title: "Document Stores",
              level: 1,
              position: { x: 100, y: 150 },
              parent: "nosql-db",
              color: "#10B981",
              relationshipLabel: "type",
              children: [
                {
                  id: "mongodb",
                  title: "MongoDB",
                  level: 2,
                  position: { x: 0, y: 250 },
                  parent: "document-db",
                  color: "#34D399",
                  relationshipLabel: "example"
                }
              ]
            },
            {
              id: "key-value",
              title: "Key-Value Stores",
              level: 1,
              position: { x: 300, y: 150 },
              parent: "nosql-db",
              color: "#10B981",
              relationshipLabel: "type",
              children: [
                {
                  id: "redis",
                  title: "Redis",
                  level: 2,
                  position: { x: 200, y: 250 },
                  parent: "key-value",
                  color: "#34D399",
                  relationshipLabel: "example"
                }
              ]
            }
          ]
        }
      ],
      topLevelConnections: [
        {
          from: "relational-db",
          to: "nosql-db",
          label: "alternative to"
        }
      ]
    };

    await db.collection("mindmaps").insertOne(sampleMindmap);
    console.log("✅ Sample mindmap data created successfully");
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  }
}

// API Routes

// Test endpoint to verify database connection and collections
app.get('/api/test-db', async (req, res) => {
  try {
    const collections = await db.listCollections().toArray();
    const mindmaps = await db.collection("mindmaps").find({}).toArray();
    
    res.json({
      database: db.databaseName,
      collections: collections.map(c => c.name),
      mindmapsCount: mindmaps.length,
      sample: mindmaps[0] || "No mindmaps found"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mindmap API is running',
    timestamp: new Date().toISOString()
  });
});

// Get all mindmaps (for sidebar list)
app.get('/api/mindmaps', async (req, res) => {
  try {
    const mindmaps = db.collection("mindmaps");
    
    // Fetch all mindmaps with their metadata
    const allMindmaps = await mindmaps.find({}).toArray();
    
    // Transform data for frontend
    const transformedMindmaps = allMindmaps.map(mindmap => ({
      id: mindmap._id.toString(),
      metadata: {
        title: mindmap.metadata?.title || 'Untitled',
        description: mindmap.metadata?.description || '',
        version: mindmap.metadata?.version || '1.0.0',
        created: mindmap.metadata?.created || new Date().toISOString(),
        lastModified: mindmap.metadata?.lastModified || new Date().toISOString()
      },
      nodes: mindmap.nodes || [],
      topLevelConnections: mindmap.topLevelConnections || []
    }));

    console.log(`📋 Fetched ${transformedMindmaps.length} mindmaps`);
    res.json(transformedMindmaps);
  } catch (error) {
    console.error("❌ Error fetching mindmaps:", error);
    res.status(500).json({ 
      error: "Failed to fetch mindmaps",
      details: error.message 
    });
  }
});

// Get a single mindmap by ID
app.get('/api/mindmaps/:id', async (req, res) => {
  try {
    const mindmaps = db.collection("mindmaps");
    const mindmapId = req.params.id;
    
    const mindmap = await mindmaps.findOne({ 
      _id: new ObjectId(mindmapId) 
    });

    if (!mindmap) {
      return res.status(404).json({ error: "Mindmap not found" });
    }

    // Transform the document to match the frontend's expected format
    const transformedMindmap = {
      id: mindmap._id.toString(),
      metadata: {
        title: mindmap.metadata?.title || 'Untitled',
        description: mindmap.metadata?.description || '',
        version: mindmap.metadata?.version || '1.0.0',
        created: mindmap.metadata?.created || new Date().toISOString(),
        lastModified: mindmap.metadata?.lastModified || new Date().toISOString()
      },
      nodes: mindmap.nodes || [],
      topLevelConnections: mindmap.topLevelConnections || []
    };

    res.json(transformedMindmap);
  } catch (error) {
    console.error("❌ Error fetching mindmap:", error);
    res.status(500).json({ 
      error: "Failed to fetch mindmap",
      details: error.message 
    });
  }
});

// Get mindmap by title (alternative endpoint)
app.get('/api/mindmaps/title/:title', async (req, res) => {
  try {
    const mindmaps = db.collection("mindmaps");
    const title = decodeURIComponent(req.params.title);
    
    const mindmap = await mindmaps.findOne({ 
      "metadata.title": { $regex: new RegExp(title, 'i') }
    });
    
    if (!mindmap) {
      return res.status(404).json({ 
        error: "Mindmap not found",
        title: title
      });
    }
    
    const transformedMindmap = {
      id: mindmap._id.toString(),
      metadata: mindmap.metadata,
      nodes: mindmap.nodes || [],
      topLevelConnections: mindmap.topLevelConnections || []
    };
    
    console.log(`📖 Fetched mindmap by title: ${mindmap.metadata.title}`);
    res.json(transformedMindmap);
    
  } catch (error) {
    console.error("❌ Error fetching mindmap by title:", error);
    res.status(500).json({ 
      error: "Failed to fetch mindmap", 
      message: error.message 
    });
  }
});

// Create a new mindmap
app.post('/api/mindmaps', async (req, res) => {
  try {
    const { metadata, nodes = [], topLevelConnections = [] } = req.body;
    
    if (!metadata || !metadata.title) {
      return res.status(400).json({ error: "Metadata with title is required" });
    }

    const now = new Date().toISOString();
    const mindmap = {
      metadata: {
        ...metadata,
        created: metadata.created || now,
        lastModified: now
      },
      nodes,
      topLevelConnections
    };

    const result = await db.collection("mindmaps").insertOne(mindmap);
    
    res.status(201).json({
      id: result.insertedId.toString(),
      ...mindmap
    });
  } catch (error) {
    console.error("❌ Error creating mindmap:", error);
    res.status(500).json({ error: "Failed to create mindmap" });
  }
});

// Update a mindmap
app.put('/api/mindmaps/:id', async (req, res) => {
  try {
    const mindmaps = db.collection("mindmaps");
    const mindmapId = req.params.id;
    const updateData = req.body;

    // Remove _id if present to prevent updates to the ID
    delete updateData._id;
    delete updateData.id;

    // Update lastModified timestamp
    if (updateData.metadata) {
      updateData.metadata.lastModified = new Date().toISOString();
    }

    const result = await mindmaps.findOneAndUpdate(
      { _id: new ObjectId(mindmapId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Mindmap not found" });
    }

    res.json({
      id: result.value._id.toString(),
      ...result.value
    });
  } catch (error) {
    console.error("❌ Error updating mindmap:", error);
    res.status(500).json({ error: "Failed to update mindmap" });
  }
});

// Delete a mindmap
app.delete('/api/mindmaps/:id', async (req, res) => {
  try {
    const mindmaps = db.collection("mindmaps");
    const mindmapId = req.params.id;
    
    const result = await mindmaps.findOneAndDelete({ 
      _id: new ObjectId(mindmapId) 
    });

    if (!result.value) {
      return res.status(404).json({ error: "Mindmap not found" });
    }

    res.status(204).end();
  } catch (error) {
    console.error("❌ Error deleting mindmap:", error);
    res.status(500).json({ error: "Failed to delete mindmap" });
  }
});

// File upload endpoint
app.post('/api/upload', (req, res) => {
  console.log('File upload request received');
  
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: err.message || 'Error processing file upload',
        details: err 
      });
    }

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ 
        error: 'No file uploaded',
        receivedFields: Object.keys(req.body || {}),
        receivedFiles: req.files ? Object.keys(req.files) : 'No files'
      });
    }

    console.log('Processing file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    try {
      const files = db.collection('files');
      
      // Create a new file document
      const fileDoc = {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        uploadDate: new Date(),
        content: req.file.buffer
      };

      console.log('Inserting file into database...');
      
      // Insert the file into the database
      const result = await files.insertOne(fileDoc);
      
      console.log('File uploaded successfully:', result.insertedId);
      
      res.status(200).json({ 
        message: 'File uploaded successfully',
        fileId: result.insertedId,
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Error saving file to database:', error);
      res.status(500).json({ 
        error: 'Error saving file',
        details: error.message 
      });
    }
  });
});

// Get file by ID
app.get('/api/files/:id', async (req, res) => {
  try {
    const files = db.collection('files');
    const file = await files.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate headers for file download
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Content-Length': file.size
    });
    
    // Send the file content
    res.send(file.content);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ error: 'Error retrieving file' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error", 
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    path: req.originalUrl
  });
});

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(port, () => {
      console.log(`🚀 Mindmap API server running on http://localhost:${port}`);
      console.log(`📡 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
      console.log(`🔗 API endpoints:`);
      console.log(`   GET  /api/health`);
      console.log(`   GET  /api/mindmaps`);
      console.log(`   GET  /api/mindmaps/:id`);
      console.log(`   GET  /api/mindmaps/title/:title`);
      console.log(`   POST /api/mindmaps`);
      console.log(`   PUT  /api/mindmaps/:id`);
      console.log(`   DELETE /api/mindmaps/:id`);
      console.log(`   POST /api/upload`);
      console.log(`   GET  /api/files/:id`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await client.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();