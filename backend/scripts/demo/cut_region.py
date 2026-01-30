"""
Cut centered region from orthomosaic for ML processing.

Usage:
    python cut_region.py <input.tif> <output.tif> [crop_size]

Example:
    python cut_region.py full_ortho.tif demo_cutout.tif 2048
"""

import sys
from osgeo import gdal

def cut_centered_region(input_path, output_path, crop_size=2048):
    """Cut a centered square region from a GeoTIFF."""
    
    print(f"Opening {input_path}...")
    ds = gdal.Open(input_path)
    
    if ds is None:
        print(f"ERROR: Could not open {input_path}")
        sys.exit(1)
    
    width = ds.RasterXSize
    height = ds.RasterYSize
    
    print(f"Input size: {width} x {height}")
    
    # Calculate center crop
    x_offset = (width - crop_size) // 2
    y_offset = (height - crop_size) // 2
    
    print(f"Cutting {crop_size}x{crop_size} region from center...")
    print(f"Offset: ({x_offset}, {y_offset})")
    
    # Cut region (preserves georeferencing)
    gdal.Translate(
        output_path,
        ds,
        srcWin=[x_offset, y_offset, crop_size, crop_size],
        format='GTiff',
        creationOptions=['COMPRESS=LZW', 'TILED=YES']
    )
    
    ds = None  # Close
    
    print(f"✓ Saved to {output_path}")
    
    # Verify output
    out_ds = gdal.Open(output_path)
    if out_ds:
        print(f"✓ Output size: {out_ds.RasterXSize} x {out_ds.RasterYSize}")
        print(f"✓ Georeferencing preserved: {out_ds.GetProjection()[:50]}...")
        out_ds = None
    else:
        print("ERROR: Could not verify output")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    crop_size = int(sys.argv[3]) if len(sys.argv) > 3 else 2048
    
    cut_centered_region(input_path, output_path, crop_size)
