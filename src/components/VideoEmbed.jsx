import React from 'react';

function toEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);

    // YouTube
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      // already an /embed/:id ?
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' && parts[1]) return url;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }

    // Direct file (mp4/webm)
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(u.pathname)) return 'DIRECT_FILE';

    // Fallback: try as-is in an iframe
    return url;
  } catch {
    return null;
  }
}

export default function VideoEmbed({ url, title = 'Speaker video' }) {
  const embed = toEmbed(url);
  if (!embed) return null;

  if (embed === 'DIRECT_FILE') {
    return (
      <video
        className="rounded-xl w-full h-auto"
        controls
        playsInline
        preload="metadata"
        src={url}
      />
    );
  }

  return (
    <div className="video-embed">
      <div className="video-embed__ratio">
        <iframe
          src={embed}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
