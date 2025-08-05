import { useState } from "react";
import { Save, Eye, EyeOff, Settings, Plus } from "lucide-react";

interface ChapterProps {
  id: string;
  title: string;
  content: string;
  wordCount: number;
}

function ChapterCard({
  title,
  wordCount,
  isSelected,
  onClick,
}: ChapterProps & { isSelected: boolean; onClick: () => void }) {
  return (
    <div
      className={`cursor-pointer transition-colors p-3 rounded-lg ${
        isSelected
          ? "bg-primary-500/20 border-primary-500"
          : "bg-gray-900/30 hover:bg-gray-900/50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">
          {wordCount} words
        </span>
      </div>
    </div>
  );
}

export default function WritingInterface() {
  const [isPreview, setIsPreview] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [content, setContent] = useState("");

  // Mock data - in a real app, this would come from your backend
  const chapters = [
    { id: "1", title: "Chapter 1: The Beginning", content: "", wordCount: 0 },
    { id: "2", title: "Chapter 2: The Journey", content: "", wordCount: 1250 },
    { id: "3", title: "Chapter 3: The Climax", content: "", wordCount: 2800 },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Chapters</h2>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
              aria-label="Add new chapter"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                {...chapter}
                isSelected={selectedChapter === chapter.id}
                onClick={() => setSelectedChapter(chapter.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Toolbar */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center gap-2"
                aria-label="Save changes"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors flex items-center gap-2"
                onClick={() => setIsPreview(!isPreview)}
                aria-label="Toggle preview mode"
              >
                {isPreview ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Preview
                  </>
                )}
              </button>
            </div>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6">
          {selectedChapter ? (
            <div className="max-w-3xl mx-auto">
              <textarea
                className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-gray-100 placeholder-gray-500"
                placeholder="Start writing your story..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a chapter to start writing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
