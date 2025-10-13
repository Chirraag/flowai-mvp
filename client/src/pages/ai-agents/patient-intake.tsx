import React, { Suspense, lazy, useState, useEffect, useMemo, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useNavigationBlocker } from "@/context/NavigationBlockerContext";
import {
  PatientIntakeApiData,
  mapApiToFieldContentRules,
  mapApiToDeliveryMethods,
  mapApiToFormsQuestionnaires,
  mapFieldContentRulesToApi,
  mapDeliveryMethodsToApi
} from "@/lib/patient-intake.mappers";
import {
  validateFieldContentRules,
  validateDeliveryMethods,
  formatValidationErrors,
  ValidationResult,
  ValidationError
} from "@/lib/patient-intake-validation.utils";

// Import shared AI agents utilities
import {
  createInitialState,
  stateHelpers,
  validateAllTabs,
  executeBulkSave,
  createSaveTasks,
  generateSaveResultMessage,
  getSaveResultVariant,
  retryWithBackoff,
  handleApiError,
  hasUnsavedChanges,
  getUnsavedTabNames,
  type LoadingState,
  type ValidationResult as SharedValidationResult
} from "@/lib/ai-agents";

// Import types for better type safety
import type {
  FieldContentRulesTabData,
  DeliveryMethodsTabData,
  FormsQuestionnairesTabData,
} from "@/lib/patient-intake.mappers";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const FormsQuestionnairesTab = lazy(() => import("@/components/patient-intake/FormsQuestionnairesTab"));
const FieldContentRulesTab = lazy(() => import("@/components/patient-intake/FieldContentRulesTab"));
const DeliveryMethodsTab = lazy(() => import("@/components/patient-intake/DeliveryMethodsTab"));
const PatientWorkflowsTab = lazy(() => import("@/components/patient-intake/PatientWorkflowsTab"));

export default function PatientIntakeAgent() {
  const { toast } = useToast();
  const { user, hasWriteAccess } = useAuth();
  const { setHasUnsavedChanges, setUnsavedTabs } = useNavigationBlocker();

  // RBAC Permission check for save button visibility
  const canWriteAgents = hasWriteAccess("ai-agents");

  // Loading and data state using shared utilities
  const [loadingState, setLoadingState] = useState<LoadingState>(createInitialState());
  const [agentData, setAgentData] = useState<PatientIntakeApiData | null>(null);

  // Centralized tab states (Phase 1: Lift State to Parent)
  interface PatientIntakeTabStates {
    fieldContentRules: FieldContentRulesTabData;
    deliveryMethods: DeliveryMethodsTabData;
    formsQuestionnaires: FormsQuestionnairesTabData;
  }
  const [tabStates, setTabStates] = useState<PatientIntakeTabStates | null>(null);

  // Validation state using shared types
  const [formValidation, setFormValidation] = useState<SharedValidationResult | null>(null);
  const [fieldValidations, setFieldValidations] = useState<Record<string, string>>({});

  // Refs for tabs that still use ref-based pattern
  const workflowsRef = useRef<any>(null);

  // Fetch agent data on mount with retry
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!user?.org_id) {
        setLoadingState(stateHelpers.setLoading(loadingState, false));
        toast({
          title: "Error",
          description: "User organization not found",
          variant: "destructive",
        });
        return;
      }

      try {
        const data = await retryWithBackoff(
          () => api.get(`/api/v1/patient-intake-agent/${user.org_id}`) as Promise<{ data: PatientIntakeApiData }>,
          2,
          1000
        );
        setAgentData(data.data);

        // Initialize tab states from fetched data (Phase 1)
        setTabStates({
          fieldContentRules: mapApiToFieldContentRules(data.data),
          deliveryMethods: mapApiToDeliveryMethods(data.data),
          formsQuestionnaires: mapApiToFormsQuestionnaires(data.data),
        });

        setLoadingState(stateHelpers.resetRetryCount(stateHelpers.setLoading(loadingState, false)));
      } catch (error) {
        console.error('Failed to fetch patient intake agent:', error);
        const errorToast = handleApiError(error, {
          action: "load patient intake configuration",
          fallbackMessage: "Failed to load patient intake configuration after retries"
        });
        toast(errorToast);
        setLoadingState(stateHelpers.setLoading(loadingState, false));
      }
    };

    fetchAgentData();
  }, [user?.org_id, toast]);

  // Handle save all configurations using shared utilities
  const handleSaveAll = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    setLoadingState(stateHelpers.setSaving(loadingState, true));
    setLoadingState(stateHelpers.clearSavingTabs(loadingState));

    try {
      // Get values from centralized tab state (excluding forms which doesn't have API yet)
      const tabValues = {
        rules: tabStates.fieldContentRules,
        delivery: tabStates.deliveryMethods,
      };

      // Perform page-level validation using shared utilities
      const validation = validateAllTabs({
        'field-content-rules': () => {
          const result = validateFieldContentRules(tabValues.rules);
          return {
            valid: result.valid,
            errors: result.errors.map(err => ({
              message: err.message,
              field: err.field || '',
              section: 'field-content-rules',
              type: err.type as 'error' | 'warning'
            })),
            warnings: result.warnings?.map(warn => ({
              message: warn.message,
              field: warn.field || '',
              section: 'field-content-rules',
              type: warn.type as 'error' | 'warning'
            }))
          };
        },
        'delivery-methods': () => {
          const result = validateDeliveryMethods(tabValues.delivery);
          return {
            valid: result.valid,
            errors: result.errors.map(err => ({
              message: err.message,
              field: err.field || '',
              section: 'delivery-methods',
              type: err.type as 'error' | 'warning'
            })),
            warnings: result.warnings?.map(warn => ({
              message: warn.message,
              field: warn.field || '',
              section: 'delivery-methods',
              type: warn.type as 'error' | 'warning'
            }))
          };
        },
      });

      // If validation fails, show errors and prevent API calls
      if (!validation.valid) {
        setFormValidation(validation);
        toast({
          title: "Validation Failed",
          description: formatValidationErrors(validation.errors),
          variant: "destructive",
        });
        setLoadingState(stateHelpers.setSaving(loadingState, false));
        return;
      }

      // Clear validation state on success
      setFormValidation(null);
      setFieldValidations({});

      // Build update tasks using shared utilities
      const tabConfigs = [
        {
          key: 'field-content-rules',
          name: 'Field & Content Rules',
          apiFn: () => retryWithBackoff(
            () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/field-requirements`,
              { ...mapFieldContentRulesToApi(tabValues.rules), current_version: agentData.current_version }),
            1,
            500
          ),
          hasChanges: JSON.stringify(tabValues.rules) !== JSON.stringify(mapApiToFieldContentRules(agentData)),
        },
        {
          key: 'delivery-methods',
          name: 'Delivery Methods',
          apiFn: () => retryWithBackoff(
            () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/delivery-methods`,
              { ...mapDeliveryMethodsToApi(tabValues.delivery), current_version: agentData.current_version }),
            1,
            500
          ),
          hasChanges: JSON.stringify(tabValues.delivery) !== JSON.stringify(mapApiToDeliveryMethods(agentData)),
        },
      ];

      // Create save tasks using shared utilities
      const saveTasks = createSaveTasks(tabConfigs);

      if (saveTasks.length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected to save",
        });
        setLoadingState(stateHelpers.setSaving(loadingState, false));
        return;
      }

      // Track which tabs are being saved
      const savingTabKeys = new Set(saveTasks.map(task => task.key));
      setLoadingState(stateHelpers.clearSavingTabs(loadingState));
      savingTabKeys.forEach(key => {
        setLoadingState(stateHelpers.addSavingTab(loadingState, key));
      });

      // Execute all updates using shared utilities
      const result = await executeBulkSave(saveTasks);

      // Show appropriate toast based on results
      toast({
        title: result.allSuccessful ? "Success" : "Partial Success",
        description: generateSaveResultMessage(result),
        variant: getSaveResultVariant(result),
      });

      // Refetch data to get updated state on success
      if (result.successful.length > 0) {
        try {
          const updatedData = await retryWithBackoff(
            () => api.get(`/api/v1/patient-intake-agent/${user.org_id}`) as Promise<{ data: PatientIntakeApiData }>,
            1,
            500
          );
          setAgentData(updatedData.data);
          console.log('Patient Intake Agent - Clearing dirty tabs after successful save');
          setLoadingState(stateHelpers.clearDirtyTabs(loadingState)); // Clear dirty flags on success
        } catch (refetchError) {
          console.error('Failed to refetch data:', refetchError);
          toast({
            title: "Partial Success",
            description: "Updates saved, but failed to refresh data. Please reload the page.",
            variant: "destructive",
          });
        }
      }

    } catch (error) {
      console.error('Save failed:', error);
      const errorToast = handleApiError(error, { action: "save patient intake configuration" });
      toast(errorToast);
    } finally {
      setLoadingState(prevState => stateHelpers.setSaving(prevState, false));
      setLoadingState(prevState => stateHelpers.clearSavingTabs(prevState));
    }
  };


  // Change handlers for tab states using shared utilities
  const handleFieldContentRulesChange = (newValues: FieldContentRulesTabData) => {
    setTabStates(prev => prev ? {
      ...prev,
      fieldContentRules: newValues
    } : null);
    setLoadingState(stateHelpers.addDirtyTab(loadingState, 'field-content-rules'));
    console.log('Patient Intake Agent - Added dirty tab: field-content-rules');
  };

  const handleDeliveryMethodsChange = (newValues: DeliveryMethodsTabData) => {
    setTabStates(prev => prev ? {
      ...prev,
      deliveryMethods: newValues
    } : null);
    setLoadingState(stateHelpers.addDirtyTab(loadingState, 'delivery-methods'));
    console.log('Patient Intake Agent - Added dirty tab: delivery-methods');
  };

  const handleFormsQuestionnairesChange = (newValues: FormsQuestionnairesTabData) => {
    setTabStates(prev => prev ? {
      ...prev,
      formsQuestionnaires: newValues
    } : null);
    setLoadingState(stateHelpers.addDirtyTab(loadingState, 'forms-questionnaires'));
    console.log('Patient Intake Agent - Added dirty tab: forms-questionnaires');
  };

  // Update navigation blocker when unsaved changes change
  useEffect(() => {
    const hasChanges = hasUnsavedChanges(loadingState);
    console.log('Patient Intake Agent - Navigation Blocker Update:', {
      dirtyTabs: Array.from(loadingState.dirtyTabs),
      hasChanges,
      timestamp: new Date().toISOString()
    });
    setHasUnsavedChanges(hasChanges);

    if (hasChanges) {
      const unsavedTabs = getUnsavedTabNames(loadingState, {
        'field-content-rules': 'Field & Content Rules',
        'delivery-methods': 'Delivery Methods',
        'forms-questionnaires': 'Forms & Questionnaires',
      });
      console.log('Patient Intake Agent - Setting unsaved tabs:', unsavedTabs);
      setUnsavedTabs(unsavedTabs);
    } else {
      console.log('Patient Intake Agent - Clearing unsaved tabs');
      setUnsavedTabs([]);
    }
  }, [loadingState, setHasUnsavedChanges, setUnsavedTabs]);

  // Function to refetch agent data after save (kept for individual tab saves if needed later)
  const refetchAgentData = async () => {
    if (!user?.org_id) return;
    try {
      const data = await retryWithBackoff(
        () => api.get(`/api/v1/patient-intake-agent/${user.org_id}`) as Promise<{ data: PatientIntakeApiData }>,
        1,
        500
      );
      setAgentData(data.data);

      // Update tab states from refetched data (Phase 1)
      setTabStates({
        fieldContentRules: mapApiToFieldContentRules(data.data),
        deliveryMethods: mapApiToDeliveryMethods(data.data),
        formsQuestionnaires: mapApiToFormsQuestionnaires(data.data),
      });
    } catch (error) {
      console.error('Failed to refetch agent data:', error);
      toast({
        title: "Warning",
        description: "Settings saved, but failed to refresh data. Please reload the page.",
        variant: "destructive",
      });
    }
  };

  // Prepare initial values for tabs
  const initialValues = useMemo(() => {
    if (!agentData) return null;
    return {
      rules: mapApiToFieldContentRules(agentData),
      delivery: mapApiToDeliveryMethods(agentData),
      forms: mapApiToFormsQuestionnaires(agentData),
    };
  }, [agentData]); // Stable as long as agentData doesn't change

  // Show loading state
  if (loadingState.isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#1c275e]" />
              Patient Intake Agent
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Loading configuration...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c275e] mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading patient intake configuration</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header with save button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#1c275e]" />
            Patient Intake Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Configure patient intake forms and data collection
          </p>
        </div>
        {canWriteAgents && (
          <Button
            onClick={handleSaveAll}
            disabled={loadingState.isSaving}
            className="bg-gray-100 hover:bg-gray-200 text-[#1c275e] px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loadingState.isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                Save Configuration
              </>
            )}
          </Button>
        )}
      </div>

      {/* Validation Summary */}
      {formValidation && !formValidation.valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Validation Errors</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {formValidation.errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Enhanced tabbed layout with brand styling */}
      <Tabs defaultValue="field-content-rules" className="w-full">
        {/* Improved tab navigation with brand styling */}
        <TabsList className="w-full flex gap-0 rounded-3xl outline outline-offset-[-1px] bg-muted p-1 overflow-hidden mb-6 h-12">
          <TabsTrigger
            value="forms-questionnaires"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Forms & Questionnaires
          </TabsTrigger>
          <TabsTrigger
            value="field-content-rules"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Field & Content Rules
          </TabsTrigger>
          <TabsTrigger
            value="delivery-methods"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Delivery Methods
          </TabsTrigger>
          <TabsTrigger
            value="workflows"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Workflows
          </TabsTrigger>
        </TabsList>

        {/* Forms & Questionnaires tab */}
        <TabsContent value="forms-questionnaires">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FormsQuestionnairesTab
              ref={undefined}
              initialValues={initialValues?.forms}
              onSave={undefined}
              isSaving={false}
            />
          </Suspense>
        </TabsContent>

        {/* Field & Content Rules tab */}
        <TabsContent value="field-content-rules">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FieldContentRulesTab
              values={tabStates ? {
                fieldRequirements: {
                  patientName: tabStates.fieldContentRules.fieldRequirements.patientName ?? "required",
                  dateOfBirth: tabStates.fieldContentRules.fieldRequirements.dateOfBirth ?? "required",
                  phoneNumber: tabStates.fieldContentRules.fieldRequirements.phoneNumber ?? "required",
                  email: tabStates.fieldContentRules.fieldRequirements.email ?? "optional",
                  insuranceId: tabStates.fieldContentRules.fieldRequirements.insuranceId ?? "optional",
                  emergencyContact: tabStates.fieldContentRules.fieldRequirements.emergencyContact ?? "required",
                  preferredLanguage: tabStates.fieldContentRules.fieldRequirements.preferredLanguage ?? "optional",
                },
                specialInstructions: {
                  menoresInstructions: tabStates.fieldContentRules.specialInstructions.menoresInstructions ?? "",
                  noInsuranceInstructions: tabStates.fieldContentRules.specialInstructions.noInsuranceInstructions ?? "",
                  languageBarrierInstructions: tabStates.fieldContentRules.specialInstructions.languageBarrierInstructions ?? "",
                }
              } : {
                fieldRequirements: {
                  patientName: "required",
                  dateOfBirth: "required",
                  phoneNumber: "required",
                  email: "optional",
                  insuranceId: "optional",
                  emergencyContact: "required",
                  preferredLanguage: "optional"
                },
                specialInstructions: {
                  menoresInstructions: "",
                  noInsuranceInstructions: "",
                  languageBarrierInstructions: ""
                }
              }}
              onChange={handleFieldContentRulesChange}
              readOnly={!canWriteAgents}
            />
          </Suspense>
        </TabsContent>

        {/* Delivery Methods tab */}
        <TabsContent value="delivery-methods">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <DeliveryMethodsTab
              values={tabStates ? {
                formatPreferences: {
                  textMessageLink: !!tabStates.deliveryMethods.formatPreferences.textMessageLink,
                  voiceCall: !!tabStates.deliveryMethods.formatPreferences.voiceCall,
                  qrCode: !!tabStates.deliveryMethods.formatPreferences.qrCode,
                  emailLink: !!tabStates.deliveryMethods.formatPreferences.emailLink,
                  inPersonTablet: !!tabStates.deliveryMethods.formatPreferences.inPersonTablet,
                },
                consentMethods: {
                  digitalSignature: !!tabStates.deliveryMethods.consentMethods.digitalSignature,
                  verbalConsentRecording: !!tabStates.deliveryMethods.consentMethods.verbalConsentRecording,
                  consentLanguage: tabStates.deliveryMethods.consentMethods.consentLanguage ?? "",
                }
              } : {
                formatPreferences: {
                  textMessageLink: false,
                  voiceCall: false,
                  qrCode: false,
                  emailLink: false,
                  inPersonTablet: false
                },
                consentMethods: {
                  digitalSignature: false,
                  verbalConsentRecording: false,
                  consentLanguage: ""
                }
              }}
              onChange={handleDeliveryMethodsChange}
              readOnly={!canWriteAgents}
            />
          </Suspense>
        </TabsContent>

        {/* Workflows tab */}
        <TabsContent value="workflows">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <PatientWorkflowsTab ref={workflowsRef} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}