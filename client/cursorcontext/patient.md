API response format for patient:Patient Intake Agent

chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  'https://api.myflowai.com/api/v1/patient-intake-agent/3/field-requirements' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg' \
  -H 'Content-Type: application/json' \
  -d '{
    "field_requirements": {
      "patient_name": "required",
      "date_of_birth": "required",
      "phone_number": "required",
      "email": "optional",
      "insurance_id": "required",
      "emergency_contact": "optional",
      "preferred_language": "optional"
    },
    "special_instructions": {
      "minors_instructions": "Parent or guardian must complete the form for patients under 18",
      "no_insurance_instructions": "Self-pay options available. Please ask about our payment plans",
      "language_barrier_instructions": "Interpreter services available in Spanish, Mandarin, and ASL"
    }
  }'
{"success":true,"message":"Field requirements and special instructions updated successfully","data":{"id":"434c32f5-35e7-4e62-a761-adb01f6ce83e","field_requirements":{"email":"optional","insurance_id":"required","patient_name":"required","phone_number":"required","date_of_birth":"required","emergency_contact":"optional","preferred_language":"optional"},"special_instructions":{"minors_instructions":"Parent or guardian must complete the form for patients under 18","no_insurance_instructions":"Self-pay options available. Please ask about our payment plans","language_barrier_instructions":"Interpreter services available in Spanish, Mandarin, and ASL"},"updated_at":"2025-09-18T03:21:15.942Z","current_version":1}}%                                                                                                  chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X GET \
  'https://api.myflowai.com/api/v1/patient-intake-agent/3' \                   
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg' \
  -H 'Content-Type: application/json'  
{"success":true,"data":{"id":"434c32f5-35e7-4e62-a761-adb01f6ce83e","org_id":3,"agent_id":"","agent_name":"Patient Intake Assistant","language":"en-US","voice":"alloy","agent_instructions":"You are a friendly patient intake assistant","human_transfer_criteria":"Transfer if patient requests or shows frustration","intake_forms":[],"modality_forms":[],"custom_forms":[],"field_requirements":{"email":"optional","insurance_id":"required","patient_name":"required","phone_number":"required","date_of_birth":"required","emergency_contact":"optional","preferred_language":"optional"},"special_instructions":{"minors_instructions":"Parent or guardian must complete the form for patients under 18","no_insurance_instructions":"Self-pay options available. Please ask about our payment plans","language_barrier_instructions":"Interpreter services available in Spanish, Mandarin, and ASL"},"delivery_methods":{},"signature_consent":{},"workflows":[],"current_version":1,"is_active":true,"created_at":"2025-09-18T08:45:30.872Z","updated_at":"2025-09-18T03:21:15.942Z"}}%                                                                                                                                                                     chiraggupta@Chirags-MacBook-Pro ~ % 






chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  'https://api.myflowai.com/api/v1/patient-intake-agent/3/delivery-methods' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg' \
  -H 'Content-Type: application/json' \
  -d '{
    "delivery_methods": {
      "text_message_link": true,
      "voice_call": true,
      "qr_code": true,
      "email_link": true,
      "in_person_tablet": false
    },
    "signature_consent": {
      "digital_signature": true,
      "verbal_consent_recording": true,
      "consent_language": "I consent to the treatment and procedures described",
      "consent_languages_available": ["English", "Spanish", "Mandarin"]
    }
  }'
{"success":true,"message":"Delivery methods and consent settings updated successfully","data":{"id":"434c32f5-35e7-4e62-a761-adb01f6ce83e","delivery_methods":{"qr_code":true,"email_link":true,"voice_call":true,"in_person_tablet":false,"text_message_link":true},"signature_consent":{"consent_language":"I consent to the treatment and procedures described","digital_signature":true,"verbal_consent_recording":true,"consent_languages_available":["English","Spanish","Mandarin"]},"updated_at":"2025-09-18T03:22:15.935Z","current_version":1}}%                                                                          chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X GET \
  'https://api.myflowai.com/api/v1/patient-intake-agent/3' \                 
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg' \
  -H 'Content-Type: application/json'  
{"success":true,"data":{"id":"434c32f5-35e7-4e62-a761-adb01f6ce83e","org_id":3,"agent_id":"","agent_name":"Patient Intake Assistant","language":"en-US","voice":"alloy","agent_instructions":"You are a friendly patient intake assistant","human_transfer_criteria":"Transfer if patient requests or shows frustration","intake_forms":[],"modality_forms":[],"custom_forms":[],"field_requirements":{"email":"optional","insurance_id":"required","patient_name":"required","phone_number":"required","date_of_birth":"required","emergency_contact":"optional","preferred_language":"optional"},"special_instructions":{"minors_instructions":"Parent or guardian must complete the form for patients under 18","no_insurance_instructions":"Self-pay options available. Please ask about our payment plans","language_barrier_instructions":"Interpreter services available in Spanish, Mandarin, and ASL"},"delivery_methods":{"qr_code":true,"email_link":true,"voice_call":true,"in_person_tablet":false,"text_message_link":true},"signature_consent":{"consent_language":"I consent to the treatment and procedures described","digital_signature":true,"verbal_consent_recording":true,"consent_languages_available":["English","Spanish","Mandarin"]},"workflows":[],"current_version":1,"is_active":true,"created_at":"2025-09-18T08:45:30.872Z","updated_at":"2025-09-18T03:22:15.935Z"}}%                                                                             chiraggupta@Chirags-MacBook-Pro ~ % 


chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  'https://api.myflowai.com/api/v1/patient-intake-agent/3/agent-config' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "Sarah - Patient Intake Assistant",
    "language": "en-US",
    "voice": "alloy",
    "agent_instructions": "You are Sarah, a friendly and professional patient intake assistant. Help patients complete their intake forms efficiently while being empathetic to their needs.",
    "human_transfer_criteria": "Transfer to human agent if: patient expresses frustration, has complex medical questions, requests to speak with a person, or if technical issues persist after 2 attempts"
  }'
{"success":true,"message":"Agent configuration updated successfully","data":{"id":"434c32f5-35e7-4e62-a761-adb01f6ce83e","org_id":3,"agent_id":"","agent_name":"Sarah - Patient Intake Assistant","language":"en-US","voice":"alloy","agent_instructions":"You are Sarah, a friendly and professional patient intake assistant. Help patients complete their intake forms efficiently while being empathetic to their needs.","human_transfer_criteria":"Transfer to human agent if: patient expresses frustration, has complex medical questions, requests to speak with a person, or if technical issues persist after 2 attempts","intake_forms":[],"modality_forms":[],"custom_forms":[],"field_requirements":{"email":"optional","insurance_id":"required","patient_name":"required","phone_number":"required","date_of_birth":"required","emergency_contact":"optional","preferred_language":"optional"},"special_instructions":{"minors_instructions":"Parent or guardian must complete the form for patients under 18","no_insurance_instructions":"Self-pay options available. Please ask about our payment plans","language_barrier_instructions":"Interpreter services available in Spanish, Mandarin, and ASL"},"delivery_methods":{"qr_code":true,"email_link":true,"voice_call":true,"in_person_tablet":false,"text_message_link":true},"signature_consent":{"consent_language":"I consent to the treatment and procedures described","digital_signature":true,"verbal_consent_recording":true,"consent_languages_available":["English","Spanish","Mandarin"]},"workflows":[],"current_version":1,"is_active":true,"created_by":null,"updated_by":1,"created_at":"2025-09-18T08:45:30.872Z","updated_at":"2025-09-18T03:24:27.080Z"}}%                                                                                                                                                        chiraggupta@Chirags-MacBook-Pro ~ % 


Get all data
GET https://api.myflowai.com/api/v1/patient-intake-agent/{id} — returns agent identity, field_requirements, special_instructions, delivery_methods, signature_consent, and form/workflow arrays in a single response.

Update APIs
PUT https://api.myflowai.com/api/v1/patient-intake-agent/{id}/field-requirements — updates field_requirements and special_instructions.

PUT https://api.myflowai.com/api/v1/patient-intake-agent/{id}/delivery-methods — updates delivery_methods and signature_consent.

PUT https://api.myflowai.com/api/v1/patient-intake-agent/{id}/agent-config — updates agent_name, language, voice, agent_instructions, human_transfer_criteria.

Example calls
curl -X GET https://api.myflowai.com/api/v1/patient-intake-agent/3 -H "Authorization: Bearer <JWT>".

curl -X PUT https://api.myflowai.com/api/v1/patient-intake-agent/3/field-requirements -d '{...}' -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json".

curl -X PUT https://api.myflowai.com/api/v1/patient-intake-agent/3/delivery-methods -d '{...}' -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json".

curl -X PUT https://api.myflowai.com/api/v1/patient-intake-agent/3/agent-config -d '{...}' -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json".


Step-by-Step Plan
Step 1: Prepare Data Mapping and Utilities (1-2 hours)
Goal: Create reusable functions to map between API responses and tab data structures. This ensures consistency and reduces errors.
Actions:
Create a new file: client/src/lib/patient-intake.mappers.ts (similar to launchpad.mappers.ts).
Add functions like mapApiToFieldContentRules(apiData), mapApiToDeliveryMethods(apiData), etc., to convert GET response data to tab formats.
Example: For FieldContentRulesTab, map apiData.field_requirements and apiData.special_instructions to { fieldRequirements: {...}, specialInstructions: {...} }.
Add reverse mappers (e.g., mapFieldContentRulesToApi(tabData)) to convert tab getValues() output to PUT payloads.
Update client/src/lib/api.ts if needed (unlikely, as it already supports GET/PUT).
Test mappers with sample data from patient.md to ensure accuracy.
Expected Output: Utility functions for seamless data transformation. No UI changes yet.
Step 2: Implement Data Fetching and Loading (2-3 hours)
Goal: Fetch initial data using the GET endpoint and populate tabs on page load.
Actions:
In client/src/pages/ai-agents/patient-intake.tsx:
Add a useEffect hook to call the GET API on mount (or when orgId is available from auth context).
Use api.get<{ data: PatientIntakeData }>(/api/v1/patient-intake-agent/${orgId}).
Store the response in local state (e.g., useState for initialData).
Handle loading: Show a spinner or fallback while fetching.
On success, use the mappers from Step 1 to distribute data to each tab (e.g., via props or a context provider).
For each tab component (e.g., FieldContentRulesTab.tsx):
Accept props for initial data (e.g., initialFieldRequirements).
In useEffect, set local state from props to populate form fields.
Example: useEffect(() => { setPatientName(props.initialData.fieldRequirements.patient_name); }, [props.initialData]);.
Add error handling: Use try-catch or api.ts's ApiError to show toasts (e.g., "Failed to load configuration").
Integrate with React Query (optional): Wrap the GET call in useQuery for caching and automatic refetching.
Expected Output: Tabs populate with data on load. Loading states prevent blank screens.
Step 3: Add Save Functionality to Tabs (3-4 hours)
Goal: Enable saving changes from each tab using the PUT endpoints.
Actions:
Update the parent page (patient-intake.tsx):
Add a centralized handleSave function (or per-tab handlers) that collects data from tab refs.
Example: const handleSave = async (tabName: string) => { const data = tabRef.current.getValues(); const payload = mapToApi(data); await api.put(/api/v1/patient-intake-agent/${orgId}/${tabName}, payload); };.
Add a "Save" button per tab or a global "Save All" button (mimicking the launchpad page).
Trigger PUT endpoints based on tab:
FieldContentRulesTab: PUT /field-requirements.
DeliveryMethodsTab: PUT /delivery-methods.
PatientAgentConfigTab: PUT /agent-config.
FormsQuestionnairesTab/PatientWorkflowsTab: If updates are needed, extend to PUT arrays (or note as future enhancement).
In each tab component:
Add a onSave prop or internal save logic to call the PUT.
Before saving, call validate() and show errors if invalid.
Use api.put<T>(endpoint, mappedData) for requests.
Handle concurrency: Include current_version from GET response in PUT payloads to prevent conflicts.
Expected Output: Users can save changes; data persists to the API.
Step 4: Handle API Responses and Errors (1-2 hours)
Goal: Process PUT responses, update UI, and manage failures gracefully.
Actions:
After a successful PUT:
Show success toast (e.g., "Configuration saved successfully").
Refetch the GET API to sync local state with the server.
Update local state optimistically (e.g., merge updated fields without full reload).
On failure:
Display error toast (e.g., "Save failed: {message}").
Rollback UI changes if using optimistic updates.
Retry logic: Use api.ts's token refresh; add manual retry for network errors.
Add global error boundaries (e.g., React Error Boundary) for unhandled failures.
Log errors (e.g., to console or a service) for debugging.
Expected Output: Robust error handling; no data loss on failures.
Step 5: Testing and Validation (2-3 hours)
Goal: Ensure the integration works end-to-end.
Actions:
Unit tests: Test mappers with Jest/Vitest for correct data transformation.
Integration tests: Mock APIs (e.g., using MSW) to test fetch/save flows.
Manual testing: Use curl examples from patient.md to verify API responses. Test with invalid data (e.g., missing fields) to check validation.
Edge cases: Test offline mode, auth expiration, large payloads, and concurrency (e.g., multiple tab saves).
Performance: Ensure loading states don't block UI; optimize with React Query for caching.
Accessibility: Verify ARIA labels and keyboard navigation in updated tabs.
Expected Output: Reliable integration; bugs identified and fixed.