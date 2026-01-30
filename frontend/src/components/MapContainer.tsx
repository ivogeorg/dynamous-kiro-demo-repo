import { useEffect } from 'react'
import { useMap } from '@/lib/useMap'
import { useAppStore } from '@/store/appStore'
import 'ol/ol.css'

interface MapContainerProps {
  className?: string
}

export default function MapContainer({ className = '' }: MapContainerProps) {
  const map = useMap('map')
  const setMapReady = useAppStore((state) => state.setMapReady)

  useEffect(() => {
    if (map) {
      setMapReady(true)
      console.log('✓ OpenLayers map initialized')
    }
  }, [map, setMapReady])

  return (
    <div 
      id="map" 
      className={`relative ${className}`}
    />
  )
}
