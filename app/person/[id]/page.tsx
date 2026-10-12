import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPersonFullDetails } from "@/lib/tmdb/endpoints";
import { PersonDetail } from "@/components/person/PersonDetail";
import { buildProfileUrl } from "@/lib/tmdb/image-config";

export const revalidate = 86400;

interface Props {
  readonly params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return { title: "Person not found", robots: { index: false } };
  }
  try {
    const { person } = await getPersonFullDetails(id);
    const description =
      person.biography.slice(0, 160) ||
      `Explore ${person.name}'s filmography on Pineapple TV.`;
    const images = [buildProfileUrl(person.profilePath, "medium")].filter(
      (src): src is string => src !== null,
    );
    const canonical = `/person/${id}`;
    return {
      title: person.name,
      description,
      alternates: { canonical },
      openGraph: { title: person.name, description, type: "profile", url: canonical, images: images.map((url) => ({ url })) },
      twitter: { card: images.length > 0 ? "summary_large_image" : "summary", title: person.name, description, images },
    };
  } catch {
    return { title: "Person not found", robots: { index: false } };
  }
}

export default async function PersonPage({ params }: Props) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  try {
    const { person, filmography } = await getPersonFullDetails(id);
    return <PersonDetail person={person} filmography={filmography} />;
  } catch {
    notFound();
  }
}