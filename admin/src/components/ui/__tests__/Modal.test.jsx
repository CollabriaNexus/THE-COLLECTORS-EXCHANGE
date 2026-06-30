import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test">
        <div>Content</div>
      </Modal>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Modal>
    );
    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close when content area is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Modal Content</div>
      </Modal>
    );
    fireEvent.click(screen.getByText('Modal Content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('sets correct size class for sm', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test" size="sm">
        <div>Content</div>
      </Modal>
    );
    const modalContainer = screen.getByLabelText('Test');
    expect(modalContainer.innerHTML).toContain('max-w-md');
  });

  it('sets correct size class for lg', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test" size="lg">
        <div>Content</div>
      </Modal>
    );
    const modalContainer = screen.getByLabelText('Test');
    expect(modalContainer.innerHTML).toContain('max-w-4xl');
  });

  it('sets correct size class for xl', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test" size="xl">
        <div>Content</div>
      </Modal>
    );
    const modalContainer = screen.getByLabelText('Test');
    expect(modalContainer.innerHTML).toContain('max-w-6xl');
  });

  it('defaults to md size', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        <div>Content</div>
      </Modal>
    );
    const modalContainer = screen.getByLabelText('Test');
    expect(modalContainer.innerHTML).toContain('max-w-2xl');
  });

  it('has proper aria attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="My Dialog">
        <div>Content</div>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'My Dialog');
  });
});
