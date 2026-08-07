import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from '../ConfirmDialog';

function TestComponent({ onConfirm }) {
  const confirm = useConfirm();
  return (
    <button
      onClick={async () => {
        const result = await confirm('Are you sure?');
        onConfirm(result);
      }}
    >
      Show Confirm
    </button>
  );
}

describe('ConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides confirm function via context', () => {
    expect(useConfirm).toBeDefined();
  });

  it('opens the dialog when confirm is called', async () => {
    render(
      <ConfirmProvider>
        <TestComponent onConfirm={() => {}} />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('Show Confirm'));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('resolves true when Confirm is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmProvider>
        <TestComponent onConfirm={onConfirm} />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('Show Confirm'));
    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(true));
  });

  it('resolves false when Cancel is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmProvider>
        <TestComponent onConfirm={onConfirm} />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('Show Confirm'));
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(false));
  });

  it('resolves false when backdrop is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmProvider>
        <TestComponent onConfirm={onConfirm} />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('Show Confirm'));
    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(backdrop);
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(false));
  });

  it('resolves false when Escape is pressed', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmProvider>
        <TestComponent onConfirm={onConfirm} />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('Show Confirm'));
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(false));
  });

  it('closes the dialog after confirmation', async () => {
    render(
      <ConfirmProvider>
        <TestComponent onConfirm={() => {}} />
      </ConfirmProvider>,
    );
    fireEvent.click(screen.getByText('Show Confirm'));
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(() => {
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  it('renders children content', () => {
    render(
      <ConfirmProvider>
        <div>Child element</div>
      </ConfirmProvider>,
    );
    expect(screen.getByText('Child element')).toBeInTheDocument();
  });
});
