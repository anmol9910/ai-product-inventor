import Groq from 'groq-sdk';

export async function analyzeAndGenerateConcepts(allData, category) {
  // Client yahan banao taaki dotenv pehle load ho sake
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const { amazonReviews, redditPosts, flipkartReviews, trends } = allData;
  
  const combinedText = [
    ...amazonReviews.map(r => `[AMAZON] ${r.product || ''}: ${r.text}`),
    ...flipkartReviews.map(r => `[FLIPKART] ${r.product || ''}: ${r.text}`),
    ...redditPosts.map(r => `[REDDIT r/${r.subreddit || 'general'}] "${r.title}": ${r.text}`)
  ].slice(0, 60).join('\n\n');

  const trendText = trends.map(t => 
    `"${t.keyword}": trend score ${t.trend}/100 ${t.rising ? '(RISING)' : ''}`
  ).join(', ');

  const prompt = `You are a world-class D2C product strategist analyzing REAL consumer data for the "${category}" category in India.

LIVE DATA COLLECTED:
${combinedText}

SEARCH TRENDS: ${trendText}

TASK: Analyze this real consumer data deeply and identify GENUINE unmet needs. Then generate 6-8 product concepts.

For each concept you MUST:
1. Identify the specific pain point from the data
2. Quote or reference SPECIFIC data points
3. Explain why existing products fail
4. Propose a NOVEL product solution
5. Estimate market opportunity

Return ONLY valid JSON, no markdown, no backticks, just raw JSON:
{
  "insights": {
    "topPainPoints": ["pain point 1 with data evidence", "pain point 2", "pain point 3"],
    "consumerLanguage": ["exact phrases consumers use", "emotional language patterns"],
    "marketGaps": ["gap 1 with evidence", "gap 2"],
    "totalDataPoints": ${amazonReviews.length + flipkartReviews.length + redditPosts.length}
  },
  "concepts": [
    {
      "id": 1,
      "name": "Product Name",
      "tagline": "One compelling line",
      "category": "${category}",
      "problemStatement": "Specific problem with data evidence",
      "solution": "What the product does differently",
      "targetConsumer": "Specific consumer profile",
      "keyFeatures": ["feature 1", "feature 2", "feature 3", "feature 4"],
      "dataEvidence": [
        {"source": "Amazon/Reddit/Flipkart", "quote": "paraphrased consumer complaint", "frequency": "mentioned by X consumers"},
        {"source": "Source", "quote": "another evidence", "frequency": "frequency note"}
      ],
      "whyNow": "Why this opportunity exists now",
      "competitiveGap": "What existing products miss",
      "estimatedMarketSize": "₹X Cr opportunity",
      "competitionIntensity": "Low/Medium/High",
      "feasibilityScore": 8,
      "opportunityScore": 9,
      "noveltyScore": 8,
      "overallScore": 85,
      "pricePoint": "₹XXX - ₹XXXX",
      "gtmStrategy": "How to launch this",
      "risks": ["risk 1", "risk 2"]
    }
  ],
  "topPicks": [1, 2, 3],
  "categoryInsight": "One paragraph summary of the key insight about this category"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      messages: [
        { role: 'system', content: 'You are a D2C product strategist. Always respond with valid JSON only, no markdown, no backticks.' },
        { role: 'user', content: prompt }
      ]
    });

    const responseText = completion.choices[0].message.content;
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON in response');
  } catch (error) {
    console.error('Groq analysis error:', error);
    throw error;
  }
}