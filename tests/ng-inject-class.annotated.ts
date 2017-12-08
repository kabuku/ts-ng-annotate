class C {
    static $inject = ['S', '$provide'];
    constructor(private S, private $provide) {
        'ngInject';
        $provide.decorator('D', ['$a', ($a) => {}]);
    }
}
