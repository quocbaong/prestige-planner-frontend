import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Nguyễn Minh Anh',
    role: 'CEO Global Events',
    content: 'Thay đổi hoàn toàn cách chúng tôi quản lý sự kiện. Check-in QR và báo cáo ngân sách cực kỳ trơn tru.',
    avatar: 'https://i.pravatar.cc/150?u=ma1'
  },
  {
    name: 'Trần Thu Thủy',
    role: 'Event Specialist',
    content: 'Giao diện hiện đại, dễ dùng. Đội ngũ hỗ trợ nhiệt tình giúp triển khai nhanh chóng.',
    avatar: 'https://i.pravatar.cc/150?u=ttt'
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Co-founder Startup Hub',
    content: 'Giải pháp tuyệt vời cho Tech Summit. Xử lý dữ liệu khách mời rất chuyên nghiệp.',
    avatar: 'https://i.pravatar.cc/150?u=lhn'
  },
  {
    name: 'Phạm Thanh Hương',
    role: 'Wedding Planner',
    content: 'Giúp tôi quản lý danh sách khách mời đám cưới 500 người một cách nhẹ nhàng.',
    avatar: 'https://i.pravatar.cc/150?u=pth'
  },
  {
    name: 'Đặng Quốc Bảo',
    role: 'HR Manager @ FPT',
    content: 'Hệ thống tuyệt vời để tổ chức các buổi Workshop nội bộ cho công ty.',
    avatar: 'https://i.pravatar.cc/150?u=dqb'
  },
  {
    name: 'Vũ Mỹ Linh',
    role: 'Marketing Director',
    content: 'Landing Page tùy chỉnh giúp tỷ lệ chuyển đổi vé của chúng tôi tăng 40%.',
    avatar: 'https://i.pravatar.cc/150?u=vml'
  },
  {
    name: 'Hoàng Gia Bách',
    role: 'Music Producer',
    content: 'Mọi thứ từ bán vé đến vận hành tại chỗ đều được số hóa hoàn hảo.',
    avatar: 'https://i.pravatar.cc/150?u=hgb'
  },
  {
    name: 'Trịnh Kim Chi',
    role: 'Hội Thảo Y Khoa',
    content: 'Sự chuyên nghiệp trong cách quản lý diễn giả và lịch trình là điểm cộng lớn.',
    avatar: 'https://i.pravatar.cc/150?u=tkc'
  }
];

const TestimonialsSection = () => {
  // Duplicate testimonials for seamless looping
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-8 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-headline font-black text-slate-900 tracking-tight">
            Khách hàng tin tưởng
          </h2>
          <p className="text-lg text-slate-500 font-body">
            Đồng hành cùng hàng ngàn sự kiện thành công mỗi năm
          </p>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="flex relative overflow-hidden py-10">
        <motion.div 
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            repeat: Infinity, 
            duration: 40, 
            ease: "linear" 
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {doubledTestimonials.map((item, i) => (
            <div
              key={i}
              className="w-[320px] md:w-[400px] flex-shrink-0 bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between whitespace-normal group hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="material-symbols-outlined fill-current text-[16px]">star</span>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-base text-slate-600 font-body font-medium leading-relaxed italic">
                  "{item.content}"
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-4 flex items-center gap-3 border-t border-slate-50 pt-4">
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className="w-10 h-10 rounded-full border-2 border-indigo-50 shadow-sm"
                />
                <div>
                  <h4 className="font-headline font-black text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 font-body uppercase tracking-wider font-bold">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
