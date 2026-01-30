import { useAppStore } from '@/store/appStore'

export default function DXFPane() {
  const { features, selectedFeatureId, selectFeature } = useAppStore()
  
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-300">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">DXF Features</h2>
        <p className="text-sm text-gray-500 mt-1">
          {features.length} feature{features.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Feature List */}
      <div className="flex-1 overflow-y-auto">
        {features.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <p>No features yet</p>
              <p className="text-xs mt-1">Features will appear after processing</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {features.map((feature) => (
              <div
                key={feature.id}
                onClick={() => selectFeature(feature.id)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  selectedFeatureId === feature.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{feature.type}</p>
                    <p className="text-sm text-gray-500">{feature.layer}</p>
                  </div>
                  <div className="text-xs text-gray-400">#{feature.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button
          disabled={features.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Download DXF
        </button>
      </div>
    </div>
  )
}
