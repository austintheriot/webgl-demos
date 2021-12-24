var ge=Object.defineProperty,Me=Object.defineProperties;var ve=Object.getOwnPropertyDescriptors;var Gt=Object.getOwnPropertySymbols;var be=Object.prototype.hasOwnProperty,ze=Object.prototype.propertyIsEnumerable;var $t=(t,n,e)=>n in t?ge(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e,z=(t,n)=>{for(var e in n||(n={}))be.call(n,e)&&$t(t,e,n[e]);if(Gt)for(var e of Gt(n))ze.call(n,e)&&$t(t,e,n[e]);return t},A=(t,n)=>Me(t,ve(n));const Ae=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function e(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerpolicy&&(i.referrerPolicy=a.referrerpolicy),a.crossorigin==="use-credentials"?i.credentials="include":a.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(a){if(a.ep)return;a.ep=!0;const i=e(a);fetch(a.href,i)}};Ae();const rt=(t,n)=>(console.error(t,n),new Error(t)),ot=(t,n,e)=>{const o=t.createShader(n);if(!o)throw rt("error creating shader",{shader:o});if(t.shaderSource(o,e),t.compileShader(o),t.getShaderParameter(o,t.COMPILE_STATUS))return o;const i=t.getShaderInfoLog(o)||"Failed to create shader";throw t.deleteShader(o),new Error(i)},we=(t,n,e,o)=>{const a=t.createProgram();if(!a)throw rt("error creating program",{program:a});if(t.attachShader(a,n),t.attachShader(a,e),o.length>0&&t.transformFeedbackVaryings(a,o,t.INTERLEAVED_ATTRIBS),t.linkProgram(a),t.getProgramParameter(a,t.LINK_STATUS))return a;const c=t.getProgramInfoLog(a)||"Failed to create program";throw t.deleteProgram(a),new Error(c)},Ee=(t,n,e)=>{const o=t.createProgram();if(!o)throw rt("error creating program",{program:o});if(t.attachShader(o,n),t.attachShader(o,e),t.linkProgram(o),t.getProgramParameter(o,t.LINK_STATUS))return o;const i=t.getProgramInfoLog(o)||"Failed to create program";throw t.deleteProgram(o),new Error(i)},Le=t=>{const n=t.clientWidth,e=t.clientHeight,o=t.width!==n||t.height!==e;return o&&(t.width=n,t.height=e),o},bt=t=>t*Math.PI/180,Jt=(t,n)=>[t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]],Ce=(t,n)=>[t[0]-n[0],t[1]-n[1],t[2]-n[2]],zt=t=>{const n=Math.sqrt(t[0]**2+t[1]**2+t[2]**2);return n>1e-5?[t[0]/n,t[1]/n,t[2]/n]:[0,0,0]},u={createProjectionMatrix:function(t,n,e){return[2/t,0,0,0,0,-2/n,0,0,0,0,2/e,0,-1,1,0,1]},createIdentityMatrix:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],createTranslationMatrix:(t,n,e)=>[1,0,0,0,0,1,0,0,0,0,1,0,t,n,e,1],createXRotationMatrix:t=>{const n=Math.cos(t),e=Math.sin(t);return[1,0,0,0,0,n,e,0,0,-e,n,0,0,0,0,1]},createYRotationMatrix:t=>{const n=Math.cos(t),e=Math.sin(t);return[n,0,-e,0,0,1,0,0,e,0,n,0,0,0,0,1]},createZRotationMatrix:t=>{const n=Math.cos(t),e=Math.sin(t);return[n,e,0,0,-e,n,0,0,0,0,1,0,0,0,0,1]},createScalingMatrix:function(t,n,e){return[t,0,0,0,0,n,0,0,0,0,e,0,0,0,0,1]},createPerspectiveMatrix(t,n,e,o){const a=Math.tan(Math.PI*.5-.5*t),i=1/(e-o);return[a/n,0,0,0,0,a,0,0,0,0,(e+o)*i,-1,0,0,e*o*i*2,0]},createLookAtMatrix:(t,n,e)=>{var o=zt(Ce(t,n)),a=zt(Jt(e,o)),i=zt(Jt(o,a));return[a[0],a[1],a[2],0,i[0],i[1],i[2],0,o[0],o[1],o[2],0,t[0],t[1],t[2],1]},multiply:function(t,n){const e=4,o=n[0*e+0],a=n[0*e+1],i=n[0*e+2],c=n[0*e+3],m=n[1*e+0],f=n[1*e+1],s=n[1*e+2],d=n[1*e+3],_=n[2*e+0],p=n[2*e+1],x=n[2*e+2],S=n[2*e+3],g=n[3*e+0],M=n[3*e+1],v=n[3*e+2],C=n[3*e+3],R=t[0*e+0],T=t[0*e+1],I=t[0*e+2],F=t[0*e+3],P=t[1*e+0],N=t[1*e+1],q=t[1*e+2],Y=t[1*e+3],k=t[2*e+0],U=t[2*e+1],B=t[2*e+2],V=t[2*e+3],X=t[3*e+0],D=t[3*e+1],O=t[3*e+2],Z=t[3*e+3];return[o*R+a*P+i*k+c*X,o*T+a*N+i*U+c*D,o*I+a*q+i*B+c*O,o*F+a*Y+i*V+c*Z,m*R+f*P+s*k+d*X,m*T+f*N+s*U+d*D,m*I+f*q+s*B+d*O,m*F+f*Y+s*V+d*Z,_*R+p*P+x*k+S*X,_*T+p*N+x*U+S*D,_*I+p*q+x*B+S*O,_*F+p*Y+x*V+S*Z,g*R+M*P+v*k+C*X,g*T+M*N+v*U+C*D,g*I+M*q+v*B+C*O,g*F+M*Y+v*V+C*Z]},translate:(t,n,e,o)=>u.multiply(t,u.createTranslationMatrix(n,e,o)),scale:(t,n,e,o)=>u.multiply(t,u.createScalingMatrix(n,e,o)),rotateX:(t,n)=>u.multiply(t,u.createXRotationMatrix(n)),rotateY:(t,n)=>u.multiply(t,u.createYRotationMatrix(n)),rotateZ:(t,n)=>u.multiply(t,u.createZRotationMatrix(n)),inverse:t=>{const n=4,e=t[0*n+0],o=t[0*n+1],a=t[0*n+2],i=t[0*n+3],c=t[1*n+0],m=t[1*n+1],f=t[1*n+2],s=t[1*n+3],d=t[2*n+0],_=t[2*n+1],p=t[2*n+2],x=t[2*n+3],S=t[3*n+0],g=t[3*n+1],M=t[3*n+2],v=t[3*n+3],C=p*v,R=M*x,T=f*v,I=M*s,F=f*x,P=p*s,N=a*v,q=M*i,Y=a*x,k=p*i,U=a*s,B=f*i,V=d*g,X=S*_,D=c*g,O=S*m,Z=c*_,G=d*m,$=e*g,J=S*o,Q=e*_,tt=d*o,et=e*m,nt=c*o,Ht=C*m+I*_+F*g-(R*m+T*_+P*g),Kt=R*o+N*_+k*g-(C*o+q*_+Y*g),Wt=T*o+q*m+U*g-(I*o+N*m+B*g),jt=P*o+Y*m+B*_-(F*o+k*m+U*_),h=1/(e*Ht+c*Kt+d*Wt+S*jt);return[h*Ht,h*Kt,h*Wt,h*jt,h*(R*c+T*d+P*S-(C*c+I*d+F*S)),h*(C*e+q*d+Y*S-(R*e+N*d+k*S)),h*(I*e+N*c+B*S-(T*e+q*c+U*S)),h*(F*e+k*c+U*d-(P*e+Y*c+B*d)),h*(V*s+O*x+Z*v-(X*s+D*x+G*v)),h*(X*i+$*x+tt*v-(V*i+J*x+Q*v)),h*(D*i+J*s+et*v-(O*i+$*s+nt*v)),h*(G*i+Q*s+nt*x-(Z*i+tt*s+et*x)),h*(D*p+G*M+X*f-(Z*M+V*f+O*p)),h*(Q*M+V*a+J*p-($*p+tt*M+X*a)),h*($*f+nt*M+O*a-(et*M+D*a+J*f)),h*(et*p+Z*a+tt*f-(Q*f+nt*p+G*a))]}},w=({min:t,max:n,id:e,className:o,type:a,step:i,initialValue:c,oninput:m,label:f})=>{const s=document.createElement("input"),d=document.createElement("label"),_=document.createElement("p");if(t!==void 0&&(s.min=t.toString()),n!==void 0&&(s.max=n.toString()),o!==void 0&&(s.className=o.toString()),a!==void 0&&(s.type=a.toString()),i!==void 0&&(s.step=i.toString()),c!==void 0){const p=c.toString();s.value=p,_.textContent=p}return e!==void 0&&(s.id=e.toString()),m!==void 0&&(s.oninput=p=>m(p,_)),d.append(f,_,s),d};var Re=`#version 300 es

precision highp float;

out vec4 o_color;
 
void main() {
  o_color = vec4(1., 0.75, 0.5, 0.1);
}`,Te=`#version 300 es

precision highp float;

layout (location = 0) in vec3 i_position;

uniform mat4 u_matrix;

void main() {
  // transform position using matrix transformation
  gl_Position = u_matrix * vec4(i_position, 1.0);

  gl_PointSize = 1.0;
}`,Ie=`#version 300 es

precision highp float;

out vec4 o_color;

// this shader is thrown away
void main() {
  o_color = vec4(1.0);
}`,Fe=`#version 300 es

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
}`;const at=1e6,Pe=bt(-60),Ne=bt(60),l={rotateX:0,rotateY:0,rotateZ:0,translateZ:-100,speed:1.5,lorenzMultiplier:1,arneodoMultiplier:0,burkeShawMultiplier:0,chenLeeMultiplier:0,aizawaMultiplier:0,thomasMultiplier:0,lorenzMod2Multiplier:0,hadleyMultiplier:0,halvorsenMultiplier:0,threeScrollMultiplier:0,coulletMultiplier:0,dadrasMultiplier:0};let qe=0,Ye=0,ke=0,Ue=0,Be=0,Ve=10,Xe=1,De=1,Oe=1,K=l.rotateX,W=l.rotateY,Qt=l.rotateZ,Ze=0,He=0,lt=l.translateZ,Ke=0,We=0,je=0,Ge=bt(60),$e=.1,Je=2e3,r,y,At,te,b=u.createIdentityMatrix(),j,it,ee,ne,re,oe,ae,le,ie,ce,se,ue,de,pe,me,_e,wt,Et,Lt,Ct,ct=!1,Rt,st=l.speed,ut=l.lorenzMultiplier,dt=l.arneodoMultiplier,pt=l.burkeShawMultiplier,mt=l.chenLeeMultiplier,_t=l.aizawaMultiplier,ft=l.thomasMultiplier,ht=l.lorenzMod2Multiplier,St=l.hadleyMultiplier,yt=l.halvorsenMultiplier,xt=l.threeScrollMultiplier,gt=l.coulletMultiplier,Mt=l.dadrasMultiplier;const L=document.querySelector("canvas"),Qe=document.querySelector("#reset-particles"),tn=document.querySelector("#reset-everything"),en=document.querySelector("#save-image"),fe=document.querySelector("#loading"),nn=document.querySelector(".input-container"),Tt=w({label:"Speed",type:"range",min:0,max:10,step:1e-4,className:"margin-bottom",initialValue:st,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),st=e}}),E={type:"range",min:0,max:10,step:.001},It=w(A(z({},E),{label:"Lorenz",initialValue:ut,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),ut=e}})),Ft=w(A(z({},E),{label:"Arneodo",initialValue:dt,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),dt=e}})),Pt=w(A(z({},E),{label:"Burke-Shaw",initialValue:pt,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),pt=e}})),Nt=w(A(z({},E),{label:"Chen-Lee",initialValue:mt,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),mt=e}})),qt=w(A(z({},E),{label:"Aizawa",initialValue:_t,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),_t=e}})),Yt=w(A(z({},E),{label:"Thomas",initialValue:ft,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),ft=e}})),kt=w(A(z({},E),{label:"Lorenz Mod 2",initialValue:ht,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),ht=e}})),Ut=w(A(z({},E),{label:"Hadley",initialValue:St,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),St=e}})),Bt=w(A(z({},E),{label:"Halvorsen",initialValue:yt,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),yt=e}})),Vt=w(A(z({},E),{label:"Three-Scroll Unified Chaotic System",initialValue:xt,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),xt=e}})),Xt=w(A(z({},E),{label:"Coullet",initialValue:gt,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),gt=e}})),Dt=w(A(z({},E),{label:"Dadras",initialValue:Mt,oninput:(t,n)=>{const e=t.target.valueAsNumber;n.textContent=e.toString(),Mt=e}}));nn.append(Tt,It,Ft,Pt,Nt,qt,Yt,kt,Ut,Bt,Vt,Xt,Dt);const he=()=>{K=l.rotateX,W=l.rotateY,Qt=l.rotateZ,lt=l.translateZ,st=l.speed,ut=l.lorenzMultiplier,dt=l.arneodoMultiplier,pt=l.burkeShawMultiplier,mt=l.chenLeeMultiplier,_t=l.aizawaMultiplier,ft=l.thomasMultiplier,ht=l.lorenzMod2Multiplier,St=l.hadleyMultiplier,yt=l.halvorsenMultiplier,xt=l.threeScrollMultiplier,gt=l.coulletMultiplier,Mt=l.dadrasMultiplier},Se=()=>{Tt.querySelector("input").value=l.speed.toString(),It.querySelector("input").value=l.lorenzMultiplier.toString(),Ft.querySelector("input").value=l.arneodoMultiplier.toString(),Pt.querySelector("input").value=l.burkeShawMultiplier.toString(),Nt.querySelector("input").value=l.chenLeeMultiplier.toString(),qt.querySelector("input").value=l.aizawaMultiplier.toString(),Yt.querySelector("input").value=l.thomasMultiplier.toString(),kt.querySelector("input").value=l.lorenzMod2Multiplier.toString(),Ut.querySelector("input").value=l.hadleyMultiplier.toString(),Bt.querySelector("input").value=l.halvorsenMultiplier.toString(),Vt.querySelector("input").value=l.threeScrollMultiplier.toString(),Xt.querySelector("input").value=l.coulletMultiplier.toString(),Dt.querySelector("input").value=l.dadrasMultiplier.toString(),Tt.querySelector("p").textContent=l.speed.toString(),It.querySelector("p").textContent=l.lorenzMultiplier.toString(),Ft.querySelector("p").textContent=l.arneodoMultiplier.toString(),Pt.querySelector("p").textContent=l.burkeShawMultiplier.toString(),Nt.querySelector("p").textContent=l.chenLeeMultiplier.toString(),qt.querySelector("p").textContent=l.aizawaMultiplier.toString(),Yt.querySelector("p").textContent=l.thomasMultiplier.toString(),kt.querySelector("p").textContent=l.lorenzMod2Multiplier.toString(),Ut.querySelector("p").textContent=l.hadleyMultiplier.toString(),Bt.querySelector("p").textContent=l.halvorsenMultiplier.toString(),Vt.querySelector("p").textContent=l.threeScrollMultiplier.toString(),Xt.querySelector("p").textContent=l.coulletMultiplier.toString(),Dt.querySelector("p").textContent=l.dadrasMultiplier.toString()},Ot=(t,n,e)=>{const o=t.createBuffer();if(!o)throw new Error("error creating buffer");return t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,n,e!==void 0?e:t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,null),o},rn=function(){const t=j;j=it,it=t},on=async()=>{if(r=L.getContext("webgl2"),!r)throw rt("WebGL not supported",{gl:r});he(),Se(),ln(),Rt=new Float32Array(Array.from({length:at*3},()=>2*Math.random()-1));try{const t=ot(r,r.VERTEX_SHADER,Fe),n=ot(r,r.FRAGMENT_SHADER,Ie);y=we(r,t,n,["o_position"]),te=r.createTransformFeedback();const e=ot(r,r.VERTEX_SHADER,Te),o=ot(r,r.FRAGMENT_SHADER,Re);At=Ee(r,e,o)}catch(t){console.error(t),fe.textContent=`Error occurred: ${t}`}ne=r.getUniformLocation(y,"u_speed"),re=r.getUniformLocation(y,"lorenz_multiplier"),oe=r.getUniformLocation(y,"arneodo_multiplier"),ae=r.getUniformLocation(y,"burke_shaw_multiplier"),le=r.getUniformLocation(y,"chen_lee_multiplier"),ie=r.getUniformLocation(y,"aizawa_multiplier"),ce=r.getUniformLocation(y,"thomas_multiplier"),se=r.getUniformLocation(y,"lorenz_mod_2_multiplier"),ue=r.getUniformLocation(y,"hadley_multiplier"),de=r.getUniformLocation(y,"halvorsen_multiplier"),pe=r.getUniformLocation(y,"three_scrolls_multiplier"),me=r.getUniformLocation(y,"coullet_multiplier"),_e=r.getUniformLocation(y,"dadras_multiplier"),ee=r.getUniformLocation(At,"u_matrix"),j=Ot(r,Rt,r.DYNAMIC_COPY),it=Ot(r,new Float32Array(at*3),r.DYNAMIC_COPY),H(),fe.remove(),xe()},H=()=>{b=u.createPerspectiveMatrix(Ge,r.canvas.clientWidth/r.canvas.clientHeight,$e,Je),b=u.translate(b,Ze,He,lt),b=u.rotateX(b,K),b=u.rotateY(b,W),b=u.rotateZ(b,Qt),b=u.scale(b,Xe,De,Oe),b=u.translate(b,Ke,We,je)},Zt=()=>{r.useProgram(y),r.uniform1f(ne,st),r.uniform1f(re,ut),r.uniform1f(oe,dt),r.uniform1f(ae,pt),r.uniform1f(le,mt),r.uniform1f(ie,_t),r.uniform1f(ce,ft),r.uniform1f(se,ht),r.uniform1f(ue,St),r.uniform1f(de,yt),r.uniform1f(pe,xt),r.uniform1f(me,gt),r.uniform1f(_e,Mt),[j].forEach((o,a)=>{r.bindBuffer(r.ARRAY_BUFFER,o),r.enableVertexAttribArray(a),r.vertexAttribPointer(a,3,r.FLOAT,!1,0,0)}),r.bindTransformFeedback(r.TRANSFORM_FEEDBACK,te),r.bindBufferBase(r.TRANSFORM_FEEDBACK_BUFFER,0,it),r.enable(r.RASTERIZER_DISCARD),r.beginTransformFeedback(r.POINTS),r.drawArrays(r.POINTS,0,at),r.disable(r.RASTERIZER_DISCARD),r.endTransformFeedback(),r.bindBufferBase(r.TRANSFORM_FEEDBACK_BUFFER,0,null),rn(),r.useProgram(At),Le(r.canvas),r.viewport(0,0,r.canvas.width,r.canvas.height),r.disable(r.DEPTH_TEST),r.disable(r.CULL_FACE),r.blendFunc(r.SRC_ALPHA,r.ONE),r.enable(r.BLEND),r.clearColor(0,0,0,1),r.clear(r.COLOR_BUFFER_BIT),[j].forEach((o,a)=>{r.bindBuffer(r.ARRAY_BUFFER,o),r.enableVertexAttribArray(a),r.vertexAttribPointer(a,3,r.FLOAT,!1,0,0)});let t=u.createIdentityMatrix();t=u.rotateY(t,Ye),t=u.rotateX(t,qe),t=u.rotateZ(t,ke),t=u.translate(t,Ue,Be,Ve);const n=u.inverse(t),e=u.multiply(b,n);r.uniformMatrix4fv(ee,!1,e),r.drawArrays(r.POINTS,0,at)},ye=()=>{j=Ot(r,Rt,r.DYNAMIC_COPY)},an=()=>{ye(),he(),Se(),H()},xe=()=>{Zt(),requestAnimationFrame(xe)},vt=t=>{t<0?K=Math.max(K+t,Pe):K=Math.min(K+t,Ne)},ln=()=>{window.addEventListener("resize",H),window.addEventListener("keydown",e=>{let o=!1;switch(e.key){case"w":vt(-.05),o=!0;break;case"a":W+=.05,o=!0;break;case"s":vt(.05),o=!0;break;case"d":W-=.05,o=!0;break}o&&(H(),Zt())}),L.ontouchstart=e=>{var o,a;Et=(o=e.touches[0])==null?void 0:o.clientY,wt=(a=e.touches[0])==null?void 0:a.clientX},L.ontouchmove=e=>{var _,p;const{width:o,height:a}=L.getBoundingClientRect(),i=(_=e.touches[0])==null?void 0:_.clientX,c=(p=e.touches[0])==null?void 0:p.clientY,m=i-wt,f=c-Et;wt=i,Et=c;const s=m/o,d=f/a;W-=s*5,vt(-d*5),H()},L.onmousedown=e=>{ct=!0,Lt=e.clientX,Ct=e.clientY},L.onmousemove=e=>{if(!ct)return;const{width:o,height:a}=L.getBoundingClientRect(),i=e.clientX,c=e.clientY,m=i-Lt,f=c-Ct;Lt=i,Ct=c;const s=m/o,d=f/a;W-=s*5,vt(-d*5),H()},L.onmouseup=()=>ct=!1,L.onmouseleave=()=>ct=!1,L.addEventListener("wheel",e=>{e.preventDefault();const o=.01;e.deltaY<0?lt*=1-o:lt*=1+o,H()}),Qe.onclick=ye,tn.onclick=an;const t=document.createElement("a");document.body.appendChild(t),t.style.display="none";const n=(e,o)=>{if(!e)return;const a=window.URL.createObjectURL(e);t.href=a,t.download=o,t.click()};en.onclick=()=>{Zt(),L.toBlob(e=>{n(e,"particles.png")})}};on();
