"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FilePlus2,
  Search,
  CheckCircle2,
  EyeOff,
  ShieldCheck,
  Bell,
  GraduationCap,
  Home as HomeIcon,
  Laptop2,
  AlertTriangle,
  Wallet,
  Wrench,
  MoreHorizontal,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Button } from "@/components/ui/Button";

const STEPS = [
  {
    number: "01",
    title: "Submit",
    desc: "File a complaint in under two minutes — anonymously or logged in. Attach photo evidence if you have it.",
    icon: FilePlus2,
  },
  {
    number: "02",
    title: "Track",
    desc: "Get a tracking code on the spot. Use it any time — no login needed — to see exactly where things stand.",
    icon: Search,
  },
  {
    number: "03",
    title: "Resolved",
    desc: "Admin reviews, responds in the thread, and moves your complaint to Resolved. You're notified every step.",
    icon: CheckCircle2,
  },
];

const CATEGORIES = [
  { name: "Academic", icon: GraduationCap },
  { name: "Hostel/Accommodation", icon: HomeIcon },
  { name: "ICT/Portal", icon: Laptop2 },
  { name: "Harassment", icon: AlertTriangle },
  { name: "Financial", icon: Wallet },
  { name: "Facilities", icon: Wrench },
  { name: "Other", icon: MoreHorizontal },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:py-28">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/20 bg-blue-50 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Anonymous by default. Heard either way.
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
              Your voice matters.
              <br />
              <span className="text-[var(--color-primary)]">Tracked, not lost.</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
              CampusVoice gives every student a direct line to admin — hostel issues, ICT
              problems, academic disputes, or anything else. Submit in minutes. Follow it to
              resolution with a single code.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/submit" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  <FilePlus2 className="h-4 w-4" />
                  Submit a Complaint
                </Button>
              </Link>
              <Link href="/track" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Search className="h-4 w-4" />
                  Track a Complaint
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Signature element: animated live-tracking mock card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto w-full max-w-sm"
          >
            <TrackingDemoCard />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">How it works</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">Three steps. One code. Full visibility.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
            >
              <span className="font-mono text-xs font-semibold text-[var(--color-primary)]/50">
                {step.number}
              </span>
              <div className="mt-3 mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <step.icon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <h3 className="mb-1.5 font-semibold text-[var(--color-text-primary)]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reassurance */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="rounded-2xl border border-[var(--color-border)] p-6 sm:p-8"
          >
            <EyeOff className="mb-4 h-8 w-8 text-[var(--color-primary)]" />
            <h3 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">Anonymous, structurally</h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Anonymous submissions are fully supported. Your identity is never shared unless you
              choose to. No hidden flag, no link stored anywhere — an anonymous complaint simply
              carries no identifying record at all. Your tracking code is your only key back in.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[var(--color-border)] p-6 sm:p-8"
          >
            <Bell className="mb-4 h-8 w-8 text-[var(--color-accent)]" />
            <h3 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">
              Or log in for convenience
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Prefer a dashboard? Sign up to see every complaint you&apos;ve filed in one place,
              with real-time notifications the moment admin replies or changes a status. Still
              optional, always your choice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            Whatever it is, there&apos;s a category
          </h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Sensitive categories get priority visibility in admin&apos;s queue.
          </p>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm"
            >
              <cat.icon className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <CategoryTag category={cat.name} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="rounded-3xl bg-[var(--color-primary)] px-6 py-12 text-center sm:px-12"
        >
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to be heard?</h2>
          <p className="mx-auto mt-2 max-w-md text-blue-100">
            It takes less time to submit a complaint than to explain it to a friend.
          </p>
          <Link href="/submit" className="mt-6 inline-block">
            <Button size="lg" variant="secondary" className="!text-[var(--color-primary)] font-medium">
              Submit a Complaint
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

function TrackingDemoCard() {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-xs text-[var(--color-text-secondary)]">CMP-2026-0043</p>
        <motion.div
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <StatusBadge status="in_review" />
        </motion.div>
      </div>
      <p className="mb-1 font-semibold text-[var(--color-text-primary)]">Leaking pipe — Block C</p>
      <p className="mb-5 text-xs text-[var(--color-text-secondary)]">Hostel/Accommodation</p>

      <div className="space-y-4">
        {[
          { label: "Submitted", done: true },
          { label: "In Review", done: true },
          { label: "Resolved", done: false },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                step.done ? "bg-[var(--color-accent)] text-white" : "border-2 border-slate-200 text-slate-300"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </motion.div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  step.done ? "text-[var(--color-text-primary)]" : "text-slate-400"
                }`}
              >
                {step.label}
              </p>
            </div>
            {i < 2 && <div className="h-px flex-1" />}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-3">
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-primary)]">Admin:</span> &quot;Facilities
          team scheduled for tomorrow morning.&quot;
        </p>
      </div>
    </div>
  );
}
