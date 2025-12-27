
export interface Channel {
  id: string;
  name: string;
  native_name: string | null;
  network: string | null;
  country: string;
  subdivision: string | null;
  city: string | null;
  broadcast_area: string[];
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
  launched: string | null;
  closed: string | null;
  replaced_by: string | null;
  website: string | null;
  logo: string | null;
}

export interface Stream {
  channel: string;
  url: string;
  timeshift: number | null;
  http_referrer: string | null;
  user_agent: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
  languages: string[];
  flag: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface CombinedChannel extends Channel {
  streamUrl?: string;
}

export interface AppState {
  channels: CombinedChannel[];
  categories: Category[];
  countries: Country[];
  languages: Language[];
  loading: boolean;
  favorites: string[];
  selectedCategory: string | null;
  selectedCountry: string | null;
  searchQuery: string;
}
