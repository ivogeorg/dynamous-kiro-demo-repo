# Implementation Plan: Cloud-Optimized GeoTIFF Rendering

**Feature ID**: ui-cog-render-00001
**Priority**: Must-have (Demo)
**Estimated Time**: 45 minutes

## Objective

Load and render the demo orthomosaic cutout on the OpenLayers map using geotiff.js with tiled streaming, proper geospatial positioning, and GPU-accelerated rendering.

## Prerequisites

- ✅ OpenLayers map initialized (ui-map-init-00001)
- ✅ Demo cutout ready: `data/orthomosaic/demo_cutout.tif`
- geotiff.js installed

## Implementation Steps

### Phase 1: Set Up GeoTIFF Layer (25 min)

#### Step 1.1: Create GeoTIFF Loader Utility

```bash
cat > frontend/src/lib/loadGeoTIFF.ts << 'EOF'
import GeoTIFF from 'ol/source/GeoTIFF'
import WebGLTile from 'ol/layer/WebGLTile'

export function createGeoTIFFLayer(url: string) {
  const source = new GeoTIFF({
    sources: [
      {
        url: url,
        // Enable tiled reading for performance
        nodata: 0,
      },
    ],
    // Use Web Workers for decoding (offload from main thread)
    transition: 0,
  })

  const layer = new WebGLTile({
    source: source,
    // GPU-accelerated rendering
    style: {
      color: ['array', ['band', 1], ['band', 2], ['band', 3], 1],
    },
  })

  return { layer, source }
}
EOF
```

#### Step 1.2: Update useMap Hook to Load GeoTIFF

```bash
cat > frontend/src/lib/useMap.ts << 'EOF'
import { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import { createGeoTIFFLayer } from './loadGeoTIFF'

export function useMap(targetId: string) {
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (mapRef.current) return // Already initialized

    // Create GeoTIFF layer
    const { layer: geoTiffLayer, source: geoTiffSource } = createGeoTIFFLayer(
      '/data/orthomosaic/demo_cutout.tif'
    )

    // Create map instance
    const map = new Map({
      target: targetId,
      layers: [
        new TileLayer({
          source: new OSM(), // Base layer (will be hidden under orthomosaic)
          opacity: 0.3, // Dim OSM to see it's there but not distracting
        }),
        geoTiffLayer, // Orthomosaic on top
      ],
      view: new View({
        center: fromLonLat([0, 0]), // Will be updated by GeoTIFF extent
        zoom: 2,
        minZoom: 1,
        maxZoom: 22,
      }),
    })

    // Fit view to GeoTIFF extent when loaded
    geoTiffSource.on('change', () => {
      if (geoTiffSource.getState() === 'ready') {
        const view = map.getView()
        const extent = geoTiffSource.getView()?.extent
        
        if (extent) {
          view.fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000,
          })
          console.log('✓ GeoTIFF loaded, view fitted to extent')
        }
      }
    })

    mapRef.current = map

    // Cleanup on unmount
    return () => {
      map.setTarget(undefined)
      mapRef.current = null
    }
  }, [targetId])

  return mapRef.current
}
EOF
```

### Phase 2: Configure Vite to Serve GeoTIFF (10 min)

#### Step 2.1: Update Vite Config for Static Assets

```bash
cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Serve data files from parent directory
      '/data': {
        target: 'http://localhost:5173',
        rewrite: (path) => path.replace(/^\/data/, '/../data'),
      },
    },
  },
  publicDir: '../data', // Serve data directory as static files
})
EOF
```

**Alternative approach (simpler):** Copy or symlink the cutout to `frontend/public/`:

```bash
mkdir -p frontend/public/data/orthomosaic
cp data/orthomosaic/demo_cutout.tif frontend/public/data/orthomosaic/
```

Then update the URL in `loadGeoTIFF.ts` to use `/data/orthomosaic/demo_cutout.tif`.

### Phase 3: Validation (10 min)

#### Step 3.1: Test Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

**Expected behavior:**
1. Map loads with OSM base layer (dimmed)
2. Orthomosaic loads on top
3. Map automatically zooms to orthomosaic extent
4. Can pan and zoom the orthomosaic
5. Console shows "✓ GeoTIFF loaded, view fitted to extent"

#### Step 3.2: Verify Tiled Loading

Open browser DevTools → Network tab:
- Should see multiple tile requests as you pan
- Tiles load progressively (not all at once)
- HTTP Range Requests used (efficient)

## Validation Checklist

- [ ] Frontend starts without errors
- [ ] Orthomosaic displays on map
- [ ] Map automatically fits to orthomosaic extent
- [ ] Orthomosaic is properly georeferenced (aligned with OSM)
- [ ] Can pan and zoom smoothly
- [ ] Tiles load progressively as you pan
- [ ] Console shows GeoTIFF loaded message
- [ ] No CORS errors

## Success Criteria

1. Orthomosaic renders correctly on map
2. Proper geospatial positioning (aligned with OSM base layer)
3. Tiled streaming works (progressive loading)
4. GPU-accelerated rendering (WebGLTile)
5. View automatically fits to extent
6. Ready for DXF overlay

## Troubleshooting

**GeoTIFF doesn't load:**
- Check browser console for errors
- Verify file path: `/data/orthomosaic/demo_cutout.tif`
- Check Network tab - file should be requested
- Verify file is accessible (try opening URL directly)

**CORS errors:**
- Ensure file is served from same origin or CORS enabled
- Use `frontend/public/` directory approach (simpler)

**Orthomosaic appears but wrong location:**
- Check GeoTIFF has proper georeferencing
- Verify projection matches OpenLayers (EPSG:3857 or will be reprojected)
- Check extent values in console

**Performance issues:**
- Verify WebGLTile is being used (GPU acceleration)
- Check tile size (256x256 is optimal)
- Monitor browser performance tab

## Next Steps

After validation passes:
1. Update feature status to 'completed'
2. Commit changes
3. Move to: `ui-pan-zoom-00001` (Pan and Zoom Controls)

## Notes

- Using WebGLTile for GPU acceleration (faster than Canvas rendering)
- geotiff.js handles COG tiling automatically
- OSM base layer dimmed to 30% opacity to show it's there but not distracting
- View.fit() with padding ensures orthomosaic is fully visible
- HTTP Range Requests enable efficient streaming (only loads visible tiles)
