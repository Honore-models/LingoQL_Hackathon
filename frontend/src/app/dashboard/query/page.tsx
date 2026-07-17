"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { HiringWorkflowTimeline } from "@/components/dashboard/HiringWorkflowTimeline";
import { QueryTalentPanel } from "@/components/dashboard/QueryTalentPanel";

export const dynamic = "force-dynamic";

export default function QueryTalentPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageHeader
        title="Query Talent"
        subtitle="Sub0-powered natural-language search over structured applicant data."
      />

      <div className="mt-8 space-y-6">
        <QueryTalentPanel />
        <HiringWorkflowTimeline activeStep={4} />
      </div>
    </motion.div>
  );
}
