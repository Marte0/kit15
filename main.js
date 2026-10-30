'use strict';
(() => {
 const {plants,boundary}=window.KIT15;
 const cantons=window.KIT15_CANTONS;
 const ticino=cantons.find(c=>c.abbr==='TI');
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const NS='http://www.w3.org/2000/svg';
 const fmt=n=>new Intl.NumberFormat('it-CH',{maximumFractionDigits:1}).format(n);
 const types={flow:{name:'Acqua fluente',color:'#b9da49',text:'Sfrutta l’acqua che scorre. La produzione dipende dalla portata disponibile nel corso d’acqua.'},storage:{name:'Con serbatoio',color:'#95d9e5',text:'L’acqua viene accumulata e poi fatta scendere verso le turbine. Il bacino permette di scegliere quando produrre.'},pump:{name:'Pompaggio misto',color:'#acb5f8',text:'Può anche riportare acqua verso l’alto consumando elettricità. Il pompaggio conserva energia, con delle perdite.'},loop:{name:'Sola ricircolazione',color:'#ffd12e',text:'Sposta acqua tra bacini: consuma energia per pompare e ne restituisce una parte quando turbina. Non crea nuova energia.'}};
 const typeOf=p=>p.type==='Laufkraftwerk'?'flow':p.type==='Speicherkraftwerk'?'storage':p.type==='Pumpspeicherkraftwerk'?'pump':'loop';
 const mobileMap=window.matchMedia('(max-width:760px)');
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
  // Fit the actual Swiss outline on mobile instead of the padded desktop canvas.
  const width=(xmax-xmin)*scale,height=(ymax-ymin)*scale,padding=12;
  $('#map').setAttribute('viewBox',mobileMap.matches&&state.scope==='ch'
   ? `${395-width/2-padding} ${235-height/2-padding} ${width+padding*2} ${height+padding*2}`
   : '0 0 790 470');
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
 function mapInstructions(){ $('#map-help').textContent=touchInstructions.matches?'Tieni premuto, sposta il dito e rilascia per scegliere.':'Sposta il puntatore e fai clic per scegliere.'; }
 mapInstructions();touchInstructions.addEventListener('change',mapInstructions);
 let mapResizeTimer;window.addEventListener('resize',()=>{cancelLens();clearTimeout(mapResizeTimer);mapResizeTimer=setTimeout(()=>{if(state.view==='origin')renderMap();},150);});
 function selectPlant(id){
  state.selected=id;const p=plants.find(p=>p.id===id),t=types[typeOf(p)];
  $('#plant-name').textContent=p.name;$('#plant-energy').textContent=fmt(p.energy);$('#plant-head').textContent=fmt(p.head);
  $('#plant-type').textContent=t.name;
  syncPicker(p);
  renderMap();updatePlantReference();
 }
 const picker=$('#plant-picker'),pickerInput=$('#plant-select'),pickerMenu=$('#picker-menu'),pickerOptions=$('#plant-options');
 const pickerState={open:false,matches:[],active:-1};
 const sortedPlants=[...plants].sort((a,b)=>a.name.localeCompare(b.name,'it'));
 const normalizeName=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').trim();
 function updatePickerMode(){
  if(pickerState.open)closePicker();
  pickerInput.readOnly=mobileMap.matches;
  pickerInput.inputMode=mobileMap.matches?'none':'search';
  pickerInput.setAttribute('aria-autocomplete',mobileMap.matches?'none':'list');
  pickerInput.placeholder=mobileMap.matches?'Scegli una centrale…':'Cerca per nome…';
 }

 function syncPicker(p){pickerInput.value=p.name;closePicker(false);}
 function positionPicker(){
  if(!pickerState.open)return;
  const rect=$('.picker-field').getBoundingClientRect(),viewport=window.visualViewport;
  const top=viewport?.offsetTop||0,bottom=top+(viewport?.height||innerHeight),below=bottom-rect.bottom-12,above=picker.getBoundingClientRect().top-top-12;
  const upwards=below<180&&above>below;
  picker.classList.toggle('opens-up',upwards);pickerMenu.style.maxHeight=Math.max(120,Math.min(280,upwards?above:below))+'px';
 }
 function renderPicker(query='',keepSelection=false){
  const q=pickerInput.readOnly?'':normalizeName(query);
  pickerState.matches=sortedPlants.filter(p=>!q||normalizeName(p.name).includes(q));
  if(q)pickerState.matches.sort((a,b)=>Number(normalizeName(b.name).startsWith(q))-Number(normalizeName(a.name).startsWith(q)));
  pickerOptions.replaceChildren();
  const fragment=document.createDocumentFragment();
  pickerState.matches.forEach((p,i)=>{
   const option=document.createElement('div');option.id='plant-option-'+p.id;option.className='picker-option';option.setAttribute('role','option');option.dataset.index=i;option.setAttribute('aria-selected',String(p.id===state.selected));
   const dot=document.createElement('i');dot.className='swatch '+typeOf(p);dot.setAttribute('aria-hidden','true');
   const name=document.createElement('span');name.className='picker-option-name';name.textContent=p.name;
   const type=document.createElement('span');type.className='picker-option-type';type.textContent=types[typeOf(p)].name;
   option.append(dot,name,type);fragment.append(option);
  });
  pickerOptions.append(fragment);pickerMenu.scrollTop=0;$('#picker-empty').hidden=pickerState.matches.length!==0;
  $('#picker-status').textContent=pickerState.matches.length?`${pickerState.matches.length} ${pickerState.matches.length===1?'centrale disponibile':'centrali disponibili'}`:'Nessuna centrale trovata';
  const current=pickerState.matches.findIndex(p=>p.id===state.selected);
  setPickerActive(keepSelection&&!q?Math.max(0,current):0,false);
 }
 function setPickerActive(index,scroll=true){
  const previous=pickerOptions.querySelector('.is-active');if(previous)previous.classList.remove('is-active');
  pickerState.active=pickerState.matches.length?Math.max(0,Math.min(pickerState.matches.length-1,index)):-1;
  const p=pickerState.matches[pickerState.active],option=p?document.getElementById('plant-option-'+p.id):null;
  if(option){option.classList.add('is-active');pickerInput.setAttribute('aria-activedescendant',option.id);if(scroll)option.scrollIntoView({block:'nearest'});}
  else pickerInput.removeAttribute('aria-activedescendant');
 }
 function openPicker(query=''){
  pickerState.open=true;pickerMenu.hidden=false;picker.classList.add('is-open');pickerInput.setAttribute('aria-expanded','true');$('#picker-toggle').setAttribute('aria-expanded','true');$('#picker-toggle').setAttribute('aria-label','Chiudi le centrali');
  renderPicker(query,true);positionPicker();
  const current=pickerOptions.querySelector('.is-active');if(current)current.scrollIntoView({block:'nearest'});
 }
 function closePicker(restore=true){
  pickerState.open=false;pickerMenu.hidden=true;picker.classList.remove('is-open');pickerInput.setAttribute('aria-expanded','false');pickerInput.removeAttribute('aria-activedescendant');$('#picker-toggle').setAttribute('aria-expanded','false');$('#picker-toggle').setAttribute('aria-label','Mostra le centrali');
  if(restore)pickerInput.value=plants.find(p=>p.id===state.selected).name;
 }
 function choosePickerPlant(index){
  const p=pickerState.matches[index];if(!p)return;
  const [x,y]=projection([p.lon,p.lat]);if(state.scope==='ti'&&(x<8||x>782||y<8||y>450))setScope('ch');
  state.types.add(typeOf(p));syncTypeButtons();selectPlant(p.id);$('#picker-status').textContent=`Selezionata ${p.name}`;
 }
 pickerInput.addEventListener('focus',()=>{if(!pickerState.open){openPicker();if(!pickerInput.readOnly)pickerInput.select();}});
 pickerInput.addEventListener('click',()=>{if(!pickerState.open){openPicker();if(!pickerInput.readOnly)pickerInput.select();}});
 pickerInput.addEventListener('input',()=>{if(pickerInput.readOnly){pickerInput.value=plants.find(p=>p.id===state.selected).name;return;}if(!pickerState.open)openPicker(pickerInput.value);else{renderPicker(pickerInput.value);positionPicker();}});
 pickerInput.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();if(!pickerState.open){openPicker();return;}setPickerActive(pickerState.active+(event.key==='ArrowDown'?1:-1));
  }else if(pickerInput.readOnly&&!pickerState.open&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openPicker();}
  else if(event.key==='Enter'&&pickerState.open){event.preventDefault();choosePickerPlant(pickerState.active);}
  else if(event.key==='Escape'){event.preventDefault();closePicker();}
  else if(event.key==='Tab')closePicker();
 });
 $('#picker-toggle').addEventListener('click',()=>{if(pickerState.open)closePicker();else{openPicker();pickerInput.focus({preventScroll:true});if(!pickerInput.readOnly)pickerInput.select();}});
 pickerOptions.addEventListener('mousedown',event=>{if(event.target.closest('.picker-option'))event.preventDefault();});
 pickerOptions.addEventListener('click',event=>{const option=event.target.closest('.picker-option');if(!option)return;choosePickerPlant(Number(option.dataset.index));if(event.pointerType==='touch')pickerInput.blur();});
 document.addEventListener('pointerdown',event=>{if(pickerState.open&&!picker.contains(event.target))closePicker();});
 picker.addEventListener('focusout',event=>{if(event.relatedTarget&&!picker.contains(event.relatedTarget))closePicker();});
 window.addEventListener('resize',positionPicker);window.visualViewport?.addEventListener('resize',positionPicker);
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
  $('#lab-energy-caption').textContent=`in ${lab.hours} ${lab.hours===1?'ora':'ore'}`;
  $('#head-output').textContent=fmt(lab.head)+' m';$('#flow-output').textContent=fmt(lab.flow)+' m³/s';$('#duration-output').textContent=lab.hours+(lab.hours===1?' ora':' ore');
  $('#head-slider').setAttribute('aria-valuetext',fmt(lab.head)+' metri');$('#flow-slider').setAttribute('aria-valuetext',fmt(lab.flow)+' metri cubi al secondo');$('#duration-slider').setAttribute('aria-valuetext',lab.hours+(lab.hours===1?' ora':' ore'));
  const y=277-217*Math.pow(Math.min(lab.head/2000,1),.22),bend=Math.min(14,(277-y)/2),pipe=`M270 ${y} H${310-bend} Q310 ${y} 310 ${y+bend} V${277-bend} Q310 277 ${310+bend} 277 H361`;
  $('#lab-upper-water').setAttribute('d',`M126 ${y-23} H270 V${y+12} Q270 ${y+16} 266 ${y+16} H130 Q126 ${y+16} 126 ${y+12}Z`);
  $('#lab-intake').setAttribute('d',`M124 ${y-44} V${y+12} Q124 ${y+18} 130 ${y+18} H266 Q272 ${y+18} 272 ${y+12} V${y-44}`);
  ['lab-pipe-outline','lab-pipe-base','lab-flow','lab-flow-marks'].forEach(id=>$('#'+id).setAttribute('d',pipe));
  $('#lab-head-line').setAttribute('y1',y);$('#lab-upper-guide').setAttribute('y1',y);$('#lab-upper-guide').setAttribute('y2',y);
  $('#lab-head-label').setAttribute('x',53);$('#lab-head-label').setAttribute('y',(277+y)/2);$('#lab-head-label').setAttribute('text-anchor','middle');$('#lab-head-label').setAttribute('transform',`rotate(-90 53 ${(277+y)/2})`);$('#lab-head-label').textContent=fmt(lab.head)+' m';$('#lab-water-label').setAttribute('y',y-58);$('#lab-flow-label').textContent=fmt(lab.flow)+' m³/s';
  $('#lab-flow').setAttribute('stroke-width',lab.flow?3+12*Math.sqrt(lab.flow/50):0);
  $('#lab-flow-marks').style.opacity=lab.flow>0?1:0;
  // Symbolic motion: speed follows head, thickness follows flow, rotor follows power.
  const particleStep=32;
  $('#lab-flow-marks').setAttribute('stroke-dasharray',`2 ${particleStep-2}`);
  $('#lab-diagram').style.setProperty('--stream-step',-particleStep+'px');
  $('#lab-diagram').style.setProperty('--rotor-time',(.65+7.35/(1+Math.sqrt(power/3000)))+'s');
  $('#lab-diagram').style.setProperty('--flow-time',(particleStep/(8+4*Math.sqrt(lab.head)))+'s');
  $('#lab-diagram').classList.toggle('is-stopped',lab.paused);$('#lab-diagram').classList.toggle('no-power',power===0);$('#lab-diagram').classList.toggle('no-flow',lab.flow===0);$('#lab-diagram').setAttribute('aria-label',`Modello con salto ${fmt(lab.head)} metri, portata ${fmt(lab.flow)} metri cubi al secondo. Potenza ${p.value} ${p.unit}, energia ${e.value} ${e.unit} in ${lab.hours} ore.`);
  $('#lab-water-volume').textContent=`In questo scenario attraversano le turbine ${number(volume)} m³ d’acqua. Il flusso è ipotizzato costante per tutto il tempo selezionato.`;
  const messages={head:'Hai cambiato il salto: cambiano sia la potenza sia l’energia prodotta nello stesso tempo.',flow:lab.flow===0?'Senza flusso d’acqua, la potenza e l’energia prodotta sono zero.':'Hai cambiato la portata: più acqua ogni secondo significa più potenza, a parità di salto.',hours:'Hai cambiato il tempo: la potenza resta uguale, l’energia prodotta cambia.',reference:'Hai ripreso un salto reale dalla mappa. Portata e tempo restano quelli del tuo esperimento.',reset:'La potenza dipende da salto e portata. L’energia dipende anche dal tempo.'};
  if(changed)$('#lab-observation').textContent=lab.head===0?'Senza dislivello, in questo modello non produci energia.':messages[changed];
 }
 [['head-slider','head'],['flow-slider','flow'],['duration-slider','hours']].forEach(([id,key])=>$('#'+id).oninput=e=>{lab[key]=Number(e.target.value);if(key==='head')lab.reference=null;renderLab(key);});
 $('#use-plant-head').onclick=usePlantHead;
 $('#open-lab').onclick=()=>{setView('lab');usePlantHead();$('#tab-lab').focus();};
 $('#lab-motion').onclick=()=>{lab.paused=!lab.paused;$('#lab-motion').setAttribute('aria-pressed',String(lab.paused));$('#lab-motion').textContent=lab.paused?'Riprendi':'Pausa';$('#lab-motion').setAttribute('aria-label',lab.paused?'Riprendi l’animazione':'Metti in pausa l’animazione');renderLab();};
 function setView(view){state.view=view;if(location.hash!=='#'+view)history.replaceState(null,'','#'+view);['origin','lab'].forEach(v=>{$('#'+v).hidden=v!==view;$('#tab-'+v).classList.toggle('active',v===view);$('#tab-'+v).setAttribute('aria-selected',String(v===view));});}
 ['origin','lab'].forEach(v=>$('#tab-'+v).onclick=()=>setView(v));
 $('.main-tabs').setAttribute('role','tablist');
 $$('.main-tabs button').forEach((b,i)=>b.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=i===0?'lab':'origin';setView(next);$('#tab-'+next).focus();}});
 mobileMap.addEventListener('change',()=>{updatePickerMode();renderMap();});
 updatePickerMode();
 selectPlant(state.selected);renderLab('reset');if(location.hash==='#lab')setView('lab');
})();
