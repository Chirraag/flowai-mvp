Scheduling Agent


chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  https://api.myflowai.com/api/v1/scheduling-agent/3/appointment-setup \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_types": {
      "new_patient": true,
      "follow_up": true,
      "procedure": true
    },
    "new_patient_duration": "45 minutes",
    "followup_duration": "20 minutes",
    "procedure_specific": "Colonoscopy",
    "procedure_duration": "60 minutes",
    "max_new_patients_per_day": 5,
    "max_followups_per_day": 10
  }'
{"success":true,"message":"Appointment setup updated successfully","data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","updated_at":"2025-09-18T02:31:26.618Z","current_version":1}}%                       




chiraggupta@Chirags-MacBook-Pro ~ % curl -X GET \
  https://api.myflowai.com/api/v1/scheduling-agent/3 \                  
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg"  
{"success":true,"data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","org_id":3,"agent_id":"","agent_name":"Flowai Scheduling Assistant","language":"en-US","voice":"nova","agent_instructions":"You are a professional scheduling assistant for Flowai. Help patients book appointments efficiently.","human_transfer_criteria":"Transfer to human if: emergency, complex issues, or explicit request","appointment_types":{"follow_up":true,"procedure":true,"new_patient":true},"new_patient_duration":"45 minutes","followup_duration":"20 minutes","procedure_specific":"Colonoscopy","procedure_duration":"60 minutes","max_new_patients_per_day":5,"max_followups_per_day":10,"patient_types_accepted":{"hmo":true,"ppo":true,"medicaid":false,"medicare":true,"self_pay":true,"new_patients":true,"existing_patients":true},"referral_requirements":{"services_requiring_referrals":[],"insurance_plans_requiring_referrals":[]},"accept_walkins":false,"allow_same_day":true,"same_day_cutoff_time":"14:00:00","min_cancellation_hours":24,"no_show_fee":"50.00","provider_preferences":{"blackout_dates":[],"custom_scheduling_rules":"","established_patients_only_days":""},"workflows":[],"current_version":1,"is_active":true,"created_at":"2025-09-18T07:58:10.294Z","updated_at":"2025-09-18T02:31:26.618Z"}}%                                                                                                                                                       chiraggupta@Chirags-MacBook-Pro ~ % 

chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  https://api.myflowai.com/api/v1/scheduling-agent/3/patient-eligibility \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_types_accepted": {
      "new_patients": true,
      "existing_patients": true,
      "self_pay": true,
      "hmo": true,
      "ppo": true,
      "medicare": true,
      "medicaid": false
    },
    "referral_requirements": {
      "services_requiring_referrals": ["MRI", "CT Scan", "Specialist Visit"],
      "insurance_plans_requiring_referrals": ["HMO Plan A", "Medicare Advantage"]
    }
  }'
{"success":true,"message":"Patient eligibility settings updated successfully","data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","updated_at":"2025-09-18T02:32:56.323Z","current_version":1}}%            chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X GET \
  https://api.myflowai.com/api/v1/scheduling-agent/3 \                    
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg"  
{"success":true,"data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","org_id":3,"agent_id":"","agent_name":"Flowai Scheduling Assistant","language":"en-US","voice":"nova","agent_instructions":"You are a professional scheduling assistant for Flowai. Help patients book appointments efficiently.","human_transfer_criteria":"Transfer to human if: emergency, complex issues, or explicit request","appointment_types":{"follow_up":true,"procedure":true,"new_patient":true},"new_patient_duration":"45 minutes","followup_duration":"20 minutes","procedure_specific":"Colonoscopy","procedure_duration":"60 minutes","max_new_patients_per_day":5,"max_followups_per_day":10,"patient_types_accepted":{"hmo":true,"ppo":true,"medicaid":false,"medicare":true,"self_pay":true,"new_patients":true,"existing_patients":true},"referral_requirements":{"services_requiring_referrals":["MRI","CT Scan","Specialist Visit"],"insurance_plans_requiring_referrals":["HMO Plan A","Medicare Advantage"]},"accept_walkins":false,"allow_same_day":true,"same_day_cutoff_time":"14:00:00","min_cancellation_hours":24,"no_show_fee":"50.00","provider_preferences":{"blackout_dates":[],"custom_scheduling_rules":"","established_patients_only_days":""},"workflows":[],"current_version":1,"is_active":true,"created_at":"2025-09-18T07:58:10.294Z","updated_at":"2025-09-18T02:32:56.323Z"}}%                                                                                    chiraggupta@Chirags-MacBook-Pro ~ % 

chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  https://api.myflowai.com/api/v1/scheduling-agent/3/scheduling-policies \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "accept_walkins": false,
    "allow_same_day": true,
    "same_day_cutoff_time": "14:00:00",
    "min_cancellation_hours": 24,
    "no_show_fee": 50.00
  }'
{"success":true,"message":"Scheduling policies updated successfully","data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","updated_at":"2025-09-18T02:34:26.826Z","current_version":1}}%                     chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 


chiraggupta@Chirags-MacBook-Pro ~ % curl -X GET \
  https://api.myflowai.com/api/v1/scheduling-agent/3 \                    
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg"  
{"success":true,"data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","org_id":3,"agent_id":"","agent_name":"Flowai Scheduling Assistant","language":"en-US","voice":"nova","agent_instructions":"You are a professional scheduling assistant for Flowai. Help patients book appointments efficiently.","human_transfer_criteria":"Transfer to human if: emergency, complex issues, or explicit request","appointment_types":{"follow_up":true,"procedure":true,"new_patient":true},"new_patient_duration":"45 minutes","followup_duration":"20 minutes","procedure_specific":"Colonoscopy","procedure_duration":"60 minutes","max_new_patients_per_day":5,"max_followups_per_day":10,"patient_types_accepted":{"hmo":true,"ppo":true,"medicaid":false,"medicare":true,"self_pay":true,"new_patients":true,"existing_patients":true},"referral_requirements":{"services_requiring_referrals":["MRI","CT Scan","Specialist Visit"],"insurance_plans_requiring_referrals":["HMO Plan A","Medicare Advantage"]},"accept_walkins":false,"allow_same_day":true,"same_day_cutoff_time":"14:00:00","min_cancellation_hours":24,"no_show_fee":"50.00","provider_preferences":{"blackout_dates":[],"custom_scheduling_rules":"","established_patients_only_days":""},"workflows":[],"current_version":1,"is_active":true,"created_at":"2025-09-18T07:58:10.294Z","updated_at":"2025-09-18T02:34:26.826Z"}}%                                                                                    chiraggupta@Chirags-MacBook-Pro ~ % 



chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  https://api.myflowai.com/api/v1/scheduling-agent/3/provider-preferences \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_preferences": {
      "blackout_dates": ["2025-03-15", "2025-03-16", "2025-03-17", "2025-04-01", "2025-04-02"],
      "established_patients_only_days": "Wednesdays",
      "custom_scheduling_rules": "No new patients on Mondays before noon"
    }
  }'
{"success":true,"message":"Provider preferences updated successfully","data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","updated_at":"2025-09-18T02:38:38.170Z","current_version":1}}%                    chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X GET \
  https://api.myflowai.com/api/v1/scheduling-agent/3 \                     
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg"  
{"success":true,"data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","org_id":3,"agent_id":"","agent_name":"Flowai Scheduling Assistant","language":"en-US","voice":"nova","agent_instructions":"You are a professional scheduling assistant for Flowai. Help patients book appointments efficiently.","human_transfer_criteria":"Transfer to human if: emergency, complex issues, or explicit request","appointment_types":{"follow_up":true,"procedure":true,"new_patient":true},"new_patient_duration":"45 minutes","followup_duration":"20 minutes","procedure_specific":"Colonoscopy","procedure_duration":"60 minutes","max_new_patients_per_day":5,"max_followups_per_day":10,"patient_types_accepted":{"hmo":true,"ppo":true,"medicaid":false,"medicare":true,"self_pay":true,"new_patients":true,"existing_patients":true},"referral_requirements":{"services_requiring_referrals":["MRI","CT Scan","Specialist Visit"],"insurance_plans_requiring_referrals":["HMO Plan A","Medicare Advantage"]},"accept_walkins":false,"allow_same_day":true,"same_day_cutoff_time":"14:00:00","min_cancellation_hours":24,"no_show_fee":"50.00","provider_preferences":{"blackout_dates":["2025-03-15","2025-03-16","2025-03-17","2025-04-01","2025-04-02"],"custom_scheduling_rules":"No new patients on Mondays before noon","established_patients_only_days":"Wednesdays"},"workflows":[],"current_version":1,"is_active":true,"created_at":"2025-09-18T07:58:10.294Z","updated_at":"2025-09-18T02:38:38.170Z"}}%                                                                                                                                                                                chiraggupta@Chirags-MacBook-Pro ~ % 





chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  https://api.myflowai.com/api/v1/scheduling-agent/3/agent-config \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Medical Assistant AI",
    "language": "en-US",
    "voice": "nova",
    "agent_instructions": "You are a friendly medical scheduling assistant. Be professional, empathetic, and efficient when helping patients book appointments.",
    "human_transfer_criteria": "Transfer to human agent if: patient is upset, medical emergency mentioned, complex insurance questions, or patient explicitly requests human assistance"
  }'
{"success":true,"message":"Agent configuration updated successfully","data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","org_id":3,"agent_id":"","agent_name":"Medical Assistant AI","language":"en-US","voice":"nova","agent_instructions":"You are a friendly medical scheduling assistant. Be professional, empathetic, and efficient when helping patients book appointments.","human_transfer_criteria":"Transfer to human agent if: patient is upset, medical emergency mentioned, complex insurance questions, or patient explicitly requests human assistance","appointment_types":{"follow_up":true,"procedure":true,"new_patient":true},"new_patient_duration":"45 minutes","followup_duration":"20 minutes","procedure_specific":"Colonoscopy","procedure_duration":"60 minutes","max_new_patients_per_day":5,"max_followups_per_day":10,"patient_types_accepted":{"hmo":true,"ppo":true,"medicaid":false,"medicare":true,"self_pay":true,"new_patients":true,"existing_patients":true},"referral_requirements":{"services_requiring_referrals":["MRI","CT Scan","Specialist Visit"],"insurance_plans_requiring_referrals":["HMO Plan A","Medicare Advantage"]},"accept_walkins":false,"allow_same_day":true,"same_day_cutoff_time":"14:00:00","min_cancellation_hours":24,"no_show_fee":"50.00","provider_preferences":{"blackout_dates":["2025-03-15","2025-03-16","2025-03-17","2025-04-01","2025-04-02"],"custom_scheduling_rules":"No new patients on Mondays before noon","established_patients_only_days":"Wednesdays"},"workflows":[],"current_version":1,"is_active":true,"created_by":1,"updated_by":1,"created_at":"2025-09-18T07:58:10.294Z","updated_at":"2025-09-18T02:39:24.512Z"}}%                                                                                                                                                                                             chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X PUT \
  https://api.myflowai.com/api/v1/scheduling-agent/3/update-voice \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "voice": "alloy"
  }'
{"success":true,"message":"Voice updated successfully","data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","voice":"alloy","updated_at":"2025-09-18T02:39:41.907Z","current_version":1}}%                   chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % 
chiraggupta@Chirags-MacBook-Pro ~ % curl -X GET \
  https://api.myflowai.com/api/v1/scheduling-agent/3 \             
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg"  
{"success":true,"data":{"id":"4867116e-3b6f-4abd-818d-c2d51a68052c","org_id":3,"agent_id":"","agent_name":"Medical Assistant AI","language":"en-US","voice":"alloy","agent_instructions":"You are a friendly medical scheduling assistant. Be professional, empathetic, and efficient when helping patients book appointments.","human_transfer_criteria":"Transfer to human agent if: patient is upset, medical emergency mentioned, complex insurance questions, or patient explicitly requests human assistance","appointment_types":{"follow_up":true,"procedure":true,"new_patient":true},"new_patient_duration":"45 minutes","followup_duration":"20 minutes","procedure_specific":"Colonoscopy","procedure_duration":"60 minutes","max_new_patients_per_day":5,"max_followups_per_day":10,"patient_types_accepted":{"hmo":true,"ppo":true,"medicaid":false,"medicare":true,"self_pay":true,"new_patients":true,"existing_patients":true},"referral_requirements":{"services_requiring_referrals":["MRI","CT Scan","Specialist Visit"],"insurance_plans_requiring_referrals":["HMO Plan A","Medicare Advantage"]},"accept_walkins":false,"allow_same_day":true,"same_day_cutoff_time":"14:00:00","min_cancellation_hours":24,"no_show_fee":"50.00","provider_preferences":{"blackout_dates":["2025-03-15","2025-03-16","2025-03-17","2025-04-01","2025-04-02"],"custom_scheduling_rules":"No new patients on Mondays before noon","established_patients_only_days":"Wednesdays"},"workflows":[],"current_version":1,"is_active":true,"created_at":"2025-09-18T07:58:10.294Z","updated_at":"2025-09-18T02:39:41.907Z"}}%                                                                   chiraggupta@Chirags-MacBook-Pro ~ % 


sample fields:
Agent identity: agent_name, language, voice, agent_instructions, human_transfer_criteria, is_active, current_version.

Appointment setup: appointment_types (new_patient, follow_up, procedure), new_patient_duration, followup_duration, procedure_specific, procedure_duration, max_new_patients_per_day, max_followups_per_day.

Patient eligibility: patient_types_accepted (new_patients, existing_patients, self_pay, hmo, ppo, medicare, medicaid), referral_requirements (services_requiring_referrals, insurance_plans_requiring_referrals).

Scheduling policies: accept_walkins, allow_same_day, same_day_cutoff_time, min_cancellation_hours, no_show_fee.

Provider preferences: blackout_dates, established_patients_only_days, custom_scheduling_rules.

System metadata (read-only in UI): id, org_id, updated_at, created_at, agent_id.

What these endpoints enable
GET /scheduling-agent/:id: Load the full agent configuration to hydrate the page and power read-only audit metadata displays.

PUT /scheduling-agent/:id/appointment-setup: Create/update appointment types, durations, and daily caps to drive slot generation rules and UI toggles.

PUT /scheduling-agent/:id/patient-eligibility: Control accepted patient/insurance types and referral requirements for pre-checks during booking flows.

PUT /scheduling-agent/:id/scheduling-policies: Manage walk-ins, same-day cutoff, cancellation windows, and no-show fee to gate available options and enforce policy validations.

PUT /scheduling-agent/:id/provider-preferences: Set blackout dates, established-only days, and custom rules to filter available times and surface scheduling guidance.

PUT /scheduling-agent/:id/agent-config: Update agent_name, language, voice, tone/instructions, and escalation criteria to align conversational behavior with operational policy.

PUT /scheduling-agent/:id/update-voice: Switch synthesized voice independently for rapid A/B tests without touching broader agent config



1) Types, API client, and services
Add types client/src/types/schedulingAgent.ts for the GET and each PUT payload.
Add a small HTTP client client/src/api/http.ts (Fetch with JSON, Authorization, Accept headers, retries).
Add services client/src/api/schedulingAgent.ts:
getSchedulingAgent(id)
updateAppointmentSetup(id, payload)
updatePatientEligibility(id, payload)
updateSchedulingPolicies(id, payload)
updateProviderPreferences(id, payload)
updateAgentConfig(id, payload)
updateVoice(id, { voice })
2) Mapping utilities (API ⇄ UI)
client/src/lib/schedulingAgent.mappers.ts:
Time helpers:
apiTimeToInput(t: string) -> "HH:MM" (handles "HH:MM:SS")
inputTimeToApi(t: string) -> "HH:MM:00"
Textarea helpers:
arrayToTextarea(arr: string[]) -> string (join with "\n")
textareaToArray(text: string) -> string[] (split by newline, trim, filter empties)
Language value normalization:
UI select values use API codes directly (e.g., "en-US"); fall back to custom option if unknown.
Voice value normalization:
UI select values use API voices directly (e.g., "nova", "alloy"); fall back to custom option if unknown.
Appointment types:
Add booleans to UI for appointment_types.new_patient, follow_up, procedure.
3) Page data flow and Save All
In client/src/pages/ai-agents/scheduling.tsx:
Determine agentId/orgId (from context/router) and fetch once on mount with a loading state.
Store the GET result in state and pass initialValues props to each tab.
Add a “Save All” button in the header.
On Save:
Call validate() on each tab; if any invalid, show toast with first errors and stop.
Call each tab’s getValues(), build per-tab payloads:
Appointment Setup → PUT /:id/appointment-setup
Patient & Eligibility → PUT /:id/patient-eligibility
Scheduling Policies → PUT /:id/scheduling-policies
Provider Preferences → PUT /:id/provider-preferences
Agent Config → PUT /:id/agent-config
Only include endpoints for tabs with changes (compare against initial GET and convert UI fields back to API shape).
Execute updates in Promise.all with toasts; refetch GET on success to re-hydrate.
4) Appointment Setup tab (AppointmentSetupTab)
UI changes:
Add three toggles for appointment_types: new_patient, follow_up, procedure.
Hydration from GET:
appointment_types.* → toggle states.
new_patient_duration ("45 minutes") → select value "45".
followup_duration ("20 minutes") → "20".
procedure_specific → input.
procedure_duration ("60 minutes") → "60".
max_new_patients_per_day → string.
max_followups_per_day → string.
Save mapping:
Build payload:
appointment_types: { new_patient, follow_up, procedure }
new_patient_duration: "<min> minutes"
followup_duration: "<min> minutes"
procedure_specific
procedure_duration: "<min> minutes"
max_new_patients_per_day: number
max_followups_per_day: number
5) Patient & Eligibility tab (PatientEligibilityTab)
Hydration from GET:
Patient types booleans from patient_types_accepted.
services_requiring_referrals array → textarea via arrayToTextarea.
insurance_plans_requiring_referrals array → textarea via arrayToTextarea.
Save mapping:
patient_types_accepted: booleans as-is.
referral_requirements:
services_requiring_referrals: textareaToArray(...)
insurance_plans_requiring_referrals: textareaToArray(...)
6) Scheduling Policies tab (SchedulingPoliciesTab)
UI changes:
Remove/hide autoBlockAfterTwoNoShows (not supported by API).
Hydration from GET:
accept_walkins, allow_same_day.
same_day_cutoff_time → apiTimeToInput("HH:MM:SS").
min_cancellation_hours → string.
no_show_fee → string.
Save mapping:
accept_walkins, allow_same_day.
same_day_cutoff_time: inputTimeToApi("HH:MM").
min_cancellation_hours: number.
no_show_fee: number|string (format as number with 2 decimals if needed).
7) Provider Preferences tab (ProviderPreferencesTab)
Hydration from GET provider_preferences:
blackout_dates (string[]) → textarea via arrayToTextarea.
established_patients_only_days → textarea/string.
custom_scheduling_rules → textarea/string.
Save mapping:
provider_preferences:
blackout_dates: textareaToArray(...)
established_patients_only_days
custom_scheduling_rules
8) Agent Config tab (AgentConfigTab)
UI changes:
Update Language select to use API codes as values (e.g., "en-US", "es-ES", "zh-CN").
If incoming value isn’t in the list, render it as a selectable custom option.
Update Voice select to include API voices (e.g., "nova", "alloy"); support custom option if value is unknown.
Hydration from GET:
agent_name, language, voice, agent_instructions, human_transfer_criteria.
Save mapping:
PUT /:id/agent-config with fields above.
Optional “Update Voice” quick action:
PUT /:id/update-voice when only voice changes and you want a lightweight update.
9) UX polish and resilience
Disable Save when loading; show loading spinners on Save.
Toasts on success/failure per endpoint with aggregated result.
Basic retry (e.g., 2 attempts with exponential backoff) on network errors.
Keep tabs stateless regarding fetch; parent owns data and passes initialValues down.
Maintain per-tab “dirty” flags to only submit changed tabs.
10) Test plan
Hydration: Verify all tabs prefill correctly from the sample GET in schedulingagent.md.
Round-trip: Change fields in each tab and confirm the right PUT is sent with correct shapes and transforms.
Mismatch handling:
Time: "14:00:00" ↔ "14:00".
Arrays: newline ↔ arrays.
Languages/voices: unknown values still display and save.
Regression: Workflows tab continues to function (no changes).