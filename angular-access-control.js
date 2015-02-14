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
        this.get = function () {
            return policies;
        };
    }

    function AccessControlPoliciesProvider() {
        var policies = [];

        this.add = function (policy) {
            policies.push(policy);
            return this;
        };

        this.$get = function accessControlPoliciesFactory() {
            return new AccessControlPolicies(policies);
        };
    }

    return angular.module('mp.accessControl', [])
        .provider('$accessControlPolicies', AccessControlPoliciesProvider)
        .directive('acIf', [ '$accessControlPolicies', '$injector', function ($accessControlPolicies, $injector) {
            var policies = null;

            return {
                priority: 500,
                restrict: 'A',
                link: function (scope, element, attrs) {
                    if (!policies) {
                        policies = $accessControlPolicies.get().map(function (policyFactory) {
                            return $injector.invoke(policyFactory);
                        });
                    }

                    if (!policies.every(function (policy) {
                        return policy.apply(scope, element, attrs);
                    })) {
                        element.remove();
                    }
                }
            };
        }]);
}));
