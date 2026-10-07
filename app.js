'use strict';
/* ---------- 小工具 ---------- */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const toMin=s=>{const [h,m]=s.split(':').map(Number);return h*60+m};
const hhmm=m=>`${pad(Math.floor(m/60)%24)}:${pad(m%60)}`;
const nowMin=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
const uid=()=>Math.random().toString(36).slice(2,9);
const WD=['日','一','二','三','四','五','六'];
const HH=56; // 每小時像素
const KEY='family-routine.v1';
const MARKUP="<div class=\"wrap\">\n  <header>\n    <div class=\"top\">\n      <div>\n        <div class=\"brand\">Family · Daily Rhythm</div>\n        <h1 id=\"title\">—</h1>\n      </div>\n      <div class=\"clock\" id=\"clock\">--:--</div>\n    </div>\n    <div class=\"nav\">\n      <div class=\"tabs\" role=\"tablist\" id=\"tabs\">\n        <button class=\"tab\" role=\"tab\" data-v=\"day\">今日</button>\n        <button class=\"tab\" role=\"tab\" data-v=\"week\">本週</button>\n        <button class=\"tab\" role=\"tab\" data-v=\"month\">本月</button>\n      </div>\n      <div class=\"pager\">\n        <button class=\"ib\" id=\"prev\" aria-label=\"前一個\">‹</button>\n        <span class=\"lab\" id=\"lab\"></span>\n        <button class=\"ib\" id=\"next\" aria-label=\"後一個\">›</button>\n        <button class=\"ib\" id=\"today\">今天</button>\n      </div>\n      <span class=\"sp\"></span>\n      <button class=\"ib\" id=\"theme\" aria-label=\"切換明暗\">明暗</button>\n      <button class=\"ib\" id=\"settingsBtn\">家人 · 設定</button>\n    </div>\n  </header>\n  <div class=\"rob\" id=\"rob\" hidden>👁 唯讀檢視：只有擁有者可以修改內容</div>\n\n  <section class=\"hero\">\n    <div class=\"panel\" id=\"wxPanel\"></div>\n    <div class=\"panel\" id=\"acPanel\"></div>\n  </section>\n\n  <section class=\"sec\" id=\"nowSec\">\n    <h2>此刻 <em id=\"nowLab\">RIGHT NOW</em></h2>\n    <div class=\"cards\" id=\"cards\"></div>\n  </section>\n\n  <section class=\"sec\" id=\"viewSec\">\n    <h2 id=\"viewH\">時間軸 <em>TIMELINE</em></h2>\n    <div id=\"view\"></div>\n  </section>\n\n  <footer>每日天氣由手動勾選紀錄</footer>\n</div>\n\n<div class=\"fabs\">\n  <button class=\"fab sm\" id=\"addBtn\" aria-label=\"新增事項\">+</button>\n  <button class=\"fab\" id=\"voiceBtn\" aria-label=\"語音輸入\">🎙</button>\n</div>\n\n<!-- 事項 -->\n<dialog id=\"evDlg\">\n  <form method=\"dialog\" id=\"evForm\">\n    <div class=\"dh\" id=\"evTitleH\">新增事項</div>\n    <div class=\"db\">\n      <div class=\"banner\" id=\"evBanner\" hidden></div>\n      <label class=\"f\">誰<select id=\"fMember\"></select></label>\n      <div class=\"inl\">\n        <label class=\"f\" style=\"flex:1\">做什麼<input id=\"fTitle\" placeholder=\"例如：午睡、餵奶、散步…\" autocomplete=\"off\"></label>\n        <button type=\"button\" class=\"mic\" id=\"fMic\" aria-label=\"語音輸入內容\">🎙</button>\n      </div>\n      <div class=\"chips\" id=\"chips\"></div>\n      <div class=\"row\">\n        <label class=\"f\">開始<input type=\"time\" id=\"fStart\" step=\"300\"></label>\n        <label class=\"f\">結束<input type=\"time\" id=\"fEnd\" step=\"300\"></label>\n      </div>\n      <div class=\"row\">\n        <label class=\"f\"><span id=\"fDateLab\">日期</span><input type=\"date\" id=\"fDate\"></label>\n        <label class=\"f\">重複\n          <select id=\"fRepeat\">\n            <option value=\"none\">不重複</option>\n            <option value=\"daily\">每天</option>\n            <option value=\"weekdays\">週一到週五</option>\n            <option value=\"weekly\">每週同一天</option>\n          </select>\n        </label>\n      </div>\n    </div>\n    <div class=\"df\">\n      <button type=\"button\" class=\"btn del\" id=\"evDelOne\" hidden>只刪這一天</button>\n      <button type=\"button\" class=\"btn del\" id=\"evDel\" hidden>刪除</button>\n      <span class=\"sp\"></span>\n      <button type=\"button\" class=\"btn\" id=\"evCancel\">取消</button>\n      <button type=\"submit\" class=\"btn pri\">儲存</button>\n    </div>\n  </form>\n</dialog>\n\n<!-- 語音 -->\n<dialog id=\"voDlg\">\n  <div class=\"dh\">說一句話就好</div>\n  <div class=\"db\">\n    <button class=\"voicebig\" id=\"voGo\" aria-label=\"開始或停止收音\">🎙</button>\n    <div class=\"transcript\" id=\"voText\">按下麥克風開始說話</div>\n    <label class=\"f\">或直接打字<input id=\"voType\" placeholder=\"保母 下午三點到四點 帶小寶寶散步\" autocomplete=\"off\"></label>\n    <div class=\"ex\">\n      新增：<code>爸爸 晚上七點 帶狗散步</code> <code>小寶寶 現在 喝奶</code><br>\n      修改：<code>把 大寶 三點的功課 改成 四點 鋼琴課</code><br>\n      刪除：<code>取消 保母 兩點的 買菜</code><br>\n      冷氣：<code>冷氣打開</code> <code>冷氣關掉</code>　日期：加上「明天」「每天」「平日」\n    </div>\n  </div>\n  <div class=\"df\">\n    <button class=\"btn\" id=\"voClose\">關閉</button>\n    <button class=\"btn pri\" id=\"voApply\">送出</button>\n  </div>\n</dialog>\n\n<!-- 設定 -->\n<dialog id=\"setDlg\">\n  <div class=\"dh\">家人 · 設定</div>\n  <div class=\"db\" id=\"setBody\"></div>\n  <div class=\"df\">\n    <button class=\"btn\" id=\"exportBtn\">匯出備份</button>\n    <button class=\"btn\" id=\"importBtn\">匯入</button>\n    <span class=\"sp\"></span>\n    <button class=\"btn pri\" id=\"setDone\">完成</button>\n  </div>\n  <input type=\"file\" id=\"importFile\" accept=\"application/json\" hidden>\n</dialog>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";
document.body.insertAdjacentHTML('afterbegin',MARKUP);
const IN_ARTIFACT=typeof claude!=='undefined'&&!!claude.use;
const SHOWCASE=!!window.SHOWCASE,SHOWMAP=!!window.SHOWMAP; // SHOWMAP：只展示世界地圖 // 展示板：唯讀、只讀內嵌的去識別資料，不寫入任何儲存
let RO=IN_ARTIFACT||SHOWCASE,ART=null,saveTimer=null; // 在 Claude 裡先當唯讀，確認有編輯權才開放
function setRO(v){if(SHOWCASE)v=true;RO=v;document.body.classList.toggle('ro',v);const r=document.getElementById('rob');if(r)r.hidden=!v}
document.body.classList.toggle('ro',RO);document.body.classList.toggle('showcase',SHOWCASE);document.body.classList.toggle('showmap',SHOWMAP);

/* ---------- 資料 ---------- */
function seed(){
  const members=[
    {id:'lucy',name:'保母',role:'保母 + 媽媽',glyph:'保',color:'#b5573a',birth:'',aliases:'媽媽,保母,老婆'},
    {id:'jimmy',name:'爸爸',role:'爸爸',glyph:'J',color:'#2f5168',birth:'',aliases:'爸爸,老公,先生'},
    {id:'chris',name:'大寶',role:'兒子',glyph:'C',color:'#c9962f',birth:'',aliases:'兒子,哥哥,大寶'},
    {id:'tangyuan',name:'小寶寶',role:'收托寶寶',glyph:'寶',color:'#b86a77',birth:'',aliases:'湯圓,寶寶,小寶'},
    {id:'baby2',name:'新寶寶',role:'尚未入托',glyph:'寶',color:'#7f9467',birth:'',aliases:'新寶寶,另一個寶寶'},
    {id:'dog',name:'小狗',role:'狗狗 · 6 公斤',glyph:'犬',color:'#6b4a35',birth:'',aliases:'狗,狗狗,小狗'}
  ];
  const E=(m,s,e,t,r)=>({id:uid(),member:m,start:s,end:e,title:t,date:ymd(weekStart(new Date())),repeat:r||'daily',sample:true,skip:[]});
  return{
    members,
    events:[
      E('lucy','07:00','08:00','準備早餐'),E('lucy','08:30','12:00','照顧小寶寶','weekdays'),E('lucy','12:00','13:00','午餐'),
      E('jimmy','07:30','08:15','出門上班','weekdays'),E('jimmy','19:00','19:40','帶狗散步'),
      E('chris','08:00','15:30','上學','weekdays'),E('chris','16:00','17:00','寫功課','weekdays'),
      E('tangyuan','08:30','09:30','遊戲'),E('tangyuan','12:30','14:30','午睡'),
      E('dog','07:00','07:30','早餐 + 散步'),E('dog','12:00','15:00','午睡'),E('dog','19:00','19:40','散步')
    ],
    acs:{living:{on:false,temp:26,log:[]},master:{on:false,temp:26,log:[]}},
    loc:{name:'台北',lat:25.0478,lon:121.5319},
    theme:'auto'
  };
}
const RESET=':root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}';
// 資料來源：發布在 Claude 時，資料內嵌在頁面裡（所有人看到同一份）；單機開啟時存在瀏覽器
let S=(()=>{
  if(!IN_ARTIFACT&&!SHOWCASE)try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&x.members)return x}catch(e){} // 單機：以本機儲存為準
  try{const el=document.getElementById('fr-state'),x=el&&JSON.parse(el.textContent);if(x&&x.members)return x}catch(e){}
  return seed();
})();
// 整頁重新產生（含最新資料），格式與發布工具相同
function docHTML(){
  const data=JSON.stringify(S).replace(/</g,'\\u003c');
  return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+RESET+'</style></head><body>'+
  '<title>家 · 時刻表</title>\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'+
  '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@400;500;700;900&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">\n'+
  '<link rel="stylesheet" href="style.css">\n<script type="application/json" id="fr-state">'+data+'<\/script>\n<script src="app.js"><\/script>\n</body></html>';
}
const PEND=KEY+'.pending';
function norm(){ // 補齊舊資料缺少的欄位
  S.members=S.members||[];S.nights=S.nights||[];S.feeds=S.feeds||[];S.events=S.events||[];S.wx=S.wx||{};
  if(!S.acs){S.acs={living:S.ac||{on:false,temp:26,log:[]},master:{on:false,temp:26,log:[]}}} // 舊資料的單一冷氣 → 客廳
  delete S.ac;
  for(const k of ['living','master']){const u=S.acs[k]=S.acs[k]||{on:false,temp:26,log:[]};u.log=u.log||[]}
}
function save(){
  if(RO)return;
  if(!ART){ // 單機：每次異動立刻寫入 localStorage
    try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('無法儲存（瀏覽器可能封鎖或空間已滿），請在設定匯出備份')}
    return;
  }
  // 在 Claude 發布版：先暫存在本機，再上傳；上傳成功前重新整理也不會掉
  try{localStorage.setItem(PEND,JSON.stringify({t:Date.now(),s:S}))}catch(e){}
  clearTimeout(saveTimer);saveTimer=setTimeout(publishState,3000);
}
async function publishState(){
  // 有對話框開著就等一下，避免發布後頁面重新載入打斷輸入
  if(document.querySelector('dialog[open]')){saveTimer=setTimeout(publishState,2500);return}
  try{toast('儲存中…');await ART.publish(docHTML());try{localStorage.removeItem(PEND)}catch(e){}}
  catch(e){const c=e&&e.code;
    if(c==='not_writer'||c==='not_granted'||c==='consent_required'){setRO(true);render();toast('這是唯讀檢視，無法修改')}
    else if(c==='rate_limited')toast('修改太頻繁，稍後會再試');
    else if(c==='conflict'){try{localStorage.removeItem(PEND)}catch(e){}}
    else toast('儲存失敗，請再試一次（'+(c||'未知')+'）')}
}
async function initAccess(){
  if(SHOWCASE){setRO(true);render();return}
  if(!IN_ARTIFACT){setRO(false);return}
  try{
    ART=await claude.use('artifact');const u=await claude.use('user');
    setRO(!(ART&&u&&await u.canEdit()));
  }catch(e){setRO(true)}
  if(!RO){ // 還原 10 分鐘內尚未上傳成功的修改
    try{const p=JSON.parse(localStorage.getItem(PEND));
      if(p&&p.s&&p.s.members&&Date.now()-p.t<6e5){S=p.s;norm();toast('已恢復尚未上傳的修改');save()}
      else localStorage.removeItem(PEND)}catch(e){}
  }
  render();
}
const member=id=>S.members.find(m=>m.id===id);
const colorOf=id=>(member(id)||{color:'#888'}).color;

/* ---------- 事項計算 ---------- */
function occursOn(ev,d){
  const ds=ymd(d);
  if(ds<ev.date||(ev.skip||[]).includes(ds))return false;
  switch(ev.repeat){
    case'daily':return true;
    case'weekdays':return d.getDay()>0&&d.getDay()<6;
    case'weekly':return pd(ev.date).getDay()===d.getDay();
    default:return ds===ev.date;
  }
}
function baseDayEvents(d,mid){
  return S.events.filter(e=>member(e.member)&&(!mid||e.member===mid)&&occursOn(e,d))
    .map(e=>({ev:e,s:toMin(e.start),e:toMin(e.end)})).sort((a,b)=>a.s-b.s||a.e-b.e);
}
function dayEvents(d,mid){ // 低能量日：非必要事項自動順延（不改動原始資料）
  const base=baseDayEvents(d,mid),ls=lowState(d);
  if(!ls||!ls.on)return base;
  return base.flatMap(x=>{
    if(!x.ev.flex)return[x];
    if(ls.level>=3)return[];
    if(x.s>=900)return[x];
    return[{...x,s:900,e:Math.min(900+(x.e-x.s),1439),deferred:true}];
  }).sort((a,b)=>a.s-b.s||a.e-b.e);
}

/* ---------- 年齡 ---------- */
function ageOf(birth,on=new Date()){
  if(!birth)return null;
  const b=pd(birth); if(b>on)return{future:true};
  let y=on.getFullYear()-b.getFullYear(),m=on.getMonth()-b.getMonth(),d=on.getDate()-b.getDate();
  if(d<0){m--;d+=new Date(on.getFullYear(),on.getMonth(),0).getDate()}
  if(m<0){y--;m+=12}
  return{y,m,d};
}
function ageText(birth){
  const a=ageOf(birth); if(!a)return null; if(a.future)return'尚未出生';
  if(a.y>=1)return`${a.y} 歲 ${a.m} 個月`+(a.y<3?` ${a.d} 天`:'');
  if(a.m>=1)return`${a.m} 個月 ${a.d} 天`;
  return`${a.d} 天`;
}

/* ---------- 冷氣 ---------- */
const ACS=[['living','客廳冷氣','客廳','var(--ac)'],['master','主臥冷氣','主臥','var(--ac2)']];
const acu=k=>S.acs[k];
function acAt(ts,k){let on=false;for(const l of acu(k).log){if(l.t<=ts)on=l.on;else break}return on}
function acIntervals(d,k){ // 該日開冷氣的分鐘區間；不指定 k 時回傳兩台的區間合併清單（用來判斷「當天有沒有開」）
  if(!k)return ACS.flatMap(([key])=>acIntervals(d,key));
  const s0=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),s1=s0+864e5;
  if(s0>Date.now())return[]; // 未來的日子不算
  const out=[];let on=acAt(s0,k),from=on?s0:null;
  for(const l of acu(k).log){if(l.t<=s0||l.t>=s1)continue;
    if(l.on&&!on){from=l.t;on=true}else if(!l.on&&on){out.push([from,l.t]);on=false}}
  if(on)out.push([from,Math.min(s1,Date.now()>s0&&Date.now()<s1?Date.now():s1)]);
  return out.filter(([a,b])=>b>a).map(([a,b])=>[(a-s0)/6e4,(b-s0)/6e4]);
}
const acMins=(d,k)=>Math.round(acIntervals(d,k).reduce((t,[x,y])=>t+y-x,0));
function setAC(k,on,temp){
  if(RO)return;const u=acu(k);
  if(temp)u.temp=temp;
  if(u.on!==on){u.on=on;u.log.push({t:Date.now(),on});u.log=u.log.slice(-3000)}
  save();render();
}

/* ---------- 天氣紀錄（手動勾選：早上 / 下午 / 晚上） ---------- */
const PERIODS=[['am','早上','🌅',6,12],['pm','下午','☀️',12,18],['ev','晚上','🌙',18,24]];
const WX_GROUPS=[
  ['w','天氣',['晴天','多雲','陰天','雨天','雷雨']],
  ['r','降雨機率',['0–30%','31–50%','51–70%','71–100%']],
  ['t','體感溫度',['熱','涼爽舒適','冷']],
  ['l','室內光線',['亮','普通','暗']],
  ['a','空氣流通',['涼爽','普通','悶熱']]
];
const WX_ICON=['☀️','⛅','☁️','🌧','⛈'];
norm();
const wxOf=d=>S.wx[ymd(d)]||{};
function rainHours(d){ // 勾選為雨天 / 雷雨的時段
  const o=wxOf(d),out=[];
  PERIODS.forEach(([k,,,h0,h1])=>{if(o[k]&&(o[k].w===3||o[k].w===4))for(let h=h0;h<h1;h++)out.push(h)});
  return out;
}
const wxIcons=d=>{const o=wxOf(d);return PERIODS.map(([k])=>o[k]&&o[k].w!=null?WX_ICON[o[k].w]:'·').join(' ')};
const hasRain=d=>rainHours(d).length>0;
function setWx(ds,p,k,i){
  if(RO)return;
  const day=(S.wx[ds]=S.wx[ds]||{}),o=(day[p]=day[p]||{});
  if(o[k]===i)delete o[k];else o[k]=i;
  if(!Object.keys(o).length)delete day[p];
  if(!Object.keys(day).length)delete S.wx[ds];
  const keep=Object.keys(S.wx).sort().slice(-400);for(const x of Object.keys(S.wx))if(!keep.includes(x))delete S.wx[x];
  save();render();
}

/* ---------- 畫面狀態 ---------- */
let view='day',cursor=new Date();
const isToday=d=>ymd(d)===ymd(new Date());
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2600)}

function render(){
  const n=new Date();
  $('#title').innerHTML=`${n.getMonth()+1}月${n.getDate()}日<small>週${WD[n.getDay()]} · ${n.getFullYear()}</small>`;
  $('#clock').textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}`;
  document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-selected',t.dataset.v===view));
  if(typeof applyRpgMode==='function'&&settle())save();
  if(typeof applyRpgMode==='function'){applyRpgMode();if(MODE==='rpg'){renderRpg();return}}
  if(view==='lib'){applyMode();renderLib();return}
  applyMode();renderChecklist();renderLow();renderWeather();renderAC();renderNight();renderFeed();renderCards();renderView();renderNightAna();renderFeedAna();renderBills();
}

function dayState(d){ // rain / clear / cloudy / null(沒記錄)
  const o=wxOf(d),ws=PERIODS.map(([k])=>o[k]&&o[k].w).filter(w=>w!=null&&w!==undefined);
  if(!ws.length)return null;
  if(ws.some(w=>w===3||w===4))return'rain';
  return ws.filter(w=>w<=1).length>=ws.length/2?'clear':'cloudy';
}
function trendText(){ // 未來 7 天的簡短描述（依你填的天氣）
  const days=Array.from({length:7},(_,i)=>{const d=addDays(new Date(),i);return{d,i,st:dayState(d)}});
  const known=days.filter(x=>x.st);
  const nm=x=>x.i===0?'今天':x.i===1?'明天':'週'+WD[x.d.getDay()];
  const isWk=x=>x.d.getDay()===0||x.d.getDay()===6;
  if(known.length<2)return'請先填入未來幾天天氣';
  const rain=known.filter(x=>x.st==='rain');
  const all=known.length>=5;
  if(!rain.length)return known.every(x=>x.st==='clear')?(all?'整週天氣穩定':'目前記錄皆為晴'):(all?'整週沒有下雨':'目前記錄沒有下雨');
  if(rain.length===known.length)return all?'整週都會下雨':'目前記錄皆為雨天';
  const lastRain=rain[rain.length-1],firstRain=rain[0];
  const afterClear=known.find(x=>x.i>lastRain.i);
  if(afterClear){
    return isWk(afterClear)?'週末有望放晴':nm(afterClear)+'起放晴';
  }
  if(firstRain.i>0&&known.filter(x=>x.i>=firstRain.i).every(x=>x.st==='rain'))return nm(firstRain)+'起轉雨';
  return'晴雨交替，記得帶傘';
}
let wxOpen=(()=>{try{return localStorage.getItem(KEY+'.wxopen')!=='0'}catch(e){return true}})();
function renderWeather(){
  const p=$('#wxPanel'),d=cursor,ds=ymd(d),o=wxOf(d);
  const strip=Array.from({length:7},(_,i)=>{const x=addDays(new Date(),i),st=dayState(x),oo=wxOf(x);
    const first=PERIODS.map(([k])=>oo[k]&&oo[k].w).filter(w=>w!=null);
    const ic=st==='rain'?'🌧':first.length?WX_ICON[first[0]]:'·';
    return`<span class="tday ${st||''}"><i>${i===0?'今':WD[x.getDay()]}</i>${ic}</span>`}).join('');
  const sum=PERIODS.map(([k,n])=>`${n}${o[k]&&o[k].w!=null?WX_ICON[o[k].w]:'·'}`).join(' ');
  p.innerHTML=`<div class="wxtop"><div class="eyebrow">Weather · 天氣紀錄 · ${isToday(d)?'今天':`${d.getMonth()+1}/${d.getDate()}`}</div>
    <span class="wxsum">${sum}</span><button class="ib" id="wxTgl">${wxOpen?'收合':'展開'}</button></div>
  <div class="trend"><b>未來一週</b><span class="tt2">${trendText()}</span><span class="tstrip">${strip}</span></div>`+
  (wxOpen?`<div class="wxg">`+PERIODS.map(([k,name,ico])=>`<div class="wxp"><div class="wxh">${ico} ${name}</div>`+
    WX_GROUPS.map(([g,lab,opts])=>`<div class="wxrow"><span class="wxl">${lab}</span><div class="opts">`+
      opts.map((t,i)=>`<button class="opt ${o[k]&&o[k][g]===i?'sel':''}" data-p="${k}" data-g="${g}" data-i="${i}">${g==='w'?WX_ICON[i]+' ':''}${t}</button>`).join('')+`</div></div>`).join('')+`</div>`).join('')+`</div>`+
  (RO?'':`<div class="hint" style="margin-top:6px">點選即記錄，再點取消。要預報未來天氣，用上方日期切換到那天再勾。</div>`):'');
  p.querySelectorAll('.opt').forEach(b=>b.onclick=()=>setWx(ds,b.dataset.p,b.dataset.g,+b.dataset.i));
  $('#wxTgl').onclick=()=>{wxOpen=!wxOpen;try{localStorage.setItem(KEY+'.wxopen',wxOpen?'1':'0')}catch(e){}renderWeather()};
}

function renderAC(){
  const p=$('#acPanel'),day=isToday(cursor)?new Date():cursor;
  p.innerHTML=`<div class="acp"><div class="eyebrow">Air Conditioner · 冷氣</div>`+ACS.map(([k,name,,col])=>{
    const a=acu(k),last=[...a.log].reverse()[0],since=last?new Date(last.t):null,mins=acMins(day,k);
    const sinceTxt=since?`${ymd(since)===ymd(new Date())?'今天':`${since.getMonth()+1}/${since.getDate()}`} ${pad(since.getHours())}:${pad(since.getMinutes())} ${a.on?'開啟':'關閉'}`:'尚無紀錄';
    return`<div class="acu" style="--u:${col}"><div class="ac-row"><div class="ac-state ${a.on?'on':''}">${name} ${a.on?'開著':'關著'}</div>
      <button class="switch" data-k="${k}" aria-pressed="${a.on}" aria-label="${name}開關"></button></div>
      <div class="stepper">設定 <button data-k="${k}" data-d="-1" aria-label="降低">−</button><b>${a.temp}°C</b><button data-k="${k}" data-d="1" aria-label="提高">+</button></div>
      <div class="hint">${sinceTxt}${mins?` · ${isToday(cursor)?'今日':'當日'}共開 ${Math.floor(mins/60)} 小時 ${mins%60} 分`:''}</div>
      <div class="ng-actions" style="margin-top:4px"><button class="ib" data-edit="${k}">補記／修改時間</button></div></div>`}).join('')+`</div>`;
  p.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openAcEdit(b.dataset.edit));
  p.querySelectorAll('.switch').forEach(b=>b.onclick=()=>setAC(b.dataset.k,!acu(b.dataset.k).on));
  p.querySelectorAll('.stepper button').forEach(b=>b.onclick=()=>{if(RO)return;const u=acu(b.dataset.k);u.temp=Math.max(16,Math.min(30,u.temp+ +b.dataset.d));save();renderAC()});
}

function renderCards(){
  const today=new Date(),nm=nowMin();
  $('#nowLab').textContent=`RIGHT NOW · ${pad(today.getHours())}:${pad(today.getMinutes())}`;
  $('#cards').innerHTML=S.members.map(m=>{
    const evs=dayEvents(today,m.id),cur=evs.filter(x=>x.s<=nm&&nm<x.e).sort((a,b)=>b.s-a.s),nxt=evs.find(x=>x.s>nm);
    const c=cur[0],at=ageText(m.birth);
    return`<div class="mc ${c?'live':''}" style="--c:${m.color}" data-m="${m.id}">
      <div class="mh"><div class="av">${esc(m.glyph)}</div><div><div class="mn">${esc(m.name)}</div><div class="mr">${esc(m.role)}</div></div></div>
      ${at?`<div class="age">${at}</div>`:`<div class="age set" data-set="${m.id}">＋ 設定生日</div>`}
      <div class="now">${c?'<span class="pulse"></span>':''}<b>此刻</b></div>
      ${c?`<div class="doing">${esc(c.ev.title)}</div><div class="until">${hhmm(c.s)} – ${hhmm(c.e)}${cur.length>1?`（還有 ${cur.length-1} 件）`:''}</div>`:`<div class="doing idle">沒有安排</div>`}
      <div class="next">${nxt?`接下來 <b>${hhmm(nxt.s)}</b> ${esc(nxt.ev.title)}`:'今天沒有後續'}</div></div>`;
  }).join('');
  document.querySelectorAll('.mc').forEach(el=>el.onclick=e=>{
    if(e.target.dataset.set){openSettings(e.target.dataset.set);return}
    openEvent({member:el.dataset.m,start:hhmm(Math.floor(nowMin()/5)*5)});
  });
}

function renderView(){
  const box=$('#view'),H=$('#viewH');
  const lab=$('#lab');
  if(view==='day'){
    lab.textContent=`${cursor.getMonth()+1}月${cursor.getDate()}日 週${WD[cursor.getDay()]}`;
    const old=$('.tlbox'),sy=old?old.scrollTop:0,sx=old?old.scrollLeft:0;
    H.innerHTML='時間軸 <em>TIMELINE</em>';box.innerHTML=dayHTML();bindDay();
    if(old){const nb=$('.tlbox');nb.scrollTop=sy;nb.scrollLeft=sx}
    if(isToday(cursor)&&!renderView.done){const tb=$('.tlbox');if(tb)tb.scrollTop=Math.max(0,(nowMin()/60-2)*HH);renderView.done=true}
  }else if(view==='week'){
    const s=weekStart(cursor),e=addDays(s,6);
    lab.textContent=`${s.getMonth()+1}/${s.getDate()} – ${e.getMonth()+1}/${e.getDate()}`;
    H.innerHTML='本週作息 <em>THIS WEEK</em>';box.innerHTML=weekHTML(s);bindClicks();
  }else{
    lab.textContent=`${cursor.getFullYear()} 年 ${cursor.getMonth()+1} 月`;
    H.innerHTML='本月概覽 <em>THIS MONTH</em>';box.innerHTML=monthHTML();bindClicks();
  }
}
function weekStart(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x}

function dayHTML(){
  const n=S.members.length,d=cursor,t=isToday(d);
  let h=`<div class="tlbox"><div class="tl" style="--n:${n};--hh:${HH}px"><div class="tlh corner">時間</div>`+
    S.members.map(m=>`<div class="tlh" style="--c:${m.color}">${esc(m.name)}</div>`).join('');
  const rain=rainHours(d);
  h+=`<div class="axis">`+Array.from({length:24},(_,i)=>i?`<span style="top:${i*HH}px">${pad(i)}:00</span>`:'').join('')+
    rain.map(r=>`<div class="bar rn" style="top:${r*HH}px;height:${HH}px"></div>`).join('')+
    ACS.map(([k],i)=>acIntervals(d,k).map(([a,b])=>`<div class="bar ac${i}" style="top:${a/60*HH}px;height:${(b-a)/60*HH}px"></div>`).join('')).join('')+`</div>`;
  S.members.forEach(m=>{
    const evs=dayEvents(d,m.id),lanes=[];
    evs.forEach(x=>{let i=lanes.findIndex(end=>end<=x.s);if(i<0){i=lanes.length;lanes.push(0)}lanes[i]=x.e;x.lane=i});
    // 同時段重疊群組的欄數
    evs.forEach(x=>{x.cols=Math.max(...evs.filter(y=>y.s<x.e&&y.e>x.s).map(y=>y.lane))+1});
    h+=`<div class="col" data-m="${m.id}" style="--c:${m.color}">`+(t?`<div class="nowline" style="top:${nowMin()/60*HH}px"></div>`:'')+evs.map(x=>{
      const cur=t&&x.s<=nowMin()&&nowMin()<x.e,w=100/x.cols;
      return`<div class="ev ${cur?'cur':''} ${x.deferred?'defer':''}" data-id="${x.ev.id}" style="top:${x.s/60*HH}px;height:${Math.max(22,(x.e-x.s)/60*HH-2)}px;left:calc(${x.lane*w}% + 2px);width:calc(${w}% - 4px);--c:${m.color}">
        <div class="t">${hhmm(x.s)}–${hhmm(x.e)}${x.ev.repeat!=='none'?'<span class="rep">↻</span>':''}</div><b>${x.deferred?'↷ ':''}${t&&(S.q.evdone[ymd(new Date())]||{})[x.ev.id]?'✓ ':''}${esc(x.ev.title)}</b></div>`}).join('')+`</div>`;
  });
  h+=`</div></div><div class="legend"><span><i style="background:var(--ac)"></i>客廳冷氣開啟</span><span><i style="background:var(--ac2)"></i>主臥冷氣開啟</span><span><i style="background:var(--rain)"></i>雨天時段</span><span><i style="background:var(--now)"></i>現在</span><span>點空白處新增 · 點事項修改</span></div>`;
  return h;
}
function bindDay(){
  document.querySelectorAll('.col').forEach(c=>c.addEventListener('click',e=>{
    if(e.target.closest('.ev'))return;
    const y=e.clientY-c.getBoundingClientRect().top,m=Math.floor(y/HH*12)*5;
    openEvent({member:c.dataset.m,start:hhmm(m)});
  }));
  document.querySelectorAll('.ev').forEach(el=>el.onclick=()=>openEvent(S.events.find(x=>x.id===el.dataset.id),ymd(cursor)));
  // 今天：讓「現在」線跟著走
}
function bindClicks(){
  document.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{cursor=pd(el.dataset.go);view='day';renderView.done=false;render()});
  document.querySelectorAll('[data-ev]').forEach(el=>el.onclick=()=>openEvent(S.events.find(x=>x.id===el.dataset.ev),el.dataset.d));
}
function weekHTML(s){
  let h='<div class="week">';
  for(let i=0;i<7;i++){
    const d=addDays(s,i),ds=ymd(d),ac=acIntervals(d).length;
    h+=`<div class="wd ${isToday(d)?'today':''}"><div class="wdh" data-go="${ds}"><span class="d">${d.getDate()}</span><span class="w">週${WD[d.getDay()]}</span></div>
      <div class="wdw"><span>${wxIcons(d)}</span>${ACS.map(([k,,short,col])=>acIntervals(d,k).length?`<span style="color:${col}">❄ ${short}</span>`:'').join('')}</div>`;
    S.members.forEach(m=>{
      const evs=dayEvents(d,m.id);
      h+=`<div class="wm" style="--c:${m.color}"><div class="nm">${esc(m.name)}</div>`+
        (evs.length?evs.map(x=>`<div class="wl" data-ev="${x.ev.id}" data-d="${ds}"><span class="tt">${hhmm(x.s)}</span><span>${esc(x.ev.title)}</span></div>`).join(''):'<div class="empty">—</div>')+`</div>`;
    });
    h+='</div>';
  }
  return h+'</div>';
}
function monthHTML(){
  const y=cursor.getFullYear(),mo=cursor.getMonth(),first=new Date(y,mo,1),start=weekStart(first);
  let h='<div class="mhead">'+['一','二','三','四','五','六','日'].map(x=>`<div>${x}</div>`).join('')+'</div><div class="month">';
  for(let i=0;i<42;i++){
    const d=addDays(start,i);if(i>=35&&d.getMonth()!==mo)break;
    const evs=dayEvents(d),by=S.members.filter(m=>evs.some(x=>x.ev.member===m.id)),ac=acIntervals(d).length;
    h+=`<div class="md ${d.getMonth()!==mo?'out':''} ${isToday(d)?'today':''}" data-go="${ymd(d)}"><div class="n">${d.getDate()}<small>${hasRain(d)?'🌧':''}${ac?'❄':''}</small></div>
      <div class="cnt">${evs.length?evs.length+' 件':''}</div><div class="dots">${by.map(m=>`<i style="--c:${m.color}" title="${esc(m.name)}"></i>`).join('')}</div></div>`;
  }
  return h+`</div><div class="mlegend">${S.members.map(m=>`<span style="--c:${m.color}"><i></i>${esc(m.name)}</span>`).join('')}<span>❄ 當天有開冷氣</span></div>`;
}

/* ---------- 導覽 ---------- */
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{view=t.dataset.v;renderView.done=false;render()});
const step=n=>{
  if(view==='day')cursor=addDays(cursor,n);else if(view==='week')cursor=addDays(cursor,7*n);
  else cursor=new Date(cursor.getFullYear(),cursor.getMonth()+n,1);
  render();
};
$('#prev').onclick=()=>step(-1);$('#next').onclick=()=>step(1);
$('#today').onclick=()=>{cursor=new Date();renderView.done=false;render()};
$('#theme').onclick=()=>{
  const cur=document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  const t=cur==='dark'?'light':'dark';try{localStorage.setItem(KEY+'.theme',t)}catch(e){}applyTheme(t);
};
function applyTheme(t){try{t=t||localStorage.getItem(KEY+'.theme')}catch(e){}if(t&&t!=='auto')document.documentElement.dataset.theme=t}

/* ---------- 事項編輯 ---------- */
const dlg=$('#evDlg');let editing=null,editOcc=null;
const CHIPS=['吃飯','喝奶','副食品','午睡','散步','遊戲','洗澡','換尿布','上課','寫功課','外出','煮飯','打掃','看電影'];
function openEvent(ev,occ,banner){
  if(RO)return;
  const isNew=!ev||!ev.id;editing=isNew?null:ev;editOcc=occ||null;
  const d=isNew?{member:(ev&&ev.member)||S.members[0].id,title:(ev&&ev.title)||'',start:(ev&&ev.start)||hhmm(Math.floor(nowMin()/5)*5),end:ev&&ev.end,date:(ev&&ev.date)||ymd(cursor),repeat:(ev&&ev.repeat)||'none'}:{...ev};
  if(isNew&&!d.end)d.end=hhmm(Math.min(toMin(d.start)+60,1439));
  $('#evTitleH').textContent=isNew?'新增事項':'修改事項';
  $('#fMember').innerHTML=S.members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
  $('#fMember').value=d.member;$('#fTitle').value=d.title;$('#fStart').value=d.start;$('#fEnd').value=d.end;
  $('#fDate').value=d.date;$('#fRepeat').value=d.repeat;$('#fFlex').checked=!!d.flex;$('#fDone').checked=!isNew&&!!(S.q.evdone[ymd(new Date())]||{})[d.id];$('#fDone').closest('label').hidden=isNew;
  $('#fDateLab').textContent=d.repeat==='none'?'日期':'起始日';
  $('#chips').innerHTML=CHIPS.map(c=>`<button type="button" class="chip">${c}</button>`).join('');
  $('#chips').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{$('#fTitle').value=b.textContent});
  const bn=$('#evBanner');bn.hidden=!banner;bn.innerHTML=banner||'';
  $('#evDel').hidden=isNew;$('#evDelOne').hidden=isNew||d.repeat==='none';
  $('#evDel').textContent=!isNew&&d.repeat!=='none'?'刪除整個系列':'刪除';
  dlg.showModal();
}
$('#fRepeat').onchange=()=>$('#fDateLab').textContent=$('#fRepeat').value==='none'?'日期':'起始日';
$('#evCancel').onclick=()=>dlg.close();
$('#evForm').addEventListener('submit',e=>{
  e.preventDefault();
  const title=$('#fTitle').value.trim();if(!title){toast('請輸入做什麼');$('#fTitle').focus();return}
  if($('#fStart').value&&!t24($('#fStart').value)||$('#fEnd').value&&!t24($('#fEnd').value)){toast('時間請用 24 小時制，例如 14:30');return}
  let s=toMin(t24($('#fStart').value)||'00:00'),en=t24($('#fEnd').value)?toMin(t24($('#fEnd').value)):s+60;
  if(en<=s)en=Math.min(s+60,1439);if(en<=s){s=en-30}
  const o={member:$('#fMember').value,title,flex:$('#fFlex').checked,start:hhmm(s),end:hhmm(en),date:$('#fDate').value||ymd(new Date()),repeat:$('#fRepeat').value};
  if(editing){Object.assign(editing,o);const dd=(S.q.evdone[ymd(new Date())]=S.q.evdone[ymd(new Date())]||{});if($('#fDone').checked)dd[editing.id]=1;else delete dd[editing.id]}else S.events.push({id:uid(),skip:[],...o});
  if(typeof settle==='function')settle();
  save();dlg.close();render();toast('已儲存');
});
$('#evDel').onclick=()=>{if(editing){S.events=S.events.filter(x=>x!==editing);save();dlg.close();render();toast('已刪除')}};
$('#evDelOne').onclick=()=>{if(editing){(editing.skip=editing.skip||[]).push(editOcc||ymd(cursor));save();dlg.close();render();toast('已刪除這一天')}};
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
$('#addBtn').onclick=()=>openEvent({member:S.members[0].id});

/* ---------- 語音 ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function listen(onText,onState){
  if(!SR){toast('這個瀏覽器不支援語音辨識，請改用打字（Chrome / Safari 可用）');return null}
  const r=new SR();r.lang='zh-TW';r.interimResults=true;r.continuous=false;
  r.onresult=e=>{let t='';for(const x of e.results)t+=x[0].transcript;onText(t,e.results[e.results.length-1].isFinal)};
  r.onstart=()=>onState(true);r.onend=()=>onState(false);
  r.onerror=e=>{onState(false);toast(e.error==='not-allowed'?'麥克風權限被拒絕，請在瀏覽器網址列允許':'沒聽清楚，再試一次')};
  try{r.start()}catch(e){}return r;
}
const vo=$('#voDlg');let vr=null;
$('#voiceBtn').onclick=()=>{if(RO)return;$('#voText').textContent='按下麥克風開始說話';$('#voType').value='';vo.showModal();setTimeout(startVoice,200)};
function startVoice(){
  if(vr){try{vr.stop()}catch(e){}vr=null;return}
  vr=listen((t,fin)=>{$('#voText').textContent=t;$('#voType').value=t;if(fin)setTimeout(()=>apply(t),250)},on=>{$('#voGo').classList.toggle('rec',on);if(!on)vr=null});
}
$('#voGo').onclick=startVoice;
$('#voClose').onclick=()=>{if(vr)try{vr.stop()}catch(e){}vo.close()};
$('#voApply').onclick=()=>apply($('#voType').value||$('#voText').textContent);
$('#voType').addEventListener('keydown',e=>{if(e.key==='Enter')apply(e.target.value)});
document.querySelectorAll('.ex code').forEach(c=>c.onclick=()=>{$('#voType').value=c.textContent;$('#voText').textContent=c.textContent});
vo.addEventListener('click',e=>{if(e.target===vo)$('#voClose').click()});
let fr=null;
$('#fMic').onclick=()=>{
  if(fr){try{fr.stop()}catch(e){}return}
  fr=listen(t=>{$('#fTitle').value=t.replace(/[，。,.]/g,'')},on=>{$('#fMic').classList.toggle('rec',on);if(!on)fr=null});
};
function apply(text){
  text=(text||'').trim();if(!text||text.startsWith('按下麥克風'))return;
  if(vr){try{vr.stop()}catch(e){}}
  const r=parseCommand(text);
  if(r.error){toast(r.error);return}
  vo.close();
  if(r.intent==='book'){const x=importLines([r.line]);if(x.add){save();render();toast('已新增繪本')}else toast(x.dup?'書庫已有這本書':'格式：新增繪本：書名｜作者｜出版社｜領域｜年齡｜活動');return}
  if(r.intent==='night'){openNight(r.draft);return}
  if(r.intent==='feed'){openFeed(r.draft);return}
  if(r.intent==='ac'){r.units.forEach(k=>setAC(k,r.on,r.temp));toast(`${r.units.map(k=>ACS.find(a=>a[0]===k)[1]).join('、')}已${r.on?'開啟':'關閉'}`);return}
  if(r.intent==='delete'){
    const ev=r.target;if(!ev){toast('找不到要刪除的事項');return}
    openEvent(ev,r.date,`<b>要刪除這一項嗎？</b> 「${esc(text)}」<br>確認後請按下方「刪除」。`);return;
  }
  if(r.intent==='update'){
    if(!r.target){toast('找不到要修改的事項，已改為新增');openEvent(r.draft,null,`語音：「${esc(text)}」`);return}
    openEvent({...r.target,...r.patch},r.date,`<b>語音修改</b>：「${esc(text)}」<br>確認內容後按「儲存」。`);return;
  }
  openEvent(r.draft,null,`<b>語音新增</b>：「${esc(text)}」<br>確認內容後按「儲存」。`);
}

/* 中文語音指令解析 */
const CN={零:0,一:1,二:2,兩:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
function cn2n(s){s=s.trim();if(/^\d+$/.test(s))return+s;if(s==='十')return 10;let m;
  if(m=s.match(/^十(.)$/))return 10+CN[m[1]];if(m=s.match(/^(.)十$/))return CN[m[1]]*10;if(m=s.match(/^(.)十(.)$/))return CN[m[1]]*10+CN[m[2]];
  return s in CN?CN[s]:NaN}
const NUM='(?:\\d{1,2}|[零一二兩三四五六七八九十]{1,3})';
const PER='(上午|早上|早晨|清晨|凌晨|中午|下午|午後|傍晚|晚上|夜晚|半夜)?';
const TIME=`${PER}\\s*(${NUM})\\s*(?:點鐘|點|時|[:：])\\s*(半|${NUM}\\s*分?|整)?`;
function toMinutes(per,h,mi,hint){
  h=cn2n(h);if(isNaN(h))return null;
  let m=0;if(mi){m=mi==='半'?30:mi==='整'?0:cn2n(mi.replace('分',''));if(isNaN(m))m=0}
  const p=per||hint;
  if(/下午|午後|傍晚|晚上|夜晚/.test(p||'')){if(h<12)h+=12}
  else if(/中午/.test(p||'')){if(h<11)h+=12}
  else if(/凌晨|半夜/.test(p||'')){if(h===12)h=0}
  else if(!p&&h>=1&&h<=5)h+=12; // 沒講上下午的 1–5 點多半是下午
  return Math.min(h*60+m,1439);
}
function findTimes(t){
  const re=new RegExp(TIME,'g'),out=[];let m,hint=null;
  while(m=re.exec(t)){const per=m[1]||null;if(per&&!hint)hint=per;
    const v=toMinutes(per,m[2],m[3],out.length?hint:null);
    if(v!=null)out.push({v,idx:m.index,len:m[0].length})}
  return out;
}
function findMember(t){
  const low=t.toLowerCase();let best=null;
  for(const m of S.members){
    const names=[m.name,...(m.aliases||'').split(/[,，、\s]+/)].filter(Boolean);
    for(const n of names){const i=low.indexOf(n.toLowerCase());
      if(i>=0&&(!best||n.length>best.len))best={m,len:n.length,n,i}}
  }
  return best;
}
function cleanTitle(t,drop){
  let s=t;
  for(const d of drop)s=s.replace(d,' ');
  s=s.replace(/[，。,.!！?？]/g,' ').replace(/^\s*(在|從|由|於|新增|加入|幫我|請|提醒|要|的|到|至|~|-)+\s*/,'').replace(/(開始|要|的)\s*$/,'');
  return s.replace(/\s+/g,' ').replace(/^(去|要|的|在)\s*(?=\S{2,})/,'').trim();
}
function parseCommand(raw){
  let t=raw.replace(/\s+/g,' ').trim();
  const mem=findMember(t);
  // 新增繪本（標準指令）
  if(/^\s*新增繪本/.test(t))return{intent:'book',line:t};
  // 夜間事件
  if(/夜驚|哭醒|夜醒|咳嗽|夜奶/.test(t)){
    const types=[/夜驚|哭醒|夜醒/.test(t)&&'cry',/咳嗽/.test(t)&&'cough',/夜奶/.test(t)&&'milk'].filter(Boolean),tm=findTimes(t);
    const noP=!/上午|早上|下午|晚上|傍晚|凌晨|半夜|中午/.test(t),fix=v=>noP&&v>=780&&v<1080?v-720:v; // 沒講時段的 1–5 點視為凌晨
    return{intent:'night',draft:{types,who:mem?mem.m.id:defWho(),sh:tm[0]?hhmm(fix(tm[0].v)):null,eh:tm[1]?hhmm(fix(tm[1].v)):null}};
  }
  // 餵奶（有毫升／品質／拒喝反應等關鍵字才算，單純「喝奶」仍當作行程）
  if(/毫升|ml|cc|完全不喝|專心喝|不肯喝|推開奶瓶|安撫後|吐奶/i.test(t)){
    const m=t.match(/(\d{2,3})\s*(?:ml|毫升|cc)/i),ml=m?+m[1]:null,tm=findTimes(t);
    const amt=/完全不喝/.test(t)?3:ml!=null?bandFromMl(ml):null;
    const q=/專心/.test(t)?0:/安撫後(?:仍|還)?(?:不肯|不願|拒)|不肯喝|拒絕/.test(t)?2:/安撫後/.test(t)?1:null;
    const rej=[/推開/.test(t)&&0,/小哭|扭動/.test(t)&&1,/大哭/.test(t)&&2,/吐奶|咳出|咳/.test(t)&&3].filter(x=>x!==false);
    return{intent:'feed',draft:{who:mem?mem.m.id:defWho(),amt,q:q!=null?q:(amt===3?2:null),rej,ml:amt===3?null:ml,hm:tm[0]?hhmm(tm[0].v):null}};
  }
  // 冷氣
  if(/冷氣|空調|冷房/.test(t)&&!mem){
    const off=/(關|關掉|關閉|停)/.test(t);const tp=t.match(/(\d{2})\s*度/);
    const units=/客廳/.test(t)&&!/主臥|臥室|房間/.test(t)?['living']:/主臥|臥室|房間/.test(t)&&!/客廳/.test(t)?['master']:['living','master'];
    return{intent:'ac',on:!off,temp:tp?+tp[1]:null,units};
  }
  // 日期 / 重複
  let date=ymd(cursor),repeat='none',dropd=[];
  const dm=[[/大後天/,3],[/後天/,2],[/明天|明日/,1],[/昨天/,-1],[/今天|今日/,0]].find(([r])=>r.test(t));
  if(dm){date=ymd(addDays(new Date(),dm[1]));dropd.push(dm[0])}
  if(/每天|每日/.test(t)){repeat='daily';dropd.push(/每天|每日/)}
  else if(/平日|週一到週五|周一到周五|禮拜一到禮拜五/.test(t)){repeat='weekdays';dropd.push(/平日|週一到週五|周一到周五|禮拜一到禮拜五/)}
  else if(/每週|每周|每個星期|每星期/.test(t)){repeat='weekly';dropd.push(/每週|每周|每個星期|每星期/)}
  const isDel=/刪除|刪掉|取消|不用了|不要了/.test(t);
  const um=t.match(/(改成|改為|換成|改到|變成|修改為)/);
  const dropMember=mem?[new RegExp(mem.n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*(的|要|在)?','i')]:[];
  const dropWords=[/把|將/g,/現在|此刻|目前|剛剛/g,/刪除|刪掉|取消|不用了|不要了/g,...dropd,...dropMember];

  const find=(txt)=>{ // 依時間或標題關鍵字找目前顯示日的事項
    if(!mem)return null;const d=pd(date),evs=dayEvents(d,mem.m.id);if(!evs.length)return null;
    const tm=findTimes(txt);
    if(tm.length){const hit=evs.find(x=>x.s===tm[0].v)||evs.find(x=>x.s<=tm[0].v&&tm[0].v<x.e);if(hit)return hit.ev}
    const words=cleanTitle(txt,[...dropWords,new RegExp(TIME,'g')]);
    if(words){const hit=evs.find(x=>words.includes(x.ev.title)||x.ev.title.includes(words));if(hit)return hit.ev}
    const nm=nowMin(),cur=evs.find(x=>x.s<=nm&&nm<x.e);return cur?cur.ev:null;
  };

  if(isDel&&!um){return{intent:'delete',target:find(t),date}}
  if(um){
    const before=t.slice(0,um.index),after=t.slice(um.index+um[0].length);
    const target=find(before);
    const tm=findTimes(after),patch={};
    const title=cleanTitle(after,[new RegExp(TIME+'(?:\\s*(?:到|至|~|-|—)\\s*'+TIME+')?','g'),...dropd]);
    if(title)patch.title=title;
    if(tm.length){const old=target?toMin(target.start):tm[0].v,dur=target?toMin(target.end)-old:60;
      patch.start=hhmm(tm[0].v);patch.end=hhmm(tm[1]?tm[1].v:Math.min(tm[0].v+dur,1439))}
    const draft={member:mem?mem.m.id:S.members[0].id,title:title||'',start:patch.start||hhmm(nowMin()),end:patch.end,date,repeat};
    return{intent:'update',target,patch,draft,date};
  }
  // 新增
  const tm=findTimes(t);
  let start=nowMin(),end=null;
  if(tm.length){start=tm[0].v;if(tm[1]&&tm[1].v>tm[0].v)end=tm[1].v;
    else if(tm[1]){let e=tm[1].v+720;if(e<1440&&e>tm[0].v)end=e}}
  const title=cleanTitle(t,[new RegExp(TIME+'(?:\\s*(?:到|至|~|-|—)\\s*'+TIME+')?','g'),...dropWords]);
  if(!mem&&!title)return{error:'沒聽懂，請再說一次，例如「爸爸 晚上七點 帶狗散步」'};
  return{intent:'add',draft:{member:mem?mem.m.id:S.members[0].id,title,start:hhmm(Math.floor(start/5)*5===start?start:start),end:end!=null?hhmm(end):hhmm(Math.min(start+60,1439)),date,repeat}};
}

/* ---------- 複製今日回報 ---------- */
document.body.insertAdjacentHTML('beforeend',`<dialog id="rpDlg"><div class="dh">複製今日回報</div><div class="db">
  <label class="f">寶寶 / 成員<select id="rpWho"></select></label>
  <label class="f">內容（可先修改再複製）<textarea id="rpText" rows="12"></textarea></label></div>
  <div class="df"><button class="btn" id="rpClose" type="button">關閉</button><button class="btn pri" id="rpCopy" type="button">複製</button></div></dialog>`);
$('#theme').insertAdjacentHTML('beforebegin','<button class="ib" id="rpBtn">複製今日回報</button>');
function reportText(mid){
  const m=member(mid),d=new Date(),evs=dayEvents(d,mid),o=wxOf(d),a=ageText(m.birth);
  const L=[`【${m.name} 今日回報】${d.getMonth()+1}/${d.getDate()}（週${WD[d.getDay()]}）${a?' · '+a:''}`];
  const wx=PERIODS.filter(([k])=>o[k]&&o[k].w!=null).map(([k,n])=>`${n}${WX_GROUPS[0][2][o[k].w]}`);
  if(wx.length)L.push('天氣：'+wx.join('、'));
  const rn=PERIODS.filter(([k])=>o[k]&&o[k].r!=null).map(([k,n])=>`${n}${WX_GROUPS[1][2][o[k].r]}`);
  if(rn.length)L.push('降雨機率：'+rn.join('、'));
  const fl=PERIODS.filter(([k])=>o[k]&&o[k].t!=null).map(([k,n])=>`${n}${WX_GROUPS[2][2][o[k].t]}`);
  if(fl.length)L.push('體感：'+fl.join('、'));
  const ind=PERIODS.map(([k,n])=>{const x=o[k]||{},t=[x.l!=null?'光線'+WX_GROUPS[3][2][x.l]:'',x.a!=null?WX_GROUPS[4][2][x.a]:''].filter(Boolean);return t.length?`${n}${t.join('、')}`:''}).filter(Boolean);
  if(ind.length)L.push('室內：'+ind.join('｜'));
  const acT=ACS.map(([k,,short])=>{const m=acMins(d,k);return m?`${short} ${Math.floor(m/60)} 小時 ${m%60} 分`:''}).filter(Boolean);
  if(acT.length)L.push('冷氣：今日開 '+acT.join('、'));
  const fs=feedsOn(ymd(d),mid);
  if(fs.length){L.push(`餵奶：${fs.length} 次，約 ${fs.reduce((t,f)=>t+fMl(f),0)} ml`);
    fs.forEach(f=>{const rj=fRej(f);L.push(`・${fTime(f)} ${F_AMT[f.amt][0]}${f.ml!=null&&f.ml!==''?' '+f.ml+'ml':''}｜${F_Q[f.q]}${rj?'（'+rj+'）':''}`)})}
  const ns=nightStats(ymd(d),mid);
  if(ns.count)L.push(`昨夜：${whoNames(ns.evs)}醒 ${ns.count} 次，共 ${fmtDur(ns.total)}，最長連續睡眠 ${fmtDur(ns.longest)}`);
  L.push('','今日行程：');
  if(evs.length)evs.forEach(x=>L.push(`・${hhmm(x.s)}–${hhmm(x.e)} ${x.ev.title}`));else L.push('（今天沒有安排）');
  return L.join('\n');
}
function fillReport(){$('#rpText').value=reportText($('#rpWho').value)}
$('#rpBtn').onclick=()=>{
  const def=(S.members.find(m=>m.id==='tangyuan')||S.members.find(m=>/寶寶/.test(m.name+m.role))||S.members[0]).id;
  $('#rpWho').innerHTML=S.members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
  $('#rpWho').value=def;fillReport();$('#rpDlg').showModal();
};
$('#rpWho').onchange=fillReport;
$('#rpClose').onclick=()=>$('#rpDlg').close();
$('#rpDlg').addEventListener('click',e=>{if(e.target.id==='rpDlg')$('#rpDlg').close()});
$('#rpCopy').onclick=async()=>{
  const ta=$('#rpText'),t=ta.value;let ok=false;
  try{await navigator.clipboard.writeText(t);ok=true}catch(e){}
  if(!ok){try{ta.focus();ta.select();ok=document.execCommand('copy')}catch(e){}}
  if(ok){if(!RO){const dk=ymd(new Date());(S.q.flag[dk]=S.q.flag[dk]||{}).report=1;settle();save()}toast('已複製，可以直接貼到 LINE / 訊息');$('#rpDlg').close()}else{ta.focus();ta.select();toast('請按 Ctrl+C 手動複製')}
};

/* ---------- 設定 ---------- */
const sd=$('#setDlg');
const PALETTE=['#b5573a','#2f5168','#c9962f','#b86a77','#7f9467','#6b4a35','#6a4c7d','#3f7f7c'];
function openSettings(focusId){
  if(RO)return;
  $('#setBody').innerHTML=`<div class="hint">每位家人可以設定生日，首頁會自動算出今天幾歲幾個月。「別名」是語音辨識用的暱稱，用逗號分隔。</div>`+
  S.members.map((m,i)=>{const a=ageText(m.birth);return`<div class="mset" style="--c:${m.color}" data-i="${i}" id="ms-${m.id}">
    <div class="row"><label class="f">名字<input data-k="name" value="${esc(m.name)}"></label><label class="f">身分<input data-k="role" value="${esc(m.role)}"></label></div>
    <div class="row"><label class="f">生日<input type="date" data-k="birth" value="${esc(m.birth)}"></label><label class="f">頭像字<input data-k="glyph" maxlength="2" value="${esc(m.glyph)}"></label>
      <label class="f">顏色<input type="color" data-k="color" value="${m.color}" list="pal"></label></div>
    <label class="f">別名（語音用）<input data-k="aliases" value="${esc(m.aliases||'')}"></label>
    <div class="hint">${a?`目前：${a}`:'尚未設定生日'} <button class="chip" data-del="${i}" type="button" style="float:right;color:var(--now)">移除</button></div></div>`}).join('')+
  `<datalist id="pal">${PALETTE.map(c=>`<option>${c}</option>`).join('')}</datalist>
   <button class="btn" id="addMember" type="button">＋ 新增家人</button>
   ${S.events.some(e=>e.sample)?'<button class="btn del" id="clrSample" type="button">清除範例事項</button>':''}`;
  sd.showModal();
  if(focusId){const el=$('#ms-'+focusId);if(el)el.scrollIntoView({block:'center'})}
  $('#addMember').onclick=()=>{collect();S.members.push({id:uid(),name:'新成員',role:'',glyph:'新',color:PALETTE[S.members.length%PALETTE.length],birth:'',aliases:''});save();openSettings()};
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    collect();const m=S.members[+b.dataset.del];if(!confirm(`移除「${m.name}」和他所有的事項？`))return;
    S.members.splice(+b.dataset.del,1);S.events=S.events.filter(e=>e.member!==m.id);save();openSettings();render()});
  const cs=$('#clrSample');if(cs)cs.onclick=()=>{S.events=S.events.filter(e=>!e.sample);save();openSettings();render();toast('範例已清除')};
}
function collect(){
  document.querySelectorAll('.mset[data-i]').forEach(el=>{const m=S.members[+el.dataset.i];if(!m)return;
    el.querySelectorAll('[data-k]').forEach(i=>{m[i.dataset.k]=i.value.trim?i.value.trim():i.value})});
}
$('#settingsBtn').onclick=()=>openSettings();
$('#setDone').onclick=()=>{collect();save();sd.close();render()};
sd.addEventListener('click',e=>{if(e.target===sd){collect();save();sd.close();render()}});
sd.addEventListener('cancel',()=>{collect();save()});
$('#exportBtn').onclick=()=>{collect();const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download=`family-routine-${ymd(new Date())}.json`;a.click()};
$('#importBtn').onclick=()=>$('#importFile').click();
$('#importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;
  try{const x=JSON.parse(await f.text());if(!x.members||!x.events)throw 0;S=x;norm();save();sd.close();render();toast('已匯入')}catch(err){toast('檔案格式不正確')}};

/* 畫面骨架與對話框 */
document.querySelector('.hero').insertAdjacentHTML('beforebegin','<div class="lowb" id="lowBanner" hidden></div>');
document.getElementById('nowSec').insertAdjacentHTML('beforebegin','<section class="sec"><div class="panel" id="ngPanel"></div></section>');
document.getElementById('viewSec').insertAdjacentHTML('afterend','<section class="sec" id="ngSec"><h2>夜間消耗分析 <em>NIGHT FATIGUE</em></h2><div class="panel" id="ngAna" style="margin-top:12px"></div></section>');
document.body.insertAdjacentHTML('beforeend',`<dialog id="ngDlg"><form method="dialog" id="ngForm"><div class="dh" id="ngH">記錄夜間事件</div><div class="db">
  <div class="wxl">類型（可複選）</div><div class="chips" id="ngTypes"></div>
  <label class="f">備註（選填）<input id="ngNote" placeholder="例如：喝了 90ml、拍背後睡著" autocomplete="off"></label>
  <label class="f">誰醒了<select id="ngWho"></select></label>
  <div class="row"><label class="f">開始<input type="time" id="ngS"></label><label class="f">結束<input type="time" id="ngE"></label></div>
  <label class="f">日期（開始的那一天）<input type="date" id="ngD"></label>
  <div class="ngdur" id="ngDur"></div>
  <div><div class="wxl">這次的辛苦程度</div><div class="chips" id="ngSev"></div></div></div>
  <div class="df"><button type="button" class="btn del" id="ngDel" hidden>刪除</button><span class="sp"></span><button type="button" class="btn" id="ngCancelBtn">取消</button><button type="submit" class="btn pri">儲存</button></div></form></dialog>`);

$('#fRepeat').closest('.row').insertAdjacentHTML('afterend','<label class="f chk"><span><input type="checkbox" id="fFlex"> 非必要（可延後的家務；低能量日會自動順延）</span></label><label class="f chk"><span><input type="checkbox" id="fDone"> 今天已完成（與任務清單／RPG 同步）</span></label>');

/* ---------- 夜間照顧與消耗記錄 ---------- */
const NIGHT_TYPES=[['cry','夜驚/哭醒','😢'],['cough','咳嗽安撫','😷'],['milk','夜奶','🍼'],['other','其他','＋']];
const NL=[['睡得好','#7f9467'],['輕微','#c9962f'],['中度','#b5573a'],['嚴重','#8a2b22']]; // 夜晚等級：標籤與顏色
const SEV=['輕','中','重'],SEVW=[1,1.3,1.6];
const SLEEP_FROM='22:00',SLEEP_MIN=510; // 睡眠視窗 22:00–06:30（用來算最長連續睡眠）
const DEPRIVED_MIN=240; // 連續睡眠短於 4 小時算「被剝奪」
const dtStr=d=>`${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dtParse=s=>{const [a,b]=s.split('T'),d=pd(a),[h,m]=b.split(':').map(Number);d.setHours(h,m,0,0);return d};
const durMin=n=>Math.max(0,Math.round((dtParse(n.e)-dtParse(n.s))/6e4));
const fmtDur=m=>m<=0?'0 分鐘':m>=60?`${Math.floor(m/60)} 小時${m%60?` ${m%60} 分鐘`:''}`:`${m} 分鐘`;
const nightKey=n=>{const d=dtParse(n.s);if(d.getHours()>=14)d.setDate(d.getDate()+1);return ymd(d)}; // 歸在「醒來那天」：凌晨 02:24 算今天，23:30 算明天
const ntype=k=>NIGHT_TYPES.find(t=>t[0]===k)||NIGHT_TYPES[3];
const ntypes=n=>(n.types&&n.types.length?n.types:[n.type||'other']); // 可複選；舊資料只有單一 type
const ntLabel=n=>ntypes(n).map(k=>ntype(k)[1]).join(' + ');
const ntIcons=n=>ntypes(n).map(k=>ntype(k)[2]).join('');
function resolveTime(hm){ // 只講幾點時，取「最近一次已經過的」那個時間
  const [h,m]=hm.split(':').map(Number),d=new Date();d.setHours(h,m,0,0);
  if(d.getTime()>Date.now()+5*6e4)d.setDate(d.getDate()-1);return d;
}
function nightStats(key,who){
  const evs=S.nights.filter(n=>nightKey(n)===key&&(!who||n.who===who));
  const ws=+dtParse(ymd(addDays(pd(key),-1))+'T'+SLEEP_FROM),we=ws+SLEEP_MIN*6e4; // key＝醒來那天，睡眠視窗從前一晚 22:00 開始
  const iv=evs.map(n=>[Math.max(+dtParse(n.s),ws),Math.min(+dtParse(n.e),we)]).filter(([a,b])=>b>a).sort((x,y)=>x[0]-y[0]);
  let cur=ws,longest=0;for(const [a,b] of iv){longest=Math.max(longest,a-cur);cur=Math.max(cur,b)}
  longest=Math.round(Math.max(longest,we-cur)/6e4);
  const total=evs.reduce((t,n)=>t+durMin(n),0),count=evs.length;
  const score=Math.round(evs.reduce((t,n)=>t+durMin(n)*SEVW[(n.sev||2)-1],0)+10*count);
  const level=!count?0:(total>=90||longest<180||score>=150)?3:(total<30&&longest>=300)?1:2;
  return{key,evs,count,total,score,longest,level,deprived:count>0&&longest<DEPRIVED_MIN};
}
const whoNames=evs=>{const ids=[...new Set(evs.map(n=>n.who))].filter(id=>member(id));return(ids.length?ids:[defWho()]).map(id=>member(id).name).join('、')}; // 誰醒了（主詞）
const lastNightKey=()=>ymd(addDays(new Date(),new Date().getHours()>=20?1:0)); // 20:00 後顯示「今晚」
const defWho=()=>(S.members.find(m=>m.id==='tangyuan')||S.members.find(m=>/寶寶/.test(m.name+m.role))||S.members[0]).id;

/* 低能量模式：依「昨夜」決定今天要不要精簡 */
function lowState(d){
  if(ymd(d)!==ymd(new Date()))return null;
  const lm=S.lowMode&&S.lowMode.date===ymd(d)?S.lowMode.mode:null;
  const st=nightStats(ymd(d)),auto=st.level>=2;
  const on=lm==='on'||(lm!=='off'&&auto);
  return{on,auto,manual:lm==='on',off:lm==='off',st,level:on?Math.max(2,st.level):0};
}
function setLow(mode){S.lowMode={date:ymd(new Date()),mode};save();render()}

/* 快速記錄面板 */
function renderNight(){
  const p=$('#ngPanel');if(!p)return;
  const key=lastNightKey(),st=nightStats(key),isTonight=key!==ymd(new Date());
  const tm=S.nightTimer,lv=NL[st.level];
  const timer=tm?`<div class="ngtimer" style="--c:${NL[3][1]}"><span class="pulse"></span><b>${esc(ntLabel(tm))}</b> 進行中 <span id="ngClock" class="ngclock"></span>
    <span class="sp"></span><span class="ng-actions"><button class="btn pri" id="ngEnd">結束並記錄</button><button class="btn" id="ngCancel">取消</button></span></div>`:'';
  p.innerHTML=`<div class="wxtop"><div class="eyebrow">Night Care · 夜間照顧與消耗記錄</div></div>${timer}
  <div class="ngsum"><span class="badge" style="color:${lv[1]}">${isTonight?'今晚':'昨夜'} · ${lv[0]}</span>
    ${st.count?`${esc(whoNames(st.evs))} 醒 <b>${st.count}</b> 次 · 共 <b>${fmtDur(st.total)}</b> · 最長連續睡眠 <b>${fmtDur(st.longest)}</b>`:'<span class="hint">目前沒有夜醒紀錄</span>'}</div>
  <div class="ng-actions"><div class="ngbtns">${NIGHT_TYPES.map(t=>`<button class="ngb ${tm&&ntypes(tm).includes(t[0])?'on':''}" data-t="${t[0]}"><i>${t[2]}</i>${t[1]}</button>`).join('')}</div>
    <div class="hint" style="margin-top:6px">點一下就開始計時；醒來結束時按「結束並記錄」。事後補記請按「＋」。</div></div>`;
  p.querySelectorAll('.ngb').forEach(b=>b.onclick=()=>{
    if(RO)return;
    const k=b.dataset.t,tm=S.nightTimer;
    if(tm){ // 計時中：再點其他類型＝複選加入，再點一次＝取消
      const cur=ntypes(tm),has=cur.includes(k);
      if(has&&cur.length===1){toast('至少要保留一種類型');return}
      tm.types=has?cur.filter(x=>x!==k):[...cur,k];save();renderNight();return;
    }
    if(k==='other'){openNight({});return}
    S.nightTimer={types:[k],who:defWho(),s:dtStr(new Date())};save();renderNight();toast(`${ntype(k)[1]} 開始計時，可再點其他類型一起記錄`);
  });
  const en=$('#ngEnd');if(en)en.onclick=()=>{const t=S.nightTimer;openNight({types:ntypes(t),who:t.who,s:t.s,e:dtStr(new Date()),timer:true})};
  const cn=$('#ngCancel');if(cn)cn.onclick=()=>{delete S.nightTimer;save();renderNight()};
  tickTimer();
}
function tickTimer(){const el=$('#ngClock'),t=S.nightTimer;if(!el||!t)return;
  const sec=Math.max(0,Math.floor((Date.now()-dtParse(t.s))/1e3));el.textContent=`${pad(Math.floor(sec/3600))}:${pad(Math.floor(sec%3600/60))}:${pad(sec%60)}`}
setInterval(tickTimer,1000);

/* 低能量橫幅 */
function renderLow(){
  const b=$('#lowBanner');if(!b)return;
  const ls=lowState(new Date());
  if(!ls||(!ls.on&&!ls.auto)){b.hidden=true;return}
  b.hidden=false;const st=ls.st,lv=NL[st.level];
  const base=baseDayEvents(new Date()).filter(x=>x.ev.flex);
  let body;
  if(ls.on){
    const moved=base.length?base.map(x=>`${esc(member(x.ev.member).name)} ${esc(x.ev.title)}`).join('、'):'';
    body=`<div class="lowh">🌙 今天是低能量日 <span class="badge" style="color:${lv[1]}">${ls.manual&&!ls.auto?'手動啟用':'昨夜'+lv[0]}</span></div>
    <div>${st.count?`${whoNames(st.evs)}昨夜醒 ${st.count} 次，共 ${fmtDur(st.total)}，最長連續睡眠 ${fmtDur(st.longest)}。`:'已手動切換為精簡作息。'}</div>
    <div>${base.length?(ls.level>=3?`已把 ${base.length} 項非必要事項順延到明天：${moved}。`:`已把早上的非必要事項（${moved}）推到 15:00 之後。`):'目前沒有標記為「可延後」的事項（編輯事項時可勾選）。'}</div>
    <div class="hint">備案：寶寶午睡時一起休息 20–30 分鐘 · 正餐用最簡單的備案 · 其餘等有體力再做。</div>
    <div class="ng-actions"><button class="btn" id="lowOff">改回正常作息</button></div>`;
  }else{
    body=`<div class="lowh">🌙 昨夜${lv[0]}（${whoNames(st.evs)}醒 ${st.count} 次，共 ${fmtDur(st.total)}）</div><div>你已選擇今天維持正常作息。</div>
    <div class="ng-actions"><button class="btn pri" id="lowOn">改用低能量模式</button></div>`;
  }
  b.innerHTML=body;
  const f=$('#lowOff');if(f)f.onclick=()=>setLow('off');const o=$('#lowOn');if(o)o.onclick=()=>setLow('on');
}

/* 事件編輯 */
let ngEditing=null,ngTypes=['cry'],ngSev=2,ngFromTimer=false;
function openNight(o){
  if(RO)return;
  const isNew=!o.id;ngEditing=isNew?null:o;ngFromTimer=!!o.timer;
  ngTypes=o.id||o.types||o.type?ntypes(o):['cry'];ngSev=o.sev||2;
  const now=new Date();
  const s=o.s?dtParse(o.s):(o.sh?resolveTime(o.sh):new Date(now.getTime()-30*6e4));
  let e=o.e?dtParse(o.e):(o.eh?(()=>{const x=new Date(s);const[h,m]=o.eh.split(':').map(Number);x.setHours(h,m,0,0);if(x<=s)x.setDate(x.getDate()+1);return x})():now);
  $('#ngH').textContent=isNew?'記錄夜間事件':'修改夜間事件';
  $('#ngWho').innerHTML=S.members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
  $('#ngWho').value=o.who&&member(o.who)?o.who:defWho();
  $('#ngNote').value=o.note||'';
  $('#ngS').value=hhmm(s.getHours()*60+s.getMinutes());$('#ngE').value=hhmm(e.getHours()*60+e.getMinutes());$('#ngD').value=ymd(s);
  $('#ngDel').hidden=isNew;ngPaint();ngDur();$('#ngDlg').showModal();
}
function ngPaint(){
  $('#ngTypes').innerHTML=NIGHT_TYPES.map(t=>`<button type="button" class="opt ${ngTypes.includes(t[0])?'sel':''}" data-t="${t[0]}">${t[2]} ${t[1]}</button>`).join('');
  $('#ngSev').innerHTML=SEV.map((t,i)=>`<button type="button" class="opt ${i+1===ngSev?'sel':''}" data-s="${i+1}">${t}</button>`).join('');
  $('#ngTypes').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const k=b.dataset.t;ngTypes=ngTypes.includes(k)?ngTypes.filter(x=>x!==k):[...ngTypes,k];ngPaint()});
  $('#ngSev').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ngSev=+b.dataset.s;ngPaint()});
}
function ngRange(){
  const d=$('#ngD').value,sv=t24($('#ngS').value),ev=t24($('#ngE').value);if(!d||!sv||!ev)return null;
  const s=dtParse(d+'T'+sv);let e=dtParse(d+'T'+ev);if(+e===+s)e=new Date(+s+6e4);else if(e<s)e.setDate(e.getDate()+1);return{s,e,m:Math.round((e-s)/6e4)};
}
function ngDur(){const r=ngRange();$('#ngDur').innerHTML=r?`中斷總時長：<b>${fmtDur(r.m)}</b>${r.m>=360?' <span class="hint">（超過 6 小時，請確認時間）</span>':''}`:'請填入開始與結束時間'}
['ngS','ngE','ngD'].forEach(i=>$('#'+i).addEventListener('input',ngDur));
$('#ngCancelBtn').onclick=()=>$('#ngDlg').close();
$('#ngForm').addEventListener('submit',e=>{
  e.preventDefault();const r=ngRange();if(!r||r.m<=0){toast('請確認開始與結束時間');return}
  if(!ngTypes.length){toast('請至少選一種類型');return}
  const o={types:[...ngTypes],type:ngTypes[0],who:$('#ngWho').value,note:$('#ngNote').value.trim(),sev:ngSev,s:dtStr(r.s),e:dtStr(r.e)};
  if(ngEditing)Object.assign(ngEditing,o);else S.nights.push({id:uid(),...o});
  if(ngFromTimer)delete S.nightTimer;
  save();$('#ngDlg').close();render();toast(`已記錄：${fmtDur(r.m)}`);
});
$('#ngDel').onclick=()=>{if(ngEditing&&confirm('刪除這筆夜間紀錄？')){S.nights=S.nights.filter(x=>x!==ngEditing);save();$('#ngDlg').close();render()}};
$('#ngDlg').addEventListener('click',e=>{if(e.target.id==='ngDlg')$('#ngDlg').close()});

/* 分析 */
let nRange='week',nOff=0;
function nRangeInfo(off=nOff){
  const today=new Date();let start,len;
  if(nRange==='week'){start=weekStart(addDays(today,7*off));len=7}
  else{start=new Date(today.getFullYear(),today.getMonth()+off,1);len=new Date(start.getFullYear(),start.getMonth()+1,0).getDate()}
  return{start,len,days:Array.from({length:len},(_,i)=>addDays(start,i))};
}
function rangeStats(off){
  const r=nRangeInfo(off),todayKey=ymd(new Date()),stats=r.days.map(d=>({d,...nightStats(ymd(d))}));
  const past=stats.filter(x=>ymd(x.d)<=todayKey);
  return{r,stats,past,count:past.reduce((t,x)=>t+x.count,0),total:past.reduce((t,x)=>t+x.total,0),
    hit:past.filter(x=>x.count>0).length,deprived:past.filter(x=>x.deprived).length,worst:[...past].filter(x=>x.count).sort((a,b)=>b.score-a.score)};
}
function renderNightAna(){
  const box=$('#ngAna');if(!box)return;
  const R=rangeStats(nOff),P=rangeStats(nOff-1),maxT=Math.max(30,...R.stats.map(x=>x.total));
  const lab=nRange==='week'?`${R.r.start.getMonth()+1}/${R.r.start.getDate()} – ${addDays(R.r.start,6).getMonth()+1}/${addDays(R.r.start,6).getDate()}`:`${R.r.start.getFullYear()} 年 ${R.r.start.getMonth()+1} 月`;
  const unit=nRange==='week'?'週':'月',nights=R.past.length;
  let sentence='';
  if(R.worst.length){const w=R.worst[0];
    sentence=`<b>${nRange==='week'?'這週':'這個月'}消耗最大的是 ${w.d.getMonth()+1}/${w.d.getDate()}（週${WD[w.d.getDay()]}）早晨前的那一夜</b>：${esc(whoNames(w.evs))} 醒 ${w.count} 次、共 ${fmtDur(w.total)}，最長連續睡眠只有 ${fmtDur(w.longest)}。`;
    if(R.worst.length>1)sentence+=` 其次是 ${R.worst.slice(1,3).map(x=>`${x.d.getMonth()+1}/${x.d.getDate()}`).join('、')}。`;
  }else sentence=nights?`這${unit}目前沒有夜醒紀錄。`:'這段期間還沒有資料。';
  const diff=R.total-P.total,cmp=(P.count||R.count)?`<div class="hint">和上${unit}比：夜醒 ${R.count} 次（上${unit} ${P.count} 次）· 安撫時長${diff>=0?'多':'少'} ${fmtDur(Math.abs(diff))}</div>`:'';
  const typeCnt=NIGHT_TYPES.map(t=>[t,R.past.reduce((s,x)=>s+x.evs.filter(n=>ntypes(n).includes(t[0])).length,0)]).filter(x=>x[1]);
  const evs=R.past.flatMap(x=>x.evs).sort((a,b)=>b.s.localeCompare(a.s));
  box.innerHTML=`<div class="ngtabs"><div class="tabs"><button class="tab" data-r="week" aria-selected="${nRange==='week'}">每週</button><button class="tab" data-r="month" aria-selected="${nRange==='month'}">每月</button></div>
    <span class="sp"></span><div class="pager"><button class="ib" id="nPrev">‹</button><span class="lab">${lab}</span><button class="ib" id="nNext">›</button></div></div>
  <div class="ngcards">
    <div class="ngc"><i>${R.count}</i><span>夜醒次數</span></div>
    <div class="ngc"><i>${fmtDur(R.total)}</i><span>總安撫時長</span></div>
    <div class="ngc"><i>${R.deprived}<small> / ${nights} 晚</small></i><span>連續睡眠不到 ${DEPRIVED_MIN/60} 小時</span></div>
    <div class="ngc"><i>${nights?(R.count/nights).toFixed(1):'0'}</i><span>平均每晚醒幾次（被打斷 ${R.hit} 晚）</span></div></div>
  <div class="ngsent">${sentence}${cmp}</div>
  <div class="ngchart ${nRange}">${R.stats.map(x=>{
    const fut=ymd(x.d)>ymd(new Date()),h=x.total?Math.max(4,Math.round(x.total/maxT*120)):0,best=R.worst[0]&&R.worst[0].key===x.key;
    return`<div class="ngbar ${fut?'fut':''}" title="${x.d.getMonth()+1}/${x.d.getDate()} ${whoNames(x.evs)} 醒 ${x.count} 次 · ${fmtDur(x.total)} · 最長連續 ${fmtDur(x.longest)}">
      <em>${x.count?(best?'★':'')+x.count:''}</em><div class="bw"><div class="bf" style="height:${h}px;background:${NL[x.level][1]}"></div></div>
      <span>${nRange==='week'?'週'+WD[x.d.getDay()]:x.d.getDate()}</span>${nRange==='week'?`<small>${x.d.getMonth()+1}/${x.d.getDate()}</small>`:''}<u>${x.deprived?'斷':''}</u></div>`}).join('')}</div>
  <div class="mlegend">${NL.map(l=>`<span><i style="background:${l[1]}"></i>${l[0]}</span>`).join('')}<span>「斷」＝當晚連續睡眠不到 ${DEPRIVED_MIN/60} 小時 · 柱高＝安撫總時長</span></div>
  ${typeCnt.length?`<div class="ngtypes">${typeCnt.map(([t,c])=>`<span class="chip">${t[2]} ${t[1]} ${c} 次</span>`).join('')}</div>`:''}
  ${evs.length?`<div class="nglog">`+evs.slice(0,nRange==='week'?30:60).map(n=>{const s=dtParse(n.s),e=dtParse(n.e),w=member(n.who);
    return`<div class="ngrow" data-id="${n.id}"><span class="when">${s.getMonth()+1}/${s.getDate()} ${hhmm(s.getHours()*60+s.getMinutes())}–${hhmm(e.getHours()*60+e.getMinutes())}</span><span>${ntIcons(n)} ${esc(ntLabel(n))}${n.note?'（'+esc(n.note)+'）':''}</span><span class="who">${esc(w?w.name:'')}</span><b>${fmtDur(durMin(n))}</b><span class="sv">${SEV[(n.sev||2)-1]}</span></div>`}).join('')+`</div>`:''}
  <div class="hint" style="margin-top:8px">沒有記錄的夜晚視為沒有夜醒。一天的柱子代表「前一晚 22:00 到當天 06:30」，歸在醒來那一天（例如週一的柱子＝週日夜到週一清晨）。</div>`;
  box.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{nRange=b.dataset.r;nOff=0;renderNightAna()});
  $('#nPrev').onclick=()=>{nOff--;renderNightAna()};$('#nNext').onclick=()=>{if(nOff<0){nOff++;renderNightAna()}};
  box.querySelectorAll('.ngrow').forEach(r=>r.onclick=()=>{const n=S.nights.find(x=>x.id===r.dataset.id);if(n&&!RO)openNight(n)});
}


/* ---------- 24 小時制時間輸入（避免瀏覽器顯示上午 / 下午） ---------- */
function t24(v){ // 接受 0224、2:24、02:24 → 'HH:MM'；不合法回傳 ''
  const m=String(v||'').trim().match(/^(\d{1,2})\s*[:：.]?\s*(\d{2})$/);if(!m)return'';
  const h=+m[1],mi=+m[2];return h<24&&mi<60?`${pad(h)}:${pad(mi)}`:'';
}
function time24(el){
  el.type='text';el.inputMode='numeric';el.placeholder='HH:MM（24 小時）';el.maxLength=5;el.autocomplete='off';
  el.addEventListener('input',()=>{let v=el.value.replace(/[^\d:：]/g,'');if(/^\d{4}$/.test(v))v=v.slice(0,2)+':'+v.slice(2);el.value=v});
  el.addEventListener('blur',()=>{const n=t24(el.value);if(n){el.value=n;el.dispatchEvent(new Event('input'))}});
}
['fStart','fEnd','ngS','ngE'].forEach(id=>time24($('#'+id)));

/* 骨架 */
document.getElementById('nowSec').insertAdjacentHTML('beforebegin','<section class="sec"><div class="panel" id="fdPanel"></div></section>');
document.getElementById('ngSec').insertAdjacentHTML('afterend','<section class="sec" id="fdSec"><h2>餵奶統計 <em>FEEDING LOG</em></h2><div class="panel" id="fdAna" style="margin-top:12px"></div></section>');
document.body.insertAdjacentHTML('beforeend',`<dialog id="fdDlg"><form method="dialog" id="fdForm"><div class="dh" id="fdH">記錄餵奶</div><div class="db">
  <label class="f">誰<select id="fdWho"></select></label>
  <div class="row"><label class="f">時間（24 小時制）<input id="fdT"></label><label class="f">日期<input type="date" id="fdD"></label></div>
  <div><div class="wxl">奶量</div><div class="chips" id="fdAmt"></div></div>
  <label class="f">實際毫升（選填，填了會自動選級距）<input type="number" id="fdMl" inputmode="numeric" min="0" max="400" placeholder="例如 150"></label>
  <div><div class="wxl">餵奶品質</div><div class="chips" id="fdQ"></div></div>
  <div id="fdRejBox" hidden><div class="wxl">不肯喝時的反應（可複選）</div><div class="chips" id="fdRej"></div></div>
  <label class="f">備註（選填）<input id="fdNote" placeholder="例如：換奶嘴後比較願意喝" autocomplete="off"></label></div>
  <div class="df"><button type="button" class="btn del" id="fdDel" hidden>刪除</button><span class="sp"></span><button type="button" class="btn" id="fdCancel">取消</button><button type="submit" class="btn pri">儲存</button></div></form></dialog>`);


time24($('#fdT'));
/* ---------- 餵奶記錄 ---------- */
const F_AMT=[['好','180–210ml','#7f9467',195],['普通','約 120ml','#c9962f',120],['差','90ml 以下','#b5573a',75],['完全不喝','','#8a2b22',0]];
const F_Q=['專心喝','安撫後願意喝','安撫後仍不肯喝'];
const F_REJ=['無聲推開奶瓶','小哭扭動','大哭','吐奶或把奶咳出來'];
const fAmtText=i=>F_AMT[i][2]&&F_AMT[i][1]?`${F_AMT[i][0]}（${F_AMT[i][1]}）`:F_AMT[i][0];
const fMl=f=>f.ml!=null&&f.ml!==''&&!isNaN(+f.ml)?+f.ml:F_AMT[f.amt][3];
const fTime=f=>{const d=dtParse(f.t);return hhmm(d.getHours()*60+d.getMinutes())};
const fRej=f=>(f.rej||[]).map(i=>F_REJ[i]).join('、');
const feedsOn=(ds,who)=>S.feeds.filter(f=>f.t.startsWith(ds)&&(!who||f.who===who)).sort((a,b)=>a.t.localeCompare(b.t));
const bandFromMl=ml=>ml>=165?0:ml>=105?1:ml>0?2:3;

function feedRow(f,showWho){
  const w=member(f.who),rj=fRej(f);
  return`<div class="ngrow fdrow" data-id="${f.id}"><span class="when">${fTime(f)}</span>
    <span><i class="fdd" style="background:${F_AMT[f.amt][2]}"></i>${esc(F_AMT[f.amt][0])}${f.ml!=null&&f.ml!==''?` ${esc(f.ml)}ml`:''} · ${esc(F_Q[f.q])}${rj?` <span class="hint">（${esc(rj)}）</span>`:''}${f.note?` <span class="hint">${esc(f.note)}</span>`:''}</span>
    <span class="who">${showWho&&w?esc(w.name):''}</span><b>${fMl(f)?fMl(f)+' ml':'—'}</b></div>`;
}
function renderFeed(){
  const p=$('#fdPanel');if(!p)return;
  const ds=ymd(new Date()),fs=feedsOn(ds),multi=new Set(fs.map(f=>f.who)).size>1;
  const tot=fs.reduce((t,f)=>t+fMl(f),0),bad=fs.filter(f=>f.amt>=2||f.q===2).length;
  p.innerHTML=`<div class="wxtop"><div class="eyebrow">Feeding · 餵奶記錄</div><span class="ng-actions"><button class="btn pri" id="fdAdd">＋ 記錄餵奶</button></span></div>
  <div class="ngsum">${fs.length?`今天 <b>${fs.length}</b> 次 · 約 <b>${tot} ml</b>${bad?` · <span class="badge" style="color:${F_AMT[3][2]}">${bad} 次偏差／拒喝</span>`:''}`:'<span class="hint">今天還沒有餵奶紀錄</span>'}</div>
  ${fs.length?`<div class="nglog" style="margin-top:0">${fs.map(f=>feedRow(f,multi)).join('')}</div>`:''}`;
  $('#fdAdd').onclick=()=>openFeed({});
  p.querySelectorAll('.fdrow').forEach(r=>r.onclick=()=>{const f=S.feeds.find(x=>x.id===r.dataset.id);if(f&&!RO)openFeed(f)});
}

/* 對話框 */
let fdEditing=null,fdA=null,fdQv=null,fdRej=[];
function openFeed(o){
  if(RO)return;
  const isNew=!o.id;fdEditing=isNew?null:o;
  fdA=o.amt!=null?o.amt:null;fdQv=o.q!=null?o.q:null;fdRej=[...(o.rej||[])];
  const d=o.t?dtParse(o.t):(o.hm?resolveTime(o.hm):new Date());
  $('#fdH').textContent=isNew?'記錄餵奶':'修改餵奶紀錄';
  $('#fdWho').innerHTML=S.members.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
  $('#fdWho').value=o.who&&member(o.who)?o.who:defWho();
  $('#fdT').value=hhmm(d.getHours()*60+d.getMinutes());$('#fdD').value=ymd(d);
  $('#fdMl').value=o.ml!=null&&o.ml!==''?o.ml:'';$('#fdNote').value=o.note||'';
  $('#fdDel').hidden=isNew;fdPaint();$('#fdDlg').showModal();
}
function fdPaint(){
  $('#fdAmt').innerHTML=F_AMT.map((a,i)=>`<button type="button" class="opt ${fdA===i?'sel':''}" data-i="${i}">${esc(fAmtText(i))}</button>`).join('');
  $('#fdQ').innerHTML=F_Q.map((q,i)=>`<button type="button" class="opt ${fdQv===i?'sel':''}" data-i="${i}">${q}</button>`).join('');
  const showRej=fdQv===2||fdA===3||fdRej.length>0;$('#fdRejBox').hidden=!showRej;
  $('#fdRej').innerHTML=F_REJ.map((r,i)=>`<button type="button" class="opt ${fdRej.includes(i)?'sel':''}" data-i="${i}">${r}</button>`).join('');
  $('#fdAmt').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;fdA=fdA===i?null:i;if(fdA===3&&fdQv==null)fdQv=2;fdPaint()});
  $('#fdQ').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;fdQv=fdQv===i?null:i;fdPaint()});
  $('#fdRej').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;fdRej=fdRej.includes(i)?fdRej.filter(x=>x!==i):[...fdRej,i];fdPaint()});
}
$('#fdMl').addEventListener('input',()=>{const v=+$('#fdMl').value;if($('#fdMl').value!==''&&!isNaN(v)&&fdA==null){fdA=bandFromMl(v);fdPaint()}});
$('#fdCancel').onclick=()=>$('#fdDlg').close();
$('#fdForm').addEventListener('submit',e=>{
  e.preventDefault();
  const tm=t24($('#fdT').value),ds=$('#fdD').value;
  if(!tm||!ds){toast('請確認日期與時間（24 小時制，例如 02:24）');return}
  if(fdA==null){toast('請選奶量');return}
  if(fdQv==null){toast('請選餵奶品質');return}
  const showRej=fdQv===2||fdA===3||fdRej.length>0,ml=$('#fdMl').value;
  const o={who:$('#fdWho').value,t:`${ds}T${tm}`,amt:fdA,q:fdQv,rej:showRej?[...fdRej].sort():[],ml:ml===''?null:Math.max(0,Math.min(400,+ml)),note:$('#fdNote').value.trim()};
  if(fdEditing)Object.assign(fdEditing,o);else S.feeds.push({id:uid(),...o});
  save();$('#fdDlg').close();render();toast('已記錄餵奶');
});
$('#fdDel').onclick=()=>{if(fdEditing&&confirm('刪除這筆餵奶紀錄？')){S.feeds=S.feeds.filter(x=>x!==fdEditing);save();$('#fdDlg').close();render()}};
$('#fdDlg').addEventListener('click',e=>{if(e.target.id==='fdDlg')$('#fdDlg').close()});

/* 統計 */
let fRange='week',fOff=0;
function fRangeInfo(off){
  const today=new Date();let start,len;
  if(fRange==='week'){start=weekStart(addDays(today,7*off));len=7}
  else{start=new Date(today.getFullYear(),today.getMonth()+off,1);len=new Date(start.getFullYear(),start.getMonth()+1,0).getDate()}
  return{start,len,days:Array.from({length:len},(_,i)=>addDays(start,i))};
}
function fStats(off){
  const r=fRangeInfo(off),td=ymd(new Date());
  const days=r.days.map(d=>{const fs=feedsOn(ymd(d));return{d,fs,ml:fs.reduce((t,f)=>t+fMl(f),0),bad:fs.filter(f=>f.amt>=2||f.q===2).length}});
  const past=days.filter(x=>ymd(x.d)<=td),all=past.flatMap(x=>x.fs),act=past.filter(x=>x.fs.length);
  return{r,days,past,all,act,n:all.length,ml:all.reduce((t,f)=>t+fMl(f),0),focus:all.filter(f=>f.q===0).length,
    rej:all.filter(f=>f.q===2||f.amt===3).length,low:[...act].sort((a,b)=>a.ml-b.ml)};
}
function renderFeedAna(){
  const box=$('#fdAna');if(!box)return;
  const R=fStats(fOff),P=fStats(fOff-1),maxMl=Math.max(210,...R.days.map(x=>x.ml));
  const lab=fRange==='week'?`${R.r.start.getMonth()+1}/${R.r.start.getDate()} – ${addDays(R.r.start,6).getMonth()+1}/${addDays(R.r.start,6).getDate()}`:`${R.r.start.getFullYear()} 年 ${R.r.start.getMonth()+1} 月`;
  const unit=fRange==='week'?'週':'月';
  const rejCnt=F_REJ.map((n,i)=>[n,R.all.filter(f=>(f.rej||[]).includes(i)).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
  let sentence=R.n?'':`這${unit}還沒有餵奶紀錄。`;
  if(R.n){
    const w=R.low[0];
    sentence=`<b>${R.act.length>1?(fRange==='week'?'這週':'這個月')+'奶量最少的是':'目前只有'} ${w.d.getMonth()+1}/${w.d.getDate()}（週${WD[w.d.getDay()]}）${R.act.length>1?'':'的紀錄'}</b>：${w.fs.length} 次共約 ${w.ml} ml${w.bad?`，其中 ${w.bad} 次偏差或拒喝`:''}。`;
    sentence+=` 拒喝／不肯喝共 ${R.rej} 次`+(rejCnt.length?`，最常見的反應是「${rejCnt[0][0]}」（${rejCnt[0][1]} 次）`:'')+'。';
  }
  const cmp=R.n&&P.n?`<div class="hint">和上${unit}比：平均每日約 ${Math.round(R.ml/Math.max(1,R.act.length))} ml（上${unit} ${Math.round(P.ml/Math.max(1,P.act.length))} ml）· 專心喝 ${Math.round(R.focus/R.n*100)}%（上${unit} ${Math.round(P.focus/P.n*100)}%）</div>`:'';
  const qCnt=F_Q.map((q,i)=>[q,R.all.filter(f=>f.q===i).length]);
  const evs=[...R.all].sort((a,b)=>b.t.localeCompare(a.t));
  box.innerHTML=`<div class="ngtabs"><div class="tabs"><button class="tab" data-r="week" aria-selected="${fRange==='week'}">每週</button><button class="tab" data-r="month" aria-selected="${fRange==='month'}">每月</button></div>
    <span class="sp"></span><div class="pager"><button class="ib" id="fPrev">‹</button><span class="lab">${lab}</span><button class="ib" id="fNext">›</button></div></div>
  <div class="ngcards">
    <div class="ngc"><i>${R.n}</i><span>餵奶次數</span></div>
    <div class="ngc"><i>${R.n?Math.round(R.ml/R.n):0}<small> ml</small></i><span>平均每次奶量（估）</span></div>
    <div class="ngc"><i>${R.act.length?Math.round(R.ml/R.act.length):0}<small> ml</small></i><span>平均每日總量（有記錄的日子）</span></div>
    <div class="ngc"><i>${R.n?Math.round(R.focus/R.n*100):0}<small> %</small></i><span>專心喝比例 · 拒喝 ${R.rej} 次</span></div></div>
  <div class="ngsent">${sentence}${cmp}</div>
  <div class="ngchart ${fRange}">${R.days.map(x=>{const fut=ymd(x.d)>ymd(new Date());
    return`<div class="ngbar ${fut?'fut':''}" title="${x.d.getMonth()+1}/${x.d.getDate()} ${x.fs.length} 次 · 約 ${x.ml} ml"><em>${x.fs.length?x.ml:''}</em>
      <div class="bw fdstack">${x.fs.map(f=>`<div style="height:${Math.max(3,Math.round(fMl(f)/maxMl*120))}px;background:${F_AMT[f.amt][2]}"></div>`).join('')}</div>
      <span>${fRange==='week'?'週'+WD[x.d.getDay()]:x.d.getDate()}</span>${fRange==='week'?`<small>${x.d.getMonth()+1}/${x.d.getDate()}</small>`:''}</div>`}).join('')}</div>
  <div class="mlegend">${F_AMT.map(a=>`<span><i style="background:${a[2]}"></i>${a[0]}</span>`).join('')}<span>柱高＝當天總奶量（ml），每一格＝一次餵奶；未填毫升時以級距中間值估算</span></div>
  ${R.n?`<div class="ngtypes">${qCnt.map(([q,c])=>`<span class="chip">${q} ${c} 次</span>`).join('')}${rejCnt.map(([n,c])=>`<span class="chip" style="border-color:${F_AMT[3][2]}">${n} ${c} 次</span>`).join('')}</div>`:''}
  ${evs.length?`<div class="nglog">${evs.slice(0,fRange==='week'?40:80).map(f=>{const d=dtParse(f.t);return feedRow(f,true).replace('<span class="when">','<span class="when">'+(d.getMonth()+1)+'/'+d.getDate()+' ')}).join('')}</div>`:''}`;
  box.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{fRange=b.dataset.r;fOff=0;renderFeedAna()});
  $('#fPrev').onclick=()=>{fOff--;renderFeedAna()};$('#fNext').onclick=()=>{if(fOff<0){fOff++;renderFeedAna()}};
  box.querySelectorAll('.fdrow').forEach(r=>r.onclick=()=>{const f=S.feeds.find(x=>x.id===r.dataset.id);if(f&&!RO)openFeed(f)});
}


/* ====================== 家庭繪本與教材管理庫 ====================== */
const CATS=['情緒','生活習慣','感官/操作','認知啟蒙','想像創意','哲學思考','身體與性別','交通工具','動物','科普','自然植物','歷史文化','音樂聲音','故事童話','其他'];
const OLD_CAT={'情緒品格':'情緒','感官互動':'感官/操作'};
const CAT_RULES=[
 ['交通工具',/車|火車|飛機|船|公車|捷運|挖土機|消防|警察|巴士|直升機|腳踏車|摩托|高鐵|卡車|交通/],
 ['動物',/魚|貓|狗|熊|兔|鴨|雞|鵝|牛|羊|豬|馬|鳥|象|獅|虎|猴|蛙|龜|蝸牛|蜜蜂|蝴蝶|昆蟲|恐龍|企鵝|動物|鼠|狐狸|鯨|海豚|毛毛蟲|螞蟻|蜘蛛/],
 ['生活習慣',/刷牙|便便|尿尿|洗澡|睡覺|吃飯|穿衣|洗手|上學|習慣|收玩具|如廁|尿布|早安|晚安/],
 ['音樂聲音',/歌|音樂|聲音|鈴|鼓|拍手|節奏|唱|琴|咚|叮/],
 ['情緒',/生氣|害怕|情緒|朋友|分享|勇敢|難過|謝謝|對不起|抱抱|愛你|愛/],
 ['歷史文化',/歷史|文化|傳統|過年|中秋|端午|台灣|中國|神話|廟|民俗|博物館|世界|國家|節日/],
 ['科普',/為什麼|身體|星|太陽|月亮|宇宙|天氣|科學|地球|火山|海洋|百科|怎麼|大自然|骨頭|細菌|如何/],
 ['自然植物',/花|樹|種子|草|葉|森林|蔬菜|水果|菜|植物|蘑菇|蘋果|香蕉/],
 ['認知啟蒙',/顏色|數字|形狀|數數|紅|藍|黃|綠|大小|相反|找一找|ABC|字母|認識/],
 ['感官/操作',/翻翻|觸摸|摸摸|洞洞|立體|布書|硬頁|遊戲書|躲貓貓|在哪|貼紙|拉拉/],
 ['想像創意',/假裝|想像|機器人|也許/],
 ['身體與性別',/性別|身體界線|界線/],
 ['故事童話',/故事|公主|王子|小紅帽|童話|冒險|魔法|逃走|旅行|大野狼|王國/]
];
const AGE_PRESETS=[['0–4個月',0,4],['4–6個月',4,6],['6–9個月',6,9],['10個月',9,11],['0–1歲',0,12],['1–2歲',12,24],['0–3歲',0,36],['2–4歲',24,48],['3歲以上',36,120]];
const autoCat=t=>{const r=CAT_RULES.find(([,re])=>re.test(t));return r?r[0]:'其他'};
const ageLabel=b=>{if(b.amin==null)return'未分齡';const p=AGE_PRESETS.find(x=>x[1]===b.amin&&x[2]===b.amax);return p?p[0]:`${b.amin}–${b.amax}個月`};
function parseAge(txt){ // 「0-3歲」「10個月」「4~6月」→ [min,max] 月
  if(!txt)return null;const t=String(txt).replace(/\s/g,'');
  let m=t.match(/(\d+(?:\.\d+)?)[-~–—到至](\d+(?:\.\d+)?)(個月|月|歲)/);
  if(m){const k=m[3]==='歲'?12:1;return[Math.round(+m[1]*k),Math.round(+m[2]*k)]}
  m=t.match(/(\d+(?:\.\d+)?)(個月|月|歲)(以上|\+)?/);
  if(m){const k=m[2]==='歲'?12:1,v=Math.round(+m[1]*k);return m[3]?[v,v+24]:(k===1?[Math.max(0,v-1),v+1]:[v,v+12])}
  return null;
}
const mo0=()=>libMonths().mo;
function libMonths(){
  const m=S.members.find(x=>x.id===defWho());
  const a=m&&m.birth?ageOf(m.birth):null;
  if(a&&!a.future)return{mo:a.y*12+a.m+a.d/30,src:'birth',text:ageText(m.birth)};
  const v=+S.libM||9.5;return{mo:v,src:'manual',text:`約 ${v} 個月（手動設定）`};
}
function fitScore(b,mo){
  if(b.amin==null)return .5;
  if(mo>=b.amin&&mo<=b.amax)return 3;
  const d=mo<b.amin?b.amin-mo:mo-b.amax;if(d<=2)return 1;
  return mo<b.amin&&b.amin-mo<=15&&!b.caution?.4:0; // 稍微超前：可用「大人主導」的方式提早共讀
}
const bookById=id=>S.books.find(b=>b.id===id);
const readsOf=id=>S.reads.filter(r=>(r.books||[]).includes(id));

/* ---- 教案資料 ---- */
const DEV=[ // 月齡範圍 → 發展重點（一般性參考，不是診斷）
 [0,3,['追視黑白／高對比圖','聽聲音、對視與微笑','趴著抬頭']],
 [3,6,['伸手抓握、放進嘴巴探索','對聲音來源轉頭','笑出聲、與大人輪流發聲']],
 [6,9,['坐穩後雙手探索物品','雙手互換物品、敲打出聲（因果）','對熟悉的人與聲音有反應']],
 [9,12,['拇指食指捏取小物','模仿拍手、揮手、搖頭','理解「再來」「不要」，開始用手指物','物體恆存（找被藏起來的東西）']],
 [12,18,['指認圖片與身體部位','單字／擬聲詞','自己翻頁、堆疊兩塊積木']],
 [18,36,['短句與問答','角色扮演、簡單情節','顏色數字配對']]
];
const devFocus=mo=>(DEV.find(d=>mo>=d[0]&&mo<d[1])||DEV[DEV.length-1])[2];
const THEMES=[
 {n:'聲音與節奏（快慢對比）',min:4,max:36,cats:['音樂聲音'],kw:/聲|歌|鼓|鈴|咚|叮|拍/,tags:['聲音','節奏','音樂','快慢'],
  focus:'聽覺辨識、節奏感、情緒隨音樂起伏',acts:['同一首曲子先放慢再加快，觀察他身體、眼神的變化','用拍手或搖鈴配合書中的擬聲詞','音樂停下來時等他 3 秒，看他會不會「要求再來」'],vars:['換成不同速度或不同樂器版本','加上沙鈴或鍋蓋打節拍','讓他自己敲出聲音，你跟著他的節奏']},
 {n:'動物與擬聲',min:6,max:36,cats:['動物'],kw:/動物|魚|貓|狗|鴨|牛/,tags:['動物','模仿'],
  focus:'指認、模仿聲音、理解圖像與真實的對應',acts:['每翻一頁就學一次動物叫聲，停頓等他回應','用玩具動物配對書上的圖','學動物走路與搖晃身體'],vars:['改用手偶演動物','換不同音高學叫聲','先藏起動物玩具，翻到那頁再「變出來」']},
 {n:'躲貓貓與找東西',min:6,max:24,cats:['感官/操作'],kw:/躲|在哪|翻翻|洞/,tags:['躲','翻翻','因果'],
  focus:'物體恆存、因果、期待與驚喜',acts:['用小毛巾蓋住玩具，讓他掀開找','翻翻書每次翻開前先說「在哪裡呢？」','把書中的主角藏在手裡再「變出來」'],vars:['改藏在不同容器裡','換成他熟悉的玩具','讓他來當「躲的人」']},
 {n:'抓握、翻頁與操作',min:5,max:24,cats:['感官/操作','認知啟蒙'],kw:/翻|洞|硬頁|立體|拉/,tags:['操作','抓握','翻頁'],
  focus:'手眼協調、手指精細動作、因果',acts:['把硬頁書放在他面前，鼓勵他自己翻','洞洞書讓手指穿過去','不同材質的玩具輪流握'],vars:['換不同厚度的書','用玩具輔助翻頁','把書立起來變成「小劇場」']},
 {n:'觸感與感官探索',min:3,max:24,cats:['感官/操作','自然植物'],kw:/摸|觸|布|軟|毛/,tags:['觸摸','感官'],
  focus:'觸覺辨識、語言配對（軟、硬、毛毛的）',acts:['邊摸邊說形容詞：軟軟、硬硬、毛毛','用不同材質的布或玩具輪流觸摸','觀察他偏好的觸感'],vars:['加入涼的／溫的對比','閉口不說話讓他自己探索','換成家裡安全的日常物品']},
 {n:'顏色與追視',min:3,max:24,cats:['認知啟蒙'],kw:/顏色|色|紅|藍|黃|綠|形狀/,tags:['顏色','追視'],
  focus:'視覺追視、顏色與形狀的初步辨識',acts:['慢慢移動書上的圖或玩具，看他眼睛是否跟著','指著顏色大聲說出名稱','把相同顏色的玩具放在一起'],vars:['改用手電筒光影','換成黑白或高對比圖卡','讓他自己選一個顏色']},
 {n:'日常生活語言',min:6,max:36,cats:['生活習慣','情緒'],kw:/刷牙|洗澡|睡|吃|抱|愛/,tags:['生活','語言'],
  focus:'理解日常語言、建立生活流程的預期感',acts:['把書裡的動作在他身上「演」一次（刷牙、洗澡）','用書中的句子在生活中重複使用','讀完後用同樣的話安撫'],vars:['換成真的道具','連結當天的日常（剛洗完澡就讀洗澡書）','把句子編成短歌']},
 {n:'交通工具與動作聲',min:8,max:36,cats:['交通工具'],kw:/車|火車|飛機|船/,tags:['交通','擬聲','動作'],
  focus:'聲音與動作的連結、模仿',acts:['學火車、汽車的聲音與動作','用玩具車在書上「開」','把家裡的軟墊變成隧道'],vars:['換成不同速度（快車／慢車）','讓他推玩具車追你','搭配音樂的快慢']},
 {n:'自然與科普小發現',min:9,max:36,cats:['科普','自然植物','歷史文化','故事童話'],kw:/星|花|樹|天氣|雨|水|故事/,tags:['自然','觀察'],
  focus:'好奇心、觀察與語言輸入',acts:['拿書中出現的實物給他看（水果、葉子）','窗邊觀察天氣、與書中句子對照','用一句簡單的話重述故事'],vars:['改在戶外或陽台讀','搭配一首相關的歌','把主角做成指偶']}
];
THEMES.push(
 {n:'下雨天（聽雨、玩水）',min:6,max:48,cats:['故事童話','科普','自然植物'],kw:/雨|水|天氣/,tags:['下雨','聲音','水'],ctx:['下雨'],focus:'聽覺與觸覺探索、天氣語言',acts:['到窗邊聽雨看雨滴，對照書中的句子','小水盆拍水、用杯子倒水，說「嘩啦嘩啦」','用沙鈴或米罐模擬雨聲，雨大雨小用快慢表現'],vars:['雨聲配慢板鋼琴，觀察他的反應','把雨聲換成不同容器的敲擊聲','雨停後到窗邊看水窪']},
 {n:'晴天出門與四季',min:6,max:48,cats:['故事童話','自然植物','交通工具','科普'],kw:/晴|太陽|花|樹|出門|四季/,tags:['戶外','季節'],ctx:['晴天','春'],focus:'戶外觀察、語言與動作連結',acts:['到陽台或公園，找書裡出現過的東西','晒太陽時唱一首歌，配合拍手','找一找今天看到的顏色'],vars:['換不同路線看不同的東西','收集一片葉子或小花帶回家看','同一個地點不同時間看變化']},
 {n:'溫暖與保暖（冷天）',min:6,max:48,cats:['生活習慣','故事童話'],kw:/手套|冬|衣|抱/,tags:['保暖','穿衣'],ctx:['冷','冬'],focus:'溫度感受、穿脫與生活語言',acts:['蓋毯子抱著慢慢讀','玩穿脫襪子、手套的遊戲','用「暖暖的」「涼涼的」形容觸感'],vars:['讓他選要穿哪一雙襪子','用溫暖的搖籃曲收尾','把玩偶也穿上外套']},
 {n:'涼爽靜態遊戲（悶熱日）',min:6,max:48,cats:['感官/操作','認知啟蒙'],kw:/水|冰|涼|夏/,tags:['安靜','感官'],ctx:['熱','夏'],focus:'低強度的感官探索，避免過熱',acts:['在涼爽處用涼涼的水或濕毛巾做觸感探索','慢節奏短時間的律動，多補水','讀完用扇子或小風扇玩「風吹來了」'],vars:['換成不同冰涼的物品（安全的）','用慢速音樂搭配深呼吸','縮短時間、增加休息']}
);
const VARS_GEN=['換一個地方讀（窗邊、地墊、陽台）','同一本書今天只講「一個重點」，其他頁快速翻過','讓他決定今天先讀哪一本（兩本擺在他面前）','加入一首相關的歌，翻到那頁時唱'];
function rng(seed){let a=0;for(const c of seed)a=(a*31+c.charCodeAt(0))|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}


/* ---- 季節與天氣情境 ---- */
const SEASON_OF=m=>m>=3&&m<=5?'春':m>=6&&m<=8?'夏':m>=9&&m<=11?'秋':'冬';
const CTX_NORM={'雨天':'下雨','雷雨':'下雨','晴':'晴天','悶熱':'熱','寒冷':'冷','涼':'冷','暗':'光線暗'};
const nctx=x=>CTX_NORM[x]||x;
let ctxManual=null; // null＝依你填的天氣自動判斷；陣列＝手動指定
function ctxFor(dateStr){
  const d=pd(dateStr),o=S.wx[dateStr]||{},ps=PERIODS.map(([k])=>o[k]||{}),w=new Set();
  if(ps.some(x=>x.w===3||x.w===4||x.r===3))w.add('下雨');
  if(ps.some(x=>x.w===0))w.add('晴天');
  if(ps.some(x=>x.w===2)&&!w.has('下雨'))w.add('陰天');
  if(ps.some(x=>x.t===0||x.a===2))w.add('熱');
  if(ps.some(x=>x.t===2))w.add('冷');
  if(ps.some(x=>x.l===2))w.add('光線暗');
  const filled=ps.some(x=>Object.keys(x).length>0);
  let weather=[...w],manual=false;
  if(dateStr===ymd(new Date())&&ctxManual){weather=[...ctxManual];manual=true}
  const season=SEASON_OF(d.getMonth()+1);
  return{season,weather,tags:[season,...weather],filled,manual};
}
const ctxLabel=c=>`${c.season}季${c.weather.length?' · '+c.weather.join('、'):''}`;
function bookCtx(b){
  const set=new Set((b.ctx||[]).map(nctx)),t=(b.title||'')+(b.tags||'');
  if(/雨|雨傘/.test(t))set.add('下雨');if(/手套|雪|寒|冬天/.test(t)){set.add('冷');set.add('冬')}
  if(/夏天|冰|游泳|西瓜/.test(t)){set.add('夏');set.add('熱')}if(/太陽|晴/.test(t))set.add('晴天');
  if(/春天|新芽/.test(t))set.add('春');if(/落葉|秋天/.test(t))set.add('秋');if(/四季|季節/.test(t))['春','夏','秋','冬'].forEach(x=>set.add(x));
  return set;
}
function ctxHits(b,tags){const bc=bookCtx(b);return tags.map(nctx).filter(t=>bc.has(t))}
const CTX_TIPS={
 '下雨':{music:'雨天適合安靜的音樂：鋼琴慢版配雨聲，或用沙鈴／米罐模擬雨聲',act:'到窗邊聽雨、看雨滴；準備小水盆讓他拍水、聽水聲'},
 '晴天':{music:'晴天唱歌律動：配合節奏拍手、搖晃身體',act:'到陽台或公園晒晒太陽，找書裡出現過的東西（花、樹、車）'},
 '陰天':{music:'陰天用柔和的音樂，聲量放小',act:'光線偏暗時用小夜燈或手電筒玩影子遊戲'},
 '熱':{music:'悶熱時用慢節奏、安靜的音樂，不要太激烈的律動',act:'待在涼爽處做靜態感官遊戲（涼涼的水、冰涼的觸感），記得補水'},
 '冷':{music:'天冷時用溫暖的搖籃曲，慢慢搖晃',act:'蓋毯子抱著讀書；玩穿脫襪子、手套的遊戲'},
 '光線暗':{music:'光線暗時用柔和的音樂，降低刺激',act:'用手電筒玩影子遊戲，或開小夜燈讀書'},
 '春':{act:'看花、新芽與小蟲，讀完到戶外找找看'},'夏':{act:'玩水、吃水果、感受涼涼的觸感'},'秋':{act:'撿落葉、聽沙沙聲、比大小與顏色'},'冬':{act:'保暖與換季衣物：穿脫外套、手套遊戲'}
};
const MUSIC_PREF=tags=>{const t=tags.map(nctx),p=new Set();
  if(t.some(x=>['下雨','陰天','熱','光線暗'].includes(x)))['鋼琴','安靜','搖籃','慢'].forEach(x=>p.add(x));
  if(t.some(x=>['晴天','春'].includes(x)))['歌唱','律動','節奏','模仿'].forEach(x=>p.add(x));
  if(t.some(x=>['冷','冬'].includes(x)))['搖籃','溫暖','歌唱','慢'].forEach(x=>p.add(x));return[...p]};
function ctxTipLines(tags){const out=[];const seen=new Set();
  tags.map(nctx).forEach(t=>{const c=CTX_TIPS[t];if(!c)return;['music','act'].forEach(k=>{if(c[k]&&!seen.has(c[k])&&out.length<3){seen.add(c[k]);out.push((k==='music'?'🎵 ':'🌦 ')+t+'：'+c[k])}})});return out}
function makePlan(dateStr,off,usedBooks,usedThemes,usedSongs){
  const R=rng(dateStr+'#'+off),mo=libMonths().mo,cx=ctxFor(dateStr);
  const recent=S.reads.filter(r=>r.t.slice(0,10)>=ymd(addDays(pd(dateStr),-7))&&r.t.slice(0,10)<dateStr);
  const recentBooks=new Set(recent.flatMap(r=>r.books||[])),recentThemes=new Set(recent.map(r=>r.theme).filter(Boolean));
  const themes=THEMES.filter(t=>mo>=t.min-1&&mo<=t.max+1);
  const pool=(themes.length?themes:THEMES).map(t=>({t,s:((t.ctx||[]).map(nctx).some(x=>cx.tags.map(nctx).includes(x))?4:0)+(recentThemes.has(t.n)?-3:0)+(usedThemes&&usedThemes.has(t.n)?-5:0)+R()*2}));
  const th=pool.sort((a,b)=>b.s-a.s)[0].t;
  const sc=b=>{const f=fitScore(b,mo);if(!f||(b.caution&&b.amin!=null&&mo<b.amin))return-99;let s=f;
    if(th.cats.includes(b.cat))s+=3;if(th.kw.test(b.title+(b.tags||'')))s+=2;
    s+=Math.min(6,ctxHits(b,cx.tags).length*3);if(recentBooks.has(b.id))s-=4;s-=Math.min(2,readsOf(b.id).length*.3);if(b.fav)s+=.7;if(usedBooks&&usedBooks.has(b.id))s-=5;return s+R()*1.2};
  const books=[...S.books].map(b=>({b,s:sc(b)})).filter(x=>x.s>-50).sort((a,b)=>b.s-a.s).slice(0,2).map(x=>x.b);
  const pref=MUSIC_PREF(cx.tags),resFit=(arr,withAge)=>arr.map(x=>({x,s:(th.tags.some(g=>(x.tags||'').includes(g))?3:0)+pref.filter(g=>((x.name||'')+(x.kind||'')+(x.tags||'')).includes(g)).length*1.2+(withAge&&x.amin!=null?fitScore(x,mo):0)+R()}));
  const calm=x=>['鋼琴','安靜','搖籃','慢'].filter(g=>((x.name||'')+(x.kind||'')+(x.tags||'')).includes(g)).length;
  const music=resFit(S.music,false).sort((a,b)=>b.s-a.s).slice(0,2).map(o=>o.x).sort((a,b)=>calm(a)-calm(b)); // 暖身用活潑的、收尾用安靜的
  const toy=resFit(S.toys,true).filter(o=>!o.x.amin&&o.x.amin!==0||fitScore(o.x,mo)>0).sort((a,b)=>b.s-a.s)[0];
  const act=th.acts[Math.floor(R()*th.acts.length)],vari=[...th.vars,...VARS_GEN][Math.floor(R()*(th.vars.length+VARS_GEN.length))];
  const sp=songPicks(cx,mo,R,dateStr,usedSongs);
  const music2=sp.length?sp.map(x=>({id:x.s.id,name:x.s.title,kind:songSys(x.s).name+(x.s.ref?'・'+x.s.ref:''),song:true,tags:'',moves:x.s.moves,fest:x.festH.map(f=>f.n)})):music;
  return{date:dateStr,theme:th,books,music:music2,toy:toy&&toy.x,act,vari,focus:devFocus(mo),ctx:cx,fests:festNear(dateStr,14)};
}
const planBookReason=(p,b)=>`${ctxHits(b,p.ctx.tags).length?'符合今天的'+ctxHits(b,p.ctx.tags).join('、')+' · ':''}${mo0()<b.amin-2?'略超前，改用大人主導的共讀 · ':''}${b.cat}${p.theme.cats.includes(b.cat)?'（符合今日主題）':''} · ${ageLabel(b)}${readsOf(b.id).length?` · 讀過 ${readsOf(b.id).length} 次`:' · 還沒讀過'}`;
function planText(p){
  const d=pd(p.date),L=[`${d.getMonth()+1}/${d.getDate()}（週${WD[d.getDay()]}）上午 30 分鐘｜${p.theme.n}`];
  L.push(`・0–5 分 暖身：${p.music[0]?`播放／唱《${p.music[0].name}》`:'唱一首熟悉的歌，拍手'}，叫他的名字、對視`);
  L.push(`・5–17 分 繪本：${p.books.length?p.books.map(b=>`《${b.title}》`).join('、'):'（書庫沒有適齡的書，先用家裡任一本）'}｜${p.act}`);
  L.push(`・17–25 分 玩具探索：${p.toy?p.toy.name:'家裡安全的日常物品'}（配合今天主題）`);
  L.push(`・25–30 分 收尾：${p.music[1]?`《${p.music[1].name}》`:'輕柔的音樂'}，擁抱安撫，記下他的反應`);
  L.push(`情境：${ctxLabel(p.ctx)}`);ctxTipLines(p.ctx.tags).forEach(t=>L.push('・'+t));
  L.push(`發展重點：${p.focus.join('；')}`);L.push(`變化：${p.vari}`);return L.join('\n');
}

/* ---- 資料與正規化 ---- */
const SEED_BOOKS=[{"ctx":["晴天"],"id":"sb01","title":"球球和挖土機","author":"間所久子","pub":"","cat":"交通工具","amin":12,"amax":36,"goals":["交通","挖土機","擬聲","動作","故事"],"ext":["用玩具挖土機在米盆或沙盤裡挖、倒、裝，邊做邊說「挖」「倒」「滿了」","翻到挖土機那頁一起學引擎與挖土的聲音，邊念邊做挖的動作"],"caution":"","check":false,"note":"","core":true,"tags":"交通,挖土機,擬聲,動作,故事"},{"ctx":["下雨","陰天"],"id":"sb02","title":"下雨天的球球","author":"間所久子","pub":"","cat":"故事童話","amin":12,"amax":36,"goals":["天氣","下雨","自然","聲音","生活"],"ext":["下雨天一起聽雨聲、看窗外雨滴，對照書中的句子","準備小水盆或雨傘：撐傘、拍水、聽水聲，說「滴滴答答」"],"caution":"","check":false,"note":"","core":true,"tags":"天氣,下雨,自然,聲音,生活"},{"ctx":["陰天","光線暗"],"id":"sb03","title":"紅圓圓和黑圓圓","author":"上野與志","pub":"上誼","cat":"認知啟蒙","amin":3,"amax":36,"goals":["顏色","形狀","圓形","對比","追視","感官"],"ext":["紅黑對比：把書立在眼前 20–30 公分，慢慢左右移動讓他追視","找家裡的圓形物（盤子、球、杯口）與書上的圓配對，邊摸邊說「圓圓」"],"caution":"","check":false,"note":"高對比色彩，適合很小的月齡","core":true,"tags":"顏色,形狀,圓形,對比,追視,感官"},{"ctx":["春","夏","秋","冬","四季"],"id":"sb04","title":"小房子","author":"Virginia Lee Burton","pub":"遠流","cat":"歷史文化","amin":36,"amax":96,"goals":["時間","季節","城市","變遷","故事","歷史"],"ext":["翻到四季頁，到窗邊找季節的線索（天氣、樹葉、衣服）","用積木蓋「小房子」，再在旁邊蓋大樓，談談周圍怎麼改變"],"caution":"","check":false,"note":"","core":true,"tags":"時間,季節,城市,變遷,故事,歷史"},{"ctx":[],"id":"sb05","title":"毛毛兔不想生氣","author":"Trace Moroney","pub":"格林文化","cat":"情緒","amin":24,"amax":72,"goals":["生氣","情緒","情緒命名"],"ext":["鏡子遊戲：一起做「生氣臉」再做「放鬆臉」，吹泡泡或吹風車深呼吸 3 次","布置「冷靜角落」（抱枕＋這本書），讀完練習說「我很生氣，因為…」"],"caution":"","check":false,"note":"","core":true,"tags":"生氣,情緒,情緒命名"},{"ctx":[],"id":"sb06","title":"毛毛兔不會嫉妒","author":"Trace Moroney","pub":"格林文化","cat":"情緒","amin":24,"amax":72,"goals":["嫉妒","情緒","分享","輪流"],"ext":["玩偶角色扮演：兩個娃娃爭同一個玩具，練習說「我也想要」並輪流","用沙漏或計時歌決定輪流的時間"],"caution":"","check":false,"note":"","core":true,"tags":"嫉妒,情緒,分享,輪流"},{"ctx":["光線暗","下雨"],"id":"sb07","title":"毛毛兔不會害怕","author":"Trace Moroney","pub":"格林文化","cat":"情緒","amin":24,"amax":72,"goals":["害怕","情緒","安全感"],"ext":["用小手電筒玩影子遊戲，把「怕怕的影子」變成好玩的動物影子","用被子搭小帳篷，抱著安心物在裡面讀書"],"caution":"","check":false,"note":"","core":true,"tags":"害怕,情緒,安全感"},{"ctx":[],"id":"sb08","title":"毛毛兔不怕孤獨","author":"Trace Moroney","pub":"格林文化","cat":"情緒","amin":24,"amax":72,"goals":["孤獨","分離焦慮","安全感","情緒"],"ext":["「再見—我會回來」躲貓貓：短暫離開視線再回來，每次稍微拉長","準備「想念物」（媽媽的小手帕或照片），讀完放進口袋說「我會想你，也會回來」"],"caution":"","check":false,"note":"","core":true,"tags":"孤獨,分離焦慮,安全感,情緒"},{"ctx":[],"id":"sb09","title":"我有理由","author":"吉竹伸介","pub":"親子天下","cat":"情緒","amin":36,"amax":96,"goals":["情緒","理由","語言","幽默","哲學"],"ext":["輪流玩「我有理由」：大人先示範一個好笑的理由，換孩子說","把孩子的「理由」畫成小插圖"],"caution":"","check":false,"note":"","core":true,"tags":"情緒,理由,語言,幽默,哲學"},{"ctx":[],"id":"sb10","title":"做一個機器人假裝是我","author":"吉竹伸介","pub":"三采文化","cat":"想像創意","amin":36,"amax":96,"goals":["想像","角色扮演","身體","假裝"],"ext":["紙箱機器人：用紙箱套身體，輪流當機器人與主人下指令","「假裝是…」遊戲：模仿動物與機器的動作"],"caution":"","check":false,"note":"","core":true,"tags":"想像,角色扮演,身體,假裝"},{"ctx":[],"id":"sb11","title":"這是蘋果嗎？也許是哦","author":"吉竹伸介","pub":"三采文化","cat":"想像創意","amin":24,"amax":96,"goals":["想像","觀察","語言","哲學","水果"],"ext":["拿一顆真的蘋果：摸、聞、切開，再一起想「它還可能是什麼」","用黏土把蘋果變成別的東西"],"caution":"","check":false,"note":"","core":true,"tags":"想像,觀察,語言,哲學,水果"},{"ctx":[],"id":"sb12","title":"爺爺的天堂筆記本","author":"吉竹伸介","pub":"三采文化","cat":"哲學思考","amin":48,"amax":120,"goals":["生死","思念","情緒","哲學"],"ext":["聊聊「想念的人」：看照片、說一件有趣的回憶","一起做一本自己的「想念筆記本」"],"caution":"","check":false,"note":"內容涉及離別與死亡，建議大人先讀過再共讀","core":true,"tags":"生死,思念,情緒,哲學"},{"ctx":["冬","冷","換季"],"id":"sb13","title":"脫不下來啊","author":"吉竹伸介","pub":"三采文化","cat":"生活習慣","amin":24,"amax":72,"goals":["生活習慣","穿衣","自理","幽默"],"ext":["玩偶穿脫外套與襪子，練習拉、鑽、翻","把衣服卡住的橋段演出來，再示範正確步驟"],"caution":"","check":false,"note":"","core":true,"tags":"生活習慣,穿衣,自理,幽默"},{"ctx":["夏","熱"],"id":"sb14","title":"愛吃水果的牛","author":"湯姆牛","pub":"信誼","cat":"認知啟蒙","amin":12,"amax":48,"goals":["水果","認知","動物","顏色","語言"],"ext":["準備真水果或水果玩具，配對書中的水果並說名稱與味道","玩「牛先生要吃什麼」餵食遊戲"],"caution":"","check":false,"note":"","core":true,"tags":"水果,認知,動物,顏色,語言"},{"ctx":["晴天"],"id":"sb15","title":"上學途中","author":"五味太郎","pub":"漢聲","cat":"生活習慣","amin":24,"amax":72,"goals":["生活習慣","交通","觀察","出門"],"ext":["出門前的「出發儀式」：說今天會看到什麼、要帶什麼","散步時玩「找一找」：找書裡出現過的東西"],"caution":"","check":true,"note":"","core":true,"tags":"生活習慣,交通,觀察,出門"},{"ctx":[],"id":"sb16","title":"Colors of Things","author":"Priddy Books 編輯部","pub":"Priddy Books","cat":"認知啟蒙","amin":6,"amax":36,"goals":["顏色","認知","語言","英文","感官"],"ext":["依顏色找東西：書裡一個顏色，家裡找一樣同色的","把相同顏色的玩具放在一起，說英文顏色單字"],"caution":"","check":false,"note":"","core":true,"tags":"顏色,認知,語言,英文,感官"},{"ctx":[],"id":"sb17","title":"Little Giant Red Rhino","author":"Ellen Rogers","pub":"","cat":"動物","amin":12,"amax":48,"goals":["動物","顏色","英文","擬聲"],"ext":["學犀牛慢慢走、輕輕「碰碰」頭，配合書中句子","玩「紅色的東西在哪裡」"],"caution":"","check":true,"note":"","core":true,"tags":"動物,顏色,英文,擬聲"},{"ctx":[],"id":"sb18","title":"小雞過生日","author":"工藤紀子","pub":"小魯文化","cat":"故事童話","amin":24,"amax":60,"goals":["故事","慶生","朋友","分享"],"ext":["辦「娃娃生日會」：布置、唱生日歌、用黏土分「蛋糕」","讀完問：「誰來參加？送了什麼？」"],"caution":"","check":true,"note":"","core":true,"tags":"故事,慶生,朋友,分享"},{"ctx":[],"id":"sb19","title":"交通工具厚片磁鐵書","author":"","pub":"雙美生活文創","cat":"交通工具","amin":12,"amax":48,"goals":["交通","操作","磁鐵","擬聲","感官"],"ext":["把磁鐵貼片貼在冰箱或白板，邊貼邊說交通工具名稱與聲音","分類遊戲：會飛的、會游的、會跑的"],"caution":"含磁鐵與小零件：務必由大人陪同，避免放入口中（吞食磁鐵很危險）","check":true,"note":"","core":true,"tags":"交通,操作,磁鐵,擬聲,感官"},{"ctx":["晴天"],"id":"sb20","title":"Wind-Up Racing Cars","author":"Usborne 編輯部","pub":"Usborne","cat":"交通工具","amin":36,"amax":96,"goals":["交通","操作","因果","速度"],"ext":["上發條小車比賽：先預測誰最快，再比一比距離","用積木搭賽道與斜坡，觀察快慢"],"caution":"含小零件與發條玩具，3 歲以下請勿單獨使用","check":true,"note":"","core":true,"tags":"交通,操作,因果,速度"},{"ctx":[],"id":"sb21","title":"New Homes for Our Little Friends: A Play and Learn Activity Book","author":"Chronicle Books 編輯部","pub":"Chronicle Books","cat":"動物","amin":24,"amax":72,"goals":["動物","操作","配對","家","語言","英文"],"ext":["把動物配對到牠們的「家」（巢、洞、池塘），說英文名稱","用紙盒做動物小屋"],"caution":"可能含可拆小件，請大人陪同","check":true,"note":"","core":true,"tags":"動物,操作,配對,家,語言,英文"},{"ctx":[],"id":"sb22","title":"發現小錫兵","author":"Jörg Müller（約克·米勒）","pub":"河合／河音","cat":"故事童話","amin":36,"amax":96,"goals":["想像","觀察","故事","細節"],"ext":["翻看畫面找小錫兵，一起講述他發生了什麼事（看圖說故事）","用玩具兵或小人偶創作「一日冒險」"],"caution":"","check":true,"note":"","core":true,"tags":"想像,觀察,故事,細節"},{"ctx":["冬","冷"],"id":"sb23","title":"手套","author":"Ukrain Folk Tale（繪者 Evgenii Rachev）","pub":"遠流","cat":"歷史文化","amin":24,"amax":72,"goals":["民間故事","動物","數量","空間","擬聲","分享"],"ext":["用真的手套和動物玩偶演一遍：動物一隻一隻鑽進手套","數一數有幾隻動物，說「擠一擠」「更大」"],"caution":"","check":false,"note":"","core":true,"tags":"民間故事,動物,數量,空間,擬聲,分享"},{"ctx":[],"id":"sb24","title":"100層樓的家","author":"岩井俊雄","pub":"小魯文化","cat":"認知啟蒙","amin":36,"amax":84,"goals":["數量","空間","想像","數數"],"ext":["用積木蓋高樓，一層一層數，想像每層住誰","把書立起來，從下往上指著數"],"caution":"","check":false,"note":"","core":true,"tags":"數量,空間,想像,數數"},{"ctx":[],"id":"sb25","title":"可朵村的帽子店","author":"","pub":"維京國際","cat":"故事童話","amin":36,"amax":84,"goals":["想像","故事","角色扮演"],"ext":["手作紙帽：設計並戴上，扮演帽子店老闆和客人","讀完問：「你想要什麼樣的帽子？」"],"caution":"","check":true,"note":"","core":true,"tags":"想像,故事,角色扮演"},{"ctx":[],"id":"sb26","title":"性別常識互動遊戲書","author":"","pub":"格林文化","cat":"身體與性別","amin":36,"amax":84,"goals":["身體","性別","界線","認識"],"ext":["用書中互動頁認識身體部位的正確名稱與「身體界線」","聊「我的身體我做主」：誰可以碰、怎麼說不"],"caution":"","check":true,"note":"建議大人先讀過再共讀","core":true,"tags":"身體,性別,界線,認識"},{"ctx":[],"id":"sb27","title":"公主怎麼挖鼻屎？","author":"李甲奎","pub":"三之三文化","cat":"生活習慣","amin":36,"amax":84,"goals":["生活習慣","衛生","禮貌","幽默"],"ext":["示範用衛生紙擤鼻涕、丟垃圾桶、洗手三步驟","玩偶「公主」做錯，換孩子來糾正（角色反轉）"],"caution":"","check":false,"note":"","core":true,"tags":"生活習慣,衛生,禮貌,幽默"},{"ctx":["秋","冬"],"id":"sb28","title":"我們來洗手","author":"","pub":"三之三文化","cat":"生活習慣","amin":18,"amax":60,"goals":["生活習慣","洗手","衛生","步驟"],"ext":["邊唱洗手歌邊洗手，搓手心、手背、指縫各 5 下","用沙漏或 20 秒的歌計時"],"caution":"","check":true,"note":"","core":true,"tags":"生活習慣,洗手,衛生,步驟"}];
function ensureSeed(){ // 核心 28 本：缺少就補回（使用者刪掉的不會再補）
  S.seedDel=S.seedDel||[];const have=new Set(S.books.map(b=>b.title));
  SEED_BOOKS.forEach(sb=>{const ex=S.books.find(x=>x.title===sb.title&&x.core);if(ex&&!ex.ctx)ex.ctx=[...(sb.ctx||[])]});
  SEED_BOOKS.forEach(b=>{if(!have.has(b.title)&&!S.seedDel.includes(b.title))S.books.push({...b,goals:[...b.goals],ext:[...b.ext],ctx:[...(b.ctx||[])],catAuto:false})});
}
function normLib(){
  S.books=S.books||[];S.reads=S.reads||[];S.bills=S.bills||[];
  S.books.forEach(b=>{if(OLD_CAT[b.cat])b.cat=OLD_CAT[b.cat];b.goals=b.goals||(b.tags?String(b.tags).split(/[,，]/).map(x=>x.trim()).filter(Boolean):[]);b.ext=b.ext||[];b.pub=b.pub||''});
  ensureSeed();
  if(!S.music)S.music=[{id:'mu2',name:'鋼琴譜（彈奏）',kind:'鋼琴',tags:'音樂,快慢,聲音,節奏'}];
  S.music=S.music.filter(m=>!/^(Music Together|寰宇迪士尼)$/i.test((m.name||'').trim())); // 這兩套已獨立成各自的教材系統
  S.songs=S.songs||[];S.currs=S.currs||{mt:{progress:''},hw:{progress:''}};
  S.songs.forEach(x=>{x.slots=x.slots||[];x.fest=x.fest||[];x.ctx=x.ctx||[]});
  S.toys=S.toys||[];
}
normLib();
const _norm=norm;norm=function(){_norm();normLib()};

/* ---- 頁面切換（日常 / 教材） ---- */
const DAY_SECS=()=>[...document.querySelectorAll('.hero,#qSec,#lowBanner,#nowSec,#viewSec,#ngSec,#fdSec,#elSec,.pager'),$('#ngPanel').parentElement,$('#fdPanel').parentElement];
function applyMode(){
  const lib=view==='lib';
  DAY_SECS().forEach(e=>e.classList.toggle('pgoff',lib));
  $('#libSec').classList.toggle('pgoff',!lib);
}
document.getElementById('fdSec').insertAdjacentHTML('afterend','<section class="sec" id="elSec"><h2>冷氣與電費 <em>ELECTRICITY</em></h2><div class="panel" id="elPanel" style="margin-top:12px"></div></section><section class="sec pgoff" id="libSec"><h2>繪本與教材 <em>PICTURE BOOKS &amp; ACTIVITIES</em></h2><div id="libBody" style="margin-top:12px"></div></section>');
$('#tabs').insertAdjacentHTML('beforeend','<button class="tab" role="tab" data-v="lib">繪本教材</button>');
document.querySelector('.tab[data-v=lib]').onclick=()=>{view='lib';render()};

/* ---- 共用：複製文字對話框 ---- */
document.body.insertAdjacentHTML('beforeend',`<dialog id="pmDlg"><div class="dh" id="pmH">複製</div><div class="db"><div class="hint" id="pmHint"></div><textarea id="pmText" rows="14" style="width:100%;border:1px solid var(--rule);background:var(--paper);padding:8px;font-size:15px;line-height:1.6"></textarea></div>
<div class="df"><button class="btn" id="pmClose" type="button">關閉</button><button class="btn pri" id="pmCopy" type="button">複製</button></div></dialog>`);
function showCopy(title,hint,text){$('#pmH').textContent=title;$('#pmHint').textContent=hint||'';$('#pmText').value=text;$('#pmDlg').showModal()}
$('#pmClose').onclick=()=>$('#pmDlg').close();
$('#pmCopy').onclick=async()=>{const ta=$('#pmText');let ok=false;try{await navigator.clipboard.writeText(ta.value);ok=true}catch(e){}
  if(!ok){try{ta.focus();ta.select();ok=document.execCommand('copy')}catch(e){}}
  if(ok){toast('已複製');$('#pmDlg').close()}else{ta.focus();ta.select();toast('請按 Ctrl+C 手動複製')}};

/* ---- 教材頁 ---- */
let libTab='today',libSeed=0,bookQ='',bookCat='',bookAge='fit',bookShow=60;

/* ====================== 獨立教材系統：Music Together / 寰宇迪士尼 ====================== */
const SYS={
 mt:{name:'Music Together',tag:'MT',sub:'歌唱律動課程：把你手邊的集別與歌曲登錄進來，依天氣、季節、速度與月齡配對。'},
 hw:{name:'寰宇迪士尼',tag:'HW',sub:'美語歌曲教材：依生活情境（起床、洗澡、吃飯…）、節慶與天氣安排每天唱什麼。'}
};
const LIFE=['起床','打招呼','換尿布','吃飯','洗澡','刷牙','出門','回家','收玩具','午睡','睡前','再見','安撫'];
const LIFE_ICON={起床:'🌅',打招呼:'👋',換尿布:'🧷',吃飯:'🍚',洗澡:'🛁',刷牙:'🪥',出門:'🚪',回家:'🏠',收玩具:'🧺',午睡:'😴',睡前:'🌙',再見:'👋',安撫:'🤍'};
const LIFE_KW={起床:/起床|早安|good ?morning|\bwake\b/i,打招呼:/你好|\bhello\b|\bwelcome\b|\bhi\b/i,吃飯:/吃飯|吃|\beat\b|\byum\b|\bhungry\b|\blunch\b|\bdinner\b|\bbreakfast\b/i,洗澡:/洗澡|\bbath|\bsplash/i,刷牙:/刷牙|\bbrush/i,
 換尿布:/尿布|\bdiaper|\bpotty\b|便便/i,出門:/出門|let'?s go|\bgo out\b/i,回家:/回家|\bhome\b/i,收玩具:/收玩具|clean ?up|\btidy\b/i,午睡:/午睡|\bnap\b/i,睡前:/晚安|good ?night|\blullaby|搖籃|\bsleep/i,再見:/再見|\bgoodbye|\bbye\b|so long/i,安撫:/安撫|\bcalm\b|\bsoothe/i};
const FESTS=[['元旦','s',1,1],['農曆新年','l',1,1],['元宵節','l',1,15],['情人節','s',2,14],['兒童節','s',4,4],['清明節','s',4,5],['母親節','nth',5,0,2],['端午節','l',5,5],['父親節','s',8,8],['中秋節','l',8,15],['萬聖節','s',10,31],['聖誕節','s',12,25],['跨年','s',12,31]];
const FEST_NAMES=[...FESTS.map(f=>f[0]),'生日'];
const FEST_KW={農曆新年:/新年|春節|恭喜|new year|cny/i,元宵節:/元宵|湯圓|燈籠/,兒童節:/兒童節/,清明節:/清明/,母親節:/母親|mother/i,端午節:/端午|龍舟|粽/,父親節:/父親|father/i,中秋節:/中秋|月餅|mid-?autumn/i,萬聖節:/萬聖|halloween|trick/i,聖誕節:/聖誕|christmas|jingle|santa/i,跨年:/跨年|auld/i,情人節:/情人|valentine/i,生日:/生日|birthday/i};
const SONG_CTX=['春','夏','秋','冬','下雨','晴天','陰天','熱','冷'];
const SONG_KINDS=['歌曲','律動','Chant／韻文','器樂','故事歌'];
const CFMT=(()=>{try{return new Intl.DateTimeFormat('en-u-ca-chinese',{month:'numeric',day:'numeric',timeZone:'Asia/Taipei'})}catch(e){return null}})();
function lunarMD(d){if(!CFMT)return null;try{d=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),4));/*台北當天中午*/const p=Object.fromEntries(CFMT.formatToParts(d).map(x=>[x.type,x.value]));if(/\D/.test(p.month))return null;return[+p.month,+p.day]}catch(e){return null}}
let festCache={key:'',list:[]};
function upcomingFests(){ // 今天前後的節慶（含家人生日），每天只算一次
  const key=ymd(new Date());if(festCache.key===key&&festCache.n===S.members.length)return festCache.list;
  const out=[];
  for(let i=-2;i<=75;i++){
    const d=addDays(new Date(),i),m=d.getMonth()+1,dd=d.getDate(),c=lunarMD(d);
    FESTS.forEach(([n,k,a,b,nth])=>{const hit=k==='s'?(m===a&&dd===b):k==='l'?(c&&c[0]===a&&c[1]===b):(m===a&&d.getDay()===0&&Math.ceil(dd/7)===nth);if(hit)out.push({n,date:ymd(d),in:i})});
    S.members.forEach(mm=>{if(mm.birth){const bd=pd(mm.birth);if(bd.getMonth()+1===m&&bd.getDate()===dd)out.push({n:mm.name+'生日',tag:'生日',date:ymd(d),in:i})}});
  }
  festCache={key,n:S.members.length,list:out};return out;
}
function festNear(dateStr,ahead=14){ // 距離某天 -1 ~ ahead 天內的節慶
  const base=pd(dateStr);return upcomingFests().map(f=>({...f,in:Math.round((pd(f.date)-base)/864e5)})).filter(f=>f.in>=-1&&f.in<=ahead).sort((a,b)=>a.in-b.in);
}
const festIn=f=>f.in===0?'就是今天':f.in<0?'剛過':`還有 ${f.in} 天`;
const songSys=s=>SYS[s.sys]||SYS.mt;
function autoSongTags(title){
  const slots=LIFE.filter(k=>LIFE_KW[k].test(title)),fest=FEST_NAMES.filter(k=>FEST_KW[k]&&FEST_KW[k].test(title));return{slots,fest};
}
const songTempoScore=(s,tags)=>{const t=tags.map(nctx);const calm=t.some(x=>['下雨','陰天','熱','光線暗','冷'].includes(x)),lively=t.some(x=>['晴天','春'].includes(x));
  return(calm&&s.tempo==='慢'?1.5:0)+(lively&&s.tempo==='快'?1.5:0)};
function songScore(s,cx,fests,mo,R,extra){
  const ctxH=(s.ctx||[]).map(nctx).filter(x=>cx.tags.map(nctx).includes(x)).length;
  const festH=fests.filter(f=>(s.fest||[]).includes(f.tag||f.n));
  let sc=Math.min(4,ctxH*2)+songTempoScore(s,cx.tags)+(festH.length?(festH.some(f=>f.in<=7)?5:4):0)+(s.amin!=null?fitScore(s,mo)*.5:0);
  const rec=S.reads.filter(r=>r.t.slice(0,10)>=ymd(addDays(new Date(),-3))).flatMap(r=>r.songs||[]);
  if(rec.includes(s.id))sc-=2;if(extra)sc+=extra(s);
  return{sc:sc+(R?R()*1.2:0),ctxH,festH};
}
const songLabel=s=>`${s.title}（${songSys(s).name}${s.ref?'・'+s.ref:''}）`;
function songPicks(cx,mo,R,dateStr,usedSongs){
  const fests=festNear(dateStr,14),pool=S.songs.map(s=>({s,...songScore(s,cx,fests,mo,R,x=>usedSongs&&usedSongs.has(x.id)?-4:0)})).filter(x=>x.sc>-50).sort((a,b)=>b.sc-a.sc);
  const picks=pool.slice(0,2);
  const calm=x=>(x.s.tempo==='慢'?2:x.s.tempo==='中'?1:0);
  return picks.sort((a,b)=>calm(a)-calm(b)); // 暖身用快的、收尾用慢的
}

/* 歌曲編輯 */
document.body.insertAdjacentHTML('beforeend',`<dialog id="sgDlg"><form method="dialog" id="sgForm"><div class="dh" id="sgH">歌曲</div><div class="db">
 <label class="f">所屬教材<select id="sgS"><option value="mt">Music Together</option><option value="hw">寰宇迪士尼</option></select></label>
 <label class="f">歌名<input id="sgT" autocomplete="off"></label>
 <div class="row"><label class="f">集別／冊／單元／曲序<input id="sgR" placeholder="例如：第 3 集 曲 5" autocomplete="off"></label><label class="f">類型<select id="sgK">${SONG_KINDS.map(k=>`<option>${k}</option>`).join('')}</select></label></div>
 <label class="f">速度<select id="sgP"><option value="">不指定</option><option>快</option><option>中</option><option>慢</option></select></label>
 <div><div class="wxl">適用的生活情境（可複選）</div><div class="chips" id="sgL"></div></div>
 <div><div class="wxl">適用的節慶（可複選）</div><div class="chips" id="sgF"></div></div>
 <div><div class="wxl">適合的季節／天氣（可複選）</div><div class="chips" id="sgC"></div></div>
 <div class="row"><label class="f">適用最小月齡（選填）<input type="number" id="sgA" min="0" max="120"></label><label class="f">最大月齡<input type="number" id="sgB" min="0" max="120"></label></div>
 <label class="f">動作／玩法（選填）<input id="sgM" placeholder="例如：拍手、搖沙鈴、抱著輕搖" autocomplete="off"></label>
 <label class="f">備註（選填）<input id="sgN" autocomplete="off"></label></div>
 <div class="df"><button type="button" class="btn del" id="sgDel" hidden>刪除</button><span class="sp"></span><button type="button" class="btn" id="sgCancel">取消</button><button type="submit" class="btn pri">儲存</button></div></form></dialog>
<dialog id="siDlg"><div class="dh" id="siH">匯入歌單</div><div class="db"><div class="hint">每行一首：<b>歌名｜集別或單元｜生活情境｜節慶｜速度｜月齡｜動作或備註</b>（用「｜」分隔，欄位可留空；情境、節慶可用逗號寫多個）。<br>例：Good Morning｜第1冊｜起床｜｜慢｜｜拉伸手腳<br>只寫歌名也可以，會依歌名關鍵字自動猜情境與節慶（例如含 Bath → 洗澡）。已有的歌名會略過。</div>
<textarea id="siText" rows="10" style="width:100%;border:1px solid var(--rule);background:var(--paper);padding:8px;font-size:15px" placeholder="在這裡貼上歌單…"></textarea></div>
<div class="df"><button class="btn" id="siCancel" type="button">取消</button><button class="btn pri" id="siGo" type="button">匯入</button></div></dialog>`);
let sgEd=null,sgSys='mt',sgSel={slots:[],fest:[],ctx:[]};
function openSong(sys,x){
  if(RO)return;sgEd=x;sgSys=sys;sgSel={slots:[...(x?x.slots:[])],fest:[...(x?x.fest:[])],ctx:[...(x?x.ctx:[])]};
  $('#sgH').textContent=(x?'修改':'新增')+'歌曲';$('#sgS').value=x?x.sys:sys;$('#sgT').value=x?x.title:'';$('#sgR').value=x?x.ref||'':'';$('#sgK').value=x?x.kind||'歌曲':'歌曲';$('#sgP').value=x?x.tempo||'':'';
  $('#sgA').value=x&&x.amin!=null?x.amin:'';$('#sgB').value=x&&x.amin!=null?x.amax:'';$('#sgM').value=x?x.moves||'':'';$('#sgN').value=x?x.note||'':'';$('#sgDel').hidden=!x;sgPaint();$('#sgDlg').showModal();
}
function sgPaint(){
  const chips=(id,arr,key,fmt)=>{$('#'+id).innerHTML=arr.map(v=>`<button type="button" class="opt ${sgSel[key].includes(v)?'sel':''}" data-v="${v}">${fmt?fmt(v):v}</button>`).join('');
    $('#'+id).querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const v=b.dataset.v;sgSel[key]=sgSel[key].includes(v)?sgSel[key].filter(x=>x!==v):[...sgSel[key],v];sgPaint()})};
  chips('sgL',LIFE,'slots',v=>`${LIFE_ICON[v]} ${v}`);chips('sgF',FEST_NAMES,'fest');chips('sgC',SONG_CTX,'ctx');
}
$('#sgT').addEventListener('change',()=>{if(!sgEd&&!sgSel.slots.length&&!sgSel.fest.length){const a=autoSongTags($('#sgT').value);sgSel.slots=a.slots;sgSel.fest=a.fest;sgPaint()}});
$('#sgCancel').onclick=()=>$('#sgDlg').close();
$('#sgForm').addEventListener('submit',e=>{
  e.preventDefault();const t=$('#sgT').value.trim();if(!t){toast('請輸入歌名');return}
  const mn=$('#sgA').value,mx=$('#sgB').value;
  const o={sys:$('#sgS').value,title:t,ref:$('#sgR').value.trim(),kind:$('#sgK').value,tempo:$('#sgP').value,slots:sgSel.slots,fest:sgSel.fest,ctx:sgSel.ctx,amin:mn===''?null:+mn,amax:mn===''?null:(mx===''?120:+mx),moves:$('#sgM').value.trim(),note:$('#sgN').value.trim()};
  if(sgEd)Object.assign(sgEd,o);else S.songs.push({id:uid(),...o});
  save();$('#sgDlg').close();render();toast('已儲存');
});
$('#sgDel').onclick=()=>{if(sgEd&&confirm(`刪除《${sgEd.title}》？`)){S.songs=S.songs.filter(x=>x!==sgEd);save();$('#sgDlg').close();render()}};
$('#sgDlg').addEventListener('click',e=>{if(e.target.id==='sgDlg')$('#sgDlg').close()});
let siSys='mt';
function openSongImport(sys){if(RO)return;siSys=sys;$('#siH').textContent='匯入歌單：'+SYS[sys].name;$('#siText').value='';$('#siDlg').showModal()}
function importSongs(lines,sys){
  let add=0,dup=0;const have=new Set(S.songs.filter(x=>x.sys===sys).map(x=>x.title));
  lines.forEach(l=>{
    l=l.replace(/^\s*新增歌曲[^:：]*[:：]\s*/,'');const c=l.split(/[｜|]/).map(x=>x.trim());const [t,ref,slots,fest,tempo,age,moves]=c;if(!t)return;
    if(have.has(t)){dup++;return}have.add(t);
    const a=autoSongTags(t),ls=(slots||'').split(/[,，、]/).map(x=>x.trim()).filter(x=>LIFE.includes(x)),fs=(fest||'').split(/[,，、]/).map(x=>x.trim()).filter(x=>FEST_NAMES.includes(x));
    const ag=parseAge(age);
    S.songs.push({id:uid(),sys,title:t,ref:ref||'',kind:'歌曲',tempo:['快','中','慢'].includes(tempo)?tempo:'',slots:ls.length?ls:a.slots,fest:fs.length?fs:a.fest,ctx:[],amin:ag?ag[0]:null,amax:ag?ag[1]:null,moves:moves||'',note:''});add++;
  });
  return{add,dup};
}
$('#siCancel').onclick=()=>$('#siDlg').close();
$('#siGo').onclick=()=>{const r=importSongs($('#siText').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),siSys);save();$('#siDlg').close();render();toast(`匯入 ${r.add} 首${r.dup?`，略過重複 ${r.dup} 首`:''}`)};
$('#siDlg').addEventListener('click',e=>{if(e.target.id==='siDlg')$('#siDlg').close()});

/* 教材頁（兩套系統共用版型，各自獨立資料） */
let sysQ={mt:'',hw:''},sysSlot={mt:'',hw:''},sysFest={mt:'',hw:''},sysShow={mt:50,hw:50};
function sysToday(sys){
  const today=ymd(new Date()),cx=ctxFor(today),mo=libMonths().mo,mine=S.songs.filter(x=>x.sys===sys),fests=festNear(today,21);
  const seed=Math.floor(Date.now()/864e5),lines=[];
  const slotPick=LIFE.map(k=>{const arr=mine.filter(x=>x.slots.includes(k));return arr.length?[k,arr[seed%arr.length],arr.length]:null}).filter(Boolean);
  const festLines=fests.filter(f=>f.in<=21).map(f=>{const hit=mine.filter(x=>x.fest.includes(f.tag||f.n));return{f,hit}});
  const R=rng(today+sys),ctxTop=mine.map(s=>({s,...songScore(s,cx,fests.filter(f=>f.in<=14),mo,R)})).filter(x=>x.ctxH>0||(x.s.tempo&&songTempoScore(x.s,cx.tags)>0)).sort((a,b)=>b.sc-a.sc).slice(0,3);
  return{cx,slotPick,festLines,ctxTop,mine,missingSlots:LIFE.filter(k=>!mine.some(x=>x.slots.includes(k)))};
}
function libSys(sys){return function(el){
  const info=SYS[sys],T=sysToday(sys),mine=T.mine,cur=S.currs[sys];
  const q=sysQ[sys].toLowerCase();
  let list=mine.filter(x=>(!q||(x.title+(x.ref||'')+(x.moves||'')).toLowerCase().includes(q))&&(!sysSlot[sys]||x.slots.includes(sysSlot[sys]))&&(!sysFest[sys]||x.fest.includes(sysFest[sys])));
  list.sort((a,b)=>(a.ref||'').localeCompare(b.ref||'','zh-Hant',{numeric:true})||a.title.localeCompare(b.title,'zh-Hant'));
  const fl=T.festLines;
  el.innerHTML=`<div class="panel"><div class="wxtop"><div class="eyebrow">${info.name} · 獨立教材系統</div><span class="ng-actions"><button class="btn pri" id="sgAdd">＋ 新增歌曲</button> <button class="btn" id="sgImp">匯入歌單</button></span></div>
   <div class="hint">${info.sub}</div>
   <label class="f" style="margin-top:8px"><span class="wxl">目前使用的集別／冊／單元（備忘）</span><input id="sysProg" value="${esc(cur.progress||'')}" placeholder="例如：目前在第幾集／第幾冊" autocomplete="off"></label>
   <div class="ngsum"><span class="hint">已登錄 ${mine.length} 首${T.missingSlots.length&&sys==='hw'?` · 還沒指定歌曲的生活情境：${T.missingSlots.join('、')}`:''}</span></div></div>
  <div class="panel" style="margin-top:12px"><div class="wxtop"><div class="eyebrow">Today · 今天唱什麼</div></div>
   <div class="ngsum"><b>${esc(ctxLabel(T.cx))}</b><span class="hint">${T.cx.filled||T.cx.manual?'':'今天還沒填天氣，只依季節'}</span></div>
   ${fl.length?`<div class="ngtypes" style="margin:0 0 8px">${fl.map(({f,hit})=>`<span class="chip ${hit.length?'on':''}">🎉 ${esc(f.n)} ${festIn(f.f||f)}${hit.length?'':'（尚未登錄歌曲）'}</span>`).join('')}</div>`:''}
   ${fl.some(x=>x.hit.length)?`<div class="ngsent" style="margin-bottom:8px"><b>節慶歌曲：</b>${fl.filter(x=>x.hit.length).map(({f,hit})=>`<div>${esc(f.n)}（${festIn(f)}）→ ${hit.slice(0,3).map(s=>'《'+esc(s.title)+'》').join('、')}</div>`).join('')}</div>`:''}
   ${T.slotPick.length?`<div class="wxl">生活歌單（每個情境輪流挑一首）</div>${T.slotPick.map(([k,s,n])=>`<div class="plit"><b>${LIFE_ICON[k]} ${k}：《${esc(s.title)}》</b><span class="hint">${esc(s.ref||'')}${s.moves?' · '+esc(s.moves):''}${n>1?` · 此情境共 ${n} 首輪流`:''}</span></div>`).join('')}`:`<div class="hint">還沒有指定「生活情境」的歌曲。到下方「生活歌單」為起床、洗澡、吃飯、睡前…指定歌曲，這裡就會每天提醒你。</div>`}
   ${T.ctxTop.length?`<div class="wxl" style="margin-top:8px">依今天的季節與天氣</div>${T.ctxTop.map(x=>`<div class="plit"><b>《${esc(x.s.title)}》</b><span class="hint">${esc(x.s.ref||'')}${x.s.tempo?' · '+x.s.tempo+'板':''}${x.ctxH?' · 符合今天的季節／天氣':''}</span></div>`).join('')}`:''}
   <div class="ng-actions" style="margin-top:8px"><button class="btn" id="sysLog">記錄今天唱了什麼</button></div></div>
  <div class="panel" style="margin-top:12px"><div class="wxtop"><div class="eyebrow">Daily Routine · 生活歌單（${sys==='hw'?'起床、洗澡、吃飯唱什麼':'依情境指定歌曲'}）</div></div>
   ${LIFE.map(k=>{const have=mine.filter(x=>x.slots.includes(k)),rest=mine.filter(x=>!x.slots.includes(k));
     return`<div class="slotrow"><div class="slotn">${LIFE_ICON[k]} ${k}</div><div class="chips">${have.map(x=>`<span class="chip on" data-un="${x.id}" data-k="${k}" title="點一下移除">${esc(x.title)} ✕</span>`).join('')||'<span class="hint">—</span>'}</div>
      <select class="slotadd" data-k="${k}"><option value="">＋ 指定歌曲</option>${rest.map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join('')}</select></div>`}).join('')}</div>
  <div class="panel" style="margin-top:12px"><div class="wxtop"><div class="eyebrow">Songs · 歌曲清單</div></div>
   <div class="row" style="flex-wrap:wrap"><label class="f" style="min-width:12em"><input id="syQ" placeholder="搜尋歌名、集別、動作" value="${esc(sysQ[sys])}"></label>
    <label class="f"><select id="syS"><option value="">全部生活情境</option>${LIFE.map(k=>`<option>${k}</option>`).join('')}</select></label>
    <label class="f"><select id="syF"><option value="">全部節慶</option>${FEST_NAMES.map(k=>`<option>${k}</option>`).join('')}</select></label></div>
   <div class="nglog">${list.slice(0,sysShow[sys]).map(x=>`<div class="ngrow sgrow" data-id="${x.id}"><span><b>${esc(x.title)}</b>${x.tempo?` <span class="badge dry">${x.tempo}</span>`:''}<br><span class="hint">${esc(x.ref||'')}${x.moves?(x.ref?' · ':'')+esc(x.moves):''}</span></span><span class="hint">${x.slots.map(k=>LIFE_ICON[k]+k).join(' ')}</span><span class="hint">${x.fest.join('、')}</span><span class="sv"></span></div>`).join('')||`<div class="hint" style="padding:10px 0">還沒有歌曲。按「＋ 新增歌曲」或「匯入歌單」，把你手邊的${esc(info.name)}登錄進來。</div>`}</div>
   ${list.length>sysShow[sys]?`<button class="btn" id="syMore" style="margin-top:8px">再顯示更多（共 ${list.length} 首）</button>`:''}</div>`;
  $('#syS').value=sysSlot[sys];$('#syF').value=sysFest[sys];
  $('#sysProg').onchange=e=>{if(RO)return;cur.progress=e.target.value.trim();save()};
  $('#sgAdd').onclick=()=>openSong(sys,null);$('#sgImp').onclick=()=>openSongImport(sys);
  $('#syQ').oninput=e=>{sysQ[sys]=e.target.value;sysShow[sys]=50;const pos=e.target.selectionStart;libSys(sys)(el);const q=$('#syQ');q.focus();q.setSelectionRange(pos,pos)};
  $('#syS').onchange=e=>{sysSlot[sys]=e.target.value;libSys(sys)(el)};$('#syF').onchange=e=>{sysFest[sys]=e.target.value;libSys(sys)(el)};
  const mo=$('#syMore');if(mo)mo.onclick=()=>{sysShow[sys]+=50;libSys(sys)(el)};
  el.querySelectorAll('.sgrow').forEach(r=>r.onclick=()=>{const x=S.songs.find(y=>y.id===r.dataset.id);if(x&&!RO)openSong(sys,x)});
  el.querySelectorAll('.slotadd').forEach(sel=>sel.onchange=()=>{if(RO||!sel.value)return;const x=S.songs.find(y=>y.id===sel.value);if(x&&!x.slots.includes(sel.dataset.k)){x.slots.push(sel.dataset.k);save();libSys(sys)(el)}});
  el.querySelectorAll('.chip[data-un]').forEach(c=>c.onclick=()=>{if(RO)return;const x=S.songs.find(y=>y.id===c.dataset.un);if(x){x.slots=x.slots.filter(k=>k!==c.dataset.k);save();libSys(sys)(el)}});
  $('#sysLog').onclick=()=>openAct({songs:[...T.slotPick.map(a=>a[1].id),...T.ctxTop.map(x=>x.s.id)].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4),books:[],music:[],toys:[],theme:info.name});
  if(RO)el.querySelectorAll('.ng-actions,.slotadd').forEach(x=>x.style.display='none');
}}
const LTABS=[['today','今日靈感'],['week','本週教案'],['books','書庫'],['mt','Music Together'],['hw','寰宇迪士尼'],['res','其他教材與玩具'],['log','紀錄與檢討']];
function renderLib(){
  const box=$('#libBody');if(!box)return;
  const lm=libMonths();
  const head=`<div class="panel"><div class="wxtop"><div class="eyebrow">Library · 小寶寶目前月齡</div><span class="ng-actions"><button class="ib" id="lbCfg">${lm.src==='birth'?'已由生日計算':'調整月齡'}</button></span></div>
    <div class="ngsum"><b>${esc(lm.text)}</b><span class="hint">書庫 ${S.books.length} 本 · 歌曲 ${S.songs.length} · 其他音樂教材 ${S.music.length} · 玩具 ${S.toys.length} · 活動紀錄 ${S.reads.length} 筆</span></div>
    <div class="ngtabs"><div class="tabs">${LTABS.map(([k,n])=>`<button class="tab ltab" data-k="${k}" aria-selected="${libTab===k}">${n}</button>`).join('')}</div></div></div>`;
  box.innerHTML=head+`<div id="libInner" style="margin-top:12px"></div>`;
  box.querySelectorAll('.ltab').forEach(b=>b.onclick=()=>{libTab=b.dataset.k;renderLib()});
  $('#lbCfg').onclick=()=>{if(RO)return;if(lm.src==='birth'){openSettings(defWho());return}
    const v=prompt('小寶寶目前幾個月？（可輸入 9.5；在「家人 · 設定」輸入生日就會自動計算）',S.libM||9.5);if(v!=null&&+v>=0){S.libM=+v;save();renderLib()}};
  ({today:libToday,week:libWeek,books:libBooks,mt:libSys('mt'),hw:libSys('hw'),res:libRes,log:libLog})[libTab]($('#libInner'));
}
function planCard(p,full){
  const d=pd(p.date);
  return`<div class="panel plan"><div class="wxtop"><div class="eyebrow">${d.getMonth()+1}/${d.getDate()}（週${WD[d.getDay()]}）· 上午 30 分鐘</div></div>
  <div class="lowh">${esc(p.theme.n)}</div>
  <div class="hint" style="margin-bottom:4px">情境：${esc(ctxLabel(p.ctx))}${p.ctx.filled||p.ctx.manual?'':'（這天還沒填天氣，只依季節）'}${p.fests&&p.fests.length?' · 🎉 '+p.fests.slice(0,2).map(f=>esc(f.n)+' '+festIn(f)).join('、'):''}</div>
  <div class="plgrid">
   <div><div class="wxl">📚 繪本</div>${p.books.length?p.books.map(b=>`<div class="plit"><b>《${esc(b.title)}》</b><span class="hint">${esc(planBookReason(p,b))}</span></div>`).join(''):'<div class="hint">書庫沒有適齡的書，請先匯入或新增</div>'}</div>
   <div><div class="wxl">🎵 音樂</div>${p.music.length?p.music.map(m=>`<div class="plit"><b>${esc(m.name)}</b><span class="hint">${esc(m.kind||'')}${m.fest&&m.fest.length?' · 節慶：'+esc(m.fest.join('、')):''}${m.moves?' · '+esc(m.moves):''}</span></div>`).join(''):'<div class="hint">到「音樂與玩具」新增教材</div>'}</div>
   <div><div class="wxl">🧸 玩具</div>${p.toy?`<div class="plit"><b>${esc(p.toy.name)}</b><span class="hint">${esc(p.toy.tags||'')}</span></div>`:'<div class="hint">還沒有玩具資料，先用家裡安全的日常物品</div>'}</div></div>
  ${full?`<div class="steps"><div>0–5 分｜暖身：${p.music[0]?`《${esc(p.music[0].name)}》`:'熟悉的歌'}、拍手、叫名字對視</div><div>5–17 分｜繪本：${esc(p.act)}</div><div>17–25 分｜玩具探索：${p.toy?esc(p.toy.name):'日常物品'}</div><div>25–30 分｜收尾：${p.music[1]?`《${esc(p.music[1].name)}》`:'輕柔音樂'}、擁抱、記下反應</div></div>`:''}
  ${ctxTipLines(p.ctx.tags).length?`<div class="ngsent" style="margin-top:8px;border-left-color:var(--rain)"><b>依今天的季節與天氣：</b>${ctxTipLines(p.ctx.tags).map(t=>`<div>${esc(t)}</div>`).join('')}</div>`:''}
  <div class="ngsent" style="margin-top:8px"><b>發展重點（一般參考）：</b>${p.focus.map(esc).join('；')}<div class="hint">變化點子：${esc(p.vari)}</div></div></div>`;
}

/* ---- 教保目標 → 繪本 + 延伸活動（含年齡調整） ---- */
const GOAL_MAP=[
 [/顏色|色彩|紅|黑|藍|黃|綠/,['顏色']],[/形狀|圓|方形|三角/,['形狀','圓形']],[/追視|對比|視覺/,['追視','對比']],
 [/分離|焦慮|孤獨|想媽媽|黏人|安全感/,['分離焦慮','孤獨','安全感']],[/感官|觸|摸|操作|動手/,['感官','操作']],
 [/音樂|律動|節奏|聲音|唱|擬聲/,['聲音','節奏','擬聲','感官']],[/生氣|憤怒|發脾氣/,['生氣','情緒']],[/害怕|恐懼|怕/,['害怕','安全感','情緒']],
 [/嫉妒|吃醋|分享|輪流/,['嫉妒','分享','輪流']],[/情緒|心情|哭/,['情緒']],[/洗手|衛生|擤鼻|鼻屎/,['洗手','衛生']],[/穿衣|穿脫|自理/,['穿衣','自理']],
 [/生活|習慣|出門|上學/,['生活習慣','出門']],[/交通|車|火車|挖土機/,['交通']],[/動物/,['動物']],[/想像|假裝|創意|角色扮演/,['想像','角色扮演','假裝']],
 [/數量|數數|數字|空間/,['數量','數數','空間']],[/身體|性別|界線/,['身體','性別','界線']],[/生死|離別|死亡|想念|思念/,['生死','思念']],
 [/天氣|下雨|雨/,['天氣','下雨']],[/英文|english/i,['英文']],[/語言|說話|詞彙|認知/,['語言','認知']],[/故事|朋友/,['故事']],[/水果/,['水果']],
 [/精力|好動|想動|動一動/,['操作','感官','聲音','交通']]
];
const GOAL_CHIPS=['認識顏色與形狀','協助處理分離焦慮','設計感官音樂律動','處理生氣與情緒','建立洗手與生活習慣','發揮想像力','認識動物與擬聲'];
function goalTags(text){const t=new Set();GOAL_MAP.forEach(([re,tags])=>{if(re.test(text))tags.forEach(x=>t.add(x))});return[...t]}
/* 依月齡決定共讀方式與活動強度 */
function ageStage(mo){
  const S0=[
   [0,4,'抱讀・聽語調',3,5,'大人抱著讀，以語調、表情與歌聲為主；一次只看 1–2 頁高對比或大圖。','大人示範就好，讓他看、聽、被輕輕碰觸；不要求回應。'],
   [4,6,'抱坐・伸手碰書',5,8,'抱坐在腿上，讓他伸手碰、抓、啃書（硬頁書）；一頁只講一個重點。','活動簡化成「看、聽、摸」，每個動作重複 3–4 次即可。'],
   [6,9,'腿上共讀・指圖',8,10,'坐在大人腿上，指圖說名稱，讓他自己試著翻硬頁；每頁停頓 3 秒等反應。','大人示範，他有興趣再讓他碰；用身體動作（拍手、搖晃）取代語言要求。'],
   [9,12,'指認＋擬聲＋模仿',10,12,'指認圖片、模仿擬聲與簡單動作（拍手、揮手）；讓他在兩本書中選一本，可以重複讀同一本。','大人主導、他可以只看或只模仿一個動作；每個活動 2–3 分鐘就換。'],
   [12,18,'指認與簡單問答',10,15,'邊讀邊問「這是什麼？」，允許他打斷、自己翻頁；可以重複喜歡的頁。','讓他自己動手做一個步驟（放、倒、貼），大人補完其他。'],
   [18,24,'短句與動作扮演',12,15,'用短句重複書中句型，邊讀邊做動作，簡單角色扮演。','活動可加一個小步驟（先…再…），完成後給具體讚美。'],
   [24,36,'問答與預測',15,20,'讀到一半問「接下來會怎樣？」，練習說出情緒與理由，連結到他的生活經驗。','可以完整做兩個步驟的活動，鼓勵他用自己的話說明。'],
   [36,200,'對話式共讀',15,25,'用「為什麼」「如果是你」對話，讓他複述或畫出故事。','可以延伸成創作與角色扮演，由他主導大部分步驟。']
  ];
  return S0.find(x=>mo>=x[0]&&mo<x[1])||S0[S0.length-1];
}
function planByGoal(text,mo,ctxTags){
  ctxTags=ctxTags||ctxFor(ymd(new Date())).tags;
  const tags=goalTags(text);if(!tags.length)return{tags,books:[]};
  const recent=new Set(S.reads.filter(r=>r.t.slice(0,10)>=ymd(addDays(new Date(),-7))).flatMap(r=>r.books||[]));
  const scored=S.books.map(b=>{
    const hit=tags.filter(t=>(b.goals||[]).includes(t)||(b.title||'').includes(t)||(b.tags||'').includes(t));
    const f=fitScore(b,mo);const unsafe=b.caution&&b.amin!=null&&mo<b.amin;
    const ch=ctxHits(b,ctxTags);return{b,hit,ch,f,s:hit.length*3+Math.min(6,ch.length*3)+f+(b.fav?.7:0)-(recent.has(b.id)?2:0)-(unsafe?99:0)-(readsOf(b.id).length*.2)};
  }).filter(x=>x.hit.length&&x.s>0).sort((a,b)=>b.s-a.s).slice(0,2);
  return{tags,books:scored.map(x=>({b:x.b,hit:x.hit,ch:x.ch,ahead:mo<x.b.amin-2,far:mo<x.b.amin-15,past:x.b.amax!=null&&mo>x.b.amax+2}))};
}
function goalActs(res,st){ // 1～2 個延伸活動：第一本書取 1–2 個、第二本書補 1 個
  const out=[];res.books.forEach((x,i)=>{const e=x.b.ext||[];e.slice(0,i?1:2).forEach(a=>{if(out.length<2)out.push({a,from:x.b.title})})});
  return out.map(o=>({...o,adapt:st[6]}));
}
let goalText='',goalMo=null;
function goalCard(){
  const lm=libMonths(),mo=goalMo!=null?goalMo:lm.mo,st=ageStage(mo);
  let res=null,html='';
  if(goalText){
    res=planByGoal(goalText,mo);
    if(!res.tags.length)html=`<div class="hint" style="margin-top:8px">沒有辨識到目標關鍵字。可以試試：顏色、形狀、分離焦慮、情緒、感官、音樂律動、洗手、想像、動物、交通…</div>`;
    else if(!res.books.length)html=`<div class="hint" style="margin-top:8px">辨識到「${res.tags.join('、')}」，但書庫目前沒有符合且適齡的書。可以先新增書，或改個說法。</div>`;
    else{
      const acts=goalActs(res,st);
      html=`<div class="ngtypes" style="margin:8px 0">${res.tags.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>
      <div class="wxl">📚 推薦共讀</div>${res.books.map(x=>`<div class="plit"><b>《${esc(x.b.title)}》</b><span class="hint">${esc(x.b.author||'')}${x.b.pub?' · '+esc(x.b.pub):''} · ${esc(x.b.cat)} · ${esc(ageLabel(x.b))} · 符合：${x.hit.map(esc).join('、')}${x.ch.length?' · <b>也符合今天的'+x.ch.map(esc).join('、')+'</b>':''}${x.far?' · <b>超前較多（建議 '+x.b.amin+' 個月起）：先由大人讀出語調與表情即可</b>':x.ahead?' · <b>略超前，用大人主導的方式讀</b>':''}${x.past?' · 偏簡單，可加深問題':''}${x.b.caution?` · <b style="color:var(--now)">注意：${esc(x.b.caution)}</b>`:''}</span></div>`).join('')}
      <div class="ngsent" style="margin-top:8px"><b>${Math.floor(mo)} 個月的共讀方式（${st[2]}，約 ${st[3]}–${st[4]} 分鐘）：</b>${esc(st[5])}</div>
      ${ctxTipLines(ctxFor(ymd(new Date())).tags).length?`<div class="ngsent" style="margin-top:8px;border-left-color:var(--rain)"><b>今天的季節與天氣：</b>${ctxTipLines(ctxFor(ymd(new Date())).tags).map(t=>`<div>${esc(t)}</div>`).join('')}</div>`:''}
      <div class="wxl" style="margin-top:8px">🎯 延伸活動</div>${acts.map((o,i)=>`<div class="plit"><b>${i+1}. ${esc(o.a)}</b><span class="hint">來自《${esc(o.from)}》 · 本月齡調整：${esc(o.adapt)}</span></div>`).join('')}`;
    }
  }
  return`<div class="panel" style="margin-bottom:12px"><div class="wxtop"><div class="eyebrow">Goal · 今日教保目標 → 搭配繪本與活動</div></div>
  <div class="row" style="flex-wrap:wrap;align-items:flex-end"><label class="f" style="flex:3;min-width:14em">今天想做什麼？<input id="gText" value="${esc(goalText)}" placeholder="例如：今天想帶孩子認識顏色與形狀" autocomplete="off"></label>
   <label class="f" style="flex:1;min-width:8em">孩子月齡<select id="gMo"><option value="">目前（${esc(lm.text)}）</option>${[3,6,9,12,18,24,36].map(m=>`<option value="${m}">試算 ${m>=24?m/12+' 歲':m+' 個月'}</option>`).join('')}</select></label>
   <button class="btn pri" id="gGo" style="height:41px">搭配</button></div>
  <div class="ngtypes" style="margin-top:6px">${GOAL_CHIPS.map(c=>`<span class="chip" data-g="${c}">${c}</span>`).join('')}</div>${html}
  ${res&&res.books.length?`<div class="ng-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn pri" id="gLog">記錄今天的活動</button><button class="btn" id="gTxt">複製文字</button><button class="btn" id="gAsk">複製給 Claude</button></div>`:''}</div>`;
}
function bindGoal(el){
  const run=()=>{goalText=$('#gText').value.trim();const v=$('#gMo').value;goalMo=v===''?null:+v;renderLib()};
  $('#gGo').onclick=run;$('#gText').onkeydown=e=>{if(e.key==='Enter')run()};
  $('#gMo').value=goalMo==null?'':String(goalMo);
  el.querySelectorAll('.chip[data-g]').forEach(c=>c.onclick=()=>{$('#gText').value=c.dataset.g;run()});
  const mo=goalMo!=null?goalMo:libMonths().mo,res=goalText?planByGoal(goalText,mo):null;
  if(res&&res.books.length){
    const st=ageStage(mo),acts=goalActs(res,st);
    const txt=`【今日教保目標】${goalText}（${Math.floor(mo)} 個月）\n推薦共讀：${res.books.map(x=>`《${x.b.title}》`).join('、')}\n共讀方式（${st[2]}，約 ${st[3]}–${st[4]} 分鐘）：${st[5]}\n延伸活動：\n${acts.map((o,i)=>`${i+1}. ${o.a}（調整：${o.adapt}）`).join('\n')}`;
    $('#gTxt').onclick=()=>showCopy('今日目標教案','',txt);
    $('#gAsk').onclick=()=>showCopy('貼給 Claude',`貼到 Claude 對話，會得到個人化版本`,`${babyLine()}。今天的教保目標：${goalText}。系統推薦：${res.books.map(x=>'《'+x.b.title+'》').join('、')}。\n${txt}\n\n請依這個目標微調：1) 共讀時的提問與動作 2) 兩個延伸活動的具體做法與道具 3) 明天的變化。\n${NOTE_TAIL}`);
    $('#gLog').onclick=()=>openAct({books:res.books.map(x=>x.b.id),music:[],toys:[],theme:'目標：'+goalText,note:'今日目標：'+goalText});
  }
}
const CTX_CHIPS=['下雨','晴天','陰天','熱','冷','光線暗'];
function ctxCard(){
  const c=ctxFor(ymd(new Date()));
  return`<div class="panel" style="margin-bottom:12px"><div class="wxtop"><div class="eyebrow">Today's Context · 今日季節與天氣</div></div>
  <div class="ngsum"><b>${esc(ctxLabel(c))}</b><span class="hint">${c.manual?'手動指定':c.filled?'依你填的今日天氣':'今天還沒填天氣，目前只依季節（到「今日」頁勾選天氣後會自動帶入）'}</span></div>
  <div class="ngtypes" style="margin:0"><span class="chip ${ctxManual?'':'on'}" data-x="auto">自動</span>${CTX_CHIPS.map(t=>`<span class="chip ${ctxManual&&ctxManual.includes(t)?'on':''}" data-x="${t}">${t}</span>`).join('')}</div>
  <div class="hint" style="margin-top:6px">推薦繪本、音樂與活動時，會優先挑符合今天季節與天氣的（例如下雨天讀《下雨天的球球》、配安靜的鋼琴）。</div></div>`;
}
function bindCtx(el){
  el.querySelectorAll('.chip[data-x]').forEach(c=>c.onclick=()=>{
    const x=c.dataset.x;if(x==='auto')ctxManual=null;else{const cur=new Set(ctxManual||[]);cur.has(x)?cur.delete(x):cur.add(x);ctxManual=cur.size?[...cur]:null}
    renderLib()});
}
function libToday(el){
  const key=ymd(new Date()),p=makePlan(key,libSeed);
  el.innerHTML=ctxCard()+goalCard()+planCard(p,true)+`<div class="ng-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn pri" id="lpLog">記錄今天的活動</button><button class="btn" id="lpShuf">換一組</button><button class="btn" id="lpTxt">複製教案文字</button><button class="btn" id="lpAsk">複製給 Claude（今日加碼）</button></div>
  <div class="hint" style="margin-top:6px">推薦依「月齡、最近 7 天讀過的書、最近用過的主題」自動挑選。想要更個人化的建議，按「複製給 Claude」貼到對話。</div>`;
  bindCtx(el);bindGoal(el);
  $('#lpShuf').onclick=()=>{libSeed++;renderLib()};
  $('#lpTxt').onclick=()=>showCopy('今日教案','可直接貼到 LINE 或筆記',planText(p));
  $('#lpAsk').onclick=()=>showCopy('貼給 Claude','把整段貼到 Claude 對話，就能得到個人化的今日教案',askToday(p));
  $('#lpLog').onclick=()=>openAct({books:p.books.map(b=>b.id),music:p.music.filter(m=>!m.song).map(m=>m.id),songs:p.music.filter(m=>m.song).map(m=>m.id),toys:p.toy?[p.toy.id]:[],theme:p.theme.n});
}
function libWeek(el){
  const used=new Set(),usedT=new Set(),usedS=new Set(),plans=[];
  for(let i=0;i<7;i++){const p=makePlan(ymd(addDays(new Date(),i)),libSeed,used,usedT,usedS);p.books.forEach(b=>used.add(b.id));p.music.filter(m=>m.song).forEach(m=>usedS.add(m.id));usedT.add(p.theme.n);plans.push(p)}
  el.innerHTML=plans.map(p=>planCard(p,false)).join('')+`<div class="ng-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn" id="wkShuf">整週重排</button><button class="btn" id="wkTxt">複製整週教案</button><button class="btn" id="wkAsk">複製給 Claude（規劃本週）</button></div>`;
  $('#wkShuf').onclick=()=>{libSeed++;renderLib()};
  $('#wkTxt').onclick=()=>showCopy('本週教案','',plans.map(planText).join('\n\n'));
  $('#wkAsk').onclick=()=>showCopy('貼給 Claude','把整段貼到 Claude 對話，請它依你的資源規劃本週上午 30 分鐘教案',askWeek());
}

/* ---- 書庫 ---- */
function libBooks(el){
  const mo=libMonths().mo,q=bookQ.toLowerCase();
  let list=S.books.filter(b=>(!bookQ||(b.title+(b.author||'')+(b.pub||'')+(b.tags||'')).toLowerCase().includes(q))&&(!bookCat||b.cat===bookCat)&&(!bookPub||(b.pub||'（未指定）')===bookPub)&&(!bookAuth||(b.author||'（未指定）')===bookAuth)&&
    (bookAge==='all'||(bookAge==='fit'?(bookQ||bookPub||bookAuth||fitScore(b,mo)>=1):bookAge==='none'?b.amin==null:ageLabel(b)===bookAge)));
  list.sort((a,b)=>fitScore(b,mo)-fitScore(a,mo)||a.title.localeCompare(b.title,'zh-Hant'));
  const uniq=f=>[...new Set(S.books.map(b=>b[f]||'（未指定）'))].sort((x,y)=>x.localeCompare(y,'zh-Hant'));
  const byCat=CATS.map(c=>[c,S.books.filter(b=>b.cat===c).length]).filter(x=>x[1]);
  const unk=S.books.filter(b=>b.amin==null).length,unread=S.books.filter(b=>!readsOf(b.id).length).length,chk=S.books.filter(b=>b.check).length;
  el.innerHTML=`<div class="panel"><div class="ngtypes" style="margin:0 0 8px">${byCat.map(([c,n])=>`<span class="chip ${bookCat===c?'on':''}" data-c="${c}">${c} ${n}</span>`).join('')}</div>
  <div class="hint">共 ${S.books.length} 本 · 未分齡 ${unk} · 還沒讀過 ${unread}${chk?` · 待確認 ${chk}（依書名推測，請核對）`:''}</div>
  <div class="row" style="margin:8px 0;flex-wrap:wrap"><label class="f" style="min-width:12em"><input id="bkQ" placeholder="搜尋書名、作者、出版社、主題" value="${esc(bookQ)}"></label>
   <label class="f"><select id="bkAge"><option value="fit">適合目前月齡</option><option value="all">全部月齡</option><option value="none">未分齡</option>${AGE_PRESETS.map(p=>`<option value="${p[0]}">${p[0]}</option>`).join('')}</select></label>
   <label class="f"><select id="bkCat"><option value="">全部領域</option>${CATS.map(c=>`<option>${c}</option>`).join('')}</select></label>
   <label class="f"><select id="bkPub"><option value="">全部出版社</option>${uniq('pub').map(c=>`<option>${esc(c)}</option>`).join('')}</select></label>
   <label class="f"><select id="bkAuth"><option value="">全部作者</option>${uniq('author').map(c=>`<option>${esc(c)}</option>`).join('')}</select></label></div>
  <div class="ng-actions" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" id="bkAdd">＋ 新增一本</button><button class="btn" id="bkImp">匯入書單</button><button class="btn" id="bkRe">重新自動歸類</button><button class="btn" id="bkExp">匯出書庫</button>${unk?`<button class="btn" id="bkBulk">批次設定未分齡</button>`:''}</div>
  <div class="ng-actions"><label class="f" style="margin-top:8px"><span class="wxl">快速新增指令（一行一本）</span><span style="display:flex;gap:6px"><input id="bkQuick" placeholder="書名｜作者｜出版社｜領域｜適讀年齡｜延伸活動1；延伸活動2" autocomplete="off"><button class="btn" id="bkQuickGo" type="button">新增</button></span></label></div>
  <div class="nglog">${list.slice(0,bookShow).map(b=>`<div class="ngrow bkrow" data-id="${b.id}"><span><b>${b.fav?'★ ':''}${esc(b.title)}</b>${b.check?' <span class="badge dry" title="依書名推測，請核對">待確認</span>':''}${b.caution?' <span class="badge hot" title="'+esc(b.caution)+'">注意</span>':''}<br><span class="hint">${esc(b.author||'')}${b.author&&b.pub?' · ':''}${esc(b.pub||'')}</span></span><span class="chip">${esc(b.cat)}</span><span class="who" style="font-size:12.5px">${esc(ageLabel(b))}</span><span class="sv">${readsOf(b.id).length?'讀 '+readsOf(b.id).length:''}</span></div>`).join('')||'<div class="hint" style="padding:12px 0">沒有符合的書。按「匯入書單」可一次貼上幾百本。</div>'}</div>
  ${list.length>bookShow?`<button class="btn" id="bkMore" style="margin-top:8px">再顯示 ${Math.min(60,list.length-bookShow)} 本（共 ${list.length} 本）</button>`:''}</div>`;
  $('#bkAge').value=bookAge;$('#bkCat').value=bookCat;$('#bkPub').value=bookPub;$('#bkAuth').value=bookAuth;
  $('#bkQ').oninput=e=>{bookQ=e.target.value;bookShow=60;const pos=e.target.selectionStart;libBooks(el);const q=$('#bkQ');q.focus();q.setSelectionRange(pos,pos)};
  $('#bkAge').onchange=e=>{bookAge=e.target.value;bookShow=60;libBooks(el)};
  $('#bkCat').onchange=e=>{bookCat=e.target.value;bookShow=60;libBooks(el)};
  $('#bkPub').onchange=e=>{bookPub=e.target.value;bookShow=60;libBooks(el)};
  $('#bkAuth').onchange=e=>{bookAuth=e.target.value;bookShow=60;libBooks(el)};
  el.querySelectorAll('.chip[data-c]').forEach(c=>c.onclick=()=>{bookCat=bookCat===c.dataset.c?'':c.dataset.c;bookShow=60;libBooks(el)});
  el.querySelectorAll('.bkrow').forEach(r=>r.onclick=()=>{if(!RO)openBook(bookById(r.dataset.id));else showBook(bookById(r.dataset.id))});
  $('#bkAdd').onclick=()=>openBook(null);$('#bkImp').onclick=()=>openImport();
  $('#bkExp').onclick=()=>showCopy('匯出書庫（JSON）','整段複製後貼到記事本存檔，就是完整備份；也可貼回「匯入書單」還原',JSON.stringify(S.books,null,1));
  $('#bkQuickGo').onclick=()=>{if(RO)return;const v=$('#bkQuick').value.trim();if(!v)return;const r=importLines([v]);if(r.add){save();libBooks(el);toast(`已新增：${v.split(/[｜|]/)[0].replace(/^新增繪本[:：]?/,'')}`)}else toast(r.dup?'書庫已有這本書':'格式不正確，請看欄位提示')};
  $('#bkRe').onclick=()=>{if(RO)return;let n=0;S.books.forEach(b=>{if(b.catAuto){const c=autoCat(b.title);if(c!==b.cat){b.cat=c;n++}}});save();libBooks(el);toast(`已重新歸類（變更 ${n} 本；手動指定過的不動）`)};
  const bm=$('#bkMore');if(bm)bm.onclick=()=>{bookShow+=60;libBooks(el)};
  const bb=$('#bkBulk');if(bb)bb.onclick=()=>{if(RO)return;const v=prompt('把所有「未分齡」的書設為：\n'+AGE_PRESETS.map((p,i)=>`${i+1}. ${p[0]}`).join('\n')+'\n請輸入編號');const p=AGE_PRESETS[(+v)-1];if(!p)return;S.books.forEach(b=>{if(b.amin==null){b.amin=p[1];b.amax=p[2]}});save();libBooks(el)};
  if(RO)el.querySelectorAll('.ng-actions').forEach(x=>x.style.display='none');
}
function showBook(b){if(!b)return;showCopy(b.title,`${b.author||'作者未指定'} · ${b.pub||'出版社未指定'} · ${b.cat} · ${ageLabel(b)}`,`${b.ext.length?'延伸活動：\n'+b.ext.map((x,i)=>`${i+1}. ${x}`).join('\n'):''}${b.caution?'\n\n注意：'+b.caution:''}${b.note?'\n\n備註：'+b.note:''}`)}
let bookPub='',bookAuth='';
document.body.insertAdjacentHTML('beforeend',`<dialog id="bkDlg"><form method="dialog" id="bkForm"><div class="dh" id="bkH">書籍</div><div class="db">
 <label class="f">書名<input id="bkT" autocomplete="off"></label>
 <div class="row"><label class="f">作者<input id="bkA" autocomplete="off"></label><label class="f">出版社<input id="bkU" autocomplete="off"></label></div>
 <div class="row"><label class="f">故事類別／領域<select id="bkC">${CATS.map(c=>`<option>${c}</option>`).join('')}</select></label>
 <label class="f">建議閱讀年齡<select id="bkP"><option value="">未分齡</option>${AGE_PRESETS.map((p,i)=>`<option value="${i}">${p[0]}</option>`).join('')}<option value="x">自訂（月）</option></select></label></div>
 <div class="row" id="bkCust" hidden><label class="f">最小月齡<input type="number" id="bkMin" min="0" max="120"></label><label class="f">最大月齡<input type="number" id="bkMax" min="0" max="120"></label></div>
 <label class="f">教保目標關鍵字（逗號分隔，用來配對「今日目標」）<input id="bkG" placeholder="顏色, 形狀, 情緒, 分離焦慮" autocomplete="off"></label>
 <label class="f">適合的季節／天氣（逗號分隔：春、夏、秋、冬、下雨、晴天、熱、冷）<input id="bkE" placeholder="下雨, 陰天" autocomplete="off"></label>
 <label class="f">教保活動延伸應用（一行一個）<textarea id="bkX" rows="4" style="border:1px solid var(--rule);background:var(--paper);padding:8px;font-size:15px;width:100%"></textarea></label>
 <label class="f">安全注意（選填，例如小零件、磁鐵）<input id="bkS" autocomplete="off"></label>
 <label class="f chk"><span><input type="checkbox" id="bkF"> ★ 小寶寶特別喜歡</span></label>
 <label class="f">備註（選填）<input id="bkN" autocomplete="off"></label></div>
 <div class="df"><button type="button" class="btn del" id="bkDel" hidden>刪除</button><span class="sp"></span><button type="button" class="btn" id="bkCancel">取消</button><button type="submit" class="btn pri">儲存</button></div></form></dialog>
<dialog id="imDlg"><div class="dh">匯入書單</div><div class="db"><div class="hint">兩種格式（每行一本）：<br>① <b>書名, 作者, 分類, 適讀月齡</b>（逗號或 Tab 分隔，可直接從 Excel 貼上；後三項可省略）<br>② <b>書名｜作者｜出版社｜領域｜適讀年齡｜延伸活動1；延伸活動2</b>（用「｜」分隔，欄位可留空）<br>已有的書名會自動略過。<br>
<input type="file" id="imFile" accept=".csv,.txt,.json,text/plain,text/csv,application/json" style="margin-top:6px"></div>
<textarea id="imText" rows="10" style="width:100%;border:1px solid var(--rule);background:var(--paper);padding:8px;font-size:15px" placeholder="在這裡貼上書單…"></textarea><div class="hint" id="imInfo"></div></div>
<div class="df"><button class="btn" id="imCancel" type="button">取消</button><button class="btn pri" id="imGo" type="button">匯入</button></div></dialog>`);
let bkEditing=null;
function openBook(b){
  if(RO)return;bkEditing=b;
  $('#bkH').textContent=b?'修改書籍':'新增書籍';
  $('#bkT').value=b?b.title:'';$('#bkA').value=b?b.author||'':'';$('#bkU').value=b?b.pub||'':'';$('#bkC').value=b?b.cat:'其他';$('#bkN').value=b?b.note||'':'';$('#bkF').checked=!!(b&&b.fav);
  $('#bkG').value=b?(b.goals||[]).join(', '):'';$('#bkE').value=b?(b.ctx||[]).join(', '):'';$('#bkX').value=b?(b.ext||[]).join('\n'):'';$('#bkS').value=b?b.caution||'':'';
  const pi=b&&b.amin!=null?AGE_PRESETS.findIndex(p=>p[1]===b.amin&&p[2]===b.amax):-1;
  $('#bkP').value=!b||b.amin==null?'':pi>=0?String(pi):'x';$('#bkMin').value=b&&b.amin!=null?b.amin:'';$('#bkMax').value=b&&b.amin!=null?b.amax:'';
  $('#bkCust').hidden=$('#bkP').value!=='x';$('#bkDel').hidden=!b;$('#bkDlg').showModal();
}
$('#bkP').onchange=()=>$('#bkCust').hidden=$('#bkP').value!=='x';
$('#bkT').addEventListener('change',()=>{if(!bkEditing&&$('#bkC').value==='其他')$('#bkC').value=autoCat($('#bkT').value)});
$('#bkCancel').onclick=()=>$('#bkDlg').close();
$('#bkForm').addEventListener('submit',e=>{
  e.preventDefault();const t=$('#bkT').value.trim();if(!t){toast('請輸入書名');return}
  const pv=$('#bkP').value;let amin=null,amax=null;
  if(pv==='x'){amin=+$('#bkMin').value;amax=+$('#bkMax').value;if(isNaN(amin)||isNaN(amax)||amax<amin){toast('月齡範圍不正確');return}}
  else if(pv!==''){amin=AGE_PRESETS[+pv][1];amax=AGE_PRESETS[+pv][2]}
  const goals=$('#bkG').value.split(/[,，、]/).map(x=>x.trim()).filter(Boolean);
  const o={title:t,author:$('#bkA').value.trim(),pub:$('#bkU').value.trim(),cat:$('#bkC').value,amin,amax,fav:$('#bkF').checked,note:$('#bkN').value.trim(),catAuto:false,goals,tags:goals.join(','),
    ctx:$('#bkE').value.split(/[,，、]/).map(x=>x.trim()).filter(Boolean),ext:$('#bkX').value.split('\n').map(x=>x.trim()).filter(Boolean),caution:$('#bkS').value.trim(),check:false};
  if(bkEditing){if(bkEditing.cat===o.cat)o.catAuto=bkEditing.catAuto;Object.assign(bkEditing,o)}else S.books.push({id:uid(),...o,catAuto:o.cat===autoCat(t)});
  save();$('#bkDlg').close();render();toast('已儲存');
});
$('#bkDel').onclick=()=>{if(bkEditing&&confirm(`刪除《${bkEditing.title}》？`)){if(bkEditing.core){S.seedDel=S.seedDel||[];S.seedDel.push(bkEditing.title)}S.books=S.books.filter(x=>x!==bkEditing);save();$('#bkDlg').close();render()}};
$('#bkDlg').addEventListener('click',e=>{if(e.target.id==='bkDlg')$('#bkDlg').close()});
function openImport(){if(RO)return;$('#imText').value='';$('#imInfo').textContent='';$('#imDlg').showModal()}
$('#imFile').onchange=async e=>{const f=e.target.files[0];if(f)$('#imText').value=await f.text()};
$('#imCancel').onclick=()=>$('#imDlg').close();
const catFuzzy=(x,title)=>{if(!x)return autoCat(title);const c=CATS.find(c=>c===x)||CATS.find(c=>c.includes(x)||x.includes(c));return c||autoCat(x+title)};
function importLines(lines){ // 回傳 {add,dup}
  let add=0,dup=0;const have=new Set(S.books.map(b=>b.title));
  lines.forEach(l=>{
    l=l.replace(/^\s*新增繪本\s*[:：]?\s*/,'');let b;
    if(/[｜|]/.test(l)){ // 標準指令格式
      const [t,a,pub,cat,age,ext]=l.split(/[｜|]/).map(x=>x.trim());if(!t)return;
      const ag=parseAge(age);b={title:t.replace(/^[《「『]|[》」』]$/g,''),author:/^未指定$/.test(a||'')?'':a||'',pub:/^未指定$/.test(pub||'')?'':pub||'',cat:catFuzzy(cat,t),amin:ag?ag[0]:null,amax:ag?ag[1]:null,ext:(ext||'').split(/[；;]/).map(x=>x.trim()).filter(Boolean),catAuto:!cat};
    }else{
      const c=l.split(/\t|,|，|;|；/).map(x=>x.trim());let [t,a,cat,age]=c;if(!t||/^(書名|title)$/i.test(t))return;
      const ag=parseAge(age);b={title:t.replace(/^[《「『]|[》」』]$/g,''),author:a||'',pub:'',cat:catFuzzy(cat,t),amin:ag?ag[0]:null,amax:ag?ag[1]:null,ext:[],catAuto:!CATS.includes(cat)};
    }
    if(have.has(b.title)){dup++;return}have.add(b.title);
    S.books.push({id:uid(),goals:[],tags:'',fav:false,note:'',caution:'',check:false,...b});add++;
  });
  return{add,dup};
}
$('#imGo').onclick=()=>{
  const txt=$('#imText').value.trim();
  if(txt.startsWith('[')){try{const arr=JSON.parse(txt);const have=new Set(S.books.map(b=>b.title));let n=0;arr.forEach(b=>{if(b&&b.title&&!have.has(b.title)){S.books.push({id:uid(),goals:[],ext:[],tags:'',pub:'',author:'',...b,id:b.id&&!S.books.some(x=>x.id===b.id)?b.id:uid()});n++}});normLib();save();$('#imDlg').close();libTab='books';render();toast(`還原 ${n} 本`);return}catch(e){toast('JSON 格式不正確');return}}
  const r=importLines(txt.split(/\r?\n/).map(x=>x.trim()).filter(Boolean));
  save();$('#imDlg').close();libTab='books';render();toast(`匯入 ${r.add} 本${r.dup?`，略過重複 ${r.dup} 本`:''}`);
};
$('#imDlg').addEventListener('click',e=>{if(e.target.id==='imDlg')$('#imDlg').close()});

/* ---- 音樂與玩具 ---- */
function libRes(el){
  const sec=(title,arr,kind)=>`<div class="panel" style="margin-bottom:12px"><div class="wxtop"><div class="eyebrow">${title}</div><span class="ng-actions"><button class="btn pri" data-add="${kind}">＋ 新增</button></span></div>
   <div class="nglog" style="margin-top:6px">${arr.map(x=>`<div class="ngrow resrow" data-k="${kind}" data-id="${x.id}"><span><b>${esc(x.name)}</b> <span class="hint">${esc(x.kind||'')}</span></span><span class="hint">${esc(x.tags||'')}</span><span class="who">${x.amin!=null?esc(ageLabel(x)):''}</span><span class="sv"></span></div>`).join('')||'<div class="hint" style="padding:8px 0">還沒有資料</div>'}</div></div>`;
  el.innerHTML=sec('音樂教材（Music Together、鋼琴譜、迪士尼…）',S.music,'music')+sec('玩具',S.toys,'toys')+`<div class="hint">「標籤」用逗號分隔（例如：聲音, 節奏, 抓握, 躲），系統會依今日主題配對到推薦裡。</div>`;
  el.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>openRes(b.dataset.add,null));
  el.querySelectorAll('.resrow').forEach(r=>r.onclick=()=>{const x=S[r.dataset.k].find(y=>y.id===r.dataset.id);if(x)openRes(r.dataset.k,x)});
  if(RO)el.querySelectorAll('.ng-actions').forEach(x=>x.style.display='none');
}
document.body.insertAdjacentHTML('beforeend',`<dialog id="rsDlg"><form method="dialog" id="rsForm"><div class="dh" id="rsH">教材</div><div class="db">
 <label class="f">名稱<input id="rsN" autocomplete="off"></label><label class="f">類型（選填）<input id="rsK" placeholder="例如：歌唱律動 / 鋼琴 / 感官玩具" autocomplete="off"></label>
 <label class="f">標籤（逗號分隔）<input id="rsT" placeholder="聲音, 節奏, 抓握" autocomplete="off"></label>
 <div class="row" id="rsAge"><label class="f">適用最小月齡（選填）<input type="number" id="rsMin" min="0" max="120"></label><label class="f">最大月齡<input type="number" id="rsMax" min="0" max="120"></label></div></div>
 <div class="df"><button type="button" class="btn del" id="rsDel" hidden>刪除</button><span class="sp"></span><button type="button" class="btn" id="rsCancel">取消</button><button type="submit" class="btn pri">儲存</button></div></form></dialog>`);
let rsEd=null,rsKind='music';
function openRes(kind,x){if(RO)return;rsKind=kind;rsEd=x;$('#rsH').textContent=(kind==='music'?'音樂教材':'玩具')+(x?'':'：新增');
  $('#rsN').value=x?x.name:'';$('#rsK').value=x?x.kind||'':'';$('#rsT').value=x?x.tags||'':'';$('#rsMin').value=x&&x.amin!=null?x.amin:'';$('#rsMax').value=x&&x.amin!=null?x.amax:'';
  $('#rsDel').hidden=!x;$('#rsDlg').showModal()}
$('#rsCancel').onclick=()=>$('#rsDlg').close();
$('#rsForm').addEventListener('submit',e=>{e.preventDefault();const n=$('#rsN').value.trim();if(!n){toast('請輸入名稱');return}
  const mn=$('#rsMin').value,mx=$('#rsMax').value,o={name:n,kind:$('#rsK').value.trim(),tags:$('#rsT').value.trim(),amin:mn===''?null:+mn,amax:mn===''?null:(mx===''?120:+mx)};
  if(rsEd)Object.assign(rsEd,o);else S[rsKind].push({id:uid(),...o});save();$('#rsDlg').close();render();toast('已儲存')});
$('#rsDel').onclick=()=>{if(rsEd&&confirm(`刪除「${rsEd.name}」？`)){S[rsKind]=S[rsKind].filter(x=>x!==rsEd);save();$('#rsDlg').close();render()}};
$('#rsDlg').addEventListener('click',e=>{if(e.target.id==='rsDlg')$('#rsDlg').close()});

/* ---- 活動紀錄與檢討 ---- */
const REACT=['專注盯著看','開心笑','伸手抓／拍','咬書','咿呀出聲','跟著節奏動','想自己翻頁','分心','想睡了','哭鬧／抗拒'];
function libLog(el){
  const reads=[...S.reads].sort((a,b)=>b.t.localeCompare(a.t));
  const wk=reads.filter(r=>r.t.slice(0,10)>=ymd(addDays(new Date(),-6)));
  const bookSet=new Set(wk.flatMap(r=>r.books||[]));
  const reactCnt=REACT.map((n,i)=>[n,wk.filter(r=>(r.react||[]).includes(i)).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
  el.innerHTML=`<div class="panel"><div class="wxtop"><div class="eyebrow">Activity Log · 活動紀錄與檢討</div><span class="ng-actions"><button class="btn pri" id="lgAdd">＋ 記錄活動</button></span></div>
  <div class="ngsum">近 7 天 <b>${wk.length}</b> 次 · 讀了 <b>${bookSet.size}</b> 本不同的書${reactCnt.length?` · 最常見反應：${reactCnt.slice(0,3).map(x=>`${x[0]} ${x[1]}`).join('、')}`:''}</div>
  <div class="nglog">${reads.slice(0,40).map(r=>{const d=dtParse(r.t);return`<div class="lgrow" data-id="${r.id}"><div class="when">${d.getMonth()+1}/${d.getDate()} ${hhmm(d.getHours()*60+d.getMinutes())}${r.theme?` · ${esc(r.theme)}`:''}</div>
   <div>${(r.books||[]).map(id=>{const b=bookById(id);return b?`《${esc(b.title)}》`:''}).join('、')||'<span class="hint">（沒選書）</span>'}${(r.music||[]).map(id=>(S.music.find(m=>m.id===id)||{}).name).filter(Boolean).map(n=>` 🎵${esc(n)}`).join('')}${(r.toys||[]).map(id=>(S.toys.find(m=>m.id===id)||{}).name).filter(Boolean).map(n=>` 🧸${esc(n)}`).join('')}</div>
   <div class="hint">${(r.react||[]).map(i=>REACT[i]).join('、')}${r.note?' · '+esc(r.note):''}</div>
   <div class="ng-actions"><button class="ib" data-ask="${r.id}">複製給 Claude 檢討</button></div></div>`}).join('')||'<div class="hint" style="padding:10px 0">還沒有紀錄。按「＋ 記錄活動」，或在「今日靈感」按「記錄今天的活動」。</div>'}</div></div>`;
  $('#lgAdd').onclick=()=>openAct({});
  el.querySelectorAll('.lgrow').forEach(r=>r.onclick=e=>{if(e.target.dataset.ask){const x=S.reads.find(y=>y.id===e.target.dataset.ask);showCopy('貼給 Claude 檢討','貼到 Claude 對話，會得到發展意義與明天的變化教案',askReview(x));return}
    const x=S.reads.find(y=>y.id===r.dataset.id);if(x&&!RO)openAct(x)});
  if(RO)el.querySelectorAll('.ng-actions').forEach(x=>x.style.display='none');
}
document.body.insertAdjacentHTML('beforeend',`<dialog id="acDlg"><form method="dialog" id="acForm"><div class="dh" id="acH">記錄活動</div><div class="db">
 <div class="row"><label class="f">時間（24 小時制）<input id="acT"></label><label class="f">日期<input type="date" id="acD"></label></div>
 <div><div class="wxl">繪本</div><div class="chips" id="acBooks"></div><label class="f" style="margin-top:6px"><input id="acQ" placeholder="輸入書名搜尋並加入…" autocomplete="off"></label><div class="chips" id="acHits"></div></div>
 <div><div class="wxl">歌曲（Music Together／寰宇迪士尼）</div><div class="chips" id="acSongs"></div><label class="f" style="margin-top:6px"><input id="acQ2" placeholder="輸入歌名搜尋並加入…" autocomplete="off"></label><div class="chips" id="acHits2"></div></div>
 <div><div class="wxl">其他音樂教材</div><div class="chips" id="acMusic"></div></div>
 <div><div class="wxl">玩具</div><div class="chips" id="acToys"></div></div>
 <div><div class="wxl">小寶寶的反應（可複選）</div><div class="chips" id="acReact"></div></div>
 <label class="f">補充（你的觀察、想檢討的點）<textarea id="acN" rows="3" style="border:1px solid var(--rule);background:var(--paper);padding:8px;font-size:16px;width:100%"></textarea></label></div>
 <div class="df"><button type="button" class="btn del" id="acDel" hidden>刪除</button><span class="sp"></span><button type="button" class="btn" id="acCancel">取消</button><button type="submit" class="btn pri">儲存</button></div></form></dialog>`);
time24($('#acT'));
let acEd=null,acSel={books:[],music:[],songs:[],toys:[],react:[],theme:''};
function openAct(o){
  if(RO)return;acEd=o.id?o:null;
  acSel={books:[...(o.books||[])],songs:[...(o.songs||[])],music:[...(o.music||[])],toys:[...(o.toys||[])],react:[...(o.react||[])],theme:o.theme||''};
  const d=o.t?dtParse(o.t):new Date();$('#acH').textContent=acEd?'修改活動紀錄':'記錄活動';
  $('#acT').value=hhmm(d.getHours()*60+d.getMinutes());$('#acD').value=ymd(d);$('#acN').value=o.note||'';$('#acQ').value='';$('#acDel').hidden=!acEd;acPaint();$('#acDlg').showModal();
}
function acPaint(){
  const chip=(label,on,k,v)=>`<button type="button" class="opt ${on?'sel':''}" data-k="${k}" data-v="${v}">${esc(label)}</button>`;
  $('#acBooks').innerHTML=acSel.books.map(id=>{const b=bookById(id);return b?chip('《'+b.title+'》 ✕',true,'books',id):''}).join('')||'<span class="hint">尚未選書</span>';
  $('#acSongs').innerHTML=acSel.songs.map(id=>{const x=S.songs.find(y=>y.id===id);return x?chip('♪ '+x.title+' ✕',true,'songs',id):''}).join('')||'<span class="hint">尚未選歌</span>';
  $('#acMusic').innerHTML=S.music.map(m=>chip(m.name,acSel.music.includes(m.id),'music',m.id)).join('')||'<span class="hint">到「音樂與玩具」新增</span>';
  $('#acToys').innerHTML=S.toys.map(m=>chip(m.name,acSel.toys.includes(m.id),'toys',m.id)).join('')||'<span class="hint">到「音樂與玩具」新增</span>';
  $('#acReact').innerHTML=REACT.map((r,i)=>chip(r,acSel.react.includes(i),'react',i)).join('');
  $('#acDlg').querySelectorAll('.opt[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=k==='react'?+b.dataset.v:b.dataset.v;acSel[k]=acSel[k].includes(v)?acSel[k].filter(x=>x!==v):[...acSel[k],v];acPaint()});
  acHits();acHits2();
}
function acHits(){const q=$('#acQ').value.trim().toLowerCase();
  $('#acHits').innerHTML=q?S.books.filter(b=>!acSel.books.includes(b.id)&&b.title.toLowerCase().includes(q)).slice(0,8).map(b=>`<button type="button" class="chip" data-id="${b.id}">＋ ${esc(b.title)}</button>`).join('')||'<span class="hint">找不到（可先到書庫新增）</span>':'';
  $('#acHits').querySelectorAll('.chip[data-id]').forEach(c=>c.onclick=()=>{acSel.books.push(c.dataset.id);$('#acQ').value='';acPaint()})}
$('#acQ').addEventListener('input',acHits);
$('#acQ2').addEventListener('input',acHits2);
function acHits2(){const q=$('#acQ2').value.trim().toLowerCase();
  $('#acHits2').innerHTML=q?S.songs.filter(x=>!acSel.songs.includes(x.id)&&x.title.toLowerCase().includes(q)).slice(0,8).map(x=>`<button type="button" class="chip" data-id="${x.id}">＋ ${esc(x.title)}（${songSys(x).tag}）</button>`).join('')||'<span class="hint">找不到（可先到教材頁新增）</span>':'';
  $('#acHits2').querySelectorAll('.chip[data-id]').forEach(c=>c.onclick=()=>{acSel.songs.push(c.dataset.id);$('#acQ2').value='';acPaint()})}
$('#acCancel').onclick=()=>$('#acDlg').close();
$('#acForm').addEventListener('submit',e=>{e.preventDefault();const tm=t24($('#acT').value),ds=$('#acD').value;if(!tm||!ds){toast('請確認日期與時間（24 小時制）');return}
  const o={t:`${ds}T${tm}`,books:acSel.books,songs:acSel.songs,music:acSel.music,toys:acSel.toys,react:acSel.react.sort((a,b)=>a-b),theme:acSel.theme,note:$('#acN').value.trim()};
  if(acEd)Object.assign(acEd,o);else S.reads.push({id:uid(),...o});save();$('#acDlg').close();render();toast('已記錄')});
$('#acDel').onclick=()=>{if(acEd&&confirm('刪除這筆活動紀錄？')){S.reads=S.reads.filter(x=>x!==acEd);save();$('#acDlg').close();render()}};
$('#acDlg').addEventListener('click',e=>{if(e.target.id==='acDlg')$('#acDlg').close()});

/* ---- 給 Claude 的提示詞 ---- */
const NOTE_TAIL='請用繁體中文、務實具體，不要過度解讀；若出現明顯需要留意的發展警訊才提醒諮詢兒科或兒童發展專業。';
function babyLine(){const m=S.members.find(x=>x.id===defWho()),lm=libMonths();return`${m?m.name:'寶寶'}（${lm.text}）`}
function reactText(r){return(r.react||[]).map(i=>REACT[i]).join('、')}
function askReview(r){
  const d=dtParse(r.t),bs=(r.books||[]).map(id=>bookById(id)).filter(Boolean).map(b=>`《${b.title}》（${b.cat}，${ageLabel(b)}）`).join('、')||'（未記錄書名）';
  const ms=(r.music||[]).map(id=>(S.music.find(m=>m.id===id)||{}).name).filter(Boolean).join('、')||'無',ts=(r.toys||[]).map(id=>(S.toys.find(m=>m.id===id)||{}).name).filter(Boolean).join('、')||'無';
  return`${babyLine()}。${d.getMonth()+1}/${d.getDate()} ${hhmm(d.getHours()*60+d.getMinutes())} 我帶他讀了 ${bs}；音樂：${ms}${(r.songs||[]).length?'；歌曲：'+(r.songs||[]).map(id=>(S.songs.find(x=>x.id===id)||{}).title).filter(Boolean).join('、'):''}；玩具：${ts}。\n他的反應：${reactText(r)||'（未選）'}${r.note?'；我的觀察：'+r.note:''}。\n\n請幫我：\n1. 說明這次活動對他目前的認知／語言／動作發展可能有什麼幫助\n2. 明天我可以怎麼變化這個教案（給 2–3 個具體做法）\n3. 有哪些觀察重點可以記錄\n${NOTE_TAIL}`;
}
function inventory(){
  const mo=libMonths().mo,fit=S.books.filter(b=>fitScore(b,mo)>=1).slice(0,80);
  return`【書庫（適合目前月齡，共 ${fit.length} 本，另有 ${S.books.length-fit.length} 本其他）】\n${CATS.map(c=>{const t=fit.filter(b=>b.cat===c).map(b=>`《${b.title}》`);return t.length?`${c}：${t.join('、')}`:''}).filter(Boolean).join('\n')||'（尚未建立）'}\n${['mt','hw'].map(k=>{const a=S.songs.filter(x=>x.sys===k);return a.length?`【${SYS[k].name} 歌曲】${a.slice(0,60).map(x=>x.title+(x.slots.length?'('+x.slots.join('/')+')':'')).join('、')}`:''}).filter(Boolean).join('\n')}\n【其他音樂教材】${S.music.map(m=>m.name).join('、')||'無'}\n【玩具】${S.toys.map(m=>m.name).join('、')||'（尚未登錄）'}`;
}
function recentSummary(){const wk=S.reads.filter(r=>r.t.slice(0,10)>=ymd(addDays(new Date(),-7)));
  return wk.length?`【最近 7 天紀錄】\n`+wk.sort((a,b)=>a.t.localeCompare(b.t)).map(r=>{const d=dtParse(r.t);return`${d.getMonth()+1}/${d.getDate()}：${(r.books||[]).map(id=>(bookById(id)||{}).title).filter(Boolean).map(t=>'《'+t+'》').join('')} → ${reactText(r)||'—'}${r.note?'（'+r.note+'）':''}`}).join('\n'):'【最近 7 天紀錄】無'}
function askWeek(){return`${babyLine()}。我想請你規劃「本週每天上午 30 分鐘」的適齡教案（含繪本、音樂、玩具與一句活動說明，每天要有變化、不要重複用同一本書）。\n\n${inventory()}\n\n${recentSummary()}\n\n小寶寶最近的狀態：（請在這裡補充，例如：最近對聲音很有反應）\n\n${NOTE_TAIL}`}
function askToday(p){return`${babyLine()}。請依下面的資源，幫我設計今天上午 30 分鐘的教保活動，並說明這些活動對他目前發展的意義，最後給我明天的變化點子。\n\n系統初步推薦的主題：${p.theme.n}；繪本：${p.books.map(b=>'《'+b.title+'》').join('、')||'—'}；音樂：${p.music.map(m=>m.name).join('、')||'—'}；玩具：${p.toy?p.toy.name:'—'}\n\n${inventory()}\n\n${recentSummary()}\n\n${NOTE_TAIL}`}

/* ---- 電費帳單 ---- */
function billStats(b){
  const from=pd(b.from),to=pd(b.to),days=Math.round((to-from)/864e5)+1;
  let live=0,mast=0;for(let i=0;i<days;i++){const d=addDays(from,i);if(d>new Date())break;live+=acMins(d,'living');mast+=acMins(d,'master')}
  return{days,live,mast,perDay:b.amount/days,perKwh:b.kwh?b.amount/b.kwh:null};
}
const hm=m=>`${Math.floor(m/60)} 小時${m%60?' '+m%60+' 分':''}`;
function renderBills(){
  const p=$('#elPanel');if(!p)return;
  const bills=[...S.bills].sort((a,b)=>b.from.localeCompare(a.from)),st=bills.map(billStats);
  p.innerHTML=`<div class="wxtop"><div class="eyebrow">Electricity · 電費帳單（多數住宅是兩個月一期，請依帳單上的計費期間填寫）</div><span class="ng-actions"><button class="btn pri" id="blAdd">＋ 輸入電費帳單</button></span></div>
  ${bills.length?`<div class="nglog" style="margin-top:6px">`+bills.map((b,i)=>{const s=st[i],prev=st[i+1],pb=bills[i+1];
    const chg=pb?Math.round((b.amount-pb.amount)/pb.amount*100):null,acNow=s.live+s.mast,acPrev=prev?prev.live+prev.mast:null;
    return`<div class="ngrow blrow" data-id="${b.id}" style="grid-template-columns:11em 1fr auto"><span class="when">${b.from.slice(5).replace('-','/')} – ${b.to.slice(5).replace('-','/')}（${s.days} 天）</span>
     <span class="hint">平均每天 NT$${s.perDay.toFixed(0)}${s.perKwh?` · NT$${s.perKwh.toFixed(2)}/度（${b.kwh} 度）`:''} · 冷氣開啟：客廳 ${hm(s.live)}、主臥 ${hm(s.mast)}${chg!=null?` · 比上期電費 ${chg>=0?'+':''}${chg}%${acPrev!=null?`、冷氣時數 ${acNow>=acPrev?'+':'-'}${hm(Math.abs(acNow-acPrev))}`:''}`:''}${b.note?' · '+esc(b.note):''}</span><b>NT$${b.amount.toLocaleString()}</b></div>`}).join('')+`</div>`:'<div class="hint" style="margin-top:6px">還沒有帳單。收到電費單後輸入金額，這裡會對照同一期間兩台冷氣開了多久。</div>'}
  <div class="hint" style="margin-top:8px">冷氣開關次數不限：每次開關都會記錄，時數是把每一段「開著的時間」加總（跨午夜也會正確拆開）。電費單包含全家所有電器，冷氣時數只能當參考，無法精確換算成金額。</div>`;
  $('#blAdd').onclick=()=>openBill(null);
  p.querySelectorAll('.blrow').forEach(r=>r.onclick=()=>{const b=S.bills.find(x=>x.id===r.dataset.id);if(b&&!RO)openBill(b)});
  if(RO)p.querySelectorAll('.ng-actions').forEach(x=>x.style.display='none');
}
document.body.insertAdjacentHTML('beforeend',`<dialog id="blDlg"><form method="dialog" id="blForm"><div class="dh" id="blH">電費帳單</div><div class="db">
 <div class="row"><label class="f">計費開始日<input type="date" id="blF"></label><label class="f">計費結束日<input type="date" id="blT"></label></div>
 <div class="chips" id="blPre"></div>
 <label class="f">應繳金額（NT$）<input type="number" id="blA" inputmode="numeric" min="0"></label>
 <label class="f">用電度數（選填）<input type="number" id="blK" inputmode="numeric" min="0"></label>
 <label class="f">備註（選填）<input id="blN" autocomplete="off"></label></div>
 <div class="df"><button type="button" class="btn del" id="blDel" hidden>刪除</button><span class="sp"></span><button type="button" class="btn" id="blCancel">取消</button><button type="submit" class="btn pri">儲存</button></div></form></dialog>`);
let blEd=null;
function openBill(b){
  if(RO)return;blEd=b;$('#blH').textContent=b?'修改電費帳單':'輸入電費帳單';
  const last=[...S.bills].sort((x,y)=>y.to.localeCompare(x.to))[0],today=new Date();
  const defFrom=b?b.from:last?ymd(addDays(pd(last.to),1)):ymd(new Date(today.getFullYear(),today.getMonth()-2,1));
  const f=pd(defFrom),defTo=b?b.to:ymd(new Date(f.getFullYear(),f.getMonth()+2,0));
  $('#blF').value=defFrom;$('#blT').value=defTo;$('#blA').value=b?b.amount:'';$('#blK').value=b&&b.kwh?b.kwh:'';$('#blN').value=b?b.note||'':'';$('#blDel').hidden=!b;
  $('#blPre').innerHTML=`<button type="button" class="chip" data-m="2">兩個月一期</button><button type="button" class="chip" data-m="1">一個月一期</button>`;
  $('#blPre').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{const f=pd($('#blF').value);$('#blT').value=ymd(new Date(f.getFullYear(),f.getMonth()+ +c.dataset.m,0))});
  $('#blDlg').showModal();
}
$('#blCancel').onclick=()=>$('#blDlg').close();
$('#blForm').addEventListener('submit',e=>{e.preventDefault();const f=$('#blF').value,t=$('#blT').value,a=+$('#blA').value;
  if(!f||!t||t<f){toast('請確認計費期間');return}if(!(a>0)){toast('請輸入電費金額');return}
  const o={from:f,to:t,amount:a,kwh:$('#blK').value?+$('#blK').value:null,note:$('#blN').value.trim()};
  if(blEd)Object.assign(blEd,o);else S.bills.push({id:uid(),...o});save();$('#blDlg').close();render();toast('已儲存')});
$('#blDel').onclick=()=>{if(blEd&&confirm('刪除這筆帳單？')){S.bills=S.bills.filter(x=>x!==blEd);save();$('#blDlg').close();render()}};
$('#blDlg').addEventListener('click',e=>{if(e.target.id==='blDlg')$('#blDlg').close()});


/* ---- 冷氣紀錄補記／修改 ---- */
document.body.insertAdjacentHTML('beforeend',`<dialog id="aeDlg"><div class="dh" id="aeH">冷氣紀錄</div><div class="db">
 <div class="wxl">補記一段已經開過的時間（例如忘了按開關）</div>
 <div class="row"><label class="f">日期<input type="date" id="aeD"></label><label class="f">開始（24 小時制）<input id="aeS"></label><label class="f">結束<input id="aeE"></label></div>
 <button type="button" class="btn" id="aeSeg">加入這一段</button>
 <div class="wxl" style="margin-top:6px">紀錄明細（可改時間、改開／關、刪除；最近 40 筆）</div><div id="aeList"></div>
 <div class="hint">目前正開著但開啟時間不對？把那一筆「開」的時間改掉就好。</div></div>
 <div class="df"><button type="button" class="btn" id="aeCancel">取消</button><button type="button" class="btn pri" id="aeSave">儲存</button></div></dialog>`);
time24($('#aeS'));time24($('#aeE'));
let aeK='living',aeWork=[];
function openAcEdit(k){
  if(RO)return;aeK=k;aeWork=[...acu(k).log].sort((a,b)=>a.t-b.t).map(x=>({...x}));
  $('#aeH').textContent=`${ACS.find(a=>a[0]===k)[1]}：補記／修改紀錄`;
  $('#aeD').value=ymd(new Date());$('#aeS').value='';$('#aeE').value='';aePaint();$('#aeDlg').showModal();
}
function aePaint(){
  const start=Math.max(0,aeWork.length-40),rows=aeWork.map((x,i)=>({x,i})).slice(start).reverse();
  $('#aeList').innerHTML=rows.map(({x,i})=>{const d=new Date(x.t);
    return`<div class="aerow" data-i="${i}"><input type="date" value="${ymd(d)}" data-f="d"><input data-f="t" value="${pad(d.getHours())}:${pad(d.getMinutes())}" maxlength="5" inputmode="numeric">
      <select data-f="on"><option value="1" ${x.on?'selected':''}>開</option><option value="0" ${x.on?'':'selected'}>關</option></select><button type="button" class="ib" data-del="${i}" aria-label="刪除">✕</button></div>`}).join('')||'<div class="hint">還沒有紀錄</div>';
  $('#aeList').querySelectorAll('.aerow').forEach(r=>{
    const i=+r.dataset.i,upd=()=>{const tm=t24(r.querySelector('[data-f=t]').value),ds=r.querySelector('[data-f=d]').value;
      if(tm&&ds){aeWork[i].t=+dtParse(ds+'T'+tm);aeWork[i].on=r.querySelector('[data-f=on]').value==='1'}};
    r.querySelectorAll('input,select').forEach(el=>el.addEventListener('change',upd));
    r.querySelector('[data-del]').onclick=()=>{aeWork.splice(i,1);aePaint()};
  });
}
$('#aeSeg').onclick=()=>{
  const ds=$('#aeD').value,s=t24($('#aeS').value),e=t24($('#aeE').value);
  if(!ds||!s||!e){toast('請填日期、開始與結束時間（24 小時制，例如 14:30）');return}
  const a=dtParse(ds+'T'+s);let b=dtParse(ds+'T'+e);if(b<=a)b=new Date(+b+864e5);
  if(+a>Date.now()||+b>Date.now()+6e4){toast('時間不能晚於現在');return}
  aeWork.push({t:+a,on:true},{t:+b,on:false});aeWork.sort((x,y)=>x.t-y.t);$('#aeS').value='';$('#aeE').value='';aePaint();toast('已加入，記得按「儲存」');
};
$('#aeCancel').onclick=()=>$('#aeDlg').close();
$('#aeSave').onclick=()=>{
  if(aeWork.some(x=>!x.t||x.t>Date.now()+6e4)){toast('有紀錄的時間晚於現在，請修正');return}
  aeWork.sort((a,b)=>a.t-b.t);const u=acu(aeK);u.log=aeWork.slice(-3000);
  const last=u.log[u.log.length-1];u.on=last?!!last.on:false; // 目前狀態以最後一筆為準
  save();$('#aeDlg').close();render();toast(`已更新，目前${u.on?'開著':'關著'}`);
};
$('#aeDlg').addEventListener('click',e=>{if(e.target.id==='aeDlg')$('#aeDlg').close()});

/* ====================== 雙模式：數據儀表板 ⇄ 地平線 RPG ====================== */
const TK=()=>ymd(new Date());
const QCATS=[['nanny','保母任務','◈'],['mom','媽媽任務','✦'],['clean','環境整潔任務','⚙'],['self','照顧自己的任務','❖']];
const qcat=k=>QCATS.find(c=>c[0]===k)||QCATS[0];
function normRpg(){
  S.q=S.q||{};['done','cnt','evdone','flag','clear','side'].forEach(k=>S.q[k]=S.q[k]||{});S.q.custom=S.q.custom||[];S.q.hidden=S.q.hidden||[];
  S.rpg=S.rpg||{};const R=S.rpg;R.xp=R.xp||0;R.coins=R.coins||0;R.skills=R.skills||{};R.gear=R.gear||{};R.gear.owned=R.gear.owned||{};R.gear.equipped=R.gear.equipped||{};
  R.badges=R.badges||{};R.awarded=R.awarded||{};R.claimed=R.claimed||{};R.log=R.log||[];R.title=R.title||'';R.visits=R.visits||{};R.boots=R.boots||'white';
}
const _norm3=norm;norm=function(){_norm3();normRpg()};normRpg();

/* ---- 每日任務定義 ---- */
const feedCount=d=>feedsOn(d,defWho()).length;
const DQ=[
 {id:'bm_feed',cat:'nanny',t:'記錄今日餵奶（至少 3 次）',xp:20,coins:6,go:'feed',prog:d=>[feedCount(d),3]},
 {id:'bm_wash',cat:'nanny',t:'餵奶後 2 小時內初步清洗奶瓶（拆解、沖洗、刷洗）',xp:20,coins:6},
 {id:'bm_wx',cat:'nanny',t:'填寫今日天氣紀錄',xp:10,coins:3,go:'weather',prog:d=>[Object.keys(S.wx[d]||{}).length?1:0,1]},
 {id:'bm_read',cat:'nanny',t:'完成一次共讀／教案活動並記錄',xp:20,coins:6,go:'lib',prog:d=>[S.reads.filter(r=>r.t.startsWith(d)).length,1]},
 {id:'bm_report',cat:'nanny',t:'傳送今日回報給家長（複製今日回報即自動完成）',xp:15,coins:4,flag:'report'},
 {id:'bm_safe',cat:'nanny',t:'環境安全巡檢（地墊、插座、小零件）',xp:10,coins:3},
 {id:'mm_kid',cat:'mom',t:'陪大寶 20 分鐘（專心、不滑手機）',xp:20,coins:6},
 {id:'mm_joy',cat:'mom',t:'做一件讓自己開心的小事',xp:15,coins:5},
 {id:'mm_grat',cat:'mom',t:'寫下今天的一件感恩',xp:10,coins:3},
 {id:'mm_talk',cat:'mom',t:'和家人聊天 10 分鐘',xp:10,coins:3},
 {id:'cl_laundry',cat:'clean',t:'洗衣服',xp:15,coins:5},
 {id:'cl_dish',cat:'clean',t:'洗碗',xp:15,coins:5},
 {id:'cl_mop',cat:'clean',t:'拖地',xp:15,coins:5},
 {id:'cl_toilet',cat:'clean',t:'刷馬桶',xp:15,coins:5},
 {id:'cl_sink',cat:'clean',t:'刷水槽',xp:15,coins:5},
 {id:'sc_water',cat:'self',t:'喝 900 ml 以上的果乾水',xp:25,coins:8,counter:{unit:'ml',target:900,steps:[200,500]}},
 {id:'sc_read',cat:'self',t:'讀 2 頁書',xp:20,coins:6,counter:{unit:'頁',target:2,steps:[1,2]}}
];
const CLEAN_IDS=DQ.filter(q=>q.cat==='clean').map(q=>q.id);
const dailyList=()=>[...DQ.filter(q=>!S.q.hidden.includes(q.id)),...S.q.custom.filter(c=>c.kind==='daily').map(c=>({id:c.id,cat:c.cat,t:c.t,xp:c.xp,coins:c.coins,custom:1}))];
function eventQuests(d){ // 今日照護行程（來自時間軸，與儀表板勾選同步）
  const babies=S.members.filter(m=>/寶寶/.test(m.role||'')||m.id===defWho());const out=[];
  babies.forEach(m=>dayEvents(new Date(),m.id).forEach(x=>{if(!x.ev.flex)out.push({id:'ev_'+x.ev.id,evid:x.ev.id,cat:'nanny',t:`${hhmm(x.s)} ${m.name}：${x.ev.title}`,xp:5,coins:1,ev:1})}));
  return out.slice(0,12);
}
function qState(q,d){
  const done=(S.q.done[d]||{});
  if(q.ev)return{done:!!(S.q.evdone[d]||{})[q.evid],kind:'ev'};
  if(q.counter){const c=((S.q.cnt[d]||{})[q.id])||0;return{done:c>=q.counter.target,cur:c,target:q.counter.target,kind:'counter'}}
  if(q.prog){const [c,t]=q.prog(d);return{done:c>=t,cur:c,target:t,kind:'auto'}}
  if(q.flag)return{done:!!(S.q.flag[d]||{})[q.flag]||!!done[q.id],kind:'flag'};
  return{done:!!done[q.id],kind:'manual'};
}

/* ---- 技能樹、裝備、徽章 ---- */
const SKILLS=[
 {id:'t1',br:'time',tier:1,cost:1,name:'晨間節奏',desc:'保母任務 XP +10%',fx:[{k:'xp',cat:'nanny',pct:10}]},
 {id:'t2',br:'time',tier:2,cost:1,req:'t1',name:'時間切片',desc:'保母任務金幣 +15%',fx:[{k:'coin',cat:'nanny',pct:15}]},
 {id:'t3',br:'time',tier:3,cost:2,req:'t2',name:'預備戰術',desc:'每日通關額外 +20 XP',fx:[{k:'flat',what:'clear',xp:20}]},
 {id:'t4',br:'time',tier:4,cost:2,req:'t3',name:'超頻',desc:'所有 XP +5%',fx:[{k:'xp',cat:'all',pct:5}]},
 {id:'e1',br:'emo',tier:1,cost:1,name:'深呼吸護盾',desc:'媽媽任務 XP +10%',fx:[{k:'xp',cat:'mom',pct:10}]},
 {id:'e2',br:'emo',tier:2,cost:1,req:'e1',name:'情緒偵測',desc:'媽媽任務金幣 +15%',fx:[{k:'coin',cat:'mom',pct:15}]},
 {id:'e3',br:'emo',tier:3,cost:2,req:'e2',name:'護盾連鎖',desc:'連續通關可容許每 7 天 1 天缺口',fx:[{k:'shield'}]},
 {id:'e4',br:'emo',tier:4,cost:2,req:'e3',name:'平靜核心',desc:'所有 XP +5%',fx:[{k:'xp',cat:'all',pct:5}]},
 {id:'c1',br:'chore',tier:1,cost:1,name:'整理光束',desc:'環境整潔 XP +10%',fx:[{k:'xp',cat:'clean',pct:10}]},
 {id:'c2',br:'chore',tier:2,cost:1,req:'c1',name:'動線優化',desc:'環境整潔金幣 +15%',fx:[{k:'coin',cat:'clean',pct:15}]},
 {id:'c3',br:'chore',tier:3,cost:2,req:'c2',name:'脈衝清掃',desc:'五項整潔全清額外 +25 XP',fx:[{k:'flat',what:'clean',xp:25}]},
 {id:'c4',br:'chore',tier:4,cost:2,req:'c3',name:'資源回收',desc:'所有金幣 +5%',fx:[{k:'coin',cat:'all',pct:5}]},
 {id:'h1',br:'heal',tier:1,cost:1,name:'補給站',desc:'照顧自己 XP +15%',fx:[{k:'xp',cat:'self',pct:15}]},
 {id:'h2',br:'heal',tier:2,cost:1,req:'h1',name:'能量回復',desc:'照顧自己金幣 +15%',fx:[{k:'coin',cat:'self',pct:15}]},
 {id:'h3',br:'heal',tier:3,cost:2,req:'h2',name:'星光休憩',desc:'低能量日（昨夜睡眠被打斷）所有 XP +20%',fx:[{k:'low',pct:20}]},
 {id:'h4',br:'heal',tier:4,cost:2,req:'h3',name:'再生核心',desc:'所有 XP +5%',fx:[{k:'xp',cat:'all',pct:5}]}
];
const BRANCHES=[['time','時間管理','⏱'],['emo','情緒防護罩','🛡'],['chore','高效家務','⚙'],['heal','自我療癒','✦']];
const SLOTS=[['head','頭戴'],['weapon','武器'],['armor','護甲'],['tool','工具'],['charm','飾品']];
const GEAR=[
 {id:'g_h1',slot:'head',lv:2,cost:40,name:'焦點偵測器 Mk.I',desc:'保母任務 XP +10%',fx:[{k:'xp',cat:'nanny',pct:10}]},
 {id:'g_h2',slot:'head',lv:6,cost:140,name:'焦點偵測器 Mk.II',desc:'保母任務 XP +20%',fx:[{k:'xp',cat:'nanny',pct:20}]},
 {id:'g_w1',slot:'weapon',lv:3,cost:60,name:'共鳴長弓',desc:'媽媽任務 XP +10%',fx:[{k:'xp',cat:'mom',pct:10}]},
 {id:'g_w2',slot:'weapon',lv:8,cost:200,name:'烈焰共振長弓',desc:'媽媽任務 XP +20%',fx:[{k:'xp',cat:'mom',pct:20}]},
 {id:'g_a1',slot:'armor',lv:4,cost:80,name:'機獸甲殼外套',desc:'照顧自己 XP +10%',fx:[{k:'xp',cat:'self',pct:10}]},
 {id:'g_a2',slot:'armor',lv:9,cost:220,name:'強化機甲外套',desc:'照顧自己 XP +20%',fx:[{k:'xp',cat:'self',pct:20}]},
 {id:'g_t1',slot:'tool',lv:2,cost:50,name:'萬用維修鉤',desc:'環境整潔 XP +10%',fx:[{k:'xp',cat:'clean',pct:10}]},
 {id:'g_t2',slot:'tool',lv:7,cost:170,name:'脈衝清潔裝置',desc:'環境整潔 XP +20%',fx:[{k:'xp',cat:'clean',pct:20}]},
 {id:'g_c1',slot:'charm',lv:5,cost:100,name:'紅色護符',desc:'所有金幣 +10%',fx:[{k:'coin',cat:'all',pct:10}]},
 {id:'g_c2',slot:'charm',lv:10,cost:300,name:'黃金守護徽記',desc:'所有金幣 +20%、所有 XP +5%',fx:[{k:'coin',cat:'all',pct:20},{k:'xp',cat:'all',pct:5}]}
];
const allFx=()=>{const o=[];SKILLS.forEach(s=>{if(S.rpg.skills[s.id])o.push(...s.fx)});GEAR.forEach(g=>{if(S.rpg.gear.equipped[g.slot]===g.id)o.push(...g.fx)});return o};
const hasFx=k=>allFx().some(f=>f.k===k);
const flatFx=w=>allFx().filter(f=>f.k==='flat'&&f.what===w).reduce((t,f)=>t+f.xp,0);
const modPct=(k,cat)=>allFx().filter(f=>f.k===k&&(f.cat==='all'||f.cat===cat)).reduce((t,f)=>t+f.pct,0);
function reward(cat,xp,coins){
  let xm=1+modPct('xp',cat)/100;const cm=1+modPct('coin',cat)/100;
  const ls=typeof lowState==='function'?lowState(new Date()):null;if(ls&&ls.on)xm+=allFx().filter(f=>f.k==='low').reduce((t,f)=>t+f.pct,0)/100;
  return{xp:Math.round(xp*xm),coins:Math.round(coins*cm)};
}
/* 等級：Lv1→2 需 100 XP，之後每級多 40 */
function lvInfo(xp){let l=1,need=100;while(xp>=need){xp-=need;l++;need=100+40*(l-1)}return{lv:l,into:xp,need}}
const lv=()=>lvInfo(S.rpg.xp).lv;
const mainClaimedN=()=>Object.keys(S.rpg.claimed).filter(k=>k.startsWith('main:')).length;
const spSpent=()=>SKILLS.filter(s=>S.rpg.skills[s.id]).reduce((t,s)=>t+s.cost,0);
const spAvail=()=>Math.max(0,lv()-1+mainClaimedN()-spSpent());
function logRpg(t,r){S.rpg.log.unshift({t:Date.now(),text:t,xp:r.xp||0,coins:r.coins||0});S.rpg.log=S.rpg.log.slice(0,60)}


/* ---- 週／月／主線／支線 ---- */
const weekDates=()=>{const s=weekStart(new Date());return Array.from({length:7},(_,i)=>ymd(addDays(s,i)))};
const monthDates=()=>{const n=new Date(),len=new Date(n.getFullYear(),n.getMonth()+1,0).getDate();return Array.from({length:len},(_,i)=>ymd(new Date(n.getFullYear(),n.getMonth(),i+1)))};
const pastOnly=ds=>ds.filter(d=>d<=TK());
const cleanFull=d=>CLEAN_IDS.every(id=>((S.q.done[d]||{})[id]));
const selfFull=d=>DQ.filter(q=>q.cat==='self').every(q=>qState(q,d).done);
const cnt=(ds,f)=>pastOnly(ds).filter(f).length;
const readsIn=ds=>S.reads.filter(r=>ds.includes(r.t.slice(0,10))).length;
const futureWx=()=>[1,2,3].map(i=>ymd(addDays(new Date(),i))).filter(d=>Object.keys(S.wx[d]||{}).length).length;
const WQ=[
 {id:'w_clean',cat:'clean',t:'本週有 5 天把環境整潔 5 項全部完成',target:5,xp:120,coins:40,prog:()=>cnt(weekDates(),cleanFull)},
 {id:'w_self',cat:'self',t:'本週有 5 天達成「喝 900 ml 果乾水＋讀 2 頁書」',target:5,xp:120,coins:40,prog:()=>cnt(weekDates(),selfFull)},
 {id:'w_feed',cat:'nanny',t:'本週有 5 天記錄餵奶',target:5,xp:100,coins:30,prog:()=>cnt(weekDates(),d=>feedCount(d)>0)},
 {id:'w_read',cat:'nanny',t:'本週完成 4 次共讀／教案活動紀錄',target:4,xp:100,coins:30,prog:()=>readsIn(weekDates())},
 {id:'w_wx',cat:'nanny',t:'預先填好未來 3 天的天氣預報',target:3,xp:60,coins:20,prog:futureWx},
 {id:'w_clear',cat:'mom',t:'本週有 4 天達成「每日通關」',target:4,xp:150,coins:50,prog:()=>cnt(weekDates(),d=>S.q.clear[d])}
];
const MQM=()=>S.q.cnt['m:'+TK().slice(0,7)]||{};
const MO=[
 {id:'m_feed',cat:'nanny',t:'本月累積 60 次餵奶紀錄',target:60,xp:300,coins:100,prog:()=>monthDates().reduce((t,d)=>t+feedCount(d),0)},
 {id:'m_read',cat:'nanny',t:'本月累積 12 次共讀／教案活動',target:12,xp:300,coins:100,prog:()=>readsIn(monthDates())},
 {id:'m_clear',cat:'mom',t:'本月有 20 天達成「每日通關」',target:20,xp:400,coins:140,prog:()=>cnt(monthDates(),d=>S.q.clear[d])},
 {id:'m_self',cat:'self',t:'本月有 20 天達成「照顧自己」',target:20,xp:300,coins:100,prog:()=>cnt(monthDates(),selfFull)},
 {id:'m_bill',cat:'clean',t:'輸入本期電費帳單',target:1,xp:80,coins:30,prog:()=>S.bills.some(b=>b.to>=ymd(addDays(new Date(),-62)))?1:0},
 {id:'m_deep',cat:'clean',t:'本月完成 2 次大掃除（手動 +1）',target:2,xp:200,coins:70,manual:true,prog:()=>MQM().m_deep||0}
];
const distinctSlots=()=>new Set(S.songs.flatMap(x=>x.slots)).size;
const MAIN=[
 {id:'mq1',t:'基地建立',desc:'把系統調成你家的樣子',xp:200,coins:80,title:'基地建造者',conds:[
   ['設定至少 3 位成員的生日',()=>S.members.filter(m=>m.birth).length>=3,()=>[Math.min(S.members.filter(m=>m.birth).length,3),3]],
   ['累積 7 天天氣紀錄',()=>Object.keys(S.wx).length>=7,()=>[Math.min(Object.keys(S.wx).length,7),7]],
   ['書庫累積 28 本繪本',()=>S.books.length>=28,()=>[Math.min(S.books.length,28),28]],
   ['指定 3 個生活歌單情境',()=>distinctSlots()>=3,()=>[Math.min(distinctSlots(),3),3]]]},
 {id:'mq2',t:'節奏掌控者',desc:'連續 7 天每日通關',xp:300,coins:120,title:'節奏掌控者',conds:[['連續通關 7 天',()=>streak()>=7,()=>[Math.min(streak(),7),7]]]},
 {id:'mq3',t:'夜間守護者',desc:'長期記錄與守護寶寶的作息',xp:300,coins:120,title:'夜間守護者',conds:[
   ['夜醒紀錄累積 10 筆',()=>S.nights.length>=10,()=>[Math.min(S.nights.length,10),10]],['餵奶紀錄累積 50 筆',()=>S.feeds.length>=50,()=>[Math.min(S.feeds.length,50),50]]]},
 {id:'mq4',t:'知識獵人',desc:'把繪本與教材變成日常',xp:350,coins:130,title:'知識獵人',conds:[
   ['書庫累積 40 本',()=>S.books.length>=40,()=>[Math.min(S.books.length,40),40]],['活動紀錄累積 20 筆',()=>S.reads.length>=20,()=>[Math.min(S.reads.length,20),20]]]},
 {id:'mq5',t:'機械大師',desc:'技能與裝備的完全體',xp:450,coins:180,title:'機械大師',conds:[
   ['點亮 8 個技能',()=>Object.keys(S.rpg.skills).length>=8,()=>[Math.min(Object.keys(S.rpg.skills).length,8),8]],
   ['5 個裝備欄都已裝備',()=>SLOTS.every(([k])=>S.rpg.gear.equipped[k]),()=>[SLOTS.filter(([k])=>S.rpg.gear.equipped[k]).length,5]]]},
 {id:'mq6',t:'傳奇保母獵人',desc:'達到 Lv 10，並完成其餘主線',xp:600,coins:300,title:'傳奇獵人',conds:[
   ['達到 Lv 10',()=>lv()>=10,()=>[Math.min(lv(),10),10]],
   ['完成其餘 5 條主線',()=>MAIN.filter(m=>m.id!=='mq6'&&S.rpg.claimed['main:'+m.id]).length>=5,()=>[MAIN.filter(m=>m.id!=='mq6'&&S.rpg.claimed['main:'+m.id]).length,5]]]}
];
const SIDE=[
 {id:'s1',t:'整理繪本櫃，把新書匯入書庫',xp:60,coins:20},
 {id:'s2',t:'帶寶寶做一次感官探索遊戲並記錄',xp:60,coins:20},
 {id:'s3',t:'補齊清潔與急救用品',xp:50,coins:15},
 {id:'s4',t:'安排一個完整的半天休息（不處理家務）',xp:80,coins:30},
 {id:'s5',t:'為寰宇迪士尼指定 5 個生活情境歌單',xp:80,coins:30,auto:()=>distinctSlots()>=5},
 {id:'s6',t:'輸入一期電費帳單',xp:60,coins:20,auto:()=>S.bills.length>=1},
 {id:'s7',t:'為每位成員設定生日',xp:60,coins:20,auto:()=>S.members.length>0&&S.members.every(m=>m.birth)}
];
const sideList=()=>[...SIDE,...S.q.custom.filter(c=>c.kind==='side').map(c=>({id:c.id,t:c.t,xp:c.xp,coins:c.coins,custom:1}))];
const periodKey=k=>k==='weekly'?ymd(weekStart(new Date())):TK().slice(0,7);
const periodCnt=k=>S.q.cnt[(k==='weekly'?'w:':'m:')+periodKey(k)]||{};
const periodList=k=>[...(k==='weekly'?WQ:MO),...S.q.custom.filter(c=>c.kind===k).map(c=>({id:c.id,cat:c.cat,t:c.t,xp:c.xp,coins:c.coins,target:1,manual:true,custom:1,prog:()=>periodCnt(k)[c.id]||0}))];
const claimKey=(k,id)=>periodKey(k)+':'+id;

/* ---- 連續天數、徽章 ---- */
function streak(){
  let n=0,i=S.q.clear[TK()]?0:1,last=-99;const sh=hasFx('shield');
  for(;i<400;i++){const ds=ymd(addDays(new Date(),-i));
    if(S.q.clear[ds]){n++;continue}
    if(sh&&n>0&&i-last>=7){last=i;continue}
    break}
  return n;
}
const totalDone=ids=>Object.values(S.q.done).reduce((t,o)=>t+ids.filter(id=>o[id]).length,0);
const BADGES=[
 {id:'b_first',name:'初次通關',title:'見習獵人',desc:'完成第一次每日通關',ok:()=>Object.keys(S.q.clear).length>=1},
 {id:'b_s3',name:'三日連勝',title:'穩定輸出',desc:'連續通關 3 天',ok:()=>streak()>=3},
 {id:'b_s7',name:'七日連勝',title:'節奏大師',desc:'連續通關 7 天',ok:()=>streak()>=7},
 {id:'b_s30',name:'三十日不敗',title:'不滅之火',desc:'連續通關 30 天',ok:()=>streak()>=30},
 {id:'b_clean',name:'整潔大師',title:'基地守衛',desc:'累積完成 50 次環境整潔任務',ok:()=>totalDone(CLEAN_IDS)>=50},
 {id:'b_water',name:'水分補給者',title:'補給達人',desc:'累積 7 天喝足 900 ml',ok:()=>Object.values(S.q.cnt).filter(o=>o&&o.sc_water>=900).length>=7},
 {id:'b_l5',name:'Lv 5 獵人',title:'熟練獵人',desc:'達到等級 5',ok:()=>lv()>=5},
 {id:'b_l10',name:'Lv 10 獵人',title:'傳奇獵人',desc:'達到等級 10',ok:()=>lv()>=10},
 {id:'b_gear',name:'全副武裝',title:'重裝獵人',desc:'5 個裝備欄全部裝備',ok:()=>SLOTS.every(([k])=>S.rpg.gear.equipped[k])},
 {id:'b_skill',name:'技能大師',title:'機械工匠',desc:'點亮 8 個技能',ok:()=>Object.keys(S.rpg.skills).length>=8}
];

/* ---- 結算：只在可編輯時執行；完成就得、取消就扣，不會重複給 ---- */
function settle(){
  if(RO)return false;const d=TK(),R=S.rpg,A=(R.awarded[d]=R.awarded[d]||{});let ch=false;
  const give=(key,cat,xp,coins,text,flat)=>{const r=flat?{xp,coins}:reward(cat,xp,coins);A[key]=r;R.xp+=r.xp;R.coins+=r.coins;logRpg(text,r);ch=true};
  const take=(key,text)=>{const g=A[key];R.xp=Math.max(0,R.xp-g.xp);R.coins=Math.max(0,R.coins-g.coins);delete A[key];logRpg(text,{xp:-g.xp,coins:-g.coins});ch=true};
  const list=dailyList();
  [...list,...eventQuests(d)].forEach(q=>{const st=qState(q,d);
    if(st.done&&!A[q.id])give(q.id,q.cat,q.xp,q.coins,'完成：'+q.t);
    else if(!st.done&&A[q.id])take(q.id,'取消：'+q.t)});
  const cleanAll=CLEAN_IDS.every(id=>qState(DQ.find(q=>q.id===id),d).done);
  if(cleanAll&&!A._clean)give('_clean','clean',30+flatFx('clean'),10,'整潔全清獎勵',1);else if(!cleanAll&&A._clean)take('_clean','取消：整潔全清獎勵');
  const done=list.filter(q=>qState(q,d).done).length,ok=list.length&&done/list.length>=0.7;
  if(ok&&!A._clear){give('_clear','all',50+flatFx('clear'),20,'每日通關！',1);S.q.clear[d]=1}
  else if(!ok&&A._clear){take('_clear','取消：每日通關');delete S.q.clear[d]}
  BADGES.forEach(b=>{if(!R.badges[b.id]&&b.ok()){R.badges[b.id]=d;R.xp+=30;R.coins+=10;logRpg('解鎖徽章：'+b.name,{xp:30,coins:10});ch=true}});
  const keys=Object.keys(R.awarded).sort();while(keys.length>90){delete R.awarded[keys.shift()];ch=true}
  return ch;
}


/* ---- 操作 ---- */
function afterChange(){settle();save();render()}
function qAct(a,id,arg,kind){
  if(RO){toast('這是唯讀檢視，無法修改');return}
  const d=TK();
  if(a==='tick'){const o=(S.q.done[d]=S.q.done[d]||{});if(o[id])delete o[id];else o[id]=1}
  else if(a==='evtick'){const o=(S.q.evdone[d]=S.q.evdone[d]||{});if(o[id])delete o[id];else o[id]=1}
  else if(a==='cnt'){const o=(S.q.cnt[d]=S.q.cnt[d]||{});o[id]=Math.max(0,(o[id]||0)+arg)}
  else if(a==='cntreset'){const o=S.q.cnt[d]||{};delete o[id]}
  else if(a==='pcnt'){const key=(kind==='weekly'?'w:':'m:')+periodKey(kind),o=(S.q.cnt[key]=S.q.cnt[key]||{});o[id]=Math.max(0,(o[id]||0)+arg)}
  else if(a==='side'){if(S.q.side[id])delete S.q.side[id];else S.q.side[id]=TK()}
  else if(a==='hide'){const c=S.q.custom.findIndex(x=>x.id===id);if(c>=0)S.q.custom.splice(c,1);else if(!S.q.hidden.includes(id))S.q.hidden.push(id)}
  else if(a==='restore'){S.q.hidden=[]}
  afterChange();
}
function claimQ(key,xp,coins,cat,text,title){
  if(RO)return;const R=S.rpg;if(R.claimed[key])return;const r=cat?reward(cat,xp,coins):{xp,coins};
  R.claimed[key]={xp:r.xp,coins:r.coins,d:TK()};R.xp+=r.xp;R.coins+=r.coins;logRpg('領取：'+text,r);if(title)R.badges['t_'+key]=TK();
  toast(`獲得 +${r.xp} XP · +${r.coins} 金幣`);afterChange();
}
function buyGear(id){
  if(RO)return;const g=GEAR.find(x=>x.id===id),R=S.rpg;
  if(R.gear.owned[id]||lv()<g.lv||R.coins<g.cost)return;
  R.coins-=g.cost;R.gear.owned[id]=1;if(!R.gear.equipped[g.slot])R.gear.equipped[g.slot]=id;logRpg('領取裝備：'+g.name,{xp:0,coins:-g.cost});toast('已領取：'+g.name);afterChange();
}
function equipGear(id){
  if(RO)return;const g=GEAR.find(x=>x.id===id),R=S.rpg;if(!R.gear.owned[id])return;
  if(R.gear.equipped[g.slot]===id)delete R.gear.equipped[g.slot];else R.gear.equipped[g.slot]=id;afterChange();
}
function learnSkill(id){
  if(RO)return;const s=SKILLS.find(x=>x.id===id),R=S.rpg;
  if(R.skills[id]||(s.req&&!R.skills[s.req])||spAvail()<s.cost)return;
  R.skills[id]=1;logRpg('點亮技能：'+s.name,{xp:0,coins:0});toast('技能已點亮：'+s.name);afterChange();
}
function respec(){
  if(RO)return;const R=S.rpg;if(!Object.keys(R.skills).length||R.coins<50){toast(R.coins<50?'金幣不足（需要 50）':'目前沒有已點亮的技能');return}
  R.coins-=50;R.skills={};logRpg('重置技能點',{xp:0,coins:-50});afterChange();
}
function addCustom(kind){
  if(RO)return;const t=($('#cqT')||{}).value;if(!t||!t.trim()){toast('請輸入任務名稱');return}
  const cat=($('#cqC')||{}).value||'nanny',xp=Math.max(5,Math.min(500,+($('#cqX')||{}).value||15));
  S.q.custom.push({id:'cq'+uid(),kind,cat,t:t.trim(),xp,coins:Math.max(1,Math.round(xp/3))});afterChange();
}
function goDash(target){
  setMode('dash');
  if(target==='lib'){view='lib';render();return}
  view='day';renderView.done=false;render();
  const el={feed:'#fdPanel',weather:'#wxPanel'}[target];if(el)setTimeout(()=>{const e=$(el);if(e)e.scrollIntoView({behavior:'smooth',block:'center'})},60);
}

/* ---- 任務列（儀表板與 RPG 共用） ---- */
const bar=(c,t)=>`<span class="qbar"><i style="width:${Math.min(100,Math.round(c/t*100))}%"></i></span>`;
function taskRow(q,d,opt){
  opt=opt||{};const st=qState(q,d),A=(S.rpg.awarded[d]||{})[q.id],rw=A||reward(q.cat,q.xp,q.coins);
  const meta=`<span class="qrw">+${rw.xp} XP · +${rw.coins}◎</span>`;
  const x=opt.hide&&!q.ev?`<button class="qx" data-qa="hide" data-id="${q.id}" title="${q.custom?'刪除':'隱藏'}">✕</button>`:'';
  if(st.kind==='counter'){
    const c=q.counter;
    return`<div class="qrow ${st.done?'done':''}"><span class="qchk ${st.done?'on':''} auto">${st.done?'✓':''}</span><div class="qmain"><div class="qt">${esc(q.t)}</div>
      <div class="qprog">${bar(st.cur,st.target)}<b>${st.cur}/${st.target} ${c.unit}</b></div>
      <div class="qbtns">${c.steps.map(s=>`<button class="qb" data-qa="cnt" data-id="${q.id}" data-n="${s}">+${s} ${c.unit}</button>`).join('')}<button class="qb ghost" data-qa="cnt" data-id="${q.id}" data-n="-${c.steps[0]}">−</button><button class="qb ghost" data-qa="cntreset" data-id="${q.id}">重設</button></div></div>${meta}${x}</div>`;
  }
  if(st.kind==='auto'){
    return`<div class="qrow ${st.done?'done':''}"><span class="qchk ${st.done?'on':''} auto">${st.done?'✓':''}</span><div class="qmain"><div class="qt">${esc(q.t)}</div>
      <div class="qprog">${bar(st.cur,st.target)}<b>${st.cur}/${st.target}</b><span class="qauto">自動同步</span>${st.done||RO?'':`<button class="qb ghost" data-qa="go" data-go="${q.go}">前往記錄 →</button>`}</div></div>${meta}${x}</div>`;
  }
  const act=q.ev?'evtick':'tick',key=q.ev?q.evid:q.id;
  return`<div class="qrow ${st.done?'done':''}"><button class="qchk ${st.done?'on':''}" data-qa="${act}" data-id="${key}" ${RO?'disabled':''} aria-label="完成">${st.done?'✓':''}</button><div class="qmain"><div class="qt">${esc(q.t)}</div>${q.ev?'<div class="qprog"><span class="qauto">與時間軸同步</span></div>':''}</div>${meta}${x}</div>`;
}
function bindQ(root){
  root.querySelectorAll('[data-qa]').forEach(b=>b.onclick=()=>{
    const a=b.dataset.qa;
    if(a==='go'){goDash(b.dataset.go);return}
    qAct(a,b.dataset.id,+b.dataset.n||0,b.dataset.kind);
  });
}
function dailyStats(){const d=TK(),l=dailyList(),n=l.filter(q=>qState(q,d).done).length;return{done:n,total:l.length,pct:l.length?Math.round(n/l.length*100):0}}

/* ---- 儀表板：今日任務清單（與 RPG 每日任務同一份資料） ---- */
document.querySelector('.hero').insertAdjacentHTML('afterend','<section class="sec" id="qSec"><div class="panel" id="qPanel"></div></section>');
function renderChecklist(){
  const p=$('#qPanel');if(!p)return;const d=TK(),st=dailyStats(),ev=eventQuests(d);
  p.innerHTML=`<div class="wxtop"><div class="eyebrow">Daily Quests · 今日任務清單（與地平線 RPG 模式同步）</div><span class="wxsum">${st.done}/${st.total} · ${st.pct}%${S.q.clear[d]?' · 已通關 ✓':''}</span><button class="ib" id="qGoRpg">⚔ 到 RPG 領獎勵</button></div>
  <div class="qgrid">${QCATS.map(([k,n,ic])=>{const rows=dailyList().filter(q=>q.cat===k);
    const evs=k==='nanny'?ev:[];
    return`<div class="qcard"><div class="qh">${ic} ${n}<span>${rows.filter(q=>qState(q,d).done).length}/${rows.length}</span></div>${rows.map(q=>taskRow(q,d)).join('')}${evs.length?`<div class="qsub">今日照護行程</div>${evs.map(q=>taskRow(q,d)).join('')}`:''}</div>`}).join('')}</div>`;
  bindQ(p);$('#qGoRpg').onclick=()=>setMode('rpg');
}


/* ====================== 地平線 RPG 介面 ====================== */
let MODE=SHOWCASE?'rpg':(()=>{try{return localStorage.getItem(KEY+'.mode')==='rpg'?'rpg':'dash'}catch(e){return'dash'}})();
let rTab='world',qSub='daily';
const rTabSet=k=>{rTab=SHOWMAP?'world':k};
document.body.insertAdjacentHTML('beforeend','<div id="modeSw" role="group" aria-label="模式切換"><button data-m="dash">▦ 數據儀表板</button><button data-m="rpg">⚔ 地平線 RPG</button></div><div id="rpgRoot" hidden></div>');
document.querySelectorAll('#modeSw button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
function setMode(m){if(SHOWCASE)return;MODE=m;try{localStorage.setItem(KEY+'.mode',m)}catch(e){}render();window.scrollTo(0,0)}
function applyRpgMode(){
  const rpg=MODE==='rpg';document.body.classList.toggle('rpg',rpg);
  document.querySelector('.wrap').classList.toggle('pgoff',rpg);$('#rpgRoot').hidden=!rpg;
  document.querySelectorAll('#modeSw button').forEach(b=>b.classList.toggle('on',b.dataset.m===MODE));
}
const nm=n=>Math.round(n).toLocaleString();
const rBar=(c,t,cls)=>`<div class="rbar ${cls||''}"><i style="width:${Math.max(0,Math.min(100,c/t*100))}%"></i><span>${nm(c)} / ${nm(t)}</span></div>`;
function allTitles(){const R=S.rpg,t=['見習獵人'];BADGES.forEach(b=>{if(R.badges[b.id])t.push(b.title)});MAIN.forEach(m=>{if(R.claimed['main:'+m.id])t.push(m.title)});return[...new Set(t)]}
const rewardChip=(xp,coins)=>`<span class="qrw">+${xp} XP · +${coins}◎</span>`;
function addForm(kind,withCat){
  if(RO)return'';
  return`<div class="rform"><input id="cqT" placeholder="自訂任務名稱" autocomplete="off">${withCat?`<select id="cqC">${QCATS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select>`:''}<input id="cqX" type="number" value="20" min="5" max="500" title="XP"><button class="rbtn" id="cqAdd">＋ 新增</button></div>`;
}
function rQuest(el){
  const subs=[['daily','每日 DAILY'],['weekly','每週 WEEKLY'],['monthly','每月 MONTHLY'],['main','主線 MAIN'],['side','支線 SIDE']];
  const sub=`<div class="rsubtabs">${subs.map(([k,n])=>`<button data-s="${k}" class="${qSub===k?'on':''}">${n}</button>`).join('')}</div>`;
  let body='';const d=TK();
  if(qSub==='daily'){
    const ev=eventQuests(d);
    body=`<div class="rnote">每日任務的勾選狀態與「數據儀表板」完全同步（同一份資料）。達成 70% 即「每日通關」，額外獎勵。${S.q.clear[d]?' <b class="ok">今日已通關 ✓</b>':''}</div>
    <div class="qgrid">${QCATS.map(([k,n,ic])=>{const rows=dailyList().filter(q=>q.cat===k);
      return`<section class="rp qcard"><div class="qh">${ic} ${n}<span>${rows.filter(q=>qState(q,d).done).length}/${rows.length}</span></div>${rows.map(q=>taskRow(q,d,{hide:1})).join('')}${k==='nanny'&&ev.length?`<div class="qsub">今日照護行程（與時間軸同步）</div>${ev.map(q=>taskRow(q,d)).join('')}`:''}</section>`}).join('')}</div>
    ${addForm('daily',1)}${S.q.hidden.length&&!RO?`<button class="rbtn ghost" data-qa="restore">還原已隱藏的預設任務（${S.q.hidden.length}）</button>`:''}`;
  }else if(qSub==='weekly'||qSub==='monthly'){
    const list=periodList(qSub);
    body=`<div class="rnote">${qSub==='weekly'?'本週':'本月'}任務由你的紀錄自動計算進度，達標後按「領取」。</div><div class="rlist">${list.map(q=>{
      const c=Math.min(q.prog(),q.target),done=q.prog()>=q.target,key=claimKey(qSub,q.id),got=S.rpg.claimed[key],rw=got||reward(q.cat,q.xp,q.coins);
      return`<div class="rp qline ${done?'done':''}"><div class="qmain"><div class="qt">${qcat(q.cat)[2]} ${esc(q.t)}</div><div class="qprog">${bar(c,q.target)}<b>${c}/${q.target}</b>${q.manual&&!RO?`<button class="qb" data-qa="pcnt" data-id="${q.id}" data-n="1" data-kind="${qSub}">+1</button><button class="qb ghost" data-qa="pcnt" data-id="${q.id}" data-n="-1" data-kind="${qSub}">−</button>`:'<span class="qauto">自動計算</span>'}</div></div>
      ${rewardChip(rw.xp,rw.coins)}${got?'<span class="rclaimed">已領取 ✓</span>':`<button class="rbtn" data-claim="${key}" data-xp="${q.xp}" data-co="${q.coins}" data-cat="${q.cat}" data-text="${esc(q.t)}" ${done&&!RO?'':'disabled'}>領取</button>`}${q.custom&&!RO?`<button class="qx" data-qa="hide" data-id="${q.id}">✕</button>`:''}</div>`}).join('')}</div>${addForm(qSub,1)}`;
  }else if(qSub==='main'){
    body=`<div class="rnote">主線任務是長期目標；完成後可領取大量 XP、金幣、稱號與 1 點額外技能點。</div><div class="rlist">${MAIN.map(m=>{
      const key='main:'+m.id,got=S.rpg.claimed[key],ok=m.conds.every(c=>c[1]());
      return`<section class="rp qmain2 ${ok?'done':''}"><div class="mh"><b>${esc(m.t)}</b><span>${esc(m.desc)}</span></div>
      ${m.conds.map(c=>{const p=c[2]?c[2]():[c[1]()?1:0,1];return`<div class="mc2 ${c[1]()?'ok':''}"><span class="qchk ${c[1]()?'on':''} auto">${c[1]()?'✓':''}</span><div><div>${esc(c[0])}</div>${bar(p[0],p[1])}</div><b>${p[0]}/${p[1]}</b></div>`}).join('')}
      <div class="mfoot">${rewardChip(m.xp,m.coins)}<span class="rtitle">稱號「${esc(m.title)}」＋技能點 +1</span>${got?'<span class="rclaimed">已領取 ✓</span>':`<button class="rbtn" data-claim="${key}" data-xp="${m.xp}" data-co="${m.coins}" data-text="${esc(m.t)}" data-title="1" ${ok&&!RO?'':'disabled'}>領取主線獎勵</button>`}</div></section>`}).join('')}</div>`;
  }else{
    body=`<div class="rnote">支線任務沒有期限；手動項目請自行標記完成，再領取獎勵。</div><div class="rlist">${sideList().map(q=>{
      const key='side:'+q.id,got=S.rpg.claimed[key],done=q.auto?q.auto():!!S.q.side[q.id];
      return`<div class="rp qline ${done?'done':''}"><button class="qchk ${done?'on':''} ${q.auto?'auto':''}" ${q.auto||RO||got?'disabled':`data-qa="side" data-id="${q.id}"`}>${done?'✓':''}</button><div class="qmain"><div class="qt">${esc(q.t)}</div>${q.auto?'<div class="qprog"><span class="qauto">自動偵測</span></div>':''}</div>${rewardChip(q.xp,q.coins)}${got?'<span class="rclaimed">已領取 ✓</span>':`<button class="rbtn" data-claim="${key}" data-xp="${q.xp}" data-co="${q.coins}" data-text="${esc(q.t)}" ${done&&!RO?'':'disabled'}>領取</button>`}${q.custom&&!RO?`<button class="qx" data-qa="hide" data-id="${q.id}">✕</button>`:''}</div>`}).join('')}</div>${addForm('side',0)}`;
  }
  el.innerHTML=sub+body;
  el.querySelectorAll('.rsubtabs button').forEach(b=>b.onclick=()=>{qSub=b.dataset.s;renderRpg()});
  bindQ(el);
  el.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{if(RO)return;claimQ(b.dataset.claim,+b.dataset.xp,+b.dataset.co,b.dataset.cat||'',b.dataset.text,b.dataset.title)});
  const ad=$('#cqAdd');if(ad)ad.onclick=()=>addCustom(qSub);
}
function rGear(el){
  const R=S.rpg;
  el.innerHTML=`<div class="rnote">用任務賺到的金幣「領取裝備」，每個欄位同時只能裝備一件；裝備提供 XP／金幣加成（只影響之後獲得的獎勵）。</div>
  <div class="gslots">${SLOTS.map(([k,n])=>{const e=GEAR.find(g=>g.id===R.gear.equipped[k]);return`<div class="rp gslot ${e?'on':''}"><span>${n}</span><b>${e?esc(e.name):'— 空 —'}</b><i>${e?esc(e.desc):''}</i></div>`}).join('')}</div>
  <div class="glist">${GEAR.map(g=>{const own=R.gear.owned[g.id],eq=R.gear.equipped[g.slot]===g.id,locked=lv()<g.lv;
    return`<div class="rp gitem ${own?'own':''} ${locked?'locked':''}"><div class="gh"><span class="gslotn">${SLOTS.find(s=>s[0]===g.slot)[1]}</span><b>${esc(g.name)}</b></div><div class="gd">${esc(g.desc)}</div>
     <div class="gf">${own?`<button class="rbtn ${eq?'':'ghost'}" data-eq="${g.id}" ${RO?'disabled':''}>${eq?'已裝備（點擊卸下）':'裝備'}</button>`:locked?`<span class="rlock">需要 Lv ${g.lv}</span>`:`<button class="rbtn" data-buy="${g.id}" ${R.coins>=g.cost&&!RO?'':'disabled'}>領取　◎ ${g.cost}</button>`}</div></div>`}).join('')}</div>`;
  el.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyGear(b.dataset.buy));
  el.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>equipGear(b.dataset.eq));
}
function rSkill(el){
  const R=S.rpg;
  el.innerHTML=`<div class="rnote">升級獲得技能點（每升 1 級 +1、完成主線再 +1）。可用點數：<b class="ok">${spAvail()}</b>　已用：${spSpent()}　${RO?'':`<button class="rbtn ghost" id="respec">重置技能（◎ 50）</button>`}</div>
  <div class="tree">${BRANCHES.map(([b,n,ic])=>`<section class="rp branch"><div class="bh">${ic} ${n}</div>${SKILLS.filter(s=>s.br===b).map((s,i)=>{
    const got=R.skills[s.id],can=!got&&(!s.req||R.skills[s.req])&&spAvail()>=s.cost;
    return`${i?'<div class="link '+(R.skills[s.req]?'lit':'')+'"></div>':''}<div class="node ${got?'got':can?'can':''}"><div class="nh"><b>${esc(s.name)}</b><span>Tier ${s.tier} · ${s.cost} 點</span></div><div class="nd">${esc(s.desc)}</div>${got?'<div class="rclaimed">已點亮 ✓</div>':`<button class="rbtn ${can?'':'ghost'}" data-sk="${s.id}" ${can&&!RO?'':'disabled'}>${s.req&&!R.skills[s.req]?'需先點亮上一級':'點亮'}</button>`}</div>`}).join('')}</section>`).join('')}</div>`;
  el.querySelectorAll('[data-sk]').forEach(b=>b.onclick=()=>learnSkill(b.dataset.sk));
  const rs=$('#respec');if(rs)rs.onclick=respec;
}
function rLog(el){
  const R=S.rpg,titles=allTitles(),cur=titles.includes(R.title)?R.title:titles[titles.length-1];
  el.innerHTML=`<div class="rnote">稱號：<select id="rTitle" ${RO?'disabled':''}>${titles.map(t=>`<option ${t===cur?'selected':''}>${esc(t)}</option>`).join('')}</select>　徽章 ${Object.keys(R.badges).filter(k=>!k.startsWith('t_')).length}/${BADGES.length}</div>
  <div class="badges">${BADGES.map(b=>{const got=R.badges[b.id];return`<div class="rp badge ${got?'got':''}"><i>${got?'◆':'◇'}</i><b>${esc(b.name)}</b><span>${esc(b.desc)}</span><em>${got?'稱號「'+esc(b.title)+'」 · '+got:'未解鎖'}</em></div>`}).join('')}</div>
  <div class="rp rlog"><div class="qh">最近紀錄</div>${R.log.slice(0,25).map(l=>{const t=new Date(l.t);return`<div class="lrow"><span>${pad(t.getMonth()+1)}/${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}</span><b>${esc(l.text)}</b><em class="${l.xp<0||l.coins<0?'neg':''}">${l.xp?(l.xp>0?'+':'')+l.xp+' XP ':''}${l.coins?(l.coins>0?'+':'')+l.coins+'◎':''}</em></div>`}).join('')||'<div class="hint" style="padding:8px 0">完成任務後，這裡會出現紀錄。</div>'}</div>`;
  const t=$('#rTitle');if(t)t.onchange=()=>{if(RO)return;S.rpg.title=t.value;save();renderRpg()};
}



/* ====================== 3D 虛擬空間（three.js） ====================== */
let W3P=null;
function w3Load(){
  if(window.THREE)return Promise.resolve();
  if(W3P)return W3P;
  W3P=new Promise((res,rej)=>{const s=document.createElement('script');s.src='three.min.js';s.onload=res;s.onerror=()=>{W3P=null;rej(new Error('three'))};document.head.appendChild(s)});
  return W3P;
}
const W3={open:null,keys:{},joy:{x:0,y:0},orbs:[],cols:[],snd:false};

/* ---- 小工具 ---- */
function w3Tex(w,h,fn,srgb){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);if(srgb!==false)t.encoding=THREE.sRGBEncoding;return t}
function w3Helpers(S,cols){
  const T=THREE,H={S};
  const cache={};
  H.mat=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.82,metalness:.02},o||{}));
  H.add=(m,x,y,z,sh)=>{m.position.set(x||0,y||0,z||0);if(sh!==false){m.castShadow=true;m.receiveShadow=true}S.add(m);return m};
  H.box=(w,h,d,c,x,y,z,o)=>H.add(new T.Mesh(new T.BoxGeometry(w,h,d),H.mat(c,o)),x,y,z);
  H.cyl=(rt,rb,h,c,x,y,z,o,seg)=>H.add(new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg||20),H.mat(c,o)),x,y,z);
  H.cone=(r,h,c,x,y,z,o,seg)=>H.add(new T.Mesh(new T.ConeGeometry(r,h,seg||18),H.mat(c,o)),x,y,z);
  H.sph=(r,c,x,y,z,o,sc)=>{const m=H.add(new T.Mesh(new T.SphereGeometry(r,24,16),H.mat(c,o)),x,y,z);if(sc)m.scale.set(sc[0],sc[1],sc[2]);return m};
  H.ico=(r,c,x,y,z,sc)=>{const m=H.add(new T.Mesh(new T.IcosahedronGeometry(r,1),H.mat(c,{flatShading:true})),x,y,z);if(sc)m.scale.set(sc[0],sc[1],sc[2]);return m};
  H.torus=(r,t,c,x,y,z,o)=>H.add(new T.Mesh(new T.TorusGeometry(r,t,12,36),H.mat(c,o)),x,y,z);
  H.plane=(w,h,c,x,y,z,o)=>{const m=H.add(new T.Mesh(new T.PlaneGeometry(w,h),H.mat(c,o)),x,y,z);return m};
  H.col=(x,z,r)=>cols.push({x,z,r});
  H.mark=()=>({n:S.children.length,c:cols.length});
  H.moveSince=(m,dx,dz)=>{const g=new T.Group();S.children.slice(m.n).forEach(o=>g.add(o));S.add(g);g.position.set(dx,0,dz);for(let i=m.c;i<cols.length;i++){cols[i].x+=dx;cols[i].z+=dz}};
  H.light=(c,i,x,y,z,d)=>{const l=new T.PointLight(c,i,d||12,1.6);l.position.set(x,y,z);S.add(l);return l};
  H.glowTex=()=>cache.glow||(cache.glow=w3Tex(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h)}));
  H.halo=(x,y,z,c,s,o)=>{const sp=new T.Sprite(new T.SpriteMaterial({map:H.glowTex(),color:c,blending:T.AdditiveBlending,transparent:true,depthWrite:false,opacity:o||.8}));sp.scale.set(s,s,1);sp.position.set(x,y,z);S.add(sp);return sp};
  H.shaft=(x,y,z,w,h,rotZ,rotY,c,op)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:cache.sh||(cache.sh=w3Tex(32,128,(g,a,b)=>{const r=g.createLinearGradient(0,0,0,b);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,a,b)})),color:c,transparent:true,opacity:op||.16,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.set(0,rotY||0,rotZ||0);S.add(m);return m};
  H.tree=(x,z,s,c1,c2)=>{s=s||1;H.cyl(.09*s,.14*s,1.2*s,'#6a4a30',x,.6*s,z);H.ico(.95*s,c1||'#3e8247',x,1.7*s,z,[1,.9,1]);H.ico(.62*s,c2||'#5ea05a',x+.35*s,1.45*s,z+.1*s);H.ico(.6*s,c1||'#3e8247',x-.3*s,1.4*s,z-.15*s);H.col(x,z,.45*s)};
  H.pine=(x,z,s,c)=>{s=s||1;H.cyl(.07*s,.1*s,.5*s,'#5a3e28',x,.25*s,z);for(let i=0;i<4;i++)H.cone((1.0-i*.2)*s,1.0*s,c||'#2f6b4a',x,(.9+i*.55)*s,z,{flatShading:true},9);H.col(x,z,.4*s)};
  H.bush=(x,z,s,c)=>{H.ico(.45*(s||1),c||'#4a8f4e',x,.3*(s||1),z,[1.2,.8,1])};
  H.rock=(x,z,s,c)=>{H.ico(.4*(s||1),c||'#6f7a86',x,.2*(s||1),z,[1.3,.8,1]);H.col(x,z,.4*(s||1))};
  H.lamp=(x,z,c,h)=>{h=h||2.2;H.cyl(.04,.05,h,'#2a2a30',x,h/2,z);H.sph(.12,'#fff3c8',x,h+.05,z,{emissive:c||'#ffd98a',emissiveIntensity:2});H.halo(x,h+.05,z,c||'#ffd98a',1.6,.7);H.light(c||'#ffd98a',.7,x,h,z,7);H.col(x,z,.15)};
  H.flowers=(cx,cz,r,n,cols2)=>{const g=new T.SphereGeometry(.05,6,5),m=new T.InstancedMesh(g,new T.MeshStandardMaterial({roughness:.7}),n),d=new T.Object3D(),c=new T.Color();for(let i=0;i<n;i++){const a=Math.random()*6.28,rr=Math.sqrt(Math.random())*r;d.position.set(cx+Math.cos(a)*rr,.06,cz+Math.sin(a)*rr);d.scale.setScalar(.6+Math.random()*.8);d.updateMatrix();m.setMatrixAt(i,d.matrix);m.setColorAt(i,c.set(cols2[i%cols2.length]))}S.add(m);return m};
  H.room=(w,d,hgt,wall,floor,o)=>{o=o||{};
    const fl=H.plane(w,d,floor,0,0,0,{roughness:o.floorR||.55});fl.rotation.x=-Math.PI/2;fl.castShadow=false;
    H.box(w,hgt,.3,wall,0,hgt/2,-d/2-.15);H.box(.3,hgt,d,wall,-w/2-.15,hgt/2,0);H.box(.3,hgt,d,wall,w/2+.15,hgt/2,0);
    H.box(w,.18,.12,o.trim||'#f2ece0',0,.09,-d/2+.06);H.box(.12,.18,d,o.trim||'#f2ece0',-w/2+.06,.09,0);H.box(.12,.18,d,o.trim||'#f2ece0',w/2-.06,.09,0);
    H.front=H.box(w,hgt,.3,wall,0,hgt/2,d/2+.15);H.box(w,.18,.12,o.trim||'#f2ece0',0,.09,d/2-.06);
    [[0,-d/2+.04,0],[0,d/2-.04,0]].forEach(([x,z])=>{H.box(w,.1,.07,'#c49a3c',x,hgt-.32,z);H.box(w,.04,.05,'#4a3426',x,hgt-.42,z)});
    [-w/2+.04,w/2-.04].forEach(x=>{H.box(.07,.1,d,'#c49a3c',x,hgt-.32,0);H.box(.05,.04,d,'#4a3426',x,hgt-.42,0)});
    H.medallion(0,hgt-1.05,-d/2+.03,.85);
    return fl};
  H.win=(x,y,z,w,h,rotY,c)=>{ // 拱形彩繪玻璃窗
    const t=w3Tex(256,Math.max(64,Math.round(256*h/w)),(g,W,Hh)=>{
      const r=W/2,cols=[c||'#f3d98a','#8fb0c4','#c98a85','#8a9a6a','#d9b45a','#b5654a','#a7b8d8'];let k=0;
      g.clearRect(0,0,W,Hh);g.save();g.beginPath();g.moveTo(0,Hh);g.lineTo(0,r);g.arc(r,r,r,Math.PI,0);g.lineTo(W,Hh);g.closePath();g.clip();
      for(let i=0;i<7;i++){g.fillStyle=cols[(k++)%cols.length];g.beginPath();g.moveTo(r,r);g.arc(r,r,r+4,Math.PI+i*Math.PI/7,Math.PI+(i+1)*Math.PI/7);g.closePath();g.fill()}
      const rows=Math.max(2,Math.round((Hh-r)/52));for(let j=0;j<rows;j++)for(let i=0;i<3;i++){g.fillStyle=cols[(k*3+i*2+j)%cols.length];g.fillRect(i*W/3,r+j*(Hh-r)/rows,W/3+1,(Hh-r)/rows+1);k++}
      g.fillStyle='#fff3cf66';g.beginPath();g.arc(r,r,r*.28,0,7);g.fill();
      g.strokeStyle='#3a2a1c';g.lineWidth=7;for(let i=0;i<=7;i++){g.beginPath();g.moveTo(r,r);g.lineTo(r+Math.cos(Math.PI+i*Math.PI/7)*r,r+Math.sin(Math.PI+i*Math.PI/7)*r);g.stroke()}
      g.beginPath();g.arc(r,r,r*.5,Math.PI,0);g.stroke();for(let j=0;j<=rows;j++){g.beginPath();g.moveTo(0,r+j*(Hh-r)/rows);g.lineTo(W,r+j*(Hh-r)/rows);g.stroke()}for(let i=0;i<=3;i++){g.beginPath();g.moveTo(i*W/3,r);g.lineTo(i*W/3,Hh);g.stroke()}
      g.restore();g.strokeStyle='#c49a3c';g.lineWidth=9;g.beginPath();g.moveTo(4,Hh);g.lineTo(4,r);g.arc(r,r,r-4,Math.PI,0);g.lineTo(W-4,Hh);g.stroke()});
    const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,transparent:true,alphaTest:.4,side:T.DoubleSide,fog:false}));m.position.set(x,y,z+.02);m.rotation.y=rotY||0;S.add(m);
    const arc=new T.Mesh(new T.TorusGeometry(w/2+.05,.07,8,32,Math.PI),H.mat('#c49a3c'));arc.position.set(x,y+h/2-w/2,z+.04);arc.rotation.y=rotY||0;S.add(arc);
    [-1,1].forEach(sx=>{const p2=new T.Mesh(new T.BoxGeometry(.12,h-w/2,.1),H.mat('#c49a3c'));p2.position.set(x+sx*(w/2+.05)*Math.cos(rotY||0),y-w/4,z+.04-sx*(w/2+.05)*Math.sin(rotY||0));p2.rotation.y=rotY||0;S.add(p2)});
    return m};
  H.medallion=(x,y,z,r)=>{ // 慕夏式圓形花飾
    const t=w3Tex(256,256,(g)=>{g.clearRect(0,0,256,256);const c=128;
      g.fillStyle='#f3e4b0';g.beginPath();g.arc(c,c,126,0,7);g.fill();g.strokeStyle='#c49a3c';g.lineWidth=7;g.stroke();g.strokeStyle='#4a3426';g.lineWidth=2.5;g.beginPath();g.arc(c,c,118,0,7);g.stroke();
      for(let i=0;i<12;i++){g.save();g.translate(c,c);g.rotate(i*Math.PI/6);g.fillStyle=i%2?'#c98a85':'#8a9a6a';g.strokeStyle='#4a3426';g.lineWidth=2.4;g.beginPath();g.ellipse(0,-72,18,40,0,0,7);g.fill();g.stroke();g.restore()}
      g.fillStyle='#f7edd5';g.beginPath();g.arc(c,c,40,0,7);g.fill();g.strokeStyle='#4a3426';g.lineWidth=2.4;g.stroke();
      for(let i=0;i<8;i++){g.save();g.translate(c,c);g.rotate(i*Math.PI/4);g.fillStyle=i%2?'#d9b45a':'#b5654a';g.beginPath();g.ellipse(0,-22,7,14,0,0,7);g.fill();g.stroke();g.restore()}
      g.fillStyle='#c49a3c';g.beginPath();g.arc(c,c,9,0,7);g.fill();g.stroke()});
    const m=new T.Mesh(new T.CircleGeometry(r,48),new T.MeshBasicMaterial({map:t,transparent:true,fog:false}));m.position.set(x,y,z);S.add(m);return m};
  H.trellis=(x,z,rot)=>{ // 花藤拱門
    const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot||0;S.add(g);const sage=H.mat('#6f8c6a'),gold=H.mat('#c49a3c');
    [-1.5,1.5].forEach(px=>{const c=new T.Mesh(new T.CylinderGeometry(.08,.1,3,10),gold);c.position.set(px,1.5,0);c.castShadow=true;g.add(c)});
    const ar=new T.Mesh(new T.TorusGeometry(1.5,.08,8,32,Math.PI),gold);ar.position.y=3;ar.castShadow=true;g.add(ar);
    const cols2=['#c98a85','#f3e4b0','#b5654a','#d9b45a'];for(let i=0;i<22;i++){const a=i/21*Math.PI,f=new T.Mesh(new T.SphereGeometry(.13+Math.random()*.06,8,6),H.mat(cols2[i%4],{roughness:.9}));f.position.set(Math.cos(a)*1.5,3+Math.sin(a)*1.5,(Math.random()-.5)*.2);g.add(f);const l=new T.Mesh(new T.SphereGeometry(.1,8,6),sage);l.scale.set(1.6,.5,1);l.position.set(Math.cos(a)*1.5+.1,3+Math.sin(a)*1.5-.05,0);g.add(l)}
    return g};
  H.shelf=(x,z,rotY,w,rows)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotY||0;S.add(g);
    const bk=['#c9788a','#e0a94f','#5b8a9f','#7a9c5b','#9b6ab0','#d96a4f','#f1e2c0','#4a6fa5'];
    const part=(geo,c,px,py,pz)=>{const m=new T.Mesh(geo,H.mat(c));m.position.set(px,py,pz);m.castShadow=m.receiveShadow=true;g.add(m)};
    part(new T.BoxGeometry(w,rows*.55+.1,.08),'#8a6a4a',0,(rows*.55+.1)/2,-.2);part(new T.BoxGeometry(.08,rows*.55+.1,.4),'#8a6a4a',-w/2,(rows*.55+.1)/2,0);part(new T.BoxGeometry(.08,rows*.55+.1,.4),'#8a6a4a',w/2,(rows*.55+.1)/2,0);
    for(let r=0;r<=rows;r++){part(new T.BoxGeometry(w,.06,.4),'#9a7a58',0,r*.55+.03,0);if(r<rows){let px=-w/2+.1;while(px<w/2-.15){const bw=.07+Math.random()*.07,bh=.3+Math.random()*.18;part(new T.BoxGeometry(bw,bh,.26),bk[Math.floor(Math.random()*bk.length)],px+bw/2,r*.55+.06+bh/2,-.02);px+=bw+.012}}}
    const c=Math.cos(rotY||0),s=Math.sin(rotY||0);for(let i=-Math.floor(w/1.2);i<=Math.floor(w/1.2);i++)H.col(x+c*i*.6,z-s*i*.6,.45);return g};
  H.frame=(x,y,z,w,h,rotY,fn)=>{const t=w3Tex(256,Math.round(256*h/w),fn);const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:.9}));m.position.set(x,y,z);m.rotation.y=rotY||0;S.add(m);const f=new T.Mesh(new T.BoxGeometry(w+.14,h+.14,.06),H.mat('#2a2622'));f.position.set(x,y,z-.04*Math.cos(rotY||0));f.rotation.y=rotY||0;S.add(f);return m};
  H.noteSprites=(n,c)=>{const t=w3Tex(64,64,(g)=>{g.fillStyle='#fff';g.font='bold 44px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('♪',32,34)});const out=[];for(let i=0;i<n;i++){const s=new T.Sprite(new T.SpriteMaterial({map:t,color:c,transparent:true,depthWrite:false,opacity:.8}));s.scale.set(.5,.5,1);s.userData={a:Math.random()*6.28,r:1.5+Math.random()*3.5,y:1+Math.random()*2,sp:.2+Math.random()*.3};S.add(s);out.push(s)}return out};
  return H;
}

/* ---- 10 個場景 ---- */
const W3S={
nurse(H){ // 哺乳室：溫暖的粉橘夜燈
  H.room(24,16,5.6,'#f2d6cc','#d9b9a0');
  H.win(-6.5,2.7,-7.9,2.2,2.2,0,'#ffd9b8');H.win(0,2.7,-7.9,2.2,2.2,0,'#ffd9b8');H.win(6.5,2.7,-7.9,2.2,2.2,0,'#ffd9b8');H.shaft(-5.3,2.4,-7,1.6,5.5,.35,0,'#ffd7a8',.18);H.shaft(1.2,2.4,-7,1.6,5.5,.35,0,'#ffd7a8',.14);H.shaft(7.7,2.4,-7,1.6,5.5,.35,0,'#ffd7a8',.14);
  // ── 住家隔間：主臥室｜浴廁｜廚房（上排），客廳玄關（下排），門口留缺口 ──
  {const T=THREE,fl=(w,d,x,z,c1,c2,rep)=>{const t=w3Tex(128,128,(g,W,Hh)=>{g.fillStyle=c1;g.fillRect(0,0,W,Hh);g.fillStyle=c2;g.fillRect(0,0,W/2,Hh/2);g.fillRect(W/2,Hh/2,W/2,Hh/2);g.strokeStyle='#0002';g.lineWidth=2;g.strokeRect(0,0,W,Hh)});t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(w/rep,d/rep);const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:t,roughness:.6}));m.rotation.x=-Math.PI/2;m.position.set(x,.011,z);m.receiveShadow=true;H.S.add(m)};
   H.plane(9,7,'#e8cfa9',-7.5,.011,-4.5,{roughness:.8}).rotation.x=-Math.PI/2;fl(5,7,-.5,-4.5,'#f4f1ea','#bcd7e3',1.4);fl(10,7,7,-4.5,'#e4b48e','#d29a72',1.4);
   H.plane(7.4,4.4,'#c9788a',1.2,.014,4.2,{roughness:1}).rotation.x=-Math.PI/2;H.plane(4,2.4,'#cfe3f6',-7.5,.014,-4.3,{roughness:1}).rotation.x=-Math.PI/2;
   H.box(4.6,.07,3.0,'#b3a68f',-9.7,.035,6.5);H.plane(2.8,1.6,'#8d8478',-9.7,.075,6.5,{roughness:1}).rotation.x=-Math.PI/2;
   const WL=(x1,z1,x2,z2,h,col)=>{const len=Math.hypot(x2-x1,z2-z1),hz=Math.abs(z2-z1)<.01,cx=(x1+x2)/2,cz=(z1+z2)/2;H.box(hz?len:.26,h,hz?.26:len,col,cx,h/2,cz);H.box(hz?len+.02:.3,.06,hz?.3:len+.02,'#e0bd86',cx,h+.03,cz);H.box(hz?len+.02:.3,.28,hz?.3:len+.02,'#d9b9a0',cx,.14,cz);const n=Math.max(1,Math.ceil(len/.8));for(let i=0;i<n;i++)H.col(x1+(x2-x1)*(i+.5)/n,z1+(z2-z1)*(i+.5)/n,.42)};
   [[-12,-8.8],[-6.2,-1.8],[.8,5.7],[8.3,12]].forEach(([a,b])=>WL(a,-1,b,-1,1.35,'#f6e4d6'));WL(-3,-8,-3,-1,1.5,'#f1d9cc');WL(2,-8,2,-1,1.5,'#e9ddc9');
   [[-8.8,-6.2],[-1.8,.8],[5.7,8.3]].forEach(([a,b])=>{[a,b].forEach(x=>H.box(.14,1.5,.3,'#e0bd86',x,.75,-1))});
   const sign=(txt,en,x,z)=>{const t=w3Tex(512,160,(g,W,Hh)=>{g.clearRect(0,0,W,Hh);g.fillStyle='rgba(248,239,216,.9)';g.beginPath();g.roundRect?g.roundRect(8,8,W-16,Hh-16,50):g.rect(8,8,W-16,Hh-16);g.fill();g.strokeStyle='#c49a3c';g.lineWidth=7;g.stroke();g.fillStyle='#8a4a22';g.textAlign='center';g.textBaseline='middle';g.font='700 62px "Noto Serif TC",serif';g.fillText(txt,W/2,Hh*.4);g.font='italic 600 28px "Cormorant Garamond",serif';g.fillStyle='#a64a60';g.fillText(en,W/2,Hh*.76)});const m=new T.Mesh(new T.PlaneGeometry(3.1,.97),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.03,z);H.S.add(m)};
   sign('主臥室','Master Bedroom',-7.5,-1.9);sign('浴廁','Bathroom',-.5,-1.9);sign('廚房','Kitchen',7,-1.9);sign('客廳 · 玄關','Living & Entrance',-1.5,7.2);
   H.light('#ffcf9a',.9,-7.5,2.6,-4.5,11);H.light('#d8ecff',.8,-.5,2.6,-4.5,8);H.light('#ffd9a0',.9,7,2.6,-4.5,12);
   // 主臥室：大床、床頭櫃
   H.box(2.3,.4,3.3,'#a98562',-10.8,.2,-3.3);H.box(2.1,.26,3.1,'#fffaf0',-10.8,.5,-3.3);H.box(.2,1.2,3.3,'#a98562',-11.85,.7,-3.3);H.box(1.3,.12,3.0,'#e58f9f',-10.4,.69,-3.3);[-4.1,-2.5].forEach(z=>H.box(.6,.14,.9,'#fff',-11.3,.7,z));
   H.box(.7,.6,.7,'#d9b9a0',-11.55,.3,-5.9);H.cyl(.03,.03,.4,'#c49a3c',-11.55,.8,-5.9);H.sph(.17,'#fff0d0',-11.55,1.1,-5.9,{emissive:'#ffcf9a',emissiveIntensity:1.5});H.halo(-11.55,1.1,-5.9,'#ffcf9a',1.8,.5);H.col(-10.8,-4.3,1.15);H.col(-10.8,-2.5,1.15);H.col(-11.55,-5.9,.5);
   // 浴廁：浴缸、馬桶
   H.box(1.3,.6,3.2,'#f6f1e6',1.2,.3,-4.3);H.box(1.0,.1,2.9,'#bfe3ee',1.2,.62,-4.3,{roughness:.1});H.cyl(.04,.04,.35,'#cfd6dc',1.2,.8,-5.9);H.col(1.2,-5.4,.85);H.col(1.2,-3.5,.85);
   H.box(.6,.45,.8,'#f6f1e6',-2.35,.22,-2.3);H.box(.6,.9,.25,'#f6f1e6',-2.35,.45,-2.75);H.col(-2.35,-2.4,.5);
   // 廚房：冰箱、小餐桌
   H.box(1.3,2.3,1.0,'#e8eef0',3.1,1.15,-7.3);H.box(.06,.7,.08,'#9aa6ab',2.55,1.5,-6.75);H.box(1.3,.04,1.02,'#c9d3d6',3.1,1.6,-7.3);H.col(3.1,-7.3,.75);
   H.cyl(.8,.8,.06,'#f3e4cf',6.6,.78,-3.3,null,24);H.cyl(.08,.1,.75,'#a98562',6.6,.4,-3.3);[[-1,0],[1,0]].forEach(([k])=>{H.cyl(.28,.25,.45,'#d98466',6.6+k*1.15,.22,-3.3,null,16);H.col(6.6+k*1.15,-3.3,.35)});H.col(6.6,-3.3,.85);
   // 客廳：沙發、茶几
   H.box(3.2,.7,1.1,'#c9a7a0',7.2,.35,6.8);H.box(3.2,.9,.3,'#bf9a93',7.2,.85,7.35);[-1.7,1.7].forEach(x=>H.box(.25,.55,1.1,'#bf9a93',7.2+x,.55,6.8));H.col(6.2,6.8,.7);H.col(8.2,6.8,.7);
   H.box(1.6,.4,.9,'#d9b9a0',7.2,.2,4.8);H.col(7.2,4.8,.75);H.cyl(.1,.1,.2,'#fff',7.5,.5,4.8);
   // 玄關：鞋、衣帽架
   H.box(.45,.12,.2,'#7a5a4a',-9.0,.12,7.2);H.box(.45,.12,.2,'#7a5a4a',-9.6,.12,7.4);H.cyl(.04,.04,1.9,'#8a5a3a',-11.4,.95,7.4);H.sph(.1,'#c49a3c',-11.4,1.9,7.4);}
  // 哺乳椅：寬扶手搖椅、腳凳、小邊桌與暖燈（抱著寶寶走過來坐下餵奶）
  const CH={x:-4.5,z:3.6};
  H.box(1.7,.12,1.5,'#c9a07e',CH.x,.06,CH.z);H.box(.1,.1,1.9,'#8a5a3a',CH.x-.75,.05,CH.z);H.box(.1,.1,1.9,'#8a5a3a',CH.x+.75,.05,CH.z);
  H.box(1.5,.22,1.3,'#e7c3b8',CH.x,.27,CH.z);H.box(1.3,.12,1.1,'#f8eadf',CH.x,.44,CH.z);H.box(1.5,1.35,.26,'#e7c3b8',CH.x,.9,CH.z-.62);H.box(1.1,.9,.1,'#f8eadf',CH.x,1.0,CH.z-.48);H.sph(.5,'#e7c3b8',CH.x,1.62,CH.z-.62,null,[1.35,.55,.3]);
  H.box(.22,.28,1.3,'#d9aea1',CH.x-.82,.62,CH.z+.02);H.box(.22,.28,1.3,'#d9aea1',CH.x+.82,.62,CH.z+.02);H.box(.2,.4,.9,'#d9aea1',CH.x-.82,.36,CH.z+.1);H.box(.2,.4,.9,'#d9aea1',CH.x+.82,.36,CH.z+.1);
  H.box(.9,.22,.65,'#f3c9d4',CH.x,.14,CH.z+1.55);
  H.box(1.2,.7,.9,'#d9b9a0',CH.x+1.7,.35,CH.z-.3);H.box(1.3,.05,1.0,'#f3e4cf',CH.x+1.7,.72,CH.z-.3);H.cyl(.03,.03,.5,'#c49a3c',CH.x+1.35,1.0,CH.z-.62);H.sph(.2,'#fff0d0',CH.x+1.35,1.4,CH.z-.62,{emissive:'#ffcf9a',emissiveIntensity:1.5});H.halo(CH.x+1.35,1.4,CH.z-.62,'#ffcf9a',2,.6);H.light('#ffb98a',.9,CH.x+1.5,1.5,CH.z,8);
  const tb=new THREE.Group();tb.position.set(CH.x+1.95,.75,CH.z-.2);H.S.add(tb);{const bm=(geo,c,o)=>{const m=new THREE.Mesh(geo,H.mat(c,o));m.castShadow=true;tb.add(m);return m};bm(new THREE.CylinderGeometry(.06,.06,.2,16),'#f7f2e6',{transparent:true,opacity:.9}).position.y=.1;bm(new THREE.CylinderGeometry(.052,.052,.13,16),'#fff6de').position.y=.075;bm(new THREE.CylinderGeometry(.065,.065,.025,16),'#e58f9f').position.y=.21;const np=bm(new THREE.SphereGeometry(.035,12,8),'#f3c9a0');np.position.y=.25;np.scale.y=1.3}tb.visible=false;
  H.cyl(.15,.15,.26,'#f3efe6',CH.x+1.45,.83,CH.z-.2);H.cyl(.16,.16,.04,'#6f8c6a',CH.x+1.45,.98,CH.z-.2);H.sph(.03,'#ff9f5a',CH.x+1.45,.88,CH.z-.04,{emissive:'#ff9f5a',emissiveIntensity:2});
  H.col(CH.x,CH.z-.2,1.0);H.col(CH.x+1.45,CH.z-.3,.45);H.col(CH.x+1.95,CH.z-.3,.45);
  // 兩張嬰兒床：男寶寶（藍）、女寶寶（粉）——哭了就走過去，用拉桿調月齡與體重，系統算出當餐奶量
  const BABIES=[{key:'boy',n:'男寶寶',x:-9.4,z:-7.1,mat:'#cfe3f6',bl:'#8fb7dc',hair:'#2a2430'},{key:'girl',n:'女寶寶',x:-5.2,z:-7.1,mat:'#fbd9d9',bl:'#f1a8bc',hair:'#3a2a24'}];
  BABIES.forEach(bb=>{const cx=bb.x,cz=bb.z;
    H.box(2,.12,1.2,'#f6efe6',cx,.7,cz);for(let i=0;i<9;i++){H.cyl(.025,.025,.7,'#f6efe6',cx-.9+i*.225,1.1,cz-.58);H.cyl(.025,.025,.7,'#f6efe6',cx-.9+i*.225,1.1,cz+.58)}
    H.box(2,.06,.06,'#f6efe6',cx,1.5,cz-.58);H.box(2,.06,.06,'#f6efe6',cx,1.5,cz+.58);H.box(.06,.8,1.2,'#f6efe6',cx-1,1.1,cz);H.box(.06,.8,1.2,'#f6efe6',cx+1,1.1,cz);H.box(1.8,.14,1.0,bb.mat,cx,.82,cz);H.col(cx,cz,1.25);
    const mob=new THREE.Group();mob.position.set(cx,2.7,cz);H.S.add(mob);for(let i=0;i<5;i++){const a=i/5*6.28,m=new THREE.Mesh(new THREE.SphereGeometry(.11,12,10),H.mat(['#ffd86a','#ff9fb3','#9fd8ff','#c9a7ff','#a8e6a1'][i],{emissive:'#ffffff',emissiveIntensity:.15}));m.position.set(Math.cos(a)*.55,-.3,Math.sin(a)*.55);mob.add(m)}H.cyl(.02,.02,1,'#ccc',cx,3.2,cz);H.cyl(.26,.26,.05,bb.bl,cx,3.05,cz);
    // 寶寶
    const g=new THREE.Group();g.position.set(cx,.95,cz);H.S.add(g);const M=(geo,c,o)=>{const m=new THREE.Mesh(geo,H.mat(c,o));m.castShadow=true;g.add(m);return m};
    const body=M(new THREE.SphereGeometry(.3,18,12),bb.bl);body.scale.set(1.5,.6,.85);body.position.set(.25,.02,0);
    const head=M(new THREE.SphereGeometry(.2,18,14),'#f6cfa4');head.position.set(-.5,.1,0);
    const hair=M(new THREE.SphereGeometry(.2,14,10,0,6.28,0,1.2),bb.hair);hair.position.set(-.5,.1,0);hair.scale.set(1.02,1,1.02);hair.rotation.z=Math.PI/2;
    const mouth=M(new THREE.SphereGeometry(.05,10,8),'#6a2a2a');mouth.position.set(-.43,.285,0);mouth.scale.set(1.3,.6,1);mouth.visible=false;
    const eyeL=M(new THREE.SphereGeometry(.018,8,6),'#2a2430');eyeL.position.set(-.54,.28,-.07);const eyeR=eyeL.clone();eyeR.position.z=.07;g.add(eyeR);
    const tL=M(new THREE.SphereGeometry(.03,8,6),'#9fd8ff',{emissive:'#9fd8ff',emissiveIntensity:.8});tL.position.set(-.52,.24,-.13);tL.visible=false;const tR=tL.clone();tR.position.z=.13;g.add(tR);
    const bw=M(new THREE.SphereGeometry(.26,14,10),bb.mat);bw.scale.set(1.3,.35,.95);bw.position.set(.35,.12,0);
    bb.g=g;bb.mouth=mouth;bb.tears=[tL,tR];});
  const mkC=H.mark();
  // 流理台：消毒鍋、水槽、矽膠奶瓶刷、方形盤子（靠近按 E 開始清洗奶瓶）
  const CX=6.9;H.box(1.2,.9,5,'#e9d3bf',CX,.45,-3.2);H.box(1.3,.08,5.1,'#f6efe4',CX,.94,-3.2);H.col(CX,-4.4,.9);H.col(CX,-2.6,.9);H.col(CX,-1.2,.7);
  H.cyl(.4,.4,.5,'#f3efe6',CX,1.23,-5.1);H.cyl(.42,.42,.14,'#b5654a',CX,1.55,-5.1);H.sph(.07,'#c49a3c',CX,1.66,-5.1);H.box(.18,.08,.1,'#c49a3c',CX-.45,1.3,-5.1);H.sph(.05,'#7be08a',CX-.2,1.12,-4.72,null,[1,1,1]);H.halo(CX,1.75,-5.1,'#fff3d0',1.4,.35);
  H.box(.95,.14,1.3,'#d5dce0',CX,1.05,-3.9);H.box(.78,.06,1.1,'#8ec4d8',CX,1.1,-3.9,{roughness:.1,metalness:.3});
  H.cyl(.04,.04,.55,'#cfd6dc',CX+.45,1.3,-3.9);H.cyl(.035,.035,.45,'#cfd6dc',CX+.25,1.55,-3.9).rotation.z=Math.PI/2;H.sph(.06,'#cfd6dc',CX+.03,1.5,-3.9);H.cyl(.03,.03,.1,'#7fb8c8',CX+.45,1.62,-3.7);
  H.box(.7,.04,.7,'#fbf8ee',CX,.99,-2.5);[[-.34,0,.04,.7],[.34,0,.04,.7],[0,-.34,.7,.04],[0,.34,.7,.04]].forEach(([x,z,w,d])=>H.box(w,.06,d,'#e8e0cc',CX+x,1.03,-2.5+z));
  H.cyl(.03,.03,.5,'#6fa8a0',CX+.1,1.0,-1.6).rotation.z=Math.PI/2;H.cyl(.09,.07,.2,'#8cc7bf',CX-.2,1.02,-1.6,null,10).rotation.z=Math.PI/2;
  H.box(.18,.04,.18,'#8cc7bf',CX+.02,.98,-1.9);
  H.moveSince(mkC,3.6,-2.1);
  // 洗手台：洗手慕斯、擦手紙、垃圾桶（走近按 E 洗手；泡奶前必須先洗手）
  {const WX=-1.4,WZ=-7.1;H.box(1.7,.95,.9,'#e9d3bf',WX,.475,WZ);H.box(1.8,.07,1.0,'#f6efe4',WX,.98,WZ);H.col(WX,WZ,1.0);
   H.cyl(.36,.3,.12,'#f6f1e6',WX,1.05,WZ+.05,null,20);H.cyl(.3,.26,.04,'#8ec4d8',WX,1.1,WZ+.05,{roughness:.1,metalness:.3},20);
   H.cyl(.04,.04,.5,'#cfd6dc',WX,1.28,WZ-.28);H.cyl(.035,.035,.3,'#cfd6dc',WX,1.52,WZ-.15).rotation.x=Math.PI/2;H.sph(.05,'#e58f9f',WX+.1,1.42,WZ-.28);
   H.cyl(.13,.13,.34,'#f6cdd8',WX-.62,1.17,WZ+.1,null,16);H.cyl(.03,.03,.14,'#fff8ec',WX-.62,1.4,WZ+.1);H.box(.2,.05,.07,'#fff8ec',WX-.7,1.48,WZ+.1);
   H.box(.62,.9,.34,'#f4e8cf',WX+.95,2.05,WZ-.38);H.cyl(.2,.2,.1,'#fffaf0',WX+.95,1.55,WZ-.3,null,20);H.box(.3,.34,.02,'#fffdf6',WX+.95,1.32,WZ-.25);
   H.cyl(.26,.22,.55,'#8bb5a0',WX+1.2,.28,WZ+.35,null,18);H.cyl(.27,.27,.04,'#c49a3c',WX+1.2,.56,WZ+.35,null,18);H.col(WX+1.2,WZ+.35,.4);
   H.halo(WX,1.5,WZ,'#fff3d0',2.2,.3);}
  // 奶粉架：明治、S-26 金愛兒樂、以及未解鎖的其他品牌（走近按 E 沖泡配方奶）
  {const SX=-11.0,SZ=4.4;H.box(.9,.9,2.6,'#e9d3bf',SX,.45,SZ);H.box(1.0,.07,2.7,'#f6efe4',SX,.93,SZ);H.col(SX,SZ-.8,.8);H.col(SX,SZ+.8,.8);
   const can=(z,body,band,txt,fg,locked)=>{H.cyl(.19,.19,.46,body,SX,1.19,z,null,24);H.cyl(.2,.2,.07,band,SX,1.4,z,null,24);H.cyl(.2,.2,.05,band,SX,.98,z,null,24);H.cyl(.17,.17,.04,locked?'#8a847a':'#e9dfc8',SX,1.44,z,null,24);
     const t=w3Tex(256,160,(g,w,h)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,w,h);g.fillStyle=fg;g.font='700 54px "Noto Serif TC",serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt[0],w/2,h*.38);g.font='700 30px "Noto Serif TC",serif';g.fillText(txt[1],w/2,h*.74)});
     const m=H.add(new THREE.Mesh(new THREE.PlaneGeometry(.34,.21),new THREE.MeshBasicMaterial({map:t,transparent:true})),SX+.205,1.19,z,false);m.rotation.y=Math.PI/2;
     if(locked){H.box(.12,.12,.1,'#d9a24a',SX+.2,1.34,z);H.add(new THREE.Mesh(new THREE.TorusGeometry(.04,.015,6,12,Math.PI),H.mat('#c49a3c')),SX+.2,1.41,z,false).rotation.y=Math.PI/2}};
   can(SZ-.8,'#f6f1e4','#c0392b',['明治','Meiji'],'#c0392b');can(SZ,'#e3b743','#4a3426',['S-26','金愛兒樂'],'#4a3426');can(SZ+.8,'#bdb8ac','#7f7a70',['其他','品牌'],'#6a655b',true);
   H.halo(SX,1.4,SZ,'#ffe2a8',2.6,.28);}
  // 熱水瓶（沖泡奶粉用）：靠近按 E 或點它，用拉桿調水溫
  const mkT=H.mark();
  const TX=-5.9,TZ=-4.5;H.box(1.9,.9,.9,'#d9b9a0',TX,.45,TZ);H.box(1.9,.06,.96,'#f3e4cf',TX,.93,TZ);H.col(TX,TZ,1.0);
  H.cyl(.3,.3,.8,'#f1e4c6',TX,1.36,TZ);H.cyl(.315,.315,.07,'#c49a3c',TX,1.0,TZ);H.cyl(.315,.315,.07,'#c49a3c',TX,1.72,TZ);
  H.cyl(.22,.3,.16,'#6f8c6a',TX,1.84,TZ);H.sph(.07,'#c49a3c',TX,1.96,TZ);H.box(.28,.06,.1,'#6f8c6a',TX+.3,1.78,TZ+.06);
  H.box(.06,.46,.1,'#6f8c6a',TX-.36,1.4,TZ);H.box(.14,.06,.1,'#6f8c6a',TX-.31,1.62,TZ);H.box(.14,.06,.1,'#6f8c6a',TX-.31,1.18,TZ);
  H.cyl(.018,.018,.5,'#c49a3c',TX+.34,1.45,TZ+.2);const thLed=H.sph(.05,'#7be08a',TX+.34,1.72,TZ+.2,{emissive:'#7be08a',emissiveIntensity:2});
  H.halo(TX,1.4,TZ,'#ffe2a8',2.4,.35);H.light('#ffd9a0',.7,TX+.5,2.2,TZ+1,6);
  H.moveSince(mkT,10.9,-2.7);
  H.cyl(.3,.25,.6,'#b87a5a',10.4,.3,6.2);H.ico(.65,'#5f9a68',10.4,1.05,6.2,[1,1.3,1]);H.col(10.4,6.2,.45);
  return{babies:BABIES,chair:CH,tblBottle:tb,warmer:[CH.x+1.45,1.0,CH.z-.2],props:[{id:'thermos',x:5.0,z:-5.6,label:'熱水瓶（廚房）：用拉桿調水溫',led:thLed,onUse:()=>{w3FlowAdv('hot');w3Thermos()}},{id:'wash',x:9.3,z:-5.4,label:'水槽（廚房）：清洗奶瓶',ly:2.3,hitW:[1.6,1.8,3.4],onUse:()=>w3Wash()},{id:'handwash',x:-1.4,z:-5.5,label:'洗手台（浴廁）：泡奶前先洗手',prompt:'洗手（慕斯、擦手紙）',ly:2.4,hitW:[2.4,1.8,2.2],onUse:()=>w3Hands()},{id:'formula',x:-9.6,z:4.4,label:'奶粉罐（玄關）：沖泡配方奶',prompt:'沖泡配方奶（選奶粉品牌）',ly:2.2,hitW:[1.8,1.8,3.2],onUse:()=>{const F=W3.flow;if(F&&F.s===0){toast('先到嬰兒床確認要餵哪位寶寶、餵多少 ml');return}if(!w3Washed()){toast('泡奶前要先洗手（浴廁）');w3Hands({then:()=>{const G=W3.flow;if(G&&G.s===2){toast('先到廚房用熱水瓶把水溫調到 70°C 以上');return}w3Mix()}});return}if(F&&F.s===2){toast('先到廚房用熱水瓶把水溫調到 70°C 以上');return}w3Mix()}},{id:'chair',x:CH.x,z:CH.z+1.5,label:'哺乳椅',prompt:'哺乳椅（先抱起寶寶再坐下）',ly:2.2,hitW:[2,1.8,2],onUse:()=>w3DiaToast('先到嬰兒床抱起寶寶，再一起走來哺乳椅坐下餵奶')},{id:'table',x:CH.x+2.7,z:CH.z-.1,label:'小桌子：放奶瓶',prompt:'把泡好的奶瓶放到小桌子',ly:1.9,hitW:[1.8,1.6,2.0],onUse:()=>w3FlowTable()},...BABIES.map(bb=>({id:'crib_'+bb.key,x:bb.x,z:bb.z+1.7,label:bb.n,prompt:'餵奶：'+bb.n,ly:2.4,hitW:[2.6,1.8,2.4],onUse:()=>w3Feed(bb.key)}))],sky:['#1a1020','#e9a58a'],fog:['#c98a78',.028],hemi:['#ffd7c2','#6b4650',.85],sun:['#ffc99a',.9,[-4,8,6]],bounds:{w:23,d:15},spawn:[-6.6,6.6],route:[[-7.5,-2.9],[-7.5,1.4]],orb:[[9.8,2.2],[10.4,4.0],[9.2,3.2]],dust:'#ffd7b0',audio:[261.6,329.6,392,523.3],cam:{dist:13.5,pitch:.82,shiftZ:-5}};},
read(H){ // 閱讀室：書牆與暖燈
  H.room(18,14,5.4,'#e6d8bc','#9b7a56');H.plane(6,4.4,'#a84b4b',0,.012,.8,{roughness:1}).rotation.x=-Math.PI/2;
  for(let i=-2;i<=2;i++)H.shelf(i*3.3,-6.6,0,3,5);H.shelf(-8.5,-1,Math.PI/2,5,4);H.shelf(8.5,-1,-Math.PI/2,5,4);
  H.box(2.6,.12,1.4,'#7a5636',0,.85,.8);[-1.1,1.1].forEach(x=>[-.5,.5].forEach(z=>H.box(.1,.8,.1,'#5a3d22',x,.4,.8+z)));H.col(0,.8,1.4);
  H.box(.7,.5,.5,'#c2c0b0',-1.4,.7,2.2);H.box(.7,.5,.5,'#4a6fa5',1.6,.7,2.4);H.col(-1.4,2.2,.5);H.col(1.6,2.4,.5);
  for(const [x,z] of [[-3.5,3.5],[4,4]]){H.sph(.5,'#d96a4f',x,.38,z,null,[1,.7,1]);H.col(x,z,.55)}
  H.lamp(-6,2.5,'#ffcf8a',2.6);H.lamp(6,3,'#ffcf8a',2.6);H.light('#ffcf8a',1.2,0,3.6,0,16);
  H.halo(0,4.4,-6.7,'#ffe0a8',6,.35);
  // 懸浮書頁
  const pages=[];for(let i=0;i<14;i++){const p=H.add(new THREE.Mesh(new THREE.PlaneGeometry(.35,.45),new THREE.MeshBasicMaterial({color:'#fff4d6',side:THREE.DoubleSide,transparent:true,opacity:.85})),0,0,0,false);p.userData={a:Math.random()*6.28,r:2+Math.random()*5,y:1+Math.random()*3,sp:.1+Math.random()*.2};pages.push(p)}
  return{sky:['#1b130b','#e0b074'],fog:['#a9824f',.022],hemi:['#ffe3b5','#5a4128',.8],sun:['#ffd8a0',.8,[3,8,5]],bounds:{w:17,d:13},spawn:[0,5],orb:[[-3.5,1.2],[3,1.8],[0,-1.2]],dust:'#ffe0a8',float:pages,audio:[196,246.9,293.7,392],cam:{dist:10,pitch:.6}};},
rhythm(H){ // 韻律教室：鼓、搖鈴、色彩地圈
  H.room(18,14,5.6,'#f3e1b8','#d8b87a');
  const cs=['#ff8a5c','#ffd24a','#6fcf97','#56b6ff','#c28bff'];cs.forEach((c,i)=>{const a=i/5*6.28,m=H.add(new THREE.Mesh(new THREE.CircleGeometry(1.2,32),H.mat(c,{roughness:.9})),Math.cos(a)*3.4,.012,Math.sin(a)*3.4+.5,false);m.rotation.x=-Math.PI/2});
  const drums=[[-6,-4,.8,'#e0524a'],[-4.6,-5,.65,'#f0a63a'],[6,-4.4,.9,'#3a86c8'],[4.5,-5.2,.6,'#58b36b']];drums.forEach(([x,z,r,c])=>{H.cyl(r,r*.92,.7,c,x,.5,z,{roughness:.5});H.cyl(r*1.02,r*1.02,.06,'#f6efe0',x,.88,z);H.torus(r,.04,'#d9c9a0',x,.87,z).rotation.x=Math.PI/2;H.col(x,z,r+.1);H.halo(x,1,z,c,2.2,.35)});
  // 木琴
  for(let i=0;i<8;i++)H.box(.35,.1,1.4-i*.12,cs[i%5],-1.4+i*.4,.5,-5.6,{roughness:.4});H.box(3.4,.08,.08,'#7a5636',.4,.4,-6.2);H.col(.4,-5.6,1.8);
  // 吊掛搖鈴與彩帶
  for(let i=0;i<9;i++){const x=-6+i*1.5;H.cyl(.012,.012,1.6,'#ddd',x,4.8,-6.4);H.sph(.2,cs[i%5],x,3.8,-6.4,{metalness:.4,roughness:.3});H.halo(x,3.8,-6.4,cs[i%5],1,.4)}
  for(let i=0;i<7;i++){const r=H.cyl(.03,.03,2.4,cs[i%5],-7.8+i*.7,3.4,-6.7);r.rotation.z=.15*Math.sin(i)}
  H.win(-5,3,-6.9,2.4,2.4,0,'#fff0c0');H.shaft(-4,2.8,-6,1.8,6,.3,0,'#ffe9b0',.2);
  H.light('#ffd890',1.2,0,4,0,18);
  return{sky:['#241b0b','#f1c36a'],fog:['#d7a94e',.02],hemi:['#fff0c8','#7a5e2c',.9],sun:['#ffe0a0',.9,[2,8,6]],bounds:{w:17,d:13},spawn:[0,5],orb:[[-3.4,.5],[3.4,.2],[0,-2.2]],dust:'#ffe08a',notes:'#ffd86a',audio:[261.6,329.6,392,440],cam:{dist:10,pitch:.62}};},
music(H){ // 音樂教室：鋼琴與藍夜
  H.room(18,14,5.8,'#27315c','#3b2a22',{trim:'#d8cfe6',floorR:.25});
  // 平台鋼琴
  H.box(2.8,.18,2.2,'#101015',0,1,-3,{roughness:.2,metalness:.2});H.box(2.8,.7,.2,'#101015',0,1.4,-4.1);[-1.2,1.2].forEach(x=>H.cyl(.06,.06,.95,'#0a0a0d',x,.5,-2.2));H.cyl(.06,.06,.95,'#0a0a0d',0,.5,-3.9);
  const lid=H.box(2.8,.06,1.6,'#0b0b0f',0,1.9,-3.6,{roughness:.2});lid.rotation.x=-.5;for(let i=0;i<14;i++)H.box(.17,.06,.55,'#f8f4ea',-1.2+i*.185,1.12,-2.4);for(let i=0;i<10;i++)if(![2,6].includes(i%7))H.box(.1,.08,.34,'#08080a',-1.1+i*.185+.09,1.16,-2.55);
  H.col(0,-3,1.8);H.box(1.2,.5,.6,'#3a2a30',0,.45,-1.5);H.col(0,-1.5,.6);
  // 譜架與小提琴、吉他
  for(const [x,z] of [[-5,-1],[5,-1.5]]){H.cyl(.03,.03,1.6,'#444',x,.8,z);H.box(.7,.5,.05,'#e8e4d8',x,1.7,z)}
  H.sph(.35,'#a85a2a',-6.2,1.0,-3,{roughness:.35},[.8,1.3,.4]);H.box(.07,1.0,.05,'#2a1a10',-6.2,1.9,-3);H.col(-6.2,-3,.5);
  H.sph(.3,'#c2823a',6.2,.9,-3.4,{roughness:.35},[.8,1.2,.4]);H.box(.07,.9,.05,'#2a1a10',6.2,1.7,-3.4);H.col(6.2,-3.4,.5);
  // 窗與星空
  H.win(-5.5,3.2,-6.9,2.4,2.8,0,'#5a74d8');H.win(5.5,3.2,-6.9,2.4,2.8,0,'#5a74d8');H.shaft(-4.6,3,-6,2,6.5,.3,0,'#9fb6ff',.2);H.shaft(6.4,3,-6,2,6.5,.3,0,'#9fb6ff',.16);
  H.lamp(-7,3.8,'#ffcf8a',2.2);H.lamp(7,3.5,'#ffcf8a',2.2);H.light('#8fa6ff',1.1,0,4.5,-1,16);
  return{sky:['#05081c','#3b4a9a'],fog:['#222c66',.03],hemi:['#a9b8ff','#201a2c',.7],sun:['#aebcff',.55,[-3,8,5]],bounds:{w:17,d:13},spawn:[0,4],orb:[[-3.4,1.5],[3.6,1.2],[0,-.2]],dust:'#b8c6ff',notes:'#bcd0ff',audio:[220,277.2,329.6,440],cam:{dist:10,pitch:.6}};},
family(H){ // 親子館：軟積木、球池、溜滑梯
  H.room(18,14,5.2,'#ffe2c8','#e8c19a');H.plane(16,12,'#ffce96',0,.01,0,{roughness:1}).rotation.x=-Math.PI/2;
  const bc=['#ff7a6b','#ffc84a','#58c4a0','#5aa0ff','#c28bff','#ff9fb3'];
  for(let i=0;i<9;i++){const x=-6+Math.random()*4,z=-5+Math.random()*3;H.box(.8,.8,.8,bc[i%6],x,.4,z,{roughness:.6}).rotation.y=Math.random();H.col(x,z,.6)}
  // 球池
  H.box(5,.6,4,'#5aa0ff',5,.3,-3.2,{roughness:.5});const gI=new THREE.InstancedMesh(new THREE.SphereGeometry(.16,10,8),new THREE.MeshStandardMaterial({roughness:.4}),220),d=new THREE.Object3D(),cc=new THREE.Color();for(let i=0;i<220;i++){d.position.set(2.7+Math.random()*4.6,.6+Math.random()*.15,-5+Math.random()*3.6);d.updateMatrix();gI.setMatrixAt(i,d.matrix);gI.setColorAt(i,cc.set(bc[i%6]))}H.S.add(gI);H.col(5,-3.2,2.6);
  // 溜滑梯
  H.box(1.6,1.6,1.6,'#ffc84a',-5.5,.8,2.5);const sl=H.box(1.3,.12,3.4,'#ff7a6b',-5.5,.8,4.6);sl.rotation.x=.52;H.col(-5.5,2.8,1.3);H.col(-5.5,4.2,.8);
  // 大熊
  H.sph(1,'#b98b5a',0,1.2,-5.2,{roughness:.9},[1,1.1,.9]);H.sph(.7,'#c79c6b',0,2.5,-5.2,{roughness:.9});[-.5,.5].forEach(x=>H.sph(.25,'#c79c6b',x,3.05,-5.2,{roughness:.9}));[-.8,.8].forEach(x=>H.sph(.35,'#b98b5a',x,.4,-4.7));H.sph(.3,'#e8d0aa',0,2.4,-4.6);H.col(0,-5.2,1.3);
  H.win(-3,3,-6.9,3,2.4,0,'#fff0d0');H.shaft(-2,2.5,-6,2,6,.3,0,'#fff0d0',.18);H.light('#ffe1b8',1.3,0,4,0,18);
  // 氣球
  for(let i=0;i<7;i++){const x=-7+Math.random()*14,z=-2+Math.random()*6;H.sph(.3,bc[i%6],x,3.4+Math.random()*.8,z,{roughness:.3,emissive:bc[i%6],emissiveIntensity:.12},[1,1.2,1]);H.cyl(.008,.008,1.6,'#fff',x,2.4,z)}
  return{sky:['#2a1410','#ffb089'],fog:['#e8a47a',.02],hemi:['#fff0e0','#7a5238',.95],sun:['#ffe0c0',.9,[3,9,5]],bounds:{w:17,d:13},spawn:[0,4.5],orb:[[-2,.5],[2,2],[-5,-1.5]],dust:'#ffd8b0',audio:[261.6,329.6,392,493.9],cam:{dist:10,pitch:.62}};},
art(H){ // 美術館：白牆、畫作、聚光燈
  H.room(20,15,6,'#eceaf2','#cfcbd8',{trim:'#ffffff',floorR:.25});
  const paints=[(g,w,h)=>{const r=g.createLinearGradient(0,0,w,h);r.addColorStop(0,'#2b1b5a');r.addColorStop(.5,'#c0558f');r.addColorStop(1,'#ffb36b');g.fillStyle=r;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(w*.65,h*.4,h*.2,0,7);g.fill()},
   (g,w,h)=>{g.fillStyle='#10223f';g.fillRect(0,0,w,h);for(let i=0;i<9;i++){g.fillStyle=['#ffd24a','#4fd1c5','#ff7a6b','#fff'][i%4];g.globalAlpha=.7;g.beginPath();g.arc(Math.random()*w,Math.random()*h,10+Math.random()*30,0,7);g.fill()}g.globalAlpha=1},
   (g,w,h)=>{g.fillStyle='#f1e7d3';g.fillRect(0,0,w,h);g.fillStyle='#d9483b';g.fillRect(w*.1,h*.15,w*.35,h*.7);g.fillStyle='#2f5d8a';g.fillRect(w*.5,h*.15,w*.4,h*.35);g.fillStyle='#e6b422';g.fillRect(w*.5,h*.55,w*.4,h*.3)},
   (g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,5,w/2,h/2,w*.7);r.addColorStop(0,'#fff3b0');r.addColorStop(.4,'#58b6a4');r.addColorStop(1,'#12273a');g.fillStyle=r;g.fillRect(0,0,w,h)}];
  [[-6.5,0],[-2.2,1],[2.2,2],[6.5,3]].forEach(([x,i])=>{H.frame(x,3.1,-7.3,3,2.2,0,paints[i]);H.light('#fff4e0',.7,x,5,-5.5,8)});
  H.frame(-9.8,3.1,-1,3,2.2,Math.PI/2,paints[2]);H.frame(9.8,3.1,-1,3,2.2,-Math.PI/2,paints[0]);
  // 雕塑基座
  [[-4,-1.5,'#ff7a6b'],[4,-1,'#58c4c0'],[0,2.5,'#ffd24a']].forEach(([x,z,c],i)=>{H.cyl(.8,.9,1.1,'#f8f6fb',x,.55,z,{roughness:.3});const k=H.add(new THREE.Mesh(new THREE.TorusKnotGeometry(.4,.13,64,10),H.mat(c,{metalness:.6,roughness:.2,emissive:c,emissiveIntensity:.12})),x,1.9,z);k.userData.spin=1;H.col(x,z,1.0);H.halo(x,1.9,z,c,2.4,.35);const sp=new THREE.SpotLight('#fff3e0',1.2,10,.5,.6);sp.position.set(x,5.8,z+.5);sp.target.position.set(x,1,z);H.S.add(sp,sp.target)});
  H.box(2.4,.5,.8,'#2a2622',0,.3,-3.4);H.col(0,-3.4,1.2);
  return{sky:['#0e0b18','#8a78b8'],fog:['#a69cc4',.02],hemi:['#f3eeff','#4a4258',.7],sun:['#f1e8ff',.35,[-3,8,5]],bounds:{w:19,d:14},spawn:[0,5.5],orb:[[-2.2,-1.2],[2.6,1.4],[-5.5,2]],dust:'#e1d2ff',spin:true,audio:[196,233,293.7,370],cam:{dist:10.5,pitch:.6}};},
museum(H){ // 博物館：恐龍骨架、柱廊
  H.room(22,16,7.5,'#d4cdbd','#a9a191',{trim:'#eee8da',floorR:.4});
  for(let i=-3;i<=3;i++)if(i){H.cyl(.5,.55,7.4,'#e5decc',i*3.2,3.7,-7.2);H.col(i*3.2,-7.2,.6)}
  // 恐龍骨架
  const bone='#f1ead6',D=new THREE.Group();H.S.add(D);const bm=H.mat(bone,{roughness:.6}),add=(geo,x,y,z,rx,ry,rz,s)=>{const m=new THREE.Mesh(geo,bm);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);if(s)m.scale.set(...s);m.castShadow=true;D.add(m);return m};
  for(let i=0;i<16;i++){const t=i/15;add(new THREE.SphereGeometry(.17-.08*Math.abs(t-.35),8,6),0,2.2+Math.sin(t*3)*.35,-3+i*.3);}
  for(let i=0;i<10;i++){const z=-2.5+i*.32,y=2.5+Math.sin((i/9)*3)*.2;add(new THREE.TorusGeometry(.65-Math.abs(i-4)*.05,.03,6,16,Math.PI),0,y,z,0,Math.PI/2,Math.PI);add(new THREE.TorusGeometry(.65-Math.abs(i-4)*.05,.03,6,16,Math.PI),0,y,z,0,Math.PI/2,0)}
  add(new THREE.BoxGeometry(.5,.45,.9),0,3.0,-3.8,.3);add(new THREE.BoxGeometry(.4,.14,.7),0,2.8,-4.3,.25);[-.35,.35].forEach(x=>{add(new THREE.CylinderGeometry(.08,.1,1.5,8),x,1.4,-1.5);add(new THREE.CylinderGeometry(.08,.1,1.5,8),x,1.4,.2)});
  for(let i=0;i<8;i++)add(new THREE.ConeGeometry(.1-i*.008,.5,6),0,2.2-i*.05,.5+i*.5,Math.PI/2.2);
  D.position.set(0,0,-1.5);H.box(4.4,.3,7.6,'#7c735f',0,.15,.4);H.col(0,.4,3.2);H.col(0,-2.5,2);H.halo(0,3.2,-1,'#ffe9b0',5,.18);
  // 展示櫃
  [[-7.5,2,'#7fd1ff'],[7.5,2.5,'#ff9fb3'],[-7.5,-3,'#ffd24a']].forEach(([x,z,c])=>{H.box(1.6,.9,1.6,'#4a4034',x,.45,z);H.box(1.4,1,1.4,'#cfeaff',x,1.4,z,{transparent:true,opacity:.28,roughness:.1});H.ico(.3,c,x,1.25,z,[1,1,1]).material.emissive.set(c);H.col(x,z,1.1);H.halo(x,1.3,z,c,1.8,.4)});
  H.win(-9,4.5,-7.7,3,3.4,0,'#ffe9c0');H.win(9,4.5,-7.7,3,3.4,0,'#ffe9c0');H.shaft(-8,4,-6.5,2.4,8,.3,0,'#ffe3a8',.22);H.shaft(10,4,-6.5,2.4,8,.3,0,'#ffe3a8',.18);H.light('#ffe3b8',1.2,0,6,0,22);
  return{sky:['#0c0d12','#b3a790'],fog:['#8d8676',.016],hemi:['#f2ead8','#4a4538',.75],sun:['#ffe9c8',.6,[-3,10,6]],bounds:{w:21,d:15},spawn:[0,6],orb:[[-4.5,1.5],[4.5,.5],[0,4]],dust:'#ffe9c0',audio:[174.6,220,261.6,349.2],cam:{dist:11,pitch:.58}};},
botanic(H){ // 植物園：玻璃溫室與綠光
  const gr=H.plane(40,40,'#2e6b4a',0,0,0,{roughness:.95});gr.rotation.x=-Math.PI/2;gr.castShadow=false;
  const dome=new THREE.Mesh(new THREE.SphereGeometry(16,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:'#bfeedd',transparent:true,opacity:.14,side:THREE.DoubleSide,roughness:.1,metalness:.2}));H.S.add(dome);
  for(let i=0;i<10;i++){const rb=new THREE.Mesh(new THREE.TorusGeometry(16,.07,6,48,Math.PI),H.mat('#e8f5ef'));rb.rotation.y=i/10*Math.PI;rb.position.y=0;H.S.add(rb)}for(let i=1;i<5;i++){const r=16*Math.cos(i/5*Math.PI/2),t=new THREE.Mesh(new THREE.TorusGeometry(r,.06,6,48),H.mat('#e8f5ef'));t.rotation.x=Math.PI/2;t.position.y=16*Math.sin(i/5*Math.PI/2);H.S.add(t)}
  // 小徑與水池
  const path=H.add(new THREE.Mesh(new THREE.RingGeometry(3.4,5,48),H.mat('#cdbf9e',{roughness:1})),0,.02,0,false);path.rotation.x=-Math.PI/2;
  const pond=H.add(new THREE.Mesh(new THREE.CircleGeometry(2.6,40),new THREE.MeshStandardMaterial({color:'#4fb6c8',roughness:.1,metalness:.3,transparent:true,opacity:.9})),0,.05,0,false);pond.rotation.x=-Math.PI/2;H.col(0,0,2.6);
  for(let i=0;i<7;i++){const a=i*1.3,l=H.add(new THREE.Mesh(new THREE.CircleGeometry(.3,12),H.mat('#4a9f5c')),Math.cos(a)*1.6,.07,Math.sin(a)*1.6,false);l.rotation.x=-Math.PI/2}H.sph(.18,'#ff9fc0',.5,.15,.3,{emissive:'#ff9fc0',emissiveIntensity:.5});
  // 棕櫚與大型葉片
  const palm=(x,z,s)=>{H.cyl(.14*s,.2*s,2.8*s,'#7a5a3a',x,1.4*s,z);for(let i=0;i<9;i++){const a=i/9*6.28,l=H.add(new THREE.Mesh(new THREE.SphereGeometry(1,10,6),H.mat('#3f9a5a',{roughness:.7})),x+Math.cos(a)*.9*s,2.9*s,z+Math.sin(a)*.9*s);l.scale.set(1.5*s,.08*s,.38*s);l.rotation.y=-a;l.rotation.z=-.4}H.col(x,z,.45*s)};
  H.trellis(0,4.6);palm(-8,-6,1.4);palm(8,-5,1.2);palm(-9,4,1.1);palm(9,6,1.5);palm(0,-10,1.3);palm(-5,9,1);
  [[-6,0],[6,1],[3,-8],[-3,-8],[2,8]].forEach(([x,z])=>{for(let i=0;i<5;i++){const m=H.ico(.5+Math.random()*.4,['#4fae6e','#3f9a5a','#6cc283'][i%3],x+Math.random()*1.4-.7,.5+Math.random()*.5,z+Math.random()*1.4-.7,[1,1.2,1])}H.col(x,z,1)});
  H.flowers(-6,6,3,60,['#ff7aa8','#ffd24a','#fff','#c28bff']);H.flowers(5,-3,2.4,50,['#ff9fb3','#fff3a0','#ffffff']);
  [[-4,-3],[4,4],[-4,6]].forEach(([x,z])=>H.lamp(x,z,'#a8ffd2',1.8));H.shaft(-6,6,-3,3,12,.35,0,'#d9ffe9',.2);H.shaft(7,7,3,3,12,-.35,0,'#d9ffe9',.16);
  return{sky:['#041510','#7fe0b0'],fog:['#3e8f6c',.02],hemi:['#d8ffe9','#1d4a35',.85],sun:['#e6fff0',.9,[-5,12,4]],bounds:{r:13},spawn:[0,7],orb:[[3.5,3.5],[-3.5,3.5],[0,-5.8]],dust:'#baffd8',audio:[196,261.6,329.6,392],cam:{dist:10,pitch:.62}};},
town(H){ // 雙北小鎮：開放式 3D 地圖，10 棟造型各異的建築
  const T=THREE,SC=H.S,gr=H.plane(300,300,'#86b55c',0,0,0,{roughness:1});gr.rotation.x=-Math.PI/2;gr.castShadow=false;
  const R=(()=>{let a=2024;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}})();
  const place=LOCS.map(L=>{const x=L.p3[0],z=L.p3[1],ry=Math.atan2(-x,-z);return{L,x,z,ry}});
  // 建築用的局部座標包裝（+z 為正面）
  const FADE=[];const Bld=(p,doorD)=>{const g=new T.Group();g.position.set(p.x,0,p.z);g.rotation.y=p.ry;SC.add(g);FADE.push({g,x:p.x,z:p.z,r:7.5,k:1,m:null});
    const add=(m,x,y,z)=>{m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};
    const wx=(lx,lz)=>[p.x+lx*Math.cos(p.ry)+lz*Math.sin(p.ry),p.z-lx*Math.sin(p.ry)+lz*Math.cos(p.ry)];
    const o={g,
      box:(w,h,d,c,x,y,z,op)=>add(new T.Mesh(new T.BoxGeometry(w,h,d),H.mat(c,op)),x,y,z),
      cyl:(rt,rb,h,c,x,y,z,op,seg)=>add(new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg||20),H.mat(c,op)),x,y,z),
      cone:(r,h,c,x,y,z,seg,op)=>add(new T.Mesh(new T.ConeGeometry(r,h,seg||16),H.mat(c,Object.assign({flatShading:true},op||{}))),x,y,z),
      sph:(r,c,x,y,z,sc,op)=>{const m=add(new T.Mesh(new T.SphereGeometry(r,20,14),H.mat(c,op)),x,y,z);if(sc)m.scale.set(...sc);return m},
      tor:(r,t,c,x,y,z,arc,op)=>add(new T.Mesh(new T.TorusGeometry(r,t,8,24,arc||Math.PI*2),H.mat(c,op)),x,y,z),
      col:(lx,lz,r)=>{const [a,b]=wx(lx,lz);H.col(a,b,r)},
      footprint:(w,d,cz)=>{const n=Math.max(1,Math.ceil(w/1.8));for(let i=0;i<n;i++)o.col(-w/2+(i+.5)*w/n,cz||0,Math.max(.95,d/2))},
      door:(w,h,c,z)=>o.box(w,h,.12,c||'#7a4a2a',0,h/2,z)};
    const [dx,dz]=wx(0,doorD);p.door=[dx,dz];return o};
  const win=(b,x,y,z,w,h,c)=>b.box(w,h,.1,c||'#ffe9b0',x,y,z,{emissive:'#ffcf80',emissiveIntensity:.5});
  const P=place;
  // 1 哺乳室：粉色小木屋，煙囪、愛心
  {const b=Bld(P[0],3.6);b.box(5,2.6,4,'#f4c9c4',0,1.3,0);b.cone(2.6,1.9,'#c9788a',0,3.55,0,4).rotation.y=Math.PI/4;b.g.children[b.g.children.length-1].scale.set(1.5,1,1.2);
    b.box(.6,1.4,.6,'#b87a5a',1.4,3.6,-.6);b.door(.95,1.7,'#8a4a62',2.05);win(b,-1.6,1.5,2.05,.9,.9);win(b,1.6,1.5,2.05,.9,.9);
    b.sph(.22,'#e86a86',-.14,2.55,2.1);b.sph(.22,'#e86a86',.14,2.55,2.1);b.box(.3,.3,.08,'#e86a86',0,2.38,2.1).rotation.z=Math.PI/4;
    b.sph(.5,'#fbe3ec',-2.9,.3,1.6,[1,.6,1]);b.sph(.4,'#f7c6d4',-3.3,.25,1.0,[1,.6,1]);b.footprint(5,4)}
  // 2 閱讀室：石砌圖書館 + 鐘塔
  {const b=Bld(P[1],3.6);b.box(5.6,3.4,4,'#e0d1a8',0,1.7,0);b.box(1.9,5.4,1.9,'#d8c697',0,2.7,-.8);b.cone(1.5,1.7,'#3d6d75',0,6.25,-.8,4).rotation.y=Math.PI/4;
    b.cyl(.6,.6,.12,'#fff6dc',0,4.5,.19,{emissive:'#ffd98a',emissiveIntensity:.6},24).rotation.x=Math.PI/2;b.box(.08,.4,.05,'#3a2a1c',0,4.55,.27);
    b.box(5.8,.3,4.2,'#9b7a56',0,3.5,0);for(const x of[-2,-1,1,2])win(b,x,1.9,2.05,.55,1.2,'#bfe0f0');b.door(1.5,2,'#7a4a2a',2.05);
    [['#c0553b',0],['#3d7ab5',.12],['#5f9a68',.24]].forEach(([c,y],i)=>b.box(.9-i*.1,.14,.5,c,-2.8+i*.05,.1+y,1.8));b.footprint(5.6,4)}
  // 3 韻律教室：馬戲帳篷 + 鼓
  {const b=Bld(P[2],3.4);b.cyl(2.7,2.7,2.2,'#f4d78a',0,1.1,0,null,14);b.cone(3.2,2.6,'#d0503f',0,3.5,0,14);b.cone(.5,.9,'#f6c84a',0,5.2,0,8);b.cyl(.04,.04,1,'#444',0,5.9,0,null,6);b.box(.6,.35,.04,'#3d7ab5',.3,6.2,0);
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;b.box(.5,2.2,.12,i%2?'#d0503f':'#fff3d6',Math.sin(a)*2.72,1.1,Math.cos(a)*2.72).rotation.y=a}
    b.door(1.3,1.7,'#5a3a22',2.72);[['#3d7ab5',-3.2],['#e2704f',-2.6],['#5f9a68',-3.9]].forEach(([c,x],i)=>{b.cyl(.5,.5,.55,c,x,.28,1.6+i*.3,null,16);b.cyl(.5,.5,.04,'#f6efe0',x,.57,1.6+i*.3,null,16)});b.footprint(5.4,5.4)}
  // 4 音樂教室：藍色高塔 + 圓頂 + 琴鍵階梯
  {const b=Bld(P[3],3.2);b.box(3.4,5.2,3.4,'#8fa3dd',0,2.6,0);b.sph(1.9,'#33458f',0,5.2,0,[1,.75,1]);b.cyl(.05,.05,1.1,'#e8c25a',0,6.7,0,null,6);b.sph(.18,'#e8c25a',0,7.3,0);
    b.door(1.1,1.8,'#33458f',1.72);for(const y of[1.8,3.4]){win(b,-.9,y,1.72,.5,.9,'#dfe6ff');win(b,.9,y,1.72,.5,.9,'#dfe6ff')}
    for(let i=0;i<8;i++){b.box(.3,.16+i*0,1.4,'#fbf6ea',-1.05+i*.3,.1,2.5);if([0,1,3,4,5,7].includes(i)&&i<7)b.box(.18,.22,.9,'#2a2430',-.9+i*.3,.22,2.2)}
    for(let i=0;i<4;i++)b.sph(.14,'#7fa0ff',-2.4+i*.8,3.5+i*.5,2.2,null,{emissive:'#7fa0ff',emissiveIntensity:1.4});b.footprint(3.4,3.4)}
  // 5 親子館：積木城堡 + 溜滑梯 + 玩偶熊
  {const b=Bld(P[4],3.6);b.box(5,1.6,2.6,'#f08a5a',0,.8,0);[['#e2504a',-2.2],['#f6c84a',0],['#4a8ad0',2.2]].forEach(([c,x],i)=>{b.cyl(.85,.85,3+(i===1?1.2:0),c,x,(3+(i===1?1.2:0))/2,-.4,null,14);b.cone(1.1,1.2,['#4a8ad0','#e2504a','#f6c84a'][i],x,3.6+(i===1?1.2:0),-.4,14)});
    for(let i=0;i<5;i++)b.box(.5,.4,.5,i%2?'#fbf6ea':'#7fc27a',-2.2+i,1.8,1.35);b.door(1.2,1.4,'#6a3a8a',1.32);
    b.box(.9,.2,3.2,'#e2504a',-3.9,.9,1.0).rotation.x=-.45;b.box(1,.2,.9,'#f6c84a',-3.9,1.9,-.55);b.cyl(.05,.05,1.8,'#888',-4.3,1,-.55,null,6);
    b.sph(.55,'#8a5a3a',3.7,.7,1.5,[1,1.1,1]);b.sph(.4,'#8a5a3a',3.7,1.5,1.5);b.sph(.15,'#8a5a3a',3.45,1.85,1.5);b.sph(.15,'#8a5a3a',3.95,1.85,1.5);b.sph(.18,'#e8c9a0',3.7,1.42,1.85);
    for(let i=0;i<14;i++){const a=i*.9,r=1.1+(i%3)*.15;b.sph(.2,['#e2504a','#f6c84a','#4a8ad0','#7fc27a'][i%4],4.2+Math.cos(a)*.6*(i%2?1:.4),.2,-1+Math.sin(a)*.6*(i%2?1:.4)+i*.05)}b.footprint(5,3);b.col(-3.9,.6,1.1)}
  // 6 美術館：新古典神殿 + 彩色雕塑
  {const b=Bld(P[5],3.8);b.box(6.2,3.2,3.6,'#f1ece0',0,1.6,-.4);b.box(6.6,.35,4.6,'#d9d2c0',0,3.35,.2);b.cone(3.4,1.4,'#c8654a',0,4.2,.2,4).rotation.y=Math.PI/4;b.g.children[b.g.children.length-1].scale.set(1.3,1,.8);
    for(let i=-2;i<=2;i++)b.cyl(.22,.26,3.2,'#fbf8ee',i*1.15,1.6,1.9,null,14);b.door(1.4,2.1,'#2a4a6a',1.45);b.box(6.4,.2,.8,'#d9d2c0',0,.1,2.4);b.box(5.4,.3,.5,'#d9d2c0',0,.2,2.7);
    b.sph(.7,'#e2504a',-4.4,1.1,1.6);b.box(.9,.9,.9,'#4a8ad0',-4.4,2.1,1.6).rotation.set(.5,.6,.2);b.cone(.55,1.1,'#f6c84a',-4.4,3,1.6,4);b.tor(.7,.14,'#7a4aaa',4.4,1.6,1.6,null);b.cyl(.14,.2,1.2,'#fbf8ee',4.4,.6,1.6,null,10);b.footprint(6.2,3.6,-.2);b.col(-4.4,1.6,1.0);b.col(4.4,1.6,.9)}
  // 7 博物館：石造大廳 + 恐龍骨架
  {const b=Bld(P[6],3.6);b.box(6,3.8,3.8,'#c2b08f',0,1.9,0);b.box(6.4,.4,4.2,'#8f7f64',0,3.95,0);b.box(2.6,5,2,'#b8a583',0,2.5,1.0);b.cone(1.6,1.2,'#7a6a4a',0,5.6,1.0,4).rotation.y=Math.PI/4;
    b.box(1.5,2.3,.14,'#2a1f16',0,1.15,2.02);b.cyl(.75,.75,.14,'#2a1f16',0,2.3,2.02,null,20).rotation.x=Math.PI/2;for(const x of[-2.2,2.2]){b.box(.5,2.4,.05,'#b5321f',x,2.5,1.95)}
    for(let i=0;i<9;i++){const x=-3.6-i*.45,y=.9+Math.sin(i/8*Math.PI)*.9;b.sph(.16,'#f1e8d2',x-1,y,1.7);if(i>0&&i<8)b.tor(.4+Math.sin(i/8*Math.PI)*.4,.045,'#f1e8d2',x-1,y-.5,1.7,Math.PI).rotation.y=Math.PI/2}
    b.sph(.32,'#f1e8d2',-2.2-.2,1.5,1.7,[1.5,1,1]);b.cone(.18,.6,'#f1e8d2',-2.7,1.4,1.7,5).rotation.z=Math.PI/2;b.footprint(6,3.8);b.col(-5.6,1.7,1.2)}
  // 8 植物園：玻璃溫室
  {const b=Bld(P[7],3.6);b.box(5.4,.9,4.4,'#d6dccb',0,.45,0);b.sph(2.8,'#cfeee4',0,.9,0,[1,.85,.85],{transparent:true,opacity:.38,roughness:.08,metalness:.2,depthWrite:false});
    for(let i=0;i<4;i++){const t=b.tor(2.78,.05,'#f4f6ee',0,.9,0,Math.PI);t.rotation.y=i*Math.PI/4;t.scale.set(1,.85,.85)}for(let k=1;k<=3;k++){const t=b.tor(2.8*Math.cos(k*.4),.04,'#f4f6ee',0,.9+2.8*.85*Math.sin(k*.4),0);t.rotation.x=Math.PI/2;t.scale.set(1,1,1)}
    b.box(1.3,1.9,.1,'#cfeee4',0,.95+.5,2.3,{transparent:true,opacity:.5});b.box(1.45,.1,.2,'#f4f6ee',0,2.5,2.3);
    for(const [x,z,s] of[[-1.2,-.4,1],[1,.2,1.3],[0,-1.1,.9],[-.4,.9,.8]]){b.cyl(.06,.08,1.4*s,'#6a4a30',x,.9+.7*s,z,null,6);for(let k=0;k<5;k++){const a=k/5*Math.PI*2;b.cone(.16,.9*s,'#3f9a5a',x+Math.cos(a)*.28,.9+1.5*s,z+Math.sin(a)*.28,5).rotation.set(Math.sin(a)*1.1,0,-Math.cos(a)*1.1)}}
    b.sph(.35,'#e86a86',-1.8,1.1,1.4,[1,.7,1]);b.sph(.3,'#f6c84a',1.7,1.05,1.5,[1,.7,1]);b.footprint(5.4,4.4)}
  // 9 公園：入口花拱 + 涼亭 + 池塘 + 鞦韆
  {const b=Bld(P[8],3.6);b.tor(1.6,.12,'#c49a3c',0,2.2,1.6,Math.PI);b.cyl(.12,.12,2.2,'#c49a3c',-1.6,1.1,1.6,null,8);b.cyl(.12,.12,2.2,'#c49a3c',1.6,1.1,1.6,null,8);
    for(let i=0;i<12;i++){const a=Math.PI*i/11;b.sph(.2,['#e86a86','#f6efe0','#e2704f'][i%3],Math.cos(a)*1.6,2.2+Math.sin(a)*1.6,1.6)}
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;b.cyl(.1,.1,2.1,'#fbf6ea',Math.cos(a)*1.5,1.05,-.4+Math.sin(a)*1.5,null,8)}b.cone(2.2,1.3,'#5f9a68',0,2.75,-.4,6);b.cyl(1.7,1.7,.15,'#e8d9a8',0,.08,-.4,null,6);
    b.cyl(2.2,2.2,.06,'#6ab8d6',-4,.04,-1,{roughness:.1,metalness:.4},28);b.cyl(.07,.07,2.4,'#c0553b',3.2,1.2,-1);b.cyl(.07,.07,2.4,'#c0553b',5,1.2,-1);b.cyl(.07,.07,2,'#c0553b',4.1,2.3,-1,null,8).rotation.z=Math.PI/2;b.box(.6,.08,.3,'#3d7ab5',3.7,.7,-1);b.box(.6,.08,.3,'#3d7ab5',4.5,.7,-1);
    b.col(0,-.4,1.8);b.col(3.2,-1,.35);b.col(5,-1,.35);b.col(-4,-1,2.1)}
  // 10 動物園：大門 + 圍欄 + 長頸鹿 + 大象
  {const b=Bld(P[9],3.6);for(const x of[-2.2,2.2]){b.box(1,3.4,1,'#c9b08a',x,1.7,1.6);b.sph(.55,'#e8c682',x,3.8,1.6)}b.box(5.6,.8,.5,'#7a4a2a',0,3.1,1.6);b.box(5.2,.5,.1,'#f6c84a',0,3.1,1.88);
    for(let i=-4;i<=4;i++){b.box(.12,.9,.12,'#7a5636',i*.55,.45,0);b.box(.12,.9,.12,'#7a5636',i*.55,.45,-5.2)}[.35,.7].forEach(y=>{b.box(5,.06,.06,'#8a6a46',0,y,0);b.box(5,.06,.06,'#8a6a46',0,y,-5.2)});
    b.cyl(.08,.1,1.5,'#e8c27a',-1.2,.75,-2.4);b.cyl(.08,.1,1.5,'#e8c27a',-.8,.75,-2.4);b.cyl(.08,.1,1.5,'#e8c27a',-1.2,.75,-2.9);b.cyl(.08,.1,1.5,'#e8c27a',-.8,.75,-2.9);b.box(.8,.55,.6,'#e8c27a',-1,1.6,-2.65);b.cyl(.1,.14,2,'#e8c27a',-.65,2.5,-2.65).rotation.z=-.25;b.sph(.22,'#e8c27a',-.35,3.5,-2.65,[1.4,1,1]);
    for(const [x,z] of[[-1,-2.5],[-.7,-2.8],[-1.3,-2.8]])b.sph(.1,'#a4702a',x,1.6,z);
    b.sph(.8,'#9aa3ad',1.5,1.1,-2.8,[1.3,1,1]);b.sph(.45,'#9aa3ad',2.4,1.4,-2.8);b.cyl(.12,.16,.9,'#9aa3ad',2.8,.9,-2.8).rotation.z=-.5;b.sph(.4,'#aab3bd',2.35,1.45,-2.4,[.3,1,1]);b.sph(.4,'#aab3bd',2.35,1.45,-3.2,[.3,1,1]);[[1,-2.4],[2,-2.4],[1,-3.2],[2,-3.2]].forEach(([x,z])=>b.cyl(.18,.2,.7,'#9aa3ad',x,.35,z,null,8));
    b.col(-2.2,1.6,.7);b.col(2.2,1.6,.7);b.col(0,-2.6,2.4)}
  // 道路、廣場、噴泉
  const road=(x0,z0,x1,z1,w,c)=>{const len=Math.hypot(x1-x0,z1-z0),g=new T.Group();g.position.set((x0+x1)/2,.03,(z0+z1)/2);g.rotation.y=-Math.atan2(z1-z0,x1-x0);SC.add(g);const m=new T.Mesh(new T.PlaneGeometry(len,w),H.mat(c,{roughness:1}));m.rotation.x=-Math.PI/2;m.receiveShadow=true;g.add(m)};
  H.add(new T.Mesh(new T.CylinderGeometry(6,6,.1,40),H.mat('#e9dcae',{roughness:1})),0,.05,0,false);H.add(new T.Mesh(new T.TorusGeometry(5.6,.12,6,48),H.mat('#c49a3c')),0,.12,0,false).rotation.x=Math.PI/2;
  H.cyl(2,2.2,.5,'#d2bd8a',0,.25,0);H.cyl(1.7,1.7,.08,'#7fc4d6',0,.5,0,{roughness:.05,metalness:.3,transparent:true,opacity:.9});H.cyl(.18,.28,1.6,'#d2bd8a',0,1.2,0);H.sph(.5,'#e8d9a8',0,2.1,0,[1,.6,1]);H.sph(.2,'#7fc4d6',0,2.5,0,null,{emissive:'#7fc4d6',emissiveIntensity:.6});H.col(0,0,2.1);
  // 路燈與樹
  const distSeg=(x,z,x1,z1)=>{const l2=x1*x1+z1*z1,t=Math.max(0,Math.min(1,(x*x1+z*z1)/l2));return Math.hypot(x-t*x1,z-t*z1)};
  let n=0,tries=0;while(n<130&&tries++<1800){const a=R()*Math.PI*2,r=9+R()*96,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(P.some(p=>Math.hypot(x-p.x,z-p.z)<8.5||distSeg(x,z,p.door[0],p.door[1])<2.6))continue;
    if(R()<.3)H.pine(x,z,1+R()*.6,['#2f6b4a','#3a7a52'][n%2]);else H.tree(x,z,.9+R()*.9,['#3e8247','#4a8f4e','#6aa55a','#d98aa0','#e0a04a'][n%5]);n++}
  for(let i=0;i<7;i++){const a=R()*6.28,r=8+R()*28,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!P.some(p=>Math.hypot(x-p.x,z-p.z)<7.5))H.flowers(x,z,2.2,60,[['#ff7aa8','#ffd24a','#fff'],['#c28bff','#fff3a0','#ff9fb3']][i%2])}
  // 遠山
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2+R()*.3,r=64+R()*10,h=12+R()*14,m=H.cone(8+R()*8,h,['#8fb0a8','#a0b8c0','#b4a8c8','#9fb890'][i%4],Math.cos(a)*r,h/2-1,Math.sin(a)*r,null,7);m.castShadow=false}
  for(let i=0;i<7;i++)H.halo(-45+i*15,24+R()*8,-58,'#ffffff',22,.3);
  // 上鎖的建築：門前掛金鎖
  P.forEach(p=>{if(!isLocked(p.L.id))return;const x=p.door[0],z=p.door[1],dx=-x,dz=-z,l=Math.hypot(dx,dz)||1;const gx=x-dx/l*.2,gz=z-dz/l*.2;H.box(.7,.55,.18,'#d9a24a',gx,1.35,gz);H.add(new T.Mesh(new T.TorusGeometry(.2,.055,8,16,Math.PI),H.mat('#c49a3c')),gx,1.62,gz,false);H.sph(.06,'#4a3426',gx,1.35,gz+.1);H.halo(gx,1.4,gz,'#ffd35c',1.8,.35)});
  // 入口 props（靠近按 E 進入）
  const sp=W3.townSpawn||[0,7.5];
  return{guide:!W3.townSpawn&&!((S.rpg.visits[TK()]||{}).nurse),zoom:false,fade:FADE,props:P.map(p=>({id:p.L.id,x:p.door[0],z:p.door[1],label:p.L.id==='nurse'?'🎁 免費體驗：哺乳室':(isLocked(p.L.id)?'🔒 付費解鎖：':'進入 ')+p.L.n,prompt:isLocked(p.L.id)?'🔒 付費解鎖：'+p.L.n:undefined,ly:3.2,hitW:[3.4,2.6,3.4],onUse:()=>{if(isLocked(p.L.id)){w3Paywall(p.L.id);return}W3.townSpawn=[p.door[0]*.86,p.door[1]*.86];w3Close();w3Enter(p.L.id,'town')}})),
    sky:['#9cc4e0','#fbe9c6'],fog:['#efe4c4',.02],hemi:['#fff0d2','#5a7a4a',.95],sun:['#fff1d6',1.25,[-14,18,10]],bounds:{r:104},spawn:sp,orb:[[0,0]],dust:'#fff3c8',audio:[261.6,329.6,392,523.3],cam:{dist:11,pitch:.5}};},
park(H){ // 公園：草地、鞦韆、池塘、黃昏
  const gr=H.plane(60,60,'#5a9a4e',0,0,0,{roughness:1});gr.rotation.x=-Math.PI/2;gr.castShadow=false;
  const pa=H.add(new THREE.Mesh(new THREE.RingGeometry(4,5.6,48),H.mat('#d4c39a',{roughness:1})),0,.02,0,false);pa.rotation.x=-Math.PI/2;const pb=H.plane(2,14,'#d4c39a',0,.021,-11,{roughness:1});pb.rotation.x=-Math.PI/2;
  // 池塘
  const pond=H.add(new THREE.Mesh(new THREE.CircleGeometry(3,40),new THREE.MeshStandardMaterial({color:'#5ab8d6',roughness:.1,metalness:.4,transparent:true,opacity:.92})),-7,.05,-4,false);pond.rotation.x=-Math.PI/2;H.col(-7,-4,3);for(let i=0;i<8;i++){const a=i/8*6.28;H.rock(-7+Math.cos(a)*3.2,-4+Math.sin(a)*3.2,.8+Math.random()*.5)}
  // 鞦韆
  H.cyl(.07,.07,3,'#c0553b',5.4,1.5,-1.2);H.cyl(.07,.07,3,'#c0553b',9,1.5,-1.2);H.cyl(.07,.07,3.8,'#c0553b',7.2,3,-1.2).rotation.z=Math.PI/2;[6.3,8.1].forEach(x=>{H.cyl(.01,.01,2.2,'#ddd',x,1.9,-1.2);H.box(.7,.08,.3,'#3d7ab5',x,.8,-1.2)});H.col(5.4,-1.2,.3);H.col(9,-1.2,.3);
  // 長椅與野餐墊
  H.box(1.8,.1,.5,'#8a5a3a',2.2,.5,6.2);H.box(1.8,.5,.08,'#8a5a3a',2.2,.8,5.95);H.col(2.2,6.2,1);const bl=H.plane(2.6,2.2,'#e0524a',-3,.02,5,{roughness:1});bl.rotation.x=-Math.PI/2;H.sph(.22,'#ffd24a',-3.2,.25,5,null);H.box(.5,.3,.4,'#f6efe0',-2.5,.18,4.7);
  for(let i=0;i<9;i++)H.tree(-14+Math.random()*28,-14+Math.random()*10-2,1+Math.random()*.8,['#3e8247','#4a8f4e','#6aa55a'][i%3]);H.trellis(0,5.2);H.tree(10,6,1.6);H.tree(-10,7,1.4,'#e0a04a','#f0c06a');H.tree(12,-8,1.3,'#d98aa0','#eaa6b8');
  H.flowers(0,0,2,70,['#ff7aa8','#ffd24a','#fff','#c28bff']);H.flowers(-6,9,3,60,['#ff9fb3','#fff3a0']);
  [[-3,-8],[4,-7],[6,4]].forEach(([x,z])=>H.lamp(x,z,'#ffcf8a',2.2));
  // 雲
  for(let i=0;i<6;i++)H.halo(-30+i*12,18+Math.random()*6,-35,'#ffd3b8',16,.22);
  return{sky:['#2a1d4a','#ff9f6a'],fog:['#f0a07a',.014],hemi:['#ffd9b8','#3d5a38',.85],sun:['#ffb380',1.25,[-9,7,-6]],bounds:{r:17},spawn:[0,8],orb:[[2.6,2.6],[-3.5,2],[4.5,-4.5]],dust:'#ffe0b0',audio:[196,246.9,293.7,392],cam:{dist:10,pitch:.5}};},
zoo(H){ // 動物園：獅子、大象、長頸鹿、熊貓
  const gr=H.plane(60,60,'#b79a5a',0,0,0,{roughness:1});gr.rotation.x=-Math.PI/2;gr.castShadow=false;
  const pa=H.add(new THREE.Mesh(new THREE.RingGeometry(5,6.4,48),H.mat('#e0cb9b',{roughness:1})),0,.02,0,false);pa.rotation.x=-Math.PI/2;
  const pen=(cx,cz,w,d)=>{for(let i=0;i<=w*2;i++){H.box(.12,.9,.12,'#7a5636',cx-w/2+i/2,.45,cz-d/2);H.box(.12,.9,.12,'#7a5636',cx-w/2+i/2,.45,cz+d/2)}for(let i=0;i<=d*2;i++){H.box(.12,.9,.12,'#7a5636',cx-w/2,.45,cz-d/2+i/2);H.box(.12,.9,.12,'#7a5636',cx+w/2,.45,cz-d/2+i/2)}[.35,.7].forEach(y=>{H.box(w,.06,.06,'#8a6a46',cx,y,cz-d/2);H.box(w,.06,.06,'#8a6a46',cx,y,cz+d/2);H.box(.06,.06,d,'#8a6a46',cx-w/2,y,cz);H.box(.06,.06,d,'#8a6a46',cx+w/2,y,cz)});H.col(cx,cz,Math.min(w,d)/2+.5)};
  // 大象
  pen(-8,-6,6,4.5);const ga='#9aa4ae',ea=new THREE.Group();ea.position.set(-8,0,-6);H.S.add(ea);const part=(geo,c,x,y,z,s,rx,rz)=>{const m=new THREE.Mesh(geo,H.mat(c,{roughness:.9}));m.position.set(x,y,z);if(s)m.scale.set(...s);m.rotation.x=rx||0;m.rotation.z=rz||0;m.castShadow=true;ea.add(m)};
  part(new THREE.SphereGeometry(1,16,12),ga,0,1.4,0,[1.4,1.1,1]);part(new THREE.SphereGeometry(.6,14,10),ga,1.5,1.6,0);part(new THREE.CylinderGeometry(.14,.1,1.1,8),ga,2.1,1.0,0,null,0,.4);[-.7,.7].forEach(x=>[-.4,.4].forEach(z=>part(new THREE.CylinderGeometry(.22,.24,.8,8),ga,x,.4,z)));[-.3,.3].forEach(z=>part(new THREE.SphereGeometry(.4,10,8),'#8a949e',1.35,1.6,z*2,[.15,1,.9]));ea.scale.setScalar(1.1);
  // 長頸鹿
  pen(8,-6,5,4.5);const gi=new THREE.Group();gi.position.set(8,0,-6);H.S.add(gi);const gp=(geo,c,x,y,z,rx,rz)=>{const m=new THREE.Mesh(geo,H.mat(c,{roughness:.8}));m.position.set(x,y,z);m.rotation.x=rx||0;m.rotation.z=rz||0;m.castShadow=true;gi.add(m);return m};
  gp(new THREE.SphereGeometry(.6,12,10),'#e0b04a',0,1.7,0).scale.set(1.5,.9,.8);gp(new THREE.CylinderGeometry(.14,.2,2.4,8),'#e0b04a',.7,3,0,0,-.25);gp(new THREE.BoxGeometry(.6,.3,.3),'#e0b04a',1.2,4.2,0);gp(new THREE.CylinderGeometry(.02,.03,.3,5),'#7a5636',1.15,4.5,.1);[-.7,.7].forEach(x=>[-.25,.25].forEach(z=>gp(new THREE.CylinderGeometry(.08,.07,1.5,6),'#d6a43e',x,.75,z)));for(let i=0;i<8;i++)gp(new THREE.CircleGeometry(.09,6),'#8a5a2a',-.4+i*.14,1.9+(i%3)*.12,.48);gi.scale.setScalar(1.1);
  // 獅子
  pen(-8,6,5,4);const li=new THREE.Group();li.position.set(-8,0,6);H.S.add(li);const lp=(geo,c,x,y,z,s)=>{const m=new THREE.Mesh(geo,H.mat(c,{roughness:.9}));m.position.set(x,y,z);if(s)m.scale.set(...s);m.castShadow=true;li.add(m);return m};
  lp(new THREE.SphereGeometry(.6,12,10),'#d9a24a',0,.7,0,[1.5,.8,.8]);lp(new THREE.SphereGeometry(.42,12,10),'#d9a24a',.95,.95,0);lp(new THREE.SphereGeometry(.62,12,10),'#8a5a2a',.85,.95,0,[.6,1,1]);[-.5,.5].forEach(x=>[-.2,.2].forEach(z=>lp(new THREE.CylinderGeometry(.1,.1,.5,6),'#d9a24a',x,.25,z)));lp(new THREE.CylinderGeometry(.04,.04,.9,6),'#d9a24a',-1,.7,0).rotation.z=1.2;
  // 熊貓
  pen(8,6,4.5,4);const pa2=new THREE.Group();pa2.position.set(8,0,6);H.S.add(pa2);const pp=(geo,c,x,y,z,s)=>{const m=new THREE.Mesh(geo,H.mat(c,{roughness:.9}));m.position.set(x,y,z);if(s)m.scale.set(...s);m.castShadow=true;pa2.add(m)};
  pp(new THREE.SphereGeometry(.7,14,10),'#f4f4f2',0,.8,0,[1,.9,1]);pp(new THREE.SphereGeometry(.5,14,10),'#f4f4f2',.0,1.7,.1);[-.35,.35].forEach(x=>{pp(new THREE.SphereGeometry(.16,10,8),'#18181c',x,2.1,.1);pp(new THREE.SphereGeometry(.13,8,6),'#18181c',x*.8,1.75,.52,[1,1.3,.5]);pp(new THREE.CylinderGeometry(.14,.12,.7,8),'#18181c',x*1.6,.5,.1)});pp(new THREE.SphereGeometry(.07,8,6),'#18181c',0,1.62,.58);
  H.cyl(.05,.07,1.4,'#6a4a30',8.5,.7,8.1);H.cyl(.03,.03,2.4,'#4a8f3a',9,1.4,8.2);H.cyl(.03,.03,2.2,'#4a8f3a',9.2,1.3,8.1);
  // 金合歡樹
  [[-12,-1],[12,0],[0,-11],[0,11],[-13,-10],[13,-11]].forEach(([x,z])=>{H.cyl(.14,.2,2.4,'#6a4a30',x,1.2,z);const t=H.sph(2.2,'#6f8f3a',x,3.2,z,{roughness:1},[1,.35,1]);H.col(x,z,.5)});
  [[-3,-9],[3,9],[-3,9],[3,-9]].forEach(([x,z])=>H.lamp(x,z,'#ffd98a',2));
  H.box(1.6,.9,.1,'#7a5636',0,1.6,-13);H.cyl(.06,.06,1.6,'#5a3d22',-.7,.8,-13);H.cyl(.06,.06,1.6,'#5a3d22',.7,.8,-13);
  return{sky:['#2a1d0c','#ffc77a'],fog:['#e8b270',.016],hemi:['#fff0c8','#7a5a30',.85],sun:['#ffd08a',1.2,[-8,8,6]],bounds:{r:16},spawn:[0,2],orb:[[3.6,-2.4],[-3.5,-1.5],[0,5.6]],dust:'#ffe0a0',audio:[164.8,220,261.6,329.6],cam:{dist:10,pitch:.52}};}
};

/* ---- 角色與小狗（3D） ---- */
function w3保母(boots){
  const T=THREE,g=new T.Group(),M=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.75},o||{}));
  const skin=M('#f1c59a',{roughness:.6}),green=M('#fbf7ee',{side:T.DoubleSide,roughness:.9}),moss=M('#f1e8d6',{side:T.DoubleSide,roughness:.9}),sage=M('#fffdf8',{side:T.DoubleSide,roughness:.9}),lace=M('#f6eedb',{roughness:.9}),brown=M('#8fb4da'),blue=M('#86bdf0',{roughness:.85}),black=M('#08080b',{roughness:.35}),hair=M('#1a1a20',{roughness:.62,side:T.DoubleSide});
  const add=(p,geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=true;p.add(m);return m};
  const lathe=(pts,mat)=>add(g,new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),32),mat);
  lathe([[.001,.86],[.1,.84],[.14,.79],[.19,.74],[.225,.71]],green);
  lathe([[.001,.81],[.16,.78],[.25,.73],[.3,.69],[.315,.67]],moss);
  lathe([[.001,.76],[.2,.72],[.3,.67],[.34,.63],[.35,.61]],sage);
  const lt=add(g,new T.TorusGeometry(.345,.015,8,40),lace,0,.61,0);lt.rotation.x=Math.PI/2;
  for(let i=0;i<28;i++){const a=i/28*6.283,s=add(g,new T.SphereGeometry(.035,8,6),lace,Math.cos(a)*.355,.592,Math.sin(a)*.355);s.scale.set(1,.7,1)}
  const pt=add(g,new T.TorusGeometry(.32,.018,8,40),lace,0,.57,0);pt.rotation.x=Math.PI/2;
  add(g,new T.CylinderGeometry(.1,.12,.3,20),blue,0,.95,0);
  add(g,new T.CylinderGeometry(.108,.124,.17,24),green,0,.885,0);
  const nl=add(g,new T.TorusGeometry(.108,.012,8,28),lace,0,.97,0);nl.rotation.x=Math.PI/2;
  [-1,1].forEach(sx=>[-1,1].forEach(sz=>{const st=add(g,new T.CylinderGeometry(.009,.009,.12,6),green,sx*.05,1.025,sz*.085);st.rotation.z=sx*.12}));
  const wr=add(g,new T.TorusGeometry(.115,.022,8,24),brown,0,.8,0);wr.rotation.x=Math.PI/2;
  [-1,1].forEach(s=>{const b=add(g,new T.BoxGeometry(.08,.05,.03),brown,s*.05,.8,.125);b.rotation.z=s*.5});add(g,new T.BoxGeometry(.035,.035,.03),brown,0,.8,.13);
  const cl=add(g,new T.TorusGeometry(.105,.02,8,24),lace,0,1.07,0);cl.rotation.x=Math.PI/2;const cl2=add(g,new T.TorusGeometry(.13,.014,8,24),lace,0,1.05,0);cl2.rotation.x=Math.PI/2;
  add(g,new T.CylinderGeometry(.05,.055,.1,12),skin,0,1.1,0);
  const arms=[-1,1].map(s=>{const p=new T.Group();p.position.set(s*.15,1.0,0);g.add(p);
    add(p,new T.SphereGeometry(.098,18,14),blue,s*.01,-.075,0).scale.set(1,1.1,1);
    add(p,new T.CapsuleGeometry(.032,.1,4,10),blue,0,-.2,0);
    const cf=add(p,new T.TorusGeometry(.04,.012,8,16),lace,0,-.265,0);cf.rotation.x=Math.PI/2;
    add(p,new T.SphereGeometry(.04,10,8),skin,0,-.33,0);p.rotation.z=s*.08;return p});
  // 頭
  const hd=new T.Group();hd.position.set(0,1.3,0);g.add(hd);
  const hs=add(hd,new T.SphereGeometry(.27,32,24),skin,0,0,0);hs.scale.set(.97,.97,.95);
  const a=.78;
  add(hd,new T.SphereGeometry(.345,40,28,Math.PI/2+a,Math.PI*2-2*a,0,Math.PI*.8),hair,0,-.005,-.03).scale.set(1.05,1,1.03);
  add(hd,new T.SphereGeometry(.335,40,20,Math.PI/2-a-.08,2*a+.16,0,Math.PI*.37),hair,0,.02,.015);
  [-1,1].forEach(s=>{const e=add(hd,new T.SphereGeometry(.1,14,10),hair,s*.32,-.2,-.01);e.scale.set(1,.7,1.15);e.rotation.z=-s*.5});
  add(hd,new T.SphereGeometry(.12,14,10),hair,0,-.22,-.29).scale.set(1.9,.6,.8);
  // 眼鏡（粗黑框）
  const bl=w3Tex(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,2,32,32,30);r.addColorStop(0,'rgba(255,128,128,.7)');r.addColorStop(1,'rgba(255,128,128,0)');g.fillStyle=r;g.fillRect(0,0,w,h)});
  [-1,1].forEach(s=>{
    add(hd,new T.TorusGeometry(.071,.0125,10,36),black,s*.1,.0,.262);add(hd,new T.CircleGeometry(.064,28),new T.MeshStandardMaterial({color:'#e4f1ff',transparent:true,opacity:.1,roughness:.1}),s*.1,.0,.262);
    const sc=add(hd,new T.CircleGeometry(.047,24),M('#ffffff',{roughness:.3}),s*.1,.002,.2535);sc.scale.set(1.12,1,1);
    add(hd,new T.CircleGeometry(.031,24),M('#6b4430',{roughness:.3}),s*.1+s*.002,.0,.2542);
    add(hd,new T.CircleGeometry(.017,18),M('#140c08',{roughness:.3}),s*.1+s*.002,.0,.2548);
    add(hd,new T.CircleGeometry(.0105,12),new T.MeshBasicMaterial({color:'#ffffff'}),s*.1+.011,.013,.2554);add(hd,new T.CircleGeometry(.005,10),new T.MeshBasicMaterial({color:'#ffffff'}),s*.1-.008,-.012,.2554);
    const lash=add(hd,new T.TorusGeometry(.049,.0075,6,18,Math.PI*.95),M('#0d0806'),s*.1,.004,.2552);lash.rotation.z=Math.PI/2-Math.PI*.475;
    const fl=add(hd,new T.BoxGeometry(.03,.006,.006),M('#0d0806'),s*.1+s*.049,.03,.2552);fl.rotation.z=s*.55;
    const br=add(hd,new T.TorusGeometry(.058,.0055,6,14,Math.PI*.5),M('#3a2418'),s*.1,.092,.262);br.rotation.z=Math.PI/2-Math.PI*.25+s*.1;
    add(hd,new T.BoxGeometry(.012,.014,.3),black,s*.19,-.005,.12);
    const bm=add(hd,new T.PlaneGeometry(.12,.12),new T.MeshBasicMaterial({map:bl,transparent:true,depthWrite:false}),s*.15,-.07,.248);bm.rotation.y=s*.4});
  add(hd,new T.BoxGeometry(.05,.012,.012),black,0,.012,.274);
  add(hd,new T.SphereGeometry(.014,10,8),M('#dba97f'),0,-.052,.272).scale.set(1,.9,.9);
  add(hd,new T.SphereGeometry(.021,12,8),M('#c9505e',{roughness:.35}),0,-.108,.264).scale.set(1.6,.42,.5);
  add(hd,new T.SphereGeometry(.019,12,8),M('#e0747f',{roughness:.35}),0,-.121,.262).scale.set(1.35,.5,.5);
  // 腿與靴子
  const legs=[-1,1].map(s=>{const p=new T.Group();p.position.set(s*.085,.62,0);g.add(p);add(p,new T.CylinderGeometry(.037,.031,.4,10),skin,0,-.2,0);
    const bw=new T.Group(),bb=new T.Group();p.add(bw,bb);const WM=M('#fbfbfb',{roughness:.5}),WS=M('#b8bec7'),BM=M('#17171b',{roughness:.45}),BS=M('#2c2c33',{roughness:.5}),BE=M('#5a5b66');
    add(bw,new T.CylinderGeometry(.056,.05,.22,14),WM,0,-.48,0);add(bw,new T.TorusGeometry(.055,.012,6,16),lace,0,-.37,0).rotation.x=Math.PI/2;add(bw,new T.BoxGeometry(.105,.07,.2),WM,0,-.58,.04);add(bw,new T.BoxGeometry(.11,.02,.215),WS,0,-.62,.04);
    add(bb,new T.CylinderGeometry(.062,.057,.22,14),BM,0,-.48,0);add(bb,new T.BoxGeometry(.115,.075,.215),BM,0,-.56,.045);add(bb,new T.BoxGeometry(.125,.065,.235),BS,0,-.61,.045);add(bb,new T.BoxGeometry(.127,.012,.238),BE,0,-.575,.045);
    bw.visible=boots!=='black';bb.visible=boots==='black';p.userData={bw,bb};return p});
  g.userData={legs,arms,hd};
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});
  return g;
}
function w3Dog(){
  const T=THREE,g=new T.Group(),M=(c)=>new T.MeshStandardMaterial({color:c,roughness:.6}),K=M('#1d1713'),TN=M('#b06a32');
  const add=(p,geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;p.add(m);return m};
  add(g,new T.BoxGeometry(.6,.26,.24),K,0,.42,0);add(g,new T.BoxGeometry(.2,.2,.22),TN,.22,.36,0);
  const hd=new T.Group();hd.position.set(.38,.58,0);g.add(hd);add(hd,new T.BoxGeometry(.2,.17,.17),K,0,0,0);add(hd,new T.BoxGeometry(.16,.09,.11),TN,.14,-.03,0);add(hd,new T.BoxGeometry(.03,.03,.04),M('#000'),.23,-.01,0);
  [-1,1].forEach(s=>{const e=add(hd,new T.ConeGeometry(.05,.15,4),K,-.04,.14,s*.07);e.rotation.x=s*.15;add(hd,new T.SphereGeometry(.015,6,4),M('#fff'),.08,.03,s*.075)});
  const tail=add(g,new T.CylinderGeometry(.015,.03,.2,5),K,-.33,.55,0);tail.rotation.z=.9;
  const legs=[[.2,.1],[.2,-.1],[-.2,.1],[-.2,-.1]].map(([x,z])=>{const p=new T.Group();p.position.set(x,.32,z);g.add(p);add(p,new T.BoxGeometry(.06,.3,.06),K,0,-.16,0);add(p,new T.BoxGeometry(.07,.06,.07),TN,0,-.3,0);return p});
  g.userData={legs,hd,tail};return g;
}

/* ---- 引擎 ---- */
function w3Overlay(){
  let el=document.getElementById('w3');if(el)return el;
  el=document.createElement('div');el.id='w3';el.hidden=true;
  el.innerHTML=`<div class="w3-load">正在走進去…</div><canvas class="w3-cv"></canvas><div class="w3-vig"></div>
  <header class="w3-top"><button class="w3-back" id="w3back" title="返回小鎮 (Esc)" aria-label="返回小鎮">‹</button><div><h2></h2><p></p></div></header>
  <nav class="w3-side"><button id="w3jump" title="跳 (空白鍵)" aria-label="跳"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d='M12 19V6'/><path d='M6 11l6-6 6 6'/><path d='M7 21h10'/></svg></button><button id="w3roll" title="翻滾 (F)" aria-label="翻滾"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d='M20 12a8 8 0 1 1-3-6.2'/><path d='M20 4v5h-5'/></svg></button><button id="w3orb" title="360° 環景 (O / 拖曳)" aria-label="環景"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx='12' cy='12' rx='9' ry='4'/><path d='M12 3v18'/><circle cx='12' cy='12' r='9'/></svg></button><button id="w3snd" title="音景" aria-label="音景"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg></button></nav>
  <button class="w3-nbtn" aria-label="今日便條" aria-expanded="false">📜 今日便條 <b></b></button><aside class="w3-note"></aside><div class="w3-prompt" hidden></div>
  <div class="w3-frame"><i></i><i></i><i></i><i></i></div><div class="w3-hint">WASD 走動 · 空白鍵 跳 · F 翻滾 · 拖曳／Q·R 環視 360° · O 自動環景 · 滾輪縮放 · 小心尿布炸彈，可以跳過去！</div>
  <div class="w3-joy" hidden><i></i></div><div class="w3-touch" hidden><button id="w3tj">跳</button><button id="w3tr">翻滾</button></div><button class="w3-act" hidden>互動</button>`;
  document.body.appendChild(el);return el;
}
function w3Prompt(txt,key){const p=document.querySelector('#w3 .w3-prompt');if(!p)return;if(txt){p.hidden=false;const h=(key?`<kbd>${key}</kbd>`:'')+esc(txt);if(p.dataset.h!==h){p.dataset.h=h;p.innerHTML=h}}else p.hidden=true}
function w3Label(txt,done){return w3Tex(256,64,(g,w,h)=>{g.save();g.translate(w/2,h/2);g.rotate(-.02);const M0=MAPTH[STYLE];g.fillStyle=done?mixc(M0.lab,'#b9e3c4',.6):M0.lab;g.strokeStyle=M0.labs;g.lineWidth=STYLE==='b'?2:3;g.beginPath();g.roundRect(-w/2+8,-h/2+10,w-16,h-22,10);g.fill();g.stroke();g.fillStyle=M0.labt;g.font='700 23px "Noto Serif TC","PingFang TC","Microsoft JhengHei",serif';g.textAlign='center';g.textBaseline='middle';g.fillText((done?'✓ ':'')+txt,0,1);g.restore()})}
const w3Short=t=>{t=t.replace(/（.*?）/g,'');return t.length>11?t.slice(0,10)+'…':t};
async function w3Enter(id,from){
  const L=locOf(id);if(!L||W3.open)return;if(isLocked(id)){w3Paywall(id);return}W3.from=from||null;
  const el=w3Overlay();el.hidden=false;el.classList.add('loading');document.body.classList.add('w3on');
  W3.open=id;
  try{await w3Load()}catch(e){toast('無法載入 3D 引擎，請檢查網路');w3Close();return}
  if(W3.open!==id)return;
  w3Build(L,el);el.classList.remove('loading');
  if(id!=='town'&&!RO)visitLoc(id);
  w3Refresh();
}
const W3TH={m:{hemi:1.2,sun:1.25,key:1.0,sky:.5,fog:.5,fogm:.6,paint:0,ksc:1,sat:1.0,lift:.05,grain:.05,vig:.14,wob:0,tint:[1,.96,.9],edge:.75,poster:9}};
function w3ApplyTheme(){const st=W3.st;if(!st)return;const t=W3TH[STYLE],u=st.pm.uniforms;u.paint.value=t.paint;u.ksc.value=t.ksc;u.sat.value=t.sat;u.lift.value=t.lift;u.grain.value=t.grain;u.vig.value=t.vig;u.wob.value=t.wob;u.tint.value.set(...t.tint);u.edge.value=t.edge;u.poster.value=t.poster;if(st.halo)st.halo.visible=STYLE==='m'}
function w3Build(L,el){
  const T=THREE;T.ColorManagement.legacyMode=false;const TT=W3TH[STYLE];
  const cv=el.querySelector('.w3-cv');
  const R=new T.WebGLRenderer({canvas:cv,antialias:!W3COARSE(),preserveDrawingBuffer:false,powerPreference:'high-performance'});
  R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.NoToneMapping;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  const SC=new T.Scene(),cols=[];W3.cols=cols;
  const H=w3Helpers(SC,cols),cfg=W3S[L.id](H);
  const col=h=>new T.Color(h),dk=(h,k)=>new T.Color(h).lerp(new T.Color('#140c06'),k),lt=(h,k)=>new T.Color(h).lerp(new T.Color('#fff4dc'),k);
  // 天空
  const sky=new T.Mesh(new T.SphereGeometry(90,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{t:{value:lt(cfg.sky[0],TT.sky)},b:{value:lt(cfg.sky[1],TT.sky-.05)}},vertexShader:'varying float y;void main(){y=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 t;uniform vec3 b;varying float y;void main(){vec3 c=mix(b,t,smoothstep(-.05,.65,y));gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}'}));SC.add(sky);
  SC.fog=new T.FogExp2(lt(cfg.fog[0],TT.fog),cfg.fog[1]*TT.fogm);
  SC.add(new T.HemisphereLight(col(cfg.hemi[0]),col(cfg.hemi[1]),cfg.hemi[2]*TT.hemi));
  const sun=new T.DirectionalLight(col('#fff1d6'),cfg.sun[1]*TT.sun);sun.position.set(...cfg.sun[2]);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);const sc=sun.shadow.camera;sc.left=-14;sc.right=14;sc.top=14;sc.bottom=-14;sc.near=1;sc.far=40;sun.shadow.bias=-.0005;sun.shadow.normalBias=.03;SC.add(sun,sun.target);const key=new T.PointLight('#ffe2b0',TT.key,11,1.5);SC.add(key);
  // 角色
  const lucy=w3保母(W3.bootsLocal||S.rpg.boots||'white');const piv=new T.Group();piv.rotation.order='YXZ';lucy.position.y=-.78;piv.add(lucy);SC.add(piv);
  const dog=w3Dog();SC.add(dog);
  const halo=new T.Group();{const rg=new T.Mesh(new T.RingGeometry(.6,.65,72),new T.MeshBasicMaterial({color:'#d4a53a',side:T.DoubleSide,transparent:true,opacity:.95,depthWrite:false,fog:false})),dg=new T.Mesh(new T.CircleGeometry(.6,48),new T.MeshBasicMaterial({color:'#f6e2a0',side:T.DoubleSide,transparent:true,opacity:.32,depthWrite:false,fog:false})),r2=new T.Mesh(new T.RingGeometry(.7,.715,72),new T.MeshBasicMaterial({color:'#d4a53a',side:T.DoubleSide,transparent:true,opacity:.6,depthWrite:false,fog:false}));halo.add(rg,dg,r2);halo.visible=STYLE==='m';SC.add(halo)}
  const P={y:0,vy:0,roll:0,x:cfg.spawn[0],z:cfg.spawn[1],ry:0,vx:0,vz:0,t:0,mv:0,target:null};piv.position.set(P.x,.78,P.z);dog.position.set(P.x-1,0,P.z+.5);
  // 光點（今日任務）
  const LS=new T.Scene();
  const qs=L.tasks.map(id=>dailyList().find(q=>q.id===id)).filter(Boolean);W3.orbs=[];
  qs.forEach((q,i)=>{const [ox,oz]=cfg.orb[i%cfg.orb.length],g=new T.Group();g.position.set(ox,0,oz);SC.add(g);
    const core=new T.Mesh(new T.SphereGeometry(.2,20,16),new T.MeshStandardMaterial({color:'#fff1cf',emissive:'#ffb347',emissiveIntensity:2.4,roughness:.2}));core.position.y=1.15;g.add(core);
    const ring=new T.Mesh(new T.TorusGeometry(.38,.015,8,40),new T.MeshBasicMaterial({color:'#ffd08a',transparent:true,opacity:.7}));ring.position.y=1.15;g.add(ring);
    const ring2=new T.Mesh(new T.TorusGeometry(.38,.01,8,40),new T.MeshBasicMaterial({color:'#ffd08a',transparent:true,opacity:.45}));ring2.position.y=1.15;g.add(ring2);
    const halo=H.halo(ox,1.15,oz,'#ffb347',2.2,.75);
    const base=new T.Mesh(new T.CircleGeometry(.7,32),new T.MeshBasicMaterial({color:'#ffb347',transparent:true,opacity:.28,blending:T.AdditiveBlending,depthWrite:false}));base.rotation.x=-Math.PI/2;base.position.y=.03;g.add(base);
    const lab=new T.Sprite(new T.SpriteMaterial({map:w3Label(w3Short(q.t),false),transparent:true,depthTest:false}));lab.scale.set(1.75,.43,1);lab.position.set(ox,1.95,oz);lab.renderOrder=9;LS.add(lab);
    const sunL=new T.PointLight('#ffb347',.8,5,1.6);sunL.position.y=1.2;g.add(sunL);
    W3.orbs.push({q,x:ox,z:oz,g,core,ring,ring2,halo,lab,base,light:sunL,done:null})});
  W3.props=(cfg.props||[]).map(pp=>{
    const lab=new T.Sprite(new T.SpriteMaterial({map:w3Label(pp.label,false),transparent:true,depthTest:false}));lab.scale.set(2.1,.48,1);lab.position.set(pp.x,pp.ly||2.45,pp.z);lab.renderOrder=9;LS.add(lab);
    const hit=new T.Mesh(new T.BoxGeometry(...(pp.hitW||[1.1,1.3,1.1])),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(pp.x,pp.hitW?1.3:1.4,pp.z-.2);SC.add(hit);
    return{...pp,q:{t:pp.prompt||pp.label},lab,hit,onUse:pp.onUse||w3Thermos}});
  if(W3.props.some(x=>x.led))w3ThermosLed();
  W3.bb=cfg.babies?{next:2.4,who:{boy:{cry:0},girl:{cry:0}}}:null;W3.flow=cfg.babies?{s:0,key:null,ml:0}:null;if(cfg.babies)w3CryCtx();w3FlowHud();
  // 粒子
  const N=140,pg=new T.BufferGeometry(),pos=new Float32Array(N*3),vel=[];for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*26;pos[i*3+1]=.3+Math.random()*5;pos[i*3+2]=(Math.random()-.5)*22;vel.push([(Math.random()-.5)*.2,.05+Math.random()*.15,(Math.random()-.5)*.2])}
  pg.setAttribute('position',new T.BufferAttribute(pos,3));const pts=new T.Points(pg,new T.PointsMaterial({color:cfg.dust,size:.12,map:H.glowTex(),transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.9}));SC.add(pts);
  const notes=cfg.notes?H.noteSprites(12,cfg.notes):[];
  const cam=new T.PerspectiveCamera(48,1,.1,200);
  const pw=Math.max(2,Math.round(el.clientWidth*R.getPixelRatio())),ph=Math.max(2,Math.round(el.clientHeight*R.getPixelRatio()));
  const rt=new T.WebGLRenderTarget(pw,ph,{samples:4,type:T.HalfFloatType,minFilter:T.LinearFilter,magFilter:T.LinearFilter});
  const pm=new T.ShaderMaterial({uniforms:{tD:{value:rt.texture},res:{value:new T.Vector2(pw,ph)},time:{value:0},ex:{value:cfg.ex||1},paint:{value:TT.paint},ksc:{value:TT.ksc},sat:{value:TT.sat},lift:{value:TT.lift},grain:{value:TT.grain},vig:{value:TT.vig},wob:{value:TT.wob},edge:{value:TT.edge},poster:{value:TT.poster},tint:{value:new T.Vector3(...TT.tint)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
uniform sampler2D tD;uniform vec2 res;uniform float time;uniform float ex;uniform float paint;uniform float ksc;uniform float sat;uniform float lift;uniform float grain;uniform float vig;uniform float wob;uniform float edge;uniform float poster;uniform vec3 tint;varying vec2 vUv;
float lum(vec3 v){return dot(v,vec3(.299,.587,.114));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void quad(vec2 uv,vec2 sg,float sc,out vec3 mean,out float vr){vec3 sm=vec3(0.),sq=vec3(0.);for(int j=0;j<4;j++){for(int i=0;i<4;i++){vec3 c=texture2D(tD,uv+vec2(float(i),float(j))*sg*sc/res).rgb;sm+=c;sq+=c*c;}}sm/=16.;sq/=16.;vec3 v=sq-sm*sm;mean=sm;vr=v.r+v.g+v.b;}
void main(){
 float sc=max(1.,res.y/760.);
 vec2 w=(vec2(noise(vUv*res/(20.*sc)),noise(vUv*res/(20.*sc)+9.1))-.5)*wob*sc/res;
 vec2 uv=vUv+w;
 vec3 c=texture2D(tD,uv).rgb;
 if(paint>.01){
  vec3 m0,m1,m2,m3;float v0,v1,v2,v3;float s2=sc*ksc;
  quad(uv,vec2(-1.,-1.),s2,m0,v0);quad(uv,vec2(1.,-1.),s2,m1,v1);quad(uv,vec2(-1.,1.),s2,m2,v2);quad(uv,vec2(1.,1.),s2,m3,v3);
  vec3 k=m0;float v=v0;if(v1<v){k=m1;v=v1;}if(v2<v){k=m2;v=v2;}if(v3<v){k=m3;v=v3;}
  c=mix(c,k,paint);
 }
 float eV=0.;
 if(edge>.01){vec2 dd=vec2(1.4*sc)/res;float a=lum(texture2D(tD,uv+vec2(dd.x,0.)).rgb),b=lum(texture2D(tD,uv-vec2(dd.x,0.)).rgb),cc=lum(texture2D(tD,uv+vec2(0.,dd.y)).rgb),d2=lum(texture2D(tD,uv-vec2(0.,dd.y)).rgb);float e=(abs(a-b)+abs(cc-d2))/(lum(c)+.3);eV=smoothstep(.3,.85,e)*edge;}
 c*=1.12*ex;
 vec3 col=pow(aces(c),vec3(1./2.2));
 float l=dot(col,vec3(.299,.587,.114));
 col=mix(vec3(l),col,sat);
 col=col*(1.-lift)+lift*vec3(1.,.97,.92);
 if(poster>1.){col=mix(col,floor(col*poster+.5)/poster,.5);}
 col=mix(col,vec3(.24,.15,.1),eV*.85);
 float n1=noise(vUv*res/(7.*sc)),n2=noise(vUv*res/(2.2*sc)+3.3);
 col*=1.-grain+n1*grain+(n2-.5)*grain;
 float vg=smoothstep(1.05,.3,length((vUv-.5)*vec2(res.x/res.y,1.)));col*=mix(1.-vig,1.,vg);
 col*=tint;
 gl_FragColor=vec4(col,1.);
}`,depthTest:false,depthWrite:false});
  const post=new T.Scene();post.add(new T.Mesh(new T.PlaneGeometry(2,2),pm));const postCam=new T.OrthographicCamera(-1,1,1,-1,0,1);
  const st={R,S:SC,LS,halo,piv,front:H.front,cam,rt,pm,post,postCam,key,lucy,dog,P,cfg,pts,pos,vel,notes,sun,yaw:0,pitch:cfg.cam.pitch,dist:cfg.cam.dist*.85,cols,bursts:[],dia:[],stains:[],diaT:3+Math.random()*3,t:0,L,lastT:performance.now()};
  W3.st=st;w3ApplyQ(st,W3COARSE()?1:2);
  if(cfg.guide){const np=(W3.props||[]).find(p=>p.id==='nurse');if(np){st.P.target={x:np.x*.88,z:np.z*.88};w3TownGuideHud(true)}}else w3TownGuideHud(false);
  el.querySelector('.w3-top h2').textContent=L.n;el.querySelector('.w3-top p').textContent=L.en+' · '+L.tag;{const tp=el.querySelector('.w3-top>div');if(tp){tp.classList.remove('gone');clearTimeout(W3.tt);W3.tt=setTimeout(()=>tp.classList.add('gone'),3500)}}
  w3Size();w3Bind(el);W3.raf=requestAnimationFrame(w3Frame);
}
const W3COARSE=()=>{try{return matchMedia('(pointer:coarse)').matches||window.innerWidth<700}catch(e){return false}};
function w3ApplyQ(st,q){st.q=q;const R=st.R,dpr=window.devicePixelRatio||1;R.setPixelRatio(q>=2?Math.min(2,dpr):q===1?Math.min(1.25,dpr):1);const on=q>0;R.shadowMap.enabled=on;
  if(st.sun){st.sun.castShadow=on;const ms=q>=2?1536:1024;if(st.sun.shadow.mapSize.x!==ms){st.sun.shadow.mapSize.set(ms,ms);if(st.sun.shadow.map){st.sun.shadow.map.dispose();st.sun.shadow.map=null}}}
  st.S.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)});w3Size()}
function w3Size(){const st=W3.st;if(!st)return;const el=document.getElementById('w3'),w=el.clientWidth,h=el.clientHeight;st.R.setSize(w,h,false);const dp=st.R.getPixelRatio();st.rt.setSize(Math.round(w*dp),Math.round(h*dp));st.pm.uniforms.res.value.set(Math.round(w*dp),Math.round(h*dp));st.cam.aspect=w/h;st.cam.fov=st.fov0=w<700?58:48;st.cam.updateProjectionMatrix()}
function w3Interact(o){
  if(o.onUse){o.onUse();return}
  if(o.q&&o.q.id==='bm_wash'){w3Wash();return}
  const q=o.q,d=TK(),stt=qState(q,d);
  if(RO){toast('唯讀檢視：只有擁有者可以完成任務');return}
  if(stt.kind==='manual')qAct('tick',q.id);
  else if(stt.kind==='counter'){if(stt.done)toast('今天已經達標了');else qAct('cnt',q.id,q.counter.steps[0])}
  else if(stt.kind==='flag')toast('複製「今日回報」後會自動完成');
  else if(stt.kind==='auto')toast(stt.done?'已完成':'這項由紀錄自動計算，請到儀表板記錄');
}
function w3DiaMesh(){
  const T=THREE,g=new T.Group(),mw=(c,r)=>new T.MeshStandardMaterial({color:c,roughness:r||.8});
  const b=new T.Mesh(new T.SphereGeometry(.34,16,10),mw('#fbf6ea'));b.scale.set(1,.34,.82);b.castShadow=true;g.add(b);
  [-1,1].forEach(s=>{const t=new T.Mesh(new T.BoxGeometry(.16,.03,.1),mw('#8fb7c9'));t.position.set(s*.33,.08,0);g.add(t)});
  const bw=mw('#6b3f1f',.5);[[0,.17,0,.15],[0,.28,0,.115],[0,.37,0,.075]].forEach(a=>{const m=new T.Mesh(new T.SphereGeometry(a[3],12,8),bw);m.scale.y=.7;m.position.set(a[0],a[1],a[2]);m.castShadow=true;g.add(m)});
  return g}
function w3DiaSpawn(st){
  const b=st.cfg.bounds,P=st.P;
  for(let k=0;k<30;k++){
    let x,z;if(b.r){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*(b.r-1.5);x=Math.cos(a)*r;z=Math.sin(a)*r}else{x=(Math.random()-.5)*(b.w-2.5);z=(Math.random()-.5)*(b.d-2.5)}
    if(Math.hypot(x-P.x,z-P.z)<2.5||Math.hypot(x-P.x,z-P.z)>11)continue;
    if(st.cols.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+.8))continue;
    if((W3.orbs||[]).some(o=>Math.hypot(x-o.x,z-o.z)<1.4))continue;
    const m=w3DiaMesh();m.position.set(x,0,z);m.rotation.y=Math.random()*6.28;m.scale.setScalar(.01);st.S.add(m);st.dia.push({m,x,z,age:0,life:22+Math.random()*10});return}
}
function w3DiaToast(msg){
  const el=document.getElementById('w3');if(!el)return;let t=el.querySelector('.w3-toast');
  if(!t){t=document.createElement('div');t.className='w3-toast';el.appendChild(t)}
  t.textContent=msg;t.classList.remove('on');void t.offsetWidth;t.classList.add('on')}
function w3Splat(){
  const el=document.getElementById('w3');if(!el)return;const d=document.createElement('div');d.className='w3-splat';
  let h='';for(let i=0;i<9;i++){const x=10+Math.random()*80,y=12+Math.random()*76,r=40+Math.random()*90;h+=`radial-gradient(circle at ${x}% ${y}%,#6b3f1fe6 0,#7a4a24dd ${r*.45}px,#7a4a2400 ${r}px)${i<8?',':''}`}
  d.style.background=h;el.appendChild(d);setTimeout(()=>d.remove(),4200)}
function w3DiaUpdate(st,dt){
  const P=st.P,T=THREE;
  st.diaT-=dt;if(st.diaT<=0){st.diaT=7+Math.random()*8;if(st.dia.length<3)w3DiaSpawn(st)}
  for(let i=st.dia.length-1;i>=0;i--){const d=st.dia[i];d.age+=dt;
    const sc=Math.min(1,d.age*3)*(d.age>d.life-1.5?Math.max(0,(d.life-d.age)/1.5):1);d.m.scale.setScalar(Math.max(.01,sc));d.m.position.y=Math.abs(Math.sin(st.t*3+i))*.04+(d.age<.4?(1-d.age/.4)*.8:0);d.m.rotation.y+=dt*.8;
    if(d.age>d.life){st.S.remove(d.m);st.dia.splice(i,1);continue}
    if(d.age>.5&&Math.hypot(P.x-d.x,P.z-d.z)<.75){
      if(P.y>.55){if(!d.jumped){d.jumped=1;w3DiaToast('跳過了！閃過一顆大便炸彈 ✨');w3Chime()}continue}
      st.S.remove(d.m);st.dia.splice(i,1);
      for(let k=0;k<3;k++)w3Burst(d.x,.4+k*.35,d.z,'#8a5a2b');
      w3Splat();w3DiaToast('💥 啊！被嬰兒大便炸到了！');
      const bm=new T.MeshStandardMaterial({color:'#6b3f1f',roughness:.5});
      for(let k=0;k<7;k++){const m=new T.Mesh(new T.SphereGeometry(.03+Math.random()*.035,8,6),bm);m.scale.z=.4;const a=Math.random()*6.28,y=-.3+Math.random()*1.1;m.position.set(Math.sin(a)*.2,y,Math.cos(a)*.2);st.piv.add(m);st.stains.push({m,exp:st.t+14})}
      const U=st.lucy.userData;if(U.hd)U.hd.rotation.z=.25;setTimeout(()=>{if(U.hd)U.hd.rotation.z=0},900)}
  }
  for(let i=st.stains.length-1;i>=0;i--)if(st.t>st.stains[i].exp){st.piv.remove(st.stains[i].m);st.stains.splice(i,1)}
}
function w3Burst(x,y,z,color){
  const st=W3.st,T=THREE,n=36,g=new T.BufferGeometry(),p=new Float32Array(n*3),v=[];for(let i=0;i<n;i++){p[i*3]=x;p[i*3+1]=y;p[i*3+2]=z;const a=Math.random()*6.28,e=Math.random()*3+1;v.push([Math.cos(a)*e,Math.random()*3+1,Math.sin(a)*e])}
  g.setAttribute('position',new T.BufferAttribute(p,3));const m=new T.PointsMaterial({color,size:.18,map:st.pts.material.map,transparent:true,depthWrite:false,blending:T.AdditiveBlending});const o=new T.Points(g,m);st.S.add(o);st.bursts.push({o,v,t:0,g});
}
function w3Refresh(){
  if(!W3.open)return;const el=document.getElementById('w3');if(!el)return;const L=locOf(W3.open),d=TK();
  const rows=L.tasks.map(id=>dailyList().find(q=>q.id===id)).filter(Boolean),got=(S.rpg.visits[d]||{})[L.id];
  const pn=el.querySelector('.w3-note');
  if(L.id==='town'){const V=S.rpg.visits[d]||{};pn.innerHTML=`<i class="tape"></i><div class="w3t-h"><small>小鎮導覽</small><b>${esc(L.n)}</b><span class="ok">今日走訪 ${Object.keys(V).length}/${LOCS.length}</span></div><p>${esc(L.desc)}</p>${LOCS.map(l=>{const q=l.tasks.map(id=>dailyList().find(x=>x.id===id)).filter(Boolean),dn=q.filter(x=>qState(x,d).done).length;return`<div class="tnr ${V[l.id]?'got':''}"><b>${esc(l.n)}</b><span>${isLocked(l.id)?'🔒 付費解鎖':(V[l.id]?'✓ ':'')+'任務 '+dn+'/'+q.length}</span></div>`}).join('')}`;return}
  pn.innerHTML=`<i class="tape"></i><div class="w3t-h"><small>今日便條</small><b>${esc(L.n)}</b>${got?'<span class="ok">今天來過了 ✓</span>':''}</div><p>${esc(L.desc)}</p>${rows.map(q=>taskRow(q,d)).join('')||'<div class="hint">今天沒有對應的任務。</div>'}${L.go?`<button class="nbtn" data-qa="go" data-go="${L.go}">${esc(L.goT)} ›</button>`:''}`;
  bindQ(pn);{const nb=el.querySelector('.w3-nbtn');if(nb){const dn=rows.filter(q=>qState(q,d).done).length;nb.querySelector('b').textContent=rows.length?dn+'/'+rows.length:'';nb.classList.toggle('all',rows.length>0&&dn===rows.length)}}
  (W3.orbs||[]).forEach(o=>{const done=qState(o.q,d).done;if(o.done!==done){if(o.done!==null&&done&&W3.st)w3Burst(o.x,1.15,o.z,'#ffd9a0');o.done=done;
      o.lab.material.map=w3Label(w3Short(o.q.t),done);o.lab.material.needsUpdate=true;o.core.material.emissive.set(done?'#6fae6a':'#ffb347');o.core.material.emissiveIntensity=done?.9:2.4;o.halo.material.opacity=done?.35:.75;o.base.material.opacity=done?.12:.28;o.light.intensity=done?.2:.8}});
}
function w3Exit(){const f=W3.from;W3.from=null;w3Close();if(f==='town')w3Enter('town')}
function w3Close(){
  const el=document.getElementById('w3');cancelAnimationFrame(W3.raf);W3.open=null;
  if(W3.st){const st=W3.st;st.S.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}});st.LS.traverse(o=>{if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});st.rt.dispose();st.pm.dispose();st.R.dispose();W3.st=null}
  if(W3.audio){try{clearInterval(W3.audio.tm);W3.audio.ctx.close()}catch(e){}W3.audio=null}W3.snd=false;W3.keys={};W3.joy.x=W3.joy.y=0;W3.orbit=false;
  w3HandsClose();  W3.flow=null;w3FlowHud();w3ThermosClose();if(el){el.hidden=true}document.body.classList.remove('w3on');W3.orbs=[];W3.props=[];W3.bb=null;W3.cut=null;w3CapOff();
}
/* ---- 背景音樂：德布西〈月光〉（簡化改編，Web Audio 合成鋼琴音色，反覆播放） ---- */
const CL_E=.42,CL_CH=[[37,[0,7,12,16,19]],[42,[0,7,12,16,19]],[44,[0,7,12,16,22]],[46,[0,7,12,15,19]],[42,[0,7,12,16,19]],[44,[0,7,12,16,22]],[37,[0,7,12,16,19]],[44,[0,7,12,16,22]]];
const CL_ROOT=[37,42,37,46,42,44,37,44],CL_MEL=[
 [[77,0,3],[75,3,1.5],[73,4.5,1.5],[72,6,3]],[[73,0,3],[70,3,3],[68,6,3]],[[68,0,1.5],[73,1.5,1.5],[77,3,3],[80,6,3]],[[78,0,3],[77,3,1.5],[75,4.5,1.5],[73,6,3]],
 [[70,0,3],[73,3,1.5],[75,4.5,1.5],[77,6,3]],[[75,0,4.5],[72,4.5,1.5],[70,6,3]],[[73,0,3],[68,3,3],[65,6,3]],[[73,0,9]]];
function w3PianoNote(c,dest,m,t,dur,vel){const f=440*Math.pow(2,(m-69)/12),g=c.createGain(),o=c.createOscillator(),o2=c.createOscillator(),o3=c.createOscillator(),g2=c.createGain(),g3=c.createGain();
  o.type='sine';o.frequency.value=f;o2.type='triangle';o2.frequency.value=f*2.003;o3.type='sine';o3.frequency.value=f*3.01;g2.gain.value=.22;g3.gain.value=.07;
  const rel=Math.min(3.2,1.1+dur*.9);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vel,t+.012);g.gain.exponentialRampToValueAtTime(vel*.38,t+.35);g.gain.exponentialRampToValueAtTime(.0004,t+rel);
  o.connect(g);o2.connect(g2);g2.connect(g);o3.connect(g3);g3.connect(g);g.connect(dest);o.start(t);o2.start(t);o3.start(t);o.stop(t+rel+.05);o2.stop(t+rel+.05);o3.stop(t+rel+.05)}
function w3ClairLoop(c,dest,t0,E){E=E||CL_E;
  for(let b=0;b<8;b++){const bt=t0+b*9*E,ch=CL_CH[b];const pat=[0,1,2,3,4,3,2,1,2];pat.forEach((k,i)=>w3PianoNote(c,dest,ch[0]+ch[1][k],bt+i*E,E*1.6,i===0?.085:.05));
    CL_MEL[b].forEach(([m,s0,len])=>w3PianoNote(c,dest,m,bt+s0*E,len*E,.13));
    if(b%2===0)w3PianoNote(c,dest,CL_ROOT[b]-12,bt,9*E,.07)}
  return 8*9*E}
function w3Audio(on){
  if(!on){if(W3.audio){W3.audio.master.gain.linearRampToValueAtTime(0,W3.audio.ctx.currentTime+.4)}return}
  if(W3.audio){W3.audio.master.gain.linearRampToValueAtTime(.75,W3.audio.ctx.currentTime+.6);return}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ctx=new AC(),master=ctx.createGain();master.gain.value=0;
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3800;master.connect(lp);lp.connect(ctx.destination);
  const rv=ctx.createConvolver(),n=Math.floor(ctx.sampleRate*2.6),ib=ctx.createBuffer(2,n,ctx.sampleRate);for(let ch=0;ch<2;ch++){const d=ib.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}rv.buffer=ib;const wet=ctx.createGain();wet.gain.value=.38;const dry=ctx.createGain();dry.gain.value=.85;
  const bus=ctx.createGain();bus.connect(dry);bus.connect(rv);rv.connect(wet);dry.connect(master);wet.connect(master);
  let nxt=ctx.currentTime+.4;const pump=()=>{while(nxt<ctx.currentTime+8){const L=w3ClairLoop(ctx,bus,nxt);nxt+=L+1.2}};pump();const tm=setInterval(pump,2000);
  master.gain.linearRampToValueAtTime(.75,ctx.currentTime+1.5);W3.audio={ctx,master,tm};
}
/* ---- 熱水瓶：拉桿選水溫，低於 70°C 警告（WHO：沖泡嬰兒奶粉的水不可低於 70°C） ---- */
const TH_MIN=40,TH_MAX=100,TH_SAFE=70;
function w3ThermosLed(){const p=(W3.props||[]).find(x=>x.id==='thermos');if(!p||!p.led)return;const t=W3.temp==null?80:W3.temp,c=t<TH_SAFE?'#ff4d3a':t>=90?'#ffb23a':'#7be08a';p.led.material.color.set(c);p.led.material.emissive.set(c)}
function w3ThermosClose(){const d=document.getElementById('w3th');if(d)d.remove();W3.dlg=null}
function w3Thermos(){
  const el=document.getElementById('w3');if(!el||document.getElementById('w3th'))return;
  if(W3.temp==null)W3.temp=80;W3.dlg=1;W3.keys={};
  const d=document.createElement('div');d.id='w3th';d.className='w3-th';
  d.innerHTML=`<div class="thc" role="dialog" aria-label="熱水瓶"><button class="thx" aria-label="關閉">✕</button>
    <div class="tht"><small>HOT WATER</small><h3>熱水瓶 · 沖泡水溫</h3></div>
    <div class="thb"><div class="thlv" tabindex="0" role="slider" aria-label="水溫" aria-valuemin="${TH_MIN}" aria-valuemax="${TH_MAX}"><div class="thtrack"><i class="thzone z1"></i><i class="thzone z2"></i><i class="thzone z3"></i><b class="thmark"><em>70°</em></b><span class="thknob"></span></div></div>
    <div class="thr"><div class="thv"><b id="thN">80</b><sup>°C</sup></div><div class="thmsg" id="thM"></div></div></div>
    <p class="thf">拖曳拉桿（或用 ↑ ↓ 鍵）選擇水溫。沖泡嬰兒奶粉的水請維持在 70°C 以上，沖好後放涼到不燙手腕內側再餵。</p></div>`;
  el.appendChild(d);
  const lv=d.querySelector('.thlv'),tr=d.querySelector('.thtrack'),kn=d.querySelector('.thknob'),N=d.querySelector('#thN'),M=d.querySelector('#thM'),c=d.querySelector('.thc');
  const pct=t=>(t-TH_MIN)/(TH_MAX-TH_MIN);
  d.querySelector('.thmark').style.bottom=pct(TH_SAFE)*100+'%';
  d.querySelector('.z1').style.height=pct(TH_SAFE)*100+'%';d.querySelector('.z2').style.cssText=`bottom:${pct(TH_SAFE)*100}%;height:${(pct(90)-pct(TH_SAFE))*100}%`;d.querySelector('.z3').style.cssText=`bottom:${pct(90)*100}%;height:${(1-pct(90))*100}%`;
  let lastLow=null;
  const set=(t,quiet)=>{t=Math.max(TH_MIN,Math.min(TH_MAX,Math.round(t)));W3.temp=t;kn.style.bottom=pct(t)*100+'%';N.textContent=t;lv.setAttribute('aria-valuenow',t);
    const low=t<TH_SAFE;c.classList.toggle('bad',low);c.classList.toggle('hot',t>=90);
    M.innerHTML=low?`<b>⚠ 水溫太低！</b>低於 70°C <u>無法殺死病菌</u>（如阪崎腸桿菌、沙門氏菌），寶寶喝下後<b>可能引發嚴重的敗血症、腦膜炎</b>。請把水重新煮沸，再等到約 70°C 沖泡。`
      :t>=90?`<b class="ok">✓ 可殺菌</b>水很燙，注意燙傷；沖好後要放涼到約 37°C 才能餵。`
      :`<b class="ok">✓ 水溫足夠</b>70°C 以上，可以沖泡奶粉；沖好後放涼到約 37°C（滴在手腕內側不燙）再餵。`;
    if(low&&lastLow!==true&&!quiet){try{navigator.vibrate&&navigator.vibrate([80,60,80])}catch(e){}c.classList.remove('shk');void c.offsetWidth;c.classList.add('shk');w3Warn()}
    lastLow=low;w3ThermosLed()};
  const fromY=y=>{const r=tr.getBoundingClientRect();return TH_MIN+(1-Math.max(0,Math.min(1,(y-r.top)/r.height)))*(TH_MAX-TH_MIN)};
  let drag=false;lv.addEventListener('pointerdown',e=>{drag=true;lv.setPointerCapture(e.pointerId);lv.focus();set(fromY(e.clientY));e.preventDefault()});
  lv.addEventListener('pointermove',e=>{if(drag)set(fromY(e.clientY))});['pointerup','pointercancel'].forEach(n=>lv.addEventListener(n,()=>{drag=false}));
  lv.addEventListener('keydown',e=>{const k=e.key,st=e.shiftKey?10:1;if(k==='ArrowUp'||k==='ArrowRight'){set(W3.temp+st);e.preventDefault()}else if(k==='ArrowDown'||k==='ArrowLeft'){set(W3.temp-st);e.preventDefault()}else if(k==='Home'){set(TH_MIN);e.preventDefault()}else if(k==='End'){set(TH_MAX);e.preventDefault()}});
  d.querySelector('.thx').onclick=w3ThermosClose;d.addEventListener('pointerdown',e=>{if(e.target===d)w3ThermosClose()});
  set(W3.temp,true);setTimeout(()=>lv.focus(),30);
}
/* ---- 水槽：餵奶後 2 小時內初步清洗奶瓶（一鍵拆解 → 沖洗 → 刷洗） ---- */
const WP=[{k:'bottle',n:'奶瓶'},{k:'nipple',n:'奶嘴'},{k:'collar',n:'固定圈'}];
const WP_AS={bottle:[120,205,0],nipple:[120,126,0],collar:[120,150,0]},WP_EX={bottle:[318,215,0],nipple:[394,240,-8],collar:[462,232,10]};
function washFeedInfo(){
  const now=Date.now();let last=null;(S.feeds||[]).forEach(f=>{const t=new Date(f.t).getTime();if(!isNaN(t)&&t<=now&&(!last||t>last.t))last={t,s:f.t}});
  if(!last)return{cls:'none',html:'<b>還沒有餵奶紀錄</b>餵完奶後，請在 <u>2 小時內</u>初步清洗奶瓶。'};
  const m=Math.floor((now-last.t)/6e4),left=120-m,hh=last.s.slice(11,16),ago=m>=60?`${Math.floor(m/60)} 小時 ${m%60} 分鐘前`:`${m} 分鐘前`;
  if(left<=0)return{cls:'late',pct:100,html:`<b>⚠ 已超過 2 小時（上次餵奶 ${hh}，${ago}）</b>奶水中的油脂和蛋白質已經容易滋生細菌，請<u>立刻</u>清洗，並檢查奶瓶有沒有異味或殘留。`};
  return{cls:left<30?'warn':'ok',pct:Math.min(100,m/120*100),html:`<b>上次餵奶 ${hh}（${ago}）</b>請在 <u>${left} 分鐘</u>內初步清洗，以免奶水中的油脂和蛋白質滋生細菌。`};
}
function washSvg(){
  const O='stroke="#4a3426" stroke-width="2.4" stroke-linejoin="round"';
  const part={
   bottle:`<path d="M-14,-62 h28 v12 q18,6 18,26 v70 q0,10 -10,10 h-34 q-10,0 -10,-10 v-70 q0,-20 18,-26 z" fill="#f8f3e6" ${O}/><path d="M-26,-4 h52 v58 q0,6 -10,6 h-32 q-10,0 -10,-6 z" fill="#f6e7c4" opacity=".85"/><path d="M-26,-4 h52 M-26,16 h18 M-26,34 h18" stroke="#4a3426" stroke-width="1.4" fill="none"/><path d="M-14,-62 h28" stroke="#c49a3c" stroke-width="3"/>`,
   nipple:`<ellipse cy="14" rx="24" ry="6" fill="#f3d6a8" ${O}/><path d="M-17,14 q0,-26 17,-34 q17,8 17,34 z" fill="#f3c98f" ${O}/><rect x="-4" y="-34" width="8" height="14" rx="4" fill="#f3c98f" ${O}/>`,
   collar:`<path d="M-28,-12 h56 l-5,26 h-46 z" fill="#d9a24a" ${O}/><ellipse cy="-12" rx="28" ry="7" fill="#e8c27a" ${O}/><ellipse cy="-12" rx="14" ry="3.5" fill="#6b4a2e"/><path d="M-22,0 h44 M-24,8 h48" stroke="#4a3426" stroke-width="1.2" opacity=".5" fill="none"/>`,
};
  const tr=(k,pos)=>`translate(${pos[0]}px,${pos[1]}px) rotate(${pos[2]}deg)`;
  const order=['bottle','nipple','collar'];
  return`<svg viewBox="0 76 540 224" class="wsv" aria-label="奶瓶拆解示意">
   <rect x="262" y="96" width="268" height="196" rx="14" fill="#fbf8ee" stroke="#4a3426" stroke-width="2.4"/><rect x="270" y="104" width="252" height="180" rx="9" fill="none" stroke="#c49a3c" stroke-width="2"/><text x="396" y="116" text-anchor="middle" font-size="12" fill="#7a5f48" font-family="'Noto Serif TC',serif">乾淨的方形盤子</text>
   
   ${order.map((k,i)=>`<g class="wp" data-k="${k}" style="transform:${tr(k,WP_AS[k])};transition-delay:${[0,.14,.28][i]}s">${part[k]}<g class="wsp"><text x="-22" y="-30">✦</text><text x="14" y="-12">✦</text><text x="-4" y="30">✧</text></g></g>`).join('')}
   <g id="wFx"></g><g id="wBrush" style="transform:translate(60px,262px) rotate(-12deg)"><g class="bshake"><rect x="0" y="-5" width="96" height="10" rx="5" fill="#6fa8a0" stroke="#4a3426" stroke-width="2"/><rect x="92" y="-11" width="34" height="22" rx="9" fill="#8cc7bf" stroke="#4a3426" stroke-width="2"/><path d="M98,-8 v16 M105,-8 v16 M112,-8 v16 M119,-8 v16" stroke="#4a3426" stroke-width="1.4"/></g></g><text x="108" y="288" text-anchor="middle" font-size="11" fill="#7a5f48" font-family="'Noto Serif TC',serif">矽膠奶瓶刷</text>
  </svg>`;
}
function w3Wash(){
  const el=document.getElementById('w3');if(!el||document.getElementById('w3th'))return;
  W3.dlg=1;W3.keys={};
  const q=dailyList().find(x=>x.id==='bm_wash'),done0=q&&qState(q,TK()).done,info=washFeedInfo();
  const st={ex:false,w:{bottle:0,nipple:0,collar:0,ring:0}};
  const d=document.createElement('div');d.id='w3th';d.className='w3-th tw';
  d.innerHTML=`<div class="thc" role="dialog" aria-label="清洗奶瓶"><button class="thx" aria-label="關閉">✕</button>
   <div class="tht"><small>AFTER FEEDING</small><h3>奶瓶初步清洗</h3></div>
   <div class="wfeed ${info.cls}"><div class="wfm">${info.html}</div>${info.pct!=null?`<div class="wbar"><i style="width:${info.pct}%"></i><em>2 小時</em></div>`:''}</div>
   ${done0?'<div class="wdone">✓ 今天已完成初步清洗，可以再練習一次流程</div>':''}
   <div class="wst">${washSvg()}</div>
   <div class="wact"><button class="wbig" id="wEx">一鍵拆解</button></div>
   <div class="wchips" id="wCh" hidden>${WP.map(p=>`<button class="wchip" data-k="${p.k}"><b>${p.n}</b><span>未清洗</span></button>`).join('')}</div>
   <p class="wtip" id="wTip">把奶瓶、奶嘴和固定圈<b>完全拆開</b>，放在乾淨的方形盤子上，水槽才洗得到每一個縫隙。</p>
   <div class="wact"><button class="wbig fin" id="wFin" hidden>完成初步清洗</button></div></div>`;
  el.appendChild(d);
  const q$=s2=>d.querySelector(s2),parts={};d.querySelectorAll('.wp').forEach(g=>parts[g.dataset.k]=g);
  q$('.thx').onclick=w3ThermosClose;d.addEventListener('pointerdown',e=>{if(e.target===d)w3ThermosClose()});
  q$('#wEx').onclick=()=>{
    if(st.ex){st.ex=false;Object.keys(st.w).forEach(k=>{st.w[k]=0;parts[k].classList.remove('wet','clean')});WP.forEach(p=>{parts[p.k].style.transform=`translate(${WP_AS[p.k][0]}px,${WP_AS[p.k][1]}px) rotate(0deg)`});q$('#wEx').textContent='一鍵拆解';q$('#wCh').hidden=true;q$('#wFin').hidden=true;q$('#wTip').innerHTML='把奶瓶、奶嘴和固定圈<b>完全拆開</b>，放在乾淨的方形盤子上，水槽才洗得到每一個縫隙。';paintCh();return}
    st.ex=true;try{w3Chime()}catch(e){}
    WP.forEach(p=>{const e2=WP_EX[p.k];parts[p.k].style.transform=`translate(${e2[0]}px,${e2[1]}px) rotate(${e2[2]}deg)`});
    q$('#wEx').textContent='重新組裝';q$('#wCh').hidden=false;q$('#wTip').innerHTML='拆好了！先用<b>清水沖掉殘留奶水</b>，再用<b>矽膠奶瓶刷</b>刷洗每個零件：點一下沖洗，再點一下刷洗。';
  };
  const paintCh=()=>{d.querySelectorAll('.wchip').forEach(b=>{const v=st.w[b.dataset.k];b.className='wchip s'+v;b.querySelector('span').textContent=['未清洗','已沖洗 ✓','已刷洗 ✓✓'][v]});
    const all=WP.every(p=>st.w[p.k]===2);q$('#wFin').hidden=!(st.ex&&all);if(st.ex&&all)q$('#wTip').innerHTML='全部洗乾淨了。接著放進<b>奶瓶消毒鍋</b>消毒，再晾乾收好。'};
  const NS='http://www.w3.org/2000/svg',fx=q$('#wFx'),br=q$('#wBrush');let busy=false;
  const mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  async function rinse(k){const [x,y]=WP_EX[k];fx.innerHTML='';
    for(let i=0;i<9;i++){const dx=x-26+i*6.5;fx.appendChild(mk('path',{d:`M${dx},${y-96} v13`,class:'wdrop',style:`animation-delay:${(i%3)*.12}s`}))}
    fx.appendChild(mk('path',{d:`M${x-34},${y-100} h68`,stroke:'#cfd6dc','stroke-width':6,'stroke-linecap':'round',fill:'none'}));
    await wait(1100);fx.innerHTML=''}
  async function scrub(k){const [x,y]=WP_EX[k];
    br.style.transform=`translate(${x-104}px,${y-6}px) rotate(-8deg)`;await wait(450);br.classList.add('scrub');
    fx.innerHTML='';for(let i=0;i<11;i++){const c=mk('circle',{cx:x-26+Math.random()*52,cy:y-34+Math.random()*68,r:3+Math.random()*5,class:'wfoam',style:`animation-delay:${Math.random()*.9}s`});fx.appendChild(c)}
    await wait(1500);br.classList.remove('scrub');fx.innerHTML='';br.style.transform='translate(60px,262px) rotate(-12deg)'}
  d.querySelectorAll('.wchip').forEach(b=>b.onclick=async()=>{if(!st.ex||busy)return;const k=b.dataset.k;if(st.w[k]>=2)return;busy=true;d.classList.add('wbusy');
    if(st.w[k]===0){await rinse(k);st.w[k]=1;parts[k].classList.add('wet')}else{await scrub(k);st.w[k]=2;parts[k].classList.add('clean');try{w3Chime()}catch(e){}}
    busy=false;d.classList.remove('wbusy');if(document.getElementById('w3th')===d)paintCh()});
  q$('#wFin').onclick=()=>{w3FlowAdv('sink');
    if(RO){toast('唯讀展示：流程完成！（不會記錄任務）');w3ThermosClose();return}
    if(q&&!qState(q,TK()).done)qAct('tick','bm_wash');else toast('今天已經記錄過了');
    w3ThermosClose();try{w3Chime()}catch(e){}if(W3.st)w3Burst(W3.st.P.x,1.3,W3.st.P.z,'#bfe3df');
  };
  setTimeout(()=>q$('#wEx').focus(),30);
}
/* ---- 哺乳室：兩個寶寶（男／女）、隨機哭聲、拉桿選月齡與體重 → 當餐建議奶量 ---- */
const BB_MED={boy:[3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6],girl:[3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,8.9]};
const BB_KG=[150,150,150,140,130,125,120,110,100,95,90,85,80],BB_N=[8,8,7,6,6,5,5,4,4,4,4,4,4];
function feedCalc(m,kg){const daily=Math.min(960,kg*BB_KG[m]),n=BB_N[m],per=daily/n,r5=x=>Math.max(5,Math.round(x/5)*5);return{per:r5(per),lo:r5(per*.9),hi:r5(per*1.1),daily:Math.round(daily/10)*10,n,gap:Math.round(24/n*10)/10}}
function w3CryCtx(){try{if(!W3.cryCtx){const AC=window.AudioContext||window.webkitAudioContext;if(AC)W3.cryCtx=new AC()}if(W3.cryCtx&&W3.cryCtx.state==='suspended')W3.cryCtx.resume()}catch(e){}return W3.cryCtx}
function w3CryRender(c,t0,key,dest){
  const base=key==='girl'?520:440,out=c.createGain();out.gain.value=1.1;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;out.connect(lp);lp.connect(dest);
  const wail=(t,len,pk,vol,v1)=>{const o=c.createOscillator(),o2=c.createOscillator(),vib=c.createOscillator(),vg=c.createGain(),am=c.createOscillator(),ag=c.createGain(),g=c.createGain(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),m1=c.createGain(),m2=c.createGain(),src=c.createGain();
    o.type=o2.type='sawtooth';o2.detune.value=9;const au=p=>{p.setValueAtTime(base*.78,t);p.linearRampToValueAtTime(base*pk,t+len*.2);p.linearRampToValueAtTime(base*pk*.88,t+len*.62);p.linearRampToValueAtTime(base*.66,t+len)};au(o.frequency);au(o2.frequency);
    vib.frequency.value=5.8;vg.gain.value=base*.03;vib.connect(vg);vg.connect(o.frequency);vg.connect(o2.frequency);
    am.frequency.value=34;ag.gain.value=vol*.16;am.connect(ag);ag.connect(g.gain);
    f1.type=f2.type='bandpass';f1.Q.value=4;f2.Q.value=6;f1.frequency.setValueAtTime(v1*.8,t);f1.frequency.linearRampToValueAtTime(v1*1.25,t+len*.3);f1.frequency.linearRampToValueAtTime(v1,t+len);f2.frequency.setValueAtTime(2600,t);f2.frequency.linearRampToValueAtTime(3050,t+len*.4);f2.frequency.linearRampToValueAtTime(2750,t+len);
    m1.gain.value=1;m2.gain.value=.55;o.connect(src);o2.connect(src);src.gain.value=.5;src.connect(f1);src.connect(f2);f1.connect(m1);f2.connect(m2);m1.connect(g);m2.connect(g);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.07);g.gain.setValueAtTime(vol,t+len*.62);g.gain.exponentialRampToValueAtTime(.0005,t+len);g.connect(out);
    [o,o2,vib,am].forEach(x=>{x.start(t);x.stop(t+len+.05)})};
  wail(t0,.9,1.38,.5,880);wail(t0+1.08,.62,1.28,.42,980);
  // 抽噎吸氣：氣音 + 短促高音
  const nb=c.createBuffer(1,Math.floor(c.sampleRate*.4),c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/d.length);
  const ns=c.createBufferSource();ns.buffer=nb;const nf=c.createBiquadFilter();nf.type='bandpass';nf.Q.value=1.4;nf.frequency.setValueAtTime(1800,t0+1.8);nf.frequency.linearRampToValueAtTime(3000,t0+2.15);const ng=c.createGain();ng.gain.value=.16;ns.connect(nf);nf.connect(ng);ng.connect(out);ns.start(t0+1.8);
  const sq=c.createOscillator(),sg=c.createGain();sq.type='sine';sq.frequency.setValueAtTime(base*1.6,t0+1.95);sq.frequency.linearRampToValueAtTime(base*2.0,t0+2.2);sg.gain.setValueAtTime(.0001,t0+1.95);sg.gain.linearRampToValueAtTime(.09,t0+2.02);sg.gain.exponentialRampToValueAtTime(.0004,t0+2.25);sq.connect(sg);sg.connect(out);sq.start(t0+1.95);sq.stop(t0+2.3)}
const CRY_SOUND=false;
function w3CryTone(key){if(!CRY_SOUND||W3.cryOn===false)return;const c=w3CryCtx();if(!c||c.state!=='running')return;const m=c.createGain();m.gain.value=.8;m.connect(c.destination);w3CryRender(c,c.currentTime,key,m)}
function w3BabyLabel(bb,mode){const p=(W3.props||[]).find(x=>x.id==='crib_'+bb.key);if(!p)return;const txt=mode==='cry'?bb.n+' 😢 哭了！':mode==='fed'?bb.n+' 😊':bb.n;if(p._t===txt)return;p._t=txt;p.lab.material.map=w3Label(txt,mode==='fed');p.lab.material.needsUpdate=true}
function w3BabyStart(key,quiet){
  const st=W3.st;if(!st||!st.cfg.babies)return;const bb=st.cfg.babies.find(b=>b.key===key),B=W3.bb.who[key];if(!bb||B.cry)return;
  B.cry=1;B.t=0;B.beat=0;bb.mouth.visible=true;bb.tears.forEach(t=>t.visible=true);w3BabyLabel(bb,'cry');
  if(!quiet){w3DiaToast('👶 '+bb.n+'哭了！走過去看看是不是餓了');try{navigator.vibrate&&navigator.vibrate([60,40,60])}catch(e){}}}
function w3BabyStop(key,mode){
  const st=W3.st;if(!st||!st.cfg.babies)return;const bb=st.cfg.babies.find(b=>b.key===key),B=W3.bb.who[key];if(!bb)return;
  B.cry=0;bb.mouth.visible=false;bb.tears.forEach(t=>t.visible=false);bb.g.rotation.z=0;w3BabyLabel(bb,mode||'idle');if(mode==='fed')B.fedT=8}
function w3BabyUpdate(st,dt){
  const W=W3.bb;if(!W)return;W.next-=dt;
  if(W.next<=0){W.next=22+Math.random()*30;const F=W3.flow;const calm=(F&&F.s>0&&F.s<7)?[]:st.cfg.babies.filter(b=>!W.who[b.key].cry&&!(W3.cut&&W3.cut.key===b.key));if(calm.length)w3BabyStart(calm[Math.floor(Math.random()*calm.length)].key)}
  st.cfg.babies.forEach(bb=>{const B=W.who[bb.key];
    if(B.cry){B.t+=dt;B.beat-=dt;bb.g.rotation.z=Math.sin(st.t*16)*.05;bb.g.position.y=.95+Math.abs(Math.sin(st.t*9))*.025;if(B.beat<=0){B.beat=2.6;w3CryTone(bb.key)}if(B.t>75){w3BabyStop(bb.key,'idle');w3DiaToast(bb.n+'哭累睡著了')}}
    else if(B.fedT>0){B.fedT-=dt;if(B.fedT<=0)w3BabyLabel(bb,'idle')}})}
function mkLever(host,o){
  host.innerHTML='<div class="thtrack tfn"><span class="thknob"></span></div>';const tr=host.firstChild,kn=tr.firstChild;let v=o.val;
  const pct=x=>(x-o.min)/(o.max-o.min),fix=x=>{x=Math.max(o.min,Math.min(o.max,Math.round(x/o.step)*o.step));return +x.toFixed(2)};
  const set=(x,quiet)=>{v=fix(x);kn.style.bottom=pct(v)*100+'%';host.setAttribute('aria-valuenow',v);if(!quiet)o.on(v)};
  const fromY=y=>{const r=tr.getBoundingClientRect();return o.min+(1-Math.max(0,Math.min(1,(y-r.top)/r.height)))*(o.max-o.min)};
  let drag=false;host.addEventListener('pointerdown',e=>{drag=true;host.setPointerCapture(e.pointerId);host.focus();set(fromY(e.clientY));e.preventDefault()});
  host.addEventListener('pointermove',e=>{if(drag)set(fromY(e.clientY))});['pointerup','pointercancel'].forEach(n=>host.addEventListener(n,()=>{drag=false}));
  host.addEventListener('keydown',e=>{const k=e.key,st=o.step*(e.shiftKey?5:1);if(k==='ArrowUp'||k==='ArrowRight'){set(v+st);e.preventDefault()}else if(k==='ArrowDown'||k==='ArrowLeft'){set(v-st);e.preventDefault()}});
  set(v,true);return{set,get:()=>v}}
function w3Feed(key0){
  const el=document.getElementById('w3');if(!el||document.getElementById('w3th'))return;
  const F0=W3.flow;if(F0&&F0.s>=5){if(F0.s===5){const bk=(W3.st.cfg.babies||[]).find(b=>b.key===F0.key);if(key0!==F0.key){toast('這瓶奶是給「'+(bk?bk.n:'另一位寶寶')+'」的');return}w3Hold(F0.key,F0.ml);return}toast(w3FlowHint());return}
  W3.dlg=1;W3.keys={};w3CryCtx();
  W3.bm=W3.bm||{boy:{m:2,kg:5.6},girl:{m:2,kg:5.1}};let key=key0||'boy';
  const d=document.createElement('div');d.id='w3th';d.className='w3-th tf';
  d.innerHTML=`<div class="thc" role="dialog" aria-label="餵奶"><button class="thx" aria-label="關閉">✕</button>
   <div class="tht"><small>FEEDING</small><h3>餵哪一位寶寶？</h3></div>
   <div class="tfT"><button data-k="boy"></button><button data-k="girl"></button></div>
   <div class="tfL"><div class="tfC"><b>月齡</b><div class="thlv" tabindex="0" role="slider" aria-label="月齡" id="lvM"></div><span id="vM"></span></div>
    <div class="tfC"><b>體重</b><div class="thlv" tabindex="0" role="slider" aria-label="體重" id="lvW"></div><span id="vW"></span></div>
    <div class="tfR"><small>當餐建議奶量</small><div class="tfv"><b id="rV">—</b><em>ml</em></div><div id="rS"></div></div></div>
   <p class="tfn2" id="rN"></p>
   <div class="wact"><button class="wbig fin" id="tfGo">餵奶</button> <button class="wbig" id="tfHold">🤱 抱起來餵奶</button> <button class="tfs" id="tfSnd"></button></div></div>`;
  el.appendChild(d);const q$=x=>d.querySelector(x);let lvM,lvW;if(W3.flow)q$('#tfHold').remove();
  const bbOf=k=>W3.st.cfg.babies.find(b=>b.key===k);
  const paint=()=>{const S0=W3.bm[key],r=feedCalc(S0.m,S0.kg),med=BB_MED[key][S0.m];
    d.querySelectorAll('.tfT button').forEach(b=>{const bk=b.dataset.k,cr=W3.bb&&W3.bb.who[bk].cry;b.className=(bk===key?'on ':'')+(cr?'cry':'');b.textContent=bbOf(bk).n+(cr?' 😢':'')});
    q$('#vM').textContent=S0.m===0?'新生兒':S0.m+' 個月';q$('#vW').textContent=S0.kg.toFixed(1)+' kg';q$('#rV').textContent=r.per;
    q$('#rS').innerHTML=`範圍 ${r.lo}–${r.hi} ml<br>每天約 ${r.daily} ml · ${r.n} 餐 · 約每 ${r.gap} 小時一餐<br><i>同齡${key==='boy'?'男':'女'}寶寶中位數體重 ${med} kg</i>`;
    q$('#rN').innerHTML='建議量以「每公斤每日奶量 × 體重 ÷ 每日餐數」估算，僅供參考；請看寶寶的飽足訊號（轉頭、閉嘴、玩奶嘴）調整，不要硬灌。體重或食量異常請諮詢兒科醫師。';
    q$('#tfGo').textContent=W3.flow?`決定泡奶（${r.per} ml）`:`餵奶 ${r.per} ml`;q$('#tfSnd').textContent=W3.cryOn===false?'🔇 哭聲：關':'🔊 哭聲：開'};
  const build=()=>{const S0=W3.bm[key];lvM=mkLever(q$('#lvM'),{min:0,max:12,step:1,val:S0.m,on:v=>{S0.m=v;S0.kg=BB_MED[key][v];lvW.set(S0.kg,true);paint()}});
    lvW=mkLever(q$('#lvW'),{min:2,max:14,step:.1,val:S0.kg,on:v=>{S0.kg=v;paint()}});paint()};
  build();
  d.querySelectorAll('.tfT button').forEach(b=>b.onclick=()=>{key=b.dataset.k;const S0=W3.bm[key];lvM.set(S0.m,true);lvW.set(S0.kg,true);paint()});
  if(q$('#tfHold'))q$('#tfHold').onclick=()=>{const S0=W3.bm[key],r=feedCalc(S0.m,S0.kg);w3ThermosClose();w3Hold(key,r.per)};
  q$('#tfSnd').onclick=()=>{W3.cryOn=W3.cryOn===false;paint()};
  q$('.thx').onclick=w3ThermosClose;d.addEventListener('pointerdown',e=>{if(e.target===d)w3ThermosClose()});
  q$('#tfGo').onclick=()=>{const S0=W3.bm[key],r=feedCalc(S0.m,S0.kg),bb=bbOf(key);if(W3.flow){W3.flow.key=key;W3.flow.ml=r.per;w3ThermosClose();w3DiaToast('👌 決定泡奶：'+bb.n+' '+r.per+' ml');w3FlowAdv('plan');w3FlowHud();return}w3BabyStop(key,'fed');try{w3Chime()}catch(e){}w3ThermosClose();w3DiaToast('🍼 已餵 '+bb.n+' '+r.per+' ml');if(W3.st)w3Burst(bb.x,1.4,bb.z,'#ffd9e6')};
  setTimeout(()=>q$('#lvM').focus(),30);
}
/* ---- 抱起寶寶：動作一（托住頭頸＋臀部）→ 動作二（搖籃式）→ 走到哺乳椅坐下餵奶 → 放回嬰兒床 ---- */
const sm=t=>t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t;
function qFromHF(h,f){const T=THREE,ex=new T.Vector3(...h).negate().normalize(),ey=new T.Vector3(...f);ey.sub(ex.clone().multiplyScalar(ey.dot(ex))).normalize();const ez=new T.Vector3().crossVectors(ex,ey),m=new T.Matrix4().makeBasis(ex,ey,ez);return new T.Quaternion().setFromRotationMatrix(m)}
function HPb(){return{
 idle:{aL:[0,-.08],aR:[0,-.08],lean:0,drop:0,legs:0},
 reach:{aL:[-1.25,-.35],aR:[-1.25,-.35],lean:.6,drop:0,legs:0},
 scoop:{aL:[-1.5,-.42],aR:[-1.38,-.18],lean:.62,drop:0,legs:0},
 hold1:{aL:[-1.5,-.4],aR:[-1.4,-.15],lean:.08,drop:0,legs:0,bp:[0,.96,.4],bq:qFromHF([-1,0,0],[0,1,0]),bs:.55},
 cradle:{aL:[-1.72,-.3],aR:[-1.4,-.12],lean:0,drop:0,legs:0,bp:[-.02,.98,.3],bq:qFromHF([-1,.4,.05],[0,.9,-.4]),bs:.55},
 feed:{aL:[-1.72,-.3],aR:[-1.9,.55],lean:0,drop:.17,legs:-1.15,bp:[-.02,.92,.31],bq:qFromHF([-1,.45,0],[0,.9,-.45]),bs:.55},
 sitcr:{aL:[-1.72,-.3],aR:[-1.4,-.12],lean:0,drop:.17,legs:-1.15,bp:[-.02,.92,.31],bq:qFromHF([-1,.4,.05],[0,.9,-.4]),bs:.55},
 burp:{aL:[-1.98,-.12],aR:[-1.5,-.04],lean:0,drop:.17,legs:-1.15,bp:[-.04,1.14,.2],bq:qFromHF([0,1,-.08],[0,.12,-1]),bs:.55}}}
let _HP;const HPg=()=>_HP||(_HP=HPb());
function w3Cap(txt,step){const el=document.getElementById('w3');if(!el)return;let c=el.querySelector('.w3-cap');if(!c){c=document.createElement('div');c.className='w3-cap';c.innerHTML='<div class="cs"></div><b></b><button class="csk">略過</button>';el.appendChild(c);c.querySelector('.csk').onclick=()=>w3CutAbort()}
  c.querySelector('b').textContent=txt;c.querySelector('.cs').innerHTML=['托住頭頸臀','搖籃式','拍嗝'].map((n,i)=>`<i class="${step===i+1?'on':step>i+1?'done':''}">${i+1}. ${n}</i>`).join('<u>→</u>');c.classList.toggle('nostep',!step);}
function w3CapOff(){const c=document.querySelector('#w3 .w3-cap');if(c)c.remove();const d=document.querySelector('#w3 .w3-dil');if(d)d.remove()}
function w3Hold(key,ml){
  const st=W3.st;if(W3.cut||!st||!st.cfg.babies||!st.cfg.chair)return;const bb=st.cfg.babies.find(b=>b.key===key);if(!bb)return;
  const CH=st.cfg.chair,V=THREE.Vector3,fr=[bb.x,bb.z+1.0],seatFront=[CH.x,CH.z+1.7],seat=[CH.x,CH.z-.02];
  const RT=st.cfg.route||[],path=RT.length?[fr,[bb.x,bb.z+1.7],...RT,[CH.x-2.3,CH.z+.3],[CH.x-1.2,CH.z+2.8],seatFront]:[fr,[bb.x,bb.z+2.3],[CH.x+3.5,CH.z-.8],[CH.x+.3,CH.z+2.6],seatFront];
  const rev=[...path].reverse();
  w3BabyStop(key,'idle');W3.keys={};st.P.target=null;
  W3.cut={score:100,bb,key,ml,i:0,t:0,from:null,sav:{dist:st.dist,pitch:st.pitch},seq:[
   {n:'walk',path:(RT.length&&st.P.z>-1.2)?[[st.P.x,st.P.z],...[...RT].reverse(),[bb.x,bb.z+1.7],fr]:[[st.P.x,st.P.z],fr],ry:Math.PI,cap:'走到嬰兒床旁',pose:'idle'},
   {n:'pose',dur:.9,a:'idle',b:'reach',cap:'彎下腰，雙手伸向寶寶',ry:Math.PI},
   {n:'pose',dur:1.0,a:'reach',b:'scoop',cap:'動作一：一手托住頭與頸，另一手托住臀部',step:1,ry:Math.PI},
   {n:'lift',dur:1.5,a:'scoop',b:'hold1',cap:'動作一：穩穩托住頭、頸、臀部，把寶寶抱離床面',step:1,ry:Math.PI},
   {n:'pose',dur:1.3,a:'hold1',b:'hold1',cap:'動作一：頭頸有支撐，身體貼近自己的胸口',step:1,ry:Math.PI},
   {n:'pose',dur:2.0,a:'hold1',b:'cradle',cap:'動作二：頭滑到手肘彎，前臂托住背與臀，轉成搖籃式',step:2,ry:Math.PI},
   {n:'pose',dur:1.2,a:'cradle',b:'cradle',cap:'動作二：搖籃式，寶寶頭部略高於身體',step:2,ry:Math.PI,sway:1},
   {n:'walk',path,ry:null,cap:'抱著寶寶走到哺乳椅',pose:'cradle',step:2},
   {n:'turn',dur:.6,ry0:null,ry1:0,at:seatFront,cap:'轉身，準備坐下',pose:'cradle',step:2},
   {n:'sit',dur:1.6,a:'cradle',b:'sitcr',from:seatFront,to:seat,cap:'慢慢坐下，背靠椅背',step:2},
   {n:'feed',dur:8,a:'sitcr',b:'feed',cap:'餵奶中：奶瓶傾斜，讓奶水充滿奶嘴，寶寶頭略高於身體',step:2},
   {n:'pose',dur:1.3,a:'feed',b:'burp',cap:'拍嗝準備：把寶寶抱直，下巴靠在肩上，頭頸與臀部都要托好',step:3,ry:0,sit:1},
   {n:'pose',dur:4.4,a:'burp',b:'burp',cap:'拍嗝：一手托住頭頸，另一手由下往上輕拍背部，直到寶寶打嗝',step:3,ry:0,sit:1,burp:1},
   {n:'pose',dur:1.2,a:'burp',b:'sitcr',cap:'打嗝了！把寶寶抱回搖籃式',step:2,ry:0,sit:1},
   {n:'sit',dur:1.4,a:'sitcr',b:'cradle',from:seat,to:seatFront,cap:'抱穩寶寶，慢慢起身',step:2},
   {n:'walk',path:rev,ry:null,cap:'走回嬰兒床',pose:'cradle',step:2},
   {n:'pose',dur:.7,a:'cradle',b:'hold1',cap:'一手托頭頸、一手托臀部',step:1,ry:Math.PI,at:fr},
   {n:'down',dur:1.5,a:'hold1',b:'scoop',cap:'輕輕把寶寶放回嬰兒床',step:1,ry:Math.PI},
   {n:'pose',dur:.9,a:'scoop',b:'idle',cap:'',ry:Math.PI},
   {n:'end'}]};
  w3Cap('開始',0);st.dist=Math.max(5.5,Math.min(st.dist,8));st.pitch=.38;
}
function w3CutAbort(){const C=W3.cut,st=W3.st;if(!C||!st)return;W3.cut=null;const bb=C.bb;if(C.bot){C.bot.parent&&C.bot.parent.remove(C.bot)}if(st.cfg.tblBottle&&W3.flow&&W3.flow.s===5)st.cfg.tblBottle.visible=true;
  bb.tears.forEach(t=>t.visible=false);bb.mouth.visible=false;
  if(bb.g.parent!==st.S)st.S.attach(bb.g);bb.g.position.set(bb.x,.95,bb.z);bb.g.quaternion.identity();bb.g.scale.setScalar(1);bb.g.rotation.set(0,0,0);
  st.P.x=bb.x;st.P.z=bb.z+1.2;st.P.ry=Math.PI;st.piv.rotation.set(0,st.P.ry,0);w3CapOff();W3.keys={};}
function w3CutUpdate(st,dt){
  const C=W3.cut;if(!C)return;const P=st.P,U=st.lucy.userData,T=THREE,bb=C.bb,step=C.seq[C.i];
  st.piv.position.set(P.x,.78+P.y,P.z);st.piv.rotation.set(0,P.ry,0);
  if(!step||step.n==='end'){W3.cut=null;if(C.bot)C.bot.parent.remove(C.bot);w3CapOff();st.dist=C.sav.dist;st.pitch=C.sav.pitch;P.ry=Math.PI;
    w3BabyStop(C.key,'fed');if(st.cfg.tblBottle)st.cfg.tblBottle.visible=false;w3FlowAdv('fed');try{w3Chime()}catch(e){}const stars=C.score>=90?'⭐⭐⭐':C.score>=70?'⭐⭐':'⭐';w3DiaToast('🍼 '+bb.n+'吃飽了，已放回嬰兒床（約 '+C.ml+' ml）· 照顧分數 '+C.score+' '+stars);return}
  if(C.t===0){ // 步驟開始
    if(step.cap!=null)w3Cap(step.cap,step.step||0);
    C.from={x:P.x,z:P.z,ry:P.ry};
    if(step.n==='pose'&&step.at){C.from={x:step.at[0],z:step.at[1],ry:P.ry};P.x=step.at[0];P.z=step.at[1]}
    if(step.n==='lift'){C.b0=bb.g.getWorldPosition(new T.Vector3());C.q0=bb.g.getWorldQuaternion(new T.Quaternion());C.s0=bb.g.scale.x}
    if(step.n==='down'){st.S.attach(bb.g);C.b0=bb.g.position.clone();C.q0=bb.g.quaternion.clone();C.s0=bb.g.scale.x}
    if(step.n==='feed'){if(st.cfg.tblBottle)st.cfg.tblBottle.visible=false;C.dilAt=Math.random()<(W3.forceDil?1:.8)?1+Math.random()*2.6:1e9;C.dil=null;C.dilDone=0;const g=new T.Group(),M=(geo,c,o)=>{const m=new T.Mesh(geo,new T.MeshStandardMaterial(Object.assign({color:c,roughness:.5},o||{})));m.castShadow=true;g.add(m);return m};
      M(new T.CylinderGeometry(.045,.045,.2,14),'#f4f7fa',{transparent:true,opacity:.55}).position.y=.17;const milk=M(new T.CylinderGeometry(.038,.038,.17,14),'#fff6e6');milk.position.y=.165;
      M(new T.TorusGeometry(.045,.012,6,14),'#c49a3c').position.y=.07;(()=>{const n=M(new T.ConeGeometry(.03,.07,10),'#f3c98f');n.rotation.x=Math.PI;n.position.y=.025})();
      st.lucy.add(g);C.bot=g;C.milk=milk}
  }
  const frozen=step.n==='feed'&&w3DilTick(st,C,dt);if(!frozen)C.t+=dt;let u;
  const dur=step.dur||(step.n==='walk'?pathLen(step.path)/2.3:1);u=Math.min(1,C.t/dur);const s=sm(u);
  const set=(pa,pb,t)=>{const A=HPg()[pa],B=HPg()[pb],L=(x,y)=>[lerp(x[0],y[0],t),lerp(x[1],y[1],t)];
    const aL=L(A.aL,B.aL),aR=L(A.aR,B.aR);U.arms[0].rotation.set(aL[0],0,-(-1)*aL[1]);U.arms[1].rotation.set(aR[0],0,-(1)*aR[1]);
    st.piv.rotation.x=lerp(A.lean,B.lean,t);st.piv.position.y-=lerp(A.drop,B.drop,t);const lg=lerp(A.legs,B.legs,t);if(lg){U.legs[0].rotation.x=lg;U.legs[1].rotation.x=lg}
    return{A,B}};
  const babyLocal=(A,B,t)=>{const bp=A.bp||B.bp,bp2=B.bp||A.bp,qa=A.bq||B.bq,qb=B.bq||A.bq;return{pos:new T.Vector3(lerp(bp[0],bp2[0],t),lerp(bp[1],bp2[1],t),lerp(bp[2],bp2[2],t)),q:qa.clone().slerp(qb,t),sc:lerp(A.bs||B.bs,B.bs||A.bs,t)}};
  const swing=(Math.sin(st.t*8)*.5);
  if(step.n==='walk'){
    const pp=pathPos(step.path,u);P.x=pp[0];P.z=pp[1];if(step.ry!=null)P.ry=step.ry;else P.ry=Math.atan2(pp[2],pp[3]);
    set(step.pose,step.pose,1);if(step.pose==='cradle'||step.pose==='idle'){U.legs[0].rotation.x=swing;U.legs[1].rotation.x=-swing;if(step.pose==='idle'){U.arms[0].rotation.x=-swing*.7;U.arms[1].rotation.x=swing*.7}}
    if(step.pose==='cradle'){const b=babyLocal(HPg().cradle,HPg().cradle,1);bb.g.position.copy(b.pos);bb.g.position.y+=Math.sin(st.t*8)*.012}
  }else if(step.n==='turn'){P.x=step.at[0];P.z=step.at[1];const r0=C.from.ry,d=Math.atan2(Math.sin(step.ry1-r0),Math.cos(step.ry1-r0));P.ry=r0+d*s;set('cradle','cradle',1)}
  else if(step.n==='sit'||step.n==='pose'||step.n==='feed'||step.n==='lift'||step.n==='down'){
    if(step.n==='sit'){P.x=lerp(step.from[0],step.to[0],s);P.z=lerp(step.from[1],step.to[1],s);P.ry=0}
    else{if(step.ry!=null&&step.n!=='feed')P.ry=step.ry;if(step.n==='feed')P.ry=0}
    if(step.sit){P.x=seatXZ(st)[0];P.z=seatXZ(st)[1]}
    const {A,B}=set(step.a,step.b,s);
    if(step.burp){U.arms[1].rotation.x+=Math.sin(C.t*15)*.13;bb.g.position.y+=Math.abs(Math.sin(C.t*15))*.008;if(u>.78&&!C.burped){C.burped=1;w3BurpTone(bb.key);w3DiaToast('嗝～ 😊 寶寶打嗝了')}}
    if(step.n==='lift'||step.n==='down'){
      const b=babyLocal(HPg().hold1,HPg().hold1,1);const wp=st.lucy.localToWorld(b.pos.clone()),wq=st.lucy.getWorldQuaternion(new T.Quaternion()).multiply(b.q);
      if(step.n==='lift'){bb.g.position.copy(C.b0).lerp(wp,s);bb.g.quaternion.copy(C.q0).slerp(wq,s);bb.g.scale.setScalar(lerp(C.s0,b.sc,s));
        if(u>=1){st.lucy.attach(bb.g)}}
      else{const cr=new T.Vector3(bb.x,.95,bb.z);bb.g.position.copy(wp).lerp(cr,s);bb.g.position.y+=Math.sin(s*Math.PI)*.1;bb.g.quaternion.copy(wq).slerp(new T.Quaternion(),s);bb.g.scale.setScalar(lerp(b.sc,1,s))}
    }else if(A.bp||B.bp){const b=babyLocal(A,B,s);if(bb.g.parent!==st.lucy)st.lucy.attach(bb.g);bb.g.position.copy(b.pos);bb.g.quaternion.copy(b.q);bb.g.scale.setScalar(b.sc);
      if(step.sway)bb.g.position.y+=Math.sin(C.t*5)*.012}
    if(step.n==='feed'&&C.bot){const mw=bb.g.localToWorld(new T.Vector3(-.43,.285,0)),ml=st.lucy.worldToLocal(mw),d=new T.Vector3(.55,.45,.35).normalize();
      C.bot.position.copy(ml);C.bot.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d);C.bot.rotateZ(Math.sin(C.t*3)*.04);C.milk.scale.y=Math.max(.05,1-u*.85);C.milk.position.y=.08+.085*C.milk.scale.y;
      if(!C.dil){bb.mouth.visible=Math.sin(C.t*7)>0;bb.g.position.y+=Math.sin(C.t*7)*.004}
      w3DilAnim(st,C,bb,dt)}
    if(step.n==='feed'&&u>=1&&!C.dil){if(C.bot){C.bot.parent.remove(C.bot);C.bot=null}bb.mouth.visible=false}
  }
  st.piv.position.x=P.x;st.piv.position.z=P.z;st.piv.rotation.y=P.ry;
  if(u>=1){C.i++;C.t=0;C.burped=0}
}
function seatXZ(st){const CH=st.cfg.chair;return[CH.x,CH.z-.02]}
function w3BurpTone(key){if(W3.cryOn===false)return;const c=w3CryCtx();if(!c||c.state!=='running')return;const t=c.currentTime,o=c.createOscillator(),g=c.createGain(),f=key==='girl'?150:115;o.type='sawtooth';o.frequency.setValueAtTime(f*1.4,t);o.frequency.exponentialRampToValueAtTime(f*.7,t+.35);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12,t+.04);g.gain.exponentialRampToValueAtTime(.0005,t+.4);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=600;o.connect(lp);lp.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.45)}
function pathLen(pts){let l=0;for(let i=1;i<pts.length;i++)l+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return Math.max(l,.01)}
function pathPos(pts,u){const L=pathLen(pts);let d=u*L;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l||i===pts.length-1){const t=Math.min(1,l?d/l:1);return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),b[0]-a[0],b[1]-a[1]]}d-=l}return[pts[pts.length-1][0],pts[pts.length-1][1],0,1]}
/* ---- 付費解鎖：哺乳室免費，其餘空間鎖住（示範畫面，尚未接金流） ---- */
const UNLOCK={each:199,all:999,free:['nurse','town']};
const isLocked=id=>!UNLOCK.free.includes(id)&&!(S.rpg.unlock&&(S.rpg.unlock.all||S.rpg.unlock[id]));
function w3Paywall(id){
  const cu=id==='brands',L=cu?{n:'其他品牌奶粉'}:LOCS.find(l=>l.id===id);if(!L||document.getElementById('pwm'))return;
  const own=!RO&&!SHOWCASE,nLock=LOCS.filter(l=>isLocked(l.id)).length;
  const d=document.createElement('div');d.id='pwm';d.className='pwm';
  d.innerHTML=`<div class="pwc" role="dialog" aria-label="付費解鎖"><button class="pwx" aria-label="關閉">✕</button>
   <div class="pwl"><svg viewBox="0 0 48 56" width="44" height="52"><path d="M14,24 V16 a10,10 0 0 1 20,0 V24" fill="none" stroke="#4a3426" stroke-width="5" stroke-linecap="round"/><path d="M14,24 V16 a10,10 0 0 1 20,0 V24" fill="none" stroke="#c49a3c" stroke-width="2.4" stroke-linecap="round"/><rect x="6" y="24" width="36" height="28" rx="6" fill="#d9a24a" stroke="#4a3426" stroke-width="2.4"/><circle cx="24" cy="36" r="4" fill="#4a3426"/><rect x="22.5" y="37" width="3" height="8" rx="1.5" fill="#4a3426"/></svg></div>
   <small>PREMIUM</small><h3>「${esc(L.n)}」需要付費解鎖</h3>
   <p class="pwd">${cu?'目前免費提供<b>明治</b>與 <b>S-26 金愛兒樂</b>兩個品牌。更多奶粉品牌與各自的沖泡流程需要付費解鎖。':`目前只有<b>哺乳室</b>可免費使用。其餘 ${nLock} 個空間（含 3D 場景、專屬任務與獎勵）需要付費解鎖。`}</p>
   <div class="pwp" ${cu?'style="grid-template-columns:1fr"':''}><div class="pwo"><b>單一空間</b><em>NT$ ${UNLOCK.each}</em><span>只解鎖「${esc(L.n)}」</span><button class="pwb" data-b="one">解鎖 ${esc(L.n)}</button></div>
    ${cu?'':`<div class="pwo hot"><i>最划算</i><b>全部解鎖</b><em>NT$ ${UNLOCK.all}</em><span>一次解鎖全部 ${nLock} 個空間</span><button class="pwb" data-b="all">全部解鎖</button></div>`}</div>
   <p class="pwn">※ 這是示範畫面，價格僅供參考，目前尚未開通付款。</p>
   ${own?`<button class="pwt" id="pwT">（擁有者）${S.rpg.unlock&&S.rpg.unlock.all?'測試：重新鎖上':'測試：暫時全部解鎖'}</button>`:''}</div>`;
  document.body.appendChild(d);
  const close=()=>d.remove();d.querySelector('.pwx').onclick=close;d.addEventListener('pointerdown',e=>{if(e.target===d)close()});
  d.querySelectorAll('.pwb').forEach(b=>b.onclick=()=>toast('付款功能尚未開通，這是示範畫面'));
  const t=d.querySelector('#pwT');if(t)t.onclick=()=>{const R=S.rpg;R.unlock=R.unlock&&R.unlock.all?{}:{all:true};save();close();if(W3.open==='town'){const f=W3.townSpawn;w3Close();w3Enter('town')}if(MODE==='rpg')renderRpg();toast(R.unlock.all?'已暫時全部解鎖（測試）':'已重新鎖上')};
  window.addEventListener('keydown',function k(e){if(e.key==='Escape'&&document.getElementById('pwm')){e.stopPropagation();close()}if(!document.getElementById('pwm'))window.removeEventListener('keydown',k)},true);
}
/* ---- 沖泡配方奶：選品牌，順序錯了扣分 ---- */
const MIX={meiji:{n:'明治',en:'Meiji',order:['powder','water','shake'],hint:'明治：先加奶粉，再加熱水（70°C 以上），最後搖勻',col:'#c0392b',bg:'#f6f1e4'},
 s26:{n:'S-26 金愛兒樂',en:'S-26 Gold',order:['water','powder','shake'],hint:'S-26 金愛兒樂：先加熱水（70°C 以上），再加奶粉，最後搖勻',col:'#8a6a1c',bg:'#f2d98a'}};
const MIXN={powder:'加奶粉',water:'加熱水',shake:'搖勻'};
function w3Mix(){
  const el=document.getElementById('w3');if(!el||document.getElementById('w3th'))return;W3.dlg=1;W3.keys={};
  if(W3.temp==null)W3.temp=80;
  const d=document.createElement('div');d.id='w3th';d.className='w3-th tw tmx';
  const brandLocked=!(S.rpg.unlock&&(S.rpg.unlock.all||S.rpg.unlock.brands));
  d.innerHTML=`<div class="thc" role="dialog" aria-label="沖泡配方奶"><button class="thx" aria-label="關閉">✕</button>
   <div class="tht"><small>MIXING</small><h3>沖泡配方奶</h3></div><div id="mxB"></div></div>`;
  el.appendChild(d);const B=d.querySelector('#mxB');
  const close=()=>w3ThermosClose();d.querySelector('.thx').onclick=close;d.addEventListener('pointerdown',e=>{if(e.target===d)close()});
  const can=(k)=>`<button class="mxc" data-k="${k}"><i style="background:${MIX[k].bg};border-color:${MIX[k].col}"><b style="color:${MIX[k].col}">${k==='meiji'?'明治':'S-26'}</b><u>${k==='meiji'?'Meiji':'金愛兒樂'}</u></i><span>${MIX[k].n}</span></button>`;
  const pick=()=>{B.innerHTML=`<p class="mxp">選一罐奶粉開始沖泡：每個品牌的順序不一樣，<b>點錯順序會扣分</b>。</p><div class="mxr">${can('meiji')}${can('s26')}<button class="mxc lock" data-k="brands"><i style="background:#bdb8ac;border-color:#7f7a70"><b style="color:#6a655b">其他</b><u>品牌</u></i><span>🔒 付費解鎖</span></button></div>`;
    B.querySelectorAll('.mxc').forEach(b=>b.onclick=()=>{if(b.dataset.k==='brands'&&brandLocked){w3Paywall('brands');return}if(b.dataset.k==='brands'){toast('其他品牌已解鎖（尚未提供內容）');return}play(b.dataset.k)})};
  const play=(k)=>{
    const M=MIX[k];let step=0,score=100,pw=0,wt=0,sh=0,done=false,coldHit=false;
    B.innerHTML=`<div class="mxh"><div class="mxs">分數 <b id="mxScore">100</b></div><div class="mxg" id="mxG">${M.order.map((o,i)=>`<i data-i="${i}">${i+1}. ${MIXN[o]}</i>`).join('<u>→</u>')}</div></div>
     <p class="mxt">${esc(M.hint)}</p>
     <div class="mxst"><svg viewBox="0 0 220 230" class="mxsv"><defs><clipPath id="mxcp"><path d="M-30,-70 h60 v14 q22,8 22,32 v86 q0,12 -12,12 h-60 q-12,0 -12,-12 v-86 q0,-24 22,-32 z"/></clipPath></defs>
      <g transform="translate(110,120)"><g id="mxBt"><g clip-path="url(#mxcp)"><rect id="mxW" x="-60" y="100" width="120" height="0" fill="#bfe0ec" opacity=".85"/><rect id="mxP" x="-60" y="100" width="120" height="0" fill="#f1dca0"/><rect id="mxM" x="-60" y="100" width="120" height="0" fill="#fff5e0" opacity="0"/></g>
      <path d="M-30,-70 h60 v14 q22,8 22,32 v86 q0,12 -12,12 h-60 q-12,0 -12,-12 v-86 q0,-24 22,-32 z" fill="#ffffff22" stroke="#4a3426" stroke-width="3" stroke-linejoin="round"/><path d="M-26,-70 h52" stroke="#c49a3c" stroke-width="4"/><path d="M-38,-10 h20 M-38,20 h14 M-38,50 h20" stroke="#4a3426" stroke-width="2"/></g><g id="mxFx"></g></g></svg></div>
     <div class="mxa"><button class="wbig" data-a="powder">🥄 加奶粉</button><button class="wbig" data-a="water">💧 加熱水 <small id="mxT"></small></button><button class="wbig" data-a="shake">🔄 搖勻</button></div>
     <p class="mxm" id="mxMsg">開始吧！</p><div class="mxf"><button class="tfs" id="mxBack">← 換品牌</button></div>`;
    const $=x=>B.querySelector(x),NS='http://www.w3.org/2000/svg';
    const paint=()=>{$('#mxScore').textContent=score;B.querySelectorAll('#mxG i').forEach((e,i)=>e.className=i<step?'done':i===step&&!done?'on':'');const t=$('#mxT');if(t)t.textContent=`(${W3.temp}°C)`};
    const setLv=(id,h)=>{const e=$('#'+id);e.setAttribute('height',h);e.setAttribute('y',100-h)};
    const pop=(txt,bad)=>{const t=document.createElementNS(NS,'text');t.setAttribute('x',0);t.setAttribute('y',-90);t.setAttribute('text-anchor','middle');t.setAttribute('class','mxpop'+(bad?' bad':''));t.textContent=txt;$('#mxFx').appendChild(t);setTimeout(()=>t.remove(),1100)};
    const drops=(kind)=>{const g=$('#mxFx');for(let i=0;i<8;i++){const c=document.createElementNS(NS,kind==='powder'?'circle':'path');if(kind==='powder'){c.setAttribute('r',3);c.setAttribute('cx',-12+Math.random()*24);c.setAttribute('cy',-110);c.setAttribute('fill','#f1dca0');c.setAttribute('stroke','#4a3426')}else{c.setAttribute('d',`M${-8+i*2.2},-120 v10`);c.setAttribute('stroke','#5aa9c8');c.setAttribute('stroke-width',3);c.setAttribute('stroke-linecap','round')}
      c.setAttribute('class','mxd');c.style.animationDelay=(i*.06)+'s';g.appendChild(c);setTimeout(()=>c.remove(),1100)}};
    const bad=(why,pen)=>{score=Math.max(0,score-pen);pop('-'+pen,true);$('#mxMsg').innerHTML=`<b class="bad">✗ ${why}（-${pen} 分）</b>`;const c=B.closest('.thc');c.classList.remove('shk');void c.offsetWidth;c.classList.add('shk');try{navigator.vibrate&&navigator.vibrate(80)}catch(e){}w3Warn();paint()};
    const finish=()=>{done=true;const st=score>=90?3:score>=70?2:1;paint();
      $('.mxa').innerHTML=`<div class="mxres"><div class="mxstar">${'★'.repeat(st)}${'☆'.repeat(3-st)}</div><b>沖泡完成！得分 ${score}</b><span>${st===3?'順序完全正確，很棒！':st===2?'做得不錯，再注意一下順序。':'下次先看清楚每個品牌的沖泡順序喔。'}</span></div><div class="wact"><button class="wbig fin" id="mxTbl">端去小桌子</button> <button class="wbig" id="mxAgain">再沖一次</button></div>`;
      try{w3Chime()}catch(e){}w3FlowAdv('mix');if($('#mxTbl'))$('#mxTbl').onclick=()=>{w3ThermosClose();w3DiaToast('🍼 把奶瓶端去哺乳椅旁的小桌子')};$('#mxAgain').onclick=()=>play(k);$('#mxMsg').textContent=''};
    B.querySelectorAll('.mxa [data-a]').forEach(b=>b.onclick=()=>{if(done)return;const a=b.dataset.a,want=M.order[step];
      if(a==='powder'&&pw){bad('奶粉已經加過了，不要重複加',5);return}
      if(a==='water'&&wt){bad('熱水已經加過了',5);return}
      if(a==='shake'&&!(pw&&wt)){bad('還沒加完奶粉和熱水就搖',10);return}
      if(a!==want){bad(`${M.n}要先「${MIXN[want]}」，不是「${MIXN[a]}」`,10);return}
      // 正確
      if(a==='powder'){pw=1;drops('powder');setLv('mxP',wt?18:22);$('#mxMsg').textContent='✓ 奶粉加好了'}
      else if(a==='water'){wt=1;drops('water');setLv('mxW',pw?118:112);if(pw)setLv('mxP',18);$('#mxMsg').textContent='✓ 熱水加好了';
        if(W3.temp<TH_SAFE&&!coldHit){coldHit=true;score=Math.max(0,score-15);pop('-15',true);$('#mxMsg').innerHTML=`<b class="bad">⚠ 水溫只有 ${W3.temp}°C，低於 70°C 無法殺死病菌！（-15 分）先到熱水瓶把水溫調到 70°C 以上。</b>`}}
      else{sh=1;const bt=$('#mxBt');bt.classList.add('mxshk');setTimeout(()=>{bt.classList.remove('mxshk');setLv('mxW',0);setLv('mxP',0);const m=$('#mxM');setLv('mxM',118);m.setAttribute('opacity',1)},900)}
      step++;paint();if(a==='shake')setTimeout(finish,1000)});
    $('#mxBack').onclick=pick;paint();};
  pick();setTimeout(()=>d.querySelector('.mxc')&&d.querySelector('.mxc').focus(),30);
}
/* ---- 餵奶時的隨機困境：推開奶瓶／扭動掙扎／大哭 ---- */
const DIL={
 push:{ic:'🙅',n:'寶寶推開奶瓶',d:'小手一直把奶瓶推開，嘴巴閉得緊緊的。',tier:{pause:'best',tsk:'ok',sing:'poor'}},
 squirm:{ic:'😣',n:'寶寶扭動掙扎',d:'身體扭來扭去，好像不舒服。',tier:{pause:'best',sing:'ok',tsk:'poor'}},
 cry:{ic:'😭',n:'寶寶大哭',d:'哭得很大聲，沒辦法含住奶嘴。',tier:{sing:'best',tsk:'ok',pause:'poor'}}};
const DILA={sing:{ic:'🎵',n:'唱歌安撫'},pause:{ic:'⏸',n:'暫停拍嗝'},tsk:{ic:'👄',n:'發出怪聲音'},warm:{ic:'🔥',n:'放進溫奶器，晚點餵'}};
function w3Snd(fn){if(W3.cryOn===false)return;const c=w3CryCtx();if(!c||c.state!=='running')return;try{fn(c,c.currentTime)}catch(e){}}
function w3Lullaby(){w3Snd((c,t)=>{[392,392,440,440,392,392,330,0,349,349,330,330,294,294,262].forEach((f,i)=>{if(!f)return;const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;const s0=t+i*.22;g.gain.setValueAtTime(.0001,s0);g.gain.linearRampToValueAtTime(.09,s0+.03);g.gain.exponentialRampToValueAtTime(.0005,s0+.2);o.connect(g);g.connect(c.destination);o.start(s0);o.stop(s0+.22)})})}
function w3Silly(){const k=Math.floor(Math.random()*3);w3Snd((c,t)=>{if(k===0){for(let i=0;i<3;i++){const n=c.createBufferSource(),b=c.createBuffer(1,c.sampleRate*.05,c.sampleRate),d0=b.getChannelData(0);for(let j=0;j<d0.length;j++)d0[j]=(Math.random()*2-1)*(1-j/d0.length);n.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=2400;f.Q.value=4;const g=c.createGain();g.gain.value=.5;n.connect(f);f.connect(g);g.connect(c.destination);n.start(t+i*.18)}}
  else{const o=c.createOscillator(),g=c.createGain();o.type=k===1?'sine':'triangle';o.frequency.setValueAtTime(k===1?220:700,t);o.frequency.exponentialRampToValueAtTime(k===1?880:180,t+.35);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.42)}});return['咂嘴聲「嘖嘖嘖」','「啵～」搞怪聲','「咻嚕嚕」滑音'][k]}
function w3DilPanel(C){
  const el=document.getElementById('w3');if(!el)return;let p=el.querySelector('.w3-dil');const D=C.dil;
  if(!D){if(p)p.remove();return}
  if(!p){p=document.createElement('div');p.className='w3-dil';el.appendChild(p);
    p.innerHTML=`<div class="dh"><i></i><div><b></b><span></span></div></div><div class="dm"><u></u><em>安撫值</em></div><div class="da">${['sing','pause','tsk','warm'].map(a=>`<button data-a="${a}"><i>${DILA[a].ic}</i>${DILA[a].n}</button>`).join('')}</div><p class="dt"></p>`;
    p.querySelectorAll('.da button').forEach(b=>b.onclick=()=>w3DilAct(b.dataset.a))}
  const T=DIL[D.type];p.querySelector('.dh i').textContent=T.ic;p.querySelector('.dh b').textContent=T.n+'！';p.querySelector('.dh span').textContent=T.d;
  p.querySelector('.dm u').style.width=Math.max(0,Math.min(100,D.mood))+'%';p.querySelector('.dt').innerHTML=D.msg||'想想看：怎麼讓寶寶安心？';
  p.classList.toggle('lock',!!(D.act||D.warm));}
function w3DilStart(st,C){
  const type=W3.forceType||['push','squirm','cry'][Math.floor(Math.random()*3)],bb=C.bb;C.dil={type,mood:25,idle:0,msg:'',act:0,warm:0,t:0};C.dilDone=1;
  if(type==='cry'){bb.mouth.visible=true;bb.tears.forEach(t=>t.visible=true)}else bb.mouth.visible=false;
  w3Cap('餵奶遇到狀況：'+DIL[type].n+'，快想辦法！',0);try{navigator.vibrate&&navigator.vibrate([60,40,60])}catch(e){}w3DilPanel(C)}
function w3DilAct(a){
  const C=W3.cut;if(!C||!C.dil||C.dil.act||C.dil.warm)return;const D=C.dil,T=DIL[D.type];D.idle=0;
  if(a==='warm'){D.warm=3.4;D.msg='🔥 把奶瓶放進溫奶器保溫，先讓寶寶冷靜一下，晚點再餵。';D.mood=100;w3DilPanel(C);return}
  const tier=T.tier[a];
  if(a==='sing'){w3Lullaby();D.msg='🎵 輕輕哼著搖籃曲…'}else if(a==='tsk'){D.msg='👄 '+w3Silly()+'！'}else{D.act=2.4;D.msg='⏸ 暫停餵奶，把寶寶抱直輕拍背部…'}
  if(tier==='best'){D.mood+=62;D.msg+=' <b class="ok">很有效！寶寶放鬆下來了。</b>'}
  else if(tier==='ok'){D.mood+=40;D.msg+=' <b class="ok">有一點用。</b>'}
  else{D.mood+=8;C.score=Math.max(0,C.score-6);D.msg+=' <b class="bad">好像沒什麼用…（-6 分）</b>'}
  if(a==='pause')w3BurpTone(C.key);w3DilPanel(C)}
function w3DilTick(st,C,dt){
  if(C.dil){const D=C.dil;D.t+=dt;
    if(D.warm){D.warm-=dt;if(D.warm<=0){D.warm=0;w3DilResolve(st,C,'溫好了，寶寶準備好了，繼續餵奶。')}w3DilPanel(C);return true}
    if(D.act){D.act-=dt;if(D.act<=0)D.act=0;w3DilPanel(C)}
    D.mood-=3*dt;D.idle+=dt;
    if(D.idle>10){D.idle=0;C.score=Math.max(0,C.score-5);D.mood=Math.max(0,D.mood-15);D.msg='<b class="bad">拖太久了，寶寶越來越不開心！（-5 分）</b>'}
    if(D.mood>=100&&!D.act){w3DilResolve(st,C,'寶寶安心了，繼續餵奶。')}else w3DilPanel(C);return true}
  if(!C.dilDone&&C.t>=C.dilAt){w3DilStart(st,C);return true}
  return false}
function w3DilResolve(st,C,msg){const bb=C.bb;C.dil=null;bb.tears.forEach(t=>t.visible=false);bb.mouth.visible=false;w3DilPanel(C);w3Cap('餵奶中：奶瓶傾斜，讓奶水充滿奶嘴，寶寶頭略高於身體',2);w3DiaToast('✓ '+msg);try{w3Chime()}catch(e){}}
function w3DilAnim(st,C,bb,dt){
  const D=C.dil;if(!D||!C.bot)return;const T=THREE,t=D.t;
  if(D.warm){const wp=st.lucy.worldToLocal(new T.Vector3(...st.cfg.warmer));C.bot.position.copy(wp);C.bot.quaternion.identity();return}
  if(D.type==='push'){bb.g.rotateY(Math.sin(t*6)*.45);C.bot.position.x+=.1+Math.abs(Math.sin(t*5))*.06;C.bot.position.z+=.04}
  else if(D.type==='squirm'){bb.g.rotateZ(Math.sin(t*14)*.2);bb.g.rotateX(Math.sin(t*11)*.15);bb.g.position.x+=Math.sin(t*13)*.02}
  else{bb.g.rotateZ(Math.sin(t*16)*.06);bb.g.position.y+=Math.abs(Math.sin(t*9))*.02;D.beat=(D.beat||0)-dt;if(D.beat<=0){D.beat=1.3;w3CryTone(C.key)}C.bot.position.x+=.07}
  if(D.act){const arm=st.lucy.userData.arms[1];arm.rotation.x+=Math.sin(t*16)*.13}
}
function w3Warn(){if(!W3.audio||!W3.snd)return;try{const c=W3.audio.ctx,o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=196;g.gain.setValueAtTime(.08,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.5);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.55)}catch(e){}}
function w3Chime(){if(!W3.audio||!W3.snd)return;const c=W3.audio.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.9);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+1)}
function w3Bind(el){
  if(el._bound)return;el._bound=1;
  {const nb=el.querySelector('.w3-nbtn'),pn=el.querySelector('.w3-note');if(nb&&pn)nb.onclick=()=>{const o=!pn.classList.contains('open');pn.classList.toggle('open',o);nb.classList.toggle('on',o);nb.setAttribute('aria-expanded',o)}}
  const cv=el.querySelector('.w3-cv');
  const near=()=>{const st=W3.st;if(!st)return null;let best=null,bd=2.1;[...(W3.orbs||[]),...(W3.props||[])].forEach(o=>{const d=Math.hypot(o.x-st.P.x,o.z-st.P.z);if(d<bd){bd=d;best=o}});return best};
  const act=()=>{const o=near();if(o){w3Chime();w3Interact(o)}};
  el.querySelector('#w3back').onclick=()=>w3Exit();
  el.querySelector('#w3snd').onclick=e=>{W3.snd=!W3.snd;w3Audio(W3.snd);e.currentTarget.classList.toggle('on',W3.snd)};
  el.querySelector('.w3-act').onclick=act;el.querySelector('#w3jump').onclick=()=>{W3.jumpReq=1};el.querySelector('#w3roll').onclick=()=>{W3.rollReq=1};el.querySelector('#w3orb').onclick=w3Orbit;el.querySelector('#w3tj').onclick=()=>{W3.jumpReq=1};el.querySelector('#w3tr').onclick=()=>{W3.rollReq=1};
  window.addEventListener('keydown',e=>{if(!W3.open)return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(W3.dlg){if(k==='Escape')w3ThermosClose();return}if(W3.cut){if(k==='Escape')w3CutAbort();return}if(k==='Escape'){w3Exit();return}if(e.target.closest&&e.target.closest('input,textarea,select'))return;if(k==='e'||k==='Enter'){act();return}if(k===' '){e.preventDefault();W3.jumpReq=1;return}if(k==='f'){W3.rollReq=1;return}if(k==='o'){w3Orbit();return}if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','shift','q','r'].includes(k.toLowerCase?k.toLowerCase():k)){W3.keys[k.toLowerCase?k.toLowerCase():k]=1;if(k.startsWith('Arrow'))e.preventDefault()}});
  window.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;delete W3.keys[k.toLowerCase?k.toLowerCase():k]});
  window.addEventListener('resize',w3Size);
  // 拖曳旋轉、點擊移動
  let down=null;
  cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,yaw:W3.st&&W3.st.yaw,pitch:W3.st&&W3.st.pitch,moved:false,id:e.pointerId};cv.setPointerCapture(e.pointerId)});
  cv.addEventListener('pointermove',e=>{if(!down||!W3.st)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)>6||Math.abs(dy)>6)down.moved=true;if(down.moved){W3.st.yaw=down.yaw-dx*.007;W3.st.pitch=Math.max(.1,Math.min(1.3,down.pitch+dy*.005))}});
  cv.addEventListener('pointerup',e=>{const d=down;down=null;if(!d||d.moved||!W3.st)return;const st=W3.st,T=THREE,r=cv.getBoundingClientRect(),m=new T.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),rc=new T.Raycaster();rc.setFromCamera(m,st.cam);
    const ph=rc.intersectObjects((W3.props||[]).map(o=>o.hit),false)[0];if(ph){const o=W3.props.find(o=>o.hit===ph.object);if(Math.hypot(o.x-st.P.x,o.z-st.P.z)<2.6){w3Chime();w3Interact(o)}else st.P.target={x:o.x+.2,z:o.z+1.5};return}
    const hit=rc.intersectObjects((W3.orbs||[]).map(o=>o.core),false)[0];if(hit){const o=W3.orbs.find(o=>o.core===hit.object);if(Math.hypot(o.x-st.P.x,o.z-st.P.z)<2.4){w3Chime();w3Interact(o)}else st.P.target={x:o.x,z:o.z-1.1};return}
    const pl=new T.Plane(new T.Vector3(0,1,0),0),pt=new T.Vector3();if(rc.ray.intersectPlane(pl,pt))st.P.target={x:pt.x,z:pt.z}});
  cv.addEventListener('wheel',e=>{if(!W3.st)return;e.preventDefault();W3.st.dist=Math.max(5,Math.min(15,W3.st.dist+e.deltaY*.006))},{passive:false});
  // 虛擬搖桿
  const joy=el.querySelector('.w3-joy'),knob=joy.querySelector('i');let jid=null;
  const jmove=e=>{const r=joy.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}W3.joy.x=x;W3.joy.y=y;knob.style.transform=`translate(${x*34}px,${y*34}px)`};
  joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jmove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});
  const jend=()=>{jid=null;W3.joy.x=W3.joy.y=0;knob.style.transform=''};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
  if(matchMedia('(pointer:coarse)').matches||innerWidth<700){joy.hidden=false;el.querySelector('.w3-touch').hidden=false}
}
function w3Paint(st){if(document.getElementById('w3hw'))return;if(st.q===0){st.R.setRenderTarget(null);st.R.render(st.S,st.cam)}else{st.R.setRenderTarget(st.rt);st.R.render(st.S,st.cam);st.R.setRenderTarget(null);st.pm.uniforms.time.value=st.t;st.R.render(st.post,st.postCam)}const foc=!!(W3.dlg||W3.cut),w=document.getElementById('w3');if(w)w.classList.toggle('focus',foc);if(!foc){st.R.autoClear=false;st.R.clearDepth();st.R.render(st.LS,st.cam);st.R.autoClear=true}}
function w3Orbit(){W3.orbit=!W3.orbit;const b=document.getElementById('w3orb');if(b)b.classList.toggle('on',W3.orbit)}
function w3Frame(now){
  const st=W3.st;if(!st)return;W3.raf=requestAnimationFrame(w3Frame);
  const dt=Math.min(.05,(now-st.lastT)/1000);st.lastT=now;st.t+=dt;const {P,lucy,dog,cfg,cam}=st,K=W3.keys,T=THREE;
  {const fa=st.fa||(st.fa={n:0,s:0,warm:1});if(!document.hidden&&!document.getElementById('w3hw')){fa.n++;fa.s+=dt;if(fa.n>=90){const avg=fa.s/fa.n;fa.n=0;fa.s=0;if(fa.warm)fa.warm=0;else if(avg>.028&&st.q>0){w3ApplyQ(st,st.q-1);toast('已自動調降畫質，讓操作更順暢')}}}}
  // 建築擋在鏡頭與人物之間時變半透明
  if(cfg.fade){const cx=cam.position.x,cz=cam.position.z,dx=P.x-cx,dz=P.z-cz,L2=dx*dx+dz*dz||1;cfg.fade.forEach(f=>{f.g.visible=Math.hypot(f.x-P.x,f.z-P.z)<58;if(!f.g.visible)return;let t=((f.x-cx)*dx+(f.z-cz)*dz)/L2;t=Math.max(0,Math.min(1,t));const d=Math.hypot(f.x-(cx+dx*t),f.z-(cz+dz*t)),hid=t<.97&&d<f.r;const tg=hid?.18:1;if(f.k===tg&&tg===1)return;f.k+=(tg-f.k)*Math.min(1,dt*7);if(Math.abs(f.k-tg)<.01)f.k=tg;if(!f.m){f.m=[];f.g.traverse(o=>{if(o.isMesh&&o.material&&!Array.isArray(o.material)){o.material.userData.fb=o.material.transparent?1:0;o.material.userData.fo=o.material.opacity;f.m.push(o.material)}})}f.m.forEach(m=>{m.transparent=f.k<1||m.userData.fb===1;m.opacity=m.userData.fo*f.k;m.depthWrite=f.k>=.99})})}
  // 輸入（相對鏡頭方向）
  let ix=(K.arrowright||K.d?1:0)-(K.arrowleft||K.a?1:0)+W3.joy.x,iz=(K.arrowdown||K.s?1:0)-(K.arrowup||K.w?1:0)+W3.joy.y;
  if(W3.cut){ix=0;iz=0;P.target=null;W3.jumpReq=0;W3.rollReq=0}
  if(K.q)st.yaw-=dt*1.6;if(K.r)st.yaw+=dt*1.6;if(W3.orbit)st.yaw+=dt*.45;
  if(W3.jumpReq){W3.jumpReq=0;if(P.y<.02&&!P.roll){P.vy=5.4;w3Chime()}}
  if(W3.rollReq){W3.rollReq=0;if(!P.roll&&P.y<.3){P.roll=.001}}
  let mx=0,mz=0;const il=Math.hypot(ix,iz);
  if(il>.08){P.target=null;const l=Math.min(1,il);ix/=il;iz/=il;const cy=Math.cos(st.yaw),sy=Math.sin(st.yaw);mx=(ix*cy+iz*sy)*l;mz=(-ix*sy+iz*cy)*l}
  else if(P.target){const dx=P.target.x-P.x,dz=P.target.z-P.z,dd=Math.hypot(dx,dz);if(dd<.12)P.target=null;else{let ux=dx/dd,uz=dz/dd,bd=1e9,bc=null;st.cols.forEach(c=>{const vx=c.x-P.x,vz=c.z-P.z,dv=Math.hypot(vx,vz);if(dv<c.r+1.7&&(ux*vx+uz*vz)/dv>.25&&dv<bd){bd=dv;bc=c}});
    if(bc){const vx=bc.x-P.x,vz=bc.z-P.z,sg=Math.sign(ux*vz-uz*vx)||1,an=Math.min(1.2,(bc.r+1.7-bd)*.9)*-sg,cs=Math.cos(an),sn=Math.sin(an);const nx2=ux*cs-uz*sn;uz=ux*sn+uz*cs;ux=nx2}
    mx=ux*Math.min(1,dd*2);mz=uz*Math.min(1,dd*2);P.stuck=(P.stuck||0)+(P.mv<.4?dt:-P.stuck);if(P.stuck>2)P.target=null}}
  let sp=(K.shift?5.4:3.2);
  if(P.roll){P.roll+=dt/.7;if(P.roll>=1)P.roll=0;mx=Math.sin(P.ry);mz=Math.cos(P.ry);sp=5.6;P.vx=mx*sp;P.vz=mz*sp}else{P.vx+=(mx*sp-P.vx)*Math.min(1,dt*(P.y>.02?3:10));P.vz+=(mz*sp-P.vz)*Math.min(1,dt*(P.y>.02?3:10))}
  P.vy-=14*dt;P.y+=P.vy*dt;if(P.y<=0){P.y=0;P.vy=0}
  let nx=P.x+P.vx*dt,nz=P.z+P.vz*dt;
  st.cols.forEach(c=>{const dx=nx-c.x,dz=nz-c.z,d=Math.hypot(dx,dz),m=c.r+.28;if(d<m&&d>.0001){nx=c.x+dx/d*m;nz=c.z+dz/d*m}});
  const b=cfg.bounds;if(b.r){const d=Math.hypot(nx,nz);if(d>b.r){nx*=b.r/d;nz*=b.r/d}}else{nx=Math.max(-b.w/2+.6,Math.min(b.w/2-.6,nx));nz=Math.max(-b.d/2+.6,Math.min(b.d/2-.6,nz))}
  P.x=nx;P.z=nz;const spd=Math.hypot(P.vx,P.vz);P.mv=spd;
  if(spd>.25&&!P.roll){const ty=Math.atan2(P.vx,P.vz);let d=ty-P.ry;d=Math.atan2(Math.sin(d),Math.cos(d));P.ry+=d*Math.min(1,dt*12)}
  P.t+=dt*spd*2.6;
  const air=P.y>.04,bob=air?0:Math.abs(Math.sin(P.t))*.035*Math.min(1,spd);
  st.piv.position.set(P.x,.78+P.y+bob,P.z);st.piv.rotation.set(P.roll?P.roll*Math.PI*2:0,P.ry,0);
  const U=lucy.userData,sw=Math.sin(P.t)*.7*Math.min(1,spd/1.2);if(P.roll){U.legs[0].rotation.x=U.legs[1].rotation.x=-1.6;U.arms[0].rotation.x=U.arms[1].rotation.x=-1.1}else if(air){U.legs[0].rotation.x=-.7;U.legs[1].rotation.x=.45;U.arms[0].rotation.x=U.arms[1].rotation.x=-2.5}else{U.legs[0].rotation.x=sw;U.legs[1].rotation.x=-sw;U.arms[0].rotation.x=-sw*.7;U.arms[1].rotation.x=sw*.7}U.hd.rotation.z=Math.sin(st.t*1.3)*.02+(spd>.25?Math.sin(P.t)*.03:0);lucy.scale.y=1+Math.sin(st.t*2)*.004;if(W3.cut)w3CutUpdate(st,dt);
  // 小狗
  const ox=P.x-Math.sin(P.ry)*1.1+Math.cos(P.ry)*.5,oz=P.z-Math.cos(P.ry)*1.1-Math.sin(P.ry)*.5,dd=Math.hypot(ox-dog.position.x,oz-dog.position.z);
  if(dd>.35){const s=Math.min(dd,(spd>2?5.2:3.4)*dt);dog.rotation.y=Math.atan2(-(oz-dog.position.z),ox-dog.position.x);dog.position.x+=(ox-dog.position.x)/dd*s;dog.position.z+=(oz-dog.position.z)/dd*s;dog.userData.w=1}else dog.userData.w=0;
  dog.userData.legs.forEach((l,i)=>l.rotation.z=dog.userData.w?Math.sin(st.t*14+(i%2?Math.PI:0)+(i<2?0:Math.PI/2))*.6:0);dog.userData.tail.rotation.x=Math.sin(st.t*9)*.5;
  // 鏡頭
  // 靠近物品時鏡頭自動拉近(景深感):距離縮短、視角收窄、視線偏向物品
  let zo=null,zd=3.6;if(cfg.zoom!==false)(W3.props||[]).forEach(o=>{const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<zd){zd=d;zo=o}});
  let zt=zo?Math.max(0,Math.min(1,(3.6-zd)/2.2)):0;zt=zt*zt*(3-2*zt);if(W3.dlg&&st.zo)zt=Math.max(zt,.85);if(zo)st.zo=zo;if(W3.cut)zt*=.5;
  st.zk=(st.zk||0)+(zt-(st.zk||0))*Math.min(1,dt*3);const zk=st.zk,zdist=st.dist*(1-.4*zk);
  const fv=(st.fov0||48)-10*zk;if(Math.abs(cam.fov-fv)>.05){cam.fov=fv;cam.updateProjectionMatrix()}
  const sz=cfg.cam&&cfg.cam.shiftZ||0;let cx=P.x+Math.sin(st.yaw)*Math.cos(st.pitch)*zdist,cz=P.z+sz+Math.cos(st.yaw)*Math.cos(st.pitch)*zdist,cy=Math.max(.5,Math.sin(st.pitch)*zdist+.6+P.y*.6)*(1-.15*zk);
  if(cfg.bounds.w){const hx=(cfg.bounds.w+1)/2-.45,bz=-(cfg.bounds.d+1)/2+.45;cx=Math.max(-hx,Math.min(hx,cx));if(cz<bz)cz=bz}
  cam.position.x+=(cx-cam.position.x)*Math.min(1,dt*5);cam.position.y+=(cy-cam.position.y)*Math.min(1,dt*5);cam.position.z+=(cz-cam.position.z)*Math.min(1,dt*5);{const lo=st.zo||{x:P.x,z:P.z};cam.lookAt(P.x+(lo.x-P.x)*.45*zk,.9+P.y*.7-.12*zk,P.z+sz+(lo.z-P.z)*.45*zk)}if(st.front)st.front.visible=cam.position.z<(cfg.bounds.d+1)/2-.2;
  st.sun.position.set(P.x+cfg.sun[2][0],cfg.sun[2][1],P.z+cfg.sun[2][2]);st.sun.target.position.set(P.x,0,P.z);
  // 光點
  let nr=null,nd=2.1;(W3.orbs||[]).forEach((o,i)=>{o.core.position.y=1.15+Math.sin(st.t*1.8+i)*.08;o.ring.rotation.set(st.t*.9,st.t*.5,0);o.ring2.rotation.set(-st.t*.6,st.t*.8,1);o.lab.position.set(o.x,1.95+Math.sin(st.t*1.8+i)*.05,o.z);const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<nd){nd=d;nr=o}const s=1+Math.sin(st.t*3+i)*.06+(d<2.1?.25:0);o.core.scale.setScalar(s)});
  (W3.props||[]).forEach((o,i)=>{o.lab.position.y=(o.ly||2.45)+Math.sin(st.t*1.8+i)*.05;const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<nd){nd=d;nr=o}});
  const act=document.querySelector('#w3 .w3-act');
  if(nr){w3Prompt(nr.q.t.replace(/（.*?）/g,''),matchMedia('(pointer:coarse)').matches?'':'E');act.hidden=!(matchMedia('(pointer:coarse)').matches||innerWidth<700)}else{w3Prompt('');act.hidden=true}
  // 粒子
  const a=st.pos;for(let i=0;i<a.length/3;i++){a[i*3]+=st.vel[i][0]*dt;a[i*3+1]+=st.vel[i][1]*dt;a[i*3+2]+=st.vel[i][2]*dt;if(a[i*3+1]>6){a[i*3+1]=.2;a[i*3]=P.x+(Math.random()-.5)*24;a[i*3+2]=P.z+(Math.random()-.5)*20}}
  st.pts.geometry.attributes.position.needsUpdate=true;
  st.notes.forEach(n=>{const u=n.userData;u.a+=dt*u.sp;n.position.set(Math.cos(u.a)*u.r,u.y+Math.sin(st.t*u.sp*3+u.a)*.4,Math.sin(u.a)*u.r-1);n.material.opacity=.45+Math.sin(st.t+u.a)*.3});
  (cfg.float||[]).forEach(p=>{const u=p.userData;u.a+=dt*u.sp;p.position.set(Math.cos(u.a)*u.r,u.y+Math.sin(st.t*.8+u.a)*.4,Math.sin(u.a)*u.r*.7-1);p.rotation.y=u.a*2;p.rotation.x=Math.sin(st.t+u.a)*.4});
  st.S.children.forEach(o=>{if(o.userData&&o.userData.spin){o.rotation.y+=dt*.6;o.rotation.x+=dt*.3}});
  for(let i=st.bursts.length-1;i>=0;i--){const b=st.bursts[i];b.t+=dt;const p=b.g.attributes.position.array;for(let k=0;k<b.v.length;k++){p[k*3]+=b.v[k][0]*dt;p[k*3+1]+=b.v[k][1]*dt;b.v[k][1]-=4*dt;p[k*3+2]+=b.v[k][2]*dt}b.g.attributes.position.needsUpdate=true;b.o.material.opacity=Math.max(0,1-b.t/1.1);if(b.t>1.1){st.S.remove(b.o);b.g.dispose();b.o.material.dispose();st.bursts.splice(i,1)}}
  w3DiaUpdate(st,dt);if(W3.bb&&st.cfg.babies)w3BabyUpdate(st,dt);if(W3.flow)w3FlowUpdate(st,dt);if(cfg.guide)w3TownGuide(st,dt);
  st.key.position.set(P.x-1.4,2.9,P.z+1.6);
  {const fx=P.x-cam.position.x,fz=P.z-cam.position.z,fl=Math.hypot(fx,fz)||1;st.halo.position.set(P.x+fx/fl*.45,1.32+P.y,P.z+fz/fl*.45);st.halo.quaternion.copy(cam.quaternion)}
  w3Paint(st);
}

/* ====================== 小鎮：插畫地圖首頁 + 場景入口 ====================== */
const LOCS=[
 {id:'nurse',n:'哺乳室',en:'Nursing Room',tag:'暖橘夜燈下，安靜地餵一餐。',cat:'nanny',tasks:['bm_feed','bm_wash','bm_report'],go:'feed',goT:'前往記錄餵奶',desc:'安靜又溫暖的小房間。記錄餵奶量、寶寶的專注度與安撫方式，也順手把今天的回報傳給家長。',pal:['#1a1020','#8a4a62','#e58f9f','#ffd2b0'],mp:[130,150],pd:[0.12,-0.3],p3:[-10,0],kind:'house'},
 {id:'read',n:'閱讀室',en:'Reading Room',tag:'書牆、暖燈與漂浮的書頁。',cat:'nanny',tasks:['bm_read','sc_read'],go:'lib',goT:'打開繪本書庫',desc:'書香滿室的角落。和孩子共讀一本繪本、記錄他的反應；也別忘了替自己讀 2 頁。',pal:['#1b130b','#6b4c24','#c98a3e','#ffe0a8'],mp:[300,95],pd:[0.9,-0.72],p3:[-21,-80],kind:'house'},
 {id:'rhythm',n:'韻律教室',en:'Rhythm Studio',tag:'鼓聲與搖鈴，跟著節奏動一動。',cat:'nanny',tasks:['bm_read','mm_joy'],go:'lib',goT:'查看今日教案',desc:'鼓聲、鈴鐺與搖籃曲。跟著 Music Together 的節奏搖一搖、拍一拍。',pal:['#241b0b','#9a6a1c','#e9b43c','#fff0b0'],mp:[500,150],pd:[0.58,-0.55],p3:[-17,-55],kind:'house'},
 {id:'music',n:'音樂教室',en:'Music Studio',tag:'藍夜裡的鋼琴與星光。',cat:'nanny',tasks:['bm_read','mm_joy'],go:'lib',goT:'查看歌單與教案',desc:'鋼琴與寰宇迪士尼歌曲，依生活情境與節慶挑一首，唱給孩子聽。',pal:['#05081c','#34469a','#5f7ad0','#dfe6ff'],mp:[700,105],pd:[0.97,0.1],p3:[2,-91],kind:'house'},
 {id:'family',n:'親子館',en:'Family Center',tag:'球池、溜滑梯與大熊玩偶。',cat:'nanny',tasks:['mm_kid','mm_talk'],desc:'大寶也能玩的親子空間。專心陪他 20 分鐘，和家人聊聊天。',pal:['#2a1410','#b4543a','#e2704f','#ffe0c0'],mp:[880,200],pd:[0.36,-0.78],p3:[-19,-36],kind:'house'},
 {id:'art',n:'美術館',en:'Art Museum',tag:'聚光燈下的色彩與雕塑。',cat:'mom',tasks:['mm_joy','mm_grat'],desc:'色彩與想像力的練習。做一件讓自己開心的小事，並寫下今天的感恩。',pal:['#0e0b18','#5b3b8f','#8a63c4','#f3e8ff'],mp:[150,380],pd:[0.74,-0.15],p3:[-4,-66],kind:'house'},
 {id:'museum',n:'博物館',en:'Natural Museum',tag:'恐龍骨架與午後的光柱。',cat:'mom',tasks:['sc_read','mm_grat'],desc:'安靜的展廳。觀察、提問、慢慢走；回家前補上今天的書頁。',pal:['#0c0d12','#3c4a58','#7d8d9c','#ffe9c0'],mp:[340,450],pd:[0.84,0.45],p3:[17,-74],kind:'house'},
 {id:'botanic',n:'植物園',en:'Botanic Garden',tag:'玻璃溫室裡的綠光與水氣。',cat:'self',tasks:['sc_water','mm_joy'],desc:'溫室裡的綠意與水氣。慢慢散步，記得補水：果乾水 900 ml。',pal:['#041510','#146a4c','#4fb88a','#e6fff0'],mp:[580,440],pd:[0.52,0.15],p3:[4,-44],kind:'dome'},
 {id:'park',n:'公園',en:'City Park',tag:'黃昏的草地、池塘與鞦韆。',cat:'mom',tasks:['mm_kid','bm_safe'],desc:'陽光、草地與鞦韆。帶孩子出門放電，順便做環境安全巡檢。',pal:['#2a1d4a','#c0605a','#e88a5a','#ffe0b0'],mp:[790,470],pd:[0.3,0.62],p3:[15,-27],kind:'lawn'},
 {id:'zoo',n:'動物園',en:'Zoo',tag:'大象、長頸鹿與午後的稀樹草原。',cat:'mom',tasks:['mm_kid','mm_talk'],desc:'看動物、學叫聲。大寶與寶寶的最愛，邊走邊聊今天看到什麼。',pal:['#2a1d0c','#a4702a','#d9a04a','#fff0c8'],mp:[930,360],pd:[0.66,0.85],p3:[23,-55],kind:'pen'}
];
const TOWN={id:'town',n:'雙北小鎮',en:'Town Square',tag:'自由走動，走到建築門口按 E 進入。',cat:'mom',tasks:[],desc:'十棟造型各異的建築圍著中央噴泉。想去哪裡，就直接走過去。'};
const locOf=id=>id==='town'?TOWN:LOCS.find(l=>l.id===id);
const wSeed=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const PLAZA=[500,310];
/* ====== 可切換畫風 ====== */
const STYLES={m:'慕夏'};
const STYLE='m';
function applyStyleX(){document.body.classList.add('th-m')}applyStyleX();
const mixc=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const MAPTH={m:{lab:'#f7edd5',labt:'#4a3426',labs:'#c49a3c'}};

/* ====== 慕夏（Art Nouveau）地圖 ====== */
const MK='#4a3426',MG='#c49a3c';
function bez(p0,p1,p2,t){const u=1-t;return[u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]]}
function bezA(p0,p1,p2,t){const dx=2*(1-t)*(p1[0]-p0[0])+2*t*(p2[0]-p1[0]),dy=2*(1-t)*(p1[1]-p0[1])+2*t*(p2[1]-p1[1]);return Math.atan2(dy,dx)*180/Math.PI}
function mapBuildingM(L,i,got){
  const [x,y]=L.mp,dome=['#b5654a','#4f7a7a','#c49a3c','#8a9a6a','#c98a85','#7a6a9a'][i%6],O=`stroke="${MK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;let body='';
  const halo=`<circle cx="0" cy="2" r="60" fill="#f7edd5" fill-opacity=".75" stroke="${MG}" stroke-width="1.6"/><circle cx="0" cy="2" r="54" fill="none" stroke="${MG}" stroke-opacity=".55" stroke-width=".9"/>`;
  if(L.kind==='house')body=`${halo}<path d="M-30,30 V-4 A30,30 0 0 1 30,-4 V30 Z" fill="#f7edd5" ${O}/><path d="M-34,-4 A34,34 0 0 1 34,-4 Z" fill="${dome}" ${O}/><circle cx="0" cy="-40" r="3.4" fill="${MG}" ${O}/><path d="M-22,-4 A22,22 0 0 1 22,-4" fill="none" stroke="#f7edd5" stroke-opacity=".6" stroke-width="2"/><path d="M-8,30 V15 A8,8 0 0 1 8,15 V30 Z" fill="${dome}" ${O}/><circle cx="-19" cy="10" r="5" fill="#f3d98a" ${O}/><circle cx="19" cy="10" r="5" fill="#f3d98a" ${O}/>`;
  else if(L.kind==='dome')body=`${halo}<rect x="-32" y="4" width="64" height="26" fill="#e3ecd0" ${O}/><path d="M-32,4 A32,34 0 0 1 32,4 Z" fill="#cfe0c8" ${O}/><path d="M-16,4 A16,34 0 0 1 16,4 M0,-30 V4" fill="none" stroke="${MK}" stroke-width="1.4"/><circle cx="-14" cy="19" r="7" fill="#8a9a6a" ${O}/><circle cx="8" cy="20" r="8" fill="#a3ad74" ${O}/><circle cx="22" cy="16" r="5" fill="#c98a85" ${O}/>`;
  else if(L.kind==='lawn')body=`${halo}<ellipse cx="0" cy="8" rx="44" ry="30" fill="#c9cf94" ${O}/><ellipse cx="-12" cy="12" rx="16" ry="9" fill="#7fb0a8" ${O}/><path d="M12,-12 L9,18 M34,-12 L37,18 M9,-12 H37" stroke="${dome}" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="-30" cy="-8" r="8" fill="#8a9a6a" ${O}/>`;
  else body=`${halo}<ellipse cx="0" cy="8" rx="44" ry="30" fill="#ecd9a0" ${O}/><ellipse cx="0" cy="8" rx="37" ry="24" fill="none" stroke="${MK}" stroke-width="1.5" stroke-dasharray="1 5" stroke-linecap="round"/><circle cx="-16" cy="6" r="9" fill="#b9b2a0" ${O}/><circle cx="14" cy="12" r="7" fill="#c49a3c" ${O}/><rect x="10" y="-12" width="4" height="18" rx="2" fill="#c49a3c" ${O}/><circle cx="12" cy="-14" r="4" fill="#c49a3c" ${O}/>`;
  return`<g class="mb ${got?'got':''} ${isLocked(L.id)?'locked':''}" data-loc="${L.id}" transform="translate(${x},${y}) scale(${(L.sc||1).toFixed(3)})" tabindex="0" role="button" aria-label="${esc(L.n)}"><g class="mbi">${body}</g>
   <g transform="translate(0,56)"><path d="M-49,-12 H49 L43,1 L49,14 H-49 L-43,1 Z" fill="${got?'#dfe6c4':'#f7edd5'}" stroke="${MK}" stroke-width="1.8" stroke-linejoin="round"/><text y="5.5" text-anchor="middle" font-size="15" font-weight="700" fill="${MK}" font-family="'Noto Serif TC',serif">${esc(L.n)}</text></g>
   ${isLocked(L.id)?`<g transform="translate(40,-34)"><circle r="11" fill="#d9a24a" ${O}/><path d="M-4,-1 V-3.5 a4,4 0 0 1 8,0 V-1" fill="none" stroke="${MK}" stroke-width="2"/><rect x="-5.5" y="-1" width="11" height="8" rx="2" fill="#f7edd5" ${O}/></g>`:got?`<g transform="translate(40,-34)"><circle r="10" fill="#8a9a6a" ${O}/><path d="M-5,0 L-1.5,4 L5.5,-4" stroke="#f7edd5" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`:''}</g>`;
}
/* ====== 世界地圖：大陸、群系區塊、海洋（慕夏配色） ====== */
const WM={w:1400,h:720,bs:.8,px:700,py:600,cx:700,cy:385,rx:540,ry:325};
let WMP=false;const WM_L=Object.assign({},WM);const WM_P={w:720,h:1000,bs:.95,px:360,py:905,cx:360,cy:500,rx:335,ry:480};
function wmSet(p){Object.assign(WM,p?WM_P:WM_L);WMP=p}
const mpOf=L=>{const [d,u]=L.pd,g=WMP?{Lw:300,Dr:830,k:.3}:{Lw:430,Dr:540,k:.35};return[PLAZA[0]+u*g.Lw*(1-g.k*d),PLAZA[1]-Math.pow(d,.9)*g.Dr]};
const wcv=(x,y)=>[WM.px+(x-PLAZA[0])*WM.bs,WM.py+(y-PLAZA[1])*WM.bs];
const BIOME={nurse:'#e3b59f',read:'#e8cf8e',rhythm:'#e2b1ad',music:'#c3cfa0',family:'#ecc3a0',art:'#cbbbd8',museum:'#dccb9f',botanic:'#abc99a',park:'#c7d99b',zoo:'#e8c682'};
function blobPts(cx,cy,rx,ry,n,seed){const R=wSeed(seed),a=[];for(let i=0;i<n;i++){const t=i/n*Math.PI*2,k=1+(R()-.5)*.2+(i%7===3?-.1:0);a.push([cx+Math.cos(t)*rx*k,cy+Math.sin(t)*ry*k])}return a}
function smoothPath(p){const n=p.length;let d=`M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;for(let i=0;i<n;i++){const p0=p[(i-1+n)%n],p1=p[i],p2=p[(i+1)%n],p3=p[(i+2)%n];d+=` C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)},${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)},${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`}return d+'Z'}
function voronoiCell(i,seeds){let poly=[[0,0],[WM.w,0],[WM.w,WM.h],[0,WM.h]];const [xi,yi]=seeds[i];
  seeds.forEach(([xj,yj],j)=>{if(j===i)return;const a=xj-xi,b=yj-yi,c=(xj*xj+yj*yj-xi*xi-yi*yi)/2,out=[];
    for(let k=0;k<poly.length;k++){const P=poly[k],Q=poly[(k+1)%poly.length],fp=a*P[0]+b*P[1]-c,fq=a*Q[0]+b*Q[1]-c;
      if(fp<=0)out.push(P);if((fp<0&&fq>0)||(fp>0&&fq<0)){const t=fp/(fp-fq);out.push([P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t])}}
    poly=out});return poly}
function townMapMucha(V){
  const R=wSeed(99),trees=[],OF=`translate(${(WM.px-PLAZA[0]*WM.bs).toFixed(1)},${(WM.py-PLAZA[1]*WM.bs).toFixed(1)}) scale(${WM.bs})`,inLand=(x,y,k)=>(((x-WM.cx)/WM.rx)**2+((y-WM.cy)/WM.ry)**2)<k;
  const LP=LOCS.map(L=>({...L,mp:mpOf(L),sc:1.25-L.pd[0]*.55}));
  const isNear=(x,y,r)=>LP.some(L=>Math.hypot(L.mp[0]-x,L.mp[1]-y)<r)||Math.hypot(PLAZA[0]-x,PLAZA[1]-y)<r+36;
  let tries=0;while(trees.length<52&&tries++<2200){const x=WMP?190+R()*620:20+R()*960,y=WMP?-560+R()*900:-250+R()*590;if(isNear(x,y,84))continue;if(Math.abs(y-(290+Math.sin(x/160)*30))<46)continue;{const [qx,qy]=wcv(x,y);if(!inLand(qx,qy,.6))continue}trees.push([x,y,10+R()*7,Math.floor(R()*5)])}
  const roads=LP.map(L=>{const [x,y]=L.mp,mx=(x+PLAZA[0])/2+(y-PLAZA[1])*.14,my=(y+PLAZA[1])/2-(x-PLAZA[0])*.14;return`<path d="M${PLAZA[0]},${PLAZA[1]} Q${mx},${my} ${x},${y+24}"/>`}).join('');
  const TC=['#8a9a6a','#a3ad74','#6f8c6a','#c98a85','#d9b45a'],O=`stroke="${MK}" stroke-width="2" stroke-linejoin="round"`;
  const land=smoothPath(blobPts(WM.cx,WM.cy,WM.rx,WM.ry,22,7)),seeds=LP.map(L=>wcv(L.mp[0],L.mp[1]));
  const cells=LOCS.map((L,i)=>{const c=voronoiCell(i,seeds);return`<polygon points="${c.map(p=>p[0].toFixed(0)+','+p[1].toFixed(0)).join(' ')}" fill="${BIOME[L.id]}" stroke="${MG}" stroke-width="2.2" stroke-linejoin="round" stroke-dasharray="9 5"/><polygon points="${c.map(p=>p[0].toFixed(0)+','+p[1].toFixed(0)).join(' ')}" fill="url(#tmdot)" stroke="none"/>`}).join('');
  const RW=wSeed(31),waves=[];for(let k=0;k<70;k++){const x=30+RW()*(WM.w-60),y=20+RW()*(WM.h-40);if(inLand(x,y,1.2))continue;waves.push(`<path d="M${x.toFixed(0)},${y.toFixed(0)} q7,-7 14,0 t14,0" fill="none" stroke="#fff8e4" stroke-opacity=".75" stroke-width="2" stroke-linecap="round"/>`)}
  const isl=(WMP?[[80,900,34,22],[640,110,40,26],[620,910,28,18],[90,200,30,20]]:[[250,640,34,22],[1230,90,40,26],[1180,640,28,18],[210,150,30,20]]).map(([x,y,rx,ry],i)=>`<path d="${smoothPath(blobPts(x,y,rx,ry,9,40+i))}" fill="#e8d7a8" stroke="${MK}" stroke-width="2"/><path d="${smoothPath(blobPts(x,y,rx*.7,ry*.7,9,50+i))}" fill="#c3cfa0" stroke="${MG}" stroke-width="1.2"/><circle cx="${x}" cy="${y-4}" r="7" fill="#8a9a6a" ${O}/>`).join('');
  const petals=Array.from({length:8},(_,k)=>`<ellipse cx="0" cy="-30" rx="9" ry="17" fill="${k%2?'#c98a85':'#a3ad74'}" ${O} transform="rotate(${k*45})"/>`).join('');
  const corner=(tx,ty,sx,sy)=>`<g transform="translate(${tx},${ty}) scale(${sx},${sy})"><path d="M10,10 H70 M10,10 V70" stroke="${MG}" stroke-width="3" fill="none"/><path d="M18,18 Q60,18 60,60" stroke="${MK}" stroke-width="1.4" fill="none"/><circle cx="26" cy="26" r="7" fill="#c98a85" ${O}/><ellipse cx="48" cy="22" rx="10" ry="4.5" fill="#a3ad74" ${O} transform="rotate(10 48 22)"/><ellipse cx="22" cy="48" rx="4.5" ry="10" fill="#a3ad74" ${O} transform="rotate(-10 22 48)"/></g>`;
  const river='M-560,190 C-200,330 330,240 520,300 S820,270 1560,380';
  return`<svg class="tmap" viewBox="0 0 ${WM.w} ${WM.h}" preserveAspectRatio="xMidYMid slice" role="group" aria-label="小鎮世界地圖"><defs>
   <filter id="tmn"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .32 0 0 0 0 .2 0 0 0 .5 0"/></filter>
   <pattern id="tmdot" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="${MG}" fill-opacity=".45"/><circle cx="10" cy="10" r="1" fill="${MK}" fill-opacity=".18"/></pattern>
   <pattern id="tmsea" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0,20 q10,-8 20,0 t20,0" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/></pattern>
   <clipPath id="tmland"><path d="${land}"/></clipPath></defs>
   <rect width="${WM.w}" height="${WM.h}" fill="#a9cfc4"/><rect width="${WM.w}" height="${WM.h}" fill="url(#tmsea)"/>
   <rect width="${WM.w}" height="${WM.h}" fill="url(#tmsea)" opacity=".6"/>${waves.join('')}${isl}
   <path d="${land}" fill="none" stroke="#d6e9de" stroke-width="64" stroke-linejoin="round" opacity=".7"/><path d="${land}" fill="none" stroke="#e8f1e2" stroke-width="34" stroke-linejoin="round" opacity=".8"/>
   <path d="${land}" fill="#efe2c0" stroke="${MK}" stroke-width="6" stroke-linejoin="round"/>
   <g clip-path="url(#tmland)">${cells}
    <g transform="${OF}"><path d="${river}" fill="none" stroke="${MK}" stroke-width="40" stroke-linecap="round"/><path d="${river}" fill="none" stroke="#8fc0b6" stroke-width="35" stroke-linecap="round"/><path d="${river}" fill="none" stroke="#e1f0ea" stroke-width="2.4" stroke-dasharray="16 14" stroke-linecap="round"/></g></g>
   <path d="${land}" fill="none" stroke="${MG}" stroke-width="2.2" stroke-linejoin="round" transform="translate(0 0)" stroke-dasharray="1 0"/><path d="${land}" fill="none" stroke="#fff8e4" stroke-width="1" stroke-opacity=".7" stroke-linejoin="round" transform="scale(1.012) translate(-8.4 -4.7)"/>
   <g transform="${OF}"><g fill="none" stroke-linecap="round"><g stroke="${MK}" stroke-width="9">${roads}</g><g stroke="#f3e4b0" stroke-width="6">${roads}</g><g stroke="${MG}" stroke-width="1.6" stroke-dasharray="1 6">${roads}</g></g>
   <g transform="translate(${PLAZA[0]},${PLAZA[1]})"><circle r="52" fill="#f3e4b0" ${O}/><circle r="46" fill="none" stroke="${MG}" stroke-width="1.4"/>${petals}<circle r="11" fill="${MG}" ${O}/></g>
   ${trees.map(([x,y,r,c])=>`<ellipse cx="${(x+2).toFixed(0)}" cy="${(y+r*1.1).toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r*.35).toFixed(0)}" fill="${MK}" opacity=".12"/><path d="M${x.toFixed(0)},${(y+r*.5).toFixed(0)} V${(y+r*1.1).toFixed(0)}" stroke="${MK}" stroke-width="2.4" stroke-linecap="round"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${TC[c]}" ${O}/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r*.55).toFixed(1)}" fill="none" stroke="${MK}" stroke-opacity=".5" stroke-width="1.2"/>`).join('')}
   ${LP.map((L,i)=>mapBuildingM(L,i,V[L.id])).join('')}
   <g id="tmMe" style="transform:translate(${PLAZA[0]}px,${PLAZA[1]-8}px)"><circle cy="-2" r="26" fill="none" stroke="${MG}" stroke-width="1.8"/><ellipse cy="19" rx="12" ry="4" fill="${MK}" opacity=".18"/><path d="M-9,17 L-6,3 H6 L9,17 Z" fill="#fff" ${O}/><path d="M-7,5 H7 L5,-2 H-5 Z" fill="#8cc3e6" ${O}/><circle cy="-10" r="11" fill="#f6cfa4" ${O}/><path d="M-13,-8 A13,13 0 0 1 13,-8 L13,2 Q9,5 8,0 V-5 H-8 V0 Q-9,5 -13,2 Z" fill="#2a2430" ${O}/><circle cx="-4.6" cy="-8" r="3.6" fill="#fff" stroke="${MK}" stroke-width="1.4"/><circle cx="4.6" cy="-8" r="3.6" fill="#fff" stroke="${MK}" stroke-width="1.4"/></g></g>
   <rect width="${WM.w}" height="${WM.h}" filter="url(#tmn)" opacity=".13" style="mix-blend-mode:multiply" pointer-events="none"/>
   <rect x="6" y="6" width="${WM.w-12}" height="${WM.h-12}" rx="6" fill="none" stroke="${MG}" stroke-width="3" pointer-events="none"/><rect x="14" y="14" width="${WM.w-28}" height="${WM.h-28}" rx="3" fill="none" stroke="${MK}" stroke-width="1.2" pointer-events="none"/>
   ${corner(0,0,1,1)}${corner(WM.w,0,-1,1)}${corner(0,WM.h,1,-1)}${corner(WM.w,WM.h,-1,-1)}
  </svg>`;
}

function townMap(V){return townMapMucha(V)}
function sunArc(){
  const d=new Date(),h=d.getHours()+d.getMinutes()/60,day=h>=6&&h<18,t=day?(h-6)/12:((h+(h<6?24:0))-18)/12,th=Math.PI*(1-t),x=110+100*Math.cos(th),y=84-80*Math.sin(th);
  return`<svg class="sarc" viewBox="0 0 220 96"><path d="M10,84 A100,80 0 0 1 210,84" fill="none" style="stroke:var(--mu)" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="2 7" stroke-linecap="round"/><line x1="0" y1="84" x2="220" y2="84" style="stroke:var(--bd)" stroke-width="1.5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="${day?'#ffd35c':'#cfd8e6'}" opacity=".4"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7.5" fill="${day?'#f5b83e':'#e8eef6'}"/></svg>`;
}
const greet=()=>{const h=new Date().getHours();return h<5?'夜深了':h<11?'早安':h<14?'午安':h<18?'下午好':'晚安'};
function setBoots(b){
  W3.bootsLocal=b;if(!RO){S.rpg.boots=b;save()}
  if(W3.st)W3.st.lucy.userData.legs.forEach(p=>{p.userData.bw.visible=b!=='black';p.userData.bb.visible=b==='black'});
  if(MODE==='rpg')renderRpg();
}
const _arm=applyRpgMode;applyRpgMode=function(){_arm();if(MODE!=='rpg'&&W3.open)w3Close()};

function locBanner(L,i){const g=mapBuildingM({...L,mp:[0,0]},i,false).replace('class="mb ','class="x ').replace(/tabindex="0" role="button"/,'');return`<svg viewBox="-80 -70 160 150" aria-hidden="true">${g}</svg>`}
let wSel=null,wGrp='loc',wMobile=null;
function rWorld(el){
  wmSet(innerWidth<700&&innerHeight>innerWidth*1.15);
  const d=new Date(),st=dailyStats(),L=lvInfo(S.rpg.xp),V=S.rpg.visits[TK()]||{},boots=W3.bootsLocal||S.rpg.boots||'white',WDN='日一二三四五六',nVis=Object.keys(V).length;
  const me=S.members.find(m=>m.id==='lucy')||S.members[0]||{name:''},todo=dailyList().filter(q=>!qState(q,TK()).done).slice(0,4),dl=dailyList(),TKd=TK();
  const lq=l=>l.tasks.map(id=>dl.find(x=>x.id===id)).filter(Boolean);
  const lStat=l=>{const q=lq(l);return{q,dn:q.filter(x=>qState(x,TKd).done).length}};
  if(!wSel||!LOCS.some(l=>l.id===wSel))wSel='nurse';
  const grp=(k,t,body)=>`<div class="mg ${wGrp===k?'open':''}"><button class="mgh" data-g="${k}"><span>${t}</span><i>▾</i></button><div class="mgb">${body}</div></div>`;
  const locRows=LOCS.map(l=>{const s=lStat(l);return`<button class="mr ${l.id===wSel?'sel':''} ${V[l.id]?'got':''}" data-loc="${l.id}"><b>${esc(l.n)}${l.id==='nurse'?' <em class="fre">免費體驗</em>':''}</b><span>${isLocked(l.id)?'🔒':(V[l.id]?'✓ ':'')+s.dn+'/'+s.q.length}</span></button>`}).join('');
  const todoRows=dl.filter(q=>!qState(q,TKd).done).slice(0,7).map(q=>`<div class="mt"><span>${esc(q.t.replace(/（.*?）/g,''))}</span><em>+${q.xp}</em></div>`).join('')||'<div class="mt"><span>今天的任務都完成了</span></div>';
  const wk=periodList('weekly').slice(0,6).map(q=>{const p=Math.min(q.target,q.prog());return`<div class="mt"><span>${esc(q.t)}</span><em>${p}/${q.target}</em></div>`}).join('');
  const sel=LOCS.find(l=>l.id===wSel),si=LOCS.indexOf(sel),ss=lStat(sel),vr=reward(sel.cat,8,2);
  const det=`<div class="mdh"><small>${esc(sel.en)}</small><h3>${esc(sel.n)}${sel.id==='nurse'?' <em class="fre">免費體驗</em>':''}</h3></div><div class="mdi">${locBanner(sel,si)}</div>
   <div class="mds"><h4>任務目標</h4><ul>${ss.q.map(q=>{const s=qState(q,TKd);return`<li class="${s.done?'ok':''}"><i>${s.done?'✓':'○'}</i><span>${esc(q.t.replace(/（.*?）/g,''))}</span><em>+${q.xp} XP</em></li>`}).join('')}</ul></div>
   <div class="mds"><h4>地點介紹</h4><p>${esc(sel.desc)}</p></div>
   <div class="mds"><h4>任務獎勵</h4><div class="mrw"><span class="${V[sel.id]?'got':''}">${V[sel.id]?'✓ ':''}到訪 +${vr.xp} XP</span><span>+${vr.coins} ◎</span>${ss.q.length?`<span>任務 +${ss.q.reduce((t,q)=>t+q.xp,0)} XP</span>`:''}</div></div>
   ${isLocked(sel.id)?`<button class="mgo pay" data-pay="${sel.id}">🔒 付費解鎖</button>`:`<button class="mgo" data-go="${sel.id}">前往</button>`}`;
  el.innerHTML=`<div class="town"><section class="tmw"><div class="tmh"><div><small>WORLD MAP</small><h2>今天想去哪裡走走？</h2></div><span>點選地點查看任務，按「前往」帶著小狗走進去</span><button class="tm3d" id="go3d">🚶 進入 3D 小鎮・自由走動</button></div>
    <div class="tmv">${townMap(V)}
     <aside class="mlist"><div class="mlh">任務列表</div>${grp('loc','地點任務',locRows)}${grp('todo','今日待辦',todoRows)}${grp('wk','每週任務',wk)}</aside>
     <aside class="mdet">${det}</aside></div></section>
    <aside class="tday"><div class="tdl"><div class="td-g"><small>${d.getMonth()+1} 月 ${d.getDate()} 日 · 週${WDN[d.getDay()]}</small><h1>${greet()}，${esc(me.name)}</h1></div>
    ${sunArc()}
    <div class="td-r"><div class="ring" style="--p:${st.pct}"><b>${st.pct}<i>%</i></b></div><div><b>${st.done} / ${st.total}</b> 件今日任務<br><span>${S.q.clear[TK()]?'已通關，今天很棒':'完成 70% 即可通關'}</span></div></div>
    </div><div class="tdr"><div class="td-h"><span>接下來</span><button class="lnk" data-tab="quest">全部任務 ›</button></div>
    <div class="td-l">${todo.map(q=>taskRow(q,TK())).join('')||'<div class="hint">今天的任務都完成了。</div>'}</div>
    <div class="td-b"><span>今日走訪 ${nVis}/${LOCS.length}</span><div class="wboots"><button class="${boots==='white'?'on':''}" data-boots="white">白色長靴</button><button class="${boots==='black'?'on':''}" data-boots="black">黑色厚底靴</button></div></div></div></aside></div>`;
  const svg=el.querySelector('.tmap'),mob=innerWidth<900;if(svg&&mob&&!WMP)svg.setAttribute('viewBox','240 80 880 620');el.querySelector('.tmv').classList.toggle('mob',mob);el.querySelector('.tmv').classList.toggle('por',WMP);wMobile=mob;
  bindQ(el.querySelector('.td-l'));
  el.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{rTab=b.dataset.tab;renderRpg();window.scrollTo(0,0)});
  el.querySelectorAll('[data-boots]').forEach(b=>b.onclick=()=>setBoots(b.dataset.boots));
  const me2=el.querySelector('#tmMe');let busy=false;
  const pick=id=>{wSel=id;rWorld(el)};
  const enter=id=>{if(isLocked(id)){w3Paywall(id);return}if(busy)return;busy=true;const L2=LOCS.find(l=>l.id===id);me2.style.transition='transform .7s cubic-bezier(.5,0,.2,1)';{const pm=mpOf(L2);me2.style.transform='translate('+pm[0]+'px,'+(pm[1]+16)+'px)'};setTimeout(()=>{busy=false;w3Enter(id)},700)};
  el.querySelectorAll('.tmap .mb').forEach(n=>{const id=n.dataset.loc;n.onclick=()=>pick(id);n.ondblclick=()=>enter(id);n.onkeydown=e=>{if(e.key==='Enter')pick(id)}});
  el.querySelectorAll('.mr').forEach(b=>b.onclick=()=>pick(b.dataset.loc));
  el.querySelectorAll('.mgh').forEach(b=>b.onclick=()=>{wGrp=wGrp===b.dataset.g?'':b.dataset.g;rWorld(el)});
  const g3=el.querySelector('#go3d');if(g3)g3.onclick=()=>{W3.townSpawn=null;w3Enter('town')};
  const go=el.querySelector('.mgo');if(go)go.onclick=()=>enter(go.dataset.go||go.dataset.pay);
  const hl=el.querySelector(`.tmap .mb[data-loc="${wSel}"]`);if(hl)hl.classList.add('sel');
}
if(!window._wRz){window._wRz=1;window.addEventListener('resize',()=>{if(MODE==='rpg'&&rTab==='world'&&!W3.open&&wMobile!==null&&wMobile!==(innerWidth<900)){const r=document.getElementById('rbody');if(r&&r.querySelector('.town'))rWorld(r)}})}

function renderRpg(){
  const root=$('#rpgRoot'),R=S.rpg,L=lvInfo(R.xp),me=S.members.find(m=>m.id==='lucy')||S.members[0]||{name:'獵人'},st=dailyStats();
  const titles=allTitles(),title=titles.includes(R.title)?R.title:titles[titles.length-1];
  const tabs=SHOWMAP?[]:[['world','小鎮'],['quest','任務'],['gear','裝備'],['skill','技能樹'],['log','日誌']];if(SHOWMAP)rTab='world';
  const pc=Math.round(L.into/L.need*100);
  root.innerHTML=`<div class="rwrap">
   <header class="rtop"><div class="rbrand">雙北育兒大冒險</div><nav class="rtabs">${tabs.map(([k,n])=>`<button data-t="${k}" class="${rTab===k?'on':''}">${n}</button>`).join('')}</nav>
    <div class="rchips"><span class="rchip" title="等級"><em>Lv</em>${L.lv}</span><span class="rchip" title="金幣"><em>◎</em>${nm(R.coins)}</span><span class="rchip" title="技能點"><em>✦</em>${spAvail()}</span><span class="rchip" title="連續通關"><em>▲</em>${streak()}</span></div></header>
   ${RO?`<div class="rro">${SHOWMAP?'世界地圖展示板：點選地點看介紹，也可以進入 3D 小鎮自由走動。內容唯讀、已去識別化，不含任何家人或行程資料。':SHOWCASE?'展示板：這是 保母 的「雙北育兒大冒險」快照，可以到處逛逛、看任務與徽章，但無法修改，也不含任何家人或行程資料。':'唯讀檢視：可以瀏覽進度，只有擁有者能完成任務與領取獎勵。'}</div>`:''}
   ${rTab==='world'?'':`<section class="rhud"><div class="rlv" style="--p:${pc}"><b>${L.lv}</b></div><div class="rid"><div class="rname">${esc(me.name)} <span class="rtitle">${esc(title)}</span></div>${rBar(L.into,L.need,'xp')}<div class="rsub">XP ${nm(R.xp)} · 距離下一級 ${nm(L.need-L.into)} · 今日進度 ${st.pct}%</div></div></section>`}
   <main id="rbody"></main></div>`;
  root.querySelectorAll('.rtabs button').forEach(b=>b.onclick=()=>{rTab=b.dataset.t;renderRpg();window.scrollTo(0,0)});
  ({world:rWorld,quest:rQuest,gear:rGear,skill:rSkill,log:rLog})[rTab]($('#rbody'));
  if(typeof w3Refresh==='function')w3Refresh();
}

/* ---- 走訪獎勵、徽章、每週任務 ---- */
function visitLoc(id){
  if(RO)return;const d=TK(),L=LOCS.find(l=>l.id===id),V=(S.rpg.visits[d]=S.rpg.visits[d]||{});if(V[id])return;
  V[id]=1;const r=reward(L.cat,8,2);S.rpg.xp+=r.xp;S.rpg.coins+=r.coins;logRpg('到訪：'+L.n,r);
  Object.keys(S.rpg.visits).sort().slice(0,-120).forEach(k=>delete S.rpg.visits[k]);
  toast(`到訪 ${L.n}　+${r.xp} XP · +${r.coins} 金幣`);afterChange();
}
const visitsWeek=()=>new Set(weekDates().flatMap(d=>Object.keys(S.rpg.visits[d]||{}))).size;
const visitsEver=()=>new Set(Object.values(S.rpg.visits).flatMap(o=>Object.keys(o))).size;
WQ.push({id:'w_visit',cat:'mom',t:'本週走訪 6 個不同的小鎮場景',target:6,xp:90,coins:30,prog:visitsWeek});
BADGES.push({id:'b_ex5',name:'小鎮散步家',title:'散步達人',desc:'同一天走訪 5 個場景',ok:()=>Object.values(S.rpg.visits).some(o=>Object.keys(o).length>=5)},
 {id:'b_exall',name:'走遍小鎮',title:'小鎮地圖師',desc:'累計走訪全部 10 個場景',ok:()=>visitsEver()>=LOCS.length});

/* ---------- 啟動 ---------- */
applyTheme();render();initAccess();
if(SHOWCASE)document.body.insertAdjacentHTML("beforeend",'<div class="showtag">❦ 唯讀展示板 · 內容已去識別化 ❦</div>');
if(!IN_ARTIFACT&&!SHOWCASE){
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  try{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{S=JSON.parse(e.newValue);norm();render()}catch(err){}}});
}
setInterval(()=>{if(view==='lib'){$('#clock').textContent=`${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`;return}if(!document.querySelector('dialog[open]'))render()},30000);

// ───────── 洗手台：全螢幕洗手動畫（沾濕 → 慕斯 → 七步搓洗 → 沖洗 → 擦乾 → 丟紙巾）─────────
const HW_SVG=`<svg class="hws" id="hwS" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="hwBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe3c4"/><stop offset=".6" stop-color="#d6e2d2"/><stop offset="1" stop-color="#bfd5c8"/></linearGradient>
 <radialGradient id="hwHalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7de"/><stop offset=".7" stop-color="#f6e6b8"/><stop offset="1" stop-color="#ecd49a"/></radialGradient>
 <linearGradient id="hwCt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8efe0"/><stop offset="1" stop-color="#e6cdb6"/></linearGradient>
 <linearGradient id="hwBs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b7d4dc"/><stop offset="1" stop-color="#e5f1f1"/></linearGradient>
 <linearGradient id="hwMt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa6a4"/><stop offset=".45" stop-color="#f4f1e6"/><stop offset="1" stop-color="#8d9997"/></linearGradient>
 <linearGradient id="hwWt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8ec9e6"/><stop offset=".5" stop-color="#e9f8ff"/><stop offset="1" stop-color="#8ec9e6"/></linearGradient>
 <linearGradient id="hwSk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbdcc2"/><stop offset=".6" stop-color="#f5cdaf"/><stop offset="1" stop-color="#eebb9c"/></linearGradient>
 <pattern id="hwTile" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M40,2 L78,40 L40,78 L2,40Z" fill="none" stroke="#c9b27a" stroke-width="1.4" opacity=".5"/><circle cx="40" cy="40" r="4" fill="#c9b27a" opacity=".5"/></pattern>
</defs>
<rect x="-600" y="-100" width="2800" height="1100" fill="url(#hwBg)"/>
<rect x="-600" y="120" width="2800" height="560" fill="url(#hwTile)" opacity=".7"/>
<g id="hwDeco">
 <circle cx="800" cy="360" r="330" fill="url(#hwHalo)" stroke="#c49a3c" stroke-width="6"/><circle cx="800" cy="360" r="352" fill="none" stroke="#c49a3c" stroke-width="2" stroke-dasharray="3 14" stroke-linecap="round"/><circle cx="800" cy="360" r="300" fill="none" stroke="#c9a85c" stroke-width="2"/>
 <path d="M250,720 C150,560 260,430 190,300 C150,220 220,150 300,150" fill="none" stroke="#7da07a" stroke-width="6" stroke-linecap="round"/><path d="M1350,720 C1450,560 1340,430 1410,300 C1450,220 1380,150 1300,150" fill="none" stroke="#7da07a" stroke-width="6" stroke-linecap="round"/>
 <g fill="#e58f9f" stroke="#7a4a30" stroke-width="2"><circle cx="190" cy="300" r="22"/><circle cx="262" cy="440" r="17"/><circle cx="300" cy="150" r="18"/><circle cx="1410" cy="300" r="22"/><circle cx="1338" cy="440" r="17"/><circle cx="1300" cy="150" r="18"/></g>
 <g fill="#8fb384" stroke="#4d7048" stroke-width="2"><ellipse cx="228" cy="380" rx="26" ry="11" transform="rotate(-35 228 380)"/><ellipse cx="170" cy="230" rx="26" ry="11" transform="rotate(40 170 230)"/><ellipse cx="1372" cy="380" rx="26" ry="11" transform="rotate(35 1372 380)"/><ellipse cx="1430" cy="230" rx="26" ry="11" transform="rotate(-40 1430 230)"/></g>
</g>
<g id="hwCounter">
 <rect x="-600" y="690" width="2800" height="420" fill="url(#hwCt)"/><rect x="-600" y="690" width="2800" height="10" fill="#fffaf0"/><path d="M-600,690 H2200" stroke="#c49a3c" stroke-width="5"/>
 <ellipse cx="800" cy="800" rx="430" ry="108" fill="#f6f1e6" stroke="#c49a3c" stroke-width="6"/><ellipse cx="800" cy="806" rx="392" ry="86" fill="url(#hwBs)" stroke="#8aa9b2" stroke-width="4"/><ellipse cx="800" cy="816" rx="34" ry="11" fill="#6f8c96"/>
</g>
<g id="hwHL" style="display:none"><circle r="60" fill="none" stroke="#e58f9f" stroke-width="6"><animate attributeName="r" values="52;78;52" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle></g>
<g id="hwHit"><circle cx="700" cy="400" r="62" fill="#0000" data-hit="lever"/><rect x="396" y="540" width="170" height="240" fill="#0000" data-hit="pump"/><rect x="1030" y="130" width="190" height="400" fill="#0000" data-hit="disp"/><rect x="1020" y="620" width="210" height="230" fill="#0000" data-hit="bin"/></g>
</svg>`;
const HW_UI=`<button class="hwx" aria-label="離開洗手台">✕</button>
<div class="hwt"><small>HAND WASHING</small><h3>洗手 · 泡奶前的第一步</h3></div>
<ol class="hwst" id="hwSt"><li>沾濕</li><li>慕斯</li><li>搓洗</li><li>沖洗</li><li>擦乾</li><li>丟棄</li></ol>
<div class="hwr" id="hwR"><i><b>內</b>掌心</i><i><b>外</b>手背</i><i><b>夾</b>指縫</i><i><b>弓</b>指背</i><i><b>大</b>拇指</i><i><b>立</b>指尖</i><i><b>腕</b>手腕</i></div>
<div class="hwb"><p id="hwCap"></p><div class="hwbar"><i id="hwBar"></i></div><button class="wbig" id="hwBtn"></button><small id="hwTip"></small></div>
<div class="hwdn" id="hwDn" hidden><div class="hwc"><small>CLEAN HANDS</small><h3>洗手完成 ✓</h3><p id="hwDnP"></p><div class="hwd2"><button class="wbig fin" id="hwGo"></button></div></div></div>`;
const HW_FIN=[{x:-35,a:-7,l:98,w:23},{x:-12,a:-2,l:114,w:25},{x:12,a:2,l:106,w:24},{x:34,a:8,l:84,w:21}];
const hwFing=(w,l)=>{const b=w/2,t=b*.8;return `M${-b},12 L${-t},${-l+t} A${t},${t} 0 0 1 ${t},${-l+t} L${b},12 Z`};
const HW_SUB=[
 ['內','掌心對掌心，上下互搓'],['外','手背疊在掌心上，繞圈搓揉'],['夾','十指交叉，沿指縫來回搓'],['弓','彎起手指，用指背在掌心搓'],
 ['大','一手握住另一手拇指，旋轉搓洗'],['立','指尖併攏，在掌心畫圈搓'],['腕','一手環握手腕，轉動搓洗']];
// ───────── 洗手動畫的 3D 層：關節手模型、水龍頭、慕斯、擦手紙盒、垃圾桶、泡泡與水珠 ─────────
function hwBuild3D(host){
  const T=THREE,R=new T.WebGLRenderer({alpha:true,antialias:!W3COARSE()});R.setPixelRatio(Math.min(W3COARSE()?1.5:2,window.devicePixelRatio||1));R.outputEncoding=T.sRGBEncoding;R.setClearColor(0,0);
  R.domElement.className='hw3';host.insertBefore(R.domElement,host.querySelector('.hwui'));
  const S=new T.Scene(),cam=new T.PerspectiveCamera(30,1.6,.1,100),ZC=16;cam.position.set(0,0,ZC);
  const key=new T.DirectionalLight('#fff0dc',.85);key.position.set(-5,7,9);S.add(key);
  S.add(new T.HemisphereLight('#fff2e4','#c9a08c',.62));
  const rim=new T.PointLight('#ffd6e4',.45,40);rim.position.set(6,4,-3);S.add(rim);const fill=new T.PointLight('#cfe6ff',.18,40);fill.position.set(0,-4,10);S.add(fill);
  const W=(x,y)=>[(x-800)*.01,-(y-450)*.01];
  const mat=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:0},o||{}));
  const phys=(c,o)=>new T.MeshPhysicalMaterial(Object.assign({color:c,roughness:.3,metalness:0},o||{}));
  const rnd=(()=>{let a=311;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}})();
  const tex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t};
  const G={R,S,cam};
  G.resize=(w,h)=>{const a=w/h,vw=Math.max(8.8,Math.min(16,9*a)),vh=vw/a;R.setSize(w,h,false);cam.aspect=a;cam.fov=2*Math.atan(vh/2/ZC)*180/Math.PI;cam.updateProjectionMatrix()};
  // ── 手：掌＋指節（三節）＋拇指＋前臂與蕾絲袖口
  const NAIL=phys('#f6cdd2',{roughness:.22,clearcoat:.8,clearcoatRoughness:.15});
  const FIN=[{x:.32,L:[.40,.28,.22],r:.128},{x:.105,L:[.44,.31,.24],r:.132},{x:-.11,L:[.41,.29,.22],r:.122},{x:-.32,L:[.32,.21,.19],r:.108}];
  G.mkHand=(isR)=>{
    const side=isR?1:-1,g=new T.Group(),root=new T.Group();g.rotation.order='ZXY';g.add(root);
    const skin=new T.MeshPhysicalMaterial({color:'#eabda0',roughness:.66,metalness:0,clearcoat:0,clearcoatRoughness:.3,emissive:'#6b2c1a',emissiveIntensity:.14});
    const add=(p,geo,m,x,y,z,sx,sy,sz)=>{const o=new T.Mesh(geo,m||skin);o.position.set(x,y,z);if(sx)o.scale.set(sx,sy,sz);p.add(o);return o};
    const SP=new T.SphereGeometry(1,28,20);
    add(root,SP,0,0,.52,0,.5,.55,.17);add(root,SP,0,0,.08,0,.31,.42,.19);add(root,SP,0,side*.3,.26,.1,.2,.3,.13);
    add(root,new T.CylinderGeometry(.26,.31,4.2,26),0,0,-2.0,0);
    FIN.forEach(F=>add(root,SP,0,F.x*side,.98,0,F.r*1.05,F.r*1.05,F.r*1.05));
    // 前臂與蕾絲袖口、珍珠手環
    const slv=mat('#a9c4dc',{roughness:.9,side:T.DoubleSide});add(root,new T.CylinderGeometry(.5,.7,4.4,32,1,true),slv,0,-3.15,0);
    const cream=mat('#fffaf0',{roughness:.8});add(root,new T.TorusGeometry(.5,.06,10,36),cream,0,-.95,0).rotation.x=Math.PI/2;
    for(let i=0;i<16;i++){const a=i/16*6.283;add(root,new T.SphereGeometry(.075,10,8),cream,Math.cos(a)*.52,-1.05,Math.sin(a)*.52)}
    const gold=mat('#e0be6a',{metalness:.5,roughness:.35});add(root,new T.TorusGeometry(.3,.03,8,32),gold,0,-.48,0).rotation.x=Math.PI/2;
    for(let i=0;i<10;i++){const a=i/10*6.283;add(root,new T.SphereGeometry(.052,10,8),mat('#fff8ee',{roughness:.25}),Math.cos(a)*.32,-.48,Math.sin(a)*.32)}
    // 手指
    const finger=(x,y,L,r,nail)=>{const base=new T.Group();base.position.set(x,y,0);root.add(base);const nodes=[];let par=base;
      L.forEach((len,k)=>{const rb=r*(1-.12*k),rt=rb*.86,nd=new T.Group();if(k)nd.position.y=L[k-1];par.add(nd);nodes.push(nd);
        add(nd,new T.CylinderGeometry(rt,rb,len,16),0,0,len/2,0);add(nd,SP,0,0,0,0,rb,rb,rb);par=nd;
        if(k===L.length-1){add(nd,SP,0,0,len,0,rt,rt*1.1,rt);if(nail)add(nd,SP,NAIL,0,len*.5,-rt*.78,rt*.82,len*.42,rt*.22)}});
      return nodes};
    const h={g,root,isR,skin,fing:FIN.map((F,i)=>finger(F.x*side,.98,F.L,F.r,true)),fl:0,wet:0,foam:[]};
    h.th=finger(side*.42,.14,[.26,.3,.25],.14,true);
    // 泡沫（兩面都有）
    const fm=phys('#ffffff',{roughness:.3,emissive:'#dfeaf3',emissiveIntensity:.22,clearcoat:.5});
    for(let i=0;i<46;i++){const m=new T.Mesh(SP,fm);m.position.set((rnd()*2-1)*.42,.02+rnd()*1.35,(rnd()<.5?1:-1)*(.16+rnd()*.12));m.scale.setScalar(.001);root.add(m);h.foam.push({m,r:.07+rnd()*.12,th:rnd()*.92})}
    h.c={x:800+(isR?220:-220),y:1150,r:0,sx:isR?1:-1,sc:1.2,cu:0,sp:.1,th:0};h.t=Object.assign({},h.c);S.add(g);return h};
  G.applyHand=(h)=>{const c=h.c,isR=h.isR,side=isR?1:-1,w=W(c.x,c.y);
    h.g.position.set(w[0],w[1],.5);h.g.rotation.x=-.36;h.g.rotation.y=0;h.g.rotation.z=-c.r*Math.PI/180;h.g.scale.setScalar(c.sc*1.45);
    h.root.rotation.y=isR?(c.sx+1)/2*Math.PI:(1-c.sx)/2*Math.PI;
    const now=performance.now()/1000;
    h.fing.forEach((nd,i)=>{const f=1+i*.03,k=c.cu;nd[0].rotation.x=(k*1.15+.1)*f+Math.sin(now*1.3+i)*.025;nd[1].rotation.x=(k*1.45+.17)*f;nd[2].rotation.x=(k*1.0+.12)*f;});
    h.fing.forEach((nd,i)=>{nd[0].rotation.z=-FIN[i].x*side*(.3+c.sp*1.5)});
    const tn=h.th;tn[0].rotation.z=-side*(.46-c.th*.8);tn[0].rotation.x=.3+c.th*.5+c.cu*.5;tn[1].rotation.x=.25+c.cu*.6;tn[2].rotation.x=.2+c.cu*.4;
    h.foam.forEach(f=>{const k=Math.max(0,Math.min(1,(h.fl-f.th)*5));f.m.scale.setScalar(Math.max(.001,f.r*k))});
    h.skin.clearcoat=Math.min(1,h.wet)*.9;h.skin.roughness=.62-.28*Math.min(1,h.wet)};
  // ── 水龍頭
  const chrome=mat('#e4e9ee',{metalness:.65,roughness:.24});
  {const pts=[[700,700],[700,470],[702,400],[735,352],[786,350],[800,380],[800,410]].map(([x,y])=>{const p=W(x,y);return new T.Vector3(p[0],p[1],-.3)});
   const tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),60,.17,18),chrome);S.add(tube);
   const b=W(700,700),sp=W(800,412);let m=new T.Mesh(new T.CylinderGeometry(.34,.4,.4,28),chrome);m.position.set(b[0],b[1],-.3);S.add(m);
   m=new T.Mesh(new T.CylinderGeometry(.2,.17,.28,22),chrome);m.position.set(sp[0],sp[1],-.3);S.add(m)}
  const lvp=W(700,470);G.lever=new T.Group();G.lever.position.set(lvp[0],lvp[1],-.1);S.add(G.lever);
  {const hub=new T.Mesh(new T.SphereGeometry(.22,18,14),mat('#e0be6a',{metalness:.5,roughness:.35}));G.lever.add(hub);
   const rod=new T.Mesh(new T.CylinderGeometry(.08,.09,.78,14),mat('#e8c76a',{metalness:.5,roughness:.3}));rod.position.y=.42;G.lever.add(rod);
   const kn=new T.Mesh(new T.SphereGeometry(.17,18,14),phys('#e58f9f',{clearcoat:.6}));kn.position.y=.84;G.lever.add(kn)}
  // ── 水流
  const st=tex(64,256,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<7;i++){g.fillStyle='rgba(255,255,255,'+(.25+Math.random()*.5)+')';g.fillRect(Math.random()*w,0,3+Math.random()*7,h)}g.fillStyle='rgba(180,225,245,.35)';g.fillRect(0,0,w,h)});st.wrapS=st.wrapT=T.RepeatWrapping;st.repeat.set(1,4);
  G.stream=new T.Mesh(new T.CylinderGeometry(.13,.15,3.6,20,1,true),new T.MeshBasicMaterial({map:st,transparent:true,opacity:0,depthWrite:false,color:'#d6f1ff'}));{const p=W(800,415);G.stream.position.set(p[0],p[1]-1.8,.05)}S.add(G.stream);
  G.splash=new T.Mesh(new T.SphereGeometry(1,16,10),new T.MeshBasicMaterial({color:'#eefaff',transparent:true,opacity:0,depthWrite:false}));{const p=W(800,520);G.splash.position.set(p[0],p[1],.2);G.splash.scale.set(.55,.12,.35)}S.add(G.splash);
  G.setWater=(w,t)=>{G.stream.material.opacity=w*.75;st.offset.y=-(t*2.2)%1;G.splash.material.opacity=w*.7;G.splash.scale.x=.5+.08*Math.sin(t*22)};
  // ── 洗手慕斯
  {const px=W(480,700),grp=new T.Group();grp.position.set(px[0],px[1]-.1,0);S.add(grp);
   const pm=phys('#f6cdd8',{roughness:.25,clearcoat:.8}),cm=phys('#fff8ec',{roughness:.3,clearcoat:.5});
   const prof=[];for(let i=0;i<=16;i++){const u=i/16,y=-.8+1.6*u;let r=.72;if(u<.08)r=.72*(.82+.18*Math.sin(u/.08*Math.PI/2));if(u>.88)r=.72*(1-(u-.88)/.12*.55);prof.push(new T.Vector2(r,y))}
   grp.add(new T.Mesh(new T.LatheGeometry(prof,36),pm));
   const lab=new T.Mesh(new T.PlaneGeometry(.95,.7),new T.MeshBasicMaterial({map:tex(256,190,(g,w,h)=>{g.fillStyle='#fff8ec';g.beginPath();g.ellipse(w/2,h/2,w/2-6,h/2-6,0,0,6.29);g.fill();g.strokeStyle='#c49a3c';g.lineWidth=6;g.stroke();g.fillStyle='#a64a60';g.textAlign='center';g.textBaseline='middle';g.font='700 56px "Noto Serif TC",serif';g.fillText('洗手',w/2,h*.37);g.fillText('慕斯',w/2,h*.7)}),transparent:true}));lab.position.set(0,0,.725);grp.add(lab);
   const neck=new T.Mesh(new T.CylinderGeometry(.17,.2,.4,18),cm);neck.position.y=.98;grp.add(neck);
   G.head=new T.Group();G.head.position.y=1.28;grp.add(G.head);G.headY=1.28;
   const hd=new T.Mesh(new T.CylinderGeometry(.42,.38,.32,24),cm);G.head.add(hd);const nz=new T.Mesh(new T.CylinderGeometry(.09,.1,.62,14),cm);nz.rotation.z=Math.PI/2;nz.position.set(.55,.0,0);G.head.add(nz);
   const tp=new T.Mesh(new T.SphereGeometry(.07,10,8),mat('#e58f9f'));tp.position.set(.82,-.02,0);G.head.add(tp)}
  G.setHead=(pk)=>{G.head.position.y=G.headY-pk*.22};
  // ── 擦手紙盒、紙巾、垃圾桶
  {const p=W(1125,305),grp=new T.Group();grp.position.set(p[0],p[1],-.2);S.add(grp);
   const bm=phys('#f4e8cf',{roughness:.45,clearcoat:.3});grp.add(new T.Mesh(new T.BoxGeometry(1.9,3.5,1.0),bm));
   const trim=mat('#c49a3c',{metalness:.4,roughness:.4});[[0,1.75],[0,-1.75]].forEach(([x,y])=>{const t=new T.Mesh(new T.BoxGeometry(1.96,.1,1.06),trim);t.position.set(x,y,0);grp.add(t)});
   const disc=new T.Mesh(new T.CylinderGeometry(.62,.62,.24,32),mat('#fffdf6',{roughness:.9}));disc.rotation.x=Math.PI/2;disc.position.set(0,.5,.52);grp.add(disc);
   const hole=new T.Mesh(new T.CylinderGeometry(.24,.24,.26,20),mat('#e6d9b8'));hole.rotation.x=Math.PI/2;hole.position.set(0,.5,.53);grp.add(hole);
   const lb=new T.Mesh(new T.PlaneGeometry(1.3,.42),new T.MeshBasicMaterial({map:tex(256,84,(g,w,h)=>{g.fillStyle='#8a4a22';g.textAlign='center';g.textBaseline='middle';g.font='700 46px "Noto Serif TC",serif';g.fillText('擦手紙',w/2,h/2)}),transparent:true}));lb.position.set(0,1.3,.51);grp.add(lb);
   const slot=new T.Mesh(new T.BoxGeometry(1.4,.2,.8),mat('#7a4a30'));slot.position.set(0,-1.7,.1);grp.add(slot)}
  {const p=W(1125,478);const sg=new T.PlaneGeometry(.98,1.7,1,10);sg.translate(0,-.85,0);G.sheet=new T.Mesh(sg,mat('#fffdf6',{roughness:.9,side:T.DoubleSide}));G.sheet.position.set(p[0],p[1],.3);G.sheet.scale.y=.001;S.add(G.sheet)}
  G.setSheet=(h2)=>{G.sheet.scale.y=Math.max(.001,h2/170);G.sheet.visible=h2>2};
  {const p=W(1125,740);G.bin=new T.Group();G.bin.position.set(p[0],p[1],.1);S.add(G.bin);
   const prof=[new T.Vector2(.01,-.8),new T.Vector2(.72,-.8),new T.Vector2(.75,-.7),new T.Vector2(1.0,.8),new T.Vector2(1.04,.84)];const bm=phys('#8bb5a0',{roughness:.35,clearcoat:.5,side:T.DoubleSide});
   G.bin.add(new T.Mesh(new T.LatheGeometry(prof,40),bm));
   const inner=new T.Mesh(new T.CylinderGeometry(.98,.74,1.55,32,1,true),mat('#2f2a24',{side:T.BackSide}));inner.position.y=.08;G.bin.add(inner);
   const band=new T.Mesh(new T.TorusGeometry(.9,.05,10,40),mat('#c49a3c',{metalness:.5,roughness:.35}));band.rotation.x=Math.PI/2;band.position.y=.0;G.bin.add(band);
   const rim=new T.Mesh(new T.TorusGeometry(1.02,.06,10,40),mat('#c9a85c',{metalness:.5,roughness:.35}));rim.rotation.x=Math.PI/2;rim.position.y=.82;G.bin.add(rim)}
  G.binBase=G.bin.position.y;G.setBin=(dy)=>{G.bin.position.y=G.binBase+dy*.01};
  // ── 紙巾、紙團、水珠
  G.mkPaper=()=>{const geo=new T.PlaneGeometry(2.0,1.6,12,10),m=new T.Mesh(geo,mat('#fffdf6',{roughness:.92,side:T.DoubleSide}));const ln=new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(2,1.6,1,1)),new T.LineBasicMaterial({color:'#cdbf9c'}));m.add(ln);S.add(m);m.position.z=.2;
    m.userData.set=(x,y,sc,rot,wob)=>{const p=W(x,y);m.position.set(p[0],p[1],.25);m.scale.setScalar(sc);m.rotation.z=-rot*Math.PI/180;const a=geo.attributes.position;for(let i=0;i<a.count;i++){const px=a.getX(i),py=a.getY(i);a.setZ(i,Math.sin(px*2.2+(wob||0))*.05+Math.cos(py*2.6)*.04)}a.needsUpdate=true;geo.computeVertexNormals()};
    m.userData.remove=()=>{S.remove(m);geo.dispose()};return m.userData.api=m};
  {const g=new T.IcosahedronGeometry(.3,2),a=g.attributes.position;for(let i=0;i<a.count;i++){const k=1+(rnd()-.5)*.28;a.setXYZ(i,a.getX(i)*k,a.getY(i)*k,a.getZ(i)*k)}g.computeVertexNormals();G.ball=new T.Mesh(g,mat('#fffdf6',{roughness:.95,flatShading:true}));G.ball.visible=false;G.ball.position.z=.55;S.add(G.ball)}
  G.setBall=(x,y,rot,sc)=>{const p=W(x,y);G.ball.position.set(p[0],p[1],.55);G.ball.rotation.set(rot*.02,rot*.03,rot*.01);G.ball.scale.setScalar(sc||1)};
  G.dropM=new T.Mesh(new T.SphereGeometry(.2,16,12),phys('#ffffff',{clearcoat:.6,emissive:'#dfeaf3',emissiveIntensity:.25}));G.dropM.visible=false;S.add(G.dropM);
  G.setDrop=(x,y,r,vis)=>{G.dropM.visible=vis;const p=W(x,y);G.dropM.position.set(p[0],p[1],.7);G.dropM.scale.setScalar(r/10)};
  // 粒子
  const pool=[];const dg=new T.SphereGeometry(1,10,8);for(let i=0;i<80;i++){const m=new T.Mesh(dg,new T.MeshBasicMaterial({color:'#cfeeff',transparent:true,opacity:0,depthWrite:false}));m.visible=false;S.add(m);pool.push({m,life:0,x:0,y:0,vx:0,vy:0,k:'d',r:3,mm:1})}
  G.spawn=(x,y,vx,vy,k,r)=>{const p=pool.find(q=>q.life<=0);if(!p)return;Object.assign(p,{x,y,vx,vy,k,r,life:k==='b'?2.2:.7,mm:k==='b'?2.2:.7});p.m.material.color.set(k==='b'?'#e9dcff':'#cfeeff');p.m.visible=true};
  G.stepParticles=(dt)=>{pool.forEach(p=>{if(p.life<=0){p.m.visible=false;return}p.life-=dt;p.vy+=(p.k==='b'?-6:520)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const w=W(p.x,p.y);p.m.position.set(w[0],w[1],.9);p.m.scale.setScalar(p.r*.012);p.m.material.opacity=Math.max(0,p.life/p.mm)*(p.k==='b'?.55:.85)})};
  G.render=()=>R.render(S,cam);
  G.dispose=()=>{S.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}});R.dispose();try{R.forceContextLoss()}catch(e){}R.domElement.remove()};
  return G}
function w3HandsClose(){if(W3.hwClose)W3.hwClose()}
function w3Washed(){return W3.washAt&&Date.now()-W3.washAt<30*60*1000}
function w3Hands(opt){
  opt=opt||{};const el=document.getElementById('w3');if(!el||document.getElementById('w3hw'))return;
  w3ThermosClose();W3.dlg=1;W3.keys={};
  const CX=800;
  const d=document.createElement('div');d.id='w3hw';d.className='hw';d.innerHTML=HW_SVG+`<div class="hwui">${HW_UI}</div>`;el.appendChild(d);
  const $=s=>d.querySelector(s),svg=$('#hwS');
  let rnd=(()=>{let a=77;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}})();
  const G=hwBuild3D(d);
  const mkHand=G.mkHand;
  const HL=mkHand(false),HR=mkHand(true);
  const apply=G.applyHand;
  let DY=-120;const pose=(isR,x,y,r,face,cu,sp,th)=>({x,y:y+DY,r,sx:isR?(face==='b'?1:-1):(face==='b'?-1:1),sc:1.2,cu:cu||0,sp:sp==null?.1:sp,th:th||0});
  const lerpH=(h,k)=>{for(const p in h.t)h.c[p]+=(h.t[p]-h.c[p])*k};
  // ── 狀態
  const ST={step:0,sub:0,prog:0,tm:0,ph:0,hold:false,water:0,waterT:0,started:false,pumps:0,press:0,drop:null,sheet:0,sheetSt:0,fly:null,paper:null,crumple:0,thr:null,ball:null,shake:0,total:0,t0:Date.now(),done:false,lever:0};
  const NSTEP=6,cap=$('#hwCap'),btn=$('#hwBtn'),tip=$('#hwTip'),bar=$('#hwBar'),HLg=$('#hwHL');
  const spawn=G.spawn;
  // 水聲
  let wn=null;const waterSnd=(v)=>{try{if(!W3.audio||!W3.snd)return;const c=W3.audio.ctx;if(!wn){const n=c.createBuffer(1,c.sampleRate*2,c.sampleRate),a=n.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=n;s.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=.6;const g=c.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(c.destination);s.start();wn={s,g}}wn.g.gain.value=.07*v}catch(e){}};
  // ── 道具（3D）
  const ballEl={set display(v){G.ball.visible=v!=='none'}};const mkPaper=()=>{const m=G.mkPaper();return{set:m.userData.set,remove:m.userData.remove}};
  // ── 步驟
  const setHL=(x,y)=>{if(x==null){HLg.style.display='none';return}HLg.style.display='';HLg.setAttribute('transform',`translate(${x} ${y})`)};
  const say=(c,b,t,mode)=>{cap.textContent=c;btn.textContent=b||'';btn.hidden=!b;btn.dataset.mode=mode||'tap';tip.textContent=t||''};
  const chips=()=>{[...$('#hwSt').children].forEach((li,i)=>li.className=i<ST.step?'ok':i===ST.step?'on':'');$('#hwR').classList.toggle('show',ST.step===2);[...$('#hwR').children].forEach((li,i)=>li.className=i<ST.sub?'ok':i===ST.sub?'on':'')};
  const enter=(n)=>{ST.step=n;ST.sub=0;ST.prog=0;ST.tm=0;chips();
    if(n===0){say('先把雙手沾濕','💧 打開水龍頭','點水龍頭的粉紅把手，或按下方按鈕');setHL(700,400)}
    if(n===1){say('壓一壓洗手慕斯，用掌心接住泡泡','🧴 按壓慕斯','按兩下，泡泡會落在左手掌心');setHL(480,640)}
    if(n===2){const s=HW_SUB[0];say(`${s[0]}：${s[1]}`,'👐 按住搓洗','按住畫面任一處（或空白鍵）開始搓，約 7 秒','hold');setHL()}
    if(n===3){say('用流動的清水，把泡泡沖乾淨','💧 按住沖洗','按住開始沖洗，直到泡泡全部不見','hold');setHL()}
    if(n===4){say('用擦手紙把雙手完全擦乾','🧻 拉一張擦手紙','點擦手紙盒，或按下方按鈕');setHL(1125,320)}
    if(n===5){say('擦手紙揉成一團，丟進垃圾桶','🗑️ 丟進垃圾桶','不要碰水龍頭和其他東西，直接丟進桶子');setHL(1125,700)}
    if(n===6)finish()};
  const finish=()=>{ST.done=true;W3.washAt=Date.now();w3FlowAdv('wash');setHL();say('','','');btn.hidden=true;cap.textContent='';$('.hwb').style.display='none';const s=Math.round((Date.now()-ST.t0)/1000);$('#hwDnP').textContent=`搓洗、沖洗、擦乾、丟紙巾都完成了。這一趟共用了約 ${s} 秒；泡奶前洗手 30 分鐘內有效。`;const g=$('#hwGo');g.textContent=opt.then?'開始泡配方奶':'完成';$('#hwDn').hidden=false;
    for(let i=0;i<24;i++)spawn(CX+(rnd()-.5)*500,440+rnd()*220,(rnd()-.5)*40,-30-rnd()*60,'b',6+rnd()*10)};
  const tap=(what)=>{if(ST.done)return;const s=ST.step;
    if(s===0&&(what==='btn'||what==='lever')&&!ST.started){ST.started=true;ST.waterT=1;ST.tm=0;setHL();say('讓水流過雙手，把手沾濕…','','',null)}
    else if(s===1&&(what==='btn'||what==='pump')&&!ST.press&&ST.pumps<2&&ST.tm>.4){ST.press=.001}
    else if(s===4&&ST.sub===0&&(what==='btn'||what==='disp')&&!ST.sheetSt){ST.sheetSt=1;ST.tm=0;setHL();btn.hidden=true;cap.textContent='拉出一張擦手紙…'}
    else if(s===5&&(what==='btn'||what==='bin')&&!ST.thr&&ST.ball){ST.thr={t:0};setHL();btn.hidden=true;cap.textContent='瞄準——丟！'}};
  // 輸入
  const holdOn=()=>{if(btn.dataset.mode==='hold'||ST.step===2||ST.step===3||(ST.step===4&&ST.sub===1))ST.hold=true};
  const holdOff=()=>{ST.hold=false};
  btn.addEventListener('pointerdown',e=>{e.preventDefault();if(btn.dataset.mode==='hold')holdOn();else tap('btn')});
  svg.addEventListener('pointerdown',e=>{const h=e.target.getAttribute&&e.target.getAttribute('data-hit');if(h)tap(h);if(!h||ST.step===2||ST.step===3)holdOn()});
  const up=()=>holdOff();window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  const kd=(e)=>{if(e.key==='Escape'){e.stopPropagation();close();return}if(e.key===' '||e.code==='Space'){e.preventDefault();e.stopPropagation();if(!e.repeat){if(btn.dataset.mode==='hold')holdOn();else if(!btn.hidden)tap('btn')}}};
  const ku=(e)=>{if(e.key===' '||e.code==='Space'){e.stopPropagation();holdOff()}};
  window.addEventListener('keydown',kd,true);window.addEventListener('keyup',ku,true);
  const fit=()=>{const w=d.clientWidth||1,h=d.clientHeight||1,a=w/h,W=Math.max(880,Math.min(1600,900*a));svg.setAttribute('viewBox',`${800-W/2} 0 ${W} 900`);G.resize(w,h)};fit();window.addEventListener('resize',fit);
  // ── 每格更新
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const palmPos=(h)=>{const c=h.c,a=c.r*Math.PI/180,L=-70*c.sc;return[c.x-L*Math.sin(a),c.y+L*Math.cos(a)]};
  const ballPos=()=>{const c=HR.c,a=c.r*Math.PI/180,L=-95*c.sc;return[c.x-L*Math.sin(a),c.y+L*Math.cos(a)]};
  const tick=(dt,nr)=>{
    const s=ST.step,t=performance.now()/1000;let L,R;ST.tm+=dt;DY=s===1?0:-120;
    if(ST.hold)ST.ph+=dt*(s===2?8.6:6);const sn=Math.sin(ST.ph),cs=Math.cos(ST.ph);
    const idle=Math.sin(t*1.7)*5;
    // 水龍頭
    ST.lever+=(ST.waterT-ST.lever)*Math.min(1,dt*8);G.lever.rotation.z=ST.lever*55*Math.PI/180;
    ST.water+=(ST.waterT-ST.water)*Math.min(1,dt*5);
    if(s===0){
      if(!ST.started){L=pose(0,CX-190,1010+idle,-6,'b',0,.12);R=pose(1,CX+190,1010-idle,6,'b',0,.12)}
      else{L=pose(0,CX-70,880+sn*0,8,'p',.05,.05);R=pose(1,CX+70,880,-8,'p',.05,.05);ST.paperWet=1;HL.wet=HR.wet=Math.min(1,ST.tm/1.2);if(ST.tm>2.6){ST.waterT=0;if(ST.water<.2)enter(1)}}
    }else if(s===1){
      const pr=ST.press;if(pr>0){ST.press=pr+dt/.55;if(ST.press>=1){ST.press=0;ST.pumps++;chips();HL.fl=Math.min(.55,ST.pumps*.3);ST.drop={t:0};if(ST.pumps>=2){setHL();ST.tm=0;say('泡泡好綿密！','','')}else setHL(480,640)}}
      const pk=pr>0?Math.sin(Math.min(1,pr)*Math.PI):0;G.setHead(pk);
      L=pose(0,650,800,-84,'p',.1,.06);R=pose(1,770,520+pk*22,-90,'b',.25,.02,.3);
      if(ST.drop){ST.drop.t+=dt;const u=Math.min(1,ST.drop.t/.5);{const pp=palmPos(HL);G.setDrop(558+(pp[0]-558)*u,590+(pp[1]-590)*u*u,10+8*u,u<1)}if(u>=1)ST.drop=null}
      if(ST.pumps>=2&&ST.tm>1.2){HR.fl=.45;HL.fl=.55;enter(2)}
    }else if(s===2){
      const k=ST.sub,A=ST.hold?1:1;
      if(k===0){L=pose(0,CX-78,860+sn*34,12,'p',0,.04);R=pose(1,CX+78,860-sn*34,-12,'p',0,.04)}
      else if(k===1){L=pose(0,CX-40,880,-6,'p',0,.04);R=pose(1,CX+34+cs*38,800+sn*26,-38,'b',.08,.04)}
      else if(k===2){L=pose(0,CX-92+sn*22,880,24,'p',0,.5);R=pose(1,CX+92-sn*22,880,-24,'p',0,.5)}
      else if(k===3){L=pose(0,CX-58+cs*16,900,10+sn*8,'b',.85,.04,.2);R=pose(1,CX+58-cs*16,900,-10-sn*8,'p',.85,.04,.2)}
      else if(k===4){L=pose(0,CX-40,860,-4,'p',0,.1,-.2);R=pose(1,CX+28+cs*10,930+sn*10,-16+sn*22,'p',.9,.02,.6)}
      else if(k===5){L=pose(0,CX-36,880,-8,'p',0,.04);R=pose(1,CX+40+cs*44,780+sn*28,-52,'b',.78,.01,.5)}
      else{L=pose(0,CX-80,820,16,'b',0,.04);R=pose(1,CX+8,940+sn*52,-92,'p',.5,.03,.4)}
      if(ST.hold){ST.prog+=dt/1.0;HL.fl=HR.fl=Math.min(1,Math.max(HL.fl,.45)+dt*.28);if(Math.random()<dt*14)spawn(CX+(Math.random()-.5)*260,620+Math.random()*120,(Math.random()-.5)*26,-34-Math.random()*40,'b',5+Math.random()*9)}
      if(ST.prog>=1){ST.sub++;ST.prog=0;if(ST.sub>=7){HL.fl=HR.fl=1;enter(3)}else{const q=HW_SUB[ST.sub];cap.textContent=`${q[0]}：${q[1]}`;chips()}}
    }else if(s===3){
      if(ST.hold||ST.prog>0){ST.waterT=1}
      L=pose(0,CX-62,880+sn*14,10,'p',.05,.05);R=pose(1,CX+62,880-sn*14,-10,'p',.05,.05);
      if(ST.hold){ST.prog+=dt/2.8;const f=Math.max(0,1-ST.prog*1.15);HL.fl=HR.fl=f;HL.wet=HR.wet=1}
      if(ST.prog>=1){HL.fl=HR.fl=0;ST.waterT=0;say('乾乾淨淨！','','');if(ST.water<.15&&ST.tm>.1){ST.tm=0;enter(4)}}
    }else if(s===4){
      if(ST.sub===0){L=pose(0,CX-170,1000+idle,-8,'p',0,.12);R=pose(1,CX+170,1000-idle,8,'p',0,.12);
        if(ST.sheetSt===1){const u=Math.min(1,ST.tm/.9);ST.sheet=170*ease(u);if(u>=1){ST.sheetSt=2;ST.tm=0}}
        else if(ST.sheetSt===2){const u=Math.min(1,ST.tm/.7);ST.sheet=170*(1-.0);if(u>=.35&&!ST.paper){ST.paper=mkPaper()}
          if(ST.paper){const e=ease(Math.max(0,(ST.tm-.25)/.8)),x=1125+(CX-1125)*e,y=520+(650-520)*e-Math.sin(e*Math.PI)*120;ST.paper.set(x,y,.45+.55*e,(1-e)*14,0);G.setSheet(Math.max(0,170*(1-Math.min(1,(ST.tm-.25)/.2))))}
          if(ST.tm>1.15){G.setSheet(0);ST.sub=1;ST.prog=0;ST.tm=0;ST.sheet=0;say('把紙巾壓在雙手上，來回按壓擦乾','👐 按住擦乾','按住畫面任一處（或空白鍵）','hold')}}
        if(ST.sheetSt===1)G.setSheet(ST.sheet)}
      else{L=pose(0,CX-96+sn*8,930+sn*22,12,'p',.04,.08);R=pose(1,CX+96-sn*8,930-sn*22,-12,'p',.04,.08);
        if(ST.hold){ST.prog+=dt/2.6;const w=Math.max(0,1-ST.prog*1.1);HL.wet=HR.wet=w;if(Math.random()<dt*10)spawn(CX+(Math.random()-.5)*300,700,(Math.random()-.5)*50,20+Math.random()*30,'d',3+Math.random()*3)}
        if(ST.paper){const w=Math.sin(ST.ph*2)*(ST.hold?2.5:0);ST.paper.set(CX,650+sn*6,1.35,w,ST.ph*2)}
        if(ST.prog>=1){ST.crumple+=dt/.7;const u=Math.min(1,ST.crumple);if(ST.paper){ST.paper.set(CX+96*u,650+(640-650)*u,(1-.8*u)*1.35,u*160,0)}
          if(u>=1){if(ST.paper){ST.paper.remove();ST.paper=null}ST.ball=1;ballEl.display='';enter(5)}}}
    }else if(s===5){
      L=pose(0,CX-150,960+idle,-8,'p',0,.1);R=pose(1,CX+100,860,-6,'p',.92,.02,.5);
      if(ST.thr){const T=ST.thr;T.t+=dt;if(T.t<.4){const u=ease(T.t/.4);R=pose(1,CX+100+90*u,860+60*u,-6-30*u,'p',.92,.02,.5)}else if(T.t<.62){const u=ease((T.t-.4)/.22);R=pose(1,CX+190+110*u,920-170*u,-36+82*u,'p',.5,.05,.2)}else R=pose(1,CX+300,760-(T.t-.62)*60,46,'p',.1,.1,0);
        if(T.t>=.58&&!T.f){T.f={t:0,x:0,y:0};const b=ballPos();T.f.x0=b[0];T.f.y0=b[1];}
        if(T.f){T.f.t+=dt;const u=Math.min(1,T.f.t/.85),x=T.f.x0+(1125-T.f.x0)*u,y=T.f.y0+(650-T.f.y0)*u-Math.sin(u*Math.PI)*260;ST.bpos=[x,y,u*900];if(u>=1&&!T.hit){T.hit=1;ST.shake=1;ST.ball=0;ballEl.display='none';for(let i=0;i<14;i++)spawn(1125+(Math.random()-.5)*120,640,(Math.random()-.5)*160,-80-Math.random()*120,'b',4+Math.random()*7);say('進了！','','')}
          if(T.hit&&T.f.t>1.5)enter(6)}}
      if(ST.ball&&!(ST.thr&&ST.thr.f)){const b=ballPos();ST.bpos=[b[0],b[1],0]}
      if(ST.ball&&ST.bpos)G.setBall(ST.bpos[0],ST.bpos[1],ST.bpos[2],1);
    }else{L=pose(0,CX-170,1180,-8,'p',0,.1);R=pose(1,CX+170,1180,8,'p',0,.1)}
    HL.t=L;HR.t=R;const k=1-Math.exp(-dt*((s===2||s===4)&&ST.hold?9:5));lerpH(HL,k);lerpH(HR,k);
    if(s!==0||!ST.started){if(s!==3&&s!==0)HL.wet=HR.wet=Math.max(s===4?Math.min(HL.wet,1):HL.wet,0)}
    if(s>=1&&s<4&&s!==3)HL.wet=HR.wet=1;
    apply(HL);apply(HR);
    // 彈跳垃圾桶
    ST.shake=Math.max(0,ST.shake-dt*2.4);G.setBin(Math.sin(ST.shake*18)*ST.shake*8);
    // 水
    const w=ST.water;G.setWater(w,t);waterSnd(w);
    if(w>.3&&Math.random()<dt*50)spawn(CX+(Math.random()-.5)*60,515,(Math.random()-.5)*210,-60-Math.random()*90,'d',2.5+Math.random()*3);
    if((HL.wet>.3||HR.wet>.3)&&s!==3&&Math.random()<dt*7)spawn(CX+(Math.random()-.5)*340,730,(Math.random()-.5)*30,10,'d',2+Math.random()*3);
    G.stepParticles(dt);
    // UI
    const pr=s===2?(ST.sub+ST.prog)/7:s===3||(s===4&&ST.sub===1)?ST.prog:s===1?ST.pumps/2:0;bar.style.width=Math.round(Math.min(1,pr)*100)+'%';
    $('.hwb').classList.toggle('busy',btn.hidden&&!ST.done);
    if(!nr)G.render();
  };
  let last=performance.now(),raf=0;const loop=(now)=>{const dt=Math.min(.05,(now-last)/1000);last=now;tick(dt);raf=requestAnimationFrame(loop)};
  const close=(then)=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',kd,true);window.removeEventListener('keyup',ku,true);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);window.removeEventListener('resize',fit);
    try{if(wn){wn.g.gain.value=0;wn.s.stop()}}catch(e){}G.dispose();d.remove();W3.dlg=null;W3.hwClose=null;if(then&&typeof opt.then==='function')opt.then()};
  W3.hwClose=()=>close();W3.hw={ST,tap,enter,tick,close,render:()=>G.render(),stop:()=>cancelAnimationFrame(raf)};
  d.querySelector('.hwx').onclick=()=>close();d.querySelector('#hwGo').onclick=()=>close(true);
  enter(0);HL.c.y=HR.c.y=1150;raf=requestAnimationFrame(loop);
}

// ───────── 哺乳室動線：嬰兒床 → 洗手 → 沖泡 → 小桌子 → 抱起餵奶拍嗝 → 洗奶瓶 ─────────
const FL_STEPS=['嬰兒床','洗手','熱水','沖泡','小桌子','餵奶拍嗝','洗奶瓶'];
function w3FlowHint(){const F=W3.flow;if(!F)return'';const b=F.key&&W3.st&&W3.st.cfg.babies?W3.st.cfg.babies.find(x=>x.key===F.key):null,n=b?b.n:'寶寶';
  return['寶寶哭了！到主臥室的嬰兒床，確認是哪一位、要喝多少 ml','到浴廁的洗手台，把手洗乾淨','到廚房的熱水瓶，把水溫調到 70°C 以上','到客廳玄關的奶粉罐，選奶粉沖泡','把泡好的奶瓶放到哺乳椅旁的小桌子','回主臥室抱起'+n+'，接著去哺乳椅餵奶、拍嗝','餵完了！到廚房的水槽初步清洗奶瓶','這一輪全部完成 ✓'][F.s]||''}
function w3FlowHud(){const el=document.getElementById('w3');if(!el)return;let h=el.querySelector('.w3-flow');
  if(!W3.flow){if(h)h.remove();return}
  if(!h){h=document.createElement('div');h.className='w3-flow';h.innerHTML='<button class="fb" aria-expanded="false"></button><div class="fx"><ol>'+FL_STEPS.map((n,i)=>`<li><b>${i+1}</b>${n}</li>`).join('')+'</ol><p></p></div>';el.appendChild(h);h.querySelector('.fb').onclick=()=>{const o=!h.classList.contains('open');h.classList.toggle('open',o);h.querySelector('.fb').setAttribute('aria-expanded',o)}}
  [...h.querySelectorAll('li')].forEach((li,i)=>li.className=i<W3.flow.s?'ok':i===W3.flow.s?'on':'');h.querySelector('p').textContent=w3FlowHint();h.querySelector('.fb').textContent=W3.flow.s>=FL_STEPS.length?'✓ 全部完成':'步驟 '+(W3.flow.s+1)+'/'+FL_STEPS.length+' ▾'}
function w3FlowAdv(ev){const F=W3.flow;if(!F)return;const was=F.s;
  if(ev==='hot'){F.hot=true;if(F.s===2)F.s=3}
  else if(ev==='plan'&&F.s===0)F.s=!w3Washed()?1:F.hot?3:2;
  else if(ev==='wash'&&F.s===1)F.s=F.hot?3:2;
  else if(ev==='mix'&&F.s===3)F.s=4;
  else if(ev==='table'&&F.s===4)F.s=5;
  else if(ev==='fed'&&F.s===5)F.s=6;
  else if(ev==='sink'&&F.s===6){F.s=7;setTimeout(()=>{if(W3.flow===F&&F.s===7){F.s=0;F.key=null;F.hot=false;if(W3.bb)W3.bb.next=5;w3FlowHud()}},6000)}
  if(F.s!==was){w3FlowHud();if(F.s===7)w3DiaToast('🎉 這一輪照顧完成！奶瓶洗好了')}}
function w3FlowTable(){const F=W3.flow,st=W3.st;if(!F||!st)return;
  if(F.s===4){const tb=st.cfg.tblBottle;if(tb)tb.visible=true;try{w3Chime()}catch(e){}w3DiaToast('🍼 奶瓶放好了，接著回主臥室抱起寶寶');if(st.cfg.chair)w3Burst(st.cfg.chair.x+1.95,1.0,st.cfg.chair.z-.2,'#fff3d0');w3FlowAdv('table')}
  else w3DiaToast(F.s===5?'奶瓶已經在小桌子上了':w3FlowHint())}
function w3FlowUpdate(st,dt){const F=W3.flow;if(!F)return;
  if(!st.fm){st.fm=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.09;m.renderOrder=2;st.S.add(m);return m});st.fmT={}}
  const P=id=>(W3.props||[]).find(p=>p.id===id);let tg=[];
  if(F.s===0){const cr=st.cfg.babies.filter(b=>W3.bb&&W3.bb.who[b.key].cry);tg=(cr.length?cr:st.cfg.babies).map(b=>P('crib_'+b.key))}
  else if(F.s===1)tg=[P('handwash')];else if(F.s===2)tg=[P('thermos')];else if(F.s===3)tg=[P('formula')];else if(F.s===4)tg=[P('table')];
  else if(F.s===5)tg=[P('crib_'+F.key)];else if(F.s===6)tg=[P('wash')];
  tg=tg.filter(Boolean);const n=F.s+1;
  const lk=1-.5*(st.zk||0);(W3.props||[]).forEach(p=>{const d=Math.hypot(p.x-st.P.x,p.z-st.P.z);p.lab.visible=tg.includes(p)||d<2.6;p.lab.scale.set(2.1*lk,.48*lk,1)});(W3.orbs||[]).forEach(o=>{o.lab.visible=Math.hypot(o.x-st.P.x,o.z-st.P.z)<3;o.lab.scale.set(1.75*lk,.43*lk,1)})
  if(!st.fmT[n])st.fmT[n]=w3Tex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(255,243,208,.55)';g.beginPath();g.arc(128,128,112,0,6.29);g.fill();g.strokeStyle='#c49a3c';g.lineWidth=10;g.beginPath();g.arc(128,128,108,0,6.29);g.stroke();g.lineWidth=3;g.beginPath();g.arc(128,128,92,0,6.29);g.stroke();g.fillStyle='#8a4a22';g.font='700 120px "Noto Serif TC",serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(n),128,136)});
  const pl=1+.1*Math.sin(st.t*3.2);w3FlowGuide(st,F,tg);
  st.fm.forEach((m,i)=>{const p=tg[i];m.visible=!!p&&F.s<7;if(p){m.position.x=p.x;m.position.z=p.z;m.scale.set(pl,pl,1);if(m.material.map!==st.fmT[n]){m.material.map=st.fmT[n];m.material.needsUpdate=true}}})}

// 地板引導線：由人物走向下一步目標，會繞過門口
function w3FlowZone(x,z){if(z>=-1)return{k:'L'};return x<-3?{k:'B',d:-7.5}:x<2?{k:'T',d:-.5}:{k:'K',d:7}}
function w3FlowPath(a,b){const A=w3FlowZone(a[0],a[1]),B=w3FlowZone(b[0],b[1]),p=[a];
  if(A.k!==B.k){if(A.d!=null)p.push([A.d,-2.1],[A.d,.4]);if(B.d!=null)p.push([B.d,.4],[B.d,-2.1])}
  p.push(b);return p}
function w3FlowGuide(st,F,tg,straight){
  if(!st.fg){const tx=w3Tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#f3c04a';g.strokeStyle='#8a4a22';g.lineWidth=7;g.lineJoin='round';g.beginPath();g.moveTo(64,16);g.lineTo(108,84);g.lineTo(64,62);g.lineTo(20,84);g.closePath();g.fill();g.stroke()});
    st.fg=[];for(let i=0;i<48;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.0,1.0),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}));m.rotation.order='YXZ';m.rotation.x=-Math.PI/2;m.position.y=.07;m.renderOrder=3;m.visible=false;st.S.add(m);st.fg.push(m)}}
  const off=!tg.length||F.s>=7||W3.cut||W3.dlg;if(off){st.fg.forEach(m=>m.visible=false);return}
  const P=st.P,t=tg[0],pts=straight?[[P.x,P.z],[t.x,t.z]]:w3FlowPath([P.x,P.z],[t.x,t.z]);let L=0;const seg=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);L+=l}
  const SP=1.2,ph=(st.t*1.3)%SP;let n=0;
  for(let d=1.1+ph;d<L-.9&&n<st.fg.length;d+=SP){let r=d,i=0;while(i<seg.length-1&&r>seg[i]){r-=seg[i];i++}const a=pts[i],b=pts[i+1],u=seg[i]?r/seg[i]:0,m=st.fg[n++];
    m.position.x=a[0]+(b[0]-a[0])*u;m.position.z=a[1]+(b[1]-a[1])*u;m.rotation.y=Math.atan2(-(b[0]-a[0]),-(b[1]-a[1]));m.material.opacity=.55+.4*Math.sin(st.t*4-d*1.4);m.visible=true}
  for(;n<st.fg.length;n++)st.fg[n].visible=false}

// 3D 小鎮：新玩家先被引導去免費體驗的哺乳室
function w3TownGuideHud(on){const el=document.getElementById('w3');if(!el)return;let g=el.querySelector('.w3-gd');if(!on){if(g)g.remove();return}
  if(!g){g=document.createElement('div');g.className='w3-gd';g.innerHTML='🎁 跟著箭頭，先到<b>哺乳室</b>免費體驗';el.appendChild(g)}}
function w3TownGuide(st,dt){const np=(W3.props||[]).find(p=>p.id==='nurse');if(!np||st.cfg.guide===false)return;
  const d=Math.hypot(np.x-st.P.x,np.z-st.P.z);
  if(d<3.2){st.cfg.guide=false;w3TownGuideHud(false);if(st.fg)st.fg.forEach(m=>m.visible=false);if(st.gm)st.gm.visible=false;return}
  if(!st.gm){const m=new THREE.Mesh(new THREE.RingGeometry(.9,1.25,40),new THREE.MeshBasicMaterial({color:'#f3c04a',transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.08;m.renderOrder=3;st.S.add(m);st.gm=m}
  st.gm.visible=true;st.gm.position.x=np.x;st.gm.position.z=np.z;const k=1+.15*Math.sin(st.t*3.5);st.gm.scale.set(k,k,1);
  np.lab.visible=true;w3FlowGuide(st,{s:0},[np],true)}
