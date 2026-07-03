import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from '../ConfirmDialog';

const TestConsumer = () => {
  const confirm = useConfirm();
  return (
    <div>
      <button
        onClick={async () => {
          await confirm('Are you sure?');
        }}
      >
        open confirm
      </button>
    </div>
  );
};

describe('ConfirmDialog', () => {
  it('renders children', () => {
    render(
      <ConfirmProvider>
        <div>child</div>
      </ConfirmProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('opens confirm dialog', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('open confirm'));
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
  });

  it('closes dialog on Confirm button click', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('open confirm'));
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Confirm'));
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('closes dialog on Cancel button click', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('open confirm'));
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('closes dialog on backdrop click', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('open confirm'));
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(backdrop);
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('closes dialog on Escape key', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('open confirm'));
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });
});
