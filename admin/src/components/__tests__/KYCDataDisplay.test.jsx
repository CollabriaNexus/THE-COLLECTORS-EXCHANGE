import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KYCDataDisplay from '../KYCDataDisplay';

describe('KYCDataDisplay', () => {
  it('renders no data message when kycData is null', () => {
    render(<KYCDataDisplay kycData={null} />);
    expect(screen.getByText('No KYC data available')).toBeInTheDocument();
  });

  it('renders no data message when kycData is undefined', () => {
    render(<KYCDataDisplay kycData={undefined} />);
    expect(screen.getByText('No KYC data available')).toBeInTheDocument();
  });

  it('renders not submitted message when kycData is empty object', () => {
    render(<KYCDataDisplay kycData={{}} />);
    expect(screen.getByText('No KYC data submitted')).toBeInTheDocument();
  });

  it('renders document URLs as image links', () => {
    const kycData = {
      aadhaarDoc: 'https://example.com/aadhaar.jpg',
      panDoc: 'https://example.com/pan.pdf',
    };
    render(<KYCDataDisplay kycData={kycData} />);
    expect(screen.getByText('Uploaded Documents')).toBeInTheDocument();
    expect(screen.getByText('aadhaar')).toBeInTheDocument();
    expect(screen.getByText('pan')).toBeInTheDocument();
    expect(screen.getByText('View PDF Document')).toBeInTheDocument();
  });

  it('renders agreement section when accepted', () => {
    const kycData = {
      agreementAccepted: true,
      agreementSignedByName: 'John Doe',
      agreementSignedAt: '2024-01-15T00:00:00Z',
    };
    render(<KYCDataDisplay kycData={kycData} />);
    expect(screen.getByText('Seller Agreement')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('does not render agreement section when not accepted', () => {
    render(<KYCDataDisplay kycData={{ someField: 'value' }} />);
    expect(screen.queryByText('Seller Agreement')).not.toBeInTheDocument();
  });

  it('renders other KYC fields', () => {
    const kycData = {
      businessName: 'My Store',
      businessAddress: '123 Main St',
    };
    render(<KYCDataDisplay kycData={kycData} />);
    expect(screen.getByText('business Name')).toBeInTheDocument();
    expect(screen.getByText('My Store')).toBeInTheDocument();
    expect(screen.getByText('business Address')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  it('renders URL values as clickable links in other fields', () => {
    const kycData = {
      website: 'https://example.com',
    };
    render(<KYCDataDisplay kycData={kycData} />);
    const link = screen.getByText('View Document');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com');
  });

  it('renders object values as JSON', () => {
    const kycData = {
      metadata: { key: 'value' },
    };
    render(<KYCDataDisplay kycData={kycData} />);
    expect(screen.getByText(/"key"/)).toBeInTheDocument();
  });

  it('renders admin notes section', () => {
    const kycData = { adminNotes: 'All documents verified' };
    render(<KYCDataDisplay kycData={kycData} />);
    expect(screen.getByText('Admin Notes')).toBeInTheDocument();
    expect(screen.getByText('All documents verified')).toBeInTheDocument();
  });

  it('renders rejection reason section', () => {
    const kycData = { rejectionReason: 'Document unclear' };
    render(<KYCDataDisplay kycData={kycData} />);
    expect(screen.getByText('Rejection Reason')).toBeInTheDocument();
    expect(screen.getByText('Document unclear')).toBeInTheDocument();
  });

  it('skips fields starting with underscore', () => {
    const kycData = { _id: 'hidden' };
    render(<KYCDataDisplay kycData={kycData} />);
    expect(screen.queryByText('Id')).not.toBeInTheDocument();
  });
});
