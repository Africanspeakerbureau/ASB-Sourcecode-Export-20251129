import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

type MarkdownRenderer = {
  ReactMarkdown: ComponentType<unknown> | null;
  remarkGfm: unknown;
  rehypeSanitize: unknown;
};

const initialRendererState: MarkdownRenderer = {
  ReactMarkdown: null,
  remarkGfm: null,
  rehypeSanitize: null,
};

let cachedRenderer: MarkdownRenderer | null = null;
let attemptedMarkdownLoad = false;

export function CampaignWhyText({ markdown }: { markdown?: string }) {
  const [markdownRenderer, setMarkdownRenderer] = useState<MarkdownRenderer>(
    () => cachedRenderer ?? initialRendererState,
  );

  useEffect(() => {
    if (!markdown) {
      return;
    }

    if (cachedRenderer?.ReactMarkdown) {
      setMarkdownRenderer(cachedRenderer);
      return;
    }

    if (attemptedMarkdownLoad) {
      return;
    }

    let cancelled = false;

    async function loadMarkdownTooling() {
      try {
        const moduleNames = [
          "react-markdown",
          "remark-gfm",
          "rehype-sanitize",
        ] as const;

        const [reactMarkdownMod, remarkGfmMod, rehypeSanitizeMod] =
          await Promise.all(
            moduleNames.map(moduleName =>
              import(/* @vite-ignore */ moduleName).catch(error => {
                if (import.meta.env.DEV) {
                  console.info(
                    `Optional markdown module "${moduleName}" unavailable; falling back to plain text rendering.`,
                    error,
                  );
                }
                throw error;
              }),
            ),
          );

        if (cancelled) {
          return;
        }

        const ReactMarkdown =
          (reactMarkdownMod as { default?: ComponentType<unknown> })?.default ??
          (reactMarkdownMod as ComponentType<unknown>);

        const nextRenderer: MarkdownRenderer = {
          ReactMarkdown,
          remarkGfm: (remarkGfmMod as { default?: unknown })?.default ?? remarkGfmMod,
          rehypeSanitize:
            (rehypeSanitizeMod as { default?: unknown })?.default ??
            rehypeSanitizeMod,
        };

        if (!cancelled) {
          cachedRenderer = nextRenderer;
          attemptedMarkdownLoad = true;
          setMarkdownRenderer(nextRenderer);
        }
      } catch (error) {
        if (!cancelled) {
          attemptedMarkdownLoad = true;
          cachedRenderer = null;
          setMarkdownRenderer(initialRendererState);
        }
      }
    }

    loadMarkdownTooling();

    return () => {
      cancelled = true;
    };
  }, [markdown]);

  const MarkdownContent = useMemo(() => markdown?.trim() ?? "", [markdown]);

  if (!MarkdownContent) return null;

  const { ReactMarkdown, remarkGfm, rehypeSanitize } = markdownRenderer;

  const renderShell = (children: ReactNode) => (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6 md:p-10">
            <div
              className="
                campaign-why
                prose prose-slate max-w-none
                lg:prose-base
              "
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  if (!ReactMarkdown || !remarkGfm || !rehypeSanitize) {
    return renderShell(
      <pre className="whitespace-pre-wrap text-base text-slate-700">
        {MarkdownContent}
      </pre>,
    );
  }

  return renderShell(
    <ReactMarkdown
      remarkPlugins={[remarkGfm as never]}
      rehypePlugins={[rehypeSanitize as never]}
    >
      {MarkdownContent}
    </ReactMarkdown>,
  );
}
