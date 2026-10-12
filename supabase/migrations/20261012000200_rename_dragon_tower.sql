-- Ashton named Blueprint No. 003: it's "The Dragon Tower".
update public.blueprints
set name = 'The Dragon Tower', slug = 'dragon-tower', photo_url = '/photos/dragon-tower.jpg', updated_at = now()
where slug = 'ring-tower';
