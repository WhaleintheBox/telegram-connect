import express, { Request, Response } from 'express';
import cors from 'cors';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import OpenAI from 'openai';

interface GenerateRequestBody {
  prompt: string;
}

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://whaleinthebox.github.io'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  credentials: true,
  maxAge: 86400
}));

app.use(express.json());

const client = new SecretManagerServiceClient();
let openai: OpenAI | null = null;

async function getSecret(): Promise<string | undefined> {
  const [version] = await client.accessSecretVersion({
    name: 'projects/638008614172/secrets/LM/versions/latest',
  });
  return version.payload?.data?.toString();
}

async function initOpenAI(): Promise<OpenAI> {
  if (!openai) {
    const apiKey = await getSecret();
    if (!apiKey) throw new Error('Failed to get API key');
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

app.post('/generate', async (req: Request<{}, {}, GenerateRequestBody>, res: Response) => {
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
    res.status(500).json({
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export { app as gptFunction };