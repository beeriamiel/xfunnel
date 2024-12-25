import { hasEnvVars } from "@/utils/supabase/check-env-vars"
import { GenerateICPsButton } from "@/components/generate-icps-button"
import { GenerateQuestionsButton } from "@/components/generate-questions-button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"

export default async function ProtectedPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 overflow-hidden p-6">
        <div className="flex flex-col space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
            <p className="text-muted-foreground">
              Generate ICPs and interview questions using AI
            </p>
          </div>

          {hasEnvVars ? (
            <div className="space-y-8">
              {/* Primary Option */}
              <section>
                <h3 className="text-lg font-medium mb-4">Generate ICPs and Questions</h3>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-6">
                    Recommended: Generate Ideal Customer Profiles (ICPs) first, then automatically create targeted questions for each persona.
                  </p>
                  <GenerateICPsButton />
                </Card>
              </section>
            </div>
          ) : (
            <div className="text-muted-foreground">
              Please update your environment variables to continue
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
