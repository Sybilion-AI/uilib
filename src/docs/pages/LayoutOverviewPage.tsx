import type { CSSProperties } from 'react';

import { Button } from '#uilib/components/ui/Button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#uilib/components/ui/Card';
import { Foldable } from '#uilib/components/ui/Foldable';
import { GridLayout } from '#uilib/components/ui/GridLayout/GridLayout';
import { InteractiveContent } from '#uilib/components/ui/InteractiveContent';
import {
  PageColumns,
  PageContent,
  PageContentSection,
  PageFooter,
  PageTabs,
} from '#uilib/components/ui/Page';
import { Separator } from '#uilib/components/ui/Separator';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#uilib/components/ui/Sidebar/Sidebar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#uilib/components/ui/Tabs';
import { BadgeCheck } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

const panelStyle: React.CSSProperties = {
  padding: 'var(--p-3)',
  borderRadius: 'var(--radius-3)',
};

const CARD_WIDTH = 280;

const tileStyle: CSSProperties = {
  margin: 0,
  padding: 'var(--p-4)',
  borderRadius: 'var(--p-3)',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--muted)',
};

const columnBlockStyle: CSSProperties = {
  margin: 0,
  padding: 'var(--p-4)',
  borderRadius: 'var(--p-3)',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--muted)',
};

const PAGE_TABS_ITEMS = [
  {
    value: 'tab-a',
    label: 'Overview',
    content: <p style={{ margin: 0 }}>Tab A content.</p>,
  },
  {
    value: 'tab-b',
    label: 'Details',
    content: <p style={{ margin: 0 }}>Tab B content.</p>,
  },
  {
    value: 'tab-c',
    label: 'Settings',
    content: <p style={{ margin: 0 }}>Tab C content.</p>,
  },
];

export default function LayoutOverviewPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Overview' }]}
        title="Overview"
        subheader="Containers, dividers, collapsible sections, and tabbed regions."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Card</h3>
          <div style={panelStyle}>
            <Card paddingSize="m" radiusSize="m" style={{ width: CARD_WIDTH }}>
              <CardHeader
                title="Card title"
                description="Card description"
                icon={<BadgeCheck />}
              />
              <CardContent>
                <p style={{ margin: 0 }}>
                  Simple card with header and body content.
                </p>
              </CardContent>

              <CardFooter>
                <Button variant="secondary">Cancel</Button>
                <Button>Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Separator</h3>
          <div style={panelStyle}>
            <p style={{ margin: 0 }}>Above</p>
            <Separator style={{ margin: '12px 0' }} />
            <p style={{ margin: 0 }}>Below</p>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Foldable</h3>
          <div style={panelStyle}>
            <Foldable
              header={<span>Click to expand</span>}
              content={<p style={{ margin: 0 }}>Hidden content inside.</p>}
              defaultUnfolded
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Tabs</h3>
          <div style={panelStyle}>
            <Tabs defaultValue="alpha" style={{ maxWidth: 360 }}>
              <TabsList>
                <TabsTrigger value="alpha">Alpha</TabsTrigger>
                <TabsTrigger value="beta">Beta</TabsTrigger>
              </TabsList>
              <TabsContent value="alpha">Panel A content.</TabsContent>
              <TabsContent value="beta">Panel B content.</TabsContent>
            </Tabs>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>GridLayout</h3>
          <div style={panelStyle}>
            <GridLayout colWidth={180} gap="var(--p-4)">
              <p style={tileStyle}>Item A</p>
              <p style={tileStyle}>Item B</p>
              <p style={tileStyle}>Item C</p>
            </GridLayout>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>InteractiveContent</h3>
          <div style={panelStyle}>
            <InteractiveContent text="Use **bold** and [links](/docs) in assistant-style text." />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Page</h3>
          <div
            style={{
              ...panelStyle,
              border: '1px dashed var(--border)',
            }}
          >
            <PageContent>
              <PageContentSection>
                <p style={{ margin: 0 }}>First section content.</p>
              </PageContentSection>
              <PageContentSection>
                <p style={{ margin: 0 }}>Second section content.</p>
              </PageContentSection>
            </PageContent>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>PageColumns</h3>
          <div style={panelStyle}>
            <PageColumns
              columns={[
                <p key="a" style={columnBlockStyle}>
                  Column A
                </p>,
                <p key="b" style={columnBlockStyle}>
                  Column B
                </p>,
              ]}
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>PageFooter</h3>
          <div
            style={{
              ...panelStyle,
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <PageFooter versionLink="" versionLabel="0.0.0" />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>PageTabs</h3>
          <div style={panelStyle}>
            <PageTabs
              defaultValue={PAGE_TABS_ITEMS[0].value}
              items={PAGE_TABS_ITEMS}
            />
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: '1rem' }}>Sidebar</h3>
          <div style={panelStyle}>
            <SidebarGroup
              style={{
                maxWidth: 320,
                padding: 12,
                background: 'var(--sidebar)',
                color: 'var(--sidebar-foreground)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--p-4)',
              }}
            >
              <SidebarGroupLabel>Group label</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton type="button" isActive>
                    Active item
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton type="button">
                    Another item
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </div>
        </section>

        {/* StandaloneAppLayout and SybilionAuthLayout excluded — full shell demos */}
      </PageContentSection>
    </>
  );
}
