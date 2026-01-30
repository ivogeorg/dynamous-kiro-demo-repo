# Product Requirements Document - Kaldic

> AI-Powered Orthomosaic Feature Annotation for Engineering-Grade CAD Generation

**Version**: Demo Sprint (v0.1)
**Date**: 2026-01-30
**Status**: Planning Complete, Implementation Ready

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Mission](#mission)
3. [Target Users](#target-users)
4. [MVP Scope](#mvp-scope)
5. [User Stories](#user-stories)
6. [Core Architecture & Patterns](#core-architecture--patterns)
7. [Features](#features)
8. [Technology Stack](#technology-stack)
9. [Security & Configuration](#security--configuration)
10. [API Specification](#api-specification)
11. [Success Criteria](#success-criteria)
12. [Implementation Phases](#implementation-phases)
13. [Future Considerations](#future-considerations)
14. [Risks & Mitigations](#risks--mitigations)
15. [Appendix](#appendix)

---

## Executive Summary

Kaldic is a web-based application that dramatically accelerates the conversion of drone-captured orthomosaics into engineering-grade CAD files. The current manual process takes days to weeks and costs thousands of dollars. Kaldic uses state-of-the-art AI (Grounding DINO + SAM 2) to automatically detect and vectorize road features, reducing turnaround time by 10-20x.

The Demo Sprint focuses on proving the core concept: AI pre-annotates road features (centerlines and curbs) from a GeoTIFF orthomosaic, generates clean DXF vectors, and provides a web interface for human validation through feature selection and download. This demonstrates the "Human-in-the-Loop" paradigm where AI handles 80% of the work and humans validate the critical 20%.

**MVP Goal**: Demonstrate functional AI→CAD pipeline with road feature extraction in 24 hours, using mature technologies and pre-processed results to eliminate infrastructure complexity.

## Mission

**Product Mission**: Bridge the gap between drone imagery and engineering-grade CAD files through AI-powered automation and human validation.

**Core Principles**:
1. **Functional over Complete**: Prove the concept works end-to-end, even with limited scope
2. **Mature over Cutting-Edge**: Prioritize stability and documentation over novelty
3. **Demonstrable Value**: Focus on "showable" features that judges can see and verify
4. **Pragmatic Scope**: Reduce features ruthlessly to fit 24-hour constraint
5. **Clear Path to Production**: Design decisions enable V1 expansion without rewrites

## Target Users

### Primary Persona: CAD Technician
- **Role**: Converts drone imagery to CAD files for engineering firms
- **Technical Level**: Intermediate (comfortable with CAD software, basic GIS)
- **Pain Points**:
  - Manual tracing is tedious and time-consuming (days/weeks per project)
  - Accuracy requirements are high (engineering-grade, not approximate)
  - Existing auto-trace tools produce poor results (50-60% accuracy)
  - Need to work with multiple file formats (GeoTIFF, LAS, DXF)

### Secondary Persona: Engineering Project Manager
- **Role**: Oversees infrastructure projects, needs CAD deliverables
- **Technical Level**: Low (uses CAD files, doesn't create them)
- **Pain Points**:
  - Long turnaround times delay projects
  - High costs for manual CAD conversion
  - Quality inconsistency between technicians

**Key User Needs**:
- Fast turnaround (hours, not days)
- High accuracy (>90% for engineering use)
- Standard file formats (DXF that opens in AutoCAD/QGIS)
- Visual validation (see results overlaid on imagery)
- Simple workflow (upload → process → download)

## MVP Scope

### ✅ In Scope (Demo Sprint)

**Core Functionality**:
- ✅ Load and display Cloud-Optimized GeoTIFF (COG) orthomosaic
- ✅ Pan and zoom controls for imagery navigation
- ✅ AI-powered road feature detection (centerline + curb)
- ✅ Vectorization of detected features to CAD primitives
- ✅ DXF file generation with proper layers and styling
- ✅ Overlay DXF vectors on orthomosaic for visual validation
- ✅ Feature selection (click to highlight in map + DXF pane)
- ✅ DXF file download

**Technical**:
- ✅ React 18 + TypeScript + Vite frontend
- ✅ OpenLayers for web mapping
- ✅ geotiff.js for COG rendering
- ✅ FastAPI + PyTorch backend
- ✅ Grounding DINO + SAM 2 for detection/segmentation
- ✅ ezdxf for DXF generation
- ✅ Pre-processed results (no live inference for Demo)

**Integration**:
- ✅ Hardcoded demo dataset (no upload UI)
- ✅ Local deployment (frontend + backend on localhost)
- ✅ Git LFS for demo data

**Deployment**:
- ✅ Development environment setup
- ✅ README with clear setup instructions
- ✅ Pre-generated DXF committed to repo

### ❌ Out of Scope (Deferred to V1/V2)

**Core Functionality**:
- ❌ User authentication (hardcoded for Demo)
- ❌ File upload interface (hardcoded dataset)
- ❌ Point cloud integration (COPC/LAS rendering)
- ❌ Accept/Reject/Edit workflow (selection only)
- ❌ Additional feature types (manhole, building, fence, etc.)
- ❌ Iterative refinement (Redo, RedoRegion)
- ❌ Manual editing tools (draw, modify, snap)

**Technical**:
- ❌ Live ML inference (pre-processed for Demo)
- ❌ Supabase integration (local storage only)
- ❌ Real-time progress updates (WebSocket)
- ❌ Comprehensive error handling
- ❌ Performance optimization

**Integration**:
- ❌ Cloud deployment (Docker containers)
- ❌ GPU instance rental
- ❌ Database (PostgreSQL/PostGIS)
- ❌ CI/CD pipeline

**Deployment**:
- ❌ Production-ready infrastructure
- ❌ Monitoring and logging
- ❌ Automated testing suite

## User Stories

### Primary User Stories

**1. As a CAD technician, I want to see the orthomosaic imagery, so that I can understand the context of detected features**
- Load GeoTIFF file and display in web browser
- Pan and zoom to explore different areas
- High-quality rendering with proper georeferencing

**2. As a CAD technician, I want AI to detect road features automatically, so that I don't have to trace them manually**
- Grounding DINO detects road regions with text prompts
- SAM 2 segments features with high accuracy
- Results available within minutes (pre-processed for Demo)

**3. As a CAD technician, I want to see detected features overlaid on the imagery, so that I can visually validate accuracy**
- DXF vectors rendered on top of orthomosaic
- Different colors for different feature types (centerline=red, curb=blue)
- Proper coordinate alignment (vectors match imagery)

**4. As a CAD technician, I want to select individual features, so that I can inspect them closely**
- Click feature on map → highlights in both map and DXF pane
- See feature metadata (layer, type, ID)
- Visual feedback (highlight color, selection state)

**5. As a CAD technician, I want to download the DXF file, so that I can use it in my CAD software**
- Download button appears when feature selected
- DXF file downloads to local machine
- File opens in AutoCAD/QGIS without errors

### Technical User Stories

**6. As a developer, I want a mature technology stack, so that I can find documentation and avoid edge cases**
- React 18 (not 19), Vite (not Bun), FastAPI (not experimental)
- Extensive Stack Overflow answers and community support
- Stable APIs with backward compatibility

**7. As a developer, I want pre-processed results, so that I don't need to rent expensive GPU infrastructure**
- Run ML pipeline once on local GPU (RTX 5090)
- Commit DXF to repo via Git LFS
- Backend serves cached results (no live inference)

**8. As a judge, I want instant demo setup, so that I can evaluate the project quickly**
- Clone repo → npm install → npm run dev
- No GPU required, no cloud setup, no configuration
- See results in 2 minutes

## Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  OpenLayers    │  │   DXF Pane     │  │  Controls    │  │
│  │  Map + COG     │  │  Feature List  │  │  Download    │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Grounding     │  │     SAM 2      │  │ Vectorization│  │
│  │  DINO          │→ │  Segmentation  │→ │ + DXF Gen    │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Pre-generated   │
                    │  DXF File        │
                    │  (committed)     │
                    └──────────────────┘
```

### Directory Structure

```
kaldic/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/           # OpenLayers, COG, DXF utilities
│   │   ├── store/         # Zustand state management
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── main.py            # FastAPI app
│   ├── process.py         # ML pipeline
│   ├── vectorize.py       # Mask → CAD
│   └── requirements.txt
├── data/
│   └── demo.tif           # Hardcoded orthomosaic
├── .kiro/
│   ├── features/          # Feature specifications
│   ├── steering/          # Project context
│   └── DEVLOG.md
├── features.json          # Dependency graph
└── README.md
```

### Key Design Patterns

**1. Thick Client Architecture**
- Frontend handles COG streaming (HTTP Range Requests)
- WebGL rendering for performance
- Minimal backend API surface

**2. Pre-Processed Results Pattern**
- ML pipeline runs once offline
- Results committed to repo
- Backend serves cached data
- Eliminates infrastructure complexity

**3. Flat Dependency Graph**
- features.json stores flat graph with explicit edges
- Easy to query and reshuffle
- Compatible with @next command for intelligent selection

**4. EARS Requirements Format**
- "When/While/If [trigger], system shall [response]"
- Eliminates ambiguity
- Makes features testable

## Features

### Feature Breakdown (12 Total)

**Phase 1: Foundation** (2 features)
1. **infra-dev-setup-00001**: Development environment (Vite, React, FastAPI, PyTorch)
2. **ui-main-page-00001**: Single-page app with map container + DXF pane

**Phase 2: Visualization** (3 features)
3. **ui-map-init-00001**: OpenLayers map initialization
4. **ui-cog-render-00001**: COG rendering with geotiff.js + WebGL
5. **ui-pan-zoom-00001**: Pan and zoom controls

**Phase 3: Backend ML** (3 features)
6. **ml-dino-sam2-setup-00001**: Grounding DINO + SAM 2 integration
7. **ml-road-centerline-00001**: Road centerline detection
8. **ml-road-curb-00001**: Road curb detection

**Phase 4: Geometrization** (2 features)
9. **geom-vectorize-roads-00001**: Mask → line/polyline primitives
10. **geom-dxf-generate-00001**: DXF file generation with ezdxf

**Phase 5: Integration & UI** (2 features)
11. **ui-dxf-overlay-00001**: Render DXF on map + populate DXF pane
12. **ui-feature-select-00001**: Click → highlight + download

**Critical Path**: 1 → 2 → 3 → 4 → 6 → 7 → 9 → 10 → 11 → 12

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework (stable, not 19) |
| TypeScript | 5.3+ | Type safety |
| Vite | 5.x | Build tool (fast HMR) |
| OpenLayers | 10.6 | Web mapping |
| geotiff.js | 2.1 | COG rendering |
| dxf-parser | latest | DXF parsing |
| Zustand | 4.5 | State management |
| TailwindCSS | 3.4 | Styling |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Language |
| FastAPI | 0.110+ | API framework |
| PyTorch | 2.2+ | Deep learning |
| Transformers | 4.38 | Hugging Face models |
| Grounding DINO | latest | Object detection |
| SAM 2 | latest | Segmentation |
| OpenCV | 4.9 | Image processing |
| ezdxf | 1.2 | DXF generation |
| rasterio | 1.3 | Geospatial I/O |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Git LFS | Large file storage (demo.tif) |
| Docker | Containerization (V1) |
| Supabase | Storage + Auth (V1) |

## Security & Configuration

### Authentication (Demo)
- **Approach**: Hardcoded (no auth for Demo)
- **V1**: Supabase Auth with JWT tokens

### Configuration Management
- **Frontend**: Environment variables via Vite (.env files)
- **Backend**: Python config.py with defaults
- **Secrets**: None for Demo (no API keys needed)

### Security Scope

**In Scope (Demo)**:
- ✅ CORS configuration for localhost
- ✅ Input validation (file paths)

**Out of Scope (Demo)**:
- ❌ User authentication
- ❌ Authorization/permissions
- ❌ Rate limiting
- ❌ Encryption at rest/transit
- ❌ SQL injection prevention (no database)

### Deployment Considerations

**Demo**: Local deployment only (localhost:5173 + localhost:8000)
**V1**: Cloud deployment with Docker + AWS ECS + Supabase

## API Specification

### Endpoints (Demo)

**1. GET /health**
- **Purpose**: Health check
- **Response**: `{"status": "ok"}`

**2. GET /api/dxf**
- **Purpose**: Retrieve pre-generated DXF data
- **Response**: JSON representation of DXF file
- **Example**:
```json
{
  "features": [
    {
      "id": "road-centerline-001",
      "layer": "ROAD_CENTERLINE",
      "type": "LWPOLYLINE",
      "coordinates": [[x1, y1], [x2, y2], ...],
      "style": {"color": "red", "lineweight": 0.5}
    }
  ]
}
```

**3. GET /api/dxf/download**
- **Purpose**: Download DXF file
- **Response**: Binary DXF file
- **Headers**: `Content-Disposition: attachment; filename="kaldic-demo.dxf"`

### Authentication
- **Demo**: None (open endpoints)
- **V1**: JWT Bearer token in Authorization header

## Success Criteria

### MVP Success Definition
The Demo is successful if judges can:
1. Clone repo and run with minimal setup (<5 minutes)
2. See orthomosaic displayed in browser
3. See AI-detected road features overlaid
4. Click features and see highlighting
5. Download DXF and open in CAD software
6. Verify vectors are clean and properly georeferenced

### Functional Requirements

**Core Functionality**:
- ✅ Orthomosaic loads and displays correctly
- ✅ Pan and zoom work smoothly (60 FPS)
- ✅ AI-detected features overlay on imagery
- ✅ Feature selection highlights in map + DXF pane
- ✅ DXF download works
- ✅ DXF opens in AutoCAD/QGIS without errors
- ✅ Features on correct layers (ROAD_CENTERLINE, ROAD_CURB)
- ✅ Coordinates match orthomosaic (georeferenced)

**Quality Indicators**:
- ✅ No console errors on page load
- ✅ Responsive UI (no freezing during pan/zoom)
- ✅ Clean code (TypeScript strict mode, no linting errors)
- ✅ Comprehensive documentation (README, DEVLOG, feature specs)

**User Experience Goals**:
- ✅ Intuitive interface (no training needed)
- ✅ Instant feedback (selection highlights immediately)
- ✅ Clear visual hierarchy (map + DXF pane layout)
- ✅ Professional appearance (TailwindCSS styling)

## Implementation Phases

### Phase 1: Foundation (2-3 hours)
**Goal**: Set up development environment and basic UI structure

**Deliverables**:
- ✅ Vite + React 18 + TypeScript configured
- ✅ FastAPI backend with health check endpoint
- ✅ Single-page app with map container + DXF pane
- ✅ CORS configured for local development

**Validation**:
- `npm run dev` starts frontend without errors
- `python backend/main.py` starts backend without errors
- Browser shows split layout (map + DXF pane)

### Phase 2: Visualization (3-4 hours)
**Goal**: Display orthomosaic with pan/zoom controls

**Deliverables**:
- ✅ OpenLayers map initialized
- ✅ COG rendering with geotiff.js
- ✅ WebGL layer for GPU acceleration
- ✅ Pan and zoom interactions enabled

**Validation**:
- Orthomosaic displays at correct location
- Pan by dragging works smoothly
- Zoom with mouse wheel works
- Performance is acceptable (no lag)

### Phase 3: Backend ML (5-6 hours)
**Goal**: Run ML pipeline to generate DXF (one-time, offline)

**Deliverables**:
- ✅ Grounding DINO + SAM 2 models loaded
- ✅ Road centerline detection working
- ✅ Road curb detection working
- ✅ Masks converted to line primitives
- ✅ DXF file generated and committed

**Validation**:
- Models load without OOM errors
- Detection produces reasonable masks
- Vectorization creates clean lines
- DXF opens in CAD software

### Phase 4: Integration & Polish (3-4 hours)
**Goal**: Connect frontend to backend, enable selection, polish UI

**Deliverables**:
- ✅ DXF overlay rendered on map
- ✅ DXF pane populated with feature list
- ✅ Feature selection working (click → highlight)
- ✅ Download button functional
- ✅ UI polished with TailwindCSS

**Validation**:
- Click feature → highlights in map + DXF pane
- Download button downloads DXF file
- UI looks professional
- All features work end-to-end

**Total Estimated Time**: 15-19 hours (fits 24h with 5h buffer)

## Future Considerations

### Post-MVP Enhancements (V1)

**User Management**:
- Supabase authentication (email/password)
- User profiles and project history
- Multi-user collaboration

**File Upload**:
- Drag-and-drop interface for GeoTIFF + LAS
- File validation and pairing
- Progress indicators

**Point Cloud Integration**:
- COPC rendering with copc.js
- Z-extraction for 2.5D/3D CAD
- Point cloud overlay on map

**Accept/Reject/Edit Workflow**:
- Accept button (mark feature as approved)
- Reject button (delete feature)
- Edit tools (modify vertices, split/merge)
- Redo/RedoRegion (re-run AI on selected area)

**Additional Feature Types**:
- Road gutter
- Manhole
- Building (roof)
- Fence
- Tree
- Light/electric pole
- Overhead power line
- Parking lot + stripes

### Integration Opportunities (V2)

**Multi-Agentic Self-Improvement**:
- Critic agents validate geometries
- Physics-based constraints (catenary curves, orthogonality)
- Iterative refinement loop

**RLHF (Reinforcement Learning from Human Feedback)**:
- Learn from user Accept/Reject actions
- Fine-tune models on domain-specific data
- Improve accuracy over time

**3D CAD Primitives**:
- Full 3D vectors (not just 2.5D)
- Building heights from point cloud
- Volumetric features

**Real-Time Collaboration**:
- Multiple users editing same project
- WebSocket for live updates
- Conflict resolution

## Risks & Mitigations

### Risk 1: SAM 2 VRAM Requirements (40GB+)
**Impact**: High - Cannot run on available hardware (RTX 5090 = 24GB)
**Mitigation**: 
- Pre-process results offline with aggressive memory management
- Commit DXF to repo, serve cached results
- Eliminates GPU rental cost and OOM risk
**Status**: Mitigated ✅

### Risk 2: 24-Hour Time Constraint
**Impact**: High - Cannot implement all planned features
**Mitigation**:
- Ruthless scope reduction (34 → 12 features)
- Focus on "showable" features (visual results)
- Pre-process ML pipeline (saves 6+ hours)
- Mature technology stack (minimize debugging)
**Status**: Mitigated ✅

### Risk 3: Frontend Development Inexperience
**Impact**: Medium - Slower implementation, more debugging
**Mitigation**:
- Choose most mature stack (React 18, Vite, OpenLayers)
- Prioritize extensive documentation over new features
- Use "boring technology" with Stack Overflow answers
- Detailed feature specifications with implementation guidance
**Status**: Mitigated ✅

### Risk 4: Coordinate System Alignment
**Impact**: Medium - DXF vectors might not align with orthomosaic
**Mitigation**:
- Use rasterio for proper geospatial transformations
- Test alignment early in Phase 3
- Document CRS in demo dataset README
**Status**: Monitoring 🟡

### Risk 5: DXF Compatibility Issues
**Impact**: Low - DXF might not open in all CAD software
**Mitigation**:
- Use ezdxf (mature, well-tested library)
- Test with AutoCAD and QGIS
- Follow DXF R2018 specification
**Status**: Low risk 🟢

## Appendix

### Related Documents
- [DEVLOG.md](.kiro/DEVLOG.md) - Development timeline and decisions
- [features.json](features.json) - Feature dependency graph
- [README.md](README.md) - Project overview and setup instructions
- [tech.md](.kiro/steering/tech.md) - Technology stack details
- [structure.md](.kiro/steering/structure.md) - Project structure

### Key Dependencies
- [OpenLayers Documentation](https://openlayers.org/en/latest/apidoc/)
- [geotiff.js GitHub](https://github.com/geotiffjs/geotiff.js)
- [Grounding DINO Paper](https://arxiv.org/abs/2303.05499)
- [SAM 2 Paper](https://arxiv.org/abs/2408.00714)
- [ezdxf Documentation](https://ezdxf.readthedocs.io/)

### Repository Structure
```
kaldic/
├── frontend/          # React + TypeScript + OpenLayers
├── backend/           # FastAPI + PyTorch
├── data/              # Demo dataset (Git LFS)
├── .kiro/             # Kiro CLI workflow
│   ├── features/      # Feature specifications
│   ├── steering/      # Project context
│   ├── prompts/       # Custom commands
│   └── DEVLOG.md      # Development log
├── features.json      # Dependency graph
├── README.md          # Project documentation
└── PRD.md             # This document
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-30
**Status**: Approved for Implementation
