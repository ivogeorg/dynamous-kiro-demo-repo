---
id: infra-dev-setup-00001
name: Development Environment Setup
version: Demo
moscow: Must-have
status: not-started
started_date: null
completed_date: null
---

# Development Environment Setup

**ID**: infra-dev-setup-00001
**Version**: Demo
**Priority**: Must-have
**Status**: not-started

## Description (EARS Format)

When the developer initializes the project, the system shall provide a complete development environment with Vite, React 18, TypeScript, and FastAPI configured and ready for development.

## Context

This is the foundational feature that sets up the entire development stack. The choice of mature technologies (React 18, not 19; Vite 5.x; Python 3.11+) prioritizes stability and extensive documentation over cutting-edge features. This is critical for a 24-hour sprint where debugging time must be minimized.

## Dependencies

None - this is the root feature.

## Implementation Guidance

### Architecture

**Frontend Stack:**
- Vite 5.x as build tool (faster than webpack, simpler than Next.js)
- React 18.3 (stable, not 19 - avoid bleeding edge)
- TypeScript 5.3+ with strict mode
- OpenLayers 10.x for mapping
- geotiff.js for COG rendering

**Backend Stack:**
- Python 3.11+ (stable, excellent ML ecosystem)
- FastAPI 0.110+ (async, auto-docs, mature)
- PyTorch 2.2+ (industry standard)
- Transformers (Hugging Face) for models
- ezdxf for DXF generation

### Technology Stack

**Frontend Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "ol": "^10.6.0",
    "geotiff": "^2.1.3",
    "zustand": "^4.5.0",
    "@radix-ui/react-select": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.3.0",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0"
  }
}
```

**Backend Dependencies (requirements.txt):**
```
fastapi==0.110.0
uvicorn[standard]==0.27.0
torch==2.2.0
transformers==4.38.0
opencv-python==4.9.0
numpy==1.26.0
rasterio==1.3.9
ezdxf==1.2.0
python-multipart==0.0.9
```

### Key Considerations

- **CORS Configuration**: Frontend runs on :5173, backend on :8000 - configure CORS properly
- **VRAM Requirements**: Backend needs GPU with 40GB+ VRAM for SAM 2
- **Path Aliases**: Configure TypeScript paths for clean imports (`@/components`, `@/lib`)
- **Hot Reload**: Ensure both frontend (Vite HMR) and backend (uvicorn --reload) support hot reload

## Tasks Breakdown

### Must-Have Tasks
- [ ] **task-001**: Initialize Vite project with React 18 and TypeScript template
- [ ] **task-002**: Configure TypeScript with strict mode and path aliases
- [ ] **task-003**: Set up FastAPI backend with Python 3.11+ virtual environment
- [ ] **task-004**: Install core dependencies (OpenLayers, geotiff.js, PyTorch, Transformers)
- [ ] **task-005**: Configure CORS for local development

## Validation Checklist

### Automated Validation
- [ ] `npm run dev` starts frontend without errors
- [ ] `python backend/main.py` starts backend without errors
- [ ] TypeScript compilation passes (`tsc --noEmit`)
- [ ] Backend health check endpoint responds (GET /health)
- [ ] CORS allows frontend to call backend

### Manual Validation
- [ ] Hot reload works on frontend (edit component, see change)
- [ ] Hot reload works on backend (edit endpoint, see change)
- [ ] Browser console shows no errors on page load
- [ ] Backend logs show successful model loading (or placeholder)

## Testable Outcome

Both frontend and backend start without errors, hot reload works, CORS configured, ready for feature development.

## Design Source

**Document**: A-Human-in-the-Loop-Framework-for-AI-Generated-CAD-Correction.md
**Section**: Section 2: Architectural Foundations and Library Selection
**Related Research**: OpenLayers documentation, Vite documentation, FastAPI documentation

---

## Notes

**Frontend Setup (Non-Interactive):**
```bash
# Option 1: Use npm init with -y flag
cd frontend
npm init -y
npm install vite@latest @vitejs/plugin-react@latest --save-dev
npm install react@^18.3.1 react-dom@^18.3.1
npm install --save-dev typescript @types/react @types/react-dom

# Create vite.config.ts, tsconfig.json, index.html, src/main.tsx manually
# OR Option 2: Initialize outside and move files
cd ..
npm create vite@latest temp-frontend -- --template react-ts
mv temp-frontend/* frontend/
mv temp-frontend/.* frontend/ 2>/dev/null || true
rm -rf temp-frontend
```

**Recommended Approach (Cleanest):**
Since `frontend/` directory already exists with subdirectories, manually create the Vite config files:
1. Create `package.json` with dependencies
2. Create `vite.config.ts` with React plugin
3. Create `tsconfig.json` with path aliases
4. Create `index.html` entry point
5. Create `src/main.tsx` and `src/App.tsx`
6. Run `npm install`

This avoids interactive prompts and directory conflicts.

**Backend Structure:**
- `backend/main.py` (FastAPI app)
- `backend/process.py` (ML pipeline)
- `backend/models/` (model loading)

**Development Tip:**
Consider using `concurrently` package to run both frontend and backend with single command for judges:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && python main.py"
  }
}
```
