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
