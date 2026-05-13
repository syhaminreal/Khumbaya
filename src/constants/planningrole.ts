import { Ionicons } from "@expo/vector-icons";

export type Role =
  | "co-host"
  | "planner"
  | "editor"
  | "bride"
  | "groom"
  | "mom-bride-groom"
  | "father-bride-groom"
  | "sibling-of-bride-groom";

export const roles: {
  id: Role;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "co-host",
    title: "Co-Host",
    desc: "Can edit event and manage guests",
    icon: "star",
  },
  {
    id: "planner",
    title: "Planner",
    desc: "Can manage logistics and vendors",
    icon: "calendar",
  },
  {
    id: "editor",
    title: "Editor",
    desc: "Can only edit event details",
    icon: "create",
  },
  {
    id: "bride",
    title: "Bride",
    desc: "Primary event stakeholder",
    icon: "woman",
  },
  {
    id: "groom",
    title: "Groom",
    desc: "Primary event stakeholder",
    icon: "man",
  },
  {
    id: "mom-bride-groom",
    title: "Mother of Bride/Groom",
    desc: "Family member with planning access",
    icon: "heart",
  },
  {
    id: "father-bride-groom",
    title: "Father of Bride/Groom",
    desc: "Family member with planning access",
    icon: "people",
  },
  {
    id: "sibling-of-bride-groom",
    title: "Sister/Brother of Bride/Groom",
    desc: "Sibling support role",
    icon: "people-circle",
  },
];