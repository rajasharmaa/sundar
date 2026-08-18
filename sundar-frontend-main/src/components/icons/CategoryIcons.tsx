import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AllProductsIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export const HdpeBagIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Woven sack representation */}
    <path d="M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"></path>
    {/* Cross-hatch pattern for woven texture */}
    <line x1="5" y1="6" x2="19" y2="6"></line>
    <line x1="5" y1="10" x2="19" y2="10"></line>
    <line x1="5" y1="14" x2="19" y2="14"></line>
    <line x1="5" y1="18" x2="19" y2="18"></line>
    <line x1="9" y1="2" x2="9" y2="22"></line>
    <line x1="15" y1="2" x2="15" y2="22"></line>
  </svg>
);

export const PpBagIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* PP woven bag with gusset representation */}
    <path d="M5 4h14l-1-2H6z"></path>
    <path d="M5 4v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4"></path>
    <path d="M8 4v18"></path>
    <path d="M16 4v18"></path>
  </svg>
);

export const BoppBagIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* BOPP bag (laminated, shiny, often printed) */}
    <rect x="5" y="3" width="14" height="18" rx="2" ry="2"></rect>
    <path d="M9 7h6"></path>
    <path d="M9 11h6"></path>
    <path d="M9 15h4"></path>
    {/* Shine effect */}
    <path d="M5 8l4-5"></path>
  </svg>
);

export const BulkBagIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* FIBC / Jumbo Bag with loops */}
    <path d="M4 8v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
    {/* Top opening */}
    <ellipse cx="12" cy="8" rx="8" ry="2"></ellipse>
    {/* Loops */}
    <path d="M4 8V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4"></path>
    <path d="M20 8V4a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v4"></path>
  </svg>
);

export const JuteBagIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Jute sack (organic, tied at top) */}
    <path d="M7 6c-2 2-3 5-3 10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-5-1-8-3-10"></path>
    {/* Tied top */}
    <path d="M8 6h8"></path>
    <path d="M9 2l-1 4"></path>
    <path d="M15 2l1 4"></path>
    <path d="M12 6v14"></path>
  </svg>
);
