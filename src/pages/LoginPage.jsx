import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/attendee/dashboard');
      }
    } catch (err) {
      setError(err || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white layout-fixed">
      {/* Left Panel - Dynamic Gradient & Branding */}
      <div className="hidden lg:flex lg:flex-[1.2] relative overflow-hidden bg-[#5F56FF] pt-12 pb-16 px-16 xl:pt-16 xl:pb-24 xl:px-24 flex flex-col justify-between text-white font-sans">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#4F46E5] via-[#5F56FF] to-[#9333EA] opacity-90"></div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Prestige Planner" className="h-20 w-auto brightness-0 invert" />
          </div>
          
          <div className="max-w-xl">
            <h1 className="text-6xl xl:text-7xl font-bold leading-[1.05] mb-10 tracking-tight">
              Kiến tạo <br />
              những <span className="text-white/90">khoảnh khắc</span> <br />
              phi thường.
            </h1>
            
            <p className="text-indigo-100/70 text-lg leading-relaxed max-w-md mb-8">
              Không gian làm việc cao cấp cho các nhà tổ chức sự kiện và những người tầm nhìn. Quản lý, mở rộng và truyền cảm hứng với độ chính xác tuyệt đối.
            </p>


          </div>
        </div>


        <div className="relative z-10 bottom-0">
          <div className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 inline-flex">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-14 h-14 rounded-full border-4 border-indigo-600/50 overflow-hidden ring-2 ring-white/10 transition-transform hover:scale-110 hover:z-20 cursor-pointer">
                  <img src={`https://i.pravatar.cc/150?u=user${i + 20}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                +2,400 nhà tổ chức sự kiện
              </p>
              <p className="text-sm text-indigo-200/80">
                đã tham gia sứ mệnh của chúng tôi tuần này
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-20 xl:p-32 bg-white overflow-hidden font-sans">

        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Chào mừng trở lại</h2>
            <p className="text-lg text-gray-500 font-medium">Đăng nhập để quản lý tầm nhìn của bạn.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Social Logins */}
          <div className="flex gap-4 mb-10">
            <button className="flex-1 flex items-center justify-center gap-3 py-4 px-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:border-gray-200 transition-all duration-300 font-bold text-gray-700 shadow-sm active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 py-4 px-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:border-gray-200 transition-all duration-300 font-bold text-gray-700 shadow-sm active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.96.95-2.14 1.72-3.4 2.13-1.2.39-2.48.59-3.76.59-1.33 0-2.66-.23-3.92-.68-1.28-.46-2.44-1.18-3.41-2.12-1.95-1.89-3.05-4.56-3.04-7.34 0-2.82 1.08-5.46 3.01-7.41 1.94-1.95 4.54-3.03 7.33-3.03 1.15 0 2.29.18 3.36.54 1.05.35 2.01.88 2.86 1.57.8.65 1.45 1.47 1.91 2.4.49.98.74 2.06.74 3.16 0 1.9-.71 3.69-2.01 5.07-.46.49-1 .89-1.6 1.18-.57.27-1.18.41-1.8.41-.64 0-1.26-.14-1.82-.42-.51-.25-.97-.61-1.34-1.04-.37.43-.84.79-1.36 1.04-.56.28-1.18.42-1.81.42s-1.25-.14-1.81-.42c-.51-.25-.97-.61-1.34-1.04-1.4 1.48-2.17 3.44-2.17 5.48 0 2.06.78 4.02 2.19 5.51 1.41 1.48 3.33 2.3 5.37 2.3 1.46 0 2.87-.41 4.09-1.19a8.62 8.62 0 0 0 3.01-3.23l1.83.91zM11.91 1.44c.04 0 .09 0 .14.01-.15.82-.48 1.6-.96 2.29-.48.69-1.12 1.25-1.86 1.63-.74.39-1.57.59-2.42.59-.04 0-.08 0-.13-.01.16-.84.5-1.62.99-2.3.49-.69 1.14-1.25 1.9-1.63.75-.38 1.59-.58 2.44-.58z"/>
              </svg>
              Apple
            </button>
          </div>

          <div className="relative mb-10 text-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-100"></div>
            <span className="relative bg-white px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">hoặc với email</span>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1" htmlFor="email">Địa chỉ Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                  <input 
                    type="email" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-14 pr-5 py-4.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium placeholder-gray-400"
                    placeholder="name@company.com"
                    required
                  />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between mb-2.5 px-1">
                <label className="text-sm font-bold text-gray-700" htmlFor="password">Mật khẩu</label>
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Quên mật khẩu?</button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-14 pr-14 py-4.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-gray-900 font-medium placeholder-gray-400"
                    placeholder="••••••••"
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

            <div className="flex items-center group cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
                {rememberMe && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
              </div>
              <span className="ml-3 text-base font-semibold text-gray-600 select-none">Ghi nhớ tôi trong 30 ngày</span>
            </div>


            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-5 px-6 rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-300 transform flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập vào EventArchitect'
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-base text-gray-500 font-medium">
            Chưa có tài khoản? {' '}
            <button 
              onClick={() => navigate('/signup')} 
              className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4 decoration-2 decoration-indigo-100 hover:decoration-indigo-600 transition-all"
            >
              Tạo tài khoản tổ chức sự kiện của bạn
            </button>
          </p>
        </div>
      </div>
      
      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
};

export default LoginPage;
