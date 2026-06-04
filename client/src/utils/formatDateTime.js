export const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const datePart = date.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    });

    const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return `${datePart} @ ${timePart}`;
};