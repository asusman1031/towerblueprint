-- The newest build photos are now cut out onto a see-through background
-- (WebP), so they sit right on the page instead of on a mismatched paper square.
update public.blueprints set photo_url = '/photos/crazy-lego-tower.webp',
  bricks = jsonb_set(bricks, '{photos}', '["/photos/crazy-lego-tower-back.webp"]')
where slug = 'crazy-lego-tower';

update public.blueprints set photo_url = '/photos/james-tower.webp',
  bricks = jsonb_set(bricks, '{photos}', '["/photos/james-tower-back.webp"]')
where slug = 'james-tower';

update public.blueprints set photo_url = '/photos/box-tower.webp',
  boxes = jsonb_set(boxes, '{photos}', '["/photos/box-tower-back.webp"]')
where slug = 'box-tower';

update public.blueprints set photo_url = '/photos/dice-wall.webp'
where slug = 'dice-wall';
