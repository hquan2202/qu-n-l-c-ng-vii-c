export interface Board {
  id?: string;
  title: string;
  color: string;
  background?: { color?: string; fileName?: string; fileLocation?: string } | File | null;
  tasks?: any[];
}
