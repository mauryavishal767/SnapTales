import React, { useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { useNavigate } from 'react-router-dom';

function VerificationPage() {
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [message, setMessage] = useState('');
  // If using react-router, otherwise remove useNavigate
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query params for userId and secret
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const secret = params.get('secret');

    if (!userId || !secret) {
      setStatus('error');
      setMessage('Invalid verification link.');
      console.log("not found userID : ", userId)
      console.log("not found secret : ", secret)
      return;
    }

    setStatus('pending');
    setMessage('Verifying your email...');

    const updateVerify = async () => {
        try{
            const verify = await account.updateVerification(userId, secret)
            setStatus('success');
            setMessage('Your email has been verified! You can now log in.');
            // Optionally redirect after a delay
            alert("verified");
            setTimeout(() => navigate('/login'), 2000);
        }
        catch (err){
          setStatus('error');
            if (err && err.message) {
            setMessage(`Verification failed: ${err.message}`);
          } else {
            setMessage('Verification failed. Please try again or request a new verification email.');
          }
        }
    }

    updateVerify();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="bg-white shadow-md rounded px-8 py-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Email Verification</h2>
        {status === 'pending' && (
          <div className="flex flex-col items-center">
            <div className="loader mb-2" />
            <p>{message}</p>
          </div>
        )}
        {status === 'success' && (
          <div className="text-green-600 text-center">
            <p>{message}</p>
            <a href="/#" className="mt-4 inline-block text-blue-600 underline">Go to Login</a>
          </div>
        )}
        {status === 'error' && (
          <div className="text-red-600 text-center">
            <p>{message}</p>
            <a href="/signup" className="mt-4 inline-block text-blue-600 underline">Back to Signup</a>
          </div>
        )}
      </div>
      {/* Simple loader style */}
      <style>{`
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}

export default VerificationPage;