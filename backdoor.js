//Function to provide a easy way to access a common Ember values and functions
(function(exports) {

  var existsTemplate = function (templateName) {
    return exports.Backdoor().templates.contains(templateName);
  };

  /**
   * Return the current Ember app defined in the global scope, or the default app
   * @param  {Object} defaultApp Ember app passed as param
   * @return {Ember.Application}
   */
  var getApp = function(defaultApp) {
    var app = defaultApp || exports.App;

    if (!app) {
      for (var i in window) {
        if (window.hasOwnProperty(i) && window[i] instanceof Ember.Application) {
          app = window[i];
        }
      }
    }

    return app;
  };

  exports.Backdoor = function(app) {
    var App = getApp(app);

    var controller = function(name) {
      return lookup('controller:' + name);
    };
    var view = function(name) {
      return lookup('view:' + name);
    };
    var route = function(name) {
      return lookup('route:' + name);
    };
    var recognizes = function(path) {
      return App.Router.router.recognizer.recognize(path);
    };
    var container = App.__container__;
    var lookup = container.lookup.bind(container);
    var store = lookup("store:main");
    var allRoutes = App.Router.router ? Em.keys(App.Router.router.recognizer.names) : [];
    var appController = controller("application");
    var currentPath = appController.get("currentPath");
    var currentRouteName = appController.get("currentRouteName");
    var allTemplates = Em.keys(Em.TEMPLATES);
    var router = lookup("router:main").router;
    //Show transition routes in the console
    //
    var logAll = function () {
      App.reopen({
        LOG_TRANSITIONS: true,
        LOG_TRANSITIONS_INTERNAL: true,
        LOG_VIEW_LOOKUPS: true,
      });

      Ember.LOG_BINDINGS = true;

      Ember.subscribe('render', {
        before: function(name, start, payload){
          return start;
        },
        after: function(name, end, payload, start){
          var duration = Math.round(end - start);
          console.log('rendered ' + payload.object + ' ' + duration + ' ms');
        }
      });
    };

    var stopPolling = function() {
      App.get('meta').set('refresh', false);
      window.stop_all_timers();
    };

    var propertiesOf = function(type) {
      var properties = {}, prop, propType;
      var Class = App[type];
      var objectProperties = Class.prototype;

      for (var property in objectProperties) {
        prop = objectProperties[property];

        try {
          propType = Class.metaForProperty(property).type;
          if (propType) {
            properties[property] = propType;
          }
        } catch(e) {}
      }

      return properties;
    };

    var removeMetamorphs = function() {
      $('[type="text/x-placeholder"]').remove();
    };

    return {
      lookup: lookup,
      controller: controller,
      route: route,
      view: view,
      store: store,
      currentPath: currentPath,
      currentRouteName: currentRouteName,
      recognizes: recognizes,
      allRoutes: allRoutes,
      templates: allTemplates,
      transitionTo: router.transitionTo.bind(router),
      existsTemplate: existsTemplate,
      logAll: logAll,
      stopPolling: stopPolling,
      propertiesOf: propertiesOf,
      removeMetamorphs: removeMetamorphs
    };
  };

}(window));