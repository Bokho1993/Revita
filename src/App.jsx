import React, { useState, useEffect, useCallback } from "react";
import { loadProfile, saveProfile } from "./firebase";

var KIDS_HABITS = [
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

var ADULT_HABITS = [
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

var KIDS_CATS = { sleep: { name: "Giấc ngủ", color: "#6C63FF", icon: "🌙" }, food: { name: "Dinh dưỡng", color: "#FF6B6B", icon: "🍎" }, move: { name: "Vận động", color: "#4ECB71", icon: "⚡" }, mind: { name: "Tinh thần", color: "#FFB347", icon: "✨" } };
var ADULT_CATS = { food: { name: "Dinh dưỡng", color: "#FF6B6B", icon: "🍎" }, sleep: { name: "Giấc ngủ", color: "#6C63FF", icon: "🌙" }, mind: { name: "Tinh thần", color: "#FFB347", icon: "🧘" }, move: { name: "Vận động", color: "#4ECB71", icon: "💪" }, learn: { name: "Học tập", color: "#3498DB", icon: "📚" } };

var LEVELS = [
  { name: "Mầm non", minXp: 0, icon: "🌱" }, { name: "Hạt giống", minXp: 100, icon: "🫘" },
  { name: "Cây mầm", minXp: 250, icon: "🌿" }, { name: "Nở hoa", minXp: 500, icon: "🌸" },
  { name: "Cây khỏe", minXp: 800, icon: "🌳" }, { name: "Chiến binh", minXp: 1000, icon: "⚔️" },
  { name: "Dũng sĩ", minXp: 1500, icon: "🗡️" }, { name: "Hiệp sĩ", minXp: 2000, icon: "🛡️" },
  { name: "Đội trưởng", minXp: 3000, icon: "🎖️" }, { name: "Anh hùng", minXp: 5000, icon: "🦸" },
  { name: "Siêu sao", minXp: 7000, icon: "⭐" }, { name: "Bậc thầy", minXp: 9000, icon: "🎓" },
  { name: "Đại sư", minXp: 11000, icon: "🥋" }, { name: "Chiến thần", minXp: 13000, icon: "🔱" },
  { name: "Huyền thoại", minXp: 15000, icon: "👑" }, { name: "Thần thoại", minXp: 20000, icon: "🔥" },
  { name: "Bất tử", minXp: 25000, icon: "💎" }, { name: "Thiên thần", minXp: 30000, icon: "😇" },
  { name: "Thượng đế", minXp: 35000, icon: "🌟" }, { name: "Vũ trụ", minXp: 40000, icon: "🌌" },
];

var PHASES = [
  { id: 1, name: "Khởi động", months: "T3-T4", target: 25, focus: ["sleep"] },
  { id: 2, name: "Tập luyện", months: "T5-T7", target: 30, focus: ["sleep", "food"] },
  { id: 3, name: "Chuyển giao", months: "T8-T10", target: 35, focus: ["sleep", "food", "move"] },
  { id: 4, name: "Tự chủ", months: "T11-T12", target: 35, focus: ["sleep", "food", "move", "mind"] },
];

var PROFILES = {
  truong: { name: "Ba Trường", avatar: "🦁", theme: "#2C3E50", themeLight: "#F0F3F5", role: "Thủ lĩnh gia đình", isKid: false },
  maichi: { name: "Mẹ Mai Chi", avatar: "🌷", theme: "#E91E63", themeLight: "#FCE4EC", role: "Nữ tướng gia đình", isKid: false },
  bong: { name: "Bông", avatar: "🌸", theme: "#FF69B4", themeLight: "#FFF0F5", role: "Nữ chiến binh hoa", isKid: true },
  beo: { name: "Beo", avatar: "🐯", theme: "#FF8C00", themeLight: "#FFF8F0", role: "Chiến binh hổ", isKid: true },
};

var ACHIEVEMENTS = [
  { id: "first_day", name: "Ngày đầu tiên", icon: "🎯", desc: "Hoàn thành ngày đầu", cond: function(s){return s.totalDays>=1;} },
  { id: "streak_7", name: "7 ngày lửa", icon: "🔥", desc: "Streak 7 ngày", cond: function(s){return s.streak>=7;} },
  { id: "streak_30", name: "30 ngày bền bỉ", icon: "☄️", desc: "Streak 30 ngày", cond: function(s){return s.streak>=30;} },
  { id: "streak_100", name: "100 ngày huyền thoại", icon: "💫", desc: "Streak 100 ngày", cond: function(s){return s.streak>=100;} },
  { id: "perfect_day", name: "Ngày hoàn hảo", icon: "💯", desc: "Full điểm", cond: function(s){return s.perfectDays>=1;} },
  { id: "xp_500", name: "500 XP", icon: "🌟", desc: "Tích lũy 500 XP", cond: function(s){return s.totalXp>=500;} },
  { id: "xp_1000", name: "1000 XP", icon: "⭐", desc: "Tích lũy 1000 XP", cond: function(s){return s.totalXp>=1000;} },
  { id: "xp_5000", name: "5000 XP", icon: "🏆", desc: "Tích lũy 5000 XP", cond: function(s){return s.totalXp>=5000;} },
  { id: "bookworm", name: "Mọt sách", icon: "📚", desc: "Đọc sách 14 ngày", cond: function(s){return s.readStreak>=14;} },
  { id: "sugar_free_7", name: "Không đường 7 ngày", icon: "🍃", desc: "7 ngày liên tiếp", cond: function(s){return s.sugarFreeStreak>=7;} },
  { id: "sleep_master", name: "Vua giấc ngủ", icon: "😴", desc: "Ngủ đủ 14 ngày", cond: function(s){return s.sleepStreak>=14;} },
  { id: "exercise_hero", name: "Vận động viên", icon: "🏅", desc: "14 ngày liên tiếp", cond: function(s){return s.exerciseStreak>=14;} },
];

var TREASURES = [
  { id: "ice_cream", name: "Kem đặc biệt", icon: "🍦", stickers: 3 },
  { id: "choose_book", name: "Chọn truyện mới", icon: "📖", stickers: 5 },
  { id: "choose_food", name: "Chọn món ăn tối", icon: "🍕", stickers: 5 },
  { id: "movie_night", name: "Tối xem phim", icon: "🎬", stickers: 8 },
  { id: "park_trip", name: "Đi công viên", icon: "🎡", stickers: 10 },
  { id: "toy_small", name: "Đồ chơi nhỏ", icon: "🎁", stickers: 15 },
];

var TIME_CATS = [
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

var GOALS = [
  { id: "g1", name: "Sức khỏe tuyệt vời", icon: "❤️", target: 100, unit: "%", step: 1, color: "#E74C3C", desc: "Chỉ số tốt hơn 10% so với mức chuẩn" },
  { id: "g2", name: "2,000km đạp xe", icon: "🚴", target: 2000, unit: "km", step: 1, color: "#27AE60", desc: "Hoàn thành chặng đua lũy kế cả năm" },
  { id: "g3", name: "2 Chứng chỉ CSSK quốc tế", icon: "🎓", target: 2, unit: "CC", step: 1, color: "#F39C12", desc: "Chứng chỉ uy tín quốc tế" },
  { id: "g4", name: "Con trưởng thành chủ động", icon: "👧", target: 2.0, unit: "hành vi/ngày", step: 0.1, color: "#FF69B4", desc: "≥2 hành vi chủ động/ngày không cần nhắc" },
  { id: "g5", name: "3 chuyên gia CSSK hàng đầu", icon: "🤝", target: 3, unit: "người", step: 1, color: "#9B59B6", desc: "Mối quan hệ chất lượng" },
  { id: "g6", name: "Hướng đi CSSK chủ động", icon: "🧭", target: 100, unit: "%", step: 5, color: "#3498DB", desc: "Quyết định rõ ràng hết tháng 7" },
  { id: "g7", name: "Tài sản +5 tỷ", icon: "💰", target: 5000, unit: "triệu", step: 100, color: "#F1C40F", desc: "Tăng trưởng hướng đến tự do tài chính" },
  { id: "g8", name: "ILP đột phá 300 đăng ký", icon: "⭐", target: 300, unit: "người", step: 1, color: "#E67E22", desc: "Chương trình ILP tuyệt vời" },
  { id: "g9", name: "Di sản Long Hiền — CĐS", icon: "🏢", target: 100, unit: "%", step: 5, color: "#2C3E50", desc: "Chuyển đổi số thành công 100%" },
  { id: "g10", name: "Xuyên Việt gia đình", icon: "🏍️", target: 100, unit: "%", step: 10, color: "#1ABC9C", desc: "Cả gia đình tự do kết nối" },
];

var REVIEW_QUESTIONS = [
  { id: "rq1", label: "Km đạp xe tuần này?", type: "number", unit: "km", icon: "🚴" },
  { id: "rq2", label: "Giờ CSSK tuần này?", type: "number", unit: "giờ", icon: "🎓" },
  { id: "rq3", label: "Thói quen con: TB/ngày?", type: "number", unit: "điểm", icon: "👧" },
  { id: "rq4", label: "10 mục tiêu: tiến / đứng yên?", type: "text", icon: "🎯" },
  { id: "rq5", label: "Tuần tới, 1 việc quan trọng nhất?", type: "text", icon: "⭐" },
  { id: "rq6", label: "Điểm tự do TB tuần?", type: "number", unit: "/10", icon: "🧭" },
  { id: "rq7", label: "Lĩnh vực lệch nhiều nhất so kế hoạch?", type: "text", icon: "⏱️" },
];

var SHOP_ITEMS = [
  { id: "streak_freeze", name: "Đóng băng Streak", icon: "❄️", cost: 50, desc: "Bảo vệ streak 1 ngày" },
  { id: "double_xp", name: "Nhân đôi XP", icon: "⚡", cost: 100, desc: "x2 XP trong 1 ngày" },
];

var TODAY = new Date().toISOString().split("T")[0];
function getWeekId(){var d=new Date();var jan1=new Date(d.getFullYear(),0,1);var days=Math.floor((d-jan1)/86400000);return d.getFullYear()+"-W"+Math.ceil((days+jan1.getDay()+1)/7);}
function getMonthId(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1);}
function getLevel(xp){var l=LEVELS[0];for(var i=0;i<LEVELS.length;i++){if(xp>=LEVELS[i].minXp)l=LEVELS[i];}return l;}
function getNextLevel(xp){for(var i=0;i<LEVELS.length;i++){if(xp<LEVELS[i].minXp)return LEVELS[i];}return null;}
function getCurrentPhase(){var m=new Date().getMonth()+1;if(m<=4)return PHASES[0];if(m<=7)return PHASES[1];if(m<=10)return PHASES[2];return PHASES[3];}
function getDefault(){return{totalXp:0,gems:10,streak:0,maxStreak:0,totalDays:0,perfectDays:0,sleepStreak:0,readStreak:0,sugarFreeStreak:0,exerciseStreak:0,stickers:0,lastDate:null,history:{},achievements:[],inventory:[],doubleXpToday:false,timeLog:{},freedomScore:{},goals:{},reviews:{}};}

export default function App(){
  var _p=useState(null),curP=_p[0],setCurP=_p[1];
  var _d=useState({}),data=_d[0],setData=_d[1];
  var _v=useState("today"),view=_v[0],setView=_v[1];
  var _c=useState({}),checked=_c[0],setChecked=_c[1];
  var _a=useState(null),anim=_a[0],setAnim=_a[1];
  var _x=useState(null),xpFor=_x[0],setXpFor=_x[1];
  var _sc=useState(false),showCeleb=_sc[0],setShowCeleb=_sc[1];
  var _cm=useState(""),celebMsg=_cm[0],setCelebMsg=_cm[1];
  var _na=useState(null),newAch=_na[0],setNewAch=_na[1];
  var _l=useState(false),loaded=_l[0],setLoaded=_l[1];
  var _fs=useState(0),fScore=_fs[0],setFScore=_fs[1];
  var _te=useState({}),timeE=_te[0],setTimeE=_te[1];
  var _rv=useState({}),revData=_rv[0],setRevData=_rv[1];
  var _rt=useState("week"),revType=_rt[0],setRevType=_rt[1];

  useEffect(function(){async function load(){var pids=Object.keys(PROFILES);for(var i=0;i<pids.length;i++){var d=await loadProfile(pids[i]);if(d){var pid=pids[i];setData(function(prev){var n=Object.assign({},prev);n[pid]=d;return n;});}}setLoaded(true);}load();},[]);
  var save=useCallback(async function(pid,nd){await saveProfile(pid,nd);},[]);
  var pd=curP?(data[curP]||getDefault()):null;
  var isKid=curP?PROFILES[curP].isKid:false;
  var habits=isKid?KIDS_HABITS:ADULT_HABITS;
  var cats=isKid?KIDS_CATS:ADULT_CATS;

  useEffect(function(){
    if(pd&&pd.history&&pd.history[TODAY])setChecked(pd.history[TODAY]);else setChecked({});
    if(pd&&pd.timeLog&&pd.timeLog[TODAY])setTimeE(pd.timeLog[TODAY]);else setTimeE({});
    if(pd&&pd.freedomScore&&pd.freedomScore[TODAY])setFScore(pd.freedomScore[TODAY]);else setFScore(0);
    var wk=getWeekId();if(pd&&pd.reviews&&pd.reviews[wk])setRevData(pd.reviews[wk]);else setRevData({});
  },[curP,pd?JSON.stringify(pd.history?pd.history[TODAY]:{}):""])

  var toggleH=useCallback(async function(hid){
    if(!curP)return;var h=habits.find(function(x){return x.id===hid;});
    var was=!!checked[hid];var nc=Object.assign({},checked);nc[hid]=!was;
    if(h.exclusive&&!was)nc[h.exclusive]=false;setChecked(nc);
    var cd=data[curP]||getDefault();var st=isKid?25:30;var mx=isKid?43:100;
    var xd=was?-h.xp:h.xp;if(!was&&cd.doubleXpToday)xd=h.xp*2;
    var nh=Object.assign({},cd.history);nh[TODAY]=nc;
    var tx=0;habits.forEach(function(x){if(nc[x.id])tx+=x.xp;});
    var done=tx>=st;var streak=cd.streak;var ld=cd.lastDate;
    if(done&&ld!==TODAY){var yd=new Date(Date.now()-86400000).toISOString().split("T")[0];streak=ld===yd?streak+1:1;ld=TODAY;}
    var ge=0;var prev=cd.history?cd.history[TODAY]:null;var ptx=0;
    if(prev)habits.forEach(function(x){if(prev[x.id])ptx+=x.xp;});
    var wasDone=ptx>=st;if(done&&!wasDone)ge=5;
    var td=done?(cd.totalDays+(wasDone?0:1)):cd.totalDays;
    var pf=tx>=mx?(cd.perfectDays+(ptx>=mx?0:1)):cd.perfectDays;
    var stk=(isKid&&done&&!wasDone)?1:0;
    var slD=habits.filter(function(x){return x.cat==="sleep";}).some(function(x){return nc[x.id];});
    var rdD=habits.some(function(x){return x.id.indexOf("read")>=0&&nc[x.id];});
    var sgD=habits.some(function(x){return x.id.indexOf("sugar")>=0&&nc[x.id];});
    var exD=habits.filter(function(x){return x.cat==="move";}).some(function(x){return nc[x.id];});
    var up=Object.assign({},cd,{totalXp:Math.max(0,cd.totalXp+xd),gems:cd.gems+ge,stickers:(cd.stickers||0)+stk,streak:streak,maxStreak:Math.max(streak,cd.maxStreak||0),totalDays:td,perfectDays:pf,lastDate:ld,history:nh,sleepStreak:slD?(cd.sleepStreak||0)+1:0,readStreak:rdD?(cd.readStreak||0)+1:0,sugarFreeStreak:sgD?(cd.sugarFreeStreak||0)+1:0,exerciseStreak:exD?(cd.exerciseStreak||0)+1:0});
    var na=(cd.achievements||[]).slice();var je=null;
    ACHIEVEMENTS.forEach(function(a){if(na.indexOf(a.id)<0&&a.cond(up)){na.push(a.id);je=a;}});up.achievements=na;
    if(!was){setAnim(hid);setXpFor(hid);setTimeout(function(){setAnim(null);setXpFor(null);},800);}
    var ol=getLevel(cd.totalXp);var nl=getLevel(up.totalXp);
    if(nl.minXp>ol.minXp&&!was)setTimeout(function(){setCelebMsg("🎉 Lên cấp: "+nl.icon+" "+nl.name+"!");setShowCeleb(true);setTimeout(function(){setShowCeleb(false);},3000);},500);
    if(je)setTimeout(function(){setNewAch(je);setTimeout(function(){setNewAch(null);},3000);},800);
    if(done&&!wasDone&&!was)setTimeout(function(){setCelebMsg(isKid?"🎊 +5💎 +1⭐":"🎊 +5💎");setShowCeleb(true);setTimeout(function(){setShowCeleb(false);},3000);},300);
    var nd=Object.assign({},data);nd[curP]=up;setData(nd);await save(curP,up);
  },[curP,checked,data,save,habits,isKid]);

  var updateTime=useCallback(async function(cid,delta){if(!curP)return;var ne=Object.assign({},timeE);ne[cid]=Math.max(0,(timeE[cid]||0)+delta);setTimeE(ne);var cd=data[curP]||getDefault();var tl=Object.assign({},cd.timeLog);tl[TODAY]=ne;var up=Object.assign({},cd,{timeLog:tl});var nd=Object.assign({},data);nd[curP]=up;setData(nd);await save(curP,up);},[curP,timeE,data,save]);
  var saveFreedom=useCallback(async function(sc){if(!curP)return;setFScore(sc);var cd=data[curP]||getDefault();var fs=Object.assign({},cd.freedomScore);fs[TODAY]=sc;var up=Object.assign({},cd,{freedomScore:fs});var nd=Object.assign({},data);nd[curP]=up;setData(nd);await save(curP,up);},[curP,data,save]);
  var updateGoal=useCallback(async function(gid,val){if(!curP)return;var cd=data[curP]||getDefault();var gs=Object.assign({},cd.goals||{});gs[gid]=val;var up=Object.assign({},cd,{goals:gs});var nd=Object.assign({},data);nd[curP]=up;setData(nd);await save(curP,up);},[curP,data,save]);
  var saveReview=useCallback(async function(qid,val){if(!curP)return;var nr=Object.assign({},revData);nr[qid]=val;setRevData(nr);var cd=data[curP]||getDefault();var rv=Object.assign({},cd.reviews||{});rv[getWeekId()]=nr;var up=Object.assign({},cd,{reviews:rv});var nd=Object.assign({},data);nd[curP]=up;setData(nd);await save(curP,up);},[curP,revData,data,save]);
  var redeemT=useCallback(async function(t){if(!curP)return;var c=data[curP]||getDefault();if((c.stickers||0)<t.stickers)return;var up=Object.assign({},c,{stickers:c.stickers-t.stickers});var nd=Object.assign({},data);nd[curP]=up;setData(nd);await save(curP,up);setCelebMsg("🎁 "+t.icon+" "+t.name+"!");setShowCeleb(true);setTimeout(function(){setShowCeleb(false);},3000);},[curP,data,save]);
  var buyI=useCallback(async function(it){if(!curP)return;var c=data[curP]||getDefault();if(c.gems<it.cost)return;var inv=(c.inventory||[]).slice();inv.push(it.id);var up=Object.assign({},c,{gems:c.gems-it.cost,inventory:inv,doubleXpToday:it.id==="double_xp"?true:c.doubleXpToday});var nd=Object.assign({},data);nd[curP]=up;setData(nd);await save(curP,up);},[curP,data,save]);

  if(!loaded)return React.createElement("div",{style:S.loading},React.createElement("style",null,CSS),React.createElement("div",{style:{fontSize:60,animation:"bounce 1s infinite"}},"🌟"),React.createElement("div",{style:{marginTop:16,fontSize:18,color:"#666"}},"Đang tải..."));

  if(!curP){
    var sorted=Object.entries(PROFILES).sort(function(a,b){return(data[b[0]]?data[b[0]].totalXp:0)-(data[a[0]]?data[a[0]].totalXp:0);});
    var medals=["🥇","🥈","🥉","4️⃣"];
    return React.createElement("div",{style:S.ps},React.createElement("style",null,CSS),
      React.createElement("div",{style:{textAlign:"center",marginBottom:18}},React.createElement("div",{style:{fontSize:48,marginBottom:8}},"🏠"),React.createElement("h1",{style:{margin:0,fontSize:24,fontWeight:800,background:"linear-gradient(135deg,#FF6B6B,#6C63FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}},"Life Blueprint Tracker"),React.createElement("p",{style:{margin:"6px 0 0",color:"#888",fontSize:13}},"Su Family Quest 2026")),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}},Object.entries(PROFILES).map(function(e){var pid=e[0],p=e[1],pd2=data[pid]||getDefault(),lv=getLevel(pd2.totalXp);return React.createElement("button",{key:pid,onClick:function(){setCurP(pid);setView("today");},style:Object.assign({},S.pc,{background:"linear-gradient(135deg,"+p.themeLight+",white)",borderColor:p.theme})},React.createElement("div",{style:{fontSize:36,marginBottom:2}},p.avatar),React.createElement("div",{style:{fontWeight:800,fontSize:14,color:"#333"}},p.name),React.createElement("div",{style:{fontSize:9,color:"#888",marginBottom:3}},p.role),React.createElement("div",{style:{fontSize:10}},lv.icon+" "+lv.name),React.createElement("div",{style:{fontSize:10,color:p.theme,fontWeight:700}},(pd2.totalXp||0)+" XP | 🔥"+(pd2.streak||0)));})),
      React.createElement("div",{style:S.bd},React.createElement("h3",{style:{margin:"0 0 6px",fontSize:13,color:"#666"}},"🏆 Bảng xếp hạng"),sorted.map(function(e,i){var pid=e[0],p=e[1];return React.createElement("div",{key:pid,style:{display:"flex",alignItems:"center",gap:6,padding:"4px 0",fontSize:12}},React.createElement("span",{style:{fontWeight:800}},medals[i]||""),React.createElement("span",null,p.avatar+" "+p.name),React.createElement("span",{style:{marginLeft:"auto",fontWeight:700,color:p.theme}},(data[pid]?data[pid].totalXp:0)+" XP"),React.createElement("span",{style:{color:"#999",fontSize:11}},"🔥"+(data[pid]?data[pid].streak:0)));})));
  }

  var pr=PROFILES[curP],pl=pd||getDefault(),lv=getLevel(pl.totalXp),nlv=getNextLevel(pl.totalXp),ph=getCurrentPhase();
  var st=isKid?25:30,mx=isKid?43:100;var tx=0;habits.forEach(function(h){if(checked[h.id])tx+=h.xp;});
  var tPct=Math.min(100,(tx/st)*100),lPct=nlv?((pl.totalXp-lv.minXp)/(nlv.minXp-lv.minXp))*100:100;
  var tPo=0;Object.values(timeE).forEach(function(v){tPo+=v;});

  var kidTabs=[{id:"today",icon:"📋",l:"Hôm nay"},{id:"stats",icon:"📊",l:"Thống kê"},{id:"achievements",icon:"🏅",l:"Huy chương"},{id:"treasure",icon:"🎁",l:"Thưởng"},{id:"shop",icon:"🏪",l:"Shop"}];
  var adTabs=[{id:"today",icon:"📋",l:"Hành vi"},{id:"time",icon:"⏱️",l:"Thời gian"},{id:"goals",icon:"🎯",l:"Mục tiêu"},{id:"review",icon:"📝",l:"Review"},{id:"stats",icon:"📊",l:"Thống kê"}];
  var tabs=isKid?kidTabs:adTabs;var content=[];

  if(view==="today"){
    content.push(React.createElement("div",{key:"tgt",style:Object.assign({},S.cd,{background:tPct>=100?"linear-gradient(135deg,#4ECB71,#2ECC71)":"white"})},React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},React.createElement("div",null,React.createElement("div",{style:{fontWeight:800,fontSize:15,color:tPct>=100?"white":"#333"}},tPct>=100?"✅ Hoàn thành!":"🎯 Mục tiêu"),React.createElement("div",{style:{fontSize:11,color:tPct>=100?"rgba(255,255,255,0.8)":"#888"}},isKid?"GĐ"+ph.id+": "+ph.name:"≥"+st+"đ/ngày")),React.createElement("div",{style:{fontSize:22,fontWeight:800,color:tPct>=100?"white":pr.theme}},tx+"/"+st)),React.createElement("div",{style:Object.assign({},S.br,{height:8,background:tPct>=100?"rgba(255,255,255,0.3)":"#EEE"})},React.createElement("div",{style:Object.assign({},S.fl,{height:8,width:tPct+"%",background:tPct>=100?"white":"linear-gradient(90deg,"+pr.theme+",#FFD700)",transition:"width 0.5s"})}))));
    Object.entries(cats).forEach(function(ce){var cid=ce[0],cat=ce[1],ch=habits.filter(function(h){return h.cat===cid;}),cxp=0;ch.forEach(function(h){if(checked[h.id])cxp+=h.xp;});var isFoc=isKid&&ph.focus.indexOf(cid)>=0;
      content.push(React.createElement("div",{key:cid,style:{marginBottom:10}},React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5,marginBottom:5}},React.createElement("span",{style:{fontSize:14}},cat.icon),React.createElement("span",{style:{fontWeight:700,fontSize:13,color:cat.color}},cat.name),React.createElement("span",{style:{fontSize:10,color:"#999",marginLeft:3}},cxp),isFoc?React.createElement("span",{style:{fontSize:9,background:cat.color+"20",color:cat.color,padding:"1px 5px",borderRadius:8,fontWeight:700,marginLeft:"auto"}},"Focus"):null),
        ch.map(function(h){var ck=!!checked[h.id],isA=anim===h.id,sX=xpFor===h.id,desc=h["desc_"+curP]||h.desc||"";
          return React.createElement("button",{key:h.id,onClick:function(){toggleH(h.id);},style:Object.assign({},S.rw,{background:ck?cat.color+"12":"white",borderColor:ck?cat.color+"40":"#EEE",transform:isA?"scale(1.02)":"scale(1)",transition:"all 0.2s",position:"relative",overflow:"visible"})},
            sX?React.createElement("div",{style:{position:"absolute",top:-20,left:"50%",transform:"translateX(-50%)",fontWeight:800,fontSize:18,color:"#FFD700",zIndex:20,animation:"xpFloat 0.8s ease-out forwards"}},"+"+h.xp):null,
            React.createElement("div",{style:Object.assign({},S.ck,{background:ck?cat.color:"white",borderColor:ck?cat.color:"#DDD",transform:isA?"scale(1.2)":"scale(1)"})},ck?"✓":null),
            React.createElement("span",{style:{fontSize:18}},h.emoji),React.createElement("div",{style:{flex:1}},React.createElement("div",{style:{fontWeight:600,fontSize:13,color:ck?cat.color:"#333"}},h.label),desc?React.createElement("div",{style:{fontSize:10,color:"#999"}},desc):null),
            React.createElement("div",{style:{fontSize:11,fontWeight:700,color:ck?cat.color:"#CCC",background:ck?cat.color+"15":"#F5F5F5",padding:"2px 7px",borderRadius:10}},"+"+h.xp));})));
    });
    if(!isKid){var sb=[];for(var i=0;i<10;i++){(function(idx){sb.push(React.createElement("button",{key:idx,onClick:function(){saveFreedom(idx+1);},style:{width:28,height:28,borderRadius:7,border:fScore===idx+1?"2px solid "+pr.theme:"2px solid #EEE",background:fScore>=idx+1?pr.theme+(fScore===idx+1?"":"30"):"white",color:fScore===idx+1?"white":"#666",fontWeight:700,fontSize:11,cursor:"pointer"}},idx+1));})(i);}
      content.push(React.createElement("div",{key:"free",style:S.cd},React.createElement("div",{style:{fontWeight:700,fontSize:13,marginBottom:6}},"🧭 Điểm Tự Do"),React.createElement("div",{style:{fontSize:11,color:"#888",marginBottom:6}},"Sống từ lựa chọn hay phản ứng?"),React.createElement("div",{style:{display:"flex",gap:3,justifyContent:"center"}},sb)));}
  }

  if(view==="time"&&!isKid){
    content.push(React.createElement("div",{key:"th",style:S.cd},React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},React.createElement("div",{style:{fontWeight:700,fontSize:14}},"⏱️ Pomodoro"),React.createElement("div",{style:{fontSize:20,fontWeight:800,color:pr.theme}},tPo+"po = "+(tPo*0.5).toFixed(1)+"h"))));
    TIME_CATS.forEach(function(c){var v=timeE[c.id]||0;content.push(React.createElement("div",{key:"t"+c.id,style:Object.assign({},S.rw,{background:v>0?c.color+"10":"white",borderColor:v>0?c.color+"30":"#EEE"})},React.createElement("span",{style:{fontSize:18,width:28,textAlign:"center"}},c.icon),React.createElement("div",{style:{flex:1}},React.createElement("div",{style:{fontWeight:600,fontSize:13,color:v>0?c.color:"#333"}},c.name),v>0?React.createElement("div",{style:{fontSize:10,color:"#999"}},(v*0.5).toFixed(1)+"h"):null),React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5}},React.createElement("button",{onClick:function(){updateTime(c.id,-1);},style:Object.assign({},S.pb,{opacity:v>0?1:0.3})},"−"),React.createElement("span",{style:{fontWeight:800,fontSize:16,color:c.color,minWidth:22,textAlign:"center"}},v),React.createElement("button",{onClick:function(){updateTime(c.id,1);},style:Object.assign({},S.pb,{background:c.color,color:"white"})},"+"))));});
  }

  if(view==="goals"&&!isKid){
    content.push(React.createElement("div",{key:"gh",style:Object.assign({},S.cd,{textAlign:"center"})},React.createElement("div",{style:{fontWeight:800,fontSize:16,color:pr.theme}},"🎯 10 Mục tiêu 2026")));
    GOALS.forEach(function(g){var val=(pl.goals&&pl.goals[g.id])||0;var pct=Math.min(100,(val/g.target)*100);var displayVal=g.step<1?val.toFixed(1):val;
      content.push(React.createElement("div",{key:"g"+g.id,style:Object.assign({},S.cd,{padding:12})},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:6}},React.createElement("span",{style:{fontSize:24}},g.icon),React.createElement("div",{style:{flex:1}},React.createElement("div",{style:{fontWeight:700,fontSize:13}},g.name),React.createElement("div",{style:{fontSize:10,color:"#888"}},g.desc)),React.createElement("div",{style:{textAlign:"right"}},React.createElement("div",{style:{fontWeight:800,fontSize:14,color:pct>=100?"#4ECB71":g.color}},displayVal+"/"+g.target),React.createElement("div",{style:{fontSize:10,color:"#999"}},g.unit))),
        React.createElement("div",{style:Object.assign({},S.br,{height:8,marginBottom:6})},React.createElement("div",{style:Object.assign({},S.fl,{height:8,width:pct+"%",background:pct>=100?"#4ECB71":g.color})})),
        React.createElement("div",{style:{display:"flex",gap:4,justifyContent:"flex-end"}},React.createElement("button",{onClick:function(){updateGoal(g.id,Math.max(0,parseFloat((val-g.step).toFixed(1))));},style:Object.assign({},S.pb,{width:26,height:26,fontSize:14})},"−"),React.createElement("button",{onClick:function(){updateGoal(g.id,parseFloat((val+g.step).toFixed(1)));},style:Object.assign({},S.pb,{width:26,height:26,fontSize:14,background:g.color,color:"white"})},"+"))));
    });
  }

  if(view==="review"&&!isKid){
    content.push(React.createElement("div",{key:"rv-h",style:Object.assign({},S.cd,{textAlign:"center"})},React.createElement("div",{style:{fontWeight:800,fontSize:16,color:pr.theme}},"📝 Review Tuần"),React.createElement("div",{style:{fontSize:11,color:"#888",marginTop:4}},getWeekId()+" | CN tối — 30 phút")));
    REVIEW_QUESTIONS.forEach(function(q){var val=revData[q.id]||"";
      content.push(React.createElement("div",{key:"rv"+q.id,style:Object.assign({},S.cd,{padding:12})},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6}},React.createElement("span",{style:{fontSize:18}},q.icon),React.createElement("div",{style:{fontWeight:700,fontSize:13}},q.label),q.unit?React.createElement("span",{style:{fontSize:11,color:"#999",marginLeft:"auto"}},q.unit):null),
        q.type==="number"?React.createElement("input",{type:"number",value:val,onChange:function(e){saveReview(q.id,e.target.value);},style:{width:"100%",padding:"8px 12px",borderRadius:8,border:"2px solid #EEE",fontSize:16,fontWeight:700,outline:"none",fontFamily:"inherit"},placeholder:"Nhập số..."}):
        React.createElement("textarea",{value:val,onChange:function(e){saveReview(q.id,e.target.value);},rows:2,style:{width:"100%",padding:"8px 12px",borderRadius:8,border:"2px solid #EEE",fontSize:14,outline:"none",resize:"vertical",fontFamily:"inherit"},placeholder:"Ghi chú..."})
      ));
    });
    content.push(React.createElement("div",{key:"rv-note",style:{textAlign:"center",fontSize:11,color:"#AAA",marginTop:8,padding:"0 20px"}},"Dữ liệu tự động lưu. Review tháng & quý: sử dụng tab Mục tiêu để cập nhật tiến độ 10 mục tiêu."));
  }

  if(view==="stats"){
    var li=LEVELS.indexOf(lv);
    content.push(React.createElement("div",{key:"lc",style:Object.assign({},S.cd,{textAlign:"center"})},React.createElement("div",{style:{fontSize:44}},lv.icon),React.createElement("div",{style:{fontWeight:800,fontSize:20,color:pr.theme}},"Lv."+(li+1)+" "+lv.name),React.createElement("div",{style:{fontSize:13,color:"#666"}},pl.totalXp+" XP")));
    var si=[{icon:"🔥",l:"Streak",v:pl.streak,c:"#FF6B00"},{icon:"🏆",l:"Max",v:pl.maxStreak||0,c:"#FFD700"},{icon:"📅",l:"Ngày đạt",v:pl.totalDays,c:"#4ECB71"},{icon:"💯",l:"Hoàn hảo",v:pl.perfectDays,c:"#FF69B4"},{icon:"💎",l:"Gems",v:pl.gems,c:"#6C63FF"},{icon:"🏅",l:"Huy chương",v:(pl.achievements||[]).length,c:"#FF8C00"}];
    content.push(React.createElement("div",{key:"sg",style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},si.map(function(s,i){return React.createElement("div",{key:i,style:S.st},React.createElement("span",{style:{fontSize:22}},s.icon),React.createElement("div",{style:{fontSize:24,fontWeight:800,color:s.c}},s.v),React.createElement("div",{style:{fontSize:10,color:"#888"}},s.l));})));
    var db=[];var dn=["CN","T2","T3","T4","T5","T6","T7"];for(var di=0;di<7;di++){var d=new Date(Date.now()-(6-di)*86400000),k=d.toISOString().split("T")[0],dd=(pl.history&&pl.history[k])?pl.history[k]:{},dx=0;habits.forEach(function(h){if(dd[h.id])dx+=h.xp;});var p=Math.min(100,(dx/st)*100);db.push(React.createElement("div",{key:di,style:{flex:1,textAlign:"center"}},React.createElement("div",{style:{fontSize:9,color:"#888",marginBottom:3}},dn[d.getDay()]),React.createElement("div",{style:{height:44,borderRadius:5,background:"#F0F0F0",position:"relative",overflow:"hidden"}},React.createElement("div",{style:{position:"absolute",bottom:0,width:"100%",height:p+"%",background:p>=100?pr.theme:pr.theme+"60",borderRadius:5}})),React.createElement("div",{style:{fontSize:9,fontWeight:700,color:p>=100?pr.theme:"#999",marginTop:2}},dx)));}
    content.push(React.createElement("div",{key:"7d",style:S.cd},React.createElement("div",{style:{fontWeight:700,fontSize:13,marginBottom:8}},"📆 7 ngày"),React.createElement("div",{style:{display:"flex",gap:3,justifyContent:"space-between"}},db)));
  }

  if(view==="achievements"){content.push(React.createElement("div",{key:"ag",style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},ACHIEVEMENTS.map(function(a){var e=(pl.achievements||[]).indexOf(a.id)>=0;return React.createElement("div",{key:a.id,style:Object.assign({},S.ac,{opacity:e?1:0.4,background:e?"white":"#F5F5F5",border:e?"2px solid "+pr.theme+"40":"2px solid #EEE"})},React.createElement("div",{style:{fontSize:28}},e?a.icon:"🔒"),React.createElement("div",{style:{fontWeight:700,fontSize:12}},a.name),React.createElement("div",{style:{fontSize:10,color:"#888"}},a.desc),e?React.createElement("div",{style:{fontSize:9,color:pr.theme,fontWeight:700,marginTop:3}},"✓"):null);})));}

  if(view==="treasure"&&isKid){content.push(React.createElement("div",{key:"trh",style:{textAlign:"center",marginBottom:12}},React.createElement("div",{style:{fontSize:36}},"⭐"),React.createElement("div",{style:{fontSize:26,fontWeight:800,color:"#FFD700"}},pl.stickers||0),React.createElement("div",{style:{fontSize:12,color:"#888"}},"Sticker hiện có")));TREASURES.forEach(function(t){var ok=(pl.stickers||0)>=t.stickers;content.push(React.createElement("div",{key:"tr"+t.id,style:Object.assign({},S.sp,{opacity:ok?1:0.5})},React.createElement("span",{style:{fontSize:28}},t.icon),React.createElement("div",{style:{flex:1}},React.createElement("div",{style:{fontWeight:700,fontSize:13}},t.name),React.createElement("div",{style:{fontSize:11,color:"#888"}},"Cần "+t.stickers+"⭐")),React.createElement("button",{onClick:function(){if(ok)redeemT(t);},style:Object.assign({},S.bt,{background:ok?"#FFD700":"#EEE",color:ok?"white":"#999"})},"Đổi")));});}

  if(view==="shop"){content.push(React.createElement("div",{key:"sh",style:{textAlign:"center",marginBottom:12}},React.createElement("div",{style:{fontSize:34}},"💎"),React.createElement("div",{style:{fontSize:26,fontWeight:800,color:"#6C63FF"}},pl.gems),React.createElement("div",{style:{fontSize:12,color:"#888"}},"Gems")));SHOP_ITEMS.forEach(function(it){var ok=pl.gems>=it.cost;content.push(React.createElement("div",{key:"s"+it.id,style:Object.assign({},S.sp,{opacity:ok?1:0.5})},React.createElement("span",{style:{fontSize:28}},it.icon),React.createElement("div",{style:{flex:1}},React.createElement("div",{style:{fontWeight:700,fontSize:13}},it.name),React.createElement("div",{style:{fontSize:11,color:"#888"}},it.desc)),React.createElement("button",{onClick:function(){if(ok)buyI(it);},style:Object.assign({},S.bt,{background:ok?pr.theme:"#EEE",color:ok?"white":"#999"})},"💎"+it.cost)));});}

  return React.createElement("div",{style:Object.assign({},S.ap,{background:pr.themeLight})},React.createElement("style",null,CSS),
    showCeleb?React.createElement("div",{style:S.co},React.createElement("div",{style:S.cc},React.createElement("div",{style:{fontSize:48}},"🎉"),React.createElement("div",{style:{fontSize:18,fontWeight:800,marginTop:8}},celebMsg))):null,
    newAch?React.createElement("div",{style:S.np},React.createElement("div",{style:{fontSize:36}},newAch.icon),React.createElement("div",null,React.createElement("div",{style:{fontWeight:800,fontSize:13}},"Huy chương mới!"),React.createElement("div",{style:{fontWeight:700,fontSize:15}},newAch.name))):null,
    React.createElement("div",{style:Object.assign({},S.tp,{borderBottomColor:pr.theme+"30"})},React.createElement("button",{onClick:function(){setCurP(null);},style:S.bk},"←"),React.createElement("div",{style:{display:"flex",alignItems:"center",gap:5}},React.createElement("span",{style:{fontSize:20}},pr.avatar),React.createElement("div",null,React.createElement("div",{style:{fontWeight:800,fontSize:13,color:"#333"}},pr.name),React.createElement("div",{style:{fontSize:10,color:"#888"}},lv.icon+" Lv."+(LEVELS.indexOf(lv)+1)))),React.createElement("div",{style:{display:"flex",gap:7,alignItems:"center",fontSize:12}},React.createElement("span",null,"🔥",React.createElement("b",{style:{color:pl.streak>0?"#FF6B00":"#CCC"}},pl.streak)),React.createElement("span",null,"💎",React.createElement("b",{style:{color:"#6C63FF"}},pl.gems)),isKid?React.createElement("span",null,"⭐",React.createElement("b",{style:{color:"#FFD700"}},pl.stickers||0)):null)),
    React.createElement("div",{style:{padding:"0 16px 5px"}},React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#888",marginBottom:2}},React.createElement("span",null,"Lv."+(LEVELS.indexOf(lv)+1)),React.createElement("span",null,nlv?pl.totalXp+"/"+nlv.minXp:"MAX")),React.createElement("div",{style:S.br},React.createElement("div",{style:Object.assign({},S.fl,{width:lPct+"%",background:"linear-gradient(90deg,"+pr.theme+","+pr.theme+"CC)"})}))),
    React.createElement("div",{style:S.tb},tabs.map(function(t){return React.createElement("button",{key:t.id,onClick:function(){setView(t.id);},style:Object.assign({},S.ti,{color:view===t.id?pr.theme:"#999",borderBottomColor:view===t.id?pr.theme:"transparent",fontWeight:view===t.id?700:500})},React.createElement("span",{style:{fontSize:14}},t.icon),React.createElement("span",{style:{fontSize:9}},t.l));})),
    React.createElement("div",{style:S.ct},content));
}

var S={ap:{maxWidth:420,margin:"0 auto",minHeight:"100vh",fontFamily:"'Nunito','Segoe UI',sans-serif",position:"relative"},loading:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",fontFamily:"'Nunito','Segoe UI',sans-serif"},ps:{maxWidth:420,margin:"0 auto",minHeight:"100vh",padding:18,background:"linear-gradient(180deg,#FFF5F5,#F0F0FF,#F0FFF0)",fontFamily:"'Nunito','Segoe UI',sans-serif"},pc:{border:"2px solid",borderRadius:14,padding:"12px 6px",cursor:"pointer",textAlign:"center",background:"white",transition:"transform 0.2s",outline:"none"},bd:{background:"white",borderRadius:12,padding:12,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"},tp:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"rgba(255,255,255,0.9)",backdropFilter:"blur(10px)",borderBottom:"2px solid",position:"sticky",top:0,zIndex:50},bk:{width:30,height:30,borderRadius:9,border:"2px solid #EEE",background:"white",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},tb:{display:"flex",borderBottom:"2px solid #EEE",background:"white",overflowX:"auto"},ti:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"5px 1px",border:"none",borderBottom:"3px solid transparent",background:"none",cursor:"pointer",transition:"all 0.2s",minWidth:0},ct:{padding:"10px 12px 80px"},cd:{background:"white",borderRadius:12,padding:12,marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.04)",border:"1px solid #F0F0F0"},br:{height:5,borderRadius:10,background:"#EEE",overflow:"hidden"},fl:{height:5,borderRadius:10,transition:"width 0.4s ease"},rw:{display:"flex",alignItems:"center",gap:7,padding:"8px 9px",borderRadius:11,border:"2px solid",marginBottom:4,cursor:"pointer",width:"100%",textAlign:"left",outline:"none",position:"relative"},ck:{width:22,height:22,borderRadius:6,border:"2px solid",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0,color:"white",fontSize:13,fontWeight:800},st:{background:"white",borderRadius:11,padding:10,textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",border:"1px solid #F0F0F0"},ac:{borderRadius:11,padding:10,textAlign:"center"},sp:{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",background:"white",borderRadius:11,marginBottom:6,boxShadow:"0 2px 8px rgba(0,0,0,0.04)",border:"1px solid #F0F0F0"},bt:{border:"none",borderRadius:8,padding:"6px 11px",fontWeight:700,fontSize:12,cursor:"pointer"},pb:{width:28,height:28,borderRadius:7,border:"2px solid #EEE",background:"white",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},co:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,animation:"fadeIn 0.3s"},cc:{background:"white",borderRadius:18,padding:"24px 32px",textAlign:"center",animation:"popIn 0.4s",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"},np:{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",background:"white",borderRadius:12,padding:"9px 16px",display:"flex",alignItems:"center",gap:9,zIndex:100,boxShadow:"0 8px 30px rgba(0,0,0,0.15)",animation:"slideDown 0.4s",border:"2px solid #FFD700"}};
var CSS="@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}body{margin:0;padding:0;}button:hover{transform:scale(1.01);}button:active{transform:scale(0.98)!important;}input,textarea{font-family:'Nunito','Segoe UI',sans-serif;}@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}@keyframes xpFloat{0%{opacity:1;transform:translateX(-50%) translateY(0);}100%{opacity:0;transform:translateX(-50%) translateY(-30px);}}@keyframes popIn{0%{transform:scale(0.5);opacity:0;}50%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;}}@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}@keyframes slideDown{from{transform:translateX(-50%) translateY(-20px);opacity:0;}to{transform:translateX(-50%) translateY(0);opacity:1;}}";
