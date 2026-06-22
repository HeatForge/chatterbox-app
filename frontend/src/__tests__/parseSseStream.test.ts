import { describe, expect, it } from "vitest";
import { parseSseStream } from "../utils/parseSseStream";

async function collectEvents(body: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });

  const events = [];
  for await (const event of parseSseStream(stream)) {
    events.push(event);
  }
  return events;
}

describe("parseSseStream", () => {
  it("parses named SSE events with JSON payloads", async () => {
    const events = await collectEvents(
      'event: text-delta\ndata: {"delta":"Hello"}\n\n' +
        'event: done\ndata: {"assistantMessageId":"1"}\n\n',
    );

    expect(events).toEqual([
      { event: "text-delta", data: '{"delta":"Hello"}' },
      { event: "done", data: '{"assistantMessageId":"1"}' },
    ]);
  });

  it("joins multi-line data fields", async () => {
    const events = await collectEvents("event: message\ndata: line-one\ndata: line-two\n\n");

    expect(events).toEqual([{ event: "message", data: "line-one\nline-two" }]);
  });
});
