import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../stores/AuthContext';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const handleDashboardRedirect = () => {
    if (!user) return;
    if (user.role === 'ATTENDEE') {
      navigate('/attendee/dashboard');
    } else if (user.role === 'ORGANIZER') {
      navigate('/organizer/dashboard');
    } else if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for sections
  useEffect(() => {
    if (location.pathname !== '/') return;

    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -40% 0px',
      threshold: 0
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const sectionIds = ['hero', 'features', 'solutions', 'events', 'pricing', 'footer'];
    
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('hero');
  };

  const scrollToId = (id) => {
    const element = document.getElementById(id);
    if (element) {
      setActiveSection(id);
      const offset = 80; // Navbar height offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { 
      name: 'Trang chủ', 
      id: 'hero', 
      onClick: () => { navigate('/'); scrollToTop(); }, 
      isActive: location.pathname === '/' && activeSection === 'hero', 
      hasDropdown: false 
    },
    { 
      name: 'Tính năng', 
      id: 'features', 
      onClick: () => scrollToId('features'), 
      isActive: location.pathname === '/' && activeSection === 'features',
      hasDropdown: false 
    },
    { 
      name: 'Giải pháp', 
      id: 'solutions', 
      onClick: () => scrollToId('solutions'), 
      isActive: location.pathname === '/' && activeSection === 'solutions',
      hasDropdown: false 
    },
    { 
      name: 'Sự kiện', 
      id: 'events', 
      onClick: () => scrollToId('events'), 
      isActive: location.pathname.startsWith('/events') || (location.pathname === '/' && activeSection === 'events'), 
      hasDropdown: false 
    },
    { 
      name: 'Tài nguyên', 
      id: 'resources', 
      onClick: () => scrollToId('footer'), 
      isActive: location.pathname === '/' && activeSection === 'footer',
      hasDropdown: false 
    },
    { 
      name: 'Giá', 
      id: 'pricing', 
      onClick: () => scrollToId('pricing'), 
      isActive: location.pathname === '/' && activeSection === 'pricing',
      hasDropdown: false 
    },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
      ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-2.5'
      : 'bg-white border-b border-slate-50 py-2'
      }`}>
      <div className="max-w-7.5xl mx-auto px-6 md:px-15 flex items-center justify-between">

        {/* Brand Logo - Click to Navigate Home */}
        <div
          className="cursor-pointer group flex items-center"
          onClick={() => { navigate('/'); scrollToTop(); }}
        >
          <img
            src={logo}
            alt="Prestige Planner"
            className="h-9 md:h-15 w-auto object-contain transition-all duration-300 group-hover:scale-[1.05]"
          />
        </div>

        {/* Desktop Menu - Reverted to Elegant Style */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <div
              key={link.name}
              className="flex items-center gap-1 group cursor-pointer relative py-2"
              onClick={link.onClick}
            >
              <span className={`text-[15px] font-body font-medium transition-all duration-300 ${link.isActive ? 'text-[#e4322a]' : 'text-slate-700 hover:text-[#e4322a]'}`}>
                {link.name}
              </span>
              {link.hasDropdown && (
                <span className={`material-symbols-outlined text-[18px] transition-all duration-300 ${link.isActive ? 'text-[#e4322a]' : 'text-slate-400 group-hover:text-[#e4322a] group-hover:rotate-180'}`}>
                  expand_more
                </span>
              )}
              {/* Subtle underline */}
              <div className={`absolute bottom-0 left-0 h-[2px] bg-[#e4322a] transition-all duration-300 ${link.isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
            </div>
          ))}
        </div>

        {/* Action Buttons - Reverted to Professional Style */}
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={handleDashboardRedirect}
              className="bg-[#e4322a] hover:bg-[#cc2d26] text-white px-6 py-2.5 rounded-lg text-[15px] font-headline font-bold transition-all duration-300 shadow-sm active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Trang tổng quan
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-[15px] font-body font-bold text-slate-700 hover:text-[#e4322a] transition-all duration-300 px-4 py-2 hover:bg-slate-50 rounded-lg"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#e4322a] hover:bg-[#cc2d26] text-white px-7 py-2.5 rounded-lg text-[15px] font-headline font-bold transition-all duration-300 shadow-sm active:scale-95"
              >
                Bắt đầu
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default LandingNavbar;
