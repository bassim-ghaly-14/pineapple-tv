"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Star, Users } from "lucide-react";
import type { Episode, CastMember, CrewMember } from "@/lib/domain/models";
import { buildStillUrl } from "@/lib/tmdb/image-config";
import { formatDate, formatRuntime, formatVote } from "@/lib/utils";
import { AppImage } from "@/components/media/AppImage";
import { CastCard } from "@/components/media/PersonCard";

interface Props {
  readonly episode: Episode;
  readonly showTitle: string;
}

function EpisodeMetaList({ episode }: { readonly episode: Episode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
      <span className="inline-flex items-center gap-1.5">
        Season {episode.seasonNumber} · Episode {episode.episodeNumber}
      </span>
      {episode.airDate && (
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-4 w-4" /> {formatDate(episode.airDate)}
        </span>
      )}
      {episode.runtime != null && formatRuntime(episode.runtime) && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {formatRuntime(episode.runtime)}
        </span>
      )}
      {episode.voteAverage > 0 && (
        <span className="font-semibold text-accent">★ {formatVote(episode.voteAverage)}</span>
      )}
      {episode.voteCount > 0 && <span>({episode.voteCount.toLocaleString()} votes)</span>}
    </div>
  );
}

function PeopleList({
  heading,
  people,
  labelKey,
}: {
  readonly heading: string;
  readonly people: CastMember[];
  readonly labelKey: string;
}) {
  if (people.length === 0) return null;
  return (
    <section aria-labelledby={labelKey} className="space-y-3">
      <h2 id={labelKey} className="flex items-center gap-2 text-lg font-bold text-text">
        <Users className="h-5 w-5 text-muted" /> {heading}
      </h2>
      <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
        {people.map((p) => (
          <CastCard key={`${p.id}-${p.character}`} person={p} />
        ))}
      </div>
    </section>
  );
}

export function EpisodeDetail({ episode, showTitle }: Props) {
  const still = buildStillUrl(episode.stillPath);
  const showCrew: CrewMember[] = episode.crew;

  return (
    <div className="space-y-6">
      {/* Back navigation to parent season */}
      <Link
        href={`/tv/${episode.showId}/season/${episode.seasonNumber}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {showTitle}
      </Link>

      {/* Still */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-elevated shadow-card">
        <AppImage
          src={still}
          alt={episode.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Title + metadata */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold leading-tight text-text sm:text-3xl">
          {episode.episodeNumber}. {episode.name}
        </h1>
        <EpisodeMetaList episode={episode} />
      </div>

      {/* Full overview */}
      {episode.overview ? (
        <p className="max-w-3xl text-sm leading-relaxed text-text/80 sm:text-base">
          {episode.overview}
        </p>
      ) : (
        <p className="text-sm text-muted">No description available for this episode.</p>
      )}

      {/* Guest stars */}
      <PeopleList
        heading="Guest Stars"
        people={episode.guestStars}
        labelKey="episode-guest-stars-heading"
      />

      {/* Episode crew */}
      {showCrew.length > 0 && (
        <section aria-labelledby="episode-crew-heading" className="space-y-3">
          <h2 id="episode-crew-heading" className="text-lg font-bold text-text">Crew</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {showCrew.map((c) => (
              <li key={`${c.id}-${c.job}`} className="text-sm text-muted">
                <Link href={`/person/${c.id}`} className="hover:text-accent hover:underline">
                  {c.name}
                </Link>
                {c.job && <span className="text-text/70"> — {c.job}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}