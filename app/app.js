let googleBooksApp = angular.module('googleBooksApp', ['ngRoute']);
let cashSearchParameter = '';
let pageNumber = 0;

googleBooksApp.config([
    '$routeProvider',
    function ($routeProvider) {
    $routeProvider
         .when('/list-books', {
             templateUrl: 'views/list-books.html',
             controller: 'ListBooksController'
         })
         .when('/login', {
             templateUrl: 'views/login.html',
             controller: 'LoginController'
         })
         .when('/favorites', {
             templateUrl: 'views/favorites.html',
             controller: 'FavoritesController'
         })
         .otherwise({
             redirectTo: '/login'
         });
}]);

googleBooksApp.controller('LoginController', ['$scope', '$location', function($scope, $location) {
    $scope.logInSite = function () {
        $location.path('list-books');
    };
}]);

googleBooksApp.controller('ListBooksController', ['$scope', '$http', function($scope, $http) {
    $scope.add3Dots = add3Dots;
    $scope.searchBooks = function () {
        $scope.needNextPage = false;
        $scope.needPreviousPage = false;
        const maxResults= 6;
        if (cashSearchParameter !== $scope.searchParameter) {
            pageNumber = 1;
            cashSearchParameter = $scope.searchParameter;
        }
        const index = (pageNumber - 1) * (maxResults - 1);
        let url =
            `https://www.googleapis.com/books/v1/volumes?q=${$scope.searchParameter}&maxResults=${maxResults}&startIndex=${index}&orderBy=newest`;
        $http.get(url).then(function(inputData) {
            if (pageNumber > 1) {
                $scope.needPreviousPage = true;
            }
            if (inputData.data.items.length >= maxResults) {
                $scope.needNextPage = true;
                inputData.data.items.pop();
            }
            let favorites = window.localStorage.getItem('favorites');
            $scope.dataBooks = inputData.data.items;
            if (favorites !== null) {
                favorites = angular.fromJson(favorites);
                recheckFavorites($scope, favorites);
            }
            $scope.pageNum = pageNumber;
        }).catch(function (error) {
            console.log(error);
        })
    };
    $scope.nextPage = function () {
        pageNumber++;
        $scope.searchBooks();
    };
    $scope.previousPage = function () {
        pageNumber--;
        $scope.searchBooks();
    }
    $scope.openShowMore = function(element) {
        $scope.hidePage = true;
        $scope.elementInPopup = element;
        $scope.elementInPopup.popupOn = true;
    }
    $scope.closeShowMorePopup = function () {
        $scope.hidePage = false;
        $scope.elementInPopup.popupOn = false;
        $scope.elementInPopup = null;
    }
    $scope.toFavorites = function (element) {
        if (window.localStorage.getItem('favorites') === null) {
            window.localStorage.setItem('favorites', angular.toJson([element]));
            return;
        }
        let favorites = angular.fromJson(window.localStorage.getItem('favorites'));
        if (favorites.find((item) => item.id === element.id)) {
            return;
        }
        favorites.push(element);
        window.localStorage.setItem('favorites', angular.toJson(favorites));
        recheckFavorites($scope, favorites);
    }
    $scope.removeFromFavorites = function (element) {
        if (window.localStorage.getItem('favorites') === null) {
            return;
        }
        let favorites = angular.fromJson(window.localStorage.getItem('favorites'));
        let filteredFavorites = favorites.filter((item) => item.id !== element.id);
        window.localStorage.setItem('favorites', angular.toJson(filteredFavorites));
        recheckFavorites($scope, filteredFavorites);
    }
}]);

googleBooksApp.controller('FavoritesController', ['$scope', function($scope) {
    $scope.add3Dots = add3Dots;
    if (window.localStorage.getItem('favorites') === null) {
        $scope.dataBooks = [];
    } else {
        let favorites = angular.fromJson(window.localStorage.getItem('favorites'));
        $scope.dataBooks = angular.fromJson(favorites);
        recheckFavorites($scope, favorites);
    }
    $scope.removeFromFavorites = function (element) {
        if (window.localStorage.getItem('favorites') === null) {
            return;
        }
        $scope.dataBooks = $scope.dataBooks.filter((item) => item.id !== element.id);
        window.localStorage.setItem('favorites', angular.toJson($scope.dataBooks));
    }
}]);

function recheckFavorites($scope, favorites) {
    $scope.dataBooks.map((item) => {
        if (favorites.find((itemFavorites) => itemFavorites.id === item.id)) {
            item.inFavorites = true;
        } else {
            item.inFavorites = false;
        }
    });
}

let add3Dots = function (string, limit){
    const dots = "...";
    if(string !== undefined && string.hasOwnProperty('length') && string.length > limit) {
        string = string.substring(0,limit) + dots;
    }

    return string;
};



