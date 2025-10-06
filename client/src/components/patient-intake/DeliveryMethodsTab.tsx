import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Send, FileSignature, Save, Loader2 } from "lucide-react";
import { usePermissions } from "@/context/AuthContext";

/**
 * DeliveryMethodsTab
 * - Format preferences and signature/consent capture configuration
 * - Enhanced with brand styling and sophisticated save system
 * - Controlled component: receives values and onChange handler
 */
export type DeliveryMethodsTabProps = {
  values: {
    formatPreferences: {
      textMessageLink: boolean;
      voiceCall: boolean;
      qrCode: boolean;
      emailLink: boolean;
      inPersonTablet: boolean;
    };
    consentMethods: {
      digitalSignature: boolean;
      verbalConsentRecording: boolean;
      consentLanguage: string;
    };
  };
  onChange: (values: DeliveryMethodsTabProps['values']) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
};

const DeliveryMethodsTab = ({ values, onChange, onSave, isSaving = false, readOnly: readOnlyProp }: DeliveryMethodsTabProps) => {
  const { canEditPatientIntakeAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditPatientIntakeAgent;

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;
    await onSave();
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Format Preferences Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Format Preferences</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure how intake forms are delivered to patients</p>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="text-message-link" className="text-[#1c275e] font-medium">Text Message Link</Label>
              <IOSSwitch
                id="text-message-link"
                checked={values.formatPreferences.textMessageLink}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      formatPreferences: {
                        ...values.formatPreferences,
                        textMessageLink: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="voice-call" className="text-[#1c275e] font-medium">Voice Call</Label>
              <IOSSwitch
                id="voice-call"
                checked={values.formatPreferences.voiceCall}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      formatPreferences: {
                        ...values.formatPreferences,
                        voiceCall: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="qr-code" className="text-[#1c275e] font-medium">QR Code</Label>
              <IOSSwitch
                id="qr-code"
                checked={values.formatPreferences.qrCode}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      formatPreferences: {
                        ...values.formatPreferences,
                        qrCode: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="email-link" className="text-[#1c275e] font-medium">Email Link</Label>
              <IOSSwitch
                id="email-link"
                checked={values.formatPreferences.emailLink}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      formatPreferences: {
                        ...values.formatPreferences,
                        emailLink: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="in-person-tablet" className="text-[#1c275e] font-medium">In-Person Tablet</Label>
              <IOSSwitch
                id="in-person-tablet"
                checked={values.formatPreferences.inPersonTablet}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      formatPreferences: {
                        ...values.formatPreferences,
                        inPersonTablet: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Signature & Consent Capture Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <FileSignature className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Signature & Consent Capture</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Configure signature and consent collection methods</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="digital-signature" className="text-[#1c275e] font-medium">Digital Signature</Label>
              <IOSSwitch
                id="digital-signature"
                checked={values.consentMethods.digitalSignature}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      consentMethods: {
                        ...values.consentMethods,
                        digitalSignature: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="verbal-consent" className="text-[#1c275e] font-medium">Verbal Consent Recording</Label>
              <IOSSwitch
                id="verbal-consent"
                checked={values.consentMethods.verbalConsentRecording}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      consentMethods: {
                        ...values.consentMethods,
                        verbalConsentRecording: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consent-language" className="text-sm font-semibold text-[#1c275e]">Consent Text</Label>
              <Textarea
                id="consent-language"
                placeholder="Enter the consent text that will be shown to patients..."
                value={values.consentMethods.consentLanguage}
                onChange={readOnly ? undefined : (e) => {
                  onChange({
                    ...values,
                    consentMethods: {
                      ...values.consentMethods,
                      consentLanguage: e.target.value
                    }
                  });

                }}
                readOnly={readOnly}
                className="min-h-24 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryMethodsTab;
