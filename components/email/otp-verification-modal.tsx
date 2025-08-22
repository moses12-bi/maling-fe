import React from 'react';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  senderEmail: string;
  isLoading: boolean;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({ isOpen, onClose, onVerify, senderEmail, isLoading }) => {
  if (!isOpen) return null;

  const [otp, setOtp] = React.useState('');

  const handleVerify = () => {
    if (otp) {
      onVerify(otp);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Verify Your Identity</h2>
        <p className="mb-4 text-sm text-gray-600">An OTP has been sent to <strong>{senderEmail}</strong>. Please enter it below.</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full px-3 py-2 border rounded-md mb-4"
          disabled={isLoading}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md" disabled={isLoading}>Cancel</button>
          <button onClick={handleVerify} className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
