import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import {
  detectSupportRisks,
  generateCaregiverNote,
  generateFhirObservationBundle,
  summarizePatientContext,
  summarizeWellbeing
} from "./care-signals.js";
import { findPatient, syntheticPatients } from "./synthetic-data.js";

function patientOrError(patientId: string) {
  const patient = findPatient(patientId);

  if (!patient) {
    throw new Error(
      `Synthetic patient '${patientId}' was not found. Try 'mary' or 'robert'.`
    );
  }

  return patient;
}

function jsonResult(structuredContent: Record<string, unknown>) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(structuredContent, null, 2)
      }
    ],
    structuredContent
  };
}

export function createSupportAiMcpServer() {
  const server = new McpServer({
    name: "support-ai-care-signal-mcp",
    version: "0.1.0"
  });

  server.registerTool(
    "list_synthetic_patients",
    {
      title: "List Synthetic Patients",
      description:
        "Lists the de-identified synthetic patients available for demo and marketplace validation."
    },
    async () =>
      jsonResult({
        patients: syntheticPatients.map((patient) => ({
          id: patient.id,
          fhirPatientId: patient.fhirPatientId,
          displayName: patient.name,
          age: patient.age,
          status: patient.status
        })),
        safetyNote: "All demo records are synthetic and contain no PHI."
      })
  );

  server.registerTool(
    "get_patient_context",
    {
      title: "Get Patient Context",
      description:
        "Returns synthetic patient context for support-agent reasoning, including family memory, meds, reminders, mood, and sleep.",
      inputSchema: {
        patientId: z
          .string()
          .describe("Synthetic patient id or FHIR Patient id, such as 'mary'.")
      }
    },
    async ({ patientId }) => jsonResult(summarizePatientContext(patientOrError(patientId)))
  );

  server.registerTool(
    "summarize_patient_wellbeing",
    {
      title: "Summarize Patient Wellbeing",
      description:
        "Creates a caregiver-ready wellbeing summary from mood, sleep, messages, reminders, and family context.",
      inputSchema: {
        patientId: z.string().describe("Synthetic patient id or FHIR Patient id.")
      }
    },
    async ({ patientId }) => jsonResult(summarizeWellbeing(patientOrError(patientId)))
  );

  server.registerTool(
    "detect_support_risks",
    {
      title: "Detect Support Risks",
      description:
        "Detects loneliness, memory uncertainty, poor sleep, fatigue, dizziness, and emotional distress signals for a support workflow.",
      inputSchema: {
        patientId: z.string().describe("Synthetic patient id or FHIR Patient id.")
      }
    },
    async ({ patientId }) => jsonResult(detectSupportRisks(patientOrError(patientId)))
  );

  server.registerTool(
    "generate_caregiver_note",
    {
      title: "Generate Caregiver Note",
      description:
        "Drafts a concise caregiver note with support risks, family memory context, and safe follow-up actions."
    ,
      inputSchema: {
        patientId: z.string().describe("Synthetic patient id or FHIR Patient id.")
      }
    },
    async ({ patientId }) => jsonResult(generateCaregiverNote(patientOrError(patientId)))
  );

  server.registerTool(
    "generate_fhir_observation_bundle",
    {
      title: "Generate FHIR Observation Bundle",
      description:
        "Produces a synthetic FHIR R4-style Bundle for mood and sleep observations that can be shown in the demo as the FHIR-ready output.",
      inputSchema: {
        patientId: z.string().describe("Synthetic patient id or FHIR Patient id.")
      }
    },
    async ({ patientId }) =>
      jsonResult(generateFhirObservationBundle(patientOrError(patientId)))
  );

  server.registerPrompt(
    "support_ai_caregiver_agent_prompt",
    {
      title: "Support AI Caregiver Agent Prompt",
      description:
        "A Prompt Opinion agent instruction template for using this MCP server safely."
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              "You are Support AI, a compassionate caregiver-support agent. Use the Support AI MCP tools to retrieve synthetic patient context, detect non-diagnostic support risks, and draft caregiver-ready notes. Do not diagnose, prescribe, or claim emergency triage. For concerning symptoms such as dizziness, worsening confusion, severe distress, chest pain, shortness of breath, falls, or repeated deterioration, recommend escalation to licensed clinical staff. Keep outputs concise, auditable, and grounded in the tool results."
          }
        }
      ]
    })
  );

  return server;
}
