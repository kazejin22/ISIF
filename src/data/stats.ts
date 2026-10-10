// Sourced statistics shown across the site. Keep wording faithful to the source.

export interface SourcedStat {
  value: string;
  label: string;
  source: string;
  href: string;
}

export const deepfakeStats = {
  fraudAttempts: {
    value: "31×",
    label: "Rise in deepfake fraud attempts in 2023 (≈3,000%)",
    source: "Onfido Identity Fraud Report 2024",
    href: "https://thenextweb.com/news/deepfake-fraud-rise-amid-cheap-generative-ai-boom",
  },
  detectedDeepfakes: {
    value: "10×",
    label: "More deepfakes detected globally, 2022 → 2023",
    source: "Sumsub Identity Fraud Report 2023",
    href: "https://sumsub.com/newsroom/sumsub-research-global-deepfake-incidents-surge-tenfold-from-2022-to-2023/",
  },
  nonConsensual: {
    value: "96%",
    label: "Of deepfake videos online were non-consensual porn (2019)",
    source: "Deeptrace, The State of Deepfakes",
    href: "https://www.siliconrepublic.com/enterprise/deepfakes-non-consensual-porn-research-deeptrace",
  },
  fraudForecast: {
    value: "$40B",
    label: "Projected US fraud losses enabled by generative AI by 2027",
    source: "Deloitte Center for Financial Services",
    href: "https://www.deloitte.com/us/en/insights/industry/financial-services/deepfake-banking-fraud-risk-on-the-rise.html",
  },
  voiceScams: {
    value: "1 in 4",
    label: "Adults hit by an AI voice scam, or know someone who was",
    source: "McAfee, The Artificial Imposter (2023)",
    href: "https://tech.co/news/ai-voice-cloning-scams",
  },
} satisfies Record<string, SourcedStat>;
