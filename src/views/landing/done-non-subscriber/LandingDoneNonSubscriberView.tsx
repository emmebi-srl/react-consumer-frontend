import React from 'react';
import { useLocation } from 'react-router-dom';
import LandingOutcomePage from '~/components/Landing/LandingOutcomePage';
import { CompanyInfo } from '~/types/aries-proxy/landing';

interface LandingOutcomeState {
  companyInfo?: CompanyInfo | null;
}

const LandingDoneNonSubscriberView: React.FC = () => {
  const location = useLocation();
  const state = location.state as LandingOutcomeState | null;

  return (
    <LandingOutcomePage
      alertText='Scelta "Non abbonato" registrata'
      companyInfo={state?.companyInfo}
      messages={[
        'La tua anagrafica verra aggiornata come scelto "NON ABBONATO".',
        'Restiamo comunque a disposizione per qualsiasi ripensamento o necessita futura.',
      ]}
      severity="warning"
      title="Grazie comunque"
    />
  );
};

export default LandingDoneNonSubscriberView;
