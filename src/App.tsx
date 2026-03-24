/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  History, 
  FlaskConical, 
  AtSign, 
  Home, 
  ChevronRight, 
  Bot, 
  Eye, 
  ArrowUpRight, 
  School, 
  Award, 
  ChevronDown,
  X,
  Send,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Menu,
  Phone,
  Mail,
  Linkedin,
  MapPin,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// --- Components ---

const GlassCard = ({ children, className = "", pulse = false }: { children: React.ReactNode, className?: string, pulse?: boolean }) => (
  <div className={`glass-panel p-6 rounded-xl relative overflow-hidden ${pulse ? 'pulse-accent' : ''} ${className}`}>
    {children}
  </div>
);

const SectionHeading = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-baseline gap-4 mb-8">
    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
      <Icon className="text-primary" size={28} /> {title}
    </h2>
    <div className="h-px flex-1 bg-gradient-to-r from-outline-variant to-transparent"></div>
  </div>
);

const ResumeContent = () => (
  <div className="bg-white text-black p-6 md:p-12 max-w-[800px] mx-auto shadow-2xl font-sans text-left">
    <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-black pb-8 mb-8 gap-4">
      <div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-2">Christopher Fornesa</h1>
        <p className="text-lg md:text-xl font-bold text-gray-600 uppercase tracking-widest">Data & Analytics Professional</p>
      </div>
      <div className="text-left md:text-right text-xs md:text-sm font-bold">
        <p>Houston, TX</p>
        <p>(346) 762-3020</p>
        <p>cfornesa@outlook.com</p>
        <p>linkedin.com/in/cfornesa</p>
      </div>
    </div>

    <section className="mb-10">
      <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black inline-block">Professional Summary</h2>
      <p className="text-lg leading-relaxed">
        Creative data and analytics professional with five years of experience turning complex data into actionable insights. Skilled in quantitative analysis and communication to uncover policy insights and spread public awareness. Committed to ethical, data-driven work that serves communities and transforms the world.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black inline-block">Experience</h2>
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-xl font-bold">Mobile Data SME</h3>
            <span className="font-bold">May 2024 – July 2025</span>
          </div>
          <p className="font-bold text-gray-600 mb-2">Chevron · Houston, TX</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Developed data solutions to provide clear, people-facing insights on mobility data.</li>
            <li>Managed SharePoint platforms, optimizing IT architecture and data governance.</li>
          </ul>
        </div>
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-xl font-bold">IT Analyst</h3>
            <span className="font-bold">Dec 2020 – Apr 2024</span>
          </div>
          <p className="font-bold text-gray-600 mb-2">Chevron · Houston, TX</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Delivered enterprise-level mobility support, translating complex technical information for diverse audiences.</li>
            <li>Partnered with leadership to improve workflows and align data systems with organizational goals.</li>
          </ul>
        </div>
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black inline-block">Education</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline">
            <h3 className="text-xl font-bold">MS in Data Science</h3>
            <span className="font-bold">Dec 2025</span>
          </div>
          <p className="font-bold text-gray-600">Boston University • GPA 4.0</p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <h3 className="text-xl font-bold">BA in Liberal Studies</h3>
            <span className="font-bold">June 2018</span>
          </div>
          <p className="font-bold text-gray-600">University of Houston • GPA 4.0</p>
        </div>
      </div>
    </section>
  </div>
);

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isResumeMenuOpen, setIsResumeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isEducationExpanded, setIsEducationExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessages: Message[] = [...chatMessages, { role: 'user', content: userInput }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          history: chatMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from server');
      }

      const data = await response.json();
      setChatMessages([...newMessages, { role: 'assistant', content: data.reply || "I'm sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`min-h-screen font-body selection:bg-primary/30 bg-background text-on-background ${isDarkMode ? 'dark' : ''}`}>
      
      {/* --- Top Navigation --- */}
      <nav className="fixed top-0 w-full z-50 bg-surface-nav/90 backdrop-blur-xl border-b border-outline/10">
        <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto relative">
          <div className="text-2xl font-black tracking-tighter text-primary uppercase font-sans">
            CHRIS FORNESA
          </div>
          <div className="hidden lg:flex items-center gap-8 font-semibold">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#projects">Projects</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#experience">Experience</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#education">Education</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#certificates">Certificates</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#stack">Stack</a>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-primary transition-colors p-2" 
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all"
            >
              <Bot size={24} />
            </button>
            <button 
              onClick={() => setIsResumeOpen(!isResumeOpen)}
              className="brutal-border bg-primary text-on-primary px-6 py-2 font-black uppercase text-xs tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Resume
            </button>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-surface-container border-b border-outline/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 font-bold uppercase tracking-widest text-sm">
                <a onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="#projects">Projects</a>
                <a onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="#experience">Experience</a>
                <a onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="#education">Education</a>
                <a onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="#certificates">Certificates</a>
                <a onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b border-outline/5 hover:text-primary transition-colors" href="#stack">Stack</a>
                <a onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-primary transition-colors" href="#contact">Contact</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Side Navigation (Desktop Only) --- */}
      <aside className="hidden xl:flex fixed left-0 top-0 h-full w-64 z-40 bg-surface-container-low/60 backdrop-blur-2xl border-r border-outline-variant/10 flex-col pt-24 pb-8 shadow-2xl">
        <div className="px-6 mb-8">
          <h2 className="text-primary font-bold text-lg">Navigation</h2>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">The Synthetic Pulse</p>
        </div>
        <nav className="flex-1">
          <a className="flex items-center gap-3 bg-primary/10 text-primary border-r-4 border-primary p-4 uppercase text-xs tracking-[0.05em] hover:translate-x-1 transition-transform duration-300" href="#">
            <Home size={18} /> Home
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant p-4 hover:bg-white/5 uppercase text-xs tracking-[0.05em] hover:translate-x-1 transition-transform duration-300" href="#projects">
            <Terminal size={18} /> Projects
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant p-4 hover:bg-white/5 uppercase text-xs tracking-[0.05em] hover:translate-x-1 transition-transform duration-300" href="#experience">
            <Briefcase size={18} /> Experience
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant p-4 hover:bg-white/5 uppercase text-xs tracking-[0.05em] hover:translate-x-1 transition-transform duration-300" href="#education">
            <School size={18} /> Education
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant p-4 hover:bg-white/5 uppercase text-xs tracking-[0.05em] hover:translate-x-1 transition-transform duration-300" href="#certificates">
            <Award size={18} /> Certificates
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant p-4 hover:bg-white/5 uppercase text-xs tracking-[0.05em] hover:translate-x-1 transition-transform duration-300" href="#contact">
            <AtSign size={18} /> Contact
          </a>
        </nav>
        <div className="px-6">
          <a 
            href="#contact" 
            className="w-full py-4 border border-primary/30 text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-on-primary transition-all text-center block"
          >
            Hire Me
          </a>
        </div>
      </aside>

      <main className="xl:pl-64 pt-24 min-h-screen grid-bg">
        
        {/* --- Hero Section --- */}
        <section className="px-6 md:px-12 py-32 relative overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent blur-[120px] rounded-full -mr-24 -mt-24 pointer-events-none"></div>
          
          {/* Brutalist Background Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.03] select-none">
            <h2 className="text-[25vw] font-sans font-black leading-none uppercase -skew-x-12">DATA</h2>
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 inline-block bg-primary text-on-primary px-4 py-1 font-black uppercase text-sm -skew-x-12 font-sans"
              >
                Christopher Fornesa
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="text-6xl md:text-[10vw] font-sans font-black tracking-tighter leading-[0.85] mb-12 uppercase"
              >
                <span className="text-tertiary">UNLEASH</span> <br/>
                <span className="stroke-text glitch-text" data-text="THE DATA">THE DATA</span> <br/>
                <span className="text-primary">REVOLUTION.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-on-surface-variant text-xl md:text-2xl max-w-2xl leading-tight mb-12 font-medium"
              >
                Data & Analytics Professional | Quantitative Storyteller. Breaking the box with brutalist precision and atmospheric depth.
              </motion.p>
              <div className="flex flex-wrap gap-6">
                <a href="#projects" className="brutal-border bg-primary text-on-primary font-black px-10 py-5 flex items-center gap-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-tighter text-lg">
                  View Projects <ArrowUpRight size={24} />
                </a>
                <a href="#contact" className="border-4 border-on-background text-on-background font-black px-10 py-5 hover:bg-on-background hover:text-background transition-all uppercase tracking-tighter text-lg">
                  Get In Touch
                </a>
              </div>
            </div>
            <div className="lg:col-span-4 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="relative z-20 brutal-border overflow-hidden aspect-[3/4] bg-surface"
              >
                <img 
                  src="/profile.jpeg" 
                  alt="Christopher Fornesa" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/chris-fornesa/800/1000" }}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-6 -right-6 w-full h-full border-4 border-secondary -z-10 -rotate-3"></div>
            </div>
          </div>
        </section>

        {/* --- Marquee --- */}
        <div className="bg-primary py-4 overflow-hidden border-y-4 border-on-background">
          <div className="marquee">
            <div className="marquee-content gap-12 items-center">
              {[...Array(10)].map((_, i) => (
                <React.Fragment key={i}>
                  <span className="text-on-primary font-sans font-black text-4xl uppercase">Python</span>
                  <span className="text-on-primary font-sans font-black text-4xl uppercase">SQL</span>
                  <span className="text-on-primary font-sans font-black text-4xl uppercase">R</span>
                  <span className="text-on-primary font-sans font-black text-4xl uppercase">Azure</span>
                  <span className="text-on-primary font-sans font-black text-4xl uppercase">Power BI</span>
                  <span className="text-on-primary font-sans font-black text-4xl uppercase">Machine Learning</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* --- Professional Summary --- */}
        <section className="px-6 md:px-12 py-24 bg-surface relative overflow-hidden border-y-4 border-on-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-4">
              <div className="brutal-border aspect-square overflow-hidden bg-primary/20 -rotate-3">
                <img 
                  src="/profile.jpeg" 
                  alt="Chris Fornesa" 
                  className="w-full h-full object-cover grayscale"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/chris-fornesa/800/800" }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="md:col-span-8">
              <h2 className="text-6xl font-sans font-black uppercase mb-8 leading-none -skew-x-6">The <span className="text-primary">Vision</span></h2>
              <p className="text-2xl font-medium leading-tight text-on-surface-variant mb-8">
                Creative data and analytics professional with five years of experience turning complex data into actionable insights. Skilled in quantitative analysis and communication to uncover policy insights and spread public awareness.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="brutal-border p-6 bg-surface-container">
                  <div className="text-5xl font-sans font-black text-primary">05+</div>
                  <div className="text-xs font-black uppercase tracking-widest">Years Experience</div>
                </div>
                <div className="brutal-border p-6 bg-surface-container">
                  <div className="text-5xl font-sans font-black text-secondary">4.0</div>
                  <div className="text-xs font-black uppercase tracking-widest">Academic Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Projects --- */}
        <section className="px-6 md:px-12 py-20" id="projects">
          <SectionHeading title="Selected Projects" icon={FlaskConical} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Interactive Resume with AI Agent",
                date: "Jan 2026",
                desc: "Mistral AI-powered chatbot to answer questions about skills, experience, and project fit.",
                link: "https://chris.com.ph"
              },
              {
                title: "Deconstruct Hate Speech",
                date: "Dec 2025",
                desc: "Hate speech detection trained on 5 hate speech datasets using ML and deep learning.",
                link: "https://cfornesa.com/deconstruct-hate-speech"
              },
              {
                title: "Algorithmic Political Bias",
                date: "May 2025",
                desc: "Policy framework addressing algorithmic bias, filter bubbles, and content moderation.",
                link: "https://cfornesa.com/algorithmic-political-bias"
              }
            ].map((proj, i) => (
              <div key={i}>
                <GlassCard className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2">{proj.title}</h3>
                    <p className="text-on-surface-variant text-xs mb-4 uppercase tracking-widest">{proj.date}</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{proj.desc}</p>
                  </div>
                  <a href={proj.link} target="_blank" className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    View Project <ArrowUpRight size={14} />
                  </a>
                </GlassCard>
              </div>
            ))}
          </div>
        </section>

        {/* --- Experience --- */}
        <section className="px-6 md:px-12 py-20" id="experience">
          <SectionHeading title="Experience" icon={Terminal} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-6">
              {[
                {
                  title: "Mobile Data SME",
                  company: "Chevron · Houston, TX",
                  period: "May 2024 – July 2025",
                  details: [
                    "Developed data solutions to provide clear, people-facing insights on mobility data.",
                    "Managed SharePoint platforms, optimizing IT architecture and data governance."
                  ]
                },
                {
                  title: "IT Analyst",
                  company: "Chevron · Houston, TX",
                  period: "Dec 2020 – Apr 2024",
                  details: [
                    "Delivered enterprise-level mobility support, translating complex technical information for diverse audiences.",
                    "Partnered with leadership to improve workflows and align data systems with organizational goals."
                  ]
                },
                {
                  title: "Network BI Analyst",
                  company: "Chevron · Houston, TX",
                  period: "Mar 2020 – Dec 2020",
                  details: [
                    "Designed and implemented intuitive Power BI dashboards to increase transparency and enable faster decisions.",
                    "Analyzed complex network data to identify performance gaps and present findings to management."
                  ]
                }
              ].map((job, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 10 }}
                  className="group relative glass-panel p-6 rounded-xl hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{job.title}</h3>
                      <p className="text-on-surface-variant font-medium uppercase text-xs tracking-wider">{job.company} • {job.period}</p>
                    </div>
                    <ChevronRight className="text-outline group-hover:text-primary transition-colors" />
                  </div>
                  <ul className="text-on-surface-variant space-y-2 text-sm leading-relaxed max-w-3xl">
                    {job.details.map((detail, j) => (
                      <li key={j}>• {detail}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop" 
                alt="Workspace" 
                className="w-full h-full object-cover rounded-2xl border border-outline-variant/20 shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* --- Skills & Tech Stack --- */}
        <section className="px-6 md:px-12 py-20 bg-surface-container-low/30" id="stack">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Terminal className="text-primary" size={32} />
                  <h3 className="text-xl font-bold uppercase tracking-wider">Technical</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Python (Pandas, NumPy)", "R", "SQL", "Azure", "Power BI", "SharePoint"].map(skill => (
                    <span key={skill} className="px-4 py-2 bg-surface-bright rounded-full text-xs font-bold text-on-surface border border-outline-variant/20 hover:border-primary/50 transition-colors">
                      {skill.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FlaskConical className="text-primary" size={32} />
                  <h3 className="text-xl font-bold uppercase tracking-wider">Research</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Quantitative Analysis", "Research Design", "Data Storytelling", "Program Evaluation", "Report Writing"].map(skill => (
                    <span key={skill} className="px-4 py-2 bg-surface-bright rounded-full text-xs font-bold text-on-surface border border-outline-variant/20 hover:border-primary/50 transition-colors">
                      {skill.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Menu className="text-primary" size={32} />
                  <h3 className="text-xl font-bold uppercase tracking-wider">Management</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Cross-Functional Collaboration", "Stakeholder Engagement", "Process Improvement"].map(skill => (
                    <span key={skill} className="px-4 py-2 bg-surface-bright rounded-full text-xs font-bold text-on-surface border border-outline-variant/20 hover:border-primary/50 transition-colors">
                      {skill.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Education & Certificates --- */}
        <section className="px-6 md:px-12 py-32 bg-surface">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div id="education">
              <h2 className="text-6xl font-sans font-black uppercase mb-12 leading-none">Education</h2>
              <div className="space-y-16 border-l-4 border-primary pl-12">
                {[
                  {
                    degree: "MS in Data Science",
                    school: "Boston University",
                    date: "Dec 2025",
                    gpa: "GPA 4.0",
                    details: [
                      "Advanced coursework in applied statistics and modeling.",
                      "Hands-on work with Python, R, and SQL for real-world data.",
                      "Emphasis on responsible AI, fairness, and transparent communication."
                    ]
                  },
                  {
                    degree: "BA in Liberal Studies",
                    school: "University of Houston",
                    date: "June 2018",
                    gpa: "GPA 4.0"
                  },
                  {
                    degree: "AA in Liberal Arts",
                    school: "Houston City College",
                    date: "June 2015",
                    gpa: "GPA 4.0"
                  }
                ].map((edu, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[60px] top-2 w-8 h-8 bg-background border-4 border-primary rounded-full"></div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter mb-1">{edu.degree}</h4>
                    <p className="text-primary font-black uppercase text-sm tracking-widest mb-2">{edu.school} • {edu.date}</p>
                    <p className="text-on-surface-variant font-bold">{edu.gpa}</p>
                    {edu.details && (
                      <div className="mt-6 space-y-2 text-on-surface-variant font-medium">
                        {edu.details.map((d, j) => <p key={j}>• {d}</p>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div id="certificates" className="brutal-border p-12 bg-surface-container">
              <h2 className="text-6xl font-sans font-black uppercase mb-12 leading-none">Certificates</h2>
              <div className="space-y-6">
                {[
                  "IBM AI Developer Certificate (Coursera, 2026)", 
                  "Google AI Certificate (Coursera, 2026)",  
                  "Google Business Intelligence Certificate (Coursera, 2025)",
                  "Google Advanced Data Analytics Certificate (Coursera, 2025)",
                  "Google Data Analytics Certificate (Coursera, 2025)",
                  "Corporate Entrepreneurship Certificate (UH, 2016)",
                  "Level I Web Publishing Certificate (HCC, 2016)"
                ].map((cert, i) => (
                  <div key={i} className="flex items-center justify-between p-6 border-2 border-outline hover:border-primary transition-colors bg-background group">
                    <p className="font-black uppercase tracking-tighter text-lg">{cert}</p>
                    <Award className="text-primary group-hover:scale-125 transition-transform" size={24} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- Contact / Footer --- */}
        <footer id="contact" className="w-full py-20 border-t border-outline/30 bg-surface-container-lowest flex flex-col items-center px-12 gap-12">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-black mb-6">LET'S <br/>CONNECT.</h2>
              <p className="text-on-surface-variant mb-8">
                Open for opportunities in Data Science, Analytics, and AI Engineering. Let's build something impactful together.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-on-surface">
                  <MapPin size={20} className="text-primary" /> Houston, TX
                </div>
                <div className="flex items-center gap-3 text-on-surface">
                  <Phone size={20} className="text-primary" /> (346) 762-3020
                </div>
                <div className="flex items-center gap-3 text-on-surface">
                  <Mail size={20} className="text-primary" /> cfornesa@outlook.com
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <a href="https://linkedin.com/in/cfornesa" target="_blank" className="flex items-center justify-between p-6 glass-panel rounded-xl hover:bg-primary/10 transition-all group">
                <div className="flex items-center gap-4">
                  <Linkedin className="text-primary" />
                  <span className="font-bold uppercase tracking-widest text-sm">LinkedIn</span>
                </div>
                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
              <a href="mailto:cfornesa@outlook.com" className="flex items-center justify-between p-6 glass-panel rounded-xl hover:bg-primary/10 transition-all group">
                <div className="flex items-center gap-4">
                  <Mail className="text-primary" />
                  <span className="font-bold uppercase tracking-widest text-sm">Email Me</span>
                </div>
                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
          <div className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mt-12">
            © {new Date().getFullYear()} CHRISTOPHER FORNESA. ALL RIGHTS RESERVED.
          </div>
        </footer>
      </main>

      {/* --- Fixed Action Bar --- */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 glass-panel rounded-full border border-primary/20 shadow-2xl">
        <button 
          onClick={toggleTheme}
          className="text-on-surface-variant hover:text-primary transition-colors" 
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="h-6 w-px bg-outline-variant/30 mx-2"></div>
        <button 
          onClick={() => setIsResumeOpen(!isResumeOpen)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface hover:text-primary transition-colors"
        >
          <Eye size={18} /> Resume
        </button>
        <div className="h-6 w-px bg-outline-variant/30 mx-2"></div>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="group flex items-center gap-3 bg-primary text-on-primary font-bold p-3 rounded-full hover:shadow-[0_0_20px_rgba(255,124,245,0.4)] transition-all"
          aria-label="Chat with Chris"
        >
          <Bot size={24} />
        </button>
      </div>

      {/* --- Chat Panel --- */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4 lg:p-8"
          >
            <motion.aside 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full h-full md:h-auto md:max-h-[calc(100vh-2rem)] lg:max-h-[85vh] md:max-w-3xl glass-panel md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bot className="text-primary" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Ask Chris</h3>
                    <p className="text-[10px] text-primary uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      Cybersecurity Analyst Monitoring
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12 landscape:py-4 landscape:text-left landscape:md:text-center">
                    <p className="text-on-surface-variant text-base mb-6 landscape:mb-2 landscape:md:mb-6">Hi! I'm Chris's AI assistant. Ask me anything about his background or skills.</p>
                    <div className="flex flex-wrap justify-center landscape:justify-start landscape:md:justify-center gap-3">
                      {["Tell me about Chris", "What are his skills?", "Work experience?"].map(q => (
                        <button 
                          key={q}
                          onClick={() => {
                            setUserInput(q);
                          }}
                          className="text-xs uppercase font-bold tracking-widest px-4 py-3 bg-surface-bright rounded-full border border-outline-variant/20 hover:border-primary transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm md:text-base ${msg.role === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-surface-container-high p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-6 border-t border-outline-variant/10 bg-surface-container">
                <div className="relative max-w-3xl mx-auto w-full">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your question..."
                    className="w-full bg-background border border-outline-variant/20 rounded-full px-6 py-4 pr-14 text-base focus:outline-none focus:border-primary transition-all shadow-inner"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-all p-2">
                    <Send size={24} />
                  </button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Resume Dialog --- */}
      <AnimatePresence>
        {isResumeOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4 lg:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-6xl h-full md:h-auto md:max-h-[calc(100vh-2rem)] lg:max-h-[90vh] bg-surface-container md:rounded-2xl rounded-none overflow-hidden flex flex-col shadow-2xl border border-outline-variant/20"
            >
              <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-high relative">
                <h3 className="font-bold flex items-center gap-2"><Eye size={20} className="text-primary" /> Resume</h3>
                
                <div className="flex items-center gap-2">
                  {/* Desktop Controls (Large Screens) */}
                  <div className="hidden lg:flex items-center gap-2">
                    <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))} className="p-2 hover:bg-white/5 rounded-lg shrink-0" title="Zoom Out"><ZoomOut size={20} /></button>
                    <span className="text-xs font-mono w-12 text-center shrink-0">{zoomLevel}%</span>
                    <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))} className="p-2 hover:bg-white/5 rounded-lg shrink-0" title="Zoom In"><ZoomIn size={20} /></button>
                    <div className="w-px h-6 bg-outline-variant/20 mx-2 shrink-0"></div>
                    <button onClick={() => setIsResumeOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-error shrink-0" title="Close"><X size={28} /></button>
                  </div>

                  {/* Tablet/Mobile Controls (Small to Medium Screens) */}
                  <div className="flex lg:hidden items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 mr-1">
                      <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))} className="p-2 hover:bg-white/5 rounded-lg"><ZoomOut size={18} /></button>
                      <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))} className="p-2 hover:bg-white/5 rounded-lg"><ZoomIn size={18} /></button>
                    </div>
                    <button 
                      onClick={() => setIsResumeMenuOpen(!isResumeMenuOpen)}
                      className="p-2 hover:bg-white/5 rounded-lg text-primary"
                      title="Menu"
                    >
                      <Menu size={24} />
                    </button>
                    <button onClick={() => setIsResumeOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-error" title="Close">
                      <X size={28} />
                    </button>
                  </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                  {isResumeMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="absolute top-16 right-4 z-[1300] bg-surface border-2 border-primary/30 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] p-5 flex flex-col gap-4 min-w-[260px]"
                    >
                      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-1">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Resume Controls</span>
                        <button onClick={() => setIsResumeMenuOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 py-2 bg-white/5 rounded-lg px-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Zoom Level</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))} className="p-2 bg-surface-bright rounded-md hover:bg-primary hover:text-white transition-all"><ZoomOut size={16} /></button>
                          <span className="text-xs font-mono font-bold w-10 text-center">{zoomLevel}%</span>
                          <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))} className="p-2 bg-surface-bright rounded-md hover:bg-primary hover:text-white transition-all"><ZoomIn size={16} /></button>
                        </div>
                      </div>

                      <div className="h-px bg-outline-variant/20 my-2"></div>

                      <button onClick={() => { setIsResumeOpen(false); setIsResumeMenuOpen(false); }} className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.15em] p-4 text-error bg-error/5 hover:bg-error hover:text-white rounded-xl transition-all border border-error/20">
                        <X size={20} /> Close Resume
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex-1 overflow-auto p-4 md:p-16 bg-surface-container-lowest flex justify-center">
                <div 
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-200"
                >
                  <ResumeContent />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Background Elements --- */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[40%] right-[5%] w-[30%] h-[30%] bg-secondary/15 blur-[100px] rounded-full"></div>
        
        {/* Floating Brutalist Shapes */}
        <motion.div 
          animate={{ rotate: 360, x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[10%] w-32 h-32 border-4 border-primary/20 -rotate-12"
        ></motion.div>
        <motion.div 
          animate={{ rotate: -360, x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[10%] w-48 h-48 border-4 border-secondary/20 rotate-45"
        ></motion.div>
        <div className="absolute top-[10%] right-[20%] text-[10vw] font-sans font-black text-on-background/5 select-none">01</div>
        <div className="absolute bottom-[10%] left-[20%] text-[10vw] font-sans font-black text-on-background/5 select-none">02</div>
      </div>

    </div>
  );
}
