import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface IAIParsedResponse {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    links: { platform: string; url: string }[];
  };
  education: { institution: string; degree: string; fieldOfStudy: string; startYear: string; endYear: string; gpa?: string }[];
  experience: { company: string; position: string; location?: string; startDate: string; endDate?: string; highlights: string[] }[];
  skills: { hardSkills: string[]; softSkills: string[] };
  projects: { title: string; description: string; technologies: string[]; url?: string }[];
  certifications: string[];
  languages: string[];
  atsAnalysis: {
    overallScore: number;
    formattingScore: number;
    keywordScore: number;
    impactScore: number;
    suggestions: string[];
    criticalFixes: string[];
  };
}

export const analyzeResumeText = async (rawText: string): Promise<IAIParsedResponse> => {
  const systemPrompt = `
    You are an expert ATS (Applicant Tracking System) optimization algorithm and enterprise technical recruiter.
    Your task is to parse the raw text of a candidate's resume and structuralize it into a perfectly compliant JSON object matching the provided schema.
    
    You must also calculate an objective ATS scoring matrix out of 100 based on modern recruitment vectors:
    - formattingScore: Readability, presence of key structural blocks.
    - keywordScore: Identification of technical/soft skills relative to industry norms.
    - impactScore: Use of strong action verbs and measurable metrics (e.g., "Increased performance by 40%").
    - overallScore: Weighted average of the components.

    CRITICAL RULES:
    1. Return ONLY a valid JSON object. Do NOT wrap it in markdown code blocks like \`\`\`json.
    2. Extract clean entity values. If an email, phone, or dates are missing, omit them or provide empty arrays/strings safely.
    3. Be candid and rigorous with the suggestions and criticalFixes arrays. Give enterprise-level feedback.
  `;

  const userPrompt = `Parse and analyze the following raw resume content text:\n\n${rawText}`;

  // Enforce a strict structural output payload blueprint
  const outputSchema = {
    type: "object",
    properties: {
      personalInfo: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          links: { type: "array", items: { type: "object", properties: { platform: { type: "string" }, url: { type: "string" } }, required: ["platform", "url"] } }
        },
        required: ["fullName", "email", "phone", "links"]
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: { institution: { type: "string" }, degree: { type: "string" }, fieldOfStudy: { type: "string" }, startYear: { type: "string" }, endYear: { type: "string" }, gpa: { type: "string" } },
          required: ["institution", "degree", "fieldOfStudy", "startYear", "endYear"]
        }
      },
      experience: {
        type: "array",
        items: {
          type: "object",
          properties: { company: { type: "string" }, position: { type: "string" }, location: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, highlights: { type: "array", items: { type: "string" } } },
          required: ["company", "position", "startDate", "highlights"]
        }
      },
      skills: {
        type: "object",
        properties: {
          hardSkills: { type: "array", items: { type: "string" } },
          softSkills: { type: "array", items: { type: "string" } }
        },
        required: ["hardSkills", "softSkills"]
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: { title: { type: "string" }, description: { type: "string" }, technologies: { type: "array", items: { type: "string" } }, url: { type: "string" } },
          required: ["title", "description", "technologies"]
        }
      },
      certifications: { type: "array", items: { type: "string" } },
      languages: { type: "array", items: { type: "string" } },
      atsAnalysis: {
        type: "object",
        properties: {
          overallScore: { type: "number" },
          formattingScore: { type: "number" },
          keywordScore: { type: "number" },
          impactScore: { type: "number" },
          suggestions: { type: "array", items: { type: "string" } },
          criticalFixes: { type: "array", items: { type: "string" } }
        },
        required: ["overallScore", "formattingScore", "keywordScore", "impactScore", "suggestions", "criticalFixes"]
      }
    },
    required: ["personalInfo", "education", "experience", "skills", "projects", "certifications", "languages", "atsAnalysis"]
  };

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Production target optimized for speed, cost, and high structure compliance
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { 
        type: "json_object"
      },
      temperature: 0.2 // Low temperature reduces creative drifts and locks in factual parsing consistency
    });

    const parsedJSON = JSON.parse(response.choices[0].message.content || '{}');
    return parsedJSON as IAIParsedResponse;
  } catch (error) {
    console.error('❌ AI Engine Processing Disruption:', error);
    throw new Error('Failed to accurately process metadata fields via AI Engine.');
  }
};