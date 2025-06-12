module.exports = function(bot) {
    bot.onText(/^\/help(?:@\w+)?/, (msg) => {
        const chatId = msg.chat.id;
        const helpMessage = `
🤖 Expense Bot Commands:

/add *amount* *description* - Add a new bill
/bill - View current month's bills
/bill *MM/YYYY* - View bills for specific month (only for you)
/delete *description* - Delete your own bill
/total - Show total bills for current month
/split - Show bill split between members
/help - Show this help message`;
        bot.sendMessage(chatId, helpMessage);
    });
};