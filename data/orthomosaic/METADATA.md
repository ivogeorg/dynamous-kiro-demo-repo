# AVONDALE Orthomosaic Metadata

## File Information

- **Filename**: AVONDALE_ORTHO.tif
- **Size**: 6.1 GB
- **Format**: BigTIFF (little-endian)
- **Companion Files**: AVONDALE_ORTHO.prj, AVONDALE_ORTHO.tfw

**⚠️ Note**: Original .tif and .las files are NOT in the repository due to GitHub LFS 2GB file size limit. 
- Store original files locally in `data/orthomosaic/` and `data/pointcloud/`
- COG tiles (generated) are committed instead
- For judges: Download original files from [provide link] or use included COG tiles

## Coordinate Reference System (CRS)

**EPSG Code**: 6405

**Full Name**: NAD83(2011) / Arizona Central (ft)

**Projection Type**: Transverse Mercator

**Datum**: NAD83 (National Spatial Reference System 2011)
- **Spheroid**: GRS 1980
- **Semi-major axis**: 6,378,137 meters
- **Inverse flattening**: 298.257222101

**Projection Parameters**:
- **Latitude of origin**: 31°N
- **Central meridian**: -111.916666666667° (111°55'W)
- **Scale factor**: 0.9999
- **False easting**: 699,999.9999999999 feet
- **False northing**: 0 feet

**Units**: US Survey Feet (0.3048 meters)

**Prime Meridian**: Greenwich (0°)

## Georeference (World File)

**Pixel Resolution**:
- X: 0.0385029 feet/pixel (~0.47 inches or 1.17 cm)
- Y: -0.0385029 feet/pixel (negative indicates north-up orientation)

**Origin (Top-Left Corner)**:
- X: 568,752.646637145 feet
- Y: 885,733.7775760277 feet

**Rotation**: None (0, 0)

**Ground Sample Distance (GSD)**: ~1.17 cm (very high resolution)

## Location

**State**: Arizona, USA
**Zone**: Arizona Central State Plane Coordinate System
**Approximate Location**: Central Arizona (based on central meridian)

## Usage Notes

- This is a **state plane coordinate system** using US Survey Feet
- For web mapping (OpenLayers), will need reprojection to EPSG:3857 (Web Mercator)
- High resolution (1.17 cm GSD) suitable for detailed feature extraction
- BigTIFF format supports files >4GB
- Coordinate system is optimized for minimal distortion in central Arizona

## Related Files

- **Point Cloud**: `../pointcloud/AVONDALE.las` (3.7 GB)
- **Projection File**: `AVONDALE_ORTHO.prj` (WKT format)
- **World File**: `AVONDALE_ORTHO.tfw` (affine transformation parameters)
