import React, { useEffect, useState } from 'react';
import { getEvents } from '../../services/studentService';
import { Calendar, Loader2 } from 'lucide-react';

export default function RightPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestEvents = async () => {
      try {
        const data = await getEvents();
        // Show only the 3 most recent/upcoming events
        setEvents((data || []).slice(0, 3));
      } catch (err) {
        console.error("Error fetching events for right panel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestEvents();
  }, []);

  return (
    <aside className="db-right-panel">
      {/* University Info Card */}
      <div className="rp-university-card">
        <div className="rp-uni-logo">🎓</div>
        <h3>Rajiv Gandhi University of Knowledge and Technologies</h3>
        <p>Empowering students through innovation, technology, and industry-ready education.</p>
      </div>

      {/* Live Events Section */}
      <div className="rp-campus-section">
        <h4>Upcoming Events</h4>

        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : events.length === 0 ? (
          <p className="text-xs text-center text-gray-400 py-4 font-bold uppercase tracking-widest">No upcoming events</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="rp-campus-card">
              <div className="rp-campus-card-info" style={{ padding: '0px' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{ev.type}</span>
                </div>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: '#333', marginBottom: '4px' }}>{ev.title}</h5>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(ev.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
