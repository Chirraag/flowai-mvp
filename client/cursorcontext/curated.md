chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/create-curated-kb \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODIyNDU3MiwiZXhwIjoxNzU4MzEwOTcyfQ.W-rpBiV2YBYwTosOnemHKe4KBqXexH6ysZHZ2V_xQbY" \
  -H "Content-Type: application/json" \
  -d '{}'
{"success":true,"message":"Knowledge base document created successfully","document":{"name":"Flowai_KB_1758265735327.docx","url":"https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758265735327-daddb6a5-a6b6-43cd-b9e8-dc37131bedd6-Flowai_KB_1758265735327.docx","type":"curated_kb"}}%                                                                                                        chiraggupta@Chirags-MacBook-Pro ~ % 



chiraggupta@Chirags-MacBook-Pro ~ % curl -X POST https://api.myflowai.com/api/v1/launchpad/3/delete-curated-kb \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiY2hpcmFnLmd1cHRhQG15Zmxvd2FpLmNvbSIsInVzZXJuYW1lIjoiY2hpcmFnLmd1cHRhIiwicm9sZSI6InN1cGVyLWFkbWluIiwib3JnSWQiOjMsIm9yZ0tleSI6ImtleV84MTgyN2EzODk1NmY2OTc5YTUwZmNjZDQ3MTgzIiwib3JnTmFtZSI6IkZsb3dhaSIsInJldGVsbFdvcmtzcGFjZUlkIjoib3JnX2UyQW51Tm9mOXd0QWFDYlgiLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1ODI2NjM1MCwiZXhwIjoxNzU4MzUyNzUwfQ.HebZ4SZC0ofeGLMcWDXYDLEjvyrGmvTU_RZ-PXG0dOs" \
  -H "Content-Type: application/json" \                                                                                                                            
  -d '{
    "url": "https://flowai-bucket.s3.us-east-2.amazonaws.com/org-3/organisation_kb/1758265735327-daddb6a5-a6b6-43cd-b9e8-dc37131bedd6-Flowai_KB_1758265735327.docx"
  }'
{"success":true,"message":"Knowledge base document deleted successfully"}%                                                                                                                                  chiraggupta@Chirags-MacBook-Pro ~ % 
