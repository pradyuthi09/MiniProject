// ===================================================
// ShaktiPath — Women Empowerment Platform
// Main JavaScript — app.js
// ===================================================

// ===== CONFIG =====
const CHAT_API_URL = "/api/chat";
const OPP_API_URL = "/api/opportunities";

// ===== GLOBAL STATE =====
let chatHistory = [];
let isListening = false;
let autoSpeak = false;
let recognition = null;
let currentSchemeTab = 'all';

// ===== PAGE NAVIGATION =====
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);
}

// ===== SCHEME FUNCTIONS =====
let allSchemesData = [];

async function loadSchemesData() {
  try {
    const res = await fetch('/api/schemes');
    if(res.ok) {
      allSchemesData = await res.json();
      filterSchemes();
    }
  } catch(e) {
    console.error("Failed to load schemes from API:", e);
  }
}

function toggleScheme(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector('.arrow');
  const isOpen = body.classList.contains('open');
  // Close all others
  document.querySelectorAll('.scheme-body.open').forEach(b => {
    b.classList.remove('open');
    b.previousElementSibling.querySelector('.arrow').textContent = '▼';
  });
  if (!isOpen) {
    body.classList.add('open');
    arrow.textContent = '▲';
  }
}

function filterSchemes() {
  const q = document.getElementById('schemeSearch').value.toLowerCase();
  const stateFilterEl = document.getElementById('stateFilter');
  const state = stateFilterEl ? stateFilterEl.value : 'all';

  const filtered = allSchemesData.filter(s => {
    const textTarget = (s.name + " " + s.description).toLowerCase();
    const catMatch = currentSchemeTab === 'all' || s.category === currentSchemeTab;
    
    // Strict State Matching
    // If state is "all", show everything.
    // Otherwise, ensure the scheme's state exactly matches the selected state.
    const stateMatch = state === 'all' || s.state.toLowerCase() === state.toLowerCase();
    
    const searchMatch = !q || textTarget.includes(q);
    
    return catMatch && stateMatch && searchMatch;
  });

  renderSchemes(filtered);
}

let currentRenderedSchemes = [];

function renderSchemes(schemes) {
  const container = document.getElementById('schemesList');
  if(!container) return;
  container.innerHTML = '';
  
  if(schemes.length === 0) {
    container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--muted)">No schemes found matching your filters.</div>`;
    return;
  }

  currentRenderedSchemes = schemes;
  const grid = document.createElement('div');
  grid.className = 'schemes-grid';

  schemes.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = 'card scheme-card';
    
    // Default values if missing
    const badgeTxt = (s.state === 'All India' || s.state === 'Central') ? 'Central Govt' : s.state || 'Govt Scheme';
    const tagsArray = s.tags || [s.category, 'Women'];
    const timeTxt = s.time || '15-30 days';
    
    const tagsHTML = tagsArray.slice(0, 3).map(t => `<span class="sc-tag">${t}</span>`).join('');
    
    card.innerHTML = `
      <div class="sc-badge">${badgeTxt}</div>
      <div class="sc-title">${s.name}</div>
      <div class="sc-desc">${s.description || ''}</div>
      <div class="sc-tags">${tagsHTML}</div>
      <div class="sc-footer">
        <div class="sc-time">⏱️ ${timeTxt}</div>
        <button class="sc-apply-btn" onclick="openSchemeModal(${idx})">Apply Now</button>
      </div>
    `;
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
}

// Global modal function
window.openSchemeModal = function(idx) {
  const s = currentRenderedSchemes[idx];
  if(!s) return;
  
  document.getElementById('m-title').innerText = s.name;
  
  const badgeTxt = (s.state === 'All India' || s.state === 'Central') ? 'Central Govt' : s.state || 'Govt Scheme';
  document.getElementById('m-badge').innerText = badgeTxt + (s.category ? ' • ' + s.category.toUpperCase() : '');
  
  document.getElementById('m-desc').innerText = s.description || '';
  document.getElementById('m-elig').innerText = s.eligibility || 'Specific criteria apply based on state guidelines. Refer to official website.';
  document.getElementById('m-ben').innerText = s.benefits || 'Financial and social assistance.';
  
  const docList = s.documents || ['Aadhaar Card', 'Income/Caste Certificate', 'Bank Passbook', 'Passport Photo'];
  document.getElementById('m-docs').innerHTML = docList.map(d => `<li>${d}</li>`).join('');
  
  const stepList = s.steps || ['Visit respective center', 'Submit application form', 'Document Verification', 'Approval & Disbursement'];
  document.getElementById('m-steps').innerHTML = stepList.map(step => `<li>${step}</li>`).join('');
  
  document.getElementById('m-time').innerHTML = `⏱️ ${s.time || '15-30 days'}`;
  
  const applyBtn = document.querySelector('.modal-btn');
  if(applyBtn) {
    applyBtn.onclick = function() {
      if(s.link) window.open(s.link, '_blank');
      closeSchemeModal();
    };
  }
  
  document.getElementById('schemeModal').classList.add('active');
}

window.closeSchemeModal = function() {
  document.getElementById('schemeModal').classList.remove('active');
}

function filterTab(cat, btn) {
  currentSchemeTab = cat;
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterSchemes();
}

// ===== SKILL FUNCTIONS =====
function toggleSkill(chip) {
  chip.classList.toggle('selected');
}

async function findOpportunities() {
  const skills = [...document.querySelectorAll('.skill-chip.selected')]
    .map(c => c.dataset.skill || c.textContent.trim());
  const loc = document.getElementById('locationInp').value.trim() || 'rural Telangana';
  const exp = document.getElementById('expInp').value;
  const pref = document.getElementById('prefInp').value;

  if (!skills.length) {
    showToast('Please select at least one skill! 🌸');
    return;
  }

  const section = document.getElementById('opportunitiesSection');
  const list = document.getElementById('oppList');
  section.style.display = 'block';
  list.innerHTML = `
    <div class="ai-loading">
      <div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div>
      <span style="margin-left:8px;">Finding best opportunities with AI...</span>
    </div>`;
  section.scrollIntoView({ behavior: 'smooth' });

  try {
    const response = await fetch(OPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system: `You are a women empowerment advisor specializing in rural India, particularly Telangana. 
        Respond ONLY with a valid JSON array. No markdown, no backticks, no preamble, no explanation. 
        Just the raw JSON array.`,
        messages: [{
          role: 'user',
          content: `Give 4 realistic local income opportunities for a woman in ${loc} with these skills: ${skills.join(', ')}.
          Experience level: ${exp}. Work preference: ${pref}.
          Return a JSON array with exactly 4 objects. Each object must have these fields:
          - title: string (opportunity name)
          - description: string (2 sentences explaining what to do)
          - income: string (realistic monthly income range in INR like "₹5,000–15,000/month")
          - type: string (one of: "Home-based", "Local Market", "Online", "Training Program")
          - tips: string (1 specific actionable first step to start immediately)
          - scheme: string (relevant government scheme if any, or "None")`
        }]
      })
    });

    const data = await response.json();
    let text = data.content.map(i => i.text || '').join('');
    text = text.replace(/```json|```/g, '').trim();
    const opps = JSON.parse(text);

    list.innerHTML = opps.map(o => `
      <div class="opp-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;">
          <div class="opp-title">${escapeHtml(o.title)}</div>
          <span class="opp-badge">${escapeHtml(o.type)}</span>
        </div>
        <div class="opp-meta">${escapeHtml(o.description)}</div>
        <div class="opp-income">💰 ${escapeHtml(o.income)}</div>
        <div class="opp-tip">💡 First step: ${escapeHtml(o.tips)}</div>
        ${o.scheme && o.scheme !== 'None' ? `<div style="font-size:12px;color:#6A1B9A;margin-bottom:8px;">🏛️ Scheme: ${escapeHtml(o.scheme)}</div>` : ''}
        <button class="outline-sm-btn" onclick="askAI('Tell me in detail how to start: ${escapeJs(o.title)} in ${loc}. What resources do I need?')">Ask AI for Details →</button>
      </div>
    `).join('');

  } catch (e) {
    console.error('Opportunities error:', e);
    // Fallback opportunities
    list.innerHTML = `
      <div class="opp-card">
        <div class="opp-title">🧵 Home Tailoring & Boutique</div>
        <div class="opp-meta">Take orders for school uniforms, blouses, and traditional dress from neighbors and local schools. Start small and grow by word of mouth.</div>
        <div class="opp-income">💰 ₹8,000–20,000/month</div>
        <div class="opp-tip">💡 First step: Start with 5 neighbors, charge ₹150–300 per item</div>
        <div style="font-size:12px;color:#6A1B9A;margin-bottom:8px;">🏛️ Scheme: Mudra Yojana (Shishu loan ₹50,000)</div>
        <button class="outline-sm-btn" onclick="askAI('How to grow a tailoring business at home step by step?')">Ask AI →</button>
      </div>
      <div class="opp-card">
        <div class="opp-title">🍱 Daily Tiffin Service</div>
        <div class="opp-meta">Provide daily lunch tiffin to office workers and students. Start with 10-15 customers and grow referrals through quality food.</div>
        <div class="opp-income">💰 ₹10,000–25,000/month</div>
        <div class="opp-tip">💡 First step: Offer free samples to 3 nearby offices</div>
        <button class="outline-sm-btn" onclick="askAI('How to start a tiffin service from home in Telangana?')">Ask AI →</button>
      </div>
      <div class="opp-card">
        <div class="opp-title">🎨 Handicraft & Embroidery Sales</div>
        <div class="opp-meta">Create and sell handmade crafts, embroidery, and decorative items online and at local markets. Meesho and WhatsApp Business work well.</div>
        <div class="opp-income">💰 ₹5,000–18,000/month</div>
        <div class="opp-tip">💡 First step: Create a WhatsApp Business profile, post 5 photos today</div>
        <div style="font-size:12px;color:#6A1B9A;margin-bottom:8px;">🏛️ Scheme: PM Vishwakarma Yojana (toolkit + loan)</div>
        <button class="outline-sm-btn" onclick="askAI('How to sell handicrafts online through Meesho or WhatsApp?')">Ask AI →</button>
      </div>
      <div class="opp-card">
        <div class="opp-title">📚 Home Tuition Classes</div>
        <div class="opp-meta">Teach students from class 1-10 in your home or their homes. Telugu medium and English medium both have good demand.</div>
        <div class="opp-income">💰 ₹6,000–15,000/month</div>
        <div class="opp-tip">💡 First step: Put a notice board at your gate offering tuitions</div>
        <button class="outline-sm-btn" onclick="askAI('How to start home tuition classes and find students?')">Ask AI →</button>
      </div>`;
    showToast('Showing example opportunities. Add your API key for AI-powered results!');
  }
}

// ===== CHAT FUNCTIONS =====
async function sendMsg() {
  const inp = document.getElementById('chatInput');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  appendMsg('user', msg);
  chatHistory.push({ role: 'user', content: msg });
  await getAIResponse();
}

function sendQuick(msg) {
  showPage('assistant', document.querySelectorAll('.nav-btn')[1]);
  setTimeout(async () => {
    appendMsg('user', msg);
    chatHistory.push({ role: 'user', content: msg });
    await getAIResponse();
  }, 150);
}

function askAI(msg) {
  showPage('assistant', document.querySelectorAll('.nav-btn')[1]);
  setTimeout(async () => {
    appendMsg('user', msg);
    chatHistory.push({ role: 'user', content: msg });
    await getAIResponse();
  }, 150);
}

function appendMsg(role, text) {
  const msgs = document.getElementById('chatMsgs');
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  const formattedText = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/•/g, '•');
  div.innerHTML = `
    <div class="msg-avatar" style="overflow:hidden;">${role === 'user' ? '👩' : '<img src="/static/logo.png" style="width:100%;height:100%;object-fit:cover;"/>'}</div>
    <div class="msg-bubble">${formattedText}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTypingIndicator() {
  const msgs = document.getElementById('chatMsgs');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="msg-avatar" style="overflow:hidden;"><img src="/static/logo.png" style="width:100%;height:100%;object-fit:cover;"/></div>
    <div class="typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function getAIResponse() {
  showTypingIndicator();
  document.getElementById('aiStatus').textContent = 'Thinking...';

  const systemPrompt = `You are Shakti, a warm, supportive, and knowledgeable AI assistant on ShaktiPath — a Women Empowerment Platform for rural and semi-urban women in India, especially Telangana.

Your role is to help women with:
1. **Government Welfare Schemes**: Mudra Yojana, PM Jan Dhan, PMKVY skill training, PM Vishwakarma Yojana, PMMVY maternity benefit, Beti Bachao Beti Padhao, Sukanya Samriddhi, Stree Shakti loan, NRLM/DAY-NRLM, National Scheme for Women
2. **Income Opportunities**: Tailoring, cooking/tiffin service, handicrafts, beauty parlour, tuition, agriculture, dairy, SHG activities, online selling
3. **Skill Development**: PMKVY courses, digital literacy, financial literacy
4. **Motivation & Confidence Building**: Inspirational stories, positive affirmations, overcoming barriers
5. **Digital Skills**: UPI, online banking, Meesho, WhatsApp Business, online selling platforms

Guidelines:
- Be warm, encouraging, and use simple language that is easy to understand
- Occasionally use Hindi/Telugu words naturally (like "Bahut Accha!", "Nallamga!")
- Give practical, actionable advice with specific steps
- Mention relevant government schemes when applicable
- Keep responses concise (3-5 sentences or a short numbered list)
- Use emojis sparingly but warmly
- Always be supportive and never discouraging
- For scheme queries, always mention official website or where to apply`;

  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system: systemPrompt,
        messages: chatHistory.slice(-10) // Keep last 10 messages for context
      })
    });

    const data = await response.json();
    const reply = data.content.map(i => i.text || '').join('');

    document.getElementById('typing-indicator')?.remove();
    appendMsg('bot', reply);
    chatHistory.push({ role: 'assistant', content: reply });
    document.getElementById('aiStatus').textContent = 'Sakhi AI';

    if (autoSpeak && window.speechSynthesis) {
      speakText(reply.replace(/<[^>]*>/g, ''));
    }
  } catch (e) {
    console.error('Chat error:', e);
    document.getElementById('typing-indicator')?.remove();
    document.getElementById('aiStatus').textContent = 'Sakhi AI';

    const fallbacks = [
      "Namaste! 🌸 I'm here to help you. For government schemes, visit your nearest Anganwadi centre or CSC (Common Service Centre). They can help you with applications for Mudra Yojana, PMKVY, and other schemes. Is there something specific you'd like to know?",
      "To find work from home, start by joining a local Self Help Group (SHG) in your village. They offer training, loans, and connect you with markets for your products. Ask at your Gram Panchayat office for nearby SHGs! 💪",
      "You are capable of achieving great things! 🌸 Many women in your situation have built successful businesses through hard work and the right support. What skill would you like to develop first?",
      "For digital payments, you can start with a simple UPI app like PhonePe or Google Pay — they work even on basic smartphones. Visit your nearest bank to link your Jan Dhan account!"
    ];
    const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    appendMsg('bot', '⚠️ Connection issue. Please check your API key in app.js or internet connection.\n\n' + fallback);
  }
}

// ===== VOICE FUNCTIONS =====
function toggleVoice() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    showToast('Voice input not supported. Please use Chrome browser! 🎤');
    return;
  }

  if (isListening) {
    recognition && recognition.stop();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  // Detect current language from Google Translate Cookie
  let currentLang = 'en-IN'; // Default to English 
  const match = document.cookie.match(/googtrans=\/[a-z]{2}\/([a-z]{2})/);
  if (match && match[1]) {
    const gl = match[1];
    if (gl === 'hi') currentLang = 'hi-IN';
    else if (gl === 'te') currentLang = 'te-IN';
    else if (gl === 'ta') currentLang = 'ta-IN';
    else if (gl === 'mr') currentLang = 'mr-IN';
    else if (gl === 'bn') currentLang = 'bn-IN';
    else if (gl === 'en') currentLang = 'en-IN';
    else currentLang = gl + '-' + gl.toUpperCase();
  }

  recognition.lang = currentLang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    document.getElementById('voiceBtn').classList.add('listening');
    showToast(`🎤 Listening... Please speak now (${currentLang.slice(0,2).toUpperCase()})`);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('chatInput').value = transcript;
    showToast(`Heard: "${transcript}"`);
  };

  recognition.onend = () => {
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('listening');
  };

  recognition.onerror = (event) => {
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('listening');
    showToast('Voice error: ' + event.error + '. Try again!');
  };

  recognition.start();
}

function toggleAutoSpeak() {
  autoSpeak = !autoSpeak;
  const btn = document.getElementById('speakBtn');
  btn.textContent = autoSpeak ? '🔊' : '🔇';
  showToast(autoSpeak ? '🔊 Voice responses ON' : '🔇 Voice responses OFF');
  
  if (!autoSpeak && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.ttsUtterances = []; // Clear queued sentences
  }
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  // Remove emojis and formatting
  const cleanText = text.replace(/[🌸🤖📋💼✨👤💰✅📄📝🌐💡*#_]/g, '');
  
  // Split text into sentences to prevent browser TTS limit cutoffs
  const chunks = cleanText.match(/[^.!?\n]+[.!?\n]+/g) || [cleanText];
  window.ttsUtterances = []; // Prevent Garbage Collection of utterances
  
  chunks.forEach(chunk => {
    if (chunk.trim().length === 0) return;
    const utterance = new SpeechSynthesisUtterance(chunk.trim());
    utterance.lang = 'hi-IN';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    window.ttsUtterances.push(utterance);
    window.speechSynthesis.speak(utterance);
  });
}

// ===== AFFIRMATIONS =====
const affirmations = [
  '"I am capable, I am strong, and I deserve every opportunity that comes my way."',
  '"My skills are valuable. My voice matters. My dreams are absolutely worth pursuing."',
  '"Every small step I take today builds the life I deserve tomorrow."',
  '"I am not just a woman — I am a force of positive change for my family and community."',
  '"Financial independence is my right. I will work towards it with confidence and courage."',
  '"I learn something new every day. I grow stronger with every challenge I face."',
  '"I am worthy of respect, love, and every success that comes with hard work."',
  '"My children see a strong, independent woman in me. That is my greatest achievement."',
  '"I will not let fear stop me. I take one step at a time, and that is enough."',
  '"बेटी हूँ, बहन हूँ, माँ हूँ — और मैं बहुत सशक्त हूँ! (I am a daughter, sister, mother — and I am very powerful!)"'
];

let affirmationIndex = 0;

function newAffirmation() {
  affirmationIndex = (affirmationIndex + 1) % affirmations.length;
  const el = document.getElementById('affirmation');
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = affirmations[affirmationIndex];
    el.style.opacity = '1';
  }, 300);
  el.style.transition = 'opacity 0.3s';
}

// ===== PROFILE FUNCTIONS =====
window.handleProfilePhoto = function(input) {
  const file = input.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
         document.getElementById('pAvatarFallback').style.display = 'none';
         const img = document.getElementById('pAvatarImg');
         img.src = e.target.result;
         img.style.display = 'block';
         try { localStorage.setItem('shaktipath_avatar', e.target.result); } catch(e) {}
         showToast('Profile photo updated! ✨');
      };
      reader.readAsDataURL(file);
  }
}

async function saveProfile() {
  const name = document.getElementById('pName').value.trim();
  const city = document.getElementById('pCity').value.trim();
  const mobile = document.getElementById('pMobile').value.trim();
  const age = document.getElementById('pAge').value.trim();

  if (!name) { showToast('Please enter your name!'); return; }
  if (!mobile || !/^\d{10}$/.test(mobile)) { showToast('Please enter a valid 10-digit mobile number to save profile!'); return; }

  document.getElementById('profileNameDisplay').textContent = name;
  document.getElementById('profileLocationDisplay').textContent = city ? '📍 ' + city : '📍 India';

  // Keep in localStorage to remember who is logged in on refresh
  localStorage.setItem('shaktipath_mobile', mobile);

  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, mobile, age })
    });
    if (res.ok) {
      showToast('Profile saved successfully to Database! ✓');
    } else {
      showToast('Failed to save to Database ❌');
    }
  } catch (e) {
    showToast('Failed to connect to backend Database ❌');
  }
}

async function loadProfile() {
  // Try loading avatar from cache
  const cachedAvatar = localStorage.getItem('shaktipath_avatar');
  if(cachedAvatar) {
     document.getElementById('pAvatarFallback').style.display = 'none';
     const img = document.getElementById('pAvatarImg');
     img.src = cachedAvatar;
     img.style.display = 'block';
  }

  // Set Firebase Email globally on load if available
  const email = window.currentProfileEmail || null;
  const nameOverride = window.currentProfileName || null;
  
  if (email) {
     document.getElementById('profileEmailDisplay').innerText = email;
     document.getElementById('pEmail').value = email;
  }
  if (nameOverride) {
     document.getElementById('profileNameDisplay').innerText = nameOverride;
     document.getElementById('pName').value = nameOverride;
  }

  try {
    const mobile = localStorage.getItem('shaktipath_mobile');
    if (mobile) {
      const res = await fetch('/api/profile?mobile=' + mobile);
      if (res.ok) {
        const p = await res.json();
        if (p.name && !nameOverride) {
          document.getElementById('pName').value = p.name;
          document.getElementById('profileNameDisplay').textContent = p.name;
        }
        if (p.city) {
          document.getElementById('pCity').value = p.city;
          document.getElementById('profileLocationDisplay').textContent = '📍 ' + p.city;
        }
        if (p.mobile) document.getElementById('pMobile').value = p.mobile;
        if (p.age) document.getElementById('pAge').value = p.age;
      }
    }
  } catch (e) {
    console.log('Failed to fetch profile from DB', e);
  }

  // Cross reference registered worker details automatically!
  setTimeout(() => {
     if(window.currentWorkersList && window.currentProfileEmail) {
         const myWorker = window.currentWorkersList.find(w => (w.contact && w.contact.toLowerCase() === window.currentProfileEmail.toLowerCase()));
         if(myWorker) {
             document.getElementById('pRegisteredBadge').style.display = 'inline-block';
             document.getElementById('pServiceStatus').style.display = 'none';
             document.getElementById('pServiceBox').style.display = 'block';
             
             document.getElementById('pExactAddress').innerText = myWorker.exact_address || (myWorker.city + ', ' + myWorker.state);
             document.getElementById('pIncomeExp').innerText = myWorker.income || 'Not set';
             document.getElementById('pSkillsList').innerHTML = (myWorker.skills || []).map(s => `<span class="wt-tag">${escapeHtml(s)}</span>`).join('');
         }
     }
  }, 1000); // 1s delay to wait for workers file fetch to finish
}

// ===== VIDEO FUNCTION =====
function openVideo(url) {
  window.open(url, '_blank');
  showToast('Opening YouTube in new tab...');
}

// ===== LANG TOGGLE =====
function toggleLang() {
  showToast('Hindi/Telugu support coming soon! Currently in English. 🌐');
}

// ===== UTILITIES =====
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(str) {
  if (!str) return '';
  return String(str).replace(/'/g, '').replace(/"/g, '').replace(/\n/g, ' ');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadSchemesData();
  loadDirectory();

  console.log('🌸 ShaktiPath Women Empowerment Platform loaded successfully!');
  console.log('🛠️ Powered by Flask Backend and DB Integration');
  
  // Dynamic Premium Background Slideshow
  const bgSlideshow = document.getElementById('bgSlideshow');
  if (bgSlideshow) {
    const bgs = [
      'https://images.unsplash.com/photo-1596489366650-70f907b2b733?auto=format&fit=crop&q=80', // Indian women working/farming
      'https://images.unsplash.com/photo-1627857189151-5121b6d92ded?auto=format&fit=crop&q=80', // Rural India women
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80', // Indian people/culture
      'https://images.unsplash.com/photo-1623868846960-b9cc570da275?auto=format&fit=crop&q=80'  // Women entrepreneur/smile
    ];
    let currentBg = 0;
    
    function changeBg() {
      bgSlideshow.style.backgroundImage = `url('${bgs[currentBg]}')`;
      currentBg = (currentBg + 1) % bgs.length;
    }
    changeBg(); // Initial
    setInterval(changeBg, 15000); // Rotate every 15s
  }
});

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    document.getElementById('themeToggleBtn').innerText = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    document.getElementById('themeToggleBtn').innerText = '☀️';
  }
}

(function initTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    window.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.innerText = '☀️';
    });
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.innerText = '🌙';
    });
  }
})();

// ===== DIRECTORY & INBOX LOGIC =====

function addCustomSkill() {
  const inp = document.getElementById('customSkill');
  const val = inp.value.trim();
  if(!val) return;
  const chip = document.createElement('div');
  chip.className = 'skill-chip rt-chip selected';
  chip.dataset.skill = val;
  chip.innerText = val;
  chip.onclick = function() { toggleSkill(this); };
  document.getElementById('registerSkillChips').appendChild(chip);
  inp.value = '';
}

async function submitRegistration() {
  const skills = [...document.getElementById('registerSkillChips').querySelectorAll('.selected')].map(c => c.dataset.skill || c.innerText);
  const minInc = document.getElementById('regMinIncome').value;
  const maxInc = document.getElementById('regMaxIncome').value;
  const about = document.getElementById('regAbout').value;
  const state = document.getElementById('regState').value;
  const city = document.getElementById('regCity').value;
  const exactAddress = document.getElementById('regExactAddress').value;
  const avail = [...document.getElementById('registerAvailChips').querySelectorAll('.selected')].map(c => c.innerText)[0] || 'Flexible';
  const email = document.getElementById('regEmail').value.trim();
  
  const photoFile = document.getElementById('regPhoto').files[0];
  const videoFile = document.getElementById('regVideo').files[0];
  
  if(!skills.length || !minInc || !maxInc || !state || !city || !exactAddress) {
    showToast('You must fetch your exact GPS location first! 📍');
    return;
  }
  
  if(!photoFile || !videoFile) {
    showToast('Original Photo and Intro Video are MANDATORY! 📸📹');
    return;
  }
  
  const name = document.getElementById('regName').value || window.currentProfileName || "Registered Worker";
  
  const formData = new FormData();
  formData.append('name', name);
  formData.append('skills', JSON.stringify(skills));
  formData.append('income', `₹${minInc}-₹${maxInc}/mo`);
  formData.append('desc', about);
  formData.append('state', state);
  formData.append('city', city);
  formData.append('exact_address', exactAddress);
  formData.append('avail', avail);
  formData.append('exp', "New");
  formData.append('contact', email || "No email");
  formData.append('photo', photoFile);
  formData.append('video', videoFile);
  
  try {
    showToast('Uploading profile, photo, and video... 🚀');
    const res = await fetch('/api/workers', {
      method: 'POST',
      body: formData
    });
    if(res.ok) {
      showToast('Registration successful! Your profile is public.🎉');
      showPage('directory', document.querySelectorAll('.nav-btn')[3]);
      loadDirectory();
    } else {
      showToast('Error registering skills.');
    }
  } catch(e) {
    showToast('Network error.');
  }
}

async function loadDirectory() {
  const state = document.getElementById('dirState').value;
  const skill = document.getElementById('dirSkill').value;
  const avail = document.getElementById('dirAvail').value;
  const city = document.getElementById('dirCity').value;
  
  document.getElementById('dirCountText').innerText = 'Loading...';
  document.getElementById('dirCountBadge').innerText = '...';
  
  let url = `/api/workers?state=${encodeURIComponent(state)}&skill=${encodeURIComponent(skill)}&avail=${encodeURIComponent(avail)}&city=${encodeURIComponent(city)}`;
  
  try {
    const res = await fetch(url);
    const workers = await res.json();
    const grid = document.getElementById('dirGrid');
    grid.innerHTML = '';
    
    document.getElementById('dirCountText').innerText = `Showing ${workers.length} profiles`;
    document.getElementById('dirCountBadge').innerText = `${workers.length} WORKERS`;
    
    // Save workers globally to access from modal
    window.currentWorkersList = workers;
    
    workers.forEach((w, idx) => {
      const card = document.createElement('div');
      card.className = 'worker-card';
      card.style.cursor = 'pointer';
      card.onclick = () => openWorkerModal(idx);
      
      const tagsH = (w.skills || []).map(s => `<span class="wt-tag">${escapeHtml(s)}</span>`).join('');
      
      let avatarHTML = `<div class="worker-av">${escapeHtml(w.avatar || 'W')}</div>`;
      if(w.photo_url) {
          avatarHTML = `<img src="${escapeHtml(w.photo_url)}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; box-shadow:0 4px 10px rgba(0,0,0,0.1);" />`;
      }
      
      card.innerHTML = `
        <div class="worker-header">
          ${avatarHTML}
          <div>
            <div class="worker-name">${escapeHtml(w.name)} <span style="font-size:12px;color:#f39c12">&#11088; ${w.rating||'New'}</span></div>
            <div class="worker-loc">&#128205; ${escapeHtml(w.city)}, ${escapeHtml(w.state)}</div>
            <div class="worker-avail">${escapeHtml(w.avail)}</div>
          </div>
        </div>
        <div class="worker-tags">${tagsH}</div>
        <div class="worker-desc">${escapeHtml(w.desc || '')}</div>
        <div style="font-size:13px; color:#2c3e50; margin: 12px 0 8px 0; background:rgba(41, 128, 185, 0.05); padding:8px; border-radius:6px; display:block; border:1px solid rgba(41, 128, 185, 0.1);">📧 <b>Contact:</b> <a href="mailto:${escapeHtml(w.contact || '')}" style="color:#2980b9; text-decoration:none;" onclick="event.stopPropagation()">${escapeHtml(w.contact || 'No email provided')}</a></div>
        <div class="worker-stats">
          <span style="color:#d35400;">${escapeHtml(w.income)}</span>
          <span style="color:#7f8c8d;">${escapeHtml(w.exp)}</span>
        </div>
        <div style="text-align:center; font-size:12px; color:#3498db; margin-top:10px; font-weight:600;">Click to view full profile & video →</div>
      `;
      
      grid.appendChild(card);
    });
  } catch(e) {
    document.getElementById('dirCountText').innerText = 'Error loading directory';
  }
}

function clearDirFilters() {
  document.getElementById('dirState').value = 'all';
  document.getElementById('dirSkill').value = 'all';
  document.getElementById('dirAvail').value = 'all';
  document.getElementById('dirCity').value = '';
  loadDirectory();
}

// ===== WORKER MODAL LOGIC =====
window.openWorkerModal = function(idx) {
    const w = window.currentWorkersList[idx];
    if(!w) return;
    
    document.getElementById('wm-name').innerText = w.name || 'Worker';
    document.getElementById('wm-email').innerHTML = `📧 <a href="mailto:${escapeHtml(w.contact||'')}">${escapeHtml(w.contact||'No email')}</a>`;
    document.getElementById('wm-cost').innerText = `💰 Avg Cost: ${escapeHtml(w.income)}`;
    document.getElementById('wm-address').innerText = w.exact_address || `${w.city}, ${w.state}`;
    document.getElementById('wm-desc').innerText = w.desc || 'No description provided.';
    document.getElementById('wm-skills').innerHTML = (w.skills || []).map(s => `<span class="wt-tag">${escapeHtml(s)}</span>`).join('');
    
    const photoImg = document.getElementById('wm-photo');
    if(w.photo_url) {
        photoImg.src = w.photo_url;
        photoImg.style.display = 'inline-block';
    } else {
        photoImg.style.display = 'none';
        photoImg.src = '';
    }
    
    const videoEl = document.getElementById('wm-video');
    const noVideoEL = document.getElementById('wm-novideo');
    if(w.video_url) {
        videoEl.src = w.video_url;
        videoEl.style.display = 'block';
        noVideoEL.style.display = 'none';
    } else {
        videoEl.style.display = 'none';
        videoEl.src = '';
        noVideoEL.style.display = 'block';
    }
    
    document.getElementById('workerModal').classList.add('active');
}

window.addWorkerReview = function() {
    const text = prompt("Write your review for this worker:");
    if(!text) return;
    const ratingHtml = prompt("Enter a rating out of 5 (e.g. 5):") || "5";
    const name = window.currentProfileName || "Guest User";
    
    const container = document.getElementById('wm-reviews-container');
    const div = document.createElement('div');
    div.style = "background:#fff; padding:20px; border-radius:12px; margin-top:12px; border:1px solid #ecf0f1; box-shadow:0 4px 15px rgba(0,0,0,0.02);";
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
             <div style="font-weight:800; font-size:15px; color:#2c3e50;">⭐ ${escapeHtml(ratingHtml)}.0 - Custom Review</div>
             <div style="font-size:12px; color:#95a5a6;">Just now</div>
        </div>
        <p style="font-size:14px; color:#555; margin-top:10px; line-height:1.6; font-style:italic;">"${escapeHtml(text)}"</p>
        <div style="margin-top:12px; display:flex; align-items:center; gap:8px;">
             <div style="width:24px; height:24px; background:#27ae60; color:white; font-size:12px; font-weight:700; border-radius:50%; display:flex; align-items:center; justify-content:center;">${name.charAt(0).toUpperCase()}</div>
             <small style="color:#7f8c8d; font-weight:600;">Reviewed by ${escapeHtml(name)}</small>
        </div>
    `;
    container.prepend(div);
    showToast("Review submitted successfully! 🎉");
}

window.closeWorkerModal = function() {
    document.getElementById('workerModal').classList.remove('active');
    const v = document.getElementById('wm-video');
    if(v) v.pause();
}

// ===== GEOLOCATION LOGIC =====
async function performReverseGeocoding(lat, lon) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await res.json();
    return data.address;
}

window.getGPSAndFilterDir = function() {
  if (!("geolocation" in navigator)) {
    return showToast('Geolocation is not supported by your browser.');
  }
  showToast('Fetching your location... 📍');
  navigator.geolocation.getCurrentPosition(async (position) => {
      try {
          const address = await performReverseGeocoding(position.coords.latitude, position.coords.longitude);
          const city = address.city || address.town || address.village || address.county || '';
          const state = address.state || '';
          
          if (city) {
              document.getElementById('dirCity').value = city;
              const stateDropdown = document.getElementById('dirState');
              for(let i=0; i<stateDropdown.options.length; i++) {
                  if(stateDropdown.options[i].value === state) {
                      stateDropdown.options[i].selected = true;
                      break;
                  }
              }
              showToast(`Location found: ${city}! 📍 Filters applied.`);
              loadDirectory();
          } else {
              showToast('Could not fully identify city. 📍');
          }
      } catch(e) {
          showToast('Error finding city from GPS. 📍');
      }
  }, () => showToast('Location access denied! ❌'));
}

window.getGPSForRegistration = function() {
  if (!("geolocation" in navigator)) return showToast('Not supported by browser.');
  showToast('Verifying location... 📍');
  navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
          const address = await performReverseGeocoding(pos.coords.latitude, pos.coords.longitude);
          const city = address.city || address.town || address.village || address.county || '';
          if (city) document.getElementById('regCity').value = city;
          if (address.state) {
              const stateDropdown = document.getElementById('regState');
              let found = false;
              for(let i=0; i<stateDropdown.options.length; i++) {
                  if(stateDropdown.options[i].value === address.state) {
                      stateDropdown.options[i].selected = true;
                      found = true; break;
                  }
              }
              if (!found && address.state) {
                  const opt = document.createElement('option');
                  opt.value = opt.text = address.state;
                  opt.selected = true;
                  stateDropdown.add(opt);
              }
          }
          const reverseData = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`).then(r => r.json());
          if (reverseData && reverseData.display_name) {
              document.getElementById('regExactAddress').value = reverseData.display_name;
          }
          showToast('Location verified and Exact Address fetched! 📍');
      } catch(e) { showToast('Verified GPS coordinates! 📍'); }
  }, () => showToast('Location access denied! ❌'));
};

