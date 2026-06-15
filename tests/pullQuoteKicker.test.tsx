import { Kicker } from '#uilib/components/ui/Kicker';
import { PullQuote } from '#uilib/components/ui/PullQuote';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('PullQuote', () => {
  it('renders the quote body inside a blockquote', () => {
    const { container } = render(
      <PullQuote>Prices are sticky on the way up.</PullQuote>,
    );
    const quote = container.querySelector('blockquote');
    expect(quote).not.toBeNull();
    expect(quote).toHaveTextContent('Prices are sticky on the way up.');
    expect(container.querySelector('[data-slot="pull-quote"]')).not.toBeNull();
  });

  it('renders attribution with role in a figcaption', () => {
    const { container } = render(
      <PullQuote attribution="Jane Doe" attributionRole="Head of research">
        Quote
      </PullQuote>,
    );
    const caption = container.querySelector('figcaption');
    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent('Jane Doe');
    expect(caption).toHaveTextContent('Head of research');
  });

  it('renders attribution without a role', () => {
    const { container } = render(
      <PullQuote attribution="Jane Doe">Quote</PullQuote>,
    );
    const caption = container.querySelector('figcaption');
    expect(caption).toHaveTextContent('Jane Doe');
    expect(container.querySelector('.role')).toBeNull();
  });

  it('omits the figcaption when there is no attribution', () => {
    const { container } = render(<PullQuote>Quote</PullQuote>);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('merges custom className and forwards extra props', () => {
    render(
      <PullQuote className="custom" data-testid="quote">
        Quote
      </PullQuote>,
    );
    const figure = screen.getByTestId('quote');
    expect(figure.className).toContain('custom');
    expect(figure.className).toContain('root');
  });
});

describe('Kicker', () => {
  it('renders the label with the kicker slot', () => {
    render(<Kicker>Market signal</Kicker>);
    const kicker = screen.getByText('Market signal');
    expect(kicker).toHaveAttribute('data-slot', 'kicker');
  });

  it('renders no leading dash by default', () => {
    render(<Kicker data-testid="kicker">Label</Kicker>);
    expect(screen.getByTestId('kicker').textContent).toBe('Label');
  });

  it('renders a leading em-dash when dash is set', () => {
    render(
      <Kicker dash data-testid="kicker">
        Label
      </Kicker>,
    );
    expect(screen.getByTestId('kicker').textContent).toBe('\u2014 Label');
  });

  it('merges custom className and forwards extra props', () => {
    render(
      <Kicker className="custom" data-testid="kicker">
        Label
      </Kicker>,
    );
    const kicker = screen.getByTestId('kicker');
    expect(kicker.className).toContain('custom');
    expect(kicker.className).toContain('root');
  });
});
