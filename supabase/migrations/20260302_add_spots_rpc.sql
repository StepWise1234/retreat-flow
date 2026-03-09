-- Create RPC function to increment spots_filled
CREATE OR REPLACE FUNCTION increment_spots_filled(p_training_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE trainings
  SET spots_filled = COALESCE(spots_filled, 0) + 1
  WHERE id = p_training_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to decrement spots_filled
CREATE OR REPLACE FUNCTION decrement_spots_filled(p_training_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE trainings
  SET spots_filled = GREATEST(COALESCE(spots_filled, 0) - 1, 0)
  WHERE id = p_training_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_spots_filled(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_spots_filled(uuid) TO authenticated;
