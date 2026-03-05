# AI Product Inventor — #8NPD Team

A market research tool that finds genuine unmet consumer needs using live data, then generates data-backed product concepts.

## The Problem It Solves

Product ideas are cheap. The real challenge is knowing which market gap is a real opportunity vs wishful thinking. This tool proves the need exists with live data before proposing a product to fill it.

## How It Works

Scans Amazon India, Flipkart, and Reddit in real-time. Analyzes recurring complaints, unmet needs, and consumer frustrations. Generates 6-8 product concepts per category — each backed by cited consumer data.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- AI: Groq API with LLaMA 3.3 70B
- Scraping: Axios, Cheerio
- Deployed on Render

## Local Setup

Clone the repository and navigate to the backend folder:
```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:
```
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

Start the server:
```bash
node server.js
```

Open `frontend/index.html` with Live Server or run `npx serve .` inside the frontend folder.

## Data Sources

- Amazon India product reviews (live scraping)
- Flipkart product reviews (live scraping)
- Reddit discussions and comments (live via Reddit JSON API)

## What the Output Includes

Each generated concept includes a problem statement backed by consumer data, the proposed solution, key features, direct evidence quotes from real reviews and discussions, market size estimate, competition intensity, and scores for feasibility, opportunity, and novelty.

## Environment Variables

| Variable | Description |
|----------|-------------|
| GROQ_API_KEY | Your Groq API key from console.groq.com |
| PORT | Server port, default 3001 |