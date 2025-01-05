import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Personal Settings",
  description: "Manage your personal settings and preferences",
}

export default function PersonalPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Personal Settings</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          <p className="text-muted-foreground">Personal profile settings will be added here.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <p className="text-muted-foreground">User preferences settings will be added here.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <p className="text-muted-foreground">Notification settings will be added here.</p>
        </div>
      </div>
    </div>
  )
} 