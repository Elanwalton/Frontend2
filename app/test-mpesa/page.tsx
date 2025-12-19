"use client";

import React, { useState } from 'react';
import MpesaPayment from '../../components/MpesaPayment';
import { useAuth } from '../../context/AuthContext';

export default function TestMpesaPage() {
  const { user } = useAuth();
  const [testData, setTestData] = useState({
    amount: 10,
    orderId: 'TEST-' + Date.now(),
    customerEmail: 'test@example.com',
    customerName: 'Test User'
  });

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    alert('Payment successful! M-Pesa receipt: ' + paymentData.mpesa_receipt_number);
  };

  const handlePaymentFailed = (error: string) => {
    console.log('Payment failed:', error);
    alert('Payment failed: ' + error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">M-Pesa STK Push Test</h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Information</h2>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Environment:</strong> Sandbox (no real money)</p>
              <p><strong>Test Amount:</strong> KES {testData.amount}</p>
              <p><strong>Order ID:</strong> {testData.orderId}</p>
              <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
            </div>
          </div>

          {!user && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You're not logged in. The test will use default user data.
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Amount (KES)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={testData.amount}
              onChange={(e) => setTestData({...testData, amount: parseFloat(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use small amounts (1-100 KES) for testing
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">M-Pesa Payment Component</h3>
            <MpesaPayment
              amount={testData.amount}
              orderId={testData.orderId}
              userId={user?.id || 1}
              customerEmail={user?.email || testData.customerEmail}
              customerName={user?.first_name || testData.customerName}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailed={handlePaymentFailed}
            />
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Test Instructions</h3>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Enter a valid M-Pesa phone number (format: 07XXXXXXXX or 254XXXXXXXXX)</li>
              <li>Click "Pay with M-Pesa" to initiate the STK Push</li>
              <li>Check your phone for the M-Pesa prompt (sandbox environment)</li>
              <li>Enter your PIN to complete the test transaction</li>
              <li>Verify the payment status updates automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
