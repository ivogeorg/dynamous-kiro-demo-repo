import { mockFeatures, type MockFeature } from '@/data/mockFeatures'

function generateMinimalDXF(features: MockFeature[]): string {
  let entities = ''
  
  features.forEach((f) => {
    entities += `0\nLWPOLYLINE\n`
    entities += `8\n${f.layer}\n`
    entities += `62\n${f.layer === 'ROAD_CENTERLINE' ? '1' : '5'}\n` // Color code
    entities += `90\n${f.coordinates.length}\n`
    entities += `70\n0\n` // Not closed
    
    f.coordinates.forEach((coord) => {
      entities += `10\n${coord[0]}\n`
      entities += `20\n${coord[1]}\n`
    })
  })
  
  return `0
SECTION
2
HEADER
0
ENDSEC
0
SECTION
2
ENTITIES
${entities}0
ENDSEC
0
EOF`
}

function downloadDXF() {
  const dxfContent = generateMinimalDXF(mockFeatures)
  
  const blob = new Blob([dxfContent], { type: 'application/dxf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'kaldic_demo.dxf'
  a.click()
  URL.revokeObjectURL(url)
}

export default function DXFPane() {
  const features = mockFeatures
  
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-300">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Detected Features</h2>
        <p className="text-sm text-gray-500 mt-1">
          {features.length} feature{features.length !== 1 ? 's' : ''} detected
        </p>
      </div>
      
      {/* Feature List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {features.map((f) => (
          <div
            key={f.id}
            className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  f.layer === 'ROAD_CENTERLINE'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {f.layer}
              </span>
              <span className="text-xs text-gray-500">{f.type}</span>
            </div>
            <p className="font-medium text-gray-900 mb-1">{f.properties.name}</p>
            <p className="text-sm text-gray-600 mb-1">
              Length: {f.properties.length.toFixed(1)} ft
            </p>
            <p className="text-xs text-gray-500">{f.properties.detected_by}</p>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button
          onClick={downloadDXF}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Download DXF
        </button>
      </div>
    </div>
  )
}
