# Large Input Files

The original orthomosaic and point cloud files are **not included in this repository** due to GitHub LFS file size limits (2 GB per file).

## Files Required (Not in Repo)

Place these files in the respective directories:

### Orthomosaic
- **Location**: `data/orthomosaic/`
- **File**: `AVONDALE_ORTHO.tif` (6.1 GB)
- **Companion files**: `AVONDALE_ORTHO.prj`, `AVONDALE_ORTHO.tfw` (included in repo)

### Point Cloud
- **Location**: `data/pointcloud/`
- **File**: `AVONDALE.las` (3.7 GB)

## For Demo Judges

The application uses **Cloud-Optimized GeoTIFF (COG) tiles** generated from the original orthomosaic. These tiles are included in the repository and sufficient for running the demo.

**To run the full ML pipeline** (optional):
1. Download original files from [provide external link]
2. Place in directories above
3. Run ML pipeline scripts in `backend/scripts/demo/`

## Alternative: Use Pre-Generated Results

The repository includes pre-generated:
- COG tiles (in `data/orthomosaic/tiles/` or similar)
- SAM 2 masks (in `data/masks/`)
- DXF output (in `data/dxf/`)

These allow running the demo without the original large files.
