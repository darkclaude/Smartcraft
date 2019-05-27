const server = require('http').createServer();
const io = require('socket.io')(server);
const randomstring = require('randomstring');
io.on('connection', client => {
  client.on('event', data => {});
  client.on('disconnect', () => {  console.log("client out")});
  console.log("client in")
});
var num1 =0;
var num2 = 0;
var num3 =0;
var num4 = 0;
var num5 = -50;
var num6 = 0;
var num7=0;

var lat = 25.118950;
var lng =  55.164418
setInterval(function(){
  lat -=0.000050;
  lng -=0.000010;
    var hdop =  randomstring.generate({
        length: 2,
        charset:  'numeric'
      });
      var t1 =  randomstring.generate({
        length: 2,
        charset:  'numeric'
      });
      var t2 =  randomstring.generate({
        length: 2,
        charset:  'numeric'
      });
      var t3 =  randomstring.generate({
        length: 2,
        charset:  'numeric'
      });
      num1+=1;
      num2+=1;
      num3+=1;
      num4+=1;
      num5+=1;
      num6+=1;
      num7+=1;
if(num1>100){
  num1=0
}
if(num2>160){
  num2=0
}
if(num3>255){
  num3=0
}
if(num4 > 240 ){
  num4=0;
}
if(num5>40){
  num5=-50;
}
if(num6>5000){
  num6=0
}
if(num7>240){
  num7=0;
}
var fm = 0;
             //FM,Pitch,roll,yaw,heading,gpS,
var path1 = 'AUTO,'+num5+','+num5+','+num3+','+num3+','+'3D Fix'+','
              //Altitude,lat,lng,hdop,sats,thrust
var path2 =  num6+','+lat+','+lng+','+hdop/10+','+hdop+','+num1+','
 //eng1,eng2,esc1,esc2,estat,battery
var path3 =  num1+','+num2+','+num3+','+num3+',Armed,'+num7+','+num2+','
//esc1temp,esc2temp,bbattemp,envtemp
var path4 = t1+','+t2+','+t3+','+(t3-11);
//current
var path5= path1 +path2 +path3 +path4;
console.log(path5.length)
var payload = {};
  
var pArr = path5.split(',');
payload['navmode']=pArr[0];
payload['pitch']=pArr[1];
payload['roll']=pArr[2];
payload['yaw']=pArr[3];
payload['heading']=pArr[4];
payload['gpsfix']=pArr[5];
payload['altitude']=pArr[6];
payload['lat']=pArr[7];
payload['lng']=pArr[8];
payload['hdop']=pArr[9];
payload['sats']=pArr[10];
payload['thrustlevel']=pArr[11];
payload['engine1']=pArr[12];
payload['engine2']=pArr[13];
payload['esc1']=pArr[14];
payload['esc2']=pArr[15];
payload['estat']=pArr[16];
payload['battery']=pArr[17];
payload['airspeed']=pArr[18];
payload['esc1temp']=pArr[19];
payload['esc2temp']=pArr[20];
payload['battemp']=pArr[21];
payload['envtemp']=pArr[22];
io.emit('data',JSON.stringify(payload))

},100)

server.listen(3500);