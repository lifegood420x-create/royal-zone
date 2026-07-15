import { createRoot } from 'react-dom/client';

import App from './App';
import { bootstrapTelegram } from './lib/telegram';

import './index.css';

bootstrapTelegram();

createRoot(document.getElementById('root')!).render(<App />);
