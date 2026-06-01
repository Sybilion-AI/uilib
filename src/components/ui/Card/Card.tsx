import cn from 'classnames';
import {
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  HTMLAttributes,
  useEffect,
  useRef,
} from 'react';

import { TextWithDeferTooltip } from '#uilib/components/ui/TextWithDeferTooltip';
import { Scroll } from '@homecode/ui';

import S from './Card.styl';
import type {
  CardActionProps,
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from './Card.types';

const SCROLL_OFFSET = 300;

function Card({ className, paddingSize = 'm', ...props }: CardProps) {
  return (
    <div
      className={cn(S.root, S[`padding-${paddingSize}`], className)}
      {...props}
    />
  );
}

function LinkCard({
  className,
  ...props
}: CardProps &
  DetailedHTMLProps<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      data-slot="link-card"
      className={cn(S.root, className)}
      {...props}
    />
  );
}

function CardHeader({
  className,
  icon,
  iconWithBackground = false,
  textsClassName,
  title,
  titleClassName,
  description,
  descriptionClassName,
  children,
  tooltipProps,
  ...props
}: CardHeaderProps) {
  return (
    <div data-slot="card-header" className={cn(S.header, className)} {...props}>
      {icon && (
        <div className={cn(S.icon, iconWithBackground && S.withBackground)}>
          {icon}
        </div>
      )}
      {children}
      {(title || description) && (
        <div className={cn(S.headerText, textsClassName)}>
          {title && (
            <CardTitle className={titleClassName} {...tooltipProps}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={descriptionClassName} {...tooltipProps}>
              {description}
            </CardDescription>
          )}
        </div>
      )}
    </div>
  );
}

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <TextWithDeferTooltip
      maxWidth={400}
      data-slot="card-title"
      className={cn(S.title, className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <TextWithDeferTooltip
      maxWidth={400}
      data-slot="card-description"
      className={cn(S.description, className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(S.action, className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  centered,
  fullHeight,
  noScroll,
  children,
  autoScrollBottom,
  yScrollbarClassName,
  ...props
}: CardContentProps) {
  const scrollInnerRef = useRef<HTMLDivElement | null>(null);

  const contentDiv = (
    <div
      data-slot="card-content"
      className={cn(
        className,
        centered && S.centered,
        fullHeight && S.fullHeight,
      )}
      {...props}
    >
      {children}
    </div>
  );

  useEffect(() => {
    if (!noScroll && autoScrollBottom) {
      const inner = scrollInnerRef.current;

      if (!inner) return;

      if (inner.scrollHeight > SCROLL_OFFSET) {
        inner.scrollTo({
          top: inner?.scrollHeight - inner.offsetHeight - SCROLL_OFFSET,
          behavior: 'instant',
        });
      }

      setTimeout(() => {
        const top = inner.scrollHeight + 1000;
        inner.scrollTo({ top, behavior: 'smooth' });
      }, 0);
    }
  }, [noScroll, autoScrollBottom]);

  if (noScroll) return contentDiv;

  return (
    <Scroll
      y
      autoHide
      fadeSize="m"
      className={S.scroll}
      yScrollbarClassName={yScrollbarClassName}
      onInnerRef={el => {
        scrollInnerRef.current = el;
      }}
    >
      {contentDiv}
    </Scroll>
  );
}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(S.footer, className)}
      {...props}
    />
  );
}

export {
  Card,
  LinkCard,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
