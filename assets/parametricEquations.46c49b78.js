var fe=Object.defineProperty,me=Object.defineProperties;var ve=Object.getOwnPropertyDescriptors;var q=Object.getOwnPropertySymbols;var _e=Object.prototype.hasOwnProperty,pe=Object.prototype.propertyIsEnumerable;var k=(e,a,n)=>a in e?fe(e,a,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[a]=n,f=(e,a)=>{for(var n in a||(a={}))_e.call(a,n)&&k(e,n,a[n]);if(q)for(var n of q(a))pe.call(a,n)&&k(e,n,a[n]);return e},m=(e,a)=>me(e,ve(a));import{c as _,e as be,a as O,d as ge,m as i,f as F,r as he}from"./index.b6be8b9a.js";var xe=`#version 300 es

precision highp float;

out vec4 o_color;
 
void main() {
  o_color = vec4(1., 0.75, 0.5, 0.025);
}`,Ae=`#version 300 es

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
}`;const z=1e5,Se=F(-60),ye=F(60),r={rotateX:0,rotateY:0,rotateZ:0,translateZ:-5,a:2,b:3,c:2,d:3.001,e:1,f:1};let Ee=0,Re=0,Ce=0,Le=0,Ie=0,Ye=1,we=1,Xe=1,Te=1,p=r.rotateX,b=r.rotateY,j=r.rotateZ,Ne=0,Fe=0,A=r.translateZ,Ue=0,Ve=0,Be=0,Me=F(60),De=.1,Pe=2e3,u=!0,t,d,l=i.createIdentityMatrix(),H,G,W,$,J,K,Q,ee,U,V,B,M,S=!1,te,y=r.a,E=r.b,R=r.c,C=r.d,L=r.e,I=r.f;const s=document.querySelector("canvas"),Ze=document.querySelector("#reset-everything"),qe=document.querySelector("#save-image"),ne=document.querySelector("#message"),ke=document.querySelector(".input-container"),g={type:"number",min:0,max:10,step:.001},ae=_(m(f({},g),{label:"a",initialValue:y,useCurrentValueIndicator:!1,oninput:e=>{y=e.target.valueAsNumber,u=!0}})),re=_(m(f({},g),{label:"b",initialValue:E,useCurrentValueIndicator:!1,oninput:e=>{E=e.target.valueAsNumber,u=!0}})),oe=_(m(f({},g),{label:"c",initialValue:R,useCurrentValueIndicator:!1,oninput:e=>{R=e.target.valueAsNumber,u=!0}})),ie=_(m(f({},g),{label:"d",initialValue:C,useCurrentValueIndicator:!1,oninput:e=>{C=e.target.valueAsNumber,u=!0}})),le=_(m(f({},g),{label:"e",initialValue:L,useCurrentValueIndicator:!1,oninput:e=>{L=e.target.valueAsNumber,u=!0}})),ue=_(m(f({},g),{label:"f",initialValue:I,useCurrentValueIndicator:!1,oninput:e=>{I=e.target.valueAsNumber,u=!0}}));ke.append(ae,re,oe,ie,le,ue);const ce=()=>{p=r.rotateX,b=r.rotateY,j=r.rotateZ,A=r.translateZ,y=r.a,E=r.b,R=r.c,C=r.d,L=r.e,I=r.f,u=!0},se=()=>{ae.querySelector("input").value=r.a.toString(),re.querySelector("input").value=r.b.toString(),oe.querySelector("input").value=r.c.toString(),ie.querySelector("input").value=r.d.toString(),le.querySelector("input").value=r.e.toString(),ue.querySelector("input").value=r.f.toString(),u=!0},Oe=(e,a,n)=>{const o=e.createBuffer();if(!o)throw new Error("error creating buffer");return e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,a,n!==void 0?n:e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,null),o},ze=async()=>{if(t=s.getContext("webgl2"),!t)throw be("WebGL not supported",{gl:t});ce(),se(),He(),te=new Float32Array(Array.from({length:z},(e,a)=>Math.floor((a+1)/2)/10));try{const e=O(t,t.VERTEX_SHADER,Ae),a=O(t,t.FRAGMENT_SHADER,xe);d=ge(t,e,a)}catch(e){console.error(e),ne.textContent=`Error occurred: ${e}`}G=t.getUniformLocation(d,"u_matrix"),W=t.getUniformLocation(d,"u_a"),$=t.getUniformLocation(d,"u_b"),J=t.getUniformLocation(d,"u_c"),K=t.getUniformLocation(d,"u_d"),Q=t.getUniformLocation(d,"u_e"),ee=t.getUniformLocation(d,"u_f"),H=Oe(t,te,t.DYNAMIC_COPY),v(),ne.remove(),de()},v=()=>{u=!0,l=i.createPerspectiveMatrix(Me,t.canvas.clientWidth/t.canvas.clientHeight,De,Pe),l=i.translate(l,Ne,Fe,A),l=i.rotateX(l,p),l=i.rotateY(l,b),l=i.rotateZ(l,j),l=i.scale(l,we,Xe,Te),l=i.translate(l,Ue,Ve,Be)},D=()=>{u=!1,t.useProgram(d),he(t.canvas),t.viewport(0,0,t.canvas.width,t.canvas.height),t.disable(t.DEPTH_TEST),t.disable(t.CULL_FACE),t.blendFunc(t.SRC_ALPHA,t.ONE),t.enable(t.BLEND),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.uniform1f(W,y),t.uniform1f($,E),t.uniform1f(J,R),t.uniform1f(K,C),t.uniform1f(Q,L),t.uniform1f(ee,I),[H].forEach((o,c)=>{t.bindBuffer(t.ARRAY_BUFFER,o),t.enableVertexAttribArray(c),t.vertexAttribPointer(c,1,t.FLOAT,!1,0,0)});let e=i.createIdentityMatrix();e=i.rotateY(e,Re),e=i.rotateX(e,Ee),e=i.rotateZ(e,Ce),e=i.translate(e,Le,Ie,Ye);const a=i.inverse(e),n=i.multiply(l,a);t.uniformMatrix4fv(G,!1,n),t.drawArrays(t.LINES,0,z)},je=()=>{ce(),se(),v(),u=!0},de=()=>{u&&D(),requestAnimationFrame(de)},Y=e=>{e<0?p=Math.max(p+e,Se):p=Math.min(p+e,ye)},He=()=>{window.addEventListener("resize",v),window.addEventListener("keydown",n=>{let o=!1;switch(n.key){case"w":Y(-.05),o=!0;break;case"a":b+=.05,o=!0;break;case"s":Y(.05),o=!0;break;case"d":b-=.05,o=!0;break}o&&(v(),D())}),s.ontouchstart=n=>{var o,c;V=(o=n.touches[0])==null?void 0:o.clientY,U=(c=n.touches[0])==null?void 0:c.clientX},s.ontouchmove=n=>{var P,Z;const{width:o,height:c}=s.getBoundingClientRect(),h=(P=n.touches[0])==null?void 0:P.clientX,x=(Z=n.touches[0])==null?void 0:Z.clientY,w=h-U,X=x-V;U=h,V=x;const T=w/o,N=X/c;b-=T*5,Y(-N*5),v()},s.onmousedown=n=>{S=!0,B=n.clientX,M=n.clientY},s.onmousemove=n=>{if(!S)return;const{width:o,height:c}=s.getBoundingClientRect(),h=n.clientX,x=n.clientY,w=h-B,X=x-M;B=h,M=x;const T=w/o,N=X/c;b-=T*5,Y(-N*5),v()},s.onmouseup=()=>S=!1,s.onmouseleave=()=>S=!1,s.addEventListener("wheel",n=>{n.preventDefault();const o=.01;n.deltaY<0?A*=1-o:A*=1+o,v()}),Ze.onclick=je;const e=document.createElement("a");document.body.appendChild(e),e.style.display="none";const a=(n,o)=>{if(!n)return;const c=window.URL.createObjectURL(n);e.href=c,e.download=o,e.click()};qe.onclick=()=>{D(),s.toBlob(n=>{a(n,"particles.png")})}};ze();
