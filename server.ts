import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialization of Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return null;
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Chatbot endpoint
  app.post('/api/chat', async (req, res) => {
    const { message, history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const {
      role = 'customer',
      language = 'en',
      activeTab = 'marketplace',
      userName = 'User',
    } = context;

    const systemInstruction = `You are FarmEra AI Assistant (also known as "Kisan Sahayak" / "FarmEra Companion"), a highly knowledgeable, empathetic, and practical AI assistant embedded in the FarmEra direct farmer-to-consumer agricultural platform.

Platform Context & Mission:
- FarmEra directly connects Indian farmers and FPOs (Farmer Producer Organizations) with consumers and bulk buyers, completely cutting out exploitative middlemen and mandi commissions (which usually take 40-50% cut).
- Farmers receive 95%+ of the customer payment directly into their bank accounts within 24 hours.
- Customers get farm-fresh produce harvested less than 24 hours ago at prices lower than supermarkets.
- Digital Farm Passport: QR-code enabled passport showing live GPS-verified camera photos of harvest, soil practices, organic inputs (Panchagavya, Jeevamrutham, Neem oil), and complete seed-to-harvest journey.
- Freshness TTL: Real-time freshness countdown with automatic discounts for crops nearing shelf-life to eliminate food waste.
- AI Demand Forecasting: Predictive crop demand based on festive seasons, regional arrivals, and weather.
- AI Route Optimization: Smart delivery clustering saving 30%+ fuel and reducing delivery time to under 4 hours.

Your Capabilities:
1. Agronomy & Farmer Support: Advise farmers on natural farming (ZBNF), organic pest solutions (neem extract, agniastra, dashparni ark), soil preparation, irrigation, harvest timing, and listing produce on FarmEra.
2. Consumer & Buyer Support: Recommend seasonal produce, explain how direct pricing saves them money, guide them on vegetable/fruit shelf life & storage tips, healthy recipes, and how to verify farm origin via QR passports.
3. Platform Navigation: Guide users on how to scan farm passports, use the AI demand forecast, optimize delivery routes, or check order tracking.
4. Multilingual: If the user communicates in or requests Tamil (தமிழ்) or Hindi (हिन्दी), respond fluently and naturally in that language. You can also provide transliterated help if appropriate.

Active User Info:
- User Name: ${userName}
- Active Role: ${role} (${role === 'farmer' ? 'Farmer / FPO Producer' : role === 'bulk_buyer' ? 'Commercial Bulk Buyer' : 'Household Consumer'})
- Platform Section: ${activeTab}
- Preferred UI Language: ${language}

Tone: Warm, encouraging, respectful ("Namaste / Vanakkam / Greetings"), practical, concise, and structured with bullet points or bold highlights where appropriate. Keep responses crisp and easy to read on mobile.`;

    const ai = getGenAI();

    if (ai) {
      try {
        // Build conversation contents
        // Format history into parts
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(history) && history.length > 0) {
          for (const msg of history.slice(-6)) {
            if (msg.role === 'user' || msg.role === 'model') {
              contents.push({
                role: msg.role,
                parts: [{ text: String(msg.content) }],
              });
            }
          }
        }

        // Add current user message
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        const reply = response.text || 'I am here to help you with anything on FarmEra!';

        return res.json({
          reply,
          source: 'gemini-3.8-flash',
        });
      } catch (err: any) {
        console.error('Gemini API call failed, falling back to smart platform response:', err?.message || err);
        // Fallback to intelligent local response below
      }
    }

    // Intelligent domain-specific fallback when GEMINI_API_KEY is not configured or fails
    const fallbackReply = generateDomainFallback(message, role, language);
    return res.json({
      reply: fallbackReply,
      source: 'domain-fallback',
    });
  });

  // AI Weather & Agro-Advisory Endpoint
  app.post('/api/weather/advisory', async (req, res) => {
    const { location, weather, crop, language = 'en' } = req.body;

    const locName = location?.name || 'Local Farm Basin';
    const temp = weather?.currentTempC ?? 28;
    const humidity = weather?.humidityPercent ?? 65;
    const windSpeed = weather?.windSpeedKmh ?? 10;
    const rainProb = weather?.rainProbability ?? 15;
    const weatherDesc = weather?.weatherDescription || 'Clear';
    const targetCrop = crop || 'Country Tomatoes & Vegetables';

    const systemInstruction = `You are FarmEra Kisan Weather Advisor, an elite agronomic and agro-meteorological AI specialist helping Indian farmers make climate-smart decisions.
Generate practical, structured agronomic guidance for farmers based on real-time weather predictions.
Always include:
1. Spraying Window: Suitability and exact optimal hours (considering wind and humidity).
2. Irrigation Action: Specific volume or whether to pause drip irrigation.
3. Harvest Readiness & Risk: Safe harvest window vs imminent rain spoil.
4. Natural Pest / Disease Countermeasures: Organic solutions (Neem, Panchagavya, Sour buttermilk, Trichoderma, Agniastra).
5. Consumer / Market Outlook: How this local weather affects farm-fresh delivery or crop availability.

Respond in ${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}. Keep it crisp, well-structured with clear bullet points.`;

    const prompt = `Location: ${locName} (${location?.district || ''}, ${location?.state || ''})
Current Weather: ${weatherDesc}, Temp: ${temp}°C, Humidity: ${humidity}%, Wind: ${windSpeed} km/h, Rain Probability: ${rainProb}%, Soil Moisture: ${weather?.soilMoistureEstimatePercent ?? 55}%
Target Crop: ${targetCrop}

Please generate an immediate, actionable Kisan agro-weather advisory for today and tomorrow.`;

    const ai = getGenAI();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.6,
            topP: 0.95,
          },
        });

        if (response.text) {
          return res.json({
            advisory: response.text,
            source: 'gemini-3.8-flash',
          });
        }
      } catch (err: any) {
        console.error('Gemini weather advisory failed, using fallback:', err?.message || err);
      }
    }

    // Dynamic agronomic fallback
    const fallbackAdvisory = generateWeatherFallback(locName, targetCrop, temp, humidity, windSpeed, rainProb, language);
    return res.json({
      advisory: fallbackAdvisory,
      source: 'domain-fallback',
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateDomainFallback(query: string, role: string, language: string): string {
  const q = query.toLowerCase();

  if (language === 'ta') {
    if (q.includes('விலை') || q.includes('price') || q.includes('சேமிப்பு')) {
      return `**வணக்கம்! FarmEra நேரடி விலை திட்டம்:**\n\n- இடைத்தரகர்கள் மற்றும் மண்டி கமிஷன் 40% முற்றிலும் நீக்கப்பட்டுள்ளது.\n- விவசாயிகளுக்கு 95%+ நேரடி வங்கி வரவு கிடைக்கிறது.\n- வாடிக்கையாளர்களுக்கு பல்பொருள் அங்காடிகளை விட 25-35% குறைவான விலையில் தரமான காய்கறிகள் கிடைக்கின்றன.\n- 'Fresh Marketplace' பகுதியில் தற்போதைய அறுவடை விலைகளை பார்வையிடலாம்!`;
    }
    if (q.includes('பாஸ்போர்ட்') || q.includes('passport') || q.includes('qr')) {
      return `**டிஜிட்டல் பண்ணை பாஸ்போர்ட் (Digital Farm Passport):**\n\n- ஒவ்வொரு பயிரின் QR குறியீட்டை ஸ்கேன் செய்து பண்ணையின் இருப்பிடம், மண் வகை மற்றும் இயற்கை உரம் (பஞ்சகாவ்யா, ஜீவாமிர்தம்) விவரங்களை சரிபார்க்கலாம்.\n- ஜிபிஎஸ் நேரடி புகைப்பட சரிபார்ப்புடன் 100% நம்பகத்தன்மை உறுதி செய்யப்படுகிறது!`;
    }
    return `**வணக்கம்! FarmEra AI உதவியாளர்:**\n\nநான் இயற்கை விவசாய முறைகள், பயிர் நோய்த்தடுப்பு, நேரடி மண்டி விலைகள் மற்றும் புதிய விளைபொருட்களைப் பற்றி உங்களுக்கு உதவ முடியும். நீங்கள் என்ன அறிய விரும்புகிறீர்கள்?`;
  }

  if (language === 'hi') {
    if (q.includes('कीमत') || q.includes('price') || q.includes('मंडी')) {
      return `**नमस्ते! FarmEra डायरेक्ट मूल्य निर्धारण लाभ:**\n\n- बिचौलियों और मंडी दलालों का 40% कमीशन पूरी तरह समाप्त।\n- किसानों को 95%+ सीधा बैंक भुगतान 24 घंटे में।\n- ग्राहकों को बाज़ार से 25-35% कम दाम पर ताज़ी फसल।\n- 'Marketplace' में लाइव भाव और सुपरमार्केट तुलना देखें!`;
    }
    return `**नमस्ते! FarmEra किसान व ग्राहक AI सहायक:**\n\nमैं जैविक खेती (जीवामृत, पंचगव्य), फसल रोग नियंत्रण, डिजिटल फार्म पासपोर्ट और उचित मूल्य पर आपकी सहायता के लिए तैयार हूँ। आप क्या जानना चाहते हैं?`;
  }

  // English fallback responses based on keywords
  if (q.includes('middlemen') || q.includes('commission') || q.includes('price') || q.includes('pricing') || q.includes('earn')) {
    return `**How FarmEra Eliminates Middlemen & Delivers Direct Value:**\n\n1. **Zero Mandi Commission**: Traditional supply chains add 40-50% markups across commission agents, wholesalers, and loaders. FarmEra eliminates this entirely.\n2. **Direct Bank Settlement**: Farmers receive **95%+ of customer payments** straight to their bank accounts via UPI/NEFT within 24 hours of harvest dispatch.\n3. **Customer Savings**: Customers pay 20-35% less than typical organic supermarkets while getting produce harvested less than 24 hours ago.\n4. **Transparent Comparison**: On every listing card, click to see our real-time Mandi vs. FarmEra price breakdown!`;
  }

  if (q.includes('passport') || q.includes('qr') || q.includes('trace') || q.includes('origin') || q.includes('verify')) {
    return `**Digital Farm Passport & Anti-Fake Traceability:**\n\n- **Live GPS Photo Verification**: Farmers upload harvest photos captured with active geolocation and timestamp. Photos taken >500m outside farm boundaries are automatically flagged.\n- **Seed-to-Harvest Timeline**: Track every stage from sowing, organic inputs (Panchagavya, Jeevamrutham, Beejamrutham), to morning harvest.\n- **Scan Farmer QR**: Click **"Scan QR"** in the top navigation or on product packaging to view the complete farmer background, FPO affiliation, and soil health report!`;
  }

  if (q.includes('pest') || q.includes('disease') || q.includes('organic') || q.includes('fertilizer') || q.includes('neem') || q.includes('spray')) {
    return `**Natural & Organic Crop Protection Recommendations:**\n\n- **For Aphids, Thrips & Whiteflies**: Spray 5% Neem Seed Kernel Extract (NSKE) or cold-pressed Neem Oil (5ml/L of water with mild soap emulsifier) early in the morning.\n- **For Soil Health & Immunity**: Apply fermented **Jeevamrutham** (cow dung, urine, jaggery, gram flour, and virgin soil) through drip irrigation once every 14 days.\n- **For Leaf Spots & Mildew**: Foliar spray of diluted sour buttermilk (sour curd mixed 1:10 with water) acts as an effective antifungal agent.\n- **Pollination Boost**: Maintain bee boxes or marigold border crops to attract beneficial natural predators!`;
  }

  if (q.includes('fresh') || q.includes('ttl') || q.includes('shelf') || q.includes('store') || q.includes('spoilage')) {
    return `**Freshness TTL & Optimal Produce Storage:**\n\n- **Real-Time TTL Countdown**: FarmEra calculates dynamic shelf-life starting the minute the crop is handpicked at dawn.\n- **Spoilage Prevention Discounts**: Crops reaching the last 24-48 hours of optimal shelf-life automatically receive 15-30% discounts to guarantee zero food waste.\n- **Home Storage Tip**: Keep leafy greens wrapped in damp unbleached cotton cloths in the crisper drawer; keep tomatoes at ambient room temperature to preserve rich natural lycopene and aroma!`;
  }

  if (q.includes('demand') || q.includes('forecast') || q.includes('ai demand')) {
    return `**AI Demand Forecasting Module:**\n\n- Uses machine learning models analyzing upcoming regional festivals, wedding seasons, wholesale mandi arrival shortfalls, and local weather patterns.\n- Farmers can see which crops (like Country Tomatoes or Kaveri Ponni Rice) will fetch premium pricing in the next 15-30 days.\n- Check out the **"AI Demand"** tab in the navigation bar to explore live demand trends!`;
  }

  if (q.includes('route') || q.includes('delivery') || q.includes('logistics') || q.includes('truck')) {
    return `**AI Route Optimization & Smart Logistics:**\n\n- Clusters customer delivery orders from the same FPO hub into an optimal TSP (Traveling Salesperson) delivery path.\n- Saves **over 32% in transit kilometers**, reduces delivery vehicle CO2 emissions, and ensures morning-harvested produce reaches customer doorsteps in under 4 hours.\n- Explore the interactive visual route map in the **"AI Route"** tab!`;
  }

  if (q.includes('weather') || q.includes('rain') || q.includes('climate') || q.includes('spray') || q.includes('temperature') || q.includes('forecast')) {
    return `**Live Farm Weather & Kisan Agro-Advisory:**\n\n- **Micro-Climate Monitoring**: Real-time temperature, humidity, wind velocity, and precipitation probability for agricultural basins.\n- **Spraying Suitability Index**: Direct guidance on safe spraying windows (wind < 15 km/h, humidity 40-75%) to prevent chemical/organic drift and wastage.\n- **Irrigation Guidance**: Automated hold recommendations when rain showers or high soil moisture is detected.\n- **Crop-Specific Alerts**: Proactive notifications for fungal risks, fruit splitting, and harvesting windows.\n- Open the **"Live Weather"** tab in the navigation bar to inspect 24-hour and 7-day predictive models for your agricultural hub!`;
  }

  return `**Welcome to FarmEra AI Assistant!** 🌿\n\nI am here to help you get the most out of our direct farm marketplace. You can ask me about:\n\n- 🌾 **Farming & Pest Solutions**: Natural remedies (Panchagavya, Neem oil), soil health, organic certification.\n- 🌦️ **Live Weather Prediction**: 24-hour rainfall forecasts, spraying windows & irrigation holds.\n- 🍅 **Produce & Freshness**: Today's morning harvest, seasonal crops, storage tips.\n- 💰 **Fair Pricing**: How cutting 40% middlemen commissions benefits both farmers and consumers.\n- 📲 **Digital Farm Passports**: Scanning QR codes and verifying authentic farm origins.\n- 🚚 **AI Logistics & Demand**: How our predictive forecasting and route clustering work.\n\nWhat would you like to explore today?`;
}

function generateWeatherFallback(
  locName: string,
  crop: string,
  temp: number,
  humidity: number,
  windSpeed: number,
  rainProb: number,
  language: string
): string {
  const isRainLikely = rainProb > 45;
  const isWindy = windSpeed > 18;
  const isHumid = humidity > 75;

  if (language === 'ta') {
    return `🌾 **${locName} - நேரடி காலநிலை ஆலோசனை (${crop}):**\n\n` +
      `• **தெளிக்கும் நேரம் (Spraying):** ${isWindy ? 'அதிக காற்று வீசுவதால் காலை 9 மணிக்கு முன் அல்லது மாலை வேளையில் மட்டுமே தெளிக்கவும்.' : 'காலை 6:30 முதல் 9:30 வரை வேப்ப எண்ணெய் அல்லது பஞ்சகாவ்யா தெளிக்க உகந்த நேரம்.'}\n` +
      `• **நீர்ப்பாசனம் (Irrigation):** ${isRainLikely ? 'மழை வாய்ப்பு உள்ளதால் சொட்டு நீர்ப்பாசனத்தை தற்காலிகமாக நிறுத்தவும்.' : 'வழக்கமான காலை சொட்டு நீர்ப்பாசனம் தொடரலாம்.'}\n` +
      `• **அறுவடை (Harvest):** ${isRainLikely ? 'முதிர்ந்த காய்களை உடனே அறுவடை செய்து பாதுகாப்பான நிழல் இடத்தில் வைக்கவும்.' : 'காலை வேளையில் புதிய விளைபொருட்களை அறுவடை செய்ய சிறந்த நாள்.'}\n` +
      `• **இயற்கை நோய் தடுப்பு:** புளித்த மோர் கரைசல் (1:10) அல்லது சூடோமோனாஸ் தெளிப்பது பூஞ்சை நோய்களை தடுக்கும்.`;
  }

  if (language === 'hi') {
    return `🌾 **${locName} - मौसम आधारित कृषि सलाह (${crop}):**\n\n` +
      `• **छिड़काव समय (Spraying):** ${isWindy ? 'तेज़ हवा के कारण कीटनाशक का बहाव हो सकता है, शांत सुबह में ही नीम का तेल छिड़कें।' : 'सुबह 6:30 से 9:30 बजे का समय जैविक स्प्रे के लिए सर्वोत्तम है।'}\n` +
      `• **सिंचाई निर्णय (Irrigation):** ${isRainLikely ? 'बारिश की संभावना के कारण ड्रिप सिंचाई रोकें।' : 'सुबह के समय हल्की ड्रिप सिंचाई करें।'}\n` +
      `• **फसल कटाई (Harvest):** पकी हुई फसल की कटाई सुबह की ठंडी हवा में करें ताकि ताज़गी बनी रहे।\n` +
      `• **जैविक सुरक्षा:** खट्टी छाछ या नीम अर्क का छिड़काव फफूंद से सुरक्षा देगा।`;
  }

  return `🌾 **Agro-Weather Advisory for ${locName} (${crop}):**\n\n` +
    `• **Spraying Suitability Index:** ${isWindy ? '⚠️ Caution - Wind speed over 18 km/h causes drift. Restrict organic foliar sprays to calm early dawn (6:00 AM - 8:30 AM).' : '✅ Optimal - Gentle breeze allows uniform leaf canopy coverage with 5% cold-pressed neem oil.'}\n` +
    `• **Irrigation Action:** ${isRainLikely ? '🛑 Hold Irrigation - Soil moisture elevated and rainfall probability at ' + rainProb + '%. Keep drain channels open.' : '💧 Proceed with regular morning drip cycle (3-4L per plant) before 10:00 AM peak heat.'}\n` +
    `• **Harvest Timing Window:** ${isRainLikely ? '⚡ Accelerated Harvest Recommended - Harvest mature breaker-stage produce immediately to prevent skin splits from excess moisture.' : '🌟 Golden Harvest Day - Harvest at dawn when pulp temperature is cool for maximum crispness and shelf life.'}\n` +
    `• **Disease & Pest Prevention:** ${isHumid ? '🍄 Elevated Fungal Spore Index - Foliar application of fermented sour buttermilk (1:10 dilution) or Trichoderma viride recommended.' : '🛡️ Low Pest Pressure - Maintain regular predatory insect perches and marigold border traps.'}\n` +
    `• **Direct Farm-to-Consumer Impact:** Produce harvested today under these conditions preserves >90% vitamin C and ships directly within 24 hours.`;
}

startServer();

