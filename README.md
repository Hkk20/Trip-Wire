# Tripwire
### The Mobile Trust Layer for AI-Generated Code
**iQOO Phone-First AI Hackathon — Idea Report**

---

## 1. One-Line Pitch

Tripwire is a phone-first security checkpoint that makes it safe to approve AI-generated code from your phone — combining on-device secret detection, biometric-verified approval, and a tamper-evident attestation record, so every AI-approved change has a trustworthy audit trail.

---

## 2. The Problem

Developers increasingly use AI coding assistants — Claude Code, Cursor, GitHub Copilot, Gemini Code Assist, Windsurf, Codex — to generate pull requests. Those PRs are now frequently reviewed and approved directly from a phone: on a commute, between meetings, away from a laptop.

Every existing security tool was built for a different moment:

| Tool | When it runs |
|---|---|
| CodeQL, Semgrep, SonarQube | Inside CI/CD, after code is already pushed |
| Snyk, Checkmarx | Pipeline-integrated, desktop/CI-first |
| GitHub Advanced Security | Repository-level, not approval-moment-level |

**None of them intervene at the exact moment a human taps "Approve" on a phone.** That gap means a developer can unknowingly approve AI-generated code containing exposed secrets, vulnerable dependencies, or other high-confidence risk categories, seconds before it merges — with no verification of who actually made that call, or what they were shown when they made it.

This gap is widening, not shrinking: agentic coding tools now generate far more candidate changes per developer than a human alone could write, and a growing share of those changes are reviewed with lower context and lower scrutiny than a human-authored PR would get. The volume of mobile-approved, AI-originated code is rising while the average trust-per-decision is falling — and nothing in the market currently addresses that specific, new moment.

---

## 3. The Solution

Tripwire inserts itself at the one moment no other tool touches: **the mobile approval tap.**

**The core loop:**
1. A PR (often AI-agent-generated) is opened in a connected repo.
2. Tripwire fetches the diff and runs a fast, on-device scan for high-confidence risk signals — hardcoded secrets, API keys, known-bad patterns.
3. The developer sees a risk card, not a bare notification: what was found, why it matters, in plain language.
4. **Low risk:** one-tap approve.
5. **High risk:** approval requires biometric confirmation (Face/Fingerprint) — not just a tap.
6. Every approval — clean or flagged — is written to an immutable attestation log: what was approved, by whom, under what evidence, at what time.

**The key reframe (and the reason this isn't "just another scanner"):** Tripwire does not try to out-detect CodeQL or Semgrep — that's a fight a small team loses against a decade of static-analysis tuning. Instead, Tripwire's real product is the **attestation record** — proof of who approved what AI-generated code, under what evidence, biometrically confirmed. That's something only a phone-native tool can produce, and something no desktop-bound competitor can retrofit without rebuilding a mobile app and biometric integration from scratch.

---

## 4. What Makes This Genuinely Phone-First

This isn't a web dashboard with a mobile wrapper. Three phone capabilities are load-bearing, not decorative:

- **Biometric hardware** — verifies *which specific human* approved a change with a confidence no password or web session can match. This is the structural reason the product has to exist on a phone.
- **Push notifications** — risk is delivered pre-reasoned, at the moment of interruption, without requiring the user to open an app or a laptop.
- **On-device inference** — the fast secret/pattern scan runs locally for speed and privacy, no network round-trip needed for the common case.

If you removed the phone, you'd lose the one thing that makes the attestation record trustworthy: physical, biometric proof of who approved it.

---

## 5. MVP Scope (What We're Actually Building in 12 Days)

Scoped deliberately to what's honestly buildable and defensible — not the full long-term vision.

**In scope:**
- GitHub PR integration (one test repo, PAT-based, no OAuth flow needed for demo)
- On-device secret detection — regex + entropy-based scanning for API keys, tokens, credentials (no ML model required; this alone is a real, honest, demo-able detection feature)
- Risk card UI showing the finding in plain language
- Cloud LLM call (Claude/OpenAI) to generate a plain-English risk explanation
- Biometric-gated approval via Android's `BiometricPrompt` — only triggered on genuine high-confidence findings, never on clean PRs
- Local attestation log (Room/SQLite) — diff hash, risk score, timestamp, approver, biometric confirmation flag

**Explicitly out of scope for the hackathon build (named honestly in the deck as roadmap, not claimed as working):**
- SQL injection / command injection detection — this requires whole-repository taint analysis a diff-scoped mobile tool cannot honestly provide; claiming it invites exactly the kind of technical pushback that damages credibility with a knowledgeable judge
- Clipboard monitoring — Android has restricted background clipboard access since Android 10, and it reads as spyware-adjacent in review; not worth building or claiming
- Camera scan mode, offline TFLite classifier, multi-repo/org support — real ideas, correctly deferred to post-hackathon roadmap

This scope discipline is itself a selling point: naming what you're *not* claiming shows technical maturity most competing pitches won't demonstrate.

---

## 6. Technical Architecture

```
GitHub PR opened
      │
      ▼
GitHub REST API (fetch diff) ──── Kotlin/Retrofit or Ktor client
      │
      ▼
On-device scan (regex + entropy) ──── runs locally, no ML model, milliseconds
      │
      ├── Clean ─────────────────► One-tap approve
      │
      └── Flagged ──► Cloud LLM call (risk explanation, plain English)
                              │
                              ▼
                    Risk card shown to user
                              │
                              ▼
                  BiometricPrompt (Face/Fingerprint)
                              │
                              ▼
                  Attestation record written (Room/SQLite):
                  diff hash, risk score, timestamp,
                  approver, biometric confirmation, evidence
                              │
                              ▼
                  Approval history / audit log screen
```

**Stack:** Kotlin + Jetpack Compose (UI), GitHub REST API (PR data), local regex/entropy detection (no on-device ML needed for MVP), one cloud LLM API call (risk explanation only, not detection), Android `BiometricPrompt` (approval gate), Room/SQLite (attestation log).

This stack is deliberately matched to the team's actual proficiency (Basic Android, LLM-API experience) rather than the more ambitious on-device-ML architecture described in earlier planning — that version is the Year 1 roadmap, not the hackathon build.

---

## 7. Why This Is Hard to Copy

- **Detection alone is not the moat** — a well-resourced competitor (GitHub, Snyk) could ship comparable scanning quickly. This is conceded openly, not argued around.
- **The attestation ledger is the real asset.** Once it holds months of real organizational approval history, it becomes something a security or compliance team references in real audits and incident postmortems — a genuine, compounding switching cost no scanner-only competitor produces.
- **Biometric-verified approval is a structural, not cosmetic, differentiator** — it's an evidentiary quality (verified physical human identity at the moment of decision) that a desktop-bound tool cannot replicate without becoming a phone app itself.
- **Longer-term (post-hackathon):** agent-provenance data — tracking which coding agent (Claude Code, Copilot, Cursor, etc.) tends to produce which risk patterns, aggregated across orgs — is a genuinely proprietary data asset no single agent vendor has an incentive to publish honestly about itself.

---

## 8. Competitive Landscape

| Competitor | Strength | Gap Tripwire fills |
|---|---|---|
| GitHub Advanced Security | Owns the platform and PR data | No mobile-native, biometric-gated approval-moment product |
| Snyk, Semgrep | Deep dependency/pattern scanning | CI/desktop-first; no mobile approval checkpoint |
| CodeQL, SonarQube | Deep whole-repo static analysis | Exactly what Tripwire should *not* try to replicate — different job, complementary not competitive |
| Cursor, Copilot, Claude Code, Windsurf | Own code generation | Potential integration partners — Tripwire sits downstream of all of them via agent-provenance tagging |

Tripwire doesn't need to beat any of these at their own job. It occupies a moment none of them are built around.

---

## 9. Business Model (Long-Term, Post-Hackathon)

- **Free tier:** individual developers, open-source maintainers — adoption and credibility engine, not revenue.
- **Team tier (~$15–25/seat/month):** Seed–Series B startups actively adopting agentic coding — the realistic near-term paid segment.
- **Enterprise tier:** sold to security/compliance buyers on the attestation and policy-engine value, not raw detection — requires a real (if small) enterprise sales motion, not pure self-serve.

---

## 10. Risks & Honest Mitigations

| Risk | Mitigation |
|---|---|
| Overclaiming detection capability | Scope strictly to secrets/known-pattern detection; never claim SQLi/injection detection from a diff |
| False positives erode trust in the biometric gate | Only gate genuinely high-confidence findings (secrets), never gate on ambiguous signals |
| Incumbents could copy the scanner | Differentiate on the attestation ledger and biometric-verified approval, not detection breadth |
| Android platform restrictions | Drop clipboard monitoring; stay within supported, non-flagged permission use |

---

## 11. Demo Plan (60–90 Second Video Walkthrough)

1. **Hook (0:00–0:10):** "Developers approve AI-generated code from their phones now. Nothing checks that moment." Show the pending PR list.
2. **Detection (0:10–0:30):** Open the flagged PR — risk card shows the planted secret and a plain-English explanation.
3. **Biometric approval (0:30–0:50):** Tap Approve → Face/Fingerprint confirms → approval goes through. Strongest visual beat, keep it smooth.
4. **Attestation (0:50–1:10):** Show the audit log — the record just created, evidence attached.
5. **Close (1:10–1:20):** "This isn't just a scanner — it's the audit trail for AI-approved code."

---

## 12. Submission Positioning

**Idea Title:** *Tripwire — The Audit Trail for AI-Approved Code*

**Description (lead with the reframe, not the feature list):**
> Developers now approve AI-generated code from their phones — one tap, half-attention, on a commute. No security tool checks that exact moment. Tripwire is a phone-first checkpoint that scans for high-confidence risks on-device, requires biometric confirmation before approving anything flagged, and creates a tamper-evident record of who approved what, under what evidence. We're not building a better scanner — we're building the trust and accountability layer for the moment most AI-generated code actually gets approved.

**What makes you stand out:** name the scope discipline explicitly — most teams pitching mobile AI security will overclaim detection breadth (SQL injection, "hallucination detection"); Tripwire's differentiator is knowing exactly what a phone-scoped tool can and can't honestly verify, and building the one thing — biometric-verified attestation — that only a phone can produce.

---

## 13. Summary

Tripwire's winning idea is not "AI that finds bugs on your phone." It's **"the phone is the only device that can prove who really approved this AI-generated change, and that proof is the product."** Everything in the 12-day build — the on-device scan, the risk card, the biometric gate, the attestation log — exists to make that one claim demonstrably true on stage.
