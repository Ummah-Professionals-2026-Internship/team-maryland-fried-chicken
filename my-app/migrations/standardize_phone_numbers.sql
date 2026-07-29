CREATE OR REPLACE FUNCTION public.format_us_phone(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    digits TEXT;
BEGIN
    digits := regexp_replace(phone, '[^0-9]', '', 'g');

    IF length(digits) = 11 AND left(digits, 1) = '1' THEN
        digits := substr(digits, 2);
    END IF;

    IF length(digits) <> 10 THEN
        RAISE EXCEPTION 'Phone number must contain exactly 10 US digits';
    END IF;

    RETURN '+1 (' || substr(digits, 1, 3) || ') ' ||
           substr(digits, 4, 3) || '-' || substr(digits, 7, 4);
END;
$$;

UPDATE public.applicants
SET phone_number = public.format_us_phone(phone_number)
WHERE phone_number IS NOT NULL;

UPDATE public.advisors
SET phone_number = public.format_us_phone(phone_number)
WHERE phone_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.normalize_phone_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.phone_number IS NOT NULL THEN
        NEW.phone_number := public.format_us_phone(NEW.phone_number);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_applicant_phone ON public.applicants;
CREATE TRIGGER normalize_applicant_phone
BEFORE INSERT OR UPDATE OF phone_number ON public.applicants
FOR EACH ROW
EXECUTE FUNCTION public.normalize_phone_number();

DROP TRIGGER IF EXISTS normalize_advisor_phone ON public.advisors;
CREATE TRIGGER normalize_advisor_phone
BEFORE INSERT OR UPDATE OF phone_number ON public.advisors
FOR EACH ROW
EXECUTE FUNCTION public.normalize_phone_number();
