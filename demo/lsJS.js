var lsJS = function() {
    "use strict";
    var run_lsJS = {
        config:{},
        load:function(){
            var a = arguments, r = false,
            lteIE8 = eval(!-[1,]),
            h = document.head || document.getElementsByTagName('head')[0],
            ss = this.ss,
            config = this.config,
            d = document.createElement('script');
            d.type = 'text/javascript';
            if(typeof window.localStorage != 'undefined' && localStorage.getItem('localStorageJS') && !config.debug) {
                var lsCode = localStorage.getItem('localStorageJS'),
                lsJS_info;
                try{
                    lsJS_info = JSON.parse(lsCode);
                } catch(e) {
                }
                if(lsJS_info && lsJS_info.url && (lsJS_info.url == ss)) {
                    r = true;
                    if(lteIE8) {
                        d.text = lsJS_info.source;
                    } else {
                        d.textContent = lsJS_info.source;
                    }
                    h.appendChild(d);
                    localStorageJS.config(config);
                    localStorageJS.load(a);
                } else {
                    localStorage.removeItem('localStorageJS');
                }
            }
            if(!r) {
                d.src = ss;
                d.onload = d.onreadystatechange = function() {
                    if(!r && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                        r = true;
                        localStorageJS.config(config);
                        localStorageJS.load(a);
                        //d.parentNode.removeChild(d);
                        d.onload = d.onreadystatechange = null;
                    }
                };
                h.appendChild(d);
            }
        }
    };
    return run_lsJS;
}();

lsJS.version = '0.1.6';
lsJS.ss = '/demo/localStorageJS.js';
lsJS.config = {
    baseUrl: '/demo/',
    path: {
        'jquery': 'jquery-1.11.1.min.js'
    },
    error_expires: 30,
    debug: true,
    removeAll: false,
    allready: function() {
        (function($) {
            $(function() {
                $("#global_loading").hide();
            });
        })(jQuery);
    }
};

lsJS.load({
    name: 'history',
    url: 'history.js',
    require: ['jquery']
}, {
    name: 'console',
    url: 'console.js',
    router: {
        path: '/demo/console.html'
    }
});