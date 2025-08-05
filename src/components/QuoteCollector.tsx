import { Quote as QuoteIcon } from "lucide-react";

interface QuoteCardProps {
  quote?: string;
  source?: string;
  isQuoteOfDay?: boolean;
}

function QuoteCard({ quote, source, isQuoteOfDay = false }: QuoteCardProps) {
  return (
    <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-amber-400">
          {isQuoteOfDay ? "Quote of the Day" : "Recent Highlights"}
        </h3>
        {isQuoteOfDay && <QuoteIcon className="text-amber-400/30" size={24} />}
      </div>

      {quote ? (
        <>
          <blockquote className="text-white text-lg italic mb-4">
            "{quote}"
          </blockquote>
          {source && (
            <cite className="text-gray-400 not-italic text-sm">— {source}</cite>
          )}
        </>
      ) : (
        <p className="text-gray-400">
          {isQuoteOfDay
            ? "No quotes available. Add your first quote to see it here!"
            : "No highlights yet. Start adding quotes to build your collection!"}
        </p>
      )}
    </div>
  );
}

export default function QuoteCollector() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display text-amber-400">
          Quote & Highlight Collector
        </h2>
        <button className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
          Add Quote
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuoteCard isQuoteOfDay />
        <QuoteCard />
      </div>
    </section>
  );
}
