import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const progressColor = import.meta.env.VITE_INERTIA_PROGRESS_COLOR || '#2563eb';
const progressDelay = Number(import.meta.env.VITE_INERTIA_PROGRESS_DELAY || 120);

function setupRootLayout(el: Element): void {
    // Keep the mount node full-height to support fixed/sticky app layouts.
    el.classList.add('h-full');
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        setupRootLayout(el);
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <ErrorBoundary>
                    <App {...props} />
                    <Toaster position="top-right" richColors />
                </ErrorBoundary>
            </StrictMode>,
        );
    },
    progress: {
        color: progressColor,
        delay: Number.isFinite(progressDelay) ? progressDelay : 120,
        showSpinner: false,
        includeCSS: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
