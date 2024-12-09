'use client';

import { useState } from 'react';
import * as axe from 'axe-core';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const formatUrl = (inputUrl) => {
    // If the URL doesn't start with http:// or https://, prepend https://
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      return `https://${inputUrl}`;
    }
    return inputUrl;
  };

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);

    try {
      const formattedUrl = formatUrl(url); // Format the URL
      const response = await fetch(`/api/fetch-html?url=${encodeURIComponent(formattedUrl)}`);
      if (!response.ok) throw new Error('Failed to fetch the website');

      const html = await response.text();

      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      axe.run(container, {}, (err, result) => {
        if (err) throw err;
        setResults(result.violations);
      });

      document.body.removeChild(container);
    } catch (err) {
      setError('Error scanning the website. Please check the URL and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Web Accessibility Analyzer</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleScan}>
          <input
            type="text"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-gray-800 focus:ring focus:ring-blue-300 outline-none"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Scan Website
          </button>
        </form>
      </div>
      <div id="results" className="mt-6 w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800">Results</h2>
        {error && <p className="text-red-500">{error}</p>}
        {!results && !error && <p className="text-gray-600">Scan results will appear here.</p>}
        {results && (
          <ul className="list-disc list-inside text-gray-800">
            {results.map((issue, index) => (
              <li key={index}>
                <strong>{issue.help}</strong>: {issue.description}
                <br />
                <small>Impact: {issue.impact}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
