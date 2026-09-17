import { mkdirSync, writeFileSync } from 'node:fs';
import { runCoreBrowser, FIXTURE_NAMES } from './core-browser';

// Full declared viewport matrix. Generated images remain uninspected until an
// actual reviewer opens them and records findings on the same candidate.
const matrix=[[1280,720],[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[360,800],[375,667],[390,844],[393,852],[412,915],[430,932],[844,390],[768,1024],[1024,768],[1536,864],[1366,1366],[414,896],[393,873],[384,832],[360,780]];
const output='artifacts/core/layout';mkdirSync(output,{recursive:true});
const report={evidence:'DOM-driven regression and screenshots only; every visual inspection remains pending. Keyboard captures resize the viewport and do not emulate actual OS software keyboards. Additional input/network checks live in core-browser-extended.ts and have a separate report.',expectedViewports:matrix,fixtureFamilies:[...FIXTURE_NAMES],results:[] as {viewport:string;passed:boolean;captures:number;manifest:string;tutorialCompleted:boolean;failures:string[]}[],unexecutedRequirements:['Actual hardware iOS/Android cutout and software-keyboard validation','Actual visual review of every captured row','All 52 individual reference faces, tracked by the separate asset proof workflow','Supplementary core-browser-extended report must be executed and reviewed separately'],passed:false};
for(const [width,height] of matrix){
  const directory=`${output}/${width}x${height}`;
  try{const result=await runCoreBrowser({width,height,output:directory});report.results.push({viewport:`${width}x${height}`,passed:!!result.passed,captures:result.captures.length,manifest:`${directory}/manifest.json`,tutorialCompleted:result.tutorialCompleted,failures:result.failures});}
  catch(error){report.results.push({viewport:`${width}x${height}`,passed:false,captures:0,manifest:`${directory}/manifest.json`,tutorialCompleted:false,failures:[String(error)]});}
  writeFileSync(`${output}/matrix.json`,JSON.stringify(report,null,2));
  console.log(`Core matrix ${width}x${height}: ${report.results.at(-1)!.passed?'automated checks pass':'FAILED'}; visual review pending`);
}
report.passed=report.results.length===matrix.length&&report.results.every(result=>result.passed);
writeFileSync(`${output}/matrix.json`,JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
