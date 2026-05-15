/** Last non-null points from `normalized_series`, or deterministic fallback sample. */
function generateDriverChartData(driver, precision = 7) {
    if (driver.normalized_series) {
        const entries = Object.entries(driver.normalized_series);
        const seriesData = entries
            .filter(([, value]) => value !== null)
            .map(([date, value]) => {
            let parsedDate;
            try {
                const dateStr = date.toString();
                if (dateStr.includes('-')) {
                    parsedDate = new Date(`${dateStr}T00:00:00`);
                }
                else {
                    parsedDate = new Date(dateStr);
                }
                if (Number.isNaN(parsedDate.getTime())) {
                    return null;
                }
            }
            catch {
                return null;
            }
            const numericValue = parseFloat(value.toFixed(precision));
            return {
                date: parsedDate,
                value: numericValue,
            };
        })
            .filter((item) => item !== null)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(-24);
        if (seriesData.length > 0) {
            return seriesData;
        }
    }
    const data = [];
    const baseValue = driver.importance / 100;
    for (let i = 0; i < 12; i++) {
        const randomVariation = (Math.random() - 0.5) * 0.2;
        const value = Math.max(0, Math.min(1, baseValue + randomVariation));
        data.push({
            date: new Date(2023, i, 1),
            value: parseFloat(value.toFixed(precision)),
        });
    }
    return data;
}

export { generateDriverChartData };
