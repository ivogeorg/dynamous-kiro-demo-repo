# PIVOT 02: Static Demo with Mock Overlays - Final Submission Strategy

**Date**: 2026-01-30  
**Time Remaining**: ~3 hours  
**Status**: CRITICAL - ML Pipeline Abandoned, Static Demo Path

---

## Context

**ML Pipeline Failed**: After 2+ hours attempting to set up Grounding DINO + SAM 2 on Windows 11 without WSL:
- ✅ GPU recognized (RTX 5090)
- ✅ PyTorch with CUDA working
- ❌ Grounding DINO: transformers version conflicts, config/weights mismatch (SwinB vs SwinT)
- ❌ SAM 2: Missing checkpoint keys, installation requires WSL on Windows
- ❌ GDAL: Installation failures on Windows

**Decision**: Abandon real ML pipeline. Create **static demo with mock DXF overlays** to demonstrate the concept.

**Current Status:**
- ✅ 4/12 features completed (33%)
- ✅ Full orthomosaic displays (55K×110K pixels, COG streaming)
- ✅ Map interactive (pan/zoom working)
- ✅ Professional UI (React + OpenLayers + TypeScript)
- ❌ No ML masks
- ❌ No DXF generation
- ❌ No feature overlay

**PIVOT 01 Status**: Partially executed (COG conversion done, ML pipeline section skipped)

---

## WHAT TO SHOW (Static Demo)

### Core Functionality (What Works):
1. ✅ **Load full orthomosaic** - 55K×110K pixel COG streams smoothly
2. ✅ **Pan and zoom** - GPU-accelerated, responsive
3. ✅ **Projection handling** - EPSG:6405 (Arizona State Plane) → Web Mercator
4. ✅ **Professional UI** - Split pane (map + DXF list)
5. ✨ **Mock DXF overlay** - 2-3 simple road vectors (centerline + curb)
6. ✨ **Feature list** - Shows detected features in DXF pane
7. ✨ **Visual demonstration** - Concept proof (AI would generate these)

### What This Demonstrates:
- ✅ **Technical capability** - Complex geospatial data handling
- ✅ **Architecture** - Production-ready React + OpenLayers stack
- ✅ **Workflow** - Kiro CLI-driven development with custom commands
- ✅ **Vision** - Clear path to real product (ML pipeline architecture documented)
- ⚠️ **AI capability** - Explained but not demonstrated (mock data)

---

## IMPLEMENTATION PLAN (1 Hour)

### Phase 1: Create Mock DXF Data (10 min)

**Create `frontend/src/data/mockFeatures.ts`:**
```typescript
// Mock road features in EPSG:6405 coordinates (Arizona State Plane feet)
// These coordinates are within the visible orthomosaic extent
// Origin: (568,752.65, 885,733.78), Extent: ~2,100 × 4,200 feet

export interface MockFeature {
  id: string;
  type: 'LWPOLYLINE';
  layer: 'ROAD_CENTERLINE' | 'ROAD_CURB';
  color: string;
  coordinates: [number, number][];
  properties: {
    name: string;
    length: number;
    detected_by: string;
  };
}

export const mockFeatures: MockFeature[] = [
  {
    id: 'centerline-1',
    type: 'LWPOLYLINE',
    layer: 'ROAD_CENTERLINE',
    color: '#FF0000',
    coordinates: [
      [569800, 886000],
      [569850, 885950],
      [569900, 885900],
      [569950, 885850]
    ],
    properties: {
      name: 'Main Street Centerline',
      length: 212.1,
      detected_by: 'Grounding DINO + SAM 2 (mock)'
    }
  },
  {
    id: 'curb-1',
    type: 'LWPOLYLINE', 
    layer: 'ROAD_CURB',
    color: '#0000FF',
    coordinates: [
      [569790, 886010],
      [569840, 885960],
      [569890, 885910],
      [569940, 885860]
    ],
    properties: {
      name: 'Main Street North Curb',
      length: 212.1,
      detected_by: 'Grounding DINO + SAM 2 (mock)'
    }
  },
  {
    id: 'curb-2',
    type: 'LWPOLYLINE',
    layer: 'ROAD_CURB',
    color: '#0000FF',
    coordinates: [
      [569810, 885990],
      [569860, 885940],
      [569910, 885890],
      [569960, 885840]
    ],
    properties: {
      name: 'Main Street South Curb',
      length: 212.1,
      detected_by: 'Grounding DINO + SAM 2 (mock)'
    }
  }
];
```

**Note**: Coordinates are approximate. Adjust after testing to ensure visibility in orthomosaic view.

### Phase 2: Add Vector Layer to Map (20 min)

**Create `frontend/src/lib/addDXFLayer.ts`:**
```typescript
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import { Style, Stroke } from 'ol/style';
import { transform } from 'ol/proj';
import type { Map } from 'ol';
import { mockFeatures } from '@/data/mockFeatures';

export function addDXFLayer(map: Map): VectorLayer<VectorSource> {
  const olFeatures = mockFeatures.map(mockFeature => {
    // Transform coordinates from EPSG:6405 (feet) to EPSG:3857 (meters)
    const transformedCoords = mockFeature.coordinates.map(coord => 
      transform(coord, 'EPSG:6405', 'EPSG:3857')
    );
    
    const feature = new Feature({
      geometry: new LineString(transformedCoords),
      id: mockFeature.id,
      layer: mockFeature.layer,
      properties: mockFeature.properties
    });
    
    // Style based on layer
    const color = mockFeature.layer === 'ROAD_CENTERLINE' ? 'red' : 'blue';
    const width = mockFeature.layer === 'ROAD_CENTERLINE' ? 4 : 3;
    
    feature.setStyle(new Style({
      stroke: new Stroke({
        color: color,
        width: width
      })
    }));
    
    return feature;
  });
  
  const vectorLayer = new VectorLayer({
    source: new VectorSource({ features: olFeatures }),
    zIndex: 10 // Above orthomosaic
  });
  
  map.addLayer(vectorLayer);
  
  return vectorLayer;
}
```

**Update `frontend/src/lib/useMap.ts`** to call this after map initialization:
```typescript
import { addDXFLayer } from './addDXFLayer';

// After map is created and COG layer added
useEffect(() => {
  // ... existing map initialization ...
  
  // Add DXF overlay
  const dxfLayer = addDXFLayer(map);
  
  return () => {
    map.removeLayer(dxfLayer);
  };
}, [map]);
```

### Phase 3: Update DXF Pane (15 min)

**Update `frontend/src/components/DXFPane.tsx`** to show mock features:
```typescript
import { mockFeatures } from '@/data/mockFeatures';

export function DXFPane() {
  const features = mockFeatures;
  
  return (
    <div className="dxf-pane">
      <h2>Detected Features</h2>
      <div className="feature-list">
        {features.map(f => (
          <div key={f.id} className="feature-item">
            <div className="feature-header">
              <span className={`layer-badge ${f.layer.toLowerCase()}`}>
                {f.layer}
              </span>
              <span className="feature-type">{f.type}</span>
            </div>
            <div className="feature-details">
              <p className="feature-name">{f.properties.name}</p>
              <p className="feature-meta">
                Length: {f.properties.length.toFixed(1)} ft
              </p>
              <p className="feature-source">{f.properties.detected_by}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="dxf-actions">
        <button onClick={downloadDXF}>Download DXF</button>
      </div>
    </div>
  );
}

function downloadDXF() {
  // Simple DXF generation (minimal valid DXF)
  const dxfContent = generateMinimalDXF(mockFeatures);
  
  const blob = new Blob([dxfContent], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kaldic_demo.dxf';
  a.click();
  URL.revokeObjectURL(url);
}

function generateMinimalDXF(features: MockFeature[]): string {
  let entities = '';
  
  features.forEach(f => {
    entities += `0\nLWPOLYLINE\n`;
    entities += `8\n${f.layer}\n`;
    entities += `62\n${f.layer === 'ROAD_CENTERLINE' ? '1' : '5'}\n`; // Color code
    entities += `90\n${f.coordinates.length}\n`;
    entities += `70\n0\n`; // Not closed
    
    f.coordinates.forEach(coord => {
      entities += `10\n${coord[0]}\n`;
      entities += `20\n${coord[1]}\n`;
    });
  });
  
  return `0
SECTION
2
HEADER
0
ENDSEC
0
SECTION
2
ENTITIES
${entities}0
ENDSEC
0
EOF`;
}
```

**Add CSS** for feature list styling (in `DXFPane.css` or inline):
```css
.dxf-pane {
  padding: 1rem;
  overflow-y: auto;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem;
  background: white;
}

.layer-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
}

.layer-badge.road_centerline {
  background: #fee;
  color: #c00;
}

.layer-badge.road_curb {
  background: #eef;
  color: #00c;
}

.feature-name {
  font-weight: 500;
  margin: 0.5rem 0 0.25rem;
}

.feature-meta, .feature-source {
  font-size: 0.875rem;
  color: #666;
  margin: 0.25rem 0;
}

.dxf-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.dxf-actions button {
  width: 100%;
  padding: 0.75rem;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.dxf-actions button:hover {
  background: #0052a3;
}
```

### Phase 4: Add Legend (5 min)

**Add legend to map** (in `MapContainer.tsx` or as overlay):
```typescript
<div className="map-legend">
  <h3>Features</h3>
  <div className="legend-item">
    <span className="legend-line" style={{background: 'red'}}></span>
    <span>Road Centerline</span>
  </div>
  <div className="legend-item">
    <span className="legend-line" style={{background: 'blue'}}></span>
    <span>Road Curb</span>
  </div>
</div>
```

**CSS:**
```css
.map-legend {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 100;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.legend-line {
  width: 30px;
  height: 3px;
  display: block;
}
```

### Phase 5: README Update (10 min)

**Add at top of README (after title):**
```markdown
## ⚠️ Demo Status - Static Proof of Concept

This submission demonstrates the **architecture and vision** for Kaldic, with a static overlay due to ML pipeline compatibility issues on Windows 11.

**What Works:**
- ✅ Full orthomosaic viewer (55K×110K pixels, 352MB COG streaming)
- ✅ Professional geospatial UI (OpenLayers + React + TypeScript)
- ✅ Projection handling (EPSG:6405 → Web Mercator)
- ✅ Mock DXF overlay (demonstrates workflow concept)
- ✅ Feature list and download functionality

**What's Documented:**
- ✅ Complete ML pipeline architecture (Grounding DINO + SAM 2)
- ✅ Vectorization strategy (skeletonization + Douglas-Peucker)
- ✅ DXF generation approach (ezdxf)
- ✅ Production deployment plan

**ML Pipeline Status:**
- ⏳ Architecture complete and documented
- ⏳ Windows 11 compatibility issues (transformers conflicts, SAM 2 checkpoint errors)
- ✅ Ready for Linux/WSL deployment post-hackathon

**Post-Hackathon Plan:**
1. Deploy backend on Linux (Ubuntu 22.04) or WSL
2. Run full ML pipeline with real Grounding DINO + SAM 2
3. Generate real masks and DXF files
4. Replace mock overlay with live detection

**For Judges:**
- Clone and run: `npm install && npm run dev` (no backend needed)
- See orthomosaic visualization and overlay concept
- Review architecture in `.kiro/design/` and `features.json`
- Watch video for full workflow demonstration
```

---

## TOTAL TIME: 1 Hour

| Task | Time | Status |
|------|------|--------|
| Mock data creation | 10 min | Pending |
| Vector layer implementation | 20 min | Pending |
| DXF pane update | 15 min | Pending |
| Legend addition | 5 min | Pending |
| README update | 10 min | Pending |
| **Total** | **60 min** | |

---

## VALIDATION CHECKLIST

**Before submission:**
- [ ] Orthomosaic loads and displays
- [ ] Pan and zoom work smoothly
- [ ] Mock vectors overlay on map (red centerlines, blue curbs)
- [ ] Vectors visible at correct location (adjust coordinates if needed)
- [ ] Feature list shows 3 features in DXF pane
- [ ] Download button generates valid DXF file
- [ ] DXF opens in QGIS or AutoCAD without errors
- [ ] Legend shows feature types
- [ ] README clearly explains demo status
- [ ] Video demonstrates concept (5 min)

---

## DEVLOG UPDATE (Next)

Document ML pipeline challenges and lessons learned:
- Windows 11 compatibility issues
- Grounding DINO setup complexity
- SAM 2 checkpoint errors
- Time lost to environment setup (~2 hours)
- Decision to pivot to static demo
- Lessons for future hackathons

---

## VIDEO SCRIPT (5 Minutes)

**Segment 1: Introduction (30 sec)**
- "Kaldic: AI-powered orthomosaic to CAD conversion"
- "Demo shows architecture and concept with static overlay"
- "ML pipeline documented, Windows compatibility blocked full demo"

**Segment 2: Live Demo (2 min)**
- Load orthomosaic (55K×110K pixels)
- Pan and zoom
- Show mock DXF overlay (red centerlines, blue curbs)
- Feature list in DXF pane
- Download DXF, open in QGIS

**Segment 3: Architecture (1.5 min)**
- Show `features.json` (12 features, dependency graph)
- Show `.kiro/design/` (ML pipeline architecture)
- Show code structure (React + OpenLayers + TypeScript)
- Explain Kiro CLI workflow

**Segment 4: ML Pipeline (30 sec)**
- Explain Grounding DINO + SAM 2 approach
- Show documented architecture
- Explain Windows compatibility issues
- Linux deployment plan

**Segment 5: Roadmap (30 sec)**
- V1: Real ML pipeline on Linux
- V1: 8 additional feature types
- V1: Accept/Reject/Edit workflow
- V2: Multi-agentic self-improvement

---

## CRITICAL SUCCESS FACTORS

1. **Overlay must be visible** - Adjust coordinates if needed
2. **DXF must download** - Minimal but valid format
3. **README must explain status** - Clear about static demo
4. **Video must show concept** - Judges understand vision
5. **Submit early** - Don't wait until last minute

---

## RISK MITIGATION

**If coordinates are wrong:**
- Use browser console to log map extent
- Adjust mock coordinates to visible area
- Test incrementally

**If DXF generation fails:**
- Simplify format (remove optional fields)
- Test with online DXF validator
- Ensure proper line endings

**If time runs out:**
- Submit what works (orthomosaic viewer alone is impressive)
- Document incomplete features in README
- Show in video what's implemented

---

## NEXT STEPS

1. **Execute implementation** (1 hour)
2. **Update DEVLOG** (document ML pipeline challenges)
3. **Record video** (5 minutes)
4. **Submit** (before deadline)

---

**Status**: Ready to execute. Focus on visible overlay and clear documentation. 3 hours to submission. 🚀
