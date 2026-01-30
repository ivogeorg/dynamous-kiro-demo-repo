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

    console.log('Initializing map with GeoTIFF...')

    // Create GeoTIFF layer
    const { layer: geoTiffLayer, source: geoTiffSource } = createGeoTIFFLayer(
      '/data/orthomosaic/demo_cutout.tif'
    )

    // Create map instance
    const map = new Map({
      target: targetId,
      layers: [
        new TileLayer({
          source: new OSM(),
          opacity: 0.3, // Dim OSM to see orthomosaic better
        }),
        geoTiffLayer,
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
        minZoom: 1,
        maxZoom: 22,
      }),
    })

    // Fit view to GeoTIFF extent when loaded
    geoTiffSource.on('change', () => {
      const state = geoTiffSource.getState()
      console.log('GeoTIFF source state:', state)
      
      if (state === 'ready') {
        const view = map.getView()
        
        geoTiffSource.getView().then((viewConfig) => {
          console.log('GeoTIFF view config:', viewConfig)
          if (viewConfig?.extent) {
            view.fit(viewConfig.extent, {
              padding: [50, 50, 50, 50],
              duration: 1000,
            })
            console.log('✓ GeoTIFF loaded, view fitted to extent')
          }
        }).catch((error) => {
          console.error('Error getting GeoTIFF view:', error)
        })
      } else if (state === 'error') {
        console.error('GeoTIFF failed to load')
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
