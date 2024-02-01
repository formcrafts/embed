import Drawer from "./drawer.ts";
import css from "./embed.css";

const events: {
  [key: string]: Function[];
} = {
  load: [] as Function[],
};

type Events = {
  [key: string]: Function[];
};

type EmbedOptions = {
  form: string;
  target: HTMLElement;
  seamless?: boolean;
  width?: number | null;
  values?: Record<string, string | string[]>;
  formBase?: string;
  _params?: URLSearchParams;
};

type EmbedPopupOptions = {
  form: string;
  width?: number | null;
  appendTo?: HTMLElement;
  values?: Record<string, string | string[]>;
  formBase?: string;
  _params?: URLSearchParams;
};

const authorizedDomain = [
  "https://app.formcrafts.com",
  "https://app.beta-formcrafts.com",
  "https://app.localhost:5173",
];

const iframeShadow =
  "rgba(0, 5, 10, 0.08) 0px 0px 0px 0.5px, rgba(50, 55, 60, 0.04) 2px 3px 2px 0px, rgba(50, 50, 50, 0.03) -2px -2px 2px 0px, rgba(80, 80, 80, 0.176) 0px 7px 5px -7px";

// iframeSrc util
function buildIframeSrc(options: EmbedOptions) {
  const base = options.formBase ?? "https://app.formcrafts.com";
  const url = new URL(`${base}/${options.form}`);
  url.searchParams.set("iframe", "true");

  if (typeof options.seamless !== "undefined" && options.seamless === true) {
    url.searchParams.set("seamless", "true");
  }
  if (typeof options._params !== "undefined") {
    options._params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return url.href;
}

function buildIframeSrcPopup(options: EmbedPopupOptions) {
  const base = options.formBase ?? "https://app.formcrafts.com";
  const url = new URL(`${base}/${options.form}`);
  url.searchParams.set("iframe", "true");
  if (typeof options._params !== "undefined") {
    options._params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }
  return url.href;
}

export function observeVisibility(
  targets: Element | Element[],
  callback: () => void,
): void {
  const handleIntersection: IntersectionObserverCallback = (
    entries,
    observer,
  ) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
        return;
      }
    }
  };

  const observer = new IntersectionObserver(handleIntersection);

  if (Array.isArray(targets)) {
    targets.forEach((target) => observer.observe(target));
  } else {
    observer.observe(targets);
  }
}

function adjustIframeHeight(
  iframe: HTMLIFrameElement,
  newHeight: string,
  target: HTMLElement | null,
) {
  if (typeof newHeight === "undefined") return;
  if (target) {
    target.style.height = "";
  }
  iframe.style.height = `${newHeight}px`;
  iframe.style.visibility = "visible";
  iframe.style.position = "static";
}

function createEventListeners(
  iframe: HTMLIFrameElement,
  options: EmbedOptions | EmbedPopupOptions,
  type: "popup" | "embed",
) {
  const seamless = ("seamless" in options && options?.seamless) ?? false;
  window.addEventListener("message", (event) => {
    if (iframe.contentWindow !== event.source) return;
    if (!authorizedDomain.includes(event.origin)) return false;
    if (event.data.type === "load") {
      const events = (iframe as any)._formcraftsEvents as any;
      if (events.load) {
        events.load.forEach((callback: any) => callback());
      }
    }
    if (event.data.type === "page") {
      const rect = iframe.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.top <= window.innerHeight;
      if (!isVisible) {
        window.scrollBy({
          top: rect.top -
            parseFloat(getComputedStyle(document.documentElement).fontSize) * 2,
          behavior: "smooth",
        });
      }
    }
    if (event.data.type === "height") {
      const target = "target" in options ? options.target : null;
      adjustIframeHeight(iframe, event.data.content, target);
    }
    if (event.data.type === "background" && !seamless) {
      iframe.style.background = event.data.content;
    }
    if (event.data.type === "name") {
      iframe.ariaLabel = event.data.content;
      iframe.title = event.data.content;
    }
    if (event.data.type === "success" && type === "embed") {
      const rect = iframe.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.top <= window.innerHeight;
      if (!isVisible) {
        window.scrollBy({
          top: rect.top -
            parseFloat(getComputedStyle(document.documentElement).fontSize) * 1,
          behavior: "smooth",
        });
      }
    }
    if (event.data.type === "close" && type === "popup" && options) {
      const modalId = `fc-modal-${options.form}`;
      const existingModal = document.getElementById(modalId);
      const existingDrawer = (existingModal as any).drawerInstance as Drawer;
      existingDrawer.close();
    }
  });
}

/**
 * Creates an inline form using an iframe.
 *
 * @param {EmbedOptions} options - The options for the form.
 * @returns {ReturnType} The return type of the createReturn function.
 */
export function createInlineForm(options: EmbedOptions) {
  // Check if widget is already created
  if (options.target.querySelector("iframe")) {
    console.warn("Formcrafts: Widget already created");
    const iframe = options.target.querySelector("iframe") as HTMLIFrameElement;
    return createReturn(iframe, options);
  }

  if (typeof options.seamless === "undefined") {
    options.seamless = false;
  }

  const iframe = document.createElement("iframe");
  createEventListeners(iframe, options, "embed");

  const targetStyles = window.getComputedStyle(options.target);
  options.target.style.display = "flex";
  options.target.style.justifyContent = "stretch";
  options.target.style.width = "100%";

  iframe.dataset.src = buildIframeSrc(options);
  console.log("iframe.dataset.src", iframe.dataset.src);
  iframe.title = "Formcrafts form";
  iframe.style.border = "none";
  iframe.style.width = targetStyles.getPropertyValue("width");
  iframe.style.position = "absolute";
  iframe.style.visibility = "hidden";
  iframe.ariaLabel = "Formcrafts form";
  iframe.name = "formcrafts-iframe";
  iframe.onload = () => {
    options.target.style.overflow = "initial";
    iframe.style.width = `${options.width}px`;
    iframe.style.maxWidth = "100%";
    iframe.style.transition = "height 0ms linear";
    iframe.style.willChange = "height";
    iframe.contentWindow?.postMessage({
      type: "url",
      content: window.location.href,
    }, "*");
    iframe.contentWindow?.postMessage({
      type: "values",
      content: options.values,
    }, "*");
  };
  if (typeof options.width !== "undefined" && options.width !== null) {
    iframe.style.width = `${options.width}px`;
    iframe.style.maxWidth = "100%";
  }
  if (!options.seamless) {
    iframe.style.boxShadow = iframeShadow;
    iframe.style.borderRadius = "4px";
  }

  observeVisibility(iframe, () => {
    if (typeof iframe.dataset.src !== "undefined") {
      iframe.src = iframe.dataset.src as string;
      iframe.removeAttribute("data-src");
    }
  });

  // Add iframe to target
  options.target.appendChild(iframe);

  return createReturn(iframe, options);
}

function createReturn(iframe: HTMLIFrameElement, options: EmbedOptions) {
  const instance = {
    on(event: string, callback: Function) {
      const events = (iframe as any)._formcraftsEvents as any;
      events[event] = events[event] || [];
      events[event].push(callback);
    },
    values(values: Record<string, string | string[]>) {
      iframe.contentWindow?.postMessage({
        type: "values",
        content: values,
      }, "*");
    },
    destroy() {
      iframe?.remove();
    },
  };
  (iframe as any)._formcraftsInstance = instance;
  (iframe as any)._formcraftsEvents = {};
  return instance;
}

function createPopupReturn(drawer: Drawer, config: EmbedPopupOptions) {
  const iframe = drawer.drawerElement.querySelector(
    "iframe",
  ) as HTMLIFrameElement;
  const instance = {
    on(event: string, callback: Function) {
      const events = (iframe as any)._formcraftsEvents as any;
      events[event] = events[event] || [];
      events[event].push(callback);
    },
    load() {
      if (iframe) {
        const src = iframe.dataset.src as string;
        if (src) {
          iframe.src = iframe.dataset.src as string;
          iframe.removeAttribute("data-src");
        }
      }
    },
    values(values: Record<string, string | string[]>) {
      iframe.contentWindow?.postMessage({
        type: "values",
        content: values,
      }, "*");
    },
    open() {
      if (iframe) {
        const src = iframe.dataset.src as string;
        if (src) {
          iframe.src = iframe.dataset.src as string;
          iframe.removeAttribute("data-src");
        }
      }
      drawer.open();
    },
    close() {
      drawer.close();
    },
    destroy() {
      drawer.drawerElement.remove();
    },
  };
  (iframe as any)._formcraftsInstance = instance;
  (iframe as any)._formcraftsEvents = {};
  return instance;
}

// Create popup
export function createPopup(options: EmbedPopupOptions) {
  const modalConfig = {
    openClass: "fc-is-open",
    awaitOpenAnimation: true,
    awaitCloseAnimation: true,
  };

  const width = typeof options.width === "undefined" ? 500 : options.width;

  // Create modal elements
  const modalId = `fc-modal-${options.form}`;

  // Check if modal exists
  if (document.getElementById(modalId)) {
    const existingModal = document.getElementById(modalId);
    const existingDrawer = (existingModal as any).drawerInstance as Drawer;
    return createPopupReturn(existingDrawer, options);
  }

  // Get / create style
  if (!document.getElementById("fc-modal-css")) {
    const style = document.createElement("style");
    style.id = "fc-modal-css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  const modal = document.createElement("div");
  modal.id = modalId;
  modal.classList.add("fc-modal");
  modal.ariaHidden = "true";

  const modalContainer = document.createElement("div");
  modalContainer.style.maxWidth = `min(90vw,${width}px)`;
  modalContainer.style.visibility = "hidden";
  modalContainer.role = "dialog";
  modalContainer.setAttribute("aria-modal", "true");
  modalContainer.classList.add("fc-modal__container");

  // Create form iframe
  const iframe = document.createElement("iframe");
  createEventListeners(iframe, options, "popup");

  iframe.dataset.src = buildIframeSrcPopup(options);
  iframe.title = "Formcrafts popup form";
  iframe.style.border = "none";
  iframe.style.width = "100%";
  iframe.ariaLabel = "Formcrafts popup form";
  iframe.name = "formcrafts-popup-iframe";
  iframe.style.willChange = "height";
  iframe.style.position = "static";
  iframe.style.transition = "height 0ms linear";
  iframe.style.willChange = "height";
  iframe.onload = () => {
    modalContainer.style.visibility = "visible";
    iframe.contentWindow?.postMessage({
      type: "url",
      content: window.location.href,
    }, "*");
    iframe.contentWindow?.postMessage({
      type: "values",
      content: options.values,
    }, "*");
  };

  modal.appendChild(modalContainer);
  modalContainer.appendChild(iframe);

  if (options.appendTo) {
    options.appendTo.appendChild(modal);
  } else {
    document.body.appendChild(modal);
  }
  const myDrawer = new Drawer(modal, modalConfig);
  return createPopupReturn(myDrawer, options);
}
