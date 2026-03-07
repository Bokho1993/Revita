import { useState, useEffect, useCallback } from "react";
import { loadProfile, saveProfile } from "./firebase";

// ===== CONSTANTS =====
const HABITS = [
  { id: "sleep_hours", cat: "sleep", label: "Ngủ đủ giờ", emoji: "🌙", xp: 10, desc_bong: "≥9h", desc_beo: "≥9.5h" },
  { id: "bedtime", cat: "sleep", label: "Lên giường đúng giờ", emoji: "🛏️", xp: 2, desc_bong: "<21:30", desc_beo: "<21:00" },
  { id: "breakfast", cat: "food", label: "Bữa sáng đủ", emoji: "🍳", xp: 5 },
  { id: "dinner", cat: "food", label: "Bữa tối đủ", emoji: "🍲", xp: 5 },
  { id: "milk", cat: "food", label: "Uống sữa", emoji: "🥛", xp: 1 },
  { id: "supplement", cat: "food", label: "TPCN", emoji: "💊", xp: 3 },
  { id: "no_sugar", cat: "food", label: "Không đường", emoji: "🚫", xp: 3 },
  { id: "water", cat: "food", label: "Uống nước ≥1.5L", emoji: "💧", xp: 2 },
  { id: "exercise", cat: "move", label: "Vận động ≥30 phút", emoji: "🏃", xp: 5 },
  { id: "reading", cat: "mind", label: "Đọc sách 15 phút", emoji: "📖", xp: 2 },
  { id: "no_screen", cat: "mind", label: "Không screen tối", emoji: "📵", xp: 3 },
  { id: "family_talk", cat: "mind", label: "Trò chuyện gia đình", emoji: "💬", xp: 2 },
];

const CATEGORIES = {
  sleep: { name: "Giấc ngủ", color: "#6C63FF", icon: "🌙", maxXp: 12 },
  food: { name: "Dinh dưỡng", color: "#FF6B6B", icon: "🍎", maxXp: 19 },
  move: { name: "Vận động", color: "#4ECB71", icon: "⚡", maxXp: 5 },
  mind: { name: "Tinh thần", color: "#FFB347", icon: "✨", maxXp: 7 },
};

const LEVELS = [
  { name: "Mầm non", minXp: 0, icon: "🌱" },
  { name: "Cây con", minXp: 100, icon: "🌿" },
  { name: "Nở hoa", minXp: 300, icon: "🌸" },
  { name: "Chiến binh", minXp: 600, icon: "⚔️" },
  { name: "Hiệp sĩ", minXp: 1000, icon: "🛡️" },
  { name: "Anh hùng", minXp: 1500, icon: "🦸" },
  { name: "Siêu sao", minXp: 2500, icon: "⭐" },
  { name: "Huyền thoại", minXp: 4000, icon: "👑" },
  { name: "Thần thoại", minXp: 6000, icon: "🔥" },
  { name: "Bất tử", minXp: 10000, icon: "💎" },
];

const PHASES = [
  { id: 1, name: "Khởi động", months: "T3-T4", target: 25, focus: ["sleep"] },
  { id: 2, name: "Tập luyện", months: "T5-T7", target: 30, focus: ["sleep", "food"] },
  { id: 3, name: "Chuyển giao", months: "T8-T10", target: 35, focus: ["sleep", "food", "move"] },
  { id: 4, name: "Tự chủ", months: "T11-T12", target: 35, focus: ["sleep", "food", "move", "mind"] },
];

const PROFILES = {
  bong: { name: "Bông", avatar: "🌸", theme: "#FF69B4", themeLight: "#FFF0F5", role: "Nữ chiến binh hoa" },
  beo: { name: "Beo", avatar: "🐯", theme: "#FF8C00", themeLight: "#FFF8F0", role: "Chiến binh hổ" },
};

const ACHIEVEMENTS = [
  { id: "first_day", name: "Ngày đầu tiên", icon: "🎯", desc: "Hoàn thành ngày đầu", condition: (s) => s.totalDays >= 1 },
  { id: "streak_3", name: "Lửa nhỏ", icon: "🔥", desc: "Streak 3 ngày", condition: (s) => s.streak >= 3 },
  { id: "streak_7", name: "Ngọn lửa", icon: "🔥", desc: "Streak 7 ngày", condition: (s) => s.streak >= 7 },
  { id: "streak_14", name: "Bão lửa", icon: "🌋", desc: "Streak 14 ngày", condition: (s) => s.streak >= 14 },
  { id: "streak_30", name: "Huyền thoại lửa", icon: "☄️", desc: "Streak 30 ngày", condition: (s) => s.streak >= 30 },
  { id: "xp_100", name: "100 XP", icon: "💫", desc: "Tích lũy 100 XP", condition: (s) => s.totalXp >= 100 },
  { id: "xp_500", name: "500 XP", icon: "🌟", desc: "Tích lũy 500 XP", condition: (s) => s.totalXp >= 500 },
  { id: "xp_1000", name: "1000 XP", icon: "⭐", desc: "Tích lũy 1000 XP", condition: (s) => s.totalXp >= 1000 },
  { id: "perfect_day", name: "Ngày hoàn hảo", icon: "💯", desc: "43/43 điểm trong ngày", condition: (s) => s.perfectDays >= 1 },
  { id: "perfect_week", name: "Tuần hoàn hảo", icon: "🏆", desc: "7 ngày hoàn hảo liên tiếp", condition: (s) => s.perfectDays >= 7 },
  { id: "sleep_master", name: "Vua giấc ngủ", icon: "😴", desc: "Ngủ đủ 7 ngày liên tiếp", condition: (s) => s.sleepStreak >= 7 },
  { id: "eat_master", name: "Vua dinh dưỡng", icon: "🥗", desc: "Ăn đủ 7 ngày liên tiếp", condition: (s) => s.foodStreak >= 7 },
];

const SHOP_ITEMS = [
  { id: "streak_freeze", name: "Đóng băng Streak", icon: "❄️", cost: 50, desc: "Bảo vệ streak 1 ngày" },
  { id: "double_xp", name: "Nhân đôi XP", icon: "⚡", cost: 100, desc: "x2 XP trong 1 ngày" },
  { id: "theme_galaxy", name: "Theme Thiên hà", icon: "🌌", cost: 200, desc: "Đổi nền Galaxy" },
  { id: "theme_ocean", name: "Theme Đại dương", icon: "🌊", cost: 200, desc: "Đổi nền Ocean" },
  { id: "badge_crown", name: "Vương miện", icon: "👑", cost: 500, desc: "Huy hiệu đặc biệt" },
];

const TODAY = new Date().toISOString().split("T")[0];

function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.minXp) lvl = l; }
  return lvl;
}

function getNextLevel(xp) {
  for (const l of LEVELS) { if (xp < l.minXp) return l; }
  return null;
}

function getCurrentPhase() {
  const m = new Date().getMonth() + 1;
  if (m <= 4) return PHASES[0];
  if (m <= 7) return PHASES[1];
  if (m <= 10) return PHASES[2];
  return PHASES[3];
}

function getDefaultData() {
  return { totalXp: 0, gems: 10, streak: 0, maxStreak: 0, totalDays: 0, perfectDays: 0, sleepStreak: 0, foodStreak: 0, lastDate: null, history: {}, achievements: [], inventory: [], doubleXpToday: false };
}

// ===== PARTICLE BURST COMPONENT =====
function ParticleBurst({ active, color }) {
  if (!active) return null;
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const dist = 40 + Math.random() * 30;
    const size = 4 + Math.random() * 6;
    return (
      <div key={i} style={{
        position: "absolute", width: size, height: size, borderRadius: "50%",
        background: color || "#FFD700", left: "50%", top: "50%",
        animation: "particleBurst 0.6s ease-out forwards",
        animationDelay: `${i * 0.02}s`,
        transform: "translate(-50%, -50%)",
        "--tx": `${Math.cos(angle * Math.PI / 180) * dist}px`,
        "--ty": `${Math.sin(angle * Math.PI / 180) * dist}px`,
      }} />
    );
  });
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>{particles}</div>;
}

// ===== XP POPUP =====
function XpPopup({ xp, show }) {
  if (!show) return null;
  return (
    <div style={{
      position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
      fontWeight: 800, fontSize: 18, color: "#FFD700", zIndex: 20,
      animation: "xpFloat 0.8s ease-out forwards", textShadow: "0 1px 3px rgba(0,0,0,0.3)"
    }}>+{xp} XP</div>
  );
}

// ===== MAIN APP =====
export default function SuFamilyQuest() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [data, setData] = useState({});
  const [view, setView] = useState("today");
  const [checkedToday, setCheckedToday] = useState({});
  const [animatingHabit, setAnimatingHabit] = useState(null);
  const [showXpFor, setShowXpFor] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState("");
  const [newAchievement, setNewAchievement] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load from Firebase
  useEffect(() => {
    async function load() {
      for (const pid of ["bong", "beo"]) {
        const profileData = await loadProfile(pid);
        if (profileData) {
          setData(prev => ({ ...prev, [pid]: profileData }));
        }
      }
      setLoaded(true);
    }
    load();
  }, []);

  // Save to Firebase
  const saveData = useCallback(async (pid, newData) => {
    await saveProfile(pid, newData);
  }, []);

  const pd = currentProfile ? (data[currentProfile] || getDefaultData()) : null;

  // Load today's checks
  useEffect(() => {
    if (pd && pd.history && pd.history[TODAY]) {
      setCheckedToday(pd.history[TODAY]);
    } else {
      setCheckedToday({});
    }
  }, [currentProfile, pd?.history?.[TODAY] ? JSON.stringify(pd.history[TODAY]) : ""]);

  const toggleHabit = useCallback(async (habitId) => {
    if (!currentProfile) return;
    const habit = HABITS.find(h => h.id === habitId);
    const wasChecked = !!checkedToday[habitId];
    const newChecked = { ...checkedToday, [habitId]: !wasChecked };
    setCheckedToday(newChecked);

    const currentData = data[currentProfile] || getDefaultData();
    let xpDelta = wasChecked ? -habit.xp : habit.xp;
    if (!wasChecked && currentData.doubleXpToday) xpDelta = habit.xp * 2;

    const newHistory = { ...currentData.history, [TODAY]: newChecked };
    const todayXp = HABITS.reduce((sum, h) => sum + (newChecked[h.id] ? h.xp : 0), 0);
    const isCompletedDay = todayXp >= getCurrentPhase().target;

    // Calculate streak
    let streak = currentData.streak;
    let lastDate = currentData.lastDate;
    if (isCompletedDay && lastDate !== TODAY) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      streak = lastDate === yesterday ? streak + 1 : 1;
      lastDate = TODAY;
    }

    // Gems: earn 5 gems per completed day
    let gemsEarned = 0;
    const prevDayData = currentData.history?.[TODAY];
    const prevTodayXp = prevDayData ? HABITS.reduce((s, h) => s + (prevDayData[h.id] ? h.xp : 0), 0) : 0;
    const wasDayComplete = prevTodayXp >= getCurrentPhase().target;
    if (isCompletedDay && !wasDayComplete) gemsEarned = 5;

    const totalDays = isCompletedDay ? (currentData.totalDays + (wasDayComplete ? 0 : 1)) : currentData.totalDays;
    const perfectDays = todayXp >= 43 ? (currentData.perfectDays + (prevTodayXp >= 43 ? 0 : 1)) : currentData.perfectDays;

    // Category streaks
    const sleepComplete = HABITS.filter(h => h.cat === "sleep").every(h => newChecked[h.id]);
    const foodComplete = HABITS.filter(h => h.cat === "food").every(h => newChecked[h.id]);

    const updated = {
      ...currentData,
      totalXp: Math.max(0, currentData.totalXp + xpDelta),
      gems: currentData.gems + gemsEarned,
      streak, maxStreak: Math.max(streak, currentData.maxStreak || 0),
      totalDays, perfectDays, lastDate, history: newHistory,
      sleepStreak: sleepComplete ? (currentData.sleepStreak || 0) + 1 : 0,
      foodStreak: foodComplete ? (currentData.foodStreak || 0) + 1 : 0,
    };

    // Check achievements
    const newAchs = [...(currentData.achievements || [])];
    let justEarned = null;
    for (const ach of ACHIEVEMENTS) {
      if (!newAchs.includes(ach.id) && ach.condition(updated)) {
        newAchs.push(ach.id);
        justEarned = ach;
      }
    }
    updated.achievements = newAchs;

    // Animation
    if (!wasChecked) {
      setAnimatingHabit(habitId);
      setShowXpFor(habitId);
      setTimeout(() => { setAnimatingHabit(null); setShowXpFor(null); }, 800);
    }

    // Level up check
    const oldLevel = getLevel(currentData.totalXp);
    const newLevel = getLevel(updated.totalXp);
    if (newLevel.minXp > oldLevel.minXp && !wasChecked) {
      setTimeout(() => {
        setCelebrationMsg("🎉 Lên cấp: " + newLevel.icon + " " + newLevel.name + "!");
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }, 500);
    }

    // Achievement popup
    if (justEarned) {
      setTimeout(() => {
        setNewAchievement(justEarned);
        setTimeout(() => setNewAchievement(null), 3000);
      }, 800);
    }

    // Day complete celebration
    if (isCompletedDay && !wasDayComplete && !wasChecked) {
      setTimeout(() => {
        setCelebrationMsg("🎊 Hoàn thành mục tiêu ngày! +5 💎");
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }, 300);
    }

    const newData = { ...data, [currentProfile]: updated };
    setData(newData);
    await saveData(currentProfile, updated);
  }, [currentProfile, checkedToday, data, saveData]);

  const buyItem = useCallback(async (item) => {
    if (!currentProfile) return;
    const curr = data[currentProfile] || getDefaultData();
    if (curr.gems < item.cost) return;
    const updated = {
      ...curr,
      gems: curr.gems - item.cost,
      inventory: [...(curr.inventory || []), item.id],
      doubleXpToday: item.id === "double_xp" ? true : curr.doubleXpToday,
    };
    const newData = { ...data, [currentProfile]: updated };
    setData(newData);
    await saveData(currentProfile, updated);
  }, [currentProfile, data, saveData]);

  if (!loaded) {
    return (
      <div style={styles.loadingScreen}>
        <style>{globalStyles}</style>
        <div style={{ fontSize: 60, animation: "bounce 1s infinite" }}>🌟</div>
        <div style={{ marginTop: 16, fontSize: 18, color: "#666" }}>Đang tải...</div>
      </div>
    );
  }

  // ===== PROFILE SELECT SCREEN =====
  if (!currentProfile) {
    return (
      <div style={styles.profileScreen}>
        <style>{globalStyles}</style>
        <div style={styles.profileTitle}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #FF6B6B, #6C63FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Su Family Quest</h1>
          <p style={{ margin: "8px 0 0", color: "#888", fontSize: 14 }}>Chọn chiến binh của bạn</p>
        </div>
        <div style={styles.profileCards}>
          {Object.entries(PROFILES).map(([pid, p]) => {
            const profileData = data[pid] || getDefaultData();
            const lvl = getLevel(profileData.totalXp);
            return (
              <button key={pid} onClick={() => setCurrentProfile(pid)} style={{
                ...styles.profileCard,
                background: "linear-gradient(135deg, " + p.themeLight + ", white)",
                borderColor: p.theme,
              }}>
                <div style={{ fontSize: 56, marginBottom: 4 }}>{p.avatar}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#333" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{p.role}</div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 13 }}>
                  <span>{lvl.icon} {lvl.name}</span>
                  <span>🔥 {profileData.streak || 0}</span>
                </div>
                <div style={{ fontSize: 12, color: p.theme, fontWeight: 700, marginTop: 6 }}>{profileData.totalXp || 0} XP</div>
              </button>
            );
          })}
        </div>
        <div style={styles.familyBoard}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#666" }}>🏆 Bảng xếp hạng gia đình</h3>
          {Object.entries(PROFILES).sort((a, b) => ((data[b[0]]?.totalXp || 0) - (data[a[0]]?.totalXp || 0))).map(([pid, p], i) => (
            <div key={pid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 14 }}>
              <span style={{ fontWeight: 800, color: i === 0 ? "#FFD700" : "#999" }}>{i === 0 ? "🥇" : "🥈"}</span>
              <span>{p.avatar} {p.name}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, color: p.theme }}>{data[pid]?.totalXp || 0} XP</span>
              <span style={{ color: "#999" }}>🔥{data[pid]?.streak || 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== MAIN APP VIEW =====
  const profile = PROFILES[currentProfile];
  const playerData = pd || getDefaultData();
  const level = getLevel(playerData.totalXp);
  const nextLevel = getNextLevel(playerData.totalXp);
  const phase = getCurrentPhase();
  const todayXp = HABITS.reduce((s, h) => s + (checkedToday[h.id] ? h.xp : 0), 0);
  const todayPct = Math.min(100, (todayXp / phase.target) * 100);
  const levelPct = nextLevel ? ((playerData.totalXp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100 : 100;

  return (
    <div style={{ ...styles.app, background: profile.themeLight }}>
      <style>{globalStyles}</style>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div style={styles.celebrationOverlay}>
          <div style={styles.celebrationCard}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>{celebrationMsg}</div>
          </div>
        </div>
      )}

      {/* Achievement Popup */}
      {newAchievement && (
        <div style={styles.achievementPopup}>
          <div style={{ fontSize: 36 }}>{newAchievement.icon}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Huy chương mới!</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{newAchievement.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{newAchievement.desc}</div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ ...styles.topBar, borderBottomColor: profile.theme + "30" }}>
        <button onClick={() => setCurrentProfile(null)} style={styles.backBtn}>←</button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 24 }}>{profile.avatar}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#333" }}>{profile.name}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{level.icon} {level.name}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={styles.statBadge}>
            <span>🔥</span>
            <span style={{ fontWeight: 800, color: playerData.streak > 0 ? "#FF6B00" : "#CCC" }}>{playerData.streak}</span>
          </div>
          <div style={styles.statBadge}>
            <span>💎</span>
            <span style={{ fontWeight: 800, color: "#6C63FF" }}>{playerData.gems}</span>
          </div>
        </div>
      </div>

      {/* LEVEL PROGRESS */}
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 3 }}>
          <span>{level.icon} {level.name}</span>
          <span>{nextLevel ? playerData.totalXp + "/" + nextLevel.minXp + " XP" : "MAX"}</span>
          {nextLevel && <span>{nextLevel.icon} {nextLevel.name}</span>}
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: levelPct + "%", background: "linear-gradient(90deg, " + profile.theme + ", " + profile.theme + "CC)" }} />
        </div>
      </div>

      {/* NAV TABS */}
      <div style={styles.navTabs}>
        {[
          { id: "today", icon: "📋", label: "Hôm nay" },
          { id: "stats", icon: "📊", label: "Thống kê" },
          { id: "achievements", icon: "🏅", label: "Huy chương" },
          { id: "shop", icon: "🏪", label: "Cửa hàng" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{
            ...styles.navTab,
            color: view === tab.id ? profile.theme : "#999",
            borderBottomColor: view === tab.id ? profile.theme : "transparent",
            fontWeight: view === tab.id ? 700 : 500,
          }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{ fontSize: 11 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {/* ===== TODAY VIEW ===== */}
        {view === "today" && (
          <>
            {/* Daily target */}
            <div style={{ ...styles.card, background: todayPct >= 100 ? "linear-gradient(135deg, #4ECB71, #2ECC71)" : "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: todayPct >= 100 ? "white" : "#333" }}>
                    {todayPct >= 100 ? "✅ Hoàn thành!" : "🎯 Mục tiêu hôm nay"}
                  </div>
                  <div style={{ fontSize: 12, color: todayPct >= 100 ? "rgba(255,255,255,0.8)" : "#888" }}>
                    {"GĐ" + phase.id + ": " + phase.name + " (" + phase.months + ")"}
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: todayPct >= 100 ? "white" : profile.theme }}>
                  {todayXp}/{phase.target}
                </div>
              </div>
              <div style={{ ...styles.progressBar, height: 10, background: todayPct >= 100 ? "rgba(255,255,255,0.3)" : "#EEE" }}>
                <div style={{
                  ...styles.progressFill, height: 10,
                  width: todayPct + "%",
                  background: todayPct >= 100 ? "white" : "linear-gradient(90deg, " + profile.theme + ", #FFD700)",
                  transition: "width 0.5s ease",
                }} />
              </div>
              {playerData.doubleXpToday && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#FFD700", fontWeight: 700 }}>⚡ Nhân đôi XP đang hoạt động!</div>
              )}
            </div>

            {/* Habit categories */}
            {Object.entries(CATEGORIES).map(([catId, cat]) => {
              const catHabits = HABITS.filter(h => h.cat === catId);
              const catXp = catHabits.reduce((s, h) => s + (checkedToday[h.id] ? h.xp : 0), 0);
              const isFocus = phase.focus.includes(catId);
              return (
                <div key={catId} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "0 2px" }}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: cat.color }}>{cat.name}</span>
                    <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>{catXp}/{cat.maxXp}</span>
                    {isFocus && <span style={{ fontSize: 10, background: cat.color + "20", color: cat.color, padding: "1px 6px", borderRadius: 8, fontWeight: 700, marginLeft: "auto" }}>Focus</span>}
                  </div>
                  {catHabits.map(habit => {
                    const checked = !!checkedToday[habit.id];
                    const isAnimating = animatingHabit === habit.id;
                    const showXp = showXpFor === habit.id;
                    const desc = habit["desc_" + currentProfile] || "";
                    return (
                      <button key={habit.id} onClick={() => toggleHabit(habit.id)} style={{
                        ...styles.habitRow,
                        background: checked ? cat.color + "12" : "white",
                        borderColor: checked ? cat.color + "40" : "#EEE",
                        transform: isAnimating ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.2s ease",
                        position: "relative", overflow: "visible",
                      }}>
                        <ParticleBurst active={isAnimating} color={cat.color} />
                        <XpPopup xp={playerData.doubleXpToday ? habit.xp * 2 : habit.xp} show={showXp} />
                        <div style={{
                          ...styles.checkbox,
                          background: checked ? cat.color : "white",
                          borderColor: checked ? cat.color : "#DDD",
                          transform: isAnimating ? "scale(1.2)" : "scale(1)",
                        }}>
                          {checked && <span style={{ color: "white", fontSize: 14, fontWeight: 800 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 20 }}>{habit.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: checked ? cat.color : "#333" }}>{habit.label}</div>
                          {desc && <div style={{ fontSize: 11, color: "#999" }}>{desc}</div>}
                        </div>
                        <div style={{
                          fontSize: 12, fontWeight: 700,
                          color: checked ? cat.color : "#CCC",
                          background: checked ? cat.color + "15" : "#F5F5F5",
                          padding: "2px 8px", borderRadius: 10,
                        }}>+{habit.xp}</div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}

        {/* ===== STATS VIEW ===== */}
        {view === "stats" && (
          <>
            <div style={{ ...styles.card, textAlign: "center" }}>
              <div style={{ fontSize: 48 }}>{level.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: profile.theme }}>{level.name}</div>
              <div style={{ fontSize: 14, color: "#666" }}>{playerData.totalXp} XP tổng cộng</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "🔥", label: "Streak hiện tại", value: playerData.streak, color: "#FF6B00" },
                { icon: "🏆", label: "Streak cao nhất", value: playerData.maxStreak || 0, color: "#FFD700" },
                { icon: "📅", label: "Ngày hoàn thành", value: playerData.totalDays, color: "#4ECB71" },
                { icon: "💯", label: "Ngày hoàn hảo", value: playerData.perfectDays, color: "#FF69B4" },
                { icon: "💎", label: "Gems", value: playerData.gems, color: "#6C63FF" },
                { icon: "🏅", label: "Huy chương", value: (playerData.achievements || []).length, color: "#FF8C00" },
              ].map((s, i) => (
                <div key={i} style={styles.statCard}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Last 7 days */}
            <div style={styles.card}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📆 7 ngày gần nhất</div>
              <div style={{ display: "flex", gap: 4, justifyContent: "space-between" }}>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(Date.now() - (6 - i) * 86400000);
                  const key = d.toISOString().split("T")[0];
                  const dayData = playerData.history?.[key] || {};
                  const dayXp = HABITS.reduce((s, h) => s + (dayData[h.id] ? h.xp : 0), 0);
                  const pct = Math.min(100, (dayXp / phase.target) * 100);
                  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                  return (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>{days[d.getDay()]}</div>
                      <div style={{
                        height: 50, borderRadius: 6, background: "#F0F0F0", position: "relative", overflow: "hidden",
                      }}>
                        <div style={{
                          position: "absolute", bottom: 0, width: "100%",
                          height: pct + "%",
                          background: pct >= 100 ? profile.theme : profile.theme + "60",
                          borderRadius: 6, transition: "height 0.3s",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: pct >= 100 ? profile.theme : "#999", marginTop: 2 }}>{dayXp}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category breakdown */}
            <div style={styles.card}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📊 Phân loại hôm nay</div>
              {Object.entries(CATEGORIES).map(([catId, cat]) => {
                const catHabits = HABITS.filter(h => h.cat === catId);
                const done = catHabits.filter(h => checkedToday[h.id]).length;
                const pct = (done / catHabits.length) * 100;
                return (
                  <div key={catId} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span>{cat.icon} {cat.name}</span>
                      <span style={{ fontWeight: 700, color: cat.color }}>{done}/{catHabits.length}</span>
                    </div>
                    <div style={{ ...styles.progressBar, height: 8 }}>
                      <div style={{ ...styles.progressFill, height: 8, width: pct + "%", background: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== ACHIEVEMENTS VIEW ===== */}
        {view === "achievements" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, color: "#888" }}>
                {(playerData.achievements || []).length}/{ACHIEVEMENTS.length} huy chương
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ACHIEVEMENTS.map(ach => {
                const earned = (playerData.achievements || []).includes(ach.id);
                return (
                  <div key={ach.id} style={{
                    ...styles.achCard,
                    opacity: earned ? 1 : 0.4,
                    background: earned ? "white" : "#F5F5F5",
                    border: earned ? "2px solid " + profile.theme + "40" : "2px solid #EEE",
                  }}>
                    <div style={{ fontSize: 32 }}>{earned ? ach.icon : "🔒"}</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{ach.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{ach.desc}</div>
                    {earned && <div style={{ fontSize: 10, color: profile.theme, fontWeight: 700, marginTop: 4 }}>Đã đạt ✓</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== SHOP VIEW ===== */}
        {view === "shop" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 36 }}>💎</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#6C63FF" }}>{playerData.gems}</div>
              <div style={{ fontSize: 12, color: "#888" }}>Gems hiện có</div>
            </div>
            {SHOP_ITEMS.map(item => {
              const canAfford = playerData.gems >= item.cost;
              const owned = (playerData.inventory || []).includes(item.id) && !["streak_freeze", "double_xp"].includes(item.id);
              return (
                <div key={item.id} style={{
                  ...styles.shopItem,
                  opacity: canAfford ? 1 : 0.6,
                }}>
                  <span style={{ fontSize: 32 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{item.desc}</div>
                  </div>
                  <button onClick={() => canAfford && !owned && buyItem(item)} style={{
                    ...styles.buyBtn,
                    background: owned ? "#CCC" : canAfford ? profile.theme : "#EEE",
                    color: owned || canAfford ? "white" : "#999",
                    cursor: canAfford && !owned ? "pointer" : "default",
                  }}>
                    {owned ? "Đã có" : "💎 " + item.cost}
                  </button>
                </div>
              );
            })}
            <div style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 16 }}>
              Kiếm gems bằng cách hoàn thành mục tiêu mỗi ngày (+5 💎)
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== STYLES =====
const styles = {
  app: { maxWidth: 420, margin: "0 auto", minHeight: "100vh", fontFamily: "'Nunito', 'Segoe UI', sans-serif", position: "relative" },
  loadingScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Nunito', 'Segoe UI', sans-serif" },
  profileScreen: { maxWidth: 420, margin: "0 auto", minHeight: "100vh", padding: 24, background: "linear-gradient(180deg, #FFF5F5, #F0F0FF, #F0FFF0)", fontFamily: "'Nunito', 'Segoe UI', sans-serif" },
  profileTitle: { textAlign: "center", marginBottom: 28 },
  profileCards: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 },
  profileCard: { border: "3px solid", borderRadius: 20, padding: "24px 16px", cursor: "pointer", textAlign: "center", background: "white", transition: "transform 0.2s", outline: "none" },
  familyBoard: { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderBottom: "2px solid", position: "sticky", top: 0, zIndex: 50 },
  backBtn: { width: 36, height: 36, borderRadius: 12, border: "2px solid #EEE", background: "white", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  statBadge: { display: "flex", alignItems: "center", gap: 3, fontSize: 14 },
  navTabs: { display: "flex", borderBottom: "2px solid #EEE", background: "white" },
  navTab: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 4px", border: "none", borderBottom: "3px solid transparent", background: "none", cursor: "pointer", transition: "all 0.2s" },
  content: { padding: "12px 16px 80px" },
  card: { background: "white", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #F0F0F0" },
  progressBar: { height: 6, borderRadius: 10, background: "#EEE", overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 10, transition: "width 0.4s ease" },
  habitRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, border: "2px solid", marginBottom: 6, cursor: "pointer", width: "100%", textAlign: "left", outline: "none", position: "relative" },
  checkbox: { width: 26, height: 26, borderRadius: 8, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 },
  statCard: { background: "white", borderRadius: 14, padding: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #F0F0F0" },
  achCard: { borderRadius: 14, padding: 14, textAlign: "center" },
  shopItem: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "white", borderRadius: 14, marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #F0F0F0" },
  buyBtn: { border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  celebrationOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, animation: "fadeIn 0.3s ease" },
  celebrationCard: { background: "white", borderRadius: 24, padding: "32px 40px", textAlign: "center", animation: "popIn 0.4s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  achievementPopup: { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: 16, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, zIndex: 100, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", animation: "slideDown 0.4s ease", border: "2px solid #FFD700" },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  
  body { margin: 0; padding: 0; }
  
  button:hover { transform: scale(1.01); }
  button:active { transform: scale(0.98) !important; }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes particleBurst {
    0% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0); }
  }
  
  @keyframes xpFloat {
    0% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
  }
  
  @keyframes popIn {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
`;
