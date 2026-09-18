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
  Object.assign(this.renderer.domElement.dataset,{fromX:String(from.x),fromY:String(from.y),toX:String(to.x),toY:String(to.y)});
  const key=[from.x,from.y,to.x,to.y,innerWidth,innerHeight].map(Math.round).join(':');if(key===this.key)return;this.key=key;
  this.group.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}});this.group.clear();this.beads=[];
  this.renderer.setSize(innerWidth,innerHeight);Object.assign(this.camera,{left:-innerWidth/2,right:innerWidth/2,top:innerHeight/2,bottom:-innerHeight/2});this.camera.updateProjectionMatrix();
  const a=new THREE.Vector3(from.x-innerWidth/2,innerHeight/2-from.y,0),b=new THREE.Vector3(to.x-innerWidth/2,innerHeight/2-to.y,0);
  const middle=a.clone().lerp(b,.5);middle.y+=Math.min(170,a.distanceTo(b)*.24);middle.z=180;
  this.curve=new THREE.QuadraticBezierCurve3(a,middle,b);
  const vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<=64;i++) {
    const t=i/64,p=this.curve.getPoint(t),tangent=this.curve.getTangent(t),side=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();
    const width=t<.875?7:24*(1-t)/.125;
    for(const z of [-2,2])for(const sign of [-1,1])vertices.push(p.x+side.x*width*sign,p.y+side.y*width*sign,p.z+z);
    if(i<64){const k=i*4;indices.push(k+2,k+3,k+6,k+3,k+7,k+6,k,k+4,k+1,k+1,k+4,k+5,k,k+2,k+4,k+2,k+6,k+4,k+1,k+5,k+3,k+3,k+5,k+7);}
  }
  const ribbon=new THREE.BufferGeometry();ribbon.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));ribbon.setIndex(indices);ribbon.computeVertexNormals();
  this.group.add(new THREE.Mesh(ribbon,new THREE.MeshStandardMaterial({color:0xffd46d,metalness:.6,roughness:.28,side:THREE.DoubleSide,emissive:0x77500b,emissiveIntensity:.35})));
  for(let i=0;i<3;i++){const bead=new THREE.Mesh(new THREE.BoxGeometry(12,3,1),new THREE.MeshBasicMaterial({color:0xfff6cb}));this.beads.push(bead);this.group.add(bead);}
 }
 hide(){this.renderer.domElement.hidden=true;this.renderer.clear();this.key='';}
 private tick=()=>{this.frame=requestAnimationFrame(this.tick);if(this.renderer.domElement.hidden)return;if(this.curve)this.beads.forEach((b,i)=>{const t=this.reduced?(i+1)/4:(performance.now()/1400+i/3)% .875;b.position.copy(this.curve!.getPoint(t));b.position.z+=3;const tangent=this.curve!.getTangent(t);b.rotation.z=Math.atan2(tangent.y,tangent.x)-Math.PI/2;});this.renderer.render(this.scene,this.camera);};
 dispose(){cancelAnimationFrame(this.frame);this.renderer.dispose();this.renderer.domElement.remove();}
}
