import { Chip } from '#uilib/components/ui/Chip';
import { SignalCard } from '#uilib/components/ui/SignalCard';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('SignalCard', () => {
  it('renders every content slot', () => {
    const { container } = render(
      <SignalCard
        kicker="Forecast"
        icon={<span data-testid="icon">I</span>}
        title="Iron ore 62% Fe"
        subtitle="CFR China, monthly"
        value="112.40"
        unit="/t"
        tolerance="± 0.8"
        description="Model output, updated daily."
        delta={
          <Chip variant="positive" trend="up">
            +2.4%
          </Chip>
        }
        meta={['3m horizon', '87% confidence']}
        sparkline={<svg data-testid="sparkline" />}
      />,
    );

    expect(screen.getByText('Forecast')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Iron ore 62% Fe')).toBeInTheDocument();
    expect(screen.getByText('CFR China, monthly')).toBeInTheDocument();
    expect(screen.getByText('112.40')).toBeInTheDocument();
    expect(screen.getByText('/t')).toBeInTheDocument();
    expect(screen.getByText('± 0.8')).toBeInTheDocument();
    expect(
      screen.getByText('Model output, updated daily.'),
    ).toBeInTheDocument();
    expect(screen.getByText('+2.4%')).toBeInTheDocument();
    expect(screen.getByText('3m horizon')).toBeInTheDocument();
    expect(screen.getByText('87% confidence')).toBeInTheDocument();
    expect(screen.getByTestId('sparkline')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="signal-card"]')).not.toBeNull();
  });

  it('omits the header block when icon, title and subtitle are absent', () => {
    const { container } = render(<SignalCard value="42" />);
    expect(container.querySelector('[data-slot="card-header"]')).toBeNull();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('omits the footer when there is no delta and no meta', () => {
    const { container } = render(<SignalCard title="Title" value="42" />);
    expect(container.querySelector('[data-slot="card-footer"]')).toBeNull();
  });

  it('renders the footer when only meta is provided', () => {
    const { container } = render(
      <SignalCard value="42" meta={['6m horizon']} />,
    );
    expect(container.querySelector('[data-slot="card-footer"]')).not.toBeNull();
    expect(screen.getByText('6m horizon')).toBeInTheDocument();
  });

  it('omits the figure when no value is given', () => {
    const { container } = render(<SignalCard title="No figure" />);
    expect(container.querySelector('.figure')).toBeNull();
  });

  it('renders arbitrary children inside the card', () => {
    render(
      <SignalCard value="42">
        <p data-testid="extra">Extra body</p>
      </SignalCard>,
    );
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });

  it('merges custom className and forwards extra props', () => {
    render(<SignalCard className="custom" data-testid="card" value="1" />);
    const card = screen.getByTestId('card');
    expect(card.className).toContain('custom');
    expect(card.className).toContain('root');
  });
});
