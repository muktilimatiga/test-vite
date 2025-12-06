import * as React from 'react';
import { Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/button';

interface AIResponseCardProps {
    response: string;
    onClose: () => void;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({ response, onClose }) => {
    return (
        <Card className="mb-8 border-primary/20 bg-primary/5 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg flex items-center text-primary">
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Insight
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-primary/10">
                    <X size={16} />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                    {response}
                </div>
            </CardContent>
        </Card>
    );
};