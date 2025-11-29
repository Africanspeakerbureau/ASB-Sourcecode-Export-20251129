import React from 'react';

export default function RichText({ html }) {
  return (
    <div className="text-gray-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
