# PIVOT 01: Modified Demo Approach - 32K Region Strategy

**Date**: 2026-01-30  
**Time Remaining**: 8 hours  
**Status**: CRITICAL PATH ADJUSTMENT

---

## Context

GitHub LFS has a **2GB per-file limit**. Original plan to use full 6.1GB orthomosaic or 3.7GB point cloud is not feasible. We're pivoting to a **32K×32K region** approach that:
- Shows multiple roads and intersections (impressive demo)
- Stays under GitHub limits (all files <2GB)
- Processes on available hardware (RTX 5090)
- Allows judges to clone and run without external downloads

---

## IMMEDIATE ACTIONS (PIV Session)

### 1. Complete Current Feature (ui-cog-render-00001)

**Update file paths in code:**
- Change: `data/orthomosaic/AVONDALE_ORTHO.tif` → `data/orthomosaic/AVONDALE_ORTHO_COG.tif`
- Check all components loading the orthomosaic
- Test that map still loads (should work identically - COG is complete)

**Verify:**
- Orthomosaic displays in browser
- Pan and zoom work smoothly
- No console errors

### 2. Create ML Processing Region

**Command to run** (in planning session, not PIV):
```bash
gdal_translate -srcwin 11352 39015 32381 32381 \
  -co COMPRESS=LZW -co TILED=YES -co BIGTIFF=YES \
  data/orthomosaic/AVONDALE_ORTHO_COG.tif \
  data/orthomosaic/demo_region.tif
```

**Result:**
- File: `demo_region.tif` (~500 MB)
- Coverage: 32,381 × 32,381 pixels
- Area: 1,247 × 1,247 feet (~0.24 square miles)
- Content: Multiple road segments, intersections, features

**Commit and push:**
```bash
git add data/orthomosaic/demo_region.tif
git commit -m "feat: Add 32K demo region for ML pipeline (500MB, under LFS limit)"
# NOTIFY USER: Ready to push
```

**⚠️ Note**: Notify user when commits are ready to push (GitHub credentials required).

---

## ML PIPELINE (Windows Laptop - USER WILL DO THIS)

**Note**: The user will handle this section on their Windows laptop with RTX 5090.

### Steps (for user reference):

1. **Pull latest code:**
   ```bash
   git pull origin master
   ```

2. **Verify files present:**
   - `data/orthomosaic/demo_region.tif` (500 MB)
   - `backend/scripts/demo/run_ml_pipeline.py`
   - `backend/scripts/demo/requirements-ml.txt`

3. **Update ML pipeline script** (`run_ml_pipeline.py`):
   ```python
   # Change input file
   image_path = "data/orthomosaic/demo_region.tif"  # Was: demo_cutout.tif
   
   # Ensure output paths
   np.save("data/masks/road_centerline_mask.npy", centerline_mask)
   np.save("data/masks/road_curb_mask.npy", curb_mask)
   ```

4. **Run pipeline:**
   ```bash
   cd backend/scripts/demo
   python run_ml_pipeline.py
   ```

5. **Expected output:**
   - `data/masks/road_centerline_mask.npy` (~1 GB)
   - `data/masks/road_curb_mask.npy` (~1 GB)
   - Total: ~2 GB (under GitHub limit)
   - Processing time: ~5-10 minutes

6. **Commit and push masks:**
   ```bash
   git add data/masks/*.npy
   git commit -m "feat: Add SAM 2 masks for 32K demo region"
   git push
   ```

---

## CONTINUE IMPLEMENTATION (PIV Session - After Masks Available)

### 1. Pull Masks from GitHub

```bash
git pull origin master
```

**Verify files present:**
- `data/masks/road_centerline_mask.npy`
- `data/masks/road_curb_mask.npy`

### 2. Update Feature Status

**Mark as completed** (ML features done on laptop):
- `ml-dino-sam2-setup-00001` → status: "completed"
- `ml-road-centerline-00001` → status: "completed"
- `ml-road-curb-00001` → status: "completed"

Update in `.kiro/features.json` and respective feature files.

### 3. Remaining Features (Priority Order)

**CRITICAL PATH** (must complete):

1. ✅ `ui-cog-render-00001` - Complete (path update done)
2. `ui-pan-zoom-00001` - Quick (0.5h) - Pan/zoom controls
3. ~~`ml-dino-sam2-setup-00001`~~ - SKIP (done on laptop)
4. ~~`ml-road-centerline-00001`~~ - SKIP (masks generated)
5. ~~`ml-road-curb-00001`~~ - SKIP (masks generated)
6. **`geom-vectorize-roads-00001`** - CRITICAL (2h) - Mask → polylines
7. **`geom-dxf-generate-00001`** - CRITICAL (1h) - DXF file generation
8. **`ui-dxf-overlay-00001`** - CRITICAL (1.5h) - Render DXF on map
9. **`ui-feature-select-00001`** - CRITICAL (1h) - Selection + download

**Focus**: Features 6-9 (geometrization and UI integration)

---

## TIME ALLOCATION (8 Hours Total)

| Task | Time | Status |
|------|------|--------|
| Complete ui-cog-render-00001 | 0.5h | In progress |
| Create demo_region.tif | 0.25h | Pending |
| ML pipeline (laptop) | 0.5h | User task |
| Pull masks, update status | 0.25h | After ML |
| ui-pan-zoom-00001 | 0.5h | Next |
| geom-vectorize-roads-00001 | 2h | Critical |
| geom-dxf-generate-00001 | 1h | Critical |
| ui-dxf-overlay-00001 | 1.5h | Critical |
| ui-feature-select-00001 | 1h | Critical |
| README polish | 0.5h | Final |
| Video recording | 0.5h | Final |
| Submission | 0.25h | Final |
| **Total** | **8.75h** | Tight! |

---

## FILE SIZE CONSTRAINTS

**GitHub LFS Limit**: 2GB per file

**Current files:**
- ✅ `AVONDALE_ORTHO_COG.tif` - 352 MB (full orthomosaic, compressed)
- ✅ `demo_region.tif` - 500 MB (ML processing region)
- ✅ `road_centerline_mask.npy` - ~1 GB (SAM 2 output)
- ✅ `road_curb_mask.npy` - ~1 GB (SAM 2 output)

**All under 2GB limit!**

**Verification command:**
```bash
# Check for files over 2GB
find data -type f -size +2G
# Should return nothing
```

---

## DOCUMENTATION UPDATES

### Update README.md

Add section:
```markdown
## Demo Data

**Orthomosaic:**
- Full neighborhood: `AVONDALE_ORTHO_COG.tif` (352 MB, Cloud-Optimized GeoTIFF)
- Dimensions: 55,085 × 110,411 pixels
- Coverage: ~1.04 × 2.08 miles

**ML Processing Region:**
- File: `demo_region.tif` (500 MB)
- Dimensions: 32,381 × 32,381 pixels
- Coverage: 1,247 × 1,247 feet (~0.24 square miles)
- Content: Multiple road segments, intersections

**Pre-Generated Results:**
- SAM 2 masks: `data/masks/*.npy` (2 GB total)
- All files under GitHub LFS 2GB limit
- Clone and run - no external downloads needed
```

### Update data/README.md

Add section:
```markdown
## File Strategy (GitHub LFS Constraints)

Due to GitHub LFS 2GB per-file limit:

**Not in repository** (too large):
- Original orthomosaic: 6.1 GB (local only)
- Point cloud: 3.7 GB (not needed for Demo)

**In repository** (under limits):
- COG orthomosaic: 352 MB (full coverage, compressed)
- ML region: 500 MB (32K×32K, for feature detection)
- SAM 2 masks: 2 GB total (pre-generated results)

**For judges:**
- Clone repository
- All data included
- No external downloads required
- Run `npm install && npm run dev`
```

---

## VALIDATION CHECKLIST

**Before final submission:**

- [ ] All files under 2GB: `find data -size +2G` returns nothing
- [ ] `git push` succeeds without LFS errors
- [ ] Fresh clone works: `git clone` → `npm install` → `npm run dev`
- [ ] Orthomosaic loads in browser (COG streaming)
- [ ] Pan and zoom responsive
- [ ] DXF vectors overlay correctly on map
- [ ] Feature selection highlights features
- [ ] DXF download works
- [ ] Downloaded DXF opens in QGIS/AutoCAD
- [ ] README has clear setup instructions
- [ ] Video demonstrates full workflow (5 min)

---

## RISK MITIGATION

### If masks exceed 2GB:
- Reduce region to 28K×28K (1.5 GB masks)
- Or split into 4 quadrants, process separately
- Or increase compression in numpy save

### If vectorization takes too long:
- Simplify algorithm (Douglas-Peucker with higher tolerance)
- Process only centerlines first, skip curbs if needed
- Use pre-simplified contours

### If time runs out:
**Priority 1** (must have):
- COG loading and display
- Mask overlay (even without DXF conversion)
- Basic feature visualization

**Priority 2** (nice to have):
- Full DXF generation
- Feature selection
- Download functionality

**Document what works** in README and show in video.

---

## CRITICAL SUCCESS FACTORS

1. **Stay under 2GB per file** - Check before every push
2. **Focus on critical path** - Features 6-9 are essential
3. **Test incrementally** - Verify each feature works before moving on
4. **Document as you go** - Update README with actual behavior
5. **Time-box tasks** - If stuck >30 min, simplify or skip

---

## NOTES FOR PIV SESSION

- **Windows laptop work**: User will handle ML pipeline execution
- **Wait for masks**: Don't proceed past feature 5 until masks are pushed
- **Verify file sizes**: Before committing large files, check size
- **Test frequently**: Ensure each feature works before marking complete
- **Update DEVLOG**: Document decisions and challenges as you go
- **⚠️ Git Push**: Notify user when commits are ready to push (GitHub credentials required)

---

**Status**: Ready to execute. Focus on critical path. 8 hours to submission. 🚀
