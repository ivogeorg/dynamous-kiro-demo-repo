interface MapContainerProps {
  className?: string
}

export default function MapContainer({ className = '' }: MapContainerProps) {
  return (
    <div 
      id="map" 
      className={`relative bg-gray-200 ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-lg">Map will be initialized here</p>
          <p className="text-sm mt-2">(OpenLayers integration in next feature)</p>
        </div>
      </div>
    </div>
  )
}
