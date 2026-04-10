import React from 'react';
import { useLocation } from 'react-router-dom';
import LandingOutcomePage from '~/components/Landing/LandingOutcomePage';
import { CompanyInfo } from '~/types/aries-proxy/landing';

interface LandingOutcomeState {
  companyInfo?: CompanyInfo | null;
}

const LandingDoneFreeCheckupView: React.FC = () => {
  const location = useLocation();
  const state = location.state as LandingOutcomeState | null;

  return (
    <LandingOutcomePage
      alertText="Richiesta di sopralluogo inviata"
      companyInfo={state?.companyInfo}
      messages={[
        'La tua richiesta di sopralluogo gratuito è stata registrata correttamente.',
        'A breve sarai contattato per concordare i dettagli del sopralluogo.',
      ]}
      severity="info"
      title="Grazie!"
    />
  );
};

export default LandingDoneFreeCheckupView;
