const toRadians = (deg) => (deg * Math.PI) / 180;
const earthRadiusKm = 6371;

exports.calculateDistanceInKm = (userCoords, eventCoords) => {
    const [eventLng, eventLat] = eventCoords;
    const dLat = toRadians(eventLat - userCoords.latitude);
    const dLng = toRadians(eventLng - userCoords.longitude);

    const lat1 = toRadians(userCoords.latitude);
    const lat2 = toRadians(eventLat);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.floor(earthRadiusKm * c); // Return only integer km
};
