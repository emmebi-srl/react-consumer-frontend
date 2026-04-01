import React from 'react';
import { useLocation } from 'react-router-dom';
import LandingOutcomePage from '~/components/Landing/LandingOutcomePage';
import { CompanyInfo } from '~/types/aries-proxy/landing';

interface LandingOutcomeState {
  companyInfo?: CompanyInfo | null;
}

const LandingDoneSubscriptionActivatedView: React.FC = () => {
  const location = useLocation();
  const state = location.state as LandingOutcomeState | null;
  const companyName = state?.companyInfo?.businessName;

  return (
    <LandingOutcomePage
      alertText="Richiesta di attivazione inviata correttamente"
      companyInfo={state?.companyInfo}
      messages={[
        companyName
          ? `L'attivazione dell'abbonamento dovra essere convalidata da ${companyName}. A breve sarai contattato.`
          : "L'attivazione dell'abbonamento dovra essere convalidata dal nostro team. A breve sarai contattato.",
      ]}
      severity="success"
      title="Grazie!"
    />
  );
};

export default LandingDoneSubscriptionActivatedView;
