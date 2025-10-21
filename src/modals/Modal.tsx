import { createContext, memo, useCallback, useContext, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ModalErrorBoundaryFallback } from '~/components/Errors/ErrorBoundaryFallback';
import _noop from 'lodash/noop';

export interface ModalProps {
  closeModal: (param?: PromiseResolvePayload<'CLOSE'>) => void;
}

interface PromiseResolvePayload<A extends string = string> {
  action: A;
  [key: string]: unknown;
}

interface ShowModalArgs<P extends ModalProps> {
  component: (props: P) => React.ReactElement;
  props: Omit<P, 'closeModal'>;
}

interface ModalContextType {
  showModal<P extends ModalProps>(
    options: ShowModalArgs<P>,
  ): Promise<NonNullable<Parameters<P['closeModal']>[0]> | PromiseResolvePayload<'CLOSE'>>;
  closeModal(data?: PromiseResolvePayload): void;
}

let modalId = 1;

const ModalContext = createContext<ModalContextType>({
  showModal: () => Promise.resolve({ action: 'CLOSE' }),
  closeModal: _noop,
});

export const useModal = () => {
  const { showModal, closeModal } = useContext(ModalContext);

  return {
    closeModal,
    showModal,
  };
};

interface ModalProviderProps {
  children: React.ReactNode;
}

const Modal = ({ modal, closeModal }: { modal: ModalData; closeModal(data?: PromiseResolvePayload): void }) => {
  const ModalComponent = modal.component;

  return (
    <ErrorBoundary FallbackComponent={(props) => <ModalErrorBoundaryFallback {...props} onClose={closeModal} />}>
      <ModalComponent {...modal.props} closeModal={closeModal} />
    </ErrorBoundary>
  );
};

const MemoModal = memo(Modal, ({ modal: m1 }, { modal: m2 }) => m1.id === m2.id);

interface ModalData {
  id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: (props: any) => React.ReactElement;
  props: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: PromiseResolvePayload<any>) => void;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modals, setModals] = useState<ModalData[]>([]);

  const closeModal = useCallback<ModalContextType['closeModal']>((data = { action: 'CLOSE' }) => {
    setModals((prevState) => {
      prevState[prevState.length - 1]?.resolve(data);
      return prevState.slice(0, -1);
    });
  }, []);

  const showModal = useCallback<ModalContextType['showModal']>(({ component, props }) => {
    return new Promise((resolve) => {
      setModals((prevState) => [...prevState, { component, props, resolve, id: modalId++ }]);
    });
  }, []);

  const value = useMemo(() => {
    return { showModal, closeModal };
  }, [showModal, closeModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.map((modal) => (
        <MemoModal modal={modal} closeModal={closeModal} key={modal.id} />
      ))}
    </ModalContext.Provider>
  );
};
