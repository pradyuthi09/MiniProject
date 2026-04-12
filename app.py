import os
import json
import logging
from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
import requests
import uuid
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

app = Flask(__name__, static_folder='static', static_url_path='/static')

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

# Setup Database (MongoDB with Dict Fallback)
db = None
profiles_collection = None
mock_db = {} # Fallback in-memory database if MongoDB isn't running

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB")
    db = client['shaktipath']
    profiles_collection = db['profiles']
except Exception as e:
    logger.warning(f"Failed to connect to MongoDB ({e}). Using in-memory fallback db.")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static_root_files(path):
    return send_from_directory('.', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])
    system_prompt = data.get('system', '')
    
    # Check if API key is provided
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE" or not GEMINI_API_KEY:
        logger.warning("No Gemini API key provided. Using fallback.")
        return jsonify({
            "content": [{"text": "Namaste! 🌸 I am currently running in offline mode because the Gemini API key is missing. Add your key in the .env file and restart! 💪"}]
        })

    try:
        formatted_contents = []
        for msg in messages:
            role = "model" if msg['role'] == "assistant" else "user"
            formatted_contents.append({
                "role": role,
                "parts": [{"text": msg['content']}]
            })
            
        payload = {
            "contents": formatted_contents,
            "systemInstruction": {
                "role": "user",
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "maxOutputTokens": 1000
            }
        }
        
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        response = requests.post(api_url, headers={'Content-Type': 'application/json'}, json=payload, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Gemini API Error: {response.text}")
            return jsonify({
                "content": [{"text": f"Sorry, there was an error communicating with Google Gemini. Status: {response.status_code}"}]
            }), 500
            
        data = response.json()
        model_text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'No response.')
        
        return jsonify({
            "content": [{"text": model_text}]
        })
        
    except Exception as e:
        logger.error(f"Error in /api/chat: {e}")
        return jsonify({
            "content": [{"text": "I'm having trouble connecting right now. Please try again later! 🌸"}]
        }), 500

@app.route('/api/opportunities', methods=['POST'])
def get_opportunities():
    data = request.json
    messages = data.get('messages', [])
    system_prompt = data.get('system', '')
    
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE" or not GEMINI_API_KEY:
        logger.warning("No Gemini API key provided. Returning mocked opportunities.")
        mocked_opps = [
            {
                "title": "🧵 Home Tailoring & Boutique",
                "description": "Take orders for school uniforms, blouses, and traditional dress from neighbors and local schools. Start small and grow by word of mouth.",
                "income": "₹8,000–20,000/month",
                "type": "Home-based",
                "tips": "Start with 5 neighbors, charge ₹150–300 per item",
                "scheme": "Mudra Yojana (Shishu loan ₹50,000)"
            },
            {
                "title": "🍱 Daily Tiffin Service",
                "description": "Provide daily lunch tiffin to office workers and students. Start with 10-15 customers and grow referrals through quality food.",
                "income": "₹10,000–25,000/month",
                "type": "Home-based",
                "tips": "Offer free samples to 3 nearby offices",
                "scheme": "None"
            },
            {
                "title": "🎨 Handicraft & Embroidery Sales",
                "description": "Create and sell handmade crafts, embroidery, and decorative items online and at local markets. Meesho and WhatsApp Business work well.",
                "income": "₹5,000–18,000/month",
                "type": "Online",
                "tips": "Create a WhatsApp Business profile, post 5 photos today",
                "scheme": "PM Vishwakarma Yojana (toolkit + loan)"
            },
            {
                "title": "📚 Home Tuition Classes",
                "description": "Teach students from class 1-10 in your home or their homes. Telugu medium and English medium both have good demand.",
                "income": "₹6,000–15,000/month",
                "type": "Home-based",
                "tips": "Put a notice board at your gate offering tuitions",
                "scheme": "None"
            }
        ]
        return jsonify({"content": [{"text": json.dumps(mocked_opps)}]})

    try:
        formatted_contents = []
        for msg in messages:
            role = "model" if msg['role'] == "assistant" else "user"
            formatted_contents.append({
                "role": role,
                "parts": [{"text": msg['content']}]
            })
            
        payload = {
            "contents": formatted_contents,
            "systemInstruction": {
                "role": "user",
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "maxOutputTokens": 1200
            }
        }
        
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        response = requests.post(api_url, headers={'Content-Type': 'application/json'}, json=payload, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Gemini API Error: {response.text}")
            return jsonify({"error": "Failed to get response from AI"}), 500
            
        data = response.json()
        model_text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '[]')
        
        return jsonify({
            "content": [{"text": model_text}]
        })
        
    except Exception as e:
        logger.error(f"Error in /api/opportunities: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/profile', methods=['GET', 'POST'])
def manage_profile():
    if request.method == 'POST':
        data = request.json
        mobile = data.get('mobile')
        if not mobile:
            return jsonify({"error": "Mobile number is required as identifier."}), 400
            
        if profiles_collection is not None:
            # Upsert into MongoDB
            profiles_collection.update_one(
                {'mobile': mobile},
                {'$set': data},
                upsert=True
            )
        else:
            # Fallback
            mock_db[mobile] = data
            
        return jsonify({"success": True, "message": "Profile saved successfully"})
        
    elif request.method == 'GET':
        mobile = request.args.get('mobile')
        if not mobile:
            return jsonify({"error": "Mobile number is required."}), 400
            
        if profiles_collection is not None:
            profile = profiles_collection.find_one({'mobile': mobile}, {'_id': 0})
            if profile:
                return jsonify(profile)
            return jsonify({"error": "Profile not found"}), 404
        else:
            profile = mock_db.get(mobile)
            if profile:
                return jsonify(profile)
            return jsonify({"error": "Profile not found"}), 404

@app.route('/api/schemes', methods=['GET'])
def get_schemes():
    state = request.args.get('state')
    category = request.args.get('category')
    
    query = {}
    if state and state != 'all':
        # Many schemes are 'All India', so if someone picks a specific state,
        # we still want to show them the central schemes too.
        query['state'] = {'$in': [state, 'All India']}
    
    if category and category != 'all':
        query['category'] = category
        
    if db is not None:
        try:
            schemes_collection = db['schemes']
            schemes = list(schemes_collection.find(query, {'_id': 0}))
            if isinstance(schemes, list) and len(schemes) > 0:
                return jsonify(schemes)
            else:
                logger.warning("MongoDB connected but returned 0 schemes. Discarding DB result to try JSON fallback.")
        except Exception as e:
            logger.error(f"Error fetching schemes from MongoDB: {e}")
            
    # Fallback to JSON file if MongoDB is not available or threw an error or was empty
    logger.warning("Returning schemes from JSON fallback.")
    try:
        with open('schemes_db.json', 'r', encoding='utf-8') as f:
            all_schemes = json.load(f)
            
        filtered = []
        for s in all_schemes:
            if state and state != 'all':
                if s.get('state') != state:
                    continue
            if category and category != 'all':
                if s.get('category') != category:
                    continue
            filtered.append(s)
            
        return jsonify(filtered)
    except Exception as e:
        logger.error(f"Error reading JSON fallback: {e}")
        return jsonify([])

@app.route('/api/workers', methods=['GET', 'POST'])
def manage_workers():
    if request.method == 'GET':
        state = request.args.get('state')
        skill = request.args.get('skill')
        avail = request.args.get('avail')
        city = request.args.get('city')
        
        try:
            with open('workers_db.json', 'r', encoding='utf-8') as f:
                workers = json.load(f)
                
            filtered = []
            for w in workers:
                if state and state != 'all' and w.get('state') != state:
                    continue
                if skill and skill != 'all' and skill not in w.get('skills', []):
                    continue
                if avail and avail != 'all':
                    w_avail = w.get('avail', '')
                    if avail.lower() == 'part-time' and 'part-time' not in w_avail.lower():
                        continue
                    elif avail.lower() != 'part-time' and w_avail.lower() != avail.lower():
                        continue
                if city and city.lower() not in w.get('city', '').lower():
                    continue
                filtered.append(w)
            return jsonify(filtered)
        except Exception as e:
            logger.error(f"Error reading workers_db.json: {e}")
            return jsonify([])

    elif request.method == 'POST':
        is_form = request.content_type and 'multipart/form-data' in request.content_type
        data = dict(request.form) if is_form else (request.json or {})
        
        if 'skills' in data and isinstance(data['skills'], str):
            try:
                data['skills'] = json.loads(data['skills'])
            except:
                pass

        if 'photo' in request.files:
            f = request.files['photo']
            if f.filename != '':
                ext = f.filename.split('.')[-1]
                fname = f"photo_{uuid.uuid4().hex[:8]}.{ext}"
                os.makedirs('static/uploads', exist_ok=True)
                f.save(os.path.join('static/uploads', fname))
                data['photo_url'] = f"/static/uploads/{fname}"

        if 'video' in request.files:
            f = request.files['video']
            if f.filename != '':
                ext = f.filename.split('.')[-1]
                fname = f"video_{uuid.uuid4().hex[:8]}.{ext}"
                os.makedirs('static/uploads', exist_ok=True)
                f.save(os.path.join('static/uploads', fname))
                data['video_url'] = f"/static/uploads/{fname}"

        data['id'] = "w_" + uuid.uuid4().hex[:8]
        data['rating'] = "New"
        data['avatar'] = data.get('name', 'W')[0].upper()
        
        try:
            workers = []
            if os.path.exists('workers_db.json'):
                with open('workers_db.json', 'r', encoding='utf-8') as f:
                    workers = json.load(f)
            
            workers.insert(0, data)
            with open('workers_db.json', 'w', encoding='utf-8') as f:
                json.dump(workers, f, indent=2)
                
            return jsonify({"success": True, "message": "Worker registered!"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)
