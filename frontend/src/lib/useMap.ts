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
