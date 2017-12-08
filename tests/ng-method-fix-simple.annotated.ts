angular.module('app')
    .service('S1', ['$a', ($a) => {}]);

angular.module('app')
    .service('S2', ['$a', ($a) => {}]);

angular.module('app')
    .service('S3', ['$a', '$b', ($a, $b) => {}]);

angular.module('app')
    .service('S4', () => {});
