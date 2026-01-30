# Implementation Plan: Development Environment Setup

**Feature ID**: infra-dev-setup-00001
**Priority**: Must-have (Demo)
**Estimated Time**: 1.5-2 hours

## Objective

Set up complete development environment with Vite + React 18 + TypeScript frontend and FastAPI + Python 3.11+ backend, configured for local development with hot reload and CORS.

## Prerequisites

- Node.js 18+ and npm 9+
- Python 3.11+
- Git

## Implementation Steps

### Phase 1: Frontend Setup (45 min)

#### Step 1.1: Create Vite + React + TypeScript Project

```bash
# Create package.json
cat > frontend/package.json << 'EOF'
{
  "name": "kaldic-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "ol": "^10.6.0",
    "geotiff": "^2.1.3",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.3.0",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
EOF

# Install dependencies
cd frontend
npm install
cd ..
```

#### Step 1.2: Configure Vite

```bash
cat > frontend/vite.config.ts << 'EOF'
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
EOF
```

#### Step 1.3: Configure TypeScript

```bash
cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat > frontend/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

#### Step 1.4: Create Entry Point and Basic App

```bash
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kaldic - AI-Powered Orthomosaic Annotation</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > frontend/src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat > frontend/src/App.tsx << 'EOF'
import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Kaldic
        </h1>
        <p className="text-xl text-gray-600">
          AI-Powered Orthomosaic Feature Annotation
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Development environment ready ✓
        </p>
      </div>
    </div>
  )
}

export default App
EOF

cat > frontend/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF
```

#### Step 1.5: Configure TailwindCSS

```bash
cat > frontend/tailwind.config.js << 'EOF'
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
EOF

cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
```

### Phase 2: Backend Setup (45 min)

#### Step 2.1: Create Python Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Step 2.2: Create Requirements File

```bash
cat > requirements.txt << 'EOF'
fastapi==0.110.0
uvicorn[standard]==0.27.0
python-multipart==0.0.9
pydantic==2.6.0
pydantic-settings==2.1.0

# ML dependencies (optional for now, will install when needed)
# torch==2.2.0
# transformers==4.38.0
# opencv-python==4.9.0

# Geospatial
rasterio==1.3.9
numpy==1.26.0

# DXF generation
ezdxf==1.2.0
EOF

pip install -r requirements.txt
```

#### Step 2.3: Create FastAPI Application

```bash
cat > main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Kaldic API",
    description="AI-Powered Orthomosaic Feature Annotation Backend",
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
    return {
        "message": "Kaldic API",
        "version": "0.1.0",
        "status": "ready"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "frontend_cors": "enabled",
        "ml_models": "not_loaded"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
EOF
```

#### Step 2.4: Create Placeholder Module Files

```bash
# Create __init__.py files
touch models/__init__.py
touch utils/__init__.py

# Create placeholder files
cat > models/.gitkeep << 'EOF'
# Model loading utilities will go here
EOF

cat > utils/.gitkeep << 'EOF'
# Utility functions will go here
EOF
```

### Phase 3: Integration & Validation (15 min)

#### Step 3.1: Test Frontend

```bash
cd frontend
npm run dev
# Should start on http://localhost:5173
# Open browser and verify page loads
```

#### Step 3.2: Test Backend

```bash
cd backend
source venv/bin/activate
python main.py
# Should start on http://localhost:8000
# Visit http://localhost:8000/docs for API docs
```

#### Step 3.3: Test CORS

```bash
# In browser console (with frontend running):
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
# Should return health status without CORS error
```

#### Step 3.4: Create Root-Level Scripts (Optional)

```bash
# Create convenience script at project root
cat > package.json << 'EOF'
{
  "name": "kaldic",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && source venv/bin/activate && python main.py",
    "install:frontend": "cd frontend && npm install",
    "install:backend": "cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  }
}
EOF
```

## Validation Checklist

- [ ] Frontend starts on :5173 without errors
- [ ] Backend starts on :8000 without errors
- [ ] Frontend displays "Development environment ready ✓"
- [ ] Backend /health endpoint returns 200
- [ ] Backend /docs shows FastAPI documentation
- [ ] CORS allows frontend → backend requests
- [ ] Hot reload works (edit App.tsx, see change)
- [ ] TypeScript compilation passes (`cd frontend && npx tsc --noEmit`)

## Success Criteria

1. Both servers start without errors
2. Frontend displays welcome page
3. Backend API docs accessible
4. CORS configured correctly
5. Hot reload functional on both sides

## Troubleshooting

**Frontend won't start:**
- Check Node.js version: `node --version` (should be 18+)
- Delete `node_modules` and `package-lock.json`, run `npm install` again
- Check for port conflicts on :5173

**Backend won't start:**
- Check Python version: `python3 --version` (should be 3.11+)
- Ensure virtual environment activated: `which python` should show `venv/bin/python`
- Check for port conflicts on :8000

**CORS errors:**
- Verify backend CORS middleware includes `http://localhost:5173`
- Check browser console for specific CORS error
- Restart backend after CORS config changes

## Next Steps

After validation passes:
1. Update feature status to 'completed'
2. Commit changes: `git add . && git commit -m "feat: Complete development environment setup"`
3. Move to next feature: `ui-main-page-00001`
