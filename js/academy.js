/* ===== GOLF ACADEMY — khung ứng dụng =====
   Router theo màn hình · Trang chủ · Chương trình · Tiến bộ (vòng golf) · Gói Pro · Pháp lý.
   Chạy SAU app.js (dùng ME, PROFILES, DRILLS, SESSIONS, openFocus, esc, K, stGet…). */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function e(x){ return esc(x==null?'':String(x)); }
function today(){ return new Date().toISOString().slice(0,10); }
function jget(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v; }catch(x){ return d; } }
function jset(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(x){} }
var BR=APP_CFG.brand;

/* ======================= ROUTER ======================= */
var VIEWS=['home','programs','driver','fitness','swing','video','progress','profile','pro','legal'];
var TITLES={home:L('Trang chủ','Home'),programs:L('Chương trình','Programs'),driver:'Driver 300 Yard',fitness:L('Thể lực','Fitness'),
  swing:L('Kỹ thuật swing','Swing technique'),video:L('Phân tích video','Video analysis'),progress:L('Tiến bộ','Progress'),
  profile:L('Hồ sơ','Profile'),pro:L('Gói Pro','Pro plans'),legal:L('Điều khoản & bảo mật','Terms & privacy')};
function viewOf(el){ var v=el&&el.closest?el.closest('[data-view]'):null; return v?v.getAttribute('data-view'):null; }
function route(){
  var h=decodeURIComponent((location.hash||'').replace(/^#\/?/,'')), view='home', target=null, sub=null, late=null;
  var LATE={rounds:'progress'};   /* mục chỉ có sau khi màn hình được dựng */
  if(/^p-/.test(h)){ view='programs'; sub=h.slice(2); }
  else if(h){ var el=$(h); if(el){ view=viewOf(el)||h; if(el.getAttribute('data-view')!==view) target=el; } else if(LATE[h]){ view=LATE[h]; late=h; } }
  if(VIEWS.indexOf(view)<0) view='home';
  [].forEach.call(document.querySelectorAll('[data-view]'),function(v){ v.hidden=v.getAttribute('data-view')!==view; });
  [].forEach.call(document.querySelectorAll('[data-nav]'),function(a){ var on=a.getAttribute('data-nav')===view; a.classList.toggle('on',on);
    if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  document.title=(TITLES[view]||'')+' · '+BR;
  document.body.setAttribute('data-v',view);
  var tt=$('tb-title'); if(tt) tt.textContent=TITLES[view]||BR;
  if(view==='programs') renderPrograms(sub);
  if(view==='home') renderHome();
  if(view==='progress') renderProgress();
  if(view==='pro') renderPro();
  if(typeof closeSide==='function') closeSide();
  if(late) target=$(late);
  if(target) setTimeout(function(){ target.scrollIntoView({behavior:'auto',block:'start'}); },30);
  else window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
document.addEventListener('click',function(ev){   /* bấm lại mục đang mở vẫn cuộn lên đầu */
  var a=ev.target.closest&&ev.target.closest('a[href^="#"]'); if(!a) return;
  if(a.getAttribute('href')===location.hash){ ev.preventDefault(); route(); }
});

/* ======================= TIẾN ĐỘ & HOẠT ĐỘNG ======================= */
function doneDays(){ return jget(K('golf-done-days'),[]); }
function mphLog(){ return jget(K('golf-mph-log'),[]); }
function rounds(){ return jget(K('golf-rounds'),[]); }
function activityDates(){
  var d={}, st=progState();
  doneDays().forEach(function(x){ d[x]=1; });
  Object.keys(st.done).forEach(function(k){ if(st.done[k]) d[st.done[k]]=1; });
  rounds().forEach(function(r){ d[r.d]=1; });
  return d;
}
function streak(){
  var d=activityDates(), n=0, t=new Date();
  if(!d[today()]) t.setDate(t.getDate()-1);   /* hôm nay chưa tập vẫn giữ chuỗi */
  for(;;){ var k=t.toISOString().slice(0,10); if(!d[k]) break; n++; t.setDate(t.getDate()-1); }
  return n;
}
function sessionsDone(){ var st=progState(); return Object.keys(st.done).filter(function(k){return st.done[k];}).length+doneDays().length; }
function bestMph(){ var b=0; mphLog().forEach(function(x){ if(+x.v>b) b=+x.v; }); return b; }
function roundStats(){
  var R=rounds().slice().sort(function(a,b){ return a.d<b.d?1:-1; }), last=R.slice(0,5);
  function avg(f,list){ var xs=(list||last).map(f).filter(function(v){ return v!=null&&!isNaN(v); }); return xs.length?xs.reduce(function(a,b){return a+b;},0)/xs.length:null; }
  var norm=function(r){ return r.holes==9?r.score*2:r.score; };
  var diffs=R.slice(0,20).map(function(r){ return r.holes==9?(r.score-(r.par||36))*2:(r.score-(r.par||72)); }).sort(function(a,b){return a-b;});
  var nb=diffs.length>=20?8:diffs.length>=12?Math.round(diffs.length*.4):diffs.length>=3?Math.max(1,Math.round(diffs.length*.3)):0;
  var hcp=nb?Math.max(-5,Math.min(54,diffs.slice(0,nb).reduce(function(a,b){return a+b;},0)/nb*.96)):null;
  return {n:R.length,list:R,avg18:avg(norm),best:R.length?Math.min.apply(null,R.map(norm)):null,
    putts:avg(function(r){ return r.putts!=null&&r.putts!==''?(r.holes==9?r.putts*2:+r.putts):null; }),
    gir:avg(function(r){ return r.gir!=null&&r.gir!==''?100*r.gir/(r.holes||18):null; }),
    fir:avg(function(r){ return r.fir!=null&&r.fir!==''&&r.fwy?100*r.fir/r.fwy:null; }),hcp:hcp};
}

/* ======================= BUỔI TẬP CỦA CHƯƠNG TRÌNH → CHẾ ĐỘ TẬP TRUNG ======================= */
function drill(id){ for(var i=0;i<DRILLS.length;i++) if(DRILLS[i].id===id) return DRILLS[i]; return null; }
function itemName(it){ if(it.d){ var d=drill(it.d); return d?d.n:it.d; } return T(it.name||it.t); }
function focusFor(pr,s){
  var st=progState(), res=st.res[s.key]||{}, def=s.def;
  var warmSess=def.warm?SESSIONS.filter(function(x){return x.id===def.warm;})[0]:null;
  var o={id:'P:'+s.key, label:T(pr.title)+' · '+L('Tuần ','Week ')+s.week,
    meta:T(pr.title)+' · '+L('Tuần ','Week ')+s.week+' · '+T(def.t),
    warm:warmSess?warmSess.warm:[], warmId:def.warm||null, goal:T(def.focus||pr.tagline), day:'', dur:def.dur+"'",
    doneTitle:L('Hoàn thành: ','Completed: ')+T(def.t), metaDone:T(pr.title)+' · '+L('Hoàn thành','Done'),
    doneNote:L('Kết quả đã lưu vào mục Tiến bộ. Buổi tiếp theo đã sẵn sàng trên Trang chủ.','Results are saved to Progress. Your next session is ready on Home.'),
    ex:def.items.map(function(it,n){
      var name=itemName(it);
      return {name:name, rx:T(it.rx), kg:'', rest:it.rest||0, note:T(it.note), fig:it.f!=null?it.f:null, drill:it.d||null, sets:it.sets||1,
        metric:it.metric?{max:it.metric.max,label:T(it.metric.label),v:res[n]}:null,
        vids:[{t:L('Video mẫu trên YouTube: ','Example on YouTube: ')+name,u:YTS+encodeURIComponent(name+(it.d?' golf drill':' exercise golf'))}]};
    })};
  o.onDone=function(){ var S=progState(); S.done[s.key]=today(); progSave(S); if(typeof refreshStreak==='function') refreshStreak(); sideGo(); renderHome(); };
  XSESS[o.id]=o; return o;
}
function startSession(pid,key){
  var pr=progById(pid); if(!pr) return;
  if(pr.pro&&!isPro()){ paywall('program'); return; }
  var s=progSessions(pr).filter(function(x){ return x.key===key; })[0]||progNext(pr); if(!s) return;
  openFocus(focusFor(pr,s).id);
}
/* lưu kết quả đo trong chế độ tập trung */
document.addEventListener('change',function(ev){
  var i=ev.target; if(!i.matches||!i.matches('input[data-mkey]')) return;
  var m=/^P:(.+)#(\d+)$/.exec(i.getAttribute('data-mkey')); if(!m) return;
  var key=m[1], n=+m[2], v=i.value===''?null:Math.max(0,Math.min(+i.max||999,+i.value));
  var S=progState(); S.res[key]=S.res[key]||{}; S.res[key][n]=v;
  var pid=key.split(':')[0], pr=progById(pid), s=pr&&progSessions(pr).filter(function(x){return x.key===key;})[0], it=s&&s.def.items[n];
  if(it&&v!=null){ var hk=pid+'|'+(it.d||it.f||'t')+'|'+T(it.metric.label); S.hist[hk]=S.hist[hk]||[];
    S.hist[hk]=S.hist[hk].filter(function(x){ return x.s!==key; }); S.hist[hk].push({d:today(),v:v,max:it.metric.max,s:key,low:!!it.metric.low}); }
  progSave(S);
  var x=XSESS['P:'+key]; if(x&&x.ex[n]&&x.ex[n].metric) x.ex[n].metric.v=v;
});

/* ======================= TRANG CHỦ ======================= */
var TIPS=[
 _t('Tập short game chiếm 60% thời gian tập nếu bạn muốn giảm điểm nhanh nhất.','Spend 60% of practice on short game if you want to lower scores fastest.'),
 _t('Mỗi bóng trên sân tập: một mục tiêu, một gậy, một routine — như ngoài sân.','Every range ball: one target, one club, one routine — just like on course.'),
 _t('Putt 1–2 m quyết định điểm số nhiều hơn cú drive 250 m.','1–2 m putts decide your score more than a 250 m drive.'),
 _t('Nhắm giữa green thay vì nhắm cờ — ít bogey hơn, nhiều cơ hội par hơn.','Aim at the centre of the green, not the flag — fewer bogeys, more pars.'),
 _t('Ngủ đủ 7 giờ giúp phục hồi và học động tác mới nhanh hơn.','Sleeping 7 hours speeds up recovery and motor learning.'),
 _t('Quay video swing mỗi 2 tuần — bạn sẽ thấy điều cảm giác không nói ra được.','Film your swing every two weeks — video shows what feel can\'t.'),
 _t('Khởi động 5 phút trước khi đánh bóng giảm nguy cơ đau lưng rõ rệt.','A 5-minute warm-up before hitting balls greatly reduces back-pain risk.')];
function _t(vi,en){ return {vi:vi,en:en}; }
function greet(){ var h=new Date().getHours(); return h<11?L('Chào buổi sáng','Good morning'):h<18?L('Chào buổi chiều','Good afternoon'):L('Chào buổi tối','Good evening'); }
function proChip(){
  var s=proStatus();
  if(s.kind==='paid') return '<span class="chip pro">⭐ Pro</span>';
  if(s.kind==='trial') return '<a class="chip trial" href="#pro">⭐ '+L('Dùng thử Pro · còn '+s.days+' ngày','Pro trial · '+s.days+' days left')+'</a>';
  if(s.kind==='free') return '<a class="chip free" href="#pro">'+L('Gói miễn phí · Nâng cấp','Free plan · Upgrade')+'</a>';
  return '';
}
function progCard(pr,compact){
  var pct=progPct(pr), st=progState(), active=st.active===pr.id, lock=pr.pro&&!isPro();
  return '<a class="pcard'+(active?' active':'')+'" href="#p-'+pr.id+'" style="--pc:'+pr.color+'">'+
    '<div class="pc-top"><span class="pc-ic">'+pr.icon+'</span>'+(pr.pro?'<span class="badge-pro">PRO</span>':'<span class="badge-free">'+L('MIỄN PHÍ','FREE')+'</span>')+'</div>'+
    '<div class="pc-t">'+e(T(pr.title))+'</div><div class="pc-s">'+e(T(pr.tagline))+'</div>'+
    (compact?'':'<div class="pc-meta"><span>'+e(T(pr.level))+'</span><span>'+(pr.external?L('12 tháng','12 months'):pr.weeks+' '+L('tuần','weeks'))+'</span><span>'+pr.mins+' '+L('phút/buổi','min/session')+'</span></div>')+
    (active&&!pr.external?'<div class="pbar"><i style="width:'+pct+'%"></i></div><div class="pc-pct">'+pct+'% · '+L('đang theo','in progress')+'</div>':active?'<div class="pc-pct">'+L('Đang theo','In progress')+'</div>':'')+
    (lock?'<span class="pc-lock">🔒</span>':'')+'</a>';
}
function nextBlock(){
  var pid=progActive(), pr=pid&&progById(pid);
  if(!pr){
    var rec=progById((ME&&GOAL_PROG[ME.goal])||'found');
    return '<div class="hcard next"><div class="kick">'+L('Bắt đầu hành trình','Start your journey')+'</div>'+
      '<h3>'+L('Chọn chương trình phù hợp với bạn','Choose the right program for you')+'</h3>'+
      '<p>'+L('Mỗi chương trình là lộ trình từng tuần có mục tiêu đo được. Gợi ý cho bạn:','Each program is a week-by-week plan with measurable targets. Suggested for you:')+'</p>'+
      '<div class="pgrid one">'+progCard(rec)+'</div><div class="row"><a class="btn y" href="#p-'+rec.id+'">'+L('Xem chương trình','View program')+'</a><a class="btn ghost" href="#programs">'+L('Tất cả chương trình','All programs')+'</a></div></div>';
  }
  if(pr.external){   /* Driver 300: theo lịch tuần của chương trình */
    var t=(typeof DOW!=='undefined'&&typeof dw!=='undefined')?DOW[dw]:null;
    return '<div class="hcard next" style="--pc:'+pr.color+'"><div class="kick">'+pr.icon+' '+e(T(pr.title))+' · '+L('hôm nay','today')+'</div>'+
      '<h3>'+e(t?t.name:'')+'</h3><div class="row">'+
      (t&&t.s?'<button class="btn y" type="button" data-start="'+t.s+'">▶ '+L('Bắt đầu buổi tập','Start session')+'</button>':'')+
      '<a class="btn ghost" href="#driver">'+L('Mở chương trình','Open program')+'</a></div></div>';
  }
  var nx=progNext(pr), pct=progPct(pr);
  if(!nx) return '<div class="hcard next" style="--pc:'+pr.color+'"><div class="kick">'+pr.icon+' '+e(T(pr.title))+'</div><h3>🏆 '+L('Bạn đã hoàn thành chương trình!','You finished the program!')+'</h3>'+
    '<p>'+L('Xem kết quả ở mục Tiến bộ hoặc bắt đầu chương trình tiếp theo.','See your results in Progress or start your next program.')+'</p><div class="row"><a class="btn y" href="#programs">'+L('Chương trình tiếp theo','Next program')+'</a><a class="btn ghost" href="#progress">'+L('Xem tiến bộ','View progress')+'</a></div></div>';
  var d=nx.def;
  return '<div class="hcard next" style="--pc:'+pr.color+'"><div class="kick">'+pr.icon+' '+e(T(pr.title))+' · '+L('Tuần ','Week ')+nx.week+'/'+pr.weeks+'</div>'+
    '<h3>'+e(T(d.t))+'</h3><p class="focus">'+e(T(d.focus||pr.tagline))+'</p>'+
    '<ul class="items">'+d.items.map(function(it){ return '<li><b>'+e(itemName(it))+'</b><span>'+e(T(it.rx))+'</span></li>'; }).join('')+'</ul>'+
    '<div class="pbar"><i style="width:'+pct+'%"></i></div><div class="row">'+
    '<button class="btn y" type="button" data-psess="'+pr.id+'|'+nx.key+'">▶ '+L('Bắt đầu buổi tập','Start session')+' · '+d.dur+"'"+'</button>'+
    '<a class="btn ghost" href="#p-'+pr.id+'">'+L('Xem lộ trình','View plan')+'</a></div></div>';
}
function renderHome(){
  var host=$('home-host'); if(!host) return;
  var name=ME?ME.name:'', rs=roundStats(), ad=activityDates(), days=[];
  for(var i=13;i>=0;i--){ var t=new Date(); t.setDate(t.getDate()-i); var k=t.toISOString().slice(0,10); days.push({k:k,on:!!ad[k],d:t}); }
  var tip=TIPS[new Date().getDate()%TIPS.length];
  host.innerHTML='<div class="hero2"><div><div class="kick">'+fmtDate(new Date(),{weekday:'long',day:'numeric',month:'long'})+'</div>'+
      '<h1 class="h1s">'+greet()+(name?', '+e(name):'')+' 👋</h1>'+proChip()+'</div>'+
      (ME?'':'<button class="btn y" type="button" data-ob="new">＋ '+L('Tạo hồ sơ (2 phút)','Create profile (2 min)')+'</button>')+'</div>'+
    nextBlock()+
    '<div class="kgrid">'+
      '<div class="k"><b>'+sessionsDone()+'</b><span>'+L('Buổi đã tập','Sessions done')+'</span></div>'+
      '<div class="k"><b>'+streak()+'</b><span>'+L('Ngày liên tiếp','Day streak')+'</span></div>'+
      '<div class="k"><b>'+(bestMph()?numL(bestMph()):'—')+'</b><span>'+L('mph cao nhất','Best mph')+'</span></div>'+
      '<div class="k"><b>'+(rs.avg18!=null?Math.round(rs.avg18):'—')+'</b><span>'+L('Điểm TB (5 vòng)','Avg score (5 rds)')+'</span></div>'+
    '</div>'+
    '<div class="hcard"><div class="kick">'+L('14 ngày qua','Last 14 days')+'</div><div class="acts">'+days.map(function(x){
      return '<span class="'+(x.on?'on':'')+(x.k===today()?' now':'')+'" title="'+fmtDate(x.d)+'">'+x.d.getDate()+'</span>'; }).join('')+'</div></div>'+
    '<div class="qgrid">'+
      '<a href="#video"><span>🎥</span>'+L('Phân tích swing','Analyse my swing')+'</a>'+
      '<a href="#rounds"><span>⛳</span>'+L('Ghi vòng golf','Log a round')+'</a>'+
      '<a href="#drills"><span>📐</span>'+L('Thư viện động tác','Drill library')+'</a>'+
      '<a href="#theluc"><span>🏋️</span>'+L('Thể lực golf','Golf fitness')+'</a>'+
    '</div>'+
    '<div class="tip">💡 <b>'+L('Mẹo hôm nay','Tip of the day')+':</b> '+e(T(tip))+'</div>'+
    (proStatus().kind==='free'?'<a class="upsell" href="#pro"><b>⭐ '+L('Mở khóa Golf Academy Pro','Unlock Golf Academy Pro')+'</b><span>'+L('Mọi chương trình · video không giới hạn · báo cáo cá nhân','Every program · unlimited video · personal reports')+'</span></a>':'');
}

/* ======================= CHƯƠNG TRÌNH ======================= */
function renderPrograms(sub){
  var host=$('prog-host'); if(!host) return;
  var pr=sub&&progById(sub);
  if(!pr){
    host.innerHTML='<p class="sub">'+L('Chọn một chương trình — ứng dụng dẫn bạn từng buổi, ghi kết quả và cho thấy tiến bộ.','Pick a program — the app guides you session by session, records results and shows your progress.')+'</p>'+
      '<div class="pgrid">'+PROGRAMS.map(function(p){ return progCard(p); }).join('')+'</div>';
    return;
  }
  var st=progState(), active=st.active===pr.id, lock=pr.pro&&!isPro(), L2=progSessions(pr);
  var h='<a class="back" href="#programs">← '+L('Tất cả chương trình','All programs')+'</a>'+
    '<div class="pd-head" style="--pc:'+pr.color+'"><span class="pc-ic big">'+pr.icon+'</span><div><div class="kick">'+e(T(pr.level))+' · '+(pr.external?L('12 tháng','12 months'):pr.weeks+' '+L('tuần','weeks')+' · '+pr.per+' '+L('buổi/tuần','sessions/week'))+' · '+pr.mins+' '+L('phút','min')+
      (pr.pro?' · <span class="badge-pro">PRO</span>':' · <span class="badge-free">'+L('MIỄN PHÍ','FREE')+'</span>')+'</div>'+
      '<h2 class="pd-t">'+e(T(pr.title))+'</h2><p>'+e(T(pr.desc))+'</p></div></div>'+
    '<div class="pd-out">'+pr.outcomes.map(function(o){ return '<div>✓ '+e(T(o))+'</div>'; }).join('')+'</div><div class="row">';
  if(pr.external) h+=(lock?'<a class="btn y" href="#pro">🔒 '+L('Mở khóa với Pro','Unlock with Pro')+'</a>':'')+
      '<a class="btn '+(lock?'ghost':'y')+'" href="#driver">'+L('Mở chương trình','Open program')+'</a>'+(active?'':'<button class="btn ghost" type="button" data-pstart="'+pr.id+'">'+L('Đặt làm chương trình chính','Make it my main program')+'</button>');
  else if(lock) h+='<a class="btn y" href="#pro">🔒 '+L('Mở khóa với Pro','Unlock with Pro')+'</a>';
  else if(!active) h+='<button class="btn y" type="button" data-pstart="'+pr.id+'">▶ '+L('Bắt đầu chương trình','Start program')+'</button>';
  else { var nx=progNext(pr); if(nx) h+='<button class="btn y" type="button" data-psess="'+pr.id+'|'+nx.key+'">▶ '+L('Buổi tiếp theo','Next session')+'</button>'; }
  h+='</div>';
  if(!pr.external){
    var weeks={}; L2.forEach(function(x){ (weeks[x.week]=weeks[x.week]||[]).push(x); });
    h+='<div class="wk-list">'+Object.keys(weeks).map(function(w){
      return '<div class="wk"><div class="wk-h">'+L('Tuần ','Week ')+w+'</div>'+weeks[w].map(function(x){
        var dn=st.done[x.key], d=x.def;
        return '<div class="ss'+(dn?' done':'')+'"><div class="ss-i">'+(dn?'✓':(x.idx+1))+'</div><div class="ss-b"><b>'+e(T(d.t))+'</b>'+
          '<span>'+d.dur+"' · "+d.items.map(function(it){ return e(itemName(it)); }).join(' · ')+'</span></div>'+
          (lock?'<span class="ss-l">🔒</span>':'<button class="btn sm'+(dn?' ghost':'')+'" type="button" data-psess="'+pr.id+'|'+x.key+'">'+(dn?L('Tập lại','Redo'):'▶')+'</button>')+'</div>';
      }).join('')+'</div>';
    }).join('')+'</div>';
  }
  host.innerHTML=h;
}
document.addEventListener('click',function(ev){
  var b=ev.target.closest&&ev.target.closest('[data-psess],[data-pstart]'); if(!b) return;
  if(b.hasAttribute('data-pstart')){ var id=b.getAttribute('data-pstart'), pr=progById(id);
    if(pr.pro&&!isPro()&&!pr.external){ paywall('program'); return; }
    progStart(id); sideGo(); if(pr.external){ location.hash='driver'; setTimeout(function(){ location.reload(); },50); } else renderPrograms(id);
    Cloud&&Cloud.toast&&Cloud.toast('✓ '+L('Đã đặt ','Set ')+T(pr.title)+L(' làm chương trình chính',' as your main program')); return; }
  var p=b.getAttribute('data-psess').split('|'); startSession(p[0],p[1]);
});

/* ======================= TIẾN BỘ: VÒNG GOLF ======================= */
function renderProgress(){
  var host=$('progress-host'); if(!host) return;
  var rs=roundStats(), st=progState();
  var k=function(v,l,sfx){ return '<div class="k"><b>'+(v==null?'—':v)+(v!=null&&sfx?'<small>'+sfx+'</small>':'')+'</b><span>'+l+'</span></div>'; };
  var hist=Object.keys(st.hist).map(function(hk){ var a=st.hist[hk].slice().sort(function(x,y){return x.d<y.d?-1:1;}), pts=hk.split('|');
    var pr=progById(pts[0]), it=pts[1], nm=isNaN(+it)&&it!=='t'?(drill(it)?drill(it).n:it):it==='t'?'':'';
    return {pr:pr,name:nm,label:pts.slice(2).join('|'),a:a};}).filter(function(x){ return x.a.length; });
  host.innerHTML='<div class="kgrid">'+k(sessionsDone(),L('Buổi đã tập','Sessions done'))+k(streak(),L('Ngày liên tiếp','Day streak'))+
      k(bestMph()?numL(bestMph()):null,L('mph cao nhất','Best mph'))+k(rs.hcp!=null?numL(rs.hcp.toFixed(1)):null,L('Handicap ước tính','Est. handicap'))+'</div>'+
    '<section class="card2" id="rounds"><h3>⛳ '+L('Vòng golf','Rounds')+'</h3>'+
      '<div class="kgrid sm">'+k(rs.avg18!=null?Math.round(rs.avg18):null,L('Điểm TB 18 hố (5 vòng)','Avg 18-hole score (5)'))+k(rs.best,L('Tốt nhất','Best'))+
        k(rs.putts!=null?numL(rs.putts.toFixed(1)):null,L('Putt / vòng','Putts / round'))+k(rs.gir!=null?Math.round(rs.gir):null,'GIR','%')+k(rs.fir!=null?Math.round(rs.fir):null,L('Fairway','Fairways'),'%')+'</div>'+
      '<form class="rform" id="rform"><div class="rgrid">'+
        '<label>'+L('Ngày','Date')+'<input type="date" name="d" value="'+today()+'" required></label>'+
        '<label>'+L('Sân','Course')+'<input type="text" name="c" maxlength="60" placeholder="'+L('Tên sân','Course name')+'"></label>'+
        '<label>'+L('Số hố','Holes')+'<select name="holes"><option value="18">18</option><option value="9">9</option></select></label>'+
        '<label>Par<input type="number" name="par" value="72" min="27" max="80"></label>'+
        '<label>'+L('Điểm (tổng gậy)','Score (strokes)')+'<input type="number" name="score" min="27" max="200" required></label>'+
        '<label>'+L('Số putt','Putts')+'<input type="number" name="putts" min="0" max="80"></label>'+
        '<label>'+L('Fairway trúng / số hố tee','Fairways hit / tee holes')+'<span class="two"><input type="number" name="fir" min="0" max="18"><input type="number" name="fwy" value="14" min="1" max="18"></span></label>'+
        '<label>GIR<input type="number" name="gir" min="0" max="18"></label>'+
        '<label>'+L('Gậy phạt','Penalty strokes')+'<input type="number" name="pen" min="0" max="30"></label>'+
      '</div><button class="btn y" type="submit">＋ '+L('Lưu vòng golf','Save round')+'</button></form>'+
      (rs.n>1?'<canvas id="rchart" width="800" height="200" role="img" aria-label="'+L('Biểu đồ điểm các vòng','Score chart')+'"></canvas>':'')+
      '<div class="rlist">'+rs.list.slice(0,12).map(function(r,i){ return '<div class="ri"><b>'+r.score+'</b><span>'+fmtDate(r.d)+' · '+e(r.c||L('Sân','Course'))+' · '+r.holes+L(' hố',' holes')+
        (r.putts!=null&&r.putts!==''?' · '+r.putts+' putt':'')+(r.gir!=null&&r.gir!==''?' · GIR '+r.gir:'')+'</span><button type="button" class="x" data-rdel="'+r.id+'" aria-label="'+L('Xóa','Delete')+'">✕</button></div>'; }).join('')+'</div>'+
      '<p class="tbl-note" style="color:#7A8780">'+L('Handicap ước tính dựa trên chênh lệch điểm so với par (chưa tính Course Rating / Slope) — chỉ để theo dõi xu hướng.','Estimated handicap uses score minus par (no Course Rating / Slope) — for tracking trends only.')+'</p></section>'+
    (hist.length?'<section class="card2"><h3>🎯 '+L('Kết quả bài tập','Drill results')+'</h3><div class="mlist">'+hist.map(function(x){
      var last=x.a[x.a.length-1], best=x.a.reduce(function(b,y){ return x.a[0].low?Math.min(b,y.v):Math.max(b,y.v); },x.a[0].v);
      return '<div class="mi"><div><b>'+e(x.name||x.label)+'</b><span>'+e(x.pr?T(x.pr.title):'')+(x.name?' · '+e(x.label):'')+'</span></div>'+
        '<div class="spark">'+x.a.slice(-10).map(function(y){ var r=y.max?y.v/y.max:0; if(y.low) r=1-r; return '<i style="height:'+Math.max(6,Math.round(r*100))+'%" title="'+y.v+'/'+y.max+'"></i>'; }).join('')+'</div>'+
        '<div class="mv">'+last.v+'<small>/'+last.max+'</small><span>'+L('tốt nhất ','best ')+best+'</span></div></div>'; }).join('')+'</div></section>':'');
  var f=$('rform'); if(f) f.addEventListener('submit',function(ev){ ev.preventDefault(); var fd=new FormData(f), r={id:'r'+Date.now().toString(36)};
    ['d','c','holes','par','score','putts','fir','fwy','gir','pen'].forEach(function(n){ var v=fd.get(n); r[n]=(n==='d'||n==='c')?v:(v===''||v==null?null:+v); });
    if(!r.score){ return; } var R=rounds(); R.push(r); jset(K('golf-rounds'),R); renderProgress(); Cloud&&Cloud.toast&&Cloud.toast('✓ '+L('Đã lưu vòng golf','Round saved')); });
  drawRounds(rs.list);
  var nk=$('nhatky'); if(nk&&host.nextElementSibling!==nk) host.parentNode.insertBefore(nk,host.nextSibling);
}
function drawRounds(list){
  var c=$('rchart'); if(!c||list.length<2) return; var g=c.getContext('2d'), W=c.width, H=c.height, pad=34;
  var pts=list.slice(0,20).reverse().map(function(r){ return r.holes==9?r.score*2:r.score; });
  var mn=Math.min.apply(null,pts)-3, mx=Math.max.apply(null,pts)+3;
  g.clearRect(0,0,W,H); g.strokeStyle='#E2DCC8'; g.fillStyle='#7A8780'; g.font='12px sans-serif';
  for(var y=0;y<=4;y++){ var v=mn+(mx-mn)*y/4, yy=H-pad-(H-2*pad)*y/4; g.beginPath(); g.moveTo(pad,yy); g.lineTo(W-10,yy); g.stroke(); g.fillText(Math.round(v),4,yy+4); }
  g.strokeStyle='#17553F'; g.lineWidth=3; g.beginPath();
  pts.forEach(function(v,i){ var x=pad+(W-pad-20)*i/Math.max(1,pts.length-1), yy=H-pad-(H-2*pad)*(v-mn)/(mx-mn); if(i) g.lineTo(x,yy); else g.moveTo(x,yy); }); g.stroke();
  g.fillStyle='#F2C230'; pts.forEach(function(v,i){ var x=pad+(W-pad-20)*i/Math.max(1,pts.length-1), yy=H-pad-(H-2*pad)*(v-mn)/(mx-mn); g.beginPath(); g.arc(x,yy,4,0,7); g.fill(); });
}
document.addEventListener('click',function(ev){ var b=ev.target.closest&&ev.target.closest('[data-rdel]'); if(!b) return;
  if(!confirm(L('Xóa vòng golf này?','Delete this round?'))) return;
  jset(K('golf-rounds'),rounds().filter(function(r){ return r.id!==b.getAttribute('data-rdel'); })); renderProgress(); });

/* ======================= GÓI PRO ======================= */
function renderPro(){
  var host=$('pro-host'); if(!host) return;
  var s=proStatus(), P=APP_CFG.price[LANG], code=customerCode(), em=window.Cloud&&Cloud.email&&Cloud.email();
  var rows=[[L('Chương trình Nền tảng & Linh hoạt','Foundations & Mobility programs'),1,1],[L('Thư viện động tác có hình động','Animated drill library'),1,1],
    [L('Nhật ký mph, vòng golf, tiến bộ','mph log, rounds & progress'),1,1],[L('Lưu đám mây & đồng bộ thiết bị','Cloud save & device sync'),1,1],
    [L('Phân tích video swing','Swing video analysis'),APP_CFG.freeVideoPerMonth+L(' lượt/tháng','/month'),L('Không giới hạn','Unlimited')],
    [L('Short game, Putting Lab, Phá 90','Short Game, Putting Lab, Break 90'),0,1],[L('Driver 300 Yard trọn 12 tháng','Driver 300 Yard, full 12 months'),0,1],
    [L('Báo cáo chi tiết & fitting driver','Detailed report & driver fitting'),0,1],[L('Lưu chuyển động của bạn làm mẫu','Save your own motion as a template'),0,1]];
  var cell=function(v){ return v===1?'<span class="y">✓</span>':v===0?'<span class="n">—</span>':'<span>'+e(v)+'</span>'; };
  var btn=function(plan,label){ var u=checkoutUrl(plan); return u?'<a class="btn y" href="'+e(u)+'" target="_blank" rel="noopener">'+label+'</a>':''; };
  var bankOn=APP_CFG.bank.bin&&APP_CFG.bank.account, anyPay=APP_CFG.checkout.monthly||APP_CFG.checkout.yearly||bankOn;
  var h='<div class="pro-hero"><div class="kick">'+BR+' Pro</div><h2>'+L('Tập như có huấn luyện viên riêng','Train like you have a personal coach')+'</h2>'+
    '<p>'+(s.kind==='paid'?L('✓ Bạn đang dùng Pro đến ','✓ You have Pro until ')+fmtDate(s.until):s.kind==='trial'?L('Bạn đang dùng thử Pro — còn '+s.days+' ngày.','You are on a Pro trial — '+s.days+' days left.'):s.kind==='open'?L('Mọi tính năng đang mở miễn phí.','All features are currently free.'):L('Bạn đang dùng gói miễn phí.','You are on the free plan.'))+'</p></div>'+
    '<div class="plans">'+
      '<div class="plan-c"><div class="pl-n">'+L('Hàng tháng','Monthly')+'</div><div class="pl-p">'+P.month+'<small>'+L('/tháng','/month')+'</small></div><div class="pl-s">'+L('Hủy bất cứ lúc nào','Cancel anytime')+'</div>'+btn('monthly',L('Đăng ký tháng','Subscribe monthly'))+'</div>'+
      '<div class="plan-c best"><span class="ribbon">'+P.save+'</span><div class="pl-n">'+L('Hàng năm','Yearly')+'</div><div class="pl-p">'+P.year+'<small>'+L('/năm','/year')+'</small></div><div class="pl-s">'+P.yearPerMonth+'</div>'+btn('yearly',L('Đăng ký năm','Subscribe yearly'))+'</div>'+
    '</div>';
  if(bankOn){
    var note='GA '+(code||'');
    h+='<div class="card2 bank"><h3>🇻🇳 '+L('Chuyển khoản ngân hàng (VietQR)','Bank transfer in Vietnam (VietQR)')+'</h3>'+
      (em?'':'<div class="alert">'+L('Hãy <a href="#dongbo">thêm email vào tài khoản</a> trước khi chuyển khoản để giữ quyền Pro trên mọi thiết bị.','Please <a href="#dongbo">add an email to your account</a> before paying so Pro follows you to every device.')+'</div>')+
      '<div class="qrs"><figure><img loading="lazy" src="'+e(vietQR(APP_CFG.bank.month,note))+'" alt="VietQR"><figcaption>'+L('Gói tháng','Monthly')+' · '+P.month+'</figcaption></figure>'+
      '<figure><img loading="lazy" src="'+e(vietQR(APP_CFG.bank.year,note))+'" alt="VietQR"><figcaption>'+L('Gói năm','Yearly')+' · '+P.year+'</figcaption></figure></div>'+
      '<p>'+L('Nội dung chuyển khoản: ','Transfer note: ')+'<b class="code">'+e(note)+'</b>. '+L('Pro được kích hoạt trong 24 giờ sau khi nhận tiền.','Pro is activated within 24 hours of payment.')+'</p></div>';
  }
  if(!anyPay) h+='<div class="alert i">'+L('Thanh toán đang được thiết lập. ','Payments are being set up. ')+(APP_CFG.support?L('Liên hệ ','Contact ')+'<a href="mailto:'+e(APP_CFG.support)+'">'+e(APP_CFG.support)+'</a>':L('Trong lúc chờ, bạn vẫn dùng thử Pro đầy đủ.','Meanwhile you can use the full Pro trial.'))+'</div>';
  h+='<div class="card2"><h3>'+L('So sánh gói','Compare plans')+'</h3><table class="cmp"><tr><th></th><th>'+L('Miễn phí','Free')+'</th><th>Pro</th></tr>'+
    rows.map(function(r){ return '<tr><td>'+r[0]+'</td><td>'+cell(r[1])+'</td><td>'+cell(r[2])+'</td></tr>'; }).join('')+'</table></div>'+
    '<div class="card2 faq"><h3>'+L('Câu hỏi thường gặp','FAQ')+'</h3>'+
      faq(L('Hủy gói thế nào?','How do I cancel?'),L('Gói đăng ký qua thẻ: hủy trong email hóa đơn hoặc trang quản lý đơn hàng, vẫn dùng Pro đến hết kỳ đã trả. Gói chuyển khoản không tự gia hạn.','Card subscriptions: cancel from your receipt email or order page — Pro stays active until the end of the paid period. Bank-transfer plans never auto-renew.'))+
      faq(L('Dùng trên mấy thiết bị?','How many devices?'),L('Không giới hạn — đăng nhập cùng email trên điện thoại, máy tính bảng, máy tính.','Unlimited — sign in with the same email on your phone, tablet and computer.'))+
      faq(L('Có hoàn tiền không?','Do you offer refunds?'),L('Hoàn tiền 100% trong 7 ngày đầu nếu bạn không hài lòng.','Full refund within the first 7 days if you are not satisfied.'))+
      faq(L('Video của tôi có bị tải lên máy chủ?','Are my videos uploaded?'),L('Không. Phân tích video chạy ngay trên thiết bị của bạn.','No. Video analysis runs entirely on your device.'))+
    '</div>'+(code?'<p class="tbl-note" style="color:#8FB3A3">'+L('Mã khách hàng: ','Customer code: ')+'<b>'+code+'</b>'+(em?' · '+e(em):'')+'</p>':'');
  host.innerHTML=h;
}
function faq(q,a){ return '<details><summary>'+q+'</summary><p>'+a+'</p></details>'; }

/* ======================= MENU & NÚT "HÔM NAY" ======================= */
function sideGo(){
  var go=$('side-go'), tb=$('tb-today'); if(!go||!tb) return;
  var fresh=function(el){ var n=el.cloneNode(true); el.parentNode.replaceChild(n,el); return n; };
  go=fresh(go); tb=fresh(tb);
  var pid=progActive(), pr=pid&&progById(pid), run;
  if(!pr){ go.className='side-go'; go.innerHTML='📚 '+L('Chọn chương trình','Choose a program')+'<small>'+L('Bắt đầu lộ trình của bạn','Start your plan')+'</small>';
    tb.textContent=L('Chương trình','Programs'); run=function(){ location.hash='programs'; }; }
  else if(pr.external){   /* Driver 300: theo lịch trong tuần */
    var t=(typeof DOW!=='undefined'&&typeof dw!=='undefined')?DOW[dw]:null;
    if(t&&t.s){ go.className='side-go'; go.innerHTML='▶ '+L('Vào Buổi ','Start session ')+t.s+L(' hôm nay',' today')+'<small>'+e(t.name)+'</small>'; tb.textContent='▶ '+L('Buổi ','Session ')+t.s;
      run=function(){ if(typeof closeSide==='function') closeSide(); openFocus(t.s); }; }
    else { go.className='side-go rest'; go.innerHTML=e(t?t.name:'')+'<small>'+L('Hôm nay','Today')+'</small>'; tb.textContent=L('Hôm nay','Today');
      run=function(){ location.hash='driver'; }; }
  } else {
    var nx=progNext(pr);
    if(nx){ go.className='side-go'; go.innerHTML='▶ '+L('Buổi tiếp theo','Next session')+'<small>'+e(T(nx.def.t))+'</small>'; tb.textContent='▶ '+L('Tập','Train');
      run=function(){ if(typeof closeSide==='function') closeSide(); startSession(pr.id,nx.key); }; }
    else { go.className='side-go rest'; go.innerHTML=L('Hoàn thành chương trình 🏆','Program complete 🏆')+'<small>'+e(T(pr.title))+'</small>';
      tb.textContent=L('Chương trình','Programs'); run=function(){ location.hash='programs'; }; }
  }
  go.addEventListener('click',run); tb.addEventListener('click',run);
}
window.sideGo=sideGo;

/* ======================= KHỞI ĐỘNG ======================= */
(function migrate(){   /* người dùng cũ đã có hồ sơ → giữ chương trình Driver 300 */
  var s=progState(); if(!s.active&&!s.migrated&&ME){ s.active='driver300'; s.started.driver300=ME.created||today(); } s.migrated=1; progSave(s);
})();
sideGo();
applyLocks();
if(window.Cloud&&Cloud.on) Cloud.on(function(){ applyLocks(); var v=document.querySelector('[data-view]:not([hidden])'); if(v&&v.getAttribute('data-view')==='pro') renderPro(); if(v&&v.getAttribute('data-view')==='home') renderHome(); });
route();
document.documentElement.classList.add('ready');
window.Academy={route:route,renderHome:renderHome,startSession:startSession,roundStats:roundStats};
})();
