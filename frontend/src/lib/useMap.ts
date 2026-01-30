import { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, transformExtent } from 'ol/proj'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { createGeoTIFFLayer } from './loadGeoTIFF'

// Register EPSG:6405 (NAD83(2011) / Arizona Central (ft))
proj4.defs('EPSG:6405', '+proj=tmerc +lat_0=31 +lon_0=-111.916666666667 +k=0.9999 +x_0=700000 +y_0=0 +ellps=GRS80 +units=ft +no_defs +type=crs')
register(proj4)

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
          
          if (viewConfig?.extent && viewConfig?.projection) {
            const sourceExtent = viewConfig.extent
            const sourceProj = typeof viewConfig.projection === 'string' 
              ? viewConfig.projection 
              : viewConfig.projection.getCode()
            
            console.log('Source extent (EPSG:6405):', sourceExtent)
            console.log('Source projection:', sourceProj)
            
            // Transform extent from EPSG:6405 to EPSG:3857 (Web Mercator)
            const transformedExtent = transformExtent(
              sourceExtent,
              sourceProj,
              'EPSG:3857'
            )
            
            console.log('Transformed extent (EPSG:3857):', transformedExtent)
            
            view.fit(transformedExtent, {
              padding: [50, 50, 50, 50],
              duration: 1000,
              maxZoom: 19,
            })
            
            console.log('✓ GeoTIFF loaded, view fitted to extent')
            console.log('Current center:', view.getCenter())
            console.log('Current zoom:', view.getZoom())
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
