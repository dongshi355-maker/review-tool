import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dbvvzlopqmxqgvaezpnu.supabase.co',
  'sb_secret_lFQwiVHONMX1kcTHSl1RTg_AfEuGwpj'
)

// 用 REST API 无法执行 DDL，但可以试 RPC
// 实际上 Supabase 提供了一个 execute_sql 的办法

// 先检查现有表
const { data: existingBatches, error: batchesErr } = await supabase
  .from('batches')
  .select('id')
  .limit(1)

console.log('batches:', existingBatches, batchesErr?.message)

const { data: existingSubs, error: subsErr } = await supabase
  .from('submissions')
  .select('id')
  .limit(1)

console.log('submissions:', existingSubs, subsErr?.message)
