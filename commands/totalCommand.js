const Expense = require('../models/Expense');

function getCurrentMonthYear() {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };
}

module.exports = function(bot) {
    bot.onText(/^\/total(?:@\w+)?/, async(msg) => {
        const chatId = msg.chat.id;
        const { month, year } = getCurrentMonthYear();

        try {
            const expenses = await Expense.find({
                groupId: chatId,
                month,
                year
            });

            if (expenses.length === 0) {
                bot.sendMessage(chatId, 'No expenses found for this month.');
                return;
            }

            const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const uniqueUsers = [...new Set(expenses.map(expense => expense.username))];

            let message = `💰 Total Expenses for ${month}/${year}\n\n`;
            message += `Total Amount: ${totalAmount}\n`;
            message += `Number of Members: ${uniqueUsers.length}\n\n`;
            message += '💵 Individual Totals:\n\n';

            for (const username of uniqueUsers) {
                const userExpenses = expenses.filter(expense => expense.username === username);
                const userTotal = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                message += `${username}: ${userTotal}\n`;
            }

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('Error calculating total:', error);
            bot.sendMessage(chatId, '❌ Error calculating total. Please try again.');
        }
    });
};