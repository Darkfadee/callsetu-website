import { useMemo, useState } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
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
import './App.css'

type LanguageMode = 'English' | 'Hindi' | 'Hinglish' | 'Kannada' | 'Tamil' | 'Telugu'
type OperatorMode = 'Pause campaign' | 'Edit script' | 'Review low-confidence' | 'Escalate hot lead' | 'Export report'
type PlaybookKey = 'Auto' | 'Real estate' | 'Clinics' | 'Recruiting' | 'Collections'

const languages: LanguageMode[] = ['English', 'Hindi', 'Hinglish', 'Kannada', 'Tamil', 'Telugu']

const languageLabels: Record<LanguageMode, string> = {
  English: 'English',
  Hindi: 'हिन्दी',
  Hinglish: 'Hinglish',
  Kannada: 'ಕನ್ನಡ',
  Tamil: 'தமிழ்',
  Telugu: 'తెలుగు',
}

const localizedLines: Record<LanguageMode, { customer: string; agent: string; prompt: string; voiceLine: string }> = {
  English: {
    customer: 'Can I come this Saturday?',
    agent: 'Yes. I can book the nearest showroom and send you the slot now.',
    prompt: '“Hello Rohan, you asked about a Nexon EV test drive. I can help you pick the nearest showroom and confirm a time.”',
    voiceLine: 'speaks clear English while following the approved Tata test-drive script.',
  },
  Hindi: {
    customer: 'क्या मैं इस शनिवार आ सकता हूँ?',
    agent: 'हाँ, slot book हो जाएगा। कौन सा showroom आपके पास है?',
    prompt: '“Namaste Rohan ji, aapne Nexon EV test-drive ke liye interest dikhaya tha…”',
    voiceLine: 'uses Hindi to qualify the buyer and keep the handoff safe.',
  },
  Hinglish: {
    customer: 'Can I come this Saturday?',
    agent: 'Haan, slot book ho jayega. Kaunsa showroom closest hai?',
    prompt: '“Namaste Rohan ji, aapne Nexon EV test-drive ke liye interest dikhaya tha…”',
    voiceLine: 'uses warm Hinglish to confirm a Tata Nexon test-drive slot.',
  },
  Kannada: {
    customer: 'ಈ Saturday ಬರಬಹುದಾ?',
    agent: 'ಹೌದು, slot book ಮಾಡಬಹುದು. ಯಾವ showroom ಹತ್ತಿರ?',
    prompt: '“Namaskara Rohan avare, Nexon EV test-drive ge interest thorisiddiri…”',
    voiceLine: 'uses Bangalore Kannada-Hinglish to confirm the slot.',
  },
  Tamil: {
    customer: 'இந்த Saturday வரலாமா?',
    agent: 'ஆம், slot book செய்யலாம். எந்த showroom அருகில் உள்ளது?',
    prompt: '“Vanakkam Rohan, Nexon EV test-drive interest share pannirkeenga…”',
    voiceLine: 'uses a Tamil-English mix to confirm the appointment.',
  },
  Telugu: {
    customer: 'ఈ Saturday రావచ్చా?',
    agent: 'అవును, slot book చేస్తాను. ఏ showroom దగ్గరగా ఉంది?',
    prompt: '“Namaskaram Rohan garu, Nexon EV test-drive meeda interest chupinchaaru…”',
    voiceLine: 'uses a Telugu-English mix to finish the booking.',
  },
}

const voiceAgents = [
  {
    name: 'Asha',
    role: 'Tata test-drive coordinator',
    tone: 'Warm · Hinglish',
    location: 'Bangalore',
    outcome: 'Qualified · Sat 4:30 PM',
  },
  {
    name: 'Kabir',
    role: 'Loan renewal qualifier',
    tone: 'Calm · Hindi',
    location: 'Delhi NCR',
    outcome: 'Eligible · advisor callback',
  },
  {
    name: 'Meera',
    role: 'Clinic appointment desk',
    tone: 'Gentle · English',
    location: 'Mumbai',
    outcome: 'Booked · nurse alerted',
  },
]

const leakStats = [
  ['37%', 'missed leads are never called back fast enough', 'Speed-to-lead gap'],
  ['₹18–₹42', 'typical manual cost per completed follow-up call', 'Call team load'],
  ['5+', 'languages needed before a campaign feels truly local', 'India reality'],
  ['100%', 'calls recorded, summarized, dispositioned, and auditable', 'Ops hygiene'],
]

const storySteps = [
  {
    step: '01',
    title: 'Catch the ring',
    copy: 'A lead lands from a Meta ad, missed call, web form, spreadsheet, CRM, or campaign queue. CallSetu starts the right call before intent cools.',
    artifact: 'Source locked · consent rule loaded',
  },
  {
    step: '02',
    title: 'Speak the local playbook',
    copy: 'The agent switches language, tone, and objection handling without changing your approved business rules.',
    artifact: 'Language · intent · objection detected',
  },
  {
    step: '03',
    title: 'Move the customer forward',
    copy: 'Book a slot, qualify budget, confirm availability, collect missing details, or schedule a callback with the right person.',
    artifact: 'Outcome created · WhatsApp queued',
  },
  {
    step: '04',
    title: 'Sync the proof',
    copy: 'Recording, transcript, summary, score, consent, and next action land in the CRM or sheet your team already uses.',
    artifact: 'CRM updated · manager alerted',
  },
]

const playbooks: Record<PlaybookKey, { title: string; buyer: string; pain: string; flow: string[]; proof: string; cta: string }> = {
  Auto: {
    title: 'Auto dealers',
    buyer: 'Showroom owners and sales managers losing hot enquiries after ads.',
    pain: 'New car buyers expect a call instantly. Manual teams miss nights, weekends, and language fit.',
    flow: ['Ad lead enters', 'AI qualifies model and budget', 'Showroom slot confirmed', 'Salesperson gets hot-lead alert'],
    proof: 'Test-drive slots, exchange intent, and callback SLA in one record.',
    cta: 'Build my test-drive agent',
  },
  'Real estate': {
    title: 'Real estate',
    buyer: 'Project teams chasing hundreds of portal and Meta leads.',
    pain: 'First-hour contact decides site visits. Agents need budget, location, and inventory answers immediately.',
    flow: ['Fresh lead called', 'Budget and locality confirmed', 'Project FAQs answered', 'Site visit booked'],
    proof: 'Every call tagged by project, budget, locality, and urgency.',
    cta: 'Design property flow',
  },
  Clinics: {
    title: 'Clinics',
    buyer: 'Clinics with missed appointments, no-shows, and overloaded front desks.',
    pain: 'Staff should not spend the whole day confirming routine visits or reviving old patients.',
    flow: ['Missed call recovered', 'Appointment confirmed', 'Reminder sent', 'Urgent symptom escalated'],
    proof: 'No-show risk, patient intent, and staff handoff stay visible.',
    cta: 'Create clinic desk',
  },
  Recruiting: {
    title: 'Recruiting',
    buyer: 'Hiring teams screening many candidates for availability and fit.',
    pain: 'Recruiters waste time on unreachable candidates and repetitive first screens.',
    flow: ['Candidate list imported', 'Availability checked', 'Language fit scored', 'Shortlist sent'],
    proof: 'Candidate summaries and recordings are ready before recruiter review.',
    cta: 'Screen candidates faster',
  },
  Collections: {
    title: 'Collections',
    buyer: 'Finance teams needing compliant reminders without aggressive scripts.',
    pain: 'Follow-ups need consistent tone, legal-safe wording, retry windows, and clear escalation.',
    flow: ['Due list segmented', 'Reminder call placed', 'Promise-to-pay captured', 'Exception routed'],
    proof: 'Consent, call disposition, and next due action recorded safely.',
    cta: 'Map collection calls',
  },
}

const operatorScenarios: Record<OperatorMode, {
  state: string
  path: string
  queue: string[][]
  trace: string[][]
  headline: string
  detail: string
  action: string
  pulse: string
}> = {
  'Pause campaign': {
    state: 'paused',
    path: 'campaigns/tata-nexon-q2/paused',
    queue: [['Rohan P.', 'Hinglish', 'Held'], ['Ananya S.', 'English', 'Queued'], ['Vivek K.', 'Hindi', 'Frozen'], ['Mehul R.', 'Kannada', 'Paused']],
    trace: [['00:00', 'Supervisor paused new outbound dials', 'CONTROL'], ['00:02', 'Active conversations finish safely', 'QUEUE'], ['00:05', 'Retry window and ageing timers frozen', 'SAFE']],
    headline: 'Campaign paused safely',
    detail: 'No new dials. Active conversations finish. Queue state stays preserved.',
    action: 'Resume campaign',
    pulse: 'Paused · no new dials',
  },
  'Edit script': {
    state: 'editing',
    path: 'campaigns/tata-nexon-q2/script-draft',
    queue: [['Rohan P.', 'Hinglish', 'Preview'], ['Ananya S.', 'English', 'Needs rule'], ['Vivek K.', 'Hindi', 'Check'], ['Mehul R.', 'Kannada', 'Localized']],
    trace: [['00:00', 'Exchange-bonus objection opened', 'DRAFT'], ['00:06', 'Approved line inserted for inspection rule', 'POLICY'], ['00:14', 'Hindi, Hinglish, Kannada variants staged', 'LANG']],
    headline: 'Script draft staged',
    detail: 'Three variants are ready, and forbidden discount promises remain locked.',
    action: 'Approve script',
    pulse: 'Draft mode · calls held',
  },
  'Review low-confidence': {
    state: 'reviewing',
    path: 'campaigns/tata-nexon-q2/review-low-confidence',
    queue: [['Rohan P.', 'Hinglish', '91%'], ['Ananya S.', 'English', '64% review'], ['Vivek K.', 'Hindi', '58% review'], ['Mehul R.', 'Kannada', 'Retry ok']],
    trace: [['00:00', 'Calls below 70% confidence filtered', 'FILTER'], ['00:04', 'Noisy audio detected on two records', 'ASR'], ['00:18', 'Reviewer sees recording and suggested disposition', 'REVIEW']],
    headline: '2 calls need review',
    detail: 'Uncertain records wait for a human before the CRM is updated.',
    action: 'Open review desk',
    pulse: 'Review queue · 2 flagged',
  },
  'Escalate hot lead': {
    state: 'escalating',
    path: 'campaigns/tata-nexon-q2/hot-lead-escalation',
    queue: [['Rohan P.', 'Hinglish', 'Hot lead'], ['Ananya S.', 'English', 'Interested'], ['Vivek K.', 'Hindi', 'Warm'], ['Mehul R.', 'Kannada', 'Cold']],
    trace: [['00:00', 'Rohan asks for same-day showroom visit', 'INTENT'], ['00:04', 'Budget, model, and location qualify', 'SCORE'], ['00:09', 'Consent confirmed before sharing details', 'CONSENT'], ['00:15', 'Sales manager gets WhatsApp and CRM alert', 'ALERT']],
    headline: 'Hot lead escalated',
    detail: 'Manager pinged with summary, recording, model preference, and 5-minute SLA.',
    action: 'View escalation',
    pulse: 'Escalated · manager pinged',
  },
  'Export report': {
    state: 'exporting',
    path: 'campaigns/tata-nexon-q2/export-report',
    queue: [['Rohan P.', 'Hinglish', 'Included'], ['Ananya S.', 'English', 'Included'], ['Vivek K.', 'Hindi', 'Included'], ['Mehul R.', 'Kannada', 'Included']],
    trace: [['00:00', 'Campaign window selected', 'REPORT'], ['00:03', 'Summaries and recordings packed', 'DATA'], ['00:11', 'CSV, PDF, and CRM export links created', 'EXPORT']],
    headline: 'Report ready',
    detail: 'Language split, outcomes, recordings, and dispositions are packaged.',
    action: 'Download report',
    pulse: 'Report ready · 4 rows',
  },
}

const operatorControls = Object.keys(operatorScenarios) as OperatorMode[]
const playbookKeys = Object.keys(playbooks) as PlaybookKey[]
const pilotIncludes = ['1 live calling playbook', '1 configured voice', 'CRM or sheet sync', '100–500 pilot calls', 'Weekly review dashboard']
const safetyRules = ['Consent and calling windows', 'Approved claim library', 'Human handoff triggers', 'Recording and audit logs', 'DND and retry limits', 'Manager override console']
const integrations = ['Zoho', 'HubSpot', 'LeadSquared', 'Salesforce', 'WhatsApp', 'Google Sheets']

function SignalBackdrop() {
  return (
    <div className="signal-backdrop" aria-hidden="true">
      <span className="orbit orbit-one" />
      <span className="orbit orbit-two" />
      <span className="orbit orbit-three" />
      <span className="signal-core" />
      <div className="signal-lanes">{Array.from({ length: 18 }).map((_, index) => <i key={index} />)}</div>
    </div>
  )
}

function WaveBars() {
  return (
    <div className="wave-bars" aria-hidden="true">
      {Array.from({ length: 48 }).map((_, index) => <i key={index} style={{ '--h': `${18 + ((index * 23) % 78)}px` } as React.CSSProperties} />)}
    </div>
  )
}

function App() {
  const [activeAgent, setActiveAgent] = useState(0)
  const [activeLanguage, setActiveLanguage] = useState<LanguageMode>('Hinglish')
  const [activePlaybook, setActivePlaybook] = useState<PlaybookKey>('Auto')
  const [activeOperator, setActiveOperator] = useState<OperatorMode>('Escalate hot lead')
  const [monthlyCalls, setMonthlyCalls] = useState(6000)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  const agent = voiceAgents[activeAgent]
  const localized = localizedLines[activeLanguage]
  const operator = operatorScenarios[activeOperator]
  const playbook = playbooks[activePlaybook]
  const savings = useMemo(() => {
    const manualCost = monthlyCalls * 26
    const aiCost = monthlyCalls * 5
    return Math.max(0, manualCost - aiCost)
  }, [monthlyCalls])

  return (
    <main className="site-shell">
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="CallSetu home"><span><Waves size={18} /></span>CallSetu</a>
        <div className="nav-links">
          <a href="#proof">Proof</a>
          <a href="#voice-lab">Voice lab</a>
          <a href="#workflow">Workflow</a>
          <a href="#product">Product</a>
          <a href="#playbooks">Playbooks</a>
          <a href="#safety">Safety</a>
        </div>
        <a className="nav-cta" href="mailto:hello@callsetu.ai?subject=Book%20a%20CallSetu%20pilot">Book pilot <ArrowUpRight size={16} /></a>
      </nav>

      <section id="top" className="hero">
        <SignalBackdrop />
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="eyebrow"><Sparkles size={14} /> Voice AI agents for India’s phone-heavy teams</p>
          <h1>
            Turn every customer call into a <span>booked outcome.</span>
          </h1>
          <p className="hero-value">CallSetu answers missed enquiries, qualifies leads, speaks local languages, books slots, and updates your CRM before intent goes cold.</p>
          <div className="hero-actions">
            <a className="button primary" href="mailto:hello@callsetu.ai?subject=Book%20a%20CallSetu%20pilot"><PhoneCall size={18} /> Book your pilot</a>
            <a className="button ghost" href="#voice-lab"><Play size={18} /> Hear the voice lab</a>
          </div>
        </motion.div>

        <motion.div className="hero-console" initial={{ opacity: 0, y: 36, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.18, duration: 0.8 }}>
          <div className="console-top"><span /> <span /> <span /> <b>live-call/orchestrator</b></div>
          <div className="call-orbit">
            <div className="caller-card incoming">
              <small>INCOMING</small>
              <b>Rohan · Nexon EV enquiry</b>
              <p>“Can I come this Saturday?”</p>
            </div>
            <div className="agent-core">
              <PhoneCall size={34} />
              <strong>Asha</strong>
              <span>Hinglish · policy safe</span>
            </div>
            <div className="caller-card outcome">
              <small>OUTCOME</small>
              <b>Slot booked · Sat 4:30</b>
              <p>CRM note, recording, and manager alert synced.</p>
            </div>
          </div>
          <div className="hero-ledger">
            {['lead caught in 8s', 'consent confirmed', 'local language', 'CRM synced'].map((item) => <span key={item}><CircleDot size={12} /> {item}</span>)}
          </div>
        </motion.div>
      </section>

      <section id="proof" className="proof-section">
        <div className="section-kicker"><Zap size={15} /> Revenue leak map</div>
        <div className="proof-layout">
          <div>
            <h2>Your phone funnel is leaking money between enquiry and follow-up.</h2>
            <p>CallSetu is built for the repetitive calls where speed, consistency, language, and proof decide revenue.</p>
          </div>
          <div className="leak-grid">
            {leakStats.map(([value, copy, label]) => (
              <article key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="voice-lab" className="section voice-lab">
        <div className="section-heading center">
          <p className="eyebrow"><Mic2 size={14} /> Interactive voice lab</p>
          <h2>One business rule, six local ways to say it.</h2>
          <p>Choose a persona and language. The script changes tone and transcript while the business guardrails stay fixed.</p>
        </div>
        <div className="voice-stage">
          <aside className="voice-rail" aria-label="Voice agents">
            {voiceAgents.map((voice, index) => (
              <button key={voice.name} className={index === activeAgent ? 'active' : ''} onClick={() => setActiveAgent(index)} aria-pressed={index === activeAgent}>
                <span>{voice.name}</span>
                <small>{voice.role}</small>
                <b>{voice.tone}</b>
              </button>
            ))}
          </aside>
          <div className="studio-panel">
            <div className="studio-status"><span><Headphones size={15} /> Realtime preview</span><span>480ms turn</span><span>Guardrails on</span></div>
            <div className="language-strip" aria-label="Language modes">
              {languages.map((language) => <button key={language} className={language === activeLanguage ? 'active' : ''} onClick={() => setActiveLanguage(language)} aria-pressed={language === activeLanguage}>{languageLabels[language]}</button>)}
            </div>
            <div className="voice-copy">
              <p className="mini-label">NOW SPEAKING</p>
              <h3>{agent.name} {localized.voiceLine}</h3>
            </div>
            <div className="transcript-grid">
              <div>
                <a className="play-voice" href={`mailto:hello@callsetu.ai?subject=Send%20me%20a%20${agent.name}%20voice%20sample`}><Play size={18} /> Request {agent.name} sample</a>
                <WaveBars />
              </div>
              <div className="transcript-card">
                <p><b>Customer</b> “{localized.customer}”</p>
                <p><b>{agent.name}</b> “{localized.agent}”</p>
                <span>{agent.outcome}</span>
              </div>
            </div>
            <div className="prompt-card"><Languages size={18} /><p>{localized.prompt}</p></div>
          </div>
        </div>
      </section>

      <section id="workflow" className="section workflow-section">
        <div className="section-heading">
          <p className="eyebrow"><Workflow size={14} /> Outcome route</p>
          <h2>From ring to CRM proof in one controlled route.</h2>
          <p>The site now makes the workflow explicit: answer, localize, qualify, book, escalate, and sync.</p>
        </div>
        <div className="workflow-road">
          {storySteps.map((item, index) => (
            <motion.article key={item.step} className="workflow-step" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: index * 0.07 }}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <small>{item.artifact}</small>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="product" className="section product-section">
        <div className="section-heading center">
          <p className="eyebrow"><CalendarCheck size={14} /> Operator cockpit</p>
          <h2>Supervise AI calls without turning managers into prompt engineers.</h2>
          <p>Campaign controls visibly change the queue, transcript, action panel, and status rail.</p>
        </div>
        <div className={`cockpit is-${operator.state}`}>
          <div className="browser-bar"><i /><i /><i /><span>{operator.path}</span></div>
          <div className="cockpit-grid">
            <div className="queue-panel panel">
              <p className="mini-label">QUEUE</p>
              {operator.queue.map(([name, meta, status]) => <div key={`${name}-${status}`}><b>{name}</b><span>{meta}</span><em>{status}</em></div>)}
            </div>
            <div className="trace-panel panel">
              <p className="mini-label">CALL TRACE</p>
              {operator.trace.map(([time, text, tag]) => <div className="trace-row" key={`${time}-${tag}`}><time>{time}</time><p>{text}</p><b>{tag}</b></div>)}
            </div>
            <div className="action-panel panel">
              <p className="mini-label">NEXT ACTION</p>
              <CalendarCheck size={36} />
              <h3>{operator.headline}</h3>
              <p>{operator.detail}</p>
              <button>{operator.action}</button>
            </div>
          </div>
          <div className="campaign-state"><b>{operator.pulse}</b><span>{operator.detail}</span><i /></div>
          <div className="operator-controls" aria-label="Operator controls">
            {operatorControls.map((control) => <button key={control} className={control === activeOperator ? 'active' : ''} onClick={() => setActiveOperator(control)} aria-pressed={control === activeOperator}>{control}</button>)}
          </div>
        </div>
      </section>

      <section id="playbooks" className="section playbook-section">
        <div className="section-heading">
          <p className="eyebrow"><CircleDot size={14} /> Playbook gallery</p>
          <h2>Every repeatable phone workflow can become an agent.</h2>
          <p>Pick a business type to see the buyer pain, the route, and why the owner would pay.</p>
        </div>
        <div className="playbook-tabs" aria-label="Playbook selector">
          {playbookKeys.map((key) => <button key={key} className={key === activePlaybook ? 'active' : ''} onClick={() => setActivePlaybook(key)} aria-pressed={key === activePlaybook}>{playbooks[key].title}</button>)}
        </div>
        <div className="playbook-detail">
          <div>
            <span>{playbook.title}</span>
            <h3>{playbook.buyer}</h3>
            <p>{playbook.pain}</p>
            <a href={`mailto:hello@callsetu.ai?subject=${encodeURIComponent(playbook.cta)}`}>{playbook.cta} <ArrowUpRight size={16} /></a>
          </div>
          <ol>
            {playbook.flow.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <aside>{playbook.proof}</aside>
        </div>
      </section>

      <section id="safety" className="section safety-section">
        <div className="safety-card">
          <p className="eyebrow"><ShieldCheck size={14} /> Safety layer</p>
          <h2>Warm voice. Locked rules. Human override.</h2>
          <p>CallSetu keeps the AI helpful without letting it invent pricing, eligibility, medical advice, discounts, or commitments outside the playbook.</p>
          <div className="safety-grid">{safetyRules.map((rule) => <span key={rule}><CheckCircle2 size={17} /> {rule}</span>)}</div>
        </div>
        <div className="integration-card">
          <p className="mini-label">CONNECTS TO YOUR STACK</p>
          <div className="partner-grid">{integrations.map((partner) => <span key={partner}>{partner}</span>)}</div>
          <p>Transcript · call summary · intent · sentiment · recording link · next action</p>
        </div>
      </section>

      <section id="pilot" className="section pilot-section">
        <div className="pilot-card">
          <p className="eyebrow"><Sparkles size={14} /> Pilot calculator</p>
          <h2>Start with one campaign. Prove the calls before scaling.</h2>
          <p>Move one repeatable workflow into CallSetu, review real call outcomes, then expand to more agents.</p>
          <label className="call-slider">
            <span>{monthlyCalls.toLocaleString('en-IN')} monthly calls</span>
            <input type="range" min="1000" max="25000" step="500" value={monthlyCalls} onChange={(event) => setMonthlyCalls(Number(event.target.value))} />
          </label>
          <div className="savings-card">
            <span>Potential monthly ops saving</span>
            <strong>₹{savings.toLocaleString('en-IN')}</strong>
            <small>Illustrative estimate using ₹26 manual vs ₹5 AI-assisted completed-call cost.</small>
          </div>
          <div className="pilot-includes">{pilotIncludes.map((item) => <span key={item}><CheckCircle2 size={15} /> {item}</span>)}</div>
          <div className="pilot-actions">
            <a className="button primary" href="mailto:hello@callsetu.ai?subject=Start%20CallSetu%20pilot">Book the pilot <ArrowUpRight size={18} /></a>
            <a className="button ghost" href="mailto:hello@callsetu.ai?subject=Estimate%20CallSetu%20usage">Estimate usage</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-wordmark">CallSetu</div>
        <div className="footer-content">
          <p>Voice AI agents for India’s phone-heavy businesses: local-language calling, outcome sync, consent windows, recordings, and manager handoff.</p>
          <div>
            <a href="#voice-lab">Voice lab</a>
            <a href="#product">Product</a>
            <a href="#playbooks">Playbooks</a>
            <a href="#safety">Compliance</a>
            <a href="mailto:hello@callsetu.ai">hello@callsetu.ai</a>
          </div>
        </div>
        <div className="footer-legal"><span>© 2026 CallSetu</span><span>Privacy</span><span>Terms</span><span>Security</span></div>
      </footer>
    </main>
  )
}

export default App
