import axios from 'axios';

const UNSPLASH_ACCESS_KEY = 'vVj2Fol56AbJvkiDAqFuxBJanNl9ewvoxf5978NsH1M';

export const fetchArtisticImages = async () => {
  try {
    const response = await axios.get(
      'https://api.unsplash.com/search/photos',
      {
        params: {
          query: 'artistic abstract painting',
          per_page: 20,
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    // Return array of image URLs
    return response.data.results.map(photo => photo.urls.regular);
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
};
