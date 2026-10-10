// Cards for the VR "Misinformation Firewall". All posts are fictional and generic.
// suspicious = slash it; credible = let it pass.

export interface FeedCard {
  id: string;
  headline: string;
  source: string;
  cue: string;
  suspicious: boolean;
  /** Short lesson shown in the summary when the player gets it wrong. */
  lesson: string;
}

export const FIREWALL_CARDS: FeedCard[] = [
  // Suspicious
  { id: "s1", suspicious: true, headline: "BREAKING: banks freeze ALL accounts tonight!! Withdraw now", source: "@newsalert_24", cue: "Account created 2 days ago", lesson: "Panic + a brand-new account is a classic disinformation combo." },
  { id: "s2", suspicious: true, headline: "Famous actor gives $1,000 to everyone who shares this video", source: "Sponsored ad", cue: "Lip-sync looks slightly off", lesson: "Celebrity giveaways in ads are a favourite deepfake scam." },
  { id: "s3", suspicious: true, headline: "Leaked audio: official admits the vote is rigged SHARE before deleted", source: "Anonymous channel", cue: "No original source", lesson: "“Share before it's deleted” is designed to beat fact-checkers." },
  { id: "s4", suspicious: true, headline: "This AI trading bot doubles your money in 24 hours", source: "crypto-profits-now.biz", cue: "Guaranteed returns", lesson: "Guaranteed returns are always a red flag." },
  { id: "s5", suspicious: true, headline: "PHOTO: shark swimming down a flooded highway", source: "Viral repost", cue: "No photographer, no date", lesson: "Viral disaster photos are often old fakes. Reverse-search them." },
  { id: "s6", suspicious: true, headline: "Your parcel is held. Pay a small customs fee here", source: "SMS · bit.ly link", cue: "Shortened link", lesson: "Delivery-fee texts with short links are a common phishing trick." },
  { id: "s7", suspicious: true, headline: "Doctors confirm: hot water cures every virus", source: "Forwarded many times", cue: "No named doctor or study", lesson: "Miracle-cure claims without a named study don't hold up." },
  { id: "s8", suspicious: true, headline: "CEO on video call: transfer funds to a new account today, tell no one", source: "Urgent private message", cue: "Secrecy + urgency", lesson: "Secret, urgent payment requests are CEO-fraud. Verify by phone." },
  { id: "s9", suspicious: true, headline: "Free government Wi-Fi! Enter your ID number to register", source: "gov-wifi-free.net", cue: "Look-alike website", lesson: "Real government sites don't sit on random .net domains." },
  { id: "s10", suspicious: true, headline: "EXCLUSIVE: pop star arrested at airport (photo)", source: "New page, 0 followers", cue: "Garbled text in the photo", lesson: "Garbled text in a photo often means it's AI-generated." },
  { id: "s11", suspicious: true, headline: "Your account will be deleted. Verify your password now", source: "support@paypa1-secure.com", cue: "“1” instead of “l”", lesson: "Look-alike domains (paypa1) are classic phishing." },
  { id: "s12", suspicious: true, headline: "Mom, it's me, new number. Send money urgently, can't talk", source: "Unknown number", cue: "Won't take a call", lesson: "Call the person on their old number before sending anything." },
  // Credible
  { id: "c1", suspicious: false, headline: "City opens three new public libraries this month", source: "Local News · by A. Rahman", cue: "Named reporter", lesson: "Named reporters and local outlets are accountable sources." },
  { id: "c2", suspicious: false, headline: "Weather service issues heavy-rain warning for the weekend", source: "National weather agency (verified)", cue: "Official verified account", lesson: "Official agency warnings are worth sharing, not slashing." },
  { id: "c3", suspicious: false, headline: "Study: regular sleep linked to better exam scores", source: "University press office", cue: "Links to the published paper", lesson: "A linked, published study is a good sign of credibility." },
  { id: "c4", suspicious: false, headline: "Volcano alert raised; residents told to avoid the 5 km zone", source: "Disaster management agency (verified)", cue: "Matches other outlets", lesson: "Several outlets confirming the same official alert is credible." },
  { id: "c5", suspicious: false, headline: "School publishes the exam timetable on its website", source: "school.sch.id", cue: "Official domain", lesson: "Official domains are a good credibility signal." },
  { id: "c6", suspicious: false, headline: "Central bank keeps interest rates unchanged", source: "Reuters · AP · local press", cue: "Reported by many outlets", lesson: "Wide, consistent reporting is a strong credibility signal." },
  { id: "c7", suspicious: false, headline: "Fact-check: viral “shark on the highway” photo is an old fake", source: "AFP Fact Check", cue: "Recognised fact-checker", lesson: "Fact-checks debunking fakes are exactly what you want to let through." },
  { id: "c8", suspicious: false, headline: "Football club confirms new head coach at press conference", source: "Official club account (verified)", cue: "Video of the event", lesson: "Official accounts with event footage are credible." },
  { id: "c9", suspicious: false, headline: "Health ministry launches a free vaccination week", source: "Ministry website · news outlets", cue: "Official + independent coverage", lesson: "Government sites plus independent news coverage are credible." },
  { id: "c10", suspicious: false, headline: "Museum reopens after renovation, free entry on Sunday", source: "City culture office", cue: "Clear date and place", lesson: "Specific, checkable details (date, place) are a good sign." },
  { id: "c11", suspicious: false, headline: "Police warn residents about new voice-clone phone scams", source: "Police official account (verified)", cue: "Gives a hotline to verify", lesson: "Warnings that tell you how to verify are credible." },
  { id: "c12", suspicious: false, headline: "Train fares to rise 5% next year, operator says", source: "Company statement · several outlets", cue: "Quoted statement", lesson: "Quoted company statements confirmed by outlets are credible." },
];

export const FIREWALL_MISSION_ID = "vr-firewall";
export const FIREWALL_MAX_SCORE = 1000;
