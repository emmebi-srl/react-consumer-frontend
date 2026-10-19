import ConfirmationModal from '~/components/Modals/ConfirmationModal';
import { useModal } from '~/modals/Modal';
import { findProductsByExactCode } from '~/proxies/aries-proxy/products';

interface CodesToCheck {
  barcode?: string;
  supplierProductCode?: string;
}

// Like the Delphi client (TFProductChecker): a barcode / supplier code already used by another product
// is allowed, but only after an explicit confirmation. Resolves to false when the user cancels.
const useConfirmDuplicateCodes = () => {
  const modal = useModal();

  return async (codes: CodesToCheck, currentProductCode?: string) => {
    const checks = [
      { label: 'Barcode', filter: { barcode: codes.barcode?.trim() } },
      { label: 'Codice fornitore', filter: { supplierProductCode: codes.supplierProductCode?.trim() } },
    ].filter((check) => !!(check.filter.barcode ?? check.filter.supplierProductCode));

    for (const check of checks) {
      const duplicates = (await findProductsByExactCode(check.filter)).filter(
        (other) => other.productCode !== currentProductCode,
      );
      if (duplicates.length === 0) continue;

      const result = await modal.showModal({
        component: ConfirmationModal,
        props: {
          title: `${check.label} già utilizzato`,
          text: `${check.label} già presente su: ${duplicates.map((other) => other.productCode).join(', ')}. Salvare comunque?`,
          alertSeverity: 'warning',
        },
      });
      if (result.action !== 'YES') return false;
    }
    return true;
  };
};

export default useConfirmDuplicateCodes;
