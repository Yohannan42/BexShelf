import React from "react";
import { Book, Clock, Quote, PenSquare } from "lucide-react";

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
  iconColor = "text-primary-400",
}: StatCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
      <div
        className={`${iconBgColor} w-12 h-12 rounded-full flex items-center justify-center mb-4`}
      >
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

export default function ReadingStats() {
  // Mock data - in a real app, this would come from your backend
  const stats = [
    {
      icon: <Book className="w-6 h-6" />,
      value: "0",
      label: "Books This Year",
      iconBgColor: "bg-primary-500/20",
      iconColor: "text-primary-400",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      value: "147h",
      label: "Reading Time",
      iconBgColor: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: <Quote className="w-6 h-6" />,
      value: "328",
      label: "Highlights",
      iconBgColor: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: <PenSquare className="w-6 h-6" />,
      value: "156",
      label: "Journal Entries",
      iconBgColor: "bg-amber-500/20",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-display text-green-400 mb-6">
        Reading Analytics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            iconBgColor={stat.iconBgColor}
            iconColor={stat.iconColor}
          />
        ))}
      </div>
    </section>
  );
}
