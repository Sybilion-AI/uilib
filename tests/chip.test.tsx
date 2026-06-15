import { Chip } from '#uilib/components/ui/Chip';
import type { ChipVariant } from '#uilib/components/ui/Chip';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

const ALL_VARIANTS: ChipVariant[] = [
  'neutral',
  'line',
  'active',
  'filled',
  'accent',
  'positive',
  'negative',
];

describe('Chip', () => {
  it('renders children with the chip slot', () => {
    render(<Chip>Stable</Chip>);
    const chip = screen.getByText('Stable');
    expect(chip).toHaveAttribute('data-slot', 'chip');
  });

  it.each(ALL_VARIANTS)('applies the %s variant class', variant => {
    render(<Chip variant={variant}>Label</Chip>);
    expect(screen.getByText('Label').className).toContain(`variant-${variant}`);
  });

  it('defaults to the neutral variant', () => {
    render(<Chip>Label</Chip>);
    expect(screen.getByText('Label').className).toContain('variant-neutral');
  });

  it('shows the status dot by default only for the neutral variant', () => {
    const { container: neutral } = render(<Chip>Neutral</Chip>);
    expect(neutral.querySelector('.dot')).not.toBeNull();

    const { container: positive } = render(<Chip variant="positive">Up</Chip>);
    expect(positive.querySelector('.dot')).toBeNull();
  });

  it('honours an explicit dot override', () => {
    const { container: hidden } = render(<Chip dot={false}>Neutral</Chip>);
    expect(hidden.querySelector('.dot')).toBeNull();

    const { container: shown } = render(
      <Chip variant="positive" dot>
        Up
      </Chip>,
    );
    expect(shown.querySelector('.dot')).not.toBeNull();
  });

  it('renders an upward trend arrow', () => {
    const { container } = render(
      <Chip variant="positive" trend="up">
        +2.4%
      </Chip>,
    );
    expect(container.querySelector('svg.lucide-trending-up')).not.toBeNull();
    expect(container.querySelector('svg.lucide-trending-down')).toBeNull();
  });

  it('renders a downward trend arrow', () => {
    const { container } = render(
      <Chip variant="negative" trend="down">
        -1.1%
      </Chip>,
    );
    expect(container.querySelector('svg.lucide-trending-down')).not.toBeNull();
  });

  it('renders no trend arrow by default', () => {
    const { container } = render(<Chip>Flat</Chip>);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('merges custom className and forwards extra props', () => {
    render(
      <Chip className="custom" data-testid="chip">
        Label
      </Chip>,
    );
    const chip = screen.getByTestId('chip');
    expect(chip.className).toContain('custom');
    expect(chip.className).toContain('root');
  });
});
