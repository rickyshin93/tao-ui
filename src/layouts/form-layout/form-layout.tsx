import type { ReactNode } from 'react';
import '../stack/layout.css';

export interface FormLayoutProps {
  children: ReactNode;
}

export function FormLayout({ children }: FormLayoutProps) {
  return <div data-tao-form-layout="">{children}</div>;
}
