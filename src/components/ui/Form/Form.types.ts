import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type {
  ControllerProps,
  DefaultValues,
  FieldPath,
  FieldValues,
  Resolver,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';

import type { z } from 'zod';

export type FormProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  ComponentPropsWithoutRef<'form'>,
  'onSubmit' | 'children'
> & {
  schema?: z.ZodType<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  resolver?: Resolver<TFieldValues>;
  formOptions?: Omit<UseFormProps<TFieldValues>, 'defaultValues' | 'resolver'>;
  form?: UseFormReturn<TFieldValues>;
  children?: ReactNode;
  className?: string;
};

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'control'>;
