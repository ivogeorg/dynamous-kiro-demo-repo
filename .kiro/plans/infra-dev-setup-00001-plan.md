# Implementation Plan: infra-dev-setup-00001

**Feature**: Development Environment Setup  
**Priority**: Must-have (Demo)  
**Complexity**: Medium  
**Estimated Time**: 2-3 hours  
**Dependencies**: None (foundational)

---

## Overview

Set up complete development environment with Vite + React 18 + TypeScript frontend and FastAPI + Python backend. Prioritize mature, stable technologies with extensive documentation to minimize debugging time during 24-hour sprint.

---

## Task Breakdown

### Task 1: Initialize Frontend (30 min)

**Objective**: Create Vite + React 18 + TypeScript project

**Commands**:
```bash
# Create Vite project with React TypeScript template
npm create vite@latest frontend -- --template react-ts

# Navigate and install dependencies
cd frontend
npm install

# Install core dependencies
npm install ol@^10.6.0 geotiff@^2.1.3 zustand@^4.5.0

# Install Radix UI and TailwindCSS
npm install @radix-ui/react-select@^2.0.0
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
npx tailwindcss init -p
```

**Validation**:
- `npm run dev` starts on http://localhost:5173
- Browser shows default Vite + React page
- No console errors

---

### Task 2: Configure TypeScript (20 min)

**Objective**: Enable strict mode and path aliases for clean imports

**Edit `frontend/tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Edit `frontend/vite.config.ts`**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

**Validation**:
- `npx tsc --noEmit` passes without errors
- Path alias `@/` works in imports

---

### Task 3: Configure TailwindCSS (15 min)

**Edit `frontend/tailwind.config.js`**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Edit `frontend/src/index.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Validation**:
- TailwindCSS classes work in components
- No CSS errors in console

---

### Task 4: Set Up Backend Structure (30 min)

**Objective**: Create FastAPI backend with Python 3.11+ virtual environment

**Commands**:
```bash
# Create virtual environment
cd backend
python3.11 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
# venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip
```

**Create `backend/requirements.txt`**:
```
fastapi==0.110.0
uvicorn[standard]==0.27.0
python-multipart==0.0.9
pydantic==2.6.0
pydantic-settings==2.1.0
```

**Install dependencies**:
```bash
pip install -r requirements.txt
```

**Validation**:
- Virtual environment activated
- All packages install without errors
- `python --version` shows 3.11+

---

### Task 5: Create FastAPI Application (30 min)

**Create `backend/main.py`**:
```python
"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Kaldic API",
    description="AI-powered orthomosaic feature annotation",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Kaldic API", "version": "0.1.0"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

**Create `backend/config.py`**:
```python
"""Configuration settings."""

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    
    app_name: str = "Kaldic"
    debug: bool = True
    api_prefix: str = "/api"
    
    # CORS
    cors_origins: list[str] = ["http://localhost:5173"]
    
    # Paths
    data_dir: str = "../data"
    models_dir: str = "./models"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

**Validation**:
- `python main.py` starts server on http://localhost:8000
- Visit http://localhost:8000 shows JSON response
- Visit http://localhost:8000/health shows `{"status": "healthy"}`
- Visit http://localhost:8000/docs shows FastAPI auto-docs

---

### Task 6: Test CORS Integration (20 min)

**Create `frontend/src/lib/api.ts`**:
```typescript
const API_BASE = 'http://localhost:8000';

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}
```

**Edit `frontend/src/App.tsx`**:
```tsx
import { useEffect, useState } from 'react'
import { healthCheck } from './lib/api'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('checking...')

  useEffect(() => {
    healthCheck()
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('error'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Kaldic Development Environment
        </h1>
        <p className="text-gray-600">
          API Status: <span className="font-semibold">{apiStatus}</span>
        </p>
      </div>
    </div>
  )
}

export default App
```

**Validation**:
- Start backend: `cd backend && python main.py`
- Start frontend: `cd frontend && npm run dev`
- Visit http://localhost:5173
- Page shows "API Status: healthy"
- No CORS errors in browser console

---

### Task 7: Create Directory Structure (10 min)

**Create empty directories with .gitkeep**:
```bash
# Frontend
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p frontend/src/store
mkdir -p frontend/src/types
touch frontend/src/components/.gitkeep
touch frontend/src/lib/.gitkeep
touch frontend/src/store/.gitkeep
touch frontend/src/types/.gitkeep

# Backend (already exists, verify)
ls backend/models/.gitkeep
ls backend/utils/.gitkeep
ls backend/scripts/demo/
```

**Validation**:
- All directories exist
- Structure matches `.kiro/steering/structure.md`

---

### Task 8: Add Development Scripts (10 min)

**Create `package.json` in project root**:
```json
{
  "name": "kaldic",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && source venv/bin/activate && python main.py"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**Install concurrently**:
```bash
npm install
```

**Validation**:
- `npm run dev` starts both frontend and backend
- Both services run concurrently
- Hot reload works on both

---

## Final Validation Checklist

### Automated Tests
- [ ] `cd frontend && npx tsc --noEmit` - TypeScript compiles
- [ ] `cd frontend && npm run dev` - Frontend starts on :5173
- [ ] `cd backend && python main.py` - Backend starts on :8000
- [ ] `curl http://localhost:8000/health` - Returns `{"status":"healthy"}`
- [ ] Frontend can fetch from backend (no CORS errors)

### Manual Tests
- [ ] Edit `frontend/src/App.tsx` → see changes immediately (HMR)
- [ ] Edit `backend/main.py` → server reloads automatically
- [ ] Browser console shows no errors
- [ ] FastAPI docs accessible at http://localhost:8000/docs
- [ ] TailwindCSS classes render correctly

### Structure Verification
- [ ] `frontend/src/components/` exists
- [ ] `frontend/src/lib/` exists
- [ ] `frontend/src/store/` exists
- [ ] `frontend/src/types/` exists
- [ ] `backend/models/` exists
- [ ] `backend/utils/` exists
- [ ] Path alias `@/` works in TypeScript

---

## Common Issues & Solutions

### Issue: CORS errors persist
**Solution**: Verify `allow_origins` in `backend/main.py` matches frontend URL exactly

### Issue: TypeScript path alias not working
**Solution**: Restart VS Code / TypeScript server, verify `tsconfig.json` and `vite.config.ts`

### Issue: Backend won't start (port in use)
**Solution**: Kill process on port 8000: `lsof -ti:8000 | xargs kill -9`

### Issue: Frontend won't start (port in use)
**Solution**: Kill process on port 5173: `lsof -ti:5173 | xargs kill -9`

### Issue: Python version mismatch
**Solution**: Use `python3.11` explicitly or install via `pyenv`

---

## Next Steps

After completing this feature:
1. Update status in `.kiro/features.json`: `"status": "completed"`
2. Run `@next` to see newly unblocked features
3. Recommended next: `ui-main-page-00001` (depends on this feature)

---

## Time Estimate Breakdown

| Task | Estimated Time |
|------|----------------|
| Initialize Frontend | 30 min |
| Configure TypeScript | 20 min |
| Configure TailwindCSS | 15 min |
| Set Up Backend | 30 min |
| Create FastAPI App | 30 min |
| Test CORS | 20 min |
| Directory Structure | 10 min |
| Development Scripts | 10 min |
| **Total** | **2h 45min** |

Add 15-30 min buffer for troubleshooting = **3 hours total**
