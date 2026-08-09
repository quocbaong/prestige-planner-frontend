import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/auth/forgot-password?email=${email}`);
      toast.success('Mã OTP đã được gửi đến email của bạn');
      setStep(2);
    } catch (error) {
      const errorMsg = error.response?.data?.error || (typeof error.response?.data === 'string' ? error.response.data : 'Không thể gửi email khôi phục');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      toast.error('Vui lòng nhập đầy đủ 6 chữ số OTP');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/auth/verify-reset-otp', {
        email,
        otp: otpValue
      });
      toast.success('Xác thực OTP thành công');
      setStep(3);
    } catch (error) {
      const errorMsg = error.response?.data?.error || (typeof error.response?.data === 'string' ? error.response.data : 'Mã OTP không chính xác hoặc đã hết hạn');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    const otpValue = otp.join('');
    setLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        email,
        otp: otpValue,
        newPassword
      });
      toast.success('Mật khẩu đã được đặt lại thành công!');
      onClose();
      // Reset state for future uses
      setTimeout(() => {
        setStep(1);
        setEmail('');
        setOtp(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
      }, 500);
    } catch (error) {
      const errorMsg = error.response?.data?.error || (typeof error.response?.data === 'string' ? error.response.data : 'Mã OTP không chính xác hoặc đã hết hạn');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
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
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Quên mật khẩu
            </h3>
            
            {step === 1 ? (
              <form onSubmit={handleSendEmail}>
                <p className="text-gray-500 text-center mb-8 px-4 text-sm">
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn mã OTP để đặt lại mật khẩu.
                </p>
                <div className="group mb-8">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-14 pr-5 py-4.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium placeholder-gray-400"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi mã OTP'}
                </button>
              </form>
            ) : step === 2 ? (
              <form onSubmit={handleVerifyOtp}>
                <p className="text-gray-500 text-center mb-6 px-4 text-sm">
                  Nhập mã OTP gồm 6 chữ số đã gửi đến <br/>
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
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <p className="text-gray-500 text-center mb-6 px-4 text-sm">
                  Vui lòng tạo mật khẩu mới cho tài khoản của bạn.
                </p>

                <div className="group mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium placeholder-gray-400"
                      placeholder="Mật khẩu mới"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="group mb-8">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium placeholder-gray-400"
                      placeholder="Xác nhận mật khẩu mới"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu mật khẩu mới'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
