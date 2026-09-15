import {validateGame,type Game,type Difficulty} from './engine';
import {HOUSES,type HouseId} from './content';
export interface Run {house:HouseId;seed:number;act:number;relics:string[];path:number[];difficulty:Difficulty;awaitingReward:boolean;}
export interface Profile {version:1;renown:number;wins:number;completedRuns:number;tutorial:boolean;seen:string[];sound:boolean;motion:boolean;game:Game|null;run:Run|null;processed:string[];daily:{date:string;score:number}|null;}
export const emptyProfile=():Profile=>({version:1,renown:0,wins:0,completedRuns:0,tutorial:false,seen:[],sound:true,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,game:null,run:null,processed:[],daily:null});
export function readProfile():Profile{const initial=emptyProfile();try{const raw=JSON.parse(localStorage.getItem('oando-witness-v1')??'null');if(!raw||raw.version!==1)return initial;const p={...initial,...raw};if(p.game&&!validateGame(p.game))p.game=null;if(p.run&&(!HOUSES.some(h=>h.id===p.run.house)||!Number.isInteger(p.run.act)||p.run.act<0||p.run.act>3))p.run=null;if(!Array.isArray(p.seen)||!Array.isArray(p.processed)||!Number.isFinite(p.renown))return initial;return p;}catch{return initial;}}
export function saveProfile(profile:Profile){try{localStorage.setItem('oando-witness-v1',JSON.stringify(profile));return true;}catch{return false;}}
