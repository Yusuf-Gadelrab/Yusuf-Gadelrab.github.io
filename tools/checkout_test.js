const fs=require('fs');const {JSDOM}=require('jsdom');
const pages=['store.html','templates.html','kxngsef.html','resume.html','sprint.html'];
const wl=fs.readFileSync('public/js/waitlist.js','utf8');
const cm=fs.readFileSync('public/js/commerce.js','utf8');
const {VirtualConsole}=require('jsdom');
function mkvc(){const v=new VirtualConsole();v.on('jsdomError',e=>{const m=(e.detail&&e.detail.message)||e.message;if(!/matchMedia|IntersectionObserver|Not implemented|scrollTo/.test(m))console.log('  pageErr:',m);});return v;}
let fail=0;
(async()=>{
for(const p of pages){
  let html=fs.readFileSync('public/'+p,'utf8')
    .replace(/<script src="\/js\/(site|waitlist|commerce)\.js" defer><\/script>/g,'')
    .replace('</body>',`<script>${wl}<\/script><script>${cm}<\/script></body>`);
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/'+p,pretendToBeVisual:true,virtualConsole:mkvc()});
  const w=dom.window,d=w.document;
  w.matchMedia=w.matchMedia||(()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}));
  await new Promise(r=>{ if(d.readyState!=='loading') r(); else d.addEventListener('DOMContentLoaded',r); });
  await new Promise(r=>setTimeout(r,30));
  const btns=[...d.querySelectorAll('[data-buy]')];
  const pending=btns.filter(b=>b.getAttribute('data-pending')==='1');
  const hasJoin=!!(w.YGWaitlist&&typeof w.YGWaitlist.join==='function');
  let panel=false,label='';
  if(btns[0]){ label=btns[0].textContent.trim();
    btns[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
    panel=!!d.querySelector('.yg-cm input[type=email]'); }
  const noBuyWord = btns.every(b=>!/\bbuy\b/i.test(b.textContent));
  const ok=btns.length&&pending.length===btns.length&&hasJoin&&panel&&noBuyWord;
  if(!ok)fail++;
  console.log(`${ok?'PASS':'FAIL'} ${p}: btns=${btns.length} pending=${pending.length} join=${hasJoin} panel=${panel} nobuy=${noBuyWord} label="${label}"`);
  dom.window.close();
}

// live-URL regression: a pasted, real http(s) URL must still produce a plain buy link.
{
  const html=`<!doctype html><body><a data-buy="x" data-name="Thing">Get it</a>
    <script>const CHECKOUT={x:"https://example.com/buy/x"};<\/script>
    <script>${wl}<\/script><script>${cm}<\/script></body>`;
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',virtualConsole:mkvc()});
  await new Promise(r=>setTimeout(r,30));
  const a=dom.window.document.querySelector('[data-buy]');
  const ok=a.href==='https://example.com/buy/x'&&a.target==='_blank'&&!a.getAttribute('data-pending');
  if(!ok)fail++;
  console.log(`${ok?'PASS':'FAIL'} live-url: href=${a.href} target=${a.target} pending=${a.getAttribute('data-pending')}`);
}
console.log(fail?`\n${fail} FAILED`:'\nALL PASS');process.exit(fail?1:0);})();
