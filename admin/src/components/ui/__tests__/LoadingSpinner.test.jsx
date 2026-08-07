import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders a spinner with default size (md)', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner.className).toContain('w-8');
    expect(spinner.className).toContain('h-8');
  });

  it('renders small spinner', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner.className).toContain('w-4');
    expect(spinner.className).toContain('h-4');
  });

  it('renders large spinner', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner.className).toContain('w-12');
    expect(spinner.className).toContain('h-12');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const wrapper = container.firstChild;
    expect(wrapper.className).toContain('custom-class');
  });

  it('renders in a flex centered container', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.firstChild;
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('items-center');
    expect(wrapper.className).toContain('justify-center');
  });

  it('has correct border colors', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner.className).toContain('border-luxury-gold');
    expect(spinner.className).toContain('border-t-transparent');
  });
});
