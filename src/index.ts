// Backend (index.ts)
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Request, Response } from 'express';
import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: [
    'https://whaleinthebox.github.io',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 24 hours
}));

app.use(express.json());

const client = new SecretManagerServiceClient();
let openai: OpenAI | null = null;

async function initOpenAI() {
  if (!openai) {
    const [version] = await client.accessSecretVersion({
      name: 'projects/638008614172/secrets/LM/versions/latest',
    });
    const apiKey = version.payload?.data?.toString();
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

// Add OPTIONS handler for preflight requests
app.options('/generate', cors());

app.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const openaiClient = await initOpenAI();
    
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    });
    
    res.json({ choices: completion.choices });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export const gptFunction = app;