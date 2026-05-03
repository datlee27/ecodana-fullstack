import type { ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

type ConfirmDialogTone = 'primary' | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  busy?: boolean;
  confirmDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Xac nhan',
  cancelLabel = 'Huy',
  tone = 'primary',
  busy = false,
  confirmDisabled = false,
  size = 'md',
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      size={size}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={busy} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
};
