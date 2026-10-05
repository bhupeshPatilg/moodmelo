export interface Song {
  id: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  duration?: string;
  mood?: string;
  youtubeId?: string;
  youtubeUrl?: string;
}

export interface Mood {
  id: string;
  name: string;
  icon: string;
  description: string;
  background: string;
}