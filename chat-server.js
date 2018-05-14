"use strict";

var serverPort = 1000;

var WebSocketServer = require('websocket').server;
var http = require('http');

var history = [];
var currentUsers = [];

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var colors = ['red', 'blue', 'green', 'pink', 'brown', 'darkblue', 'darkgreen', 'grey', 'orange', 'yellow', 'magenta', 'cyan'];
colors.sort(function() { return Math.random() > 0.5; });

var server = http.createServer(function(req, res) {});
server.listen(serverPort, function() {
    console.log("Server listening on port " + serverPort);
});

var webSocketServer = new WebSocketServer({
    httpServer: server
});

webSocketServer.on('request', function(req) {
    console.log("Origin connection " + req.origin);
    //making sure the user is connecting from or same website
    var connection = req.accept(null, req.origin);
    //keeping track of users
    var userIndex = currentUsers.push(connection) - 1;
    var userName = false;
    var userColor = false;
    
    if(history.length > 0) {
        connection.sendUTF(JSON.stringify({type:'history', data:history}));
    }
    
  connection.on('message', function(msg) {
    if (msg.type === 'utf8') { // text only
        if(userName === false) {
            userName = htmlEntities(msg.utf8Data);
            userColor = colors.shift();
            connection.sendUTF(JSON.stringify({type:'color', data:userColor}));
        }
        else{
            var obj = {
                time: (new Date()).getTime(),
                text: htmlEntities(msg.utf8Data),
                author: userName,
                color: userColor
            };
            history.push(obj);
            history = history.slice(-200);
            
            var jsonHistory = JSON.stringify({type:'message', data:obj });
            for(var i=0; i < currentUsers.length; i++) {
                currentUsers[i].sendUTF(jsonHistory);
            }
        }
    }
  });

  connection.on('close', function(connection) {
      if(userName !== false && userColor !== false) {
          currentUsers.splice(userIndex, 1);
          colors.push(userColor);
      }
  });
});