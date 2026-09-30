/* ===== CHƯƠNG TRÌNH TẬP — dữ liệu song ngữ =====
   Mỗi chương trình: các giai đoạn (phases) → mỗi giai đoạn lặp lại một bộ buổi tập trong các tuần của nó.
   Mục trong buổi:
     d: id bài trong Thư viện động tác Swing (có hình động)   f: số hình bài thể lực (FIGS3, có hình động)
     t: nhiệm vụ không hình   ·   rx: liều lượng   ·   note: ghi chú kỹ thuật
     metric: {max, label} → ô ghi kết quả (vd 8/10) để theo dõi tiến bộ   ·   sets: số ô đánh dấu set   ·   rest: giây nghỉ */
function _(vi,en){return {vi:vi,en:en};}
var PROGRAMS=[
 {id:'found', icon:'🌱', color:'#2E8B57', pro:false, weeks:4, per:3, mins:45,
  level:_('Người mới','Beginner'),
  title:_('Nền tảng golf','Golf Foundations'),
  tagline:_('Từ cầm gậy đến chơi 9 hố đầu tiên','From your first grip to your first 9 holes'),
  desc:_('Chương trình 4 tuần cho người mới hoặc người tự học muốn làm lại nền móng: cầm gậy, tư thế, căn hướng, swing ngắn, chip, putt và thói quen trước cú đánh. Mỗi buổi 45 phút, có mục tiêu đo được để bạn biết mình đang tiến bộ.',
     'A 4-week program for new or self-taught golfers who want solid fundamentals: grip, posture, alignment, short swings, chipping, putting and a pre-shot routine. 45-minute sessions with measurable targets so you always know you are improving.'),
  outcomes:[_('Cầm gậy và setup đúng mỗi lần','A correct grip and setup every time'),_('Tiếp xúc bóng chắc với swing 9–3','Solid contact with a 9-to-3 swing'),_('Chip & putt có kiểm soát cự ly','Chips and putts with distance control'),_('Routine trước cú đánh như tay chơi thật','A pre-shot routine like a real player')],
  phases:[
   {weeks:[1],sessions:[
     {t:_('Cầm gậy, tư thế & căn hướng','Grip, posture & alignment'),dur:45,warm:'A',focus:_('Setup đúng là 50% cú đánh tốt.','A correct setup is half of every good shot.'),items:[
       {d:'grip',rx:_('5 phút · soi gương','5 min · mirror check'),note:_('Thấy 2–3 đốt ngón tay trái; chữ V hai tay chỉ về vai phải.','See 2–3 knuckles on the lead hand; both "V"s point to the trail shoulder.')},
       {d:'setup',rx:_('10 lần vào tư thế','10 setups'),note:_('Gập hông, lưng thẳng, tay rủ tự nhiên dưới vai.','Hinge from the hips, straight back, arms hanging under the shoulders.'),sets:2},
       {d:'align',rx:_('10 bóng · que căn hướng','10 balls · alignment sticks'),note:_('Chân, hông, vai song song đường bóng — như đường ray tàu.','Feet, hips and shoulders parallel to the target line — like railway tracks.'),metric:{max:10,label:_('Bóng xuất phát đúng hướng','Balls starting on line')}},
       {d:'putt',rx:_('20 putt 1 m','20 putts from 1 m'),note:_('Vai lắc như con lắc, cổ tay yên.','Rock the shoulders like a pendulum, quiet wrists.'),metric:{max:20,label:_('Putt vào lỗ','Putts holed')}}]},
     {t:_('Putt & chip cơ bản','Putting & chipping basics'),dur:45,warm:'B',focus:_('Hơn 60% số gậy nằm trong 100 m cuối.','Over 60% of strokes happen inside 100 metres.'),items:[
       {d:'puttgate',rx:_('20 putt 1,5 m qua cổng','20 putts from 1.5 m through a gate'),metric:{max:20,label:_('Qua cổng','Through the gate')}},
       {d:'puttladder',rx:_('3 lượt · 3–6–9 m','3 rounds · 3–6–9 m'),note:_('Bóng dừng trong vòng 1 gậy putter sau lỗ.','Stop the ball within a putter length past the hole.'),metric:{max:9,label:_('Bóng dừng trong vùng','Balls in the zone')}},
       {d:'chip',rx:_('30 chip · gậy 8 hoặc 9','30 chips · 8 or 9 iron'),note:_('Bóng lệch chân sau, tay đi trước đầu gậy, lắc vai như putt.','Ball back, hands ahead, rock the shoulders like a putt.'),metric:{max:10,label:_('Chip dừng trong 2 m (10 bóng cuối)','Chips within 2 m (last 10)')}}]},
     {t:_('Swing 9–3: tiếp xúc chắc','9-to-3 swing: solid contact'),dur:45,warm:'C',focus:_('Swing nhỏ, tiếp xúc chắc, rồi mới lớn dần.','Small swing, solid strike — then grow it.'),items:[
       {d:'half',rx:_('3 × 10 bóng · gậy 7','3 × 10 balls · 7 iron'),note:_('Lên gậy đến khi tay trái song song đất, kết thúc đối xứng.','Swing back until the lead arm is parallel to the ground, finish symmetrically.'),metric:{max:10,label:_('Tiếp xúc chắc (10 bóng cuối)','Solid strikes (last 10)')},rest:60,sets:3},
       {d:'tempo',rx:_('10 swing khan đếm nhịp','10 counted practice swings'),note:_('"Một–hai–ba" lên, "một" xuống.','"One-two-three" back, "one" down.')},
       {f:9,name:_('Open Book (xoay ngực)','Open Book (thoracic rotation)'),rx:_('2 × 8 mỗi bên','2 × 8 per side'),note:_('Xoay ở ngực, không ở thắt lưng.','Rotate through the chest, not the lower back.')}]}
   ]},
   {weeks:[2],sessions:[
     {t:_('Swing 9–3 với gậy sắt','9-to-3 swing with irons'),dur:45,warm:'C',focus:_('Chạm đất sau bóng = mục tiêu số 1.','Brush the turf after the ball — target #1.'),items:[
       {d:'half',rx:_('4 × 10 bóng · gậy 7 & 9','4 × 10 balls · 7 & 9 iron'),note:_('Đặt khăn 10 cm sau bóng — không được chạm khăn.','Put a towel 10 cm behind the ball — don\'t hit it.'),metric:{max:10,label:_('Không chạm khăn (10 bóng cuối)','Missed the towel (last 10)')},rest:60,sets:4},
       {d:'finish',rx:_('10 swing giữ finish 3 giây','10 swings, hold finish 3 s'),metric:{max:10,label:_('Giữ thăng bằng 3 giây','Balanced for 3 s')}}]},
     {t:_('Chip điểm rơi & putt khoảng cách','Chip landing spot & lag putting'),dur:45,warm:'B',focus:_('Chọn điểm rơi, để bóng lăn phần còn lại.','Pick a landing spot and let it roll.'),items:[
       {d:'chip',rx:_('30 chip · khăn làm điểm rơi','30 chips · towel landing spot'),metric:{max:10,label:_('Rơi trúng khăn (10 bóng cuối)','Landed on the towel (last 10)')}},
       {d:'puttladder',rx:_('3 lượt · 4–8–12 m','3 rounds · 4–8–12 m'),metric:{max:9,label:_('Bóng dừng trong vùng','Balls in the zone')}},
       {d:'puttclock',rx:_('Vòng tròn 1 m · 8 bóng','1 m circle · 8 balls'),metric:{max:8,label:_('Vào lỗ liên tiếp','Holed in a row')}}]},
     {t:_('Nhịp swing toàn phần','Full-swing tempo'),dur:45,warm:'A',focus:_('Nhịp đều quan trọng hơn lực.','Rhythm beats power.'),items:[
       {d:'tempo',rx:_('3 × 10 bóng · gậy 7','3 × 10 balls · 7 iron'),rest:60,sets:3,metric:{max:10,label:_('Bóng bay thẳng hướng (10 bóng cuối)','Balls on target (last 10)')}},
       {d:'finish',rx:_('Mỗi bóng giữ finish','Hold every finish')},
       {f:4,name:_('Glute Bridge','Glute Bridge'),rx:_('2 × 12','2 × 12')}]}
   ]},
   {weeks:[3],sessions:[
     {t:_('Gậy sắt: hướng & cự ly','Irons: direction & distance'),dur:45,warm:'C',focus:_('Biết mỗi gậy đi bao xa là vũ khí lớn nhất ngoài sân.','Knowing your yardages is your biggest weapon on course.'),items:[
       {d:'align',rx:_('Setup que căn hướng mỗi bóng','Alignment sticks for every ball')},
       {d:'tempo',rx:_('10 bóng mỗi gậy: 9, 7, 5','10 balls each: 9, 7, 5 iron'),note:_('Ghi cự ly trung bình mỗi gậy vào ghi chú điện thoại.','Write down the average carry of each club.'),metric:{max:10,label:_('Bóng vào vùng mục tiêu (gậy 7)','Balls in target zone (7 iron)')}}]},
     {t:_('Pitch 30–60 m','Pitching 30–60 m'),dur:45,warm:'B',focus:_('Biên độ lên gậy quyết định cự ly, không phải lực.','Backswing length controls distance, not effort.'),items:[
       {d:'pitch',rx:_('3 × 10 bóng · 30 / 45 / 60 m','3 × 10 balls · 30 / 45 / 60 m'),metric:{max:10,label:_('Bóng trong 5 m quanh cờ (60 m)','Within 5 m of the flag (60 m)')},sets:3},
       {d:'wedgeclock',rx:_('Ghi cự ly 3 biên độ','Record 3 swing lengths')}]},
     {t:_('Driver: setup & swing 70%','Driver: setup & 70% swing'),dur:45,warm:'D',focus:_('Tee cao, bóng ngang gót trái, đánh lên.','Tee it high, ball off the lead heel, hit up.'),items:[
       {d:'setup',rx:_('Checklist trước mỗi bóng','Checklist before every ball')},
       {d:'tempo',rx:_('20 driver ở 70% lực','20 drivers at 70% effort'),metric:{max:10,label:_('Bóng vào fairway ảo (10 bóng cuối)','In the imaginary fairway (last 10)')}},
       {d:'finish',rx:_('Giữ finish mọi cú','Hold every finish')}]}
   ]},
   {weeks:[4],sessions:[
     {t:_('Routine trước cú đánh','Pre-shot routine'),dur:45,warm:'A',focus:_('Mỗi bóng một mục tiêu, một ý định.','One target, one intention per ball.'),items:[
       {d:'routine',rx:_('20 bóng — đủ routine mỗi bóng','20 balls — full routine every ball'),metric:{max:20,label:_('Làm đủ routine','Full routine completed')}},
       {t:_('Đổi gậy & mục tiêu mỗi bóng','Change club & target every ball'),rx:_('10 bóng','10 balls'),note:_('Giống ngoài sân: không đánh 2 bóng liên tiếp cùng gậy.','Like on the course: never hit the same club twice in a row.')}]},
     {t:_('Kiểm tra short game','Short-game test'),dur:45,warm:'B',focus:_('So với tuần 1 để thấy tiến bộ.','Compare with week 1 to see your progress.'),items:[
       {d:'chip',rx:_('10 chip','10 chips'),metric:{max:10,label:_('Trong 2 m','Within 2 m')}},
       {d:'pitch',rx:_('10 pitch 40 m','10 pitches from 40 m'),metric:{max:10,label:_('Trong 5 m','Within 5 m')}},
       {d:'puttgate',rx:_('20 putt 1,5 m','20 putts from 1.5 m'),metric:{max:20,label:_('Vào lỗ','Holed')}}]},
     {t:_('Ra sân: 9 hố đầu tiên','On course: your first 9 holes'),dur:120,warm:'A',focus:_('Chơi để trải nghiệm — ghi điểm vào mục Tiến bộ.','Play to learn — log your score in Progress.'),items:[
       {t:_('Chơi 9 hố','Play 9 holes'),rx:_('Routine mỗi cú · chọn gậy an toàn','Routine every shot · pick the safe club'),note:_('Sau vòng: vào Tiến bộ → Ghi vòng golf.','After the round: Progress → Log a round.')}]}
   ]}
  ]},

 {id:'mobility', icon:'🧘', color:'#3B7F9C', pro:false, weeks:4, per:3, mins:20,
  level:_('Mọi trình độ','All levels'),
  title:_('Linh hoạt & phòng chấn thương','Mobility & Injury Prevention'),
  tagline:_('20 phút để xoay tốt hơn, đau ít hơn','20 minutes to turn better and hurt less'),
  desc:_('Golf đòi hỏi hông và ngực xoay tốt, lưng dưới ổn định. Chương trình 4 tuần, mỗi tuần 3 buổi 20 phút, dựa trên nguyên lý TPI: mở hông, xoay ngực, kích hoạt mông và core chống xoay.',
     'Golf needs mobile hips and thoracic spine with a stable lower back. Four weeks, three 20-minute sessions a week, based on TPI principles: open the hips, rotate the chest, wake up the glutes and train anti-rotation core.'),
  outcomes:[_('Xoay vai rộng hơn mà không đau lưng','A bigger shoulder turn without back pain'),_('Mông và core khỏe để giữ tư thế','Strong glutes and core to hold posture'),_('Thói quen khởi động trước mỗi buổi','A warm-up habit before every session')],
  phases:[
   {weeks:[1,2],sessions:[
     {t:_('Hông & ngực','Hips & thoracic spine'),dur:20,warm:'A',items:[
       {f:9,name:_('Side Plank + Open Book','Side Plank + Open Book'),rx:_('2 × 20 giây + 8 lần/bên','2 × 20 s + 8 reps/side'),rest:30},
       {f:4,name:_('Glute Bridge 1 chân','Single-leg Glute Bridge'),rx:_('2 × 10 mỗi chân','2 × 10 per leg'),rest:30},
       {f:14,name:_('Lateral Lunge','Lateral Lunge'),rx:_('2 × 6 mỗi bên','2 × 6 per side'),rest:30}]},
     {t:_('Core chống xoay','Anti-rotation core'),dur:20,warm:'B',items:[
       {f:8,name:_('Dead Bug','Dead Bug'),rx:_('3 × 6 mỗi bên','3 × 6 per side'),rest:30},
       {f:7,name:_('Pallof Press','Pallof Press'),rx:_('2 × 10 mỗi bên','2 × 10 per side'),rest:30},
       {f:9,name:_('Side Plank + Open Book','Side Plank + Open Book'),rx:_('2 × 20 giây mỗi bên','2 × 20 s per side'),rest:30}]},
     {t:_('Gập hông & tư thế','Hip hinge & posture'),dur:20,warm:'C',items:[
       {f:10,name:_('Hip hinge (RDL không tạ)','Hip hinge (bodyweight RDL)'),rx:_('3 × 10','3 × 10'),note:_('Đẩy hông ra sau, lưng thẳng — đúng tư thế address.','Push the hips back with a flat back — your address posture.'),rest:30},
       {f:0,name:_('Squat không tạ','Bodyweight squat'),rx:_('2 × 12','2 × 12'),rest:30},
       {f:4,name:_('Glute Bridge','Glute Bridge'),rx:_('2 × 12','2 × 12'),rest:30}]}
   ]},
   {weeks:[3,4],sessions:[
     {t:_('Hông & ngực — nâng cao','Hips & thoracic — progression'),dur:20,warm:'A',items:[
       {f:9,name:_('Side Plank + Open Book','Side Plank + Open Book'),rx:_('3 × 30 giây + 10 lần/bên','3 × 30 s + 10 reps/side'),rest:30},
       {f:2,name:_('Bulgarian Split Squat (không tạ)','Bulgarian Split Squat (bodyweight)'),rx:_('2 × 8 mỗi chân','2 × 8 per leg'),rest:45},
       {f:14,name:_('Lateral Lunge','Lateral Lunge'),rx:_('3 × 8 mỗi bên','3 × 8 per side'),rest:30}]},
     {t:_('Core xoay có kiểm soát','Controlled rotational core'),dur:20,warm:'B',items:[
       {f:7,name:_('Pallof Press','Pallof Press'),rx:_('3 × 10 mỗi bên','3 × 10 per side'),rest:30},
       {f:8,name:_('Dead Bug','Dead Bug'),rx:_('3 × 8 mỗi bên','3 × 8 per side'),rest:30},
       {f:5,name:_('Ném xoay (bóng nhẹ hoặc khăn)','Rotational throw (light ball or towel)'),rx:_('3 × 6 mỗi bên','3 × 6 per side'),note:_('Hông xoay trước, vai theo sau.','Hips first, shoulders follow.'),rest:45}]},
     {t:_('Sức mạnh chuỗi sau','Posterior-chain strength'),dur:20,warm:'C',items:[
       {f:10,name:_('Romanian Deadlift nhẹ','Light Romanian Deadlift'),rx:_('3 × 10','3 × 10'),rest:45},
       {f:4,name:_('Glute Bridge 1 chân','Single-leg Glute Bridge'),rx:_('3 × 10 mỗi chân','3 × 10 per leg'),rest:30},
       {f:12,name:_('Row 1 tay','Single-arm row'),rx:_('2 × 10 mỗi bên','2 × 10 per side'),rest:30}]}
   ]}
  ]},

 {id:'short', icon:'⛳', color:'#B7791F', pro:true, weeks:6, per:3, mins:45,
  level:_('Trung cấp','Intermediate'),
  title:_('Short game bậc thầy','Short Game Mastery'),
  tagline:_('Chip, pitch, bunker — cứu điểm quanh green','Chip, pitch, bunker — save strokes around the green'),
  desc:_('6 tuần tập trung vào 50 m cuối: hệ thống đồng hồ cho wedge, chip nhiều gậy, bunker và các trò chơi up-and-down có tính điểm. Người chơi 90–100 điểm thường bớt được 4–6 gậy mỗi vòng chỉ nhờ short game.',
     'Six weeks on the last 50 metres: a clock system for wedges, multi-club chipping, bunker play and scored up-and-down games. Golfers who shoot 90–100 typically save 4–6 strokes a round from short game alone.'),
  outcomes:[_('Kiểm soát cự ly wedge 3 biên độ','Three-length wedge distance control'),_('Thoát bunker ngay lần đầu','Out of the bunker first time'),_('Tỉ lệ up-and-down tăng rõ rệt','A clearly higher up-and-down rate')],
  phases:[
   {weeks:[1,2],sessions:[
     {t:_('Hệ thống đồng hồ wedge','Wedge clock system'),dur:45,warm:'B',items:[
       {d:'wedgeclock',rx:_('10 bóng mỗi biên độ 7:30 · 9:00 · 10:30','10 balls at 7:30 · 9:00 · 10:30'),note:_('Ghi cự ly trung bình mỗi biên độ — đó là "bảng cự ly" của bạn.','Record the average carry for each length — your personal yardage chart.'),sets:3},
       {d:'pitch',rx:_('10 bóng · mục tiêu ngẫu nhiên 30–60 m','10 balls · random targets 30–60 m'),metric:{max:10,label:_('Trong 5 m','Within 5 m')}}]},
     {t:_('Chip nhiều gậy','Multi-club chipping'),dur:45,warm:'A',items:[
       {d:'chip',rx:_('10 chip mỗi gậy: 7 · 9 · PW','10 chips each: 7 · 9 · PW'),note:_('Cùng một cú đánh — gậy khác nhau cho tỉ lệ bay/lăn khác nhau.','Same stroke — different clubs give different carry/roll ratios.'),sets:3},
       {d:'chip',rx:_('Trò chơi 9 vị trí','9-spot game'),metric:{max:9,label:_('Dừng trong 1,5 m','Within 1.5 m')}}]},
     {t:_('Bunker cơ bản','Bunker basics'),dur:45,warm:'C',items:[
       {d:'bunker',rx:_('Vạch cát · 20 lần','Sand line · 20 swings'),note:_('Kẻ vạch trên cát, gậy chạm cát ở vạch — không cần bóng.','Draw a line in the sand and hit the line — no ball needed.'),metric:{max:20,label:_('Chạm đúng vạch','Hit the line')}},
       {d:'bunker',rx:_('20 bóng','20 balls'),metric:{max:10,label:_('Ra khỏi bunker lên green (10 bóng cuối)','Out and on the green (last 10)')}}]}
   ]},
   {weeks:[3,4],sessions:[
     {t:_('Pitch dưới áp lực','Pitching under pressure'),dur:45,warm:'B',items:[
       {d:'pitch',rx:_('Thang 20–30–40–50 m, lên xuống','Ladder 20–30–40–50 m, up and back'),metric:{max:8,label:_('Trong 4 m','Within 4 m')}},
       {d:'wedgeclock',rx:_('Kiểm tra lại bảng cự ly','Re-check your yardage chart')}]},
     {t:_('Chip quanh green','Around-the-green chipping'),dur:45,warm:'A',items:[
       {d:'chip',rx:_('Up-and-down 10 vị trí','Up-and-down from 10 spots'),note:_('Chip rồi putt cho vào lỗ — tính số lần thành công.','Chip then hole out — count successes.'),metric:{max:10,label:_('Up-and-down thành công','Successful up-and-downs')}},
       {d:'puttclock',rx:_('Vòng tròn 1 m','1 m circle'),metric:{max:8,label:_('Vào lỗ liên tiếp','Holed in a row')}}]},
     {t:_('Bunker khoảng cách','Bunker distance control'),dur:45,warm:'C',items:[
       {d:'bunker',rx:_('10 bóng cờ gần · 10 bóng cờ xa','10 short-flag · 10 long-flag'),note:_('Cờ xa: vung dài hơn, cùng lượng cát.','Long flag: longer swing, same amount of sand.'),metric:{max:10,label:_('Dừng trong 3 m','Within 3 m')}}]}
   ]},
   {weeks:[5,6],sessions:[
     {t:_('Trò chơi "Par 18"','"Par 18" game'),dur:45,warm:'A',items:[
       {t:_('9 vị trí quanh green, mỗi vị trí par 2','9 spots around the green, par 2 each'),rx:_('1 lượt · ghi tổng gậy','1 round · record total'),metric:{max:18,label:_('Điểm (thấp hơn là tốt)','Score (lower is better)'),low:true}}]},
     {t:_('Wedge vào cờ','Wedges to the flag'),dur:45,warm:'B',items:[
       {d:'pitch',rx:_('20 bóng khoảng cách ngẫu nhiên','20 balls random distances'),metric:{max:20,label:_('Trong 5 m','Within 5 m')}}]},
     {t:_('Kiểm tra cuối chương trình','Final test'),dur:45,warm:'C',items:[
       {d:'chip',rx:_('10 chip','10 chips'),metric:{max:10,label:_('Trong 2 m','Within 2 m')}},
       {d:'pitch',rx:_('10 pitch 40 m','10 pitches 40 m'),metric:{max:10,label:_('Trong 5 m','Within 5 m')}},
       {d:'bunker',rx:_('10 bóng bunker','10 bunker shots'),metric:{max:10,label:_('Lên green','On the green')}}]}
   ]}
  ]},

 {id:'putt', icon:'🎯', color:'#6B46C1', pro:true, weeks:4, per:3, mins:30,
  level:_('Mọi trình độ','All levels'),
  title:_('Phòng thí nghiệm putting','Putting Lab'),
  tagline:_('Xuất phát đúng hướng, lăn đúng tốc độ','Start it on line, roll it at the right speed'),
  desc:_('Putting chiếm ~40% số gậy. 4 tuần luyện ba kỹ năng: hướng xuất phát (cổng), tốc độ (thang khoảng cách) và bản lĩnh putt ngắn (vòng tròn áp lực).',
     'Putting is about 40% of your strokes. Four weeks on three skills: start line (gates), pace (distance ladders) and short-putt nerve (pressure circles).'),
  outcomes:[_('Gần như không 3-putt','Almost no three-putts'),_('Putt 1–2 m vào ≥ 80%','Holing ≥ 80% from 1–2 m'),_('Đọc tốc độ green tốt hơn','Better pace reading')],
  phases:[
   {weeks:[1,2],sessions:[
     {t:_('Hướng xuất phát','Start line'),dur:30,warm:null,items:[
       {d:'puttgate',rx:_('30 putt · cổng 2 tee','30 putts · 2-tee gate'),metric:{max:30,label:_('Qua cổng','Through the gate')}},
       {d:'putt',rx:_('10 putt nhắm mắt','10 putts eyes closed'),note:_('Cảm nhận con lắc vai.','Feel the shoulder pendulum.')}]},
     {t:_('Tốc độ','Pace'),dur:30,warm:null,items:[
       {d:'puttladder',rx:_('3 lượt · 3–6–9–12 m','3 rounds · 3–6–9–12 m'),metric:{max:12,label:_('Dừng trong vùng','In the zone')}}]},
     {t:_('Putt ngắn','Short putts'),dur:30,warm:null,items:[
       {d:'puttclock',rx:_('Vòng 1 m · 3 lượt','1 m circle · 3 rounds'),metric:{max:8,label:_('Vào lỗ liên tiếp (tốt nhất)','Best streak holed')}},
       {d:'puttgate',rx:_('20 putt 2 m','20 putts from 2 m'),metric:{max:20,label:_('Vào lỗ','Holed')}}]}
   ]},
   {weeks:[3,4],sessions:[
     {t:_('Hướng + dốc','Line + slope'),dur:30,warm:null,items:[
       {d:'puttgate',rx:_('20 putt dốc trái · 20 dốc phải','20 left-breakers · 20 right-breakers'),metric:{max:20,label:_('Vào lỗ (tổng / 2)','Holed (total / 2)')}}]},
     {t:_('Lag putting','Lag putting'),dur:30,warm:null,items:[
       {d:'puttladder',rx:_('10 putt 10–15 m','10 putts from 10–15 m'),metric:{max:10,label:_('Dừng trong 1 m','Within 1 m')}}]},
     {t:_('Áp lực: 50 putt','Pressure: 50 putts'),dur:30,warm:null,items:[
       {d:'puttclock',rx:_('Vòng 1,5 m · phải vào 8 liên tiếp mới được nghỉ','1.5 m circle · hole 8 in a row to finish'),metric:{max:8,label:_('Chuỗi dài nhất','Longest streak')}},
       {t:_('Trò chơi 2 putt từ 9 lỗ ngẫu nhiên','Two-putt game from 9 random holes'),rx:_('9 lỗ','9 holes'),metric:{max:9,label:_('Lỗ ≤ 2 putt','Holes in ≤ 2 putts')}}]}
   ]}
  ]},

 {id:'break90', icon:'🏆', color:'#C53030', pro:true, weeks:8, per:3, mins:60,
  level:_('Trung cấp','Intermediate'),
  title:_('Phá 90','Break 90'),
  tagline:_('Chiến thuật sân + tập có mục đích','Course strategy + purposeful practice'),
  desc:_('8 tuần cho người chơi 90–105 điểm. Không đổi swing — thay vào đó loại bỏ gậy phạt, tối ưu chọn gậy, short game và routine. Mỗi tuần một vòng (hoặc 9 hố) có ghi số liệu để đo tiến bộ.',
     'Eight weeks for 90–105 shooters. No swing rebuild — instead remove penalty strokes, choose clubs better, sharpen short game and routine. Play one round (or 9 holes) a week and log it to measure progress.'),
  outcomes:[_('Ít gậy phạt, ít double bogey','Fewer penalties and double bogeys'),_('Chiến thuật mỗi hố rõ ràng','A clear plan for every hole'),_('Điểm trung bình giảm 5–8 gậy','Average score down 5–8 strokes')],
  phases:[
   {weeks:[1,2],sessions:[
     {t:_('Biết cự ly từng gậy','Know your yardages'),dur:60,warm:'C',items:[
       {d:'tempo',rx:_('10 bóng mỗi gậy từ PW đến gậy 5','10 balls per club, PW to 5 iron'),note:_('Ghi cự ly bay trung bình (bỏ 2 bóng tệ nhất).','Record average carry (drop your 2 worst).')},
       {d:'wedgeclock',rx:_('Bảng cự ly wedge','Wedge yardage chart')}]},
     {t:_('Short game cứu điểm','Short game that saves strokes'),dur:60,warm:'B',items:[
       {d:'chip',rx:_('Up-and-down 10 vị trí','Up-and-down from 10 spots'),metric:{max:10,label:_('Thành công','Successful')}},
       {d:'puttladder',rx:_('Lag 3 lượt','3 lag rounds'),metric:{max:9,label:_('Trong vùng','In the zone')}}]},
     {t:_('Vòng golf có số liệu','Round with stats'),dur:240,warm:'A',items:[
       {t:_('Chơi 9 hoặc 18 hố','Play 9 or 18 holes'),rx:_('Ghi: điểm, số putt, fairway, GIR, gậy phạt','Log: score, putts, fairways, GIR, penalties'),note:_('Vào Tiến bộ → Ghi vòng golf ngay sau vòng.','Go to Progress → Log a round right after.')}]}
   ]},
   {weeks:[3,4],sessions:[
     {t:_('Tee shot an toàn','Safe tee shots'),dur:60,warm:'D',items:[
       {d:'routine',rx:_('14 cú tee: fairway ảo 30 m','14 tee shots: 30 m imaginary fairway'),note:_('Hố hẹp: dùng gậy gỗ 3 hoặc hybrid.','Tight hole: use a 3-wood or hybrid.'),metric:{max:14,label:_('Trong fairway','In the fairway')}}]},
     {t:_('Wedge 50–100 m','Wedges 50–100 m'),dur:60,warm:'B',items:[
       {d:'pitch',rx:_('20 bóng khoảng cách ngẫu nhiên','20 balls at random distances'),metric:{max:20,label:_('Lên green','On the green')}}]},
     {t:_('Vòng golf chiến thuật','Strategy round'),dur:240,warm:'A',items:[
       {t:_('Quy tắc: nhắm giữa green, tránh phía nguy hiểm','Rule: aim centre-green, miss on the safe side'),rx:_('9 hoặc 18 hố','9 or 18 holes'),note:_('Không bao giờ đánh 2 cú mạo hiểm liên tiếp.','Never take two risky shots in a row.')}]}
   ]},
   {weeks:[5,6],sessions:[
     {t:_('Thoát hiểm & bóng khó','Recovery & trouble shots'),dur:60,warm:'C',items:[
       {d:'half',rx:_('10 cú "punch" thấp dưới cành','10 low punch shots under branches'),metric:{max:10,label:_('Bóng thấp, thẳng','Low and straight')}},
       {d:'bunker',rx:_('10 bóng bunker','10 bunker shots'),metric:{max:10,label:_('Lên green','On the green')}}]},
     {t:_('Putting chống 3-putt','Anti-3-putt putting'),dur:60,warm:null,items:[
       {d:'puttladder',rx:_('10 putt 8–15 m','10 putts 8–15 m'),metric:{max:10,label:_('Trong 1 m','Within 1 m')}},
       {d:'puttclock',rx:_('Vòng 1 m','1 m circle'),metric:{max:8,label:_('Chuỗi dài nhất','Longest streak')}}]},
     {t:_('Vòng golf đo kết quả','Scoring round'),dur:240,warm:'A',items:[
       {t:_('Chơi & ghi số liệu','Play & log stats'),rx:_('9 hoặc 18 hố','9 or 18 holes')}]}
   ]},
   {weeks:[7,8],sessions:[
     {t:_('Mô phỏng vòng đấu trên sân tập','Simulated round on the range'),dur:60,warm:'C',items:[
       {d:'routine',rx:_('18 hố ảo: driver → gậy sắt → wedge theo bảng cự ly','18 imaginary holes: driver → iron → wedge from your chart'),metric:{max:18,label:_('Cú đạt mục tiêu','Shots on target')}}]},
     {t:_('Short game tổng hợp','Short-game combine'),dur:60,warm:'B',items:[
       {t:_('Trò chơi "Par 18"','"Par 18" game'),rx:_('9 vị trí, par 2','9 spots, par 2'),metric:{max:18,label:_('Điểm (thấp hơn là tốt)','Score (lower is better)'),low:true}}]},
     {t:_('Vòng mục tiêu: dưới 90','Target round: under 90'),dur:240,warm:'A',items:[
       {t:_('Chơi 18 hố với toàn bộ chiến thuật','Play 18 with your full strategy'),rx:_('Ghi vòng vào Tiến bộ','Log it in Progress')}]}
   ]}
  ]},

 {id:'driver300', icon:'🚀', color:'#D69E2E', pro:true, weeks:52, per:5, mins:40, external:'driver',
  level:_('Trung – nâng cao','Intermediate – advanced'),
  title:_('Driver 300 Yard','Driver 300 Yard'),
  tagline:_('Chương trình tốc độ 12 tháng · thể lực + swing','12-month speed program · fitness + swing'),
  desc:_('Chương trình chu kỳ hóa trọn 1 năm (Nền tảng → Sức mạnh → Công suất → Tốc độ) tích hợp launch monitor, overspeed và cá nhân hóa theo thể trạng, chấn thương và thông số driver của bạn.',
     'A full-year periodised program (Foundation → Strength → Power → Speed) with launch-monitor targets, overspeed training and personalisation to your body, injuries and driver specs.'),
  outcomes:[_('+10–15% tốc độ đầu gậy','+10–15% club-head speed'),_('Attack angle dương, smash ≥ 1.47','Positive attack angle, smash ≥ 1.47'),_('Thể lực golf toàn diện','Complete golf fitness')],
  phases:[]}
];

/* ===== Tiến độ chương trình (lưu theo từng hồ sơ: golf-prog[::id]) ===== */
var GOAL_PROG={basics:'found',score:'break90',short:'short',power:'driver300',fit:'mobility'};
function progKey(){ return typeof K==='function'?K('golf-prog'):'golf-prog'; }
function progState(){
  var s=null; try{ s=JSON.parse(localStorage.getItem(progKey())||'null'); }catch(e){}
  s=s||{}; s.started=s.started||{}; s.done=s.done||{}; s.res=s.res||{}; s.hist=s.hist||{};
  return s;
}
function progSave(s){ try{ localStorage.setItem(progKey(),JSON.stringify(s)); }catch(e){} }
function progById(id){ for(var i=0;i<PROGRAMS.length;i++) if(PROGRAMS[i].id===id) return PROGRAMS[i]; return null; }
function progActive(){ return progState().active||null; }
function progStart(id){ var s=progState(); s.active=id; if(!s.started[id]) s.started[id]=new Date().toISOString().slice(0,10); progSave(s); }
function progOnProfileSaved(p,isNew){
  if(!isNew) return;
  var k=p.legacy?'golf-prog':'golf-prog::'+p.id, s=null;   /* khóa của hồ sơ MỚI (ME vẫn là hồ sơ cũ lúc này) */
  try{ s=JSON.parse(localStorage.getItem(k)||'null'); }catch(e){}
  s=s||{started:{},done:{},res:{},hist:{}};
  if(!s.active){ s.active=GOAL_PROG[p.goal]||'found'; s.started=s.started||{}; s.started[s.active]=new Date().toISOString().slice(0,10);
    try{ localStorage.setItem(k,JSON.stringify(s)); }catch(e){} }
}
/* danh sách buổi theo thứ tự: {key, week, idx, def} */
function progSessions(pr){
  var out=[]; (pr.phases||[]).forEach(function(ph){ ph.weeks.forEach(function(w){
    ph.sessions.forEach(function(def,i){ out.push({key:pr.id+':'+w+':'+i,week:w,idx:i,def:def}); }); }); });
  return out.sort(function(a,b){ return a.week-b.week||a.idx-b.idx; });
}
function progNext(pr){ var st=progState(), L2=progSessions(pr); for(var i=0;i<L2.length;i++) if(!st.done[L2[i].key]) return L2[i]; return null; }
function progPct(pr){ var st=progState(), L2=progSessions(pr); if(!L2.length) return 0; return Math.round(100*L2.filter(function(x){return st.done[x.key];}).length/L2.length); }
