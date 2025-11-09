/** @file AboutAndFAQ.jsx
 * @description: 3rd section on the index page

 * This file contains:
 * - Everything for the About and FAQ section */

import React from 'react';
import faq from "../data/faq.json";

const AboutAndFAQ = ({ handleTransitionAndNavigate }) => {
  return (
    <div
      className="relative mx-auto max-w-7xl px-6 py-24 md:py-0 md:flex md:items-center min-h-screen snap-start flex flex-col justify-center"
      id="about"
    >
      <div className="w-full flex flex-col md:flex-row md:gap-8 md:max-w-6xl">
        <div className="w-full md:w-1/2 space-y-8">
          <h2 className="text-2xl font-semibold text-white">
            About ARMSX2
          </h2>
          <div className="space-y-6 text-white/80">
            <p>
              ARMSX2 began after years of there being no open source PS2
              emulator for ARM systems, and so developer MoonPower with
              the support of jpolo1224 decided to try their hand at
              porting a new PS2 emulator for Android, forking from the
              repository PCSX2_ARM64 by developer Pontos. fffathur is
              responsible for the original logo, all credits to him.
            </p>
            <p>
              Moon has and will continue doing his best to fill in the
              gaps and make this into a complete emulator, with the goal
              to have version parity with PCSX2. This project is not
              officially associated with PCSX2, and we are not associated
              with any other forks made from the original repository.
            </p>
            <p>
              This is our own attempt at continuing PS2 emulation on
              Android, iOS, and other ARM Platforms. The emulator
              currently operates as x86 to arm64, not native arm64, so the
              performance will not be as good as AetherSX2 currently,
              however things are subject to change as development goes on.
            </p>
          </div>
        </div>
        <div
          className="w-full md:w-1/2 space-y-8 mt-8 md:mt-0"
          style={{
            marginLeft: window.innerWidth >= 768 ? "15px" : "0",
          }}
        >
          <h2 className="text-2xl font-semibold text-white">FAQ</h2>
          <div className="space-y-4">
            {faq.map((item, index) => (
              <details
                key={index}
                className="group rounded-lg bg-white/5 backdrop-blur-sm ring-1 ring-white/10 p-4 transition-all duration-300"
              >
                <summary className="flex cursor-pointer items-center justify-between text-white font-medium group-hover:text-[#8d76cc] transition-colors">
                  {item.question}
                  <svg
                    className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-4 leading-relaxed text-white/70">
                  {item.answer}
                </p>
              </details>
            ))}
            <div className="text-center py-1 text-white/70 text-sm bg-transparent">
              <button
                onClick={() => handleTransitionAndNavigate("/privacy")}
                className="hover:text-white/90 transition-colors cursor-pointer focus:outline-none"
                aria-label="Privacy Policy"
              >
                Press here to view our Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutAndFAQ;