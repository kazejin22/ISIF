import type { Mission } from "./types";
import { MISSIONS_ID } from "./missions.id";

// Missions are inspired by real incidents (see src/data/crimeData.ts), but every
// company, person and message in them is fictional.

const heistMission: Mission = {
  id: "video-call-heist",
  number: 1,
  codename: "OPERATION MIRROR",
  title: "The $25M Video Call",
  tagline: "Your CFO wants an urgent, secret transfer. Is it really him?",
  location: "Hong Kong",
  year: 2024,
  caseId: "hk-arup-2024",
  skill: "Spotting CEO-fraud & video-call deepfakes",
  briefing: [
    "You work in the finance team of Meridian Engineering's Hong Kong office.",
    "This morning an email arrived from the Chief Financial Officer in London. Later, a video call. By the end of the day, someone wants millions moved.",
    "In 2024 an employee at a real engineering firm transferred about US$25 million after a video call where every 'colleague' was a deepfake. Don't let it happen twice.",
  ],
  stages: [
    {
      kind: "hunt",
      title: "Inspect the email",
      brief: "Click every part of this email that is a red flag. Careful — clicking innocent parts costs points.",
      maxPoints: 400,
      email: {
        from: {
          id: "from",
          text: "David Chen (CFO) <d.chen@meridian-engineerlng.com>",
          flag: true,
          explain: "Look-alike domain: “engineerlng” uses an L instead of an I. The real domain is meridian-engineering.com.",
        },
        subject: {
          id: "subject",
          text: "URGENT & CONFIDENTIAL — acquisition payment needed today",
          flag: true,
          explain: "Urgency plus secrecy in the subject line is a classic pressure tactic: it rushes you past normal checks.",
        },
        body: [
          { id: "greet", text: "Hi, thanks again for your excellent work on the quarterly report.", flag: false, explain: "Friendly small talk is normal — and scammers copy it, but it isn't a red flag on its own." },
          { id: "secret", text: "We are finalising a confidential acquisition. Please do not discuss this with anyone in the office, including your manager.", flag: true, explain: "Isolation: asking you to hide a payment from your own manager bypasses the controls that protect you." },
          { id: "deadline", text: "The funds must reach our partners' accounts within the next two hours, or the deal will collapse.", flag: true, explain: "Artificial deadline. Real acquisitions take weeks and go through legal and treasury teams." },
          { id: "accounts", text: "I'll share the beneficiary details on the call — five new accounts at Pacific Crest Trading Ltd.", flag: true, explain: "New, unknown beneficiaries split across several accounts is how stolen money is moved quickly." },
          { id: "call", text: "Join me and our legal adviser on a video call at 15:00 HKT so we can walk you through it.", flag: false, explain: "Calls are normal — but in this attack the call itself was the deepfake. Stay alert in the next stage." },
          { id: "sig", text: "Best regards, David Chen — Chief Financial Officer, London", flag: false, explain: "A normal signature. Signatures are easy to copy, so they prove nothing either way." },
        ],
        attachment: {
          id: "attach",
          text: "📎 Meeting_link_SECURE.html",
          flag: true,
          explain: "An HTML attachment instead of a normal calendar invite can lead to a fake login page or a meeting you can't verify.",
        },
      },
    },
    {
      kind: "observe",
      title: "Join the video call",
      brief: "Four people are on the call. Read what happens and tick everything that suggests deepfakes.",
      maxPoints: 300,
      scene: "video-call",
      transcript: [
        { speaker: "“David Chen”", line: "Thanks for joining. My connection is bad, so I'll keep my camera at low quality." },
        { speaker: "You", line: "No problem. Quick question first — how was the team dinner in Sai Kung last month?" },
        { speaker: "“David Chen”", line: "Sorry, you're breaking up. Let's focus — time is short." },
        { speaker: "“Legal adviser”", line: "(nods, says nothing for the whole call)" },
        { speaker: "“David Chen”", line: "Everyone here has approved. I'll send the five accounts now. Transfer them one by one." },
      ],
      items: [
        { id: "lowq", text: "He insists on low video quality because of “bad connection”.", suspicious: true, explain: "Low resolution hides deepfake artifacts around the face and mouth." },
        { id: "dodge", text: "He dodges your personal question about the team dinner.", suspicious: true, explain: "A deepfake can copy a face and voice, not shared memories. Personal questions are a strong test." },
        { id: "silent", text: "The other attendees never speak and barely move.", suspicious: true, explain: "Faking many live people is hard, so extra attendees are often silent, looping video." },
        { id: "lips", text: "His lip movements seem slightly behind his words.", suspicious: true, explain: "Lip-sync drift is a common sign of real-time face or voice swapping." },
        { id: "office", text: "He appears to be sitting in an office.", suspicious: false, explain: "Backgrounds are easy to fake but also completely normal — not evidence either way." },
        { id: "english", text: "He speaks fluent English with a British accent.", suspicious: false, explain: "Voice clones copy accents well, so a familiar accent proves nothing — but it isn't suspicious either." },
      ],
    },
    {
      kind: "choice",
      title: "Make the call",
      brief: "The “CFO” is waiting. What do you do?",
      maxPoints: 300,
      options: [
        { id: "pay", text: "Transfer the money — the CFO and legal both approved on video.", points: 0, feedback: "This is exactly how the real US$25 million was lost: 15 transfers after a convincing fake call." },
        { id: "reply", text: "Reply to the email asking David to confirm in writing.", points: 60, feedback: "Better than paying, but the reply goes straight back to the scammer, who will happily “confirm”." },
        { id: "askcall", text: "Ask on the same call for a photo of his ID badge.", points: 60, feedback: "Anything shown on a channel the attacker controls can also be faked." },
        { id: "verify", text: "End the call, phone David on the number in the company directory, and tell your manager.", points: 300, feedback: "Perfect. Verifying through a channel YOU choose (a known number) defeats even a flawless deepfake." },
      ],
    },
  ],
  lessons: [
    "Urgency + secrecy + a new bank account = stop and verify, every time.",
    "Verify through a channel you choose, like a known phone number, never the one the requester provides.",
    "Ask something only the real person would know. Deepfakes copy faces and voices, not memories.",
    "Low video quality, silent attendees and lip-sync drift are warning signs on calls.",
  ],
};

const realOrFakeMission: Mission = {
  id: "real-or-synthetic",
  number: 2,
  codename: "OPERATION PIXEL",
  title: "Real or Synthetic?",
  tagline: "Eight images. Eight seconds of doubt each. Trust your training.",
  location: "Global",
  year: 2025,
  skill: "Recognising AI-generated images",
  briefing: [
    "A newsroom needs your help: images are pouring in and some of them were never photographed by anyone.",
    "For each image, decide: a real photograph, or made by an image generator? Speed matters, and consecutive correct answers build a streak bonus.",
    "Look at text, hands, faces in the background, and anything that doesn't fit the time or place.",
  ],
  stages: [
    {
      kind: "real-or-fake",
      title: "Sort the evidence",
      brief: "Real photograph or AI-generated?",
      maxPoints: 1000,
      secondsPerRound: 15,
      rounds: [
        { id: "r1", src: "/game/rof/e1.jpg", answer: "real", explain: "Real. Volcanic ash in Yogyakarta after the 2014 Kelud eruption. The rice sack's “BERAS BULOG” label is perfectly legible, and the dust and tracks are messy in a natural way.", credit: "Photo: Crisco 1492 / Wikimedia Commons, CC BY-SA 3.0" },
        { id: "r2", src: "/game/rof/e2.png", answer: "ai", explain: "AI (Midjourney v4). The licence plate “1107ES 6119” is gibberish, the car badge isn't any real brand, and the “vintage” texture is applied evenly like a filter.", credit: "Image: Chikorita / Wikimedia Commons, CC BY-SA 4.0" },
        { id: "r3", src: "/game/rof/e3.jpg", answer: "real", explain: "Real. A fire-breather in Indonesia. It looks almost too dramatic, but the flame has chaotic, physically correct detail and the hands and toes are anatomically right. Spectacular doesn't mean fake!", credit: "Photo: Firman Hakim / Wikimedia Commons, CC BY-SA 4.0" },
        { id: "r4", src: "/game/rof/e4.png", answer: "ai", explain: "AI (Midjourney). The school badge text is unreadable, background students repeat the same face and pose, and desks blend into each other toward the back.", credit: "Image: Midjourney / Wikimedia Commons, public domain" },
        { id: "r5", src: "/game/rof/e5.jpg", answer: "real", explain: "Real. Ana Rosa metro station, São Paulo. The signs (“Vila Prudente”, “Vila Madalena”) are real, readable place names and the handrails follow consistent perspective.", credit: "Photo: Wilfredor / Wikimedia Commons, CC BY-SA 4.0" },
        { id: "r6", src: "/game/rof/e6.jpg", answer: "ai", explain: "AI. Abraham Lincoln died in 1865, long before smartphones. Context checks beat pixel-peeping: the lighting is flawless, but the scene is impossible.", credit: "Image: Dennis Sylvester Hurd / Wikimedia Commons, public domain" },
        { id: "r7", src: "/game/rof/e7.jpg", answer: "real", explain: "Real. A fishmonger in Maracaibo, Venezuela. Uneven teeth, deep wrinkles, chest hair and the shirt's check pattern all stay consistent — the imperfect detail AI tends to smooth away.", credit: "Photo: Wilfredor / Wikimedia Commons, CC0" },
        { id: "r8", src: "/game/rof/e8.jpg", answer: "ai", explain: "AI (Apple Image Playground). A beam of light pours from a cloud onto a peak, there are two identical cabins, and the mountains have a smooth, painted look.", credit: "Image: Apple Intelligence / Wikimedia Commons, public domain" },
      ],
    },
  ],
  lessons: [
    "Read every bit of text. AI still garbles signs, badges and licence plates.",
    "Check the background: crowds with repeated or melted faces are a strong AI tell.",
    "Ask “is this possible?” A perfect image of an impossible scene is fake.",
    "Real photos are often messy, and spectacular doesn't mean fake. When in doubt, look for the source.",
  ],
};

const voiceMission: Mission = {
  id: "mom-help-me",
  number: 3,
  codename: "OPERATION ECHO",
  title: "“Mom, Help Me!”",
  tagline: "Your daughter is screaming on the phone. A man demands money. You have seconds.",
  location: "Arizona, USA",
  year: 2023,
  caseId: "us-kidnap-voice-2023",
  skill: "Surviving a voice-clone scam call",
  briefing: [
    "You are Sarah. Your 15-year-old daughter Emma is at a ski practice two hours away.",
    "Your phone rings from an unknown number. In 2023, a mother in Arizona received exactly this call: her daughter's sobbing voice, then a man demanding ransom. Her daughter was safe. The voice was most likely an AI clone.",
    "In this simulation you only have a few seconds to choose each reply. Stay calm, and think.",
  ],
  stages: [
    {
      kind: "dialogue",
      title: "Incoming call",
      brief: "Choose your replies before the timer runs out.",
      maxPoints: 1000,
      secondsPerChoice: 15,
      timeoutChoice: { text: "(You freeze, unable to speak.)", next: "pressure", points: 0, feedback: "Freezing is natural. Scammers count on panic. Take a breath: you are allowed to pause." },
      start: "open",
      nodes: {
        open: {
          id: "open",
          lines: [
            { speaker: "voice", text: "Mom?! Mom, I messed up… please, please help me!" },
            { speaker: "caller", text: "Listen to me. I have your daughter. Don't call anyone. Wire US$15,000 in the next 30 minutes, or you'll never see her again." },
          ],
          choices: [
            { text: "“Okay, okay! Tell me how to send the money.”", next: "pay", points: 0, feedback: "Agreeing immediately gives the scammer full control. The panic is the weapon." },
            { text: "“Put my daughter back on. Emma — what's the name of our first dog?”", next: "question", points: 250, feedback: "Excellent. A question only the real Emma could answer is the fastest test of a cloned voice." },
            { text: "Hang up and call Emma's phone directly.", next: "callEmma", points: 550, feedback: "Great instinct. Verifying through your own channel breaks the scam." },
            { text: "“Who is this? I'm calling the police!”", next: "threat", points: 100, feedback: "Involving the police is right, but announcing it to the caller just escalates the pressure." },
          ],
        },
        pressure: {
          id: "pressure",
          lines: [
            { speaker: "caller", text: "Are you there? Every minute you waste, she suffers. Go to the store and buy gift cards. NOW." },
          ],
          choices: [
            { text: "Mute the call and text Emma and her coach from your phone.", next: "textEmma", points: 250, feedback: "Smart recovery: keep the line open while you verify in parallel." },
            { text: "Grab your keys and drive to the store.", next: "store", points: 0, feedback: "Gift cards, crypto and wire transfers are scammers' favourite payments: they are almost impossible to reverse." },
          ],
        },
        pay: {
          id: "pay",
          lines: [
            { speaker: "caller", text: "Smart. Buy gift cards — $15,000 — and read me the codes. Stay on the line the whole time. If you hang up, she pays." },
          ],
          choices: [
            { text: "Say you need to get your car keys, then text Emma and her coach.", next: "textEmma", points: 200, feedback: "Good recovery. A short excuse buys time to verify in parallel." },
            { text: "Do exactly as he says.", next: "store", points: 0, feedback: "Staying on the line is a control tactic. It stops you from checking whether Emma is actually safe." },
          ],
        },
        question: {
          id: "question",
          lines: [
            { speaker: "caller", text: "She can't talk right now!" },
            { speaker: "voice", text: "Mom, please, just do what he says… I'm so scared…" },
            { speaker: "narrator", text: "The “voice” didn't answer your question. It only repeats emotional lines." },
          ],
          choices: [
            { text: "Keep him talking while you text Emma and her coach.", next: "textEmma", points: 400, feedback: "Textbook. The clone can't answer personal questions, and you verify in parallel." },
            { text: "It's definitely her voice. Agree to pay.", next: "pay", points: 0, feedback: "Voice clones can be made from just a few seconds of audio from social media. A familiar voice is not proof." },
          ],
        },
        threat: {
          id: "threat",
          lines: [
            { speaker: "caller", text: "Call the police and she's gone. You have 25 minutes." },
          ],
          choices: [
            { text: "Hang up and call Emma's phone.", next: "callEmma", points: 300, feedback: "Right move: verify first, on your own terms." },
            { text: "Apologise and ask how to pay.", next: "pay", points: 0, feedback: "Threats are designed to make you comply. Don't let them." },
          ],
        },
        textEmma: {
          id: "textEmma",
          lines: [
            { speaker: "narrator", text: "Your phone buzzes. A text from Emma: “Mom?? I'm at practice, coach is right here. Why?” 💬" },
          ],
          choices: [
            { text: "Hang up, then report the call to the police and your phone carrier.", next: "safeReport", points: 300, feedback: "Reporting helps police link cases and warn others." },
            { text: "Hang up and forget about it — Emma's safe.", next: "safeQuiet", points: 100, feedback: "Emma's safe, but scammers will try the next family. Reporting matters." },
          ],
        },
        callEmma: {
          id: "callEmma",
          lines: [
            { speaker: "daughter", text: "Mom? I'm at practice. What's wrong? You sound panicked." },
            { speaker: "narrator", text: "Emma is safe. The voice on the first call was fake." },
          ],
          choices: [
            { text: "Report the call to the police, then agree on a family code word with Emma.", next: "safeReport", points: 400, feedback: "Perfect ending: report, and set a family code word for future emergencies." },
            { text: "Breathe, hug Emma later, and move on.", next: "safeQuiet", points: 150, feedback: "You're safe, but a report and a code word would protect you next time." },
          ],
        },
        store: {
          id: "store",
          lines: [
            { speaker: "narrator", text: "You read out $15,000 in gift card codes. The caller hangs up. Ten minutes later, Emma calls from practice — she was never in danger. The money is gone." },
          ],
          ending: { title: "Scammed", good: false },
        },
        safeReport: {
          id: "safeReport",
          lines: [
            { speaker: "narrator", text: "You report the number. Police tell you three other families got the same call this week. Your family now has a secret code word for real emergencies." },
          ],
          ending: { title: "Scam defeated", good: true },
        },
        safeQuiet: {
          id: "safeQuiet",
          lines: [
            { speaker: "narrator", text: "Emma is safe and no money was lost. The scammers move on to the next number on their list." },
          ],
          ending: { title: "Safe — but unreported", good: true },
        },
      },
    },
  ],
  lessons: [
    "Panic is the scammer's weapon. It's okay to pause and breathe.",
    "Hang up and call your loved one directly on a number you know.",
    "Ask a question only the real person could answer, and agree on a family code word.",
    "Gift cards, crypto and wire transfers are red flags. Real emergencies don't require them.",
    "A familiar voice is not proof: a few seconds of audio from social media can be enough to clone it.",
  ],
};

const electionMission: Mission = {
  id: "election-eve",
  number: 4,
  codename: "OPERATION SILENCE",
  title: "Election Eve",
  tagline: "48 hours before the vote, a shocking audio clip goes viral. The candidate can't respond.",
  location: "Central Europe",
  year: 2023,
  caseId: "sk-election-2023",
  skill: "Verifying viral political audio",
  briefing: [
    "It's two days before a national election, and the legal media blackout has begun: candidates can't campaign or respond publicly.",
    "A recording spreads on social media. It seems to capture opposition candidate Mira Novak and a journalist planning to rig the vote.",
    "In 2023, a fake clip just like this went viral in Slovakia during its pre-election silence. Your family group chat is already sharing it.",
  ],
  stages: [
    {
      kind: "observe",
      title: "Examine the post",
      brief: "Tick everything that makes this post suspicious — not just things you dislike.",
      maxPoints: 350,
      scene: "social-post",
      transcript: [
        { speaker: "@TruthLeaks_2023 · joined 3 days ago", line: "🚨 LEAKED: Novak caught planning to BUY VOTES. Share before they delete it!! 🎧 [audio 0:58]" },
        { speaker: "Audio", line: "“…we'll take care of the polling stations in the east, the money is ready…” (flat tone, even background hiss, odd pauses between words)" },
        { speaker: "Stats", line: "52,000 likes · 18,000 shares in 3 hours · posted Friday 23:40, during the media blackout" },
      ],
      items: [
        { id: "new", text: "The account was created only 3 days ago.", suspicious: true, explain: "Brand-new accounts with no history are often created just to launch disinformation." },
        { id: "timing", text: "It was posted during the media blackout, when the candidate can't respond.", suspicious: true, explain: "The timing was chosen to make debunking legally and practically hard before people vote." },
        { id: "audio", text: "The voice is flat, with even background hiss and odd pauses.", suspicious: true, explain: "Uniform noise, unnatural pauses and flat emotion are typical of synthetic or spliced audio." },
        { id: "urgent", text: "“Share before they delete it!!”", suspicious: true, explain: "Urging people to share fast is designed to beat fact-checkers." },
        { id: "likes", text: "It has 52,000 likes.", suspicious: false, explain: "Popularity is not evidence. Viral posts can be true or false — likes measure attention, not accuracy." },
        { id: "bias", text: "You already dislike this candidate's party.", suspicious: false, explain: "Your own opinion isn't evidence about the clip — but it IS a reason to be extra careful about believing it." },
      ],
    },
    {
      kind: "order",
      title: "Plan your verification",
      brief: "Put these verification steps in the best order. Tap a step to move it up.",
      maxPoints: 350,
      steps: [
        { id: "pause", text: "Pause — don't share or forward it yet.", why: "Every share spreads it further. Stopping costs nothing." },
        { id: "source", text: "Find the original uploader and the first time it appeared.", why: "Knowing who posted it first, and when, reveals a lot about intent." },
        { id: "factcheck", text: "Search trusted fact-checkers and news outlets.", why: "Professional fact-checkers (e.g. AFP Fact Check) often analyse viral clips within hours." },
        { id: "response", text: "Look for statements from the people supposedly in the recording.", why: "Both people in the real Slovak clip quickly denied it was genuine." },
        { id: "analysis", text: "Check expert or forensic analysis of the audio.", why: "Audio forensics can detect splicing and synthetic voices, but treat detector tools as one signal, not a verdict." },
        { id: "report", text: "Report the post to the platform as possible manipulated media.", why: "Reports help platforms label or limit content during sensitive periods." },
      ],
    },
    {
      kind: "choice",
      title: "Your family group chat",
      brief: "Your uncle just posted the clip with “Unbelievable!! Share everywhere!”. What do you reply?",
      maxPoints: 300,
      options: [
        { id: "share", text: "“Wow, forwarding to my friends too.”", points: 0, feedback: "Sharing unverified clips during an election can change votes, even if a correction comes later." },
        { id: "attack", text: "“You're so gullible, Uncle.”", points: 50, feedback: "Right instinct, wrong tone. Shaming people tends to make them defend the clip harder." },
        { id: "ignore", text: "Say nothing and mute the chat.", points: 80, feedback: "Not spreading it is good, but your family may still believe it." },
        { id: "kind", text: "“This was posted by a 3-day-old account during the blackout, and fact-checkers say it shows signs of AI manipulation. Let's wait for verified news before sharing.”", points: 300, feedback: "Perfect: calm, specific evidence, and an alternative action. This is how misinformation gets stopped." },
      ],
    },
  ],
  lessons: [
    "Timing is a tactic: fakes released when targets can't respond are designed to beat the truth.",
    "Popularity and your own opinions are not evidence.",
    "Pause, trace the source, then check fact-checkers before sharing.",
    "Correct people kindly, with specific evidence. It works better than shaming.",
  ],
};

export const MISSIONS: Mission[] = [heistMission, realOrFakeMission, voiceMission, electionMission];

export const MAX_MISSION_SCORE = 1000;

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

/** The missions in the player's language (English or Indonesian). */
export function missionsFor(lang: "en" | "id"): Mission[] {
  return lang === "id" ? MISSIONS_ID : MISSIONS;
}

/** The same mission in another language (falls back to the given one). */
export function localizeMission(mission: Mission, lang: "en" | "id"): Mission {
  return missionsFor(lang).find((m) => m.id === mission.id) ?? mission;
}

export const RANKS = [
  { min: 0, title: "Rookie Analyst", titleId: "Analis Pemula" },
  { min: 800, title: "Junior Investigator", titleId: "Penyelidik Muda" },
  { min: 1600, title: "Forensic Investigator", titleId: "Penyelidik Forensik" },
  { min: 2400, title: "Senior Detective", titleId: "Detektif Senior" },
  { min: 3200, title: "Chief Forensic Officer", titleId: "Kepala Forensik" },
];

export function rankFor(total: number) {
  let current = RANKS[0];
  for (const r of RANKS) if (total >= r.min) current = r;
  const next = RANKS.find((r) => r.min > total) ?? null;
  return { current, next };
}
