import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, LayoutTemplate, Sidebar, LayoutDashboard, SplitSquareHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Header } from '../components/Header';
import { AIResponseCard } from '../components/AIResponseCard';

export const Route = createFileRoute('/pages/Template')({
  component: TemplatePage,
})


interface TemplatePageProps {
    onBack: () => void;
}

export const TemplatePage: React.FC<TemplatePageProps> = ({ onBack }) => {
    const [aiResponse, setAiResponse] = React.useState<string | null>(null);

    return (
        <div className="flex flex-col h-screen bg-background font-sans text-foreground">
             <Header 
                user={} 
                onSearch={() => {}} 
                onAIResult={setAiResponse} 
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                 {aiResponse && (
                    <div className="p-4 border-b border-border bg-muted/20">
                        <AIResponseCard response={aiResponse} onClose={() => setAiResponse(null)} />
                    </div>
                )}

                <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <LayoutTemplate className="h-5 w-5 text-purple-500" />
                                Templates
                            </h1>
                            <p className="text-xs text-muted-foreground">Pre-built dashboard layouts</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto">
                    <Card className="hover:border-purple-500 cursor-pointer transition-all hover:shadow-md group">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-muted rounded-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                                <Sidebar size={32} className="text-muted-foreground group-hover:text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Sidebar Layout</h3>
                                <p className="text-xs text-muted-foreground mt-1">Classic layout with collapsible sidebar</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-purple-500 cursor-pointer transition-all hover:shadow-md group">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-muted rounded-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                                <LayoutDashboard size={32} className="text-muted-foreground group-hover:text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Grid Dashboard</h3>
                                <p className="text-xs text-muted-foreground mt-1">Widget-based grid system</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-purple-500 cursor-pointer transition-all hover:shadow-md group">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="p-4 bg-muted rounded-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                                <SplitSquareHorizontal size={32} className="text-muted-foreground group-hover:text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Split View</h3>
                                <p className="text-xs text-muted-foreground mt-1">Master-detail split pane layout</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};