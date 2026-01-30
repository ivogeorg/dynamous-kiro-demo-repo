# ML Pipeline Scripts (Demo)

These scripts run **once** on Windows 11 laptop with RTX 5090 to generate masks.

## Prerequisites

- Windows 11
- RTX 5090 (24GB VRAM)
- Python 3.11+
- CUDA 12.1+

## Setup (PowerShell)

```powershell
# Create virtual environment
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1

# If execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install other dependencies
pip install -r requirements-ml.txt

# Install SAM 2 from GitHub
pip install git+https://github.com/facebookresearch/segment-anything-2.git
```

## Download Model Weights

```powershell
# Create weights directory
mkdir weights

# Download Grounding DINO weights
# https://github.com/IDEA-Research/GroundingDINO/releases
# Save to: weights/groundingdino_swint_ogc.pth

# Download SAM 2 weights
# https://github.com/facebookresearch/segment-anything-2/releases
# Save to: weights/sam2_hiera_large.pt
```

## Usage

### Step 1: Cut Centered Region

```powershell
python cut_region.py ..\..\data\orthomosaic\full_ortho.tif ..\..\data\orthomosaic\demo_cutout.tif 2048
```

**Output**: `data/orthomosaic/demo_cutout.tif` (~50MB)

### Step 2: Run ML Pipeline

```powershell
python run_ml_pipeline.py ..\..\data\orthomosaic\demo_cutout.tif ..\..\data\masks
```

**Output**:
- `data/masks/road_centerline_mask.npy`
- `data/masks/road_curb_mask.npy`

**Time**: ~5-10 minutes on RTX 5090

### Step 3: Commit to Repo

```powershell
cd ..\..\..\
git add data/masks/
git commit -m "feat: Add ML-generated masks from Grounding DINO + SAM 2"
git push
```

## Troubleshooting

### CUDA Out of Memory

If you get OOM errors on RTX 5090 (24GB):

1. Reduce crop size: `python cut_region.py ... 1024`
2. Use FP16 precision (modify script)
3. Process fewer regions at once

### Model Download Issues

If model downloads fail:
- Download manually from GitHub releases
- Place in `weights/` directory
- Update paths in `run_ml_pipeline.py`

### GDAL Installation Issues

On Windows, GDAL can be tricky:

```powershell
# Option 1: Use conda
conda install -c conda-forge gdal

# Option 2: Use pre-built wheels
pip install GDAL-3.8.4-cp311-cp311-win_amd64.whl
```

## Expected Output

```
============================================================
Grounding DINO + SAM 2 Pipeline
============================================================
✓ CUDA available: NVIDIA GeForce RTX 5090
✓ VRAM: 24.0 GB

1. Loading image: demo_cutout.tif
   Image size: (2048, 2048)

2. Loading Grounding DINO...
   ✓ Grounding DINO loaded

3. Loading SAM 2...
   ✓ SAM 2 loaded

4. Detecting road centerlines...
  Running Grounding DINO with prompt: 'road centerline . road center'
  Detected 5 regions
  Running SAM 2 on 5 regions...
  Generated 5 masks

5. Detecting road curbs...
  Running Grounding DINO with prompt: 'road curb . curb edge . road edge'
  Detected 8 regions
  Running SAM 2 on 8 regions...
  Generated 8 masks

6. Saving masks to ../../data/masks
   ✓ Saved: ../../data/masks/road_centerline_mask.npy
   ✓ Saved: ../../data/masks/road_curb_mask.npy

============================================================
✓ Pipeline complete!
============================================================

Next steps:
1. Commit masks to repo: git add data/masks/ && git commit
2. Push to repo: git push
3. Continue on Ubuntu workstation with geometrization
```

## Notes

- This script runs **once** to generate masks
- Masks are committed to repo (Git LFS)
- Ubuntu workstation pulls masks and continues with geometrization
- No GPU needed after this step!
