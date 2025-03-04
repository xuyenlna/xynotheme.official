class PopupComponent extends HTMLElement {
  constructor() {
    super();

    this.classes = {
      activeClass: "active",
      closingClass: "hide",
    };

    this.cookieName = "popupClosed";
    this.popupContainer = this.querySelector(".popup-container");
    this.closeButton = this.querySelector("[popup-close-button]");

    this.displayIntervalDays = parseInt(
      this.getAttribute("data-display-interval"),
      10
    );
    this.delayTime = parseInt(this.getAttribute("data-delay"), 10) * 1000 || 0;

    this.displayMode = this.getAttribute("data-display-mode");
    this.showingPage = this.getAttribute("data-showing-page");

    this.initPopup();
  }

  initPopup() {
    if (Shopify && Shopify.designMode && this.displayMode != "testmode") {
      return;
    }

    if (Shopify && Shopify.designMode && this.displayMode == "testmode") {
      this.showPopup();
    }

    const lastClosed = this.getCookie(this.cookieName);

    if (this.displayMode == "disable") {
      return;
    }

    setTimeout(() => {
      if (this.showingPage == "true") {
        if (!lastClosed || this.shouldShowPopup(lastClosed)) {
          this.showPopup();
        }
      }
    }, this.delayTime);

    this.closeButton.addEventListener("click", () => {
      this.closePopup();
    });
  }

  shouldShowPopup(lastClosed) {
    const lastClosedDate = new Date(parseInt(lastClosed, 10));
    const currentDate = new Date();
    const differenceInDays =
      (currentDate - lastClosedDate) / (1000 * 60 * 60 * 24);

    return differenceInDays >= this.displayIntervalDays;
  }

  showPopup() {
    if (this.displayMode == "disable") {
      return;
    }

    this.popupContainer.classList.add(this.classes.activeClass);
  }

  closePopup() {
    this.popupContainer.classList.add(this.classes.closingClass);

    setTimeout(() => {
      this.popupContainer.classList.remove(this.classes.activeClass);
      this.popupContainer.classList.remove(this.classes.closingClass);
    }, 500);

    this.setCookie(this.cookieName, Date.now(), this.displayIntervalDays);
  }

  getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) {
        return value;
      }
    }
    return null;
  }

  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  }

  connectedCallback() {
    if (Shopify.designMode) {
      this.onShopifySectionLoad = this.onSectionLoad.bind(this);
      this.onShopifySectionSelect = this.onSectionSelect.bind(this);
      this.onShopifySectionDeselect = this.onSectionDeselect.bind(this);

      // Directly add event listeners for Shopify events
      document.addEventListener(
        "shopify:section:load",
        this.onShopifySectionLoad
      );
      document.addEventListener(
        "shopify:section:select",
        this.onShopifySectionSelect
      );
      document.addEventListener(
        "shopify:section:deselect",
        this.onShopifySectionDeselect
      );
    }
  }
  disconnectedCallback() {
    if (Shopify.designMode) {
      // Directly remove event listeners for Shopify events
      document.removeEventListener(
        "shopify:section:load",
        this.onShopifySectionLoad
      );
      document.removeEventListener(
        "shopify:section:select",
        this.onShopifySectionSelect
      );
      document.removeEventListener(
        "shopify:section:deselect",
        this.onShopifySectionDeselect
      );
    }
  }
  onSectionLoad() {
    if (this.displayMode === "testmode") {
      this.showPopup();
    }
  }

  onSectionSelect() {
    if (this.displayMode === "testmode") {
      this.showPopup();
    }
  }

  onSectionDeselect() {
    if (this.displayMode === "testmode") {
      this.closePopup();
    }
  }
}
customElements.define("popup-component", PopupComponent);
