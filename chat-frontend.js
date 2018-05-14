$(function () {
    "use strict";
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    
    var color = false;
    var name = false;
    
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'No support for WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    var connection = new WebSocket('ws://127.0.0.1:1000');

      connection.onopen = function () {
          input.removeAttr('disabled');
          status.text('Enter your name:');
      };

      connection.onerror = function (error) {
          content.html($('<p>', {text: 'Server or connection problem'}));
      };

      connection.onmessage = function (message) {
        try {
          var json = JSON.parse(message.data);
        } 
        catch (e) {
          console.log('Invalid JSON',
              message.data);
          return;
        }
        if(json.type === 'color') {
          color = json.data;
          status.text(name+': ').css('color', color);
          input.removeAttr('disabled').focus()

          }
          else if(json.type === 'history') {
              for(var i=0; i < json.data.length; i++) {
                  writeMessage(json.data[i].author, json.data[i].text, json.data[i].color, new Date(json.data[i].time));
              }
          }
          else if(json.type === 'message') {
              input.removeAttr('disabled');
              writeMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
          }
          else {
              console.log('Unexpected error', json);
          }
      };
    
    input.keydown(function(e) {
        if(e.keyCode === 13) {
            var msg = $(this).val();
            if(!msg) {
                return;
            }
            connection.send(msg);
            
            $(this).val('');
            input.attr('disabled', 'disabled');
            
            if(name === false) {
                name = msg;
            }
        }
    });
    
    function writeMessage(author, text, color, time) {
        content.append('<p><span style="background:'+color+'; color:white">' + author + ": " + text +'</span></p>');
        content.append('<p><span style="font-size:10px; color:black; padding:1px">' + time.getHours()+':'+time.getMinutes()+'</span></p>');
    }
});