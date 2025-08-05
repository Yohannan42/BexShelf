import { useState, useEffect } from "react";
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
  PenSquare,
  BookOpen,
  Edit,
  Trash2,
  ArrowRight,
  Book,
  PenTool,
  FileText,
  ScrollText,
  Search,
} from "lucide-react";
import { WritingProject } from "@shared/schema";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const writingTypes = [
  {
    id: "novel",
    title: "Novel / Fiction",
    description: "Long-form fiction with chapters",
    icon: Book,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "poetry",
    title: "Poetry Collection",
    description: "Verses, stanzas, and creative expression",
    icon: PenTool,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "memoir",
    title: "Memoir / Biography",
    description: "Personal stories and life experiences",
    icon: FileText,
    color: "from-green-500 to-green-600",
  },
  {
    id: "essay",
    title: "Essay or Article Series",
    description: "Non-fiction articles and essays",
    icon: ScrollText,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "freeform",
    title: "Freeform Writing",
    description: "Creative writing without constraints",
    icon: BookOpen,
    color: "from-orange-500 to-orange-600",
  },
];

function WritingTypeDialog({
  open,
  onOpenChange,
  onTypeSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTypeSelect: (type: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            What are you writing today?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {writingTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                onTypeSelect(type.id);
                onOpenChange(false);
              }}
              className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center text-white`}
                  >
                    <type.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700">
                      {type.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateProjectDialog({
  open,
  onOpenChange,
  selectedType,
  editingProject = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: string;
  editingProject?: WritingProject | null;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: selectedType,
    targetWordCount: "50000",
    deadline: "",
  });
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const selectedWritingType = writingTypes.find((t) => t.id === selectedType);

  const createProjectMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      type: string;
      targetWordCount?: number;
      deadline?: string;
    }) => apiClient.createWritingProject(data),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["writing-projects"] });
      toast({
        title: "Success!",
        description: "Writing project created successfully.",
      });
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setForm({
          title: "",
          description: "",
          type: selectedType,
          targetWordCount: "50000",
          deadline: "",
        });
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create writing project.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: {
      title?: string;
      description?: string;
      type?: string;
      targetWordCount?: number;
      deadline?: string;
    }) => apiClient.updateWritingProject(editingProject!.id, data),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["writing-projects"] });
      toast({
        title: "Success!",
        description: "Writing project updated successfully.",
      });
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setForm({
          title: "",
          description: "",
          type: selectedType,
          targetWordCount: "50000",
          deadline: "",
        });
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update writing project.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (open && selectedWritingType) {
      if (editingProject) {
        setForm({
          title: editingProject.title,
          description: editingProject.description || "",
          type: editingProject.type,
          targetWordCount:
            editingProject.targetWordCount?.toString() || "50000",
          deadline: editingProject.deadline
            ? new Date(editingProject.deadline).toISOString().split("T")[0]
            : "",
        });
      } else {
        setForm({
          title: "",
          description: "",
          type: selectedType,
          targetWordCount: "50000",
          deadline: "",
        });
      }
      setSuccess(false);
    }
  }, [open, selectedType, editingProject]);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    if (!form.type || form.type === "") {
      toast({
        title: "Error",
        description: "Please select a writing type.",
        variant: "destructive",
      });
      return;
    }

    const projectData = {
      title: form.title,
      description: form.description,
      type: form.type,
      targetWordCount: parseInt(form.targetWordCount) || undefined,
      deadline: form.deadline || undefined,
    };

    if (editingProject) {
      updateProjectMutation.mutate(projectData);
    } else {
      createProjectMutation.mutate(projectData);
    }
  }

  if (!selectedWritingType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-r ${selectedWritingType.color} flex items-center justify-center text-white`}
            >
              <selectedWritingType.icon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {editingProject ? "Edit" : "Create"} {selectedWritingType.title}{" "}
                Project
              </DialogTitle>
              <p className="text-gray-600">{selectedWritingType.description}</p>
            </div>
          </div>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-semibold mb-1 text-black">
              Project Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
              placeholder="Enter your project title"
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
              placeholder="Describe your project..."
              className="w-full rounded border-2 border-pink-100 p-3 min-h-[60px] bg-white text-black"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-base font-semibold mb-1 text-black">
                Target Word Count
              </label>
              <input
                name="targetWordCount"
                value={form.targetWordCount}
                onChange={handleInputChange}
                type="number"
                min="1"
                placeholder="e.g., 50000"
                title="Target word count for your writing project"
                className="w-full rounded border-2 border-pink-100 p-3 bg-white text-black"
              />
            </div>
            <div className="flex-1">
              <label className="block text-base font-semibold mb-1 text-black">
                Deadline (Optional)
              </label>
              <input
                name="deadline"
                value={form.deadline}
                onChange={handleInputChange}
                type="date"
                className="w-full rounded border-2 border-pink-100 p-3 bg-white text-black"
                placeholder="mm/dd/yyyy"
                title="Deadline date"
              />
            </div>
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
              className={`px-4 py-2 rounded bg-gradient-to-r ${selectedWritingType.color} text-white font-semibold hover:opacity-90 disabled:opacity-50`}
              disabled={
                createProjectMutation.isPending ||
                updateProjectMutation.isPending
              }
            >
              {createProjectMutation.isPending ||
              updateProjectMutation.isPending
                ? editingProject
                  ? "Updating..."
                  : "Creating..."
                : success
                ? editingProject
                  ? "Updated!"
                  : "Created!"
                : editingProject
                ? "Update Project"
                : "Create Project"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Writing() {
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProject, setEditingProject] = useState<WritingProject | null>(
    null
  );
  const navigate = useNavigate();
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery<WritingProject[]>({
    queryKey: ["writing-projects"],
    queryFn: () => apiClient.getWritingProjects(),
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteWritingProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writing-projects"] });
      toast({
        title: "Success!",
        description: "Writing project deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete writing project.",
        variant: "destructive",
      });
    },
  });

  function handleTypeSelect(type: string) {
    setSelectedType(type);
    setEditingProject(null);
    setShowCreateDialog(true);
  }

  function handleEdit(project: WritingProject) {
    setEditingProject(project);
    setSelectedType(project.type);
    setShowCreateDialog(true);
  }

  function handleDelete(projectId: string) {
    if (confirm("Are you sure you want to delete this writing project?")) {
      deleteProjectMutation.mutate(projectId);
    }
  }

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    console.error("Error fetching writing projects:", error);
  }

  return (
    <div className="min-h-screen space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display text-foreground mb-2">
            Writing Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Your creative sanctuary for all writing projects
          </p>
        </div>
        <Button
          onClick={() => setShowTypeDialog(true)}
          className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Writing Project
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search your writing projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Projects List or Empty State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 mb-6 text-muted-foreground">
            <PenSquare className="w-full h-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-medium text-foreground mb-4">
            Loading projects...
          </h2>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">{project.type}</span>
                <span className="text-muted-foreground">
                  {project.currentWordCount} words
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    project.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : project.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {project.status.replace("_", " ")}
                </span>
                {project.targetWordCount && (
                  <span className="text-xs text-muted-foreground">
                    Target: {project.targetWordCount.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/writing/${project.id}`)}
                  className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-white"
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
            <PenSquare className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-medium text-foreground mb-4">
            {searchQuery ? "No projects found" : "Start Your Writing Journey"}
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            {searchQuery
              ? "Try adjusting your search terms."
              : "Create your first writing project and begin crafting your stories, poems, or essays with our advanced writing tools."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setShowTypeDialog(true)}
              className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-white px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Project
            </Button>
          )}
        </div>
      )}

      <WritingTypeDialog
        open={showTypeDialog}
        onOpenChange={setShowTypeDialog}
        onTypeSelect={handleTypeSelect}
      />

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        selectedType={selectedType}
        editingProject={editingProject}
      />
    </div>
  );
}
