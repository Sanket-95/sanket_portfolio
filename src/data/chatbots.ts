/**
 * Scripted conversations for the Chat Bot demo page (/chat-bot).
 * Each node is a bot turn: the messages the bot sends and the replies the user can pick next.
 * Free-typed text is matched against `keywords` to jump to a node; anything else hits `fallback`.
 */
export interface BotOption {
  label: string;
  next: string;
}

export interface BotNode {
  messages: string[];
  options: BotOption[];
}

export interface BotScript {
  start: string;
  fallback: string;
  nodes: Record<string, BotNode>;
  keywords: { words: string[]; node: string }[];
}

const clinicMenu: BotOption[] = [
  { label: '📅 Book appointment', next: 'book' },
  { label: '🕘 Clinic timings', next: 'timings' },
  { label: '👩‍⚕️ Our doctors', next: 'doctors' },
  { label: '🧪 Lab reports', next: 'reports' },
];

/** WhatsApp bot — "Meera", the assistant of a (fictional) clinic. */
export const whatsappBot: BotScript = {
  start: 'welcome',
  fallback: 'unknown',
  nodes: {
    welcome: {
      messages: [
        'Hi 👋 I’m *Meera*, the virtual assistant of CareWell Clinic.',
        'I can book appointments, share timings and send your lab reports. What would you like to do?',
      ],
      options: clinicMenu,
    },
    menu: { messages: ['Sure! What else can I help you with?'], options: clinicMenu },
    book: {
      messages: ['Great, let’s book your visit. Which department?'],
      options: [
        { label: 'General Physician', next: 'slot' },
        { label: 'Dental', next: 'slot' },
        { label: 'Pediatrics', next: 'slot' },
      ],
    },
    slot: {
      messages: ['These slots are available:'],
      options: [
        { label: 'Today, 5:30 PM', next: 'confirm' },
        { label: 'Tomorrow, 10:00 AM', next: 'confirm' },
        { label: 'Tomorrow, 6:15 PM', next: 'confirm' },
      ],
    },
    confirm: {
      messages: [
        '✅ *Appointment confirmed!*\nBooking ID: *CW-24817*\nPlease arrive 10 minutes early and carry a photo ID.',
        'I’ll send you a reminder 2 hours before your visit.',
      ],
      options: [
        { label: '📍 Get directions', next: 'location' },
        { label: '🏠 Main menu', next: 'menu' },
      ],
    },
    timings: {
      messages: ['🕘 *Clinic timings*\nMon – Sat: 9:00 AM – 8:00 PM\nSunday: 10:00 AM – 1:00 PM\nEmergency: 24 × 7'],
      options: [
        { label: '📅 Book appointment', next: 'book' },
        { label: '🏠 Main menu', next: 'menu' },
      ],
    },
    doctors: {
      messages: [
        '👩‍⚕️ *Our doctors*\n• Dr. Anjali Rao — General Physician\n• Dr. Vikram Shah — Dentist\n• Dr. Neha Kulkarni — Pediatrician',
      ],
      options: [
        { label: '📅 Book appointment', next: 'book' },
        { label: '🏠 Main menu', next: 'menu' },
      ],
    },
    reports: {
      messages: ['Please share your Booking ID or registered mobile number and I’ll look up your reports.'],
      options: [{ label: 'Use this number', next: 'reportSent' }],
    },
    reportSent: {
      messages: ['📄 Found 1 report: *Complete Blood Count* (12 Oct).\nI’ve sent the PDF to this chat. Anything else?'],
      options: clinicMenu,
    },
    location: {
      messages: ['📍 CareWell Clinic, 2nd Floor, Lotus Plaza, MG Road.\nmaps.example/carewell'],
      options: [{ label: '🏠 Main menu', next: 'menu' }],
    },
    thanks: { messages: ['You’re welcome! Take care 😊'], options: clinicMenu },
    unknown: {
      messages: ['Sorry, I didn’t quite get that 🙏 Please pick one of the options below.'],
      options: clinicMenu,
    },
  },
  keywords: [
    { words: ['book', 'appointment', 'visit', 'consult'], node: 'book' },
    { words: ['time', 'timing', 'open', 'hours', 'close'], node: 'timings' },
    { words: ['doctor', 'dr', 'specialist'], node: 'doctors' },
    { words: ['report', 'lab', 'test', 'result'], node: 'reports' },
    { words: ['where', 'location', 'address', 'direction'], node: 'location' },
    { words: ['thank', 'thanks', 'ok', 'bye'], node: 'thanks' },
    { words: ['hi', 'hello', 'hey', 'menu', 'start'], node: 'welcome' },
  ],
};

const realtyMenu: BotOption[] = [
  { label: 'Buy a home', next: 'buy' },
  { label: 'Rent a home', next: 'rent' },
  { label: 'Sell my property', next: 'sell' },
  { label: 'Talk to an agent', next: 'agent' },
];

/** Website bot — "Leo", the assistant on a (fictional) real-estate site. */
export const websiteBot: BotScript = {
  start: 'welcome',
  fallback: 'unknown',
  nodes: {
    welcome: {
      messages: ['Hey there! I’m Leo from UrbanNest 🏡', 'Looking to buy, rent or sell? I can help you find the right place in a minute.'],
      options: realtyMenu,
    },
    menu: { messages: ['What would you like to do next?'], options: realtyMenu },
    buy: {
      messages: ['Nice! What’s your budget?'],
      options: [
        { label: 'Under ₹50 L', next: 'area' },
        { label: '₹50 L – ₹1 Cr', next: 'area' },
        { label: 'Above ₹1 Cr', next: 'area' },
      ],
    },
    area: {
      messages: ['And which area do you prefer?'],
      options: [
        { label: 'Baner', next: 'listings' },
        { label: 'Wakad', next: 'listings' },
        { label: 'Kharadi', next: 'listings' },
      ],
    },
    listings: {
      messages: [
        'I found 2 homes that match:',
        '🏢 Skyline Residency — 2 BHK, 980 sq ft, ₹78 L\nReady to move · Gym · Pool',
        '🏡 Green Acres — 3 BHK, 1,420 sq ft, ₹96 L\nPossession Mar 2027 · Clubhouse',
      ],
      options: [
        { label: 'Schedule a site visit', next: 'visit' },
        { label: 'Show more', next: 'more' },
        { label: 'Start over', next: 'menu' },
      ],
    },
    more: {
      messages: ['I’ve emailed you 6 more listings in that range. Want to see one in person?'],
      options: [
        { label: 'Schedule a site visit', next: 'visit' },
        { label: 'Main menu', next: 'menu' },
      ],
    },
    visit: {
      messages: ['When works for you?'],
      options: [
        { label: 'This Saturday', next: 'visitDone' },
        { label: 'This Sunday', next: 'visitDone' },
        { label: 'Next weekday', next: 'visitDone' },
      ],
    },
    visitDone: {
      messages: ['📅 Visit booked! Our agent Rohan will call you to confirm the time.', 'Is there anything else I can help with?'],
      options: realtyMenu,
    },
    rent: {
      messages: ['Got it. How many bedrooms?'],
      options: [
        { label: '1 BHK', next: 'rentList' },
        { label: '2 BHK', next: 'rentList' },
        { label: '3 BHK', next: 'rentList' },
      ],
    },
    rentList: {
      messages: ['There are 14 furnished and semi-furnished options from ₹18k/month. Shall I set up visits?'],
      options: [
        { label: 'Schedule a site visit', next: 'visit' },
        { label: 'Main menu', next: 'menu' },
      ],
    },
    sell: {
      messages: ['We can get you a free valuation within 24 hours. What type of property is it?'],
      options: [
        { label: 'Apartment', next: 'sellDone' },
        { label: 'Villa', next: 'sellDone' },
        { label: 'Plot', next: 'sellDone' },
      ],
    },
    sellDone: {
      messages: ['Thanks! A valuation expert will reach out today with an estimate. 📈'],
      options: realtyMenu,
    },
    agent: {
      messages: ['Connecting you to a human agent… 👩‍💼 Average wait time is under 2 minutes. You can keep chatting with me meanwhile.'],
      options: [{ label: 'Main menu', next: 'menu' }],
    },
    thanks: { messages: ['Anytime! Happy house hunting 🏠'], options: realtyMenu },
    unknown: {
      messages: ['Hmm, I’m not sure I understood. Try one of these:'],
      options: realtyMenu,
    },
  },
  keywords: [
    // Checked in order, so the more specific intents come before "buy".
    { words: ['rent', 'rental', 'lease', 'tenant'], node: 'rent' },
    { words: ['sell', 'selling', 'valuation'], node: 'sell' },
    { words: ['buy', 'purchase', 'flat', 'apartment', 'home', 'house', 'budget', 'bhk'], node: 'buy' },
    { words: ['visit', 'see', 'tour', 'schedule'], node: 'visit' },
    { words: ['agent', 'human', 'call', 'person', 'contact'], node: 'agent' },
    { words: ['thank', 'thanks', 'bye', 'ok'], node: 'thanks' },
    { words: ['hi', 'hello', 'hey', 'menu', 'start'], node: 'welcome' },
  ],
};

/** Picks the node for free-typed text by whole-word keyword match. */
export function matchKeyword(script: BotScript, text: string): string {
  const lower = text.toLowerCase();
  const words: string[] = lower.match(/[a-z]+/g) ?? [];
  const hit = script.keywords.find((k) => k.words.some((w) => (w.includes(' ') ? lower.includes(w) : words.includes(w))));
  return hit?.node ?? script.fallback;
}
