import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Download, Lock, Unlock, Copy, BarChart3, MessageSquare,
} from 'lucide-react'
import { getBatch, updateBatch, getBatchSubmissions } from '../lib/api'
import { exportCSV, calcAverage } from '../lib/utils'
import type { Batch, Submission } from '../lib/types'

export function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'summary' | 'detail' | 'suggestions'>('summary')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getBatch(id), getBatchSubmissions(id)])
      .then(([b, s]) => {
        setBatch(b)
        setSubmissions(s)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function toggleActive() {
    if (!batch) return
    await updateBatch(batch.id, { is_active: !batch.is_active })
    setBatch({ ...batch, is_active: !batch.is_active })
  }

  async function copyReviewLink() {
    const link = `${window.location.origin}/review/${batch?.id}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getReviewLink(): string {
    return `${window.location.origin}/review/${batch?.id}`
  }

  function handleExport() {
    if (!batch) return
    const headers = ['评审人', '素材', ...batch.rating_dimensions.map(d => d.label), '建议', '提交时间']
    const rows = submissions.flatMap(sub =>
      sub.ratings.map(r => {
        const mat = batch.materials.find(m => m.id === r.material_id)
        const dimValues = batch.rating_dimensions.map(d => {
          const v = r.values[d.key]
          return d.type === 'yesno' ? (v ? '是' : '否') : String(v ?? '')
        })
        return [sub.reviewer_name, mat?.name || r.material_id, ...dimValues, r.suggestion || '', new Date(sub.submitted_at).toLocaleString('zh-CN')]
      })
    )
    exportCSV(headers, rows, `${batch.name}-评审结果.csv`)
  }

  function getMaterialStats(materialId: string) {
    const subs = submissions.filter(s =>
      s.ratings.some(r => r.material_id === materialId)
    )
    if (subs.length === 0) return null

    const starDims = batch!.rating_dimensions.filter(d => d.type === 'star')
    const avgScores: Record<string, number> = {}
    let totalStarAvg = 0

    starDims.forEach(dim => {
      const values = subs
        .map(s => {
          const r = s.ratings.find(r => r.material_id === materialId)
          return (r?.values[dim.key] as number) || 0
        })
        .filter(v => v > 0)
      const avg = calcAverage(values)
      avgScores[dim.key] = avg
      totalStarAvg += avg
    })

    const yesNoDim = batch!.rating_dimensions.find(d => d.type === 'yesno')
    let selectedCount = 0
    if (yesNoDim) {
      selectedCount = subs.filter(s => {
        const r = s.ratings.find(r => r.material_id === materialId)
        return r?.values[yesNoDim.key] === true
      }).length
    }

    return {
      avgScores,
      totalAvg: starDims.length > 0 ? totalStarAvg / starDims.length : 0,
      selectedCount,
      reviewerCount: subs.length,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">批次不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex-1">{batch.name}</h1>
            <button
              onClick={toggleActive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                batch.is_active
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {batch.is_active ? <><Unlock size={14} /> 开放中</> : <><Lock size={14} /> 已关闭</>}
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyReviewLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600
                         rounded-lg text-sm hover:bg-blue-100 transition-colors"
            >
              <Copy size={14} />
              {copied ? '已复制' : '复制评审链接'}
            </button>
            <span className="text-xs text-gray-400 self-center truncate max-w-[200px]">
              {getReviewLink()}
            </span>
            <div className="flex-1" />
            <button
              onClick={handleExport}
              disabled={submissions.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600
                         rounded-lg text-sm hover:bg-gray-50 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              导出 CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
            <p className="text-xs text-gray-400 mt-1">评审人数</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-700">{batch.materials.length}</p>
            <p className="text-xs text-gray-400 mt-1">素材数量</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{batch.rating_dimensions.length}</p>
            <p className="text-xs text-gray-400 mt-1">评分维度</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
          {([
            ['summary', '综合排名', BarChart3],
            ['detail', '详细数据', Download],
            ['suggestions', '建议汇总', MessageSquare],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Summary */}
        {tab === 'summary' && (
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">暂无评审数据</div>
            ) : (
              [...batch.materials]
                .map(m => ({ mat: m, stats: getMaterialStats(m.id) }))
                .filter(({ stats }) => stats !== null)
                .sort((a, b) => (b.stats!.totalAvg) - (a.stats!.totalAvg))
                .map(({ mat, stats }, rank) => (
                  <div key={mat.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        rank === 0 ? 'bg-amber-400' : rank < 3 ? 'bg-gray-300' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {rank + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{mat.name}</h3>
                        <p className="text-xs text-gray-400">
                          {stats!.reviewerCount} 人评审 · {stats!.selectedCount} 人选用
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-blue-600">
                          {stats!.totalAvg.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">分</span>
                      </div>
                    </div>
                    {/* Dimension scores */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {batch.rating_dimensions.filter(d => d.type === 'star').map(dim => (
                        <div key={dim.key} className="bg-gray-50 rounded-lg px-3 py-1.5">
                          <p className="text-xs text-gray-400">{dim.label}</p>
                          <p className="font-semibold text-sm text-gray-700">
                            {stats!.avgScores[dim.key]?.toFixed(1) || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Tab: Detail */}
        {tab === 'detail' && (
          <div className="overflow-x-auto">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">暂无评审数据</div>
            ) : (
              <table className="w-full text-sm bg-white rounded-xl border border-gray-200">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">评审人</th>
                    <th className="text-left px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">素材</th>
                    {batch.rating_dimensions.map(dim => (
                      <th key={dim.key} className="text-center px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">
                        {dim.label}
                      </th>
                    ))}
                    <th className="text-left px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">建议</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.flatMap(sub =>
                    sub.ratings.map((r, i) => {
                      const mat = batch.materials.find(m => m.id === r.material_id)
                      return (
                        <tr key={`${sub.id}-${i}`} className="border-b border-gray-100 last:border-0">
                          {i === 0 && (
                            <td className="px-3 py-2 text-gray-700 whitespace-nowrap font-medium" rowSpan={sub.ratings.length}>
                              {sub.reviewer_name}
                            </td>
                          )}
                          <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{mat?.name || '-'}</td>
                          {batch.rating_dimensions.map(dim => (
                            <td key={dim.key} className="px-3 py-2 text-center text-gray-700">
                              {dim.type === 'yesno'
                                ? (r.values[dim.key] ? '✅' : '❌')
                                : `${r.values[dim.key] || '-'}`}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-gray-500 text-xs max-w-[200px] truncate">
                            {r.suggestion || '-'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Suggestions */}
        {tab === 'suggestions' && (
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">暂无建议</div>
            ) : (
              batch.materials.map(mat => {
                const suggestions = submissions
                  .flatMap(s => s.ratings.filter(r => r.material_id === mat.id && r.suggestion))
                  .map(r => ({
                    reviewer: submissions.find(s => s.ratings.includes(r))?.reviewer_name || '',
                    text: r.suggestion!,
                  }))
                if (suggestions.length === 0) return null
                return (
                  <div key={mat.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{mat.name}</h3>
                    <div className="space-y-2">
                      {suggestions.map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-xs text-blue-500 font-medium">{s.reviewer}</span>
                          <p className="text-sm text-gray-700 mt-1">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
