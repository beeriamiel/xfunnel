import { Metadata } from "next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Building2, Users, Mail, Clock, Package, Settings2, ChevronRight, Plus, Download, BarChart3, Activity, Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
  title: "Personal Settings",
  description: "Manage your personal settings and preferences",
}

export default function PersonalPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#30035e]">Personal Settings</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 col-span-2 lg:col-span-1 bg-gradient-to-b from-white to-[#f6efff]">
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-[#f9a8c9]">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile picture" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white border-[#f9a8c9] hover:bg-[#f6efff]"
                >
                  <Camera className="h-4 w-4 text-[#30035e]" />
                </Button>
              </div>
              <Badge variant="outline" className="bg-[#f6efff] text-[#30035e] border-[#f9a8c9]">
                Pro Plan
              </Badge>
            </div>

            {/* User Info Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#30035e]">Full Name</Label>
                <Input placeholder="John Doe" className="border-[#f9a8c9] focus-visible:ring-[#30035e]" />
              </div>

              <div className="space-y-2">
                <Label className="text-[#30035e]">Company</Label>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-[#f9a8c9]" />
                  <span className="text-sm text-muted-foreground">Acme Corp</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#30035e]">Role</Label>
                <Select>
                  <SelectTrigger className="border-[#f9a8c9] focus-visible:ring-[#30035e]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#30035e]">Team</Label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-[#f9a8c9]" />
                  <Input placeholder="Marketing Team" className="border-[#f9a8c9] focus-visible:ring-[#30035e]" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#30035e]">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-[#f9a8c9]" />
                  <span className="text-sm text-muted-foreground">john@acme.com</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-[#f9a8c9]" />
                  <span>Last login: Today at 9:42 AM</span>
                </div>
              </div>
            </div>

            {/* Points Display */}
            <div className="mt-6 p-4 rounded-lg bg-white border border-[#f9a8c9]">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#30035e]">Available Points</h4>
                <div className="text-2xl font-bold text-[#30035e]">1,250</div>
                <p className="text-sm text-muted-foreground">Next refresh in 15 days</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Product Settings Card */}
        <Card className="p-6 bg-gradient-to-b from-white to-[#f6efff]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-[#30035e]">Product Settings</h3>
                <p className="text-sm text-muted-foreground">Configure product analysis preferences</p>
              </div>
              <Button size="sm" variant="outline" className="border-[#f9a8c9] hover:bg-[#f6efff]">
                <Plus className="h-4 w-4 mr-2 text-[#30035e]" />
                Add Product
              </Button>
            </div>

            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {/* Product 1 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-[#f9a8c9]" />
                      <div>
                        <h4 className="font-medium text-[#30035e]">Product Analytics</h4>
                        <p className="text-xs text-muted-foreground">Main analytics dashboard</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="pl-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Include in reports</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Real-time updates</Label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Product 2 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-[#f9a8c9]" />
                      <div>
                        <h4 className="font-medium text-[#30035e]">Customer Insights</h4>
                        <p className="text-xs text-muted-foreground">Customer behavior analysis</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="pl-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Include in reports</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Real-time updates</Label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Product 3 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-[#f9a8c9]" />
                      <div>
                        <h4 className="font-medium text-[#30035e]">Market Research</h4>
                        <p className="text-xs text-muted-foreground">Competitor analysis tools</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="pl-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Include in reports</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Real-time updates</Label>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm" className="text-[#30035e] border-[#f9a8c9] hover:bg-[#f6efff]">
                <Settings2 className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
              <Button size="sm" className="bg-[#30035e] hover:bg-[#30035e]/90">
                Save Changes
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Usage & Analytics Card */}
        <Card className="p-6 bg-gradient-to-b from-white to-[#f6efff]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-[#30035e]">Usage & Analytics</h3>
                <p className="text-sm text-muted-foreground">Monitor your usage and performance</p>
              </div>
              <Button size="sm" variant="outline" className="border-[#f9a8c9] hover:bg-[#f6efff]">
                <Download className="h-4 w-4 mr-2 text-[#30035e]" />
                Export Data
              </Button>
            </div>

            {/* Period Selection */}
            <div className="flex items-center space-x-4">
              <Label className="text-sm text-[#30035e]">Time Period:</Label>
              <ToggleGroup type="single" defaultValue="7d" size="sm">
                <ToggleGroupItem value="7d" className="text-xs">7D</ToggleGroupItem>
                <ToggleGroupItem value="30d" className="text-xs">30D</ToggleGroupItem>
                <ToggleGroupItem value="90d" className="text-xs">90D</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Usage Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {/* API Calls */}
              <div className="p-4 rounded-lg bg-white/50 border border-[#f9a8c9] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-[#f9a8c9]" />
                    <span className="text-sm font-medium text-[#30035e]">API Calls</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-[#f6efff] border-[#f9a8c9]">
                    80% used
                  </Badge>
                </div>
                <Progress value={80} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>8,000 / 10,000</span>
                  <span>Resets in 15 days</span>
                </div>
              </div>

              {/* Points Earned */}
              <div className="p-4 rounded-lg bg-white/50 border border-[#f9a8c9] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-[#f9a8c9]" />
                    <span className="text-sm font-medium text-[#30035e]">Points Earned</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-[#f6efff] border-[#f9a8c9]">
                    +12% vs last period
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-[#30035e]">2,450</div>
                <div className="text-xs text-muted-foreground">
                  From API usage and engagement
                </div>
              </div>
            </div>

            {/* Usage Graph */}
            <div className="rounded-lg bg-white/50 border border-[#f9a8c9] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-[#f9a8c9]" />
                  <span className="text-sm font-medium text-[#30035e]">Usage Trends</span>
                </div>
                <Select defaultValue="api_calls">
                  <SelectTrigger className="w-[140px] h-8 text-xs border-[#f9a8c9]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_calls">API Calls</SelectItem>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                Graph will be implemented with real data
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#30035e]">24</div>
                <div className="text-xs text-muted-foreground">Active Products</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#30035e]">89%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-[#30035e]">5.2k</div>
                <div className="text-xs text-muted-foreground">Total Queries</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 