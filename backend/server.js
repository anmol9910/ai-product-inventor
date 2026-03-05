import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { scrapeAmazonReviews, scrapeRedditDiscussions, scrapeFlipkartReviews, fetchGoogleTrends } from './scraper.js';
import { analyzeAndGenerateConcepts } from './analyzer.js';

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
  const { category } = req.body;
  
  if (!category || category.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide a valid category' });
  }

  const sanitizedCategory = category.trim().substring(0, 100);
  console.log(`\n🔍 Starting analysis for: ${sanitizedCategory}`);
  
  res.setHeader('Content-Type', 'application/json');
  
  try {
    console.log('📦 Scraping Amazon reviews...');
    const [amazonReviews, redditPosts, flipkartReviews, trends] = await Promise.allSettled([
      scrapeAmazonReviews(sanitizedCategory),
      scrapeRedditDiscussions(sanitizedCategory),
      scrapeFlipkartReviews(sanitizedCategory),
      fetchGoogleTrends(sanitizedCategory)
    ]);

    const allData = {
      amazonReviews: amazonReviews.value || [],
      redditPosts: redditPosts.value || [],
      flipkartReviews: flipkartReviews.value || [],
      trends: trends.value || []
    };

    console.log(`📊 Data collected: Amazon=${allData.amazonReviews.length}, Reddit=${allData.redditPosts.length}, Flipkart=${allData.flipkartReviews.length}`);
    console.log('🧠 Analyzing with Groq...');
    
    const analysis = await analyzeAndGenerateConcepts(allData, sanitizedCategory);
    
    console.log(`✅ Generated ${analysis.concepts?.length || 0} concepts`);
    
    res.json({
      success: true,
      category: sanitizedCategory,
      dataStats: {
        amazonReviews: allData.amazonReviews.length,
        redditPosts: allData.redditPosts.length,
        flipkartReviews: allData.flipkartReviews.length,
        totalDataPoints: allData.amazonReviews.length + allData.redditPosts.length + allData.flipkartReviews.length
      },
      analysis,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({ 
      error: 'Analysis failed. Please try again.',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 AI Product Inventor running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/analyze`);
});