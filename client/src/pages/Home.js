import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "./home/HeroSection";
import StakeholderSection from "./home/StakeholderSection";
import StudentSection from "./home/StudentSection";
import CompanySection from "./home/CompanySection";
import AdminSection from "./home/AdminSection";
import AuthModal from "../components/AuthModal";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import CompanyLoginModal from "../components/CompanyLoginModal";
import CompanyRegisterModal from "../components/CompanyRegisterModal";
import AdminLoginModal from "../components/AdminLoginModal";

const Home = () => {
  const [activeModal, setActiveModal] = useState(null); // 'auth', 'studentLogin', 'studentRegister', 'companyLogin', 'companyRegister', 'adminLogin'
  const [modalData, setModalData] = useState({ role: "Student" });
  const [initialRole] = useState("student");

  const openAuthModal = (role) => {
    setActiveModal('auth');
    setModalData(prev => ({ ...prev, role }));
  };

  const closeAuthModal = () => {
    setActiveModal(null);
  };

  // Wire up global observers for the nested sections
  React.useEffect(() => {
    window.onStudentRegister = () => setActiveModal('studentRegister');
    window.onCompanyRegister = () => setActiveModal('companyRegister');
    return () => {
      delete window.onStudentRegister;
      delete window.onCompanyRegister;
    };
  }, []);

  return (
    <div className="scroll-smooth">
      <Navbar onLoginClick={() => setActiveModal('studentLogin')} />
      <main>
        <HeroSection onGetStarted={() => openAuthModal("Student")} />
        <StakeholderSection
          onRegisterClick={() => setActiveModal('studentRegister')}
          onCompanyLoginClick={() => setActiveModal('companyLogin')}
          onAdminLoginClick={() => setActiveModal('adminLogin')}
        />
        <StudentSection onLoginClick={() => setActiveModal('studentLogin')} />
        <CompanySection onLoginClick={() => setActiveModal('companyLogin')} />
        <AdminSection onLoginClick={() => setActiveModal('adminLogin')} />
      </main>
      <Footer />

      <AuthModal 
        isOpen={activeModal === 'auth'} 
        onClose={closeAuthModal} 
        role={modalData?.role || "Student"} 
        onLogin={(role) => {
          if (role === 'company') setActiveModal('companyLogin');
          else if (role === 'admin') setActiveModal('adminLogin');
          else setActiveModal('studentLogin');
        }}
        onRegister={(role) => {
          if (role === 'company') setActiveModal('companyRegister');
          else setActiveModal('studentRegister');
        }}
      />
      <LoginModal 
        isOpen={activeModal === 'studentLogin'} 
        initialRole={initialRole}
        onClose={() => setActiveModal(null)}
        onSwitchToRegister={(role) => {
            if (role === 'company') setActiveModal('companyRegister');
            else setActiveModal('studentRegister');
        }}
      />
      <RegisterModal
        isOpen={activeModal === 'studentRegister'}
        onClose={() => setActiveModal(null)}
        onSwitchToLogin={() => setActiveModal('studentLogin')}
      />
      <CompanyLoginModal
        isOpen={activeModal === 'companyLogin'}
        onClose={() => setActiveModal(null)}
        onSwitchToRegister={() => setActiveModal('companyRegister')}
      />
      <CompanyRegisterModal
        isOpen={activeModal === 'companyRegister'}
        onClose={() => setActiveModal(null)}
        onSwitchToLogin={() => setActiveModal('companyLogin')}
      />
      <AdminLoginModal
        isOpen={activeModal === 'adminLogin'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};

export default Home;
