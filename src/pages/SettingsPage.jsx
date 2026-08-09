import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Code2, 
  ShieldCheck, 
  Palette, 
  Database,
  ChevronRight,
  Plus,
  Upload,
  Clock,
  Save,
  Check,
  Loader2,
  X,
  Settings
} from 'lucide-react';
import api from '../lib/axios';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('finance');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states matching DTO
  const [currency, setCurrency] = useState('VNĐ - Việt Nam Đồng');
  const [commissionRate, setCommissionRate] = useState('15');
  const [subscriptionPlan, setSubscriptionPlan] = useState('NÂNG CAO');
  const [stripeActive, setStripeActive] = useState(true);
  const [sendGridActive, setSendGridActive] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [minPasswordLength, setMinPasswordLength] = useState('8+ ký tự');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');
  const [logoUrl, setLogoUrl] = useState('');

  // Modals state
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripePub, setStripePub] = useState('');
  const [stripeSec, setStripeSec] = useState('');
  const [connectingStripe, setConnectingStripe] = useState(false);

  const [showSendGridModal, setShowSendGridModal] = useState(false);
  const [sgApiKey, setSgApiKey] = useState('');
  const [sgEmail, setSgEmail] = useState('');
  const [connectingSg, setConnectingSg] = useState(false);

  const [backupProgress, setBackupProgress] = useState(null);

  const navItems = [
    { id: 'finance', label: 'Cấu hình Tài chính', icon: CreditCard },
    { id: 'api', label: 'Tích hợp API', icon: Code2 },
    { id: 'security', label: 'Bảo mật hệ thống', icon: ShieldCheck },
    { id: 'branding', label: 'Thương hiệu & UI', icon: Palette },
    { id: 'backup', label: 'Sao lưu & Khôi phục', icon: Database },
  ];

  // Apply colors and typography dynamically to root
  const applyThemeToDOM = (color, font) => {
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--color-primary', color);
    // Dynamic brand primary shadows/hovers
    document.documentElement.style.setProperty('--primary-hover', color + 'e6'); // 90% opacity

    const fontValue = font === 'Inter' ? '"Inter", sans-serif' : '"Plus Jakarta Sans", sans-serif';
    document.documentElement.style.setProperty('--font-headline', fontValue);
    document.documentElement.style.setProperty('--sans', fontValue);
  };

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      const data = res.data;
      
      setCurrency(data.currency);
      setCommissionRate(data.commissionRate);
      setSubscriptionPlan(data.subscriptionPlan);
      setStripeActive(data.stripeActive);
      setSendGridActive(data.sendGridActive);
      setTwoFactorEnabled(data.twoFactorEnabled);
      setSessionTimeout(data.sessionTimeout);
      setMinPasswordLength(data.minPasswordLength);
      setPrimaryColor(data.primaryColor);
      setFontFamily(data.fontFamily);
      setLogoUrl(data.logoUrl || '');

      applyThemeToDOM(data.primaryColor, data.fontFamily);
    } catch (err) {
      showToast('Không thể tải cấu hình hệ thống!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings to API
  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/admin/settings', {
        currency,
        commissionRate,
        subscriptionPlan,
        stripeActive,
        sendGridActive,
        twoFactorEnabled,
        sessionTimeout,
        minPasswordLength,
        primaryColor,
        fontFamily,
        logoUrl
      });
      applyThemeToDOM(primaryColor, fontFamily);
      showToast('Cập nhật cấu hình hệ thống thành công!', 'success');
    } catch (err) {
      showToast('Lưu cấu hình hệ thống thất bại!', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cancel Changes / Revert
  const handleCancel = () => {
    fetchSettings();
    showToast('Đã hủy bỏ thay đổi và tải lại cấu hình gốc!', 'info');
  };

  // Trigger Toast Notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Stripe Connection Simulation
  const handleConnectStripe = () => {
    if (!stripePub || !stripeSec) {
      showToast('Vui lòng điền đầy đủ mã khóa Stripe!', 'error');
      return;
    }
    setConnectingStripe(true);
    setTimeout(() => {
      setStripeActive(true);
      setConnectingStripe(false);
      setShowStripeModal(false);
      showToast('Kết nối cổng thanh toán Stripe thành công!', 'success');
    }, 1500);
  };

  // SendGrid Connection Simulation
  const handleConnectSendGrid = () => {
    if (!sgApiKey || !sgEmail) {
      showToast('Vui lòng điền khóa API và Email gửi đi!', 'error');
      return;
    }
    setConnectingSg(true);
    setTimeout(() => {
      setSendGridActive(true);
      setConnectingSg(false);
      setShowSendGridModal(false);
      showToast('Kích hoạt SendGrid SMTP Service thành công!', 'success');
    }, 1500);
  };

  // Backup Simulation
  const handleBackupNow = () => {
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setBackupProgress(null);
            showToast('Đã tạo và tải xuống bản sao lưu SQL thành công!', 'success');
            
            // Mock file download
            const blob = new Blob(["-- System Backup SQL File --\nCREATE TABLE system_settings..."], { type: "application/sql" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `eventdb_backup_${new Date().toISOString().split('T')[0]}.sql`;
            link.click();
          }, 500);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  // Function to scroll to section
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    const scrollContainer = document.getElementById('settings-scroll-container');
    if (element && scrollContainer) {
      const topPos = element.offsetTop - 20; 
      scrollContainer.scrollTo({
        top: topPos,
        behavior: 'smooth'
      });
    }
  };

  // Intersection Observer to update active tab on scroll
  useEffect(() => {
    const scrollContainer = document.getElementById('settings-scroll-container');
    if (!scrollContainer || loading) return;

    const observerOptions = {
      root: scrollContainer,
      rootMargin: '-50px 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f8fafc]">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-primary animate-spin"></div>
          <Settings className="w-8 h-8 text-primary absolute animate-pulse" />
        </div>
        <p className="mt-6 text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Đang tải cấu hình hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans overflow-hidden relative">
      
      {/* Dynamic Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-10 z-[100] px-6 py-4 rounded-[20px] shadow-2xl border flex items-center gap-3 animate-bounce transition-all duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
          toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
          'bg-indigo-50 border-indigo-100 text-indigo-800'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' :
            toast.type === 'error' ? 'bg-rose-500 text-white' :
            'bg-indigo-500 text-white'
          }`}>
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <span className="text-xs font-black">{toast.message}</span>
        </div>
      )}

      {/* Circular Progress Overlay for Backup */}
      {backupProgress !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[99] flex flex-col items-center justify-center">
          <div className="bg-white rounded-[40px] p-10 flex flex-col items-center gap-6 shadow-2xl max-w-[400px] w-full border border-slate-100 animate-in fade-in zoom-in">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-slate-100 fill-none" strokeWidth="8" />
                <circle cx="56" cy="56" r="48" className="stroke-primary fill-none transition-all duration-300" strokeWidth="8" strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * backupProgress) / 100} />
              </svg>
              <span className="absolute text-xl font-black text-slate-800">{backupProgress}%</span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-800">Đang xuất cơ sở dữ liệu</h3>
              <p className="text-xs text-slate-400 font-bold">Vui lòng không đóng trình duyệt hoặc ngắt kết nối.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Credentials Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[95] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-8 max-w-[500px] w-full shadow-2xl border border-slate-100 space-y-6 relative animate-in fade-in zoom-in">
            <button onClick={() => setShowStripeModal(false)} className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Cấu hình Stripe Gateway</h3>
                <p className="text-[11px] text-slate-400 font-bold">Tích hợp giao dịch thanh toán tự động.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Publishable Key</label>
                <input type="text" value={stripePub} onChange={(e) => setStripePub(e.target.value)} placeholder="pk_test_..." className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 font-mono text-xs outline-none focus:ring-4 focus:ring-primary/5" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                <input type="password" value={stripeSec} onChange={(e) => setStripeSec(e.target.value)} placeholder="sk_test_..." className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 font-mono text-xs outline-none focus:ring-4 focus:ring-primary/5" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowStripeModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-400 hover:bg-slate-100 text-xs transition-all uppercase tracking-widest">Đóng</button>
              <button onClick={handleConnectStripe} disabled={connectingStripe} className="flex-1 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                {connectingStripe ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kết nối Stripe'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SendGrid Credentials Modal */}
      {showSendGridModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[95] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-8 max-w-[500px] w-full shadow-2xl border border-slate-100 space-y-6 relative animate-in fade-in zoom-in">
            <button onClick={() => setShowSendGridModal(false)} className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-all">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Cấu hình SendGrid SMTP</h3>
                <p className="text-[11px] text-slate-400 font-bold">Gửi thư xác nhận vé & mã OTP tự động.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SendGrid API Key</label>
                <input type="password" value={sgApiKey} onChange={(e) => setSgApiKey(e.target.value)} placeholder="SG.xxxxxxxx..." className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 font-mono text-xs outline-none focus:ring-4 focus:ring-primary/5" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email gửi đi (Sender Identity)</label>
                <input type="email" value={sgEmail} onChange={(e) => setSgEmail(e.target.value)} placeholder="noreply@domain.com" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 font-bold text-xs outline-none focus:ring-4 focus:ring-primary/5" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowSendGridModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-400 hover:bg-slate-100 text-xs transition-all uppercase tracking-widest">Đóng</button>
              <button onClick={handleConnectSendGrid} disabled={connectingSg} className="flex-1 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                {connectingSg ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kích hoạt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. FIXED HEADER */}
      <div className="bg-[#f8fafc] border-b border-slate-100 px-10 py-6 flex-shrink-0 z-30">
        <div className="max-w-[1400px]">
          <h1 className="text-2xl font-black text-slate-800 mb-1">Cài đặt Hệ thống</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quản lý cấu hình nền tảng, bảo mật và tích hợp API toàn cầu.</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. FIXED SIDEBAR (Within this page) */}
        <div className="w-[320px] flex-shrink-0 px-8 py-8 bg-[#f8fafc] z-20 border-r border-slate-100/50">
           <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-[20px] font-bold transition-all duration-300 ${
                      activeTab === item.id 
                      ? 'bg-primary text-white shadow-xl shadow-primary/20 transform scale-[1.02]' 
                      : 'text-slate-400 hover:bg-white hover:text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <Icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`} />
                       <span className="text-[13px]">{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight className="w-3 h-3 animate-pulse" />}
                  </button>
                );
              })}
           </div>
        </div>

        {/* 3. SCROLLABLE CONTENT AREA */}
        <div 
          id="settings-scroll-container"
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-slate-50/20"
        >
          <div className="max-w-[900px] mx-auto p-10 space-y-10 pb-48">
            
            {/* Financial Config */}
            <section id="finance" className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 space-y-8 transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary">
                    <CreditCard className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cấu hình Tài chính</h2>
                    <p className="text-xs text-slate-400 font-bold">Thiết lập các mức giá, hoa hồng và tiền tệ mặc định.</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiền tệ mặc định</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all">
                       <option>VNĐ - Việt Nam Đồng</option>
                       <option>USD - Đô la Mỹ</option>
                       <option>EUR - Đồng Euro</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tỷ lệ hoa hồng (%)</label>
                    <input type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Gói đăng ký nền tảng</label>
                 <div className="grid grid-cols-3 gap-5">
                    {['CƠ BẢN', 'NÂNG CAO', 'DOANH NGHIỆP'].map((plan) => (
                      <div 
                        key={plan} 
                        onClick={() => setSubscriptionPlan(plan)}
                        className={`p-6 rounded-[28px] border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                          subscriptionPlan === plan 
                          ? 'border-primary bg-primary/[0.02] shadow-sm transform scale-105 z-10 font-black' 
                          : 'border-slate-50 bg-white hover:border-slate-100 hover:scale-[1.02]'
                        }`}
                      >
                         <p className="text-[9px] font-black tracking-widest text-slate-400 mb-2 uppercase">{plan}</p>
                         <p className="text-lg font-black text-slate-800">
                           {plan === 'CƠ BẢN' ? '2.0 triệu' : plan === 'NÂNG CAO' ? '5.0 triệu' : 'Thỏa thuận'}
                         </p>
                         <p className="text-[9px] text-slate-400 font-bold mt-3 leading-relaxed">
                           {plan === 'CƠ BẢN' ? 'Tối đa 500 khách' : plan === 'NÂNG CAO' ? 'Tối đa 5k khách' : 'Tùy chỉnh mở rộng'}
                         </p>
                      </div>
                    ))}
                 </div>
              </div>
            </section>

            {/* API Management */}
            <section id="api" className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 space-y-8 transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Code2 className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">API & Tích hợp</h2>
                    <p className="text-xs text-slate-400 font-bold">Kết nối dịch vụ thanh toán, CRM và Email.</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[28px] border border-slate-100 group hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                          <span className="font-black text-slate-400 text-[9px] uppercase">Stripe</span>
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-slate-800">Cổng thanh toán Stripe</h4>
                          <p className={`text-[10px] font-black uppercase ${stripeActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {stripeActive ? 'Đang hoạt động' : 'Tạm dừng'}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {stripeActive && (
                        <button onClick={() => setStripeActive(false)} className="px-5 py-2.5 rounded-xl text-rose-500 font-black text-[11px] bg-rose-50 hover:bg-rose-100 transition-all">Hủy</button>
                      )}
                      <button onClick={() => setShowStripeModal(true)} className="px-6 py-2.5 rounded-xl text-primary font-black text-[11px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">Cấu hình</button>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[28px] border border-slate-100 group hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                          <span className="font-black text-slate-400 text-[9px] uppercase">Email</span>
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-slate-800">SendGrid Service SMTP</h4>
                          <p className={`text-[10px] font-black uppercase ${sendGridActive ? 'text-emerald-500' : 'text-slate-300 italic'}`}>
                            {sendGridActive ? 'Sẵn sàng' : 'Chưa kích hoạt'}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {sendGridActive && (
                        <button onClick={() => setSendGridActive(false)} className="px-5 py-2.5 rounded-xl text-rose-500 font-black text-[11px] bg-rose-50 hover:bg-rose-100 transition-all">Ngắt kết nối</button>
                      )}
                      <button onClick={() => setShowSendGridModal(true)} className="px-6 py-2.5 rounded-xl text-primary font-black text-[11px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        {sendGridActive ? 'Cấu hình lại' : 'Kích hoạt'}
                      </button>
                    </div>
                 </div>
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 space-y-8 transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">An ninh & Bảo mật</h2>
                    <p className="text-xs text-slate-400 font-bold">Kiểm soát truy cập và bảo vệ dữ liệu.</p>
                 </div>
              </div>

              <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[28px] border border-slate-100">
                 <div>
                    <h4 className="text-sm font-bold text-slate-800">Xác thực 2 yếu tố (2FA)</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Bắt buộc cho tất cả tài khoản admin.</p>
                 </div>
                 <div 
                   onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                   className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-500 ${twoFactorEnabled ? 'bg-primary' : 'bg-slate-300'}`}
                 >
                   <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500 transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Thời hạn phiên đăng nhập</label>
                    <div className="relative">
                       <input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-black text-sm outline-none pr-16 focus:ring-4 focus:ring-primary/5 transition-all" />
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">PHÚT</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu tối thiểu</label>
                    <select value={minPasswordLength} onChange={(e) => setMinPasswordLength(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-bold text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all">
                       <option>8+ ký tự</option>
                       <option>10+ ký tự</option>
                       <option>12+ ký tự</option>
                       <option>16+ ký tự</option>
                    </select>
                 </div>
              </div>
            </section>

            {/* Branding Section */}
            <section id="branding" className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 space-y-8 transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <Palette className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Thương hiệu & UI</h2>
                    <p className="text-xs text-slate-400 font-bold">Tùy chỉnh nhận diện thương hiệu.</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo hệ thống</label>
                    <div className="h-44 border-2 border-dashed border-slate-200 rounded-[28px] bg-slate-50/30 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-primary transition-all">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-300 group-hover:text-primary transition-all border border-slate-100">
                          <Upload className="w-6 h-6" />
                       </div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Tải lên Logo mới</p>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Màu chủ đạo thương hiệu</label>
                       <div className="flex flex-wrap gap-2.5">
                          {['#4f46e5', '#e11d48', '#059669', '#d97706', '#0891b2', '#7c3aed', '#ec4899'].map(color => (
                            <div 
                              key={color}
                              onClick={() => {
                                setPrimaryColor(color);
                                applyThemeToDOM(color, fontFamily);
                              }}
                              className={`w-9 h-9 rounded-full cursor-pointer transition-all border-4 ${primaryColor === color ? 'border-white ring-4 ring-primary/20 scale-110 shadow-md' : 'border-transparent shadow-sm scale-90 hover:scale-95'}`}
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kiểu chữ mặc định</label>
                       <div className="flex gap-1.5 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-50">
                          <button 
                            onClick={() => {
                              setFontFamily('Plus Jakarta Sans');
                              applyThemeToDOM(primaryColor, 'Plus Jakarta Sans');
                            }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${fontFamily === 'Plus Jakarta Sans' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                          >P. Jakarta</button>
                          <button 
                            onClick={() => {
                              setFontFamily('Inter');
                              applyThemeToDOM(primaryColor, 'Inter');
                            }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${fontFamily === 'Inter' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                          >Inter</button>
                       </div>
                    </div>
                 </div>
              </div>
            </section>

            {/* Backup & Recovery Section */}
            <section id="backup" className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 space-y-8 transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                    <Database className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Sao lưu & Khôi phục</h2>
                    <p className="text-xs text-slate-400 font-bold">Bảo vệ dữ liệu hệ thống.</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="p-8 bg-emerald-50/30 rounded-[32px] border border-emerald-100 space-y-6 relative group overflow-hidden">
                    <div className="flex items-center justify-between">
                       <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">Tự động</span>
                       <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                       <h4 className="font-black text-slate-800 text-lg mb-2">Sao lưu hằng ngày</h4>
                       <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Dữ liệu lưu vào S3 lúc 00:00.</p>
                    </div>
                    <button onClick={() => showToast('Cơ chế sao lưu tự động đã được lập lịch lúc 00:00 hằng ngày!', 'info')} className="w-full py-4 bg-white rounded-2xl font-black text-[11px] text-emerald-700 shadow-sm border border-emerald-50 hover:bg-emerald-50 transition-all">Thiết lập lịch</button>
                 </div>

                 <div className="p-8 bg-primary/[0.02] rounded-[32px] border border-primary/10 space-y-6 relative group overflow-hidden">
                    <div className="flex items-center justify-between">
                       <span className="px-3.5 py-1.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full">Tức thời</span>
                       <Save className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                       <h4 className="font-black text-slate-800 text-lg mb-2">Xuất dữ liệu ngay</h4>
                       <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Tạo bản sao lưu ngay bây giờ.</p>
                    </div>
                    <button onClick={handleBackupNow} className="w-full py-4 bg-primary rounded-2xl font-black text-[11px] text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">Sao lưu ngay</button>
                 </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* 4. FIXED FOOTER ACTION BAR */}
      <div className="flex-shrink-0 w-full bg-white border-t border-slate-100 p-6 z-40">
         <div className="max-w-[1400px] mx-auto flex items-center justify-end gap-6 px-10">
            <button onClick={handleCancel} className="px-8 py-3 rounded-xl font-black text-slate-400 hover:text-slate-800 transition-all text-[11px] uppercase tracking-widest">
              Hủy thay đổi
            </button>
            <button onClick={handleSave} disabled={saving} className="px-10 py-3.5 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white rounded-2xl font-black shadow-xl shadow-primary/30 transition-all text-[11px] uppercase tracking-widest flex items-center gap-2">
               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default SettingsPage;
