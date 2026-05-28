import { api } from './api.service';
import { Rating } from '@/models/product.model';
import { CreateRatingRequest } from '@/models/rating.model';

export const RatingService = {
  getByProduct: async (productId: number): Promise<Rating[]> => {
    return api.get<Rating[]>(`/ratings/product/${productId}`, true);
  },

  create: async (req: CreateRatingRequest): Promise<Rating> => {
    return api.post<Rating>('/ratings/create', req, true);
  },
};
