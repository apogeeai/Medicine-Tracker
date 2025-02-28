-- Create medications table
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    total_pills INTEGER NOT NULL,
    pills_remaining INTEGER NOT NULL,
    daily_dose INTEGER NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create intake_history table
CREATE TABLE IF NOT EXISTS public.intake_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID REFERENCES public.medications(id),
    count INTEGER NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for testing (you should modify this for production)
CREATE POLICY "Allow anonymous access to medications"
    ON public.medications FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous access to intake_history"
    ON public.intake_history FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Update function for timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER handle_medications_updated_at
    BEFORE UPDATE ON public.medications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.medications TO anon;
GRANT ALL ON public.intake_history TO anon; 