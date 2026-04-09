export interface DrawerProps {
  shouldScaleBackground?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  dismissible?: boolean;
  noBodyStyles?: boolean;
  children?: React.ReactNode;
}

export interface DrawerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export interface DrawerPortalProps {
  children?: React.ReactNode;
  container?: HTMLElement;
}

export interface DrawerCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export interface DrawerOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface DrawerHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface DrawerFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface DrawerTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface DrawerDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
