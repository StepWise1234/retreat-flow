
-- Move Relational Container (sort_order 3) to after Serotonin Toxicity (16), before StepWise Approach (17)
-- Step 1: Shift videos at sort_order 4-16 down by 1
UPDATE course_videos
SET sort_order = sort_order - 1
WHERE training_level = 'beginning'
  AND sort_order >= 4 AND sort_order <= 16;

-- Step 2: Set Relational Container to sort_order 16
UPDATE course_videos
SET sort_order = 16
WHERE id = '6290ee78-ca22-41cc-811c-b61382cf0518';
