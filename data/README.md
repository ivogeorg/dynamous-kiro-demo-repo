# Data Directory

This directory contains the demo dataset and generated outputs.

## Structure

```
data/
├── orthomosaic/       # GeoTIFF files
│   ├── full_ortho.tif      # Full 6GB orthomosaic (Git LFS)
│   └── demo_cutout.tif     # 2048x2048 centered cutout for ML (Git LFS)
│
├── pointcloud/        # LAS/LAZ files (deferred to V1)
│   └── demo_cloud.las      # Point cloud (Git LFS)
│
├── masks/             # ML-generated masks from Grounding DINO + SAM 2
│   ├── road_centerline_mask.npy
│   └── road_curb_mask.npy
│
└── dxf/               # Generated DXF files
    └── output.dxf          # Final DXF with road features
```

## File Sizes

- `full_ortho.tif`: ~6 GB (Cloud-Optimized GeoTIFF)
- `demo_cutout.tif`: ~50 MB (2048x2048 region)
- `demo_cloud.las`: ~500 MB (deferred to V1)
- Masks: ~10 MB each
- `output.dxf`: <1 MB

## Git LFS

Large files are tracked with Git LFS. After cloning:

```bash
git lfs pull
```

## Data Source

- **Orthomosaic**: [Describe source - e.g., "Town crossroads, captured via drone"]
- **CRS**: [e.g., EPSG:32633 - WGS 84 / UTM zone 33N]
- **Resolution**: [e.g., 5cm/pixel]
- **Extent**: [Coordinates or area in km²]

## Processing Pipeline

1. **Windows Laptop (RTX 5090)**: Run ML pipeline
   - Input: `demo_cutout.tif`
   - Output: `masks/*.npy`

2. **Ubuntu Workstation**: Geometrization
   - Input: `masks/*.npy`
   - Output: `dxf/output.dxf`

3. **Frontend**: Visualization
   - Loads: `full_ortho.tif` (COG streaming)
   - Overlays: `dxf/output.dxf`
