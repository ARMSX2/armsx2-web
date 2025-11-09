/** @file CreditItem.jsx
 * @description: Pop-up card for credits section

 * This file contains:
 * - A card for the credits section displaying team member info */

import React from 'react';

const CreditItem = ({ member }) => {
  const handleClick = () => {
    window.open(member.github, '_blank');
  };

  return (
    <div 
      className="flex items-center gap-4 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/5 hover:scale-[1.02] shadow-sm hover:shadow-lg max-w-sm mx-auto"
      onClick={handleClick}
      role="link"
      tabIndex={0}
      aria-label={`View ${member.name}'s GitHub`}
    >
      <img
        src={member.image}
        alt={`${member.name} avatar`}
        className="w-12 h-12 rounded-full object-cover border-2 border-[#8d76cc]"
      />
      <div className="text-left">
        <p className="text-base font-medium text-white/95">
          {member.name}
        </p>
        <p className="text-sm text-white/60">
          {member.role}
        </p>
      </div>
    </div>
  );
};

export default CreditItem;