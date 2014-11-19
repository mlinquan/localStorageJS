/**
 * localStorageJS
 * https://github.com/mlinquan/localStorageJS
 *
 * @version
 * 0.0.1 (July 28, 2013)
 *
 * @copyright
 * Copyright (C) 2013 LinQuan.
 *
 * @license
 * Dual licensed under the MIT and GPL licenses.
 */

 function localStorageJS(a, options, localStorageJSTag) {
    var j = count = a.length, lsI=0, lsList = {}, lsPanding = {}, lsAllready = 0, second = new Date().getTime()/1000,
    head = document.head || document.getElementsByTagName('head')[0],
    localstorageable = (typeof window.localStorage != 'undefined'),
    config = {
        corsProxy:null,
        expires:10080,
        error_expires:10080
    };
    if(options) {
        for(var opt in options) {
            config[opt] = options[opt];
        }
    }
    for(var i=0;i<j;i++) {
        var parent = a[i].parent ? a[i].parent : null;
        if(parent == 'allready') {
            lsAllready++;
        }
    }
    get();
    function get() {
        if(j > lsI) {
            var i = lsI++,source,n=1,
            name = a[i].name ? a[i].name : 'temp'+i,
            url = a[i].url ? a[i].url : (typeof a[i] == 'string' ? a[i] : null),
            parent = a[i].parent ? a[i].parent : null,
            version = a[i].version ? a[i].version : "";
            callback = a[i].callback ? a[i].callback : null,
            expires = a[i].expires ? a[i].expires : config.expires,
            removeSelf = a[i].removeSelf ? a[i].removeSelf : null,
            type = a[i].type ? a[i].type : file_type(url),
            tmp_a = document.createElement("a");
            url = abspath2relpath(url);
            tmp_a.href = url;
            var islocal = (tmp_a.hostname == location.hostname);
            tmp_a = null;
            /*if(!islocal && config.corsProxy) {
                url = config.corsProxy+url;
            }*/
            lsList[name] = {url: url, type: type, parent: parent, version: version, callback: callback, el: null, islocal: islocal, removeSelf: removeSelf, lsStatus: null};
            if(localstorageable && localStorage.getItem(name)) {
                source = localStorage.getItem(name);
                if((source.indexOf('/*var lsJS') == 0)) {
                    var info = source.match(/var lsJS = (.*)\;/i);
                    if(info[0]) {
                        eval(info[0]);
                        if(lsJS.error) {
                            n = 2;
                            if(lsJS.error == 'not-allow-cors') {
                                n = 3;
                            } else if((second - lsJS.expires) > config.error_expires) {
                                n = 4;
                            }
                        } else if((lsJS.expires != 'never' && ((second - lsJS.expires) > config.expires)) || version && (!lsJS.version || lsJS.version < version)) {
                            n = 0;
                        }
                    }
                }
            } else {
                n = 0;
            }
            if(n>0 && n<4) {
                if(n==1) {
                    lsList[name].el = create_element(type,url,source);
                    lsList[name].lsStatus = 'loaded';
                } else if(n==3) {
                    lsList[name].el = create_element(type,url,false);
                    lsList[name].lsStatus = 'panding';
                } else {
                    lsList[name].lsStatus = 'error';
                }
                release(name);
            } else {
                var xhr,
                xtype=null;
                try{
                    xhr = new XMLHttpRequest();
                } catch(e) {}
                if(islocal) {
                    if(!xhr && window.ActiveXObject) {
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                } else {
                    if(xhr && ("withCredentials" in xhr)) {
                        //xhr = new XMLHttpRequest();
                    } else if(typeof XDomainRequest != "undefined") {
                        xhr = new XDomainRequest();
                        xtype = 'XDR';
                    } else {
                        xhr = null;
                    }
                }
                if(xhr) {
                    var jj = function() {
                        if(xhr.responseText) {
                            source = (type == 'css') ? css_repath(url, xhr.responseText) : xhr.responseText;
                            source = "/*var lsJS = {\"expires\":\""+second+"\",\"version\":\""+version+"\"};*/\n" + source;
                            if(localstorageable) localStorage.setItem(name, source);
                            lsList[name].el = create_element(type,url,source);
                            lsList[name].lsStatus = 'loaded';
                        } else {
                            if(localstorageable) localStorage.setItem(name, "/*var lsJS = {\"error\": \""+xhr.status+"\", \"expires\":\""+second+"\"};*/\n");
                            lsList[name].lsStatus = 'error';
                        }
                    };
                    if(!xtype) {
                        try{//Firefox 3.0
                            xhr.onreadystatechange = function(e) {
                                if (xhr.readyState == 4) {
                                    if(xhr.status == 200 || xhr.status == 304) {
                                        jj();
                                        release(name);
                                    } else if(!islocal && xhr.status == 0) {
                                        if(localstorageable) localStorage.setItem(name, "/*var lsJS = {\"error\": \"not-allow-cors\", \"expires\":\""+second+"\"};*/\n");
                                        lsList[name].el = create_element(type,url,false);
                                        lsList[name].lsStatus = 'panding';
                                        release(name);
                                    } else {
                                        if(localstorageable) localStorage.setItem(name, "/*var lsJS = {\"error\": \""+xhr.status+"\", \"expires\":\""+second+"\"};*/\n");
                                        lsList[name].lsStatus = 'error';
                                        release(name);
                                    }
                                }
                            };
                            xhr.open('get', url, true);
                            xhr.send(null);
                        } catch(e) {
                            lsList[name].lsStatus = 'error';
                            release(name);
                        }
                    } else {
                        xhr.onerror = function(e) {
                            if(localstorageable) localStorage.setItem(name, "/*var lsJS = {\"error\": \"not-allow-cors\", \"expires\":\""+second+"\"};*/\n");
                            lsList[name].el = create_element(type,url,false);
                            lsList[name].lsStatus = 'panding';
                            release(name);
                        };
                        xhr.onload = function() {
                            jj();
                            release(name);
                        };
                        xhr.open('get', url);
                        xhr.send(null);
                    }
                } else {
                    lsList[name].el = create_element(type,url,false);
                    lsList[name].lsStatus = 'panding';
                    release(name);
                }
            }
            get();
        }
    }
    function file_type(url) {
        if(/(\.js$|\.js\?.+$|\.js#.+$)/i.test(url)) return 'js';
        if(/(\.css$|\.css\?.+$|\.css#.+$)/i.test(url)) return 'css';
    }
    function abspath2relpath(abspath, baseurl) {
        var localport = (location.port && !(/(80|443|0)/.test(location.port))) ? ':'+ location.port : '',
        localhost = location.protocol+'//'+location.hostname+localport,
        localpath = localhost + location.pathname;
        if(/(^http:[\/]{2}|https:[\/]{2})/i.test(abspath)) {
            return abspath;
        } else {
            if(!baseurl || !(/(https:[\/]{2}|http:[\/]{2}|[\/]{1})/i.test(baseurl))) {
                baseurl = localpath;
            } else if((/^\//ig.test(baseurl))) {
                baseurl = localhost + baseurl;
            } else if(/(https:[\/]{2}|http:[\/]{2})/i.test(baseurl)) {
                if(baseurl.split('/').length == 3) {
                    baseurl += '/';
                }
            } else {
                baseurl = localpath + baseurl;
            }
            if(!(/\/$/i.test(baseurl))) {
                baseurl = baseurl.substr(0,baseurl.lastIndexOf('/')+1);
            }
            if((/^\//i.test(abspath))) {
                baseurl = baseurl.match(/(http:[\/]{2}|https:[\/]{2})([^\/]+)/i)[0];
            }
        }
        var tmp = document.createElement("a");
        tmp.href = baseurl + abspath;
        tmpport = (tmp.port && !(/(80|443|0)/.test(tmp.port))) ? ':'+ tmp.port : '';
        var tmppath = (/^\//i.test(tmp.pathname)) ? tmp.pathname : '/'+tmp.pathname;
        var relpath = tmp.protocol+"//"+tmp.hostname+tmpport+tmppath+tmp.search+tmp.hash;
        tmp = null;
        return relpath;
    }
    function create_element(type,url,source) {
        var element;
        if(type == 'js') {
            element = document.createElement('script');
            element.type = 'text/javascript';
            element.title = url;
        } else if(type == 'css') {
            element = document.createElement('style');
            element.type = 'text/css';
        }
        if(source) {
            if(!+[1,]) {
                if(type == 'css') {
                    element.styleSheet.cssText = source;
                } else if(type == 'js') {
                    element.text = source;
                }
            } else {
                element.textContent = source;
            }
        } else {
            if(type == 'js') {
                element.src = url;
            } else if(type == 'css') {
                element = document.createElement('link');
                element.rel = 'stylesheet';
                element.href = url;
            }
        }
        return element;
    }
    function css_repath(url, css_source) {
        var import_reg = /\@import([\s+])?url\(.+?\)/ig;
        var img_reg = /url\([\s\'\"]*(?!https:[\/]{2}|http:[\/]{2}|\/)([^)\'\"]+)/ig;
        var img_regs = /url\([\s\'\"]*/ig;
        var import_list = css_source.match(import_reg);
        var img_list = css_source.match(img_reg);
        if(img_list) {
            for(var fasdf=0;fasdf<img_list.length;fasdf++) {
                var img = img_list[fasdf].replace(img_regs, '');//.replace(img_regs, '');
                css_source = css_source.replace(img, abspath2relpath(img, url));
            }
        }
        return css_source;
    }
    function release(name) {
        if(lsList[name].lsStatus == 'loaded' || lsList[name].lsStatus == 'panding') {
            if(!lsList[name].parent || (lsList[name].parent && lsList[name].parent != 'allready' && lsList[lsList[name].parent].lsStatus == 'ok')) {
                if(lsList[name].lsStatus == 'loaded') {
                    lsList[name].lsStatus = 'ok';
                    head.appendChild(lsList[name].el);
                    if(lsList[name].callback && typeof lsList[name].callback == 'function') {
                        lsList[name].callback();
                    }
                    count--;
                    release_panding(name);
                } else {
                    lsList[name].el.onload = lsList[name].el.onreadystatechange = function(e) {
                        if(!lsList[name].el.readyState || lsList[name].el.readyState == "loaded" || lsList[name].el.readyState == "complete") {
                            lsList[name].lsStatus = 'ok';
                            (lsList[name].callback && typeof lsList[name].callback === 'function') && lsList[name].callback();
                            count--;
                            release_panding(name);
                        }
                    };
                    lsList[name].el.onerror = function(e) {
                        if(localstorageable) localStorage.setItem(lsList[name].url, "/*var lsJS = {\"error\": \"404\", \"expires\":\""+second+"\"};*/\n");
                        lsList[name].lsStatus = 'error';
                        head.removeChild(lsList[name].el);
                        count--;
                        release_panding(name);
                    };
                    head.appendChild(lsList[name].el);
                }
            } else {
                if(!lsPanding[lsList[name].parent]) lsPanding[lsList[name].parent] = {};
                lsPanding[lsList[name].parent][name] = 1;
                release_panding(name);
            }
        } else {
            count--;
            release_panding(name);
        }
    }
    function release_panding(name) {
        if(lsPanding[name]) {
            for(x in lsPanding[name]) {
                release(x);
            }
        }
        if((count == lsAllready)) {
            for(q in lsList) {
                if(lsList[q].lsStatus == 'loaded') {
                    head.appendChild(lsList[q].el);
                    lsList[q].lsStatus = 'ok';
                    (lsList[q].callback && typeof lsList[q].callback === 'function') && lsList[q].callback();
                    count--;
                }
                if(lsList[q].type == 'js' && (lsList[q].removeSelf || config.removeAll)) {
                    head.removeChild(lsList[q].el);
                }
            }
            //head.removeChild(localStorageJSTag);
        }
    }
    if(localstorageable && !localStorage.getItem('localStorageJS')) {
        localStorage.setItem('localStorageJS', "var localStorageJS_version = \"" + lsJS.version + "\"\;\n" + localStorageJS.toString());
    }
}