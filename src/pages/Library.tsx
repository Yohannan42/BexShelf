import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Book as BookIcon,
  Eye,
  Star,
  ScrollText,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  FileText,
  BookOpen,
  Filter,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  className?: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center border border-gray-100 shadow-sm dark:bg-[#1a1f2e] dark:border-border/10">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-4xl font-bold mb-1 text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-gray-500 text-sm dark:text-gray-400">{label}</div>
    </div>
  );
}

function CreateBookDialog({
  open,
  onOpenChange,
  editingBook = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBook?: Book | null;
}) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    status: "want_to_read" as "want_to_read" | "currently_reading" | "finished",
    rating: "",
    notes: "",
    currentPage: "",
    totalPages: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBookMutation = useMutation({
    mutationFn: (data: {
      title: string;
      author: string;
      genre: string;
      status: "want_to_read" | "currently_reading" | "finished";
      rating?: number;
      notes?: string;
      currentPage?: number;
      totalPages?: number;
    }) => apiClient.createBook(data, selectedFile || undefined),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book-stats"] });
      toast({
        title: "Success!",
        description: "Book added successfully.",
      });
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setForm({
          title: "",
          author: "",
          genre: "",
          status: "want_to_read",
          rating: "",
          notes: "",
          currentPage: "",
          totalPages: "",
        });
        setSelectedFile(null);
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add book.",
        variant: "destructive",
      });
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: (data: {
      title?: string;
      author?: string;
      genre?: string;
      status?: "want_to_read" | "currently_reading" | "finished";
      rating?: number;
      notes?: string;
      currentPage?: number;
      totalPages?: number;
    }) =>
      apiClient.updateBook(editingBook!.id, data, selectedFile || undefined),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book-stats"] });
      toast({
        title: "Success!",
        description: "Book updated successfully.",
      });
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setForm({
          title: "",
          author: "",
          genre: "",
          status: "want_to_read",
          rating: "",
          notes: "",
          currentPage: "",
          totalPages: "",
        });
        setSelectedFile(null);
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update book.",
        variant: "destructive",
      });
    },
  });

  // Initialize form when dialog opens
  useState(() => {
    if (open && editingBook) {
      setForm({
        title: editingBook.title,
        author: editingBook.author,
        genre: editingBook.genre,
        status: editingBook.status,
        rating: editingBook.rating?.toString() || "",
        notes: editingBook.notes || "",
        currentPage: editingBook.currentPage?.toString() || "",
        totalPages: editingBook.totalPages?.toString() || "",
      });
    } else if (open && !editingBook) {
      setForm({
        title: "",
        author: "",
        genre: "",
        status: "want_to_read",
        rating: "",
        notes: "",
        currentPage: "",
        totalPages: "",
      });
      setSelectedFile(null);
    }
  });

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.author || !form.genre) {
      toast({
        title: "Error",
        description: "Title, author, and genre are required.",
        variant: "destructive",
      });
      return;
    }

    const bookData = {
      title: form.title,
      author: form.author,
      genre: form.genre,
      status: form.status,
      rating: form.rating ? parseInt(form.rating) : undefined,
      notes: form.notes,
      currentPage: form.currentPage ? parseInt(form.currentPage) : undefined,
      totalPages: form.totalPages ? parseInt(form.totalPages) : undefined,
    };

    if (editingBook) {
      updateBookMutation.mutate(bookData);
    } else {
      createBookMutation.mutate(bookData);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#1a1f2e]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            {editingBook ? "Edit Book" : "Add New Book"}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Title *
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
                placeholder="Enter book title"
                className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Author *
              </label>
              <Input
                name="author"
                value={form.author}
                onChange={handleInputChange}
                required
                placeholder="Enter author name"
                className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Genre *
              </label>
              <Input
                name="genre"
                value={form.genre}
                onChange={handleInputChange}
                required
                placeholder="e.g., Fiction, Science, Biography"
                className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Status *
              </label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value as any }))
                }
              >
                <SelectTrigger className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="want_to_read">Want to Read</SelectItem>
                  <SelectItem value="currently_reading">
                    Currently Reading
                  </SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Rating (1-5)
              </label>
              <Input
                name="rating"
                type="number"
                min="1"
                max="5"
                value={form.rating}
                onChange={handleInputChange}
                placeholder="1-5"
                className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Current Page
              </label>
              <Input
                name="currentPage"
                type="number"
                value={form.currentPage}
                onChange={handleInputChange}
                placeholder="Current page"
                className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Total Pages
              </label>
              <Input
                name="totalPages"
                type="number"
                value={form.totalPages}
                onChange={handleInputChange}
                placeholder="Total pages"
                className="border-gray-200 focus:border-amber-500 dark:border-gray-600 dark:focus:border-[#c4a574]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              placeholder="Add notes about the book..."
              className="w-full rounded border-2 border-gray-200 p-3 min-h-[60px] bg-white text-gray-900 focus:border-amber-500 focus:outline-none dark:border-gray-600 dark:bg-[#12151f] dark:text-white dark:focus:border-[#c4a574]"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1 text-gray-700"
              htmlFor="pdf-upload"
            >
              Upload PDF
            </label>
            <input
              id="pdf-upload"
              name="pdf"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 dark:file:bg-[#f3e5dc] dark:file:text-[#8B4513] dark:hover:file:bg-[#e5bf7d]"
              title="Upload PDF book file"
            />
            {selectedFile && (
              <span className="text-xs text-gray-500 mt-1 block">
                Selected: {selectedFile.name}
              </span>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-gradient-to-r dark:from-[#c4a574] dark:to-[#e5bf7d] dark:text-[#1a1f2e] dark:hover:opacity-90"
              disabled={
                createBookMutation.isPending || updateBookMutation.isPending
              }
            >
              {createBookMutation.isPending || updateBookMutation.isPending
                ? editingBook
                  ? "Updating..."
                  : "Adding..."
                : success
                ? editingBook
                  ? "Updated!"
                  : "Added!"
                : editingBook
                ? "Update Book"
                : "Add Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch books and stats
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: () => apiClient.getBooks(),
  });

  const { data: stats } = useQuery({
    queryKey: ["book-stats"],
    queryFn: () => apiClient.getBookStats(),
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book-stats"] });
      toast({
        title: "Success!",
        description: "Book deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete book.",
        variant: "destructive",
      });
    },
  });

  function handleEdit(book: Book) {
    setEditingBook(book);
    setShowCreateDialog(true);
  }

  function handleDelete(bookId: string) {
    if (confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(bookId);
    }
  }

  function handleDownload(bookId: string) {
    apiClient
      .downloadBookFile(bookId)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `book-${bookId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((_error) => {
        toast({
          title: "Error",
          description: "Failed to download book file.",
          variant: "destructive",
        });
      });
  }

  // Filter books based on search query and active tab
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "want" && book.status === "want_to_read") ||
      (activeTab === "reading" && book.status === "currently_reading") ||
      (activeTab === "finished" && book.status === "finished");

    const matchesGenre =
      selectedGenre === "all" ||
      book.genre.toLowerCase() === selectedGenre.toLowerCase();

    return matchesSearch && matchesTab && matchesGenre;
  });

  // Get unique genres for filter
  const genres = [
    "all",
    ...Array.from(new Set(books.map((book) => book.genre))),
  ];

  // Calculate tab counts
  const tabCounts = {
    all: books.length,
    want: books.filter((book) => book.status === "want_to_read").length,
    reading: books.filter((book) => book.status === "currently_reading").length,
    finished: books.filter((book) => book.status === "finished").length,
  };

  return (
    <div className="min-h-screen space-y-6 p-8 bg-gray-50 dark:bg-background">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent mb-2 dark:hidden">
          BexLibrary
        </h1>
        <h1 className="text-4xl font-display text-[#c4a574] mb-2 hidden dark:block">
          Personal Library
        </h1>
        <p className="text-gray-600 text-lg dark:text-gray-400">
          Manage your reading journey with your digital bookshelf
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
              <BookIcon className="w-6 h-6 text-white" />
            </div>
          }
          value={stats?.total || 0}
          label="Total Books"
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          }
          value={stats?.currentlyReading || 0}
          label="Currently Reading"
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          }
          value={stats?.averageRating?.toFixed(1) || "0.0"}
          label="Avg Rating"
        />
        <StatCard
          icon={
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <ScrollText className="w-6 h-6 text-white" />
            </div>
          }
          value={stats?.topGenres?.[0]?.genre || "None"}
          label="Top Genre"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm dark:bg-[#1a1f2e] dark:border-border/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 h-12 text-gray-900 focus:bg-white focus:border-amber-500 dark:bg-[#12151f] dark:border-0 dark:text-gray-300 dark:focus:bg-[#12151f] dark:focus:border-[#c4a574]"
          />
        </div>
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 h-12 dark:bg-[#12151f] dark:border-0">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre === "all" ? "All Genres" : genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 border border-gray-100 shadow-sm dark:bg-[#1a1f2e] dark:border-border/10">
        <div className="flex">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "all"
                ? "bg-gray-100 text-gray-900 dark:bg-[#12151f] dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Books ({tabCounts.all})
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "want"
                ? "bg-gray-100 text-gray-900 dark:bg-[#12151f] dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
            onClick={() => setActiveTab("want")}
          >
            Want to Read ({tabCounts.want})
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "reading"
                ? "bg-gray-100 text-gray-900 dark:bg-[#12151f] dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
            onClick={() => setActiveTab("reading")}
          >
            Reading ({tabCounts.reading})
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "finished"
                ? "bg-gray-100 text-gray-900 dark:bg-[#12151f] dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            }`}
            onClick={() => setActiveTab("finished")}
          >
            Finished ({tabCounts.finished})
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {activeTab === "all"
            ? "All Books"
            : activeTab === "want"
            ? "Want to Read"
            : activeTab === "reading"
            ? "Currently Reading"
            : "Finished Books"}
        </h2>
        <Button
          onClick={() => {
            setEditingBook(null);
            setShowCreateDialog(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-gradient-to-r dark:from-[#c4a574] dark:to-[#e5bf7d] dark:text-[#1a1f2e] dark:hover:opacity-90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Books List */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] group dark:bg-[#1a1f2e] dark:border-border/10"
            >
              {/* Header with title and actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate group-hover:text-amber-600 transition-colors dark:text-white dark:group-hover:text-[#c4a574]">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 mb-1 dark:text-gray-400">
                    by {book.author}
                  </p>
                  <p className="text-gray-500 text-sm dark:text-gray-500">
                    {book.genre}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(book)}
                    className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 dark:hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(book.id)}
                    className="text-gray-400 hover:text-red-500 h-8 w-8 p-0 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status and Rating */}
              <div className="flex items-center justify-between text-sm mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    book.status === "finished"
                      ? "bg-green-100 text-green-800"
                      : book.status === "currently_reading"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {book.status.replace("_", " ")}
                </span>
                {book.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {book.rating}/5
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {book.currentPage && book.totalPages && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2 dark:text-gray-400">
                    <span>Progress</span>
                    <span>
                      {book.currentPage}/{book.totalPages}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden dark:bg-gray-700">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300 dark:from-[#c4a574] dark:to-[#e5bf7d]"
                      style={{
                        width: `${(book.currentPage / book.totalPages) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {book.pdfPath && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(book.id)}
                      className="flex-1 h-9 text-xs font-medium border-gray-300 hover:border-amber-500 hover:text-amber-600 transition-colors dark:border-gray-600 dark:hover:border-[#c4a574] dark:hover:text-[#c4a574]"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/library/${book.id}?read=true`)}
                      className="flex-1 h-9 text-xs font-medium border-gray-300 hover:border-amber-500 hover:text-amber-600 transition-colors dark:border-gray-600 dark:hover:border-[#c4a574] dark:hover:text-[#c4a574]"
                    >
                      <BookOpen className="w-3 h-3 mr-2" />
                      Read PDF
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/library/${book.id}`)}
                  className="w-full h-9 text-xs font-medium border-gray-300 hover:border-amber-500 hover:text-amber-600 transition-colors dark:border-gray-600 dark:hover:border-[#c4a574] dark:hover:text-[#c4a574]"
                >
                  <FileText className="w-3 h-3 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <BookIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2 dark:text-gray-400">
            {searchQuery ? "No books found" : "No books yet"}
          </h3>
          <p className="text-gray-500 mb-6 dark:text-gray-500">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "Start building your library by adding your first book"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => {
                setEditingBook(null);
                setShowCreateDialog(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-gradient-to-r dark:from-[#c4a574] dark:to-[#e5bf7d] dark:text-[#1a1f2e] dark:hover:opacity-90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Book
            </Button>
          )}
        </div>
      )}

      <CreateBookDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        editingBook={editingBook}
      />
    </div>
  );
}
