// server/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { 
  getDailyBriefingAndQuiz,
  generateDailySession, 
  generateHistoricalSummary, 
  generateDailySynthesis,
  recommendTomorrowFocus,
  countWords 
} from './curriculumEngine.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check with IST time
app.get('/api/health', (req, res) => {
  const istDateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  res.json({
    status: 'ok',
    serverTimeUtc: new Date().toISOString(),
    istTime: istDateString,
    message: 'Adaptive Learning Assistant backend online'
  });
});

// List all topics & tracks
app.get('/api/topics', (req, res) => {
  const tracks = [
    {
      name: "Modern AI & Frontier Models",
      description: "Reasoning Models, MCP, Agent loops, MoE, Attention, KV Caching, Speculative Decoding"
    },
    {
      name: "Distributed Systems & Modern Data Engines",
      description: "HNSW Vector DBs, Edge Runtimes, LSM vs B-Trees, Raft Consensus, CRDTs"
    },
    {
      name: "Emerging Web & Cloud Frameworks",
      description: "React Server Components, WebGPU Compute Shaders, HTTP/3 QUIC, DOM Reconciliation"
    },
    {
      name: "Systems Security & Low-Level Runtimes",
      description: "eBPF Kernel Tracing, Rust Memory Safety & Borrow Checking Invariants"
    }
  ];

  res.json({
    tracks,
    dynamicAiEngine: "Google Gemini 1.5 Flash (@google/generative-ai)",
    caching: "Cloud Firestore daily_sessions"
  });
});

// Generate or fetch daily session with Firestore caching & live Gemini AI
app.post('/api/generate-daily', async (req, res) => {
  try {
    const { date, preferences = {}, completedSessions = [] } = req.body;
    
    // Default to current date in IST if not provided
    const userDate = date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    const session = await getDailyBriefingAndQuiz({
      date: userDate,
      preferences,
      completedSessions
    });

    const historySummary = generateHistoricalSummary(completedSessions);

    res.json({
      success: true,
      session,
      historySummary
    });
  } catch (error) {
    console.error('Error in /api/generate-daily:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate dynamic historical summary
app.post('/api/historical-summary', (req, res) => {
  try {
    const { completedSessions = [] } = req.body;
    const summary = generateHistoricalSummary(completedSessions);
    const wordCount = countWords(summary);
    res.json({
      success: true,
      summary,
      wordCount
    });
  } catch (error) {
    console.error('Error in /api/historical-summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Evaluate quiz and generate daily performance synthesis
app.post('/api/evaluate-quiz', (req, res) => {
  try {
    const { quizResults, cards, date, completedSessions = [], preferences = {} } = req.body;
    if (!quizResults || !cards) {
      return res.status(400).json({ success: false, error: 'Missing quizResults or cards' });
    }

    const synthesis = generateDailySynthesis({ quizResults, cards, date });
    const wordCount = countWords(synthesis);
    const tomorrowRecommendation = recommendTomorrowFocus({
      quizResults,
      completedSessions,
      cards,
      preferences
    });

    res.json({
      success: true,
      synthesis,
      wordCount,
      tomorrowRecommendation
    });
  } catch (error) {
    console.error('Error in /api/evaluate-quiz:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Adaptive Learning Server running at http://localhost:${PORT}`);
});
