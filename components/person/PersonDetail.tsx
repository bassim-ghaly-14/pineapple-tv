"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type {
  PersonDetails,
  PersonActingCredit,
  PersonCrewCredit,
} from "@/lib/domain/models";
import { buildProfileUrl, buildPosterUrl } from "@/lib/tmdb/image-config";
import { formatDate, formatVote, cn } from "@/lib/utils";
import { AppImage } from "@/components/media/AppImage";

interface Props {
  readonly person: PersonDetails;
  readonly filmography: {
    cast: PersonActingCredit[];
    crew: PersonCrewCredit[];
  };
}

function mediaHref(credit: { mediaType: "movie" | "tv"; id: number }): string {
  return credit.mediaType === "tv" ? `/tv/${credit.id}` : `/movies/${credit.id}`;
}

function CreditCard({
  credit,
  sublabel,
}: {
  readonly credit: PersonActingCredit | PersonCrewCredit;
  readonly sublabel: string;
}) {
  return (
    <Link
      href={mediaHref(credit)}
      className="group flex gap-3 rounded-lg border border-white/5 bg-surface p-3 transition-colors hover:border-accent/40"
    >
      <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md bg-surface-elevated">
        <AppImage
          src={buildPosterUrl(credit.posterPath, "card")}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-text group-hover:text-accent">
          {credit.title}
        </p>
        {sublabel && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{sublabel}</p>}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          {credit.year !== null && <span>{credit.year}</span>}
          {credit.voteAverage > 0 && (
            <span className="font-semibold text-accent">★ {formatVote(credit.voteAverage)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function PersonalInfo({ person }: { readonly person: PersonDetails }) {
  const bornText = formatDate(person.birthday);
  const diedText = formatDate(person.deathday);
  return (
    <dl className="grid gap-2 text-sm">
      {person.knownForDepartment && (
        <div className="flex gap-2">
          <dt className="text-muted">Known for:</dt>
          <dd className="text-text">{person.knownForDepartment}</dd>
        </div>
      )}
      {bornText && (
        <div className="flex gap-2">
          <dt className="text-muted">Born:</dt>
          <dd className="text-text">{bornText}</dd>
        </div>
      )}
      {diedText && (
        <div className="flex gap-2">
          <dt className="text-muted">Died:</dt>
          <dd className="text-text">{diedText}</dd>
        </div>
      )}
      {person.placeOfBirth && (
        <div className="flex gap-2">
          <dt className="text-muted">Place of birth:</dt>
          <dd className="text-text">{person.placeOfBirth}</dd>
        </div>
      )}
      {person.alsoKnownAs.length > 0 && (
        <div className="flex gap-2">
          <dt className="text-muted">Also known as:</dt>
          <dd className="text-text">{person.alsoKnownAs.join(", ")}</dd>
        </div>
      )}
    </dl>
  );
}

export function PersonDetail({ person, filmography }: Props) {
  const profile = buildProfileUrl(person.profilePath, "medium");

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative mx-auto aspect-square w-32 shrink-0 overflow-hidden rounded-full bg-surface-elevated shadow-card sm:mx-0 sm:w-48">
          <AppImage
            src={profile}
            alt={`${person.name} profile`}
            fill
            priority
            sizes="192px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-text sm:text-4xl">
              {person.name}
            </h1>
            {person.homepage && (
              <a
                href={person.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                Official site <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <PersonalInfo person={person} />
        </div>
      </div>

      {/* Biography */}
      {person.biography ? (
        <section aria-labelledby="person-bio-heading" className="space-y-2">
          <h2 id="person-bio-heading" className="text-lg font-bold text-text">Biography</h2>
          <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-text/80 sm:text-base">
            {person.biography}
          </p>
        </section>
      ) : (
        <p className="text-sm text-muted">No biography available.</p>
      )}

      {/* Acting credits */}
      <section aria-labelledby="person-cast-heading" className="space-y-3">
        <h2 id="person-cast-heading" className="text-lg font-bold text-text">
          Acting
          <span className="ml-2 text-sm font-normal text-muted">({filmography.cast.length})</span>
        </h2>
        {filmography.cast.length === 0 ? (
          <p className="text-sm text-muted">No acting credits available.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filmography.cast.map((c) => (
              <CreditCard
                key={`${c.mediaType}-${c.id}-${c.character}`}
                credit={c}
                sublabel={c.character}
              />
            ))}
          </div>
        )}
      </section>

      {/* Crew credits */}
      <section aria-labelledby="person-crew-heading" className="space-y-3">
        <h2 id="person-crew-heading" className="text-lg font-bold text-text">
          Crew
          <span className="ml-2 text-sm font-normal text-muted">({filmography.crew.length})</span>
        </h2>
        {filmography.crew.length === 0 ? (
          <p className="text-sm text-muted">No crew credits available.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filmography.crew.map((c) => (
              <CreditCard
                key={`${c.mediaType}-${c.id}-${c.job}-${c.department}`}
                credit={c}
                sublabel={cn(c.job, c.department && c.department !== c.job ? ` · ${c.department}` : "")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}