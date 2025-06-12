require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const Expense = require('./models/Expense');

const addCommand = require('./commands/addCommand');
const billCommand = require('./commands/billCommand');
const deleteCommand = require('./commands/deleteCommand');
const helpCommand = require('./commands/helpCommand');
const splitCommand = require('./commands/splitCommand');
const totalCommand = require('./commands/totalCommand');

const token = process.env.BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const bot = new TelegramBot(token, { polling: true });

addCommand(bot);
billCommand(bot);
deleteCommand(bot);
helpCommand(bot);
splitCommand(bot);
totalCommand(bot);

function getCurrentMonthYear() {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };
}

async function sendMonthlySummary(chatId) {
    const { month, year } = getCurrentMonthYear();
    const expenses = await Expense.find({ groupId: chatId, month, year });

    if (expenses.length === 0) {
        bot.sendMessage(chatId, 'No expenses recorded for this month.');
        return;
    }

    const userExpenses = {};
    let totalAmount = 0;

    expenses.forEach(expense => {
        if (!userExpenses[expense.username]) {
            userExpenses[expense.username] = [];
        }
        userExpenses[expense.username].push(expense);
        totalAmount += expense.amount;
    });

    let message = `📊 Monthly Summary (${month}/${year}):\n\n`;
    message += `Total Expenses: ${totalAmount}\n\n`;

    Object.entries(userExpenses).forEach(([user, userExpenses]) => {
        const userTotal = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        message += `${user}:\n`;
        message += `Total: ${userTotal}\n`;
        userExpenses.forEach((expense, index) => {
            message += `${index + 1}. ${expense.amount} - ${expense.description}\n`;
        });
        message += '\n';
    });

    bot.sendMessage(chatId, message);
}

function scheduleMonthlySummary() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const timeUntilMidnight = lastDay - now;

    setTimeout(() => {
        Expense.distinct('groupId').then(groupIds => {
            groupIds.forEach(chatId => {
                sendMonthlySummary(chatId);
            });
        });
        scheduleMonthlySummary();
    }, timeUntilMidnight);
}

scheduleMonthlySummary();