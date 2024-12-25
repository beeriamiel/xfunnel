"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ResultRow } from "@/app/company-actions";

interface ResultsTableProps {
  results: ResultRow[];
}

const ENGINES = ["perplexity", "gemini", "claude", "openai", "google_search"];

export function ResultsTable({ results }: ResultsTableProps) {
  if (!results.length) return null;

  return (
    <ScrollArea className="w-full h-[600px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Journey Phase</TableHead>
            <TableHead className="w-[300px]">Question</TableHead>
            {ENGINES.map(engine => (
              <React.Fragment key={engine}>
                <TableHead className="min-w-[300px]">
                  {engine.charAt(0).toUpperCase() + engine.slice(1).replace('_', ' ')}
                </TableHead>
                <TableHead className="min-w-[200px]">
                  {engine.charAt(0).toUpperCase() + engine.slice(1).replace('_', ' ')} Citations
                </TableHead>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Badge variant="outline">
                  {row.buyer_journey_phase}
                </Badge>
              </TableCell>
              <TableCell>{row.query_text}</TableCell>
              {ENGINES.map(engine => (
                <React.Fragment key={engine}>
                  <TableCell>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="response">
                        <AccordionTrigger>View Response</AccordionTrigger>
                        <AccordionContent>
                          {row.responses[engine]?.response_text || 'No response'}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TableCell>
                  <TableCell>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="citations">
                        <AccordionTrigger>View Citations</AccordionTrigger>
                        <AccordionContent>
                          {row.responses[engine]?.citations?.length ? (
                            <ul className="list-disc pl-4">
                              {row.responses[engine].citations.map((citation, cidx) => (
                                <li key={cidx}>
                                  <a 
                                    href={citation} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {citation}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            'No citations'
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
} 