# Implementation Plan: Main Application Page

**Feature ID**: ui-main-page-00001
**Priority**: Must-have (Demo)
**Estimated Time**: 45 minutes

## Objective

Create single-page application layout with map container (left) and DXF pane (right), set up Zustand state management, and prepare for OpenLayers integration.

## Prerequisites

- ✅ Development environment set up (infra-dev-setup-00001)
- Frontend running on :5173
- TailwindCSS configured

## Implementation Steps

### Phase 1: Zustand Store Setup (10 min)

#### Step 1.1: Create Application Store

```bash
cat > frontend/src/store/appStore.ts << 'EOF'
import { create } from 'zustand'

interface Feature {
  id: string
  type: string
  layer: string
  geometry: any
  selected: boolean
}

interface AppState {
  // Map state
  mapReady: boolean
  setMapReady: (ready: boolean) => void
  
  // DXF features
  features: Feature[]
  setFeatures: (features: Feature[]) => void
  
  // Selection
  selectedFeatureId: string | null
  selectFeature: (id: string | null) => void
  
  // UI state
  dxfPaneVisible: boolean
  toggleDxfPane: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Map state
  mapReady: false,
  setMapReady: (ready) => set({ mapReady: ready }),
  
  // DXF features
  features: [],
  setFeatures: (features) => set({ features }),
  
  // Selection
  selectedFeatureId: null,
  selectFeature: (id) => set({ selectedFeatureId: id }),
  
  // UI state
  dxfPaneVisible: true,
  toggleDxfPane: () => set((state) => ({ dxfPaneVisible: !state.dxfPaneVisible })),
}))
EOF
```

### Phase 2: Component Structure (25 min)

#### Step 2.1: Create Map Container Component

```bash
cat > frontend/src/components/MapContainer.tsx << 'EOF'
interface MapContainerProps {
  className?: string
}

export default function MapContainer({ className = '' }: MapContainerProps) {
  return (
    <div 
      id="map" 
      className={`relative bg-gray-200 ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-lg">Map will be initialized here</p>
          <p className="text-sm mt-2">(OpenLayers integration in next feature)</p>
        </div>
      </div>
    </div>
  )
}
EOF
```

#### Step 2.2: Create DXF Pane Component

```bash
cat > frontend/src/components/DXFPane.tsx << 'EOF'
import { useAppStore } from '@/store/appStore'

export default function DXFPane() {
  const { features, selectedFeatureId, selectFeature } = useAppStore()
  
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-300">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">DXF Features</h2>
        <p className="text-sm text-gray-500 mt-1">
          {features.length} feature{features.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Feature List */}
      <div className="flex-1 overflow-y-auto">
        {features.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <p>No features yet</p>
              <p className="text-xs mt-1">Features will appear after processing</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => selectFeature(feature.id)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  selectedFeatureId === feature.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{feature.type}</p>
                    <p className="text-sm text-gray-500">{feature.layer}</p>
                  </div>
                  <div className="text-xs text-gray-400">#{feature.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button
          disabled={features.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Download DXF
        </button>
      </div>
    </div>
  )
}
EOF
```

#### Step 2.3: Update Main App Component

```bash
cat > frontend/src/App.tsx << 'EOF'
import MapContainer from '@/components/MapContainer'
import DXFPane from '@/components/DXFPane'
import { useAppStore } from '@/store/appStore'

function App() {
  const { dxfPaneVisible } = useAppStore()
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kaldic</h1>
            <p className="text-sm text-gray-400">AI-Powered Orthomosaic Feature Annotation</p>
          </div>
          <div className="text-sm text-gray-400">
            Demo Sprint
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className={`${dxfPaneVisible ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <MapContainer className="w-full h-full" />
        </div>
        
        {/* DXF Pane */}
        {dxfPaneVisible && (
          <div className="w-1/3">
            <DXFPane />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
EOF
```

### Phase 3: Type Definitions (5 min)

#### Step 3.1: Create Type Definitions

```bash
cat > frontend/src/types/feature.ts << 'EOF'
export interface Feature {
  id: string
  type: string
  layer: string
  geometry: any
  properties?: Record<string, any>
  selected: boolean
}

export interface DXFLayer {
  name: string
  color: string
  features: Feature[]
}
EOF
```

### Phase 4: Validation (5 min)

#### Step 4.1: Test Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:5173
# Verify:
# - Header displays "Kaldic"
# - Map container shows placeholder
# - DXF pane shows "No features yet"
# - Layout is responsive (2/3 map, 1/3 DXF pane)
```

#### Step 4.2: Test State Management

Add test features to verify store works:

```typescript
// In browser console:
useAppStore.getState().setFeatures([
  { id: '1', type: 'Road Centerline', layer: 'ROAD_CENTERLINE', geometry: {}, selected: false },
  { id: '2', type: 'Road Curb', layer: 'ROAD_CURB', geometry: {}, selected: false }
])
```

## Validation Checklist

- [ ] Frontend starts without errors
- [ ] Header displays correctly with title and subtitle
- [ ] Map container shows placeholder (2/3 width)
- [ ] DXF pane displays on right (1/3 width)
- [ ] DXF pane shows "No features yet" message
- [ ] Zustand store accessible in browser console
- [ ] Layout is responsive and clean
- [ ] TypeScript compilation passes

## Success Criteria

1. Page loads with split layout (map left, DXF pane right)
2. Zustand store set up and functional
3. Components properly structured with TypeScript
4. No console errors
5. Ready for OpenLayers integration

## Troubleshooting

**Import errors with @/ alias:**
- Verify `vite.config.ts` has path alias configured
- Restart Vite dev server

**Zustand store not working:**
- Check `import { create } from 'zustand'` syntax
- Verify zustand is installed: `npm list zustand`

**Layout issues:**
- Check TailwindCSS is processing: inspect element for utility classes
- Verify `index.css` imports Tailwind directives

## Next Steps

After validation passes:
1. Update feature status to 'completed'
2. Commit changes: `git add . && git commit -m "feat: Complete main application page layout"`
3. Move to next feature: `ui-map-init-00001` (OpenLayers Map Initialization)
