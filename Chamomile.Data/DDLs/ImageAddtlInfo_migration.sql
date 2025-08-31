--This is an optional script to try and tie together images, and add original prompt metadata
-- You don't need to run this but maybe some things will be linked right

-- STEP 1: IMAGES TO SAVED PROMPTS
update images i
set img_addtl_info_mv = jsonb_build_object(
        'albums', '[]'::jsonb,
        'sample', p.image_id,
        'source', 'SAVED_PROMPT'
    )
from prompts p
where (p.prompt_prompt_tx = i.image_prompt_tx
   or p.prompt_prompt_tx = i.image_base_prompt_tx) 
and i.img_addtl_info_mv is null;

-- STEP 2: MATCHING IMAGE_BASE_PROMPTs
with base_samples as (
    select image_base_prompt_tx,
           min(image_id) as min_image_id
    from images
    where image_base_prompt_tx is not null
    group by image_base_prompt_tx
)
update images i
set img_addtl_info_mv = jsonb_build_object(
        'albums', '[]'::jsonb,
        'sample', b.min_image_id,
        'source', 'IMAGE_BASE'
    )
from base_samples b
where i.image_base_prompt_tx = b.image_base_prompt_tx
  and i.img_addtl_info_mv is null
  and i.image_base_prompt_tx is not null 
  and length(i.image_base_prompt_tx) > 0
  ;


--STEP 3: MATCHING IMAGE PROMPTs

with base_samples as (
    select image_prompt_tx,
           min(image_id) as min_image_id
    from images
    where image_prompt_tx is not null
      and length(image_prompt_tx) > 0
    group by image_prompt_tx
),
resolved_samples as (
    select b.image_prompt_tx,
           coalesce(
               (i.img_addtl_info_mv ->> 'sample')::int,  -- if min image already has a sample
               b.min_image_id                             -- otherwise just use min image_id
           ) as sample_image_id
    from base_samples b
    join images i
      on i.image_id = b.min_image_id
)
update images i
set img_addtl_info_mv = jsonb_build_object(
        'albums', '[]'::jsonb,
        'sample', r.sample_image_id,
        'source', 'IMAGE'
    )
from resolved_samples r
where i.image_prompt_tx = r.image_prompt_tx
  and i.img_addtl_info_mv is null
  and i.image_prompt_tx is not null
  and length(i.image_prompt_tx) > 0;


--STEP 4: Original prompts

update images i
set img_addtl_info_mv = jsonb_build_object(
        'albums', '[]'::jsonb,
        'sample', -1,
        'source', 'PROMPTBOX'
    )
where (img_addtl_info_mv ->> 'sample')::int = i.image_id;

