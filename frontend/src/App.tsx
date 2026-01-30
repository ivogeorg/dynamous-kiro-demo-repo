import MapContainer from '@/components/MapContainer'
import DXFPane from '@/components/DXFPane'
import { useAppStore } from '@/store/appStore'

function App() {
  const { dxfPaneVisible } = useAppStore()
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kaldic</h1>
            <p className="text-sm text-gray-400">AI-Powered Orthomosaic Feature Annotation</p>
          </div>
          <div className="text-sm text-gray-400">
            Demo Sprint
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className={`${dxfPaneVisible ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <MapContainer className="w-full h-full" />
        </div>
        
        {/* DXF Pane */}
        {dxfPaneVisible && (
          <div className="w-1/3">
            <DXFPane />
          </div>
        )}
      </div>
    </div>
  )
}

export default App

