const { DateTime } = require("luxon");

exports.differenceWithCurrentDateTime = (givenDate = null) => {

    if(givenDate){

        const luxonDateTime = DateTime.fromJSDate(givenDate, { zone: 'utc' });
        const isoString = luxonDateTime.toISO();

        const current = DateTime.utc();
        const givenDateObj = DateTime.fromISO(isoString, { zone: 'utc' });
        
        const difference = current.diff(givenDateObj, ['days', 'hours', 'minutes', 'seconds']);

        return {
            days: difference.days,
            hourse: difference.hours,
            minutes: difference.minutes,
            seconds: difference.seconds
        }

    }else return null;
}