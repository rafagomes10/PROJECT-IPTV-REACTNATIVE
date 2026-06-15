export interface UserCredentials {
  url: string;
  username: string;
  password: string;
}

export interface Channel {
  id: string;
  name: string;
  logo?: string;
  group?: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

export interface IPTVPlaylist {
  categories: Category[];
}

export interface Movie {
  id: string;
  name: string;
  logo?: string;
  category?: string;
  url: string;
  rating?: string;
  duration?: string;
  plot?: string;
  cast?: string;
  director?: string;
  year?: string;
}

export interface Episode {
  id: string;
  name: string;
  episodeNumber: number;
  seasonNumber: number;
  url: string;
  plot?: string;
  duration?: string;
}

export interface Season {
  id: string;
  name: string;
  seasonNumber: number;
  episodes: Episode[];
}

export interface Serie {
  id: string;
  name: string;
  logo?: string;
  category?: string;
  rating?: string;
  plot?: string;
  cast?: string;
  director?: string;
  year?: string;
  seasons?: Season[];
}
