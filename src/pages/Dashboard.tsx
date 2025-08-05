import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Book,
  Target,
  Clock,
  Quote,
  PenSquare,
  BookOpen,
  Plus,
  Edit,
} from "lucide-react";
import PlanningSection from "@/components/PlanningSection";
import { apiClient } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBgColor?: string;
  iconColor?: string;
}

function StatCard({
  icon,
  value,
  label,
  iconBgColor = "bg-primary-500/20",
  iconColor = "text-primary-500",
}: StatCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:bg-gray-900/50 dark:border-gray-800/50">
      <div
        className={`${iconBgColor} w-12 h-12 rounded-full flex items-center justify-center mb-4`}
      >
        <div className={`${iconColor}`}>{icon}</div>
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2 dark:text-white">
        {value}
      </div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

interface ShelfCardProps {
  title: string;
  count: number;
  className?: string;
  onAddBook: () => void;
}

function ShelfCard({
  title,
  count,
  className = "",
  onAddBook,
}: ShelfCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm dark:bg-gray-900/30 dark:backdrop-blur-sm dark:border-gray-800/50 ${className}`}
    >
      <h3 className="text-xl font-medium text-gray-900 mb-4 dark:text-white">
        {title}
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">{count} books</span>
        <button
          onClick={onAddBook}
          className="text-amber-600 hover:text-amber-700 transition-colors dark:text-primary-400 dark:hover:text-primary-300"
        >
          Add New Book
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goalForm, setGoalForm] = useState({
    targetBooks: "",
    targetPages: "",
  });

  // Fetch data
  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: () => apiClient.getBooks(),
  });

  const { data: writingProjects = [] } = useQuery({
    queryKey: ["writing-projects"],
    queryFn: () => apiClient.getWritingProjects(),
  });

  const { data: journals = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: () => apiClient.getJournals(),
  });

  const { data: activeGoal } = useQuery({
    queryKey: ["reading-goal"],
    queryFn: () => apiClient.getActiveReadingGoal(),
  });

  // Create reading goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (data: {
      targetBooks: number;
      targetPages?: number;
      year: number;
    }) => apiClient.createReadingGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading-goal"] });
      setShowGoalDialog(false);
      setGoalForm({ targetBooks: "", targetPages: "" });
      toast({
        title: "Success!",
        description: "Reading goal set successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set reading goal.",
        variant: "destructive",
      });
    },
  });

  // Get current reading book
  const currentlyReading = books.find(
    (book) => book.status === "currently_reading"
  );

  // Calculate reading goal progress
  const finishedThisYear = books.filter(
    (book) =>
      book.status === "finished" &&
      book.finishDate &&
      new Date(book.finishDate).getFullYear() === new Date().getFullYear()
  ).length;

  const targetBooks = activeGoal?.targetBooks || 30;
  const progressPercentage = Math.min(
    (finishedThisYear / targetBooks) * 100,
    100
  );

  // Get last updated writing project and journal
  const lastWritingProject =
    writingProjects.length > 0
      ? writingProjects.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        )[0]
      : null;

  const lastJournal =
    journals.length > 0
      ? journals.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        )[0]
      : null;

  const handleAddBook = () => {
    navigate("/library");
  };

  const handleSetGoal = () => {
    if (!goalForm.targetBooks.trim()) {
      toast({
        title: "Error",
        description: "Please enter a target number of books.",
        variant: "destructive",
      });
      return;
    }

    const targetBooks = parseInt(goalForm.targetBooks);
    const targetPages = goalForm.targetPages
      ? parseInt(goalForm.targetPages)
      : undefined;
    const currentYear = new Date().getFullYear();

    createGoalMutation.mutate({
      targetBooks,
      targetPages,
      year: currentYear,
    });
  };

  return (
    <div className="space-y-12 p-8 bg-gray-50 dark:bg-background">
      {/* Welcome Section */}
      <div className="welcome-section rounded-xl overflow-hidden">
        <div className="welcome-content p-8">
          <h1 className="text-4xl font-display mb-4 text-gray-900 dark:text-white">
            Good Evening, Bez:)
          </h1>
          <p className="text-xl text-gray-600 mb-8 dark:text-gray-400">
            Your stories deserve a space of their own, Your thoughts, your
            words, your world.
          </p>

          <div className="flex gap-4">
            <div className="status-card">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center dark:bg-amber-100">
                <BookOpen className="w-6 h-6 text-white dark:text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-500">
                  Currently Reading
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {currentlyReading?.title || "No book selected"}
                </div>
              </div>
            </div>

            <div className="status-card">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center dark:bg-emerald-100">
                <Target className="w-6 h-6 text-white dark:text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-500">
                  Reading Goal
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {finishedThisYear} of {targetBooks} books
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300 dark:from-emerald-500 dark:to-emerald-600"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                {!activeGoal && (
                  <Button
                    onClick={() => setShowGoalDialog(true)}
                    size="sm"
                    className="mt-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Set Goal
                  </Button>
                )}
                {activeGoal && (
                  <Button
                    onClick={() => setShowGoalDialog(true)}
                    size="sm"
                    variant="outline"
                    className="mt-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Goal
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-[#1a1f2e]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              {activeGoal ? "Edit Reading Goal" : "Set Reading Goal"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Target Books for {new Date().getFullYear()} *
              </label>
              <Input
                type="number"
                value={goalForm.targetBooks}
                onChange={(e) =>
                  setGoalForm((prev) => ({
                    ...prev,
                    targetBooks: e.target.value,
                  }))
                }
                placeholder="e.g., 30"
                min="1"
                className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Target Pages (Optional)
              </label>
              <Input
                type="number"
                value={goalForm.targetPages}
                onChange={(e) =>
                  setGoalForm((prev) => ({
                    ...prev,
                    targetPages: e.target.value,
                  }))
                }
                placeholder="e.g., 10000"
                min="1"
                className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowGoalDialog(false)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetGoal}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                disabled={createGoalMutation.isPending}
              >
                {createGoalMutation.isPending ? "Setting..." : "Set Goal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Book Shelves */}
      <section>
        <h2 className="text-2xl font-display text-gray-900 mb-6 dark:text-primary-400">
          Smart Book Shelves
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ShelfCard
            title="Want to Read"
            count={
              books.filter((book) => book.status === "want_to_read").length
            }
            onAddBook={handleAddBook}
          />
          <ShelfCard
            title="Currently Reading"
            count={
              books.filter((book) => book.status === "currently_reading").length
            }
            onAddBook={handleAddBook}
          />
          <ShelfCard
            title="Finished"
            count={books.filter((book) => book.status === "finished").length}
            onAddBook={handleAddBook}
          />
        </div>
      </section>

      {/* Quote & Highlight Collector */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display text-gray-900 dark:text-amber-400">
            Quote & Highlight Collector
          </h2>
          <button className="px-4 py-2 bg-amber-500/20 text-amber-600 rounded-lg hover:bg-amber-500/30 transition-colors dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30">
            Add Quote
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm dark:bg-gray-900/30 dark:backdrop-blur-sm dark:border-gray-800/50">
            <h3 className="text-xl font-medium text-gray-900 mb-4 dark:text-amber-400">
              Quote of the Day
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No quotes available. Add your first quote to see it here!
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm dark:bg-gray-900/30 dark:backdrop-blur-sm dark:border-gray-800/50">
            <h3 className="text-xl font-medium text-gray-900 mb-4 dark:text-amber-400">
              Recent Highlights
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No highlights yet. Start adding quotes to build your collection!
            </p>
          </div>
        </div>
      </section>

      {/* Journaling & Writing Studio */}
      <section>
        <h2 className="text-2xl font-display text-gray-900 mb-6 dark:text-primary-400">
          Journaling & Writing Studio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm dark:bg-[#1a1f2e] dark:border-border/10">
            <h3 className="text-xl font-medium text-gray-900 mb-4 dark:text-pink-400">
              Journals
            </h3>
            <p className="text-gray-600 mb-4 dark:text-gray-400">
              Capture your thoughts and reflections in beautiful journals
            </p>
            <div className="space-y-3">
              {lastJournal ? (
                <div
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors dark:bg-[#12151f] dark:hover:bg-gray-800/30"
                  onClick={() => navigate(`/journals/${lastJournal.id}`)}
                >
                  <h4 className="font-medium text-gray-900 mb-1 dark:text-white">
                    {lastJournal.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last updated:{" "}
                    {new Date(
                      lastJournal.updatedAt || lastJournal.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-500">
                  No journals yet
                </p>
              )}
            </div>
            <Button
              onClick={() => navigate("/journals")}
              className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90"
            >
              Create New Journal
            </Button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm dark:bg-[#1a1f2e] dark:border-border/10">
            <h3 className="text-xl font-medium text-gray-900 mb-4 dark:text-blue-400">
              Writings
            </h3>
            <p className="text-gray-600 mb-4 dark:text-gray-400">
              Start your next writing project and bring your ideas to life
            </p>
            <div className="space-y-3">
              {lastWritingProject ? (
                <div
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors dark:bg-[#12151f] dark:hover:bg-gray-800/30"
                  onClick={() => navigate(`/writing/${lastWritingProject.id}`)}
                >
                  <h4 className="font-medium text-gray-900 mb-1 dark:text-white">
                    {lastWritingProject.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last updated:{" "}
                    {new Date(
                      lastWritingProject.updatedAt ||
                        lastWritingProject.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-500">
                  No writing projects yet
                </p>
              )}
            </div>
            <Button
              onClick={() => navigate("/writing")}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90"
            >
              Start New Project
            </Button>
          </div>
        </div>
      </section>

      {/* Reading Analytics */}
      <section>
        <h2 className="text-2xl font-display text-gray-900 mb-6 dark:text-green-400">
          Reading Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Book className="w-6 h-6" />}
            value={finishedThisYear}
            label="Books This Year"
            iconBgColor="bg-amber-500/20 dark:bg-primary-500/20"
            iconColor="text-amber-600 dark:text-primary-400"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            value="147h"
            label="Reading Time"
            iconBgColor="bg-emerald-500/20"
            iconColor="text-emerald-600 dark:text-green-400"
          />
          <StatCard
            icon={<Quote className="w-6 h-6" />}
            value="328"
            label="Highlights"
            iconBgColor="bg-purple-500/20"
            iconColor="text-purple-600 dark:text-purple-400"
          />
          <StatCard
            icon={<PenSquare className="w-6 h-6" />}
            value="156"
            label="Journal Entries"
            iconBgColor="bg-amber-500/20"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>
      </section>
      <PlanningSection />

      {/* Footer */}
      <footer className="w-full mt-16 border-t border-gray-200 bg-white py-8 flex items-center justify-between px-8 dark:border-border dark:bg-background">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-2 flex items-center justify-center dark:from-[#c4a574] dark:to-[#e5bf7d]">
            <BookOpen className="text-white w-5 h-5 dark:text-charcoal" />
          </span>
          <span className="text-gray-500 dark:text-muted-foreground">
            BexShelf © 2024
          </span>
        </div>
        <div className="flex items-center gap-8">
          <button className="text-gray-500 hover:text-amber-600 transition-colors dark:text-muted-foreground dark:hover:text-primary">
            Export Data
          </button>
          <button className="text-gray-500 hover:text-amber-600 transition-colors dark:text-muted-foreground dark:hover:text-primary">
            Sync Status
          </button>
        </div>
      </footer>
    </div>
  );
}
