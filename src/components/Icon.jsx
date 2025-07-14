// src/components/Icon.js
import React from 'react';

export const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d={path}></path>
  </svg>
);