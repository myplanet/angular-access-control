(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'module', 'angular' ], function (module, angular) {
            module.exports = factory(angular);
        });
    } else if (typeof module === 'object') {
        module.exports = factory(require('angular'));
    } else {
        if (!root.mp) {
            root.mp = {};
        }

        root.mp.accessControl = factory(root.angular);
    }
}(this, function (angular) {
    'use strict';

    return angular.module('mp.accessControl', [])
        .provider('$accessControlPolicies', function () {
            var policyFactories = [],
                policies;

            this.policy = function (policyFactory) {
                policyFactories.push(policyFactory);
                return this;
            };

            this.$get = [ '$injector', function accessControlPoliciesFactory($injector) {
                return {
                    allow: function (scope, element, attrs) {
                        if (!policies) {
                            policies = policyFactories.map(function (policyFactory) {
                                return $injector.invoke(policyFactory);
                            });
                        }

                        return policies.every(function (policy) {
                            return policy.allows(scope, element, attrs);
                        });
                    }
                };
            }];
        })
        .directive('acIf', [ '$accessControlPolicies', '$compile', function ($accessControlPolicies, $compile) {
            return {
                priority: 700,
                restrict: 'A',
                terminal: true,
                scope: true,

                compile: function (element) {
                    var ifExpr = element.attr('ng-if');

                    element.removeAttr('ac-if');
                    element.attr('ng-if', '$$isAccessible' + (ifExpr ? ' && (' + ifExpr + ')' : ''));

                    return {
                        pre: function (scope, element, attrs) {
                            scope.$$isAccessible = $accessControlPolicies.allow(scope, element, attrs);
                            $compile(element)(scope);
                        }
                    };
                }
            };
        }])
        .directive('acUnwrap', [ '$accessControlPolicies', function ($accessControlPolicies) {
            return {
                priority: 500,
                restrict: 'A',
                link: function (scope, element, attrs) {
                    if (!$accessControlPolicies.allow(scope, element, attrs)) {
                        element.replaceWith(element.contents());
                    }
                }
            };
        }]);
}));
