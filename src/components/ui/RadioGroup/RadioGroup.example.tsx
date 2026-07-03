import { useState } from 'react';

import { Label } from '#uilib/components/ui/Label';
import { PageContentSection } from '#uilib/components/ui/Page';

import { RadioGroup, RadioGroupItem } from './RadioGroup';

const SIZES = ['sm', 'md', 'lg'] as const;

const PLAN_OPTIONS = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
] as const;

function OptionRow({
  id,
  value,
  label,
}: {
  id: string;
  value: string;
  label: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

export function RadioGroupExample() {
  const [plan, setPlan] = useState('pro');

  return (
    <PageContentSection
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <section>
        <h3 style={{ marginBottom: '1rem' }}>Sizes</h3>

        {SIZES.map(s => (
          <td
            key={s}
            style={{ padding: '0.1rem', display: 'flex', alignItems: 'center' }}
          >
            <RadioGroup
              size={s}
              id={`rg-size-${s}`}
              aria-label={`Size ${s} row`}
              defaultValue="starter"
            >
              <RadioGroupItem value="starter" aria-label={`${s}`} />
            </RadioGroup>
            &nbsp;–&nbsp;
            <Label htmlFor={`rg-size-${s}`}>{s}</Label>
          </td>
        ))}
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem' }}>Vertical (default)</h3>
        <RadioGroup defaultValue="starter" aria-label="Billing plan">
          {PLAN_OPTIONS.map(option => (
            <OptionRow
              key={option.value}
              id={`rg-vertical-${option.value}`}
              value={option.value}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem' }}>Horizontal</h3>
        <RadioGroup
          defaultValue="pro"
          orientation="horizontal"
          aria-label="Billing plan horizontal"
        >
          {PLAN_OPTIONS.map(option => (
            <OptionRow
              key={option.value}
              id={`rg-horizontal-${option.value}`}
              value={option.value}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem' }}>Controlled</h3>
        <p
          style={{
            margin: '0 0 1rem',
            color: 'var(--muted-foreground)',
            fontSize: 'var(--text-sm)',
          }}
        >
          Selected plan: {plan}
        </p>
        <RadioGroup
          value={plan}
          onValueChange={setPlan}
          aria-label="Billing plan controlled"
        >
          {PLAN_OPTIONS.map(option => (
            <OptionRow
              key={option.value}
              id={`rg-controlled-${option.value}`}
              value={option.value}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem' }}>Disabled</h3>
        <RadioGroup defaultValue="starter" disabled aria-label="Disabled plan">
          {PLAN_OPTIONS.map(option => (
            <OptionRow
              key={option.value}
              id={`rg-disabled-${option.value}`}
              value={option.value}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </section>
    </PageContentSection>
  );
}
