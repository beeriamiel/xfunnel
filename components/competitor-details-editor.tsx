"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/hooks/use-toast";
import { createClient } from '@/app/supabase/client';
import { Pencil, Trash, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Competitor {
  id: number;
  competitor_name: string;
}

interface CompetitorDetailsEditorProps {
  companyId: number;
  onUpdate?: () => void;
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
}

function DeleteConfirmation({ isOpen, onConfirm, onCancel, title, description }: DeleteConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CompetitorDetailsEditor({ companyId, onUpdate }: CompetitorDetailsEditorProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [deletingCompetitor, setDeletingCompetitor] = useState<Competitor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchCompetitors();
  }, [companyId]);

  async function fetchCompetitors() {
    try {
      const { data, error } = await supabase
        .from('competitors')
        .select('*')
        .eq('company_id', companyId)
        .order('competitor_name');

      if (error) throw error;
      setCompetitors(data || []);
    } catch (error) {
      console.error('Error fetching competitors:', error);
      toast({
        title: "Error loading competitors",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCompetitor(competitor: Competitor) {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', competitor.id);

      if (error) throw error;

      setCompetitors(competitors.filter(c => c.id !== competitor.id));
      toast({
        title: "Competitor deleted",
        description: "The competitor has been removed successfully"
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting competitor:', error);
      toast({
        title: "Error deleting competitor",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingCompetitor(null);
    }
  }

  async function handleSaveCompetitor(competitor: Partial<Competitor>) {
    setIsSaving(true);
    try {
      if (editingCompetitor?.id) {
        // Update existing competitor
        const { error } = await supabase
          .from('competitors')
          .update({
            competitor_name: competitor.competitor_name
          })
          .eq('id', editingCompetitor.id);

        if (error) throw error;

        setCompetitors(competitors.map(c => 
          c.id === editingCompetitor.id 
            ? { ...c, ...competitor }
            : c
        ));
      } else {
        // Create new competitor
        if (!competitor.competitor_name) {
          throw new Error('Competitor name is required');
        }

        const { data, error } = await supabase
          .from('competitors')
          .insert([{
            company_id: companyId,
            competitor_name: competitor.competitor_name
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCompetitors([...competitors, data]);
        }
      }

      setEditingCompetitor(null);
      toast({
        title: "Success",
        description: "Competitor saved successfully"
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error saving competitor:', error);
      toast({
        title: "Error saving competitor",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Competitors</CardTitle>
        <CardDescription>Manage known competitors in the market</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Competitors Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competitor Name</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell>{competitor.competitor_name}</TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCompetitor(competitor)}
                        disabled={isDeleting || isSaving}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingCompetitor(competitor)}
                        disabled={isDeleting || isSaving}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add New Competitor Button */}
          <Button
            variant="outline"
            onClick={() => setEditingCompetitor({ id: 0, competitor_name: '' })}
            disabled={isDeleting || isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Competitor
          </Button>

          {/* Edit Competitor Dialog */}
          <Dialog open={!!editingCompetitor} onOpenChange={(open) => !open && setEditingCompetitor(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCompetitor?.id ? 'Edit Competitor' : 'Add New Competitor'}</DialogTitle>
                <DialogDescription>
                  {editingCompetitor?.id ? 'Modify the competitor details below' : 'Enter the details for the new competitor'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label>Competitor Name</label>
                  <Input
                    value={editingCompetitor?.competitor_name || ''}
                    onChange={(e) => setEditingCompetitor(prev => prev ? { ...prev, competitor_name: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingCompetitor(null)}>
                  Cancel
                </Button>
                <Button onClick={() => editingCompetitor && handleSaveCompetitor(editingCompetitor)}>
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <DeleteConfirmation
            isOpen={!!deletingCompetitor}
            onConfirm={() => deletingCompetitor && handleDeleteCompetitor(deletingCompetitor)}
            onCancel={() => setDeletingCompetitor(null)}
            title="Delete Competitor"
            description="Are you sure you want to delete this competitor? This action cannot be undone."
          />
        </div>
      </CardContent>
    </Card>
  );
} 