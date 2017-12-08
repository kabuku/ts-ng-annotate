# ts-ng-annotate

ts-ng-annotate adds and fixes dependency annotations of AngularJS on TypeScript files.

## Getting Started

The following steps add and fix annotations in place:

```
git clone https://github.com/kabuku/ts-ng-annotate.git
cd ts-ng-annotate
npm install
./node_modules/.bin/ts-node ts-ng-annotate-main.ts /path/to/ts-file...
```

## Supported code

ts-ng-annotate supports the following code:

- Inline function like argument of `angular.Module` method call which follows AngularJS Style Guide ([Definitions (aka Setters)](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#definitions-aka-setters))
- Function like expression which has `'ngInject'` prologue
- Constructor which has `'ngInject'` prologue

where function like means function expression or arrow function.

## Examples

### Inline arrow function

```ts
// Before
angular.module('myapp').factory('MyService', ($http) => {});

// After
angular.module('myapp').factory('MyService', ['$http', ($http) => {}]);
```

### Constructor

```ts
// Before
class MyService {
    constructor($http) {
        'ngInject';
    }
}

// After
class MyService {
    static $inject = ['$http'];
    constructor($http) {
        'ngInject';
    }
}
```

## License

MIT
