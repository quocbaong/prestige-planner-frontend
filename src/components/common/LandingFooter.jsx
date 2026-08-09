import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

const languages = [
  { code: 'vi', label: 'Tiếng Việt', flag: 'https://flagcdn.com/w40/vn.png' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'jp', label: '日本語', flag: 'https://flagcdn.com/w40/jp.png' }
];

const LandingFooter = () => {
  const navigate = useNavigate();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  const footerLinks = {
    product: [
      { name: 'Tính năng', href: '#features' },
      { name: 'Giải pháp', href: '#solutions' },
      { name: 'Bảng giá', href: '#pricing' },
      { name: 'Yêu cầu Demo', href: '#' },
    ],
    company: [
      { name: 'Về chúng tôi', href: '#' },
      { name: 'Tuyển dụng', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Liên hệ', href: '#' },
    ],
    resources: [
      { name: 'Trung tâm trợ giúp', href: '#' },
      { name: 'Cộng đồng', href: '#' },
      { name: 'Tài liệu API', href: '#' },
      { name: 'Tình trạng hệ thống', href: '#' },
    ]
  };

  const socials = [
    { platform: 'facebook', icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/facebook.svg' },
    { platform: 'twitter', icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/x.svg' },
    { platform: 'linkedin', icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/linkedin.svg' },
    { platform: 'instagram', icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/instagram.svg' },
  ];

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6 md:px-10 overflow-hidden relative" id="footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-4 space-y-6">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Prestige Planner" className="h-14 w-auto object-contain" />
            </div>
            <p className="text-slate-500 text-[14px] leading-relaxed max-w-xs font-body">
              Nền tảng quản trị sự kiện thông minh hàng đầu, giúp bạn kiến tạo những trải nghiệm đẳng cấp và tự động hóa quy trình chuyên nghiệp.
            </p>
            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a 
                  key={social.platform} 
                  href="#" 
                  className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:border-[#e4322a] hover:bg-white transition-all duration-300 group shadow-sm"
                >
                  <img src={social.icon} alt={social.platform} className="w-4 h-4 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-slate-900 font-headline font-bold text-[13px] uppercase tracking-widest">Sản phẩm</h4>
            <ul className="space-y-4">
              {footerLinks.product.map(link => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-500 hover:text-[#e4322a] transition-colors text-[14px] font-medium">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-slate-900 font-headline font-bold text-[13px] uppercase tracking-widest">Công ty</h4>
            <ul className="space-y-4">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-500 hover:text-[#e4322a] transition-colors text-[14px] font-medium">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-slate-900 font-headline font-bold text-[13px] uppercase tracking-widest">Đăng ký nhận tin</h4>
            <p className="text-slate-500 text-[14px] leading-relaxed font-body">
              Đăng ký để nhận tin tức mới nhất về các xu hướng tổ chức sự kiện và bản cập nhật sản phẩm.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email của bạn"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#e4322a] focus:bg-white transition-all"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-md active:scale-95">
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            <span className="text-slate-400 text-[12px]">© 2026 Prestige Planner.</span>
            {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Cookie'].map(legal => (
              <a key={legal} href="#" className="text-slate-500 hover:text-[#e4322a] text-[12px] font-medium transition-colors">{legal}</a>
            ))}
          </div>
          
          <div className="flex items-center gap-6 relative">
            <div className="flex items-center gap-3">
              <span className="text-slate-900 text-[12px] font-headline font-black uppercase tracking-[0.1em]">Ngôn ngữ:</span>
              <div 
                className="flex items-center gap-3 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 cursor-pointer hover:border-[#e4322a] hover:text-[#e4322a] transition-all duration-300 shadow-sm group min-w-[160px] justify-between"
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedLang.flag} 
                    alt={selectedLang.label} 
                    className="w-5 h-auto rounded-sm object-contain shadow-sm"
                  />
                  <span className="font-headline">{selectedLang.label}</span>
                </div>
                <motion.span 
                  animate={{ rotate: isLangOpen ? 180 : 0 }}
                  className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#e4322a]"
                >
                  expand_more
                </motion.span>
              </div>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-4 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        selectedLang.code === lang.code 
                          ? 'bg-red-50 text-[#e4322a]' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <img src={lang.flag} alt={lang.label} className="w-5 h-auto rounded-sm" />
                      <span className="text-sm font-bold font-headline">{lang.label}</span>
                      {selectedLang.code === lang.code && (
                        <span className="material-symbols-outlined ml-auto text-[18px]">check</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </footer>
  );
};

export default LandingFooter;
