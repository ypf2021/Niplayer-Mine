// 写一个发布订阅模式的类，供其他类继承
class BaseEvent {
    constructor() {
        this.$events = {};
    }
    // 事件触发
    emit(event, ...args) {
        if (this.$events[event]) {
            this.$events[event].forEach((cb, index) => {
                cb.call(this, ...args);
            });
        }
    }
    // 事件监听/注册
    on(event, cb) {
        this.$events[event] = this.$events[event] || [];
        this.$events[event].push(cb);
    }
}

function $warn(msg) {
    throw new Error(msg);
}

const styles = {
    "video-container": "player_video-container__I9fU2",
    "video-wrapper": "player_video-wrapper__tN3j3",
    "video-controls": "toolbar_video-controls__wzQC1",
    "video-controls-hidden": "toolbar_video-controls-hidden__PscSU",
    "video-progress": "progress_video-progress__DMF70",
    "video-pretime": "progress_video-pretime__gDMzS",
    "video-buffered": "progress_video-buffered__xlu1O",
    "video-completed": "progress_video-completed__j0yvy",
    "video-dot": "progress_video-dot__u2nX7",
    "video-dot-hidden": "progress_video-dot-hidden__S-oLG",
    "video-play": "controller_video-play__aWE0Y",
    "video-subplay": "controller_video-subplay__ywUzK",
    "video-start-pause": "controller_video-start-pause__JnB3x",
    "video-duration": "controller_video-duration__8upHt",
    "video-duration-completed": "controller_video-duration-completed__PYm69",
    "video-settings": "controller_video-settings__SiNyl",
    "video-subsettings": "controller_video-subsettings__6Jtl7",
    "video-volume": "controller_video-volume__R8ory",
    "video-volume-progress": "controller_video-volume-progress__9FkAX",
    "video-volume-completed": "controller_video-volume-completed__zwRNX",
    "video-volume-dot": "pregress_video-dot__giuCI",
    "video-fullscreen": "controller_video-fullscreen__ZLYIr",
    "video-duration-all": "controller_video-duration-all__gGLip",
    "loading-mask": "",
    "loading-container": "",
    "loading-item": "",
    "loading-title": "",
    "error-mask": "",
    "error-container": "",
    "error-item": "",
    "error-title": ""
};

const icon = {
    iconfont: "main_iconfont__rq6b0",
    "icon-bofang": "main_icon-bofang__jDO5s",
    "icon-shezhi": "main_icon-shezhi__jiDcS",
    "icon-yinliang": "main_icon-yinliang__dvwc6",
    "icon-quanping": "main_icon-quanping__P8j59",
    "icon-cuowutishi": "main_icon-cuowutishi__Pp9HP",
    "icon-zanting": "main_icon-zanting__y4zTz",
};

class Controller extends BaseEvent {
    constructor(container) {
        super();
        this.container = container;
        this.init();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = `
            <div class="${styles["video-play"]}">
                <div class="${styles["video-subplay"]}">
                    <div class="${styles["video-start-pause"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-bofang"]}"></i>
                    </div>
                    <div class="${styles["video-duration"]}">
                        <span class="${styles["video-duration-completed"]}">00:00</span>&nbsp;/&nbsp;<span class="${styles["video-duration-all"]}">00:00</span>
                    </div>
                </div>
                <div class="${styles["video-settings"]}">
                    <div class="${styles["video-subsettings"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-shezhi"]}"></i>
                    </div>
                    <div class="${styles["video-volume"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-yinliang"]}"></i>
                        <div class="${styles["video-volume-progress"]}">
                            <div class="${styles["video-volume-completed"]}"></div>
                            <div class="${styles["video-volume-dot"]}"></div>
                        </div>
                    </div>
                    <div class="${styles["video-fullscreen"]}">
                        <i class="${icon["iconfont"]} ${icon["icon-quanping"]}"></i>
                    </div>
                </div>
            </div>
        `;
    }
    // 控制栏的事件 开始播放/关闭播放 ，全屏，设置
    initControllerEvent() {
        this.videoPlayBtn.onclick = (e) => {
            if (this.video.paused) {
                this.video.play();
            }
            else if (this.video.played) {
                this.video.pause();
            }
        };
        // 开启和关闭全屏
        this.fullScreen.onclick = () => {
            if (this.container.requestFullscreen && !document.fullscreenElement) {
                // Element.requestFullscreen() 方法用于发出异步请求使元素进入全屏模式。(返回一个promise)
                this.container.requestFullscreen();
            }
            else if (document.fullscreenElement) {
                document.exitFullscreen(); // 退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
            }
        };
    }
    initEvent() {
        // 启动视频
        this.on("play", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-zanting"]}`;
        });
        // 暂停视频
        this.on("pause", () => {
            this.videoPlayBtn.className = `${icon["iconfont"]} ${icon["icon-bofang"]}`;
        });
        // 加载视频数据
        this.on("loadedmetadata", (summary) => {
            this.summaryTime.innerHTML = formatTime(summary);
        });
        // 时间更新
        this.on("timeupdate", (current) => {
            this.currentTime.innerHTML = formatTime(current);
        });
        // 初始化时进行变量注册
        this.on("mounted", () => {
            this.videoPlayBtn = this.container.querySelector(`.${styles["video-start-pause"]} i`);
            this.currentTime = this.container.querySelector(`.${styles["video-duration-completed"]}`);
            this.summaryTime = this.container.querySelector(`.${styles["video-duration-all"]}`);
            this.video = this.container.querySelector("video");
            this.fullScreen = this.container.querySelector(`.${styles["video-fullscreen"]} i`);
            this.initControllerEvent();
        });
    }
}

class ErrorMask {
    constructor(container) {
        this.container = container;
        this.init();
    }
    init() {
        this.template_ = this.generateErrorMask();
    }
    get template() {
        return this.template_;
    }
    generateErrorMask() {
        let mask = document.createElement("div");
        mask.className = styles["error-mask"];
        let errorContainer = document.createElement('div');
        errorContainer.className = styles['error-container'];
        let errorItem = document.createElement("div");
        errorItem.className = styles["error-item"];
        let i = document.createElement("i");
        i.className = `${icon["iconfont"]} ${icon['icon-cuowutishi']}`;
        errorItem.appendChild(i);
        let errorTitle = document.createElement("div");
        errorTitle.className = styles["error-title"];
        errorTitle.innerText = "视频加载发生错误";
        errorContainer.appendChild(errorItem);
        errorContainer.appendChild(errorTitle);
        mask.appendChild(errorContainer);
        return mask;
    }
    // 添加错误的mask
    addErrorMask() {
        // 没蒙层的情况下才展示
        if (![...this.container.children].includes(this.template)) {
            this.container.appendChild(this.template);
        }
    }
    // 移除错误mask
    removeErrorMask() {
        if ([...this.container.children].includes(this.template)) {
            // ToDo
            this.container.removeChild(this.template);
        }
    }
}

class LoadingMask {
    constructor(container) {
        this.container = container;
        this.init();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = this.generateLoadingMask();
    }
    generateLoadingMask() {
        let mask = document.createElement("div");
        mask.className = styles["loading-mask"];
        let loadingContainer = document.createElement("div");
        loadingContainer.className = styles["loading-container"];
        let loaadingItem = document.createElement("div");
        loaadingItem.className = styles["loading-item"];
        let loadingTitle = document.createElement("div");
        loadingTitle.className = styles["loading-title"];
        loadingTitle.innerText = "视频正在努力加载中...";
        loadingContainer.appendChild(loaadingItem);
        loadingContainer.appendChild(loadingTitle);
        mask.appendChild(loadingContainer);
        return mask;
    }
    addLoadingMask() {
        if (![...this.container.children].includes(this.template)) {
            this.container.appendChild(this.template);
        }
    }
    removeLoadingMask() {
        if ([...this.container.children].includes(this.template)) {
            this.container.removeChild(this.template);
        }
    }
}

// 进度条组件
class Progress extends BaseEvent {
    constructor(container) {
        super();
        this.mouseDown = false;
        this.container = container;
        this.init();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    init() {
        this.template_ = `
            <div class="${styles["video-progress"]}">
                <div class="${styles["video-pretime"]}">00:00</div>
                <div class="${styles["video-buffered"]}"></div>
                <div class="${styles["video-completed"]} "></div>
                <div class="${styles["video-dot"]} ${styles["video-dot-hidden"]}"></div>
            </div>
        `;
    }
    initEvent() {
        // 初始化注册变量
        this.on("mounted", () => {
            this.progress = this.container.querySelector(`.${styles["video-controls"]} .${styles["video-progress"]}`);
            this.pretime = this.progress.children[0];
            this.bufferedProgress = this.progress.children[1];
            this.completedProgress = this.progress.children[2];
            this.dot = this.progress.children[3];
            this.video = this.container.querySelector("video");
            this.initProgressEvent();
        });
        this.on("timeupdate", (current) => {
            let scaleCurr = (this.video.currentTime / this.video.duration) * 100;
            let scaleBuffer = ((this.video.buffered.end(0) + this.video.currentTime) / this.video.duration) * 100;
            this.completedProgress.style.width = scaleCurr + "%";
            this.dot.style.left = this.progress.offsetWidth * (scaleCurr / 100) - 5 + "px";
            this.bufferedProgress.style.width = scaleBuffer + "%";
        });
        this.on("loadedmetadata", (summary) => { });
    }
    initProgressEvent() {
        this.progress.onmouseenter = () => {
            console.log("progress onmouseenter");
            this.dot.className = `${styles["video-dot"]}`;
        };
        this.progress.onmouseleave = () => {
            // 如果没有一直按着，离开的时候就隐藏
            if (!this.mouseDown) {
                this.dot.className = `${styles["video-dot"]} ${styles["video-dot-hidden"]}`;
            }
        };
        // 点击进度条 切换播放位置，点的位置，进度条的位置
        this.progress.onclick = (e) => {
            // 防止dot在progress上移动并放开的时候触发 process.onclick
            if (e.target == this.dot) {
                return;
            }
            // 算出位置的百分比
            // 此处有遗留bug
            let scale = e.offsetX / this.progress.offsetWidth;
            console.log("scale", e, scale, e.offsetX, this.progress.offsetWidth);
            if (scale < 0) {
                console.log("scale == 0");
                scale = 0;
            }
            else if (scale > 1) {
                console.log("scale == 1");
                scale = 1;
            }
            this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
            this.bufferedProgress.style.width = scale * 100 + "%";
            this.completedProgress.style.width = scale * 100 + "%";
            // 设置播放位置
            this.video.currentTime = Math.floor(scale * this.video.duration);
            if (this.video.paused)
                this.video.play();
        };
        // progress上面移动  时展示当前的时间
        this.progress.onmousemove = (e) => {
            let scale = e.offsetX / this.progress.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            let pretime = formatTime(scale * this.video.duration);
            this.pretime.style.display = "block";
            this.pretime.innerHTML = pretime;
            this.pretime.style.left = e.offsetX - 17 + "px";
            e.preventDefault();
        };
        this.progress.onmouseleave = (e) => {
            this.pretime.style.display = "none";
        };
        // 点击dot的事件
        this.dot.addEventListener("mousedown", (e) => {
            let left = this.completedProgress.offsetWidth; //点击时，相对于进度条的位置
            let mouseX = e.pageX; // 点击时相对于页面的位置
            this.mouseDown = true;
            document.onmousemove = (e) => {
                // e.pageX - mouseX + left   移动过的距离 + 原本的距离
                let scale = (e.pageX - mouseX + left) / this.progress.offsetWidth;
                if (scale < 0) {
                    scale = 0;
                }
                else if (scale > 1) {
                    scale = 1;
                }
                this.dot.style.left = this.progress.offsetWidth * scale - 5 + "px";
                this.bufferedProgress.style.width = scale * 100 + "%";
                this.completedProgress.style.width = scale * 100 + "%";
                this.video.currentTime = Math.floor(scale * this.video.duration);
                if (this.video.paused)
                    this.video.play();
                e.preventDefault();
            };
            document.onmouseup = (e) => {
                document.onmousemove = document.onmouseup = null;
                this.mouseDown = false;
                e.preventDefault();
            };
            e.preventDefault();
        });
    }
}

// 音乐播放器的工具栏组件 ( progress + controller )
class ToolBar extends BaseEvent {
    constructor(container) {
        super();
        this.container = container;
        this.init();
        this.initComponent();
        this.initTemplate();
        this.initEvent();
    }
    get template() {
        return this.template_;
    }
    ;
    init() { }
    // 注册 进度条 和 控制器
    initComponent() {
        this.progress = new Progress(this.container); // 进度条
        this.controller = new Controller(this.container); //下面的控制器
    }
    // 组合 进度条 和 控制器的template
    initTemplate() {
        let div = document.createElement("div");
        div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
        div.innerHTML += this.progress.template;
        div.innerHTML += this.controller.template;
        this.template_ = div;
    }
    // 显示和隐藏toolbar
    showToolBar(e) {
        //工具栏的总容器
        this.container.querySelector(`.${styles["video-controls"]}`).className = `${styles["video-controls"]}`;
        if (e.target !== this.video) ;
        else {
            // 一个防抖
            this.timer = window.setTimeout(() => {
                this.hideToolBar();
            }, 3000);
        }
    }
    hideToolBar() {
        this.container.querySelector(`.${styles["video-controls"]}`).className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
    }
    initEvent() {
        this.on("showtoolbar", (e) => {
            // 防抖
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.showToolBar(e);
        });
        this.on("hidetoolbar", () => {
            this.hideToolBar();
        });
        this.on("loadedmetadata", (summary) => {
            this.controller.emit("loadedmetadata", summary);
            this.progress.emit("loadedmetadata", summary);
        });
        this.on("timeupdate", (current) => {
            this.controller.emit("timeupdate", current);
            this.progress.emit("timeupdate", current);
        });
        this.on("mounted", () => {
            this.video = this.container.querySelector("video");
            this.controller.emit("mounted");
            this.progress.emit("mounted");
        });
        this.on("play", () => {
            this.controller.emit("play");
        });
        this.on("pause", () => {
            this.controller.emit("pause");
        });
    }
}

// 获取文件后缀名
function getFileExtension(file) {
    let name;
    if (typeof file === "string") {
        name = file;
    }
    else {
        name = file.name;
    }
    for (let i = name.length - 1; i >= 0; i--) {
        if (name[i] === ".") {
            return name.slice(i + 1, name.length);
        }
    }
    return null;
}

class Mp4Player {
    constructor(player) {
        this.player = player;
        // mp4直接将 playerOptions.url 中的内容进行赋值就可播放
        this.player.video.src = this.player.playerOptions.url;
        this.initEvent();
    }
    initEvent() {
        this.player.toolbar.emit("mounted");
        this.player.emit("mounted", this);
        this.player.container.onclick = (e) => {
            if (e.target == this.player.video) {
                if (this.player.video.paused) {
                    this.player.video.play();
                }
                else if (this.player.video.played) {
                    this.player.video.pause();
                }
            }
        };
        this.player.container.addEventListener("mouseenter", (e) => {
            this.player.toolbar.emit("showtoolbar", e);
        });
        this.player.container.addEventListener("mousemove", (e) => {
            this.player.toolbar.emit("showtoolbar", e);
        });
        this.player.container.addEventListener("mouseleave", (e) => {
            this.player.toolbar.emit("hidetoolbar");
        });
        this.player.video.addEventListener("loadedmetadata", (e) => {
            this.player.playerOptions.autoplay && this.player.video.play();
            this.player.toolbar.emit("loadedmetadata", this.player.video.duration);
        });
        this.player.video.addEventListener("timeupdate", (e) => {
            this.player.toolbar.emit("timeupdate", this.player.video.currentTime);
        });
        // 当视频可以再次播放的时候就移除loading和error的mask，通常是为了应对在播放的过程中出现需要缓冲或者播放错误这种情况从而需要展示对应的mask
        this.player.video.addEventListener("play", (e) => {
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.toolbar.emit("play");
        });
        this.player.video.addEventListener("pause", (e) => {
            this.player.toolbar.emit("pause");
        });
        this.player.video.addEventListener("waiting", (e) => {
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.loadingMask.addLoadingMask();
        });
        //当浏览器请求视频发生错误的时候
        this.player.video.addEventListener("stalled", (e) => {
            console.log("视频加载发生错误");
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.errorMask.addErrorMask();
        });
        this.player.video.addEventListener("error", (e) => {
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.errorMask.addErrorMask();
        });
        this.player.video.addEventListener("abort", (e) => {
            this.player.loadingMask.removeLoadingMask();
            this.player.errorMask.removeErrorMask();
            this.player.errorMask.addErrorMask();
        });
    }
}

const FactoryMaker = (function () {
    // 用自执行函数构建作用域
    class FactoryMaker {
        constructor() {
            this.__class_factoryMap = {};
            this.__single_factoryMap = {};
            this.__single_instanceMap = {};
        }
        // 每次调用都返回 一个 新的 new 实例
        getClassFactory(classConstructor) {
            let factory = this.__class_factoryMap[classConstructor.name];
            let ctx = this;
            // 如果map当中没有存储过
            if (!factory) {
                factory = function (context) {
                    if (!context)
                        context = {};
                    return {
                        create(...args) {
                            return ctx.merge(classConstructor, context, ...args);
                        }
                    };
                };
            }
            return factory;
        }
        // 单一实例 单例模式
        getSingleFactory(classConstructor) {
            let factory = this.__single_factoryMap[classConstructor.name];
            let ctx = this;
            if (!factory) {
                // 调用 getSingleFactory() 时传入的 context 会传递到new时的第一个参数的 context中
                factory = function (context) {
                    if (!context)
                        context = {};
                    return {
                        getInstance(...args) {
                            let instance = ctx.__single_instanceMap[classConstructor.name];
                            if (!instance) {
                                instance = new classConstructor({ context }, ...args);
                                ctx.__single_instanceMap[classConstructor.name] = instance;
                            }
                            return instance;
                        },
                    };
                };
            }
            return factory;
        }
        merge(classConstructor, context, ...args) {
            // 在调用 getClassFactory 返回的 create 函数的时候，会在这里进行merge，如果写入的context不存在就跳过，如果存在在判断是否需要覆写，如果不覆写，优先ne context中的内容
            let extensionObjejct = context[classConstructor.name];
            if (extensionObjejct) {
                // 如果获取到的上下文的属性classConstructor.name对应的对象上具有覆写（override）属性，则意味着需要覆写classConstructor上对应的属性
                if (extensionObjejct.override) {
                    let instance = new classConstructor({ context }, ...args);
                    let override = new extensionObjejct.instance({
                        context,
                        parent: instance // 重载的父类是这个
                    });
                    for (let props in override) {
                        if (instance.hasOwnProperty(props)) {
                            instance[props] = parent[props];
                        }
                    }
                }
                else {
                    // 如果不需要覆写，则意味着直接拿context中传入的构造函数来替换这个构造函数
                    return new extensionObjejct.instance({
                        context
                    });
                }
            }
            else {
                return new classConstructor({ context }, ...args);
            }
        }
    }
    return new FactoryMaker();
})();
// getSingleFactory
// getSingleFactory的返回值是一个函数
// getSingleFactory返回的函数运行结果是一个 有着 getInstance 属性的 对象FactoryFunction。 再通过调用getInstance函数，就可以创建对应的 实例
// 使用：
// XHRLoaderFactory = FactoryMaker.getSingleFactory(XHRLoader)
// this.xhrLoader = XHRLoaderFactory({}).getInstance();
// 得到的 xhrLoader 就是 XHRLoader类的实例

class HTTPRequest {
    constructor(config) {
        this.url = "";
        this.sendRequestTime = new Date().getTime();
        this.url = config.url;
        this.header = config.header;
        this.method = config.method;
        this.responseType = config.responseType;
    }
}

// 让外界调用 loadManifest 方法 发起请求
class XHRLoader {
    constructor(ctx, ...args) {
        this.config = {};
        this.config = ctx.context;
        this.setup();
    }
    setup() {
    }
    // 调用这个方法发起 xml请求
    loadManifest(config) {
        // 传入一个 config， config包括请求的结果处理函数，以及请求request参数，间接的传给xhr，增加代码的灵活度
        let request = config.request;
        let xhr = new XMLHttpRequest();
        if (request.header) {
            for (let key in request.header) {
                xhr.setRequestHeader(key, request.header[key]);
            }
        }
        xhr.open(request.method || "get", request.url);
        xhr.responseType = request.responseType || "arraybuffer";
        xhr.onreadystatechange = (e) => {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status === 304)) {
                    config.success && config.success.call(xhr, xhr.response);
                }
                else {
                    config.error && config.error.call(xhr, e);
                }
            }
        };
        xhr.onabort = (e) => {
            config.abort && config.abort.call(xhr, e);
        };
        xhr.onerror = (e) => {
            config.error && config.error.call(xhr, e);
        };
        xhr.onprogress = (e) => {
            config.progress && config.progress.call(xhr, e);
        };
        xhr.send();
    }
}
const XHRLoaderFactory = FactoryMaker.getSingleFactory(XHRLoader);

class EventBus {
    constructor(ctx, ...args) {
        this.config = {};
        // _events 对象， 对象键为 string ，值为 array， array由回调函数和，范围对象构成
        this.__events = {};
        this.config = ctx.context;
        this.setup();
    }
    setup() {
    }
    // 订阅 scope 是回调函数执行的上下文 在后期执行时调用 call(scope,...args)
    on(type, listener, scope) {
        if (!this.__events[type]) {
            this.__events[type] = [
                {
                    cb: listener,
                    scope: scope
                }
            ];
            console.log(this.__events[type]);
            return;
        }
        if (this.__events[type].filter(event => {
            return event.scope === scope && event.cb === listener;
        })) {
            throw new Error("请勿重复绑定监听器");
        }
        this.__events[type].push({
            cb: listener,
            scope
        });
    }
    // 取消订阅
    off(type, listener, scope) {
        if (!this.__events[type] || this.__events[type].filter(event => {
            return event.scope === scope && event.cb === listener;
        })) {
            throw new Error("不存在该事件");
        }
        // filter过滤
        this.__events[type] = this.__events[type].filter(event => {
            return event.scope === scope && event.cb === listener;
        });
    }
    // 发布
    tigger(type, ...payload) {
        console.log(this.__events);
        if (this.__events[type]) {
            this.__events[type].forEach(event => {
                event.cb.call(event.scope, ...payload);
            });
        }
    }
}
const EventBusFactory = FactoryMaker.getSingleFactory(EventBus);

// 事件常数
const EventConstants = {
    MANIFEST_LOADED: "manifestLoaded" // mpd文件资源请求完毕之后的函数
};

// urlLoader 在发起xhr请求之前配置相关参数
class URLLoader {
    constructor(ctx, ...args) {
        this.config = {};
        this.config = ctx.context;
        this.setup();
    }
    // 这个函数调用 xhrLoader.loadManifest 发起请求
    _loadManifest(config) {
        this.xhrLoader.loadManifest(config);
    }
    setup() {
        // 拿到的instance就是 xhrloader 的实例
        this.xhrLoader = XHRLoaderFactory({}).getInstance();
        this.eventBus = EventBusFactory({}).getInstance();
    }
    // 每调用一次load函数就发送一次请求
    load(config) {
        //一个HTTPRequest对象才对应一个请求
        let request = new HTTPRequest(config);
        let ctx = this;
        this._loadManifest({
            request: request,
            success: function (data) {
                request.getResponseTime = new Date().getTime();
                console.log(this, data);
                // 在请求完成之后，触发 MANIFEST_LOADED 的事件
                ctx.eventBus.tigger(EventConstants.MANIFEST_LOADED, data);
            },
            error: function (error) {
                console.log(this, error);
            }
        });
    }
}
const URLLoaderFactory = FactoryMaker.getSingleFactory(URLLoader);

var DomNodeTypes;
(function (DomNodeTypes) {
    DomNodeTypes[DomNodeTypes["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    DomNodeTypes[DomNodeTypes["TEXT_NODE"] = 3] = "TEXT_NODE";
    DomNodeTypes[DomNodeTypes["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
    DomNodeTypes[DomNodeTypes["COMMENT_NODE"] = 8] = "COMMENT_NODE";
    DomNodeTypes[DomNodeTypes["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
})(DomNodeTypes || (DomNodeTypes = {}));

class SegmentTemplateParser {
    constructor(ctx, ...args) {
        this.config = ctx.context;
        this.setup();
    }
    setup() {
    }
}
const factory$2 = FactoryMaker.getSingleFactory(SegmentTemplateParser);

// DashParser 调用 new实例 的 parse方法 会返回 对应string的 节点解析数据
class DashParser {
    constructor(ctx, ...args) {
        this.config = {};
        this.templateReg = /\$(.+)?\$/;
        this.config = ctx.context;
        this.setup();
    }
    setup() {
        this.segmentTemplateParser = factory$2({}).getInstance();
    }
    string2xml(s) {
        // DOMParser 提供将XML或HTML源代码从字符串解析成DOM文档的能力。
        let parser = new DOMParser();
        return parser.parseFromString(s, "text/xml");
    }
    // 将string转换为 MpdDocument 或者 Mpd
    parse(manifest) {
        let xml = this.string2xml(manifest);
        let Mpd;
        // 将 dom类型的 xml转换成 mpd
        if (this.config.override) {
            Mpd = this.parseDOMChildren("Mpd", xml);
        }
        else {
            Mpd = this.parseDOMChildren("MpdDocument", xml);
        }
        this.mergeNodeSegementTemplate(Mpd);
        return Mpd;
    }
    // 根据节点类型进行分类 将 Dom 类型的数据 通过递归的转换子节点，最后返回一个result的树状对象
    parseDOMChildren(name, node) {
        // 如果node的类型为文档类型 9
        if (node.nodeType === DomNodeTypes.DOCUMENT_NODE) {
            let result = {
                tag: node.nodeName,
                __children: []
            };
            // 
            for (let index in node.childNodes) {
                // 文档类型的节点一定只有一个子节点
                if (node.childNodes[index].nodeType === DomNodeTypes.ELEMENT_NODE) {
                    // 忽略更节电  如果在配置指定需要忽略根节点的话，也就是忽略MpdDocument节点
                    if (!this.config.ignoreRoot) {
                        // 递归传递
                        result.__children[index] = this.parseDOMChildren(node.childNodes[index].nodeName, node.childNodes[index]);
                        result[node.childNodes[index].nodeName] = this.parseDOMChildren(node.childNodes[index].nodeName, node.childNodes[index]);
                    }
                    else {
                        // 文本节点，parseDOMChildren 只有一个子直接返回
                        return this.parseDOMChildren(node.childNodes[index].nodeName, node.childNodes[index]);
                    }
                }
            }
            return result;
        }
        else if (node.nodeType === DomNodeTypes.ELEMENT_NODE) {
            let result = {
                tag: node.nodeName,
                __children: [],
            };
            // 1.解析node的子节点
            for (let index = 0; index < node.childNodes.length; index++) {
                let child = node.childNodes[index];
                result.__children[index] = this.parseDOMChildren(child.nodeName, child);
                // 下面3if是将同名的节点（同类型）放到一个数组里面
                if (!result[child.nodeName]) {
                    result[child.nodeName] = this.parseDOMChildren(child.nodeName, child);
                    continue;
                }
                if (result[child.nodeName] && !Array.isArray(result[child.nodeName])) {
                    result[child.nodeName] = [result[child.nodeName]];
                }
                if (result[child.nodeName]) {
                    result[child.nodeName].push(this.parseDOMChildren(child.nodeName, child));
                }
            }
            // 将result遍历完后 将result上所有内容进行遍历, 将对应的nodename 全部转换为 nodeName__asArray模式，并全部转为对象
            for (let key in result) {
                if (key !== "tag" && key !== "__children") {
                    result[key + "_asArray"] = Array.isArray(result[key]) ? [...result[key]] : [result[key]];
                }
            }
            // 3.如果该Element节点中含有text节点，则需要合并为一个整体
            result["#text_asArray"] && result["#text_asArray"].forEach(text => {
                result.__text = result.__text || "";
                result.__text += `${text.text}/n`;
            });
            // 2.解析node上挂载的属性
            for (let prop of node.attributes) {
                result[prop.name] = prop.value;
            }
            return result; //最终返回的result中有tag 有nodename组成的数组，有属性
        }
        else if (node.nodeType === DomNodeTypes.TEXT_NODE) {
            return {
                tag: "#text",
                text: node.nodeValue
            };
        }
    }
    ;
    // 将 SegementTemplate 放到子节点当中， 在转换好的 树状dom文件中 找到 SegmentTemplate 调用下面的mergeNode把一层层的SegmentTemplate汇总起来
    mergeNodeSegementTemplate(Mpd) {
        let segmentTemplate = null;
        Mpd["Period_asArray"].forEach(Period => {
            if (Period["SegmentTemplate_asArray"]) {
                // 取[0]是因为他们 template只能在第一位
                segmentTemplate = Period["SegmentTemplate_asArray"][0];
            }
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                let template = segmentTemplate;
                // 这一步把 segmentTemplate 放到 adaptionset里面 
                if (segmentTemplate) {
                    this.mergeNode(AdaptationSet, segmentTemplate);
                }
                // 再把 segmentTemplate 拿出来
                if (AdaptationSet["SegmentTemplate_asArray"]) {
                    segmentTemplate = AdaptationSet["SegmentTemplate_asArray"][0];
                }
                // 这一步再把 segmentTemplate 放到 Representation上面
                AdaptationSet["Representation_asArray"].forEach(Representation => {
                    if (segmentTemplate) {
                        this.mergeNode(Representation, segmentTemplate);
                    }
                });
                segmentTemplate = template;
            });
        });
    }
    mergeNode(node, compare) {
        // 合并规则：有相同tag时 有的属性按 node，没有的属性按compare，
        //          node上面没有时，全用compare
        if (node[compare.tag]) {
            let target = node[`${compare.tag}_asArray`];
            target.forEach(element => {
                for (let key in compare) {
                    if (!element.hasOwnProperty(key)) {
                        element[key] = compare[key];
                    }
                }
            });
        }
        else {
            node[compare.tag] = compare;
            node.__children = node.__children || [];
            node.__children.push(compare);
            node[`${compare.tag}__asArray`] = [compare];
        }
    }
    // 将进过merge后的SegementTemplate，转换为真是的路由地址
    parseNodeSegmentTemplate(Mpd) {
        Mpd["Period_asArray"].forEach(Period => {
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
                AdaptationSet["Representation_asArray"].forEach(Representation => {
                    let SegmentTemplate = Representation["SegmentTemplate"];
                    this.generateInitializationURL(SegmentTemplate, Representation);
                    this.generateMediaURL(SegmentTemplate, Representation);
                });
            });
        });
    }
    // 通过匹配替换的方式 在 上层注入initializationURL
    generateInitializationURL(SegmentTemplate, parent) {
        let initialization = SegmentTemplate.initialization;
        SegmentTemplate.media;
        let r;
        let formatArray = new Array();
        let replaceArray = new Array();
        if (this.templateReg.test(initialization)) {
            while (r = this.templateReg.exec(initialization)) {
                formatArray.push(r[0]);
                if (r[1] === "Number") {
                    r[1] = "1";
                }
                else if (r[1] === "RepresentationID") {
                    r[1] = parent.id;
                }
                replaceArray.push(r[1]);
            }
            let index = 0;
            while (index < replaceArray.length) {
                initialization.replace(formatArray[index], replaceArray[index]);
                index++;
            }
        }
        parent.initializationURL = initialization;
    }
    generateMediaURL(SegmentTemplate, parent) {
        SegmentTemplate.media;
        new Array();
        new Array();
    }
}
const DashParserFactory = FactoryMaker.getSingleFactory(DashParser);

class URLNode {
    constructor(url) {
        this.children = [];
        this.url = url || null;
    }
    setChild(index, child) {
        this.children[index] = child;
    }
    getChild(index) {
        return this.children[index];
    }
}
class BaseURLParser {
    constructor(ctx, ...args) {
        this.config = {};
        this.config = ctx.context;
        this.setup();
    }
    setup() { }
    // 返回URLNode 
    parseManifestForBaseURL(manifest) {
        let root = new URLNode(null);
        //1. 一层层遍历每一个Period,AdaptationSet,Representation，规定BaseURL节点只可能出现在Period,AdaptationSet,Representation中
        manifest["Period_asArray"].forEach((p, pId) => {
            let url = null;
            if (p["BaseURL_asArray"]) {
                url = p["BaseURL_asArray"][0];
            }
            let periodNode = new URLNode(url);
            root.setChild(pId, periodNode);
            p["AdaptationSet_asArray"].forEach((a, aId) => {
                let url = null;
                if (a["BaseURL_asArray"]) {
                    url = a["BaseURL_asArray"][0];
                }
                let adaptationSetNode = new URLNode(url);
                periodNode.setChild(aId, adaptationSetNode);
                a["Representation_asArray"].forEach((r, rId) => {
                    let url = null;
                    if (r["BaseURL_asArray"]) {
                        url = r["BaseURL_asArray"][0];
                    }
                    let representationNode = new URLNode(url);
                    adaptationSetNode.setChild(rId, representationNode);
                });
            });
        });
        // 全部遍历完后返回URLNode构成的节点
        return root;
    }
    getBaseURLByPath(path, urlNode) {
        let baseURL = "";
        let root = urlNode;
        for (let i = 0; i < path.length; i++) {
            if (path[i] >= root.children.length || path[i] < 0) {
                throw new Error("传入的路径不正确");
            }
            baseURL += root.children[path[i]].url;
            root = root.children[path[i]];
        }
        // 遍历到最后一层时 root 的child应该为空，不能再有值
        if (root.children.length > 0) {
            throw new Error("传入的路径不正确");
        }
        return baseURL;
    }
}
const factory$1 = FactoryMaker.getSingleFactory(BaseURLParser);

/**
 * @description 整个dash处理流程的入口类MediaPlayer
 */
class MediaPlayer {
    constructor(ctx, ...args) {
        this.config = {};
        this.config = ctx.context;
        this.setup();
        this.initializeEvent();
    }
    // 初始化类
    setup() {
        this.urlLoader = URLLoaderFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        // ignoreRoot -> 忽略Document节点，从MPD开始作为根节点
        this.dashParser = DashParserFactory({ ignoreRoot: true }).getInstance();
        this.baseURLParser = factory$1().getInstance();
    }
    initializeEvent() {
        this.eventBus.on(EventConstants.MANIFEST_LOADED, this.onManifestLoaded, this);
    }
    //MPD文件请求成功获得对应的data数据
    onManifestLoaded(data) {
        let manifest = this.dashParser.parse(data);
        console.log(manifest);
        this.baseURLPath = this.baseURLParser.parseManifestForBaseURL(manifest);
        console.log(this.baseURLPath);
    }
    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url
     */
    attachSource(url) {
        this.urlLoader.load({ url, responseType: 'text' });
    }
}
const factory = FactoryMaker.getClassFactory(MediaPlayer);

// 以下注释部分全部弃用
class MpdPlayer {
    constructor(player) {
        let mediaPlayer = factory().create();
        mediaPlayer.attachSource(player.playerOptions.url);
    }
}

class Player extends BaseEvent {
    constructor(options) {
        super();
        this.playerOptions = {
            url: "",
            autoplay: false,
            width: "100%",
            height: "100%",
        };
        this.playerOptions = Object.assign(this.playerOptions, options);
        this.init();
        this.initComponent();
        this.initContainer();
        // this.initEvent()
        if (getFileExtension(this.playerOptions.url) === "mp4") {
            new Mp4Player(this);
        }
        else if (getFileExtension(this.playerOptions.url) === "mpd") {
            new MpdPlayer(this);
        }
    }
    ;
    init() {
        let container = this.playerOptions.container;
        if (!this.isTagValidate(container)) {
            $warn("你传入的容器的元素类型不适合，建议传入块元素或者行内块元素，拒绝传入具有交互类型的元素例如input框等表单类型的元素");
        }
        this.container = container;
    }
    ;
    /**
     * @description 初始化播放器上的各种组件实例
     */
    initComponent() {
        this.toolbar = new ToolBar(this.container);
        this.loadingMask = new LoadingMask(this.container);
        this.errorMask = new ErrorMask(this.container);
    }
    ;
    initContainer() {
        this.container.style.width = this.playerOptions.width;
        this.container.style.height = this.playerOptions.height;
        this.container.className = styles['video-container'];
        this.container.innerHTML = `
            <div class="${styles["video-wrapper"]}">
                <video></video>
            </div>
        `;
        this.container.appendChild(this.toolbar.template);
        this.video = this.container.querySelector("video");
        // video的宽高改为 容器的 content+padding
        this.video.height = this.container.clientHeight;
        this.video.width = this.container.clientWidth;
    }
    ;
    // 判定元素是否为合理的元素  不可以是行内元素和可交互的行内块级元素
    isTagValidate(ele) {
        //window.getComputedStyle 获取元素的css样式 只读
        if (window.getComputedStyle(ele).display === 'block')
            return true;
        if (window.getComputedStyle(ele).display === 'inline')
            return false;
        if (window.getComputedStyle(ele).display === 'inline-block') {
            if (ele instanceof HTMLImageElement ||
                ele instanceof HTMLAudioElement ||
                ele instanceof HTMLVideoElement ||
                ele instanceof HTMLInputElement ||
                ele instanceof HTMLCanvasElement ||
                ele instanceof HTMLButtonElement) {
                return false;
            }
            return true;
        }
        return true;
    }
}

//  格式化播放时间工具
function addZero(num) {
    return num > 9 ? "" + num : "0" + num;
}
function formatTime(seconds) {
    seconds = Math.floor(seconds);
    let minute = Math.floor(seconds / 60);
    let second = seconds % 60;
    return addZero(minute) + ":" + addZero(second);
}
// 将 Time 类型的时间转换为秒
function switchToSeconds(time) {
    if (!time) {
        return null;
    }
    let sum = 0;
    if (time.hours)
        sum += time.hours * 3600;
    if (time.minutes)
        sum += time.minutes * 60;
    if (time.seconds)
        sum += time.seconds;
    return sum;
}
// 解析MPD文件的时间字符串
// Period 的 start 和 duration 属性使用了 NPT 格式表示该期间的开始时间和持续时间，即 PT0S 和 PT60S
function parseDuration(pt) {
    // NPT 格式的字符串以 PT 开头，后面跟着一个时间段的表示，例如 PT60S 表示 60 秒的时间段。时间段可以包含以下几个部分：
    // H: 表示小时。
    // M: 表示分钟。
    // S: 表示秒。
    // F: 表示帧数。
    // T: 表示时间段的开始时间。
    // if (!pt) {
    //     return null
    // }
    let hours = 0, minutes = 0, seconds = 0;
    for (let i = pt.length - 1; i >= 0; i--) {
        if (pt[i] === "S") {
            let j = i;
            while (pt[i] !== "M" && pt[i] !== "H" && pt[i] !== "T") {
                i--;
            }
            i += 1;
            seconds = parseInt(pt.slice(i, j));
        }
        else if (pt[i] === "M") {
            let j = i;
            while (pt[i] !== "H" && pt[i] !== "T") {
                i--;
            }
            i += 1;
            minutes = parseInt(pt.slice(i, j));
        }
        else if (pt[i] === "H") {
            let j = i;
            while (pt[i] !== "T") {
                i--;
            }
            i += 1;
            hours = parseInt(pt.slice(i, j));
        }
    }
    return {
        hours,
        minutes,
        seconds,
    };
}

/**
 * @description 类型守卫函数
 */
function checkMediaType(s) {
    if (!s) {
        return true;
    }
    return (s === "video/mp4" ||
        s === "audio/mp4" ||
        s === "text/html" ||
        s === "text/xml" ||
        s === "text/plain" ||
        s === "image/png" ||
        s === "image/jpeg");
}
/**
 * @description 类型守卫函数 ---> 以下都是通过tag进行判断
 */
function checkBaseURL(s) {
    if (s.tag === "BaseURL" && typeof s.url === "string")
        return true;
    return false;
}
/**
 * @description 类型守卫函数
 */
function checkAdaptationSet(s) {
    if (s.tag === "AdaptationSet")
        return true;
    return false;
}
/**
 * @description 类型守卫函数
 */
function checkSegmentTemplate(s) {
    return s.tag === "SegmentTemplate";
}
/**
 * @description 类型守卫函数
 */
function checkRepresentation(s) {
    return s.tag === "Representation";
}
/**
 * @description 类型守卫函数
 */
function checkSegmentList(s) {
    return s.tag === "SegmentList";
}
function checkInitialization(s) {
    return s.tag === "Initialization";
}
function checkSegmentURL(s) {
    return s.tag === "SegmentURL";
}
function checkSegmentBase(s) {
    return s.tag === "SegmentBase";
}
// 检查工具
let checkUtils = {
    checkMediaType,
    checkBaseURL,
    checkAdaptationSet,
    checkSegmentTemplate,
    checkRepresentation,
    checkSegmentList,
    checkInitialization,
    checkSegmentURL,
    checkSegmentBase
};
// 如果是上面的类型的标签返回true，否则返回false
function findSpecificType(array, type) {
    array.forEach(item => {
        if (checkUtils[`check${type}`] && checkUtils[`check${type}`].call(this, item)) {
            return true;
        }
    });
    return false;
}

function string2boolean(s) {
    if (s === "true") {
        return true;
    }
    else if (s === "false") {
        return false;
    }
    else {
        return null;
    }
}
function string2number(s) {
    let n = Number(s);
    if (!isNaN(n))
        return n;
    else
        return null;
}

// 一下部分在 v1.0.0之后都更新弃用了
// export * from "./dash/initMpd";  
// export * from "./dash/parseMpd"
// export * from "./types/AxiosRequest"
// export * from "./axios/Axios"
console.log('hello');

export { $warn, BaseEvent, Controller, ErrorMask, LoadingMask, Player, Progress, ToolBar, addZero, checkAdaptationSet, checkBaseURL, checkInitialization, checkMediaType, checkRepresentation, checkSegmentBase, checkSegmentList, checkSegmentTemplate, checkSegmentURL, checkUtils, findSpecificType, formatTime, icon, parseDuration, string2boolean, string2number, styles, switchToSeconds };
