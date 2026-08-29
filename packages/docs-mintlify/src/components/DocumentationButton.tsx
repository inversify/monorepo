interface DocumentationButtonProps {
  children?: unknown;
  href: string;
  target?: string;
}

export default function DocumentationButton({
  children,
  href,
  target,
}: DocumentationButtonProps) {
  return (
    <a href={href} target={target} rel="noopener noreferrer">
      {children}
    </a>
  );
}
