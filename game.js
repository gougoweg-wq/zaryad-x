import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {clone as skClone} from 'three/addons/utils/SkeletonUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {makeRound,check,decoys,pick,R} from './math.js';

const $=id=>document.getElementById(id);
const Q=new URLSearchParams(location.search),MUTE=Q.has('mute');
const ROUNDS=[['more','times'],['sum3','rect'],['price','sale'],['give','book'],['speed','age','tickets','money']];
const ARENA=20,MAXHP=10;

/* ---------- сцена ---------- */
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
let pr=Math.min(devicePixelRatio,1.5);renderer.setPixelRatio(pr);renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.prepend(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x14171d,.02);
const cam=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,120);
const comp=new EffectComposer(renderer);comp.addPass(new RenderPass(scene,cam));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.45,.5,.92);comp.addPass(bloom);comp.addPass(new OutputPass());
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);comp.setSize(innerWidth,innerHeight)});

const mgr=new THREE.LoadingManager();mgr.onProgress=(u,a,b)=>{const i=document.querySelector('#load i');if(i)i.style.width=a/b*100+'%'};
const gl=new GLTFLoader(mgr);gl.setMeshoptDecoder(MeshoptDecoder);const tl=new THREE.TextureLoader(mgr);
const load=n=>gl.loadAsync('assets/models/'+n+'.glb');
function pbr(n,rx,ry){const t={};for(const[k,m,c]of[['map','Diffuse',true],['normalMap','nor_gl'],['roughnessMap','Rough']]){const x=tl.load(`assets/tex/${n}_${m}.jpg`);x.wrapS=x.wrapT=THREE.RepeatWrapping;x.repeat.set(rx,ry);x.anisotropy=8;if(c)x.colorSpace=THREE.SRGBColorSpace;t[k]=x}return new THREE.MeshStandardMaterial({...t,metalness:.05})}

const solids=[];
function addSolid(o){o.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(o);solids.push(b);return b}
function shadow(o,c=true,r=true){o.traverse(m=>{if(m.isMesh){m.castShadow=c;m.receiveShadow=r}})}

async function buildWorld(){
 const env=await new RGBELoader(mgr).loadAsync('assets/tex/env.hdr');env.mapping=THREE.EquirectangularReflectionMapping;scene.environment=env;scene.background=new THREE.Color(0x0b0d11);scene.environmentIntensity=.32;
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(ARENA*2,ARENA*2),pbr('floor',6,6));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 const wm=pbr('wall',8,1.6);wm.metalness=.35;wm.color.set(0x8a8074);
 const cm=new THREE.MeshStandardMaterial({color:0x14161b,metalness:.7,roughness:.6});const ceil=new THREE.Mesh(new THREE.PlaneGeometry(ARENA*2,ARENA*2),cm);ceil.rotation.x=Math.PI/2;ceil.position.y=10;scene.add(ceil);
 for(let i=-16;i<=16;i+=8){const b=new THREE.Mesh(new THREE.BoxGeometry(ARENA*2,.5,.3),cm);b.position.set(0,9.6,i);scene.add(b);const c=new THREE.Mesh(new THREE.BoxGeometry(.3,.5,ARENA*2),cm);c.position.set(i,9.6,0);scene.add(c)}
 for(const[x,z,r]of[[0,-ARENA,0],[0,ARENA,Math.PI],[-ARENA,0,Math.PI/2],[ARENA,0,-Math.PI/2]]){const w=new THREE.Mesh(new THREE.PlaneGeometry(ARENA*2,10),wm);w.position.set(x,5,z);w.rotation.y=r;w.receiveShadow=true;scene.add(w)}
 const sun=new THREE.DirectionalLight(0xffd9b0,1.5);sun.position.set(10,30,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-26,right:26,top:26,bottom:-26,far:70});sun.shadow.bias=-.0004;scene.add(sun);
 const coneTex=(()=>{const c=document.createElement('canvas');c.width=4;c.height=128;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#fff');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,4,128);return new THREE.CanvasTexture(c)})();
 for(const[x,z,c]of[[-11,-11,0xff9a4a],[11,11,0x4ac8ff],[11,-11,0xff9a4a],[-11,11,0x4ac8ff],[0,0,0xfff0d8]]){const l=new THREE.SpotLight(c,420,24,.62,.55,1.6);l.position.set(x,9.4,z);l.target.position.set(x,0,z);scene.add(l,l.target);const lamp=new THREE.Mesh(new THREE.CylinderGeometry(.5,.7,.3,20),new THREE.MeshStandardMaterial({color:0x0c0d10,emissive:c,emissiveIntensity:6}));lamp.position.set(x,9.5,z);scene.add(lamp);const cone=new THREE.Mesh(new THREE.ConeGeometry(5.6,9.4,32,1,true),new THREE.MeshBasicMaterial({color:c,alphaMap:coneTex,map:null,transparent:true,opacity:.045,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));cone.position.set(x,4.7,z);scene.add(cone)}
 const names=['concrete_road_barrier','concrete_road_barrier_02','barrel_03','old_military_crate','wooden_crate_01','propane_tank','portable_generator','modular_industrial_pipes_01','ammo_box','medical_box','old_tyre','industrial_pastic_container','power_box_01','wooden_military_crate'];
 const M={};await Promise.all(names.map(async n=>{const g=await load(n);shadow(g.scene);M[n]=g.scene}));
 const P=(n,x,z,r=0,s=1)=>{const o=M[n].clone(true);o.position.set(x,0,z);o.rotation.y=r;o.scale.setScalar(s);scene.add(o);return o};
 const L=[['concrete_road_barrier',-9,-4,.3,1.3],['concrete_road_barrier',-9,1,.3,1.3],['concrete_road_barrier_02',9,3,-.4,1.3],['concrete_road_barrier_02',9,-2,-.4,1.3],['concrete_road_barrier',0,-11,1.57,1.3],['concrete_road_barrier_02',1,11,1.57,1.3],
 ['portable_generator',-14,-13,.5,2.2],['portable_generator',15,13,2.4,2.2],['wooden_military_crate',-4,6,.2,2],['old_military_crate',4,-6,1,2],['wooden_crate_01',-15,8,.4,2.2],['wooden_crate_01',-13.2,9.6,1.1,1.8],['wooden_crate_01',15,-9,.2,2.2],['barrel_03',5.5,7,0,1.4],['barrel_03',6.7,6,0,1.4],['barrel_03',-6,-8,0,1.4],['barrel_03',-17,-3,0,1.4],['propane_tank',16.5,0,0,1.6],['propane_tank',-3,14.5,0,1.6],['industrial_pastic_container',14,-15,.6,1.5],['industrial_pastic_container',-16,15,1.4,1.5],['power_box_01',0,-18.6,0,2]];
 for(const l of L){addSolid(P(...l))}
 for(const[n,x,z,r,s]of[['old_tyre',8,-13,.4,1.2],['old_tyre',-8,13,1.1,1.2],['ammo_box',3,3.4,.4,1.5],['medical_box',-11,-9,1,1.5]])P(n,x,z,r,s);
 for(let i=0;i<4;i++){const a=i*Math.PI/2,x=Math.round(Math.cos(a))*(ARENA-.05),z=Math.round(Math.sin(a))*(ARENA-.05);const lx=!(i%2),d=new THREE.Mesh(new THREE.BoxGeometry(lx?.3:6,4.4,lx?6:.3),new THREE.MeshStandardMaterial({color:0x16181d,metalness:.85,roughness:.45}));d.position.set(x,2.2,z);scene.add(d);const st=new THREE.Mesh(new THREE.BoxGeometry(lx?.34:6.1,.09,lx?6.1:.34),new THREE.MeshStandardMaterial({color:0x080808,emissive:0xff3020,emissiveIntensity:5}));st.position.set(x,4.45,z);scene.add(st)}
}

/* ---------- герой и оружие ---------- */
const P={pos:new THREE.Vector3(0,0,8),yaw:Math.PI*0,pitch:-.05,vel:new THREE.Vector3(),hp:MAXHP,mixer:null,acts:{},cur:null,rec:0};
let hero,enemyProto,enemyClips,muzzle,gunTip;
const flash=new THREE.PointLight(0xffc070,0,9,2);scene.add(flash);
const BONES={};
function setAnim(n,fade=.18){if(P.cur===n)return;P.acts[P.cur]?.fadeOut(fade);P.acts[n].reset().fadeIn(fade).play();P.cur=n}
function makeGun(){const g=new THREE.Group(),dk=new THREE.MeshStandardMaterial({color:0x1c1f25,metalness:.9,roughness:.32}),lt=new THREE.MeshStandardMaterial({color:0x4a505c,metalness:.95,roughness:.25}),glow=new THREE.MeshStandardMaterial({color:0x061018,emissive:0x29e0ff,emissiveIntensity:5});
 const add=(geo,m,x,y,z,rx=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.x=rx;o.castShadow=true;g.add(o);return o};
 add(new THREE.BoxGeometry(.07,.11,.46),dk,0,0,0);add(new THREE.BoxGeometry(.05,.04,.5),lt,0,.075,.01);add(new THREE.CylinderGeometry(.022,.026,.34,16),lt,0,.01,.38,Math.PI/2);add(new THREE.CylinderGeometry(.036,.036,.1,16),dk,0,.01,.5,Math.PI/2);
 add(new THREE.BoxGeometry(.055,.16,.075),dk,0,-.12,-.06,-.3);add(new THREE.BoxGeometry(.05,.17,.09),lt,0,-.13,.1,.15);add(new THREE.BoxGeometry(.06,.09,.26),dk,0,-.01,-.32);add(new THREE.BoxGeometry(.012,.022,.3),glow,.04,.02,.08);add(new THREE.BoxGeometry(.012,.022,.3),glow,-.04,.02,.08);
 add(new THREE.CylinderGeometry(.03,.03,.16,16),dk,0,.135,.04,Math.PI/2);
 const tip=new THREE.Object3D();tip.position.set(0,.01,.58);g.add(tip);gunTip=tip;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd090,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));s.scale.setScalar(0);tip.add(s);muzzle=s;return g}
function glowTex(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,1,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.3,'#ffffff80');g.addColorStop(1,'#0000');x.fillStyle=g;x.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
async function buildHero(){const g=await load('Soldier');hero=g.scene;shadow(hero,true,false);scene.add(hero);P.mixer=new THREE.AnimationMixer(hero);for(const c of g.animations)P.acts[c.name]=P.mixer.clipAction(c);setAnim('Idle',0);
 hero.traverse(o=>{if(o.isBone)BONES[o.name.replace('mixamorig','')]=o});
 gunObj=makeGun();gunObj.scale.setScalar(1.05);scene.add(gunObj);
 const e=await load('Xbot');enemyProto=e.scene;enemyClips=e.animations}
let gunObj;
const v1=new THREE.Vector3(),v2=new THREE.Vector3(),v3=new THREE.Vector3(),v4=new THREE.Vector3(),v5=new THREE.Vector3(),q1=new THREE.Quaternion(),q2=new THREE.Quaternion(),q3=new THREE.Quaternion();
function aimBone(b,from,to){q1.setFromUnitVectors(from.clone().normalize(),to.clone().normalize());b.getWorldQuaternion(q2);q2.premultiply(q1);b.parent.getWorldQuaternion(q3).invert();b.quaternion.copy(q3.multiply(q2));b.updateWorldMatrix(false,true)}
function ik(up,fo,ha,T,pole){up.updateWorldMatrix(true,true);const S=up.getWorldPosition(v1),E=fo.getWorldPosition(v2),W=ha.getWorldPosition(v3),a=S.distanceTo(E),b=E.distanceTo(W),t=v4.copy(T).sub(S),d=Math.min(t.length(),a+b-.005);t.normalize();const ca=(a*a+d*d-b*b)/(2*a*d),sa=Math.sqrt(Math.max(0,1-ca*ca)),n=v5.copy(pole).addScaledVector(t,-pole.dot(t)).normalize(),E2=S.clone().addScaledVector(t,a*ca).addScaledVector(n,a*sa);aimBone(up,E.clone().sub(S),E2.clone().sub(S));const E3=fo.getWorldPosition(new THREE.Vector3()),W2=ha.getWorldPosition(new THREE.Vector3());aimBone(fo,W2.clone().sub(E3),T.clone().sub(E3))}
const aimDir=new THREE.Vector3(),gr=new THREE.Vector3(),gl2=new THREE.Vector3(),hu=new THREE.Vector3(0,1,0),hr=new THREE.Vector3(),chest=new THREE.Vector3();
function aimPose(){const p=P.pitch;BONES.Spine1.rotateX(-p*.3);BONES.Spine2.rotateX(-p*.3);BONES.Spine2.rotateY(.28);hero.updateMatrixWorld(true);
 aimDir.set(-Math.sin(P.yaw)*Math.cos(p),Math.sin(p),-Math.cos(P.yaw)*Math.cos(p));hr.set(Math.cos(P.yaw),0,-Math.sin(P.yaw));
 BONES.Spine2.getWorldPosition(chest);gunObj.position.copy(chest).addScaledVector(aimDir,.36+P.rec*-.05).addScaledVector(hr,.13).add(hu.clone().multiplyScalar(.06));gunObj.lookAt(gunObj.position.clone().add(aimDir));gunObj.updateMatrixWorld(true);
 gr.set(0,-.1,-.06).applyMatrix4(gunObj.matrixWorld);gl2.set(0,-.1,.14).applyMatrix4(gunObj.matrixWorld);
 ik(BONES.RightArm,BONES.RightForeArm,BONES.RightHand,gr,new THREE.Vector3(.8,-1,-.25));ik(BONES.LeftArm,BONES.LeftForeArm,BONES.LeftHand,gl2,new THREE.Vector3(-.8,-1,-.1))}

/* ---------- враги, босс, столбы, кристаллы ---------- */
const enemies=[],shards=[],pylons=[],fx=[];let boss=null,phase='build',round=0,R0=null,bar=[],spawnT=0,toastT=0,log=[],invuln=0;
const redMat=m=>{const c=m.clone();c.color=new THREE.Color(0x8a1712);c.emissive=new THREE.Color(0xff2a10);c.emissiveIntensity=.35;c.metalness=.7;c.roughness=.35;return c};
const darkMat=m=>{const c=m.clone();c.color=new THREE.Color(0x151820);c.emissive=new THREE.Color(0xffa020);c.emissiveIntensity=.5;c.metalness=.95;c.roughness=.25;return c};
function mkBot(scale,mat){const o=skClone(enemyProto);o.scale.setScalar(scale);o.traverse(m=>{if(m.isMesh){m.material=mat(m.material);m.castShadow=true;m.frustumCulled=false}});scene.add(o);const mx=new THREE.AnimationMixer(o),run=enemyClips.find(c=>c.name==='run'),idle=enemyClips.find(c=>c.name==='idle');return{o,mx,run:mx.clipAction(run),idle:mx.clipAction(idle)}}
const DOORS=[[0,-19],[0,19],[-19,0],[19,0]];
function spawnEnemy(){const[x,z]=pick(DOORS),b=mkBot(1,redMat);b.o.position.set(x,0,z);b.run.time=Math.random();b.run.play();enemies.push({...b,hp:3,hit:0,dead:0,cool:0})}
function killEnemy(e){e.dead=1;burst(e.o.position.clone().setY(1.1),0xff5a30,28)}
function label(text,color='#7df0ff',h=.62){const c=document.createElement('canvas'),x=c.getContext('2d'),f='900 92px ui-monospace,Menlo,Consolas,monospace';x.font=f;const w=Math.ceil(x.measureText(text).width)+60;c.width=w;c.height=136;x.font=f;x.fillStyle='#04121aee';x.strokeStyle=color;x.lineWidth=8;x.beginPath();x.roundRect(4,4,w-8,128,18);x.fill();x.stroke();x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,72);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,toneMapped:false,sizeAttenuation:false}));const k=h*.095;s.scale.set(k*w/136,k,1);s.renderOrder=5;return s}
const shardGeo=new THREE.OctahedronGeometry(.42,0),beamGeo=new THREE.CylinderGeometry(.3,.3,4,16,1,true);
function freeSpot(far){for(let i=0;i<300;i++){const v=new THREE.Vector3(R(-17,17),0,R(-17,17));if(v.distanceTo(P.pos)<(far||5))continue;if(solids.some(b=>b.clone().expandByScalar(1.1).containsPoint(v.clone().setY(.5))))continue;if(shards.some(s=>s.g.position.distanceTo(v)<5))continue;return v}return new THREE.Vector3(R(-8,8),0,R(-8,8))}
function addShard(t){const g=new THREE.Group(),col=/[=+−()]/.test(t)&&t.length<=2?0xffb02e:0x29e0ff;const m=new THREE.Mesh(shardGeo,new THREE.MeshStandardMaterial({color:0x061018,emissive:col,emissiveIntensity:3.4,metalness:.4,roughness:.2}));m.position.y=1.15;const beam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));beam.position.y=2;const lb=label(t,col===0xffb02e?'#ffb02e':'#7df0ff');lb.position.y=2.2;g.add(m,beam,lb);g.position.copy(freeSpot());scene.add(g);shards.push({g,m,t,on:true})}
function clearRound(){for(const e of enemies)scene.remove(e.o);enemies.length=0;for(const s of shards)scene.remove(s.g);shards.length=0;for(const p of pylons)scene.remove(p.g);pylons.length=0;if(boss){scene.remove(boss.o);scene.remove(boss.shield);boss=null}bar=[]}
function startRound(){clearRound();R0=makeRound(ROUNDS[round]);R0.errs=[];P.hp=Math.min(MAXHP,P.hp+3);phase='build';for(const t of [...R0.need,...R0.extra])addShard(t);hud();spawnT=2}
function drawBar(){const e=$('eq');e.replaceChildren();for(let i=0;i<R0.need.length;i++){const d=document.createElement('div');d.className='s'+(bar[i]?' f':'');d.textContent=bar[i]||'';e.append(d)}}
function hud(){$('task').textContent=R0.text;const s=document.createElement('small');s.textContent='x — '+R0.letX;$('task').append(s);$('round').textContent='Раунд '+(round+1)+' / '+ROUNDS.length;$('goal').textContent=phase==='build'?'Собери уравнение из кристаллов':phase==='solve'?'Посчитай x и стреляй в столб с этим числом':'Щит снят! Убей босса';$('eqn').hidden=phase!=='build';drawBar();$('hp').firstChild.style.width=P.hp/MAXHP*100+'%'}
function toast(t,c='#fff'){const e=$('toast');e.textContent=t;e.style.color=c;e.style.opacity=1;toastT=1.8}
function hurt(n){if(invuln>0)return;invuln=.5;P.hp-=n;$('hurt').style.opacity=1;setTimeout(()=>$('hurt').style.opacity=0,160);sfx('hurt');hud();if(P.hp<=0)gameOver()}
function pickup(s){s.on=false;s.g.visible=false;bar.push(s.t);sfx('pick');burst(s.g.position.clone().setY(1.2),0x29e0ff,14);drawBar();if(bar.length===R0.need.length){if(check(bar,R0)){phase='solve';sfx('ok');toast('Уравнение верное!','#7dffb0');for(const x of shards)scene.remove(x.g);shards.length=0;startBoss();hud()}else{R0.errs.push(bar.join(' '));toast('Не сходится! Перечитай задачу','#ff6b6b');hurt(2);bar=[];for(const x of shards){x.on=true;x.g.visible=true;x.g.position.copy(freeSpot())}drawBar()}}}
function undo(){if(!bar.length||phase!=='build')return;const t=bar.pop(),s=shards.find(x=>!x.on&&x.t===t);if(s){s.on=true;s.g.visible=true;s.g.position.copy(freeSpot(3))}drawBar()}
function startBoss(){for(const e of enemies)killEnemy(e);const b=mkBot(2.3,darkMat);b.o.position.set(0,0,-13);b.idle.play();const sh=new THREE.Mesh(new THREE.SphereGeometry(3,40,28),new THREE.MeshPhysicalMaterial({color:0x29e0ff,emissive:0x29e0ff,emissiveIntensity:.5,transparent:true,opacity:.2,roughness:.1,metalness:0,side:THREE.DoubleSide,depthWrite:false}));sh.position.set(0,2.2,-13);scene.add(sh);boss={...b,hp:8,shield:sh,open:false,cool:0,hit:0};
 const nums=decoys(R0.root),spots=[[-8,-8],[0,-5],[8,-8]];nums.forEach((n,i)=>{const[x,z]=spots[i],g=new THREE.Group(),base=new THREE.Mesh(new THREE.CylinderGeometry(.55,.75,2.4,24),new THREE.MeshStandardMaterial({color:0x22262e,metalness:.9,roughness:.3})),core=new THREE.Mesh(new THREE.SphereGeometry(.45,24,16),new THREE.MeshStandardMaterial({color:0x061018,emissive:0xffb02e,emissiveIntensity:4})),lb=label(String(n),'#ffb02e',1.3);base.position.y=1.2;base.castShadow=true;core.position.y=2.75;lb.position.y=4;g.add(base,core,lb);g.position.set(x,0,z);scene.add(g);pylons.push({g,n,box:new THREE.Box3(new THREE.Vector3(x-.8,0,z-.8),new THREE.Vector3(x+.8,3.4,z+.8))})})}
function shotPylon(p){if(p.n===R0.root){sfx('ok');toast('x = '+p.n+' — щит снят!','#7dffb0');boss.open=true;phase='kill';scene.remove(boss.shield);for(const q of pylons)scene.remove(q.g);pylons.length=0;boss.idle.stop();boss.run.play();hud()}else{R0.errs.push('x = '+p.n);toast('Неверный x! Босс бьёт','#ff6b6b');burst(p.g.position.clone().setY(2.7),0xff5a30,30);scene.remove(p.g);pylons.splice(pylons.indexOf(p),1);hurt(2)}}
function winRound(){log.push({text:R0.text,eq:R0.eq,errs:R0.errs});burst(boss.o.position.clone().setY(2),0xffb02e,60);scene.remove(boss.o);boss=null;round++;phase='wait';document.exitPointerLock?.();if(round>=ROUNDS.length)return endGame(true);setTimeout(briefing,700)}
function gameOver(){phase='wait';document.exitPointerLock?.();endGame(false)}

/* ---------- эффекты ---------- */
const sparkGeo=new THREE.SphereGeometry(.035,6,4);
function burst(p,c,n){const m=new THREE.MeshBasicMaterial({color:c,toneMapped:false});for(let i=0;i<n;i++){const s=new THREE.Mesh(sparkGeo,m);s.position.copy(p);scene.add(s);fx.push({s,v:new THREE.Vector3((Math.random()-.5)*7,Math.random()*6,(Math.random()-.5)*7),t:.5+Math.random()*.4})}}
const trMat=new THREE.MeshBasicMaterial({color:0xffe6b0,transparent:true,toneMapped:false});
function tracer(a,b){const d=a.distanceTo(b),g=new THREE.CylinderGeometry(.012,.012,d,6);g.rotateX(Math.PI/2);const m=new THREE.Mesh(g,trMat.clone());m.position.copy(a).lerp(b,.5);m.lookAt(b);scene.add(m);fx.push({tr:m,t:.07})}
let ac=null,mutedU=MUTE;const au=()=>{if(mutedU)return null;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();return ac}catch(e){return null}};
function sfx(k){const a=au();if(!a)return;const t=a.currentTime,g=a.createGain();g.connect(a.destination);if(k==='shot'){const n=a.createBufferSource(),b=a.createBuffer(1,2600,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<2600;i++)d[i]=(Math.random()*2-1)*(1-i/2600)**2;n.buffer=b;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=2400;n.connect(f).connect(g);g.gain.value=.16;n.start(t);return}const o=a.createOscillator();o.connect(g);const[f1,f2,d,v]={pick:[700,1100,.12,.14],ok:[520,1040,.32,.16],hurt:[190,90,.22,.2]}[k];o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.start(t);o.stop(t+d)}

/* ---------- стрельба ---------- */
const ray=new THREE.Raycaster(),rv=new THREE.Vector3(),sph=new THREE.Sphere(),tv=new THREE.Vector3();let fireT=0,firing=false;
function shoot(){fireT=.11;P.rec=1;sfx('shot');muzzle.scale.setScalar(.7+Math.random()*.4);flash.intensity=60;gunTip.getWorldPosition(flash.position);
 ray.setFromCamera({x:0,y:0},cam);const r=ray.ray;let best=60,hit=null,type=null;
 for(const b of solids)if(r.intersectBox(b,tv)){const d=tv.distanceTo(r.origin);if(d<best&&d>1){best=d;type='w'}}
 for(const e of enemies){if(e.dead)continue;sph.set(rv.copy(e.o.position).setY(1.05),.62);if(r.intersectSphere(sph,tv)){const d=tv.distanceTo(r.origin);if(d<best){best=d;hit=e;type='e'}}}
 for(const p of pylons)if(r.intersectBox(p.box,tv)){const d=tv.distanceTo(r.origin);if(d<best){best=d;hit=p;type='p'}}
 if(boss){sph.set(rv.copy(boss.o.position).setY(2.3),boss.open?1.7:3);if(r.intersectSphere(sph,tv)){const d=tv.distanceTo(r.origin);if(d<best){best=d;hit=boss;type='b'}}}
 const end=r.at(best,new THREE.Vector3()),from=gunTip.getWorldPosition(new THREE.Vector3());tracer(from,end);
 if(type==='e'){hit.hp--;hit.hit=.1;mark();burst(end,0xff7a30,5);if(hit.hp<=0)killEnemy(hit)}
 else if(type==='p'){mark();shotPylon(hit)}
 else if(type==='b'){if(boss.open){boss.hp--;boss.hit=.1;mark();burst(end,0xffb02e,6);if(boss.hp<=0)winRound()}else{burst(end,0x29e0ff,6);toast('Щит! Сначала столб с x','#7df0ff')}}
 else if(best<60)burst(end,0xffd0a0,3)}
function mark(){const c=$('cross');c.classList.add('hit');setTimeout(()=>c.classList.remove('hit'),80)}

/* ---------- ввод ---------- */
const keys={};let live=false;
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='KeyQ')undo();if(e.code==='KeyM'){mutedU=!mutedU}});addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('mousedown',e=>{if(e.button===0&&document.pointerLockElement)firing=true});addEventListener('mouseup',()=>firing=false);
addEventListener('mousemove',e=>{if(!document.pointerLockElement)return;P.yaw-=e.movementX*.0024;P.pitch=THREE.MathUtils.clamp(P.pitch-e.movementY*.0022,-.75,.6)});
document.addEventListener('pointerlockchange',()=>{live=!!document.pointerLockElement;if(!live&&phase!=='wait'&&!$('ov').hidden===false)overlay('<h1>Пауза</h1>','Продолжить',lock)});
function lock(){$('ov').hidden=true;$('hud').hidden=false;const r=renderer.domElement.requestPointerLock?.();r?.catch?.(()=>setTimeout(lock,1300));live=true}
function overlay(html,btn,fn){$('ov').hidden=false;$('box').innerHTML=html+`<button id="go">${btn}</button>`;$('go').onclick=fn}
function briefing(){startRound();live=false;const first=round===0;overlay(`<h1>Раунд ${round+1}</h1><p>${R0.text}</p><p class="x">x — ${R0.letX}</p>`+(first?`<ol><li>Беги через кристаллы <b>по порядку</b>, слева направо. Так собирается уравнение внизу экрана.</li><li>Посчитай x. Появятся 3 столба с числами: выстрели в верный, и щит босса упадёт.</li><li>Добей босса. Красные боты мешают, отстреливайся.</li></ol><p style="font-size:15px;color:#cfd8ea"><kbd>W A S D</kbd> бег · <kbd>мышь</kbd> прицел · <kbd>клик</kbd> огонь · <kbd>Q</kbd> убрать кристалл · <kbd>M</kbd> звук</p>`:''),'В бой',lock)}
function endGame(won){const rows=log.map(l=>`<li>${l.eq}${l.errs.length?' <span style="color:#ff8a80">(ошибок: '+l.errs.length+')</span>':''}</li>`).join('');overlay(`<h1>${won?'Арена зачищена!':'Ты погиб'}</h1><p>${won?'Все боссы повержены.':'Раунд '+(round+1)+' из '+ROUNDS.length+'.'}</p><ol>${rows}</ol>`,'Заново',()=>{round=0;P.hp=MAXHP;log=[];P.pos.set(0,0,8);briefing()})}

/* ---------- цикл ---------- */
const clock=new THREE.Clock(),fw=new THREE.Vector3(),rt=new THREE.Vector3(),mv=new THREE.Vector3(),camT=new THREE.Vector3();let ft=0,fc=0;
function collide(p,r=.45){p.x=THREE.MathUtils.clamp(p.x,-ARENA+.8,ARENA-.8);p.z=THREE.MathUtils.clamp(p.z,-ARENA+.8,ARENA-.8);for(const b of solids){if(p.x>b.min.x-r&&p.x<b.max.x+r&&p.z>b.min.z-r&&p.z<b.max.z+r){const l=p.x-(b.min.x-r),h=b.max.x+r-p.x,n=p.z-(b.min.z-r),f=b.max.z+r-p.z,m=Math.min(l,h,n,f);if(m===l)p.x=b.min.x-r;else if(m===h)p.x=b.max.x+r;else if(m===n)p.z=b.min.z-r;else p.z=b.max.z+r}}}
function step(dt){fw.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw));rt.set(-fw.z,0,fw.x);mv.set(0,0,0);if(keys.KeyW)mv.add(fw);if(keys.KeyS)mv.sub(fw);if(keys.KeyD)mv.add(rt);if(keys.KeyA)mv.sub(rt);const moving=mv.lengthSq()>0;
 if(moving){mv.normalize().multiplyScalar(keys.ShiftLeft?8:6.2);P.pos.addScaledVector(mv,dt);collide(P.pos)}setAnim(moving?'Run':'Idle');
 fireT-=dt;if(firing&&fireT<=0&&live)shoot();invuln-=dt;
 for(const s of shards){if(!s.on)continue;s.m.rotation.y+=dt*2;s.m.position.y=1.15+Math.sin(performance.now()*.003+s.g.position.x)*.12;if(s.g.position.distanceTo(P.pos)<1.35)pickup(s)}
 spawnT-=dt;if(phase==='build'&&spawnT<=0&&enemies.filter(e=>!e.dead).length<2+Math.min(round,2)){spawnEnemy();spawnT=3.5}
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];e.mx.update(dt);if(e.dead){e.o.scale.multiplyScalar(1-dt*6);if(e.o.scale.x<.1){scene.remove(e.o);enemies.splice(i,1)}continue}const to=rv.copy(P.pos).sub(e.o.position);to.y=0;const d=to.length();e.o.rotation.y=Math.atan2(to.x,to.z);if(d>1.3){e.o.position.addScaledVector(to.normalize(),(3+round*.25)*dt);collide(e.o.position,.35)}else{e.cool-=dt;if(e.cool<=0){e.cool=1;hurt(1)}}}
 if(boss){boss.mx.update(dt);const to=rv.copy(P.pos).sub(boss.o.position);to.y=0;const d=to.length();boss.o.rotation.y=Math.atan2(to.x,to.z);if(boss.open){if(d>2.6)boss.o.position.addScaledVector(to.normalize(),2.6*dt);else{boss.cool-=dt;if(boss.cool<=0){boss.cool=1.1;hurt(2)}}}else boss.shield.material.opacity=.16+Math.sin(performance.now()*.004)*.05}
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t-=dt;if(f.tr){if(f.t<=0){scene.remove(f.tr);f.tr.geometry.dispose();f.tr.material.dispose();fx.splice(i,1)}continue}f.v.y-=14*dt;f.s.position.addScaledVector(f.v,dt);if(f.t<=0){scene.remove(f.s);fx.splice(i,1)}}
 if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0}}
function camera(dt){if(window.__g.camOv){cam.position.copy(window.__g.camOv[0]);cam.lookAt(window.__g.camOv[1]);return}const yw=P.yaw,sx=.78,back=2.9,up=1.6;P.rec=Math.max(0,P.rec-dt*9);rt.set(Math.cos(yw),0,-Math.sin(yw));fw.set(-Math.sin(yw)*Math.cos(P.pitch),Math.sin(P.pitch),-Math.cos(yw)*Math.cos(P.pitch));camT.copy(P.pos).setY(up).addScaledVector(rt,sx).addScaledVector(fw,-back);camT.x=THREE.MathUtils.clamp(camT.x,-ARENA+.4,ARENA-.4);camT.z=THREE.MathUtils.clamp(camT.z,-ARENA+.4,ARENA-.4);camT.y=Math.max(.4,camT.y);for(const b of solids)if(b.containsPoint(camT))camT.y=b.max.y+.3;cam.position.lerp(camT,1-Math.exp(-dt*22));cam.lookAt(camT.clone().addScaledVector(fw,10));cam.rotateX(P.rec*.006)}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);if(live||Q.has('demo'))step(dt);hero.position.copy(P.pos);hero.rotation.y=P.yaw+Math.PI;P.mixer.update(dt);aimPose();muzzle.scale.multiplyScalar(.55);flash.intensity*=.6;camera(dt);comp.render();
 ft+=dt;fc++;if(fc===90){const avg=ft/fc;if(avg>.03&&pr>.8){pr=Math.max(.8,pr-.25);renderer.setPixelRatio(pr);comp.setPixelRatio(pr);if(pr<1)renderer.shadowMap.autoUpdate=false}ft=0;fc=0}}
window.__g={camera,P,get phase(){return phase},get R0(){return R0},get bar(){return bar},shards,pylons,enemies,get boss(){return boss},shoot,pickup,step,cam,scene,lock,set live(v){live=v},aimPose,BONES,hero};

(async()=>{try{await buildWorld();await buildHero();P.pos.set(0,0,8);briefing();loop()}catch(e){console.error(e);$('box').innerHTML='<h1>Не загрузилось</h1><p>'+e.message+'</p>'}})();
