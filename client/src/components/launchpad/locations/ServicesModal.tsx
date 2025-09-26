import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SpecialtyServiceEntry } from "@/components/launchpad/types";

interface ServicesModalProps {
  open: boolean;
  title: string;
  services: SpecialtyServiceEntry[];
  onUpdate: (services: SpecialtyServiceEntry[]) => void;
  onOpenChange: (open: boolean) => void;
}

export default function ServicesModal({ open, title, services, onUpdate, onOpenChange }: ServicesModalProps) {
  const [draftServices, setDraftServices] = React.useState<SpecialtyServiceEntry[]>(services);

  React.useEffect(() => {
    setDraftServices(services);
  }, [services]);

  const addService = () => {
    setDraftServices(prev => [...prev, {
      name: "",
      patient_prep_requirements: "",
      faq: "",
      service_information_name: null,
      service_information_source: null,
    }]);
  };

  const updateService = (index: number, field: keyof SpecialtyServiceEntry, value: string) => {
    setDraftServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value || null } : service
    ));
  };

  const removeService = (index: number) => {
    setDraftServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validServices = draftServices.filter(service => service.name.trim() !== "");
    onUpdate(validServices);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1C275E]">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {draftServices.map((service, index) => (
            <Card key={index} className="border-2 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-[#1C275E]">
                    Service {index + 1}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => removeService(index)}
                  >
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service Name */}
                <div className="space-y-2">
                  <Label className="text-base font-medium text-black">Service Name *</Label>
                  <Input 
                    placeholder="Enter service name" 
                    value={service.name} 
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#1C275E]"
                  />
                </div>

                <Separator />

                {/* Patient Prep Requirements */}
                <div className="space-y-2">
                  <Label className="text-base font-medium text-black">Patient Preparation Requirements</Label>
                  <Textarea 
                    placeholder="Enter patient preparation requirements..."
                    value={service.patient_prep_requirements || ""}
                    onChange={(e) => updateService(index, 'patient_prep_requirements', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#1C275E] min-h-[80px]"
                  />
                </div>

                {/* FAQ */}
                <div className="space-y-2">
                  <Label className="text-base font-medium text-black">Frequently Asked Questions</Label>
                  <Textarea 
                    placeholder="Enter frequently asked questions and answers..."
                    value={service.faq || ""}
                    onChange={(e) => updateService(index, 'faq', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#1C275E] min-h-[80px]"
                  />
                </div>

                {/* Service Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-black">Service Information Name</Label>
                    <Input 
                      placeholder="Enter information source name"
                      value={service.service_information_name || ""}
                      onChange={(e) => updateService(index, 'service_information_name', e.target.value)}
                      className="border-2 border-gray-200 focus:border-[#1C275E]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-black">Service Information Source</Label>
                    <Input 
                      placeholder="Enter information source"
                      value={service.service_information_source || ""}
                      onChange={(e) => updateService(index, 'service_information_source', e.target.value)}
                      className="border-2 border-gray-200 focus:border-[#1C275E]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {draftServices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No services added yet.</p>
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="default" 
              onClick={addService} 
              className="bg-[#F48024] hover:bg-[#F48024]/90 text-white"
            >
              Add Service
            </Button>
            <Button 
              variant="default" 
              onClick={handleSave} 
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Save Services
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}