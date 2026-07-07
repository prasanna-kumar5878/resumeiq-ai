"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Shield, Sparkles, BarChart3, Terminal, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  // Animation variant definitions for standardized staggered entry flows
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030303]">
      
      {/* Background Radial Light Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40 mix-blend-screen z-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15)_0%,rgba(0,0,0,0)_60%)]" />

      {/* Header Navigation Link Wrapper */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 font-semibold text-xl tracking-tight text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span>ResumeIQ<span className="text-indigo-400">.ai</span></span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
        </nav>

        <button className="px-4 py-2 text-sm font-medium rounded-full border border-white/10 glass-panel bg-white/5 hover:bg-white/10 transition-all text-white">
          Launch Console
        </button>
      </header>

      {/* Main Interactive Hero Space Container */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Subtle Accent Pill */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation ATS Processing Engine</span>
          </motion.div>

          {/* Master Headliner Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6"
          >
            Optimize your resume for <br />
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              enterprise recruitment AI
            </span>
          </motion.h1>

          {/* Subtext Paragraph description */}
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed mb-10 max-w-2xl"
          >
            Leverage deep linguistic analysis and structured semantic data maps to trace skill gaps, score keyword density, and reverse-engineer corporate job descriptions instantly.
          </motion.p>

          {/* Core Interactive Action Directives */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.2)]">
              <span>Analyze Free Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-white font-semibold text-sm border border-white/10 bg-white/5 glass-panel hover:bg-white/10 transition-all">
              Request Enterprise API Demo
            </button>
          </motion.div>

          {/* Framer Motion Layered Abstract Resume Glass Panel View */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-4xl mx-auto rounded-2xl glass-panel relative p-6 sm:p-8 border border-white/10 shadow-2xl bg-neutral-900/40"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-xs text-neutral-500 font-mono ml-2">system_pipeline_matrix.tsx</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">
                ATS Metric Match: 98.4%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-mono text-xs">
              <div className="space-y-4 md:col-span-2 border-r border-white/[0.05] pr-0 md:pr-6">
                <div className="space-y-1">
                  <p className="text-indigo-400 font-semibold text-sm font-sans"># Senior Full-Stack Engineer Target</p>
                  <p className="text-neutral-500">// Quantitative Business Impact Mapping Verified</p>
                </div>
                <div className="p-3 rounded bg-white/[0.02] border border-white/[0.04] text-neutral-300">
                  <span className="text-purple-400">const</span> projects = [<span className="text-emerald-400">"Built decoupled Next.js micro-frontends processing $40M"</span>];
                </div>
                <p className="text-neutral-400 leading-relaxed font-sans text-sm">
                  Extracted and index-mapped 14 critical enterprise skill structures including: TypeScript, Redis, distributed message brokers, and transactional database optimization models.
                </p>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <p className="text-neutral-500 mb-2">// Vector Score Matrix</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400">Keyword Density</span><span className="text-white">96%</span></div>
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden"><div className="w-[96%] h-full bg-gradient-to-r from-indigo-500 to-purple-500" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400">Impact Metrics</span><span className="text-white">92%</span></div>
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden"><div className="w-[92%] h-full bg-gradient-to-r from-indigo-500 to-purple-500" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400">Readability Scale</span><span className="text-white">99%</span></div>
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden"><div className="w-[99%] h-full bg-gradient-to-r from-indigo-500 to-purple-500" /></div>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 bg-white/5 border border-white/10 rounded p-2 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Pipeline complete inside 240ms</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Grid Segment Area Mapping */}
        <section id="features" className="mt-40 pt-20 border-t border-white/[0.05]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
              Engineered for precision architecture evaluations.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base">
              Say goodbye to generic AI output. Access rigorous analytical insights matching institutional parser logic configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl glass-panel bg-neutral-900/20 border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Asymmetric ATS Scoring</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Traces quantitative phrasing, action verbs, schema readability layout indices, and keyword concentrations against real system indexes.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl glass-panel bg-neutral-900/20 border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Role Guard Permissions</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Integrated multi-tenant interfaces built specifically to support candidates, recruiters, and administrative configurations symmetrically.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl glass-panel bg-neutral-900/20 border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Automated Token Cycles</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Powered by custom security architectures that run real-time session tracking loops smoothly without system timeouts or interruptions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Basic Mini Footer Component asset */}
      <footer className="w-full border-t border-white/[0.05] py-8 text-center relative z-10 text-xs text-neutral-500">
        <p>&copy; 2026 ResumeIQ AI Inc. Built using Enterprise Decoupled Core Architectures.</p>
      </footer>
    </div>
  );
}