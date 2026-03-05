const API_BASE = 'http://localhost:3001';
let analysisRunning = false;

async function startAnalysis() {
  if (analysisRunning) return;
  
  const input = document.getElementById('categoryInput');
  const category = input.value.trim();
  
  if (!category) {
    input.focus();
    return;
  }
  
  analysisRunning = true;
  showLoading();
  animateLoadingSteps();
  
  try {
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Analysis failed');
    }
    
    const data = await response.json();
    showResults(data);
    
  } catch (error) {
    hideLoading();
    alert('Error: ' + error.message);
  } finally {
    analysisRunning = false;
  }
}

function showLoading() {
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('resultsSection').classList.add('hidden');
  
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.innerHTML = 'Analyzing... <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  
  document.querySelectorAll('.lstep').forEach(s => s.classList.remove('active','done'));
  document.getElementById('step1').classList.add('active');
  
  window.scrollTo({ top: 400, behavior: 'smooth' });
}

function hideLoading() {
  document.getElementById('loadingState').classList.add('hidden');
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = false;
  btn.innerHTML = 'Analyze Market <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
}

function animateLoadingSteps() {
  const steps = ['step1','step2','step3','step4','step5'];
  const delays = [0, 4000, 8000, 12000, 18000];
  
  steps.forEach((id, i) => {
    setTimeout(() => {
      if (i > 0) {
        const prev = document.getElementById(steps[i-1]);
        if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
      }
      const cur = document.getElementById(id);
      if (cur) cur.classList.add('active');
    }, delays[i]);
  });
}

function showResults(data) {
  hideLoading();
  
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('resultsTitle').textContent = `${data.category} — Market Report`;
  
  // Stats
  const stats = data.dataStats;
  document.getElementById('statsBar').innerHTML = `
    <div class="stat-pill">🛒 <strong>${stats.amazonReviews}</strong> Amazon</div>
    <div class="stat-pill">💬 <strong>${stats.redditPosts}</strong> Reddit</div>
    <div class="stat-pill">📦 <strong>${stats.flipkartReviews}</strong> Flipkart</div>
    <div class="stat-pill">🧠 <strong>${data.analysis.concepts?.length || 0}</strong> Concepts</div>
  `;
  
  // Insights
  const ins = data.analysis.insights;
  document.getElementById('insightsPanel').innerHTML = `
    <h2>🔍 Market Intelligence</h2>
    <div class="insight-grid">
      <div class="insight-box">
        <h3>Top Pain Points</h3>
        <ul>${(ins.topPainPoints || []).map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
      <div class="insight-box">
        <h3>Market Gaps</h3>
        <ul>${(ins.marketGaps || []).map(g => `<li>${g}</li>`).join('')}</ul>
      </div>
      <div class="insight-box">
        <h3>Consumer Language</h3>
        <ul>${(ins.consumerLanguage || []).map(l => `<li>"${l}"</li>`).join('')}</ul>
      </div>
    </div>
    ${data.analysis.categoryInsight ? `<p class="category-insight">${data.analysis.categoryInsight}</p>` : ''}
  `;
  
  // Concepts
  const concepts = data.analysis.concepts || [];
  const topPicks = data.analysis.topPicks || [];
  
  document.getElementById('conceptsGrid').innerHTML = concepts.map((c, i) => {
    const isTop = topPicks.includes(c.id);
    const compClass = c.competitionIntensity === 'Low' ? 'comp-low' : c.competitionIntensity === 'High' ? 'comp-high' : 'comp-med';
    
    return `
    <div class="concept-card ${isTop ? 'top-pick' : ''}" style="animation-delay:${i*0.1}s">
      <div class="card-header">
        <div class="card-header-left">
          ${isTop ? '<div class="top-badge">⭐ Top Pick</div>' : ''}
          <div class="concept-name">${c.name}</div>
          <div class="concept-tagline">${c.tagline}</div>
        </div>
        <div class="score-circle" style="--score:${c.overallScore}">
          <span>${c.overallScore}</span>
        </div>
      </div>
      
      <div class="card-body">
        <div>
          <div class="section-label">The Problem</div>
          <div class="problem-text">${c.problemStatement}</div>
        </div>
        <div>
          <div class="section-label">The Solution</div>
          <div class="solution-text">${c.solution}</div>
        </div>
        <div>
          <div class="section-label">Key Features</div>
          <div class="features-list">
            ${(c.keyFeatures || []).map(f => `<span class="feature-tag">${f}</span>`).join('')}
          </div>
        </div>
        <div>
          <div class="section-label">Consumer Evidence</div>
          <div class="evidence-list">
            ${(c.dataEvidence || []).slice(0,2).map(e => `
              <div class="evidence-item">
                <div class="evidence-source">${e.source}</div>
                <div class="evidence-quote">"${e.quote}"</div>
                <div class="evidence-freq">${e.frequency}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <div class="section-label">Why Now</div>
          <div class="problem-text">${c.whyNow}</div>
        </div>
      </div>
      
      <div class="score-bars">
        <div class="score-row">
          <span class="lbl">Feasibility</span>
          <div class="score-track"><div class="score-fill" style="width:${c.feasibilityScore*10}%"></div></div>
          <span class="score-num">${c.feasibilityScore}</span>
        </div>
        <div class="score-row">
          <span class="lbl">Opportunity</span>
          <div class="score-track"><div class="score-fill" style="width:${c.opportunityScore*10}%"></div></div>
          <span class="score-num">${c.opportunityScore}</span>
        </div>
        <div class="score-row">
          <span class="lbl">Novelty</span>
          <div class="score-track"><div class="score-fill" style="width:${c.noveltyScore*10}%"></div></div>
          <span class="score-num">${c.noveltyScore}</span>
        </div>
      </div>
      
      <div class="card-footer">
        <div class="meta-pill"><span class="label">Market Size</span><span class="val">${c.estimatedMarketSize}</span></div>
        <div class="meta-pill"><span class="label">Price Point</span><span class="val">${c.pricePoint}</span></div>
        <div class="meta-pill"><span class="label">Competition</span><span class="val ${compClass}">${c.competitionIntensity}</span></div>
      </div>
    </div>`;
  }).join('');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function quickSearch(category) {
  document.getElementById('categoryInput').value = category;
  startAnalysis();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('categoryInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') startAnalysis();
  });
});