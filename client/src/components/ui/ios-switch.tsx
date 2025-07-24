import React from "react";
import { cn } from "@/lib/utils";

interface IOSSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function IOSSwitch({ 
  checked, 
  onCheckedChange, 
  disabled = false, 
  className,
  id 
}: IOSSwitchProps) {
  return (
    <label className={cn("ios-switch", className)} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="ios-switch-slider"></span>
    </label>
  );
}