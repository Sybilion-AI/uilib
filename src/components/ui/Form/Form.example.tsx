import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { Checkbox } from '#uilib/components/ui/Checkbox';
import { Dialog } from '#uilib/components/ui/Dialog';
import { Input } from '#uilib/components/ui/Input';
import { PageContentSection } from '#uilib/components/ui/Page';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#uilib/components/ui/Select';
import { Switch } from '#uilib/components/ui/Switch';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './Form';

const REGION_OPTIONS = [
  { value: 'eu-west', label: 'EU West' },
  { value: 'us-east', label: 'US East' },
  { value: 'apac', label: 'APAC' },
] as const;

const schema = z.object({
  name: z.string().min(1, 'Enter a name.'),
  notes: z.string().optional(),
  region: z.string().min(1, 'Pick a region.'),
  notifications: z.boolean(),
  termsAccepted: z.boolean().refine(value => value, {
    message: 'Accept the terms to continue.',
  }),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  notes: '',
  region: '',
  notifications: false,
  termsAccepted: false,
};

export function FormExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(
    null,
  );

  const handleSubmit = (values: FormValues) => {
    setSubmittedValues(values);
    setDialogOpen(true);
  };

  return (
    <PageContentSection>
      <Form
        schema={schema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          width: '300px',
        }}
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input
                  type="textarea"
                  placeholder="Optional notes"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger style={{ width: '100%' }}>
                    <SelectValue placeholder="Pick a region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REGION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="notifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email notifications</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="termsAccepted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </Form>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Submitted values"
        content={
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {submittedValues ? JSON.stringify(submittedValues, null, 2) : ''}
          </pre>
        }
        footer={
          <Button type="button" onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        }
      />
    </PageContentSection>
  );
}
