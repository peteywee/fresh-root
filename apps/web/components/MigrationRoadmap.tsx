// [P0][UI][CODE] MigrationRoadmap
// Tags: P0, UI, CODE
import React, { useState } from "react";
import { ChevronRight, CheckCircle2, Lightbulb } from "lucide-react";

export default function MigrationRoadmap() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  const phases = [
    {
      phase: 1,
      title: "BASELINE",
      subtitle: "Know What You Actually Have",
      icon: "🔍",
      color: "bg-blue-100 border-blue-400",
      description:
        "Lock in reality: what v13.5 said, what v14 specified, and what fresh-root-main actually contains.",
      badge: "13.5 → 14 Reality Check",
      details: [
        "Index the repo: apps/web, services, types, rules, docs, CI",
        "Identify everything that only exists in v13.5 or v14 docs (but not in code)",
        "Mark which concepts are KEEP, CHANGE, or KILL for v15",
        "Create a simple crosswalk: Feature / Spec Version / Code Path / Decision",
      ],
    },
    {
      phase: 2,
      title: "PLAN & BIBLE",
      subtitle: "Lock the Truth for v15",
      icon: "📘",
      color: "bg-purple-100 border-purple-400",
      description:
        "Merge 13.5 and 14 into a single, canonical v15 Bible and migration plan that everything else follows.",
      badge: "v15 Migration Plan",
      details: [
        "Create Project_Bible_v15_MIGRATION_PLAN.md with clear scope: what v15 includes and what is deferred",
        "Build Spec Crosswalk and Schema Crosswalk tables from v13.5/v14 → v15",
        "Decide firebase strategy explicitly: what stays, what is abstracted, how we export data",
        "Tag migration tasks as GitHub issues with milestone:v15 and group them into epics",
      ],
    },
    {
      phase: 3,
      title: "MIGRATE",
      subtitle: "Move Code & Data Onto the New Skeleton",
      icon: "⚙️",
      color: "bg-amber-100 border-amber-400",
      description:
        "Refactor code, rules, and data so the running system matches the v15 Bible with no drift.",
      badge: "Code + Data Execution",
      details: [
        "Refactor onboarding, dashboard, and APIs so they match v15 flows and types",
        "Introduce a data access layer (services/db/*) instead of calling Firestore directly from UI",
        "Update Firestore rules to enforce the v15 tenant model (network → corp → org → venue)",
        "Write migration scripts to transform legacy Firestore documents into the v15 canonical schema",
      ],
    },
    {
      phase: 4,
      title: "HARDEN & SHIP",
      subtitle: "UX on Bedrock, Ready to Scale",
      icon: "🚀",
      color: "bg-green-100 border-green-400",
      description:
        "Once the foundation is stable, finish UX, tests, and performance so you can freeze and ship.",
      badge: "Freeze & Launch",
      details: [
        "Design and refine UX knowing the schema and flows are stable underneath",
        "Add unit, rule, and end-to-end tests for the golden path (signup → onboarding → schedule → staff view)",
        "Hit performance and PWA targets (Lighthouse ≥ 90, fast TTI, installable app shell)",
        "Cut a v15.0.0 freeze: tag the release, lock scope, and plan 15.1+ features (AI, analytics, mobile wrappers)",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            v15 Migration Roadmap
          </h1>
          <p className="text-lg text-gray-600">Baseline → Plan & Bible → Migrate → Harden & Ship</p>
          <p className="mt-2 font-mono text-sm text-gray-500">
            13.5 → 14 → 15 • Spec ↔ Code ↔ Data all in sync
          </p>
        </div>

        {/* Roadmap */}
        <div className="space-y-6">
          {phases.map((item, index) => (
            <div key={index}>
              {/* Phase Card */}
              <div
                onClick={() => setExpandedPhase(expandedPhase === index ? null : index)}
                className={`${item.color} transform cursor-pointer rounded-xl border-4 p-8 transition-all hover:scale-105 hover:shadow-lg`}
              >
                <div className="flex items-start gap-6">
                  <div className="text-5xl">{item.icon}</div>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="inline-block rounded-full bg-white px-4 py-2 font-mono text-xs font-bold md:text-sm">
                        PHASE {item.phase}
                      </span>
                      {item.badge && (
                        <span className="inline-block rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-gray-800 md:text-sm">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{item.title}</h2>
                    <p className="mt-1 text-sm text-gray-600 italic">{item.subtitle}</p>
                    <p className="mt-3 text-base text-gray-700 md:text-lg">{item.description}</p>
                  </div>
                  <ChevronRight
                    className={`mt-2 h-8 w-8 flex-shrink-0 transform text-gray-600 transition-transform ${
                      expandedPhase === index ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {/* Expanded Details */}
                {expandedPhase === index && (
                  <div className="mt-8 border-t-4 border-gray-300 pt-8">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Lightbulb className="h-5 w-5" />
                      What you actually do here:
                    </h3>
                    <ul className="space-y-3">
                      {item.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-800">
                          <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                          <span className="text-base md:text-lg">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Arrow Between Phases */}
              {index < phases.length - 1 && (
                <div className="flex justify-center py-4">
                  <div className="animate-bounce text-4xl font-bold text-gray-400">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Summary */}
        <div className="mt-12 rounded-xl border-4 border-green-400 bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="text-4xl">🎯</div>
            <div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Why This Order Matters</h3>
              <p className="mb-3 text-base text-gray-700 md:text-lg">
                You are not just building screens; you are migrating a live brain from v13.5 and v14
                into v15. If you skip baseline or the Bible, you end up coding against ghosts. If
                you skip migration discipline, your data and rules lie. Only once Phases 1–3 are
                solid does UX work become permanent instead of throwaway.
              </p>
              <p className="text-base font-semibold text-gray-700 text-green-700 md:text-lg">
                ✓ When Phase 4 starts, every pixel sits on top of a schema, ruleset, and Bible you
                trust.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
