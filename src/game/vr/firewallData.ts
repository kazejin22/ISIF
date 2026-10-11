// Posts for the VR "Misinformation Firewall". Every post is fictional; real agencies
// (BMKG, BNPB, KAI, Kemenkes) appear only as examples of credible, official sources.
// suspicious = slash it (block); credible = let it pass (trust).

export interface FeedCard {
  id: string;
  /** Where the post appears, e.g. "WhatsApp". */
  app: string;
  sender: string;
  headline: string;
  /** Two concrete things to check — the evidence the player should base the decision on. */
  clues: [string, string];
  suspicious: boolean;
  /** Why it's suspicious or credible, shown after the decision. */
  lesson: string;
  /** Tutorial cards explain exactly what to do. */
  coach?: string;
}

export const TUTORIAL_CARDS: FeedCard[] = [
  {
    id: "t1", suspicious: true, app: "WhatsApp", sender: "Unknown number +62 812-7731-xxxx",
    headline: "Mom, this is my new number. My phone broke. Please transfer Rp 2,000,000 now, it's urgent!",
    clues: ["Unknown new number", "Urgent request for money"],
    lesson: "Scammers pretend to be family with a “new number”. Call the old number first.",
    coach: "Unknown number + urgent money request = a classic scam.  SLASH IT!",
  },
  {
    id: "t2", suspicious: false, app: "Instagram", sender: "BMKG (verified official account)",
    headline: "Heavy-rain warning for Jakarta this weekend. Avoid flood-prone areas.",
    clues: ["Official verified agency", "Same warning on major news sites"],
    lesson: "Official agencies confirmed by other outlets are credible — share these!",
    coach: "Official agency + confirmed by the news = credible.  LET IT PASS (don't slash).",
  },
];

export const FIREWALL_CARDS: FeedCard[] = [
  // Suspicious — slash
  { id: "s1", suspicious: true, app: "SMS", sender: "BANK-INFO", headline: "Your account is BLOCKED. Verify within 1 hour: bit.ly/bnk-verify", clues: ["Shortened link", "1-hour deadline"], lesson: "Banks never ask you to verify through short links or with a deadline." },
  { id: "s2", suspicious: true, app: "Instagram ad", sender: "@crypto.giveaway.official", headline: "Famous billionaire gives away crypto: send 1 coin, get 2 back!", clues: ["Celebrity video looks slightly off", "Too good to be true"], lesson: "Celebrity giveaways in ads are a favourite deepfake scam." },
  { id: "s3", suspicious: true, app: "X (Twitter)", sender: "@BreakingNews24_7 · created 2 days ago", headline: "LEAKED AUDIO: candidate admits rigging the election. Share before it's deleted!", clues: ["Account created 2 days ago", "“Share before it's deleted”"], lesson: "New accounts pushing urgent sharing are built to beat fact-checkers." },
  { id: "s4", suspicious: true, app: "Facebook", sender: "Viral Today", headline: "PHOTO: shark swimming on a flooded toll road!", clues: ["No photographer or date", "Same photo seen in old floods"], lesson: "Viral disaster photos are often old fakes. Reverse-search them." },
  { id: "s5", suspicious: true, app: "Email", sender: "support@paypa1-secure.com", headline: "Unusual login detected. Enter your password here to keep your account.", clues: ["Look-alike domain: paypa1", "Asks for your password"], lesson: "Look-alike domains asking for passwords are phishing." },
  { id: "s6", suspicious: true, app: "WhatsApp group", sender: "Forwarded many times", headline: "Doctors confirm: hot lemon water cures every virus.", clues: ["No named doctor or study", "“Forwarded many times”"], lesson: "Miracle cures with no named source don't hold up." },
  { id: "s7", suspicious: true, app: "Video call", sender: "“CEO” · camera blurry", headline: "Transfer the funds to the new supplier today. Don't tell anyone.", clues: ["Secrecy + urgency", "Blurry video, voice slightly off"], lesson: "Secret, urgent payments are CEO fraud. Verify by phone." },
  { id: "s8", suspicious: true, app: "TikTok Shop", sender: "@promo.hp.murah", headline: "New iPhone for only Rp 1,500,000! Only 3 left — pay by bank transfer now.", clues: ["Price far below market", "Bank transfer only"], lesson: "Prices far below market with transfer-only payment are scams." },
  { id: "s9", suspicious: true, app: "Website", sender: "gov-bansos-daftar.net", headline: "Register your ID number to receive Rp 5,000,000 in government aid.", clues: ["Not a .go.id website", "Asks for your ID number"], lesson: "Real government services use .go.id domains." },
  { id: "s10", suspicious: true, app: "Telegram", sender: "Job Offer HR", headline: "Earn Rp 500,000/day just liking videos! Pay Rp 100,000 to register.", clues: ["Upfront fee to start", "Unrealistic earnings"], lesson: "Jobs that ask you to pay first are scams." },
  { id: "s11", suspicious: true, app: "Instagram", sender: "@newsupdate_id · first post today", headline: "PHOTO: famous singer arrested at the airport!", clues: ["Garbled text in the photo", "Brand-new account, no source"], lesson: "Garbled text in a photo often means it's AI-generated." },
  { id: "s12", suspicious: true, app: "SMS", sender: "+62 857-xxxx", headline: "Congratulations! You won a motorbike. Pay Rp 300,000 tax to claim.", clues: ["You never entered", "Fee to claim a prize"], lesson: "Real prizes never ask you to pay to claim them." },
  // Credible — let pass
  { id: "c1", suspicious: false, app: "School website", sender: "smpn5.sch.id", headline: "Final exam schedule for next month is now published.", clues: ["Official school domain", "Matches your teacher's announcement"], lesson: "Official domains that match what you heard elsewhere are credible." },
  { id: "c2", suspicious: false, app: "News", sender: "Reuters · AP · Antara", headline: "Central bank keeps interest rates unchanged.", clues: ["Reported by many outlets", "Quotes an official statement"], lesson: "Wide, consistent reporting is a strong credibility signal." },
  { id: "c3", suspicious: false, app: "Fact-check", sender: "AFP Fact Check", headline: "The viral “shark on the toll road” photo is an old fake.", clues: ["Recognised fact-checker", "Shows the original source"], lesson: "Fact-checks debunking fakes are exactly what you want to let through." },
  { id: "c4", suspicious: false, app: "Instagram", sender: "Police (verified official account)", headline: "Beware of new voice-clone phone scams. Call 110 to report.", clues: ["Verified official account", "Tells you how to check"], lesson: "Warnings that tell you how to verify are credible." },
  { id: "c5", suspicious: false, app: "University news", sender: "University press office", headline: "Study: students who sleep 8 hours score higher on exams.", clues: ["Links to the published study", "Named researchers"], lesson: "A linked, published study with named authors is a good sign." },
  { id: "c6", suspicious: false, app: "City website", sender: "jakarta.go.id", headline: "National Museum reopens on Sunday with free entry.", clues: ["Official .go.id domain", "Clear date and place"], lesson: "Specific details on an official domain are credible." },
  { id: "c7", suspicious: false, app: "News", sender: "Local news · by reporter A. Rahman", headline: "Three new public libraries open in the city.", clues: ["Named reporter", "Photos from the opening"], lesson: "Named reporters are accountable for what they publish." },
  { id: "c8", suspicious: false, app: "Website", sender: "kemkes.go.id", headline: "Free vaccination week starts Monday at local health clinics.", clues: ["Official government domain", "Also reported by major news"], lesson: "Official sites confirmed by independent news are credible." },
  { id: "c9", suspicious: false, app: "Instagram", sender: "Official club account (verified)", headline: "Club confirms its new head coach at a press conference.", clues: ["Verified official account", "Video of the press conference"], lesson: "Official accounts with event footage are credible." },
  { id: "c10", suspicious: false, app: "App notification", sender: "KAI Access (official app)", headline: "Train schedule changes during the holiday season.", clues: ["Official app", "Same info on the company website"], lesson: "Information you can confirm on the official site is credible." },
  { id: "c11", suspicious: false, app: "X (Twitter)", sender: "BNPB (verified official account)", headline: "Volcano alert raised: stay outside the 5 km danger zone.", clues: ["Official disaster agency", "Confirmed by local news"], lesson: "Official disaster alerts confirmed by local news are credible." },
  { id: "c12", suspicious: false, app: "Email", sender: "noreply@ruangguru.com", headline: "Your class schedule for this week is ready in the app.", clues: ["Real company domain", "No link asking for a password"], lesson: "Messages from real domains that don't ask for passwords are fine." },
];

/** Rules shown on the board next to the player during the game. */
export const FIREWALL_RULES = {
  slash: [
    "Unknown or brand-new account",
    "Urgent request for money or a password",
    "Too good to be true",
    "Look-alike or shortened links",
    "No source, or “share before it's deleted”",
  ],
  pass: [
    "Official or verified account",
    "Official domain (.go.id, .sch.id)",
    "Confirmed by several outlets",
    "Named reporter or fact-checker",
  ],
};

export const FIREWALL_MISSION_ID = "vr-firewall";
export const FIREWALL_MAX_SCORE = 1000;
