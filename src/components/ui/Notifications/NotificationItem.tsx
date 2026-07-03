import cn from 'classnames';
import { Component } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Loader2, XIcon } from 'lucide-react';

import S from './Notifications.styl';
import type { NotificationItemProps } from './Notifications.types';

const TOUCH_MOVE_THRESHOLD = 50;

function getTouchPos(e: React.TouchEvent) {
  const { clientX: x, clientY: y } = e.targetTouches[0];
  return { x, y };
}

function getDeltaPos(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
) {
  return {
    x: Math.abs(p2.x - p1.x),
    y: Math.abs(p2.y - p1.y),
  };
}

export class NotificationItem extends Component<NotificationItemProps> {
  startPos: { x: number; y: number } | null = null;

  onTouchStart = (e: React.TouchEvent) => {
    this.startPos = getTouchPos(e);
  };

  onTouchMove = (e: React.TouchEvent) => {
    const { unpause } = this.props;
    if (!this.startPos) return;

    e.stopPropagation();
    const pos = getTouchPos(e);
    const delta = getDeltaPos(this.startPos, pos);

    if (delta.x > delta.y && delta.x > TOUCH_MOVE_THRESHOLD) {
      unpause();
      this.closeMe();
    }
  };

  onTouchEnd = () => {
    this.props.unpause();
    this.startPos = null;
  };

  onTouchCancel = () => {
    this.startPos = null;
  };

  closeMe = () => {
    const { id, close } = this.props;
    close(id);
  };

  renderContent() {
    const { content } = this.props;
    if (content == null) return null;
    return typeof content === 'function' ? content() : content;
  }

  render() {
    const { type, title, visible, pause, unpause } = this.props;

    const typeKey = type ?? 'default';
    const classes = cn(S.item, S[`type-${typeKey}`], visible && S.visible);

    return (
      <div
        className={classes}
        onMouseOver={pause}
        onFocus={pause}
        onMouseOut={unpause}
        onBlur={unpause}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
        onTouchCancel={this.onTouchCancel}
        data-slot="notification-item"
      >
        <div className={S.itemInner}>
          {type === 'loading' && (
            <Loader2 aria-hidden className={cn(S.icon, S.spin)} size={18} />
          )}
          {(title || this.props.content != null) && (
            <div className={S.text}>
              {title && <div className={S.title}>{title}</div>}
              {this.props.content != null && (
                <div className={S.content}>{this.renderContent()}</div>
              )}
            </div>
          )}
          <Button
            variant="link"
            icon
            type="button"
            onClick={this.closeMe}
            className={S.closeButton}
            aria-label="Dismiss notification"
          >
            <XIcon size={16} />
          </Button>
        </div>
      </div>
    );
  }
}
