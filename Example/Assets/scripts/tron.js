

var Tron = new function () {

    //Private Members
    var appRoot;
    var that = this;
    var placeholder;
    var viewModelClass;
    var routes;
    var scriptXHR;
    var templateXHR;
    var htmldata;
    var hash;
    var homepage;
    var enableCache;
    var isRenderAllowed = false;
    var templateIDs = new Array();
    var templateDOM = null;
    var loaderId = null;
    var RouteXHR= null;
    this.URL;
    var toType = function (obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

    var actionChange = function () {
        hash = document.URL.split('#')[1];
        $(placeholder + '[data-item="placeholder"]').addClass('fadeOutRight animated');
        if (hash.charAt(hash.length - 1) == "/") {
            hash = hash.substring(0, hash.length - 1);
        }
        hash = hash.replace('!', '');
        if (hash.length == 0 || hash==null)
        {
            hash = homepage; 
        }
        var counter = "";
        if (!enableCache)
        {
            var date= new Date();
            counter = "?v=" + date.getMilliseconds();
        }
        //validate route from routing table
        var path = processRoute();
        templateXHR = $.get("app/Views/" + hash + ".html"+counter, function (data) {
            that.htmldata = data;
            loadviewmodel(hash);
        });
        templateXHR.done(function () {
            templateDOM = document.createElement("div");
            templateDOM.innerHTML = that.htmldata;
            processTemplate(templateDOM);
        }).error(function () {
            $(placeholder + '[data-item="placeholder"]').html("<h1>Not Found</h1>");
            $(placeholder + '[data-item="placeholder"]').removeClass('fadeOutRight');
            $(placeholder + '[data-item="placeholder"]').removeClass('animated');
            $(placeholder + '[data-item="placeholder"]').addClass(' animated fadeInLeft ');
        });
    }

    var loadviewmodel = function (hash) {
        scriptXHR = $.getScript("app/ViewModels/" + hash + ".js", function (data) {
            viewModelClass = data;
        });
    };

    var processTemplate = function (html)
    {
        //getting all templatable elements from dom
        var templatable = $(html).find("[data-model]");
        //removing old script templates
        for (var i = 0; i < templateIDs.length; i++)
        {
            $('#'+templateIDs[i]).remove();
        }
        //reset template id array
        templateIDs = new Array();
        for(var i=0; i<templatable.length; i++)
        {
            //add all templates to page
            //creating script tag
            var scriptTag = document.createElement("script");
            //creating attributes
            var type = document.createAttribute("type");
            var datamodel = document.createAttribute("data-model");
            var datarepeater = document.createAttribute("data-repeater");
            var id = document.createAttribute("id");
            //assigning a random id
            id.value = "tron_"+(Math.random() * 10000).toFixed(0);
            scriptTag.attributes.setNamedItem(id);
            type.value = "text/template";
            scriptTag.attributes.setNamedItem(type);
            //checking if template has repeater
            if (templatable[i].getAttribute("data-repeater") != undefined || templatable[i].getAttribute("data-repeater") != null)
            {
                datarepeater.value = templatable[i].getAttribute("data-repeater");
                //adding repeater to script tag
                scriptTag.attributes.setNamedItem(datarepeater);
            }
            datamodel.value = templatable[i].getAttribute("data-model");
            scriptTag.attributes.setNamedItem(datamodel);
            scriptTag.innerHTML = templatable[i].innerHTML;
            $('body').append(scriptTag);
            templateIDs.push(id.value);
            $($(templateDOM).find("[data-model]")[i]).attr("data-templateID", id.value);
        }
    }
    var rebuildTemplateDOM = function ()
    {
        for (var i = 0; i < templateIDs.length; i++) {
            //load template from script tags
            var t = $('#' + templateIDs[i]).html();
            $($(templateDOM).find('[data-templateID="' + templateIDs[i] + '"]')).html(t);
            $($(templateDOM).find('[data-templateID="' + templateIDs[i] + '"]')).attr("data-model", $('#' + templateIDs[i]).attr('data-model'));
            if ($('#' + templateIDs[i]).attr('data-repeater') != undefined || $('#' + templateIDs[i]).attr('data-repeater') != null)
            {
                $($(templateDOM).find('[data-templateID="' + templateIDs[i] + '"]')).attr("data-repeater", $('#' + templateIDs[i]).attr('data-repeater'));
            }
        }
    }

    var template = function (hash, html, model) {
          return scriptXHR.done(function () {
              itterativeTemplate(html, false);
                //normal templating
              var datamodels = $(html).find('[data-model]');

                for (var i = 0; i < datamodels.length; i++) {

                    if ($(datamodels[i]).attr("data-repeater") == null) {

                        var model = eval($(datamodels[i]).attr('data-model'));
                        var keyNames = Object.keys(model);

                        for (var j = 0; j < keyNames.length; j++) {
                            var regex = new RegExp("{{" + keyNames[j] + "}}", "g");
                            var key = keyNames[j];
                            html.innerHTML = html.innerHTML.replace(regex, model[key]);
                        }
                    }
                }
                that.htmldata = html.innerHTML;
                //  
                $(placeholder + '[data-item="placeholder"]').html(that.htmldata);
                $(placeholder + '[data-item="placeholder"]').removeClass('fadeOutRight');
                $(placeholder + '[data-item="placeholder"]').removeClass('animated');
                $(placeholder + '[data-item="placeholder"]').addClass(' animated fadeInLeft ');
               
               // }
            });
    }

    var itterativeTemplate = function (html, secondtime) {
        var repeatelements = $(html).find('[data-repeater]');
        for (var i = 0; i < repeatelements.length; i++) {
            var enumrator = $(repeatelements[i]).attr("data-repeater");
            var model = $(repeatelements[i]).attr("data-model");
            var item = eval(model + "." + enumrator);
            if (item != undefined && item != null) {
                $(repeatelements[i]).html(compileTemplate(item, repeatelements[i]));
                $(repeatelements[i]).removeAttr("data-repeater");;
                $(repeatelements[i]).removeAttr("data-model");
            }
            else {
                if (secondtime) {
                    item = eval(model);
                    $(repeatelements[i]).html(compileTemplate(item[i][enumrator], repeatelements[i]));
                    $(repeatelements[i]).removeAttr("data-repeater");;
                    $(repeatelements[i]).removeAttr("data-model");;
                }
            }
        }
        if(repeatelements.length!=0)
        {
           itterativeTemplate(html,true);
        }
    }
    var compileTemplate = function (item, repeatelements) {
        var finalhtml = "";
        for (var j = 0; j < item.length; j++) {
            var repeatertemplate = $(repeatelements).html();
            if (toType(item[j]) != "object") {
                repeatertemplate = repeatertemplate.replace( new RegExp("{{data}}", "g"), item[j]);
            }
            else {
                var keyNames = Object.keys(item[j]);
                for (var k = 0; k < keyNames.length; k++) {
                    if (isNaN(keyNames[k])) {
                        repeatertemplate = repeatertemplate.replace( new RegExp("{{" + keyNames[k] + "}}", "g"), item[j][keyNames[k]]);
                    }
                    else {
                        repeatertemplate = repeatertemplate.replace(new RegExp("{{data}}", "g"), item[keyNames[k]]);
                    }
                }
            }
            try{
                finalhtml += repeatertemplate;
            }
            catch(e)
            {
            }
           
        }
        return finalhtml;
    }

    var init = function () {
        if (document.URL.indexOf("#") > 0)
        {
            actionChange();
        }
        else {
            location.href = "#";
        }
    };

    var processRoute = function () {
            console.log(routes)

        var hashparts =hash.split('/');
        var path = "";
        var parts = hashparts.length;
        var routeobj;
        for(var i=parts; i>0; i--)
        {   
            var temparr = hashparts.splice(0, i);
            var pathstr = temparr.join('/');
            pathstr= pathstr.toLowerCase();
            console.log("searching route for "+ pathstr);
            //checking if path exists in route
            if (routes[pathstr] != undefined)
            {
                routeobj = routes[pathstr];
                console.log("route found");
                console.log(routeobj);
                break;
            }
            hashparts = temparr;
        }
        //processing route object, fetching URL params
        if (routeobj != undefined) {
            params = routeobj["url"];
            var params_arr = params.split(':');
            var urlparams = hash.split('/');
            var urlobj = new Object();
            try{
                for (var i = params_arr.length - 1; i > 0; i--)
                {
                    urlobj[params_arr[i].replace("/", "")] = urlparams[i];
                }
                that.URL = urlobj;
            }
            catch(e)
            {
                console.error("INVALID ROUTE CONFIGURATION OR INCORRECT REQUEST PARAMS");
            }
            hash = routeobj["path"];
            console.log("final hash "+hash);
        }
    }

    var binding = function () {

        window.addEventListener("hashchange", actionChange);
      $(document).ready(init());
        $(document).on("ajaxStart", function () {
            $('#'+loaderId).fadeIn();
        });
        $(document).on("ajaxStop", function () {
            $('#' + loaderId).fadeOut();
        });
    };

    var initRoutes=function(){
        routes = new Array();
        var date= new Date()
          var rdata;
          
    RouteXHR= $.get(appRoot + "/route.js?v="+ date.getMilliseconds(), function (data) {
            rdata = JSON.parse(data);
               
        }).done(function(){
            var routeObject = new Object();

            for(var i=0; i<rdata.length; i++)
            {
                var url = rdata[i]["url"].split(':')[0];
                url = url.substring(0, url.length - 1);
                routeObject[url] = rdata[i];

            }
            
            routes = routeObject;

        });
    };

    //public members


    this.initialise = function (placeholdertag, root, home, viewCaching, loader) {
        placeholder = placeholdertag;
        homepage = home;
        enableCache = viewCaching;
        appRoot = root;
        initRoutes();
        RouteXHR.done(function(){
debugger;

        binding();
        loaderId = loader; 
        });      
    };
    this.render = function () {
        isRenderAllowed = true;

       var a= template(hash, templateDOM);
        isRenderAllowed = false;
        return a;
        
    };

    this.reinit = function () {
        isRenderAllowed = true;
        rebuildTemplateDOM();
        template(hash, templateDOM);
        isRenderAllowed = false;
        return true;

    };
    
    this.effects = function () {

        return routes;
    };
};
var jsload =new function () {
    this.load = function (path) {
        if ($('script[data-id="scriptresource"]') == null) {
            $('head').append('<script data-id="scriptresource"></script>');
        }
        $.get(path, function (data) {
            $('script[data-id="scriptresource"]').attr("src", path);
        });
    }
}