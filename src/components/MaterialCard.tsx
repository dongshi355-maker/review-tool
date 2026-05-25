import { VideoPlayer } from './VideoPlayer'
import { StarRating, YesNoToggle } from './RatingInputs'
import type { Material, RatingDimension } from '../lib/types'

interface MaterialCardProps {
  material: Material
  index: number
  dimensions: RatingDimension[]
  values: Record<string, number | boolean>
  suggestion: string
  onValueChange: (dimKey: string, value: number | boolean) => void
  onSuggestionChange: (text: string) => void
}

export function MaterialCard({
  material,
  index,
  dimensions,
  values,
  suggestion,
  onValueChange,
  onSuggestionChange,
}: MaterialCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 视频区域 */}
      {material.videoUrl && (
        <VideoPlayer src={material.videoUrl} />
      )}

      <div className="p-4 space-y-4">
        {/* 标题 */}
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
            {index}
          </span>
          <h3 className="font-semibold text-gray-900">{material.name}</h3>
          {material.description && (
            <span className="text-sm text-gray-400">{material.description}</span>
          )}
        </div>

        {/* 评分维度 */}
        <div className="grid gap-3 sm:grid-cols-2">
          {dimensions.map((dim) => (
            <div key={dim.key} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{dim.label}</span>
              {dim.type === 'star' ? (
                <StarRating
                  value={(values[dim.key] as number) || 0}
                  max={dim.max || 5}
                  onChange={(v) => onValueChange(dim.key, v)}
                />
              ) : (
                <YesNoToggle
                  value={(values[dim.key] as boolean | null) ?? null}
                  onChange={(v) => onValueChange(dim.key, v)}
                />
              )}
            </div>
          ))}
        </div>

        {/* 建议 */}
        <div>
          <textarea
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-300"
            rows={2}
            placeholder="对此素材的建议（选填）"
            value={suggestion}
            onChange={(e) => onSuggestionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
