'use client';

import React from 'react';
import { PawIcon } from './icons';

export interface VetSummaryProps {
  htmlContent: string | null;
  petName?: string;
  generatedAt?: string | null;
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4 p-5 bg-white rounded-[16px] border border-[#f0f0f0]">
      <div className="h-5 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-5 bg-gray-100 rounded w-1/2 mt-6" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
      <div className="h-5 bg-gray-100 rounded w-1/2 mt-4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

function extractBody(html: string): string {
  // Strip <html><head>...</head> and </html> wrappers, keep body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1];
  // No body tags — strip any <html>, <head>, <style> blocks
  return html
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head>[\s\S]*?<\/head>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '');
}

export function VetSummary({ htmlContent, petName, generatedAt }: VetSummaryProps) {
  if (htmlContent === null) {
    return <Skeleton />;
  }

  if (!htmlContent) {
    return (
      <div className="p-8 border-2 border-dashed border-[#e0e0e0] rounded-[16px] text-center">
        <p className="text-[#bbb] text-[14px] m-0">No report available yet. Submit at least one check-in first.</p>
      </div>
    );
  }

  const bodyContent = extractBody(htmlContent);

  return (
    <div className="vet-report print:shadow-none">
      {/* Report card with app branding */}
      <div className="bg-white rounded-[20px] border border-[#e8e8e8] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.07)] print:border-0 print:shadow-none print:rounded-none">

        {/* Branded header */}
        <div style={{ background: '#111', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PawIcon size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Kitten Companion</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            Behavioral Baseline Report
          </h2>
          {petName && (
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              {petName}&apos;s health summary
            </p>
          )}
          {generatedAt && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              Generated {new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Report body — override server styles to match app design */}
        <style>{`
          .vet-report-body h1 { display: none; }
          .vet-report-body p:first-child { display: none; }
          .vet-report-body .section { padding: 0 0 20px; border-bottom: 1px solid #f0f0f0; margin: 0; }
          .vet-report-body .section:last-child { border-bottom: none; padding-bottom: 0; }
          .vet-report-body .heading {
            font-size: 13px !important;
            font-weight: 700 !important;
            letter-spacing: 0.06em !important;
            text-transform: uppercase !important;
            color: #888 !important;
            margin: 0 0 10px !important;
          }
          .vet-report-body p {
            font-size: 14px !important;
            line-height: 1.65 !important;
            color: #444 !important;
            margin: 0 0 12px !important;
          }
          .vet-report-body table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 13px !important;
            margin: 0 !important;
          }
          .vet-report-body th {
            background: #f7f7f7 !important;
            color: #888 !important;
            font-weight: 600 !important;
            font-size: 11px !important;
            letter-spacing: 0.05em !important;
            text-transform: uppercase !important;
            padding: 8px 12px !important;
            border: none !important;
            border-bottom: 1px solid #eee !important;
            text-align: left !important;
          }
          .vet-report-body td {
            padding: 8px 12px !important;
            border: none !important;
            border-bottom: 1px solid #f5f5f5 !important;
            color: #333 !important;
          }
          .vet-report-body tr:last-child td { border-bottom: none !important; }
          .vet-report-body ul { margin: 0 0 12px !important; padding-left: 20px !important; }
          .vet-report-body li { font-size: 14px !important; color: #444 !important; line-height: 1.6 !important; margin-bottom: 4px !important; }
        `}</style>
        <div
          className="vet-report-body px-6 py-5 space-y-5"
          dangerouslySetInnerHTML={{ __html: bodyContent }}
        />
      </div>
    </div>
  );
}

export default VetSummary;
