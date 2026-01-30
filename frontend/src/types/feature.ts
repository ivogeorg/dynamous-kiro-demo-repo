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
