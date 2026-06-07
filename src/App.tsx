import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import * as THREE from 'three'
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  CircleDot,
  Headphones,
  Languages,
  Mic2,
  PhoneCall,
  Play,
  ShieldCheck,
  Sparkles,
  Waves,
  Workflow,
  Zap,
} from 'lucide-react'
import acousticMap from './assets/callsetu-acoustic-map.svg'
import './App.css'

const metrics = [
  { value: '2,847', label: 'leads cleaned + queued', detail: 'CSV, CRM, webhook' },
  { value: '480ms', label: 'avg turn latency', detail: 'live interruption aware' },
  { value: '11+', label: 'Indian language modes', detail: 'Hindi, Hinglish, Kannada…' },
  { value: '₹3–6', label: 'all-in cost / minute', detail: 'telephony included' },
]

const voiceScenes = [
  {
    title: 'Asha',
    meta: 'Tata test-drive coordinator',
    tone: 'Warm · Hinglish',
    accent: 'Bangalore',
    line: 'Asha confirms a Tata Nexon test drive in warm Hinglish.',
    prompt: '“Namaste Rohan ji, aapne Nexon EV test-drive ke liye interest dikhaya tha…”',
    outcome: 'Qualified · Sat 4:30 PM',
  },
  {
    title: 'Kabir',
    meta: 'Loan renewal qualifier',
    tone: 'Calm · Hindi',
    accent: 'Delhi NCR',
    line: 'Kabir qualifies a renewal lead without overpromising eligibility.',
    prompt: '“Main sirf approved policy ke hisaab se details confirm karunga.”',
    outcome: 'Eligible · advisor callback',
  },
  {
    title: 'Meera',
    meta: 'Clinic appointment desk',
    tone: 'Gentle · English',
    accent: 'Mumbai',
    line: 'Meera recovers a missed clinic call and routes urgent symptoms.',
    prompt: '“I can help with appointment timing; urgent symptoms go to staff now.”',
    outcome: 'Booked · nurse alerted',
  },
]

const storySteps = [
  ['01', 'The ring is caught', 'A fresh enquiry hits your sheet, CRM, missed-call log, or campaign queue. CallSetu answers before the lead goes cold.'],
  ['02', 'Language + intent lock in', 'The agent identifies Hinglish, Hindi, English, or regional speech, then detects intent, urgency, and objection type.'],
  ['03', 'Policy-safe conversation', 'Approved scripts, offer sheets, and escalation rules keep the AI warm without inventing pricing, promises, or medical advice.'],
  ['04', 'The business action happens', 'Appointment booked, lead scored, callback created, WhatsApp sent, CRM updated, and manager alerted when needed.'],
]

const capabilities = [
  { icon: PhoneCall, title: 'Dialer-scale outbound', copy: 'Launch thousands of warm calls from a sheet while retry logic, DND, and calling windows stay controlled.' },
  { icon: Languages, title: 'Indian voice realism', copy: 'Switch between English, Hindi, Hinglish, Kannada, Tamil, Telugu, Marathi, and brand-trained scripts.' },
  { icon: Workflow, title: 'Actions, not transcripts', copy: 'Book appointments, create callbacks, trigger WhatsApp, update CRMs, and alert human managers.' },
  { icon: ShieldCheck, title: 'Compliance guardrails', copy: 'Agents cannot invent discounts, pricing, eligibility, medical advice, or promises outside your approved playbook.' },
]

const useCases = [
  ['Auto dealers', 'Book test drives, qualify buyers, explain exchange offers, and route hot leads to showroom teams.', '73 booked slots'],
  ['Real estate', 'Call fresh enquiries in seconds, qualify budget/location, answer project FAQs, and schedule site visits.', '3.1× first-hour touches'],
  ['Clinics', 'Confirm appointments, reduce no-shows, revive old patients, and escalate urgent needs to staff.', '68% no-show risk cut'],
  ['Recruiting', 'Screen candidates, confirm availability, test language fit, and shortlist applicants at volume.', '900 calls / recruiter / day'],
]

const partners = ['Zoho', 'HubSpot', 'LeadSquared', 'Salesforce', 'WhatsApp', 'Google Sheets']

const proofStats = [
  ['<10 sec', 'lead-to-call trigger', 'fresh web/Meta/CRM leads can be dialled while intent is hot'],
  ['24/7', 'inbound + outbound coverage', 'missed calls, reminders, callbacks, renewals, and test-drive requests'],
  ['60–80%', 'repeatable calls automated', 'with humans pulled in for low confidence or sensitive requests'],
  ['CRM-ready', 'summary + recording + disposition', 'structured notes arrive where your team already works'],
]

const languages: LanguageMode[] = ['English', 'Hindi', 'Hinglish', 'Kannada', 'Tamil', 'Telugu']

type LanguageMode = 'English' | 'Hindi' | 'Hinglish' | 'Kannada' | 'Tamil' | 'Telugu'
type OperatorMode = 'Pause campaign' | 'Edit script' | 'Review low-confidence' | 'Escalate hot lead' | 'Export report'

const languageLabels: Record<LanguageMode, string> = {
  English: 'English',
  Hindi: 'हिन्दी',
  Hinglish: 'Hinglish',
  Kannada: 'ಕನ್ನಡ',
  Tamil: 'தமிழ்',
  Telugu: 'తెలుగు',
}

const pageCopy: Record<LanguageMode, {
  nav: string[]
  navCta: string
  heroEyebrow: string
  heroTitleA: string
  heroTitleB: string
  heroValue: string
  heroText: string
  heroPrimary: string
  heroSecondary: string
  heroProof: string[]
  proofEyebrow: string
  proofTitle: string
  proofText: string
  labEyebrow: string
  labTitle: string
  labText: string
  latency: string
  safetyOn: string
  nowSpeaking: string
  productEyebrow: string
  productTitle: string
  productText: string
  callQueue: string
  liveTranscript: string
  nextAction: string
  approve: string
  usecaseTitle: string
  safetyTitle: string
  pricingTitle: string
}> = {
  English: {
    nav: ['Voice lab', 'Story', 'Product', 'Use cases', 'Safety'],
    navCta: 'Book test call',
    heroEyebrow: 'Cinematic voice AI command center',
    heroTitleA: 'Every call becomes',
    heroTitleB: 'a moving story.',
    heroValue: 'AI voice agents that answer, qualify, book, and sync every customer call.',
    heroText: 'CallSetu turns lead lists into warm, multilingual conversations — then shows the journey from first ring to booked outcome with live transcripts, policy rails, CRM syncs, and human handoffs.',
    heroPrimary: 'Try a live AI call',
    heroSecondary: 'Watch the flow',
    heroProof: ['Hindi + Hinglish + regional language modes', 'First test calls after one playbook setup', 'Human handoff when the AI should stop'],
    proofEyebrow: 'Operational proof',
    proofTitle: 'Built for high-volume customer calls in India.',
    proofText: 'Not a chatbot skin — a calling system with response windows, outcomes, recordings, handoffs, and CRM-ready proof.',
    labEyebrow: 'Interactive voice lab',
    labTitle: 'Tap a voice. Watch the interface breathe.',
    labText: 'Tabs, live states, hover depth, animated waveforms, and realistic policy prompts make the product feel alive instead of static.',
    latency: 'Latency 480ms',
    safetyOn: 'Voice safety on',
    nowSpeaking: 'Now speaking',
    productEyebrow: 'Product cockpit',
    productTitle: 'From lead list to live calls in under an hour.',
    productText: 'The cockpit is now part dashboard, part animated evidence: queue, transcript, policy, outcome, and action rails in one cinematic surface.',
    callQueue: 'Call queue',
    liveTranscript: 'Live transcript',
    nextAction: 'Next action',
    approve: 'Approve + sync',
    usecaseTitle: 'Every repeatable phone playbook gets its own agent.',
    safetyTitle: 'Human warmth. Machine-level control.',
    pricingTitle: 'Your next customer is already calling. Let CallSetu answer.',
  },
  Hindi: {
    nav: ['वॉइस लैब', 'कहानी', 'प्रोडक्ट', 'यूज़ केस', 'सुरक्षा'],
    navCta: 'टेस्ट कॉल बुक करें',
    heroEyebrow: 'सिनेमैटिक वॉइस AI कमांड सेंटर',
    heroTitleA: 'हर कॉल बनती है',
    heroTitleB: 'चलती हुई कहानी।',
    heroValue: 'AI वॉइस एजेंट जो हर ग्राहक कॉल का जवाब, क्वालिफाई, बुक और सिंक करते हैं।',
    heroText: 'CallSetu लीड लिस्ट को गर्म, बहुभाषी बातचीत में बदलता है — फिर पहली रिंग से बुकिंग तक का सफ़र लाइव ट्रांसक्रिप्ट, पॉलिसी रेल, CRM सिंक और ह्यूमन हैंडऑफ के साथ दिखाता है।',
    heroPrimary: 'लाइव AI कॉल आज़माएँ',
    heroSecondary: 'फ्लो देखें',
    heroProof: ['Hindi + Hinglish + क्षेत्रीय भाषा मोड', 'एक प्लेबुक सेटअप के बाद टेस्ट कॉल', 'जब AI रुकना चाहिए तब ह्यूमन हैंडऑफ'],
    proofEyebrow: 'ऑपरेशनल प्रूफ',
    proofTitle: 'भारत की हाई-वॉल्यूम ग्राहक कॉल्स के लिए बना।',
    proofText: 'यह चैटबॉट स्किन नहीं — response windows, outcomes, recordings, handoffs और CRM-ready proof वाला calling system है।',
    labEyebrow: 'इंटरैक्टिव वॉइस लैब',
    labTitle: 'एक आवाज़ चुनें। इंटरफ़ेस को बदलते देखें।',
    labText: 'भाषा, लाइव स्टेट, वेवफ़ॉर्म और policy prompts UI को static नहीं बल्कि alive बनाते हैं।',
    latency: 'लेटेंसी 480ms',
    safetyOn: 'वॉइस सेफ़्टी ऑन',
    nowSpeaking: 'अभी बोल रहा है',
    productEyebrow: 'प्रोडक्ट कॉकपिट',
    productTitle: 'लीड लिस्ट से लाइव कॉल्स तक एक घंटे से कम में।',
    productText: 'कॉकपिट में queue, transcript, policy, outcome और action rails एक ही cinematic surface पर बदलते हैं।',
    callQueue: 'कॉल कतार',
    liveTranscript: 'लाइव ट्रांसक्रिप्ट',
    nextAction: 'अगला एक्शन',
    approve: 'Approve + sync',
    usecaseTitle: 'हर repeatable phone playbook का अपना agent।',
    safetyTitle: 'इंसानी गर्मजोशी। मशीन-लेवल कंट्रोल।',
    pricingTitle: 'आपका अगला ग्राहक पहले से कॉल कर रहा है। CallSetu को जवाब देने दें।',
  },
  Hinglish: {
    nav: ['Voice lab', 'Story', 'Product', 'Use cases', 'Safety'],
    navCta: 'Test call book karo',
    heroEyebrow: 'Cinematic voice AI command center',
    heroTitleA: 'Har call ban jaati hai',
    heroTitleB: 'ek moving story.',
    heroValue: 'AI voice agents jo answer, qualify, book aur CRM sync karte hain.',
    heroText: 'CallSetu lead lists ko warm multilingual conversations mein badalta hai — first ring se booked outcome tak live transcript, policy rails, CRM sync aur human handoff ke saath.',
    heroPrimary: 'Live AI call try karo',
    heroSecondary: 'Flow dekho',
    heroProof: ['Hindi + Hinglish + regional modes', 'One playbook ke baad first test calls', 'AI ko rukna ho toh human handoff'],
    proofEyebrow: 'Operational proof',
    proofTitle: 'India ke high-volume customer calls ke liye built.',
    proofText: 'Chatbot skin nahi — response windows, outcomes, recordings, handoffs aur CRM-ready proof wala calling system.',
    labEyebrow: 'Interactive voice lab',
    labTitle: 'Voice tap karo. Interface ko breathe karte dekho.',
    labText: 'Language, live states, waveforms aur policy prompts product ko static nahi, alive feel karwate hain.',
    latency: 'Latency 480ms',
    safetyOn: 'Voice safety on',
    nowSpeaking: 'Ab bol raha hai',
    productEyebrow: 'Product cockpit',
    productTitle: 'Lead list se live calls under one hour.',
    productText: 'Cockpit queue, transcript, policy, outcome aur action rails ko ek cinematic surface mein dikhata hai.',
    callQueue: 'Call queue',
    liveTranscript: 'Live transcript',
    nextAction: 'Next action',
    approve: 'Approve + sync',
    usecaseTitle: 'Har repeatable phone playbook ka apna agent.',
    safetyTitle: 'Human warmth. Machine-level control.',
    pricingTitle: 'Next customer already call kar raha hai. CallSetu ko answer karne do.',
  },
  Kannada: {
    nav: ['ವಾಯ್ಸ್ ಲ್ಯಾಬ್', 'ಕಥೆ', 'ಉತ್ಪನ್ನ', 'ಬಳಕೆಗಳು', 'ಭದ್ರತೆ'],
    navCta: 'ಟೆಸ್ಟ್ ಕಾಲ್ ಬುಕ್ ಮಾಡಿ',
    heroEyebrow: 'ಸಿನೆಮಾಟಿಕ್ ವಾಯ್ಸ್ AI ಕಮಾಂಡ್ ಸೆಂಟರ್',
    heroTitleA: 'ಪ್ರತಿ ಕರೆ ಆಗುತ್ತದೆ',
    heroTitleB: 'ಚಲಿಸುವ ಕಥೆ.',
    heroValue: 'ಪ್ರತಿ ಗ್ರಾಹಕ ಕರೆ answer, qualify, book ಮತ್ತು sync ಮಾಡುವ AI voice agents.',
    heroText: 'CallSetu lead lists ಅನ್ನು warm multilingual conversations ಆಗಿ ಮಾಡುತ್ತದೆ — first ring ನಿಂದ booked outcome ವರೆಗೆ live transcripts, policy rails, CRM syncs ಮತ್ತು human handoffs ಜೊತೆ.',
    heroPrimary: 'ಲೈವ್ AI ಕಾಲ್ ಪ್ರಯತ್ನಿಸಿ',
    heroSecondary: 'ಫ್ಲೋ ನೋಡಿ',
    heroProof: ['Hindi + Hinglish + regional language modes', 'ಒಂದು playbook setup ನಂತರ test calls', 'AI ನಿಲ್ಲಬೇಕಾದಾಗ human handoff'],
    proofEyebrow: 'Operational proof',
    proofTitle: 'India high-volume customer calls ಗಾಗಿ ನಿರ್ಮಿತ.',
    proofText: 'Chatbot skin ಅಲ್ಲ — response windows, outcomes, recordings, handoffs ಮತ್ತು CRM-ready proof ಇರುವ calling system.',
    labEyebrow: 'Interactive voice lab',
    labTitle: 'Voice ಆಯ್ಕೆ ಮಾಡಿ. Interface ಬದಲಾವಣೆಯನ್ನು ನೋಡಿ.',
    labText: 'Language, live states, waveforms ಮತ್ತು policy prompts product ಅನ್ನು alive ಮಾಡುತ್ತವೆ.',
    latency: 'Latency 480ms',
    safetyOn: 'Voice safety on',
    nowSpeaking: 'ಈಗ ಮಾತನಾಡುತ್ತಿದೆ',
    productEyebrow: 'Product cockpit',
    productTitle: 'Lead list ಇಂದ live calls ಗೆ ಒಂದು ಗಂಟೆಯೊಳಗೆ.',
    productText: 'Cockpit queue, transcript, policy, outcome ಮತ್ತು action rails ಅನ್ನು ಒಂದೇ cinematic surface ನಲ್ಲಿ ತೋರಿಸುತ್ತದೆ.',
    callQueue: 'Call queue',
    liveTranscript: 'Live transcript',
    nextAction: 'Next action',
    approve: 'Approve + sync',
    usecaseTitle: 'ಪ್ರತಿ repeatable phone playbook ಗೆ ತನ್ನದೇ agent.',
    safetyTitle: 'Human warmth. Machine-level control.',
    pricingTitle: 'ನಿಮ್ಮ ಮುಂದಿನ customer ಈಗಾಗಲೇ call ಮಾಡುತ್ತಿದ್ದಾರೆ. CallSetu answer ಮಾಡಲಿ.',
  },
  Tamil: {
    nav: ['வாய்ஸ் லேப்', 'கதை', 'பொருள்', 'பயன்பாடுகள்', 'பாதுகாப்பு'],
    navCta: 'டெஸ்ட் கால் பதிவு',
    heroEyebrow: 'Cinematic voice AI command center',
    heroTitleA: 'ஒவ்வொரு கால் மாறும்',
    heroTitleB: 'ஒரு நகரும் கதையாக.',
    heroValue: 'ஒவ்வொரு customer call-ஐ answer, qualify, book, sync செய்யும் AI voice agents.',
    heroText: 'CallSetu lead lists-ஐ warm multilingual conversations-ஆக மாற்றி, first ring முதல் booked outcome வரை live transcripts, policy rails, CRM syncs, human handoffs உடன் காட்டுகிறது.',
    heroPrimary: 'Live AI call முயற்சி',
    heroSecondary: 'Flow பார்க்க',
    heroProof: ['Hindi + Hinglish + regional modes', 'ஒரு playbook setupக்கு பின் test calls', 'AI நிற்க வேண்டிய இடத்தில் human handoff'],
    proofEyebrow: 'Operational proof',
    proofTitle: 'India high-volume customer calls க்காக built.',
    proofText: 'Chatbot skin அல்ல — response windows, outcomes, recordings, handoffs, CRM-ready proof கொண்ட calling system.',
    labEyebrow: 'Interactive voice lab',
    labTitle: 'Voice தேர்வு செய்யுங்கள். Interface மாறுவதைப் பாருங்கள்.',
    labText: 'Language, live states, waveforms, policy prompts product-ஐ static அல்ல alive ஆக உணரச் செய்கின்றன.',
    latency: 'Latency 480ms',
    safetyOn: 'Voice safety on',
    nowSpeaking: 'இப்போது பேசுகிறது',
    productEyebrow: 'Product cockpit',
    productTitle: 'Lead list முதல் live calls வரை ஒரு மணி நேரத்திற்குள்.',
    productText: 'Cockpit queue, transcript, policy, outcome, action rails அனைத்தையும் cinematic surface-ல் காட்டுகிறது.',
    callQueue: 'Call queue',
    liveTranscript: 'Live transcript',
    nextAction: 'Next action',
    approve: 'Approve + sync',
    usecaseTitle: 'ஒவ்வொரு repeatable phone playbook க்கும் தனி agent.',
    safetyTitle: 'Human warmth. Machine-level control.',
    pricingTitle: 'உங்கள் அடுத்த customer ஏற்கனவே call செய்கிறார். CallSetu answer செய்யட்டும்.',
  },
  Telugu: {
    nav: ['వాయిస్ ల్యాబ్', 'కథ', 'ప్రోడక్ట్', 'వినియోగాలు', 'సేఫ్టీ'],
    navCta: 'టెస్ట్ కాల్ బుక్ చేయండి',
    heroEyebrow: 'Cinematic voice AI command center',
    heroTitleA: 'ప్రతి కాల్ అవుతుంది',
    heroTitleB: 'కదిలే కథగా.',
    heroValue: 'ప్రతి customer call ను answer, qualify, book, sync చేసే AI voice agents.',
    heroText: 'CallSetu lead lists ను warm multilingual conversations గా మార్చి, first ring నుంచి booked outcome వరకు live transcripts, policy rails, CRM syncs, human handoffs తో చూపిస్తుంది.',
    heroPrimary: 'Live AI call ప్రయత్నించండి',
    heroSecondary: 'Flow చూడండి',
    heroProof: ['Hindi + Hinglish + regional modes', 'ఒక playbook setup తర్వాత test calls', 'AI ఆగాల్సినప్పుడు human handoff'],
    proofEyebrow: 'Operational proof',
    proofTitle: 'India high-volume customer calls కోసం built.',
    proofText: 'Chatbot skin కాదు — response windows, outcomes, recordings, handoffs మరియు CRM-ready proof ఉన్న calling system.',
    labEyebrow: 'Interactive voice lab',
    labTitle: 'Voice ఎంచుకోండి. Interface మారుతున్నట్టు చూడండి.',
    labText: 'Language, live states, waveforms, policy prompts product ను static కాకుండా alive గా చేస్తాయి.',
    latency: 'Latency 480ms',
    safetyOn: 'Voice safety on',
    nowSpeaking: 'ఇప్పుడు మాట్లాడుతోంది',
    productEyebrow: 'Product cockpit',
    productTitle: 'Lead list నుంచి live calls వరకు ఒక గంటలోపు.',
    productText: 'Cockpit queue, transcript, policy, outcome, action rails అన్నీ ఒక cinematic surface లో చూపిస్తుంది.',
    callQueue: 'Call queue',
    liveTranscript: 'Live transcript',
    nextAction: 'Next action',
    approve: 'Approve + sync',
    usecaseTitle: 'ప్రతి repeatable phone playbook కి తన agent.',
    safetyTitle: 'Human warmth. Machine-level control.',
    pricingTitle: 'మీ next customer ఇప్పటికే call చేస్తున్నారు. CallSetu answer చేయనివ్వండి.',
  },
}

const localizedLines: Record<LanguageMode, { customer: string; agent: string; prompt: string; voiceLine: string }> = {
  English: {
    customer: 'Can I come this Saturday?',
    agent: 'Yes, I can book that. Which showroom is closest?',
    prompt: '“Hello Rohan, you showed interest in a Nexon EV test-drive. I can help you pick the nearest showroom and slot.”',
    voiceLine: 'confirms a Tata Nexon test drive in warm English.',
  },
  Hindi: {
    customer: 'क्या मैं इस शनिवार आ सकता हूँ?',
    agent: 'हाँ, मैं स्लॉट बुक कर सकती हूँ। कौन सा showroom पास है?',
    prompt: '“Namaste Rohan ji, aapne Nexon EV test-drive ke liye interest dikhaya tha…”',
    voiceLine: 'गर्म Hindi में Tata Nexon test drive confirm करती है।',
  },
  Hinglish: {
    customer: 'Can I come this Saturday?',
    agent: 'Haan, main book kar deti hoon. Kaunsa showroom closest hai?',
    prompt: '“Namaste Rohan ji, aapne Nexon EV test-drive ke liye interest dikhaya tha…”',
    voiceLine: 'warm Hinglish mein Tata Nexon test drive confirm karti hai.',
  },
  Kannada: {
    customer: 'ಈ Saturday ಬರಬಹುದಾ?',
    agent: 'ಹೌದು, ನಾನು slot book ಮಾಡಬಹುದು. ಯಾವ showroom ಹತ್ತಿರ?',
    prompt: '“Namaskara Rohan avare, Nexon EV test-drive ge interest thorisiddiri…”',
    voiceLine: 'Bangalore Kannada-Hinglish ನಲ್ಲಿ Tata Nexon test drive confirm ಮಾಡುತ್ತಾಳೆ.',
  },
  Tamil: {
    customer: 'இந்த Saturday வரலாமா?',
    agent: 'ஆம், slot book செய்யலாம். எந்த showroom அருகில் உள்ளது?',
    prompt: '“Vanakkam Rohan, Nexon EV test-drive interest share pannirkeenga…”',
    voiceLine: 'Tamil-English mix-ல் Tata Nexon test drive confirm செய்கிறாள்.',
  },
  Telugu: {
    customer: 'ఈ Saturday రావచ్చా?',
    agent: 'అవును, slot book చేస్తాను. ఏ showroom దగ్గరగా ఉంది?',
    prompt: '“Namaskaram Rohan garu, Nexon EV test-drive meeda interest chupinchaaru…”',
    voiceLine: 'Telugu-English mix లో Tata Nexon test drive confirm చేస్తుంది.',
  },
}

const operatorScenarios: Record<OperatorMode, {
  label: OperatorMode
  state: string
  browserPath: string
  queue: string[][]
  trace: string[][]
  outcomeTitle: string
  outcomeDetail: string
  cta: string
  statusCopy: string
  pulse: string
}> = {
  'Pause campaign': {
    label: 'Pause campaign',
    state: 'paused',
    browserPath: 'campaigns/tata-nexon-q2/paused',
    queue: [
      ['Rohan P.', 'Hinglish', 'Test drive', 'Held'],
      ['Ananya S.', 'English', 'Exchange offer', 'Queued'],
      ['Vivek K.', 'Hindi', 'Callback', 'Frozen'],
      ['Mehul R.', 'Kannada', 'Retry', 'Paused'],
    ],
    trace: [
      ['00:00', 'Supervisor paused new outbound dials', 'CONTROL'],
      ['00:02', 'Active calls finish; no fresh calls started', 'QUEUE'],
      ['00:05', 'Retry window and lead ageing timers frozen', 'SAFE'],
      ['00:08', 'Manager alert sent with pause reason', 'ALERT'],
      ['00:11', 'Campaign ready to resume from exact queue state', 'SYNC'],
    ],
    outcomeTitle: 'Campaign paused safely',
    outcomeDetail: 'No new dials · active conversations finish · queue state preserved',
    cta: 'Resume campaign',
    statusCopy: 'Outbound throttle is now 0%. The UI switches from live calling to safe-hold mode.',
    pulse: 'Paused · no new dials',
  },
  'Edit script': {
    label: 'Edit script',
    state: 'editing',
    browserPath: 'campaigns/tata-nexon-q2/script-draft',
    queue: [
      ['Rohan P.', 'Hinglish', 'Test drive', 'Previewing'],
      ['Ananya S.', 'English', 'Exchange offer', 'Needs rule'],
      ['Vivek K.', 'Hindi', 'Callback', 'Script check'],
      ['Mehul R.', 'Kannada', 'Retry', 'Localized'],
    ],
    trace: [
      ['00:00', 'Script editor opened for exchange-bonus objection', 'DRAFT'],
      ['00:06', 'New approved line inserted: “offer depends on vehicle inspection”', 'POLICY'],
      ['00:14', 'Hindi, Hinglish, and Kannada variants generated for review', 'LANG'],
      ['00:24', 'Forbidden discount promise remains locked', 'GUARDRAIL'],
      ['00:32', 'Dry-run transcript updated before campaign resumes', 'PREVIEW'],
    ],
    outcomeTitle: 'Script draft staged',
    outcomeDetail: '3 language variants · 1 guardrail lock · awaiting approval',
    cta: 'Approve script',
    statusCopy: 'The transcript rail becomes a script preview and the next-action panel waits for approval.',
    pulse: 'Draft mode · calls held',
  },
  'Review low-confidence': {
    label: 'Review low-confidence',
    state: 'reviewing',
    browserPath: 'campaigns/tata-nexon-q2/review-low-confidence',
    queue: [
      ['Rohan P.', 'Hinglish', 'Test drive', '91% confident'],
      ['Ananya S.', 'English', 'Exchange offer', '64% review'],
      ['Vivek K.', 'Hindi', 'Callback', '58% review'],
      ['Mehul R.', 'Kannada', 'Not reachable', 'Retry ok'],
    ],
    trace: [
      ['00:00', 'Low-confidence filter applied to calls below 70%', 'FILTER'],
      ['00:04', 'Ananya asked for “final on-road after exchange”', 'FLAG'],
      ['00:10', 'Vivek mixed Hindi with noisy background audio', 'ASR'],
      ['00:18', 'Reviewer sees recording, transcript, and suggested disposition', 'REVIEW'],
      ['00:31', 'Approved records sync; uncertain records stay in review', 'SYNC'],
    ],
    outcomeTitle: '2 calls need review',
    outcomeDetail: 'Confidence below threshold · human decision required before CRM update',
    cta: 'Open review desk',
    statusCopy: 'The cockpit narrows to uncertain conversations and highlights confidence risk.',
    pulse: 'Review queue · 2 flagged',
  },
  'Escalate hot lead': {
    label: 'Escalate hot lead',
    state: 'escalating',
    browserPath: 'campaigns/tata-nexon-q2/hot-lead-escalation',
    queue: [
      ['Rohan P.', 'Hinglish', 'Test drive', 'Hot lead'],
      ['Ananya S.', 'English', 'Exchange offer', 'Interested'],
      ['Vivek K.', 'Hindi', 'Callback', 'Warm'],
      ['Mehul R.', 'Kannada', 'Retry', 'Cold'],
    ],
    trace: [
      ['00:00', 'Rohan asks for same-day showroom visit', 'INTENT'],
      ['00:04', 'Budget, model, and location qualify as hot lead', 'SCORE'],
      ['00:09', 'AI confirms consent to share details with salesperson', 'CONSENT'],
      ['00:15', 'Sales manager gets WhatsApp + CRM alert', 'ALERT'],
      ['00:22', 'Lead pinned to top of callback board', 'SYNC'],
    ],
    outcomeTitle: 'Hot lead escalated',
    outcomeDetail: 'Sales manager alerted · WhatsApp summary sent · callback SLA 5 min',
    cta: 'View escalation',
    statusCopy: 'The UI switches to urgency mode: score, consent, alert, and SLA become the hero.',
    pulse: 'Escalated · manager pinged',
  },
  'Export report': {
    label: 'Export report',
    state: 'exporting',
    browserPath: 'campaigns/tata-nexon-q2/export-report',
    queue: [
      ['Rohan P.', 'Hinglish', 'Test drive', 'Included'],
      ['Ananya S.', 'English', 'Exchange offer', 'Included'],
      ['Vivek K.', 'Hindi', 'Callback', 'Included'],
      ['Mehul R.', 'Kannada', 'Retry', 'Included'],
    ],
    trace: [
      ['00:00', 'Report range set to current campaign window', 'REPORT'],
      ['00:03', 'Call summaries, recordings, outcomes, and dispositions packed', 'DATA'],
      ['00:07', 'Language and confidence breakdown calculated', 'ANALYTICS'],
      ['00:11', 'CSV, PDF, and CRM export links generated', 'EXPORT'],
      ['00:16', 'Report delivered to owner and sales manager', 'DONE'],
    ],
    outcomeTitle: 'Report ready',
    outcomeDetail: 'CSV + PDF + CRM export · language split · outcome summary',
    cta: 'Download report',
    statusCopy: 'The cockpit becomes an export console with all rows included in the campaign report.',
    pulse: 'Report ready · 4 rows',
  },
}


const operatorControls: OperatorMode[] = ['Pause campaign', 'Edit script', 'Review low-confidence', 'Escalate hot lead', 'Export report']

const safetyGroups = [
  ['Consent & windows', 'DND windows, opt-outs, recording disclosures, and retry limits stay configurable.'],
  ['Policy control', 'Approved offers, forbidden claims, discount rules, and escalation paths are locked before launch.'],
  ['Human handoff', 'Low-confidence, angry callers, sensitive requests, and exception asks route to a manager.'],
  ['Audit trail', 'Recordings, transcripts, timestamps, intent, outcome, and CRM sync status are retained.'],
]

const pilotIncludes = ['1 calling playbook', '1 configured voice', 'Sheet/CRM sync', '100–500 pilot calls', 'Review dashboard']

function ThreeSignalScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))

    const group = new THREE.Group()
    scene.add(group)

    const nodeGeometry = new THREE.SphereGeometry(0.045, 16, 16)
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffd392 })
    const nodes: THREE.Mesh[] = []
    const points: THREE.Vector3[] = []

    for (let i = 0; i < 74; i += 1) {
      const angle = i * 0.71
      const radius = 1.2 + (i % 9) * 0.18
      const z = Math.sin(i * 1.17) * 1.2
      const point = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.66, z)
      points.push(point)
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone())
      node.position.copy(point)
      node.scale.setScalar(i % 7 === 0 ? 1.8 : 1)
      group.add(node)
      nodes.push(node)
    }

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff9d3d, transparent: true, opacity: 0.22 })
    for (let i = 0; i < points.length - 2; i += 2) {
      const geometry = new THREE.BufferGeometry().setFromPoints([points[i], points[(i + 7) % points.length]])
      group.add(new THREE.Line(geometry, lineMaterial))
    }

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x8df7ec, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
    for (let i = 0; i < 4; i += 1) {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(1.15 + i * 0.45, 0.006, 8, 120), ringMaterial.clone())
      torus.rotation.x = Math.PI / 2.35
      torus.rotation.z = i * 0.4
      group.add(torus)
    }

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xff9d3d, transparent: true, opacity: 0.88 }),
    )
    group.add(core)

    let pointerX = 0
    let pointerY = 0
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.65
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.45
    }
    canvas.addEventListener('pointermove', onPointerMove)

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let frame = 0
    let raf = 0
    const animate = () => {
      frame += 0.01
      group.rotation.y += prefersReduced ? 0 : 0.0028
      group.rotation.x += ((pointerY - group.rotation.x) * 0.025)
      group.rotation.z += ((pointerX - group.rotation.z) * 0.025)
      core.scale.setScalar(1 + Math.sin(frame * 3) * 0.06)
      nodes.forEach((node, index) => {
        const material = node.material as THREE.MeshBasicMaterial
        material.opacity = 0.45 + Math.sin(frame * 2 + index) * 0.18
        material.transparent = true
      })
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      nodeGeometry.dispose()
      nodeMaterial.dispose()
      lineMaterial.dispose()
      ringMaterial.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="three-scene" aria-hidden="true" />
}

function WaveBars() {
  return (
    <div className="wave-bars" aria-hidden="true">
      {Array.from({ length: 56 }).map((_, index) => (
        <motion.i
          key={index}
          initial={{ scaleY: 0.35, opacity: 0.42 }}
          animate={{ scaleY: [0.35, 1, 0.55, 0.9, 0.35], opacity: [0.42, 0.95, 0.62, 0.88, 0.42] }}
          transition={{ duration: 2.4 + (index % 7) * 0.14, repeat: Infinity, delay: index * 0.025, ease: 'easeInOut' }}
          style={{ height: `${18 + ((index * 19) % 76)}px` }}
        />
      ))}
    </div>
  )
}

function ScrollStory() {
  return (
    <section className="section story-section" aria-label="CallSetu scroll story">
      <div className="story-sticky">
        <div className="section-heading">
          <p className="eyebrow"><Sparkles size={14} /> Scroll narrative</p>
          <h2>One call becomes a business outcome.</h2>
          <p>The page now tells the product story like an interactive film: ring, understand, guide, resolve, and sync.</p>
        </div>
        <div className="story-stage" aria-hidden="true">
          <div className="phone-device">
            <div className="phone-glow" />
            <PhoneCall size={42} />
            <span>Incoming lead</span>
          </div>
          <div className="story-route"><i /><i /><i /><i /></div>
          <div className="crm-card-mini">
            <b>Outcome package</b>
            <small>Booking · summary · recording · salesperson alert</small>
          </div>
        </div>
      </div>
      <div className="story-steps">
        {storySteps.map(([num, title, copy]) => (
          <motion.article
            className="story-step"
            key={num}
            initial={{ opacity: 0.25, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.62 }}
            transition={{ duration: 0.55 }}
          >
            <span>{num}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <small>{num === '01' ? 'Source: Meta ad / missed call / CRM lead' : num === '02' ? 'Detected: language, urgency, intent, objection' : num === '03' ? 'Applied: script, offer sheet, restricted claims' : 'Synced: booking, WhatsApp, CRM, manager alert'}</small>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [activeVoice, setActiveVoice] = useState(0)
  const [activeLanguage, setActiveLanguage] = useState<LanguageMode>('Hinglish')
  const [activeOperator, setActiveOperator] = useState<OperatorMode>('Escalate hot lead')
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroProgress, [0, 1], [0, 110])
  const heroRotate = useTransform(heroProgress, [0, 1], [-4, 8])
  const active = voiceScenes[activeVoice]
  const t = pageCopy[activeLanguage]
  const localized = localizedLines[activeLanguage]
  const operator = operatorScenarios[activeOperator]
  const localizedVoiceLine = `${active.title} ${localized.voiceLine}`

  return (
    <main className="site-shell">
      <motion.div className="scroll-progress" style={{ scaleX: smoothProgress }} aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="CallSetu home">
          <span className="brand-mark"><Waves size={18} /></span>
          <span>CallSetu</span>
        </a>
        <div className="nav-links">
          <a href="#voice-lab">{t.nav[0]}</a>
          <a href="#story">{t.nav[1]}</a>
          <a href="#product">{t.nav[2]}</a>
          <a href="#use-cases">{t.nav[3]}</a>
          <a href="#safety">{t.nav[4]}</a>
        </div>
        <a className="nav-cta" href="mailto:hello@callsetu.ai?subject=Book%20a%20CallSetu%20test%20call">
          {t.navCta} <ArrowUpRight size={16} />
        </a>
      </nav>

      <section id="top" className="hero" ref={heroRef}>
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="eyebrow"><Sparkles size={14} /> {t.heroEyebrow}</p>
          <h1>
            {t.heroTitleA} <span>{t.heroTitleB}</span>
          </h1>
          <p className="hero-value">{t.heroValue}</p>
          <p className="hero-text">{t.heroText}</p>
          <div className="hero-actions">
            <a className="button primary magnet" href="mailto:hello@callsetu.ai?subject=Take%20a%20CallSetu%20test%20call"><PhoneCall size={18} /> {t.heroPrimary}</a>
            <a className="button glass magnet" href="#story"><Play size={18} /> {t.heroSecondary}</a>
          </div>
          <div className="hero-proof" aria-label="Campaign proof">
            <span><CircleDot size={13} /> {t.heroProof[0]}</span>
            <span><CircleDot size={13} /> {t.heroProof[1]}</span>
            <span><CircleDot size={13} /> {t.heroProof[2]}</span>
          </div>
        </motion.div>

        <motion.div className="hero-art" style={{ y: heroY, rotateY: heroRotate }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1 }}>
          <img className="acoustic-map" src={acousticMap} alt="Abstract acoustic map showing signal routes and call nodes" />
          <ThreeSignalScene />
          <div className="hero-orb" aria-hidden="true"><span /><span /><span /></div>
          <motion.div className="call-card floating-card top-card" animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="mini-label">LIVE AGENT</span>
            <strong>{active.title} · {active.meta}</strong>
            <p>{localized.prompt}</p>
          </motion.div>
          <motion.div className="call-card floating-card bottom-card" animate={{ y: [0, 14, 0] }} transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="mini-label">OUTCOME</span>
            <strong>{active.outcome}</strong>
            <p>Calendar sent · CRM updated · SMS queued</p>
          </motion.div>
          <div className="scene-dots" aria-label="Voice scenes">
            {voiceScenes.map((scene, index) => (
              <button className={index === activeVoice ? 'active' : ''} key={scene.title} aria-label={`${scene.title} voice scene`} onClick={() => setActiveVoice(index)}>
                <span>{scene.title}</span>
                <small>{scene.accent}</small>
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="proof-section" aria-label="CallSetu proof and operating metrics">
        <div className="proof-intro">
          <p className="eyebrow"><Sparkles size={14} /> {t.proofEyebrow}</p>
          <h2>{t.proofTitle}</h2>
          <p>{t.proofText}</p>
        </div>
        <div className="metrics">
          {metrics.map((item, index) => (
            <motion.article className="metric-card" key={item.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <small>{item.detail}</small>
            </motion.article>
          ))}
        </div>
        <div className="proof-grid">
          {proofStats.map(([value, label, detail]) => (
            <article className="proof-card" key={label}>
              <b>{value}</b>
              <span>{label}</span>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="voice-lab" className="section voice-lab">
        <div className="section-heading center">
          <p className="eyebrow"><Mic2 size={14} /> {t.labEyebrow}</p>
          <h2>{t.labTitle}</h2>
          <p>{t.labText}</p>
        </div>
        <div className="lab-shell">
          <aside className="voice-list">
            {voiceScenes.map((voice, index) => (
              <button className={index === activeVoice ? 'selected' : ''} key={voice.title} onClick={() => setActiveVoice(index)}>
                <span>{voice.title}</span>
                <small>{voice.meta}</small>
                <b>{voice.tone}</b>
              </button>
            ))}
          </aside>
          <motion.div className="studio-panel" key={active.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34 }}>
            <div className="studio-top">
              <span className="recording"><Zap size={14} /> realtime preview</span>
              <span>{t.latency}</span>
              <span>{t.safetyOn}</span>
            </div>
            <div className="language-strip" aria-label="Language modes">
              {languages.map((language) => (
                <button
                  className={language === activeLanguage ? 'active' : ''}
                  key={language}
                  onClick={() => setActiveLanguage(language)}
                  aria-pressed={language === activeLanguage}
                >
                  {languageLabels[language]}
                </button>
              ))}
            </div>
            <div className="studio-copy">
              <p className="mini-label">{t.nowSpeaking}</p>
              <h3>{localizedVoiceLine}</h3>
            </div>
            <div className="voice-demo-grid">
              <div>
                <button className="play-voice"><Play size={18} /> Play {active.title} voice</button>
                <WaveBars />
              </div>
              <div className="mini-transcript">
                <p><b>Customer</b> “{localized.customer}”</p>
                <p><b>{active.title}</b> “{localized.agent}”</p>
                <span>{active.outcome}</span>
              </div>
            </div>
            <div className="prompt-card">
              <Headphones size={18} />
              <p>{localized.prompt}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div id="story"><ScrollStory /></div>

      <section id="product" className="section product-section">
        <div className="section-heading">
          <p className="eyebrow"><Workflow size={14} /> {t.productEyebrow}</p>
          <h2>{t.productTitle}</h2>
          <p>{t.productText}</p>
        </div>
        <div className="cockpit">
          <motion.div className={`cockpit-main is-${operator.state}`} whileInView={{ rotateX: [4, 0], y: [30, 0], opacity: [0.82, 1] }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.75 }}>
            <div className="browser-bar"><i /><i /><i /><span>{operator.browserPath}</span></div>
            <div className="cockpit-grid">
              <div className="queue-panel panel">
                <p className="mini-label">{t.callQueue}</p>
                {operator.queue.map(([name, lang, intent, status], index) => (
                  <motion.span initial={{ x: -14, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.08 }} key={name}>
                    <b>{name}</b><small>{lang} · {intent}</small><em>{status}</em>
                  </motion.span>
                ))}
              </div>
              <div className="transcript-panel panel">
                <p className="mini-label">{t.liveTranscript}</p>
                {operator.trace.map(([time, text, tag], index) => (
                  <motion.div className="trace-row" key={time} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.09 }}>
                    <time>{time}</time>
                    <p>{text}</p>
                    <b>{tag}</b>
                  </motion.div>
                ))}
              </div>
              <div className="outcome-panel panel">
                <p className="mini-label">{t.nextAction}</p>
                <CalendarCheck size={34} />
                <h3>{operator.outcomeTitle}</h3>
                <p>{operator.outcomeDetail}</p>
                <button>{operator.cta}</button>
              </div>
            </div>
            <motion.div className="campaign-state" key={activeOperator} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span>{operator.pulse}</span>
              <p>{operator.statusCopy}</p>
              <div className="action-rail" aria-hidden="true"><i /><i /><i /></div>
            </motion.div>
            <div className="operator-controls" aria-label="Operator controls">
              {operatorControls.map((control) => (
                <button
                  className={control === activeOperator ? 'active' : ''}
                  key={control}
                  onClick={() => setActiveOperator(control)}
                  aria-pressed={control === activeOperator}
                >
                  {control}
                </button>
              ))}
            </div>
          </motion.div>
          <div className="setup-flow">
            {['Connect sheet or CRM', 'Choose voice + language', 'Lock guardrails', 'Launch monitored calls'].map((step, index) => (
              <article key={step}><span>0{index + 1}</span><b>{step}</b></article>
            ))}
          </div>
          <div className="capability-grid">
            {capabilities.map(({ icon: Icon, title, copy }) => (
              <motion.article className="capability-card" key={title} whileHover={{ y: -6, rotateX: 2 }}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="section usecase-section">
        <div className="section-heading center">
          <p className="eyebrow"><CircleDot size={14} /> Use-case gallery</p>
          <h2>{t.usecaseTitle}</h2>
        </div>
        <div className="usecase-grid">
          {useCases.map(([title, copy, stat], index) => (
            <motion.article className="usecase-card" key={title} whileHover={{ y: -8 }}>
              <span>{title}</span>
              <h3>{copy}</h3>
              <div className="playbook-line">
                {index === 0 ? 'Budget → model → showroom → booked slot' : index === 1 ? 'Location → budget → project FAQ → site visit' : index === 2 ? 'Confirm → remind → no-show risk → staff handoff' : 'Screen → language fit → availability → shortlist'}
              </div>
              <strong>{stat}</strong>
              <button>View call flow</button>
            </motion.article>
          ))}
          <motion.article className="usecase-card custom" whileHover={{ y: -8 }}>
            <span>Custom playbooks</span>
            <h3>Education, insurance, logistics, debt collection, local services — any repeatable call script can become an agent.</h3>
            <div className="playbook-line">Script → guardrails → test calls → launch</div>
            <strong>Built around your workflow</strong>
            <button>Design mine</button>
          </motion.article>
        </div>
      </section>

      <section id="safety" className="section safety-section">
        <div className="safety-card">
          <p className="eyebrow"><ShieldCheck size={14} /> Trust layer</p>
          <h2>{t.safetyTitle}</h2>
          <p>Every call is recorded, transcribed, tagged, constrained by policy, and synced to your systems. If a caller asks for a manager, discount, medical advice, or unusual promise, CallSetu hands off.</p>
          <div className="safety-grid">
            {safetyGroups.map(([title, copy]) => (
              <article key={title}><CheckCircle2 size={17} /><b>{title}</b><p>{copy}</p></article>
            ))}
          </div>
        </div>
        <div className="integrations-card">
          <p className="mini-label">CONNECTS TO YOUR STACK</p>
          <div className="guardrail-card">
            <b>Sample rule</b>
            <p>Never promise loan approval. Escalate if the customer asks for an off-policy discount. Confirm consent before recording.</p>
          </div>
          <div className="partner-grid">
            {partners.map((partner) => <span key={partner}>{partner}</span>)}
          </div>
          <div className="sync-list">Transcript · call summary · intent · sentiment · next action · recording link</div>
        </div>
      </section>

      <section id="pricing" className="section pricing-section">
        <div className="pricing-card">
          <p className="eyebrow"><Sparkles size={14} /> Start with one campaign</p>
          <h2>{t.pricingTitle}</h2>
          <p>Start with one campaign. No full migration. We configure the voice, test objections, connect outcomes, and launch a real pilot with your team.</p>
          <div className="price-row"><strong>₹3–6/min</strong><span>usage-based · varies by language, telephony, and workflow depth</span></div>
          <div className="pilot-box">
            <b>Pilot includes</b>
            <div>{pilotIncludes.map((item) => <span key={item}><CheckCircle2 size={15} /> {item}</span>)}</div>
          </div>
          <div className="pricing-actions">
            <a className="button primary large" href="mailto:hello@callsetu.ai?subject=Start%20CallSetu%20pilot">Book your CallSetu pilot <ArrowUpRight size={18} /></a>
            <a className="button glass large" href="mailto:hello@callsetu.ai?subject=Estimate%20CallSetu%20usage">Estimate monthly usage</a>
          </div>
          <small className="risk-note">First test calls can run from a single sheet and one approved playbook.</small>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-wordmark">CallSetu</div>
        <div className="footer-content">
          <p>Voice AI agents for India’s phone-heavy businesses. Consent-based calling, audit logs, and configurable calling windows.</p>
          <div>
            <a href="#voice-lab">Voice lab</a>
            <a href="#product">Product</a>
            <a href="#use-cases">Use cases</a>
            <a href="#safety">Compliance</a>
            <a href="mailto:hello@callsetu.ai">hello@callsetu.ai</a>
          </div>
        </div>
        <div className="footer-legal">
          <span>© 2026 CallSetu</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Security</span>
        </div>
      </footer>
    </main>
  )
}

export default App
