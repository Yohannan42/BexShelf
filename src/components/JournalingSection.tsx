import React from "react";
import { Plus, Lock } from "lucide-react";

interface NotebookCardProps {
  title: string;
  entryCount: number;
  isLocked?: boolean;
  style: {
    bgColor: string;
    textColor: string;
  };
}

function NotebookCard({
  title,
  entryCount,
  isLocked = false,
  style,
}: NotebookCardProps) {
  return (
    <div className="group cursor-pointer">
      <div
        className={`${style.bgColor} rounded-lg p-4 h-32 relative overflow-hidden transform group-hover:scale-105 transition-transform duration-300`}
      >
        <div className="relative z-10">
          <h5 className={`font-semibold ${style.textColor} text-sm truncate`}>
            {title}
          </h5>
          <p className="text-xs text-gray-700 mt-1">{entryCount} entries</p>
        </div>
        {isLocked && (
          <div className="absolute bottom-2 right-2">
            <Lock className="text-gray-700" size={12} />
          </div>
        )}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  type: string;
  progress: number;
  wordCount: number;
  status: string;
}

function ProjectCard({
  title,
  type,
  progress,
  wordCount,
  status,
}: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-emerald-500/20 text-emerald-400";
      case "planning":
        return "bg-blue-500/20 text-blue-400";
      case "editing":
        return "bg-yellow-500/20 text-yellow-400";
      case "complete":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-900/40 transition-colors duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold text-white">{title}</h5>
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
          {status.replace("_", " ")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>{type}</span>
          <span>{wordCount} words</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-800 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function JournalingSection() {
  // Mock data - in a real app, this would come from your backend
  const notebooks = [
    {
      title: "Reading Journal",
      entryCount: 12,
      isLocked: false,
      style: {
        bgColor: "bg-gradient-to-br from-amber-100 to-yellow-200",
        textColor: "text-gray-900",
      },
    },
    {
      title: "Personal Reflections",
      entryCount: 8,
      isLocked: true,
      style: {
        bgColor: "bg-gradient-to-br from-blue-100 to-indigo-200",
        textColor: "text-gray-900",
      },
    },
  ];

  const projects = [
    {
      title: "Novel Draft",
      type: "Fiction",
      progress: 45,
      wordCount: 12500,
      status: "in_progress",
    },
    {
      title: "Poetry Collection",
      type: "Poetry",
      progress: 70,
      wordCount: 2800,
      status: "editing",
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-display text-purple-400 mb-6">
        Journaling & Writing Studio
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Notebooks */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-xl font-medium text-purple-400 mb-4">
            Custom Notebooks
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {notebooks.map((notebook, index) => (
              <NotebookCard key={index} {...notebook} />
            ))}
          </div>
          <button className="w-full py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Notebook
          </button>
        </div>

        {/* Writing Projects */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-xl font-medium text-purple-400 mb-4">
            Writing Projects
          </h3>
          <div className="space-y-4 mb-6">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
          <button className="w-full py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Start New Project
          </button>
        </div>
      </div>
    </section>
  );
}
