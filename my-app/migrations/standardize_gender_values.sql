UPDATE public.advisors
SET gender = CASE
    WHEN gender = 'Male' THEN 'Brother'
    WHEN gender = 'Female' THEN 'Sister'
    ELSE gender
END
WHERE gender IN ('Male', 'Female');

UPDATE public.applicants
SET gender = CASE
    WHEN gender = 'Male' THEN 'Brother'
    WHEN gender = 'Female' THEN 'Sister'
    ELSE gender
END
WHERE gender IN ('Male', 'Female');
