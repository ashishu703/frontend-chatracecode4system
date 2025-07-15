import { StartNode } from "./start-node"
import { TextNode } from "./text-node"
import { ImageNode } from "./image-node"
import { AudioNode } from "./audio-node"
import { VideoNode } from "./video-node"
import { DocumentNode } from "./document-node"
import { ButtonNode } from "./button-node"
import { ListNode } from "./list-node"
import { AssignAgentNode } from "./assign-agent-node"
import { DisableChatNode } from "./disable-chat-node"
import { ApiRequestNode } from "./api-request-node"

export const nodeTypes = {
  startNode: StartNode,
  textNode: TextNode,
  imageNode: ImageNode,
  audioNode: AudioNode,
  videoNode: VideoNode,
  documentNode: DocumentNode,
  buttonNode: ButtonNode,
  listNode: ListNode,
  assignAgentNode: AssignAgentNode,
  disableChatNode: DisableChatNode,
  apiRequestNode: ApiRequestNode,
}
