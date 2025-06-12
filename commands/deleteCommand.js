const Expense = require('../models/Expense');

module.exports = function(bot) {
    bot.onText(/^\/delete(?:@\w+)?\s+(.+)/, async(msg, match) => {
        const chatId = msg.chat.id;
        const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name || ''}`.trim();
        const description = match[1].trim().toLowerCase();

        console.log('Delete attempt:', { chatId, username, description });

        try {
            // First find the expense to verify it exists
            const expense = await Expense.findOne({
                groupId: chatId,
                username: username,
                description: description
            });

            if (!expense) {
                console.log('No matching expense found');
                bot.sendMessage(chatId, '❌ No matching expense found. Please check the description.');
                return;
            }

            // Delete the expense
            const result = await Expense.deleteOne({
                _id: expense._id
            });

            if (result.deletedCount > 0) {
                console.log('Expense deleted successfully');
                bot.sendMessage(chatId, `✅ Expense "${description}" deleted successfully!`);
            } else {
                console.log('Failed to delete expense');
                bot.sendMessage(chatId, '❌ Failed to delete expense. Please try again.');
            }
        } catch (error) {
            console.error('Error in delete command:', error);
            bot.sendMessage(chatId, '❌ Error deleting expense. Please try again.');
        }
    });
};