import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { FileText, MessageSquare, Shield, Edit, Plus } from "lucide-react";

/**
 * FormsQuestionnairesTab
 * - Intake forms and questionnaires configuration
 * - Mirrors the launchpad tab styling and structure
 */
export type FormsQuestionnairesTabHandle = {
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
  validate: () => { valid: boolean; errors: string[] };
};

const FormsQuestionnairesTab = forwardRef<FormsQuestionnairesTabHandle>((_props, ref) => {
  // Intake Forms state
  const [adaptiveIntakeQuestionnaire, setAdaptiveIntakeQuestionnaire] = React.useState(true);
  const [consentForms, setConsentForms] = React.useState(true);

  // Modality-Specific Forms state
  const [mriSafetyQuestionnaire, setMriSafetyQuestionnaire] = React.useState(false);
  const [urologySymptomSurvey, setUrologySymptomSurvey] = React.useState(false);
  const [preProcedureInstructions, setPreProcedureInstructions] = React.useState(false);

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
      {/* Intake Forms Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Intake Forms</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure patient intake forms and questionnaires</p>

          {/* Intake Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Adaptive Intake Questionnaire Card */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Adaptive Intake Questionnaire</h3>
                      <p className="text-sm text-gray-600">Intelligent form that adapts based on patient responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IOSSwitch
                      checked={adaptiveIntakeQuestionnaire}
                      onCheckedChange={setAdaptiveIntakeQuestionnaire}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent Forms Card */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Consent Forms</h3>
                      <p className="text-sm text-gray-600">Standard form template</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IOSSwitch
                      checked={consentForms}
                      onCheckedChange={setConsentForms}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Custom Form Button */}
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Form
          </Button>
        </CardContent>
      </Card>

      {/* Modality-Specific Forms Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Modality-Specific Forms</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Specialized forms for specific procedures</p>

          {/* Modality Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* MRI Safety Questionnaire Card */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">MRI Safety Questionnaire</h3>
                      <p className="text-sm text-gray-600">Procedure-specific questionnaire</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <IOSSwitch
                      checked={mriSafetyQuestionnaire}
                      onCheckedChange={setMriSafetyQuestionnaire}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Urology Symptom Survey Card */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Urology Symptom Survey</h3>
                      <p className="text-sm text-gray-600">Procedure-specific questionnaire</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <IOSSwitch
                      checked={urologySymptomSurvey}
                      onCheckedChange={setUrologySymptomSurvey}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-procedure Instructions Card */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Pre-procedure Instructions</h3>
                      <p className="text-sm text-gray-600">Procedure-specific questionnaire</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <IOSSwitch
                      checked={preProcedureInstructions}
                      onCheckedChange={setPreProcedureInstructions}
                    />
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Custom Form Button */}
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Form
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

export default FormsQuestionnairesTab;
