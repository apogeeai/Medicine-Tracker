-- Create medication table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  total_pills INTEGER NOT NULL,
  pills_remaining INTEGER NOT NULL,
  daily_dose INTEGER NOT NULL,
  start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create intake history table
CREATE TABLE intake_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  count INTEGER NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_history ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own data
CREATE POLICY "Users can view their own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Intake history policies
CREATE POLICY "Users can view their own intake history"
  ON intake_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM medications
    WHERE medications.id = intake_history.medication_id
    AND medications.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own intake history"
  ON intake_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM medications
    WHERE medications.id = intake_history.medication_id
    AND medications.user_id = auth.uid()
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 