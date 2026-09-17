import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogControls } from './CatalogControls';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
  useRouter: () => ({ push: pushMock }),
}));

describe('CatalogControls', () => {
  beforeEach(() => pushMock.mockReset());

  it('serializes facets, prices and repeated filters into the catalog URL', () => {
    render(<CatalogControls
      initial={{ q: 'camisa', categoryId: 'category-1', color: ['Negro'], variantLabel: ['M'], minPriceMinor: '10000', maxPriceMinor: '25000', inStock: 'true', sort: 'price_asc', page: '2' }}
      facets={{
        categories: [{ id: 'category-1', name: 'Ropa', parentId: null, path: [{ id: 'category-1', name: 'Ropa' }] }],
        colors: ['Negro'],
        variantLabels: ['M'],
        minPriceMinor: 10000,
        maxPriceMinor: 25000,
      }}
    />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Aplicar filtros' })[0]!);

    expect(pushMock).toHaveBeenCalledWith('/products?q=camisa&categoryId=category-1&color=Negro&variantLabel=M&minPriceMinor=10000&maxPriceMinor=25000&inStock=true&sort=price_asc');
  });

  it('applies and clears state without preserving the previous page', () => {
    render(<CatalogControls initial={{ page: '4' }} facets={null} />);

    fireEvent.change(screen.getByLabelText('Disponibilidad'), { target: { value: 'false' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Aplicar filtros' })[0]!);
    expect(pushMock).toHaveBeenLastCalledWith('/products?inStock=false');

    fireEvent.click(screen.getAllByRole('button', { name: 'Limpiar' })[0]!);
    expect(pushMock).toHaveBeenLastCalledWith('/products');
  });
});
