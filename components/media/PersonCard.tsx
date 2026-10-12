import Link from "next/link";
import type { CastMember, CrewMember } from "@/lib/domain/models";
import { buildProfileUrl } from "@/lib/tmdb/image-config";
import { AppImage } from "@/components/media/AppImage";

export function CastCard({ person }: { readonly person: CastMember }) {
  const img = buildProfileUrl(person.profilePath, "small");
  return (
    <Link
      href={`/person/${person.id}`}
      className="group block w-28 shrink-0 text-center sm:w-32"
      aria-label={`${person.name} — details`}
    >
      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full bg-surface-elevated transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-accent">
        <AppImage src={img} alt="" fill sizes="128px" className="object-cover" />
      </div>
      <p className="mt-2 text-sm font-medium leading-snug text-text group-hover:text-accent">{person.name}</p>
      <p className="line-clamp-1 text-xs text-muted">{person.character}</p>
    </Link>
  );
}

export function CrewCard({ person }: { readonly person: CrewMember }) {
  const img = buildProfileUrl(person.profilePath, "small");
  return (
    <Link
      href={`/person/${person.id}`}
      className="group block w-28 shrink-0 text-center sm:w-32"
      aria-label={`${person.name} — details`}
    >
      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full bg-surface-elevated transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-accent">
        <AppImage src={img} alt="" fill sizes="128px" className="object-cover" />
      </div>
      <p className="mt-2 text-sm font-medium leading-snug text-text group-hover:text-accent">{person.name}</p>
      <p className="line-clamp-1 text-xs text-muted">{person.job}</p>
    </Link>
  );
}
