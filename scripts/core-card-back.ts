import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=process.env.BASE_URL??'http://localhost:5173/';
const out=process.env.BACK_OUTPUT??'artifacts/core/card-back';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try {
 const page=await browser.newPage({viewport:{width:1320,height:940}});
 await page.goto(base);
 const result=await page.evaluate(async()=>{
  const img=new Image();img.src=new URL('art/oando-card-back.svg',location.href).href;await img.decode();
  const c=document.createElement('canvas');c.width=630;c.height=880;const ctx=c.getContext('2d')!;ctx.drawImage(img,0,0);
  const data=ctx.getImageData(0,0,630,880).data;let changed=0,total=0,max=0;
  for(let i=0;i<630*880;i++)for(let k=0;k<4;k++){const diff=Math.abs(data[i*4+k]-data[(630*880-1-i)*4+k]);total+=diff;max=Math.max(max,diff);if(diff>8)changed++;}
  document.body.innerHTML='';document.body.style.cssText='margin:20px;background:#e5dfd1;display:flex;gap:20px';
  for(const flipped of [false,true]){const figure=document.createElement('figure');figure.style.margin='0';const label=document.createElement('figcaption');label.textContent=flipped?'Rotated 180°':'Upright';label.style.cssText='font:20px Georgia;height:40px';const image=img.cloneNode() as HTMLImageElement;image.style.cssText='width:630px;height:880px;'+(flipped?'transform:rotate(180deg)':'');figure.append(label,image);document.body.append(figure);}
  return {width:630,height:880,meanChannelDifference:total/(630*880*4),channelsOver8:changed,maxDifference:max};
 });
 assert.ok(result.meanChannelDifference<1,JSON.stringify(result));assert.ok(result.channelsOver8/(630*880*4)<.002,JSON.stringify(result));
 await page.screenshot({path:`${out}/upright-and-inverted.png`});writeFileSync(`${out}/symmetry.json`,JSON.stringify({base,...result,inspected:false},null,2));console.log('PASS reversible 63:88 O&O artwork',result);
}finally{await browser.close();}
