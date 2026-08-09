import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const StatItem = ({ value, label, icon, index, total }) => {
  // Parsing value to get numeric part
  const numericStr = value.replace(/,/g, '').match(/[0-9.]+/)[0];
  const numericValue = parseFloat(numericStr);
  const suffix = value.replace(/[0-9,.]/g, '');
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (value.includes('M')) {
      return (latest / 1000000).toFixed(1) + suffix;
    }
    return Math.round(latest).toLocaleString() + suffix;
  });

  useEffect(() => {
    // Determine the target value for animation
    const target = value.includes('M') ? numericValue * 1000000 : numericValue;
    const animation = animate(count, target, {
      duration: 2.5,
      delay: index * 0.15,
      ease: [0.16, 1, 0.3, 1], // Custom slow-out quint ease
    });
    return animation.stop;
  }, [numericValue, value]);

  return (
    <div className={`relative flex flex-col items-center ${index < total - 1 ? 'md:border-r border-slate-200' : ''} px-4 py-16 md:py-24`}>
      {/* Icon floating on the top border */}
      <div className="absolute -top-[28px] w-14 h-14 bg-black rounded-full flex items-center justify-center text-white border-[4px] border-[#fff9f6] z-10">
        <span className="material-symbols-outlined text-[20px] font-light">{icon}</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="text-4xl md:text-5xl font-headline font-black text-slate-900 mb-2 tracking-tight"
      >
        {rounded}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
        className="text-[14px] font-body text-slate-800 lowercase"
      >
        {label}
      </motion.div>
    </div>
  );
};

const StatisticsSection = () => {
  const stats = [
    { value: '100,000+', label: 'sự kiện', icon: 'stars' },
    { value: '50,000+', label: 'nhà tổ chức sự kiện', icon: 'calendar_today' },
    { value: '165+', label: 'quốc gia', icon: 'public' },
    { value: '1.6M+', label: 'người tham dự', icon: 'groups' }
  ];

  return (
    <section className="bg-[#fff9f6] relative">
      {/* The master top horizontal line from the image */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-slate-200"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 w-full">
          {stats.map((stat, i) => (
            <StatItem 
              key={i} 
              {...stat} 
              index={i} 
              total={stats.length} 
            />
          ))}
        </div>
      </div>
      
      {/* Bottom border to close the section cleanly */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-slate-100"></div>
    </section>
  );
};

export default StatisticsSection;
