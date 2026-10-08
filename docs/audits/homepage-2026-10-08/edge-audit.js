async (page) => {
 const b=await page.context().browser().browserType().launch({channel:'chrome',headless:true});
 const results={};const dir='D:/CF2M/Web/IA - PER/docs/audits/homepage-2026-10-08';
 const c=await b.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});const p=await c.newPage();
 try {
 await p.goto('http://127.0.0.1:4173/index.html');await p.reload();await p.evaluate(()=>document.fonts.ready);
 results.mobileHeader=await p.locator('#header').boundingBox();
 await p.locator('.header-section-links a[href="#about"]').click();
 await p.waitForFunction(()=>location.hash==='#about');
 await p.screenshot({path:dir+'/375-about-anchor.png'});
 results.anchor=await p.evaluate(()=>({headerBottom:document.querySelector('#header').getBoundingClientRect().bottom,title:document.querySelector('#about-title').getBoundingClientRect().top,tabTop:document.querySelector('.about-story__tabs').getBoundingClientRect().top}));
 await p.locator('[data-about-tab="0"]').focus();await p.keyboard.press('End');await p.keyboard.press('Home');
 results.tabFocus=await p.locator('[data-about-tab="0"]').evaluate(e=>({outline:getComputedStyle(e).outline,offset:getComputedStyle(e).outlineOffset,parentOverflow:getComputedStyle(e.parentElement).overflow}));
 await p.screenshot({path:dir+'/375-tab-focus.png'});
 await p.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
 results.spacing=[];
 for(let i=0;i<4;i++) {
 await p.locator('[data-about-tab="'+i+'"]').click();
 await p.locator('.about-story__stage').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
 results.spacing.push(await p.evaluate(()=>{const f=document.querySelector('[data-about-screen].is-active .about-story__frame');const stage=document.querySelector('.about-story__stage');const ch=document.querySelector('[data-about-panel]:not([hidden])');return {screen:document.querySelector('[data-about-screen].is-active').dataset.aboutScreen,frame:[f.clientWidth,f.scrollWidth,f.clientHeight,f.scrollHeight],stageBottom:stage.getBoundingClientRect().bottom,frameBottom:f.getBoundingClientRect().bottom,chapterTop:ch.getBoundingClientRect().top,overflow:document.documentElement.scrollWidth};}));
 await p.screenshot({path:dir+'/375-spacing-tab-'+i+'.png'});
 }
 await p.goto('http://127.0.0.1:4173/index.html');await p.reload();
 await p.setViewportSize({width:1440,height:900});await p.locator('.hero-cadence__cta').hover();
 results.ctaHover=await p.locator('.hero-cadence__cta').evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor,font:getComputedStyle(e).fontSize,weight:getComputedStyle(e).fontWeight}));
 await p.locator('.hero-cadence__cta').focus();results.ctaFocus=await p.locator('.hero-cadence__cta').evaluate(e=>({outline:getComputedStyle(e).outline,offset:getComputedStyle(e).outlineOffset}));
 await p.locator('#team').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await p.locator('.team-members .team-member').first().hover();
 results.reducedMotionTeam=await p.locator('.team-members .team-member').first().evaluate(e=>({transition:getComputedStyle(e).transition,transform:getComputedStyle(e).transform}));
 for(const w of [320,375,768,1024]) {
 await p.setViewportSize({width:w,height:812});await p.goto('http://127.0.0.1:4173/index.html');await p.reload();
 if(w<960) await p.locator('[data-about-tab="3"]').click();
 else await p.locator('[data-about-panel="3"]').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
 await p.evaluate(()=>{const els=[...document.querySelectorAll('main *')];const sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize)*2);els.forEach((e,i)=>e.style.setProperty('font-size',sizes[i]+'px','important'));});
 await p.locator('.about-story__stage').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
 await p.screenshot({path:dir+'/'+w+'-text200.png'});
 results['text200-'+w]=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth,frames:[...document.querySelectorAll('.about-story__screen.is-active .about-story__frame')].map(e=>({client:[e.clientWidth,e.clientHeight],scroll:[e.scrollWidth,e.scrollHeight]})),outside:[...document.querySelectorAll('main p,main h1,main h2,main h3,main li')].filter(e=>e.checkVisibility()&&e.getBoundingClientRect().right>innerWidth+1).map(e=>e.textContent)}));
 }
 await p.setViewportSize({width:1024,height:600});await p.goto('http://127.0.0.1:4173/index.html#about');await p.reload();
 await p.locator('[data-about-panel="2"]').evaluate(e=>{const r=e.getBoundingClientRect();window.scrollTo({top:scrollY+r.top+r.height/2-innerHeight*.45,behavior:'instant'});});
 await p.waitForFunction(()=>document.querySelector('[data-about-screen].is-active').dataset.aboutScreen==='2');
 results.shortDesktop=await p.evaluate(()=>({header:document.querySelector('#header').getBoundingClientRect().bottom,stageTop:document.querySelector('.about-story__stage').getBoundingClientRect().top}));
 await p.screenshot({path:dir+'/1024-short-about.png'});
 }finally {await b.close();}
 return results;
}
