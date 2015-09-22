angular.module('controller',['service'])
	.controller('menuController',
                ['$scope',
                 '$state',
                 'cats',MenuController])
	.controller('newsController',
                ['$scope',
                 '$state',
                 'db',
                 'catId',
                 'noticias',NewsController])
	.controller('detailController',
                ['db',
                 '$scope',
                 '$state',
                 'noticia',DetailController])
    .controller('splashController',
                ['$state',
                 'status',SplashController])
    function SplashController($state,status){
        if (status!='loading'){
            $state.go('app.news');
        }
    };
    function MenuController($scope,$state,cats){
        $scope.cats = cats.rows;
    };
    function NewsController($scope,$state,db,catId,noticias){        
        console.log('las noticias: '+JSON.stringify(noticias));
        if (noticias.docs)
            $scope.notas=noticias.docs;
        else 
            $scope.notas=noticias.rows;
        console.log('las lineas: '+JSON.stringify($scope.notas));
        $scope.$on('db:changed',
            function(event,changed){
            $state.go('.', null, { reload: true });
            console.log('Recargando noticias');
            });
    };
    function DetailController(db,$scope,$state,noticia){
        $scope.event= noticia;
        db.putRead(noticia._id);
        $scope.$on('db:changed',
            function(event,changed){
            $state.go('.', null, { reload: true });
            console.log('Recargando Noticia');
            });
    };