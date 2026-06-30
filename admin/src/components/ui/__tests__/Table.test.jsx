import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from '../Table';

describe('Table', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'status', label: 'Status', render: (val) => <span>{val === 'active' ? 'Active' : 'Inactive'}</span> },
  ];

  const data = [
    { name: 'Alice', age: 30, status: 'active' },
    { name: 'Bob', age: 25, status: 'inactive' },
  ];

  it('renders table headers', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders custom cell renderers', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    render(<Table columns={columns} data={[]} loading={true} />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty message when data is empty', () => {
    render(<Table columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows default empty message when no custom message provided', () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows empty message when data is null', () => {
    render(<Table columns={columns} data={null} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('does not add cursor-pointer class when onRowClick is not provided', () => {
    render(<Table columns={columns} data={data} />);
    const table = document.querySelector('table');
    expect(table.innerHTML).not.toContain('cursor-pointer');
  });
});
