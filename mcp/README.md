# Support AI Care Signal MCP

This is the hackathon-facing MCP server for Support AI. It exposes synthetic, de-identified healthcare support tools that a Prompt Opinion agent can invoke.

## Tools

- `list_synthetic_patients`
- `get_patient_context`
- `summarize_patient_wellbeing`
- `detect_support_risks`
- `generate_caregiver_note`
- `generate_fhir_observation_bundle`

## Local Run

```bash
npm run mcp:build
npm run mcp:http
```

Health check:

```bash
curl http://localhost:8787/health
```

MCP endpoint:

```text
http://localhost:8787/mcp
```

## Prompt Opinion Submission Path

1. Deploy this server to a public HTTPS URL.
2. Register the MCP endpoint in Prompt Opinion Marketplace.
3. Configure a Prompt Opinion agent with the `support_ai_caregiver_agent_prompt` prompt.
4. In the demo, ask the agent to review synthetic patient `mary`.
5. Show the agent invoking tools, producing a caregiver note, and returning a FHIR-style observation bundle.

## Demo Scenario

Ask:

```text
Review patient mary for social isolation, sleep, mood, and caregiver follow-up needs.
```

Expected story:

- The agent retrieves patient context.
- The agent detects loneliness, poor sleep, fatigue, memory uncertainty, and dizziness.
- The agent drafts a caregiver note.
- The agent shows the synthetic FHIR Observation Bundle.

Safety: all included records are synthetic and contain no PHI.
