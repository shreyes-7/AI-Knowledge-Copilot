# 🤖 AI Knowledge Copilot - Production RAG System

A **production-grade Retrieval-Augmented Generation (RAG) system** combining advanced vector search, LLM inference, and semantic search capabilities.

## 📋 Features

✅ **MongoDB Atlas Vector Search** - Semantic search with native vector indexing  
✅ **Groq LLM Integration** - Ultra-fast LLM inference (70B model)  
✅ **HuggingFace Embeddings** - State-of-the-art text embeddings (384-dim)  
✅ **Hybrid Search** - Vector + keyword search with RRF ranking  
✅ **Document Ingestion Pipeline** - PDF, TXT, Markdown support with intelligent chunking  
✅ **Comprehensive Analytics** - Query tracking, performance metrics, user activity  
✅ **Production-Ready** - Structured logging, error handling, caching  
✅ **Modern UI** - Next.js frontend with Tailwind CSS  

## 🏗️ Architecture

```
User → Frontend (Next.js) → API (Express) → Services Layer
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
            Document.Service   RAG.Service    Analytics.Service
                    ↓               ↓               ↓
            ┌──────────────────────────────────────┐
            ↓                                        ↓
     Vector Search + Hybrid                   MongoDB Atlas
     (Vector + Keyword with RRF)              (Vector Index)
            ↑                                        ↑
     Embeddings                               Chunked Documents
     (HuggingFace)                            (with Embeddings)
            ↑
     Text Input
```

### System Flow

#### **Ingestion Pipeline**
1. **Upload Document** → Validate file type & size
2. **Extract Text** → Support PDF, TXT, Markdown
3. **Chunk Text** → 500 tokens with 100-token overlap
4. **Generate Embeddings** → HuggingFace (384-dim vectors)
5. **Store in MongoDB** → Vector index + metadata

#### **Query Processing (RAG)**
1. **Convert Query** → Query embedding (HuggingFace)
2. **Vector Search** → Top-5 semantic matches (MongoDB Vector Index)
3. **Keyword Search** → Full-text keyword matches (optional)
4. **RRF Fusion** → Combine results using Reciprocal Rank Fusion
5. **Optimize Results** → Time decay, diversity, boosting
6. **Build Context** → Concatenate top documents
7. **Generate Answer** → Groq LLM (llama-3.3-70b)
8. **Return Response** → Answer + sources + metrics

## 📦 Project Structure

```
AI-Knowledge-Copilot/
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js               # Environment configuration
│   │   │   ├── db.js                # MongoDB connection
│   │   │   ├── dbInit.js            # Index & collection setup
│   │   │   └── hybridSearchConfig.js # Search tuning parameters
│   │   ├── services/
│   │   │   ├── embedding.service.js # HuggingFace embeddings
│   │   │   ├── vector.service.js    # Vector/keyword/hybrid search
│   │   │   ├── groq.service.js      # Groq LLM integration
│   │   │   ├── rag.service.js       # Main RAG pipeline
│   │   │   └── analytics.service.js # Analytics & metrics
│   │   ├── controllers/
│   │   │   ├── upload.controller.js # Document upload
│   │   │   ├── chat.controller.js   # Chat/query endpoint
│   │   │   ├── document.controller.js # Document management
│   │   │   └── analytics.controller.js # Analytics endpoints
│   │   ├── pipelines/
│   │   │   └── ingestion.pipeline.js # End-to-end ingestion
│   │   ├── routes/
│   │   │   ├── upload.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── document.routes.js
│   │   │   └── analytics.routes.js
│   │   ├── utils/
│   │   │   ├── logger.js            # Winston logging
│   │   │   ├── errorHandler.js      # Error middleware
│   │   │   ├── chunker.js           # Text chunking
│   │   │   ├── textExtractor.js     # File text extraction
│   │   │   ├── documentRepository.js # MongoDB CRUD
│   │   │   └── searchOptimizer.js   # Result optimization
│   │   └── app.js                   # Express app setup
│   ├── package.json
│   ├── .env                         # Configuration (DO NOT COMMIT)
│   └── .env.example                 # Configuration template
│
├── frontend/                         # Next.js frontend
│   ├── app/
│   │   ├── components/
│   │   │   ├── Chat.tsx             # Chat interface
│   │   │   ├── Upload.tsx           # Document upload
│   │   │   └── Documents.tsx        # Document management
│   │   ├── services/
│   │   │   └── api.ts               # API client
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Main page
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md (this file)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **MongoDB Atlas** account with Vector Search enabled
- **Groq API Key** (get free from https://console.groq.com)
- **HuggingFace API Key** (get free from https://huggingface.co/settings/tokens)

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/shreyes-7/AI-Knowledge-Copilot.git
cd AI-Knowledge-Copilot

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (see Configuration section)

# Setup frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env with backend URL (default: http://localhost:5000/api)
```

### 2. Configuration

#### Backend .env

```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=rag_db

# Groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# HuggingFace
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Features
ENABLE_HYBRID_SEARCH=true
ENABLE_CACHE=true
```

#### Frontend .env

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Application

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

Visit: http://localhost:3000

## 📚 API Reference

### Chat & RAG

#### POST `/api/chat`
Submit a query to the RAG system.

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?",
    "topK": 5,
    "useHybrid": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Machine learning is...",
    "sources": [
      { "source": "document.pdf", "docId": "doc_123" }
    ],
    "retrievedDocuments": 5,
    "queryTime": 234,
    "usage": { "total_tokens": 1024 }
  }
}
```

#### POST `/api/chat/search`
Advanced search with filters.

```bash
curl -X POST http://localhost:5000/api/chat/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "neural networks",
    "filters": {
      "source": "research.pdf",
      "fileType": "pdf"
    }
  }'
```

### Documents

#### POST `/api/upload`
Upload documents for ingestion.

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@document.pdf"
```

#### GET `/api/documents`
List all documents with pagination.

```bash
curl http://localhost:5000/api/documents?page=1&limit=10
```

#### GET `/api/documents/:id`
Get a specific document.

```bash
curl http://localhost:5000/api/documents/507f1f77bcf86cd799439011
```

#### DELETE `/api/documents/:id`
Delete a document.

```bash
curl -X DELETE http://localhost:5000/api/documents/507f1f77bcf86cd799439011
```

### Analytics

#### GET `/api/analytics/queries`
Query statistics.

```bash
curl http://localhost:5000/api/analytics/queries?days=7
```

#### GET `/api/analytics/uploads`
Upload statistics.

```bash
curl http://localhost:5000/api/analytics/uploads?days=7
```

#### GET `/api/analytics/performance`
Performance metrics.

```bash
curl http://localhost:5000/api/analytics/performance?days=7
```

#### GET `/api/analytics/top-queries`
Top queries by frequency.

```bash
curl http://localhost:5000/api/analytics/top-queries?limit=10&days=7
```

#### GET `/api/analytics/models`
Model usage statistics.

```bash
curl http://localhost:5000/api/analytics/models?days=7
```

#### GET `/api/analytics/users`
User activity breakdown.

```bash
curl http://localhost:5000/api/analytics/users?days=7
```

## ⚙️ Configuration Details

### Embedding Configuration

- **Model:** sentence-transformers/all-MiniLM-L6-v2
- **Dimensions:** 384
- **Provider:** HuggingFace Inference API

### LLM Configuration

- **Model:** llama-3.3-70b-versatile
- **Provider:** Groq
- **Temperature:** 0.3 (low randomness)
- **Max Tokens:** 2048

### Chunking Strategy

- **Chunk Size:** 500 tokens (~2000 chars)
- **Overlap:** 100 tokens (~400 chars)
- **Boundary Breaking:** Sentences/paragraphs preferred

### Vector Search

- **Index Type:** MongoDB Atlas Vector Search
- **Similarity:** Cosine
- **Top-K:** 5 documents (configurable)
- **Candidates:** 100 (candidates evaluated before top-k)

### Hybrid Search

Uses **Reciprocal Rank Fusion (RRF)** to combine vector and keyword results:

$$\text{RRF}(d) = \sum_{\text{i}} \frac{1}{k + \text{rank}_i(d)}$$

Where:
- k = 60 (configurable, `RRF_K`)
- Vector weight = 0.7
- Keyword weight = 0.3

**Optimizations:**
- Time decay: Recent documents ranked higher
- Diversity: Max 2 chunks from same source
- Keyword boosting: Exact phrase matches get +50%

## 🔧 Performance Tuning

### Vector Search Optimization

```javascript
// In hybridSearchConfig.js
vector: {
  topK: 5,           // Number of results
  candidates: 100,   // Candidates to evaluate (higher = accurate but slower)
  weight: 0.7        // Weight in RRF fusion
}
```

### Chunking Optimization

```javascript
// In TextChunker constructor
{
  chunkSize: 500,     // Tokens per chunk (larger = more context, slower search)
  overlapSize: 100    // Overlap tokens (more = better continuity)
}
```

### Caching

```bash
# In .env
ENABLE_CACHE=true
CACHE_TTL=300  # Cache duration in seconds
```

## 📊 Monitoring & Logging

### Log Files

- **error.log** - Errors only
- **combined.log** - All logs
- **MongoDB Logs Collection** - Query/upload events

### Viewing Analytics

```bash
# Via API
curl http://localhost:5000/api/analytics/queries
curl http://localhost:5000/api/analytics/uploads
curl http://localhost:5000/api/analytics/performance
```

### Cleanup Old Logs

```bash
curl -X POST http://localhost:5000/api/analytics/cleanup \
  -H "Content-Type: application/json" \
  -d '{"daysToKeep": 90}'
```

## 🚢 Production Deployment

### Docker Setup

**Dockerfile (Backend):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend ./
CMD ["npm", "start"]
```

### Environment Variables (Production)

```bash
NODE_ENV=production
GROQ_API_KEY=xxx
HUGGINGFACE_API_KEY=xxx
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/?retryWrites=true&w=majority
ENABLE_CACHE=true
CACHE_TTL=600
```

### MongoDB Atlas Setup

1. **Create Cluster** - M10 or higher recommended
2. **Enable Vector Search** - Required feature
3. **Create Vector Index** - Dimensions: 384, Similarity: cosine
4. **Create Keyword Index** - For hybrid search (optional)

### Recommended Indexes

```javascript
// Vector Index
{
  type: "vector",
  dimensions: 384,
  similarity: "cosine",
  field: "embedding"
}

// Keyword Index
{
  type: "text",
  field: "text",
  analyzer: "lucene.standard"
}

// Metadata Indexes
{}
metadata.source: 1
metadata.doc_id: 1
createdAt: -1 (with TTL: 7776000 = 90 days)
```

## 🧪 Testing

```bash
# Backend tests (placeholder)
cd backend
npm test

# Frontend tests (placeholder)
cd frontend
npm test
```

## 📝 API Examples

### Example 1: Basic Query

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How does transformers work?"
  }'
```

### Example 2: Upload & Query

```bash
# Step 1: Upload document
curl -X POST http://localhost:5000/api/upload \
  -F "file=@research_paper.pdf"

# Step 2: Ask question
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What were the key findings?",
    "topK": 3
  }'
```

### Example 3: Advanced Search

```bash
curl -X POST http://localhost:5000/api/chat/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "attention mechanism",
    "filters": {
      "fileType": "pdf"
    },
    "topK": 5
  }'
```

## 🔐 Security Considerations

- ✅ **Never commit .env files** - Use .env.example as template
- ✅ **API key rotation** - Regularly update Groq & HuggingFace keys
- ✅ **HTTPS in production** - Use SSL/TLS certificates
- ✅ **Rate limiting** - Implement API rate limits (future)
- ✅ **Authentication** - Add user auth for multi-user deployment
- ✅ **Input validation** - All endpoints validate input
- ✅ **Error handling** - Sensitive info not exposed in errors

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🎓 How It Works

### Vector Search

1. **Query Embedding** - Convert query to 384-dim vector
2. **Vector Index** - MongoDB finds most similar vectors
3. **Cosine Similarity** - Measures semantic closeness

### Hybrid Search

1. **Vector Search** - Get 5 semantic matches
2. **Keyword Search** - Get 5 keyword matches
3. **RRF Ranking** - Combine using reciprocal rank fusion
4. **Re-ranking** - Apply time decay, diversity, boosting

### RAG Pipeline

1. **Retrieval** - Fetch relevant documents via hybrid search
2. **Augmentation** - Include documents in system prompt
3. **Generation** - Groq LLM generates answer from context

## 📞 Support

- **Issues** - GitHub Issues
- **Discussions** - GitHub Discussions
- **Email** - contacted [provide contact if needed]

## 🎯 Roadmap

- [ ] User authentication & multi-user support
- [ ] Rate limiting & API quotas
- [ ] Advanced caching strategies
- [ ] Streaming responses
- [ ] Citation/source tracking
- [ ] Document versioning
- [ ] Web scraping integration
- [ ] Custom embeddings fine-tuning

## 📚 References

- [MongoDB Vector Search](https://docs.atlas.mongodb.com/atlas-vector-search/)
- [Groq API Docs](https://console.groq.com/docs)
- [HuggingFace Transformers](https://huggingface.co/docs/transformers)
- [Reciprocal Rank Fusion](https://en.wikipedia.org/wiki/Reciprocal_rank_fusion)

---

**Built with ❤️ for production-grade RAG systems**
