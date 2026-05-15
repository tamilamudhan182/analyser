const form = document.querySelector("#analyzerForm");
const resetBtn = document.querySelector("#resetBtn");
const demoBtn = document.querySelector("#demoBtn");
const resumeFile = document.querySelector("#resumeFile");
const fileName = document.querySelector("#fileName");

const state = {
  resume: 68,
  technical: 64,
  communication: 70,
  portfolio: 60,
};

const feedbackRules = {
  resume: {
    title: "Resume Analyzer",
    strong: "Your resume is structured well enough for an ATS pass.",
    weak: "Add quantified achievements, role keywords, and more consistent formatting.",
  },
  technical: {
    title: "Technical Skills Evaluator",
    strong: "Your fundamentals are credible for placement interviews.",
    weak: "Revise data structures, recursion, OOP basics, and SQL joins with timed practice.",
  },
  communication: {
    title: "Communication Analyzer",
    strong: "Your introduction is clear, concise, and easy to follow.",
    weak: "Use a tighter answer structure: background, skill proof, project impact, target role.",
  },
  portfolio: {
    title: "Portfolio Scanner",
    strong: "Your project proof supports your interview story.",
    weak: "Showcase 2-3 impactful repos with READMEs, screenshots, live demos, and outcomes.",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function weightedScore(scores) {
  return clamp(
    scores.resume * 0.25 +
      scores.technical * 0.3 +
      scores.communication * 0.25 +
      scores.portfolio * 0.2
  );
}

function getLevel(score) {
  if (score <= 40) return "Beginner";
  if (score <= 70) return "Intermediate";
  return "Expert";
}

// ── SVG Signal Graph (no external dependencies) ──────────────────────────────
// The SVG viewBox is 800 × 220. Plot area: x 70→790, y 10→178.
// score 100 → y=10, score 0 → y=178
const X_POSITIONS = [200, 390, 580, 770];
const Y_BOTTOM = 178, Y_TOP = 10;

function scoreToY(score) {
  return Y_BOTTOM - ((score / 100) * (Y_BOTTOM - Y_TOP));
}

function renderGraph(scores) {
  const values = [scores.resume, scores.technical, scores.communication, scores.portfolio];
  const points = X_POSITIONS.map((x, i) => [x, scoreToY(values[i])]);

  const ptStr  = points.map(([x, y]) => `${x},${y.toFixed(1)}`).join(' ');
  const fillStr = `${X_POSITIONS[0]},${Y_BOTTOM} ` + ptStr + ` ${X_POSITIONS[3]},${Y_BOTTOM}`;

  const lineEl = document.getElementById('graphLine');
  const fillEl = document.getElementById('graphFill');
  if (lineEl) lineEl.setAttribute('points', ptStr);
  if (fillEl) fillEl.setAttribute('points', fillStr);

  points.forEach(([x, y], i) => {
    const pt = document.getElementById(`pt${i}`);
    if (pt) { pt.setAttribute('cx', x); pt.setAttribute('cy', y.toFixed(1)); }
  });
}

// ── Scoring Functions ─────────────────────────────────────────────────────────
function scoreResume() {
  const keywords = document.querySelector("#jobKeywords").value.toLowerCase();
  const techTerms = ["sql", "oop", "react", "api", "data", "algorithm", "cloud", "aws", "python", "node", "java", "agile", "git", "ci/cd", "leadership"];
  const keywordHits = techTerms.filter((term) => keywords.includes(term)).length;
  const hasFile = resumeFile.files.length > 0;
  return clamp(20 + Math.min(keywordHits * 8, 60) + (hasFile ? 20 : 0));
}

function scoreCommunication() {
  const text = document.querySelector("#communicationText").value.trim().toLowerCase();
  if (!text) return 20;

  const words = text.split(/\s+/).filter(Boolean);
  const fillerWords = ["actually", "basically", "like", "umm", "uh", "very", "just", "kind of"]
    .filter((word) => text.includes(word)).length;
  const strongVerbs = ["built", "led", "developed", "created", "designed", "optimized", "managed", "delivered", "solved"]
    .filter(word => text.includes(word)).length;

  const lengthScore = words.length >= 25 && words.length <= 80 ? 30 : 15;
  const verbBonus   = Math.min(strongVerbs * 10, 40);
  const punctBonus  = /[.!?]/.test(text) ? 10 : 0;

  return clamp(20 + lengthScore + verbBonus + punctBonus - fillerWords * 8);
}

function scorePortfolio() {
  const base = Number(document.querySelector("#portfolioDepth").value);
  const link = document.querySelector("#portfolioLink").value.toLowerCase();

  let linkBonus = 0;
  if (link.includes("github.com/") && link.length > 15) linkBonus = 15;
  else if (link.includes("linkedin.com/in/")) linkBonus = 10;
  else if (link.length > 5) linkBonus = 5;

  return clamp((base * 0.7) + linkBonus + 15);
}

// ── UI Updates ────────────────────────────────────────────────────────────────
function updateUI(scores) {
  const score    = weightedScore(scores);
  const level    = getLevel(score);
  const scoreCard = document.querySelector("#scoreCard");

  document.querySelector("#scoreText").textContent         = score;
  document.querySelector("#levelText").textContent         = level;
  document.querySelector("#resumeMini").textContent        = scores.resume;
  document.querySelector("#techMini").textContent          = scores.technical;
  document.querySelector("#commMini").textContent          = scores.communication;
  document.querySelector("#portfolioMini").textContent     = scores.portfolio;
  document.querySelector("#meterPin").style.left           = `${score}%`;
  scoreCard.style.setProperty("--score", score);

  renderFeedback(scores);
  renderGraph(scores);
}

function renderFeedback(scores) {
  const list  = document.querySelector("#feedbackList");
  const items = Object.entries(scores).map(([key, value]) => {
    const rule    = feedbackRules[key];
    const message = value < 50 ? rule.weak : value < 72 ? `${rule.weak} ${rule.strong}` : rule.strong;

    return `
      <article class="feedback-item">
        <span class="feedback-score">${value}</span>
        <div>
          <strong>${rule.title}</strong>
          <p>${message}</p>
        </div>
      </article>
    `;
  });

  list.innerHTML = items.join("");
}

// ── Analysis Trigger ──────────────────────────────────────────────────────────
function analyze() {
  state.resume        = scoreResume();
  state.technical     = Number(document.querySelector("#technicalLevel").value);
  state.communication = scoreCommunication();
  state.portfolio     = scorePortfolio();
  updateUI(state);
}

function loadDemo() {
  document.querySelector("#jobKeywords").value =
    "React, SQL, OOP, REST APIs, data structures, leadership, product analytics";
  document.querySelector("#technicalLevel").value = "82";
  document.querySelector("#communicationText").value =
    "I am a final-year computer science student focused on full-stack engineering. I have built deployed projects using React, APIs, and SQL, and I enjoy turning messy requirements into clean user experiences. I am looking for a software role where I can contribute quickly and keep improving through real product work.";
  document.querySelector("#portfolioLink").value = "https://github.com/careerforge-student";
  document.querySelector("#portfolioDepth").value = "78";
  fileName.textContent = "Premium demo resume loaded";
  analyze();
}

// ── Event Listeners ───────────────────────────────────────────────────────────
form.addEventListener("submit", (event) => {
  event.preventDefault();
  analyze();
});

resumeFile.addEventListener("change", () => {
  fileName.textContent = resumeFile.files[0]?.name || "PDF, DOC, or DOCX";
  analyze();
});

demoBtn.addEventListener("click", loadDemo);

resetBtn.addEventListener("click", () => {
  form.reset();
  fileName.textContent = "PDF, DOC, or DOCX";
  analyze();
});

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateUI(state);
});
