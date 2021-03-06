(function (angular){

  "use strict";

  angular.module("risevision.core.company",
    [
      "risevision.common.gapi",
      "risevision.core.cache",
      "risevision.core.util"
    ])

    .constant("COMPANY_WRITABLE_FIELDS", [
      "name", "street", "unit", "city", "province", "country",
      "postalCode", "timeZoneOffset", "telephone", "fax", "companyStatus",
      "notificationEmails", "mailSyncEnabled", "sellerId", "isTest"
    ])

    .factory("createCompany", ["$q", "coreAPILoader", "COMPANY_WRITABLE_FIELDS",
      "pick",
      function ($q, coreAPILoader, COMPANY_WRITABLE_FIELDS, pick) {
      return function (parentCompanyId, company) {
        var deferred = $q.defer();
        coreAPILoader().then(function (coreApi) {
          var fields = pick.apply(this, [company].concat(COMPANY_WRITABLE_FIELDS));
          var request = coreApi.company.add({
            parentId: parentCompanyId,
            data: fields
          });
          request.execute(function (resp) {
            if(resp.result) {
              deferred.resolve(resp.item);
            }
            else {
              deferred.reject(resp);
            }
          }, deferred.reject);
        });
        return deferred.promise;
      };
    }])

    .factory("getCompany", ["coreAPILoader", "$q", "$log",
    function (coreAPILoader, $q, $log) {
      return function (id) { //get a company either by id or authKey
        $log.debug("getCompany called", id);

        var deferred = $q.defer();
          coreAPILoader().then(function (coreApi) {
            var criteria = {};
            if(id) {criteria.id = id; }
            var request = coreApi.company.get(criteria);
            request.execute(function (resp) {
                $log.debug("getCompany resp", resp);
                if(resp.result) {
                  deferred.resolve(resp.item);
                }
                else {
                  deferred.reject(resp);
                }
            });
          });
        return deferred.promise;
      };
    }])

    .factory("lookupCompany", ["coreAPILoader", "$q", "$log",
    function (coreAPILoader, $q, $log) {
      return function (authKey) { //get a company either by id or authKey
        $log.debug("lookupCompany called", authKey);

        var deferred = $q.defer();
          coreAPILoader().then(function (coreApi) {
            var request = coreApi.company.lookup({authKey: authKey});
            request.execute(function (resp) {
                $log.debug("lookupCompany resp", resp);
                if(resp.result) {
                  deferred.resolve(resp.item);
                }
                else {
                  deferred.reject(resp);
                }
            });
          });
        return deferred.promise;
      };
    }])

    .factory("moveCompany", ["coreAPILoader", "$q", "$log",
    function (coreAPILoader, $q, $log) {
      return function (authKey, newParentId) { //get a company either by id or authKey
        var deferred = $q.defer();
          coreAPILoader().then(function (coreApi) {
            var request = coreApi.company.move({authKey: authKey, newParentId: newParentId});
            request.execute(function (resp) {
                $log.debug("moveCompany resp", resp);
                if(resp.result) {
                  deferred.resolve(resp.item);
                }
                else {
                  deferred.reject(resp);
                }
            });
          });
        return deferred.promise;
      };
    }])

    .factory("updateCompany", ["$q", "$log", "coreAPILoader", "pick",
    "COMPANY_WRITABLE_FIELDS",
     function ($q, $log, coreAPILoader, pick, COMPANY_WRITABLE_FIELDS){
      return function (companyId, fields) {
          var deferred = $q.defer();
          fields = pick.apply(this, [fields].concat(COMPANY_WRITABLE_FIELDS));
          $log.debug("updateCompany called", companyId, fields);
          // fields.validate = validationRequired || false;
          coreAPILoader().then(function (coreApi) {
            var request = coreApi.company.patch({id: companyId, data: fields});
            request.execute(function (resp) {
              $log.debug("updateCompany resp", resp);
              if(resp.result) {
                deferred.resolve(resp);
              }
              else {
                deferred.reject(resp);
              }
            });
          });

          return deferred.promise;
      };
    }])

    .factory("regenerateCompanyField", ["$q", "$log", "coreAPILoader",
     function ($q, $log, coreAPILoader){
      return function (companyId, fieldName) {
          var deferred = $q.defer();
          $log.debug("regenerateField called", companyId, fieldName);
          coreAPILoader().then(function (coreApi) {
            var request = coreApi.company.regenerateField({"id": companyId, "fieldName": fieldName});
            request.execute(
              function (resp) {
                $log.debug("regenerateField resp", resp);
                if (!resp.error) {
                  deferred.resolve(resp);
                } else {
                  deferred.reject(resp.message);
                }
              },
              function (resp) {
                deferred.reject("call failed " + resp);
              }
              );
          });

          return deferred.promise;
      };
    }])

    .factory("deleteCompany", ["coreAPILoader", "$q", "$log",
    function (coreAPILoader, $q, $log) {
      return function (id) { //get a company either by id or authKey
        $log.debug("deleteCompany called", id);

        var deferred = $q.defer();
          coreAPILoader().then(function (coreApi) {
            var criteria = {};
            if(id) {criteria.id = id; }
            var request = coreApi.company.delete(criteria);
            request.execute(function (resp) {
                $log.debug("deleteCompany resp", resp);
                if(resp.result) {
                  deferred.resolve(resp.item);
                }
                else {
                  deferred.reject(resp);
                }
            });
          });
        return deferred.promise;
      };
    }])

    .service("companyService", ["coreAPILoader", "$q", "$log", "getCompany",
      function (coreAPILoader, $q, $log, getCompany) {

      this.getCompanies = function (companyId, search, cursor, count, sort) {
        var deferred = $q.defer();
        var obj = {
          "companyId": companyId,
          "search": search,
          "cursor": cursor,
          "count": count,
          "sort": sort
        };
        $log.debug("getCompanies called with", obj);
        coreAPILoader().then(function (coreApi) {
          var request = coreApi.company.list(obj);
          request.execute(function (resp) {
              $log.debug("getCompanies resp", resp);
              deferred.resolve(resp);
          });
        });
        return deferred.promise;
      };

      this.loadSelectedCompany = function (selectedCompanyId, userCompany) {
          //this funtion assumes user and user.company are loaded
          var deferred = $q.defer();
          if (selectedCompanyId && selectedCompanyId !== userCompany.id) {
              getCompany(selectedCompanyId).then(function(res) {
                  if (res.code === 0 && res.item) {
                      deferred.resolve(res.item);
                  } else {
                      deferred.resolve(userCompany);
                  }
              });
          } else {
              deferred.resolve(userCompany);
          }
          return deferred.promise;
      };

      this.validateAddressSimple = function(company, contact) {
        var errors = [];
        if (contact) {
            if (!contact.firstName) {
                errors.push("Missing First Name");
            }
            if (!contact.lastName) {
                errors.push("Missing Last Name");
            }
            if (!contact.email) {
                errors.push("Missing Email");
            } else {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!re.test(contact.email)) {
                    errors.push("Invalid Email");
                }
            }
        }
        if (!company.street) {
            errors.push("Missing Address (Line 1)");
        }
        if (!company.city) {
            errors.push("Missing City");
        }
        if (!company.country) {
            errors.push("Missing Country");
        }
        if (!company.province) {
            errors.push("Missing State / Province");
        }
        if (!company.postalCode) {
            errors.push("Missing Zip / Postal Code");
        }
        return errors;
      };

    }])

  .filter("fullAddress", function () {
    return function (company) {
      var res = (company.street ? company.street + ", " : "") +
        (company.city ? company.city + ", " : "") +
        (company.province ? company.province + ", " : "") +
        (company.country ? company.country + ", " : "") +
        (company.postalCode ? company.postalCode + ", " : "");
      if (res) {
        res = res.substr(0, res.length - 2);
      }
      return res;
    };
  });

})(angular);
