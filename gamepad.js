var io = require('socket.io-client')

var gamepadLib = require("gamepad");
 var gloargs ="";
 var socket = io('http://192.168.4.148:4500');
 //var socket = io('http://172.20.10.7:4500');
 //  var socket = io('http://hamideu.herokuapp.com');
 // var socket = io('http://80.227.113.178:4500');
 var in_connection = false;
var old_mission_hash="";
var sha1 = require('sha1')

// Initialize the library
gamepadLib.init()
 
// List the state of all currently attached devices
for (var i = 0, l = gamepadLib.numDevices(); i < l; i++) {
  console.log(i, gamepadLib.deviceAtIndex());
}
 
//console.log(gamepad.detectDevices)
// Create a game loop and poll for events

setInterval(gamepadLib.processEvents, 10);
// Scan for new gamepads as a slower rate
setInterval(gamepadLib.detectDevices, 5000);
 

var gamepad={type: "joystick",live:false,data:{"0":0,"1": 0, "2": 0, "3":0,"4":0,"5": 0, "6":2000, "7":2000, "8":2000}};//JOYSTICK

var gameAv = false;
// Listen for move events on all gamepads
gamepadLib.on("move", function (id, axis, value) {

//console.log({axis: axis, value:value})

var temp = Math.round(map(value,1,-1,-2000,2000));
if(temp>-250 && temp<250){
    temp=0;
}

  if(axis==7){
 console.log(temp)
  }
gamepad.data[axis.toString()] = temp;
gamepad.live = true;


});
gamepadLib.on("up", function (id, num) {
  
  var args = JSON.stringify({"action": 0, button: num});
  socket.emit('gamepad_local',args);

   console.log(args);
 
});
gamepadLib.on("down", function (id, num) {
  
   
  var args = JSON.stringify({"action": 1, button: num});
  socket.emit('gamepad_local',args);
  socket.emit('gamepad_local',args);
  console.log(args);
 
});


 
setInterval(function(){
   // console.log(gamepadData.data)
  if(gamepad.live){

    if(gloargs=="SERIAL"){
     var args = JSON.stringify(gamepad);
      var p = args+"#";
      //console.log("FP",p)
      event.returnValue = 'OK'; 
      port.write(p);
    
     // port.write(p);
   
      
      }
      else if(gloargs=="GATEWAY"){
        var args = JSON.stringify(gamepad);
        var current_mission_hash = args//sha1(args);
        old_mission_hash=args;
        if(current_mission_hash != old_mission_hash) {
        
         
        } else {
        
         socket.emit('joystick_local',args);
        }
    
      }
     else{
   //    event.returnValue = 'OK'; 
     }
    
  
  }

  
},15);



  console.log("attempt")
 
  socket.on('connect', function () {
  console.log('connected', 'Gateway Connected');
    gloargs = 'GATEWAY';
    in_connection=true;
    console.log('in')
  });

  socket.on('connect_timeout', (timeout) => {
    console.log('timeout')
    in_connection=false;
 console.log('disconnected', 'Connection Timed Out');
  });


  socket.on('connect_error', (timeout) => {
    console.log('disconnected', 'Error could not connect');
    socket.close();
    in_connection=false;
    gloargs = '';
  });

  socket.on('disconnect', function () {
   // win.webContents.send('disconnected', 'Gateway disconnected');
    socket.close();
    gloargs = '';
    in_connection=false;
    console.log('out')
  });

setInterval(function(){
gamepad.live = false;
},2000)



setInterval(function(){
  try{
    if(!in_connection){
  // socket = io('http://192.168.4.148:4500');
    }
  }
  catch(err){}
 
 },2000)
function map (Var,in_min, in_max, out_min, out_max) {
    return (Var - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
    
