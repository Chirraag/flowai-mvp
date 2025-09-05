import React, { useImperativeHandle, useState, useEffect, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Plus, X } from "lucide-react";

interface BasicInfoTabProps {
  initialPracticeName?: string;
  initialDbas?: string[];
}

/**
 * BasicInfoTab
 * - Includes Primary Practice Name and dynamic list of DBAs
 * - Hydrates from props on mount, maintains local state for edits
 */
export type BasicInfoTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => { practiceName: string; dbas: string[] };
  /**
   * Lightweight validation for name fields.
   * - practiceName: required, no digits
   * - dbas: optional; if present, no digits
   */
  validate: () => { valid: boolean; errors: string[] };
};

const BasicInfoTab = forwardRef<BasicInfoTabHandle, BasicInfoTabProps>((props, ref) => {
  const [practiceName, setPracticeName] = useState("");
  const [dbas, setDbas] = useState<string[]>([]);

  // Seed local state from props on mount
  useEffect(() => {
    if (props.initialPracticeName) {
      setPracticeName(props.initialPracticeName);
    }
    if (props.initialDbas && props.initialDbas.length > 0) {
      setDbas(props.initialDbas);
    }
  }, [props.initialPracticeName, props.initialDbas]);

  const addDba = () => setDbas((prev) => [...prev, ""]);
  const updateDba = (index: number, value: string) => {
    setDbas((prev) => prev.map((v, i) => (i === index ? value : v)));
  };
  const removeDba = (index: number) => {
    setDbas((prev) => prev.filter((_, i) => i !== index));
  };

  // Expose values and a simple validator to parent page (used on Save Configuration).
  useImperativeHandle(ref, () => ({
    getValues: () => ({ practiceName, dbas }),
    validate: () => {
      const errors: string[] = [];
      const hasDigits = (s: string) => /\d/.test(s);

      if (!practiceName.trim() || hasDigits(practiceName)) {
        // Match requested error messaging contract at page level
        errors.push("Practice Name required");
      }

      // Optional DBAs: if provided, must not contain digits
      dbas.forEach((name, idx) => {
        if (name && hasDigits(name)) {
          errors.push(`Alternative Name #${idx + 1} is invalid`);
        }
      });

      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        {/* Section title row with icon to match screenshot */}
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4" />
          <h2 className="text-xl font-semibold text-gray-900">Practice Information</h2>
        </div>

        {/* Primary Practice Name */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="practice-name">Primary Practice Name *</Label>
          <Input
            id="practice-name"
            placeholder="Enter your practice name"
            value={practiceName}
            onChange={(e) => setPracticeName(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Alternative Names (DBAs) */}
        <div className="space-y-3">
          <Label className="text-gray-900">Alternative Names (DBAs)</Label>

          {/* Render DBA input rows when added */}
          <div className="space-y-3">
            {dbas.map((value, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder={`Alternative name #${idx + 1}`}
                  value={value}
                  onChange={(e) => updateDba(idx, e.target.value)}
                  className="h-11"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Remove alternative name #${idx + 1}`}
                  onClick={() => removeDba(idx)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add button positioned below the DBA inputs to match requested layout */}
          <Button type="button" variant="outline" className="h-10" onClick={addDba}>
            <Plus className="h-4 w-4 mr-2" />
            Add Alternative Name
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default BasicInfoTab;


