import { Play, CheckCircle2, ExternalLink, PlayCircle, ChevronRight, Award } from "lucide-react";

export function CleanWhitePro() {
  const tasks = [
    { id: 1, title: "Join Bonus", desc: "জয়েন বোনাস", reward: "৳20.00", type: "JOIN BONUS", done: true, icon: "🎁", color: "#FF6B35" },
    { id: 2, title: "Subscribe Channel", desc: "আমাদের চ্যানেলে যোগ দিন", reward: "৳15.00", type: "TELEGRAM", done: false, icon: "📢", color: "#0EA5E9" },
    { id: 3, title: "Follow on YouTube", desc: "ইউটিউব চ্যানেল ফলো করুন", reward: "৳10.00", type: "YOUTUBE", done: false, icon: "▶️", color: "#EF4444" },
  ];

  return (
    <div style={{ width: 390, minHeight: 780, background: "#FAFAFA", fontFamily: "'Inter', sans-serif", color: "#0F172A" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#0F172A", letterSpacing: -0.8 }}>Earn</h1>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "2px 0 0", fontWeight: 500 }}>Complete tasks · Earn real cash</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 2px", fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Balance</p>
            <p style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#0F172A", letterSpacing: -0.5 }}>৳142.50</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Today Earned", value: "৳20.00", icon: "💰", accent: "#10B981" },
            { label: "Ads Watched", value: "2 / 20", icon: "👁️", accent: "#3B82F6" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: stat.accent }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Video Ads Section */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontWeight: 800, fontSize: 16, margin: 0, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
              <PlayCircle size={18} color="#3B82F6" /> Video Ads
            </h2>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", background: "#EFF6FF", borderRadius: 20, padding: "4px 10px" }}>৳5.00 / ad</span>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #F1F5F9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            {/* Progress */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>Daily Progress</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#3B82F6" }}>2 / 20 watched</span>
            </div>
            <div style={{ background: "#EFF6FF", borderRadius: 99, height: 8, marginBottom: 18 }}>
              <div style={{ background: "linear-gradient(90deg, #3B82F6, #60A5FA)", borderRadius: 99, height: "100%", width: "10%" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button style={{ background: "#3B82F6", border: "none", borderRadius: 14, padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
                <Play size={14} fill="#fff" color="#fff" /> Server 1
              </button>
              <button style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "#475569", cursor: "pointer" }}>
                <Play size={14} fill="#475569" color="#475569" /> Server 2
              </button>
            </div>
          </div>
        </section>

        {/* Tasks Section */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontWeight: 800, fontSize: 16, margin: 0, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
              <Award size={18} color="#F59E0B" /> Tasks
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map(task => (
              <div key={task.id} style={{ background: "#fff", border: `1.5px solid ${task.done ? "#F1F5F9" : "#E2E8F0"}`, borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", opacity: task.done ? 0.55 : 1, boxShadow: task.done ? "none" : "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${task.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: `1px solid ${task.color}25` }}>
                  {task.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8 }}>{task.desc}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ background: "#F0FDF4", border: "1px solid #86EFAC", color: "#16A34A", fontSize: 11, fontWeight: 800, borderRadius: 8, padding: "3px 10px" }}>+{task.reward}</span>
                    <span style={{ background: "#F8FAFC", color: "#94A3B8", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 8px", letterSpacing: 0.5, border: "1px solid #E2E8F0" }}>{task.type}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {task.done ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#F0FDF4", border: "1.5px solid #86EFAC", color: "#16A34A", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 13 }}>
                      <CheckCircle2 size={14} /> Done
                    </div>
                  ) : (
                    <button style={{ background: "#0F172A", color: "#fff", borderRadius: 12, padding: "9px 14px", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      Join <ChevronRight size={14} />
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
