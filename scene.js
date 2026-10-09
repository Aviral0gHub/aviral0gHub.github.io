import * as THREE from './vendor/three.module.min.js';
const host=document.getElementById('scene'),slider=document.getElementById('spread'),pause=document.getElementById('pause');
const motion=matchMedia('(prefers-reduced-motion: reduce)');let paused=motion.matches,drag=false,lastX=0,lastY=0,visible=true,frame=0;
pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Play':'Pause';
try{
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.3,8.4);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0xe6dfd2,0);host.prepend(renderer.domElement);host.classList.add('live');
renderer.domElement.setAttribute('aria-label','Abstract layered sculpture. Drag to rotate; use the slider to separate layers.');renderer.domElement.setAttribute('role','img');
scene.add(new THREE.HemisphereLight(0xffffff,0x7f6e61,2.5));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);const fill=new THREE.DirectionalLight(0xb8c7ff,1.7);fill.position.set(-4,1,-2);scene.add(fill);
const sculpture=new THREE.Group();scene.add(sculpture);sculpture.rotation.set(.35,-.3,.25);
const material=new THREE.MeshStandardMaterial({color:0x143ccc,metalness:.45,roughness:.31});const layers=[];
for(let i=0;i<9;i++){const r=Math.sqrt(1-Math.pow((i-4)/5,2))*1.45;const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,.055,12,100),material);mesh.rotation.x=Math.PI/2;sculpture.add(mesh);layers.push(mesh)}
const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.5,1),new THREE.MeshStandardMaterial({color:0xf0442d,metalness:.2,roughness:.52,flatShading:true}));sculpture.add(core);
const orbit=new THREE.Mesh(new THREE.TorusGeometry(1.76,.014,8,120),new THREE.MeshStandardMaterial({color:0x11110f,roughness:.5}));orbit.rotation.x=.3;orbit.rotation.y=.6;sculpture.add(orbit);
const orbitMarker=new THREE.Mesh(new THREE.SphereGeometry(.075,16,12),new THREE.MeshBasicMaterial({color:0xf0442d}));orbitMarker.position.set(1.76,0,0);orbit.add(orbitMarker);
function positionLayers(){const s=Number(slider.value)/100;layers.forEach((m,i)=>{m.position.y=(i-4)*(.21+s*.19);m.rotation.z=(i-4)*s*.18})}positionLayers();
function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);render()}
function render(){renderer.render(scene,camera)}
function sceneTheme(){const dark=document.documentElement.dataset.theme==='dark';material.color.setHex(dark?0x7895ff:0x143ccc);core.material.color.setHex(dark?0xff654f:0xf0442d);orbit.material.color.setHex(dark?0xf0eadc:0x11110f);orbitMarker.material.color.setHex(dark?0xff654f:0xf0442d);render()}window.addEventListener('theme-change',sceneTheme);sceneTheme();
function eligible(){return !paused&&visible&&!document.hidden&&document.getElementById('overview').classList.contains('active')}
function tick(){frame=0;if(!eligible())return;if(!drag)sculpture.rotation.y+=.004;core.rotation.x+=.003;render();frame=requestAnimationFrame(tick)}
function schedule(){if(frame){cancelAnimationFrame(frame);frame=0}if(eligible())frame=requestAnimationFrame(tick);else render()}
const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag)return;sculpture.rotation.y+=(e.clientX-lastX)*.009;sculpture.rotation.x+=(e.clientY-lastY)*.005;lastX=e.clientX;lastY=e.clientY;render()});canvas.addEventListener('pointerup',()=>{drag=false});canvas.addEventListener('pointercancel',()=>{drag=false});
slider.addEventListener('input',()=>{positionLayers();render()});pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Play automatic rotation':'Pause automatic rotation');schedule()});
new ResizeObserver(resize).observe(host);new IntersectionObserver(e=>{visible=e[0].isIntersecting;schedule()}).observe(host);document.addEventListener('visibilitychange',schedule);window.addEventListener('portfolio-view',()=>{resize();schedule()});motion.addEventListener('change',e=>{paused=e.matches;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));schedule()});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);paused=true;host.classList.remove('live');canvas.style.display='none';pause.disabled=true});resize();schedule();
}catch(error){host.classList.remove('live');pause.disabled=true;slider.disabled=true;host.querySelector('.scene-label').textContent='01 / LAYER STUDY';console.info('Static sculpture displayed: WebGL unavailable.');}
