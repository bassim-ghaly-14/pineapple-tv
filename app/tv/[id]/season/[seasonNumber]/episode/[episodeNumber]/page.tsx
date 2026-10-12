import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEpisodeDetails, getTVDetails } from "@/lib/tmdb/endpoints";
import { EpisodeDetail } from "@/components/tv/EpisodeDetail";
import { buildStillUrl } from "@/lib/tmdb/image-config";

export const revalidate = 86400;

interface Props {
  readonly params: { id: string; seasonNumber: string; episodeNumber: string };
}

function parseIds(params: Props["params"]) {
  const showId = Number(params.id);
  const seasonNumber = Number(params.seasonNumber);
  const episodeNumber = Number(params.episodeNumber);
  if (
    Number.isNaN(showId) ||
    Number.isNaN(seasonNumber) ||
    Number.isNaN(episodeNumber) ||
    !Number.isInteger(showId) ||
    !Number.isInteger(seasonNumber) ||
    !Number.isInteger(episodeNumber) ||
    seasonNumber < 0 ||
    episodeNumber < 1
  ) {
    return null;
  }
  return { showId, seasonNumber, episodeNumber };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ids = parseIds(params);
  if (!ids) return { title: "Episode not found", robots: { index: false } };
  try {
    const [episode, tvData] = await Promise.all([
      getEpisodeDetails(ids.showId, ids.seasonNumber, ids.episodeNumber),
      getTVDetails(ids.showId),
    ]);
    const title = `${tvData.tv.title} · S${episode.seasonNumber}E${episode.episodeNumber} · ${episode.name}`;
    const description =
      episode.overview.slice(0, 160) ||
      `Watch ${episode.name} from ${tvData.tv.title} on Pineapple TV.`;
    const images = [buildStillUrl(episode.stillPath)].filter(
      (src): src is string => src !== null,
    );
    const canonical = `/tv/${ids.showId}/season/${ids.seasonNumber}/episode/${ids.episodeNumber}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, type: "video.episode", url: canonical, images: images.map((url) => ({ url })) },
      twitter: { card: images.length > 0 ? "summary_large_image" : "summary", title, description, images },
    };
  } catch {
    return { title: "Episode not found", robots: { index: false } };
  }
}

export default async function EpisodePage({ params }: Props) {
  const ids = parseIds(params);
  if (!ids) notFound();

  try {
    const [episode, tvData] = await Promise.all([
      getEpisodeDetails(ids.showId, ids.seasonNumber, ids.episodeNumber),
      getTVDetails(ids.showId),
    ]);
    return <EpisodeDetail episode={episode} showTitle={tvData.tv.title} />;
  } catch {
    notFound();
  }
}