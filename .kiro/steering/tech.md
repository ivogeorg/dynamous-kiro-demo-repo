# Technical Architecture

## Technology Stack

### Frontend (Mature & Stable)
- **React 18.3** - UI framework (not 19 - prioritizing stability over cutting-edge)
- **TypeScript 5.3+** - Type safety and developer experience
- **Vite 5.x** - Build tool (fast HMR, simple configuration)
- **OpenLayers 10.6** - Web mapping library (best-in-class for CAD editing)
- **geotiff.js 2.1** - Cloud-Optimized GeoTIFF client-side rendering
- **dxf-parser** - DXF file parsing in browser
- **Zustand 4.5** - Lightweight state management
- **Radix UI** - Unstyled, accessible UI primitives
- **TailwindCSS 3.4** - Utility-first CSS framework

### Backend (Production-Ready)
- **Python 3.11+** - Language (stable, excellent ML ecosystem)
- **FastAPI 0.110+** - Modern async API framework with auto-docs
- **PyTorch 2.2+** - Deep learning framework
- **Transformers 4.38** - Hugging Face model library
- **Grounding DINO** - Open-set object detection (zero-shot)
- **SAM 2** - Segment Anything Model 2 (with memory)
- **OpenCV 4.9** - Computer vision and image processing
- **ezdxf 1.2** - DXF file generation and manipulation
- **rasterio 1.3** - Geospatial raster I/O
- **NumPy 1.26** - Numerical computing

### Infrastructure
- **Docker** - Containerization (not Podman - wider support)
- **Supabase** - Backend-as-a-Service (PostgreSQL + Storage + Auth)
- **AWS GPU Instance** - g5.xlarge or similar (40GB+ VRAM for SAM 2)

## Architecture Overview

### System Components

**Frontend (Thick Client)**:
- Single-page application (SPA) with React
- OpenLayers map engine for geospatial visualization
- Client-side COG streaming (HTTP Range Requests)
- WebGL-accelerated rendering for performance
- DXF parsing and visualization in browser

**Backend (ML Pipeline)**:
- FastAPI REST API server
- Grounding DINO for text-prompted object detection
- SAM 2 for segmentation with memory management
- OpenCV for geometric refinement and vectorization
- ezdxf for CAD file generation

**Data Flow**:
1. Frontend loads COG orthomosaic (streamed tiles)
2. Backend processes orthomosaic with Grounding DINO + SAM 2
3. Masks converted to CAD primitives (lines, polylines)
4. DXF file generated with proper layers and styling
5. Frontend overlays DXF vectors on orthomosaic
6. User selects features, downloads DXF

### Key Architectural Decisions

**1. Mature Technology Stack**
- Chose React 18 over 19 (more stable, wider ecosystem)
- Chose Vite over Bun (more mature, better docs)
- Chose FastAPI over experimental frameworks (production-ready)
- Rationale: 24-hour sprint requires stability over novelty

**2. OpenLayers for Mapping**
- Superior to Mapbox/Leaflet for CAD editing workflows
- Native support for arbitrary projections (proj4js integration)
- Robust vector interaction APIs (Draw, Modify, Snap)
- Direct feature access (not vector tiles)

**3. Client-Side COG Rendering**
- geotiff.js with Web Workers for tile decoding
- HTTP Range Requests for on-demand tile fetching
- WebGL rendering for GPU acceleration
- Handles multi-gigabyte files without full download

**4. SAM 2 Memory Management**
- Sliding window memory reset to prevent OOM
- Memory bank flushed after N frames
- Critical for processing large orthomosaics
- Trades some temporal consistency for stability

**5. 2D-Only for Demo**
- Deferred point cloud (COPC) integration to V1
- Simplified coordinate alignment (2D only)
- Faster implementation, still demonstrates core concept

## Development Environment

### Prerequisites
- Node.js 18+ and npm 9+
- Python 3.11+ with pip
- CUDA-capable GPU with 40GB+ VRAM (for backend)
- Git with LFS (for demo dataset)

### Setup
```bash
# Frontend
cd frontend
npm install
npm run dev  # Starts on :5173

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # Starts on :8000
```

### Development Tools
- **VS Code** - Recommended IDE
- **ESLint + Prettier** - Code formatting
- **TypeScript** - Type checking
- **Black** - Python code formatting
- **pytest** - Python testing
- **Vitest** - Frontend testing

## Code Standards

### Frontend
- **TypeScript strict mode** enabled
- **Functional components** with hooks (no class components)
- **Path aliases**: `@/components`, `@/lib`, `@/store`
- **Component structure**: One component per file
- **Naming**: PascalCase for components, camelCase for functions
- **Styling**: TailwindCSS utility classes, avoid inline styles

### Backend
- **PEP 8** style guide
- **Type hints** for all function signatures
- **Async/await** for I/O operations
- **FastAPI dependency injection** for shared resources
- **Pydantic models** for request/response validation
- **Docstrings**: Google style

## Testing Strategy

### Frontend Testing
- **Vitest** for unit tests
- **React Testing Library** for component tests
- **Playwright** for E2E tests (V1)
- **Coverage target**: 70%+ for critical paths

### Backend Testing
- **pytest** for unit and integration tests
- **pytest-asyncio** for async tests
- **httpx** for API testing
- **Coverage target**: 80%+ for ML pipeline

### Manual Testing
- Orthomosaic loads and renders correctly
- Pan/zoom performance is smooth
- AI detection produces reasonable results
- DXF file opens in CAD software without errors
- Feature selection and highlighting works

## Deployment Process

### Demo Deployment
- **Frontend**: Vite build → static files → serve locally
- **Backend**: Python script → runs on GPU instance
- **Dataset**: Included in repo via Git LFS

### V1 Deployment (Future)
- **Frontend**: Vercel or Netlify (static hosting)
- **Backend**: AWS ECS with GPU instances
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Storage**: AWS S3 for uploaded files
- **CI/CD**: GitHub Actions

## Performance Requirements

### Frontend
- **Initial load**: <3 seconds
- **COG tile load**: <500ms per tile
- **Pan/zoom**: 60 FPS
- **Feature selection**: <100ms response

### Backend
- **Model loading**: <3 minutes (one-time)
- **Grounding DINO inference**: <10 seconds per tile
- **SAM 2 segmentation**: <5 seconds per region
- **Vectorization**: <2 seconds per feature
- **DXF generation**: <1 second
- **Total pipeline**: <10 minutes for 6GB orthomosaic

### Resource Constraints
- **Frontend**: Runs in browser, no special requirements
- **Backend**: 40GB+ VRAM, 64GB+ RAM, 16+ CPU cores

## Security Considerations

### Demo Sprint
- **No authentication** (hardcoded for demo)
- **No file upload** (hardcoded dataset)
- **Local deployment** (no public exposure)

### V1 Security (Future)
- **Authentication**: Supabase Auth (JWT tokens)
- **Authorization**: Row-level security (RLS) in PostgreSQL
- **File upload**: Virus scanning, size limits, type validation
- **API**: Rate limiting, CORS configuration
- **Data**: Encryption at rest and in transit
- **Secrets**: Environment variables, never in code

