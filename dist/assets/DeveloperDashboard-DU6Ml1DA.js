import{r as e,g as t,a as n,j as r,s,n as i,R as o,b as a,c}from"./index-DZZSuyx1.js";var l={};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const u=function(e){const t=[];let n=0;for(let r=0;r<e.length;r++){let s=e.charCodeAt(r);s<128?t[n++]=s:s<2048?(t[n++]=s>>6|192,t[n++]=63&s|128):55296==(64512&s)&&r+1<e.length&&56320==(64512&e.charCodeAt(r+1))?(s=65536+((1023&s)<<10)+(1023&e.charCodeAt(++r)),t[n++]=s>>18|240,t[n++]=s>>12&63|128,t[n++]=s>>6&63|128,t[n++]=63&s|128):(t[n++]=s>>12|224,t[n++]=s>>6&63|128,t[n++]=63&s|128)}return t},h={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<e.length;s+=3){const t=e[s],i=s+1<e.length,o=i?e[s+1]:0,a=s+2<e.length,c=a?e[s+2]:0,l=t>>2,u=(3&t)<<4|o>>4;let h=(15&o)<<2|c>>6,d=63&c;a||(d=64,i||(h=64)),r.push(n[l],n[u],n[h],n[d])}return r.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(u(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):function(e){const t=[];let n=0,r=0;for(;n<e.length;){const s=e[n++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=e[n++];t[r++]=String.fromCharCode((31&s)<<6|63&i)}else if(s>239&&s<365){const i=((7&s)<<18|(63&e[n++])<<12|(63&e[n++])<<6|63&e[n++])-65536;t[r++]=String.fromCharCode(55296+(i>>10)),t[r++]=String.fromCharCode(56320+(1023&i))}else{const i=e[n++],o=e[n++];t[r++]=String.fromCharCode((15&s)<<12|(63&i)<<6|63&o)}}return t.join("")}(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();const n=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<e.length;){const t=n[e.charAt(s++)],i=s<e.length?n[e.charAt(s)]:0;++s;const o=s<e.length?n[e.charAt(s)]:64;++s;const a=s<e.length?n[e.charAt(s)]:64;if(++s,null==t||null==i||null==o||null==a)throw new d;const c=t<<2|i>>4;if(r.push(c),64!==o){const e=i<<4&240|o>>2;if(r.push(e),64!==a){const e=o<<6&192|a;r.push(e)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class d extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const f=function(e){return function(e){const t=u(e);return h.encodeByteArray(t,!0)}(e).replace(/\./g,"")};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const g=()=>
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("Unable to locate global object.")}().__FIREBASE_DEFAULTS__,m=()=>{if("undefined"==typeof document)return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(n){return}const t=e&&function(e){try{return h.decodeString(e,!0)}catch(n){console.error("base64Decode failed: ",n)}return null}(e[1]);return t&&JSON.parse(t)},p=()=>{try{return g()||(()=>{if("undefined"==typeof process)return;const e=l.__FIREBASE_DEFAULTS__;return e?JSON.parse(e):void 0})()||m()}catch(e){return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`)}},y=e=>{const t=(e=>{var t,n;return null===(n=null===(t=p())||void 0===t?void 0:t.emulatorHosts)||void 0===n?void 0:n[e]})(e);if(!t)return;const n=t.lastIndexOf(":");if(n<=0||n+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const r=parseInt(t.substring(n+1),10);return"["===t[0]?[t.substring(1,n-1),r]:[t.substring(0,n),r]},v=()=>{var e;return null===(e=p())||void 0===e?void 0:e.config};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class w{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),"function"==typeof e&&(this.promise.catch((()=>{})),1===e.length?e(t):e(t,n))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function b(e){try{return(e.startsWith("http://")||e.startsWith("https://")?new URL(e).hostname:e).endsWith(".cloudworkstations.dev")}catch(t){return!1}}const E={};let x=!1;function _(e,t){if("undefined"==typeof window||"undefined"==typeof document||!b(window.location.host)||E[e]===t||E[e]||x)return;function n(e){return`__firebase__banner__${e}`}E[e]=t;const r="__firebase__banner",s=function(){const e={prod:[],emulator:[]};for(const t of Object.keys(E))E[t]?e.emulator.push(t):e.prod.push(t);return e}().prod.length>0;function i(){const e=document.createElement("span");return e.style.cursor="pointer",e.style.marginLeft="16px",e.style.fontSize="24px",e.innerHTML=" &times;",e.onclick=()=>{x=!0,function(){const e=document.getElementById(r);e&&e.remove()}()},e}function o(){const e=function(e){let t=document.getElementById(e),n=!1;return t||(t=document.createElement("div"),t.setAttribute("id",e),n=!0),{created:n,element:t}}(r),t=n("text"),o=document.getElementById(t)||document.createElement("span"),a=n("learnmore"),c=document.getElementById(a)||document.createElement("a"),l=n("preprendIcon"),u=document.getElementById(l)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(e.created){const t=e.element;!function(e){e.style.display="flex",e.style.background="#7faaf0",e.style.position="fixed",e.style.bottom="5px",e.style.left="5px",e.style.padding=".5em",e.style.borderRadius="5px",e.style.alignItems="center"}(t),function(e,t){e.setAttribute("id",t),e.innerText="Learn more",e.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",e.setAttribute("target","__blank"),e.style.paddingLeft="5px",e.style.textDecoration="underline"}(c,a);const n=i();!function(e,t){e.setAttribute("width","24"),e.setAttribute("id",t),e.setAttribute("height","24"),e.setAttribute("viewBox","0 0 24 24"),e.setAttribute("fill","none"),e.style.marginLeft="-6px"}(u,l),t.append(u,o,c,n),document.body.appendChild(t)}s?(o.innerText="Preview backend disconnected.",u.innerHTML='<g clip-path="url(#clip0_6013_33858)">\n<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>\n</g>\n<defs>\n<clipPath id="clip0_6013_33858">\n<rect width="24" height="24" fill="white"/>\n</clipPath>\n</defs>'):(u.innerHTML='<g clip-path="url(#clip0_6083_34804)">\n<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>\n</g>\n<defs>\n<clipPath id="clip0_6083_34804">\n<rect width="24" height="24" fill="white"/>\n</clipPath>\n</defs>',o.innerText="Preview backend running in this workspace."),o.setAttribute("id",t)}"loading"===document.readyState?window.addEventListener("DOMContentLoaded",o):o()}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function S(){return!function(){var e;const t=null===(e=p())||void 0===e?void 0:e.forceEnvironment;if("node"===t)return!0;if("browser"===t)return!1;try{return"[object process]"===Object.prototype.toString.call(global.process)}catch(n){return!1}}()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}class T extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name="FirebaseError",Object.setPrototypeOf(this,T.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,I.prototype.create)}}class I{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?function(e,t){return e.replace(C,((e,n)=>{const r=t[n];return null!=r?String(r):`<${n}?>`}))}(s,n):"Error",o=`${this.serviceName}: ${i} (${r}).`;return new T(r,o,n)}}const C=/\{\$([^}]+)}/g;function N(e,t){if(e===t)return!0;const n=Object.keys(e),r=Object.keys(t);for(const s of n){if(!r.includes(s))return!1;const n=e[s],i=t[s];if(A(n)&&A(i)){if(!N(n,i))return!1}else if(n!==i)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function A(e){return null!==e&&"object"==typeof e}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D(e){return e&&e._delegate?e._delegate:e}class k{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R="[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const e=new w;if(this.instancesDeferred.set(t,e),this.isInitialized(t)||this.shouldAutoInitialize())try{const n=this.getOrInitializeService({instanceIdentifier:t});n&&e.resolve(n)}catch(n){}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const n=this.normalizeInstanceIdentifier(null==e?void 0:e.identifier),r=null!==(t=null==e?void 0:e.optional)&&void 0!==t&&t;if(!this.isInitialized(n)&&!this.shouldAutoInitialize()){if(r)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:n})}catch(s){if(r)return null;throw s}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,this.shouldAutoInitialize()){if(function(e){return"EAGER"===e.instantiationMode}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e))try{this.getOrInitializeService({instanceIdentifier:R})}catch(t){}for(const[e,n]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(e);try{const e=this.getOrInitializeService({instanceIdentifier:r});n.resolve(e)}catch(t){}}}}clearInstance(e=R){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter((e=>"INTERNAL"in e)).map((e=>e.INTERNAL.delete())),...e.filter((e=>"_delete"in e)).map((e=>e._delete()))])}isComponentSet(){return null!=this.component}isInitialized(e=R){return this.instances.has(e)}getOptions(e=R){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[s,i]of this.instancesDeferred.entries()){n===this.normalizeInstanceIdentifier(s)&&i.resolve(r)}return r}onInit(e,t){var n;const r=this.normalizeInstanceIdentifier(t),s=null!==(n=this.onInitCallbacks.get(r))&&void 0!==n?n:new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch(r){}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:(r=e,r===R?void 0:r),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch(s){}var r;return n||null}normalizeInstanceIdentifier(e=R){return this.component?this.component.multipleInstances?e:R:e}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class L{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new O(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var j,M;(M=j||(j={}))[M.DEBUG=0]="DEBUG",M[M.VERBOSE=1]="VERBOSE",M[M.INFO=2]="INFO",M[M.WARN=3]="WARN",M[M.ERROR=4]="ERROR",M[M.SILENT=5]="SILENT";const P={debug:j.DEBUG,verbose:j.VERBOSE,info:j.INFO,warn:j.WARN,error:j.ERROR,silent:j.SILENT},V=j.INFO,F={[j.DEBUG]:"log",[j.VERBOSE]:"log",[j.INFO]:"info",[j.WARN]:"warn",[j.ERROR]:"error"},U=(e,t,...n)=>{if(t<e.logLevel)return;const r=(new Date).toISOString(),s=F[t];if(!s)throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`);console[s](`[${r}]  ${e.name}:`,...n)};class B{constructor(e){this.name=e,this._logLevel=V,this._logHandler=U,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in j))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel="string"==typeof e?P[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if("function"!=typeof e)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,j.DEBUG,...e),this._logHandler(this,j.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,j.VERBOSE,...e),this._logHandler(this,j.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,j.INFO,...e),this._logHandler(this,j.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,j.WARN,...e),this._logHandler(this,j.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,j.ERROR,...e),this._logHandler(this,j.ERROR,...e)}}let q,$;const z=new WeakMap,K=new WeakMap,G=new WeakMap,H=new WeakMap,Q=new WeakMap;let W={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)return K.get(e);if("objectStoreNames"===t)return e.objectStoreNames||G.get(e);if("store"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Y(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function X(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?($||($=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...t){return e.apply(Z(this),t),Y(z.get(this))}:function(...t){return Y(e.apply(Z(this),t))}:function(t,...n){const r=e.call(Z(this),t,...n);return G.set(r,t.sort?t.sort():[t]),Y(r)}}function J(e){return"function"==typeof e?X(e):(e instanceof IDBTransaction&&function(e){if(K.has(e))return;const t=new Promise(((t,n)=>{const r=()=>{e.removeEventListener("complete",s),e.removeEventListener("error",i),e.removeEventListener("abort",i)},s=()=>{t(),r()},i=()=>{n(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",s),e.addEventListener("error",i),e.addEventListener("abort",i)}));K.set(e,t)}(e),t=e,(q||(q=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some((e=>t instanceof e))?new Proxy(e,W):e);var t}function Y(e){if(e instanceof IDBRequest)return function(e){const t=new Promise(((t,n)=>{const r=()=>{e.removeEventListener("success",s),e.removeEventListener("error",i)},s=()=>{t(Y(e.result)),r()},i=()=>{n(e.error),r()};e.addEventListener("success",s),e.addEventListener("error",i)}));return t.then((t=>{t instanceof IDBCursor&&z.set(t,e)})).catch((()=>{})),Q.set(t,e),t}(e);if(H.has(e))return H.get(e);const t=J(e);return t!==e&&(H.set(e,t),Q.set(t,e)),t}const Z=e=>Q.get(e);const ee=["get","getKey","getAll","getAllKeys","count"],te=["put","add","delete","clear"],ne=new Map;function re(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(ne.get(t))return ne.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,s=te.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!s&&!ee.includes(n))return;const i=async function(e,...t){const i=this.transaction(e,s?"readwrite":"readonly");let o=i.store;return r&&(o=o.index(t.shift())),(await Promise.all([o[n](...t),s&&i.done]))[0]};return ne.set(t,i),i}W=(e=>({...e,get:(t,n,r)=>re(t,n)||e.get(t,n,r),has:(t,n)=>!!re(t,n)||e.has(t,n)}))(W);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class se{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map((e=>{if(function(e){const t=e.getComponent();return"VERSION"===(null==t?void 0:t.type)}(e)){const t=e.getImmediate();return`${t.library}/${t.version}`}return null})).filter((e=>e)).join(" ")}}const ie="@firebase/app",oe="0.13.2",ae=new B("@firebase/app"),ce="@firebase/app-compat",le="@firebase/analytics-compat",ue="@firebase/analytics",he="@firebase/app-check-compat",de="@firebase/app-check",fe="@firebase/auth",ge="@firebase/auth-compat",me="@firebase/database",pe="@firebase/data-connect",ye="@firebase/database-compat",ve="@firebase/functions",we="@firebase/functions-compat",be="@firebase/installations",Ee="@firebase/installations-compat",xe="@firebase/messaging",_e="@firebase/messaging-compat",Se="@firebase/performance",Te="@firebase/performance-compat",Ie="@firebase/remote-config",Ce="@firebase/remote-config-compat",Ne="@firebase/storage",Ae="@firebase/storage-compat",De="@firebase/firestore",ke="@firebase/ai",Re="@firebase/firestore-compat",Oe="firebase",Le="[DEFAULT]",je={[ie]:"fire-core",[ce]:"fire-core-compat",[ue]:"fire-analytics",[le]:"fire-analytics-compat",[de]:"fire-app-check",[he]:"fire-app-check-compat",[fe]:"fire-auth",[ge]:"fire-auth-compat",[me]:"fire-rtdb",[pe]:"fire-data-connect",[ye]:"fire-rtdb-compat",[ve]:"fire-fn",[we]:"fire-fn-compat",[be]:"fire-iid",[Ee]:"fire-iid-compat",[xe]:"fire-fcm",[_e]:"fire-fcm-compat",[Se]:"fire-perf",[Te]:"fire-perf-compat",[Ie]:"fire-rc",[Ce]:"fire-rc-compat",[Ne]:"fire-gcs",[Ae]:"fire-gcs-compat",[De]:"fire-fst",[Re]:"fire-fst-compat",[ke]:"fire-vertex","fire-js":"fire-js",[Oe]:"fire-js-all"},Me=new Map,Pe=new Map,Ve=new Map;function Fe(e,t){try{e.container.addComponent(t)}catch(n){ae.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function Ue(e){const t=e.name;if(Ve.has(t))return ae.debug(`There were multiple attempts to register component ${t}.`),!1;Ve.set(t,e);for(const n of Me.values())Fe(n,e);for(const n of Pe.values())Fe(n,e);return!0}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Be=new I("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class qe{constructor(e,t,n){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new k("app",(()=>this),"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Be.create("app-deleted",{appName:this._name})}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $e(e,t={}){let n=e;if("object"!=typeof t){t={name:t}}const r=Object.assign({name:Le,automaticDataCollectionEnabled:!0},t),s=r.name;if("string"!=typeof s||!s)throw Be.create("bad-app-name",{appName:String(s)});if(n||(n=v()),!n)throw Be.create("no-options");const i=Me.get(s);if(i){if(N(n,i.options)&&N(r,i.config))return i;throw Be.create("duplicate-app",{appName:s})}const o=new L(s);for(const c of Ve.values())o.addComponent(c);const a=new qe(n,r,o);return Me.set(s,a),a}function ze(e,t,n){var r;let s=null!==(r=je[e])&&void 0!==r?r:e;n&&(s+=`-${n}`);const i=s.match(/\s|\//),o=t.match(/\s|\//);if(i||o){const e=[`Unable to register library "${s}" with version "${t}":`];return i&&e.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&e.push("and"),o&&e.push(`version name "${t}" contains illegal characters (whitespace or "/")`),void ae.warn(e.join(" "))}Ue(new k(`${s}-version`,(()=>({library:s,version:t})),"VERSION"))}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ke="firebase-heartbeat-store";let Ge=null;function He(){return Ge||(Ge=function(e,t,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(e,t),a=Y(o);return r&&o.addEventListener("upgradeneeded",(e=>{r(Y(o.result),e.oldVersion,e.newVersion,Y(o.transaction),e)})),n&&o.addEventListener("blocked",(e=>n(e.oldVersion,e.newVersion,e))),a.then((e=>{i&&e.addEventListener("close",(()=>i())),s&&e.addEventListener("versionchange",(e=>s(e.oldVersion,e.newVersion,e)))})).catch((()=>{})),a}("firebase-heartbeat-database",1,{upgrade:(e,t)=>{if(0===t)try{e.createObjectStore(Ke)}catch(n){console.warn(n)}}}).catch((e=>{throw Be.create("idb-open",{originalErrorMessage:e.message})}))),Ge}async function Qe(e,t){try{const n=(await He()).transaction(Ke,"readwrite"),r=n.objectStore(Ke);await r.put(t,We(e)),await n.done}catch(n){if(n instanceof T)ae.warn(n.message);else{const e=Be.create("idb-set",{originalErrorMessage:null==n?void 0:n.message});ae.warn(e.message)}}}function We(e){return`${e.name}!${e.options.appId}`}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xe{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Ye(t),this._heartbeatsCachePromise=this._storage.read().then((e=>(this._heartbeatsCache=e,e)))}async triggerHeartbeat(){var e,t;try{const n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=Je();if(null==(null===(e=this._heartbeatsCache)||void 0===e?void 0:e.heartbeats)&&(this._heartbeatsCache=await this._heartbeatsCachePromise,null==(null===(t=this._heartbeatsCache)||void 0===t?void 0:t.heartbeats)))return;if(this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some((e=>e.date===r)))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:n}),this._heartbeatsCache.heartbeats.length>30){const e=function(e){if(0===e.length)return-1;let t=0,n=e[0].date;for(let r=1;r<e.length;r++)e[r].date<n&&(n=e[r].date,t=r);return t}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(e,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){ae.warn(n)}}async getHeartbeatsHeader(){var e;try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,null==(null===(e=this._heartbeatsCache)||void 0===e?void 0:e.heartbeats)||0===this._heartbeatsCache.heartbeats.length)return"";const t=Je(),{heartbeatsToSend:n,unsentEntries:r}=function(e,t=1024){const n=[];let r=e.slice();for(const s of e){const e=n.find((e=>e.agent===s.agent));if(e){if(e.dates.push(s.date),Ze(n)>t){e.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),Ze(n)>t){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}(this._heartbeatsCache.heartbeats),s=f(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return ae.warn(t),""}}}function Je(){return(new Date).toISOString().substring(0,10)}class Ye{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!function(){try{return"object"==typeof indexedDB}catch(e){return!1}}()&&new Promise(((e,t)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),e(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var e;t((null===(e=s.error)||void 0===e?void 0:e.message)||"")}}catch(n){t(n)}})).then((()=>!0)).catch((()=>!1))}async read(){if(await this._canUseIndexedDBPromise){const e=await async function(e){try{const t=(await He()).transaction(Ke),n=await t.objectStore(Ke).get(We(e));return await t.done,n}catch(t){if(t instanceof T)ae.warn(t.message);else{const e=Be.create("idb-get",{originalErrorMessage:null==t?void 0:t.message});ae.warn(e.message)}}}(this.app);return(null==e?void 0:e.heartbeats)?e:{heartbeats:[]}}return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const n=await this.read();return Qe(this.app,{lastSentHeartbeatDate:null!==(t=e.lastSentHeartbeatDate)&&void 0!==t?t:n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}}async add(e){var t;if(await this._canUseIndexedDBPromise){const n=await this.read();return Qe(this.app,{lastSentHeartbeatDate:null!==(t=e.lastSentHeartbeatDate)&&void 0!==t?t:n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}}}function Ze(e){return f(JSON.stringify({version:2,heartbeats:e})).length}var et;et="",Ue(new k("platform-logger",(e=>new se(e)),"PRIVATE")),Ue(new k("heartbeat",(e=>new Xe(e)),"PRIVATE")),ze(ie,oe,et),ze(ie,oe,"esm2017"),ze("fire-js","");
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
ze("firebase","11.10.0","app");var tt,nt,rt="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e;
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function t(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}function n(e,t,n){n||(n=0);var r=Array(16);if("string"==typeof t)for(var s=0;16>s;++s)r[s]=t.charCodeAt(n++)|t.charCodeAt(n++)<<8|t.charCodeAt(n++)<<16|t.charCodeAt(n++)<<24;else for(s=0;16>s;++s)r[s]=t[n++]|t[n++]<<8|t[n++]<<16|t[n++]<<24;t=e.g[0],n=e.g[1],s=e.g[2];var i=e.g[3],o=t+(i^n&(s^i))+r[0]+3614090360&4294967295;o=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=(n=(s=(i=(t=n+(o<<7&4294967295|o>>>25))+((o=i+(s^t&(n^s))+r[1]+3905402710&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^i&(t^n))+r[2]+606105819&4294967295)<<17&4294967295|o>>>15))+((o=n+(t^s&(i^t))+r[3]+3250441966&4294967295)<<22&4294967295|o>>>10))+((o=t+(i^n&(s^i))+r[4]+4118548399&4294967295)<<7&4294967295|o>>>25))+((o=i+(s^t&(n^s))+r[5]+1200080426&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^i&(t^n))+r[6]+2821735955&4294967295)<<17&4294967295|o>>>15))+((o=n+(t^s&(i^t))+r[7]+4249261313&4294967295)<<22&4294967295|o>>>10))+((o=t+(i^n&(s^i))+r[8]+1770035416&4294967295)<<7&4294967295|o>>>25))+((o=i+(s^t&(n^s))+r[9]+2336552879&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^i&(t^n))+r[10]+4294925233&4294967295)<<17&4294967295|o>>>15))+((o=n+(t^s&(i^t))+r[11]+2304563134&4294967295)<<22&4294967295|o>>>10))+((o=t+(i^n&(s^i))+r[12]+1804603682&4294967295)<<7&4294967295|o>>>25))+((o=i+(s^t&(n^s))+r[13]+4254626195&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^i&(t^n))+r[14]+2792965006&4294967295)<<17&4294967295|o>>>15))+((o=n+(t^s&(i^t))+r[15]+1236535329&4294967295)<<22&4294967295|o>>>10))+((o=t+(s^i&(n^s))+r[1]+4129170786&4294967295)<<5&4294967295|o>>>27))+((o=i+(n^s&(t^n))+r[6]+3225465664&4294967295)<<9&4294967295|o>>>23))+((o=s+(t^n&(i^t))+r[11]+643717713&4294967295)<<14&4294967295|o>>>18))+((o=n+(i^t&(s^i))+r[0]+3921069994&4294967295)<<20&4294967295|o>>>12))+((o=t+(s^i&(n^s))+r[5]+3593408605&4294967295)<<5&4294967295|o>>>27))+((o=i+(n^s&(t^n))+r[10]+38016083&4294967295)<<9&4294967295|o>>>23))+((o=s+(t^n&(i^t))+r[15]+3634488961&4294967295)<<14&4294967295|o>>>18))+((o=n+(i^t&(s^i))+r[4]+3889429448&4294967295)<<20&4294967295|o>>>12))+((o=t+(s^i&(n^s))+r[9]+568446438&4294967295)<<5&4294967295|o>>>27))+((o=i+(n^s&(t^n))+r[14]+3275163606&4294967295)<<9&4294967295|o>>>23))+((o=s+(t^n&(i^t))+r[3]+4107603335&4294967295)<<14&4294967295|o>>>18))+((o=n+(i^t&(s^i))+r[8]+1163531501&4294967295)<<20&4294967295|o>>>12))+((o=t+(s^i&(n^s))+r[13]+2850285829&4294967295)<<5&4294967295|o>>>27))+((o=i+(n^s&(t^n))+r[2]+4243563512&4294967295)<<9&4294967295|o>>>23))+((o=s+(t^n&(i^t))+r[7]+1735328473&4294967295)<<14&4294967295|o>>>18))+((o=n+(i^t&(s^i))+r[12]+2368359562&4294967295)<<20&4294967295|o>>>12))+((o=t+(n^s^i)+r[5]+4294588738&4294967295)<<4&4294967295|o>>>28))+((o=i+(t^n^s)+r[8]+2272392833&4294967295)<<11&4294967295|o>>>21))+((o=s+(i^t^n)+r[11]+1839030562&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^i^t)+r[14]+4259657740&4294967295)<<23&4294967295|o>>>9))+((o=t+(n^s^i)+r[1]+2763975236&4294967295)<<4&4294967295|o>>>28))+((o=i+(t^n^s)+r[4]+1272893353&4294967295)<<11&4294967295|o>>>21))+((o=s+(i^t^n)+r[7]+4139469664&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^i^t)+r[10]+3200236656&4294967295)<<23&4294967295|o>>>9))+((o=t+(n^s^i)+r[13]+681279174&4294967295)<<4&4294967295|o>>>28))+((o=i+(t^n^s)+r[0]+3936430074&4294967295)<<11&4294967295|o>>>21))+((o=s+(i^t^n)+r[3]+3572445317&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^i^t)+r[6]+76029189&4294967295)<<23&4294967295|o>>>9))+((o=t+(n^s^i)+r[9]+3654602809&4294967295)<<4&4294967295|o>>>28))+((o=i+(t^n^s)+r[12]+3873151461&4294967295)<<11&4294967295|o>>>21))+((o=s+(i^t^n)+r[15]+530742520&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^i^t)+r[2]+3299628645&4294967295)<<23&4294967295|o>>>9))+((o=t+(s^(n|~i))+r[0]+4096336452&4294967295)<<6&4294967295|o>>>26))+((o=i+(n^(t|~s))+r[7]+1126891415&4294967295)<<10&4294967295|o>>>22))+((o=s+(t^(i|~n))+r[14]+2878612391&4294967295)<<15&4294967295|o>>>17))+((o=n+(i^(s|~t))+r[5]+4237533241&4294967295)<<21&4294967295|o>>>11))+((o=t+(s^(n|~i))+r[12]+1700485571&4294967295)<<6&4294967295|o>>>26))+((o=i+(n^(t|~s))+r[3]+2399980690&4294967295)<<10&4294967295|o>>>22))+((o=s+(t^(i|~n))+r[10]+4293915773&4294967295)<<15&4294967295|o>>>17))+((o=n+(i^(s|~t))+r[1]+2240044497&4294967295)<<21&4294967295|o>>>11))+((o=t+(s^(n|~i))+r[8]+1873313359&4294967295)<<6&4294967295|o>>>26))+((o=i+(n^(t|~s))+r[15]+4264355552&4294967295)<<10&4294967295|o>>>22))+((o=s+(t^(i|~n))+r[6]+2734768916&4294967295)<<15&4294967295|o>>>17))+((o=n+(i^(s|~t))+r[13]+1309151649&4294967295)<<21&4294967295|o>>>11))+((i=(t=n+((o=t+(s^(n|~i))+r[4]+4149444226&4294967295)<<6&4294967295|o>>>26))+((o=i+(n^(t|~s))+r[11]+3174756917&4294967295)<<10&4294967295|o>>>22))^((s=i+((o=s+(t^(i|~n))+r[2]+718787259&4294967295)<<15&4294967295|o>>>17))|~t))+r[9]+3951481745&4294967295,e.g[0]=e.g[0]+t&4294967295,e.g[1]=e.g[1]+(s+(o<<21&4294967295|o>>>11))&4294967295,e.g[2]=e.g[2]+s&4294967295,e.g[3]=e.g[3]+i&4294967295}function r(e,t){this.h=t;for(var n=[],r=!0,s=e.length-1;0<=s;s--){var i=0|e[s];r&&i==t||(n[s]=i,r=!1)}this.g=n}!function(e,t){function n(){}n.prototype=t.prototype,e.D=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.C=function(e,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return t.prototype[n].apply(e,s)}}(t,(function(){this.blockSize=-1})),t.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0},t.prototype.u=function(e,t){void 0===t&&(t=e.length);for(var r=t-this.blockSize,s=this.B,i=this.h,o=0;o<t;){if(0==i)for(;o<=r;)n(this,e,o),o+=this.blockSize;if("string"==typeof e){for(;o<t;)if(s[i++]=e.charCodeAt(o++),i==this.blockSize){n(this,s),i=0;break}}else for(;o<t;)if(s[i++]=e[o++],i==this.blockSize){n(this,s),i=0;break}}this.h=i,this.o+=t},t.prototype.v=function(){var e=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);e[0]=128;for(var t=1;t<e.length-8;++t)e[t]=0;var n=8*this.o;for(t=e.length-8;t<e.length;++t)e[t]=255&n,n/=256;for(this.u(e),e=Array(16),t=n=0;4>t;++t)for(var r=0;32>r;r+=8)e[n++]=this.g[t]>>>r&255;return e};var s={};function i(e){return-128<=e&&128>e?function(e,t){var n=s;return Object.prototype.hasOwnProperty.call(n,e)?n[e]:n[e]=t(e)}(e,(function(e){return new r([0|e],0>e?-1:0)})):new r([0|e],0>e?-1:0)}function o(e){if(isNaN(e)||!isFinite(e))return a;if(0>e)return d(o(-e));for(var t=[],n=1,s=0;e>=n;s++)t[s]=e/n|0,n*=4294967296;return new r(t,0)}var a=i(0),c=i(1),l=i(16777216);function u(e){if(0!=e.h)return!1;for(var t=0;t<e.g.length;t++)if(0!=e.g[t])return!1;return!0}function h(e){return-1==e.h}function d(e){for(var t=e.g.length,n=[],s=0;s<t;s++)n[s]=~e.g[s];return new r(n,~e.h).add(c)}function f(e,t){return e.add(d(t))}function g(e,t){for(;(65535&e[t])!=e[t];)e[t+1]+=e[t]>>>16,e[t]&=65535,t++}function m(e,t){this.g=e,this.h=t}function p(e,t){if(u(t))throw Error("division by zero");if(u(e))return new m(a,a);if(h(e))return t=p(d(e),t),new m(d(t.g),d(t.h));if(h(t))return t=p(e,d(t)),new m(d(t.g),t.h);if(30<e.g.length){if(h(e)||h(t))throw Error("slowDivide_ only works with positive integers.");for(var n=c,r=t;0>=r.l(e);)n=y(n),r=y(r);var s=v(n,1),i=v(r,1);for(r=v(r,2),n=v(n,2);!u(r);){var l=i.add(r);0>=l.l(e)&&(s=s.add(n),i=l),r=v(r,1),n=v(n,1)}return t=f(e,s.j(t)),new m(s,t)}for(s=a;0<=e.l(t);){for(n=Math.max(1,Math.floor(e.m()/t.m())),r=48>=(r=Math.ceil(Math.log(n)/Math.LN2))?1:Math.pow(2,r-48),l=(i=o(n)).j(t);h(l)||0<l.l(e);)l=(i=o(n-=r)).j(t);u(i)&&(i=c),s=s.add(i),e=f(e,l)}return new m(s,e)}function y(e){for(var t=e.g.length+1,n=[],s=0;s<t;s++)n[s]=e.i(s)<<1|e.i(s-1)>>>31;return new r(n,e.h)}function v(e,t){var n=t>>5;t%=32;for(var s=e.g.length-n,i=[],o=0;o<s;o++)i[o]=0<t?e.i(o+n)>>>t|e.i(o+n+1)<<32-t:e.i(o+n);return new r(i,e.h)}(e=r.prototype).m=function(){if(h(this))return-d(this).m();for(var e=0,t=1,n=0;n<this.g.length;n++){var r=this.i(n);e+=(0<=r?r:4294967296+r)*t,t*=4294967296}return e},e.toString=function(e){if(2>(e=e||10)||36<e)throw Error("radix out of range: "+e);if(u(this))return"0";if(h(this))return"-"+d(this).toString(e);for(var t=o(Math.pow(e,6)),n=this,r="";;){var s=p(n,t).g,i=((0<(n=f(n,s.j(t))).g.length?n.g[0]:n.h)>>>0).toString(e);if(u(n=s))return i+r;for(;6>i.length;)i="0"+i;r=i+r}},e.i=function(e){return 0>e?0:e<this.g.length?this.g[e]:this.h},e.l=function(e){return h(e=f(this,e))?-1:u(e)?0:1},e.abs=function(){return h(this)?d(this):this},e.add=function(e){for(var t=Math.max(this.g.length,e.g.length),n=[],s=0,i=0;i<=t;i++){var o=s+(65535&this.i(i))+(65535&e.i(i)),a=(o>>>16)+(this.i(i)>>>16)+(e.i(i)>>>16);s=a>>>16,o&=65535,a&=65535,n[i]=a<<16|o}return new r(n,-2147483648&n[n.length-1]?-1:0)},e.j=function(e){if(u(this)||u(e))return a;if(h(this))return h(e)?d(this).j(d(e)):d(d(this).j(e));if(h(e))return d(this.j(d(e)));if(0>this.l(l)&&0>e.l(l))return o(this.m()*e.m());for(var t=this.g.length+e.g.length,n=[],s=0;s<2*t;s++)n[s]=0;for(s=0;s<this.g.length;s++)for(var i=0;i<e.g.length;i++){var c=this.i(s)>>>16,f=65535&this.i(s),m=e.i(i)>>>16,p=65535&e.i(i);n[2*s+2*i]+=f*p,g(n,2*s+2*i),n[2*s+2*i+1]+=c*p,g(n,2*s+2*i+1),n[2*s+2*i+1]+=f*m,g(n,2*s+2*i+1),n[2*s+2*i+2]+=c*m,g(n,2*s+2*i+2)}for(s=0;s<t;s++)n[s]=n[2*s+1]<<16|n[2*s];for(s=t;s<2*t;s++)n[s]=0;return new r(n,0)},e.A=function(e){return p(this,e).h},e.and=function(e){for(var t=Math.max(this.g.length,e.g.length),n=[],s=0;s<t;s++)n[s]=this.i(s)&e.i(s);return new r(n,this.h&e.h)},e.or=function(e){for(var t=Math.max(this.g.length,e.g.length),n=[],s=0;s<t;s++)n[s]=this.i(s)|e.i(s);return new r(n,this.h|e.h)},e.xor=function(e){for(var t=Math.max(this.g.length,e.g.length),n=[],s=0;s<t;s++)n[s]=this.i(s)^e.i(s);return new r(n,this.h^e.h)},t.prototype.digest=t.prototype.v,t.prototype.reset=t.prototype.s,t.prototype.update=t.prototype.u,nt=t,r.prototype.add=r.prototype.add,r.prototype.multiply=r.prototype.j,r.prototype.modulo=r.prototype.A,r.prototype.compare=r.prototype.l,r.prototype.toNumber=r.prototype.m,r.prototype.toString=r.prototype.toString,r.prototype.getBits=r.prototype.i,r.fromNumber=o,r.fromString=function e(t,n){if(0==t.length)throw Error("number format error: empty string");if(2>(n=n||10)||36<n)throw Error("radix out of range: "+n);if("-"==t.charAt(0))return d(e(t.substring(1),n));if(0<=t.indexOf("-"))throw Error('number format error: interior "-" character');for(var r=o(Math.pow(n,8)),s=a,i=0;i<t.length;i+=8){var c=Math.min(8,t.length-i),l=parseInt(t.substring(i,i+c),n);8>c?(c=o(Math.pow(n,c)),s=s.j(c).add(o(l))):s=(s=s.j(r)).add(o(l))}return s},tt=r}).apply(void 0!==rt?rt:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});var st,it,ot,at,ct,lt,ut,ht,dt="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e,t="function"==typeof Object.defineProperties?Object.defineProperty:function(e,t,n){return e==Array.prototype||e==Object.prototype||(e[t]=n.value),e};var n=function(e){e=["object"==typeof globalThis&&globalThis,e,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof dt&&dt];for(var t=0;t<e.length;++t){var n=e[t];if(n&&n.Math==Math)return n}throw Error("Cannot find global object")}(this);!function(e,r){if(r)e:{var s=n;e=e.split(".");for(var i=0;i<e.length-1;i++){var o=e[i];if(!(o in s))break e;s=s[o]}(r=r(i=s[e=e[e.length-1]]))!=i&&null!=r&&t(s,e,{configurable:!0,writable:!0,value:r})}}("Array.prototype.values",(function(e){return e||function(){return function(e,t){e instanceof String&&(e+="");var n=0,r=!1,s={next:function(){if(!r&&n<e.length){var s=n++;return{value:t(s,e[s]),done:!1}}return r=!0,{done:!0,value:void 0}}};return s[Symbol.iterator]=function(){return s},s}(this,(function(e,t){return t}))}}));
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
var r=r||{},s=this||self;function i(e){var t=typeof e;return"array"==(t="object"!=t?t:e?Array.isArray(e)?"array":t:"null")||"object"==t&&"number"==typeof e.length}function o(e){var t=typeof e;return"object"==t&&null!=e||"function"==t}function a(e,t,n){return e.call.apply(e.bind,arguments)}function c(e,t,n){if(!e)throw Error();if(2<arguments.length){var r=Array.prototype.slice.call(arguments,2);return function(){var n=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(n,r),e.apply(t,n)}}return function(){return e.apply(t,arguments)}}function l(e,t,n){return(l=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?a:c).apply(null,arguments)}function u(e,t){var n=Array.prototype.slice.call(arguments,1);return function(){var t=n.slice();return t.push.apply(t,arguments),e.apply(this,t)}}function h(e,t){function n(){}n.prototype=t.prototype,e.aa=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.Qb=function(e,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return t.prototype[n].apply(e,s)}}function d(e){const t=e.length;if(0<t){const n=Array(t);for(let r=0;r<t;r++)n[r]=e[r];return n}return[]}function f(e,t){for(let n=1;n<arguments.length;n++){const t=arguments[n];if(i(t)){const n=e.length||0,r=t.length||0;e.length=n+r;for(let s=0;s<r;s++)e[n+s]=t[s]}else e.push(t)}}function g(e){return/^[\s\xa0]*$/.test(e)}function m(){var e=s.navigator;return e&&(e=e.userAgent)?e:""}function p(e){return p[" "](e),e}p[" "]=function(){};var y=!(-1==m().indexOf("Gecko")||-1!=m().toLowerCase().indexOf("webkit")&&-1==m().indexOf("Edge")||-1!=m().indexOf("Trident")||-1!=m().indexOf("MSIE")||-1!=m().indexOf("Edge"));function v(e,t,n){for(const r in e)t.call(n,e[r],r,e)}function w(e){const t={};for(const n in e)t[n]=e[n];return t}const b="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function E(e,t){let n,r;for(let s=1;s<arguments.length;s++){for(n in r=arguments[s],r)e[n]=r[n];for(let t=0;t<b.length;t++)n=b[t],Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}}function x(e){var t=1;e=e.split(":");const n=[];for(;0<t&&e.length;)n.push(e.shift()),t--;return e.length&&n.push(e.join(":")),n}function _(e){s.setTimeout((()=>{throw e}),0)}function S(){var e=A;let t=null;return e.g&&(t=e.g,e.g=e.g.next,e.g||(e.h=null),t.next=null),t}var T=new class{constructor(e,t){this.i=e,this.j=t,this.h=0,this.g=null}get(){let e;return 0<this.h?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}((()=>new I),(e=>e.reset()));class I{constructor(){this.next=this.g=this.h=null}set(e,t){this.h=e,this.g=t,this.next=null}reset(){this.next=this.g=this.h=null}}let C,N=!1,A=new class{constructor(){this.h=this.g=null}add(e,t){const n=T.get();n.set(e,t),this.h?this.h.next=n:this.g=n,this.h=n}},D=()=>{const e=s.Promise.resolve(void 0);C=()=>{e.then(k)}};var k=()=>{for(var e;e=S();){try{e.h.call(e.g)}catch(n){_(n)}var t=T;t.j(e),100>t.h&&(t.h++,e.next=t.g,t.g=e)}N=!1};function R(){this.s=this.s,this.C=this.C}function O(e,t){this.type=e,this.g=this.target=t,this.defaultPrevented=!1}R.prototype.s=!1,R.prototype.ma=function(){this.s||(this.s=!0,this.N())},R.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()},O.prototype.h=function(){this.defaultPrevented=!0};var L=function(){if(!s.addEventListener||!Object.defineProperty)return!1;var e=!1,t=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const e=()=>{};s.addEventListener("test",e,t),s.removeEventListener("test",e,t)}catch(n){}return e}();function j(e,t){if(O.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e){var n=this.type=e.type,r=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;if(this.target=e.target||e.srcElement,this.g=t,t=e.relatedTarget){if(y){e:{try{p(t.nodeName);var s=!0;break e}catch(i){}s=!1}s||(t=null)}}else"mouseover"==n?t=e.fromElement:"mouseout"==n&&(t=e.toElement);this.relatedTarget=t,r?(this.clientX=void 0!==r.clientX?r.clientX:r.pageX,this.clientY=void 0!==r.clientY?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=void 0!==e.clientX?e.clientX:e.pageX,this.clientY=void 0!==e.clientY?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType="string"==typeof e.pointerType?e.pointerType:M[e.pointerType]||"",this.state=e.state,this.i=e,e.defaultPrevented&&j.aa.h.call(this)}}h(j,O);var M={2:"touch",3:"pen",4:"mouse"};j.prototype.h=function(){j.aa.h.call(this);var e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var P="closure_listenable_"+(1e6*Math.random()|0),V=0;function F(e,t,n,r,s){this.listener=e,this.proxy=null,this.src=t,this.type=n,this.capture=!!r,this.ha=s,this.key=++V,this.da=this.fa=!1}function U(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function B(e){this.src=e,this.g={},this.h=0}function q(e,t){var n=t.type;if(n in e.g){var r,s=e.g[n],i=Array.prototype.indexOf.call(s,t,void 0);(r=0<=i)&&Array.prototype.splice.call(s,i,1),r&&(U(t),0==e.g[n].length&&(delete e.g[n],e.h--))}}function $(e,t,n,r){for(var s=0;s<e.length;++s){var i=e[s];if(!i.da&&i.listener==t&&i.capture==!!n&&i.ha==r)return s}return-1}B.prototype.add=function(e,t,n,r,s){var i=e.toString();(e=this.g[i])||(e=this.g[i]=[],this.h++);var o=$(e,t,r,s);return-1<o?(t=e[o],n||(t.fa=!1)):((t=new F(t,this.src,i,!!r,s)).fa=n,e.push(t)),t};var z="closure_lm_"+(1e6*Math.random()|0),K={};function G(e,t,n,r,s){if(Array.isArray(t)){for(var i=0;i<t.length;i++)G(e,t[i],n,r,s);return null}return n=Z(n),e&&e[P]?e.K(t,n,!!o(r)&&!!r.capture,s):function(e,t,n,r,s,i){if(!t)throw Error("Invalid event type");var a=o(s)?!!s.capture:!!s,c=J(e);if(c||(e[z]=c=new B(e)),n=c.add(t,n,r,a,i),n.proxy)return n;if(r=function(){function e(n){return t.call(e.src,e.listener,n)}const t=X;return e}(),n.proxy=r,r.src=e,r.listener=n,e.addEventListener)L||(s=a),void 0===s&&(s=!1),e.addEventListener(t.toString(),r,s);else if(e.attachEvent)e.attachEvent(W(t.toString()),r);else{if(!e.addListener||!e.removeListener)throw Error("addEventListener and attachEvent are unavailable.");e.addListener(r)}return n}(e,t,n,!1,r,s)}function H(e,t,n,r,s){if(Array.isArray(t))for(var i=0;i<t.length;i++)H(e,t[i],n,r,s);else r=o(r)?!!r.capture:!!r,n=Z(n),e&&e[P]?(e=e.i,(t=String(t).toString())in e.g&&(-1<(n=$(i=e.g[t],n,r,s))&&(U(i[n]),Array.prototype.splice.call(i,n,1),0==i.length&&(delete e.g[t],e.h--)))):e&&(e=J(e))&&(t=e.g[t.toString()],e=-1,t&&(e=$(t,n,r,s)),(n=-1<e?t[e]:null)&&Q(n))}function Q(e){if("number"!=typeof e&&e&&!e.da){var t=e.src;if(t&&t[P])q(t.i,e);else{var n=e.type,r=e.proxy;t.removeEventListener?t.removeEventListener(n,r,e.capture):t.detachEvent?t.detachEvent(W(n),r):t.addListener&&t.removeListener&&t.removeListener(r),(n=J(t))?(q(n,e),0==n.h&&(n.src=null,t[z]=null)):U(e)}}}function W(e){return e in K?K[e]:K[e]="on"+e}function X(e,t){if(e.da)e=!0;else{t=new j(t,this);var n=e.listener,r=e.ha||e.src;e.fa&&Q(e),e=n.call(r,t)}return e}function J(e){return(e=e[z])instanceof B?e:null}var Y="__closure_events_fn_"+(1e9*Math.random()>>>0);function Z(e){return"function"==typeof e?e:(e[Y]||(e[Y]=function(t){return e.handleEvent(t)}),e[Y])}function ee(){R.call(this),this.i=new B(this),this.M=this,this.F=null}function te(e,t){var n,r=e.F;if(r)for(n=[];r;r=r.F)n.push(r);if(e=e.M,r=t.type||t,"string"==typeof t)t=new O(t,e);else if(t instanceof O)t.target=t.target||e;else{var s=t;E(t=new O(r,e),s)}if(s=!0,n)for(var i=n.length-1;0<=i;i--){var o=t.g=n[i];s=ne(o,r,!0,t)&&s}if(s=ne(o=t.g=e,r,!0,t)&&s,s=ne(o,r,!1,t)&&s,n)for(i=0;i<n.length;i++)s=ne(o=t.g=n[i],r,!1,t)&&s}function ne(e,t,n,r){if(!(t=e.i.g[String(t)]))return!0;t=t.concat();for(var s=!0,i=0;i<t.length;++i){var o=t[i];if(o&&!o.da&&o.capture==n){var a=o.listener,c=o.ha||o.src;o.fa&&q(e.i,o),s=!1!==a.call(c,r)&&s}}return s&&!r.defaultPrevented}function re(e,t,n){if("function"==typeof e)n&&(e=l(e,n));else{if(!e||"function"!=typeof e.handleEvent)throw Error("Invalid listener argument");e=l(e.handleEvent,e)}return 2147483647<Number(t)?-1:s.setTimeout(e,t||0)}function se(e){e.g=re((()=>{e.g=null,e.i&&(e.i=!1,se(e))}),e.l);const t=e.h;e.h=null,e.m.apply(null,t)}h(ee,R),ee.prototype[P]=!0,ee.prototype.removeEventListener=function(e,t,n,r){H(this,e,t,n,r)},ee.prototype.N=function(){if(ee.aa.N.call(this),this.i){var e,t=this.i;for(e in t.g){for(var n=t.g[e],r=0;r<n.length;r++)U(n[r]);delete t.g[e],t.h--}}this.F=null},ee.prototype.K=function(e,t,n,r){return this.i.add(String(e),t,!1,n,r)},ee.prototype.L=function(e,t,n,r){return this.i.add(String(e),t,!0,n,r)};class ie extends R{constructor(e,t){super(),this.m=e,this.l=t,this.h=null,this.i=!1,this.g=null}j(e){this.h=arguments,this.g?this.i=!0:se(this)}N(){super.N(),this.g&&(s.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function oe(e){R.call(this),this.h=e,this.g={}}h(oe,R);var ae=[];function ce(e){v(e.g,(function(e,t){this.g.hasOwnProperty(t)&&Q(e)}),e),e.g={}}oe.prototype.N=function(){oe.aa.N.call(this),ce(this)},oe.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var le=s.JSON.stringify,ue=s.JSON.parse,he=class{stringify(e){return s.JSON.stringify(e,void 0)}parse(e){return s.JSON.parse(e,void 0)}};function de(){}function fe(e){return e.h||(e.h=e.i())}function ge(){}de.prototype.h=null;var me={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function pe(){O.call(this,"d")}function ye(){O.call(this,"c")}h(pe,O),h(ye,O);var ve={},we=null;function be(){return we=we||new ee}function Ee(e){O.call(this,ve.La,e)}function xe(e){const t=be();te(t,new Ee(t))}function _e(e,t){O.call(this,ve.STAT_EVENT,e),this.stat=t}function Se(e){const t=be();te(t,new _e(t,e))}function Te(e,t){O.call(this,ve.Ma,e),this.size=t}function Ie(e,t){if("function"!=typeof e)throw Error("Fn must not be null and must be a function");return s.setTimeout((function(){e()}),t)}function Ce(){this.g=!0}function Ne(e,t,n,r){e.info((function(){return"XMLHTTP TEXT ("+t+"): "+function(e,t){if(!e.g)return t;if(!t)return null;try{var n=JSON.parse(t);if(n)for(e=0;e<n.length;e++)if(Array.isArray(n[e])){var r=n[e];if(!(2>r.length)){var s=r[1];if(Array.isArray(s)&&!(1>s.length)){var i=s[0];if("noop"!=i&&"stop"!=i&&"close"!=i)for(var o=1;o<s.length;o++)s[o]=""}}}return le(n)}catch(a){return t}}(e,n)+(r?" "+r:"")}))}ve.La="serverreachability",h(Ee,O),ve.STAT_EVENT="statevent",h(_e,O),ve.Ma="timingevent",h(Te,O),Ce.prototype.xa=function(){this.g=!1},Ce.prototype.info=function(){};var Ae,De={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},ke={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"};function Re(){}function Oe(e,t,n,r){this.j=e,this.i=t,this.l=n,this.R=r||1,this.U=new oe(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Le}function Le(){this.i=null,this.g="",this.h=!1}h(Re,de),Re.prototype.g=function(){return new XMLHttpRequest},Re.prototype.i=function(){return{}},Ae=new Re;var je={},Me={};function Pe(e,t,n){e.L=1,e.v=vt(ft(t)),e.m=n,e.P=!0,Ve(e,null)}function Ve(e,t){e.F=Date.now(),Be(e),e.A=ft(e.v);var n=e.A,r=e.R;Array.isArray(r)||(r=[String(r)]),kt(n.i,"t",r),e.C=0,n=e.j.J,e.h=new Le,e.g=wn(e.j,n?t:null,!e.m),0<e.O&&(e.M=new ie(l(e.Y,e,e.g),e.O)),t=e.U,n=e.g,r=e.ca;var s="readystatechange";Array.isArray(s)||(s&&(ae[0]=s.toString()),s=ae);for(var i=0;i<s.length;i++){var o=G(n,s[i],r||t.handleEvent,!1,t.h||t);if(!o)break;t.g[o.key]=o}t=e.H?w(e.H):{},e.m?(e.u||(e.u="POST"),t["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.A,e.u,e.m,t)):(e.u="GET",e.g.ea(e.A,e.u,null,t)),xe(),function(e,t,n,r,s,i){e.info((function(){if(e.g)if(i)for(var o="",a=i.split("&"),c=0;c<a.length;c++){var l=a[c].split("=");if(1<l.length){var u=l[0];l=l[1];var h=u.split("_");o=2<=h.length&&"type"==h[1]?o+(u+"=")+l+"&":o+(u+"=redacted&")}}else o=null;else o=i;return"XMLHTTP REQ ("+r+") [attempt "+s+"]: "+t+"\n"+n+"\n"+o}))}(e.i,e.u,e.A,e.l,e.R,e.m)}function Fe(e){return!!e.g&&("GET"==e.u&&2!=e.L&&e.j.Ca)}function Ue(e,t){var n=e.C,r=t.indexOf("\n",n);return-1==r?Me:(n=Number(t.substring(n,r)),isNaN(n)?je:(r+=1)+n>t.length?Me:(t=t.slice(r,r+n),e.C=r+n,t))}function Be(e){e.S=Date.now()+e.I,qe(e,e.I)}function qe(e,t){if(null!=e.B)throw Error("WatchDog timer not null");e.B=Ie(l(e.ba,e),t)}function $e(e){e.B&&(s.clearTimeout(e.B),e.B=null)}function ze(e){0==e.j.G||e.J||gn(e.j,e)}function Ke(e){$e(e);var t=e.M;t&&"function"==typeof t.ma&&t.ma(),e.M=null,ce(e.U),e.g&&(t=e.g,e.g=null,t.abort(),t.ma())}function Ge(e,t){try{var n=e.j;if(0!=n.G&&(n.g==e||Je(n.h,e)))if(!e.K&&Je(n.h,e)&&3==n.G){try{var r=n.Da.g.parse(t)}catch(u){r=null}if(Array.isArray(r)&&3==r.length){var s=r;if(0==s[0]){e:if(!n.u){if(n.g){if(!(n.g.F+3e3<e.F))break e;fn(n),nn(n)}un(n),Se(18)}}else n.za=s[1],0<n.za-n.T&&37500>s[2]&&n.F&&0==n.v&&!n.C&&(n.C=Ie(l(n.Za,n),6e3));if(1>=Xe(n.h)&&n.ca){try{n.ca()}catch(u){}n.ca=void 0}}else pn(n,11)}else if((e.K||n.g==e)&&fn(n),!g(t))for(s=n.Da.g.parse(t),t=0;t<s.length;t++){let l=s[t];if(n.T=l[0],l=l[1],2==n.G)if("c"==l[0]){n.K=l[1],n.ia=l[2];const t=l[3];null!=t&&(n.la=t,n.j.info("VER="+n.la));const s=l[4];null!=s&&(n.Aa=s,n.j.info("SVER="+n.Aa));const u=l[5];null!=u&&"number"==typeof u&&0<u&&(r=1.5*u,n.L=r,n.j.info("backChannelRequestTimeoutMs_="+r)),r=n;const h=e.g;if(h){const e=h.g?h.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(e){var i=r.h;i.g||-1==e.indexOf("spdy")&&-1==e.indexOf("quic")&&-1==e.indexOf("h2")||(i.j=i.l,i.g=new Set,i.h&&(Ye(i,i.h),i.h=null))}if(r.D){const e=h.g?h.g.getResponseHeader("X-HTTP-Session-Id"):null;e&&(r.ya=e,yt(r.I,r.D,e))}}n.G=3,n.l&&n.l.ua(),n.ba&&(n.R=Date.now()-e.F,n.j.info("Handshake RTT: "+n.R+"ms"));var o=e;if((r=n).qa=vn(r,r.J?r.ia:null,r.W),o.K){Ze(r.h,o);var a=o,c=r.L;c&&(a.I=c),a.B&&($e(a),Be(a)),r.g=o}else ln(r);0<n.i.length&&sn(n)}else"stop"!=l[0]&&"close"!=l[0]||pn(n,7);else 3==n.G&&("stop"==l[0]||"close"==l[0]?"stop"==l[0]?pn(n,7):tn(n):"noop"!=l[0]&&n.l&&n.l.ta(l),n.v=0)}xe()}catch(u){}}Oe.prototype.ca=function(e){e=e.target;const t=this.M;t&&3==Jt(e)?t.j():this.Y(e)},Oe.prototype.Y=function(e){try{if(e==this.g)e:{const d=Jt(this.g);var t=this.g.Ba();this.g.Z();if(!(3>d)&&(3!=d||this.g&&(this.h.h||this.g.oa()||Yt(this.g)))){this.J||4!=d||7==t||xe(),$e(this);var n=this.g.Z();this.X=n;t:if(Fe(this)){var r=Yt(this.g);e="";var i=r.length,o=4==Jt(this.g);if(!this.h.i){if("undefined"==typeof TextDecoder){Ke(this),ze(this);var a="";break t}this.h.i=new s.TextDecoder}for(t=0;t<i;t++)this.h.h=!0,e+=this.h.i.decode(r[t],{stream:!(o&&t==i-1)});r.length=0,this.h.g+=e,this.C=0,a=this.h.g}else a=this.g.oa();if(this.o=200==n,function(e,t,n,r,s,i,o){e.info((function(){return"XMLHTTP RESP ("+r+") [ attempt "+s+"]: "+t+"\n"+n+"\n"+i+" "+o}))}(this.i,this.u,this.A,this.l,this.R,d,n),this.o){if(this.T&&!this.K){t:{if(this.g){var c,l=this.g;if((c=l.g?l.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!g(c)){var u=c;break t}}u=null}if(!(n=u)){this.o=!1,this.s=3,Se(12),Ke(this),ze(this);break e}Ne(this.i,this.l,n,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Ge(this,n)}if(this.P){let e;for(n=!0;!this.J&&this.C<a.length;){if(e=Ue(this,a),e==Me){4==d&&(this.s=4,Se(14),n=!1),Ne(this.i,this.l,null,"[Incomplete Response]");break}if(e==je){this.s=4,Se(15),Ne(this.i,this.l,a,"[Invalid Chunk]"),n=!1;break}Ne(this.i,this.l,e,null),Ge(this,e)}if(Fe(this)&&0!=this.C&&(this.h.g=this.h.g.slice(this.C),this.C=0),4!=d||0!=a.length||this.h.h||(this.s=1,Se(16),n=!1),this.o=this.o&&n,n){if(0<a.length&&!this.W){this.W=!0;var h=this.j;h.g==this&&h.ba&&!h.M&&(h.j.info("Great, no buffering proxy detected. Bytes received: "+a.length),hn(h),h.M=!0,Se(11))}}else Ne(this.i,this.l,a,"[Invalid Chunked Response]"),Ke(this),ze(this)}else Ne(this.i,this.l,a,null),Ge(this,a);4==d&&Ke(this),this.o&&!this.J&&(4==d?gn(this.j,this):(this.o=!1,Be(this)))}else(function(e){const t={};e=(e.g&&2<=Jt(e)&&e.g.getAllResponseHeaders()||"").split("\r\n");for(let r=0;r<e.length;r++){if(g(e[r]))continue;var n=x(e[r]);const s=n[0];if("string"!=typeof(n=n[1]))continue;n=n.trim();const i=t[s]||[];t[s]=i,i.push(n)}!function(e,t){for(const n in e)t.call(void 0,e[n],n,e)}(t,(function(e){return e.join(", ")}))})(this.g),400==n&&0<a.indexOf("Unknown SID")?(this.s=3,Se(12)):(this.s=0,Se(13)),Ke(this),ze(this)}}}catch(d){}},Oe.prototype.cancel=function(){this.J=!0,Ke(this)},Oe.prototype.ba=function(){this.B=null;const e=Date.now();0<=e-this.S?(function(e,t){e.info((function(){return"TIMEOUT: "+t}))}(this.i,this.A),2!=this.L&&(xe(),Se(17)),Ke(this),this.s=2,ze(this)):qe(this,this.S-e)};var He=class{constructor(e,t){this.g=e,this.map=t}};function Qe(e){this.l=e||10,s.PerformanceNavigationTiming?e=0<(e=s.performance.getEntriesByType("navigation")).length&&("hq"==e[0].nextHopProtocol||"h2"==e[0].nextHopProtocol):e=!!(s.chrome&&s.chrome.loadTimes&&s.chrome.loadTimes()&&s.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function We(e){return!!e.h||!!e.g&&e.g.size>=e.j}function Xe(e){return e.h?1:e.g?e.g.size:0}function Je(e,t){return e.h?e.h==t:!!e.g&&e.g.has(t)}function Ye(e,t){e.g?e.g.add(t):e.h=t}function Ze(e,t){e.h&&e.h==t?e.h=null:e.g&&e.g.has(t)&&e.g.delete(t)}function et(e){if(null!=e.h)return e.i.concat(e.h.D);if(null!=e.g&&0!==e.g.size){let t=e.i;for(const n of e.g.values())t=t.concat(n.D);return t}return d(e.i)}function tt(e,t){if(e.forEach&&"function"==typeof e.forEach)e.forEach(t,void 0);else if(i(e)||"string"==typeof e)Array.prototype.forEach.call(e,t,void 0);else for(var n=function(e){if(e.na&&"function"==typeof e.na)return e.na();if(!e.V||"function"!=typeof e.V){if("undefined"!=typeof Map&&e instanceof Map)return Array.from(e.keys());if(!("undefined"!=typeof Set&&e instanceof Set)){if(i(e)||"string"==typeof e){var t=[];e=e.length;for(var n=0;n<e;n++)t.push(n);return t}t=[],n=0;for(const r in e)t[n++]=r;return t}}}(e),r=function(e){if(e.V&&"function"==typeof e.V)return e.V();if("undefined"!=typeof Map&&e instanceof Map||"undefined"!=typeof Set&&e instanceof Set)return Array.from(e.values());if("string"==typeof e)return e.split("");if(i(e)){for(var t=[],n=e.length,r=0;r<n;r++)t.push(e[r]);return t}for(r in t=[],n=0,e)t[n++]=e[r];return t}(e),s=r.length,o=0;o<s;o++)t.call(void 0,r[o],n&&n[o],e)}Qe.prototype.cancel=function(){if(this.i=et(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const e of this.g.values())e.cancel();this.g.clear()}};var nt=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function rt(e){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,e instanceof rt){this.h=e.h,gt(this,e.j),this.o=e.o,this.g=e.g,mt(this,e.s),this.l=e.l;var t=e.i,n=new Ct;n.i=t.i,t.g&&(n.g=new Map(t.g),n.h=t.h),pt(this,n),this.m=e.m}else e&&(t=String(e).match(nt))?(this.h=!1,gt(this,t[1]||"",!0),this.o=wt(t[2]||""),this.g=wt(t[3]||"",!0),mt(this,t[4]),this.l=wt(t[5]||"",!0),pt(this,t[6]||"",!0),this.m=wt(t[7]||"")):(this.h=!1,this.i=new Ct(null,this.h))}function ft(e){return new rt(e)}function gt(e,t,n){e.j=n?wt(t,!0):t,e.j&&(e.j=e.j.replace(/:$/,""))}function mt(e,t){if(t){if(t=Number(t),isNaN(t)||0>t)throw Error("Bad port number "+t);e.s=t}else e.s=null}function pt(e,t,n){t instanceof Ct?(e.i=t,function(e,t){t&&!e.j&&(Nt(e),e.i=null,e.g.forEach((function(e,t){var n=t.toLowerCase();t!=n&&(At(this,t),kt(this,n,e))}),e)),e.j=t}(e.i,e.h)):(n||(t=bt(t,Tt)),e.i=new Ct(t,e.h))}function yt(e,t,n){e.i.set(t,n)}function vt(e){return yt(e,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),e}function wt(e,t){return e?t?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function bt(e,t,n){return"string"==typeof e?(e=encodeURI(e).replace(t,Et),n&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function Et(e){return"%"+((e=e.charCodeAt(0))>>4&15).toString(16)+(15&e).toString(16)}rt.prototype.toString=function(){var e=[],t=this.j;t&&e.push(bt(t,xt,!0),":");var n=this.g;return(n||"file"==t)&&(e.push("//"),(t=this.o)&&e.push(bt(t,xt,!0),"@"),e.push(encodeURIComponent(String(n)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(n=this.s)&&e.push(":",String(n))),(n=this.l)&&(this.g&&"/"!=n.charAt(0)&&e.push("/"),e.push(bt(n,"/"==n.charAt(0)?St:_t,!0))),(n=this.i.toString())&&e.push("?",n),(n=this.m)&&e.push("#",bt(n,It)),e.join("")};var xt=/[#\/\?@]/g,_t=/[#\?:]/g,St=/[#\?]/g,Tt=/[#\?@]/g,It=/#/g;function Ct(e,t){this.h=this.g=null,this.i=e||null,this.j=!!t}function Nt(e){e.g||(e.g=new Map,e.h=0,e.i&&function(e,t){if(e){e=e.split("&");for(var n=0;n<e.length;n++){var r=e[n].indexOf("="),s=null;if(0<=r){var i=e[n].substring(0,r);s=e[n].substring(r+1)}else i=e[n];t(i,s?decodeURIComponent(s.replace(/\+/g," ")):"")}}}(e.i,(function(t,n){e.add(decodeURIComponent(t.replace(/\+/g," ")),n)})))}function At(e,t){Nt(e),t=Rt(e,t),e.g.has(t)&&(e.i=null,e.h-=e.g.get(t).length,e.g.delete(t))}function Dt(e,t){return Nt(e),t=Rt(e,t),e.g.has(t)}function kt(e,t,n){At(e,t),0<n.length&&(e.i=null,e.g.set(Rt(e,t),d(n)),e.h+=n.length)}function Rt(e,t){return t=String(t),e.j&&(t=t.toLowerCase()),t}function Ot(e,t,n,r,s){try{s&&(s.onload=null,s.onerror=null,s.onabort=null,s.ontimeout=null),r(n)}catch(i){}}function Lt(){this.g=new he}function jt(e,t,n){const r=n||"";try{tt(e,(function(e,n){let s=e;o(e)&&(s=le(e)),t.push(r+n+"="+encodeURIComponent(s))}))}catch(s){throw t.push(r+"type="+encodeURIComponent("_badmap")),s}}function Mt(e){this.l=e.Ub||null,this.j=e.eb||!1}function Pt(e,t){ee.call(this),this.D=e,this.o=t,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}function Vt(e){e.j.read().then(e.Pa.bind(e)).catch(e.ga.bind(e))}function Ft(e){e.readyState=4,e.l=null,e.j=null,e.v=null,Ut(e)}function Ut(e){e.onreadystatechange&&e.onreadystatechange.call(e)}function Bt(e){let t="";return v(e,(function(e,n){t+=n,t+=":",t+=e,t+="\r\n"})),t}function qt(e,t,n){e:{for(r in n){var r=!1;break e}r=!0}r||(n=Bt(n),"string"==typeof e?null!=n&&encodeURIComponent(String(n)):yt(e,t,n))}function $t(e){ee.call(this),this.headers=new Map,this.o=e||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}(e=Ct.prototype).add=function(e,t){Nt(this),this.i=null,e=Rt(this,e);var n=this.g.get(e);return n||this.g.set(e,n=[]),n.push(t),this.h+=1,this},e.forEach=function(e,t){Nt(this),this.g.forEach((function(n,r){n.forEach((function(n){e.call(t,n,r,this)}),this)}),this)},e.na=function(){Nt(this);const e=Array.from(this.g.values()),t=Array.from(this.g.keys()),n=[];for(let r=0;r<t.length;r++){const s=e[r];for(let e=0;e<s.length;e++)n.push(t[r])}return n},e.V=function(e){Nt(this);let t=[];if("string"==typeof e)Dt(this,e)&&(t=t.concat(this.g.get(Rt(this,e))));else{e=Array.from(this.g.values());for(let n=0;n<e.length;n++)t=t.concat(e[n])}return t},e.set=function(e,t){return Nt(this),this.i=null,Dt(this,e=Rt(this,e))&&(this.h-=this.g.get(e).length),this.g.set(e,[t]),this.h+=1,this},e.get=function(e,t){return e&&0<(e=this.V(e)).length?String(e[0]):t},e.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],t=Array.from(this.g.keys());for(var n=0;n<t.length;n++){var r=t[n];const i=encodeURIComponent(String(r)),o=this.V(r);for(r=0;r<o.length;r++){var s=i;""!==o[r]&&(s+="="+encodeURIComponent(String(o[r]))),e.push(s)}}return this.i=e.join("&")},h(Mt,de),Mt.prototype.g=function(){return new Pt(this.l,this.j)},Mt.prototype.i=function(e){return function(){return e}}({}),h(Pt,ee),(e=Pt.prototype).open=function(e,t){if(0!=this.readyState)throw this.abort(),Error("Error reopening a connection");this.B=e,this.A=t,this.readyState=1,Ut(this)},e.send=function(e){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.g=!0;const t={headers:this.u,method:this.B,credentials:this.m,cache:void 0};e&&(t.body=e),(this.D||s).fetch(new Request(this.A,t)).then(this.Sa.bind(this),this.ga.bind(this))},e.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch((()=>{})),1<=this.readyState&&this.g&&4!=this.readyState&&(this.g=!1,Ft(this)),this.readyState=0},e.Sa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,Ut(this)),this.g&&(this.readyState=3,Ut(this),this.g)))if("arraybuffer"===this.responseType)e.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(void 0!==s.ReadableStream&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Vt(this)}else e.text().then(this.Ra.bind(this),this.ga.bind(this))},e.Pa=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var t=e.value?e.value:new Uint8Array(0);(t=this.v.decode(t,{stream:!e.done}))&&(this.response=this.responseText+=t)}e.done?Ft(this):Ut(this),3==this.readyState&&Vt(this)}},e.Ra=function(e){this.g&&(this.response=this.responseText=e,Ft(this))},e.Qa=function(e){this.g&&(this.response=e,Ft(this))},e.ga=function(){this.g&&Ft(this)},e.setRequestHeader=function(e,t){this.u.append(e,t)},e.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},e.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],t=this.h.entries();for(var n=t.next();!n.done;)n=n.value,e.push(n[0]+": "+n[1]),n=t.next();return e.join("\r\n")},Object.defineProperty(Pt.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(e){this.m=e?"include":"same-origin"}}),h($t,ee);var zt=/^https?$/i,Kt=["POST","PUT"];function Gt(e,t){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=t,e.m=5,Ht(e),Wt(e)}function Ht(e){e.A||(e.A=!0,te(e,"complete"),te(e,"error"))}function Qt(e){if(e.h&&void 0!==r&&(!e.v[1]||4!=Jt(e)||2!=e.Z()))if(e.u&&4==Jt(e))re(e.Ea,0,e);else if(te(e,"readystatechange"),4==Jt(e)){e.h=!1;try{const r=e.Z();e:switch(r){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var t=!0;break e;default:t=!1}var n;if(!(n=t)){var i;if(i=0===r){var o=String(e.D).match(nt)[1]||null;!o&&s.self&&s.self.location&&(o=s.self.location.protocol.slice(0,-1)),i=!zt.test(o?o.toLowerCase():"")}n=i}if(n)te(e,"complete"),te(e,"success");else{e.m=6;try{var a=2<Jt(e)?e.g.statusText:""}catch(c){a=""}e.l=a+" ["+e.Z()+"]",Ht(e)}}finally{Wt(e)}}}function Wt(e,t){if(e.g){Xt(e);const r=e.g,s=e.v[0]?()=>{}:null;e.g=null,e.v=null,t||te(e,"ready");try{r.onreadystatechange=s}catch(n){}}}function Xt(e){e.I&&(s.clearTimeout(e.I),e.I=null)}function Jt(e){return e.g?e.g.readyState:0}function Yt(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.H){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch(t){return null}}function Zt(e,t,n){return n&&n.internalChannelParams&&n.internalChannelParams[e]||t}function en(e){this.Aa=0,this.i=[],this.j=new Ce,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Zt("failFast",!1,e),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Zt("baseRetryDelayMs",5e3,e),this.cb=Zt("retryDelaySeedMs",1e4,e),this.Wa=Zt("forwardChannelMaxRetries",2,e),this.wa=Zt("forwardChannelRequestTimeoutMs",2e4,e),this.pa=e&&e.xmlHttpFactory||void 0,this.Xa=e&&e.Tb||void 0,this.Ca=e&&e.useFetchStreams||!1,this.L=void 0,this.J=e&&e.supportsCrossDomainXhr||!1,this.K="",this.h=new Qe(e&&e.concurrentRequestLimit),this.Da=new Lt,this.P=e&&e.fastHandshake||!1,this.O=e&&e.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=e&&e.Rb||!1,e&&e.xa&&this.j.xa(),e&&e.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&e&&e.detectBufferingProxy||!1,this.ja=void 0,e&&e.longPollingTimeout&&0<e.longPollingTimeout&&(this.ja=e.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}function tn(e){if(rn(e),3==e.G){var t=e.U++,n=ft(e.I);if(yt(n,"SID",e.K),yt(n,"RID",t),yt(n,"TYPE","terminate"),an(e,n),(t=new Oe(e,e.j,t)).L=2,t.v=vt(ft(n)),n=!1,s.navigator&&s.navigator.sendBeacon)try{n=s.navigator.sendBeacon(t.v.toString(),"")}catch(r){}!n&&s.Image&&((new Image).src=t.v,n=!0),n||(t.g=wn(t.j,null),t.g.ea(t.v)),t.F=Date.now(),Be(t)}yn(e)}function nn(e){e.g&&(hn(e),e.g.cancel(),e.g=null)}function rn(e){nn(e),e.u&&(s.clearTimeout(e.u),e.u=null),fn(e),e.h.cancel(),e.s&&("number"==typeof e.s&&s.clearTimeout(e.s),e.s=null)}function sn(e){if(!We(e.h)&&!e.s){e.s=!0;var t=e.Ga;C||D(),N||(C(),N=!0),A.add(t,e),e.B=0}}function on(e,t){var n;n=t?t.l:e.U++;const r=ft(e.I);yt(r,"SID",e.K),yt(r,"RID",n),yt(r,"AID",e.T),an(e,r),e.m&&e.o&&qt(r,e.m,e.o),n=new Oe(e,e.j,n,e.B+1),null===e.m&&(n.H=e.o),t&&(e.i=t.D.concat(e.i)),t=cn(e,n,1e3),n.I=Math.round(.5*e.wa)+Math.round(.5*e.wa*Math.random()),Ye(e.h,n),Pe(n,r,t)}function an(e,t){e.H&&v(e.H,(function(e,n){yt(t,n,e)})),e.l&&tt({},(function(e,n){yt(t,n,e)}))}function cn(e,t,n){n=Math.min(e.i.length,n);var r=e.l?l(e.l.Na,e.l,e):null;e:{var s=e.i;let t=-1;for(;;){const e=["count="+n];-1==t?0<n?(t=s[0].g,e.push("ofs="+t)):t=0:e.push("ofs="+t);let o=!0;for(let a=0;a<n;a++){let n=s[a].g;const c=s[a].map;if(n-=t,0>n)t=Math.max(0,s[a].g-100),o=!1;else try{jt(c,e,"req"+n+"_")}catch(i){r&&r(c)}}if(o){r=e.join("&");break e}}}return e=e.i.splice(0,n),t.D=e,r}function ln(e){if(!e.g&&!e.u){e.Y=1;var t=e.Fa;C||D(),N||(C(),N=!0),A.add(t,e),e.v=0}}function un(e){return!(e.g||e.u||3<=e.v)&&(e.Y++,e.u=Ie(l(e.Fa,e),mn(e,e.v)),e.v++,!0)}function hn(e){null!=e.A&&(s.clearTimeout(e.A),e.A=null)}function dn(e){e.g=new Oe(e,e.j,"rpc",e.Y),null===e.m&&(e.g.H=e.o),e.g.O=0;var t=ft(e.qa);yt(t,"RID","rpc"),yt(t,"SID",e.K),yt(t,"AID",e.T),yt(t,"CI",e.F?"0":"1"),!e.F&&e.ja&&yt(t,"TO",e.ja),yt(t,"TYPE","xmlhttp"),an(e,t),e.m&&e.o&&qt(t,e.m,e.o),e.L&&(e.g.I=e.L);var n=e.g;e=e.ia,n.L=1,n.v=vt(ft(t)),n.m=null,n.P=!0,Ve(n,e)}function fn(e){null!=e.C&&(s.clearTimeout(e.C),e.C=null)}function gn(e,t){var n=null;if(e.g==t){fn(e),hn(e),e.g=null;var r=2}else{if(!Je(e.h,t))return;n=t.D,Ze(e.h,t),r=1}if(0!=e.G)if(t.o)if(1==r){n=t.m?t.m.length:0,t=Date.now()-t.F;var s=e.B;te(r=be(),new Te(r,n)),sn(e)}else ln(e);else if(3==(s=t.s)||0==s&&0<t.X||!(1==r&&function(e,t){return!(Xe(e.h)>=e.h.j-(e.s?1:0)||(e.s?(e.i=t.D.concat(e.i),0):1==e.G||2==e.G||e.B>=(e.Va?0:e.Wa)||(e.s=Ie(l(e.Ga,e,t),mn(e,e.B)),e.B++,0)))}(e,t)||2==r&&un(e)))switch(n&&0<n.length&&(t=e.h,t.i=t.i.concat(n)),s){case 1:pn(e,5);break;case 4:pn(e,10);break;case 3:pn(e,6);break;default:pn(e,2)}}function mn(e,t){let n=e.Ta+Math.floor(Math.random()*e.cb);return e.isActive()||(n*=2),n*t}function pn(e,t){if(e.j.info("Error code "+t),2==t){var n=l(e.fb,e),r=e.Xa;const t=!r;r=new rt(r||"//www.google.com/images/cleardot.gif"),s.location&&"http"==s.location.protocol||gt(r,"https"),vt(r),t?function(e,t){const n=new Ce;if(s.Image){const r=new Image;r.onload=u(Ot,n,"TestLoadImage: loaded",!0,t,r),r.onerror=u(Ot,n,"TestLoadImage: error",!1,t,r),r.onabort=u(Ot,n,"TestLoadImage: abort",!1,t,r),r.ontimeout=u(Ot,n,"TestLoadImage: timeout",!1,t,r),s.setTimeout((function(){r.ontimeout&&r.ontimeout()}),1e4),r.src=e}else t(!1)}(r.toString(),n):function(e,t){new Ce;const n=new AbortController,r=setTimeout((()=>{n.abort(),Ot(0,0,!1,t)}),1e4);fetch(e,{signal:n.signal}).then((e=>{clearTimeout(r),e.ok?Ot(0,0,!0,t):Ot(0,0,!1,t)})).catch((()=>{clearTimeout(r),Ot(0,0,!1,t)}))}(r.toString(),n)}else Se(2);e.G=0,e.l&&e.l.sa(t),yn(e),rn(e)}function yn(e){if(e.G=0,e.ka=[],e.l){const t=et(e.h);0==t.length&&0==e.i.length||(f(e.ka,t),f(e.ka,e.i),e.h.i.length=0,d(e.i),e.i.length=0),e.l.ra()}}function vn(e,t,n){var r=n instanceof rt?ft(n):new rt(n);if(""!=r.g)t&&(r.g=t+"."+r.g),mt(r,r.s);else{var i=s.location;r=i.protocol,t=t?t+"."+i.hostname:i.hostname,i=+i.port;var o=new rt(null);r&&gt(o,r),t&&(o.g=t),i&&mt(o,i),n&&(o.l=n),r=o}return n=e.D,t=e.ya,n&&t&&yt(r,n,t),yt(r,"VER",e.la),an(e,r),r}function wn(e,t,n){if(t&&!e.J)throw Error("Can't create secondary domain capable XhrIo object.");return(t=e.Ca&&!e.pa?new $t(new Mt({eb:n})):new $t(e.pa)).Ha(e.J),t}function bn(){}function En(){}function xn(e,t){ee.call(this),this.g=new en(t),this.l=e,this.h=t&&t.messageUrlParams||null,e=t&&t.messageHeaders||null,t&&t.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=t&&t.initMessageHeaders||null,t&&t.messageContentType&&(e?e["X-WebChannel-Content-Type"]=t.messageContentType:e={"X-WebChannel-Content-Type":t.messageContentType}),t&&t.va&&(e?e["X-WebChannel-Client-Profile"]=t.va:e={"X-WebChannel-Client-Profile":t.va}),this.g.S=e,(e=t&&t.Sb)&&!g(e)&&(this.g.m=e),this.v=t&&t.supportsCrossDomainXhr||!1,this.u=t&&t.sendRawJson||!1,(t=t&&t.httpSessionIdParam)&&!g(t)&&(this.g.D=t,null!==(e=this.h)&&t in e&&(t in(e=this.h)&&delete e[t])),this.j=new Tn(this)}function _n(e){pe.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var t=e.__sm__;if(t){e:{for(const n in t){e=n;break e}e=void 0}(this.i=e)&&(e=this.i,t=null!==t&&e in t?t[e]:void 0),this.data=t}else this.data=e}function Sn(){ye.call(this),this.status=1}function Tn(e){this.g=e}(e=$t.prototype).Ha=function(e){this.J=e},e.ea=function(e,t,n,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);t=t?t.toUpperCase():"GET",this.D=e,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Ae.g(),this.v=this.o?fe(this.o):fe(Ae),this.g.onreadystatechange=l(this.Ea,this);try{this.B=!0,this.g.open(t,String(e),!0),this.B=!1}catch(o){return void Gt(this,o)}if(e=n||"",n=new Map(this.headers),r)if(Object.getPrototypeOf(r)===Object.prototype)for(var i in r)n.set(i,r[i]);else{if("function"!=typeof r.keys||"function"!=typeof r.get)throw Error("Unknown input type for opt_headers: "+String(r));for(const e of r.keys())n.set(e,r.get(e))}r=Array.from(n.keys()).find((e=>"content-type"==e.toLowerCase())),i=s.FormData&&e instanceof s.FormData,!(0<=Array.prototype.indexOf.call(Kt,t,void 0))||r||i||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[s,a]of n)this.g.setRequestHeader(s,a);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Xt(this),this.u=!0,this.g.send(e),this.u=!1}catch(o){Gt(this,o)}},e.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=e||7,te(this,"complete"),te(this,"abort"),Wt(this))},e.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Wt(this,!0)),$t.aa.N.call(this)},e.Ea=function(){this.s||(this.B||this.u||this.j?Qt(this):this.bb())},e.bb=function(){Qt(this)},e.isActive=function(){return!!this.g},e.Z=function(){try{return 2<Jt(this)?this.g.status:-1}catch(e){return-1}},e.oa=function(){try{return this.g?this.g.responseText:""}catch(e){return""}},e.Oa=function(e){if(this.g){var t=this.g.responseText;return e&&0==t.indexOf(e)&&(t=t.substring(e.length)),ue(t)}},e.Ba=function(){return this.m},e.Ka=function(){return"string"==typeof this.l?this.l:String(this.l)},(e=en.prototype).la=8,e.G=1,e.connect=function(e,t,n,r){Se(0),this.W=e,this.H=t||{},n&&void 0!==r&&(this.H.OSID=n,this.H.OAID=r),this.F=this.X,this.I=vn(this,null,this.W),sn(this)},e.Ga=function(e){if(this.s)if(this.s=null,1==this.G){if(!e){this.U=Math.floor(1e5*Math.random()),e=this.U++;const s=new Oe(this,this.j,e);let i=this.o;if(this.S&&(i?(i=w(i),E(i,this.S)):i=this.S),null!==this.m||this.O||(s.H=i,i=null),this.P)e:{for(var t=0,n=0;n<this.i.length;n++){var r=this.i[n];if(void 0===(r="__data__"in r.map&&"string"==typeof(r=r.map.__data__)?r.length:void 0))break;if(4096<(t+=r)){t=n;break e}if(4096===t||n===this.i.length-1){t=n+1;break e}}t=1e3}else t=1e3;t=cn(this,s,t),yt(n=ft(this.I),"RID",e),yt(n,"CVER",22),this.D&&yt(n,"X-HTTP-Session-Id",this.D),an(this,n),i&&(this.O?t="headers="+encodeURIComponent(String(Bt(i)))+"&"+t:this.m&&qt(n,this.m,i)),Ye(this.h,s),this.Ua&&yt(n,"TYPE","init"),this.P?(yt(n,"$req",t),yt(n,"SID","null"),s.T=!0,Pe(s,n,null)):Pe(s,n,t),this.G=2}}else 3==this.G&&(e?on(this,e):0==this.i.length||We(this.h)||on(this))},e.Fa=function(){if(this.u=null,dn(this),this.ba&&!(this.M||null==this.g||0>=this.R)){var e=2*this.R;this.j.info("BP detection timer enabled: "+e),this.A=Ie(l(this.ab,this),e)}},e.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Se(10),nn(this),dn(this))},e.Za=function(){null!=this.C&&(this.C=null,nn(this),un(this),Se(19))},e.fb=function(e){e?(this.j.info("Successfully pinged google.com"),Se(2)):(this.j.info("Failed to ping google.com"),Se(1))},e.isActive=function(){return!!this.l&&this.l.isActive(this)},(e=bn.prototype).ua=function(){},e.ta=function(){},e.sa=function(){},e.ra=function(){},e.isActive=function(){return!0},e.Na=function(){},En.prototype.g=function(e,t){return new xn(e,t)},h(xn,ee),xn.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},xn.prototype.close=function(){tn(this.g)},xn.prototype.o=function(e){var t=this.g;if("string"==typeof e){var n={};n.__data__=e,e=n}else this.u&&((n={}).__data__=le(e),e=n);t.i.push(new He(t.Ya++,e)),3==t.G&&sn(t)},xn.prototype.N=function(){this.g.l=null,delete this.j,tn(this.g),delete this.g,xn.aa.N.call(this)},h(_n,pe),h(Sn,ye),h(Tn,bn),Tn.prototype.ua=function(){te(this.g,"a")},Tn.prototype.ta=function(e){te(this.g,new _n(e))},Tn.prototype.sa=function(e){te(this.g,new Sn)},Tn.prototype.ra=function(){te(this.g,"b")},En.prototype.createWebChannel=En.prototype.g,xn.prototype.send=xn.prototype.o,xn.prototype.open=xn.prototype.m,xn.prototype.close=xn.prototype.close,ht=function(){return new En},ut=function(){return be()},lt=ve,ct={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},De.NO_ERROR=0,De.TIMEOUT=8,De.HTTP_ERROR=6,at=De,ke.COMPLETE="complete",ot=ke,ge.EventType=me,me.OPEN="a",me.CLOSE="b",me.ERROR="c",me.MESSAGE="d",ee.prototype.listen=ee.prototype.K,it=ge,$t.prototype.listenOnce=$t.prototype.L,$t.prototype.getLastError=$t.prototype.Ka,$t.prototype.getLastErrorCode=$t.prototype.Ba,$t.prototype.getStatus=$t.prototype.Z,$t.prototype.getResponseJson=$t.prototype.Oa,$t.prototype.getResponseText=$t.prototype.oa,$t.prototype.send=$t.prototype.ea,$t.prototype.setWithCredentials=$t.prototype.Ha,st=$t}).apply(void 0!==dt?dt:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});const ft="@firebase/firestore",gt="4.8.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}mt.UNAUTHENTICATED=new mt(null),mt.GOOGLE_CREDENTIALS=new mt("google-credentials-uid"),mt.FIRST_PARTY=new mt("first-party-uid"),mt.MOCK_USER=new mt("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pt="11.10.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yt=new B("@firebase/firestore");function vt(){return yt.logLevel}function wt(e,...t){if(yt.logLevel<=j.DEBUG){const n=t.map(xt);yt.debug(`Firestore (${pt}): ${e}`,...n)}}function bt(e,...t){if(yt.logLevel<=j.ERROR){const n=t.map(xt);yt.error(`Firestore (${pt}): ${e}`,...n)}}function Et(e,...t){if(yt.logLevel<=j.WARN){const n=t.map(xt);yt.warn(`Firestore (${pt}): ${e}`,...n)}}function xt(e){if("string"==typeof e)return e;try{
/**
    * @license
    * Copyright 2020 Google LLC
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *   http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
return t=e,JSON.stringify(t)}catch(n){return e}var t}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _t(e,t,n){let r="Unexpected state";"string"==typeof t?r=t:n=t,St(e,r,n)}function St(e,t,n){let r=`FIRESTORE (${pt}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;if(void 0!==n)try{r+=" CONTEXT: "+JSON.stringify(n)}catch(s){r+=" CONTEXT: "+n}throw bt(r),new Error(r)}function Tt(e,t,n,r){let s="Unexpected state";"string"==typeof n?s=n:r=n,e||St(t,s,r)}function It(e,t){return e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ct={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Nt extends T{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class kt{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(mt.UNAUTHENTICATED)))}shutdown(){}}class Rt{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class Ot{constructor(e){this.t=e,this.currentUser=mt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Tt(void 0===this.o,42304);let n=this.i;const r=e=>this.i!==n?(n=this.i,t(e)):Promise.resolve();let s=new At;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new At,e.enqueueRetryable((()=>r(this.currentUser)))};const i=()=>{const t=s;e.enqueueRetryable((async()=>{await t.promise,await r(this.currentUser)}))},o=e=>{wt("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit((e=>o(e))),setTimeout((()=>{if(!this.auth){const e=this.t.getImmediate({optional:!0});e?o(e):(wt("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new At)}}),0),i()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((t=>this.i!==e?(wt("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):t?(Tt("string"==typeof t.accessToken,31837,{l:t}),new Dt(t.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Tt(null===e||"string"==typeof e,2055,{h:e}),new mt(e)}}class Lt{constructor(e,t,n){this.P=e,this.T=t,this.I=n,this.type="FirstParty",this.user=mt.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class jt{constructor(e,t,n){this.P=e,this.T=t,this.I=n}getToken(){return Promise.resolve(new Lt(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable((()=>t(mt.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Mt{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Pt{constructor(e,t){var n;this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,null!=(n=e)&&void 0!==n.settings&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){Tt(void 0===this.o,3512);const n=e=>{null!=e.error&&wt("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);const n=e.token!==this.m;return this.m=e.token,wt("FirebaseAppCheckTokenProvider",`Received ${n?"new":"existing"} token.`),n?t(e.token):Promise.resolve()};this.o=t=>{e.enqueueRetryable((()=>n(t)))};const r=e=>{wt("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((e=>r(e))),setTimeout((()=>{if(!this.appCheck){const e=this.V.getImmediate({optional:!0});e?r(e):wt("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Mt(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((e=>e?(Tt("string"==typeof e.token,44558,{tokenResult:e}),this.m=e.token,new Mt(e.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vt(e){const t="undefined"!=typeof self&&(self.crypto||self.msCrypto),n=new Uint8Array(e);if(t&&"function"==typeof t.getRandomValues)t.getRandomValues(n);else for(let r=0;r<e;r++)n[r]=Math.floor(256*Math.random());return n}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ft(){return new TextEncoder}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{static newId(){const e=62*Math.floor(256/62);let t="";for(;t.length<20;){const n=Vt(40);for(let r=0;r<n.length;++r)t.length<20&&n[r]<e&&(t+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(n[r]%62))}return t}}function Bt(e,t){return e<t?-1:e>t?1:0}function qt(e,t){let n=0;for(;n<e.length&&n<t.length;){const r=e.codePointAt(n),s=t.codePointAt(n);if(r!==s){if(r<128&&s<128)return Bt(r,s);{const i=Ft(),o=zt(i.encode($t(e,n)),i.encode($t(t,n)));return 0!==o?o:Bt(r,s)}}n+=r>65535?2:1}return Bt(e.length,t.length)}function $t(e,t){return e.codePointAt(t)>65535?e.substring(t,t+2):e.substring(t,t+1)}function zt(e,t){for(let n=0;n<e.length&&n<t.length;++n)if(e[n]!==t[n])return Bt(e[n],t[n]);return Bt(e.length,t.length)}function Kt(e,t,n){return e.length===t.length&&e.every(((e,r)=>n(e,t[r])))}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gt="__name__";class Ht{constructor(e,t,n){void 0===t?t=0:t>e.length&&_t(637,{offset:t,range:e.length}),void 0===n?n=e.length-t:n>e.length-t&&_t(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return 0===Ht.comparator(this,e)}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Ht?e.forEach((e=>{t.push(e)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let r=0;r<n;r++){const n=Ht.compareSegments(e.get(r),t.get(r));if(0!==n)return n}return Bt(e.length,t.length)}static compareSegments(e,t){const n=Ht.isNumericId(e),r=Ht.isNumericId(t);return n&&!r?-1:!n&&r?1:n&&r?Ht.extractNumericId(e).compare(Ht.extractNumericId(t)):qt(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return tt.fromString(e.substring(4,e.length-2))}}class Qt extends Ht{construct(e,t,n){return new Qt(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new Nt(Ct.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter((e=>e.length>0)))}return new Qt(t)}static emptyPath(){return new Qt([])}}const Wt=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Xt extends Ht{construct(e,t,n){return new Xt(e,t,n)}static isValidIdentifier(e){return Wt.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Xt.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===Gt}static keyField(){return new Xt([Gt])}static fromServerFormat(e){const t=[];let n="",r=0;const s=()=>{if(0===n.length)throw new Nt(Ct.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let i=!1;for(;r<e.length;){const t=e[r];if("\\"===t){if(r+1===e.length)throw new Nt(Ct.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const t=e[r+1];if("\\"!==t&&"."!==t&&"`"!==t)throw new Nt(Ct.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=t,r+=2}else"`"===t?(i=!i,r++):"."!==t||i?(n+=t,r++):(s(),r++)}if(s(),i)throw new Nt(Ct.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Xt(t)}static emptyPath(){return new Xt([])}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt{constructor(e){this.path=e}static fromPath(e){return new Jt(Qt.fromString(e))}static fromName(e){return new Jt(Qt.fromString(e).popFirst(5))}static empty(){return new Jt(Qt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===Qt.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,t){return Qt.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new Jt(new Qt(e.slice()))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yt(e,t,n){if(!n)throw new Nt(Ct.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${t}.`)}function Zt(e){if(!Jt.isDocumentKey(e))throw new Nt(Ct.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`)}function en(e){if(Jt.isDocumentKey(e))throw new Nt(Ct.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function tn(e){return"object"==typeof e&&null!==e&&(Object.getPrototypeOf(e)===Object.prototype||null===Object.getPrototypeOf(e))}function nn(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{const n=(t=e).constructor?t.constructor.name:null;return n?`a custom ${n} object`:"an object"}}var t;return"function"==typeof e?"a function":_t(12329,{type:typeof e})}function rn(e,t){if("_delegate"in e&&(e=e._delegate),!(e instanceof t)){if(t.name===e.constructor.name)throw new Nt(Ct.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=nn(e);throw new Nt(Ct.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${n}`)}}return e}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function sn(e,t){const n={typeString:e};return t&&(n.value=t),n}function on(e,t){if(!tn(e))throw new Nt(Ct.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in t)if(t[r]){const s=t[r].typeString,i="value"in t[r]?{value:t[r].value}:void 0;if(!(r in e)){n=`JSON missing required field: '${r}'`;break}const o=e[r];if(s&&typeof o!==s){n=`JSON field '${r}' must be a ${s}.`;break}if(void 0!==i&&o!==i.value){n=`Expected '${r}' field to equal '${i.value}'`;break}}if(n)throw new Nt(Ct.INVALID_ARGUMENT,n);return!0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const an=-62135596800,cn=1e6;class ln{static now(){return ln.fromMillis(Date.now())}static fromDate(e){return ln.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*cn);return new ln(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new Nt(Ct.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new Nt(Ct.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<an)throw new Nt(Ct.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new Nt(Ct.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/cn}_compareTo(e){return this.seconds===e.seconds?Bt(this.nanoseconds,e.nanoseconds):Bt(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ln._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(on(e,ln._jsonSchema))return new ln(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-an;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ln._jsonSchemaVersion="firestore/timestamp/1.0",ln._jsonSchema={type:sn("string",ln._jsonSchemaVersion),seconds:sn("number"),nanoseconds:sn("number")};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class un{static fromTimestamp(e){return new un(e)}static min(){return new un(new ln(0,0))}static max(){return new un(new ln(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hn(e){return new dn(e.readTime,e.key,-1)}class dn{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new dn(un.min(),Jt.empty(),-1)}static max(){return new dn(un.max(),Jt.empty(),-1)}}function fn(e,t){let n=e.readTime.compareTo(t.readTime);return 0!==n?n:(n=Jt.comparator(e.documentKey,t.documentKey),0!==n?n:Bt(e.largestBatchId,t.largestBatchId)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */)}class gn{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mn(e){if(e.code!==Ct.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==e.message)throw e;wt("LocalStore","Unexpectedly lost primary lease")}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pn{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)}),(e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&_t(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new pn(((n,r)=>{this.nextCallback=t=>{this.wrapSuccess(e,t).next(n,r)},this.catchCallback=e=>{this.wrapFailure(t,e).next(n,r)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof pn?t:pn.resolve(t)}catch(t){return pn.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):pn.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):pn.reject(t)}static resolve(e){return new pn(((t,n)=>{t(e)}))}static reject(e){return new pn(((t,n)=>{n(e)}))}static waitFor(e){return new pn(((t,n)=>{let r=0,s=0,i=!1;e.forEach((e=>{++r,e.next((()=>{++s,i&&s===r&&t()}),(e=>n(e)))})),i=!0,s===r&&t()}))}static or(e){let t=pn.resolve(!1);for(const n of e)t=t.next((e=>e?pn.resolve(e):n()));return t}static forEach(e,t){const n=[];return e.forEach(((e,r)=>{n.push(t.call(this,e,r))})),this.waitFor(n)}static mapArray(e,t){return new pn(((n,r)=>{const s=e.length,i=new Array(s);let o=0;for(let a=0;a<s;a++){const c=a;t(e[c]).next((e=>{i[c]=e,++o,o===s&&n(i)}),(e=>r(e)))}}))}static doWhile(e,t){return new pn(((n,r)=>{const s=()=>{!0===e()?t().next((()=>{s()}),r):n()};s()}))}}function yn(e){return"IndexedDbTransactionError"===e.name}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=e=>this._e(e),this.ae=e=>t.writeSequenceNumber(e))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ae&&this.ae(e),e}}vn.ue=-1;function wn(e){return null==e}function bn(e){return 0===e&&1/e==-1/0}function En(e,t){let n=t;const r=e.length;for(let s=0;s<r;s++){const t=e.charAt(s);switch(t){case"\0":n+="";break;case"":n+="";break;default:n+=t}}return n}function xn(e){return e+""}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _n(e){let t=0;for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t++;return t}function Sn(e,t){for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t(n,e[n])}function Tn(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class In{constructor(e,t){this.comparator=e,this.root=t||Nn.EMPTY}insert(e,t){return new In(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Nn.BLACK,null,null))}remove(e){return new In(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Nn.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(0===n)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(0===r)return t+n.left.size;r<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,n)=>(e(t,n),!1)))}toString(){const e=[];return this.inorderTraversal(((t,n)=>(e.push(`${t}:${n}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Cn(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Cn(this.root,e,this.comparator,!1)}getReverseIterator(){return new Cn(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Cn(this.root,e,this.comparator,!0)}}class Cn{constructor(e,t,n,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?n(e.key,t):1,t&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(0===s){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Nn{constructor(e,t,n,r,s){this.key=e,this.value=t,this.color=null!=n?n:Nn.RED,this.left=null!=r?r:Nn.EMPTY,this.right=null!=s?s:Nn.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,r,s){return new Nn(null!=e?e:this.key,null!=t?t:this.value,null!=n?n:this.color,null!=r?r:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let r=this;const s=n(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,t,n),null):0===s?r.copy(null,t,null,null,null):r.copy(null,null,null,null,r.right.insert(e,t,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return Nn.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,r=this;if(t(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),0===t(e,r.key)){if(r.right.isEmpty())return Nn.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Nn.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Nn.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw _t(43730,{key:this.key,value:this.value});if(this.right.isRed())throw _t(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw _t(27949);return e+(this.isRed()?0:1)}}Nn.EMPTY=null,Nn.RED=!0,Nn.BLACK=!1,Nn.EMPTY=new class{constructor(){this.size=0}get key(){throw _t(57766)}get value(){throw _t(16141)}get color(){throw _t(16727)}get left(){throw _t(29726)}get right(){throw _t(36894)}copy(e,t,n,r,s){return this}insert(e,t,n){return new Nn(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class An{constructor(e){this.comparator=e,this.data=new In(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,n)=>(e(t),!1)))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const r=n.getNext();if(this.comparator(r.key,e[1])>=0)return;t(r.key)}}forEachWhile(e,t){let n;for(n=void 0!==t?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Dn(this.data.getIterator())}getIteratorFrom(e){return new Dn(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((e=>{t=t.add(e)})),t}isEqual(e){if(!(e instanceof An))return!1;if(this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const e=t.getNext().key,r=n.getNext().key;if(0!==this.comparator(e,r))return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new An(this.comparator);return t.data=e,t}}class Dn{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kn{constructor(e){this.fields=e,e.sort(Xt.comparator)}static empty(){return new kn([])}unionWith(e){let t=new An(Xt.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new kn(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Kt(this.fields,e.fields,((e,t)=>e.isEqual(t)))}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rn extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class On{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(e){try{return atob(e)}catch(t){throw"undefined"!=typeof DOMException&&t instanceof DOMException?new Rn("Invalid base64 string: "+t):t}}(e);return new On(t)}static fromUint8Array(e){const t=function(e){let t="";for(let n=0;n<e.length;++n)t+=String.fromCharCode(e[n]);return t}(e);return new On(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return e=this.binaryString,btoa(e);var e}toUint8Array(){return function(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Bt(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}On.EMPTY_BYTE_STRING=new On("");const Ln=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function jn(e){if(Tt(!!e,39018),"string"==typeof e){let t=0;const n=Ln.exec(e);if(Tt(!!n,46558,{timestamp:e}),n[1]){let e=n[1];e=(e+"000000000").substr(0,9),t=Number(e)}const r=new Date(e);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:Mn(e.seconds),nanos:Mn(e.nanos)}}function Mn(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function Pn(e){return"string"==typeof e?On.fromBase64String(e):On.fromUint8Array(e)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vn="server_timestamp",Fn="__type__",Un="__previous_value__",Bn="__local_write_time__";function qn(e){var t,n;return(null===(n=((null===(t=null==e?void 0:e.mapValue)||void 0===t?void 0:t.fields)||{})[Fn])||void 0===n?void 0:n.stringValue)===Vn}function $n(e){const t=e.mapValue.fields[Un];return qn(t)?$n(t):t}function zn(e){const t=jn(e.mapValue.fields[Bn].timestampValue);return new ln(t.seconds,t.nanos)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kn{constructor(e,t,n,r,s,i,o,a,c,l){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=o,this.longPollingOptions=a,this.useFetchStreams=c,this.isUsingEmulator=l}}const Gn="(default)";class Hn{constructor(e,t){this.projectId=e,this.database=t||Gn}static empty(){return new Hn("","")}get isDefaultDatabase(){return this.database===Gn}isEqual(e){return e instanceof Hn&&e.projectId===this.projectId&&e.database===this.database}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qn="__type__",Wn="__max__",Xn={},Jn="__vector__",Yn="value";function Zn(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?qn(e)?4:function(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===Wn}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e)?9007199254740991:function(e){var t,n;return(null===(n=((null===(t=null==e?void 0:e.mapValue)||void 0===t?void 0:t.fields)||{})[Qn])||void 0===n?void 0:n.stringValue)===Jn}(e)?10:11:_t(28295,{value:e})}function er(e,t){if(e===t)return!0;const n=Zn(e);if(n!==Zn(t))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===t.booleanValue;case 4:return zn(e).isEqual(zn(t));case 3:return function(e,t){if("string"==typeof e.timestampValue&&"string"==typeof t.timestampValue&&e.timestampValue.length===t.timestampValue.length)return e.timestampValue===t.timestampValue;const n=jn(e.timestampValue),r=jn(t.timestampValue);return n.seconds===r.seconds&&n.nanos===r.nanos}(e,t);case 5:return e.stringValue===t.stringValue;case 6:return r=t,Pn(e.bytesValue).isEqual(Pn(r.bytesValue));case 7:return e.referenceValue===t.referenceValue;case 8:return function(e,t){return Mn(e.geoPointValue.latitude)===Mn(t.geoPointValue.latitude)&&Mn(e.geoPointValue.longitude)===Mn(t.geoPointValue.longitude)}(e,t);case 2:return function(e,t){if("integerValue"in e&&"integerValue"in t)return Mn(e.integerValue)===Mn(t.integerValue);if("doubleValue"in e&&"doubleValue"in t){const n=Mn(e.doubleValue),r=Mn(t.doubleValue);return n===r?bn(n)===bn(r):isNaN(n)&&isNaN(r)}return!1}(e,t);case 9:return Kt(e.arrayValue.values||[],t.arrayValue.values||[],er);case 10:case 11:return function(e,t){const n=e.mapValue.fields||{},r=t.mapValue.fields||{};if(_n(n)!==_n(r))return!1;for(const s in n)if(n.hasOwnProperty(s)&&(void 0===r[s]||!er(n[s],r[s])))return!1;return!0}(e,t);default:return _t(52216,{left:e})}var r}function tr(e,t){return void 0!==(e.values||[]).find((e=>er(e,t)))}function nr(e,t){if(e===t)return 0;const n=Zn(e),r=Zn(t);if(n!==r)return Bt(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Bt(e.booleanValue,t.booleanValue);case 2:return function(e,t){const n=Mn(e.integerValue||e.doubleValue),r=Mn(t.integerValue||t.doubleValue);return n<r?-1:n>r?1:n===r?0:isNaN(n)?isNaN(r)?0:-1:1}(e,t);case 3:return rr(e.timestampValue,t.timestampValue);case 4:return rr(zn(e),zn(t));case 5:return qt(e.stringValue,t.stringValue);case 6:return function(e,t){const n=Pn(e),r=Pn(t);return n.compareTo(r)}(e.bytesValue,t.bytesValue);case 7:return function(e,t){const n=e.split("/"),r=t.split("/");for(let s=0;s<n.length&&s<r.length;s++){const e=Bt(n[s],r[s]);if(0!==e)return e}return Bt(n.length,r.length)}(e.referenceValue,t.referenceValue);case 8:return function(e,t){const n=Bt(Mn(e.latitude),Mn(t.latitude));return 0!==n?n:Bt(Mn(e.longitude),Mn(t.longitude))}(e.geoPointValue,t.geoPointValue);case 9:return sr(e.arrayValue,t.arrayValue);case 10:return function(e,t){var n,r,s,i;const o=e.fields||{},a=t.fields||{},c=null===(n=o[Yn])||void 0===n?void 0:n.arrayValue,l=null===(r=a[Yn])||void 0===r?void 0:r.arrayValue,u=Bt((null===(s=null==c?void 0:c.values)||void 0===s?void 0:s.length)||0,(null===(i=null==l?void 0:l.values)||void 0===i?void 0:i.length)||0);return 0!==u?u:sr(c,l)}(e.mapValue,t.mapValue);case 11:return function(e,t){if(e===Xn&&t===Xn)return 0;if(e===Xn)return 1;if(t===Xn)return-1;const n=e.fields||{},r=Object.keys(n),s=t.fields||{},i=Object.keys(s);r.sort(),i.sort();for(let o=0;o<r.length&&o<i.length;++o){const e=qt(r[o],i[o]);if(0!==e)return e;const t=nr(n[r[o]],s[i[o]]);if(0!==t)return t}return Bt(r.length,i.length)}(e.mapValue,t.mapValue);default:throw _t(23264,{le:n})}}function rr(e,t){if("string"==typeof e&&"string"==typeof t&&e.length===t.length)return Bt(e,t);const n=jn(e),r=jn(t),s=Bt(n.seconds,r.seconds);return 0!==s?s:Bt(n.nanos,r.nanos)}function sr(e,t){const n=e.values||[],r=t.values||[];for(let s=0;s<n.length&&s<r.length;++s){const e=nr(n[s],r[s]);if(e)return e}return Bt(n.length,r.length)}function ir(e){return or(e)}function or(e){return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){const t=jn(e);return`time(${t.seconds},${t.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?Pn(e.bytesValue).toBase64():"referenceValue"in e?function(e){return Jt.fromName(e).toString()}(e.referenceValue):"geoPointValue"in e?function(e){return`geo(${e.latitude},${e.longitude})`}(e.geoPointValue):"arrayValue"in e?function(e){let t="[",n=!0;for(const r of e.values||[])n?n=!1:t+=",",t+=or(r);return t+"]"}(e.arrayValue):"mapValue"in e?function(e){const t=Object.keys(e.fields||{}).sort();let n="{",r=!0;for(const s of t)r?r=!1:n+=",",n+=`${s}:${or(e.fields[s])}`;return n+"}"}(e.mapValue):_t(61005,{value:e})}function ar(e){switch(Zn(e)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=$n(e);return t?16+ar(t):16;case 5:return 2*e.stringValue.length;case 6:return Pn(e.bytesValue).approximateByteSize();case 7:return e.referenceValue.length;case 9:return(e.arrayValue.values||[]).reduce(((e,t)=>e+ar(t)),0);case 10:case 11:return function(e){let t=0;return Sn(e.fields,((e,n)=>{t+=e.length+ar(n)})),t}(e.mapValue);default:throw _t(13486,{value:e})}}function cr(e,t){return{referenceValue:`projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}`}}function lr(e){return!!e&&"integerValue"in e}function ur(e){return!!e&&"arrayValue"in e}function hr(e){return!!e&&"nullValue"in e}function dr(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function fr(e){return!!e&&"mapValue"in e}function gr(e){if(e.geoPointValue)return{geoPointValue:Object.assign({},e.geoPointValue)};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:Object.assign({},e.timestampValue)};if(e.mapValue){const t={mapValue:{fields:{}}};return Sn(e.mapValue.fields,((e,n)=>t.mapValue.fields[e]=gr(n))),t}if(e.arrayValue){const t={arrayValue:{values:[]}};for(let n=0;n<(e.arrayValue.values||[]).length;++n)t.arrayValue.values[n]=gr(e.arrayValue.values[n]);return t}return Object.assign({},e)}class mr{constructor(e){this.value=e}static empty(){return new mr({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!fr(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=gr(t)}setAll(e){let t=Xt.emptyPath(),n={},r=[];e.forEach(((e,s)=>{if(!t.isImmediateParentOf(s)){const e=this.getFieldsMap(t);this.applyChanges(e,n,r),n={},r=[],t=s.popLast()}e?n[s.lastSegment()]=gr(e):r.push(s.lastSegment())}));const s=this.getFieldsMap(t);this.applyChanges(s,n,r)}delete(e){const t=this.field(e.popLast());fr(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return er(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let r=t.mapValue.fields[e.get(n)];fr(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=r),t=r}return t.mapValue.fields}applyChanges(e,t,n){Sn(t,((t,n)=>e[t]=n));for(const r of n)delete e[r]}clone(){return new mr(gr(this.value))}}function pr(e){const t=[];return Sn(e.fields,((e,n)=>{const r=new Xt([e]);if(fr(n)){const e=pr(n.mapValue).fields;if(0===e.length)t.push(r);else for(const n of e)t.push(r.child(n))}else t.push(r)})),new kn(t)
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class yr{constructor(e,t,n,r,s,i,o){this.key=e,this.documentType=t,this.version=n,this.readTime=r,this.createTime=s,this.data=i,this.documentState=o}static newInvalidDocument(e){return new yr(e,0,un.min(),un.min(),un.min(),mr.empty(),0)}static newFoundDocument(e,t,n,r){return new yr(e,1,t,un.min(),n,r,0)}static newNoDocument(e,t){return new yr(e,2,t,un.min(),un.min(),mr.empty(),0)}static newUnknownDocument(e,t){return new yr(e,3,t,un.min(),un.min(),mr.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(un.min())||2!==this.documentType&&0!==this.documentType||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=mr.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=mr.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=un.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof yr&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new yr(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vr{constructor(e,t){this.position=e,this.inclusive=t}}function wr(e,t,n){let r=0;for(let s=0;s<e.position.length;s++){const i=t[s],o=e.position[s];if(r=i.field.isKeyField()?Jt.comparator(Jt.fromName(o.referenceValue),n.key):nr(o,n.data.field(i.field)),"desc"===i.dir&&(r*=-1),0!==r)break}return r}function br(e,t){if(null===e)return null===t;if(null===t)return!1;if(e.inclusive!==t.inclusive||e.position.length!==t.position.length)return!1;for(let n=0;n<e.position.length;n++)if(!er(e.position[n],t.position[n]))return!1;return!0}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Er{constructor(e,t="asc"){this.field=e,this.dir=t}}function xr(e,t){return e.dir===t.dir&&e.field.isEqual(t.field)}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _r{}class Sr extends _r{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?"in"===t||"not-in"===t?this.createKeyFieldInFilter(e,t,n):new kr(e,t,n):"array-contains"===t?new jr(e,n):"in"===t?new Mr(e,n):"not-in"===t?new Pr(e,n):"array-contains-any"===t?new Vr(e,n):new Sr(e,t,n)}static createKeyFieldInFilter(e,t,n){return"in"===t?new Rr(e,n):new Or(e,n)}matches(e){const t=e.data.field(this.field);return"!="===this.op?null!==t&&void 0===t.nullValue&&this.matchesComparison(nr(t,this.value)):null!==t&&Zn(this.value)===Zn(t)&&this.matchesComparison(nr(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return _t(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Tr extends _r{constructor(e,t){super(),this.filters=e,this.op=t,this.he=null}static create(e,t){return new Tr(e,t)}matches(e){return Ir(this)?void 0===this.filters.find((t=>!t.matches(e))):void 0!==this.filters.find((t=>t.matches(e)))}getFlattenedFilters(){return null!==this.he||(this.he=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function Ir(e){return"and"===e.op}function Cr(e){return function(e){for(const t of e.filters)if(t instanceof Tr)return!1;return!0}(e)&&Ir(e)}function Nr(e){if(e instanceof Sr)return e.field.canonicalString()+e.op.toString()+ir(e.value);if(Cr(e))return e.filters.map((e=>Nr(e))).join(",");{const t=e.filters.map((e=>Nr(e))).join(",");return`${e.op}(${t})`}}function Ar(e,t){return e instanceof Sr?(n=e,(r=t)instanceof Sr&&n.op===r.op&&n.field.isEqual(r.field)&&er(n.value,r.value)):e instanceof Tr?function(e,t){return t instanceof Tr&&e.op===t.op&&e.filters.length===t.filters.length&&e.filters.reduce(((e,n,r)=>e&&Ar(n,t.filters[r])),!0)}(e,t):void _t(19439);var n,r}function Dr(e){return e instanceof Sr?`${(t=e).field.canonicalString()} ${t.op} ${ir(t.value)}`:e instanceof Tr?function(e){return e.op.toString()+" {"+e.getFilters().map(Dr).join(" ,")+"}"}(e):"Filter";var t}class kr extends Sr{constructor(e,t,n){super(e,t,n),this.key=Jt.fromName(n.referenceValue)}matches(e){const t=Jt.comparator(e.key,this.key);return this.matchesComparison(t)}}class Rr extends Sr{constructor(e,t){super(e,"in",t),this.keys=Lr("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class Or extends Sr{constructor(e,t){super(e,"not-in",t),this.keys=Lr("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Lr(e,t){var n;return((null===(n=t.arrayValue)||void 0===n?void 0:n.values)||[]).map((e=>Jt.fromName(e.referenceValue)))}class jr extends Sr{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return ur(t)&&tr(t.arrayValue,this.value)}}class Mr extends Sr{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return null!==t&&tr(this.value.arrayValue,t)}}class Pr extends Sr{constructor(e,t){super(e,"not-in",t)}matches(e){if(tr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return null!==t&&void 0===t.nullValue&&!tr(this.value.arrayValue,t)}}class Vr extends Sr{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!ur(t)||!t.arrayValue.values)&&t.arrayValue.values.some((e=>tr(this.value.arrayValue,e)))}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fr{constructor(e,t=null,n=[],r=[],s=null,i=null,o=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=r,this.limit=s,this.startAt=i,this.endAt=o,this.Pe=null}}function Ur(e,t=null,n=[],r=[],s=null,i=null,o=null){return new Fr(e,t,n,r,s,i,o)}function Br(e){const t=It(e);if(null===t.Pe){let e=t.path.canonicalString();null!==t.collectionGroup&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map((e=>Nr(e))).join(","),e+="|ob:",e+=t.orderBy.map((e=>{return(t=e).field.canonicalString()+t.dir;var t})).join(","),wn(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map((e=>ir(e))).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map((e=>ir(e))).join(",")),t.Pe=e}return t.Pe}function qr(e,t){if(e.limit!==t.limit)return!1;if(e.orderBy.length!==t.orderBy.length)return!1;for(let n=0;n<e.orderBy.length;n++)if(!xr(e.orderBy[n],t.orderBy[n]))return!1;if(e.filters.length!==t.filters.length)return!1;for(let n=0;n<e.filters.length;n++)if(!Ar(e.filters[n],t.filters[n]))return!1;return e.collectionGroup===t.collectionGroup&&!!e.path.isEqual(t.path)&&!!br(e.startAt,t.startAt)&&br(e.endAt,t.endAt)}function $r(e){return Jt.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zr{constructor(e,t=null,n=[],r=[],s=null,i="F",o=null,a=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=r,this.limit=s,this.limitType=i,this.startAt=o,this.endAt=a,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function Kr(e){return new zr(e)}function Gr(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function Hr(e){return null!==e.collectionGroup}function Qr(e){const t=It(e);if(null===t.Te){t.Te=[];const e=new Set;for(const r of t.explicitOrderBy)t.Te.push(r),e.add(r.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(e){let t=new An(Xt.comparator);return e.filters.forEach((e=>{e.getFlattenedFilters().forEach((e=>{e.isInequality()&&(t=t.add(e.field))}))})),t})(t).forEach((r=>{e.has(r.canonicalString())||r.isKeyField()||t.Te.push(new Er(r,n))})),e.has(Xt.keyField().canonicalString())||t.Te.push(new Er(Xt.keyField(),n))}return t.Te}function Wr(e){const t=It(e);return t.Ie||(t.Ie=function(e,t){if("F"===e.limitType)return Ur(e.path,e.collectionGroup,t,e.filters,e.limit,e.startAt,e.endAt);{t=t.map((e=>{const t="desc"===e.dir?"asc":"desc";return new Er(e.field,t)}));const n=e.endAt?new vr(e.endAt.position,e.endAt.inclusive):null,r=e.startAt?new vr(e.startAt.position,e.startAt.inclusive):null;return Ur(e.path,e.collectionGroup,t,e.filters,e.limit,n,r)}}(t,Qr(e))),t.Ie}function Xr(e,t){const n=e.filters.concat([t]);return new zr(e.path,e.collectionGroup,e.explicitOrderBy.slice(),n,e.limit,e.limitType,e.startAt,e.endAt)}function Jr(e,t,n){return new zr(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),t,n,e.startAt,e.endAt)}function Yr(e,t){return qr(Wr(e),Wr(t))&&e.limitType===t.limitType}function Zr(e){return`${Br(Wr(e))}|lt:${e.limitType}`}function es(e){return`Query(target=${function(e){let t=e.path.canonicalString();return null!==e.collectionGroup&&(t+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(t+=`, filters: [${e.filters.map((e=>Dr(e))).join(", ")}]`),wn(e.limit)||(t+=", limit: "+e.limit),e.orderBy.length>0&&(t+=`, orderBy: [${e.orderBy.map((e=>{return`${(t=e).field.canonicalString()} (${t.dir})`;var t})).join(", ")}]`),e.startAt&&(t+=", startAt: ",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((e=>ir(e))).join(",")),e.endAt&&(t+=", endAt: ",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((e=>ir(e))).join(",")),`Target(${t})`}(Wr(e))}; limitType=${e.limitType})`}function ts(e,t){return t.isFoundDocument()&&function(e,t){const n=t.key.path;return null!==e.collectionGroup?t.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(n):Jt.isDocumentKey(e.path)?e.path.isEqual(n):e.path.isImmediateParentOf(n)}(e,t)&&function(e,t){for(const n of Qr(e))if(!n.field.isKeyField()&&null===t.data.field(n.field))return!1;return!0}(e,t)&&function(e,t){for(const n of e.filters)if(!n.matches(t))return!1;return!0}(e,t)&&(r=t,!((n=e).startAt&&!function(e,t,n){const r=wr(e,t,n);return e.inclusive?r<=0:r<0}(n.startAt,Qr(n),r)||n.endAt&&!function(e,t,n){const r=wr(e,t,n);return e.inclusive?r>=0:r>0}(n.endAt,Qr(n),r)));var n,r}function ns(e){return(t,n)=>{let r=!1;for(const s of Qr(e)){const e=rs(s,t,n);if(0!==e)return e;r=r||s.field.isKeyField()}return 0}}function rs(e,t,n){const r=e.field.isKeyField()?Jt.comparator(t.key,n.key):function(e,t,n){const r=t.data.field(e),s=n.data.field(e);return null!==r&&null!==s?nr(r,s):_t(42886)}(e.field,t,n);switch(e.dir){case"asc":return r;case"desc":return-1*r;default:return _t(19790,{direction:e.dir})}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ss{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0!==n)for(const[r,s]of n)if(this.equalsFn(r,e))return s}has(e){return void 0!==this.get(e)}set(e,t){const n=this.mapKeyFn(e),r=this.inner[n];if(void 0===r)return this.inner[n]=[[e,t]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,t]);r.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0===n)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return 1===n.length?delete this.inner[t]:n.splice(r,1),this.innerSize--,!0;return!1}forEach(e){Sn(this.inner,((t,n)=>{for(const[r,s]of n)e(r,s)}))}isEmpty(){return Tn(this.inner)}size(){return this.innerSize}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const is=new In(Jt.comparator);function os(){return is}const as=new In(Jt.comparator);function cs(...e){let t=as;for(const n of e)t=t.insert(n.key,n);return t}function ls(e){let t=as;return e.forEach(((e,n)=>t=t.insert(e,n.overlayedDocument))),t}function us(){return ds()}function hs(){return ds()}function ds(){return new ss((e=>e.toString()),((e,t)=>e.isEqual(t)))}const fs=new In(Jt.comparator),gs=new An(Jt.comparator);function ms(...e){let t=gs;for(const n of e)t=t.add(n);return t}const ps=new An(Bt);
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ys(e,t){if(e.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:bn(t)?"-0":t}}function vs(e){return{integerValue:""+e}}function ws(e,t){return function(e){return"number"==typeof e&&Number.isInteger(e)&&!bn(e)&&e<=Number.MAX_SAFE_INTEGER&&e>=Number.MIN_SAFE_INTEGER}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(t)?vs(t):ys(e,t)}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bs{constructor(){this._=void 0}}function Es(e,t,n){return e instanceof Ss?function(e,t){const n={fields:{[Fn]:{stringValue:Vn},[Bn]:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return t&&qn(t)&&(t=$n(t)),t&&(n.fields[Un]=t),{mapValue:n}}(n,t):e instanceof Ts?Is(e,t):e instanceof Cs?Ns(e,t):function(e,t){const n=_s(e,t),r=Ds(n)+Ds(e.Ee);return lr(n)&&lr(e.Ee)?vs(r):ys(e.serializer,r)}(e,t)}function xs(e,t,n){return e instanceof Ts?Is(e,t):e instanceof Cs?Ns(e,t):n}function _s(e,t){return e instanceof As?lr(n=t)||(r=n)&&"doubleValue"in r?t:{integerValue:0}:null;var n,r}class Ss extends bs{}class Ts extends bs{constructor(e){super(),this.elements=e}}function Is(e,t){const n=ks(t);for(const r of e.elements)n.some((e=>er(e,r)))||n.push(r);return{arrayValue:{values:n}}}class Cs extends bs{constructor(e){super(),this.elements=e}}function Ns(e,t){let n=ks(t);for(const r of e.elements)n=n.filter((e=>!er(e,r)));return{arrayValue:{values:n}}}class As extends bs{constructor(e,t){super(),this.serializer=e,this.Ee=t}}function Ds(e){return Mn(e.integerValue||e.doubleValue)}function ks(e){return ur(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}class Rs{constructor(e,t){this.version=e,this.transformResults=t}}class Os{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Os}static exists(e){return new Os(void 0,e)}static updateTime(e){return new Os(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ls(e,t){return void 0!==e.updateTime?t.isFoundDocument()&&t.version.isEqual(e.updateTime):void 0===e.exists||e.exists===t.isFoundDocument()}class js{}function Ms(e,t){if(!e.hasLocalMutations||t&&0===t.fields.length)return null;if(null===t)return e.isNoDocument()?new Gs(e.key,Os.none()):new Bs(e.key,e.data,Os.none());{const n=e.data,r=mr.empty();let s=new An(Xt.comparator);for(let e of t.fields)if(!s.has(e)){let t=n.field(e);null===t&&e.length>1&&(e=e.popLast(),t=n.field(e)),null===t?r.delete(e):r.set(e,t),s=s.add(e)}return new qs(e.key,r,new kn(s.toArray()),Os.none())}}function Ps(e,t,n){var r;e instanceof Bs?function(e,t,n){const r=e.value.clone(),s=zs(e.fieldTransforms,t,n.transformResults);r.setAll(s),t.convertToFoundDocument(n.version,r).setHasCommittedMutations()}(e,t,n):e instanceof qs?function(e,t,n){if(!Ls(e.precondition,t))return void t.convertToUnknownDocument(n.version);const r=zs(e.fieldTransforms,t,n.transformResults),s=t.data;s.setAll($s(e)),s.setAll(r),t.convertToFoundDocument(n.version,s).setHasCommittedMutations()}(e,t,n):(r=n,t.convertToNoDocument(r.version).setHasCommittedMutations())}function Vs(e,t,n,r){return e instanceof Bs?function(e,t,n,r){if(!Ls(e.precondition,t))return n;const s=e.value.clone(),i=Ks(e.fieldTransforms,r,t);return s.setAll(i),t.convertToFoundDocument(t.version,s).setHasLocalMutations(),null}(e,t,n,r):e instanceof qs?function(e,t,n,r){if(!Ls(e.precondition,t))return n;const s=Ks(e.fieldTransforms,r,t),i=t.data;return i.setAll($s(e)),i.setAll(s),t.convertToFoundDocument(t.version,i).setHasLocalMutations(),null===n?null:n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map((e=>e.field)))}(e,t,n,r):(s=t,i=n,Ls(e.precondition,s)?(s.convertToNoDocument(s.version).setHasLocalMutations(),null):i);var s,i}function Fs(e,t){let n=null;for(const r of e.fieldTransforms){const e=t.data.field(r.field),s=_s(r.transform,e||null);null!=s&&(null===n&&(n=mr.empty()),n.set(r.field,s))}return n||null}function Us(e,t){return e.type===t.type&&!!e.key.isEqual(t.key)&&!!e.precondition.isEqual(t.precondition)&&(n=e.fieldTransforms,r=t.fieldTransforms,!!(void 0===n&&void 0===r||n&&r&&Kt(n,r,((e,t)=>function(e,t){return e.field.isEqual(t.field)&&(n=e.transform,r=t.transform,n instanceof Ts&&r instanceof Ts||n instanceof Cs&&r instanceof Cs?Kt(n.elements,r.elements,er):n instanceof As&&r instanceof As?er(n.Ee,r.Ee):n instanceof Ss&&r instanceof Ss);var n,r}(e,t))))&&(0===e.type?e.value.isEqual(t.value):1!==e.type||e.data.isEqual(t.data)&&e.fieldMask.isEqual(t.fieldMask)));var n,r}class Bs extends js{constructor(e,t,n,r=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class qs extends js{constructor(e,t,n,r,s=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function $s(e){const t=new Map;return e.fieldMask.fields.forEach((n=>{if(!n.isEmpty()){const r=e.data.field(n);t.set(n,r)}})),t}function zs(e,t,n){const r=new Map;Tt(e.length===n.length,32656,{Ae:n.length,Re:e.length});for(let s=0;s<n.length;s++){const i=e[s],o=i.transform,a=t.data.field(i.field);r.set(i.field,xs(o,a,n[s]))}return r}function Ks(e,t,n){const r=new Map;for(const s of e){const e=s.transform,i=n.data.field(s.field);r.set(s.field,Es(e,i,t))}return r}class Gs extends js{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Hs extends js{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qs{constructor(e,t,n,r){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let r=0;r<this.mutations.length;r++){const t=this.mutations[r];t.key.isEqual(e.key)&&Ps(t,e,n[r])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=Vs(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=Vs(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=hs();return this.mutations.forEach((r=>{const s=e.get(r.key),i=s.overlayedDocument;let o=this.applyToLocalView(i,s.mutatedFields);o=t.has(r.key)?null:o;const a=Ms(i,o);null!==a&&n.set(r.key,a),i.isValidDocument()||i.convertToNoDocument(un.min())})),n}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),ms())}isEqual(e){return this.batchId===e.batchId&&Kt(this.mutations,e.mutations,((e,t)=>Us(e,t)))&&Kt(this.baseMutations,e.baseMutations,((e,t)=>Us(e,t)))}}class Ws{constructor(e,t,n,r){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=r}static from(e,t,n){Tt(e.mutations.length===n.length,58842,{Ve:e.mutations.length,me:n.length});let r=function(){return fs}();const s=e.mutations;for(let i=0;i<s.length;i++)r=r.insert(s[i].key,n[i].version);return new Ws(e,t,n,r)}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xs{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Js{constructor(e,t){this.count=e,this.unchangedNames=t}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ys,Zs;function ei(e){if(void 0===e)return bt("GRPC error has no .code"),Ct.UNKNOWN;switch(e){case Ys.OK:return Ct.OK;case Ys.CANCELLED:return Ct.CANCELLED;case Ys.UNKNOWN:return Ct.UNKNOWN;case Ys.DEADLINE_EXCEEDED:return Ct.DEADLINE_EXCEEDED;case Ys.RESOURCE_EXHAUSTED:return Ct.RESOURCE_EXHAUSTED;case Ys.INTERNAL:return Ct.INTERNAL;case Ys.UNAVAILABLE:return Ct.UNAVAILABLE;case Ys.UNAUTHENTICATED:return Ct.UNAUTHENTICATED;case Ys.INVALID_ARGUMENT:return Ct.INVALID_ARGUMENT;case Ys.NOT_FOUND:return Ct.NOT_FOUND;case Ys.ALREADY_EXISTS:return Ct.ALREADY_EXISTS;case Ys.PERMISSION_DENIED:return Ct.PERMISSION_DENIED;case Ys.FAILED_PRECONDITION:return Ct.FAILED_PRECONDITION;case Ys.ABORTED:return Ct.ABORTED;case Ys.OUT_OF_RANGE:return Ct.OUT_OF_RANGE;case Ys.UNIMPLEMENTED:return Ct.UNIMPLEMENTED;case Ys.DATA_LOSS:return Ct.DATA_LOSS;default:return _t(39323,{code:e})}}(Zs=Ys||(Ys={}))[Zs.OK=0]="OK",Zs[Zs.CANCELLED=1]="CANCELLED",Zs[Zs.UNKNOWN=2]="UNKNOWN",Zs[Zs.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Zs[Zs.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Zs[Zs.NOT_FOUND=5]="NOT_FOUND",Zs[Zs.ALREADY_EXISTS=6]="ALREADY_EXISTS",Zs[Zs.PERMISSION_DENIED=7]="PERMISSION_DENIED",Zs[Zs.UNAUTHENTICATED=16]="UNAUTHENTICATED",Zs[Zs.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Zs[Zs.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Zs[Zs.ABORTED=10]="ABORTED",Zs[Zs.OUT_OF_RANGE=11]="OUT_OF_RANGE",Zs[Zs.UNIMPLEMENTED=12]="UNIMPLEMENTED",Zs[Zs.INTERNAL=13]="INTERNAL",Zs[Zs.UNAVAILABLE=14]="UNAVAILABLE",Zs[Zs.DATA_LOSS=15]="DATA_LOSS";
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ti=new tt([4294967295,4294967295],0);function ni(e){const t=Ft().encode(e),n=new nt;return n.update(t),new Uint8Array(n.digest())}function ri(e){const t=new DataView(e.buffer),n=t.getUint32(0,!0),r=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new tt([n,r],0),new tt([s,i],0)]}class si{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new ii(`Invalid padding: ${t}`);if(n<0)throw new ii(`Invalid hash count: ${n}`);if(e.length>0&&0===this.hashCount)throw new ii(`Invalid hash count: ${n}`);if(0===e.length&&0!==t)throw new ii(`Invalid padding when bitmap length is 0: ${t}`);this.fe=8*e.length-t,this.ge=tt.fromNumber(this.fe)}pe(e,t,n){let r=e.add(t.multiply(tt.fromNumber(n)));return 1===r.compare(ti)&&(r=new tt([r.getBits(0),r.getBits(1)],0)),r.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.fe)return!1;const t=ni(e),[n,r]=ri(t);for(let s=0;s<this.hashCount;s++){const e=this.pe(n,r,s);if(!this.ye(e))return!1}return!0}static create(e,t,n){const r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new si(s,r,t);return n.forEach((e=>i.insert(e))),i}insert(e){if(0===this.fe)return;const t=ni(e),[n,r]=ri(t);for(let s=0;s<this.hashCount;s++){const e=this.pe(n,r,s);this.we(e)}}we(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class ii extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oi{constructor(e,t,n,r,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const r=new Map;return r.set(e,ai.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new oi(un.min(),r,new In(Bt),os(),ms())}}class ai{constructor(e,t,n,r,s){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new ai(n,t,ms(),ms(),ms())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ci{constructor(e,t,n,r){this.Se=e,this.removedTargetIds=t,this.key=n,this.be=r}}class li{constructor(e,t){this.targetId=e,this.De=t}}class ui{constructor(e,t,n=On.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=r}}class hi{constructor(){this.ve=0,this.Ce=gi(),this.Fe=On.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return 0!==this.ve}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=ms(),t=ms(),n=ms();return this.Ce.forEach(((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:t=t.add(r);break;case 1:n=n.add(r);break;default:_t(38017,{changeType:s})}})),new ai(this.Fe,this.Me,e,t,n)}ke(){this.xe=!1,this.Ce=gi()}qe(e,t){this.xe=!0,this.Ce=this.Ce.insert(e,t)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,Tt(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class di{constructor(e){this.We=e,this.Ge=new Map,this.ze=os(),this.je=fi(),this.Je=fi(),this.He=new In(Bt)}Ye(e){for(const t of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(t,e.be):this.Xe(t,e.key,e.be);for(const t of e.removedTargetIds)this.Xe(t,e.key,e.be)}et(e){this.forEachTarget(e,(t=>{const n=this.tt(t);switch(e.state){case 0:this.nt(t)&&n.Be(e.resumeToken);break;case 1:n.Ue(),n.Oe||n.ke(),n.Be(e.resumeToken);break;case 2:n.Ue(),n.Oe||this.removeTarget(t);break;case 3:this.nt(t)&&(n.Ke(),n.Be(e.resumeToken));break;case 4:this.nt(t)&&(this.rt(t),n.Be(e.resumeToken));break;default:_t(56790,{state:e.state})}}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Ge.forEach(((e,n)=>{this.nt(n)&&t(n)}))}it(e){const t=e.targetId,n=e.De.count,r=this.st(t);if(r){const s=r.target;if($r(s))if(0===n){const e=new Jt(s.path);this.Xe(t,e,yr.newNoDocument(e,un.min()))}else Tt(1===n,20013,{expectedCount:n});else{const r=this.ot(t);if(r!==n){const n=this._t(e),s=n?this.ut(n,e,r):1;if(0!==s){this.rt(t);const e=2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(t,e)}}}}}_t(e){const t=e.De.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:r=0},hashCount:s=0}=t;let i,o;try{i=Pn(n).toUint8Array()}catch(a){if(a instanceof Rn)return Et("Decoding the base64 bloom filter in existence filter failed ("+a.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw a}try{o=new si(i,r,s)}catch(a){return Et(a instanceof ii?"BloomFilter error: ":"Applying bloom filter failed: ",a),null}return 0===o.fe?null:o}ut(e,t,n){return t.De.count===n-this.ht(e,t.targetId)?0:2}ht(e,t){const n=this.We.getRemoteKeysForTarget(t);let r=0;return n.forEach((n=>{const s=this.We.lt(),i=`projects/${s.projectId}/databases/${s.database}/documents/${n.path.canonicalString()}`;e.mightContain(i)||(this.Xe(t,n,null),r++)})),r}Pt(e){const t=new Map;this.Ge.forEach(((n,r)=>{const s=this.st(r);if(s){if(n.current&&$r(s.target)){const t=new Jt(s.target.path);this.Tt(t).has(r)||this.It(r,t)||this.Xe(r,t,yr.newNoDocument(t,e))}n.Ne&&(t.set(r,n.Le()),n.ke())}}));let n=ms();this.Je.forEach(((e,t)=>{let r=!0;t.forEachWhile((e=>{const t=this.st(e);return!t||"TargetPurposeLimboResolution"===t.purpose||(r=!1,!1)})),r&&(n=n.add(e))})),this.ze.forEach(((t,n)=>n.setReadTime(e)));const r=new oi(e,t,this.He,this.ze,n);return this.ze=os(),this.je=fi(),this.Je=fi(),this.He=new In(Bt),r}Ze(e,t){if(!this.nt(e))return;const n=this.It(e,t.key)?2:0;this.tt(e).qe(t.key,n),this.ze=this.ze.insert(t.key,t),this.je=this.je.insert(t.key,this.Tt(t.key).add(e)),this.Je=this.Je.insert(t.key,this.dt(t.key).add(e))}Xe(e,t,n){if(!this.nt(e))return;const r=this.tt(e);this.It(e,t)?r.qe(t,1):r.Qe(t),this.Je=this.Je.insert(t,this.dt(t).delete(e)),this.Je=this.Je.insert(t,this.dt(t).add(e)),n&&(this.ze=this.ze.insert(t,n))}removeTarget(e){this.Ge.delete(e)}ot(e){const t=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let t=this.Ge.get(e);return t||(t=new hi,this.Ge.set(e,t)),t}dt(e){let t=this.Je.get(e);return t||(t=new An(Bt),this.Je=this.Je.insert(e,t)),t}Tt(e){let t=this.je.get(e);return t||(t=new An(Bt),this.je=this.je.insert(e,t)),t}nt(e){const t=null!==this.st(e);return t||wt("WatchChangeAggregator","Detected inactive target",e),t}st(e){const t=this.Ge.get(e);return t&&t.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new hi),this.We.getRemoteKeysForTarget(e).forEach((t=>{this.Xe(e,t,null)}))}It(e,t){return this.We.getRemoteKeysForTarget(e).has(t)}}function fi(){return new In(Jt.comparator)}function gi(){return new In(Jt.comparator)}const mi=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),pi=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),yi=(()=>({and:"AND",or:"OR"}))();class vi{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function wi(e,t){return e.useProto3Json||wn(t)?t:{value:t}}function bi(e,t){return e.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function Ei(e,t){return e.useProto3Json?t.toBase64():t.toUint8Array()}function xi(e,t){return bi(e,t.toTimestamp())}function _i(e){return Tt(!!e,49232),un.fromTimestamp(function(e){const t=jn(e);return new ln(t.seconds,t.nanos)}(e))}function Si(e,t){return Ti(e,t).canonicalString()}function Ti(e,t){const n=(r=e,new Qt(["projects",r.projectId,"databases",r.database])).child("documents");var r;return void 0===t?n:n.child(t)}function Ii(e){const t=Qt.fromString(e);return Tt(zi(t),10190,{key:t.toString()}),t}function Ci(e,t){return Si(e.databaseId,t.path)}function Ni(e,t){const n=Ii(t);if(n.get(1)!==e.databaseId.projectId)throw new Nt(Ct.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+e.databaseId.projectId);if(n.get(3)!==e.databaseId.database)throw new Nt(Ct.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+e.databaseId.database);return new Jt(ki(n))}function Ai(e,t){return Si(e.databaseId,t)}function Di(e){return new Qt(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function ki(e){return Tt(e.length>4&&"documents"===e.get(4),29091,{key:e.toString()}),e.popFirst(5)}function Ri(e,t,n){return{name:Ci(e,t),fields:n.value.mapValue.fields}}function Oi(e,t){return{documents:[Ai(e,t.path)]}}function Li(e,t){const n={structuredQuery:{}},r=t.path;let s;null!==t.collectionGroup?(s=r,n.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Ai(e,s);const i=function(e){if(0!==e.length)return qi(Tr.create(e,"and"))}(t.filters);i&&(n.structuredQuery.where=i);const o=function(e){if(0!==e.length)return e.map((e=>{return{field:Ui((t=e).field),direction:Pi(t.dir)};var t}))}(t.orderBy);o&&(n.structuredQuery.orderBy=o);const a=wi(e,t.limit);return null!==a&&(n.structuredQuery.limit=a),t.startAt&&(n.structuredQuery.startAt={before:(c=t.startAt).inclusive,values:c.position}),t.endAt&&(n.structuredQuery.endAt=function(e){return{before:!e.inclusive,values:e.position}}(t.endAt)),{Vt:n,parent:s};var c}function ji(e){let t=function(e){const t=Ii(e);return 4===t.length?Qt.emptyPath():ki(t)}(e.parent);const n=e.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){Tt(1===r,65062);const e=n.from[0];e.allDescendants?s=e.collectionId:t=t.child(e.collectionId)}let i=[];n.where&&(i=function(e){const t=Mi(e);return t instanceof Tr&&Cr(t)?t.getFilters():[t]}(n.where));let o=[];n.orderBy&&(o=n.orderBy.map((e=>{return new Er(Bi((t=e).field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(t.direction));var t})));let a=null;n.limit&&(a=function(e){let t;return t="object"==typeof e?e.value:e,wn(t)?null:t}(n.limit));let c=null;n.startAt&&(c=function(e){const t=!!e.before,n=e.values||[];return new vr(n,t)}(n.startAt));let l=null;return n.endAt&&(l=function(e){const t=!e.before,n=e.values||[];return new vr(n,t)}(n.endAt)),function(e,t,n,r,s,i,o,a){return new zr(e,t,n,r,s,i,o,a)}(t,s,o,i,a,"F",c,l)}function Mi(e){return void 0!==e.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":const t=Bi(e.unaryFilter.field);return Sr.create(t,"==",{doubleValue:NaN});case"IS_NULL":const n=Bi(e.unaryFilter.field);return Sr.create(n,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=Bi(e.unaryFilter.field);return Sr.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const s=Bi(e.unaryFilter.field);return Sr.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return _t(61313);default:return _t(60726)}}(e):void 0!==e.fieldFilter?(t=e,Sr.create(Bi(t.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return _t(58110);default:return _t(50506)}}(t.fieldFilter.op),t.fieldFilter.value)):void 0!==e.compositeFilter?function(e){return Tr.create(e.compositeFilter.filters.map((e=>Mi(e))),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return _t(1026)}}(e.compositeFilter.op))}(e):_t(30097,{filter:e});var t}function Pi(e){return mi[e]}function Vi(e){return pi[e]}function Fi(e){return yi[e]}function Ui(e){return{fieldPath:e.canonicalString()}}function Bi(e){return Xt.fromServerFormat(e.fieldPath)}function qi(e){return e instanceof Sr?function(e){if("=="===e.op){if(dr(e.value))return{unaryFilter:{field:Ui(e.field),op:"IS_NAN"}};if(hr(e.value))return{unaryFilter:{field:Ui(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(dr(e.value))return{unaryFilter:{field:Ui(e.field),op:"IS_NOT_NAN"}};if(hr(e.value))return{unaryFilter:{field:Ui(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ui(e.field),op:Vi(e.op),value:e.value}}}(e):e instanceof Tr?function(e){const t=e.getFilters().map((e=>qi(e)));return 1===t.length?t[0]:{compositeFilter:{op:Fi(e.op),filters:t}}}(e):_t(54877,{filter:e})}function $i(e){const t=[];return e.fields.forEach((e=>t.push(e.canonicalString()))),{fieldPaths:t}}function zi(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ki{constructor(e,t,n,r,s=un.min(),i=un.min(),o=On.EMPTY_BYTE_STRING,a=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=o,this.expectedCount=a}withSequenceNumber(e){return new Ki(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Ki(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Ki(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Ki(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(e){this.gt=e}}function Hi(e){const t=ji({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?Jr(t,t.limit,"L"):t}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qi{constructor(){this.Dn=new Wi}addToCollectionParentIndex(e,t){return this.Dn.add(t),pn.resolve()}getCollectionParents(e,t){return pn.resolve(this.Dn.getEntries(t))}addFieldIndex(e,t){return pn.resolve()}deleteFieldIndex(e,t){return pn.resolve()}deleteAllFieldIndexes(e){return pn.resolve()}createTargetIndexes(e,t){return pn.resolve()}getDocumentsMatchingTarget(e,t){return pn.resolve(null)}getIndexType(e,t){return pn.resolve(0)}getFieldIndexes(e,t){return pn.resolve([])}getNextCollectionGroupToUpdate(e){return pn.resolve(null)}getMinOffset(e,t){return pn.resolve(dn.min())}getMinOffsetFromCollectionGroup(e,t){return pn.resolve(dn.min())}updateCollectionGroup(e,t,n){return pn.resolve()}updateIndexEntries(e,t){return pn.resolve()}}class Wi{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t]||new An(Qt.comparator),s=!r.has(n);return this.index[t]=r.add(n),s}has(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t];return r&&r.has(n)}getEntries(e){return(this.index[e]||new An(Qt.comparator)).toArray()}}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xi={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Ji=41943040;class Yi{static withCacheSize(e){return new Yi(e,Yi.DEFAULT_COLLECTION_PERCENTILE,Yi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Yi.DEFAULT_COLLECTION_PERCENTILE=10,Yi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Yi.DEFAULT=new Yi(Ji,Yi.DEFAULT_COLLECTION_PERCENTILE,Yi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Yi.DISABLED=new Yi(-1,0,0);
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zi{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new Zi(0)}static ur(){return new Zi(-1)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eo="LruGarbageCollector";function to([e,t],[n,r]){const s=Bt(e,n);return 0===s?Bt(t,r):s}class no{constructor(e){this.Tr=e,this.buffer=new An(to),this.Ir=0}dr(){return++this.Ir}Er(e){const t=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(t);else{const e=this.buffer.last();to(t,e)<0&&(this.buffer=this.buffer.delete(e).add(t))}}get maxValue(){return this.buffer.last()[0]}}class ro{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.Ar=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return null!==this.Ar}Rr(e){wt(eo,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){yn(e)?wt(eo,"Ignoring IndexedDB error during garbage collection: ",e):await mn(e)}await this.Rr(3e5)}))}}class so{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.mr(e).next((e=>Math.floor(t/100*e)))}nthSequenceNumber(e,t){if(0===t)return pn.resolve(vn.ue);const n=new no(t);return this.Vr.forEachTarget(e,(e=>n.Er(e.sequenceNumber))).next((()=>this.Vr.gr(e,(e=>n.Er(e))))).next((()=>n.maxValue))}removeTargets(e,t,n){return this.Vr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return-1===this.params.cacheSizeCollectionThreshold?(wt("LruGarbageCollector","Garbage collection skipped; disabled"),pn.resolve(Xi)):this.getCacheSize(e).next((n=>n<this.params.cacheSizeCollectionThreshold?(wt("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Xi):this.pr(e,t)))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,t){let n,r,s,i,o,a,c;const l=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((t=>(t>this.params.maximumSequenceNumbersToCollect?(wt("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`),r=this.params.maximumSequenceNumbersToCollect):r=t,i=Date.now(),this.nthSequenceNumber(e,r)))).next((r=>(n=r,o=Date.now(),this.removeTargets(e,n,t)))).next((t=>(s=t,a=Date.now(),this.removeOrphanedDocuments(e,n)))).next((e=>(c=Date.now(),vt()<=j.DEBUG&&wt("LruGarbageCollector",`LRU Garbage Collection\n\tCounted targets in ${i-l}ms\n\tDetermined least recently used ${r} in `+(o-i)+`ms\n\tRemoved ${s} targets in `+(a-o)+`ms\n\tRemoved ${e} documents in `+(c-a)+`ms\nTotal Duration: ${c-l}ms`),pn.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:e}))))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class io{constructor(){this.changes=new ss((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,yr.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return void 0!==n?pn.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oo{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ao{constructor(e,t,n,r){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=r}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next((r=>(n=r,this.remoteDocumentCache.getEntry(e,t)))).next((e=>(null!==n&&Vs(n.mutation,e,kn.empty(),ln.now()),e)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((t=>this.getLocalViewOfDocuments(e,t,ms()).next((()=>t))))}getLocalViewOfDocuments(e,t,n=ms()){const r=us();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,n).next((e=>{let t=cs();return e.forEach(((e,n)=>{t=t.insert(e,n.overlayedDocument)})),t}))))}getOverlayedDocuments(e,t){const n=us();return this.populateOverlays(e,n,t).next((()=>this.computeViews(e,t,n,ms())))}populateOverlays(e,t,n){const r=[];return n.forEach((e=>{t.has(e)||r.push(e)})),this.documentOverlayCache.getOverlays(e,r).next((e=>{e.forEach(((e,n)=>{t.set(e,n)}))}))}computeViews(e,t,n,r){let s=os();const i=ds(),o=ds();return t.forEach(((e,t)=>{const o=n.get(t.key);r.has(t.key)&&(void 0===o||o.mutation instanceof qs)?s=s.insert(t.key,t):void 0!==o?(i.set(t.key,o.mutation.getFieldMask()),Vs(o.mutation,t,o.mutation.getFieldMask(),ln.now())):i.set(t.key,kn.empty())})),this.recalculateAndSaveOverlays(e,s).next((e=>(e.forEach(((e,t)=>i.set(e,t))),t.forEach(((e,t)=>{var n;return o.set(e,new oo(t,null!==(n=i.get(e))&&void 0!==n?n:null))})),o)))}recalculateAndSaveOverlays(e,t){const n=ds();let r=new In(((e,t)=>e-t)),s=ms();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((e=>{for(const s of e)s.keys().forEach((e=>{const i=t.get(e);if(null===i)return;let o=n.get(e)||kn.empty();o=s.applyToLocalView(i,o),n.set(e,o);const a=(r.get(s.batchId)||ms()).add(e);r=r.insert(s.batchId,a)}))})).next((()=>{const i=[],o=r.getReverseIterator();for(;o.hasNext();){const r=o.getNext(),a=r.key,c=r.value,l=hs();c.forEach((e=>{if(!s.has(e)){const r=Ms(t.get(e),n.get(e));null!==r&&l.set(e,r),s=s.add(e)}})),i.push(this.documentOverlayCache.saveOverlays(e,a,l))}return pn.waitFor(i)})).next((()=>n))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((t=>this.recalculateAndSaveOverlays(e,t)))}getDocumentsMatchingQuery(e,t,n,r){return s=t,Jt.isDocumentKey(s.path)&&null===s.collectionGroup&&0===s.filters.length?this.getDocumentsMatchingDocumentQuery(e,t.path):Hr(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,r):this.getDocumentsMatchingCollectionQuery(e,t,n,r);var s}getNextDocuments(e,t,n,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,r).next((s=>{const i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,r-s.size):pn.resolve(us());let o=-1,a=s;return i.next((t=>pn.forEach(t,((t,n)=>(o<n.largestBatchId&&(o=n.largestBatchId),s.get(t)?pn.resolve():this.remoteDocumentCache.getEntry(e,t).next((e=>{a=a.insert(t,e)}))))).next((()=>this.populateOverlays(e,t,s))).next((()=>this.computeViews(e,a,t,ms()))).next((e=>({batchId:o,changes:ls(e)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new Jt(t)).next((e=>{let t=cs();return e.isFoundDocument()&&(t=t.insert(e.key,e)),t}))}getDocumentsMatchingCollectionGroupQuery(e,t,n,r){const s=t.collectionGroup;let i=cs();return this.indexManager.getCollectionParents(e,s).next((o=>pn.forEach(o,(o=>{const a=(c=t,l=o.child(s),new zr(l,null,c.explicitOrderBy.slice(),c.filters.slice(),c.limit,c.limitType,c.startAt,c.endAt));var c,l;return this.getDocumentsMatchingCollectionQuery(e,a,n,r).next((e=>{e.forEach(((e,t)=>{i=i.insert(e,t)}))}))})).next((()=>i))))}getDocumentsMatchingCollectionQuery(e,t,n,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next((i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,s,r)))).next((e=>{s.forEach(((t,n)=>{const r=n.getKey();null===e.get(r)&&(e=e.insert(r,yr.newInvalidDocument(r)))}));let n=cs();return e.forEach(((e,r)=>{const i=s.get(e);void 0!==i&&Vs(i.mutation,r,kn.empty(),ln.now()),ts(t,r)&&(n=n.insert(e,r))})),n}))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class co{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,t){return pn.resolve(this.Br.get(t))}saveBundleMetadata(e,t){return this.Br.set(t.id,{id:(n=t).id,version:n.version,createTime:_i(n.createTime)}),pn.resolve();var n}getNamedQuery(e,t){return pn.resolve(this.Lr.get(t))}saveNamedQuery(e,t){return this.Lr.set(t.name,{name:(n=t).name,query:Hi(n.bundledQuery),readTime:_i(n.readTime)}),pn.resolve();var n}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lo{constructor(){this.overlays=new In(Jt.comparator),this.kr=new Map}getOverlay(e,t){return pn.resolve(this.overlays.get(t))}getOverlays(e,t){const n=us();return pn.forEach(t,(t=>this.getOverlay(e,t).next((e=>{null!==e&&n.set(t,e)})))).next((()=>n))}saveOverlays(e,t,n){return n.forEach(((n,r)=>{this.wt(e,t,r)})),pn.resolve()}removeOverlaysForBatchId(e,t,n){const r=this.kr.get(n);return void 0!==r&&(r.forEach((e=>this.overlays=this.overlays.remove(e))),this.kr.delete(n)),pn.resolve()}getOverlaysForCollection(e,t,n){const r=us(),s=t.length+1,i=new Jt(t.child("")),o=this.overlays.getIteratorFrom(i);for(;o.hasNext();){const e=o.getNext().value,i=e.getKey();if(!t.isPrefixOf(i.path))break;i.path.length===s&&e.largestBatchId>n&&r.set(e.getKey(),e)}return pn.resolve(r)}getOverlaysForCollectionGroup(e,t,n,r){let s=new In(((e,t)=>e-t));const i=this.overlays.getIterator();for(;i.hasNext();){const e=i.getNext().value;if(e.getKey().getCollectionGroup()===t&&e.largestBatchId>n){let t=s.get(e.largestBatchId);null===t&&(t=us(),s=s.insert(e.largestBatchId,t)),t.set(e.getKey(),e)}}const o=us(),a=s.getIterator();for(;a.hasNext()&&(a.getNext().value.forEach(((e,t)=>o.set(e,t))),!(o.size()>=r)););return pn.resolve(o)}wt(e,t,n){const r=this.overlays.get(n.key);if(null!==r){const e=this.kr.get(r.largestBatchId).delete(n.key);this.kr.set(r.largestBatchId,e)}this.overlays=this.overlays.insert(n.key,new Xs(t,n));let s=this.kr.get(t);void 0===s&&(s=ms(),this.kr.set(t,s)),this.kr.set(t,s.add(n.key))}}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uo{constructor(){this.sessionToken=On.EMPTY_BYTE_STRING}getSessionToken(e){return pn.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,pn.resolve()}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ho{constructor(){this.qr=new An(fo.Qr),this.$r=new An(fo.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,t){const n=new fo(e,t);this.qr=this.qr.add(n),this.$r=this.$r.add(n)}Kr(e,t){e.forEach((e=>this.addReference(e,t)))}removeReference(e,t){this.Wr(new fo(e,t))}Gr(e,t){e.forEach((e=>this.removeReference(e,t)))}zr(e){const t=new Jt(new Qt([])),n=new fo(t,e),r=new fo(t,e+1),s=[];return this.$r.forEachInRange([n,r],(e=>{this.Wr(e),s.push(e.key)})),s}jr(){this.qr.forEach((e=>this.Wr(e)))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){const t=new Jt(new Qt([])),n=new fo(t,e),r=new fo(t,e+1);let s=ms();return this.$r.forEachInRange([n,r],(e=>{s=s.add(e.key)})),s}containsKey(e){const t=new fo(e,0),n=this.qr.firstAfterOrEqual(t);return null!==n&&e.isEqual(n.key)}}class fo{constructor(e,t){this.key=e,this.Hr=t}static Qr(e,t){return Jt.comparator(e.key,t.key)||Bt(e.Hr,t.Hr)}static Ur(e,t){return Bt(e.Hr,t.Hr)||Jt.comparator(e.key,t.key)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class go{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.er=1,this.Yr=new An(fo.Qr)}checkEmpty(e){return pn.resolve(0===this.mutationQueue.length)}addMutationBatch(e,t,n,r){const s=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const i=new Qs(s,t,n,r);this.mutationQueue.push(i);for(const o of r)this.Yr=this.Yr.add(new fo(o.key,s)),this.indexManager.addToCollectionParentIndex(e,o.key.path.popLast());return pn.resolve(i)}lookupMutationBatch(e,t){return pn.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,r=this.Xr(n),s=r<0?0:r;return pn.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return pn.resolve(0===this.mutationQueue.length?-1:this.er-1)}getAllMutationBatches(e){return pn.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new fo(t,0),r=new fo(t,Number.POSITIVE_INFINITY),s=[];return this.Yr.forEachInRange([n,r],(e=>{const t=this.Zr(e.Hr);s.push(t)})),pn.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new An(Bt);return t.forEach((e=>{const t=new fo(e,0),r=new fo(e,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([t,r],(e=>{n=n.add(e.Hr)}))})),pn.resolve(this.ei(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,r=n.length+1;let s=n;Jt.isDocumentKey(s)||(s=s.child(""));const i=new fo(new Jt(s),0);let o=new An(Bt);return this.Yr.forEachWhile((e=>{const t=e.key.path;return!!n.isPrefixOf(t)&&(t.length===r&&(o=o.add(e.Hr)),!0)}),i),pn.resolve(this.ei(o))}ei(e){const t=[];return e.forEach((e=>{const n=this.Zr(e);null!==n&&t.push(n)})),t}removeMutationBatch(e,t){Tt(0===this.ti(t.batchId,"removed"),55003),this.mutationQueue.shift();let n=this.Yr;return pn.forEach(t.mutations,(r=>{const s=new fo(r.key,t.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)})).next((()=>{this.Yr=n}))}rr(e){}containsKey(e,t){const n=new fo(t,0),r=this.Yr.firstAfterOrEqual(n);return pn.resolve(t.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,pn.resolve()}ti(e,t){return this.Xr(e)}Xr(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e){this.ni=e,this.docs=new In(Jt.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,r=this.docs.get(n),s=r?r.size:0,i=this.ni(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return pn.resolve(n?n.document.mutableCopy():yr.newInvalidDocument(t))}getEntries(e,t){let n=os();return t.forEach((e=>{const t=this.docs.get(e);n=n.insert(e,t?t.document.mutableCopy():yr.newInvalidDocument(e))})),pn.resolve(n)}getDocumentsMatchingQuery(e,t,n,r){let s=os();const i=t.path,o=new Jt(i.child("__id-9223372036854775808__")),a=this.docs.getIteratorFrom(o);for(;a.hasNext();){const{key:e,value:{document:o}}=a.getNext();if(!i.isPrefixOf(e.path))break;e.path.length>i.length+1||fn(hn(o),n)<=0||(r.has(o.key)||ts(t,o))&&(s=s.insert(o.key,o.mutableCopy()))}return pn.resolve(s)}getAllFromCollectionGroup(e,t,n,r){_t(9500)}ri(e,t){return pn.forEach(this.docs,(e=>t(e)))}newChangeBuffer(e){return new po(this)}getSize(e){return pn.resolve(this.size)}}class po extends io{constructor(e){super(),this.Or=e}applyChanges(e){const t=[];return this.changes.forEach(((n,r)=>{r.isValidDocument()?t.push(this.Or.addEntry(e,r)):this.Or.removeEntry(n)})),pn.waitFor(t)}getFromCache(e,t){return this.Or.getEntry(e,t)}getAllFromCache(e,t){return this.Or.getEntries(e,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yo{constructor(e){this.persistence=e,this.ii=new ss((e=>Br(e)),qr),this.lastRemoteSnapshotVersion=un.min(),this.highestTargetId=0,this.si=0,this.oi=new ho,this.targetCount=0,this._i=Zi.ar()}forEachTarget(e,t){return this.ii.forEach(((e,n)=>t(n))),pn.resolve()}getLastRemoteSnapshotVersion(e){return pn.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return pn.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),pn.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.si&&(this.si=t),pn.resolve()}hr(e){this.ii.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this._i=new Zi(t),this.highestTargetId=t),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,t){return this.hr(t),this.targetCount+=1,pn.resolve()}updateTargetData(e,t){return this.hr(t),pn.resolve()}removeTargetData(e,t){return this.ii.delete(t.target),this.oi.zr(t.targetId),this.targetCount-=1,pn.resolve()}removeTargets(e,t,n){let r=0;const s=[];return this.ii.forEach(((i,o)=>{o.sequenceNumber<=t&&null===n.get(o.targetId)&&(this.ii.delete(i),s.push(this.removeMatchingKeysForTargetId(e,o.targetId)),r++)})),pn.waitFor(s).next((()=>r))}getTargetCount(e){return pn.resolve(this.targetCount)}getTargetData(e,t){const n=this.ii.get(t)||null;return pn.resolve(n)}addMatchingKeys(e,t,n){return this.oi.Kr(t,n),pn.resolve()}removeMatchingKeys(e,t,n){this.oi.Gr(t,n);const r=this.persistence.referenceDelegate,s=[];return r&&t.forEach((t=>{s.push(r.markPotentiallyOrphaned(e,t))})),pn.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.oi.zr(t),pn.resolve()}getMatchingKeysForTargetId(e,t){const n=this.oi.Jr(t);return pn.resolve(n)}containsKey(e,t){return pn.resolve(this.oi.containsKey(t))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{constructor(e,t){this.ai={},this.overlays={},this.ui=new vn(0),this.ci=!1,this.ci=!0,this.li=new uo,this.referenceDelegate=e(this),this.hi=new yo(this),this.indexManager=new Qi,this.remoteDocumentCache=new mo((e=>this.referenceDelegate.Pi(e))),this.serializer=new Gi(t),this.Ti=new co(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new lo,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.ai[e.toKey()];return n||(n=new go(t,this.referenceDelegate),this.ai[e.toKey()]=n),n}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,t,n){wt("MemoryPersistence","Starting transaction:",e);const r=new wo(this.ui.next());return this.referenceDelegate.Ii(),n(r).next((e=>this.referenceDelegate.di(r).next((()=>e)))).toPromise().then((e=>(r.raiseOnCommittedEvent(),e)))}Ei(e,t){return pn.or(Object.values(this.ai).map((n=>()=>n.containsKey(e,t))))}}class wo extends gn{constructor(e){super(),this.currentSequenceNumber=e}}class bo{constructor(e){this.persistence=e,this.Ai=new ho,this.Ri=null}static Vi(e){return new bo(e)}get mi(){if(this.Ri)return this.Ri;throw _t(60996)}addReference(e,t,n){return this.Ai.addReference(n,t),this.mi.delete(n.toString()),pn.resolve()}removeReference(e,t,n){return this.Ai.removeReference(n,t),this.mi.add(n.toString()),pn.resolve()}markPotentiallyOrphaned(e,t){return this.mi.add(t.toString()),pn.resolve()}removeTarget(e,t){this.Ai.zr(t.targetId).forEach((e=>this.mi.add(e.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next((e=>{e.forEach((e=>this.mi.add(e.toString())))})).next((()=>n.removeTargetData(e,t)))}Ii(){this.Ri=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return pn.forEach(this.mi,(n=>{const r=Jt.fromPath(n);return this.fi(e,r).next((e=>{e||t.removeEntry(r,un.min())}))})).next((()=>(this.Ri=null,t.apply(e))))}updateLimboDocument(e,t){return this.fi(e,t).next((e=>{e?this.mi.delete(t.toString()):this.mi.add(t.toString())}))}Pi(e){return 0}fi(e,t){return pn.or([()=>pn.resolve(this.Ai.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ei(e,t)])}}class Eo{constructor(e,t){this.persistence=e,this.gi=new ss((e=>function(e){let t="";for(let n=0;n<e.length;n++)t.length>0&&(t=xn(t)),t=En(e.get(n),t);return xn(t)}(e.path)),((e,t)=>e.isEqual(t))),this.garbageCollector=function(e,t){return new so(e,t)}(this,t)}static Vi(e,t){return new Eo(e,t)}Ii(){}di(e){return pn.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}mr(e){const t=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next((e=>t.next((t=>e+t))))}yr(e){let t=0;return this.gr(e,(e=>{t++})).next((()=>t))}gr(e,t){return pn.forEach(this.gi,((n,r)=>this.Sr(e,n,r).next((e=>e?pn.resolve():t(r)))))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ri(e,(r=>this.Sr(e,r,t).next((e=>{e||(n++,s.removeEntry(r,un.min()))})))).next((()=>s.apply(e))).next((()=>n))}markPotentiallyOrphaned(e,t){return this.gi.set(t,e.currentSequenceNumber),pn.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.gi.set(n,e.currentSequenceNumber),pn.resolve()}removeReference(e,t,n){return this.gi.set(n,e.currentSequenceNumber),pn.resolve()}updateLimboDocument(e,t){return this.gi.set(t,e.currentSequenceNumber),pn.resolve()}Pi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=ar(e.data.value)),t}Sr(e,t,n){return pn.or([()=>this.persistence.Ei(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const e=this.gi.get(t);return pn.resolve(void 0!==e&&e>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xo{constructor(e,t,n,r){this.targetId=e,this.fromCache=t,this.Is=n,this.ds=r}static Es(e,t){let n=ms(),r=ms();for(const s of t.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new xo(e,t.fromCache,n,r)}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class So{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=S()?8:function(e){const t=e.match(/Android ([\d.]+)/i),n=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(n)}("undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:"")>0?6:4}initialize(e,t){this.gs=e,this.indexManager=t,this.As=!0}getDocumentsMatchingQuery(e,t,n,r){const s={result:null};return this.ps(e,t).next((e=>{s.result=e})).next((()=>{if(!s.result)return this.ys(e,t,r,n).next((e=>{s.result=e}))})).next((()=>{if(s.result)return;const n=new _o;return this.ws(e,t,n).next((r=>{if(s.result=r,this.Rs)return this.Ss(e,t,n,r.size)}))})).next((()=>s.result))}Ss(e,t,n,r){return n.documentReadCount<this.Vs?(vt()<=j.DEBUG&&wt("QueryEngine","SDK will not create cache indexes for query:",es(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),pn.resolve()):(vt()<=j.DEBUG&&wt("QueryEngine","Query:",es(t),"scans",n.documentReadCount,"local documents and returns",r,"documents as results."),n.documentReadCount>this.fs*r?(vt()<=j.DEBUG&&wt("QueryEngine","The SDK decides to create cache indexes for query:",es(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Wr(t))):pn.resolve())}ps(e,t){if(Gr(t))return pn.resolve(null);let n=Wr(t);return this.indexManager.getIndexType(e,n).next((r=>0===r?null:(null!==t.limit&&1===r&&(t=Jr(t,null,"F"),n=Wr(t)),this.indexManager.getDocumentsMatchingTarget(e,n).next((r=>{const s=ms(...r);return this.gs.getDocuments(e,s).next((r=>this.indexManager.getMinOffset(e,n).next((n=>{const i=this.bs(t,r);return this.Ds(t,i,s,n.readTime)?this.ps(e,Jr(t,null,"F")):this.vs(e,i,t,n)}))))})))))}ys(e,t,n,r){return Gr(t)||r.isEqual(un.min())?pn.resolve(null):this.gs.getDocuments(e,n).next((s=>{const i=this.bs(t,s);return this.Ds(t,i,n,r)?pn.resolve(null):(vt()<=j.DEBUG&&wt("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),es(t)),this.vs(e,i,t,function(e,t){const n=e.toTimestamp().seconds,r=e.toTimestamp().nanoseconds+1,s=un.fromTimestamp(1e9===r?new ln(n+1,0):new ln(n,r));return new dn(s,Jt.empty(),t)}(r,-1)).next((e=>e)))}))}bs(e,t){let n=new An(ns(e));return t.forEach(((t,r)=>{ts(e,r)&&(n=n.add(r))})),n}Ds(e,t,n,r){if(null===e.limit)return!1;if(n.size!==t.size)return!0;const s="F"===e.limitType?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ws(e,t,n){return vt()<=j.DEBUG&&wt("QueryEngine","Using full collection scan to execute query:",es(t)),this.gs.getDocumentsMatchingQuery(e,t,dn.min(),n)}vs(e,t,n,r){return this.gs.getDocumentsMatchingQuery(e,n,r).next((e=>(t.forEach((t=>{e=e.insert(t.key,t)})),e)))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const To="LocalStore";class Io{constructor(e,t,n,r){this.persistence=e,this.Cs=t,this.serializer=r,this.Fs=new In(Bt),this.Ms=new ss((e=>Br(e)),qr),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(n)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new ao(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.Fs)))}}async function Co(e,t){const n=It(e);return await n.persistence.runTransaction("Handle user change","readonly",(e=>{let r;return n.mutationQueue.getAllMutationBatches(e).next((s=>(r=s,n.Ns(t),n.mutationQueue.getAllMutationBatches(e)))).next((t=>{const s=[],i=[];let o=ms();for(const e of r){s.push(e.batchId);for(const t of e.mutations)o=o.add(t.key)}for(const e of t){i.push(e.batchId);for(const t of e.mutations)o=o.add(t.key)}return n.localDocuments.getDocuments(e,o).next((e=>({Bs:e,removedBatchIds:s,addedBatchIds:i})))}))}))}function No(e){const t=It(e);return t.persistence.runTransaction("Get last remote snapshot version","readonly",(e=>t.hi.getLastRemoteSnapshotVersion(e)))}function Ao(e,t){const n=It(e),r=t.snapshotVersion;let s=n.Fs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",(e=>{const i=n.Os.newChangeBuffer({trackRemovals:!0});s=n.Fs;const o=[];t.targetChanges.forEach(((i,a)=>{const c=s.get(a);if(!c)return;o.push(n.hi.removeMatchingKeys(e,i.removedDocuments,a).next((()=>n.hi.addMatchingKeys(e,i.addedDocuments,a))));let l=c.withSequenceNumber(e.currentSequenceNumber);null!==t.targetMismatches.get(a)?l=l.withResumeToken(On.EMPTY_BYTE_STRING,un.min()).withLastLimboFreeSnapshotVersion(un.min()):i.resumeToken.approximateByteSize()>0&&(l=l.withResumeToken(i.resumeToken,r)),s=s.insert(a,l),function(e,t,n){if(0===e.resumeToken.approximateByteSize())return!0;if(t.snapshotVersion.toMicroseconds()-e.snapshotVersion.toMicroseconds()>=3e8)return!0;return n.addedDocuments.size+n.modifiedDocuments.size+n.removedDocuments.size>0}(c,l,i)&&o.push(n.hi.updateTargetData(e,l))}));let a=os(),c=ms();if(t.documentUpdates.forEach((r=>{t.resolvedLimboDocuments.has(r)&&o.push(n.persistence.referenceDelegate.updateLimboDocument(e,r))})),o.push(function(e,t,n){let r=ms(),s=ms();return n.forEach((e=>r=r.add(e))),t.getEntries(e,r).next((e=>{let r=os();return n.forEach(((n,i)=>{const o=e.get(n);i.isFoundDocument()!==o.isFoundDocument()&&(s=s.add(n)),i.isNoDocument()&&i.version.isEqual(un.min())?(t.removeEntry(n,i.readTime),r=r.insert(n,i)):!o.isValidDocument()||i.version.compareTo(o.version)>0||0===i.version.compareTo(o.version)&&o.hasPendingWrites?(t.addEntry(i),r=r.insert(n,i)):wt(To,"Ignoring outdated watch update for ",n,". Current version:",o.version," Watch version:",i.version)})),{Ls:r,ks:s}}))}(e,i,t.documentUpdates).next((e=>{a=e.Ls,c=e.ks}))),!r.isEqual(un.min())){const t=n.hi.getLastRemoteSnapshotVersion(e).next((t=>n.hi.setTargetsMetadata(e,e.currentSequenceNumber,r)));o.push(t)}return pn.waitFor(o).next((()=>i.apply(e))).next((()=>n.localDocuments.getLocalViewOfDocuments(e,a,c))).next((()=>a))})).then((e=>(n.Fs=s,e)))}function Do(e,t){const n=It(e);return n.persistence.runTransaction("Get next mutation batch","readonly",(e=>(void 0===t&&(t=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(e,t))))}async function ko(e,t,n){const r=It(e),s=r.Fs.get(t),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,(e=>r.persistence.referenceDelegate.removeTarget(e,s)))}catch(o){if(!yn(o))throw o;wt(To,`Failed to update sequence numbers for target ${t}: ${o}`)}r.Fs=r.Fs.remove(t),r.Ms.delete(s.target)}function Ro(e,t,n){const r=It(e);let s=un.min(),i=ms();return r.persistence.runTransaction("Execute query","readwrite",(e=>function(e,t,n){const r=It(e),s=r.Ms.get(n);return void 0!==s?pn.resolve(r.Fs.get(s)):r.hi.getTargetData(t,n)}(r,e,Wr(t)).next((t=>{if(t)return s=t.lastLimboFreeSnapshotVersion,r.hi.getMatchingKeysForTargetId(e,t.targetId).next((e=>{i=e}))})).next((()=>r.Cs.getDocumentsMatchingQuery(e,t,n?s:un.min(),n?i:ms()))).next((e=>(function(e,t,n){let r=e.xs.get(t)||un.min();n.forEach(((e,t)=>{t.readTime.compareTo(r)>0&&(r=t.readTime)})),e.xs.set(t,r)}(r,function(e){return e.collectionGroup||(e.path.length%2==1?e.path.lastSegment():e.path.get(e.path.length-2))}(t),e),{documents:e,qs:i})))))}class Oo{constructor(){this.activeTargetIds=ps}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Lo{constructor(){this.Fo=new Oo,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,t,n){this.Mo[e]=t}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new Oo,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jo{xo(e){}shutdown(){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mo="ConnectivityMonitor";class Po{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){wt(Mo,"Network connectivity changed: AVAILABLE");for(const e of this.ko)e(0)}Lo(){wt(Mo,"Network connectivity changed: UNAVAILABLE");for(const e of this.ko)e(1)}static C(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Vo=null;function Fo(){return null===Vo?Vo=268435456+Math.round(2147483648*Math.random()):Vo++,"0x"+Vo.toString(16)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const Uo="RestConnection",Bo={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class qo{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.$o=t+"://"+e.host,this.Uo=`projects/${n}/databases/${r}`,this.Ko=this.databaseId.database===Gn?`project_id=${n}`:`project_id=${n}&database_id=${r}`}Wo(e,t,n,r,s){const i=Fo(),o=this.Go(e,t.toUriEncodedString());wt(Uo,`Sending RPC '${e}' ${i}:`,o,n);const a={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(a,r,s);const{host:c}=new URL(o),l=b(c);return this.jo(e,o,a,n,l).then((t=>(wt(Uo,`Received RPC '${e}' ${i}: `,t),t)),(t=>{throw Et(Uo,`RPC '${e}' ${i} failed with error: `,t,"url: ",o,"request:",n),t}))}Jo(e,t,n,r,s,i){return this.Wo(e,t,n,r,s)}zo(e,t,n){e["X-Goog-Api-Client"]="gl-js/ fire/"+pt,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((t,n)=>e[n]=t)),n&&n.headers.forEach(((t,n)=>e[n]=t))}Go(e,t){const n=Bo[e];return`${this.$o}/v1/${t}:${n}`}terminate(){}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $o{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zo="WebChannelConnection";class Ko extends qo{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,t,n,r,s){const i=Fo();return new Promise(((s,o)=>{const a=new st;a.setWithCredentials(!0),a.listenOnce(ot.COMPLETE,(()=>{try{switch(a.getLastErrorCode()){case at.NO_ERROR:const t=a.getResponseJson();wt(zo,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(t)),s(t);break;case at.TIMEOUT:wt(zo,`RPC '${e}' ${i} timed out`),o(new Nt(Ct.DEADLINE_EXCEEDED,"Request time out"));break;case at.HTTP_ERROR:const n=a.getStatus();if(wt(zo,`RPC '${e}' ${i} failed with status:`,n,"response text:",a.getResponseText()),n>0){let e=a.getResponseJson();Array.isArray(e)&&(e=e[0]);const t=null==e?void 0:e.error;if(t&&t.status&&t.message){const e=function(e){const t=e.toLowerCase().replace(/_/g,"-");return Object.values(Ct).indexOf(t)>=0?t:Ct.UNKNOWN}(t.status);o(new Nt(e,t.message))}else o(new Nt(Ct.UNKNOWN,"Server responded with status "+a.getStatus()))}else o(new Nt(Ct.UNAVAILABLE,"Connection failed."));break;default:_t(9055,{c_:e,streamId:i,l_:a.getLastErrorCode(),h_:a.getLastError()})}}finally{wt(zo,`RPC '${e}' ${i} completed.`)}}));const c=JSON.stringify(r);wt(zo,`RPC '${e}' ${i} sending request:`,r),a.send(t,"POST",c,n,15)}))}P_(e,t,n){const r=Fo(),s=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=ht(),o=ut(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;void 0!==c&&(a.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(a.useFetchStreams=!0),this.zo(a.initMessageHeaders,t,n),a.encodeInitMessageHeaders=!0;const l=s.join("");wt(zo,`Creating RPC '${e}' stream ${r}: ${l}`,a);const u=i.createWebChannel(l,a);this.T_(u);let h=!1,d=!1;const f=new $o({Ho:t=>{d?wt(zo,`Not sending because RPC '${e}' stream ${r} is closed:`,t):(h||(wt(zo,`Opening RPC '${e}' stream ${r} transport.`),u.open(),h=!0),wt(zo,`RPC '${e}' stream ${r} sending:`,t),u.send(t))},Yo:()=>u.close()}),g=(e,t,n)=>{e.listen(t,(e=>{try{n(e)}catch(t){setTimeout((()=>{throw t}),0)}}))};return g(u,it.EventType.OPEN,(()=>{d||(wt(zo,`RPC '${e}' stream ${r} transport opened.`),f.s_())})),g(u,it.EventType.CLOSE,(()=>{d||(d=!0,wt(zo,`RPC '${e}' stream ${r} transport closed`),f.__(),this.I_(u))})),g(u,it.EventType.ERROR,(t=>{d||(d=!0,Et(zo,`RPC '${e}' stream ${r} transport errored. Name:`,t.name,"Message:",t.message),f.__(new Nt(Ct.UNAVAILABLE,"The operation could not be completed")))})),g(u,it.EventType.MESSAGE,(t=>{var n;if(!d){const s=t.data[0];Tt(!!s,16349);const i=s,o=(null==i?void 0:i.error)||(null===(n=i[0])||void 0===n?void 0:n.error);if(o){wt(zo,`RPC '${e}' stream ${r} received error:`,o);const t=o.status;let n=function(e){const t=Ys[e];if(void 0!==t)return ei(t)}(t),s=o.message;void 0===n&&(n=Ct.INTERNAL,s="Unknown error status: "+t+" with message "+o.message),d=!0,f.__(new Nt(n,s)),u.close()}else wt(zo,`RPC '${e}' stream ${r} received:`,s),f.a_(s)}})),g(o,lt.STAT_EVENT,(t=>{t.stat===ct.PROXY?wt(zo,`RPC '${e}' stream ${r} detected buffering proxy`):t.stat===ct.NOPROXY&&wt(zo,`RPC '${e}' stream ${r} detected no buffering proxy`)})),setTimeout((()=>{f.o_()}),0),f}terminate(){this.u_.forEach((e=>e.close())),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter((t=>t===e))}}function Go(){return"undefined"!=typeof document?document:null}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ho(e){return new vi(e,!0)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qo{constructor(e,t,n=1e3,r=1.5,s=6e4){this.Fi=e,this.timerId=t,this.d_=n,this.E_=r,this.A_=s,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const t=Math.floor(this.R_+this.p_()),n=Math.max(0,Date.now()-this.m_),r=Math.max(0,t-n);r>0&&wt("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.R_} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,r,(()=>(this.m_=Date.now(),e()))),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){null!==this.V_&&(this.V_.skipDelay(),this.V_=null)}cancel(){null!==this.V_&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wo="PersistentStream";class Xo{constructor(e,t,n,r,s,i,o,a){this.Fi=e,this.w_=n,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=o,this.listener=a,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new Qo(e,t)}M_(){return 1===this.state||5===this.state||this.x_()}x_(){return 2===this.state||3===this.state}start(){this.C_=0,4!==this.state?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&null===this.D_&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,(()=>this.L_())))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,4!==e?this.F_.reset():t&&t.code===Ct.RESOURCE_EXHAUSTED?(bt(t.toString()),bt("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):t&&t.code===Ct.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(t)}U_(){}auth(){this.state=1;const e=this.K_(this.b_),t=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([e,n])=>{this.b_===t&&this.W_(e,n)}),(t=>{e((()=>{const e=new Nt(Ct.UNKNOWN,"Fetching auth token failed: "+t.message);return this.G_(e)}))}))}W_(e,t){const n=this.K_(this.b_);this.stream=this.z_(e,t),this.stream.Zo((()=>{n((()=>this.listener.Zo()))})),this.stream.e_((()=>{n((()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,(()=>(this.x_()&&(this.state=3),Promise.resolve()))),this.listener.e_())))})),this.stream.n_((e=>{n((()=>this.G_(e)))})),this.stream.onMessage((e=>{n((()=>1==++this.C_?this.j_(e):this.onNext(e)))}))}O_(){this.state=5,this.F_.g_((async()=>{this.state=0,this.start()}))}G_(e){return wt(Wo,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return t=>{this.Fi.enqueueAndForget((()=>this.b_===e?t():(wt(Wo,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class Jo extends Xo{constructor(e,t,n,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,r,i),this.serializer=s}z_(e,t){return this.connection.P_("Listen",e,t)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();const t=function(e,t){let n;if("targetChange"in t){t.targetChange;const s="NO_CHANGE"===(r=t.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===r?1:"REMOVE"===r?2:"CURRENT"===r?3:"RESET"===r?4:_t(39313,{state:r}),i=t.targetChange.targetIds||[],o=function(e,t){return e.useProto3Json?(Tt(void 0===t||"string"==typeof t,58123),On.fromBase64String(t||"")):(Tt(void 0===t||t instanceof Buffer||t instanceof Uint8Array,16193),On.fromUint8Array(t||new Uint8Array))}(e,t.targetChange.resumeToken),a=t.targetChange.cause,c=a&&function(e){const t=void 0===e.code?Ct.UNKNOWN:ei(e.code);return new Nt(t,e.message||"")}(a);n=new ui(s,i,o,c||null)}else if("documentChange"in t){t.documentChange;const r=t.documentChange;r.document,r.document.name,r.document.updateTime;const s=Ni(e,r.document.name),i=_i(r.document.updateTime),o=r.document.createTime?_i(r.document.createTime):un.min(),a=new mr({mapValue:{fields:r.document.fields}}),c=yr.newFoundDocument(s,i,o,a),l=r.targetIds||[],u=r.removedTargetIds||[];n=new ci(l,u,c.key,c)}else if("documentDelete"in t){t.documentDelete;const r=t.documentDelete;r.document;const s=Ni(e,r.document),i=r.readTime?_i(r.readTime):un.min(),o=yr.newNoDocument(s,i),a=r.removedTargetIds||[];n=new ci([],a,o.key,o)}else if("documentRemove"in t){t.documentRemove;const r=t.documentRemove;r.document;const s=Ni(e,r.document),i=r.removedTargetIds||[];n=new ci([],i,s,null)}else{if(!("filter"in t))return _t(11601,{At:t});{t.filter;const e=t.filter;e.targetId;const{count:r=0,unchangedNames:s}=e,i=new Js(r,s),o=e.targetId;n=new li(o,i)}}var r;return n}(this.serializer,e),n=function(e){if(!("targetChange"in e))return un.min();const t=e.targetChange;return t.targetIds&&t.targetIds.length?un.min():t.readTime?_i(t.readTime):un.min()}(e);return this.listener.J_(t,n)}H_(e){const t={};t.database=Di(this.serializer),t.addTarget=function(e,t){let n;const r=t.target;if(n=$r(r)?{documents:Oi(e,r)}:{query:Li(e,r).Vt},n.targetId=t.targetId,t.resumeToken.approximateByteSize()>0){n.resumeToken=Ei(e,t.resumeToken);const r=wi(e,t.expectedCount);null!==r&&(n.expectedCount=r)}else if(t.snapshotVersion.compareTo(un.min())>0){n.readTime=bi(e,t.snapshotVersion.toTimestamp());const r=wi(e,t.expectedCount);null!==r&&(n.expectedCount=r)}return n}(this.serializer,e);const n=function(e,t){const n=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return _t(28987,{purpose:e})}}(t.purpose);return null==n?null:{"goog-listen-tags":n}}(this.serializer,e);n&&(t.labels=n),this.k_(t)}Y_(e){const t={};t.database=Di(this.serializer),t.removeTarget=e,this.k_(t)}}class Yo extends Xo{constructor(e,t,n,r,s,i){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,r,i),this.serializer=s}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,t){return this.connection.P_("Write",e,t)}j_(e){return Tt(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,Tt(!e.writeResults||0===e.writeResults.length,55816),this.listener.ea()}onNext(e){Tt(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();const t=function(e,t){return e&&e.length>0?(Tt(void 0!==t,14353),e.map((e=>function(e,t){let n=e.updateTime?_i(e.updateTime):_i(t);return n.isEqual(un.min())&&(n=_i(t)),new Rs(n,e.transformResults||[])}(e,t)))):[]}(e.writeResults,e.commitTime),n=_i(e.commitTime);return this.listener.ta(n,t)}na(){const e={};e.database=Di(this.serializer),this.k_(e)}X_(e){const t={streamToken:this.lastStreamToken,writes:e.map((e=>function(e,t){let n;if(t instanceof Bs)n={update:Ri(e,t.key,t.value)};else if(t instanceof Gs)n={delete:Ci(e,t.key)};else if(t instanceof qs)n={update:Ri(e,t.key,t.data),updateMask:$i(t.fieldMask)};else{if(!(t instanceof Hs))return _t(16599,{Rt:t.type});n={verify:Ci(e,t.key)}}return t.fieldTransforms.length>0&&(n.updateTransforms=t.fieldTransforms.map((e=>function(e,t){const n=t.transform;if(n instanceof Ss)return{fieldPath:t.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(n instanceof Ts)return{fieldPath:t.field.canonicalString(),appendMissingElements:{values:n.elements}};if(n instanceof Cs)return{fieldPath:t.field.canonicalString(),removeAllFromArray:{values:n.elements}};if(n instanceof As)return{fieldPath:t.field.canonicalString(),increment:n.Ee};throw _t(20930,{transform:t.transform})}(0,e)))),t.precondition.isNone||(n.currentDocument=(r=e,void 0!==(s=t.precondition).updateTime?{updateTime:xi(r,s.updateTime)}:void 0!==s.exists?{exists:s.exists}:_t(27497))),n;var r,s}(this.serializer,e)))};this.k_(t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zo{}class ea extends Zo{constructor(e,t,n,r){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=r,this.ra=!1}ia(){if(this.ra)throw new Nt(Ct.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,n,r){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([s,i])=>this.connection.Wo(e,Ti(t,n),r,s,i))).catch((e=>{throw"FirebaseError"===e.name?(e.code===Ct.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new Nt(Ct.UNKNOWN,e.toString())}))}Jo(e,t,n,r,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.Jo(e,Ti(t,n),r,i,o,s))).catch((e=>{throw"FirebaseError"===e.name?(e.code===Ct.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new Nt(Ct.UNKNOWN,e.toString())}))}terminate(){this.ra=!0,this.connection.terminate()}}class ta{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){0===this.sa&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve()))))}la(e){"Online"===this.state?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,"Online"===e&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){const t=`Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(bt(t),this._a=!1):wt("OnlineStateTracker",t)}ha(){null!==this.oa&&(this.oa.cancel(),this.oa=null)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const na="RemoteStore";class ra{constructor(e,t,n,r,s){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=s,this.Ea.xo((e=>{n.enqueueAndForget((async()=>{da(this)&&(wt(na,"Restarting streams for network reachability change."),await async function(e){const t=It(e);t.Ia.add(4),await ia(t),t.Aa.set("Unknown"),t.Ia.delete(4),await sa(t)}(this))}))})),this.Aa=new ta(n,r)}}async function sa(e){if(da(e))for(const t of e.da)await t(!0)}async function ia(e){for(const t of e.da)await t(!1)}function oa(e,t){const n=It(e);n.Ta.has(t.targetId)||(n.Ta.set(t.targetId,t),ha(n)?ua(n):Da(n).x_()&&ca(n,t))}function aa(e,t){const n=It(e),r=Da(n);n.Ta.delete(t),r.x_()&&la(n,t),0===n.Ta.size&&(r.x_()?r.B_():da(n)&&n.Aa.set("Unknown"))}function ca(e,t){if(e.Ra.$e(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(un.min())>0){const n=e.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(n)}Da(e).H_(t)}function la(e,t){e.Ra.$e(t),Da(e).Y_(t)}function ua(e){e.Ra=new di({getRemoteKeysForTarget:t=>e.remoteSyncer.getRemoteKeysForTarget(t),Et:t=>e.Ta.get(t)||null,lt:()=>e.datastore.serializer.databaseId}),Da(e).start(),e.Aa.aa()}function ha(e){return da(e)&&!Da(e).M_()&&e.Ta.size>0}function da(e){return 0===It(e).Ia.size}function fa(e){e.Ra=void 0}async function ga(e){e.Aa.set("Online")}async function ma(e){e.Ta.forEach(((t,n)=>{ca(e,t)}))}async function pa(e,t){fa(e),ha(e)?(e.Aa.la(t),ua(e)):e.Aa.set("Unknown")}async function ya(e,t,n){if(e.Aa.set("Online"),t instanceof ui&&2===t.state&&t.cause)try{await async function(e,t){const n=t.cause;for(const r of t.targetIds)e.Ta.has(r)&&(await e.remoteSyncer.rejectListen(r,n),e.Ta.delete(r),e.Ra.removeTarget(r))}(e,t)}catch(r){wt(na,"Failed to remove targets %s: %s ",t.targetIds.join(","),r),await va(e,r)}else if(t instanceof ci?e.Ra.Ye(t):t instanceof li?e.Ra.it(t):e.Ra.et(t),!n.isEqual(un.min()))try{const t=await No(e.localStore);n.compareTo(t)>=0&&await function(e,t){const n=e.Ra.Pt(t);return n.targetChanges.forEach(((n,r)=>{if(n.resumeToken.approximateByteSize()>0){const s=e.Ta.get(r);s&&e.Ta.set(r,s.withResumeToken(n.resumeToken,t))}})),n.targetMismatches.forEach(((t,n)=>{const r=e.Ta.get(t);if(!r)return;e.Ta.set(t,r.withResumeToken(On.EMPTY_BYTE_STRING,r.snapshotVersion)),la(e,t);const s=new Ki(r.target,t,n,r.sequenceNumber);ca(e,s)})),e.remoteSyncer.applyRemoteEvent(n)}(e,n)}catch(s){wt(na,"Failed to raise snapshot:",s),await va(e,s)}}async function va(e,t,n){if(!yn(t))throw t;e.Ia.add(1),await ia(e),e.Aa.set("Offline"),n||(n=()=>No(e.localStore)),e.asyncQueue.enqueueRetryable((async()=>{wt(na,"Retrying IndexedDB access"),await n(),e.Ia.delete(1),await sa(e)}))}function wa(e,t){return t().catch((n=>va(e,n,t)))}async function ba(e){const t=It(e),n=ka(t);let r=t.Pa.length>0?t.Pa[t.Pa.length-1].batchId:-1;for(;Ea(t);)try{const e=await Do(t.localStore,r);if(null===e){0===t.Pa.length&&n.B_();break}r=e.batchId,xa(t,e)}catch(s){await va(t,s)}_a(t)&&Sa(t)}function Ea(e){return da(e)&&e.Pa.length<10}function xa(e,t){e.Pa.push(t);const n=ka(e);n.x_()&&n.Z_&&n.X_(t.mutations)}function _a(e){return da(e)&&!ka(e).M_()&&e.Pa.length>0}function Sa(e){ka(e).start()}async function Ta(e){ka(e).na()}async function Ia(e){const t=ka(e);for(const n of e.Pa)t.X_(n.mutations)}async function Ca(e,t,n){const r=e.Pa.shift(),s=Ws.from(r,t,n);await wa(e,(()=>e.remoteSyncer.applySuccessfulWrite(s))),await ba(e)}async function Na(e,t){t&&ka(e).Z_&&await async function(e,t){if(function(e){switch(e){case Ct.OK:return _t(64938);case Ct.CANCELLED:case Ct.UNKNOWN:case Ct.DEADLINE_EXCEEDED:case Ct.RESOURCE_EXHAUSTED:case Ct.INTERNAL:case Ct.UNAVAILABLE:case Ct.UNAUTHENTICATED:return!1;case Ct.INVALID_ARGUMENT:case Ct.NOT_FOUND:case Ct.ALREADY_EXISTS:case Ct.PERMISSION_DENIED:case Ct.FAILED_PRECONDITION:case Ct.ABORTED:case Ct.OUT_OF_RANGE:case Ct.UNIMPLEMENTED:case Ct.DATA_LOSS:return!0;default:return _t(15467,{code:e})}}(n=t.code)&&n!==Ct.ABORTED){const n=e.Pa.shift();ka(e).N_(),await wa(e,(()=>e.remoteSyncer.rejectFailedWrite(n.batchId,t))),await ba(e)}var n}(e,t),_a(e)&&Sa(e)}async function Aa(e,t){const n=It(e);n.asyncQueue.verifyOperationInProgress(),wt(na,"RemoteStore received new credentials");const r=da(n);n.Ia.add(3),await ia(n),r&&n.Aa.set("Unknown"),await n.remoteSyncer.handleCredentialChange(t),n.Ia.delete(3),await sa(n)}function Da(e){return e.Va||(e.Va=function(e,t,n){const r=It(e);return r.ia(),new Jo(t,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(e.datastore,e.asyncQueue,{Zo:ga.bind(null,e),e_:ma.bind(null,e),n_:pa.bind(null,e),J_:ya.bind(null,e)}),e.da.push((async t=>{t?(e.Va.N_(),ha(e)?ua(e):e.Aa.set("Unknown")):(await e.Va.stop(),fa(e))}))),e.Va}function ka(e){return e.ma||(e.ma=function(e,t,n){const r=It(e);return r.ia(),new Yo(t,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(e.datastore,e.asyncQueue,{Zo:()=>Promise.resolve(),e_:Ta.bind(null,e),n_:Na.bind(null,e),ea:Ia.bind(null,e),ta:Ca.bind(null,e)}),e.da.push((async t=>{t?(e.ma.N_(),await ba(e)):(await e.ma.stop(),e.Pa.length>0&&(wt(na,`Stopping write stream with ${e.Pa.length} pending writes`),e.Pa=[]))}))),e.ma
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class Ra{constructor(e,t,n,r,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=r,this.removalCallback=s,this.deferred=new At,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((e=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,r,s){const i=Date.now()+n,o=new Ra(e,t,i,r,s);return o.start(n),o}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new Nt(Ct.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Oa(e,t){if(bt("AsyncQueue",`${t}: ${e}`),yn(e))return new Nt(Ct.UNAVAILABLE,`${t}: ${e}`);throw e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class La{static emptySet(e){return new La(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||Jt.comparator(t.key,n.key):(e,t)=>Jt.comparator(e.key,t.key),this.keyedMap=cs(),this.sortedSet=new In(this.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,n)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof La))return!1;if(this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const e=t.getNext().key,r=n.getNext().key;if(!e.isEqual(r))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,t){const n=new La;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ja{constructor(){this.fa=new In(Jt.comparator)}track(e){const t=e.doc.key,n=this.fa.get(t);n?0!==e.type&&3===n.type?this.fa=this.fa.insert(t,e):3===e.type&&1!==n.type?this.fa=this.fa.insert(t,{type:n.type,doc:e.doc}):2===e.type&&2===n.type?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):2===e.type&&0===n.type?this.fa=this.fa.insert(t,{type:0,doc:e.doc}):1===e.type&&0===n.type?this.fa=this.fa.remove(t):1===e.type&&2===n.type?this.fa=this.fa.insert(t,{type:1,doc:n.doc}):0===e.type&&1===n.type?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):_t(63341,{At:e,ga:n}):this.fa=this.fa.insert(t,e)}pa(){const e=[];return this.fa.inorderTraversal(((t,n)=>{e.push(n)})),e}}class Ma{constructor(e,t,n,r,s,i,o,a,c){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=o,this.excludesMetadataChanges=a,this.hasCachedResults=c}static fromInitialDocuments(e,t,n,r,s){const i=[];return t.forEach((e=>{i.push({type:0,doc:e})})),new Ma(e,t,La.emptySet(t),i,n,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Yr(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let r=0;r<t.length;r++)if(t[r].type!==n[r].type||!t[r].doc.isEqual(n[r].doc))return!1;return!0}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pa{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some((e=>e.ba()))}}class Va{constructor(){this.queries=Fa(),this.onlineState="Unknown",this.Da=new Set}terminate(){!function(e,t){const n=It(e),r=n.queries;n.queries=Fa(),r.forEach(((e,n)=>{for(const r of n.wa)r.onError(t)}))}(this,new Nt(Ct.ABORTED,"Firestore shutting down"))}}function Fa(){return new ss((e=>Zr(e)),Yr)}function Ua(e,t){const n=It(e);let r=!1;for(const s of t){const e=s.query,t=n.queries.get(e);if(t){for(const e of t.wa)e.Ca(s)&&(r=!0);t.ya=s}}r&&qa(n)}function Ba(e,t,n){const r=It(e),s=r.queries.get(t);if(s)for(const i of s.wa)i.onError(n);r.queries.delete(t)}function qa(e){e.Da.forEach((e=>{e.next()}))}var $a,za;(za=$a||($a={})).Fa="default",za.Cache="cache";class Ka{constructor(e,t,n){this.query=e,this.Ma=t,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=n||{}}Ca(e){if(!this.options.includeMetadataChanges){const t=[];for(const n of e.docChanges)3!==n.type&&t.push(n);e=new Ma(e.query,e.docs,e.oldDocs,t,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),t=!0):this.Ba(e,this.onlineState)&&(this.La(e),t=!0),this.Oa=e,t}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let t=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),t=!0),t}Ba(e,t){if(!e.fromCache)return!0;if(!this.ba())return!0;const n="Offline"!==t;return(!this.options.ka||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===t)}Na(e){if(e.docChanges.length>0)return!0;const t=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&!0===this.options.includeMetadataChanges}La(e){e=Ma.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==$a.Cache}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ga{constructor(e){this.key=e}}class Ha{constructor(e){this.key=e}}class Qa{constructor(e,t){this.query=e,this.Ha=t,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=ms(),this.mutatedKeys=ms(),this.Xa=ns(e),this.eu=new La(this.Xa)}get tu(){return this.Ha}nu(e,t){const n=t?t.ru:new ja,r=t?t.eu:this.eu;let s=t?t.mutatedKeys:this.mutatedKeys,i=r,o=!1;const a="F"===this.query.limitType&&r.size===this.query.limit?r.last():null,c="L"===this.query.limitType&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal(((e,t)=>{const l=r.get(e),u=ts(this.query,t)?t:null,h=!!l&&this.mutatedKeys.has(l.key),d=!!u&&(u.hasLocalMutations||this.mutatedKeys.has(u.key)&&u.hasCommittedMutations);let f=!1;l&&u?l.data.isEqual(u.data)?h!==d&&(n.track({type:3,doc:u}),f=!0):this.iu(l,u)||(n.track({type:2,doc:u}),f=!0,(a&&this.Xa(u,a)>0||c&&this.Xa(u,c)<0)&&(o=!0)):!l&&u?(n.track({type:0,doc:u}),f=!0):l&&!u&&(n.track({type:1,doc:l}),f=!0,(a||c)&&(o=!0)),f&&(u?(i=i.add(u),s=d?s.add(e):s.delete(e)):(i=i.delete(e),s=s.delete(e)))})),null!==this.query.limit)for(;i.size>this.query.limit;){const e="F"===this.query.limitType?i.last():i.first();i=i.delete(e.key),s=s.delete(e.key),n.track({type:1,doc:e})}return{eu:i,ru:n,Ds:o,mutatedKeys:s}}iu(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,r){const s=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;const i=e.ru.pa();i.sort(((e,t)=>function(e,t){const n=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return _t(20277,{At:e})}};return n(e)-n(t)}(e.type,t.type)||this.Xa(e.doc,t.doc))),this.su(n),r=null!=r&&r;const o=t&&!r?this.ou():[],a=0===this.Za.size&&this.current&&!r?1:0,c=a!==this.Ya;return this.Ya=a,0!==i.length||c?{snapshot:new Ma(this.query,e.eu,s,i,e.mutatedKeys,0===a,c,!1,!!n&&n.resumeToken.approximateByteSize()>0),_u:o}:{_u:o}}va(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({eu:this.eu,ru:new ja,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach((e=>this.Ha=this.Ha.add(e))),e.modifiedDocuments.forEach((e=>{})),e.removedDocuments.forEach((e=>this.Ha=this.Ha.delete(e))),this.current=e.current)}ou(){if(!this.current)return[];const e=this.Za;this.Za=ms(),this.eu.forEach((e=>{this.au(e.key)&&(this.Za=this.Za.add(e.key))}));const t=[];return e.forEach((e=>{this.Za.has(e)||t.push(new Ha(e))})),this.Za.forEach((n=>{e.has(n)||t.push(new Ga(n))})),t}uu(e){this.Ha=e.qs,this.Za=ms();const t=this.nu(e.documents);return this.applyChanges(t,!0)}cu(){return Ma.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,0===this.Ya,this.hasCachedResults)}}const Wa="SyncEngine";class Xa{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class Ja{constructor(e){this.key=e,this.lu=!1}}class Ya{constructor(e,t,n,r,s,i){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.hu={},this.Pu=new ss((e=>Zr(e)),Yr),this.Tu=new Map,this.Iu=new Set,this.du=new In(Jt.comparator),this.Eu=new Map,this.Au=new ho,this.Ru={},this.Vu=new Map,this.mu=Zi.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return!0===this.fu}}async function Za(e,t,n=!0){const r=bc(e);let s;const i=r.Pu.get(t);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cu()):s=await tc(r,t,n,!0),s}async function ec(e,t){const n=bc(e);await tc(n,t,!0,!1)}async function tc(e,t,n,r){const s=await function(e,t){const n=It(e);return n.persistence.runTransaction("Allocate target","readwrite",(e=>{let r;return n.hi.getTargetData(e,t).next((s=>s?(r=s,pn.resolve(r)):n.hi.allocateTargetId(e).next((s=>(r=new Ki(t,s,"TargetPurposeListen",e.currentSequenceNumber),n.hi.addTargetData(e,r).next((()=>r)))))))})).then((e=>{const r=n.Fs.get(e.targetId);return(null===r||e.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.Fs=n.Fs.insert(e.targetId,e),n.Ms.set(t,e.targetId)),e}))}(e.localStore,Wr(t)),i=s.targetId,o=e.sharedClientState.addLocalQueryTarget(i,n);let a;return r&&(a=await async function(e,t,n,r,s){e.gu=(t,n,r)=>async function(e,t,n,r){let s=t.view.nu(n);s.Ds&&(s=await Ro(e.localStore,t.query,!1).then((({documents:e})=>t.view.nu(e,s))));const i=r&&r.targetChanges.get(t.targetId),o=r&&null!=r.targetMismatches.get(t.targetId),a=t.view.applyChanges(s,e.isPrimaryClient,i,o);return gc(e,t.targetId,a._u),a.snapshot}(e,t,n,r);const i=await Ro(e.localStore,t,!0),o=new Qa(t,i.qs),a=o.nu(i.documents),c=ai.createSynthesizedTargetChangeForCurrentChange(n,r&&"Offline"!==e.onlineState,s),l=o.applyChanges(a,e.isPrimaryClient,c);gc(e,n,l._u);const u=new Xa(t,n,o);return e.Pu.set(t,u),e.Tu.has(n)?e.Tu.get(n).push(t):e.Tu.set(n,[t]),l.snapshot}(e,t,i,"current"===o,s.resumeToken)),e.isPrimaryClient&&n&&oa(e.remoteStore,s),a}async function nc(e,t,n){const r=It(e),s=r.Pu.get(t),i=r.Tu.get(s.targetId);if(i.length>1)return r.Tu.set(s.targetId,i.filter((e=>!Yr(e,t)))),void r.Pu.delete(t);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await ko(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),n&&aa(r.remoteStore,s.targetId),dc(r,s.targetId)})).catch(mn)):(dc(r,s.targetId),await ko(r.localStore,s.targetId,!0))}async function rc(e,t){const n=It(e),r=n.Pu.get(t),s=n.Tu.get(r.targetId);n.isPrimaryClient&&1===s.length&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),aa(n.remoteStore,r.targetId))}async function sc(e,t,n){const r=function(e){const t=It(e);return t.remoteStore.remoteSyncer.applySuccessfulWrite=cc.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=lc.bind(null,t),t}(e);try{const e=await function(e,t){const n=It(e),r=ln.now(),s=t.reduce(((e,t)=>e.add(t.key)),ms());let i,o;return n.persistence.runTransaction("Locally write mutations","readwrite",(e=>{let a=os(),c=ms();return n.Os.getEntries(e,s).next((e=>{a=e,a.forEach(((e,t)=>{t.isValidDocument()||(c=c.add(e))}))})).next((()=>n.localDocuments.getOverlayedDocuments(e,a))).next((s=>{i=s;const o=[];for(const e of t){const t=Fs(e,i.get(e.key).overlayedDocument);null!=t&&o.push(new qs(e.key,t,pr(t.value.mapValue),Os.exists(!0)))}return n.mutationQueue.addMutationBatch(e,r,o,t)})).next((t=>{o=t;const r=t.applyToLocalDocumentSet(i,c);return n.documentOverlayCache.saveOverlays(e,t.batchId,r)}))})).then((()=>({batchId:o.batchId,changes:ls(i)})))}(r.localStore,t);r.sharedClientState.addPendingMutation(e.batchId),function(e,t,n){let r=e.Ru[e.currentUser.toKey()];r||(r=new In(Bt)),r=r.insert(t,n),e.Ru[e.currentUser.toKey()]=r}(r,e.batchId,n),await yc(r,e.changes),await ba(r.remoteStore)}catch(s){const e=Oa(s,"Failed to persist write");n.reject(e)}}async function ic(e,t){const n=It(e);try{const e=await Ao(n.localStore,t);t.targetChanges.forEach(((e,t)=>{const r=n.Eu.get(t);r&&(Tt(e.addedDocuments.size+e.modifiedDocuments.size+e.removedDocuments.size<=1,22616),e.addedDocuments.size>0?r.lu=!0:e.modifiedDocuments.size>0?Tt(r.lu,14607):e.removedDocuments.size>0&&(Tt(r.lu,42227),r.lu=!1))})),await yc(n,e,t)}catch(r){await mn(r)}}function oc(e,t,n){const r=It(e);if(r.isPrimaryClient&&0===n||!r.isPrimaryClient&&1===n){const e=[];r.Pu.forEach(((n,r)=>{const s=r.view.va(t);s.snapshot&&e.push(s.snapshot)})),function(e,t){const n=It(e);n.onlineState=t;let r=!1;n.queries.forEach(((e,n)=>{for(const s of n.wa)s.va(t)&&(r=!0)})),r&&qa(n)}(r.eventManager,t),e.length&&r.hu.J_(e),r.onlineState=t,r.isPrimaryClient&&r.sharedClientState.setOnlineState(t)}}async function ac(e,t,n){const r=It(e);r.sharedClientState.updateQueryState(t,"rejected",n);const s=r.Eu.get(t),i=s&&s.key;if(i){let e=new In(Jt.comparator);e=e.insert(i,yr.newNoDocument(i,un.min()));const n=ms().add(i),s=new oi(un.min(),new Map,new In(Bt),e,n);await ic(r,s),r.du=r.du.remove(i),r.Eu.delete(t),pc(r)}else await ko(r.localStore,t,!1).then((()=>dc(r,t,n))).catch(mn)}async function cc(e,t){const n=It(e),r=t.batch.batchId;try{const e=await function(e,t){const n=It(e);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",(e=>{const r=t.batch.keys(),s=n.Os.newChangeBuffer({trackRemovals:!0});return function(e,t,n,r){const s=n.batch,i=s.keys();let o=pn.resolve();return i.forEach((e=>{o=o.next((()=>r.getEntry(t,e))).next((t=>{const i=n.docVersions.get(e);Tt(null!==i,48541),t.version.compareTo(i)<0&&(s.applyToRemoteDocument(t,n),t.isValidDocument()&&(t.setReadTime(n.commitVersion),r.addEntry(t)))}))})),o.next((()=>e.mutationQueue.removeMutationBatch(t,s)))}(n,e,t,s).next((()=>s.apply(e))).next((()=>n.mutationQueue.performConsistencyCheck(e))).next((()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t.batch.batchId))).next((()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,function(e){let t=ms();for(let n=0;n<e.mutationResults.length;++n)e.mutationResults[n].transformResults.length>0&&(t=t.add(e.batch.mutations[n].key));return t}(t)))).next((()=>n.localDocuments.getDocuments(e,r)))}))}(n.localStore,t);hc(n,r,null),uc(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await yc(n,e)}catch(s){await mn(s)}}async function lc(e,t,n){const r=It(e);try{const e=await function(e,t){const n=It(e);return n.persistence.runTransaction("Reject batch","readwrite-primary",(e=>{let r;return n.mutationQueue.lookupMutationBatch(e,t).next((t=>(Tt(null!==t,37113),r=t.keys(),n.mutationQueue.removeMutationBatch(e,t)))).next((()=>n.mutationQueue.performConsistencyCheck(e))).next((()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t))).next((()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,r))).next((()=>n.localDocuments.getDocuments(e,r)))}))}(r.localStore,t);hc(r,t,n),uc(r,t),r.sharedClientState.updateMutationState(t,"rejected",n),await yc(r,e)}catch(s){await mn(s)}}function uc(e,t){(e.Vu.get(t)||[]).forEach((e=>{e.resolve()})),e.Vu.delete(t)}function hc(e,t,n){const r=It(e);let s=r.Ru[r.currentUser.toKey()];if(s){const e=s.get(t);e&&(n?e.reject(n):e.resolve(),s=s.remove(t)),r.Ru[r.currentUser.toKey()]=s}}function dc(e,t,n=null){e.sharedClientState.removeLocalQueryTarget(t);for(const r of e.Tu.get(t))e.Pu.delete(r),n&&e.hu.pu(r,n);e.Tu.delete(t),e.isPrimaryClient&&e.Au.zr(t).forEach((t=>{e.Au.containsKey(t)||fc(e,t)}))}function fc(e,t){e.Iu.delete(t.path.canonicalString());const n=e.du.get(t);null!==n&&(aa(e.remoteStore,n),e.du=e.du.remove(t),e.Eu.delete(n),pc(e))}function gc(e,t,n){for(const r of n)r instanceof Ga?(e.Au.addReference(r.key,t),mc(e,r)):r instanceof Ha?(wt(Wa,"Document no longer in limbo: "+r.key),e.Au.removeReference(r.key,t),e.Au.containsKey(r.key)||fc(e,r.key)):_t(19791,{yu:r})}function mc(e,t){const n=t.key,r=n.path.canonicalString();e.du.get(n)||e.Iu.has(r)||(wt(Wa,"New document in limbo: "+n),e.Iu.add(r),pc(e))}function pc(e){for(;e.Iu.size>0&&e.du.size<e.maxConcurrentLimboResolutions;){const t=e.Iu.values().next().value;e.Iu.delete(t);const n=new Jt(Qt.fromString(t)),r=e.mu.next();e.Eu.set(r,new Ja(n)),e.du=e.du.insert(n,r),oa(e.remoteStore,new Ki(Wr(Kr(n.path)),r,"TargetPurposeLimboResolution",vn.ue))}}async function yc(e,t,n){const r=It(e),s=[],i=[],o=[];r.Pu.isEmpty()||(r.Pu.forEach(((e,a)=>{o.push(r.gu(a,t,n).then((e=>{var t;if((e||n)&&r.isPrimaryClient){const s=e?!e.fromCache:null===(t=null==n?void 0:n.targetChanges.get(a.targetId))||void 0===t?void 0:t.current;r.sharedClientState.updateQueryState(a.targetId,s?"current":"not-current")}if(e){s.push(e);const t=xo.Es(a.targetId,e);i.push(t)}})))})),await Promise.all(o),r.hu.J_(s),await async function(e,t){const n=It(e);try{await n.persistence.runTransaction("notifyLocalViewChanges","readwrite",(e=>pn.forEach(t,(t=>pn.forEach(t.Is,(r=>n.persistence.referenceDelegate.addReference(e,t.targetId,r))).next((()=>pn.forEach(t.ds,(r=>n.persistence.referenceDelegate.removeReference(e,t.targetId,r)))))))))}catch(r){if(!yn(r))throw r;wt(To,"Failed to update sequence numbers: "+r)}for(const s of t){const e=s.targetId;if(!s.fromCache){const t=n.Fs.get(e),r=t.snapshotVersion,s=t.withLastLimboFreeSnapshotVersion(r);n.Fs=n.Fs.insert(e,s)}}}(r.localStore,i))}async function vc(e,t){const n=It(e);if(!n.currentUser.isEqual(t)){wt(Wa,"User change. New user:",t.toKey());const e=await Co(n.localStore,t);n.currentUser=t,s="'waitForPendingWrites' promise is rejected due to a user change.",(r=n).Vu.forEach((e=>{e.forEach((e=>{e.reject(new Nt(Ct.CANCELLED,s))}))})),r.Vu.clear(),n.sharedClientState.handleUserChange(t,e.removedBatchIds,e.addedBatchIds),await yc(n,e.Bs)}var r,s}function wc(e,t){const n=It(e),r=n.Eu.get(t);if(r&&r.lu)return ms().add(r.key);{let e=ms();const r=n.Tu.get(t);if(!r)return e;for(const t of r){const r=n.Pu.get(t);e=e.unionWith(r.view.tu)}return e}}function bc(e){const t=It(e);return t.remoteStore.remoteSyncer.applyRemoteEvent=ic.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=wc.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=ac.bind(null,t),t.hu.J_=Ua.bind(null,t.eventManager),t.hu.pu=Ba.bind(null,t.eventManager),t}class Ec{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ho(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,t){return null}Fu(e,t){return null}vu(e){return function(e,t,n,r){return new Io(e,t,n,r)}(this.persistence,new So,e.initialUser,this.serializer)}Du(e){return new vo(bo.Vi,this.serializer)}bu(e){return new Lo}async terminate(){var e,t;null===(e=this.gcScheduler)||void 0===e||e.stop(),null===(t=this.indexBackfillerScheduler)||void 0===t||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ec.provider={build:()=>new Ec};class xc extends Ec{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,t){Tt(this.persistence.referenceDelegate instanceof Eo,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new ro(n,e.asyncQueue,t)}Du(e){const t=void 0!==this.cacheSizeBytes?Yi.withCacheSize(this.cacheSizeBytes):Yi.DEFAULT;return new vo((e=>Eo.Vi(e,t)),this.serializer)}}class _c{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>oc(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=vc.bind(null,this.syncEngine),await async function(e,t){const n=It(e);t?(n.Ia.delete(2),await sa(n)):t||(n.Ia.add(2),await ia(n),n.Aa.set("Unknown"))}(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new Va}createDatastore(e){const t=Ho(e.databaseInfo.databaseId),n=(r=e.databaseInfo,new Ko(r));var r;return function(e,t,n,r){return new ea(e,t,n,r)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return t=this.localStore,n=this.datastore,r=e.asyncQueue,s=e=>oc(this.syncEngine,e,0),i=Po.C()?new Po:new jo,new ra(t,n,r,s,i);var t,n,r,s,i}createSyncEngine(e,t){return function(e,t,n,r,s,i,o){const a=new Ya(e,t,n,r,s,i);return o&&(a.fu=!0),a}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(e){const t=It(e);wt(na,"RemoteStore shutting down."),t.Ia.add(5),await ia(t),t.Ea.shutdown(),t.Aa.set("Unknown")}(this.remoteStore),null===(e=this.datastore)||void 0===e||e.terminate(),null===(t=this.eventManager)||void 0===t||t.terminate()}}_c.provider={build:()=>new _c};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Sc{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):bt("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tc="FirestoreClient";class Ic{constructor(e,t,n,r,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this.databaseInfo=r,this.user=mt.UNAUTHENTICATED,this.clientId=Ut.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,(async e=>{wt(Tc,"Received user=",e.uid),await this.authCredentialListener(e),this.user=e})),this.appCheckCredentials.start(n,(e=>(wt(Tc,"Received new app check token=",e),this.appCheckCredentialListener(e,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new At;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Oa(t,"Failed to shutdown persistence");e.reject(n)}})),e.promise}}async function Cc(e,t){e.asyncQueue.verifyOperationInProgress(),wt(Tc,"Initializing OfflineComponentProvider");const n=e.configuration;await t.initialize(n);let r=n.initialUser;e.setCredentialChangeListener((async e=>{r.isEqual(e)||(await Co(t.localStore,e),r=e)})),t.persistence.setDatabaseDeletedListener((()=>{Et("Terminating Firestore due to IndexedDb database deletion"),e.terminate().then((()=>{wt("Terminating Firestore due to IndexedDb database deletion completed successfully")})).catch((e=>{Et("Terminating Firestore due to IndexedDb database deletion failed",e)}))})),e._offlineComponents=t}async function Nc(e,t){e.asyncQueue.verifyOperationInProgress();const n=await async function(e){if(!e._offlineComponents)if(e._uninitializedComponentsProvider){wt(Tc,"Using user provided OfflineComponentProvider");try{await Cc(e,e._uninitializedComponentsProvider._offline)}catch(t){const s=t;if(!("FirebaseError"===(n=s).name?n.code===Ct.FAILED_PRECONDITION||n.code===Ct.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&n instanceof DOMException)||22===n.code||20===n.code||11===n.code))throw s;Et("Error using user provided cache. Falling back to memory cache: "+s),await Cc(e,new Ec)}}else wt(Tc,"Using default OfflineComponentProvider"),await Cc(e,new xc(void 0));var n;return e._offlineComponents}(e);wt(Tc,"Initializing OnlineComponentProvider"),await t.initialize(n,e.configuration),e.setCredentialChangeListener((e=>Aa(t.remoteStore,e))),e.setAppCheckTokenChangeListener(((e,n)=>Aa(t.remoteStore,n))),e._onlineComponents=t}async function Ac(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(wt(Tc,"Using user provided OnlineComponentProvider"),await Nc(e,e._uninitializedComponentsProvider._online)):(wt(Tc,"Using default OnlineComponentProvider"),await Nc(e,new _c))),e._onlineComponents}async function Dc(e){const t=await Ac(e),n=t.eventManager;return n.onListen=Za.bind(null,t.syncEngine),n.onUnlisten=nc.bind(null,t.syncEngine),n.onFirstRemoteStoreListen=ec.bind(null,t.syncEngine),n.onLastRemoteStoreUnlisten=rc.bind(null,t.syncEngine),n}function kc(e,t,n={}){const r=new At;return e.asyncQueue.enqueueAndForget((async()=>function(e,t,n,r,s){const i=new Sc({next:n=>{i.Ou(),t.enqueueAndForget((()=>async function(e,t){const n=It(e),r=t.query;let s=3;const i=n.queries.get(r);if(i){const e=i.wa.indexOf(t);e>=0&&(i.wa.splice(e,1),0===i.wa.length?s=t.ba()?0:1:!i.Sa()&&t.ba()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}(e,o))),n.fromCache&&"server"===r.source?s.reject(new Nt(Ct.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):s.resolve(n)},error:e=>s.reject(e)}),o=new Ka(n,i,{includeMetadataChanges:!0,ka:!0});return async function(t,n){const r=It(t);let s=3;const i=n.query;let o=r.queries.get(i);o?!o.Sa()&&n.ba()&&(s=2):(o=new Pa,s=n.ba()?0:1);try{switch(s){case 0:o.ya=await r.onListen(i,!0);break;case 1:o.ya=await r.onListen(i,!1);break;case 2:await r.onFirstRemoteStoreListen(i)}}catch(e){const r=Oa(e,`Initialization of query '${es(n.query)}' failed`);return void n.onError(r)}r.queries.set(i,o),o.wa.push(n),n.va(r.onlineState),o.ya&&n.Ca(o.ya)&&qa(r)}(e,o)}(await Dc(e),e.asyncQueue,t,n,r))),r.promise
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}function Rc(e){const t={};return void 0!==e.timeoutSeconds&&(t.timeoutSeconds=e.timeoutSeconds),t
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const Oc=new Map,Lc="firestore.googleapis.com",jc=!0;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mc{constructor(e){var t,n;if(void 0===e.host){if(void 0!==e.ssl)throw new Nt(Ct.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Lc,this.ssl=jc}else this.host=e.host,this.ssl=null!==(t=e.ssl)&&void 0!==t?t:jc;if(this.isUsingEmulator=void 0!==e.emulatorOptions,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,void 0===e.cacheSizeBytes)this.cacheSizeBytes=Ji;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<1048576)throw new Nt(Ct.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}(function(e,t,n,r){if(!0===t&&!0===r)throw new Nt(Ct.INVALID_ARGUMENT,`${e} and ${n} cannot be used together.`)})("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Rc(null!==(n=e.experimentalLongPollingOptions)&&void 0!==n?n:{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new Nt(Ct.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new Nt(Ct.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new Nt(Ct.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(t=this.experimentalLongPollingOptions,n=e.experimentalLongPollingOptions,t.timeoutSeconds===n.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams;var t,n}}class Pc{constructor(e,t,n,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Mc({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Nt(Ct.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new Nt(Ct.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Mc(e),this._emulatorOptions=e.emulatorOptions||{},void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new kt;switch(e.type){case"firstParty":return new jt(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new Nt(Ct.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const t=Oc.get(e);t&&(wt("ComponentProvider","Removing Datastore"),Oc.delete(e),t.terminate())}(this),Promise.resolve()}}function Vc(e,t,n,r={}){var s;e=rn(e,Pc);const i=b(t),o=e._getSettings(),a=Object.assign(Object.assign({},o),{emulatorOptions:e._getEmulatorOptions()}),c=`${t}:${n}`;i&&(async function(e){(await fetch(e,{credentials:"include"})).ok}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(`https://${c}`),_("Firestore",!0)),o.host!==Lc&&o.host!==c&&Et("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l=Object.assign(Object.assign({},o),{host:c,ssl:i,emulatorOptions:r});if(!N(l,a)&&(e._setSettings(l),r.mockUserToken)){let t,n;if("string"==typeof r.mockUserToken)t=r.mockUserToken,n=mt.MOCK_USER;else{t=function(e,t){if(e.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n=t||"demo-project",r=e.iat||0,s=e.sub||e.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const i=Object.assign({iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},e);return[f(JSON.stringify({alg:"none",type:"JWT"})),f(JSON.stringify(i)),""].join(".")}(r.mockUserToken,null===(s=e._app)||void 0===s?void 0:s.options.projectId);const i=r.mockUserToken.sub||r.mockUserToken.user_id;if(!i)throw new Nt(Ct.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");n=new mt(i)}e._authCredentials=new Rt(new Dt(t,n))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fc{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new Fc(this.firestore,e,this._query)}}class Uc{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Bc(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Uc(this.firestore,e,this._key)}toJSON(){return{type:Uc._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(on(t,Uc._jsonSchema))return new Uc(e,n||null,new Jt(Qt.fromString(t.referencePath)))}}Uc._jsonSchemaVersion="firestore/documentReference/1.0",Uc._jsonSchema={type:sn("string",Uc._jsonSchemaVersion),referencePath:sn("string")};class Bc extends Fc{constructor(e,t,n){super(e,t,Kr(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Uc(this.firestore,null,new Jt(e))}withConverter(e){return new Bc(this.firestore,e,this._path)}}function qc(e,t,...n){if(e=D(e),Yt("collection","path",t),e instanceof Pc){const r=Qt.fromString(t,...n);return en(r),new Bc(e,null,r)}{if(!(e instanceof Uc||e instanceof Bc))throw new Nt(Ct.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=e._path.child(Qt.fromString(t,...n));return en(r),new Bc(e.firestore,null,r)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const $c="AsyncQueue";class zc{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new Qo(this,"async_queue_retry"),this.oc=()=>{const e=Go();e&&wt($c,"Visibility state changed to "+e.visibilityState),this.F_.y_()},this._c=e;const t=Go();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const t=Go();t&&"function"==typeof t.removeEventListener&&t.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise((()=>{}));const t=new At;return this.uc((()=>this.Xu&&this.rc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Zu.push(e),this.cc())))}async cc(){if(0!==this.Zu.length){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!yn(e))throw e;wt($c,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_((()=>this.cc()))}}uc(e){const t=this._c.then((()=>(this.nc=!0,e().catch((e=>{throw this.tc=e,this.nc=!1,bt("INTERNAL UNHANDLED ERROR: ",Kc(e)),e})).then((e=>(this.nc=!1,e))))));return this._c=t,t}enqueueAfterDelay(e,t,n){this.ac(),this.sc.indexOf(e)>-1&&(t=0);const r=Ra.createAndSchedule(this,e,t,n,(e=>this.lc(e)));return this.ec.push(r),r}ac(){this.tc&&_t(47125,{hc:Kc(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do{e=this._c,await e}while(e!==this._c)}Tc(e){for(const t of this.ec)if(t.timerId===e)return!0;return!1}Ic(e){return this.Pc().then((()=>{this.ec.sort(((e,t)=>e.targetTimeMs-t.targetTimeMs));for(const t of this.ec)if(t.skipDelay(),"all"!==e&&t.timerId===e)break;return this.Pc()}))}dc(e){this.sc.push(e)}lc(e){const t=this.ec.indexOf(e);this.ec.splice(t,1)}}function Kc(e){let t=e.message||"";return e.stack&&(t=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),t}class Gc extends Pc{constructor(e,t,n,r){super(e,t,n,r),this.type="firestore",this._queue=new zc,this._persistenceKey=(null==r?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new zc(e),this._firestoreClient=void 0,await e}}}function Hc(e,t){const n="object"==typeof e?e:function(e=Le){const t=Me.get(e);if(!t&&e===Le&&v())return $e();if(!t)throw Be.create("no-app",{appName:e});return t}(),r="string"==typeof e?e:Gn,s=function(e,t){const n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const e=y("firestore");e&&Vc(s,...e)}return s}function Qc(e){if(e._terminated)throw new Nt(Ct.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||function(e){var t,n,r;const s=e._freezeSettings(),i=(o=e._databaseId,a=(null===(t=e._app)||void 0===t?void 0:t.options.appId)||"",c=e._persistenceKey,l=s,new Kn(o,a,c,l.host,l.ssl,l.experimentalForceLongPolling,l.experimentalAutoDetectLongPolling,Rc(l.experimentalLongPollingOptions),l.useFetchStreams,l.isUsingEmulator));var o,a,c,l;e._componentsProvider||(null===(n=s.localCache)||void 0===n?void 0:n._offlineComponentProvider)&&(null===(r=s.localCache)||void 0===r?void 0:r._onlineComponentProvider)&&(e._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),e._firestoreClient=new Ic(e._authCredentials,e._appCheckCredentials,e._queue,i,e._componentsProvider&&function(e){const t=null==e?void 0:e._online.build();return{_offline:null==e?void 0:e._offline.build(t),_online:t}}(e._componentsProvider))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e),e._firestoreClient}class Wc{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Wc(On.fromBase64String(e))}catch(t){throw new Nt(Ct.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Wc(On.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Wc._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(on(e,Wc._jsonSchema))return Wc.fromBase64String(e.bytes)}}Wc._jsonSchemaVersion="firestore/bytes/1.0",Wc._jsonSchema={type:sn("string",Wc._jsonSchemaVersion),bytes:sn("string")};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Xc{constructor(...e){for(let t=0;t<e.length;++t)if(0===e[t].length)throw new Nt(Ct.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Xt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jc{constructor(e){this._methodName=e}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yc{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new Nt(Ct.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new Nt(Ct.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Bt(this._lat,e._lat)||Bt(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Yc._jsonSchemaVersion}}static fromJSON(e){if(on(e,Yc._jsonSchema))return new Yc(e.latitude,e.longitude)}}Yc._jsonSchemaVersion="firestore/geoPoint/1.0",Yc._jsonSchema={type:sn("string",Yc._jsonSchemaVersion),latitude:sn("number"),longitude:sn("number")};
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zc{constructor(e){this._values=(e||[]).map((e=>e))}toArray(){return this._values.map((e=>e))}isEqual(e){return function(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;++n)if(e[n]!==t[n])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Zc._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(on(e,Zc._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((e=>"number"==typeof e)))return new Zc(e.vectorValues);throw new Nt(Ct.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Zc._jsonSchemaVersion="firestore/vectorValue/1.0",Zc._jsonSchema={type:sn("string",Zc._jsonSchemaVersion),vectorValues:sn("object")};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const el=/^__.*__$/;class tl{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return null!==this.fieldMask?new qs(e,this.data,this.fieldMask,t,this.fieldTransforms):new Bs(e,this.data,t,this.fieldTransforms)}}function nl(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw _t(40011,{Ec:e})}}class rl{constructor(e,t,n,r,s,i){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=r,void 0===s&&this.Ac(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new rl(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var t;const n=null===(t=this.path)||void 0===t?void 0:t.child(e),r=this.Rc({path:n,mc:!1});return r.fc(e),r}gc(e){var t;const n=null===(t=this.path)||void 0===t?void 0:t.child(e),r=this.Rc({path:n,mc:!1});return r.Ac(),r}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return gl(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return void 0!==this.fieldMask.find((t=>e.isPrefixOf(t)))||void 0!==this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(0===e.length)throw this.wc("Document fields must not be empty");if(nl(this.Ec)&&el.test(e))throw this.wc('Document fields cannot begin and end with "__"')}}class sl{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||Ho(e)}Dc(e,t,n,r=!1){return new rl({Ec:e,methodName:t,bc:n,path:Xt.emptyPath(),mc:!1,Sc:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function il(e){const t=e._freezeSettings(),n=Ho(e._databaseId);return new sl(e._databaseId,!!t.ignoreUndefinedProperties,n)}function ol(e,t,n,r,s,i={}){const o=e.Dc(i.merge||i.mergeFields?2:0,t,n,s);ul("Data must be an object, but it was:",o,r);const a=cl(r,o);let c,l;if(i.merge)c=new kn(o.fieldMask),l=o.fieldTransforms;else if(i.mergeFields){const e=[];for(const r of i.mergeFields){const s=hl(t,r,n);if(!o.contains(s))throw new Nt(Ct.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);ml(e,s)||e.push(s)}c=new kn(e),l=o.fieldTransforms.filter((e=>c.covers(e.field)))}else c=null,l=o.fieldTransforms;return new tl(new mr(a),c,l)}function al(e,t){if(ll(e=D(e)))return ul("Unsupported field value:",t,e),cl(e,t);if(e instanceof Jc)return function(e,t){if(!nl(t.Ec))throw t.wc(`${e._methodName}() can only be used with update() and set()`);if(!t.path)throw t.wc(`${e._methodName}() is not currently supported inside arrays`);const n=e._toFieldTransform(t);n&&t.fieldTransforms.push(n)}(e,t),null;if(void 0===e&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),e instanceof Array){if(t.settings.mc&&4!==t.Ec)throw t.wc("Nested arrays are not supported");return function(e,t){const n=[];let r=0;for(const s of e){let e=al(s,t.yc(r));null==e&&(e={nullValue:"NULL_VALUE"}),n.push(e),r++}return{arrayValue:{values:n}}}(e,t)}return function(e,t){if(null===(e=D(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return ws(t.serializer,e);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){const n=ln.fromDate(e);return{timestampValue:bi(t.serializer,n)}}if(e instanceof ln){const n=new ln(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:bi(t.serializer,n)}}if(e instanceof Yc)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof Wc)return{bytesValue:Ei(t.serializer,e._byteString)};if(e instanceof Uc){const n=t.databaseId,r=e.firestore._databaseId;if(!r.isEqual(n))throw t.wc(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:Si(e.firestore._databaseId||t.databaseId,e._key.path)}}if(e instanceof Zc)return n=e,r=t,{mapValue:{fields:{[Qn]:{stringValue:Jn},[Yn]:{arrayValue:{values:n.toArray().map((e=>{if("number"!=typeof e)throw r.wc("VectorValues must only contain numeric values.");return ys(r.serializer,e)}))}}}}};var n,r;throw t.wc(`Unsupported field value: ${nn(e)}`)}(e,t)}function cl(e,t){const n={};return Tn(e)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Sn(e,((e,r)=>{const s=al(r,t.Vc(e));null!=s&&(n[e]=s)})),{mapValue:{fields:n}}}function ll(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof ln||e instanceof Yc||e instanceof Wc||e instanceof Uc||e instanceof Jc||e instanceof Zc)}function ul(e,t,n){if(!ll(n)||!tn(n)){const r=nn(n);throw"an object"===r?t.wc(e+" a custom object"):t.wc(e+" "+r)}}function hl(e,t,n){if((t=D(t))instanceof Xc)return t._internalPath;if("string"==typeof t)return fl(e,t);throw gl("Field path arguments must be of type string or ",e,!1,void 0,n)}const dl=new RegExp("[~\\*/\\[\\]]");function fl(e,t,n){if(t.search(dl)>=0)throw gl(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,n);try{return new Xc(...t.split("."))._internalPath}catch(r){throw gl(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,n)}}function gl(e,t,n,r,s){const i=r&&!r.isEmpty(),o=void 0!==s;let a=`Function ${t}() called with invalid data`;n&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${r}`),o&&(c+=` in document ${s}`),c+=")"),new Nt(Ct.INVALID_ARGUMENT,a+e+c)}function ml(e,t){return e.some((e=>e.isEqual(t)))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pl{constructor(e,t,n,r,s){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Uc(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const e=new yl(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(vl("DocumentSnapshot.get",e));if(null!==t)return this._userDataWriter.convertValue(t)}}}class yl extends pl{data(){return super.data()}}function vl(e,t){return"string"==typeof t?fl(e,t):t instanceof Xc?t._internalPath:t._delegate._internalPath}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wl{}class bl extends wl{}function El(e,t,...n){let r=[];t instanceof wl&&r.push(t),r=r.concat(n),function(e){const t=e.filter((e=>e instanceof _l)).length,n=e.filter((e=>e instanceof xl)).length;if(t>1||t>0&&n>0)throw new Nt(Ct.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)e=s._apply(e);return e}class xl extends bl{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new xl(e,t,n)}_apply(e){const t=this._parse(e);return Dl(e._query,t),new Fc(e.firestore,e.converter,Xr(e._query,t))}_parse(e){const t=il(e.firestore),n=function(e,t,n,r,s,i,o){let a;if(s.isKeyField()){if("array-contains"===i||"array-contains-any"===i)throw new Nt(Ct.INVALID_ARGUMENT,`Invalid Query. You can't perform '${i}' queries on documentId().`);if("in"===i||"not-in"===i){Al(o,i);const t=[];for(const n of o)t.push(Nl(r,e,n));a={arrayValue:{values:t}}}else a=Nl(r,e,o)}else"in"!==i&&"not-in"!==i&&"array-contains-any"!==i||Al(o,i),a=function(e,t,n,r=!1){return al(n,e.Dc(r?4:3,t))}(n,t,o,"in"===i||"not-in"===i);return Sr.create(s,i,a)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value);return n}}class _l extends wl{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new _l(e,t)}_parse(e){const t=this._queryConstraints.map((t=>t._parse(e))).filter((e=>e.getFilters().length>0));return 1===t.length?t[0]:Tr.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return 0===t.getFilters().length?e:(function(e,t){let n=e;const r=t.getFlattenedFilters();for(const s of r)Dl(n,s),n=Xr(n,s)}(e._query,t),new Fc(e.firestore,e.converter,Xr(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return"and"===this.type?"and":"or"}}class Sl extends bl{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Sl(e,t)}_apply(e){const t=function(e,t,n){if(null!==e.startAt)throw new Nt(Ct.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(null!==e.endAt)throw new Nt(Ct.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Er(t,n)}(e._query,this._field,this._direction);return new Fc(e.firestore,e.converter,function(e,t){const n=e.explicitOrderBy.concat([t]);return new zr(e.path,e.collectionGroup,n,e.filters.slice(),e.limit,e.limitType,e.startAt,e.endAt)}(e._query,t))}}function Tl(e,t="asc"){const n=t,r=vl("orderBy",e);return Sl._create(r,n)}class Il extends bl{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new Il(e,t,n)}_apply(e){return new Fc(e.firestore,e.converter,Jr(e._query,this._limit,this._limitType))}}function Cl(e){return function(e,t){if(t<=0)throw new Nt(Ct.INVALID_ARGUMENT,`Function ${e}() requires a positive number, but it was: ${t}.`)}("limit",e),Il._create("limit",e,"F")}function Nl(e,t,n){if("string"==typeof(n=D(n))){if(""===n)throw new Nt(Ct.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Hr(t)&&-1!==n.indexOf("/"))throw new Nt(Ct.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=t.path.child(Qt.fromString(n));if(!Jt.isDocumentKey(r))throw new Nt(Ct.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return cr(e,new Jt(r))}if(n instanceof Uc)return cr(e,n._key);throw new Nt(Ct.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${nn(n)}.`)}function Al(e,t){if(!Array.isArray(e)||0===e.length)throw new Nt(Ct.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function Dl(e,t){const n=function(e,t){for(const n of e)for(const e of n.getFlattenedFilters())if(t.indexOf(e.op)>=0)return e.op;return null}(e.filters,function(e){switch(e){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(null!==n)throw n===t.op?new Nt(Ct.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new Nt(Ct.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${n.toString()}' filters.`)}class kl{convertValue(e,t="none"){switch(Zn(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Mn(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Pn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw _t(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return Sn(e,((e,r)=>{n[e]=this.convertValue(r,t)})),n}convertVectorValue(e){var t,n,r;const s=null===(r=null===(n=null===(t=e.fields)||void 0===t?void 0:t[Yn].arrayValue)||void 0===n?void 0:n.values)||void 0===r?void 0:r.map((e=>Mn(e.doubleValue)));return new Zc(s)}convertGeoPoint(e){return new Yc(Mn(e.latitude),Mn(e.longitude))}convertArray(e,t){return(e.values||[]).map((e=>this.convertValue(e,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const n=$n(e);return null==n?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(zn(e));default:return null}}convertTimestamp(e){const t=jn(e);return new ln(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=Qt.fromString(e);Tt(zi(n),9688,{name:e});const r=new Hn(n.get(1),n.get(3)),s=new Jt(n.popFirst(5));return r.isEqual(t)||bt(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rl{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Ol extends pl{constructor(e,t,n,r,s,i){super(e,t,n,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Ll(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(vl("DocumentSnapshot.get",e));if(null!==n)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new Nt(Ct.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Ol._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),e&&e.isValidDocument()&&e.isFoundDocument()?(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t):t}}Ol._jsonSchemaVersion="firestore/documentSnapshot/1.0",Ol._jsonSchema={type:sn("string",Ol._jsonSchemaVersion),bundleSource:sn("string","DocumentSnapshot"),bundleName:sn("string"),bundle:sn("string")};class Ll extends Ol{data(e={}){return super.data(e)}}class jl{constructor(e,t,n,r){this._firestore=e,this._userDataWriter=t,this._snapshot=r,this.metadata=new Rl(r.hasPendingWrites,r.fromCache),this.query=n}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(e,t){this._snapshot.docs.forEach((n=>{e.call(t,new Ll(this._firestore,this._userDataWriter,n.key,n,new Rl(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new Nt(Ct.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(e,t){if(e._snapshot.oldDocs.isEmpty()){let t=0;return e._snapshot.docChanges.map((n=>{const r=new Ll(e._firestore,e._userDataWriter,n.doc.key,n.doc,new Rl(e._snapshot.mutatedKeys.has(n.doc.key),e._snapshot.fromCache),e.query.converter);return n.doc,{type:"added",doc:r,oldIndex:-1,newIndex:t++}}))}{let n=e._snapshot.oldDocs;return e._snapshot.docChanges.filter((e=>t||3!==e.type)).map((t=>{const r=new Ll(e._firestore,e._userDataWriter,t.doc.key,t.doc,new Rl(e._snapshot.mutatedKeys.has(t.doc.key),e._snapshot.fromCache),e.query.converter);let s=-1,i=-1;return 0!==t.type&&(s=n.indexOf(t.doc.key),n=n.delete(t.doc.key)),1!==t.type&&(n=n.add(t.doc),i=n.indexOf(t.doc.key)),{type:Ml(t.type),doc:r,oldIndex:s,newIndex:i}}))}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new Nt(Ct.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=jl._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ut.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],r=[];return this.docs.forEach((e=>{null!==e._document&&(t.push(e._document),n.push(this._userDataWriter.convertObjectMap(e._document.data.value.mapValue.fields,"previous")),r.push(e.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Ml(e){switch(e){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return _t(61501,{type:e})}}jl._jsonSchemaVersion="firestore/querySnapshot/1.0",jl._jsonSchema={type:sn("string",jl._jsonSchemaVersion),bundleSource:sn("string","QuerySnapshot"),bundleName:sn("string"),bundle:sn("string")};class Pl extends kl{constructor(e){super(),this.firestore=e}convertBytes(e){return new Wc(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Uc(this.firestore,null,t)}}function Vl(e){e=rn(e,Fc);const t=rn(e.firestore,Gc),n=Qc(t),r=new Pl(t);return function(e){if("L"===e.limitType&&0===e.explicitOrderBy.length)throw new Nt(Ct.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}(e._query),kc(n,e._query).then((n=>new jl(t,r,e,n)))}function Fl(e,t){const n=rn(e.firestore,Gc),r=function(e,t,...n){if(e=D(e),1===arguments.length&&(t=Ut.newId()),Yt("doc","path",t),e instanceof Pc){const r=Qt.fromString(t,...n);return Zt(r),new Uc(e,null,new Jt(r))}{if(!(e instanceof Uc||e instanceof Bc))throw new Nt(Ct.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=e._path.child(Qt.fromString(t,...n));return Zt(r),new Uc(e.firestore,e instanceof Bc?e.converter:null,new Jt(r))}}(e),s=function(e,t){let n;return n=e?e.toFirestore(t):t,n}(e.converter,t);return function(e,t){return function(e,t){const n=new At;return e.asyncQueue.enqueueAndForget((async()=>sc(await function(e){return Ac(e).then((e=>e.syncEngine))}(e),t,n))),n.promise}(Qc(e),t)}(n,[ol(il(e.firestore),"addDoc",r._key,s,null!==e.converter,{}).toMutation(r._key,Os.exists(!1))]).then((()=>r))}!function(e,t=!0){pt="11.10.0",Ue(new k("firestore",((e,{instanceIdentifier:n,options:r})=>{const s=e.getProvider("app").getImmediate(),i=new Gc(new Ot(e.getProvider("auth-internal")),new Pt(s,e.getProvider("app-check-internal")),function(e,t){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new Nt(Ct.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Hn(e.options.projectId,t)}(s,n),s);return r=Object.assign({useFetchStreams:t},r),i._setSettings(r),i}),"PUBLIC").setMultipleInstances(!0)),ze(ft,gt,e),ze(ft,gt,"esm2017")}();const Ul={apiKey:"YOUR_API_KEY_HERE",authDomain:"your-project.firebaseapp.com",projectId:"your-project-id",storageBucket:"your-project.appspot.com",messagingSenderId:"123456789",appId:"1:123456789:web:abcdef123456"},Bl=()=>{const e=localStorage.getItem("firebase_demo_mode");return null!==e?JSON.parse(e):"YOUR_API_KEY_HERE"===Ul.apiKey};let ql=null,$l=null;const zl=()=>{if(Bl())return console.log("🔥 Firebase Demo Mode - Station reports will be saved locally only"),null;try{return ql||(ql=$e(Ul),$l=Hc(ql),console.log("🔥 Firebase initialized for station reporting")),$l}catch(e){return console.warn("⚠️ Firebase initialization failed, falling back to demo mode:",e),localStorage.setItem("firebase_demo_mode","true"),null}},Kl=()=>Bl()?null:$l||zl(),Gl={async submitReport(e){const t=Kl();if(!t)return console.log("🔥 Demo: Would submit report:",e),{id:"demo_"+Date.now(),demo:!0};try{const n=await Fl(qc(t,"station_reports"),{...e,createdAt:(new Date).toISOString(),version:"1.0"});return console.log("✅ Report submitted to Firebase:",n.id),{id:n.id,demo:!1}}catch(n){throw console.error("❌ Firebase report submission failed:",n),n}},async getStationReports(e,t=10){const n=Kl();if(!n)return console.log("🔥 Demo: Would query reports for:",e),[];try{const r=El(qc(n,"station_reports"),function(e,t,n){const r=t,s=vl("where",e);return xl._create(s,r,n)}("stationName","==",e),Tl("createdAt","desc"),Cl(t)),s=await Vl(r),i=[];return s.forEach((e=>{i.push({id:e.id,...e.data()})})),i}catch(r){return console.error("❌ Firebase query failed:",r),[]}},async getAllReports(e=100){const t=Kl();if(!t)return console.log("🔥 Demo: Would query all reports"),[];try{const n=El(qc(t,"station_reports"),Tl("createdAt","desc"),Cl(e)),r=await Vl(n),s=[];return r.forEach((e=>{s.push({id:e.id,...e.data()})})),s}catch(n){return console.error("❌ Firebase query failed:",n),[]}}};zl();const Hl=new class{constructor(){this.storageKeys={reports:"radio_station_reports",overrides:"radio_station_overrides",reportCounter:"radio_report_counter"},this.initializeStorage()}initializeStorage(){localStorage.getItem(this.storageKeys.reports)||localStorage.setItem(this.storageKeys.reports,JSON.stringify({})),localStorage.getItem(this.storageKeys.overrides)||localStorage.setItem(this.storageKeys.overrides,JSON.stringify({})),localStorage.getItem(this.storageKeys.reportCounter)||localStorage.setItem(this.storageKeys.reportCounter,"0")}async reportFailedStation(e,t){const n=this.getReports(),r=this.getOverrides(),s=(new Date).toISOString(),i=this.getNextReportId(),o=e.name,a=r[o]&&r[o].active;n[o]||(n[o]={stationName:e.name,originalUrl:a?r[o].originalUrl:e.url,logoUrl:e.logo,description:e.description,category:e.originalCategory||"unknown",reports:[],totalReports:0,firstReported:s,lastReported:s,status:"reported"});const c={reportId:i,timestamp:s,usingOverride:a,overrideUrl:a?e.url:null,errorDetails:{primaryError:t.primaryError||"Connection failed",mediaErrorCode:t.mediaErrorCode,mediaErrorMessage:t.mediaErrorMessage,networkState:t.networkState,readyState:t.readyState,connectionType:t.connectionType,userAgent:navigator.userAgent,attemptedUrls:t.attemptedUrls||[e.url],fallbackAttempts:t.fallbackAttempts||0},browserInfo:{platform:navigator.platform,language:navigator.language,cookieEnabled:navigator.cookieEnabled,onLine:navigator.onLine}};n[o].reports.push(c),n[o].totalReports++,n[o].lastReported=s,this.saveReports(n),console.log(`📊 Station reported: ${e.name} (Report #${n[o].totalReports})${a?" [Using Override]":""}`);try{const t={stationName:e.name,stationUrl:e.url,originalUrl:a?r[o].originalUrl:e.url,logoUrl:e.logo,description:e.description,category:e.originalCategory||"unknown",reportId:i,timestamp:s,usingOverride:a,overrideUrl:a?e.url:null,errorDetails:c.errorDetails,browserInfo:c.browserInfo},n=await Gl.submitReport(t);n.demo||console.log(`🔥 Report also sent to Firebase: ${n.id}`)}catch(l){console.warn("⚠️ Failed to send report to Firebase (saved locally):",l)}return{success:!0,reportId:i,totalReports:n[o].totalReports}}getReports(){try{return JSON.parse(localStorage.getItem(this.storageKeys.reports))||{}}catch(e){return console.error("Error parsing reports:",e),{}}}saveReports(e){localStorage.setItem(this.storageKeys.reports,JSON.stringify(e))}getOverrides(){try{return JSON.parse(localStorage.getItem(this.storageKeys.overrides))||{}}catch(e){return console.error("Error parsing overrides:",e),{}}}saveOverrides(e){localStorage.setItem(this.storageKeys.overrides,JSON.stringify(e))}setStationOverride(e,t){if(t.url&&!/^https?:\/\//i.test(t.url))return console.warn("Rejected override URL - must start with http:// or https://",t.url),!1;const n=this.getOverrides(),r=(new Date).toISOString();return n[e]={...t,updatedAt:r,originalUrl:t.originalUrl,active:!0},this.saveOverrides(n),console.log(`🔧 Override set for ${e}:`,t),!0}removeStationOverride(e){const t=this.getOverrides();return!!t[e]&&(delete t[e],this.saveOverrides(t),console.log(`🔧 Override removed for ${e}`),!0)}getEffectiveStationData(e){const t=this.getOverrides()[e.name];return t&&t.active?(console.log(`🔧 Using override for ${e.name}`),{...e,url:t.url||e.url,logo:t.logo||e.logo,_hasOverride:!0,_overrideData:t}):e}getNextReportId(){const e=parseInt(localStorage.getItem(this.storageKeys.reportCounter)||"0")+1;return localStorage.setItem(this.storageKeys.reportCounter,e.toString()),e}getDashboardStats(){const e=this.getReports(),t=this.getOverrides(),n=Object.values(e).reduce(((e,t)=>(e[t.status]=(e[t.status]||0)+1,e)),{}),r=n.fixed||0,s=(n.reported||0)+(n.investigating||0);return{totalStationsReported:Object.keys(e).length,totalReports:Object.values(e).reduce(((e,t)=>e+t.totalReports),0),totalOverrides:Object.keys(t).length,solvedStations:r,unsolvedStations:s,mostReportedStations:Object.entries(e).sort((([,e],[,t])=>t.totalReports-e.totalReports)).slice(0,10).map((([e,t])=>({name:e,totalReports:t.totalReports,lastReported:t.lastReported,status:t.status}))),recentReports:Object.values(e).flatMap((e=>e.reports.map((t=>({stationName:e.stationName,reportId:t.reportId,timestamp:t.timestamp,primaryError:t.errorDetails.primaryError}))))).sort(((e,t)=>new Date(t.timestamp)-new Date(e.timestamp))).slice(0,20)}}updateStationStatus(e,t,n=""){const r=this.getReports();return!!r[e]&&(r[e].status=t,r[e].statusNotes=n,r[e].statusUpdated=(new Date).toISOString(),this.saveReports(r),!0)}exportData(){return{reports:this.getReports(),overrides:this.getOverrides(),exportedAt:(new Date).toISOString(),version:"1.0"}}importData(e){e.reports&&this.saveReports(e.reports),e.overrides&&this.saveOverrides(e.overrides),console.log("📊 Data imported successfully")}clearAllData(){localStorage.removeItem(this.storageKeys.reports),localStorage.removeItem(this.storageKeys.overrides),localStorage.removeItem(this.storageKeys.reportCounter),this.initializeStorage(),console.log("🧹 All reporting data cleared")}removeStation(e){const t=this.getReports();return!!t[e]&&(delete t[e],this.saveReports(t),console.log(`🗑️ Station removed: ${e}`),!0)}},Ql=({onClose:l})=>{const[u,h]=e.useState(!1),[d,f]=e.useState("reports"),[g,m]=e.useState(null),[p,y]=e.useState({}),[v,w]=e.useState({}),[b,E]=e.useState(null),[x,_]=e.useState(null),[S,T]=e.useState("all"),[I,C]=e.useState([]),[N,A]=e.useState(""),[D,k]=e.useState(null),[R,O]=e.useState(!t()),[L,j]=e.useState(!1),[M,P]=e.useState(null),[V,F]=e.useState(null);e.useEffect((()=>{U()}),[]);const U=()=>{const e=Hl.getDashboardStats(),t=Hl.getReports(),r=Hl.getOverrides();m(e),y(t),w(r);try{const e=n();C(e)}catch(s){console.error("Failed to load stations:",s),C([])}},B=async(e,t=null)=>{const n=t||e.url;k(e.name);try{const t=new Audio,r=new Promise(((e,r)=>{const s=setTimeout((()=>{t.removeEventListener("canplay",e),t.removeEventListener("error",r),r(new Error("Timeout - station took too long to respond"))}),1e4);t.addEventListener("canplay",(()=>{clearTimeout(s),e()}),{once:!0}),t.addEventListener("error",(e=>{clearTimeout(s),r(e.target.error||new Error("Failed to load"))}),{once:!0}),t.src=n}));await r,alert(`✅ Station "${e.name}" works! URL: ${n}`)}catch(r){alert(`❌ Station "${e.name}" failed: ${r.message}\nURL: ${n}`)}finally{k(null)}},q=Object.entries(p).filter((([e,t])=>"all"===S||t.status===S));return g?u?r.jsx("div",{className:"fixed bottom-4 left-4 z-50",children:r.jsx("button",{onClick:()=>h(!1),className:"bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl font-medium",title:"Open Developer Dashboard",children:"🛠️ Dashboard"})}):r.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:r.jsxs("div",{className:"bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col",children:[r.jsxs("div",{className:"flex items-center justify-between p-6 border-b",children:[r.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"🛠️ Developer Dashboard"}),r.jsxs("div",{className:"flex items-center gap-4",children:[r.jsx("button",{onClick:()=>{const e=Hl.exportData(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=URL.createObjectURL(t),r=document.createElement("a");r.href=n,r.download=`radio-reports-${(new Date).toISOString().split("T")[0]}.json`,r.click(),URL.revokeObjectURL(n)},className:"px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700",children:"📤 Export Data"}),r.jsxs("label",{className:"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer",children:["📥 Import Data",r.jsx("input",{type:"file",accept:".json",onChange:e=>{const t=e.target.files[0];if(t){const e=new FileReader;e.onload=e=>{try{const t=JSON.parse(e.target.result);Hl.importData(t),U(),alert("Data imported successfully!")}catch(t){alert("Error importing data: "+t.message)}},e.readAsText(t)}},className:"hidden"})]}),r.jsx("button",{onClick:()=>h(!0),className:"px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700",title:"Minimize dashboard",children:"➖ Minimize"}),r.jsx("button",{onClick:l,className:"px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700",children:"✕ Close"})]})]}),r.jsx("div",{className:"p-6 border-b bg-gray-50",children:r.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-5 gap-4",children:[r.jsxs("div",{className:"bg-white p-4 rounded-lg shadow",children:[r.jsx("div",{className:"text-2xl font-bold text-blue-600",children:g.totalReports}),r.jsx("div",{className:"text-sm text-gray-600",children:"Total Reports"})]}),r.jsxs("div",{className:"bg-white p-4 rounded-lg shadow",children:[r.jsx("div",{className:"text-2xl font-bold text-red-600",children:g.totalStationsReported}),r.jsx("div",{className:"text-sm text-gray-600",children:"Stations Reported"})]}),r.jsxs("div",{className:"bg-white p-4 rounded-lg shadow",children:[r.jsx("div",{className:"text-2xl font-bold text-green-600",children:g.solvedStations}),r.jsx("div",{className:"text-sm text-gray-600",children:"Solved"})]}),r.jsxs("div",{className:"bg-white p-4 rounded-lg shadow",children:[r.jsx("div",{className:"text-2xl font-bold text-orange-600",children:g.unsolvedStations}),r.jsx("div",{className:"text-sm text-gray-600",children:"Unsolved"})]}),r.jsxs("div",{className:"bg-white p-4 rounded-lg shadow",children:[r.jsx("div",{className:"text-2xl font-bold text-purple-600",children:g.totalOverrides}),r.jsx("div",{className:"text-sm text-gray-600",children:"Total Overrides"})]})]})}),r.jsxs("div",{className:"flex border-b",children:[r.jsx("button",{onClick:()=>f("reports"),className:"px-6 py-3 font-medium "+("reports"===d?"border-b-2 border-blue-600 text-blue-600":"text-black hover:text-gray-900"),style:{color:"reports"===d?void 0:"#000"},children:"📊 Station Reports"}),r.jsx("button",{onClick:()=>f("overrides"),className:"px-6 py-3 font-medium "+("overrides"===d?"border-b-2 border-blue-600 text-blue-600":"text-black hover:text-gray-900"),style:{color:"overrides"===d?void 0:"#000"},children:"🔧 URL Overrides"}),r.jsx("button",{onClick:()=>f("recent"),className:"px-6 py-3 font-medium "+("recent"===d?"border-b-2 border-blue-600 text-blue-600":"text-black hover:text-gray-900"),style:{color:"recent"===d?void 0:"#000"},children:"🕒 Recent Activity"}),r.jsx("button",{onClick:()=>f("testing"),className:"px-6 py-3 font-medium "+("testing"===d?"border-b-2 border-blue-600 text-blue-600":"text-black hover:text-gray-900"),style:{color:"testing"===d?void 0:"#000"},children:"🧪 Stream Testing"}),r.jsx("button",{onClick:()=>f("settings"),className:"px-6 py-3 font-medium "+("settings"===d?"border-b-2 border-blue-600 text-blue-600":"text-black hover:text-gray-900"),style:{color:"settings"===d?void 0:"#000"},children:"⚙️ Dev Settings"})]}),r.jsxs("div",{className:"flex-1 overflow-hidden",children:["reports"===d&&r.jsxs("div",{className:"h-full flex",children:[r.jsxs("div",{className:"w-1/3 border-r overflow-y-auto",children:[r.jsx("div",{className:"p-4 border-b",children:r.jsxs("select",{value:S,onChange:e=>T(e.target.value),className:"w-full p-2 border rounded text-black",children:[r.jsx("option",{value:"all",children:"All Stations"}),r.jsx("option",{value:"reported",children:"Reported"}),r.jsx("option",{value:"investigating",children:"Investigating"}),r.jsx("option",{value:"fixed",children:"Fixed"})]})}),r.jsx("div",{className:"p-4",children:q.map((([e,t])=>r.jsxs("div",{onClick:()=>E(t),className:`p-3 border rounded mb-2 cursor-pointer hover:bg-gray-50 ${(null==b?void 0:b.stationName)===e?"bg-blue-50 border-blue-300":""} text-black`,children:[r.jsx("div",{className:"font-medium text-black",children:e}),r.jsxs("div",{className:"text-sm text-black",children:[t.totalReports," reports • ",t.status]}),r.jsxs("div",{className:"text-xs text-black",children:["Last: ",new Date(t.lastReported).toLocaleDateString()]})]},e)))})]}),r.jsx("div",{className:"flex-1 overflow-y-auto",children:b?r.jsxs("div",{className:"p-6",children:[r.jsxs("div",{className:"flex items-center justify-between mb-4",children:[r.jsx("h2",{className:"text-xl font-bold text-gray-900",children:b.stationName}),r.jsxs("div",{className:"flex gap-2",children:[["reported","investigating","fixed"].map((e=>r.jsx("button",{onClick:()=>((e,t,n="")=>{Hl.updateStationStatus(e,t,n),U()})(b.stationName,e),className:"px-3 py-1 text-xs rounded "+(b.status===e?"bg-blue-600 text-white":"bg-gray-200 text-gray-700 hover:bg-gray-300"),children:e},e))),r.jsx("button",{onClick:()=>{confirm(`Are you sure you want to remove all reports for "${b.stationName}"? This action cannot be undone.`)&&(Hl.removeStation(b.stationName),U(),E(null))},className:"px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700",children:"remove"})]})]}),r.jsxs("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[r.jsxs("div",{children:[r.jsx("h3",{className:"font-medium mb-2 text-gray-900",children:"Station Info"}),r.jsxs("div",{className:"bg-gray-50 p-3 rounded text-sm text-gray-900",children:[r.jsxs("div",{children:[r.jsx("strong",{children:"Original URL:"})," ",b.originalUrl]}),r.jsxs("div",{children:[r.jsx("strong",{children:"Category:"})," ",b.category]}),r.jsxs("div",{children:[r.jsx("strong",{children:"Description:"})," ",b.description]})]})]}),r.jsxs("div",{children:[r.jsx("h3",{className:"font-medium mb-2 text-gray-900",children:"Report Summary"}),r.jsxs("div",{className:"bg-gray-50 p-3 rounded text-sm text-gray-900",children:[r.jsxs("div",{children:[r.jsx("strong",{children:"Total Reports:"})," ",b.totalReports]}),r.jsxs("div",{children:[r.jsx("strong",{children:"First Reported:"})," ",new Date(b.firstReported).toLocaleString()]}),r.jsxs("div",{children:[r.jsx("strong",{children:"Last Reported:"})," ",new Date(b.lastReported).toLocaleString()]})]})]})]}),r.jsx("div",{className:"mb-4",children:r.jsx("button",{onClick:()=>{const e=I.find((e=>e.name===b.stationName)),t=v[b.stationName];_({stationName:b.stationName,name:b.stationName,url:(null==t?void 0:t.url)||(null==e?void 0:e.url)||b.originalUrl||"",logo:(null==t?void 0:t.logo)||(null==e?void 0:e.logo)||"",originalUrl:(null==e?void 0:e.url)||b.originalUrl||"",category:(null==e?void 0:e.category)||b.category||""})},className:"px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700",children:"🔧 Set URL Override"})}),r.jsx("h3",{className:"font-medium mb-2 text-gray-900",children:"Individual Reports"}),r.jsx("div",{className:"space-y-3 max-h-96 overflow-y-auto",children:b.reports.map((e=>{var t;return r.jsxs("div",{className:"bg-gray-50 p-3 rounded text-sm text-gray-900",children:[r.jsxs("div",{className:"flex justify-between mb-2",children:[r.jsx("span",{children:r.jsxs("strong",{children:["Report #",e.reportId]})}),r.jsx("span",{children:new Date(e.timestamp).toLocaleString()})]}),e.usingOverride&&r.jsxs("div",{className:"bg-yellow-100 p-2 rounded mb-2",children:[r.jsxs("div",{children:[r.jsx("strong",{children:"⚠️ Using Override URL:"})," ",e.overrideUrl]}),r.jsxs("div",{children:[r.jsx("strong",{children:"Original URL:"})," ",b.originalUrl]})]}),r.jsxs("div",{children:[r.jsx("strong",{children:"Error:"})," ",e.errorDetails.primaryError]}),e.errorDetails.mediaErrorCode&&r.jsxs("div",{children:[r.jsx("strong",{children:"Media Error:"})," ",e.errorDetails.mediaErrorCode," - ",e.errorDetails.mediaErrorMessage]}),r.jsxs("div",{children:[r.jsx("strong",{children:"Attempted URLs:"})," ",null==(t=e.errorDetails.attemptedUrls)?void 0:t.join(", ")]}),r.jsxs("div",{children:[r.jsx("strong",{children:"Browser:"})," ",e.browserInfo.platform," - ",e.browserInfo.language]})]},e.reportId)}))})]}):r.jsx("div",{className:"flex items-center justify-center h-full text-gray-500",children:"Select a station to view details"})})]}),"testing"===d&&r.jsxs("div",{className:"p-6 overflow-y-auto",children:[r.jsx("h2",{className:"text-xl font-bold mb-4 text-gray-900",children:"🧪 Radio Stream Testing"}),!L&&!V&&r.jsxs("div",{className:"space-y-3",children:[r.jsx("p",{className:"text-gray-700 text-sm",children:"Test all radio stations to identify non-working streams. This will take 10-20 minutes."}),r.jsx("button",{onClick:async()=>{if(confirm("Start comprehensive radio stream test? This will test all 850+ stations and may take 15-20 minutes.")){j(!0),P({tested:0,total:0,percentage:0});try{const e=await s((e=>{P(e)}));F(e)}catch(e){console.error("Stream test failed:",e),i("❌ Stream test failed: "+e.message,"error",5e3)}finally{j(!1)}}},className:"px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors",children:"🧪 Start Stream Test"})]}),L&&M&&r.jsxs("div",{className:"space-y-3",children:[r.jsxs("div",{className:"flex items-center justify-between",children:[r.jsx("span",{className:"text-sm text-gray-700",children:"Testing streams..."}),r.jsxs("span",{className:"text-sm font-mono text-gray-900",children:[M.percentage,"%"]})]}),r.jsx("div",{className:"w-full bg-gray-300 rounded-full h-2",children:r.jsx("div",{className:"bg-purple-600 h-2 rounded-full transition-all duration-300",style:{width:`${M.percentage}%`}})}),r.jsxs("div",{className:"text-xs text-gray-600 space-y-1",children:[r.jsxs("div",{children:["Current: ",M.current]}),r.jsxs("div",{children:["Progress: ",M.tested," / ",M.total]}),r.jsxs("div",{className:"flex gap-4",children:[r.jsxs("span",{className:"text-green-600",children:["✅ Working: ",M.working]}),r.jsxs("span",{className:"text-red-600",children:["❌ Failed: ",M.failed]}),r.jsxs("span",{className:"text-yellow-600",children:["⏱️ Timeout: ",M.timeout]})]})]}),r.jsx("button",{onClick:()=>{window.radioStreamTester&&window.radioStreamTester.abort(),j(!1),P(null)},className:"px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors",children:"🛑 Abort Test"})]}),V&&r.jsxs("div",{className:"space-y-3",children:[r.jsx("h4",{className:"font-semibold text-green-600",children:"✅ Test Completed!"}),r.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-2 text-sm",children:[r.jsxs("div",{className:"bg-gray-200 p-2 rounded text-center",children:[r.jsx("div",{className:"text-gray-900 font-bold",children:V.tested}),r.jsx("div",{className:"text-gray-600",children:"Total"})]}),r.jsxs("div",{className:"bg-green-100 p-2 rounded text-center",children:[r.jsx("div",{className:"text-green-600 font-bold",children:V.working.length}),r.jsx("div",{className:"text-gray-600",children:"Working"})]}),r.jsxs("div",{className:"bg-red-100 p-2 rounded text-center",children:[r.jsx("div",{className:"text-red-600 font-bold",children:V.failed.length}),r.jsx("div",{className:"text-gray-600",children:"Failed"})]}),r.jsxs("div",{className:"bg-yellow-100 p-2 rounded text-center",children:[r.jsx("div",{className:"text-yellow-600 font-bold",children:V.timeout.length}),r.jsx("div",{className:"text-gray-600",children:"Timeout"})]})]}),r.jsxs("div",{className:"text-xs text-gray-600",children:["Duration: ",Math.round((V.endTime-V.startTime)/1e3)," seconds"]}),r.jsxs("div",{className:"flex gap-2",children:[r.jsx("button",{onClick:()=>{F(null),P(null)},className:"px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors",children:"🔄 Run New Test"}),r.jsx("button",{onClick:()=>{const e=o.loadPreviousResults();e&&(F(e),i("📊 Previous test results loaded","info",2e3))},className:"px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors",children:"📊 Load Previous"})]})]})]}),"overrides"===d&&r.jsxs("div",{className:"h-full flex",children:[r.jsxs("div",{className:"w-1/2 border-r overflow-y-auto",children:[r.jsxs("div",{className:"p-4 border-b",children:[r.jsx("h2",{className:"text-lg font-bold mb-2 text-gray-900",children:"All Stations"}),r.jsx("input",{type:"text",value:N,onChange:e=>A(e.target.value),placeholder:"Search stations...",className:"w-full p-2 border rounded text-black"}),r.jsxs("p",{className:"text-xs text-gray-600 mt-1",children:[I.length," stations available • Search by name or URL"]})]}),r.jsxs("div",{className:"p-4",children:[I.filter((e=>e.name.toLowerCase().includes(N.toLowerCase())||e.url.toLowerCase().includes(N.toLowerCase())||e.category&&e.category.toLowerCase().includes(N.toLowerCase()))).slice(0,50).map((e=>r.jsxs("div",{className:"border rounded-lg p-3 mb-2",children:[r.jsxs("div",{className:"flex items-center justify-between mb-2",children:[r.jsxs("div",{className:"flex items-center gap-2",children:[e.logo&&r.jsx("img",{src:e.logo,alt:e.name,className:"w-8 h-8 rounded object-cover",onError:e=>e.target.style.display="none"}),r.jsxs("div",{children:[r.jsx("h3",{className:"font-medium text-sm text-gray-900",children:e.name}),r.jsx("p",{className:"text-xs text-gray-600",children:e.category})]})]}),r.jsxs("div",{className:"flex gap-1",children:[r.jsx("button",{onClick:()=>B(e),disabled:D===e.name,className:"px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400",title:"Test this station URL",children:D===e.name?"🔄":"▶️"}),r.jsx("button",{onClick:()=>_({name:e.name,url:e.url,logo:e.logo,originalUrl:e.url,category:e.category}),className:"px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700",title:"Create override for this station",children:"🔧"})]})]}),r.jsxs("div",{className:"text-xs text-gray-900 truncate",children:[r.jsx("strong",{children:"URL:"})," ",e.url]}),v[e.name]&&r.jsx("div",{className:"text-xs text-blue-600 mt-1",children:"✓ Has override"})]},e.name))),N&&I.filter((e=>e.name.toLowerCase().includes(N.toLowerCase())||e.url.toLowerCase().includes(N.toLowerCase())||e.category&&e.category.toLowerCase().includes(N.toLowerCase()))).length>50&&r.jsx("div",{className:"text-center text-gray-600 text-sm mt-4",children:"Showing first 50 results. Use search to narrow down."})]})]}),r.jsxs("div",{className:"w-1/2 overflow-y-auto",children:[r.jsxs("div",{className:"p-4 border-b",children:[r.jsx("h2",{className:"text-lg font-bold mb-2 text-gray-900",children:"Active Overrides"}),r.jsx("p",{className:"text-gray-600 text-sm",children:"These URLs override the defaults from allRadioStations.js"})]}),r.jsx("div",{className:"p-4",children:0===Object.keys(v).length?r.jsxs("div",{className:"text-center text-gray-500 py-8",children:[r.jsx("p",{children:"No overrides configured"}),r.jsx("p",{className:"text-sm",children:"Use the station browser to create overrides"})]}):r.jsx("div",{className:"space-y-3",children:Object.entries(v).map((([e,t])=>r.jsxs("div",{className:"border rounded-lg p-4",children:[r.jsxs("div",{className:"flex items-center justify-between mb-2",children:[r.jsxs("div",{className:"flex items-center gap-2",children:[t.logo&&r.jsx("img",{src:t.logo,alt:e,className:"w-8 h-8 rounded object-cover",onError:e=>e.target.style.display="none"}),r.jsx("h3",{className:"font-medium text-gray-900",children:e})]}),r.jsxs("div",{className:"flex gap-2",children:[r.jsx("button",{onClick:()=>B({name:e},t.url),disabled:D===e,className:"px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400",title:"Test override URL",children:D===e?"🔄":"▶️"}),r.jsx("button",{onClick:()=>_({stationName:e,...t}),className:"px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700",children:"Edit"}),r.jsx("button",{onClick:()=>(e=>{Hl.removeStationOverride(e),U()})(e),className:"px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700",children:"Remove"})]})]}),r.jsxs("div",{className:"text-sm text-gray-900",children:[r.jsxs("div",{className:"truncate",children:[r.jsx("strong",{children:"URL:"})," ",t.url]}),t.originalUrl&&t.originalUrl!==t.url&&r.jsxs("div",{className:"truncate",children:[r.jsx("strong",{children:"Original:"})," ",t.originalUrl]}),r.jsxs("div",{children:[r.jsx("strong",{children:"Updated:"})," ",new Date(t.updatedAt).toLocaleString()]})]})]},e)))})})]})]}),"recent"===d&&r.jsxs("div",{className:"p-6 overflow-y-auto",children:[r.jsx("h2",{className:"text-xl font-bold mb-4 text-gray-900",children:"Recent Reports"}),r.jsx("div",{className:"space-y-3",children:g.recentReports.map((e=>r.jsx("div",{className:"border rounded-lg p-3",children:r.jsxs("div",{className:"flex justify-between items-start",children:[r.jsxs("div",{children:[r.jsx("div",{className:"font-medium text-gray-900",children:e.stationName}),r.jsx("div",{className:"text-sm text-gray-600",children:e.primaryError})]}),r.jsx("div",{className:"text-xs text-gray-500",children:new Date(e.timestamp).toLocaleString()})]})},`${e.stationName}-${e.reportId}`)))})]}),"settings"===d&&r.jsxs("div",{className:"p-6 overflow-y-auto",children:[r.jsx("h2",{className:"text-xl font-bold mb-4 text-gray-900",children:"Developer Settings"}),r.jsxs("div",{className:"space-y-4",children:[r.jsxs("div",{children:[r.jsx("label",{className:"block text-sm font-medium mb-1 text-gray-900",children:"Manual Production Mode"}),r.jsxs("p",{className:"text-xs text-gray-600 mb-2",children:["Current mode: ",r.jsx("span",{className:"font-bold",children:t()?"PRODUCTION":"DEVELOPMENT"})]}),r.jsx("button",{onClick:()=>{const e=t(),n=!e;a(n),alert(`Production mode ${n?"ENABLED":"DISABLED"}.\nWas: ${e?"Production":"Development"}\nNow: ${n?"Production":"Development"}`),O(!n)},className:"px-4 py-2 text-white rounded transition-colors "+(t()?"bg-red-600 hover:bg-red-700":"bg-green-600 hover:bg-green-700"),children:t()?"🔴 Switch to Development":"🟢 Switch to Production"}),r.jsx("p",{className:"text-xs text-gray-500 mt-1",children:t()?"Production mode: console logs disabled, optimized performance":"Development mode: full console logs, debug info enabled"})]}),r.jsxs("div",{children:[r.jsx("label",{className:"block text-sm font-medium mb-1 text-gray-900",children:"Console Logging"}),r.jsxs("p",{className:"text-xs text-gray-600 mb-2",children:["Current: ",r.jsx("span",{className:"font-bold",children:R?"ENABLED":"DISABLED"})]}),r.jsxs("button",{onClick:()=>{const e=!R;O(e),e?(c(),console.log("🔊 Console logging enabled")):(console.log("🔇 Console logging will be disabled"),setTimeout((()=>{window.originalConsole=window.console,window.console={log:()=>{},warn:()=>{},error:()=>{}}}),100))},className:"px-4 py-2 text-white rounded transition-colors "+(R?"bg-blue-600 hover:bg-blue-700":"bg-gray-600 hover:bg-gray-500"),children:[R?"🔊 Disable Logging":"🔇 Enable Logging","        "]})]})]})]})]}),x&&r.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:r.jsxs("div",{className:"bg-white rounded-lg p-6 w-full max-w-md",children:[r.jsx("h3",{className:"text-lg font-bold mb-4",children:x.stationName?"Edit Override":"Set Override"}),r.jsxs("form",{onSubmit:e=>{e.preventDefault();const t=new FormData(e.target);((e,t)=>{Hl.setStationOverride(e,t),U(),_(null)})(x.stationName||x.name,{url:t.get("url"),logo:t.get("logo"),originalUrl:x.originalUrl})},className:"space-y-4",children:[r.jsxs("div",{children:[r.jsx("label",{className:"block text-sm font-medium mb-1",children:"Station Name"}),r.jsx("input",{type:"text",value:x.stationName||x.name||"",readOnly:!0,className:"w-full p-2 border rounded bg-gray-50 text-black"})]}),r.jsxs("div",{children:[r.jsx("label",{className:"block text-sm font-medium mb-1",children:"New URL"}),r.jsx("input",{name:"url",type:"url",defaultValue:x.url||"",required:!0,className:"w-full p-2 border rounded text-black",placeholder:"https://stream.example.com/radio.mp3"})]}),r.jsxs("div",{children:[r.jsx("label",{className:"block text-sm font-medium mb-1",children:"Logo URL (optional)"}),r.jsx("input",{name:"logo",type:"url",defaultValue:x.logo||"",className:"w-full p-2 border rounded text-black",placeholder:"https://example.com/logo.png"})]}),r.jsxs("div",{className:"flex gap-2",children:[r.jsx("button",{type:"submit",className:"flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",children:"Save Override"}),r.jsx("button",{type:"button",onClick:()=>_(null),className:"px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700",children:"Cancel"})]})]})]})})]})}):r.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:r.jsxs("div",{className:"bg-white rounded-lg p-6",children:[r.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"}),r.jsx("p",{className:"mt-2 text-center",children:"Loading dashboard..."})]})})};export{Ql as default};
