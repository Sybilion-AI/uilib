function groupSidebarDatasets(datasets, groupBy) {
    const grouped = {};
    datasets.forEach(dataset => {
        if (groupBy === 'target_type') {
            const key = dataset.target_type?.name || 'Unknown';
            if (!grouped[key])
                grouped[key] = [];
            grouped[key].push(dataset);
        }
        else if (groupBy === 'regions') {
            if (dataset.regions && dataset.regions.length > 0) {
                const mostSpecificRegion = dataset.regions[dataset.regions.length - 1];
                const key = mostSpecificRegion.name || 'Unknown';
                if (!grouped[key])
                    grouped[key] = [];
                grouped[key].push(dataset);
            }
            else {
                const key = 'No Region';
                if (!grouped[key])
                    grouped[key] = [];
                grouped[key].push(dataset);
            }
        }
        else {
            const key = dataset.category?.name || 'Unknown';
            if (!grouped[key])
                grouped[key] = [];
            grouped[key].push(dataset);
        }
    });
    return Object.entries(grouped)
        .map(([name, ds]) => [name, [...ds].sort((a, b) => a.name.localeCompare(b.name))])
        .filter(([, ds]) => ds.length > 0)
        .sort((a, b) => a[0].localeCompare(b[0]));
}

export { groupSidebarDatasets };
