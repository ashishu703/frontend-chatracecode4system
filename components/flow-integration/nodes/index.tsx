/* @jsxRuntime automatic */
import { TextNode } from "./text-node";
import { ImageNode } from "./image-node";
import { AudioNode } from "./audio-node";
import { VideoNode } from "./video-node";
import { DocumentNode } from "./document-node";
import { ButtonNode } from "./button-node";
import { ListNode } from "./list-node";
import { AssignAgentNode } from "./assign-agent-node";
import { DisableChatNode } from "./disable-chat-node";
import { ApiRequestNode } from "./api-request-node";
import { StartNode } from "./start-node";
import { MailNode } from "./mail-node";
import { StartFlowNode } from "./start-node";
import { ConditionNode } from "./condition-node";
import React from "react";

// Generic fallback node
function GenericNode({ data }: any) {
  return (
    <div style={{ padding: 12, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{data?.type || 'Node'}</div>
      <pre style={{ fontSize: 12, color: '#374151', whiteSpace: 'pre-wrap' }}>{JSON.stringify(data?.config, null, 2)}</pre>
    </div>
  );
}

export const nodeTypes = {
  startNode: StartNode,
  startFlowNode: StartFlowNode,
  simpleMessageNode: TextNode,
  imageMessageNode: ImageNode,
  audioMessageNode: AudioNode,
  videoMessageNode: VideoNode,
  documentMessageNode: DocumentNode,
  buttonMessageNode: ButtonNode,
  listMessageNode: ListNode,
  assignAgentNode: AssignAgentNode,
  disableChatTillNode: DisableChatNode,
  requestAPINode: ApiRequestNode,
  sendEmailNode: MailNode,
  conditionNode: ConditionNode,
  // fallback for all other types
  genericNode: GenericNode,
};
