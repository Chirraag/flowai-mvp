import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Calendar, Settings, FileText, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { usePermissions } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ProviderPreferencesValues } from "@/types/schedulingAgent";

/**
 * ProviderPreferencesTab
 * - Provider preferences and scheduling restrictions
 * - Mirrors the launchpad tab styling and structure
 */
export type ProviderPreferencesTabProps = {
  initialValues?: ProviderPreferencesValues;
  onSave?: (values: ProviderPreferencesValues) => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
};

export type ProviderPreferencesTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => ProviderPreferencesValues;
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const ProviderPreferencesTab = forwardRef<ProviderPreferencesTabHandle, ProviderPreferencesTabProps>(({ initialValues, onSave, isSaving = false, readOnly: readOnlyProp }, ref) => {
  const { canEditSchedulingAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditSchedulingAgent;
  // Provider Preferences state
  const [providerBlackoutDates, setProviderBlackoutDates] = React.useState<string[]>([]);
  const [establishedPatientsOnlyDays, setEstablishedPatientsOnlyDays] = React.useState("");
  const [customSchedulingRules, setCustomSchedulingRules] = React.useState<string[]>([]);

  // Set initial values when props change
  useEffect(() => {
    if (initialValues) {
      // Convert textarea string to array for individual date inputs
      setProviderBlackoutDates(
        initialValues.providerBlackoutDates
          ? initialValues.providerBlackoutDates.split('\n').filter(date => date.trim())
          : []
      );
      setEstablishedPatientsOnlyDays(initialValues.establishedPatientsOnlyDays);
      // Convert textarea string to array for individual rule inputs
      setCustomSchedulingRules(
        initialValues.customSchedulingRules
          ? initialValues.customSchedulingRules.split('\n').filter(rule => rule.trim())
          : []
      );
    }
  }, [initialValues]);

  // Blackout dates management handlers
  const handleAddBlackoutDate = () => {
    setProviderBlackoutDates([...providerBlackoutDates, ""]);
    
  };

  const handleUpdateBlackoutDate = (index: number, value: string) => {
    const updated = [...providerBlackoutDates];
    updated[index] = value;
    setProviderBlackoutDates(updated);
    
  };

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    index?: number;
    date?: string;
  }>({ open: false });

  // Rule delete confirmation dialog state
  const [ruleDeleteDialog, setRuleDeleteDialog] = React.useState<{
    open: boolean;
    index?: number;
  }>({ open: false });

  // Delete handlers
  const handleDeleteBlackoutDate = (index: number, date: string) => {
    setDeleteDialog({
      open: true,
      index,
      date
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.index !== undefined) {
      const updated = providerBlackoutDates.filter((_, i) => i !== deleteDialog.index);
      setProviderBlackoutDates(updated);
      
    }
    setDeleteDialog({ open: false });
  };

  // Custom scheduling rules management handlers
  const handleAddRule = () => {
    setCustomSchedulingRules([...customSchedulingRules, ""]);
    
  };

  const handleUpdateRule = (index: number, value: string) => {
    const updated = [...customSchedulingRules];
    updated[index] = value;
    setCustomSchedulingRules(updated);
    
  };

  const handleDeleteRule = (index: number) => {
    setRuleDeleteDialog({
      open: true,
      index
    });
  };

  const handleConfirmRuleDelete = () => {
    if (ruleDeleteDialog.index !== undefined) {
      const updated = customSchedulingRules.filter((_, i) => i !== ruleDeleteDialog.index);
      setCustomSchedulingRules(updated);
      
    }
    setRuleDeleteDialog({ open: false });
  };

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;

    const currentRef = (ref as React.MutableRefObject<ProviderPreferencesTabHandle | null>).current;
    const currentValues = currentRef?.getValues();
    if (currentValues) {
      await onSave(currentValues);
    }
  };

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      // Convert array back to newline-separated string for API compatibility
      providerBlackoutDates: providerBlackoutDates.filter(date => date.trim()).join('\n'),
      establishedPatientsOnlyDays,
      // Convert array back to newline-separated string for API compatibility
      customSchedulingRules: customSchedulingRules.filter(rule => rule.trim()).join('\n'),
    }),
    validate: () => {
      const errors: string[] = [];
      // Basic validation can be added here if needed
      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Enhanced Provider Preferences & Restrictions Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Provider Preferences & Restrictions</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure provider-specific scheduling rules</p>
              </div>
            </div>
            {onSave && !readOnly && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-white hover:bg-slate-400 active:bg-slate-500 text-[#1c275e] border-[#1c275e] px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* Enhanced Provider Preferences Sections */}
          <div className="space-y-8">
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[#f48024]" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <Label className="text-sm font-semibold text-[#1c275e]">Provider Blackout Dates (DD-MM-YYYY) </Label>
                  {!readOnly && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAddBlackoutDate}
                      className="bg-[#f48024] hover:bg-[#f48024]/90 text-white"
                    >
                      Add Date
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {providerBlackoutDates.map((date, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                    <Input
                      type="date"
                      value={date}
                      onChange={readOnly ? undefined : (e) => handleUpdateBlackoutDate(index, e.target.value)}
                      readOnly={readOnly}
                      className="border-none bg-transparent p-0 h-auto text-sm min-w-[140px]"
                    />
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteBlackoutDate(index, date)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {providerBlackoutDates.length === 0 && (
                  <p className="text-sm text-muted-foreground">No blackout dates added yet.</p>
                )}
              </div>
            </div>

            {/* <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#1c275e]/20 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#1c275e]" />
                </div>
                <Label htmlFor="established-only" className="text-sm font-semibold text-[#1c275e]">Established Patients Only Days</Label>
              </div>
              <Textarea
                id="established-only"
                placeholder="Enter days when only established patients can be scheduled (one per line)"
                value={establishedPatientsOnlyDays}
                onChange={(e) => {
                  if (!readOnly) {
                    setEstablishedPatientsOnlyDays(e.target.value);
                    
                  }
                }}
                readOnly={readOnly}
                className="min-h-32 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div> */}

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#2a3570]/20 rounded-lg flex items-center justify-center">
                    <Settings className="h-4 w-4 text-[#2a3570]" />
                  </div>
                  <Label className="text-sm font-semibold text-[#1c275e]">Custom Scheduling Rules</Label>
                </div>
                {!readOnly && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddRule}
                    className="bg-[#f48024] hover:bg-[#f48024]/90 text-white"
                  >
                    Add Rule
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {customSchedulingRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Enter custom scheduling rule (e.g., No new patients on Mondays before noon)"
                      value={rule}
                      onChange={readOnly ? undefined : (e) => handleUpdateRule(index, e.target.value)}
                      readOnly={readOnly}
                      className="flex-1 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
                    />
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteRule(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {customSchedulingRules.length === 0 && (
                  <p className="text-sm text-muted-foreground">No custom rules added yet.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blackout Date</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the blackout date "{deleteDialog.date}"?
              This change will be applied when you click Save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rule Deletion Confirmation Dialog */}
      <AlertDialog open={ruleDeleteDialog.open} onOpenChange={() => setRuleDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheduling Rule</AlertDialogTitle>
            <AlertDialogDescription>
              This rule will be deleted. This change will be applied when you click Save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRuleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default ProviderPreferencesTab;
