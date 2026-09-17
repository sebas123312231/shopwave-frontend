import { z } from 'zod';

const uuid = z.string().uuid();
const isoDate = z.string().datetime({ offset: true });

export const roleSchema = z.enum(['USER', 'ADMIN']);
export type Role = z.infer<typeof roleSchema>;

export const orderStatusSchema = z.enum([
  'PLACED',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const problemFieldSchema = z.object({
  field: z.string(),
  message: z.string(),
});

export const problemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  code: z.string(),
  detail: z.string(),
  instance: z.string(),
  traceId: z.string(),
  fieldErrors: z.array(problemFieldSchema),
});
export type ProblemDetails = z.infer<typeof problemSchema>;

export const userSchema = z.object({
  id: uuid,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  mobile: z.string(),
  role: roleSchema,
  createdAt: isoDate,
});
export type User = z.infer<typeof userSchema>;

export const sessionSchema = z.object({
  user: userSchema,
  expiresAt: isoDate,
});
export type Session = z.infer<typeof sessionSchema>;
export const tokenResponseSchema = sessionSchema.extend({ accessToken: z.string().min(1) });

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(12).max(72),
    mobile: z.string().regex(/^(?:\+591)?\d{8}$/, 'Usa un número boliviano válido'),
  })
  .strict();
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(72),
  })
  .strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const profileUpdateSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    mobile: z.string().regex(/^(?:\+591)?\d{8}$/, 'Usa un número boliviano válido'),
  })
  .strict();
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const addressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  streetAddress: z.string(),
  city: z.string(),
  department: z.string(),
  postalCode: z.string().nullable(),
  mobile: z.string(),
  country: z.literal('BO'),
});
export type Address = z.infer<typeof addressSchema> & { id?: string };

export const categorySchema = z.object({
  id: uuid,
  name: z.string(),
  parentId: uuid.nullable(),
  path: z.array(z.object({ id: uuid, name: z.string() })),
});
export type Category = z.infer<typeof categorySchema>;
export const categoriesSchema = z.array(categorySchema);

export const variantSchema = z.object({
  id: uuid,
  label: z.string(),
  stock: z.number().int().nonnegative(),
  active: z.boolean(),
});
export type Variant = z.infer<typeof variantSchema>;

export const productSchema = z.object({
  id: uuid,
  title: z.string(),
  description: z.string(),
  brand: z.string(),
  color: z.string(),
  category: categorySchema,
  imageUrl: z.string().url(),
  priceMinor: z.number().int().nonnegative(),
  salePriceMinor: z.number().int().nonnegative(),
  currency: z.literal('BOB'),
  discountPercent: z.number().nonnegative(),
  stockTotal: z.number().int().nonnegative(),
  variants: z.array(variantSchema),
  active: z.boolean(),
  version: z.number().int().nonnegative(),
  createdAt: isoDate,
  updatedAt: isoDate,
});
export type Product = z.infer<typeof productSchema>;

export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  });
export const productPageSchema = pageSchema(productSchema);
export type ProductPage = z.infer<typeof productPageSchema>;

export const facetsSchema = z.object({
  categories: z.array(categorySchema),
  colors: z.array(z.string()),
  variantLabels: z.array(z.string()),
  minPriceMinor: z.number().int().nonnegative(),
  maxPriceMinor: z.number().int().nonnegative(),
});
export type Facets = z.infer<typeof facetsSchema>;

export const cartItemSchema = z.object({
  id: uuid,
  variantId: uuid,
  productId: uuid,
  title: z.string(),
  imageUrl: z.string().url(),
  variantLabel: z.string(),
  quantity: z.number().int().min(1).max(10),
  stockAvailable: z.number().int().nonnegative(),
  unitPriceMinor: z.number().int().nonnegative(),
  unitSalePriceMinor: z.number().int().nonnegative(),
  lineTotalMinor: z.number().int().nonnegative(),
  available: z.boolean(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.object({
  id: uuid,
  version: z.number().int().nonnegative(),
  quoteFingerprint: z.string().min(1),
  items: z.array(cartItemSchema),
  subtotalMinor: z.number().int().nonnegative(),
  discountMinor: z.number().int().nonnegative(),
  totalMinor: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
  currency: z.literal('BOB'),
});
export type Cart = z.infer<typeof cartSchema>;

export const addCartItemSchema = z.object({ variantId: uuid, quantity: z.number().int().min(1).max(10) }).strict();
export const updateCartItemSchema = z.object({ quantity: z.number().int().min(1).max(10) }).strict();

export const checkoutSchema = z
  .object({
    address: z.object({
      firstName: z.string().trim().min(1).max(80),
      lastName: z.string().trim().min(1).max(80),
      streetAddress: z.string().trim().min(1).max(200),
      city: z.string().trim().min(1).max(80),
      department: z.string().min(1),
      postalCode: z.string().max(20).nullable(),
      mobile: z.string().regex(/^(?:\+591)?\d{8}$/),
      country: z.literal('BO'),
    }),
    saveAddress: z.boolean(),
    paymentMethod: z.literal('MOCK'),
    cartVersion: z.number().int().nonnegative(),
    quoteFingerprint: z.string().min(1),
  })
  .strict();
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderItemSchema = z.object({
  id: uuid,
  productId: uuid,
  variantId: uuid,
  title: z.string(),
  imageUrl: z.string().url(),
  variantLabel: z.string(),
  quantity: z.number().int().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
  unitSalePriceMinor: z.number().int().nonnegative(),
  lineTotalMinor: z.number().int().nonnegative(),
});

export const paymentSchema = z.object({
  method: z.literal('MOCK'),
  status: z.enum(['SIMULATED', 'VOIDED']),
  reference: z.string(),
});

export const orderSchema = z.object({
  id: uuid,
  number: z.string(),
  status: orderStatusSchema,
  version: z.number().int().nonnegative(),
  createdAt: isoDate,
  deliveredAt: isoDate.nullable(),
  shippingAddress: addressSchema,
  items: z.array(orderItemSchema),
  subtotalMinor: z.number().int().nonnegative(),
  discountMinor: z.number().int().nonnegative(),
  totalMinor: z.number().int().nonnegative(),
  currency: z.literal('BOB'),
  totalQuantity: z.number().int().nonnegative(),
  payment: paymentSchema,
  allowedTransitions: z.array(orderStatusSchema),
});
export type Order = z.infer<typeof orderSchema>;
export const orderPageSchema = pageSchema(orderSchema);
export type OrderPage = z.infer<typeof orderPageSchema>;

export const adminOrderSchema = orderSchema.extend({
  customer: z.object({ id: uuid, firstName: z.string(), lastName: z.string(), email: z.string().email() }),
});
export const adminOrderPageSchema = pageSchema(adminOrderSchema);
export type AdminOrder = z.infer<typeof adminOrderSchema>;
export type AdminOrderPage = z.infer<typeof adminOrderPageSchema>;

export const productWriteSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(4000),
    brand: z.string().trim().min(1).max(80),
    color: z.string().trim().min(1).max(40),
    categoryId: uuid,
    imageUrl: z.string().url(),
    priceMinor: z.number().int().positive().max(100_000_000),
    salePriceMinor: z.number().int().positive().max(100_000_000),
    variants: z.array(z.object({ id: uuid.nullable(), label: z.string().trim().min(1).max(30), stock: z.number().int().nonnegative(), active: z.boolean() }).strict()).min(1),
    version: z.number().int().nonnegative().optional(),
  })
  .strict()
  .refine((value) => value.salePriceMinor <= value.priceMinor, { message: 'El precio de oferta no puede superar al regular', path: ['salePriceMinor'] });
export type ProductWriteInput = z.infer<typeof productWriteSchema>;

export const archiveSchema = z.object({ active: z.boolean(), version: z.number().int().nonnegative() }).strict();
export const statusWriteSchema = z.object({ status: orderStatusSchema, version: z.number().int().nonnegative() }).strict();

export const adminSummarySchema = z.object({
  activeProducts: z.number().int().nonnegative(),
  ordersPlaced: z.number().int().nonnegative(),
  ordersConfirmed: z.number().int().nonnegative(),
  simulatedSalesMinor: z.number().int().nonnegative(),
  currency: z.literal('BOB'),
  periodStart: isoDate,
  periodEnd: isoDate,
});
export type AdminSummary = z.infer<typeof adminSummarySchema>;

export type ApiPage<T> = { items: T[]; page: number; size: number; totalItems: number; totalPages: number };
