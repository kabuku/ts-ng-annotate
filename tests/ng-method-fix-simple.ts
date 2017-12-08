angular.module('app')
    .service('S1', ['$b', ($a) => {}]);

angular.module('app')
    .service('S2', ['$b', '$c', ($a) => {}]);

angular.module('app')
    .service('S3', ['$b', ($a, $b) => {}]);

angular.module('app')
    .service('S4', ['$b', () => {}]);
