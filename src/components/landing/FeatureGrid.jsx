import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Quản lý Sự kiện',
    description: 'Tạo và quản lý mọi chi tiết sự kiện từ địa điểm, thời gian đến nhà cung cấp trong một giao diện duy nhất.',
    icon: 'event_note',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Quản lý Người tham gia',
    description: 'Phân nhóm khách mời, gửi email tự động và theo dõi phản hồi xác nhận tham gia trực tuyến.',
    icon: 'groups',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Lịch trình Thông minh',
    description: 'Sắp xếp các phiên thảo luận, workshop và lịch diễn giả một cách khoa học và linh hoạt.',
    icon: 'calendar_today',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600'
  },
  {
    title: 'Check-in QR Siêu tốc',
    description: 'Giảm thiểu thời gian chờ đợi với hệ thống quét mã QR tự động tại cửa vào sự kiện.',
    icon: 'qr_code_scanner',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  },
  {
    title: 'Quản lý Ngân sách',
    description: 'Kiểm soát chi phí theo thời gian thực và tự động báo cáo doanh thu vé bán được.',
    icon: 'payments',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600'
  },
  {
    title: 'Phân tích & Báo cáo',
    description: 'Dữ liệu trực quan hóa về hành vi khách hàng và hiệu quả của từng chiến dịch truyền thông.',
    icon: 'analytics',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600'
  }
];

const FeatureGrid = () => {
  return (
    <section className="bg-[#f8fafc] py-24 md:py-32" id="features">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-headline font-black text-slate-900 tracking-tight">
              Tính năng vượt trội
            </h2>
            <p className="text-lg md:text-xl text-slate-500 font-body max-w-2xl mx-auto">
              Tất cả những gì bạn cần để quản lý một sự kiện thành công
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white rounded-[1.8rem] p-5 md:p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 group"
            >
              <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-5 transition-transform duration-500 group-hover:rotate-12`}>
                <span className={`material-symbols-outlined text-[20px] ${feature.iconColor}`}>{feature.icon}</span>
              </div>
              
              <h3 className="text-lg font-headline font-black text-slate-900 mb-2 tracking-tight">
                {feature.title}
              </h3>
              
              <p className="text-slate-600 font-body leading-relaxed text-sm opacity-80 italic">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeatureGrid;
