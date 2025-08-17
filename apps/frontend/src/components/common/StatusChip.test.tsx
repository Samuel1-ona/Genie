import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusChip, getStatusVariant } from './StatusChip';

describe('StatusChip', () => {
  describe('getStatusVariant', () => {
    it('should return correct variant for active status', () => {
      expect(getStatusVariant('active')).toBe('active');
    });

    it('should return correct variant for pending status', () => {
      expect(getStatusVariant('pending')).toBe('pending');
    });

    it('should return correct variant for passed status', () => {
      expect(getStatusVariant('passed')).toBe('passed');
    });

    it('should return correct variant for failed status', () => {
      expect(getStatusVariant('failed')).toBe('failed');
    });

    it('should return correct variant for executed status', () => {
      expect(getStatusVariant('executed')).toBe('executed');
    });

    it('should return correct variant for canceled status', () => {
      expect(getStatusVariant('canceled')).toBe('canceled');
    });

    it('should return correct variant for expired status', () => {
      expect(getStatusVariant('expired')).toBe('expired');
    });

    it('should return default for unknown status', () => {
      expect(getStatusVariant('unknown')).toBe('default');
    });

    it('should handle case insensitive status', () => {
      expect(getStatusVariant('ACTIVE')).toBe('active');
      expect(getStatusVariant('Pending')).toBe('pending');
    });

    it('should return default for empty status', () => {
      expect(getStatusVariant('')).toBe('default');
      expect(getStatusVariant(undefined)).toBe('default');
    });
  });

  describe('StatusChip rendering', () => {
    it('should render with correct status and text', () => {
      render(<StatusChip status="active">Active</StatusChip>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should have correct ARIA attributes', () => {
      render(<StatusChip status="passed">Passed</StatusChip>);
      const chip = screen.getByText('Passed');
      expect(chip).toHaveAttribute('role', 'status');
      expect(chip).toHaveAttribute('aria-label', 'Status: Passed');
    });

    it('should apply correct CSS classes for active status', () => {
      render(<StatusChip status="active">Active</StatusChip>);
      const chip = screen.getByText('Active');
      expect(chip).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should apply correct CSS classes for pending status', () => {
      render(<StatusChip status="pending">Pending</StatusChip>);
      const chip = screen.getByText('Pending');
      expect(chip).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should apply correct CSS classes for passed status', () => {
      render(<StatusChip status="passed">Passed</StatusChip>);
      const chip = screen.getByText('Passed');
      expect(chip).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply correct CSS classes for failed status', () => {
      render(<StatusChip status="failed">Failed</StatusChip>);
      const chip = screen.getByText('Failed');
      expect(chip).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should apply correct CSS classes for executed status', () => {
      render(<StatusChip status="executed">Executed</StatusChip>);
      const chip = screen.getByText('Executed');
      expect(chip).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('should apply correct CSS classes for canceled status', () => {
      render(<StatusChip status="canceled">Canceled</StatusChip>);
      const chip = screen.getByText('Canceled');
      expect(chip).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should apply correct CSS classes for expired status', () => {
      render(<StatusChip status="expired">Expired</StatusChip>);
      const chip = screen.getByText('Expired');
      expect(chip).toHaveClass('bg-slate-100', 'text-slate-800');
    });

    it('should use manual variant when provided', () => {
      render(<StatusChip variant="success">Success</StatusChip>);
      const chip = screen.getByText('Success');
      expect(chip).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should prioritize manual variant over status prop', () => {
      render(
        <StatusChip status="failed" variant="success">
          Success
        </StatusChip>
      );
      const chip = screen.getByText('Success');
      expect(chip).toHaveClass('bg-green-100', 'text-green-800');
      expect(chip).not.toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should handle custom className', () => {
      render(
        <StatusChip status="active" className="custom-class">
          Active
        </StatusChip>
      );
      const chip = screen.getByText('Active');
      expect(chip).toHaveClass('custom-class');
    });

    it('should spread additional props', () => {
      render(
        <StatusChip status="active" data-testid="status-chip">
          Active
        </StatusChip>
      );
      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });
  });
});
