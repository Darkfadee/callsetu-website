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

const trace = [
  ['00:00', 'Dial Tata Nexon lead from Bangalore Q2 sheet', 'PSTN'],
  ['00:04', 'Customer answers in Kannada-Hinglish mix', 'ASR'],
  ['00:13', 'Asha confirms model, showroom, and weekend slot', 'AGENT'],
  ['00:31', 'Exchange-bonus objection handled from approved policy', 'GUARDRAIL'],
  ['00:48', 'Qualified · Sat 4:30 PM · CRM + SMS synced', 'SYNC'],
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

const languages = ['English', 'Hindi', 'Hinglish', 'Kannada', 'Tamil', 'Telugu']

const cockpitLeads = [
  ['Rohan P.', 'Hinglish', 'Test drive', 'Calling now'],
  ['Ananya S.', 'English', 'Exchange offer', 'Interested'],
  ['Vivek K.', 'Hindi', 'Callback', 'Sat 11 AM'],
  ['Mehul R.', 'Kannada', 'Not reachable', 'Retry 6 PM'],
]

const operatorControls = ['Pause campaign', 'Edit script', 'Review low-confidence', 'Escalate hot lead', 'Export report']

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
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroProgress, [0, 1], [0, 110])
  const heroRotate = useTransform(heroProgress, [0, 1], [-4, 8])
  const active = voiceScenes[activeVoice]

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
          <a href="#voice-lab">Voice lab</a>
          <a href="#story">Story</a>
          <a href="#product">Product</a>
          <a href="#use-cases">Use cases</a>
          <a href="#safety">Safety</a>
        </div>
        <a className="nav-cta" href="mailto:hello@callsetu.ai?subject=Book%20a%20CallSetu%20test%20call">
          Book test call <ArrowUpRight size={16} />
        </a>
      </nav>

      <section id="top" className="hero" ref={heroRef}>
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="eyebrow"><Sparkles size={14} /> Cinematic voice AI command center</p>
          <h1>
            Every call becomes <span>a moving story.</span>
          </h1>
          <p className="hero-value">AI voice agents that answer, qualify, book, and sync every customer call.</p>
          <p className="hero-text">
            CallSetu turns lead lists into warm, multilingual conversations — then shows the journey from first ring to booked outcome with live transcripts, policy rails, CRM syncs, and human handoffs.
          </p>
          <div className="hero-actions">
            <a className="button primary magnet" href="mailto:hello@callsetu.ai?subject=Take%20a%20CallSetu%20test%20call"><PhoneCall size={18} /> Try a live AI call</a>
            <a className="button glass magnet" href="#story"><Play size={18} /> Watch the flow</a>
          </div>
          <div className="hero-proof" aria-label="Campaign proof">
            <span><CircleDot size={13} /> Hindi + Hinglish + regional language modes</span>
            <span><CircleDot size={13} /> First test calls after one playbook setup</span>
            <span><CircleDot size={13} /> Human handoff when the AI should stop</span>
          </div>
        </motion.div>

        <motion.div className="hero-art" style={{ y: heroY, rotateY: heroRotate }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1 }}>
          <img className="acoustic-map" src={acousticMap} alt="Abstract acoustic map showing signal routes and call nodes" />
          <ThreeSignalScene />
          <div className="hero-orb" aria-hidden="true"><span /><span /><span /></div>
          <motion.div className="call-card floating-card top-card" animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="mini-label">LIVE AGENT</span>
            <strong>{active.title} · {active.meta}</strong>
            <p>{active.prompt}</p>
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
          <p className="eyebrow"><Sparkles size={14} /> Operational proof</p>
          <h2>Built for high-volume customer calls in India.</h2>
          <p>Not a chatbot skin — a calling system with response windows, outcomes, recordings, handoffs, and CRM-ready proof.</p>
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
          <p className="eyebrow"><Mic2 size={14} /> Interactive voice lab</p>
          <h2>Tap a voice. Watch the interface breathe.</h2>
          <p>Tabs, live states, hover depth, animated waveforms, and realistic policy prompts make the product feel alive instead of static.</p>
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
              <span>Latency 480ms</span>
              <span>Voice safety on</span>
            </div>
            <div className="language-strip" aria-label="Language modes">
              {languages.map((language, index) => <button className={index === 2 ? 'active' : ''} key={language}>{language}</button>)}
            </div>
            <div className="studio-copy">
              <p className="mini-label">NOW SPEAKING</p>
              <h3>{active.line}</h3>
            </div>
            <div className="voice-demo-grid">
              <div>
                <button className="play-voice"><Play size={18} /> Play {active.title} voice</button>
                <WaveBars />
              </div>
              <div className="mini-transcript">
                <p><b>Customer</b> “Can I come this Saturday?”</p>
                <p><b>{active.title}</b> “Yes, I can book that. Which showroom is closest?”</p>
                <span>{active.outcome}</span>
              </div>
            </div>
            <div className="prompt-card">
              <Headphones size={18} />
              <p>{active.prompt}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div id="story"><ScrollStory /></div>

      <section id="product" className="section product-section">
        <div className="section-heading">
          <p className="eyebrow"><Workflow size={14} /> Product cockpit</p>
          <h2>From lead list to live calls in under an hour.</h2>
          <p>The cockpit is now part dashboard, part animated evidence: queue, transcript, policy, outcome, and action rails in one cinematic surface.</p>
        </div>
        <div className="cockpit">
          <motion.div className="cockpit-main" whileInView={{ rotateX: [4, 0], y: [30, 0], opacity: [0.82, 1] }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.75 }}>
            <div className="browser-bar"><i /><i /><i /><span>campaigns/tata-nexon-q2/live</span></div>
            <div className="cockpit-grid">
              <div className="queue-panel panel">
                <p className="mini-label">CALL QUEUE</p>
                {cockpitLeads.map(([name, lang, intent, status], index) => (
                  <motion.span initial={{ x: -14, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.08 }} key={name}>
                    <b>{name}</b><small>{lang} · {intent}</small><em>{status}</em>
                  </motion.span>
                ))}
              </div>
              <div className="transcript-panel panel">
                <p className="mini-label">LIVE TRANSCRIPT</p>
                {trace.map(([time, text, tag], index) => (
                  <motion.div className="trace-row" key={time} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.09 }}>
                    <time>{time}</time>
                    <p>{text}</p>
                    <b>{tag}</b>
                  </motion.div>
                ))}
              </div>
              <div className="outcome-panel panel">
                <p className="mini-label">NEXT ACTION</p>
                <CalendarCheck size={34} />
                <h3>Book test drive</h3>
                <p>Saturday · 4:30 PM · Whitefield showroom</p>
                <button>Approve + sync</button>
              </div>
            </div>
            <div className="operator-controls">
              {operatorControls.map((control) => <button key={control}>{control}</button>)}
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
          <h2>Every repeatable phone playbook gets its own agent.</h2>
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
          <h2>Human warmth. Machine-level control.</h2>
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
          <h2>Your next customer is already calling. Let CallSetu answer.</h2>
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
