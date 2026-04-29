"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  HeartHandshake,
  MessageCircle,
  Moon,
  ShieldPlus,
  Smile,
  Sparkles,
  UsersRound,
  Gamepad2,
  Mic,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageCircle,
    title: "Warm AI conversation",
    text: "A calm, supportive space where patients can talk, ask simple questions, and feel heard.",
  },
  {
    icon: Brain,
    title: "Memory companion",
    text: "Gentle reminders that help people remember loved ones, daily routines, and important moments.",
  },
  {
    icon: Smile,
    title: "Mood check-ins",
    text: "Simple emotional check-ins that make it easier to notice patterns and support wellbeing over time.",
  },
  {
    icon: Moon,
    title: "Sleep insights",
    text: "A lightweight way to track sleep quality and understand how rest connects to daily comfort.",
  },
  {
    icon: UsersRound,
    title: "Family connection",
    text: "A better way for loved ones to stay informed, connected, and involved in everyday care.",
  },
  {
    icon: ShieldPlus,
    title: "Care support tools",
    text: "Helpful summaries and wellness signals that support more thoughtful caregiving.",
  },
];

const supportCards = [
  {
    icon: Mic,
    title: "Voice-friendly design",
    text: "Made for easy interaction with simple voice input and spoken support.",
  },
  {
    icon: HeartHandshake,
    title: "Emotional comfort",
    text: "Built to reduce loneliness and create a calmer, more reassuring experience.",
  },
  {
    icon: Gamepad2,
    title: "Gentle engagement",
    text: "Stories, trivia, breathing exercises, and calming activities help make the day feel lighter.",
  },
  {
    icon: Activity,
    title: "Wellness awareness",
    text: "Highlights patterns around mood, fatigue, sleep, and emotional distress in a simple way.",
  },
];

const highlights = [
  ["Voice-friendly", "Low-friction interaction"],
  ["Family-aware", "Connection and reassurance"],
  ["Comfort-first", "Made to feel calm and human"],
];

export default function SupportAILandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.28),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_24%),radial-gradient(circle_at_bottom,rgba(244,114,182,0.16),transparent_30%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

        <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-8 md:px-10 md:pb-32 md:pt-10">
          <nav className="mb-14 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 shadow-lg shadow-fuchsia-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">Support AI</p>
                <p className="text-base font-semibold">Care that feels human</p>
              </div>
            </div>

           <div className="hidden items-center gap-4 md:flex">
  <a href="#features" className="text-sm text-white/70 hover:text-white">
    Features
  </a>
  <a href="#support" className="text-sm text-white/70 hover:text-white">
    How it helps
  </a>
  <a href="#why" className="text-sm text-white/70 hover:text-white">
    Why it matters
  </a>

  <Button
    className="rounded-full bg-white text-slate-950 hover:bg-white/90"
    onClick={() => router.push("/dashboard")}
  >
    Get me support
  </Button>
</div>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Badge className="mb-5 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-1.5 text-fuchsia-200">
                AI support for comfort, memory, and daily care
              </Badge>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl"
              >
                Compassionate AI support
                <span className="block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                  for everyday care
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="mt-6 max-w-2xl text-lg leading-8 text-white/70 md:text-xl"
              >
                Support AI is a public-facing care platform designed to help
                patients feel less alone through conversation, memory support,
                mood and sleep check-ins, calming activities, and stronger
                family connection.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.16 }}
                className="mt-8"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                  Built for patients, families, and caregivers
                </p>
              </motion.div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {highlights.map(([title, sub]) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                  >
                    <p className="text-lg font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-white/60">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="relative"
            >
              <div className="absolute -left-6 top-10 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-3xl" />
              <div className="absolute -right-6 bottom-8 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl" />

              <div className="relative rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
                <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/45">
                    A calmer care experience
                  </p>

                  <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                    Support that feels warm,
                    <span className="block text-white/65">
                      simple, and reassuring
                    </span>
                  </h2>

                  <p className="mt-5 text-base leading-8 text-white/70">
                    This experience is designed to make care feel more human.
                    Patients get conversation and comfort. Families stay more
                    connected. Caregivers get clearer insight into how someone
                    is doing day to day.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm text-white/45">For patients</p>
                      <p className="mt-2 text-lg font-semibold">
                        Friendly support and emotional comfort
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm text-white/45">For families</p>
                      <p className="mt-2 text-lg font-semibold">
                        Better connection and peace of mind
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm text-white/45">For caregivers</p>
                      <p className="mt-2 text-lg font-semibold">
                        More visibility into mood and wellness
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm text-white/45">For daily life</p>
                      <p className="mt-2 text-lg font-semibold">
                        Gentle routines, reminders, and support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 md:px-10"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Core features
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Beautiful on the outside.
            <span className="block text-white/65">
              Deeply supportive on the inside.
            </span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <Card className="h-full rounded-[28px] border border-white/10 bg-white/5 text-white backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-white/65">
                      {feature.text}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section
        id="support"
        className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-20"
      >
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-fuchsia-300/80">
              How it helps
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              Designed for real everyday support.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/65">
              Support AI brings together emotional care, memory assistance,
              wellness awareness, and family connection in one calmer
              experience.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Patients get a friendlier, lower-stress experience.",
                "Families feel more informed and more connected.",
                "Caregivers get clearer signals around daily wellbeing.",
                "The full experience feels supportive, modern, and human.",
              ].map((line) => (
                <div key={line} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" />
                  <p className="text-white/75">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {supportCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                  <p className="mt-3 leading-7 text-white/65">{card.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-white/5 to-cyan-400/10 p-8 backdrop-blur-2xl md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-fuchsia-200/80">
                Big idea
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                More than health tech.
                <span className="block text-white/65">
                  A calmer care experience.
                </span>
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
                The goal is not just to build another healthcare interface. The
                goal is to create something that helps people feel safe, seen,
                supported, and a little less alone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}