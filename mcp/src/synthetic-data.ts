import type { PatientRecord } from "./types.js";

export const syntheticPatients: PatientRecord[] = [
  {
    id: "mary",
    fhirPatientId: "synthetic-patient-mary-johnson",
    name: "Mary Johnson",
    age: 76,
    room: "Room 214",
    status: "Stable",
    conditions: ["Mild cognitive impairment", "Hypertension"],
    medications: ["Lisinopril 10 mg daily", "Vitamin D 1000 IU daily"],
    family: [
      {
        name: "Anna Johnson",
        relation: "daughter",
        note: "Calls most evenings and brings photo albums on Sundays."
      },
      {
        name: "Leo Johnson",
        relation: "grandson",
        note: "Enjoys asking Mary about gardening and old family recipes."
      }
    ],
    messages: [
      {
        role: "patient",
        text: "I feel lonely today and I do not remember if Anna is visiting.",
        recordedAt: "2026-04-29T14:15:00Z"
      },
      {
        role: "patient",
        text: "I woke up a lot last night and feel tired.",
        recordedAt: "2026-04-30T09:10:00Z"
      },
      {
        role: "patient",
        text: "I feel dizzy again when I stand up.",
        recordedAt: "2026-04-30T11:45:00Z"
      }
    ],
    moods: [
      {
        mood: "Sad",
        score: 2,
        note: "Missing family and unsure about next visit.",
        recordedAt: "2026-04-29T14:18:00Z"
      },
      {
        mood: "Tired",
        score: 3,
        note: "Poor sleep and low energy.",
        recordedAt: "2026-04-30T09:12:00Z"
      }
    ],
    sleep: [
      {
        hours: 4.5,
        quality: "Poor",
        wokeOften: true,
        recordedAt: "2026-04-30T08:00:00Z"
      }
    ],
    reminders: [
      {
        time: "08:00",
        task: "Morning medication",
        medication: "Lisinopril 10 mg"
      },
      {
        time: "15:00",
        task: "Call Anna with caregiver support"
      }
    ]
  },
  {
    id: "robert",
    fhirPatientId: "synthetic-patient-robert-chen",
    name: "Robert Chen",
    age: 69,
    room: "Room 118",
    status: "Stable",
    conditions: ["Type 2 diabetes"],
    medications: ["Metformin 500 mg twice daily"],
    family: [
      {
        name: "Mina Chen",
        relation: "spouse",
        note: "Usually visits after lunch and helps with music playlists."
      }
    ],
    messages: [
      {
        role: "patient",
        text: "I am okay today. I would like trivia later.",
        recordedAt: "2026-04-30T10:00:00Z"
      }
    ],
    moods: [
      {
        mood: "Okay",
        score: 4,
        note: "Calm and interested in light activity.",
        recordedAt: "2026-04-30T10:02:00Z"
      }
    ],
    sleep: [
      {
        hours: 7,
        quality: "Good",
        wokeOften: false,
        recordedAt: "2026-04-30T08:10:00Z"
      }
    ],
    reminders: [
      {
        time: "09:00",
        task: "Morning medication",
        medication: "Metformin 500 mg"
      }
    ]
  }
];

export function findPatient(patientId: string) {
  return syntheticPatients.find(
    (patient) =>
      patient.id === patientId || patient.fhirPatientId === patientId
  );
}
