import{p as T,s as M,f as W,g as R,S as I,Q as k,J as U,i as $,h as E,O as N,A as g,x as v,j as b,k as f,C as l,l as h,m as y,n as D,M as P,R as j,o as O,q as w,t as K}from"./index-DAMXWOeA.js";import{u as se,V as ie,Y as re}from"./index-DAMXWOeA.js";import"./vendor-B58Z8ZRa.js";const c=T({status:"uninitialized"}),p={state:c,subscribeKey(t,e){return M(c,t,e)},subscribe(t){return W(c,()=>t(c))},_getClient(){if(!c._client)throw new Error("SIWEController client not set");return c._client},async getNonce(t){const s=await this._getClient().getNonce(t);return this.setNonce(s),s},async getSession(){try{const e=await this._getClient().getSession();return e&&(this.setSession(e),this.setStatus("success")),e||void 0}catch{return}},createMessage(t){const s=this._getClient().createMessage(t);return this.setMessage(s),s},async verifyMessage(t){return await this._getClient().verifyMessage(t)},async signIn(){return await this._getClient().signIn()},async signOut(){var e;const t=this._getClient();await t.signOut(),this.setStatus("ready"),this.setSession(void 0),(e=t.onSignOut)==null||e.call(t)},onSignIn(t){var s;const e=this._getClient();(s=e.onSignIn)==null||s.call(e,t)},onSignOut(){var e;const t=this._getClient();(e=t.onSignOut)==null||e.call(t)},async setSIWEClient(t){c._client=R(t),c.session=await this.getSession(),c.status=c.session?"success":"ready"},setNonce(t){c.nonce=t},setStatus(t){c.status=t},setMessage(t){c.message=t},setSession(t){c.session=t,c.status=t?"success":"ready"}},A={FIVE_MINUTES_IN_MS:3e5};class V{constructor(e){const{enabled:s=!0,nonceRefetchIntervalMs:n=A.FIVE_MINUTES_IN_MS,sessionRefetchIntervalMs:i=A.FIVE_MINUTES_IN_MS,signOutOnAccountChange:r=!0,signOutOnDisconnect:a=!0,signOutOnNetworkChange:o=!0,...u}=e;this.options={enabled:s,nonceRefetchIntervalMs:n,sessionRefetchIntervalMs:i,signOutOnDisconnect:a,signOutOnAccountChange:r,signOutOnNetworkChange:o},this.methods=u}async getNonce(e){const s=await this.methods.getNonce(e);if(!s)throw new Error("siweControllerClient:getNonce - nonce is undefined");return s}async getMessageParams(){var e,s;return await((s=(e=this.methods).getMessageParams)==null?void 0:s.call(e))||{}}createMessage(e){const s=this.methods.createMessage(e);if(!s)throw new Error("siweControllerClient:createMessage - message is undefined");return s}async verifyMessage(e){return await this.methods.verifyMessage(e)}async getSession(){const e=await this.methods.getSession();if(!e)throw new Error("siweControllerClient:getSession - session is undefined");return e}async signIn(){await I.requestSignMessage();const e=await this.methods.getSession();if(!e)throw new Error("Error verifying SIWE signature");return e}async signOut(){const e=I.getSIWX();return e?(await e.setSessions([]),!0):!1}}const F=/0x[a-fA-F0-9]{40}/u,X=/Chain ID: (?<temp1>\d+)/u;function Y(t){var e;return((e=t.match(F))==null?void 0:e[0])||""}function G(t){var e;return`eip155:${((e=t.match(X))==null?void 0:e[1])||1}`}async function J({address:t,message:e,signature:s,chainId:n,projectId:i}){let r=k(t,e,s);return r||(r=await U(t,e,s,n,i)),r}const L=$`
  :host {
    display: flex;
    justify-content: center;
    gap: var(--wui-spacing-2xl);
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`;var H=function(t,e,s,n){var i=arguments.length,r=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,s):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,s,n);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(r=(i<3?a(r):i>3?a(e,s,r):a(e,s))||r);return i>3&&r&&Object.defineProperty(e,s,r),r};let m=class extends E{constructor(){var e,s;super(...arguments),this.dappImageUrl=(e=N.state.metadata)==null?void 0:e.icons,this.walletImageUrl=(s=g.state.connectedWalletInfo)==null?void 0:s.icon}firstUpdated(){var s;const e=(s=this.shadowRoot)==null?void 0:s.querySelectorAll("wui-visual-thumbnail");e!=null&&e[0]&&this.createAnimation(e[0],"translate(18px)"),e!=null&&e[1]&&this.createAnimation(e[1],"translate(-18px)")}render(){var e;return v`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${(e=this.dappImageUrl)==null?void 0:e[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,s){e.animate([{transform:"translateX(0px)"},{transform:s}],{duration:1600,easing:"cubic-bezier(0.56, 0, 0.48, 1)",direction:"alternate",iterations:1/0})}};m.styles=L;m=H([b("w3m-connecting-siwe")],m);var C=function(t,e,s,n){var i=arguments.length,r=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,s):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,s,n);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(r=(i<3?a(r):i>3?a(e,s,r):a(e,s))||r);return i>3&&r&&Object.defineProperty(e,s,r),r};let S=class extends E{constructor(){var e;super(...arguments),this.dappName=(e=N.state.metadata)==null?void 0:e.name,this.isSigning=!1,this.isCancelling=!1}render(){return v`
      <wui-flex justifyContent="center" .padding=${["2xl","0","xxl","0"]}>
        <w3m-connecting-siwe></w3m-connecting-siwe>
      </wui-flex>
      <wui-flex
        .padding=${["0","4xl","l","4xl"]}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="paragraph-500" align="center" color="fg-100"
          >${this.dappName??"Dapp"} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex
        .padding=${["0","3xl","l","3xl"]}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="small-400" align="center" color="fg-200"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${["l","xl","xl","xl"]} gap="s" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          Cancel
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="main"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning?"Signing...":"Sign"}
        </wui-button>
      </wui-flex>
    `}async onSign(){var e,s,n;this.isSigning=!0,f.sendEvent({event:"CLICK_SIGN_SIWX_MESSAGE",type:"track",properties:{network:((e=l.state.activeCaipNetwork)==null?void 0:e.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===h.ACCOUNT_TYPES.SMART_ACCOUNT}});try{p.setStatus("loading");const i=await p.signIn();return p.setStatus("success"),f.sendEvent({event:"SIWX_AUTH_SUCCESS",type:"track",properties:{network:((s=l.state.activeCaipNetwork)==null?void 0:s.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===h.ACCOUNT_TYPES.SMART_ACCOUNT}}),i}catch{const a=g.state.preferredAccountType===h.ACCOUNT_TYPES.SMART_ACCOUNT;return a?y.showError("This application might not support Smart Accounts"):y.showError("Signature declined"),p.setStatus("error"),f.sendEvent({event:"SIWX_AUTH_ERROR",type:"track",properties:{network:((n=l.state.activeCaipNetwork)==null?void 0:n.caipNetworkId)||"",isSmartAccount:a}})}finally{this.isSigning=!1}}async onCancel(){var s;this.isCancelling=!0,l.state.activeCaipAddress?(await D.disconnect(),P.close()):j.push("Connect"),this.isCancelling=!1,f.sendEvent({event:"CLICK_CANCEL_SIWX",type:"track",properties:{network:((s=l.state.activeCaipNetwork)==null?void 0:s.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===h.ACCOUNT_TYPES.SMART_ACCOUNT}})}};C([O()],S.prototype,"isSigning",void 0);C([O()],S.prototype,"isCancelling",void 0);S=C([b("w3m-connecting-siwe-view")],S);const _=[];function Z(t){async function e(){try{const n=await t.methods.getSession();if(!n)return;if(!(n!=null&&n.address))throw new Error("SIWE session is missing address");if(!(n!=null&&n.chainId))throw new Error("SIWE session is missing chainId");return n}catch(n){console.warn("AppKit:SIWE:getSession - error:",n);return}}async function s(){var n,i;await t.methods.signOut(),(i=(n=t.methods).onSignOut)==null||i.call(n)}return _.forEach(n=>n()),_.push(l.subscribeKey("activeCaipNetwork",async n=>{if(!t.options.signOutOnNetworkChange)return;const i=await e();i&&i.chainId!==w.caipNetworkIdToNumber(n==null?void 0:n.caipNetworkId)&&await s()}),l.subscribeKey("activeCaipAddress",async n=>{var i,r,a;if(t.options.signOutOnDisconnect&&!n){await e()&&await s();return}if(t.options.signOutOnAccountChange){const o=await e(),u=(i=o==null?void 0:o.address)==null?void 0:i.toLowerCase(),d=(a=(r=K)==null?void 0:r.getPlainAddress(n))==null?void 0:a.toLowerCase();o&&u!==d&&await s()}})),{async createMessage(n){var u,d;const i=await((d=(u=t.methods).getMessageParams)==null?void 0:d.call(u));if(!i)throw new Error("Failed to get message params!");const r=await t.getNonce(n.accountAddress),a=i.iat||new Date().toISOString(),o="1";return{nonce:r,version:o,requestId:i.requestId,accountAddress:n.accountAddress,chainId:n.chainId,domain:i.domain,uri:i.uri,notBefore:i.nbf,resources:i.resources,statement:i.statement,expirationTime:i.exp,issuedAt:a,toString:()=>t.createMessage({...i,chainId:w.caipNetworkIdToNumber(n.chainId)||1,address:`did:pkh:${n.chainId}:${n.accountAddress}`,nonce:r,version:o,iat:a})}},async addSession(n){var r,a;if(!w.parseEvmChainId(n.data.chainId))return Promise.resolve();if(await t.methods.verifyMessage(n))return(a=(r=t.methods).onSignIn)==null||a.call(r,{address:n.data.accountAddress,chainId:w.parseEvmChainId(n.data.chainId)}),Promise.resolve();throw new Error("Failed to verify message")},async revokeSession(n,i){try{await s()}catch(r){console.warn("AppKit:SIWE:revokeSession - signOut error",r)}},async setSessions(n){if(n.length===0)try{await s()}catch(i){console.warn("AppKit:SIWE:setSessions - signOut error",i)}else{const i=n.find(r=>{var a;return r.data.chainId===((a=l.getActiveCaipNetwork())==null?void 0:a.caipNetworkId)})||n[0];await this.addSession(i)}},async getSessions(n,i){var r;try{if(!n.startsWith("eip155:"))return[{data:{accountAddress:i,chainId:n},message:"",signature:""}];const a=await e(),o=`eip155:${a==null?void 0:a.chainId}`,u=(r=a==null?void 0:a.address)==null?void 0:r.toLowerCase(),d=i==null?void 0:i.toLowerCase();return!a||u!==d||o!==n?[]:[{data:{accountAddress:a.address,chainId:o},message:"",signature:""}]}catch(a){return console.warn("AppKit:SIWE:getSessions - error:",a),[]}}}}function ee(t){return new V(t)}export{p as SIWEController,m as W3mConnectingSiwe,S as W3mConnectingSiweView,ee as createSIWEConfig,se as formatMessage,Y as getAddressFromMessage,G as getChainIdFromMessage,ie as getDidAddress,re as getDidChainId,Z as mapToSIWX,J as verifySignature};
