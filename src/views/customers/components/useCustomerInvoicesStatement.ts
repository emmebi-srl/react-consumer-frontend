import { useState } from 'react';
import EmailComposeModal from '~/components/Modals/EmailComposeModal';
import PdfPreviewModal from '~/components/Modals/PdfPreviewModal';
import useSnackbar from '~/hooks/useSnackbar';
import { useModal } from '~/modals/Modal';
import { getCustomerById, getCustomerInvoicesStatementPdf } from '~/proxies/aries-proxy/api/customers';
import { useModulePermission } from '~/proxies/aries-proxy/users';
import { CustomerContact } from '~/types/aries-proxy/customers';
import { EmailDocumentType } from '~/types/aries-proxy/emails';
import { AriesModule } from '~/types/aries-proxy/users';
import { getApiErrorMessage } from '~/utils/api-error-utils';

// Same subject and text as the Delphi statement email (fpromemoria_mail).
const SUBJECT = 'ESTRATTO CONTO ELETTRONICO';
const BODY = 'Gentile cliente,\n\nIn allegato il vostro estratto conto in versione elettronica.';

const splitEmails = (value?: string | null) =>
  (value ?? '')
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);

/**
 * Recipients like the monthly "Estratto conto cliente" campaign: the billing contact(s). Without one, the main
 * contact is proposed (the user can still change it) and `isFallback` lets the caller say so.
 */
export const getStatementRecipients = (contacts: CustomerContact[]) => {
  const billing = [...new Set(contacts.filter((contact) => contact.isBilling).flatMap((c) => splitEmails(c.email)))];
  if (billing.length) return { to: billing.join('; '), isFallback: false };
  const main = contacts.find((contact) => contact.isMain || contact.contactId === 1);
  return { to: splitEmails(main?.email).join('; '), isFallback: true };
};

const getFileName = () => {
  const today = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `Estratto conto ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}.pdf`;
};

/**
 * "Vedi estratto conto": PDF preview whose "Invia via email" button opens the email with the PDF attached.
 * The email carries the `cliente_estratto_conto` document, so the server records the send like Delphi does
 * (installment communications and follow-up event).
 */
const useCustomerInvoicesStatement = (customerId: number, companyName: string) => {
  const modal = useModal();
  const snackbar = useSnackbar();
  const { permission: emailPermission } = useModulePermission(AriesModule.Emails);
  const [busy, setBusy] = useState(false);
  const canSend = !!emailPermission?.canInsert;

  const loadPdf = async () =>
    new Blob([(await getCustomerInvoicesStatementPdf(customerId)).data], { type: 'application/pdf' });

  const openEmail = async (pdf: Blob) => {
    let recipients = { to: '', isFallback: true };
    try {
      const customer = (await getCustomerById(customerId, { includes: 'contacts' })).data.customers.at(0);
      recipients = getStatementRecipients(customer?.contacts ?? []);
    } catch {
      // The address is only a suggestion: the email can still be written.
    }
    if (recipients.isFallback) {
      snackbar.warning(
        'Il cliente non ha un contatto di fatturazione: è proposto il contatto principale. ' +
          "Segna il contatto di fatturazione per l'invio mensile automatico.",
      );
    }
    modal.showModal({
      component: EmailComposeModal,
      props: {
        initialTo: recipients.to,
        initialSubject: SUBJECT,
        initialBody: BODY,
        initialFiles: [new File([pdf], getFileName(), { type: 'application/pdf' })],
        document: { type: EmailDocumentType.CustomerInvoicesStatement, id: String(customerId) },
      },
    });
  };

  const run = async (action: (pdf: Blob) => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    let pdf: Blob;
    try {
      pdf = await loadPdf();
    } catch (error) {
      snackbar.error(getApiErrorMessage(error, "Non è stato possibile creare l'estratto conto."));
      return;
    } finally {
      setBusy(false);
    }
    await action(pdf);
  };

  const preview = () =>
    run(async (pdf) => {
      const result = await modal.showModal({
        component: PdfPreviewModal,
        props: { pdf, title: `Estratto conto - ${companyName}`, sendLabel: canSend ? 'Invia via email' : undefined },
      });
      if (result.action === 'SEND') await openEmail(pdf);
    });

  return { busy, preview };
};

export default useCustomerInvoicesStatement;
