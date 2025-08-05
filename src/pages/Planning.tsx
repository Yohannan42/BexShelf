import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Target,
  MessageSquare,
  Star,
  Heart,
  Plus,
  X,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import VisionBoard from "@/components/VisionBoard";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function NoteModal({
  open,
  onOpenChange,
  note,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: any;
  onSubmit: (data: {
    title: string;
    content: string;
    isPinned?: boolean;
    tags?: string[];
  }) => void;
}) {
  const [form, setForm] = useState({
    title: note?.title || "",
    content: note?.content || "",
    isPinned: note?.isPinned || false,
    tags: note?.tags || [],
  });

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title,
        content: note.content,
        isPinned: note.isPinned || false,
        tags: note.tags || [],
      });
    } else {
      setForm({
        title: "",
        content: "",
        isPinned: false,
        tags: [],
      });
    }
  }, [note, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            {note ? "Edit Note" : "Create New Note"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Note title..."
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Write your note here..."
              className="w-full min-h-[200px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={form.isPinned}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isPinned: e.target.checked }))
                }
                className="rounded"
              />
              <label htmlFor="pinned" className="text-sm">
                Pin note
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-400 to-purple-400 text-white"
            >
              {note ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NoteViewModal({
  open,
  onOpenChange,
  note,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {note.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {note.isPinned && (
                <Star className="w-5 h-5 text-pink-500 fill-pink-500" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-gray-400 hover:text-blue-500"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {note.content}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </span>
            <span>
              Created: {new Date(note.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DroppableContainer({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: "container",
      status: id,
    },
  });

  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

function DraggableTask({
  task,
  onDelete,
}: {
  task: any;
  onDelete: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border cursor-grab active:cursor-grabbing transition-all ${
        task.status === "todo"
          ? "border-pink-200 dark:border-pink-500/30"
          : task.status === "doing"
          ? "border-purple-200 dark:border-purple-500/30"
          : "border-indigo-200 dark:border-indigo-500/30"
      } ${isDragging ? "opacity-50 scale-105 shadow-lg" : "hover:shadow-md"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {task.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function CalendarSection({
  currentDate,
  setCurrentDate,
  tasks,
  onDateClick,
}: {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  tasks: any[];
  onDateClick: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart);
  const totalCells = Math.ceil((days.length + startOffset) / 7) * 7;

  function handleDateClick(dayNum: number) {
    if (dayNum > 0 && dayNum <= days.length) {
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        dayNum
      );
      console.log(
        `Calendar clicked: Day ${dayNum}, New date: ${newDate.toISOString()}, Formatted: ${format(
          newDate,
          "yyyy-MM-dd"
        )}`
      );
      setCurrentDate(newDate);
      onDateClick(newDate);
    }
  }

  function getTasksForDate(date: Date) {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasks.filter((task) => task.dueDate === dateStr);
  }
  return (
    <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-pink-200 dark:from-[#8B1D44] dark:via-[#48246D] dark:to-[#492365] rounded-xl p-6 border-2 border-dashed border-pink-300 dark:border-pink-400">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-white"
          >
            ←
          </Button>
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text">
            {format(currentDate, "LLLL yyyy")}
          </h2>
          <Button
            variant="ghost"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-white"
          >
            →
          </Button>
        </div>
        <div className="flex gap-1 bg-transparent">
          <Button
            className="bg-pink-200 text-pink-700 dark:bg-black dark:text-white px-4 py-1 rounded-full text-sm"
            size="sm"
          >
            Month
          </Button>
          <Button
            className="bg-white text-pink-600 dark:bg-[#8B1D44] dark:text-white px-4 py-1 rounded-full text-sm border border-pink-200 dark:border-transparent"
            size="sm"
            variant="ghost"
          >
            Week
          </Button>
          <Button
            className="bg-white text-pink-600 dark:bg-[#8B1D44] dark:text-white px-4 py-1 rounded-full text-sm border border-pink-200 dark:border-transparent"
            size="sm"
            variant="ghost"
          >
            Day
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-base font-medium text-pink-600 dark:text-white mb-2"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: totalCells }).map((_, idx) => {
          const dayNum = idx - startOffset + 1;
          const isCurrentMonth = dayNum > 0 && dayNum <= days.length;
          const isSelected = dayNum === currentDate.getDate();
          return (
            <div
              key={idx}
              onClick={() => handleDateClick(dayNum)}
              className={`rounded-xl min-h-[70px] flex items-start justify-start px-3 py-2 border border-dashed cursor-pointer transition-colors ${
                isSelected
                  ? "border-pink-400 bg-pink-200 text-pink-800 dark:border-pink-200 dark:bg-gradient-to-br dark:from-pink-700/40 dark:to-pink-400/30 dark:text-white font-bold"
                  : "border-pink-300 bg-white/50 text-gray-700 dark:border-pink-400/40 dark:bg-transparent dark:text-white hover:bg-pink-100 dark:hover:bg-pink-500/20"
              } ${
                isCurrentMonth
                  ? "text-gray-700 dark:text-white"
                  : "text-gray-400 dark:text-pink-900/30"
              }`}
            >
              {isCurrentMonth ? (
                <div className="w-full h-full flex flex-col">
                  <span className="text-lg font-medium">{dayNum}</span>
                  {isSelected && (
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-1"></div>
                  )}
                  {/* Task previews */}
                  {(() => {
                    const dayDate = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      dayNum
                    );
                    const dayTasks = getTasksForDate(dayDate);
                    return (
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 2).map((task, taskIdx) => (
                          <div
                            key={taskIdx}
                            className={`text-xs px-1 py-0.5 rounded truncate font-medium ${
                              task.status === "todo"
                                ? "bg-pink-200 text-pink-800 dark:bg-pink-500/30 dark:text-pink-200 border border-pink-300 dark:border-pink-400"
                                : task.status === "doing"
                                ? "bg-purple-200 text-purple-800 dark:bg-purple-500/30 dark:text-purple-200 border border-purple-300 dark:border-purple-400"
                                : "bg-indigo-200 text-indigo-800 dark:bg-indigo-500/30 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-400"
                            }`}
                            title={`${task.title} (${task.status})`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                ""
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotesSection() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: allNotes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: () => apiClient.getNotes(),
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      isPinned?: boolean;
      tags?: string[];
    }) => apiClient.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["pinned-notes"] });
      toast({
        title: "Success!",
        description: "Note created successfully.",
      });
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create note.",
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["pinned-notes"] });
      toast({
        title: "Success!",
        description: "Note updated successfully.",
      });
      setShowCreateModal(false);
      setSelectedNote(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update note.",
        variant: "destructive",
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["pinned-notes"] });
      toast({
        title: "Success!",
        description: "Note deleted successfully.",
      });
      setSelectedNote(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note.",
        variant: "destructive",
      });
    },
  });

  // Filter and search notes
  const filteredNotes = allNotes.filter((note) => {
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "pinned" && note.isPinned) ||
      (filter === "recent" &&
        new Date(note.updatedAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesFilter;
  });

  function handleCreateNote() {
    setEditingNote(null);
    setShowCreateModal(true);
  }

  function handleEditNote(note: any) {
    setEditingNote(note);
    setShowCreateModal(true);
  }

  function handleDeleteNote(noteId: string) {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(noteId);
    }
  }

  function handleTogglePin(note: any) {
    updateNoteMutation.mutate({
      id: note.id,
      data: { isPinned: !note.isPinned },
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          <span className="text-xl font-bold text-pink-600 dark:text-pink-400">
            Notes
          </span>
        </div>
        <Button
          onClick={handleCreateNote}
          className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-semibold px-6 py-2 rounded-lg"
        >
          <Plus className="w-5 h-5 mr-2" /> New Note
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-400"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-pink-200 text-pink-700 dark:bg-pink-500/30 dark:text-pink-200"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          All Notes
        </button>
        <button
          onClick={() => setFilter("pinned")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "pinned"
              ? "bg-pink-200 text-pink-700 dark:bg-pink-500/30 dark:text-pink-200"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Pinned
        </button>
        <button
          onClick={() => setFilter("recent")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "recent"
              ? "bg-pink-200 text-pink-700 dark:bg-pink-500/30 dark:text-pink-200"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Recent
        </button>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate flex-1">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 ml-2">
                  {note.isPinned && (
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(note);
                    }}
                    className="text-gray-400 hover:text-pink-500"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        note.isPinned ? "fill-pink-500 text-pink-500" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3">
                {note.content}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNote(note);
                    }}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">
            {searchQuery ? "No notes found" : "No notes yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery
              ? "Try adjusting your search"
              : "Create your first note to get started"}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleCreateNote}
              className="bg-gradient-to-r from-pink-400 to-purple-400 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Note
            </Button>
          )}
        </div>
      )}

      {/* Note Creation/Edit Modal */}
      <NoteModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        note={editingNote}
        onSubmit={(data) => {
          if (editingNote) {
            updateNoteMutation.mutate({ id: editingNote.id, data });
          } else {
            createNoteMutation.mutate(data);
          }
        }}
      />

      {/* Note View Modal */}
      <NoteViewModal
        open={!!selectedNote}
        onOpenChange={(open) => !open && setSelectedNote(null)}
        note={selectedNote}
        onEdit={() => {
          setEditingNote(selectedNote);
          setShowCreateModal(true);
          setSelectedNote(null);
        }}
        onDelete={() => selectedNote && handleDeleteNote(selectedNote.id)}
      />
    </div>
  );
}

function VisionSection() {
  const [year, setYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(6); // July
  const [showVisionBoard, setShowVisionBoard] = useState(false);
  const [currentBoard, setCurrentBoard] = useState<any>(null);
  const [boardImages, setBoardImages] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch vision boards for the current year
  const { data: visionBoards = [] } = useQuery({
    queryKey: ["vision-boards", year],
    queryFn: () => apiClient.getVisionBoards(),
  });

  // Create vision board mutation
  const createVisionBoardMutation = useMutation({
    mutationFn: (data: {
      year: number;
      month: number;
      title?: string;
      description?: string;
    }) => apiClient.createVisionBoard(data),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ["vision-boards"] });
      setCurrentBoard(newBoard);
      setBoardImages(newBoard.images || []);
      setShowVisionBoard(true);
      toast({
        title: "Success!",
        description: "Vision board created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vision board.",
        variant: "destructive",
      });
    },
  });

  function handleMonthClick(monthIndex: number) {
    setSelectedMonth(monthIndex);

    // Check if vision board exists for this month
    const existingBoard = visionBoards.find(
      (board) => board.year === year && board.month === monthIndex
    );

    if (existingBoard) {
      setCurrentBoard(existingBoard);
      setBoardImages(existingBoard.images || []);
      setShowVisionBoard(true);
    } else {
      // Create new vision board
      createVisionBoardMutation.mutate({
        year,
        month: monthIndex,
        title: `${months[monthIndex]} ${year} Vision Board`,
      });
    }
  }

  function handleCloseVisionBoard() {
    setShowVisionBoard(false);
    setCurrentBoard(null);
    setBoardImages([]);
  }

  function handleImagesChange(images: any[]) {
    setBoardImages(images);
  }

  // Get image count for each month
  function getMonthImageCount(monthIndex: number) {
    const board = visionBoards.find(
      (board) => board.year === year && board.month === monthIndex
    );
    return board?.images?.length || 0;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-2 mb-2">
          ✨ Vision Board
        </div>
        <div className="text-muted-foreground mb-4">
          Your dreams organized by month
        </div>
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setYear((y) => y - 1)}
            className="text-pink-600 dark:text-pink-400"
          >
            ←
          </Button>
          <span className="text-xl font-bold text-foreground">{year}</span>
          <Button
            variant="ghost"
            onClick={() => setYear((y) => y + 1)}
            className="text-pink-600 dark:text-pink-400"
          >
            →
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map((month, idx) => (
          <div
            key={month}
            className={`rounded-xl border-2 ${
              selectedMonth === idx
                ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-[#8B1D44] dark:to-[#492365]"
                : "border-pink-300 dark:border-pink-400 bg-card"
            } p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105`}
            onClick={() => handleMonthClick(idx)}
          >
            <span className="font-semibold text-foreground text-lg mb-2">
              {month}
            </span>
            <span className="text-pink-600 dark:text-gray-300 text-sm border border-pink-300 dark:border-pink-400 rounded-full px-4 py-1 bg-pink-50 dark:bg-transparent">
              {getMonthImageCount(idx)} dreams
            </span>
          </div>
        ))}
      </div>

      {/* Vision Board Modal */}
      {showVisionBoard && currentBoard && (
        <VisionBoard
          boardId={currentBoard.id}
          year={year}
          month={selectedMonth}
          images={boardImages}
          onImagesChange={handleImagesChange}
          onClose={handleCloseVisionBoard}
        />
      )}
    </div>
  );
}

function TaskViewModal({
  open,
  onOpenChange,
  selectedDate,
  tasks,
  onDeleteTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  tasks: any[];
  onDeleteTask: (taskId: string) => void;
}) {
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const doingTasks = tasks.filter((task) => task.status === "doing");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Tasks for {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* To Do Tasks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <h3 className="font-semibold text-pink-700 dark:text-pink-400">
                To Do ({todoTasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-pink-50 dark:bg-pink-500/10 rounded-lg p-3 border border-pink-200 dark:border-pink-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {todoTasks.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No to-do tasks for this day
                </p>
              )}
            </div>
          </div>

          {/* Doing Tasks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <h3 className="font-semibold text-purple-700 dark:text-purple-400">
                Doing ({doingTasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {doingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-3 border border-purple-200 dark:border-purple-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {doingTasks.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No in-progress tasks for this day
                </p>
              )}
            </div>
          </div>

          {/* Done Tasks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <h3 className="font-semibold text-indigo-700 dark:text-indigo-400">
                Done ({doneTasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-indigo-50 dark:bg-indigo-500/10 rounded-lg p-3 border border-indigo-200 dark:border-indigo-500/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {doneTasks.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No completed tasks for this day
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskCreationModal({
  open,
  onOpenChange,
  status,
  dueDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "todo" | "doing" | "done";
  dueDate: Date;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      status: "todo" | "doing" | "done";
      dueDate: string;
    }) => apiClient.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast({
        title: "Success!",
        description: "Task created successfully.",
      });
      setForm({ title: "", description: "" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    createTaskMutation.mutate({
      title: form.title,
      description: form.description,
      status,
      dueDate: format(dueDate, "yyyy-MM-dd"),
    });
  };

  const getStatusText = () => {
    switch (status) {
      case "todo":
        return "To Do";
      case "doing":
        return "Doing";
      case "done":
        return "Done";
      default:
        return "To Do";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 border-0 text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            + Add New Task - {format(dueDate, "MMM d, yyyy")}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-white hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title..."
              className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter task description..."
              rows={3}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none resize-none"
            />
          </div>

          <div className="bg-pink-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4 text-pink-300" />
              <span>Due: {format(dueDate, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-pink-300" />
              <span>Status: {getStatusText()}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Planning() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [currentDate, setCurrentDate] = useState(new Date()); // Use today's date
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskStatus, setTaskStatus] = useState<"todo" | "doing" | "done">(
    "todo"
  );
  const [showTaskViewModal, setShowTaskViewModal] = useState(false);
  const [selectedViewDate, setSelectedViewDate] = useState<Date>(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch all tasks for calendar view
  const { data: allTasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => apiClient.getTasks(),
  });

  // Fetch tasks for the current date
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", format(currentDate, "yyyy-MM-dd")],
    queryFn: () => apiClient.getTasksByDate(format(currentDate, "yyyy-MM-dd")),
  });

  // Fetch task stats (used in mutations)
  useQuery({
    queryKey: ["task-stats"],
    queryFn: () => apiClient.getTaskStats(),
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast({
        title: "Success!",
        description: "Task deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast({
        title: "Success!",
        description: "Task status updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status.",
        variant: "destructive",
      });
    },
  });

  // Filter tasks by status
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const doingTasks = tasks.filter((task) => task.status === "doing");
  const doneTasks = tasks.filter((task) => task.status === "done");

  // Ensure date is set to today on component mount
  useEffect(() => {
    const today = new Date();
    console.log(
      `Component mounted, setting date to today: ${today.toISOString()}, Formatted: ${format(
        today,
        "yyyy-MM-dd"
      )}`
    );
    setCurrentDate(today);
  }, []);

  function handleDeleteTask(taskId: string) {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  }

  function handleDateClick(date: Date) {
    setSelectedViewDate(date);
    setShowTaskViewModal(true);
  }

  function getTasksForDate(date: Date) {
    const dateStr = format(date, "yyyy-MM-dd");
    return allTasks.filter((task) => task.dueDate === dateStr);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const task = allTasks.find((t) => t.id === activeId);
    if (!task) return;

    // Check if dropping on a container (status change)
    // The container IDs are "todo", "doing", "done"
    if (["todo", "doing", "done"].includes(overId)) {
      const newStatus = overId as "todo" | "doing" | "done";

      if (task.status !== newStatus) {
        console.log(
          `Moving task ${activeId} from ${task.status} to ${newStatus}`
        );
        updateTaskMutation.mutate({
          id: activeId,
          data: { status: newStatus },
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            👤
          </div>
          <h1 className="text-3xl font-bold text-pink-500">Plan Pal</h1>
        </div>
        <div className="flex justify-center items-center">
          <div className="h-0.5 w-12 bg-pink-500/50"></div>
          <span className="mx-2 text-pink-500">✨</span>
          <div className="h-0.5 w-12 bg-pink-500/50"></div>
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="grid grid-cols-5 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-[#8B1D44] dark:via-[#48246D] dark:to-[#492365] p-1 rounded-xl border border-pink-200 dark:border-pink-400 overflow-hidden">
          <TabsTrigger
            value="calendar"
            className="flex items-center gap-2 data-[state=active]:bg-pink-200 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-[#8B1D44] dark:data-[state=active]:text-white rounded-lg py-3 text-pink-600 dark:text-white transition-all duration-200"
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="flex items-center gap-2 data-[state=active]:bg-pink-200 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-[#48246D] dark:data-[state=active]:text-white rounded-lg py-3 text-pink-600 dark:text-white transition-all duration-200"
          >
            <Target className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex items-center gap-2 data-[state=active]:bg-pink-200 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-[#492365] dark:data-[state=active]:text-white rounded-lg py-3 text-pink-600 dark:text-white transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4" />
            Notes
          </TabsTrigger>

          <TabsTrigger
            value="vision"
            className="flex items-center gap-2 data-[state=active]:bg-pink-200 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-[#492365] dark:data-[state=active]:text-white rounded-lg py-3 text-pink-600 dark:text-white transition-all duration-200"
          >
            <Heart className="w-4 h-4" />
            Vision
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="space-y-6">
          <CalendarSection
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            tasks={allTasks}
            onDateClick={handleDateClick}
          />
        </TabsContent>
        <TabsContent value="tasks" className="space-y-6">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-[#8B1D44] dark:via-[#48246D] dark:to-[#492365] rounded-xl p-4 flex items-center justify-center gap-4 border border-pink-200 dark:border-pink-400">
            <div className="flex items-center gap-2 text-pink-700 dark:text-white">
              <CalendarIcon className="w-5 h-5" />
              <span>Choose Date:</span>
            </div>
            <Input
              type="date"
              value={format(currentDate, "yyyy-MM-dd")}
              onChange={(e) => {
                const selectedDate = e.target.value;
                if (selectedDate) {
                  // Create date in local timezone to avoid timezone issues
                  const [year, month, day] = selectedDate
                    .split("-")
                    .map(Number);
                  const newDate = new Date(year, month - 1, day); // month is 0-indexed
                  console.log(
                    `Date input changed: ${selectedDate} -> ${newDate.toISOString()}`
                  );
                  setCurrentDate(newDate);
                }
              }}
              className="bg-white dark:bg-[#12151f] border-pink-200 dark:border-pink-400 w-40 text-center text-pink-700 dark:text-white"
            />
            <span className="text-pink-600 dark:text-gray-300">
              {tasks.length} tasks for {format(currentDate, "MMM dd, yyyy")}
            </span>
            <Button
              onClick={() => {
                const today = new Date();
                console.log(
                  `Today button clicked: ${today.toISOString()}, Formatted: ${format(
                    today,
                    "yyyy-MM-dd"
                  )}`
                );
                setCurrentDate(today);
              }}
              variant="outline"
              size="sm"
              className="bg-white dark:bg-[#12151f] border-pink-200 dark:border-pink-400 text-pink-700 dark:text-white hover:bg-pink-50 dark:hover:bg-pink-500/20"
            >
              Today
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCorners}
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <span className="text-foreground">To Do</span>
                  <span className="bg-pink-500/20 text-pink-700 dark:text-pink-400 px-2 rounded-full text-sm">
                    {todoTasks.length}
                  </span>
                </div>
                <DroppableContainer
                  id="todo"
                  className="border-2 border-dashed border-pink-300 dark:border-pink-500/30 rounded-xl p-4 min-h-[400px] bg-white/50 dark:bg-transparent"
                >
                  <SortableContext
                    items={todoTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {todoTasks.map((task) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </SortableContext>
                  <button
                    onClick={() => {
                      setTaskStatus("todo");
                      setShowTaskModal(true);
                    }}
                    className="w-full py-3 border-2 border-dashed border-pink-300 dark:border-pink-500/30 rounded-lg text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to To Do
                  </button>
                </DroppableContainer>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-foreground">Doing</span>
                  <span className="bg-purple-500/20 text-purple-700 dark:text-purple-400 px-2 rounded-full text-sm">
                    {doingTasks.length}
                  </span>
                </div>
                <DroppableContainer
                  id="doing"
                  className="border-2 border-dashed border-purple-300 dark:border-purple-500/30 rounded-xl p-4 min-h-[400px] bg-white/50 dark:bg-transparent"
                >
                  <SortableContext
                    items={doingTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {doingTasks.map((task) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </SortableContext>
                  <button
                    onClick={() => {
                      setTaskStatus("doing");
                      setShowTaskModal(true);
                    }}
                    className="w-full py-3 border-2 border-dashed border-purple-300 dark:border-purple-500/30 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Doing
                  </button>
                </DroppableContainer>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-foreground">Done</span>
                  <span className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-2 rounded-full text-sm">
                    {doneTasks.length}
                  </span>
                </div>
                <DroppableContainer
                  id="done"
                  className="border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 rounded-xl p-4 min-h-[400px] bg-white/50 dark:bg-transparent"
                >
                  <SortableContext
                    items={doneTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {doneTasks.map((task) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </SortableContext>
                  <button
                    onClick={() => {
                      setTaskStatus("done");
                      setShowTaskModal(true);
                    }}
                    className="w-full py-3 border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Done
                  </button>
                </DroppableContainer>
              </div>
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {allTasks.find((task) => task.id === activeId)?.title}
                      </h4>
                      {allTasks.find((task) => task.id === activeId)
                        ?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {
                            allTasks.find((task) => task.id === activeId)
                              ?.description
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>
        <TabsContent value="notes" className="space-y-6">
          <NotesSection />
        </TabsContent>

        <TabsContent value="vision" className="space-y-6">
          <VisionSection />
        </TabsContent>
      </Tabs>

      <TaskCreationModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        status={taskStatus}
        dueDate={currentDate}
      />
      <TaskViewModal
        open={showTaskViewModal}
        onOpenChange={setShowTaskViewModal}
        selectedDate={selectedViewDate}
        tasks={getTasksForDate(selectedViewDate)}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}
