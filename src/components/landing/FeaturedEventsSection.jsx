import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import eventTech from '../../assets/event_tech.png';
import eventMusic from '../../assets/event_music.png';
import eventMarketing from '../../assets/event_marketing.png';

const events = [
  {
    id: 1,
    title: 'Vietnam Tech Summit 2024',
    category: 'CÔNG NGHỆ',
    tagColor: 'text-indigo-600 bg-indigo-50',
    date: '15 Tháng 12, 2024',
    location: 'Trung tâm Hội nghị Quốc gia',
    image: eventTech
  },
  {
    id: 2,
    title: 'Summer Harmony Festival',
    category: 'GIẢI TRÍ',
    tagColor: 'text-purple-600 bg-purple-50',
    date: '22 Tháng 08, 2024',
    location: 'Công viên Yên Sở, Hà Nội',
    image: eventMusic
  },
  {
    id: 3,
    title: 'Digital Growth Seminar',
    category: 'MARKETING',
    tagColor: 'text-orange-600 bg-orange-50',
    date: '10 Tháng 10, 2024',
    location: 'Bitexco Tower, TP. HCM',
    image: eventMarketing
  }
];

const FeaturedEventsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-[#f8fafc]" id="events">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-headline font-black text-slate-900 tracking-tight">
              Sự kiện tiêu biểu
            </h2>
            <p className="text-lg text-slate-500 font-body">
              Khám phá các sự kiện đang diễn ra trên nền tảng
            </p>
          </div>
          <button 
            onClick={() => navigate('/events')}
            className="text-indigo-600 font-headline font-bold hover:underline transition-all"
          >
            Xem tất cả
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              onClick={() => navigate(`/events/${event.id}`)}
              className="group bg-white rounded-[2.2rem] p-4 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] rounded-[1.8rem] overflow-hidden mb-6 shadow-inner">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>

              {/* Content Box */}
              <div className="space-y-4 px-3 pb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.tagColor}`}>
                  {event.category}
                </span>
                <h3 className="text-xl md:text-2xl font-headline font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {event.title}
                </h3>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                       <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    </div>
                    <span className="font-body font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                       <span className="material-symbols-outlined text-[18px]">location_on</span>
                    </div>
                    <span className="font-body font-medium">{event.location}</span>
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

export default FeaturedEventsSection;
