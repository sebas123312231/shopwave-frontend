'use client';

import { FormEvent, useState } from 'react';
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
  averageRating: number;
  onRefresh: () => Promise<void>;
}

export const ProductReviews = ({ productId, reviews, ratings, averageRating, onRefresh }: ProductReviewsProps) => {
  const { isAuthenticated } = useAuth();
  const [reviewText, setReviewText] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!reviewText.trim()) {
      setError('La reseña no puede estar vacía.');
      return;
    }

    setReviewLoading(true);
    try {
      await ReviewService.create({ productId, review: reviewText.trim() });
      setReviewText('');
      setSuccessMessage('Reseña publicada con éxito.');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la reseña.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    setError(null);
    setSuccessMessage(null);

    setRatingLoading(true);
    try {
      await RatingService.create({ productId, rating: ratingValue });
      setSuccessMessage('Calificación enviada con éxito.');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la calificación.');
    } finally {
      setRatingLoading(false);
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
            <Button type="submit" loading={reviewLoading}>
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
            <Button onClick={handleSubmitRating} loading={ratingLoading}>
              Enviar calificación
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-md bg-[var(--color-background-alt)] p-3 text-sm text-[var(--color-foreground-muted)]">
          Inicia sesión para publicar una reseña o calificación.
        </p>
      )}

      {successMessage && (
        <p className="rounded-md bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] p-3 text-sm text-[var(--color-success)]">
          {successMessage}
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
