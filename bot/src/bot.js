// Check if node is working
console.log("Starting bot");
// Load discord client dependency and create its instance
const Discord = require("discord.js");
const client = new Discord.Client();
// Load authenticator
// const Authenticator = require("./authenticator");
// var auth = new Authenticator();
const DateFromat = require("dateformat");
// Load file handler
const FileHandler = require("./filehandler.js");
var fileHandler = new FileHandler();
// Load config file
const configPath = "../config/config.json";
var config = require("../config/config.json");
// Load PUBG PUBGTracker
const PUBGTracker = require("./pubgtracker.js");
var pubgTracker = new PUBGTracker(process.env.TRNAPIKEY);
// Active text channel to listen on
var activeChannel = null;
// Activate logging into chat
var logging = true;
//------------------------------------------------------------------------------
// List of bot commands
var commands = [{
    name: "help",
    description: "Lists all commands",
    parameters: [],
    execute: function(params, output) {
      let help = "";
      for (let i = 0; i < commands.length; i++) {
        help = help + "Name: " + commands[i].name + "\n" +
          "Description: " + commands[i].description + "\n" +
          "Parameters: " + commands[i].parameters + "\n" +
          "-----------------------------------------------------------\n";
      }
      output.response = help;
    }
  },

  {
    name: "ping",
    description: "Responds with pong",
    parameters: [],
    execute: function(params, output) {
      output.response = {
        embed: {
          color: 3447003,
          description: "Pong!"
        }
      };
    }
  },

  {
    name: "prefix",
    description: "Replaces current prefix",
    parameters: ["New prefix"],
    execute: function(params, output) {
      let prefix = params[0];
      config.prefix = prefix;
      config.prefixLenght = prefix.length;
      fileHandler.writeToJSONFile(config, configPath);
      output.response = {
        embed: {
          color: 3447003,
          description: "Prefix changed to: " + prefix
        }
      };
    }
  },

  /*   {
      name: "logging",
      description: "Activates logging (responses to chat)",
      parameters: ["On/Off"],
      execute: function(params, output){
        let state = params[0];
        switch (state.toLowerCase()) {
          case "on":
            logging = true;
            output.response = "Logging state changed to: " + state;
            break;
          case "off":
            logging = false;
            output.response = "Logging state changed to: " + state;
            break;
          default:
            output.response = "Incorrect logging state!";
            break;
        }
      }
    }, */

  {
    name: "statspubg",
    description: "Prints out stats of a PUBG profile",
    parameters: ["PUBG Nickname"],
    execute: async function(params, output) {
      let nickname = params[0];
      const profile = await pubgTracker.getProfileByNickname(nickname);
      console.log(profile);
      output.response = {
        embed: {
          color: 3447003,
          author: {
            name: "Name: " + profile.name + " | Region: ",
            icon_url: profile.avatar
          },
          title: "------------------------------------------------------------------------------------",
          fields: [{
            name: "Rating",
            value: "Player rating",
            inline: true
          }, {
            name: "Win Percantage",
            value: " %%",
            inline: true
          }, {
            name: "K/D",
            value: "K/D Ratio",
            inline: true
          }, {
            name: "Top 10s",
            value: "Top 10s",
            inline: true
          }, {
            name: "Wins",
            value: "%%",
            inline: true
          }, {
            name: "Games Played",
            value: "Number of games played",
            inline: true
          }],
          footer: {
            text: "Pulled from pubgtracker.com | Profile last updated: " +
              DateFromat(new Date(profile.lastUpdated),
                "mmmm dS, yyyy, h:MM:ss TT")
          }
        }
      };
    }
  }
];
//------------------------------------------------------------------------------
// Functions

// Logging function
function log(channel, content) {
  channel.send(content);
}
// Check incoming message
function messageHandler(message) {
  /*Check if message begins with the defined prefix && check if the message
    wasn't sent by the bot itself to prevent infinite looping */
  // console.log("Is user " + message.author.id + " valid?: " + auth.authenticateUser(message.author.id));
  let possiblePrefix = message.content.substring(0, config.prefix.length);
  if (possiblePrefix == config.prefix && message.author.id !== client.user.id) {
    activeChannel = message.channel;
    // Split message content into string array and remove prefix
    let commandArray = message.content.substring(config.prefixLenght).split(" ");
    let paramArray = commandArray;
    // Create a structured object from array
    let command = {
        name: commandArray.splice(0, 1)[0],
        parameters: commandArray
      }
      // Calls commandHandler and relays the structured command
    commandHandler(command);
  }
}
// Find a corresponding command (structured command object)
function findCommand(command) {
  for (let i = 0; i < commands.length; i++) {
    if (commands[i].name == command.name.toLowerCase()) {
      if (commands[i].parameters.length == command.parameters.length) {
        // Return the corresponding command
        return commands[i];
      }
    }
  }
  // Not found
  return false;
}
// Handle command (structured command object)
function commandHandler(command) {
  let botCommand = findCommand(command);
  executor(botCommand, command.parameters);
}
// Execute command & log
async function executor(command, params) {
  // If command exists
  if (command) {
    let output = {
      response: ""
    };
    await command.execute(params, output);
    if (logging) {
      log(activeChannel, output.response);
    }
  } else {
    if (logging) {
      log(activeChannel, "Command does not exist | Incorrect parameters");
    }
  }
}
//------------------------------------------------------------------------------
// Event handlers
// When a message is recieved
client.on("message", (message) => {
  messageHandler(message);
});
//------------------------------------------------------------------------------
// Bot login using the auth.token
client.login(process.env.TOKEN);
