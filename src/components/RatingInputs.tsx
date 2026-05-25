import { useState } from 'react'

interface StarRatingProps {
  value: number
  max?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function StarRating({ value, max = 5, onChange, disabled }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1
        const filled = (hover || value) >= star
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={`text-2xl transition-colors ${
              disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${filled ? 'text-amber-400' : 'text-gray-300'}`}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHover(star)}
          >
            ★
          </button>
        )
      })}
      {value > 0 && (
        <span className="text-sm text-gray-400 ml-1 self-center">
          {value}/{max}
        </span>
      )}
    </div>
  )
}

interface YesNoProps {
  value: boolean | null
  onChange: (value: boolean) => void
  yesLabel?: string
  noLabel?: string
}

export function YesNoToggle({ value, onChange, yesLabel = '是', noLabel = '否' }: YesNoProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          value === true
            ? 'bg-emerald-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        onClick={() => onChange(true)}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          value === false
            ? 'bg-red-400 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        onClick={() => onChange(false)}
      >
        {noLabel}
      </button>
    </div>
  )
}
