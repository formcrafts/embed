type DrawerOptions = {
    openClass?: string;
    onClose?: () => void;
    onOpen?: () => void;
    awaitOpenAnimation?: boolean;
    awaitCloseAnimation?: boolean;
};
declare class Drawer {
    drawerElement: HTMLElement;
    private options;
    constructor(drawerElement: HTMLElement, options: DrawerOptions);
    private bindEvents;
    open(): void;
    private afterOpen;
    close(): void;
    private afterClose;
}
export default Drawer;
