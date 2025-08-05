import React from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface TaskItemProps {
  title: string;
  date: string;
  color?: string;
}

function TaskItem({
  title,
  date,
  color = "border-primary-500",
}: TaskItemProps) {
  return (
    <div className={`border-l-4 ${color} pl-3`}>
      <h5 className="font-semibold text-white text-sm">{title}</h5>
      <p className="text-xs text-gray-400">{date}</p>
    </div>
  );
}

interface QuickNote {
  id: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface StickyNoteProps {
  note: QuickNote;
  onDelete: (id: string) => void;
}

function StickyNote({ note, onDelete }: StickyNoteProps) {
  const colorStyles = {
    yellow: "bg-yellow-200 text-yellow-900",
    pink: "bg-pink-200 text-pink-900",
    blue: "bg-blue-200 text-blue-900",
    green: "bg-green-200 text-green-900",
    purple: "bg-purple-200 text-purple-900",
    orange: "bg-orange-200 text-orange-900",
  };

  return (
    <div
      className={`${
        colorStyles[note.color as keyof typeof colorStyles]
      } p-3 rounded-lg transform hover:scale-105 transition-transform duration-300 shadow-lg group relative`}
    >
      <p className="text-sm font-medium">{note.content}</p>
      <button
        onClick={() => onDelete(note.id)}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-800"
        aria-label="Delete note"
        title="Delete note"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function PlanningSection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNoteText, setNewNoteText] = React.useState("");
  const [showAddNote, setShowAddNote] = React.useState(false);

  // Fetch tasks for this week
  const { data: allTasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiClient.getTasks(),
  });

  // Fetch quick notes from backend
  const { data: quickNotes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["quick-notes"],
    queryFn: () => apiClient.getQuickNotes(),
  });

  // Mutations for quick notes
  const createQuickNoteMutation = useMutation({
    mutationFn: (data: { content: string; color: string }) =>
      apiClient.createQuickNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-notes"] });
      setNewNoteText("");
      setShowAddNote(false);
      toast({
        title: "Note added",
        description: "Your quick note has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add quick note.",
        variant: "destructive",
      });
    },
  });

  const deleteQuickNoteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteQuickNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-notes"] });
      toast({
        title: "Note deleted",
        description: "Your quick note has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quick note.",
        variant: "destructive",
      });
    },
  });

  // Get tasks for this week
  const getThisWeekTasks = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return allTasks
      .filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      })
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 4);
  };

  const thisWeekTasks = getThisWeekTasks();

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const handleAddQuickNote = () => {
    if (!newNoteText.trim()) {
      toast({
        title: "Note cannot be empty",
        description: "Please enter some text for your note.",
        variant: "destructive",
      });
      return;
    }

    if (newNoteText.split(" ").length > 15) {
      toast({
        title: "Note too long",
        description: "Please keep your note to 15 words or less.",
        variant: "destructive",
      });
      return;
    }

    const colors = ["yellow", "pink", "blue", "green", "purple", "orange"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    createQuickNoteMutation.mutate({
      content: newNoteText.trim(),
      color: randomColor,
    });
  };

  const handleDeleteQuickNote = (id: string) => {
    deleteQuickNoteMutation.mutate(id);
  };

  return (
    <section>
      <h2 className="text-2xl font-display text-primary-400 mb-6">
        Planning & Tasks
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Notes */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-xl font-medium text-yellow-400 mb-6">
            Quick Notes
          </h3>
          {notesLoading ? (
            <div className="text-gray-400">Loading notes...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {quickNotes.map((note) => (
                  <StickyNote
                    key={note.id}
                    note={note}
                    onDelete={handleDeleteQuickNote}
                  />
                ))}
                {quickNotes.length < 8 && !showAddNote && (
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="bg-gray-800 text-gray-400 p-3 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                    aria-label="Add new note"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
              {showAddNote && (
                <div className="space-y-3">
                  <Input
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter your note (max 15 words)"
                    className="bg-gray-800 border-gray-700 text-white"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddQuickNote();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddQuickNote}
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                      disabled={createQuickNoteMutation.isPending}
                    >
                      {createQuickNoteMutation.isPending
                        ? "Adding..."
                        : "Add Note"}
                    </Button>
                    <Button
                      onClick={() => setShowAddNote(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* This Week */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-xl font-medium text-green-400 mb-6">This Week</h3>
          <div className="space-y-4 mb-4">
            {thisWeekTasks.length > 0 ? (
              thisWeekTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  title={task.title}
                  date={getDayName(task.dueDate)}
                  color="border-green-400"
                />
              ))
            ) : (
              <p className="text-gray-400">No tasks scheduled for this week</p>
            )}
          </div>
          <Button
            onClick={() => navigate("/planning")}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Full Calendar
          </Button>
        </div>
      </div>
    </section>
  );
}
