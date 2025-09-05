import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Send, FileSignature } from "lucide-react";

/**
 * DeliveryMethodsTab
 * - Format preferences and signature/consent capture configuration
 * - Mirrors the launchpad tab styling and structure
 */
export type DeliveryMethodsTabHandle = {
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
  validate: () => { valid: boolean; errors: string[] };
};

const DeliveryMethodsTab = forwardRef<DeliveryMethodsTabHandle>((_props, ref) => {
  // Format Preferences state
  const [textMessageLink, setTextMessageLink] = React.useState(true);
  const [voiceCall, setVoiceCall] = React.useState(false);
  const [qrCode, setQrCode] = React.useState(true);
  const [emailLink, setEmailLink] = React.useState(true);
  const [inPersonTablet, setInPersonTablet] = React.useState(false);

  // Consent Methods state
  const [digitalSignature, setDigitalSignature] = React.useState(true);
  const [verbalConsentRecording, setVerbalConsentRecording] = React.useState(false);
  const [consentLanguage, setConsentLanguage] = React.useState("english");

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
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      {/* Format Preferences Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Format Preferences</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure how intake forms are delivered to patients</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="text-message-link" className="text-gray-900">Text Message Link</Label>
              <IOSSwitch
                id="text-message-link"
                checked={textMessageLink}
                onCheckedChange={setTextMessageLink}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="voice-call" className="text-gray-900">Voice Call</Label>
              <IOSSwitch
                id="voice-call"
                checked={voiceCall}
                onCheckedChange={setVoiceCall}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="qr-code" className="text-gray-900">QR Code</Label>
              <IOSSwitch
                id="qr-code"
                checked={qrCode}
                onCheckedChange={setQrCode}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-link" className="text-gray-900">Email Link</Label>
              <IOSSwitch
                id="email-link"
                checked={emailLink}
                onCheckedChange={setEmailLink}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="in-person-tablet" className="text-gray-900">In-Person Tablet</Label>
              <IOSSwitch
                id="in-person-tablet"
                checked={inPersonTablet}
                onCheckedChange={setInPersonTablet}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature & Consent Capture Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileSignature className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Signature & Consent Capture</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure signature and consent collections methods</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="digital-signature" className="text-gray-900">Digital Signature</Label>
              <IOSSwitch
                id="digital-signature"
                checked={digitalSignature}
                onCheckedChange={setDigitalSignature}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="verbal-consent" className="text-gray-900">Verbal Consent Recording</Label>
              <IOSSwitch
                id="verbal-consent"
                checked={verbalConsentRecording}
                onCheckedChange={setVerbalConsentRecording}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consent-language">Consent Language</Label>
              <Select value={consentLanguage} onValueChange={setConsentLanguage}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default DeliveryMethodsTab;
