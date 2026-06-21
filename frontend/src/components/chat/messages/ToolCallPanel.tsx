import type { ToolCall, ToolCallStatus } from "../../../utils/types/chat";

interface ToolCallPanelProps {
  toolCall: ToolCall;
  onStatusChange: (status: ToolCallStatus) => void;
}

export default function ToolCallPanel({
  toolCall,
  onStatusChange,
}: ToolCallPanelProps) {
  const resolved = toolCall.status !== "pending";

  return (
    <div
      className={[
        "chat-tool-call",
        resolved ? `chat-tool-call--${toolCall.status}` : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="chat-tool-call__header">
        <span className="chat-tool-call__label">Tool call</span>
        <code className="chat-tool-call__name">{toolCall.name}</code>
      </div>
      <p className="chat-tool-call__description">{toolCall.description}</p>
      {resolved ? (
        <p className="chat-tool-call__status">
          {toolCall.status === "accepted" && "Accepted"}
          {toolCall.status === "denied" && "Denied"}
          {toolCall.status === "allowlisted" && "Added to allowlist"}
        </p>
      ) : (
        <div className="chat-tool-call__actions">
          <button
            type="button"
            className="chat-tool-call__action chat-tool-call__action--accept"
            onClick={() => onStatusChange("accepted")}
          >
            Accept
          </button>
          <button
            type="button"
            className="chat-tool-call__action chat-tool-call__action--deny"
            onClick={() => onStatusChange("denied")}
          >
            Deny
          </button>
          <button
            type="button"
            className="chat-tool-call__action chat-tool-call__action--allowlist"
            onClick={() => onStatusChange("allowlisted")}
          >
            Allowlist
          </button>
        </div>
      )}
    </div>
  );
}
