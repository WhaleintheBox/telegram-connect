import{p as x,s as M,d as W,f as R,S as I,Q as k,J as U,h as $,j as E,O as N,A as g,x as b,k as v,l as h,C as u,W as w,m as y,n as D,M as P,R as j,o as T,N as f,q as K}from"./index-942af2e1.js";import{t as se,V as ne,Y as ie}from"./index-942af2e1.js";const c=x({status:"uninitialized"}),p={state:c,subscribeKey(t,e){return M(c,t,e)},subscribe(t){return W(c,()=>t(c))},_getClient(){if(!c._client)throw new Error("SIWEController client not set");return c._client},async getNonce(t){const n=await this._getClient().getNonce(t);return this.setNonce(n),n},async getSession(){try{const e=await this._getClient().getSession();return e&&(this.setSession(e),this.setStatus("success")),e||void 0}catch{return}},createMessage(t){const n=this._getClient().createMessage(t);return this.setMessage(n),n},async verifyMessage(t){return await this._getClient().verifyMessage(t)},async signIn(){return await this._getClient().signIn()},async signOut(){var e;const t=this._getClient();await t.signOut(),this.setStatus("ready"),this.setSession(void 0),(e=t.onSignOut)==null||e.call(t)},onSignIn(t){var n;const e=this._getClient();(n=e.onSignIn)==null||n.call(e,t)},onSignOut(){var e;const t=this._getClient();(e=t.onSignOut)==null||e.call(t)},async setSIWEClient(t){c._client=R(t),c.session=await this.getSession(),c.status=c.session?"success":"ready"},setNonce(t){c.nonce=t},setStatus(t){c.status=t},setMessage(t){c.message=t},setSession(t){c.session=t,c.status=t?"success":"ready"}},A={FIVE_MINUTES_IN_MS:3e5};class V{constructor(e){const{enabled:n=!0,nonceRefetchIntervalMs:s=A.FIVE_MINUTES_IN_MS,sessionRefetchIntervalMs:i=A.FIVE_MINUTES_IN_MS,signOutOnAccountChange:a=!0,signOutOnDisconnect:r=!0,signOutOnNetworkChange:o=!0,...l}=e;this.options={enabled:n,nonceRefetchIntervalMs:s,sessionRefetchIntervalMs:i,signOutOnDisconnect:r,signOutOnAccountChange:a,signOutOnNetworkChange:o},this.methods=l}async getNonce(e){const n=await this.methods.getNonce(e);if(!n)throw new Error("siweControllerClient:getNonce - nonce is undefined");return n}async getMessageParams(){var e,n;return await((n=(e=this.methods).getMessageParams)==null?void 0:n.call(e))||{}}createMessage(e){const n=this.methods.createMessage(e);if(!n)throw new Error("siweControllerClient:createMessage - message is undefined");return n}async verifyMessage(e){return await this.methods.verifyMessage(e)}async getSession(){const e=await this.methods.getSession();if(!e)throw new Error("siweControllerClient:getSession - session is undefined");return e}async signIn(){await I.requestSignMessage();const e=await this.methods.getSession();if(!e)throw new Error("Error verifying SIWE signature");return e}async signOut(){const e=I.getSIWX();return e?(await e.setSessions([]),!0):!1}}const F=/0x[a-fA-F0-9]{40}/u,X=/Chain ID: (?<temp1>\d+)/u;function z(t){var e;return((e=t.match(F))==null?void 0:e[0])||""}function Y(t){var e;return`eip155:${((e=t.match(X))==null?void 0:e[1])||1}`}async function G({address:t,message:e,signature:n,chainId:s,projectId:i}){let a=k(t,e,n);return a||(a=await U(t,e,n,s,i)),a}const L=$`
  :host {
    display: flex;
    justify-content: center;
    gap: var(--wui-spacing-2xl);
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`;var H=globalThis&&globalThis.__decorate||function(t,e,n,s){var i=arguments.length,a=i<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,n):s,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")a=Reflect.decorate(t,e,n,s);else for(var o=t.length-1;o>=0;o--)(r=t[o])&&(a=(i<3?r(a):i>3?r(e,n,a):r(e,n))||a);return i>3&&a&&Object.defineProperty(e,n,a),a};let m=class extends E{constructor(){var e,n;super(...arguments),this.dappImageUrl=(e=N.state.metadata)==null?void 0:e.icons,this.walletImageUrl=(n=g.state.connectedWalletInfo)==null?void 0:n.icon}firstUpdated(){var n;const e=(n=this.shadowRoot)==null?void 0:n.querySelectorAll("wui-visual-thumbnail");e!=null&&e[0]&&this.createAnimation(e[0],"translate(18px)"),e!=null&&e[1]&&this.createAnimation(e[1],"translate(-18px)")}render(){var e;return b`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${(e=this.dappImageUrl)==null?void 0:e[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,n){e.animate([{transform:"translateX(0px)"},{transform:n}],{duration:1600,easing:"cubic-bezier(0.56, 0, 0.48, 1)",direction:"alternate",iterations:1/0})}};m.styles=L;m=H([v("w3m-connecting-siwe")],m);var C=globalThis&&globalThis.__decorate||function(t,e,n,s){var i=arguments.length,a=i<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,n):s,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")a=Reflect.decorate(t,e,n,s);else for(var o=t.length-1;o>=0;o--)(r=t[o])&&(a=(i<3?r(a):i>3?r(e,n,a):r(e,n))||a);return i>3&&a&&Object.defineProperty(e,n,a),a};let S=class extends E{constructor(){var e;super(...arguments),this.dappName=(e=N.state.metadata)==null?void 0:e.name,this.isSigning=!1,this.isCancelling=!1}render(){return b`
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
    `}async onSign(){var e,n,s;this.isSigning=!0,h.sendEvent({event:"CLICK_SIGN_SIWX_MESSAGE",type:"track",properties:{network:((e=u.state.activeCaipNetwork)==null?void 0:e.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}});try{p.setStatus("loading");const i=await p.signIn();return p.setStatus("success"),h.sendEvent({event:"SIWX_AUTH_SUCCESS",type:"track",properties:{network:((n=u.state.activeCaipNetwork)==null?void 0:n.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}}),i}catch{const r=g.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT;return r?y.showError("This application might not support Smart Accounts"):y.showError("Signature declined"),p.setStatus("error"),h.sendEvent({event:"SIWX_AUTH_ERROR",type:"track",properties:{network:((s=u.state.activeCaipNetwork)==null?void 0:s.caipNetworkId)||"",isSmartAccount:r}})}finally{this.isSigning=!1}}async onCancel(){var n;this.isCancelling=!0,u.state.activeCaipAddress?(await D.disconnect(),P.close()):j.push("Connect"),this.isCancelling=!1,h.sendEvent({event:"CLICK_CANCEL_SIWX",type:"track",properties:{network:((n=u.state.activeCaipNetwork)==null?void 0:n.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}})}};C([T()],S.prototype,"isSigning",void 0);C([T()],S.prototype,"isCancelling",void 0);S=C([v("w3m-connecting-siwe-view")],S);const _=[];function B(t){async function e(){try{const s=await t.methods.getSession();if(!s)return;if(!(s!=null&&s.address))throw new Error("SIWE session is missing address");if(!(s!=null&&s.chainId))throw new Error("SIWE session is missing chainId");return s}catch(s){console.warn("AppKit:SIWE:getSession - error:",s);return}}async function n(){var s,i;await t.methods.signOut(),(i=(s=t.methods).onSignOut)==null||i.call(s)}return _.forEach(s=>s()),_.push(u.subscribeKey("activeCaipNetwork",async s=>{if(!t.options.signOutOnNetworkChange)return;const i=await e();i&&i.chainId!==f.caipNetworkIdToNumber(s==null?void 0:s.caipNetworkId)&&await n()}),u.subscribeKey("activeCaipAddress",async s=>{var i,a,r;if(t.options.signOutOnDisconnect&&!s){await e()&&await n();return}if(t.options.signOutOnAccountChange){const o=await e(),l=(i=o==null?void 0:o.address)==null?void 0:i.toLowerCase(),d=(r=(a=K)==null?void 0:a.getPlainAddress(s))==null?void 0:r.toLowerCase();o&&l!==d&&await n()}})),{async createMessage(s){var l,d;const i=await((d=(l=t.methods).getMessageParams)==null?void 0:d.call(l));if(!i)throw new Error("Failed to get message params!");const a=await t.getNonce(s.accountAddress),r=i.iat||new Date().toISOString(),o="1";return{nonce:a,version:o,requestId:i.requestId,accountAddress:s.accountAddress,chainId:s.chainId,domain:i.domain,uri:i.uri,notBefore:i.nbf,resources:i.resources,statement:i.statement,expirationTime:i.exp,issuedAt:r,toString:()=>t.createMessage({...i,chainId:f.caipNetworkIdToNumber(s.chainId)||1,address:`did:pkh:${s.chainId}:${s.accountAddress}`,nonce:a,version:o,iat:r})}},async addSession(s){var a,r;if(!f.parseEvmChainId(s.data.chainId))return Promise.resolve();if(await t.methods.verifyMessage(s))return(r=(a=t.methods).onSignIn)==null||r.call(a,{address:s.data.accountAddress,chainId:f.parseEvmChainId(s.data.chainId)}),Promise.resolve();throw new Error("Failed to verify message")},async revokeSession(s,i){try{await n()}catch(a){console.warn("AppKit:SIWE:revokeSession - signOut error",a)}},async setSessions(s){if(s.length===0)try{await n()}catch(i){console.warn("AppKit:SIWE:setSessions - signOut error",i)}else{const i=s.find(a=>{var r;return a.data.chainId===((r=u.getActiveCaipNetwork())==null?void 0:r.caipNetworkId)})||s[0];await this.addSession(i)}},async getSessions(s,i){var a;try{if(!s.startsWith("eip155:"))return[{data:{accountAddress:i,chainId:s},message:"",signature:""}];const r=await e(),o=`eip155:${r==null?void 0:r.chainId}`,l=(a=r==null?void 0:r.address)==null?void 0:a.toLowerCase(),d=i==null?void 0:i.toLowerCase();return!r||l!==d||o!==s?[]:[{data:{accountAddress:r.address,chainId:o},message:"",signature:""}]}catch(r){return console.warn("AppKit:SIWE:getSessions - error:",r),[]}}}}function Z(t){return new V(t)}export{p as SIWEController,m as W3mConnectingSiwe,S as W3mConnectingSiweView,Z as createSIWEConfig,se as formatMessage,z as getAddressFromMessage,Y as getChainIdFromMessage,ne as getDidAddress,ie as getDidChainId,B as mapToSIWX,G as verifySignature};
