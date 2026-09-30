/* ===== Gói Pro: quyền truy cập, dùng thử, giới hạn miễn phí, hộp mời nâng cấp =====
   Nguồn quyền (theo thứ tự): APP_CFG.paywall=false → mở hết · golf_entitlements trên máy chủ (đã trả tiền)
   · thời gian dùng thử (trialDays kể từ lần đầu mở app, lưu theo tài khoản). */
var PRO_FEATURES={
  program:{icon:'📚',vi:'Mọi chương trình chuyên sâu',en:'All advanced programs'},
  video:{icon:'🎥',vi:'Phân tích video không giới hạn',en:'Unlimited video analysis'},
  report:{icon:'📊',vi:'Báo cáo chi tiết & fitting driver',en:'Detailed report & driver fitting'},
  phases:{icon:'🗺️',vi:'Lộ trình 12 tháng đầy đủ',en:'The full 12-month roadmap'},
  mocap:{icon:'🎬',vi:'Lưu chuyển động của bạn làm mẫu',en:'Save your own motion as a template'}
};
function _lsg(k){try{return localStorage.getItem(k)}catch(e){return null}}
function _lss(k,v){try{localStorage.setItem(k,v)}catch(e){}}
/* ngày bắt đầu dùng thử: ghi một lần, đi theo tài khoản (được đồng bộ) */
(function(){ if(!_lsg('golf-trial-start')) _lss('golf-trial-start',new Date().toISOString().slice(0,10)); })();
function proUntil(){
  var e=window.Cloud&&Cloud.ent; if(e&&e.pro_until){ var t=Date.parse(e.pro_until); if(t>Date.now()) return t; }
  return 0;
}
function trialLeft(){
  var s=_lsg('golf-trial-start'); if(!s) return 0;
  var end=Date.parse(s)+APP_CFG.trialDays*86400000;
  return Math.max(0,Math.ceil((end-Date.now())/86400000));
}
function proStatus(){
  if(!APP_CFG.paywall) return {pro:true,kind:'open'};
  var u=proUntil(); if(u) return {pro:true,kind:'paid',until:u};
  var t=trialLeft(); if(t>0) return {pro:true,kind:'trial',days:t};
  return {pro:false,kind:'free'};
}
function isPro(){ return proStatus().pro; }
/* lượt dùng miễn phí theo tháng (vd phân tích video) */
function _useKey(f){ return 'golf-use-'+f+'-'+new Date().toISOString().slice(0,7); }
function proUsed(f){ return +(_lsg(_useKey(f))||0); }
function proUse(f){ _lss(_useKey(f),String(proUsed(f)+1)); }
function proLeft(f){ return f==='video'?Math.max(0,APP_CFG.freeVideoPerMonth-proUsed(f)):0; }
/* cổng: trả true nếu được dùng; không thì mở hộp nâng cấp */
function proGate(f){
  if(isPro()) return true;
  if(f==='video'&&proLeft('video')>0) return true;
  paywall(f); return false;
}
function proTeaser(f){
  var x=PRO_FEATURES[f]||PRO_FEATURES.program;
  return '<div class="pro-teaser"><div class="pt-ic">🔒</div><div><b>'+L('Tính năng Pro','Pro feature')+' · '+T(x)+'</b>'+
    '<p>'+L('Mở khóa cùng mọi chương trình, phân tích video không giới hạn và báo cáo cá nhân hóa.','Unlock it together with every program, unlimited video analysis and personalised reports.')+'</p>'+
    '<a class="btn y" href="#pro">⭐ '+L('Xem gói Pro','See Pro plans')+'</a></div></div>';
}
/* hộp mời nâng cấp */
function paywall(f){
  var x=PRO_FEATURES[f]||PRO_FEATURES.program, old=document.getElementById('paywall'); if(old) old.remove();
  var d=document.createElement('div'); d.id='paywall'; d.className='pw'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true');
  var used=f==='video'?'<p class="pw-note">'+L('Bạn đã dùng hết '+APP_CFG.freeVideoPerMonth+' lượt phân tích miễn phí của tháng này.','You have used all '+APP_CFG.freeVideoPerMonth+' free analyses this month.')+'</p>':'';
  d.innerHTML='<div class="pw-box"><button class="pw-x" type="button" aria-label="'+L('Đóng','Close')+'">✕</button>'+
    '<div class="pw-ic">'+x.icon+'</div><h3>'+T(x)+'</h3>'+used+
    '<ul class="pw-list">'+Object.keys(PRO_FEATURES).map(function(k){return '<li>✓ '+T(PRO_FEATURES[k])+'</li>';}).join('')+'</ul>'+
    '<div class="pw-price"><b>'+APP_CFG.price[LANG].year+'</b> '+L('/năm','/year')+' · '+APP_CFG.price[LANG].yearPerMonth+'</div>'+
    '<a class="btn y pw-go" href="#pro">⭐ '+L('Nâng cấp Pro','Upgrade to Pro')+'</a></div>';
  document.body.appendChild(d);
  d.addEventListener('click',function(e){ if(e.target===d||e.target.closest('.pw-x')||e.target.closest('.pw-go')) d.remove(); });
}
/* khóa các vùng nội dung đánh dấu data-pro="…" */
function applyLocks(){
  var pro=isPro();
  [].forEach.call(document.querySelectorAll('[data-pro]'),function(el){
    el.classList.toggle('pro-locked',!pro);
    var ov=el.querySelector(':scope > .pro-ov');
    if(!pro&&!ov){ ov=document.createElement('div'); ov.className='pro-ov'; ov.innerHTML=proTeaser(el.getAttribute('data-pro')); el.appendChild(ov); }
    if(pro&&ov) ov.remove();
  });
}
/* link thanh toán kèm id tài khoản + email để webhook biết ai đã trả */
function checkoutUrl(plan){
  var u=APP_CFG.checkout[plan]; if(!u) return '';
  var uid=window.Cloud&&Cloud.uid&&Cloud.uid(), em=window.Cloud&&Cloud.email&&Cloud.email();
  var q=[]; if(uid) q.push('checkout[custom][user_id]='+encodeURIComponent(uid)); if(em) q.push('checkout[email]='+encodeURIComponent(em));
  return u+(q.length?(u.indexOf('?')<0?'?':'&')+q.join('&'):'');
}
/* mã khách hàng ngắn (8 ký tự đầu user id) — dùng làm nội dung chuyển khoản */
function customerCode(){ var u=window.Cloud&&Cloud.uid&&Cloud.uid(); return u?u.replace(/-/g,'').slice(0,8).toUpperCase():''; }
function vietQR(amount,note){
  var b=APP_CFG.bank; if(!b.bin||!b.account) return '';
  return 'https://img.vietqr.io/image/'+encodeURIComponent(b.bin)+'-'+encodeURIComponent(b.account)+'-compact2.png?amount='+amount+'&addInfo='+encodeURIComponent(note)+'&accountName='+encodeURIComponent(b.name||'');
}
