import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/')({ component: App })
export type ViewState = 'dashboard' | 'excalidraw' | 'reactflow' | 'broadband' | 'database' | 'logs' | 'template';


function App() {
    const [activeView, setActiveView] = React.useState<ViewState>('dashboard');

    const handleNavigate = (view: ViewState) => {
        setActiveView(view);
    };

    if (activeView === 'excalidraw') {
        return <ExcalidrawPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'reactflow') {
        return <ReactFlowPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'broadband') {
        return <BroadbandPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'database') {
        return <DatabasePage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'logs') {
        return <LogsPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'template') {
        return <TemplatePage onBack={() => setActiveView('dashboard')} />;
    }

    return <DashboardPage onNavigate={handleNavigate} />;
};
