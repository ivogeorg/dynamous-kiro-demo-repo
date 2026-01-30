# Product Overview

## Name
Kaldic

## Product Purpose
A SaaS Web application which speeds up the feature annotation in orthomosaics and 3D point clouds resulting in drone mapping and the creationg of engineering-grade 2D and 3D CAD objects for these features. It offers an automatic pre-annotation phase powered by AI and a manual phase where the user can accept, correct, delete, or add the proposed annotations and CAD conversions. These phases can be iterated until the user is satisfied. The input to the app are a GeoTIFF or Cloud Optimized GeoTIFF (COG) file with an orthomosaic and a corresponding point cloud file which contains the photogrammetrically calculated vertical dimension or LIDAR data in LAS or LAZ format. The input files are usually generated from drone-mapping imagery by a program like Agisoft Metashape. The output of the app is a DXF file, containing all the accepted CAD-converted raster features, which can be opened by any CAD program for downstream tasks.

## Target Users
Any industry which works with CAD files generated from aerial imagery: construction, infrastructure monitoring, architecture, engineering, etc.

## Key Features
The manual or semi-manual vectorization of raster features into CAD primitives is a lengthy and laborious process. Kaldic is meant to reduce the turnaround time by using AI and manual post-processing, using industry standard input and output files. It acts as a rapid but lightweight bridge between the raster images of photogrammetric application and the vector-based images of CAD applications.

## Business Objectives
1. Reduce the time of vectorizing an orthomosaic by 10-20 times.
2. Increase the accuracy of existing auto-annotation applications from 50-60% to over 90%.
3. Reduce the cost of having orthomosaics converted to engineering-grade CAD files by 2 or more times.

## User Journey
The typical workflow consists of the following steps:
1. A user logs in, registering if using for the first time.
2. The user uploads an orthomosaic (GeoTIFF file) and corresponding 3D point cloud (LAS file). It's important that the two files are generated at the same time by the same program, so that the height data corresponds to the 2D coordinates of the orthomosaic pixels.
3. The orthomosaic (or a small window of it, if too big) is displayed on the page along with an empty DXF column pane. The files are downloaded to the backend server.
4. The server performs a multi-agentic auto-annotation of orthomosaic features and populates a DXF file with the corresponding CAD objects, using 2D or 3D CAD primitives, depending on the kind of job. The first itearation of the application will default to 2D primitives for 2.5D DXF output.
5. When the server is done, it displays the DXF column pane and visualizes the CAD objects on top of the orthomosaic. The first iteration of the application will only annotate the following features:
   1. Road centerline.
   2. Road curb.
   3. Road gutter.
   4. Manhole.
   5. Tree.
   6. Building (roof).
   7. Fence.
   8. Light or eletric pole.
   9. Overhead power line.
   10. Parking lot.
   11. Parking lot stripe.
6. A floating pallette with user editing commands also appears.
7. The user can now select any of the annotated features on the orthomosaic view (which also causes the corresponding DXF entry to be highlighted) and do one of the following:
   1. Accept as is.
   2. Reject and delete.
   3. Edit. The editing can be done either with the mouse in the orthomosaic view or directly in the DXF entry. NOTE: This feature is advanced and not for the first iteration of the application.
   4. Add a missing feature annotation. NOTE: This is also an advanced feature not for the first iteration of the application.
   5. Select a region, which might or might not have one or more annotated features, and submit for iteration to the automatic phase on the backend server. The agentic server generates a series of proposals, which are shown to the user in a floating pane for acceptance or rejection (no editting). The user can reject all proposals or pick one and accept it. The DXF file is edited accordingly.
8. Step (7) can be iterated until the user is satisfied. At this time, a downloadable DXF file is generated.

## Success Criteria
1. Multi-agentic automatic annotation:
   1. Percentage semantically correct proposals.
   2. Accuracy of proposed feature masks.
   3. Diversity of prosals for user-selected regions.
2. Speed and responsiveness.
3. Accuracy over the whole ortomosaic (Target: >90%).
4. Cumulative time of vectorization, from GeoTFF+LAS upload to DXF download, including automatic and manual phases (Target: 6 hours).
5. Cost efficiency of automatic phase, including training, fine-tuning, and inference.

## Versions and development sprints
The app implementation is complex, so the following staged development will be adopted:

### Demo Sprint (Actual Implementation - 24h Constraint)
**Scope Reduction**: Due to 24-hour time constraint, Demo focuses on core concept proof with road features only.

**Implemented Features (12 total)**:
1. `infra-dev-setup-00001`: Development environment (Vite + React 18 + TypeScript + FastAPI)
2. `ui-main-page-00001`: Single-page app with map + DXF pane
3. `ui-map-init-00001`: OpenLayers map initialization
4. `ui-cog-render-00001`: COG rendering with geotiff.js + WebGL
5. `ui-pan-zoom-00001`: Pan and zoom controls
6. `ml-dino-sam2-setup-00001`: Grounding DINO + SAM 2 integration
7. `ml-road-centerline-00001`: Road centerline detection
8. `ml-road-curb-00001`: Road curb detection
9. `geom-vectorize-roads-00001`: Mask → line/polyline primitives
10. `geom-dxf-generate-00001`: DXF file generation with ezdxf
11. `ui-dxf-overlay-00001`: Render DXF on map + populate DXF pane
12. `ui-feature-select-00001`: Click → highlight + download

**Deferred to V1**:
- User authentication (hardcoded for Demo)
- File upload UI (hardcoded dataset)
- Point cloud integration (COPC/LAS)
- Accept/Reject/Edit workflow (selection only)
- Additional feature types (manhole, building, fence, tree, pole, power line, parking)
- Iterative refinement (Redo, RedoRegion)

**Deployment Strategy**: Pre-processed results (run ML once on local GPU, commit DXF to repo, serve cached results)

### Version 1 (Post-Hackathon)
Full implementation of original Demo vision plus enhancements:

1. **Frontend**:
   - Full user authentication (Supabase)
   - File upload interface (GeoTIFF + LAS pairing)
   - Point cloud integration (COPC rendering with copc.js)
   - Accept/Reject/Edit workflow
   - All 11 feature types
   - Floating tool palette (Accept All, Accept, Reject, Edit, Redo All, Redo, RedoRegion)
   - Pixel-precision editing tools
   - Raw SAM 2 mask visualization
   - Direct SAM 2 prompting

2. **Backend**:
   - Live ML inference (not pre-processed)
   - Cloud deployment (AWS GPU instance)
   - Full feature detection pipeline (11 types)
   - Fine-tuning of Grounding DINO and SAM 2
   - RLHF using human actions
   - Supervised training with annotated datasets

3. **Infrastructure**:
   - Docker containers (frontend + backend)
   - Supabase integration (auth + storage)
   - Cloud GPU rental (40GB+ VRAM)
   - CI/CD pipeline

### Version 2 (Future)
Advanced features and self-improvement:

1. **Frontend**:
   - Real-time collaboration
   - 3D CAD primitives (full 3D, not 2.5D)
   - Mobile app (iOS/Android)
   - Advanced editing tools

2. **Backend**:
   - Multi-agentic auto-improvement
   - Physics-based validation (catenary curves, orthogonality)
   - Iterative refinement loops
   - Performance optimization

---

## Technology Architecture (Added from Design Synthesis)

### Validated Technology Stack

**Frontend (Mature & Stable)**:
- React 18.3 (not 19 - prioritizing stability)
- TypeScript 5.3+
- Vite 5.x (build tool)
- OpenLayers 10.6 (web mapping, best for CAD editing)
- geotiff.js 2.1 (COG rendering)
- dxf-parser (DXF parsing)
- Zustand 4.5 (state management)
- Radix UI (accessible components)
- TailwindCSS 3.4 (styling)

**Backend (Production-Ready)**:
- Python 3.11+
- FastAPI 0.110+ (async API framework)
- PyTorch 2.2+ (deep learning)
- Transformers 4.38 (Hugging Face models)
- Grounding DINO (open-set object detection)
- SAM 2 (segmentation with memory)
- OpenCV 4.9 (image processing)
- ezdxf 1.2 (DXF generation)
- rasterio 1.3 (geospatial I/O)

**Infrastructure**:
- Docker (containerization)
- Git LFS (large file storage)
- Supabase (V1: auth + storage)
- AWS GPU Instance (V1: g5.xlarge or similar)

### System Components

**Data Flow**:
1. Frontend loads COG orthomosaic (HTTP Range Requests, tiled streaming)
2. Backend processes with Grounding DINO (text-prompted detection)
3. SAM 2 segments detected regions (with memory management)
4. Masks converted to CAD primitives (skeletonization + Douglas-Peucker)
5. DXF file generated with proper layers and styling
6. Frontend overlays DXF vectors on orthomosaic
7. User selects features, downloads DXF

**Key Architectural Decisions**:
- Thick client (frontend handles COG streaming, WebGL rendering)
- OpenLayers over Mapbox/Leaflet (better for CAD editing)
- Client-side COG rendering (geotiff.js with Web Workers)
- SAM 2 memory management (sliding window reset to prevent OOM)
- Pre-processed results for Demo (eliminates GPU rental)

---

## Feature Types (Detailed Detection Strategies)

### 1. Road Centerline
- **Detection**: Grounding DINO prompt: "road centerline, road center"
- **Segmentation**: SAM 2 with bounding box prompts
- **Vectorization**: Skeletonization + Douglas-Peucker simplification
- **CAD Primitive**: LWPOLYLINE
- **Layer**: ROAD_CENTERLINE
- **Accuracy Target**: >85%

### 2. Road Curb
- **Detection**: Grounding DINO prompt: "road curb, curb edge, road edge"
- **Segmentation**: SAM 2 with bounding box prompts
- **Vectorization**: Contour detection + edge extraction
- **CAD Primitive**: LWPOLYLINE
- **Layer**: ROAD_CURB
- **Accuracy Target**: >85%

### 3. Road Gutter (V1)
- **Detection**: Grounding DINO prompt: "road gutter, drainage"
- **Segmentation**: SAM 2
- **Vectorization**: Edge detection
- **CAD Primitive**: LWPOLYLINE
- **Layer**: ROAD_GUTTER

### 4. Manhole (V1)
- **Detection**: Grounding DINO prompt: "manhole, manhole cover"
- **Segmentation**: SAM 2
- **Vectorization**: Circle fitting
- **CAD Primitive**: CIRCLE
- **Layer**: MANHOLE
- **Z-Extraction**: Ground level from point cloud

### 5. Tree (V1)
- **Detection**: PointNeXt (3D point cloud segmentation)
- **Segmentation**: Vegetation classification
- **Vectorization**: Centroid + radius
- **CAD Primitive**: CIRCLE (2D) or CYLINDER (3D)
- **Layer**: TREE

### 6. Building (Roof) (V1)
- **Detection**: PointNeXt (3D) + FrameField (2D)
- **Segmentation**: Roof surface extraction
- **Vectorization**: FrameField integration (sharp corners)
- **CAD Primitive**: LWPOLYLINE (closed)
- **Layer**: BUILDING
- **Z-Extraction**: Roof elevation from point cloud

### 7. Fence (V1)
- **Detection**: KPConv (3D, linear infrastructure)
- **Segmentation**: Linear feature extraction
- **Vectorization**: Line fitting
- **CAD Primitive**: LWPOLYLINE
- **Layer**: FENCE

### 8. Light/Electric Pole (V1)
- **Detection**: Grounding DINO + PointNeXt
- **Segmentation**: Vertical structure detection
- **Vectorization**: Point location
- **CAD Primitive**: POINT or CIRCLE
- **Layer**: POLE
- **Z-Extraction**: Pole height from point cloud

### 9. Overhead Power Line (V1)
- **Detection**: KPConv (3D, deformable kernels for linear features)
- **Segmentation**: Wire extraction
- **Vectorization**: Catenary curve fitting
- **CAD Primitive**: SPLINE or LWPOLYLINE
- **Layer**: POWER_LINE
- **Physics Validation**: Catenary curve constraints

### 10. Parking Lot (V1)
- **Detection**: Grounding DINO + FrameField
- **Segmentation**: Surface area detection
- **Vectorization**: Polygon extraction
- **CAD Primitive**: LWPOLYLINE (closed)
- **Layer**: PARKING_LOT

### 11. Parking Lot Stripe (V1)
- **Detection**: Grounding DINO prompt: "parking stripe, parking line"
- **Segmentation**: SAM 2
- **Vectorization**: Line extraction
- **CAD Primitive**: LINE or LWPOLYLINE
- **Layer**: PARKING_STRIPE

---

## Performance Targets (From Design Documents)

### Processing Time
- **Model Loading**: <3 minutes (one-time on startup)
- **Grounding DINO Inference**: <10 seconds per 2048x2048 tile
- **SAM 2 Segmentation**: <5 seconds per detected region
- **Vectorization**: <2 seconds per feature
- **DXF Generation**: <1 second (all features)
- **Total Pipeline**: <10 minutes for 6GB orthomosaic

### Accuracy Targets
- **Road Features**: >85% (centerline, curb)
- **Discrete Objects**: >90% (manhole, pole)
- **Buildings**: >90% (with FrameField)
- **Linear Infrastructure**: >89% (power lines with KPConv)
- **Overall System**: >90% (after human validation)

### Resource Requirements
- **VRAM**: 40GB+ for SAM 2 (24GB with aggressive memory management)
- **RAM**: 64GB+ recommended
- **GPU**: CUDA-capable (NVIDIA)
- **Storage**: 4TB+ for model cache and datasets
- **CPU**: 16+ cores for parallel processing

---

## Technical Constraints

### Hardware Constraints
- **SAM 2 Memory**: Linear growth of memory bank causes OOM on 24GB GPUs
  - **Mitigation**: Sliding window memory reset (flush after N frames)
- **Grounding DINO VRAM**: 8-10GB for Tiny variant, more for larger models
  - **Mitigation**: Use Tiny variant, FP16 precision, batch processing
- **Point Cloud Size**: Multi-gigabyte LAS files
  - **Mitigation**: COPC format (octree, streaming), LOD selection

### Software Constraints
- **Coordinate System Alignment**: Pixel coordinates ↔ World coordinates
  - **Solution**: rasterio for geospatial transformations, proj4js integration
- **DXF Compatibility**: Must open in AutoCAD, QGIS, other CAD software
  - **Solution**: ezdxf library, DXF R2018 specification
- **COG Streaming**: Multi-gigabyte files without full download
  - **Solution**: HTTP Range Requests, geotiff.js with Web Workers

### Time Constraints (Demo Sprint)
- **24-Hour Implementation**: Ruthless scope reduction required
  - **Solution**: Pre-processed results, mature technology stack, 12 features only
- **Frontend Development Inexperience**: Slower implementation
  - **Solution**: Mature stack (React 18, Vite, OpenLayers), extensive documentation

---

## Development Roadmap (From Feature Graph)

### Demo Sprint (12 features, 15-19 hours estimated)
**Critical Path**: infra-dev-setup → ui-main-page → ui-map-init → ui-cog-render → ml-dino-sam2-setup → ml-road-centerline → geom-vectorize-roads → geom-dxf-generate → ui-dxf-overlay → ui-feature-select

**Phase 1: Foundation** (2-3h)
- infra-dev-setup-00001
- ui-main-page-00001

**Phase 2: Visualization** (3-4h)
- ui-map-init-00001
- ui-cog-render-00001
- ui-pan-zoom-00001

**Phase 3: Backend ML** (5-6h)
- ml-dino-sam2-setup-00001
- ml-road-centerline-00001
- ml-road-curb-00001

**Phase 4: Geometrization** (2-3h)
- geom-vectorize-roads-00001
- geom-dxf-generate-00001

**Phase 5: Integration** (3-4h)
- ui-dxf-overlay-00001
- ui-feature-select-00001

### Version 1 (Post-Hackathon, estimated 3-4 months)
- Add 9 remaining feature types
- Full user authentication and file upload
- Point cloud integration (COPC)
- Accept/Reject/Edit workflow
- Iterative refinement
- Cloud deployment
- Fine-tuning and RLHF

### Version 2 (Future, estimated 6-12 months)
- Multi-agentic self-improvement
- 3D CAD primitives
- Real-time collaboration
- Mobile apps
- Advanced physics-based validation
