import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

interface TimeRangePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  showToggleButton?: boolean; // For weekend hours - toggles between Open/Closed
  error?: string;
  placeholder?: string;
}

export default function TimeRangePicker({
  label,
  value,
  onChange,
  readOnly = false,
  showToggleButton = false,
  error,
  placeholder = "Select time range"
}: TimeRangePickerProps) {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [isClosed, setIsClosed] = useState<boolean>(false); // Default: Open

  // Parse initial value on mount or when value changes
  useEffect(() => {
    if (value && value.trim() !== "") {
      const parts = value.split(" - ");
      if (parts.length === 2) {
        setStartTime(parts[0]);
        setEndTime(parts[1]);
        setIsClosed(false); // Has hours = Open
      } else {
        // Handle legacy formats or malformed data
        setStartTime("");
        setEndTime("");
        setIsClosed(true); // No valid hours = Closed
      }
    } else {
      setStartTime("");
      setEndTime("");
      setIsClosed(true); // Empty value = Closed
    }
  }, [value]);

  // Validate and format time range
  const validateAndFormat = (start: string, end: string): { isValid: boolean; formattedValue: string; error: string } => {
    if (!start && !end) {
      return { isValid: true, formattedValue: "", error: "" };
    }

    if (!start || !end) {
      return { isValid: false, formattedValue: "", error: "Both start and end times are required" };
    }

    // Compare times (HH:MM format)
    if (end <= start) {
      return { isValid: false, formattedValue: "", error: "End time must be after start time" };
    }

    return { isValid: true, formattedValue: `${start} - ${end}`, error: "" };
  };

  // Handle time changes
  const handleStartTimeChange = (newStartTime: string) => {
    if (isClosed) return; // Don't allow changes when closed
    setStartTime(newStartTime);
    const result = validateAndFormat(newStartTime, endTime);
    setValidationError(result.error);
    if (result.isValid) {
      onChange(result.formattedValue);
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    if (isClosed) return; // Don't allow changes when closed
    setEndTime(newEndTime);
    const result = validateAndFormat(startTime, newEndTime);
    setValidationError(result.error);
    if (result.isValid) {
      onChange(result.formattedValue);
    }
  };

  // Handle toggle button (Open/Closed)
  const handleToggle = () => {
    const newIsClosed = !isClosed;
    setIsClosed(newIsClosed);

    if (newIsClosed) {
      // Closing: clear times and value
      setStartTime("");
      setEndTime("");
      setValidationError("");
      onChange("");
    } else {
      // Opening: just change state, don't set any value yet
      setValidationError("");
    }
  };

  // Display error (from props or local validation)
  const displayError = error || validationError;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-black uppercase tracking-wide">
        {label}
      </Label>

      <div className="flex items-center gap-1">
        <Input
          type="time"
          value={startTime}
          onChange={(e) => handleStartTimeChange(e.target.value)}
          readOnly={readOnly || isClosed}
          disabled={isClosed}
          className={`w-32 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition ${displayError ? 'border-red-500' : ''} ${isClosed ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
        />
        <span className={`text-sm px-1 ${isClosed ? 'text-gray-400' : 'text-gray-500'}`}>-</span>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => handleEndTimeChange(e.target.value)}
          readOnly={readOnly || isClosed}
          disabled={isClosed}
          className={`w-32 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition ${displayError ? 'border-red-500' : ''} ${isClosed ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
        />

        {showToggleButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={readOnly}
            className={`ml-2 transition-colors ${
              isClosed
                ? 'border-red-500 text-red-500 hover:bg-red-50 hover:text-red-700 focus:ring-2 focus:ring-red-500/20'
                : 'border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 focus:ring-2 focus:ring-green-500/20'
            }`}
          >
            {isClosed ? 'Closed' : 'Open'}
          </Button>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{displayError}</span>
        </div>
      )}

    </div>
  );
}
