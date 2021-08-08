import { request } from 'undici';
//import redisClient from '../utlis/redis.js';
import { shuffle } from 'carret';

//let whitelist = ['javascript', 'php', 'go', 'c'];

async function getTheDevRead(kueri) {
  //const redis = redisClient(cache);

  if (!kueri) {
    return 'cara pakainya tulis: /devread <apa yang mau kamu cari>,\n Contoh: \n /devread ngehek ig pacar';
  }

  let stack;
  let data = [];

  let placehordel = (title, desc, link) =>
    `Judul: ` + title?.substring(0, 64) + `\n\n` + desc?.substring(0, 64) + '\n\n' + link;

  let requestDataByMedia = async function (jenis, kueri) {
    // const [cacheData] = await redis.MGET('devread_' + kueri + ':' + jenis);
    // if (cacheData) {
    //   console.log()
    //   return shuffle(cacheData);
    // }

    const apis = 'https://api.pulo.dev/v1/contents?page=1&media=' + jenis + '&query=';
    const { body } = await request(encodeURI(`${apis}` + kueri));
    const data = shuffle((await body.json()).data);
    // if (whitelist.includes(kueri)) {
    //   await redis.SETEX('devread_' + kueri + ':' + jenis, 60 * 60 * 6, data);
    // }
    return data;
  };

  try {
    data = data.concat((await requestDataByMedia('tulisan', kueri)).slice(0, 2));
    data = data.concat((await requestDataByMedia('web', kueri)).slice(0, 2));
  } catch (e) {
    return 'API lagi ngambek';
  }

  if (data.length != 0) {
    stack = data.map((x) => placehordel(x.title, x.body, x.url)).join('\n\n\t --- \n\n');
  } else {
    stack = 'Yha ga ketemu, cari keyword lain yuk';
  }

  return stack;
}

/**
 * Send help to user when needed.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function devRead(context) {
  const {
    message: { text },
  } = context;

  let kueri;

  if (text.startsWith('/devread ')) {
    kueri = text.substring(9);
  } else if (text.startsWith(`/devread@${context.me} `)) {
    kueri = text.substring(10 + context.me.length);
  }

  const read = await getTheDevRead(kueri);

  await context.telegram.sendMessage(context.message.chat.id, read);
}

/**
 * Send help to user when needed.
 * @param {import('telegraf').Telegraf} bot
 * @returns {Promise<void>}
 */
export function register(bot) {
  bot.command('devread', devRead);

  return [
    {
      command: 'devread',
      description: 'Bacaan untuk Developer.',
    },
  ];
}