import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Mail, RefreshCw, ArrowRight } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';

const OTPVerificationModal = ({ isOpen, email, onClose, onVerified, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      toast.error('Vui lòng nhập đầy đủ 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/auth/verify-otp', {
        email,
        otp: otpValue
      });
      toast.success('Xác thực email thành công!');
      onVerified();
    } catch (error) {
      toast.error(error.response?.data || 'Mã OTP không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInternal = async () => {
    if (!canResend) return;
    
    try {
      await axios.post(`/auth/resend-otp?email=${email}`);
      toast.success('Đã gửi lại mã OTP mới');
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (error) {
      toast.error('Không thể gửi lại mã. Vui lòng thử lại sau.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Xác thực tài khoản
            </h3>
            <p className="text-gray-500 text-center mb-8 px-4">
              Chúng tôi đã gửi mã OTP gồm 6 chữ số đến <br/>
              <span className="font-semibold text-gray-900">{email}</span>
            </p>

            <div className="flex justify-between gap-2 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Xác thực ngay
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-2">Bạn không nhận được mã?</p>
              <button
                onClick={handleResendInternal}
                disabled={!canResend}
                className={`text-sm font-bold transition-colors ${
                  canResend ? 'text-indigo-600 hover:text-indigo-700' : 'text-gray-400'
                }`}
              >
                {canResend ? 'Gửi lại mã mới' : `Gửi lại sau ${timer}s`}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OTPVerificationModal;
