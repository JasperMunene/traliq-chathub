'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
    Bot,
    Save,
    RotateCcw,
    MessageSquare,
    User,
    Settings,
    Palette,
    Shield,
    Camera,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BotConfig {
    name: string;
    welcomeMessage: string;
    profileImage: string | null;
    tone: 'formal' | 'friendly' | 'concise';
    style: 'professional' | 'casual' | 'playful';
    fallbackBehavior: 'escalate' | 'generic' | 'contact';
}

const BotCustomizer = () => {
    const [config, setConfig] = useState<BotConfig>({
        name: "Traliq Assistant",
        welcomeMessage: "Hello! I'm here to help you with any questions you might have. How can I assist you today?",
        profileImage: null,
        tone: 'friendly',
        style: 'professional',
        fallbackBehavior: 'generic'
    });

    const [isUploading, setIsUploading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const toneOptions = [
        {
            value: 'formal' as const,
            label: 'Formal',
            description: 'Professional and structured communication',
            example: "Good day. How may I assist you with your inquiry?"
        },
        {
            value: 'friendly' as const,
            label: 'Friendly',
            description: 'Warm and approachable conversation style',
            example: "Hi there! I'd be happy to help you out. What can I do for you?"
        },
        {
            value: 'concise' as const,
            label: 'Concise',
            description: 'Brief and to-the-point responses',
            example: "Hello! How can I help?"
        }
    ];

    const stylePresets = [
        {
            value: 'professional' as const,
            label: 'Professional',
            description: 'Business-focused with expertise emphasis',
            icon: Shield,
            color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        },
        {
            value: 'casual' as const,
            label: 'Casual',
            description: 'Relaxed and conversational approach',
            icon: MessageSquare,
            color: 'bg-green-500/10 text-green-400 border-green-500/20'
        },
        {
            value: 'playful' as const,
            label: 'Playful',
            description: 'Fun and engaging personality',
            icon: Palette,
            color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        }
    ];

    const fallbackOptions = [
        {
            value: 'escalate' as const,
            label: 'Escalate to Human Agent',
            description: 'Transfer the conversation to a human representative'
        },
        {
            value: 'generic' as const,
            label: 'Generic Response',
            description: "Show a standard &quot;We&apos;ll get back to you&quot; message"
        },
        {
            value: 'contact' as const,
            label: 'Offer Contact Form',
            description: 'Provide a form for users to leave their details'
        }
    ];

    // typed handler (no explicit any)
    const handleConfigChange = <K extends keyof BotConfig>(key: K, value: BotConfig[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast("Image size should be less than 2MB");
                return;
            }

            setIsUploading(true);
            // Simulate upload
            setTimeout(() => {
                const imageUrl = URL.createObjectURL(file);
                handleConfigChange('profileImage', imageUrl);
                setIsUploading(false);
                toast("Profile image updated successfully");
            }, 1500);
        }
    };

    const handleSave = () => {
        // Simulate save operation
        toast("Bot configuration saved successfully!");
        setHasChanges(false);
    };

    const handleReset = () => {
        setConfig({
            name: "Traliq Assistant",
            welcomeMessage: "Hello! I'm here to help you with any questions you might have. How can I assist you today?",
            profileImage: null,
            tone: 'friendly',
            style: 'professional',
            fallbackBehavior: 'generic'
        });
        setHasChanges(false);
        toast("Configuration reset to defaults");
    };

    return (
        <div className="space-y-8 p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Bot Customizer
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Configure your AI assistant&apos;s personality and behavior
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="gap-2"
                        disabled={!hasChanges}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="gap-2 bg-white text-black hover:bg-gray-100"
                        disabled={!hasChanges}
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <Bot className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Set your bot&apos;s name and initial greeting message
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="bot-name" className="text-sm font-medium">
                                    Bot Name
                                </Label>
                                <Input
                                    id="bot-name"
                                    value={config.name}
                                    onChange={(e) => handleConfigChange('name', e.target.value)}
                                    placeholder="Enter your bot&apos;s name"
                                    className="bg-background border-border"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="welcome-message" className="text-sm font-medium">
                                    Welcome Message
                                </Label>
                                <Textarea
                                    id="welcome-message"
                                    value={config.welcomeMessage}
                                    onChange={(e) => handleConfigChange('welcomeMessage', e.target.value)}
                                    placeholder="Enter the first message your bot will send to visitors"
                                    className="bg-background border-border min-h-[100px] resize-none"
                                    maxLength={300}
                                />
                                <div className="text-xs text-muted-foreground text-right">
                                    {config.welcomeMessage.length}/300 characters
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Profile Picture (Optional)
                                </Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={config.profileImage || undefined} />
                                        <AvatarFallback className="bg-muted">
                                            <Bot className="h-8 w-8 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <Button
                                            variant="outline"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                            disabled={isUploading}
                                            className="gap-2"
                                        >
                                            <Camera className="h-4 w-4" />
                                            {isUploading ? 'Uploading...' : 'Upload Image'}
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Recommended: 200x200px, max 2MB
                                        </p>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Communication Style */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <MessageSquare className="h-5 w-5" />
                                Communication Style
                            </CardTitle>
                            <CardDescription>
                                Define how your bot communicates with users
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-sm font-medium">Tone</Label>
                                <RadioGroup
                                    value={config.tone}
                                    onValueChange={(value) => handleConfigChange('tone', value as BotConfig['tone'])}
                                    className="space-y-3"
                                >
                                    {toneOptions.map((option) => (
                                        <div key={option.value} className="flex items-start space-x-3">
                                            <RadioGroupItem
                                                value={option.value}
                                                id={option.value}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <Label
                                                    htmlFor={option.value}
                                                    className="font-medium cursor-pointer"
                                                >
                                                    {option.label}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {option.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground italic mt-1">
                                                    {/* surround expression with escaped quotes */}
                                                    <>&quot;{option.example}&quot;</>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-medium">Style Preset</Label>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {stylePresets.map((preset) => {
                                        const Icon = preset.icon;
                                        const isSelected = config.style === preset.value;
                                        return (
                                            <Card
                                                key={preset.value}
                                                className={cn(
                                                    "cursor-pointer transition-all duration-200 hover:scale-105",
                                                    isSelected
                                                        ? "border-white bg-white/5"
                                                        : "border-border hover:border-white/50"
                                                )}
                                                onClick={() => handleConfigChange('style', preset.value)}
                                            >
                                                <CardContent className="p-4 text-center">
                                                    <div className={cn(
                                                        "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3",
                                                        preset.color
                                                    )}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <h3 className="font-medium text-sm">{preset.label}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {preset.description}
                                                    </p>
                                                    {isSelected && (
                                                        <div className="mt-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                <Check className="h-3 w-3 mr-1" />
                                                                Selected
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fallback Behavior */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <Settings className="h-5 w-5" />
                                Fallback Behavior
                            </CardTitle>
                            <CardDescription>
                                Define what happens when your bot doesn&apos;t know the answer
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={config.fallbackBehavior}
                                onValueChange={(value) => handleConfigChange('fallbackBehavior', value as BotConfig['fallbackBehavior'])}
                                className="space-y-3"
                            >
                                {fallbackOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3">
                                        <RadioGroupItem
                                            value={option.value}
                                            id={`fallback-${option.value}`}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={`fallback-${option.value}`}
                                                className="font-medium cursor-pointer"
                                            >
                                                {option.label}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {/* description already contains entities where needed */}
                                                {/* it will render safely */}
                                                <span dangerouslySetInnerHTML={{ __html: option.description }} />
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Preview */}
                <div className="space-y-6">
                    <Card className="bg-card border-border sticky top-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <User className="h-5 w-5" />
                                Live Preview
                            </CardTitle>
                            <CardDescription>
                                See how your bot will appear to users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Bot Avatar and Name */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={config.profileImage || undefined} />
                                        <AvatarFallback className="bg-white/10">
                                            <Bot className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{config.name}</p>
                                        <p className="text-xs text-muted-foreground">AI Assistant</p>
                                    </div>
                                </div>

                                {/* Welcome Message Preview */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Welcome Message
                                    </Label>
                                    <div className="p-3 rounded-lg bg-white/5 border border-border">
                                        <p className="text-sm">{config.welcomeMessage}</p>
                                    </div>
                                </div>

                                {/* Configuration Summary */}
                                <div className="space-y-3 pt-4 border-t border-border">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Tone</span>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {config.tone}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Style</span>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {config.style}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Fallback</span>
                                        <Badge variant="outline" className="text-xs">
                                            {fallbackOptions.find(opt => opt.value === config.fallbackBehavior)?.label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BotCustomizer;
