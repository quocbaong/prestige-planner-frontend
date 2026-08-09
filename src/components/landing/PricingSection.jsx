import React from 'react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Cơ bản',
    price: '0đ',
    period: '/tháng',
    features: [
      'Tối đa 100 khách mời',
      'Quản lý 1 sự kiện/lần',
      'Quét QR cơ bản'
    ],
    button: 'Bắt đầu ngay',
    highlight: false,
    outline: true
  },
  {
    name: 'Chuyên nghiệp',
    price: '1.2tr',
    period: '/tháng',
    features: [
      'Không giới hạn khách mời',
      'Quản lý không giới hạn sự kiện',
      'Tùy chỉnh Landing Page',
      'Báo cáo phân tích nâng cao'
    ],
    button: 'Dùng thử 14 ngày',
    highlight: true,
    tag: 'PHỔ BIẾN NHẤT'
  },
  {
    name: 'Doanh nghiệp',
    price: 'Liên hệ',
    period: '',
    features: [
      'Mọi tính năng Pro',
      'API Integration',
      'Tài khoản quản lý nhóm',
      'Hỗ trợ 24/7 riêng biệt'
    ],
    button: 'Gửi yêu cầu',
    highlight: false,
    outline: true
  }
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-white overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <div className="text-center mb-14 md:mb-18">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-headline font-black text-slate-900 tracking-tight">
              Gói dịch vụ linh hoạt
            </h2>
            <p className="text-lg text-slate-500 font-body">
              Chọn giải pháp phù hợp với quy mô sự kiện của bạn
            </p>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative bg-white rounded-[2.5rem] p-7 md:p-8 flex flex-col justify-between ${plan.highlight ? 'border-4 border-indigo-600/30 scale-105 shadow-2xl z-10' : 'border border-slate-100 shadow-xl'} min-h-[500px]`}
            >
              {plan.tag && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                  {plan.tag}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-3">
                   <h3 className="text-xl font-headline font-black text-slate-800">{plan.name}</h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-headline font-black text-slate-900">{plan.price}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase">{plan.period}</span>
                   </div>
                </div>

                <ul className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                       <span className="material-symbols-outlined text-indigo-500 text-[18px] font-bold">check_circle</span>
                       <span className="text-sm font-body text-slate-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <button 
                  className={`w-full py-4 rounded-full font-headline font-black text-sm transition-all duration-300 shadow-lg active:scale-95 ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30' : 'bg-white text-indigo-600 border-2 border-indigo-600/30 hover:bg-indigo-50'}`}
                >
                  {plan.button}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
