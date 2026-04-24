-- Run after 001_initial_schema.sql. Seed 3 sample templates (minimal HTML).
-- Replace html_template with full HTML in real use.

INSERT INTO public.templates (id, name, category, thumbnail_url, html_template, variables, tags, is_active) VALUES
(
  gen_random_uuid(),
  '포트폴리오 클래식',
  'portfolio',
  'https://placehold.co/400x300?text=Portfolio',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>{{company}}</title><style>:root{--color-primary: {{color_primary}};} body{font-family:sans-serif;margin:2rem;} h1{color:var(--color-primary);} .cta{background:var(--color-primary);color:#fff;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;display:inline-block;}</style></head><body><h1>{{headline}}</h1><p>{{description}}</p><p>{{feature_1}}</p><p>{{feature_2}}</p><p>{{feature_3}}</p><a href="#" class="cta">{{cta}}</a><p>{{contact}}</p></body></html>',
  '{"company","headline","description","feature_1","feature_2","feature_3","cta","contact","color_primary","color_secondary"}'::jsonb,
  ARRAY['포트폴리오','원페이지','프리랜서'],
  true
),
(
  gen_random_uuid(),
  '랜딩 심플',
  'homepage',
  'https://placehold.co/400x300?text=Landing',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>{{company}}</title><style>:root{--color-primary: {{color_primary}};} body{font-family:sans-serif;margin:2rem;} h1{color:var(--color-primary);} .cta{background:var(--color_primary);color:#fff;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;display:inline-block;}</style></head><body><h1>{{headline}}</h1><p>{{description}}</p><a href="#" class="cta">{{cta}}</a><p>{{contact}}</p></body></html>',
  '{"company","headline","description","cta","contact","color_primary","color_secondary"}'::jsonb,
  ARRAY['랜딩','스타트업','심플'],
  true
),
(
  gen_random_uuid(),
  '앱 MVP 소개',
  'app-mvp',
  'https://placehold.co/400x300?text=MVP',
  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>{{company}}</title><style>:root{--color-primary: {{color_primary}};} body{font-family:sans-serif;margin:2rem;} h1{color:var(--color_primary);} .cta{background:var(--color_primary);color:#fff;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;display:inline-block;}</style></head><body><h1>{{headline}}</h1><p>{{description}}</p><ul><li>{{feature_1}}</li><li>{{feature_2}}</li><li>{{feature_3}}</li></ul><a href="#" class="cta">{{cta}}</a><p>{{contact}}</p></body></html>',
  '{"company","headline","description","feature_1","feature_2","feature_3","cta","contact","color_primary","color_secondary"}'::jsonb,
  ARRAY['SaaS','앱','MVP'],
  true
);
