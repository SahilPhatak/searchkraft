// Vercel serverless entry point — wraps the Express app
import 'dotenv/config';
import { createApp } from '../apps/api/src/app';

export default createApp();
