const getDriverImportance = (driver) => driver.rawImportance?.overall?.mean || driver.importance;
const getHighestImportanceDriver = (drivers) => {
    if (drivers.length === 0)
        return null;
    let highestImportance = 0;
    let highestIndex = 0;
    for (const [index, driver] of drivers.entries()) {
        const importance = getDriverImportance(driver);
        if (importance > 0 && importance > highestImportance) {
            highestImportance = importance;
            highestIndex = index;
        }
    }
    return highestIndex;
};

export { getDriverImportance, getHighestImportanceDriver };
