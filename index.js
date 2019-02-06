require('dotenv').config();
const axios = require('axios');
//Reddit Dependencies
const snoowrap = require('snoowrap');
const snoostorm = require('snoostorm');

const r = new snoowrap({
  userAgent: process.env.USER_AGENT,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS
});

const client = new snoostorm(r);
const streamOptions = {
  subreddit: 'snoosadventure',
  results: 25,
  pollTime: 5000
}

let comments = client.CommentStream(streamOptions);
comments.on('comment', (comment) => {
  console.log(comment.author.name);
  if (comment.body.toString().indexOf("@") > -1) {
    let atIndex = comment.body.indexOf('@');
    let openParIndex = comment.body.indexOf('(');
    let closeParIndex = comment.body.indexOf(')');
    if (atIndex > -1 && openParIndex > atIndex && closeParIndex > openParIndex) {
      let action = comment.body.substring(atIndex + 1, openParIndex);
      let args = comment.body.substring(openParIndex + 1, closeParIndex);
      let body = {
        user: comment.author.name
      }
      switch (action) {
        case 'create':
          axios.post(`${process.env.BACKEND_ADDRESS}/api/rpg/create`, body).then(data => {
            comment.reply(data);
          });
          break;
        case 'rest':
          axios.post(`${process.env.BACKEND_ADDRESS}/api/rpg/rest`, body).then(data => {
            comment.reply(data);
          });
          break;
        case 'battle':
          body = {
            ...body,
            monster: action
          }
          axios.post(`${process.env.BACKEND_ADDRESS}/api/rpg/battle`, body).then(data => {
            comment.reply(data);
          })
          break;
        case 'buy':
          body = {
            ...body,
            item: action
          }
          axios.post(`${process.env.BACKEND_ADDRESS}/api/rpg/buy`, body).then(data => {
            comment.reply(data);
          });
          break;
        case 'sell':
          body = {
            ...body,
            item: action
          }
          axios.post(`${process.env.BACKEND_ADDRESS}/api/rpg/sell`, body).then(data => {
            comment.reply(data);
          })
          break;
        case 'levelUp':
          axios.post(`${process.env.BACKEND_ADDRESS}/api/rpg/levelUp`, body).then(data => {
            comment.reply(data);
          })
          break;

      }

    }
  }
});