import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    title: 'Lên kế hoạch',
    desc: 'Thiết lập thông tin và cấu hình sự kiện'
  },
  {
    id: 2,
    title: 'Mời khách',
    desc: 'Gửi lời mời và quản lý danh sách đăng ký'
  },
  {
    id: 3,
    title: 'Quản lý',
    desc: 'Vận hành sự kiện và check-in thời gian thực'
  },
  {
    id: 4,
    title: 'Tổng kết',
    desc: 'Báo cáo hiệu quả và lưu trữ dữ liệu'
  }
];

const WorkflowSection = () => {
  return (
    <section className="py-18 bg-white relative overflow-hidden" id="solutions">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-headline font-black text-slate-900 tracking-tight">
              Quy trình chuyên nghiệp
            </h2>
            <p className="text-lg text-slate-500 font-body">
              Triển khai sự kiện dễ dàng chỉ với 4 bước
            </p>
          </motion.div>
        </div>

        {/* Timeline Container */}
        <div className="relative pt-12">
          {/* Horizontal Line Connecting Steps (Hidden on mobile) */}
          <div className="absolute top-[80px] left-[10%] right-[10%] h-[1px] bg-slate-200 hidden md:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: i * 0.3, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100 
                }}
                className="flex flex-col items-center text-center group"
              >
                {/* Step Number Circle */}
                <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-headline font-black text-xl shadow-xl shadow-indigo-600/20 mb-8 border-4 border-white relative z-20 group-hover:scale-110 transition-transform duration-500">
                  {step.id}
                  {/* Subtle pulsing glow for current step feeling */}
                  <div className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-20 hidden lg:group-hover:block"></div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-headline font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-body leading-relaxed max-w-[200px] mx-auto opacity-80 group-hover:opacity-100 italic">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default WorkflowSection;
