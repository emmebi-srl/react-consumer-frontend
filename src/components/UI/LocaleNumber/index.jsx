import React from 'react'

export const LocaleNumber = ({ value, radix }) => {  
  if (value == null) return null;
  const newValue = radix != null ? Math.round(value * (10 * radix)) / (10 * radix) : value;
  return <span>{radix ? newValue.toFixed(radix) : newValue.toLocaleString()}</span>;
};
