Step-by-step plan to add Upload/Delete APIs per tab
1) Harden the core API wrapper for FormData
Update client/src/lib/api.ts to avoid setting Content-Type when body is FormData.
Add a dedicated upload helper so callers don’t JSON.stringify uploads.
Minimal change:
Apply to uploadapi.md
2) Define document response types
In client/src/lib/launchpad.types.ts (or a new file) add:
Apply to uploadapi.md
3) Add per-tab API functions in client/src/lib/launchpad.ts
Account:
uploadAccountDocument(orgId: number, file: File): Promise<UploadDocumentResponse>
deleteAccountDocument(orgId: number, url: string): Promise<DeleteDocumentResponse>
Endpoints:
POST /api/v1/launchpad/{orgId}/account-details/upload-document (FormData: file)
POST /api/v1/launchpad/{orgId}/account-details/delete-document (JSON: { url })
Locations:
uploadLocationsDocument(...), deleteLocationsDocument(...)
Endpoints:
POST /api/v1/launchpad/{orgId}/locations/upload-document (FormData: file)
POST /api/v1/launchpad/{orgId}/locations/delete-document (JSON: { url })
Specialties:
uploadSpecialtiesDocument(...), deleteSpecialtiesDocument(...)
Endpoints:
POST /api/v1/launchpad/{orgId}/specialties/upload-document (FormData: file)
POST /api/v1/launchpad/{orgId}/specialties/delete-document (JSON: { url })
Insurance:
uploadInsuranceDocument(...), deleteInsuranceDocument(...)
Endpoints:
POST /api/v1/launchpad/{orgId}/insurance/upload-document (FormData: file)
POST /api/v1/launchpad/{orgId}/insurance/delete-document (JSON: { url })
All:
Uploads: build FormData, append file, call api.upload.
Deletes: call api.post with { url }.
4) Create React Query mutations in client/src/lib/launchpad.queries.ts
Per tab:
useUploadAccountDocument(orgId), useDeleteAccountDocument(orgId)
useUploadLocationsDocument(orgId), useDeleteLocationsDocument(orgId)
useUploadSpecialtiesDocument(orgId), useDeleteSpecialtiesDocument(orgId)
useUploadInsuranceDocument(orgId), useDeleteInsuranceDocument(orgId)
Behavior:
mutationFn calls the corresponding launchpad.ts function.
onSuccess: invalidate ['launchpad', String(orgId)] to refresh snapshot.
Optional: accept onSuccess overrides to optimistically update local tab state.
5) Decide document sourcing for list rendering
Account/Insurance: read data.account_details.documents and data.insurance.documents.
Locations/Specialties: endpoints apply to all records; render a tab-level list by:
Union/deduplicate URLs across data.locations[].documents and data.speciality_services[].documents, or
Treat documents as tab-scoped (preferred), displaying a single list at the tab end.
6) UI integration points (hook-up only; detailed UI later)
At the end of each tab, wire:
Drop area → on file select → call corresponding useUpload.... Show progress and errors.
Documents list → each item card shows name + URL + Delete button.
Delete → open confirmation (AlertDialog) → on confirm → call useDelete....
Disable actions while the corresponding mutation is pending.
7) Validation and constraints
Before upload: enforce allowed mime types, max size, and accept only one file per request (or loop files sequentially).
Graceful error toasts on network/401; rely on wrapper for token refresh.
8) Caching consistency
Always invalidate ['launchpad', String(orgId)] after upload/delete to sync documents with server.
For a snappier UX, optimistically append/remove the item in local tab state, then let invalidate reconcile.
9) Testing
Unit: api.ts FormData path (no Content-Type), JSON path (Content-Type set).
Unit: launchpad.ts functions build the right endpoints and bodies.
Integration: mutations invalidate cache and UI reflects new documents.
10) Edge cases
Duplicate uploads (same URL/name): dedupe by URL in UI list.
Delete race conditions: if item missing after refetch, ignore and just sync UI.
Network failures: retry once for transient errors; surface clear messages.
11) Security
Ensure Authorization header on all calls (already in wrapper).
Never allow user-controlled URLs beyond delete JSON body; server validates ownership.
12) Rollout
Implement wrapper change.
Add API functions and hooks.
Wire one tab (Account) end-to-end to validate flow.
Extend to Locations, Specialties, Insurance.
QA with sample files from uploadapi.md.



Account tab:
upload document:

chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/account-details/upload-document -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" -F "file=@/Users/chiraggupta/Downloads/flowai-test-doc.txt"
{"success":true,"message":"Document uploaded successfully","document":{"name":"flowai-test-doc.txt","url":"https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/account_details/1758267408582-3d5a8933-213b-4b6a-98c4-b16ef96af4e2-flowai-test-doc.txt","uploaded_at":"2025-09-19T07:36:48.661Z","uploaded_by":1}}%   

delete document:
chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/account-details/delete-document \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/account_details/1758267408582-3d5a8933-213b-4b6a-98c4-b16ef96af4e2-flowai-test-doc.txt"
  }'
{"success":true,"message":"Document deleted successfully"}%   


location tab:
upload document:

chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/locations/upload-document \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" \
  -F "file=@/Users/chiraggupta/Downloads/flowai-test-doc.txt"
{"success":true,"message":"Document uploaded successfully to 2 location(s)","document":{"name":"flowai-test-doc.txt","url":"https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/locations/1758267684206-1149b601-12ae-4b75-9034-46b03a6fb7fe-flowai-test-doc.txt","uploaded_at":"2025-09-19T07:41:24.261Z","uploaded_by":1}}%             

delete document:
chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/locations/delete-document \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/locations/1758267684206-1149b601-12ae-4b75-9034-46b03a6fb7fe-flowai-test-doc.txt"
  }'
{"success":true,"message":"Document deleted from all locations successfully"}%   


specialties tab:
upload document:
chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/specialties/upload-document \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" \
  -F "file=@/Users/chiraggupta/Downloads/flowai-test-doc.txt"       
{"success":true,"message":"Document uploaded successfully to 4 specialty(s)","document":{"name":"flowai-test-doc.txt","url":"https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/specialties/1758267908969-0e9880ea-c7c6-4c96-bb47-995b311f102a-flowai-test-doc.txt","uploaded_at":"2025-09-19T07:45:09.031Z","uploaded_by":1}}%                                             

delete document:

chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/specialties/delete-document \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/specialties/1758267908969-0e9880ea-c7c6-4c96-bb47-995b311f102a-flowai-test-doc.txt"
  }'
{"success":true,"message":"Document deleted from all specialties successfully"}%    

insurance tab:
upload document:
chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/insurance/upload-document \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" \
  -F "file=@/Users/chiraggupta/Downloads/flowai-test-doc.txt"             
{"success":true,"message":"Document uploaded successfully","document":{"name":"flowai-test-doc.txt","url":"https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/insurance/1758268044691-77da2d36-8b1b-49db-9a9e-63ca0480d1a4-flowai-test-doc.txt","uploaded_at":"2025-09-19T07:47:24.750Z","uploaded_by":1}}%                                              

delete document:
chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/insurance/delete-document \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/insurance/1758268044691-77da2d36-8b1b-49db-9a9e-63ca0480d1a4-flowai-test-doc.txt"
  }'
{"success":true,"message":"Document deleted successfully"}%        

