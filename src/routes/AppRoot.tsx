import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import React, { ErrorInfo, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';
import LoadingScreen from '~/components/Loading/LoadingScreen';
import { ModalProvider } from '~/modals/Modal';
import { Slide, ToastContainer } from 'react-toastify';
import { ErrorBoundaryFallback } from '~/components/Errors/ErrorBoundaryFallback';
import queryClient from '~/clients/query-client';
import ThemeConfig from '~/styles/theme';

const logErrorHandler = (error: Error, info: ErrorInfo) => {
  console.error(error);
  // eslint-disable-next-line no-console
  console.log(info.componentStack);
};

const AppRoot: React.FunctionComponent = () => {
  return (
    <NuqsAdapter>
      <ThemeConfig>
        <ModalProvider>
          <Suspense fallback={<LoadingScreen />}>
            <ErrorBoundary
              onError={logErrorHandler}
              onReset={() => queryClient.invalidateQueries()}
              FallbackComponent={ErrorBoundaryFallback}
            >
              <Outlet />
              <ToastContainer position="bottom-center" autoClose={3000} closeOnClick transition={Slide} limit={3} />
            </ErrorBoundary>
          </Suspense>
        </ModalProvider>
      </ThemeConfig>
    </NuqsAdapter>
  );
};

export default AppRoot;
