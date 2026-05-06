import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#uilib/components/ui/Tabs';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function TabsPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Tabs' }]}
        title="Tabs"
        subheader="Tabbed panels."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <Tabs defaultValue="a" style={{ maxWidth: 400 }}>
          <TabsList>
            <TabsTrigger value="a">Tab A</TabsTrigger>
            <TabsTrigger value="b">Tab B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Content for tab A.</TabsContent>
          <TabsContent value="b">Content for tab B.</TabsContent>
        </Tabs>
      </PageContentSection>
    </>
  );
}
