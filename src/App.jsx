import React, { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Index from "./components/Index";

import CompatibilityList from "./components/CompatibilityList.jsx";
import ContactUs from "./components/ContactUs.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";

import { useContactForm } from "./hooks/useContactForm";

const RouteTransitionWrapper = ({ contactFormProps }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);
  const navigateToPage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setDisplayLocation(location);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 10);
    }, 100);
  }, [isTransitioning, location]);

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
          key="/"
          path="/"
          element={
            <Index
              onNavigate={navigateToPage}
              isthetransitioninghappening={isTransitioning}
              isEntering={isEntering && displayLocation.pathname === "/"}
            />
          }
        />
        <Route
          key="/compatibility"
          path="/compatibility"
          element={
            <CompatibilityList
              isthetransitioninghappening={isTransitioning}
              isEntering={
                isEntering && displayLocation.pathname === "/compatibility"
              }
              onNavigate={navigateToPage}
            />
          }
        />
        <Route
          key="/contact"
          path="/contact"
          element={
            <ContactUs
              {...contactFormProps}
              isthetransitioninghappening={isTransitioning}
              isEntering={isEntering && displayLocation.pathname === "/contact"}
              onNavigate={navigateToPage}
            />
          }
        />
        <Route
          key="/privacy"
          path="/privacy"
          element={
            <PrivacyPolicy
              isthetransitioninghappening={isTransitioning}
              isEntering={isEntering && displayLocation.pathname === "/privacy"}
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
  const contactFormProps = useContactForm();

  return (
    <Router>
      <RouteTransitionWrapper contactFormProps={contactFormProps} />
    </Router>
  );
}

export default App;
