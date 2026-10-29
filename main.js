'use strict';
(() => {
 const {plants,boundary,storage}=window.KIT15;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const NS='http://www.w3.org/2000/svg';
 const fmt=n=>new Intl.NumberFormat('it-CH',{maximumFractionDigits:1}).format(n);
 const date=s=>new Intl.DateTimeFormat('it-CH',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));
 const shortDate=s=>new Intl.DateTimeFormat('it-CH',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));
 const types={flow:{name:'Acqua fluente',color:'#b9da49',text:'Sfrutta l’acqua che scorre. La produzione dipende dalla portata disponibile nel corso d’acqua.'},storage:{name:'Con serbatoio',color:'#95d9e5',text:'L’acqua viene accumulata e poi fatta scendere verso le turbine. Il bacino permette di scegliere quando produrre.'},pump:{name:'Pompaggio misto',color:'#acb5f8',text:'Può anche riportare acqua verso l’alto consumando elettricità. Il pompaggio conserva energia, con delle perdite.'},loop:{name:'Sola ricircolazione',color:'#ed7770',text:'Sposta acqua tra bacini: consuma energia per pompare e ne restituisce una parte quando turbina. Non crea nuova energia.'}};
 const typeOf=p=>p.type==='Laufkraftwerk'?'flow':p.type==='Speicherkraftwerk'?'storage':p.type==='Pumpspeicherkraftwerk'?'pump':'loop';
 const state={view:'origin',scope:'ch',selected:'601300',region:'totalCH',week:storage.totalCH.entries.length-1,types:new Set(Object.keys(types)),timer:null};
 function svg(tag,attrs={},parent){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.append(e);return e;}
 function text(parent,x,y,value,cls='map-label',attrs={}){const e=svg('text',{x,y,class:cls,...attrs},parent);e.textContent=value;return e;}
 function project([lon,lat]) {return [lon*Math.cos(46.8*Math.PI/180),-lat];}
 let projection;
 function setProjection(){
  let pts=state.scope==='ch'?boundary:[[8.35,45.8],[9.35,46.65]];
  pts=pts.map(project);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
  const scale=Math.min(700/(xmax-xmin),390/(ymax-ymin));
  projection=ll=>{let p=project(ll);return [395+(p[0]-(xmin+xmax)/2)*scale,235+(p[1]-(ymin+ymax)/2)*scale];};
 }
 function renderMap(){
  setProjection();const root=$('#map');root.replaceChildren();
  const path=boundary.map((p,i)=>`${i?'L':'M'}${projection(p).join(',')}`).join(' ')+'Z';
  svg('path',{d:path,class:'country-shadow'},root);svg('path',{d:path,class:'country'},root);
  if(state.scope==='ch'){
   [['Lago Lemano',6.5,46.38],['Lago di Costanza',9.3,47.65],['TICINO',8.75,45.86]].forEach(([n,x,y])=>{const p=projection([x,y]);text(root,p[0],p[1],n,'map-label',{'text-anchor':'middle'});});
  }
  const shown=plants.filter(p=>{const [x,y]=projection([p.lon,p.lat]);return x>8&&x<782&&y>8&&y<450&&state.types.has(typeOf(p));}).sort((a,b)=>b.energy-a.energy);
  $('#plant-count').textContent=shown.length;
  shown.forEach(p=>{
   const [cx,cy]=projection([p.lon,p.lat]);const r=Math.max(2.3,Math.sqrt(p.energy/2103)*18);
   const c=svg('circle',{cx,cy,r,fill:types[typeOf(p)].color,class:'plant-dot'+(p.id===state.selected?' is-selected':''),'data-id':p.id},root);
   const title=svg('title',{},c);title.textContent=`${p.name} · ${fmt(p.energy)} GWh/an attesi`;
   c.addEventListener('click',()=>selectPlant(p.id));
  });
  const sel=plants.find(p=>p.id===state.selected);
  if(shown.includes(sel)){
   const [x,y]=projection([sel.lon,sel.lat]);
   svg('circle',{cx:x,cy:y,r:Math.max(2.3,Math.sqrt(sel.energy/2103)*18)+7,class:'selection-ring'},root);
   const right=x<610; text(root,x+(right?20:-20),y-20,sel.name,'selected-label',{'text-anchor':right?'start':'end'});
  }
  root.setAttribute('aria-label',`Mappa con ${shown.length} centrali visibili. Selezionata: ${sel.name}. Usa anche l’elenco delle centrali sotto la mappa.`);
 }
 function renderMechanism(p){
  const t=typeOf(p),root=document.createElementNS(NS,'svg');root.setAttribute('viewBox','0 0 270 100');root.setAttribute('role','img');root.setAttribute('aria-label','Schema: acqua, turbina, elettricità');
  const defs=svg('defs',{},root),marker=svg('marker',{id:'arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:5,markerHeight:5,orient:'auto-start-reverse'},defs);svg('path',{d:'M0 0 10 5 0 10Z',fill:'#24251f'},marker);
  svg('path',{d:t==='flow'?'M10 38 H85 V65 H143':'M10 14 V44 H80 V14 M80 44 H100 V65 H143',fill:'none',stroke:'#24251f','stroke-width':2},root);
  svg('path',{d:t==='flow'?'M10 34 H85 V61 H136':'M12 29 H78 V42 H100 V61 H136',fill:'none',stroke:types[t].color,'stroke-width':7},root);
  svg('circle',{cx:156,cy:65,r:18,fill:'#f8efe0',stroke:'#24251f','stroke-width':2},root);
  svg('path',{d:'M156 49 V81 M140 65 H172 M145 54 167 76 M145 76 167 54',stroke:'#24251f','stroke-width':2},root);
  svg('path',{d:'M178 65 H227',stroke:'#24251f','stroke-width':2,'marker-end':'url(#arrow)'},root);
  svg('path',{d:'m248 40-14 24h11l-5 22 20-29h-13Z',fill:'#b9da49',stroke:'#24251f','stroke-width':1.5},root);
  text(root,35,94,t==='flow'?'fiume':'accumulo','map-label',{'text-anchor':'middle'});text(root,157,99,'turbina','map-label',{'text-anchor':'middle'});
  $('#mechanism').replaceChildren(root);
 }
 function selectPlant(id){
  state.selected=id;const p=plants.find(p=>p.id===id),t=types[typeOf(p)];
  $('#plant-name').textContent=p.name;$('#plant-energy').textContent=fmt(p.energy);$('#plant-head').textContent=fmt(p.head);
  $('#plant-type').textContent=t.name;$('#plant-id').textContent=`WASTA ${p.id}`;
  $('#plant-location').textContent=state.scope==='ti'?'Inquadratura sul Ticino e dintorni':'Inventario svizzero WASTA';
  $('#plant-explainer').textContent=t.text;
  $('#plant-link').href=`https://map.geo.admin.ch/?lang=it&topic=energie&layers=ch.bfe.statistik-wasserkraftanlagen&ch.bfe.statistik-wasserkraftanlagen=${p.id}`;
  $('#plant-select').value=id;
  $$('#plant-picks button').forEach(b=>{b.classList.toggle('active',b.dataset.id===id);b.setAttribute('aria-pressed',String(b.dataset.id===id));});
  renderMechanism(p);renderMap();
 }
 const picks=[['601300','Biasca'],['602600','Bavona'],['602500','Robiei'],['600100','Lucendro'],['504950','Bieudron'],['109400','Rheinfelden']];
 picks.forEach(([id,name])=>{const b=document.createElement('button');b.textContent=name;b.dataset.id=id;b.type='button';b.onclick=()=>{const p=plants.find(p=>p.id===id);if(state.scope==='ti'&&(p.lon<8.35||p.lon>9.35||p.lat<45.8||p.lat>46.65))setScope('ch');state.types.add(typeOf(p));syncTypeButtons();selectPlant(id);};$('#plant-picks').append(b);});
 [...plants].sort((a,b)=>a.name.localeCompare(b.name,'it')).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;$('#plant-select').append(o);});
 $('#plant-select').onchange=e=>{setScope('ch');state.types.add(typeOf(plants.find(p=>p.id===e.target.value)));syncTypeButtons();selectPlant(e.target.value);};
 function setScope(scope){state.scope=scope;$$('[data-scope]').forEach(b=>{const a=b.dataset.scope===scope;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a));});renderMap();}
 $$('[data-scope]').forEach(b=>b.onclick=()=>{setScope(b.dataset.scope);if(state.scope==='ti')selectPlant('601300');});
 function syncTypeButtons(){$$('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(state.types.has(b.dataset.type))));}
 $$('[data-type]').forEach(b=>b.onclick=()=>{const t=b.dataset.type;if(state.types.has(t)){if(state.types.size===1)return;state.types.delete(t);}else state.types.add(t);syncTypeButtons();renderMap();});
 const labels={wallis:'Vallese',graubuenden:'Grigioni',tessin:'Ticino',uebrigCH:'Resto della Svizzera'};
 const entries=()=>storage[state.region].entries;
 let barNodes=[];
 function renderHistory(){
  const root=$('#history');root.replaceChildren();barNodes=[];
  const data=entries(),width=Math.max(280,Math.round($('.history-chart').clientWidth)||850),left=34,right=width-12,top=25,bottom=265,w=(right-left)/data.length;root.setAttribute('viewBox',`0 0 ${width} 310`);
  [0,25,50,75,100].forEach(v=>{const y=bottom-v/100*(bottom-top);svg('line',{x1:left,x2:right,y1:y,y2:y,class:'grid'},root);text(root,left-12,y+4,String(v),'chart-label',{'text-anchor':'end'});});
  data.forEach((r,i)=>{const x=left+i*w,y=bottom-r.pct/100*(bottom-top);const bar=svg('rect',{x:x+2,y,width:Math.max(1,w-4),height:bottom-y,rx:2,class:'week-bar'},root);barNodes.push(bar);svg('rect',{x,y:top,width:w,height:bottom-top+10,class:'week-hit','data-week':i},root).addEventListener('click',()=>setWeek(i));});
  const line=data.filter(r=>r.avg!==null).map((r,i)=>`${i?'L':'M'}${left+(i+.5)*w},${bottom-r.avg/100*(bottom-top)}`).join(' ');svg('path',{d:line,class:'reference-line'},root);
  (width<500?[0,17,34,51]:[0,9,18,27,36,45,51]).forEach(i=>text(root,left+(i+.5)*w,bottom+27,shortDate(data[i].date),'chart-label',{'text-anchor':i===0?'start':i===51?'end':'middle'}));
  root.setAttribute('aria-label',`Riserva energetica ${state.region==='tessin'?'del Ticino':'della Svizzera'}, dal ${date(data[0].date)} al ${date(data.at(-1).date)}. Valori percentuali.`);
  updateStorage();
 }
 function setWeek(i){state.week=Math.max(0,Math.min(entries().length-1,Number(i)));$('#week-slider').value=state.week;updateStorage();}
 function updateStorage(){
  const r=entries()[state.week];
  $('#water-fill').style.height='100%';$('#water-fill').style.clipPath=`inset(${100-r.pct}% 0 0 0)`;$('#tank-percent').textContent=fmt(r.pct)+'%';$('#stored-gwh').textContent=fmt(r.gwh);$('#selected-date').textContent=date(r.date);
  const d=Math.round((r.pct-r.avg)*10)/10;$('#reference-delta').textContent=(d>0?'+':'')+fmt(d)+' punti %';
  barNodes.forEach((b,i)=>b.classList.toggle('selected',i===state.week));
  $('#region-bars').replaceChildren();
  Object.entries(labels).forEach(([k,label])=>{const v=storage[k].entries[state.week];const e=document.createElement('div');e.className='region-item';e.dataset.region=k;e.innerHTML=`<div class="region-title"><b>${label}</b><span>${fmt(v.pct)}%</span></div><div class="region-track"><span style="width:${v.pct}%"></span></div><span class="region-gwh">${fmt(v.gwh)} GWh</span>`;$('#region-bars').append(e);});
 }
 $('#latest-date').textContent=shortDate(storage.totalCH.current.date)+' 2026';
 $('#week-slider').max=storage.totalCH.entries.length-1;
 $('#week-slider').oninput=e=>{stop();setWeek(e.target.value);};
 $('#latest').onclick=()=>{stop();setWeek(entries().length-1);};
 function stop(){clearInterval(state.timer);state.timer=null;$('#play').setAttribute('aria-pressed','false');$('#play').setAttribute('aria-label','Riproduci le settimane');$('#play svg').innerHTML='<path d="m9 5 10 7-10 7Z"/>';}
 $('#play').onclick=()=>{if(state.timer){stop();return;}if(state.week===entries().length-1)setWeek(0);$('#play').setAttribute('aria-pressed','true');$('#play').setAttribute('aria-label','Metti in pausa');$('#play svg').innerHTML='<path d="M7 5h4v14H7zm7 0h4v14h-4Z"/>';state.timer=setInterval(()=>{if(state.week>=entries().length-1){stop();return;}setWeek(state.week+1);},700);};
 $$('[data-region]').forEach(b=>b.onclick=()=>{state.region=b.dataset.region;$$('[data-region]').forEach(c=>{const a=c.dataset.region===state.region;c.classList.toggle('active',a);c.setAttribute('aria-pressed',String(a));});renderHistory();});
 function setView(view){stop();state.view=view;['origin','storage'].forEach(v=>{$('#'+v).hidden=v!==view;$('#tab-'+v).classList.toggle('active',v===view);$('#tab-'+v).setAttribute('aria-selected',String(v===view));});if(view==='storage')renderHistory();}
 ['origin','storage'].forEach(v=>$('#tab-'+v).onclick=()=>setView(v));
 $('.main-tabs').setAttribute('role','tablist');
 $$('.main-tabs button').forEach((b,i)=>b.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=i===0?'storage':'origin';setView(next);$('#tab-'+next).focus();}});
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.view==='storage')renderHistory();},120);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 selectPlant(state.selected);renderHistory();
})();
