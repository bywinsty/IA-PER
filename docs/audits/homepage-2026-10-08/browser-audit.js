async (page) => {
  const dir = 'D:/CF2M/Web/IA - PER/docs/audits/homepage-2026-10-08';
  const browser = await page.context().browser().browserType().launch({headless: true, channel: 'chrome'});
  const report = {browser: browser.version(), viewports: [], errors: [], failedRequests: []};
  try {
    for (const [width,height] of [[320,740],[375,812],[390,844],[768,1024],[960,900],[1024,768],[1440,900],[1920,1080]]) {
      const context = await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce',isMobile:width<500,hasTouch:width<500});
      const p = await context.newPage();
      p.on('pageerror',e=>report.errors.push(String(e)));
      p.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()}));
      await p.goto('http://127.0.0.1:4173/index.html');
      await p.evaluate(()=>document.fonts.ready);
      for (const id of ['hero','about','team','partners']) {
        await p.locator('#'+id).evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
        await p.locator('#'+id+' img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});
        if ([375,768,1440].includes(width)) {
          await p.locator('#'+id).screenshot({path:`${dir}/${width}-${id}.png`});
        }
      }
      const data = await p.evaluate(()=>{
        const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,w:r.width,h:r.height};};
        const style=e=>{const s=getComputedStyle(e);return {font:s.fontSize,line:s.lineHeight,color:s.color,bg:s.backgroundColor,backgroundImage:s.backgroundImage,attachment:s.backgroundAttachment};};
        const visible=e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
        return {viewport:[innerWidth,innerHeight],scrollWidth:document.documentElement.scrollWidth,sections:[...document.querySelectorAll('main>section')].map(e=>({id:e.id,...box(e),background:style(e)})),headings:[...document.querySelectorAll('main h1,main h2')].map(e=>({text:e.textContent,...box(e),...style(e)})),images:[...document.querySelectorAll('main img')].map(e=>({src:e.getAttribute('src'),natural:[e.naturalWidth,e.naturalHeight],...box(e)})),team:[...document.querySelectorAll('.team-members .member-info')].map(e=>({text:e.textContent.trim(),...box(e),description:box(e.querySelector('p'))})),tabs:[...document.querySelectorAll('[data-about-tab]')].map(e=>({text:e.textContent,...box(e),selected:e.getAttribute('aria-selected')})),tabContainer:{...box(document.querySelector('.about-story__tabs')),scrollWidth:document.querySelector('.about-story__tabs').scrollWidth},overflow:[...document.querySelectorAll('main *')].filter(e=>visible(e)&&!e.closest('.about-story__tabs')&&e.getBoundingClientRect().width>0&&(e.getBoundingClientRect().right>innerWidth+1||e.getBoundingClientRect().left< -1)).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,70),...box(e)}))};
      });
      if(width<960) {
        data.tabChecks=[];
        for(let i=0;i<4;i++) {
          await p.locator('[data-about-tab="'+i+'"]').click();
          data.tabChecks.push(await p.evaluate(()=>({selected:document.querySelector('[aria-selected="true"]').textContent,visiblePanels:[...document.querySelectorAll('[data-about-panel]')].filter(e=>e.checkVisibility()).map(e=>e.id),screen:document.querySelector('[data-about-screen].is-active').dataset.aboutScreen})));
        }
        await p.locator('[data-about-tab="0"]').focus();
        await p.keyboard.press('End');
        data.keyboardEnd=await p.evaluate(()=>({focus:document.activeElement.id,selected:document.activeElement.getAttribute('aria-selected')}));
        await p.keyboard.press('Home');
        data.keyboardHome=await p.evaluate(()=>({focus:document.activeElement.id,selected:document.activeElement.getAttribute('aria-selected')}));
      }
      if(width===1440) {
        data.scrollChapters=[];
        for(let i=0;i<4;i++) {
          await p.locator('[data-about-panel="'+i+'"]').evaluate(e=>{const r=e.getBoundingClientRect();window.scrollTo({top:scrollY+r.top+r.height/2-innerHeight*.45,behavior:'instant'});});
          await p.waitForFunction(i=>document.querySelector('[data-about-screen].is-active').dataset.aboutScreen===String(i),i);
          await p.screenshot({path:`${dir}/1440-about-chapter-${i}.png`});
          data.scrollChapters.push(i);
        }
        await p.locator('.hero-cadence__cta').click();
        await p.waitForURL('**/thematiques.html#themes');
        data.cta={url:p.url(),target:await p.locator('#themes').count()};
      }
      report.viewports.push(data);
      await context.close();
    }
  } finally { await browser.close(); }
  return report;
}
