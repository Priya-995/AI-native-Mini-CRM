import { MessageCircle, Mail, Smartphone, Radio } from "lucide-react";
import type { Channel } from "@/data/mockData";
import { cn } from "@/lib/utils";

const config: Record<Channel, { icon: typeof Mail; label: string; bg: string; text: string }> = {
  whatsapp: { icon: MessageCircle, label: "WhatsApp", bg: "bg-[#22C55E]/15", text: "text-[#22C55E]" },
  email: { icon: Mail, label: "Email", bg: "bg-primary/15", text: "text-primary" },
  sms: { icon: Smartphone, label: "SMS", bg: "bg-[#3B82F6]/15", text: "text-[#3B82F6]" },
  rcs: { icon: Radio, label: "RCS", bg: "bg-[#A855F7]/15", text: "text-[#A855F7]" },
};

export function ChannelBadge({ channel, showLabel = true, className }: { channel: Channel; showLabel?: boolean; className?: string }) {
  const c = config[channel];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium", c.bg, c.text, className)}>
      <Icon className="h-3.5 w-3.5" />
      {showLabel && c.label}
    </span>
  );
}

export function ChannelIcon({ channel, className }: { channel: Channel; className?: string }) {
  const c = config[channel];
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md", c.bg, c.text, className)}>
      <Icon className="h-4 w-4" />
    </span>
  );
}
