export type Channel = "whatsapp" | "sms" | "email" | "rcs";
export type CampaignStatus = "active" | "completed" | "draft" | "paused";
export type SegmentType = "vip" | "at-risk" | "new" | "loyal" | "lapsed";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpend: number;
  lastOrder: string;
  segment: SegmentType;
  preferredChannel: Channel;
  joinDate: string;
  rfm: { r: number; f: number; m: number };
}

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  segment: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  status: CampaignStatus;
  date: string;
}

export interface Segment {
  id: string;
  name: string;
  type: SegmentType;
  description: string;
  count: number;
  avgSpend: number;
  openRate: number;
}

export const customers: Customer[] = [
  { id: "c1", name: "Ananya Sharma", email: "ananya.s@gmail.com", phone: "98765 43210", city: "Mumbai", totalOrders: 24, totalSpend: 87400, lastOrder: "2025-05-28", segment: "vip", preferredChannel: "whatsapp", joinDate: "2023-02-14", rfm: { r: 5, f: 5, m: 5 } },
  { id: "c2", name: "Rohan Gupta", email: "rohan.g@outlook.com", phone: "98123 45678", city: "Delhi", totalOrders: 12, totalSpend: 42300, lastOrder: "2025-04-10", segment: "loyal", preferredChannel: "email", joinDate: "2023-06-22", rfm: { r: 4, f: 4, m: 4 } },
  { id: "c3", name: "Kavya Reddy", email: "kavya.r@gmail.com", phone: "99887 12345", city: "Hyderabad", totalOrders: 8, totalSpend: 23100, lastOrder: "2025-03-02", segment: "at-risk", preferredChannel: "whatsapp", joinDate: "2024-01-08", rfm: { r: 2, f: 3, m: 3 } },
  { id: "c4", name: "Arjun Patel", email: "arjun.p@yahoo.com", phone: "97654 32109", city: "Ahmedabad", totalOrders: 3, totalSpend: 6800, lastOrder: "2025-05-30", segment: "new", preferredChannel: "sms", joinDate: "2025-04-19", rfm: { r: 5, f: 2, m: 2 } },
  { id: "c5", name: "Priya Iyer", email: "priya.i@gmail.com", phone: "98789 65432", city: "Bengaluru", totalOrders: 31, totalSpend: 124500, lastOrder: "2025-06-01", segment: "vip", preferredChannel: "whatsapp", joinDate: "2022-11-03", rfm: { r: 5, f: 5, m: 5 } },
  { id: "c6", name: "Vikram Singh", email: "vikram.s@gmail.com", phone: "98321 67890", city: "Chandigarh", totalOrders: 5, totalSpend: 14200, lastOrder: "2024-12-15", segment: "lapsed", preferredChannel: "email", joinDate: "2023-09-11", rfm: { r: 1, f: 2, m: 3 } },
  { id: "c7", name: "Meera Nair", email: "meera.n@outlook.com", phone: "97890 12345", city: "Kochi", totalOrders: 17, totalSpend: 56700, lastOrder: "2025-05-18", segment: "loyal", preferredChannel: "whatsapp", joinDate: "2023-04-30", rfm: { r: 4, f: 4, m: 4 } },
  { id: "c8", name: "Aditya Kumar", email: "aditya.k@gmail.com", phone: "98456 78901", city: "Pune", totalOrders: 9, totalSpend: 31200, lastOrder: "2025-02-22", segment: "at-risk", preferredChannel: "rcs", joinDate: "2024-02-17", rfm: { r: 2, f: 3, m: 3 } },
  { id: "c9", name: "Nisha Verma", email: "nisha.v@gmail.com", phone: "99012 34567", city: "Jaipur", totalOrders: 22, totalSpend: 78900, lastOrder: "2025-06-05", segment: "vip", preferredChannel: "whatsapp", joinDate: "2023-01-25", rfm: { r: 5, f: 5, m: 5 } },
  { id: "c10", name: "Karan Mehta", email: "karan.m@yahoo.com", phone: "98234 56789", city: "Mumbai", totalOrders: 2, totalSpend: 4500, lastOrder: "2025-05-25", segment: "new", preferredChannel: "sms", joinDate: "2025-05-10", rfm: { r: 5, f: 1, m: 1 } },
  { id: "c11", name: "Ishaan Joshi", email: "ishaan.j@gmail.com", phone: "97123 89012", city: "Bengaluru", totalOrders: 14, totalSpend: 48300, lastOrder: "2025-05-12", segment: "loyal", preferredChannel: "email", joinDate: "2023-08-14", rfm: { r: 4, f: 4, m: 4 } },
  { id: "c12", name: "Riya Kapoor", email: "riya.k@outlook.com", phone: "98901 23456", city: "Delhi", totalOrders: 6, totalSpend: 18700, lastOrder: "2024-11-30", segment: "lapsed", preferredChannel: "whatsapp", joinDate: "2023-12-04", rfm: { r: 1, f: 2, m: 3 } },
  { id: "c13", name: "Siddharth Rao", email: "sid.rao@gmail.com", phone: "97345 67890", city: "Chennai", totalOrders: 19, totalSpend: 67800, lastOrder: "2025-05-29", segment: "vip", preferredChannel: "whatsapp", joinDate: "2023-03-09", rfm: { r: 5, f: 4, m: 5 } },
  { id: "c14", name: "Tanvi Desai", email: "tanvi.d@gmail.com", phone: "98678 90123", city: "Surat", totalOrders: 4, totalSpend: 11400, lastOrder: "2025-06-02", segment: "new", preferredChannel: "sms", joinDate: "2025-03-21", rfm: { r: 5, f: 2, m: 2 } },
  { id: "c15", name: "Aarav Bhatt", email: "aarav.b@yahoo.com", phone: "99234 56789", city: "Mumbai", totalOrders: 11, totalSpend: 38900, lastOrder: "2025-04-28", segment: "loyal", preferredChannel: "email", joinDate: "2023-07-18", rfm: { r: 4, f: 4, m: 4 } },
  { id: "c16", name: "Sneha Pillai", email: "sneha.p@gmail.com", phone: "98567 12340", city: "Hyderabad", totalOrders: 7, totalSpend: 22300, lastOrder: "2025-01-15", segment: "at-risk", preferredChannel: "whatsapp", joinDate: "2024-03-02", rfm: { r: 2, f: 3, m: 3 } },
  { id: "c17", name: "Devansh Shah", email: "devansh.s@gmail.com", phone: "97456 78901", city: "Ahmedabad", totalOrders: 13, totalSpend: 44100, lastOrder: "2025-05-20", segment: "loyal", preferredChannel: "whatsapp", joinDate: "2023-05-27", rfm: { r: 4, f: 4, m: 4 } },
  { id: "c18", name: "Pooja Malhotra", email: "pooja.m@outlook.com", phone: "98890 12345", city: "Delhi", totalOrders: 28, totalSpend: 98200, lastOrder: "2025-06-04", segment: "vip", preferredChannel: "email", joinDate: "2022-12-11", rfm: { r: 5, f: 5, m: 5 } },
  { id: "c19", name: "Manish Choudhary", email: "manish.c@gmail.com", phone: "97890 56234", city: "Lucknow", totalOrders: 3, totalSpend: 7800, lastOrder: "2024-10-22", segment: "lapsed", preferredChannel: "sms", joinDate: "2024-04-15", rfm: { r: 1, f: 2, m: 2 } },
  { id: "c20", name: "Aisha Khan", email: "aisha.k@gmail.com", phone: "98012 34567", city: "Bengaluru", totalOrders: 16, totalSpend: 52600, lastOrder: "2025-05-31", segment: "loyal", preferredChannel: "whatsapp", joinDate: "2023-10-08", rfm: { r: 5, f: 4, m: 4 } },
];

export const campaigns: Campaign[] = [
  { id: "cam1", name: "Diwali Sale Blast", channel: "whatsapp", segment: "All Customers", sent: 42180, delivered: 41320, opened: 18900, clicked: 6420, converted: 1840, revenue: 1284000, status: "completed", date: "2025-05-28" },
  { id: "cam2", name: "Churned Win-back", channel: "email", segment: "Lapsed Buyers", sent: 8400, delivered: 8190, opened: 2456, clicked: 712, converted: 184, revenue: 246000, status: "active", date: "2025-06-02" },
  { id: "cam3", name: "New Collection Drop", channel: "whatsapp", segment: "VIP Loyalists", sent: 3200, delivered: 3180, opened: 2240, clicked: 980, converted: 410, revenue: 892000, status: "completed", date: "2025-05-22" },
  { id: "cam4", name: "VIP Exclusive Preview", channel: "email", segment: "VIP Loyalists", sent: 2840, delivered: 2820, opened: 1980, clicked: 720, converted: 320, revenue: 1120000, status: "active", date: "2025-06-04" },
  { id: "cam5", name: "Flash Sale Alert", channel: "sms", segment: "All Customers", sent: 38900, delivered: 38420, opened: 12300, clicked: 3120, converted: 680, revenue: 412000, status: "completed", date: "2025-05-15" },
  { id: "cam6", name: "Monsoon Skincare", channel: "rcs", segment: "Beauty Buyers", sent: 6200, delivered: 6080, opened: 2840, clicked: 1240, converted: 380, revenue: 318000, status: "active", date: "2025-06-01" },
  { id: "cam7", name: "Birthday Special", channel: "whatsapp", segment: "Birthday This Week", sent: 480, delivered: 478, opened: 410, clicked: 220, converted: 98, revenue: 142000, status: "active", date: "2025-06-05" },
  { id: "cam8", name: "Cart Abandonment", channel: "whatsapp", segment: "Abandoned Cart", sent: 1240, delivered: 1230, opened: 890, clicked: 340, converted: 124, revenue: 186000, status: "active", date: "2025-06-03" },
  { id: "cam9", name: "Summer Closeout", channel: "email", segment: "New Subscribers", sent: 12400, delivered: 12180, opened: 3640, clicked: 920, converted: 210, revenue: 168000, status: "draft", date: "2025-06-07" },
  { id: "cam10", name: "Loyalty Tier Upgrade", channel: "email", segment: "Loyal Buyers", sent: 4200, delivered: 4180, opened: 2890, clicked: 1240, converted: 520, revenue: 624000, status: "completed", date: "2025-05-10" },
];

export const segments: Segment[] = [
  { id: "s1", name: "VIP Loyalists", type: "vip", description: "Top 5% by lifetime spend", count: 2840, avgSpend: 84200, openRate: 68 },
  { id: "s2", name: "Lapsed Buyers", type: "lapsed", description: "No purchase in 90+ days", count: 8410, avgSpend: 12400, openRate: 22 },
  { id: "s3", name: "New Subscribers", type: "new", description: "Joined in last 30 days", count: 4120, avgSpend: 3200, openRate: 41 },
  { id: "s4", name: "Loyal Buyers", type: "loyal", description: "5+ orders, active", count: 12400, avgSpend: 38400, openRate: 52 },
  { id: "s5", name: "At-Risk Customers", type: "at-risk", description: "Engagement declining", count: 6280, avgSpend: 24100, openRate: 31 },
  { id: "s6", name: "Beauty Buyers", type: "loyal", description: "Purchased beauty 3+ times", count: 3940, avgSpend: 18600, openRate: 47 },
  { id: "s7", name: "Birthday This Week", type: "vip", description: "Auto-rotating segment", count: 484, avgSpend: 41200, openRate: 72 },
];

const dayLabel = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export const engagement14d = Array.from({ length: 14 }, (_, i) => {
  const idx = 13 - i;
  return {
    day: dayLabel(idx),
    delivered: 8200 + Math.round(Math.sin(i * 0.6) * 1400 + i * 120),
    opened: 2400 + Math.round(Math.cos(i * 0.4) * 600 + i * 80),
    clicked: 720 + Math.round(Math.sin(i * 0.7) * 180 + i * 22),
  };
});

export const engagement30d = Array.from({ length: 30 }, (_, i) => {
  const idx = 29 - i;
  return {
    day: dayLabel(idx),
    delivered: 7800 + Math.round(Math.sin(i * 0.4) * 1800 + i * 60),
    opened: 2200 + Math.round(Math.cos(i * 0.3) * 700 + i * 40),
    clicked: 680 + Math.round(Math.sin(i * 0.5) * 220 + i * 14),
  };
});

export const engagement90d = Array.from({ length: 90 }, (_, i) => {
  const idx = 89 - i;
  return {
    day: dayLabel(idx),
    delivered: 7200 + Math.round(Math.sin(i * 0.2) * 2100 + i * 22),
    opened: 2000 + Math.round(Math.cos(i * 0.15) * 800 + i * 14),
    clicked: 620 + Math.round(Math.sin(i * 0.25) * 240 + i * 5),
  };
});

export const channelPerformance = [
  { name: "WhatsApp", value: 48, color: "#22C55E" },
  { name: "Email", value: 27, color: "#6366F1" },
  { name: "SMS", value: 17, color: "#3B82F6" },
  { name: "RCS", value: 8, color: "#A855F7" },
];

export const deliveryFunnel = [
  { stage: "Sent", value: 120240, pct: 100 },
  { stage: "Delivered", value: 117810, pct: 97.9 },
  { stage: "Opened", value: 48450, pct: 40.3 },
  { stage: "Clicked", value: 15920, pct: 13.2 },
  { stage: "Converted", value: 4780, pct: 4.0 },
];

export const topSegmentsPerformance = [
  { name: "VIP Loyalists", openRate: 68 },
  { name: "Birthday This Week", openRate: 72 },
  { name: "Loyal Buyers", openRate: 52 },
  { name: "Beauty Buyers", openRate: 47 },
  { name: "New Subscribers", openRate: 41 },
  { name: "At-Risk", openRate: 31 },
  { name: "Lapsed Buyers", openRate: 22 },
];

export const sparklineData = Array.from({ length: 12 }, (_, i) => ({
  v: 50 + Math.sin(i * 0.6) * 20 + i * 3,
}));

export const sparklineDataDown = Array.from({ length: 12 }, (_, i) => ({
  v: 80 - Math.sin(i * 0.5) * 12 - i * 2,
}));

// AI Copilot conversations
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  type?: "text" | "segment" | "campaign" | "chart";
  text: string;
  data?: any;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
  messages: AIMessage[];
}

export const conversations: Conversation[] = [
  {
    id: "conv1",
    title: "Win-back lapsed VIPs",
    updatedAt: "2025-06-06T10:24:00",
    preview: "Find customers who bought twice last quarter…",
    messages: [
      { id: "m1", role: "user", text: "Find customers who bought twice last quarter but haven't returned" },
      { id: "m2", role: "assistant", type: "segment", text: "I found a strong re-engagement segment for you:", data: { count: 2847, avgSpend: 3200, topCity: "Mumbai", filters: ["2+ orders last quarter", "No order in 45+ days", "Email subscribed"] } },
      { id: "m3", role: "user", text: "Draft a WhatsApp message for them" },
      { id: "m4", role: "assistant", type: "campaign", text: "Here's a draft optimized for win-back tone:", data: { channel: "whatsapp", body: "Hi {first_name}! 👋 We miss you at Maison Rouge. Here's 15% off your next order — just for you. Shop now: maison.in/u/{code}" } },
      { id: "m5", role: "user", text: "What channel works best for this segment?" },
      { id: "m6", role: "assistant", type: "chart", text: "WhatsApp wins by a wide margin for this segment — 42% open rate vs 18% for email.", data: [{ ch: "WhatsApp", rate: 42 }, { ch: "Email", rate: 18 }, { ch: "SMS", rate: 24 }, { ch: "RCS", rate: 31 }] },
    ],
  },
  { id: "conv2", title: "Diwali campaign ideas", updatedAt: "2025-06-05T18:11:00", preview: "Draft 3 variants targeting beauty buyers…", messages: [] },
  { id: "conv3", title: "ROI by segment this month", updatedAt: "2025-06-04T09:42:00", preview: "Which segment drove the most revenue per send?", messages: [] },
  { id: "conv4", title: "Churn risk for VIPs", updatedAt: "2025-06-02T14:08:00", preview: "Identify VIPs with declining engagement", messages: [] },
];

export const suggestedPrompts = [
  "Find churning VIP customers",
  "Draft a Diwali campaign for beauty buyers",
  "Which segment has the best ROI this month?",
  "Suggest best channel for re-engagement",
];
