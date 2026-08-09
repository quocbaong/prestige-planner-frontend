import React, { useState } from 'react';
import { Mail, Lock, User, Building2, Eye, EyeOff, Sparkles, LineChart, Check, Loader2 } from 'lucide-react';
import heroIllustration from '../assets/hero-illustration.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import logo from '../assets/logo.png';
import OTPVerificationModal from '../components/auth/OTPVerificationModal';

const SignUpPage = () => {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('ATTENDEE'); // ADDED ROLE STATE
  const [selectedType, setSelectedType] = useState('Doanh nghiệp');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Bạn phải đồng ý với Điều khoản & Điều kiện.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await register({ 
        fullName, 
        email, 
        password, 
        role, 
        companyName: role === 'ORGANIZER' ? company : undefined 
      }); 
      setRegisteredEmail(email);
      setShowOtpModal(true);
    } catch (err) {
      const msg = err && typeof err === 'object' ? (err.error || err.message) : err;
      setError(msg || 'Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerified = () => {
    setShowOtpModal(false);
    navigate('/login');
  };

  const eventTypes = [
    { en: 'Corporate', vi: 'Doanh nghiệp' },
    { en: 'Gala', vi: 'Dạ tiệc' },
    { en: 'Concert', vi: 'Hòa nhạc' },
    { en: 'Webinar', vi: 'Hội thảo trực tuyến' }
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans layout-fixed">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-[1.1] relative overflow-hidden bg-[#2D31A6] pt-8 pb-12 px-12 xl:pt-12 xl:pb-16 xl:px-16 flex flex-col justify-between text-white">
        {/* Background Decorative Text */}
        <div className="absolute inset-0 flex flex-col justify-center items-center opacity-10 select-none pointer-events-none">
          <span className="text-[8rem] xl:text-[10rem] font-black leading-none italic uppercase">PREMIUM</span>
          <span className="text-[6rem] xl:text-[8rem] font-black leading-none italic uppercase -mt-6">EVENTS</span>
          <span className="text-4xl font-black italic uppercase mt-4">safe to work</span>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Prestige Planner" className="h-16 w-auto brightness-0 invert" />
          </div>

          <div className="max-w-xl">
            <h1 className="text-5xl font-bold leading-[1.1] mb-6 tracking-tight">
              Làm chủ Nghệ thuật Trải nghiệm.
            </h1>
            <p className="text-indigo-100/70 text-lg leading-relaxed max-w-md mb-6">
              Tham gia hệ sinh thái nơi thiết kế nội dung gặp gỡ quy trình điều phối sự kiện chuyên nghiệp.
            </p>
            <div className="mb-6 w-full aspect-[16/6] rounded-2xl overflow-hidden shadow-2xl border border-white/20 transform hover:scale-[1.02] transition-transform duration-500">
              <img src={heroIllustration} alt="Artistic Illustration" className="w-full h-full object-cover opacity-90" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hover:bg-white/20 hover:border-indigo-400/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-all duration-300 cursor-default group">
                <div className="w-10 h-10 bg-indigo-600/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-300">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white mb-1">Lập lịch Thông minh</h3>
                <p className="text-indigo-100/60 text-xs">Lộ trình sự kiện được hỗ trợ bởi AI</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hover:bg-white/20 hover:border-indigo-400/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-1 transition-all duration-300 cursor-default group">
                <div className="w-10 h-10 bg-indigo-600/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-300">
                  <LineChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white mb-1">Phân tích Chuyên sâu</h3>
                <p className="text-indigo-100/60 text-xs">Dữ liệu tương tác thời gian thực</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-white overflow-hidden">
        <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Tạo tài khoản của bạn</h2>
            <p className="text-gray-500 font-medium text-sm">Nhập thông tin chi tiết để bắt đầu hành trình.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="name">Họ và Tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input 
                    type="text" id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>
              
              {role === 'ORGANIZER' && (
                <div className="group animate-in fade-in slide-in-from-right-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="company">Tên Công ty</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input 
                      type="text" id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Công ty của bạn"
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Đăng ký với tư cách</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole('ATTENDEE')}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-300 border-2 ${
                    role === 'ATTENDEE'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Khách tham dự
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ORGANIZER')}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-300 border-2 ${
                    role === 'ORGANIZER'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Nhà tổ chức
                </button>
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="email">Email Công việc</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input 
                  type="email" id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1" htmlFor="password">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Loại Sự kiện Ưu tiên</label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.en}
                    type="button"
                    onClick={() => setSelectedType(type.vi)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                      selectedType === type.vi 
                        ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {type.vi}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center group cursor-pointer" onClick={() => setAgreed(!agreed)}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${agreed ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-200'}`}>
                {agreed && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
              </div>
              <span className="ml-3 text-sm font-medium text-gray-600">
                Tôi đồng ý với <a href="#" className="font-bold text-indigo-600 hover:underline">Điều khoản & Điều kiện</a> và <a href="#" className="font-bold text-indigo-600 hover:underline">Chính sách Bảo mật</a>.
              </span>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-2xl font-bold text-base hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Tạo tài khoản của tôi'
              )}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-100"></div>
            <span className="relative bg-white px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">hoặc tiếp tục với</span>
          </div>

          <div className="flex gap-4 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-700 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-700 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.96.95-2.14 1.72-3.4 2.13-1.2.39-2.48.59-3.76.59-1.33 0-2.66-.23-3.92-.68-1.28-.46-2.44-1.18-3.41-2.12-1.95-1.89-3.05-4.56-3.04-7.34 0-2.82 1.08-5.46 3.01-7.41 1.94-1.95 4.54-3.03 7.33-3.03 1.15 0 2.29.18 3.36.54 1.05.35 2.01.88 2.86 1.57.8.65 1.45 1.47 1.91 2.4.49.98.74 2.06.74 3.16 0 1.9-.71 3.69-2.01 5.07-.46.49-1 .89-1.6 1.18-.57.27-1.18.41-1.8.41-.64 0-1.26-.14-1.82-.42-.51-.25-.97-.61-1.34-1.04-.37.43-.84.79-1.36 1.04-.56.28-1.18.42-1.81.42s-1.25-.14-1.81-.42c-.51-.25-.97-.61-1.34-1.04-1.4 1.48-2.17 3.44-2.17 5.48 0 2.06.78 4.02 2.19 5.51 1.41 1.48 3.33 2.3 5.37 2.3 1.46 0 2.87-.41 4.09-1.19a8.62 8.62 0 0 0 3.01-3.23l1.83.91zM11.91 1.44c.04 0 .09 0 .14.01-.15.82-.48 1.6-.96 2.29-.48.69-1.12 1.25-1.86 1.63-.74.39-1.57.59-2.42.59-.04 0-.08 0-.13-.01.16-.84.5-1.62.99-2.3.49-.69 1.14-1.25 1.9-1.63.75-.38 1.59-.58 2.44-.58z"/></svg>
              Apple
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm font-medium">
            Đã có tài khoản? {' '}
            <button onClick={() => navigate('/login')} className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Đăng nhập</button>
          </p>
        </div>
      </div>
      <OTPVerificationModal 
        isOpen={showOtpModal}
        email={registeredEmail}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleVerified}
      />
    </div>
  );
};

export default SignUpPage;
