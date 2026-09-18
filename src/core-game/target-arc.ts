import * as THREE from 'three';
type Point={x:number;y:number};
/** Screen-anchored, lit 3D targeting arc. It never intercepts input. */
export class TargetArc {
 private renderer:THREE.WebGLRenderer;
 private scene=new THREE.Scene();
 private camera=new THREE.OrthographicCamera();
 private group=new THREE.Group();
 private curve:THREE.QuadraticBezierCurve3|null=null;
 private beads:THREE.Mesh[]=[];
 private frame=0;
 private key='';
 private reduced=false;
 constructor(){
  this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.domElement.className='c-target-arcs';this.renderer.domElement.setAttribute('aria-hidden','true');document.body.append(this.renderer.domElement);
  this.scene.add(new THREE.AmbientLight(0xffdd99,2));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(-300,400,600);this.scene.add(light,this.group);this.camera.position.z=1000;this.camera.near=1;this.camera.far=2000;this.tick();
 }
 show(from:Point,to:Point,reduced:boolean){
  this.reduced=reduced;this.renderer.domElement.hidden=false;
  const key=[from.x,from.y,to.x,to.y,innerWidth,innerHeight].map(Math.round).join(':');if(key===this.key)return;this.key=key;
  this.group.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}});this.group.clear();this.beads=[];
  this.renderer.setSize(innerWidth,innerHeight);Object.assign(this.camera,{left:-innerWidth/2,right:innerWidth/2,top:innerHeight/2,bottom:-innerHeight/2});this.camera.updateProjectionMatrix();
  const a=new THREE.Vector3(from.x-innerWidth/2,innerHeight/2-from.y,0),b=new THREE.Vector3(to.x-innerWidth/2,innerHeight/2-to.y,0);
  const middle=a.clone().lerp(b,.5);middle.y+=Math.min(170,a.distanceTo(b)*.24);middle.z=180;
  this.curve=new THREE.QuadraticBezierCurve3(a,middle,b);
  const tube=new THREE.Mesh(new THREE.TubeGeometry(this.curve,64,5,12,false),new THREE.MeshStandardMaterial({color:0xffd46d,metalness:.65,roughness:.24,emissive:0x9b650e,emissiveIntensity:.45}));this.group.add(tube);
  const head=new THREE.Mesh(new THREE.ConeGeometry(14,34,20),new THREE.MeshStandardMaterial({color:0xffe6a3,metalness:.5,roughness:.2,emissive:0x956915}));head.position.copy(b);head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),this.curve.getTangent(1));this.group.add(head);
  for(let i=0;i<3;i++){const bead=new THREE.Mesh(new THREE.SphereGeometry(7,12,8),new THREE.MeshBasicMaterial({color:0xfff6cb}));this.beads.push(bead);this.group.add(bead);}
 }
 hide(){this.renderer.domElement.hidden=true;this.key='';}
 private tick=()=>{this.frame=requestAnimationFrame(this.tick);if(this.renderer.domElement.hidden)return;if(this.curve)this.beads.forEach((b,i)=>b.position.copy(this.curve!.getPoint(this.reduced?(i+1)/4:(performance.now()/1400+i/3)%1)));this.renderer.render(this.scene,this.camera);};
 dispose(){cancelAnimationFrame(this.frame);this.renderer.dispose();this.renderer.domElement.remove();}
}
