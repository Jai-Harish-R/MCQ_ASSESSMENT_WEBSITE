'use client'

import Link from 'next/link'

export default function PatientDashboard() {
  return (
    <div className="flex bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-[#0b112b] py-6 shadow-2xl">
        <div className="px-6 mb-12">
          <span className="text-lg font-bold text-[#46f1c5] font-headline">VitalSync</span>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
              <img 
                className="w-full h-full object-cover" 
                alt="Close-up professional portrait of a medical provider" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKhiLZemslRWG97xIgOxijXmoKWe1FBGE7I8UaZujNcx_8u4w_sxJJhqJVrO9psAiB_PeOEoCZ9tBMOA9TrdAtSj5GgyZmMaqy2njZYnnPKdbppBl0OcKU5Ic3FvWXLBvhUqb4AX6WSili135pZlHcH6PSW7cyd12V-4u2_Rkho5NSJUaZ7A29cBLDAB3O_KjcMDTZ_5Ld2bAFjhjAOB_BAXP70yVSYc1Tdd-3vrK3p5GqJoe42NcnPNHnxMUB3E59_MIflR7OXNFo" 
              />
            </div>
            <div>
              <p className="text-sm font-bold font-headline text-on-surface">Clinical Portal</p>
              <p className="text-xs text-secondary opacity-60 font-label">Active Session</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link href="/patient/dashboard" className="bg-[#323853] text-[#46f1c5] rounded-xl px-4 py-3 mx-2 flex items-center gap-3 font-label text-sm transition-all duration-200 translate-x-1">
            <span className="material-symbols-outlined">dashboard</span>
            Overview
          </Link>
          <Link href="/patient/progress" className="text-[#c0c1ff] opacity-60 hover:opacity-100 hover:bg-[#323853]/50 px-4 py-3 mx-2 flex items-center gap-3 font-label text-sm transition-all duration-300">
            <span className="material-symbols-outlined">monitor_heart</span>
            Vitals
          </Link>
          <Link href="/patient/profile" className="text-[#c0c1ff] opacity-60 hover:opacity-100 hover:bg-[#323853]/50 px-4 py-3 mx-2 flex items-center gap-3 font-label text-sm transition-all duration-300">
            <span className="material-symbols-outlined">medication</span>
            Medications
          </Link>
          <Link href="/patient/reports" className="text-[#c0c1ff] opacity-60 hover:opacity-100 hover:bg-[#323853]/50 px-4 py-3 mx-2 flex items-center gap-3 font-label text-sm transition-all duration-300">
            <span className="material-symbols-outlined">description</span>
            Reports
          </Link>
          <Link href="/patient/diet" className="text-[#c0c1ff] opacity-60 hover:opacity-100 hover:bg-[#323853]/50 px-4 py-3 mx-2 flex items-center gap-3 font-label text-sm transition-all duration-300">
            <span className="material-symbols-outlined">restaurant</span>
            Diet
          </Link>
        </nav>
        <div className="px-4 mt-auto space-y-2">
          <Link href="/patient/sos" className="w-full py-3 bg-error-container text-on-error-container rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">emergency</span>
            Emergency SOS
          </Link>
          <div className="pt-4 border-t border-outline-variant/10">
            <Link href="/login" className="text-[#c0c1ff] opacity-60 hover:opacity-100 px-4 py-2 flex items-center gap-3 font-label text-xs">
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-64 min-h-screen pb-24 md:pb-8 w-full flex-1">
        {/* TopAppBar */}
        <header className="bg-[#0b112b]/60 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center w-full px-8 py-4 shadow-[0px_20px_40px_rgba(6,12,38,0.4)]">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tight text-[#46f1c5] font-headline">VitalSync</span>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/patient/dashboard" className="text-[#46f1c5] border-b-2 border-[#46f1c5] pb-1 font-body text-sm">Dashboard</Link>
              <Link href="/patient/reports" className="text-[#c0c1ff] opacity-70 hover:text-[#46f1c5] transition-colors duration-300 font-body text-sm">Reports</Link>
              <Link href="/patient/diet" className="text-[#c0c1ff] opacity-70 hover:text-[#46f1c5] transition-colors duration-300 font-body text-sm">Diet AI</Link>
              <Link href="/patient/sos" className="text-[#c0c1ff] opacity-70 hover:text-[#46f1c5] transition-colors duration-300 font-body text-sm">SOS</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
              <input className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-64 transition-all" placeholder="Search data..." type="text" />
            </div>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center overflow-hidden border border-primary/20">
              <img className="w-full h-full object-cover" alt="Avatar of Priya" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDtKd8wS56UJDdDOgK6fQyeNNv1aoOj2_gk7gEqSDMbEQT4PnPEd47V5zAuc7QYtEBh9YhDDuufmMU1qVrZkMChC1DYbF2pPTYeK59Te026oPP-IC_GL-I3Y56-hGj2j0LGaZYb9bY480L-YPLBvsht5tPZDlnhHIOadhYfsOzIuojNfQkcUczRL5EMzrrtsSjmD9dsKHK7DSdqagXAQ-Z-ohGExe1x-d2F3YVtIbtaZ53xRrKAVDdYSi3OzVVlJgYryJUD5odh4E3" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Hero Greeting & Meds */}
          <section className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight">
                Good Morning, <span className="text-primary">Priya 👋</span>
              </h1>
              <p className="text-secondary opacity-80 text-lg max-w-xl">
                You&apos;re doing great! Today&apos;s focus is maintaining your glucose levels after lunch.
              </p>
            </div>
            
            {/* Medicine Card */}
            <div className="w-full lg:w-96 bg-surface-container-low p-6 rounded-2xl border-l-4 border-primary shadow-xl flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-primary">medication</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface font-headline">Morning Dosage</p>
                  <p className="text-xs text-on-surface-variant font-label uppercase">Metformin · 500mg</p>
                </div>
              </div>
              <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-xl text-sm font-bold font-headline shadow-lg hover:scale-105 transition-transform">
                Take Now
              </button>
            </div>
          </section>

          {/* Top Grid: Score & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Health Score Card */}
            <div className="lg:col-span-8 bg-surface-container-low rounded-[2rem] p-8 relative overflow-hidden flex flex-col md:flex-row gap-12 items-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
                  <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                  <circle className="text-primary-container" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="143.76" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold font-label text-white">74%</span>
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Stable</span>
                </div>
              </div>
              <div className="flex-1 space-y-6 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold font-headline">Health Index</h3>
                    <p className="text-on-surface-variant text-sm">Calculated from last 7 days of activity</p>
                  </div>
                  <span className="material-symbols-outlined text-primary-container">trending_up</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-highest/40 p-3 rounded-xl border border-outline-variant/5">
                    <p className="text-[10px] text-on-surface-variant font-label uppercase">Medication</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-on-surface">92%</span>
                      <div className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="w-11/12 h-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-container-highest/40 p-3 rounded-xl border border-outline-variant/5">
                    <p className="text-[10px] text-on-surface-variant font-label uppercase">Vital Stability</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-on-surface">68%</span>
                      <div className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-secondary"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-container-highest/40 p-3 rounded-xl border border-outline-variant/5">
                    <p className="text-[10px] text-on-surface-variant font-label uppercase">Report Trend</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-on-surface">Positive</span>
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-highest/40 p-3 rounded-xl border border-outline-variant/5">
                    <p className="text-[10px] text-on-surface-variant font-label uppercase">Diet AI</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-on-surface">78%</span>
                      <div className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-tertiary"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              <Link href="/patient/profile" className="bg-surface-container-high hover:bg-primary/20 transition-all rounded-3xl p-6 flex flex-col justify-between group no-underline text-inherit">
                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">add_circle</span>
                <span className="font-bold font-headline text-left">Add Medicine</span>
              </Link>
              <Link href="/patient/diet" className="bg-surface-container-high hover:bg-secondary/20 transition-all rounded-3xl p-6 flex flex-col justify-between group no-underline text-inherit">
                <span className="material-symbols-outlined text-secondary text-3xl group-hover:scale-110 transition-transform">qr_code_scanner</span>
                <span className="font-bold font-headline text-left">Scan Food</span>
              </Link>
              <Link href="/patient/reports" className="bg-surface-container-high hover:bg-tertiary/20 transition-all rounded-3xl p-6 flex flex-col justify-between group no-underline text-inherit">
                <span className="material-symbols-outlined text-tertiary text-3xl group-hover:scale-110 transition-transform">upload_file</span>
                <span className="font-bold font-headline text-left">Upload Report</span>
              </Link>
              <Link href="/patient/sos" className="bg-error-container/20 border border-error/10 hover:bg-error/30 transition-all rounded-3xl p-6 flex flex-col justify-between group no-underline text-inherit">
                <span className="material-symbols-outlined text-error text-3xl group-hover:scale-110 transition-transform">emergency_share</span>
                <span className="font-bold font-headline text-left text-error">Send SOS</span>
              </Link>
            </div>
          </div>

          {/* Vitals Grid (2x2) */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-headline">Live Vitals</h2>
              <span className="text-xs font-label text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                LIVE SYNCING
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Blood Pressure */}
              <div className="bg-surface-container-low p-6 rounded-3xl space-y-4 hover:shadow-2xl transition-shadow border border-outline-variant/5">
                <div className="flex justify-between">
                  <span className="material-symbols-outlined text-secondary">blood_pressure</span>
                  <span className="px-2 py-1 bg-error/10 text-error text-[10px] font-bold rounded-lg font-label">+2% HIGH</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-body">Blood Pressure</p>
                  <h4 className="text-3xl font-bold font-label mt-1">128/84 <span className="text-sm font-normal text-on-surface-variant">mmHg</span></h4>
                </div>
                <div className="h-12 w-full flex items-end gap-1">
                  <div className="bg-secondary/20 w-full h-1/2 rounded-t-sm"></div>
                  <div className="bg-secondary/20 w-full h-3/4 rounded-t-sm"></div>
                  <div className="bg-secondary/40 w-full h-2/3 rounded-t-sm"></div>
                  <div className="bg-secondary/20 w-full h-1/2 rounded-t-sm"></div>
                  <div className="bg-secondary/20 w-full h-4/5 rounded-t-sm"></div>
                  <div className="bg-secondary w-full h-full rounded-t-sm"></div>
                </div>
              </div>

              {/* Blood Sugar */}
              <div className="bg-surface-container-low p-6 rounded-3xl space-y-4 hover:shadow-2xl transition-shadow border border-outline-variant/5">
                <div className="flex justify-between">
                  <span className="material-symbols-outlined text-primary">glucose</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg font-label">STABLE</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-body">Blood Sugar</p>
                  <h4 className="text-3xl font-bold font-label mt-1">94 <span className="text-sm font-normal text-on-surface-variant">mg/dL</span></h4>
                </div>
                <div className="h-12 w-full flex items-end gap-1">
                  <div className="bg-primary/20 w-full h-3/4 rounded-t-sm"></div>
                  <div className="bg-primary/20 w-full h-2/3 rounded-t-sm"></div>
                  <div className="bg-primary w-full h-full rounded-t-sm"></div>
                  <div className="bg-primary/40 w-full h-4/5 rounded-t-sm"></div>
                  <div className="bg-primary/20 w-full h-3/4 rounded-t-sm"></div>
                  <div className="bg-primary/20 w-full h-1/2 rounded-t-sm"></div>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="bg-surface-container-low p-6 rounded-3xl space-y-4 hover:shadow-2xl transition-shadow border border-outline-variant/5">
                <div className="flex justify-between">
                  <span className="material-symbols-outlined text-tertiary">favorite</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg font-label">OPTIMAL</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-body">Heart Rate</p>
                  <h4 className="text-3xl font-bold font-label mt-1 vital-glimmer">72 <span className="text-sm font-normal text-on-surface-variant">bpm</span></h4>
                </div>
                <div className="h-12 w-full flex items-end gap-1">
                  <div className="bg-tertiary/20 w-full h-1/2 rounded-t-sm"></div>
                  <div className="bg-tertiary/40 w-full h-2/3 rounded-t-sm"></div>
                  <div className="bg-tertiary/20 w-full h-3/4 rounded-t-sm"></div>
                  <div className="bg-tertiary w-full h-full rounded-t-sm"></div>
                  <div className="bg-tertiary/20 w-full h-4/5 rounded-t-sm"></div>
                  <div className="bg-tertiary/20 w-full h-1/2 rounded-t-sm"></div>
                </div>
              </div>

              {/* Weight */}
              <div className="bg-surface-container-low p-6 rounded-3xl space-y-4 hover:shadow-2xl transition-shadow border border-outline-variant/5">
                <div className="flex justify-between">
                  <span className="material-symbols-outlined text-on-surface">scale</span>
                  <span className="px-2 py-1 bg-error/10 text-error text-[10px] font-bold rounded-lg font-label">-0.4kg LOSS</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-body">Current Weight</p>
                  <h4 className="text-3xl font-bold font-label mt-1">64.2 <span className="text-sm font-normal text-on-surface-variant">kg</span></h4>
                </div>
                <div className="h-12 w-full flex items-end gap-1">
                  <div className="bg-outline/20 w-full h-full rounded-t-sm"></div>
                  <div className="bg-outline/20 w-full h-4/5 rounded-t-sm"></div>
                  <div className="bg-outline/40 w-full h-3/4 rounded-t-sm"></div>
                  <div className="bg-outline/20 w-full h-2/3 rounded-t-sm"></div>
                  <div className="bg-outline w-full h-1/2 rounded-t-sm"></div>
                  <div className="bg-outline/20 w-full h-1/3 rounded-t-sm"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Bento: Food Scanner & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Food Nutrient Scanner */}
            <div className="lg:col-span-7 bg-surface-container-low rounded-[2rem] p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-headline">Diet AI Scanner</h2>
                <button className="text-sm font-bold text-primary flex items-center gap-1">History <span className="material-symbols-outlined text-sm">chevron_right</span></button>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 bg-surface-container-highest border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-primary">camera_alt</span>
                  </div>
                  <p className="font-bold text-on-surface">Upload Plate</p>
                  <p className="text-xs text-on-surface-variant mt-1">AI will analyze calories &amp; sodium</p>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-container-highest rounded-xl overflow-hidden shadow-inner">
                      <img className="w-full h-full object-cover opacity-60" alt="Overhead shot of a balanced meal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDyayiVavaF-zHEeFU39Jj_dvhN4A7T2wDLM7B30OjoAdOonRR4bHT0LuQy8wi8C6XT3lmQ8tGr2CXGkgm77G-ohIVRQa6qUQ3Z655cCs2qBWNavzQd9ePVzeARz-qiqHyR6pY8fxMrp1HcrwR0JRQXCKDAjsTf31XGF8l4YOtp0_fQaTIP9WSjGtaR9XRtiV0DU6mEF7hIiZ9M51kFhCdmpRElqWgTsjbQNdwBWhNBWIec3U2rJoeQJp3ZQTEc72O5agFb8kgL3qj" />
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-label uppercase">Last Scan Result</p>
                      <p className="font-bold text-on-surface">White Rice &amp; Soy Egg</p>
                    </div>
                  </div>
                  <div className="p-4 bg-error/10 rounded-2xl border border-error/10">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-error">warning</span>
                      <div>
                        <p className="text-xs font-bold text-error uppercase font-label">Sodium Warning</p>
                        <p className="text-sm text-on-surface leading-snug mt-1">
                          Soy sauce detected. Estimated sodium is <span className="font-bold">850mg</span> (42% of daily limit).
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <div className="text-center px-4">
                      <p className="text-[10px] text-on-surface-variant font-label uppercase">Kcal</p>
                      <p className="font-bold">420</p>
                    </div>
                    <div className="text-center px-4 border-x border-outline-variant/10">
                      <p className="text-[10px] text-on-surface-variant font-label uppercase">Protein</p>
                      <p className="font-bold">12g</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-[10px] text-on-surface-variant font-label uppercase">Fiber</p>
                      <p className="font-bold">4g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals Tracker */}
            <div className="lg:col-span-5 bg-surface-container-low rounded-[2rem] p-8 space-y-6">
              <h2 className="text-2xl font-bold font-headline">Today&apos;s Goals</h2>
              <div className="space-y-6">
                {/* Water */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-lg">water_drop</span>
                      <span className="font-medium">Hydration</span>
                    </div>
                    <span className="font-label">1.2L / 2.5L</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="w-[48%] h-full bg-secondary"></div>
                  </div>
                </div>
                {/* Steps */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">steps</span>
                      <span className="font-medium">Daily Steps</span>
                    </div>
                    <span className="font-label">6,432 / 10k</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="w-[64%] h-full bg-primary"></div>
                  </div>
                </div>
                {/* Medicine */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-lg">pill</span>
                      <span className="font-medium">Medication</span>
                    </div>
                    <span className="font-label">1 / 3 Taken</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="w-[33%] h-full bg-tertiary"></div>
                  </div>
                </div>
                {/* Sleep */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary-fixed text-lg">bedtime</span>
                      <span className="font-medium">Restful Sleep</span>
                    </div>
                    <span className="font-label">6.5h / 8h</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="w-[81%] h-full bg-secondary-fixed"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Timeline */}
          <section className="bg-surface-container-low rounded-[2rem] p-8">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold font-headline">Health Activity</h2>
              <button className="bg-surface-container-highest px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">Download Log</button>
            </div>
            <div className="relative space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
              {/* Event 1 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-[10px] text-on-primary font-bold">check</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-on-surface">Medication Taken</h4>
                    <p className="text-sm text-on-surface-variant">Metformin (Morning Dose) logged successfully.</p>
                  </div>
                  <span className="text-xs font-label text-on-surface-variant opacity-60">08:30 AM</span>
                </div>
              </div>
              {/* Event 2 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-[10px] text-on-secondary font-bold">restaurant</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-on-surface">Food Scan: Breakfast</h4>
                    <p className="text-sm text-on-surface-variant">420 Kcal, High Sodium detected. AI logged to Diet report.</p>
                  </div>
                  <span className="text-xs font-label text-on-surface-variant opacity-60">08:15 AM</span>
                </div>
              </div>
              {/* Event 3 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-tertiary flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-[10px] text-on-tertiary font-bold">sync</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-on-surface">Cloud Vital Sync</h4>
                    <p className="text-sm text-on-surface-variant">Apple Health data imported. BP was 128/84.</p>
                  </div>
                  <span className="text-xs font-label text-on-surface-variant opacity-60">07:00 AM</span>
                </div>
              </div>
              {/* Event 4 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-[10px] text-outline font-bold">notifications_active</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-on-surface">Sleep Insight Available</h4>
                    <p className="text-sm text-on-surface-variant">Report shows 2 episodes of restless movement.</p>
                  </div>
                  <span className="text-xs font-label text-on-surface-variant opacity-60">06:45 AM</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-[#0b112b]/80 backdrop-blur-2xl rounded-t-3xl z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <Link href="/patient/dashboard" className="flex flex-col items-center justify-center bg-[#46f1c5]/10 text-[#46f1c5] rounded-2xl p-2 transition-all duration-200">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium font-label">Home</span>
        </Link>
        <Link href="/patient/progress" className="flex flex-col items-center justify-center text-[#c0c1ff] opacity-50 p-2 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined">favorite</span>
          <span className="text-[10px] font-medium font-label">Health</span>
        </Link>
        <Link href="/patient/diet" className="flex flex-col items-center justify-center text-[#c0c1ff] opacity-50 p-2 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="text-[10px] font-medium font-label">Scanner</span>
        </Link>
        <Link href="/patient/profile" className="flex flex-col items-center justify-center text-[#c0c1ff] opacity-50 p-2 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium font-label">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
