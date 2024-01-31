type DrawerOptions = {
  openClass?: string;
  onClose?: () => void;
  onOpen?: () => void;
  awaitOpenAnimation?: boolean;
  awaitCloseAnimation?: boolean;
};

class Drawer {
  constructor(
    public drawerElement: HTMLElement,
    private options: DrawerOptions,
  ) {
    (drawerElement as any).drawerInstance = this;
    drawerElement.classList.add("fc-modal");
    this.bindEvents();
  }

  private bindEvents(): void {
    this.drawerElement.querySelector(".handle")?.addEventListener(
      "touchstart",
      (e) => this.close(),
    );
    this.drawerElement.addEventListener("click", (e: MouseEvent) => {
      if (e.target === this.drawerElement) this.close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }

  public open(): void {
    document.body.style.overflow = "hidden";
    if (this.options.awaitOpenAnimation) {
      this.drawerElement.addEventListener("animationend", () => {
        this.afterOpen();
      }, { once: true });
    }
    this.drawerElement.setAttribute("aria-hidden", "false");

    this.drawerElement.classList.add(this.options.openClass || "open");

    if (!this.options.awaitOpenAnimation) {
      this.afterOpen();
    }
  }

  private afterOpen(): void {
    if (this.options.onOpen) this.options.onOpen();
  }

  public close(): void {
    document.body.style.overflow = "";
    this.drawerElement.setAttribute("aria-hidden", "true");
    if (this.options.awaitCloseAnimation) {
      this.drawerElement.addEventListener("animationend", () => {
        this.afterClose();
      }, { once: true });
    }

    if (!this.options.awaitCloseAnimation) {
      this.afterClose();
    }
  }

  private afterClose(): void {
    this.drawerElement.classList.remove(this.options.openClass || "open");
    if (this.options.onClose) this.options.onClose();
  }
}

export default Drawer;
