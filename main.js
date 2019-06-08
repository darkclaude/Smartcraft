const electron = require('electron')
var rest = require('restler');
const express = require('express');
var cors = require('cors')
var serveStatic = require('serve-static')
var io = require('socket.io-client')
var randomItem = require('random-item');
var serargs = [];
var socargs = '';
var gloargs = '';
var missionCache = "";
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline');
 var port= new SerialPort('/',{ baudRate: 11500});
 

//const {  } = require('electron');
const { app,BrowserWindow, ipcMain } = require('electron')
require('electron-reload')(__dirname);
var static = express();
static.use(cors())
static.use(serveStatic('routes', { 'dash': ['index.html'], 'propulsion': ['index.html'], 'planner' : ['index.html'] }))
static.listen(3000)

//static.listen(6666);
var socket = io('');
app.on('ready', createWindow)



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1700, height: 1000, resizable: false, fullscreenable: false, title: 'MDX Ground', webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadURL('http://localhost:3000/dash')

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}



// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
    
  }
})

ipcMain.on('ping', (event, args) => {
  console.log("Received: " + args);
});
ipcMain.on('httpget', (event, args) => {

  rest.get(args).on('complete', function (result) {
    if (result instanceof Error) {
      console.log('Error:', result.message);
      event.returnValue = "failed";
      // this.retry(5000); // try again after 5 sec
    } else {
      event.returnValue = result;
      console.log(result);
    }
  });

});




ipcMain.on('connect', (event, args) => {
  socargs = args;
  socket = io('http://' + args);
  console.log("attempt")
  event.returnValue = "Ok";
  socket.on('connect', function () {
    win.webContents.send('connected', 'Gateway Connected');
    gloargs = 'GATEWAY';
    socket.emit('new_connection',"");
    console.log('in')
  });

  socket.on('connect_timeout', (timeout) => {
    console.log('timeout')
    win.webContents.send('disconnected', 'Connection Timed Out');
  });


  socket.on('connect_error', (timeout) => {
    win.webContents.send('disconnected', 'Error could not connect');
    socket.close();
    gloargs = '';
  });

  socket.on('disconnect', function () {
    win.webContents.send('disconnected', 'Gateway disconnected');
    socket.close();
    gloargs = '';
    console.log('out')
  });
  var upt = new Date();
  socket.on('data', function (data) {
    // var payload = {};
    var utime = new Date() - upt;
    var timenn = new Date(utime).getMilliseconds();
   // console.log("Average Update:  " + timenn);
    upt = new Date();
   try{
    payload = JSON.parse(data);

    var payloadJson = JSON.stringify(payload);
    //console.log(payloadJson);
    if(payload.type=="telemetry"){
      win.webContents.send('data',data);
      if(data.toString().indexOf("KEEP") >=0){
      }
    else{
      missionCache= line.toString();
    }
      }
    
    else if(payload.type=="commandresponse"){
      win.webContents.send('commandresponse',data);
      
      console.log(line.toString())
    }
    else if(payload.type=="RWPOK"){
      win.webContents.send('RWPOK',data);
      
      console.log(line.toString())
    }
    else if(payload.type=="missionUpdate"){
      win.webContents.send("missionUpdate",data);
    
      console.log(line.toString())
    }
     else{
      win.webContents.send('test',data);
       console.log(line.toString())
     }
    }catch(err){}
    //win.webContents.send('data', payloadJson);
    //    win.webContents.send('data',data);
  })

});
ipcMain.on('new_connection', (event,args) =>{
  socket.emit('new_connection',"");
  event.returnValue = "Ok";
})
ipcMain.on('disconnect', (event, args) => {
  try {
    socket.close();
    gloargs = '';
    event.returnValue = "Ok";
  }
  catch (error) {

  }
})

var dc = 0;

ipcMain.on('transmit', (event,args) =>{
  //console.log(JSON.parse(args));
var valid = true;
try{
var ev  =  JSON.parse(args);
console.log(ev);
if(valid){
  if(gloargs=="SERIAL"){
   //var  port2 = new SerialPort(serargs[0],{ baudRate: parseInt(serargs[1]) });
   var p = args+"#";
   //console.log("FP",p)
   event.returnValue = 'OK'; 
   port.write(p);
 
  // port.write(p);

   
   }
   else if(gloargs=="GATEWAY"){
      socket.emit('command',args);
     // console.log(args);
      event.returnValue = 'OK'; 
   }
  else{
    event.returnValue = 'OK'; 
  }
 }
 
}catch(err){
  valid=false;
    event.returnValue = 'ERROR';
  
}

});



ipcMain.on('serialconnect', (event,arg) =>{

 serargs = arg.split(':')
 
event.returnValue="OK";
 port = new SerialPort(serargs[0],{ baudRate: parseInt(serargs[1]) });
parser = port.pipe(new Readline({ delimiter: '#' }));

port.on("open", () => {
  //console.log('serial port open');
  gloargs = 'SERIAL';
 
  win.webContents.send('connected','Device Connected');
});
parser.on('data', (line) =>{
  //line = line.toString();
var dnt = false;
//console.log(line);
var payload = {};
try{
  dc++;
//  console.log(dc);
  payload = JSON.parse(line.toString());
  var payloadJson = JSON.stringify(payload);
 
}
 catch(err){
  // console.error(err)
   dnt =true;
 }
 
if(payload.type=="telemetry"){
  win.webContents.send('data',line.toString());
  if(line.toString().indexOf("KEEP") >=0){
  }
else{
  missionCache= line.toString();
}
  }

else if(payload.type=="commandresponse"){
  win.webContents.send('commandresponse',line.toString());
  
  console.log(line.toString())
}
else if(payload.type=="RWPOK"){
  win.webContents.send('RWPOK',line.toString());
  
  console.log(line.toString())
}
else if(payload.type=="missionUpdate"){
  win.webContents.send("missionUpdate",line.toString());

  console.log(line.toString())
}
 else{
  win.webContents.send('test',line.toString());
   console.log(line.toString())
 }
 //JSON.stringify(line);
  
  //var payloadJson = JSON.stringify(line);
  //console.log(line.navmode);

 //win.webContents.send('data',payloadJson);
});

port.on('error', function(err) {
 console.log('Error: ', err.message);
 gloargs = '';
 
  win.webContents.send('disconnected',err.message);
})
port.on('disconnect', function() {
 // console.log('Error: ', err.message);
 gloargs = '';
  win.webContents.send('disconnected','Device Connection Lost');
})
port.on('close', function(err) {
  //console.log('Error: ', err.message);
  gloargs = '';
  win.webContents.send('disconnected','Device Disconnected');
})
});
ipcMain.on('serialdisconnect', (event,args) => {
  try{
  port.close();
  gloargs = '';
  event.returnValue = "Ok";
  }
  catch(error){
  
  }
  })

  ipcMain.on('fetchports', (event,args) => {
    try{
      SerialPort.list(function(err,ports){
       // var debug = require('debug')
     //   debug(ports)
     
    // process.stdout.write("new line");
      console.log(ports);
   
        var portnames =[];
        for(var p of ports){
          if(p['comName'].toLowerCase().indexOf("com")>=0 || p['comName'].toLowerCase().indexOf("usb")>=0 ||p['comName'].toLowerCase().indexOf("esp")>=0 || p['comName'].toLowerCase().indexOf("mdx")>=0)
          portnames.push(p['comName'])
        }
        event.returnValue =  randomItem(portnames);
        });
    
    }
    catch(error){
    
    }
    })
    

ipcMain.on('getState', (event, args) => {
  if (gloargs == '') {
   event.returnValue = 'null'; 
  }
  else if (gloargs == 'SERIAL') {
    event.returnValue = serargs[0] + ',' + serargs[1];
  }
  else if (gloargs == 'GATEWAY') {
    event.returnValue = 'socket' + ',' + socargs
  }

});

ipcMain.on('getmissionState', (event, args) => {

    event.returnValue = missionCache;
  

});

setInterval(function(){
 // log.info("HELLO")
 //rest.get("https://darkclaude:ninjax12@opensky-network.org/api/states/all?lamin=22.3752&lomin=51.6174&lamax=26.4949&lomax=56.6161").on('complete', function (result) {
  rest.get("https://opensky-network.org/api/states/all").on('complete', function (result) {

 if (result instanceof Error) {
    //console.log('Error:', result.message);
    this.retry(5000); // try again after 5 sec
  } else {
   // console.log(result.states[0]);
  // console.log(result);
  // console.error(result)
    var flightsRaw = result;
    var flights = [];
    try{
for (var k of flightsRaw.states) {
  var flight = {};
  flight["icao24"] = k[0];
  flight["callsign"] = k[1];
  flight["origin"] = k[2];
  flight["time_position"] = k[3];
  flight["last_contact"] = k[4];
  flight["lng"] = k[5];
  flight["lat"] = k[6];
  flight["baro_alt"] = k[7];
  flight["on_ground"] = k[8];
  flight["velocity"] = k[9];
  flight["heading"] = k[10];
  flight["vertical_speed"] = k[11];
  flight["sensors"] = k[12];
  flight["gps_alt"] = k[13];
  flight["squawk"] = k[14];
  flight["spi"] = k[15];
  flight["pos"] = k[16];
  //console.log(flight["callsign"]+"\n");
  flights.push(flight);

}
    }catch(error){}
var payloadJson = JSON.stringify(flights);
win.webContents.send('radar', payloadJson);

//console.log(flights);

  }
});


  
},500);



// 