import React, { useState, useCallback } from "react";
import Front from "./components/front";
import CompatibilityList from "./components/CompatibilityList.jsx"; // ignore error bruh youll live
import ContactUs from "./components/ContactUs.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // eslint-disable-next-line
  const [nextPage, setNextPage] = useState(null);

  // contactus backend request state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigateToPage = (page) => {
    if (page === currentPage || isTransitioning) return;

    setIsTransitioning(true);
    setNextPage(page);

    setTimeout(() => {
      setCurrentPage(page);
      setNextPage(null);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  //Post function for Backend
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const formData = { name, email, message };
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus('Request sent successfully! We will contact you soon.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const errorData = await response.json(); 
        setStatus(`Error: ${errorData.message || 'An error occurred while sending.'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setStatus('Connection error. Please check your network.');
    } finally {
      setLoading(false);
    }
  }, [name, email, message]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "compatibility":
        return (
          <CompatibilityList
            isthetransitioninghappening={isTransitioning}
            isEntering={!isTransitioning && currentPage === "compatibility"}
            onNavigate={navigateToPage}
          />
        );
      case "contactus":
        return (
          <ContactUs
            name={name}
            email={email}
            message={message}
            status={status}
            loading={loading}
            setName={setName}
            setEmail={setEmail}
            setMessage={setMessage}
            handleSubmit={handleSubmit}
            isthetransitioninghappening={isTransitioning}
            isEntering={!isTransitioning && currentPage === "contactus"}
            onNavigate={navigateToPage}
          />
        );
      case "home":
      default:
        return (
          <Front
            onNavigate={navigateToPage}
            isTransitioning={isTransitioning}
            isEntering={!isTransitioning && currentPage === "home"}
          />
        );
    }
  };

  return (
    <div className="relative overflow-hidden">
      {renderCurrentPage()}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
}

export default App;
