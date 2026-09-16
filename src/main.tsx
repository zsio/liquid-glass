import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import GlassStudio from './GlassStudio';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root');
createRoot(container).render(<StrictMode><GlassStudio /></StrictMode>);
