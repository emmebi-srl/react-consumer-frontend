export const getSuggestedSecondMaintenanceMonth = (preferredMonth1: number | undefined): number | undefined => {
  if (!preferredMonth1) {
    return undefined;
  }

  const suggestedMonth = preferredMonth1 + 6;

  if (suggestedMonth > 12) {
    return undefined;
  }

  return suggestedMonth;
};
