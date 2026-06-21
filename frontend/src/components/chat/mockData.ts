import type { ChatMessage, Project } from "../../utils/types/chat";

export const MOCK_PROJECTS: Project[] = [
  { id: "jericho", name: "Project Jericho" },
  { id: "amanda", name: "Project Amanda" },
  {
    id: "heidelberg",
    name: "Project Heidelberg",
    threads: [
      {
        id: "heidelberg-1",
        title: "Chat thread title of a summary",
        children: [
          {
            id: "heidelberg-1-1",
            title: "Chat thread title of a summary",
          },
        ],
      },
      {
        id: "heidelberg-2",
        title: "Chat thread title of a summary",
      },
    ],
  },
];

export const MOCK_CHAT_THREADS = Array.from({ length: 14 }, (_, i) => ({
  id: `chat-${i + 1}`,
  title: "Title of a singular chat thread",
}));

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    variants: [
      {
        content:
          "Can you summarize the key risks for Project Heidelberg based on last week's notes?",
      },
    ],
    activeVariantIndex: 0,
  },
  {
    id: "msg-2",
    role: "assistant",
    variants: [
      {
        content:
          "Based on the notes, the main risks are timeline slippage on the vendor integration, unclear ownership for the compliance review, and a dependency on external API access that hasn't been approved yet.",
      },
      {
        content:
          "Project Heidelberg faces three primary risks: delayed vendor integration (est. 2-week slip), an unassigned compliance review owner, and pending external API credentials that block the staging environment.",
      },
      {
        content:
          "The Heidelberg project is exposed on integration timing, compliance staffing, and third-party API gating — any one of these could push the milestone past end of quarter.",
      },
    ],
    activeVariantIndex: 0,
    thinking: "Reviewing project notes and cross-referencing risk categories… Tall string",
    toolCall: {
      name: "search_project_notes",
      description:
        'Search notes for "Project Heidelberg" and return summaries tagged as risk or blocker.',
      status: "pending",
    },
  },
  {
    id: "msg-3",
    role: "user",
    variants: [
      {
        content: "Thanks — draft a short status update I can paste into Slack.",
      },
    ],
    activeVariantIndex: 0,
  },
  {
    id: "msg-4",
    role: "assistant",
    variants: [
      {
        content:
          "Heidelberg update: integration on track but vendor handoff may slip ~2 weeks; compliance review needs an owner; waiting on external API access for staging. Flagging all three in this week's sync.",
      },
    ],
    activeVariantIndex: 0,
    thinking: "Condensing risks into a concise Slack-friendly format…",
  },
];
