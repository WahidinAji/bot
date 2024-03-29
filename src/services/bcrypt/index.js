import { getCommandArgs } from "#utils/command.js";
import bcrypt from "bcrypt";

async function hash(context) {
  //if bot
  if (context.message.from.is_bot) {
    await context.reply("I can't encrypt myself. That's not safe.");
    return;
  }

  const text = getCommandArgs("bcrypt", context);
  //if empty string and not reply to any message
  if (text === "" && !context.message.reply_to_message) {
    await context.telegram.sendMessage(
      context.chat.id,
      `@${context.message.from.username}, malas ngetik ya?`,
      { 
        parse_mode: "HTML", 
        reply_to_message_id: context.message.message_id
      }
    );
    return;
  }

  let message = text;
  //if reply to a message
  if (context.message.reply_to_message) {
    //if reply a photo
    if (context.message.reply_to_message.photo) {
      await context.telegram.sendMessage(
        context.chat.id,
        `@${context.message.from.username}, malas ngetik ya sampai mau hashing gambar?`,
        { 
          parse_mode: "HTML", 
          reply_to_message_id: context.message.message_id
        }
      );
      return;
    }
    message = context.message.reply_to_message.text;
  }

  //hash the message
  const hashed = bcrypt.hashSync(message, 10);
  await context.deleteMessage(context.message.message_id);
  await context.reply(hashed);
}

/**
 * @param {import('telegraf').Telegraf} bot
 * @returns {{command: String, description: String}[]}
 */

export function register(bot) {
  bot.command("bcrypt", hash);
  return [
    { command: "bcrypt", description: "Encrypt a text using bcrypt" }
  ];
}