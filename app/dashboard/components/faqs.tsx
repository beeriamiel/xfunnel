'use client'

import { Card } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQsProps {
  accountId: string;
}

const faqs = [
  {
    question: "What is xFunnel?",
    answer: "xFunnel is an AI search optimization and analytics platform that helps businesses understand and improve their visibility in AI-driven search results. Our platform simulates thousands of real-world AI search queries to help you understand how your brand appears in tools like ChatGPT, Google SGE, and other AI platforms.",
  },
  {
    question: "How does xFunnel's AI Engine work?",
    answer: "Our AI Engine simulates thousands of relevant questions across different buyer personas, geographies, and use cases—mimicking genuine B2B buying journeys. It analyzes responses from various AI models, tracks brand mentions, and provides actionable insights to improve your visibility in AI-generated recommendations.",
  },
  {
    question: "Why is AI search optimization important?",
    answer: "As AI-driven search tools like ChatGPT and Google's SGE become more prevalent, traditional SEO isn't enough. These AI tools produce direct, conversational answers from different sources than classic search results. Without proper optimization, your business might be missing or misrepresented in these AI-generated responses.",
  },
  {
    question: "What kind of insights does xFunnel provide?",
    answer: "xFunnel tracks which companies and products are mentioned in AI responses, measures your ranking relative to competitors, analyzes citation patterns, and identifies content gaps. We provide actionable recommendations for creating new content, optimizing existing pages, and improving technical aspects to enhance your AI visibility.",
  },
  {
    question: "How does xFunnel complement existing marketing efforts?",
    answer: "xFunnel works alongside your existing SEO and marketing initiatives. While traditional SEO focuses on search engine rankings, we help you optimize for AI-driven search results. Our platform provides specific recommendations that your marketing team or agency can implement to improve visibility across AI platforms.",
  },
  {
    question: "What makes xFunnel unique?",
    answer: "Unlike traditional SEO tools, xFunnel specifically focuses on AI-driven search optimization. We provide transparency into the 'black box' of AI search results, helping you understand exactly how and why AI models reference your brand, and what you can do to improve your visibility.",
  }
]

export function FAQs({ accountId }: FAQsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-1">
      <Card className="p-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  )
} 