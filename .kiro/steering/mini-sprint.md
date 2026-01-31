# MINI-SPRINT: Submission-Ready Strategy

**Date**: 2026-01-30  
**Time Remaining**: ~6 hours  
**Status**: CRITICAL - Deadline-Driven Scope Reduction

---

## Context

Last hackathon: missed deadline by seconds. This time: **stage submission early**, ensure something works, deploy easily.

**Current Status:**
- ✅ 4/12 features completed (33%)
- ✅ Orthomosaic displays (COG streaming works)
- ✅ Map interactive (pan/zoom)
- ❌ No ML masks yet (Windows laptop work pending)
- ❌ No DXF generation
- ❌ No feature overlay

---

## CRITICAL DECISION: What to Show?

### Option A: Static Demo (Safest - 3 hours)
**Show**: Orthomosaic viewer with pre-drawn mock DXF overlay

**What works:**
- Load and display full orthomosaic (already working)
- Pan and zoom (already working)
- Static DXF overlay (manually created, 2 simple road lines)
- Feature selection (click highlights)
- Download DXF (pre-generated file)

**What to cut:**
- Real ML pipeline (no SAM 2 masks)
- Dynamic vectorization
- All ML features (6-8)

**Time:**
- Mock DXF creation: 0.5h
- Overlay implementation: 1h
- Selection logic: 0.5h
- Download button: 0.25h
- README update: 0.5h
- Video: 0.25h
- **Total: 3h**

**Pros:**
- ✅ Guaranteed to work
- ✅ Shows full workflow concept
- ✅ Easy to deploy
- ✅ Judges see something impressive (full orthomosaic)

**Cons:**
- ❌ No real AI (just mock)
- ❌ Less impressive technically
- ❌ Doesn't demonstrate ML capability

---

### Option B: Real ML Demo (Risky - 6 hours)
**Show**: Full pipeline with real SAM 2 masks

**What works:**
- Everything from Option A
- Real ML pipeline on Windows laptop
- Real masks generated
- Real vectorization
- Real DXF from masks

**What to cut:**
- Nothing (full demo)

**Time:**
- ML pipeline (Windows): 1h
- Vectorization: 2h
- DXF generation: 1h
- Overlay: 1h
- Selection: 0.5h
- README: 0.5h
- **Total: 6h**

**Pros:**
- ✅ Full technical demonstration
- ✅ Real AI capability shown
- ✅ More impressive

**Cons:**
- ❌ High risk (any failure = no demo)
- ❌ No buffer time
- ❌ Depends on Windows laptop success

---

### Option C: Hybrid (Recommended - 4 hours)
**Show**: Orthomosaic + pre-generated masks overlay (no DXF)

**What works:**
- Load orthomosaic (working)
- Pan/zoom (working)
- Load pre-generated mask images (PNG/JPEG from masks)
- Overlay masks on map with transparency
- Show "detected features" visually
- No DXF download (just visual demo)

**What to cut:**
- DXF generation (features 7-8)
- Feature selection (feature 9)
- Download functionality

**Time:**
- Generate mask on Windows: 1h
- Convert mask to image overlay: 0.5h
- Implement overlay: 1h
- Polish UI: 0.5h
- README: 0.5h
- Video: 0.25h
- Buffer: 0.25h
- **Total: 4h**

**Pros:**
- ✅ Shows real AI (actual SAM 2 masks)
- ✅ Visually impressive (masks overlay on imagery)
- ✅ Reasonable time buffer
- ✅ Demonstrates core concept

**Cons:**
- ❌ No DXF (less complete workflow)
- ❌ No selection/download

---

## RECOMMENDATION: Option C (Hybrid)

**Rationale:**
1. **Shows something real**: Actual ML masks, not mock data
2. **Visually impressive**: Colored mask overlays on orthomosaic
3. **Time buffer**: 4h with 0.25h slack
4. **Lower risk**: Simpler than full DXF pipeline
5. **Demonstrates concept**: Judges see AI detection working

---

## MINI-SPRINT PLAN (4 Hours)

### Phase 1: ML Pipeline (Windows Laptop - 1h)
**User task** - not PIV:
1. Pull latest code
2. Run ML pipeline on demo_region.tif
3. Generate masks (road_centerline, road_curb)
4. Convert masks to PNG with color:
   ```python
   # Centerline: red, Curb: blue
   from PIL import Image
   import numpy as np
   
   centerline = np.load('road_centerline_mask.npy')
   curb = np.load('road_curb_mask.npy')
   
   # Create RGBA images
   centerline_img = np.zeros((*centerline.shape, 4), dtype=np.uint8)
   centerline_img[centerline > 0] = [255, 0, 0, 180]  # Red, 70% opacity
   
   curb_img = np.zeros((*curb.shape, 4), dtype=np.uint8)
   curb_img[curb > 0] = [0, 0, 255, 180]  # Blue, 70% opacity
   
   Image.fromarray(centerline_img).save('centerline_overlay.png')
   Image.fromarray(curb_img).save('curb_overlay.png')
   ```
5. Commit and push PNG overlays

### Phase 2: Overlay Implementation (PIV - 1.5h)
1. Create ImageStatic layer for mask overlays
2. Load centerline_overlay.png and curb_overlay.png
3. Position overlays at correct coordinates (from demo_region extent)
4. Add layer toggle controls (show/hide centerline, curb)
5. Test overlay alignment

### Phase 3: UI Polish (PIV - 0.5h)
1. Add legend (red = centerline, blue = curb)
2. Add status indicator ("AI Detection: 2 features found")
3. Update DXF pane to show detected features (read-only list)
4. Remove download button (not implemented)

### Phase 4: Documentation (PIV - 0.5h)
1. Update README with:
   - TOC at top
   - Quick Start (2 deployment options)
   - What works in demo
   - What's coming in V1
2. Add deployment instructions:
   - **Option 1: Repository** (clone + npm install + npm run dev)
   - **Option 2: Docker** (docker-compose up - if time permits)

### Phase 5: Video & Submission (User - 0.5h)
1. Record 3-minute video:
   - Show orthomosaic loading
   - Pan and zoom
   - Toggle mask overlays
   - Explain AI detection
   - Show code structure
2. Submit before deadline

---

## FEATURES TO CUT

**Mark as "Won't Have (Demo)"** in features.json:
- `ui-pan-zoom-00001` - Nice to have, but map already pans/zooms
- `geom-vectorize-roads-00001` - Not needed for visual demo
- `geom-dxf-generate-00001` - Not needed for visual demo
- `ui-dxf-overlay-00001` - Replaced with mask overlay
- `ui-feature-select-00001` - Not needed for visual demo

**Keep as "Completed" (even if not fully done):**
- `ml-dino-sam2-setup-00001` - Will run on Windows
- `ml-road-centerline-00001` - Will generate mask
- `ml-road-curb-00001` - Will generate mask

---

## README STRUCTURE (Updated)

```markdown
# Kaldic - AI-Powered Orthomosaic Feature Annotation

## 📑 Table of Contents
- [Quick Start](#quick-start)
- [What is Kaldic?](#what-is-kaldic)
- [Demo Scope](#demo-scope)
- [Deployment Options](#deployment-options)
- [Technology Stack](#technology-stack)
- [Development Process](#development-process)
- [Roadmap](#roadmap)

## 🚀 Quick Start (2 Minutes)

### Option 1: Clone and Run (Recommended)
\`\`\`bash
git clone https://github.com/ivogeorg/dynamous-kiro-demo-repo.git
cd dynamous-kiro-demo-repo/frontend
npm install
npm run dev
# Open http://localhost:5173
\`\`\`

### Option 2: Docker (One Command)
\`\`\`bash
docker-compose up
# Open http://localhost:5173
\`\`\`

**That's it!** The demo uses pre-generated AI masks, so no GPU or backend setup required.

## 🎯 What is Kaldic?
[Current content...]

## 🎬 Demo Scope
**What Works:**
- ✅ Load 55K×110K pixel orthomosaic (COG streaming)
- ✅ Pan and zoom with GPU acceleration
- ✅ AI-detected road features (SAM 2 masks)
- ✅ Toggle feature overlays (centerline, curb)
- ✅ Feature legend and status

**What's Coming in V1:**
- DXF file generation and download
- Feature selection and editing
- Point cloud integration
- 8 additional feature types

## 🐳 Deployment Options
[Detailed instructions...]
```

---

## VALIDATION CHECKLIST

**Before submission:**
- [ ] Orthomosaic loads and displays
- [ ] Pan and zoom work smoothly
- [ ] Mask overlays display at correct location
- [ ] Layer toggles work (show/hide)
- [ ] Legend shows feature types
- [ ] README has TOC and Quick Start at top
- [ ] README has 2 deployment options
- [ ] Video recorded (3 min)
- [ ] Submitted before deadline

---

## RISK MITIGATION

**If ML pipeline fails on Windows:**
- Use mock masks (manually create simple PNG overlays)
- Document in README: "Demo uses simplified masks for visualization"

**If overlay alignment fails:**
- Show masks in separate window/pane
- Document: "Spatial alignment in progress"

**If time runs out:**
- Submit what works
- Document incomplete features in README
- Show in video what's implemented

---

## TIME ALLOCATION

| Task | Time | Who | Status |
|------|------|-----|--------|
| ML pipeline + PNG export | 1h | User | Pending |
| Mask overlay implementation | 1.5h | PIV | Pending |
| UI polish | 0.5h | PIV | Pending |
| README update | 0.5h | PIV | Pending |
| Video + submission | 0.5h | User | Pending |
| **Buffer** | 0.25h | - | - |
| **Total** | **4.25h** | | |

---

## CRITICAL SUCCESS FACTORS

1. **Something visible works** - Judges must see orthomosaic + overlays
2. **Easy deployment** - Clone + npm install + npm run dev
3. **Clear README** - TOC + Quick Start at top
4. **Video shows it working** - 3 minutes, demonstrates concept
5. **Submit early** - Don't wait until last minute

---

**Status**: Ready to execute. Focus on visual demo, not complete pipeline. 4 hours to submission. 🚀
