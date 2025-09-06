import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateDentalXraySummary(xrayType: string, imageData?: string): Promise<{
  summary: string;
  confidence: number;
  findings: string;
}> {
  try {
    const messages: any[] = [
      {
        role: "system",
        content: "You are a dental AI assistant specialized in analyzing dental X-rays. Provide professional dental analysis with appropriate disclaimers. Always format your response as JSON with 'summary', 'confidence', and 'findings' fields. Include specific findings like cavities, bone loss, impacted teeth, etc."
      }
    ];

    if (imageData) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this ${xrayType} dental X-ray and provide a professional dental summary. Include key findings such as cavities, periodontal disease, bone loss, impacted teeth, root conditions, and any abnormalities. Provide recommendations for treatment if needed. Remember this is for educational purposes and should not replace professional dental diagnosis.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageData}`
            }
          }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: `Provide a general analysis framework for a ${xrayType} X-ray. Include what a dental radiologist would typically look for and common findings in dental imaging.`
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: result.summary || "Unable to analyze X-ray at this time.",
      confidence: Math.max(0, Math.min(100, result.confidence || 85)),
      findings: result.findings || "No specific findings identified."
    };
  } catch (error) {
    console.error("Error generating scan summary:", error);
    return {
      summary: "Error analyzing dental X-ray. Please try again or consult with a dental professional.",
      confidence: 0,
      findings: "Analysis unavailable."
    };
  }
}

export async function generatePatientSummary(patientData: {
  name: string;
  age?: number;
  dentalHistory?: string[];
  lastCleaning?: string;
  recentVisits?: string[];
}): Promise<string> {
  try {
    const prompt = `Generate a comprehensive dental AI summary for patient: ${patientData.name}
    
Dental History: ${patientData.dentalHistory?.join(', ') || 'None provided'}
Last Cleaning: ${patientData.lastCleaning || 'Not provided'}
Recent Visits: ${patientData.recentVisits?.join(', ') || 'None provided'}

Provide a professional dental summary that includes:
1. Current oral health status
2. Key dental conditions and their management
3. Treatment compliance and effectiveness
4. Recommendations for ongoing dental care
5. Risk factors and preventive dental measures
6. Suggested treatment timeline

Keep the summary concise but comprehensive, suitable for dental professionals.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a dental AI assistant. Generate professional, accurate patient summaries for dental healthcare providers. Include appropriate dental disclaimers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
    });

    return response.choices[0].message.content || "Unable to generate patient summary at this time.";
  } catch (error) {
    console.error("Error generating patient summary:", error);
    return "Error generating patient summary. Please try again.";
  }
}

export async function generateTreatmentNotes(transcription: string): Promise<{
  chief_complaint: string;
  examination: string;
  diagnosis: string;
  treatment_plan: string;
}> {
  try {
    const prompt = `Convert the following dental appointment transcription into proper dental treatment notes format:

"${transcription}"

Please structure this into dental treatment notes format:
- Chief Complaint: Patient's main concern or reason for visit
- Examination: Clinical findings, oral exam results, X-ray findings
- Diagnosis: Dental professional's evaluation and diagnosis
- Treatment Plan: Recommended treatments, procedures, follow-up care, and next steps

Respond in JSON format with fields: chief_complaint, examination, diagnosis, treatment_plan`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a dental scribe AI specialized in converting appointment transcriptions into proper dental treatment note format. Ensure dental accuracy and professional dental terminology."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      chief_complaint: result.chief_complaint || "Unable to extract chief complaint.",
      examination: result.examination || "Unable to extract examination findings.",
      diagnosis: result.diagnosis || "Unable to determine diagnosis.",
      treatment_plan: result.treatment_plan || "Unable to create treatment plan."
    };
  } catch (error) {
    console.error("Error generating SOAP notes:", error);
    return {
      chief_complaint: "Error processing transcription.",
      examination: "Error processing transcription.",
      diagnosis: "Error processing transcription.",
      treatment_plan: "Error processing transcription."
    };
  }
}
