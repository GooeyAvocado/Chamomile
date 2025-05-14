CREATE OR REPLACE view chamomile.model_usage
AS  select model_title_tx, count(*) as model_usage_count from chamomile.images group by model_title_tx

CREATE OR REPLACE view chamomile.lora_usage
AS select lora_alias_tx, count(*) as lora_usage_count from images_lora_map group by lora_alias_tx