export const formatLocaleNumber = ({ value, radix }: { value: number | null | undefined; radix?: number }) => {
  if (value == null) return null;
  const newValue = radix != null ? Math.round(value * (10 * radix)) / (10 * radix) : value;
  return radix ? newValue.toFixed(radix) : newValue.toLocaleString();
};
