"use client";

import { useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { askTalentQuery, getApiErrorMessage } from "@/lib/api";

const EXAMPLE_QUESTIONS = [
  "Show backend candidates with PostgreSQL and 3+ years.",
  "Which candidates have the strongest React experience?",
  "Find shortlisted candidates with weak education match.",
] as const;

export function QueryTalentPanel() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function runQuery(nextQuestion = question) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) {
      toast.error("Enter a question first.");
      return;
    }

    setBusy(true);
    setQuestion(trimmed);

    try {
      const result = await askTalentQuery({ question: trimmed });
      setAnswer(result.answer);
      setSuggestions(result.suggestedNextQuestions);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to run talent query."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-card shadow-card">
      <div className="border-b border-border p-5">
        <div className="inline-flex items-center gap-2 rounded-badge border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Zero to Query
        </div>
        <h2 className="mt-3 text-xl font-bold text-text-primary">Query Talent</h2>
        <p className="mt-1 text-sm text-text-muted">
          Ask natural-language questions over Sub0-structured applicant data. Powered by Gemini in
          production; mock answers available offline.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void runQuery();
                }
              }}
              placeholder="Ask about skills, experience, shortlist fit..."
              className="h-11 w-full rounded-input border border-border bg-bg pl-10 pr-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <Button onClick={() => void runQuery()} disabled={busy} className="h-11 px-5">
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Querying...
              </>
            ) : (
              "Run query"
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => void runQuery(example)}
              className="rounded-full border border-border bg-bg px-3 py-1.5 text-left text-xs font-medium text-text-muted transition-colors hover:border-accent/30 hover:text-text-primary"
            >
              {example}
            </button>
          ))}
        </div>

        {answer ? (
          <div className="rounded-input border border-border bg-bg p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Answer
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
              {answer}
            </p>
          </div>
        ) : null}

        {suggestions.length > 0 ? (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Suggested next questions
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void runQuery(suggestion)}
                  className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
