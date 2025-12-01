-- THIS IS CRITICAL AS PART OF THIS UPDATE
-- THIS WILL IMPROVE PERFORMANCE WHEN DEALING WITH LARGE NUMBERS OF IMAGES

ALTER TABLE images ADD COLUMN image_lo_oid OID;
ALTER TABLE images ADD COLUMN image_hires_lo_oid OID;

CREATE OR REPLACE FUNCTION bytea_to_lo(data BYTEA)
RETURNS OID
AS $$
DECLARE
    lo_id OID;
BEGIN
    lo_id := lo_create(0);                       -- Create new LO
    PERFORM lowrite(lo_open(lo_id, 131072), data); -- 131072 = INV_WRITE
    RETURN lo_id;
END;
$$ LANGUAGE plpgsql;

UPDATE images
SET image_lo_oid = bytea_to_lo(image_bytes_tx)
WHERE image_lo_oid IS NULL;

UPDATE images
SET image_hires_lo_oid = bytea_to_lo(image_hires_bytes_tx)
WHERE image_hires_lo_oid IS null and image_hires_bytes_tx is not null;

--Execute this as  the SAME USER your Chamomile instance uses. If not, run this:
--Replace "to chamomile" with whatever your user is for chamomile

 CREATE OR REPLACE FUNCTION grant_on_hires_loids()
RETURNS void AS $$
DECLARE
    lo_oid oid;
BEGIN
    FOR lo_oid IN
        SELECT image_hires_lo_oid FROM images WHERE image_hires_lo_oid IS NOT NULL
    LOOP
        EXECUTE format(
            'GRANT all ON LARGE OBJECT %s TO chamomile;',
            lo_oid
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;


 CREATE OR REPLACE FUNCTION grant_on_sd_loids()
RETURNS void AS $$
DECLARE
    lo_oid oid;
BEGIN
    FOR lo_oid IN
        SELECT image_lo_oid FROM images WHERE image_lo_oid IS NOT NULL
    LOOP
        EXECUTE format(
            'GRANT all ON LARGE OBJECT %s TO chamomile;',
            lo_oid
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

--VERIFY that Chamomile is now able to access your images

--Then:

ALTER TABLE images
    DROP COLUMN image_hires_in,
    ADD COLUMN image_hires_in boolean GENERATED ALWAYS AS (image_hires_lo_oid IS NOT NULL) STORED;

ALTER TABLE images
ALTER COLUMN image_bytes_tx DROP NOT NULL;

--VERIFY: That chamomile is able to CREATE, READ, UPSCALE, and DELETE images
--MAKE SURE THIS WORKS. THIS IS THE POINT OF NO RETURN.

alter table images
	drop column image_effective_size_nb;

ALTER TABLE images
drop COLUMN image_bytes_tx
drop COLUMN image_hires_bytes_tx;