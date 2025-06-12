function getCurrentMonthYear() {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };
}

module.exports = {
    getCurrentMonthYear
};