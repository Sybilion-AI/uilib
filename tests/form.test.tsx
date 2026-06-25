import { Button } from '#uilib/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#uilib/components/ui/Form';
import { Input } from '#uilib/components/ui/Input';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { z } from 'zod';

const schema = z.object({ zone: z.string().min(1, 'Pick a zone.') });

function ForecastForm({
  onSubmit = jest.fn(),
}: {
  onSubmit?: (values: { zone: string }) => void;
}) {
  return (
    <Form schema={schema} defaultValues={{ zone: '' }} onSubmit={onSubmit}>
      <FormField
        name="zone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Zone</FormLabel>
            <FormControl>
              <Input placeholder="Pick a zone" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Run forecast</Button>
    </Form>
  );
}

describe('Form', () => {
  it('FormMessage renders nothing when there is no error', () => {
    render(<ForecastForm />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('FormMessage shows validation error with role="alert" after submit', async () => {
    render(<ForecastForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Run forecast' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Pick a zone.');
  });

  it('FormControl sets aria-invalid and aria-describedby when field is invalid', async () => {
    render(<ForecastForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Run forecast' }));
    const message = await screen.findByRole('alert');
    const input = screen.getByPlaceholderText('Pick a zone');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain(message.id);
  });

  it('FormLabel htmlFor matches control id', () => {
    render(<ForecastForm />);
    const label = screen.getByText('Zone');
    const input = screen.getByPlaceholderText('Pick a zone');
    expect(label).toHaveAttribute('for', input.id);
    expect(input.id).toBeTruthy();
  });

  it('calls onSubmit with valid values', async () => {
    const onSubmit = jest.fn();
    render(<ForecastForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Pick a zone'), {
      target: { value: 'EU-West' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run forecast' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { zone: 'EU-West' },
        expect.anything(),
      );
    });
  });

  it('renders a single native form element from root Form', () => {
    const { container } = render(<ForecastForm />);
    expect(container.querySelectorAll('form')).toHaveLength(1);
  });

  it('FormField works without explicit control prop', async () => {
    const onSubmit = jest.fn();
    render(<ForecastForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Pick a zone'), {
      target: { value: 'APAC' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run forecast' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { zone: 'APAC' },
        expect.anything(),
      );
    });
  });
});
