import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductGrid } from './ProductGrid';

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('next/image', () => ({ default: ({ alt }: { alt?: string }) => <span role="img" aria-label={alt ?? ''} /> }));

describe('ProductGrid', () => {
  it('renders an explicit empty state instead of a blank area', () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByText('No encontramos productos')).toBeInTheDocument();
  });
});
