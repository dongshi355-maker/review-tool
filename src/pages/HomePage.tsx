import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ClipboardList, ChevronRight, Lock, Unlock } from 'lucide-react'
import { getBatches, deleteBatch } from '../lib/api'
import type { Batch } from '../lib/types'

export function HomePage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBatches()
  }, [])

  async function loadBatches() {
    try {
      setLoading(true)
      setError('')
      const data = await getBatches()
      setBatches(data)
    } catch (e) {
      setError('加载失败，请检查数据库连接')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此批次？')) return
    await deleteBatch(id)
    loadBatches()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">视频素材评审</h1>
            <p className="text-sm text-gray-500 mt-1">管理评审批次，查看评审结果</p>
          </div>
          <Link
            to="/batch/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            新建批次
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Batch List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 mb-4">暂无评审批次</p>
            <Link
              to="/batch/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                         rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={18} />
              创建第一个批次
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center
                           justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{batch.name}</h3>
                    {batch.is_active ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Unlock size={10} />开放中
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        <Lock size={10} />已关闭
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {batch.materials?.length || 0} 条素材 ·{' '}
                    {batch.rating_dimensions?.length || 0} 个评分维度 ·{' '}
                    {batch.access_code ? `访问码: ${batch.access_code}` : '无访问码'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    to={`/batch/${batch.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600
                               hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    查看结果 <ChevronRight size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(batch.id)}
                    className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
