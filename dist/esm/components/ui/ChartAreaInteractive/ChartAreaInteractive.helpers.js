// Helper function to format large numbers with k/m abbreviations
const shortDateFormatter = (value) => {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
    });
};
const longDateFormatter = (value) => {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
};

export { longDateFormatter, shortDateFormatter };
