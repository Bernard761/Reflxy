export type Template = {
  slug: string;
  title: string;
  scenario: "boss" | "partner" | "client";
  scenarioDescription: string;
  exampleMessage: string;
  misunderstandingRisk: string;
};

export const templates: Template[] = [
  {
    slug: "performance-feedback",
    title: "Performance Feedback That Stays Constructive",
    scenario: "boss",
    scenarioDescription:
      "Use this when you need to deliver feedback to a direct report without triggering defensiveness.",
    exampleMessage:
      "I want to share feedback on the last release. The core outcomes were strong, and I noticed a few areas where we can tighten communication. Can we review the timeline together tomorrow?",
    misunderstandingRisk:
      "Without a clear intent statement, the message can feel like a reprimand instead of coaching.",
  },
  {
    slug: "project-delay-update",
    title: "Project Delay Update to Leadership",
    scenario: "boss",
    scenarioDescription:
      "Send a delay update that shows ownership and a forward plan.",
    exampleMessage:
      "We are trending two days behind the original timeline due to vendor data delays. I have a revised plan ready and can walk through tradeoffs this afternoon.",
    misunderstandingRisk:
      "If the next step is not explicit, delays can sound like avoidance or uncertainty.",
  },
  {
    slug: "salary-follow-up",
    title: "Salary Follow-Up After a Review",
    scenario: "boss",
    scenarioDescription:
      "Follow up on compensation discussions while keeping the tone calm and direct.",
    exampleMessage:
      "Thanks again for the review conversation. I want to follow up on the compensation discussion and understand the timeline for next steps.",
    misunderstandingRisk:
      "Open-ended requests can feel like pressure if the timing is vague.",
  },
  {
    slug: "meeting-reschedule",
    title: "Reschedule a Meeting Without Friction",
    scenario: "client",
    scenarioDescription:
      "Reschedule with a client while showing respect for their time.",
    exampleMessage:
      "Would it work to move our call to Thursday at 2 PM? I want to ensure we have the right stakeholders present.",
    misunderstandingRisk:
      "If the reason is not stated, a reschedule can read as low priority.",
  },
  {
    slug: "missed-deadline",
    title: "Owning a Missed Deadline",
    scenario: "client",
    scenarioDescription:
      "Acknowledge a miss and present a clear recovery plan.",
    exampleMessage:
      "I missed the delivery we agreed on for today. I am finishing the final checks now and will send the update by 4 PM.",
    misunderstandingRisk:
      "Without a new time commitment, the message can feel incomplete.",
  },
  {
    slug: "scope-change-request",
    title: "Scope Change Request That Avoids Blame",
    scenario: "client",
    scenarioDescription:
      "Introduce a scope change while keeping the relationship steady.",
    exampleMessage:
      "Based on the new requirements, the scope has expanded beyond the original plan. I can share a revised estimate and options for phasing.",
    misunderstandingRisk:
      "If the impact is vague, the reader may assume the worst about cost or timelines.",
  },
  {
    slug: "client-onboarding",
    title: "Client Onboarding Checklist Email",
    scenario: "client",
    scenarioDescription:
      "Set expectations for onboarding without overwhelming the reader.",
    exampleMessage:
      "To get started, we need access to the analytics account and the brand guidelines. Once those are in, we will schedule the kickoff.",
    misunderstandingRisk:
      "Too many requests at once can feel demanding without a clear sequence.",
  },
  {
    slug: "partnership-check-in",
    title: "Partnership Check-In Message",
    scenario: "partner",
    scenarioDescription:
      "Check in on a partnership or relationship with warmth and clarity.",
    exampleMessage:
      "I wanted to check in on how we are feeling about the collaboration. I value our partnership and want to make sure we are aligned.",
    misunderstandingRisk:
      "If the intent is not stated, check-ins can feel like a hidden concern.",
  },
  {
    slug: "apology-for-delay",
    title: "Apology for a Delayed Response",
    scenario: "partner",
    scenarioDescription:
      "Acknowledge a delay without sounding rushed or dismissive.",
    exampleMessage:
      "I am sorry for the slow reply. I read your note and want to respond thoughtfully. Can we talk tomorrow afternoon?",
    misunderstandingRisk:
      "A short apology without a next step can feel like a brush-off.",
  },
  {
    slug: "difficult-no",
    title: "Saying No Without Damaging Trust",
    scenario: "boss",
    scenarioDescription:
      "Decline a request while showing alignment and support.",
    exampleMessage:
      "I cannot take this on this week because of the launch work. I can help next week or suggest someone who has capacity now.",
    misunderstandingRisk:
      "A flat no can sound final if you do not offer a path forward.",
  },
  {
    slug: "policy-clarification",
    title: "Policy Clarification Email",
    scenario: "boss",
    scenarioDescription:
      "Clarify a policy without sounding punitive.",
    exampleMessage:
      "Quick clarification on travel approvals: please send requests at least five days in advance so finance can review them.",
    misunderstandingRisk:
      "If the reason is missing, the message can feel like a reprimand.",
  },
  {
    slug: "feedback-request",
    title: "Requesting Feedback From a Client",
    scenario: "client",
    scenarioDescription:
      "Ask for feedback while making it easy to respond.",
    exampleMessage:
      "Could you share quick feedback on the draft by Friday? A few bullet points are enough, and we can adjust right away.",
    misunderstandingRisk:
      "Without a low-friction option, the ask can feel like extra work.",
  },
  {
    slug: "team-standup-update",
    title: "Standup Update That Flags Risk",
    scenario: "boss",
    scenarioDescription:
      "Communicate risk early without alarming the team.",
    exampleMessage:
      "Progress is steady on the migration. The only risk is vendor access; I am working on a backup plan in case approvals slip.",
    misunderstandingRisk:
      "Risk updates can sound like blockers if the mitigation is not stated.",
  },
  {
    slug: "billing-issue",
    title: "Billing Issue Message to a Client",
    scenario: "client",
    scenarioDescription:
      "Address a billing issue without blame.",
    exampleMessage:
      "We noticed an invoice discrepancy and want to resolve it quickly. Can you confirm the billing contact so we can align on the details?",
    misunderstandingRisk:
      "Billing notes can feel accusatory if the tone is not neutral.",
  },
  {
    slug: "contract-follow-up",
    title: "Contract Follow-Up Email",
    scenario: "client",
    scenarioDescription:
      "Follow up on a contract with clarity and patience.",
    exampleMessage:
      "Just checking in on the contract review. Let me know if you have questions or if a walkthrough would help.",
    misunderstandingRisk:
      "A follow-up without an offer to help can feel like pressure.",
  },
  {
    slug: "feature-sunset",
    title: "Feature Sunset Announcement",
    scenario: "client",
    scenarioDescription:
      "Announce a feature sunset while showing support.",
    exampleMessage:
      "We are retiring the legacy reporting view on May 15. Here is the migration guide and support options if you need help.",
    misunderstandingRisk:
      "If alternatives are not clear, the message can create anxiety.",
  },
  {
    slug: "priority-shift",
    title: "Communicating a Priority Shift",
    scenario: "boss",
    scenarioDescription:
      "Explain a shift in priorities with rationale.",
    exampleMessage:
      "We are shifting focus to onboarding improvements this sprint to reduce churn. This means pausing the dashboard refresh until next month.",
    misunderstandingRisk:
      "Without the why, the change can feel arbitrary or reactive.",
  },
  {
    slug: "support-escalation",
    title: "Support Escalation Note",
    scenario: "client",
    scenarioDescription:
      "Escalate an issue while keeping the tone calm and respectful.",
    exampleMessage:
      "I am escalating this to our support lead so it moves faster. We will update you by end of day with the next step.",
    misunderstandingRisk:
      "Escalation can sound like blame if ownership is unclear.",
  },
  {
    slug: "relationship-repair",
    title: "Repairing a Strained Relationship",
    scenario: "partner",
    scenarioDescription:
      "Reconnect after tension with warmth and clarity.",
    exampleMessage:
      "I know the last conversation felt tense. I care about how we work together and would like to reset. Can we talk this week?",
    misunderstandingRisk:
      "If the ask is vague, the reader may avoid the conversation.",
  },
  {
    slug: "handoff-note",
    title: "Project Handoff Note",
    scenario: "client",
    scenarioDescription:
      "Introduce a handoff without losing continuity.",
    exampleMessage:
      "I am handing the project to Alex, who is fully briefed on the scope. I will stay involved through the end of the month to ensure continuity.",
    misunderstandingRisk:
      "Hand-offs can feel like a loss of support if you do not signal continuity.",
  },
];

export const getTemplateBySlug = (slug: string) =>
  templates.find((template) => template.slug === slug);
