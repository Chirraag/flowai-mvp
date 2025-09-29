import React, { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { FileText, MessageSquare, Shield, Edit, Plus, Save, Loader2, Clock } from "lucide-react";

/**
 * FormsQuestionnairesTab
 * - Intake forms and questionnaires configuration
 * - Enhanced with brand styling and sophisticated save system
 */
export type FormsQuestionnairesTabProps = {
  initialValues?: {
    intakeForms: {
      adaptiveIntakeQuestionnaire: boolean;
      consentForms: boolean;
    };
    modalityForms: {
      mriSafetyQuestionnaire: boolean;
      urologySymptomSurvey: boolean;
      preProcedureInstructions: boolean;
    };
  };
  onSave?: (values: any) => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
};

export type FormsQuestionnairesTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => {
    intakeForms: {
      adaptiveIntakeQuestionnaire: boolean;
      consentForms: boolean;
    };
    modalityForms: {
      mriSafetyQuestionnaire: boolean;
      urologySymptomSurvey: boolean;
      preProcedureInstructions: boolean;
    };
  };
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const FormsQuestionnairesTab = forwardRef<FormsQuestionnairesTabHandle, FormsQuestionnairesTabProps>(({ initialValues, onSave, isSaving = false, readOnly = false }, ref) => {
  // Intake Forms state
  const [adaptiveIntakeQuestionnaire, setAdaptiveIntakeQuestionnaire] = useState(true);
  const [consentForms, setConsentForms] = useState(true);

  // Modality-Specific Forms state
  const [mriSafetyQuestionnaire, setMriSafetyQuestionnaire] = useState(false);
  const [urologySymptomSurvey, setUrologySymptomSurvey] = useState(false);
  const [preProcedureInstructions, setPreProcedureInstructions] = useState(false);

  // Change tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Populate state from initialValues if provided
  useEffect(() => {
    if (initialValues) {
      setAdaptiveIntakeQuestionnaire(initialValues.intakeForms.adaptiveIntakeQuestionnaire ?? true);
      setConsentForms(initialValues.intakeForms.consentForms ?? true);
      setMriSafetyQuestionnaire(initialValues.modalityForms.mriSafetyQuestionnaire ?? false);
      setUrologySymptomSurvey(initialValues.modalityForms.urologySymptomSurvey ?? false);
      setPreProcedureInstructions(initialValues.modalityForms.preProcedureInstructions ?? false);
      setHasUnsavedChanges(false);
    }
  }, [initialValues]);

  // Track changes
  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  // Save handler - API not implemented yet
  const handleSave = async () => {
    // API for forms/questionnaires is not implemented yet
    // This will be handled by the parent component
    console.log('Forms/Questionnaires save - API not implemented yet');
  };

  useImperativeHandle(ref, () => ({
    getValues: () => ({
      intakeForms: {
        adaptiveIntakeQuestionnaire,
        consentForms,
      },
      modalityForms: {
        mriSafetyQuestionnaire,
        urologySymptomSurvey,
        preProcedureInstructions,
      },
    }),
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      {/* Enhanced Intake Forms Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Intake Forms</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure patient intake forms and questionnaires (API coming soon)</p>
              </div>
            </div>
            {onSave && (
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#f48024] rounded-full animate-pulse"></div>
                    <span className="text-gray-200">Unsaved changes</span>
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  disabled={true} // API not implemented yet
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md cursor-not-allowed opacity-75"
                  title="Forms/Questionnaires API will be implemented later"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Intake Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Adaptive Intake Questionnaire Card */}
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-[#f48024]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1c275e]">Adaptive Intake Questionnaire</h3>
                      <p className="text-sm text-gray-600">Intelligent form that adapts based on patient responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IOSSwitch
                      checked={adaptiveIntakeQuestionnaire}
                      onCheckedChange={(checked) => {
                        if (!readOnly) {
                          setAdaptiveIntakeQuestionnaire(checked);
                          handleFieldChange();
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent Forms Card */}
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-[#2a3570]/20 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-[#2a3570]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1c275e]">Consent Forms</h3>
                      <p className="text-sm text-gray-600">Standard form template</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IOSSwitch
                      checked={consentForms}
                      onCheckedChange={(checked) => {
                        if (!readOnly) {
                          setConsentForms(checked);
                          handleFieldChange();
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Custom Form Button - Hidden for read-only users */}
          {!readOnly && (
            <Button variant="outline" className="w-full border-[#f48024] text-[#f48024] hover:bg-[#f48024] hover:text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Form
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Modality-Specific Forms Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Modality-Specific Forms</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Specialized forms for specific procedures (API coming soon)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Modality Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* MRI Safety Questionnaire Card */}
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#f48024]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1c275e]">MRI Safety Questionnaire</h3>
                      <p className="text-sm text-gray-600">Procedure-specific questionnaire</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <IOSSwitch
                      checked={mriSafetyQuestionnaire}
                      onCheckedChange={(checked) => {
                        if (!readOnly) {
                          setMriSafetyQuestionnaire(checked);
                          handleFieldChange();
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Urology Symptom Survey Card */}
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 bg-[#2a3570]/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#2a3570]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1c275e]">Urology Symptom Survey</h3>
                      <p className="text-sm text-gray-600">Procedure-specific questionnaire</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <IOSSwitch
                      checked={urologySymptomSurvey}
                      onCheckedChange={(checked) => {
                        if (!readOnly) {
                          setUrologySymptomSurvey(checked);
                          handleFieldChange();
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-procedure Instructions Card */}
            <Card className="border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 bg-[#1c275e]/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#1c275e]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1c275e]">Pre-procedure Instructions</h3>
                      <p className="text-sm text-gray-600">Procedure-specific questionnaire</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <IOSSwitch
                      checked={preProcedureInstructions}
                      onCheckedChange={(checked) => {
                        if (!readOnly) {
                          setPreProcedureInstructions(checked);
                          handleFieldChange();
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Custom Form Button - Hidden for read-only users */}
          {!readOnly && (
            <Button variant="outline" className="w-full border-[#f48024] text-[#f48024] hover:bg-[#f48024] hover:text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Form
            </Button>
          )}

          {/* Note about API not being implemented */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Note:</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Forms and Questionnaires API is not implemented yet. This feature will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default FormsQuestionnairesTab;
