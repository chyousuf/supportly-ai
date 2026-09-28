"use strict";(()=>{var d=class{constructor(t,e){this.config=null;this.conversationId=null;this.messages=[];this.isOpen=!1;this.isLoading=!1;this.chatWindow=null;this.messagesContainer=null;this.inputField=null;this.inputArea=null;this.suggestedQuestionsContainer=null;this.fab=null;this.unreadBadge=null;this.unreadCount=0;this.typingIndicatorId=null;this.businessId=t,this.apiBase=e.replace(/\/$/,""),this.container=document.createElement("div"),this.container.className="supportly-widget",document.body.appendChild(this.container),this.init()}async init(){this.injectStyles();try{let t=await fetch(`${this.apiBase}/api/widget/${this.businessId}/config`);if(!t.ok)throw new Error("Failed to load widget config");let e=await t.json();this.config=e.data||e;let i=sessionStorage.getItem(`supportly_session_${this.businessId}`);i&&(this.conversationId=i),this.buildUI()}catch(t){console.error("Supportly Widget initialization failed:",t)}}injectStyles(){let t=document.createElement("style");t.textContent=`
      .supportly-widget * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      }
      
      .supportly-widget .su-fab {
        position: fixed;
        bottom: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: var(--su-brand-color, #2563eb);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, background-color 0.2s ease;
      }
      
      .supportly-widget .su-fab:hover {
        transform: scale(1.05);
      }
      
      .supportly-widget .su-fab.su-right { right: 24px; }
      .supportly-widget .su-fab.su-left { left: 24px; }
      
      .supportly-widget .su-fab-icon {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }
      
      .supportly-widget .su-unread-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background-color: #ef4444;
        color: white;
        font-size: 12px;
        font-weight: bold;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        border: 2px solid white;
      }
      
      .supportly-widget .su-window {
        position: fixed;
        bottom: 96px;
        width: 380px;
        height: min(600px, calc(100vh - 120px));
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        z-index: 10001;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        opacity: 0;
        pointer-events: none;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .supportly-widget .su-window.su-right { right: 24px; transform-origin: bottom right; }
      .supportly-widget .su-window.su-left { left: 24px; transform-origin: bottom left; }
      
      .supportly-widget .su-window.su-open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }
      
      .supportly-widget .su-header {
        background-color: var(--su-brand-color, #2563eb);
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .supportly-widget .su-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .supportly-widget .su-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .supportly-widget .su-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .supportly-widget .su-avatar-text {
        font-weight: bold;
        font-size: 16px;
      }
      
      .supportly-widget .su-header-title {
        font-weight: 600;
        font-size: 16px;
        line-height: 1.2;
      }
      
      .supportly-widget .su-header-subtitle {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 2px;
      }
      
      .supportly-widget .su-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      
      .supportly-widget .su-close-btn:hover {
        opacity: 1;
      }
      
      .supportly-widget .su-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background-color: #f8fafc;
        scroll-behavior: smooth;
      }
      
      .supportly-widget .su-msg-row {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      
      .supportly-widget .su-msg-row.su-customer {
        align-items: flex-end;
      }
      
      .supportly-widget .su-msg-row.su-assistant {
        align-items: flex-start;
      }
      
      .supportly-widget .su-msg-bubble {
        max-width: 85%;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }
      
      .supportly-widget .su-customer .su-msg-bubble {
        background-color: var(--su-brand-color, #2563eb);
        color: white;
        border-radius: 16px 16px 4px 16px;
      }
      
      .supportly-widget .su-assistant .su-msg-bubble {
        background-color: white;
        color: #1e293b;
        border-radius: 16px 16px 16px 4px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      .supportly-widget .su-msg-bubble p {
        margin: 0 0 8px 0;
      }
      .supportly-widget .su-msg-bubble p:last-child {
        margin-bottom: 0;
      }
      .supportly-widget .su-msg-bubble ul, .supportly-widget .su-msg-bubble ol {
        margin: 0 0 8px 0;
        padding-left: 20px;
      }
      .supportly-widget .su-msg-bubble a {
        color: inherit;
        text-decoration: underline;
      }
      
      .supportly-widget .su-msg-sources {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .supportly-widget .su-source-badge {
        font-size: 11px;
        background-color: #f1f5f9;
        color: #64748b;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      .supportly-widget .su-msg-actions {
        display: flex;
        gap: 8px;
        margin-top: 6px;
        padding-left: 4px;
      }
      
      .supportly-widget .su-feedback-btn {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }
      
      .supportly-widget .su-feedback-btn:hover, .supportly-widget .su-feedback-btn.su-active {
        color: var(--su-brand-color, #2563eb);
      }
      
      .supportly-widget .su-suggestions {
        padding: 12px 16px;
        background-color: white;
        border-top: 1px solid #e2e8f0;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .supportly-widget .su-suggestion-chip {
        background-color: #f1f5f9;
        color: var(--su-brand-color, #2563eb);
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 6px 12px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }
      
      .supportly-widget .su-suggestion-chip:hover {
        background-color: #e2e8f0;
      }
      
      .supportly-widget .su-input-area {
        padding: 16px;
        background-color: white;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 12px;
        align-items: flex-end;
      }
      
      .supportly-widget .su-input {
        flex: 1;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        resize: none;
        max-height: 120px;
        overflow-y: auto;
        font-family: inherit;
        background-color: #f8fafc;
      }
      
      .supportly-widget .su-input:focus {
        border-color: var(--su-brand-color, #2563eb);
        background-color: white;
      }
      
      .supportly-widget .su-send-btn {
        background-color: var(--su-brand-color, #2563eb);
        color: white;
        border: none;
        border-radius: 12px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s, opacity 0.2s;
        flex-shrink: 0;
      }
      
      .supportly-widget .su-send-btn:hover {
        opacity: 0.9;
      }
      
      .supportly-widget .su-send-btn:disabled {
        background-color: #cbd5e1;
        cursor: not-allowed;
      }
      
      .supportly-widget .su-footer {
        text-align: center;
        padding: 0 0 12px 0;
        background-color: white;
      }
      
      .supportly-widget .su-footer-text {
        font-size: 11px;
        color: #94a3b8;
        text-decoration: none;
      }
      
      .supportly-widget .su-typing {
        display: flex;
        gap: 4px;
        padding: 4px;
      }
      
      .supportly-widget .su-dot {
        width: 6px;
        height: 6px;
        background-color: #94a3b8;
        border-radius: 50%;
        animation: su-bounce 1.4s infinite ease-in-out both;
      }
      
      .supportly-widget .su-dot:nth-child(1) { animation-delay: -0.32s; }
      .supportly-widget .su-dot:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes su-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      /* Handoff Form Styles */
      .supportly-widget .su-handoff-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }
      
      .supportly-widget .su-handoff-title {
        font-weight: 600;
        font-size: 14px;
        color: #1e293b;
        margin: 0;
      }
      
      .supportly-widget .su-handoff-input {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13px;
        outline: none;
      }
      
      .supportly-widget .su-handoff-input:focus {
        border-color: var(--su-brand-color, #2563eb);
      }
      
      .supportly-widget .su-handoff-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 4px;
      }
      
      .supportly-widget .su-btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
      }
      
      .supportly-widget .su-btn-primary {
        background-color: var(--su-brand-color, #2563eb);
        color: white;
      }
      
      .supportly-widget .su-btn-secondary {
        background-color: #f1f5f9;
        color: #475569;
      }
      
      @media (max-width: 480px) {
        .supportly-widget .su-window {
          bottom: 0;
          right: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
          border: none;
        }
        .supportly-widget .su-header {
          border-radius: 0;
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .supportly-widget .su-window {
          transition: none;
        }
        .supportly-widget .su-dot {
          animation: none;
        }
      }
    `,this.config&&this.config.brand_color&&this.container.style.setProperty("--su-brand-color",this.config.brand_color),document.head.appendChild(t)}buildUI(){if(!this.config)return;let t=this.config.position==="left"?"su-left":"su-right";this.fab=document.createElement("button"),this.fab.className=`su-fab ${t}`,this.fab.setAttribute("aria-label","Open chat"),this.fab.innerHTML=`
      <svg class="su-fab-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
      </svg>
    `,this.fab.addEventListener("click",()=>this.toggleChat()),this.unreadBadge=document.createElement("span"),this.unreadBadge.className="su-unread-badge",this.unreadBadge.style.display="none",this.fab.appendChild(this.unreadBadge),this.container.appendChild(this.fab),this.chatWindow=document.createElement("div"),this.chatWindow.className=`su-window ${t}`,this.chatWindow.innerHTML=`
      <div class="su-header">
        <div class="su-header-info">
          <div class="su-avatar">
            ${this.config.logo_url?`<img src="${this.config.logo_url}" alt="Assistant" />`:`<span class="su-avatar-text">${this.config.assistant_name.charAt(0)}</span>`}
          </div>
          <div>
            <div class="su-header-title">${this.escapeHTML(this.config.assistant_name)}</div>
            <div class="su-header-subtitle">AI Assistant</div>
          </div>
        </div>
        <button class="su-close-btn" aria-label="Close chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="su-messages"></div>
      <div class="su-suggestions" style="display: none;"></div>
      <div class="su-input-area">
        <input type="text" class="su-input" placeholder="Type your message..." aria-label="Message input" />
        <button class="su-send-btn" aria-label="Send message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="su-footer">
        <a href="https://supportly.ai" target="_blank" class="su-footer-text">Powered by Supportly AI</a>
      </div>
    `,this.container.appendChild(this.chatWindow),this.messagesContainer=this.chatWindow.querySelector(".su-messages"),this.suggestedQuestionsContainer=this.chatWindow.querySelector(".su-suggestions"),this.inputArea=this.chatWindow.querySelector(".su-input-area"),this.inputField=this.chatWindow.querySelector(".su-input");let e=this.chatWindow.querySelector(".su-send-btn");this.chatWindow.querySelector(".su-close-btn")?.addEventListener("click",()=>this.toggleChat()),e?.addEventListener("click",()=>this.handleSend()),this.inputField?.addEventListener("keypress",s=>{s.key==="Enter"&&(s.preventDefault(),this.handleSend())}),document.addEventListener("keydown",s=>{s.key==="Escape"&&this.isOpen&&this.toggleChat()}),this.config.suggested_questions&&this.config.suggested_questions.length>0&&(this.suggestedQuestionsContainer.style.display="flex",this.config.suggested_questions.forEach(s=>{let n=document.createElement("button");n.className="su-suggestion-chip",n.textContent=s,n.addEventListener("click",()=>{this.inputField&&(this.inputField.value=s,this.handleSend())}),this.suggestedQuestionsContainer.appendChild(n)}))}toggleChat(){this.isOpen=!this.isOpen,this.isOpen?(this.chatWindow?.classList.add("su-open"),this.unreadCount=0,this.updateUnreadBadge(),this.conversationId||this.startConversation(),setTimeout(()=>{this.inputField?.focus()},100)):this.chatWindow?.classList.remove("su-open")}updateUnreadBadge(){this.unreadBadge&&(this.unreadCount>0&&!this.isOpen?(this.unreadBadge.textContent=this.unreadCount>9?"9+":this.unreadCount.toString(),this.unreadBadge.style.display="flex"):this.unreadBadge.style.display="none")}async startConversation(){if(this.config)try{this.addMessageToUI({role:"assistant",content:this.config.welcome_message});let t=await fetch(`${this.apiBase}/api/widget/${this.businessId}/conversations`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({url:window.location.href,title:document.title})});if(t.ok){let e=await t.json(),i=e.data||e;this.conversationId=i.id,sessionStorage.setItem(`supportly_session_${this.businessId}`,this.conversationId)}}catch(t){console.error("Error starting conversation:",t)}}async handleSend(){if(!this.inputField||this.isLoading)return;let t=this.inputField.value.trim();t&&(this.inputField.value="",await this.sendMessage(t))}async sendMessage(t){if(!this.isLoading){this.isLoading=!0,this.suggestedQuestionsContainer&&(this.suggestedQuestionsContainer.style.display="none"),this.addMessageToUI({role:"customer",content:t}),this.showTypingIndicator();try{if(!this.isWithinBusinessHours()){this.removeTypingIndicator(),this.addMessageToUI({role:"assistant",content:"We're currently outside of our business hours. Please leave your details and we'll get back to you soon."}),this.showHandoffForm(),this.isLoading=!1;return}this.conversationId||await this.startConversation();let e=await fetch(`${this.apiBase}/api/widget/${this.businessId}/conversations/${this.conversationId}/messages`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({content:t})});if(this.removeTypingIndicator(),!e.ok)throw new Error("Failed to send message");let i=await e.json(),s=i.data||i;this.addMessageToUI({id:s.id,role:"assistant",content:s.content,sources:s.sources}),s.handoff_requested&&this.showHandoffForm(),this.isOpen||(this.unreadCount++,this.updateUnreadBadge())}catch(e){this.removeTypingIndicator(),this.addMessageToUI({role:"system",content:"Sorry, there was an error sending your message. Please try again."}),console.error("Send error:",e)}finally{this.isLoading=!1}}}addMessageToUI(t){if(!this.messagesContainer)return;this.messages.push(t);let e=document.createElement("div");e.className=`su-msg-row su-${t.role}`;let i="";if(t.role==="system")i=`<div style="font-size: 12px; color: #ef4444; margin: 8px 0; text-align: center;">${this.escapeHTML(t.content)}</div>`;else{let s=document.createElement("div");if(s.className="su-msg-bubble",s.innerHTML=this.renderMarkdown(t.content),t.sources&&t.sources.length>0){let n=document.createElement("div");n.className="su-msg-sources",t.sources.forEach((o,r)=>{let l=document.createElement("span");l.className="su-source-badge",l.textContent=`[${r+1}] ${o.title}`,n.appendChild(l)}),s.appendChild(n)}if(e.appendChild(s),t.role==="assistant"&&t.id){let n=document.createElement("div");n.className="su-msg-actions";let o=document.createElement("button");o.className="su-feedback-btn",o.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>',o.setAttribute("aria-label","Helpful");let r=document.createElement("button");r.className="su-feedback-btn",r.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>',r.setAttribute("aria-label","Unhelpful"),o.addEventListener("click",()=>{this.submitFeedback(t.id,"helpful"),o.classList.add("su-active"),r.disabled=!0}),r.addEventListener("click",()=>{this.submitFeedback(t.id,"unhelpful"),r.classList.add("su-active"),o.disabled=!0}),n.appendChild(o),n.appendChild(r),e.appendChild(n)}}t.role==="system"&&(e.innerHTML=i),e.style.opacity="0",e.style.transform="translateY(10px)",e.style.transition="opacity 0.3s, transform 0.3s",this.messagesContainer.appendChild(e),requestAnimationFrame(()=>{e.style.opacity="1",e.style.transform="translateY(0)",this.scrollToBottom()})}showTypingIndicator(){if(!this.messagesContainer)return;this.typingIndicatorId="typing-"+Date.now();let t=document.createElement("div");t.id=this.typingIndicatorId,t.className="su-msg-row su-assistant";let e=document.createElement("div");e.className="su-msg-bubble";let i=document.createElement("div");i.className="su-typing",i.innerHTML=`
      <div class="su-dot"></div>
      <div class="su-dot"></div>
      <div class="su-dot"></div>
    `,e.appendChild(i),t.appendChild(e),this.messagesContainer.appendChild(t),this.scrollToBottom()}removeTypingIndicator(){if(!this.typingIndicatorId)return;let t=document.getElementById(this.typingIndicatorId);t&&t.parentNode&&t.parentNode.removeChild(t),this.typingIndicatorId=null}scrollToBottom(){this.messagesContainer&&(this.messagesContainer.scrollTop=this.messagesContainer.scrollHeight)}async submitFeedback(t,e){if(this.conversationId)try{await fetch(`${this.apiBase}/api/widget/${this.businessId}/conversations/${this.conversationId}/feedback`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({message_id:t,rating:e})})}catch{console.error("Failed to submit feedback")}}showHandoffForm(){if(!this.inputArea)return;let t=this.inputArea.innerHTML;this.inputArea.innerHTML="",this.inputArea.style.flexDirection="column",this.inputArea.style.alignItems="stretch";let e=document.createElement("form");e.className="su-handoff-form",e.innerHTML=`
      <h3 class="su-handoff-title">Connect with our team</h3>
      <input type="text" id="su-handoff-name" class="su-handoff-input" placeholder="Your Name" required />
      <input type="email" id="su-handoff-email" class="su-handoff-input" placeholder="Email Address" required />
      <textarea id="su-handoff-issue" class="su-handoff-input" placeholder="How can we help?" rows="3" required></textarea>
      <div class="su-handoff-actions">
        <button type="button" class="su-btn su-btn-secondary" id="su-handoff-cancel">Cancel</button>
        <button type="submit" class="su-btn su-btn-primary">Submit</button>
      </div>
    `,this.inputArea.appendChild(e),e.querySelector("#su-handoff-cancel")?.addEventListener("click",()=>{this.restoreInputArea(t)}),e.addEventListener("submit",async s=>{s.preventDefault();let n=e.querySelector("#su-handoff-name").value,o=e.querySelector("#su-handoff-email").value,r=e.querySelector("#su-handoff-issue").value,l=e.querySelector('button[type="submit"]');l.textContent="Submitting...",l.disabled=!0;try{await fetch(`${this.apiBase}/api/widget/${this.businessId}/conversations/${this.conversationId}/handoff`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n,email:o,issue:r})}),this.addMessageToUI({role:"system",content:"Thank you! Your request has been sent to our team."}),this.restoreInputArea(t)}catch{l.textContent="Submit",l.disabled=!1,alert("Failed to submit. Please try again.")}}),this.scrollToBottom()}restoreInputArea(t){if(!this.inputArea)return;this.inputArea.style.flexDirection="row",this.inputArea.style.alignItems="flex-end",this.inputArea.innerHTML=t,this.inputField=this.inputArea.querySelector(".su-input"),this.inputArea.querySelector(".su-send-btn")?.addEventListener("click",()=>this.handleSend()),this.inputField?.addEventListener("keypress",i=>{i.key==="Enter"&&(i.preventDefault(),this.handleSend())})}isWithinBusinessHours(){if(!this.config?.business_hours?.enabled)return!0;let{timezone:t,hours:e}=this.config.business_hours;if(!e||Object.keys(e).length===0)return!0;try{let i=new Date,s={timeZone:t,weekday:"long"},n=new Intl.DateTimeFormat("en-US",s).format(i).toLowerCase(),o=e[n];if(!o||o===null)return!1;let r=i.toLocaleTimeString("en-US",{timeZone:t,hour12:!1,hour:"2-digit",minute:"2-digit"});return r>=o.open&&r<=o.close}catch(i){return console.error("Error calculating business hours",i),!0}}escapeHTML(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}renderMarkdown(t){let e=this.escapeHTML(t);if(e=e.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\[(.*?)\]\((.*?)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'),e.match(/^[\s]*[-•*]\s/m)){let i=e.split(`
`),s=!1,n="";for(let o=0;o<i.length;o++){let r=i[o];r.match(/^[\s]*[-•*]\s(.*)/)?(s||(n+="<ul>",s=!0),n+="<li>"+r.replace(/^[\s]*[-•*]\s(.*)/,"$1")+"</li>"):(s&&(n+="</ul>",s=!1),n+=r+(o<i.length-1?`
`:""))}s&&(n+="</ul>"),e=n}if(e.match(/^[\s]*\d+\.\s/m)){let i=e.split(`
`),s=!1,n="";for(let o=0;o<i.length;o++){let r=i[o];r.match(/^[\s]*\d+\.\s(.*)/)?(s||(n+="<ol>",s=!0),n+="<li>"+r.replace(/^[\s]*\d+\.\s(.*)/,"$1")+"</li>"):(s&&(n+="</ol>",s=!1),n+=r+(o<i.length-1?`
`:""))}s&&(n+="</ol>"),e=n}return e=e.replace(/\n/g,"<br/>"),e=e.replace(/<br\/><ul/g,"<ul"),e=e.replace(/<br\/><ol/g,"<ol"),e=e.replace(/<\/ul><br\/>/g,"</ul>"),e=e.replace(/<\/ol><br\/>/g,"</ol>"),e}};(function(){let a=document.getElementsByTagName("script"),t=null;for(let s=a.length-1;s>=0;s--)if(a[s].src&&a[s].src.includes("supportly-widget")){t=a[s];break}if(!t){for(let s=0;s<a.length;s++)if(a[s].hasAttribute("data-business-id")){t=a[s];break}if(!t)return}let e=t.getAttribute("data-business-id");if(!e){console.error("Supportly Widget: data-business-id attribute is required");return}let i="";t.src?i=new URL(t.src).origin:i=window.location.origin,t.hasAttribute("data-api-base")&&(i=t.getAttribute("data-api-base")||i),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>new d(e,i)):new d(e,i)})();})();
