let chartInstance = null;
let db = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch JSON (with bulletproof fallback for local file:// execution)
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Fetch failed");
        db = await response.json();
    } catch (e) {
        console.log("Loading offline fallback data...");
        db = getFallbackData(); // Uses embedded data below to prevent blank screens
    }

    // 2. Initialize Original Features
    initNavigation();
    initThemeToggle();
    initCarousel();
    initLeaderboard();
    initChatbot();

    // 3. Initialize New Features
    initSearch();
    initComparison();
});

// --- Original Logic Restored ---
function initNavigation() {
    const links = document.querySelectorAll('#main-nav a');
    const sections = document.querySelectorAll('.card:not(#chatbot-window)'); // Exclude chatbot from cards

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('data-target');
            sections.forEach(sec => {
                if(sec.id === targetId) {
                    sec.classList.remove('hidden');
                    sec.classList.add('active-section');
                } else {
                    sec.classList.add('hidden');
                    sec.classList.remove('active-section');
                }
            });
        });
    });
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    btn.addEventListener('click', () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        html.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
    });
}

// Carousel
let currIdx = 0;
function initCarousel() { updateUI(); }

function updateUI() {
    const leg = db.legends[currIdx];
    document.getElementById('leg-name').innerText = `${leg.name} ${leg.emoji}`;
    document.getElementById('leg-desc').innerText = leg.description;
    document.getElementById('leg-score').innerText = leg.impact_score;
    document.getElementById('leg-role').innerText = leg.role;
}

document.getElementById('next-legend').addEventListener('click', () => {
    currIdx = (currIdx + 1) % db.legends.length;
    updateUI();
});

document.getElementById('prev-legend').addEventListener('click', () => {
    currIdx = (currIdx - 1 + db.legends.length) % db.legends.length;
    updateUI();
});

// Chatbot (Fully Restored)
function initChatbot() {
    const toggle = document.getElementById('chat-toggle');
    const windowEl = document.getElementById('chatbot-window');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-history');

    toggle.addEventListener('click', () => windowEl.classList.toggle('hidden'));

    sendBtn.addEventListener('click', () => {
        const query = input.value.trim();
        if(!query) return;

        // User Message
        history.innerHTML += `<div class="user-msg">${query}</div>`;
        input.value = '';

        // AI Reply
        setTimeout(() => {
            let response = "I specialize in cricket metrics! Try searching for Virat or Rohit.";
            if (query.toLowerCase().includes("score") || query.toLowerCase().includes("impact")) {
                response = "Impact scores are calculated using runs, strike rate, match context, and weighted recent form! 🏏";
            }
            history.innerHTML += `<div class="bot-msg">${response}</div>`;
            history.scrollTop = history.scrollHeight;
        }, 500);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });
}

// --- New Logic Integrated ---

// Leaderboard with Medals
function initLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    const sortedPlayers = Object.entries(db.players)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.impact - a.impact);

    sortedPlayers.forEach((p, index) => {
        const tr = document.createElement('tr');
        let rankDisplay = index + 1;
        let rowClass = "";

        if (index === 0) { rankDisplay = "🥇 1"; rowClass = "rank-gold"; }
        else if (index === 1) { rankDisplay = "🥈 2"; rowClass = "rank-silver"; }
        else if (index === 2) { rankDisplay = "🥉 3"; rowClass = "rank-bronze"; }

        tr.className = rowClass;
        tr.innerHTML = `
            <td><b>${rankDisplay}</b></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.role}</td>
            <td class="leader-score">${p.impact.toFixed(1)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Global Search Map to Profile
function initSearch() {
    const searchInput = document.getElementById('global-search');
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.toLowerCase().trim();
            const matchedKey = Object.keys(db.players).find(k => k.toLowerCase().includes(query));
            
            if (matchedKey) {
                renderPlayerProfile(matchedKey, db.players[matchedKey]);
                // Switch to Player tab automatically
                document.querySelector('[data-target="performance-section"]').click();
                searchInput.value = '';
            } else {
                alert(`Player "${query}" not found in database.`);
            }
        }
    });
}

// Render Player Profile Chart
function renderPlayerProfile(name, data) {
    document.getElementById('perf-name').innerText = name;
    document.getElementById('perf-role').innerText = data.role;
    document.getElementById('perf-country').innerText = data.country;
    document.getElementById('perf-impact').innerText = data.impact.toFixed(1);
    document.getElementById('perf-runs').innerText = data.runs;
    document.getElementById('perf-wickets').innerText = data.wickets;
    document.getElementById('perf-avg').innerText = data.average.toFixed(1);
    document.getElementById('perf-sr').innerText = data.strikeRate.toFixed(1);

    const ctx = document.getElementById('performanceChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            datasets: [{
                data: data.form,
                borderColor: '#b91c1c',
                borderWidth: 8,
                pointRadius: 0,
                tension: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false, min: 0 } }
        }
    });
}

// Comparison Tool (+3.3 logic and Bar)
function initComparison() {
    const c1 = document.getElementById('comp-1');
    const c2 = document.getElementById('comp-2');
    const resultArea = document.getElementById('comp-results');

    const updateComparison = () => {
        const val1 = c1.value.toLowerCase().trim();
        const val2 = c2.value.toLowerCase().trim();

        if (val1.length < 3 || val2.length < 3) {
            resultArea.classList.remove('active');
            return;
        }

        const k1 = Object.keys(db.players).find(k => k.toLowerCase().includes(val1));
        const k2 = Object.keys(db.players).find(k => k.toLowerCase().includes(val2));

        if (k1 && k2 && k1 !== k2) {
            const p1 = db.players[k1];
            const p2 = db.players[k2];

            resultArea.classList.add('active');
            document.getElementById('name-1').innerHTML = `<strong>${k1}</strong>`;
            document.getElementById('name-2').innerHTML = `<strong>${k2}</strong>`;
            document.getElementById('score-1').innerText = p1.impact.toFixed(1);
            document.getElementById('score-2').innerText = p2.impact.toFixed(1);

            const diff = (p1.impact - p2.impact).toFixed(1);
            const p1Percentage = (p1.impact / (p1.impact + p2.impact)) * 100;
            
            document.getElementById('impact-bar').style.width = `${p1Percentage}%`;

            const winnerMsg = document.getElementById('winner-msg');
            if (diff > 0) {
                winnerMsg.innerText = `${k1} has higher impact (+${diff})`;
            } else if (diff < 0) {
                winnerMsg.innerText = `${k2} has higher impact (+${Math.abs(diff)})`;
            } else {
                winnerMsg.innerText = `Both players have equal impact.`;
            }
        } else {
            resultArea.classList.remove('active');
        }
    };

    c1.addEventListener('input', updateComparison);
    c2.addEventListener('input', updateComparison);
}

// --- Bulletproof Offline Fallback ---
// This ensures your screen never goes blank when opening directly from files.
function getFallbackData() {
    return {
      "legends": [
        { "name": "Sachin Tendulkar", "impact_score": 99.2, "description": "The 'Little Master' redefined batting longevity and excellence over two decades.", "emoji": "🎯", "role": "Retired Legend" },
        { "name": "Ricky Ponting", "impact_score": 98.5, "description": "Master batsman and ruthless tactician. Led Australia to two consecutive World Cups.", "emoji": "🐯", "role": "Retired Captain" },
        { "name": "AB de Villiers", "impact_score": 99.1, "description": "Mr. 360, a modern-day genius capable of innovative boundary hitting at impossible angles.", "emoji": "👽", "role": "Retired Legend" },
        { "name": "MS Dhoni", "impact_score": 97.5, "description": "Captain Cool. The ultimate finisher and tactician behind the stumps.", "emoji": "🚁", "role": "Wicketkeeper Batsman" }
      ],
      "players": {
        "Virat Kohli": { "role": "Batsman", "country": "India", "impact": 94.5, "runs": 12898, "wickets": 4, "average": 57.3, "strikeRate": 93.2, "form": [10, 25, 45, 20, 15, 60, 40, 50, 20, 35, 45] },
        "Rohit Sharma": { "role": "Batsman", "country": "India", "impact": 91.2, "runs": 11543, "wickets": 15, "average": 49.1, "strikeRate": 139.8, "form": [30, 40, 20, 50, 60, 40, 35, 30, 50, 35] },
        "Jasprit Bumrah": { "role": "Bowler", "country": "India", "impact": 93.8, "runs": 201, "wickets": 268, "average": 21.6, "strikeRate": 50.1, "form": [50, 45, 50, 40, 50, 45, 50, 40, 50, 45] },
        "Rashid Khan": { "role": "All-Rounder", "country": "Afghanistan", "impact": 92.1, "runs": 1500, "wickets": 250, "average": 25.5, "strikeRate": 140.2, "form": [40, 40, 40, 40, 40, 40, 40, 40, 40, 40] },
        "Steve Smith": { "role": "Batsman", "country": "Australia", "impact": 89.4, "runs": 8500, "wickets": 18, "average": 59.5, "strikeRate": 85.1, "form": [30, 25, 35, 30, 20, 30, 35, 40, 30, 25] },
        "Kane Williamson": { "role": "Batsman", "country": "New Zealand", "impact": 88.7, "runs": 7000, "wickets": 10, "average": 52.8, "strikeRate": 80.5, "form": [40, 35, 40, 30, 35, 40, 35, 40, 30, 35] }
      }
    };
}