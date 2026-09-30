/* ===== Đa ngôn ngữ (Tiếng Việt mặc định · English) =====
   · L('tiếng Việt','English') — dùng trong mã: trả chuỗi theo ngôn ngữ đang chọn.
   · T({vi:'…',en:'…'}) — dùng cho dữ liệu song ngữ dạng đối tượng.
   · HTML tĩnh: viết tiếng Việt như bình thường, thêm data-en="…" (thay innerHTML khi xem tiếng Anh);
     thuộc tính: data-en-placeholder / data-en-title / data-en-aria-label / data-en-alt.
   · Đổi ngôn ngữ = lưu lựa chọn rồi tải lại trang (mọi phần tự dựng lại đúng ngôn ngữ). */
var LANG=(function(){
  try{ var q=/[?&]lang=(vi|en)\b/.exec(location.search); if(q){ localStorage.setItem('golf-lang',q[1]); return q[1]; } }catch(e){}
  try{ return localStorage.getItem('golf-lang')==='en'?'en':'vi'; }catch(e){ return 'vi'; }
})();
var LOCALE=LANG==='en'?'en-US':'vi-VN';
document.documentElement.lang=LANG;
document.documentElement.setAttribute('data-lang',LANG);
function L(vi,en){ return (LANG==='en'&&en!=null)?en:vi; }
function T(o){ if(o==null) return ''; if(typeof o!=='object') return String(o); return (LANG==='en'&&o.en!=null)?o.en:(o.vi!=null?o.vi:(o.en||'')); }
function setLang(l){ try{ localStorage.setItem('golf-lang',l==='en'?'en':'vi'); }catch(e){} location.reload(); }
/* số thập phân theo ngôn ngữ: 93,5 (vi) · 93.5 (en) */
function numL(x){ return LANG==='en'?String(x):String(x).replace('.',','); }
function fmtDate(d,opt){ try{ return new Date(d).toLocaleDateString(LOCALE,opt||{}); }catch(e){ return String(d); } }
function i18nApply(root){
  if(LANG!=='en') return;
  root=root||document;
  var els=root.querySelectorAll('[data-en]');
  for(var i=0;i<els.length;i++) els[i].innerHTML=els[i].getAttribute('data-en');
  ['placeholder','title','aria-label','alt','content'].forEach(function(a){
    var xs=root.querySelectorAll('[data-en-'+a+']');
    for(var j=0;j<xs.length;j++) xs[j].setAttribute(a,xs[j].getAttribute('data-en-'+a));
  });
  var t=document.querySelector('title[data-en]'); if(t) document.title=t.getAttribute('data-en');
}
/* nút chuyển ngôn ngữ: <button data-setlang="en"> */
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-setlang]'); if(!b) return;
  e.preventDefault(); if(b.getAttribute('data-setlang')!==LANG) setLang(b.getAttribute('data-setlang'));
});
