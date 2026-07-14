import '@testing-library/jest-dom';

import { SidebarMenuButton } from '#uilib/components/ui/Sidebar/SidebarMenuButton/SidebarMenuButton';
import { render } from '@testing-library/react';

// SmartTextTruncate observes element widths on mount; jsdom has no ResizeObserver.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  Object.assign(globalThis, { ResizeObserver: ResizeObserverMock });
});

describe('SidebarMenuButton', () => {
  it('renders a plain button with a truncated label when asChild is false', () => {
    const { container } = render(
      <SidebarMenuButton isActive>Dashboard</SidebarMenuButton>,
    );

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Dashboard');
    expect(button).toHaveAttribute('data-active', 'true');
  });

  it('slots the consumer element via asChild without crashing (regression: Slot single-child error)', () => {
    const { container } = render(
      <SidebarMenuButton asChild isActive>
        <a href="/dashboard">Dashboard</a>
      </SidebarMenuButton>,
    );

    // The consumer's <a> becomes the rendered element, inheriting Button props.
    const link = container.querySelector('a[href="/dashboard"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Dashboard');
    expect(link).toHaveAttribute('data-slot', 'sidebar-menu-button');
    expect(link).toHaveAttribute('data-active', 'true');
    // No leftover <button> — the slot fully replaced it.
    expect(container.querySelector('button')).toBeNull();
  });

  it('injects icon and addon as siblings of the slotted child in the asChild path', () => {
    const { container } = render(
      <SidebarMenuButton
        asChild
        icon={<span data-icon="home" />}
        addon={<span data-addon="badge" />}
      >
        <a href="/reports">Reports</a>
      </SidebarMenuButton>,
    );

    const link = container.querySelector('a[href="/reports"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Reports');
    expect(link?.querySelector('[data-icon="home"]')).toBeInTheDocument();
    expect(link?.querySelector('[data-addon="badge"]')).toBeInTheDocument();
  });

  it('renders a real button (not a slot) when hasSubItems is true, even if asChild is requested', () => {
    const { container } = render(
      <SidebarMenuButton asChild hasSubItems isExpanded>
        <a href="/x">Group</a>
      </SidebarMenuButton>,
    );

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
    // asChild is disabled, so the slot props must NOT land on the consumer <a>.
    const link = container.querySelector('a[href="/x"]');
    expect(link).not.toHaveAttribute('data-slot', 'sidebar-menu-button');
  });
});
