"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Moon,
  Smile,
  Gamepad2,
  Activity,
  AlertCircle,
  Mic,
  Search,
  UserRound,
  ShieldPlus,
  Sparkles,
  Volume2,
  VolumeX,
  MicOff,
  Sun,
  Stars,
  Brain,
  Clock3,
  Users,
  Pill,
  UsersRound,
  Plus,
  Lock,
  LogOut,
  CarFront,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

/* ========================= TYPES ========================= */

type Message = {
  role: "user" | "assistant";
  content: string;
  time: string;
};

type MoodEntry = {
  mood: string;
  score: number;
  emoji: string;
  note: string;
  time: string;
};

type SleepData = {
  hours: number;
  quality: string;
  wokeOften: boolean;
};

type FamilyMember = {
  name: string;
  relation: string;
  avatar: string;
  note: string;
};

type TaskItem = {
  id: string;
  time: string;
  task: string;
  medication: string;
  category: "medicine" | "task";
};

type CheckInEntry = {
  id: string;
  caregiverName: string;
  time: string;
  note: string;
};

type AppointmentItem = {
  id: string;
  doctorName: string;
  specialization: string;
  datetime: string;
  notes: string;
};

type MedicalReportItem = {
  id: string;
  fileName: string;
  uploadedAt: string;
};

type PatientRecord = {
  id: string;
  name: string;
  age: number;
  room: string;
  status: string;
  messages: Message[];
  moods: MoodEntry[];
  sleep: SleepData;
  family: FamilyMember[];
  tasks: TaskItem[];
  checkIns: CheckInEntry[];
  appointments: AppointmentItem[];
  medicalReports: MedicalReportItem[];
  usageMinutes: number;
  sessionStartedAt: number | null;
};

/* ========================= HELPERS ========================= */

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ========================= UI STYLES ========================= */

const glassCard =
  "border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-white/[0.07] hover:shadow-2xl";

const glassSoft =
  "border border-white/10 bg-white/5 backdrop-blur-xl shadow-md transition-all duration-300 hover:bg-white/[0.06] hover:shadow-lg";

const quietButton =
  "rounded-2xl bg-white/[0.05] text-white/80 border border-white/10 backdrop-blur-xl shadow-sm transition-all duration-300 hover:bg-white/[0.10] hover:text-white hover:shadow-md active:scale-[0.98]";

const activeSoftButton =
  "rounded-2xl bg-white/[0.18] text-white border border-white/25 backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-white/[0.22] hover:shadow-lg active:scale-[0.98]";

const whiteActionButton =
  "rounded-2xl bg-white text-slate-950 border border-white/30 shadow-md transition-all duration-300 hover:bg-white/90 hover:shadow-lg active:scale-[0.98]";

const fieldClass =
  "rounded-2xl bg-white/[0.04] text-white border border-white/10 backdrop-blur-xl shadow-sm placeholder:text-white/35 focus:ring-2 focus:ring-white/20 focus:border-white/20";

const subtleHeader =
  "bg-gradient-to-r from-white/[0.07] via-slate-300/[0.06] to-white/[0.04] backdrop-blur-xl";

const caregiverCredentials = {
  id: "caregiver",
  password: "support123",
};

const initialPatients: PatientRecord[] = [
  {
    id: "mary",
    name: "Mary Johnson",
    age: 76,
    room: "Room 214",
    status: "Stable",
    messages: [
      {
        role: "assistant",
        content:
          "Hello Mary. I’m Support AI. I’m here to talk, listen, answer simple health questions, and help you feel less alone.",
        time: nowTime(),
      },
    ],
    moods: [],
    sleep: { hours: 4.5, quality: "Poor", wokeOften: true },
    family: [],
    tasks: [],
    checkIns: [],
    appointments: [],
    medicalReports: [],
    usageMinutes: 0,
    sessionStartedAt: null,
  },
];

const quickPrompts = [
  "I feel lonely",
  "Can you help me relax?",
  "Tell me a gentle story",
  "What medicine do I have today?",
];

const moodOptions = [
  {
    label: "Happy",
    score: 5,
    emoji: "Happy",
    color: "from-emerald-400/30 to-cyan-400/20",
  },
  {
    label: "Okay",
    score: 4,
    emoji: "Okay",
    color: "from-sky-400/30 to-indigo-400/20",
  },
  {
    label: "Sad",
    score: 2,
    emoji: "Sad",
    color: "from-blue-400/25 to-slate-400/20",
  },
  {
    label: "Frustrated",
    score: 2,
    emoji: "Upset",
    color: "from-rose-400/30 to-orange-400/20",
  },
  {
    label: "Tired",
    score: 3,
    emoji: "Tired",
    color: "from-violet-400/25 to-slate-400/20",
  },
] as const;

const entertainmentOptions = [
  {
    icon: Gamepad2,
    title: "Trivia",
    description: "A light question to make the moment more engaging.",
    prompt: "Play trivia with me",
  },
  {
    icon: Brain,
    title: "Story",
    description: "A gentle story for comfort and calm.",
    prompt: "Tell me a gentle story",
  },
  {
    icon: Moon,
    title: "Breathing",
    description: "A slow breathing exercise for relaxation.",
    prompt: "Help me relax with breathing",
  },
];

function summarizeConcerns(messages: Message[]) {
  const patientTexts = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  const keywords = [
    { key: "lonely", label: "loneliness" },
    { key: "bored", label: "boredom" },
    { key: "tired", label: "fatigue" },
    { key: "sleep", label: "poor sleep" },
    { key: "dizzy", label: "dizziness" },
    { key: "anxious", label: "anxiety" },
    { key: "sad", label: "sadness" },
  ];

  return keywords
    .filter((k) => patientTexts.includes(k.key))
    .map((k) => k.label);
}

function detectRiskFlags(messages: Message[]) {
  const tracked = ["dizzy", "tired", "lonely", "sad", "anxious"];
  const counts: Record<string, number> = {};

  messages.forEach((m) => {
    if (m.role !== "user") return;
    const text = m.content.toLowerCase();

    tracked.forEach((word) => {
      if (text.includes(word)) {
        counts[word] = (counts[word] || 0) + 1;
      }
    });
  });

  const flags: string[] = [];

  if ((counts["dizzy"] || 0) >= 2) flags.push("Repeated dizziness reported");
  if ((counts["tired"] || 0) >= 2) flags.push("Repeated fatigue reported");
  if ((counts["lonely"] || 0) >= 2) flags.push("Loneliness pattern detected");
  if ((counts["sad"] || 0) >= 2 || (counts["anxious"] || 0) >= 2) {
    flags.push("Emotional distress pattern detected");
  }

  return flags;
}

function generateSuggestedNote({
  moods,
  sleep,
  concerns,
}: {
  moods: { mood: string }[];
  sleep: { hours: number; quality: string };
  concerns: string[];
}) {
  const latestMood = moods.length ? moods[moods.length - 1].mood : "Okay";
  const noteParts = [];

  if (["Sad", "Frustrated", "Tired"].includes(latestMood)) {
    noteParts.push(`Patient appears ${latestMood.toLowerCase()}`);
  } else {
    noteParts.push("Patient appears emotionally stable");
  }

  if (sleep.hours < 5 || sleep.quality === "Poor") {
    noteParts.push("with poor sleep quality");
  }

  if (concerns.includes("loneliness")) {
    noteParts.push("and may benefit from emotional support");
  }

  return `${noteParts.join(" ")}.`;
}

function getAssistantResponse(input: string, patient: PatientRecord) {
  const text = input.toLowerCase();

  const matchedFamily = patient.family.find((member) =>
    text.includes(member.name.toLowerCase())
  );

  if (matchedFamily && text.includes("who is")) {
    return `${matchedFamily.name} is your ${matchedFamily.relation.toLowerCase()}. ${matchedFamily.note}`;
  }

  if (text.includes("family")) {
    const names = patient.family.map(
      (f) => `${f.name} your ${f.relation.toLowerCase()}`
    );
    return `Your family is here for you. ${names.join(", ")}.`;
  }

  if (text.includes("medicine") || text.includes("medication")) {
    const nextTask = patient.tasks[0];
    if (nextTask) {
      return `Your reminder list shows ${nextTask.time} for ${nextTask.task}. Medication: ${nextTask.medication}.`;
    }
    return "There are no medication reminders listed right now.";
  }

  if (text.includes("task") || text.includes("schedule")) {
    if (patient.tasks.length > 0) {
      return `You have ${patient.tasks.length} tasks today. The next one is at ${patient.tasks[0].time}: ${patient.tasks[0].task}.`;
    }
    return "There are no daily tasks listed right now.";
  }

  if (text.includes("lonely")) {
    const firstFamily = patient.family[0];
    return `I’m here with you. Your family cares about you. ${
      firstFamily
        ? `${firstFamily.name} is your ${firstFamily.relation.toLowerCase()}. `
        : ""
    }Would you like to review your family memories or hear something comforting?`;
  }

  if (text.includes("miss my family")) {
    return "I’m sorry you miss them. Your family loves you. Would you like me to remind you who your loved ones are?";
  }

  if (text.includes("bored")) {
    return "Let’s make this moment a little lighter. I can tell you a story, play trivia, or help you revisit family memories.";
  }

  if (text.includes("tired")) {
    return "Feeling tired can happen for many reasons like poor sleep, stress, or not eating enough. Please tell a nurse or doctor if this feels unusual or keeps getting worse.";
  }

  if (text.includes("dizzy")) {
    return "Dizziness can sometimes happen with dehydration, low energy, or other causes. Please sit or lie down, and let a nurse know right away if it continues or feels serious.";
  }

  if (text.includes("story")) {
    return "Once there was a small garden outside a hospital window, and every morning the flowers leaned toward the sunlight as if they were saying, you made it through the night, and today is a new chance.";
  }

  if (text.includes("relax") || text.includes("breathing")) {
    return "Let’s do a slow breathing exercise. Breathe in for 4 seconds, hold for 4, and breathe out for 6. We can do that together a few times.";
  }

  if (text.includes("trivia")) {
    return "Here’s a gentle trivia question. Which planet is known as the Red Planet? The answer is Mars. Want another one?";
  }

  if (text.includes("anxious")) {
    return "I’m sorry that you’re feeling anxious. Try taking a few slow breaths, and please let a nurse or doctor know if you want extra support.";
  }

  if (
    text.includes("health") ||
    text.includes("pain") ||
    text.includes("question")
  ) {
    return "I can help explain simple health information in easy language, but I do not replace a nurse or doctor. Tell me what you want to understand.";
  }

  return "Thank you for sharing that with me. I’m listening. Would you like comfort, family reminders, health information, or a little entertainment right now?";
}

function speakText(text: string, enabled: boolean) {
  if (
    !enabled ||
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  )
    return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function VoiceInputButton({
  onTranscript,
  label = "Speak",
  className = "",
}: {
  onTranscript: (text: string) => void;
  label?: string;
  className?: string;
}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className={`rounded-2xl bg-white/10 text-white backdrop-blur-xl border border-white/15 shadow-md transition-all duration-300 hover:bg-white/15 hover:shadow-lg ${
        isListening ? "bg-white/20 text-white border-white/25" : ""
      } ${className}`}
      onClick={startListening}
    >
      <Mic className="mr-2 h-4 w-4" />
      {isListening ? "Listening..." : label}
    </Button>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient,
}: {
  icon: any;
  title: string;
  value: string;
  subtitle?: string;
  gradient?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.22 }}
    >
      <Card className={`rounded-[28px] ${glassCard}`}>
        <CardContent
          className={`rounded-[28px] bg-gradient-to-br p-5 ${
            gradient ?? "from-white/[0.08] to-slate-300/[0.05]"
          } backdrop-blur-xl`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white/60">{title}</p>
              <p className="mt-1 text-2xl font-bold text-white">{value}</p>
              {subtitle ? (
                <p className="mt-1 text-sm text-white/60">{subtitle}</p>
              ) : null}
            </div>

            <motion.div
              animate={{ y: [0, -4, 0], rotate: [0, -4, 4, 0] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-2xl bg-white/10 p-3 shadow-sm"
            >
              <Icon className="h-5 w-5 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PatientSelector({
  patients,
  selectedPatientId,
  onSelect,
}: {
  patients: PatientRecord[];
  selectedPatientId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Card className="mb-6 rounded-[30px] border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-xl">
      <CardContent className="rounded-[30px] bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-white/[0.03] p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-white/50">Active patient</p>
            <p className="text-xl font-bold text-white">
              {patients.find((p) => p.id === selectedPatientId)?.name}
            </p>
            <p className="mt-1 text-sm text-white/60">
              Select a patient to continue
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {patients.map((patient) => {
              const active = selectedPatientId === patient.id;

              return (
                <Button
                  key={patient.id}
                  onClick={() => onSelect(patient.id)}
                  className={`px-5 py-5 rounded-2xl text-sm transition-all duration-300 ${
                    active
                      ? "bg-white/20 border border-white/25 text-white shadow-lg backdrop-blur-xl scale-[1.03]"
                      : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {patient.name}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HomeScreen({
  patient,
  setScreen,
  latestMood,
  sleep,
}: {
  patient: PatientRecord;
  setScreen: (screen: string) => void;
  latestMood: string | null;
  sleep: SleepData;
}) {
  const homeOptions = [
    { id: "chat", label: "Talk to Support AI", icon: MessageCircle },
    { id: "memory", label: "Memory Companion", icon: Brain },
    { id: "mood", label: "Mood Check-In", icon: Smile },
    { id: "sleep", label: "Sleep Log", icon: Moon },
    { id: "health", label: "Health Questions", icon: Search },
    { id: "entertainment", label: "Entertainment", icon: Gamepad2 },
    { id: "family-portal", label: "Family Portal", icon: UsersRound },
    { id: "dashboard", label: "Caregiver Dashboard", icon: ShieldPlus },
  ];

  return (
    <div className="grid gap-6">
      <Card className={`overflow-hidden rounded-[32px] ${glassCard}`}>
        <CardContent className="bg-gradient-to-r from-white/[0.08] via-slate-300/[0.05] to-white/[0.04] p-6 md:p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/60">Patient overview</p>
              <h2 className="mt-1 text-3xl font-bold text-white">
                Hello, {patient.name}
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Choose an option to continue
              </p>
              <p className="mt-2 max-w-xl text-white/70">
                Everything below is designed to keep support simple, calm, and
                easy to navigate.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full bg-white/10 px-3 py-1 text-white shadow-sm backdrop-blur-xl"
                >
                  {patient.age} years old
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-white/10 px-3 py-1 text-white shadow-sm backdrop-blur-xl"
                >
                  {patient.room}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-white/10 px-3 py-1 text-white shadow-sm backdrop-blur-xl"
                >
                  {patient.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Smile}
          title="Latest mood"
          value={latestMood || "Not logged"}
          subtitle="Based on patient check-in"
        />
        <StatCard
          icon={Moon}
          title="Sleep hours"
          value={`${sleep.hours} hrs`}
          subtitle={sleep.quality}
        />
        <StatCard
          icon={Activity}
          title="Wellness status"
          value="Needs light support"
          subtitle="Emotional comfort may help"
        />
      </div>

      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="text-white">Choose an option</CardTitle>
          <CardDescription className="text-white/65">
            Open one section at a time from here.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-4 md:p-6">
                   {homeOptions.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Button
                  variant="secondary"
                  className="flex h-20 w-full items-center justify-start rounded-[24px] border border-white/10 bg-white/[0.04] px-5 text-left shadow-md backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] hover:shadow-lg active:scale-[0.98]"
                  onClick={() => setScreen(item.id)}
                >
                  <div className="mr-4 rounded-2xl bg-white/10 p-3 shadow-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="text-sm text-white/55">Open section</span>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function ChatScreen({
  patient,
  setPatient,
  voiceEnabled,
  setVoiceEnabled,
}: {
  patient: PatientRecord;
  setPatient: (updater: (patient: PatientRecord) => PatientRecord) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (value: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [patient.messages]);

  const sendMessage = (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    const userMessage: Message = {
      role: "user",
      content: clean,
      time: nowTime(),
    };
    const reply = getAssistantResponse(clean, patient);
    const aiMessage: Message = {
      role: "assistant",
      content: reply,
      time: nowTime(),
    };

    setPatient((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, aiMessage],
    }));
    setInput("");
    speakText(reply, voiceEnabled);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr,0.8fr]">
      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl text-white">
                Talk to Support AI
              </CardTitle>
              <CardDescription className="text-white/65">
                Warm, simple conversation for comfort, support, and easy health
                explanations.
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className={quietButton}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? (
                  <Volume2 className="mr-2 h-4 w-4" />
                ) : (
                  <VolumeX className="mr-2 h-4 w-4" />
                )}
                {voiceEnabled ? "Voice On" : "Voice Off"}
              </Button>
              <Button
                variant="secondary"
                className={quietButton}
                onClick={stopSpeaking}
              >
                <MicOff className="mr-2 h-4 w-4" />
                Stop Voice
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex h-[420px] flex-col gap-3 overflow-y-auto rounded-[28px] bg-white/[0.03] p-4 backdrop-blur-xl">
            {patient.messages.map((message, index) => (
              <motion.div
                key={`${message.time}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm shadow-sm ${
                  message.role === "assistant"
                    ? "bg-white/10 text-white backdrop-blur-xl"
                    : "ml-auto border border-white/10 bg-white/15 text-white backdrop-blur-xl"
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`mt-2 text-xs ${
                    message.role === "assistant"
                      ? "text-white/45"
                      : "text-white/60"
                  }`}
                >
                  {message.time}
                </p>
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type how you feel or ask a simple question"
              className={fieldClass}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(input);
              }}
            />
            <VoiceInputButton onTranscript={(text) => sendMessage(text)} />
            <Button
              className={whiteActionButton}
              onClick={() => sendMessage(input)}
            >
              Send
            </Button>
          </div>

          <p className="mt-3 text-sm text-white/50">
            Tap the mic button to speak. Best in Chrome or Edge.
          </p>
        </CardContent>
      </Card>

      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="text-white">Quick actions</CardTitle>
          <CardDescription className="text-white/65">
            Helpful starting points for the patient.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 md:p-6">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="secondary"
              className={`${quietButton} justify-start py-6`}
              onClick={() => sendMessage(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MoodScreen({
  patient,
  setPatient,
}: {
  patient: PatientRecord;
  setPatient: (updater: (patient: PatientRecord) => PatientRecord) => void;
}) {
  const [note, setNote] = useState("");

  const addMood = (mood: (typeof moodOptions)[number], customNote = note) => {
    setPatient((prev) => ({
      ...prev,
      moods: [
        ...prev.moods,
        {
          mood: mood.label,
          score: mood.score,
          emoji: mood.emoji,
          note: customNote,
          time: nowTime(),
        },
      ],
    }));
    setNote("");
  };

  const handleMoodVoice = (text: string) => {
    const lower = text.toLowerCase();

    if (lower.includes("happy")) addMood(moodOptions[0], text);
    else if (lower.includes("okay")) addMood(moodOptions[1], text);
    else if (lower.includes("sad")) addMood(moodOptions[2], text);
    else if (lower.includes("frustrated")) addMood(moodOptions[3], text);
    else if (lower.includes("tired")) addMood(moodOptions[4], text);
    else setNote(text);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="text-2xl text-white">Mood Check-In</CardTitle>
          <CardDescription className="text-white/65">
            Simple emotional check-ins help caregivers understand how the
            patient is doing.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex justify-end">
            <VoiceInputButton
              label="Speak mood"
              onTranscript={handleMoodVoice}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {moodOptions.map((mood) => (
              <Button
                key={mood.label}
                variant="secondary"
                className={`h-28 rounded-[28px] border border-white/10 bg-gradient-to-br ${mood.color} text-lg text-white shadow-sm backdrop-blur-xl transition-all duration-300 hover:opacity-95 hover:shadow-lg active:scale-[0.98]`}
                onClick={() => addMood(mood)}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{mood.emoji}</span>
                  <span>{mood.label}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-white/70">
              Optional note
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={fieldClass}
              placeholder="Would you like to tell me more?"
            />
          </div>
        </CardContent>
      </Card>

      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="text-white">Recent check-ins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 md:p-6">
          {patient.moods.length === 0 ? (
            <p className="text-sm text-white/50">No mood entries yet.</p>
          ) : (
            patient.moods
              .slice()
              .reverse()
              .map((entry, idx) => (
                <div
                  key={`${entry.time}-${idx}`}
                  className="rounded-[24px] bg-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg font-medium text-white">
                      <span>{entry.emoji}</span>
                      <span>{entry.mood}</span>
                    </div>
                    <span className="text-sm text-white/50">{entry.time}</span>
                  </div>
                  {entry.note ? (
                    <p className="mt-2 text-sm text-white/65">{entry.note}</p>
                  ) : null}
                  <div className="mt-3">
                    <Progress value={entry.score} />
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SleepScreen({
  patient,
  setPatient,
}: {
  patient: PatientRecord;
  setPatient: (updater: (patient: PatientRecord) => PatientRecord) => void;
}) {
  const [form, setForm] = useState(patient.sleep);

  useEffect(() => {
    setForm(patient.sleep);
  }, [patient.id, patient.sleep]);

  const saveSleep = () => {
    setPatient((prev) => ({ ...prev, sleep: form }));
  };

  const handleSleepVoice = (text: string) => {
    const lower = text.toLowerCase();

    if (lower.includes("good")) {
      setForm((prev) => ({ ...prev, quality: "Good" }));
    } else if (lower.includes("okay")) {
      setForm((prev) => ({ ...prev, quality: "Okay" }));
    } else if (lower.includes("poor")) {
      setForm((prev) => ({ ...prev, quality: "Poor" }));
    }

    if (lower.includes("yes")) {
      setForm((prev) => ({ ...prev, wokeOften: true }));
    } else if (lower.includes("no")) {
      setForm((prev) => ({ ...prev, wokeOften: false }));
    }

    const numberMatch = lower.match(/(\d+(\.\d+)?)/);
    if (numberMatch) {
      setForm((prev) => ({ ...prev, hours: Number(numberMatch[1]) }));
    }
  };

  return (
    <Card className={`rounded-[32px] ${glassCard}`}>
      <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
        <CardTitle className="text-2xl text-white">Sleep Log</CardTitle>
        <CardDescription className="text-white/65">
          For the MVP, manual sleep tracking is enough and very demo-friendly.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 p-4 md:grid-cols-2 md:p-6">
        <div className="space-y-5">
          <div className="flex justify-end">
            <VoiceInputButton
              label="Speak sleep info"
              onTranscript={handleSleepVoice}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Hours slept
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="12"
              value={form.hours}
              onChange={(e) =>
                setForm({ ...form, hours: Number(e.target.value) })
              }
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Sleep quality
            </label>
            <div className="flex gap-3">
              {["Good", "Okay", "Poor"].map((quality) => (
                <Button
                  key={quality}
                  variant={form.quality === quality ? "default" : "secondary"}
                  className={
                    form.quality === quality ? activeSoftButton : quietButton
                  }
                  onClick={() => setForm({ ...form, quality })}
                >
                  {quality}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Did the patient wake often?
            </label>
            <div className="flex gap-3">
              <Button
                variant={form.wokeOften ? "default" : "secondary"}
                className={form.wokeOften ? activeSoftButton : quietButton}
                onClick={() => setForm({ ...form, wokeOften: true })}
              >
                Yes
              </Button>
              <Button
                variant={!form.wokeOften ? "default" : "secondary"}
                className={!form.wokeOften ? activeSoftButton : quietButton}
                onClick={() => setForm({ ...form, wokeOften: false })}
              >
                No
              </Button>
            </div>
          </div>

          <Button className={quietButton} onClick={saveSleep}>
            Save sleep log
          </Button>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">
            Current sleep summary
          </h3>
          <div className="mt-4 space-y-3 text-white/70">
            <p>
              <span className="font-medium">Hours:</span> {patient.sleep.hours}
            </p>
            <p>
              <span className="font-medium">Quality:</span>{" "}
              {patient.sleep.quality}
            </p>
            <p>
              <span className="font-medium">Wake interruptions:</span>{" "}
              {patient.sleep.wokeOften ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EntertainmentScreen({
  patient,
  setPatient,
  voiceEnabled,
  headphonesConfirmed,
  setHeadphonesConfirmed,
}: {
  patient: PatientRecord;
  setPatient: React.Dispatch<React.SetStateAction<PatientRecord>>;
  voiceEnabled: boolean;
  headphonesConfirmed: boolean;
  setHeadphonesConfirmed: (value: boolean) => void;
}) {
  const [selectedVideo, setSelectedVideo] = useState("jfKfPfyJRdk");
  const [entertainmentPrompt, setEntertainmentPrompt] = useState("");

  const handleOption = (prompt: string) => {
    const userMessage: Message = {
      role: "user",
      content: prompt,
      time: nowTime(),
    };
    const reply = getAssistantResponse(prompt, patient);
    const aiMessage: Message = {
      role: "assistant",
      content: reply,
      time: nowTime(),
    };

    setPatient((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, aiMessage],
    }));
    speakText(reply, voiceEnabled);
  };

  const submitEntertainmentPrompt = (spokenText?: string) => {
    const clean = (spokenText ?? entertainmentPrompt).trim();
    if (!clean) return;
    handleOption(clean);
    setEntertainmentPrompt("");
  };

  const videos = [
    {
      id: "jfKfPfyJRdk",
      title: "Relaxing Lo-fi",
      description: "Gentle background music for comfort and calm.",
    },
    {
      id: "5qap5aO4i9A",
      title: "Calm Study Music",
      description: "Soft music that feels peaceful and not too intense.",
    },
    {
      id: "DWcJFNfaw9c",
      title: "Nature Relaxation",
      description: "Calming visuals and sounds for emotional comfort.",
    },
  ];

  return (
    <div className="grid gap-6">
      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="text-2xl text-white">
            Entertainment Mode
          </CardTitle>
          <CardDescription className="text-white/65">
            Comfort, music, and light engagement for the patient.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1fr,1fr]">
          <div className="space-y-4">
            <div className={`rounded-[24px] p-4 ${glassSoft}`}>
              <h3 className="text-lg font-semibold text-white">
                Ask for entertainment by voice
              </h3>
              <div className="mt-3 flex gap-2">
                <Input
                  value={entertainmentPrompt}
                  onChange={(e) => setEntertainmentPrompt(e.target.value)}
                  placeholder="Say: tell me a story, play trivia, help me relax..."
                  className={fieldClass}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitEntertainmentPrompt();
                  }}
                />
                <VoiceInputButton
                  label="Speak"
                  onTranscript={(text) => {
                    setEntertainmentPrompt(text);
                    submitEntertainmentPrompt(text);
                  }}
                />
                <Button
                  className={whiteActionButton}
                  onClick={() => submitEntertainmentPrompt()}
                >
                  Go
                </Button>
              </div>
            </div>

            <div className={`rounded-[24px] bg-white/[0.04] p-5 ${glassSoft}`}>
              <h3 className="text-lg font-semibold text-white">
                Patient activities
              </h3>
              <p className="mt-1 text-sm text-white/65">
                Quick, friendly activities to reduce loneliness and boredom.
              </p>

              <div className="mt-4 grid gap-3">
                {entertainmentOptions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.title}
                      variant="secondary"
                      className={`${quietButton} flex h-auto items-start justify-start gap-3 px-4 py-4 text-left`}
                      onClick={() => handleOption(item.prompt)}
                    >
                      <div className="rounded-xl bg-white/10 p-2">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-white/65">
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    YouTube comfort player
                  </h3>
                  <p className="mt-1 text-sm text-white/65">
                    For privacy and a calmer environment, unlock playback only
                    after headphones are connected.
                  </p>
                </div>
                <Badge className="rounded-full bg-white/10 px-3 py-1 text-white backdrop-blur-xl">
                  Headphones required
                </Badge>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <input
                  id="headphones"
                  type="checkbox"
                  checked={headphonesConfirmed}
                  onChange={(e) => setHeadphonesConfirmed(e.target.checked)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="headphones"
                  className="text-sm text-white/70"
                >
                  I confirm headphones are plugged in
                </label>
              </div>

              <div className="mt-4 grid gap-3">
                {videos.map((video) => (
                  <Button
                    key={video.id}
                    variant={
                      selectedVideo === video.id ? "default" : "secondary"
                    }
                    className={
                      selectedVideo === video.id
                        ? activeSoftButton +
                          " flex h-auto flex-col items-start px-4 py-4 text-left"
                        : `${quietButton} flex h-auto flex-col items-start px-4 py-4 text-left`
                    }
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <span className="font-medium">{video.title}</span>
                    <span className="text-sm opacity-80">
                      {video.description}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] bg-black shadow-md">
                {headphonesConfirmed ? (
                  <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${selectedVideo}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full"
                  />
                ) : (
                  <div className="flex h-[315px] flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center text-white">
                    <div className="rounded-full bg-white/10 p-4">
                      <VolumeX className="h-6 w-6" />
                    </div>
                    <p className="text-lg font-semibold">Playback locked</p>
                    <p className="max-w-sm text-sm text-white/80">
                      Confirm that headphones are connected to unlock YouTube
                      access for the patient.
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-white/50">
                Browser apps usually cannot verify physical headphone connection
                directly, so this uses patient or caregiver confirmation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HealthScreen({
  patient,
  setPatient,
  voiceEnabled,
}: {
  patient: PatientRecord;
  setPatient: React.Dispatch<React.SetStateAction<PatientRecord>>;
  voiceEnabled: boolean;
}) {
  const [question, setQuestion] = useState("");

  const askQuestion = (spokenText?: string) => {
    const clean = (spokenText ?? question).trim();
    if (!clean) return;

    const userMessage: Message = {
      role: "user",
      content: clean,
      time: nowTime(),
    };
    const reply = getAssistantResponse(clean, patient);
    const aiMessage: Message = {
      role: "assistant",
      content: reply,
      time: nowTime(),
    };

    setPatient((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, aiMessage],
    }));
    setQuestion("");
    speakText(reply, voiceEnabled);
  };

  return (
    <Card className={`rounded-[32px] ${glassCard}`}>
      <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
        <CardTitle className="text-2xl text-white">
          Health Questions
        </CardTitle>
        <CardDescription className="text-white/65">
          Ask simple health-related questions in easy language.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 p-4 md:grid-cols-[1.2fr,0.8fr] md:p-6">
        <div>
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a health question..."
              className={fieldClass}
              onKeyDown={(e) => {
                if (e.key === "Enter") askQuestion();
              }}
            />
            <VoiceInputButton
              label="Speak"
              onTranscript={(text) => {
                setQuestion(text);
                askQuestion(text);
              }}
            />
            <Button className={whiteActionButton} onClick={() => askQuestion()}>
              Ask
            </Button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 backdrop-blur-xl">
            <p className="font-medium text-white">Important:</p>
            <ul className="mt-2 space-y-2">
              <li>• This AI does not diagnose illness</li>
              <li>• It explains health topics simply</li>
              <li>• For serious symptoms, contact a nurse or doctor</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">
            Try these questions
          </h3>

          <div className="mt-3 grid gap-3">
            {[
              "Why do I feel dizzy?",
              "Why am I tired?",
              "What should I do if I feel anxious?",
            ].map((sample) => (
              <Button
                key={sample}
                variant="secondary"
                className={`${quietButton} justify-start py-6`}
                onClick={() => askQuestion(sample)}
              >
                {sample}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemoryScreen({
  patient,
  setPatient,
  voiceEnabled,
}: {
  patient: PatientRecord;
  setPatient: React.Dispatch<React.SetStateAction<PatientRecord>>;
  voiceEnabled: boolean;
}) {
  const [memoryQuestion, setMemoryQuestion] = useState("");

  const askMemoryQuestion = (spokenText?: string) => {
    const clean = (spokenText ?? memoryQuestion).trim();
    if (!clean) return;

    const userMessage: Message = {
      role: "user",
      content: clean,
      time: nowTime(),
    };
    const reply = getAssistantResponse(clean, patient);
    const aiMessage: Message = {
      role: "assistant",
      content: reply,
      time: nowTime(),
    };

    setPatient((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, aiMessage],
    }));
    setMemoryQuestion("");
    speakText(reply, voiceEnabled);
  };

  return (
    <div className="grid gap-6">
      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="flex items-center gap-2 text-2xl text-white">
            <Brain className="h-6 w-6" />
            Memory Companion Mode
          </CardTitle>
          <CardDescription className="text-white/65">
            Family reminders and daily routine support for patients with memory
            challenges.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1fr,1fr]">
          <div className="space-y-4">
            <div className={`rounded-[24px] p-5 ${glassSoft}`}>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-white/80" />
                <h3 className="text-lg font-semibold text-white">
                  Family memories
                </h3>
              </div>

              <div className="mt-4 grid gap-3">
                {patient.family.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-4 rounded-[24px] bg-white/5 p-4 backdrop-blur-xl border border-white/10"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl shadow-sm backdrop-blur-xl">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{member.name}</p>
                      <p className="text-sm text-white/60">
                        {member.relation}
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        {member.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[24px] p-5 ${glassSoft}`}>
              <h3 className="text-lg font-semibold text-white">
                Ask about your family by voice
              </h3>
              <div className="mt-3 flex gap-2">
                <Input
                  value={memoryQuestion}
                  onChange={(e) => setMemoryQuestion(e.target.value)}
                  placeholder="Say: Who is Sarah? What is my next medicine?"
                  className={fieldClass}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") askMemoryQuestion();
                  }}
                />
                <VoiceInputButton
                  label="Speak"
                  onTranscript={(text) => {
                    setMemoryQuestion(text);
                    askMemoryQuestion(text);
                  }}
                />
                <Button
                  className={whiteActionButton}
                  onClick={() => askMemoryQuestion()}
                >
                  Ask
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-white/80" />
                <h3 className="text-lg font-semibold text-white">
                  Today’s routine
                </h3>
              </div>

              <div className="mt-4 grid gap-3">
                {patient.tasks.map((item, index) => (
                  <div
                    key={`${item.time}-${index}`}
                    className="rounded-[24px] border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.time}</p>
                      <Badge className="rounded-full bg-white/10 text-white backdrop-blur-xl">
                        Reminder
                      </Badge>
                    </div>
                    <p className="mt-2 text-white">{item.task}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/65">
                      <Pill className="h-4 w-4" />
                      <span>Medication: {item.medication}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-sm backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white">
                Why this matters
              </h3>
              <p className="mt-2 text-sm text-white/70">
                This mode helps patients remember loved ones, daily routines,
                and medication schedules in a calmer, more accessible way.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FamilyPortalScreen({
  patient,
}: {
  patient: PatientRecord;
}) {
  const concerns = useMemo(
    () => summarizeConcerns(patient.messages),
    [patient.messages]
  );
  const riskFlags = useMemo(
    () => detectRiskFlags(patient.messages),
    [patient.messages]
  );
  const latestMood = patient.moods.length
    ? patient.moods[patient.moods.length - 1].mood
    : "Not logged";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="flex items-center gap-2 text-2xl text-white">
            <UsersRound className="h-6 w-6" />
            Family Portal
          </CardTitle>
          <CardDescription className="text-white/65">
            View patient status and memory information when visiting later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <p className="text-sm text-white/50">Patient</p>
            <p className="text-xl font-semibold text-white">{patient.name}</p>
            <p className="text-sm text-white/65">
              {patient.room} • {patient.status}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              icon={Smile}
              title="Latest mood"
              value={latestMood}
              subtitle="Most recent check-in"
            />
            <StatCard
              icon={Moon}
              title="Sleep"
              value={`${patient.sleep.hours} hrs`}
              subtitle={patient.sleep.quality}
            />
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white">
              Family memory data
            </h3>
            <div className="mt-3 grid gap-3">
              {patient.family.map((member, idx) => (
                <div
                  key={`${member.name}-${idx}`}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <p className="font-semibold text-white">
                    {member.avatar} {member.name}
                  </p>
                  <p className="text-sm text-white/60">{member.relation}</p>
                  <p className="mt-1 text-sm text-white/70">{member.note}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="text-2xl text-white">
            Reports and alerts
          </CardTitle>
          <CardDescription className="text-white/65">
            Helpful summaries for family members when the patient has been
            alone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <p className="font-semibold text-white">Main concerns</p>
            <p className="mt-2 text-white/70">
              {concerns.length
                ? concerns.join(", ")
                : "No major concerns recorded."}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <p className="font-semibold text-white">Risk flags</p>
            <div className="mt-3 space-y-3">
              {riskFlags.length > 0 ? (
                riskFlags.map((flag) => (
                  <div
                    key={flag}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white/80 backdrop-blur-xl"
                  >
                    ⚠️ {flag}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white/60 backdrop-blur-xl">
                  No active risk flags detected.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <p className="font-semibold text-white">Today’s reminders</p>
            <div className="mt-3 grid gap-3">
              {patient.tasks.map((task, idx) => (
                <div
                  key={`${task.time}-${idx}`}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                >
                  <p className="font-semibold text-white">{task.time}</p>
                  <p className="text-sm text-white/70">{task.task}</p>
                  <p className="mt-1 text-sm text-white/60">
                    Medication: {task.medication}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardScreen({
  patient,
  patients,
  setPatients,
  setSelectedPatientId,
  caregiverAuthenticated,
  setCaregiverAuthenticated,
  caregiverCredentials,
}: {
  patient: PatientRecord;
  patients: PatientRecord[];
  setPatients: React.Dispatch<React.SetStateAction<PatientRecord[]>>;
  setSelectedPatientId: (id: string) => void;
  caregiverAuthenticated: boolean;
  setCaregiverAuthenticated: (value: boolean) => void;
  caregiverCredentials: {
    id: string;
    password: string;
  };
}) {
  const [activeTab, setActiveTab] = useState<"summary" | "setup">("summary");
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const concerns = useMemo(
    () => summarizeConcerns(patient.messages),
    [patient.messages]
  );
  const riskFlags = useMemo(
    () => detectRiskFlags(patient.messages),
    [patient.messages]
  );
  const latestMood = patient.moods.length
    ? patient.moods[patient.moods.length - 1].mood
    : "Okay";
  const suggestedNote = generateSuggestedNote({
    moods: patient.moods,
    sleep: patient.sleep,
    concerns,
  });

  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientRoom, setNewPatientRoom] = useState("");
  const [newPatientStatus, setNewPatientStatus] = useState("Stable");

  const [familyName, setFamilyName] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [familyAvatar, setFamilyAvatar] = useState("👩");
  const [familyNote, setFamilyNote] = useState("");

  const [taskTime, setTaskTime] = useState("");
  const [taskText, setTaskText] = useState("");
  const [taskMedication, setTaskMedication] = useState("");

  const handleCaregiverLogin = () => {
    if (
      loginId === caregiverCredentials.id &&
      loginPassword === caregiverCredentials.password
    ) {
      setCaregiverAuthenticated(true);
      setLoginError("");
      setLoginId("");
      setLoginPassword("");
    } else {
      setLoginError("Invalid caregiver ID or password.");
    }
  };

  const handleLogout = () => {
    setCaregiverAuthenticated(false);
    setActiveTab("summary");
  };

  const addPatient = () => {
    if (
      !newPatientName.trim() ||
      !newPatientAge.trim() ||
      !newPatientRoom.trim()
    ) {
      return;
    }

    const id =
      newPatientName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const createdPatient: PatientRecord = {
      id,
      name: newPatientName.trim(),
      age: Number(newPatientAge),
      room: newPatientRoom,
      status: newPatientStatus,
      messages: [
        {
          role: "assistant",
          content:
            "Hello. I’m Support AI. I’m here to support you with conversation, reminders, and comfort.",
          time: nowTime(),
        },
      ],
      moods: [],
      sleep: {
        hours: 0,
        quality: "Okay",
        wokeOften: false,
      },
      family: [],
      tasks: [],
      checkIns: [],
      appointments: [],
      medicalReports: [],
      usageMinutes: 0,
      sessionStartedAt: null,
    };

    setPatients((prev) => [...prev, createdPatient]);
    setSelectedPatientId(createdPatient.id);

    setNewPatientName("");
    setNewPatientAge("");
    setNewPatientRoom("");
    setNewPatientStatus("Stable");
  };

  const addFamilyMember = () => {
    if (!familyName.trim() || !familyRelation.trim()) return;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patient.id
          ? {
              ...p,
              family: [
                ...p.family,
                {
                  name: familyName,
                  relation: familyRelation,
                  avatar: familyAvatar,
                  note: familyNote,
                },
              ],
            }
          : p
      )
    );

    setFamilyName("");
    setFamilyRelation("");
    setFamilyNote("");
  };

  const addTask = () => {
    if (!taskTime.trim() || !taskText.trim()) return;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patient.id
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  id: "task-" + Date.now(),
                  time: taskTime,
                  task: taskText,
                  medication: taskMedication || "None",
                  category: taskMedication ? "medicine" : "task",
                },
              ],
            }
          : p
      )
    );

    setTaskTime("");
    setTaskText("");
    setTaskMedication("");
  };

  if (!caregiverAuthenticated) {
    return (
      <Card className={`rounded-[32px] ${glassCard}`}>
        <CardHeader className={`rounded-t-[32px] ${subtleHeader}`}>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Caregiver Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <Input
            placeholder="Caregiver ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className={fieldClass}
          />
          <Input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className={fieldClass}
          />

          {loginError && (
            <p className="text-sm text-red-400">{loginError}</p>
          )}

          <Button className={whiteActionButton} onClick={handleCaregiverLogin}>
            Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Button
            className={
              activeTab === "summary" ? activeSoftButton : quietButton
            }
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </Button>
          <Button
            className={activeTab === "setup" ? activeSoftButton : quietButton}
            onClick={() => setActiveTab("setup")}
          >
            Setup
          </Button>
        </div>

        <Button className={quietButton} onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {activeTab === "summary" && (
        <div className="grid gap-6 md:grid-cols-2">
          <StatCard
            icon={Smile}
            title="Mood"
            value={latestMood}
          />
          <StatCard
            icon={Moon}
            title="Sleep"
            value={`${patient.sleep.hours} hrs`}
          />

          <Card className={`rounded-[32px] ${glassCard}`}>
            <CardContent className="p-5">
              <h3 className="text-white font-semibold">Concerns</h3>
              <p className="text-white/70 mt-2">
                {concerns.length
                  ? concerns.join(", ")
                  : "No concerns detected"}
              </p>
            </CardContent>
          </Card>

          <Card className={`rounded-[32px] ${glassCard}`}>
            <CardContent className="p-5">
              <h3 className="text-white font-semibold">Risk Flags</h3>
              <p className="text-white/70 mt-2">
                {riskFlags.length
                  ? riskFlags.join(", ")
                  : "No risk flags"}
              </p>
            </CardContent>
          </Card>

          <Card className={`rounded-[32px] ${glassCard}`}>
            <CardContent className="p-5">
              <h3 className="text-white font-semibold">Suggested Note</h3>
              <p className="text-white/70 mt-2">{suggestedNote}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "setup" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className={`rounded-[32px] ${glassCard}`}>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-white font-semibold">Add Patient</h3>

              <Input
                placeholder="Name"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                className={fieldClass}
              />
              <Input
                placeholder="Age"
                value={newPatientAge}
                onChange={(e) => setNewPatientAge(e.target.value)}
                className={fieldClass}
              />
              <Input
                placeholder="Room"
                value={newPatientRoom}
                onChange={(e) => setNewPatientRoom(e.target.value)}
                className={fieldClass}
              />

              <Button className={whiteActionButton} onClick={addPatient}>
                Add Patient
              </Button>
            </CardContent>
          </Card>

          <Card className={`rounded-[32px] ${glassCard}`}>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-white font-semibold">Add Family Member</h3>

              <Input
                placeholder="Name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className={fieldClass}
              />
              <Input
                placeholder="Relation"
                value={familyRelation}
                onChange={(e) => setFamilyRelation(e.target.value)}
                className={fieldClass}
              />

              <Button className={whiteActionButton} onClick={addFamilyMember}>
                Add Family
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
function TransitionScreen({
  currentPatient,
  setDisplayScreen,
}: {
  currentPatient: PatientRecord;
  setDisplayScreen: (screen: string) => void;
}) {
  const items = [
    { id: "chat", label: "Talk to Support AI", icon: MessageCircle },
    { id: "memory", label: "Memory Companion", icon: Brain },
    { id: "mood", label: "Mood Check-In", icon: Smile },
    { id: "sleep", label: "Sleep Log", icon: Moon },
    { id: "health", label: "Health Questions", icon: Search },
    { id: "entertainment", label: "Entertainment", icon: Gamepad2 },
    { id: "family-portal", label: "Family Portal", icon: UsersRound },
    { id: "dashboard", label: "Caregiver Dashboard", icon: ShieldPlus },
  ];

  return (
    <div className="grid gap-6">
      <Card className={`overflow-hidden rounded-[32px] ${glassCard}`}>
        <CardContent className="bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-white/[0.03] p-6 md:p-8 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <CarFront className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/50">Patient selected</p>
              <h2 className="text-3xl font-bold text-white">
                {currentPatient.name}
              </h2>
              <p className="mt-1 text-white/70">
                Choose an option to continue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Button
                variant="secondary"
                className="h-28 w-full rounded-[28px] border border-white/10 bg-white/[0.04] text-white shadow-md backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] hover:shadow-lg"
                onClick={() => setDisplayScreen(item.id)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function SupportAIMVP() {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState("mary");
  const [screen, setScreen] = useState<"home" | "transition">("home");
  const [displayScreen, setDisplayScreen] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [headphonesConfirmed, setHeadphonesConfirmed] = useState(false);
  const [caregiverAuthenticated, setCaregiverAuthenticated] = useState(false);

  const currentPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId]
  );

  const setCurrentPatient: React.Dispatch<React.SetStateAction<PatientRecord>> = (
    updater
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== currentPatient.id) return p;
        return typeof updater === "function"
          ? (updater as (prev: PatientRecord) => PatientRecord)(p)
          : updater;
      })
    );
  };

  const openFromHome = (next: string) => {
    setDisplayScreen(next);
    setScreen("transition");
  };

  const goBack = () => {
    if (screen === "transition" && displayScreen) {
      setDisplayScreen("");
      return;
    }
    setScreen("home");
    setDisplayScreen("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">
              Support AI
            </p>
            <h1 className="text-2xl font-bold">Patient Support Dashboard</h1>
          </div>

          {screen !== "home" && (
            <Button variant="secondary" className={quietButton} onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <PatientSelector
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelect={(id) => {
            setSelectedPatientId(id);
            setScreen("home");
            setDisplayScreen("");
          }}
        />

        <main>
          <AnimatePresence mode="wait">
            {screen === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HomeScreen
                  patient={currentPatient}
                  setScreen={openFromHome}
                  latestMood={
                    currentPatient.moods.length
                      ? currentPatient.moods[currentPatient.moods.length - 1].mood
                      : null
                  }
                  sleep={currentPatient.sleep}
                />
              </motion.div>
            )}

            {screen === "transition" && !displayScreen && (
              <motion.div
                key="transition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TransitionScreen
                  currentPatient={currentPatient}
                  setDisplayScreen={setDisplayScreen}
                />
              </motion.div>
            )}

            {screen === "transition" && displayScreen === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ChatScreen
                  patient={currentPatient}
                  setPatient={setCurrentPatient}
                  voiceEnabled={voiceEnabled}
                  setVoiceEnabled={setVoiceEnabled}
                />
              </motion.div>
            )}

            {screen === "transition" && displayScreen === "memory" && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MemoryScreen
                  patient={currentPatient}
                  setPatient={setCurrentPatient}
                  voiceEnabled={voiceEnabled}
                />
              </motion.div>
            )}

            {screen === "transition" && displayScreen === "mood" && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MoodScreen
                  patient={currentPatient}
                  setPatient={setCurrentPatient}
                />
              </motion.div>
            )}

            {screen === "transition" && displayScreen === "sleep" && (
              <motion.div
                key="sleep"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SleepScreen
                  patient={currentPatient}
                  setPatient={setCurrentPatient}
                />
              </motion.div>
            )}

            {screen === "transition" && displayScreen === "health" && (
              <motion.div
                key="health"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HealthScreen
                  patient={currentPatient}
                  setPatient={setCurrentPatient}
                  voiceEnabled={voiceEnabled}
                />
              </motion.div>
            )}

            {screen === "transition" && displayScreen === "entertainment" && (
              <motion.div
                key="entertainment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <EntertainmentScreen
                  patient={currentPatient}
                  setPatient={setCurrentPatient}
                  voiceEnabled={voiceEnabled}
                  headphonesConfirmed={headphonesConfirmed}
                  setHeadphonesConfirmed={setHeadphonesConfirmed}
                />
              </motion.div>
            )}

            {screen === "transition" && displayScreen === "family-portal" && (
              <motion.div
                key="family-portal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FamilyPortalScreen patient={currentPatient} />
              </motion.div>
            )}

            {screen === "transition" && displayScreen === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DashboardScreen
                  patient={currentPatient}
                  patients={patients}
                  setPatients={setPatients}
                  setSelectedPatientId={setSelectedPatientId}
                  caregiverAuthenticated={caregiverAuthenticated}
                  setCaregiverAuthenticated={setCaregiverAuthenticated}
                  caregiverCredentials={caregiverCredentials}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
