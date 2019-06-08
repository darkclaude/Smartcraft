const {ipcRenderer} = require('electron');
const con = require('electron').remote.getGlobal('console');
var app = angular.module('mdx', []);

//var chart;
var data;
var sender = null;
var try_to_connect = false;
app.controller('MainController', ['$scope' ,'$sce','$http', '$interval','$timeout', '$window','$parse', function ($scope, $sce,$http, $interval,$timeout, $window, $parse) {
var userid;
var userobj;
$scope.dtotal=0.0;
$scope.uploadstat="";
$scope.markers =[]
$scope.missionModes = ["NAVPOINT","TAKEOFF","LAND"];
$scope.ModelAction = {};
$scope.ModelAltitude = {};
$scope.ModelVelocity = {};
var lmarkers = [];

var mapObj = new GMaps({
  el: '#map',
  lat: 25.118950,
  lng:  55.164418,
  click: function(event) {
  //  alert(event)
  //  con.log(event);
    //console.log(event);
  //
   placeMarker(event.latLng);
    
  }
});
var poly =  mapObj.drawPolyline({
  path : [],
  strokeColor: '#000000',
  strokeOpacity: 1.0,
  strokeWeight: 3
});


var planeSymbol = {
//  path:"M 439.48098,95.969555 L 393.34268,142.46481 L 305.91233,133.41187 L 324.72376,114.58551 L 308.61525,98.464215 L 276.15845,130.94677 L 185.25346,123.08136 L 201.15145,107.27643 L 186.46085,92.574165 L 158.32,120.73735 L 45.386032,112.12042 L 15.000017,131.66667 L 221.20641,192.48691 L 298.26133,237.01135 L 191.91028,345.62828 L 152.82697,408.6082 L 41.549634,393.05411 L 21.037984,413.58203 L 109.25334,470.93369 L 166.38515,558.95725 L 186.8968,538.42933 L 171.35503,427.06371 L 234.28504,387.94939 L 342.81586,281.51396 L 387.305,358.63003 L 448.07703,565.00001 L 467.60778,534.58989 L 458.99769,421.56633 L 487.16033,393.38134 L 473.14247,379.35235 L 456.6139,395.97492 L 448.79636,303.63439 L 481.25315,271.15184 L 465.14464,255.03055 L 446.33321,273.8569 L 436.04766,185.1164 L 482.35108,138.7864 C 501.1942,119.92833 560.62425,61.834815 564.99998,14.999985 C 515.28999,23.707295 476.1521,61.495405 439.48098,95.969555 z",
 path: 'M362.985,430.724l-10.248,51.234l62.332,57.969l-3.293,26.145 l-71.345-23.599l-2.001,13.069l-2.057-13.529l-71.278,22.928l-5.762-23.984l64.097-59.271l-8.913-51.359l0.858-114.43 l-21.945-11.338l-189.358,88.76l-1.18-32.262l213.344-180.08l0.875-107.436l7.973-32.005l7.642-12.054l7.377-3.958l9.238,3.65 l6.367,14.925l7.369,30.363v106.375l211.592,182.082l-1.496,32.247l-188.479-90.61l-21.616,10.087l-0.094,115.684',
  scale: 0.0633, 
  strokeOpacity: 1,
  //fill:'black',
  fillColor: 'green',
  fillOpacity: 1,
  color: 'black',
  strokeWeight: 2,
  rotation: 0
};	


mapObj.setZoom(14);
var plane = mapObj.addMarker({
  lat: 25.118950,
  lng:  55.164418,
  icon: planeSymbol,
  click: function(e) {
  //  alert('You clicked in this marker');
  }
}); 
//STATE CHECK BEGIN
//heading= f;
var state = ipcRenderer.sendSync('getState', 'gs');
if(state=='null'){
    $scope.datalink = "Gateway"
    $scope.btnStatus= "Connect";
    $scope.btnC= "btn btn-success"
    $scope.conStat = false;
    $scope.linkdn = false;
    $scope.slisten = false;
}
else{
    var args = state.split(',');
    if(args[0]=='socket'){
    $scope.datalink = "Gateway";
    $scope.linkpath= args[1];
    $scope.btnStatus= "Disconnect";
    $scope.btnC= "btn btn-warning"
    $scope.conStat = true;
    $scope.linkdn = true;
    $scope.slisten = false;
    }
    else{
        $scope.datalink = "Serial";
    $scope.linkpath= args[0];
    $scope.dataport= args[1];
    $scope.btnStatus= "Disconnect";
    $scope.btnC= "btn btn-warning"
    $scope.conStat = true;
    $scope.linkdn = true;
    $scope.slisten = true; 
    }
}
//STATE CHECK DONE


   // console.log(response);
  
   //$scope.test = ipcRenderer.sendSync('http', 'http://google.com');
$scope.connect = function(linkpath,datalink){
    if(linkpath){
        if(datalink=="Gateway"){
        if($scope.btnC.indexOf("success")>0){
        ipcRenderer.sendSync('connect', linkpath);
        $scope.conStatus=true
        $scope.linkdn = true;
        $scope.btnStatus= "Connecting...";
$scope.btnC= "btn btn-warning"
        try_to_connect = true;
        }
        else{
            ipcRenderer.sendSync('disconnect', linkpath);
            $scope.conStatus=true
            $scope.btnStatus= "disconnecting...";
    $scope.btnC= "btn btn-warning"
        }
       
    }
    else if(datalink=="Serial"){
        if($scope.btnC.indexOf("success")>0){
            if(typeof $scope.dataport === "undefined"){
                // alert()
               // swal($scope.dataport)
                 swal("", "Please Select Baud Rate", "warning");
             }
             else{
            //     swal($scope.dataport)
             ipcRenderer.sendSync('serialconnect', linkpath+':'+$scope.dataport);
             $scope.conStatus=true;
             $scope.linkdn = true;
             $scope.btnStatus= "Connecting...";
     $scope.btnC= "btn btn-warning"
             }
            }
            else{
                ipcRenderer.sendSync('serialdisconnect', linkpath);
                $scope.conStatus=true
                $scope.btnStatus= "disconnecting...";
        $scope.btnC= "btn btn-warning"
            }
     
    }
    else{}
}
   
    else{
      // swal("No Entry!");
       swal("", "Please Enter a Linkpath", "warning");
    }
  
}

$("#linkpath").keyup(function(){
    //swal($scope.datalink)
   if($scope.datalink=="Serial"){
   // ipcRenderer.sendSync('fetchports', 'fp'); 
   fetchports();
   }
  });
  $("#linkpath").keydown(function(){
    if($scope.datalink=="Serial"){
       fetchports();
       } 
});
function fetchports(){
     
    $scope.$apply(function () {
    $scope.linkpath = ipcRenderer.sendSync('fetchports', 'fp');
    });
}
$scope.linkchange = function(curval){
if(curval=="Serial"){
$scope.slisten = true;


}
else{
$scope.slisten = false;
}
}


ipcRenderer.on('connected', (event, args) => {
    
    $scope.$apply(function () {
        $scope.conStatus=false;
        $scope.btnStatus= "Disconnect";
        $scope.linkdn = true;
$scope.btnC= "btn btn-danger";
    });
 //   swal(args)
    swal("", args.toUpperCase(), "success");
    try_to_connect=true;
 /// console.log(args)
})


ipcRenderer.on('data', (event, args) => {
  $scope.$apply(function () {
      $scope.conStatus=false;
      $scope.btnStatus= "Disconnect";
      $scope.linkdn = true;
$scope.btnC= "btn btn-danger";
  });

//  $scope.conStatus=true;
   try_to_connect=true;

 try{
data = JSON.parse(args);
 }catch(error){

 }
 var mission=[];
 try{
var missionAr = JSON.parse(data.mission);
for(var b=0; b<missionAr.length; b++){
mission.push(JSON.parse(missionAr[b]));
}
 console.log(mission)
}catch(err){}
 var newPosition = new google.maps.LatLng(data.lat, data.lng);
 plane.setPosition(newPosition);
var currentheading2 = data.heading// mapObj.getHeading({lat:plane.getPosition().lat(),lng: plane.getPosition().lng()},{lat: 25.038015, lng: 55.117550});//
//new google.maps.geomtry.spherical.computeHeading(new google.maps.LatLng(25.197525, 55.274288),new google.maps.LatLng(25.038015,55.117550));
planeSymbol.rotation = currentheading2;
plane.setIcon(planeSymbol); 


});

ipcRenderer.on('disconnected', (event, args) => {
    $scope.$apply(function () {
        $scope.conStatus=false;
        $scope.btnStatus= "Connect";
        $scope.btnC= "btn btn-success";
        $scope.linkdn = false;
            try_to_connect=false;
    });
  
    try_to_connect=false;
    console.log(args)
  //  swal(args)
  swal("", args.toUpperCase(), "error");
})

ipcRenderer.on('commandresponse', (event, args) => {

 try{
var res  = JSON.parse(args.toString());
console.log(res);
//alert(args)
    switch(res.cmd){
      
      case "UWP" :
      if(res.state=="success"){
        swal("","Mission Upload Successful",res.state);
      }
      else {
        swal("","Mission Upload Failed",res.state);
      }
      break;

    }


 }catch(error){

 }

});
var rwp =0;
ipcRenderer.on('RWPOK', (event,args) =>{
  rwp= rwp+1;
  var rcv =JSON.parse(args)["msg"]
 console.log(rcv);
 $scope.$apply(function () {
   $scope.uploadstat = "Uploaded WP: "+rcv+"/"+lmarkers.length;
 });

})
ipcRenderer.on('test', (event, args) => {

  try{
    console.log("validity")
 var res  = JSON.parse(args);
 console.log(res);
 var res2 = JSON.parse(res.msg);
 console.log(res2);
 console.log(res2.length)
 
 
  }catch(error){
 
  }
 
 });


function placeMarker(location) {
   var lat = location.lat();
   var lng = location.lng();
    var num=999;
    num  = lmarkers.length;
    if(num==0){
      num=num+1;
    }
    else{
      num=num+1;
    }

  try{
    if(parseInt(lmarkers[0].marker.getLabel()) >= num ){
         num= parseInt(lmarkers[0].marker.getLabel())+1;
    }
  }
  catch(err){}

  var point = {index:num-1 , lat: lat, lng:lng, action:"p"+(num)+".act", alt: "p"+(num)+".alt", vel: "p"+(num)+".vel", d2n: 0};
 // lmarkers.push(point);
 if(!isNaN(point.index)){
 if(num==1){
  point['marker'] = mapObj.addMarker({
    lat: lat,
    lng:  lng,
    label: "Start", 
    click: function(e) {
    //  alert('You clicked in this marker');

    }
  }); 
 point['circle']=  mapObj.drawCircle({lat: lat, lng : lng, radius:70, fillColor: "green"})
}
else{
  point['marker'] = mapObj.addMarker({
    lat: lat,
    lng:  lng,
    label: (point.index+1).toString(), 
    click: function(e) {
    //  alert('You clicked in this marker');
    }
  }); 
  point['circle']=  mapObj.drawCircle({lat: lat, lng : lng, radius:70, fillColor: "red"})
}

  lmarkers.push(point);
 
  lmarkers = lmarkers.sort((a, b) => a.index - b.index);
if(lmarkers.length>1){
  for(var l=0; l<lmarkers.length; l++){
    if(l!=lmarkers.length-1){
  lmarkers[l].d2n = (mapObj.getDistance({lat:lmarkers[l].lat,
    lng: lmarkers[l].lng},
    {lat: lmarkers[l+1].lat, lng: lmarkers[l+1].lng})/1000).toFixed(1);
   
}
else{
  var dt =0;
  for(var b=0; b<lmarkers.length-1; b++){
    dt += parseFloat(lmarkers[b].d2n);
  }

  $scope.dtotal=dt.toFixed(2);
}
  }
}
else if(lmarkers.length==1){
  lmarkers[0].d2n= 0;
}
else{

}
  var pathP =[] ;
for(var m of lmarkers){
  pathP.push([m.lat,m.lng])
}
//console.log(pathP)
mapObj.removePolylines();
   poly =  mapObj.drawPolyline({
    path : pathP,
    strokeColor: "green",
    strokeOpacity: 1.0,
    strokeWeight: 3
  });
for(var k =0; k<lmarkers.length; k++){
  lmarkers[k].index = k;
}


  $scope.$apply(function () {
    //var temp =lmarkers.sort((a, b) => b.index - a.index);
   //console.log(temp)
    $scope.markers = lmarkers;
    $scope.markers = $scope.markers.reverse();
    //$scope.markers=
  });
  
}
}
  
$scope.delMarker = function(markerIndex){
  //con.log(markerIndex);
  lmarkers[lmarkers.length-1-markerIndex].marker.setMap(null);
   console.log(lmarkers.splice(lmarkers.length-markerIndex, 1))
   console.log(lmarkers);
  lmarkers=   lmarkers.sort((a, b) => a.index - b.index);
   for(var i=0; i<lmarkers.length; i++){
     if(i==0){
       lmarkers[i].index = i;
       lmarkers[i].marker.setLabel("START");

     }
     else{
     lmarkers[i].index =  i;
     lmarkers[i].marker.setLabel((i+1).toString());
     }
   }


   $scope.$apply(function () {
    //$scope.markers= lmarkers.sort((a, b) => a.index - b.index);
    $scope.markers = lmarkers;
    $scope.markers = $scope.markers.reverse();
      });

}

$scope.delMarker2 = function(markerl){
  for(var b =0; b<lmarkers.length; b++){
    if(lmarkers[b].marker.getLabel()==markerl){
    
      lmarkers[b].marker.setMap(null);
      lmarkers[b].circle.setMap(null);
      lmarkers.splice(b,1);
      break;
    }
  }
  mapObj.removePolylines();
  var pathP =[] ;
  for(var m of lmarkers){
    pathP.push([m.lat,m.lng])
  }
  console.log(pathP)
     poly =  mapObj.drawPolyline({
      path : pathP,
      strokeColor: "green",
      strokeOpacity: 1.0,
      strokeWeight: 3
    });
    //var t = lmarkers;
    
  //con.log(markerIndex);
  // lmarkers[lmarkers.length-1-markerIndex].marker.setMap(null);
  //  console.log(lmarkers.splice(lmarkers.length-markerIndex, 1))
  //  console.log(lmarkers);
  // lmarkers=   lmarkers.sort((a, b) => a.index - b.index);
  //  for(var i=0; i<lmarkers.length; i++){
  //    if(i==0){
  //      lmarkers[i].index = i;
  //      lmarkers[i].marker.setLabel("START");

  //    }
  //    else{
  //    lmarkers[i].index =  i;
  //    lmarkers[i].marker.setLabel((i+1).toString());
  //    }
  //  }

   $scope.$apply(function () {
    //$scope.markers= lmarkers.sort((a, b) => a.index - b.index);
    $scope.markers = lmarkers;
    $scope.markers = $scope.markers;
      });

}
$scope.exportMission = function(){
  
 // ipcRenderer.sendSync('exportwp', JSON.stringify(exported));
}


  function exportMission(){
  var exported = [];

  for(var m of lmarkers){
   var action = $scope.ModelAction[m.action];
   var alt = $scope.ModelVelocity[m.vel];
   var vel = $scope.ModelAltitude[m.alt];
//   if(m.marker.getLabel()="START"){
    exported.push({index: m.index , label: m.marker.getLabel() ,  lat: m.lat, lng:m.lng, action:action, alt: alt, vel: vel,  d2n: m.d2n})
  //}
  }
 // console.log(exported);
 exported.push({x: "x"});
 return exported;
}

function exportMissionlite(){
  var exported = [];

  for(var m of lmarkers){
   var action = $scope.ModelAction[m.action];
   var vel = $scope.ModelVelocity[m.vel];
   var alt = $scope.ModelAltitude[m.alt];
//   if(m.marker.getLabel()="START"){
    
    exported.push({i: m.index ,  l: m.marker.getLabel() , lt: m.lat, lg:m.lng, a:action.substring(0, 3), h: alt, v: vel})
  //}
  }
  exported=exported.reverse();
  //exported.push({x: "x"});
 // console.log(exported);
 return exported;
}

$scope.saveMission = function(){
  var  load = JSON.stringify({type: "CMD", msg: "ON"});
  var transmit =  ipcRenderer.sendSync('transmit', load);
  con.log(transmit);
}

$scope.downloadMission = function(){
  clearMission();
  var missionState = ipcRenderer.sendSync('getmissionState', 'ms');
  if(missionState==""){
  
  }
  else{
   
    
    var missionF = JSON.parse(missionState);
    var missionAr = JSON.parse(missionF.mission);
    var mission =[];
    for(var b=0; b<missionAr.length; b++){
    mission.push(JSON.parse(missionAr[b]));
    }
    var waypoint = {};
    var pathPF =[] ;
    console.log(mission);
  
    for(var m of mission){
   var newMarker = new google.maps.LatLng(m.lt, m.lg);
   placeMarker(newMarker);

  }
  var trk = 0;
  //console.log(lmarkers);
  var mission2 = mission.reverse();
  for(var n of mission2){
    //console.log(lmarkers[trk].action)
    //console.log(n.a);
    for(var m of $scope.missionModes){
      if(m.indexOf(n.a)>=0){
      $scope.ModelAction[$scope.markers[trk].action] = m; 
      }
    }
  
    $scope.ModelVelocity[$scope.markers[trk].vel] = n.v;
    $scope.ModelAltitude[$scope.markers[trk].alt] = n.h; 
  
   trk=trk+1;
  }
  
    
}
}

$scope.randomMission = function(){
clearMission();
for(var i =0; i<50; i++){
var lat = 24.5 +  Math.random() ;
var lng = 55.0 +  Math.random() ;
var newMarker = new google.maps.LatLng(lat, lng);
placeMarker(newMarker);
}
}


$scope.uploadMission = function(){
  // if(!lmarkers.length==0){
  //   console.log("HMMM");
  // var  load = JSON.stringify({type: "UWP", msg: exportMissionlite()});
  // console.log(load);
  // console.log(load.length);
  // var transmit =  ipcRenderer.sendSync('transmit', load);


  // con.log(transmit);
  // }
  // else{
  //   swal("","No Mission to Export!", 'error');
  // }

rwp=0;
  if(!lmarkers.length==0){
    console.log("HMMM");
    var tm = exportMissionlite();
  var it =0;
  var sd = new Date();
  var ls = "";
  for(tt of tm){
    var lst = JSON.stringify({type: "UWP", msg: tt});
    ls+=lst;
  }
  console.log(ls);
  console.log(ls.length);
  //console.log(tm);
  //console.log(tm.length)
     
    
           if($scope.linkdn){
          var  load = JSON.stringify({class: "mission",type: "UWP", msg: JSON.stringify(tm)});

          var transmit =  ipcRenderer.sendSync('transmit', load);
          con.log(transmit);
     
           }
       //   sd= new Date();
       
     
       
         
    
    
  
  }
  else{
    swal("","No Mission to Export!", 'error');
  }
}
$scope.loadMission = function(){
  var  load = JSON.stringify({type: "DWP", msg: ""});
  var transmit =  ipcRenderer.sendSync('transmit', load);
  con.log(transmit);
}

function clearMission(){
  $scope.markers=[];
  for(var b =0; b<lmarkers.length; b++){
     lmarkers[b].marker.setMap(null);
     lmarkers[b].circle.setMap(null);
   }
 
 mapObj.removePolylines();
  lmarkers=[];
}
$scope.clearMission = function(){
 clearMission();
 swal("Mission cleared!")
}

}]);


function EditController($scope) {
  
   $scope.ModelAction[$scope.point.action] = "NAVPOINT";
   $scope.ModelAltitude[$scope.point.alt] = "100";
   $scope.ModelVelocity[$scope.point.vel] = "R80";
 
}

