import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  messages: UIMessage[];
};

function textMessage(
  id: string,
  role: UIMessage["role"],
  text: string,
): UIMessage {
  return {
    id,
    role,
    parts: [{ type: "text", text }],
  };
}

export const initialThreads: ChatThread[] = [
  {
    id: "thread-1",
    title: "Weekend trip ideas",
    messages: [
      textMessage(
        "m1",
        "user",
        "I have a free weekend in Portland. Any ideas?",
      ),
      textMessage(
        "m2",
        "assistant",
        "Portland is great for a low-key weekend. You could do a morning at Powell's, lunch on Alberta Street, then hike Forest Park in the afternoon.",
      ),
      textMessage("m3", "user", "Something more relaxed — maybe food-focused?"),
      textMessage(
        "m4",
        "assistant",
        "Try a food crawl through the Central Eastside: start with coffee at Coava, grab pastries nearby, then dinner at a spot with a tasting menu. End with dessert in the Pearl District.",
      ),
      {
        id: "m5",
        role: "assistant",
        parts: [
          { type: "text", text: "It's big brain time." },
          {
            type: "reasoning",
            text: "I'm thinking about the user's request and I'm coming up with a plan.",
          },
        ],
      },
    ],
  },
  {
    id: "thread-2",
    title: "Markdown rendering demo",
    messages: [
      textMessage("m5", "user", "Show me how code blocks look in chat."),
      textMessage(
        "m6",
        "assistant",
        `Here's a small TypeScript example:

\`\`\`ts
export function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

And a quick list:

- **Bold** emphasis
- \`inline code\`
- [Links](https://example.com) work too`,
      ),
    ],
  },
  {
    id: "thread-3",
    title: "Recipe brainstorm",
    messages: [
      textMessage(
        "m7",
        "user",
        "I have chicken thighs, rice, and broccoli. What can I make?",
      ),
      textMessage(
        "m8",
        "assistant",
        "Sheet-pan chicken and rice is an easy win: season the thighs, nestle them into partially cooked rice with broth, roast with broccoli florets for the last 15 minutes. Finish with lemon and chili flakes.",
      ),
      textMessage("m9", "user", "Can I make it in one pan?"),
      textMessage(
        "m10",
        "assistant",
        "Yes — use a large oven-safe skillet. Sear the chicken, stir in rice and broth, cover and bake until the rice is tender, then add broccoli on top uncovered to finish.",
      ),
    ],
  },
];
