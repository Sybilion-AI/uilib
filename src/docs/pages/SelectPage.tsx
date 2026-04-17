import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#uilib/components/ui/Select';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SelectPage() {
  const [v, setV] = useState('apple');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Select' }]}
        title="Select"
        subheader="Radix select."
        actions={<DocsHeaderActions />}
      />
      <Select value={v} onValueChange={setV}>
        <SelectTrigger style={{ width: 200 }}>
          <SelectValue placeholder="Pick fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
