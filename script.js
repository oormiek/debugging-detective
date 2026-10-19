const clues = [
  {
    title: "EVIDENCE A / CLIENT LOG",
    lines: [
      '<span class="time">14:03:11.042</span> <span class="good">INFO</span> Quote form validation passed',
      '<span class="time">14:03:11.109</span> <span class="good">INFO</span> POST /api/quotes initiated',
      '<span class="time">14:03:11.283</span> <span class="highlight">INFO</span> HTTP response received: 400'
    ],
    note: "The browser did submit the request and received a response. The failure happened after the form left the client."
  },
  {
    title: "EVIDENCE B / API RESPONSE",
    lines: [
      '<span class="time">14:03:11.281</span> <span class="bad">WARN</span> Request validation failed',
      '<span class="time">14:03:11.282</span> <span class="bad">DETAIL</span> Required field: email',
      '<span class="time">14:03:11.283</span> <span class="highlight">HTTP</span> 400 Bad Request'
    ],
    note: "The API rejected the request because a required email field was missing. A 400 response usually points to a malformed or invalid request, not a database outage."
  },
  {
    title: "EVIDENCE C / DATABASE TRACE",
    lines: [
      '<span class="time">14:03:11.284</span> <span class="good">INFO</span> Persistence layer not invoked',
      '<span class="time">14:03:11.285</span> <span class="good">INFO</span> Database health check: UP',
      '<span class="time">14:03:11.286</span> <span class="highlight">TRACE</span> No INSERT statement observed'
    ],
    note: "The database is healthy, but no insert was attempted. The request was rejected earlier in the API validation layer."
  }
];
const reviewed = new Set();
const evidenceButtons = [...document.querySelectorAll(".evidence-card")];
const answerButtons = [...document.querySelectorAll(".answer")];
const detail = document.getElementById("evidenceDetail");
const feedback = document.getElementById("feedback");
let solved = false;
let hintLevel = 0;

function inspectClue(index) {
  const clue = clues[index];
  reviewed.add(index);
  evidenceButtons.forEach((button, i) => {
    button.classList.toggle("active", i === index);
    if (reviewed.has(i)) button.classList.add("reviewed");
  });
  detail.innerHTML = `<p class="detail-title">${clue.title}</p>${clue.lines.map(line => `<div class="logline">${line}</div>`).join("")}<p class="logline" style="margin-top:10px;color:#90a5c0">${clue.note}</p>`;
  document.getElementById("progressText").textContent = `${reviewed.size} / 3 CLUES REVIEWED`;
  document.getElementById("progressBar").style.width = `${reviewed.size / 3 * 100}%`;
}
evidenceButtons.forEach(button => button.addEventListener("click", () => inspectClue(Number(button.dataset.clue))));

answerButtons.forEach(button => button.addEventListener("click", () => {
  if (solved) return;
  const choice = Number(button.dataset.answer);
  answerButtons.forEach(b => b.classList.remove("selected", "correct", "incorrect"));
  button.classList.add("selected");
  if (choice === 1) {
    solved = true;
    button.classList.add("correct");
    feedback.className = "feedback success";
    feedback.textContent = "ROOT CAUSE IDENTIFIED. The API rejected an invalid request before it reached the persistence layer.";
    document.getElementById("success").classList.remove("hidden");
    document.getElementById("success").scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    button.classList.add("incorrect");
    feedback.className = "feedback error";
    feedback.textContent = choice === 0
      ? "Not quite. The database health check says UP, and no insert was attempted. Inspect the API response."
      : "Not quite. The client log confirms that the browser submitted the form and received an HTTP response. Follow the request to the next layer.";
  }
}));

document.getElementById("hintBtn").addEventListener("click", () => {
  hintLevel++;
  feedback.className = "feedback";
  const hints = [
    "Hint 1: Start with the client log. Did the request leave the browser?",
    "Hint 2: HTTP 400 usually means the server received a request it couldn't accept. Check the API evidence.",
    "Hint 3: Evidence B names the missing required field. Evidence C confirms the database wasn't the source of the failure."
  ];
  feedback.textContent = hints[Math.min(hintLevel - 1, hints.length - 1)];
});
document.getElementById("resetBtn").addEventListener("click", () => {
  reviewed.clear(); solved = false; hintLevel = 0;
  evidenceButtons.forEach(b => b.classList.remove("active", "reviewed"));
  answerButtons.forEach(b => b.classList.remove("selected", "correct", "incorrect"));
  detail.innerHTML = '<div class="detail-placeholder"><span class="scan-icon">⌕</span><strong>Evidence awaits inspection</strong><span>Select a file above to reveal its contents.</span></div>';
  feedback.className = "feedback"; feedback.textContent = "";
  document.getElementById("progressText").textContent = "0 / 3 CLUES REVIEWED";
  document.getElementById("progressBar").style.width = "0";
  document.getElementById("success").classList.add("hidden");
  document.getElementById("secret").classList.add("hidden");
});
document.getElementById("bonusBtn").addEventListener("click", () => {
  document.getElementById("secret").classList.remove("hidden");
  document.getElementById("secret").scrollIntoView({ behavior: "smooth", block: "center" });
});
document.getElementById("clock").textContent = "ALL SYSTEMS NOMINAL";

// Hidden keyboard Easter egg: type DETECTIVE anywhere on the page.
let typed = "";
const secretWord = "DETECTIVE";
document.addEventListener("keydown", event => {
  if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) return;
  typed = (typed + event.key.toUpperCase()).slice(-secretWord.length);
  if (typed === secretWord) {
    const secret = document.getElementById("secret");
    secret.classList.remove("hidden");
    secret.scrollIntoView({ behavior: "smooth", block: "center" });
    typed = "";
  }
});
