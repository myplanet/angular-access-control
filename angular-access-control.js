(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'module', 'angular' ], function (module, angular) {
            module.exports = factory(angular);
        });
    } else {
        if (!root.mp) {
            root.mp = {};
        }

        root.mp.accessControl = factory(root.angular);
    }
}(this, function (angular) {
    'use strict';

    function AccessControlPolicies(policies) {
        this.apply = function (scope, element, attrs) {
            return policies.every(function (policy) {
                return policy.apply(scope, element, attrs);
            });
        };
    }

    return angular.module('mp.accessControl', [])
        .provider('$accessControlPolicies', function AccessControlPoliciesProvider() {
            var policies = [];

            this.add = function (policy) {
                policies.push(policy);
                return this;
            };

            this.$get = function accessControlPoliciesFactory() {
                return new AccessControlPolicies(policies);
            };
        })
        .directive('acIf', [ '$accessControlPolicies', function ($accessControlPolicies) {
            return {
                priority: 500,
                restrict: 'A',
                link: function (scope, element, attrs) {
                    if (!$accessControlPolicies.apply(scope, element, attrs)) {
                        element.remove();
                    }
                }
            };
        }]);
}));
