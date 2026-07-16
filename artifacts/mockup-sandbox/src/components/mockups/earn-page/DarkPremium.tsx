import { Play, CheckCircle2, ExternalLink, Clock, PlayCircle } from "lucide-react";

export function DarkPremium() {
  const tasks = [
    { id: 1, title: "Join Bonus", desc: "জয়েন বোনাস", reward: "৳20.00", type: "JOIN BONUS", done: true, icon: "🎁" },
    { id: 2, title: "Subscribe Channel", desc: "আমাদের চ্যানেলে যোগ দিন", reward: "৳15.00", type: "TELEGRAM", done: false, icon: "📢" },
    { id: 3, title: "Follow on YouTube", desc: "ইউটিউব চ্যানেল ফলো করুন", reward: "৳10.00", type: "YOUTUBE", done: false, icon: "▶️" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0D0D0D", fontFamily: "'Inter', sans-serif", color: "#fff", width: 390 }}>
      {/* Header */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "16px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Earn</h1>
            <p style={{ fontSize: 13, color: "#888", margin: "2px 0 0" }}>Complete tasks to earn real cash</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #00E676, #00BFA5)", borderRadius: 12, padding: "6px 14px" }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#000" }}>৳142.50</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Video Ads Section */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: "linear-gradient(135deg, #00E676, #00BFA5)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlayCircle size={18} color="#000" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Video Ads</span>
            </div>
            <div style={{ background: "#1A2E22", border: "1px solid #00E676", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#00E676" }}>৳5.00 / ad</span>
            </div>
          </div>

          <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>Daily Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>2 / 20 watched</span>
            </div>

            {/* Progress bar */}
            <div style={{ background: "#1E1E1E", borderRadius: 99, height: 8, marginBottom: 18 }}>
              <div style={{ background: "linear-gradient(90deg, #00E676, #00BFA5)", borderRadius: 99, height: 8, width: "10%" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button style={{ background: "#1A2E22", border: "1px solid #00E676", borderRadius: 12, padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700, fontSize: 14, color: "#00E676", cursor: "pointer" }}>
                <Play size={15} fill="#00E676" /> Server 1
              </button>
              <button style={{ background: "#1A2E22", border: "1px solid #00E676", borderRadius: 12, padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700, fontSize: 14, color: "#00E676", cursor: "pointer" }}>
                <Play size={15} fill="#00E676" /> Server 2
              </button>
            </div>
          </div>
        </section>

        {/* Tasks Section */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ background: "linear-gradient(135deg, #00E676, #00BFA5)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={18} color="#000" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Tasks</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map(task => (
              <div key={task.id} style={{ background: "#111", border: `1px solid ${task.done ? "#1E1E1E" : "#222"}`, borderRadius: 16, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", opacity: task.done ? 0.6 : 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {task.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{task.desc}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ background: "#1A2E22", border: "1px solid #00E676", color: "#00E676", fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>+{task.reward}</span>
                    <span style={{ background: "#1E1E1E", color: "#666", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px", letterSpacing: 0.5 }}>{task.type}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {task.done ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#1A2E22", border: "1px solid #00E676", color: "#00E676", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 13 }}>
                      <CheckCircle2 size={14} /> Done
                    </div>
                  ) : (
                    <button style={{ background: "linear-gradient(135deg, #00E676, #00BFA5)", color: "#000", borderRadius: 10, padding: "8px 14px", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
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
