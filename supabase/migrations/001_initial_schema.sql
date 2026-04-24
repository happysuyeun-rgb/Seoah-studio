-- SEOAH.STUDIO Phase 1: Initial schema + RLS

-- 1. users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  avatar_url text,
  provider text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. templates
CREATE TABLE IF NOT EXISTS public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  thumbnail_url text,
  html_template text NOT NULL,
  variables jsonb,
  tags text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.templates(id),
  status text DEFAULT 'draft',
  input_data jsonb,
  output_html text,
  custom_params jsonb,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  project_id uuid NOT NULL REFERENCES public.projects(id),
  plan_type text,
  amount integer NOT NULL,
  payment_key text,
  imp_uid text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- 5. downloads
CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  file_type text,
  file_url text,
  downloaded_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- users: SELECT/UPDATE own row
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- templates: SELECT all, INSERT/UPDATE/DELETE for admin (handled in app or service role)
CREATE POLICY "templates_select_all" ON public.templates FOR SELECT USING (true);
CREATE POLICY "templates_insert_admin" ON public.templates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "templates_update_admin" ON public.templates FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "templates_delete_admin" ON public.templates FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- projects: all for owner where deleted_at IS NULL
CREATE POLICY "projects_all_own" ON public.projects FOR ALL USING (
  auth.uid() = user_id AND deleted_at IS NULL
);

-- orders: SELECT own
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- downloads: SELECT via orders
CREATE POLICY "downloads_select_via_orders" ON public.downloads FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = downloads.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "downloads_insert_own" ON public.downloads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = downloads.order_id AND o.user_id = auth.uid())
);

-- Trigger: on auth.users insert -> public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    provider = EXCLUDED.provider;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
