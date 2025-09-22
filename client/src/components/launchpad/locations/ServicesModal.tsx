import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ServicesModalProps {
  open: boolean;
  title: string;
  services: string[];
  onUpdate: (services: string[]) => void;
  onOpenChange: (open: boolean) => void;
}

export default function ServicesModal({ open, title, services, onUpdate, onOpenChange }: ServicesModalProps) {
  const [draftServices, setDraftServices] = React.useState<string[]>(services);

  React.useEffect(() => {
    setDraftServices(services);
  }, [services]);

  const addService = () => setDraftServices(prev => [...prev, ""]);
  const updateService = (index: number, value: string) => setDraftServices(prev => prev.map((s, i) => (i === index ? value : s)));
  const removeService = (index: number) => setDraftServices(prev => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    onUpdate(draftServices.filter(s => s.trim()))
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {draftServices.map((service, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input placeholder="Enter service name" value={service} onChange={(e) => updateService(index, e.target.value)} />
              <Button variant="default" size="sm" className="bg-white text-black border border-black hover:bg-gray-50" onClick={() => removeService(index)}>Remove</Button>
            </div>
          ))}
          {draftServices.length === 0 && (
            <p className="text-sm text-muted-foreground">No services added yet.</p>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="default" onClick={addService} className="bg-[#F48024] hover:bg-[#F48024]/90 text-white">Add Service</Button>
            <Button variant="default" onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


