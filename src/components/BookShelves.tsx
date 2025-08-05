import React from "react";
import { Plus } from "lucide-react";

interface ShelfProps {
  title: string;
  count: number;
  className?: string;
  onAddBook?: () => void;
}

function Shelf({ title, count, className = "", onAddBook }: ShelfProps) {
  return (
    <div
      className={`bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-white">{title}</h3>
        <span className="px-2.5 py-0.5 rounded-full text-sm bg-gray-800 text-gray-400">
          {count} books
        </span>
      </div>

      <div className="text-center py-8 text-gray-400">
        No books in this shelf
      </div>

      <button
        onClick={onAddBook}
        className="w-full mt-4 py-3 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add New Book
      </button>
    </div>
  );
}

export default function BookShelves() {
  const handleAddBook = (shelf: string) => {
    console.log(`Adding book to ${shelf}`);
  };

  return (
    <section>
      <h2 className="text-2xl font-display text-primary-400 mb-6">
        Smart Book Shelves
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Shelf
          title="Want to Read"
          count={0}
          onAddBook={() => handleAddBook("want-to-read")}
        />
        <Shelf
          title="Currently Reading"
          count={0}
          onAddBook={() => handleAddBook("currently-reading")}
        />
        <Shelf
          title="Finished Reading"
          count={0}
          onAddBook={() => handleAddBook("finished")}
        />
      </div>
    </section>
  );
}
