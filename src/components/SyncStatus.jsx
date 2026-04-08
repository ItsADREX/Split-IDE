import React, { memo } from 'react';
import { Cloud, CloudOff, Loader2, AlertCircle, Check } from 'lucide-react';

const SyncStatus = memo(({ status, className = '' }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'synced':
                return {
                    icon: Check,
                    color: 'var(--color-neon-green)',
                    text: 'Synced',
                    title: 'All changes saved to cloud'
                };
            case 'syncing':
                return {
                    icon: Loader2,
                    color: 'var(--color-teal)',
                    text: 'Syncing',
                    title: 'Saving changes to cloud...',
                    animate: true
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    color: '#ef4444',
                    text: 'Error',
                    title: 'Failed to sync to cloud'
                };
            case 'offline':
            default:
                return {
                    icon: CloudOff,
                    color: 'var(--color-muted)',
                    text: 'Offline',
                    title: 'Working offline - sign in to sync'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div 
            className={`flex items-center gap-1 text-xs ${className}`}
            style={{ color: config.color }}
            title={config.title}
        >
            <Icon 
                size={12} 
                className={config.animate ? 'animate-spin' : ''} 
            />
            <span className="hidden md:inline">{config.text}</span>
        </div>
    );
});

SyncStatus.displayName = 'SyncStatus';

export default SyncStatus;
