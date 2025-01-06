import { Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions and help",
}

const faqs = [
  {
    question: "What is xFunnel?",
    answer: "xFunnel is an AI-powered analytics platform that helps you understand and optimize your business performance through advanced data analysis and insights.",
  },
  {
    question: "How does the AI Engine work?",
    answer: "Our AI Engine uses advanced machine learning algorithms to analyze your data, identify patterns, and generate actionable insights to help improve your business performance.",
  },
  {
    question: "What is Citation Analysis?",
    answer: "Citation Analysis is a premium feature that helps you track and analyze references and citations across your content, helping you understand the impact and reach of your work.",
  },
]

export default function FAQsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-1">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
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
        </div>
      </div>
    </div>
  )
} 