import { useState, useEffect, useCallback } from "react";
import { loadProfile, saveProfile } from "./firebase";

// ===== KIDS HABITS (13 items, 43 XP max) =====
const KIDS_HABITS = [
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

// ===== TRUONG HABITS (17 items) =====
const TRUONG_HABITS = [
  { id: "t_meal", cat: "food", label: "Bữa ăn chuẩn", emoji: "🥗", xp: 5, desc: "Rau+protein+tinh bột+béo+quả (x2=10đ)" },
  { id: "t_no_sugar", cat: "food", label: "Không ăn đường", emoji: "🚫", xp: 3 },
  { id: "t_water", cat: "food", label: "Uống đủ nước ≥2L", emoji: "💧", xp: 3 },
  { id: "t_supplement", cat: "food", label: "TPCN đầy đủ", emoji: "💊", xp: 4 },
  { id: "t_sleep7", cat: "sleep", label: "Ngủ ≥7h", emoji: "😴", xp: 12, exclusive: "t_sleep8" },
  { id: "t_sleep8", cat: "sleep", label: "Ngủ ≥8h", emoji: "🌙", xp: 15, exclusive: "t_sleep7" },
  { id: "t_bedtime", cat: "sleep", label: "Lên giường <22:30", emoji: "🛏️", xp: 3 },
  { id: "t_meditate", cat: "mind", label: "Thiền 30 phút", emoji: "🧘", xp: 5 },
  { id: "t_breathe", cat: "mind", label: "Hít thở nhẹ", emoji: "🌬️", xp: 2 },
  { id: "t_wimhof", cat: "mind", label: "Thở Wim Hof", emoji: "❄️", xp: 3 },
  { id: "t_exercise", cat: "move", label: "Tập nhẹ ≥30ph", emoji: "🧘", xp: 5, desc: "Yoga/đi bộ/bơi" },
  { id: "t_cycle", cat: "move", label: "Đạp xe", emoji: "🚴", xp: 5, desc: "5đ/5km" },
  { id: "t_cycle_intense", cat: "move", label: "Đạp xe cường độ", emoji: "⚡", xp: 10, desc: "Interval" },
  { id: "t_pushup", cat: "move", label: "Chống đẩy/gập bụng", emoji: "💪", xp: 1 },
  { id: "t_read10", cat: "learn", label: "Đọc sách ≥10ph", emoji: "📖", xp: 1, exclusive: "t_read30" },
  { id: "t_read30", cat: "learn", label: "Đọc sách ≥30ph", emoji: "📚", xp: 3, exclusive: "t_read10" },
  { id: "t_journal", cat: "learn", label: "Ghi chép cuối ngày", emoji: "📝", xp: 2 },
];

const KIDS_CATEGORIES = {
  sleep: { name: "Giấc ngủ", color: "#6C63FF", icon: "🌙" },
  food: { name: "Dinh dưỡng", color: "#FF6B6B", icon: "🍎" },
  move: { name: "Vận động", color: "#4ECB71", icon: "⚡" },
  mind: { name: "Tinh thần", color: "#FFB347", icon: "✨" },
};

const TRUONG_CATEGORIES = {
  food: { name: "Dinh dưỡng", color: "#FF6B6B", icon: "🍎" },
  sleep: { name: "Giấc ngủ", color: "#6C63FF", icon: "🌙" },
  mind: { name: "Tinh thần", color: "#FFB347", icon: "🧘" },
  move: { name: "Vận động", color: "#4ECB71", icon: "💪" },
  learn: { name: "Học tập", color: "#3498DB", icon: "📚" },
};

const LEVELS = [
  { name: "Mầm non", minXp: 0, icon: "🌱" },
  { name: "Hạt giống", minXp: 100, icon: "🫘" },
  { name: "Cây mầm", minXp: 250, icon: "🌿" },
  { name: "Nở hoa", minXp: 500, icon: "🌸" },
  { name: "Cây khỏe", minXp: 800, icon: "🌳" },
  { name: "Chiến binh", minXp: 1000, icon: "⚔️" },
  { name: "Dũng sĩ", minXp: 1500, icon: "🗡️" },
  { name: "Hiệp sĩ", minXp: 2000, icon: "🛡️" },
  { name: "Đội trưởng", minXp: 3000, icon: "🎖️" },
  { name: "Anh hùng", minXp: 5000, icon: "🦸" },
  { name: "Siêu sao", minXp: 7000, icon: "⭐" },
  { name: "Bậc thầy", minXp: 9000, icon: "🎓" },
  { name: "Đại sư", minXp: 11000, icon: "🥋" },
  { name: "Chiến thần", minXp: 13000, icon: "🔱" },
  { name: "Huyền thoại", minXp: 15000, icon: "👑" },
  { name: "Thần thoại", minXp: 20000, icon: "🔥" },
  { name: "Bất tử", minXp: 25000, icon: "💎" },
  { name: "Thiên thần", minXp: 30000, icon: "😇" },
  { name: "Thượng đế", minXp: 35000, icon: "🌟" },
  { name: "Vũ trụ", minXp: 40000, icon: "🌌" },
];

const PHASES = [
  { id: 1, name: "Khởi động", months: "T3-T4", target: 25, focus: ["sleep"] },
  { id: 2, name: "Tập luyện", months: "T5-T7", target: 30, focus: ["sleep", "food"] },
  { id: 3, name: "Chuyển giao", months: "T8-T10", target: 35, focus: ["sleep", "food", "move"] },
  { id: 4, name: "Tự chủ", months: "T11-T12", target: 35, focus: ["sleep", "food", "move", "mind"] },
];

const PROFILES = {
  truong: { name: "Bố Trường", avatar: "🦁", theme: "#2C3E50", themeLight: "#F0F3F5", role: "Thủ lĩnh gia đình", isKid: false },
  bong: { name: "Bông", avatar: "🌸", theme: "#FF69B4", themeLight: "#FFF0F5", role: "Nữ chiến binh hoa", isKid: true },
  beo: { name: "Beo", avatar: "🐯", theme: "#FF8C00", themeLight: "#FFF8F0", role: "Chiến binh hổ", isKid: true },
};

const ACHIEVEMENTS = [
  { id: "first_day", name: "Ngày đầu tiên", icon: "🎯", desc: "Hoàn thành ngày đầu", condition: function(s) { return s.totalDays >= 1; } },
  { id: "streak_7", name: "7 ngày lửa", icon: "🔥", desc: "Streak 7 ngày", condition: function(s) { return s.streak >= 7; } },
  { id: "streak_30", name: "30 ngày bền bỉ", icon: "☄️", desc: "Streak 30 ngày", condition: function(s) { return s.streak >= 30; } },
  { id: "streak_100", name: "100 ngày huyền thoại", icon: "💫", desc: "Streak 100 ngày", condition: function(s) { return s.streak >= 100; } },
  { id: "perfect_day", name: "Ngày hoàn hảo", icon: "💯", desc: "Full điểm trong ngày", condition: function(s) { return s.perfectDays >= 1; } },
  { id: "xp_500", name: "500 XP", icon: "🌟", desc: "Tích lũy 500 XP", condition: function(s) { return s.totalXp >= 500; } },
  { id: "xp_1000", name: "1000 XP", icon: "⭐", desc: "Tích lũy 1000 XP", condition: function(s) { return s.totalXp >= 1000; } },
  { id: "xp_5000", name: "5000 XP", icon: "🏆", desc: "Tích lũy 5000 XP", condition: function(s) { return s.totalXp >= 5000; } },
  { id: "bookworm", name: "Mọt sách", icon: "📚", desc: "Đọc sách 14 ngày liên tiếp", condition: function(s) { return s.readStreak >= 14; } },
  { id: "sugar_free_7", name: "Không đường 7 ngày", icon: "🍃", desc: "Không đường 7 ngày liên tiếp", condition: function(s) { return s.sugarFreeStreak >= 7; } },
  { id: "sleep_master", name: "Vua giấc ngủ", icon: "😴", desc: "Ngủ đủ 14 ngày liên tiếp", condition: function(s) { return s.sleepStreak >= 14; } },
  { id: "exercise_hero", name: "Vận động viên", icon: "🏅", desc: "Vận động 14 ngày liên tiếp", condition: function(s) { return s.exerciseStreak >= 14; } },
];

const TREASURES = [
  { id: "ice_cream", name: "Kem đặc biệt", icon: "🍦", stickers: 3 },
  { id: "choose_book", name: "Chọn truyện mới", icon: "📖", stickers: 5 },
  { id: "choose_food", name: "Chọn món ăn tối", icon: "🍕", stickers: 5 },
  { id: "movie_night", name: "Tối xem phim", icon: "🎬", stickers: 8 },
  { id: "park_trip", name: "Đi công viên", icon: "🎡", stickers: 10 },
  { id: "toy_small", name: "Đồ chơi nhỏ", icon: "🎁", stickers: 15 },
];

const TIME_CATS = [
  { id: "health", name: "Sức khỏe", icon: "💪", color: "#27AE60" },
  { id: "family", name: "Gia đình", icon: "👨‍👩‍👧‍👦", color: "#E74C3C" },
  { id: "cssk", name: "Học CSSK", icon: "🎓", color: "#F39C12" },
  { id: "strategy", name: "Học Chiến lược", icon: "📊", color: "#3498DB" },
  { id: "finance", name: "Tài chính & ĐT", icon: "💰", color: "#9B59B6" },
  { id: "ilp", name: "Landmark/ILP", icon: "⭐", color: "#E67E22" },
  { id: "lh_cds", name: "LH — CĐS", icon: "🏢", color: "#2C3E50" },
  { id: "lh_coach", name: "LH — Cố vấn", icon: "🏢", color: "#34495E" },
  { id: "revita", name: "Revita", icon: "🌱", color: "#1ABC9C" },
  { id: "friends", name: "Bạn bè", icon: "🤝", color: "#95A5A6" },
  { id: "fun", name: "Giải trí", icon: "🎮", color: "#D5DBDB" },
  { id: "house", name: "Xây nhà", icon: "🏠", color: "#A04000" },
  { id: "other", name: "Khác", icon: "⚡", color: "#BDC3C7" },
];

var SHOP_ITEMS = [
  { id: "streak_freeze", name: "Đóng băng Streak", icon: "❄️", cost: 50, desc: "Bảo vệ streak 1 ngày" },
  { id: "double_xp", name: "Nhân đôi XP", icon: "⚡", cost: 100, desc: "x2 XP trong 1 ngày" },
  { id: "theme_galaxy", name: "Theme Thiên hà", icon: "🌌", cost: 200, desc: "Đổi nền" },
  { id: "theme_ocean", name: "Theme Đại dương", icon: "🌊", cost: 200, desc: "Đổi nền" },
];

var TODAY = new Date().toISOString().split("T")[0];

function getLevel(xp) { var lvl = LEVELS[0]; for (var i = 0; i < LEVELS.length; i++) { if (xp >= LEVELS[i].minXp) lvl = LEVELS[i]; } return lvl; }
function getNextLevel(xp) { for (var i = 0; i < LEVELS.length; i++) { if (xp < LEVELS[i].minXp) return LEVELS[i]; } return null; }
function getCurrentPhase() { var m = new Date().getMonth() + 1; if (m <= 4) return PHASES[0]; if (m <= 7) return PHASES[1]; if (m <= 10) return PHASES[2]; return PHASES[3]; }
function getDefaultData() { return { totalXp: 0, gems: 10, streak: 0, maxStreak: 0, totalDays: 0, perfectDays: 0, sleepStreak: 0, foodStreak: 0, readStreak: 0, sugarFreeStreak: 0, exerciseStreak: 0, stickers: 0, lastDate: null, history: {}, achievements: [], inventory: [], doubleXpToday: false, timeLog: {}, freedomScore: {} }; }

function ParticleBurst(props) {
  if (!props.active) return null;
  var particles = [];
  for (var i = 0; i < 12; i++) {
    var angle = (i / 12) * 360;
    var dist = 40 + Math.random() * 30;
    var size = 4 + Math.random() * 6;
    particles.push(React.createElement("div", { key: i, style: { position: "absolute", width: size, height: size, borderRadius: "50%", background: props.color || "#FFD700", left: "50%", top: "50%", animation: "particleBurst 0.6s ease-out forwards", animationDelay: i * 0.02 + "s", transform: "translate(-50%, -50%)", "--tx": Math.cos(angle * Math.PI / 180) * dist + "px", "--ty": Math.sin(angle * Math.PI / 180) * dist + "px" } }));
  }
  return React.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 } }, particles);
}

function XpPopup(props) {
  if (!props.show) return null;
  return React.createElement("div", { style: { position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontWeight: 800, fontSize: 18, color: "#FFD700", zIndex: 20, animation: "xpFloat 0.8s ease-out forwards", textShadow: "0 1px 3px rgba(0,0,0,0.3)" } }, "+" + props.xp + " XP");
}

export default function SuFamilyQuest() {
  var _s = useState(null), currentProfile = _s[0], setCurrentProfile = _s[1];
  var _d = useState({}), data = _d[0], setData = _d[1];
  var _v = useState("today"), view = _v[0], setView = _v[1];
  var _c = useState({}), checkedToday = _c[0], setCheckedToday = _c[1];
  var _a = useState(null), animatingHabit = _a[0], setAnimatingHabit = _a[1];
  var _x = useState(null), showXpFor = _x[0], setShowXpFor = _x[1];
  var _sc = useState(false), showCelebration = _sc[0], setShowCelebration = _sc[1];
  var _cm = useState(""), celebrationMsg = _cm[0], setCelebrationMsg = _cm[1];
  var _na = useState(null), newAchievement = _na[0], setNewAchievement = _na[1];
  var _l = useState(false), loaded = _l[0], setLoaded = _l[1];
  var _fs = useState(0), freedomScore = _fs[0], setFreedomScore = _fs[1];
  var _te = useState({}), timeEntries = _te[0], setTimeEntries = _te[1];

  useEffect(function() {
    async function load() {
      var pids = Object.keys(PROFILES);
      for (var i = 0; i < pids.length; i++) {
        var profileData = await loadProfile(pids[i]);
        if (profileData) { setData(function(prev) { var n = Object.assign({}, prev); n[pids[i]] = profileData; return n; }); }
      }
      setLoaded(true);
    }
    load();
  }, []);

  var saveDataFn = useCallback(async function(pid, newData) { await saveProfile(pid, newData); }, []);

  var pd = currentProfile ? (data[currentProfile] || getDefaultData()) : null;
  var isKid = currentProfile ? (PROFILES[currentProfile] && PROFILES[currentProfile].isKid) : false;
  var habits = isKid ? KIDS_HABITS : TRUONG_HABITS;
  var categories = isKid ? KIDS_CATEGORIES : TRUONG_CATEGORIES;

  useEffect(function() {
    if (pd && pd.history && pd.history[TODAY]) setCheckedToday(pd.history[TODAY]);
    else setCheckedToday({});
    if (pd && pd.timeLog && pd.timeLog[TODAY]) setTimeEntries(pd.timeLog[TODAY]);
    else setTimeEntries({});
    if (pd && pd.freedomScore && pd.freedomScore[TODAY]) setFreedomScore(pd.freedomScore[TODAY]);
    else setFreedomScore(0);
  }, [currentProfile, pd ? JSON.stringify(pd.history ? pd.history[TODAY] : {}) : ""]);

  var toggleHabit = useCallback(async function(habitId) {
    if (!currentProfile) return;
    var habit = habits.find(function(h) { return h.id === habitId; });
    var wasChecked = !!checkedToday[habitId];
    var newChecked = Object.assign({}, checkedToday);
    newChecked[habitId] = !wasChecked;
    if (habit.exclusive && !wasChecked) newChecked[habit.exclusive] = false;
    setCheckedToday(newChecked);

    var currentData = data[currentProfile] || getDefaultData();
    var maxXpDay = isKid ? 43 : 100;
    var streakThreshold = isKid ? 25 : 30;
    var xpDelta = wasChecked ? -habit.xp : habit.xp;
    if (!wasChecked && currentData.doubleXpToday) xpDelta = habit.xp * 2;

    var newHistory = Object.assign({}, currentData.history);
    newHistory[TODAY] = newChecked;
    var todayXp = 0;
    habits.forEach(function(h) { if (newChecked[h.id]) todayXp += h.xp; });
    var isCompletedDay = todayXp >= streakThreshold;

    var streak = currentData.streak;
    var lastDate = currentData.lastDate;
    if (isCompletedDay && lastDate !== TODAY) {
      var yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      streak = lastDate === yesterday ? streak + 1 : 1;
      lastDate = TODAY;
    }

    var gemsEarned = 0;
    var prevDayData = currentData.history ? currentData.history[TODAY] : null;
    var prevTodayXp = 0;
    if (prevDayData) habits.forEach(function(h) { if (prevDayData[h.id]) prevTodayXp += h.xp; });
    var wasDayComplete = prevTodayXp >= streakThreshold;
    if (isCompletedDay && !wasDayComplete) gemsEarned = 5;

    var totalDays = isCompletedDay ? (currentData.totalDays + (wasDayComplete ? 0 : 1)) : currentData.totalDays;
    var perfectDays = todayXp >= maxXpDay ? (currentData.perfectDays + (prevTodayXp >= maxXpDay ? 0 : 1)) : currentData.perfectDays;
    var stickersEarned = (isKid && isCompletedDay && !wasDayComplete) ? 1 : 0;

    var sleepDone = habits.filter(function(h) { return h.cat === "sleep"; }).some(function(h) { return newChecked[h.id]; });
    var readDone = habits.some(function(h) { return h.id.indexOf("read") >= 0 && newChecked[h.id]; });
    var sugarDone = habits.some(function(h) { return (h.id.indexOf("sugar") >= 0 || h.id.indexOf("no_sugar") >= 0) && newChecked[h.id]; });
    var exerciseDone = habits.filter(function(h) { return h.cat === "move"; }).some(function(h) { return newChecked[h.id]; });

    var updated = Object.assign({}, currentData, {
      totalXp: Math.max(0, currentData.totalXp + xpDelta),
      gems: currentData.gems + gemsEarned,
      stickers: (currentData.stickers || 0) + stickersEarned,
      streak: streak, maxStreak: Math.max(streak, currentData.maxStreak || 0),
      totalDays: totalDays, perfectDays: perfectDays, lastDate: lastDate, history: newHistory,
      sleepStreak: sleepDone ? (currentData.sleepStreak || 0) + 1 : 0,
      readStreak: readDone ? (currentData.readStreak || 0) + 1 : 0,
      sugarFreeStreak: sugarDone ? (currentData.sugarFreeStreak || 0) + 1 : 0,
      exerciseStreak: exerciseDone ? (currentData.exerciseStreak || 0) + 1 : 0,
    });

    var newAchs = (currentData.achievements || []).slice();
    var justEarned = null;
    ACHIEVEMENTS.forEach(function(ach) {
      if (newAchs.indexOf(ach.id) < 0 && ach.condition(updated)) { newAchs.push(ach.id); justEarned = ach; }
    });
    updated.achievements = newAchs;

    if (!wasChecked) {
      setAnimatingHabit(habitId); setShowXpFor(habitId);
      setTimeout(function() { setAnimatingHabit(null); setShowXpFor(null); }, 800);
    }
    var oldLevel = getLevel(currentData.totalXp);
    var newLevel = getLevel(updated.totalXp);
    if (newLevel.minXp > oldLevel.minXp && !wasChecked) {
      setTimeout(function() { setCelebrationMsg("🎉 Lên cấp: " + newLevel.icon + " " + newLevel.name + "!"); setShowCelebration(true); setTimeout(function() { setShowCelebration(false); }, 3000); }, 500);
    }
    if (justEarned) { setTimeout(function() { setNewAchievement(justEarned); setTimeout(function() { setNewAchievement(null); }, 3000); }, 800); }
    if (isCompletedDay && !wasDayComplete && !wasChecked) {
      setTimeout(function() { setCelebrationMsg(isKid ? "🎊 Hoàn thành! +5💎 +1⭐" : "🎊 Hoàn thành mục tiêu ngày! +5💎"); setShowCelebration(true); setTimeout(function() { setShowCelebration(false); }, 3000); }, 300);
    }

    var newData = Object.assign({}, data); newData[currentProfile] = updated;
    setData(newData);
    await saveDataFn(currentProfile, updated);
  }, [currentProfile, checkedToday, data, saveDataFn, habits, isKid]);

  var updateTimeEntry = useCallback(async function(catId, delta) {
    if (!currentProfile) return;
    var newEntries = Object.assign({}, timeEntries);
    newEntries[catId] = Math.max(0, (timeEntries[catId] || 0) + delta);
    setTimeEntries(newEntries);
    var currentData = data[currentProfile] || getDefaultData();
    var newTimeLog = Object.assign({}, currentData.timeLog);
    newTimeLog[TODAY] = newEntries;
    var updated = Object.assign({}, currentData, { timeLog: newTimeLog });
    var newData = Object.assign({}, data); newData[currentProfile] = updated;
    setData(newData);
    await saveDataFn(currentProfile, updated);
  }, [currentProfile, timeEntries, data, saveDataFn]);

  var saveFreedomScoreFn = useCallback(async function(score) {
    if (!currentProfile) return;
    setFreedomScore(score);
    var currentData = data[currentProfile] || getDefaultData();
    var newFS = Object.assign({}, currentData.freedomScore);
    newFS[TODAY] = score;
    var updated = Object.assign({}, currentData, { freedomScore: newFS });
    var newData = Object.assign({}, data); newData[currentProfile] = updated;
    setData(newData);
    await saveDataFn(currentProfile, updated);
  }, [currentProfile, data, saveDataFn]);

  var redeemTreasure = useCallback(async function(treasure) {
    if (!currentProfile) return;
    var curr = data[currentProfile] || getDefaultData();
    if ((curr.stickers || 0) < treasure.stickers) return;
    var updated = Object.assign({}, curr, { stickers: curr.stickers - treasure.stickers });
    var newData = Object.assign({}, data); newData[currentProfile] = updated;
    setData(newData);
    await saveDataFn(currentProfile, updated);
    setCelebrationMsg("🎁 Đã đổi: " + treasure.icon + " " + treasure.name + "!");
    setShowCelebration(true);
    setTimeout(function() { setShowCelebration(false); }, 3000);
  }, [currentProfile, data, saveDataFn]);

  var buyItem = useCallback(async function(item) {
    if (!currentProfile) return;
    var curr = data[currentProfile] || getDefaultData();
    if (curr.gems < item.cost) return;
    var inv = (curr.inventory || []).slice(); inv.push(item.id);
    var updated = Object.assign({}, curr, { gems: curr.gems - item.cost, inventory: inv, doubleXpToday: item.id === "double_xp" ? true : curr.doubleXpToday });
    var newData = Object.assign({}, data); newData[currentProfile] = updated;
    setData(newData);
    await saveDataFn(currentProfile, updated);
  }, [currentProfile, data, saveDataFn]);

  if (!loaded) {
    return React.createElement("div", { style: S.loadingScreen },
      React.createElement("style", null, globalCSS),
      React.createElement("div", { style: { fontSize: 60, animation: "bounce 1s infinite" } }, "🌟"),
      React.createElement("div", { style: { marginTop: 16, fontSize: 18, color: "#666" } }, "Đang tải...")
    );
  }

  // PROFILE SELECT
  if (!currentProfile) {
    var sorted = Object.entries(PROFILES).sort(function(a, b) { return (data[b[0]] ? data[b[0]].totalXp : 0) - (data[a[0]] ? data[a[0]].totalXp : 0); });
    var medals = ["🥇", "🥈", "🥉"];
    return React.createElement("div", { style: S.profileScreen },
      React.createElement("style", null, globalCSS),
      React.createElement("div", { style: S.profileTitle },
        React.createElement("div", { style: { fontSize: 48, marginBottom: 8 } }, "🏠"),
        React.createElement("h1", { style: { margin: 0, fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #FF6B6B, #6C63FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } }, "Life Blueprint Tracker"),
        React.createElement("p", { style: { margin: "8px 0 0", color: "#888", fontSize: 13 } }, "Su Family Quest 2026")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 } },
        Object.entries(PROFILES).map(function(entry) {
          var pid = entry[0], p = entry[1];
          var pd2 = data[pid] || getDefaultData();
          var lvl = getLevel(pd2.totalXp);
          return React.createElement("button", { key: pid, onClick: function() { setCurrentProfile(pid); setView("today"); }, style: Object.assign({}, S.profileCard, { background: "linear-gradient(135deg, " + p.themeLight + ", white)", borderColor: p.theme }) },
            React.createElement("div", { style: { fontSize: 40, marginBottom: 2 } }, p.avatar),
            React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: "#333" } }, p.name),
            React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 4 } }, p.role),
            React.createElement("div", { style: { fontSize: 11 } }, lvl.icon + " " + lvl.name),
            React.createElement("div", { style: { fontSize: 11, color: p.theme, fontWeight: 700 } }, (pd2.totalXp || 0) + " XP | 🔥" + (pd2.streak || 0))
          );
        })
      ),
      React.createElement("div", { style: S.familyBoard },
        React.createElement("h3", { style: { margin: "0 0 8px", fontSize: 14, color: "#666" } }, "🏆 Bảng xếp hạng gia đình"),
        sorted.map(function(entry, i) {
          var pid = entry[0], p = entry[1];
          return React.createElement("div", { key: pid, style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 } },
            React.createElement("span", { style: { fontWeight: 800 } }, medals[i] || ""),
            React.createElement("span", null, p.avatar + " " + p.name),
            React.createElement("span", { style: { marginLeft: "auto", fontWeight: 700, color: p.theme } }, (data[pid] ? data[pid].totalXp : 0) + " XP"),
            React.createElement("span", { style: { color: "#999", fontSize: 12 } }, "🔥" + (data[pid] ? data[pid].streak : 0))
          );
        })
      )
    );
  }

  // MAIN VIEW
  var profile = PROFILES[currentProfile];
  var playerData = pd || getDefaultData();
  var level = getLevel(playerData.totalXp);
  var nextLevel = getNextLevel(playerData.totalXp);
  var phase = getCurrentPhase();
  var streakThreshold = isKid ? 25 : 30;
  var maxXpDay = isKid ? 43 : 100;
  var todayXp = 0;
  habits.forEach(function(h) { if (checkedToday[h.id]) todayXp += h.xp; });
  var todayPct = Math.min(100, (todayXp / streakThreshold) * 100);
  var levelPct = nextLevel ? ((playerData.totalXp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100 : 100;
  var totalPo = 0;
  Object.values(timeEntries).forEach(function(v) { totalPo += v; });

  var kidTabs = [
    { id: "today", icon: "📋", label: "Hôm nay" },
    { id: "stats", icon: "📊", label: "Thống kê" },
    { id: "achievements", icon: "🏅", label: "Huy chương" },
    { id: "treasure", icon: "🎁", label: "Phần thưởng" },
    { id: "shop", icon: "🏪", label: "Shop" },
  ];
  var adultTabs = [
    { id: "today", icon: "📋", label: "Hành vi" },
    { id: "time", icon: "⏱️", label: "Thời gian" },
    { id: "stats", icon: "📊", label: "Thống kê" },
    { id: "achievements", icon: "🏅", label: "Huy chương" },
  ];
  var tabs = isKid ? kidTabs : adultTabs;

  var content = [];

  // TODAY/HABITS
  if (view === "today") {
    // Target card
    content.push(React.createElement("div", { key: "target", style: Object.assign({}, S.card, { background: todayPct >= 100 ? "linear-gradient(135deg, #4ECB71, #2ECC71)" : "white" }) },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: todayPct >= 100 ? "white" : "#333" } }, todayPct >= 100 ? "✅ Hoàn thành!" : "🎯 Mục tiêu hôm nay"),
          React.createElement("div", { style: { fontSize: 11, color: todayPct >= 100 ? "rgba(255,255,255,0.8)" : "#888" } }, isKid ? "GĐ" + phase.id + ": " + phase.name : "Tối thiểu ≥" + streakThreshold + "đ | Tốt ≥42đ")
        ),
        React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: todayPct >= 100 ? "white" : profile.theme } }, todayXp + "/" + streakThreshold)
      ),
      React.createElement("div", { style: Object.assign({}, S.progressBar, { height: 8, background: todayPct >= 100 ? "rgba(255,255,255,0.3)" : "#EEE" }) },
        React.createElement("div", { style: Object.assign({}, S.progressFill, { height: 8, width: Math.min(100, todayPct) + "%", background: todayPct >= 100 ? "white" : "linear-gradient(90deg, " + profile.theme + ", #FFD700)", transition: "width 0.5s ease" }) })
      )
    ));

    // Habit categories
    Object.entries(categories).forEach(function(catEntry) {
      var catId = catEntry[0], cat = catEntry[1];
      var catHabits = habits.filter(function(h) { return h.cat === catId; });
      var catXp = 0;
      catHabits.forEach(function(h) { if (checkedToday[h.id]) catXp += h.xp; });
      var isFocus = isKid && phase.focus.indexOf(catId) >= 0;

      var rows = catHabits.map(function(habit) {
        var checked = !!checkedToday[habit.id];
        var isAnim = animatingHabit === habit.id;
        var showXp = showXpFor === habit.id;
        var desc = habit["desc_" + currentProfile] || habit.desc || "";
        return React.createElement("button", { key: habit.id, onClick: function() { toggleHabit(habit.id); }, style: Object.assign({}, S.habitRow, { background: checked ? cat.color + "12" : "white", borderColor: checked ? cat.color + "40" : "#EEE", transform: isAnim ? "scale(1.02)" : "scale(1)", transition: "all 0.2s ease", position: "relative", overflow: "visible" }) },
          React.createElement(ParticleBurst, { active: isAnim, color: cat.color }),
          React.createElement(XpPopup, { xp: playerData.doubleXpToday ? habit.xp * 2 : habit.xp, show: showXp }),
          React.createElement("div", { style: Object.assign({}, S.checkbox, { background: checked ? cat.color : "white", borderColor: checked ? cat.color : "#DDD", transform: isAnim ? "scale(1.2)" : "scale(1)" }) }, checked ? React.createElement("span", { style: { color: "white", fontSize: 13, fontWeight: 800 } }, "✓") : null),
          React.createElement("span", { style: { fontSize: 18 } }, habit.emoji),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { fontWeight: 600, fontSize: 13, color: checked ? cat.color : "#333" } }, habit.label),
            desc ? React.createElement("div", { style: { fontSize: 10, color: "#999" } }, desc) : null
          ),
          React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: checked ? cat.color : "#CCC", background: checked ? cat.color + "15" : "#F5F5F5", padding: "2px 7px", borderRadius: 10 } }, "+" + habit.xp)
        );
      });

      content.push(React.createElement("div", { key: catId, style: { marginBottom: 10 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, marginBottom: 5, padding: "0 2px" } },
          React.createElement("span", { style: { fontSize: 14 } }, cat.icon),
          React.createElement("span", { style: { fontWeight: 700, fontSize: 13, color: cat.color } }, cat.name),
          React.createElement("span", { style: { fontSize: 10, color: "#999", marginLeft: 3 } }, catXp),
          isFocus ? React.createElement("span", { style: { fontSize: 9, background: cat.color + "20", color: cat.color, padding: "1px 5px", borderRadius: 8, fontWeight: 700, marginLeft: "auto" } }, "Focus") : null
        ),
        rows
      ));
    });

    // Freedom Score (Truong)
    if (!isKid) {
      var scoreButtons = [];
      for (var si = 0; si < 10; si++) {
        (function(idx) {
          scoreButtons.push(React.createElement("button", { key: idx, onClick: function() { saveFreedomScoreFn(idx + 1); }, style: { width: 30, height: 30, borderRadius: 8, border: freedomScore === idx + 1 ? "2px solid " + profile.theme : "2px solid #EEE", background: freedomScore >= idx + 1 ? profile.theme + (freedomScore === idx + 1 ? "" : "30") : "white", color: freedomScore === idx + 1 ? "white" : "#666", fontWeight: 700, fontSize: 12, cursor: "pointer" } }, idx + 1));
        })(si);
      }
      content.push(React.createElement("div", { key: "freedom", style: S.card },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 6 } }, "🧭 Điểm Tự Do"),
        React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 8 } }, "Hôm nay tôi sống từ sự lựa chọn hay từ phản ứng?"),
        React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "center" } }, scoreButtons)
      ));
    }
  }

  // TIME TRACKER
  if (view === "time" && !isKid) {
    content.push(React.createElement("div", { key: "time-header", style: S.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, "⏱️ Pomodoro hôm nay"),
        React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: profile.theme } }, totalPo + " po = " + (totalPo * 0.5).toFixed(1) + "h")
      )
    ));

    TIME_CATS.forEach(function(cat) {
      var val = timeEntries[cat.id] || 0;
      content.push(React.createElement("div", { key: "tc-" + cat.id, style: Object.assign({}, S.habitRow, { background: val > 0 ? cat.color + "10" : "white", borderColor: val > 0 ? cat.color + "30" : "#EEE" }) },
        React.createElement("span", { style: { fontSize: 18, width: 28, textAlign: "center" } }, cat.icon),
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("div", { style: { fontWeight: 600, fontSize: 13, color: val > 0 ? cat.color : "#333" } }, cat.name),
          val > 0 ? React.createElement("div", { style: { fontSize: 10, color: "#999" } }, (val * 0.5).toFixed(1) + "h") : null
        ),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
          React.createElement("button", { onClick: function() { updateTimeEntry(cat.id, -1); }, style: Object.assign({}, S.poBtn, { opacity: val > 0 ? 1 : 0.3 }) }, "−"),
          React.createElement("span", { style: { fontWeight: 800, fontSize: 16, color: cat.color, minWidth: 24, textAlign: "center" } }, val),
          React.createElement("button", { onClick: function() { updateTimeEntry(cat.id, 1); }, style: Object.assign({}, S.poBtn, { background: cat.color, color: "white" }) }, "+")
        )
      ));
    });

    if (totalPo > 0) {
      var bars = TIME_CATS.filter(function(c) { return (timeEntries[c.id] || 0) > 0; }).sort(function(a, b) { return (timeEntries[b.id] || 0) - (timeEntries[a.id] || 0); }).map(function(cat) {
        var val = timeEntries[cat.id] || 0;
        var pct = (val / totalPo) * 100;
        return React.createElement("div", { key: "bar-" + cat.id, style: { marginBottom: 6 } },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 } },
            React.createElement("span", null, cat.icon + " " + cat.name),
            React.createElement("span", { style: { fontWeight: 700, color: cat.color } }, val + "po (" + pct.toFixed(0) + "%)")
          ),
          React.createElement("div", { style: Object.assign({}, S.progressBar, { height: 6 }) },
            React.createElement("div", { style: Object.assign({}, S.progressFill, { height: 6, width: pct + "%", background: cat.color }) })
          )
        );
      });
      content.push(React.createElement("div", { key: "time-chart", style: S.card },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "📊 Phân bổ hôm nay"),
        bars
      ));
    }
  }

  // STATS
  if (view === "stats") {
    var lvIdx = LEVELS.indexOf(level);
    content.push(React.createElement("div", { key: "level-card", style: Object.assign({}, S.card, { textAlign: "center" }) },
      React.createElement("div", { style: { fontSize: 44 } }, level.icon),
      React.createElement("div", { style: { fontWeight: 800, fontSize: 20, color: profile.theme } }, "Lv." + (lvIdx + 1) + " " + level.name),
      React.createElement("div", { style: { fontSize: 13, color: "#666" } }, playerData.totalXp + " XP")
    ));
    var statItems = [
      { icon: "🔥", label: "Streak", value: playerData.streak, color: "#FF6B00" },
      { icon: "🏆", label: "Max Streak", value: playerData.maxStreak || 0, color: "#FFD700" },
      { icon: "📅", label: "Ngày đạt", value: playerData.totalDays, color: "#4ECB71" },
      { icon: "💯", label: "Hoàn hảo", value: playerData.perfectDays, color: "#FF69B4" },
      { icon: "💎", label: "Gems", value: playerData.gems, color: "#6C63FF" },
      { icon: "🏅", label: "Huy chương", value: (playerData.achievements || []).length, color: "#FF8C00" },
    ];
    content.push(React.createElement("div", { key: "stat-grid", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } },
      statItems.map(function(s, i) {
        return React.createElement("div", { key: i, style: S.statCard },
          React.createElement("span", { style: { fontSize: 22 } }, s.icon),
          React.createElement("div", { style: { fontSize: 24, fontWeight: 800, color: s.color } }, s.value),
          React.createElement("div", { style: { fontSize: 10, color: "#888" } }, s.label)
        );
      })
    ));
    // 7-day chart
    var dayBars = [];
    var dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    for (var di = 0; di < 7; di++) {
      var d = new Date(Date.now() - (6 - di) * 86400000);
      var key = d.toISOString().split("T")[0];
      var dayData = (playerData.history && playerData.history[key]) ? playerData.history[key] : {};
      var dayXp = 0;
      habits.forEach(function(h) { if (dayData[h.id]) dayXp += h.xp; });
      var pct = Math.min(100, (dayXp / streakThreshold) * 100);
      dayBars.push(React.createElement("div", { key: di, style: { flex: 1, textAlign: "center" } },
        React.createElement("div", { style: { fontSize: 9, color: "#888", marginBottom: 3 } }, dayNames[d.getDay()]),
        React.createElement("div", { style: { height: 44, borderRadius: 5, background: "#F0F0F0", position: "relative", overflow: "hidden" } },
          React.createElement("div", { style: { position: "absolute", bottom: 0, width: "100%", height: pct + "%", background: pct >= 100 ? profile.theme : profile.theme + "60", borderRadius: 5 } })
        ),
        React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: pct >= 100 ? profile.theme : "#999", marginTop: 2 } }, dayXp)
      ));
    }
    content.push(React.createElement("div", { key: "7day", style: S.card },
      React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "📆 7 ngày gần nhất"),
      React.createElement("div", { style: { display: "flex", gap: 3, justifyContent: "space-between" } }, dayBars)
    ));
  }

  // ACHIEVEMENTS
  if (view === "achievements") {
    content.push(React.createElement("div", { key: "ach-grid", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } },
      ACHIEVEMENTS.map(function(ach) {
        var earned = (playerData.achievements || []).indexOf(ach.id) >= 0;
        return React.createElement("div", { key: ach.id, style: Object.assign({}, S.achCard, { opacity: earned ? 1 : 0.4, background: earned ? "white" : "#F5F5F5", border: earned ? "2px solid " + profile.theme + "40" : "2px solid #EEE" }) },
          React.createElement("div", { style: { fontSize: 28 } }, earned ? ach.icon : "🔒"),
          React.createElement("div", { style: { fontWeight: 700, fontSize: 12 } }, ach.name),
          React.createElement("div", { style: { fontSize: 10, color: "#888" } }, ach.desc),
          earned ? React.createElement("div", { style: { fontSize: 9, color: profile.theme, fontWeight: 700, marginTop: 3 } }, "Đã đạt ✓") : null
        );
      })
    ));
  }

  // TREASURE
  if (view === "treasure" && isKid) {
    content.push(React.createElement("div", { key: "tr-header", style: { textAlign: "center", marginBottom: 14 } },
      React.createElement("div", { style: { fontSize: 36 } }, "⭐"),
      React.createElement("div", { style: { fontSize: 26, fontWeight: 800, color: "#FFD700" } }, playerData.stickers || 0),
      React.createElement("div", { style: { fontSize: 12, color: "#888" } }, "Sticker hiện có"),
      React.createElement("div", { style: { fontSize: 10, color: "#AAA", marginTop: 4 } }, "Kiếm 1⭐ mỗi ngày đạt mục tiêu")
    ));
    TREASURES.forEach(function(t) {
      var canRedeem = (playerData.stickers || 0) >= t.stickers;
      content.push(React.createElement("div", { key: "tr-" + t.id, style: Object.assign({}, S.shopItem, { opacity: canRedeem ? 1 : 0.5 }) },
        React.createElement("span", { style: { fontSize: 30 } }, t.icon),
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, t.name),
          React.createElement("div", { style: { fontSize: 11, color: "#888" } }, "Cần " + t.stickers + "⭐")
        ),
        React.createElement("button", { onClick: function() { if (canRedeem) redeemTreasure(t); }, style: Object.assign({}, S.buyBtn, { background: canRedeem ? "#FFD700" : "#EEE", color: canRedeem ? "white" : "#999", cursor: canRedeem ? "pointer" : "default" }) }, "Đổi ⭐" + t.stickers)
      ));
    });
  }

  // SHOP
  if (view === "shop") {
    content.push(React.createElement("div", { key: "shop-header", style: { textAlign: "center", marginBottom: 14 } },
      React.createElement("div", { style: { fontSize: 34 } }, "💎"),
      React.createElement("div", { style: { fontSize: 26, fontWeight: 800, color: "#6C63FF" } }, playerData.gems),
      React.createElement("div", { style: { fontSize: 12, color: "#888" } }, "Gems hiện có")
    ));
    SHOP_ITEMS.forEach(function(item) {
      var canAfford = playerData.gems >= item.cost;
      content.push(React.createElement("div", { key: "sh-" + item.id, style: Object.assign({}, S.shopItem, { opacity: canAfford ? 1 : 0.5 }) },
        React.createElement("span", { style: { fontSize: 28 } }, item.icon),
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, item.name),
          React.createElement("div", { style: { fontSize: 11, color: "#888" } }, item.desc)
        ),
        React.createElement("button", { onClick: function() { if (canAfford) buyItem(item); }, style: Object.assign({}, S.buyBtn, { background: canAfford ? profile.theme : "#EEE", color: canAfford ? "white" : "#999", cursor: canAfford ? "pointer" : "default" }) }, "💎" + item.cost)
      ));
    });
  }

  return React.createElement("div", { style: Object.assign({}, S.app, { background: profile.themeLight }) },
    React.createElement("style", null, globalCSS),
    showCelebration ? React.createElement("div", { style: S.celebrationOverlay }, React.createElement("div", { style: S.celebrationCard }, React.createElement("div", { style: { fontSize: 48 } }, "🎉"), React.createElement("div", { style: { fontSize: 18, fontWeight: 800, marginTop: 8 } }, celebrationMsg))) : null,
    newAchievement ? React.createElement("div", { style: S.achievementPopup }, React.createElement("div", { style: { fontSize: 36 } }, newAchievement.icon), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 13 } }, "Huy chương mới!"), React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, newAchievement.name))) : null,
    // Top bar
    React.createElement("div", { style: Object.assign({}, S.topBar, { borderBottomColor: profile.theme + "30" }) },
      React.createElement("button", { onClick: function() { setCurrentProfile(null); }, style: S.backBtn }, "←"),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
        React.createElement("span", { style: { fontSize: 22 } }, profile.avatar),
        React.createElement("div", null,
          React.createElement("div", { style: { fontWeight: 800, fontSize: 14, color: "#333" } }, profile.name),
          React.createElement("div", { style: { fontSize: 10, color: "#888" } }, level.icon + " Lv." + (LEVELS.indexOf(level) + 1) + " " + level.name)
        )
      ),
      React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", fontSize: 12 } },
        React.createElement("span", null, "🔥", React.createElement("b", { style: { color: playerData.streak > 0 ? "#FF6B00" : "#CCC" } }, playerData.streak)),
        React.createElement("span", null, "💎", React.createElement("b", { style: { color: "#6C63FF" } }, playerData.gems)),
        isKid ? React.createElement("span", null, "⭐", React.createElement("b", { style: { color: "#FFD700" } }, playerData.stickers || 0)) : null
      )
    ),
    // Level bar
    React.createElement("div", { style: { padding: "0 16px 6px" } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", marginBottom: 2 } },
        React.createElement("span", null, "Lv." + (LEVELS.indexOf(level) + 1)),
        React.createElement("span", null, nextLevel ? playerData.totalXp + "/" + nextLevel.minXp : "MAX")
      ),
      React.createElement("div", { style: S.progressBar }, React.createElement("div", { style: Object.assign({}, S.progressFill, { width: levelPct + "%", background: "linear-gradient(90deg, " + profile.theme + ", " + profile.theme + "CC)" }) }))
    ),
    // Nav
    React.createElement("div", { style: S.navTabs },
      tabs.map(function(tab) {
        return React.createElement("button", { key: tab.id, onClick: function() { setView(tab.id); }, style: Object.assign({}, S.navTab, { color: view === tab.id ? profile.theme : "#999", borderBottomColor: view === tab.id ? profile.theme : "transparent", fontWeight: view === tab.id ? 700 : 500 }) },
          React.createElement("span", { style: { fontSize: 16 } }, tab.icon),
          React.createElement("span", { style: { fontSize: 10 } }, tab.label)
        );
      })
    ),
    React.createElement("div", { style: S.content }, content)
  );
}

var S = {
  app: { maxWidth: 420, margin: "0 auto", minHeight: "100vh", fontFamily: "'Nunito', 'Segoe UI', sans-serif", position: "relative" },
  loadingScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Nunito', 'Segoe UI', sans-serif" },
  profileScreen: { maxWidth: 420, margin: "0 auto", minHeight: "100vh", padding: 20, background: "linear-gradient(180deg, #FFF5F5, #F0F0FF, #F0FFF0)", fontFamily: "'Nunito', 'Segoe UI', sans-serif" },
  profileTitle: { textAlign: "center", marginBottom: 20 },
  profileCard: { border: "2px solid", borderRadius: 16, padding: "14px 6px", cursor: "pointer", textAlign: "center", background: "white", transition: "transform 0.2s", outline: "none" },
  familyBoard: { background: "white", borderRadius: 14, padding: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderBottom: "2px solid", position: "sticky", top: 0, zIndex: 50 },
  backBtn: { width: 32, height: 32, borderRadius: 10, border: "2px solid #EEE", background: "white", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  navTabs: { display: "flex", borderBottom: "2px solid #EEE", background: "white" },
  navTab: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "6px 2px", border: "none", borderBottom: "3px solid transparent", background: "none", cursor: "pointer", transition: "all 0.2s" },
  content: { padding: "10px 14px 80px" },
  card: { background: "white", borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #F0F0F0" },
  progressBar: { height: 5, borderRadius: 10, background: "#EEE", overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 10, transition: "width 0.4s ease" },
  habitRow: { display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 12, border: "2px solid", marginBottom: 5, cursor: "pointer", width: "100%", textAlign: "left", outline: "none", position: "relative" },
  checkbox: { width: 24, height: 24, borderRadius: 7, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 },
  statCard: { background: "white", borderRadius: 12, padding: 12, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #F0F0F0" },
  achCard: { borderRadius: 12, padding: 12, textAlign: "center" },
  shopItem: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "white", borderRadius: 12, marginBottom: 7, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #F0F0F0" },
  buyBtn: { border: "none", borderRadius: 9, padding: "7px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" },
  poBtn: { width: 30, height: 30, borderRadius: 8, border: "2px solid #EEE", background: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  celebrationOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, animation: "fadeIn 0.3s ease" },
  celebrationCard: { background: "white", borderRadius: 20, padding: "28px 36px", textAlign: "center", animation: "popIn 0.4s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  achievementPopup: { position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: 14, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, zIndex: 100, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", animation: "slideDown 0.4s ease", border: "2px solid #FFD700" },
};

var globalCSS = "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } body { margin: 0; padding: 0; } button:hover { transform: scale(1.01); } button:active { transform: scale(0.98) !important; } @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } } @keyframes particleBurst { 0% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0); } } @keyframes xpFloat { 0% { opacity: 1; transform: translateX(-50%) translateY(0); } 100% { opacity: 0; transform: translateX(-50%) translateY(-30px); } } @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }";
