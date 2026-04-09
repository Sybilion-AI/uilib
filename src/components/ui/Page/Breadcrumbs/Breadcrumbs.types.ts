export type BreadcrumbItem =
  | 'client-name'
  | {
      label: string;
      href?: string;
    };
