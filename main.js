'use strict';
(() => {
 const {plants,boundary}=window.KIT15;
 const cantons=window.KIT15_CANTONS;
 const ticino=cantons.find(c=>c.abbr==='TI');
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const NS='http://www.w3.org/2000/svg';
 const fmt=n=>new Intl.NumberFormat('it-CH',{maximumFractionDigits:1}).format(n);
 const types={flow:{name:'Acqua fluente',color:'#b9da49',text:'Sfrutta l’acqua che scorre. La produzione dipende dalla portata disponibile nel corso d’acqua.'},storage:{name:'Con serbatoio',color:'#95d9e5',text:'L’acqua viene accumulata e poi fatta scendere verso le turbine. Il bacino permette di scegliere quando produrre.'},pump:{name:'Pompaggio misto',color:'#acb5f8',text:'Può anche riportare acqua verso l’alto consumando elettricità. Il pompaggio conserva energia, con delle perdite.'},loop:{name:'Sola ricircolazione',color:'#ed7770',text:'Sposta acqua tra bacini: consuma energia per pompare e ne restituisce una parte quando turbina. Non crea nuova energia.'}};
 const typeOf=p=>p.type==='Laufkraftwerk'?'flow':p.type==='Speicherkraftwerk'?'storage':p.type==='Pumpspeicherkraftwerk'?'pump':'loop';
 const state={view:'origin',scope:'ch',selected:'601300',types:new Set(Object.keys(types))};
 function svg(tag,attrs={},parent){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.append(e);return e;}
 function text(parent,x,y,value,cls='map-label',attrs={}){const e=svg('text',{x,y,class:cls,...attrs},parent);e.textContent=value;return e;}
 function project([lon,lat]) {return [lon*Math.cos(46.8*Math.PI/180),-lat];}
 let projection,mapCandidates=[],lensNodes=null;
 const lensState={pointer:null,type:null,candidate:null,last:null};
 function setProjection(){
  let pts=state.scope==='ch'?boundary:ticino.polygons.flat(2);
  pts=pts.map(project);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
  const scale=Math.min(700/(xmax-xmin),390/(ymax-ymin));
  projection=ll=>{let p=project(ll);return [395+(p[0]-(xmin+xmax)/2)*scale,235+(p[1]-(ymin+ymax)/2)*scale];};
 }
 function renderMap(){
  hideLens();setProjection();const root=$('#map');root.replaceChildren();
  const scene=svg('g',{id:'map-scene'},root);
  const ringPath=ring=>ring.map((p,i)=>`${i?'L':'M'}${projection(p).join(',')}`).join(' ')+'Z';
  const cantonPath=c=>c.polygons.map(poly=>poly.map(ringPath).join(' ')).join(' ');
  const path=state.scope==='ti'?cantonPath(ticino):ringPath(boundary);
  if(state.scope==='ti')cantons.filter(c=>c.abbr!=='TI').forEach(c=>svg('path',{d:cantonPath(c),class:'canton-context','fill-rule':'evenodd'},scene));
  const shadow=svg('path',{d:path,class:'country-shadow','fill-rule':'evenodd'},scene);
  const scale=root.getScreenCTM()?.a||1;shadow.style.transform=`translate(${-3/scale}px,${4/scale}px)`;
  svg('path',{d:path,class:state.scope==='ti'?'country ticino-country':'country','fill-rule':'evenodd'},scene);
  if(state.scope==='ch')cantons.forEach(c=>svg('path',{d:cantonPath(c),class:'canton-border'},scene));
  else [['TICINO',8.8,46.13],['GRIGIONI',9.18,46.42],['URI',8.58,46.7]].forEach(([name,x,y])=>{const p=projection([x,y]);text(scene,p[0],p[1],name,'map-label',{'text-anchor':'middle'});});
  if(state.scope==='ch'){
   [['Lago Lemano',6.5,46.38],['Lago di Costanza',9.3,47.65],['TICINO',8.75,45.86]].forEach(([n,x,y])=>{const p=projection([x,y]);text(scene,p[0],p[1],n,'map-label',{'text-anchor':'middle'});});
  }
  const shown=plants.filter(p=>{const [x,y]=projection([p.lon,p.lat]);return x>8&&x<782&&y>8&&y<450&&state.types.has(typeOf(p));}).sort((a,b)=>b.energy-a.energy);
  $('#plant-count').textContent=shown.length;mapCandidates=shown.map(p=>({plant:p,point:projection([p.lon,p.lat])}));
  shown.forEach(p=>{
   const [cx,cy]=projection([p.lon,p.lat]);const r=Math.max(2.3,Math.sqrt(p.energy/2103)*18);
   const c=svg('circle',{cx,cy,r,fill:types[typeOf(p)].color,class:'plant-dot'+(p.id===state.selected?' is-selected':''),'data-id':p.id},scene);

  });
  const sel=plants.find(p=>p.id===state.selected);
  if(shown.includes(sel)){
   const [x,y]=projection([sel.lon,sel.lat]);
   svg('circle',{cx:x,cy:y,r:Math.max(2.3,Math.sqrt(sel.energy/2103)*18)+7,class:'selection-ring'},scene);
   const right=x<610; text(scene,x+(right?20:-20),y-20,sel.name,'selected-label',{'text-anchor':right?'start':'end'});
  }
  buildLens(root,scene);
  root.setAttribute('aria-label',`Mappa con ${shown.length} centrali visibili. Selezionata: ${sel.name}. Usa anche l’elenco delle centrali sotto la mappa.`);
 }
 function buildLens(root,scene){
  const defs=svg('defs',{},root),sceneClip=svg('clipPath',{id:'map-scene-clip'},defs);svg('rect',{x:0,y:0,width:790,height:470},sceneClip);scene.setAttribute('clip-path','url(#map-scene-clip)');
  const clip=svg('clipPath',{id:'map-lens-clip',clipPathUnits:'userSpaceOnUse'},defs),clipCircle=svg('circle',{},clip);
  const group=svg('g',{class:'map-lens-svg','aria-hidden':'true',display:'none'},root);
  const shadow=svg('circle',{class:'lens-shadow'},group),back=svg('circle',{class:'lens-back'},group);
  const clipped=svg('g',{'clip-path':'url(#map-lens-clip)'},group),content=svg('g',{class:'lens-content'},clipped);
  const clone=scene.cloneNode(true);clone.removeAttribute('id');clone.removeAttribute('clip-path');clone.querySelectorAll('.selected-label,.selection-ring,.country-shadow').forEach(n=>n.remove());content.append(clone);
  const ring=svg('circle',{class:'lens-ring'},group);
  lensNodes={group,clipCircle,shadow,back,content,ring};
 }
 function hideLens(){
  if(lensNodes)lensNodes.group.setAttribute('display','none');
  $$('#map .is-preview').forEach(n=>n.classList.remove('is-preview'));
  $('#map').classList.remove('has-lens');$('#map-hover-name').hidden=true;lensState.candidate=null;
 }
 function updateLens(event){
  const root=$('#map'),matrix=root.getScreenCTM();if(!matrix||!lensNodes)return;
  const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()),scale=matrix.a;
  const touch=event.pointerType!=='mouse',activeTouch=touch&&event.pointerId===lensState.pointer;
  if(activeTouch){
   // La cattura del dito continua fuori dalla mappa: il fuoco si ferma
   // al bordo dell’area con le centrali, invece di chiudere la lente.
   point.x=Math.max(8,Math.min(782,point.x));
   const lowerEdge=mapCandidates.length?Math.min(450,Math.max(...mapCandidates.map(c=>c.point[1]))):450;
   point.y=Math.max(8,Math.min(lowerEdge,point.y));
  }else if(point.x<0||point.x>790||point.y<0||point.y>470){hideLens();return;}
  const radiusPixels=(touch?66:76)*2/3,radius=radiusPixels/scale,zoom=3;
  let cx=Math.max(radius+9,Math.min(790-radius-9,point.x)),cy=point.y;
  if(touch){
   cy=point.y-(radiusPixels+38)/scale;
   const minY=(8-matrix.f)/scale+radius+40/scale;
   if(cy<minY)cy=point.y+(radiusPixels+38)/scale;
  }else cy=Math.max(radius+8,Math.min(470-radius-8,cy));
  let nearest=null,distance=Infinity;
  mapCandidates.forEach(c=>{const d=Math.hypot(c.point[0]-point.x,c.point[1]-point.y);if(d<distance){distance=d;nearest=c;}});
  const candidate=distance<=radius/zoom?nearest?.plant:null;
  if(candidate?.id!==lensState.candidate?.id){
   $$('#map .is-preview').forEach(n=>n.classList.remove('is-preview'));
   if(candidate)root.querySelectorAll(`[data-id="${candidate.id}"]`).forEach(n=>n.classList.add('is-preview'));
  }
  lensState.candidate=candidate;
  const {group,clipCircle,shadow,back,content,ring}=lensNodes;
  [clipCircle,back,ring].forEach(n=>{n.setAttribute('cx',cx);n.setAttribute('cy',cy);n.setAttribute('r',radius);});
  shadow.setAttribute('cx',cx-3/scale);shadow.setAttribute('cy',cy+4/scale);shadow.setAttribute('r',radius);
  content.setAttribute('transform',`translate(${cx} ${cy}) scale(${zoom}) translate(${-point.x} ${-point.y})`);
  group.removeAttribute('display');root.classList.add('has-lens');
  const label=$('#map-hover-name'),stage=$('.map-stage').getBoundingClientRect();
  label.textContent=candidate?candidate.name:'Avvicinati a un punto';label.hidden=false;
  const screenPoint=new DOMPoint(cx,cy).matrixTransform(matrix);
  const labelWidth=label.offsetWidth,labelHeight=label.offsetHeight;
  label.style.left=Math.max(4,Math.min(stage.width-labelWidth-4,screenPoint.x-stage.left-labelWidth/2))+'px';
  let labelTop=screenPoint.y-stage.top-radius*scale-labelHeight-9;
  if((!touch&&labelTop<0)||(touch&&cy>point.y))labelTop=screenPoint.y-stage.top+radius*scale+9;
  label.style.top=labelTop+'px';
 }
 const map=$('#map');
 map.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0)return;
  lensState.pointer=event.pointerId;lensState.type=event.pointerType;lensState.last=event;
  if(event.pointerType!=='mouse'){event.preventDefault();map.setPointerCapture(event.pointerId);}
  updateLens(event);
 });
 map.addEventListener('pointermove',event=>{
  if(event.pointerType==='mouse'&&event.buttons===0){updateLens(event);return;}
  if(event.pointerId===lensState.pointer){if(event.pointerType!=='mouse')event.preventDefault();lensState.last=event;updateLens(event);}
 });
 map.addEventListener('pointerup',event=>{
  if(event.pointerId!==lensState.pointer)return;
  updateLens(event);const chosen=lensState.candidate;
  lensState.pointer=null;lensState.type=null;lensState.last=null;hideLens();
  if(map.hasPointerCapture(event.pointerId))map.releasePointerCapture(event.pointerId);
  if(chosen)selectPlant(chosen.id);
 });
 function cancelLens(){lensState.pointer=null;lensState.type=null;lensState.last=null;hideLens();}
 map.addEventListener('pointercancel',cancelLens);
 map.addEventListener('lostpointercapture',()=>{if(lensState.pointer!==null)cancelLens();});
 map.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'||lensState.pointer===null)hideLens();});
 window.addEventListener('blur',cancelLens);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')cancelLens();});
 const touchInstructions=matchMedia('(pointer: coarse)');
 function mapInstructions(){ $('#map-help').textContent=touchInstructions.matches?'Tieni il dito sulla mappa e spostalo. Solleva per scegliere.':'Muovi il puntatore per ingrandire. Fai clic per scegliere.'; }
 mapInstructions();touchInstructions.addEventListener('change',mapInstructions);
 let mapResizeTimer;window.addEventListener('resize',()=>{cancelLens();clearTimeout(mapResizeTimer);mapResizeTimer=setTimeout(()=>{if(state.view==='origin')renderMap();},150);});
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
  renderMechanism(p);renderMap();updatePlantReference();
 }
 const picks=[['601300','Biasca'],['602600','Bavona'],['602500','Robiei'],['600100','Lucendro'],['504950','Bieudron'],['109400','Rheinfelden']];
 picks.forEach(([id,name])=>{const b=document.createElement('button');b.textContent=name;b.dataset.id=id;b.type='button';b.onclick=()=>{const p=plants.find(p=>p.id===id);if(state.scope==='ti'&&(p.lon<8.35||p.lon>9.35||p.lat<45.8||p.lat>46.65))setScope('ch');state.types.add(typeOf(p));syncTypeButtons();selectPlant(id);};$('#plant-picks').append(b);});
 [...plants].sort((a,b)=>a.name.localeCompare(b.name,'it')).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;$('#plant-select').append(o);});
 $('#plant-select').onchange=e=>{setScope('ch');state.types.add(typeOf(plants.find(p=>p.id===e.target.value)));syncTypeButtons();selectPlant(e.target.value);};
 function setScope(scope){state.scope=scope;$$('[data-scope]').forEach(b=>{const a=b.dataset.scope===scope;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a));});renderMap();}
 $$('[data-scope]').forEach(b=>b.onclick=()=>{setScope(b.dataset.scope);if(state.scope==='ti')selectPlant('601300');});
 function syncTypeButtons(){$$('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(state.types.has(b.dataset.type))));}
 $$('[data-type]').forEach(b=>b.onclick=()=>{const t=b.dataset.type;if(state.types.has(t)){if(state.types.size===1)return;state.types.delete(t);}else state.types.add(t);syncTypeButtons();renderMap();});
 const lab={head:100,flow:4,hours:2,reference:null,paused:false};
 const RHO=1000,GRAVITY=9.81,EFFICIENCY=.85;
 function labValues(){const power=RHO*GRAVITY*lab.flow*lab.head*EFFICIENCY/1000;return {power,energy:power*lab.hours,volume:lab.flow*lab.hours*3600};}
 const number=n=>new Intl.NumberFormat('it-CH',{maximumFractionDigits:2}).format(n);
 function scaled(n,energy=false){const units=energy?['kWh','MWh','GWh']:['kW','MW','GW'];let i=n>=1e6?2:n>=1000?1:0;return {value:number(n/1000**i),unit:units[i]};}
 function updatePlantReference(){const p=plants.find(p=>p.id===state.selected);$('#use-plant-head').replaceChildren(document.createTextNode(`Usa il salto di ${p.name} `));const b=document.createElement('b');b.textContent=fmt(p.head)+' m';$('#use-plant-head').append(b);$('#use-plant-head').disabled=!(p.head>0);}
 function usePlantHead(){const p=plants.find(p=>p.id===state.selected);lab.head=p.head;lab.reference=p.id;$('#head-slider').max=Math.max(2000,Math.ceil(p.head/100)*100);$('#head-slider').value=p.head;renderLab('reference');}
 function renderLab(changed){
  const {power,energy,volume}=labValues(),p=scaled(power),e=scaled(energy,true);
  $('#lab-power').textContent=p.value;$('#lab-power-unit').textContent=p.unit;$('#lab-energy').textContent=e.value;$('#lab-energy-unit').textContent=e.unit;
  $('#lab-energy-caption').textContent=`Quanta ne produci in ${lab.hours} ${lab.hours===1?'ora':'ore'}.`;
  $('#head-output').textContent=fmt(lab.head)+' m';$('#flow-output').textContent=fmt(lab.flow)+' m³/s';$('#duration-output').textContent=lab.hours+(lab.hours===1?' ora':' ore');
  $('#head-slider').setAttribute('aria-valuetext',fmt(lab.head)+' metri');$('#flow-slider').setAttribute('aria-valuetext',fmt(lab.flow)+' metri cubi al secondo');$('#duration-slider').setAttribute('aria-valuetext',lab.hours+(lab.hours===1?' ora':' ore'));
  const y=277-217*Math.pow(Math.min(lab.head/2000,1),.22),pipe=`M270 ${y} H310 V277 H365`;
  $('#lab-upper-water').setAttribute('d',`M140 ${y-17} H270 V${y+12} H140Z`);
  $('#lab-intake').setAttribute('d',`M138 ${y-35} V${y+15} H272 V${y-35}`);
  ['lab-pipe-outline','lab-pipe-base','lab-flow','lab-flow-marks'].forEach(id=>$('#'+id).setAttribute('d',pipe));
  $('#lab-head-line').setAttribute('y1',y);$('#lab-upper-guide').setAttribute('y1',y);$('#lab-upper-guide').setAttribute('y2',y);
  $('#lab-head-label').setAttribute('x',53);$('#lab-head-label').setAttribute('y',(277+y)/2);$('#lab-head-label').setAttribute('text-anchor','middle');$('#lab-head-label').setAttribute('transform',`rotate(-90 53 ${(277+y)/2})`);$('#lab-head-label').textContent=fmt(lab.head)+' m';$('#lab-water-label').setAttribute('y',y-48);$('#lab-flow-label').textContent=fmt(lab.flow)+' m³/s';
  $('#lab-flow').setAttribute('stroke-width',lab.flow?3+12*Math.sqrt(lab.flow/50):0);
  $('#lab-flow-marks').style.opacity=lab.flow>0?1:0;
  $('#lab-diagram').style.setProperty('--rotor-time',(5/(1+Math.log10(1+power)))+'s');$('#lab-diagram').style.setProperty('--flow-time',(3/(1+Math.sqrt(lab.flow)))+'s');
  $('#lab-diagram').classList.toggle('is-stopped',lab.paused);$('#lab-diagram').classList.toggle('no-power',power===0);$('#lab-diagram').classList.toggle('no-flow',lab.flow===0);$('#lab-diagram').setAttribute('aria-label',`Modello con salto ${fmt(lab.head)} metri, portata ${fmt(lab.flow)} metri cubi al secondo. Potenza ${p.value} ${p.unit}, energia ${e.value} ${e.unit} in ${lab.hours} ore.`);
  $('#lab-scenario').textContent=lab.reference?`Salto WASTA di ${plants.find(p=>p.id===lab.reference).name}. Portata, tempo e rendimento sono ipotesi.`:'Scenario libero: valori scelti per sperimentare.';
  $('#lab-water-volume').textContent=`In questo scenario attraversano le turbine ${number(volume)} m³ d’acqua. Il flusso è ipotizzato costante per tutto il tempo selezionato.`;
  $('#double-duration').disabled=lab.hours>12;
  const messages={head:'Hai cambiato il salto: cambiano sia la potenza sia l’energia prodotta nello stesso tempo.',flow:lab.flow===0?'Senza flusso d’acqua, la potenza e l’energia prodotta sono zero.':'Hai cambiato la portata: più acqua ogni secondo significa più potenza, a parità di salto.',hours:'Hai cambiato il tempo: la potenza resta uguale, l’energia prodotta cambia.',double:'Il doppio del tempo, il doppio dell’energia. La potenza è rimasta identica.',reference:'Hai ripreso un salto reale dalla mappa. Portata e tempo restano quelli del tuo esperimento.',reset:'La potenza dipende da salto e portata. L’energia dipende anche dal tempo.'};
  if(changed)$('#lab-observation').textContent=lab.head===0?'Senza dislivello, in questo modello non produci energia.':messages[changed];
 }
 [['head-slider','head'],['flow-slider','flow'],['duration-slider','hours']].forEach(([id,key])=>$('#'+id).oninput=e=>{lab[key]=Number(e.target.value);if(key==='head')lab.reference=null;renderLab(key);});
 $('#use-plant-head').onclick=usePlantHead;
 $('#open-lab').onclick=()=>{setView('lab');usePlantHead();$('#tab-lab').focus();};
 $('#double-duration').onclick=()=>{if(lab.hours>12)return;lab.hours*=2;$('#duration-slider').value=lab.hours;renderLab('double');};
 $('#reset-lab').onclick=()=>{lab.head=100;lab.flow=4;lab.hours=2;lab.reference=null;$('#head-slider').value=100;$('#flow-slider').value=4;$('#duration-slider').value=2;renderLab('reset');};
 $('#lab-motion').onclick=()=>{lab.paused=!lab.paused;$('#lab-motion').setAttribute('aria-pressed',String(lab.paused));$('#lab-motion').textContent=lab.paused?'Riprendi animazione':'Ferma animazione';renderLab();};
 function setView(view){state.view=view;if(location.hash!=='#'+view)history.replaceState(null,'','#'+view);['origin','lab'].forEach(v=>{$('#'+v).hidden=v!==view;$('#tab-'+v).classList.toggle('active',v===view);$('#tab-'+v).setAttribute('aria-selected',String(v===view));});}
 ['origin','lab'].forEach(v=>$('#tab-'+v).onclick=()=>setView(v));
 $('.main-tabs').setAttribute('role','tablist');
 $$('.main-tabs button').forEach((b,i)=>b.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=i===0?'lab':'origin';setView(next);$('#tab-'+next).focus();}});
 selectPlant(state.selected);renderLab('reset');if(location.hash==='#lab')setView('lab');
})();
