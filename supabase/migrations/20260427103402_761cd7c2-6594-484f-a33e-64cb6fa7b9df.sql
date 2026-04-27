CREATE TABLE public.module_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_slug)
);

ALTER TABLE public.module_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own module interests"
  ON public.module_interests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own module interests"
  ON public.module_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own module interests"
  ON public.module_interests FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_module_interests_module_slug ON public.module_interests(module_slug);