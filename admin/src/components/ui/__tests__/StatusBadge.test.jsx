import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="Verified" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders Unknown when status is not provided', () => {
    render(<StatusBadge />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders null status as Unknown', () => {
    render(<StatusBadge status={null} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('applies green styles for verified status', () => {
    render(<StatusBadge status="Verified" />);
    const badge = screen.getByText('Verified');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('applies green styles for approved status', () => {
    render(<StatusBadge status="Approved" />);
    expect(screen.getByText('Approved').className).toContain('bg-green-100');
  });

  it('applies green styles for active status', () => {
    render(<StatusBadge status="Active" />);
    expect(screen.getByText('Active').className).toContain('bg-green-100');
  });

  it('applies green styles for delivered status', () => {
    render(<StatusBadge status="Delivered" />);
    expect(screen.getByText('Delivered').className).toContain('bg-green-100');
  });

  it('applies yellow styles for pending status', () => {
    render(<StatusBadge status="Pending" />);
    expect(screen.getByText('Pending').className).toContain('bg-yellow-100');
  });

  it('applies yellow styles for processing status', () => {
    render(<StatusBadge status="Processing" />);
    expect(screen.getByText('Processing').className).toContain('bg-yellow-100');
  });

  it('applies blue styles for shipped status', () => {
    render(<StatusBadge status="Shipped" />);
    expect(screen.getByText('Shipped').className).toContain('bg-blue-100');
  });

  it('applies blue styles for in review status', () => {
    render(<StatusBadge status="In Review" />);
    expect(screen.getByText('In Review').className).toContain('bg-blue-100');
  });

  it('applies red styles for rejected status', () => {
    render(<StatusBadge status="Rejected" />);
    expect(screen.getByText('Rejected').className).toContain('bg-red-100');
  });

  it('applies red styles for blocked status', () => {
    render(<StatusBadge status="Blocked" />);
    expect(screen.getByText('Blocked').className).toContain('bg-red-100');
  });

  it('applies red styles for cancelled status', () => {
    render(<StatusBadge status="Cancelled" />);
    expect(screen.getByText('Cancelled').className).toContain('bg-red-100');
  });

  it('applies gray styles for none status', () => {
    render(<StatusBadge status="none" />);
    expect(screen.getByText('none').className).toContain('bg-gray-100');
  });

  it('applies blue styles for unknown statuses (default)', () => {
    render(<StatusBadge status="Custom" />);
    expect(screen.getByText('Custom').className).toContain('bg-blue-100');
  });

  it('applies case-insensitive matching', () => {
    render(<StatusBadge status="VERIFIED" />);
    expect(screen.getByText('VERIFIED').className).toContain('bg-green-100');
  });

  it('includes custom className', () => {
    render(<StatusBadge status="Verified" className="extra-class" />);
    expect(screen.getByText('Verified').className).toContain('extra-class');
  });
});
