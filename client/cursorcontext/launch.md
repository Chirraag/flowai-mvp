Launchpad Page Architecture Analysis
Overview
The Launchpad page (client/src/pages/launchpad/index.tsx) is a React-based, tabbed interface for configuring organizational data (e.g., account details, locations, specialties, insurance, and knowledge base). It follows a modular architecture with centralized state management, API integration via React Query, and component-based rendering. Data flows from API fetch → local state hydration → user edits → validation/mapping → API updates → cache invalidation. It emphasizes validation, error handling, and user feedback (e.g., toasts, loading states). The page is responsive and includes features like document uploads, modals, and cross-tab dependencies (e.g., locations affecting specialties).
Key Components and Structure
Main File: client/src/pages/launchpad/index.tsx (948 lines) – Orchestrates state, hooks, and tab rendering.
API Layer: client/src/lib/launchpad.api.ts – Provides React Query hooks for fetching and updating data, with caching and retry logic.
Types: client/src/lib/launchpad.types.ts – Defines TypeScript interfaces for API requests/responses and UI models.
Utilities: client/src/lib/launchpad.utils.ts – Includes validation, mapping, selectors, and document helpers.
Components: Modular sub-components (e.g., AccountOverviewCard.tsx, LocationsModule.tsx) handle specific UI sections and pass updates to the parent via callbacks.
Dependencies: Uses React Query for data management, UI components from a design system (e.g., shadcn/ui), and hooks for auth (useAuth) and toasts (useToast).
Tabs and Functionality
Account Tab:
Content: Account overview, decision makers/influencers, team reporting, sizes, opportunity sizing, systems integration (EMR/telephony/phone numbers), and documents.
Components: AccountOverviewCard, DecisionMakersCard, TeamReportingSection, TeamSizesCard, OpportunitySizingCard, SystemsIntegrationCard, DocumentUpload.
State: Local arrays/objects for people, systems, and fields (e.g., decisionMakers, emrSystems).
Validation: validateAccountData checks required fields and formats.
Documents: Upload/delete via useUploadAccountDocument and useDeleteAccountDocument.
Locations Tab:
Content: CRUD for locations (addresses, hours, specialties/services, parking).
Components: LocationsModule, LocationCard, ServicesModal.
State: Array of OrgLocation objects with nested specialties.
Validation: validateLocationsData ensures unique location IDs and required fields.
Documents: Upload/delete via useUploadLocationsDocument and useDeleteLocationsDocument.
Special Features: Services modal for editing specialty services per location.
Specialties Tab:
Content: CRUD for specialties (name, locations, services, sources for prep/FAQs).
Components: SpecialtiesModule.
State: Array of OrgSpecialityService objects with location associations.
Validation: validateSpecialtiesData checks for duplicates, location validity, and required fields.
Documents: Upload/delete via useUploadSpecialtiesDocument and useDeleteSpecialtiesDocument.
Special Features: Location code resolution with warnings for missing codes; links to Locations tab for fixes.
Insurance Tab:
Content: Insurance settings (payers, verification, copay sources).
Components: InsuranceModule.
State: OrgInsurance object.
Validation: validateInsuranceData (minimal, mostly format checks).
Documents: Upload/delete via useUploadInsuranceDocument and useDeleteInsuranceDocument.
Knowledge Tab:
Content: Curated knowledge base generation and management.
Components: KnowledgeModule.
State: None local; relies on API data.
Features: Generate/delete KB via useCreateCuratedKB and useDeleteCuratedKB; displays count and documents.
API Calls
Fetch Data:
Endpoint: POST /api/v1/launchpad/${orgId}/fetch-data
Function: fetchLaunchpadData (raw API) and useLaunchpadData (hook).
Details: Returns LaunchpadFetchData (organization, account, locations, specialties, insurance, metadata). Cached with 5-min stale time, 2 retries. Enabled only if orgId is valid.
Usage: Hydrates all tabs' state on page load or refetch.
Update Operations:
Account: updateAccountDetails → POST /api/v1/launchpad/${orgId}/update-account-details (payload: UpdateAccountDetailsRequest). Hook: useUpdateAccountDetails. Invalidates cache on success.
Locations: updateLocations → POST /api/v1/launchpad/${orgId}/update-locations (payload: UpdateLocationsRequest). Hook: useUpdateLocations. May chain to update specialties if location codes change.
Specialties: updateSpecialties → POST /api/v1/launchpad/${orgId}/update-specialties (payload: UpdateSpecialtiesRequest). Hook: useUpdateSpecialties. Handles location code changes automatically.
Insurance: updateInsurance → POST /api/v1/launchpad/${orgId}/update-insurance (payload: UpdateInsuranceRequest). Hook: useUpdateInsurance.
Knowledge: createCuratedKB → POST /api/v1/launchpad/${orgId}/create-curated-kb; deleteCuratedKB → POST /api/v1/launchpad/${orgId}/delete-curated-kb.
Documents:
Upload: uploadAccountDocument, etc. → POST /api/v1/launchpad/${orgId}/[tab]/upload-document (FormData). Hooks: useUpload[Tab]Document.
Delete: deleteAccountDocument, etc. → POST /api/v1/launchpad/${orgId}/[tab]/delete-document (payload: { url }). Hooks: useDelete[Tab]Document.
Details: All use FormData for uploads; invalidate cache on success.
Error Handling and Optimizations:
Validation: Pre-save checks with validate* functions; errors shown via toasts and UI.
Caching: React Query with invalidation (e.g., on updates) and debounced helpers.
Authentication: Org ID extraction from auth context or JWT; guards against mismatches.
Loading/Retries: Built into hooks; UI shows loaders and retry buttons.
Key Interactions and Best Practices
Cross-Tab Dependencies: Locations/specialties sync via code changes (e.g., applyLocationCodeRenamesToSpecialties).
Modularity: Components are reusable and prop-driven; state lifted to parent.
Performance: Efficient rendering with memoized selectors and scoped queries.
Security/Edge Cases: Input validation, error boundaries implied via try-catch and toasts; handles auth loading and org mismatches.
Extensibility: Easy to add new tabs or fields by extending types and components.