import { Play, CheckCircle2, ExternalLink, Zap } from "lucide-react";

export function NeonCyber() {
  const tasks = [
    { id: 1, title: "Join Bonus", desc: "জয়েন বোনাস", reward: "৳20.00", type: "JOIN BONUS", done: true, icon: "🎁" },
    { id: 2, title: "Subscribe Channel", desc: "আমাদের চ্যানেলে যোগ দিন", reward: "৳15.00", type: "TELEGRAM", done: false, icon: "📢" },
    { id: 3, title: "Follow on YouTube", desc: "ইউটিউব চ্যানেল ফলো করুন", reward: "৳10.00", type: "YOUTUBE", done: false, icon: "▶️" },
  ];

  return (
    <div style={{ width: 390, minHeight: 780, background: "#050714", fontFamily: "'Inter', sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Grid overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      {/* Glow blobs */}
      <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 260, height: 120, background: "radial-gradient(ellipse, rgba(0,240,255,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 120, right: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(255,0,200,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ background: "rgba(5,7,20,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,240,255,0.15)", padding: "18px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <Zap size={18} color="#00F0FF" fill="#00F0FF" />
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: 1, color: "#00F0FF", textShadow: "0 0 20px rgba(0,240,255,0.6)" }}>EARN</h1>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,240,255,0.4)", margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>Complete tasks · Earn cash</p>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.1), rgba(255,0,200,0.1))", border: "1px solid rgba(0,240,255,0.4)", borderRadius: 12, padding: "8px 16px", boxShadow: "0 0 20px rgba(0,240,255,0.2)" }}>
              <span style={{ fontWeight: 900, fontSize: 16, color: "#00F0FF", textShadow: "0 0 10px rgba(0,240,255,0.8)" }}>৳142.50</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 1 }}>
        {/* Video Ads */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 4, height: 20, background: "linear-gradient(180deg, #00F0FF, #FF00C8)", borderRadius: 2 }} />
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 1, textTransform: "uppercase", color: "#fff" }}>Video Ads</span>
            </div>
            <div style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.3)", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#00F0FF", letterSpacing: 0.5 }}>৳5.00 / ad</span>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,240,255,0.15)", borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5, textTransform: "uppercase" }}>Daily Progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#00F0FF" }}>2 / 20</span>
            </div>
            <div style={{ background: "rgba(0,240,255,0.08)", borderRadius: 99, height: 8, marginBottom: 18, border: "1px solid rgba(0,240,255,0.1)" }}>
              <div style={{ background: "linear-gradient(90deg, #00F0FF, #FF00C8)", borderRadius: 99, height: "100%", width: "10%", boxShadow: "0 0 12px rgba(0,240,255,0.8)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["Server 1", "Server 2"].map((s, i) => (
                <button key={s} style={{ background: i === 0 ? "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05))" : "linear-gradient(135deg, rgba(255,0,200,0.15), rgba(255,0,200,0.05))", border: `1px solid ${i === 0 ? "rgba(0,240,255,0.4)" : "rgba(255,0,200,0.4)"}`, borderRadius: 12, padding: "13px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: 13, color: i === 0 ? "#00F0FF" : "#FF00C8", cursor: "pointer", letterSpacing: 0.5, boxShadow: i === 0 ? "0 0 16px rgba(0,240,255,0.15)" : "0 0 16px rgba(255,0,200,0.15)" }}>
                  <Play size={14} fill={i === 0 ? "#00F0FF" : "#FF00C8"} color={i === 0 ? "#00F0FF" : "#FF00C8"} /> {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tasks */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 4, height: 20, background: "linear-gradient(180deg, #00F0FF, #FF00C8)", borderRadius: 2 }} />
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 1, textTransform: "uppercase" }}>Tasks</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map((task, i) => (
              <div key={task.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${task.done ? "rgba(255,255,255,0.06)" : "rgba(0,240,255,0.15)"}`, borderRadius: 16, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", opacity: task.done ? 0.5 : 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,240,255,0.06)", border: "1px solid rgba(0,240,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {task.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>{task.desc}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.35)", color: "#00F0FF", fontSize: 11, fontWeight: 800, borderRadius: 6, padding: "2px 8px" }}>+{task.reward}</span>
                    <span style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px", letterSpacing: 0.5 }}>{task.type}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {task.done ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.3)", color: "#00F0FF", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 12 }}>
                      <CheckCircle2 size={13} /> Done
                    </div>
                  ) : (
                    <button style={{ background: "linear-gradient(135deg, #00F0FF, #FF00C8)", color: "#050714", borderRadius: 10, padding: "8px 14px", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 20px rgba(0,240,255,0.35)" }}>
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
