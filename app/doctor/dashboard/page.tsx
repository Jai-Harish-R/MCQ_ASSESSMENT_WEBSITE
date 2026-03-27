'use client'

import Link from 'next/link'

export default function DoctorDashboard() {
  return (
    <div className="overflow-hidden h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      {/* Side Navigation Shell */}
      <aside className="fixed left-0 top-0 bottom-0 flex flex-col z-40 h-full w-72 flex-shrink-0 bg-[#0b112b] shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary">vital_signs</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#46f1c5] font-headline">VitalSync</h1>
        </div>
        <div className="px-6 mb-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#323853]/30">
            <img 
              alt="Doctor Profile" 
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNsnh9KhnJ9JtgeR9ZtOQyODc6_Yh5f4OjwGGDENFeXrPAigLh1Pr17gXRtrGbZqQg6nclcqjeNkWqh6mWKywryGepowft7Q_F4W2OhtWTmd4OSm0D6mlUSCivbTEDKRavaiP4YrsycVlREG2cqYoliPvp4zNEdo86SyLWIz0N3s7Ws5qTPUcVwV0D4etnt9YQ6tOxjMcth9pFhBNAtXv7IInInhZvSFX1RTcLKIaeSmWFUs2ZnTFiPzQAGu3_5AtObTxQVbdYLMab" 
            />
            <div>
              <p className="font-headline font-bold text-on-surface text-sm">Dr. Sterling</p>
              <p className="font-body text-xs text-on-surface-variant">Cardiology Dept.</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <div className="flex items-center gap-3 px-8 py-3 text-[#46f1c5] border-r-2 border-[#46f1c5] bg-[#323853]/50">
            <span className="material-symbols-outlined">group</span>
            <span className="font-body font-medium">Patients</span>
          </div>
          <div className="flex items-center gap-3 px-8 py-3 text-[#c0c1ff]/60 hover:bg-[#323853] hover:text-[#46f1c5] transition-colors duration-300">
            <span className="material-symbols-outlined">error</span>
            <span className="font-body font-medium">Critical Alerts</span>
          </div>
          <div className="flex items-center gap-3 px-8 py-3 text-[#c0c1ff]/60 hover:bg-[#323853] hover:text-[#46f1c5] transition-colors duration-300">
            <span className="material-symbols-outlined">magnification_small</span>
            <span className="font-body font-medium">Diagnostics</span>
          </div>
          <div className="flex items-center gap-3 px-8 py-3 text-[#c0c1ff]/60 hover:bg-[#323853] hover:text-[#46f1c5] transition-colors duration-300">
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-body font-medium">Schedules</span>
          </div>
          <div className="flex items-center gap-3 px-8 py-3 text-[#c0c1ff]/60 hover:bg-[#323853] hover:text-[#46f1c5] transition-colors duration-300">
            <span className="material-symbols-outlined">description</span>
            <span className="font-body font-medium">Clinical Notes</span>
          </div>
          <Link href="/login" className="flex items-center gap-3 px-8 py-3 text-[#c0c1ff]/60 hover:bg-[#323853] hover:text-[#46f1c5] transition-colors duration-300 mt-auto">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body font-medium">Logout</span>
          </Link>
        </nav>
        <div className="p-6">
          <button className="w-full py-4 px-4 bg-error-container text-on-error-container rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>notification_important</span>
            Review 4 Alerts
          </button>
        </div>
      </aside>

      {/* Top Navigation Shell */}
      <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 ml-72 bg-[#0b112b]/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-8">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
            <input className="bg-surface-container-highest border-none rounded-full pl-10 pr-6 py-2 text-sm w-80 focus:ring-1 focus:ring-primary outline-none" placeholder="Search Patients or Labs..." type="text" />
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            <a className="text-[#46f1c5] border-b-2 border-[#46f1c5] pb-1 text-sm font-medium" href="#">Patient Overview</a>
            <a className="text-[#c0c1ff]/70 hover:text-white transition-all text-sm font-medium" href="#">Medical History</a>
            <a className="text-[#c0c1ff]/70 hover:text-white transition-all text-sm font-medium" href="#">Lab Reports</a>
            <a className="text-[#c0c1ff]/70 hover:text-white transition-all text-sm font-medium" href="#">Genomics</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-surface-variant/20 border border-outline-variant/30 rounded-full text-xs font-headline font-bold text-secondary-fixed-dim hover:bg-surface-variant/40 transition-all">
            Upload Report
          </button>
          <button className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-xs font-headline font-bold hover:scale-[1.02] duration-200">
            Send AI Summary
          </button>
          <div className="flex items-center gap-2 ml-2">
            <span className="material-symbols-outlined text-[#c0c1ff]/70 cursor-pointer">notifications</span>
            <span className="material-symbols-outlined text-[#c0c1ff]/70 cursor-pointer">more_vert</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="ml-72 flex h-[calc(100vh-72px)] overflow-hidden">
        {/* Left Patient List (WhatsApp Style) */}
        <section className="w-80 border-r border-white/5 flex flex-col bg-surface-container-low/50">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <h3 className="font-headline font-bold text-on-surface">Active Cases</h3>
            <span className="material-symbols-outlined text-outline cursor-pointer">filter_list</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Pinned SOS Patient */}
            <div className="p-4 bg-error-container/20 border-l-4 border-error relative cursor-pointer hover:bg-error-container/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      alt="Radha Devi" 
                      className="w-12 h-12 rounded-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXiEt1eFlurj-GVNG-WxpOmkkEYugoJoDu5K63WHni8x7gjKiF65_ipivVKh__kQg1toInc_IBH65LWkqU7MZPLtqxmNLBJ8smKSRCmw-pJ8zL_QVRq9oBJRo_pLJ8-Sg9ckBHSqOQxy0UJ0irjjKbXsyqF9tUiVCP0RpyfrPi6MALAlwjsIr0-F6y1j-s410Px5NfcxLFLxVHdWs8ITaawVu7OVOIbVdjbllvKsr90CdjwDF08P4AjWMnvHB9SPbfjboW0mYYbS5S" 
                    />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary vital-pulse"></span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface">Radha Devi</h4>
                    <p className="font-label text-[10px] text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">warning</span>
                      CRITICAL ALERT
                    </p>
                  </div>
                </div>
                <span className="font-label text-[10px] text-outline">2:14 PM</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="bg-surface-container-highest px-2 py-1 rounded flex items-center gap-1">
                  <span className="font-label text-xs text-error font-bold">182/112</span>
                  <span className="text-[8px] text-outline">BP</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold sos-pulse text-on-error-container">SOS</span>
              </div>
            </div>

            {/* Other Patients */}
            <div className="p-4 border-b border-white/5 cursor-pointer hover:bg-surface-container-highest transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img 
                    alt="Patient" 
                    className="w-12 h-12 rounded-full object-cover grayscale opacity-70" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuATVO2BPhMgr2DEdLY1OYUOJq_0B60DkBZPQraEy6V6A-PQfQ9A2QOvksf3VRO2aXwjMf1DCW1QNLMzAkAgZSB3qWO7ZGKj3c9FGMd7BvWqNPGxORxjQs_LdCPIbkLTJ87lAZiSErADsOb5yLQpyiQsFoRgDvm1Gv4rbySXHS61aM6PUUoMccI2N-OElFTuXZsHezlZRGxyEE0N6PZLTOW9zND8zaMOQdHwdYi1Up5PtVvZK4c4jD76jwgJuPEHD-teQnPpbBphqtwp" 
                  />
                  <div>
                    <h4 className="font-headline font-medium text-sm text-on-surface/80">Amitabh K.</h4>
                    <p className="font-body text-xs text-outline">Stable • Post-Op Day 3</p>
                  </div>
                </div>
                <span className="font-label text-[10px] text-outline">1:45 PM</span>
              </div>
            </div>
            <div className="p-4 border-b border-white/5 cursor-pointer hover:bg-surface-container-highest transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img 
                    alt="Patient" 
                    className="w-12 h-12 rounded-full object-cover grayscale opacity-70" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaZ2q9q_qY3_u_JID35c5aPjobfO6KPiA5mvReiddBshqQOQJDEaxfcG5P6_C3csR-lOoAPDEwM6nqXNpbNCUrihXmX-qs4JR99EC2erJyC0PPfTE6KDKSPpWrj9ObiHluYSaDxkIXIdNPflj9oBDjzNJgouUUugtszXFZvccH9nvUBgfvzEkDuLgBJ1GJN-7h3BXoBgyAhWWGwxX3zzjPXLCsaxEQRsyl4BlJV_QIJK7T7F04tVgv23meSXZKD_wW-IVH3oozhmcO" 
                  />
                  <div>
                    <h4 className="font-headline font-medium text-sm text-on-surface/80">Sanya Sharma</h4>
                    <p className="font-body text-xs text-outline">Awaiting Lab Reports</p>
                  </div>
                </div>
                <span className="font-label text-[10px] text-outline">12:30 PM</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Panel */}
        <section className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar gap-8">
          {/* Top Overview Row */}
          <div className="grid grid-cols-12 gap-8">
            {/* Critical Health Score Card */}
            <div className="col-span-12 lg:col-span-4 glass-panel p-8 rounded-xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-error/10 blur-3xl rounded-full"></div>
              <div>
                <h3 className="font-headline text-lg font-bold mb-1">Health Score</h3>
                <p className="text-xs text-outline font-body">Composite Real-time Analysis</p>
              </div>
              <div className="my-6 text-center">
                <div className="inline-flex flex-col items-center">
                  <span className="font-headline text-7xl font-extrabold text-error">38%</span>
                  <span className="font-label text-xs tracking-widest text-error/60 uppercase mt-2">CRITICAL STATE</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="w-[38%] h-full bg-error"></div>
              </div>
            </div>

            {/* Vitals History Chart (Placeholder Visualization) */}
            <div className="col-span-12 lg:col-span-8 glass-panel p-8 rounded-xl border border-white/5 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline text-lg font-bold">Vitals History</h3>
                  <p className="text-xs text-outline font-body">Blood Pressure (Systolic) - Last 24h</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">LIVE</span>
                  <span className="px-3 py-1 bg-surface-container-highest text-outline text-[10px] font-bold rounded-full">LOGS</span>
                </div>
              </div>
              <div className="flex-1 flex items-end gap-2 px-2 h-40">
                {/* Simulated bar chart spike */}
                <div className="flex-1 bg-primary/20 h-24 rounded-t-sm"></div>
                <div className="flex-1 bg-primary/20 h-20 rounded-t-sm"></div>
                <div className="flex-1 bg-primary/20 h-22 rounded-t-sm"></div>
                <div className="flex-1 bg-primary/20 h-18 rounded-t-sm"></div>
                <div className="flex-1 bg-primary/20 h-26 rounded-t-sm"></div>
                <div className="flex-1 bg-primary/20 h-24 rounded-t-sm"></div>
                <div className="flex-1 bg-primary/20 h-32 rounded-t-sm"></div>
                <div className="flex-1 bg-error/40 h-48 rounded-t-sm relative">
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-label text-[10px] text-error font-bold">182</span>
                </div>
                <div className="flex-1 bg-error/60 h-56 rounded-t-sm relative">
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-label text-[10px] text-error font-bold">190</span>
                </div>
                <div className="flex-1 bg-error h-40 rounded-t-sm"></div>
              </div>
              <div className="flex justify-between mt-4 border-t border-white/5 pt-4">
                <span className="font-label text-[10px] text-outline">08:00</span>
                <span className="font-label text-[10px] text-outline">12:00</span>
                <span className="font-label text-[10px] text-outline">16:00</span>
                <span className="font-label text-[10px] text-error font-bold">Current (14:14)</span>
              </div>
            </div>
          </div>

          {/* Bottom Chat & Actions Row */}
          <div className="flex-1 grid grid-cols-12 gap-8">
            {/* Clinical Chat Window */}
            <div className="col-span-12 lg:col-span-8 flex flex-col glass-panel rounded-xl border border-white/5 overflow-hidden">
              <div className="p-4 bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">forum</span>
                  <h3 className="font-headline font-bold text-sm">Clinical Coordination</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-[10px] text-outline font-label uppercase">Connected</span>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                {/* AI Analysis Message */}
                <div className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary text-sm">smart_toy</span>
                  </div>
                  <div className="bg-surface-container-highest p-4 rounded-2xl rounded-tl-none">
                    <p className="text-xs text-on-surface leading-relaxed">
                      Analyzing patient metrics... BP spike detected at 2:10 PM. Pulse Oximetry remains stable at 96%. Patient has a history of hypertensive crisis. 
                    </p>
                    <p className="text-[10px] text-outline mt-2 font-label">VitalSync AI • 2:12 PM</p>
                  </div>
                </div>

                {/* SYSTEM ALERT MESSAGE */}
                <div className="mx-auto w-full max-w-lg bg-error-container/20 border border-error/20 p-6 rounded-2xl text-center">
                  <p className="text-xs font-headline font-bold text-error tracking-wide mb-4 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">report</span>
                    🚨 SYSTEM: Patient&apos;s BP exceeds critical threshold. Report uploaded at 2:14 PM.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button className="px-4 py-2 bg-error text-on-error rounded-full text-[10px] font-bold uppercase tracking-tighter hover:bg-error/80 transition-all">View Report</button>
                    <button className="px-4 py-2 border border-error/40 text-error rounded-full text-[10px] font-bold uppercase tracking-tighter hover:bg-error/10 transition-all">Call Patient</button>
                    <button className="px-4 py-2 bg-surface-container-highest text-outline rounded-full text-[10px] font-bold uppercase tracking-tighter hover:text-white transition-all">Mark Reviewed</button>
                  </div>
                </div>
              </div>

              {/* Chat Input Area */}
              <div className="p-4 bg-surface-container-low border-t border-white/5">
                <div className="flex gap-4 mb-4">
                  <button className="flex-1 py-2 px-4 bg-secondary/10 border border-secondary/20 text-secondary rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary/20 transition-all">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Send AI Summary
                  </button>
                  <button className="flex-1 py-2 px-4 bg-tertiary/10 border border-tertiary/20 text-tertiary rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-tertiary/20 transition-all">
                    <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                    Generate Diet Plan
                  </button>
                </div>
                <div className="relative">
                  <input className="w-full bg-surface-container-highest border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Type clinical note or command..." type="text" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Side Context / Patient Info */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-xl border border-white/5">
                <h4 className="font-headline font-bold text-sm mb-4">Current Medications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface-container-highest rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">pill</span>
                      <span className="text-xs font-medium">Amlodipine 5mg</span>
                    </div>
                    <span className="text-[10px] text-outline">OD</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-highest rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">pill</span>
                      <span className="text-xs font-medium">Metformin 500mg</span>
                    </div>
                    <span className="text-[10px] text-outline">BD</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-white/5 flex-1 relative overflow-hidden">
                <img 
                  alt="Lab Detail" 
                  className="absolute inset-0 w-full h-full object-cover opacity-10" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiT13h5KGegORGEWypHVsNI6dd48P-HgI8Rh_vWoqIxNTCyCwWxIudLiy9aB10XyNcr5EFfWI41p5_3qlz5a1-3CdDtjC8Ts_2T8HyZoUkGvONSfuuI9B9uSYqjSqietxlceNMK1aagPZB6Tyg9a0wfQM9MaW8mbelRHxRAdM8z14uGBNKr9-6FfB98OEI-L5C7nw5wYbBdihOl6q7FAUPTqpd9ULATzv3lU4lp2bZJH19ttNKUUHlzK-KvKTgHc_vAsNCcNA3rN0y" 
                />
                <div className="relative z-10">
                  <h4 className="font-headline font-bold text-sm mb-4">Active Lab Orders</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded bg-tertiary-container/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary-container">biotech</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">Lipid Profile</p>
                      <p className="text-[10px] text-outline">Scheduled: Tomorrow, 09:00 AM</p>
                    </div>
                  </div>
                  <button className="w-full py-2 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all">Schedule New Test</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-full shadow-2xl flex items-center justify-center text-on-primary hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add_call</span>
      </button>
    </div>
  )
}
