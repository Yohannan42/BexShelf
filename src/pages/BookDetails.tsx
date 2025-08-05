import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api";
import { Book } from "@shared/schema";
import {
  ArrowLeft,
  Download,
  Edit,
  Star,
  BookOpen,
  Calendar,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function BookDetails() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    currentPage: "",
    rating: "",
    notes: "",
    status: "want_to_read" as "want_to_read" | "currently_reading" | "finished",
  });

  const { data: book, isLoading } = useQuery<Book>({
    queryKey: ["book", bookId],
    queryFn: () => apiClient.getBook(bookId!),
    enabled: !!bookId,
  });

  const updateBookMutation = useMutation({
    mutationFn: (data: {
      currentPage?: number;
      rating?: number;
      notes?: string;
      status?: "want_to_read" | "currently_reading" | "finished";
    }) => apiClient.updateBook(bookId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["book-stats"] });
      toast({
        title: "Success!",
        description: "Book updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update book.",
        variant: "destructive",
      });
    },
  });

  function handleDownload() {
    if (!book?.pdfPath) {
      toast({
        title: "No PDF Available",
        description: "This book doesn't have a PDF file uploaded.",
        variant: "destructive",
      });
      return;
    }

    apiClient
      .downloadBookFile(bookId!)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${book.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: "Download Started",
          description: "Your book is being downloaded.",
        });
      })
      .catch((error) => {
        toast({
          title: "Download Failed",
          description: "Failed to download the book file.",
          variant: "destructive",
        });
      });
  }

  function handleOpenPdf() {
    if (!book?.pdfPath) {
      toast({
        title: "No PDF Available",
        description: "This book doesn't have a PDF file uploaded.",
        variant: "destructive",
      });
      return;
    }

    // Create a blob URL for the PDF
    apiClient
      .downloadBookFile(bookId!)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setShowPdfViewer(true);
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
        toast({
          title: "Error",
          description: "Failed to load the PDF file.",
          variant: "destructive",
        });
      });
  }

  function handleClosePdf() {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setShowPdfViewer(false);
    // Remove the read parameter from URL when closing
    navigate(`/library/${bookId}`, { replace: true });
  }

  // Initialize edit form when book loads
  useEffect(() => {
    if (book) {
      setEditForm({
        currentPage: book.currentPage?.toString() || "",
        rating: book.rating?.toString() || "",
        notes: book.notes || "",
        status: book.status,
      });
    }
  }, [book]);

  // Auto-open PDF viewer if read=true parameter is present
  useEffect(() => {
    if (
      book &&
      searchParams.get("read") === "true" &&
      book.pdfPath &&
      !showPdfViewer
    ) {
      handleOpenPdf();
    }
  }, [book, searchParams, showPdfViewer, bookId]);

  function handleSave() {
    const data = {
      currentPage: editForm.currentPage
        ? parseInt(editForm.currentPage)
        : undefined,
      rating: editForm.rating ? parseInt(editForm.rating) : undefined,
      notes: editForm.notes,
      status: editForm.status,
    };
    updateBookMutation.mutate(data);
  }

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Book not found</p>
          <Button onClick={() => navigate("/library")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage =
    book.currentPage && book.totalPages
      ? Math.round((book.currentPage / book.totalPages) * 100)
      : 0;

  const getStatusIcon = () => {
    switch (book.status) {
      case "currently_reading":
        return <Eye className="w-5 h-5 text-blue-500" />;
      case "finished":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (book.status) {
      case "currently_reading":
        return "bg-blue-100 text-blue-800";
      case "finished":
        return "bg-green-100 text-green-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // PDF Viewer Component
  if (showPdfViewer && pdfUrl) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* PDF Viewer Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleClosePdf}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Book Details
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {book.title}
              </h1>
              <p className="text-sm text-muted-foreground">PDF Reader</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleClosePdf} variant="outline" size="sm">
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="h-full">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={`${book.title} PDF Viewer`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/library")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {book.title}
                </h1>
                <p className="text-muted-foreground">by {book.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {book.pdfPath && (
                <Button
                  onClick={handleOpenPdf}
                  className="bg-primary hover:bg-primary/90"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read PDF
                </Button>
              )}
              {book.pdfPath && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {book.title}
                  </h2>
                  <p className="text-muted-foreground mb-1">by {book.author}</p>
                  <p className="text-sm text-muted-foreground">{book.genre}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
                  >
                    {book.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {book.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-foreground font-medium">
                    {book.rating}/5
                  </span>
                </div>
              )}

              {/* Reading Progress */}
              {book.currentPage && book.totalPages && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Reading Progress</span>
                    <span>
                      {book.currentPage} / {book.totalPages} pages (
                      {progressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {book.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Started: {new Date(book.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {book.finishDate && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Finished: {new Date(book.finishDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {book.notes && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {book.notes}
                </p>
              </div>
            )}

            {/* Edit Form */}
            {isEditing && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Edit Book
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Current Page
                      </label>
                      <Input
                        name="currentPage"
                        type="number"
                        value={editForm.currentPage}
                        onChange={handleInputChange}
                        placeholder="Current page"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Rating (1-5)
                      </label>
                      <Input
                        name="rating"
                        type="number"
                        min="1"
                        max="5"
                        value={editForm.rating}
                        onChange={handleInputChange}
                        placeholder="1-5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleInputChange}
                      className="w-full rounded border-2 border-border p-3 bg-background text-foreground"
                      title="Book status"
                    >
                      <option value="want_to_read">Want to Read</option>
                      <option value="currently_reading">
                        Currently Reading
                      </option>
                      <option value="finished">Finished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={editForm.notes}
                      onChange={handleInputChange}
                      placeholder="Add your thoughts about this book..."
                      className="w-full rounded border-2 border-border p-3 min-h-[100px] bg-background text-foreground"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateBookMutation.isPending}
                    >
                      {updateBookMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {book.pdfPath && (
                  <Button
                    onClick={handleOpenPdf}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read PDF
                  </Button>
                )}
                {book.pdfPath && (
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Cancel Edit" : "Edit Book"}
                </Button>
              </div>
            </div>

            {/* Book Stats */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Book Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Genre:</span>
                  <span className="text-foreground">{book.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor()}`}
                  >
                    {book.status.replace("_", " ")}
                  </span>
                </div>
                {book.rating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-foreground">{book.rating}/5</span>
                    </div>
                  </div>
                )}
                {book.totalPages && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span className="text-foreground">{book.totalPages}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added:</span>
                  <span className="text-foreground">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
