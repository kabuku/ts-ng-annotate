angular.module('app')
    .service('S1', ($provide) => {
        $provide.decorator('D1', ($a) => {});
    });
