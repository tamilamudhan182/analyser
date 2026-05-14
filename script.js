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

function scoreResume() {
  const keywords = document.querySelector("#jobKeywords").value.toLowerCase();
  const keywordHits = ["sql", "oop", "react", "api", "data", "algorithm", "leadership"].filter((term) =>
    keywords.includes(term)
  ).length;
  const hasFile = resumeFile.files.length > 0;
  return clamp(44 + keywordHits * 7 + (hasFile ? 18 : 0));
}

function scoreCommunication() {
  const text = document.querySelector("#communicationText").value.trim();
  if (!text) return 42;

  const words = text.split(/\s+/).filter(Boolean);
  const fillerWords = ["actually", "basically", "like", "umm", "uh", "very"].filter((word) =>
    text.toLowerCase().includes(word)
  ).length;
  const clarityBonus = words.length >= 24 && words.length <= 70 ? 22 : 8;
  const punctuationBonus = /[.!?]/.test(text) ? 8 : 0;

  return clamp(46 + clarityBonus + punctuationBonus - fillerWords * 6);
}

function scorePortfolio() {
  const base = Number(document.querySelector("#portfolioDepth").value);
  const link = document.querySelector("#portfolioLink").value.toLowerCase();
  const linkBonus = link.includes("github.com") || link.includes("linkedin.com") ? 8 : link ? 4 : 0;
  return clamp(base + linkBonus);
}

function updateUI(scores) {
  const score = weightedScore(scores);
  const level = getLevel(score);
  const scoreCard = document.querySelector("#scoreCard");

  document.querySelector("#scoreText").textContent = score;
  document.querySelector("#levelText").textContent = level;
  document.querySelector("#resumeMini").textContent = scores.resume;
  document.querySelector("#techMini").textContent = scores.technical;
  document.querySelector("#commMini").textContent = scores.communication;
  document.querySelector("#portfolioMini").textContent = scores.portfolio;
  document.querySelector("#meterPin").style.left = `${score}%`;
  scoreCard.style.setProperty("--score", score);

  renderFeedback(scores);
}

function renderFeedback(scores) {
  const list = document.querySelector("#feedbackList");
  const items = Object.entries(scores).map(([key, value]) => {
    const rule = feedbackRules[key];
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

function analyze() {
  state.resume = scoreResume();
  state.technical = Number(document.querySelector("#technicalLevel").value);
  state.communication = scoreCommunication();
  state.portfolio = scorePortfolio();
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

updateUI(state);
