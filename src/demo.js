/** Standalone gallery. The material is independent of this demo and media catalog. */
(function () {
  const $ = id => document.getElementById(id);
  const stage=$('stage'), lens=$('main-glass'), video=$('media-video'), image=$('media-image');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let mode='auto',shape='card',palette=0,clicks=0,backdrop='spectrum';
  let point={x:0,y:0},started=false,request=0,toastTimer=0,uploadToken=0,userMoved=false;
  let wasPlaying=false,manualPlay=false,disposed=false;
  const custom={wallpaper:null,video:null};
  const selected={wallpaper:'yunxi',video:'pearl-motion'};
  let activeMedia=MEDIA_ASSETS.find(a=>a.id==='yunxi');
  const main=mountLiquidGlass(lens);
  const presets={
    button:{radius:12,bevel:7,refraction:15,blur:.35,dispersion:.25,tint:'rgba(255,255,255,.21)'},
    switch:{radius:99,bevel:5,refraction:8,blur:.2,dispersion:.15,tint:'rgba(255,255,255,.82)'},
    slider:{radius:99,bevel:5,refraction:9,blur:.25,dispersion:.18,tint:'rgba(255,255,255,.44)'},
    segmented:{radius:13,bevel:7,refraction:14,blur:.4,dispersion:.25,tint:'rgba(255,255,255,.16)'},
    chip:{radius:99,bevel:6,refraction:11,blur:.3,dispersion:.2,tint:'rgba(255,255,255,.17)'},
    toolbar:{radius:14,bevel:8,refraction:16,blur:.4,dispersion:.3,tint:'rgba(255,255,255,.16)'},
  };
  const examples=[...document.querySelectorAll('[data-control-glass]')].map(el=>
    mountLiquidGlass(el,{...presets[el.dataset.controlGlass],...(el.dataset.size==='icon'?{radius:99}: {})}));
  const params=['refraction','bevel','blur','dispersion'];
  // The material engine coalesces translation and lighting into one frame.
  let limits=null;
  function constraints(){if(!limits)limits={w:stage.clientWidth-lens.offsetWidth,h:stage.clientHeight-lens.offsetHeight};return limits;}
  function position(x,y){const {w,h}=constraints();point={x:Math.max(12,Math.min(x,w-12)),y:Math.max(12,Math.min(y,h-12))};setLiquidGlassPosition(lens,point.x,point.y);}
  function center(){const {w,h}=constraints();position(w*.57,h*.57);}
  function pressed(attr,value){document.querySelectorAll('['+attr+']').forEach(b=>b.setAttribute('aria-pressed',String(b.getAttribute(attr)===value)));}
  function status(){const kind=main.renderer;$('renderer-status').textContent=kind==='svg'?'SVG 背景折射 · 已启用':kind==='solid'?'减少透明 / 高对比 · 实色模式':'CSS 毛玻璃 · 无背景折射';document.querySelector('.engine-dot').style.background=kind==='svg'?'#37a06f':'#9d895d';}
  function update(){
    const values={};params.forEach(k=>{const input=$(k),v=Number(input.value);values[k]=v;input.style.setProperty('--percent',(v-Number(input.min))/(Number(input.max)-Number(input.min))*100);$(k+'-output').value=k==='blur'?v.toFixed(2)+' px':k==='bevel'?v+' px':k==='dispersion'?v.toFixed(2):String(v);});
    main.update({...values,mode,radius:shape==='card'?40:999});requestAnimationFrame(()=>requestAnimationFrame(status));
  }
  params.forEach(k=>$(k).addEventListener('input',update));
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;pressed('data-mode',mode);examples.forEach(c=>c.update({mode}));update();}));
  document.querySelectorAll('[data-shape-choice]').forEach(b=>b.addEventListener('click',()=>{const cx=point.x+lens.offsetWidth/2,cy=point.y+lens.offsetHeight/2;shape=b.dataset.shapeChoice;lens.dataset.shape=shape;limits=null;pressed('data-shape-choice',shape);position(cx-lens.offsetWidth/2,cy-lens.offsetHeight/2);update();}));
  $('show-content').addEventListener('change',()=>lens.classList.toggle('hide-content',!$('show-content').checked));
  const palettes=['linear-gradient(90deg,#02b6d7,#266cd9 18%,#7054d4 34%,#d838aa 49%,#f64964 65%,#ffae36 80%,#dadf39 92%,#62c764)','linear-gradient(90deg,#3750b9,#447cca 18%,#15b5c8 40%,#67cbb9 62%,#b2d980 82%,#e5df69)','linear-gradient(90deg,#bc56a5,#ee767c 24%,#e89359 43%,#c79759 67%,#85a282 85%,#478a99)'];
  $('change-color').addEventListener('click',()=>{palette=(palette+1)%palettes.length;stage.style.setProperty('--spectrum',palettes[palette]);});
  $('tone-toggle').addEventListener('click',()=>stage.dataset.tone=stage.dataset.tone==='light'?'dark':'light');
  function notify(message){$('media-toast').textContent=message;$('media-toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('media-toast').hidden=true,4200);}
  function mediaStatus(text){$('media-status').textContent=text;}
  function clock(){const sec=Number.isFinite(video.currentTime)?Math.floor(video.currentTime):0;const text=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;if($('media-time').textContent!==text)$('media-time').textContent=text;}
  function playState(){const paused=video.paused;$('media-play').setAttribute('aria-label',paused?'播放背景视频':'暂停背景视频');$('media-play').querySelector('use').setAttribute('href',paused?'#play-icon':'#pause-icon');}
  async function playBackground(explicit=false){
    if(backdrop!=='video'||disposed||document.hidden)return;
    if(reduced.matches&&!explicit&&!manualPlay){mediaStatus('减少动态效果已开启 · 点击播放');return;}
    const ticket=request;if(explicit)manualPlay=true;
    try{video.muted=true;await video.play();if(ticket!==request||backdrop!=='video')return;mediaStatus(`${activeMedia.label} · 静音循环视频`);}
    catch(e){if(ticket===request&&backdrop==='video'&&e.name!=='AbortError'){mediaStatus('视频尚未播放 · 点击右下角播放');}}
    playState();
  }
  function items(type){return [...MEDIA_ASSETS.filter(a=>a.type===type),...(custom[type]?[custom[type]]:[])];}
  function strip(){
    const root=$('media-filmstrip');root.replaceChildren();if(backdrop!=='wallpaper'&&backdrop!=='video')return;
    items(backdrop).forEach(a=>{
      const b=document.createElement('button');b.type='button';b.className='media-thumb';b.dataset.mediaId=a.id;b.setAttribute('aria-label',a.label);b.title=a.label+(a.type==='video'?' · 视频':' · 壁纸');b.setAttribute('aria-pressed',String(selected[backdrop]===a.id));
      if(a.thumb||a.poster)b.style.backgroundImage=`url("${a.thumb||a.poster}")`;
      if(a.type==='video')b.innerHTML='<svg aria-hidden="true"><use href="#play-icon"/></svg>';
      b.addEventListener('click',()=>{selected[backdrop]=a.id;setBackground(backdrop);});root.append(b);
    });
  }
  function sampleBackdrop(url){if(url){const resolved=new URL(url,document.baseURI).href;$('samples').style.setProperty('--sample-wallpaper',`url("${resolved}")`);}}
  function stopVideo(){wasPlaying=false;video.pause();video.hidden=true;manualPlay=false;}
  function setBackground(type){
    request++;backdrop=type;stage.dataset.backdrop=type;pressed('data-backdrop-choice',type);stopVideo();
    $('change-color').hidden=type==='wallpaper'||type==='video';$('media-play').hidden=type!=='video';$('media-time').hidden=type!=='video';
    if(type==='wallpaper'||type==='video'){
      activeMedia=items(type).find(a=>a.id===selected[type])||items(type)[0];
      selected[type]=activeMedia.id;stage.dataset.tone=activeMedia.tone||'dark';
      $('scene-name').textContent=activeMedia.code||'LOCAL / MEDIA';$('scene-description').textContent=activeMedia.label+(type==='video'?' · 浅色动态影像':' · 浅色壁纸');
      const poster=activeMedia.poster|| (type==='wallpaper'?activeMedia.src:'');
      image.hidden=!poster;if(poster)image.src=poster;
      sampleBackdrop(poster);strip();
      if(type==='video'){
        video.hidden=false;if(poster)video.poster=poster;else video.removeAttribute('poster');
        mediaStatus(`${activeMedia.label} · 加载视频`);
        if(video.getAttribute('src')!==activeMedia.src){video.src=activeMedia.src;video.load();}
        playBackground();
      }else mediaStatus(activeMedia.local?`${activeMedia.label} · 仅本地预览`:`${activeMedia.label} · 本地静态资源`);
    }else{
      image.hidden=true;stage.dataset.tone='dark';strip();
      mediaStatus(type==='spectrum'?'背景折射，前景文字保持清晰。':type==='grid'?'移动镜片，观察网格在曲面处弯折。':'真实 DOM 文字，不是玻璃内置的图片。');
    }
    playState();clock();
  }
  document.querySelectorAll('[data-backdrop-choice]').forEach(b=>b.addEventListener('click',()=>setBackground(b.dataset.backdropChoice)));
  $('media-play').addEventListener('click',()=>{if(video.paused)playBackground(true);else{video.pause();mediaStatus(`${activeMedia.label} · 已暂停`);}playState();});
  video.addEventListener('play',playState);video.addEventListener('pause',playState);video.addEventListener('timeupdate',clock);
  video.addEventListener('error',()=>{if(backdrop==='video'){video.hidden=true;mediaStatus('此视频无法解码 · 可导入 MP4 / WebM 文件');notify('视频解码失败。已保留静态封面，试试导入其他视频。');}});
  image.addEventListener('error',()=>{if(backdrop==='wallpaper'){mediaStatus('图片加载失败 · 请重新选择素材');}});
  function visibility(){if(document.hidden){wasPlaying=!video.paused;video.pause();}else if(wasPlaying&&backdrop==='video'){wasPlaying=false;playBackground();}}
  document.addEventListener('visibilitychange',visibility);
  function motionChange(){if(reduced.matches){manualPlay=false;video.pause();if(backdrop==='video')mediaStatus('减少动态效果已开启 · 点击播放');}}
  reduced.addEventListener('change',motionChange);
  $('import-media').addEventListener('click',()=>$('media-file').click());
  async function validateLocal(file,url,type){
    if(type==='wallpaper'){
      const test=new Image();test.src=url;await test.decode();
      if(!test.naturalWidth||!test.naturalHeight)throw new Error('无法读取图片');
      const c=document.createElement('canvas');c.width=192;c.height=120;const ctx=c.getContext('2d');
      const ratio=Math.max(c.width/test.naturalWidth,c.height/test.naturalHeight),w=test.naturalWidth*ratio,h=test.naturalHeight*ratio;ctx.drawImage(test,(192-w)/2,(120-h)/2,w,h);
      return {poster:url,thumb:c.toDataURL('image/jpeg',.84)};
    }
    const test=document.createElement('video');test.muted=true;test.preload='auto';test.playsInline=true;
    try{
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('视频读取超时')),12000);
        const done=fn=>{clearTimeout(timer);test.onloadeddata=null;test.onerror=null;fn();};
        test.onloadeddata=()=>done(resolve);test.onerror=()=>done(()=>reject(new Error('浏览器无法解码这个视频')));test.src=url;test.load();
      });
      if(!test.videoWidth)throw new Error('视频没有可用画面');
      const c=document.createElement('canvas');c.width=480;c.height=300;c.getContext('2d').drawImage(test,0,0,c.width,c.height);
      const poster=c.toDataURL('image/jpeg',.84);return {poster,thumb:poster};
    }finally{test.pause();test.removeAttribute('src');test.load();}
  }
  $('media-file').addEventListener('change',async()=>{
    const file=$('media-file').files?.[0];$('media-file').value='';if(!file)return;
    const ticket=++uploadToken;
    const type=/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)?'wallpaper':/^video\/(mp4|webm|quicktime)$/.test(file.type)?'video':null;
    if(!type){notify('请选择 JPG、PNG、WebP、GIF、AVIF 图片，或 MP4 / WebM / MOV 视频。');return;}
    if(file.size>(type==='video'?200:30)*1024*1024){notify(type==='video'?'视频请控制在 200 MB 以内。':'图片请控制在 30 MB 以内。');return;}
    const url=URL.createObjectURL(file);notify('正在读取本地文件，不会上传…');
    try{
      const decoded=await validateLocal(file,url,type);
      if(ticket!==uploadToken||disposed){URL.revokeObjectURL(url);return;}
      const previous=custom[type];custom[type]={id:'local-'+type,type,label:file.name,code:'LOCAL / PRIVATE',src:url,tone:'light',local:true,...decoded};selected[type]=custom[type].id;
      setBackground(type);if(previous)URL.revokeObjectURL(previous.src);notify('已载入本地文件。文字明暗可用预览区下方的半圆按钮切换。');
    }catch(e){URL.revokeObjectURL(url);if(ticket===uploadToken)notify((e.message||'读取失败')+'，原背景已保留。');}
  });
  $('demo-button').addEventListener('click',()=>{$('click-output').value=`DONE · ${++clicks}`;});
  $('cancel-button').addEventListener('click',()=>{clicks=0;$('click-output').value='READY';});
  $('favorite-button').addEventListener('click',()=>{const b=$('favorite-button'),saved=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(saved));b.setAttribute('aria-label',saved?'取消收藏':'收藏');$('click-output').value=saved?'SAVED':'UNSAVED';});
  function switchStatus(){$('switch-output').value=[$('demo-switch'),$('focus-switch')].map(b=>b.getAttribute('aria-checked')==='true'?'ON':'OFF').join(' / ');}
  ['demo-switch','focus-switch'].forEach(id=>$(id).addEventListener('click',()=>{$(id).setAttribute('aria-checked',String($(id).getAttribute('aria-checked')!=='true'));switchStatus();}));
  function slider(){const v=Number($('demo-slider').value);$('demo-range').style.setProperty('--p',v/100);$('slider-output').value=v+'%';}
  $('demo-slider').addEventListener('input',slider);slider();
  function chooseSegment(b){document.querySelectorAll('[data-segment]').forEach(x=>{x.setAttribute('aria-checked',String(x===b));x.tabIndex=x===b?0:-1;});$('segment-output').value=b.textContent;}
  document.querySelectorAll('[data-segment]').forEach(b=>b.addEventListener('click',()=>chooseSegment(b)));
  function rove(event,selector,activate){
    const buttons=[...event.currentTarget.querySelectorAll(selector)].filter(b=>!b.disabled);let i=buttons.indexOf(document.activeElement);if(i<0)return;
    const key=event.key;let next=i;if(key==='ArrowRight'||key==='ArrowDown')next=(i+1)%buttons.length;else if(key==='ArrowLeft'||key==='ArrowUp')next=(i-1+buttons.length)%buttons.length;else if(key==='Home')next=0;else if(key==='End')next=buttons.length-1;else return;
    event.preventDefault();buttons.forEach((b,j)=>b.tabIndex=j===next?0:-1);buttons[next].focus();activate?.(buttons[next]);
  }
  document.querySelector('.lg-segmented').addEventListener('keydown',e=>rove(e,'[data-segment]',chooseSegment));
  document.querySelectorAll('[data-chip]').forEach(b=>b.addEventListener('click',()=>{b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));$('chip-output').value=`${document.querySelectorAll('[data-chip][aria-pressed=true]').length} SELECTED`;}));
  function chooseTool(b){document.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('tool-output').value=b.getAttribute('aria-label');}
  const toolbar=document.querySelector('.lg-toolbar');
  toolbar.addEventListener('keydown',e=>rove(e,'button'));
  toolbar.querySelectorAll('button').forEach(b=>b.addEventListener('focus',()=>toolbar.querySelectorAll('button').forEach(x=>x.tabIndex=x===b?0:-1)));
  document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>chooseTool(b)));
  $('undo-tool').addEventListener('click',()=>chooseTool(document.querySelector('[data-tool=cursor]')));
  $('sample-tone').addEventListener('click',()=>{const dark=$('samples').dataset.tone!=='dark';$('samples').dataset.tone=dark?'dark':'light';$('sample-tone').setAttribute('aria-pressed',String(dark));$('sample-tone').querySelector('span').textContent=dark?'浅色底图':'深色底图';});
  let drag=null;
  lens.addEventListener('pointerdown',e=>{if(e.button!==0)return;userMoved=true;drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:point.x,py:point.y};lens.setPointerCapture(e.pointerId);lens.classList.add('dragging');lens.focus({preventScroll:true});});
  lens.addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id)position(drag.px+e.clientX-drag.x,drag.py+e.clientY-drag.y);});
  function endDrag(){drag=null;lens.classList.remove('dragging');}
  lens.addEventListener('pointerup',endDrag);lens.addEventListener('pointercancel',endDrag);lens.addEventListener('lostpointercapture',endDrag);
  lens.addEventListener('keydown',e=>{userMoved=true;const s=e.shiftKey?30:10;const dirs={ArrowLeft:[-s,0],ArrowRight:[s,0],ArrowUp:[0,-s],ArrowDown:[0,s]};if(dirs[e.key]){e.preventDefault();position(point.x+dirs[e.key][0],point.y+dirs[e.key][1]);}if(e.key==='Home'){e.preventDefault();center();}});
  const ro=new ResizeObserver(()=>{limits=null;if(!userMoved){center();started=true;}else position(point.x,point.y);});ro.observe(stage);
  $('reset').addEventListener('click',()=>{
    mode='auto';shape='card';palette=0;clicks=0;userMoved=false;lens.dataset.shape=shape;lens.classList.remove('hide-content');$('show-content').checked=true;limits=null;
    params.forEach(k=>$(k).value=GLASS_DEFAULTS[k]);pressed('data-mode',mode);pressed('data-shape-choice',shape);stage.style.setProperty('--spectrum',palettes[0]);
    selected.wallpaper='yunxi';selected.video='pearl-motion';setBackground('spectrum');
    $('demo-switch').setAttribute('aria-checked','true');$('focus-switch').setAttribute('aria-checked','false');switchStatus();$('click-output').value='READY';$('favorite-button').setAttribute('aria-pressed','false');$('favorite-button').setAttribute('aria-label','收藏');
    $('demo-slider').value=48;slider();chooseSegment(document.querySelector('[data-segment]'));chooseTool(document.querySelector('[data-tool]'));
    document.querySelectorAll('[data-chip]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===0)));$('chip-output').value='1 SELECTED';
    $('samples').dataset.tone='light';$('sample-tone').setAttribute('aria-pressed','false');$('sample-tone').querySelector('span').textContent='深色底图';
    examples.forEach(c=>c.update({mode}));center();update();
  });
  ['(prefers-reduced-transparency: reduce)','(prefers-contrast: more)','(forced-colors: active)'].forEach(q=>matchMedia(q).addEventListener('change',()=>requestAnimationFrame(()=>requestAnimationFrame(status))));
  function dispose(){disposed=true;uploadToken++;request++;clearTimeout(toastTimer);video.pause();video.removeAttribute('src');video.load();ro.disconnect();main.destroy();examples.forEach(x=>x.destroy());Object.values(custom).forEach(a=>a&&URL.revokeObjectURL(a.src));document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motionChange);}
  window.addEventListener('pagehide',e=>{if(!e.persisted)dispose();});
  center();update();setBackground('spectrum');
  // Linked styles may finish after an embedded preview runs its scripts.
  // Re-center once after initial load, never after the user starts moving.
  const initialCenter=()=>requestAnimationFrame(()=>{if(!disposed&&!userMoved)center();});
  if(document.readyState==='complete')initialCenter();else window.addEventListener('load',initialCenter,{once:true});
  window.glassDemo={main,examples,refresh:update,position,reset:()=>$('reset').click(),setBackground,dispose,get activeMedia(){return activeMedia;}};
})();
