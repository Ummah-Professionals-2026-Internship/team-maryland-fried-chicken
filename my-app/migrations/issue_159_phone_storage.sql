BEGIN;

-- Preserve the country code and digits submitted by the forms.
-- Existing applicant and advisor triggers already call this function.
CREATE OR REPLACE FUNCTION public.normalize_phone_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.phone_number IS NULL OR BTRIM(NEW.phone_number) = '' THEN
        RETURN NEW;
    END IF;

    IF NEW.phone_number !~ '^\+[1-9][0-9]{1,14}$' THEN
        RAISE EXCEPTION
            'Phone number must include a country code followed by digits only';
    END IF;

    RETURN NEW;
END;
$$;

COMMIT;