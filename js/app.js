if(typeof MOTION==='undefined') var MOTION={};
if(typeof MOTION_SRC==='undefined') var MOTION_SRC={};
/* clip đóng gói: khoá tham chiếu tới nguồn dùng chung, lật gương lúc dựng (cache) */
var MOTION_CACHE={};
function motionClip(key){
  var m=MOTION[key]; if(!m) return null;
  if(MOTION_CACHE[key]) return MOTION_CACHE[key];
  var s=MOTION_SRC[m.ref]; if(!s) return null;
  var c={d:'',dur:s.dur,org0:s.org0.slice(),view:m.view,club:m.club,gear:m.gear,gearHand:m.gearHand,hold:m.hold,src:m.src,f:s.f};
  if(m.mirror) c.f=s.f.map(function(f){return {t:f.t,o:[-f.o[0],f.o[1]],p:f.p.map(function(q){return [-q[0],q[1],q[2]];})};});
  MOTION_CACHE[key]=c; return c;
}
/* Swing một phần cắt từ cú swing thật (golfFO): lên gậy tới độ cao tay "back", xuống qua impact,
   theo đà tới độ cao tay "thru". Độ cao tính theo toạ độ khớp (âm = cao hơn hông). */
var DERIVED={'D:chip':{back:4,thru:-2,slow:1.4},'D:half':{back:-12,thru:-14,slow:1.2},'D:pitch':{back:-12,thru:-14,slow:1.2},
  'D:wedgeclock':{back:-20,thru:-20,slow:1.1},'D:bunker':{back:-24,thru:-26,slow:1},'D:routine':{alias:'F16'}};
function partialSwing(base,o){
  function hy(f){return (f.p[17][1]+f.p[18][1])/2}
  var F=base.f, n=F.length, top=0, imp, i, j;
  for(i=0;i<n;i++) if(F[i].t<2000&&hy(F[i])<hy(F[top])) top=i;
  imp=top; for(i=top;i<n;i++) if(F[i].t<2400&&hy(F[i])>hy(F[imp])) imp=i;
  var a=[],b=[],c=[];
  for(i=0;i<=top;i++){ a.push(F[i]); if(hy(F[i])<o.back) break; }
  for(j=top;j<imp;j++) if(hy(F[j])>o.back) break;
  for(i=j;i<=imp;i++) b.push(F[i]);
  for(i=imp+1;i<n;i++){ c.push(F[i]); if(hy(F[i])<o.thru) break; }
  var out=[], k=o.slow||1;
  a.forEach(function(f){ out.push({t:Math.round(f.t*k),o:f.o,p:f.p}); });
  var t=out[out.length-1].t+160, t0=b[0].t;
  b.concat(c).forEach(function(f){ out.push({t:t+Math.round((f.t-t0)*k),o:f.o,p:f.p}); });
  return {d:'',dur:out[out.length-1].t,org0:base.org0,view:base.view,club:base.club,src:base.src,f:out,hold:700};
}
(function(){ var mc=motionClip; motionClip=function(key){
  var d=DERIVED[key]; if(!d) return mc(key);
  if(MOTION_CACHE[key]) return MOTION_CACHE[key];
  var base=mc(d.alias||'F16'); if(!base) return null;
  return (MOTION_CACHE[key]=d.alias?base:partialSwing(base,d));
}; })();
/* clip cho một khoá: clip của người dùng > clip đóng gói sẵn > không có */
function clipFor(key){return (ME&&ME.clips&&ME.clips[key])||motionClip(key);}
/* ===== Tabs (uỷ quyền sự kiện — panel có thể render động) ===== */
document.addEventListener('click',function(e){
  var t=e.target.closest('.tab');if(!t)return;
  var g=t.dataset.group;
  document.querySelectorAll('.tab[data-group="'+g+'"]').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-selected','false')});
  document.querySelectorAll('.panel[data-group="'+g+'"]').forEach(function(p){p.classList.remove('on')});
  t.classList.add('on');t.setAttribute('aria-selected','true');
  var p=document.getElementById(t.dataset.p);if(p)p.classList.add('on');
});

/* ===== DỮ LIỆU 4 BUỔI TẬP (GĐ1) ===== */
var YT='https://www.youtube.com/watch?v=';
var SESSIONS=[
 {id:'A',tab:L('A · Thân dưới','A · Lower body'),title:L('Thân dưới & hông','Lower body & hips'),day:L('Thứ 2','Monday'),dur:"40'",
  goal:L('Xây lực đạp đất — nguồn gốc của mọi mph.','Build ground force — the source of every mph.'),
  warm:[L('Xoay hông ×10 mỗi chiều','Hip circles ×10 each direction'),L("World's greatest stretch ×5/bên","World's greatest stretch ×5/side"),L('10 squat không tạ','10 bodyweight squats')],
  ex:[
   {k:'Goblet Squat',name:'Goblet Squat',rx:'3 × 8',kg:'14–20 kg',rest:90,note:L('Ôm tạ trước ngực, ngồi sâu, gót bám sàn.','Hold the weight at your chest, sit deep, heels planted.'),vids:[{t:'Buff Dudes',u:YT+'k_EhLGvM8TQ'}]},
   {k:'Kettlebell Swing',name:'Kettlebell Swing',rx:'4 × 10',kg:'16 → 24 kg',rest:90,note:L('Bùng nổ hông — không nâng bằng tay, không squat.','Explode from the hips — don\'t lift with your arms, don\'t squat.'),vids:[{t:L('Video từng bước','Step-by-step video'),u:YT+'1Qi0NQW89Oc'}]},
   {k:'Bulgarian Split Squat',name:'Bulgarian Split Squat',rx:'3 × 8',kg:L('2 × 8–12 kg · mỗi chân','2 × 8–12 kg · each leg'),rest:75,note:L('Chân sau gác ghế ~45 cm — đây là nền của weight shift.','Rear foot on a bench ~45 cm — this is the foundation of your weight shift.'),vids:[{t:'Buff Dudes',u:YT+'DeCnHqrN22U'}]},
   {k:'Box Jump',name:'Box Jump',rx:'3 × 5',kg:L('Bục 40–50 cm','Box 40–50 cm'),rest:60,note:L('Tiếp đất êm, gối gập ~45°. Bước xuống, không nhảy xuống.','Land softly, knees bent ~45°. Step down, don\'t jump down.'),vids:[{t:L('Kỹ thuật tiếp đất','Landing technique'),u:YT+'G-bxQY57mKc'}]},
   {k:'Single-leg Glute Bridge',name:'Single-leg Glute Bridge',rx:'2 × 10',kg:L('Bodyweight · mỗi chân','Bodyweight · each leg'),rest:45,note:L('Kích hoạt mông — nhóm cơ "ngủ quên" của dân văn phòng.','Wake up the glutes — the muscles that "fall asleep" in desk workers.'),vids:[{t:'Runna',u:YT+'VUl8R0kn6v4'}]}
  ]},
 {id:'B',tab:L('B · Core xoay','B · Rotational core'),title:L('Core xoay & liên sườn','Rotational core & obliques'),day:L('Thứ 4','Wednesday'),dur:"35'",
  goal:L('Không tập chân nặng — mai còn chơi pickleball.','No heavy leg work — pickleball tomorrow.'),
  warm:[L('Xoay thân trên ×10','Upper-body rotations ×10'),'Cat-cow ×8',L('10 swing tay chéo thân','10 cross-body arm swings')],
  ex:[
   {k:'Med Ball Rotational Throw',name:'Med Ball Rotational Throw',rx:'4 × 6',kg:L('Bóng 2–3 kg · mỗi bên','Ball 2–3 kg · each side'),rest:60,note:L('Ném ngang vào tường. Xoay hông trước, thân trên theo sau — đúng trình tự kinetic chain. Ưu tiên tốc độ, không phải bóng nặng.','Throw sideways into a wall. Hips turn first, upper body follows — the right kinetic-chain sequence. Prioritize speed, not a heavy ball.'),vids:[{t:L('Hip shift + ném xoay','Hip shift + rotational throw'),u:YT+'O3ME1cTuO7Y'}]},
   {k:'Med Ball Scoop Toss',name:'Med Ball Scoop Toss',rx:'3 × 6',kg:L('Bóng 2–3 kg · mỗi bên','Ball 2–3 kg · each side'),rest:60,note:L('Múc bóng từ thấp lên chéo — đúng quỹ đạo lực của driver.','Scoop the ball low to high across your body — the same force path as the driver.'),vids:[{t:L('Bài viết TPI','TPI article'),u:'https://www.mytpi.com/articles/fitness/4-steps-to-more-rotational-power',doc:1}]},
   {k:'Pallof Press',name:'Pallof Press',rx:'3 × 10',kg:L('Dây kháng lực TB · mỗi bên','Medium resistance band · each side'),rest:45,note:L('Chống xoay — dạy core "khóa" lại để truyền lực.','Anti-rotation — teaches the core to "lock up" and transfer force.'),vids:[{t:'Pallof Press (BarBend)',u:YT+'axgv7H_VQOo'}]},
   {k:'Dead Bug',name:'Dead Bug',rx:'3 × 8',kg:L('Bodyweight · mỗi bên','Bodyweight · each side'),rest:30,note:L('Lưng dưới ép sát sàn — bảo vệ cột sống khi tăng tốc.','Press your lower back into the floor — protects the spine as you add speed.'),vids:[{t:'NASM',u:YT+'bxn9FBrt4-A'}]},
   {k:'Side Plank + Open Book',name:'Side Plank + Open Book',rx:'2 × 30s',kg:'Bodyweight · + 2 × 8 Open Book',rest:45,note:L('Liên sườn + vai ổn định, rồi mở khớp ngực. Golfer giỏi xoay ở hông và ngực, không ở thắt lưng.','Obliques + shoulder stability, then open up the upper back. Good golfers rotate through the hips and chest, not the lower back.'),vids:[{t:'Side Plank Rotation',u:YT+'DXQ9YKHtcsk'},{t:'Open Books',u:YT+'rDviWORCWEw'}]}
  ]},
 {id:'C',tab:L('C · Toàn thân','C · Full body'),title:L('Sức mạnh toàn thân','Full-body strength'),day:L('Thứ 6','Friday'),dur:"40'",
  goal:L('Xây "động cơ" tổng thể cho cú drive.','Build the overall "engine" for your drive.'),
  warm:[L("Jumping jack nhẹ 1'","Light jumping jacks 1'"),L('Xoay vai ×10','Shoulder circles ×10'),L('Hip hinge không tạ ×10','Bodyweight hip hinge ×10')],
  ex:[
   {k:'Romanian Deadlift',name:'Romanian Deadlift',rx:'3 × 8',kg:'2 × 14–18 kg',rest:90,note:L('Chuỗi cơ sau = nguồn lực lớn nhất của cú drive.','The posterior chain = the biggest power source of your drive.'),vids:[{t:'NASM',u:YT+'aa57T45iFSE'}]},
   {k:'Push-up',name:'Push-up',rx:'3 × 10–12',kg:L('BW hoặc DB Bench 2×14 kg','BW or DB Bench 2×14 kg'),rest:60,note:L('Thân trên khỏe để "đón" lực từ hông truyền lên.','A strong upper body to "catch" the force coming up from the hips.'),vids:[{t:'Push-up',u:YT+'i9sTjhN4Z3M'}]},
   {k:'Single-arm DB Row',name:'Single-arm DB Row',rx:'3 × 10',kg:L('14–18 kg · mỗi bên','14–18 kg · each side'),rest:60,note:L('Cơ xô + lưng giữa — giữ gậy ổn định qua impact.','Lats + mid-back — keep the club stable through impact.'),vids:[{t:'Buff Dudes',u:YT+'tLnlWj7LQ34'}]},
   {k:'Med Ball Slam',name:'Med Ball Slam',rx:'3 × 8',kg:L('Bóng 4–5 kg','Ball 4–5 kg'),rest:60,note:L('Đập hết lực xuống sàn — tốc độ phát lực toàn thân.','Slam it into the floor with everything — full-body rate of force development.'),vids:[{t:'Med Ball Slam',u:YT+'lsMGmkvzFsE'}]},
   {k:'Lateral Lunge + Farmer Carry',name:'Lateral Lunge + Farmer Carry',rx:'2 × 8',kg:L('BW→8 kg · + 2 × 30 m với 2×20–24 kg','BW→8 kg · + 2 × 30 m with 2×20–24 kg'),rest:60,note:L('Lực ngang + grip khỏe — kết buổi bằng bài "gánh nước" cổ điển.','Lateral power + a strong grip — finish with the classic "water carrier" drill.'),vids:[{t:'Lateral Lunge',u:YT+'R8jArZG2J6Q'},{t:"Farmer's Walk",u:YT+'8OtwXwrJizk'}]}
  ]},
 {id:'D',tab:'D · Speed ⚡',title:L('Speed trên Launch Monitor','Speed on the Launch Monitor'),day:L('Thứ 7','Saturday'),dur:"30'",
  goal:L('Chỉ quan tâm TỐC ĐỘ — mặc kệ hướng bóng.','Only SPEED matters — ignore where the ball goes.'),
  warm:[L('Khởi động khớp vai & hông','Shoulder & hip joint warm-up'),L('10 swing nhẹ tăng dần','10 easy swings, building up'),L('Nghỉ đủ 60–90s giữa các cụm','Rest a full 60–90s between sets')],
  ex:[
   {k:'Swing tay nghịch',name:L('Swing tay nghịch','Opposite-side swings'),rx:'2 × 5',kg:L('Không bóng · hết lực','No ball · full effort'),rest:60,note:L('Cân bằng hai bên cơ thể trước khi vào overspeed.','Balance both sides of your body before the overspeed work.'),vids:[{t:L('Overspeed là gì? (SuperSpeed)','What is overspeed? (SuperSpeed)'),u:YT+'8gJN05iMla4'}]},
   {k:'Overspeed',name:'Overspeed',rx:'3 × 5',kg:L('Gậy nhẹ / gậy 7 lật ngược','Light club / upside-down 7-iron'),rest:90,note:L('Swing hết lực với gậy nhẹ (SuperSpeed hoặc gậy 7 lật ngược) — dạy hệ thần kinh quen tốc độ cao hơn.','Swing all-out with a light club (SuperSpeed or an upside-down 7-iron) — teaches your nervous system to get used to higher speed.'),vids:[{t:'Protocol Level 1',u:YT+'9DGv0KK7_Xw'}]},
   {k:'Step Drill',name:'Step Drill',rx:'2 × 5',kg:L('Không bóng','No ball'),rest:60,note:L('Bước chân trái về đích khi xuống gậy — ép thân dưới khởi động downswing.','Step your lead foot toward the target as you start down — forces the lower body to start the downswing.'),vids:[{t:L('Hướng dẫn Step Drill','Step Drill guide'),u:'https://superspeedgolf.com/blogs/news/swing-speed-training-basics-the-step-drill',doc:1}]},
   {k:'Driver — đo mph',name:L('Driver — đo mph','Driver — measure mph'),rx:'3 × 5',kg:L('Swing tối đa','Max swing'),rest:90,note:L('Ghi số mph cao nhất vào Nhật ký tốc độ bên dưới. Chỉ nhìn con số, đừng nhìn hướng bóng.','Log your highest mph in the Speed log below. Watch only the number, not where the ball goes.'),vids:[{t:'Playlist SuperSpeed',u:'https://www.youtube.com/playlist?list=PLDf7l5SEbgoNHf2DOAP6JkDqb6-NGtzCx'}]}
  ]}
];

/* ===== DỮ LIỆU THAY ĐỔI THEO GIAI ĐOẠN ===== */
var CHANGES={
 ph2:[
  {b:'A',w:L('Goblet Squat → <b>Trap Bar Deadlift</b> (không có gym thì RDL nặng)','Goblet Squat → <b>Trap Bar Deadlift</b> (no gym? heavy RDL)'),d:L('4 × 5 · từ ~70 kg tiến tới 90–100 kg','4 × 5 · from ~70 kg building to 90–100 kg'),v:{t:'Trap Bar DL',u:YT+'Vu4oXIRzx7w'}},
  {b:'A',w:'Glute Bridge → <b>Hip Thrust</b>',d:L('3 × 8 · tạ đòn/tạ đơn 40–60 kg','3 × 8 · barbell/dumbbell 40–60 kg'),v:{t:'Hip Thrust',u:YT+'pF17m_CXfL0'}},
  {b:'A',w:L('KB Swing nặng hơn','Heavier KB Swing'),d:'4 × 8 · 24–28 kg'},
  {b:'B',w:L('Thêm <b>Cable/Band Chop</b> (chặt chéo)','Add <b>Cable/Band Chop</b> (diagonal chop)'),d:L('3 × 10 / bên · nặng vừa, kiểm soát','3 × 10 / side · moderate load, controlled'),v:{t:'Cable Chop',u:YT+'KOh8cxe2ziE'}},
  {b:'C',w:'Push-up → <b>DB Push Press</b>',d:'4 × 6 · 2 × 16–20 kg',v:{t:'Push Press',u:YT+'MqvN10OF5fo'}},
  {b:'C',w:L('RDL & Row tăng tạ','Heavier RDL & Row'),d:'4 × 6 · RDL 2×20–24 kg · Row 20–24 kg'},
  {b:'D',w:L('Giữ nguyên protocol Level 1','Stay on protocol Level 1'),d:L('Ghi mph vào tuần 4 mỗi tháng','Log mph in week 4 of each month')}
 ],
 ph3:[
  {b:'A',w:L('<b>Trap Bar DL nặng</b> → nghỉ 20s → <b>Broad Jump</b>','<b>Heavy Trap Bar DL</b> → rest 20s → <b>Broad Jump</b>'),d:L('3 vòng: 3 rep nặng + 3 bật xa · nghỉ 2–3′ · tiếp đất mềm, gối không đổ vào trong','3 rounds: 3 heavy reps + 3 broad jumps · rest 2–3′ · land softly, knees don\'t cave in'),v:{t:L('Broad Jump — kỹ thuật & tiếp đất','Broad Jump — technique & landing'),u:YT+'dVgtvAXeBQw'}},
  {b:'A',w:L('Box Jump lên bục cao hơn (55–60 cm)','Box Jump onto a higher box (55–60 cm)'),d:L('3 × 4 · chất lượng tuyệt đối','3 × 4 · perfect quality only')},
  {b:'B',w:L('Ném bóng <b>nặng</b> 4–5 kg hết lực + ném bóng <b>nhẹ</b> 1–2 kg ngay sau','All-out <b>heavy</b> 4–5 kg ball throws + <b>light</b> 1–2 kg ball throws right after'),d:L('3 vòng: 4 nặng + 4 nhẹ / bên','3 rounds: 4 heavy + 4 light / side')},
  {b:'C',w:L('<b>Push Press nhanh</b> + Med Ball Slam liền sau','<b>Fast Push Press</b> + Med Ball Slam straight after'),d:L('3 vòng: 3 đẩy + 5 slam · nghỉ 2′','3 rounds: 3 presses + 5 slams · rest 2′')},
  {b:'D',w:L('Thêm 1 vòng overspeed; bắt đầu swing có bước chân đà','Add 1 overspeed round; start swinging with a step-in'),d:L('4 × 5 gậy nhẹ + 3 × 5 driver max','4 × 5 light club + 3 × 5 max driver'),v:{t:'Fit For Golf guide',u:'https://fitforgolf.blog/med-ball-exercises-golf-swing-speed/',doc:1}}
 ],
 ph4:[
  {b:'T2',w:L('Thể lực duy trì #1','Maintenance strength #1'),d:L("Trap bar 3×3 @70% · KB swing 3×8 · Box jump 3×3 — 25′, ra về khi còn sung","Trap bar 3×3 @70% · KB swing 3×8 · Box jump 3×3 — 25′, leave while still fresh")},
  {b:'T3',w:L('⚡ Overspeed #1 + kỹ thuật nhẹ','⚡ Overspeed #1 + light technique'),d:L("SuperSpeed Level 2 (GĐ7 thêm bước đà) + 15′ routine trước cú đánh","SuperSpeed Level 2 (Phase 7 adds a step-in) + 15′ pre-shot routine"),v:{t:'Level 2 Protocol',u:YT+'kDRyQioVWI4'}},
  {b:'T4',w:L('Core nhẹ + mobility','Light core + mobility'),d:"Pallof 3×10 · Dead Bug 3×8 · Open Book 2×8 — 20′"},
  {b:'T5',w:'🏓 Pickleball',d:L('Giữ nguyên — chính là bài agility của giai đoạn này','Keep it — it\'s your agility work for this phase')},
  {b:'T6',w:L('Thể lực duy trì #2','Maintenance strength #2'),d:L("Push press 3×3 nhanh · Row 3×8 · Ném bóng nhẹ 3×5/bên — 25′","Push press 3×3 fast · Row 3×8 · Light ball throws 3×5/side — 25′")},
  {b:'T7',w:'⚡ Overspeed #2 + TEST',d:L('Full protocol + 5 driver max ghi mph. Tuần cuối tháng = test chính thức','Full protocol + 5 max drivers, log mph. Last week of the month = official test'),dd:1},
  {b:'CN',w:L('Nghỉ tuyệt đối','Complete rest'),d:L('Ngủ bù, đi bộ nhẹ','Catch up on sleep, easy walk')}
 ]
};

/* ======================================================================
   HỒ SƠ NGƯỜI TẬP & BỘ CÁ NHÂN HÓA
   Người mới nhập thể trạng + sức khỏe + thông số driver -> giáo án được
   tính lại cho đúng người đó: tải tạ, bài thay thế (chấn thương / dụng cụ),
   lịch tuần, mốc mph, cự ly, bảng monitor, khuyến nghị gậy.
   Không có hồ sơ = giữ nguyên giáo án mẫu (1m70 · 72 kg · ~88 mph).
   ====================================================================== */
var PKEY='golf-profiles', AKEY='golf-profile-active';
function lsGet(k){try{return window.localStorage?localStorage.getItem(k):null}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
var PROFILES=[]; try{PROFILES=JSON.parse(lsGet(PKEY)||'[]')||[]}catch(e){PROFILES=[]}
var ME=null; (function(){var a=lsGet(AKEY); PROFILES.forEach(function(p){if(p.id===a)ME=p});
  /* máy mới (hồ sơ tải từ đám mây về) chưa chọn ai -> chọn người đầu tiên */
  if(!ME&&PROFILES.length){ME=PROFILES[0];lsSet(AKEY,ME.id);}})();
var PLAN=null;
/* Nhật ký & số buổi tách riêng từng người. Hồ sơ đầu tiên trên máy giữ dữ liệu cũ. */
function K(base){return (ME&&!ME.legacy)?base+'::'+ME.id:base}

function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function vn(x){return numL(x)}
function mph(x){return vn(Math.round(x*2)/2)}
function yd5(x){return Math.round(x/5)*5}
function cm5(x){return Math.round(x/5)*5}
var YTS='https://www.youtube.com/results?search_query=';

/* ---------- Chuẩn fitting driver theo tốc độ đầu gậy (mph) ---------- */
var FLEX=['L','A','R','S','X'];
var FLEXN={L:'L (Ladies)',A:'A (Senior)',R:'R (Regular)',S:'S (Stiff)',X:'X (Extra stiff)'};
function flexFor(v){return v<65?'L':v<80?'A':v<95?'R':v<110?'S':'X'}
function shaftFor(v){return v<75?[40,50]:v<90?[50,60]:v<105?[55,65]:[60,75]}
function loftFor(v){return v<75?[12,14]:v<85?[10.5,12.5]:v<95?[10,11.5]:v<105?[9,10.5]:[8,10]}
function lenFor(h){return h<160?[44,44.75]:h<175?[44.5,45.5]:h<188?[45,45.75]:[45.5,46.25]}
var GRIPFOR={S:['under','std'],M:['std'],ML:['std','mid'],L:['mid'],XL:['mid','jumbo']};
var GRIPN={under:'Undersize',std:'Standard',mid:'Midsize',jumbo:'Jumbo'};
/* Cửa sổ launch / spin tối ưu (tham chiếu bảng tối ưu hóa TrackMan) */
function launchWin(v){v=clamp(v,55,130);var c=16-(v-80)*.12;return [Math.round(c-1.5),Math.round(c+1.5)]}
function spinWin(v){v=clamp(v,55,130);var c=2800-(v-80)*20;return [Math.max(1800,Math.round((c-250)/100)*100),Math.round((c+250)/100)*100]}
function aoaWin(v){return v<85?[1,4]:[3,5]}
function rng(a,u){return vn(a[0])+'–'+vn(a[1])+(u||'')}
function num(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,LANG==='en'?',':'.')}

var SPORTS={none:null,pickleball:'🏓 Pickleball',tennis:'🎾 Tennis',badminton:L('🏸 Cầu lông','🏸 Badminton'),football:L('⚽ Bóng đá','⚽ Soccer'),run:L('🏃 Chạy bộ','🏃 Running'),swim:L('🏊 Bơi','🏊 Swimming')};
var JUMPY={pickleball:1,tennis:1,badminton:1,football:1};

/* ---------- Tính toàn bộ chỉ số cá nhân ---------- */
function computePlan(p){
  var P={notes:[],alerts:[],lefty:p.hand==='l'}, inj=p.inj||{};
  P.bmi=p.w/Math.pow(p.h/100,2);
  P.bmiCat=P.bmi<18.5?L('thiếu cân','underweight'):P.bmi<23?L('bình thường','normal'):P.bmi<25?L('thừa cân','overweight'):P.bmi<30?L('béo phì độ I','obese class I'):L('béo phì độ II','obese class II');
  P.plyoRisk=!!(inj.knee||inj.heart||P.bmi>=30||p.age>=60);

  /* Hiệu suất cự ly (yard carry / mph) — hồ sơ không có số đo thì suy từ handicap / kinh nghiệm */
  var hasH=p.hcp!==null&&p.hcp!==undefined&&p.hcp!=='';
  var kDef=hasH?(p.hcp<10?2.4:p.hcp<=20?2.3:2.2):({new:2.15,y13:2.25,y310:2.3,gt10:2.35}[p.golf]||2.25);
  var v0,est=false;
  if(p.cs) v0=p.cs;
  else if(p.bs){v0=p.bs/1.42;est=true}
  else if(p.carry){v0=p.carry/kDef;est=true}
  else {v0=(p.total||200)/1.1/kDef;est=true}
  v0=clamp(v0,40,135);
  var k0=p.carry?clamp(p.carry/v0,1.8,2.65):p.total?clamp(p.total/1.1/v0,1.8,2.65):kDef;
  P.smash0=(p.cs&&p.bs)?p.bs/p.cs:null;

  /* Mức tăng tốc 12 tháng: người chưa tập tạ tăng nhanh nhất; tuổi, số buổi, chấn thương kéo xuống */
  var gG={none:.15,lt1:.12,y13:.09,gt3:.07}[p.gym]||.1;
  if(p.golf==='new') gG+=.03;
  var fA=p.age<30?1.05:p.age<45?1:p.age<55?.85:p.age<65?.7:.55;
  var fD={3:.8,4:.92,5:1}[p.days]||1;
  var nInj=['back','knee','shoulder','elbow'].filter(function(k){return inj[k]}).length;
  P.gain=clamp(gG*fA*fD*(nInj?.9:1)*(inj.heart?.85:1),.04,.22);
  var v12=Math.min(v0*(1+P.gain),130);
  P.v0=v0; P.v12=v12; P.est=est; P.k0=k0; P.k1=clamp(k0+.18,k0,2.52);
  /* đường cong theo chu kỳ: nhanh ở GĐ nền tảng–công suất, chậm dần ở vòng 2 */
  P.months=[.21,.30,.39,.48,.58,.67,.73,.79,.85,.91,1,1].map(function(f){return v0+(v12-v0)*f});
  P.v6=P.months[5];
  P.car0=p.carry?yd5(p.carry):yd5(v0*k0);
  P.tot0=p.total?yd5(p.total):yd5(v0*k0*1.1);
  var k6=k0+(P.k1-k0)*.7;
  P.car6=yd5(P.v6*k6); P.tot6=yd5(P.v6*k6*1.1);
  P.car12=yd5(v12*P.k1); P.tot12lo=yd5(v12*P.k1*1.07); P.tot12hi=yd5(v12*P.k1*1.15);
  P.tot12=yd5((P.tot12lo+P.tot12hi)/2);

  /* Hệ số tải tạ: cân nặng (allometric ^0,67) × kinh nghiệm × giới × tuổi. 72 kg, <1 năm tập = 1 */
  P.lf=clamp(Math.pow(p.w/72,.67)*({none:.8,lt1:1,y13:1.15,gt3:1.3}[p.gym]||1)*(p.sex==='f'?.65:1)*(p.age>=60?.8:p.age>=50?.9:1),.4,1.6);
  P.restAdd=(p.age>=50||inj.heart)?15:0;
  P.protein=Math.round(p.w*1.6/5)*5;
  P.water=vn(Math.round(p.w*.03*10)/10)+'–'+vn(Math.round(p.w*.035*10)/10)+' L';

  /* Cảnh báo an toàn */
  if(inj.heart) P.alerts.push(['b',L('<b>Tim mạch / huyết áp / tiểu đường:</b> xin ý kiến bác sĩ trước khi bắt đầu. Giáo án đã bỏ mọi bài bật nhảy, tăng thời gian nghỉ. Thở ra khi đẩy/kéo, không nín thở khi gắng sức.','<b>Heart / blood pressure / diabetes:</b> get your doctor\'s OK before you start. The program drops all jumping exercises and lengthens rest periods. Breathe out as you push/pull — never hold your breath under strain.')]);
  if(p.age>=65) P.alerts.push(['b',L('<b>Trên 65 tuổi:</b> nên kiểm tra sức khỏe tổng quát trước chương trình. 2 tuần đầu chỉ dùng 70% mức tạ gợi ý.','<b>Over 65:</b> get a general health check before starting the program. For the first 2 weeks use only 70% of the suggested weights.')]);
  if(inj.back||inj.knee||inj.shoulder||inj.elbow) P.alerts.push(['b',L('<b>Có vùng đau:</b> các bài gây tải lên vùng đó đã được thay. Đau nhói (khác mỏi) → dừng bài ngay. Nếu đang điều trị, nhờ chuyên gia vật lý trị liệu duyệt giáo án.','<b>Pain areas:</b> exercises that load those areas have been replaced. Sharp pain (not fatigue) → stop the exercise right away. If you\'re in treatment, have a physical therapist review the program.')]);
  if(P.bmi>=30&&!inj.heart) P.alerts.push(['b','<b>BMI '+vn(P.bmi.toFixed(1))+':</b> '+L('bài bật nhảy được thay bằng bài không va chạm để bảo vệ gối và cổ chân.','jumping exercises are replaced with low-impact ones to protect your knees and ankles.')]);
  if(p.eq==='min') P.alerts.push(['i',L('<b>Chỉ có dây kháng lực:</b> GĐ1 tập đầy đủ được. Từ GĐ2 (tháng 2) cần tạ — nên đăng ký phòng gym hoặc mua tạ đơn điều chỉnh + 1 quả kettlebell.','<b>Resistance bands only:</b> Phase 1 works in full. From Phase 2 (month 2) you\'ll need weights — join a gym or buy adjustable dumbbells + 1 kettlebell.')]);
  if(est) P.alerts.push(['i',L('<b>Tốc độ đang là ước tính</b> từ ','<b>Your speed is an estimate</b> from ')+(p.bs?'ball speed':p.carry?L('cự ly carry','carry distance'):L('cự ly tổng','total distance'))+L('. Đo thật ở Buổi D đầu tiên rồi cập nhật hồ sơ để mốc tiến độ chính xác hơn.','. Measure it for real in your first Session D, then update your profile so your milestones are more accurate.')]);
  return P;
}

/* ---------- Đổi mức tạ trong chuỗi chữ theo hệ số của từng người ---------- */
function scaleKg(s,kind){
  if(!s||!PLAN||!kind) return s;
  var f=kind==='mb'?1+(PLAN.lf-1)*.5:PLAN.lf;
  var st={db:2,kb:4,bb:5,mb:1}[kind], mn={db:2,kb:4,bb:20,mb:1}[kind];
  function R(x){var v=Math.max(mn,Math.round(x*f/st)*st);return kind==='mb'?Math.min(v,6):v}
  function N(x){return +String(x).replace(',','.')}
  return s.replace(/(\d+(?:,\d+)?)(\s*(?:–|→)\s*)(\d+(?:,\d+)?)(\s*kg)|(\d+(?:,\d+)?)(\s*kg)/g,function(m,a,sep,b,kg,c,kg2){
    if(a){var A=R(N(a)),B=R(N(b)); if(B<=A) B=(kind==='mb'&&A>=6)?A:A+st; return A===B?A+kg:A+sep+B+kg}
    return R(N(c))+kg2;
  });
}
/* Người thuận tay trái: đảo mọi chỉ dẫn trái/phải về cơ thể */
function lr(s){
  if(LANG==='en') return String(s).replace(/\b(left|right)(?=[ -](?:heel|shoulder|foot|feet|leg|hand|arm|hip|side|elbow|wrist|thigh|knee)s?\b)/gi,function(w){
    var o=w.toLowerCase()==='left'?'right':'left';
    return w===w.toUpperCase()?o.toUpperCase():w.charAt(0)===w.charAt(0).toUpperCase()?o.charAt(0).toUpperCase()+o.slice(1):o});
  return String(s).replace(/(gót|vai|chân|tay|hông|bên|khuỷu|cổ tay|đùi) (trái|phải)/gi,function(m,a,b){return a+' '+(b.toLowerCase()==='trái'?'phải':'trái')})}

var LOADKIND={'Goblet Squat':'db','Kettlebell Swing':'kb','Bulgarian Split Squat':'db','Med Ball Rotational Throw':'mb','Med Ball Scoop Toss':'mb',
  'Romanian Deadlift':'db','Push-up':'db','Single-arm DB Row':'db','Med Ball Slam':'mb','Lateral Lunge + Farmer Carry':'db'};

/* ---------- Điều chỉnh 4 buổi tập GĐ1 ---------- */
function tweakSessions(p,P){
  var inj=p.inj||{}, eq=p.eq, S=JSON.parse(JSON.stringify(SESSIONS));
  var FO={A:0,B:5,C:10,D:15};
  S.forEach(function(s){s.ex.forEach(function(e,n){e.fig=FO[s.id]+n; e.ld=LOADKIND[e.k||e.name]||''})});
  var PRE=[]; if(inj.back) PRE.push(L('Bird dog ×6/bên','Bird dog ×6/side'),'McGill curl-up ×5'); if(inj.knee) PRE.push(L('Band walk ngang ×10/bên','Lateral band walk ×10/side'));
  if(inj.shoulder) PRE.push('Band pull-apart ×15'); if(inj.elbow) PRE.push(L('Gập cổ tay eccentric ×15','Eccentric wrist curl ×15'));
  if(PRE.length){S.forEach(function(s){s.warm=s.warm.concat(PRE.map(function(x){return '🛡 '+x}))});
    P.notes.push(L('Khởi động mọi buổi thêm bài phòng chấn thương: <b>','Add injury-prevention drills to every warm-up: <b>')+PRE.join(', ')+'</b>.')}
  function get(sid){return S.filter(function(x){return x.id===sid})[0]}
  function swap(sid,name,o,why){
    var s=get(sid); if(!s) return;
    for(var i=0;i<s.ex.length;i++) if((s.ex[i].k||s.ex[i].name)===name){
      var e=s.ex[i], n=JSON.parse(JSON.stringify(e)), k;
      for(k in o) if(k!=='q'&&k!=='keepV') n[k]=o[k];
      if(!('fig' in o)) n.fig=null;
      if(!o.keepV&&!o.vids) n.vids=[{t:L('Tìm video mẫu: ','Find a demo video: ')+n.name,u:YTS+encodeURIComponent(o.q||n.name)}];
      n.orig=e.name; n.why=why;
      s.ex[i]=n;
      P.notes.push(L('Buổi ','Session ')+sid+': <b>'+esc(e.name)+'</b> → <b>'+esc(n.name)+'</b> — '+why+'.');
      return;
    }
  }
  function addNote(sid,name,txt){var s=get(sid);s.ex.forEach(function(e){if((e.k||e.name)===name)e.note=(e.note||'')+' '+txt})}
  var minEq=eq==='min', h=p.h;

  /* Buổi A */
  if(inj.knee) swap('A','Goblet Squat',{k:'Box Squat (ngồi chạm ghế)',name:L('Box Squat (ngồi chạm ghế)','Box Squat (touch a bench)'),kg:minEq?L('Balo 6–12 kg','Backpack 6–12 kg'):'10–16 kg',ld:minEq?'':'db',fig:0,keepV:1,
    note:L('Ngồi chạm nhẹ ghế cao ngang gối rồi đứng lên — giới hạn biên độ trong vùng không đau, gối hướng theo mũi chân.','Sit back to lightly touch a knee-high bench, then stand up — keep the range pain-free, knees tracking over your toes.')},L('giới hạn biên độ để bảo vệ gối','limited range to protect the knee'));
  else if(minEq) swap('A','Goblet Squat',{k:'Goblet Squat với balo',name:L('Goblet Squat với balo','Backpack Goblet Squat'),kg:L('Balo 6–12 kg (sách, bình nước)','Backpack 6–12 kg (books, water bottles)'),ld:'',fig:0,keepV:1,
    note:L('Ôm balo trước ngực, ngồi sâu, gót bám sàn. Xuống chậm 3 giây để bù tải nhẹ.','Hug the backpack to your chest, sit deep, heels down. Take 3 seconds on the way down to make up for the light load.')},L('không có tạ','no weights'));
  if(inj.back||minEq) swap('A','Kettlebell Swing',{k:'Band Pull-through',name:'Band Pull-through',rx:'3 × 12',kg:L('Dây kháng lực nặng buộc thấp','Heavy resistance band anchored low'),ld:'',q:'band pull through',
    note:L('Đẩy hông ra sau rồi siết mông đứng thẳng — cùng mẫu bùng nổ hông như KB swing nhưng không dồn tải lên cột sống.','Push your hips back, then squeeze your glutes to stand tall — the same explosive hip pattern as the KB swing without loading the spine.')},inj.back?L('bảo vệ lưng dưới','protect the lower back'):L('không có kettlebell','no kettlebell'));
  if(inj.knee) swap('A','Bulgarian Split Squat',{k:'Reverse Lunge biên độ ngắn',name:L('Reverse Lunge biên độ ngắn','Short-range Reverse Lunge'),kg:minEq?L('Bodyweight · mỗi chân','Bodyweight · each leg'):L('2 × 6–10 kg · mỗi chân','2 × 6–10 kg · each leg'),ld:minEq?'':'db',q:'short range reverse lunge',
    note:L('Bước lùi, hạ gối sau vừa đủ trong vùng không đau; ống chân trước gần thẳng đứng để giảm tải gối.','Step back and lower the back knee only as far as is pain-free; keep the front shin near vertical to take load off the knee.')},L('giảm tải khớp gối','less load on the knee'));
  else {
    var bs=get('A').ex.filter(function(e){return (e.k||e.name)==='Bulgarian Split Squat'})[0];
    if(bs){ bs.note=bs.note.replace('~45 cm','~'+cm5(45*h/170)+' cm'); if(minEq){bs.kg=L('Bodyweight → balo · mỗi chân','Bodyweight → backpack · each leg');bs.ld=''} }
  }
  if(P.plyoRisk){
    var b0=cm5(30*h/170);
    swap('A','Box Jump',{k:'Step-up bùng nổ',name:L('Step-up bùng nổ','Explosive Step-up'),rx:L('3 × 5 / chân','3 × 5 / leg'),kg:L('Bục ','Box ')+b0+'–'+(b0+10)+' cm · bodyweight',ld:'',q:'explosive step up',
      note:L('Đạp mạnh chân trên bục để đứng lên nhanh, bước xuống chậm — phát lực thân dưới mà không có va chạm khi tiếp đất.','Drive hard through the foot on the box to stand up fast, step down slowly — lower-body power with no landing impact.')},
      inj.knee?L('bảo vệ gối','protect the knee'):inj.heart?L('tránh gắng sức đột ngột','avoid sudden all-out effort'):P.bmi>=30?L('tránh va chạm tiếp đất khi BMI cao','avoid landing impact at a high BMI'):L('an toàn khớp sau 60 tuổi','joint safety after 60'));
  } else {
    var bj=get('A').ex.filter(function(e){return (e.k||e.name)==='Box Jump'})[0];
    var b1=cm5(40*h/170*(p.gym==='none'?.85:1)); if(bj) bj.kg=L('Bục ','Box ')+b1+'–'+(b1+10)+' cm';
  }

  /* Buổi B */
  if(minEq){
    swap('B','Med Ball Rotational Throw',{k:'Band Rotation nhanh',name:L('Band Rotation nhanh','Fast Band Rotation'),kg:L('Dây kháng lực TB · mỗi bên','Medium resistance band · each side'),ld:'',q:'banded rotation golf power',
      note:L('Buộc dây ngang hông. Xoay hông trước, thân trên theo sau kéo dây thật nhanh — thay ném bóng khi chưa có med ball.','Anchor the band at hip height. Turn the hips first, let the upper body follow and pull the band fast — replaces the throw until you have a med ball.')},L('chưa có med ball','no med ball yet'));
    swap('B','Med Ball Scoop Toss',{k:'Band Chop thấp → cao',name:L('Band Chop thấp → cao','Low-to-High Band Chop'),kg:L('Dây kháng lực TB · mỗi bên','Medium resistance band · each side'),ld:'',q:'band low to high chop',
      note:L('Kéo dây chéo từ hông thấp lên qua vai đối diện — đúng quỹ đạo lực của driver.','Pull the band diagonally from low at the hip up past the opposite shoulder — the same force path as a driver swing.')},L('chưa có med ball','no med ball yet'));
  }
  if(inj.back) addNote('B',minEq?'Band Rotation nhanh':'Med Ball Rotational Throw',L('⚠ Lưng: bóng/dây nhẹ, 70% lực, dừng nếu đau.','⚠ Back: light ball/band, 70% effort, stop if it hurts.'));
  if(inj.elbow&&!minEq) addNote('B','Med Ball Rotational Throw',L('⚠ Khuỷu/cổ tay: dùng bóng nhẹ nhất, ném bằng thân chứ không bằng tay.','⚠ Elbow/wrist: use the lightest ball and throw with your body, not your arms.'));
  if(inj.shoulder) swap('B','Side Plank + Open Book',{k:'Side Plank chống gối + Open Book',name:L('Side Plank chống gối + Open Book','Knee Side Plank + Open Book'),fig:9,keepV:1,
    note:L('Chống gối để giảm tải vai; mở khớp ngực trong biên độ không đau.','Support on your knee to take load off the shoulder; open up the thoracic spine within a pain-free range.')},L('giảm tải khớp vai','less load on the shoulder'));

  /* Buổi C */
  if(inj.back) swap('C','Romanian Deadlift',{k:'DB Hip Thrust',name:'DB Hip Thrust',rx:'3 × 10',kg:minEq?L('Balo trên hông','Backpack on hips'):L('1 × 14–20 kg trên hông','1 × 14–20 kg on hips'),ld:minEq?'':'db',fig:4,q:'dumbbell hip thrust',
    note:L('Chuỗi cơ sau khỏe mà không gập cột sống dưới tải. Siết mông 1 giây ở đỉnh.','Builds the posterior chain without bending the spine under load. Squeeze the glutes for 1 second at the top.')},L('không gập lưng dưới tải','no spinal flexion under load'));
  else if(minEq) swap('C','Romanian Deadlift',{k:'Single-leg RDL (bodyweight)',name:'Single-leg RDL (bodyweight)',rx:L('3 × 8 / chân','3 × 8 / leg'),kg:L('Bodyweight → balo','Bodyweight → backpack'),ld:'',q:'single leg romanian deadlift',
    note:L('Gập hông trên một chân, lưng thẳng — chuỗi cơ sau và thăng bằng, không cần tạ.','Hinge at the hip on one leg with a flat back — posterior chain and balance, no weights needed.')},L('không có tạ','no weights'));
  if(inj.shoulder) swap('C','Push-up',{k:'Push-up nghiêng (tay chống ghế)',name:L('Push-up nghiêng (tay chống ghế)','Incline Push-up (hands on a bench)'),kg:'Bodyweight',ld:'',fig:11,keepV:1,
    note:L('Tay đặt cao giảm tải khớp vai; khuỷu ~45° so với thân, dừng trước điểm đau.','Raised hands take load off the shoulder; elbows ~45° from the body, stop short of pain.')},L('giảm tải khớp vai','less load on the shoulder'));
  if(minEq) swap('C','Single-arm DB Row',{k:'Band Row',name:'Band Row',kg:L('Dây kháng lực TB–nặng','Medium–heavy resistance band'),ld:'',q:'resistance band row',
    note:L('Kéo dây về sườn bằng cơ xô, khuỷu men sát thân, siết bả vai 1 giây.','Pull the band to your ribs with your lats, elbows close to the body, squeeze the shoulder blades for 1 second.')},L('không có tạ','no weights'));
  if(inj.back||inj.shoulder||minEq){
    var alt=minEq?{k:(P.plyoRisk||inj.back||inj.shoulder)?'Band Chest Press nhanh':'Squat Jump',name:(P.plyoRisk||inj.back||inj.shoulder)?L('Band Chest Press nhanh','Fast Band Chest Press'):'Squat Jump',kg:L('Dây kháng lực TB / bodyweight','Medium resistance band / bodyweight'),ld:'',q:'band chest press explosive',
                   note:L('Phát lực toàn thân thật nhanh ở mỗi rep, về chậm có kiểm soát.','Drive full-body power fast on every rep, return slowly under control.')}
                 :{k:'Med Ball Chest Pass vào tường',name:L('Med Ball Chest Pass vào tường','Med Ball Chest Pass to the wall'),kg:L('Bóng 2–3 kg','Ball 2–3 kg'),ld:'mb',q:'medicine ball chest pass wall',
                   note:L('Đẩy bóng từ ngực vào tường hết tốc — phát lực toàn thân mà không gập lưng, không vung tay qua đầu.','Push the ball from your chest into the wall at full speed — full-body power with no back bending and no overhead arm swing.')};
    swap('C','Med Ball Slam',alt,inj.back?L('bảo vệ lưng dưới','protect the lower back'):inj.shoulder?L('không vung tay qua đầu','no overhead arm swing'):L('chưa có med ball','no med ball yet'));
  }
  var ll=get('C').ex.filter(function(e){return (e.k||e.name)==='Lateral Lunge + Farmer Carry'})[0];
  if(ll){
    if(inj.knee){ll.orig=ll.name;ll.why=L('giảm tải khớp gối','less load on the knee');ll.k='Lateral Band Walk + Farmer Carry';ll.name='Lateral Band Walk + Farmer Carry';ll.kg=L('Dây quanh gối · + 2 × 30 m với 2×20–24 kg','Band around knees · + 2 × 30 m with 2×20–24 kg');ll.fig=null;
      P.notes.push(L('Buổi C: <b>Lateral Lunge</b> → <b>Lateral Band Walk</b> — giảm tải khớp gối.','Session C: <b>Lateral Lunge</b> → <b>Lateral Band Walk</b> — less load on the knee.'))}
    if(minEq){ll.kg=inj.knee?L('Dây quanh gối · + 2 × 30 m xách balo','Band around knees · + 2 × 30 m carrying a backpack'):L('Bodyweight · + 2 × 30 m xách balo/túi nước','Bodyweight · + 2 × 30 m carrying a backpack/water bags');ll.ld=''}
    if(inj.elbow) ll.note+=L(' ⚠ Khuỷu/cổ tay: giảm 30% tạ khi xách, dừng nếu đau mặt trong khuỷu.',' ⚠ Elbow/wrist: carry 30% less weight, stop if the inside of the elbow hurts.');
  }

  /* Buổi D */
  var D=get('D');
  D.ex.forEach(function(e){
    if((e.k||e.name)==='Overspeed'){
      if(inj.shoulder||inj.elbow||inj.back||p.age>=60){e.rx='2 × 5';e.adj=L('Giảm từ 3 × 5 — ','Reduced from 3 × 5 — ')+(p.age>=60?L('phù hợp tuổi','age-appropriate'):L('bảo vệ vùng đang đau','protects the sore area'));P.notes.push(L('Buổi D: Overspeed giảm còn <b>2 × 5</b> — ','Session D: Overspeed cut to <b>2 × 5</b> — ')+(p.age>=60?L('phù hợp tuổi','age-appropriate'):L('bảo vệ vùng đang đau','protects the sore area'))+'.')}
      if(p.golf==='new') e.note+=L(' Mới chơi golf: 2 tuần đầu chỉ swing 80% lực, giữ thăng bằng ở tư thế kết thúc.',' New to golf: swing at only 80% for the first 2 weeks and hold your balance in the finish.');
    }
    if((e.k||e.name)==='Driver — đo mph'){
      if(p.dev==='none'){e.k='Driver — đo tốc độ';e.name=L('Driver — đo tốc độ','Driver — measure speed');e.note=L('Chưa có thiết bị: dùng radar cầm tay/app đo tốc độ, hoặc ghi carry trung bình 5 cú rồi quy đổi (carry ÷ ','No device yet: use a handheld radar or a speed app, or log the average carry of 5 shots and convert (carry ÷ ')+vn(P.k0.toFixed(1))+L(' ≈ mph). Chỉ nhìn con số, đừng nhìn hướng bóng.',' ≈ mph). Watch only the number, not where the ball goes.')}
      else if(p.dev==='radar') e.note+=L(' Đặt radar cùng một vị trí sau bóng mỗi lần đo để số liệu so sánh được.',' Put the radar in the same spot behind the ball every time so the numbers are comparable.');
    }
  });

  /* Tải tạ + thời gian nghỉ */
  S.forEach(function(s){s.ex.forEach(function(e){
    e.kg=scaleKg(e.kg,e.ld);
    if(P.restAdd&&e.rest>=60) e.rest+=P.restAdd;
    if(P.lefty){e.note=lr(e.note);}
  })});
  if(Math.abs(P.lf-1)>.04) P.notes.push(L('Mọi mức tạ nhân hệ số <b>×','All loads are multiplied by <b>×')+vn(P.lf.toFixed(2))+L('</b> (cân nặng ','</b> (body weight ')+p.w+' kg, '+({none:L('chưa tập tạ','no lifting yet'),lt1:L('tập tạ < 1 năm','lifting < 1 year'),y13:L('tập tạ 1–3 năm','lifting 1–3 years'),gt3:L('tập tạ > 3 năm','lifting > 3 years')}[p.gym])+(p.sex==='f'?L(', nữ',', female'):'')+(p.age>=50?', '+(LANG==='en'?'age '+p.age:p.age+' tuổi'):'')+L(') và làm tròn theo bước tạ thực tế (tạ đơn 2 kg, kettlebell 4 kg).',') and rounded to real-world weight steps (dumbbells 2 kg, kettlebells 4 kg).'));
  if(P.restAdd) P.notes.push(L('Thời gian nghỉ các bài nặng <b>+','Rest on heavy exercises <b>+')+P.restAdd+L(' giây</b> để nhịp tim hồi phục đủ.',' s</b> so your heart rate recovers fully.'));

  /* Lịch 3–4 buổi: gộp Buổi B (core) vào A và C */
  var sp=SPORTS[p.sport];
  if(p.days<5){
    var B=get('B'), pal=JSON.parse(JSON.stringify(B.ex[2])), rot=JSON.parse(JSON.stringify(B.ex[0]));
    pal.rx='2 × 10'; rot.rx='3 × 6';
    pal.adj=rot.adj=L('Chuyển từ Buổi B (lịch '+p.days+' buổi/tuần)','Moved from Session B ('+p.days+'-session week)'); delete pal.orig; delete rot.orig;
    get('A').ex.push(pal); get('C').ex.push(rot);
    get('A').dur="45'"; get('C').dur="45'";
    S=S.filter(function(s){return s.id!=='B'});
    P.notes.push(L('Lịch '+p.days+' buổi/tuần: gộp Buổi B vào A (<b>','With '+p.days+' sessions/week: Session B is merged into A (<b>')+esc(pal.name)+L('</b>) và C (<b>','</b>) and C (<b>')+esc(rot.name)+L('</b>) để core xoay vẫn được tập 2 lần/tuần.','</b>) so rotational core still gets trained twice a week.'));
  }
  get('A').day=L('Thứ 2','Monday');
  get('C').day=p.days===5?L('Thứ 6','Friday'):p.days===4?L('Thứ 5','Thursday'):L('Thứ 4','Wednesday');
  if(p.days===3){var sb=swingBlocks(p,P)[0];
    D.ex.push({k:'Kỹ thuật 15′ — khối riêng',name:L('Kỹ thuật 15′ — khối riêng','Technique 15′ — separate block'),rx:L('1 khối','1 block'),kg:sb.n+' · '+sb.dose.replace('10 bóng','6 bóng').replace('10 balls','6 balls'),rest:0,fig:null,vids:[],
      adj:L('Buổi Swing kỹ thuật gộp vào đây (lịch 3 buổi)','Swing technique session merged in here (3-session week)'),note:sb.how+L('. Đạt khi: ','. Pass when: ')+sb.chk+L('. Còn thời gian thì làm khối 1 của tuần trong Giáo án Swing.','. If you have time left, do block 1 of the week from the Swing program.')});}
  if(p.days===3){D.dur="45'";D.title=L('Speed + kỹ thuật','Speed + technique');D.goal=L('30\' tốc độ tối đa, sau đó 15\' kỹ thuật chậm theo Giáo án Swing của tuần.',"30' of max speed, then 15' of slow technique work from this week's Swing program.");
    P.notes.push(L('Lịch 3 buổi: buổi Swing kỹ thuật gộp vào <b>Thứ 7</b> — 15\' sau phần Speed, chỉ 1 khối của tuần.',"3-session week: the Swing technique session moves to <b>Saturday</b> — 15' after the Speed work, just 1 block of the week."))}

  /* Lịch tuần */
  if(p.dev!=='lm'){D.title=L('Speed & đo tốc độ','Speed & speed testing')}
  var R0={t:L("Nghỉ / mobility 15'","Rest / mobility 15'"),tag:L('phục hồi','recovery'),rest:1,name:L('Nghỉ / Mobility nhẹ 15 phút','Rest / light mobility 15 min'),link:'#nguyentac'};
  var SW={t:L('🎯 Swing · Kỹ thuật','🎯 Swing · Technique'),tag:"45'",name:L('🎯 Swing · Kỹ thuật','🎯 Swing · Technique')+(p.dev==='lm'?L(' trên monitor',' on the monitor'):'')+" (45')",link:'#swing'};
  function G(id){var s=get(id);return {t:(id==='D'?'⚡ ':'')+L('Buổi ','Session ')+id+' · '+s.title,tag:s.dur,s:id,name:(id==='D'?'⚡ ':'')+L('Buổi ','Session ')+id+' · '+s.title+' ('+s.dur+')',link:'#theluc'}}
  var SPD=sp?{t:sp,tag:L('tự do','free play'),name:sp+L(' — giữ nhịp vận động',' — stay active'),link:'#nguyentac'}:R0;
  var W={0:R0};
  if(p.days===5){W[1]=G('A');W[2]=SW;W[3]=G('B');W[4]=SPD;W[5]=G('C');W[6]=G('D')}
  else if(p.days===4){W[1]=G('A');W[2]=SW;W[3]=SPD;W[4]=G('C');W[5]=R0;W[6]=G('D')}
  else {W[1]=G('A');W[2]=R0;W[3]=G('C');W[4]=SPD;W[5]=R0;W[6]=G('D')}
  P.week=W;
  return S;
}

/* ---------- Điều chỉnh bảng thay đổi GĐ2–GĐ4 ---------- */
function tweakChanges(p,P){
  var inj=p.inj||{}, C=JSON.parse(JSON.stringify(CHANGES)), gym=p.eq==='gym', h=p.h;
  var k2=['bb','bb','kb','','db','db',''], k3=['','','mb','',''];
  C.ph2.forEach(function(c,i){c.k=k2[i]}); C.ph3.forEach(function(c,i){c.k=k3[i]});
  var a=C.ph2;
  if(inj.back){a[0]={b:'A',w:L('Goblet Squat → <b>Split Squat nặng tạ đơn</b> (thay deadlift — bảo vệ lưng)','Goblet Squat → <b>Heavy DB Split Squat</b> (instead of deadlift — protects the back)'),d:L('4 × 6 / chân · 2 × 12–18 kg','4 × 6 / leg · 2 × 12–18 kg'),k:'db'}}
  else if(!gym){a[0]={b:'A',w:L('Goblet Squat → <b>RDL nặng tạ đơn</b> (chưa có trap bar)','Goblet Squat → <b>Heavy DB RDL</b> (no trap bar yet)'),d:'4 × 6 · 2 × 20–28 kg',k:'db'}}
  if(!gym){a[1].d=L('3 × 10 · tạ đơn 20–32 kg đặt trên hông','3 × 10 · 20–32 kg dumbbell on the hips');a[1].k='db'}
  if(inj.back||p.eq==='min'){a[2]={b:'A',w:L('Band Pull-through → dây nặng hơn, tốc độ nhanh hơn','Band Pull-through → heavier band, faster tempo'),d:L('4 × 12 · kiểm soát lưng trung tính','4 × 12 · hold a neutral spine'),k:''}}
  if(inj.shoulder){a[4]={b:'C',w:'Push-up → <b>'+(gym?L('Landmine Press 1 tay','Single-arm Landmine Press'):'DB Floor Press')+L('</b> (thân thiện với vai)','</b> (shoulder-friendly)'),d:gym?L('4 × 8 / bên · đĩa 10–20 kg','4 × 8 / side · 10–20 kg plate'):'4 × 8 · 2 × 14–20 kg',k:'db'}}
  if(inj.back){a[5]={b:'C',w:L('Row tăng tạ · giữ Hip Thrust thay RDL','Heavier Row · keep Hip Thrust instead of RDL'),d:'4 × 6 · Row 20–24 kg',k:'db'}}
  var c3=C.ph3;
  var heavy=inj.back?L('Hip Thrust nặng','Heavy Hip Thrust'):gym?L('Trap Bar DL nặng','Heavy Trap Bar DL'):L('RDL tạ đơn nặng','Heavy DB RDL');
  if(P.plyoRisk){
    c3[0]={b:'A',w:'<b>'+heavy+L('</b> → nghỉ 20s → <b>KB Swing bùng nổ</b>','</b> → rest 20s → <b>Explosive KB Swing</b>'),d:L('3 vòng: 3 rep nặng + 6 swing nhanh · nghỉ 2–3′ · không bật nhảy','3 rounds: 3 heavy reps + 6 fast swings · rest 2–3′ · no jumping'),k:''};
    c3[1]={b:'A',w:L('Step-up bùng nổ lên bục cao hơn','Explosive Step-up onto a higher box'),d:L('3 × 5 / chân · đạp nhanh lên, bước xuống chậm','3 × 5 / leg · drive up fast, step down slowly'),k:''};
  } else {
    if(heavy!==L('Trap Bar DL nặng','Heavy Trap Bar DL')) c3[0].w='<b>'+heavy+L('</b> → nghỉ 20s → <b>Broad Jump</b>','</b> → rest 20s → <b>Broad Jump</b>');
    var b=cm5(55*h/170); c3[1].w=L('Box Jump lên bục cao hơn (','Box Jump onto a higher box (')+b+'–'+(b+5)+' cm)';
  }
  if(p.eq==='min') c3[2]={b:'B',w:L('Band Rotation <b>dây nặng</b> + ngay sau đó <b>dây nhẹ</b> thật nhanh','Band Rotation with a <b>heavy band</b>, then straight to a <b>light band</b> as fast as possible'),d:L('3 vòng: 6 nặng + 6 nhẹ / bên','3 rounds: 6 heavy + 6 light / side'),k:''};
  else if(inj.shoulder||inj.elbow) c3[2].d=L('3 vòng: chỉ bóng nhẹ 2 kg, 6 ném / bên · ⚠ bỏ bóng nặng để bảo vệ ','3 rounds: light 2 kg ball only, 6 throws / side · ⚠ skip the heavy ball to protect the ')+(inj.elbow?L('khuỷu','elbow'):L('vai','shoulder'));
  if(inj.shoulder) c3[3]={b:'C',w:'<b>'+(gym?L('Landmine Press nhanh','Fast Landmine Press'):L('Floor Press nhanh','Fast Floor Press'))+L('</b> + Med Ball Chest Pass liền sau','</b> + Med Ball Chest Pass right after'),d:L('3 vòng: 3 đẩy + 5 chest pass · nghỉ 2′','3 rounds: 3 presses + 5 chest passes · rest 2′'),k:''};
  else if(inj.back) c3[3].w=L('<b>Push Press nhanh</b> + Med Ball Chest Pass liền sau','<b>Fast Push Press</b> + Med Ball Chest Pass right after');
  C.ph2.concat(C.ph3).forEach(function(c){c.d=scaleKg(c.d,c.k)});

  /* GĐ4/7: lịch tuần tốc độ theo số buổi */
  var sp=SPORTS[p.sport];
  var m1=L("Trap bar 3×3 @70% · KB swing 3×8 · Box jump 3×3 — 25′, ra về khi còn sung","Trap bar 3×3 @70% · KB swing 3×8 · Box jump 3×3 — 25′, leave while still fresh");
  if(inj.back) m1=m1.replace('Trap bar 3×3 @70%','Hip thrust 3×5').replace('KB swing 3×8','Band pull-through 3×10');
  else if(!gym) m1=m1.replace('Trap bar 3×3 @70%',L('RDL tạ đơn 3×5','DB RDL 3×5'));
  if(P.plyoRisk) m1=m1.replace('Box jump 3×3',L('Step-up nổ 3×3/chân','Explosive step-up 3×3/leg'));
  var m2=L("Push press 3×3 nhanh · Row 3×8 · Ném bóng nhẹ 3×5/bên — 25′","Push press 3×3 fast · Row 3×8 · Light ball throws 3×5/side — 25′");
  if(inj.shoulder) m2=m2.replace(L('Push press 3×3 nhanh','Push press 3×3 fast'),L('Landmine/Floor press 3×5 nhanh','Landmine/Floor press 3×5 fast'));
  var OS=C.ph4[1], TEST=C.ph4[5], SPR={b:p.days===4?'T4':'T5',w:sp||L('Nghỉ / mobility','Rest / mobility'),d:sp?(JUMPY[p.sport]?L('Giữ nguyên — chính là bài agility của giai đoạn này',"Keep it — it's your agility work for this phase"):L('Cường độ nhẹ–vừa, không tập nặng trước ngày Overspeed','Light–moderate intensity, nothing heavy the day before Overspeed')):L('Mobility 15′ + đi bộ 30′','Mobility 15′ + 30′ walk')};
  var REST={b:'CN',w:L('Nghỉ tuyệt đối','Complete rest'),d:L('Ngủ bù, đi bộ nhẹ','Catch up on sleep, easy walk')};
  if(p.days===5){C.ph4[0].d=m1;C.ph4[4].d=m2;C.ph4[3]=SPR}
  else if(p.days===4) C.ph4=[{b:'T2',w:L('Thể lực duy trì #1','Maintenance strength #1'),d:m1},OS,SPR,{b:'T6',w:L('Thể lực duy trì #2 + core','Maintenance strength #2 + core'),d:m2.replace(' — 25′',' · Pallof 2×10 — 30′')},TEST,REST];
  else C.ph4=[{b:'T2',w:L('Thể lực duy trì (gộp)','Maintenance strength (combined)'),d:m1.replace(L(' — 25′, ra về khi còn sung',' — 25′, leave while still fresh'),'')+' · '+m2.split(' — ')[0]+' — 35′'},{b:'T4',w:OS.w,d:OS.d,v:OS.v},SPR,TEST,REST];
  ['ph2','ph3','ph4'].forEach(function(k){C[k].forEach(function(c){
    if(!CHANGES[k].some(function(o){return o.b===c.b&&o.w===c.w&&o.d===c.d})) c.me=1;
  })});
  return C;
}

/* ---------- Khối kỹ thuật riêng — chèn thẳng vào Giáo án Swing ---------- */
function swingBlocks(p,P){
  var B=[], heel=L(P.lefty?'phải':'trái','lead'), lm=p.dev==='lm', spw=spinWin(P.v0);
  var VI=[]; ['fo','dtl'].forEach(function(k){var x=p.video&&p.video[k];if(x&&x.issues) x.issues.forEach(function(i){VI.push({c:i.code,s:i.sev,d:x.d})})});
  VI.sort(function(a,b){return b.s-a.s}).forEach(function(x){var I=ISSUES[x.c];
    if(I&&!B.some(function(b){return b.code===x.c})) B.push({code:x.c,n:I.n+L(' (từ video ',' (from video ')+x.d+')',how:I.how,dose:I.dose,chk:I.chk})});
  if(p.golf==='new') B.push({n:L('Nền tảng: setup + tempo','Foundation: setup + tempo'),how:L('Đọc Setup checklist trước mỗi bóng, đếm nhịp 3:1, 80% lực','Run through the Setup checklist before every ball, count a 3:1 tempo, 80% effort'),dose:L('10 bóng','10 balls'),chk:L('đủ 4 điểm checklist ở mọi bóng','all 4 checklist points on every ball')});
  if((p.aoa!=null&&p.aoa<0)||p.miss==='low') B.push({n:L('Đánh lên — attack angle dương','Hit up — positive attack angle'),how:L('Tee cao hơn 1 nấc, bóng ngang gót '+heel+', vai sau thấp, cột sống nghiêng về sau','Tee one notch higher, ball off the '+heel+' heel, trail shoulder low, spine tilted away from the target'),dose:L('10 bóng','10 balls'),chk:lm?L('AoA ≥ 0° ở 7/10 bóng, tiến tới +3°','AoA ≥ 0° on 7/10 balls, working toward +3°'):L('tee bay về phía trước (không cắm xuống) ở 7/10 bóng','tee flies forward (not driven down) on 7/10 balls')});
  if(p.miss==='slice') B.push({n:L('Sửa slice — cổng 2 tee','Fix the slice — 2-tee gate'),how:L('Cắm 2 tee tạo cổng phía trước bóng, hơi chếch ra ngoài đường mục tiêu; swing từ trong ra đi qua cổng, mặt gậy khép nhẹ','Set 2 tees as a gate just ahead of the ball, angled slightly outside the target line; swing in-to-out through the gate with a slightly closed clubface'),dose:L('10 bóng','10 balls'),chk:lm?L('face-to-path −2° → +2°, bóng cong < 15 yd','face-to-path −2° → +2°, curve < 15 yd'):L('7/10 bóng không cong ra ngoài','no slice curve on 7/10 balls')});
  if(p.miss==='hook') B.push({n:L('Kiểm soát hook — hold-off finish','Control the hook — hold-off finish'),how:L('Grip trung tính (thấy 2 khớp tay trên), thân xoay liên tục qua impact, finish với mặt gậy hướng lên trời','Neutral grip (2 knuckles visible on the lead hand), keep the body turning through impact, finish with the clubface pointing at the sky'),dose:L('10 bóng','10 balls'),chk:lm?'face-to-path −2° → +2°':L('7/10 bóng không cong vào trong','no hook curve on 7/10 balls')});
  if(p.miss==='high'||(p.spin!=null&&p.spin>spw[1]+200)) B.push({n:L('Giảm spin — chạm cao trên mặt gậy','Cut spin — strike high on the face'),how:L('Xịt phấn mặt gậy, tee cao, điểm chạm nhích lên nửa trên mặt','Spray the clubface, tee it high, move the strike into the upper half of the face'),dose:L('10 bóng','10 balls'),chk:lm?'spin '+num(spw[0])+'–'+num(spw[1])+' rpm':L('dấu phấn ở nửa trên, giữa mặt','spray mark in the upper half, center of the face')});
  if(p.miss==='thin'||p.miss==='fat') B.push({n:L('Điểm chạm thấp nhất — dồn chân trước','Low point — shift onto the lead foot'),how:L('Step Drill chậm rồi đánh bóng; kết thúc với 80% trọng lượng trên chân trước','Slow Step Drill, then hit balls; finish with 80% of your weight on the lead foot'),dose:L('5 khan + 10 bóng','5 practice swings + 10 balls'),chk:L('không ','no ')+(p.miss==='fat'?L('đánh đất','fat shots'):L('top bóng','topped shots'))+L(' ở 8/10 bóng',' on 8/10 balls')});
  if(p.miss==='mixed'||(P.smash0&&P.smash0<1.43)) B.push({n:L('Strike giữa mặt — xịt phấn','Center strike — face spray'),how:L('Xịt phấn mặt gậy, nhịp 3:1, 80% lực','Spray the clubface, 3:1 tempo, 80% effort'),dose:L('10 bóng','10 balls'),chk:lm?'smash ≥ 1.45':L('dấu phấn trong vùng đồng xu giữa mặt ở 6/10 bóng','spray mark inside a coin-sized center zone on 6/10 balls')});
  if(!B.length) B.push({n:L('Giữ strike khi tăng tốc','Keep your strike as speed rises'),how:L('Tempo 3:1 ở 90% lực, xịt phấn mặt gậy','3:1 tempo at 90% effort, spray the clubface'),dose:L('10 bóng','10 balls'),chk:lm?'smash ≥ 1.46':L('dấu phấn giữa mặt gậy','spray mark centered on the face')});
  return B;
}

/* ---------- Khuyến nghị driver ---------- */
function clubRows(p,P){
  var c=p.club||{}, v0=P.v0, v1=P.v12, R=[];
  function mon(fn){var f0=fn(v0);for(var i=0;i<12;i++) if(fn(P.months[i])!==f0) return i+1;return 0}
  /* Flex */
  var f0=flexFor(v0), f1=flexFor(v1), fm=mon(flexFor), r={k:L('Độ cứng shaft (flex)','Shaft flex'),mine:c.flex?FLEXN[c.flex]:'—',now:FLEXN[f0],later:FLEXN[f1]};
  if(!c.flex){r.st='na';r.why=L('Xem chữ in trên shaft (L/A/R/S/X). Chưa rõ thì mang gậy tới cửa hàng kiểm tra.','Check the letter printed on the shaft (L/A/R/S/X). Not sure? Take the club to a shop to check.')}
  else{var d=FLEX.indexOf(c.flex)-FLEX.indexOf(f0);
    if(d===0){r.st='ok';r.why=L('Khớp với tốc độ hiện tại.','Matches your current speed.')}
    else if(d>0){r.st=d>1?'bad':'warn';r.why=L('Cứng hơn cần thiết: bóng bay thấp, cảm giác "chết", dễ đẩy/slice sang ','Stiffer than you need: low flight, a "dead" feel, prone to push/slice to the ')+(P.lefty?L('trái','left'):L('phải','right'))+'.'}
    else {r.st=d<-1?'bad':'warn';r.why=L('Mềm hơn cần thiết: bóng cao, spin nhiều, mặt gậy khó vuông — dễ hook.','Softer than you need: high flight, lots of spin, hard to square the face — prone to hook.')}}
  if(fm) r.why+=L(' Khi đạt ~',' Once you reach ~')+mph(P.months[fm-1])+L(' mph (tháng ',' mph (month ')+fm+L(') nên thử ','), try ')+f1+'.';
  R.push(r);
  /* Loft */
  var lo=loftFor(v0), l1=loftFor(v1); if(p.miss==='slice'){lo=[lo[0]+.5,lo[1]+.5]}
  r={k:'Loft',mine:c.loft?vn(c.loft)+'°':'—',now:rng(lo,'°'),later:rng(l1,'°')};
  if(!c.loft){r.st='na';r.why=L('Số in trên đầu gậy (vd 9°, 10,5°). Driver có hosel chỉnh được thì đọc vị trí trên hosel.','The number printed on the clubhead (e.g. 9°, 10.5°). With an adjustable hosel, read the hosel setting.')}
  else if(c.loft<lo[0]){var dl=(lo[0]+lo[1])/2-c.loft;r.st=c.loft<lo[0]-1?'bad':'warn';r.why=L('Thấp so với tốc độ: bóng khó lên, rơi sớm. Tăng ~','Low for your speed: the ball struggles to climb and drops early. Add ~')+vn(dl.toFixed(1))+L('° (xoay hosel nếu có) → launch ≈ +','° (adjust the hosel if you can) → launch ≈ +')+vn((dl*.8).toFixed(1))+'°, spin ≈ +'+num(Math.round(dl*200/50)*50)+' rpm.'}
  else if(c.loft>lo[1]){var dh=c.loft-(lo[0]+lo[1])/2;r.st='warn';r.why=L('Cao: bóng bổng, spin cao. Giảm ~','High: ballooning flight, high spin. Take off ~')+vn(dh.toFixed(1))+'° → launch ≈ −'+vn((dh*.8).toFixed(1))+'°, spin ≈ −'+num(Math.round(dh*200/50)*50)+L(' rpm — chỉ làm SAU khi attack angle đã dương.',' rpm — only AFTER your attack angle is positive.')}
  else {r.st='ok';r.why=L('Trong vùng tối ưu.','In the optimal range.')}
  if(p.miss==='slice') r.why+=L(' Loft cao hơn một chút giúp giảm độ cong của slice.',' A little more loft helps reduce slice curve.');
  R.push(r);
  /* Trọng lượng shaft */
  var sw=shaftFor(v0), sw1=shaftFor(v1);
  r={k:L('Trọng lượng shaft','Shaft weight'),mine:c.sw?(c.sw>=85?'80 g+':(c.sw-5)+'–'+(c.sw+4)+' g'):'—',now:sw[0]+'–'+sw[1]+' g',later:sw1[0]+'–'+sw1[1]+' g'};
  if(!c.sw){r.st='na';r.why=L('Thường in trên shaft (vd "6S" = 60 g, Stiff).','Usually printed on the shaft (e.g. "6S" = 60 g, Stiff).')}
  else if(c.sw+4<sw[0]){r.st='warn';r.why=L('Nhẹ hơn khuyến nghị: tốc độ có thể tăng nhưng khó kiểm soát nhịp và mặt gậy.','Lighter than recommended: speed may go up, but tempo and clubface control get harder.')}
  else if(c.sw-5>sw[1]){var dg=c.sw-(sw[0]+sw[1])/2;r.st='warn';r.why=L('Nặng hơn khuyến nghị: tốn sức, giảm tốc độ đầu gậy. Shaft nhẹ hơn ~','Heavier than recommended: costs energy and clubhead speed. A shaft ~')+Math.round(dg)+L(' g ≈ +',' g lighter ≈ +')+vn((dg*.15).toFixed(1))+' mph club speed (≈ +'+Math.round(dg*.15*P.k0)+' yd).'}
  else {r.st='ok';r.why=L('Phù hợp.','Good fit.')}
  R.push(r);
  /* Chiều dài */
  var ln=lenFor(p.h); var shaky=p.miss==='mixed'||(P.smash0&&P.smash0<1.43);
  if(shaky) ln=[ln[0]-.5,ln[1]-.5];
  r={k:L('Chiều dài gậy','Club length'),mine:c.len?vn(c.len)+'"':'—',now:rng(ln,'"'),later:rng(ln,'"')};
  if(!c.len){r.st='na';r.why=L('Đa số driver bán sẵn dài 45,5–46". Đo từ gót đầu gậy tới đầu cán khi gậy đặt ở tư thế address.','Most off-the-rack drivers are 45.5–46". Measure from the heel of the clubhead to the butt end of the grip with the club soled at address.')}
  else if(c.len>ln[1]+.25){r.st='warn';r.why=L('Dài hơn khuyến nghị ','Longer than recommended by ')+vn((c.len-ln[1]).toFixed(2))+L('": mỗi 1" ≈ +1–1,5 mph nhưng strike lệch tâm nhiều hơn — lệch tâm 1 cm mất ~3–5% ball speed, lớn hơn phần tốc độ được thêm.','": each 1" ≈ +1–1.5 mph, but you miss the center more — 1 cm off center costs ~3–5% ball speed, more than the speed you gain.')}
  else if(c.len<ln[0]-.5){r.st='warn';r.why=L('Ngắn: dễ kiểm soát nhưng mất bán kính swing — có thể nối dài 0,5".','Short: easy to control but loses swing radius — could be extended 0.5".')}
  else {r.st='ok';r.why=L('Cân bằng giữa tốc độ và độ chuẩn.','A good balance of speed and accuracy.')}
  if(shaky) r.why+=L(' Strike đang chưa ổn định nên khuyến nghị đã giảm 0,5".',' Your strike isn\'t consistent yet, so the recommendation is 0.5" shorter.');
  R.push(r);
  /* Grip */
  var gr=GRIPFOR[c.glove]||null;
  r={k:L('Cỡ grip','Grip size'),mine:c.grip?GRIPN[c.grip]:'—',now:gr?gr.map(function(x){return GRIPN[x]}).join(' / '):L('Theo cỡ găng','By glove size'),later:'—'};
  if(!gr){r.st='na';r.why=L('Nhập cỡ găng tay để tính cỡ grip.','Enter your glove size to work out your grip size.')}
  else if(!c.grip){r.st='na';r.why=L('Theo cỡ găng ','Based on glove size ')+c.glove+'.'}
  else if(gr.indexOf(c.grip)>=0){r.st='ok';r.why=L('Khớp cỡ găng ','Matches glove size ')+c.glove+'.'}
  else {r.st='warn';r.why=(['under','std'].indexOf(c.grip)>=0&&gr.indexOf('mid')>=0)?L('Grip nhỏ so với tay: bàn tay hoạt động quá mức, dễ hook.','Grip too small for your hands: overactive hands, prone to hook.'):L('Grip to so với tay: khó nhả mặt gậy, dễ đẩy bóng.','Grip too big for your hands: hard to release the clubface, prone to push.')}
  R.push(r);
  /* Launch / spin / AoA mục tiêu */
  var lw=launchWin(v0), spw=spinWin(v0), aw=aoaWin(v0);
  r={k:'Launch · Spin · AoA',mine:(p.launch!=null?vn(p.launch)+'°':'—')+' · '+(p.spin!=null?num(p.spin):'—')+' · '+(p.aoa!=null?(p.aoa>0?'+':'')+vn(p.aoa)+'°':'—'),
     now:lw[0]+'–'+lw[1]+'° · '+num(spw[0])+'–'+num(spw[1])+' · +'+aw[0]+'→+'+aw[1]+'°',
     later:launchWin(v1)[0]+'–'+launchWin(v1)[1]+'° · '+num(spinWin(v1)[0])+'–'+num(spinWin(v1)[1])+' · +3→+5°'};
  var bad=[];
  if(p.launch!=null&&p.launch<lw[0]-1) bad.push(L('launch thấp','low launch'));
  if(p.launch!=null&&p.launch>lw[1]+1) bad.push(L('launch cao','high launch'));
  if(p.spin!=null&&p.spin>spw[1]+200) bad.push(L('spin cao','high spin'));
  if(p.spin!=null&&p.spin<spw[0]-200) bad.push(L('spin thấp (bóng rơi nhanh)','low spin (ball drops out of the sky)'));
  if(p.aoa!=null&&p.aoa<0) bad.push(L('attack angle âm','negative attack angle'));
  if(p.launch==null&&p.spin==null&&p.aoa==null){r.st='na';r.why=L('Chưa có số liệu monitor — đây là cửa sổ tối ưu cho tốc độ của bạn.','No monitor data yet — this is the optimal window for your speed.')}
  else if(bad.length){r.st='warn';r.why=L('Cần xử lý: ','Needs work: ')+bad.join(', ')+L('. Sửa bằng setup/attack angle trước, đổi gậy sau.','. Fix it with setup/attack angle first, change equipment later.')}
  else {r.st='ok';r.why=L('Trong cửa sổ tối ưu.','Inside the optimal window.')}
  R.push(r);
  return R;
}

/* ---------- Ưu tiên swing cá nhân ---------- */
/* LƯU Ý i18n: trong hàm này biến cục bộ L là mảng (che hàm L()) — dùng T({vi,en}) */
function swingPriorities(p,P){
  var L=[], heel=T({vi:P.lefty?'phải':'trái',en:'lead'}), lw=launchWin(P.v0), spw=spinWin(P.v0);
  ['fo','dtl'].forEach(function(k){var x=p.video&&p.video[k];if(x&&x.issues) x.issues.slice(0,2).forEach(function(i){var I=ISSUES[i.code];
    if(I) L.push('<b>Video '+x.d+' ('+(k==='fo'?T({vi:'chính diện',en:'face-on'}):T({vi:'dọc đường bóng',en:'down-the-line'}))+'): '+I.t+'</b> — '+i.val+'. '+I.n+': '+I.how+'.')})});
  var aoaYd=yd5(P.v0*.3);
  if(p.golf==='new') L.push(T({vi:'<b>Nền tảng trước tốc độ.</b> Mới chơi golf: 4 tuần đầu dành 70% buổi Swing cho Setup checklist + Tempo 3:1. Tốc độ chỉ có giá trị khi bóng trúng giữa mặt gậy.',en:'<b>Foundation before speed.</b> New to golf: for the first 4 weeks, spend 70% of each Swing session on the Setup checklist + 3:1 Tempo. Speed only counts when you hit the center of the face.'}));
  if(p.aoa!=null&&p.aoa<0) L.push(T({vi:'<b>Đưa attack angle từ ',en:'<b>Move your attack angle from '})+vn(p.aoa)+T({vi:'° lên +3°.</b> Bóng ngang gót ',en:'° to +3°.</b> Ball off the '})+heel+T({vi:', tee cao, cột sống nghiêng về sau. Ở ~',en:' heel, tee it high, spine tilted away from the target. At ~'})+mph(P.v0)+T({vi:' mph, AoA từ −5° lên +5° đáng giá ~',en:' mph, going from −5° to +5° AoA is worth ~'})+aoaYd+T({vi:' yd carry mà không cần thêm mph.',en:' yd of carry without adding any mph.'}));
  if(p.miss==='slice') L.push(T({vi:'<b>Sửa slice trước khi tăng tốc.</b> Slice = mặt gậy mở so với đường swing; tăng tốc khi mặt còn mở chỉ làm bóng cong xa hơn. Tuần 2 mỗi giai đoạn: Foot spray + theo dõi face-to-path, mục tiêu draw nhẹ.',en:'<b>Fix the slice before adding speed.</b> A slice = clubface open to the swing path; adding speed with an open face just makes the ball curve farther. Week 2 of each phase: foot spray + track face-to-path, aiming for a slight draw.'}));
  if(p.miss==='hook') L.push(T({vi:'<b>Kiểm soát hook.</b> Kiểm tra grip có quá "mạnh" không, giữ thân xoay liên tục qua impact (tay không vượt thân). Khóa hướng trước, tăng tốc sau.',en:'<b>Control the hook.</b> Check whether your grip is too "strong" and keep the body turning through impact (hands don\'t outrace the body). Lock in direction first, add speed later.'}));
  if(p.miss==='low') L.push(T({vi:'<b>Nâng quỹ đạo bóng.</b> Tee cao hơn, bóng nhích lên gót ',en:'<b>Raise your ball flight.</b> Tee it higher, move the ball up toward your '})+heel+T({vi:', mục tiêu launch ',en:' heel, target launch '})+lw[0]+'–'+lw[1]+T({vi:'°. Nếu vẫn thấp → xem lại loft/flex ở bảng gậy.',en:'°. Still low → review loft/flex in the club table.'}));
  if(p.miss==='high') L.push(T({vi:'<b>Giảm bóng bổng / spin.</b> Strike hơi cao trên mặt gậy (xịt phấn kiểm tra), attack angle dương — mục tiêu spin ',en:'<b>Tame the ballooning / spin.</b> Strike slightly high on the face (check with face spray), positive attack angle — target spin '})+num(spw[0])+'–'+num(spw[1])+' rpm.');
  if(p.miss==='thin'||p.miss==='fat') L.push(T({vi:'<b>Ổn định điểm chạm thấp nhất.</b> ',en:'<b>Stabilize your low point.</b> '})+(p.miss==='fat'?T({vi:'Đánh đất',en:'Fat shots'}):T({vi:'Đánh mỏng/top',en:'Thin/topped shots'}))+T({vi:' thường do trọng tâm không chuyển sang chân trước — Step Drill mỗi buổi Swing và Buổi D.',en:' usually come from not shifting your weight onto the lead foot — do the Step Drill in every Swing session and in Session D.'}));
  if(p.miss==='mixed'||(P.smash0&&P.smash0<1.43)) L.push(T({vi:'<b>Strike giữa mặt gậy.</b> ',en:'<b>Center-face strike.</b> '})+(P.smash0?T({vi:'Smash hiện ',en:'Current smash '})+P.smash0.toFixed(2)+' — ':'')+T({vi:'mục tiêu ≥ 1.46. Tempo 3:1 + xịt phấn mặt gậy; mỗi 0,02 smash ≈ +',en:'target ≥ 1.46. 3:1 tempo + face spray; every 0.02 of smash ≈ +'})+Math.round(P.v0*.02*1.7)+' yd.');
  if(p.spin!=null&&p.spin>spw[1]+200&&p.miss!=='high') L.push(T({vi:'<b>Spin ',en:'<b>Spin of '})+num(p.spin)+T({vi:' rpm là quá cao</b> cho tốc độ của bạn (tối ưu ',en:' rpm is too high</b> for your speed (optimal '})+num(spw[0])+'–'+num(spw[1])+T({vi:'). Attack angle dương + strike cao trên mặt gậy giảm spin nhanh nhất.',en:'). A positive attack angle + a high strike on the face cut spin the fastest.'}));
  L.push(T({vi:'<b>Giữ nhịp khi tăng tốc.</b> Mỗi khi đạt mốc mph mới, quay lại Tempo 3:1 một tuần để hệ thần kinh "khóa" tốc độ mới với strike tốt.',en:'<b>Keep your tempo as speed rises.</b> Every time you hit a new mph milestone, go back to 3:1 Tempo for a week so your nervous system "locks in" the new speed with a good strike.'}));
  if(P.lefty) L.push(T({vi:'<b>Thuận tay trái:</b> mọi chỉ dẫn trái/phải trong giáo án đã được đảo cho bạn. Hình minh họa vẽ người thuận tay phải — xem như soi gương.',en:'<b>Left-handed:</b> every left/right instruction in the program has been flipped for you. The illustrations show a right-handed golfer — view them as a mirror image.'}));
  return L.slice(0,5);
}

/* ---------- Thư viện lỗi swing (dùng chung cho phân tích video và giáo án) ----------
   n/how/dose/chk = khối tập đưa thẳng vào Giáo án Swing khi người dùng bấm "Đưa vào giáo án". */
var ISSUES={
 tempo_fast:{t:L('Nhịp lên gậy quá vội','Rushed backswing tempo'),why:L('Lên gậy vội làm thân chưa kịp xoay hết và trọng tâm chưa kịp dồn; tay "giật" từ đỉnh nên mất độ trễ (lag) và strike kém.','A rushed backswing gives the body no time to finish turning and loading; the hands "snatch" from the top, so you lose lag and strike quality.'),
   n:L('Tempo 3:1 — đếm nhịp','Tempo 3:1 — count the beat'),how:L('Đếm "một–hai–ba" khi lên gậy, "một" khi xuống; dùng app metronome nhịp 3:1','Count "one–two–three" on the backswing, "one" on the downswing; use a metronome app set to 3:1'),dose:L('10 swing khan + 10 bóng','10 practice swings + 10 balls'),chk:L('tempo 2,7–3,3 ở video lần sau','tempo 2.7–3.3 in your next video')},
 tempo_slow:{t:L('Lên gậy quá chậm / dừng ở đỉnh','Backswing too slow / pausing at the top'),why:L('Backswing quá chậm làm cơ mất phản xạ kéo giãn khi đổi chiều — giảm tốc độ đầu gậy.','A very slow backswing loses the muscles\' stretch reflex at the transition — less clubhead speed.'),
   n:L('Tempo liền mạch 3:1','Smooth 3:1 tempo'),how:L('Bỏ khoảng dừng ở đỉnh, đếm đều "một–hai–ba–MỘT"','Remove the pause at the top; count evenly "one–two–three–ONE"'),dose:L('10 swing khan + 10 bóng','10 practice swings + 10 balls'),chk:L('tempo 2,7–3,3','tempo 2.7–3.3')},
 sway:{t:L('Hông trượt ngang khi lên gậy (sway)','Hips slide sideways on the backswing (sway)'),why:L('Hông trượt xa mục tiêu thay vì xoay → mất lực xoắn, phải trượt ngược lại khi xuống gậy, điểm chạm thấp nhất không ổn định.','The hips slide away from the target instead of turning → lost coil, you have to slide back on the downswing, and the low point becomes inconsistent.'),
   n:L('Chống sway — gậy chắn hông sau','Anti-sway — club outside the trail hip'),how:L('Cắm gậy thẳng đứng sát bên ngoài hông sau; lên gậy mà hông không chạm gậy — xoay trong "ống"','Stand a club upright just outside the trail hip; make your backswing without the hip touching it — turn inside a "barrel"'),dose:L('10 swing khan + 10 bóng','10 practice swings + 10 balls'),chk:L('hông dịch < 0,15 thân ở đỉnh','hip shift < 0.15 torso lengths at the top')},
 head_sway:{t:L('Đầu trôi ngang theo hông khi lên gậy','Head drifts with the hips on the backswing'),why:L('Trục xoay dịch chuyển nên khó trở về đúng điểm chạm cũ — strike lệch tâm.','The swing axis moves, so it\'s hard to return to the same impact point — off-center strikes.'),
   n:L('Giữ trục đầu','Keep a stable head axis'),how:L('Swing khan trước gương/bóng đổ, đầu được lùi nhẹ nhưng không trôi quá một bàn tay','Practice swings facing a mirror or your shadow; the head may move back slightly but no more than a hand\'s width'),dose:L('10 swing khan','10 practice swings'),chk:L('đầu dịch < 0,3 thân','head shift < 0.3 torso lengths')},
 head_fwd:{t:L('Đầu lao về phía mục tiêu lúc impact','Head lunges toward the target at impact'),why:L('Với driver đầu phải ở SAU bóng để đánh lên; đầu lao tới làm attack angle âm, spin tăng, dễ slice.','With a driver your head must stay BEHIND the ball to hit up; lunging forward makes the attack angle negative, adds spin and promotes a slice.'),
   n:L('Đầu ở sau bóng','Head behind the ball'),how:L('Mắt nhìn mặt sau quả bóng, giữ đầu sau bóng đến khi bóng rời mặt gậy','Look at the back of the ball and keep your head behind it until the ball leaves the clubface'),dose:L('10 bóng','10 balls'),chk:L('đầu không vượt vị trí address lúc impact','head not past its address position at impact')},
 head_dip:{t:L('Hạ người (đầu tụt) lúc impact','Dipping (head drops) at impact'),why:L('Đáy cung swing thay đổi → đánh đất hoặc top, mất smash.','The low point of the swing arc changes → fat or topped shots, lost smash.'),
   n:L('Giữ độ cao qua bóng','Maintain height through the ball'),how:L('Giữ khoảng cách đầu–bóng, đạp chân trước để "đứng lên" qua bóng thay vì ngồi xuống','Keep the head–ball distance; push off the lead foot to "stand up" through the ball instead of squatting'),dose:L('10 bóng','10 balls'),chk:L('đầu hạ < 0,15 thân','head drop < 0.15 torso lengths')},
 hang_back:{t:L('Trọng tâm còn ở chân sau lúc impact','Weight stuck on the trail foot at impact'),why:L('Đáy cung swing lùi ra sau bóng → top/đánh đất, và không dùng được lực đạp đất — mất tốc độ.','The low point moves behind the ball → topped/fat shots, and you can\'t use ground force — lost speed.'),
   n:L('Step Drill — dồn chân trước','Step Drill — shift to the lead foot'),how:L('Bước chân trước về đích rồi mới xuống gậy; kết thúc với ~90% trọng lượng trên chân trước','Step the lead foot toward the target, then start the downswing; finish with ~90% of your weight on the lead foot'),dose:L('5 khan + 10 bóng','5 practice swings + 10 balls'),chk:L('hông dồn ≥ 0,1 thân về mục tiêu lúc impact','hips shifted ≥ 0.1 torso lengths toward the target at impact')},
 slide:{t:L('Hông trượt quá nhiều về phía mục tiêu','Hips slide too far toward the target'),why:L('Hông trượt thay vì xoay khiến thân "đuổi theo", mặt gậy mở → đẩy/slice.','Sliding instead of turning makes the body "chase", leaving the clubface open → push/slice.'),
   n:L('Dịch nhẹ rồi xoay','Shift slightly, then turn'),how:L('Dịch hông một chút rồi xoay quanh chân trước như cánh cửa; gậy cắm ngoài hông trước làm mốc','Shift the hips a little, then rotate around the lead leg like a door on its hinge; stand a club outside the lead hip as a marker'),dose:L('10 swing khan + 10 bóng','10 practice swings + 10 balls'),chk:L('hông dồn 0,1–0,45 thân','hip shift 0.1–0.45 torso lengths')},
 short_turn:{t:L('Vai xoay chưa đủ','Not enough shoulder turn'),why:L('Cung swing ngắn = ít quãng để tăng tốc; cơ thể phải bù bằng tay.','A short swing arc = less runway to build speed; the body compensates with the arms.'),
   n:L('Mở biên độ xoay vai','Open up your shoulder turn'),how:L('Open Book 2×8 trước buổi; swing khan với gậy ngang vai tới khi lưng quay về mục tiêu','Open Book 2×8 before the session; practice swings with a club across the shoulders until your back faces the target'),dose:L('Open Book 2×8 + 10 swing khan','Open Book 2×8 + 10 practice swings'),chk:L('vai xoay tăng ở video lần sau','more shoulder turn in your next video')},
 bent_arm:{t:L('Tay trước gập nhiều ở đỉnh','Lead arm bends a lot at the top'),why:L('Bán kính swing thay đổi nên cung swing ngắn và strike không ổn định.','The swing radius changes, so the arc gets shorter and the strike inconsistent.'),
   n:L('Tay trước duỗi — bán kính rộng','Straight lead arm — wide radius'),how:L('Lên gậy 3/4 với tay trước duỗi, cảm giác đẩy đầu gậy ra xa trong takeaway','3/4 backswings with a straight lead arm, feeling the clubhead pushed away in the takeaway'),dose:L('10 swing 3/4 + 10 bóng','10 3/4 swings + 10 balls'),chk:L('khuỷu tay trước ≥ 150°','lead elbow ≥ 150°')},
 tilt_low:{t:L('Cột sống chưa nghiêng về sau (driver)','Not enough spine tilt away from the target (driver)'),why:L('Thiếu độ nghiêng về sau làm cung swing đi xuống → attack angle âm, spin cao, mất carry.','Too little tilt makes the arc travel downward → negative attack angle, high spin, lost carry.'),
   n:L('Setup nghiêng cột sống','Spine tilt at setup'),how:L('Bóng ngang gót chân trước, vai sau thấp hơn — cột sống nghiêng 5–15° ra xa mục tiêu','Ball off the lead heel, trail shoulder lower — spine tilted 5–15° away from the target'),dose:L('đọc checklist trước mỗi bóng','run the checklist before every ball'),chk:L('độ nghiêng 5–15° trên video','tilt 5–15° on video')},
 tilt_high:{t:L('Nghiêng về sau quá nhiều ở setup','Too much tilt away from the target at setup'),why:L('Nghiêng quá mức dễ kẹt trọng tâm ở chân sau → top bóng hoặc hook.','Excessive tilt tends to trap your weight on the trail foot → topped shots or hooks.'),
   n:L('Setup trung tính hơn','A more neutral setup'),how:L('Giảm độ nghiêng về 8–12°, trọng lượng 55/45 nghiêng nhẹ về chân sau','Reduce tilt to 8–12°, weight 55/45 favoring the trail foot slightly'),dose:L('đọc checklist trước mỗi bóng','run the checklist before every ball'),chk:L('độ nghiêng 5–15°','tilt 5–15°')},
 finish:{t:L('Kết thúc chưa dồn hết lên chân trước','Weight not fully on the lead foot at the finish'),why:L('Kết thúc còn ở chân sau là dấu hiệu trình tự chuyển động chưa đúng — lực chưa đi hết qua bóng.','Finishing on the trail foot is a sign of poor sequencing — the energy isn\'t going fully through the ball.'),
   n:L('Kết thúc cân bằng 3 giây','Balanced 3-second finish'),how:L('Mỗi cú giữ tư thế kết thúc 3 giây: hông hướng mục tiêu, gót sau nhấc, trọng lượng trên chân trước','Hold every finish for 3 seconds: hips facing the target, trail heel up, weight on the lead foot'),dose:L('mọi bóng trong buổi','every ball in the session'),chk:L('hông nằm trên chân trước ở finish','hips over the lead foot at the finish')},
 stance_narrow:{t:L('Đứng hẹp so với driver','Stance too narrow for driver'),why:L('Nền hẹp khó giữ thăng bằng khi tăng tốc — cơ thể tự giảm lực.','A narrow base makes it hard to stay balanced as you speed up — your body holds back on its own.'),
   n:L('Nới rộng thế đứng','Widen your stance'),how:L('Mép trong gót chân rộng bằng mép ngoài vai','Inside of the heels as wide as the outside of the shoulders'),dose:L('mọi bóng driver','every driver ball'),chk:L('bàn chân ≥ 1,1 lần độ rộng vai','feet ≥ 1.1× shoulder width')},
 stance_wide:{t:L('Đứng quá rộng','Stance too wide'),why:L('Nền quá rộng cản hông xoay và dồn trọng tâm.','A base that\'s too wide blocks hip rotation and weight shift.'),
   n:L('Thu hẹp thế đứng','Narrow your stance'),how:L('Thu chân về khoảng 1,1–1,4 lần độ rộng vai','Bring the feet in to about 1.1–1.4× shoulder width'),dose:L('mọi bóng','every ball'),chk:L('bàn chân 1,1–1,6 lần độ rộng vai','feet 1.1–1.6× shoulder width')},
 short_back:{t:L('Backswing ngắn','Short backswing'),why:L('Tay chưa lên tới ngang vai ở đỉnh — thiếu quãng tăng tốc.','The hands don\'t reach shoulder height at the top — not enough runway to build speed.'),
   n:L('Backswing đầy đủ','Full backswing'),how:L('Lên gậy tới khi tay trên vai sau, lưng quay về mục tiêu; không gập cổ tay để bù','Swing back until the hands are over the trail shoulder and your back faces the target; don\'t hinge the wrists to compensate'),dose:L('10 swing khan','10 practice swings'),chk:L('tay ở đỉnh cao hơn vai','hands above the shoulders at the top')},
 upright:{t:L('Tư thế đứng quá thẳng','Posture too upright'),why:L('Gập hông ít làm tay không có chỗ đi xuống, dễ đổ gậy ra ngoài.','Too little hip hinge leaves the arms no room to swing down, so the club tends to get thrown outward.'),
   n:L('Gập hông đúng','Proper hip hinge'),how:L('Đẩy mông ra sau tới khi tay rũ thẳng dưới vai, lưng thẳng','Push your hips back until the arms hang straight below the shoulders, back straight'),dose:L('kiểm tra trước mỗi bóng','check before every ball'),chk:L('gập người 20–40°','forward bend 20–40°')},
 hunched:{t:L('Cúi gập người quá nhiều','Bent over too much'),why:L('Khó xoay vai, dễ đứng dậy khi xuống gậy.','Hard to turn the shoulders, and you tend to stand up on the downswing.'),
   n:L('Nâng ngực ở setup','Chest up at setup'),how:L('Ngực hướng lên, gập ở hông chứ không cong lưng trên','Chest up, bend from the hips rather than rounding the upper back'),dose:L('kiểm tra trước mỗi bóng','check before every ball'),chk:L('gập người 20–40°','forward bend 20–40°')},
 knee_straight:{t:L('Gối gần như thẳng ở setup','Knees almost straight at setup'),why:L('Thiếu độ nhún nên không có "lò xo" đạp đất.','Without knee flex there\'s no "spring" for ground force.'),
   n:L('Nhún gối vừa đủ','Just enough knee flex'),how:L('Chùng gối 15–25°, trọng lượng ở giữa bàn chân','Flex the knees 15–25°, weight over the middle of the feet'),dose:L('kiểm tra trước mỗi bóng','check before every ball'),chk:L('gối gập 10–35°','knee flex 10–35°')},
 knee_deep:{t:L('Ngồi quá sâu ở setup','Sitting too deep at setup'),why:L('Gối gập nhiều làm hông khó xoay và thân dễ bật dậy.','Too much knee bend makes it hard to turn the hips, and the body tends to pop up.'),
   n:L('Đứng cao hơn','Stand taller'),how:L('Giảm độ gập gối về 15–25°','Reduce knee flex to 15–25°'),dose:L('kiểm tra trước mỗi bóng','check before every ball'),chk:L('gối gập 10–35°','knee flex 10–35°')},
 early_ext:{t:L('Early extension — hông lao về phía bóng','Early extension — hips thrust toward the ball'),why:L('Thân đứng dậy, tay bị kẹt → đẩy/hook, strike gót, mất tốc độ. Đây là lỗi phổ biến nhất ở golfer nghiệp dư (TPI).','The body stands up and the arms get stuck → push/hook, heel strikes, lost speed. It\'s the most common fault among amateur golfers (TPI).'),
   n:L('Chống early extension — mông chạm ghế','Anti early extension — butt against a chair'),how:L('Đặt ghế/gậy chạm mông ở address; xuống gậy mông vẫn chạm tới impact','Set a chair or club touching your butt at address; keep it in contact on the downswing all the way to impact'),dose:L('10 khan + 10 bóng','10 practice swings + 10 balls'),chk:L('hông không tiến về bóng quá 0,1 thân','hips move no more than 0.1 torso lengths toward the ball')},
 posture_loss:{t:L('Mất góc cột sống ở đỉnh','Losing spine angle at the top'),why:L('Thân nhổm lên/cúi xuống khi lên gậy làm độ cao đáy cung thay đổi.','Rising up or dipping on the backswing changes the height of the low point.'),
   n:L('Giữ góc cột sống','Hold your spine angle'),how:L('Swing khan với gậy dọc sống lưng: đầu gậy luôn chạm lưng và mông','Practice swings with a club along your spine: it stays in contact with your back and butt'),dose:L('10 swing khan','10 practice swings'),chk:L('góc cột sống đổi < 10°','spine angle change < 10°')},
 ott:{t:L('Xuống gậy từ ngoài vào (over-the-top)','Over-the-top downswing'),why:L('Vai/tay ném gậy ra ngoài trước → đường swing ngoài–trong: slice hoặc kéo, mất 10–20 yd.','Shoulders and arms throw the club outward first → out-to-in path: slice or pull, costing 10–20 yd.'),
   n:L('Xuống gậy phía trong — pump drill','Downswing from the inside — pump drill'),how:L('Lên đỉnh, kéo tay xuống ngang hông sau 2 lần rồi mới đánh; đặt bao gậy ngoài bóng làm chướng ngại','At the top, pump the hands down to trail-hip height twice, then hit; place a headcover outside the ball as an obstacle'),dose:L('5 pump + 10 bóng','5 pumps + 10 balls'),chk:L('đường tay xuống không ra ngoài đường lên','downswing hand path not outside the backswing path')},
 inside:{t:L('Xuống gậy quá phía trong','Downswing too far from the inside'),why:L('Đường swing trong–ra quá mức dễ đẩy bóng hoặc hook.','An excessive in-to-out path tends to push or hook the ball.'),
   n:L('Đường swing trung tính','Neutral swing path'),how:L('Cổng 2 tee thẳng hàng mục tiêu, swing đi qua cổng; thân xoay tiếp qua impact','Set a gate of 2 tees in line with the target and swing through it; keep the body turning through impact'),dose:L('10 bóng','10 balls'),chk:L('đường tay lên–xuống trùng nhau','backswing and downswing hand paths match')},
 head_rise:{t:L('Đầu nhô lên lúc impact','Head rises at impact'),why:L('Thân đứng dậy trước impact — thường đi cùng early extension, dễ top/strike gót.','The body stands up before impact — usually paired with early extension; promotes topped shots and heel strikes.'),
   n:L('Giữ độ cao đầu','Maintain head height'),how:L('Giữ góc cột sống tới khi bóng rời mặt gậy','Hold your spine angle until the ball leaves the clubface'),dose:L('10 bóng','10 balls'),chk:L('đầu nhô < 0,12 thân','head rise < 0.12 torso lengths')}
};

/* ---------- Phân tích chi tiết theo số liệu hồ sơ ---------- */
function scaleF(s,kind,f){
  if(!s||!kind) return s;
  var st={db:2,kb:4,bb:5,mb:1}[kind], mn={db:2,kb:4,bb:20,mb:1}[kind];
  function R(x){var v=Math.max(mn,Math.round(x*f/st)*st);return kind==='mb'?Math.min(v,6):v}
  function N(x){return +String(x).replace(',','.')}
  return s.replace(/(\d+(?:,\d+)?)(\s*(?:–|→)\s*)(\d+(?:,\d+)?)(\s*kg)|(\d+(?:,\d+)?)(\s*kg)/g,function(m,a,sep,b,kg,c,kg2){
    if(a){var A=R(N(a)),B=R(N(b)); if(B<=A) B=(kind==='mb'&&A>=6)?A:A+st; return A===B?A+kg:A+sep+B+kg}
    return R(N(c))+kg2;
  });
}
function deepReport(p,P){
  var H=[], v0=P.v0, inj=p.inj||{};
  function sec(title,body,open){return '<details class="dr"'+(open?' open':'')+'><summary>'+title+'</summary><div class="dr-b">'+body+'</div></details>'}
  function row(a,b,c){return '<tr><td class="m">'+a+'</td><td>'+b+'</td><td>'+(c||'')+'</td></tr>'}

  /* 1. Tốc độ & cự ly */
  var ypb=v0*1.45>130?1.8:1.6;                         /* yard carry / mph ball speed */
  var kOpt=2.55, pot=Math.max(0,Math.round(v0*kOpt-P.car0));
  var L=[], used=0;
  if(P.smash0&&P.smash0<1.48){var y=Math.round(v0*(1.48-P.smash0)*ypb);L.push(['Smash '+P.smash0.toFixed(2)+' → 1.48',T({vi:'Ball speed mất ~'+vn((v0*(1.48-P.smash0)).toFixed(1))+' mph do strike lệch tâm',en:'~'+vn((v0*(1.48-P.smash0)).toFixed(1))+' mph of ball speed lost to off-center strikes'}),y])}
  var aoaT=v0<85?2:3;
  if(p.aoa!=null&&p.aoa<aoaT){var y2=Math.round((aoaT-p.aoa)*.035*v0);L.push(['Attack angle '+vn(p.aoa)+'° → +'+aoaT+'°',T({vi:'Mỗi 1° đánh lên ≈ +'+vn((.035*v0).toFixed(1))+' yd carry ở tốc độ của bạn',en:'Each 1° more upward ≈ +'+vn((.035*v0).toFixed(1))+' yd carry at your speed'}),y2])}
  var sw=spinWin(v0);
  if(p.spin!=null&&p.spin>sw[1]){var y3=Math.round((p.spin-sw[1])/100*.018*v0);L.push(['Spin '+num(p.spin)+' → ≤ '+num(sw[1])+' rpm',T({vi:'Bóng "leo" rồi rơi sớm, mất lăn',en:'The ball "balloons" and drops early, losing roll'}),y3])}
  var lw=launchWin(v0);
  if(p.launch!=null&&p.launch<lw[0]){var y4=Math.round((lw[0]-p.launch)*.025*v0);L.push(['Launch '+vn(p.launch)+'° → '+lw[0]+'–'+lw[1]+'°',T({vi:'Bóng bay thấp, rơi trước khi hết đà',en:'Low flight — the ball lands before it runs out of steam'}),y4])}
  L.forEach(function(x){used+=x[2]});
  var scale=used>pot&&used>0?pot/used:1;
  var tb=T({vi:'<p class="dr-p">Ở <b>'+mph(v0)+' mph</b>, một cú driver tối ưu (smash 1.48, attack angle dương, launch/spin đúng cửa sổ) bay được ~<b>'+yd5(v0*kOpt)+' yd carry</b>. '+
    'Bạn đang carry ~<b>'+P.car0+' yd</b> ('+vn(P.k0.toFixed(2))+' yd/mph so với chuẩn tối ưu 2,55) → còn khoảng <b>'+pot+' yd "miễn phí"</b> lấy được bằng kỹ thuật và fitting, chưa cần tăng mph.</p>',
    en:'<p class="dr-p">At <b>'+mph(v0)+' mph</b>, an optimal drive (smash 1.48, positive attack angle, launch/spin in the right window) carries ~<b>'+yd5(v0*kOpt)+' yd</b>. '+
    'You currently carry ~<b>'+P.car0+' yd</b> ('+vn(P.k0.toFixed(2))+' yd/mph vs. the optimal 2.55) → that leaves about <b>'+pot+' "free" yd</b> to gain through technique and fitting, before adding any mph.</p>'});
  if(L.length){
    tb+='<div class="tbl-scroll"><table class="tbl"><tr><th>'+T({vi:'Nguồn mất cự ly',en:'Where distance is lost'})+'</th><th>'+T({vi:'Vì sao',en:'Why'})+'</th><th>'+T({vi:'≈ Yard lấy lại',en:'≈ Yards to regain'})+'</th></tr>'+
      L.map(function(x){return row(x[0],x[1],'<b>+'+Math.round(x[2]*scale)+' yd</b>')}).join('')+
      (pot-Math.round(used*scale)>5?row(T({vi:'Phần còn lại',en:'Remainder'}),T({vi:'Chưa đủ số liệu để tách — đo thêm launch/spin/AoA trên monitor',en:'Not enough data to break down — measure launch/spin/AoA on a monitor'}),'~'+(pot-Math.round(used*scale))+' yd'):'')+'</table></div>';
  } else tb+=T({vi:'<p class="dr-p">Chưa có số liệu launch/spin/attack angle nên chưa tách được yard mất ở đâu. Một buổi đo 10 cú trên launch monitor sẽ cho biết chính xác — sau đó cập nhật hồ sơ.</p>',en:'<p class="dr-p">No launch/spin/attack angle data yet, so we can\'t pinpoint where the yards are lost. One 10-shot session on a launch monitor will tell you exactly — then update your profile.</p>'});
  var fromSpeed=Math.round((P.v12-v0)*P.k1);
  tb+=T({vi:'<p class="dr-p">Kế hoạch 12 tháng: <b>+'+Math.round(pot*.6)+' yd</b> từ hiệu suất (tháng 1–4, lấy được ~60% phần "miễn phí") + <b>+'+fromSpeed+' yd</b> từ tốc độ (+'+mph(P.v12-v0)+' mph × '+vn(P.k1.toFixed(2))+' yd/mph) → tổng ~<b>'+P.tot12+' yd</b>.</p>',
    en:'<p class="dr-p">12-month plan: <b>+'+Math.round(pot*.6)+' yd</b> from efficiency (months 1–4, recovering ~60% of the "free" yards) + <b>+'+fromSpeed+' yd</b> from speed (+'+mph(P.v12-v0)+' mph × '+vn(P.k1.toFixed(2))+' yd/mph) → total ~<b>'+P.tot12+' yd</b>.</p>'});
  var bench=[[T({vi:'Nam nghiệp dư trung bình',en:'Average male amateur'}),93],['LPGA Tour',94],['PGA Tour',115]];
  tb+='<p class="dr-p">'+T({vi:'So sánh (TrackMan, club speed driver): ',en:'Comparison (TrackMan, driver club speed): '})+bench.map(function(b){return b[0]+' '+b[1]+' mph ('+T({vi:'bạn đạt ',en:'you\'re at '})+Math.round(v0/b[1]*100)+'%)'}).join(' · ')+'.</p>';
  H.push(sec(T({vi:'📈 Tốc độ &amp; cự ly — bạn đang để mất bao nhiêu yard',en:'📈 Speed &amp; distance — how many yards you\'re leaving out there'}),tb,true));

  /* 2. Cột mốc */
  var MS=[[1,T({vi:'Setup + strike, học form tạ',en:'Setup + strike, learn lifting form'})],[3,T({vi:'Sức mạnh + kiểm soát mặt gậy',en:'Strength + clubface control'})],[6,T({vi:'TEST giữa năm — ra sân thật',en:'Mid-year TEST — play a real course'})],[9,T({vi:'Công suất II · attack angle +4°',en:'Power II · attack angle +4°'})],[12,T({vi:'TEST cuối năm',en:'Year-end TEST'})]];
  var mt='<div class="tbl-scroll"><table class="tbl"><tr><th>'+T({vi:'Tháng',en:'Month'})+'</th><th>Club speed</th><th>'+T({vi:'Carry / Tổng',en:'Carry / Total'})+'</th><th>'+T({vi:'Trọng tâm',en:'Focus'})+'</th></tr>'+MS.map(function(m){
    var v=P.months[m[0]-1], k=P.k0+(P.k1-P.k0)*Math.min(1,m[0]/6);
    return '<tr><td class="m">'+m[0]+'</td><td>'+mph(v)+' mph</td><td>~'+yd5(v*k)+' / '+yd5(v*k*1.1)+' yd</td><td>'+m[1]+'</td></tr>'}).join('')+'</table></div>'+
    T({vi:'<p class="dr-p">Nếu 2 lần đo cuối tháng liên tiếp thấp hơn mốc > 2 mph: kéo dài giai đoạn hiện tại thêm 1 tháng thay vì tăng cường độ.</p>',en:'<p class="dr-p">If 2 end-of-month tests in a row come in more than 2 mph below the milestone: extend the current phase by 1 month instead of increasing intensity.</p>'});
  H.push(sec(T({vi:'🗓 Cột mốc kiểm tra',en:'🗓 Milestone checks'}),mt));

  /* 3. Thể lực: mức tạ khởi điểm → mục tiêu */
  var g3={none:[1.5,1.9],lt1:[1.35,1.6],y13:[1.15,1.3],gt3:[1.08,1.15]}[p.gym]||[1.3,1.5];
  if(p.age>=50){g3=[1+(g3[0]-1)*.7,1+(g3[1]-1)*.7]}
  var lifts=[];
  SESSIONS.forEach(function(s){s.ex.forEach(function(e){if(e.ld&&e.ld!=='mb'&&/\d/.test(e.kg||'')&&lifts.length<5) lifts.push([s.id,e])})});
  var st='<div class="tbl-scroll"><table class="tbl"><tr><th>'+T({vi:'Bài',en:'Exercise'})+'</th><th>'+T({vi:'Tháng 1',en:'Month 1'})+'</th><th>'+T({vi:'Tháng 3',en:'Month 3'})+'</th><th>'+T({vi:'Tháng 6',en:'Month 6'})+'</th></tr>'+
    lifts.map(function(x){var e=x[1],k0=e.kg.split('·')[0].trim();return '<tr><td class="m">'+x[0]+' · '+esc(e.name)+'</td><td>'+esc(k0)+'</td><td>'+esc(scaleF(k0,e.ld,g3[0]))+'</td><td>'+esc(scaleF(k0,e.ld,g3[1]))+'</td></tr>'}).join('')+'</table></div>'+
    '<p class="dr-p">'+T({vi:'Tăng tạ khi làm đủ mọi set 2 tuần liên tiếp mà rep cuối còn dư ~2 rep. ',en:'Add weight once you complete every set for 2 weeks in a row with ~2 reps still in reserve at the end. '})+({none:T({vi:'Chưa tập tạ bao giờ: 3 tháng đầu tiến bộ nhanh nhất — ưu tiên form đúng hơn số kg.',en:'Never lifted before: the first 3 months bring the fastest gains — prioritize good form over kg.'}),lt1:T({vi:'Mức tăng dự kiến ~2,5–5%/tuần ở 3 tháng đầu.',en:'Expect ~2.5–5%/week gains in the first 3 months.'}),y13:T({vi:'Đã có nền: tăng chậm hơn, tập trung tốc độ mỗi rep.',en:'You have a base: progress is slower, so focus on speed on every rep.'}),gt3:T({vi:'Nền sức mạnh tốt: yard sẽ đến chủ yếu từ công suất và overspeed.',en:'Solid strength base: your yards will come mainly from power and overspeed.'})}[p.gym])+'</p>';
  if(lifts.length) H.push(sec(T({vi:'🏋️ Mức tạ: khởi điểm → mục tiêu',en:'🏋️ Loads: starting → target'}),st));

  /* 4. Dinh dưỡng & phục hồi */
  var bmr=10*p.w+6.25*p.h-5*p.age+(p.sex==='f'?-161:5);
  var act={3:1.375,4:1.46,5:1.55}[p.days]+(p.sport&&p.sport!=='none'?.05:0);
  var tdee=Math.round(bmr*act/10)*10, kcal, goal;
  if(P.bmi>=25){kcal=tdee-400;goal=T({vi:'giảm ~0,3–0,4 kg/tuần, giữ cơ (protein cao, tập tạ đều)',en:'lose ~0.3–0.4 kg/week while keeping muscle (high protein, lift consistently)'})}
  else if(P.bmi>=23){kcal=tdee-200;goal=T({vi:'giảm mỡ chậm, giữ nguyên sức mạnh',en:'slow fat loss while maintaining strength'})}
  else if(P.bmi<18.5){kcal=tdee+300;goal=T({vi:'tăng ~0,25 kg/tuần — thêm khối cơ giúp tăng tốc độ',en:'gain ~0.25 kg/week — added muscle helps build speed'})}
  else {kcal=tdee;goal=T({vi:'giữ cân, +150 kcal ngày tập nặng',en:'maintain weight, +150 kcal on heavy training days'})}
  var pr=[Math.round(p.w*1.6),Math.round(p.w*2)], carb=[Math.round(p.w*3),Math.round(p.w*5)];
  var nt='<div class="tbl-scroll"><table class="tbl"><tr><th>'+T({vi:'Chỉ số',en:'Metric'})+'</th><th>'+T({vi:'Của bạn',en:'Yours'})+'</th><th>'+T({vi:'Ghi chú',en:'Notes'})+'</th></tr>'+
    row(T({vi:'BMI (chuẩn châu Á)',en:'BMI (Asian standard)'}),vn(P.bmi.toFixed(1))+' · '+P.bmiCat,T({vi:'18,5–22,9 là bình thường',en:'18.5–22.9 is normal'}))+
    row(T({vi:'Năng lượng nền (BMR)',en:'Basal metabolic rate (BMR)'}),num(Math.round(bmr))+' kcal','Mifflin–St Jeor')+
    row(T({vi:'Tiêu hao/ngày (TDEE)',en:'Daily expenditure (TDEE)'}),num(tdee)+' kcal',p.days+T({vi:' buổi/tuần',en:' sessions/week'})+(p.sport&&p.sport!=='none'?T({vi:' + môn phụ',en:' + side sport'}):''))+
    row(T({vi:'Mục tiêu năng lượng',en:'Energy target'}),'<b>'+num(Math.round(kcal/50)*50)+T({vi:' kcal/ngày',en:' kcal/day'})+'</b>',goal)+
    row('Protein','<b>'+pr[0]+'–'+pr[1]+T({vi:' g/ngày',en:' g/day'})+'</b>',T({vi:'~'+Math.round(pr[0]/4)+' g × 4 bữa — thịt, cá, trứng, sữa, đậu',en:'~'+Math.round(pr[0]/4)+' g × 4 meals — meat, fish, eggs, dairy, beans'}))+
    row(T({vi:'Carb ngày tập',en:'Training-day carbs'}),'<b>'+carb[0]+'–'+carb[1]+' g</b>',T({vi:'ăn 2–3 giờ trước buổi tập',en:'eat 2–3 hours before training'}))+
    row(T({vi:'Nước',en:'Water'}),P.water+T({vi:' + 0,5–0,75 L mỗi buổi tập',en:' + 0.5–0.75 L per training session'}),T({vi:'nước tiểu vàng nhạt là đủ',en:'pale yellow urine means you\'re drinking enough'}))+
    row(T({vi:'Ngủ',en:'Sleep'}),(p.age>=60?'7–8':'7–9')+T({vi:' giờ',en:' hours'}),T({vi:'ngủ < 6 giờ làm tốc độ phản xạ giảm rõ rệt',en:'under 6 hours of sleep noticeably slows your reactions'}))+'</table></div>';
  H.push(sec(T({vi:'🍚 Dinh dưỡng &amp; phục hồi',en:'🍚 Nutrition &amp; recovery'}),nt));

  /* 5. Rủi ro & phòng ngừa */
  var rk=[];
  if(inj.back) rk.push(T({vi:'<b>Lưng dưới:</b> khởi động thêm Bird dog ×6/bên + McGill curl-up ×5 (đã chèn vào mọi buổi). Tránh gập–xoay lưng dưới tải; swing max chỉ khi đã khởi động 10 phút.',en:'<b>Lower back:</b> add Bird dog ×6/side + McGill curl-up ×5 to your warm-up (already added to every session). Avoid loaded lower-back flexion + rotation; only swing at max after a 10-minute warm-up.'}));
  if(inj.knee) rk.push(T({vi:'<b>Gối:</b> thêm Band walk ngang ×10/bên vào khởi động (đã chèn). Mọi bài squat/lunge giới hạn trong biên độ không đau; không bật nhảy.',en:'<b>Knees:</b> add lateral Band walk ×10/side to the warm-up (already added). Keep every squat/lunge within a pain-free range; no jumping.'}));
  if(inj.shoulder) rk.push(T({vi:'<b>Vai:</b> thêm Band pull-apart ×15 + xoay ngoài với dây ×12 vào khởi động (đã chèn). Overspeed giảm còn 2×5.',en:'<b>Shoulders:</b> add Band pull-apart ×15 + banded external rotation ×12 to the warm-up (already added). Overspeed reduced to 2×5.'}));
  if(inj.elbow) rk.push(T({vi:'<b>Khuỷu/cổ tay:</b> thêm gập cổ tay eccentric ×15 vào khởi động (đã chèn). Grip gậy vừa đủ chặt; giảm số bóng nếu đau mặt trong khuỷu.',en:'<b>Elbow/wrist:</b> add eccentric wrist curls ×15 to the warm-up (already added). Grip the club only as tight as needed; hit fewer balls if the inside of your elbow hurts.'}));
  if(inj.heart) rk.push(T({vi:'<b>Tim mạch:</b> không nín thở khi gắng sức, nghỉ đủ giữa set; dừng ngay nếu tức ngực, chóng mặt.',en:'<b>Heart:</b> don\'t hold your breath under effort, rest fully between sets; stop immediately if you feel chest tightness or dizziness.'}));
  if(p.age>=50) rk.push(T({vi:'<b>'+p.age+' tuổi:</b> phục hồi chậm hơn — giữ tối thiểu 48 giờ giữa 2 buổi tạ nặng và tuần deload đúng hạn.',en:'<b>Age '+p.age+':</b> recovery is slower — keep at least 48 hours between heavy lifting sessions and take deload weeks on schedule.'}));
  if(P.bmi>=27.5) rk.push(T({vi:'<b>Khối lượng cơ thể lớn:</b> ưu tiên bài không va chạm, khởi động cổ chân–gối kỹ.',en:'<b>Higher body mass:</b> favor low-impact exercises and warm up ankles and knees thoroughly.'}));
  if(JUMPY[p.sport]) rk.push('<b>'+SPORTS[p.sport].replace(/^\S+\s/,'')+':</b> '+T({vi:'tuần chơi 2+ buổi thì bỏ bài bật nhảy tuần đó.',en:'in weeks you play 2+ times, skip that week\'s jumping exercises.'}));
  if(!rk.length) rk.push(T({vi:'Không có yếu tố rủi ro đặc biệt. Giữ khởi động đủ 5–8 phút, không swing max khi cơ còn nguội.',en:'No special risk factors. Keep a full 5–8 minute warm-up and don\'t swing at max while your muscles are still cold.'}));
  H.push(sec(T({vi:'🛡 Rủi ro &amp; phòng ngừa',en:'🛡 Risks &amp; prevention'}),'<ul class="adj">'+rk.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'));
  return H.join('');
}

/* ===== PHÂN TÍCH SWING TỪ ĐIỂM KHỚP (lõi, không phụ thuộc giao diện) =====
   frames: [{t, l:[[x,y,vis]×33] | null}] toạ độ chuẩn hoá 0–1; W,H: kích thước video.
   opt: {hand:'r'|'l', view:'auto'|'fo'|'dtl'}                                        */
function swingAnalyze(frames,W,H,opt){
  opt=opt||{};
  var LM={nose:0,lSh:11,rSh:12,lEl:13,rEl:14,lWr:15,rWr:16,lHip:23,rHip:24,lKn:25,rKn:26,lAn:27,rAn:28};
  function P(f,i){var p=f.l[i];return {x:p[0]*W,y:p[1]*H,v:p[2]}}
  function mid(a,b){return {x:(a.x+b.x)/2,y:(a.y+b.y)/2}}
  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  function ang3(a,b,c){var v1=[a.x-b.x,a.y-b.y],v2=[c.x-b.x,c.y-b.y];var d=(v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(v1[0],v1[1])*Math.hypot(v2[0],v2[1])||1);return Math.acos(Math.max(-1,Math.min(1,d)))*180/Math.PI}
  function med(a){var s=a.slice().sort(function(x,y){return x-y});return s.length?s[Math.floor(s.length/2)]:NaN}

  /* 1. Chuỗi khung hợp lệ + nội suy khoảng trống ngắn */
  var F=frames.filter(function(f){return f.l});
  if(F.length<12) return {ok:false,err:'noperson'};
  var rows=F.map(function(f){
    var r={t:f.t};
    ['nose','lSh','rSh','lEl','rEl','lWr','rWr','lHip','rHip','lKn','rKn','lAn','rAn'].forEach(function(k){r[k]=P(f,LM[k])});
    r.sh=mid(r.lSh,r.rSh); r.hip=mid(r.lHip,r.rHip); r.hand=mid(r.lWr,r.rWr);
    r.vis=f.l.reduce(function(s,p){return s+(p[2]||0)},0)/33;
    return r;
  });
  /* làm mượt tay (trung vị 3 điểm) — tay là tín hiệu tách pha */
  var hx=rows.map(function(r){return r.hand.x}),hy=rows.map(function(r){return r.hand.y});
  rows.forEach(function(r,i){if(i>0&&i<rows.length-1){r.hand={x:med([hx[i-1],hx[i],hx[i+1]]),y:med([hy[i-1],hy[i],hy[i+1]])}}});

  var T=med(rows.map(function(r){return dist(r.sh,r.hip)}));   /* chiều dài thân — thước đo chung */
  var tall=med(rows.map(function(r){return Math.max(r.lAn.y,r.rAn.y)-r.nose.y}));
  if(!(T>0)) return {ok:false,err:'noperson'};

  /* 2. Tách pha theo mẫu: tay THẤP & đứng yên (address) → CAO (đỉnh) → THẤP (impact) → CAO (kết thúc).
        Độ cao tay đo so với hông của chính khung đó nên không lệch khi người cúi / máy quay rung. */
  var n=rows.length, i, j;
  var rel=rows.map(function(r){return (r.hand.y-r.hip.y)/T});      /* 0 ≈ ngang hông; âm = cao hơn hông */
  var lowRef=med(rel.slice().sort(function(a,b){return b-a}).slice(0,Math.max(3,Math.floor(n*.25))));  /* mức tay thấp điển hình */
  var LOWT=lowRef-.35, HIGHT=lowRef-1.25;                            /* ngưỡng "thấp" và "cao" */
  var lab=rel.map(function(y){return y>LOWT?'L':y<HIGHT?'H':'M'});
  var cands=[];
  for(i=0;i<n;i++){
    if(lab[i]!=='H'||(i>0&&lab[i-1]==='H')) continue;               /* đầu một đoạn CAO */
    var a0=-1; for(j=i-1;j>=0;j--){ if(lab[j]==='L'){a0=j;break} if(lab[j]==='H') break }
    if(a0<0) continue;                                              /* phải đi lên từ vùng thấp */
    var e=i; while(e+1<n&&lab[e+1]!=='L') e++;                       /* hết đoạn trước khi về thấp */
    if(e+1>=n) continue;                                            /* không thấy tay quay về = không có impact */
    var tp=i; for(j=i;j<=e;j++) if(rel[j]<rel[tp]) tp=j;
    /* sau impact phải có tay lên cao lại (kết thúc) — lọc động tác vẫy gậy */
    var f1=-1; for(j=e+1;j<n;j++){ if(lab[j]==='H'){f1=j;break} }
    if(f1<0) continue;
    var dsp=(rel[e+1]-rel[tp])/((rows[e+1].t-rows[tp].t)||1e-3);    /* tốc độ tay đi xuống */
    cands.push({a0:a0,top:tp,im:e+1,f1:f1,dsp:dsp});
  }
  if(!cands.length) return {ok:false,err:'noswing',T:T};
  var C=cands.reduce(function(a,b){return b.dsp>a.dsp?b:a});         /* cú có xuống gậy nhanh nhất */
  var top=C.top;
  /* address: đoạn tay đứng yên cuối cùng trong vùng thấp trước khi lên gậy */
  var a1=C.a0; while(a1-1>=0&&lab[a1-1]==='L') a1--;
  /* khung tĩnh muộn nhất: cửa sổ ±2 khung mà tay dao động < 0,06T (góc chính diện tay đi ngang khi lên gậy) */
  var still=-1;
  for(j=C.a0;j>=a1;j--){
    var okS=true, win=.3*(opt.slow||1);                              /* cửa sổ theo THỜI GIAN, không theo số khung */
    for(var k=j;k>=a1&&rows[j].t-rows[k].t<=win;k--) if(dist(rows[k].hand,rows[j].hand)>.06*T){okS=false;break}
    for(k=j;okS&&k<top&&rows[k].t-rows[j].t<=win;k++) if(dist(rows[k].hand,rows[j].hand)>.06*T){okS=false;break}
    if(okS){still=j;break}
  }
  if(still<0) still=a1;
  var A0={x:rows[still].hand.x,y:rows[still].hand.y};
  var ts=still; for(j=still;j<top;j++){ if(dist(rows[j].hand,A0)<=.04*T) ts=j; else break }
  var ad=still;
  /* impact: tay đi xuống cắt lại độ cao address (nội suy); lấy mốc tay thấp nhất nếu lấy mẫu thưa */
  var yImp=A0.y-.05*T, im=C.im, tImp=rows[im].t;
  for(j=top+1;j<n;j++){ if(rows[j].hand.y>=yImp){ im=j;
      var a=rows[j-1],b=rows[j]; tImp=a.t+(b.t-a.t)*Math.max(0,Math.min(1,(yImp-a.hand.y)/((b.hand.y-a.hand.y)||1))); break }
    if(j>C.f1) break }
  if(rows[im].hand.y<yImp){ var lo=C.im; for(j=top+1;j<C.f1;j++) if(rows[j].hand.y>rows[lo].hand.y) lo=j; im=lo; tImp=rows[lo].t }
  /* đỉnh = lúc tay ĐỔI CHIỀU: điểm tay đi xa nhất theo hướng lên gậy (tính từ address).
     Ổn định hơn "tay cao nhất" vì ở đỉnh tay gần như đứng yên theo chiều cao khá lâu. */
  var ux=rows[top].hand.x-A0.x, uy=rows[top].hand.y-A0.y, ul=Math.hypot(ux,uy)||1; ux/=ul; uy/=ul;
  function prog(k){return (rows[k].hand.x-A0.x)*ux+(rows[k].hand.y-A0.y)*uy}
  var tp2=top;
  for(j=ts+1;j<im;j++) if(prog(j)>prog(tp2)) tp2=j;
  top=tp2;
  var tTop=rows[top].t;
  if(top>0&&top<n-1){var y0=prog(top-1),y1=prog(top),y2=prog(top+1),den=y0-2*y1+y2;if(den<0){var off=.5*(y0-y2)/den;if(Math.abs(off)<1) tTop+=off*(rows[top+1].t-rows[top-1].t)/2}}
  var tStart=rows[ts].t;
  if(ts<n-1){var c=rows[ts],d=rows[ts+1],d0=dist(c.hand,A0),d1=dist(d.hand,A0);if(d1>d0) tStart=c.t+(d.t-c.t)*Math.max(0,Math.min(1,(.04*T-d0)/(d1-d0)))}
  /* kết thúc: tay cao nhất sau impact, trong khoảng bằng 1,5 lần thời gian swing */
  var span=tImp-tStart, fin=im;
  for(j=im;j<n&&rows[j].t-tImp<=1.5*span;j++) if(rows[j].hand.y<rows[fin].hand.y) fin=j;
  var back=tTop-tStart, down=tImp-tTop;
  if(!(back>0&&down>0)) return {ok:false,err:'noswing',T:T};

  var R={A:rows[ad],Tp:rows[top],I:rows[im],Fn:rows[fin]};
  /* 3. Góc quay: tự nhận diện */
  /* chính diện: hai bàn chân và hai vai tách xa nhau; dọc đường bóng: gần như chồng lên nhau */
  var spread=(Math.abs(R.A.lAn.x-R.A.rAn.x)+Math.abs(R.A.lSh.x-R.A.rSh.x))/T;
  var view=opt.view&&opt.view!=='auto'?opt.view:(spread>=.8?'fo':'dtl');
  var lefty=opt.hand==='l';
  var lead=lefty?{sh:'rSh',el:'rEl',wr:'rWr',hip:'rHip',kn:'rKn',an:'rAn'}:{sh:'lSh',el:'lEl',wr:'lWr',hip:'lHip',kn:'lKn',an:'lAn'};
  var trail=lefty?{sh:'lSh',hip:'lHip',kn:'lKn',an:'lAn'}:{sh:'rSh',hip:'rHip',kn:'rKn',an:'rAn'};
  var M={}, out={ok:true,view:view,viewAuto:!(opt.view&&opt.view!=='auto'),T:T,sizeRatio:tall/H,
    times:{start:tStart,top:tTop,impact:tImp,finish:R.Fn.t},idx:{address:ad,top:top,impact:im,finish:fin},frames:rows,keys:R,metrics:M,
    avgVis:rows.slice(ad,fin+1).reduce(function(s,r){return s+r.vis},0)/Math.max(1,fin-ad+1)};
  M.tempo=back/down; M.back=back; M.down=down;
  M.handTop=(R.A.sh.y-R.Tp.hand.y)/T;                    /* tay ở đỉnh cao hơn vai address bao nhiêu T */
  function spineFromVertical(r){return Math.atan2(r.sh.x-r.hip.x,r.hip.y-r.sh.y)*180/Math.PI}   /* dương = vai lệch sang +x */

  if(view==='fo'){
    var tdir=Math.sign(R.A[lead.sh].x-R.A[trail.sh].x)||1;        /* hướng mục tiêu trên màn hình */
    out.tdir=tdir;
    var hwA=Math.abs(R.A.lHip.x-R.A.rHip.x);
    M.headSway=(R.Tp.nose.x-R.A.nose.x)*-tdir/T;              /* + = đầu lùi xa mục tiêu ở đỉnh */
    M.headImpact=(R.I.nose.x-R.A.nose.x)*tdir/T;              /* + = đầu lao về phía mục tiêu lúc impact */
    M.headDrop=(R.I.nose.y-R.A.nose.y)/T;                     /* + = đầu hạ thấp */
    M.hipSway=(R.Tp.hip.x-R.A.hip.x)*-tdir/T;                 /* + = hông trượt xa mục tiêu ở đỉnh */
    M.hipShift=(R.I.hip.x-R.A.hip.x)*tdir/T;                  /* + = hông dồn về mục tiêu lúc impact */
    M.shTurn=Math.acos(Math.max(0,Math.min(1,Math.abs(R.Tp.lSh.x-R.Tp.rSh.x)/Math.abs(R.A.lSh.x-R.A.rSh.x))))*180/Math.PI;
    M.hipTurn=Math.acos(Math.max(0,Math.min(1,Math.abs(R.Tp.lHip.x-R.Tp.rHip.x)/(hwA||1))))*180/Math.PI;
    M.xFactor=M.shTurn-M.hipTurn;
    M.leadArm=ang3(R.Tp[lead.sh],R.Tp[lead.el],R.Tp[lead.wr]);
    M.spineTilt=spineFromVertical(R.A)*-tdir;                 /* + = vai nghiêng xa mục tiêu (đúng với driver) */
    M.finishOver=(R.Fn.hip.x-R.Fn[lead.an].x)*tdir/(hwA||T*.5);/* 0 = hông ngay trên chân trước; âm = còn ở phía sau */
    M.stance=Math.abs(R.A.lAn.x-R.A.rAn.x)/Math.abs(R.A.lSh.x-R.A.rSh.x);
  } else {
    var bdir=Math.sign(R.A.hand.x-R.A.hip.x)||1;               /* hướng về phía bóng */
    out.bdir=bdir;
    function fwdBend(r){return Math.atan2((r.sh.x-r.hip.x)*bdir,r.hip.y-r.sh.y)*180/Math.PI}
    var side=(R.A.lKn.v+R.A.lHip.v+R.A.lAn.v)>(R.A.rKn.v+R.A.rHip.v+R.A.rAn.v)?'l':'r';
    function knee(r){return 180-ang3(r[side+'Hip'],r[side+'Kn'],r[side+'An'])}
    M.spineAddr=fwdBend(R.A); M.spineTop=fwdBend(R.Tp); M.spineImp=fwdBend(R.I);
    M.kneeFlex=knee(R.A);
    M.hipToBall=(R.I.hip.x-R.A.hip.x)*bdir/T;                  /* + = hông lao về phía bóng (early extension) */
    M.headToBall=(R.I.nose.x-R.A.nose.x)*bdir/T;
    M.headRise=(R.A.nose.y-R.I.nose.y)/T;                      /* + = đầu nhô lên lúc impact */
    /* đường tay: so vị trí ngang lúc lên và xuống ở cùng độ cao (giữa hông và vai) */
    var lvl=R.A.hand.y-.9*T, xb=null, xd=null;
    for(j=ad+1;j<=top;j++){var p0=rows[j-1].hand,p1=rows[j].hand;if(p0.y>=lvl&&p1.y<lvl){xb=p0.x+(p1.x-p0.x)*(p0.y-lvl)/((p0.y-p1.y)||1);break}}
    for(j=top+1;j<=im;j++){p0=rows[j-1].hand;p1=rows[j].hand;if(p0.y<lvl&&p1.y>=lvl){xd=p0.x+(p1.x-p0.x)*(lvl-p0.y)/((p1.y-p0.y)||1);break}}
    M.pathDiff=(xb!=null&&xd!=null)?(xd-xb)*bdir/T:null;         /* + = xuống gậy phía ngoài (over-the-top) */
  }
  return out;
}

/* ---------- Áp hồ sơ vào dữ liệu trước khi trang render ---------- */
if(ME){
  try{
    PLAN=computePlan(ME);
    var S1=tweakSessions(ME,PLAN), C1=tweakChanges(ME,PLAN);
    SESSIONS=S1; CHANGES=C1;
  }catch(err){ console.error('Hồ sơ lỗi, dùng giáo án mẫu',err); PLAN=null; }
}
/* ===== HỒ SƠ: áp số liệu cá nhân lên trang ===== */
function $id(i){return document.getElementById(i)}
var CH={ymin:82,ymax:110,target:105};   /* thang biểu đồ mph */
function applyProfileDom(){
  var p=ME,P=PLAN;
  var who=$id('who');
  sectionChips();
  if(!P){
    who.innerHTML=L('<span>👋 Người mới? Tạo hồ sơ để giáo án tính theo cơ thể và cây gậy của bạn.</span><button class="btn" type="button" data-ob="new">＋ Tạo hồ sơ</button>','<span>👋 New here? Create a profile so the program is built around your body and your club.</span><button class="btn" type="button" data-ob="new">＋ Create profile</button>');
    return;
  }
  var H=(p.h/100).toFixed(2).replace('.','m').replace(/0$/,'');
  who.innerHTML='<span>👤 <b>'+esc(p.name)+'</b> · '+H+' · '+p.w+' kg · '+p.age+L(' tuổi',' yrs')+'</span><button class="btn" type="button" data-ob="edit">'+L('Sửa hồ sơ','Edit profile')+'</button>';
  document.title=L('Giáo án của '+p.name,p.name+'’s program')+' — '+P.tot0+' → '+P.tot12+L(' yard',' yd');

  /* Hero */
  $id('hero-h1').innerHTML=P.tot0+' <span class="to">→ '+P.tot12+'</span> '+L('YARD','YARDS');
  var lo=Math.floor((P.tot0-10)/25)*25, stp=Math.max(10,Math.ceil((P.tot12hi-lo)/4/5)*5), hi=lo+stp*4;
  var track=$id('hero-range').querySelector('.range-track');
  track.querySelectorAll('.marker').forEach(function(m,i){m.textContent=lo+stp*i});
  var bp=clamp((P.tot0-lo)/(hi-lo)*100,2,98);
  track.style.setProperty('--ball',bp.toFixed(1)+'%');
  $id('hero-range').setAttribute('aria-label',L('Thang cự ly: hiện tại '+P.tot0+' yard, mục tiêu '+P.tot12+' yard','Distance scale: current '+P.tot0+' yd, target '+P.tot12+' yd'));
  $id('hero-cap').innerHTML='<span>'+L('Xuất phát','Start')+': <b>~'+P.tot0+' yd · '+(P.est?'≈':'')+mph(P.v0)+' mph</b></span><span>'+L('Mốc 6 tháng','6-month milestone')+': <b>~'+mph(P.v6)+' mph</b></span><span>'+L('Đích 12 tháng','12-month goal')+': <b>'+mph(P.v12)+'+ mph</b></span>';
  var c=$id('hero-ath').querySelectorAll('.num');
  c[0].textContent=H+' · '+p.w+'kg'; c[1].textContent='~'+P.protein+' g'; c[2].textContent=P.water; c[3].textContent=(p.age>=60?'7–8':'7')+L(' giờ',' hrs');
  var injAny=(p.inj&&(p.inj.back||p.inj.knee||p.inj.shoulder||p.inj.elbow||p.inj.heart));
  $id('hero-honest').innerHTML=L('<strong>Cam kết trung thực:</strong> '+mph(P.v12)+' mph với smash 1.48 và launch tối ưu cho carry ~'+P.car12+' yd, tổng lăn '+P.tot12lo+'–'+P.tot12hi+' yd tùy fairway. Mục tiêu +'+Math.round(P.gain*100)+'% tốc độ được tính từ tuổi, kinh nghiệm tập tạ, số buổi/tuần'+(injAny?' và tình trạng sức khỏe':'')+' của bạn (~+'+vn(((P.v12-P.v0)/11).toFixed(1))+' mph/tháng). Chậm hơn 2 tháng so với mốc thì đừng nản — chỉ cần đường cong vẫn đi lên.',
    '<strong>Honest promise:</strong> '+mph(P.v12)+' mph with a 1.48 smash and optimal launch gives ~'+P.car12+' yd carry, '+P.tot12lo+'–'+P.tot12hi+' yd total with roll depending on the fairway. The +'+Math.round(P.gain*100)+'% speed target is based on your age, lifting experience, sessions per week'+(injAny?' and health':'')+' (~+'+vn(((P.v12-P.v0)/11).toFixed(1))+' mph/month). If you are 2 months behind a milestone, don’t get discouraged — all that matters is that the curve keeps rising.');
  $id('foot-who').textContent=L('Giáo án 300 Yard 3.0 · Lộ trình 12 tháng · Cá nhân hóa cho '+p.name+' · '+H+' · '+p.w+' kg · Nguyên lý TPI (Titleist Performance Institute)','300 Yard Program 3.0 · 12-month roadmap · Personalized for '+p.name+' · '+H+' · '+p.w+' kg · TPI principles (Titleist Performance Institute)');

  /* Lộ trình: mốc mph từng tháng */
  var rows=$id('road-tbl').querySelectorAll('tr');
  for(var i=1;i<rows.length&&i<=12;i++){
    var td=rows[i].lastElementChild, m=P.months[i-1], t=mph(m);
    if(i===6) t=mph(m)+L(' · TEST giữa năm (~',' · MID-YEAR TEST (~')+P.tot6+' yd)';
    if(i===11) t=mph(m)+' (peak)';
    if(i===12) t=mph(m)+L('+ · TEST cuối năm (','+ · YEAR-END TEST (')+P.tot12lo+'–'+P.tot12hi+' yd)';
    td.textContent=t;
  }

  /* Bảng monitor */
  var sm0=P.smash0||1.44, lw6=launchWin(P.v6), lw12=launchWin(P.v12), sp6=spinWin(P.v6), sp12=spinWin(P.v12);
  var mrows=[
    ['Club speed',(P.est?'≈ ':'')+mph(P.v0)+' mph',mph(P.v6)+' mph',mph(P.v12)+'+ mph'],
    ['Ball speed',p.bs?p.bs+' mph':'≈ '+Math.round(P.v0*sm0),'≈ '+Math.round(P.v6*1.47),Math.round(P.v12*1.48)+'+'],
    ['Smash factor',P.smash0?P.smash0.toFixed(2):'1.42–1.46','≥ 1.47','1.48–1.50'],
    ['Launch angle',p.launch!=null?vn(p.launch)+L('° (đo)','° (measured)'):L('đo thực tế','measure it'),lw6[0]+'–'+lw6[1]+'°',lw12[0]+'–'+lw12[1]+'°'],
    ['Spin rate',p.spin!=null?num(p.spin)+L(' rpm (đo)',' rpm (measured)'):L('đo thực tế','measure it'),num(sp6[0])+'–'+num(sp6[1])+' rpm',num(sp12[0])+'–'+num(sp12[1])+' rpm'],
    ['Attack angle',p.aoa!=null?vn(p.aoa)+L('° (đo)','° (measured)'):L('đo thực tế','measure it'),'+'+aoaWin(P.v6)[0]+'° → +'+aoaWin(P.v6)[1]+'°','+3° → +5°'],
    [L('Carry / Tổng','Carry / Total'),'~'+P.car0+' / '+P.tot0+' yd','~'+P.car6+' / '+P.tot6+' yd','~'+P.car12+' / '+P.tot12lo+'–'+P.tot12hi+' yd']
  ];
  $id('mon-tbl').innerHTML=L('<tr><th>Chỉ số</th><th>Xuất phát</th><th>Mốc 6 tháng</th><th class="hl">Đích 12 tháng</th></tr>','<tr><th>Metric</th><th>Start</th><th>6-month milestone</th><th class="hl">12-month goal</th></tr>')+
    mrows.map(function(r){return '<tr><td class="m">'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td class="hl">'+r[3]+'</td></tr>'}).join('');
  $id('mon-note').textContent=L('Ở ~'+mph(P.v0)+' mph, chuyển attack angle từ −5° sang +5° có thể cộng ~'+yd5(P.v0*.3)+' yard carry mà không cần swing nhanh hơn — luôn săn "yard miễn phí" này trước.','At ~'+mph(P.v0)+' mph, moving your attack angle from −5° to +5° can add ~'+yd5(P.v0*.3)+' yd of carry without swinging any faster — always chase these "free yards" first.');

  /* Nhật ký */
  CH.target=Math.round(P.v12*2)/2; CH.ymin=Math.floor((P.v0-6)/5)*5; CH.ymax=Math.ceil((P.v12+5)/5)*5;
  $id('log-goal').textContent=mph(P.v12);

  /* Swing: số ngày */
  if(p.days===3) $id('swing-h2').textContent=L('🎯 Giáo án Swing — gộp vào Thứ 7 · 15 phút sau Speed','🎯 Swing program — merged into Saturday · 15 min after Speed');

  /* Nguyên tắc */
  var rules=document.querySelectorAll('#nguyentac .rule'), sp=SPORTS[p.sport];
  if(rules[3]) rules[3].innerHTML=sp?'<b>04 · '+sp.replace(/^\S+\s/,'')+L(' là tài sản.',' is an asset.')+'</b> '+(JUMPY[p.sport]?(PLAN.plyoRisk?L('Đây đã là bài di chuyển nhanh của tuần — giữ cường độ vừa phải, khởi động gối kỹ trước khi chơi.','This already counts as your fast-movement work for the week — keep the intensity moderate and warm up your knees well before playing.'):L('Nhưng tuần nào chơi 2+ buổi: bỏ Box Jump / Broad Jump tuần đó để bảo vệ gối.','But in any week you play 2+ times, drop Box Jump / Broad Jump that week to protect your knees.')):L('Giữ cường độ nhẹ–vừa, không chơi nặng ngay trước buổi Speed.','Keep it light to moderate, and don’t play hard right before a Speed session.'))
    :L('<b>04 · Ngày nghỉ vẫn vận động.</b> Không chơi môn phụ: ngày nghỉ đi bộ 30\' + mobility 15\' — tim phổi khỏe giúp phục hồi nhanh giữa các buổi.','<b>04 · Keep moving on rest days.</b> No second sport: on rest days walk 30\' + mobility 15\' — good cardio fitness speeds up recovery between sessions.');
  if(rules[4]) rules[4].innerHTML=L('<b>05 · Phục hồi = 50% kết quả.</b> Ngủ '+(p.age>=60?'7–8':'7')+'h · protein ~'+P.protein+' g/ngày (1,6 g/kg) · nước '+P.water+'. Đau nhói (khác mỏi) → dừng bài đó, quay lại biến thể GĐ trước.','<b>05 · Recovery = 50% of results.</b> Sleep '+(p.age>=60?'7–8':'7')+'h · protein ~'+P.protein+' g/day (1.6 g/kg) · water '+P.water+'. Sharp pain (not fatigue) → stop that exercise and go back to the previous phase’s variation.');

  /* Thuận tay trái: đảo chỉ dẫn trong phần Swing */
  if(P.lefty){
    var tw=document.createTreeWalker($id('swing'),NodeFilter.SHOW_TEXT,null,false),n;
    while((n=tw.nextNode())) n.nodeValue=lr(n.nodeValue);
  }
  personalizeCurriculum(p,P);
}
function fmtH(cm){return (cm/100).toFixed(2).replace('.','m').replace(/0$/,'')}
/* Nhãn ở đầu mỗi phần: giáo án riêng hay giáo án mẫu — tránh nhầm lẫn */
function sectionChips(){
  ['homnay','lotrinh','theluc','swing','monitor'].forEach(function(id){
    var h2=document.querySelector('#'+id+' > h2'); if(!h2) return;
    var d=document.createElement('div');
    d.innerHTML=PLAN?L('<span class="mine">✦ Giáo án riêng của '+esc(ME.name)+' — đã tính theo hồ sơ</span>','<span class="mine">✦ '+esc(ME.name)+'’s personal program — built from the profile</span>')
      :L('<button type="button" class="mine demo" data-ob="new">Giáo án mẫu · 1m70 · 72 kg · ~88 mph — bấm để tạo giáo án riêng</button>','<button type="button" class="mine demo" data-ob="new">Sample program · 1m70 · 72 kg · ~88 mph — tap to create your own</button>');
    h2.parentNode.insertBefore(d.firstChild,h2.nextSibling);
  });
}
function textSwap(root,pairs){
  var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),n,v;
  while((n=tw.nextNode())){v=n.nodeValue;pairs.forEach(function(q){v=v.replace(q[0],q[1])});if(v!==n.nodeValue)n.nodeValue=v}
}
function personalizeCurriculum(p,P){
  var sp=SPORTS[p.sport], B=swingBlocks(p,P), lm=p.dev==='lm', d3=p.days===3, inj=p.inj||{};
  $id('lede').textContent=L('Chương trình chu kỳ hóa trọn 1 năm của '+p.name+': Nền tảng → Sức mạnh → Công suất → Tốc độ, lặp 2 vòng. '+p.days+' buổi/tuần'+(sp?', xếp quanh lịch '+sp.replace(/^\S+\s/,''):'')+'. Mọi bài tập, mức tạ, mốc tốc độ và khối kỹ thuật bên dưới đã tính theo hồ sơ của bạn.',
    p.name+'’s full-year periodized program: Foundation → Strength → Power → Speed, repeated twice. '+p.days+' sessions/week'+(sp?', scheduled around '+sp.replace(/^\S+\s/,''):'')+'. Every exercise, load, speed milestone and technique block below is based on your profile.');
  document.querySelector('header .eyebrow').textContent=L('Giáo án 3.0 · Cá nhân hóa cho '+p.name+' · Thể lực + Swing · TPI-based','Program 3.0 · Personalized for '+p.name+' · Fitness + Swing · TPI-based');

  /* Thể lực: ghi chú theo lịch thực tế */
  var s2=document.querySelector('#ph2 .sub');
  if(s2) s2.textContent=L('Giữ nguyên '+SESSIONS.length+' buổi '+SESSIONS.map(function(s){return s.id}).join('·')+' ở trên (mức tạ đã theo hồ sơ). Chỉ đổi những bài dưới đây sang tạ nặng, ít rep, nghỉ dài 2–3 phút. GĐ5 lặp lại với tạ nặng hơn 15–20% và 5×5.',
    'Keep the '+SESSIONS.length+' sessions '+SESSIONS.map(function(s){return s.id}).join('·')+' above (loads already match your profile). Only switch the exercises below to heavy weight, low reps, long 2–3 min rests. Phase 5 repeats this with 15–20% heavier loads and 5×5.');
  var n4=document.querySelector('#ph4 .tbl-note');
  if(n4&&p.days<5) n4.textContent=L('Lịch '+p.days+' buổi: Overspeed 2 buổi/tuần — '+(d3?'T4 + T7':'T3 + T7')+' là bắt buộc. Thêm 10\' sáng CN nếu cơ thể tốt.',
    p.days+'-session schedule: Overspeed 2 sessions/week — '+(d3?'Wed + Sat':'Tue + Sat')+' are required. Add 10\' on Sunday morning if your body feels good.');

  /* Lộ trình: cột thể lực + swing theo đúng bài của bạn */
  var R=$id('road-tbl').querySelectorAll('tr');
  function cell(r,i){return R[r]&&R[r].children[i]}
  var TAG=' <span class="me-tag">✦</span>';
  var ph2n=[]; CHANGES.ph2.forEach(function(c){var m=c.w.match(/<b>(.*?)<\/b>/);if(m)ph2n.push(m[1].replace(/<[^>]+>/g,''))});
  var heavy=inj.back?'Hip thrust':p.eq==='gym'?'Trap bar DL':L('RDL tạ đơn','Dumbbell RDL');
  if(cell(2,2)) cell(2,2).innerHTML=(p.eq==='min'?L('⚠ Cần tạ từ tháng này. ','⚠ You need weights from this month. '):'')+L('Tạ nặng 4×5–6, nghỉ dài 2–3\'. Thêm ','Heavy 4×5–6, long 2–3\' rests. Add ')+ph2n.join(', ')+TAG;
  if(cell(4,2)) cell(4,2).innerHTML='Contrast training: '+heavy+' 3×3 + '+(P.plyoRisk?L('KB swing / step-up bùng nổ ngay sau (không bật nhảy)','explosive KB swing / step-up right after (no jumps)'):L('bật nhảy ngay sau','jumps right after'))+'. '+(p.eq==='min'?L('Dây kháng lực nặng → nhẹ','Resistance band heavy → light'):L('Med ball nặng ném hết lực','Heavy med ball, full-power throws'))+TAG;
  if(cell(9,2)) cell(9,2).innerHTML=L('Contrast nâng cao: ','Advanced contrast: ')+heavy+L(' 3×2 nặng + ',' 3×2 heavy + ')+(P.plyoRisk?L('KB swing bùng nổ','explosive KB swing'):'broad jump')+L('; ném bóng 1 tay','; one-arm ball throws')+TAG;
  if(p.days<5){
    if(cell(6,2)) cell(6,2).innerHTML=L('Giảm tạ 50%, mọi rep tốc độ tối đa. Overspeed 2 buổi/tuần','Cut loads 50%, every rep at max speed. Overspeed 2 sessions/week')+TAG;
    if(cell(11,2)) cell(11,2).innerHTML=L('Thể lực '+(d3?'1':'2')+' buổi duy trì. Overspeed Level 2, 2 buổi/tuần','Fitness: '+(d3?'1 maintenance session':'2 maintenance sessions')+'. Overspeed Level 2, 2 sessions/week')+TAG;
  }
  var gear=clubRows(p,P).filter(function(r){return (r.st==='warn'||r.st==='bad')&&r.k.indexOf('Launch')<0}).map(function(r){return r.k.toLowerCase()+' → '+r.now});
  if(cell(1,3)) cell(1,3).innerHTML+='<div class="me-inl">✦ '+L('Khối riêng: ','Your block: ')+esc(B[0].n)+(gear.length?'<br>🔧 '+L('Tuần 1 chỉnh gậy: ','Week 1 club tweaks: ')+esc(gear.join(' · ')):'')+'</div>';
  function monOf(fn){var f0=fn(P.v0);for(var i=0;i<12;i++) if(fn(P.months[i])!==f0) return i+1;return 0}
  var fmo=monOf(flexFor), lmo=monOf(function(v){return loftFor(v).join()});
  if(fmo&&R[fmo]) R[fmo].lastElementChild.innerHTML+='<div class="me-inl">🔧 '+L('Thử shaft ','Try a shaft: ')+FLEXN[flexFor(P.months[fmo-1])]+'</div>';
  if(lmo&&R[lmo]) R[lmo].lastElementChild.innerHTML+='<div class="me-inl">🔧 '+L('Xem lại loft: ','Recheck loft: ')+rng(loftFor(P.months[lmo-1]),'°')+'</div>';

  /* Giáo án Swing: khối riêng đầu mỗi buổi */
  var pick=[B[0],B[0],B[1]||B[0],B[1]||B[0]];
  document.querySelectorAll('#swing .card table').forEach(function(t,i){
    var b=pick[i]; if(!b) return;
    var tr=document.createElement('tr'); tr.className='me-row';
    tr.innerHTML='<td class="m">'+L('Mọi buổi','Every session')+'</td><td><span class="me-tag">✦ '+L('Khối riêng của bạn · ','Your personal block · ')+(d3?L('5\' · Thứ 7 sau Speed','5\' · Saturday after Speed'):L('10\' đầu buổi','first 10\''))+'</span><br><b>'+esc(b.n)+'</b> — '+esc(b.how)+
      ' · <b>'+esc(d3?(LANG==='en'?b.dose.replace('10 balls','6 balls'):b.dose.replace('10 bóng','6 bóng')):b.dose)+'</b>. '+L('Đạt khi: ','Passed when: ')+esc(b.chk)+'.'+
      (d3&&i===0?L('<br>Lịch 3 buổi: sau khối riêng chỉ làm <b>khối 1</b> của tuần.','<br>3-session schedule: after your personal block, do only <b>block 1</b> of the week.'):'')+'</td>'+
      '<td>'+(i===0&&gear.length?L('🔧 Trước tuần 1 chỉnh gậy: ','🔧 Before week 1, adjust your club: ')+esc(gear.join(' · ')):'—')+'</td>';
    var first=t.querySelector('tr'); first.parentNode.insertBefore(tr,first.nextSibling);
  });

  if(d3) textSwap($id('swing'),LANG==='en'?[[/Tuesday session — content/g,'Saturday (after Speed) — content'],[/Every Tuesday:/g,'Every Saturday:']]
    :[[/Buổi T3 — nội dung/g,'Thứ 7 (sau Speed) — nội dung'],[/Quy trình mỗi Thứ 3:/g,'Quy trình mỗi Thứ 7:']]);
  /* Chưa có launch monitor: đổi chỉ số theo dõi sang cách đo làm được */
  if(!lm){
    var pairs=LANG==='en'?[[/track left–right dispersion on the monitor/g,'count balls landing inside a ±20 yd corridor'],
      [/check attack angle \(target \+4°\)/g,'check the tee after each shot: tee flies forward = hitting up'],
      [/"9 virtual fairways" on the simulator/g,'"9 virtual fairways" at the range (use 2 markers as edges)'],
      [/record the full monitor data set/g,'record the average carry of 5 shots'],
      [/record the data set/g,'record the average carry'],
      [/keep smash ≥ 1\.46/g,'keep the spray mark centred on the face'],
      [/lock attack angle \+4°→\+5° on 8\/10 balls/g,'tee flies forward on 8/10 balls'],
      [/compare course numbers with the monitor/g,'compare with your range distances'],
      [/Week 1 attack angle · Week 2 stable club speed · Week 3 smash ≥ 1\.46 · Week 4 full data set/g,'Week 1 tee flight direction · Week 2 3:1 tempo · Week 3 centred spray mark · Week 4 average carry']]
    :[[/theo dõi độ lệch trái–phải trên monitor/g,'đếm bóng rơi trong hành lang ±20 yd'],
      [/chấm attack angle \(mục tiêu \+4°\)/g,'soi tee sau mỗi cú: tee bay về trước = đánh lên'],
      [/"9 fairway ảo" trên simulator/g,'"9 fairway ảo" ở sân tập (chọn 2 cột mốc làm biên)'],
      [/ghi bộ số liệu monitor đầy đủ/g,'ghi carry trung bình 5 cú'],
      [/ghi bộ số liệu/g,'ghi carry trung bình'],
      [/giữ smash ≥ 1\.46/g,'giữ dấu phấn giữa mặt gậy'],
      [/khóa attack angle \+4°→\+5° ở 8\/10 bóng/g,'tee bay về trước ở 8/10 bóng'],
      [/so số liệu sân với monitor/g,'so với cự ly ghi ở sân tập'],
      [/Tuần 1 attack angle · Tuần 2 club speed ổn định · Tuần 3 smash ≥ 1\.46 · Tuần 4 cả bộ số liệu/g,'Tuần 1 hướng bay của tee · Tuần 2 nhịp 3:1 · Tuần 3 dấu phấn giữa mặt · Tuần 4 carry trung bình']];
    if(p.dev==='none') pairs.push.apply(pairs,LANG==='en'?[[/log mph for every swing/g,'measure speed with an app/radar if you have one'],[/5 max drivers, log mph/g,'5 max drivers, log carry']]
      :[[/chấm mph từng cú/g,'đo tốc độ bằng app/radar nếu có'],[/5 driver max ghi mph/g,'5 driver max ghi carry']]);
    textSwap($id('swing'),pairs); textSwap($id('lotrinh'),pairs);
    $id('mon-note').textContent+=L(' Chưa có launch monitor: theo dõi hàng Club speed'+(p.dev==='radar'?' (radar)':' (app/radar)')+' và Carry/Tổng; các hàng còn lại dùng khi đi fitting.',' No launch monitor yet: track the Club speed'+(p.dev==='radar'?' (radar)':' (app/radar)')+' and Carry/Total rows; the other rows are for when you get fitted.');
  }
  var rules=document.querySelectorAll('#nguyentac .rule');
  if(d3&&rules[0]) rules[0].innerHTML=L('<b>01 · Tách ý định.</b> Thứ 7: 30\' tốc độ trước (nhanh, mặc kệ hướng bóng), 15\' kỹ thuật sau (chậm, có ý định). Không trộn lẫn trong cùng một cú.','<b>01 · Separate your intentions.</b> Saturday: 30\' of speed first (fast, ignore where the ball goes), then 15\' of technique (slow, deliberate). Never mix both in the same swing.');
}

/* ===== HỒ SƠ: khung báo cáo ===== */
function renderProfile(){
  var host=$id('prof-host'), p=ME, P=PLAN;
  var sel=(PROFILES.length?'<select id="prof-sel" aria-label="'+L('Chọn hồ sơ','Choose profile')+'"><option value="">'+L('Giáo án mẫu','Sample program')+'</option>'+
    PROFILES.map(function(x){return '<option value="'+x.id+'"'+(p&&x.id===p.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>':'');
  if(!P){
    host.innerHTML='<div class="prof-cta"><div><h3>'+L('Người mới? Bắt đầu từ hồ sơ của bạn','New here? Start with your profile')+'</h3>'+
      '<p>'+L('Nhập chiều cao, cân nặng, tuổi, sức khỏe và thông số driver hay dùng. Giáo án sẽ tự tính tải tạ, thay bài phù hợp, xếp lịch theo số buổi bạn có, đặt mốc mph và chỉ ra điểm cần chỉnh ở cây gậy.','Enter your height, weight, age, health and the specs of the driver you use. The program will work out your loads, swap in suitable exercises, schedule around the sessions you have, set mph milestones and point out what to adjust on your club.')+'</p></div>'+
      '<div class="prof-tools">'+sel+'<button class="btn" type="button" data-ob="new">'+L('＋ Tạo hồ sơ (2 phút)','＋ Create profile (2 min)')+'</button></div></div>';
    return;
  }
  var inj=p.inj||{}, injL=[['back',L('lưng dưới','lower back')],['knee',L('gối','knee')],['shoulder',L('vai','shoulder')],['elbow',L('khuỷu/cổ tay','elbow/wrist')],['heart',L('tim mạch','heart')]].filter(function(x){return inj[x[0]]}).map(function(x){return x[1]});
  var tags=[p.sex==='f'?L('Nữ','Female'):L('Nam','Male'),p.age+L(' tuổi',' years old'),'BMI '+vn(P.bmi.toFixed(1))+' · '+P.bmiCat,p.hand==='l'?L('Thuận tay trái','Left-handed'):L('Thuận tay phải','Right-handed'),
    (LANG==='en'?{new:'Golf < 1 year',y13:'Golf 1–3 years',y310:'Golf 3–10 years',gt10:'Golf > 10 years'}:{new:'Golf < 1 năm',y13:'Golf 1–3 năm',y310:'Golf 3–10 năm',gt10:'Golf > 10 năm'})[p.golf]+((p.hcp!==null&&p.hcp!==undefined&&p.hcp!=='')?' · HCP '+p.hcp:''),
    p.days+L(' buổi/tuần',' sessions/week'),(LANG==='en'?{gym:'Gym',home:'Home weights',min:'Resistance bands'}:{gym:'Phòng gym',home:'Tạ tại nhà',min:'Dây kháng lực'})[p.eq]];
  if(injL.length) tags.push('⚠ '+injL.join(', '));
  var CR=clubRows(p,P), STN=LANG==='en'?{ok:'✓ Good fit',warn:'⚠ Worth checking',bad:'✕ Way off',na:'? Unknown'}:{ok:'✓ Phù hợp',warn:'⚠ Nên xem lại',bad:'✕ Lệch nhiều',na:'? Chưa rõ'};
  var c=p.club||{};
  host.innerHTML='<div class="prof">'+
    '<div class="prof-head"><div><div class="sess-kicker">'+L('Hồ sơ người tập','Golfer profile')+'</div><div class="prof-name">'+esc(p.name)+'</div>'+
      '<div class="prof-tags">'+tags.map(function(t){return '<span class="fact">'+esc(t)+'</span>'}).join('')+'</div></div>'+
      '<div class="prof-tools">'+sel+'<button class="btn y" type="button" data-ob="edit">'+L('✎ Sửa','✎ Edit')+'</button><button class="btn" type="button" data-ob="new">'+L('＋ Người mới','＋ New golfer')+'</button></div></div>'+
    '<div class="prof-body">'+
      '<div class="kpis">'+
        '<div class="kpi"><div class="v">'+(P.est?'≈':'')+mph(P.v0)+' <small>mph</small></div><div class="l">'+L('Tốc độ hiện tại','Current speed')+'</div></div>'+
        '<div class="kpi"><div class="v">'+mph(P.v6)+' <small>mph</small></div><div class="l">'+L('Mốc 6 tháng','6-month milestone')+'</div></div>'+
        '<div class="kpi hl"><div class="v">'+mph(P.v12)+' <small>mph</small></div><div class="l">'+L('Đích 12 tháng','12-month goal')+'</div></div>'+
        '<div class="kpi"><div class="v">'+P.tot0+'→'+P.tot12+' <small>yd</small></div><div class="l">'+L('Cự ly tổng','Total distance')+'</div></div>'+
      '</div>'+
      P.alerts.map(function(a){return '<div class="alert'+(a[0]==='i'?' i':'')+'">'+a[1]+'</div>'}).join('')+
      '<h4>'+L('📊 Phân tích chi tiết theo số liệu của bạn','📊 Detailed analysis of your numbers')+'</h4>'+(window.isPro&&!isPro()?proTeaser('report'):deepReport(p,P))+
      '<h4>'+L('🏌️ Phân tích driver','🏌️ Driver analysis')+(c.brand?' · '+esc(c.brand):'')+'</h4>'+
      '<div class="fit">'+CR.map(function(r){return '<div class="fit-i"><div class="fit-h"><span class="fit-k">'+r.k+'</span><span class="st '+r.st+'">'+STN[r.st]+'</span></div>'+
        '<div class="fit-g"><div><span>'+L('Gậy của bạn','Your club')+'</span><b>'+r.mine+'</b></div><div class="now"><span>'+L('Nên dùng lúc này','Use now')+'</span><b>'+r.now+'</b></div><div><span>'+L('Khi đạt đích','At your goal')+'</span><b>'+r.later+'</b></div></div>'+
        '<div class="why">'+r.why+'</div></div>'}).join('')+'</div>'+
      '<p class="tbl-note" style="color:#7A8780">'+L('Khuyến nghị theo chuẩn fitting phổ biến dựa trên tốc độ đầu gậy và chiều cao. Flex giữa các hãng không đồng nhất — trước khi mua gậy mới, hãy xác nhận bằng một buổi fitting có launch monitor.','Recommendations follow common fitting standards based on clubhead speed and height. Flex isn’t consistent between brands — before buying a new club, confirm with a fitting session on a launch monitor.')+'</p>'+
      (p.video&&(p.video.fo||p.video.dtl)?'':L('<div class="alert i">🎥 Chưa có phân tích video. <a href="#video" style="color:var(--green-deep);font-weight:800">Tải video swing lên</a> để ưu tiên kỹ thuật dựa trên chuyển động thật của bạn.</div>','<div class="alert i">🎥 No video analysis yet. <a href="#video" style="color:var(--green-deep);font-weight:800">Upload a swing video</a> to prioritize technique based on how you actually move.</div>'))+
      '<h4>'+L('🎯 Ưu tiên kỹ thuật — đã đưa vào Giáo án Swing','🎯 Technique priorities — built into the Swing program')+'</h4><ol class="plist">'+swingPriorities(p,P).map(function(x){return '<li><div>'+x+'</div></li>'}).join('')+'</ol>'+
      (P.notes.length?'<details class="adj-d"><summary>'+L('🛠 Tóm tắt '+P.notes.length+' điều chỉnh — đã áp dụng thẳng vào giáo án','🛠 Summary of '+P.notes.length+' adjustment'+(P.notes.length===1?'':'s')+' — applied directly to the program')+'</summary><ul class="adj">'+P.notes.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></details>':'<p class="tbl-note" style="color:#5C6B62">'+L('Thể trạng của bạn khớp giáo án chuẩn — giữ nguyên mức tạ và bài tập.','Your fitness matches the standard program — keep the loads and exercises as they are.')+'</p>')+
      '<p class="tbl-note" style="color:#7A8780;margin-top:12px">'+L('Tăng tạ khi hoàn thành đủ mọi set 2 tuần liên tiếp mà rep cuối còn dư ~2 rep. Mức tạ gợi ý là điểm bắt đầu, không phải giới hạn.','Increase the load once you complete every set for 2 weeks in a row and ~2 reps still in reserve on the last set. Suggested loads are a starting point, not a limit.')+'</p>'+
    '</div></div>';
}

/* ===== TRÌNH TẠO HỒ SƠ ===== */
var OB={el:$id('ob'),i:0,mode:'new',steps:LANG==='en'?['Personal info','Background & schedule','Health','Your driver','Ball-striking numbers']:['Thông tin cá nhân','Nền tảng & lịch tập','Sức khỏe','Driver bạn hay dùng','Số liệu đánh bóng']};
function chips(name,label,opts,type,hint){
  return '<div class="fld full" data-f="'+name+'"><span class="l">'+label+'</span><div class="chips">'+opts.map(function(o){
    return '<label><input type="'+(type||'radio')+'" name="'+name+'" value="'+o[0]+'"><span>'+o[1]+(o[2]?'<small>'+o[2]+'</small>':'')+'</span></label>';
  }).join('')+'</div>'+(hint?'<div class="h">'+hint+'</div>':'')+'</div>';
}
function inp(name,label,type,ph,hint,attrs,full){
  return '<div class="fld'+(full?' full':'')+'" data-f="'+name+'"><label class="l" for="ob-'+name+'">'+label+'</label><input id="ob-'+name+'" name="'+name+'" type="'+type+'"'+
    (type==='number'?' inputmode="decimal"':'')+' placeholder="'+(ph||'')+'" '+(attrs||'')+'>'+(hint?'<div class="h">'+hint+'</div>':'')+'</div>';
}
function sel(name,label,opts,hint){
  return '<div class="fld" data-f="'+name+'"><label class="l" for="ob-'+name+'">'+label+'</label><select id="ob-'+name+'" name="'+name+'">'+
    opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>'}).join('')+'</select>'+(hint?'<div class="h">'+hint+'</div>':'')+'</div>';
}
function obForm(){
  var lofts=[['',L('Không rõ','Not sure')]]; for(var l=7.5;l<=14;l+=.5) lofts.push([l,vn(l)+'°']);
  return [
  '<fieldset><legend>'+L('Bạn là ai?','Who are you?')+'</legend><div class="fg">'+
    inp('name',L('Tên gọi','Name'),'text',L('Ví dụ: Minh','e.g. Alex'),'','maxlength="40" autocomplete="given-name"',true)+
    chips('sex',L('Giới tính','Sex'),[['m',L('Nam','Male')],['f',L('Nữ','Female')]])+
    inp('age',L('Tuổi','Age'),'number','35','','min="10" max="90"')+
    inp('h',L('Chiều cao (cm)','Height (cm)'),'number','170','','min="130" max="215"')+
    inp('w',L('Cân nặng (kg)','Weight (kg)'),'number','72','','min="35" max="180" step="0.5"')+
    chips('hand',L('Đánh golf thuận tay','Golf handedness'),[['r',L('Tay phải','Right-handed'),L('đứng bên trái bóng','stand left of the ball')],['l',L('Tay trái','Left-handed'),L('đứng bên phải bóng','stand right of the ball')]])+
  '</div></fieldset>',
  '<fieldset><legend>'+L('Nền tảng &amp; thời gian tập','Background &amp; training time')+'</legend><div class="fg">'+
    chips('goal',L('Mục tiêu chính','Main goal'),[['basics',L('Nắm vững cơ bản','Learn the fundamentals')],['score',L('Giảm điểm · phá 90','Lower scores · break 90')],
      ['short',L('Short game & putting','Short game & putting')],['power',L('Tăng cự ly driver','More driver distance')],['fit',L('Thể lực & phòng chấn thương','Fitness & injury prevention')]],'radio',
      L('Ứng dụng sẽ gợi ý chương trình phù hợp nhất.','The app will suggest the best program for you.'))+
    chips('golf',L('Đã chơi golf','Golf experience'),[['new',L('< 1 năm','< 1 year')],['y13',L('1–3 năm','1–3 years')],['y310',L('3–10 năm','3–10 years')],['gt10',L('> 10 năm','> 10 years')]])+
    inp('hcp',L('Handicap <i>(nếu có)</i>','Handicap <i>(if any)</i>'),'number',L('Bỏ trống nếu chưa có','Leave blank if none'),'','min="-5" max="54" step="0.1"')+
    chips('gym',L('Kinh nghiệm tập tạ','Lifting experience'),[['none',L('Chưa bao giờ','Never')],['lt1',L('< 1 năm','< 1 year')],['y13',L('1–3 năm','1–3 years')],['gt3',L('> 3 năm','> 3 years')]],'radio',L('Tính theo thời gian tập đều đặn, không tính các đợt bỏ dở.','Count only consistent training, not attempts you abandoned.'))+
    chips('days',L('Số buổi mỗi tuần','Sessions per week'),[['3',L('3 buổi','3 sessions'),L('~2 giờ/tuần','~2 hrs/week')],['4',L('4 buổi','4 sessions'),L('~2,5 giờ','~2.5 hrs')],['5',L('5 buổi','5 sessions'),L('đầy đủ · ~3,2 giờ','full · ~3.2 hrs')]])+
    chips('eq',L('Dụng cụ có sẵn','Available equipment'),[['gym',L('Phòng gym đầy đủ','Full gym')],['home',L('Tạ đơn + kettlebell tại nhà','Dumbbells + kettlebell at home')],['min',L('Chỉ dây kháng lực','Resistance bands only')]])+
    sel('sport',L('Môn thể thao khác đang chơi','Other sport you play'),[['none',L('Không chơi','None')],['pickleball','Pickleball'],['tennis','Tennis'],['badminton',L('Cầu lông','Badminton')],['football',L('Bóng đá','Soccer')],['run',L('Chạy bộ','Running')],['swim',L('Bơi','Swimming')]])+
  '</div></fieldset>',
  '<fieldset><legend>'+L('Sức khỏe — để giáo án an toàn','Health — to keep the program safe')+'</legend><div class="fg">'+
    chips('inj',L('Đang đau hoặc từng chấn thương ở','Current pain or past injury in'),[['back',L('Lưng dưới','Lower back')],['knee',L('Gối','Knee')],['shoulder',L('Vai','Shoulder')],['elbow',L('Khuỷu / cổ tay','Elbow / wrist')],['heart',L('Tim mạch · huyết áp · tiểu đường','Heart · blood pressure · diabetes')]],'checkbox',
      L('Không có thì bỏ trống. Mỗi mục chọn sẽ thay các bài gây tải lên vùng đó bằng biến thể an toàn.','Leave blank if none. Each item you tick swaps exercises that load that area for safe variations.'))+
  '</div></fieldset>',
  '<fieldset><legend>'+L('Driver bạn hay dùng','Your driver')+'</legend><div class="fg">'+
    inp('brand',L('Hãng / mẫu','Brand / model'),'text',L('Ví dụ: TaylorMade Qi10','e.g. TaylorMade Qi10'),'','maxlength="50"',true)+
    sel('loft',L('Loft (độ)','Loft (degrees)'),lofts,L('Số in trên đầu gậy.','The number printed on the clubhead.'))+
    sel('sw',L('Trọng lượng shaft','Shaft weight'),[['',L('Không rõ','Not sure')],['45','40–49 g'],['55','50–59 g'],['65','60–69 g'],['75','70–79 g'],['85',L('80 g trở lên','80 g or more')]],L('Thường in trên shaft, vd "6S" = 60 g.','Usually printed on the shaft, e.g. "6S" = 60 g.'))+
    chips('flex',L('Độ cứng shaft (flex)','Shaft stiffness (flex)'),[['L','L'],['A','A / Senior'],['R','R'],['S','S'],['X','X'],['',L('Không rõ','Not sure')]])+
    inp('len',L('Chiều dài (inch)','Length (inches)'),'number','45.5',L('Driver bán sẵn thường 45,5–46".','Off-the-rack drivers are usually 45.5–46".'),'min="42" max="48" step="0.25"')+
    chips('glove',L('Cỡ găng tay','Glove size'),[['S','S'],['M','M'],['ML','ML'],['L','L'],['XL','XL']],'radio',L('Dùng để tính cỡ grip.','Used to work out your grip size.'))+
    chips('grip',L('Cỡ grip đang dùng','Current grip size'),[['std','Standard'],['mid','Midsize'],['under','Undersize'],['jumbo','Jumbo'],['',L('Không rõ','Not sure')]])+
  '</div></fieldset>',
  '<fieldset><legend>'+L('Số liệu đánh bóng hiện tại','Current ball-striking numbers')+'</legend><div class="fg">'+
    chips('dev',L('Thiết bị đo','Measuring device'),[['lm','Launch monitor / simulator'],['radar',L('Radar cầm tay','Handheld radar')],['none',L('Chưa có','None yet')]])+
    inp('cs','Club speed (mph)','number',L('Ví dụ 88','e.g. 88'),L('Chính xác nhất nếu có.','Most accurate if you have it.'),'min="40" max="150" step="0.5"')+
    inp('bs','Ball speed (mph)','number',L('Ví dụ 128','e.g. 128'),'','min="50" max="210" step="0.5"')+
    inp('carry',L('Carry driver (yard)','Driver carry (yd)'),'number',L('Ví dụ 200','e.g. 200'),L('Quãng bay trên không.','Distance in the air.'),'min="60" max="360"')+
    inp('total',L('Tổng cự ly driver (yard)','Driver total distance (yd)'),'number',L('Ví dụ 220','e.g. 220'),L('Tính cả lăn — đủ để ước tính nếu chưa có thiết bị.','Including roll — enough for an estimate if you have no device.'),'min="60" max="400"')+
    chips('miss',L('Đường bóng hỏng hay gặp','Typical miss'),[['slice',L('Slice / fade quá','Slice / too much fade')],['hook','Hook'],['low',L('Bóng thấp','Low ball')],['high',L('Bóng bổng','Ballooning shot')],['thin',L('Đánh mỏng / top','Thin / topped')],['fat',L('Đánh đất','Fat')],['mixed',L('Không ổn định','Inconsistent')],['ok',L('Khá thẳng','Fairly straight')]])+
    '<details class="ob-more full"><summary>'+L('＋ Có số liệu monitor chi tiết?','＋ Have detailed monitor data?')+'</summary><div class="fg">'+
      inp('aoa','Attack angle (°)','number',L('Ví dụ -2','e.g. -2'),L('Số âm = đánh xuống.','Negative = hitting down.'),'min="-10" max="10" step="0.1"')+
      inp('launch','Launch angle (°)','number',L('Ví dụ 12','e.g. 12'),'','min="3" max="30" step="0.1"')+
      inp('spin','Spin (rpm)','number',L('Ví dụ 2800','e.g. 2800'),'','min="1000" max="6000" step="10"')+
    '</div></details>'+
  '</div></fieldset>'].join('');
}
function obSet(p){
  var f=$id('ob-form'); if(!p) p={sex:'m',hand:'r',golf:'y13',gym:'lt1',days:5,eq:'gym',sport:'none',dev:'lm',club:{},goal:'basics'};
  var c=p.club||{};
  var V={goal:p.goal||'power',name:p.name,sex:p.sex,age:p.age,h:p.h,w:p.w,hand:p.hand,golf:p.golf,hcp:p.hcp,gym:p.gym,days:p.days,eq:p.eq,sport:p.sport,
    brand:c.brand,loft:c.loft,sw:c.sw,flex:c.flex,len:c.len,glove:c.glove,grip:c.grip,dev:p.dev,cs:p.cs,bs:p.bs,carry:p.carry,total:p.total,miss:p.miss,aoa:p.aoa,launch:p.launch,spin:p.spin};
  Object.keys(V).forEach(function(k){
    var v=V[k]; if(v===undefined||v===null) v='';
    var els=f.querySelectorAll('[name="'+k+'"]');
    els.forEach(function(el){ if(el.type==='radio') el.checked=(String(el.value)===String(v)); else el.value=v; });
  });
  var inj=p.inj||{}; f.querySelectorAll('[name="inj"]').forEach(function(el){el.checked=!!inj[el.value]});
  if(p.aoa!=null||p.launch!=null||p.spin!=null) f.querySelector('.ob-more').open=true;
}
function obGet(){
  var f=$id('ob-form');
  function v(k){var el=f.querySelector('[name="'+k+'"]:checked')||f.querySelector('[name="'+k+'"]:not([type=radio])');return el?String(el.value).trim():''}
  function n(k){var x=v(k).replace(',','.');return x===''||isNaN(+x)?null:+x}
  var inj={}; f.querySelectorAll('[name="inj"]:checked').forEach(function(el){inj[el.value]=true});
  return {goal:v('goal')||'basics',name:v('name'),sex:v('sex')||'m',age:n('age'),h:n('h'),w:n('w'),hand:v('hand')||'r',golf:v('golf')||'y13',hcp:n('hcp'),gym:v('gym')||'lt1',
    days:+(v('days')||5),eq:v('eq')||'gym',sport:v('sport')||'none',inj:inj,
    club:{brand:v('brand'),loft:n('loft'),sw:n('sw'),flex:v('flex'),len:n('len'),glove:v('glove'),grip:v('grip')},
    dev:v('dev')||'none',cs:n('cs'),bs:n('bs'),carry:n('carry'),total:n('total'),miss:v('miss')||'ok',aoa:n('aoa'),launch:n('launch'),spin:n('spin')};
}
function obCheck(i){
  var p=obGet(), bad=[], msg='';
  function need(k,ok,m){if(!ok){bad.push(k);if(!msg)msg=m}}
  if(i===0){
    need('name',p.name.length>0,L('Nhập tên gọi của bạn.','Enter your name.'));
    need('age',p.age!==null&&p.age>=10&&p.age<=90,L('Tuổi từ 10 đến 90.','Age must be between 10 and 90.'));
    need('h',p.h!==null&&p.h>=130&&p.h<=215,L('Chiều cao từ 130 đến 215 cm.','Height must be between 130 and 215 cm.'));
    need('w',p.w!==null&&p.w>=35&&p.w<=180,L('Cân nặng từ 35 đến 180 kg.','Weight must be between 35 and 180 kg.'));
  }
  if(i===1&&p.hcp!==null) need('hcp',p.hcp>=-5&&p.hcp<=54,L('Handicap từ -5 đến 54.','Handicap must be between -5 and 54.'));
  if(i===3&&p.club.len!==null) need('len',p.club.len>=42&&p.club.len<=48,L('Chiều dài driver thường 42–48 inch.','Driver length is usually 42–48 inches.'));
  if(i===4){
    need('cs',p.cs||p.bs||p.carry||p.total||p.golf==='new',L('Nhập ít nhất một trong: club speed, ball speed, carry hoặc tổng cự ly.','Enter at least one of: club speed, ball speed, carry or total distance.'));
    if(p.cs!==null) need('cs',p.cs>=40&&p.cs<=150,L('Club speed từ 40 đến 150 mph.','Club speed must be between 40 and 150 mph.'));
    if(p.bs!==null) need('bs',p.bs>=50&&p.bs<=210,L('Ball speed từ 50 đến 210 mph.','Ball speed must be between 50 and 210 mph.'));
    if(p.cs&&p.bs) need('bs',p.bs/p.cs>=1.1&&p.bs/p.cs<=1.56,L('Ball speed / club speed phải trong khoảng 1,10–1,56 — kiểm tra lại hai số này.','Ball speed / club speed must be between 1.10 and 1.56 — double-check these two numbers.'));
    if(p.carry!==null) need('carry',p.carry>=60&&p.carry<=360,L('Carry từ 60 đến 360 yard.','Carry must be between 60 and 360 yd.'));
    if(p.total!==null) need('total',p.total>=60&&p.total<=400,L('Tổng cự ly từ 60 đến 400 yard.','Total distance must be between 60 and 400 yd.'));
    if(p.carry&&p.total) need('total',p.total>=p.carry,L('Tổng cự ly phải lớn hơn hoặc bằng carry.','Total distance must be greater than or equal to carry.'));
  }
  $id('ob-form').querySelectorAll('.fld.err').forEach(function(x){x.classList.remove('err')});
  bad.forEach(function(k){var x=$id('ob-form').querySelector('[data-f="'+k+'"]');if(x)x.classList.add('err')});
  $id('ob-err').textContent=msg;
  if(bad.length){var el=$id('ob-form').querySelector('[data-f="'+bad[0]+'"] input');if(el)el.focus()}
  return !bad.length;
}
function obShow(){
  var fs=$id('ob-form').querySelectorAll('fieldset');
  fs.forEach(function(f,n){f.classList.toggle('on',n===OB.i)});
  $id('ob-steps').innerHTML=OB.steps.map(function(_,n){return '<span class="'+(n<OB.i?'done':n===OB.i?'now':'')+'"></span>'}).join('');
  $id('ob-kicker').textContent=L('Bước ','Step ')+(OB.i+1)+' / '+OB.steps.length+' · '+OB.steps[OB.i];
  $id('ob-prev').disabled=OB.i===0;
  $id('ob-next').textContent=OB.i===OB.steps.length-1?(OB.mode==='edit'?L('Lưu & tính lại giáo án ✓','Save & recalculate program ✓'):L('Tạo giáo án của tôi ✓','Create my program ✓')):L('Tiếp →','Next →');
  $id('ob-err').textContent='';
  OB.el.scrollTop=0;
}
function obOpen(mode){
  OB.mode=mode; OB.i=0;
  $id('ob-body').innerHTML=obForm();
  obSet(mode==='edit'?ME:null);
  $id('ob-title').textContent=mode==='edit'?L('Sửa hồ sơ của '+ME.name,'Edit '+ME.name+'’s profile'):L('Tạo hồ sơ tập luyện','Create training profile');
  $id('ob-skip').style.display=(mode==='new'&&!ME)?'':'none';
  $id('ob-skip').textContent=PROFILES.length?L('Đóng','Close'):L('Bỏ qua — xem giáo án mẫu','Skip — view the sample program');
  OB.el.classList.add('on'); document.body.classList.add('locked'); obShow();
  setTimeout(function(){var el=$id('ob-name');if(el)el.focus()},50);
}
function obClose(){OB.el.classList.remove('on');document.body.classList.remove('locked');lsSet('golf-onb-seen','1')}
function obSave(){
  var p=obGet();
  if(!(p.cs||p.bs||p.carry||p.total)){p.total=p.sex==='f'?150:190;p.estDefault=true;}   /* người mới chưa đo: ước tính */
  if(OB.mode==='edit'&&ME){p.id=ME.id;p.legacy=ME.legacy;p.created=ME.created;p.video=ME.video;p.clips=ME.clips;
    PROFILES=PROFILES.map(function(x){return x.id===ME.id?p:x})}
  else {try{var pend=JSON.parse(lsGet('golf-va-pending')||'null');if(pend){p.video={};p.video[pend.view]=pend;localStorage.removeItem('golf-va-pending')}}catch(e){}
    p.id='p'+Date.now().toString(36);p.legacy=!PROFILES.some(function(x){return x.legacy});p.created=new Date().toISOString().slice(0,10);PROFILES.push(p)}
  if(!lsSet(PKEY,JSON.stringify(PROFILES))){$id('ob-err').textContent=L('Trình duyệt đang chặn bộ nhớ — không lưu được hồ sơ (thử tắt chế độ ẩn danh).','Your browser is blocking storage — the profile could not be saved (try turning off private/incognito mode).');return}
  lsSet(AKEY,p.id); lsSet('golf-onb-seen','1');
  var isNew=OB.mode!=='edit'; if(window.progOnProfileSaved) progOnProfileSaved(p,isNew);
  location.hash=isNew?'home':'hoso'; location.reload();
}
$id('ob-next').addEventListener('click',function(){
  if(!obCheck(OB.i)) return;
  if(OB.i<OB.steps.length-1){OB.i++;obShow()} else obSave();
});
$id('ob-prev').addEventListener('click',function(){if(OB.i>0){OB.i--;obShow()}});
$id('ob-x').addEventListener('click',obClose);
$id('ob-skip').addEventListener('click',obClose);
$id('ob-form').addEventListener('submit',function(e){e.preventDefault()});
$id('ob-form').addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='checkbox'){e.preventDefault();$id('ob-next').click()}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&OB.el.classList.contains('on'))obClose()});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-ob]'); if(b){obOpen(b.dataset.ob==='edit'&&ME?'edit':'new');return}
  var d=e.target.closest('[data-prof-del]');
  if(d&&ME&&confirm(L('Xóa hồ sơ của '+ME.name+'? Nhật ký mph của hồ sơ này vẫn còn trên máy nhưng sẽ không hiển thị nữa.','Delete '+ME.name+'’s profile? This profile’s mph log stays on this device but will no longer be shown.'))){
    try{var dd=JSON.parse(lsGet('golf-del-ids')||'[]');dd.push(ME.id);lsSet('golf-del-ids',JSON.stringify(dd))}catch(x){}   /* để đồng bộ không khôi phục lại */
    PROFILES=PROFILES.filter(function(x){return x.id!==ME.id}); lsSet(PKEY,JSON.stringify(PROFILES));
    lsSet(AKEY,PROFILES.length?PROFILES[0].id:''); location.reload();
  }
});
document.addEventListener('change',function(e){
  if(e.target.id==='prof-sel'||e.target.id==='side-sel'){lsSet(AKEY,e.target.value);location.hash='hoso';location.reload()}
});
function renderSide(){
  var p=ME,P=PLAN,host=$id('side-me');
  var opts=PROFILES.length?'<select id="side-sel" aria-label="'+L('Đổi hồ sơ','Switch profile')+'"><option value="">'+L('Giáo án mẫu','Sample program')+'</option>'+
    PROFILES.map(function(x){return '<option value="'+x.id+'"'+(p&&x.id===p.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>':'';
  if(P){
    host.innerHTML='<div class="me-top"><span class="me-av">'+esc(p.name.trim().charAt(0).toUpperCase())+'</span><div><div class="me-n">'+esc(p.name)+'</div>'+
      '<div class="me-s">'+fmtH(p.h)+' · '+p.w+' kg · '+p.days+L(' buổi/tuần',' sessions/week')+'</div></div></div>'+
      '<span class="me-badge">✦ '+L('Giáo án riêng','Personal program')+' · '+mph(P.v0)+' → '+mph(P.v12)+' mph</span>'+
      '<div class="me-act"><button class="btn y" type="button" data-ob="edit">'+L('✎ Sửa','✎ Edit')+'</button><button class="btn" type="button" data-ob="new">'+L('＋ Người mới','＋ New golfer')+'</button>'+opts+'</div>';
    $id('tb-title').textContent='⛳ '+p.name+' · '+P.tot0+' → '+P.tot12+' yd';
  } else {
    host.innerHTML='<div class="me-top"><span class="me-av demo">?</span><div><div class="me-n">'+L('Giáo án mẫu','Sample program')+'</div><div class="me-s">1m70 · 72 kg · ~88 mph</div></div></div>'+
      '<span class="me-badge demo">'+L('Chưa cá nhân hóa','Not personalized yet')+'</span>'+
      '<div class="me-act"><button class="btn y" type="button" data-ob="new">'+L('＋ Tạo hồ sơ của bạn','＋ Create your profile')+'</button>'+opts+'</div>';
  }
}
renderSide();
applyProfileDom();
renderProfile();
if(ME){var dl=document.createElement('button');dl.type='button';dl.className='btn';dl.setAttribute('data-prof-del','1');dl.textContent=L('Xóa hồ sơ','Delete profile');dl.style.background='#8C4A3C';
  var tl=document.querySelector('.prof-tools');if(tl)tl.appendChild(dl)}
/* Lần đầu vào trang, chưa có hồ sơ -> mời tạo */
/* chờ lần đồng bộ đầu: máy mới có thể đang tải hồ sơ từ đám mây về */
if(!ME&&!PROFILES.length&&!lsGet('golf-onb-seen')) Promise.race([window.GolfSync?GolfSync.first:Promise.resolve(false),new Promise(function(ok){setTimeout(function(){ok(false)},4000)})]).then(function(ch){
  if(!ch&&!PROFILES.length) setTimeout(function(){obOpen('new')},300);
});
/* ===== Render thẻ tổng quan mỗi buổi ===== */
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function vidHtml(v,cls){return '<a class="'+cls+(v.doc?' doc':'')+'" href="'+v.u+'" target="_blank" rel="noopener">'+esc(v.t)+'</a>'}

(function renderSessions(){
  var tabs=document.getElementById('sess-tabs'),host=document.getElementById('sess-host');
  SESSIONS.forEach(function(s,i){
    var b=document.createElement('button');
    b.className='tab'+(i?'':' on');b.type='button';b.dataset.group='ss';b.dataset.p='sess-'+s.id;
    b.setAttribute('role','tab');b.setAttribute('aria-selected',i?'false':'true');b.textContent=s.tab;
    tabs.appendChild(b);

    var p=document.createElement('div');
    p.className='panel'+(i?'':' on');p.dataset.group='ss';p.id='sess-'+s.id;p.setAttribute('role','tabpanel');
    p.innerHTML='<div class="sess">'+
      '<div class="sess-head">'+
        '<div class="sess-kicker">'+L('Buổi ','Session ')+s.id+'</div>'+
        '<h3 class="sess-title">'+esc(s.title)+'</h3>'+
        '<p class="sess-goal">'+esc(s.goal)+'</p>'+
        '<div class="sess-facts"><span class="fact">'+s.day+'</span><span class="fact">'+s.dur+'</span><span class="fact">'+s.ex.length+L(' bài',s.ex.length===1?' exercise':' exercises')+'</span>'+(PLAN?'<span class="fact">'+L('✦ Theo hồ sơ ','✦ Tailored for ')+esc(ME.name)+'</span>':'')+'</div>'+
      '</div>'+
      '<div class="sess-body">'+
        '<div class="wmrow"><div class="wmh">'+L('🔥 Khởi động · 5 phút','🔥 Warm-up · 5 min')+'</div>'+s.warm.map(function(w,n){
          return '<div class="wm" data-s="'+s.id+'" data-n="'+n+'">'+animSvg()+'<div class="wl">'+esc(w)+'</div></div>';
        }).join('')+'</div>'+
        '<ol class="plan exl">'+s.ex.map(function(e,n){
          var vids=(e.vids||[]).map(function(v){return vidHtml(v,'vbtn')}).join('');
          return '<li class="exc" data-s="'+s.id+'" data-n="'+n+'"><div class="exc-body"><div class="exc-main">'+
              '<div class="exc-fig">'+animSvg()+'<div class="exc-cap"></div></div>'+
              '<div class="exc-txt"><div class="exc-h"><span class="pn">'+(n+1)+'</span><span class="exc-n pname">'+esc(e.name)+'</span></div>'+
                (e.orig?'<span class="swp">'+L('↻ Thay cho ','↻ Replaces ')+esc(e.orig)+' — '+esc(e.why)+'</span>':e.adj?'<span class="swp">✦ '+esc(e.adj)+'</span>':'')+
                '<div class="exc-rx"><span class="rx prx">'+esc(e.rx)+'</span>'+(e.kg?'<span>'+esc(e.kg)+'</span>':'')+(e.rest?'<span>'+L('⏱ nghỉ ','⏱ rest ')+e.rest+'s</span>':'')+'</div>'+
                (e.note?'<p class="exc-note">'+esc(e.note)+'</p>':'')+
              '</div></div><ol class="exc-steps"></ol></div>'+
            (vids?'<div class="exc-vids">'+vids+'</div>':'')+'</li>';
        }).join('')+'</ol>'+
        '<button class="start" type="button" data-start="'+s.id+'">'+L('▶  BẮT ĐẦU BUỔI TẬP','▶  START SESSION')+'</button>'+
      '</div></div>';
    host.appendChild(p);
  });
})();

/* ===== Render thẻ thay đổi theo giai đoạn ===== */
Object.keys(CHANGES).forEach(function(k){
  var host=document.querySelector('.chg[data-chg="'+k+'"]');if(!host)return;
  host.innerHTML=CHANGES[k].map(function(c){
    var DAYB={T2:'Mon',T3:'Tue',T4:'Wed',T5:'Thu',T6:'Fri',T7:'Sat',CN:'Sun'};
    return '<div class="chg-item"><span class="chg-b'+(c.dd?' d':'')+'">'+(LANG==='en'&&DAYB[c.b]?DAYB[c.b]:c.b)+'</span>'+
      '<div class="chg-t"><div class="w">'+c.w+(c.me?' <span class="me-tag">'+L('✦ chỉnh cho bạn','✦ adjusted for you')+'</span>':'')+'</div><div class="dose">'+c.d+'</div>'+
      (c.v?vidHtml(c.v,'vbtn'):'')+'</div></div>';
  }).join('');
});

/* ===== HÌNH NGƯỜI 3 CHIỀU — bộ vẽ v6 =====
   Nâng cấp so với v5 (đặc tả tư thế q GIỮ NGUYÊN định dạng, mọi dữ liệu cũ dùng được):
   · Tỉ lệ ~7½ đầu: vai xuôi, eo thắt, khung chậu, đùi to hơn cẳng, cổ tay nhỏ hơn khuỷu.
   · Áo / quần / da / giày / tóc tách màu — nhìn ra ngay tay, thân, chân.
   · Bóng khối: mỗi chi có vệt sáng lệch về phía nguồn sáng (trên–trái), thân có mảng sáng ngực.
   · Bàn tay nối tiếp cẳng tay; bàn chân có gót, đế đặt dưới cổ chân.
   · Đầu hình trứng nghiêng theo cột sống, có tóc và mũi → thấy được hướng nhìn.
   · Bóng đổ co nhỏ và mờ đi khi người rời mặt đất (bật nhảy).
   Trục: X = hướng mặt nhìn tới, Y = xuống, Z = sang ngang. */
var DG=Math.PI/180;
var HEAD_R=6.2, NECK_L=5, TORSO=25, PELV_W=8.0, SHLD_W=11.0, WAIST_K=0.8;
var THIGH=25, SHIN=24, FOOT=8.5, UARM=15.5, FARM=13.5, HAND=4.4;
var GYY=132, FOC=360;

/* độ dày từng đoạn: [gốc, ngọn] */
var WID={thigh:[7.0,4.8], shin:[5.2,3.0], uarm:[5.0,3.8], farm:[3.9,2.7], hand:[3.3,2.3], foot:[3.6,2.8], neck:[4.3,3.9]};
/* màu vật liệu (gần máy); xa máy sẽ pha dần sang C_FAR */
var COL={shirt:[247,243,230], pants:[186,203,211], skin:[238,204,172], shoe:[46,70,61], hair:[36,58,49]};
var C_FAR=[122,158,142], EDGE='#10362A', LX=-0.55, LY=-0.83;     /* nguồn sáng trên–trái */

function d3(a,b){var A=a*DG,B=b*DG;return [Math.sin(A)*Math.cos(B), Math.cos(A)*Math.cos(B), Math.sin(B)];}
function ad(p,d,l){return [p[0]+d[0]*l, p[1]+d[1]*l, p[2]+d[2]*l];}
function ry(p,g){var r=g*DG,c=Math.cos(r),s=Math.sin(r);return [p[0]*c+p[2]*s, p[1], -p[0]*s+p[2]*c];}
function nrm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];}

/* Giải ngược động học 2 khâu trong KHÔNG GIAN 3 CHIỀU.
   pole = hướng đẩy khớp giữa ra (khuỷu tay chỉ ra sau, đầu gối chỉ ra trước). */
function ik3(root, target, L1, L2, pole){
  var u=[target[0]-root[0], target[1]-root[1], target[2]-root[2]];
  var d=Math.hypot(u[0],u[1],u[2])||0.001;
  var dc=Math.max(Math.abs(L1-L2)+0.4, Math.min(L1+L2-0.4, d));
  u=[u[0]/d, u[1]/d, u[2]/d];
  var ca=Math.max(-1,Math.min(1,(dc*dc+L1*L1-L2*L2)/(2*dc*L1))), al=Math.acos(ca);
  var dp=pole[0]*u[0]+pole[1]*u[1]+pole[2]*u[2];
  var v=[pole[0]-u[0]*dp, pole[1]-u[1]*dp, pole[2]-u[2]*dp];
  var vl=Math.hypot(v[0],v[1],v[2]);
  if(vl<1e-4){ v=[u[1],-u[0],0]; vl=Math.hypot(v[0],v[1],v[2])||1; }
  v=[v[0]/vl, v[1]/vl, v[2]/vl];
  var ce=Math.cos(al)*L1, se=Math.sin(al)*L1;
  var elbow=[root[0]+u[0]*ce+v[0]*se, root[1]+u[1]*ce+v[1]*se, root[2]+u[2]*ce+v[2]*se];
  var end = d>L1+L2 ? [root[0]+u[0]*(L1+L2), root[1]+u[1]*(L1+L2), root[2]+u[2]*(L1+L2)] : target;
  return {mid:elbow, end:end};
}

/* Dựng bộ xương + danh sách khối cần vẽ (toạ độ 3D, chưa chiếu) */
function skel4(q){
  var lean=q.lean||0, tilt=q.tilt||0, hy=q.hipYaw||0, sy=q.shoYaw||0, my=(hy+sy)/2;
  var hw=q.hw==null?PELV_W:q.hw, sw=q.sw==null?SHLD_W:q.sw, ww=hw*WAIST_K;
  var pel=[0,0,0];
  var hipAx=ry([0,0,1],hy), waAx=ry([0,0,1],my), shoAx=ry([0,0,1],sy);
  var up=d3(180-lean,tilt);
  var fwd=ry(d3(90-lean,0),sy);                       /* hướng ngực / mặt nhìn tới */
  var waist=ad(pel,up,TORSO*0.42), chest=ad(pel,up,TORSO);
  var shoB=ad(chest,up,-1.7);                          /* khớp vai thấp hơn đỉnh ngực → vai xuôi */
  var neck=ad(chest,up,NECK_L), head=ad(neck,up,HEAD_R*1.15);
  var hips=[ad(pel,hipAx,-hw), ad(pel,hipAx,hw)];
  var wai=[ad(waist,waAx,-ww), ad(waist,waAx,ww)];
  var shos=[ad(shoB,shoAx,-sw), ad(shoB,shoAx,sw)];
  var nb=[ad(chest,shoAx,-sw*0.34), ad(chest,shoAx,sw*0.34)];
  var pb=ad(pel,up,-5.6);                              /* đáy khung chậu */
  var P=[];
  P.push({k:'poly', c:'pants', zoff:0.35, pts:[hips[0],hips[1],ad(pb,hipAx,hw*0.9),ad(pb,hipAx,-hw*0.9)]});
  P.push({k:'poly', c:'shirt', hl:1, pts:[hips[0],hips[1],wai[1],shos[1],nb[1],nb[0],shos[0],wai[0]]});
  P.push({k:'limb', c:'skin', a:chest, b:neck, w:WID.neck});
  var hands=[], feet=[];
  (q.legs||[]).forEach(function(L){
    var hip=hips[L.side>0?1:0];
    var kn=ad(hip,d3(L.t,L.tb||0),THIGH);
    var an=ad(kn,d3(L.s,L.sb||0),SHIN);
    P.push({k:'limb',c:'pants',a:hip,b:kn,w:WID.thigh});
    P.push({k:'limb',c:'pants',a:kn,b:an,w:WID.shin});
    P.push({k:'joint',c:'pants',p:kn,r:2.5});
    if(!L.nofoot){
      var fd=ry(d3(L.fa==null?92:L.fa, L.fb2||0), hy), dn=L.fdir||1;
      var sole=ad(an,nrm(d3(L.s,L.sb||0)),1.5);        /* đế chân nằm dưới cổ chân, theo trục cẳng chân */
      var heel=ad(sole,fd,-FOOT*0.3*dn), toe=ad(sole,fd,FOOT*dn);
      P.push({k:'limb',c:'shoe',a:heel,b:toe,w:WID.foot});
      P.push({k:'joint',c:'shoe',p:an,r:2.1});
      feet.push(toe); feet.push(heel);
    } else feet.push(an);
    P.push({k:'joint',c:'pants',p:hip,r:2.8});
  });
  (q.arms||[]).forEach(function(A){
    var sho=shos[A.side>0?1:0], el, hd;
    if(A.grip){
      var r=ik3(sho, A.grip, UARM, FARM, A.pole||[-0.4,0.2,A.side>0?0.9:-0.9]);
      el=r.mid; hd=r.end;
    } else {
      el=ad(sho,d3(A.u,A.ub||0),UARM);
      hd=ad(el,d3(A.f,A.fb||0),FARM);
    }
    var fdir=nrm([hd[0]-el[0],hd[1]-el[1],hd[2]-el[2]]), tip=ad(hd,fdir,HAND);
    P.push({k:'limb',c:'shirt',a:sho,b:el,w:WID.uarm});
    P.push({k:'limb',c:'skin',a:el,b:hd,w:WID.farm});
    P.push({k:'limb',c:'skin',a:hd,b:tip,w:WID.hand,cap:1});
    P.push({k:'joint',c:'skin',p:el,r:2.1});
    P.push({k:'joint',c:'shirt',p:sho,r:3.0});
    hands.push(ad(hd,fdir,HAND*0.55));                 /* dụng cụ nằm trong lòng bàn tay */
  });
  P.push({k:'head',p:head,r:HEAD_R,up:up,fwd:fwd});
  return {P:P, hands:hands, feet:feet, pel:pel};
}

/* Xoay CẢ CƠ THỂ vào tư thế: pitch = ngả quanh trục ngang (nằm sấp/ngửa),
   roll = lăn quanh trục dọc cơ thể (nằm nghiêng), spin = xoay quanh trục đầu–chân. */
function rz(p,g){var r=g*DG,c=Math.cos(r),s=Math.sin(r);return [p[0]*c-p[1]*s, p[0]*s+p[1]*c, p[2]];}
function rx(p,g){var r=g*DG,c=Math.cos(r),s=Math.sin(r);return [p[0], p[1]*c-p[2]*s, p[1]*s+p[2]*c];}
function orient(p,q){
  if(q.spin) p=ry(p,q.spin);
  if(q.roll) p=rx(p,q.roll);
  if(q.pitch) p=rz(p,q.pitch);
  return p;
}
/* chiếu phối cảnh; elev = góc CÚI của máy quay (cần cho bài nằm) */
function pr(p,view,org,q){
  if(q&&(q.pitch||q.roll||q.spin)) p=orient(p,q);
  var r=ry(p,-view);
  if(q&&q.elev) r=rx(r,q.elev);
  var k=FOC/(FOC+r[2]);
  return {x:org[0]+r[0]*k, y:org[1]+r[1]*k, z:r[2], k:k};
}
function mixc(A,B,t){return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')';}
function tone(z){return Math.max(0,Math.min(1,(z+26)/58));}   /* 0 gần, 1 xa */
function col(c,t){var b=COL[c]||COL.shirt; return mixc(b,C_FAR,t*((c==='shoe'||c==='hair')?0.3:0.7));}
function f1(x){return (Math.round(x*10)/10).toString();}

/* chi tóp dần: thân khối + vệt sáng lệch về phía nguồn sáng */
function quad(a,b,wa,wb){
  var dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
  var A=(wa/2)*a.k, B=(wb/2)*b.k;
  return 'M'+f1(a.x+nx*A)+' '+f1(a.y+ny*A)+'L'+f1(b.x+nx*B)+' '+f1(b.y+ny*B)+
         'L'+f1(b.x-nx*B)+' '+f1(b.y-ny*B)+'L'+f1(a.x-nx*A)+' '+f1(a.y-ny*A)+'Z';
}
function shine(a,b,wa,wb){
  var dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
  if(L<3) return '';
  var s=(nx*LX+ny*LY)>=0?1:-1;
  var ax=a.x+dx*0.1, ay=a.y+dy*0.1, bx=b.x-dx*0.1, by=b.y-dy*0.1;
  var oa=(wa/2)*a.k*0.4*s, ob=(wb/2)*b.k*0.4*s, A=(wa/2)*a.k*0.3, B=(wb/2)*b.k*0.3;
  ax+=nx*oa; ay+=ny*oa; bx+=nx*ob; by+=ny*ob;
  return '<path d="M'+f1(ax+nx*A)+' '+f1(ay+ny*A)+'L'+f1(bx+nx*B)+' '+f1(by+ny*B)+'L'+f1(bx-nx*B)+' '+f1(by-ny*B)+'L'+f1(ax-nx*A)+' '+f1(ay-ny*A)+'Z" fill="#fff" opacity=".34"/>';
}
function draw4(q){
  var S=q.J?partsFromJ(q.J):skel4(q), view=q.view||0, org=q.org||[65,80], out=[];
  S.P.forEach(function(o){
    if(o.k==='poly'){
      var pts=o.pts.map(function(p){return pr(p,view,org,q);});
      var z=pts.reduce(function(s,p){return s+p.z;},0)/pts.length, t=tone(z), k=pts[0].k;
      var d='<path d="M'+pts.map(function(p){return f1(p.x)+' '+f1(p.y);}).join('L')+'Z" fill="'+col(o.c,t)+
        '" stroke="'+EDGE+'" stroke-width="'+f1(1.5*k)+'" stroke-linejoin="round"/>';
      if(o.hl){                                            /* mảng sáng trên ngực–bụng */
        var cx=pts.reduce(function(s,p){return s+p.x;},0)/pts.length, cy=pts.reduce(function(s,p){return s+p.y;},0)/pts.length;
        d+='<path d="M'+pts.map(function(p){return f1(cx+(p.x-cx)*0.62+LX*2.2*k)+' '+f1(cy+(p.y-cy)*0.62+LY*2.2*k);}).join('L')+'Z" fill="#fff" opacity=".22"/>';
      }
      out.push({z:z+(o.zoff||0), d:d});
    } else if(o.k==='limb'){
      var a=pr(o.a,view,org,q), b=pr(o.b,view,org,q), z=(a.z+b.z)/2, t=tone(z);
      var d='<path d="'+quad(a,b,o.w[0],o.w[1])+'" fill="'+col(o.c,t)+'" stroke="'+EDGE+'" stroke-width="'+f1(1.4*a.k)+'" stroke-linejoin="round"'+(o.cap?' stroke-linecap="round"':'')+'/>';
      if(o.cap) d+='<circle cx="'+f1(b.x)+'" cy="'+f1(b.y)+'" r="'+f1(o.w[1]*0.5*b.k)+'" fill="'+col(o.c,t)+'" stroke="'+EDGE+'" stroke-width="'+f1(1.2*b.k)+'"/>';
      if(o.c!=='shoe') d+=shine(a,b,o.w[0],o.w[1]);
      out.push({z:z, d:d});
    } else if(o.k==='club3'){
      var a=pr(o.a,view,org,q), b=pr(o.b,view,org,q), dx=b.x-a.x, dy=b.y-a.y, L=Math.hypot(dx,dy)||1;
      out.push({z:(a.z+b.z)/2-0.5, d:'<line x1="'+f1(a.x)+'" y1="'+f1(a.y)+'" x2="'+f1(b.x)+'" y2="'+f1(b.y)+'" stroke="#F2C230" stroke-width="'+f1(1.7*b.k)+'" stroke-linecap="round"/>'+
        '<line x1="'+f1(b.x-dy/L*3)+'" y1="'+f1(b.y+dx/L*3)+'" x2="'+f1(b.x+dy/L*3)+'" y2="'+f1(b.y-dx/L*3)+'" stroke="#F2C230" stroke-width="'+f1(2.6*b.k)+'" stroke-linecap="round"/>'});
    } else if(o.k==='joint'){
      var p=pr(o.p,view,org,q), t=tone(p.z);
      out.push({z:p.z+0.4, d:'<circle cx="'+f1(p.x)+'" cy="'+f1(p.y)+'" r="'+f1(o.r*p.k)+'" fill="'+col(o.c,t)+'"/>'});
    } else if(o.k==='head'){
      var p=pr(o.p,view,org,q), t=tone(p.z), k=p.k;
      var uP=pr(ad(o.p,o.up,4),view,org,q), ux=uP.x-p.x, uy=uP.y-p.y, ul=Math.hypot(ux,uy);
      if(ul<0.4){ux=0;uy=-1;} else {ux/=ul;uy/=ul;}
      var np=pr(ad(o.p,o.fwd,o.r),view,org,q), fx=(np.x-p.x)/(o.r*k), fy=(np.y-p.y)/(o.r*k), fl=Math.hypot(fx,fy);
      var away=np.z>p.z+0.8*o.r;                          /* quay lưng lại máy: chỉ thấy tóc */
      var rot=Math.atan2(uy,ux)*180/Math.PI+90, rx_=o.r*0.9*k, ry_=o.r*1.06*k;
      var d='<g transform="rotate('+f1(rot)+' '+f1(p.x)+' '+f1(p.y)+')"><ellipse cx="'+f1(p.x)+'" cy="'+f1(p.y-0.6*k)+'" rx="'+f1(rx_)+'" ry="'+f1(ry_)+'" fill="'+col('hair',t)+'" stroke="'+EDGE+'" stroke-width="'+f1(1.4*k)+'"/></g>';
      if(!away){
        var cx=p.x-ux*1.3*k+fx*1.7*k, cy=p.y-uy*1.3*k+fy*1.7*k;   /* mặt lệch xuống và về phía nhìn */
        d+='<g transform="rotate('+f1(rot)+' '+f1(cx)+' '+f1(cy)+')"><ellipse cx="'+f1(cx)+'" cy="'+f1(cy)+'" rx="'+f1(rx_*0.9)+'" ry="'+f1(ry_*0.88)+'" fill="'+col('skin',t)+'" stroke="'+EDGE+'" stroke-width="'+f1(1.2*k)+'"/>'+
           '<ellipse cx="'+f1(cx-rx_*0.28)+'" cy="'+f1(cy-ry_*0.15)+'" rx="'+f1(rx_*0.3)+'" ry="'+f1(ry_*0.38)+'" fill="#fff" opacity=".22"/></g>';
        if(fl>0.5){                                        /* nhìn nghiêng: mũi là bướu nhỏ ở mép mặt */
          var nx_=cx+fx/fl*rx_*0.88-ux*0.9*k, ny_=cy+fy/fl*rx_*0.88-uy*0.9*k;
          d+='<circle cx="'+f1(nx_)+'" cy="'+f1(ny_)+'" r="'+f1(1.25*k)+'" fill="'+col('skin',t)+'" stroke="'+EDGE+'" stroke-width="'+f1(1.1*k)+'"/>';
        }
      }
      out.push({z:p.z-1.5, d:d});
    }
  });
  out.sort(function(a,b){return b.z-a.z;});
  /* bóng đổ dưới chân — co lại và mờ đi khi người rời mặt đất */
  var sh='';
  if(S.feet.length && !q.noshadow){
    var fx=S.feet.map(function(f){return pr(f,view,org,q);});
    var xs=fx.map(function(p){return p.x;}), low=Math.max.apply(null,fx.map(function(p){return p.y;}));
    var cx=(Math.max.apply(null,xs)+Math.min.apply(null,xs))/2, wsp=Math.max.apply(null,xs)-Math.min.apply(null,xs);
    var lift=Math.max(0,GYY-2.5-low), sc=Math.max(0.3,1-lift/45);
    sh='<ellipse cx="'+f1(cx)+'" cy="'+GYY+'" rx="'+f1((9+wsp*0.5)*sc)+'" ry="'+f1(2.3*sc)+'" fill="#0A2A1F" opacity="'+f1(0.45*sc)+'"/>';
  }
  var hand=S.hands.length?pr(S.hands[0],view,org,q):pr(S.P[S.P.length-1].p,view,org,q);
  return {svg:sh+out.map(function(o){return o.d;}).join(''), hand:[hand.x,hand.y]};
}

/* ===== CHUYỂN ĐỘNG THẬT (mocap) — vẽ hình từ VỊ TRÍ KHỚP thay vì góc =====
   Khớp lấy từ MediaPipe (33 điểm 3D theo mét, gốc ở giữa hông) rồi "retarget":
   giữ nguyên độ dài xương của hình, chỉ lấy HƯỚNG từng đoạn từ người thật.
   Một khung mocap = 21 điểm [x,y,z] theo đơn vị hình: hipL,hipR,shoL,shoR,chest,head,nose,
   kneeL,kneeR,ankL,ankR,heelL,heelR,toeL,toeR,elbL,elbR,wrL,wrR,tipL,tipR. */
var MC_I={hipL:0,hipR:1,shoL:2,shoR:3,chest:4,head:5,nose:6,kneeL:7,kneeR:8,ankL:9,ankR:10,heelL:11,heelR:12,toeL:13,toeR:14,elbL:15,elbR:16,wrL:17,wrR:18,tipL:19,tipR:20};
function v3sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function v3mid(a,b){return [(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];}
function v3len(a){return Math.hypot(a[0],a[1],a[2]);}

/* 33 điểm MediaPipe (mét) → 21 điểm hình (đơn vị hình) */
function mocapRetarget(w){
  function P(i){return [w[i][0],w[i][1],w[i][2]];}
  var hipL=P(23),hipR=P(24),shoL=P(11),shoR=P(12);
  var pel0=v3mid(hipL,hipR), chest0=v3mid(shoL,shoR), pel=[0,0,0];
  var up=nrm(v3sub(chest0,pel0)), chest=ad(pel,up,TORSO);
  var hipAx=nrm(v3sub(hipR,hipL)), shoAx=nrm(v3sub(shoR,shoL));
  var hips=[ad(pel,hipAx,-PELV_W), ad(pel,hipAx,PELV_W)];
  var shoB=ad(chest,up,-1.7), shos=[ad(shoB,shoAx,-SHLD_W), ad(shoB,shoAx,SHLD_W)];
  var ears=v3mid(P(7),P(8)), hdir=nrm(v3sub(ears,chest0));
  var head=ad(ad(chest,hdir,NECK_L),hdir,HEAD_R*1.15), nose=ad(head,nrm(v3sub(P(0),ears)),HEAD_R);
  var out=[hips[0],hips[1],shos[0],shos[1],chest,head,nose];
  var kn=[],an=[];
  for(var i=0;i<2;i++){kn[i]=ad(hips[i],nrm(v3sub(P(25+i),P(23+i))),THIGH);an[i]=ad(kn[i],nrm(v3sub(P(27+i),P(25+i))),SHIN);}
  out.push(kn[0],kn[1],an[0],an[1]);
  out.push(ad(an[0],nrm(v3sub(P(29),P(27))),3.2), ad(an[1],nrm(v3sub(P(30),P(28))),3.2));
  out.push(ad(an[0],nrm(v3sub(P(31),P(27))),FOOT*1.15), ad(an[1],nrm(v3sub(P(32),P(28))),FOOT*1.15));
  var el=[],hd=[];
  for(i=0;i<2;i++){el[i]=ad(shos[i],nrm(v3sub(P(13+i),P(11+i))),UARM);hd[i]=ad(el[i],nrm(v3sub(P(15+i),P(13+i))),FARM);}
  out.push(el[0],el[1],hd[0],hd[1]);
  out.push(ad(hd[0],nrm(v3sub(P(19),P(15))),HAND), ad(hd[1],nrm(v3sub(P(20),P(16))),HAND));
  return out.map(function(p){return [Math.round(p[0]*10)/10,Math.round(p[1]*10)/10,Math.round(p[2]*10)/10];});
}
/* 21 điểm → cấu trúc khớp để vẽ */
function mocapDecode(pts,club){
  var G=function(k){return pts[MC_I[k]];};
  var hips=[G('hipL'),G('hipR')], shos=[G('shoL'),G('shoR')], chest=G('chest'), head=G('head');
  var pel=v3mid(hips[0],hips[1]), up=nrm(v3sub(chest,pel));
  var hipAx=nrm(v3sub(hips[1],hips[0])), shoAx=nrm(v3sub(shos[1],shos[0]));
  var hup=nrm(v3sub(head,chest)), fwd=nrm(v3sub(G('nose'),head));
  var J={pel:pel,chest:chest,up:up,hipAx:hipAx,shoAx:shoAx,hips:hips,shos:shos,neck:ad(chest,hup,NECK_L),head:head,hup:hup,fwd:fwd,
    legs:[{hip:hips[0],kn:G('kneeL'),an:G('ankL'),heel:G('heelL'),toe:G('toeL')},{hip:hips[1],kn:G('kneeR'),an:G('ankR'),heel:G('heelR'),toe:G('toeR')}],
    arms:[{sho:shos[0],el:G('elbL'),hd:G('wrL'),tip:G('tipL')},{sho:shos[1],el:G('elbR'),hd:G('wrR'),tip:G('tipR')}]};
  if(club){ var grip=v3mid(G('tipL'),G('tipR')), dir=nrm(v3sub(grip,chest)); J.club={a:grip,b:ad(grip,dir,club)}; }
  return J;
}
/* dựng danh sách khối từ khớp (cùng định dạng với skel4) */
function partsFromJ(J){
  var P=[], up=J.up, pel=J.pel, waist=ad(pel,up,TORSO*0.42), waAx=nrm([J.hipAx[0]+J.shoAx[0],J.hipAx[1]+J.shoAx[1],J.hipAx[2]+J.shoAx[2]]);
  var ww=PELV_W*WAIST_K, wai=[ad(waist,waAx,-ww),ad(waist,waAx,ww)], nb=[ad(J.chest,J.shoAx,-SHLD_W*0.34),ad(J.chest,J.shoAx,SHLD_W*0.34)], pb=ad(pel,up,-5.6);
  P.push({k:'poly',c:'pants',zoff:0.35,pts:[J.hips[0],J.hips[1],ad(pb,J.hipAx,PELV_W*0.9),ad(pb,J.hipAx,-PELV_W*0.9)]});
  P.push({k:'poly',c:'shirt',hl:1,pts:[J.hips[0],J.hips[1],wai[1],J.shos[1],nb[1],nb[0],J.shos[0],wai[0]]});
  P.push({k:'limb',c:'skin',a:J.chest,b:J.neck,w:WID.neck});
  var feet=[],hands=[];
  J.legs.forEach(function(L){
    P.push({k:'limb',c:'pants',a:L.hip,b:L.kn,w:WID.thigh});P.push({k:'limb',c:'pants',a:L.kn,b:L.an,w:WID.shin});
    P.push({k:'joint',c:'pants',p:L.kn,r:2.5});P.push({k:'limb',c:'shoe',a:L.heel,b:L.toe,w:WID.foot});
    P.push({k:'joint',c:'shoe',p:L.an,r:2.1});P.push({k:'joint',c:'pants',p:L.hip,r:2.8});feet.push(L.toe,L.heel);
  });
  J.arms.forEach(function(A){
    P.push({k:'limb',c:'shirt',a:A.sho,b:A.el,w:WID.uarm});P.push({k:'limb',c:'skin',a:A.el,b:A.hd,w:WID.farm});
    P.push({k:'limb',c:'skin',a:A.hd,b:A.tip,w:WID.hand,cap:1});P.push({k:'joint',c:'skin',p:A.el,r:2.1});
    P.push({k:'joint',c:'shirt',p:A.sho,r:3.0});hands.push(A.tip);
  });
  if(J.club) P.push({k:'club3',a:J.club.a,b:J.club.b});
  P.push({k:'head',p:J.head,r:HEAD_R,up:J.hup,fwd:J.fwd});
  if(J.gearHand) hands.reverse();
  return {P:P,hands:hands,feet:feet,pel:pel};
}
/* chuỗi khung mocap → clip lưu được: {d, dur, view, club, org0, f:[{t,p,o}]} */
function mocapClip(frames,W,H,slow,t0,t1,club){
  var F=frames.filter(function(f){return f.w&&f.l&&f.t>=t0&&f.t<=t1;});
  if(F.length<6) return null;
  var step=0.02*slow, keep=[], last=-1e9;                     /* ≤ 50 khung/giây thật */
  F.forEach(function(f){ if(f.t-last>=step-1e-6){keep.push(f);last=f.t;} }); F=keep;
  /* làm mượt 3 khung trên toạ độ 3D */
  var Wm=F.map(function(f,i){var a=F[Math.max(0,i-1)].w,b=f.w,c=F[Math.min(F.length-1,i+1)].w;
    return b.map(function(p,k){return [a[k][0]*.25+p[0]*.5+c[k][0]*.25,a[k][1]*.25+p[1]*.5+c[k][1]*.25,a[k][2]*.25+p[2]*.5+c[k][2]*.25];});});
  /* tỉ lệ đơn vị hình / pixel: từ chiều cao người ở khung đầu (tai → cổ chân ≈ 0,87 chiều cao) */
  var l0=F[0].l, ph=(Math.max(l0[27][1],l0[28][1])-(l0[7][1]+l0[8][1])/2)*H/0.87, upp=95/Math.max(40,ph);
  var hx0=(l0[23][0]+l0[24][0])/2*W, hy0=(l0[23][1]+l0[24][1])/2*H;
  var out=[], tStart=F[0].t;
  F.forEach(function(f,i){
    var pts=mocapRetarget(Wm[i]);
    var hx=(f.l[23][0]+f.l[24][0])/2*W, hy=(f.l[23][1]+f.l[24][1])/2*H;
    out.push({t:Math.round((f.t-tStart)/slow*1000),p:pts,o:[Math.round((hx-hx0)*upp*10)/10,Math.round((hy-hy0)*upp*10)/10]});
  });
  /* neo chân xuống sàn theo khung đầu */
  var J0=mocapDecode(out[0].p), fy=Math.max(J0.legs[0].toe[1],J0.legs[0].heel[1],J0.legs[1].toe[1],J0.legs[1].heel[1]);
  return {d:new Date().toLocaleDateString(LOCALE),dur:out[out.length-1].t,view:0,club:club?30:0,org0:[65,Math.round((GYY-1.5-fy)*10)/10],f:out};
}
/* tư thế tại thời điểm t (ms) của clip — nội suy tuyến tính giữa 2 khung */
function mocapPose(clip,t,view){
  var F=clip.f, n=F.length, i=0;
  if(t<=0) i=0; else if(t>=F[n-1].t) i=n-1; else { var lo=0,hi=n-1; while(hi-lo>1){var m=(lo+hi)>>1; if(F[m].t<=t) lo=m; else hi=m;} i=lo; }
  var A=F[i], B=F[Math.min(n-1,i+1)], x=(B.t>A.t)?Math.max(0,Math.min(1,(t-A.t)/(B.t-A.t))):0;
  var pts=A.p.map(function(p,k){var q=B.p[k];return [p[0]+(q[0]-p[0])*x,p[1]+(q[1]-p[1])*x,p[2]+(q[2]-p[2])*x];});
  var o=[A.o[0]+(B.o[0]-A.o[0])*x, A.o[1]+(B.o[1]-A.o[1])*x];
  var J=mocapDecode(pts,clip.club); J.gearHand=clip.gearHand||0;
  return {view:view==null?(clip.view||0):view, org:[clip.org0[0]+o[0], clip.org0[1]+o[1]], J:J, gear:clip.gear||null};
}
function playClip(el,clip,tag,view){
  el.innerHTML=bodyF(mocapPose(clip,0,view));
  PLAYERS.push({el:el,clip:clip,view:view,dur:clip.dur+(clip.hold==null?700:clip.hold),t0:nowMs(),tag:tag});
  if(ANIM_ON&&!RAF) RAF=requestAnimationFrame(tick);
}

/* dụng cụ + mặt sàn + hàm dựng hoàn chỉnh */
function gearF(G,h){
  if(!G) return '';
  if(typeof G==='string') G={k:G};
  var x=h[0],y=h[1],Y='#F2C230',YD='#B98F12';
  if(G.k==='kb') return '<path d="M'+(x-4.6)+' '+(y+1)+' q4.6 -7 9.2 0" fill="none" stroke="'+Y+'" stroke-width="1.9"/><circle cx="'+x+'" cy="'+(y+6.6)+'" r="5.8" fill="'+Y+'"/><circle cx="'+(x-1.8)+'" cy="'+(y+4.8)+'" r="1.9" fill="#fff" opacity=".35"/>';
  if(G.k==='db') return '<rect x="'+(x-8.6)+'" y="'+(y-4)+'" width="4.4" height="9" rx="1.4" fill="'+Y+'" stroke="'+YD+'" stroke-width=".8"/><rect x="'+(x+4.2)+'" y="'+(y-4)+'" width="4.4" height="9" rx="1.4" fill="'+Y+'" stroke="'+YD+'" stroke-width=".8"/><line x1="'+(x-4.4)+'" y1="'+(y+.5)+'" x2="'+(x+4.4)+'" y2="'+(y+.5)+'" stroke="'+Y+'" stroke-width="1.9"/>';
  if(G.k==='ball') return '<circle cx="'+x+'" cy="'+y+'" r="'+(G.r||6.3)+'" fill="rgba(242,194,48,.18)" stroke="'+Y+'" stroke-width="2.1"/>';
  if(G.k==='club'){var t=[x+Math.sin(G.a*DG)*(G.len||30), y+Math.cos(G.a*DG)*(G.len||30)];
    return '<line x1="'+x.toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+t[0].toFixed(1)+'" y2="'+t[1].toFixed(1)+'" stroke="'+Y+'" stroke-width="1.7" stroke-linecap="round"/>'+
      '<line x1="'+(t[0]-3).toFixed(1)+'" y1="'+t[1].toFixed(1)+'" x2="'+(t[0]+3).toFixed(1)+'" y2="'+t[1].toFixed(1)+'" stroke="'+Y+'" stroke-width="2.6" stroke-linecap="round"/>';}
  if(G.k==='band') return '<line x1="'+x.toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+G.to[0]+'" y2="'+G.to[1]+'" stroke="'+Y+'" stroke-width="1.6"/><circle cx="'+G.to[0]+'" cy="'+G.to[1]+'" r="2" fill="'+Y+'"/>';
  return '';
}
function groundF(q){
  if(q&&q.elev){
    var s=Math.sin(q.elev*Math.PI/180), cy=(q.org&&q.org[1]||100)+16;
    return '<ellipse cx="65" cy="'+cy.toFixed(0)+'" rx="52" ry="'+(20*s).toFixed(1)+
           '" fill="#0C3325" stroke="#2F6E56" stroke-width="1.4"/>';
  }
  return '<line x1="6" y1="132" x2="124" y2="132" stroke="#2F6E56" stroke-width="1.8"/>';
}
function bodyF(q){
  var r=draw4(q), b=r.svg+gearF(q.gear,r.hand);
  if(q.k&&q.k!==1||q.ty){
    var cx=q.cx==null?65:q.cx, cy=q.cy==null?118:q.cy, k=q.k||1;
    b='<g transform="translate(0,'+(q.ty||0)+') translate('+cx+','+cy+') scale('+k+') translate('+(-cx)+','+(-cy)+')">'+b+'</g>';
  }
  return groundF(q)+(q.behind||'')+b+(q.arrow||'');
}

var FIGS3=[[{cap:L("① Chuẩn bị","① Set up"),cue:L("Chân rộng bằng vai, ôm tạ sát ngực","Feet shoulder-width, weight held tight to your chest"),q:{view:34,lean:5,tilt:0,hw:7,sw:10,org:[65,79.5],legs:[{side:-1,t:0,tb:-11,s:0,sb:7.699999999999999,fdir:1},{side:1,t:0,tb:11,s:0,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:6,ub:-8,f:146,fb:-5.6},{side:1,u:6,ub:8,f:146,fb:5.6}],gear:{k:"kb"}}},{cap:L("② Ngồi xuống","② Sit down"),cue:L("Hông xuống dưới gối, lưng giữ thẳng","Hips below knees, back stays straight"),q:{view:34,lean:26,tilt:0,hw:7,sw:10,org:[46.978455072092856,110.34208771758286],legs:[{side:-1,t:98,tb:-11,s:-18,sb:7.699999999999999,fdir:1},{side:1,t:98,tb:11,s:-18,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:6,ub:-8,f:146,fb:-5.6},{side:1,u:6,ub:8,f:146,fb:5.6}],gear:{k:"kb"}}},{cap:L("③ Đạp lên","③ Drive up"),cue:L("Đạp gót, siết mông về tư thế đứng","Push through your heels, squeeze glutes to stand"),q:{view:34,lean:15,tilt:0,hw:7,sw:10,org:[48.85292484789848,89.87260781622768],legs:[{side:-1,t:52,tb:-11,s:-10,sb:7.699999999999999,fdir:1},{side:1,t:52,tb:11,s:-10,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:6,ub:-8,f:146,fb:-5.6},{side:1,u:6,ub:8,f:146,fb:5.6}],gear:{k:"kb"}}}],[{cap:L("① Chuẩn bị","① Set up"),cue:L("Tạ trước người, lưng thẳng","Weight in front of you, back straight"),q:{view:34,lean:8,tilt:0,hw:7,sw:10,org:[65,79.5],legs:[{side:-1,t:0,tb:-11,s:0,sb:7.699999999999999,fdir:1},{side:1,t:0,tb:11,s:0,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:5,ub:-8,f:5,fb:-5.6},{side:1,u:5,ub:8,f:5,fb:5.6}],gear:{k:"kb"}}},{cap:L("② Gập hông","② Hinge"),cue:L("Đẩy hông RA SAU, tạ vào giữa hai đùi","Push hips BACK, weight between your thighs"),q:{view:34,lean:58,tilt:0,hw:7,sw:10,org:[62.20750762042959,80.20511499671422],legs:[{side:-1,t:12,tb:-11,s:-6,sb:7.699999999999999,fdir:1},{side:1,t:12,tb:11,s:-6,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:-12,ub:-8,f:-16,fb:-5.6},{side:1,u:-12,ub:8,f:-16,fb:5.6}],gear:{k:"kb"}}},{cap:L("③ Bật hông","③ Hip snap"),cue:L("Bùng nổ hông — tạ tự bay lên ngang ngực","Explode through the hips — the bell floats to chest height"),q:{view:34,lean:0,tilt:0,hw:7,sw:10,org:[65,79.5],legs:[{side:-1,t:0,tb:-11,s:0,sb:7.699999999999999,fdir:1},{side:1,t:0,tb:11,s:0,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:88,ub:-8,f:90,fb:-5.6},{side:1,u:88,ub:8,f:90,fb:5.6}],gear:{k:"kb"}}}],[{cap:L("① Chuẩn bị","① Set up"),cue:L("Mũi chân sau gác ghế, thân trên thẳng","Back foot on a bench, torso upright"),q:{view:30,lean:6,tilt:0,hw:7,sw:10,org:[51,79.5],legs:[{side:-1,t:0,tb:-11,s:0,sb:7.699999999999999,fdir:1},{side:1,t:69.20961650417367,tb:11,s:52.72576610458599,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:6,ub:-8,f:6,fb:-5.6},{side:1,u:8,ub:8,f:8,fb:5.6}],behind:"<rect x=\"92\" y=\"108\" width=\"26\" height=\"24\" fill=\"rgba(110,149,133,.13)\" stroke=\"#6E9585\" stroke-width=\"1.7\" rx=\"2\"/>"}},{cap:L("② Xuống","② Lower"),cue:L("Gối sau hạ gần sàn, gối trước không vượt mũi chân","Back knee near the floor, front knee not past the toes"),q:{view:30,lean:10,tilt:0,hw:7,sw:10,org:[34.091409975659595,94.03634621066693],legs:[{side:-1,t:62,tb:-11,s:-14,sb:7.699999999999999,fdir:1},{side:1,t:88.02219560642263,tb:11,s:73.73263445157082,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:6,ub:-8,f:6,fb:-5.6},{side:1,u:8,ub:8,f:8,fb:5.6}],behind:"<rect x=\"92\" y=\"108\" width=\"26\" height=\"24\" fill=\"rgba(110,149,133,.13)\" stroke=\"#6E9585\" stroke-width=\"1.7\" rx=\"2\"/>"}},{cap:L("③ Lên","③ Rise"),cue:L("Đạp gót chân trước, giữ thân không đổ","Drive through the front heel, keep your torso tall"),q:{view:30,lean:8,tilt:0,hw:7,sw:10,org:[41.046733585128685,83.16968571057154],legs:[{side:-1,t:30,tb:-11,s:-7,sb:7.699999999999999,fdir:1},{side:1,t:76.78131635189682,tb:11,s:61.91465341661691,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:6,ub:-8,f:6,fb:-5.6},{side:1,u:8,ub:8,f:8,fb:5.6}],behind:"<rect x=\"92\" y=\"108\" width=\"26\" height=\"24\" fill=\"rgba(110,149,133,.13)\" stroke=\"#6E9585\" stroke-width=\"1.7\" rx=\"2\"/>"}}],[{cap:L("① Nhún lấy đà","① Load"),cue:L("Nửa squat, hai tay đưa ra sau","Half squat, arms swing back"),q:{view:32,org:[46,86],lean:26,legs:[{side:-1,t:42,tb:-11,s:-14,sb:8,fdir:1},{side:1,t:42,tb:11,s:-14,sb:-8,fdir:1}],arms:[{side:-1,u:-42,ub:-9,f:-36,fb:-7},{side:1,u:-42,ub:9,f:-36,fb:7}],behind:"<rect x=\"80\" y=\"102\" width=\"32\" height=\"30\" fill=\"rgba(110,149,133,.13)\" stroke=\"#5C7F71\" stroke-width=\"1.7\" rx=\"2\"/>"}},{cap:L("② Bật lên","② Jump"),cue:L("Duỗi hết hông–gối–cổ chân, tay vung lên","Fully extend hips–knees–ankles, arms swing up"),q:{view:32,org:[64,60],lean:8,legs:[{side:-1,t:-14,tb:-8,s:12,sb:6,fdir:1},{side:1,t:-14,tb:8,s:12,sb:-6,fdir:1}],arms:[{side:-1,u:168,ub:-16,f:174,fb:-12},{side:1,u:168,ub:16,f:174,fb:12}],behind:"<rect x=\"80\" y=\"102\" width=\"32\" height=\"30\" fill=\"rgba(110,149,133,.13)\" stroke=\"#5C7F71\" stroke-width=\"1.7\" rx=\"2\"/>"}},{cap:L("③ Tiếp đất trên bục","③ Land on the box"),cue:L("Đáp êm, gối gập ~45° — KHÔNG nhảy xuống","Land softly, knees bent ~45° — DON'T jump down"),q:{view:32,org:[96,63],lean:22,legs:[{side:-1,t:44,tb:-10,s:-16,sb:7,fdir:1},{side:1,t:44,tb:10,s:-16,sb:-7,fdir:1}],arms:[{side:-1,u:58,ub:-12,f:72,fb:-9},{side:1,u:58,ub:12,f:72,fb:9}],behind:"<rect x=\"80\" y=\"102\" width=\"32\" height=\"30\" fill=\"rgba(110,149,133,.13)\" stroke=\"#5C7F71\" stroke-width=\"1.7\" rx=\"2\"/>"}}],[{cap:L("① Nằm chuẩn bị","① Lie down"),cue:L("Vai sát sàn, một gối co, chân kia duỗi thẳng","Shoulders down, one knee bent, other leg straight"),q:{view:6,elev:34,pitch:-104,org:[62,106],noshadow:1,legs:[{side:-1,t:52,tb:-7,s:-8,sb:4,fdir:1,fa:0},{side:1,t:10,tb:7,s:8,sb:-4,fdir:1,fa:0}],arms:[{side:-1,u:6,ub:-9,f:4,fb:-6},{side:1,u:6,ub:9,f:4,fb:6}]}},{cap:L("② Đẩy hông lên","② Drive hips up"),cue:L("Siết mông — vai/hông/gối thành ĐƯỜNG THẲNG","Squeeze glutes — shoulders/hips/knee in a STRAIGHT LINE"),q:{view:6,elev:34,pitch:-128,org:[62,100],noshadow:1,legs:[{side:-1,t:74,tb:-7,s:-26,sb:4,fdir:1,fa:0},{side:1,t:34,tb:7,s:32,sb:-4,fdir:1,fa:0}],arms:[{side:-1,u:14,ub:-9,f:12,fb:-6},{side:1,u:14,ub:9,f:12,fb:6}]}},{cap:L("③ Hạ có kiểm soát","③ Lower with control"),cue:L("Hạ chậm, không thả rơi hông xuống sàn","Lower slowly, don't drop your hips to the floor"),q:{view:6,elev:34,pitch:-114.8,org:[62,103.3],noshadow:1,legs:[{side:-1,t:61.9,tb:-7,s:-16.1,sb:4,fdir:1,fa:0},{side:1,t:20.799999999999997,tb:7,s:18.799999999999997,sb:-4,fdir:1,fa:0}],arms:[{side:-1,u:9.6,ub:-9,f:7.6,fb:-6},{side:1,u:9.6,ub:9,f:7.6,fb:6}]}}],[{cap:L("① Vào tư thế","① Get set"),cue:L("Đứng nghiêng với tường, ôm bóng ngang hông sau","Stand side-on to the wall, ball at your back hip"),q:{view:-72,lean:0,tilt:0,hw:7,sw:10,org:[58,80],hipYaw:10,shoYaw:-34,legs:[{side:-1,t:0,tb:-15.76031473405274,s:0,sb:2.434557604714082,fdir:-1},{side:1,t:0,tb:19.935147811289433,s:0,sb:2.543076283533596,fdir:1}],arms:[{side:-1,u:0,ub:-52,f:0,fb:-30},{side:1,u:0,ub:-46,f:0,fb:-24}],gear:{k:"ball"},behind:"<line x1=\"114\" y1=\"34\" x2=\"114\" y2=\"132\" stroke=\"#6E9585\" stroke-width=\"1.7\" stroke-dasharray=\"4 3\"/>"}},{cap:L("② Xoay hông trước","② Hips turn first"),cue:L("Hông xoay TRƯỚC, thân trên còn giữ lại — tạo độ vặn","Hips turn FIRST, upper body stays back — builds the X-factor"),q:{view:-72,lean:0,tilt:0,hw:7,sw:10,org:[60,80],hipYaw:26,shoYaw:-6,legs:[{side:-1,t:0,tb:-15.76031473405274,s:0,sb:2.434557604714082,fdir:-1},{side:1,t:0,tb:22.12094861806503,s:0,sb:4.873139824077813,fdir:1}],arms:[{side:-1,u:0,ub:-16,f:0,fb:26},{side:1,u:0,ub:-10,f:0,fb:32}],gear:{k:"ball"},behind:"<line x1=\"114\" y1=\"34\" x2=\"114\" y2=\"132\" stroke=\"#6E9585\" stroke-width=\"1.7\" stroke-dasharray=\"4 3\"/>"}},{cap:L("③ Ném","③ Throw"),cue:L("Ưu tiên TỐC ĐỘ bóng, không phải bóng nặng","Prioritize ball SPEED, not a heavy ball"),q:{view:-72,lean:0,tilt:8,hw:7,sw:10,org:[62,80],hipYaw:38,shoYaw:30,legs:[{side:-1,t:0,tb:-14.784339374996119,s:0,sb:6.049564367457333,fdir:-1},{side:1,t:0,tb:26.36988696232615,s:0,sb:9.464040453593915,fdir:1}],arms:[{side:-1,u:0,ub:74,f:0,fb:86},{side:1,u:0,ub:68,f:0,fb:80}],gear:{k:"ball"},behind:"<line x1=\"114\" y1=\"34\" x2=\"114\" y2=\"132\" stroke=\"#6E9585\" stroke-width=\"1.7\" stroke-dasharray=\"4 3\"/>"}}],[{cap:L("① Hạ thấp","① Get low"),cue:L("Nửa squat, bóng thấp giữa hai chân","Half squat, ball low between your legs"),q:{view:40,lean:32,tilt:0,hw:7,sw:10,org:[50.55976779621692,90.23540848463298],hipYaw:4,shoYaw:-14,legs:[{side:-1,t:52,tb:-11,s:-14,sb:7.699999999999999,fdir:1},{side:1,t:52,tb:11,s:-14,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:-4,ub:-8,f:2,fb:-5.6},{side:1,u:-4,ub:8,f:2,fb:5.6}],gear:{k:"ball"}}},{cap:L("② Múc chéo lên","② Scoop diagonally"),cue:L("Duỗi hông và gối, múc bóng theo đường chéo","Extend hips and knees, scoop the ball on a diagonal"),q:{view:40,lean:12,tilt:0,hw:7,sw:10,org:[58.7094699898545,80.8334293198304],hipYaw:10,shoYaw:6,legs:[{side:-1,t:18,tb:-11,s:-4,sb:7.699999999999999,fdir:1},{side:1,t:18,tb:11,s:-4,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:34,ub:-8,f:56,fb:-5.6},{side:1,u:34,ub:8,f:56,fb:5.6}],gear:{k:"ball"}}},{cap:L("③ Thả lên cao","③ Release high"),cue:L("Bóng bay chéo lên — đúng quỹ đạo lực của driver","Ball flies up diagonally — the same force path as a driver swing"),q:{view:40,lean:-6,tilt:0,hw:7,sw:10,org:[65.13917310096006,79.9963284941799],hipYaw:14,shoYaw:20,legs:[{side:-1,t:-8,tb:-11,s:8,sb:7.699999999999999,fdir:1},{side:1,t:-8,tb:11,s:8,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:140,ub:-8,f:162,fb:-5.6},{side:1,u:140,ub:8,f:162,fb:5.6}],gear:{k:"ball"}}}],[{cap:L("① Tay sát ngực","① Hands at chest"),cue:L("Dây kéo từ MỘT BÊN, hai tay ôm sát giữa ngực","Band pulls from ONE SIDE, both hands at mid-chest"),q:{view:-58,lean:0,tilt:4,hw:7,sw:10,org:[75.17364817766693,80.2748045963774],hipYaw:0,shoYaw:-8,legs:[{side:-1,t:0,tb:-10,s:0,sb:10,fdir:1},{side:1,t:0,tb:10,s:0,sb:-10,fdir:1}],arms:[{side:-1,u:0,ub:24,f:0,fb:150},{side:1,u:0,ub:20,f:0,fb:146}],gear:{k:"band",to:[14,74]}}},{cap:L("② Đẩy thẳng ra trước","② Press straight out"),cue:L("Dây cố kéo bạn XOAY — không cho thân xoay theo","The band tries to ROTATE you — don't let your torso turn"),q:{view:-58,lean:0,tilt:4,hw:7,sw:10,org:[75.17364817766693,80.2748045963774],hipYaw:0,shoYaw:-8,legs:[{side:-1,t:0,tb:-10,s:0,sb:10,fdir:1},{side:1,t:0,tb:10,s:0,sb:-10,fdir:1}],arms:[{side:-1,u:0,ub:84,f:0,fb:88},{side:1,u:0,ub:80,f:0,fb:84}],gear:{k:"band",to:[14,74]}}},{cap:L("③ Về ngực","③ Back to chest"),cue:L("Về chậm, giữ sườn không bị kéo lệch","Return slowly, don't let your ribs get pulled off line"),q:{view:-58,lean:0,tilt:4,hw:7,sw:10,org:[75.17364817766693,80.2748045963774],hipYaw:0,shoYaw:-8,legs:[{side:-1,t:0,tb:-10,s:0,sb:10,fdir:1},{side:1,t:0,tb:10,s:0,sb:-10,fdir:1}],arms:[{side:-1,u:0,ub:52,f:0,fb:124},{side:1,u:0,ub:48,f:0,fb:120}],gear:{k:"band",to:[14,74]}}}],[{cap:L("① Vào tư thế 90/90","① Set up 90/90"),cue:L("Nằm ngửa, đùi và cẳng chân đều vuông góc","On your back, thighs and shins at right angles"),q:{view:6,elev:34,pitch:-90,org:[60,104],noshadow:1,legs:[{side:-1,t:90,tb:-7,s:2,sb:4,fdir:1,fa:0},{side:1,t:90,tb:7,s:2,sb:-4,fdir:1,fa:0}],arms:[{side:-1,u:88,ub:-8,f:90,fb:-5},{side:1,u:88,ub:8,f:90,fb:5}]}},{cap:L("② Duỗi chéo","② Extend opposites"),cue:L("Tay một bên + chân ĐỐI DIỆN duỗi ra — lưng dưới ép sàn","One arm + the OPPOSITE leg extend — lower back pressed to the floor"),q:{view:6,elev:34,pitch:-90,org:[60,104],noshadow:1,legs:[{side:-1,t:26,tb:-7,s:14,sb:4,fdir:1,fa:0},{side:1,t:90,tb:7,s:2,sb:-4,fdir:1,fa:0}],arms:[{side:-1,u:150,ub:-8,f:156,fb:-5},{side:1,u:88,ub:8,f:90,fb:5}]}},{cap:L("③ Về giữa","③ Return"),cue:L("Về chậm, không để lưng cong vênh khỏi sàn","Return slowly, don't let your back arch off the floor"),q:{view:6,elev:34,pitch:-90,org:[60,104],noshadow:1,legs:[{side:-1,t:64.4,tb:-7,s:6.800000000000001,sb:4,fdir:1,fa:0},{side:1,t:90,tb:7,s:2,sb:-4,fdir:1,fa:0}],arms:[{side:-1,u:112.80000000000001,ub:-8,f:116.4,fb:-5},{side:1,u:88,ub:8,f:90,fb:5}]}}],[{cap:L("① Chống khuỷu","① On your elbow"),cue:L("Vai–hông–gối thành MỘT đường thẳng","Shoulders–hips–knees in ONE straight line"),q:{view:8,elev:32,pitch:90,spin:84,org:[62,96],noshadow:1,legs:[{side:-1,t:3,tb:-4,s:0,sb:2,fdir:1,fa:0},{side:1,t:3,tb:4,s:0,sb:-2,fdir:1,fa:0}],arms:[{side:-1,u:4,ub:-72,f:6,fb:-128},{side:1,u:16,ub:-8,f:18,fb:-6}]}},{cap:L("② Nâng hông","② Lift hips"),cue:L("Siết cơ liên sườn, đẩy hông lên cao","Brace your obliques, drive hips up high"),q:{view:8,elev:32,pitch:90,spin:84,org:[62,90],noshadow:1,legs:[{side:-1,t:3,tb:-4,s:0,sb:2,fdir:1,fa:0},{side:1,t:3,tb:4,s:0,sb:-2,fdir:1,fa:0}],arms:[{side:-1,u:4,ub:-72,f:6,fb:-128},{side:1,u:172,ub:-8,f:176,fb:-6}]}},{cap:L("③ Xoay tay lên trần","③ Reach to the ceiling"),cue:L("Mở ngực, mắt nhìn theo bàn tay","Open your chest, eyes follow your hand"),q:{view:8,elev:32,pitch:90,spin:84,org:[62,91.8],noshadow:1,legs:[{side:-1,t:3,tb:-4,s:0,sb:2,fdir:1,fa:0},{side:1,t:3,tb:4,s:0,sb:-2,fdir:1,fa:0}],arms:[{side:-1,u:4,ub:-72,f:6,fb:-128},{side:1,u:125.2,ub:-8,f:128.6,fb:-6}]}}],[{cap:L("① Đứng thẳng","① Stand tall"),cue:L("Tạ trước đùi, vai mở, lưng thẳng","Weight in front of thighs, shoulders open, back straight"),q:{view:34,lean:4,tilt:0,hw:7,sw:10,org:[65,79.5],legs:[{side:-1,t:0,tb:-11,s:0,sb:7.699999999999999,fdir:1},{side:1,t:0,tb:11,s:0,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:4,ub:-8,f:4,fb:-5.6},{side:1,u:4,ub:8,f:4,fb:5.6}],gear:{k:"db"}}},{cap:L("② Gập hông","② Hinge"),cue:L("Hông đẩy RA SAU, tạ trượt sát dọc chân","Push hips BACK, weight slides close along your legs"),q:{view:34,lean:62,tilt:0,hw:7,sw:10,org:[63.125411218641425,79.81392895622356],legs:[{side:-1,t:8,tb:-11,s:-4,sb:7.699999999999999,fdir:1},{side:1,t:8,tb:11,s:-4,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:-4,ub:-8,f:-4,fb:-5.6},{side:1,u:-4,ub:8,f:-4,fb:5.6}],gear:{k:"db"}}},{cap:L("③ Về thẳng","③ Stand up"),cue:L("Siết mông đẩy hông về trước, không ưỡn lưng","Squeeze glutes, hips forward, don't overarch your back"),q:{view:34,lean:28,tilt:0,hw:7,sw:10,org:[64.05881910021526,79.57856401776718],legs:[{side:-1,t:4,tb:-11,s:-2,sb:7.699999999999999,fdir:1},{side:1,t:4,tb:11,s:-2,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:0,ub:-8,f:0,fb:-5.6},{side:1,u:0,ub:8,f:0,fb:5.6}],gear:{k:"db"}}}],[{cap:L("① Plank cao","① High plank"),cue:L("Tay ngay dưới vai, thân thẳng từ đầu tới gót","Hands under shoulders, body straight from head to heels"),q:{view:10,pitch:90,roll:-30,lean:0,org:[62,110],noshadow:1,legs:[{side:-1,t:2,tb:-6,s:0,sb:3,fdir:1,fa:0},{side:1,t:2,tb:6,s:0,sb:-3,fdir:1,fa:0}],arms:[{side:-1,u:90,ub:-7,f:90,fb:-4},{side:1,u:90,ub:7,f:90,fb:4}]}},{cap:L("② Hạ ngực","② Lower chest"),cue:L("Khuỷu tay ~45° so với thân, KHÔNG xoè ngang","Elbows ~45° from your body, DON'T flare them"),q:{view:10,pitch:90,roll:-30,lean:0,org:[62,118],noshadow:1,legs:[{side:-1,t:2,tb:-6,s:0,sb:3,fdir:1,fa:0},{side:1,t:2,tb:6,s:0,sb:-3,fdir:1,fa:0}],arms:[{side:-1,u:52,ub:-26,f:120,fb:-16},{side:1,u:52,ub:26,f:120,fb:16}]}},{cap:L("③ Đẩy lên","③ Push up"),cue:L("Đẩy sàn ra xa, giữ hông không võng","Push the floor away, keep hips from sagging"),q:{view:10,pitch:90,roll:-30,lean:0,org:[62,113.6],noshadow:1,legs:[{side:-1,t:2,tb:-6,s:0,sb:3,fdir:1,fa:0},{side:1,t:2,tb:6,s:0,sb:-3,fdir:1,fa:0}],arms:[{side:-1,u:72.9,ub:-15.55,f:103.5,fb:-9.4},{side:1,u:72.9,ub:15.55,f:103.5,fb:9.4}]}}],[{cap:L("① Vào tư thế","① Get set"),cue:L("Một tay chống ghế, lưng song song sàn","One hand on a bench, back parallel to the floor"),q:{view:36,lean:72,org:[56,84],legs:[{side:-1,t:10,tb:-9,s:-5.5,sb:6,fdir:1},{side:1,t:10,tb:9,s:-5.5,sb:-6,fdir:1}],behind:"<rect x=\"60\" y=\"104\" width=\"34\" height=\"28\" fill=\"rgba(110,149,133,.13)\" stroke=\"#5C7F71\" stroke-width=\"1.7\" rx=\"2\"/>",gear:"db",arms:[{side:-1,u:4,ub:-8,f:6,fb:-6},{side:1,u:0,ub:6,f:0,fb:4}]}},{cap:L("② Kéo lên sườn","② Row to your side"),cue:L("Kéo bằng CƠ XÔ, khuỷu men sát thân","Pull with your LATS, elbow close to your body"),q:{view:36,lean:72,org:[56,84],legs:[{side:-1,t:10,tb:-9,s:-5.5,sb:6,fdir:1},{side:1,t:10,tb:9,s:-5.5,sb:-6,fdir:1}],behind:"<rect x=\"60\" y=\"104\" width=\"34\" height=\"28\" fill=\"rgba(110,149,133,.13)\" stroke=\"#5C7F71\" stroke-width=\"1.7\" rx=\"2\"/>",gear:"db",arms:[{side:-1,u:-34,ub:-14,f:-74,fb:-10},{side:1,u:0,ub:6,f:0,fb:4}]}},{cap:L("③ Hạ chậm","③ Lower slowly"),cue:L("Duỗi hết tay, không xoay thân theo tạ","Arm fully extended, don't twist with the weight"),q:{view:36,lean:72,org:[56,84],legs:[{side:-1,t:10,tb:-9,s:-5.5,sb:6,fdir:1},{side:1,t:10,tb:9,s:-5.5,sb:-6,fdir:1}],behind:"<rect x=\"60\" y=\"104\" width=\"34\" height=\"28\" fill=\"rgba(110,149,133,.13)\" stroke=\"#5C7F71\" stroke-width=\"1.7\" rx=\"2\"/>",gear:"db",arms:[{side:-1,u:-12,ub:-10,f:-24,fb:-8},{side:1,u:0,ub:6,f:0,fb:4}]}}],[{cap:L("① Bóng trên đầu","① Ball overhead"),cue:L("Vươn hết người, bóng cao qua đầu","Reach tall, ball high overhead"),q:{view:34,lean:-8,tilt:0,hw:7,sw:10,org:[65.06975647374414,79.62423343674897],legs:[{side:-1,t:-4,tb:-11,s:4,sb:7.699999999999999,fdir:1},{side:1,t:-4,tb:11,s:4,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:152,ub:-8,f:160,fb:-5.6},{side:1,u:152,ub:8,f:160,fb:5.6}],gear:{k:"ball"}}},{cap:L("② Đập xuống","② Slam"),cue:L("Gập thân + đập HẾT LỰC xuống sàn","Fold and slam it into the floor with EVERYTHING"),q:{view:34,lean:44,tilt:0,hw:7,sw:10,org:[57.94355462515725,82.51116097091646],legs:[{side:-1,t:26,tb:-11,s:-10,sb:7.699999999999999,fdir:1},{side:1,t:26,tb:11,s:-10,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:26,ub:-8,f:30,fb:-5.6},{side:1,u:26,ub:8,f:30,fb:5.6}],gear:{k:"ball"}}},{cap:L("③ Bóng chạm sàn","③ Ball hits the floor"),cue:L("Theo bóng xuống, giữ lưng thẳng","Follow the ball down, keep your back straight"),q:{view:34,lean:58,tilt:0,hw:7,sw:10,org:[55.65877678020456,84.49133309522378],legs:[{side:-1,t:34,tb:-11,s:-12,sb:7.699999999999999,fdir:1},{side:1,t:34,tb:11,s:-12,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:8,ub:-8,f:10,fb:-5.6},{side:1,u:8,ub:8,f:10,fb:5.6}],gear:{k:"ball"}}}],[{cap:L("① Đứng","① Stand"),cue:L("Hai chân rộng bằng hông","Feet hip-width apart"),q:{view:-84,lean:0,tilt:0,hw:7,sw:10,org:[65,80],hipYaw:0,shoYaw:0,legs:[{side:-1,t:0,tb:-13.206238802384767,s:0,sb:9.06733786206419,fdir:-1},{side:1,t:0,tb:13.206238802384767,s:0,sb:-9.06733786206419,fdir:1}],arms:[{side:-1,u:0,ub:8,f:0,fb:8},{side:1,u:0,ub:-8,f:0,fb:-8}]}},{cap:L("② Bước ngang","② Step sideways"),cue:L("Bước rộng, ngồi sang MỘT bên — chân kia duỗi thẳng","Step wide, sit into ONE side — the other leg straight"),q:{view:-84,lean:0,tilt:0,hw:7,sw:10,org:[52,92],hipYaw:-12,shoYaw:-6,legs:[{side:-1,t:0,tb:-55.250962174865435,s:0,sb:21.99482020070819,fdir:-1},{side:1,t:0,tb:57.81013146238764,s:0,sb:42.32923023870474,fdir:1}],arms:[{side:-1,u:0,ub:34,f:0,fb:50},{side:1,u:0,ub:30,f:0,fb:46}]}},{cap:L("③ Đạp về","③ Push back"),cue:L("Đạp chân trụ đưa người về giữa","Push off the working leg back to center"),q:{view:-84,lean:0,tilt:0,hw:7,sw:10,org:[60,86],hipYaw:-4,shoYaw:-2,legs:[{side:-1,t:0,tb:-38.42552554775107,s:0,sb:19.047792471842357,fdir:-1},{side:1,t:0,tb:39.0609953774705,s:0,sb:17.736912501256295,fdir:1}],arms:[{side:-1,u:0,ub:24,f:0,fb:38},{side:1,u:0,ub:20,f:0,fb:34}]}}],[{cap:L("① Address","① Address"),cue:L("Đứng như bình thường nhưng ĐỔI TAY","Stand as usual but SWITCH HANDS"),q:{view:-78,lean:30,tilt:-7,hipYaw:0,shoYaw:-6,org:[65,80],legs:[{side:-1,t:4,tb:-14,s:-4,sb:11,fdir:1},{side:1,t:4,tb:14,s:-4,sb:-11,fdir:1}],arms:[{side:-1,grip:[20,6,0]},{side:1,grip:[20,6,0]}],gear:{k:"club",a:13,len:49}}},{cap:L("② Lên gậy (ngược bên)","② Backswing (opposite side)"),cue:L("Xoay vai hết cỡ về phía đối diện thường lệ","Full shoulder turn to the opposite side from usual"),q:{view:-78,lean:29,tilt:-14,hipYaw:44,shoYaw:96,org:[70,79],legs:[{side:-1,t:2,tb:-12,s:-2,sb:9,fdir:1},{side:1,t:8,tb:17,s:-10,sb:-12,fdir:1}],arms:[{side:-1,grip:[6,-30,20]},{side:1,grip:[6,-30,20]}],gear:{k:"club",a:-128,len:26}}},{cap:L("③ Xuống & theo đà","③ Down & through"),cue:L("Hết lực — mục tiêu là cân bằng hai bên cơ thể","Full effort — the goal is balancing both sides of your body"),q:{view:-78,lean:6,tilt:14,hipYaw:-86,shoYaw:-112,org:[57,78],legs:[{side:-1,t:-6,tb:-10,s:4,sb:8,fdir:1},{side:1,t:26,tb:20,s:-30,sb:-16,fdir:-1}],arms:[{side:-1,grip:[-6,-30,-20]},{side:1,grip:[-6,-30,-20]}],gear:{k:"club",a:128,len:26}}}],[{cap:L("① Address","① Address"),cue:L("Gậy nhẹ, tư thế chuẩn như driver","Light club, normal driver setup"),q:{view:-78,lean:30,tilt:-7,hipYaw:0,shoYaw:-6,org:[65,80],legs:[{side:-1,t:4,tb:-14,s:-4,sb:11,fdir:1},{side:1,t:4,tb:14,s:-4,sb:-11,fdir:1}],arms:[{side:-1,grip:[20,6,0]},{side:1,grip:[20,6,0]}],gear:{k:"club",a:13,len:49}}},{cap:L("② Đỉnh gậy","② Top of backswing"),cue:L("Vai xoay 90°+, trọng lượng dồn chân sau","Shoulders turned 90°+, weight on the trail foot"),q:{view:-78,lean:29,tilt:-14,hipYaw:44,shoYaw:96,org:[70,79],legs:[{side:-1,t:2,tb:-12,s:-2,sb:9,fdir:1},{side:1,t:8,tb:17,s:-10,sb:-12,fdir:1}],arms:[{side:-1,grip:[6,-30,20]},{side:1,grip:[6,-30,20]}],gear:{k:"club",a:-128,len:26}}},{cap:L("③ Kết thúc","③ Finish"),cue:L("Swing HẾT LỰC — nghe tiếng whoosh SAU vị trí bóng","Swing ALL OUT — hear the whoosh AFTER the ball position"),q:{view:-78,lean:6,tilt:14,hipYaw:-86,shoYaw:-112,org:[57,78],legs:[{side:-1,t:-6,tb:-10,s:4,sb:8,fdir:1},{side:1,t:26,tb:20,s:-30,sb:-16,fdir:-1}],arms:[{side:-1,grip:[-6,-30,-20]},{side:1,grip:[-6,-30,-20]}],gear:{k:"club",a:128,len:26}}}],[{cap:L("① Address, dồn chân trước","① Address, weight forward"),cue:L("Bắt đầu với trọng lượng dồn chân trước","Start with your weight on the lead foot"),q:{view:-78,lean:30,tilt:-7,hipYaw:0,shoYaw:-6,org:[65,80],legs:[{side:-1,t:4,tb:-14,s:-4,sb:11,fdir:1},{side:1,t:4,tb:14,s:-4,sb:-11,fdir:1}],arms:[{side:-1,grip:[20,6,0]},{side:1,grip:[20,6,0]}],gear:{k:"club",a:13,len:49}}},{cap:L("② Nhấc chân trước","② Lift lead foot"),cue:L("Lên gậy đồng thời NHẤC chân trước khỏi sàn","LIFT the lead foot as you start the backswing"),q:{view:-78,lean:29,tilt:-14,hipYaw:44,shoYaw:96,org:[70,79],legs:[{side:-1,t:2,tb:-12,s:-2,sb:9,fdir:1},{side:1,t:8,tb:17,s:-10,sb:-12,fdir:1}],arms:[{side:-1,grip:[6,-30,20]},{side:1,grip:[6,-30,20]}],gear:{k:"club",a:-128,len:26}}},{cap:L("③ Bước xuống & đánh","③ Step down & swing"),cue:L("Đặt chân trái về đích TRƯỚC khi xuống gậy","Plant the lead foot toward the target BEFORE the downswing"),q:{view:-78,lean:28,tilt:-18,hipYaw:-42,shoYaw:-12,org:[60,80],legs:[{side:-1,t:-2,tb:-16,s:2,sb:13,fdir:1},{side:1,t:10,tb:12,s:-14,sb:-8,fdir:1}],arms:[{side:-1,grip:[21,7,-3]},{side:1,grip:[21,7,-3]}],gear:{k:"club",a:10,len:49}}}],[{cap:L("① Address","① Address"),cue:L("Bóng ngang gót trái, tee cao, cột sống nghiêng nhẹ về sau","Ball off the lead heel, tee high, spine tilted slightly away from the target"),q:{view:-78,lean:30,tilt:-7,hipYaw:0,shoYaw:-6,org:[65,80],legs:[{side:-1,t:4,tb:-14,s:-4,sb:11,fdir:1},{side:1,t:4,tb:14,s:-4,sb:-11,fdir:1}],arms:[{side:-1,grip:[20,6,0]},{side:1,grip:[20,6,0]}],gear:{k:"club",a:13,len:49}}},{cap:L("② Đỉnh gậy","② Top of backswing"),cue:L("Xoay đầy đủ, giữ cột sống nghiêng — chuẩn bị phát lực","Full turn, keep your spine tilt — loaded to fire"),q:{view:-78,lean:29,tilt:-14,hipYaw:44,shoYaw:96,org:[70,79],legs:[{side:-1,t:2,tb:-12,s:-2,sb:9,fdir:1},{side:1,t:8,tb:17,s:-10,sb:-12,fdir:1}],arms:[{side:-1,grip:[6,-30,20]},{side:1,grip:[6,-30,20]}],gear:{k:"club",a:-128,len:26}}},{cap:L("③ Impact & finish","③ Impact & finish"),cue:L("Chỉ nhìn CON SỐ mph, đừng nhìn hướng bóng","Watch only the mph NUMBER, not where the ball goes"),q:{view:-78,lean:6,tilt:14,hipYaw:-86,shoYaw:-112,org:[57,78],legs:[{side:-1,t:-6,tb:-10,s:4,sb:8,fdir:1},{side:1,t:26,tb:20,s:-30,sb:-16,fdir:-1}],arms:[{side:-1,grip:[-6,-30,-20]},{side:1,grip:[-6,-30,-20]}],gear:{k:"club",a:128,len:26}}}]];
var WARM3={A:[{l:L("Xoay hông ×10 mỗi chiều","Hip circles ×10 each way"),p:[{view:-70,org:[58,80],tilt:-9,hipYaw:-20,legs:[{side:-1,t:3,tb:-11,s:-3,sb:7.699999999999999,fdir:1},{side:1,t:3,tb:11,s:-3,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:25,ub:-46,f:10,fb:54},{side:1,u:25,ub:46,f:10,fb:-54}]},{view:-70,org:[65,77],tilt:0,hipYaw:0,lean:10,legs:[{side:-1,t:3,tb:-11,s:-3,sb:7.699999999999999,fdir:1},{side:1,t:3,tb:11,s:-3,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:25,ub:-46,f:10,fb:54},{side:1,u:25,ub:46,f:10,fb:-54}]},{view:-70,org:[72,80],tilt:9,hipYaw:20,legs:[{side:-1,t:3,tb:-11,s:-3,sb:7.699999999999999,fdir:1},{side:1,t:3,tb:11,s:-3,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:25,ub:-46,f:10,fb:54},{side:1,u:25,ub:46,f:10,fb:-54}]}]},{l:L("World’s greatest stretch ×5/bên","World’s greatest stretch ×5/side"),p:[{view:36,lean:50,tilt:0,hw:7,sw:10,org:[64,98],legs:[{side:-1,t:73.1682451390073,tb:-11,s:11.803419525830966,sb:7.699999999999999,fdir:1},{side:1,t:-13.136534329003506,tb:11,s:-74.50135994217986,sb:-7.699999999999999,fdir:-1}],arms:[{side:-1,u:1.5448343724960552,ub:-8,f:-14.501075446843915,fb:-5.6},{side:1,u:-4.806168925589873,ub:8,f:-20.691977409069846,fb:5.6}]},{view:36,lean:40,tilt:0,hw:7,sw:10,org:[64,98],legs:[{side:-1,t:73.1682451390073,tb:-11,s:11.803419525830966,sb:7.699999999999999,fdir:1},{side:1,t:-13.136534329003506,tb:11,s:-74.50135994217986,sb:-7.699999999999999,fdir:-1}],arms:[{side:-1,u:5.989153681035984,ub:-8,f:-9.700835939596976,fb:-5.6},{side:1,u:176,ub:8,f:178,fb:5.6}]}]},{l:L("10 squat không tạ","10 bodyweight squats"),p:[{view:36,lean:5,tilt:0,hw:7,sw:10,org:[65,79.5],legs:[{side:-1,t:0,tb:-11,s:0,sb:7.699999999999999,fdir:1},{side:1,t:0,tb:11,s:0,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:10,ub:-8,f:14,fb:-5.6},{side:1,u:10,ub:8,f:14,fb:5.6}]},{view:36,lean:26,tilt:0,hw:7,sw:10,org:[46.978455072092856,110.34208771758286],legs:[{side:-1,t:98,tb:-11,s:-18,sb:7.699999999999999,fdir:1},{side:1,t:98,tb:11,s:-18,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:28,ub:-8,f:44,fb:-5.6},{side:1,u:28,ub:8,f:44,fb:5.6}]}]}],B:[{l:L("Xoay thân trên ×10","Upper-body rotations ×10"),p:[{view:-36,org:[65,80],shoYaw:-58,legs:[{side:-1,t:3,tb:-10,s:-3,sb:7,fdir:1},{side:1,t:3,tb:10,s:-3,sb:-7,fdir:1}],arms:[{side:-1,u:0,ub:-86,f:0,fb:-88},{side:1,u:0,ub:86,f:0,fb:88}]},{view:-36,org:[65,80],shoYaw:58,legs:[{side:-1,t:3,tb:-10,s:-3,sb:7,fdir:1},{side:1,t:3,tb:10,s:-3,sb:-7,fdir:1}],arms:[{side:-1,u:0,ub:-86,f:0,fb:-88},{side:1,u:0,ub:86,f:0,fb:88}]}]},{l:L("Cat–cow ×8","Cat–cow ×8"),p:[{view:16,elev:26,pitch:90,lean:13,org:[64,96],noshadow:1,legs:[{side:-1,t:90,tb:-7,s:2,sb:4,fdir:1},{side:1,t:90,tb:7,s:2,sb:-4,fdir:1}],arms:[{side:-1,u:90,ub:-6,f:90,fb:-4},{side:1,u:90,ub:6,f:90,fb:4}]},{view:16,elev:26,pitch:90,lean:-13,org:[64,96],noshadow:1,legs:[{side:-1,t:90,tb:-7,s:2,sb:4,fdir:1},{side:1,t:90,tb:7,s:2,sb:-4,fdir:1}],arms:[{side:-1,u:90,ub:-6,f:90,fb:-4},{side:1,u:90,ub:6,f:90,fb:4}]}]},{l:L("10 swing tay chéo thân","10 cross-body arm swings"),p:[{view:-72,org:[65,80],legs:[{side:-1,t:3,tb:-9,s:-3,sb:6.3,fdir:1},{side:1,t:3,tb:9,s:-3,sb:-6.3,fdir:1}],arms:[{side:-1,u:4,ub:-84,f:6,fb:-86},{side:1,u:4,ub:84,f:6,fb:86}]},{view:-72,org:[65,80],legs:[{side:-1,t:3,tb:-9,s:-3,sb:6.3,fdir:1},{side:1,t:3,tb:9,s:-3,sb:-6.3,fdir:1}],arms:[{side:-1,u:20,ub:44,f:26,fb:58},{side:1,u:20,ub:-44,f:26,fb:-58}]}]}],C:[{l:L("Jumping jack nhẹ 1′","Easy jumping jacks 1′"),p:[{view:-74,org:[65,80],legs:[{side:-1,t:2,tb:-4,s:-2,sb:3,fdir:1},{side:1,t:2,tb:4,s:-2,sb:-3,fdir:1}],arms:[{side:-1,u:4,ub:-7,f:5,fb:-6},{side:1,u:4,ub:7,f:5,fb:6}]},{view:-74,org:[65,83],legs:[{side:-1,t:4,tb:-26,s:-4,sb:20,fdir:1},{side:1,t:4,tb:26,s:-4,sb:-20,fdir:1}],arms:[{side:-1,u:172,ub:-24,f:176,fb:-20},{side:1,u:172,ub:24,f:176,fb:20}]}]},{l:L("Xoay vai ×10","Shoulder circles ×10"),p:[{view:-72,org:[65,80],legs:[{side:-1,t:3,tb:-9,s:-3,sb:6.3,fdir:1},{side:1,t:3,tb:9,s:-3,sb:-6.3,fdir:1}],arms:[{side:-1,u:0,ub:-88,f:4,fb:-84},{side:1,u:0,ub:88,f:4,fb:84}]},{view:-72,org:[65,80],legs:[{side:-1,t:3,tb:-9,s:-3,sb:6.3,fdir:1},{side:1,t:3,tb:9,s:-3,sb:-6.3,fdir:1}],arms:[{side:-1,u:166,ub:-30,f:172,fb:-24},{side:1,u:166,ub:30,f:172,fb:24}]}]},{l:L("Hip hinge không tạ ×10","Bodyweight hip hinge ×10"),p:[{view:36,lean:6,tilt:0,hw:7,sw:10,org:[65,79.5],legs:[{side:-1,t:0,tb:-11,s:0,sb:7.699999999999999,fdir:1},{side:1,t:0,tb:11,s:0,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:4,ub:-8,f:4,fb:-5.6},{side:1,u:4,ub:8,f:4,fb:5.6}]},{view:36,lean:62,tilt:0,hw:7,sw:10,org:[63.125411218641425,79.81392895622356],legs:[{side:-1,t:8,tb:-11,s:-4,sb:7.699999999999999,fdir:1},{side:1,t:8,tb:11,s:-4,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:-4,ub:-8,f:-4,fb:-5.6},{side:1,u:-4,ub:8,f:-4,fb:5.6}]}]}],D:[{l:L("Khởi động khớp vai & hông","Shoulder & hip mobility warm-up"),p:[{view:-72,org:[65,80],legs:[{side:-1,t:3,tb:-9,s:-3,sb:6.3,fdir:1},{side:1,t:3,tb:9,s:-3,sb:-6.3,fdir:1}],arms:[{side:-1,u:0,ub:-88,f:4,fb:-84},{side:1,u:0,ub:88,f:4,fb:84}]},{view:-72,org:[65,80],legs:[{side:-1,t:3,tb:-9,s:-3,sb:6.3,fdir:1},{side:1,t:3,tb:9,s:-3,sb:-6.3,fdir:1}],arms:[{side:-1,u:166,ub:-30,f:172,fb:-24},{side:1,u:166,ub:30,f:172,fb:24}]}]},{l:L("10 swing nhẹ tăng dần","10 easy swings, building up"),p:[{view:-74,lean:0,tilt:0,hw:7,sw:10,org:[65,80],legs:[{side:-1,t:0,tb:-15.76031473405274,s:0,sb:2.434557604714082,fdir:-1},{side:1,t:0,tb:15.76031473405274,s:0,sb:-2.4345576047140653,fdir:1}],arms:[{side:-1,u:0,ub:28.665463315992902,f:0,fb:-8.41612000519728},{side:1,u:0,ub:5.251308215657879,f:0,fb:-29.44082236968206}],gear:{k:"club",a:9,len:52}},{view:-74,lean:0,tilt:-6,hw:7,sw:10,org:[65,80],legs:[{side:-1,t:0,tb:-15.76031473405274,s:0,sb:2.434557604714082,fdir:-1},{side:1,t:0,tb:15.76031473405274,s:0,sb:-2.4345576047140653,fdir:1}],arms:[{side:-1,u:0,ub:-61.131377924906154,f:0,fb:-153.3494789179926},{side:1,u:0,ub:-89.81644317488163,f:0,fb:-111.38521199080758}],gear:{k:"club",a:-135,len:24}}]},{l:L("Nghỉ đủ 60–90s giữa các cụm","Rest a full 60–90s between sets"),p:[{view:36,lean:0,tilt:0,hw:7,sw:10,org:[65,80],legs:[{side:-1,t:-9.939481456220653,tb:-11,s:12.68038349181986,sb:7.699999999999999,fdir:-1},{side:1,t:9.939481456220653,tb:11,s:-12.680383491819875,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:8,ub:-8,f:10,fb:-5.6},{side:1,u:-8,ub:8,f:-10,fb:5.6}]},{view:36,lean:2,tilt:0,hw:7,sw:10,org:[65,81],legs:[{side:-1,t:-14.568148742630814,tb:-11,s:17.553284420728666,sb:7.699999999999999,fdir:-1},{side:1,t:14.568148742630814,tb:11,s:-17.55328442072865,sb:-7.699999999999999,fdir:1}],arms:[{side:-1,u:12,ub:-8,f:16,fb:-5.6},{side:1,u:-12,ub:8,f:-16,fb:5.6}]}]}]};

/* ===== THƯ VIỆN ĐỘNG TÁC SWING — hình 3 chiều =====
   Dùng chung bộ vẽ với phần Thể lực. Vì góc máy quay cũng trộn được nên
   bài Setup cho máy quay XOAY QUANH người để soi tư thế từ nhiều phía. */
function L3(side,t,tb,s,sb,fd){return {side:side,t:t,tb:tb,s:s,sb:sb,fdir:fd||1};}
function S(a,b,d,e,h){return {a:a,b:b,d:d,e:e||'io',h:h||0};}
var A_ADDR={view:-78, lean:30, tilt:-7, hipYaw:0, shoYaw:-6, org:[65,80],
  legs:[L3(-1,4,-14,-4,11), L3(1,4,14,-4,-11)],
  arms:[{side:-1,grip:[20,6,0]},{side:1,grip:[20,6,0]}],
  gear:{k:'club',a:13,len:49}};
function vary(base, ex){var c=JSON.parse(JSON.stringify(base)); for(var k in ex) c[k]=ex[k]; return c;}

var DRILLS=[
 {id:'setup', n:L('Setup chuẩn','Proper setup'), sub:L('Đọc trước MỖI quả bóng','Check before EVERY ball'),
  cues:[L('① Bóng ngang gót trái','① Ball off the lead heel'),L('② Tee cao — nửa bóng trên mặt gậy','② Tee it high — half the ball above the clubface'),
        L('③ Vai phải thấp hơn, cột sống nghiêng nhẹ về sau','③ Trail shoulder lower, spine tilted slightly away from the target'),L('④ Chân rộng hơn vai','④ Stance wider than your shoulders')],
  dur:5200,
  p:[vary(A_ADDR,{view:-104}), vary(A_ADDR,{view:-78}), vary(A_ADDR,{view:-34})]},

 {id:'longdrive', n:L('Setup long-drive','Long-drive setup'), sub:L('So với setup thường — GĐ3/6','Compared with a normal setup — Phase 3/6'),
  cues:[L('Chân rộng thêm ~1 bàn chân','Stance ~1 foot-length wider'),L('Tee cao hơn, bóng nhích lên trước','Tee higher, ball a touch further forward'),
        L('Cột sống nghiêng về sau nhiều hơn','More spine tilt away from the target'),L('Mục tiêu attack angle +4° → +5°','Target attack angle +4° → +5°')],
  dur:3400,
  p:[A_ADDR,
     vary(A_ADDR,{tilt:-16, lean:27, org:[65,81],
       legs:[L3(-1,6,-21,-6,16), L3(1,6,21,-6,-16)],
       arms:[{side:-1,grip:[21,7,2]},{side:1,grip:[21,7,2]}],
       gear:{k:'club',a:16,len:50}})]},

 {id:'coil', n:L('Biên độ xoay — độ vặn thân','Turn range — X-factor (coil)'), sub:L('GĐ2/5 · vai 90°+','Phase 2/5 · shoulders 90°+'),
  cues:[L('Hông xoay ~45°, vai xoay ~95°','Hips turn ~45°, shoulders ~95°'),L('Chênh lệch đó chính là ĐỘ VẶN sinh lực','That difference IS the coil that makes power'),
        L('Giữ cột sống nghiêng, không đứng thẳng dậy','Keep your spine tilt — don\'t stand up')],
  dur:3600, s:[S(0,1,1400,'io',600),S(1,0,1000,'io',500)],
  p:[A_ADDR,
     vary(A_ADDR,{lean:29, tilt:-14, hipYaw:44, shoYaw:96, org:[70,79],
       legs:[L3(-1,2,-12,-2,9), L3(1,8,17,-10,-12)],
       arms:[{side:-1,grip:[6,-30,20]},{side:1,grip:[6,-30,20]}],
       gear:{k:'club',a:-128,len:26}})]},

 {id:'tempo', n:'Tempo 3:1', sub:L('Lên gậy 3 nhịp — xuống gậy 1 nhịp','Backswing 3 beats — downswing 1 beat'),
  cues:[L('Đếm "một–hai–ba" khi lên gậy','Count "one–two–three" on the backswing'),L('Đếm "một" khi xuống gậy','Count "one" on the downswing'),
        L('Nhịp đều quan trọng hơn nhanh','A steady tempo matters more than a fast one')],
  dur:4200, s:[S(0,1,750,'io'),S(1,2,750,'out',120),S(2,1,250,'in'),S(1,0,250,'out',600)],
  p:[A_ADDR,
     vary(A_ADDR,{lean:29, tilt:-12, hipYaw:26, shoYaw:58, org:[68,79],
       legs:[L3(-1,3,-13,-3,10), L3(1,6,16,-7,-11)],
       arms:[{side:-1,grip:[16,-14,12]},{side:1,grip:[16,-14,12]}],
       gear:{k:'club',a:-72,len:40}}),
     vary(A_ADDR,{lean:29, tilt:-14, hipYaw:44, shoYaw:96, org:[70,79],
       legs:[L3(-1,2,-12,-2,9), L3(1,8,17,-10,-12)],
       arms:[{side:-1,grip:[6,-30,20]},{side:1,grip:[6,-30,20]}],
       gear:{k:'club',a:-128,len:26}})]},

 {id:'ground', n:L('Lực đạp đất — "ngồi rồi bật"','Ground force — "sit, then spring"'), sub:L('GĐ3/6 · nguồn tốc độ','Phase 3/6 · where speed comes from'),
  cues:[L('Từ đỉnh gậy: HẠ người xuống một nhịp','From the top: SINK down for one beat'),L('Rồi ĐẠP đất bật lên khi xuống gậy','Then PUSH off the ground and spring up in the downswing'),
        L('Nghe tiếng whoosh to nhất SAU vị trí bóng','Loudest whoosh AFTER the ball position')],
  dur:3400, s:[S(0,1,350,'io',80),S(1,2,300,'in',700),S(2,0,0,'io',350)],
  p:[vary(A_ADDR,{lean:29, tilt:-14, hipYaw:44, shoYaw:96, org:[70,79],
       legs:[L3(-1,2,-12,-2,9), L3(1,8,17,-10,-12)],
       arms:[{side:-1,grip:[6,-30,20]},{side:1,grip:[6,-30,20]}],
       gear:{k:'club',a:-128,len:26}}),
     vary(A_ADDR,{lean:34, tilt:-16, hipYaw:16, shoYaw:64, org:[66,88],
       legs:[L3(-1,26,-16,-22,13), L3(1,30,18,-26,-14)],
       arms:[{side:-1,grip:[14,-16,10]},{side:1,grip:[14,-16,10]}],
       gear:{k:'club',a:-84,len:36}}),
     vary(A_ADDR,{lean:28, tilt:-18, hipYaw:-42, shoYaw:-12, org:[60,80],
       legs:[L3(-1,-2,-16,2,13), L3(1,10,12,-14,-8)],
       arms:[{side:-1,grip:[21,7,-3]},{side:1,grip:[21,7,-3]}],
       gear:{k:'club',a:10,len:49}})]},

 {id:'stepdrill', n:'Step Drill', sub:L('Ép thân dưới khởi động downswing','Makes the lower body start the downswing'),
  cues:[L('Lên gậy đồng thời NHẤC chân trước khỏi sàn','LIFT the lead foot as you start the backswing'),L('Đặt chân trước về đích TRƯỚC khi xuống gậy','Plant the lead foot toward the target BEFORE the downswing'),
        L('Cảm giác thứ tự: chân → hông → thân → tay','Feel the sequence: legs → hips → torso → arms')],
  dur:3800, s:[S(0,1,900,'io',150),S(1,3,220,'out',150),S(3,2,300,'in',700),S(2,0,0,'io',400)],
  p:[vary(A_ADDR,{legs:[L3(-1,4,-9,-4,7), L3(1,4,9,-4,-7)]}),
     vary(A_ADDR,{lean:28, tilt:-13, hipYaw:40, shoYaw:90, org:[70,79],
       legs:[L3(-1,-16,-6,-24,4), L3(1,8,16,-10,-11)],
       arms:[{side:-1,grip:[6,-28,19]},{side:1,grip:[6,-28,19]}],
       gear:{k:'club',a:-126,len:26}}),
     vary(A_ADDR,{lean:28, tilt:-17, hipYaw:-38, shoYaw:-8, org:[59,80],
       legs:[L3(-1,-4,-20,4,16), L3(1,12,12,-16,-8)],
       arms:[{side:-1,grip:[21,7,-3]},{side:1,grip:[21,7,-3]}],
       gear:{k:'club',a:10,len:49}}),
     vary(A_ADDR,{lean:28, tilt:-13, hipYaw:40, shoYaw:90, org:[64,80],           /* chân đã đặt, gậy còn ở đỉnh */
       legs:[L3(-1,-2,-16,2,13), L3(1,10,12,-14,-8)],
       arms:[{side:-1,grip:[6,-28,19]},{side:1,grip:[6,-28,19]}],
       gear:{k:'club',a:-126,len:26}})]},

 {id:'finish', n:L('Kết thúc cân bằng','Balanced finish'), sub:L('Dấu hiệu swing đúng trình tự','The sign of a well-sequenced swing'),
  cues:[L('Trọng lượng dồn HẾT sang chân trước','ALL your weight on the lead foot'),L('Gót chân sau nhấc, mũi chân chống đất','Trail heel up, balanced on the toe'),
        L('Giữ được thăng bằng 3 giây = trình tự đúng','Hold your balance 3 seconds = correct sequence')],
  dur:3400, s:[S(0,1,420,'out',1500),S(1,0,0,'io',350)],
  p:[vary(A_ADDR,{lean:28, tilt:-18, hipYaw:-42, shoYaw:-12, org:[60,80],
       legs:[L3(-1,-2,-16,2,13), L3(1,10,12,-14,-8)],
       arms:[{side:-1,grip:[21,7,-3]},{side:1,grip:[21,7,-3]}],
       gear:{k:'club',a:10,len:49}}),
     vary(A_ADDR,{lean:6, tilt:14, hipYaw:-86, shoYaw:-112, org:[57,78],
       legs:[L3(-1,-6,-10,4,8), L3(1,26,20,-30,-16,-1)],
       arms:[{side:-1,grip:[-6,-30,-20]},{side:1,grip:[-6,-30,-20]}],
       gear:{k:'club',a:128,len:26}})]}
];

var FIGOFF={A:0,B:5,C:10,D:15};

/* ===== KỊCH BẢN CHUYỂN ĐỘNG TỪNG BÀI =====
   Mỗi bài = chuỗi pha {a→b, d: ms, e: gia tốc, h: dừng ms}. e = 'io' đều, 'in' tăng tốc dần
   (pha bùng nổ, rơi), 'out' nhanh rồi hãm (đẩy lên, tới đỉnh). d=0 = cắt về ngay (kết thúc rep).
   Khung có x:1 là khung phụ chỉ dùng cho hình động, không hiện trong dải 3 hình. */
var Q_IMPACT={view:-78,lean:28,tilt:-18,hipYaw:-42,shoYaw:-12,org:[60,80],legs:[L3(-1,-2,-16,2,13),L3(1,10,12,-14,-8)],
  arms:[{side:-1,grip:[21,7,-3]},{side:1,grip:[21,7,-3]}],gear:{k:'club',a:10,len:49}};
var Q_FINISH={view:-78,lean:6,tilt:14,hipYaw:-86,shoYaw:-112,org:[57,78],legs:[L3(-1,-6,-10,4,8),L3(1,26,20,-30,-16,-1)],
  arms:[{side:-1,grip:[-6,-30,-20]},{side:1,grip:[-6,-30,-20]}],gear:{k:'club',a:128,len:26}};
/* Putting: con lắc vai — putter lùi (sang trái khung, cùng chiều lên gậy của swing thật) rồi đẩy qua bóng */
var P_ADDR=vary(A_ADDR,{lean:40,tilt:-2,org:[65,82],legs:[L3(-1,4,-8,-4,6),L3(1,4,8,-4,-6)],arms:[{side:-1,grip:[14,4,0]},{side:1,grip:[14,4,0]}],gear:{k:'club',a:4,len:36}});
function puttPose(k){return vary(P_ADDR,{shoYaw:14*k,arms:[{side:-1,grip:[14,4-4*k,2*k]},{side:1,grip:[14,4-4*k,2*k]}],gear:{k:'club',a:4+18*k,len:36}});}
var DCAT={setup:'setup',longdrive:'setup',coil:'full',tempo:'full',ground:'full',stepdrill:'full',finish:'full'};
DRILLS.forEach(function(d){d.cat=DCAT[d.id]||'full';});
DRILLS.unshift(
 {id:'grip',cat:'setup',n:L('Cầm gậy trung tính','Neutral grip'),sub:L('Nền móng của mọi cú đánh','The foundation of every shot'),
  cues:[L('① Tay trái: thấy 2–3 đốt ngón tay','① Lead hand: see 2–3 knuckles'),L('② Chữ V hai tay chỉ về vai phải','② Both "V"s point to the trail shoulder'),
        L('③ Lực cầm 4/10 — như cầm tuýp kem đánh răng','③ Grip pressure 4/10 — like holding a toothpaste tube')],
  dur:5200,p:[vary(A_ADDR,{view:-100}),vary(A_ADDR,{view:-60}),vary(A_ADDR,{view:-20})]},
 {id:'align',cat:'setup',n:L('Căn hướng & vị trí bóng','Alignment & ball position'),sub:L('Dùng 2 que căn hướng','Use two alignment sticks'),
  cues:[L('Que 1 dọc mũi chân, song song đường bóng','Stick 1 along your toes, parallel to the target line'),L('Que 2 vuông góc, chỉ vị trí bóng','Stick 2 at 90°, marking ball position'),
        L('Gậy sắt: bóng giữa chân · driver: ngang gót trái','Irons: ball centre · driver: off the lead heel')],
  dur:4600,p:[vary(A_ADDR,{view:-20}),vary(A_ADDR,{view:10})]},
 {id:'routine',cat:'setup',n:L('Routine trước cú đánh','Pre-shot routine'),sub:L('Giống nhau ở MỌI cú','The same before EVERY shot'),
  cues:[L('Đứng sau bóng, chọn mục tiêu nhỏ','Stand behind the ball, pick a small target'),L('1 swing thử cảm nhận','One rehearsal swing'),
        L('Vào bóng, nhìn mục tiêu 1 lần, đánh trong 8 giây','Step in, one look, hit within 8 seconds')],
  dur:4200,p:[A_ADDR]}
);
DRILLS.push(
 {id:'half',cat:'full',n:L('Swing 9–3','9-to-3 swing'),sub:L('Swing nửa — tiếp xúc chắc trước, lực sau','Half swing — solid contact first, power later'),
  cues:[L('Lên: tay trái song song đất (9 giờ)','Back: lead arm parallel to the ground (9 o\'clock)'),L('Qua bóng: tay phải song song đất (3 giờ)','Through: trail arm parallel to the ground (3 o\'clock)'),
        L('Chạm đất SAU bóng','Brush the turf AFTER the ball')],dur:3600,p:[A_ADDR]},
 {id:'chip',cat:'short',n:L('Chip lăn','Bump-and-run chip'),sub:L('Bay ít, lăn nhiều','Fly it low, let it roll'),
  cues:[L('Chân hẹp, bóng lệch chân sau','Narrow stance, ball back'),L('Tay đi trước đầu gậy, dồn 60% trọng tâm chân trước','Hands ahead, 60% weight on the lead side'),
        L('Lắc vai như putt, cổ tay yên','Rock the shoulders like a putt, quiet wrists')],dur:3200,p:[A_ADDR]},
 {id:'pitch',cat:'short',n:L('Pitch bổng','Pitch shot'),sub:L('30–60 m, bóng bay cao dừng nhanh','30–60 m, high and soft'),
  cues:[L('Bóng giữa chân, mặt gậy mở nhẹ','Ball centre, face slightly open'),L('Biên độ lên gậy quyết định cự ly','Backswing length sets the distance'),
        L('Thân xoay qua bóng — không "hất"','Turn through — don\'t scoop')],dur:3600,p:[A_ADDR]},
 {id:'wedgeclock',cat:'short',n:L('Hệ đồng hồ wedge','Wedge clock system'),sub:L('3 biên độ = 3 cự ly chuẩn','3 swing lengths = 3 stock distances'),
  cues:[L('7:30 · 9:00 · 10:30 — cùng một nhịp','7:30 · 9:00 · 10:30 — same rhythm'),L('Ghi cự ly trung bình mỗi biên độ','Record the average carry of each'),
        L('Nhân với 3 wedge = 9 cự ly chính xác','Times 3 wedges = 9 precise distances')],dur:3600,p:[A_ADDR]},
 {id:'bunker',cat:'short',n:L('Bunker "splash"','Bunker splash'),sub:L('Đánh cát, không đánh bóng','Hit the sand, not the ball'),
  cues:[L('Chân rộng, lún chân vào cát, mặt gậy mở','Wide stance, dig in, open the face'),L('Chạm cát 3–5 cm sau bóng','Enter the sand 3–5 cm behind the ball'),
        L('Vung trọn qua — không dừng ở cát','Swing through — never stop in the sand')],dur:3800,p:[A_ADDR]},
 {id:'putt',cat:'putt',n:L('Putt con lắc','Pendulum putting stroke'),sub:L('Vai lắc — tay và cổ tay yên','Shoulders rock — hands and wrists quiet'),
  cues:[L('Mắt ngay trên bóng','Eyes directly over the ball'),L('Lùi và đẩy dài bằng nhau','Equal length back and through'),L('Giữ đầu yên tới khi nghe bóng rơi','Keep your head still until you hear it drop')],
  dur:3200,s:[S(0,1,700,'io',120),S(1,2,650,'io',600),S(2,0,500,'io',350)],p:[P_ADDR,puttPose(-1),puttPose(1)]},
 {id:'puttgate',cat:'putt',n:L('Putt qua cổng','Gate drill'),sub:L('Hướng xuất phát chuẩn','Perfect start line'),
  cues:[L('2 tee rộng hơn bóng 1 cm, cách bóng 30 cm','Two tees 1 cm wider than the ball, 30 cm ahead'),L('Bóng phải lăn qua cổng không chạm tee','Roll it through without touching'),L('Mặt putter vuông góc tại impact','Square face at impact')],
  dur:3200,s:[S(0,1,700,'io',120),S(1,2,650,'io',600),S(2,0,500,'io',350)],p:[P_ADDR,puttPose(-1),puttPose(1)]},
 {id:'puttladder',cat:'putt',n:L('Thang khoảng cách','Distance ladder'),sub:L('Kiểm soát tốc độ lăn','Pace control'),
  cues:[L('Putt tới 3 · 6 · 9 m','Putt to 3 · 6 · 9 m'),L('Bóng dừng trong 1 gậy putter sau mốc','Stop within a putter length past each mark'),L('Biên độ lùi dài hơn = xa hơn, cùng nhịp','Longer backstroke = longer putt, same tempo')],
  dur:3600,s:[S(0,1,900,'io',120),S(1,2,800,'io',650),S(2,0,500,'io',350)],p:[P_ADDR,puttPose(-1.8),puttPose(2)]},
 {id:'puttclock',cat:'putt',n:L('Vòng tròn 1 m','1-metre circle'),sub:L('Bản lĩnh putt ngắn','Short-putt nerve'),
  cues:[L('8 bóng quanh lỗ, cách 1 m','8 balls around the hole at 1 m'),L('Trượt 1 quả = làm lại từ đầu','Miss one = start over'),L('Routine giống hệt mỗi quả','Identical routine for every putt')],
  dur:3000,s:[S(0,1,600,'io',100),S(1,2,550,'io',600),S(2,0,450,'io',350)],p:[P_ADDR,puttPose(-.8),puttPose(.9)]}
);
(function(){
  function X(q){return {x:1,q:q};}
  /* Box Jump: thêm khung đứng thẳng trước khi nhún */
  FIGS3[3].push(X({view:32,org:[46,80],lean:4,legs:[L3(-1,2,-11,0,8),L3(1,2,11,0,-8)],arms:[{side:-1,u:4,ub:-9,f:6,fb:-7},{side:1,u:4,ub:9,f:6,fb:7}],behind:FIGS3[3][0].q.behind}));
  /* KB Swing: ở đáy tay đưa tạ ra SAU giữa hai đùi */
  FIGS3[1][1].q.arms=[{side:-1,u:-30,ub:-8,f:-34,fb:-5.6},{side:1,u:-30,ub:8,f:-34,fb:5.6}];
  /* Swing golf: khung impact giữa đỉnh và finish */
  [15,16,18].forEach(function(i){FIGS3[i].push(X(Q_IMPACT));});
  /* Step Drill: khung "chân đã đặt xuống, gậy còn ở đỉnh" + finish */
  var top=FIGS3[17][1].q, pl=JSON.parse(JSON.stringify(top));
  pl.legs=[L3(-1,-2,-16,2,13),L3(1,10,12,-14,-8)]; pl.org=[64,80];
  FIGS3[17].push(X(pl)); FIGS3[17].push(X(Q_FINISH));
})();
var FIGA={
  0:[S(0,1,1500,'io',250),S(1,2,450,'out'),S(2,0,350,'out',550)],                         /* Goblet squat: hạ chậm, lên nhanh */
  1:[S(0,1,900,'io',100),S(1,2,320,'out',180),S(2,1,650,'in',80),S(1,2,320,'out',180),S(2,1,650,'in',80),S(1,0,700,'io',500)], /* KB swing: 2 lần bật hông */
  2:[S(0,1,1500,'io',250),S(1,2,450,'out'),S(2,0,350,'out',600)],
  3:[S(3,0,500,'io',150),S(0,1,300,'out'),S(1,2,320,'in',750),S(2,3,0,'io',450)],          /* Box jump: đứng → nhún → bay → đáp, cắt về */
  4:[S(0,1,600,'out',550),S(1,2,600,'io'),S(2,0,600,'io',400)],                            /* Bridge: siết nhanh, hạ chậm */
  5:[S(0,1,380,'io',80),S(1,2,220,'in',300),S(2,0,1000,'io',400)],                          /* Ném xoay: hông trước, ném bùng nổ, về chậm */
  6:[S(0,1,260,'in'),S(1,2,220,'out',320),S(2,0,1000,'io',450)],
  7:[S(0,1,900,'io',1000),S(1,2,450,'io'),S(2,0,450,'io',500)],                             /* Pallof: giữ 1 s khi duỗi */
  8:[S(0,1,1200,'io',400),S(1,2,600,'io'),S(2,0,600,'io',400)],
  9:[S(0,1,800,'io',300),S(1,2,900,'io',450),S(2,1,900,'io',300),S(1,0,700,'io',500)],
  10:[S(0,1,1800,'io',300),S(1,2,500,'out'),S(2,0,500,'out',450)],                          /* RDL: hạ 1,8 s */
  11:[S(0,1,1300,'io',200),S(1,2,400,'out'),S(2,0,400,'out',450)],
  12:[S(0,1,650,'out',450),S(1,2,600,'io'),S(2,0,600,'io',350)],
  13:[S(0,1,220,'in'),S(1,2,160,'in',300),S(2,0,1100,'io',350)],                            /* Slam: đập bùng nổ, nhặt bóng chậm */
  14:[S(0,1,900,'io',300),S(1,2,400,'out'),S(2,0,400,'out',450)],
  15:[S(0,1,900,'io',150),S(1,3,300,'in'),S(3,2,380,'out',900),S(2,0,0,'io',500)],          /* Swing: lên chậm → impact → finish, giữ, cắt về */
  16:[S(0,1,900,'io',150),S(1,3,300,'in'),S(3,2,380,'out',900),S(2,0,0,'io',500)],
  17:[S(0,1,900,'io',150),S(1,3,220,'out',150),S(3,2,300,'in'),S(2,4,380,'out',800),S(4,0,0,'io',500)], /* Step drill: đặt chân TRƯỚC rồi mới xuống gậy */
  18:[S(0,1,900,'io',150),S(1,3,300,'in'),S(3,2,380,'out',900),S(2,0,0,'io',500)]
};
/* ===== Chuyển động cho đặc tả 3D =====
   Dữ liệu 3D đã là góc thuần (không còn IK phải giải lúc chạy),
   nên chỉ cần trộn tuyến tính từng trường số giữa hai mốc. */
function mx3(a,b,x){return (a==null?0:a)+((b==null?(a==null?0:a):b)-(a==null?0:a))*x;}
function blend3(A,B,x){
  var o={view:mx3(A.view,B.view,x), lean:mx3(A.lean,B.lean,x), tilt:mx3(A.tilt,B.tilt,x),
    pitch:mx3(A.pitch,B.pitch,x), roll:mx3(A.roll,B.roll,x),
    spin:mx3(A.spin,B.spin,x), elev:mx3(A.elev,B.elev,x),
    hipYaw:mx3(A.hipYaw,B.hipYaw,x), shoYaw:mx3(A.shoYaw,B.shoYaw,x),
    hw:mx3(A.hw,B.hw,x), sw:mx3(A.sw,B.sw,x),
    org:[mx3(A.org[0],B.org[0],x), mx3(A.org[1],B.org[1],x)],
    behind:A.behind, cx:A.cx, cy:A.cy, noshadow:A.noshadow};
  if(A.k!=null||B.k!=null) o.k=mx3(A.k==null?1:A.k, B.k==null?1:B.k, x);
  if(A.ty!=null||B.ty!=null) o.ty=mx3(A.ty,B.ty,x);
  o.legs=A.legs.map(function(l,i){var m=(B.legs&&B.legs[i])||l;
    return {side:l.side, fdir:l.fdir, nofoot:l.nofoot, fa:l.fa,
            t:mx3(l.t,m.t,x), tb:mx3(l.tb,m.tb,x), s:mx3(l.s,m.s,x), sb:mx3(l.sb,m.sb,x)};});
  o.arms=A.arms.map(function(l,i){var m=(B.arms&&B.arms[i])||l;
    if(l.grip){                                   /* hai tay nắm chung: trộn điểm nắm */
      var g=m.grip||l.grip;
      return {side:l.side, pole:l.pole, grip:[mx3(l.grip[0],g[0],x), mx3(l.grip[1],g[1],x), mx3(l.grip[2],g[2],x)]};
    }
    return {side:l.side, u:mx3(l.u,m.u,x), ub:mx3(l.ub,m.ub,x), f:mx3(l.f,m.f,x), fb:mx3(l.fb,m.fb,x)};});
  if(A.gear){var G=A.gear, H=B.gear||G;
    o.gear={k:G.k, r:G.r, to:G.to,
            a:(G.a==null?null:mx3(G.a,H.a==null?G.a:H.a,x)),
            len:(G.len==null?null:mx3(G.len,H.len==null?G.len:H.len,x))};}
  return o;
}
/* một vòng lặp rAF duy nhất chạy mọi hình đang hiển thị */
var PLAYERS=[], RAF=null, ANIM_ON=true;
function nowMs(){return (window.performance&&performance.now)?performance.now():Date.now();}
function easeF(e,u){
  if(e==='in') return u*u*u;
  if(e==='out') return 1-Math.pow(1-u,3);
  return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
}
/* kịch bản mặc định khi bài chưa có: qua lại đều giữa các khung, dừng ~10% ở mỗi khung */
function defaultScript(n,dur){
  var seq=n>=3?[0,1,2,1]:[0,1], span=dur/seq.length, s=[];
  seq.forEach(function(f,i){s.push(S(f,seq[(i+1)%seq.length],span*0.82,'io',span*0.18));});
  return s;
}
function poseAt(p,tt){
  var sc=p.script, seg=sc[0], acc=0;
  for(var j=0;j<sc.length;j++){ if(tt<acc+sc[j].d+sc[j].h){seg=sc[j];break;} acc+=sc[j].d+sc[j].h; }
  var lx=seg.d>0?Math.min(1,(tt-acc)/seg.d):1;
  return {o:blend3(p.q[seg.a], p.q[seg.b], easeF(seg.e,lx)), seg:seg, lx:lx};
}
function tick(now){
  for(var i=0;i<PLAYERS.length;i++){
    var p=PLAYERS[i], el=p.el;
    if(!el.isConnected){PLAYERS.splice(i--,1);continue;}
    var tt=(now-p.t0)%p.dur; if(tt<0) tt+=p.dur;
    if(p.clip){ el.innerHTML=bodyF(mocapPose(p.clip,Math.min(tt,p.clip.dur),p.view)); continue; }
    var r=poseAt(p,tt), o=r.o;
    var br=Math.sin(now/1300);                              /* nhịp thở rất nhỏ: thân nhấp nhô, ngực nở */
    o.lean=(o.lean||0)+br*0.3; o.org=[o.org[0], o.org[1]+br*0.25]; if(o.sw!=null) o.sw+=br*0.12;
    var svg=bodyF(o);
    if(r.seg.d>0&&r.seg.d<=350&&r.lx>0.05&&r.lx<1){           /* pha bùng nổ: vệt mờ của 70 ms trước */
      var g=poseAt(p,Math.max(0,tt-70)).o;
      svg='<g opacity=".22">'+bodyF(g)+'</g>'+svg;
    }
    el.innerHTML=svg;
  }
  RAF=PLAYERS.length?requestAnimationFrame(tick):null;
}
function play(el, specs, dur, tag, script){
  var sc=script||defaultScript(specs.length,dur||2800), total=0;
  sc.forEach(function(s){total+=s.d+s.h;});
  el.innerHTML=bodyF(specs[sc[0].a]);      /* vẽ ngay dáng đầu, tránh nhịp trống */
  if(specs.length<2) return;
  PLAYERS.push({el:el, q:specs, script:sc, dur:total, t0:nowMs(), tag:tag});
  if(ANIM_ON && !RAF) RAF=requestAnimationFrame(tick);
}
function stopAll(){   /* chỉ dừng hình của chế độ tập trung, giữ hình thư viện */
  PLAYERS=PLAYERS.filter(function(p){return p.tag==='drill';});
  if(!PLAYERS.length && RAF){cancelAnimationFrame(RAF);RAF=null;}
}
function setAnim(on){
  ANIM_ON=on;
  var b=document.getElementById('f-play');
  if(b){b.textContent=on?'⏸':'▶';b.setAttribute('aria-label',on?L('Tạm dừng chuyển động','Pause animation'):L('Chạy chuyển động','Play animation'));}
  if(on){var t=nowMs();PLAYERS.forEach(function(p){p.t0=t;});if(!RAF)RAF=requestAnimationFrame(tick);}
  else if(RAF){cancelAnimationFrame(RAF);RAF=null;}
}
function animSvg(){return '<svg viewBox="6 12 118 124"></svg>';}
function figIdx(sid,e,i){return e.fig!==undefined?e.fig:FIGOFF[sid]+i}
function figStrip(fi){
  var fr=fi!=null?FIGS3[fi]:null; if(!fr) return '';
  return '<div class="f-figs">'+fr.filter(function(f){return !f.x;}).map(function(f){
    return '<div class="f-fig"><svg viewBox="6 12 118 124">'+bodyF(f.q)+'</svg>'+
           '<div class="fc">'+f.cap+'</div><div class="fq">'+f.cue+'</div></div>';
  }).join('')+'</div>';
}

if(PLAN&&PLAN.lefty){
  DRILLS.forEach(function(d){d.cues=d.cues.map(lr)});
  FIGS3.forEach(function(fr){fr.forEach(function(f){f.cap=lr(f.cap);f.cue=lr(f.cue)})});
}
/* Thư viện động tác: render + chỉ chạy hình khi thẻ đang trong tầm nhìn (đỡ tốn pin) */
(function(){
  var host=document.getElementById('drills'); if(!host) return;
  function byId(id){for(var i=0;i<DRILLS.length;i++) if(DRILLS[i].id===id) return DRILLS[i];}
  var CATS=[['all',L('Tất cả','All')],['setup',L('Setup & căn bản','Setup & basics')],['full',L('Swing toàn phần','Full swing')],['short',L('Short game','Short game')],['putt',L('Putting','Putting')]];
  var bar=document.createElement('div'); bar.className='dfilter'; bar.setAttribute('role','tablist');
  bar.innerHTML=CATS.map(function(c,i){var n=c[0]==='all'?DRILLS.length:DRILLS.filter(function(d){return d.cat===c[0];}).length;
    return '<button type="button" class="dchip'+(i?'':' on')+'" data-dcat="'+c[0]+'" role="tab" aria-selected="'+(i?'false':'true')+'">'+c[1]+' <small>'+n+'</small></button>';}).join('');
  host.parentNode.insertBefore(bar,host);
  bar.addEventListener('click',function(e){var b=e.target.closest('[data-dcat]'); if(!b) return; var c=b.dataset.dcat;
    bar.querySelectorAll('.dchip').forEach(function(x){var on=x===b; x.classList.toggle('on',on); x.setAttribute('aria-selected',on?'true':'false');});
    host.querySelectorAll('.drill').forEach(function(x){x.hidden=!(c==='all'||x.dataset.cat===c);});});
  host.innerHTML=DRILLS.map(function(d){
    return '<div class="drill" data-d="'+d.id+'" data-cat="'+d.cat+'" id="drill-'+d.id+'"><div class="dfig">'+animSvg()+'</div>'+
      '<div class="dtxt"><div class="dn">'+d.n+'</div><div class="ds">'+d.sub+'</div>'+
      '<div class="dc">'+d.cues.map(function(c){return '· '+c;}).join('<br>')+'</div></div></div>';
  }).join('');
  var cards=[].slice.call(host.querySelectorAll('.drill'));
  cards.forEach(function(c){ var cl=clipFor('D:'+c.dataset.d); c.querySelector('svg').innerHTML=cl?bodyF(mocapPose(cl,0,cl.view)):bodyF(byId(c.dataset.d).p[0]); });
  function start(c){ if(c._on) return; c._on=1; var d=byId(c.dataset.d), clip=clipFor('D:'+d.id);
    if(clip) playClip(c.querySelector('svg'), clip, 'drill', clip.view); else play(c.querySelector('svg'), d.p, d.dur, 'drill', d.s); }
  function stop(c){ c._on=0; var s=c.querySelector('svg');
    for(var i=0;i<PLAYERS.length;i++){ if(PLAYERS[i].el===s){ PLAYERS.splice(i,1); break; } } }
  if(window.IntersectionObserver){
    var fired=false;
    var io=new IntersectionObserver(function(es){
      fired=true;
      es.forEach(function(e){ if(e.isIntersecting) start(e.target); else stop(e.target); });
    },{rootMargin:'100px'});
    cards.forEach(function(c){ io.observe(c); });
    /* Đường lui: môi trường nào bộ theo dõi không kích hoạt thì cho chạy hết,
       còn hơn để hình đứng im mà không có dấu hiệu gì. */
    setTimeout(function(){ if(!fired) cards.forEach(start); }, 1500);
  } else cards.forEach(start);
})();

/* Thẻ bài tập thể lực: hình động (chuyển động thật nếu có), các bước, chạy khi thẻ trong tầm nhìn */
(function(){
  var cards=[].slice.call(document.querySelectorAll('.exc,.wm')); if(!cards.length) return;
  function sess(id){for(var i=0;i<SESSIONS.length;i++) if(SESSIONS[i].id===id) return SESSIONS[i];}
  cards.forEach(function(c){
    var s=sess(c.dataset.s), n=+c.dataset.n, svg=c.querySelector('svg'); if(!s||!svg) return;
    if(c.classList.contains('wm')){
      var w=(WARM3[s.id]||[])[n]; c._clip=clipFor('W:'+s.id+':'+n); c._q=w&&w.p; c._dur=1900;
    } else {
      var e=s.ex[n], fi=figIdx(s.id,e,n), fr=FIGS3[fi];
      c._clip=clipFor('F'+fi); c._q=fr&&fr.map(function(x){return x.q;}); c._sc=FIGA[fi]; c._dur=2800;
      var steps=fr?fr.filter(function(f){return !f.x;}):[];
      c.querySelector('.exc-steps').innerHTML=steps.map(function(f,k){return '<li><b>'+f.cap+'</b> — '+f.cue+'</li>';}).join('');
      var mine=c._clip&&ME&&ME.clips&&ME.clips['F'+fi];
      c.querySelector('.exc-cap').innerHTML=c._clip?(mine?L('🎬 chuyển động của bạn','🎬 your motion'):L('🎬 chuyển động thật','🎬 real motion')+(c._clip.src?' <span class="mc-src" title="'+esc(c._clip.src)+'">ⓘ</span>':'')):(fr?L('hình minh họa','illustration'):'');
    }
    if(!c._clip&&!c._q){ svg.style.display='none'; return; }
    svg.innerHTML=c._clip?bodyF(mocapPose(c._clip,0,c._clip.view)):bodyF(c._q[0]);
  });
  function start(c){ if(c._on) return; var svg=c.querySelector('svg'); if(!svg||(!c._clip&&!c._q)) return; c._on=1;
    if(c._clip) playClip(svg,c._clip,'drill',c._clip.view); else play(svg,c._q,c._dur,'drill',c._sc); }
  function stop(c){ c._on=0; var s=c.querySelector('svg');
    for(var i=0;i<PLAYERS.length;i++){ if(PLAYERS[i].el===s){ PLAYERS.splice(i,1); break; } } }
  if(window.IntersectionObserver){
    var fired=false, io=new IntersectionObserver(function(es){ fired=true;
      es.forEach(function(e){ if(e.isIntersecting) start(e.target); else stop(e.target); }); },{rootMargin:'100px'});
    cards.forEach(function(c){ io.observe(c); });
    setTimeout(function(){ if(!fired) cards.forEach(start); }, 1500);
  } else cards.forEach(start);
})();
/* ===== CHẾ ĐỘ TẬP TRUNG ===== */
var FX={el:document.getElementById('focus'),main:document.getElementById('f-main'),
  dots:document.getElementById('f-dots'),meta:document.getElementById('f-meta'),
  prev:document.getElementById('f-prev'),next:document.getElementById('f-next'),
  sess:null,steps:[],i:0,marks:{},timer:null};

function buildSteps(s){
  var st=(s.warm&&s.warm.length)?[{type:'warm'}]:[];
  s.ex.forEach(function(e,n){st.push({type:'ex',e:e,n:n})});
  st.push({type:'end'});
  return st;
}
function stopTimer(){if(FX.timer){clearInterval(FX.timer);FX.timer=null}}

var XSESS={};   /* buổi tập của các chương trình (academy.js đăng ký) */
function openFocus(id){
  var s=typeof id==='object'?id:(SESSIONS.filter(function(x){return x.id===id})[0]||XSESS[id]);if(!s)return;
  id=s.id; s._done=0;
  FX.sess=s;FX.steps=buildSteps(s);FX.i=0;
  if(!FX.marks[id])FX.marks[id]=s.ex.map(function(e){return new Array(e.sets!=null?e.sets:(parseInt(e.rx,10)||3)).fill(false)});
  FX.el.classList.add('on');document.body.classList.add('locked');
  renderStep();FX.el.focus();
}
function closeFocus(){stopTimer();stopAll();FX.el.classList.remove('on');document.body.classList.remove('locked')}

function renderStep(){
  stopTimer();stopAll();
  var s=FX.sess,st=FX.steps[FX.i];
  FX.dots.innerHTML=FX.steps.map(function(_,n){
    return '<span class="f-dot'+(n===FX.i?' now':(n<FX.i?' done':''))+'"></span>';
  }).join('');

  if(st.type==='warm'){
    FX.meta.textContent=s.meta||(L('Buổi ','Session ')+s.id+' · '+s.day+' · '+s.dur);
    var wid=s.warmId||s.id, wm=WARM3[wid]||[];
    FX.main.innerHTML='<div class="f-name">🔥 '+L('Khởi động','Warm-up')+'</div>'+
      '<div class="f-warms">'+s.warm.map(function(w,n){
        return '<div class="f-warm">'+(wm[n]?animSvg():'')+'<div class="wl">'+esc(w)+'</div></div>';
      }).join('')+'</div>'+
      '<p class="f-note">'+esc(s.goal)+'</p>';
    FX.main.querySelectorAll('.f-warm svg').forEach(function(el,n){ var c=clipFor('W:'+wid+':'+n); if(c) playClip(el,c,undefined,c.view); else if(wm[n]) play(el, wm[n].p, 1900); });
    FX.next.textContent=L('Bắt đầu →','Start →');
  } else if(st.type==='end'){
    FX.meta.textContent=s.metaDone||(L('Buổi ','Session ')+s.id+L(' · Hoàn thành',' · Complete'));
    FX.main.innerHTML='<div class="f-rx" style="font-size:3.4rem">✓</div>'+
      '<div class="f-name">'+(s.doneTitle||(L('Xong buổi ','Session ')+s.id+L('!',' done!')))+'</div>'+
      '<p class="f-note">'+(s.doneNote||(s.id==='D'?L('Đừng quên nhập mph cao nhất vào Nhật ký tốc độ.','Don\'t forget to enter your top mph in the Speed log.'):L('Giãn cơ 2–3 phút rồi nghỉ. Tiến bộ xảy ra lúc phục hồi.','Stretch for 2–3 minutes, then rest. Progress happens during recovery.')))+'</p>';
    if(s.onDone&&!s._done){ s._done=1; try{ s.onDone(FX.marks[s.id]); }catch(err){} }
    FX.next.textContent=L('Đóng ✓','Close ✓');
  } else {
    var e=st.e,marks=FX.marks[s.id][st.n];
    FX.meta.textContent=L('Bài ','Exercise ')+(st.n+1)+' / '+s.ex.length+' · '+(s.label||(L('Buổi ','Session ')+s.id));
    var fiX=figIdx(s.id,e,st.n), dr=e.drill?DRILLS.filter(function(x){return x.id===e.drill;})[0]:null;
    FX.main.innerHTML='<div class="f-name">'+esc(e.name)+'</div>'+
      '<div class="f-rx">'+esc(e.rx)+'</div>'+
      (e.kg?'<div class="f-kg">'+esc(e.kg)+'</div>':'')+
      (e.orig?'<div class="swp f">↻ '+L('Thay cho ','Replaces ')+esc(e.orig)+' — '+esc(e.why)+'</div>':e.adj?'<div class="swp f">✦ '+esc(e.adj)+'</div>':'')+
      ((dr||fiX!=null)?'<div class="f-anim">'+animSvg()+'</div><div class="f-anim-cap">'+L('chuyển động','movement')+'</div>':'')+
      (dr?'<ul class="f-cues">'+dr.cues.map(function(c){return '<li>'+esc(c)+'</li>';}).join('')+'</ul>':figStrip(fiX))+
      (e.note?'<p class="f-note">'+esc(e.note)+'</p>':'')+
      (e.metric?'<label class="f-metric">'+esc(e.metric.label)+'<span><input type="number" inputmode="numeric" min="0" max="'+e.metric.max+'" data-mkey="'+esc(s.id)+'#'+st.n+'" value="'+(e.metric.v!=null?e.metric.v:'')+'"> / '+e.metric.max+'</span></label>':'')+
      '<div class="f-vids">'+(e.vids||[]).map(function(v){return vidHtml(v,'f-vid')}).join('')+'</div>'+
      '<div class="f-sets"><span class="lbl">Set</span>'+marks.map(function(m,n){
        return '<button class="setbox'+(m?' done':'')+'" type="button" data-set="'+n+'" aria-label="Set '+(n+1)+'">'+(n+1)+'</button>';
      }).join('')+'</div>'+
      (e.rest?'<button class="f-rest" type="button" data-rest="'+e.rest+'">⏱  '+L('Nghỉ ','Rest ')+e.rest+'s</button>':'');
    var av=FX.main.querySelector('.f-anim svg');
    if(av&&dr){ var dc=clipFor('D:'+dr.id); if(dc) playClip(av,dc,undefined,dc.view); else play(av,dr.p,dr.dur,undefined,dr.s); av=null; }
    if(av){var fi=fiX, fr=FIGS3[fi], clip=clipFor('F'+fi);
      if(clip){ playClip(av, clip, undefined, clip.view); var mine=ME&&ME.clips&&ME.clips['F'+fi];
        FX.main.querySelector('.f-anim-cap').innerHTML=mine?'🎬 '+L('chuyển động của bạn','your movement')+' · '+esc(clip.d)+' <button type="button" class="mc-x" data-clipdel="F'+fi+'">✕ '+L('mẫu vẽ','drawn model')+'</button>':'🎬 '+L('chuyển động thật','real movement')+(clip.src?' <span class="mc-src" title="'+esc(clip.src)+'">ⓘ</span>':''); }
      else if(fr) play(av, fr.map(function(x){return x.q;}), 2800, undefined, FIGA[fi]);}
    FX.next.textContent=(st.n===s.ex.length-1)?L('Kết thúc →','Finish →'):L('Tiếp →','Next →');
  }
  upgradeVideos(FX.main);   /* link video vừa render -> thẻ video nhúng sẵn */
  FX.prev.disabled=(FX.i===0);
}
function go(d){
  var n=FX.i+d;
  if(n<0)return;
  if(n>=FX.steps.length){closeFocus();return}
  FX.i=n;renderStep();
}
FX.next.addEventListener('click',function(){
  if(FX.steps[FX.i].type==='end'){closeFocus();return}
  go(1);
});
FX.prev.addEventListener('click',function(){go(-1)});
document.getElementById('f-close').addEventListener('click',closeFocus);
document.addEventListener('keydown',function(e){
  if(!FX.el.classList.contains('on'))return;
  if(e.key==='Escape')closeFocus();
  if(e.key==='ArrowRight')go(1);
  if(e.key==='ArrowLeft')go(-1);
});
document.addEventListener('click',function(e){
  var s=e.target.closest('[data-start]');
  if(s){openFocus(s.dataset.start);return}

  var sb=e.target.closest('.setbox[data-set]');
  if(sb&&FX.el.contains(sb)){
    var st=FX.steps[FX.i];
    FX.marks[FX.sess.id][st.n][+sb.dataset.set]=!FX.marks[FX.sess.id][st.n][+sb.dataset.set];
    sb.classList.toggle('done');return;
  }

  var rb=e.target.closest('.f-rest[data-rest]');
  if(rb){
    var sec=+rb.dataset.rest;
    if(FX.timer){stopTimer();rb.className='f-rest';rb.textContent='⏱  '+L('Nghỉ ','Rest ')+sec+'s';return}
    var left=sec;rb.className='f-rest running';rb.textContent=left+'s';
    FX.timer=setInterval(function(){
      left--;
      if(left<=0){stopTimer();rb.className='f-rest done';rb.textContent=L('✅ HẾT GIỜ — vào set tiếp','✅ TIME\'S UP — next set');
        if(navigator.vibrate)navigator.vibrate([200,100,200]);
      } else rb.textContent=left+'s';
    },1000);
  }
});
/* vuốt trái/phải để chuyển bài */
(function(){var x0=null;
  FX.main.addEventListener('touchstart',function(e){x0=e.changedTouches[0].clientX},{passive:true});
  FX.main.addEventListener('touchend',function(e){
    if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;
    if(Math.abs(dx)>60)go(dx<0?1:-1);
  },{passive:true});
})();

/* ===== Hôm nay ===== */
var DOW=[
  {name:L('Nghỉ / Mobility nhẹ 15 phút','Rest / light mobility, 15 min'),link:'#nguyentac'},
  {name:L('Buổi A · Thân dưới & hông (40\')','Session A · Lower body & hips (40\')'),link:'#theluc',s:'A'},
  {name:L('🎯 Swing · Kỹ thuật trên monitor (45\')','🎯 Swing · Technique on the monitor (45\')'),link:'#swing'},
  {name:L('Buổi B · Core xoay & liên sườn (35\')','Session B · Rotational core & obliques (35\')'),link:'#theluc',s:'B'},
  {name:L('🏓 Pickleball — giữ nhịp di chuyển','🏓 Pickleball — keep your footwork sharp'),link:'#nguyentac'},
  {name:L('Buổi C · Toàn thân (40\')','Session C · Full body (40\')'),link:'#theluc',s:'C'},
  {name:L('⚡ Buổi D · Speed + ghi mph (30\')','⚡ Session D · Speed + log mph (30\')'),link:'#theluc',s:'D'}
];
if(PLAN&&PLAN.week){
  DOW=[0,1,2,3,4,5,6].map(function(i){return PLAN.week[i]});
  var DN=LANG==='en'?['Sun','Mon','Tue','Wed','Thu','Fri','Sat']:['CN','T2','T3','T4','T5','T6','T7'];
  document.getElementById('weekgrid').innerHTML=[1,2,3,4,5,6,0].map(function(i){var w=PLAN.week[i];
    return '<div class="day'+(w.rest?' rest':'')+'" data-dow="'+i+'"><span class="d">'+DN[i]+'</span><span class="t">'+esc(w.t)+'</span><span class="tag">'+esc(w.tag)+'</span></div>'}).join('');
}
var now=new Date(), dw=now.getDay();
var days=LANG==='en'?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']:['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
document.getElementById('today-date').textContent=days[dw]+', '+now.toLocaleDateString(LOCALE);
document.getElementById('today-name').textContent=DOW[dw].name;
var tlink=document.getElementById('today-link');
tlink.setAttribute('href',DOW[dw].link);
if(DOW[dw].s){
  tlink.textContent=L('▶ Vào buổi tập ngay','▶ Start the session now');
  tlink.addEventListener('click',function(e){e.preventDefault();openFocus(DOW[dw].s)});
}
var cell=document.querySelector('.day[data-dow="'+dw+'"]');
if(cell){cell.classList.add('now')}
/* Nút "buổi hôm nay" trên menu dọc & thanh trên điện thoại */
(function(){
  if(window.progActive) return;   /* Golf Academy: nút "hôm nay" do academy.js gắn theo chương trình đang theo */
  var t=DOW[dw], go=document.getElementById('side-go'), tb=document.getElementById('tb-today');
  if(t.s){go.innerHTML=(LANG==='en'?'▶ Start today\'s Session '+t.s:'▶ Vào Buổi '+t.s+' hôm nay')+'<small>'+esc(t.name)+'</small>';tb.textContent=L('▶ Buổi ','▶ Session ')+t.s}
  else {go.className='side-go rest';go.innerHTML=esc(t.name)+'<small>'+L('Hôm nay','Today')+' · '+days[dw]+'</small>';tb.textContent=L('Hôm nay','Today')}
  function run(){closeSide(); if(t.s) openFocus(t.s); else {var el=document.getElementById((t.link||'#homnay').slice(1));if(el)el.scrollIntoView({behavior:'smooth'})}}
  go.addEventListener('click',run); tb.addEventListener('click',run);
})();

/* ===== Lưu trữ bền (window.storage nếu có, fallback bộ nhớ) ===== */
var memStore={};
async function stGet(k){
  try{ if(window.storage){var r=await window.storage.get(k);return r?r.value:null;} }catch(e){}
  try{ if(window.localStorage){return localStorage.getItem(k);} }catch(e){}
  return memStore[k]||null;
}
async function stSet(k,v){
  try{ if(window.storage){await window.storage.set(k,v);return;} }catch(e){}
  try{ if(window.localStorage){localStorage.setItem(k,v);return;} }catch(e){}
  memStore[k]=v;
  document.getElementById('lognote').textContent=L('⚠ Không có bộ nhớ lâu dài trên môi trường này — dữ liệu chỉ giữ trong phiên hiện tại.','⚠ No persistent storage in this environment — data is kept for the current session only.');
}

/* ===== Đếm buổi hoàn thành ===== */
async function refreshStreak(){
  var raw=await stGet(K('golf-done-days'));var arr=[];
  try{arr=raw?JSON.parse(raw):[]}catch(e){arr=[]}
  document.getElementById('streak').textContent=LANG==='en'?'Completed: '+arr.length+(arr.length===1?' session':' sessions'):'Đã hoàn thành: '+arr.length+' buổi';
  return arr;
}
document.getElementById('btn-done').addEventListener('click',async function(){
  var arr=await refreshStreak();
  var key=now.toISOString().slice(0,10);
  if(arr.indexOf(key)===-1){arr.push(key);await stSet(K('golf-done-days'),JSON.stringify(arr));}
  refreshStreak();
});
refreshStreak();

/* ===== Nhật ký mph + biểu đồ ===== */
async function getLog(){
  var raw=await stGet(K('golf-mph-log'));
  try{return raw?JSON.parse(raw):[]}catch(e){return[]}
}
function drawChart(data){
  var c=document.getElementById('chart'),ctx=c.getContext('2d');
  var W=c.width,H=c.height;ctx.clearRect(0,0,W,H);
  var padL=38,padR=12,padT=14,padB=24;
  var ymin=CH.ymin,ymax=CH.ymax,tg=CH.target;
  data.forEach(function(d){if(d.v<ymin+2)ymin=Math.floor((d.v-3)/5)*5;if(d.v>ymax-2)ymax=Math.ceil((d.v+3)/5)*5});
  function Y(v){return padT+(H-padT-padB)*(1-(v-ymin)/(ymax-ymin));}
  // lưới ngang
  ctx.font='11px sans-serif';ctx.fillStyle='#8a8a7a';ctx.strokeStyle='#e6e1d0';
  for(var g=Math.ceil(ymin/5)*5;g<=ymax;g+=5){
    ctx.beginPath();ctx.moveTo(padL,Y(g));ctx.lineTo(W-padR,Y(g));ctx.stroke();
    ctx.fillText(g,6,Y(g)+4);
  }
  // đường đích 105
  ctx.strokeStyle='#C0392B';ctx.setLineDash([6,5]);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(padL,Y(tg));ctx.lineTo(W-padR,Y(tg));ctx.stroke();
  ctx.setLineDash([]);ctx.fillStyle='#C0392B';ctx.fillText(L('Đích ','Target ')+numL(tg),W-padR-62,Y(tg)-5);
  if(!data.length){ctx.fillStyle='#8a8a7a';ctx.fillText(L('Chưa có dữ liệu — nhập mph đầu tiên ở trên.','No data yet — enter your first mph above.'),padL+10,H/2);return;}
  var n=data.length;
  function X(i){return n===1?(padL+(W-padL-padR)/2):padL+(W-padL-padR)*i/(n-1);}
  // đường dữ liệu
  ctx.strokeStyle='#17553F';ctx.lineWidth=2.5;ctx.beginPath();
  data.forEach(function(d,i){var x=X(i),y=Y(d.v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  ctx.stroke();
  // điểm
  data.forEach(function(d,i){
    var x=X(i),y=Y(d.v);
    ctx.fillStyle='#F2C230';ctx.beginPath();ctx.arc(x,y,4.5,0,7);ctx.fill();
    ctx.strokeStyle='#17553F';ctx.lineWidth=1.5;ctx.stroke();
  });
}
async function renderLog(){
  var data=await getLog();
  drawChart(data);
  var list=document.getElementById('loglist');
  list.innerHTML=data.length?'':'';
  list.innerHTML=data.map(function(d){return '<span>'+d.d+': <b>'+d.v+' mph</b></span>'}).join('');
}
document.getElementById('mph-save').addEventListener('click',async function(){
  var v=parseFloat(document.getElementById('mph-in').value);
  if(!v||v<40||v>150){alert(L('Nhập số mph hợp lệ (40–150).','Enter a valid mph value (40–150).'));return;}
  var data=await getLog();
  data.push({d:new Date().toLocaleDateString(LOCALE),v:v});
  await stSet(K('golf-mph-log'),JSON.stringify(data));
  document.getElementById('mph-in').value='';
  renderLog();
});
document.getElementById('mph-undo').addEventListener('click',async function(){
  var data=await getLog();
  if(!data.length)return;
  data.pop();
  await stSet(K('golf-mph-log'),JSON.stringify(data));
  renderLog();
});
renderLog();

/* ===== Timer nghỉ ===== */
function makeTimer(btn,sec){
  var iv=null,left=sec,label='⏱ '+sec+'s';
  btn.addEventListener('click',function(){
    if(iv){clearInterval(iv);iv=null;left=sec;btn.textContent=label;btn.classList.remove('running');return;}
    left=sec;btn.classList.add('running');btn.textContent=left+'s';
    iv=setInterval(function(){
      left--;
      if(left<=0){clearInterval(iv);iv=null;btn.textContent=L('✅ HẾT GIỜ','✅ TIME\'S UP');btn.classList.remove('running');
        if(navigator.vibrate){navigator.vibrate([200,100,200]);}
        setTimeout(function(){btn.textContent=label;},2500);
      } else {btn.textContent=left+'s';}
    },1000);
  });
}
makeTimer(document.getElementById('t60'),60);
makeTimer(document.getElementById('t90'),90);

/* ===== VIDEO NHÚNG SẴN TRONG TRANG =====
   Mọi link video được đổi thành thẻ hiển thị sẵn: khung hình + chú thích
   động tác · tập trong bao lâu · hiệu quả. Bấm vào khung là phát tại chỗ
   (trình duyệt chặn tự phát hàng loạt nên vẫn cần một chạm để có tiếng). */
var VIDINFO={
 /* Buổi A · Thân dưới & hông */
 'k_EhLGvM8TQ':{n:'Goblet Squat',du:L('3 × 8 · nghỉ 90s · ~7 phút','3 × 8 · rest 90s · ~7 min'),eff:L('Học mẫu squat chuẩn, xây lực đạp đất từ chân–hông — nguồn gốc của mọi mph.','Learn a clean squat pattern and build ground force from legs and hips — where every mph starts.')},
 '1Qi0NQW89Oc':{n:'Kettlebell Swing',du:L('4 × 10 · nghỉ 90s · ~8 phút','4 × 10 · rest 90s · ~8 min'),eff:L('Bùng nổ duỗi hông — chuyển động sinh lực giống downswing nhất trong phòng gym.','Explosive hip extension — the gym move that generates power most like the downswing.')},
 'DeCnHqrN22U':{n:'Bulgarian Split Squat',du:L('3 × 8 mỗi chân · nghỉ 75s · ~8 phút','3 × 8 each leg · rest 75s · ~8 min'),eff:L('Sức mạnh từng chân riêng lẻ — nền tảng của weight shift sang chân trước.','Single-leg strength — the foundation of shifting your weight onto the lead leg.')},
 'G-bxQY57mKc':{n:'Box Jump',du:L('3 × 5 · nghỉ 60s · ~5 phút','3 × 5 · rest 60s · ~5 min'),eff:L('Tốc độ phát lực thân dưới; học tiếp đất êm để bảo vệ gối.','Lower-body rate of force development; learn to land softly to protect your knees.')},
 'VUl8R0kn6v4':{n:'Single-leg Glute Bridge',du:L('2 × 10 mỗi chân · nghỉ 45s · ~4 phút','2 × 10 each leg · rest 45s · ~4 min'),eff:L('Đánh thức cơ mông "ngủ quên" — ổn định khung chậu qua impact.','Wake up "sleepy" glutes — keep the pelvis stable through impact.')},
 /* Buổi B · Core xoay */
 'O3ME1cTuO7Y':{n:'Med Ball Rotational Throw',du:L('4 × 6 mỗi bên · nghỉ 60s · ~7 phút','4 × 6 each side · rest 60s · ~7 min'),eff:L('Công suất xoay theo đúng trình tự kinetic chain: hông trước, thân trên theo sau.','Rotational power in the right kinetic-chain order: hips first, upper body follows.')},
 'axgv7H_VQOo':{n:'Pallof Press',du:L('3 × 10 mỗi bên · nghỉ 45s · ~5 phút','3 × 10 each side · rest 45s · ~5 min'),eff:L('Core chống xoay — dạy thân "khóa" lại để truyền lực không thất thoát.','Anti-rotation core — teaches the torso to "lock" so force transfers without leaks.')},
 'bxn9FBrt4-A':{n:'Dead Bug',du:L('3 × 8 mỗi bên · nghỉ 30s · ~4 phút','3 × 8 each side · rest 30s · ~4 min'),eff:L('Bảo vệ cột sống thắt lưng khi tốc độ swing tăng dần theo lộ trình.','Protects your lower back as swing speed climbs through the program.')},
 'DXQ9YKHtcsk':{n:'Side Plank + Open Book',du:L('2 × 30s + 2 × 8 · nghỉ 45s · ~5 phút','2 × 30s + 2 × 8 · rest 45s · ~5 min'),eff:L('Liên sườn khỏe, khớp ngực mở — xoay ở hông và ngực, không ở thắt lưng.','Strong obliques, mobile thoracic spine — rotate from hips and chest, not the lower back.')},
 'rDviWORCWEw':{n:'Open Book',du:L('2 × 8 mỗi bên · ~3 phút','2 × 8 each side · ~3 min'),eff:L('Mở biên độ xoay khớp ngực — điều kiện để vai xoay 90°+ mà không đau lưng.','Opens thoracic rotation — what lets your shoulders turn 90°+ without back pain.')},
 /* Buổi C · Toàn thân */
 'aa57T45iFSE':{n:'Romanian Deadlift',du:L('3 × 8 · nghỉ 90s · ~7 phút','3 × 8 · rest 90s · ~7 min'),eff:L('Chuỗi cơ sau (mông–đùi sau–lưng) = nguồn lực lớn nhất của cú drive.','The posterior chain (glutes–hamstrings–back) = the biggest power source of your drive.')},
 'i9sTjhN4Z3M':{n:'Push-up',du:L('3 × 10–12 · nghỉ 60s · ~5 phút','3 × 10–12 · rest 60s · ~5 min'),eff:L('Thân trên đủ khỏe để "đón" lực hông truyền lên mà không sập vai.','An upper body strong enough to "catch" the force coming up from the hips without the shoulders collapsing.')},
 'tLnlWj7LQ34':{n:'Single-arm DB Row',du:L('3 × 10 mỗi bên · nghỉ 60s · ~7 phút','3 × 10 each side · rest 60s · ~7 min'),eff:L('Cơ xô và lưng giữa giữ gậy ổn định qua impact, cân bằng với nhóm cơ đẩy.','Lats and mid-back keep the club stable through impact and balance out your pushing muscles.')},
 'lsMGmkvzFsE':{n:'Med Ball Slam',du:L('3 × 8 · nghỉ 60s · ~5 phút','3 × 8 · rest 60s · ~5 min'),eff:L('Tốc độ phát lực toàn thân — cầu nối sang giai đoạn công suất.','Full-body rate of force development — the bridge into the Power phase.')},
 'R8jArZG2J6Q':{n:'Lateral Lunge',du:L('2 × 8 · ~3 phút','2 × 8 · ~3 min'),eff:L('Lực và biên độ ngang hông — kiểm soát trọng tâm khi weight shift.','Lateral hip strength and range — control your center of mass during the weight shift.')},
 '8OtwXwrJizk':{n:"Farmer's Walk",du:L('2 × 30 m · ~3 phút','2 × 30 m · ~3 min'),eff:L('Grip và thân đỡ khỏe — cầm chắc gậy ở tốc độ cao, kết buổi an toàn.','Strong grip and trunk — hold the club firmly at high speed; a safe way to end the session.')},
 /* Nâng cấp GĐ2/5 & GĐ3/6 */
 'Vu4oXIRzx7w':{n:'Trap Bar Deadlift',du:L('4 × 5 · nghỉ 2–3 phút · ~12 phút','4 × 5 · rest 2–3 min · ~12 min'),eff:L('Bài sức mạnh tuyệt đối số 1 cho lực đạp đất — nền của công suất GĐ3.','The #1 max-strength lift for ground force — the base for Phase 3 power.')},
 'pF17m_CXfL0':{n:'Hip Thrust',du:L('3 × 8 · nghỉ 90s · ~7 phút','3 × 8 · rest 90s · ~7 min'),eff:L('Cô lập lực duỗi hông — "động cơ" trực tiếp của tốc độ đầu gậy.','Isolates hip extension — the direct "engine" of clubhead speed.')},
 'KOh8cxe2ziE':{n:'Cable / Band Chop',du:L('3 × 10 mỗi bên · ~6 phút','3 × 10 each side · ~6 min'),eff:L('Lực chặt chéo thân — đúng mặt phẳng nghiêng của swing.','Diagonal chopping power across the torso — right on the swing\'s inclined plane.')},
 'MqvN10OF5fo':{n:'DB Push Press',du:L('4 × 6 · nghỉ 90s · ~8 phút','4 × 6 · rest 90s · ~8 min'),eff:L('Đẩy bùng nổ: chân sinh lực, thân truyền, tay kết thúc — chuỗi lực như cú drive.','Explosive press: legs create, torso transfers, arms finish — the same force chain as a drive.')},
 'dVgtvAXeBQw':{n:'Broad Jump',du:L('3 × 3 ngay sau set nặng · nghỉ 2–3 phút','3 × 3 right after a heavy set · rest 2–3 min'),eff:L('Contrast training: hệ thần kinh vừa được tạ nặng "đánh thức" sẽ bật xa hết công suất.','Contrast training: a nervous system just "woken up" by heavy weight jumps with full power.')},
 /* Giáo án Swing & Overspeed */
 '42jvkIr396I':{n:L('Setup driver chuẩn (Danny Maude)','Proper driver setup (Danny Maude)'),du:L('Xem ~10 phút trước buổi · áp dụng 10 bóng','Watch ~10 min before the session · apply over 10 balls'),eff:L('Setup đúng (bóng gót trái, tee cao, cột sống nghiêng) tạo attack angle dương — 20–30 yard "miễn phí".','The right setup (ball off the lead heel, tee high, spine tilted) creates a positive attack angle — 20–30 yd "for free".')},
 'Y_7rz3MYCYo':{n:'Step Drill',du:L('10 lần khan + 5 bóng · ~12 phút','10 practice swings + 5 balls · ~12 min'),eff:L('Ép thân dưới khởi động downswing đúng trình tự: chân → hông → thân → tay.','Forces the lower body to start the downswing in the right order: legs → hips → torso → arms.')},
 'ECcFoD4C8j0':{n:'Tempo 3:1 (Me and My Golf)',du:L('3 driver / 3 wedge xen kẽ · ~12 phút','3 driver / 3 wedge, alternating · ~12 min'),eff:L('Nhịp 3:1 giúp strike ổn định — nền tảng để tăng tốc mà không mất kiểm soát.','A 3:1 tempo keeps your strike consistent — the foundation for adding speed without losing control.')},
 '6y8lwV01XgQ':{n:'Center strike driver',du:L('10 bóng với xịt phấn · ~12 phút','10 balls with face spray · ~12 min'),eff:L('Strike giữa mặt nâng smash ≥ 1.46 — thêm yard mà không cần thêm mph nào.','Center-face strikes push smash ≥ 1.46 — extra yards without a single extra mph.')},
 'DuzE-83KldA':{n:L('Swing chậm mà xa (Danny Maude)','Swing slower, hit farther (Danny Maude)'),du:L('Xem ~10 phút · 10 bóng 70% lực','Watch ~10 min · 10 balls at 70% effort'),eff:L('Cảm nhận xoay vai 90°+ và hiệu suất truyền lực thay vì gồng sức.','Feel a 90°+ shoulder turn and efficient energy transfer instead of muscling it.')},
 '8gJN05iMla4':{n:L('Nguyên lý Overspeed (SuperSpeed)','Overspeed principles (SuperSpeed)'),du:L('Xem ~10 phút · áp dụng ở Buổi D Thứ 7','Watch ~10 min · apply in Saturday\'s Session D'),eff:L('Swing gậy nhẹ hết lực dạy hệ thần kinh vượt trần tốc độ (+3–5% sau 6 tuần).','Swinging light clubs all-out teaches your nervous system to break its speed ceiling (+3–5% after 6 weeks).')},
 '9DGv0KK7_Xw':{n:'Overspeed Protocol Level 1',du:L('3 × 5 mỗi bài · nghỉ 90s · ~15 phút','3 × 5 per drill · rest 90s · ~15 min'),eff:L('Giáo án overspeed nền tảng — nâng trần tốc độ đầu gậy của hệ thần kinh.','The foundation overspeed program — raises your nervous system\'s clubhead-speed ceiling.')},
 'kDRyQioVWI4':{n:'Overspeed Protocol Level 2',du:L('3 buổi/tuần · ~15 phút/buổi (GĐ4/7)','3 sessions/week · ~15 min/session (Phase 4/7)'),eff:L('Overspeed nâng cao có bước đà — vắt kiệt tốc độ ở giai đoạn peak.','Advanced overspeed with a step-in — squeezes out every last bit of speed in the peak phase.')},
 'PLDf7l5SEbgoNHf2DOAP6JkDqb6-NGtzCx':{n:L('SuperSpeed — playlist đầy đủ','SuperSpeed — full playlist'),du:L('Theo protocol của tuần hiện tại','Follow this week\'s protocol'),eff:L('Tổng hợp mọi level của hệ thống overspeed để tra cứu khi cần.','Every level of the overspeed system in one place, for reference when needed.')}
};
if(PLAN&&PLAN.lefty) Object.keys(VIDINFO).forEach(function(k){VIDINFO[k].eff=lr(VIDINFO[k].eff)});
function ytKey(href){
  var m=/[?&]v=([\w-]{6,})/.exec(href);
  if(!m) m=/youtu\.be\/([\w-]{6,})/.exec(href);
  if(m) return {id:m[1],src:'https://www.youtube-nocookie.com/embed/'+m[1]+'?autoplay=1&rel=0',img:'https://i.ytimg.com/vi/'+m[1]+'/hqdefault.jpg'};
  m=/[?&]list=([\w-]+)/.exec(href);
  if(m) return {id:m[1],src:'https://www.youtube-nocookie.com/embed/videoseries?list='+m[1],img:''};
  return null;
}
/* mặt trước khung video: ảnh bìa (hoặc nền playlist) + nút play + nhãn */
function ytFace(k){
  return (k.img?'<img loading="lazy" src="'+k.img+'" alt="">':'<span class="yt-pl">'+L('Danh sách phát','Playlist')+'</span>')+
    '<span class="yt-play" aria-hidden="true"></span><span class="yt-tag">'+(k.img?'YouTube':'Playlist')+'</span>';
}
function ytCard(href,label){
  var k=ytKey(href); if(!k) return null;
  var v=VIDINFO[k.id]||{};
  var name=v.n||label||L('Video hướng dẫn','Tutorial video');
  return '<div class="yt">'+
    '<button class="yt-thumb" type="button" data-src="'+k.src+'" data-img="'+k.img+'" aria-label="'+L('Phát video: ','Play video: ')+esc(name)+'">'+ytFace(k)+'</button>'+
    '<div class="yt-cap"><div class="t">'+esc(name)+'</div>'+
    (v.du?'<div class="r"><span class="ic">⏱</span><span class="tx"><span class="lb">'+L('Tập trong','Time')+'</span>'+esc(v.du)+'</span></div>':'')+
    (v.eff?'<div class="r"><span class="ic">🎯</span><span class="tx"><span class="lb">'+L('Hiệu quả','Benefit')+'</span>'+esc(v.eff)+'</span></div>':'')+
    '<a class="yt-ext" href="'+href+'" target="_blank" rel="noopener">'+L('Mở trên YouTube ↗','Open on YouTube ↗')+'</a></div></div>';
}
/* Đổi mọi link YouTube trong vùng cho trước thành thẻ video nhúng sẵn */
function upgradeVideos(root){
  [].slice.call((root||document).querySelectorAll('a[href*="youtube.com/"],a[href*="youtu.be/"]')).forEach(function(a){
    if(a.classList.contains('yt-ext')) return;   /* link "Mở trên YouTube" giữ nguyên */
    var html=ytCard(a.getAttribute('href'), a.textContent.replace(/^▶\s*/,'').trim());
    if(!html) return;
    var w=document.createElement('div'); w.innerHTML=html;
    a.parentNode.replaceChild(w.firstChild, a);
  });
  /* ô bảng chứa video -> căn giữa; bảng có video -> xếp khối trên điện thoại */
  [].slice.call((root||document).querySelectorAll('.tbl td, .exc-vids')).forEach(function(td){
    if(!td.querySelector('.yt')) return;
    if(td.tagName==='TD'){ td.classList.add('vcell'); td.closest('table').classList.add('tbl-vid'); }
    if(td.querySelector('.yt-row')) return;
    var row=document.createElement('div'); row.className='yt-row';
    var ys=td.querySelectorAll(':scope > .yt'); td.insertBefore(row, ys[0]);
    [].forEach.call(ys,function(y){ row.appendChild(y); });
  });
}
/* gắn lớp c0..cN theo cột thật (có tính rowspan) để bảng dàn lại thành thẻ trên điện thoại */
function tagCols(tbl){
  if(!tbl) return; var rows=tbl.querySelectorAll('tr'), hold=[], heads=[].map.call(rows[0].children,function(th){return th.textContent.trim();});
  [].forEach.call(rows,function(tr,r){ if(r===0) return; var c=0, first=true;
    [].forEach.call(tr.children,function(td){
      while(hold[c]>0){ hold[c]--; c++; first=false; }
      td.classList.add('c'+c); td.setAttribute('data-l',heads[c]||'');
      var rs=+td.getAttribute('rowspan')||1; if(rs>1) hold[c]=rs-1; c++;
    });
    for(var k=c;k<hold.length;k++) if(hold[k]>0){ hold[k]--; }
    if(tr.children.length<heads.length) tr.classList.add('cont');
  });
}
tagCols(document.getElementById('road-tbl'));
/* Bấm khung hình -> phát tại chỗ; video đang phát ở thẻ khác thì trả về khung hình */
document.addEventListener('click',function(e){
  var b=e.target.closest('.yt-thumb'); if(!b||b.dataset.on) return;
  [].slice.call(document.querySelectorAll('.yt-thumb[data-on]')).forEach(function(o){
    delete o.dataset.on;
    o.innerHTML=ytFace({img:o.dataset.img});
  });
  b.dataset.on='1';
  b.innerHTML='<iframe src="'+b.dataset.src+'" title="video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
});
upgradeVideos(document);

/* ===== Bật/tắt chuyển động (mặc định BẬT) ===== */
(function(){
  applyClips();
  var b=document.getElementById('f-play'); if(!b) return;
  b.addEventListener('click',function(){ setAnim(!ANIM_ON); stSet('golf-anim', ANIM_ON?'1':'0'); });
  stGet('golf-anim').then(function(v){ if(v==='0') setAnim(false); }).catch(function(){});
})();
/* ======================================================================
   PHÂN TÍCH VIDEO SWING — nhận diện 33 điểm khớp (MediaPipe Pose) ngay
   trên máy người dùng, tách 4 pha, đo tư thế + tempo, ra khuyến nghị.
   Video KHÔNG rời khỏi thiết bị.
   ====================================================================== */
var VA={pl:null,loading:null,ts:0,cancel:false,busy:false,res:null,url:null};
var MP_VER='0.10.14';
function vaEl(i){return document.getElementById(i)}
function vaStatus(txt,pct){vaEl('va-st').textContent=txt; if(pct!=null) vaEl('va-bar').style.width=Math.round(pct)+'%'}
function vaLoadModel(){
  if(VA.pl) return Promise.resolve(VA.pl);
  if(VA.loading) return VA.loading;
  VA.loading=import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+MP_VER+'/vision_bundle.mjs').then(function(m){
    return m.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+MP_VER+'/wasm').then(function(fs){
      var opt=function(dev){return {baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',delegate:dev},
        runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.3,minPosePresenceConfidence:.3,minTrackingConfidence:.3}};
      return m.PoseLandmarker.createFromOptions(fs,opt('GPU')).catch(function(){return m.PoseLandmarker.createFromOptions(fs,opt('CPU'))});
    });
  }).then(function(pl){VA.pl=pl;return pl}).catch(function(e){VA.loading=null;throw e});
  return VA.loading;
}
function vaSeek(v,t){return new Promise(function(res){
  var done=false,to=setTimeout(fin,4000);
  function fin(){if(done)return;done=true;clearTimeout(to);v.removeEventListener('seeked',fin);res()}
  v.addEventListener('seeked',fin); v.currentTime=Math.min(Math.max(0,t),v.duration-.001);
})}
function vaDetect(src){VA.ts+=40;var r=VA.pl.detectForVideo(src,VA.ts);VA.lastW=r&&r.worldLandmarks&&r.worldLandmarks[0]||null;return r&&r.landmarks&&r.landmarks[0]||null;}

/* Quét một đoạn: box = vùng cắt quanh người (null = toàn khung) */
async function vaScan(v,t0,t1,fps,box,p0,p1){
  var out=[],W=v.videoWidth,H=v.videoHeight,cv=null,g=null;
  if(box){cv=document.createElement('canvas');var S=512,m=Math.max(box.w,box.h);cv.width=Math.round(S*box.w/m);cv.height=Math.round(S*box.h/m);g=cv.getContext('2d')}
  var n=Math.max(2,Math.round((t1-t0)*fps)),k=0;
  for(var t=t0;t<=t1+1e-6;t+=1/fps,k++){
    if(VA.cancel) throw new Error('cancel');
    await vaSeek(v,t);
    var l;
    if(box){g.drawImage(v,box.x,box.y,box.w,box.h,0,0,cv.width,cv.height);l=vaDetect(cv);
      if(l) l=l.map(function(p){return [(box.x+p.x*box.w)/W,(box.y+p.y*box.h)/H,p.visibility||0]})}
    else {l=vaDetect(v); if(l) l=l.map(function(p){return [p.x,p.y,p.visibility||0]})}
    out.push({t:+t.toFixed(4),l:l,w:l&&VA.lastW?VA.lastW.map(function(p){return [p.x,p.y,p.z];}):null});
    if(k%3===0) vaStatus(vaEl('va-st').dataset.phase+' '+Math.min(100,Math.round(k/n*100))+'%',p0+(p1-p0)*Math.min(1,k/n));
  }
  return out;
}
function vaBox(frames,W,H,pad){
  var xs=[],ys=[];
  frames.forEach(function(f){if(f.l) f.l.forEach(function(p){if(p[2]>.5){xs.push(p[0]*W);ys.push(p[1]*H)}})});
  if(xs.length<20) return null;
  xs.sort(function(a,b){return a-b});ys.sort(function(a,b){return a-b});
  function q(a,f){return a[Math.floor(f*(a.length-1))]}
  var x0=q(xs,.02),x1=q(xs,.98),y0=q(ys,.02),y1=q(ys,.98),cx=(x0+x1)/2,cy=(y0+y1)/2,side=Math.min(Math.max(W,H),Math.max(x1-x0,y1-y0)*(pad||1.9));
  var b={x:Math.max(0,cx-side/2),y:Math.max(0,cy-side/2)};b.w=Math.min(side,W-b.x);b.h=Math.min(side,H-b.y);
  b.personH=(y1-y0)/H; return b;
}

/* ---------- Đánh giá chỉ số → trạng thái + mã lỗi ---------- */
function vaEval(r,club,hcm){
  var M=r.metrics, rows=[], iss=[], drv=club==='driver', cmT=(hcm||170)*.3;
  function cm(x){return Math.round(Math.abs(x)*cmT)+' cm'}
  function add(k,val,ref,st,code,sev,note){rows.push({k:k,val:val,ref:ref,st:st,note:note||''});if(code&&(st==='warn'||st==='bad')) iss.push({code:code,sev:sev||(st==='bad'?2:1),k:k,val:val})}
  function lvl(x,w,b){return x>b?'bad':x>w?'warn':'ok'}
  var tp=M.tempo, tst=(tp<2.6||tp>3.6)?((tp<2||tp>4.5)?'bad':'warn'):'ok';
  if(r.view==='dtl'&&tst!=='ok') tst='na';
  var real=VA.slow>1?L(' · lên ',' · back ')+vn((M.back/VA.slow).toFixed(2))+L(' s, xuống ',' s, down ')+vn((M.down/VA.slow).toFixed(2))+' s':'';
  add(L('Tempo (lên : xuống)','Tempo (back : down)'),vn(tp.toFixed(1))+' : 1'+real,L('2,7–3,3 : 1','2.7–3.3 : 1'),tst,tst==='na'?null:(tp<2.7?'tempo_fast':'tempo_slow'),null,
    r.view==='dtl'?L('Góc dọc đường bóng đo tempo kém chính xác — dùng video chính diện để chấm tempo.','Down-the-line video measures tempo less accurately — use a face-on video to check tempo.'):'');
  add(L('Tay ở đỉnh (so với vai)','Hands at the top (vs. shoulders)'),M.handTop>=0?(LANG==='en'?cm(M.handTop)+' above shoulders':'cao hơn vai '+cm(M.handTop)):(LANG==='en'?cm(M.handTop)+' below shoulders':'thấp hơn vai '+cm(M.handTop)),L('cao hơn vai','above shoulders'),M.handTop<.2?'warn':'ok','short_back');
  if(r.view==='fo'){
    add(L('Đầu dịch ngang khi lên gậy','Head sway in the backswing'),cm(M.headSway)+(M.headSway<0?L(' (về phía mục tiêu)',' (toward target)'):''),'< '+Math.round(.3*cmT)+' cm',lvl(Math.abs(M.headSway),.3,.45),'head_sway');
    var hl=drv?.12:.2;
    add(L('Đầu lúc impact','Head at impact'),M.headImpact>0?(LANG==='en'?cm(M.headImpact)+' forward':'lao tới '+cm(M.headImpact)):(LANG==='en'?cm(M.headImpact)+' behind':'ở sau '+cm(M.headImpact)),drv?L('ở sau hoặc ngang vị trí address','behind or level with address position'):L('lệch < ','moves < ')+Math.round(hl*cmT)+' cm',lvl(M.headImpact,hl,hl+.13),'head_fwd');
    add(L('Độ cao đầu lúc impact','Head height at impact'),M.headDrop>0?(LANG==='en'?cm(M.headDrop)+' lower':'hạ '+cm(M.headDrop)):(LANG==='en'?cm(M.headDrop)+' higher':'nhô '+cm(M.headDrop)),L('thay đổi < ','change < ')+Math.round(.2*cmT)+' cm',
      M.headDrop>.2?(M.headDrop>.3?'bad':'warn'):M.headDrop<-.15?'warn':'ok',M.headDrop>.2?'head_dip':'head_rise');
    add(L('Hông trượt khi lên gậy (sway)','Hip sway in the backswing'),M.hipSway>0?cm(M.hipSway)+L(' ra xa mục tiêu',' away from target'):L('không trượt','no sway'),'< '+Math.round(.15*cmT)+' cm',lvl(M.hipSway,.15,.3),'sway');
    add(L('Hông dồn về mục tiêu lúc impact','Hip shift toward target at impact'),M.hipShift>=0?cm(M.hipShift):(LANG==='en'?cm(M.hipShift)+' back':'lùi '+cm(M.hipShift)),Math.round(.1*cmT)+'–'+Math.round(.45*cmT)+' cm',
      M.hipShift<.05?(M.hipShift<-.05?'bad':'warn'):M.hipShift>.55?'warn':'ok',M.hipShift<.05?'hang_back':'slide');
    add(L('Vai xoay ở đỉnh (ước tính 2D)','Shoulder turn at the top (2D estimate)'),Math.round(M.shTurn)+'°','≥ 45° (2D)',M.shTurn<40?(M.shTurn<30?'bad':'warn'):'ok','short_turn',null,L('Góc chiếu 2D thường thấp hơn góc thật.','The 2D projection usually reads lower than the true angle.'));
    add(L('Hông xoay ở đỉnh (ước tính 2D)','Hip turn at the top (2D estimate)'),Math.round(M.hipTurn)+'°','25–45°',M.hipTurn>55?'warn':'ok',null);
    add(L('Tay trước ở đỉnh','Lead arm at the top'),Math.round(M.leadArm)+'°','≥ 110° (2D)',M.leadArm<100?(M.leadArm<85?'bad':'warn'):'ok','bent_arm',null,L('Góc chiếu chính diện làm tay trông gập hơn thực tế.','The face-on angle makes the arm look more bent than it really is.'));
    if(drv) add(L('Cột sống nghiêng ra xa mục tiêu (setup)','Spine tilt away from target (setup)'),Math.round(M.spineTilt)+'°',L('5–15° với driver','5–15° with driver'),M.spineTilt<2?(M.spineTilt<-2?'bad':'warn'):M.spineTilt>20?'warn':'ok',M.spineTilt<2?'tilt_low':'tilt_high');
    else add(L('Cột sống nghiêng (setup)','Spine tilt (setup)'),Math.round(M.spineTilt)+'°',L('0–8° với gậy sắt','0–8° with irons'),M.spineTilt>15?'warn':'ok','tilt_high');
    var sn=drv?[1,1.9]:[.8,1.8];
    add(L('Độ rộng thế đứng','Stance width'),vn(M.stance.toFixed(2))+L(' × vai',' × shoulders'),drv?L('1,1–1,6 × vai','1.1–1.6 × shoulders'):L('0,9–1,4 × vai','0.9–1.4 × shoulders'),M.stance<sn[0]?'warn':M.stance>sn[1]?'warn':'ok',M.stance<sn[0]?'stance_narrow':'stance_wide');
    add(L('Hông ở tư thế kết thúc','Hips at the finish'),M.finishOver>=-.5?L('trên chân trước','over the lead foot'):L('còn ở phía sau','still back'),L('trên chân trước','over the lead foot'),M.finishOver<-.8?(M.finishOver<-1.3?'bad':'warn'):'ok','finish');
  } else {
    add(L('Gập người ở setup','Forward bend at setup'),Math.round(M.spineAddr)+'°','20–40°',M.spineAddr<18?'warn':M.spineAddr>42?'warn':'ok',M.spineAddr<18?'upright':'hunched');
    add(L('Gập gối ở setup','Knee flex at setup'),Math.round(M.kneeFlex)+'°','10–35°',M.kneeFlex<8?'warn':M.kneeFlex>38?'warn':'ok',M.kneeFlex<8?'knee_straight':'knee_deep');
    var dTop=M.spineTop-M.spineAddr;
    add(L('Góc cột sống ở đỉnh','Spine angle at the top'),(dTop>=0?'+':'')+Math.round(dTop)+L('° so với setup','° vs. setup'),L('thay đổi < 10°','change < 10°'),Math.abs(dTop)>10?(Math.abs(dTop)>16?'bad':'warn'):'ok','posture_loss');
    var ee=Math.max(M.hipToBall/.1,(M.spineAddr-M.spineImp)/8);
    add(L('Hông tiến về phía bóng lúc impact','Hips moving toward the ball at impact'),(M.hipToBall>0?cm(M.hipToBall):L('không','none'))+L(' · thân đứng dậy ',' · torso stands up ')+Math.max(0,Math.round(M.spineAddr-M.spineImp))+'°','< '+Math.round(.1*cmT)+' cm · < 8°',ee>1?(ee>2?'bad':'warn'):'ok','early_ext');
    add(L('Đầu nhô lên lúc impact','Head rising at impact'),M.headRise>0?cm(M.headRise):L('không','none'),'< '+Math.round(.12*cmT)+' cm',lvl(M.headRise,.12,.2),'head_rise');
    if(M.pathDiff==null) add(L('Đường tay khi xuống gậy','Hand path in the downswing'),L('không đo được','could not measure'),L('trùng hoặc hơi trong đường lên','on or slightly inside the backswing path'),'na',null);
    else add(L('Đường tay khi xuống gậy','Hand path in the downswing'),M.pathDiff>.05?(LANG==='en'?cm(M.pathDiff)+' outside':'ra ngoài '+cm(M.pathDiff)):M.pathDiff<-.05?(LANG==='en'?cm(M.pathDiff)+' inside':'vào trong '+cm(M.pathDiff)):L('trùng đường lên','on the backswing path'),L('trùng hoặc trong ≤ ','on or inside ≤ ')+Math.round(.3*cmT)+' cm',
      M.pathDiff>.15?(M.pathDiff>.3?'bad':'warn'):M.pathDiff<-.3?'warn':'ok',M.pathDiff>.15?'ott':'inside');
  }
  iss.sort(function(a,b){return b.sev-a.sev});
  var seen={}; iss=iss.filter(function(x){if(seen[x.code])return false;seen[x.code]=1;return true});
  return {rows:rows,issues:iss};
}

/* ---------- Vẽ 4 khung hình chính ---------- */
var VA_EDGES=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],[27,31],[28,32]];
async function vaKeyframes(v,r){
  var W=v.videoWidth,H=v.videoHeight,fr=r.frames.slice(r.idx.address,r.idx.finish+1);
  var xs=[],ys=[];fr.forEach(function(f){['nose','lAn','rAn','lWr','rWr','lSh','rSh','lHip','rHip'].forEach(function(k){xs.push(f[k].x);ys.push(f[k].y)})});
  var x0=Math.min.apply(0,xs),x1=Math.max.apply(0,xs),y0=Math.min.apply(0,ys),y1=Math.max.apply(0,ys);
  var ph=(y1-y0),bw=Math.max(x1-x0,ph*.62)*1.35,bh=ph*1.3,cx=(x0+x1)/2,cy=(y0+y1)/2;
  var box={x:Math.max(0,cx-bw/2),y:Math.max(0,cy-bh/2)};box.w=Math.min(bw,W-box.x);box.h=Math.min(bh,H-box.y);
  var A=r.keys.A, out=[], names=[['address','Address'],['top',L('Đỉnh','Top')],['impact','Impact'],['finish',L('Kết thúc','Finish')]];
  for(var i=0;i<4;i++){
    var key=names[i][0], row=r.frames[r.idx[key]];
    await vaSeek(v,row.t);
    var cv=document.createElement('canvas'),sc=260/box.w;cv.width=260;cv.height=Math.round(box.h*sc);
    var g=cv.getContext('2d');g.drawImage(v,box.x,box.y,box.w,box.h,0,0,cv.width,cv.height);
    function X(x){return (x-box.x)*sc} function Y(y){return (y-box.y)*sc}
    g.setLineDash([5,4]);g.lineWidth=1.6;
    if(r.view==='fo'){
      g.strokeStyle='rgba(242,194,48,.95)';g.beginPath();g.moveTo(X(A.nose.x),0);g.lineTo(X(A.nose.x),cv.height);g.stroke();
      g.strokeStyle='rgba(120,220,255,.9)';g.beginPath();g.moveTo(X(A.hip.x),Y(A.hip.y)-40);g.lineTo(X(A.hip.x),cv.height);g.stroke();
    } else {
      var dx=A.sh.x-A.hip.x,dy=A.sh.y-A.hip.y;
      g.strokeStyle='rgba(242,194,48,.95)';g.beginPath();g.moveTo(X(A.hip.x-dx*.3),Y(A.hip.y-dy*.3));g.lineTo(X(A.sh.x+dx*.5),Y(A.sh.y+dy*.5));g.stroke();
      var back=A.hip.x-(r.bdir||1)*r.T*.12;
      g.strokeStyle='rgba(120,220,255,.9)';g.beginPath();g.moveTo(X(back),Y(A.hip.y)-50);g.lineTo(X(back),cv.height);g.stroke();
    }
    g.setLineDash([]);
    var raw=null;for(var q=0;q<VA.frames.length;q++) if(Math.abs(VA.frames[q].t-row.t)<1e-3){raw=VA.frames[q].l;break}
    if(raw){
      g.lineWidth=2.6;g.lineCap='round';
      VA_EDGES.forEach(function(e){var a=raw[e[0]],b=raw[e[1]];if(a[2]<.3||b[2]<.3)return;
        g.strokeStyle=e[0]%2?'#F2C230':'#7FE0C8';g.beginPath();g.moveTo(X(a[0]*W),Y(a[1]*H));g.lineTo(X(b[0]*W),Y(b[1]*H));g.stroke()});
      g.fillStyle='#fff';[0,15,16].forEach(function(k){var a=raw[k];g.beginPath();g.arc(X(a[0]*W),Y(a[1]*H),3,0,7);g.fill()});
    }
    out.push({lab:names[i][1],t:row.t,url:cv.toDataURL('image/jpeg',.82)});
  }
  return out;
}

/* ---------- Hiển thị kết quả ---------- */
var VA_ERR={noperson:L('Không nhận ra người trong video. Quay rõ cả người từ đầu tới chân, đủ sáng, không bị che.','No person detected in the video. Film the whole body clearly from head to toe, in good light, with nothing blocking the view.'),
  noswing:L('Không tìm thấy trọn một cú swing (address → đỉnh → impact → kết thúc). Kiểm tra video có đủ cả cú, hoặc chỉnh lại đoạn "từ giây / đến giây".','Couldn\'t find one complete swing (address → top → impact → finish). Check that the video contains the whole swing, or adjust the "from / to (seconds)" range.'),
  load:L('Không tải được mô hình nhận diện (cần Internet ở lần đầu). Thử lại sau vài giây.','Couldn\'t load the pose-detection model (Internet is needed the first time). Try again in a few seconds.'),
  small:L('Người trong video quá nhỏ — hãy quay gần hơn để người chiếm ít nhất nửa chiều cao khung hình.','The golfer is too small in the video — film closer so you fill at least half the frame height.')};
function vaRender(r,ev,keys){
  var p=ME, club=VA.club, STN={ok:L('✓ Tốt','✓ Good'),warn:L('⚠ Cần chỉnh','⚠ Needs work'),bad:L('✕ Lỗi rõ','✕ Clear fault'),na:L('· Tham khảo','· For reference')};
  var viewN=r.view==='fo'?L('Chính diện (face-on)','Face-on'):L('Dọc đường bóng (down-the-line)','Down-the-line');
  var nBad=ev.rows.filter(function(x){return x.st==='bad'}).length, nWarn=ev.rows.filter(function(x){return x.st==='warn'}).length;
  var score=Math.max(0,Math.round(100-nBad*14-nWarn*6));
  var miss=p&&p.miss, link='';
  var codes=ev.issues.map(function(x){return x.code});
  function has(){for(var i=0;i<arguments.length;i++) if(codes.indexOf(arguments[i])>=0) return true;return false}
  if(miss==='slice'&&has('ott','head_fwd','slide','tilt_low')) link=L('Khớp với đường bóng <b>slice</b> bạn khai báo — sửa các lỗi dưới đây là sửa tận gốc.','Matches the <b>slice</b> you reported — fixing the faults below fixes it at the root.');
  else if(miss==='hook'&&has('inside','early_ext','hang_back')) link=L('Khớp với đường bóng <b>hook</b> bạn khai báo.','Matches the <b>hook</b> you reported.');
  else if((miss==='thin'||miss==='fat')&&has('hang_back','head_dip','early_ext','posture_loss','head_rise')) link=LANG==='en'?'Explains the <b>'+(miss==='fat'?'fat':'thin/topped')+'</b> shots you reported: the low point of your swing is moving.':'Giải thích lỗi <b>'+(miss==='fat'?'đánh đất':'đánh mỏng/top')+'</b> bạn khai báo: đáy cung swing đang thay đổi.';
  else if(miss==='low'&&has('head_fwd','tilt_low')) link=L('Giải thích bóng <b>bay thấp</b>: đang đánh xuống thay vì đánh lên.','Explains the <b>low ball flight</b>: you\'re hitting down instead of up.');
  var top3=ev.issues.slice(0,3);
  var html='<div class="va-card">'+
    '<div class="va-head"><div><div class="sess-kicker">'+L('Kết quả phân tích · ','Analysis results · ')+new Date().toLocaleDateString(LOCALE)+'</div>'+
      '<div class="va-title">'+viewN+' · '+(club==='driver'?'Driver':L('Gậy sắt','Iron'))+'</div>'+
      '<div class="va-meta">'+r.frames.length+L(' khung hình phân tích · độ tin cậy nhận diện ',' frames analyzed · detection confidence ')+Math.round(r.avgVis*100)+'%'+(r.viewAuto?L(' · góc quay tự nhận diện',' · camera angle auto-detected'):'')+'</div></div>'+
      '<div class="va-score"><b>'+score+'</b><span>'+L('điểm tư thế','posture score')+'</span></div></div>'+
    '<div class="va-keys">'+keys.map(function(k){return '<figure><img src="'+k.url+'" alt="'+k.lab+'"><figcaption>'+k.lab+'</figcaption></figure>'}).join('')+'</div>'+
    '<p class="va-legend">'+(r.view==='fo'?L('<i class="y"></i>vị trí đầu lúc address <i class="c"></i>vị trí hông lúc address','<i class="y"></i>head position at address <i class="c"></i>hip position at address'):L('<i class="y"></i>góc cột sống lúc address <i class="c"></i>mốc mông lúc address','<i class="y"></i>spine angle at address <i class="c"></i>glute line at address'))+'</p>'+
    (link?'<div class="alert i">'+link+'</div>':'')+
    '<h4>📐 '+L('Chỉ số đo được','Measured metrics')+'</h4><div class="tbl-scroll"><table class="tbl va-tbl"><tr><th>'+L('Chỉ số','Metric')+'</th><th>'+L('Của bạn','Yours')+'</th><th>'+L('Chuẩn tham chiếu','Reference')+'</th><th></th></tr>'+
    ev.rows.map(function(x){return '<tr><td class="m">'+x.k+(x.note?'<div class="why">'+x.note+'</div>':'')+'</td><td>'+x.val+'</td><td>'+x.ref+'</td><td><span class="st '+x.st+'">'+STN[x.st]+'</span></td></tr>'}).join('')+'</table></div>'+
    '<h4>🎯 '+L('Khuyến nghị theo thứ tự ưu tiên','Recommendations by priority')+'</h4>'+
    (top3.length?'<ol class="plist">'+top3.map(function(x){var I=ISSUES[x.code];
      return '<li><div><b>'+I.t+'</b> <span class="st '+(x.sev>1?'bad':'warn')+'">'+x.val+'</span><br>'+I.why+
        '<br><b>'+L('Bài sửa:','Fix drill:')+'</b> '+I.n+' — '+I.how+' · <b>'+I.dose+'</b>.<br><b>'+L('Đạt khi:','Done when:')+'</b> '+I.chk+'.</div></li>'}).join('')+'</ol>'
      :'<p class="dr-p">'+L('Không phát hiện lỗi tư thế rõ ràng ở góc quay này. Quay thêm góc ','No clear posture faults found from this camera angle. Also film ')+(r.view==='fo'?L('dọc đường bóng','down-the-line'):L('chính diện','face-on'))+L(' để kiểm tra phần còn lại.',' to check the rest.')+'</p>')+
    (VA.clip?'<h4>🎬 '+L('Chuyển động thật của bạn','Your real motion')+'</h4>'+
      '<div class="mc"><div class="mc-fig"><svg id="mc-svg" viewBox="6 12 118 124"></svg><div class="mc-cap">'+(VA.clip.dur/1000).toFixed(1)+' s · '+VA.clip.f.length+L(' khung 3D',' 3D frames')+'</div></div>'+
      '<div class="mc-ctl"><p class="dr-p">'+L('Khớp 3D lấy từ video được chuyển lên hình người (giữ vóc dáng chuẩn, lấy chuyển động của bạn). Vì là 3D nên xoay được góc nhìn.','3D joints from your video are mapped onto the figure (standard body shape, your motion). Because it\'s 3D, you can rotate the view.')+'</p>'+
      '<label class="mc-l">'+L('Góc nhìn','View angle')+' <input type="range" id="mc-view" min="-90" max="90" value="0" step="5"> <span id="mc-vv">'+L('như quay','as filmed')+'</span></label>'+
      '<label class="mc-l"><input type="checkbox" id="mc-club"'+(VA.clip.club?' checked':'')+'> '+L('Vẽ gậy (ước lượng theo hướng tay — video không nhận diện được gậy)','Draw the club (estimated from the arms — the video can\'t detect the club)')+'</label>'+
      '<label class="mc-l">'+L('Dùng làm mẫu cho','Use as the model for')+' <select id="mc-target">'+mocapTargets().map(function(o){return '<option value="'+o[0]+'">'+esc(o[1])+'</option>';}).join('')+'</select></label>'+
      (p?'<button class="btn y" type="button" id="mc-save">🎬 '+L('Lưu làm chuyển động mẫu','Save as model motion')+'</button>':'<p class="tbl-note">'+L('Tạo hồ sơ để lưu chuyển động mẫu.','Create a profile to save model motions.')+'</p>')+
      '<div class="tbl-note" id="mc-msg"></div></div></div>':'')+
    '<div class="va-act">'+
      (top3.length?(p?'<button class="btn y" type="button" id="va-apply">✦ '+(LANG==='en'?'Add '+top3.length+' fix drill'+(top3.length>1?'s':'')+' to '+esc(p.name)+'\'s plan':'Đưa '+top3.length+' bài sửa vào giáo án của '+esc(p.name))+'</button>'
        :'<button class="btn y" type="button" id="va-apply">✦ '+L('Tạo hồ sơ &amp; đưa vào giáo án','Create a profile &amp; add to plan')+'</button>'):'')+
      '<button class="btn" type="button" id="va-again">↺ '+L('Phân tích video khác','Analyze another video')+'</button></div>'+
    '<p class="tbl-note" style="color:#7A8780">'+L('Đo từ ảnh 2D nên các góc là ước tính; quay đúng hướng dẫn để sai số nhỏ nhất. Nên quay cả 2 góc: chính diện (tempo, trọng tâm, đầu) và dọc đường bóng (tư thế, đường swing).','Measured from 2D video, so angles are estimates; follow the filming guide to keep the error small. Film both angles: face-on (tempo, weight shift, head) and down-the-line (posture, swing path).')+'</p>'+
  '</div>';
  vaEl('va-res').innerHTML=html;
  VA.last={view:r.view,club:club,d:new Date().toLocaleDateString(LOCALE),tempo:+r.metrics.tempo.toFixed(2),score:score,
    issues:top3.map(function(x){return {code:x.code,sev:x.sev,val:x.val}})};
  vaEl('va-res').scrollIntoView({behavior:'smooth',block:'start'});
}

/* ---------- Chạy phân tích ---------- */
async function vaRun(){
  if(VA.busy) return;
  var v=vaEl('va-video'); if(!v.src) return;
  if(window.proGate&&!proGate('video')) return;
  VA.busy=true;VA.cancel=false;
  vaEl('va-go').disabled=true;vaEl('va-prog').hidden=false;vaEl('va-res').innerHTML='';
  VA.club=vaEl('va-club').value; VA.slow=+vaEl('va-slow').value||1;
  var t0=Math.max(0,+String(vaEl('va-t0').value).replace(',','.')||0), t1=Math.min(v.duration,+String(vaEl('va-t1').value).replace(',','.')||v.duration);
  if(!(t1>t0+.4)){t0=0;t1=v.duration}
  try{
    vaEl('va-st').dataset.phase=L('Đang tải mô hình nhận diện (~9 MB, chỉ lần đầu)…','Loading the pose-detection model (~9 MB, first time only)…');vaStatus(vaEl('va-st').dataset.phase,2);
    try{await vaLoadModel()}catch(e){throw new Error('load')}
    v.pause();
    try{await v.play();v.pause()}catch(e){}
    var W=v.videoWidth,H=v.videoHeight,dur=t1-t0;
    vaEl('va-st').dataset.phase=L('① Tìm người trong khung','① Finding the golfer in the frame');
    var fa=await vaScan(v,t0,t1,Math.min(6,Math.max(2,40/dur)),null,5,20);
    var box=vaBox(fa,W,H,1.9); if(!box) throw new Error('noperson');
    if(box.personH<.18) throw new Error('small');
    vaEl('va-st').dataset.phase=L('② Quét toàn bộ chuyển động','② Scanning the full motion');
    var fb=await vaScan(v,t0,t1,Math.min(20,Math.max(6,240/dur)),box,20,60);
    var hand=ME&&ME.hand==='l'?'l':'r', view=vaEl('va-view').value;
    var r=swingAnalyze(fb,W,H,{hand:hand,view:view,slow:VA.slow});
    if(!r.ok) throw new Error(r.err);
    var span=r.times.finish-r.times.start, w0=Math.max(t0,r.times.start-Math.max(.4,.2*span)), w1=Math.min(t1,r.times.finish+.15*span);
    vaEl('va-st').dataset.phase=L('③ Phân tích chi tiết cú swing','③ Analyzing the swing in detail');
    var fc=await vaScan(v,w0,w1,Math.min(60,Math.max(15,300/(w1-w0))),box,60,92);
    var all=fb.filter(function(f){return f.t<w0||f.t>w1}).concat(fc).sort(function(a,b){return a.t-b.t});
    var r2=swingAnalyze(all,W,H,{hand:hand,view:view,slow:VA.slow});
    if(r2.ok) r=r2; else all=fb;
    VA.frames=all;
    vaEl('va-st').dataset.phase=L('④ Dựng hình minh họa','④ Building the illustrations');vaStatus(L('④ Dựng hình minh họa…','④ Building the illustrations…'),95);
    var keys=await vaKeyframes(v,r);
    var ev=vaEval(r,VA.club,ME?ME.h:170);
    var sp=r.times.finish-r.times.start;
    VA.clip=mocapClip(all,W,H,VA.slow,r.times.start-Math.max(.3,.25*sp),Math.min(t1,r.times.finish+.25*sp),VA.club==='driver'||VA.club==='iron');
    VA.res=r; vaRender(r,ev,keys); vaStatus(L('Xong','Done'),100);
    if(window.proUse) proUse('video');
    if(VA.clip) mocapPreview();
  }catch(e){
    var m=e&&e.message;
    if(m!=='cancel') vaEl('va-res').innerHTML='<div class="alert">'+(VA_ERR[m]||(L('Lỗi khi phân tích: ','Analysis error: ')+esc(m||L('không rõ','unknown'))))+'</div>';
  }finally{
    VA.busy=false;vaEl('va-go').disabled=false;vaEl('va-prog').hidden=true;
  }
}
function mocapTargets(){
  var o=[]; ['tempo','ground','stepdrill','finish','coil','setup','longdrive'].forEach(function(id){var d=DRILLS.filter(function(x){return x.id===id})[0]; if(d) o.push(['D:'+d.id,'Swing · '+d.n]);});
  SESSIONS.forEach(function(s){s.ex.forEach(function(e,i){var fi=figIdx(s.id,e,i); if(fi!=null&&FIGS3[fi]) o.push(['F'+fi,L('Buổi ','Session ')+s.id+' · '+e.name]);});});
  return o;
}
function mocapPreview(){
  var svg=vaEl('mc-svg'); if(!svg||!VA.clip) return;
  var view=+(vaEl('mc-view').value||0);
  PLAYERS=PLAYERS.filter(function(p){return p.tag!=='mc';});
  playClip(svg,VA.clip,'mc',view);
}
document.addEventListener('change',function(e){
  if(e.target.id==='mc-club'&&VA.clip){VA.clip.club=e.target.checked?30:0;mocapPreview();}
});
document.addEventListener('input',function(e){
  if(e.target.id==='mc-view'){var v=+e.target.value;vaEl('mc-vv').textContent=v?(v>0?L('xoay phải ','rotated right '):L('xoay trái ','rotated left '))+Math.abs(v)+'°':L('như quay','as filmed');VA.clip.view=v;mocapPreview();}
});
document.addEventListener('click',function(e){
  if(e.target.id!=='mc-save'||!VA.clip||!ME) return;
  var key=vaEl('mc-target').value, c=JSON.parse(JSON.stringify(VA.clip)); c.view=+(vaEl('mc-view').value||0);
  ME.clips=ME.clips||{}; ME.clips[key]=c;
  PROFILES=PROFILES.map(function(x){return x.id===ME.id?ME:x});
  if(!lsSet(PKEY,JSON.stringify(PROFILES))){vaEl('mc-msg').textContent=L('⚠ Bộ nhớ trình duyệt đầy — không lưu được clip.','⚠ Browser storage is full — couldn\'t save the clip.');return;}
  vaEl('mc-msg').innerHTML=L('✓ Đã lưu. Hình động của bài này giờ phát chuyển động thật của bạn — ','✓ Saved. This exercise\'s animation now plays your real motion — ')+'<a href="'+(key.charAt(0)==='D'?'#swing':'#theluc')+'" style="font-weight:800;color:var(--green-deep)">'+L('xem','view')+'</a>.';
  applyClips();
});
/* thay hình vẽ tay bằng clip mocap ở thư viện swing (chế độ tập trung xử lý trong renderStep) */
function applyClips(){
  document.querySelectorAll('.drill').forEach(function(c){
    var key='D:'+c.dataset.d, clip=clipFor(key), ds=c.querySelector('.ds'); if(!clip) return;
    var mine=ME&&ME.clips&&ME.clips[key], old=ds.querySelector('.mc-badge'); if(old) old.remove();
    ds.insertAdjacentHTML('beforeend',mine?' <span class="mc-badge">🎬 '+L('chuyển động của bạn','your motion')+' · '+esc(clip.d)+' <button type="button" data-clipdel="'+key+'" aria-label="'+L('Trả về mẫu vẽ','Back to the drawn model')+'">✕</button></span>'
      :' <span class="mc-badge" title="'+esc(clip.src||'')+'">🎬 '+L('chuyển động thật','real motion')+'</span>');
    if(c._on){ PLAYERS=PLAYERS.filter(function(p){return p.el!==c.querySelector('svg');}); playClip(c.querySelector('svg'),clip,'drill',clip.view); }
    else c.querySelector('svg').innerHTML=bodyF(mocapPose(clip,0,clip.view));
  });
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-clipdel]'); if(!b||!ME||!ME.clips) return;
  delete ME.clips[b.dataset.clipdel]; PROFILES=PROFILES.map(function(x){return x.id===ME.id?ME:x}); lsSet(PKEY,JSON.stringify(PROFILES));
  location.reload();
});
function vaSetFile(f){
  if(!f) return;
  if(!/^video\//.test(f.type)&&!/\.(mp4|mov|webm|m4v|3gp)$/i.test(f.name)){vaEl('va-res').innerHTML='<div class="alert">'+L('Tệp này không phải video.','This file is not a video.')+'</div>';return}
  if(VA.url) URL.revokeObjectURL(VA.url);
  VA.url=URL.createObjectURL(f);
  var v=vaEl('va-video'); v.src=VA.url; v.hidden=false;
  vaEl('va-fname').textContent=f.name+' · '+(f.size/1048576).toFixed(1)+' MB';
  v.onloadedmetadata=function(){
    vaEl('va-t0').value=0; vaEl('va-t1').value=Math.min(v.duration,60).toFixed(1);
    vaEl('va-trim').hidden=false; vaEl('va-go').disabled=false;
    vaEl('va-res').innerHTML=v.duration>60?'<div class="alert i">'+L('Video dài ','The video is ')+Math.round(v.duration)+L(' giây — đã giới hạn 60 giây đầu. Chỉnh "từ giây / đến giây" quanh đúng một cú swing để phân tích nhanh và chính xác hơn.',' seconds long — limited to the first 60 seconds. Set the "from / to (seconds)" range around a single swing for faster, more accurate analysis.')+'</div>':'';
  };
}
(function(){
  var fi=vaEl('va-file'), drop=vaEl('va-drop');
  if(!fi) return;
  fi.addEventListener('change',function(){vaSetFile(fi.files[0])});
  ['dragenter','dragover'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add('over')})});
  ['dragleave','drop'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.remove('over')})});
  drop.addEventListener('drop',function(e){var f=e.dataTransfer.files&&e.dataTransfer.files[0];vaSetFile(f)});
  vaEl('va-go').addEventListener('click',vaRun);
  vaEl('va-cancel').addEventListener('click',function(){VA.cancel=true});
  vaEl('va-mark0').addEventListener('click',function(){vaEl('va-t0').value=vaEl('va-video').currentTime.toFixed(1)});
  vaEl('va-mark1').addEventListener('click',function(){vaEl('va-t1').value=vaEl('va-video').currentTime.toFixed(1)});
  if(ME&&ME.club) vaEl('va-club').value='driver';
  document.addEventListener('click',function(e){
    if(e.target.id==='va-again'){vaEl('va-res').innerHTML='';fi.value='';fi.click();return}
    if(e.target.id!=='va-apply'||!VA.last) return;
    if(!ME){lsSet('golf-va-pending',JSON.stringify(VA.last));obOpen('new');return}
    ME.video=ME.video||{}; ME.video[VA.last.view]=VA.last;
    PROFILES=PROFILES.map(function(x){return x.id===ME.id?ME:x});
    lsSet(PKEY,JSON.stringify(PROFILES)); location.hash='swing'; location.reload();
  });
})();

/* ===== Menu dọc: mở/đóng trên điện thoại + đánh dấu mục đang xem ===== */
var SIDE=document.getElementById('side'), DIM=document.getElementById('side-dim'), TBM=document.getElementById('tb-menu');
function openSide(){SIDE.classList.add('open');DIM.classList.add('on');TBM.setAttribute('aria-expanded','true');
  var a=SIDE.querySelector('.side-nav a.on')||SIDE.querySelector('.side-nav a'); if(a) setTimeout(function(){a.focus()},60)}
function closeSide(){if(!SIDE.classList.contains('open'))return;SIDE.classList.remove('open');DIM.classList.remove('on');TBM.setAttribute('aria-expanded','false')}
TBM.addEventListener('click',openSide); DIM.addEventListener('click',closeSide);
document.getElementById('side-x').addEventListener('click',function(){closeSide();TBM.focus()});
SIDE.addEventListener('click',function(e){if(e.target.closest('a,[data-ob]'))closeSide()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSide()});
/* mục đang xem trên menu: do router (academy.js) đánh dấu */
