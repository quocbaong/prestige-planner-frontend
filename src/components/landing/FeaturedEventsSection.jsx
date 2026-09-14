import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import eventTech from '../../assets/event_tech.png';
import eventMusic from '../../assets/event_music.png';
import eventMarketing from '../../assets/event_marketing.png';
import { eventService } from '../../services/eventService';

const categoryDisplay = {
  MUSIC: { label: 'ÂM NHẠC', image: eventMusic, tagColor: 'text-purple-600 bg-purple-50' },
  TECH: { label: 'CÔNG NGHỆ', image: eventTech, tagColor: 'text-indigo-600 bg-indigo-50' },
  BUSINESS: { label: 'DOANH NGHIỆP', image: eventMarketing, tagColor: 'text-orange-600 bg-orange-50' },
  FOOD: { label: 'ẨM THỰC', image: eventMarketing, tagColor: 'text-amber-600 bg-amber-50' },
  ART: { label: 'NGHỆ THUẬT', image: eventMusic, tagColor: 'text-rose-600 bg-rose-50' },
  SPORTS: { label: 'THỂ THAO', image: eventTech, tagColor: 'text-emerald-600 bg-emerald-50' },
  EDUCATION: { label: 'GIÁO DỤC', image: eventMarketing, tagColor: 'text-sky-600 bg-sky-50' },
  ENTERTAINMENT: { label: 'GIẢI TRÍ', image: eventMusic, tagColor: 'text-fuchsia-600 bg-fuchsia-50' },
  OTHER: { label: 'KHÁC', image: eventTech, tagColor: 'text-slate-600 bg-slate-100' },
};

const formatDate = (date) => (
  date
    ? new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : ''
);

const FeaturedEventsSection = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await eventService.getPublicFeaturedEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching featured events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <section className="py-24 bg-[#f8fafc]" id="events">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[0, 1, 2].map((index) => (
              <div key={index} className="bg-white rounded-[2.2rem] p-4 border border-slate-100">
                <div className="aspect-[16/10] rounded-[1.8rem] bg-slate-100 mb-6" />
                <div className="space-y-4 px-3 pb-4">
                  <div className="h-5 w-24 bg-slate-100 rounded-full" />
                  <div className="h-7 w-3/4 bg-slate-100 rounded-lg" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[2.2rem] bg-white border border-dashed border-slate-200 p-16 text-center text-slate-500">
            Hiện chưa có sự kiện tiêu biểu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {events.map((event, index) => {
              const display = categoryDisplay[event.category] || categoryDisplay.OTHER;
              const image = event.thumbnailUrl || event.bannerUrl || display.image;

              return (
                <Motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  onClick={() => navigate(`/events/${event.slug}`)}
                  className="group bg-white rounded-[2.2rem] p-4 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer"
                >
                  <div className="relative aspect-[16/10] rounded-[1.8rem] overflow-hidden mb-6 shadow-inner">
                    <img
                      src={image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>

                  <div className="space-y-4 px-3 pb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${display.tagColor}`}>
                      {display.label}
                    </span>
                    <h3 className="text-xl md:text-2xl font-headline font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                      {event.title}
                    </h3>
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-3 text-slate-500 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        </div>
                        <span className="font-body font-medium">{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                        </div>
                        <span className="font-body font-medium">{event.venue || event.city}</span>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEventsSection;
