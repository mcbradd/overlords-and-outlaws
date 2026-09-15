import {card, CARDS, HOUSES, house, EVENTS, type HouseId} from './content';
export type Mode='tutorial'|'campaign'|'skirmish'|'daily';
export type Difficulty='story'|'standard'|'ruthless';
export interface Player {id:number;name:string;house:HouseId;hand:string[];court:string[];marriages:{queen:string;house:HouseId}[];ward:number;claim:boolean;relics:string[];}
export interface Game {version:1;seed:number;rng:number;mode:Mode;difficulty:Difficulty;phase:'draft'|'declare'|'play'|'over';draftStep:number;round:number;turn:number;players:Player[];deck:string[];discard:string[];market:string[];paintings:number[];history:number[];log:{round:number;text:string;kind:string}[];goal:number;modifier:string;winner:number|null;reason:string;tutorialStep:number;veiled:number;actions:number;lastAction:string;}
export interface Action {type:'build'|'barter'|'seize'|'marry'|'betray'|'scheme';cards:string[];target?:number;targetCard?:string;market?:string;queen?:string;label:string;detail:string;}
export function random(g:{rng:number}){g.rng=(Math.imul(1664525,g.rng)+1013904223)>>>0;return g.rng/4294967296;}
function shuffle<T>(g:{rng:number},a:T[]){for(let i=a.length-1;i>0;i--){const j=Math.floor(random(g)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function log(g:Game,text:string,kind='info'){g.log.push({round:g.round,text,kind});if(g.log.length>100)g.log.shift();}
export function targetGoal(g:Game,p:Player){return g.goal-(p.relics.includes('charter')?1:0);}
export function isActive(p:Player,id:string){return card(id).house===p.house||p.marriages.some(m=>m.house===card(id).house&&p.court.includes(m.queen));}
export function authority(g:Game,p:Player){return p.court.reduce((n,id)=>n+(isActive(p,id)?(card(id).role==='Founder'?2+(p.house==='bourbon'?1:0)+(g.modifier==='founders'?1:0):1):0),0)+p.marriages.length*((p.house==='habsburg'?1:0)+(g.modifier==='marriage'?1:0)+(p.relics.includes('oath')?1:0));}
function protect(p:Player,n=1){p.ward=Math.min(p.relics.includes('aegis')?3:2,p.ward+n);}
function draw(g:Game):string|undefined{if(!g.deck.length){g.deck=shuffle(g,g.discard.splice(0));}return g.deck.pop();}
function refill(g:Game,p:Player){while(p.hand.length<5){const id=draw(g);if(!id)break;p.hand.push(id);}while(p.hand.length>5)g.discard.push(p.hand.pop()!);}
function fillMarket(g:Game){while(g.market.length<4){const id=draw(g);if(!id)break;g.market.push(id);}}
export function createGame(opts:{seed:number;house:HouseId;mode?:Mode;difficulty?:Difficulty;goal?:number;modifier?:string;rivals?:HouseId[];relics?:string[]}):Game{
 const rivalHouses=(opts.rivals??['plantagenet','valois']).filter(h=>h!==opts.house);for(const h of HOUSES){if(rivalHouses.length>=2)break;if(h.id!==opts.house&&!rivalHouses.includes(h.id))rivalHouses.push(h.id);}
 const ids=[opts.house,...rivalHouses.slice(0,2)];
 const g:Game={version:1,seed:opts.seed,rng:opts.seed>>>0,mode:opts.mode??'skirmish',difficulty:opts.difficulty??'standard',phase:'draft',draftStep:0,round:1,turn:0,players:ids.map((h,i)=>({id:i,name:i===0?'You':house(h).leader,house:h,hand:[],court:[],marriages:[],ward:0,claim:false,relics:i===0?(opts.relics??[]):[]})),deck:[],discard:[],market:[],paintings:[0,0,0],history:[],log:[],goal:opts.goal??9,modifier:opts.modifier??'standard',winner:null,reason:'',tutorialStep:0,veiled:0,actions:0,lastAction:''};
 const pool=CARDS.filter(c=>ids.includes(c.house)).map(c=>c.id);
 // Seed five native cards before mixed inheritance; the passing itself is simultaneous.
 for(const p of g.players){const own=pool.filter(id=>card(id).house===p.house);const founder=own.find(id=>card(id).role==='Founder')!;const queen=own.find(id=>card(id).role==='Queen')!;p.hand=[founder,queen,...shuffle(g,own.filter(id=>id!==founder&&id!==queen)).slice(0,3)];for(const id of p.hand)pool.splice(pool.indexOf(id),1);}
 shuffle(g,pool);for(const p of g.players)while(p.hand.length<8)p.hand.push(pool.pop()!);g.deck=pool;
 if(g.modifier==='witness'||g.modifier==='finale')g.paintings=[1,1,1];
 log(g,'The inheritance is dealt. Choose what to keep—and what your rivals will inherit.');return g;
}
export function draft(g:Game,selected:string[]){
 if(g.phase!=='draft'||selected.length!==3-g.draftStep||new Set(selected).size!==selected.length||selected.some(id=>!g.players[0].hand.includes(id)))throw Error('Choose the required number of cards from your inheritance.');
 const count=selected.length;const passes=g.players.map((p,i)=>i===0?selected:[...p.hand].sort((a,b)=>draftValue(p,a)-draftValue(p,b)).slice(0,count));
 for(const p of g.players)p.hand=p.hand.filter(id=>!passes[p.id].includes(id));for(const p of g.players)p.hand.push(...passes[(p.id+2)%3]);
 g.draftStep++;log(g,`Inheritance: ${count} ${count===1?'card passes':'cards pass'} clockwise.`,'draft');
 if(g.draftStep===3){g.phase='declare';for(const p of g.players){if(p.hand.filter(id=>card(id).house===p.house).length<3){const needed=3-p.hand.filter(id=>card(id).house===p.house).length;for(let n=0;n<needed;n++){let source=g.deck;let idx=source.findIndex(id=>card(id).house===p.house);if(idx<0){const other=g.players.find(q=>q.id!==p.id&&q.hand.some(id=>card(id).house===p.house));if(other){source=other.hand;idx=source.findIndex(id=>card(id).house===p.house);}}if(idx>=0){const foreign=p.hand.findIndex(id=>card(id).house!==p.house);[p.hand[foreign],source[idx]]=[source[idx],p.hand[foreign]];}}}}}
}
function draftValue(p:Player,id:string){const c=card(id);return (c.house===p.house?10:0)+(c.role==='Founder'?5:c.role==='Queen'?3:c.role==='Intriguer'?1:0);}
export function declare(g:Game,selected:string[]){
 const p=g.players[0];if(g.phase!=='declare'||selected.length!==3||new Set(selected).size!==3||selected.some(id=>!p.hand.includes(id)||card(id).house!==p.house))throw Error('Declare three Royals of your chosen dynasty.');
 for(const x of g.players){const chosen=x.id===0?selected:[...x.hand].filter(id=>card(id).house===x.house).sort((a,b)=>draftValue(x,b)-draftValue(x,a)).slice(0,3);if(chosen.length<3)throw Error('No valid declaration.');x.court=chosen;x.hand=x.hand.filter(id=>!chosen.includes(id));if(chosen.some(id=>card(id).role==='Founder'))protect(x,x.house==='alba'?2:1);if(x.relics.includes('signet'))protect(x);if(g.modifier==='winter')x.ward=0;refill(g,x);}
 fillMarket(g);g.phase='play';log(g,'Three dynasties declare. History enters the chamber.','declare');
}
function removeCourt(g:Game,p:Player,id:string,toDiscard=true){p.court=p.court.filter(x=>x!==id);p.marriages=p.marriages.filter(m=>m.queen!==id);if(toDiscard)g.discard.push(id);if(p.court.filter(x=>card(x).house===p.house).length<2&&p.marriages.length){p.marriages=[];log(g,`${p.name==='You'?'Your':p.name+'’s'} succession collapses. All marriages break.`,'collapse');}}
export function legalActions(g:Game,index=g.turn):Action[]{
 if(g.phase!=='play'||index!==g.turn)return [];const p=g.players[index];const a:Action[]=[];
 for(const id of p.hand){const c=card(id);if(isActive(p,id))a.push({type:'build',cards:[id],label:`Build ${c.name}`,detail:`Expose this Royal for ${c.role==='Founder'?2:1} authority.${['Founder','Warlord','Lawgiver'].includes(c.role)?' Gain protection.':''}`});
 for(const m of g.market)if(m!==id)a.push({type:'barter',cards:[id],market:m,label:`Trade for ${card(m).name}`,detail:`Exchange ${c.name} with the public court. Neither court gains authority this turn.`});
 if(c.house!==p.house&&!p.marriages.some(m=>m.house===c.house))for(const queen of p.court.filter(q=>card(q).role==='Queen'&&isActive(p,q)&&!p.marriages.some(m=>m.queen===q)))a.push({type:'marry',cards:[id],queen,label:`Marry into ${house(c.house).name}`,detail:`${card(queen).name} links ${house(c.house).name}. ${c.name} enters your court; you may now build this bloodline.`});
 }
 for(const q of g.players.filter(q=>q.id!==index)){
 const targets=q.court.filter(id=>card(id).role!=='Founder'||q.court.length===1);
 for(let i=0;i<p.hand.length;i++)for(let j=i+1;j<p.hand.length;j++){
 const pair=[p.hand[i],p.hand[j]];if(card(pair[0]).house!==card(pair[1]).house&&!(p.house==='plantagenet'&&pair.some(id=>card(id).role==='Warlord')))continue;
 for(const target of targets)a.push({type:'seize',cards:pair,target:q.id,targetCard:target,label:q.ward?`Break ${house(q.house).name}’s protection`:`Seize ${card(target).name}`,detail:q.ward?'Discard the pair to remove 1 protection. The Royal stays in their court.':`Discard this pair and take ${card(target).name}. Foreign captives need a marriage to contribute authority.`});
 }
 for(const id of p.hand.filter(id=>card(id).role==='Intriguer'))if(p.house==='tudor'||p.relics.includes('veil')||g.modifier==='intrigue'||p.marriages.some(m=>m.house===q.house))for(const target of targets)a.push({type:'betray',cards:[id],target:q.id,targetCard:target,label:q.ward?`Break ${house(q.house).name}’s protection`:`Betray ${card(target).name}`,detail:q.ward?'Discard the Intriguer to remove 1 protection.':'Discard this Intriguer and remove the rival Royal from play.'});
 }
 for(const id of p.hand)a.push({type:'scheme',cards:[id],label:`Conceal ${card(id).name}`,detail:'Cycle this card and gain 1 protection. A quiet turn can save your crown.'});if(!p.hand.length)a.push({type:'scheme',cards:[],label:'Petition the court',detail:'Your archive is exhausted. Take the first public Royal, if available, and gain 1 protection.'});return a;
}
export const actionKey=(a:Action)=>[a.type,...a.cards,a.target??'',a.targetCard??'',a.market??'',a.queen??''].join('|');
export function applyAction(g:Game,requested:Action){
 const a=legalActions(g).find(x=>actionKey(x)===actionKey(requested));if(!a)throw Error('That move is no longer legal.');const p=g.players[g.turn];const actor=p.id===0?'You':house(p.house).name;
 p.hand=p.hand.filter(id=>!a.cards.includes(id));
 if(a.type==='build'){const id=a.cards[0];p.court.push(id);if(['Founder','Warlord','Lawgiver'].includes(card(id).role))protect(p,card(id).role==='Founder'&&p.house==='alba'?2:1);if(card(id).role==='Lawgiver'&&p.house==='valois'){const i=g.paintings.indexOf(Math.max(...g.paintings));g.paintings[i]=Math.max(0,g.paintings[i]-1);}log(g,`${actor} build ${card(id).name}.`,'build');}
 if(a.type==='barter'){g.market=g.market.filter(id=>id!==a.market);g.market.push(a.cards[0]);p.hand.push(a.market!);log(g,`${actor} trade ${card(a.cards[0]).name} for ${card(a.market!).name}.`,'barter');}
 if(a.type==='marry'){p.marriages.push({queen:a.queen!,house:card(a.cards[0]).house});p.court.push(a.cards[0]);log(g,`${actor} join ${house(card(a.cards[0]).house).name} through ${card(a.queen!).name}.`,'marry');}
 if(a.type==='scheme'){g.discard.push(...a.cards);if(!a.cards.length&&g.market.length)p.hand.push(g.market.shift()!);protect(p);log(g,`${actor} ${a.cards.length?'conceal a scheme':'petition the court'} and gain protection.`,'scheme');}
 if(a.type==='seize'||a.type==='betray'){g.discard.push(...a.cards);const q=g.players[a.target!];if(q.ward){q.ward--;log(g,`${actor} break ${house(q.house).name}’s protection.`,'shield');}else{removeCourt(g,q,a.targetCard!,a.type==='betray');if(a.type==='seize')p.court.push(a.targetCard!);log(g,`${actor} ${a.type==='seize'?'seize':'betray'} ${card(a.targetCard!).name}.`,a.type);}}
 refill(g,p);fillMarket(g);g.actions++;g.lastAction=a.type;
 for(const q of g.players){if(authority(g,q)<targetGoal(g,q))q.claim=false;}
 if(authority(g,p)>=targetGoal(g,p)&&!p.claim){p.claim=true;p.ward=Math.max(0,p.ward-1);log(g,`${actor} claim the crown. The coronation spends 1 protection. Hold until the next turn to secure victory.`,'claim');}
 g.turn=(g.turn+1)%3;if(g.turn===0){g.round++;if(!(g.mode==='tutorial'&&g.round<4))advanceHistory(g);}
 if(g.phase!=='over'){const next=g.players[g.turn];if(next.claim&&authority(g,next)>=targetGoal(g,next)){g.phase='over';g.winner=next.id;g.reason='A crown secured through a full round of opposition.';log(g,`${next.name} secured the dynasty.`,'victory');}}
}
export function revealFragment(g:Game){if(g.players[0].relics.includes('patron')&&g.veiled<2){g.veiled++;log(g,'The Painter’s Favor veils a fragment.','witness');return;}const i=Math.floor(random(g)*3);g.paintings[i]=Math.min(9,g.paintings[i]+1);if(g.paintings[i]===9){g.phase='over';g.winner=-1;g.reason='Eudoxia completed a painting before a dynasty could secure its claim.';log(g,'The Witness completes her record. Every dynasty falls.','witness');}}
function historicalLoss(g:Game,p:Player){if(p.ward){p.ward--;return;}const id=[...p.court].reverse().find(id=>card(id).role!=='Founder');if(id)removeCourt(g,p,id);}
export function resolveEvent(g:Game,event:number){
 g.history.push(event);log(g,`${EVENTS[event].name}: ${EVENTS[event].text}`,'history');
 if(event===0)g.players.filter(p=>p.court.length>3).forEach(p=>historicalLoss(g,p));
 if(event===1)g.players.forEach(p=>p.marriages=[]);
 if(event===2){const max=Math.max(...g.players.map(p=>authority(g,p)));g.players.filter(p=>authority(g,p)===max).forEach(p=>historicalLoss(g,p));}
 if(event===3)g.players.forEach(p=>protect(p));
 if(event===4)g.players.forEach(p=>p.ward=0);
 if(event===5){revealFragment(g);if(g.phase!=='over')revealFragment(g);}
 if(event===6){g.players.forEach(p=>protect(p));g.discard.push(...g.market.splice(0));fillMarket(g);}
 if(event===7)for(const p of g.players){const id=[...p.court].reverse().find(id=>card(id).house!==p.house);if(id)removeCourt(g,p,id);}
 for(const p of g.players)if(authority(g,p)<targetGoal(g,p))p.claim=false;
}
function advanceHistory(g:Game){revealFragment(g);if(g.winner!==null)return;if(g.round>=10)revealFragment(g);if(g.winner!==null)return;if(g.round%(g.modifier==='storm'?2:3)===0)resolveEvent(g,Math.floor(random(g)*EVENTS.length));}
export function chooseAI(g:Game):Action{
 const p=g.players[g.turn];const actions=legalActions(g);if(!actions.length)throw Error('No legal actions');
 const danger=Math.max(...g.players.filter(q=>q.id!==p.id).map(q=>authority(g,q)-targetGoal(g,q)));
 const score=(a:Action)=>{
 let n=0;
 if(a.type==='build')n=6+(card(a.cards[0]).role==='Founder'?4:0)+(['Warlord','Lawgiver'].includes(card(a.cards[0]).role)&&p.ward<2?2:0);
 if(a.type==='marry')n=6+(p.house==='habsburg'?2:0)+p.hand.filter(id=>card(id).house===card(a.cards[0]).house).length;
 if(a.type==='barter')n=(isActive(p,a.market!)?5:0)+(card(a.market!).role==='Founder'?1:0)-(isActive(p,a.cards[0])?4:0)+(p.hand.filter(id=>card(id).house===card(a.market!).house).length>0?1:0);
 if(a.type==='seize'||a.type==='betray'){const q=g.players[a.target!];n=(a.type==='seize'&&isActive(p,a.targetCard!)?5:1)+(q.claim?(g.difficulty==='story'?4:g.difficulty==='standard'?9:16):0)+(authority(g,q)>=targetGoal(g,q)-1?4:0)-(q.ward?3:0)-a.cards.filter(id=>isActive(p,id)).length*2;}
 if(a.type==='scheme')n=(p.ward<2?2:0)-(a.cards.length&&isActive(p,a.cards[0])?3:0)+(p.claim?5:0);
 if((a.type==='build'||a.type==='marry')&&authority(g,p)>=targetGoal(g,p)-2)n+=4;
 if(p.claim&&(a.type==='build'||a.type==='marry'))n+=4;
 const noise=g.difficulty==='story'?8:g.difficulty==='standard'?2:0.3;
 return n+random(g)*noise+(danger>=0&&a.target!==undefined?2:0);
 };
 return actions.map(a=>({a,n:score(a)})).sort((x,y)=>y.n-x.n)[0].a;
}
export function validateGame(g:Game):boolean{
 try{
 if(!g||g.version!==1||!Array.isArray(g.players)||g.players.length!==3||!['draft','declare','play','over'].includes(g.phase)||!['tutorial','campaign','skirmish','daily'].includes(g.mode)||!['story','standard','ruthless'].includes(g.difficulty)||!Number.isInteger(g.turn)||g.turn<0||g.turn>2||!Number.isInteger(g.round)||g.round<1||g.round>200||!Number.isFinite(g.rng)||!Number.isFinite(g.seed)||!Number.isInteger(g.actions)||g.actions<0||!Number.isInteger(g.draftStep)||g.draftStep<0||g.draftStep>3||![null,-1,0,1,2].includes(g.winner)||!Array.isArray(g.paintings)||g.paintings.length!==3||g.paintings.some(n=>!Number.isInteger(n)||n<0||n>9)||!Array.isArray(g.log)||!Array.isArray(g.history))return false;
 const all=[...g.deck,...g.discard,...g.market,...g.players.flatMap(p=>[...p.hand,...p.court])];
 return all.length===42&&new Set(all).size===all.length&&all.every(id=>CARDS.some(c=>c.id===id))&&new Set(g.players.map(p=>p.house)).size===3&&g.players.every((p,i)=>p.id===i&&HOUSES.some(h=>h.id===p.house)&&p.marriages.every(m=>p.court.includes(m.queen)&&card(m.queen).role==='Queen'&&HOUSES.some(h=>h.id===m.house))&&Array.isArray(p.relics)&&p.ward>=0&&p.ward<=4)&&g.log.every(l=>typeof l.text==='string'&&typeof l.kind==='string'&&Number.isInteger(l.round))&&Number.isFinite(g.goal)&&g.goal>=4&&g.goal<=20;
 }catch{return false;}
}
