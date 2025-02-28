'use client';

import { useState, useEffect } from 'react';
import { testSupabaseConnection } from '@/lib/supabase-client';

export default function TestPage() {
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    error?: string;
    data?: any;
    loading?: boolean;
    details?: any;
  }>({ loading: true });

  const runTest = async () => {
    try {
      setTestResult({ loading: true });
      console.log('Starting connection test...');
      const result = await testSupabaseConnection();
      console.log('Test result:', result);
      setTestResult({ ...result, loading: false });
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
        details: error
      });
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Supabase Connection Test
            </h1>
            
            <div className="mt-4">
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex">
                  <div className="flex-1">
                    {testResult.loading ? (
                      <div className="flex items-center text-gray-600">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Testing connection...
                      </div>
                    ) : testResult.success ? (
                      <div>
                        <div className="flex items-center text-green-800">
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Connection successful
                        </div>
                        {testResult.data && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-900">Response data:</h4>
                            <pre className="mt-2 text-sm text-gray-500 bg-gray-100 p-4 rounded-md overflow-auto">
                              {JSON.stringify(testResult.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center text-red-800">
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          Connection failed
                        </div>
                        {testResult.error && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-900">Error details:</h4>
                            <pre className="mt-2 text-sm text-red-600 bg-red-50 p-4 rounded-md overflow-auto whitespace-pre-wrap">
                              {testResult.error}
                              {testResult.details && `\n\nAdditional details:\n${JSON.stringify(testResult.details, null, 2)}`}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <button
                  onClick={runTest}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Test Again
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Check the browser console (F12) for detailed logs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 