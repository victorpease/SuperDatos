angular.module('starter', ['ionic','controller','service','ngCordova'])
.run(function($ionicPlatform,$cordovaDevice,$state,db) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    };
      var id='1231232132';
      if (ionic.Platform.platform()!="win32"){
          id = $cordovaDevice.getUUID();
      };
      db.setUser(id);
      console.log('usuario fijado: '+id);
      db.replicate();
      console.log('replicación iniciada');
      $state.go('app.news',{status:'loading'});
      console.log('ya fue al estado news');
  });
})
.run(function($rootScope,$state,$cordovaLocalNotification){
    $rootScope.$on('db:newNews',function(event,args){
        var id = new Date().getMilliseconds();
        console.log('Voy a registrar la notificacion');
        $cordovaLocalNotification.schedule({
            id: id,
            title: 'Super Datos',
            text: args.newsTitle,
            data: {
                newsId: args.newsId,
                newsTitle: args.newstitle
            }
        }).then(function (result) {
            console.log('Notificación registrada');
        });
        
        $rootScope.$on('$cordovaLocalNotification:click', function (
                       event, 
                        notification, 
                        state) {
            var datos = JSON.parse(notification.data);
            $state.go('app.detail',{id:datos.newsId});
        });
    });
})
.config(function($stateProvider, $urlRouterProvider) { 
    $stateProvider
        .state('splash',{
        url:"/splash:status",
        cache:false,
        views:{
            "home":{
                templateUrl:"templates/splash.html",
                controller:"splashController as splash"
            }
        },
        resolve:{
            status: function($stateParams){
                return $stateParams.status;
            }
        },
        onEnter: function(){
            console.log('Entrando al estado splash');
        }
    })
        .state('app',{
        cache:false,
        abstract: true,
        views:{
            "home":{
                templateUrl:"templates/menu.html",
                controller:"menuController as menu"
            }
        },
        resolve:{
            cats: function(db){
                return db.getCats();
            }
        },
        onEnter: function(){
            console.log('Entrando al estado app');
        }
    })
        .state('app.news', {
        cache:false,
        url: "/:catId",
        views: {
            "menuContent":{
                templateUrl: "templates/news.html",
                controller: "newsController as news"
            }
        },
        resolve:{
            noticias:function($stateParams,db){
                return db.getNews($stateParams.catId);
            },
            catId:function($stateParams){
                return $stateParams.catId;
            }
        },
        onEnter: function(){
            console.log('Entrando al estado app.news');
        }
    })
        .state('app.detail', {
        cache:false,
        url: "/detail/:id",
        views: {
            "menuContent":{
                templateUrl: "templates/detail.html",
                controller: "detailController as detail"
            }
        },
        resolve:{
            noticia: function($stateParams,db){
                return db.get($stateParams.id);
            }
        },
        onEnter: function(){
            console.log('Entrando al estado app.detail');
        }
    });
    $urlRouterProvider.otherwise('/splash');
})