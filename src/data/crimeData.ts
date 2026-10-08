export interface CrimeData {
  id: string;
  country: string;
  continent: string;
  location: [number, number]; // [lat, lng]
  title: string;
  description: string;
  newsLink: string;
  type: 'Voice Scam' | 'Election Hoax' | 'Identity Theft' | 'Financial Fraud' | 'Pornography';
  year: number;
}

export const crimeData: CrimeData[] = [
  { id: "1", country: "Slovakia", continent: "Europe", location: [48.669, 19.699], title: "Election Audio Deepfake", description: "Fake audio of a candidate plotting to rig the election went viral days before voting.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2023 },
  { id: "2", country: "UK", continent: "Europe", location: [55.378, -3.436], title: "CEO Voice Cloning", description: "Scammers used AI to mimic a CEO's voice, tricking a manager into transferring $243,000.", newsLink: "https://example.com/news", type: "Financial Fraud", year: 2019 },
  { id: "3", country: "Indonesia", continent: "Asia", location: [-0.789, 113.921], title: "Presidential Candidate Deepfake", description: "AI-generated video showing a candidate speaking a foreign language they don't know fluently.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2024 },
  { id: "4", country: "USA", continent: "North America", location: [37.09, -95.71], title: "Robocall Biden Fake", description: "AI-generated voice resembling the President told voters to stay home during primaries.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2024 },
  { id: "5", country: "India", continent: "Asia", location: [20.593, 78.962], title: "Actress Deepfake Video", description: "A popular actress's face was morphed onto another woman's body in a viral video.", newsLink: "https://example.com/news", type: "Pornography", year: 2023 },
  { id: "6", country: "Hong Kong", continent: "Asia", location: [22.319, 114.169], title: "Deepfake Video Conference", description: "Finance worker tricked into paying $25M after a video call with deepfaked 'colleagues'.", newsLink: "https://example.com/news", type: "Financial Fraud", year: 2024 },
  { id: "7", country: "Brazil", continent: "South America", location: [-14.235, -51.925], title: "News Anchor Voice Clone", description: "Famous TV presenter's voice cloned to endorse a fake investment scheme.", newsLink: "https://example.com/news", type: "Financial Fraud", year: 2023 },
  { id: "8", country: "Japan", continent: "Asia", location: [36.204, 138.252], title: "Prime Minister AI Video", description: "Fake video of the PM making inappropriate remarks broadcasted on social media.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2023 },
  { id: "9", country: "South Korea", continent: "Asia", location: [35.907, 127.766], title: "K-Pop Idol Deepfakes", description: "Widespread issue of idol faces being placed onto inappropriate content.", newsLink: "https://example.com/news", type: "Pornography", year: 2022 },
  { id: "10", country: "Canada", continent: "North America", location: [56.13, -106.34], title: "Grandparent Scam", description: "Elderly couple scammed out of savings by an AI voice cloning their grandson in distress.", newsLink: "https://example.com/news", type: "Voice Scam", year: 2023 },
  { id: "11", country: "Australia", continent: "Oceania", location: [-25.274, 133.775], title: "Fake Government Official", description: "Deepfake video of a health official giving false advice during a crisis.", newsLink: "https://example.com/news", type: "Identity Theft", year: 2022 },
  { id: "12", country: "Germany", continent: "Europe", location: [51.165, 10.451], title: "Corporate Sabotage", description: "AI voice used to impersonate executive, instructing employees to delete critical files.", newsLink: "https://example.com/news", type: "Financial Fraud", year: 2021 },
  { id: "13", country: "France", continent: "Europe", location: [46.227, 2.213], title: "Political Smear Campaign", description: "Deepfake images of a politician engaging in illegal activities circulated online.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2022 },
  { id: "14", country: "Italy", continent: "Europe", location: [41.871, 12.567], title: "Fake Celebrity Endorsement", description: "AI-generated video of an athlete promoting a crypto scam.", newsLink: "https://example.com/news", type: "Financial Fraud", year: 2023 },
  { id: "15", country: "Spain", continent: "Europe", location: [40.463, -3.749], title: "School Deepfake Incident", description: "Teenagers created fake inappropriate images of their classmates using AI.", newsLink: "https://example.com/news", type: "Pornography", year: 2023 },
  { id: "16", country: "Mexico", continent: "North America", location: [23.634, -102.55], title: "Cartel Propaganda", description: "AI used to create fake videos of rival gang members confessing to crimes.", newsLink: "https://example.com/news", type: "Identity Theft", year: 2024 },
  { id: "17", country: "South Africa", continent: "Africa", location: [-30.559, 22.937], title: "Fake News Broadcast", description: "AI-generated news anchor reporting false economic collapse.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2023 },
  { id: "18", country: "Nigeria", continent: "Africa", location: [9.082, 8.675], title: "Romance Scam Clone", description: "Scammers used real-time video deepfakes to trick victims on dating apps.", newsLink: "https://example.com/news", type: "Identity Theft", year: 2022 },
  { id: "19", country: "Argentina", continent: "South America", location: [-38.416, -63.616], title: "Candidate Fake Audio", description: "AI audio leaked to damage a presidential candidate's reputation.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2023 },
  { id: "20", country: "Philippines", continent: "Asia", location: [12.879, 121.774], title: "Reporter Impersonation", description: "Deepfake of a trusted journalist reporting a fake natural disaster.", newsLink: "https://example.com/news", type: "Identity Theft", year: 2023 },
  { id: "21", country: "Russia", continent: "Europe", location: [61.524, 105.318], title: "Fake Surrender Video", description: "Deepfake video of a leader allegedly calling for troops to surrender.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2022 },
  { id: "22", country: "Ukraine", continent: "Europe", location: [48.379, 31.165], title: "Counter-Deepfake", description: "Similar fake video incidents used in information warfare.", newsLink: "https://example.com/news", type: "Election Hoax", year: 2022 },
  { id: "23", country: "Singapore", continent: "Asia", location: [1.352, 103.819], title: "Bank Executive Clone", description: "Sophisticated voice clone used to authorize fraudulent high-value transfers.", newsLink: "https://example.com/news", type: "Financial Fraud", year: 2024 },
  { id: "24", country: "Malaysia", continent: "Asia", location: [4.21, 101.975], title: "Fake Investment Guru", description: "AI-generated videos of a financial expert promoting a Ponzi scheme.", newsLink: "https://example.com/news", type: "Financial Fraud", year: 2023 },
  { id: "25", country: "Thailand", continent: "Asia", location: [15.87, 100.992], title: "Royal Family Hoax", description: "AI-generated audio falsely attributed to a high-ranking official.", newsLink: "https://example.com/news", type: "Identity Theft", year: 2024 },
  { id: "26", country: "Vietnam", continent: "Asia", location: [14.058, 108.277], title: "E-commerce Fraud", description: "Deepfaked live streamers selling counterfeit goods on social platforms.", newsLink: "https://example.com/news", type: "Financial Fraud", year: 2023 },
  { id: "27", country: "Egypt", continent: "Africa", location: [26.82, 30.802], title: "Fake Cleric Video", description: "AI video of a religious figure making controversial statements.", newsLink: "https://example.com/news", type: "Identity Theft", year: 2023 },
  { id: "28", country: "Turkey", continent: "Asia", location: [38.963, 35.243], title: "Earthquake Relief Scam", description: "AI-generated pleas for help to divert donations to fraudulent accounts.", newsLink: "https://example.com/news", type: "Voice Scam", year: 2023 },
  { id: "29", country: "Colombia", continent: "South America", location: [4.57, -74.297], title: "Police Chief Deepfake", description: "Fake video of a police chief announcing non-existent curfews.", newsLink: "https://example.com/news", type: "Identity Theft", year: 2022 },
  { id: "30", country: "Chile", continent: "South America", location: [-35.675, -71.543], title: "Kidnapping Voice Scam", description: "AI voice cloning used in terrifying virtual kidnapping extortion calls.", newsLink: "https://example.com/news", type: "Voice Scam", year: 2024 }
];
