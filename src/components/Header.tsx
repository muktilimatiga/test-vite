import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User as UserIcon, Loader2, Sparkles, Sun, Moon, CheckCheck, Trash2 } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { UserProfile, AISearchStatus } from '../types';
import { askGemini } from '../services/geminiService';
import { useNotification } from '../hooks/useNotification';

interface HeaderProps {
    user: UserProfile;
    onSearch: (query: string) => void;
    onAIResult: (result: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSearch, onAIResult }) => {
    const [query, setQuery] = useState('');
    const [aiStatus, setAiStatus] = useState<AISearchStatus>(AISearchStatus.IDLE);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    
    const { unreadCount, notifications, markAllAsRead, clearAll } = useNotification();

    // Initialize theme based on system preference or default
    useEffect(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Keyboard shortcut to focus search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setShowNotifications(false);
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Close notification dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    // Debounce search for app filtering locally
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 150);
        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleAskAI = async () => {
        if (!query.trim()) return;
        
        setAiStatus(AISearchStatus.LOADING);
        onAIResult(null); // Clear previous results

        const answer = await askGemini(query);
        onAIResult(answer);
        setAiStatus(AISearchStatus.SUCCESS);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
             // Ctrl+Enter triggers AI
             handleAskAI();
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Brand / Logo Area */}
                <div className="flex items-center font-bold text-xl tracking-tight text-primary select-none">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mr-2 shadow-lg shadow-primary/20">
                        <Sparkles size={18} />
                    </div>
                    Nexus
                </div>

                {/* Search Bar - Centered & Improved */}
                <div className="flex-1 max-w-2xl relative group hidden sm:block">
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                            <Search size={16} />
                        </div>
                        
                        <Input 
                            ref={inputRef}
                            placeholder="Search apps..." 
                            className="pl-10 pr-36 h-11 rounded-xl border-border/40 bg-secondary/30 hover:bg-secondary/50 focus:bg-background focus:ring-2 focus:ring-primary/10 transition-all duration-200 w-full shadow-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                            {query ? (
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 px-3 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary rounded-lg transition-all flex items-center gap-1.5 animate-in fade-in zoom-in duration-200"
                                    onClick={handleAskAI}
                                    disabled={aiStatus === AISearchStatus.LOADING}
                                >
                                    {aiStatus === AISearchStatus.LOADING ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-3 w-3" />
                                    )}
                                    Ask AI
                                    <span className="ml-1 text-[10px] opacity-60 font-normal hidden lg:inline-block">
                                        Ctrl+↵
                                    </span>
                                </Button>
                            ) : (
                                <div className="flex items-center gap-1 pr-1 pointer-events-none opacity-50">
                                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                        <span className="text-xs">⌘</span>K
                                    </kbd>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Actions - Right */}
                <div className="flex items-center gap-2 relative">
                     <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground rounded-full">
                        {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </Button>
                    
                    <div className="relative" ref={notificationRef}>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-foreground rounded-full relative"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background animate-pulse"></span>
                            )}
                        </Button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
                                    <h3 className="font-semibold text-sm">Notifications</h3>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={markAllAsRead} title="Mark all as read">
                                            <CheckCheck size={14} className="text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearAll} title="Clear all">
                                            <Trash2 size={14} className="text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs">
                                            No notifications
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {notifications.map((n) => (
                                                <div key={n.id} className={`p-3 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                                                    <div className="flex items-start gap-2">
                                                        <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                                                            n.type === 'error' ? 'bg-red-500' :
                                                            n.type === 'success' ? 'bg-green-500' :
                                                            n.type === 'warning' ? 'bg-amber-500' :
                                                            'bg-blue-500'
                                                        }`} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium leading-none">{n.title}</div>
                                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</div>
                                                            <div className="text-[10px] text-muted-foreground/60 mt-1">
                                                                {new Date(n.timestamp).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block"></div>
                    
                    <div className="flex items-center gap-3 pl-1 cursor-pointer hover:bg-accent/50 p-1.5 rounded-full transition-colors pr-3 border border-transparent hover:border-border/40">
                        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden border border-border shadow-sm flex items-center justify-center">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-sm font-medium leading-none">{user.name}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile Search Bar (visible only on small screens) */}
            <div className="container mx-auto px-4 pb-3 sm:hidden">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search apps..." 
                        className="pl-10 h-10 w-full rounded-lg bg-secondary/50"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>
        </header>
    );
};