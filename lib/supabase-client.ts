import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging
console.log('Supabase Config:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlFirstChars: supabaseUrl?.substring(0, 10),
  keyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function testSupabaseConnection() {
  console.log('Starting Supabase connection test...');
  
  try {
    // Test the medications table
    console.log('Testing medications table access...');
    const { data: medicationsData, error: medicationsError } = await supabase
      .from('medications')
      .select('*')
      .limit(1);

    if (medicationsError) {
      console.error('Medications table test failed:', medicationsError);
      
      // If the error is about the table not existing, we'll create it
      if (medicationsError.code === 'PGRST204') {
        console.log('Medications table does not exist. Creating it...');
        
        // Create the medications table
        const { error: createError } = await supabase.rpc('create_medications_table');
        
        if (createError) {
          return { 
            success: false, 
            error: 'Failed to create medications table. Please create the following tables manually:\n\n' +
                  '1. medications (id, name, total_pills, pills_remaining, daily_dose, start_date)\n' +
                  '2. intake_history (id, medication_id, count, taken_at)',
            details: {
              originalError: medicationsError,
              createError
            }
          };
        }
        
        return {
          success: true,
          data: {
            message: 'Database initialized successfully. Tables created.',
            tables: ['medications', 'intake_history']
          }
        };
      }
      
      return { 
        success: false, 
        error: `Table access failed: ${medicationsError.message}`,
        details: {
          code: medicationsError.code,
          hint: medicationsError.hint,
          details: medicationsError.details
        }
      };
    }

    // Create a test medication record
    console.log('Creating test medication record...');
    const testMedication = {
      name: 'Test Medication',
      total_pills: 30,
      pills_remaining: 30,
      daily_dose: 1,
      start_date: new Date().toISOString().split('T')[0]
    };

    const { data: createData, error: createError } = await supabase
      .from('medications')
      .insert([testMedication])
      .select();

    if (createError) {
      console.error('Failed to create test medication:', createError);
      return {
        success: false,
        error: `Failed to create test medication: ${createError.message}`,
        details: createError
      };
    }

    // Record a test intake
    console.log('Recording test intake...');
    const { data: intakeData, error: intakeError } = await supabase
      .from('intake_history')
      .insert([{
        medication_id: createData[0].id,
        count: 1
      }])
      .select();

    if (intakeError) {
      console.error('Failed to record test intake:', intakeError);
      return {
        success: false,
        error: `Failed to record test intake: ${intakeError.message}`,
        details: intakeError
      };
    }

    // Clean up test data
    console.log('Cleaning up test data...');
    await supabase
      .from('intake_history')
      .delete()
      .eq('medication_id', createData[0].id);
    
    await supabase
      .from('medications')
      .delete()
      .eq('id', createData[0].id);

    console.log('Connection test successful');
    return { 
      success: true, 
      data: {
        message: 'Successfully tested all database operations',
        testResults: {
          createMedication: createData[0],
          recordIntake: intakeData[0]
        }
      }
    };
  } catch (err) {
    console.error('Unexpected error during connection test:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      details: err
    };
  }
}

// Example medication functions
export async function createMedication(medication: {
  name: string;
  total_pills: number;
  pills_remaining: number;
  daily_dose: number;
  start_date: string;
}) {
  const { data, error } = await supabase
    .from('medications')
    .insert([medication])
    .select();

  if (error) throw error;
  return data;
}

export async function recordIntake(medicationId: string, count: number) {
  const { data, error } = await supabase
    .from('intake_history')
    .insert([{
      medication_id: medicationId,
      count: count
    }])
    .select();

  if (error) throw error;
  return data;
}

export async function getMedicationHistory(medicationId: string) {
  const { data, error } = await supabase
    .from('intake_history')
    .select('*')
    .eq('medication_id', medicationId)
    .order('taken_at', { ascending: false });

  if (error) throw error;
  return data;
} 