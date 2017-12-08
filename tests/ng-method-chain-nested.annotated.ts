angular.module('app')
    .service('S1', ['$provide', ($provide) => {
        $provide.decorator('D1', ['$a', ($a) => {}]);
    }])
    .service('S2', ['$provide', ($provide) => {
        $provide.decorator('D2', ['$b', ($b) => {}]);
    }]);
