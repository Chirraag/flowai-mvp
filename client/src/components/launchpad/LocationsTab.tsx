import React, { useState, useImperativeHandle, useEffect, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, X } from "lucide-react";

interface LocationDetails {
  id: string;
  name: string;
  streetAddress: string;
  phone: string;
  city: string;
  state: string;
  zip: string;
}

interface LocationsTabProps {
  initialLocations?: Array<{
    locationName: string;
    streetAddress: string;
    phone: string;
    city: string;
    state: string;
    zip: string;
  }>;
}

/**
 * LocationsTab
 * - Multi-location support with individual cards for each location
 * - Hydrates from props on mount, maintains local state for edits
 */
export type LocationsTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => LocationDetails[];
  /**
   * Validates that all required fields are filled for all locations.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const LocationsTab = forwardRef<LocationsTabHandle, LocationsTabProps>((props, ref) => {
  const [locations, setLocations] = useState<LocationDetails[]>([]);

  // Seed local state from props on mount
  useEffect(() => {
    if (props.initialLocations && props.initialLocations.length > 0) {
      const seededLocations: LocationDetails[] = props.initialLocations.map((loc, index) => ({
        id: `location-${index + 1}`,
        name: loc.locationName,
        streetAddress: loc.streetAddress,
        phone: loc.phone,
        city: loc.city,
        state: loc.state,
        zip: loc.zip,
      }));
      setLocations(seededLocations);
    } else {
      // Default empty location if no initial data
      setLocations([
        { id: "location-1", name: "", streetAddress: "", phone: "", city: "", state: "", zip: "" }
      ]);
    }
  }, [props.initialLocations]);

  const addLocation = () => {
    const newLocation: LocationDetails = {
      id: `location-${Date.now()}`,
      name: "",
      streetAddress: "",
      phone: "",
      city: "",
      state: "",
      zip: "",
    };
    setLocations(prev => [...prev, newLocation]);
  };

  const updateLocationName = (id: string, value: string) => {
    setLocations((prev) => prev.map((location) =>
      location.id === id ? { ...location, name: value } : location
    ));
  };

  const updateLocationField = (id: string, field: keyof Omit<LocationDetails, 'id' | 'name'>, value: string) => {
    setLocations((prev) => prev.map((location) =>
      location.id === id ? { ...location, [field]: value } : location
    ));
  };

  const removeLocation = (id: string) => {
    if (locations.length > 1) {
      setLocations((prev) => prev.filter((location) => location.id !== id));
    }
  };

  // Validation: all required fields must be filled for all locations
  const validate = () => {
    const errors: string[] = [];

    locations.forEach((location, index) => {
      const locationName = location.name.trim() || `Location ${index + 1}`;

      if (!location.streetAddress.trim()) {
        errors.push(`${locationName}: Street Address required`);
      }
      if (!location.phone.trim()) {
        errors.push(`${locationName}: Phone required`);
      }
      if (!location.city.trim()) {
        errors.push(`${locationName}: City required`);
      }
      if (!location.state.trim()) {
        errors.push(`${locationName}: State required`);
      }
      if (!location.zip.trim()) {
        errors.push(`${locationName}: Zip required`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  // Expose validation to parent component
  useImperativeHandle(ref, () => ({
    getValues: () => locations,
    validate,
  }));

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        {/* Section title row with icon to match the Basic Info style */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4" />
          <h2 className="text-xl font-semibold text-gray-900">Practice Locations</h2>
        </div>

        {/* Add Location button */}
        <div className="space-y-4">
          <Button type="button" className="h-10" onClick={addLocation}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>

          {/* Location Cards - render one card per location */}
          {locations.map((location, index) => (
            <Card key={location.id} className="border-gray-300 bg-gray-50">
              <CardContent className="p-4 relative">
                {/* Location heading and X button on the same line */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {location.name.trim() || `Location ${index + 1}`}
                  </h3>
                  {locations.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white border-red-500"
                      onClick={() => removeLocation(location.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Location Name field inside the card */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor={`location-name-${location.id}`}>Location Name</Label>
                  <Input
                    id={`location-name-${location.id}`}
                    placeholder="Enter location name"
                    value={location.name}
                    onChange={(e) => updateLocationName(location.id, e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* First row: Street Address and Phone (equal width) */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-2">
                    <Label htmlFor={`street-address-${location.id}`}>Street Address</Label>
                    <Input
                      id={`street-address-${location.id}`}
                      placeholder="Street Address"
                      value={location.streetAddress}
                      onChange={(e) => updateLocationField(location.id, 'streetAddress', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`phone-${location.id}`}>Phone</Label>
                    <Input
                      id={`phone-${location.id}`}
                      placeholder="Phone"
                      value={location.phone}
                      onChange={(e) => updateLocationField(location.id, 'phone', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Second row: City (bigger), State and Zip (same width) */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="space-y-2 col-span-3">
                    <Label htmlFor={`city-${location.id}`}>City</Label>
                    <Input
                      id={`city-${location.id}`}
                      placeholder="City"
                      value={location.city}
                      onChange={(e) => updateLocationField(location.id, 'city', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor={`state-${location.id}`}>State</Label>
                    <Input
                      id={`state-${location.id}`}
                      placeholder="State"
                      value={location.state}
                      onChange={(e) => updateLocationField(location.id, 'state', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor={`zip-${location.id}`}>Zip</Label>
                    <Input
                      id={`zip-${location.id}`}
                      placeholder="Zip"
                      value={location.zip}
                      onChange={(e) => updateLocationField(location.id, 'zip', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default LocationsTab;


