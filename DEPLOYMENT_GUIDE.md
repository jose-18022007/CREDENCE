# Credence - Deployment Guide

## 🚀 Quick Push to GitHub

Your repository is already configured at: https://github.com/jose-18022007/CREDENCE.git

### Push Your Code

```bash
# Push all commits to GitHub
git push origin main

# If you encounter issues, force push (use with caution)
git push -f origin main
```

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

**Backend (.env files are in .gitignore - GOOD!)**
- ✅ `truthlens-backend/.env` - Contains your API keys (NOT pushed to GitHub)
- ✅ `truthlens-backend/.env.example` - Template for others (IS pushed to GitHub)

**Frontend (.env files are in .gitignore - GOOD!)**
- ✅ `Frontend/.env` - Contains your API keys (NOT pushed to GitHub)
- ✅ `Frontend/.env.example` - Template for others (IS pushed to GitHub)

### 2. Sensitive Data Check

These files should NOT be in your repo (they're gitignored):
- ❌ `.env` files with real API keys
- ❌ `node_modules/` folders
- ❌ `__pycache__/` folders
- ❌ `credence.db` (database file)
- ❌ `uploads/` and `outputs/` folders

### 3. API Keys to Update Before Deployment

**Backend (`truthlens-backend/.env`):**
```env
GEMINI_API_KEY=your_key_here
NEWSAPI_KEY=your_key_here  # Currently placeholder
GNEWS_API_KEY=your_key_here
HUGGINGFACE_API_KEY=your_key_here
```

**Frontend (`Frontend/.env`):**
```env
VITE_GEMINI_API_KEY=your_key_here
VITE_EMAILJS_SERVICE_ID=service_x5t6vxy
VITE_EMAILJS_TEMPLATE_ID=template_390ggkw
VITE_EMAILJS_PUBLIC_KEY=5QQACvSQe3-5qwT99
```

## 🌐 Deployment Options

### Option 1: Local Development (Current Setup)

**Backend:**
```bash
cd truthlens-backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev
```

### Option 2: Production Deployment

#### Backend (FastAPI)

**Recommended Platforms:**
- **Railway.app** (Easy, free tier)
- **Render.com** (Free tier available)
- **Heroku** (Paid)
- **AWS EC2** (Full control)

**Steps for Railway/Render:**
1. Connect your GitHub repo
2. Set root directory to `truthlens-backend`
3. Add environment variables in dashboard
4. Deploy command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Frontend (React + Vite)

**Recommended Platforms:**
- **Vercel** (Best for React, free)
- **Netlify** (Free tier)
- **GitHub Pages** (Free, static only)

**Steps for Vercel:**
1. Import GitHub repo
2. Set root directory to `Frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables in dashboard

### Option 3: Docker Deployment

**Backend Dockerfile** (create `truthlens-backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile** (create `Frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

**Docker Compose** (create `docker-compose.yml` in root):
```yaml
version: '3.8'
services:
  backend:
    build: ./truthlens-backend
    ports:
      - "8000:8000"
    env_file:
      - ./truthlens-backend/.env
    volumes:
      - ./truthlens-backend/uploads:/app/uploads
      - ./truthlens-backend/outputs:/app/outputs
  
  frontend:
    build: ./Frontend
    ports:
      - "5173:5173"
    env_file:
      - ./Frontend/.env
    depends_on:
      - backend
```

## 📝 README Updates

Make sure your README.md includes:
- ✅ Project description
- ✅ Features list
- ✅ Tech stack
- ✅ Installation instructions
- ✅ Environment variables setup
- ✅ API documentation
- ✅ Screenshots/demo
- ✅ License

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already configured in `.gitignore`
2. **Rotate API keys** before public deployment
3. **Use environment variables** for all sensitive data
4. **Enable CORS properly** in production
5. **Add rate limiting** to API endpoints
6. **Use HTTPS** in production

## 📊 Project Statistics

**Backend:**
- Python FastAPI
- 12+ AI/ML services
- SQLite database
- 5 analysis types (text, URL, image, video, audio)

**Frontend:**
- React + TypeScript
- Vite build tool
- 5 main pages
- Real-time analysis
- AI chatbot integration

## 🎯 Post-Deployment Tasks

1. **Test all features** in production
2. **Monitor API usage** and costs
3. **Set up error tracking** (Sentry, LogRocket)
4. **Add analytics** (Google Analytics, Plausible)
5. **Create user documentation**
6. **Set up CI/CD pipeline** (GitHub Actions)

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/jose-18022007/CREDENCE/issues
- Email: [Your contact email]

## 🎉 You're Ready!

Your code is production-ready. Just push and deploy!

```bash
git push origin main
```

Good luck with your deployment! 🚀
