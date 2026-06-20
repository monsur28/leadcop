/**
 * LeadCop Vanilla JS SDK
 * Lightweight, zero-dependency tracking and validation script.
 * Size: < 5KB minified.
 */
(function () {
  const ENDPOINT = "https://api.leadcop.io/api/v1/validate"; // Point to your hosted Edge route

  class LeadCopSDK {
    constructor() {
      this.apiKey = null;
      this.inputs = new WeakMap(); // Tracks state per input to avoid memory leaks
      this.init();
    }

    init() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.boot());
      } else {
        this.boot();
      }
    }

    boot() {
      const scriptTag = document.currentScript || document.querySelector('script[data-api-key]');
      if (!scriptTag) {
        console.error("[LeadCop] Script tag not found or missing data-api-key attribute.");
        return;
      }

      this.apiKey = scriptTag.getAttribute("data-api-key");
      if (!this.apiKey) {
        console.error("[LeadCop] Missing API Key.");
        return;
      }



      // Attach to existing elements
      this.attachToExistingForms();
      // Watch for dynamically loaded forms (e.g., React/Vue modals)
      this.observeDOM();
    }

    attachToExistingForms() {
      const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email" i]');
      emailInputs.forEach(input => this.bindInput(input));
    }

    observeDOM() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'INPUT' && (node.type === 'email' || /email/i.test(node.name))) {
                this.bindInput(node);
              } else {
                const nestedInputs = node.querySelectorAll('input[type="email"], input[name*="email" i]');
                nestedInputs.forEach(input => this.bindInput(input));
              }
            }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    bindInput(input) {
      if (this.inputs.has(input)) return; // Already bound
      
      // UI Wrapper for Error Messaging
      const wrapper = document.createElement("div");
      wrapper.className = "lc-input-wrapper";
      wrapper.style.position = "relative";
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const errorNode = document.createElement("div");
      errorNode.className = "lc-error-message";
      errorNode.style.cssText = "color: #ef4444; font-size: 12px; margin-top: 4px; display: none; font-family: sans-serif;";
      wrapper.appendChild(errorNode);

      this.inputs.set(input, { 
        isValid: false, 
        isChecking: false, 
        lastValue: "", 
        errorNode,
        wrapper
      });

      // Hook Events
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearError(this.inputs.get(input)));

      const form = input.form;
      if (form && !form.dataset.leadcopBound) {
        form.dataset.leadcopBound = "true";
        form.addEventListener("submit", (e) => this.handleFormSubmit(e, form), true);
      }
    }

    async validateField(input) {
      const value = input.value.trim();
      const state = this.inputs.get(input);

      if (!value) {
        this.clearError(state);
        state.isValid = false;
        return true; // Empty is fine for us, let HTML5 'required' catch it
      }

      if (value === state.lastValue && state.isValid) return true;

      state.isChecking = true;
      this.showLoading(state);

      try {
        const result = await this.performValidation(value);
        state.lastValue = value;
        state.isChecking = false;

        const isOk = this.processResult(result, state, input);
        state.isValid = isOk;
        return isOk;
      } catch (err) {
        state.isChecking = false;
        state.isValid = false;
        this.showError(state, err.message || "Validation service unavailable.");
        return false;
      }
    }

    async performValidation(email) {
      // In development, this points to your Edge route
      // e.g. "http://localhost:3000/api/v1/validate"
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify({ email })
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`API Error: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }
      return data;
    }

    processResult(result, state, input) {
      if (result.reason === "TYPO" && result.message) {
        // The backend returns a pre-formatted message (e.g., "Did you mean %s?")
        // where %s has already been substituted by the backend.
        // We'll wrap the suggestion in a clickable span.
        const msgHtml = result.message.replace(
          result.suggestion, 
          `<strong style="cursor:pointer; text-decoration:underline;" class="lc-suggestion">${result.suggestion}</strong>`
        );
        this.showError(state, msgHtml);
        
        // Bind suggestion click handler
        const suggestionEl = state.errorNode.querySelector('.lc-suggestion');
        if (suggestionEl) {
          suggestionEl.addEventListener('click', () => {
            input.value = result.suggestion;
            this.clearError(state);
            this.validateField(input); // Re-validate
          });
        }
        return false;
      }

      if (!result.valid) {
        this.showError(state, result.message);
        return false;
      }

      this.clearError(state);
      return true;
    }

    showError(state, html) {
      state.errorNode.innerHTML = html;
      state.errorNode.style.display = "block";
      state.wrapper.style.border = "1px solid #ef4444";
      state.wrapper.style.borderRadius = "4px";
    }

    clearError(state) {
      state.errorNode.style.display = "none";
      state.wrapper.style.border = "none";
    }

    showLoading(state) {
      state.errorNode.innerHTML = "";
      state.errorNode.style.display = "none";
    }

    async handleFormSubmit(e, form) {
      // If we have already validated and approved this form, let it pass
      if (form.dataset.leadcopValidated === "true") {
        form.dataset.leadcopValidated = "false"; // Reset for next submission
        return;
      }

      // Block submission to run async validation
      e.preventDefault();
      e.stopImmediatePropagation();

      const emailInputs = form.querySelectorAll('input[type="email"], input[name*="email" i]');
      let allValid = true;

      // Validate all email fields
      for (const input of emailInputs) {
        const state = this.inputs.get(input);
        if (!state) continue;
        
        const ok = await this.validateField(input);
        if (!ok) allValid = false;
      }

      if (allValid) {
        // Mark as approved and re-dispatch submission for SPA (React/Vue) compatibility
        form.dataset.leadcopValidated = "true";
        const newSubmitEvent = new Event("submit", { bubbles: true, cancelable: true });
        const cancelled = !form.dispatchEvent(newSubmitEvent);
        
        // If the event wasn't cancelled by an SPA framework, perform native HTTP submit
        if (!cancelled) {
          form.submit();
        }
      }
    }
  }

  // Bind to global scope
  window.LeadCop = new LeadCopSDK();
})();
