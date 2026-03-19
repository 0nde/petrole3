import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "../../i18n/useI18n";

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pub_date: string;
  source_id: string;
  source_name: string;
}

interface NewsSource {
  id: string;
  name: string;
  name_fr: string;
  lang: string;
}

interface NewsResponse {
  items: NewsItem[];
  sources: NewsSource[];
}

async function fetchNews(source?: string): Promise<NewsResponse> {
  const url = source
    ? `/api/v1/news?limit=30&source=${source}`
    : `/api/v1/news?limit=30`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

function formatDate(dateStr: string, lang: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function NewsPanel() {
  const { lang } = useI18n();
  const [sourceFilter, setSourceFilter] = useState<string | undefined>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["news", sourceFilter],
    queryFn: () => fetchNews(sourceFilter),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-petro-700/50">
        <h3 className="text-sm font-semibold text-petro-100 mb-2">
          {lang === "fr" ? "Actualités pétrole" : "Oil News"}
        </h3>
        <p className="text-[10px] text-petro-500 mb-2">
          {lang === "fr"
            ? "Flux d'actualités en temps réel depuis des sources officielles (gratuit, sans clé API)."
            : "Real-time news feed from official sources (free, no API key required)."}
        </p>

        {/* Source filter */}
        {data?.sources && (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setSourceFilter(undefined)}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                !sourceFilter
                  ? "bg-petro-600 text-white"
                  : "bg-petro-800/60 text-petro-400 hover:bg-petro-700/60"
              }`}
            >
              {lang === "fr" ? "Toutes" : "All"}
            </button>
            {data.sources.map((s) => (
              <button
                key={s.id}
                onClick={() => setSourceFilter(s.id)}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                  sourceFilter === s.id
                    ? "bg-petro-600 text-white"
                    : "bg-petro-800/60 text-petro-400 hover:bg-petro-700/60"
                }`}
              >
                {lang === "fr" ? s.name_fr : s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* News list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-petro-400 text-sm">
            {lang === "fr" ? "Chargement des actualités..." : "Loading news..."}
          </div>
        )}

        {error && (
          <div className="p-4 text-red-400 text-sm">
            {lang === "fr"
              ? "Erreur lors du chargement des actualités. Vérifiez votre connexion internet."
              : "Error loading news. Check your internet connection."}
          </div>
        )}

        {data?.items && data.items.length === 0 && (
          <div className="p-4 text-petro-500 text-sm">
            {lang === "fr" ? "Aucune actualité disponible." : "No news available."}
          </div>
        )}

        {data?.items.map((item, i) => (
          <a
            key={`${item.source_id}-${i}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 border-b border-petro-800/50 hover:bg-petro-800/30 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-petro-100 group-hover:text-white transition-colors leading-snug mb-1">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-[10px] text-petro-400 leading-relaxed line-clamp-2 mb-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-petro-600">
                  <span className="px-1.5 py-0.5 rounded bg-petro-800/60">{item.source_name}</span>
                  {item.pub_date && <span>{formatDate(item.pub_date, lang)}</span>}
                </div>
              </div>
              <span className="text-petro-600 group-hover:text-petro-400 transition-colors shrink-0 mt-1">
                ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
