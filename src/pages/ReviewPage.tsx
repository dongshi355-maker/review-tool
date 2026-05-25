import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle, AlertCircle, LinkIcon } from 'lucide-react'
import { getBatch, submitReview } from '../lib/api'
import { MaterialCard } from '../components/MaterialCard'
import type { Batch, MaterialRating } from '../lib/types'

const LS_PREFIX = 'review_draft_'

export function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const codeFromUrl = searchParams.get('code') || ''

  const [batch, setBatch] = useState<Batch | null>(null)
  const [accessInput, setAccessInput] = useState(codeFromUrl)
  const [accessChecked, setAccessChecked] = useState(false)
  const [reviewerName] = useState(() => `匿名用户${Math.random().toString(36).slice(2, 8)}`)
  const [ratings, setRatings] = useState<Map<string, { values: Record<string, number | boolean>; suggestion: string }>>(new Map())
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 从 localStorage 恢复草稿
  useEffect(() => {
    if (!batch) return
    const saved = localStorage.getItem(`${LS_PREFIX}${batch.id}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setRatings(new Map(parsed.ratings || []))
      } catch { /* ignore */ }
    }
  }, [batch])

  // 自动保存草稿
  useEffect(() => {
    if (!batch || submitted) return
    const payload = {
      ratings: Array.from(ratings.entries()),
    }
    localStorage.setItem(`${LS_PREFIX}${batch.id}`, JSON.stringify(payload))
  }, [ratings, reviewerName, batch, submitted])

  async function checkAccess() {
    if (!batch?.access_code) {
      setAccessChecked(true)
      return
    }
    if (accessInput.toUpperCase() === batch.access_code.toUpperCase()) {
      setAccessChecked(true)
    } else {
      setError('访问码错误')
    }
  }

  function handleValueChange(materialId: string, dimKey: string, value: number | boolean) {
    setRatings(prev => {
      const next = new Map(prev)
      const current = next.get(materialId) || { values: {}, suggestion: '' }
      next.set(materialId, {
        ...current,
        values: { ...current.values, [dimKey]: value },
      })
      return next
    })
  }

  function handleSuggestionChange(materialId: string, text: string) {
    setRatings(prev => {
      const next = new Map(prev)
      const current = next.get(materialId) || { values: {}, suggestion: '' }
      next.set(materialId, { ...current, suggestion: text })
      return next
    })
  }

  async function handleSubmit() {
    if (!batch) {
      return
    }

    // 校验所有素材都已评分
    const unrated = batch.materials.filter(m => {
      const r = ratings.get(m.id)
      return !r || batch.rating_dimensions.some(d => r.values[d.key] === undefined || r.values[d.key] === null)
    })
    if (unrated.length > 0) {
      setError(`还有 ${unrated.length} 条素材未完成评分`)
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const materialRatings: MaterialRating[] = batch.materials.map(m => {
        const r = ratings.get(m.id)!
        return {
          material_id: m.id,
          values: r.values,
          suggestion: r.suggestion || '',
        }
      })
      await submitReview({
        batch_id: batch.id,
        reviewer_name: reviewerName.trim(),
        ratings: materialRatings,
      })
      setSubmitted(true)
      localStorage.removeItem(`${LS_PREFIX}${batch.id}`)
    } catch (e) {
      setError('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // Fetch batch
  useEffect(() => {
    if (!id) return
    getBatch(id)
      .then(b => {
        setBatch(b)
        if (!b.access_code) setAccessChecked(true)
        setLoading(false)
      })
      .catch(() => {
        setError('批次不存在或已关闭')
        setLoading(false)
      })
  }, [id])

  // --- 访问码校验页 ---
  if (batch && !accessChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{batch.name}</h2>
          <p className="text-sm text-gray-500 mb-6">此批次需要访问码</p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-600">{error}</div>
          )}
          {codeFromUrl && !error && (
            <p className="text-sm text-blue-600 mb-4">正在验证访问码...</p>
          )}
          <input
            type="text"
            value={accessInput}
            onChange={e => { setAccessInput(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={e => e.key === 'Enter' && checkAccess()}
            placeholder="输入访问码"
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg
                       tracking-[0.3em] uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={checkAccess}
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium
                       hover:bg-blue-700 transition-colors"
          >
            进入评审
          </button>
        </div>
      </div>
    )
  }

  // --- Loading / Error ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  if (error && !batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!batch) return null
  if (!batch.is_active && !submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">此批次已关闭</p>
        </div>
      </div>
    )
  }

  // --- 提交成功页 ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle size={64} className="mx-auto text-emerald-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">评审提交成功！</h2>
          <p className="text-gray-500 mb-8">感谢你的评审 🙏</p>
          {batch.baidu_link && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-800">素材下载链接</h3>
              </div>
              <a
                href={batch.baidu_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 break-all text-sm hover:underline"
              >
                {batch.baidu_link}
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- 评审页 ---
  const checkedCount = batch.materials.filter(m => {
    const r = ratings.get(m.id)
    return r && batch.rating_dimensions.every(d => r.values[d.key] !== undefined && r.values[d.key] !== null)
  }).length

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">{batch.name}</h1>
            <p className="text-xs text-gray-400">
              已完成 {checkedCount}/{batch.materials.length} 条
            </p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(checkedCount / batch.materials.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 匿名提示 */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <p className="text-xs text-gray-400 text-center">🕶️ 匿名评审，你的身份不会透露</p>
      </div>

      {/* Material Cards */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {batch.materials.map((mat, index) => (
          <MaterialCard
            key={mat.id}
            material={mat}
            index={index + 1}
            dimensions={batch.rating_dimensions}
            values={ratings.get(mat.id)?.values || {}}
            suggestion={ratings.get(mat.id)?.suggestion || ''}
            onValueChange={(k, v) => handleValueChange(mat.id, k, v)}
            onSuggestionChange={(text) => handleSuggestionChange(mat.id, text)}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="p-3 bg-red-50 rounded-lg text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Submit Button (fixed bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting || checkedCount < batch.materials.length}
            className="w-full py-3 rounded-xl font-medium transition-colors
                       bg-blue-600 text-white hover:bg-blue-700
                       disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting
              ? '提交中...'
              : checkedCount < batch.materials.length
              ? `提交评审 (${checkedCount}/${batch.materials.length})`
              : '提交评审'}
          </button>
        </div>
      </div>
    </div>
  )
}
