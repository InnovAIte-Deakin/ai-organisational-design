
# User and System Prompts for Workflows

## Record Summary Workflow

### User Prompt

```
You are a clinical summarization assistant. Using the following data:

{{ $('Stringify').item.json.result }}

Generate a structured, clinic-focused summary of the patient's recent dental history.

1. **General Patient Information**
   - Summarize demographics (full name, date of birth, ID number, address, phone).

2. **Appointments (Organized by Staff)**
   - Group appointments by each staff member involved.
   - For each, list: appointment date, role (attendant/assistant), attendance status, and collaborating staff.

3. **Dentist Notes (Chronological)**
   - Present notes in order of occurrence.
   - For each entry, include: appointment type, clinical findings, treatments performed, and changes compared to prior visits.
   - Be detailed

4. **Overall Clinical Summary**
   - Provide a concise narrative overview of the patient's dental course.
   - Highlight recurring conditions, treatment progress, and outcomes.
   - Identify areas needing follow-up or monitoring.
   - Be detailed

Format the output for **professional use in a dental clinic**, emphasizing clarity, conciseness, and clinical relevance.
```

## Transcription Workflow

### User Prompt

...
