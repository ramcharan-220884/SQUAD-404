import React from 'react';
import { campusHighlights } from '../../assets/images/dashboardData';

export default function RightPanel() {
  return (
    <aside className="db-right-panel">
      {/* University Info Card */}
      <div className="rp-university-card">
        <div className="rp-uni-logo">🎓</div>
        <h3>Rajiv Gandhi University of Knowledge and Technologies</h3>
        <p>Empowering students through innovation, technology, and industry-ready education.</p>
      </div>

      {/* Campus Highlights — rendered dynamically from data array */}
      <div className="rp-campus-section">
        <h4>Campus Highlights</h4>

        {campusHighlights.map((item) => (
          <div key={item.id} className="rp-campus-card">
            <div className="rp-campus-img-wrap">
              <img
                src={item.image}
                alt={item.title}
                className="rp-campus-img-photo"
              />
              <span className="rp-campus-tag">{item.tag}</span>
            </div>
            <div className="rp-campus-card-info">
              <h5>{item.title}</h5>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
