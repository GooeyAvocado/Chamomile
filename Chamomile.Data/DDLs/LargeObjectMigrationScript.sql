-- THIS IS CRITICAL AS PART OF THIS UPDATE
-- THIS WILL IMPROVE PERFORMANCE WHEN DEALING WITH LARGE NUMBERS OF IMAGES

CREATE TABLE ImageBinary_SD (
    image_id int4 PRIMARY KEY,
    image_bytes_tx BYTEA NOT NULL,
    CONSTRAINT fk_sd_image
        FOREIGN KEY (image_id) REFERENCES Images(image_id)
        ON DELETE CASCADE
);

CREATE TABLE ImageBinary_HD (
    image_id int4 PRIMARY KEY,
    image_bytes_tx BYTEA NOT NULL,
    CONSTRAINT fk_sd_image
        FOREIGN KEY (image_id) REFERENCES Images(image_id)
        ON DELETE CASCADE
);

INSERT INTO ImageBinary_SD (image_id, image_bytes_tx)
SELECT image_id, image_bytes_tx
FROM Images
ON CONFLICT (image_id) DO NOTHING;

INSERT INTO ImageBinary_HD (image_id, image_bytes_tx)
SELECT image_id, image_hires_bytes_tx
FROM Images
WHERE image_hires_bytes_tx IS NOT NULL
ON CONFLICT (image_id) DO NOTHING;

--VERIFY that Chamomile is now able to access your images

--Then:

ALTER TABLE images
    DROP COLUMN image_hires_in;

alter table Images add column IMAGE_HIRES_IN bool default false;

UPDATE Images i
SET image_hires_in = TRUE
WHERE EXISTS (
    SELECT 1 
    FROM ImageBinary_HD hr 
    WHERE hr.image_id = i.image_id
);

--VERIFY: That chamomile is able to CREATE, READ, UPSCALE, and DELETE images
--MAKE SURE THIS WORKS. THIS IS THE POINT OF NO RETURN.

alter table images
	drop column image_effective_size_nb;

ALTER TABLE images
    drop COLUMN image_bytes_tx,
    drop COLUMN image_hires_bytes_tx;

vacuum full images;

