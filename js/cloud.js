/* ===== Tài khoản & lưu trữ đám mây (Supabase) =====
   · Mỗi người dùng một tài khoản riêng. Lần đầu mở trang: tự tạo tài khoản ẩn danh → dữ liệu
     lưu lên đám mây ngay, không cần thao tác. Thêm email để dùng trên thiết bị khác / giữ tài khoản.
   · Ghi nhận mọi thay đổi localStorage "golf-*"; gộp theo khóa (mới hơn thắng), hồ sơ gộp theo từng người.
   · Quyền Pro đọc từ bảng golf_entitlements (máy chủ cập nhật khi thanh toán).
   · Không dùng thư viện ngoài: gọi thẳng REST của Supabase Auth (GoTrue) & PostgREST. */
(function(){
'use strict';
var TST=window.GOLF_SYNC_CFG;                          /* chỉ khi thử nghiệm: máy chủ giả lập */
var CFG=TST||((window.APP_CFG&&APP_CFG.supabase)||{});
var DEV=!TST&&(location.protocol==='file:'||/^(localhost|127\.0\.0\.1)$/.test(location.hostname));
var Lx=window.L||function(a){return a;};

var ls; try{ ls=window.localStorage; ls.getItem('x'); }catch(e){ ls=null; }
var PKEY='golf-profiles', DKEY='golf-del-ids';
var LOCAL={'golf-sync-cfg':1,'golf-sync-code':1,'golf-sync-meta':1,'golf-sync-last':1,'golf-sync-off':1,'golf-va-pending':1,
  'golf-profile-active':1,'golf-auth':1,'golf-ent':1,'golf-lang':1,'golf-cloud-uid':1};
var rawSet=Storage.prototype.setItem, rawRem=Storage.prototype.removeItem;
function g(k){try{return ls.getItem(k);}catch(e){return null;}}
function s(k,v){try{rawSet.call(ls,k,v);return true;}catch(e){return false;}}
function r(k){try{rawRem.call(ls,k);}catch(e){}}
function syncable(k){return typeof k==='string'&&k.indexOf('golf-')===0&&!LOCAL[k];}
function jp(x,d){try{var v=JSON.parse(x);return v==null?d:v;}catch(e){return d;}}
function meta(){return jp(g('golf-sync-meta'),{});}
function setMeta(m){s('golf-sync-meta',JSON.stringify(m));}

var C=window.Cloud={state:'off',err:'',user:null,ent:null};
if(!ls){ C.first=Promise.resolve(false); return; }

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
  for(k in ks){ var x=a[k], y=b[k]; o[k]=!x?y:!y?x:(y.t>x.t?y:x);
    /* ngày bắt đầu dùng thử: luôn lấy ngày sớm nhất · số lượt đã dùng: lấy số lớn nhất */
    if(x&&y&&x.v!=null&&y.v!=null){
      if(k==='golf-trial-start') o[k]={v:x.v<y.v?x.v:y.v,t:Math.max(x.t,y.t)};
      else if(k.indexOf('golf-use-')===0) o[k]={v:String(Math.max(+x.v||0,+y.v||0)),t:Math.max(x.t,y.t)};
    } }
  var del=arr(a[DKEY]).concat(arr(b[DKEY])).filter(function(v,i,q){return q.indexOf(v)===i;});
  if(del.length){ var td=Math.max((a[DKEY]||{}).t||0,(b[DKEY]||{}).t||0); o[DKEY]={v:JSON.stringify(del),t:td}; }
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

/* ---------- HTTP ---------- */
function req(path,opt){
  opt=opt||{}; var h={'Content-Type':'application/json','apikey':CFG.key};
  if(opt.token) h.Authorization='Bearer '+opt.token;
  else if(/^eyJ/.test(CFG.key)) h.Authorization='Bearer '+CFG.key;
  return fetch(CFG.url+path,{method:opt.method||'POST',headers:h,body:opt.body!=null?JSON.stringify(opt.body):undefined}).then(function(res){
    return res.text().then(function(t){
      var j=jp(t,null);
      if(!res.ok){ var e=new Error(String((j&&(j.msg||j.message||j.error_description||j.error))||t||('HTTP '+res.status)).slice(0,240)); e.status=res.status; e.code=j&&(j.error_code||j.code); throw e; }
      return j;
    });
  });
}

/* ---------- phiên đăng nhập ---------- */
function sess(){ return jp(g('golf-auth'),null); }
function saveSess(x){
  if(!x||!x.access_token) return null;
  var o={access_token:x.access_token,refresh_token:x.refresh_token,expires_at:x.expires_at||(Math.floor(Date.now()/1000)+(x.expires_in||3600)),user:x.user||null};
  if(!o.user){ var old=sess(); if(old&&old.user) o.user=old.user; }
  s('golf-auth',JSON.stringify(o)); C.user=o.user; return o;
}
function isAnon(u){ u=u||C.user; return !!(u&&(u.is_anonymous||(!u.email&&!u.phone))); }
function token(){
  var x=sess(); if(!x) return Promise.resolve(null);
  if(x.expires_at-60>Date.now()/1000) return Promise.resolve(x.access_token);
  return req('/auth/v1/token?grant_type=refresh_token',{body:{refresh_token:x.refresh_token}}).then(function(n){ return saveSess(n).access_token; },
    function(e){ if(e.status>=400&&e.status<500){ r('golf-auth'); C.user=null; } throw e; });
}
/* quay lại từ link email (magic link / xác nhận đổi email): #access_token=…&refresh_token=… */
function readReturn(){
  var h=location.hash||''; if(h.indexOf('access_token=')<0&&h.indexOf('error_description=')<0) return false;
  var q={}; h.replace(/^#/,'').split('&').forEach(function(p){ var i=p.indexOf('='); if(i>0) q[decodeURIComponent(p.slice(0,i))]=decodeURIComponent(p.slice(i+1).replace(/\+/g,' ')); });
  try{ history.replaceState(null,'',location.href.split('#')[0]); }catch(e){}
  if(q.error_description){ C.flash=q.error_description; return false; }
  saveSess({access_token:q.access_token,refresh_token:q.refresh_token,expires_in:+q.expires_in||3600,expires_at:+q.expires_at||0});
  C.flash=Lx('✓ Đã xác nhận email — bạn đã đăng nhập. Có thể đóng tab cũ.','✓ Email confirmed — you are signed in. You can close the other tab.');
  return true;
}
function loadUser(){
  return token().then(function(t){ if(!t) return null;
    return req('/auth/v1/user',{method:'GET',token:t}).then(function(u){ var x=sess(); if(x){ x.user=u; s('golf-auth',JSON.stringify(x)); } C.user=u; return u; }); });
}
function ensureSession(){
  var x=sess(); if(x&&x.refresh_token){ C.user=x.user; return token().then(function(t){ if(t) return t; return ensureSession(); }); }
  if(C.noanon) return Promise.reject(new Error('anonymous sign-ins are disabled'));
  return req('/auth/v1/signup',{body:{data:{}}}).then(function(n){ saveSess(n); return n.access_token; },
    function(e){ if(/anonymous/i.test(e.message)||e.code==='anonymous_provider_disabled') C.noanon=true; throw e; });
}

/* ---------- quyền Pro ---------- */
function loadEnt(){
  return token().then(function(t){ if(!t) return null; return req('/rest/v1/rpc/golf_me',{token:t,body:{}}); })
    .then(function(e){ C.ent=e||{}; s('golf-ent',JSON.stringify({v:C.ent,uid:C.user&&C.user.id,at:Date.now()})); fire(); return C.ent; },function(){ return C.ent; });
}
(function(){ var c=jp(g('golf-ent'),null); if(c) C.ent=c.v; })();

/* ---------- vòng đồng bộ ---------- */
var busy=null, again=false;
function ready(){ return !DEV&&!!CFG.url&&g('golf-sync-off')!=='1'; }
function cycle(){
  if(!ready()) return Promise.resolve(false);
  if(busy){ again=true; return busy; }
  var changedLocal=false, tries=0, tk;
  function round(){
    tries++;
    return req('/rest/v1/rpc/golf_pull_me',{token:tk,body:{}}).then(function(res){
      var rev=res&&res.rev||0, remote=(res&&res.data)||{};
      var m=merge(snapshot(),remote);
      if(apply(m)) changedLocal=true;
      if(sameMap(m,remote)) return true;
      return req('/rest/v1/rpc/golf_push_me',{token:tk,body:{p_data:m,p_rev:rev}}).then(function(nr){
        if(nr===-1&&tries<4) return round();
        if(nr===-1) throw new Error(Lx('Xung đột ghi liên tục — thử lại sau','Repeated write conflict — retrying later'));
        return true;
      });
    });
  }
  setStatus('run');
  busy=ensureSession().then(function(t){ tk=t; if(C.user&&C.user.id) s('golf-cloud-uid',C.user.id); return round(); })
  .then(function(){ C.err=''; s('golf-sync-last',String(Date.now())); setStatus('ok'); return changedLocal; },
    function(e){
      var m=(e&&e.message)||String(e);
      if(C.noanon&&!sess()){ C.err=''; setStatus('signin'); return changedLocal; }
      else if(/golf_pull_me|golf_push_me|function .* does not exist|Could not find the function/i.test(m)) C.err='nosql';
      else C.err=m;
      setStatus('err'); return changedLocal; })
  .then(function(ch){ busy=null; if(again){ again=false; return cycle().then(function(c2){return ch||c2;}); } return ch; });
  return busy;
}
var tmr=null;
function schedule(){ if(!ready()) return; clearTimeout(tmr); tmr=setTimeout(function(){ cycle().then(afterPull); },1500); setStatus('dirty'); }
function modalOpen(){ var a=document.getElementById('ob'), b=document.getElementById('focus');
  return (a&&a.classList.contains('on'))||(b&&b.classList.contains('on')); }
function afterPull(changed){
  if(!changed) return;
  if(!modalOpen()){ location.reload(); return; }
  toast(Lx('☁ Có dữ liệu mới từ thiết bị khác','☁ New data from another device'),Lx('Tải lại','Reload'),function(){ location.reload(); });
}

/* ---------- đăng nhập bằng email (mã 6 số hoặc bấm link) ---------- */
var pending=null;   /* {email, type:'email'|'email_change'} */
function sendCode(email){
  email=String(email||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.reject(new Error(Lx('Email không hợp lệ','Invalid email')));
  var redirect=location.href.split('#')[0];
  function otp(){ pending={email:email,type:'email'};
    return req('/auth/v1/otp?redirect_to='+encodeURIComponent(redirect),{body:{email:email,create_user:true}}); }
  /* đang là khách ẩn danh → gắn email vào CHÍNH tài khoản này (giữ nguyên dữ liệu) */
  if(C.user&&isAnon()) return token().then(function(t){ pending={email:email,type:'email_change'};
      return req('/auth/v1/user?redirect_to='+encodeURIComponent(redirect),{method:'PUT',token:t,body:{email:email}}); })
    .catch(function(e){ if(/already|registered|exists/i.test(e.message)) return otp(); throw e; });
  return otp();
}
function verifyCode(code){
  if(!pending) return Promise.reject(new Error(Lx('Hãy gửi mã trước','Send a code first')));
  code=String(code||'').replace(/\D/g,'');
  return req('/auth/v1/verify',{body:{type:pending.type,email:pending.email,token:code}}).then(function(n){
    if(n&&n.access_token) saveSess(n);
    pending=null;
    return loadUser().then(function(){ return cycle(); }).then(function(ch){ return loadEnt().then(function(){ return ch; }); });
  });
}
function signOut(){
  var t=sess();
  var p=t?req('/auth/v1/logout',{token:t.access_token,body:{}}).catch(function(){}):Promise.resolve();
  return p.then(function(){
    /* xóa dữ liệu của tài khoản khỏi thiết bị này (dữ liệu vẫn còn trên đám mây) */
    var ks=[]; for(var i=0;i<ls.length;i++){ var k=ls.key(i); if(k&&k.indexOf('golf-')===0&&k!=='golf-lang'&&k!=='golf-trial-start'&&k.indexOf('golf-use-')!==0) ks.push(k);   /* giữ mốc dùng thử & lượt đã dùng */ }
    ks.forEach(r); s('golf-onb-seen','1'); location.reload();
  });
}

/* ---------- giao diện: thẻ tài khoản trong Hồ sơ + chip ở menu ---------- */
function esc(x){ return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
function hhmm(t){ var d=new Date(+t); return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); }
var state='idle', listeners=[];
function fire(){ listeners.forEach(function(f){ try{ f(C); }catch(e){} }); render(); }
function setStatus(st){ state=st; C.state=st; paint(); }
function errText(){
  if(C.err==='noanon') return Lx('Máy chủ chưa bật đăng nhập ẩn danh (quản trị viên: xem ADMIN.md).','Server has anonymous sign-in disabled (admin: see ADMIN.md).');
  if(C.err==='nosql') return Lx('Máy chủ chưa cài bản cơ sở dữ liệu mới (quản trị viên: chạy supabase.sql).','Server database not updated (admin: run supabase.sql).');
  return C.err;
}
function paint(){
  var a=document.getElementById('sync-st');
  if(a){
    var t, c='';
    if(DEV){ t=Lx('Bản chạy thử trên máy — không đồng bộ','Local test build — sync off'); c='err'; }
    else if(!ready()){ t=Lx('Đang tắt trên máy này','Turned off on this device'); c='err'; }
    else if(state==='run'||state==='dirty'){ t=Lx('Đang lưu…','Saving…'); c='run'; }
    else if(state==='signin'){ t=Lx('Chưa đăng nhập — dữ liệu đang lưu trên máy này','Not signed in — data is saved on this device'); c='run'; }
    else if(state==='err'){ t=Lx('Chưa lưu được: ','Not saved: ')+errText(); c='err'; }
    else { var l=g('golf-sync-last'); t=l?Lx('Đã lưu lúc ','Saved at ')+hhmm(l):Lx('Đang kết nối…','Connecting…'); }
    a.className='st '+c; a.textContent=(c==='err'?'⚠ ':c==='run'?'⟳ ':'☁ ✓ ')+t;
  }
  var sd=document.getElementById('side-sync');
  if(sd){
    if(DEV||!ready()) sd.innerHTML='☁ <b>'+Lx('Chỉ lưu trên máy','Saved on device only')+'</b>';
    else if(state==='signin') sd.innerHTML='☁ <b>'+Lx('Đăng nhập để lưu đám mây','Sign in to save to cloud')+'</b>';
    else if(state==='err') sd.innerHTML='☁ <b>'+Lx('Chưa lưu đám mây','Cloud not saved')+'</b>';
    else if(state==='run'||state==='dirty') sd.innerHTML='☁ '+Lx('Đang lưu…','Saving…');
    else sd.innerHTML='☁ '+(C.user&&!isAnon()?esc(C.user.email):Lx('Đã lưu đám mây','Saved to cloud'))+(g('golf-sync-last')?' · '+hhmm(g('golf-sync-last')):'');
  }
}
function toast(msg,btn,fn){
  var t=document.createElement('div'); t.className='sync-toast'; t.innerHTML='<span>'+esc(msg)+'</span>'+(btn?'<button type="button">'+esc(btn)+'</button>':'');
  document.body.appendChild(t); if(btn) t.querySelector('button').onclick=function(){ t.remove(); fn&&fn(); };
  if(!btn) setTimeout(function(){ t.remove(); },4000);
}
C.toast=toast;
function render(){
  var host=document.getElementById('sync-host'); if(!host) return;
  var u=C.user, anon=isAnon(u), h='<div class="sync" id="dongbo"><h3>'+Lx('☁ Tài khoản &amp; lưu trữ đám mây','☁ Account &amp; cloud storage')+'</h3>';
  h+='<div class="row" style="margin-top:6px"><span class="st" id="sync-st"></span>'+(ready()?'<button class="btn g" type="button" data-sy="now">⟳ '+Lx('Đồng bộ ngay','Sync now')+'</button>':'')+'</div>';
  if(DEV){ h+='<p>'+Lx('Trang đang mở từ tệp cục bộ / localhost nên không ghi vào đám mây.','This page runs from a local file / localhost, so nothing is written to the cloud.')+'</p>'; }
  else if(!ready()){ h+='<p>'+Lx('Máy này đang tắt lưu đám mây — dữ liệu chỉ nằm trên trình duyệt này.','Cloud saving is off on this device — data stays in this browser only.')+'</p>'+
      '<div class="row"><button class="btn y" type="button" data-sy="on">☁ '+Lx('Bật lại lưu đám mây','Turn cloud saving back on')+'</button></div>'; }
  else if(u&&!anon){
    h+='<p>'+Lx('Đã đăng nhập: ','Signed in as ')+'<b>'+esc(u.email)+'</b>. '+Lx('Dữ liệu của bạn tự lưu và có mặt trên mọi thiết bị đăng nhập cùng email.','Your data saves automatically and is available on every device signed in with this email.')+'</p>'+
      '<div class="row"><button class="btn g" type="button" data-sy="out">'+Lx('Đăng xuất khỏi thiết bị này','Sign out on this device')+'</button><button class="btn g" type="button" data-sy="off">'+Lx('Tắt lưu đám mây','Turn off cloud saving')+'</button></div>';
  } else {
    h+='<p>'+(u?Lx('Dữ liệu của bạn đã tự lưu lên đám mây trong một tài khoản khách. <b>Thêm email</b> để giữ tài khoản vĩnh viễn và mở trên điện thoại, máy tính khác.','Your data is already saved to the cloud in a guest account. <b>Add your email</b> to keep it permanently and open it on your phone or other computers.')
        :Lx('<b>Đăng nhập bằng email</b> (không cần mật khẩu) để lưu dữ liệu lên đám mây và dùng trên mọi thiết bị.','<b>Sign in with your email</b> (no password) to save your data to the cloud and use it on every device.'))+'</p>'+
      (pending?
        '<div class="sent"><div class="sent-ic">📧</div><div><b>'+Lx('Đã gửi email tới ','Email sent to ')+esc(pending.email)+'</b>'+
          '<p>'+Lx('Mở email và bấm nút <b>xác nhận / đăng nhập</b>. Trang này sẽ tự đăng nhập — không cần nhập gì thêm.','Open the email and tap the <b>confirm / log in</b> button. This page signs you in by itself — nothing to type.')+'</p>'+
          '<p class="muted">'+Lx('Bấm link trên chính thiết bị bạn muốn đăng nhập. Không thấy email? Xem mục Spam / Quảng cáo.','Tap the link on the device you want to sign in on. No email? Check your spam / promotions folder.')+'</p>'+
          '<details class="sent-code"><summary>'+Lx('Email có mã số? Nhập mã tại đây','Got a numeric code? Enter it here')+'</summary><div class="row"><input id="sy-code" class="code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="123456"><button class="btn" type="button" data-sy="verify">'+Lx('Xác nhận','Confirm')+'</button></div></details>'+
          '<div class="row"><button class="btn g" type="button" data-sy="resend">'+Lx('Gửi lại','Resend')+'</button><button class="btn g" type="button" data-sy="change">'+Lx('Dùng email khác','Use another email')+'</button></div></div></div>'
      :'<div class="row"><input id="sy-email" type="email" autocomplete="email" placeholder="'+Lx('email@cua-ban.com','you@example.com')+'"><button class="btn y" type="button" data-sy="send">'+Lx('Gửi link đăng nhập','Email me a sign-in link')+'</button></div>'+
       '<p class="muted">'+Lx('Không cần mật khẩu: bạn nhận một email, bấm xác nhận là xong. Trên thiết bị khác, nhập cùng email này.','No password: you get an email, tap confirm and you are in. On another device, use the same email.')+'</p>');
  }
  host.innerHTML=h+'</div>'; paint();
}
document.addEventListener('click',function(e){
  var sd=e.target.closest&&e.target.closest('#side-sync');
  if(sd){ location.hash='dongbo'; return; }
  var b=e.target.closest&&e.target.closest('[data-sy]'); if(!b) return;
  var a=b.dataset.sy;
  if(a==='now'){ cycle().then(function(ch){ render(); afterPull(ch); }); return; }
  if(a==='off'){ if(!confirm(Lx('Tắt lưu đám mây trên máy này? Dữ liệu đã lưu vẫn còn trên đám mây.','Turn off cloud saving on this device? Data already saved stays in the cloud.'))) return; s('golf-sync-off','1'); render(); return; }
  if(a==='on'){ r('golf-sync-off'); render(); cycle().then(function(ch){ render(); afterPull(ch); }); return; }
  if(a==='out'){ if(!confirm(Lx('Đăng xuất và xóa dữ liệu khỏi thiết bị này? Dữ liệu vẫn còn trong tài khoản.','Sign out and remove data from this device? Your data stays in your account.'))) return; signOut(); return; }
  if(a==='send'||a==='resend'){ var em=a==='resend'?(pending&&pending.email):document.getElementById('sy-email').value; b.disabled=true;
    sendCode(em).then(function(){ try{ sessionStorage.setItem('golf-auth-pending',JSON.stringify(pending)); }catch(x){} render();
      toast(a==='resend'?Lx('Đã gửi lại email.','Email sent again.'):Lx('Đã gửi — mở email và bấm xác nhận.','Sent — open the email and tap confirm.')); },
      function(err){ toast(Lx('Không gửi được: ','Could not send: ')+(/rate limit/i.test(err.message)?Lx('gửi quá nhiều email, thử lại sau ít phút','too many emails, try again in a few minutes'):err.message)); b.disabled=false; });
    return; }
  if(a==='change'){ pending=null; try{ sessionStorage.removeItem('golf-auth-pending'); }catch(x){} render(); var ie=document.getElementById('sy-email'); if(ie) ie.focus(); return; }
  if(a==='verify'){ b.disabled=true;
    verifyCode(document.getElementById('sy-code').value).then(function(ch){ try{ sessionStorage.removeItem('golf-auth-pending'); }catch(x){} toast(Lx('✓ Đã liên kết email','✓ Email linked')); render(); if(ch) setTimeout(function(){ location.reload(); },600); },
      function(err){ toast(Lx('Mã không đúng hoặc đã hết hạn: ','Wrong or expired code: ')+err.message); }).then(function(){ b.disabled=false; });
    return; }
});

/* ---------- khởi động ---------- */
var firstDone; C.first=new Promise(function(ok){ firstDone=ok; });
var returned=readReturn();
if(returned){ try{ sessionStorage.removeItem('golf-auth-pending'); }catch(x){} }
else { try{ pending=JSON.parse(sessionStorage.getItem('golf-auth-pending')||'null'); }catch(x){} }
window.addEventListener('storage',function(ev){
  if(ev.key!=='golf-auth'||!ev.newValue) return;
  var n=jp(ev.newValue,null), was=C.user&&C.user.id;
  if(!n||!n.access_token) return;
  if(pending||!was||(n.user&&n.user.id!==was)){   /* đã xác nhận ở tab mở từ email */
    try{ sessionStorage.removeItem('golf-auth-pending'); }catch(x){}
    toast(Lx('✓ Đã xác nhận email — đang tải tài khoản…','✓ Email confirmed — loading your account…'));
    setTimeout(function(){ location.reload(); },900);
  }
});
function boot(){
  render(); paint();
  if(C.flash){ toast(C.flash); C.flash=''; }
  if(!ready()){ firstDone(false); return; }
  cycle().then(function(ch){
    var lr=0; try{ lr=+(sessionStorage.getItem('golf-sync-reload')||0); }catch(e){}
    firstDone(ch);
    if(ch&&Date.now()-lr>10000){ try{ sessionStorage.setItem('golf-sync-reload',String(Date.now())); }catch(e){} afterPull(true); return; }
    render();
    (returned||!C.user||!C.user.id?loadUser():Promise.resolve()).then(loadEnt).then(render).catch(function(){});
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
document.addEventListener('visibilitychange',function(){
  if(!ready()) return;
  if(document.visibilityState==='hidden'){ if(tmr){ clearTimeout(tmr); tmr=null; cycle(); } }
  else cycle().then(afterPull);
});
C.cycle=cycle; C.merge=merge; C.snapshot=snapshot; C.ready=ready; C.isAnon=isAnon; C.sendCode=sendCode; C.verifyCode=verifyCode;
C.signOut=signOut; C.loadEnt=loadEnt; C.on=function(f){ listeners.push(f); }; C.dev=DEV;
C.uid=function(){ return (C.user&&C.user.id)||g('golf-cloud-uid')||''; };
C.email=function(){ return C.user&&C.user.email||''; };
})();
