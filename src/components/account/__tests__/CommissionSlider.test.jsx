import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommissionSlider from '../CommissionSlider';

describe('CommissionSlider', () => {
  const defaultProps = { value: 10, price: 1000, onChange: vi.fn(), disabled: false };

  it('renders with default value', () => {
    render(<CommissionSlider {...defaultProps} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Standard' })).toBeInTheDocument();
  });

  it('renders correct earnings breakdown at 10%', () => {
    render(<CommissionSlider {...defaultProps} />);
    expect(screen.getByText('₹882')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();
  });

  it('renders correct earnings breakdown at 20%', () => {
    render(<CommissionSlider {...defaultProps} value={20} />);
    expect(screen.getByText('₹764')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
  });

  it('shows GST amount at 10%', () => {
    render(<CommissionSlider {...defaultProps} />);
    expect(screen.getByText(/GST @ 18%/)).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });

  it('shows GST amount at 20%', () => {
    render(<CommissionSlider {...defaultProps} value={20} />);
    expect(screen.getByText(/GST @ 18%/)).toBeInTheDocument();
    expect(screen.getByText(/36/)).toBeInTheDocument();
  });

  it('shows GST amount at 25%', () => {
    render(<CommissionSlider {...defaultProps} value={25} />);
    expect(screen.getByText(/GST @ 18%/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it('shows Promoted badge at 20%', () => {
    render(<CommissionSlider {...defaultProps} value={20} />);
    expect(screen.getByText('Promoted')).toBeInTheDocument();
  });

  it('shows Premium badge at 25%', () => {
    render(<CommissionSlider {...defaultProps} value={25} />);
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('shows Maximum Boost at 25%', () => {
    render(<CommissionSlider {...defaultProps} value={25} />);
    expect(screen.getByText('Maximum Boost')).toBeInTheDocument();
  });

  it('shows next tier hint when not at max', () => {
    render(<CommissionSlider {...defaultProps} value={12} />);
    expect(screen.getByText(/Next tier at 15%/)).toBeInTheDocument();
  });

  it('calls onChange when slider is moved', () => {
    const onChange = vi.fn();
    render(<CommissionSlider {...defaultProps} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('disables slider when disabled prop is true', () => {
    render(<CommissionSlider {...defaultProps} disabled={true} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('does not render earnings breakdown when price is 0', () => {
    render(<CommissionSlider {...defaultProps} price={0} />);
    expect(screen.queryByText('₹')).not.toBeInTheDocument();
  });
});
