// 评分维度定义
export interface RatingDimension {
  key: string
  label: string
  type: 'star' | 'yesno'
  max?: number
}

// 单条素材
export interface Material {
  id: string
  name: string
  description?: string
  videoUrl?: string
}

// 评审批次
export interface Batch {
  id: string
  name: string
  access_code: string | null
  baidu_link: string | null
  rating_dimensions: RatingDimension[]
  materials: Material[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// 单条素材评分
export interface MaterialRating {
  material_id: string
  values: Record<string, number | boolean> // dimension_key -> value
  suggestion?: string
}

// 评审提交
export interface Submission {
  id: string
  batch_id: string
  reviewer_name: string
  ratings: MaterialRating[]
  submitted_at: string
}

// 默认评分维度
export const DEFAULT_DIMENSIONS: RatingDimension[] = [
  { key: 'quality', label: '画质', type: 'star', max: 5 },
  { key: 'composition', label: '构图', type: 'star', max: 5 },
  { key: 'color', label: '色彩', type: 'star', max: 5 },
  { key: 'usability', label: '可用性', type: 'star', max: 5 },
  { key: 'selected', label: '是否选用', type: 'yesno' },
]
