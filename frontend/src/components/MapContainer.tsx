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
    <div className="relative">
      <div 
        id="map" 
        className={`relative ${className}`}
      />
      
      {/* Legend */}
      <div className="absolute bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 z-10">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-red-600 rounded"></div>
            <span className="text-xs text-gray-700">Road Centerline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-600 rounded"></div>
            <span className="text-xs text-gray-700">Road Curb</span>
          </div>
        </div>
      </div>
    </div>
  )
}
