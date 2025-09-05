// Launchpad API types and mapping utilities
import { api } from './api';

// API Response Types (snake_case from backend)
export interface LaunchpadApiResponse {
  success: boolean;
  data: {
    basicInfo: {
      primary_practice_name: string;
      alternative_names: string[];
    };
    locations: Array<{
      location_name: string;
      street_address: string;
      phone: string;
      city: string;
      state: string;
      zip: string;
    }>;
    providers: {
      providers: Array<{
        first_name: string;
        last_name: string;
        specialty: string;
        npi_number: string;
        clinic_locations: string[];
      }>;
      supported_language: string[];
    };
    hours: {
      is_scheduling_same_as_clinical: boolean;
      holidays: string;
      emergency_instructions: string;
      after_hours_instructions: string;
      clinic_hours: Record<string, string>;
      scheduling_hours: Record<string, string>;
    };
    metadata: {
      lastUpdated: string;
      workspaceId: number;
      userRole: string;
      canEdit: boolean;
    };
  };
}

// Frontend Types (camelCase)
export interface LaunchpadData {
  basicInfo: {
    practiceName: string;
    dbas: string[];
  };
  locations: Array<{
    locationName: string;
    streetAddress: string;
    phone: string;
    city: string;
    state: string;
    zip: string;
  }>;
  providers: {
    providers: Array<{
      firstName: string;
      lastName: string;
      specialty: string;
      npiNumber: string;
      clinicLocations: string[];
    }>;
    supportedLanguage: string[];
  };
  hours: {
    schedulingHoursDifferent: boolean;
    holidays: string[];
    emergencyInstructions: string;
    afterHoursInstructions: string;
    clinicHours: Record<string, string>;
    schedulingHours: Record<string, string>;
  };
  metadata: {
    lastUpdated: string;
    workspaceId: number;
    userRole: string;
    canEdit: boolean;
  };
}

// API Functions
export const fetchLaunchpadData = async (): Promise<LaunchpadData> => {
  const response = await api.post('/api/v1/launchpad/fetch-data', {});
  if (!response.success) {
    throw new Error('Failed to fetch launchpad data');
  }
  return mapApiResponseToFrontend(response);
};

// Mapping Functions
export const mapApiResponseToFrontend = (apiResponse: LaunchpadApiResponse): LaunchpadData => {
  return {
    basicInfo: {
      practiceName: apiResponse.data.basicInfo.primary_practice_name,
      dbas: apiResponse.data.basicInfo.alternative_names,
    },
    locations: apiResponse.data.locations.map(location => ({
      locationName: location.location_name,
      streetAddress: location.street_address,
      phone: location.phone,
      city: location.city,
      state: location.state,
      zip: location.zip,
    })),
    providers: {
      providers: apiResponse.data.providers.providers.map(provider => ({
        firstName: provider.first_name,
        lastName: provider.last_name,
        specialty: provider.specialty,
        npiNumber: provider.npi_number,
        clinicLocations: provider.clinic_locations,
      })),
      supportedLanguage: apiResponse.data.providers.supported_language,
    },
    hours: {
      schedulingHoursDifferent: !apiResponse.data.hours.is_scheduling_same_as_clinical,
      holidays: apiResponse.data.hours.holidays.split(', ').filter(h => h.trim() !== ''),
      emergencyInstructions: apiResponse.data.hours.emergency_instructions,
      afterHoursInstructions: apiResponse.data.hours.after_hours_instructions,
      clinicHours: apiResponse.data.hours.clinic_hours,
      schedulingHours: apiResponse.data.hours.scheduling_hours,
    },
    metadata: apiResponse.data.metadata,
  };
};

// Update payload mappers (for future use)
export const mapBasicInfoForUpdate = (practiceName: string, dbas: string[]) => ({
  data: {
    primaryPracticeName: practiceName,
    alternativeNames: dbas,
  },
});

export const mapLocationsForUpdate = (locations: LaunchpadData['locations']) => ({
  data: locations.map(location => ({
    location_name: location.locationName,
    street_address: location.streetAddress,
    phone: location.phone,
    city: location.city,
    state: location.state,
    zip: location.zip,
  })),
});

export const mapProvidersForUpdate = (providers: LaunchpadData['providers']) => ({
  data: {
    providers: providers.providers.map(provider => ({
      first_name: provider.firstName,
      last_name: provider.lastName,
      specialty: provider.specialty,
      npi_number: provider.npiNumber,
      clinic_locations: provider.clinicLocations,
    })),
    supported_language: providers.supportedLanguage,
  },
});

export const mapHoursForUpdate = (hours: LaunchpadData['hours']) => ({
  data: {
    is_scheduling_same_as_clinical: !hours.schedulingHoursDifferent,
    holidays: hours.holidays.join(', '),
    emergency_instructions: hours.emergencyInstructions,
    after_hours_instructions: hours.afterHoursInstructions,
    clinic_hours: hours.clinicHours,
    scheduling_hours: hours.schedulingHours,
  },
});

// Update API functions
export const updateBasicInfo = async (practiceName: string, dbas: string[]) => {
  const payload = mapBasicInfoForUpdate(practiceName, dbas);
  return await api.post('/api/v1/launchpad/update-basic-info', payload);
};

export const updateLocations = async (locations: LaunchpadData['locations']) => {
  const payload = mapLocationsForUpdate(locations);
  return await api.post('/api/v1/launchpad/update-locations', payload);
};

export const updateProviders = async (providers: LaunchpadData['providers']) => {
  const payload = mapProvidersForUpdate(providers);
  return await api.post('/api/v1/launchpad/update-providers', payload);
};

export const updateHours = async (hours: LaunchpadData['hours']) => {
  const payload = mapHoursForUpdate(hours);
  return await api.post('/api/v1/launchpad/update-hours', payload);
};
