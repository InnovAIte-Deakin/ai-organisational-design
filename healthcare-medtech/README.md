
# Healthcare & MedTech

This folder represents the Healthcare and MedTech (Medical Technology) industry in the workforce, and the documents within this folder contain research, integrations, workflows, and such.

The dot point list below introduces individual files and folders and their purpose:

1. [Healthcare and MedTech Final Report.pdf](/healthcare-medtech/docs/Healthcare%20and%20MedTech%20Final%20Report.pdf): This is the conclusion of the investigative report that identifies and evaluates the impact that utilizing AI tools will have on the workspace. This outlines the standard business structure and workflows, and demonstrates transformed workflows that integrate AI and other technologies to enhance and improve them, aiming to provide net positive and minimal net negative impacts.

2. [MCP Problem Statement - Patient Record Summary](/healthcare-medtech/docs/MCP%20Problem%20Statement%20-%20Patient%20Record%20Summary.pdf): This document contains the MCP problem statement for the patient record summary workflow. The workflow reads the patients' records and produces a summary of their recent dental history for dentist practitioners to catch up on the patient.

3. [MCP Problem Statement - Dental Transcription](/healthcare-medtech/docs/MCP%20Problem%20Statement%20-%20Dental%20Transcription.pdf): This document contains the MCP problem statement for the dental transcription workflow. The workflow listens to the dentist appointment and transcripts the conversation, it then trims out all the necessary dental information from the transcription and produces S.O.A.P notes about what occured in the appointment.

4. [MediMind Dashboard](/healthcare-medtech/dashboard/): This folder contains a TypeScript-based web dashboard to test a variety of tools. To run, clone the repository, enter the dashboard folder and run `npm run build` then `npm run dev`, then head to `https://127.0.0.1:5000` in your browser.

5. [n8n_workflows](/healthcare-medtech/n8n_workflows/): This folder contains the n8n workflows and vscode MCP config to connect to the API. Replace the VSCode MCP url with your uploaded n8n workflow one (Server Testing.json). You must edit the workflows to read the database.

6. [supabase_schemas](/healthcare-medtech/supabase_schemas/): This folder contains the Supabase Schemas for the database, essentially how information is stored in the database of which the workflows access. You must edit the workflows to read the database.

7. [Software Requirement Specification Document.pdf](/healthcare-medtech/docs/SRS%20Patient%20Record%20Summarisation.pdf): This is the Software Requirement Specification document which describes the purpose of the software, the description of the software, the requirements and needs of the software, and the links between user stories. Contains both workflows from above.

8. MedTech Dashboard "User Story" Demonstration: https://deakin365-my.sharepoint.com/:v:/g/personal/dheenan_deakin_edu_au/Ec9KHauWtDJCm1Xsdq4nQmQB3fLNyxO_1njnqYofEacKng?e=lTakD8

9. MedTech Full Workflow and Dashboard Installation Guide: https://deakin365-my.sharepoint.com/:v:/g/personal/dheenan_deakin_edu_au/EbmlYx0h4gFPks35vdX7XqsB2-2QMVheXa1OCg8KbTJ-1A?e=gCb889
