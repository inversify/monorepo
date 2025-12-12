import Link, { Props } from '@docusaurus/Link';
import clsx from 'clsx';
import { MouseEventHandler } from 'react';

enum ButtonPropSize {
  large = 'lg',
  medium = 'md',
  small = 'sm',
}

interface ButtonProps {
  readonly block?: boolean | undefined;
  readonly className?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly label?: string | undefined;
  readonly link?: string | undefined;
  readonly onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  readonly outline?: boolean | undefined;
  readonly size?: ButtonPropSize | undefined;
  readonly style?: React.CSSProperties | undefined;
  readonly variant?: string | undefined;
}

export function Button({
  block = false,
  className,
  disabled = false,
  onClick,
  outline = false,
  label,
  link,
  size,
  style,
  variant = 'primary',
}: ButtonProps): React.ReactElement {
  const sizeClass: string =
    size === ButtonPropSize.large || size === ButtonPropSize.small
      ? `button--${size}`
      : '';
  const outlineClass: string = outline ? 'button--outline' : '';
  const variantClass: string = `button--${variant}`;
  const blockClass: string = block ? 'button--block' : '';
  const disabledClass: string = disabled ? 'disabled' : '';
  const destination: string | null = disabled ? null : (link ?? null);

  const linkProps: Props = destination === null ? {} : { to: destination };

  return (
    <Link {...linkProps}>
      <button
        aria-disabled={disabled}
        className={clsx(
          'button',
          sizeClass,
          outlineClass,
          variantClass,
          blockClass,
          disabledClass,
          className,
        )}
        onClick={onClick}
        role="button"
        style={style}
      >
        {label}
      </button>
    </Link>
  );
}
