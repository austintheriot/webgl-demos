var me=Object.defineProperty,ve=Object.defineProperties;var _e=Object.getOwnPropertyDescriptors;var k=Object.getOwnPropertySymbols;var pe=Object.prototype.hasOwnProperty,be=Object.prototype.propertyIsEnumerable;var O=(e,r,n)=>r in e?me(e,r,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[r]=n,m=(e,r)=>{for(var n in r||(r={}))pe.call(r,n)&&O(e,n,r[n]);if(k)for(var n of k(r))be.call(r,n)&&O(e,n,r[n]);return e},v=(e,r)=>ve(e,_e(r));import{c as _,e as ge,a as z,d as he,m as i,f as F,r as xe}from"./index.b6be8b9a.js";var Ae=`#version 300 es

precision highp float;

out vec4 o_color;
 
void main() {
  o_color = vec4(1., 0.75, 0.5, 0.025);
}`,Se=`#version 300 es

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
}`;const j=1e5,ye=F(-60),Ce=F(60),a={rotateX:0,rotateY:0,rotateZ:0,translateZ:-5,a:2,b:3,c:2,d:3.001,e:1,f:1};let Ee=0,Re=0,Le=0,Ie=0,Ye=0,we=1,Xe=1,Te=1,Ne=1,p=a.rotateX,b=a.rotateY,H=a.rotateZ,Fe=0,Be=0,A=a.translateZ,Ue=0,Ve=0,Me=0,De=F(60),Pe=.1,Ze=2e3,c=!0,t,d,l=i.createIdentityMatrix(),G,W,$,J,K,Q,ee,te,B,U,V,M,S=!1,ne,y=a.a,C=a.b,E=a.c,R=a.d,L=a.e,I=a.f;const s=document.querySelector("canvas"),qe=document.querySelector("#reset-everything"),ke=document.querySelector("#reset-camera"),Oe=document.querySelector("#save-image"),re=document.querySelector("#message"),ze=document.querySelector(".input-container"),g={type:"number",min:0,max:10,step:.001},ae=_(v(m({},g),{label:"a",initialValue:y,useCurrentValueIndicator:!1,oninput:e=>{y=e.target.valueAsNumber,c=!0}})),oe=_(v(m({},g),{label:"b",initialValue:C,useCurrentValueIndicator:!1,oninput:e=>{C=e.target.valueAsNumber,c=!0}})),ie=_(v(m({},g),{label:"c",initialValue:E,useCurrentValueIndicator:!1,oninput:e=>{E=e.target.valueAsNumber,c=!0}})),le=_(v(m({},g),{label:"d",initialValue:R,useCurrentValueIndicator:!1,oninput:e=>{R=e.target.valueAsNumber,c=!0}})),ce=_(v(m({},g),{label:"e",initialValue:L,useCurrentValueIndicator:!1,oninput:e=>{L=e.target.valueAsNumber,c=!0}})),ue=_(v(m({},g),{label:"f",initialValue:I,useCurrentValueIndicator:!1,oninput:e=>{I=e.target.valueAsNumber,c=!0}}));ze.append(ae,oe,ie,le,ce,ue);const D=()=>{p=a.rotateX,b=a.rotateY,H=a.rotateZ,A=a.translateZ,f()},se=()=>{y=a.a,C=a.b,E=a.c,R=a.d,L=a.e,I=a.f,c=!0},de=()=>{ae.querySelector("input").value=a.a.toString(),oe.querySelector("input").value=a.b.toString(),ie.querySelector("input").value=a.c.toString(),le.querySelector("input").value=a.d.toString(),ce.querySelector("input").value=a.e.toString(),ue.querySelector("input").value=a.f.toString(),c=!0},je=(e,r,n)=>{const o=e.createBuffer();if(!o)throw new Error("error creating buffer");return e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,r,n!==void 0?n:e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,null),o},He=async()=>{if(t=s.getContext("webgl2"),!t)throw ge("WebGL not supported",{gl:t});D(),se(),de(),We(),ne=new Float32Array(Array.from({length:j},(e,r)=>Math.floor((r+1)/2)/10));try{const e=z(t,t.VERTEX_SHADER,Se),r=z(t,t.FRAGMENT_SHADER,Ae);d=he(t,e,r)}catch(e){console.error(e),re.textContent=`Error occurred: ${e}`}W=t.getUniformLocation(d,"u_matrix"),$=t.getUniformLocation(d,"u_a"),J=t.getUniformLocation(d,"u_b"),K=t.getUniformLocation(d,"u_c"),Q=t.getUniformLocation(d,"u_d"),ee=t.getUniformLocation(d,"u_e"),te=t.getUniformLocation(d,"u_f"),G=je(t,ne,t.DYNAMIC_COPY),f(),re.remove(),fe()},f=()=>{c=!0,l=i.createPerspectiveMatrix(De,t.canvas.clientWidth/t.canvas.clientHeight,Pe,Ze),l=i.translate(l,Fe,Be,A),l=i.rotateX(l,p),l=i.rotateY(l,b),l=i.rotateZ(l,H),l=i.scale(l,Xe,Te,Ne),l=i.translate(l,Ue,Ve,Me)},P=()=>{c=!1,t.useProgram(d),xe(t.canvas),t.viewport(0,0,t.canvas.width,t.canvas.height),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.blendFunc(t.SRC_ALPHA,t.ONE),t.enable(t.BLEND),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.uniform1f($,y),t.uniform1f(J,C),t.uniform1f(K,E),t.uniform1f(Q,R),t.uniform1f(ee,L),t.uniform1f(te,I),[G].forEach((o,u)=>{t.bindBuffer(t.ARRAY_BUFFER,o),t.enableVertexAttribArray(u),t.vertexAttribPointer(u,1,t.FLOAT,!1,0,0)});let e=i.createIdentityMatrix();e=i.rotateY(e,Re),e=i.rotateX(e,Ee),e=i.rotateZ(e,Le),e=i.translate(e,Ie,Ye,we);const r=i.inverse(e),n=i.multiply(l,r);t.uniformMatrix4fv(W,!1,n),t.drawArrays(t.LINES,0,j)},Ge=()=>{D(),se(),de(),f(),c=!0},fe=()=>{c&&P(),requestAnimationFrame(fe)},Y=e=>{e<0?p=Math.max(p+e,ye):p=Math.min(p+e,Ce)},We=()=>{window.addEventListener("resize",f),window.addEventListener("keydown",n=>{let o=!1;switch(n.key){case"w":Y(-.05),o=!0;break;case"a":b+=.05,o=!0;break;case"s":Y(.05),o=!0;break;case"d":b-=.05,o=!0;break}o&&(f(),P())}),s.ontouchstart=n=>{var o,u;U=(o=n.touches[0])==null?void 0:o.clientY,B=(u=n.touches[0])==null?void 0:u.clientX},s.ontouchmove=n=>{var Z,q;const{width:o,height:u}=s.getBoundingClientRect(),h=(Z=n.touches[0])==null?void 0:Z.clientX,x=(q=n.touches[0])==null?void 0:q.clientY,w=h-B,X=x-U;B=h,U=x;const T=w/o,N=X/u;b-=T*5,Y(-N*5),f()},s.onmousedown=n=>{S=!0,V=n.clientX,M=n.clientY},s.onmousemove=n=>{if(!S)return;const{width:o,height:u}=s.getBoundingClientRect(),h=n.clientX,x=n.clientY,w=h-V,X=x-M;V=h,M=x;const T=w/o,N=X/u;b-=T*5,Y(-N*5),f()},s.onmouseup=()=>S=!1,s.onmouseleave=()=>S=!1,s.addEventListener("wheel",n=>{n.preventDefault();const o=.01;n.deltaY<0?A*=1-o:A*=1+o,f()}),qe.onclick=Ge,ke.onclick=D;const e=document.createElement("a");document.body.appendChild(e),e.style.display="none";const r=(n,o)=>{if(!n)return;const u=window.URL.createObjectURL(n);e.href=u,e.download=o,e.click()};Oe.onclick=()=>{P(),s.toBlob(n=>{r(n,"particles.png")})}};He();
