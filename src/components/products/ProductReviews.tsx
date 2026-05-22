'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Rating, Review } from '@/models/product.model';
import { ReviewService } from '@/services/review.service';
import { RatingService } from '@/services/rating.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  ratings: Rating[];
  onRefresh: () => Promise<void>;
}

export const ProductReviews = ({ productId, reviews, ratings, onRefresh }: ProductReviewsProps) => {
  const { isAuthenticated } = useAuth();
  const [reviewText, setReviewText] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((accumulator, item) => accumulator + item.rating, 0);
    return total / ratings.length;
  }, [ratings]);

  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!reviewText.trim()) {
      setError('La reseña no puede estar vacía.');
      return;
    }

    setLoading(true);
    try {
      await ReviewService.create({ productId, review: reviewText.trim() });
      setReviewText('');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la reseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    setError(null);
    setLoading(true);

    try {
      await RatingService.create({ productId, rating: ratingValue });
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <header className="space-y-1">
        <h2 className="text-xl font-bold">Reseñas y calificaciones</h2>
        <p className="text-sm text-[var(--color-foreground-muted)]">
          {ratings.length > 0
            ? `Promedio ${averageRating.toFixed(1)} / 5 en ${ratings.length} valoraciones`
            : 'Todavía no hay valoraciones para este producto'}
        </p>
      </header>

      {isAuthenticated ? (
        <div className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-alt)] p-4 md:grid-cols-2">
          <form className="space-y-3" onSubmit={handleSubmitReview}>
            <Input
              label="Tu reseña"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="¿Qué te pareció este producto?"
            />
            <Button type="submit" loading={loading}>
              Publicar reseña
            </Button>
          </form>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Tu calificación</label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={ratingValue}
              onChange={(event) => setRatingValue(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-sm text-[var(--color-foreground-muted)]">{ratingValue} / 5</p>
            <Button onClick={handleSubmitRating} loading={loading}>
              Enviar calificación
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-md bg-[var(--color-background-alt)] p-3 text-sm text-[var(--color-foreground-muted)]">
          Inicia sesión para publicar una reseña o calificación.
        </p>
      )}

      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-[var(--color-foreground-muted)]">Sin reseñas todavía.</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-md border border-[var(--color-border)] p-3">
              <p className="text-sm font-semibold">
                {review.user.firstName} {review.user.lastName}
              </p>
              <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{review.review}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
};
