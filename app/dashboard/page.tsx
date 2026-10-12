"use client";

import Link from "next/link";
import { usePersonalState } from "@/lib/state/PersonalStateContext";
import { EmptyState } from "@/components/ui/States";
import { Film, Tv, Bookmark, Heart, Star, CheckCircle, Clock, Play } from "lucide-react";
import { buildPosterUrl } from "@/lib/tmdb/image-config";
import { AppImage } from "@/components/media/AppImage";
import type { ActivityEntry, TVProgress } from "@/lib/repositories/types";

function StatCard({
  icon,
  label,
  value,
  accent = false,
  href,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string | number;
  readonly accent?: boolean;
  // When provided, the card links to an existing destination page that
  // displays the records this statistic represents. Cards without a genuine
  // destination stay non-interactive (no href, no pointer cursor).
  readonly href?: string;
}) {
  const body = (
    <div className="flex items-center gap-3">
      <div className={`rounded-lg p-2 ${accent ? "bg-accent/20 text-accent" : "bg-surface-elevated text-muted"}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );

  const surface = "rounded-lg border border-white/5 bg-surface p-4";

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`View ${label}`}
        className={`${surface} block cursor-pointer transition-colors hover:border-white/10 hover:bg-surface-hover`}
      >
        {body}
      </Link>
    );
  }

  return <div className={surface}>{body}</div>;
}

function ActivityItem({ entry }: { readonly entry: ActivityEntry }) {
  const poster = buildPosterUrl(entry.posterPath, "card");
  const href = `/${entry.mediaType === "tv" ? "tv" : "movies"}/${entry.mediaId}`;

  const label: Record<string, string> = {
    watchlist_add: "Added to watchlist",
    favorite_add: "Added to favorites",
    watched_movie: "Marked as watched",
    watched_episode: "Watched episode",
    rating: entry.rating ? `Rated ${entry.rating}/5` : "Rated",
  };

  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface-hover">
      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-surface-elevated">
        <AppImage src={poster} alt="" fill sizes="36px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{entry.title}</p>
        <p className="text-xs text-muted">
          {label[entry.type] ?? entry.type}
          {entry.seasonNumber ? ` · S${entry.seasonNumber}E${entry.episodeNumber}` : ""}
        </p>
      </div>
    </Link>
  );
}

function ContinueWatchingCard({ progress }: { readonly progress: TVProgress }) {
  const lastSeason = progress.lastWatchedSeason;
  const lastEpisode = progress.lastWatchedEpisode;
  const poster = buildPosterUrl(progress.posterPath ?? null, "card");
  const href = lastSeason ? `/tv/${progress.showId}/season/${lastSeason}` : `/tv/${progress.showId}`;
  const title = progress.title ?? `Show #${progress.showId}`;
  const meta = lastSeason ? `Season ${lastSeason} · Episode ${lastEpisode}` : "Started";

  return (
    // The entire card is a single link so there are no nested interactive
    // elements; the "Continue" pill is a styled span, not a separate control.
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-white/5 bg-surface p-3 transition-colors hover:bg-surface-hover sm:flex-row sm:items-center sm:gap-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-surface-elevated">
          <AppImage src={poster} alt="" fill sizes="44px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-text sm:truncate">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-muted">{meta}</p>
        </div>
      </div>
      <span className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-text sm:w-auto">
        <Play className="h-3.5 w-3.5" aria-hidden="true" />
        Continue
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const {
    ready,
    watchlist,
    favorites,
    watchedMovies,
    tvProgress,
    ratings,
    averageRating,
    recentActivity,
    getTotalWatchedEpisodes,
  } = usePersonalState();

  if (!ready) {
    return <div className="text-muted">Loading your data…</div>;
  }

  const totalEpisodesWatched = tvProgress.reduce((acc, p) => acc + getTotalWatchedEpisodes(p.showId), 0);
  const showsTracked = tvProgress.length;

  // Derive top genres from ratings (we have genre-less snapshots, so use ratings count as proxy)
  const ratingsCount = ratings.length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text sm:text-3xl">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={<CheckCircle className="h-5 w-5" />} label="Movies Watched" value={watchedMovies.length} />
        <StatCard icon={<Tv className="h-5 w-5" />} label="Shows Tracked" value={showsTracked} />
        <StatCard icon={<Film className="h-5 w-5" />} label="Episodes Watched" value={totalEpisodesWatched} />
        <StatCard icon={<Bookmark className="h-5 w-5" />} label="Watchlist" value={watchlist.length} href="/watchlist" />
        <StatCard icon={<Heart className="h-5 w-5" />} label="Favorites" value={favorites.length} href="/favorites" />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Average Rating"
          value={averageRating > 0 ? averageRating.toFixed(1) : "—"}
          accent
        />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Titles Rated" value={ratingsCount} />
      </div>

      {/* Continue Watching */}
      {tvProgress.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text">Continue Watching</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tvProgress.slice(0, 6).map((progress) => (
              <ContinueWatchingCard key={progress.showId} progress={progress} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <EmptyState title="No activity yet" message="Start tracking movies and TV shows to see your activity here." />
        ) : (
          <div className="rounded-lg border border-white/5 bg-surface">
            {recentActivity.map((entry) => (
              <ActivityItem key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
