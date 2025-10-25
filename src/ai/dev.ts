import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-schedule-improvements.ts';
import '@/ai/flows/extract-data-from-document.ts';
import '@/ai/flows/summarize-imported-data.ts';