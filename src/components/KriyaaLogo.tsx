import React from 'react';

interface KriyaaLogoProps {
  className?: string;
}

export const KriyaaLogo: React.FC<KriyaaLogoProps> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kriyaa Promoters Logo"
    >
      {/* Left Triangle facet (Forest / Jade Green: #166534 / #15803D) */}
      <path
        d="M6 26L18 6V26H6Z"
        fill="#166534"
      />
      <path
        d="M10 26L18 11V26H10Z"
        fill="#15803D"
      />

      {/* Right Triangle facet & Towers (Metallic Gold / Amber: #EAB308 / #CA8A04) */}
      <path
        d="M20 9L33 26H20V9Z"
        fill="#CA8A04"
      />
      <path
        d="M20 13L29 26H20V13Z"
        fill="#EAB308"
      />
      {/* Tower silhouette lines */}
      <rect x="22.5" y="17" width="2" height="9" fill="#FEF08A" rx="0.5" />
      <rect x="26" y="20.5" width="2" height="5.5" fill="#FEF08A" rx="0.5" />

      {/* Stylized geometric "K" central junction cut */}
      <path
        d="M15.5 10H18V17L22.5 10H25.5L20 18.2L26 26H23L18 19.5V26H15.5V10Z"
        fill="#FFFFFF"
        opacity="0.95"
      />

      {/* Deep Crimson Accent Baseline bar (#991B1B) */}
      <rect
        x="5"
        y="29"
        width="29"
        height="3"
        rx="1.5"
        fill="#991B1B"
      />
    </svg>
  );
};
