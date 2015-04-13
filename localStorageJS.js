/**
 * localStorageJS
 * https://github.com/mlinquan/localStorageJS
 *
 * @version
 * 0.0.7 (April 13, 2015)
 *
 * @copyright
 * Copyright (C) 2013 LinQuan.
 *
 * @license
 * Dual licensed under the MIT and GPL licenses.
 */

 function localStorageJS(a, options, localStorageJSTag) {
    var qq = 0;
    var lsJ = lsCount = a.length, lsI=0, lsQ = {}, lsList = {}, lsOnload = [], lsPanding = {}, lsAllready = 0, second = new Date().getTime()/1000,
    head = document.head || document.getElementsByTagName('head')[0],
    localstorageable = (typeof window.localStorage != 'undefined'),
    localhost = location.hostname,
    localpath = location.pathname,
    config = {
        corsProxy: "",
        expires: 10080,
        error_expires: 10080,
        debug: false
    },
    abspath2relpath = function(abspath, baseurl) {
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
    },
    elementType = function(url) {
        if(/(\.js$|\.js\?.+$|\.js#.+$)/i.test(url)) {
            return 'js';
        }
        if(/(\.css$|\.css\?.+$|\.css#.+$)/i.test(url)) {
            return 'css';
        }
    },
    createLsElement = function(obj) {
        var element;
        if(obj.type == 'js') {
            element = document.createElement('script');
            element.type = 'text/javascript';
            //element.title = obj.url;
        }
        if(obj.type == 'css') {
            element = document.createElement('style');
            element.type = 'text/css';
        }
        if(obj.source) {
            var source = obj.source.replace(/\/\*(.*)\*\//gi, "").replace("\r", "").replace("\n\n", "\n");
            if(!+[1,]) {
                if(obj.type == 'css') {
                    element.styleSheet.cssText = source;
                } else if(obj.type == 'js') {
                    element.text = source;
                }
            } else {
                element.textContent = source;
            }
        } else {
            if(obj.type == 'js') {
                element.src = obj.url;
            }
            if(obj.type == 'css') {
                element = document.createElement('link');
                element.rel = 'stylesheet';
                element.href = obj.url;
            }
        }
        return element;
    },
    doStorage = function(name, data) {
        name = (name != "localStorageJS") && "lsI_" + name || name;
        if(localstorageable) {
            localStorage.setItem(name, JSON.stringify(data));
        }
    },
    doGet = function(obj) {
        var xhr, xtype, data_tmp;
        try {
            xhr = new XMLHttpRequest();
        } catch (e) {}

        obj.islocal ?
            !xhr && window.ActiveXObject && (xhr = new ActiveXObject("Microsoft.XMLHTTP"))
                :xhr && "withCredentials" in xhr || ("undefined" != typeof XDomainRequest ?
                    (xhr = new XDomainRequest(), xtype = "XDR")
                        :xhr = null);

        data_tmp = {
            url: obj.url,
            source: "",
            error: ""
        };
        if(xhr) {
            if(!xtype) {
                try{//Firefox 3.0
                    xhr.onreadystatechange = function(e) {
                        if (xhr.readyState == 4) {
                            if(xhr.status == 200 || xhr.status == 304) {
                                data_tmp.source = xhr.responseText;
                            } else if(!islocal && xhr.status == 0) {
                                data_tmp.error = "not-allow-cors";
                            } else {
                                data_tmp.error = xhr.status;
                            }
                            doStorage(obj.name, data_tmp);
                        }
                    };
                    xhr.open('get', obj.url, true);
                    xhr.send(null);
                } catch(e) {
                    //throw e + obj.name + " : "
                }
            } else {
                xhr.onerror = function(e) {
                    data_tmp.error = "not-allow-cors";
                    doStorage(obj.name, data_tmp);
                };
                xhr.onload = function() {
                    data_tmp.source = xhr.responseText;
                    doStorage(obj.name, data_tmp);
                };
                xhr.open('get', obj.url);
                xhr.send(null);
            }
        }
    },
    onloadFun = function() {
        if(localstorageable) {
            if(!config.debug && localstorageable && lsOnload.length) {
                for(var g=0;g<lsOnload.length;g++) {
                    var scTmp = localStorage.getItem("lsI_" + lsOnload[g].name),
                    thatTmp;
                    try{
                        thatTmp = JSON.parse(scTmp);
                    } catch(e) {
                    }
                    if(!thatTmp || (thatTmp && thatTmp.url != lsOnload[g].url)) {
                        doGet(lsOnload[g]);
                    }
                }
            }
            for(x in localStorage) {
                /^lsI_/.test(x) && !lsQ[x.replace("lsI_", "")] && localStorage.removeItem(x);
            }
        }
    },
    release = function(name) {
        if(lsList[name].lsStatus == 'loaded' || lsList[name].lsStatus == 'panding') {
            if(!lsList[name].require || (lsList[name].require && lsList[name].require != 'allready' && lsList[lsList[name].require].lsStatus == 'ok') || (lsCount == lsAllready)) {
                if(lsList[name].lsStatus == 'loaded') {
                    lsList[name].lsStatus = 'ok';
                    head.appendChild(lsList[name].el);
                    if(lsList[name].callback && typeof lsList[name].callback == 'function') {
                        lsList[name].callback();
                    }
                    lsCount--;
                    release_panding(name);
                } else {
                    lsList[name].el.onload = lsList[name].el.onreadystatechange = function(e) {
                        if(!lsList[name].el.readyState || lsList[name].el.readyState == "loaded" || lsList[name].el.readyState == "complete") {
                            lsList[name].lsStatus = 'ok';
                            (lsList[name].callback && typeof lsList[name].callback === 'function') && lsList[name].callback();
                            lsCount--;
                            release_panding(name);
                        }
                    };
                    lsList[name].el.onerror = function(e) {
                        var data_tmp = {
                            url: lsList[name].url,
                            source: "",
                            error: "404"
                        };
                        doStorage(name, data_tmp);
                        lsList[name].lsStatus = 'error';
                        head.removeChild(lsList[name].el);
                        lsCount--;
                        release_panding(name);
                    };
                    head.appendChild(lsList[name].el);
                }
            } else {
                if(!lsPanding[lsList[name].require]) lsPanding[lsList[name].require] = {};
                lsPanding[lsList[name].require][name] = 1;
                release_panding(name);
            }
        } else {
            lsCount--;
            release_panding(name);
        }
    },
    release_panding = function(name) {
        if(lsPanding[name]) {
            for(x in lsPanding[name]) {
                release(x);
            }
        }
        if(lsCount == lsAllready && lsPanding["allready"]) {
            for(x in lsPanding["allready"]) {
                release(x);
            }
        }
        if(lsCount == 0) {
            for(q in lsList) {
                if(lsList[q].lsStatus == 'loaded') {
                    head.appendChild(lsList[q].el);
                    lsList[q].lsStatus = 'ok';
                    (lsList[q].callback && typeof lsList[q].callback === 'function') && lsList[q].callback();
                    lsCount--;
                }
                if(!config.debug && lsList[q].type == 'js' && (lsList[q].removeSelf || config.removeAll) && lsList[q].lsStatus != "error") {
                    head.removeChild(lsList[q].el);
                    lsList[q].removed = true;
                }
            }
            if(config.allready && typeof config.allready == "function") {
                config.allready();
            }
            //onloadFun();
            //head.removeChild(localStorageJSTag);
        }
    };
    if(options) {
        for(var opt in options) {
            config[opt] = options[opt];
        }
    }
    for(var i=0;i<lsJ;i++) {
        if(a[i].router && a[i].router.domain && a[i].router.domain != localhost) {
            lsCount--;
            continue;
        }
        lsQ[a[i].name] = a[i];
        if(a[i].router && a[i].router.path) {
            var tmp_reg;
            try{
                tmp_reg = new RegExp(a[i].router.path);
            } catch(e) {
                throw a[i].name + " : The path regular expression error.";
            }
            if(tmp_reg && !tmp_reg.test(localpath)) {
                lsOnload.push(a[i]);
                lsCount--;
                continue;
            }
        }
        var parent = a[i].require ? a[i].require : null;
        if(parent == 'allready') {
            lsAllready++;
        }
        var tmp_a = document.createElement("a");
        var tmp_url = abspath2relpath(a[i].url);
        tmp_a.href = tmp_url;
        a[i].islocal = (tmp_a.hostname == location.hostname);
        a[i].relurl = (!a[i].islocal && config.corsProxy) ? config.corsProxy + tmp_url : tmp_url;
        a[i].type = elementType(a[i].url);
        if(!config.debug && localstorageable && localStorage.getItem("lsI_" + a[i].name)) {
            var scTmp = localStorage.getItem("lsI_" + a[i].name),
            thatTmp;
            try{
                thatTmp = JSON.parse(scTmp);
            } catch(e) {
            }
            if(thatTmp && thatTmp.source && thatTmp.url && thatTmp.url == a[i].url && !thatTmp.error) {
                a[i].source = thatTmp.source;
                a[i].lsStatus = "loaded";
                a[i].el = createLsElement(a[i]);
            }
        }
        if(!a[i].el) {
            !config.debug && doGet(a[i]);
            a[i].lsStatus = "panding";
            a[i].el = createLsElement(a[i]);
        }
        lsList[a[i].name] = a[i];
    }
    for(x in lsList) {
        release(x);
    }
    if(window.addEventListener) {
        window.addEventListener('load',onloadFun,false);
    } else {
        window.attachEvent('onload',onloadFun);
    }
    if(!config.debug && (localstorageable && !localStorage.getItem('localStorageJS'))) {
        var lsTmp = {
            version: lsJS.version,
            source: localStorageJS.toString()
        };
        doStorage('localStorageJS', lsTmp);
    }
}