/**
 * localStorageJS
 * https://github.com/mlinquan/localStorageJS
 *
 * @version
 * 0.1.3 (April 13, 2015)
 *
 * @copyright
 * Copyright (C) 2013 LinQuan.
 *
 * @license
 * Dual licensed under the MIT and GPL licenses.
 */

function localStorageJS() {
    "use strict";

    var map, useMap = {}, cfg, standby = [], queue = [], lsList = {}, lteIE8 = eval(!-[1,]),
        gteIE8 = (typeof window.localStorage != 'undefined'),
        isIE8 = (lteIE8 && gteIE8),
        ltIE8 = (lteIE8 && !isIe8),
        head = document.head || document.getElementsByTagName('head')[0],
        host = location.hostname,
        path = location.pathname,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        jsReg = /(\.js$|\.js\?.+$|\.js#.+$)/i,
        cssReg = /(\.css$|\.css\?.+$|\.css#.+$)/i,
        tmp_a = document.createElement("a"),
        version = "0.1.3";

    if(!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(item, start) {
            var i = 0, length = this.length;
            if(Number(start) !== NaN) {
                if(start > 0) {
                    i = start;
                }
                if(start < 0) {
                    i = start + length;
                }
            }
            if(i < 0 || i>= length) {
                return -1;
            }
            for(;i < length; i++) {
                if(this[i] == item) {
                    return i;
                }
            }
            return -1;
        };
    }

    if(!Array.prototype.remove) {
        Array.prototype.remove = function(item) {
            var i = this.indexOf(item);
            if(i === -1) {
                return;
            }
            this.splice(i, 1);
        };
    }

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    function makeMap(deps, path) {
        map = localStorageJS.map;
        if(path) {
            for(var y in path) {
                if(!map[y]) {
                    map[y] = {require:[],children:[]};
                }
                var req = y.replace(/[\.\/][^\.\/]+$/, "");
                if(req == y) {
                    continue;
                }
                if(map[req].children.indexOf(y) === -1) {
                    map[req].children.push(y);
                }
                if(map[y].require.indexOf(req) === -1) {
                    map[y].require.push(req);
                }
            }
            localStorageJS.map = map;
        }
        if(deps) {
            for(var j=0;j<deps.length;j++) {
                var obj=deps[j];
                if(!obj.require || !isArray(obj.require) || obj.require.length === 0) {
                    continue;
                }
                for(var l=0;l<obj.require.length;l++) {
                    var require = obj.require[l];
                    if(!map[require]) {
                        map[require] = {children:[],require:[]};
                    }
                    if(!map[obj.name]) {
                        map[obj.name] = {children:[],require:[]};
                    }
                    map[require].children.push(obj.name);
                    map[obj.name].require.push(require);
                }
            }
            localStorageJS.map = map;
        }
    }

    function makeQueue(deps) {
        for(var i=0;i<deps.length;i++) {
            if(deps[i].router) {
                if(deps[i].router.domain && deps[i].router.domain != host) {
                    loc.length--;
                    continue;
                }
                if(deps[i].router.path) {
                    var tmp_reg;
                    try{
                        tmp_reg = new RegExp(deps[i].router.path);
                    } catch(e) {
                        throw deps[i].name + " : The path regular expression error.";
                    }
                    if(tmp_reg && !tmp_reg.test(path)) {
                        standby.push(deps[i]);
                        continue;
                    }
                }
            }
            queueRequire(deps[i].name);
            lsList[deps[i].name] = deps[i];
        }
    }

    function queueRequire(req) {
        if(!map[req]) {
            //console.error("\"" + req + "\" is not defined.");
            return;
        }
        if(queue.indexOf(req) === -1) {
            if(!useMap[req]) {
                useMap[req] = {require:[],children:[]};
            }
            if(map[req].require.length) {
                var req_req = map[req].require;
                useMap[req].require = req_req;
                for(var k=0;k<req_req.length;k++) {
                    if(!useMap[req_req[k]]) {
                        useMap[req_req[k]] = {require:[],children:[]};
                    }
                    useMap[req_req[k]].children.push(req);
                    queueRequire(req_req[k]);
                }
            }
            queue.push(req);
        }
    }

    function doLoad() {
        for(var k=0;k<queue.length;k++) {
            var name = queue[k];
            if(!lsList[name] && cfg.path[name]) {
                lsList[name] = {
                    name: name,
                    url: cfg.path[name],
                    require: map[name].require
                };
            }
            lsList[name].url = cfg.baseUrl + lsList[name].url;
            tmp_a.href = lsList[name].url;
            lsList[name].islocal = (tmp_a.hostname == host);
            lsList[name].type = elemType(lsList[name].url);
            if(!cfg.debug && gteIE8 && localStorage.getItem("lsI_" + lsList[name].name)) {
                var scTmp = localStorage.getItem("lsI_" + lsList[name].name),
                thatTmp;
                try{
                    thatTmp = JSON.parse(scTmp);
                } catch(e) {
                }
                if(thatTmp && thatTmp.source && thatTmp.url && thatTmp.url == lsList[name].url && !thatTmp.error) {
                    lsList[name].source = thatTmp.source;
                    lsList[name].status = "loaded";
                    lsList[name].el = createElem(lsList[name]);
                }
            }
            if(!lsList[name].el) {
                lsList[name].status = "pending";
                lsList[name].el = createElem(lsList[name]);
            }
        }
        for(var m=0;m<queue.length;m++) {
            release(queue[m]);
        }
    }

    function elemType(url) {
        return (jsReg.test(url) && "js") || (cssReg.test(url) && "css");
    }

    function createElem(obj) {
        if(!obj.type) {
            return showError();
        }
        var element;
        if(obj.type == "js") {
            element = document.createElement('script');
            element.type = 'text/javascript';
            if(obj.source) {
                if(isIE8) {
                    element.text = obj.source;
                }
                if(!isIE8) {
                    element.textContent = obj.source;
                }
                return element;
            }
            element.src = obj.url;
            return element;
        }
        if(obj.type == "css") {
            /*if(obj.source) {
                element = document.createElement('style');
                element.type = 'text/css';
                if(isIE8) {
                    element.styleSheet.cssText = obj.source;
                }
                if(!isIE8) {
                    element.textContent = obj.source;
                }
                return element;
            }*/
            element = document.createElement('link');
            element.rel = 'stylesheet';
            element.href = obj.url;
            return element;
        }
    }

    function release(name) {
        var obj = lsList[name];
        if(obj.status == "pending" && lsList[name].storage !== false) {
            lsList[name].status = "loading";
            doGet(obj);
        }
        if(useMap[name].require.length) {
            return;
        }
        if(obj.status == 'loaded') {
            head.appendChild(lsList[name].el);
            lsList[name].status = 'ok';
            if(obj.callback && isFunction(obj.callback)) {
                obj.callback();
            }
            if(useMap[name].children.length) {
                var child = useMap[name].children;
                for(var n=0;n<child.length;n++) {
                    var child_name = child[n];
                    useMap[child_name].require.remove(name);
                    release(child_name);
                }
            }
            queue.remove(name);
            if(!cfg.debug && lsList[name].type == 'js' && (lsList[name].removeSelf || cfg.removeAll)) {
                head.removeChild(lsList[name].el);
                lsList[name].status = "removed";
            }
        }
        if(!queue.length && cfg.allready && isFunction(cfg.allready)) {
            cfg.allready();
        }
        /*//if(lsList[name].status == 'loaded') {
            if(lsList[name].require.length) {
                return;
            }

        //}

        if(lsList[name].status == 'loaded') {
            lsList[name].status = 'ok';
            head.appendChild(lsList[name].el);
            releaseChildren(name);
            if(lsList[name].callback && typeof lsList[name].callback == 'function') {
                lsList[name].callback();
            }
        } else if(!lsList[name].storage) {
            doGet(lsList[name], function(name) {
                releaseChildren(name);
            });
        } else {
            lsList[name].el.onload = lsList[name].el.onreadystatechange = function(e) {
                if(!lsList[name].el.readyState || lsList[name].el.readyState == "loaded" || lsList[name].el.readyState == "complete") {
                    lsList[name].status = 'ok';
                    releaseChildren(name);
                    if(lsList[name].callback && typeof lsList[name].callback === 'function') {
                        lsList[name].callback();
                    }
                }
            };
            lsList[name].el.onerror = function(e) {
                var data_tmp = {
                    url: lsList[name].url,
                    source: "",
                    error: "404"
                };
            };
            head.appendChild(lsList[name].el);
        }*/
    }

    function doGet(obj) {
        var xhr, xtype, data_tmp, name = obj.name;
        try{
            xhr = new XMLHttpRequest();
        } catch(e) {}

        if(obj.islocal) {
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
                                lsList[name].status = "loaded";
                                lsList[name].source = data_tmp.source;
                                lsList[name].el = createElem(lsList[name]);
                                release(name);
                            } else if(!obj.islocal && xhr.status === 0) {
                                data_tmp.error = "not-allow-cors";
                            } else {
                                data_tmp.error = xhr.status;
                            }
                            doStorage(name, data_tmp);
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
                    lsList[name].status = "loaded";
                    lsList[name].source = data_tmp.source;
                    lsList[name].el = createElem(lsList[name]);
                    release(name);
                    doStorage(name, data_tmp);
                };
                xhr.open('get', obj.url);
                xhr.send(null);
            }
        }
    }

    function doStorage(name, data) {
        if(!gteIE8) {
            return;
        }
        name = (name != "localStorageJS") && "lsI_" + name || name;
        localStorage.setItem(name, JSON.stringify(data));
    }

    function doClear() {
        if(!gteIE8) {
            return;
        }
        for(var x in localStorage) {
            var name = /^lsI_/.test(x) && x.replace("lsI_", "");
            if(name && !localStorageJS.map[name]) {
                localStorage.removeItem(x);
            }
        }
    }

    var loc = {
        cfg: {
            baseUrl: "",
            cors: true,
            path: {},
            debug: false,
            removeAll: true,
            corsProxy: "",
            expires: 10080,
            error_expires: 10080,
            allready: function() {

            }
        },
        map: {},
        standby: [],
        config: function(options) {
            if(!options) {
                return;
            }
            for(var x in this.cfg) {
                localStorageJS.cfg[x] = options[x] || this.cfg[x];
            }
            cfg = localStorageJS.cfg;
            makeMap("", cfg.path);
            map = localStorageJS.map;
        },
        load: function(deps) {
            if(!deps || deps.length === 0) {
                deps = localStorageJS.standby;
                localStorageJS.standby = [];
            }
            if(deps.length === 0) {
                return;
            }
            makeMap(deps);
            makeQueue(deps);
            doLoad();
            doClear();
        }
    };
    if(gteIE8 && !localStorage.getItem('localStorageJS')) {
        var lsTmp = {
            version: version,
            url: lsJS.ss,
            source: localStorageJS.toString() + "\nlocalStorageJS = localStorageJS()\;\n"
        };
        doStorage('localStorageJS', lsTmp);
    }
    return loc;
}
localStorageJS = localStorageJS();