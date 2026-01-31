import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import { Style, Stroke } from 'ol/style'
import { transform } from 'ol/proj'
import type Map from 'ol/Map'
import { mockFeatures } from '@/data/mockFeatures'

export function addDXFLayer(map: Map): VectorLayer<VectorSource> {
  const olFeatures = mockFeatures.map((mockFeature) => {
    // Transform coordinates from EPSG:6405 (feet) to EPSG:3857 (meters)
    const transformedCoords = mockFeature.coordinates.map((coord) =>
      transform(coord, 'EPSG:6405', 'EPSG:3857')
    )

    const feature = new Feature({
      geometry: new LineString(transformedCoords),
      id: mockFeature.id,
      layer: mockFeature.layer,
      properties: mockFeature.properties,
    })

    // Style based on layer
    const color = mockFeature.layer === 'ROAD_CENTERLINE' ? 'red' : 'blue'
    const width = mockFeature.layer === 'ROAD_CENTERLINE' ? 4 : 3

    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: color,
          width: width,
        }),
      })
    )

    return feature
  })

  const vectorLayer = new VectorLayer({
    source: new VectorSource({ features: olFeatures }),
    zIndex: 10, // Above orthomosaic
  })

  map.addLayer(vectorLayer)

  return vectorLayer
}
