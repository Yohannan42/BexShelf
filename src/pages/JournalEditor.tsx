import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api";
import { Journal } from "@shared/schema";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Palette,
  Settings,
  Download,
  Share,
  Eye,
  EyeOff,
} from "lucide-react";

const journalThemes = [
  {
    id: "classic",
    name: "Classic",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-900",
    accentColor: "bg-amber-100",
  },
  {
    id: "midnight",
    name: "Midnight",
    bgColor: "bg-gray-900",
    borderColor: "border-gray-700",
    textColor: "text-gray-100",
    accentColor: "bg-gray-800",
  },
  {
    id: "rose",
    name: "Rose",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-900",
    accentColor: "bg-rose-100",
  },
  {
    id: "ocean",
    name: "Ocean",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    accentColor: "bg-blue-100",
  },
  {
    id: "forest",
    name: "Forest",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-900",
    accentColor: "bg-green-100",
  },
  {
    id: "lavender",
    name: "Lavender",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-900",
    accentColor: "bg-purple-100",
  },
];

export default function JournalEditor() {
  const { journalId } = useParams<{ journalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTheme, setSelectedTheme] = useState(journalThemes[0]);
  const [content, setContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch journal details
  const { data: journal } = useQuery<Journal>({
    queryKey: ["journal", journalId],
    queryFn: () => apiClient.getJournal(journalId!),
    enabled: !!journalId,
  });

  // Fetch journal content
  useQuery({
    queryKey: ["journal-content", journalId],
    queryFn: () => apiClient.getJournalContent(journalId!),
    enabled: !!journalId,
    onSuccess: (data) => {
      setContent(data.content);
      const theme =
        journalThemes.find((t) => t.id === data.theme) || journalThemes[0];
      setSelectedTheme(theme);
    },
  });

  // Save content mutation
  const saveContentMutation = useMutation({
    mutationFn: (data: { content: string; wordCount: number; theme: string }) =>
      apiClient.saveJournalContent(journalId!, data),
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast({
        title: "Saved!",
        description: "Your journal entry has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save journal entry.",
        variant: "destructive",
      });
    },
  });

  // Auto-save content
  useEffect(() => {
    if (!autoSave || !content || !journalId) return;

    const timeoutId = setTimeout(() => {
      const wordCount = content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      saveContentMutation.mutate({
        content,
        wordCount,
        theme: selectedTheme.id,
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [content, autoSave, selectedTheme.id, journalId]);

  // Manual save function
  const handleManualSave = () => {
    const wordCount = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    saveContentMutation.mutate({
      content,
      wordCount,
      theme: selectedTheme.id,
    });
  };

  // Word count calculation
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Journal not found</p>
          <Button onClick={() => navigate("/journals")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${selectedTheme.bgColor} transition-colors duration-300`}
    >
      {/* Header */}
      <div
        className={`border-b ${selectedTheme.borderColor} ${selectedTheme.accentColor} p-4`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/journals")}
              className={`${selectedTheme.textColor} hover:${selectedTheme.accentColor}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1
                className={`text-xl font-semibold ${selectedTheme.textColor}`}
              >
                {journal.title}
              </h1>
              <p className={`text-sm ${selectedTheme.textColor} opacity-70`}>
                Journal • {wordCount} words
                {lastSaved && (
                  <span className="ml-2">
                    • Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`${selectedTheme.textColor} hover:${selectedTheme.accentColor}`}
            >
              <Palette className="w-4 h-4 mr-2" />
              Theme
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`${selectedTheme.textColor} hover:${selectedTheme.accentColor}`}
            >
              {isFullscreen ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSave}
              disabled={saveContentMutation.isPending}
              className={`${selectedTheme.textColor} hover:${selectedTheme.accentColor}`}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveContentMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${selectedTheme.textColor} hover:${selectedTheme.accentColor}`}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      {showThemeSelector && (
        <div
          className={`border-b ${selectedTheme.borderColor} ${selectedTheme.accentColor} p-4`}
        >
          <div className="max-w-7xl mx-auto">
            <h3
              className={`text-sm font-medium mb-3 ${selectedTheme.textColor}`}
            >
              Choose Journal Theme
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {journalThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setSelectedTheme(theme);
                    setShowThemeSelector(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTheme.id === theme.id
                      ? `${theme.borderColor} ${theme.accentColor}`
                      : `${theme.borderColor} ${theme.bgColor} hover:${theme.accentColor}`
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded ${theme.accentColor} mb-2`}
                  ></div>
                  <p className={`text-xs font-medium ${theme.textColor}`}>
                    {theme.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Writing Area */}
      <div
        className={`max-w-4xl mx-auto p-6 ${
          isFullscreen ? "min-h-screen" : "min-h-[calc(100vh-200px)]"
        }`}
      >
        <div
          className={`rounded-lg border-2 ${selectedTheme.borderColor} ${selectedTheme.bgColor} p-8 shadow-lg`}
        >
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts, feelings, and experiences here..."
            className={`w-full h-[calc(100vh-300px)] resize-none border-0 bg-transparent text-lg leading-relaxed ${selectedTheme.textColor} placeholder:${selectedTheme.textColor} placeholder:opacity-50 focus:ring-0 focus:outline-none`}
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>

        {/* Writing Stats */}
        <div
          className={`mt-6 flex items-center justify-between text-sm ${selectedTheme.textColor} opacity-70`}
        >
          <div className="flex items-center gap-6">
            <span>{wordCount} words</span>
            <span>{content.length} characters</span>
            <span>{Math.round(wordCount / 5)} minutes read</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleManualSave}
              disabled={saveContentMutation.isPending}
              className={`${selectedTheme.textColor} hover:${selectedTheme.accentColor}`}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveContentMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`${selectedTheme.textColor} hover:${selectedTheme.accentColor}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`${selectedTheme.textColor} hover:${selectedTheme.accentColor}`}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
