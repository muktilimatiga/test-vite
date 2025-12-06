import * as React from 'react';
import { ArrowUpRight, Loader2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface AppIcon {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string; // Hex or CSS color string
}



interface AppGridProps {
    apps: Array<AppIcon>;
    onAppClick?: (appId: string) => void;
    launchingAppId?: string | null;
}

export const AppGrid: React.FC<AppGridProps> = ({ apps, onAppClick, launchingAppId }) => {
    if (apps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p>No apps found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {apps.map((app) => {
                const IconComponent = app.icon;
                const isAdd = app.id === 'add';
                const isEmpty = app.id === 'empty';
                const isLaunching = launchingAppId === app.id;

                // Determine styles based on card type
                let cardStyles = "bg-card hover:shadow-lg hover:-translate-y-1 cursor-pointer border-border/50";
                
                if (isAdd) {
                    cardStyles = "border-dashed border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 cursor-pointer hover:shadow-md hover:-translate-y-1";
                } else if (isEmpty) {
                    cardStyles = "border-dashed border-2 border-muted hover:border-muted-foreground/50 bg-muted/20 hover:bg-muted/40 cursor-pointer text-muted-foreground hover:text-foreground";
                }

                // Dynamic background style using color-mix for transparency relative to the app's specific color
                const iconContainerStyle = !isAdd && !isEmpty
                    ? { 
                        backgroundColor: `color-mix(in srgb, ${app.color} 10%, transparent)`, 
                        color: app.color 
                      } 
                    : {};
                
                const iconContainerClass = isAdd || isEmpty
                    ? "bg-transparent" 
                    : "";

                const iconColorClass = isAdd ? "text-primary" : isEmpty ? "text-muted-foreground" : "";

                return (
                    <Card 
                        key={app.id}
                        className={`group relative flex flex-col items-center justify-center p-8 transition-all duration-300 overflow-hidden ${cardStyles}`}
                        onClick={() => !isLaunching && onAppClick && onAppClick(app.id)}
                    >
                        {/* Launching Overlay */}
                        {isLaunching && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/80 backdrop-blur-[2px] transition-all duration-300 animate-in fade-in">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}

                        <div 
                            className={`p-4 rounded-xl mb-4 transition-transform ${!isLaunching ? 'group-hover:scale-110' : ''} shadow-sm ${iconContainerClass} ${iconColorClass}`}
                            style={iconContainerStyle}
                        >
                            <IconComponent size={32} strokeWidth={isAdd || isEmpty ? 2 : 2} />
                        </div>
                        
                        <h3 className={`font-semibold text-sm mb-1 ${isEmpty ? 'text-muted-foreground group-hover:text-foreground' : 'text-foreground'}`}>
                            {app.name}
                        </h3>
                        
                        <p className="text-[11px] text-muted-foreground text-center line-clamp-1 px-1">
                            {app.description}
                        </p>
                        
                        {/* Hover hint for standard apps */}
                        {!isAdd && !isEmpty && !isLaunching && (
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight size={14} className="text-muted-foreground" />
                            </div>
                        )}

                        {/* Plus icon hint for Add card */}
                        {isAdd && !isLaunching && (
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={14} className="text-primary" />
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};