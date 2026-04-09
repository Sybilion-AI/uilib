export declare function useQueryParams(): {
    searchParams: URLSearchParams;
    addSearchParams: (params: Record<string, string>) => void;
    removeSearchParams: (keys: string[] | string) => void;
};
