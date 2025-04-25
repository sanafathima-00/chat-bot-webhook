require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.options('/webhook', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});
app.use(express.json());

const LANGUAGE_SYSTEM_PROMPTS = {
  en: 'You are a smart assistant for Indian farmers. Reply in friendly and simple English with helpful, practical advice.',
  hi: 'आप एक भारतीय किसानों के लिए स्मार्ट सहायक हैं। हमेशा मित्रवत और सरल हिंदी में उत्तर दें। व्यावहारिक सलाह दें।',
  kn: 'ನೀವು ಭಾರತೀಯ ರೈತರಿಗೆ ಬುದ್ಧಿವಂತ ಸಹಾಯಕ. ಸದಾ ಸ್ನೇಹಪೂರಿತ ಮತ್ತು ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಪ್ರತಿಸ್ಪಂದಿಸಿ.',
  ta: 'நீங்கள் இந்திய விவசாயிகளுக்கான புத்திசாலி உதவியாளர். எப்போதும் நட்பான மற்றும் எளிய தமிழில் பதிலளிக்கவும்.',
  te: 'మీరు భారతీయ రైతులకు తెలివైన సహాయకుడు. ఎప్పుడూ స్నేహపూర్వకమైన మరియు సరళమైన తెలుగు లో స్పందించండి.',
  ml: 'നിങ്ങള്‍ ഇന്ത്യന്‍ കര്‍ഷകര്‍ക്കായുള്ള സ്മാര്‍ട്ട് അസിസ്റ്റന്റാണ്. എപ്പോഴും സുഹൃദായും ലളിതവുമായ മലയാളത്തില്‍ പ്രതികരിക്കുക.',
  pa: 'ਤੁਸੀਂ ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਲਈ ਸਮਾਰਟ ਸਹਾਇਕ ਹੋ। ਹਮੇਸ਼ਾਂ ਦੋਸਤਾਨਾ ਅਤੇ ਸਧਾਰਨ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।',
  mr: 'तुम्ही भारतीय शेतकऱ्यांसाठी एक स्मार्ट सहाय्यक आहात. नेहमीच मैत्रीपूर्ण आणि सोप्या मराठीत उत्तर द्या.',
  bn: 'আপনি ভারতীয় কৃষকদের জন্য একটি স্মার্ট সহায়ক। সর্বদা বন্ধুত্বপূর্ণ এবং সহজ বাংলায় উত্তর দিন।',
  gu: 'તમે ભારતીય ખેડુતો માટે એક સ્માર્ટ સહાયક છો. હંમેશા મૈત્રીપૂર્ણ અને સરળ ગુજરાતી માં જવાબ આપો.',
  or: 'ଆପଣ ଭାରତୀୟ କୃଷକଙ୍କ ପାଇଁ ଜଣେ ସ୍ମାର୍ଟ ସହାୟକ। ସଦା ସହଜ ଓ ମୃଦୁ ଓଡ଼ିଆରେ ପ୍ରତିକ୍ରିୟା ଦିଅ।',
  as: 'আপুনি ভাৰতীয় কৃষকৰ বাবে এটা ছ্মাৰ্ট সহায়ক। সদায় সহজ আৰু বন্ধুতা পূৰ্ণ অসমীয়া ভাষাত উত্তৰ দিয়ক।',
  kok: 'तूं भारतीय शेतकऱ्यांक एक हुषार सहाय्यक आसा. सगळे वेळा मैत्रीपूर्ण आनी सोप्या कोंकणीं उत्तर दी.',
  ks: 'تُہند بھارتۍ کِسانن ہَند ایک زِہین معاون ہَے۔ ہمیشہ دوستانہ اور سادہ کشمیری میں جواب دو۔',
  ne: 'तपाईं भारतीय किसानहरूको लागि एक स्मार्ट सहायक हुनुहुन्छ। सधैं मैत्रीपूर्ण र सरल नेपालीमा उत्तर दिनुहोस्।',
  sa: 'त्वं भारतीयकृषकानां कृते एकः बुद्धिमान् सहायकः। सदा मित्रवत् सरलसंस्कृते उत्तरं दातव्यम्।',
  ur: 'آپ بھارتی کسانوں کے لیے ایک سمارٹ معاون ہیں۔ ہمیشہ دوستانہ اور آسان اردو میں جواب دیں۔',
};

app.post('/webhook', async (req, res) => {
  const { message, language = 'en' } = req.body;

  console.log('📩 Message:', message, '| Language:', language);
  if (!message) return res.status(400).json({ reply: '❗ कृपया एक संदेश भेजें।' });

  const systemPrompt = LANGUAGE_SYSTEM_PROMPTS[language] || LANGUAGE_SYSTEM_PROMPTS['en'];

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    const reply = chatCompletion.choices[0].message.content.trim();
    console.log('📤 Reply:', reply);

    res.json({ reply });
  } catch (error) {
    console.error('❌ AI Error:', error.message);
    res.status(500).json({ reply: '⚠️ कुछ गड़बड़ हो गई है। कृपया बाद में प्रयास करें।' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
