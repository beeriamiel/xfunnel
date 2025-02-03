'use client'

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Camera, Building2, Mail, BarChart2, Users, 
  MessageSquare, Folders, PlusCircle, CreditCard, Pencil, Check, X 
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { createClient } from "@/app/supabase/client"

interface PersonalSettingsProps {
  accountId: string;
  accountData: {
    name: string;
    plan_type: string;
    monthly_credits_available: number;
    monthly_credits_used: number;
    credits_renewal_date: string;
  };
  companyData: {
    name: string;
  };
  userData: {
    user_name: string | null;
  };
  analysisCoverage: {
    icp_count: number;
    persona_count: number;
    region_count: number;
  };
  responseStats: {
    total_responses: number;
    responses_this_month: number;
    last_activity: string | null;
  };
}

export function PersonalSettings({ 
  accountId, 
  accountData,
  companyData,
  userData,
  analysisCoverage,
  responseStats
}: PersonalSettingsProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userData.user_name || '');
  const supabase = createClient();

  // Calculate credits percentage
  const totalCredits = accountData.monthly_credits_available;
  const usedCredits = accountData.monthly_credits_used;
  const creditsPercentage = (usedCredits / totalCredits) * 100;

  // Calculate days until renewal
  const daysUntilRenewal = accountData.credits_renewal_date ? 
    Math.ceil((new Date(accountData.credits_renewal_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 
    0;

  // Format email from account name (remove "'s Account" suffix)
  const email = accountData.name.replace(/'s Account$/, '');

  async function handleUpdateName() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const { error } = await supabase
        .from('account_users')
        .update({ user_name: editedName || null })
        .eq('account_id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
    }
  }

  return (
    <div className="w-full space-y-6 px-6">
      {/* Top Section: Profile and Credits */}
      <div className="grid grid-cols-12 gap-6">
        {/* Profile Card */}
        <Card className="col-span-3 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 space-y-6"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-900 text-xl">
                      {userData.user_name ? userData.user_name.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div whileHover={{ rotate: 15 }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white shadow-md hover:bg-purple-50"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              </div>
              
              <div className="mt-4 space-y-1">
                <div className="relative group">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-7 text-center"
                        placeholder="Enter your name"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateName();
                          if (e.key === 'Escape') setIsEditingName(false);
                        }}
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={handleUpdateName}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setIsEditingName(false)}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <h2 className="font-semibold text-lg flex items-center justify-center gap-2">
                      {userData.user_name || 'Update your name'}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                        onClick={() => setIsEditingName(true)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </h2>
                  )}
                </div>
                <Badge variant="secondary" className="bg-purple-50 text-purple-900">
                  {accountData.plan_type}
                </Badge>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 text-sm"
            >
              <motion.div 
                className="flex items-center text-muted-foreground"
                whileHover={{ x: 2 }}
              >
                <Mail className="h-4 w-4 mr-2" />
                {email}
              </motion.div>
              <motion.div 
                className="flex items-center text-muted-foreground"
                whileHover={{ x: 2 }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                {companyData.name}
              </motion.div>
            </motion.div>

            <div className="text-xs text-muted-foreground">
              Last active: Today at 2:30 PM
            </div>
          </motion.div>
        </Card>

        {/* Credits Card */}
        <Card className="col-span-9 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  Available Credits
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your credits refresh automatically each month
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add More Credits
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-bold text-purple-900"
                  >
                    {usedCredits}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">of {totalCredits} credits</div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Progress value={creditsPercentage} className="h-2" />
                </motion.div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{creditsPercentage.toFixed(1)}% used</span>
                  <span>Refreshes in {daysUntilRenewal} days</span>
                </div>
              </div>

              <div className="space-y-2 border-l pl-8">
                <div className="text-sm text-muted-foreground">Usage Breakdown</div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="font-medium">{usedCredits} credits</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Month</span>
                    <span className="font-medium">1,890 credits</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Monthly</span>
                    <span className="font-medium">1,650 credits</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total Responses */}
        <Card className="p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <MessageSquare className="h-4 w-4" />
              </motion.div>
              Total Responses
            </div>
            <div className="space-y-2">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-semibold"
              >
                {responseStats.total_responses.toLocaleString()}
              </motion.div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  +{responseStats.responses_this_month.toLocaleString()}
                </Badge>
                <span className="text-sm text-muted-foreground">This Month</span>
              </div>
            </div>
          </motion.div>
        </Card>

        {/* Analysis Coverage */}
        <Card className="p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Users className="h-4 w-4" />
              </motion.div>
              Analysis Coverage
            </div>
            <div className="grid grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-2xl font-semibold">{analysisCoverage.persona_count}</div>
                <div className="text-sm text-muted-foreground">Personas</div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-2xl font-semibold">{analysisCoverage.icp_count}</div>
                <div className="text-sm text-muted-foreground">ICPs</div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-2xl font-semibold">{analysisCoverage.region_count}</div>
                <div className="text-sm text-muted-foreground">Regions</div>
              </motion.div>
            </div>
          </motion.div>
        </Card>

        {/* Active Projects */}
        <Card className="p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Folders className="h-4 w-4" />
              </motion.div>
              Last Activity
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {responseStats.last_activity ? (
                  <>Last active: {new Date(responseStats.last_activity).toLocaleString()}</>
                ) : (
                  'No activity yet'
                )}
              </div>
            </div>
          </motion.div>
        </Card>
      </div>
    </div>
  )
} 