-- Create journal_questions table
CREATE TABLE IF NOT EXISTS journal_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_answers table
CREATE TABLE IF NOT EXISTS journal_answers (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id INTEGER NOT NULL REFERENCES journal_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_answers_user_id ON journal_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_answers_question_id ON journal_answers(question_id);

-- Enable Row Level Security
ALTER TABLE journal_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journal_questions (public read access)
CREATE POLICY "Anyone can read journal questions"
  ON journal_questions
  FOR SELECT
  USING (true);

-- RLS Policies for journal_answers
-- Note: Backend uses service_role key which bypasses RLS
-- These policies allow service role access (automatic) and provide
-- a fallback for any direct client access scenarios
CREATE POLICY "Allow all access for service role"
  ON journal_answers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert some sample journal questions
INSERT INTO journal_questions (question) VALUES
  ('What are your short-term financial goals (next 3-6 months)?'),
  ('What are your long-term financial goals (1-5 years)?'),
  ('What financial habits would you like to improve?'),
  ('What is your biggest financial concern right now?'),
  ('What financial achievement are you most proud of?'),
  ('How do you feel about your current financial situation?'),
  ('What steps are you taking to build wealth?'),
  ('What financial lessons have you learned recently?'),
  ('How do you prioritize your spending?'),
  ('What would financial freedom look like for you?')
ON CONFLICT DO NOTHING;
