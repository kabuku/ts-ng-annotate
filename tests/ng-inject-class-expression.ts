const obj = {
    x: class C {
        constructor(private S, private $provide) {
            'ngInject';
            $provide.decorator('D', ($a) => {});
        },
    },
};
