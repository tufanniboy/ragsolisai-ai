(()=>{
  document.documentElement.classList.add('js');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const title=document.querySelector('[data-split]');
  if(title&&!reduced){
    const nodes=[];
    title.childNodes.forEach(node=>{
      if(node.nodeType===3){
        node.textContent.split(/(\s+)/).forEach(part=>{
          if(!part)return;
          if(/^\s+$/.test(part)){nodes.push(document.createTextNode(part));return;}
          const span=document.createElement('span');span.className='word';span.textContent=part;nodes.push(span);
        });
      }else if(node.nodeType===1){
        const clone=node.cloneNode(false);
        node.textContent.split(/(\s+)/).forEach(part=>{
          if(!part)return;
          if(/^\s+$/.test(part)){clone.append(document.createTextNode(part));return;}
          const span=document.createElement('span');span.className='word';span.textContent=part;clone.append(span);
        });nodes.push(clone);
      }
    });title.replaceChildren(...nodes);
  }
  requestAnimationFrame(()=>document.body.classList.add('loaded'));
  const reveals=[...document.querySelectorAll('.reveal')];
  if(reduced)reveals.forEach(el=>el.classList.add('in'));
  else{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -5%'});
    reveals.forEach(el=>observer.observe(el));
  }
  const menuButton=document.querySelector('.menu-toggle'), nav=document.querySelector('.main-nav');
  menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
  document.querySelectorAll('.main-nav a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false')}));
  const hero=document.querySelector('.hero'), signature=document.querySelector('.signature');
  if(hero&&signature&&!reduced){
    hero.addEventListener('pointermove',event=>{
      const rect=hero.getBoundingClientRect();
      signature.style.setProperty('--mx',`${Math.max(8,Math.min(92,(event.clientX-rect.left)/rect.width*100))}%`);
      signature.style.setProperty('--my',`${Math.max(8,Math.min(92,(event.clientY-rect.top)/rect.height*100))}%`);
    },{passive:true});
  }
  const strip=document.querySelector('.signal-strip');
  if(strip&&!reduced){
    addEventListener('scroll',()=>strip.style.setProperty('animation-delay',`${-scrollY/150}s`),{passive:true});
  }
  const form=document.querySelector('.contact-form');
  form?.addEventListener('submit',event=>{event.preventDefault();const button=form.querySelector('button');button.textContent='Message prepared →';});
  document.querySelector('.about-footer__form')?.addEventListener('submit',event=>event.preventDefault());

  const dockPanel=document.querySelector('.dock-panel'), dockItems=[...document.querySelectorAll('.dock-item')];
  if(dockPanel){
    const dockTargets=dockItems.map(()=>1), dockValues=dockItems.map(()=>1);
    let dockFrame=0, dockLast=performance.now();
    const dockBase=item=>Number.parseFloat(getComputedStyle(item).getPropertyValue('--dock-base'))||46;
    function animateDock(now){
      const elapsed=Math.min((now-dockLast)/1000,.05), amount=1-Math.exp(-elapsed/.075);
      dockLast=now;let moving=false;
      dockItems.forEach((item,index)=>{
        const next=dockValues[index]+(dockTargets[index]-dockValues[index])*amount;
        dockValues[index]=Math.abs(dockTargets[index]-next)<.001?dockTargets[index]:next;
        const size=dockBase(item)*dockValues[index];item.style.width=`${size}px`;item.style.height=`${size}px`;
        if(dockValues[index]!==dockTargets[index])moving=true;
      });
      dockFrame=moving?requestAnimationFrame(animateDock):0;
    }
    function startDock(){cancelAnimationFrame(dockFrame);dockLast=performance.now();dockFrame=requestAnimationFrame(animateDock)}
    dockPanel.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch')return;
      dockItems.forEach((item,index)=>{
        const rect=item.getBoundingClientRect(),distance=Math.abs(event.clientX-(rect.left+rect.width/2));
        const proximity=Math.max(0,1-distance/150);
        dockTargets[index]=1+.5*proximity*proximity*(3-2*proximity);
      });startDock();
    });
    dockPanel.addEventListener('pointerleave',()=>{dockTargets.fill(1);startDock()});
    addEventListener('resize',()=>{dockTargets.fill(1);dockValues.fill(1);dockItems.forEach(item=>{item.style.width='';item.style.height=''})},{passive:true});

    const dockFolder=document.querySelector('.dock-folder'),dockFolderToggle=document.querySelector('.dock-folder__toggle'),dockFolderMenu=document.querySelector('.dock-folder__menu');
    const setDockFolder=open=>{dockFolder.classList.toggle('is-open',open);dockFolderToggle.setAttribute('aria-expanded',String(open));dockFolderToggle.setAttribute('aria-label',open?'Close services':'Open services');dockFolderMenu.setAttribute('aria-hidden',String(!open))};
    dockFolderToggle.addEventListener('click',event=>{event.stopPropagation();setDockFolder(!dockFolder.classList.contains('is-open'))});
    dockFolderMenu.addEventListener('click',event=>{if(event.target.closest('a'))setDockFolder(false)});
    document.addEventListener('pointerdown',event=>{if(!dockFolder.contains(event.target))setDockFolder(false)});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dockFolder.classList.contains('is-open')){setDockFolder(false);dockFolderToggle.focus()}});

    const current=location.pathname.split('/').pop()||'';
    const serviceActive=[...dockFolderMenu.querySelectorAll('a')].some(link=>link.getAttribute('href')===current);
    dockFolderToggle.classList.toggle('is-active',serviceActive);
    dockItems.forEach(item=>{const href=item.getAttribute('href');if(href&&href.split('#')[0]===current)item.classList.add('is-active')});
  }
})();
