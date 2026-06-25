import cn from 'classnames';
import {
  type ComponentProps,
  type HTMLAttributes,
  createContext,
  useContext,
  useId,
} from 'react';
import {
  Controller,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type Resolver,
  type UseFormReturn,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { Label } from '#uilib/components/ui/Label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Slot } from '@radix-ui/react-slot';

import S from './Form.styl';
import type { FormFieldProps, FormProps } from './Form.types';

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

type FormItemContextValue = {
  id: string;
};

const FormItemContext = createContext<FormItemContextValue | null>(null);

/**
 * Root validated form. Owns `useForm`, applies `zodResolver(schema)` when `schema` is
 * passed, and renders a native `<form>` wired to `onSubmit`. Wrap fields in {@link FormField}.
 */
function Form<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  resolver,
  formOptions,
  form: externalForm,
  className,
  children,
  ...formHTMLProps
}: FormProps<TFieldValues>) {
  const internalForm = useForm<TFieldValues>({
    defaultValues,
    resolver:
      resolver ??
      (schema ? (zodResolver(schema) as Resolver<TFieldValues>) : undefined),
    ...formOptions,
  });

  const methods: UseFormReturn<TFieldValues> = externalForm ?? internalForm;

  return (
    <FormProvider {...methods}>
      <form
        data-slot="form"
        className={cn(className)}
        onSubmit={methods.handleSubmit(onSubmit)}
        {...formHTMLProps}
      >
        {children}
      </form>
    </FormProvider>
  );
}

/**
 * Connects a field to react-hook-form via `Controller`. Reads `control` from the nearest
 * {@link Form} context — do not pass `control` manually. Must wrap {@link FormItem} inside `render`.
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: FormFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} control={control} />
    </FormFieldContext.Provider>
  );
}

/** Vertical field shell; generates stable ids for label, control, description, and message. */
function FormItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn(S.item, className)} {...props} />
    </FormItemContext.Provider>
  );
}

/**
 * Field metadata for {@link FormLabel}, {@link FormControl}, {@link FormDescription}, and
 * {@link FormMessage}. Requires {@link FormField} + {@link FormItem} ancestors.
 */
function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, control } = useFormContext();
  const formState = useFormState({ control, name: fieldContext?.name });
  const fieldState = getFieldState(fieldContext?.name ?? '', formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  if (!itemContext) {
    throw new Error('useFormField should be used within <FormItem>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

/** Accessible label linked to the control id from {@link FormItem}. */
function FormLabel({ className, ...props }: ComponentProps<typeof Label>) {
  const { formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      className={cn(className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * Slot wrapper for the actual input. Forwards `id`, `aria-invalid`, and `aria-describedby`
 * so uilib controls show validation styling (P-07 inline errors).
 */
function FormControl({ ...props }: ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

/** Optional helper text below the label; referenced by `aria-describedby` on {@link FormControl}. */
function FormDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn(S.description, className)}
      {...props}
    />
  );
}

/**
 * Inline validation message (`role="alert"`). Shows `fieldState.error.message` when present;
 * omit for empty fields — never use toast for field errors.
 */
function FormMessage({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      role="alert"
      className={cn(S.message, className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
