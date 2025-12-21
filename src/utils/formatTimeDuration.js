const commonConstants = require("../constants/commonConstants");

const formatTimeDuration = (startTime, endTime, eventType) => {
    // Check if both start and end times are provided
    if (!startTime || !endTime ||
        startTime.trim() === '' || endTime.trim() === '') {

        return '';
    }

    try {
        // Parse times in HH:MM format
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // Validate parsed values
        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
            return '';
        }

        // Convert to minutes
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        // Calculate duration in minutes
        let durationMinutes = endTotalMinutes - startTotalMinutes;

        // Handle next day scenario (if end time is before start time)
        if (durationMinutes < 0) {
            durationMinutes += 24 * 60; // Add 24 hours in minutes
        }

        // If duration is 0, return empty
        if (durationMinutes === 0) {
            return '';
        }

        // Format duration - same for all event types when times are provided
        if (durationMinutes < 60) {
            return `${durationMinutes} minutes`;
        } else {
            const hours = Math.floor(durationMinutes / 60);
            const remainingMinutes = durationMinutes % 60;

            if (remainingMinutes === 0) {
                return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
            } else {
                // Show both hours and minutes separately
                const hourText = hours === 1 ? 'hour' : 'hours';
                const minuteText = remainingMinutes === 1 ? 'minute' : 'minutes';
                return `${hours} ${hourText} ${remainingMinutes} ${minuteText}`;
            }
        }
    } catch (error) {
        console.error('Error calculating duration:', error);
        return '';
    }
};

module.exports = { formatTimeDuration };