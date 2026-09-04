import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from '../ConfirmDialog';

const TestConsumer = ({ options = 'Are you sure?', onResolve }) => {
  const confirm = useConfirm();
  return (
    <div>
      <button
        onClick={async () => {
          const result = await confirm(options);
          onResolve?.(result);
        }}
      >
        open confirm
      </button>
    </div>
  );
};

const openWith = (options, onResolve) => {
  render(
    <ConfirmProvider>
      <TestConsumer options={options} onResolve={onResolve} />
    </ConfirmProvider>,
  );
  fireEvent.click(screen.getByText('open confirm'));
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
    const backdrop = document.querySelector('[role="dialog"] > div');
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

// `confirm()` originally took only a string, so every dialog in the app got a
// generic "Confirm" verb and neutral styling. The object form widens that
// without breaking the string call sites in Account/Cart/ProductDetail.
describe('ConfirmDialog options API', () => {
  it('still resolves true/false for the plain string signature', async () => {
    const onResolve = vi.fn();
    openWith('Are you sure?', onResolve);
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
    // The string form keeps the generic labels and the neutral confirm button.
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm').className).not.toMatch(/bg-red-600/);

    await act(async () => {
      fireEvent.click(screen.getByText('Confirm'));
    });
    expect(onResolve).toHaveBeenCalledWith(true);
  });

  it('renders a title, a custom verb and destructive styling', async () => {
    openWith({
      title: 'Delete listing',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete listing',
      destructive: true,
    });

    expect(await screen.findByText('This cannot be undone.')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { name: 'Delete listing' });
    expect(heading).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', heading.id);

    const confirmBtn = screen.getByRole('button', { name: 'Delete listing' });
    expect(confirmBtn.className).toMatch(/bg-red-600/);
    // DESIGN.md §2.4 — pill buttons on a rounded-2xl panel.
    expect(confirmBtn.className).toMatch(/rounded-full/);
  });

  it('accepts a custom cancel label', async () => {
    openWith({ message: 'Discard draft?', cancelLabel: 'Keep editing' });
    expect(await screen.findByText('Discard draft?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeInTheDocument();
  });

  it('resolves false when cancelled', async () => {
    const onResolve = vi.fn();
    openWith({ message: 'Remove item?', confirmLabel: 'Remove' }, onResolve);
    expect(await screen.findByText('Remove item?')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });
    expect(onResolve).toHaveBeenCalledWith(false);
  });
});

describe('ConfirmDialog focus management', () => {
  it('moves focus into the dialog and traps Tab inside it', async () => {
    openWith('Are you sure?');
    const panel = screen.getByRole('dialog').querySelector('[tabindex="-1"]');
    const buttons = Array.from(panel.querySelectorAll('button'));
    expect(document.activeElement).toBe(buttons[0]);

    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(buttons[0]);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });

  it('restores focus to the trigger on close', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
      </ConfirmProvider>,
    );
    const trigger = screen.getByText('open confirm');
    trigger.focus();
    fireEvent.click(trigger);
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
    expect(document.activeElement).not.toBe(trigger);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });

  it('locks body scroll while open', async () => {
    expect(document.body.style.overflow).toBe('');
    openWith('Are you sure?');
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('');
  });
});
