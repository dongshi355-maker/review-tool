-- 视频素材评审工具 - 数据库建表
-- 在 Supabase SQL Editor 中执行：https://supabase.com/dashboard/project/dbvvzlopqmxqgvaezpnu/sql/new

-- 1. 评审批次表
CREATE TABLE IF NOT EXISTS batches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  access_code   TEXT,
  baidu_link    TEXT,
  rating_dimensions JSONB NOT NULL DEFAULT '[]'::jsonb,
  materials     JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. 评审提交表
CREATE TABLE IF NOT EXISTS submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id      UUID REFERENCES batches(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  ratings       JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. 启用 Row Level Security（允许公开访问）
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 4. 创建公开访问策略
CREATE POLICY "Enable all access for batches" ON batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);

-- 5. 创建索引
CREATE INDEX idx_submissions_batch ON submissions(batch_id);
CREATE INDEX idx_batches_active ON batches(is_active);
