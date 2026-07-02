// Shared avatar helpers — deterministic initials + color from a name.
// Originally inline in components/MeetingsPanel.tsx; extracted so the workspace
// UserChip and the meetings panel share one implementation.

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = ["#FF6363", "#55b3ff", "#5fc992", "#ffbc33", "#a78bfa", "#f472b6"];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
