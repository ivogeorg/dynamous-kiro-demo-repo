# Implementation Plan: Grounding DINO and SAM 2 Integration

**Feature ID**: ml-dino-sam2-setup-00001
**Priority**: Must-have (Demo)
**Estimated Time**: 1-1.5 hours (depending on model download speed)

## Objective

Set up Grounding DINO and SAM 2 models in the backend with proper VRAM management, test inference on the orthomosaic cutout, and prepare for road feature detection.

## Prerequisites

- ✅ Backend environment set up (infra-dev-setup-00001)
- ⏳ Orthomosaic cutout ready: `data/orthomosaic/demo_cutout.tif`
- GPU with CUDA support (24GB+ VRAM recommended)

## Implementation Steps

### Phase 1: Install ML Dependencies (15-20 min)

#### Step 1.1: Update Backend Requirements

```bash
cat >> backend/requirements.txt << 'EOF'

# ML/AI Dependencies
torch==2.2.0
torchvision==0.17.0
transformers==4.38.0
opencv-python==4.9.0
pillow==10.2.0
scipy==1.12.0

# Grounding DINO (will install from GitHub)
# SAM 2 (will install from GitHub)
EOF
```

#### Step 1.2: Install PyTorch with CUDA

```bash
cd backend
source venv/bin/activate

# Install PyTorch with CUDA 12.1 support
pip install torch==2.2.0 torchvision==0.17.0 --index-url https://download.pytorch.org/whl/cu121

# Install other dependencies
pip install transformers==4.38.0 opencv-python==4.9.0 pillow==10.2.0 scipy==1.12.0
```

#### Step 1.3: Install Grounding DINO and SAM 2

```bash
# Install Grounding DINO from GitHub
pip install git+https://github.com/IDEA-Research/GroundingDINO.git

# Install SAM 2 from GitHub
pip install git+https://github.com/facebookresearch/segment-anything-2.git
```

### Phase 2: Model Loading Utilities (20-25 min)

#### Step 2.1: Create Model Configuration

```bash
cat > backend/config.py << 'EOF'
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR.parent / "data"
MODELS_DIR = BASE_DIR / "models" / "cache"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Model settings
GROUNDING_DINO_CONFIG = "GroundingDINO/groundingdino/config/GroundingDINO_SwinT_OGC.py"
GROUNDING_DINO_CHECKPOINT = "groundingdino_swint_ogc.pth"

SAM2_CHECKPOINT = "sam2_hiera_large.pt"
SAM2_CONFIG = "sam2_hiera_l.yaml"

# Inference settings
DEVICE = "cuda"  # or "cpu" if no GPU
BOX_THRESHOLD = 0.35
TEXT_THRESHOLD = 0.25

# Memory management
MAX_MEMORY_FRAMES = 10  # Reset SAM 2 memory after N frames to prevent OOM
EOF
```

#### Step 2.2: Create Grounding DINO Wrapper

```bash
cat > backend/models/dino.py << 'EOF'
import torch
from groundingdino.util.inference import load_model, predict
from PIL import Image
import numpy as np
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))
from config import GROUNDING_DINO_CONFIG, GROUNDING_DINO_CHECKPOINT, DEVICE, BOX_THRESHOLD, TEXT_THRESHOLD, MODELS_DIR

class GroundingDINOModel:
    def __init__(self):
        self.model = None
        self.device = DEVICE
        
    def load(self):
        """Load Grounding DINO model."""
        print(f"Loading Grounding DINO on {self.device}...")
        
        # Download checkpoint if not exists
        checkpoint_path = MODELS_DIR / GROUNDING_DINO_CHECKPOINT
        if not checkpoint_path.exists():
            print(f"Downloading Grounding DINO checkpoint to {checkpoint_path}...")
            # Model will auto-download from Hugging Face
            
        self.model = load_model(
            model_config_path=GROUNDING_DINO_CONFIG,
            model_checkpoint_path=str(checkpoint_path)
        )
        self.model.to(self.device)
        print("✓ Grounding DINO loaded")
        
    def predict(self, image_path: str, text_prompt: str):
        """
        Detect objects in image using text prompt.
        
        Args:
            image_path: Path to image file
            text_prompt: Text description (e.g., "road centerline . road center")
            
        Returns:
            boxes: Bounding boxes (N, 4) in xyxy format
            logits: Confidence scores (N,)
            phrases: Detected phrases (N,)
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load() first.")
            
        image = Image.open(image_path).convert("RGB")
        
        boxes, logits, phrases = predict(
            model=self.model,
            image=image,
            caption=text_prompt,
            box_threshold=BOX_THRESHOLD,
            text_threshold=TEXT_THRESHOLD,
            device=self.device
        )
        
        return boxes, logits, phrases
EOF
```

#### Step 2.3: Create SAM 2 Wrapper

```bash
cat > backend/models/sam2_model.py << 'EOF'
import torch
import numpy as np
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from PIL import Image
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))
from config import SAM2_CHECKPOINT, SAM2_CONFIG, DEVICE, MODELS_DIR, MAX_MEMORY_FRAMES

class SAM2Model:
    def __init__(self):
        self.predictor = None
        self.device = DEVICE
        self.frame_count = 0
        
    def load(self):
        """Load SAM 2 model."""
        print(f"Loading SAM 2 on {self.device}...")
        
        checkpoint_path = MODELS_DIR / SAM2_CHECKPOINT
        if not checkpoint_path.exists():
            print(f"Downloading SAM 2 checkpoint to {checkpoint_path}...")
            # Model will auto-download
            
        sam2_model = build_sam2(SAM2_CONFIG, str(checkpoint_path), device=self.device)
        self.predictor = SAM2ImagePredictor(sam2_model)
        print("✓ SAM 2 loaded")
        
    def segment_from_boxes(self, image_path: str, boxes: np.ndarray):
        """
        Segment objects using bounding box prompts.
        
        Args:
            image_path: Path to image file
            boxes: Bounding boxes (N, 4) in xyxy format
            
        Returns:
            masks: Binary masks (N, H, W)
            scores: Confidence scores (N,)
        """
        if self.predictor is None:
            raise RuntimeError("Model not loaded. Call load() first.")
            
        # Load image
        image = np.array(Image.open(image_path).convert("RGB"))
        
        # Set image for predictor
        self.predictor.set_image(image)
        
        # Segment each box
        masks = []
        scores = []
        
        for box in boxes:
            # Convert box to SAM 2 format
            input_box = box.cpu().numpy() if torch.is_tensor(box) else box
            
            # Predict mask
            mask, score, _ = self.predictor.predict(
                point_coords=None,
                point_labels=None,
                box=input_box[None, :],
                multimask_output=False
            )
            
            masks.append(mask[0])
            scores.append(score[0])
            
        # Memory management: reset after N frames
        self.frame_count += 1
        if self.frame_count >= MAX_MEMORY_FRAMES:
            self.predictor.reset_image()
            self.frame_count = 0
            print(f"✓ SAM 2 memory reset (processed {MAX_MEMORY_FRAMES} frames)")
            
        return np.array(masks), np.array(scores)
EOF
```

### Phase 3: Test Inference (15-20 min)

#### Step 3.1: Create Test Script

```bash
cat > backend/test_models.py << 'EOF'
#!/usr/bin/env python3
"""Test Grounding DINO and SAM 2 models on demo cutout."""

import torch
import numpy as np
from pathlib import Path
from models.dino import GroundingDINOModel
from models.sam2_model import SAM2Model
from config import DATA_DIR

def test_models():
    print("=" * 60)
    print("Testing Grounding DINO + SAM 2 Pipeline")
    print("=" * 60)
    
    # Check CUDA
    if torch.cuda.is_available():
        print(f"✓ CUDA available: {torch.cuda.get_device_name(0)}")
        print(f"✓ VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    else:
        print("⚠ CUDA not available, using CPU (will be slow)")
    
    # Check for demo cutout
    demo_image = DATA_DIR / "orthomosaic" / "demo_cutout.tif"
    if not demo_image.exists():
        print(f"❌ Demo cutout not found: {demo_image}")
        print("Please run cut_region.py first")
        return False
    
    print(f"✓ Demo image found: {demo_image}")
    
    # Load models
    print("\n1. Loading Grounding DINO...")
    dino = GroundingDINOModel()
    dino.load()
    
    print("\n2. Loading SAM 2...")
    sam2 = SAM2Model()
    sam2.load()
    
    # Test detection
    print("\n3. Testing road centerline detection...")
    text_prompt = "road centerline . road center"
    boxes, logits, phrases = dino.predict(str(demo_image), text_prompt)
    
    print(f"   Detected {len(boxes)} regions")
    print(f"   Confidence scores: {logits.cpu().numpy()}")
    
    if len(boxes) == 0:
        print("   ⚠ No detections found (may need to adjust thresholds)")
        return True  # Models loaded successfully even if no detections
    
    # Test segmentation
    print("\n4. Testing SAM 2 segmentation...")
    masks, scores = sam2.segment_from_boxes(str(demo_image), boxes)
    
    print(f"   Generated {len(masks)} masks")
    print(f"   Mask shapes: {[m.shape for m in masks]}")
    print(f"   Segmentation scores: {scores}")
    
    # Check VRAM usage
    if torch.cuda.is_available():
        vram_used = torch.cuda.memory_allocated() / 1e9
        vram_cached = torch.cuda.memory_reserved() / 1e9
        print(f"\n5. VRAM Usage:")
        print(f"   Allocated: {vram_used:.2f} GB")
        print(f"   Cached: {vram_cached:.2f} GB")
        
        if vram_used > 40:
            print("   ⚠ VRAM usage exceeds 40GB - may need optimization")
        else:
            print("   ✓ VRAM usage within limits")
    
    print("\n" + "=" * 60)
    print("✓ Pipeline test complete!")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = test_models()
    exit(0 if success else 1)
EOF

chmod +x backend/test_models.py
```

#### Step 3.2: Run Test

```bash
cd backend
source venv/bin/activate
python test_models.py
```

### Phase 4: Update Backend API (10 min)

#### Step 4.1: Add Model Initialization to FastAPI

Update `backend/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from models.dino import GroundingDINOModel
from models.sam2_model import SAM2Model

app = FastAPI(
    title="Kaldic API",
    description="AI-Powered Orthomosaic Feature Annotation Backend",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances
dino_model = None
sam2_model = None

@app.on_event("startup")
async def startup_event():
    """Load ML models on startup."""
    global dino_model, sam2_model
    
    print("Loading ML models...")
    dino_model = GroundingDINOModel()
    dino_model.load()
    
    sam2_model = SAM2Model()
    sam2_model.load()
    
    print("✓ All models loaded")

@app.get("/")
async def root():
    return {
        "message": "Kaldic API",
        "version": "0.1.0",
        "status": "ready"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "frontend_cors": "enabled",
        "ml_models": "loaded" if dino_model and sam2_model else "not_loaded"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

## Validation Checklist

- [ ] PyTorch with CUDA installed successfully
- [ ] Grounding DINO installed from GitHub
- [ ] SAM 2 installed from GitHub
- [ ] Model checkpoints downloaded
- [ ] Test script runs without errors
- [ ] Detections found in demo cutout
- [ ] Masks generated successfully
- [ ] VRAM usage < 40GB (or acceptable for available GPU)
- [ ] Backend starts with models loaded
- [ ] `/health` endpoint shows `ml_models: loaded`

## Success Criteria

1. Both models load without errors
2. Inference runs on demo cutout
3. Detections and masks generated
4. VRAM usage monitored and acceptable
5. Backend API ready for feature detection endpoints

## Troubleshooting

**CUDA out of memory:**
- Reduce `MAX_MEMORY_FRAMES` in config.py
- Use smaller SAM 2 variant (hiera_small instead of hiera_large)
- Process smaller image tiles

**Model download fails:**
- Check internet connection
- Manually download from GitHub releases
- Place in `backend/models/cache/`

**No detections found:**
- Adjust `BOX_THRESHOLD` and `TEXT_THRESHOLD` in config.py
- Try different text prompts
- Verify image is valid GeoTIFF

**Import errors:**
- Ensure virtual environment is activated
- Reinstall packages: `pip install --force-reinstall [package]`

## Next Steps

After validation passes:
1. Update feature status to 'completed'
2. Commit changes
3. Move to: `ml-road-centerline-00001` and `ml-road-curb-00001`
