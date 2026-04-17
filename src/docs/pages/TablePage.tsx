import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#uilib/components/ui/Table';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function TablePage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Table' }]}
        title="Table"
        subheader="Semantic table primitives."
        actions={<DocsHeaderActions />}
      />
      <Table withBackground withPaddings>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob</TableCell>
            <TableCell>Viewer</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}
