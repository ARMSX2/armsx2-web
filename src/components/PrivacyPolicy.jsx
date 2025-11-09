/** @file PrivacyPolicy.jsx
 * @description: Privacy Policy page

 * This file contains:
 * - Everything for the Privacy Policy page component */

import React, { forwardRef } from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = forwardRef(({ isthetransitioninghappening }, ref) => {
  const navigate = useNavigate();

  // change maybe (pls dont make it purple again)
  const MAIN_BG = "bg-[#0d0e14]";
  const PRIMARY_COLOR = "text-[#8b85fc]";

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <section
      ref={ref}
      className={`pt-12 pb-20 ${MAIN_BG} transition-colors duration-500 min-h-screen flex items-center relative overflow-hidden ${
        isthetransitioninghappening
          ? "opacity-0 transform translate-x-12"
          : "opacity-100 transform translate-x-0"
      }`}
    >
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-2 rounded-full bloom-strong1 transform -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: "var(--accent-2)", zIndex: 0 }}
      />
      <div
        className="absolute top-3/4 right-1/4 w-80 h-80 bg-accent rounded-full bloom-strong1 transform translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: "var(--accent)", zIndex: 0 }}
      />
      <img
        src="/icon.png"
        alt="ARMSX2 Logo"
        style={{
          opacity: window.innerWidth <= 550 ? 0.64582 : 0.8,
          transform: window.innerWidth <= 550 ? "scale(0.8)" : "scale(1)",
          filter: "drop-shadow(0 4px 10px rgba(193, 176, 255, 0.4))",
        }}
        className={`fixed max-[336px]:top-5 max-[336px]:left-5 top-8 left-8 w-12 h-12 z-50 cursor-pointer hover:opacity-80 transition-opacity duration-200`}
        onClick={handleLogoClick}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-12">
        <div className="glassish p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-4xl mt-3 font-semibold leading-tight text-white text-glow mb-2">
              Privacy Policy
            </h2>
            <p className="text-xl text-white/80">
              Last updated: October 29, 2025
            </p>
          </div>

          <div className="space-y-8 text-white/90">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white flex items-center">
                Information We Collect
              </h3>
              <p className="text-lg leading-relaxed">
                ARMSX2 does not collect, store, or share any personal
                information about users. We do not use analytics, tracking
                technologies, advertising identifiers, or any other tools that
                gather data. The app operates fully offline and all processing
                happens directly on your own device.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                By using ARMSX2, you agree that no personal data is required or
                transmitted in order to access or enjoy the application.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                If you have any questions, feedback, or concerns regarding
                privacy or functionality, please contact us at: 📩{" "}
                <bold>armsx2mail@gmail.com</bold>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                In the event of any disputes or legal matters relating to this
                Privacy Policy or ARMSX2, French law will apply, and any legal
                proceedings must be handled exclusively in the courts of France.
                Certain ARMSX2 staff members, contributors, or affiliates are
                not personally liable for any claims, damages, or legal actions
                arising from the use of the application. Only the entity
                operating ARMSX2 may be subject to such proceedings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default PrivacyPolicy;
