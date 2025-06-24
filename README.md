<<<<<<< HEAD
=======
# Zoom-Based Hierarchical Mindmap System

A beautiful, interactive mindmap visualization system built with React, TypeScript, and Tailwind CSS. Features zoom-based hierarchical navigation, drag-and-drop functionality, and support for multiple mindmap topics.

## Features

- **Zoom-based Navigation**: Different detail levels revealed at different zoom levels
- **Beautiful UI**: Modern glassmorphism design with dark/light theme support
- **Interactive**: Drag nodes, pan canvas, and smooth zoom controls
- **Responsive**: Works seamlessly on desktop and mobile devices
- **Multiple Topics**: Pre-loaded with 5 comprehensive mindmaps
- **Import/Export**: Load custom JSON mindmaps or export existing ones
- **Performance**: Optimized rendering with collision detection

>>>>>>> c9816d4 (Mongodb URL updated)
## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/whoisishaan/visualli-ai.git
   cd mindmap-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`


## Mindmap Data Location

### Pre-loaded Mindmaps
All mindmap JSON files are located in the `/mindmaps/` directory:

```
mindmaps/
├── README.md                    # JSON schema documentation
├── development.json             # Software Development lifecycle
├── dsa.json                    # Data Structures & Algorithms
├── dbms.json                   # Database Management Systems
├── networking.json             # Computer Networking concepts
└── operating-systems.json     # Operating Systems concepts
```

### JSON Schema
You can view sample_mindmap.json for reference.
Each mindmap follows this structure:
```json
{
  "metadata": {
    "title": "Mindmap Title",
    "description": "Brief description",
    "version": "1.0.0",
    "created": "2025-01-27T00:00:00.000Z",
    "lastModified": "2025-01-27T00:00:00.000Z"
  },
  "nodes": [
    {
      "id": "unique-id",
      "title": "Node Title",
      "level": 0,
      "color": "#3B82F6",
      "children": [...]
    }
  ],
  "topLevelConnections": [
    {
      "from": "node-id-1",
      "to": "node-id-2",
      "label": "relationship"
    }
  ]
}

```

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the server directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
project/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── server/                 # Backend server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── server.js          # Express server setup
└── public/                # Static assets
```


<<<<<<< HEAD
=======
### Adding New Mindmaps
1. Create a new JSON file in `/mindmaps/`
2. Follow the schema documented in `/mindmaps/README.md`
3. Add the mindmap to the `availableMindmaps` array in `src/components/Sidebar.tsx`

### Styling
- Theme colors: `src/contexts/ThemeContext.tsx`
- Component styles: Individual component files using Tailwind CSS
- Global styles: `src/index.css`

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Setup Instructions for MongoDB Integration and Server Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the server directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
project/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── server/                 # Backend server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── server.js          # Express server setup
└── public/                # Static assets
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run start` - Start production server
- `npm run dev` - Start development server with nodemon

## Troubleshooting

- **Connection Issues**: Ensure MongoDB Atlas has your current IP whitelisted
- **CORS Errors**: Verify `FRONTEND_URL` in `.env` matches your frontend URL
- **Missing Dependencies**: Run `npm install` in both root and server directories

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI powered by [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
>>>>>>> c9816d4 (Mongodb URL updated)
