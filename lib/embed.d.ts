type EmbedOptions = {
    form: string;
    target: HTMLElement;
    redirectWithin?: boolean;
    seamless?: boolean;
    width?: number | null;
    values?: Record<string, string | string[]>;
    formBase?: string;
    _params?: URLSearchParams;
};
type EmbedPopupOptions = {
    form: string;
    width?: number | null;
    redirectWithin?: boolean;
    appendTo?: HTMLElement;
    values?: Record<string, string | string[]>;
    formBase?: string;
    _params?: URLSearchParams;
};
export declare function observeVisibility(targets: Element | Element[], callback: () => void): void;
/**
 * Creates an inline form using an iframe.
 *
 * @param {EmbedOptions} options - The options for the form.
 * @returns {ReturnType} The return type of the createReturn function.
 */
export declare function createInlineForm(options: EmbedOptions): {
    on(event: string, callback: Function): void;
    values(values: Record<string, string | string[]>): void;
    destroy(): void;
};
export declare function createPopup(options: EmbedPopupOptions): {
    on(event: string, callback: Function): void;
    load(): void;
    values(values: Record<string, string | string[]>): void;
    open(): void;
    close(): void;
    destroy(): void;
};
export {};
