// src/components/profile/CoupleConnection.jsx
import React, { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { connectWithPartner } from '../lib/coupleService';

const CoupleConnection = () => {
    const { user } = useAuth();

    const [partnerUserId, setPartnerUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [coupleInfo, setCoupleInfo] = useState(null);

    const handleConnect = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const couple = await connectWithPartner(user.$id, partnerUserId);
            setCoupleInfo(couple);
            setSuccess('Connected successfully!');
        } catch (err) {
            setError(err?.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (user?.$id) {
            navigator.clipboard.writeText(user.$id);
            setSuccess('Copied to clipboard!');
            setTimeout(() => setSuccess(''), 1500);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Connect With Your Love</h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                    {success}
                </div>
            )}

            {/* Display current user ID */}
            <div className="mb-4" onClick={handleCopy}>
                <label className="font-semibold">Your User ID:</label>
                <Input
                    value={user?.$id || 'Loading...'}
                    readOnly
                    className="font-mono cursor-pointer"
                    onClick={handleCopy}
                />
            </div>

            {/* Input partner ID and connect */}
            <div className="mb-4">
                <label className="font-semibold">Partner's User ID:</label>
                <Input
                    type="text"
                    value={partnerUserId}
                    onChange={(e) => setPartnerUserId(e.target.value)}
                    className="font-mono"
                    placeholder="Enter partner's User ID"
                />
                <Button
                    onClick={handleConnect}
                    disabled={loading || !partnerUserId}
                    className="w-full mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Connecting...' : 'Connect'}
                </Button>
            </div>

            {/* Show couple info if connected */}
            {coupleInfo && (
                <div className="bg-green-50 p-3 rounded">
                    <p className="text-green-800 font-semibold">Connected! ❤️</p>
                    <p className="text-sm">{coupleInfo.coupleName}</p>
                </div>
            )}
        </div>
    );
};

export default CoupleConnection;
