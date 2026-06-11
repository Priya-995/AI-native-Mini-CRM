const dotenv = require('dotenv');
dotenv.config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const customers = [
  { id: "c1", name: "Ananya Sharma", email: "ananya.s@gmail.com", phone: "98765 43210", city: "Mumbai", total_orders: 24, total_spend: 87400, last_order_date: "2025-05-28", segment: "vip", preferred_channel: "whatsapp", join_date: "2023-02-14", rfm_r: 5, rfm_f: 5, rfm_m: 5 },
  { id: "c2", name: "Rohan Gupta", email: "rohan.g@outlook.com", phone: "98123 45678", city: "Delhi", total_orders: 12, total_spend: 42300, last_order_date: "2025-04-10", segment: "loyal", preferred_channel: "email", join_date: "2023-06-22", rfm_r: 4, rfm_f: 4, rfm_m: 4 },
  { id: "c3", name: "Kavya Reddy", email: "kavya.r@gmail.com", phone: "99887 12345", city: "Hyderabad", total_orders: 8, total_spend: 23100, last_order_date: "2025-03-02", segment: "at-risk", preferred_channel: "whatsapp", join_date: "2024-01-08", rfm_r: 2, rfm_f: 3, rfm_m: 3 },
  { id: "c4", name: "Arjun Patel", email: "arjun.p@yahoo.com", phone: "97654 32109", city: "Ahmedabad", total_orders: 3, total_spend: 6800, last_order_date: "2025-05-30", segment: "new", preferred_channel: "sms", join_date: "2025-04-19", rfm_r: 5, rfm_f: 2, rfm_m: 2 },
  { id: "c5", name: "Priya Iyer", email: "priya.i@gmail.com", phone: "98789 65432", city: "Bengaluru", total_orders: 31, total_spend: 124500, last_order_date: "2025-06-01", segment: "vip", preferred_channel: "whatsapp", join_date: "2022-11-03", rfm_r: 5, rfm_f: 5, rfm_m: 5 },
  { id: "c6", name: "Vikram Singh", email: "vikram.s@gmail.com", phone: "98321 67890", city: "Chandigarh", total_orders: 5, total_spend: 14200, last_order_date: "2024-12-15", segment: "lapsed", preferred_channel: "email", join_date: "2023-09-11", rfm_r: 1, rfm_f: 2, rfm_m: 3 },
  { id: "c7", name: "Meera Nair", email: "meera.n@outlook.com", phone: "97890 12345", city: "Kochi", total_orders: 17, total_spend: 56700, last_order_date: "2025-05-18", segment: "loyal", preferred_channel: "whatsapp", join_date: "2023-04-30", rfm_r: 4, rfm_f: 4, rfm_m: 4 },
  { id: "c8", name: "Aditya Kumar", email: "aditya.k@gmail.com", phone: "98456 78901", city: "Pune", total_orders: 9, total_spend: 31200, last_order_date: "2025-02-22", segment: "at-risk", preferred_channel: "rcs", join_date: "2024-02-17", rfm_r: 2, rfm_f: 3, rfm_m: 3 },
  { id: "c9", name: "Nisha Verma", email: "nisha.v@gmail.com", phone: "99012 34567", city: "Jaipur", total_orders: 22, total_spend: 78900, last_order_date: "2025-06-05", segment: "vip", preferred_channel: "whatsapp", join_date: "2023-01-25", rfm_r: 5, rfm_f: 5, rfm_m: 5 },
  { id: "c10", name: "Karan Mehta", email: "karan.m@yahoo.com", phone: "98234 56789", city: "Mumbai", total_orders: 2, total_spend: 4500, last_order_date: "2025-05-25", segment: "new", preferred_channel: "sms", join_date: "2025-05-10", rfm_r: 5, rfm_f: 1, rfm_m: 1 },
  { id: "c11", name: "Ishaan Joshi", email: "ishaan.j@gmail.com", phone: "97123 89012", city: "Bengaluru", total_orders: 14, total_spend: 48300, last_order_date: "2025-05-12", segment: "loyal", preferred_channel: "email", join_date: "2023-08-14", rfm_r: 4, rfm_f: 4, rfm_m: 4 },
  { id: "c12", name: "Riya Kapoor", email: "riya.k@outlook.com", phone: "98901 23456", city: "Delhi", total_orders: 6, total_spend: 18700, last_order_date: "2024-11-30", segment: "lapsed", preferred_channel: "whatsapp", join_date: "2023-12-04", rfm_r: 1, rfm_f: 2, rfm_m: 3 },
  { id: "c13", name: "Siddharth Rao", email: "sid.rao@gmail.com", phone: "97345 67890", city: "Chennai", total_orders: 19, total_spend: 67800, last_order_date: "2025-05-29", segment: "vip", preferred_channel: "whatsapp", join_date: "2023-03-09", rfm_r: 5, rfm_f: 4, rfm_m: 5 },
  { id: "c14", name: "Tanvi Desai", email: "tanvi.d@gmail.com", phone: "98678 90123", city: "Surat", total_orders: 4, total_spend: 11400, last_order_date: "2025-06-02", segment: "new", preferred_channel: "sms", join_date: "2025-03-21", rfm_r: 5, rfm_f: 2, rfm_m: 2 },
  { id: "c15", name: "Aarav Bhatt", email: "aarav.b@yahoo.com", phone: "99234 56789", city: "Mumbai", total_orders: 11, total_spend: 38900, last_order_date: "2025-04-28", segment: "loyal", preferred_channel: "email", join_date: "2023-07-18", rfm_r: 4, rfm_f: 4, rfm_m: 4 },
  { id: "c16", name: "Sneha Pillai", email: "sneha.p@gmail.com", phone: "98567 12340", city: "Hyderabad", total_orders: 7, total_spend: 22300, last_order_date: "2025-01-15", segment: "at-risk", preferred_channel: "whatsapp", join_date: "2024-03-02", rfm_r: 2, rfm_f: 3, rfm_m: 3 },
  { id: "c17", name: "Devansh Shah", email: "devansh.s@gmail.com", phone: "97456 78901", city: "Ahmedabad", total_orders: 13, total_spend: 44100, last_order_date: "2025-05-20", segment: "loyal", preferred_channel: "whatsapp", join_date: "2023-05-27", rfm_r: 4, rfm_f: 4, rfm_m: 4 },
  { id: "c18", name: "Pooja Malhotra", email: "pooja.m@outlook.com", phone: "98890 12345", city: "Delhi", total_orders: 28, total_spend: 98200, last_order_date: "2025-06-04", segment: "vip", preferred_channel: "email", join_date: "2022-12-11", rfm_r: 5, rfm_f: 5, rfm_m: 5 },
  { id: "c19", name: "Manish Choudhary", email: "manish.c@gmail.com", phone: "97890 56234", city: "Lucknow", total_orders: 3, total_spend: 7800, last_order_date: "2024-10-22", segment: "lapsed", preferred_channel: "sms", join_date: "2024-04-15", rfm_r: 1, rfm_f: 2, rfm_m: 2 },
  { id: "c20", name: "Aisha Khan", email: "aisha.k@gmail.com", phone: "98012 34567", city: "Bengaluru", total_orders: 16, total_spend: 52600, last_order_date: "2025-05-31", segment: "loyal", preferred_channel: "whatsapp", join_date: "2023-10-08", rfm_r: 5, rfm_f: 4, rfm_m: 4 },
];

const campaigns = [
  { id: "cam1", name: "Diwali Sale Blast", channel: "whatsapp", segment_filter: "all", message: "Hi! 🎉 Diwali offers are live. Shop now and get up to 40% off!", status: "completed", sent: 42180, delivered: 41320, opened: 18900, clicked: 6420 },
  { id: "cam2", name: "Churned Win-back", channel: "email", segment_filter: "lapsed", message: "We miss you! Here's 15% off your next order just for you.", status: "active", sent: 8400, delivered: 8190, opened: 2456, clicked: 712 },
  { id: "cam3", name: "New Collection Drop", channel: "whatsapp", segment_filter: "vip", message: "✨ Exclusive preview: Our new collection is here. Shop before anyone else!", status: "completed", sent: 3200, delivered: 3180, opened: 2240, clicked: 980 },
  { id: "cam4", name: "VIP Exclusive Preview", channel: "email", segment_filter: "vip", message: "You're invited 👑 Exclusive VIP access to our new arrivals.", status: "active", sent: 2840, delivered: 2820, opened: 1980, clicked: 720 },
  { id: "cam5", name: "Flash Sale Alert", channel: "sms", segment_filter: "all", message: "⚡ FLASH SALE: 30% off next 2 hours only! Use code FLASH30", status: "completed", sent: 38900, delivered: 38420, opened: 12300, clicked: 3120 },
  { id: "cam6", name: "Monsoon Skincare", channel: "rcs", segment_filter: "at-risk", message: "☁️ Monsoon is here! Protect your skin with our new range.", status: "active", sent: 6200, delivered: 6080, opened: 2840, clicked: 1240 },
  { id: "cam7", name: "Birthday Special", channel: "whatsapp", segment_filter: "loyal", message: "🎂 Happy Birthday! Here's a special 20% off gift just for you.", status: "active", sent: 480, delivered: 478, opened: 410, clicked: 220 },
  { id: "cam8", name: "Cart Abandonment", channel: "whatsapp", segment_filter: "new", message: "👋 You left something behind! Complete your order and get free shipping.", status: "active", sent: 1240, delivered: 1230, opened: 890, clicked: 340 },
  { id: "cam9", name: "Summer Closeout", channel: "email", segment_filter: "new", message: "☀️ Summer sale ends soon! Up to 60% off selected items.", status: "draft", sent: 0, delivered: 0, opened: 0, clicked: 0 },
  { id: "cam10", name: "Loyalty Tier Upgrade", channel: "email", segment_filter: "loyal", message: "🌟 Great news! You've been upgraded to Gold tier. Enjoy exclusive benefits.", status: "completed", sent: 4200, delivered: 4180, opened: 2890, clicked: 1240 },
];

async function seed() {
  console.log('Seeding customers...');
  const { error: e1 } = await supabase.from('customers').upsert(customers);
  if (e1) console.error('❌ Customers:', e1.message);
  else console.log('✅ Seeded 20 customers');

  console.log('Seeding campaigns...');
  const { error: e2 } = await supabase.from('campaigns').upsert(campaigns);
  if (e2) console.error('❌ Campaigns:', e2.message);
  else console.log('✅ Seeded 10 campaigns');

  console.log('Done! 🎉');
}

seed();
export {};