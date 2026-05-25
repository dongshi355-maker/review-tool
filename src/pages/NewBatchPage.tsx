import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Shuffle } from 'lucide-react'
import { createBatch } from '../lib/api'
import { generateId, generateAccessCode } from '../lib/utils'
import { DEFAULT_DIMENSIONS, type RatingDimension, type Material } from '../lib/types'

export function NewBatchPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [baiduLink, setBaiduLink] = useState('')
  const [dimensions, setDimensions] = useState<RatingDimension[]>(
    DEFAULT_DIMENSIONS.map(d => ({ ...d }))
  )
  const [materials, setMaterials] = useState<Material[]>([
    { id: generateId(), name: '', videoUrl: '' },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function addMaterial() {
    setMaterials([...materials, { id: generateId(), name: '', videoUrl: '' }])
  }

  function removeMaterial(index: number) {
    if (materials.length <= 1) return
    setMaterials(materials.filter((_, i) => i !== index))
  }

  function updateMaterial(index: number, field: keyof Material, value: string) {
    const updated = [...materials]
    updated[index] = { ...updated[index], [field]: value }
    setMaterials(updated)
  }

  function addDimension() {
    const newKey = `dim_${Date.now()}`
    setDimensions([...dimensions, { key: newKey, label: '', type: 'star', max: 5 }])
  }

  function removeDimension(index: number) {
    setDimensions(dimensions.filter((_, i) => i !== index))
  }

  function updateDimension(index: number, field: keyof RatingDimension, value: string | number) {
    const updated = [...dimensions]
    updated[index] = { ...updated[index], [field]: value as never }
    setDimensions(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // 校验
    if (!name.trim()) { setError('请输入批次名称'); return }
    if (materials.some(m => !m.name.trim())) { setError('请填写所有素材名称'); return }
    if (dimensions.some(d => !d.label.trim())) { setError('请填写所有评分维度名称'); return }

    try {
      setSubmitting(true)
      const batch = await createBatch({
        name: name.trim(),
        access_code: accessCode.trim() || null,
        baidu_link: baiduLink.trim() || null,
        rating_dimensions: dimensions.filter(d => d.label.trim()),
        materials: materials.filter(m => m.name.trim()).map(m => ({
          id: m.id,
          name: m.name.trim(),
          videoUrl: m.videoUrl?.trim() || undefined,
        })),
        is_active: true,
      })
      navigate(`/batch/${batch.id}`)
    } catch (e) {
      setError('创建失败，请检查数据库连接')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">新建评审批次</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">基本信息</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                批次名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例如：第3批素材评审"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">访问码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="留空则不限制"
                    maxLength={6}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setAccessCode(generateAccessCode())}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600
                               bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    <Shuffle size={14} />
                    随机
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">百度云链接</label>
                <input
                  type="text"
                  value={baiduLink}
                  onChange={e => setBaiduLink(e.target.value)}
                  placeholder="评审完成后展示"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 评分维度 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                评分维度 <span className="text-red-400">*</span>
              </h2>
              <button
                type="button"
                onClick={addDimension}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600
                           hover:bg-blue-50 rounded-lg"
              >
                <Plus size={16} /> 添加维度
              </button>
            </div>
            <div className="space-y-3">
              {dimensions.map((dim, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={dim.label}
                    onChange={e => updateDimension(i, 'label', e.target.value)}
                    placeholder="维度名称（如：画质）"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={dim.type}
                    onChange={e => updateDimension(i, 'type', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="star">1-5 星评分</option>
                    <option value="yesno">是/否</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeDimension(i)}
                    className="p-2 text-gray-300 hover:text-red-400"
                    disabled={dimensions.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 素材列表 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                素材列表 <span className="text-red-400">*</span>
              </h2>
              <button
                type="button"
                onClick={addMaterial}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600
                           hover:bg-blue-50 rounded-lg"
              >
                <Plus size={16} /> 添加素材
              </button>
            </div>
            <div className="space-y-3">
              {materials.map((mat, i) => (
                <div key={mat.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-2 w-6 h-6 rounded-full bg-gray-100 text-gray-500
                                   text-xs font-medium flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={mat.name}
                      onChange={e => updateMaterial(i, 'name', e.target.value)}
                      placeholder="素材名称（如：公园空镜）"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-400 flex-shrink-0">视频直链：</span>
                      <input
                        type="text"
                        value={mat.videoUrl || ''}
                        onChange={e => updateMaterial(i, 'videoUrl', e.target.value)}
                        placeholder="腾讯云 COS 视频直链（如无先留空）"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMaterial(i)}
                    className="flex-shrink-0 p-2 text-gray-300 hover:text-red-400"
                    disabled={materials.length <= 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium
                       hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '创建中...' : '创建批次'}
          </button>
        </form>
      </div>
    </div>
  )
}
