# Feature Extraction - Demo Sprint

## Scope
- 6 feature types: Road centerline, Road curb, Road gutter, Manhole, Building (roof), Fence
- Full COPC integration for vertical dimension
- Hardcoded authentication (single user)
- Cloud backend with GPU (40GB+ VRAM)
- Mature technology stack (React 18, Vite, FastAPI, PyTorch)

## Feature Categories

### Infrastructure (infra)
- Development environment setup
- Build configuration
- Containerization
- Deployment

### Authentication (auth)
- Hardcoded user login
- Session management

### File Management (file)
- Upload interface
- Validation
- Storage

### Frontend Visualization (ui)
- Orthomosaic viewer
- Point cloud overlay
- DXF visualization
- Tool palette

### Backend ML Pipeline (ml)
- Grounding DINO integration
- SAM 2 integration
- Feature detection for 6 types

### Geometrization (geom)
- Mask to CAD conversion
- Coordinate alignment
- DXF generation

### API (api)
- REST endpoints
- Communication protocol

### Testing (test)
- Integration tests
- Validation

## Feature List (Prioritized for Demo)

### Phase 1: Foundation (Must-Have)
1. infra-dev-setup-00001: Development environment
2. infra-build-config-00001: Vite + TypeScript configuration
3. auth-hardcoded-login-00001: Splash screen with hardcoded auth
4. ui-map-init-00001: OpenLayers map initialization
5. file-upload-ui-00001: File upload interface (GeoTIFF + LAS)

### Phase 2: Visualization Core (Must-Have)
6. ui-cog-render-00001: COG rendering with geotiff.js
7. ui-pan-zoom-00001: Pan and zoom controls
8. ui-copc-render-00001: COPC point cloud rendering
9. ui-dxf-pane-00001: DXF column pane UI

### Phase 3: Backend ML (Must-Have)
10. ml-dino-integration-00001: Grounding DINO setup
11. ml-sam2-integration-00001: SAM 2 setup with memory management
12. ml-road-detection-00001: Road feature detection (centerline, curb, gutter)
13. ml-manhole-detection-00001: Manhole detection
14. ml-building-detection-00001: Building (roof) detection
15. ml-fence-detection-00001: Fence detection

### Phase 4: Geometrization (Must-Have)
16. geom-mask-to-cad-00001: Convert masks to CAD primitives
17. geom-coord-align-00001: Coordinate system alignment
18. geom-dxf-gen-00001: DXF file generation

### Phase 5: Integration (Must-Have)
19. api-rest-design-00001: REST API design
20. api-upload-endpoint-00001: File upload endpoint
21. api-process-endpoint-00001: Processing endpoint
22. api-results-endpoint-00001: Results retrieval
23. ui-overlay-render-00001: Render CAD objects on orthomosaic

### Phase 6: User Interaction (Must-Have)
24. ui-feature-select-00001: Feature selection (click)
25. ui-tool-palette-00001: Floating tool palette
26. ui-accept-feature-00001: Accept feature button
27. ui-reject-feature-00001: Reject feature button

### Phase 7: Deployment (Must-Have)
28. infra-frontend-docker-00001: Frontend containerization
29. infra-backend-docker-00001: Backend containerization
30. infra-cloud-deploy-00001: Cloud deployment configuration

### Phase 8: Testing & Polish (Should-Have)
31. test-default-dataset-00001: Default test dataset integration
32. test-integration-00001: Basic integration tests
33. ui-error-handling-00001: Error handling and user feedback
34. api-progress-updates-00001: Processing progress updates

## Dependencies

Key dependency chains:
- infra-dev-setup → infra-build-config → auth-hardcoded-login
- ui-map-init → ui-cog-render → ui-pan-zoom
- ui-map-init → ui-copc-render
- ml-dino-integration + ml-sam2-integration → ml-*-detection
- ml-*-detection → geom-mask-to-cad → geom-dxf-gen
- api-rest-design → api-*-endpoint
- ui-dxf-pane + api-results-endpoint → ui-overlay-render
- ui-overlay-render → ui-feature-select → ui-tool-palette

## Technology Decisions

### Frontend (Mature)
- React 18.3 (not 19 - more stable)
- TypeScript 5.3+
- Vite 5.x
- OpenLayers 10.x
- geotiff.js (COG)
- copc.js (point cloud)
- dxf-parser (DXF reading)
- Zustand (state)
- Radix UI (components)
- TailwindCSS (styling)

### Backend (Mature)
- Python 3.11+
- FastAPI 0.110+
- PyTorch 2.2+
- Transformers (Hugging Face)
- ezdxf (DXF writing)
- GDAL/rasterio (geospatial)
- laspy (LAS reading)

### Infrastructure
- Docker + Docker Compose
- Supabase (file storage + future auth)
- AWS GPU instance (g5.xlarge or similar)

## Next Steps
1. Generate detailed feature files for each feature
2. Create features.json dependency graph
3. Update steering documents (tech.md, structure.md)
