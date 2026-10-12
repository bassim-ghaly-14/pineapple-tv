"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { TVShow, Episode, CastMember } from "@/lib/domain/models";
import { buildStillUrl, buildPosterUrl } from "@/lib/tmdb/image-config";
import { formatDate, formatRuntime, formatVote, cn } from "@/lib/utils";
import { usePersonalState } from "@/lib/state/PersonalStateContext";
import { SeasonSelector } from "./SeasonSelector";
import { CastCard } from "@/components/media/PersonCard";
import { AppImage } from "@/components/media/AppImage";

interface SeasonData {
  id: number;
  showId: number;
  seasonNumber: number;
  name: string;
  overview: string;
  posterPath: string | null;
  airDate: string | null;
  episodeCount: number;
  episodes: Episode[];
}

interface Props {
  readonly season: SeasonData;
  readonly tv: TVShow;
  readonly cast: CastMember[];
}

export function SeasonView({ season, tv, cast }: Props) {
  const { isEpisodeWatched, toggleEpisodeWatched, getSeasonWatchedCount, enrichTVSnapshot } =
    usePersonalState();

  // Enrich progress with snapshot when we have TV data (side effect, not render work)
  useEffect(() => {
    if (tv.title) {
      enrichTVSnapshot(tv.id, tv.title, tv.posterPath);
    }
  }, [tv.id, tv.title, tv.posterPath, enrichTVSnapshot]);

  const [onlyUnwatched, setOnlyUnwatched] = useState(false);

  const watchedCount = getSeasonWatchedCount(season.showId, season.seasonNumber);
  const totalEpisodes = season.episodes.length;
  const filteredEpisodes = onlyUnwatched
    ? season.episodes.filter((ep) => !isEpisodeWatched(season.showId, season.seasonNumber, ep.episodeNumber))
    : season.episodes;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href={`/tv/${tv.id}`} className="hover:text-text">
          {tv.title}
        </Link>
        <span>/</span>
        <span className="text-text">{season.name}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="w-24 shrink-0">
          <div className="aspect-[2/3] overflow-hidden rounded-lg bg-surface-elevated">
            <AppImage
              src={buildPosterUrl(season.posterPath, "medium")}
              alt={season.name}
              width={500}
              height={750}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text">{season.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
            {season.airDate && <span>{formatDate(season.airDate)}</span>}
            <span>
              {watchedCount}/{totalEpisodes} watched
            </span>
          </div>
          <div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0}%` }}
            />
          </div>
          {season.overview && <p className="mt-3 max-w-2xl text-sm text-text/80">{season.overview}</p>}
        </div>
      </div>

      {tv.numberOfSeasons && tv.numberOfSeasons > 1 && (
        <SeasonSelector
          showId={tv.id}
          currentSeason={season.seasonNumber}
          totalSeasons={tv.numberOfSeasons}
        />
      )}

      <button
        onClick={() => setOnlyUnwatched(!onlyUnwatched)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          onlyUnwatched
            ? "border-accent bg-accent/20 text-accent"
            : "border-white/10 text-muted hover:text-text",
        )}
      >
        {onlyUnwatched ? "Showing unwatched" : "Show unwatched only"}
      </button>

      <div className="space-y-3">
        {filteredEpisodes.map((episode) => {
          const watched = isEpisodeWatched(season.showId, season.seasonNumber, episode.episodeNumber);
          const still = buildStillUrl(episode.stillPath);
          return (
            <div
              key={episode.id}
              className={cn(
                "flex gap-3 rounded-lg border bg-surface p-3 transition-colors",
                watched ? "border-green-400/30" : "border-white/5",
              )}
            >
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-surface-elevated sm:h-24 sm:w-40">
                <AppImage src={still} alt="" fill sizes="160px" className="object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-text">
                      <Link
                        href={`/tv/${season.showId}/season/${season.seasonNumber}/episode/${episode.episodeNumber}`}
                        className="rounded hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {episode.episodeNumber}. {episode.name}
                      </Link>
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      {episode.airDate && <span>{formatDate(episode.airDate)}</span>}
                      {episode.runtime && <span>{formatRuntime(episode.runtime)}</span>}
                      {episode.voteAverage > 0 && <span>★ {formatVote(episode.voteAverage)}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleEpisodeWatched(
                        season.showId,
                        season.seasonNumber,
                        episode.episodeNumber,
                        !watched,
                        { title: tv.title, posterPath: tv.posterPath },
                      );
                    }}
                    aria-pressed={watched}
                    aria-label={watched ? "Mark as unwatched" : "Mark as watched"}
                    className={cn(
                      "shrink-0 rounded-full border p-2 transition-colors",
                      watched
                        ? "border-green-400 bg-green-400/20 text-green-400"
                        : "border-white/10 text-muted hover:text-text",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
                {episode.overview && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted">{episode.overview}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cast.length > 0 && (
        <section aria-labelledby="season-cast-heading" className="space-y-3">
          <h2 id="season-cast-heading" className="text-lg font-bold text-text">Cast</h2>
          <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
            {cast.slice(0, 10).map((c) => (
              <CastCard key={c.id} person={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
