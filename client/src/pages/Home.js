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
  const [initialLoginRole, setInitialLoginRole] = useState("student");
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

  return (
    <div className="scroll-smooth">
      <Navbar onLoginClick={() => {
        setInitialLoginRole("student");
        setIsLoginModalOpen(true);
      }} />
      <main>
        <HeroSection onGetStarted={() => openAuthModal("Student")} />
        <StakeholderSection
          onRegisterClick={() => setIsRegisterModalOpen(true)}
          onCompanyLoginClick={() => {
            setInitialLoginRole("company");
            setIsLoginModalOpen(true);
          }}
          onAdminLoginClick={() => {
            setInitialLoginRole("admin");
            setIsLoginModalOpen(true);
          }}
        />
        <StudentSection onLoginClick={() => {
          setInitialLoginRole("student");
          setIsLoginModalOpen(true);
        }} />
        <CompanySection onLoginClick={() => {
          setInitialLoginRole("company");
          setIsLoginModalOpen(true);
        }} />
        <AdminSection onLoginClick={() => {
          setInitialLoginRole("admin");
          setIsLoginModalOpen(true);
        }} />
      </main>
      <Footer />

      <AuthModal 
        isOpen={modalData.isOpen} 
        onClose={closeAuthModal} 
        role={modalData.role} 
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
