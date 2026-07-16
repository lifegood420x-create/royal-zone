import { Play, CheckCircle2, ExternalLink, PlayCircle, Flame } from "lucide-react";

export function GoldBlack() {
  const tasks = [
    { id: 1, title: "Join Bonus", desc: "জয়েন বোনাস", reward: "৳20.00", type: "JOIN BONUS", done: true, icon: "🎁" },
    { id: 2, title: "Subscribe Channel", desc: "আমাদের চ্যানেলে যোগ দিন", reward: "৳15.00", type: "TELEGRAM", done: false, icon: "📢" },
    { id: 3, title: "Follow on YouTube", desc: "ইউটিউব চ্যানেল ফলো করুন", reward: "৳10.00", type: "YOUTUBE", done: false, icon: "▶️" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#080808", fontFamily: "'Inter', sans-serif", color: "#fff", width: 390 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A1200, #0D0D0D)", borderBottom: "1px solid #2A1F00", padding: "18px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <Flame size={18} color="#F59E0B" fill="#F59E0B" />
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: -0.5, background: "linear-gradient(90deg, #F59E0B, #FCD34D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Earn</h1>
            </div>
            <p style={{ fontSize: 13, color: "#6B5A2A", margin: 0 }}>Complete tasks to earn real cash</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: 14, padding: "8px 16px", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}>
            <span style={{ fontWeight: 900, fontSize: 16, color: "#000" }}>৳142.50</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Video Ads Section */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>🎬 Video Ads</span>
            </div>
            <div style={{ background: "linear-gradient(135deg, #F59E0B22, #D9770622)", border: "1px solid #F59E0B66", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>৳5.00 / ad</span>
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, #111, #0D0A00)", border: "1px solid #2A1F00", borderRadius: 20, padding: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6B5A2A", fontWeight: 600 }}>Daily Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B" }}>2 / 20 watched</span>
            </div>

            {/* Gold progress bar */}
            <div style={{ background: "#1A1200", borderRadius: 99, height: 10, marginBottom: 18, border: "1px solid #2A1F00" }}>
              <div style={{ background: "linear-gradient(90deg, #F59E0B, #FCD34D)", borderRadius: 99, height: "100%", width: "10%", boxShadow: "0 0 10px #F59E0B88" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["Server 1", "Server 2"].map(s => (
                <button key={s} style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", border: "none", borderRadius: 14, padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: 14, color: "#000", cursor: "pointer", boxShadow: "0 4px 16px rgba(245,158,11,0.35)" }}>
                  <Play size={15} fill="#000" color="#000" /> {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tasks Section */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>✅ Tasks</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map((task, i) => (
              <div key={task.id} style={{ background: "linear-gradient(135deg, #111, #0D0A00)", border: `1px solid ${task.done ? "#2A1F00" : "#3A2800"}`, borderRadius: 18, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", opacity: task.done ? 0.55 : 1, boxShadow: task.done ? "none" : "0 2px 16px rgba(245,158,11,0.08)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "#1A1200", border: "1px solid #3A2800", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {task.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: "#6B5A2A", marginBottom: 8 }}>{task.desc}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ background: "linear-gradient(135deg, #F59E0B22, #D9770622)", border: "1px solid #F59E0B66", color: "#F59E0B", fontSize: 12, fontWeight: 800, borderRadius: 8, padding: "3px 10px" }}>+{task.reward}</span>
                    <span style={{ background: "#1A1200", color: "#6B5A2A", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "3px 8px", letterSpacing: 0.5 }}>{task.type}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {task.done ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#1A1200", border: "1px solid #F59E0B66", color: "#F59E0B", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 13 }}>
                      <CheckCircle2 size={14} /> Done
                    </div>
                  ) : (
                    <button style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#000", borderRadius: 12, padding: "9px 14px", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 14px rgba(245,158,11,0.4)" }}>
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
