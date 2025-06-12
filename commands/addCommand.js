const Expense = require('../models/Expense');
const { getCurrentMonthYear } = require('../utils/dateUtils');

module.exports = function(bot) {
    bot.onText(/^\/add(?:@\w+)? (.+)/, async(msg, match) => {
        const chatId = msg.chat.id;
        const user = msg.from.username || msg.from.first_name;
        const expenseText = match[1];

        const parts = expenseText.split(' ');
        const amount = parseFloat(parts[0]);
        const description = parts.slice(1).join(' ').trim().toLowerCase();

        if (isNaN(amount)) {
            bot.sendMessage(chatId, 'Please use format: /add "amount" "description"');
            return;
        }

        const { month, year } = getCurrentMonthYear();

        try {
            const expense = new Expense({
                groupId: chatId,
                userId: msg.from.id,
                username: user,
                amount,
                description,
                month,
                year
            });

            await expense.save();
            bot.sendMessage(chatId, `Added expense: ${amount} for ${description} by ${user}`);
        } catch (error) {
            console.error('Error saving expense:', error);
            bot.sendMessage(chatId, 'Sorry, there was an error saving your expense.');
        }
    });
};