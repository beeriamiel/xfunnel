'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface DetailedCompany {
  id: number;
  name: string;
  annual_revenue: string | null;
  product_category: string | null;
  industry: string | null;
  markets_operating_in: string[];
  number_of_employees: number | null;
  main_products: string[];
  created_at: string;
}

interface Competitor {
  competitor_name: string;
}

interface CompanyDetailsProps {
  company: DetailedCompany | null;
  competitors: Competitor[];
}

export function CompanyDetails({ company, competitors }: CompanyDetailsProps) {
  if (!company) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>{company.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Industry</TableCell>
                <TableCell>{company.industry || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Product Category</TableCell>
                <TableCell>{company.product_category || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Annual Revenue</TableCell>
                <TableCell>{company.annual_revenue || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Number of Employees</TableCell>
                <TableCell>{company.number_of_employees || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Markets</TableCell>
                <TableCell>{company.markets_operating_in?.length ? company.markets_operating_in.join(', ') : 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Main Products</TableCell>
                <TableCell>{company.main_products?.length ? company.main_products.join(', ') : 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Competitors */}
      <Card>
        <CardHeader>
          <CardTitle>Competitors</CardTitle>
          <CardDescription>Known competitors in the market</CardDescription>
        </CardHeader>
        <CardContent>
          {competitors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competitor Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((competitor, index) => (
                  <TableRow key={index}>
                    <TableCell>{competitor.competitor_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-sm text-muted-foreground py-4">
              No competitors found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 