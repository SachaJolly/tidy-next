'use client';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import { ModalContent, ModalFooter } from '@/components/Modal/Modal';

type ListLimitReachedProps = {
  title: string;
  description: string;
  onClose: () => void;
  className?: string;
};

/**
 * Blocking state shown instead of the creation form when an unconfirmed account has hit its
 * list cap. Purely presentational: the decision is made by the caller, and enforced again
 * server-side by the Rails List model — this is only the explanation.
 */
export default function ListLimitReached({
  title,
  description,
  onClose,
  className,
}: ListLimitReachedProps) {
  return (
    <>
      <ModalContent className={className}>
        <Icon name="warning" size={24} style={{ color: 'var(--border-error)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          <h3>{title}</h3>
          <p className="font-medium">{description}</p>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button type="button" variant="default" label="Understood" onClick={onClose} />
      </ModalFooter>
    </>
  );
}
