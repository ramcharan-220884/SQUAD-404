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
  const [modalData, setModalData] = useState({ isOpen: false, role: "Student" });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [initialLoginRole] = useState("student");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCompanyLoginOpen, setIsCompanyLoginOpen] = useState(false);
  const [isCompanyRegisterOpen, setIsCompanyRegisterOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const openAuthModal = (role) => {
    setModalData({ isOpen: true, role });
  };

  const closeAuthModal = () => {
    setModalData({ ...modalData, isOpen: false });
  };

  // Wire up global observers for the nested sections
  React.useEffect(() => {
    window.onStudentRegister = () => setIsRegisterModalOpen(true);
    window.onCompanyRegister = () => setIsCompanyRegisterOpen(true);
    return () => {
      delete window.onStudentRegister;
      delete window.onCompanyRegister;
    };
  }, []);

  return (
    <div className="scroll-smooth">
      <Navbar onLoginClick={() => {
        setIsLoginModalOpen(true);
      }} />
      <main>
        <HeroSection onGetStarted={() => openAuthModal("Student")} />
        <StakeholderSection
          onRegisterClick={() => setIsRegisterModalOpen(true)}
          onCompanyLoginClick={() => {
            setIsCompanyLoginOpen(true);
          }}
          onAdminLoginClick={() => {
            setIsAdminLoginOpen(true);
          }}
        />
        <StudentSection onLoginClick={() => {
          setIsLoginModalOpen(true);
        }} />
        <CompanySection onLoginClick={() => {
          setIsCompanyLoginOpen(true);
        }} />
        <AdminSection onLoginClick={() => {
          setIsAdminLoginOpen(true);
        }} />
      </main>
      <Footer />

      <AuthModal 
        isOpen={modalData.isOpen} 
        onClose={closeAuthModal} 
        role={modalData.role} 
        onLogin={(role) => {
          if (role === 'company') {
            setIsCompanyLoginOpen(true);
          } else if (role === 'admin') {
            setIsAdminLoginOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        onRegister={(role) => {
          if (role === 'company') {
            setIsCompanyRegisterOpen(true);
          } else {
            setIsRegisterModalOpen(true);
          }
        }}
      />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        initialRole={initialLoginRole}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={(role) => {
            setIsLoginModalOpen(false);
            if (role === 'company') {
                setIsCompanyRegisterOpen(true);
            } else {
                setIsRegisterModalOpen(true);
            }
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
        }}
      />
      <CompanyLoginModal
        isOpen={isCompanyLoginOpen}
        onClose={() => setIsCompanyLoginOpen(false)}
        onSwitchToRegister={() => {
            setIsCompanyLoginOpen(false);
            setIsCompanyRegisterOpen(true);
        }}
      />
      <CompanyRegisterModal
        isOpen={isCompanyRegisterOpen}
        onClose={() => setIsCompanyRegisterOpen(false)}
        onSwitchToLogin={() => {
            setIsCompanyRegisterOpen(false);
            setIsCompanyLoginOpen(true);
        }}
      />
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />
    </div>
  );
};

export default Home;
