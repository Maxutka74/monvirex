export const formatNumber = (value: number | string): string => {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return "0";
  }

  if (num === 0) {
    return "0";
  }

  const abs = Math.abs(num);

  if (abs >= 1e12) {
    return `${parseFloat((num / 1e12).toFixed(2))}T`;
  }

  if (abs >= 1e9) {
    return `${parseFloat((num / 1e9).toFixed(2))}B`;
  }

  if (abs >= 1e6) {
    return `${parseFloat((num / 1e6).toFixed(2))}M`;
  }

  if (abs >= 1e3) {
    return num.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  }

  if (abs >= 1) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  if (abs >= 0.01) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  }

  if (abs >= 0.000001) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    });
  }

  return num.toExponential(2);
};
