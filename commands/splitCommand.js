const Expense = require('../models/Expense');

function getCurrentMonthYear() {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };
}

module.exports = function(bot) {
    bot.onText(/^\/split(?:@\w+)?/, async(msg) => {
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
            const splitAmount = totalAmount / uniqueUsers.length;

            let message = `💰 Expense Split for ${month}/${year}\n\n`;
            message += `Total Amount: ${totalAmount}\n`;
            message += `Number of Members: ${uniqueUsers.length}\n`;
            message += `Split Amount per Person: ${splitAmount.toFixed(2)}\n\n`;
            message += 'Individual Contributions:\n';

            for (const username of uniqueUsers) {
                const userExpenses = expenses.filter(expense => expense.username === username);
                const userTotal = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                const balance = userTotal - splitAmount;
                message += `${username}: ${userTotal} (${balance > 0 ? '+' : ''}${balance.toFixed(2)})\n`;
            }

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('Error calculating split:', error);
            bot.sendMessage(chatId, '❌ Error calculating expense split. Please try again.');
        }
    });
};