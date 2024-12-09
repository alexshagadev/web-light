'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
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

  const exportToPDF = () => {
    if (!results || results.length === 0) return;
  
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Web Accessibility Analyzer Results', 10, 10);
  
    let yPosition = 20; // Start below the title
    results.forEach((issue, index) => {
      if (yPosition > 270) {
        doc.addPage(); // Add a new page if content exceeds the page height
        yPosition = 20; // Reset y position
      }
  
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${issue.help}`, 10, yPosition);
      yPosition += 10;
  
      doc.setFontSize(12);
      doc.text(`Description: ${issue.description}`, 10, yPosition);
      yPosition += 10;
  
      doc.text(`Impact: ${issue.impact}`, 10, yPosition);
      yPosition += 15; // Add more space between issues
    });
  
    doc.save('accessibility-report.pdf');
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
        {results && results.length > 0 && (
          <>
            <ul className="list-disc list-inside text-gray-800">
              {results.map((issue, index) => (
                <li key={index} className="mb-4">
                  <strong>{issue.help}</strong>: {issue.description}
                  <br />
                  <small>Impact: {issue.impact}</small>
                </li>
              ))}
            </ul>
            {/* Export Button */}
            <button
              onClick={exportToPDF}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
            >
              Export to PDF
            </button>
          </>
        )}
      </div>

    </div>
  );
}
