import { Play, CheckCircle2, ExternalLink, PlayCircle, Sparkles } from "lucide-react";

export function GlassMorph() {
  const tasks = [
    { id: 1, title: "Join Bonus", desc: "জয়েন বোনাস", reward: "৳20.00", type: "JOIN BONUS", done: true, icon: "🎁" },
    { id: 2, title: "Subscribe Channel", desc: "আমাদের চ্যানেলে যোগ দিন", reward: "৳15.00", type: "TELEGRAM", done: false, icon: "📢" },
    { id: 3, title: "Follow on YouTube", desc: "ইউটিউব চ্যানেল ফলো করুন", reward: "৳10.00", type: "YOUTUBE", done: false, icon: "▶️" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #0F0C29, #1A1050, #24243E)", fontFamily: "'Inter', sans-serif", color: "#fff", width: 390, minHeight: 780, position: "relative", overflow: "hidden" }}>
      {/* BG blobs */}
      <div style={{ position: "absolute", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 200, right: -100, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 100, left: 30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <Sparkles size={18} color="#A78BFA" fill="#A78BFA" />
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: -0.5, background: "linear-gradient(90deg, #A78BFA, #60A5FA, #F472B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Earn</h1>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Complete tasks to earn real cash</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(96,165,250,0.25))", backdropFilter: "blur(16px)", border: "1px solid rgba(167,139,250,0.4)", borderRadius: 14, padding: "8px 16px" }}>
            <span style={{ fontWeight: 900, fontSize: 16, background: "linear-gradient(90deg, #A78BFA, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>৳142.50</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 1 }}>
        {/* Video Ads Section */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: "linear-gradient(135deg, #A78BFA, #60A5FA)", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(167,139,250,0.4)" }}>
                <PlayCircle size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Video Ads</span>
            </div>
            <div style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.35)", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA" }}>৳5.00 / ad</span>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 18, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Daily Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#A78BFA" }}>2 / 20 watched</span>
            </div>

            {/* Gradient progress bar */}
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 10, marginBottom: 18 }}>
              <div style={{ background: "linear-gradient(90deg, #A78BFA, #60A5FA)", borderRadius: 99, height: "100%", width: "10%", boxShadow: "0 0 12px rgba(167,139,250,0.6)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["Server 1", "Server 2"].map(s => (
                <button key={s} style={{ background: "linear-gradient(135deg, #A78BFA, #60A5FA)", border: "none", borderRadius: 14, padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(167,139,250,0.4)" }}>
                  <Play size={15} fill="#fff" color="#fff" /> {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tasks Section */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ background: "linear-gradient(135deg, #34D399, #10B981)", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(52,211,153,0.35)" }}>
              <CheckCircle2 size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Tasks</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map(task => (
              <div key={task.id} style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: `1px solid ${task.done ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`, borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", opacity: task.done ? 0.5 : 1, boxShadow: task.done ? "none" : "0 4px 20px rgba(0,0,0,0.2)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {task.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{task.desc}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.4)", color: "#34D399", fontSize: 12, fontWeight: 800, borderRadius: 8, padding: "3px 10px" }}>+{task.reward}</span>
                    <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 8px", letterSpacing: 0.5 }}>{task.type}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {task.done ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: "#34D399", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 13 }}>
                      <CheckCircle2 size={14} /> Done
                    </div>
                  ) : (
                    <button style={{ background: "linear-gradient(135deg, #A78BFA, #60A5FA)", color: "#fff", borderRadius: 12, padding: "9px 14px", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 16px rgba(167,139,250,0.4)" }}>
                      Join <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
