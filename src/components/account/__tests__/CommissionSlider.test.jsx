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

  // The displayed payout figure MUST equal the backend's `payoutFromItems`
  // (backend/lib/money.js): price - platformFee, with no GST deducted.
  it('renders correct earnings breakdown at 10%', () => {
    render(<CommissionSlider {...defaultProps} />);
    expect(screen.getByText('₹900')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();
  });

  it('renders correct earnings breakdown at 20%', () => {
    render(<CommissionSlider {...defaultProps} value={20} />);
    expect(screen.getByText('₹800')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
  });

  it('does not deduct a GST line the backend never charges', () => {
    render(<CommissionSlider {...defaultProps} value={25} />);
    expect(screen.queryByText(/GST/i)).not.toBeInTheDocument();
    expect(screen.getByText('₹750')).toBeInTheDocument();
  });

  it('labels the seller tile as the payout amount', () => {
    render(<CommissionSlider {...defaultProps} />);
    expect(screen.getByText(/You receive on payout/i)).toBeInTheDocument();
  });

  // Tier names appear in several places at once (the header readout, the tier
  // quick-pick buttons, the progress-bar end labels), so assert on the header
  // readout next to the percentage — that is the one showing the ACTIVE tier.
  it('shows Promoted badge at 20%', () => {
    render(<CommissionSlider {...defaultProps} value={20} />);
    expect(screen.getByText('20%').parentElement).toHaveTextContent('Promoted');
  });

  it('shows Premium badge at 25%', () => {
    render(<CommissionSlider {...defaultProps} value={25} />);
    expect(screen.getByText('25%').parentElement).toHaveTextContent('Premium');
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
