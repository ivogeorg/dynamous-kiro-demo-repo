// Mock road features in EPSG:6405 coordinates (Arizona State Plane feet)
// These coordinates are within the visible orthomosaic extent
// Origin: (568,752.65, 885,733.78), Extent: ~2,100 × 4,200 feet

export interface MockFeature {
  id: string
  type: 'LWPOLYLINE'
  layer: 'ROAD_CENTERLINE' | 'ROAD_CURB'
  color: string
  coordinates: [number, number][]
  properties: {
    name: string
    length: number
    detected_by: string
  }
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
      [569950, 885850],
    ],
    properties: {
      name: 'Main Street Centerline',
      length: 212.1,
      detected_by: 'Grounding DINO + SAM 2 (mock)',
    },
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
      [569940, 885860],
    ],
    properties: {
      name: 'Main Street North Curb',
      length: 212.1,
      detected_by: 'Grounding DINO + SAM 2 (mock)',
    },
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
      [569960, 885840],
    ],
    properties: {
      name: 'Main Street South Curb',
      length: 212.1,
      detected_by: 'Grounding DINO + SAM 2 (mock)',
    },
  },
]
