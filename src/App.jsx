import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Front from "./components/front";
import CompatibilityList from "./components/CompatibilityList.jsx"; // ignore error bruh youll live
import ContactUs from "./components/ContactUs.jsx";

const RouteTransitionWrapper = ({ contactFormProps }) => {
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayLocation, setDisplayLocation] = useState(location);
    const navigateToPage = (pagePath) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setDisplayLocation(location);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 10);
        }, 100);
    };
    useEffect(() => {
        if (location.pathname !== displayLocation.pathname) {
            navigateToPage(location.pathname);
        } else if (isTransitioning) {
            setIsTransitioning(false);
        }
    }, [location, displayLocation.pathname, isTransitioning]);
    const key = displayLocation.pathname;
    const isEntering = !isTransitioning;
    return (
        <div className="relative overflow-hidden">
            <Routes location={displayLocation} key={key}>
                <Route
                    path="/"
                    element={
                        <Front
                            onNavigate={navigateToPage} // Ora chiama la funzione sopra (con useEffect)
                            isthetransitioninghappening={isTransitioning}
                            isEntering={isEntering && displayLocation.pathname === "/"}
                        />
                    }
                />
                <Route
                    path="/compatibility"
                    element={
                        <CompatibilityList
                            isthetransitioninghappening={isTransitioning}
                            isEntering={isEntering && displayLocation.pathname === "/compatibility"}
                            onNavigate={navigateToPage}
                        />
                    }
                />
                <Route
                    path="/contact"
                    element={
                        <ContactUs
                            {...contactFormProps}
                            isthetransitioninghappening={isTransitioning}
                            isEntering={isEntering && displayLocation.pathname === "/contactus"}
                            onNavigate={navigateToPage}
                        />
                    }
                />
            </Routes>
            {isTransitioning && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-300" />
            )}
        </div>
    );
};

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

  const contactFormProps = {
    name,
    email,
    message,
    status,
    loading,
    setName,
    setEmail,
    setMessage,
    handleSubmit,
  };


  return (
    <Router>
      <RouteTransitionWrapper contactFormProps={contactFormProps} />
    </Router>
  );
}

export default App;
