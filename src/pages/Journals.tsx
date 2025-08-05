import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Search,
  Lock,
  Globe,
} from "lucide-react";
import { Journal } from "@shared/schema";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

function CreateJournalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    cover: "",
    privacy: "private" as "private" | "public",
  });
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createJournalMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      cover?: string;
      privacy: "private" | "public";
    }) => apiClient.createJournal(data),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast({
        title: "Success!",
        description: "Journal created successfully.",
      });
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setForm({ title: "", description: "", cover: "", privacy: "private" });
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create journal.",
        variant: "destructive",
      });
    },
  });

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      toast({
        title: "Error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }

    createJournalMutation.mutate({
      title: form.title,
      description: form.description,
      cover: form.cover,
      privacy: form.privacy,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            Create New Journal
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-semibold mb-1 text-black">
              Journal Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
              placeholder="Enter your journal title"
              className="w-full rounded border-2 border-pink-200 p-3 text-lg bg-white text-black focus:ring-2 focus:ring-pink-300 outline-none"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1 text-black">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Describe your journal..."
              className="w-full rounded border-2 border-pink-100 p-3 min-h-[60px] bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1 text-black">
              Cover Image URL
            </label>
            <input
              name="cover"
              value={form.cover}
              onChange={handleInputChange}
              placeholder="Paste image URL (optional)"
              className="w-full rounded border-2 border-pink-100 p-3 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1 text-black">
              Privacy
            </label>
            <select
              name="privacy"
              value={form.privacy}
              onChange={handleInputChange}
              title="Select privacy setting for your journal"
              className="w-full rounded border-2 border-pink-100 p-3 bg-white text-black"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-gradient-to-r from-pink-400 to-pink-600 text-white font-semibold hover:opacity-90 disabled:opacity-50"
              disabled={createJournalMutation.isPending}
            >
              {createJournalMutation.isPending
                ? "Creating..."
                : success
                ? "Created!"
                : "Create Journal"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Journals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();
  const {
    data: journals = [],
    isLoading,
    error,
  } = useQuery<Journal[]>({
    queryKey: ["journals"],
    queryFn: () => apiClient.getJournals(),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteJournalMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast({
        title: "Success!",
        description: "Journal deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete journal.",
        variant: "destructive",
      });
    },
  });

  function handleDelete(journalId: string) {
    if (confirm("Are you sure you want to delete this journal?")) {
      deleteJournalMutation.mutate(journalId);
    }
  }

  // Filter journals based on search query
  const filteredJournals = journals.filter(
    (journal) =>
      journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journal.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    console.error("Error fetching journals:", error);
  }

  return (
    <div className="min-h-screen space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display text-foreground mb-2">
            Beza's Brain Dump
          </h1>
          <p className="text-muted-foreground text-lg">
            Dear Journal, Merry is Backkkk
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-pink-400 to-pink-600 hover:opacity-90 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Journal
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search your journals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Journals List or Empty State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 mb-6 text-muted-foreground">
            <BookOpen className="w-full h-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-medium text-foreground mb-4">
            Loading journals...
          </h2>
        </div>
      ) : filteredJournals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJournals.map((journal) => (
            <div
              key={journal.id}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {journal.title}
                  </h3>
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {journal.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(journal.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-2">
                  {journal.privacy === "private" ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground capitalize">
                    {journal.privacy}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(journal.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/journals/${journal.id}`)}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-pink-600 hover:opacity-90 text-white"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Writing
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 mb-6 text-muted-foreground">
            <BookOpen className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-medium text-foreground mb-4">
            {searchQuery
              ? "No journals found"
              : "Start Your Journaling Journey"}
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            {searchQuery
              ? "Try adjusting your search terms."
              : "Create your first journal and begin documenting your thoughts, feelings, and experiences."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-pink-400 to-pink-600 hover:opacity-90 text-white px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Journal
            </Button>
          )}
        </div>
      )}

      <CreateJournalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
