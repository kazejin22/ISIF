// Documented deepfake incidents. Every entry links to a news report or
// fact-check that was verified to open (checked October 2026).
// Coordinates point to the city most associated with the case.

export type CrimeType =
  | "Voice Scam"
  | "Financial Fraud"
  | "Political Disinformation"
  | "Non-consensual Imagery"
  | "Impersonation";

export type CrimeMedium = "Audio" | "Video" | "Image" | "Video call";

export interface CrimeData {
  id: string;
  country: string;
  continent: string;
  location: [number, number]; // [lat, lng]
  title: string;
  description: string;
  newsLink: string;
  source: string;
  type: CrimeType;
  medium: CrimeMedium;
  year: number;
}

export const crimeData: CrimeData[] = [
  {
    id: "hk-arup-2024", country: "Hong Kong", continent: "Asia", location: [22.319, 114.169],
    title: "Deepfake Video Conference Heist",
    description: "An Arup finance employee joined a video call where the CFO and colleagues were all deepfakes, then made 15 transfers totalling about US$25 million. Arup later confirmed fake voices and images were used.",
    newsLink: "https://edition.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk/index.html",
    source: "CNN", type: "Financial Fraud", medium: "Video call", year: 2024,
  },
  {
    id: "uk-ceo-voice-2019", country: "United Kingdom", continent: "Europe", location: [51.507, -0.128],
    title: "CEO Voice Clone Wire Fraud",
    description: "The CEO of a UK energy firm wired €220,000 (~US$243,000) after a phone call from an AI-cloned voice imitating his boss at the German parent company, down to the slight German accent.",
    newsLink: "https://www.bitdefender.com/en-us/blog/hotforsecurity/ceo-voice-deepfake-blamed-for-scam-that-stole-243000",
    source: "Bitdefender (citing WSJ)", type: "Voice Scam", medium: "Audio", year: 2019,
  },
  {
    id: "sk-election-2023", country: "Slovakia", continent: "Europe", location: [48.148, 17.107],
    title: "Election-Eve Vote-Rigging Audio",
    description: "Two days before the 2023 election, a fake recording of opposition leader Michal Šimečka and a journalist 'discussing' how to rig the vote spread on Facebook during the pre-election media silence.",
    newsLink: "https://misinforeview.hks.harvard.edu/article/beyond-the-deepfake-hype-ai-democracy-and-the-slovak-case/",
    source: "Harvard Misinformation Review", type: "Political Disinformation", medium: "Audio", year: 2023,
  },
  {
    id: "us-biden-robocall-2024", country: "United States", continent: "North America", location: [43.208, -71.538],
    title: "Fake Biden Robocall",
    description: "New Hampshire voters got robocalls with an AI clone of President Biden's voice telling them not to vote in the primary. The consultant behind it was fined US$6 million by the FCC.",
    newsLink: "https://www.nextgov.com/artificial-intelligence/2024/09/mastermind-behind-biden-ai-robocalls-fined-6m-fcc/399857/",
    source: "Nextgov/FCW", type: "Political Disinformation", medium: "Audio", year: 2024,
  },
  {
    id: "us-swift-2024", country: "United States", continent: "North America", location: [38.907, -77.037],
    title: "Taylor Swift Explicit Deepfakes",
    description: "AI-generated explicit images of Taylor Swift were viewed millions of times on X before removal, prompting calls in the US Congress for laws against non-consensual deepfakes.",
    newsLink: "https://www.bbc.com/news/technology-68110476",
    source: "BBC News", type: "Non-consensual Imagery", medium: "Image", year: 2024,
  },
  {
    id: "us-kidnap-voice-2023", country: "United States", continent: "North America", location: [33.494, -111.926],
    title: "Fake Kidnapping With a Cloned Voice",
    description: "An Arizona mother received a call with her 15-year-old daughter's voice sobbing for help while a man demanded ransom. Her daughter was safe; the voice is believed to have been AI-cloned.",
    newsLink: "https://edition.cnn.com/2023/04/29/us/ai-scam-calls-kidnapping-cec/index.html",
    source: "CNN", type: "Voice Scam", medium: "Audio", year: 2023,
  },
  {
    id: "ca-grandparent-2023", country: "Canada", continent: "North America", location: [47.562, -52.713],
    title: "Grandparent Scam Wave",
    description: "At least eight seniors in Newfoundland lost about CA$200,000 in three days to callers they swore sounded like their grandchildren. Police and experts believe AI voice cloning was likely involved.",
    newsLink: "https://www.cbc.ca/news/canada/newfoundland-labrador/ai-vocal-cloning-grandparent-scam-1.6777106",
    source: "CBC News", type: "Voice Scam", medium: "Audio", year: 2023,
  },
  {
    id: "ua-zelensky-2022", country: "Ukraine", continent: "Europe", location: [50.450, 30.523],
    title: "Zelensky 'Surrender' Deepfake",
    description: "Hackers placed a deepfake of President Zelensky telling troops to lay down their arms on the Ukraine 24 TV website and ticker. It was quickly debunked and removed by major platforms.",
    newsLink: "https://www.npr.org/2022/03/16/1087062648/deepfake-video-zelenskyy-experts-war-manipulation-ukraine-russia",
    source: "NPR", type: "Political Disinformation", medium: "Video", year: 2022,
  },
  {
    id: "id-suharto-2024", country: "Indonesia", continent: "Asia", location: [-6.208, 106.846],
    title: "Dead Dictator 'Resurrected' for Votes",
    description: "A Golkar party official shared an AI-generated video of Suharto, who died in 2008, urging Indonesians to vote ahead of the February 2024 election. It drew millions of views and sharp criticism.",
    newsLink: "https://edition.cnn.com/2024/02/12/asia/suharto-deepfake-ai-scam-indonesia-election-hnk-intl/index.html",
    source: "CNN", type: "Political Disinformation", medium: "Video", year: 2024,
  },
  {
    id: "in-mandanna-2023", country: "India", continent: "Asia", location: [28.614, 77.209],
    title: "Actress Face-Swap Video",
    description: "A viral video swapped actor Rashmika Mandanna's face onto a British-Indian influencer's body. It drew calls for legal action, including from India's IT minister.",
    newsLink: "https://www.bbc.com/news/world-asia-india-67305557",
    source: "BBC News", type: "Non-consensual Imagery", medium: "Video", year: 2023,
  },
  {
    id: "kr-schools-2024", country: "South Korea", continent: "Asia", location: [37.566, 126.978],
    title: "Deepfake Abuse Crisis in Schools",
    description: "Telegram chatrooms turned photos of female students and teachers into sexual deepfakes; more than 500 schools and universities were reportedly targeted, triggering a police probe and tougher laws.",
    newsLink: "https://www.bbc.com/news/articles/cpdlpj9zn9go",
    source: "BBC News", type: "Non-consensual Imagery", medium: "Image", year: 2024,
  },
  {
    id: "es-almendralejo-2023", country: "Spain", continent: "Europe", location: [38.683, -6.407],
    title: "AI 'Undressing' of Schoolgirls",
    description: "In the town of Almendralejo, more than 20 girls aged 11–17 found AI-generated naked images of themselves, made from their social media photos and shared on WhatsApp and Telegram.",
    newsLink: "https://www.bbc.com/news/world-europe-66877718",
    source: "BBC News", type: "Non-consensual Imagery", medium: "Image", year: 2023,
  },
  {
    id: "cn-baotou-2023", country: "China", continent: "Asia", location: [40.658, 109.840],
    title: "Face-Swapped Friend on Video Call",
    description: "A businessman transferred 4.3 million yuan (~US$620,000) after a video call with a scammer who used AI face-swapping to look and sound like a close friend. Police in Baotou recovered most of it.",
    newsLink: "https://theprint.in/tech/deepfake-scam-in-china-fans-worries-over-ai-driven-fraud/1588163/",
    source: "ThePrint (Reuters)", type: "Financial Fraud", medium: "Video call", year: 2023,
  },
  {
    id: "jp-kishida-2023", country: "Japan", continent: "Asia", location: [35.676, 139.650],
    title: "Fake PM News Broadcast",
    description: "A fabricated video showed Prime Minister Kishida making sexual remarks under a fake Nippon TV news logo. Its creator said he made it in under an hour with free AI tools 'as a joke'.",
    newsLink: "https://www.khaosodenglish.com/news/international/2023/11/04/fake-video-of-japan-pm-making-sexual-remarks-goes-viral/",
    source: "Khaosod English (AFP)", type: "Political Disinformation", medium: "Video", year: 2023,
  },
  {
    id: "sg-lee-2023", country: "Singapore", continent: "Asia", location: [1.352, 103.820],
    title: "PM Deepfake Promotes Crypto Scam",
    description: "Prime Minister Lee Hsien Loong warned the public about deepfake videos of himself and his deputy promoting a crypto 'investment' with guaranteed returns.",
    newsLink: "https://www.scmp.com/week-asia/politics/article/3246701/singapore-pm-lee-warns-very-convincing-deepfakes-spreading-disinformation-after-fake-video-him",
    source: "South China Morning Post", type: "Impersonation", medium: "Video", year: 2023,
  },
  {
    id: "ph-marcos-2024", country: "Philippines", continent: "Asia", location: [14.599, 120.984],
    title: "Fake Presidential Attack Order",
    description: "An AI-generated audio clip of President Marcos appeared to order military action against China amid South China Sea tensions. The government called it a deepfake and ordered an NBI probe.",
    newsLink: "https://www.dzrh.com.ph/post/pco-warns-public-vs.-deep-fake-videos",
    source: "DZRH News", type: "Political Disinformation", medium: "Audio", year: 2024,
  },
  {
    id: "tr-ince-2023", country: "Turkey", continent: "Asia", location: [39.934, 32.860],
    title: "Candidate Quits Over Alleged Deepfake",
    description: "Presidential candidate Muharrem İnce withdrew days before the 2023 election after an alleged sex tape spread online; he said it was a deepfake made from footage of another man.",
    newsLink: "https://fortune.com/europe/2023/05/15/turkeys-deepfake-influenced-election-spells-trouble/",
    source: "Fortune", type: "Political Disinformation", medium: "Video", year: 2023,
  },
  {
    id: "uk-starmer-2023", country: "United Kingdom", continent: "Europe", location: [53.408, -2.991],
    title: "Opposition Leader 'Abuse' Audio",
    description: "A clip apparently of Keir Starmer swearing at staff was posted as the Labour conference opened. Fact-checkers found no evidence it was genuine, and politicians from both major parties called it a fake.",
    newsLink: "https://fullfact.org/news/keir-starmer-audio-swearing/",
    source: "Full Fact", type: "Political Disinformation", medium: "Audio", year: 2023,
  },
  {
    id: "it-meloni-2024", country: "Italy", continent: "Europe", location: [41.903, 12.496],
    title: "Prime Minister Sues Over Deepfake Porn",
    description: "Giorgia Meloni sought €100,000 in damages from two men accused of putting her face on pornographic videos that were viewed millions of times. She pledged any award to victims of violence against women.",
    newsLink: "https://www.theweek.in/news/world/2024/03/21/italian-pm-giorgia-meloni-sues-73-year-old-man-son-over-viral-deep-fake-porn-videos.html",
    source: "The Week (Reuters)", type: "Non-consensual Imagery", medium: "Video", year: 2024,
  },
  {
    id: "md-sandu-2023", country: "Moldova", continent: "Europe", location: [47.011, 28.864],
    title: "President Sandu Smear Video",
    description: "Moldova's presidency refuted an AI-made video of President Maia Sandu mocking citizens' living standards, spread through Telegram channels aimed at Russian-speaking audiences.",
    newsLink: "https://incidentdatabase.ai/cite/666/",
    source: "AI Incident Database", type: "Political Disinformation", medium: "Video", year: 2023,
  },
  {
    id: "br-bundchen-2025", country: "Brazil", continent: "South America", location: [-30.035, -51.218],
    title: "Supermodel Deepfake Ad Scam",
    description: "Police in Rio Grande do Sul arrested suspects who ran Instagram ads with deepfakes of Gisele Bündchen pushing fake giveaways and products, flagging over R$20 million in suspicious funds.",
    newsLink: "https://www.malaymail.com/news/tech-gadgets/2025/10/05/brazilian-scammers-rake-in-millions-using-gisele-bundchen-deepfakes-in-instagram-ads-to-defraud-victims/193369",
    source: "Malay Mail (Reuters)", type: "Financial Fraud", medium: "Video", year: 2025,
  },
  {
    id: "ar-election-2023", country: "Argentina", continent: "South America", location: [-34.604, -58.382],
    title: "The 'First AI Election'",
    description: "Both presidential campaigns flooded social media with AI images; Massa's campaign posted a fake video of Milei proposing a market for human organs, later deleted.",
    newsLink: "https://www.deeplearning.ai/the-batch/ai-generated-imagery-flooded-argentinas-presidential-race/",
    source: "The Batch (citing NYT)", type: "Political Disinformation", medium: "Video", year: 2023,
  },
  {
    id: "ve-avatars-2023", country: "Venezuela", continent: "South America", location: [10.481, -66.904],
    title: "AI News Anchors Spread Propaganda",
    description: "Pro-government videos featured fake English-speaking 'news anchors' built from stock AI avatars, claiming Venezuela's economy was thriving. YouTube removed the channel.",
    newsLink: "https://www.semafor.com/article/02/21/2023/venezuela-uses-ai-avatars-to-disseminate-propaganda",
    source: "Semafor", type: "Political Disinformation", medium: "Video", year: 2023,
  },
  {
    id: "za-trump-mk-2024", country: "South Africa", continent: "Africa", location: [-26.204, 28.047],
    title: "Fake Trump Endorsement",
    description: "Before the 2024 election, a doctored clip showed Donald Trump endorsing Jacob Zuma's MK Party. Fact-checkers found the audio was replaced using a celebrity voice-cloning app.",
    newsLink: "https://polity.org.za/article/expectations-versus-reality-the-use-of-generative-ai-in-south-africas-2024-election-2024-07-18",
    source: "Polity (Africa Check)", type: "Political Disinformation", medium: "Video", year: 2024,
  },
  {
    id: "ng-atiku-2023", country: "Nigeria", continent: "Africa", location: [9.076, 7.399],
    title: "'Rigging Plan' Audio Leak",
    description: "A viral clip claimed to capture candidate Atiku Abubakar and allies plotting to rig the 2023 election. Fact-checkers at TheCable found the audio was doctored.",
    newsLink: "https://factcheck.thecable.ng/fact-check-viral-audio-of-atiku-tambuwal-and-okowa-plotting-to-rig-election-is-doctored-2/",
    source: "TheCable Fact Check", type: "Political Disinformation", medium: "Audio", year: 2023,
  },
  {
    id: "ke-ruto-2024", country: "Kenya", continent: "Africa", location: [-1.286, 36.817],
    title: "President's Cloned French Speech",
    description: "A viral video made President Ruto appear to speak fluent French in Tokyo. The original footage showed him speaking English; the French audio was AI-generated.",
    newsLink: "https://incidentdatabase.ai/cite/1023/",
    source: "AI Incident Database (Africa Check)", type: "Impersonation", medium: "Video", year: 2024,
  },
  {
    id: "au-forrest-2024", country: "Australia", continent: "Oceania", location: [-31.950, 115.860],
    title: "Billionaire Deepfake Crypto Ads",
    description: "Scam ads using Andrew Forrest's likeness, including deepfake videos, ran on Facebook for months. A US judge ruled in 2024 that he can sue Meta for negligence over the ads.",
    newsLink: "https://www.storyboard18.com/agency-news/facebook-scam-ads-australian-billionaire-wins-right-to-sue-meta-34821.htm",
    source: "Storyboard18 (Reuters)", type: "Financial Fraud", medium: "Video", year: 2024,
  },
];
