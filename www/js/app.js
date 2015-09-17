angular.module('starter', ['ionic','controller','service','ngCordova'])
.run(function($ionicPlatform,$cordovaDevice,$cordovaSplashscreen,$state,db) {
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
      $state.go('app.news',{status:'loading'});
  });
})
.run(function($rootScope,$state,$cordovaLocalNotification){
    $rootScope.$on('db:newNews',function(event,args){
        var id = new Date().getMilliseconds();
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
            }
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
        }
    });
    $urlRouterProvider.otherwise('/splash');
})