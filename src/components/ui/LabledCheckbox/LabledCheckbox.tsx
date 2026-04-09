import cn from 'classnames';

import { Checkbox } from '../Checkbox';

interface LabledCheckboxProps extends React.ComponentProps<typeof Checkbox> {
  label: string;
}

export const LabledCheckbox = ({
  id,
  label,
  className,
  ...props
}: LabledCheckboxProps) => {
  return (
    <div className={cn(className)}>
      <Checkbox id={id} {...props} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
