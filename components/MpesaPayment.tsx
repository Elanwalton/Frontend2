"use client";

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '@/utils/apiUrl';

interface MpesaPaymentProps {
  amount: number;
  orderId: string;
  userId: number;
  customerEmail: string;
  customerName: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentFailed?: (error: string) => void;
}

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  amount,
  orderId,
  userId,
  customerEmail,
  customerName,
  onPaymentSuccess,
  onPaymentFailed
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'checking'>('idle');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');

  // API configuration handled by getApiUrl

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format: 07XXXXXXXX or 254XXXXXXXXX
    if (value.length > 0) {
      if (value.length <= 10 && value.startsWith('0')) {
        // Format as 07XXXXXXXX
        setPhoneNumber(value);
      } else if (value.length === 12 && value.startsWith('254')) {
        // Format as 254XXXXXXXXX
        setPhoneNumber(value);
      } else if (value.length === 9 && !value.startsWith('0')) {
        // Add 0 at the beginning
        setPhoneNumber('0' + value);
      } else if (value.length === 12 && !value.startsWith('254')) {
        // Add 254 at the beginning
        setPhoneNumber('254' + value);
      } else {
        setPhoneNumber(value);
      }
    } else {
      setPhoneNumber('');
    }
  };

  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    // Accept formats: 07XXXXXXXX (10 digits) or 254XXXXXXXXX (12 digits)
    const phoneRegex = /^(0[17]\d{8}|254[17]\d{8})$/;
    return phoneRegex.test(phone);
  };

  // Initiate M-Pesa STK Push
  const initiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid M-Pesa phone number (format: 07XXXXXXXX or 254XXXXXXXXX)');
      return;
    }

    if (amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      const response = await fetch(getApiUrl('/api/mpesa-stkpush'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          amount: amount,
          order_id: orderId,
          user_id: userId,
          customer_email: customerEmail,
          customer_name: customerName
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestId(data.data.checkout_request_id);
        toast.success(data.message);
        
        // Start checking payment status
        setTimeout(() => {
          checkPaymentStatus(data.data.checkout_request_id);
        }, 5000); // Start checking after 5 seconds
        
        // Continue checking periodically
        const statusInterval = setInterval(() => {
          checkPaymentStatus(data.data.checkout_request_id, statusInterval);
        }, 10000); // Check every 10 seconds
        
        // Stop checking after 5 minutes
        setTimeout(() => {
          clearInterval(statusInterval);
          if (paymentStatus === 'pending') {
            setPaymentStatus('idle');
            toast.warning('Payment timeout. Please check your M-Pesa messages and try again.');
          }
        }, 300000); // 5 minutes
        
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('M-Pesa payment error:', error);
      toast.error(error.message || 'Failed to initiate M-Pesa payment');
      setPaymentStatus('idle');
      if (onPaymentFailed) {
        onPaymentFailed(error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Check payment status
  const checkPaymentStatus = async (checkoutId: string, interval?: NodeJS.Timeout) => {
    try {
      setPaymentStatus('checking');
      
      const response = await fetch(`${getApiUrl('/api/mpesa-status')}?checkout_request_id=${checkoutId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        const payment = data.data;
        
        if (payment.status === 'success') {
          // Payment successful
          setPaymentStatus('idle');
          if (interval) clearInterval(interval);
          
          toast.success(`Payment successful! M-Pesa receipt: ${payment.mpesa_receipt_number}`);
          
          if (onPaymentSuccess) {
            onPaymentSuccess(payment);
          }
          
        } else if (payment.status === 'failed') {
          // Payment failed
          setPaymentStatus('idle');
          if (interval) clearInterval(interval);
          
          toast.error(`Payment failed: ${payment.result_desc}`);
          
          if (onPaymentFailed) {
            onPaymentFailed(payment.result_desc);
          }
          
        } else {
          // Payment still pending
          console.log('Payment still pending...');
        }
      } else {
        console.error('Failed to check payment status:', data.message);
      }
    } catch (error: any) {
      console.error('Payment status check error:', error);
    } finally {
      if (paymentStatus !== 'idle') {
        setPaymentStatus('pending');
      }
    }
  };

  return (
    <div className="mpesa-payment">
      <form onSubmit={initiatePayment} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            M-Pesa Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="07XXXXXXXX or 254XXXXXXXXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isProcessing}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your M-Pesa registered phone number
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount:</span>
            <span>KES {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="font-medium">Order ID:</span>
            <span>#{orderId}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !validatePhoneNumber(phoneNumber)}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {paymentStatus === 'checking' ? 'Checking Payment...' : 'Processing...'}
            </span>
          ) : (
            'Pay with M-Pesa'
          )}
        </button>

        {paymentStatus === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Payment initiated!</strong> Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
            </p>
          </div>
        )}

        {paymentStatus === 'checking' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Checking payment status...</strong> Please wait while we verify your payment.
            </p>
          </div>
        )}
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-1">How M-Pesa STK Push works:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enter your M-Pesa phone number</li>
          <li>Click "Pay with M-Pesa" to initiate payment</li>
          <li>Check your phone for the M-Pesa prompt</li>
          <li>Enter your PIN to authorize the payment</li>
          <li>Payment will be confirmed automatically</li>
        </ol>
      </div>
    </div>
  );
};

export default MpesaPayment;
