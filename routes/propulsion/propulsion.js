var app = angular.module('mdx', []);
const {ipcRenderer} = require('electron')
var size =200;

var thrust1     = $.gauge('#thrust1', { size: size,ul:2500,q1:0.1,q2:0.6,q3:0.8, footer:"RPM x 10", title:"Engine 1",inv: true});  
var thrust2     = $.gauge('#thrust2', { size: size,ul:2500,q1:0.1,q2:0.6,q3:0.8, footer:"RPM X 10", title:"Engine 2",inv: true});  
var esc1     = $.gauge('#esc1', { size: size,ul:250,q1:0.1,q2:0.3,q3:0.7, footer:"Pulse Width", title:"ESC 1",inv: true});  
var esc2     = $.gauge('#esc2', { size: size,ul:250,q1:0.1,q2:0.3,q3:0.7, footer:"Pulse Width", title:"ESC 2",inv: true});  
var battery     = $.gauge('#battery', { size: size,ul:240,q1:0.1,q2:0.3,q3:0.7, footer:"Volts", title:"Battery",});  
var current    = $.gauge('#current', { size: size,ul:100,q1:0.1,q2:0.3,q3:0.7, footer:"Amps", title:"Current",inv: true});  

$(".dial").knob({
    'min':0,
    'max':100,
    'width': 150,
    'height': 150,
    
});
//var chart;
var try_to_connect = false;
app.controller('MainController', ['$scope' ,'$sce','$http', '$interval','$timeout', '$window', function ($scope, $sce,$http, $interval,$timeout, $window) {
var userid;
var userobj;

$scope.engine1 = "0";
$scope.engine2 = "0";
$scope.estat = "Not Armed"
$scope.esc1 = "0";
$scope.esc2 = "0"
$scope.esc1temp = "0";
$scope.esc2temp= "0"
$scope.battemp= "0";
$scope.envtemp = "0";
//STATE CHECK BEGIN

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
      
       
        thrust1.setValue(data.engine1/10);
        thrust2.setValue(data.engine2)/10;
        esc1.setValue(data.esc1);
        esc2.setValue(data.esc2);
        battery.setValue(data.battery_volts);
        current.setValue(parseInt(data.battery_amps)/5.2);
    
        $scope.engine1 = data.engine1;
        $scope.engine2 = data.engine2;
        $scope.estat = data.estat;
        $scope.esc1 = data.esc1;
        $scope.esc2 = data.esc2;
        $scope.esc1temp = data.esc1temp;
        $scope.esc2temp= data.esc2temp;
        $scope.battemp= data.battemp;
        $scope.envtemp = data.envtemp;
        
})

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

  
}]);
