// IMPACT IQ – Cricket Intelligence Engine
// Minimal JavaScript for UI interactions

// --- Chatbot UI Logic ---
const chatbotBtn = document.getElementById('chatbotBtn');
const chatbotPanel = document.getElementById('chatbotPanel');
const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotMessages = document.getElementById('chatbotMessages');

// Toggle chatbot panel open/close
chatbotBtn.addEventListener('click', () => {
  chatbotPanel.classList.add('open');
  chatbotInput.focus();
});

chatbotCloseBtn.addEventListener('click', () => {
  chatbotPanel.classList.remove('open');
  chatbotBtn.focus();
});

// Append user message to chat window and clear input
chatbotForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = chatbotInput.value.trim();
  if (!msg) return;
  appendMessage(msg, 'user');
  chatbotInput.value = '';
  chatbotInput.focus();
  // Optionally, scroll to bottom
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
});

// Helper: Append message to chat area
function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chatbot-message ' + (sender === 'user' ? 'user' : 'ai');
  msgDiv.textContent = text;
  chatbotMessages.appendChild(msgDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Optional: Close chatbot with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chatbotPanel.classList.contains('open')) {
    chatbotPanel.classList.remove('open');
    chatbotBtn.focus();
  }
});

// --- Navigation: Scroll to Dashboard on "Enter Dashboard" ---
const enterDashboardBtn = document.getElementById('enterDashboardBtn');
if (enterDashboardBtn) {
  enterDashboardBtn.addEventListener('click', () => {
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
  });
}

// --- Navigation: Scroll to Rolling Innings on "See How It Works" ---
const seeHowBtn = document.getElementById('seeHowBtn');
if (seeHowBtn) {
  seeHowBtn.addEventListener('click', () => {
    document.querySelector('.rolling-innings').scrollIntoView({ behavior: 'smooth' });
  });
}