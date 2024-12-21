import{r as q,g as J}from"./vendor-CPWSMn38.js";import{b3 as j}from"./index-yIKSC48P.js";function X(y,a){for(var d=0;d<a.length;d++){const l=a[d];if(typeof l!="string"&&!Array.isArray(l)){for(const h in l)if(h!=="default"&&!(h in y)){const m=Object.getOwnPropertyDescriptor(l,h);m&&Object.defineProperty(y,h,m.get?m:{enumerable:!0,get:()=>l[h]})}}}return Object.freeze(Object.defineProperty(y,Symbol.toStringTag,{value:"Module"}))}var k={},M={},R={},W;function U(){if(W)return R;W=1,Object.defineProperty(R,"__esModule",{value:!0}),R.insertScript=b,R.removeScript=E,R.removeResources=w,R.debounce=D,R.isReactElement=S,R.shallowComparison=I;var y=a(q());function a(f){return f&&f.__esModule?f:{default:f}}function d(f){"@babel/helpers - typeof";return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?d=function(c){return typeof c}:d=function(c){return c&&typeof Symbol=="function"&&c.constructor===Symbol&&c!==Symbol.prototype?"symbol":typeof c},d(f)}function l(f){if(typeof Symbol>"u"||f[Symbol.iterator]==null){if(Array.isArray(f)||(f=h(f))){var s=0,c=function(){};return{s:c,n:function(){return s>=f.length?{done:!0}:{done:!1,value:f[s++]}},e:function(t){throw t},f:c}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var p,C=!0,v=!1,_;return{s:function(){p=f[Symbol.iterator]()},n:function(){var t=p.next();return C=t.done,t},e:function(t){v=!0,_=t},f:function(){try{!C&&p.return!=null&&p.return()}finally{if(v)throw _}}}}function h(f,s){if(f){if(typeof f=="string")return m(f,s);var c=Object.prototype.toString.call(f).slice(8,-1);if(c==="Object"&&f.constructor&&(c=f.constructor.name),c==="Map"||c==="Set")return Array.from(f);if(c==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c))return m(f,s)}}function m(f,s){(s==null||s>f.length)&&(s=f.length);for(var c=0,p=new Array(s);c<s;c++)p[c]=f[c];return p}function b(f,s,c){var p=window.document.createElement("script");return p.async=!0,p.src=f,p.id=s,c.appendChild(p),p}function E(f,s){var c=window.document.getElementById(f);c&&s.removeChild(c)}function w(){var f=window.document.querySelectorAll('link[href*="disquscdn.com/next/embed"], link[href*="disquscdn.com/next/recommendations"], link[href*="disqus.com/next/config.js"], script[src*="disquscdn.com/next/embed"], script[src*="disqus.com/count-data.js"], iframe[title="Disqus"]');f.forEach(function(s){return s.remove()})}function D(f,s,c){var p;return function(){var C=this,v=arguments,_=function(){p=null,c||f.apply(C,v)},i=c&&!p;window.clearTimeout(p),p=setTimeout(_,s),i&&f.apply(C,v)}}function S(f){return y.default.isValidElement(f)?!0:Array.isArray(f)?f.some(function(s){return y.default.isValidElement(s)}):!1}function I(f,s){var c=new Set(Object.keys(f),Object.keys(s)),p=l(c),C;try{for(p.s();!(C=p.n()).done;){var v=C.value;if(d(f[v])==="object"){if(I(f[v],s[v]))return!0}else if(f[v]!==s[v]&&!S(f[v]))return!0}}catch(_){p.e(_)}finally{p.f()}return!1}return R}var g={},x;function A(){if(x)return g;x=1,Object.defineProperty(g,"__esModule",{value:!0}),g.CALLBACKS=g.RECOMMENDATIONS_SCRIPT_ID=g.RECOMMENDATIONS_ID=g.COMMENT_EMBED_HEIGHT=g.COMMENT_EMBED_WIDTH=g.COMMENT_COUNT_SCRIPT_ID=g.COMMENT_COUNT_CLASS=g.EMBED_SCRIPT_ID=g.THREAD_ID=void 0;var y="disqus_thread";g.THREAD_ID=y;var a="dsq-embed-scr";g.EMBED_SCRIPT_ID=a;var d="disqus-comment-count";g.COMMENT_COUNT_CLASS=d;var l="dsq-count-scr";g.COMMENT_COUNT_SCRIPT_ID=l;var h=420;g.COMMENT_EMBED_WIDTH=h;var m=320;g.COMMENT_EMBED_HEIGHT=m;var b="disqus_recommendations";g.RECOMMENDATIONS_ID=b;var E="dsq-recs-scr";g.RECOMMENDATIONS_SCRIPT_ID=E;var w=["preData","preInit","onInit","onReady","afterRender","preReset","onIdentify","beforeComment","onNewComment","onPaginate"];return g.CALLBACKS=w,g}var H;function Y(){if(H)return M;H=1,Object.defineProperty(M,"__esModule",{value:!0}),M.CommentCount=void 0;var y=h(q()),a=h(j()),d=U(),l=A();function h(e){return e&&e.__esModule?e:{default:e}}function m(e){"@babel/helpers - typeof";return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?m=function(r){return typeof r}:m=function(r){return r&&typeof Symbol=="function"&&r.constructor===Symbol&&r!==Symbol.prototype?"symbol":typeof r},m(e)}function b(){return b=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var r=arguments[n];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o])}return e},b.apply(this,arguments)}function E(e,n){if(e==null)return{};var r=w(e,n),o,u;if(Object.getOwnPropertySymbols){var O=Object.getOwnPropertySymbols(e);for(u=0;u<O.length;u++)o=O[u],!(n.indexOf(o)>=0)&&Object.prototype.propertyIsEnumerable.call(e,o)&&(r[o]=e[o])}return r}function w(e,n){if(e==null)return{};var r={},o=Object.keys(e),u,O;for(O=0;O<o.length;O++)u=o[O],!(n.indexOf(u)>=0)&&(r[u]=e[u]);return r}function D(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function S(e,n){for(var r=0;r<n.length;r++){var o=n[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function I(e,n,r){return n&&S(e.prototype,n),e}function f(e,n){if(typeof n!="function"&&n!==null)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),n&&s(e,n)}function s(e,n){return s=Object.setPrototypeOf||function(o,u){return o.__proto__=u,o},s(e,n)}function c(e){var n=v();return function(){var r=_(e),o;if(n){var u=_(this).constructor;o=Reflect.construct(r,arguments,u)}else o=r.apply(this,arguments);return p(this,o)}}function p(e,n){return n&&(m(n)==="object"||typeof n=="function")?n:C(e)}function C(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function v(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch{return!1}}function _(e){return _=Object.setPrototypeOf?Object.getPrototypeOf:function(r){return r.__proto__||Object.getPrototypeOf(r)},_(e)}var i=(0,d.debounce)(function(){window.DISQUSWIDGETS&&window.DISQUSWIDGETS.getCount({reset:!0})},300,!1),t=function(e){f(r,e);var n=c(r);function r(){return D(this,r),n.apply(this,arguments)}return I(r,[{key:"componentDidMount",value:function(){this.loadInstance()}},{key:"shouldComponentUpdate",value:function(u){return this.props===u?!1:(0,d.shallowComparison)(this.props,u)}},{key:"componentDidUpdate",value:function(u){this.props.shortname!==u.shortname&&this.cleanInstance(),this.loadInstance()}},{key:"componentWillUnmount",value:function(){this.cleanInstance()}},{key:"loadInstance",value:function(){var u=window.document;u.getElementById(l.COMMENT_COUNT_SCRIPT_ID)?i():(0,d.insertScript)("https://".concat(this.props.shortname,".disqus.com/count.js"),l.COMMENT_COUNT_SCRIPT_ID,u.body)}},{key:"cleanInstance",value:function(){var u=window.document;(0,d.removeScript)(l.COMMENT_COUNT_SCRIPT_ID,u.body),window.DISQUSWIDGETS=void 0,(0,d.removeResources)()}},{key:"render",value:function(){var u=this.props;u.shortname;var O=u.config,z=u.children,B=u.className,V=E(u,["shortname","config","children","className"]),F=B?" ".concat(B):"";return y.default.createElement("span",b({},V,{className:"".concat(l.COMMENT_COUNT_CLASS).concat(F),"data-disqus-identifier":O.identifier,"data-disqus-url":O.url}),z)}}]),r}(y.default.Component);return M.CommentCount=t,t.propTypes={shortname:a.default.string.isRequired,config:a.default.shape({identifier:a.default.string,url:a.default.string,title:a.default.string}).isRequired,className:a.default.string,children:a.default.node},M}var T={},L;function Z(){if(L)return T;L=1,Object.defineProperty(T,"__esModule",{value:!0}),T.CommentEmbed=void 0;var y=l(q()),a=l(j()),d=A();function l(i){return i&&i.__esModule?i:{default:i}}function h(i){"@babel/helpers - typeof";return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?h=function(e){return typeof e}:h=function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},h(i)}function m(){return m=Object.assign||function(i){for(var t=1;t<arguments.length;t++){var e=arguments[t];for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(i[n]=e[n])}return i},m.apply(this,arguments)}function b(i,t){if(i==null)return{};var e=E(i,t),n,r;if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(i);for(r=0;r<o.length;r++)n=o[r],!(t.indexOf(n)>=0)&&Object.prototype.propertyIsEnumerable.call(i,n)&&(e[n]=i[n])}return e}function E(i,t){if(i==null)return{};var e={},n=Object.keys(i),r,o;for(o=0;o<n.length;o++)r=n[o],!(t.indexOf(r)>=0)&&(e[r]=i[r]);return e}function w(i,t){if(!(i instanceof t))throw new TypeError("Cannot call a class as a function")}function D(i,t){for(var e=0;e<t.length;e++){var n=t[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(i,n.key,n)}}function S(i,t,e){return t&&D(i.prototype,t),i}function I(i,t){if(typeof t!="function"&&t!==null)throw new TypeError("Super expression must either be null or a function");i.prototype=Object.create(t&&t.prototype,{constructor:{value:i,writable:!0,configurable:!0}}),t&&f(i,t)}function f(i,t){return f=Object.setPrototypeOf||function(n,r){return n.__proto__=r,n},f(i,t)}function s(i){var t=C();return function(){var e=v(i),n;if(t){var r=v(this).constructor;n=Reflect.construct(e,arguments,r)}else n=e.apply(this,arguments);return c(this,n)}}function c(i,t){return t&&(h(t)==="object"||typeof t=="function")?t:p(i)}function p(i){if(i===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return i}function C(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch{return!1}}function v(i){return v=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},v(i)}var _=function(i){I(e,i);var t=s(e);function e(){return w(this,e),t.apply(this,arguments)}return S(e,[{key:"getSrc",value:function(){var r=36,o=Number(this.props.commentId).toString(r),u=this.props.showParentComment?"1":"0",O=this.props.showMedia?"1":"0";return"https://embed.disqus.com/p/".concat(o,"?p=").concat(u,"&m=").concat(O)}},{key:"render",value:function(){var r=this.props,o=r.width,u=r.height;r.commentId,r.showMedia,r.showParentComment;var O=b(r,["width","height","commentId","showMedia","showParentComment"]);return y.default.createElement("iframe",m({},O,{src:this.getSrc(),width:o,height:u,seamless:"seamless",scrolling:"no",frameBorder:"0"}))}}]),e}(y.default.Component);return T.CommentEmbed=_,_.defaultProps={showMedia:!0,showParentComment:!0,width:d.COMMENT_EMBED_WIDTH,height:d.COMMENT_EMBED_HEIGHT},_.propTypes={commentId:a.default.string.isRequired,showMedia:a.default.bool,showParentComment:a.default.bool,width:a.default.number,height:a.default.number,className:a.default.string},T}var P={},Q;function ee(){if(Q)return P;Q=1,Object.defineProperty(P,"__esModule",{value:!0}),P.DiscussionEmbed=void 0;var y=h(q()),a=h(j()),d=U(),l=A();function h(t){return t&&t.__esModule?t:{default:t}}function m(t){"@babel/helpers - typeof";return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?m=function(n){return typeof n}:m=function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},m(t)}function b(){return b=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},b.apply(this,arguments)}function E(t,e){if(t==null)return{};var n=w(t,e),r,o;if(Object.getOwnPropertySymbols){var u=Object.getOwnPropertySymbols(t);for(o=0;o<u.length;o++)r=u[o],!(e.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(t,r)&&(n[r]=t[r])}return n}function w(t,e){if(t==null)return{};var n={},r=Object.keys(t),o,u;for(u=0;u<r.length;u++)o=r[u],!(e.indexOf(o)>=0)&&(n[o]=t[o]);return n}function D(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function S(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function I(t,e,n){return e&&S(t.prototype,e),t}function f(t,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&s(t,e)}function s(t,e){return s=Object.setPrototypeOf||function(r,o){return r.__proto__=o,r},s(t,e)}function c(t){var e=v();return function(){var n=_(t),r;if(e){var o=_(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return p(this,r)}}function p(t,e){return e&&(m(e)==="object"||typeof e=="function")?e:C(t)}function C(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function v(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch{return!1}}function _(t){return _=Object.setPrototypeOf?Object.getPrototypeOf:function(n){return n.__proto__||Object.getPrototypeOf(n)},_(t)}var i=function(t){f(n,t);var e=c(n);function n(){return D(this,n),e.apply(this,arguments)}return I(n,[{key:"componentDidMount",value:function(){typeof window<"u"&&window.disqus_shortname&&window.disqus_shortname!==this.props.shortname&&this.cleanInstance(),this.loadInstance()}},{key:"shouldComponentUpdate",value:function(o){return this.props===o?!1:(0,d.shallowComparison)(this.props,o)}},{key:"componentDidUpdate",value:function(o){this.props.shortname!==o.shortname&&this.cleanInstance(),this.loadInstance()}},{key:"componentWillUnmount",value:function(){this.cleanInstance()}},{key:"loadInstance",value:function(){var o=window.document;window&&window.DISQUS&&o.getElementById(l.EMBED_SCRIPT_ID)?window.DISQUS.reset({reload:!0,config:this.getDisqusConfig(this.props.config)}):(window.disqus_config=this.getDisqusConfig(this.props.config),window.disqus_shortname=this.props.shortname,(0,d.insertScript)("https://".concat(this.props.shortname,".disqus.com/embed.js"),l.EMBED_SCRIPT_ID,o.body))}},{key:"cleanInstance",value:function(){var o=window.document;(0,d.removeScript)(l.EMBED_SCRIPT_ID,o.body),window&&window.DISQUS&&window.DISQUS.reset({});try{delete window.DISQUS}catch{window.DISQUS=void 0}var u=o.getElementById(l.THREAD_ID);if(u)for(;u.hasChildNodes();)u.removeChild(u.firstChild);(0,d.removeResources)()}},{key:"getDisqusConfig",value:function(o){return function(){var u=this;this.page.identifier=o.identifier,this.page.url=o.url,this.page.title=o.title,this.page.category_id=o.categoryID,this.page.remote_auth_s3=o.remoteAuthS3,this.page.api_key=o.apiKey,o.sso&&(this.sso=o.sso),o.language&&(this.language=o.language),l.CALLBACKS.forEach(function(O){u.callbacks[O]=[o[O]]})}}},{key:"render",value:function(){var o=this.props;o.shortname,o.config;var u=E(o,["shortname","config"]);return y.default.createElement("div",b({},u,{id:l.THREAD_ID}))}}]),n}(y.default.Component);return P.DiscussionEmbed=i,i.propTypes={shortname:a.default.string.isRequired,config:a.default.shape({identifier:a.default.string,url:a.default.string,title:a.default.string,language:a.default.string,categoryID:a.default.string,remoteAuthS3:a.default.string,apiKey:a.default.string,preData:a.default.func,preInit:a.default.func,onInit:a.default.func,onReady:a.default.func,afterRender:a.default.func,preReset:a.default.func,onIdentify:a.default.func,beforeComment:a.default.func,onNewComment:a.default.func,onPaginate:a.default.func,sso:a.default.shape({name:a.default.string,button:a.default.string,icon:a.default.string,url:a.default.string,logout:a.default.string,profile_url:a.default.string,width:a.default.string,height:a.default.string})}).isRequired},P}var N={},$;function te(){if($)return N;$=1,Object.defineProperty(N,"__esModule",{value:!0}),N.Recommendations=void 0;var y=h(q()),a=h(j()),d=U(),l=A();function h(t){return t&&t.__esModule?t:{default:t}}function m(t){"@babel/helpers - typeof";return typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?m=function(n){return typeof n}:m=function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},m(t)}function b(){return b=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},b.apply(this,arguments)}function E(t,e){if(t==null)return{};var n=w(t,e),r,o;if(Object.getOwnPropertySymbols){var u=Object.getOwnPropertySymbols(t);for(o=0;o<u.length;o++)r=u[o],!(e.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(t,r)&&(n[r]=t[r])}return n}function w(t,e){if(t==null)return{};var n={},r=Object.keys(t),o,u;for(u=0;u<r.length;u++)o=r[u],!(e.indexOf(o)>=0)&&(n[o]=t[o]);return n}function D(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function S(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function I(t,e,n){return e&&S(t.prototype,e),t}function f(t,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&s(t,e)}function s(t,e){return s=Object.setPrototypeOf||function(r,o){return r.__proto__=o,r},s(t,e)}function c(t){var e=v();return function(){var n=_(t),r;if(e){var o=_(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return p(this,r)}}function p(t,e){return e&&(m(e)==="object"||typeof e=="function")?e:C(t)}function C(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function v(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch{return!1}}function _(t){return _=Object.setPrototypeOf?Object.getPrototypeOf:function(n){return n.__proto__||Object.getPrototypeOf(n)},_(t)}var i=function(t){f(n,t);var e=c(n);function n(){return D(this,n),e.apply(this,arguments)}return I(n,[{key:"componentDidMount",value:function(){this.loadInstance()}},{key:"shouldComponentUpdate",value:function(o){return this.props===o?!1:(0,d.shallowComparison)(this.props,o)}},{key:"componentDidUpdate",value:function(){this.loadInstance()}},{key:"componentWillUnmount",value:function(){this.cleanInstance()}},{key:"getDisqusConfig",value:function(o){return function(){this.page.identifier=o.identifier,this.page.url=o.url,this.page.title=o.title,this.language=o.language}}},{key:"loadInstance",value:function(){typeof window<"u"&&window.document&&(window.disqus_config=this.getDisqusConfig(this.props.config),window.document.getElementById(l.RECOMMENDATIONS_SCRIPT_ID)?this.reloadInstance():(0,d.insertScript)("https://".concat(this.props.shortname,".disqus.com/recommendations.js"),l.RECOMMENDATIONS_SCRIPT_ID,window.document.body))}},{key:"reloadInstance",value:function(){window&&window.DISQUS_RECOMMENDATIONS&&window.DISQUS_RECOMMENDATIONS.reset({reload:!0})}},{key:"cleanInstance",value:function(){(0,d.removeScript)(l.RECOMMENDATIONS_SCRIPT_ID,window.document.body);try{delete window.DISQUS_RECOMMENDATIONS}catch{window.DISQUS_RECOMMENDATIONS=void 0}var o=window.document.getElementById(l.RECOMMENDATIONS_ID);if(o)for(;o.hasChildNodes();)o.removeChild(o.firstChild);(0,d.removeResources)()}},{key:"render",value:function(){var o=this.props;o.shortname,o.config;var u=E(o,["shortname","config"]);return y.default.createElement("div",b({},u,{id:l.RECOMMENDATIONS_ID}))}}]),n}(y.default.Component);return N.Recommendations=i,i.propTypes={shortname:a.default.string.isRequired,config:a.default.shape({identifier:a.default.string,url:a.default.string,title:a.default.string,language:a.default.string})},N}var G;function ne(){return G||(G=1,function(y){Object.defineProperty(y,"__esModule",{value:!0}),Object.defineProperty(y,"CommentCount",{enumerable:!0,get:function(){return a.CommentCount}}),Object.defineProperty(y,"CommentEmbed",{enumerable:!0,get:function(){return d.CommentEmbed}}),Object.defineProperty(y,"DiscussionEmbed",{enumerable:!0,get:function(){return l.DiscussionEmbed}}),Object.defineProperty(y,"Recommendations",{enumerable:!0,get:function(){return h.Recommendations}}),y.default=void 0;var a=Y(),d=Z(),l=ee(),h=te(),m={CommentCount:a.CommentCount,CommentEmbed:d.CommentEmbed,DiscussionEmbed:l.DiscussionEmbed,Recommendations:h.Recommendations},b=m;y.default=b}(k)),k}var K=ne();const re=J(K),ue=X({__proto__:null,default:re},[K]);export{ue as i};