


1. **Clone the repository**
   ```bash
   git clone <link of repo>
   cd <--->
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   

   # Install client dependencies
   (in different terminal)
   cd..
   npm install
   ```

3. **Configure environment variables**

   Create `.env` files in `server/`  directory:

   **server/.env**
   ```env
   MONGODB_URI= shared on whatsapp
   FRONTEND_URL=http://localhost:5173
   PORT=3001
   ```

## Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend** (in a new terminal)
   ```bash
   cd..
   npm run dev
   ```

3. **Access the application*
   - Frontend: `http://locahost:5173`
   - Backend API: `http://localhost:3001`


