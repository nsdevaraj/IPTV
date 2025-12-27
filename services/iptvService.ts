
import { Channel, Stream, Category, Country, Language, CombinedChannel } from '../types';

const BASE_URL = 'https://iptv-org.github.io/api';

export const fetchAllData = async (): Promise<{
  channels: CombinedChannel[];
  categories: Category[];
  countries: Country[];
  languages: Language[];
}> => {
  try {
    const [channelsRes, streamsRes, categoriesRes, countriesRes, languagesRes] = await Promise.all([
      fetch(`${BASE_URL}/channels.json`),
      fetch(`${BASE_URL}/streams.json`),
      fetch(`${BASE_URL}/categories.json`),
      fetch(`${BASE_URL}/countries.json`),
      fetch(`${BASE_URL}/languages.json`)
    ]);

    const channels: Channel[] = await channelsRes.json();
    const streams: Stream[] = await streamsRes.json();
    const categories: Category[] = await categoriesRes.json();
    const countries: Country[] = await countriesRes.json();
    const languages: Language[] = await languagesRes.json();

    // Create a map of streams for efficient lookup
    const streamMap = new Map<string, string>();
    streams.forEach(s => {
      if (!streamMap.has(s.channel)) {
        streamMap.set(s.channel, s.url);
      }
    });

    // Merge channel data with stream URLs and filter out those without streams
    const combinedChannels: CombinedChannel[] = channels
      .map(ch => ({
        ...ch,
        streamUrl: streamMap.get(ch.id)
      }))
      .filter(ch => ch.streamUrl && !ch.is_nsfw);

    return {
      channels: combinedChannels,
      categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
      countries: countries.sort((a, b) => a.name.localeCompare(b.name)),
      languages: languages.sort((a, b) => a.name.localeCompare(b.name))
    };
  } catch (error) {
    console.error('Failed to fetch IPTV data:', error);
    throw error;
  }
};
