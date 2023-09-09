export declare function extractPathParams(pattern: string, path: string): string[];
export declare class RouterComponent extends HTMLElement {
    private fragment;
    private popStateChangedListener;
    private routeElements;
    private shownRouteElements;
    private previousLocation;
    private clickedLinkListener;
    private historyChangeStates;
    private originalDocumentTitle;
    private invalid;
    constructor();
    connectedCallback(): void;
    getRouteElementByPath(pathname: string): Element | undefined;
    private get storedScrollPosition();
    private set storedScrollPosition(value);
    private scrollToHash;
    private handleHash;
    /**
     * @deprecated since 0.15.0
     * TODO: remove this in next major version
     */
    show: (location: string) => Promise<void>;
    showRoute(location: string): Promise<void>;
    hideRoute(location?: string): Promise<void>;
    get location(): Location;
    disconnectedCallback(): void;
    clickedLink(link: HTMLAnchorElement, e: Event): void;
    bindLinks(): void;
    unbindLinks(): void;
    private matchPathWithRegex;
    /**
     * Returns href without the hostname and stuff.
     * @param location
     * @returns
     */
    private getFullPathname;
    private popStateChanged;
    private setupElement;
    private teardownElement;
    private getExternalRouterByPath;
}
