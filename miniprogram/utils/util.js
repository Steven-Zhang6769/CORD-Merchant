// Common function to format single digits with a leading zero
const formatWithLeadingZero = (value) => {
    return value.toString().padStart(2, "0");
};

// Formats a JavaScript Date object into a date string (YYYY/MM/DD)
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = formatWithLeadingZero(date.getMonth() + 1);
    const day = formatWithLeadingZero(date.getDate());

    return `${year}/${month}/${day}`;
};

// Formats a JavaScript Date object into a time string (HH:MM)
const formatTime = (date) => {
    const hours = formatWithLeadingZero(date.getHours());
    const minutes = formatWithLeadingZero(date.getMinutes());
    const seconds = formatWithLeadingZero(date.getSeconds());

    return `${hours}:${minutes}:${seconds}`;
};

// Formats a JavaScript Date object into a full date and time string (YYYY/MM/DD HH:MM)
const formatFullDateTime = (date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
};

// Formats a JavaScript Date object into a month/day string (MM/DD)
const formatMonthDay = (date) => {
    const month = formatWithLeadingZero(date.getMonth() + 1);
    const day = formatWithLeadingZero(date.getDate());

    return `${month}/${day}`;
};

// Formats a JavaScript Date object into a date string (YY/MM/DD)
const formatShortDate = (date) => {
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = formatWithLeadingZero(date.getMonth() + 1);
    const day = formatWithLeadingZero(date.getDate());

    return `${year}/${month}/${day}`;
};

// Formats a JavaScript Date object into a date and time string (YY/MM/DD HH:MM)
const formatDateTimeShortYear = (date) => {
    const datePart = formatShortDate(date);
    const timePart = formatTime(date).slice(0, 5); // Get HH:MM part only

    return `${datePart} ${timePart}`;
};

// Creates a Date object from separate date and time strings (date as MM/DD, time as HH:MM)
const createDateTimeFromMonthDayAndTime = (monthDay, time) => {
    const currentYear = new Date().getFullYear();
    return new Date(`${currentYear}/${monthDay} ${time}`);
};

const createFullDateTime = (year, monthDay, time) => {
    return new Date(`${year}/${monthDay} ${time}`);
};

module.exports = {
    formatFullDateTime,
    formatDate,
    formatMonthDay,
    formatShortDate,
    formatDateTimeShortYear,
    createFullDateTime,
    createDateTimeFromMonthDayAndTime,
};
