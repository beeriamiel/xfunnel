'use client'

import { Card } from "@/components/ui/card"

export function PersonalSettings() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Profile</h3>
        <p className="text-muted-foreground">Personal profile settings will be added here.</p>
      </Card>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <p className="text-muted-foreground">User preferences settings will be added here.</p>
      </Card>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <p className="text-muted-foreground">Notification settings will be added here.</p>
      </Card>
    </div>
  )
} 