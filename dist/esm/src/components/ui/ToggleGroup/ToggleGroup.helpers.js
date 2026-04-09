// Helper function to get context values with defaults
const getContextValues = (context, itemVariant, itemSize) => ({
    variant: context.variant || itemVariant || 'default',
    size: context.size || itemSize || 'md',
});
// Helper function to get default context values
const getDefaultContextValues = () => ({
    size: 'md',
    variant: 'default',
});

export { getContextValues, getDefaultContextValues };
