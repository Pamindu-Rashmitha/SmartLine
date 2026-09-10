import React from 'react';

const BrandLogo = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4' },
    md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
    lg: { box: 'w-12 h-12 rounded-xl', icon: 'w-6 h-6' },
    xl: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 shadow-md shadow-blue-500/25 flex-shrink-0 ${currentSize.box} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${currentSize.icon} text-white`}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
};

export default BrandLogo;
