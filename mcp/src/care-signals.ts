import type { PatientRecord, RiskLevel } from "./types.js";

const concernWords = [
  { term: "lonely", label: "loneliness" },
  { term: "sad", label: "low mood" },
  { term: "anxious", label: "anxiety" },
  { term: "tired", label: "fatigue" },
  { term: "dizzy", label: "dizziness" },
  { term: "sleep", label: "poor sleep" },
  { term: "remember", label: "memory uncertainty" }
];

function patientText(patient: PatientRecord) {
  return patient.messages
    .filter((message) => message.role === "patient")
    .map((message) => message.text.toLowerCase())
    .join(" ");
}

export function summarizePatientContext(patient: PatientRecord) {
  const latestMood = patient.moods.at(-1);
  const latestSleep = patient.sleep.at(-1);

  return {
    patientId: patient.id,
    fhirPatientId: patient.fhirPatientId,
    displayName: patient.name,
    age: patient.age,
    location: patient.room,
    status: patient.status,
    conditions: patient.conditions,
    medications: patient.medications,
    familySupports: patient.family,
    reminders: patient.reminders,
    latestMood,
    latestSleep,
    recentPatientMessages: patient.messages
      .filter((message) => message.role === "patient")
      .slice(-5)
  };
}

export function detectSupportRisks(patient: PatientRecord) {
  const text = patientText(patient);
  const concerns = concernWords
    .filter(({ term }) => text.includes(term))
    .map(({ label }) => label);

  const latestMood = patient.moods.at(-1);
  const latestSleep = patient.sleep.at(-1);
  const flags: string[] = [];

  if (concerns.includes("dizziness")) {
    flags.push("Patient reported dizziness; recommend caregiver or nurse follow-up.");
  }

  if (concerns.includes("loneliness") || concerns.includes("memory uncertainty")) {
    flags.push("Patient may benefit from family reassurance and memory support.");
  }

  if (latestSleep && (latestSleep.hours < 5 || latestSleep.quality === "Poor")) {
    flags.push("Poor sleep may be contributing to fatigue or mood changes.");
  }

  if (latestMood && latestMood.score <= 2) {
    flags.push("Low mood check-in should be reviewed by a caregiver.");
  }

  const score =
    flags.length * 2 +
    (concerns.includes("dizziness") ? 2 : 0) +
    (latestMood && latestMood.score <= 2 ? 1 : 0);

  const riskLevel: RiskLevel =
    score >= 6 ? "high" : score >= 3 ? "moderate" : "low";

  return {
    patientId: patient.id,
    riskLevel,
    score,
    concerns: Array.from(new Set(concerns)),
    flags,
    safetyNote:
      "This support signal is not a diagnosis. Escalate urgent, repeated, or worsening symptoms to licensed clinical staff."
  };
}

export function summarizeWellbeing(patient: PatientRecord) {
  const context = summarizePatientContext(patient);
  const risks = detectSupportRisks(patient);

  return {
    patientId: patient.id,
    summary: `${patient.name} is ${patient.status.toLowerCase()} with recent signals for ${
      risks.concerns.length ? risks.concerns.join(", ") : "no major support concern"
    }.`,
    latestMood: context.latestMood,
    latestSleep: context.latestSleep,
    riskLevel: risks.riskLevel,
    recommendedActions: buildRecommendedActions(patient, risks.concerns),
    safetyNote: risks.safetyNote
  };
}

export function generateCaregiverNote(patient: PatientRecord) {
  const wellbeing = summarizeWellbeing(patient);
  const risks = detectSupportRisks(patient);
  const family = patient.family[0];

  return {
    patientId: patient.id,
    note: [
      `${patient.name} has recent support signals: ${risks.concerns.join(", ") || "none detected"}.`,
      wellbeing.latestSleep
        ? `Last sleep check-in: ${wellbeing.latestSleep.hours} hours, ${wellbeing.latestSleep.quality.toLowerCase()} quality.`
        : "No sleep check-in is available.",
      wellbeing.latestMood
        ? `Latest mood: ${wellbeing.latestMood.mood} (${wellbeing.latestMood.note})`
        : "No mood check-in is available.",
      family
        ? `Consider reassurance using family context: ${family.name}, ${family.relation}, ${family.note}`
        : "No family context is available.",
      "If dizziness, distress, or confusion continues, ask clinical staff to assess promptly."
    ].join(" "),
    recommendedActions: wellbeing.recommendedActions,
    riskLevel: wellbeing.riskLevel
  };
}

export function generateFhirObservationBundle(patient: PatientRecord) {
  const latestMood = patient.moods.at(-1);
  const latestSleep = patient.sleep.at(-1);
  const entries = [];

  if (latestMood) {
    entries.push({
      resourceType: "Observation",
      status: "final",
      category: [{ text: "Survey" }],
      code: { text: "Support AI mood check-in" },
      subject: { reference: `Patient/${patient.fhirPatientId}` },
      effectiveDateTime: latestMood.recordedAt,
      valueString: `${latestMood.mood} (${latestMood.score}/5): ${latestMood.note}`
    });
  }

  if (latestSleep) {
    entries.push({
      resourceType: "Observation",
      status: "final",
      category: [{ text: "Activity" }],
      code: { text: "Support AI sleep check-in" },
      subject: { reference: `Patient/${patient.fhirPatientId}` },
      effectiveDateTime: latestSleep.recordedAt,
      component: [
        { code: { text: "Sleep duration" }, valueQuantity: { value: latestSleep.hours, unit: "hours" } },
        { code: { text: "Sleep quality" }, valueString: latestSleep.quality },
        { code: { text: "Woke often" }, valueBoolean: latestSleep.wokeOften }
      ]
    });
  }

  return {
    resourceType: "Bundle",
    type: "collection",
    entry: entries.map((resource) => ({ resource }))
  };
}

function buildRecommendedActions(patient: PatientRecord, concerns: string[]) {
  const actions = [];

  if (concerns.includes("dizziness")) {
    actions.push("Ask the patient to sit or lie down and route dizziness report to clinical staff.");
  }

  if (concerns.includes("loneliness") || concerns.includes("memory uncertainty")) {
    const family = patient.family[0];
    actions.push(
      family
        ? `Offer a family reminder about ${family.name} and consider scheduling contact.`
        : "Offer reassurance and consider scheduling family or caregiver contact."
    );
  }

  if (concerns.includes("poor sleep") || concerns.includes("fatigue")) {
    actions.push("Review sleep pattern and daytime fatigue during the next caregiver check-in.");
  }

  if (actions.length === 0) {
    actions.push("Continue routine supportive check-ins.");
  }

  return actions;
}
