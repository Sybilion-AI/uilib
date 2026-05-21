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
import { PackageIcon } from '@phosphor-icons/react';

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
        <Card paddingSize="m" style={{ maxWidth: 360 }}>
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
      </PageContentSection>
    </>
  );
}
