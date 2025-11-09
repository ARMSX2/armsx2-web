/** @file Credits.jsx
 * @description: 4th section on the index page

 * This file contains:
 * - Everything for the credits section, except for credit items */

import React from "react";
import CreditItem from "./CreditItem";
import projectMembers from "../data/credits.json";

const CreditsSection = () => {
  return (
    <div className="relative w-full snap-start" id="credits">
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-0 md:flex md:items-center min-h-screen flex flex-col justify-center">
        <h2 className="title text-4xl md:text-5xl font-semibold leading-tight text-white text-glow mb-8 md:mb-10 text-center">
          Credits
        </h2>
        <div className="w-full max-w-3xl mx-auto">
          <div className="pl-0 pb-6 flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="w-full md:w-1/2 text-center">
              <h3 className="text-2xl font-bold text-[#8d76cc] mb-4">
                Project Leads
              </h3>
              <div className="space-y-3 items-center">
                {projectMembers.projectLeads.map((member) => (
                  <CreditItem key={member.name} member={member} />
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center">
              <h3 className="text-2xl font-bold text-[#8d76cc]/70 mb-4">
                Co-Founder
              </h3>
              <div className="space-y-3 items-center">
                {projectMembers.coFounder.map((member) => (
                  <CreditItem key={member.name} member={member} />
                ))}
              </div>
            </div>
          </div>
          <div className="pt-2">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div className="w-full md:w-1/2 text-center">
                <h3 className="text-xl font-semibold text-[#8d76cc] mb-4">
                  Development Team
                </h3>
                <div className="space-y-3 items-center">
                  {projectMembers.devTeam.map((member) => (
                    <CreditItem key={member.name} member={member} />
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2 text-center">
                <h3 className="text-xl font-semibold text-[#8d76cc] mb-4">
                  Graphic Design
                </h3>
                <div className="space-y-3 items-center">
                  {projectMembers.graphicDesign.map((member) => (
                    <CreditItem key={member.name} member={member} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsSection;
