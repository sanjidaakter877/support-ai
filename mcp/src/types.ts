export type MoodEntry = {
  mood: "Happy" | "Okay" | "Sad" | "Frustrated" | "Tired";
  score: number;
  note: string;
  recordedAt: string;
};

export type SleepEntry = {
  hours: number;
  quality: "Good" | "Okay" | "Poor";
  wokeOften: boolean;
  recordedAt: string;
};

export type PatientRecord = {
  id: string;
  fhirPatientId: string;
  name: string;
  age: number;
  room: string;
  status: string;
  conditions: string[];
  medications: string[];
  family: Array<{
    name: string;
    relation: string;
    note: string;
  }>;
  messages: Array<{
    role: "patient" | "assistant" | "caregiver";
    text: string;
    recordedAt: string;
  }>;
  moods: MoodEntry[];
  sleep: SleepEntry[];
  reminders: Array<{
    time: string;
    task: string;
    medication?: string;
  }>;
};

export type RiskLevel = "low" | "moderate" | "high";
