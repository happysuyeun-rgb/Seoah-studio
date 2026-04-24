-- v2.1: projects.status 허용 값 명시 (draft | parsing | ready | pending_payment | paid | fulfilled | error)
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check CHECK (
    status IN (
      'draft',
      'parsing',
      'ready',
      'pending_payment',
      'paid',
      'fulfilled',
      'error'
    )
  );
