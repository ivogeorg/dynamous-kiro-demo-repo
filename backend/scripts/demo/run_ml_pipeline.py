"""
Run Grounding DINO + SAM 2 pipeline to detect road features.

This script runs on Windows 11 with RTX 5090 (24GB VRAM).

Usage:
    python run_ml_pipeline.py <input.tif> <output_dir>

Example:
    python run_ml_pipeline.py demo_cutout.tif ../../data/masks

Output:
    - road_centerline_mask.npy
    - road_curb_mask.npy
"""

import sys
import os
import numpy as np
import torch
import os
from PIL import Image
from groundingdino.util.inference import load_model, predict
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor

def load_image(image_path):
    """Load image from GeoTIFF using PIL (simpler than GDAL)."""
    from PIL import Image
    import numpy as np
    
    # Disable decompression bomb check for large orthomosaics
    Image.MAX_IMAGE_PIXELS = None
    
    # Open with PIL (works with GeoTIFF)
    img = Image.open(image_path)
    
    # Convert to RGB numpy array
    rgb = np.array(img.convert('RGB'))
    
    return rgb
    
    # Convert to uint8 if needed
    if rgb.dtype != np.uint8:
        rgb = ((rgb - rgb.min()) / (rgb.max() - rgb.min()) * 255).astype(np.uint8)
    
    return Image.fromarray(rgb)

def detect_with_grounding_dino(image, model, text_prompt, box_threshold=0.35, text_threshold=0.25):
    """Detect objects using Grounding DINO."""
    print(f"  Running Grounding DINO with prompt: '{text_prompt}'")
    
    boxes, logits, phrases = predict(
        model=model,
        image=image,
        caption=text_prompt,
        box_threshold=box_threshold,
        text_threshold=text_threshold
    )
    
    print(f"  Detected {len(boxes)} regions")
    return boxes, logits, phrases

def segment_with_sam2(image, predictor, boxes):
    """Segment regions using SAM 2."""
    print(f"  Running SAM 2 on {len(boxes)} regions...")
    
    # Set image
    predictor.set_image(np.array(image))
    
    # Convert boxes to SAM format
    input_boxes = boxes.cpu().numpy()
    
    # Predict masks
    masks, scores, _ = predictor.predict(
        point_coords=None,
        point_labels=None,
        box=input_boxes,
        multimask_output=False
    )
    
    print(f"  Generated {len(masks)} masks")
    return masks, scores

def main(input_path, output_dir):
    """Run complete ML pipeline."""
    
    print("="*60)
    print("Grounding DINO + SAM 2 Pipeline")
    print("="*60)
    
    # Check CUDA
    if not torch.cuda.is_available():
        print("WARNING: CUDA not available, using CPU (will be slow)")
    else:
        print(f"✓ CUDA available: {torch.cuda.get_device_name(0)}")
        print(f"✓ VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    
    # Load image
    print(f"\n1. Loading image: {input_path}")
    image = load_image(input_path)
    print(f"   Image size: {image.size}")
    
    # Load Grounding DINO
    print("\n2. Loading Grounding DINO...")
    
    # Use paths relative to this script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Try to find any Grounding DINO checkpoint
    weights_dir = os.path.join(script_dir, "weights")
    dino_checkpoints = [f for f in os.listdir(weights_dir) if f.startswith('groundingdino') and (f.endswith('.pth') or f.endswith('.pt'))]
    
    if not dino_checkpoints:
        raise FileNotFoundError(f"No Grounding DINO checkpoint found in {weights_dir}\n"
                                f"Download from: https://github.com/IDEA-Research/GroundingDINO/releases")
    
    checkpoint_path = os.path.join(weights_dir, dino_checkpoints[0])
    print(f"   Using checkpoint: {dino_checkpoints[0]}")
    
    # Config file (try multiple variants)
    config_variants = [
        "GroundingDINO_SwinT_OGC.py",
        "GroundingDINO_SwinB_cfg.py",
        "GroundingDINO_SwinB.py"
    ]
    
    config_path = None
    for variant in config_variants:
        test_path = os.path.join(script_dir, "groundingdino", "config", variant)
        if os.path.exists(test_path):
            config_path = test_path
            break
    
    if not config_path:
        raise FileNotFoundError(f"Config not found in groundingdino/config/\n"
                                f"Tried: {config_variants}\n"
                                f"Clone Grounding DINO repo and copy config folder here.")
    
    dino_model = load_model(
        model_config_path=config_path,
        model_checkpoint_path=checkpoint_path
    )
    print("   ✓ Grounding DINO loaded")
    
    # Load SAM 2
    print("\n3. Loading SAM 2...")
    sam2_checkpoint = os.path.join(script_dir, "weights", "sam2_hiera_large.pt")
    
    if not os.path.exists(sam2_checkpoint):
        raise FileNotFoundError(f"SAM 2 checkpoint not found: {sam2_checkpoint}\n"
                                f"Download from: https://github.com/facebookresearch/segment-anything-2")
    
    model_cfg = "sam2_hiera_l.yaml"
    sam2_model = build_sam2(model_cfg, sam2_checkpoint, device="cuda")
    predictor = SAM2ImagePredictor(sam2_model)
    print("   ✓ SAM 2 loaded")
    
    # Detect road centerlines
    print("\n4. Detecting road centerlines...")
    centerline_boxes, _, _ = detect_with_grounding_dino(
        image, dino_model, "road centerline . road center"
    )
    
    if len(centerline_boxes) > 0:
        centerline_masks, _ = segment_with_sam2(image, predictor, centerline_boxes)
        # Combine masks
        centerline_mask = np.any(centerline_masks, axis=0).astype(np.uint8) * 255
    else:
        print("   WARNING: No centerlines detected")
        centerline_mask = np.zeros(image.size[::-1], dtype=np.uint8)
    
    # Detect road curbs
    print("\n5. Detecting road curbs...")
    curb_boxes, _, _ = detect_with_grounding_dino(
        image, dino_model, "road curb . curb edge . road edge"
    )
    
    if len(curb_boxes) > 0:
        curb_masks, _ = segment_with_sam2(image, predictor, curb_boxes)
        # Combine masks
        curb_mask = np.any(curb_masks, axis=0).astype(np.uint8) * 255
    else:
        print("   WARNING: No curbs detected")
        curb_mask = np.zeros(image.size[::-1], dtype=np.uint8)
    
    # Save masks
    print(f"\n6. Saving masks to {output_dir}")
    os.makedirs(output_dir, exist_ok=True)
    
    centerline_path = os.path.join(output_dir, "road_centerline_mask.npy")
    curb_path = os.path.join(output_dir, "road_curb_mask.npy")
    
    np.save(centerline_path, centerline_mask)
    np.save(curb_path, curb_mask)
    
    print(f"   ✓ Saved: {centerline_path}")
    print(f"   ✓ Saved: {curb_path}")
    
    print("\n" + "="*60)
    print("✓ Pipeline complete!")
    print("="*60)
    print("\nNext steps:")
    print("1. Commit masks to repo: git add data/masks/ && git commit")
    print("2. Push to repo: git push")
    print("3. Continue on Ubuntu workstation with geometrization")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    main(input_path, output_dir)
