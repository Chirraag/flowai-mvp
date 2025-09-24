curl -X 'POST' \
  'https://api.myflowai.com/api/v1/launchpad/3/fetch-data' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODEwOTE5MiwiZXhwIjoxNzU4MTk1NTkyfQ.PCa8ax9-1jCZcjsgb9uoYmYNI_pRsvdztDahjSFP1Us' \
  -d ''

{
  "success": true,
  "data": {
    "organization": {
      "org_id": 3,
      "name": "Flowai",
      "created_at": "2025-09-04T04:26:28.687Z",
      "updated_at": "2025-09-19T14:28:18.164Z"
    },
    "account_details": {
      "id": "8e12ff92-bbd2-4f5b-b488-650f301005a6",
      "org_id": 3,
      "account_name": "FlowAI Healthcare",
      "website_address": "https://www.flowai.com",
      "headquarters_address": "123 Main St, San Francisco, CA 94105",
      "decision_makers": [
        {
          "name": "John Doe",
          "email": "john.doe@flowai.com",
          "phone": "4155551234",
          "title": "Chief Executive Officer"
        },
        {
          "name": "Jane Smith",
          "email": "jane.smith@flowai.com",
          "phone": "4155551235",
          "title": "Chief Technology Officer"
        }
      ],
      "influencers": [
        {
          "name": "Mike John",
          "email": "mike.johnson@flowai.com",
          "phone": "4155551236",
          "title": "Head of Operations"
        },
        {
          "name": "Sarah William",
          "email": "sarah.williams@flowai.com",
          "phone": "4155551237",
          "title": "VP of Sales"
        },
        {
          "name": "Martin Perez",
          "email": "martin.perez@flowai.com",
          "phone": "4155524234",
          "title": "Manager"
        }
      ],
      "scheduling_structure": "Centralized",
      "rcm_structure": "In-house",
      "order_entry_team": [
        {
          "name": "Alice Brown",
          "email": "alice.green@flowai.com",
          "phone": "4155551238",
          "title": "Order Entry Specialist"
        },
        {
          "name": "Bob Wilson",
          "email": "bob.wilson@flowai.com",
          "phone": "4155551239",
          "title": "Order Entry Coordinator"
        }
      ],
      "scheduling_team": [
        {
          "name": "Carol Davis",
          "email": "carol.davis@flowai.com",
          "phone": "4155551240",
          "title": "Scheduling Manager"
        },
        {
          "name": "David Miller",
          "email": "david.miller@flowai.com",
          "phone": "4155551241",
          "title": "Scheduling Specialist"
        }
      ],
      "patient_intake_team": [
        {
          "name": "Eve Anderson",
          "email": "eve.anderson@flowai.com",
          "phone": "4155551242",
          "title": "Patient Intake Coordinator"
        },
        {
          "name": "Frank Thomas",
          "email": "frank.thomas@flowai.com",
          "phone": "4155551243",
          "title": "Patient Intake Specialist"
        }
      ],
      "rcm_team": [
        {
          "name": "Grace Lee",
          "email": "grace.lee@flowai.com",
          "phone": "4155551244",
          "title": "RCM Manager"
        },
        {
          "name": "Henry Martinez",
          "email": "henry.martinez@flowai.com",
          "phone": "4155551245",
          "title": "RCM Analyst"
        }
      ],
      "order_entry_team_size": 2,
      "scheduling_team_size": 2,
      "patient_intake_team_size": 2,
      "rcm_team_size": 2,
      "monthly_orders_count": 500,
      "monthly_patients_scheduled": 450,
      "monthly_patients_checked_in": 425,
      "emr_ris_systems": [
        "Epic",
        "Cerner"
      ],
      "telephony_ccas_systems": [
        "Five9",
        "RingCentral"
      ],
      "scheduling_phone_numbers": [
        "4155550100",
        "4155550101",
        "4328768234"
      ],
      "insurance_verification_system": "Availity",
      "insurance_verification_details": "Real-time eligibility verification",
      "additional_info": "24/7 scheduling support available",
      "clinical_notes": "Specializing in radiology and cardiology",
      "documents": [],
      "created_at": "2025-09-17T23:32:33.899Z",
      "updated_at": "2025-09-19T14:27:20.334Z"
    },
    "locations": [
      {
        "id": "dde9c88d-7909-46ba-8645-47256ddfa529",
        "org_id": 3,
        "name": "Ead Urology",
        "address_line1": "4rth avenue",
        "address_line2": "3rd street",
        "city": "miami",
        "state": "FL",
        "zip_code": "600345",
        "weekday_hours": null,
        "weekend_hours": null,
        "location_id": "LOC004",
        "specialties_services": [],
        "parking_directions": null,
        "documents": [],
        "is_active": true,
        "created_at": "2025-09-19T13:53:18.228Z",
        "updated_at": "2025-09-19T13:53:18.228Z"
      },
      {
        "id": "a1fafc40-2603-4d49-b502-39fb68851880",
        "org_id": 3,
        "name": "Main hospital",
        "address_line1": "street",
        "address_line2": "suite",
        "city": "miami",
        "state": "FL",
        "zip_code": "456456",
        "weekday_hours": null,
        "weekend_hours": null,
        "location_id": "LOC005",
        "specialties_services": [],
        "parking_directions": null,
        "documents": [],
        "is_active": true,
        "created_at": "2025-09-19T13:53:18.228Z",
        "updated_at": "2025-09-19T13:53:18.228Z"
      },
      {
        "id": "a89bf1dd-e944-4e9d-8fda-7612f28c1d63",
        "org_id": 3,
        "name": "Main Hospital",
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
            "services": [
              "X-Ray",
              "MRI",
              "CT Scan",
              "Ultrasound",
              "PET Scan"
            ],
            "speciality_name": "Radiology"
          },
          {
            "services": [
              "EKG",
              "Echo",
              "Stress Test",
              "Cardiac Catheterization",
              "Holter Monitor"
            ],
            "speciality_name": "Cardiology"
          },
          {
            "services": [
              "EEG",
              "EMG",
              "Nerve Conduction Studies",
              "Sleep Studies"
            ],
            "speciality_name": "Neurology"
          }
        ],
        "parking_directions": "Free parking available in Lot B",
        "documents": [],
        "is_active": true,
        "created_at": "2025-09-19T13:53:18.228Z",
        "updated_at": "2025-09-19T13:53:18.228Z"
      },
      {
        "id": "c3af42c2-a10f-428e-bb6b-90e63fedd3b8",
        "org_id": 3,
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
            "services": [
              "Physical Exam",
              "Consultation",
              "Preventive Care",
              "Chronic Disease Management"
            ],
            "speciality_name": "General Medicine"
          },
          {
            "services": [
              "Well Child Visits",
              "Immunizations",
              "Developmental Screening",
              "Sick Visits"
            ],
            "speciality_name": "Pediatrics"
          }
        ],
        "parking_directions": "Street parking available",
        "documents": [],
        "is_active": true,
        "created_at": "2025-09-19T13:53:18.228Z",
        "updated_at": "2025-09-19T13:53:18.228Z"
      },
      {
        "id": "8bc4f0f3-fa7e-4984-a60b-c27a41fab41e",
        "org_id": 3,
        "name": "Uchicago Hyde Park",
        "address_line1": "5815 S. Maryland Ave",
        "address_line2": null,
        "city": "Chicago",
        "state": "CA",
        "zip_code": "60637",
        "weekday_hours": "8:00 am - 5:00 pm",
        "weekend_hours": "closed",
        "location_id": "LOC003",
        "specialties_services": [
          {
            "services": [
              "brain scan"
            ],
            "speciality_name": "Neurology"
          }
        ],
        "parking_directions": "park in basement",
        "documents": [],
        "is_active": true,
        "created_at": "2025-09-19T13:53:18.228Z",
        "updated_at": "2025-09-19T13:53:18.228Z"
      }
    ],
    "speciality_services": [
      {
        "id": "1bd46211-fce7-4a91-83ef-38cd1cd56379",
        "org_id": 3,
        "specialty_name": "Cardiology",
        "location_ids": [
          "LOC001",
          "LOC002"
        ],
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
            "faq": "How long does an EKG take? About 10 minutes",
            "name": "EKG",
            "service_information_name": null,
            "patient_prep_requirements": "Wear comfortable clothing, avoid lotions on chest",
            "service_information_source": "Clinical Protocol"
          },
          {
            "faq": "Is echo painful? No, it uses ultrasound waves",
            "name": "Echocardiogram",
            "service_information_name": null,
            "patient_prep_requirements": "No special preparation needed",
            "service_information_source": "Department Guidelines"
          },
          {
            "faq": "What happens during a stress test? You walk on treadmill while monitored",
            "name": "Stress Test",
            "service_information_name": null,
            "patient_prep_requirements": "Comfortable shoes, avoid caffeine 24 hours before",
            "service_information_source": "Clinical Protocol"
          },
          {
            "faq": "Is cardiac cath a surgery? Its a minimally invasive procedure",
            "name": "Cardiac Catheterization",
            "service_information_name": "Cardiac Cath Lab Protocol Manual",
            "patient_prep_requirements": "Fasting 8 hours, blood work required, arrange transportation",
            "service_information_source": "Other"
          }
        ],
        "services_offered_source_type": "EMR",
        "services_offered_source_name": null,
        "patient_prep_source_type": "Department Guidelines",
        "patient_prep_source_name": null,
        "patient_faqs_source_type": "Patient Portal",
        "patient_faqs_source_name": null,
        "documents": [
          {
            "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/specialties/1758267979868-debc6305-414f-4165-ab7f-56c1bfdd50df-flowai-test-doc.txt",
            "name": "flowai-test-doc.txt",
            "uploaded_at": "2025-09-19T07:46:19.946Z",
            "uploaded_by": 1
          }
        ],
        "is_active": true,
        "created_at": "2025-09-18T01:05:44.034Z",
        "updated_at": "2025-09-19T07:46:19.948Z"
      },
      {
        "id": "321c50d6-b6ef-40fe-8e81-2c752d63d61f",
        "org_id": 3,
        "specialty_name": "Neurology",
        "location_ids": [
          "LOC001"
        ],
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
            "faq": "What does EEG measure? Brain electrical activity",
            "name": "EEG",
            "service_information_name": null,
            "patient_prep_requirements": "Clean hair, no hair products, sleep deprived if requested",
            "service_information_source": "Clinical Guidelines"
          },
          {
            "faq": "Is EMG painful? May feel slight discomfort from needles",
            "name": "EMG",
            "service_information_name": null,
            "patient_prep_requirements": "No lotions or oils on skin, wear loose clothing",
            "service_information_source": "Department Protocol"
          },
          {
            "faq": "How long does NCS take? Usually 30-60 minutes",
            "name": "Nerve Conduction Studies",
            "service_information_name": null,
            "patient_prep_requirements": "No special preparation, inform about pacemakers",
            "service_information_source": "Clinical Guidelines"
          },
          {
            "faq": "Do I stay overnight? Yes, typically 8-10 hours",
            "name": "Sleep Studies",
            "service_information_name": "Sleep Lab Patient Guide",
            "patient_prep_requirements": "Regular sleep schedule, no naps day of study, bring pajamas",
            "service_information_source": "Other"
          }
        ],
        "services_offered_source_type": "Other",
        "services_offered_source_name": "Department Service List",
        "patient_prep_source_type": "Website",
        "patient_prep_source_name": null,
        "patient_faqs_source_type": "Other",
        "patient_faqs_source_name": "Department FAQ Document",
        "documents": [
          {
            "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/specialties/1758267979868-debc6305-414f-4165-ab7f-56c1bfdd50df-flowai-test-doc.txt",
            "name": "flowai-test-doc.txt",
            "uploaded_at": "2025-09-19T07:46:19.946Z",
            "uploaded_by": 1
          }
        ],
        "is_active": true,
        "created_at": "2025-09-18T01:05:44.034Z",
        "updated_at": "2025-09-19T07:46:19.948Z"
      },
      {
        "id": "1a47f7b7-c1df-4d22-b2e1-ca8864f915cf",
        "org_id": 3,
        "specialty_name": "Pediatrics",
        "location_ids": [
          "LOC002"
        ],
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
            "faq": "How often are well visits? Depends on age, typically yearly after age 3",
            "name": "Well Child Visits",
            "service_information_name": null,
            "patient_prep_requirements": "Bring immunization records, list of questions",
            "service_information_source": "AAP Guidelines"
          },
          {
            "faq": "Are vaccines safe? Yes, thoroughly tested and monitored",
            "name": "Immunizations",
            "service_information_name": null,
            "patient_prep_requirements": "Bring immunization card, comfortable clothing",
            "service_information_source": "CDC Schedule"
          },
          {
            "faq": "What is screened? Speech, motor skills, social development",
            "name": "Developmental Screening",
            "service_information_name": null,
            "patient_prep_requirements": "No special preparation, observe child behavior",
            "service_information_source": "AAP Guidelines"
          },
          {
            "faq": "When needed? Usually yearly for sports, every 2-3 years otherwise",
            "name": "School Physicals",
            "service_information_name": null,
            "patient_prep_requirements": "Bring school forms, sports participation forms if needed",
            "service_information_source": "State Requirements"
          },
          {
            "faq": "How long does evaluation take? Initial visit 60-90 minutes",
            "name": "ADHD Evaluation",
            "service_information_name": "Pediatric Behavioral Health Protocol",
            "patient_prep_requirements": "Teacher evaluations, bring school reports",
            "service_information_source": "Other"
          }
        ],
        "services_offered_source_type": "EMR",
        "services_offered_source_name": null,
        "patient_prep_source_type": "Clinical Guidelines",
        "patient_prep_source_name": null,
        "patient_faqs_source_type": "Website",
        "patient_faqs_source_name": null,
        "documents": [
          {
            "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/specialties/1758267979868-debc6305-414f-4165-ab7f-56c1bfdd50df-flowai-test-doc.txt",
            "name": "flowai-test-doc.txt",
            "uploaded_at": "2025-09-19T07:46:19.946Z",
            "uploaded_by": 1
          }
        ],
        "is_active": true,
        "created_at": "2025-09-18T01:05:44.034Z",
        "updated_at": "2025-09-19T07:46:19.948Z"
      },
      {
        "id": "63fa45fa-e845-4896-a464-4a11aa376f94",
        "org_id": 3,
        "specialty_name": "Radiology",
        "location_ids": [
          "LOC001"
        ],
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
            "faq": "Is X-Ray safe? Yes, modern X-rays use minimal radiation",
            "name": "X-Ray",
            "service_information_name": null,
            "patient_prep_requirements": "No metal objects, remove jewelry",
            "service_information_source": "Clinical Guidelines"
          },
          {
            "faq": "How long does an MRI take? Typically 30-60 minutes",
            "name": "MRI",
            "service_information_name": null,
            "patient_prep_requirements": "No metal implants, fasting 4 hours before",
            "service_information_source": "Department Protocol"
          },
          {
            "faq": "What is a CT scan? A detailed X-ray that creates cross-sectional images",
            "name": "CT Scan",
            "service_information_name": null,
            "patient_prep_requirements": "May require contrast dye, fasting 2 hours",
            "service_information_source": "Clinical Guidelines"
          },
          {
            "faq": "Is ultrasound safe during pregnancy? Yes, completely safe",
            "name": "Ultrasound",
            "service_information_name": null,
            "patient_prep_requirements": "Full bladder for pelvic ultrasound",
            "service_information_source": "Department Protocol"
          },
          {
            "faq": "What does PET scan show? Metabolic activity in tissues",
            "name": "PET Scan",
            "service_information_name": "Nuclear Medicine Department Guidelines",
            "patient_prep_requirements": "Fasting 6 hours, avoid strenuous activity 24 hours before",
            "service_information_source": "Other"
          }
        ],
        "services_offered_source_type": "Service Catalog",
        "services_offered_source_name": null,
        "patient_prep_source_type": "Clinical Guidelines",
        "patient_prep_source_name": null,
        "patient_faqs_source_type": "Website",
        "patient_faqs_source_name": null,
        "documents": [
          {
            "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/specialties/1758267979868-debc6305-414f-4165-ab7f-56c1bfdd50df-flowai-test-doc.txt",
            "name": "flowai-test-doc.txt",
            "uploaded_at": "2025-09-19T07:46:19.946Z",
            "uploaded_by": 1
          }
        ],
        "is_active": true,
        "created_at": "2025-09-18T01:05:44.034Z",
        "updated_at": "2025-09-19T07:46:19.948Z"
      }
    ],
    "insurance": {
      "id": "28f8641b-6031-4c18-8775-42ac5dd33249",
      "org_id": 3,
      "accepted_payers_source": "Other",
      "accepted_payers_source_details": "Updated monthly from contracting department. Includes Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, United Healthcare, Humana",
      "insurance_verification_source": "RCM",
      "insurance_verification_source_details": "Real-time eligibility and benefits verification with automated prior authorization support",
      "patient_copay_source": "Other",
      "patient_copay_source_details": "Automated copay calculation based on real-time benefits verification, integrated with patient billing system",
      "documents": [],
      "is_active": true,
      "created_at": "2025-09-18T01:09:39.584Z",
      "updated_at": "2025-09-19T13:53:39.198Z"
    },
    "curated_kb": [
      {
        "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758266012446-0297ebf9-8e54-469c-bb04-0616636ad7ee-Flowai_KB_1758266012446.docx",
        "name": "Flowai_KB_1758266012446.docx",
        "type": "curated_kb",
        "s3_key": "org-3/organisation_kb/1758266012446-0297ebf9-8e54-469c-bb04-0616636ad7ee-Flowai_KB_1758266012446.docx",
        "uploaded_at": "2025-09-19T07:13:32.512Z",
        "uploaded_by": 1
      },
      {
        "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758268238394-53d9f766-7055-4e41-9726-5f7d1e997f7f-Flowai_KB_1758268238394.docx",
        "name": "Flowai_KB_1758268238394.docx",
        "type": "curated_kb",
        "s3_key": "org-3/organisation_kb/1758268238394-53d9f766-7055-4e41-9726-5f7d1e997f7f-Flowai_KB_1758268238394.docx",
        "uploaded_at": "2025-09-19T07:50:38.478Z",
        "uploaded_by": 1
      },
      {
        "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758268767700-45cde7a0-8342-4601-8470-d666168b9207-Flowai_KB_1758268767699.docx",
        "name": "Flowai_KB_1758268767699.docx",
        "type": "curated_kb",
        "s3_key": "org-3/organisation_kb/1758268767700-45cde7a0-8342-4601-8470-d666168b9207-Flowai_KB_1758268767699.docx",
        "uploaded_at": "2025-09-19T07:59:27.785Z",
        "uploaded_by": 1
      },
      {
        "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758289161672-d017a0d0-630a-4464-8efb-9c487b7ee14e-Flowai_KB_1758289161671.docx",
        "name": "Flowai_KB_1758289161671.docx",
        "type": "curated_kb",
        "s3_key": "org-3/organisation_kb/1758289161672-d017a0d0-630a-4464-8efb-9c487b7ee14e-Flowai_KB_1758289161671.docx",
        "uploaded_at": "2025-09-19T13:39:22.472Z",
        "uploaded_by": 1
      },
      {
        "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758289659825-80320d58-01aa-4977-a069-7c79a4419ca9-Flowai_KB_1758289659824.docx",
        "name": "Flowai_KB_1758289659824.docx",
        "type": "curated_kb",
        "s3_key": "org-3/organisation_kb/1758289659825-80320d58-01aa-4977-a069-7c79a4419ca9-Flowai_KB_1758289659824.docx",
        "uploaded_at": "2025-09-19T13:47:40.645Z",
        "uploaded_by": 1
      },
      {
        "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758290403460-b813deeb-a18e-48f1-8a57-d1ea2ed8982f-Flowai_KB_1758290403460.docx",
        "name": "Flowai_KB_1758290403460.docx",
        "type": "curated_kb",
        "s3_key": "org-3/organisation_kb/1758290403460-b813deeb-a18e-48f1-8a57-d1ea2ed8982f-Flowai_KB_1758290403460.docx",
        "uploaded_at": "2025-09-19T14:00:04.289Z",
        "uploaded_by": 1
      },
      {
        "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758291722383-bef02739-016b-4ba8-b5e9-844087152ebc-Flowai_KB_1758291722383.docx",
        "name": "Flowai_KB_1758291722383.docx",
        "type": "curated_kb",
        "s3_key": "org-3/organisation_kb/1758291722383-bef02739-016b-4ba8-b5e9-844087152ebc-Flowai_KB_1758291722383.docx",
        "uploaded_at": "2025-09-19T14:22:02.479Z",
        "uploaded_by": 1
      },
      {
        "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758292095030-b42b515b-7d6a-4948-a7dd-98e598fa36d8-Flowai_KB_1758292095030.docx",
        "name": "Flowai_KB_1758292095030.docx",
        "type": "curated_kb",
        "s3_key": "org-3/organisation_kb/1758292095030-b42b515b-7d6a-4948-a7dd-98e598fa36d8-Flowai_KB_1758292095030.docx",
        "uploaded_at": "2025-09-19T14:28:16.072Z",
        "uploaded_by": 1
      }
    ],
    "metadata": {
      "last_updated": "2025-09-19T14:28:18.164Z",
      "org_id": 3,
      "user_role": "super-admin",
      "curated_kb_count": 8
    }
  }


postgresql table structure, each row data type:
CREATE TABLE org_account_details (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   org_id INTEGER NOT NULL REFERENCES organisations(org_id) ON DELETE CASCADE,
   account_name VARCHAR(255) NOT NULL,
   website_address VARCHAR(255),
   headquarters_address TEXT,
   decision_makers JSONB DEFAULT '[]'::JSONB,
   influencers JSONB DEFAULT '[]'::JSONB,
   scheduling_structure VARCHAR(100),
   rcm_structure VARCHAR(100),
   order_entry_team JSONB DEFAULT '[]'::JSONB,
   scheduling_team JSONB DEFAULT '[]'::JSONB,
   patient_intake_team JSONB DEFAULT '[]'::JSONB,
   rcm_team JSONB DEFAULT '[]'::JSONB,
   order_entry_team_size INTEGER,
   scheduling_team_size INTEGER,
   patient_intake_team_size INTEGER,
   rcm_team_size INTEGER,
   monthly_orders_count INTEGER,
   monthly_patients_scheduled INTEGER,
   monthly_patients_checked_in INTEGER,
   emr_ris_systems JSONB DEFAULT '[]'::JSONB,
   telephony_ccas_systems JSONB DEFAULT '[]'::JSONB,
   scheduling_phone_numbers JSONB DEFAULT '[]'::JSONB,
   insurance_verification_system VARCHAR(255),
   insurance_verification_details TEXT,
   additional_info TEXT,
   clinical_notes TEXT,
   documents JSONB DEFAULT '[]'::JSONB,
   created_by INTEGER REFERENCES users(id),
   updated_by INTEGER REFERENCES users(id),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   UNIQUE(org_id)
);

CREATE TABLE org_locations (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   org_id INTEGER NOT NULL REFERENCES organisations(org_id) ON DELETE CASCADE,
   name VARCHAR(255) NOT NULL,
   address_line1 VARCHAR(255),
   address_line2 VARCHAR(255),
   city VARCHAR(100),
   state VARCHAR(50),
   zip_code VARCHAR(20),
   weekday_hours TEXT,
   weekend_hours TEXT,
   location_id TEXT,
   specialties_services JSONB DEFAULT '[]'::JSONB,
   parking_directions TEXT,
   documents JSONB DEFAULT '[]'::JSONB,
   is_active BOOLEAN DEFAULT true,
   created_by INTEGER REFERENCES users(id),
   updated_by INTEGER REFERENCES users(id),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


BEGIN;
DROP TABLE IF EXISTS org_speciality_services CASCADE;
CREATE TABLE org_speciality_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id INTEGER NOT NULL REFERENCES organisations(org_id) ON DELETE CASCADE,
    specialty_name VARCHAR(255) NOT NULL,
    location_ids TEXT[],
    physician_names_source VARCHAR(50),
    physician_names_source_other TEXT,
    new_patients_source VARCHAR(50),
    new_patients_source_other TEXT,
    physician_locations_source VARCHAR(50),
    physician_locations_source_other TEXT,
    physician_credentials_source VARCHAR(50),
    physician_credentials_source_other TEXT,
    services JSONB DEFAULT '[]'::JSONB,
    services_offered_source VARCHAR(50),
    services_offered_source_other TEXT,
    patient_prep_source VARCHAR(50),
    patient_prep_source_other TEXT,
    patient_faqs_source VARCHAR(50),
    patient_faqs_source_other TEXT,
    documents JSONB DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(org_id, specialty_name)
);
CREATE INDEX idx_org_speciality_services_org_id ON org_speciality_services(org_id);
CREATE INDEX idx_org_speciality_services_specialty_name ON org_speciality_services(specialty_name);
CREATE INDEX idx_org_speciality_services_location_ids ON org_speciality_services USING gin(location_ids);
CREATE INDEX idx_org_speciality_services_services ON org_speciality_services USING gin(services);
CREATE INDEX idx_org_speciality_services_active ON org_speciality_services(is_active) WHERE is_active = true;
CREATE OR REPLACE FUNCTION update_org_speciality_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_org_speciality_services_updated_at
    BEFORE UPDATE ON org_speciality_services
    FOR EACH ROW
    EXECUTE FUNCTION update_org_speciality_services_updated_at();
COMMIT;



Org_insurance


CREATE TABLE org_insurance ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id INTEGER NOT NULL REFERENCES organisations(org_id) ON DELETE CASCADE, accepted_payers_source VARCHAR(50), accepted_payers_source_details TEXT, insurance_verification_source VARCHAR(50), insurance_verification_source_details TEXT, patient_copay_source VARCHAR(50), patient_copay_source_details TEXT, documents JSONB DEFAULT '[]'::JSONB, is_active BOOLEAN DEFAULT true, created_by INTEGER REFERENCES users(id), updated_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(org_id) ); CREATE INDEX idx_org_insurance_org_id ON org_insurance(org_id); CREATE INDEX idx_org_insurance_documents ON org_insurance USING gin(documents); CREATE INDEX idx_org_insurance_active ON org_insurance(is_active) WHERE is_active = true; CREATE OR REPLACE FUNCTION update_org_insurance_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql; CREATE TRIGGER trigger_update_org_insurance_updated_at BEFORE UPDATE ON org_insurance FOR EACH ROW EXECUTE FUNCTION update_org_insurance_updated_at(); COMMIT;

Account
Overview
Account name — text — account_name — PostgreSQL: VARCHAR(255)
Description: Legal or customer-facing account name.
Validation: Required, max 255 characters.

Website address — url — website_address — PostgreSQL: VARCHAR(255)
Description: Primary website for the account.
Validation: Must be a valid URL, max 255 characters.

Headquarters address — textarea — headquarters_address — PostgreSQL: TEXT
Description: Full address including street, city, state, ZIP.
Validation: Optional.

Decision makers
Key decision makers — repeatable group — decision_makers — PostgreSQL: JSONB
Description: People who approve or influence purchasing. Enable addition.
Structure: { title[text], name[text], email[email], phone[tel] }
Validation: If provided, email must be valid; phone E.164 or 10–15 digits.

Key influencers — repeatable group — influencers — PostgreSQL: JSONB
Description: Non-final approvers who influence decisions. Enable addition.
Structure: { title[text], name[text], email[email], phone[tel] }
Validation: Same as above.

Centralized vs decentralized scheduling — select — scheduling_structure — PostgreSQL: VARCHAR(100)
Description: Scheduling model.
Options: Centralized, Decentralized.
Validation: One of the options.

Who does Order Entry Team report to? — repeatable-single object — order_entry_reports_to — PostgreSQL: JSONB (new)
Description: Reporting manager contact for Order Entry.
Structure: { title[text], name[text], email[email], phone[tel] }
Validation: At least name; email if provided must be valid.

Who does Scheduling Team report to? — repeatable-single object — scheduling_reports_to — PostgreSQL: JSONB (new)
Description: Reporting manager contact for Scheduling.
Structure/Validation: Same pattern as above.

Who does Patient Intake/Check-In Team report to? — repeatable-single object — patient_intake_reports_to — PostgreSQL: JSONB (new)
Description: Reporting manager for Patient Intake/Check-In.
Help: (Include all front desk staff at the clinics)
Structure/Validation: Same pattern as above.

Is RCM in-house/partially/fully outsourced? — select — rcm_structure — PostgreSQL: VARCHAR(100)
Description: RCM sourcing model.
Options: In-house, Partially outsourced, Fully outsourced.

Who does the RCM team report to? — repeatable-single object — rcm_reports_to — PostgreSQL: JSONB (new)
Description: Reporting manager for RCM.
Structure/Validation: Same pattern as above.

Team size
Order Entry team size — number — order_entry_team_size — PostgreSQL: INTEGER
Description: Headcount in Order Entry.
Validation: Integer ≥ 0.

Scheduling team size — number — scheduling_team_size — PostgreSQL: INTEGER
Description: Headcount in Scheduling.
Validation: Integer ≥ 0.

Patient Intake/Check-In team size — number — patient_intake_team_size — PostgreSQL: INTEGER
Description: Headcount in Patient Intake/Check-In.
Validation: Integer ≥ 0.

RCM team size — number — rcm_team_size — PostgreSQL: INTEGER
Description: Headcount in RCM.
Validation: Integer ≥ 0.

Opportunity sizing
Monthly orders entered — number — monthly_orders_count — PostgreSQL: INTEGER
Description: Total monthly orders across all sites.
Validation: Integer ≥ 0.

Monthly patients scheduled — number — monthly_patients_scheduled — PostgreSQL: INTEGER
Description: Total monthly scheduled patients across all sites.
Validation: Integer ≥ 0.

Monthly patients checked in — number — monthly_patients_checked_in — PostgreSQL: INTEGER
Description: Total monthly check-ins across all sites.
Validation: Integer ≥ 0.

Systems
EMR/RIS systems — multi-select with add — emr_ris_systems — PostgreSQL: JSONB
Description: One or more systems of record. Enable addition.
Values: Array of strings.
Validation: Non-empty strings.

Telephony/CCaaS systems — multi-select with add — telephony_ccas_systems — PostgreSQL: JSONB
Description: Telephony/contact center platforms.
Values: Array of strings.

Scheduling numbers mode — radio (Single or Multiple) — scheduling_numbers_mode — PostgreSQL: VARCHAR(20) (new)
Description: Whether there is one centralized number or multiple local numbers.
Options: Single, Multiple.

Scheduling phone number(s) — tags (tel) — scheduling_phone_numbers — PostgreSQL: JSONB
Description: One or more phone numbers. Enable addition.
Validation: Each in E.164 or 10–15 digits.

Insurance verification system(s) — chips with add — insurance_verification_system — PostgreSQL: VARCHAR(255)
Description: System used for insurance verification/co-pay.
Note: For multiple systems, capture in details or add structured array.
Alternative (structured): insurance_verification_systems — JSONB (new, optional) with { system[text], type[select: EMR, RCM, Other] }.

Insurance verification details — textarea — insurance_verification_details — PostgreSQL: TEXT
Description: Notes on process, multiple systems used, prior auth behavior.

Others
Additional info — textarea — additional_info — PostgreSQL: TEXT
Description: Any other account details.

Clinical notes — textarea — clinical_notes — PostgreSQL: TEXT
Description: Clinical focus, modalities, specialties.

Document upload
Documents — file[] — documents — PostgreSQL: JSONB
Description: Relevant customer documents.
Validation: Enforce file size/type in app layer.

System fields
ID — read-only — id — PostgreSQL: UUID

Org ID — hidden — org_id — PostgreSQL: INTEGER

Created by — hidden — created_by — PostgreSQL: INTEGER

Updated by — hidden — updated_by — PostgreSQL: INTEGER

Created at — read-only — created_at — PostgreSQL: TIMESTAMP

Updated at — read-only — updated_at — PostgreSQL: TIMESTAMP

Customer (Clinic Locations)
Clinic info
Clinic/Hospital/Center name — text — name — PostgreSQL: VARCHAR(255)
Description: Display name of the location.
Validation: Required.

Address line 1 — text — address_line1 — PostgreSQL: VARCHAR(255)
Description: Street address.
Validation: Recommended.

Address line 2 — text — address_line2 — PostgreSQL: VARCHAR(255)
Description: Suite, floor, etc.

City — text — city — PostgreSQL: VARCHAR(100)

State — select — state — PostgreSQL: VARCHAR(50)

ZIP code — text — zip_code — PostgreSQL: VARCHAR(20)

Weekday hours — text — weekday_hours — PostgreSQL: TEXT
Description: Hours available for patient appointments.

Weekend hours — text — weekend_hours — PostgreSQL: TEXT
Description: Hours available for patient appointments.

Specialties covered (free text) — textarea — specialties_text — PostgreSQL: TEXT (new)
Description: Free-text list of specialties; use “All specialties” if hospital.

Services provided (free text) — textarea — services_text — PostgreSQL: TEXT (new)
Description: Free-text list of services offered at location.

Specialties/services (structured) — JSON editor — specialties_services — PostgreSQL: JSONB
Description: Optional structured capture.
Structure: [{ speciality_name: string, services: string[] }]
Note: Keep in sync with free-text fields if both are used.

Parking directions — textarea — parking_directions — PostgreSQL: TEXT

Internal location ID — text — location_id — PostgreSQL: TEXT
Description: Customer’s or internal mapping code.

Is active — switch — is_active — PostgreSQL: BOOLEAN

Document upload
Documents — file[] — documents — PostgreSQL: JSONB

System fields
ID — read-only — id — PostgreSQL: UUID

Org ID — hidden — org_id — PostgreSQL: INTEGER

Created by — hidden — created_by — PostgreSQL: INTEGER

Updated by — hidden — updated_by — PostgreSQL: INTEGER

Created at — read-only — created_at — PostgreSQL: TIMESTAMP

Updated at — read-only — updated_at — PostgreSQL: TIMESTAMP

Specialty
Specialty basics
Specialty name — text — specialty_name — PostgreSQL: VARCHAR(255)
Description: Enable multiple specialties per org (unique per org).
Validation: Required.

Clinics/locations (names, free text) — textarea — location_names_text — PostgreSQL: TEXT (new)
Description: Clinic names where specialty is offered.

Location IDs — multi-select — location_ids — PostgreSQL: TEXT[]
Description: Map to structured locations; use in ops/reporting.

Sources of truth (physicians)
Physician names source — select — physician_names_source — PostgreSQL: VARCHAR(50)
Options: EMR, Website, Other.

Physician names source (other) — text — physician_names_source_other — PostgreSQL: TEXT

Physician names source link — url — physician_names_source_link — PostgreSQL: TEXT (new)

New patients acceptance source — select — new_patients_source — PostgreSQL: VARCHAR(50)
Options: EMR, Website, Other.

New patients source (other) — text — new_patients_source_other — PostgreSQL: TEXT

New patients source link — url — new_patients_source_link — PostgreSQL: TEXT (new)

Physician locations source — select — physician_locations_source — PostgreSQL: VARCHAR(50)
Options: EMR, Website, Other.

Physician locations source (other) — text — physician_locations_source_other — PostgreSQL: TEXT

Physician locations source link — url — physician_locations_source_link — PostgreSQL: TEXT (new)

Physician credentials source — select — physician_credentials_source — PostgreSQL: VARCHAR(50)
Options: EMR, Credentialing DB, Website, Other.

Physician credentials source (other) — text — physician_credentials_source_other — PostgreSQL: TEXT

Physician credentials source link — url — physician_credentials_source_link — PostgreSQL: TEXT (new)

Services offered
Services (by specialty) — repeatable group — services — PostgreSQL: JSONB
Description: Enable multiple services with patient prep and FAQs.
Structure: { name[text], faq[textarea], patient_prep_requirements[textarea], service_information_name[text], service_information_source[select: EMR, Website, Clinical Guidelines, Department Protocol, Other] }

Services offered source — select — services_offered_source — PostgreSQL: VARCHAR(50)
Options: EMR, Website, Service Catalog, Other.

Services offered source (other) — text — services_offered_source_other — PostgreSQL: TEXT

Services offered source link — url — services_offered_source_link — PostgreSQL: TEXT (new)

Patient prep source — select — patient_prep_source — PostgreSQL: VARCHAR(50)
Options: EMR, Website, Clinical Guidelines, Department Guidelines, Other.

Patient prep source (other) — text — patient_prep_source_other — PostgreSQL: TEXT

Patient prep source link — url — patient_prep_source_link — PostgreSQL: TEXT (new)

Patient FAQs source — select — patient_faqs_source — PostgreSQL: VARCHAR(50)
Options: Website, Other.

Patient FAQs source (other) — text — patient_faqs_source_other — PostgreSQL: TEXT

Patient FAQs source link — url — patient_faqs_source_link — PostgreSQL: TEXT (new)

Document upload
Documents — file[] — documents — PostgreSQL: JSONB

Status and system
Is active — switch — is_active — PostgreSQL: BOOLEAN

ID — read-only — id — PostgreSQL: UUID

Org ID — hidden — org_id — PostgreSQL: INTEGER

Created by — hidden — created_by — PostgreSQL: INTEGER

Updated by — hidden — updated_by — PostgreSQL: INTEGER

Created at — read-only — created_at — PostgreSQL: TIMESTAMP

Updated at — read-only — updated_at — PostgreSQL: TIMESTAMP

Insurance
Insurance verification
Payors accepted source — select — accepted_payers_source — PostgreSQL: VARCHAR(50)
Options: EMR, RCM System, Website, Other.

Payors accepted details — textarea — accepted_payers_source_details — PostgreSQL: TEXT
Description: Contracting cadence, examples of payors.

Payors accepted link — url — accepted_payers_source_link — PostgreSQL: TEXT (new)

Insurance verification source — select — insurance_verification_source — PostgreSQL: VARCHAR(50)
Options: EMR, RCM System, Other.

Insurance verification details — textarea — insurance_verification_source_details — PostgreSQL: TEXT

Insurance verification link — url — insurance_verification_source_link — PostgreSQL: TEXT (new)

Patient co-pay source — select — patient_copay_source — PostgreSQL: VARCHAR(50)
Options: EMR, RCM System, Other.

Patient co-pay details — textarea — patient_copay_source_details — PostgreSQL: TEXT

Patient co-pay link — url — patient_copay_source_link — PostgreSQL: TEXT (new)

Document upload
Documents — file[] — documents — PostgreSQL: JSONB

System fields
Is active — switch — is_active — PostgreSQL: BOOLEAN

ID — read-only — id — PostgreSQL: UUID

Org ID — hidden — org_id — PostgreSQL: INTEGER

Created by — hidden — created_by — PostgreSQL: INTEGER

Updated by — hidden — updated_by — PostgreSQL: INTEGER

Created at — read-only — created_at — PostgreSQL: TIMESTAMP

Updated at — read-only — updated_at — PostgreSQL: TIMESTAMP