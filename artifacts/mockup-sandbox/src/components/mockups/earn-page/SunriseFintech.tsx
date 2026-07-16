import { Play, CheckCircle2, ExternalLink, TrendingUp, Star } from "lucide-react";

export function SunriseFintech() {
  const tasks = [
    { id: 1, title: "Join Bonus", desc: "জয়েন বোনাস", reward: "৳20.00", type: "JOIN BONUS", done: true, icon: "🎁" },
    { id: 2, title: "Subscribe Channel", desc: "আমাদের চ্যানেলে যোগ দিন", reward: "৳15.00", type: "TELEGRAM", done: false, icon: "📢" },
    { id: 3, title: "Follow on YouTube", desc: "ইউটিউব চ্যানেল ফলো করুন", reward: "৳10.00", type: "YOUTUBE", done: false, icon: "▶️" },
  ];

  return (
    <div style={{ width: 390, minHeight: 780, background: "#F8F4FF", fontFamily: "'Inter', sans-serif", color: "#1A0533" }}>
      {/* Hero header with gradient */}
      <div style={{ background: "linear-gradient(150deg, #6C21E8 0%, #E8347A 60%, #FF7B4A 100%)", padding: "24px 20px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: "0 0 4px", fontWeight: 600, letterSpacing: 0.3 }}>Total Balance</p>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, color: "#fff", letterSpacing: -1 }}>৳142.50</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
              <TrendingUp size={14} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>+৳20 today</span>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.25)" }}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
          </div>
        </div>
      </div>

      {/* Content pulled up over header */}
      <div style={{ padding: "0 16px 24px", marginTop: -16, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Video Ads Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 4px 24px rgba(108,33,232,0.1)", border: "1px solid rgba(108,33,232,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 17, margin: 0, color: "#1A0533" }}>🎬 Video Ads</h2>
              <p style={{ fontSize: 12, color: "#999", margin: "3px 0 0" }}>Earn by watching short ads</p>
            </div>
            <div style={{ background: "linear-gradient(135deg, #6C21E8, #E8347A)", borderRadius: 20, padding: "5px 14px" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>৳5.00 / ad</span>
            </div>
          </div>

          <div style={{ background: "#F8F4FF", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Daily Progress</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#6C21E8" }}>2 / 20 watched</span>
            </div>
            <div style={{ background: "#E8E0FF", borderRadius: 99, height: 10 }}>
              <div style={{ background: "linear-gradient(90deg, #6C21E8, #E8347A)", borderRadius: 99, height: "100%", width: "10%" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button style={{ background: "linear-gradient(135deg, #6C21E8, #9B51E0)", border: "none", borderRadius: 14, padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(108,33,232,0.35)" }}>
              <Play size={14} fill="#fff" color="#fff" /> Server 1
            </button>
            <button style={{ background: "linear-gradient(135deg, #E8347A, #FF7B4A)", border: "none", borderRadius: 14, padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(232,52,122,0.35)" }}>
              <Play size={14} fill="#fff" color="#fff" /> Server 2
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 17, margin: "0 0 12px", color: "#1A0533", display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={20} color="#6C21E8" /> Tasks
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map(task => (
              <div key={task.id} style={{ background: "#fff", border: `1.5px solid ${task.done ? "#F0EBF8" : "#EDE0FF"}`, borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", opacity: task.done ? 0.6 : 1, boxShadow: task.done ? "none" : "0 2px 12px rgba(108,33,232,0.07)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "linear-gradient(135deg, #F8F4FF, #EDE0FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: "1px solid #E8E0FF" }}>
                  {task.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#1A0533", marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>{task.desc}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ background: "linear-gradient(135deg, #6C21E8, #E8347A)", color: "#fff", fontSize: 11, fontWeight: 800, borderRadius: 8, padding: "3px 10px" }}>+{task.reward}</span>
                    <span style={{ background: "#F0EBF8", color: "#9B6EC8", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 8px", letterSpacing: 0.5 }}>{task.type}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {task.done ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#F0FFF4", border: "1.5px solid #6EE7A0", color: "#16A34A", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 13 }}>
                      <CheckCircle2 size={14} /> Done
                    </div>
                  ) : (
                    <button style={{ background: "linear-gradient(135deg, #6C21E8, #E8347A)", color: "#fff", borderRadius: 12, padding: "9px 14px", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 16px rgba(108,33,232,0.35)" }}>
                      Join <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
