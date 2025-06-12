const Expense = require('../models/Expense');
const { getCurrentMonthYear } = require('../utils/dateUtils');

module.exports = function(bot) {
    bot.onText(/^\/bill(?:@\w+)?(?:\s+(\d{1,2})\/(\d{4}))?/, async(msg, match) => {
        const chatId = msg.chat.id;
        let month, year;

        if (match[1] && match[2]) {
            month = parseInt(match[1]);
            year = parseInt(match[2]);

            if (month < 1 || month > 12) {
                bot.sendMessage(chatId, '❌ Invalid month. Please use a number between 1 and 12.');
                return;
            }
            if (year < 2000 || year > 2100) {
                bot.sendMessage(chatId, '❌ Invalid year. Please use a year between 2000 and 2100.');
                return;
            }
        } else {
            const current = getCurrentMonthYear();
            month = current.month;
            year = current.year;
        }

        try {
            const expenses = await Expense.find({ groupId: chatId, month, year });

            if (expenses.length === 0) {
                bot.sendMessage(chatId, `📊 No bills recorded for ${month}/${year}.`);
                return;
            }

            const userExpenses = {};
            let totalAmount = 0;

            expenses.forEach(expense => {
                if (!userExpenses[expense.username]) {
                    userExpenses[expense.username] = {
                        expenses: [],
                        total: 0
                    };
                }
                userExpenses[expense.username].expenses.push(expense);
                userExpenses[expense.username].total += expense.amount;
                totalAmount += expense.amount;
            });

            let message = `📊Total Bill for ${month}/${year} : Rs. ${totalAmount}\n`;
            message += '═'.repeat(30) + '\n\n';

            Object.entries(userExpenses).forEach(([user, data]) => {
                message += `${user}  (Contribution - ${data.total})\n`;
                message += '─'.repeat(30) + '\n';

                data.expenses.forEach((expense, index) => {
                    message += `${index + 1}. ${expense.amount} - ${expense.description}\n`;
                });
                message += '\n\n';
            });

            message += '💡 Tip: Use /bill MM/YYYY to view bills for a specific month';

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            bot.sendMessage(chatId, '❌ Sorry, there was an error fetching bills.');
        }
    });
};