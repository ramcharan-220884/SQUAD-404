import React, { useState } from 'react';

export default function HelpSupport() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      question: "How do I update my profile?",
      answer: "Navigate to the 'My Profile' tab from the sidebar. Click on the 'Edit Profile' button to update your details, including contact information and academic records."
    },
    {
      question: "How do I view job profiles?",
      answer: "Click on 'Browse Jobs' in the sidebar menu. You can then view all available opportunities, read the descriptions, and apply directly."
    },
    {
      question: "How do I contact support?",
      answer: "You can use the 'Email Us' link above or call our Helpdesk at the number provided during our working hours for immediate assistance."
    },
    {
      question: "How do I register for upcoming events?",
      answer: "Go to the 'Events' section on your dashboard. Browse the upcoming activities and click 'Register' on the event card of your choice."
    },
    {
      question: "Where can I upload or update my resume?",
      answer: "You can upload or update your resume in the 'My Profile' section under the 'Documents' tab."
    }
  ];

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  return (
    <div className="hs-root">
      {/* Header section */}
      <div className="hs-header">
        <h2 className="hs-title">Help &amp; Support</h2>
        <p className="hs-subtitle">Find answers to common questions or contact the support team.</p>
      </div>

      {/* Contact Cards */}
      <div className="hs-contact-grid">
        <div className="hs-contact-card">
          <div className="hs-contact-icon">📧</div>
          <h3>Email Us</h3>
          <p>support@rgukt.ac.in</p>
        </div>
        <div className="hs-contact-card">
          <div className="hs-contact-icon">📞</div>
          <h3>Helpdesk</h3>
          <p>+91-8645-247000</p>
        </div>
        <div className="hs-contact-card">
          <div className="hs-contact-icon">⏰</div>
          <h3>Hours</h3>
          <p>Mon – Fri, 9 AM – 5 PM</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="hs-faq-section">
        <h3 className="hs-section-title">Frequently Asked Questions</h3>
        <div className="hs-faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`hs-faq-item ${activeFaq === index ? 'active' : ''}`}
            >
              <button 
                className="hs-faq-question" 
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <svg 
                  className={`hs-faq-icon ${activeFaq === index ? 'rotate' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                className="hs-faq-answer"
                style={{ 
                  maxHeight: activeFaq === index ? '200px' : '0', 
                  opacity: activeFaq === index ? '1' : '0',
                  padding: activeFaq === index ? '0 18px 18px 18px' : '0 18px' 
                }}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Banner */}
      <div className="hs-support-banner">
        <h3>Still need help? Our support team is happy to assist.</h3>
        <button className="hs-contact-btn">Contact Support</button>
      </div>
    </div>
  );
}
