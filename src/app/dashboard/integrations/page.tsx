'use client'

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { businessAPI, Business } from "@/lib/business-api";
import {
    CheckCircle,
    AlertCircle,
    Copy,
    ExternalLink,
    MessageCircle,
    Globe,
    Instagram,
    MessageSquare,
    Smartphone,
    Zap
} from "lucide-react";


interface IntegrationStatus {
    whatsapp: boolean;
    messenger: boolean;
    telegram: boolean;
    instagram: boolean;
    website: boolean;
}

const IntegrationsPage = () => {
    const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
        whatsapp: false,
        messenger: false,
        telegram: false,
        instagram: false,
        website: false
    });
    const [webSnippet, setWebSnippet] = useState("");

    // Load business and integration status on component mount
    const loadBusinessAndIntegrations = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get current business
            const business = await businessAPI.getPrimaryBusiness();
            if (!business) {
                setError('No business found. Please create a business first.');
                return;
            }

            setCurrentBusiness(business);

            // In a real app, we would fetch integration status from an API
            const mockStatus: IntegrationStatus = {
                whatsapp: false,
                messenger: true,
                telegram: false,
                instagram: false,
                website: true
            };

            setIntegrationStatus(mockStatus);

        } catch (err) {
            console.error('Error loading business and integrations:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
            toast.error('Failed to load integrations');
        } finally {
            setIsLoading(false);
        }
    }, []); // no external deps that change

    const generateWebSnippet = useCallback(() => {
        // This would typically come from the API based on the business ID
        const snippet = `<script>
  window.chatbaseConfig = {
    chatbotId: '${currentBusiness?.id || 'YOUR_CHATBOT_ID'}'
  };
</script>
<script src="https://www.chatbase.co/embed.min.js" id="${currentBusiness?.id || 'YOUR_CHATBOT_ID'}" defer></script>`;

        setWebSnippet(snippet);
    }, [currentBusiness]);

    useEffect(() => {
        loadBusinessAndIntegrations();
        generateWebSnippet();
    }, [loadBusinessAndIntegrations, generateWebSnippet]);

    const handleConnect = (platform: keyof IntegrationStatus) => {
        // In a real app, this would trigger an API call to connect the platform
        toast.success(`Initiating connection to ${platform}`);
        setIntegrationStatus(prev => ({
            ...prev,
            [platform]: true
        }));
    };

    const handleDisconnect = (platform: keyof IntegrationStatus) => {
        // In a real app, this would trigger an API call to disconnect the platform
        toast.info(`Disconnected from ${platform}`);
        setIntegrationStatus(prev => ({
            ...prev,
            [platform]: false
        }));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(webSnippet);
        toast.success("Code snippet copied to clipboard!");
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading integrations...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={loadBusinessAndIntegrations} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Integrations
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Connect your chatbot to various platforms for {currentBusiness?.name || 'your business'}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">
                            Connected Platforms
                        </CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">
                            {Object.values(integrationStatus).filter(status => status).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Of 5 available platforms
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">
                            Active Conversations
                        </CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">142</div>
                        <p className="text-xs text-muted-foreground">
                            In the last 24 hours
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-card-foreground">
                            Response Rate
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">98.7%</div>
                        <p className="text-xs text-muted-foreground">
                            Successful responses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Integrations */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* WhatsApp Integration */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-600 rounded-lg">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-card-foreground">WhatsApp</CardTitle>
                                <CardDescription>Connect to WhatsApp Business</CardDescription>
                            </div>
                        </div>
                        <Badge variant={integrationStatus.whatsapp ? "default" : "outline"}
                               className={integrationStatus.whatsapp ? "bg-green-600" : ""}>
                            {integrationStatus.whatsapp ? "Connected" : "Disconnected"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Enable customers to message your business directly through WhatsApp.
                        </p>
                        {integrationStatus.whatsapp ? (
                            <div className="flex space-x-2">
                                <Button variant="outline" className="flex-1" onClick={() => handleDisconnect('whatsapp')}>
                                    Disconnect
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Configure <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleConnect('whatsapp')}>
                                Connect WhatsApp
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Messenger Integration */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <MessageCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-card-foreground">Messenger</CardTitle>
                                <CardDescription>Connect to Facebook Messenger</CardDescription>
                            </div>
                        </div>
                        <Badge variant={integrationStatus.messenger ? "default" : "outline"}
                               className={integrationStatus.messenger ? "bg-blue-600" : ""}>
                            {integrationStatus.messenger ? "Connected" : "Disconnected"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Connect your chatbot to Facebook Messenger to reach customers on Facebook.
                        </p>
                        {integrationStatus.messenger ? (
                            <div className="flex space-x-2">
                                <Button variant="outline" className="flex-1" onClick={() => handleDisconnect('messenger')}>
                                    Disconnect
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Configure <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleConnect('messenger')}>
                                Connect Messenger
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Telegram Integration */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <Smartphone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-card-foreground">Telegram</CardTitle>
                                <CardDescription>Connect to Telegram</CardDescription>
                            </div>
                        </div>
                        <Badge variant={integrationStatus.telegram ? "default" : "outline"}
                               className={integrationStatus.telegram ? "bg-blue-500" : ""}>
                            {integrationStatus.telegram ? "Connected" : "Disconnected"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Integrate with Telegram to provide customer support through Telegram bots.
                        </p>
                        {integrationStatus.telegram ? (
                            <div className="flex space-x-2">
                                <Button variant="outline" className="flex-1" onClick={() => handleDisconnect('telegram')}>
                                    Disconnect
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Configure <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full" onClick={() => handleConnect('telegram')}>
                                Connect Telegram
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Instagram Integration */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-pink-600 rounded-lg">
                                <Instagram className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-card-foreground">Instagram</CardTitle>
                                <CardDescription>Connect to Instagram Direct</CardDescription>
                            </div>
                        </div>
                        <Badge variant={integrationStatus.instagram ? "default" : "outline"}
                               className={integrationStatus.instagram ? "bg-pink-600" : ""}>
                            {integrationStatus.instagram ? "Connected" : "Disconnected"}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Respond to Instagram Direct messages automatically with your chatbot.
                        </p>
                        {integrationStatus.instagram ? (
                            <div className="flex space-x-2">
                                <Button variant="outline" className="flex-1" onClick={() => handleDisconnect('instagram')}>
                                    Disconnect
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Configure <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full bg-pink-600 hover:bg-pink-700" onClick={() => handleConnect('instagram')}>
                                Connect Instagram
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Website Integration */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-600 rounded-lg">
                            <Globe className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-card-foreground">Website</CardTitle>
                            <CardDescription>Embed chatbot on your website</CardDescription>
                        </div>
                    </div>
                    <Badge variant={integrationStatus.website ? "default" : "outline"}
                           className={integrationStatus.website ? "bg-gray-600" : ""}>
                        {integrationStatus.website ? "Connected" : "Disconnected"}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Add our code snippet to your website to enable the chatbot. Customize its appearance from the settings.
                    </p>

                    <div className="rounded-md bg-gray-900 p-4 relative">
            <pre className="text-sm text-white overflow-x-auto">
              <code>{webSnippet}</code>
            </pre>
                        <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700"
                            onClick={copyToClipboard}
                        >
                            <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                    </div>

                    <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1" onClick={() => setIntegrationStatus(prev => ({...prev, website: !prev.website}))}>
                            {integrationStatus.website ? 'Disable' : 'Enable'} Website Chat
                        </Button>
                        <Button variant="outline" className="flex-1">
                            Customize Widget <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-card-foreground">Need help with integrations?</CardTitle>
                    <CardDescription>
                        Check our documentation or contact support for assistance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-4">
                        <Button variant="outline" className="flex-1">
                            View Documentation
                        </Button>
                        <Button variant="outline" className="flex-1">
                            Contact Support
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default IntegrationsPage;
