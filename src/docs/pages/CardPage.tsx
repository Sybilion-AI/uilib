import { Button } from '#uilib/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  LinkCard,
} from '#uilib/components/ui/Card';
import CardGuidance from '#uilib/components/ui/Card/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';
import { PackageIcon } from '@phosphor-icons/react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const PADDING_SIZES = ['s', 'm', 'l'] as const;
const RADIUS_SIZES = ['s', 'm', 'l', 'xl'] as const;

const CARD_WIDTH = 280;

export default function CardPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Card' }]}
        title="Card"
        subheader="Padding and radius sizes, slot compositions, and link card."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={CardGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Padding sizes</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            {PADDING_SIZES.map(p => (
              <Card
                key={p}
                paddingSize={p}
                radiusSize={p}
                style={{ width: CARD_WIDTH }}
              >
                <CardHeader title={`Padding "${p}"`} />
                <CardContent>
                  <p style={{ margin: 0 }}>
                    Inner padding via <code>paddingSize="{p}"</code>.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Radius sizes</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            {RADIUS_SIZES.map(r => (
              <Card
                key={r}
                radiusSize={r}
                paddingSize="s"
                style={{ width: CARD_WIDTH }}
              >
                <CardHeader title={`Radius "${r}"`} />
                <CardContent>
                  <p style={{ margin: 0 }}>
                    Corner radius via <code>radiusSize="{r}"</code>.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Slot compositions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                    composition
                  </th>
                  <th style={{ padding: '0.5rem' }}>preview</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}
                  >
                    header + content + footer
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <Card
                      paddingSize="m"
                      radiusSize="xl"
                      style={{ width: CARD_WIDTH }}
                    >
                      <CardHeader
                        icon={<PackageIcon />}
                        title="Card title"
                        description="Supporting description text."
                      />
                      <CardContent>
                        <p style={{ margin: 0 }}>Main content area.</p>
                      </CardContent>
                      <CardFooter>
                        <Button type="button" size="sm">
                          Action
                        </Button>
                      </CardFooter>
                    </Card>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}
                  >
                    header + content
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <Card
                      paddingSize="m"
                      radiusSize="xl"
                      style={{ width: CARD_WIDTH }}
                    >
                      <CardHeader
                        title="No footer"
                        description="Content only below the header."
                      />
                      <CardContent>
                        <p style={{ margin: 0 }}>Main content area.</p>
                      </CardContent>
                    </Card>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}
                  >
                    content only
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <Card
                      paddingSize="m"
                      radiusSize="xl"
                      style={{ width: CARD_WIDTH }}
                    >
                      <CardContent>
                        <CardTitle>Standalone title</CardTitle>
                        <div style={{ marginTop: '0.25rem' }}>
                          <CardDescription>
                            Content without a separate header slot.
                          </CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: '0.5rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}
                  >
                    icon with background
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <Card
                      paddingSize="m"
                      radiusSize="xl"
                      style={{ width: CARD_WIDTH }}
                    >
                      <CardHeader
                        icon={<PackageIcon />}
                        iconWithBackground
                        title="Icon background"
                        description="iconWithBackground on CardHeader."
                      />
                      <CardContent>
                        <p style={{ margin: 0 }}>Main content area.</p>
                      </CardContent>
                    </Card>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Link card</h3>
          <p
            style={{
              marginBottom: '0.75rem',
              color: 'var(--muted-foreground)',
            }}
          >
            <code>LinkCard</code> renders the card shell as an anchor for
            external navigation.
          </p>
          <LinkCard
            href="https://example.com"
            style={{
              width: CARD_WIDTH,
              textDecoration: 'none',
              padding: 'var(--p-6)',
            }}
          >
            <CardHeader title="External link" />
            <CardContent>
              <p style={{ margin: 0 }}>Opens in a new tab.</p>
            </CardContent>
          </LinkCard>
        </section>
      </PageContentSection>
    </>
  );
}
