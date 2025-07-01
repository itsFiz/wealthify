import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AchievementsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">
          Track your financial milestones and accomplishments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder Achievement Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              First Goal Set
            </CardTitle>
            <CardDescription>
              Set your first financial goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="mb-2">Completed</Badge>
            <p className="text-sm text-muted-foreground">
              You&apos;ve taken the first step towards financial success!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Savings Streak
            </CardTitle>
            <CardDescription>
              Save money for 7 consecutive days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="mb-2">In Progress</Badge>
            <p className="text-sm text-muted-foreground">
              3/7 days completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Budget Master
            </CardTitle>
            <CardDescription>
              Stay within budget for a full month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="mb-2">Locked</Badge>
            <p className="text-sm text-muted-foreground">
              Complete more financial activities to unlock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              Goal Achiever
            </CardTitle>
            <CardDescription>
              Reach your first financial goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="mb-2">Locked</Badge>
            <p className="text-sm text-muted-foreground">
              Set and complete a financial goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Investment Pioneer
            </CardTitle>
            <CardDescription>
              Make your first investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="mb-2">Locked</Badge>
            <p className="text-sm text-muted-foreground">
              Start your investment journey
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              Wealth Builder
            </CardTitle>
            <CardDescription>
              Achieve a net worth milestone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="mb-2">Locked</Badge>
            <p className="text-sm text-muted-foreground">
              Build your wealth to unlock this achievement
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          More achievements coming soon! Keep tracking your finances to unlock new milestones.
        </p>
      </div>
    </div>
  );
} 