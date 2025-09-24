Phase 1: API Infrastructure Setup
Step 1: Add Customer Support API Functions
File: client/src/lib/api.ts or create client/src/lib/customer-support.ts
Add API functions for customer support agent:
Step 2: Define TypeScript Interfaces
File: client/src/lib/customer-support.types.ts
Step 3: Create React Query Hooks
File: client/src/lib/customer-support.queries.ts
Phase 2: Update Frequently Asked Questions Tab
Step 4: Update FAQ Tab Component
File: client/src/components/customer-support/FrequentlyAskedQuestionsTab.tsx
Key changes:
Replace static FAQ data with API data
Add loading states
Add CRUD operations for FAQs
Implement card-based layout for each FAQ
Phase 3: Update Agent Config Tab
Step 5: Update Agent Config Tab Component
File: client/src/components/customer-support/CustomerSupportAgentConfigTab.tsx
Key changes:
Load data from API
Remove unsupported fields (human_transfer_criteria, agent_id)
Add individual save buttons or auto-save functionality
Add loading states
Phase 4: Update Main Page
Step 6: Remove Knowledge Base Tab
File: client/src/pages/ai-agents/customer-support.tsx
Remove the Knowledge Base & Training tab import and tab content
Update the TabsList to only show 3 tabs instead of 4
Step 7: Update Tab Validation Logic
Update the main page's save logic to work with the new API-driven tabs.
Phase 5: Testing & Validation
Step 8: Add Error Handling
Implement proper error states for API failures
Add toast notifications for success/error messages
Handle loading states across all components
Step 9: Test API Integration
Test each API endpoint individually
Test tab switching and data persistence
Test error scenarios (network failures, invalid data)
Step 10: Performance Optimization
Add proper loading skeletons
Implement optimistic updates where appropriate
Ensure proper query invalidation

Customer support Agent 

curl -X GET "https://api.myflowai.com/api/v1/customer-support-agent/3" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json"
{"success":true,"data":{"id":"bedd1ccb-df81-4a9e-a51d-f537ca49ee51","org_id":3,"agent_id":"","agent_name":"","language":"","voice":"","agent_instructions":"","human_transfer_criteria":"","faqs":[],"current_version":1,"is_active":true,"created_at":"2025-09-18T07:32:03.722Z","updated_at":"2025-09-18T07:32:03.722Z","created_by":null,"updated_by":null}}%    





chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT "https://api.myflowai.com/api/v1/customer-support-agent/3/update-faqs" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d "{\"faqs\":[{\"question\":\"What are your business hours?\",\"answer\":\"We are open Monday to Friday, 9 AM to 6 PM EST.\"},{\"question\":\"How can I reset my password?\",\"answer\":\"You can reset your password by clicking the 'Forgot Password' link on the login page.\"}]}"
{"success":true,"message":"FAQs updated successfully","data":{"faqs":[{"answer":"We are open Monday to Friday, 9 AM to 6 PM EST.","question":"What are your business hours?"},{"answer":"You can reset your password by clicking the 'Forgot Password' link on the login page.","question":"How can I reset my password?"}],"updated_at":"2025-09-18T02:03:04.253Z"}}%                                                  chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X GET "https://api.myflowai.com/api/v1/customer-support-agent/3" \            
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json"  
{"success":true,"data":{"id":"bedd1ccb-df81-4a9e-a51d-f537ca49ee51","org_id":3,"agent_id":"","agent_name":"","language":"","voice":"","agent_instructions":"","human_transfer_criteria":"","faqs":[{"answer":"We are open Monday to Friday, 9 AM to 6 PM EST.","question":"What are your business hours?"},{"answer":"You can reset your password by clicking the 'Forgot Password' link on the login page.","question":"How can I reset my password?"}],"current_version":1,"is_active":true,"created_at":"2025-09-18T07:32:03.722Z","updated_at":"2025-09-18T02:03:04.253Z","created_by":null,"updated_by":1}}%                   chiraggupta@Chirags-MacBook-Pro ~ % 




chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT "https://api.myflowai.com/api/v1/customer-support-agent/3/update-name" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Alex - Customer Support Assistant"
  }'
{"success":true,"message":"Agent name updated successfully","data":{"agent_name":"Alex - Customer Support Assistant","updated_at":"2025-09-18T02:05:46.322Z","current_version":1}}%                         


chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT "https://api.myflowai.com/api/v1/customer-support-agent/3/update-voice" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "voice": "Alex"
  }'
{"success":true,"message":"Voice updated successfully","data":{"voice":"Alex","updated_at":"2025-09-18T02:05:56.045Z","current_version":1}}%                                                                chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT "https://api.myflowai.com/api/v1/customer-support-agent/3/update-language" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "English"
  }'
{"success":true,"message":"Language updated successfully","data":{"language":"English","updated_at":"2025-09-18T02:06:07.381Z","current_version":1}}%                                                       chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT "https://api.myflowai.com/api/v1/customer-support-agent/3/update-instructions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_instructions": "You are a helpful customer support assistant. Be polite, professional, and provide accurate information to customers. Always try to resolve issues efficiently."
  }'
{"success":true,"message":"Agent instructions updated successfully","data":{"updated_at":"2025-09-18T02:06:17.706Z","current_version":1}}%                                                                  chiraggupta@Chirags-MacBook-Pro ~ % 

