import { Button } from '#uilib/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#uilib/components/ui/Card';
import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function CardPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Card' }]}
        title="Card"
        subheader="Container with header, content, and footer slots."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection>
        <Card paddingSize="s" style={{ maxWidth: 360 }}>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Supporting description text.</CardDescription>
          </CardHeader>
          <CardContent>
            <p style={{ margin: 0 }}>Main content area.</p>
          </CardContent>
          <CardFooter>
            <Button type="button" size="sm">
              Action
            </Button>
          </CardFooter>
        </Card>
      </PageContentSection>
    </>
  );
}
