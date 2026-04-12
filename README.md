# 🌸 ShaktiPath — AI-Powered Women Empowerment Platform

A complete web platform designed to empower rural and semi-urban women in India with:
- Government welfare scheme information
- AI-powered skill & work opportunity finder
- Motivational stories and learning videos
- Voice-assisted AI chatbot (Claude AI)
- Emergency helplines and profile management

---

## 📁 Project Structure

```
ShaktiPath/
├── index.html              ← Main HTML file (open this in browser)
├── static/
│   ├── css/
│   │   └── style.css       ← All styles and design
│   └── js/
│       └── app.js          ← All logic + Claude AI integration
└── README.md               ← This file
```

---

## 🚀 How to Run

### Option 1: Open Directly in Browser (Simplest)
1. Open the `ShaktiPath` folder
2. Double-click `index.html`
3. Platform opens in your browser — **works offline for most features!**

### Option 2: Local Web Server (Recommended for full features)

**Using Python (already installed on most computers):**
```bash
# Navigate to the ShaktiPath folder
cd ShaktiPath

# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

**Using Node.js:**
```bash
npx serve .
# Then open the URL shown
```

**Using VS Code:**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

---

## 🔑 Setting Up AI Features (Claude AI)

The platform uses **Claude AI by Anthropic** for:
- AI Assistant chatbot
- Personalized work opportunity finder

### Steps:
1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Create a free account and get your API key
3. Open `static/js/app.js` in any text editor (Notepad, VS Code, etc.)
4. Find this line at the top:
   ```javascript
   const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
   ```
5. Replace `YOUR_ANTHROPIC_API_KEY_HERE` with your actual key:
   ```javascript
   const ANTHROPIC_API_KEY = "sk-ant-api03-...your-key...";
   ```
6. Save the file and refresh the browser

> **Note:** Without the API key, the platform still works with fallback content.
> The government schemes, UI, voice input, and all other features work without an API key.

---

## ✨ Features

### 1. 🏠 Home Page
- Welcome dashboard with quick statistics
- Fast navigation tiles to all features
- Daily tips about government schemes
- Success stories preview

### 2. 🤖 AI Assistant
- Powered by Claude AI (Anthropic)
- Voice input (Hindi/English) via browser microphone
- Voice response (Text-to-Speech)
- Quick prompt buttons for common questions
- Conversation history maintained

### 3. 📋 Government Schemes
- 6 major welfare schemes with full details
- Search and filter by category
- Eligibility, documents, and application process
- Direct links to official websites
- "Ask AI" button for each scheme

### 4. 💼 Skills & Work
- Select from 12 skill categories
- Enter location for local recommendations
- AI generates 4 personalized opportunities
- Income estimates and first steps
- Links to relevant government schemes

### 5. ✨ Motivation
- 3 real-style inspiring women stories
- 5 learning video links (YouTube)
- Daily affirmations (10 rotating)
- Personal progress tracker

### 6. 👤 Profile
- Editable personal profile
- Achievement badges
- Emergency helplines (1091, 181, 100, 1098, 108, 1930)
- About section

---

## 🎤 Voice Feature
- Speak in **Hindi** or **English**
- Works in **Chrome browser** (recommended)
- Click the 🎤 microphone button in AI Assistant
- Enable voice responses with 🔊/🔇 toggle button

---

## 🌐 Supported Browsers
| Browser | AI Chat | Voice Input | Voice Response |
|---------|---------|-------------|----------------|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Firefox | ✅ | ❌ | ✅ |
| Safari | ✅ | ❌ | ✅ |
| Mobile Chrome | ✅ | ✅ | ✅ |

---

## 📱 Mobile Support
- Fully responsive design
- Touch-friendly buttons
- Works on Android phones
- Sticky navigation for easy access

---

## 🔧 Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **AI**: Claude AI API (Anthropic - claude-sonnet-4-20250514)
- **Voice**: Web Speech API (browser built-in)
- **Fonts**: Google Fonts (Baloo 2, Noto Sans)
- **Storage**: localStorage (for profile)
- **No backend required!** — Pure frontend application

---

## 🏛️ Government Schemes Covered
1. **Pradhan Mantri Mudra Yojana (PMMY)** — Business loans up to ₹10 lakh
2. **PM Jan Dhan Yojana** — Zero-balance bank account
3. **PM Kaushal Vikas Yojana (PMKVY)** — Free skill training + ₹8,000 reward
4. **PM Vishwakarma Yojana** — Artisan loan + ₹15,000 toolkit
5. **PM Matru Vandana Yojana (PMMVY)** — ₹5,000–6,000 maternity benefit
6. **Stree Shakti Package (SBI)** — Women entrepreneur loan

---

## 💼 Skills Supported
Tailoring, Cooking, Handicrafts, Tuition, Beauty Services, Art & Painting, Agriculture, Computer Skills, Yoga & Wellness, Housekeeping, Pickle/Papad Making, Childcare

---

## 📞 Emergency Helplines (Built-in)
- Women Helpline: **1091**
- Domestic Violence: **181**
- Police: **100**
- Child Helpline: **1098**
- Ambulance: **108**
- Cyber Crime: **1930**

---

## 🛠️ Customization

### Change Language
- For Telugu support, change `recognition.lang = 'hi-IN'` to `'te-IN'` in `app.js`
- For Tamil: `'ta-IN'`, Kannada: `'kn-IN'`, Marathi: `'mr-IN'`

### Add More Schemes
Add new scheme cards in `index.html` following the existing pattern with `data-cat` and `data-tags` attributes.

### Change Colors
Edit CSS variables in `static/css/style.css`:
```css
:root {
  --primary: #C2185B;     /* Main pink-red */
  --secondary: #F57C00;   /* Orange */
  --accent: #00897B;      /* Teal */
}
```

---

## 📄 Abstract Reference
This project fulfills the requirements from the abstract:
- ✅ AI-based digital women empowerment platform
- ✅ Simplified government welfare scheme information
- ✅ Skill-based work opportunity recommendation
- ✅ Motivational and confidence-building content
- ✅ Voice-enabled interaction layer
- ✅ Inclusive UI for rural/semi-urban women
- ✅ NLP via Claude AI
- ✅ Recommendation algorithms (AI-powered)
- ✅ Speech recognition and TTS

---

## 🌸 Built with love for women empowerment | 2024

*"Every woman who is empowered, empowers others."*
