"use client";

import Link from "next/link";
import { businessInfo } from "@/lib/business-info";

export function Footer() {
  const feedbackUrl = `mailto:${businessInfo.feedbackEmail}?subject=${encodeURIComponent(businessInfo.feedbackSubject)}`;

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark mt-auto">
      <div className="max-w-md mx-auto px-6 py-6 space-y-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
            {businessInfo.name}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{businessInfo.address}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{businessInfo.hours}</p>
          <a
            href={`tel:${businessInfo.phone}`}
            className="text-sm text-primary hover:underline mt-1 inline-block"
          >
            {businessInfo.phone}
          </a>
        </div>
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            ¿Tienes feedback? Escríbenos
          </a>
        </div>
      </div>
    </footer>
  );
}
