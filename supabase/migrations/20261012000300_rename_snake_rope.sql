-- Sawyer renamed Blueprint No. 002: it's "The Snake Rope".
update public.blueprints
set name = 'The Snake Rope', slug = 'snake-rope', updated_at = now()
where slug = 'snaking-pillar-structure';
