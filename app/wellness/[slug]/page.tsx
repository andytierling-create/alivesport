import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubDetailView } from "@/components/ClubDetailView";
import { wellness } from "@/data/wellness";
import { findWellness } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ postcode?: string }>;
};

export function generateStaticParams() {
  return wellness.map((venue) => ({ slug: venue.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: findWellness(slug)?.name ?? "Wellness" };
}

export default async function WellnessDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { postcode } = await searchParams;
  const venue = findWellness(slug);
  if (!venue) notFound();
  return (
    <ClubDetailView
      slug={slug}
      initialClub={venue}
      backHref="/wellness"
      fromPostcode={postcode}
    />
  );
}
