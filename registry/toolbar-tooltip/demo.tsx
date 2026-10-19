import { Eye, Inbox, Menu, MessageCircle, Share, ToggleRight } from "lucide-react"
import { ToolbarTooltip } from "./toolbar-tooltip"

const items = [
  { label: "Comment", icon: <MessageCircle />, shortcut: ["C"] },
  { label: "Inbox", icon: <Inbox />, shortcut: ["I"] },
  { label: "Draft mode", icon: <ToggleRight /> },
  { label: "Preview", icon: <Eye />, shortcut: ["P"] },
  { label: "Share", icon: <Share /> },
  { label: "Menu", icon: <Menu />, shortcut: ["⌘", "K"] },
]

export default function Demo() {
  return (
    <div className="grid flex-1 place-items-center p-6">
      <ToolbarTooltip items={items} delay={150} className="scale-[1.6]" />
    </div>
  )
}
