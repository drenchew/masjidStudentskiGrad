import { useState, useEffect } from 'react';
import axios from '../../api/axios';

export default function TestAuth() {
  const [tokenInfo, setTokenInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    setTokenInfo({
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token?.substring(0, 50) + '...',
      tokenFull: token,
      userExists: !!user,
      userData: user ? JSON.parse(user) : null
    });
  }, []);

  const testEndpoint = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Full token:', token);
      console.log('Token length:', token?.length);
      
      const response = await axios.get('/api/admin/campaigns');
      setTestResult({ success: true, data: response.data });
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data 
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold mb-2">Token Info:</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(tokenInfo, null, 2)}</pre>
      </div>

      <button
        onClick={testEndpoint}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Admin Campaigns Endpoint
      </button>

      {testResult && (
        <div className={`mt-4 p-4 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h2 className="font-bold mb-2">Test Result:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
