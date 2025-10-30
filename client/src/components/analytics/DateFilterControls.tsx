import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Calendar, RefreshCw, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateFilterControlsProps {
  onFiltersChange: (filters: {from?: string, to?: string, agentName?: string} | null) => void;
  isLoading?: boolean;
  filterError?: string | null;
  className?: string;
}

const DateFilterControls: React.FC<DateFilterControlsProps> = ({
  onFiltersChange,
  isLoading = false,
  filterError = null,
  className
}) => {
  // Memoized default dates calculation
  const defaultDates = useMemo(() => {
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    return {
      from: ninetyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD format
      to: today.toISOString().split('T')[0]
    };
  }, []); // Empty dependency array since this should only calculate once

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [agentName, setAgentName] = useState<string>('');
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Initialize URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const toParam = urlParams.get('to');
    const agentNameParam = urlParams.get('agent_name');

    // Set values from URL
    if (fromParam) setFromDate(fromParam);
    if (toParam) setToDate(toParam);
    if (agentNameParam) setAgentName(agentNameParam);

    // If any filters are present, mark as applied and trigger change
    if (fromParam || toParam || agentNameParam) {
      setHasAppliedFilters(true);
      onFiltersChange({
        from: fromParam || undefined,
        to: toParam || undefined,
        agentName: agentNameParam || undefined
      });
    }
  }, [onFiltersChange]);

  // Update URL when filters are applied
  const updateURL = (from?: string, to?: string, agentName?: string) => {
    const url = new URL(window.location.href);

    if (from) {
      url.searchParams.set('from', from);
    } else {
      url.searchParams.delete('from');
    }

    if (to) {
      url.searchParams.set('to', to);
    } else {
      url.searchParams.delete('to');
    }

    if (agentName && agentName.trim()) {
      url.searchParams.set('agent_name', agentName.trim());
    } else {
      url.searchParams.delete('agent_name');
    }

    window.history.replaceState({}, '', url.toString());
  };

  // Memoized validation function
  const validateDates = useCallback((from: string, to: string): string => {
    const fromDateObj = new Date(from);
    const toDateObj = new Date(to);
    const today = new Date();

    if (fromDateObj > toDateObj) {
      return 'From date cannot be after to date';
    }

    if (toDateObj > today) {
      return 'To date cannot be in the future';
    }

    if (fromDateObj > today) {
      return 'From date cannot be in the future';
    }


    return '';
  }, []);

  const handleApplyFilters = () => {
    const error = validateDates(fromDate, toDate);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setHasAppliedFilters(true);
    updateURL(fromDate, toDate, agentName);
    onFiltersChange({
      from: fromDate || undefined,
      to: toDate || undefined,
      agentName: agentName.trim() || undefined
    });
  };

  const handleResetFilters = useCallback(() => {
    setFromDate(defaultDates.from);
    setToDate(defaultDates.to);
    setAgentName('');
    setHasAppliedFilters(true);
    setValidationError('');
    updateURL(defaultDates.from, defaultDates.to, '');
    onFiltersChange({
      from: defaultDates.from,
      to: defaultDates.to,
      agentName: undefined
    });
  }, [defaultDates, onFiltersChange]);

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setAgentName('');
    setHasAppliedFilters(false);
    setValidationError('');
    updateURL();
    onFiltersChange(null);
  };

  return (
    <Card className={cn("p-4 bg-white border-gray-200", className)}>
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" aria-hidden="true" />
          <h3 id="date-range-group" className="text-sm font-semibold text-gray-700">
            Date Range Filter
          </h3>
          {hasAppliedFilters && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full" aria-live="polite">
              Active
            </span>
          )}
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-labelledby="date-range-group">
          <div className="space-y-2">
            <Label
              htmlFor="from-date"
              className="text-sm text-gray-600 font-medium"
            >
              From Date
            </Label>
            <div className="relative">
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="YYYY-MM-DD"
                aria-describedby={validationError ? "date-validation-error" : undefined}
                aria-invalid={!!validationError}
                min="2020-01-01"
                max={new Date().toISOString().split('T')[0]}
              />
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="to-date"
              className="text-sm text-gray-600 font-medium"
            >
              To Date
            </Label>
            <div className="relative">
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="YYYY-MM-DD"
                aria-describedby={validationError ? "date-validation-error" : undefined}
                aria-invalid={!!validationError}
                min="2020-01-01"
                max={new Date().toISOString().split('T')[0]}
              />
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Agent Name Input */}
        <div className="space-y-2">
          <Label htmlFor="agent-name" className="text-sm text-gray-600 font-medium">
            Agent Name
          </Label>
          <Input
            id="agent-name"
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Type agent name..."
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-describedby={validationError ? "date-validation-error" : undefined}
          />
        </div>

        {/* Validation Error */}
        {validationError && (
          <div
            id="date-validation-error"
            className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200"
            role="alert"
            aria-live="assertive"
          >
            <strong className="sr-only">Validation Error:</strong>
            {validationError}
          </div>
        )}

        {/* Filter Error */}
        {filterError && (
          <div
            className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200"
            role="alert"
            aria-live="assertive"
          >
            <strong>Filter Error:</strong> {filterError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2" role="group" aria-label="Filter actions">
          <Button
            onClick={handleApplyFilters}
            disabled={!fromDate || !toDate || isLoading}
            className="flex-1 sm:flex-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-describedby={validationError ? "date-validation-error" : undefined}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Applying...
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                Apply Filters
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={isLoading}
            className="flex-1 sm:flex-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Reset filters to last 90 days"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
             Last 90 Days
          </Button>

          <Button
            variant="ghost"
            onClick={handleClearFilters}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Clear all applied filters"
          >
            Clear All
          </Button>
        </div>

        {/* Helper Text */}
        <div className="text-xs text-gray-500">
          {!hasAppliedFilters ? (
            "Apply filters to view data for a specific date range and/or agent. Leave empty for all available data."
          ) : (
            `Showing data${fromDate && toDate ? ` from ${fromDate} to ${toDate}` : ''}${agentName ? ` for agent: ${agentName}` : ''}`
          )}
        </div>
      </div>
    </Card>
  );
};

export default DateFilterControls;
