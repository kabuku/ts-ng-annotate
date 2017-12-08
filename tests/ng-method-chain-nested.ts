angular.module('app')
    .service('S1', ($provide) => {
        $provide.decorator('D1', ($a) => {});
    })
    .service('S2', ($provide) => {
        $provide.decorator('D2', ($b) => {});
    });
