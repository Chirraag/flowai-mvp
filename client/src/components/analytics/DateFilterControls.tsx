import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Datepicker } from 'flowbite-react';
import { RefreshCw, Filter, ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyticsApi } from '@/api/analytics';

interface DateFilterControlsProps {
  onFiltersChange: (filters: {from?: string, to?: string, agentName?: string} | null) => void;
  isLoading?: boolean;
  filterError?: string | null;
  className?: string;
  orgId?: number;
}

const DateFilterControls: React.FC<DateFilterControlsProps> = ({
  onFiltersChange,
  isLoading = false,
  filterError = null,
  className,
  orgId
}) => {
  // Memoized default dates calculation
  const defaultDates = useMemo(() => {
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    return {
      from: ninetyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD for internal use
      to: today.toISOString().split('T')[0],
      fromDate: ninetyDaysAgo,
      toDate: today
    };
  }, []);

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [agentName, setAgentName] = useState<string>('');
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Agent dropdown state
  const [agents, setAgents] = useState<string[]>([]);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [agentsLoaded, setAgentsLoaded] = useState(false);

  // Helper function to convert Date to YYYY-MM-DD string
  const dateToString = (date: Date | null | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse YYYY-MM-DD string to Date
  const stringToDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    return new Date(dateStr + 'T00:00:00');
  };

  // Helper function to format Date to MM-DD-YYYY for display
  const formatDateForDisplay = (date: Date | undefined): string => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Initialize URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const toParam = urlParams.get('to');
    const agentNameParam = urlParams.get('agent_name');

    // Set values from URL
    if (fromParam) {
      const parsedFromDate = stringToDate(fromParam);
      setFromDate(parsedFromDate || null);
    } else {
      setFromDate(null);
    }
    if (toParam) {
      const parsedToDate = stringToDate(toParam);
      setToDate(parsedToDate || null);
    } else {
      setToDate(null);
    }
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
  }, []); // Only run once on mount

  // Fetch agents list
  const fetchAgents = useCallback(async () => {
    if (!orgId || agentsLoaded) return;

    setIsLoadingAgents(true);
    try {
      const agentList = await analyticsApi.listAgents(orgId);
      setAgents(agentList);
      setAgentsLoaded(true);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      // Keep empty array on error
      setAgents([]);
      setAgentsLoaded(true);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [orgId, agentsLoaded]);

  // Filtered agents based on search term
  const filteredAgents = useMemo(() => {
    if (!agentSearchTerm.trim()) return agents;
    return agents.filter(agent =>
      agent.toLowerCase().includes(agentSearchTerm.toLowerCase())
    );
  }, [agents, agentSearchTerm]);

  // Handle agent selection
  const handleAgentSelect = useCallback((selectedAgent: string) => {
    setAgentName(selectedAgent);
    setIsAgentDropdownOpen(false);
    setAgentSearchTerm('');
  }, []);

  // Handle agent dropdown toggle
  const handleAgentDropdownToggle = useCallback(() => {
    setIsAgentDropdownOpen(prev => !prev);
    // Lazy load agents when dropdown opens
    if (!isAgentDropdownOpen && !agentsLoaded && orgId) {
      fetchAgents();
    }
  }, [isAgentDropdownOpen, agentsLoaded, orgId, fetchAgents]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-agent-dropdown]')) {
        setIsAgentDropdownOpen(false);
        setAgentSearchTerm('');
      }
    };

    if (isAgentDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAgentDropdownOpen]);

  // Update URL when filters are applied
  const updateURL = (from?: string, to?: string, agentName?: string) => {
    const url = new URL(window.location.origin + window.location.pathname);

    if (from) {
      url.searchParams.set('from', from);
    }

    if (to) {
      url.searchParams.set('to', to);
    }

    if (agentName && agentName.trim()) {
      url.searchParams.set('agent_name', agentName.trim());
    }

    window.history.replaceState({}, '', url.toString());
  };

  // Memoized validation function
  const validateDates = useCallback((fromDateObj: Date | null | undefined, toDateObj: Date | null | undefined): string => {
    // If both dates are provided, validate them
    if (fromDateObj && toDateObj) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fromDateObj > toDateObj) {
        return 'From date cannot be after to date';
      }

      if (toDateObj > today) {
        return 'To date cannot be in the future';
      }

      if (fromDateObj > today) {
        return 'From date cannot be in the future';
      }
    }

    return '';
  }, []);

  const handleApplyFilters = () => {
    const error = validateDates(fromDate, toDate);
    if (error) {
      setValidationError(error);
      return;
    }

    // Check if at least one filter is provided
    const hasDateFilters = fromDate || toDate;
    const hasAgentFilter = agentName.trim().length > 0;

    if (!hasDateFilters && !hasAgentFilter) {
      setValidationError('Please provide at least one filter (date range or agent name)');
      return;
    }

    setValidationError('');
    setHasAppliedFilters(true);

    const fromStr = dateToString(fromDate);
    const toStr = dateToString(toDate);

    updateURL(fromStr, toStr, agentName);
    onFiltersChange({
      from: fromStr || undefined,
      to: toStr || undefined,
      agentName: agentName.trim() || undefined
    });
  };

  const handleResetFilters = useCallback(() => {
    setFromDate(defaultDates.fromDate);
    setToDate(defaultDates.toDate);
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
    setFromDate(null);
    setToDate(null);
    setAgentName('');
    setHasAppliedFilters(false);
    setValidationError('');
    updateURL();
    onFiltersChange(null);
  };

  // Custom theme for Flowbite Datepicker
  const customTheme = {
    root: {
      base: "relative"
    },
    input: {
      base: "h-8 pl-10 pr-3 text-sm bg-white text-[#1C275E] placeholder:text-[#1C275E]/60 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition rounded-lg"
    },
    popup: {
      root: {
        base: "absolute top-10 z-50 block pt-2",
        inline: "relative top-0 z-auto",
        inner: "inline-block rounded-lg bg-white p-4 shadow-lg border border-gray-200"
      },
      header: {
        base: "",
        title: "px-2 py-3 text-center font-semibold text-gray-900",
        selectors: {
          base: "mb-2 flex justify-between",
          button: {
            base: "rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
            prev: "",
            next: "",
            view: ""
          }
        }
      },
      view: {
        base: "p-1"
      },
      footer: {
        base: "mt-2 flex space-x-2",
        button: {
          base: "w-full rounded-lg px-5 py-2 text-center text-sm font-medium focus:ring-4 focus:ring-blue-300",
          today: "bg-blue-700 text-white hover:bg-blue-800",
          clear: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
        }
      }
    },
    views: {
      days: {
        header: {
          base: "mb-1 grid grid-cols-7",
          title: "h-6 text-center text-sm font-medium leading-6 text-gray-500"
        },
        items: {
          base: "grid w-64 grid-cols-7",
          item: {
            base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
            selected: "bg-blue-700 text-white hover:bg-blue-600",
            disabled: "text-gray-400 cursor-not-allowed"
          }
        }
      },
      months: {
        items: {
          base: "grid w-64 grid-cols-4",
          item: {
            base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
            selected: "bg-blue-700 text-white hover:bg-blue-600",
            disabled: "text-gray-400"
          }
        }
      },
      years: {
        items: {
          base: "grid w-64 grid-cols-4",
          item: {
            base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
            selected: "bg-blue-700 text-white hover:bg-blue-600",
            disabled: "text-gray-400"
          }
        }
      },
      decades: {
        items: {
          base: "grid w-64 grid-cols-4",
          item: {
            base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
            selected: "bg-blue-700 text-white hover:bg-blue-600",
            disabled: "text-gray-400"
          }
        }
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Header */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Filter className="h-4 w-4 text-[#F48024]" aria-hidden="true" />
          <h3 id="date-range-group" className="text-sm font-semibold text-white">
            Filter
          </h3>
          {hasAppliedFilters && (
            <span className="text-xs bg-[#F48024]/20 text-[#F48024] px-2 py-1 rounded-full" aria-live="polite">
              Active
            </span>
          )}
        </div>

        {/* Date Inputs and Agent Name - Horizontal Layout */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4 flex-1" role="group" aria-labelledby="date-range-group">
          {/* From Date */}
          <div className="space-y-1.5">
            <Datepicker
                id="from-date"
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                placeholder="From date"
                minDate={new Date('2020-01-01')}
                maxDate={new Date()}
                weekStart={0}
                autoHide={true}
                showClearButton={false}
                showTodayButton={false}
                theme={customTheme}
              />
          </div>

          {/* To Date */}
          <div className="space-y-1.5">
            <Datepicker
                id="to-date"
                value={toDate}
                onChange={(date) => setToDate(date)}
                placeholder="To date"
                minDate={new Date('2020-01-01')}
                maxDate={new Date()}
                weekStart={0}
                autoHide={true}
                showClearButton={false}
                showTodayButton={false}
                theme={customTheme}
              />
          </div>

          {/* Agent Name Dropdown */}
          <div className="space-y-1.5" data-agent-dropdown>
            {/* Agent Dropdown Button */}
            <Button
              variant="outline"
              className={cn(
                "w-full h-8 justify-between bg-white text-[#1C275E] border-[#cbd5e1] hover:bg-gray-50 transition-all duration-200",
                isAgentDropdownOpen ? "ring-2 ring-[#0d9488]/20 border-[#0d9488]" : ""
              )}
              onClick={handleAgentDropdownToggle}
              type="button"
            >
              <span className="truncate text-sm">
                {agentName || "Select agent..."}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2",
                  isAgentDropdownOpen ? "rotate-180" : ""
                )}
              />
            </Button>

            {/* Dropdown Menu */}
            {isAgentDropdownOpen && (
              <>
                {/* Click outside overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setIsAgentDropdownOpen(false)} />

                <Card className="absolute top-full mt-1 shadow-xl border border-gray-200 z-50 bg-white rounded-lg overflow-hidden w-70 max-w-[calc(130vw-2rem)]">
                  <CardContent className="p-0">
                    {/* Sticky Search Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-100 z-10 p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search agents..."
                          value={agentSearchTerm}
                          onChange={(e) => setAgentSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                          autoFocus
                        />
                        {agentSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setAgentSearchTerm('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="h-3 w-3 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scrollable Agents List */}
                    <div className="max-h-64 overflow-y-auto">
                      {isLoadingAgents ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1C275E] mr-2"></div>
                          <span className="text-sm text-gray-600">Loading agents...</span>
                        </div>
                      ) : filteredAgents.length === 0 ? (
                        <div className="flex items-center justify-center py-6">
                          <span className="text-sm text-gray-500">
                            {agentSearchTerm.trim() ? "No agents found" : "No agents available"}
                          </span>
                        </div>
                      ) : (
                        <div className="py-2">
                          {filteredAgents.map((agent) => (
                            <Button
                              key={agent}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start p-3 h-auto hover:bg-blue-50 rounded-none border-0",
                                agent === agentName && "bg-blue-50"
                              )}
                              onClick={() => handleAgentSelect(agent)}
                            >
                              <div className="flex items-center gap-3 w-full min-w-0">
                                <div className="text-left min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {agent}
                                  </p>
                                </div>
                                {agent === agentName && (
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0" role="group" aria-label="Filter actions">
            <Button
              onClick={handleApplyFilters}
              disabled={isLoading || (!fromDate && !toDate && !agentName.trim())}
              className="bg-[#f49024] hover:bg-[#d87f1f] text-white text-xs h-8 px-3 focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              aria-describedby={validationError ? "date-validation-error" : undefined}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" aria-hidden="true" />
                  Applying...
                </>
              ) : (
                <>
                  <Filter className="h-3 w-3 mr-1" aria-hidden="true" />
                  Apply
                </>
              )}
            </Button>

            {/* 90 Days button - commented out */}
            {/* <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={isLoading}
              className="bg-transparent text-[#e6eff7] border-[#95a3b8] hover:bg-[#233072] hover:text-white text-xs h-8 px-3 focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              aria-label="Reset filters to last 90 days"
            >
              <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
              90 Days
            </Button> */}

            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={isLoading}
              className="bg-transparent text-[#e6eff7] border-[#95a3b8] hover:bg-[#233072] hover:text-white text-xs h-8 px-3 focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              aria-label="Clear all applied filters"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div
          id="date-validation-error"
          className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200"
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
          className="mt-3 text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200"
          role="alert"
          aria-live="assertive"
        >
          <strong>Filter Error:</strong> {filterError}
        </div>
      )}
    </div>
  );
};
export default DateFilterControls;