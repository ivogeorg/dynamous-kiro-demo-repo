# Project Structure

## Directory Layout

```
kaldic/
├── frontend/                 # React + TypeScript + OpenLayers
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Map.tsx      # OpenLayers map component
│   │   │   ├── DXFPane.tsx  # DXF feature list pane
│   │   │   └── ...
│   │   ├── lib/             # Utility libraries
│   │   │   ├── map.ts       # OpenLayers initialization
│   │   │   ├── cog.ts       # COG rendering utilities
│   │   │   └── dxf.ts       # DXF parsing utilities
│   │   ├── store/           # Zustand state management
│   │   │   └── appStore.ts  # Global application state
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite build configuration
│   └── tailwind.config.js   # TailwindCSS configuration
│
├── backend/                  # FastAPI + PyTorch
│   ├── main.py              # FastAPI application entry point
│   ├── process.py           # ML pipeline (Grounding DINO + SAM 2)
│   ├── vectorize.py         # Mask → CAD conversion
│   ├── models/              # Model loading and management
│   │   ├── dino.py          # Grounding DINO wrapper
│   │   ├── sam2.py          # SAM 2 wrapper
│   │   └── memory.py        # Memory management for SAM 2
│   ├── utils/               # Utility functions
│   │   ├── geospatial.py    # Coordinate transformations
│   │   └── dxf_gen.py       # DXF generation with ezdxf
│   ├── requirements.txt     # Python dependencies
│   └── config.py            # Configuration settings
│
├── data/                     # Demo dataset
│   ├── demo.tif             # Orthomosaic (Cloud-Optimized GeoTIFF)
│   ├── demo.tif.aux.xml     # GeoTIFF metadata
│   └── README.md            # Dataset information (source, CRS, extent)
│
├── .kiro/                    # Kiro CLI workflow
│   ├── features/            # Individual feature specifications
│   │   ├── infra-dev-setup-00001.md
│   │   ├── ui-map-init-00001.md
│   │   └── ...
│   ├── steering/            # Project context documents
│   │   ├── product.md       # Product overview and requirements
│   │   ├── tech.md          # Technology stack and architecture
│   │   └── structure.md     # This file
│   ├── design/              # Research and design documents
│   │   ├── A-Human-in-the-Loop-Framework-for-AI-Generated-CAD-Correction.md
│   │   └── A-Hybrid-AI-Geometric-Pipeline-for-Automated-Geospatial-Feature-Extraction-and-Vectorization.md
│   ├── prompts/             # Custom Kiro commands
│   │   ├── design-digest.md
│   │   ├── devlog-update.md
│   │   ├── next.md
│   │   └── ...
│   └── DEVLOG.md            # Development log
│
├── features.json             # Feature dependency graph
├── README.md                 # Project documentation
├── LICENSE                   # MIT License
└── .gitignore               # Git ignore patterns
```

## File Naming Conventions

### Frontend (TypeScript/React)
- **Components**: PascalCase (e.g., `Map.tsx`, `DXFPane.tsx`)
- **Utilities**: camelCase (e.g., `map.ts`, `cog.ts`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `Feature.types.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `appStore.ts`)

### Backend (Python)
- **Modules**: snake_case (e.g., `process.py`, `vectorize.py`)
- **Classes**: PascalCase (e.g., `GroundingDINO`, `SAM2Model`)
- **Functions**: snake_case (e.g., `load_model()`, `process_image()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_VRAM_GB`, `TILE_SIZE`)

### Features (Kiro CLI)
- **Feature IDs**: `[major-section]-[detail]-[ddddd]` (e.g., `ui-map-init-00001`)
- **Feature Files**: `[feature-id].md` (e.g., `ui-map-init-00001.md`)

## Module Organization

### Frontend Modules

**`src/components/`** - React UI components
- Organized by feature/domain
- Each component in its own file
- Co-locate component-specific styles if needed

**`src/lib/`** - Reusable utilities and integrations
- OpenLayers map initialization and configuration
- COG rendering with geotiff.js
- DXF parsing with dxf-parser
- Geospatial coordinate transformations

**`src/store/`** - Zustand state management
- Single global store for application state
- Slices for different domains (map, features, ui)

**`src/types/`** - TypeScript type definitions
- Shared types across components
- API response types
- Domain models

### Backend Modules

**`models/`** - ML model wrappers
- Encapsulate model loading and inference
- Handle VRAM management
- Provide clean interfaces for pipeline

**`utils/`** - Utility functions
- Geospatial transformations (pixel ↔ world coordinates)
- DXF generation with ezdxf
- Image processing helpers

**Root level** - Core pipeline files
- `main.py`: FastAPI application and endpoints
- `process.py`: ML pipeline orchestration
- `vectorize.py`: Mask to CAD conversion

## Configuration Files

### Frontend Configuration
- **`package.json`**: Dependencies, scripts, project metadata
- **`tsconfig.json`**: TypeScript compiler options, path aliases
- **`vite.config.ts`**: Build configuration, dev server, plugins
- **`tailwind.config.js`**: TailwindCSS theme and utilities

### Backend Configuration
- **`requirements.txt`**: Python dependencies with versions
- **`config.py`**: Application settings (VRAM limits, tile sizes, etc.)

### Kiro CLI Configuration
- **`features.json`**: Feature dependency graph
- **`.kiro/steering/`**: Project context documents
- **`.kiro/prompts/`**: Custom command definitions

## Documentation Structure

### Project-Level Documentation
- **`README.md`**: Quick start, architecture overview, demo instructions
- **`LICENSE`**: MIT License
- **`.kiro/DEVLOG.md`**: Development timeline and decisions

### Feature Documentation
- **`.kiro/features/[feature-id].md`**: Detailed feature specifications
  - Context and rationale
  - Implementation guidance
  - Task breakdown
  - Validation checklist

### Design Documentation
- **`.kiro/design/`**: Research papers and architectural designs
  - Frontend architecture (Human-in-the-Loop Framework)
  - Backend ML pipeline (Hybrid AI-Geometric Pipeline)

## Asset Organization

### Frontend Assets
- **`frontend/public/`**: Static assets (favicon, images)
- **`data/`**: Demo dataset (GeoTIFF files)

### Backend Assets
- **Model weights**: Downloaded on first run, cached locally
- **Processed results**: Stored in `backend/output/` (gitignored)

## Build Artifacts

### Frontend Build
- **`frontend/dist/`**: Production build output (gitignored)
- **`frontend/node_modules/`**: Dependencies (gitignored)

### Backend Build
- **`backend/venv/`**: Python virtual environment (gitignored)
- **`backend/__pycache__/`**: Python bytecode (gitignored)
- **`backend/output/`**: Generated DXF files (gitignored)

## Environment-Specific Files

### Development
- **`.env.development`**: Frontend dev environment variables
- **`backend/.env`**: Backend configuration (API keys, paths)

### Production (V1)
- **`.env.production`**: Frontend production environment variables
- **`docker-compose.yml`**: Multi-container orchestration
- **`Dockerfile.frontend`**: Frontend container
- **`Dockerfile.backend`**: Backend container

## Git Configuration

### `.gitignore` Patterns
```
# Dependencies
node_modules/
venv/
__pycache__/

# Build artifacts
dist/
build/
*.pyc

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Output
backend/output/
*.dxf

# Model cache (large files)
backend/models/cache/
```

### Git LFS (Large File Storage)
```
# .gitattributes
data/*.tif filter=lfs diff=lfs merge=lfs -text
data/*.las filter=lfs diff=lfs merge=lfs -text
```

## Import Conventions

### Frontend (TypeScript)
```typescript
// Absolute imports with path aliases
import { Map } from '@/components/Map';
import { initMap } from '@/lib/map';
import { useAppStore } from '@/store/appStore';
import type { Feature } from '@/types/Feature.types';
```

### Backend (Python)
```python
# Relative imports within backend
from models.dino import GroundingDINO
from models.sam2 import SAM2Model
from utils.geospatial import pixel_to_world
from utils.dxf_gen import generate_dxf
```

## Notes

- Frontend uses Vite's path alias feature (`@/` → `src/`)
- Backend uses Python's relative imports (no path manipulation needed)
- Feature files follow EARS format for requirements
- All configuration is centralized in respective config files
- Demo dataset included via Git LFS for reproducibility

