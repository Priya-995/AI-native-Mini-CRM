import Groq from "groq-sdk";
import { campaigns, customers, segments } from "@/data/mockData";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Helper functions with safe guards
function getLatestCampaigns(count = 2) {
  console.log("[Helper] getLatestCampaigns called with count:", count);
  try {
    const result = [...campaigns]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
    console.log("[Helper] getLatestCampaigns result:", result);
    return result;
  } catch (e) {
    console.error("[Helper] getLatestCampaigns error:", e);
    return [];
  }
}

function getBestCampaign() {
  console.log("[Helper] getBestCampaign called");
  if (campaigns.length === 0) return null;
  
  try {
    const result = campaigns.reduce((best, current) => {
      const bestRate = best.sent > 0 ? best.converted / best.sent : 0;
      const currentRate = current.sent > 0 ? current.converted / current.sent : 0;
      return currentRate > bestRate ? current : best;
    });
    console.log("[Helper] getBestCampaign result:", result);
    return result;
  } catch (e) {
    console.error("[Helper] getBestCampaign error:", e);
    return null;
  }
}

function getTopSegmentByAvgSpend() {
  console.log("[Helper] getTopSegmentByAvgSpend called");
  if (segments.length === 0) return null;
  
  try {
    const result = segments.reduce((top, current) => {
      return current.avgSpend > top.avgSpend ? current : top;
    });
    console.log("[Helper] getTopSegmentByAvgSpend result:", result);
    return result;
  } catch (e) {
    console.error("[Helper] getTopSegmentByAvgSpend error:", e);
    return null;
  }
}

function getTopSegmentByOpenRate() {
  console.log("[Helper] getTopSegmentByOpenRate called");
  if (segments.length === 0) return null;
  
  try {
    const result = segments.reduce((top, current) => {
      return current.openRate > top.openRate ? current : top;
    });
    console.log("[Helper] getTopSegmentByOpenRate result:", result);
    return result;
  } catch (e) {
    console.error("[Helper] getTopSegmentByOpenRate error:", e);
    return null;
  }
}

function getVIPCustomers() {
  console.log("[Helper] getVIPCustomers called");
  try {
    const result = customers.filter(c => c.segment === "vip");
    console.log("[Helper] getVIPCustomers result count:", result.length);
    return result;
  } catch (e) {
    console.error("[Helper] getVIPCustomers error:", e);
    return [];
  }
}

function findSegmentByName(name: string) {
  console.log("[Helper] findSegmentByName called with name:", name);
  const normalizedName = name.toLowerCase().trim();
  const result = segments.find(s => 
    s.name.toLowerCase() === normalizedName || 
    s.type.toLowerCase() === normalizedName
  );
  console.log("[Helper] findSegmentByName result:", result);
  return result;
}

function getCampaignsForSegment(segmentName: string) {
  console.log("[Helper] getCampaignsForSegment called with segmentName:", segmentName);
  const result = campaigns.filter(c => c.segment.toLowerCase().includes(segmentName.toLowerCase()));
  console.log("[Helper] getCampaignsForSegment result count:", result.length);
  return result;
}

export async function generateCopilotResponse(
  userMessage: string,
  context: ChatMessage[] = []
): Promise<string> {
  console.log("\n=== generateCopilotResponse START ===");
  console.log("[Input] userMessage:", userMessage);
  console.log("[Input] context length:", context.length);
  
  try {
    // Prepare CRM data (simplified, without full customer list to save tokens)
    console.log("[Step 1] Preparing CRM data");
    const crmContext = {
      campaigns,
      segments,
      customerCount: customers.length,
      customerSegments: [...new Set(customers.map(c => c.segment))]
    };
    console.log("[CRM Data] campaigns count:", campaigns.length);
    console.log("[CRM Data] segments count:", segments.length);

    // Prepare summaries from helper functions
    console.log("[Step 2] Preparing summaries from helper functions");
    const latestCampaigns = getLatestCampaigns(2);
    const bestCampaign = getBestCampaign();
    const topSegmentByAvgSpend = getTopSegmentByAvgSpend();
    const topSegmentByOpenRate = getTopSegmentByOpenRate();
    const vipCustomers = getVIPCustomers();

    const systemPrompt = `You are Xeno Copilot, a helpful AI assistant for a marketing platform.

You have access to the following CRM data:
Campaigns: ${JSON.stringify(crmContext.campaigns, null, 2)}
Segments: ${JSON.stringify(crmContext.segments, null, 2)}
Customer Count: ${crmContext.customerCount}
Customer Segments: ${JSON.stringify(crmContext.customerSegments)}

Here are some pre-calculated summaries:
- Latest 2 campaigns: ${JSON.stringify(latestCampaigns, null, 2)}
- Best performing campaign: ${JSON.stringify(bestCampaign, null, 2)}
- Top segment by average spend: ${JSON.stringify(topSegmentByAvgSpend, null, 2)}
- Top segment by open rate: ${JSON.stringify(topSegmentByOpenRate, null, 2)}
- VIP customers count: ${vipCustomers.length}

Important Rules:
1. Use ONLY the data provided above when answering questions.
2. Never invent campaigns, customers, revenue numbers, segments, or metrics that are not present.
3. If you can't find the information in the provided data, say "I could not find that information in the current CRM dataset."
4. Calculate metrics like delivery rate, open rate, click rate, conversion rate directly from the data when needed.
   - Delivery rate = delivered / sent
   - Open rate = opened / delivered
   - Click rate = clicked / opened
   - Conversion rate = converted / clicked
5. Use markdown formatting for clarity (tables, lists, etc.) when appropriate.

You help users with:
- Analyzing customer data and segments
- Drafting marketing campaigns
- Answering questions about campaign performance
- Suggesting next best actions

Please respond in a friendly, professional tone.`;

    console.log("[Step 3] System prompt generated, length:", systemPrompt.length);

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...context,
      { role: "user", content: userMessage },
    ];
    console.log("[Step 4] Messages array length:", messages.length);

    console.log("[Step 5] Sending request to Groq");
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages as any,
      temperature: 0.5,
      max_tokens: 1500,
    });
    console.log("[Step 6] Groq response received");
    console.log("[Groq] choices count:", completion.choices?.length);
    console.log("[Groq] first choice message:", completion.choices?.[0]?.message);

    const response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    console.log("[Final Response]:", response);
    console.log("=== generateCopilotResponse END ===\n");

    return response;
  } catch (error) {
    console.error("=== ERROR in generateCopilotResponse ===");
    console.error(error);
    console.error("=== END ERROR ===");
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
}
