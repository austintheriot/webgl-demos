var kt=Object.defineProperty,Ut=Object.defineProperties;var Dt=Object.getOwnPropertyDescriptors;var _t=Object.getOwnPropertySymbols;var Pt=Object.prototype.hasOwnProperty,It=Object.prototype.propertyIsEnumerable;var ft=(n,a,e)=>a in n?kt(n,a,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[a]=e,d=(n,a)=>{for(var e in a||(a={}))Pt.call(a,e)&&ft(n,e,a[e]);if(_t)for(var e of _t(a))It.call(a,e)&&ft(n,e,a[e]);return n},c=(n,a)=>Ut(n,Dt(a));import{c as p,e as Xt,a as b,b as Ot,d as Zt,m as r,f as Z,r as Vt}from"./index.b6be8b9a.js";var Ht=`#version 300 es

precision highp float;

out vec4 o_color;
 
void main() {
  o_color = vec4(1., 0.75, 0.5, 0.35);
}`,jt=`#version 300 es

precision highp float;

layout (location = 0) in vec3 i_position;

uniform mat4 u_matrix;

void main() {
  // transform position using matrix transformation
  gl_Position = u_matrix * vec4(i_position, 1.0);

  gl_PointSize = 1.0;
}`,Gt=`#version 300 es

precision highp float;

out vec4 o_color;

// this shader is thrown away
void main() {
  o_color = vec4(1.0);
}`,Wt=`#version 300 es

layout(location = 0) in vec3 i_position;

// saved in transform feedback buffer
out vec3 o_position;

uniform float u_speed;

// interpolation factors
uniform float lorenz_multiplier;
uniform float arneodo_multiplier;
uniform float burke_shaw_multiplier;
uniform float chen_lee_multiplier;
uniform float aizawa_multiplier;
uniform float thomas_multiplier;
uniform float lorenz_mod_2_multiplier;
uniform float hadley_multiplier;
uniform float halvorsen_multiplier;
uniform float three_scrolls_multiplier;
uniform float coullet_multiplier;
uniform float dadras_multiplier;

void main() {
  // extract inidividual values for cleaner math below
  float x = i_position.x;
  float y = i_position.y;
  float z = i_position.z;

  // each attractor has it's own "sweet spot" time delta
  float dt;

  // constants used in attractor formulas
  float a;
  float b;
  float c;
  float d;
  float f;
  float g;

  vec3 temp_delta = vec3(0.);
  vec3 total_delta = vec3(0.);

  // lorenz attractor ///////////////////////////////////////////////////////////////////
  dt = 0.005 * u_speed;
  a = 10.;
  b = 28.;
  c = 8. / 3.;

  temp_delta.x += dt * (a * (y - x));
  temp_delta.y += dt * (x * (b - z) - y);
  temp_delta.z += dt * (x * y - c * z);
  total_delta += temp_delta * lorenz_multiplier;

  // arneodo attractor ///////////////////////////////////////////////////////////////////
  dt = 0.015 * u_speed;
  a = -5.5;
  b = 3.5;
  c = -1.;

  temp_delta.x = dt * y;
  temp_delta.y = dt * z;
  temp_delta.z = dt * (-a * x - b * y - z + c * (x * x * x));
  total_delta += temp_delta * arneodo_multiplier;

  // burke-shaw attractor ///////////////////////////////////////////////////////////////////
  dt = 0.003 * u_speed;
  a = 10.;
  b = 4.272;

  temp_delta.x = dt * (-a * (x + y));
  temp_delta.y = dt * (-y - a * x * z);
  temp_delta.z = dt * (a * x * y + b);
  total_delta += temp_delta * burke_shaw_multiplier;

  // chen-lee attractor ///////////////////////////////////////////////////////////////////
  dt = 0.002 * u_speed;
  a = 5.;
  b = -10.;
  c = -0.38;

  temp_delta.x = dt * (a * x - y * z);
  temp_delta.y = dt * (b * y + x * z);
  temp_delta.z = dt * (c * z + x * (y / 3.));
  total_delta += temp_delta * chen_lee_multiplier;

  // aizawa attractor ///////////////////////////////////////////////////////////////////
  dt = 0.01 * u_speed;
  a = 0.95;
  b = 0.7;
  c = 0.1;
  d = 3.5;
  f = 0.25;
  g = 0.6;

  temp_delta.x = dt * ((z - b) * x - d * y);
  temp_delta.y = dt * (d * x + (z - b) * y);
  temp_delta.z = dt * (g + a * z - (z * z * z) / 3. - (x * x + y * y) * (1. + f * z) + c * z * (x * x * x));
  total_delta += temp_delta * aizawa_multiplier;

  // thomas attractor ///////////////////////////////////////////////////////////////////
  dt = 0.05 * u_speed;
  a = 0.19;

  temp_delta.x = dt * (-a * x + sin(y));
  temp_delta.y = dt * (-a * y + sin(z));
  temp_delta.z = dt * (-a * z + sin(x));
  total_delta += temp_delta * thomas_multiplier;

  // lorenz mod2 attractor ///////////////////////////////////////////////////////////////////
  dt = 0.005 * u_speed;
  a = 0.9;
  b = 5.;
  c = 9.9;
  d = 1.;

  temp_delta.x = dt * (-a * x + (y * y) - (z * z) + a * c);
  temp_delta.y = dt * (x * (y - b * z) + d);
  temp_delta.z = dt * (-z + x * (b * y + z));
  total_delta += temp_delta * lorenz_mod_2_multiplier;

  // hadley attractor ///////////////////////////////////////////////////////////////////
  dt = 0.005 * u_speed;
  a = 0.2;
  b = 4.;
  c = 8.;
  d = 1.;

  temp_delta.x = dt * (-(y * y) - (z * z) - a * x + a * c);
  temp_delta.y = dt * (x * y - b * x * z - y + d);
  temp_delta.z = dt * (b * x * y + x * z - z);
  total_delta += temp_delta * hadley_multiplier;

  // halvorsen attractor ///////////////////////////////////////////////////////////////////
  dt = 0.005 * u_speed;
  a = 1.4;

  temp_delta.x = dt * (-a * x - 4. * y - 4. * z - y * y);
  temp_delta.y = dt * (-a * y - 4. * z - 4. * x - z * z);
  temp_delta.z = dt * (-a * z - 4. * x - 4. * y - x * x);
  total_delta += temp_delta * halvorsen_multiplier;

  // Three-Scroll Unified chaotic System attractor ////////////////////////////////////////
  dt = 0.002 * u_speed;
  a = 40.;
  b = 0.833;
  c = 20.;
  d = 0.5;
  f = 0.65;

  temp_delta.x = dt * (a * (y - x) + d * x * z);
  temp_delta.y = dt * (c * y - x * z);
  temp_delta.z = dt * (b * z + x * y - f * (x * x));
  total_delta += temp_delta * three_scrolls_multiplier;

  // coullet attractor ///////////////////////////////////////////////////////////////////
  dt = 0.04 * u_speed;
  a = 0.8;
  b = -1.1;
  c = -0.45;
  d = -1.;

  temp_delta.x = dt * (y);
  temp_delta.y = dt * (z);
  temp_delta.z = dt * (a * x + b * y + c * z + d * (x * x * x));
  total_delta += temp_delta * coullet_multiplier;

  // dadras attractor ///////////////////////////////////////////////////////////////////
  dt = 0.01 * u_speed;
  a = 3.;
  b = 2.7;
  c = 1.7;
  d = 2.;
  f = 9.;

  temp_delta.x = dt * (y - a * x + b * y * z);
  temp_delta.y = dt * (c * y - x * z + z);
  temp_delta.z = dt * (d * x * y - f * z);
  total_delta += temp_delta * dadras_multiplier;

  // update position
  vec3 updated_position = i_position + total_delta;

  o_position = updated_position;
}`;const g=1e5,Kt=Z(-60),$t=Z(60),l={rotateX:0,rotateY:0,rotateZ:0,translateZ:-100,speed:1.5,lorenzMultiplier:1,arneodoMultiplier:0,burkeShawMultiplier:0,chenLeeMultiplier:0,aizawaMultiplier:0,thomasMultiplier:0,lorenzMod2Multiplier:0,hadleyMultiplier:0,halvorsenMultiplier:0,threeScrollMultiplier:0,coulletMultiplier:0,dadrasMultiplier:0};let Jt=0,Qt=0,te=0,ee=0,ne=0,le=10,ae=1,oe=1,re=1,h=l.rotateX,y=l.rotateY,ht=l.rotateZ,ie=0,ue=0,M=l.translateZ,se=0,de=0,ce=0,pe=Z(60),me=.1,_e=2e3,t,i,V,yt,s=r.createIdentityMatrix(),S,z,St,xt,vt,bt,gt,Mt,zt,At,Ct,wt,Rt,Lt,Et,Tt,H,j,G,W,A=!1,K,C=l.speed,w=l.lorenzMultiplier,R=l.arneodoMultiplier,L=l.burkeShawMultiplier,E=l.chenLeeMultiplier,T=l.aizawaMultiplier,F=l.thomasMultiplier,N=l.lorenzMod2Multiplier,q=l.hadleyMultiplier,B=l.halvorsenMultiplier,Y=l.threeScrollMultiplier,k=l.coulletMultiplier,U=l.dadrasMultiplier;const _=document.querySelector("canvas"),fe=document.querySelector("#reset-particles"),he=document.querySelector("#reset-everything"),ye=document.querySelector("#save-image"),Ft=document.querySelector("#loading"),Se=document.querySelector(".input-container"),$=p({label:"Speed",type:"range",min:0,max:10,step:1e-4,className:"margin-bottom",initialValue:C,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),C=e}}),m={type:"range",min:0,max:10,step:.001},J=p(c(d({},m),{label:"Lorenz",initialValue:w,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),w=e}})),Q=p(c(d({},m),{label:"Arneodo",initialValue:R,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),R=e}})),tt=p(c(d({},m),{label:"Burke-Shaw",initialValue:L,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),L=e}})),et=p(c(d({},m),{label:"Chen-Lee",initialValue:E,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),E=e}})),nt=p(c(d({},m),{label:"Aizawa",initialValue:T,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),T=e}})),lt=p(c(d({},m),{label:"Thomas",initialValue:F,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),F=e}})),at=p(c(d({},m),{label:"Lorenz Mod 2",initialValue:N,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),N=e}})),ot=p(c(d({},m),{label:"Hadley",initialValue:q,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),q=e}})),rt=p(c(d({},m),{label:"Halvorsen",initialValue:B,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),B=e}})),it=p(c(d({},m),{label:"Three-Scroll Unified Chaotic System",initialValue:Y,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),Y=e}})),ut=p(c(d({},m),{label:"Coullet",initialValue:k,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),k=e}})),st=p(c(d({},m),{label:"Dadras",initialValue:U,oninput:(n,a)=>{const e=n.target.valueAsNumber;a&&(a.textContent=e.toString()),U=e}}));Se.append($,J,Q,tt,et,nt,lt,at,ot,rt,it,ut,st);const Nt=()=>{h=l.rotateX,y=l.rotateY,ht=l.rotateZ,M=l.translateZ,C=l.speed,w=l.lorenzMultiplier,R=l.arneodoMultiplier,L=l.burkeShawMultiplier,E=l.chenLeeMultiplier,T=l.aizawaMultiplier,F=l.thomasMultiplier,N=l.lorenzMod2Multiplier,q=l.hadleyMultiplier,B=l.halvorsenMultiplier,Y=l.threeScrollMultiplier,k=l.coulletMultiplier,U=l.dadrasMultiplier},qt=()=>{$.querySelector("input").value=l.speed.toString(),J.querySelector("input").value=l.lorenzMultiplier.toString(),Q.querySelector("input").value=l.arneodoMultiplier.toString(),tt.querySelector("input").value=l.burkeShawMultiplier.toString(),et.querySelector("input").value=l.chenLeeMultiplier.toString(),nt.querySelector("input").value=l.aizawaMultiplier.toString(),lt.querySelector("input").value=l.thomasMultiplier.toString(),at.querySelector("input").value=l.lorenzMod2Multiplier.toString(),ot.querySelector("input").value=l.hadleyMultiplier.toString(),rt.querySelector("input").value=l.halvorsenMultiplier.toString(),it.querySelector("input").value=l.threeScrollMultiplier.toString(),ut.querySelector("input").value=l.coulletMultiplier.toString(),st.querySelector("input").value=l.dadrasMultiplier.toString(),$.querySelector("p").textContent=l.speed.toString(),J.querySelector("p").textContent=l.lorenzMultiplier.toString(),Q.querySelector("p").textContent=l.arneodoMultiplier.toString(),tt.querySelector("p").textContent=l.burkeShawMultiplier.toString(),et.querySelector("p").textContent=l.chenLeeMultiplier.toString(),nt.querySelector("p").textContent=l.aizawaMultiplier.toString(),lt.querySelector("p").textContent=l.thomasMultiplier.toString(),at.querySelector("p").textContent=l.lorenzMod2Multiplier.toString(),ot.querySelector("p").textContent=l.hadleyMultiplier.toString(),rt.querySelector("p").textContent=l.halvorsenMultiplier.toString(),it.querySelector("p").textContent=l.threeScrollMultiplier.toString(),ut.querySelector("p").textContent=l.coulletMultiplier.toString(),st.querySelector("p").textContent=l.dadrasMultiplier.toString()},dt=(n,a,e)=>{const o=n.createBuffer();if(!o)throw new Error("error creating buffer");return n.bindBuffer(n.ARRAY_BUFFER,o),n.bufferData(n.ARRAY_BUFFER,a,e!==void 0?e:n.STATIC_DRAW),n.bindBuffer(n.ARRAY_BUFFER,null),o},xe=function(){const n=S;S=z,z=n},ve=async()=>{if(t=_.getContext("webgl2"),!t)throw Xt("WebGL not supported",{gl:t});Nt(),qt(),ge(),K=new Float32Array(Array.from({length:g*3},()=>2*Math.random()-1));try{const n=b(t,t.VERTEX_SHADER,Wt),a=b(t,t.FRAGMENT_SHADER,Gt);i=Ot(t,n,a,["o_position"]),yt=t.createTransformFeedback();const e=b(t,t.VERTEX_SHADER,jt),o=b(t,t.FRAGMENT_SHADER,Ht);V=Zt(t,e,o)}catch(n){console.error(n),Ft.textContent=`Error occurred: ${n}`}xt=t.getUniformLocation(i,"u_speed"),vt=t.getUniformLocation(i,"lorenz_multiplier"),bt=t.getUniformLocation(i,"arneodo_multiplier"),gt=t.getUniformLocation(i,"burke_shaw_multiplier"),Mt=t.getUniformLocation(i,"chen_lee_multiplier"),zt=t.getUniformLocation(i,"aizawa_multiplier"),At=t.getUniformLocation(i,"thomas_multiplier"),Ct=t.getUniformLocation(i,"lorenz_mod_2_multiplier"),wt=t.getUniformLocation(i,"hadley_multiplier"),Rt=t.getUniformLocation(i,"halvorsen_multiplier"),Lt=t.getUniformLocation(i,"three_scrolls_multiplier"),Et=t.getUniformLocation(i,"coullet_multiplier"),Tt=t.getUniformLocation(i,"dadras_multiplier"),St=t.getUniformLocation(V,"u_matrix"),S=dt(t,K,t.DYNAMIC_COPY),z=dt(t,new Float32Array(g*3),t.DYNAMIC_COPY),f(),Ft.remove(),Yt()},f=()=>{s=r.createPerspectiveMatrix(pe,t.canvas.clientWidth/t.canvas.clientHeight,me,_e),s=r.translate(s,ie,ue,M),s=r.rotateX(s,h),s=r.rotateY(s,y),s=r.rotateZ(s,ht),s=r.scale(s,ae,oe,re),s=r.translate(s,se,de,ce)},ct=()=>{t.useProgram(i),t.uniform1f(xt,C),t.uniform1f(vt,w),t.uniform1f(bt,R),t.uniform1f(gt,L),t.uniform1f(Mt,E),t.uniform1f(zt,T),t.uniform1f(At,F),t.uniform1f(Ct,N),t.uniform1f(wt,q),t.uniform1f(Rt,B),t.uniform1f(Lt,Y),t.uniform1f(Et,k),t.uniform1f(Tt,U),[S].forEach((o,u)=>{t.bindBuffer(t.ARRAY_BUFFER,o),t.enableVertexAttribArray(u),t.vertexAttribPointer(u,3,t.FLOAT,!1,0,0)}),t.bindTransformFeedback(t.TRANSFORM_FEEDBACK,yt),t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER,0,z),t.enable(t.RASTERIZER_DISCARD),t.beginTransformFeedback(t.POINTS),t.drawArrays(t.POINTS,0,g),t.disable(t.RASTERIZER_DISCARD),t.endTransformFeedback(),t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER,0,null),xe(),t.useProgram(V),Vt(t.canvas),t.viewport(0,0,t.canvas.width,t.canvas.height),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.blendFunc(t.SRC_ALPHA,t.ONE),t.enable(t.BLEND),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),[S].forEach((o,u)=>{t.bindBuffer(t.ARRAY_BUFFER,o),t.enableVertexAttribArray(u),t.vertexAttribPointer(u,3,t.FLOAT,!1,0,0)});let n=r.createIdentityMatrix();n=r.rotateY(n,Qt),n=r.rotateX(n,Jt),n=r.rotateZ(n,te),n=r.translate(n,ee,ne,le);const a=r.inverse(n),e=r.multiply(s,a);t.uniformMatrix4fv(St,!1,e),t.drawArrays(t.POINTS,0,g)},Bt=()=>{S=dt(t,K,t.DYNAMIC_COPY)},be=()=>{Bt(),Nt(),qt(),f()},Yt=()=>{ct(),requestAnimationFrame(Yt)},D=n=>{n<0?h=Math.max(h+n,Kt):h=Math.min(h+n,$t)},ge=()=>{window.addEventListener("resize",f),window.addEventListener("keydown",e=>{let o=!1;switch(e.key){case"w":D(-.05),o=!0;break;case"a":y+=.05,o=!0;break;case"s":D(.05),o=!0;break;case"d":y-=.05,o=!0;break}o&&(f(),ct())}),_.ontouchstart=e=>{var o,u;j=(o=e.touches[0])==null?void 0:o.clientY,H=(u=e.touches[0])==null?void 0:u.clientX},_.ontouchmove=e=>{var pt,mt;const{width:o,height:u}=_.getBoundingClientRect(),x=(pt=e.touches[0])==null?void 0:pt.clientX,v=(mt=e.touches[0])==null?void 0:mt.clientY,P=x-H,I=v-j;H=x,j=v;const X=P/o,O=I/u;y-=X*5,D(-O*5),f()},_.onmousedown=e=>{A=!0,G=e.clientX,W=e.clientY},_.onmousemove=e=>{if(!A)return;const{width:o,height:u}=_.getBoundingClientRect(),x=e.clientX,v=e.clientY,P=x-G,I=v-W;G=x,W=v;const X=P/o,O=I/u;y-=X*5,D(-O*5),f()},_.onmouseup=()=>A=!1,_.onmouseleave=()=>A=!1,_.addEventListener("wheel",e=>{e.preventDefault();const o=.01;e.deltaY<0?M*=1-o:M*=1+o,f()}),fe.onclick=Bt,he.onclick=be;const n=document.createElement("a");document.body.appendChild(n),n.style.display="none";const a=(e,o)=>{if(!e)return;const u=window.URL.createObjectURL(e);n.href=u,n.download=o,n.click()};ye.onclick=()=>{ct(),_.toBlob(e=>{a(e,"particles.png")})}};ve();
