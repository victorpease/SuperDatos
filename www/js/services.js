angular.module('service',[])
.factory('db',['$q','$rootScope',DbService]);
    function DbService($q,$rootScope){
        var key = 'xxxxxxxxxxxxxx';
        var pass = 'xxxxxxxxxxxxxxxxxxxx';
        var remote = 'https://'+key+':'+pass+'@xxxxxxxxxxxxx.cloudant.com/news';
        var db;
        var user;
        var initiated=false;        
        function newNews(change){
            if (!change.deleted){
                if (change.doc.tipo=="news")
                    $rootScope.$broadcast('db:newNews',
                                          {newsId:change.id,
                                           newsTitle:change.doc.titular});
            }
        };
        function put(doc){
            db.put(doc);
            console.log('documento grabado');
        };
        function changed(change){
            console.log('cambios en la base de datos');
             if (!initiated)
             {
                 initiated=true;
                 db.changes({live: true, since: 'now', include_docs: true})
                     .on('change', newNews);
             };
            $rootScope.$broadcast('db:changed',change);
        };
        return {
            setUser:function(userId){
                user = userId;
            },
            init: function(){
                if (!db) db = new PouchDB('news',{adapter:'idb'});
                db.info().then(function (result) {
                    alert(JSON.stringify(result));
                }).catch(function (err) {
                    console.log(err);
                });
                return true;
            },
            replicate: function(){
                if (!db) this.init();
                db.replicate.to(remote,{live:true,
                                        retry:true,
                                        filter:'news/leidos',
                                        query_params:{'user':user}})
                .on('change',function(info){
                    console.log('Evento Change:'+JSON.stringify(info));
                })
                .on('paused',function(err){
                    console.log('Evento Paused:'+JSON.stringify(err));
                })
                .on('complete',function(info){
                    console.log('Evento Complete:'+JSON.stringify(info));
                })
                .on('active',function(){
                    console.log('Evento Active:');
                })
                .on('error',function(err){
                    console.log('Evento error:'+JSON.stringify(err));
                })
                .on('denied',function(info){
                    console.log('Evento error:'+JSON.stringify(info));
                });
                db.replicate.from(remote,{live:true,
                                        retry:true,
                                        filter:'news/leidos',
                                        query_params:{'user':user}})
                    .on('paused',changed);
            },
            get: function(id){
                if (!db) this.init();
                return db.get(id);
            },
            getCats: function(){
                if (!db) this.init();
                return db.allDocs(
                    {startkey:'cat_',
                     endkey:'cat_\uffff',
                     include_docs:true});
            },
            getNews: function(catId){
                if (!db) this.init();
                console.log('Consultando noticias del id:'+catId);
                if (catId){
                    console.log('Consultando categoria : '+catId);
                    return db.query('news/topic',
                                    {key:[catId],
                                     include_docs:true,
                                     descending:true});
                }
                else return db.allDocs({startkey:'news_\uffff',
                                        endkey:'news_',
                                        descending: true,
                                        include_docs:true});
            },
            getNewsFind: function(catId){
                if (!db) this.init();
                if (catId){
                    console.log('Find records for : '+catId);
                    return db.find({selector:{topic:catId,tipo:'news'}});
                } else {
                    console.log('Find all records ');
                    return db.find({selector:{tipo:'news'}});
                };
            },
            putRead: function(pnewsId){
                var doc = {
                    _id :'read_'+user+'_'+pnewsId,
                    newsId: pnewsId,
                    fecha:new Date().toString(),
                    tipo:'read',
                    owner:user                    
                };
                put(doc);
            }
        }
    };