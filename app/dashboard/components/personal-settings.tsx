'use client'

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Camera, Building2, Mail, BarChart2, Users, 
  MessageSquare, Folders, PlusCircle, CreditCard 
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function PersonalSettings() {
  return (
    <div className="w-full space-y-6">
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
                      JD
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
                <h2 className="font-semibold text-lg">John Doe</h2>
                <Badge variant="secondary" className="bg-purple-50 text-purple-900">
                  Pro Plan
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
                john@acme.com
              </motion.div>
              <motion.div 
                className="flex items-center text-muted-foreground"
                whileHover={{ x: 2 }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Acme Corp
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
                    1,250
                  </motion.div>
                  <div className="text-sm text-muted-foreground">of 2,000 credits</div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Progress value={62.5} className="h-2" />
                </motion.div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>62.5% used</span>
                  <span>Refreshes in 15 days</span>
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
                    <span className="font-medium">750 credits</span>
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
                12,458
              </motion.div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  +1,432
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
                <div className="text-2xl font-semibold">245</div>
                <div className="text-sm text-muted-foreground">Personas</div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-2xl font-semibold">156</div>
                <div className="text-sm text-muted-foreground">ICPs</div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-2xl font-semibold">89</div>
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
              Active Projects
            </div>
            <div className="space-y-2">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-semibold"
              >
                24
              </motion.div>
              <div className="text-sm text-muted-foreground">
                Last updated 2h ago
              </div>
            </div>
          </motion.div>
        </Card>
      </div>
    </div>
  )
} 