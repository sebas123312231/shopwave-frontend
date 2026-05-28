import { api } from './api.service';
import { Review } from '@/models/product.model';
import { CreateReviewRequest } from '@/models/review.model';

export const ReviewService = {
  getByProduct: async (productId: number): Promise<Review[]> => {
    return api.get<Review[]>(`/reviews/product/${productId}`, true);
  },

  create: async (req: CreateReviewRequest): Promise<Review> => {
    return api.post<Review>('/reviews/create', req, true);
  },
};
