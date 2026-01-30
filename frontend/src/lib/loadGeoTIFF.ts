import GeoTIFF from 'ol/source/GeoTIFF'
import WebGLTile from 'ol/layer/WebGLTile'

export function createGeoTIFFLayer(url: string) {
  const source = new GeoTIFF({
    sources: [
      {
        url: url,
        nodata: 0,
      },
    ],
    transition: 0,
  })

  const layer = new WebGLTile({
    source: source,
    style: {
      color: ['array', ['band', 1], ['band', 2], ['band', 3], 1],
    },
  })

  return { layer, source }
}
