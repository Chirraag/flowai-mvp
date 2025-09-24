1) Types and normalizers
Add API payload types in client/src/lib/launchpad.types.ts (or a new launchpad.update.types.ts) to reflect snake_case request bodies:
AccountDetailsUpdate, LocationUpdate, SpecialityServiceUpdate, InsuranceUpdate.
Create pure mapping functions in a new client/src/lib/launchpad.mappers.ts:
mapAccountUIToApi(state) -> AccountDetailsUpdate
mapLocationsUIToApi(locations) -> LocationUpdate[]
mapSpecialtiesUIToApi(specialties) -> SpecialityServiceUpdate[]
mapInsuranceUIToApi(insurance) -> InsuranceUpdate
Ensure:
Trim strings; drop empty entries; coerce numbers or set null.
Remove UI-only fields (e.g., local id on locations/specialties).
Deduplicate location_ids in specialties.
2) API layer
In client/src/lib/launchpad.ts add:
updateAccountDetails(orgId, payload: { data: AccountDetailsUpdate })
updateLocations(orgId, payload: { locations: LocationUpdate[] })
updateSpecialties(orgId, payload: { speciality_services: SpecialityServiceUpdate[] })
updateInsurance(orgId, payload: { insurance: InsuranceUpdate })
Use api.post to https://api.myflowai.com/api/v1/launchpad/{orgId}/... and return { success } or data as backend defines. The api wrapper already sets Accept and conditional Content-Type 1.
3) React Query mutations
In client/src/lib/launchpad.queries.ts add:
useUpdateAccountDetails(orgId)
useUpdateLocations(orgId)
useUpdateSpecialties(orgId)
useUpdateInsurance(orgId)
Each uses useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['launchpad', String(orgId)] }) }).
Export both mutate and mutateAsync for chaining (locations → specialties).
4) Capture original snapshot for diffing
In client/src/pages/launchpad/index.tsx, when hydrating from fetch snapshot, store immutable refs:
originalLocationsRef.current = data.locations (map of backend id → location_id).
originalSpecialtiesRef.current = data.speciality_services.
This enables computing which location_id codes changed on existing locations.
5) Cross-tab chaining logic (Locations → Specialties)
Add computeLocationIdChanges(original, updated) to return a map { oldCode -> newCode } for existing locations whose location_id changed.
Add applyLocationCodeRenamesToSpecialties(specialties, codeMap) to replace codes in every location_ids.
Locations save flow:
Build locationsPayload = mapLocationsUIToApi(locations).
await updateLocations.mutateAsync({ locations: locationsPayload }).
Compute codeChanges = computeLocationIdChanges(originalLocationsRef.current, locations).
If there are any code changes OR any specialties reference removed locations:
Build specialtiesPayload = mapSpecialtiesUIToApi(applyLocationCodeRenamesToSpecialties(specialties, codeChanges)).
await updateSpecialties.mutateAsync({ speciality_services: specialtiesPayload }).
Finally, refetch() or rely on invalidation.
6) Per-tab Save integrations
Account tab:
Add a Save button. On click:
payload = mapAccountUIToApi(...)
updateAccountDetails.mutate({ data: payload })
Locations tab:
Save button triggers the chained flow from step 5.
Specialties tab:
Save button:
payload = mapSpecialtiesUIToApi(specialties)
updateSpecialties.mutate({ speciality_services: payload })
Insurance tab:
Save button:
payload = mapInsuranceUIToApi(insurance)
updateInsurance.mutate({ insurance: payload })
7) UX, error handling, and consistency
Disable Save buttons while mutations are in-flight; show success/error toasts.
On success, either:
Refetch snapshot via query invalidation (simplest, consistent), or
Optimistically reconcile local state with submitted payloads to avoid flicker, then refetch in background.
If updateLocations succeeds but updateSpecialties fails:
Keep UI state at the pre-save version (or show a blocking banner) and prompt user to retry the Specialties update to restore consistency.
8) Validation guardrails
Client-side validation before calling:
Required: account_name, location.name, specialty_name.
Phone numbers basic format.
location_ids must match a location code present in the current locations state.
Normalize empties to null where the API expects nullable fields.
Do not send unrecognized fields to server.
9) Caching and refetch
On any successful update, invalidateQueries(['launchpad', String(orgId)]) to refetch.
Optionally debounce or batch invalidations if multiple mutations fire in sequence (the chained flow can refetch once at the end).
10) Testing
Unit test mappers and applyLocationCodeRenamesToSpecialties with Vitest.
Integration test mutation chaining (mock api.post) to verify order: locations then specialties when codes change.
Short summary:
Add typed update functions and React Query mutations for account, locations, specialties, and insurance.
Wire Save actions per tab with robust mapping and validation.
Always chain specialties update after locations when any location_id code changes; then invalidate and refetch the launchpad snapshot.







API reference:

update account details:
curl -X POST https://api.myflowai.com/api/v1/launchpad/3/update-account-details \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "account_name": "FlowAI Healthcare",
      "website_address": "https://www.flowai.com",
      "headquarters_address": "123 Main St, San Francisco, CA 94105",
      "decision_makers": [
        {
          "title": "Chief Executive Officer",
          "name": "John Doe",
          "email": "john.doe@flowai.com",
          "phone": "4155551234"
        },
        {
          "title": "Chief Technology Officer",
          "name": "Jane Smith",
          "email": "jane.smith@flowai.com",
          "phone": "4155551235"
        }
      ],
      "influencers": [
        {
          "title": "Head of Operations",
          "name": "Mike Johnson",
          "email": "mike.johnson@flowai.com",
          "phone": "4155551236"
        },
        {
          "title": "VP of Sales",
          "name": "Sarah Williams",
          "email": "sarah.williams@flowai.com",
          "phone": "4155551237"
        }
      ],
      "scheduling_structure": "Centralized",
      "rcm_structure": "In-house",
      "order_entry_team": [
        {
          "title": "Order Entry Specialist",
          "name": "Alice Brown",
          "email": "alice.brown@flowai.com",
          "phone": "4155551238"
        },
        {
          "title": "Order Entry Coordinator",
          "name": "Bob Wilson",
          "email": "bob.wilson@flowai.com",
          "phone": "4155551239"
        }
      ],
      "scheduling_team": [
        {
          "title": "Scheduling Manager",
          "name": "Carol Davis",
          "email": "carol.davis@flowai.com",
          "phone": "4155551240"
        },
        {
          "title": "Scheduling Specialist",
          "name": "David Miller",
          "email": "david.miller@flowai.com",
          "phone": "4155551241"
        }
      ],
      "patient_intake_team": [
        {
          "title": "Patient Intake Coordinator",
          "name": "Eve Anderson",
          "email": "eve.anderson@flowai.com",
          "phone": "4155551242"
        },
        {
          "title": "Patient Intake Specialist",
          "name": "Frank Thomas",
          "email": "frank.thomas@flowai.com",
          "phone": "4155551243"
        }
      ],
      "rcm_team": [
        {
          "title": "RCM Manager",
          "name": "Grace Lee",
          "email": "grace.lee@flowai.com",
          "phone": "4155551244"
        },
        {
          "title": "RCM Analyst",
          "name": "Henry Martinez",
          "email": "henry.martinez@flowai.com",
          "phone": "4155551245"
        }
      ],
      "order_entry_team_size": 2,
      "scheduling_team_size": 2,
      "patient_intake_team_size": 2,
      "rcm_team_size": 2,
      "monthly_orders_count": 500,
      "monthly_patients_scheduled": 450,
      "monthly_patients_checked_in": 425,
      "emr_ris_systems": ["Epic", "Cerner"],
      "telephony_ccas_systems": ["Five9", "RingCentral"],
      "scheduling_phone_numbers": ["4155550100", "4155550101"],
      "insurance_verification_system": "Availity",
      "insurance_verification_details": "Real-time eligibility verification",
      "additional_info": "24/7 scheduling support available",
      "clinical_notes": "Specializing in radiology and cardiology",
      "documents": []
    }
  }'


update locations:
curl -X POST https://api.myflowai.com/api/v1/launchpad/3/update-locations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [
      {
        "name": "Main Campus",
        "address_line1": "123 Main Street",
        "address_line2": "Suite 100",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "94105",
        "weekday_hours": "8:00 AM - 6:00 PM",
        "weekend_hours": "9:00 AM - 2:00 PM",
        "location_id": "LOC001",
        "specialties_services": [
          {
            "speciality_name": "Radiology",
            "services": ["X-Ray", "MRI", "CT Scan", "Ultrasound", "PET Scan"]
          },
          {
            "speciality_name": "Cardiology",
            "services": ["EKG", "Echo", "Stress Test", "Cardiac Catheterization", "Holter Monitor"]
          },
          {
            "speciality_name": "Neurology",
            "services": ["EEG", "EMG", "Nerve Conduction Studies", "Sleep Studies"]
          }
        ],
        "parking_directions": "Free parking available in Lot A"
      },
      {
        "name": "North Branch",
        "address_line1": "456 Oak Avenue",
        "address_line2": null,
        "city": "Oakland",
        "state": "CA",
        "zip_code": "94612",
        "weekday_hours": "9:00 AM - 5:00 PM",
        "weekend_hours": "Closed",
        "location_id": "LOC002",
        "specialties_services": [
          {
            "speciality_name": "General Medicine",
            "services": ["Physical Exam", "Consultation", "Preventive Care", "Chronic Disease Management"]
          },
          {
            "speciality_name": "Pediatrics",
            "services": ["Well Child Visits", "Immunizations", "Developmental Screening", "Sick Visits"]
          }
        ],
        "parking_directions": "Street parking available"
      }
    ]
  }'

update specialties:
curl -X POST https://api.myflowai.com/api/v1/launchpad/3/update-specialties \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "speciality_services": [
      {
        "specialty_name": "Radiology",
        "location_ids": ["LOC001"],
        "physician_names_source_type": "EMR",
        "physician_names_source_name": null,
        "new_patients_source_type": "Website",
        "new_patients_source_name": null,
        "physician_locations_source_type": "EMR",
        "physician_locations_source_name": null,
        "physician_credentials_source_type": "Internal Database",
        "physician_credentials_source_name": null,
        "services": [
          {
            "name": "X-Ray",
            "patient_prep_requirements": "No metal objects, remove jewelry",
            "faq": "Is X-Ray safe? Yes, modern X-rays use minimal radiation",
            "service_information_source": "Clinical Guidelines",
            "service_information_name": null
          },
          {
            "name": "MRI",
            "patient_prep_requirements": "No metal implants, fasting 4 hours before",
            "faq": "How long does an MRI take? Typically 30-60 minutes",
            "service_information_source": "Department Protocol",
            "service_information_name": null
          },
          {
            "name": "CT Scan",
            "patient_prep_requirements": "May require contrast dye, fasting 2 hours",
            "faq": "What is a CT scan? A detailed X-ray that creates cross-sectional images",
            "service_information_source": "Clinical Guidelines",
            "service_information_name": null
          },
          {
            "name": "Ultrasound",
            "patient_prep_requirements": "Full bladder for pelvic ultrasound",
            "faq": "Is ultrasound safe during pregnancy? Yes, completely safe",
            "service_information_source": "Department Protocol",
            "service_information_name": null
          },
          {
            "name": "PET Scan",
            "patient_prep_requirements": "Fasting 6 hours, avoid strenuous activity 24 hours before",
            "faq": "What does PET scan show? Metabolic activity in tissues",
            "service_information_source": "Other",
            "service_information_name": "Nuclear Medicine Department Guidelines"
          }
        ],
        "services_offered_source_type": "Service Catalog",
        "services_offered_source_name": null,
        "patient_prep_source_type": "Clinical Guidelines",
        "patient_prep_source_name": null,
        "patient_faqs_source_type": "Website",
        "patient_faqs_source_name": null,
        "documents": []
      },
      {
        "specialty_name": "Cardiology",
        "location_ids": ["LOC001", "LOC002"],
        "physician_names_source_type": "EMR",
        "physician_names_source_name": null,
        "new_patients_source_type": "Referral System",
        "new_patients_source_name": null,
        "physician_locations_source_type": "Scheduling System",
        "physician_locations_source_name": null,
        "physician_credentials_source_type": "Credentialing Database",
        "physician_credentials_source_name": null,
        "services": [
          {
            "name": "EKG",
            "patient_prep_requirements": "Wear comfortable clothing, avoid lotions on chest",
            "faq": "How long does an EKG take? About 10 minutes",
            "service_information_source": "Clinical Protocol",
            "service_information_name": null
          },
          {
            "name": "Echocardiogram",
            "patient_prep_requirements": "No special preparation needed",
            "faq": "Is echo painful? No, it uses ultrasound waves",
            "service_information_source": "Department Guidelines",
            "service_information_name": null
          },
          {
            "name": "Stress Test",
            "patient_prep_requirements": "Comfortable shoes, avoid caffeine 24 hours before",
            "faq": "What happens during a stress test? You walk on treadmill while monitored",
            "service_information_source": "Clinical Protocol",
            "service_information_name": null
          },
          {
            "name": "Cardiac Catheterization",
            "patient_prep_requirements": "Fasting 8 hours, blood work required, arrange transportation",
            "faq": "Is cardiac cath a surgery? Its a minimally invasive procedure",
            "service_information_source": "Other",
            "service_information_name": "Cardiac Cath Lab Protocol Manual"
          }
        ],
        "services_offered_source_type": "EMR",
        "services_offered_source_name": null,
        "patient_prep_source_type": "Department Guidelines",
        "patient_prep_source_name": null,
        "patient_faqs_source_type": "Patient Portal",
        "patient_faqs_source_name": null,
        "documents": []
      },
      {
        "specialty_name": "Neurology",
        "location_ids": ["LOC001"],
        "physician_names_source_type": "Other",
        "physician_names_source_name": "Department Roster Sheet",
        "new_patients_source_type": "Call Center",
        "new_patients_source_name": null,
        "physician_locations_source_type": "Other",
        "physician_locations_source_name": "Manual Schedule Tracking",
        "physician_credentials_source_type": "EMR",
        "physician_credentials_source_name": null,
        "services": [
          {
            "name": "EEG",
            "patient_prep_requirements": "Clean hair, no hair products, sleep deprived if requested",
            "faq": "What does EEG measure? Brain electrical activity",
            "service_information_source": "Clinical Guidelines",
            "service_information_name": null
          },
          {
            "name": "EMG",
            "patient_prep_requirements": "No lotions or oils on skin, wear loose clothing",
            "faq": "Is EMG painful? May feel slight discomfort from needles",
            "service_information_source": "Department Protocol",
            "service_information_name": null
          },
          {
            "name": "Nerve Conduction Studies",
            "patient_prep_requirements": "No special preparation, inform about pacemakers",
            "faq": "How long does NCS take? Usually 30-60 minutes",
            "service_information_source": "Clinical Guidelines",
            "service_information_name": null
          },
          {
            "name": "Sleep Studies",
            "patient_prep_requirements": "Regular sleep schedule, no naps day of study, bring pajamas",
            "faq": "Do I stay overnight? Yes, typically 8-10 hours",
            "service_information_source": "Other",
            "service_information_name": "Sleep Lab Patient Guide"
          }
        ],
        "services_offered_source_type": "Other",
        "services_offered_source_name": "Department Service List",
        "patient_prep_source_type": "Website",
        "patient_prep_source_name": null,
        "patient_faqs_source_type": "Other",
        "patient_faqs_source_name": "Department FAQ Document",
        "documents": []
      },
      {
        "specialty_name": "Pediatrics",
        "location_ids": ["LOC002"],
        "physician_names_source_type": "EMR",
        "physician_names_source_name": null,
        "new_patients_source_type": "Website",
        "new_patients_source_name": null,
        "physician_locations_source_type": "Scheduling System",
        "physician_locations_source_name": null,
        "physician_credentials_source_type": "Credentialing Database",
        "physician_credentials_source_name": null,
        "services": [
          {
            "name": "Well Child Visits",
            "patient_prep_requirements": "Bring immunization records, list of questions",
            "faq": "How often are well visits? Depends on age, typically yearly after age 3",
            "service_information_source": "AAP Guidelines",
            "service_information_name": null
          },
          {
            "name": "Immunizations",
            "patient_prep_requirements": "Bring immunization card, comfortable clothing",
            "faq": "Are vaccines safe? Yes, thoroughly tested and monitored",
            "service_information_source": "CDC Schedule",
            "service_information_name": null
          },
          {
            "name": "Developmental Screening",
            "patient_prep_requirements": "No special preparation, observe child behavior",
            "faq": "What is screened? Speech, motor skills, social development",
            "service_information_source": "AAP Guidelines",
            "service_information_name": null
          },
          {
            "name": "School Physicals",
            "patient_prep_requirements": "Bring school forms, sports participation forms if needed",
            "faq": "When needed? Usually yearly for sports, every 2-3 years otherwise",
            "service_information_source": "State Requirements",
            "service_information_name": null
          },
          {
            "name": "ADHD Evaluation",
            "patient_prep_requirements": "Teacher evaluations, bring school reports",
            "faq": "How long does evaluation take? Initial visit 60-90 minutes",
            "service_information_source": "Other",
            "service_information_name": "Pediatric Behavioral Health Protocol"
          }
        ],
        "services_offered_source_type": "EMR",
        "services_offered_source_name": null,
        "patient_prep_source_type": "Clinical Guidelines",
        "patient_prep_source_name": null,
        "patient_faqs_source_type": "Website",
        "patient_faqs_source_name": null,
        "documents": []
      }
    ]
  }'

chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/update-insurance \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODE1MDY4NiwiZXhwIjoxNzU4MjM3MDg2fQ.0hsHtUSFEGXoV7Y181bAK23NmkIi6E0HODsvpJ6oYTg" \
  -H "Content-Type: application/json" \
  -d '{
    "insurance": {
      "accepted_payers_source": "Payer List",
      "accepted_payers_source_details": "Updated monthly from contracting department. Includes Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, United Healthcare, Humana",
      "insurance_verification_source": "Availity",
      "insurance_verification_source_details": "Real-time eligibility and benefits verification with automated prior authorization support",
      "patient_copay_source": "Insurance Verification System",
      "patient_copay_source_details": "Automated copay calculation based on real-time benefits verification, integrated with patient billing system",
      "documents": []
    }
  }'
