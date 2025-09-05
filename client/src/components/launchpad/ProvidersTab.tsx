import React, { useState, useImperativeHandle, useEffect, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Plus, X } from "lucide-react";

interface ProviderDetails {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  npiNumber: string;
  clinicLocations: string[];
}

interface ProvidersTabProps {
  initialProviders?: Array<{
    firstName: string;
    lastName: string;
    specialty: string;
    npiNumber: string;
    clinicLocations: string[];
  }>;
  locationOptions?: string[];
}

/**
 * ProvidersTab
 * - Provider roster with dynamic location options from fetched locations
 * - Hydrates from props on mount, maintains local state for edits
 */
export type ProvidersTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => ProviderDetails[];
  /**
   * Validates that all required fields are filled for all providers.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const ProvidersTab = forwardRef<ProvidersTabHandle, ProvidersTabProps>((props, ref) => {
  const [providers, setProviders] = useState<ProviderDetails[]>([]);

  // Seed local state from props on mount
  useEffect(() => {
    if (props.initialProviders && props.initialProviders.length > 0) {
      const seededProviders: ProviderDetails[] = props.initialProviders.map((provider, index) => ({
        id: `provider-${index + 1}`,
        firstName: provider.firstName,
        lastName: provider.lastName,
        specialty: provider.specialty,
        npiNumber: provider.npiNumber,
        clinicLocations: provider.clinicLocations,
      }));
      setProviders(seededProviders);
    } else {
      // Start with empty state if no initial data
      setProviders([]);
    }
  }, [props.initialProviders]);

  const addProvider = () => {
    const newProvider: ProviderDetails = {
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
      specialty: "",
      npiNumber: "",
      clinicLocations: []
    };
    setProviders(prev => [...prev, newProvider]);
  };

  const updateProvider = (id: string, field: keyof Omit<ProviderDetails, 'id' | 'clinicLocations'>, value: string) => {
    setProviders(prev => prev.map(provider =>
      provider.id === id ? { ...provider, [field]: value } : provider
    ));
  };

  const toggleClinicLocation = (providerId: string, location: string) => {
    setProviders(prev => prev.map(provider => {
      if (provider.id === providerId) {
        const locations = provider.clinicLocations.includes(location)
          ? provider.clinicLocations.filter(loc => loc !== location)
          : [...provider.clinicLocations, location];
        return { ...provider, clinicLocations: locations };
      }
      return provider;
    }));
  };

  const removeProvider = (id: string) => {
    setProviders(prev => prev.filter(provider => provider.id !== id));
  };

  // Validation: all fields must be filled for all providers
  const validate = () => {
    const errors: string[] = [];

    providers.forEach((provider, index) => {
      const providerName = provider.firstName && provider.lastName
        ? `${provider.firstName} ${provider.lastName}`
        : `Provider ${index + 1}`;

      if (!provider.firstName.trim()) errors.push(`${providerName}: First Name required`);
      if (!provider.lastName.trim()) errors.push(`${providerName}: Last Name required`);
      if (!provider.specialty.trim()) errors.push(`${providerName}: Specialty required`);
      if (!provider.npiNumber.trim()) errors.push(`${providerName}: NPI Number required`);
      if (provider.clinicLocations.length === 0) errors.push(`${providerName}: At least one clinic location required`);
    });

    return { valid: errors.length === 0, errors };
  };

  // Expose validation to parent component
  useImperativeHandle(ref, () => ({
    getValues: () => providers,
    validate,
  }));

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        {/* Section title row with icon to match the Basic Info style */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4" />
          <h2 className="text-xl font-semibold text-gray-900">Provider Roster</h2>
        </div>

        {/* Add Provider button */}
        <div className="space-y-4">
          <Button type="button" className="h-10" onClick={addProvider}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>

          {/* Provider Cards - render all providers */}
          {providers.map((provider, index) => (
            <Card key={provider.id} className="mt-4 border-gray-300 bg-gray-50">
              <CardContent className="p-4 relative">
                {/* Provider heading and X button on the same line */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {provider.firstName && provider.lastName
                      ? `${provider.firstName} ${provider.lastName}`
                      : `Provider ${index + 1}`}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white border-red-500"
                    onClick={() => removeProvider(provider.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* First row: First Name and Last Name (side by side) */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-2">
                    <Label htmlFor={`first-name-${provider.id}`}>First Name</Label>
                    <Input
                      id={`first-name-${provider.id}`}
                      placeholder="First Name"
                      value={provider.firstName}
                      onChange={(e) => updateProvider(provider.id, 'firstName', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`last-name-${provider.id}`}>Last Name</Label>
                    <Input
                      id={`last-name-${provider.id}`}
                      placeholder="Last Name"
                      value={provider.lastName}
                      onChange={(e) => updateProvider(provider.id, 'lastName', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Second row: Specialty and NPI Number (side by side) */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-2">
                    <Label htmlFor={`specialty-${provider.id}`}>Specialty</Label>
                    <Input
                      id={`specialty-${provider.id}`}
                      placeholder="Specialty"
                      value={provider.specialty}
                      onChange={(e) => updateProvider(provider.id, 'specialty', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`npi-${provider.id}`}>NPI Number</Label>
                    <Input
                      id={`npi-${provider.id}`}
                      placeholder="NPI Number"
                      value={provider.npiNumber}
                      onChange={(e) => updateProvider(provider.id, 'npiNumber', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Third row: Clinic Location selection */}
                <div className="space-y-3">
                  <Label className="text-gray-900">Clinic Location:</Label>
                  <div className="flex flex-wrap gap-2">
                    {(props.locationOptions || []).map((location) => {
                      const isSelected = provider.clinicLocations.includes(location);
                      return (
                        <Button
                          key={location}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`h-8 ${
                            isSelected
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => toggleClinicLocation(provider.id, location)}
                        >
                          {location}
                        </Button>
                      );
                    })}
                  </div>
                  {(props.locationOptions || []).length === 0 && (
                    <p className="text-sm text-gray-500">Add locations in the Locations tab to assign providers</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default ProvidersTab;

