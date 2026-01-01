// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDO09ohxhzenC52F8B1mArAoHryDhAmiho';

// Static Maps API URL builder
export const getStaticMapUrl = (latitude, longitude, zoom = 15, width = 600, height = 400, markers = true) => {
  const markerParam = markers ? `&markers=color:red%7C${latitude},${longitude}` : '';
  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}${markerParam}&key=${GOOGLE_MAPS_API_KEY}`;
};

// Google Maps URL for opening in browser/app
export const getGoogleMapsUrl = (latitude, longitude) => {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};
