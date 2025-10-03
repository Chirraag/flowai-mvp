import React, { Suspense, lazy, useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
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
  
  // RBAC Permission check for save button visibility
  const canWriteAgents = hasWriteAccess("ai-agents");

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentData, setAgentData] = useState<PatientIntakeApiData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());
  const [savingTabs, setSavingTabs] = useState<Set<string>>(new Set());
  
  // Centralized tab states (Phase 1: Lift State to Parent)
  interface PatientIntakeTabStates {
    fieldContentRules: FieldContentRulesTabData;
    deliveryMethods: DeliveryMethodsTabData;
    formsQuestionnaires: FormsQuestionnairesTabData;
  }
  const [tabStates, setTabStates] = useState<PatientIntakeTabStates | null>(null);
  
  // Validation state
  const [formValidation, setFormValidation] = useState<ValidationResult | null>(null);
  const [fieldValidations, setFieldValidations] = useState<Record<string, string>>({});

  // Ref only for workflows (no state lifted there yet)
  const workflowsRef = React.useRef<any>(null);

  // Retry utility with exponential backoff
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  };

  // Fetch agent data on mount with retry
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!user?.org_id) {
        setIsLoading(false);
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
        
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Failed to fetch patient intake agent:', error);
        toast({
          title: "Error",
          description: "Failed to load patient intake configuration after retries",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [user?.org_id, toast]);

  // Handle save all configurations with enhanced error handling
  const handleSaveAll = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    setIsSaving(true);
    setSavingTabs(new Set());

    try {
      // Get values from centralized tab state (excluding forms which doesn't have API yet)
      const tabValues = {
        rules: tabStates.fieldContentRules,
        delivery: tabStates.deliveryMethods,
      };

      // Perform page-level validation before making any API calls
      const rulesValidation = validateFieldContentRules(tabValues.rules);
      const deliveryValidation = validateDeliveryMethods(tabValues.delivery);

      const allErrors: ValidationError[] = [
        ...rulesValidation.errors,
        ...deliveryValidation.errors
      ];
      const allWarnings: ValidationError[] = [
        ...rulesValidation.warnings,
        ...deliveryValidation.warnings
      ];

      // If validation fails, show errors and prevent API calls
      if (allErrors.length > 0) {
        setFormValidation({
          valid: false,
          errors: allErrors,
          warnings: allWarnings
        });

        toast({
          title: "Validation Failed",
          description: formatValidationErrors(allErrors),
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Clear validation state on success
      setFormValidation(null);
      setFieldValidations({});

      // Build update tasks with metadata (excluding forms which doesn't have API yet)
      const updateTasks: Array<{
        promise: Promise<any>;
        name: string;
        key: string;
      }> = [];

      const tabConfigs = [
        {
          key: 'rules',
          name: 'Field & Content Rules',
          apiFn: () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/field-requirements`,
            { ...mapFieldContentRulesToApi(tabValues.rules), current_version: agentData.current_version }),
          currentValues: mapApiToFieldContentRules(agentData),
          newValues: tabValues.rules,
        },
        {
          key: 'delivery',
          name: 'Delivery Methods',
          apiFn: () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/delivery-methods`,
            { ...mapDeliveryMethodsToApi(tabValues.delivery), current_version: agentData.current_version }),
          currentValues: mapApiToDeliveryMethods(agentData),
          newValues: tabValues.delivery,
        },
      ];

      // Only add tasks for tabs that have changes
      for (const config of tabConfigs) {
        if (config.newValues) {
          const hasChanges = JSON.stringify(config.newValues) !== JSON.stringify(config.currentValues);
          if (hasChanges) {
            updateTasks.push({
              promise: retryWithBackoff(config.apiFn, 1, 500), // 1 retry with shorter delay for saves
              name: config.name,
              key: config.key,
            });
          }
        }
      }

      if (updateTasks.length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected to save",
        });
        setIsSaving(false);
        return;
      }

      // Track which tabs are being saved
      const savingTabKeys = new Set(updateTasks.map(task => task.key));
      setSavingTabs(savingTabKeys);

      // Execute all updates with individual error handling
      const results = await Promise.allSettled(updateTasks.map(task => task.promise));

      const successfulUpdates: string[] = [];
      const failedUpdates: string[] = [];

      results.forEach((result, index) => {
        const task = updateTasks[index];
        if (result.status === 'fulfilled') {
          successfulUpdates.push(task.name);
        } else {
          failedUpdates.push(task.name);
          console.error(`Failed to update ${task.name}:`, result.reason);
        }
      });

      // Show appropriate toast based on results
      if (successfulUpdates.length > 0 && failedUpdates.length === 0) {
        toast({
          title: "Success",
          description: `Updated: ${successfulUpdates.join(", ")}`,
        });

        // Refetch data to get updated state
        try {
          const updatedData = await retryWithBackoff(
            () => api.get(`/api/v1/patient-intake-agent/${user.org_id}`) as Promise<{ data: PatientIntakeApiData }>,
            1,
            500
          );
          setAgentData(updatedData.data);
          setDirtyTabs(new Set()); // Clear dirty flags on success
        } catch (refetchError) {
          console.error('Failed to refetch data:', refetchError);
          toast({
            title: "Partial Success",
            description: "Updates saved, but failed to refresh data. Please reload the page.",
            variant: "destructive",
          });
        }
      } else if (successfulUpdates.length > 0) {
        toast({
          title: "Partial Success",
          description: `Updated: ${successfulUpdates.join(", ")}. Failed: ${failedUpdates.join(", ")}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Save Failed",
          description: `Failed to update: ${failedUpdates.join(", ")}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Save failed:', error);
      const errorToast = handleApiError(error, { action: "save patient intake configuration" });
      toast(errorToast);
    } finally {
      setIsSaving(false);
      setSavingTabs(new Set());
    }
  };


  // Change handlers for tab states (Phase 1)
  const handleFieldContentRulesChange = (newValues: FieldContentRulesTabData) => {
    setTabStates(prev => prev ? {
      ...prev,
      fieldContentRules: newValues
    } : null);
    setDirtyTabs(prev => new Set(Array.from(prev).concat('field-content-rules')));
  };

  const handleDeliveryMethodsChange = (newValues: DeliveryMethodsTabData) => {
    setTabStates(prev => prev ? {
      ...prev,
      deliveryMethods: newValues
    } : null);
    setDirtyTabs(prev => new Set(Array.from(prev).concat('delivery-methods')));
  };

  const handleFormsQuestionnairesChange = (newValues: FormsQuestionnairesTabData) => {
    setTabStates(prev => prev ? {
      ...prev,
      formsQuestionnaires: newValues
    } : null);
    setDirtyTabs(prev => new Set(Array.from(prev).concat('forms-questionnaires')));
  };

  // Function to refetch agent data after save
  const refetchAgentData = async () => {
    if (!user?.org_id) return;
    try {
      const data = await api.get(`/api/v1/patient-intake-agent/${user.org_id}`) as { data: PatientIntakeApiData };
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

  // Individual save handlers for each tab
  const handleSaveFieldRules = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    // Validate before saving
    const validation = validateFieldContentRules(tabStates.fieldContentRules);
    if (!validation.valid) {
      setFormValidation(validation);
      toast({
        title: "Validation Failed",
        description: formatValidationErrors(validation.errors),
        variant: "destructive",
      });
      // Return early - validation error is already shown to the user
      return;
    }

    // Clear validation on success
    setFormValidation(null);
    setFieldValidations({});

    try {
      await retryWithBackoff(
        () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/field-requirements`, {
          ...mapFieldContentRulesToApi(tabStates.fieldContentRules),
          current_version: agentData.current_version
        }),
        1,
        500
      );

      toast({
        title: "Success",
        description: "Field & Content Rules saved successfully",
      });

      await refetchAgentData();
    } catch (error) {
      console.error('Failed to save field rules:', error);
      const errorToast = handleApiError(error, { action: "save field & content rules" });
      toast(errorToast);
    }
  };

  const handleSaveDeliveryMethods = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    // Validate before saving
    const validation = validateDeliveryMethods(tabStates.deliveryMethods);
    if (!validation.valid) {
      setFormValidation(validation);
      toast({
        title: "Validation Failed",
        description: formatValidationErrors(validation.errors),
        variant: "destructive",
      });
      // Return early - validation error is already shown to the user
      return;
    }

    // Clear validation on success
    setFormValidation(null);
    setFieldValidations({});

    try {
      await retryWithBackoff(
        () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/delivery-methods`, {
          ...mapDeliveryMethodsToApi(tabStates.deliveryMethods),
          current_version: agentData.current_version
        }),
        1,
        500
      );

      toast({
        title: "Success",
        description: "Delivery Methods saved successfully",
      });

      await refetchAgentData();
    } catch (error) {
      console.error('Failed to save delivery methods:', error);
      const errorToast = handleApiError(error, { action: "save delivery methods" });
      toast(errorToast);
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
  if (isLoading) {
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
              onSave={handleSaveFieldRules}
              isSaving={isSaving}
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
              onSave={handleSaveDeliveryMethods}
              isSaving={isSaving}
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