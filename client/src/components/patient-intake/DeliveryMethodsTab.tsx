import React, { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Send, FileSignature, Save, Loader2 } from "lucide-react";

/**
 * DeliveryMethodsTab
 * - Format preferences and signature/consent capture configuration
 * - Enhanced with brand styling and sophisticated save system
 */
export type DeliveryMethodsTabProps = {
  initialData?: {
    formatPreferences: Record<string, boolean>;
    consentMethods: {
      digitalSignature: boolean;
      verbalConsentRecording: boolean;
      consentLanguage: string;
    };
  };
  onSave?: (values: any) => Promise<void>;
  isSaving?: boolean;
};

export type DeliveryMethodsTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => {
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
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const DeliveryMethodsTab = forwardRef<DeliveryMethodsTabHandle, DeliveryMethodsTabProps>(({ initialData, onSave, isSaving = false }, ref) => {
  // Format Preferences state (default values, overridden by initialData if provided)
  const [textMessageLink, setTextMessageLink] = useState(true);
  const [voiceCall, setVoiceCall] = useState(false);
  const [qrCode, setQrCode] = useState(true);
  const [emailLink, setEmailLink] = useState(true);
  const [inPersonTablet, setInPersonTablet] = useState(false);

  // Consent Methods state
  const [digitalSignature, setDigitalSignature] = useState(true);
  const [verbalConsentRecording, setVerbalConsentRecording] = useState(false);
  const [consentLanguage, setConsentLanguage] = useState("");

  // Change tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Populate state from initialData if provided
  useEffect(() => {
    if (initialData) {
      setTextMessageLink(initialData.formatPreferences.textMessageLink ?? true);
      setVoiceCall(initialData.formatPreferences.voiceCall ?? false);
      setQrCode(initialData.formatPreferences.qrCode ?? true);
      setEmailLink(initialData.formatPreferences.emailLink ?? true);
      setInPersonTablet(initialData.formatPreferences.inPersonTablet ?? false);

      setDigitalSignature(initialData.consentMethods.digitalSignature ?? true);
      setVerbalConsentRecording(initialData.consentMethods.verbalConsentRecording ?? false);
      setConsentLanguage(initialData.consentMethods.consentLanguage ?? "");
      setHasUnsavedChanges(false);
    }
  }, [initialData]);

  // Track changes
  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;

    const currentRef = (ref as React.MutableRefObject<DeliveryMethodsTabHandle | null>).current;
    const validation = currentRef?.validate();
    if (validation && !validation.valid) {
      // Validation errors will be handled by the parent
      return;
    }

    const currentValues = currentRef?.getValues();
    if (currentValues) {
      await onSave(currentValues);
      setHasUnsavedChanges(false);
    }
  };

  useImperativeHandle(ref, () => ({
    getValues: () => ({
      formatPreferences: {
        textMessageLink,
        voiceCall,
        qrCode,
        emailLink,
        inPersonTablet,
      },
      consentMethods: {
        digitalSignature,
        verbalConsentRecording,
        consentLanguage,
      },
    }),
    validate: () => {
      const errors: string[] = [];
      // Basic validation can be added here if needed
      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Enhanced Format Preferences Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-6">
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
                  disabled={isSaving || !hasUnsavedChanges}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="text-message-link" className="text-[#1c275e] font-medium">Text Message Link</Label>
              <IOSSwitch
                id="text-message-link"
                checked={textMessageLink}
                onCheckedChange={(checked) => {
                  setTextMessageLink(checked);
                  handleFieldChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="voice-call" className="text-[#1c275e] font-medium">Voice Call</Label>
              <IOSSwitch
                id="voice-call"
                checked={voiceCall}
                onCheckedChange={(checked) => {
                  setVoiceCall(checked);
                  handleFieldChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="qr-code" className="text-[#1c275e] font-medium">QR Code</Label>
              <IOSSwitch
                id="qr-code"
                checked={qrCode}
                onCheckedChange={(checked) => {
                  setQrCode(checked);
                  handleFieldChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="email-link" className="text-[#1c275e] font-medium">Email Link</Label>
              <IOSSwitch
                id="email-link"
                checked={emailLink}
                onCheckedChange={(checked) => {
                  setEmailLink(checked);
                  handleFieldChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="in-person-tablet" className="text-[#1c275e] font-medium">In-Person Tablet</Label>
              <IOSSwitch
                id="in-person-tablet"
                checked={inPersonTablet}
                onCheckedChange={(checked) => {
                  setInPersonTablet(checked);
                  handleFieldChange();
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Signature & Consent Capture Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-6">
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
                checked={digitalSignature}
                onCheckedChange={(checked) => {
                  setDigitalSignature(checked);
                  handleFieldChange();
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="verbal-consent" className="text-[#1c275e] font-medium">Verbal Consent Recording</Label>
              <IOSSwitch
                id="verbal-consent"
                checked={verbalConsentRecording}
                onCheckedChange={(checked) => {
                  setVerbalConsentRecording(checked);
                  handleFieldChange();
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consent-language" className="text-sm font-semibold text-[#1c275e]">Consent Text</Label>
              <Textarea
                id="consent-language"
                placeholder="Enter the consent text that will be shown to patients..."
                value={consentLanguage}
                onChange={(e) => {
                  setConsentLanguage(e.target.value);
                  handleFieldChange();
                }}
                className="min-h-24 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default DeliveryMethodsTab;
