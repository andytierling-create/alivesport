import type { Metadata } from "next";
import { ClubDetailView } from "@/components/ClubDetailView";
import { clubs, getClub } from "@/data/clubs";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return clubs.map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = getClub(slug);
  return { title: club?.name ?? "Club" };
}

export default async function ClubPage({ params }: Props) {
  const { slug } = await params;
  return <ClubDetailView slug={slug} initialClub={getClub(slug) ?? null} />;
}
