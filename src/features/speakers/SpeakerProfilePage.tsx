import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SpeakerProfile from "../../components/SpeakerProfile.jsx";
import type { Speaker } from "../../types/speaker";
import { fetchSpeakerBySlugRemote } from "./speakers.data";

type LoadState = { loading: boolean; speaker: Speaker | null; error?: string };

export default function SpeakerProfilePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const normalizedSlug = useMemo(() => slug.trim().toLowerCase(), [slug]);
  const [state, setState] = useState<LoadState>({ loading: true, speaker: null });

  useEffect(() => {
    let canceled = false;
    const nextSlug = normalizedSlug;

    if (!nextSlug) {
      setState({ loading: false, speaker: null, error: "not-found" });
      return () => {
        canceled = true;
      };
    }

    setState({ loading: true, speaker: null });

    fetchSpeakerBySlugRemote(nextSlug)
      .then((sp) => {
        if (canceled) return;
        setState({ loading: false, speaker: sp, error: sp ? undefined : "not-found" });
      })
      .catch((err) => {
        if (canceled) return;
        setState({
          loading: false,
          speaker: null,
          error: String(err?.message || "error"),
        });
      });

    return () => {
      canceled = true;
    };
  }, [normalizedSlug]);

  if (state.loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-xl font-semibold mb-2">Speaker profile uploading…</h1>
        <p className="text-gray-600">Loading the latest profile…</p>
      </main>
    );
  }

  if (!state.speaker) {
    if (state.error && state.error !== "not-found") {
      return (
        <main className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-xl font-semibold mb-2">Profile unavailable</h1>
          <p className="text-gray-600">
            We ran into an error while loading this profile. Please try again later.
          </p>
          <p className="mt-4 text-sm text-gray-500 break-words">{state.error}</p>
        </main>
      );
    }

    return <SpeakerProfile id={normalizedSlug} speakers={[]} />;
  }

  const targetId = state.speaker.slug || state.speaker.id || normalizedSlug;

  return <SpeakerProfile id={targetId} speakers={[state.speaker]} />;
}
