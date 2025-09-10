import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Bot, Plus, Settings, Activity, Clock, FileText, Plug } from "lucide-react"
import Link from 'next/link'

export default function DashboardPage() {
    const stats = [
        {
            title: "Active Chats",
            value: "2,847",
            change: "+12%",
            trend: "up",
            icon: MessageSquare,
            description: "Total conversations this month"
        },
        {
            title: "Users Online",
            value: "1,234",
            change: "+5%",
            trend: "up",
            icon: Users,
            description: "Currently active users"
        },
        {
            title: "AI Responses",
            value: "15,672",
            change: "+23%",
            trend: "up",
            icon: Bot,
            description: "AI-generated responses today"
        },
        {
            title: "Response Time",
            value: "0.8s",
            change: "-15%",
            trend: "down",
            icon: Clock,
            description: "Average response time"
        }
    ]


    const recentActivity = [
        { user: "Sarah Chen", action: "Started new chat session", time: "2 minutes ago", status: "active" },
        { user: "Mike Johnson", action: "Completed bot training", time: "5 minutes ago", status: "completed" },
        { user: "Emma Davis", action: "Updated integration settings", time: "12 minutes ago", status: "updated" },
        { user: "Alex Rodriguez", action: "Created new document", time: "18 minutes ago", status: "created" },
    ]

    return (
        <div className="space-y-8 p-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Here&apos;s what&apos;s happening with your chat platform today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                    <Button size="sm" className="gap-2 bg-white text-black hover:bg-gray-100">
                        <Plus className="h-4 w-4" />
                        New Chat
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card
                            key={stat.title}
                            className="bg-card border-border hover:bg-card/80 transition-colors"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-card-foreground">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-card-foreground">
                                    {stat.value}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                        variant={stat.trend === "up" ? "default" : "secondary"}
                                        className={`text-xs ${
                                            stat.trend === "up"
                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        }`}
                                    >
                                        {stat.change}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest actions from your team and users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className={`w-2 h-2 rounded-full ${
                                        activity.status === 'active' ? 'bg-green-400' :
                                        activity.status === 'completed' ? 'bg-blue-400' :
                                        activity.status === 'updated' ? 'bg-yellow-400' :
                                        'bg-purple-400'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-card-foreground">
                                            {activity.user}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.action}
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {activity.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks and shortcuts
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Link href="/dashboard/documents" passHref>
                            <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                              <span className="flex items-center gap-3">
                                <FileText className="h-4 w-4" />
                                Upload Documents
                              </span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/bot" passHref>
                            <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
      <span className="flex items-center gap-3">
        <Bot className="h-4 w-4" />
        Customize Chatbot
      </span>
                            </Button>
                        </Link>

                        <Link href="/dashboard/integrations" passHref>
                            <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
      <span className="flex items-center gap-3">
        <Plug className="h-4 w-4" />
        Add Integrations
      </span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
