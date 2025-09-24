Objectives
Add a typed API call to POST /api/v1/launchpad/{orgId}/fetch-data and surface the returned slices to the new tabs: Account details, Locations, Specialties, Insurance, Curated knowledge, with the page-level component as the single source of truth for both tabs sharing locations data.

Note: The repo already contains client/src/lib/api.ts and client/src/lib/launchpad.ts with legacy shapes. We will replace the contents of client/src/lib/launchpad.ts with a new implementation compatible with the new API response. We'll continue to use client/src/lib/api.ts as the HTTP wrapper.

Normalize locations by the external code field location_id, and resolve specialties[].location_ids (codes) to the actual locations list, handling missing references gracefully in the Specialties selector and labels.

Understand the data contract and mismatch
Locations array returns each location with both a UUID id and a business code location_id (e.g., “LOC001”), while specialties specialities_services[].location_ids is an array of location codes, not UUIDs; therefore, build lookups keyed by location.location_id, not id, to resolve references and populate the Specialties tab dropdown.

The DB schema explicitly models org_locations with a location_id column and org_speciality_services with location_ids as an array of identifiers, validating that code-based matching is the intended join across these slices for Launchpad data.

1) Add types for the fetch-data response
Create client/src/lib/launchpad.types.ts with interfaces for Organization, AccountDetails, Location, SpecialtyService, Insurance, and LaunchpadFetchData matching the new payload. These represent API-level types (snake_case fields), while UI types remain in client/src/components/launchpad/types.ts.

Include a forward-compatible optional curated_knowledge?: unknown field, rendering an empty state if absent, since the new UI has a Curated knowledge tab but the API may introduce this slice later.

Example (snippets):

ts
export interface Location {
  id: string;          // UUID
  org_id: number;
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string; state: string; zip_code: string;
  weekday_hours: string | null; weekend_hours: string | null;
  location_id: string; // business code used by specialties[].location_ids
  specialties_services: { speciality_name: string; services: string[] }[];
  parking_directions: string | null;
  documents: unknown[]; is_active: boolean;
  created_at: string; updated_at: string;
}

export interface SpecialtyService {
  id: string;
  org_id: number;
  specialty_name: string;
  location_ids: string[]; // codes like "LOC001"
  services: {
    name: string;
    faq: string | null;
    service_information_name: string | null;
    patient_prep_requirements: string | null;
    service_information_source: string | null;
  }[];
  // ...additional *_source_* fields
  documents: unknown[]; is_active: boolean;
  created_at: string; updated_at: string;
}

export interface LaunchpadFetchData {
  organization: Organization;
  account_details: AccountDetails | null;
  locations: Location[];
  speciality_services: SpecialtyService[];
  insurance: Insurance | null;
  curated_knowledge?: unknown;
  metadata: { last_updated: string; org_id: number; user_role: string };
}
2) Add the API function
Replace the existing client/src/lib/launchpad.ts content with a new implementation that exports fetchLaunchpadData(orgId). It will POST to /api/v1/launchpad/{orgId}/fetch-data with an empty body, and return the typed payload on success, using the shared api wrapper (client/src/lib/api.ts) for Authorization and 401 refresh handling.

ts
// client/src/lib/launchpad.ts
import { api } from './api';
import type { LaunchpadFetchData } from './launchpad.types';

export const fetchLaunchpadData = async (orgId: number): Promise<LaunchpadFetchData> => {
  const res = await api.post<{ success: boolean; data: LaunchpadFetchData }>(
    `/api/v1/launchpad/${orgId}/fetch-data`,
    {}
  );
  if (!res?.data?.success) throw new Error('Failed to fetch Launchpad data');
  return res.data.data;
};
3) Add a React Query hook
Create useLaunchpadData(orgId) to fetch and cache the snapshot with a keyed query; set a reasonable staleTime and retries, and enable only when orgId exists (from AuthContext), matching the app’s existing data fetching patterns.

ts
// client/src/lib/launchpad.queries.ts
import { useQuery } from '@tanstack/react-query';
import { fetchLaunchpadData } from './launchpad';

export const useLaunchpadData = (orgId?: number) =>
  useQuery({
    queryKey: ['launchpad', String(orgId ?? '')],
    queryFn: () => {
      if (!orgId) throw new Error('Missing orgId');
      return fetchLaunchpadData(orgId);
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
4) Normalize and share locations across tabs
Build two memoized selectors in a small helper module to resolve references and provide dropdown options consistently for both tabs, with a map keyed by location.location_id and a flat options list for UI picks.

ts
// client/src/lib/launchpad.selectors.ts
import type { LaunchpadFetchData, Location, SpecialtyService } from './launchpad.types';

export const makeLocationCodeMap = (locations: Location[]) =>
  new Map(locations.map((loc) => [loc.location_id, loc])); // key by code

export const makeLocationOptions = (locations: Location[]) =>
  locations.map((loc) => ({ value: loc.location_id, label: `${loc.name} (${loc.location_id})` }));

export const resolveSpecialtyLocations = (
  specialty: SpecialtyService,
  codeMap: Map<string, Location>
) => {
  const resolved = specialty.location_ids
    .map((code) => codeMap.get(code))
    .filter(Boolean) as Location[];
  const unresolved = specialty.location_ids.filter((code) => !codeMap.has(code));
  return { resolved, unresolved };
};
5) Wire the Launchpad page and pass props
In client/src/pages/launchpad/index.tsx (current file), derive orgId from AuthContext’s user.org_id (if only workspaceId exists, treat workspaceId as orgId; our auth/login response includes org_id), call useLaunchpadData, memoize the location code map and options, and pass the slices to each tab, making the page the shared data source for both the Locations and Specialties tabs to avoid duplicate fetches and mismatched state.

tsx
const { user } = useAuth();
const orgId = user?.org_id;
const { data, isLoading, isError } = useLaunchpadData(orgId);

const locationCodeMap = useMemo(
  () => (data ? makeLocationCodeMap(data.locations) : new Map()),
  [data]
);
const locationOptions = useMemo(
  () => (data ? makeLocationOptions(data.locations) : []),
  [data]
);

// Pass to tabs
<LocationsTab locations={data.locations} />
<SpecialtiesTab
  specialties={data.speciality_services}
  locations={data.locations}
  locationOptions={locationOptions}
  locationCodeMap={locationCodeMap}
/>
6) Locations tab: display and add entries
Render a list/table of locations using data.locations, showing name, address, hours, and the business code location_id, which becomes the authoritative value for cross-tab references and for any multi-select UI in Specialties.

When adding a new location client-side (before updates are wired), create a temporary local structure in component state; once update APIs are introduced, persist and re-invalidate the ['launchpad', orgId] query to round-trip and rehydrate the list.

Snippet:

tsx
// props: { locations: Location[] }
{locations.map((loc) => (
  <li key={loc.id}>
    <div>{loc.name} — {loc.city}, {loc.state} {loc.zip_code}</div>
    <div>Code: {loc.location_id}</div>
    <div>Hours: {loc.weekday_hours} / {loc.weekend_hours}</div>
  </li>
))}
7) Specialties tab: select multiple locations by name (stores codes)
Drive the selection UI from locations (value = location_id; label = name + code). The current UI uses a checkbox list for multi-select; keep storing specialty.location_ids as codes. This avoids confusion with UUIDs and guarantees compatibility with the API.

For each specialty row, resolve resolved/unresolved via resolveSpecialtyLocations to show which codes currently match known locations; display unresolved codes as warning chips and provide an “Add Location” CTA that navigates to Locations tab or opens a modal to create a missing location, then re-resolves on save.

Snippet:

tsx
// props: { specialties, locationOptions, locationCodeMap }
specialties.map((sp) => {
  const { resolved, unresolved } = resolveSpecialtyLocations(sp, locationCodeMap);
  return (
    <div key={sp.id} className="border p-3 rounded">
      <div className="font-medium">{sp.specialty_name}</div>
      <MultiSelect
        value={sp.location_ids} // codes
        options={locationOptions} // { value: code, label: "... (LOCxxx)" }
        onChange={(codes) => {/* update local state now; persist later */}}
      />
      {unresolved.length > 0 && (
        <div className="text-amber-600 text-sm">
          Unresolved codes: {unresolved.join(', ')}
          <button onClick={() => /* open add location modal */ null} className="ml-2 underline">Add location</button>
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        Resolved: {resolved.map((l) => l.name).join(', ') || 'None'}
      </div>
    </div>
  );
});
8) Handle the mismatch safely (unknown codes)
Never crash on unknown codes: show a non-blocking banner in Specialties explaining that some specialty locations reference codes not present in Locations and that adding the missing locations will resolve the references; this keeps the UI usable even when data is partially configured.

If a user selects new locations from the selector, merge and de-duplicate onChange via Set semantics and enforce code uniqueness in the local array to avoid UI duplication before server updates are enabled.

9) Loading, errors, and auth
Render a page-level skeleton, then tab-level skeletons while data loads; if an auth refresh occurs during fetch, rely on the existing api wrapper’s 401 handling and surface a “Retry” button on hard failure that invalidates the query key to refetch.

Sanity guard: if data.organization.org_id !== user.org_id (or workspaceId if used as fallback), log and show an error state, because cross-tenant leakage should fail closed in the UI as a defense-in-depth check.

10) Caching and invalidation
Keep staleTime around 5 minutes for read flows; when update APIs are added, always invalidate ['launchpad', orgId] after saves to rehydrate a canonical snapshot and keep Locations/Specialties synchronized from server truth rather than merging client-local edits.

Clear the cache on logout and on workspace/org switch to avoid showing stale data across tenants, leveraging the existing QueryClient reset paths in the app shell.


TODO list:

Todo list for API integration (based on planfornewapi.md)
Types and API shape
Create client/src/lib/launchpad.types.ts with API-level types for Location, SpecialtyService, AccountDetails, Insurance, LaunchpadFetchData.
Keep UI types in client/src/components/launchpad/types.ts.
HTTP client and base URL
Configure client/src/lib/api.ts to use import.meta.env.VITE_API_BASE_URL and default to https://api.myflowai.com if unset.
Verify token/refresh flow remains compatible with POST .../fetch-data.
Replace legacy launchpad API module
Overwrite client/src/lib/launchpad.ts to export only new functions:
fetchLaunchpadData(orgId: number): Promise<LaunchpadFetchData>
Remove legacy basicInfo/providers/hours mappers from this file (no write APIs in this phase).
React Query hook
Add client/src/lib/launchpad.queries.ts:
useLaunchpadData(orgId?: number) using TanStack Query v5.
enabled: !!orgId, staleTime: 5m, retry: 2.
Selectors/utilities
Add client/src/lib/launchpad.selectors.ts:
makeLocationCodeMap(locations) → Map<location_id, Location>
makeLocationOptions(locations) → { value: location_id, label: “name (code)” }[]
resolveSpecialtyLocations(specialty, codeMap) → { resolved: Location[], unresolved: string[] }
Auth orgId source
Update client/src/context/AuthContext.tsx User type to include org_id from login/validate response.
In places that used workspaceId as orgId, switch to user.org_id (fallback to workspaceId only if needed).
Wire into Launchpad page
In client/src/pages/launchpad/index.tsx:
Derive orgId from useAuth().user.org_id.
Call useLaunchpadData(orgId).
On success, map API data to UI state with thin transforms:
Locations: set locations using API fields; default nulls to empty strings; preserve location_id.
Specialties: set specialties; keep location_ids as codes; hydrate services and source fields; default nulls.
Insurance: set insurance and link/detail/source fields; default nulls.
Account: set overview/org structure/opportunity sizing/team reporting/systems fields as available.
Keep the page as the single source of truth and pass locations to both Locations and Specialties modules.
Specialties locations selection
Ensure SpecialtiesModule receives locations from page (already added) and keeps location_ids as codes.
Keep checkbox multi-select UI; labels show name (location_id); store codes.
Loading and error UX
Show page-level loading placeholders while fetching.
On error, use NetworkError with retry that re-triggers the query.
Data integrity and mismatch handling
Use resolveSpecialtyLocations to compute unresolved codes; surface non-blocking notice in Specialties when present.
Ensure deduplication when adding location codes (Set semantics).
Env/config and security
Add .env support for VITE_API_BASE_URL; document fallback.
Confirm all requests include Authorization and honor refresh flow.
QA checklist (post-implementation)
Fetch succeeds and hydrates all tabs without runtime errors.
Specialties shows location names, stores codes, handles unresolved gracefully.
Locations and Specialties stay in sync (same locations slice).
No legacy mappers referenced; no unused legacy fields in client/src/lib/launchpad.ts.
Org guard: if data.organization.org_id !== user.org_id, show safe error state.
Follow-ups (later phases)
Add write/update APIs and invalidations.
Add unit tests for selectors and transforms.
Add per-field validation before save.