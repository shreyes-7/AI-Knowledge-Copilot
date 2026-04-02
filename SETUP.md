backend/.env.example → backend/.env
frontend/.env.example → frontend/.env

# BACKEND SETUP

## Step 1: Copy Environment Template
cp backend/.env.example backend/.env

## Step 2: Configure MongoDB Atlas
Visit https://www.mongodb.com/cloud/atlas and:
- Create a cluster (M10+ recommended)
- Enable Vector Search feature
- Get connection string
- Add to MONGODB_URI in .env

## Step 3: Configure Groq API
Visit https://console.groq.com:
- Create account
- Generate API key
- Add to GROQ_API_KEY in .env

## Step 4: Configure HuggingFace
Visit https://huggingface.co/settings/tokens:
- Create new token
- Add to HUGGINGFACE_API_KEY in .env

## Step 5: Install Dependencies
cd backend
npm install

## Step 6: Run Backend
npm run dev
Server runs on http://localhost:5000

---

# FRONTEND SETUP

## Step 1: Copy Environment Template
cp frontend/.env.example frontend/.env

## Step 2: Update Backend URL (if different)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

## Step 3: Install Dependencies
cd frontend
npm install

## Step 4: Run Frontend
npm run dev
Open http://localhost:3000

---

# QUICK VERIFICATION

After both are running:

## Test Backend Health
curl http://localhost:5000/health

## Test Chat Endpoint
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello"}'

## Test Frontend
Open http://localhost:3000 in browser

---

# MONGODB ATLAS SETUP (Detailed)

1. **Create Cluster**
   - Provider: Google Cloud / AWS
   - Region: Closest to you
   - Tier: M10 or higher

2. **Enable Vector Search**
   - Go to Cluster → Atlas Search
   - Click "Create Search Index"
   - JSON Editor mode
   - Paste vector index config

3. **Create Vector Index**
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 384,
         "similarity": "cosine"
       }
     ]
   }
   ```

4. **Get Connection String**
   - Cluster → Connect
   - Copy connection string
   - Replace <username>, <password>, <cluster>

---

# DOCKER DEPLOYMENT

## Build Backend Image
docker build -f backend/Dockerfile -t rag-backend:latest ./backend

## Build Frontend Image
docker build -f frontend/Dockerfile -t rag-frontend:latest ./frontend

## Run with Docker Compose
docker-compose up -d

---

# PORT MAPPING

Backend: 5000
Frontend: 3000
MongoDB: Use connection string (cloud)

Make sure ports are not in use:
- Linux/Mac: lsof -i :5000
- Windows: netstat -ano | findstr :5000
