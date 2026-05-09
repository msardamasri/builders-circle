-- 1. Borrar duplicados manteniendo solo el registro mas antiguo de cada par
DELETE FROM matches
WHERE id NOT IN (
  SELECT DISTINCT ON (
    LEAST(founder_a_id::text, founder_b_id::text),
    GREATEST(founder_a_id::text, founder_b_id::text)
  ) id
  FROM matches
  ORDER BY
    LEAST(founder_a_id::text, founder_b_id::text),
    GREATEST(founder_a_id::text, founder_b_id::text),
    created_at ASC
);

-- 2. Añadir constraint para que no vuelva a pasar
CREATE UNIQUE INDEX idx_matches_unique_pair
ON matches (
  LEAST(founder_a_id::text, founder_b_id::text),
  GREATEST(founder_a_id::text, founder_b_id::text)
);