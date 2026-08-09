import React from 'react';
import { motion } from 'framer-motion';
import inPersonVid from '../../assets/Video/inperson-event.webm';
import virtualVid from '../../assets/Video/virtual-event.webm';
import hybridVid from '../../assets/Video/hybrid-event.webm';

const ExperienceTypesSection = () => {
  const types = [
    {
      title: 'Trực tiếp',
      desc: 'Trải nghiệm sự bùng nổ của những tương tác trực tiếp, nơi kết nối thực sự thăng hoa tại địa điểm tổ chức.',
      color: 'from-[#10b981] to-[#34d399]',
      accentColor: 'text-[#065f46]',
      bgAccent: 'bg-emerald-500/10',
      video: inPersonVid,
      icon: 'stadium'
    },
    {
      title: 'Trực tuyến',
      desc: 'Phá bỏ mọi rào cản địa lý với sân khấu ảo đỉnh cao, mang sự kiện của bạn đến với khán giả toàn cầu.',
      color: 'from-[#f59e0b] to-[#fbbf24]',
      accentColor: 'text-[#92400e]',
      bgAccent: 'bg-amber-500/10',
      video: virtualVid,
      icon: 'desktop_windows'
    },
    {
      title: 'Kết hợp',
      desc: 'Sự giao thoa hoàn hảo giữa thế giới thực và ảo, tối ưu hóa sự tiếp cận và hiệu quả cho mọi quy mô sự kiện.',
      color: 'from-[#1e1b4b] to-[#312e81]',
      accentColor: 'text-white',
      bgAccent: 'bg-white/5',
      video: hybridVid,
      icon: 'hub'
    }
  ];

  return (
    <section className="py-24 bg-[#f8fafc] overflow-hidden" id="solutions">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        <div className="text-center mb-16 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-headline font-black text-slate-900 tracking-tight leading-[1.4]"
          >
            Linh hoạt tối đa, đáp ứng mọi <br />nhu cầu tổ chức sự kiện
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {types.map((type, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={`group relative rounded-[3.5rem] p-10 flex flex-col min-h-[500px] shadow-2xl shadow-slate-200/50 bg-gradient-to-br ${type.color} transition-all duration-700 hover:-translate-y-4`}
            >
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] rounded-[3.5rem]"></div>

              <div className="flex-1 space-y-4 relative z-10">
                <div className="space-y-4">
                  <h3 className="text-4xl font-headline font-black tracking-tight text-white">{type.title}</h3>
                  <p className="text-lg opacity-90 font-body leading-relaxed max-w-[90%] text-white">
                    {type.desc}
                  </p>
                </div>

                <div className="pt-4">
                   <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/50 font-headline font-black text-xs transition-all duration-300 hover:bg-white hover:text-black hover:border-white text-white">
                      Tìm hiểu thêm
                      <span className="material-symbols-outlined text-lg">trending_flat</span>
                   </button>
                </div>
              </div>

              {/* Ultra Polished Video Mockup Container */}
              <div className="relative mt-8 group/vid overflow-visible">
                 <div className="absolute -inset-1 bg-white/20 blur-2xl rounded-3xl opacity-0 group-hover/vid:opacity-100 transition-opacity duration-700"></div>
                 
                 <div className="relative rounded-3xl overflow-hidden bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-4 border-slate-900/10">
                    {/* Window Controls UI Mockup */}
                    <div className="absolute top-0 inset-x-0 h-7 bg-slate-900/80 backdrop-blur-md flex items-center px-4 gap-1.5 z-20">
                       <div className="w-2 h-2 rounded-full bg-red-400"></div>
                       <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                       <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                       <div className="ml-4 h-2 w-16 bg-white/10 rounded-full"></div>
                    </div>

                    <video
                      src={type.video}
                      className="w-full h-full object-cover aspect-video mt-7 opacity-90 transition-all duration-1000 group-hover:opacity-100 group-hover:scale-110"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />

                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                             <span className="text-[10px] text-white font-black uppercase tracking-widest">Prestige Live</span>
                          </div>
                          <span className="material-symbols-outlined text-white/50 text-lg">settings</span>
                       </div>
                    </div>
                 </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ExperienceTypesSection;
