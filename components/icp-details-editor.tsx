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
import { Pencil, Trash, Plus, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Persona {
  id: number;
  title: string;
  seniority_level: string;
  department: string;
}

interface ICP {
  id: number;
  vertical: string;
  company_size: string;
  region: string;
  personas: Persona[];
}

const VALID_COMPANY_SIZES = [
  'smb_under_500',
  'mid_market_500_1000',
  'enterprise_1000_5000',
  'large_enterprise_5000_plus'
] as const;

const VALID_REGIONS = [
  'north_america',
  'europe',
  'asia_pacific',
  'middle_east',
  'latin_america'
] as const;

const VALID_SENIORITY_LEVELS = [
  'c_level',
  'vp_level',
  'director_level',
  'manager_level'
] as const;

interface ICPDetailsEditorProps {
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

interface EditingPersona extends Persona {
  icpId: number;
}

export function ICPDetailsEditor({ companyId, onUpdate }: ICPDetailsEditorProps) {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingICP, setEditingICP] = useState<ICP | null>(null);
  const [editingPersona, setEditingPersona] = useState<EditingPersona | null>(null);
  const [deletingICP, setDeletingICP] = useState<ICP | null>(null);
  const [deletingPersona, setDeletingPersona] = useState<{ icp: ICP, persona: Persona } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchICPs();
  }, [companyId]);

  async function fetchICPs() {
    try {
      const { data, error } = await supabase
        .from('ideal_customer_profiles')
        .select(`
          id,
          vertical,
          company_size,
          region,
          personas (
            id,
            title,
            seniority_level,
            department
          )
        `)
        .eq('company_id', companyId)
        .order('id');

      if (error) throw error;
      setIcps(data || []);
    } catch (error) {
      console.error('Error fetching ICPs:', error);
      toast({
        title: "Error loading ICPs",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteICP(icp: ICP) {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('ideal_customer_profiles')
        .delete()
        .eq('id', icp.id);

      if (error) throw error;

      setIcps(icps.filter(i => i.id !== icp.id));
      toast({
        title: "ICP deleted",
        description: "The ICP has been removed successfully"
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting ICP:', error);
      toast({
        title: "Error deleting ICP",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingICP(null);
    }
  }

  async function handleSaveICP(icp: Partial<ICP>) {
    setIsSaving(true);
    try {
      if (editingICP?.id) {
        // Update existing ICP
        const { error } = await supabase
          .from('ideal_customer_profiles')
          .update({
            vertical: icp.vertical,
            company_size: icp.company_size,
            region: icp.region
          })
          .eq('id', editingICP.id);

        if (error) throw error;

        setIcps(icps.map(i => 
          i.id === editingICP.id 
            ? { ...i, ...icp }
            : i
        ));
      } else {
        // Create new ICP
        const { data, error } = await supabase
          .from('ideal_customer_profiles')
          .insert({
            company_id: companyId,
            vertical: icp.vertical || '',
            company_size: icp.company_size || 'smb_under_500',
            region: icp.region || 'north_america',
            created_by_batch: false
          })
          .select('*, personas(*)')
          .single();

        if (error) throw error;
        if (data) {
          setIcps([...icps, { ...data, personas: [] }]);
        }
      }

      setEditingICP(null);
      toast({
        title: "Success",
        description: "ICP saved successfully"
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error saving ICP:', error);
      toast({
        title: "Error saving ICP",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSavePersona(persona: Partial<EditingPersona>) {
    if (!persona.icpId) {
      toast({
        title: "Error saving persona",
        description: "Invalid ICP selected",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingPersona?.id) {
        // Update existing persona
        const { error } = await supabase
          .from('personas')
          .update({
            title: persona.title,
            seniority_level: persona.seniority_level,
            department: persona.department
          })
          .eq('id', editingPersona.id);

        if (error) throw error;

        setIcps(icps.map(icp => 
          icp.id === persona.icpId
            ? {
                ...icp,
                personas: icp.personas.map(p =>
                  p.id === editingPersona.id
                    ? { ...p, ...persona }
                    : p
                )
              }
            : icp
        ));
      } else {
        // Create new persona
        const { data, error } = await supabase
          .from('personas')
          .insert({
            icp_id: persona.icpId,
            title: persona.title || '',
            seniority_level: persona.seniority_level || 'manager_level',
            department: persona.department || ''
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setIcps(icps.map(icp =>
            icp.id === persona.icpId
              ? { ...icp, personas: [...icp.personas, data] }
              : icp
          ));
        }
      }

      setEditingPersona(null);
      toast({
        title: "Success",
        description: "Persona saved successfully"
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error saving persona:', error);
      toast({
        title: "Error saving persona",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePersona(icp: ICP, persona: Persona) {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('id', persona.id);

      if (error) throw error;

      setIcps(icps.map(i =>
        i.id === icp.id
          ? { ...i, personas: i.personas.filter(p => p.id !== persona.id) }
          : i
      ));

      toast({
        title: "Persona deleted",
        description: "The persona has been removed successfully"
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting persona:', error);
      toast({
        title: "Error deleting persona",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingPersona(null);
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
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit ICPs and Personas</CardTitle>
        <CardDescription>Modify existing ICPs or add new ones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* ICPs Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vertical</TableHead>
                <TableHead>Company Size</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {icps.map((icp) => (
                <TableRow key={icp.id}>
                  <TableCell>{icp.vertical}</TableCell>
                  <TableCell>{formatCompanySize(icp.company_size)}</TableCell>
                  <TableCell>{formatRegion(icp.region)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {icp.personas.map((persona) => (
                        <div key={persona.id} className="flex items-center justify-between text-sm">
                          <span>{persona.title}</span>
                          <div className="space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPersona({ ...persona, icpId: icp.id })}
                              disabled={isDeleting || isSaving}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingPersona({ icp, persona })}
                              disabled={isDeleting || isSaving}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setEditingPersona({ 
                          id: 0, 
                          title: '', 
                          seniority_level: 'manager_level', 
                          department: '',
                          icpId: icp.id 
                        })}
                        disabled={isDeleting || isSaving}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Persona
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingICP(icp)}
                        disabled={isDeleting || isSaving}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingICP(icp)}
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

          {/* Add New ICP Button */}
          <Button
            variant="outline"
            onClick={() => setEditingICP({ id: 0, vertical: '', company_size: 'smb_under_500', region: 'north_america', personas: [] })}
            disabled={isDeleting || isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New ICP
          </Button>

          {/* Edit ICP Dialog */}
          <Dialog open={!!editingICP} onOpenChange={(open) => !open && setEditingICP(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingICP?.id ? 'Edit ICP' : 'Add New ICP'}</DialogTitle>
                <DialogDescription>
                  {editingICP?.id ? 'Modify the ICP details below' : 'Enter the details for the new ICP'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label>Vertical</label>
                  <Input
                    value={editingICP?.vertical || ''}
                    onChange={(e) => setEditingICP(prev => prev ? { ...prev, vertical: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <label>Company Size</label>
                  <Select
                    value={editingICP?.company_size}
                    onValueChange={(value) => setEditingICP(prev => prev ? { ...prev, company_size: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {formatCompanySize(size)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Region</label>
                  <Select
                    value={editingICP?.region}
                    onValueChange={(value) => setEditingICP(prev => prev ? { ...prev, region: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {formatRegion(region)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingICP(null)}>
                  Cancel
                </Button>
                <Button onClick={() => editingICP && handleSaveICP(editingICP)}>
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Persona Dialog */}
          <Dialog open={!!editingPersona} onOpenChange={(open) => !open && setEditingPersona(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPersona?.id ? 'Edit Persona' : 'Add New Persona'}</DialogTitle>
                <DialogDescription>
                  {editingPersona?.id ? 'Modify the persona details below' : 'Enter the details for the new persona'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label>Title</label>
                  <Input
                    value={editingPersona?.title || ''}
                    onChange={(e) => setEditingPersona(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <label>Seniority Level</label>
                  <Select
                    value={editingPersona?.seniority_level}
                    onValueChange={(value) => setEditingPersona(prev => prev ? { ...prev, seniority_level: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_SENIORITY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {formatSeniorityLevel(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Department</label>
                  <Input
                    value={editingPersona?.department || ''}
                    onChange={(e) => setEditingPersona(prev => prev ? { ...prev, department: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPersona(null)}>
                  Cancel
                </Button>
                <Button onClick={() => editingPersona && handleSavePersona(editingPersona)}>
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmations */}
          <DeleteConfirmation
            isOpen={!!deletingICP}
            onConfirm={() => deletingICP && handleDeleteICP(deletingICP)}
            onCancel={() => setDeletingICP(null)}
            title="Delete ICP"
            description="Are you sure you want to delete this ICP? This action cannot be undone and will also delete all associated personas."
          />

          <DeleteConfirmation
            isOpen={!!deletingPersona}
            onConfirm={() => deletingPersona && handleDeletePersona(deletingPersona.icp, deletingPersona.persona)}
            onCancel={() => setDeletingPersona(null)}
            title="Delete Persona"
            description="Are you sure you want to delete this persona? This action cannot be undone."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function formatCompanySize(size: string): string {
  return size
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Smb', 'SMB');
}

function formatRegion(region: string): string {
  return region
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatSeniorityLevel(level: string): string {
  return level
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 