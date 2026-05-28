'use client';

import { FormEvent, useState } from 'react';
import { Rating, Review } from '@/models/product.model';
import { ReviewService } from '@/services/review.service';
import { RatingService } from '@/services/rating.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Star, CheckCircle, AlertCircle, LogIn } from 'lucide-react';

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

  const renderStars = (count: number, interactive: boolean, onClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onClick && onClick(i + 1)}
        className={`transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
      >
        <Star
          size={24}
          className={i < count ? 'fill-accent text-accent' : 'text-border'}
        />
      </button>
    ));
  };

  return (
    <section className="space-y-6 rounded-2xl bg-white shadow-sm border border-border p-6 md:p-8">
      <header className="space-y-2 pb-4 border-b border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Reseñas y calificaciones</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(Math.round(averageRating), false)}
          </div>
          <p className="text-sm text-foreground-muted">
            {ratings.length > 0
              ? `Promedio ${averageRating.toFixed(1)} / 5 en ${ratings.length} valoraciones`
              : 'Todavía no hay valoraciones para este producto'}
          </p>
        </div>
      </header>

      {isAuthenticated ? (
        <div className="grid gap-6 rounded-xl border border-border bg-background-alt p-5 md:grid-cols-2">
          <form className="space-y-4" onSubmit={handleSubmitReview}>
            <label className="text-sm font-medium text-foreground">Tu reseña</label>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="¿Qué te pareció este producto?"
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              rows={3}
            />
            <Button type="submit" loading={reviewLoading}>
              Publicar reseña
            </Button>
          </form>

          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">Tu calificación</label>
            <div className="flex items-center gap-1">
              {renderStars(ratingValue, true, setRatingValue)}
            </div>
            <p className="text-sm text-foreground-muted font-medium">{ratingValue} / 5</p>
            <Button onClick={handleSubmitRating} loading={ratingLoading}>
              Enviar calificación
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
          <LogIn size={20} className="text-accent flex-shrink-0" />
          <p className="text-sm text-accent-dark">
            <a href="/login" className="font-semibold hover:underline">Inicia sesión</a> para publicar una reseña o calificación.
          </p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-success flex-shrink-0" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-error flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-8">Sin reseñas todavía. ¡Sé el primero en opinar!</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-border bg-background-alt p-4 border-l-4 border-l-accent">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
                  {review.user.firstName[0]}{review.user.lastName[0]}
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {review.user.firstName} {review.user.lastName}
                </p>
                <span className="text-xs text-foreground-muted">
                  {new Date(review.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              <p className="text-sm text-foreground-muted leading-relaxed">{review.review}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
};