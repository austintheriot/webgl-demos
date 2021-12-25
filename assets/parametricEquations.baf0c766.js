var pe=Object.defineProperty,ge=Object.defineProperties;var _e=Object.getOwnPropertyDescriptors;var $=Object.getOwnPropertySymbols;var be=Object.prototype.hasOwnProperty,Se=Object.prototype.propertyIsEnumerable;var J=(e,r,n)=>r in e?pe(e,r,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[r]=n,f=(e,r)=>{for(var n in r||(r={}))be.call(r,n)&&J(e,n,r[n]);if($)for(var n of $(r))Se.call(r,n)&&J(e,n,r[n]);return e},v=(e,r)=>ge(e,_e(r));import{c as p,e as ye,a as K,d as he,m as i,f as q,r as xe}from"./index.b6be8b9a.js";var Ae=`#version 300 es

precision highp float;

out vec4 o_color;
 
void main() {
  o_color = vec4(1., 0.75, 0.5, 0.1);
}`,Ce=`#version 300 es

precision highp float;

layout(location = 0) in float i_index;

uniform mat4 u_matrix;
uniform float u_t;
uniform float u_a;
uniform float u_b;
uniform float u_c;
uniform float u_d;
uniform float u_e;
uniform float u_f;

void main() {
  float x = cos(u_a * i_index) + sin(u_b * i_index);
  float y = cos(u_c * i_index) + sin(u_d * i_index);
  float z = cos(u_e * i_index) + sin(u_f * i_index);

  // transform position using matrix transformation
  gl_Position = u_matrix * vec4(x, y, z, 1.0);

  gl_PointSize = 1.0;
}`;const Q=1e6,Ee=100,Re=q(-60),Ie=q(60),o={rotateX:0,rotateY:0,rotateZ:0,translateZ:-5,a:2,b:3,c:2,d:3.001,e:1,f:1};let Le=0,Te=0,Ye=0,we=0,Xe=0,Ne=1,qe=1,Be=1,Fe=1,g=o.rotateX,_=o.rotateY,ee=o.rotateZ,Ve=0,Ue=0,I=o.translateZ,De=0,Me=0,Pe=0,Ze=q(60),ke=.1,Oe=2e3,u=!0,t,d,l=i.createIdentityMatrix(),te,ne,re,oe,ae,ie,le,ue,B,F,V,U,L=!1,ce,h=o.a,x=o.b,A=o.c,C=o.d,E=o.e,R=o.f;const s=document.querySelector("canvas"),ze=document.querySelector("#reset-everything"),je=document.querySelector("#reset-camera"),He=document.querySelector("#save-image"),se=document.querySelector("#toggle-menu-button"),Ge=document.querySelector("#reset-to-1"),de=document.querySelector("#message"),D=document.querySelector(".input-container"),b={type:"number",min:0,max:10,step:.001},M=p(v(f({},b),{label:"a",initialValue:h,useCurrentValueIndicator:!1,oninput:e=>{h=e.target.valueAsNumber,u=!0}})),P=p(v(f({},b),{label:"b",initialValue:x,useCurrentValueIndicator:!1,oninput:e=>{x=e.target.valueAsNumber,u=!0}})),Z=p(v(f({},b),{label:"c",initialValue:A,useCurrentValueIndicator:!1,oninput:e=>{A=e.target.valueAsNumber,u=!0}})),k=p(v(f({},b),{label:"d",initialValue:C,useCurrentValueIndicator:!1,oninput:e=>{C=e.target.valueAsNumber,u=!0}})),O=p(v(f({},b),{label:"e",initialValue:E,useCurrentValueIndicator:!1,oninput:e=>{E=e.target.valueAsNumber,u=!0}})),z=p(v(f({},b),{label:"f",initialValue:R,useCurrentValueIndicator:!1,oninput:e=>{R=e.target.valueAsNumber,u=!0}}));D.append(M,P,Z,k,O,z);const We=()=>{h=1,x=1,A=1,C=1,E=1,R=1,M.querySelector("input").value="1",P.querySelector("input").value="1",Z.querySelector("input").value="1",k.querySelector("input").value="1",O.querySelector("input").value="1",z.querySelector("input").value="1",u=!0},j=()=>{g=o.rotateX,_=o.rotateY,ee=o.rotateZ,I=o.translateZ,m()},me=()=>{h=o.a,x=o.b,A=o.c,C=o.d,E=o.e,R=o.f,u=!0},fe=()=>{M.querySelector("input").value=o.a.toString(),P.querySelector("input").value=o.b.toString(),Z.querySelector("input").value=o.c.toString(),k.querySelector("input").value=o.d.toString(),O.querySelector("input").value=o.e.toString(),z.querySelector("input").value=o.f.toString(),u=!0},$e=(e,r,n)=>{const a=e.createBuffer();if(!a)throw new Error("error creating buffer");return e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,r,n!==void 0?n:e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,null),a},Je=async()=>{if(t=s.getContext("webgl2"),!t)throw ye("WebGL not supported",{gl:t});j(),me(),fe(),Qe(),ce=new Float32Array(Array.from({length:Q},(e,r)=>r/Ee));try{const e=K(t,t.VERTEX_SHADER,Ce),r=K(t,t.FRAGMENT_SHADER,Ae);d=he(t,e,r)}catch(e){console.error(e),de.textContent=`Error occurred: ${e}`}ne=t.getUniformLocation(d,"u_matrix"),re=t.getUniformLocation(d,"u_a"),oe=t.getUniformLocation(d,"u_b"),ae=t.getUniformLocation(d,"u_c"),ie=t.getUniformLocation(d,"u_d"),le=t.getUniformLocation(d,"u_e"),ue=t.getUniformLocation(d,"u_f"),te=$e(t,ce,t.DYNAMIC_COPY),m(),de.remove(),ve()},m=()=>{u=!0,l=i.createPerspectiveMatrix(Ze,t.canvas.clientWidth/t.canvas.clientHeight,ke,Oe),l=i.translate(l,Ve,Ue,I),l=i.rotateX(l,g),l=i.rotateY(l,_),l=i.rotateZ(l,ee),l=i.scale(l,qe,Be,Fe),l=i.translate(l,De,Me,Pe)},H=()=>{u=!1,t.useProgram(d),xe(t.canvas),t.viewport(0,0,t.canvas.width,t.canvas.height),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.blendFunc(t.SRC_ALPHA,t.ONE),t.enable(t.BLEND),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.uniform1f(re,h),t.uniform1f(oe,x),t.uniform1f(ae,A),t.uniform1f(ie,C),t.uniform1f(le,E),t.uniform1f(ue,R),[te].forEach((a,c)=>{t.bindBuffer(t.ARRAY_BUFFER,a),t.enableVertexAttribArray(c),t.vertexAttribPointer(c,1,t.FLOAT,!1,0,0)});let e=i.createIdentityMatrix();e=i.rotateY(e,Te),e=i.rotateX(e,Le),e=i.rotateZ(e,Ye),e=i.translate(e,we,Xe,Ne);const r=i.inverse(e),n=i.multiply(l,r);t.uniformMatrix4fv(ne,!1,n),t.drawArrays(t.POINTS,0,Q)},Ke=()=>{j(),me(),fe(),m(),u=!0},ve=()=>{u&&H(),requestAnimationFrame(ve)},T=e=>{e<0?g=Math.max(g+e,Re):g=Math.min(g+e,Ie)},Qe=()=>{window.addEventListener("resize",m),window.addEventListener("keydown",n=>{let a=!1;switch(n.key){case"w":T(-.05),a=!0;break;case"a":_+=.05,a=!0;break;case"s":T(.05),a=!0;break;case"d":_-=.05,a=!0;break}a&&(m(),H())}),s.ontouchstart=n=>{var a,c;F=(a=n.touches[0])==null?void 0:a.clientY,B=(c=n.touches[0])==null?void 0:c.clientX},s.ontouchmove=n=>{var G,W;const{width:a,height:c}=s.getBoundingClientRect(),S=(G=n.touches[0])==null?void 0:G.clientX,y=(W=n.touches[0])==null?void 0:W.clientY,Y=S-B,w=y-F;B=S,F=y;const X=Y/a,N=w/c;_+=X*5,T(N*5),m()},s.onmousedown=n=>{L=!0,V=n.clientX,U=n.clientY},s.onmousemove=n=>{if(!L)return;const{width:a,height:c}=s.getBoundingClientRect(),S=n.clientX,y=n.clientY,Y=S-V,w=y-U;V=S,U=y;const X=Y/a,N=w/c;_+=X*5,T(N*5),m()},s.onmouseup=()=>L=!1,s.onmouseleave=()=>L=!1,s.addEventListener("wheel",n=>{n.preventDefault();const a=.01;n.deltaY<0?I*=1-a:I*=1+a,m()}),Ge.onclick=We,ze.onclick=Ke,je.onclick=j,se.onclick=()=>{D.classList.toggle("menu-closed"),se.classList.toggle("menu-button-open"),D.toggleAttribute("aria-hidden")};const e=document.createElement("a");document.body.appendChild(e),e.style.display="none";const r=(n,a)=>{if(!n)return;const c=window.URL.createObjectURL(n);e.href=c,e.download=a,e.click()};He.onclick=()=>{H(),s.toBlob(n=>{r(n,"particles.png")})}};Je();
