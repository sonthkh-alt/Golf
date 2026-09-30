/* ===== Đồng bộ đám mây TỰ ĐỘNG (Supabase) — Giáo án 300 Yard =====
   · Chạy TRƯỚC ứng dụng: ghi nhận mọi thay đổi localStorage có tiền tố "golf-".
   · Mọi thiết bị mở trang dùng CHUNG một kho dữ liệu (SPACE) — không cần mã, không cần đăng nhập:
     tạo/sửa hồ sơ ở đâu cũng tự lưu lên, mở trang ở máy khác là có.
   · Mỗi khóa mang dấu thời gian sửa; khi gộp, bản mới hơn thắng.
     Riêng danh sách hồ sơ: gộp theo từng người (id), tôn trọng danh sách đã xóa.
   · Hồ sơ đang chọn (golf-profile-active) là của riêng từng máy.
   · Máy chủ: bảng golf_sync + 2 hàm golf_pull / golf_push (xem supabase.sql). */
(function(){
'use strict';
var T=window.GOLF_SYNC_CFG;   /* chỉ dùng khi thử nghiệm: trỏ sang máy chủ giả lập */
var CFG=T||{url:'https://pzojrhwtoxwcsrkucwti.supabase.co',key:'sb_publishable_TWvl8ePnnfWRdEUSE3f2Kg_dZOHRpIC'};
var SPACE=(T&&T.space)||'GOLF300YARDSHAREDSPACE2026';   /* kho chung của trang */
/* mở từ tệp cục bộ / localhost (đang phát triển, chạy test) thì KHÔNG chạm vào kho thật */
var DEV=!T&&(location.protocol==='file:'||/^(localhost|127\.0\.0\.1)$/.test(location.hostname));

var ls; try{ ls=window.localStorage; ls.getItem('x'); }catch(e){ return; }
var PKEY='golf-profiles', DKEY='golf-del-ids';
var LOCAL={'golf-sync-cfg':1,'golf-sync-code':1,'golf-sync-meta':1,'golf-sync-last':1,'golf-sync-off':1,'golf-va-pending':1,'golf-profile-active':1};
var rawSet=Storage.prototype.setItem, rawRem=Storage.prototype.removeItem;
function g(k){try{return ls.getItem(k);}catch(e){return null;}}
function s(k,v){try{rawSet.call(ls,k,v);return true;}catch(e){return false;}}
function r(k){try{rawRem.call(ls,k);}catch(e){}}
function syncable(k){return typeof k==='string'&&k.indexOf('golf-')===0&&!LOCAL[k];}
function jp(x,d){try{var v=JSON.parse(x);return v==null?d:v;}catch(e){return d;}}
function meta(){return jp(g('golf-sync-meta'),{});}
function setMeta(m){s('golf-sync-meta',JSON.stringify(m));}

/* ---------- ghi nhận thay đổi ---------- */
var suppress=false;
function touch(k){ if(suppress) return; var m=meta(); m[k]=Date.now(); setMeta(m); schedule(); }
Storage.prototype.setItem=function(k,v){
  var before=(this===ls&&syncable(k))?g(k):undefined;
  rawSet.call(this,k,v);
  if(before!==undefined&&before!==String(v)) touch(k);
};
Storage.prototype.removeItem=function(k){
  var had=(this===ls&&syncable(k))?g(k)!==null:false;
  rawRem.call(this,k);
  if(had) touch(k);
};

/* ---------- cấu hình ---------- */
function cfg(){ return CFG; }
function code(){ return SPACE; }
function ready(){ return !DEV&&g('golf-sync-off')!=='1'; }

/* ---------- ảnh chụp + gộp ---------- */
function snapshot(){
  var m=meta(), o={}, i, k;
  for(i=0;i<ls.length;i++){ k=ls.key(i); if(syncable(k)) o[k]={v:g(k),t:m[k]||0}; }
  for(k in m) if(syncable(k)&&!(k in o)) o[k]={v:null,t:m[k]};
  return o;
}
function arr(e){ return e&&e.v?jp(e.v,[]):[]; }
function merge(a,b){
  var o={}, k, ks={};
  for(k in a) ks[k]=1; for(k in b) ks[k]=1;
  for(k in ks){ var x=a[k], y=b[k]; o[k]=!x?y:!y?x:(y.t>x.t?y:x); }
  /* id hồ sơ đã xóa: hợp hai phía */
  var del=arr(a[DKEY]).concat(arr(b[DKEY])).filter(function(v,i,s){return s.indexOf(v)===i;});
  if(del.length){ var td=Math.max((a[DKEY]||{}).t||0,(b[DKEY]||{}).t||0); o[DKEY]={v:JSON.stringify(del),t:td}; }
  /* hồ sơ: gộp theo id, cùng id thì lấy phía có danh sách mới hơn */
  if(a[PKEY]||b[PKEY]){
    var ta=(a[PKEY]||{}).t||0, tb=(b[PKEY]||{}).t||0, nw=tb>ta?arr(b[PKEY]):arr(a[PKEY]), od=tb>ta?arr(a[PKEY]):arr(b[PKEY]);
    var seen={}, list=[];
    nw.concat(od).forEach(function(p){ if(p&&p.id&&!seen[p.id]&&del.indexOf(p.id)<0){ seen[p.id]=1; list.push(p); } });
    var v=JSON.stringify(list), win=o[PKEY];
    o[PKEY]=(win&&win.v===v)?win:{v:v,t:Math.max(ta,tb)+1};
  }
  return o;
}
function sameMap(a,b){ var k; for(k in a){ if(!b[k]||b[k].v!==a[k].v||b[k].t!==a[k].t) return false; } for(k in b) if(!a[k]) return false; return true; }
function apply(m){
  var cur=snapshot(), mt=meta(), changed=false, k;
  suppress=true;
  for(k in m){ var e=m[k]; if(!syncable(k)) continue;
    var now=cur[k]?cur[k].v:null;
    if(now!==e.v){ changed=true; if(e.v===null) r(k); else s(k,e.v); }
    mt[k]=e.t; }
  suppress=false; setMeta(mt);
  return changed;
}

/* ---------- gọi máy chủ ---------- */
function rpc(fn,body){
  var c=cfg(), h={'Content-Type':'application/json','apikey':c.key};
  if(/^eyJ/.test(c.key)) h.Authorization='Bearer '+c.key;   /* anon key kiểu JWT cũ */
  return fetch(c.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:h,body:JSON.stringify(body)}).then(function(res){
    return res.text().then(function(t){
      if(!res.ok){ var m=jp(t,{}); throw new Error((m.message||m.hint||t||('HTTP '+res.status)).slice(0,200)); }
      return jp(t,null);
    });
  });
}

/* ---------- vòng đồng bộ: kéo → gộp → ghi cục bộ → đẩy (thử lại khi xung đột) ---------- */
var busy=null, again=false, lastErr='';
function cycle(){
  if(!ready()) return Promise.resolve(false);
  if(busy){ again=true; return busy; }
  var changedLocal=false, tries=0;
  function round(){
    tries++;
    return rpc('golf_pull',{p_code:code()}).then(function(res){
      var rev=res&&res.rev||0, remote=(res&&res.data)||{};
      var m=merge(snapshot(),remote);
      if(apply(m)) changedLocal=true;
      if(sameMap(m,remote)) return true;
      return rpc('golf_push',{p_code:code(),p_data:m,p_rev:rev}).then(function(nr){
        if(nr===-1&&tries<4) return round();
        if(nr===-1) throw new Error('Xung đột ghi liên tục — thử lại sau');
        return true;
      });
    });
  }
  setStatus('run');
  busy=round().then(function(){
    lastErr=''; s('golf-sync-last',String(Date.now())); setStatus('ok'); return changedLocal;
  },function(e){ lastErr=e&&e.message||String(e); setStatus('err'); return changedLocal; })
  .then(function(ch){ busy=null; if(again){ again=false; return cycle().then(function(c2){return ch||c2;}); } return ch; });
  return busy;
}
var tmr=null;
function schedule(){ if(!ready()) return; clearTimeout(tmr); tmr=setTimeout(function(){ cycle().then(afterPull); },1500); setStatus('dirty'); }

/* có dữ liệu mới từ máy khác → tải lại trang (hoặc hỏi nếu đang dở tay) */
function modalOpen(){ var a=document.getElementById('ob'), b=document.getElementById('focus');
  return (a&&a.classList.contains('on'))||(b&&b.classList.contains('on')); }
function afterPull(changed){
  if(!changed) return;
  if(!modalOpen()){ location.reload(); return; }
  toast('☁ Có dữ liệu mới từ thiết bị khác','Tải lại',function(){ location.reload(); });
}

/* ---------- giao diện ---------- */
var CSS='.sync{background:var(--paper,#F5F2E8);color:var(--ink,#17241E);border-radius:16px;padding:18px 18px 16px;margin-top:14px}'+
'.sync h3{font-family:Archivo,sans-serif;font-weight:900;font-size:1.02rem;color:var(--green-deep,#0F3D2E);margin:0 0 4px}'+
'.sync p{font-size:.8rem;line-height:1.55;color:#3C4A42;margin:4px 0 0}'+
'.sync .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px}'+
'.sync input{flex:1 1 220px;min-width:0;font:600 .86rem "Be Vietnam Pro",sans-serif;padding:10px 12px;border:1.5px solid #C9C2AC;border-radius:10px;background:#fff;color:var(--ink,#17241E)}'+
'.sync input.code{font-family:ui-monospace,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase}'+
'.sync .btn{border:none;border-radius:10px;padding:10px 14px;font:800 .8rem Archivo,sans-serif;cursor:pointer;background:var(--green-mid,#17553F);color:var(--paper,#F5F2E8)}'+
'.sync .btn.y{background:var(--yellow,#F2C230);color:var(--green-deep,#0F3D2E)}'+
'.sync .btn.g{background:none;border:1.5px solid #C9C2AC;color:#5C6B62}'+
'.sync .st{display:inline-flex;align-items:center;gap:7px;font:800 .74rem Archivo,sans-serif;border-radius:99px;padding:5px 11px;background:#E3F1E8;color:#1E6B45}'+
'.sync .st.err{background:#F8E1DC;color:#8C3A2B}.sync .st.run{background:#FFF4CF;color:#7A5A00}'+
'.sync .or{font:800 .66rem Archivo,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#7A8780;margin-top:16px}'+
'.sync .pair{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;margin-top:14px;background:#fff;border:1px solid #E2DCC8;border-radius:14px;padding:14px}'+
'.sync .qr{width:148px;height:148px;display:grid;place-items:center;background:#fff}.sync .qr img,.sync .qr canvas{width:148px!important;height:148px!important}'+
'.sync .cd{font:700 .92rem ui-monospace,Consolas,monospace;letter-spacing:.04em;color:var(--green-deep,#0F3D2E);word-break:break-all}'+
'.sync .muted{font-size:.72rem;color:#7A8780}.sync ol{margin:8px 0 0 18px;font-size:.78rem;line-height:1.6;color:#3C4A42}.sync code{font-size:.74rem;background:var(--paper-dim,#E9E4D4);padding:1px 5px;border-radius:5px}'+
'@media(max-width:520px){.sync .pair{grid-template-columns:1fr;justify-items:center;text-align:center}}'+
'.side-sync{margin:6px 14px 0;font:700 .7rem Archivo,sans-serif;color:#8FB3A3;display:flex;gap:6px;align-items:center;cursor:pointer;background:none;border:none;padding:2px 0;text-align:left}'+
'.side-sync b{color:var(--yellow-soft,#F8DE8D)}'+
'.sync-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:300;background:#0F3D2E;color:#F5F2E8;border:1px solid #2A6B52;border-radius:12px;padding:10px 12px 10px 16px;display:flex;gap:12px;align-items:center;font:600 .82rem "Be Vietnam Pro",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:calc(100vw - 32px)}'+
'.sync-toast button{border:none;border-radius:8px;padding:7px 12px;font:800 .76rem Archivo,sans-serif;background:#F2C230;color:#0F3D2E;cursor:pointer}';
function esc(x){ return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
function hhmm(t){ var d=new Date(+t); return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' · '+d.getDate()+'/'+(d.getMonth()+1); }
var state='idle';
function setStatus(st){ state=st; paintStatus(); }
function statusText(){
  if(!ready()) return {c:'err',t:'Đang tắt trên máy này'};
  if(state==='run') return {c:'run',t:'Đang đồng bộ…'};
  if(state==='dirty') return {c:'run',t:'Có thay đổi — sắp lưu lên đám mây'};
  if(state==='err') return {c:'err',t:'Lỗi: '+lastErr};
  var l=g('golf-sync-last'); return {c:'',t:l?'Đã lưu lúc '+hhmm(l):'Đang kết nối…'};
}
function paintStatus(){
  var st=statusText(), a=document.getElementById('sync-st'); if(a){ a.className='st '+st.c; a.textContent=(st.c==='err'?'⚠ ':st.c==='run'?'⟳ ':'☁ ✓ ')+st.t; }
  var sd=document.getElementById('side-sync');
  if(sd) sd.innerHTML=ready()?(state==='err'?'☁ <b>Lỗi đồng bộ</b>':state==='run'||state==='dirty'?'☁ Đang lưu…':'☁ Đã lưu đám mây'+(g('golf-sync-last')?' '+hhmm(g('golf-sync-last')).split(' · ')[0]:'')):'☁ <b>Lưu đám mây đang tắt</b>';
}
function toast(msg,btn,fn){
  var t=document.createElement('div'); t.className='sync-toast'; t.innerHTML='<span>'+esc(msg)+'</span>'+(btn?'<button type="button">'+esc(btn)+'</button>':'');
  document.body.appendChild(t); if(btn) t.querySelector('button').onclick=function(){ t.remove(); fn&&fn(); };
  if(!btn) setTimeout(function(){ t.remove(); },3500);
}
function render(){
  var host=document.getElementById('sync-host'); if(!host) return;
  var on=ready(), h='<div class="sync" id="dongbo"><h3>☁ Lưu trữ đám mây</h3>';
  if(on){
    h+='<div class="row" style="margin-top:6px"><span class="st" id="sync-st"></span><button class="btn g" type="button" data-sy="now">⟳ Đồng bộ ngay</button></div>'+
      '<p>Hồ sơ, nhật ký mph, buổi đã tập và clip chuyển động <b>tự lưu lên đám mây</b> sau ~2 giây. Mở trang trên máy tính, điện thoại hay máy tính bảng đều thấy cùng dữ liệu — không cần đăng nhập hay thao tác gì.</p>'+
      '<p class="muted">Lưu ý: kho dữ liệu dùng chung cho mọi ai mở trang này, nên chỉ chia sẻ đường link với người bạn tin tưởng.</p>'+
      '<div class="row"><button class="btn g" type="button" data-sy="off">Tắt lưu đám mây trên máy này</button></div>';
  } else if(DEV){
    h+='<p>Bản chạy thử trên máy (tệp cục bộ / localhost) — không đồng bộ để tránh ghi dữ liệu thử vào kho thật.</p>';
  } else {
    h+='<p>Máy này đang tắt lưu đám mây — dữ liệu chỉ nằm trên trình duyệt này.</p>'+
      '<div class="row"><button class="btn y" type="button" data-sy="on">☁ Bật lại lưu đám mây</button></div>';
  }
  host.innerHTML=h+'</div>'; paintStatus();
}
document.addEventListener('click',function(e){
  var sd=e.target.closest&&e.target.closest('#side-sync');
  if(sd){ var d=document.getElementById('dongbo'); if(d){ d.scrollIntoView({behavior:'smooth',block:'start'}); var sx=document.getElementById('side-x'); if(sx&&window.innerWidth<1000) sx.click(); } return; }
  var b=e.target.closest&&e.target.closest('[data-sy]'); if(!b) return;
  var a=b.dataset.sy;
  if(a==='now'){ cycle().then(function(ch){ render(); afterPull(ch); }); return; }
  if(a==='off'){ if(!confirm('Tắt lưu đám mây trên máy này? Dữ liệu đã lưu vẫn còn trên đám mây và các máy khác.')) return;
    s('golf-sync-off','1'); render(); return; }
  if(a==='on'){ r('golf-sync-off'); render(); cycle().then(function(ch){ render(); afterPull(ch); }); return; }
});

/* ---------- khởi động ---------- */
var st=document.createElement('style'); st.textContent=CSS; (document.head||document.documentElement).appendChild(st);
var firstDone, first=new Promise(function(ok){ firstDone=ok; });
function boot(){ render(); paintStatus();
  if(!ready()){ firstDone(false); return; }
  cycle().then(function(ch){
    /* tránh vòng tải lại: tối đa 1 lần mỗi 10 giây */
    var lr=0; try{ lr=+(sessionStorage.getItem('golf-sync-reload')||0); }catch(e){}
    if(ch&&Date.now()-lr>10000){ try{ sessionStorage.setItem('golf-sync-reload',String(Date.now())); }catch(e){} afterPull(true); }
    else render();
    firstDone(ch);
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
document.addEventListener('visibilitychange',function(){
  if(!ready()) return;
  if(document.visibilityState==='hidden'){ if(tmr){ clearTimeout(tmr); tmr=null; cycle(); } }
  else cycle().then(afterPull);
});
window.GolfSync={first:first,cycle:cycle,merge:merge,snapshot:snapshot,ready:ready,_status:function(){return {state:state,err:lastErr};}};
})();
