"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is it ethical to use AI to resurrect a deceased actor in a movie?",
    answer: "This is a heavily debated topic. Proponents argue it honors their legacy and fulfills artistic vision, while critics argue it violates the deceased's consent and exploits their image for profit. Ethical guidelines suggest requiring explicit consent from the estate and clear disclosures to the audience."
  },
  {
    question: "Should deepfake technology be completely banned?",
    answer: "A complete ban is nearly impossible to enforce and would stifle beneficial uses of the technology (e.g., in medical simulations, dubbing, or creative arts). Instead, experts advocate for strict regulations, digital watermarking, and criminalizing malicious uses like non-consensual pornography and fraud."
  },
  {
    question: "Who is responsible when an AI-generated hoax causes financial damage?",
    answer: "Currently, liability is a legal gray area. Responsibility could fall on the creator of the deepfake, the platform that failed to moderate it, or even the developers of the AI tool if they didn't implement safety guardrails. Lawmakers worldwide are rushing to establish clear accountability frameworks."
  },
  {
    question: "Does labeling a deepfake as 'parody' make it harmless?",
    answer: "Not necessarily. Even when labeled as a parody, deepfakes can be clipped out of context and shared maliciously. The psychological impact on the victim can also be severe regardless of the label. Clear, unremovable watermarks are considered a better approach."
  }
];

export default function EthicsFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
              isOpen ? "bg-foreground/5 border-primary/30" : "bg-transparent border-foreground/10 hover:border-foreground/30"
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className="font-bold text-lg">{faq.question}</span>
              <ChevronDown 
                className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-foreground/50"}`} 
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-6 pt-0 text-foreground/70 leading-relaxed border-t border-foreground/5 mt-2">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
