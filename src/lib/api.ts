import { getSupabase } from './supabase'
import type { Batch, Submission } from './types'

// === 批次操作 ===

export async function createBatch(batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('batches')
    .insert({
      name: batch.name,
      access_code: batch.access_code || null,
      baidu_link: batch.baidu_link || null,
      rating_dimensions: batch.rating_dimensions,
      materials: batch.materials,
      is_active: batch.is_active,
    })
    .select()
    .single()
  if (error) throw error
  return data as Batch
}

export async function getBatches() {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Batch[]
}

export async function getBatch(id: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Batch
}

export async function getBatchByAccessCode(code: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('access_code', code)
    .eq('is_active', true)
  if (error) throw error
  return data as Batch[]
}

export async function updateBatch(id: string, updates: Partial<Batch>) {
  const supabase = await getSupabase()
  const { error } = await supabase
    .from('batches')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteBatch(id: string) {
  const supabase = await getSupabase()
  const { error } = await supabase.from('batches').delete().eq('id', id)
  if (error) throw error
}

// === 评审提交操作 ===

export async function submitReview(submission: Omit<Submission, 'id' | 'submitted_at'>) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      batch_id: submission.batch_id,
      reviewer_name: submission.reviewer_name,
      ratings: submission.ratings,
    })
    .select()
    .single()
  if (error) throw error
  return data as Submission
}

export async function getBatchSubmissions(batchId: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('batch_id', batchId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data as Submission[]
}
