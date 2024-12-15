import{aC as v,aD as y,aE as w,aF as s,aG as h,aH as k,aI as g,aJ as p,aK as u,aL as b,U as C,i as x,aM as E,aN as L,aO as A,aP as m,d as N,aQ as T}from"./index-k-wgwvEk.js";import"./vendor-Z-7XfRoy.js";const O=v`
  :host {
    z-index: var(--w3m-z-index);
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: var(--wui-cover);
    transition: opacity 0.2s var(--wui-ease-out-power-2);
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
  }

  :host(.embedded) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--w3m-modal-width);
    width: 100%;
    position: relative;
    animation: zoom-in 0.2s var(--wui-ease-out-power-2);
    animation-fill-mode: backwards;
    outline: none;
    transition: border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1);
  }

  :host(.embedded) wui-card {
    max-width: 400px;
  }

  wui-card[shake='true'] {
    animation:
      zoom-in 0.2s var(--wui-ease-out-power-2),
      w3m-shake 0.5s var(--wui-ease-out-power-2);
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--wui-spacing-xxl) 0px;
    }
  }

  @media (max-width: 430px) {
    wui-flex {
      align-items: flex-end;
    }

    wui-card {
      max-width: 100%;
      border-bottom-left-radius: var(--local-border-bottom-mobile-radius);
      border-bottom-right-radius: var(--local-border-bottom-mobile-radius);
      border-bottom: none;
      animation: slide-in 0.2s var(--wui-ease-out-power-2);
    }

    wui-card[shake='true'] {
      animation:
        slide-in 0.2s var(--wui-ease-out-power-2),
        w3m-shake 0.5s var(--wui-ease-out-power-2);
    }
  }

  @keyframes zoom-in {
    0% {
      transform: scale(0.95) translateY(0);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes slide-in {
    0% {
      transform: scale(1) translateY(50px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes w3m-view-height {
    from {
      height: var(--prev-height);
    }
    to {
      height: var(--new-height);
    }
  }
`;var d=function(c,e,t,o){var a=arguments.length,i=a<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(c,e,t,o);else for(var l=c.length-1;l>=0;l--)(n=c[l])&&(i=(a<3?n(i):a>3?n(e,t,i):n(e,t))||i);return a>3&&i&&Object.defineProperty(e,t,i),i};const f="scroll-lock";let r=class extends y{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.enableEmbedded=w.state.enableEmbedded,this.open=s.state.open,this.caipAddress=h.state.activeCaipAddress,this.caipNetwork=h.state.activeCaipNetwork,this.shake=s.state.shake,this.initializeTheming(),k.prefetch(),this.unsubscribe.push(s.subscribeKey("open",e=>e?this.onOpen():this.onClose()),s.subscribeKey("shake",e=>this.shake=e),h.subscribeKey("activeCaipNetwork",e=>this.onNewNetwork(e)),h.subscribeKey("activeCaipAddress",e=>this.onNewAddress(e))),g.sendEvent({type:"track",event:"MODAL_LOADED"})}firstUpdated(){w.setEnableEmbedded(this.enableEmbedded),this.enableEmbedded&&this.caipAddress&&s.close()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.style.cssText=`
      --local-border-bottom-mobile-radius: ${this.enableEmbedded?"clamp(0px, var(--wui-border-radius-l), 44px)":"0px"};
    `,this.enableEmbedded?p`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?p`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return p` <wui-card
      shake="${this.shake}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){e.target===e.currentTarget&&await this.handleClose()}async handleClose(){u.state.view==="UnsupportedChain"||await b.isSIWXCloseDisabled()?s.shake():s.close()}initializeTheming(){const{themeVariables:e,themeMode:t}=T.state,o=C.getColorTheme(t);x(e,o)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),E.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement("style");e.dataset.w3m=f,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${f}"]`);e&&e.remove()}onAddKeyboardListener(){var t;this.abortController=new AbortController;const e=(t=this.shadowRoot)==null?void 0:t.querySelector("wui-card");e==null||e.focus(),window.addEventListener("keydown",o=>{if(o.key==="Escape")this.handleClose();else if(o.key==="Tab"){const{tagName:a}=o.target;a&&!a.includes("W3M-")&&!a.includes("WUI-")&&(e==null||e.focus())}},this.abortController)}onRemoveKeyboardListener(){var e;(e=this.abortController)==null||e.abort(),this.abortController=void 0}async onNewAddress(e){const t=L.getPlainAddress(e);this.caipAddress=e,await b.initializeIfEnabled(),(!t||this.enableEmbedded)&&s.close()}onNewNetwork(e){var a,i,n,l;if(!this.caipAddress){this.caipNetwork=e,u.goBack();return}const t=(i=(a=this.caipNetwork)==null?void 0:a.caipNetworkId)==null?void 0:i.toString(),o=(n=e==null?void 0:e.caipNetworkId)==null?void 0:n.toString();t&&o&&t!==o&&((l=this.caipNetwork)==null?void 0:l.name)!=="Unknown Network"&&u.goBack(),this.caipNetwork=e}};r.styles=O;d([A({type:Boolean})],r.prototype,"enableEmbedded",void 0);d([m()],r.prototype,"open",void 0);d([m()],r.prototype,"caipAddress",void 0);d([m()],r.prototype,"caipNetwork",void 0);d([m()],r.prototype,"shake",void 0);r=d([N("w3m-modal")],r);export{r as W3mModal};
