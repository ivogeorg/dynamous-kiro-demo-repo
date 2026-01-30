# Implementation Plan: OpenLayers Map Initialization

**Feature ID**: ui-map-init-00001
**Priority**: Must-have (Demo)
**Estimated Time**: 30 minutes

## Objective

Initialize OpenLayers map in the MapContainer component with proper projection, view configuration, and React lifecycle integration. Replace the placeholder with a functional interactive map.

## Prerequisites

- ✅ Main application page layout (ui-main-page-00001)
- OpenLayers 10.6 installed
- MapContainer component exists

## Implementation Steps

### Phase 1: Map Initialization Hook (15 min)

#### Step 1.1: Create useMap Hook

```bash
cat > frontend/src/lib/useMap.ts << 'EOF'
import { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'

export function useMap(targetId: string) {
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (mapRef.current) return // Already initialized

    // Create map instance
    const map = new Map({
      target: targetId,
      layers: [
        new TileLayer({
          source: new OSM(), // OpenStreetMap base layer
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]), // Default center (will be replaced by COG extent)
        zoom: 2,
        minZoom: 1,
        maxZoom: 22,
      }),
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

### Phase 2: Update MapContainer Component (10 min)

#### Step 2.1: Integrate OpenLayers Map

```bash
cat > frontend/src/components/MapContainer.tsx << 'EOF'
import { useEffect } from 'react'
import { useMap } from '@/lib/useMap'
import { useAppStore } from '@/store/appStore'
import 'ol/ol.css'

interface MapContainerProps {
  className?: string
}

export default function MapContainer({ className = '' }: MapContainerProps) {
  const map = useMap('map')
  const setMapReady = useAppStore((state) => state.setMapReady)

  useEffect(() => {
    if (map) {
      setMapReady(true)
      console.log('✓ OpenLayers map initialized')
    }
  }, [map, setMapReady])

  return (
    <div 
      id="map" 
      className={`relative ${className}`}
    />
  )
}
EOF
```

### Phase 3: Add OpenLayers CSS (5 min)

#### Step 3.1: Import OpenLayers Styles

Update `frontend/src/index.css`:

```bash
cat > frontend/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* OpenLayers styles */
@import 'ol/ol.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure map fills container */
.ol-viewport {
  width: 100%;
  height: 100%;
}
EOF
```

## Validation Checklist

- [ ] Frontend starts without errors
- [ ] OpenLayers map renders in left container
- [ ] Map shows OpenStreetMap tiles
- [ ] Map is interactive (can drag to pan)
- [ ] No console errors
- [ ] Browser console shows "✓ OpenLayers map initialized"
- [ ] Store `mapReady` state is set to true

## Success Criteria

1. OpenLayers map renders successfully
2. Map displays OSM base layer
3. Map is interactive (pan works)
4. No console errors
5. React lifecycle properly manages map instance
6. Ready for COG layer integration

## Troubleshooting

**Map doesn't render:**
- Check browser console for errors
- Verify `ol/ol.css` is imported
- Inspect element - `#map` div should have `.ol-viewport` child

**Map renders but is blank:**
- Check network tab - OSM tiles should be loading
- Verify internet connection (OSM tiles require network)
- Check console for CORS or network errors

**TypeScript errors:**
- Verify OpenLayers types: `npm list ol`
- Check import paths match OpenLayers 10.x structure

**Map doesn't fill container:**
- Verify parent div has explicit height
- Check CSS: `.ol-viewport` should have `width: 100%; height: 100%`

## Next Steps

After validation passes:
1. Update feature status to 'completed'
2. Commit changes: `git add . && git commit -m "feat: Initialize OpenLayers map"`
3. Move to next feature: `ui-cog-render-00001` (COG Rendering)

## Notes

- Using OSM as temporary base layer (will be replaced/hidden when COG loads)
- Default center at [0, 0] will be updated when COG extent is available
- Map instance stored in ref to prevent re-initialization on re-renders
- Cleanup function ensures proper disposal on unmount
