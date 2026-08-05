import React from 'react';

export interface ModalContextValue {
  dismiss: () => void;
  titleId: string;
}

export const ModalContext = React.createContext<ModalContextValue>({
  dismiss: () => {},
  titleId: '',
});
