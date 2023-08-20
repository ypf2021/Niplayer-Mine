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

function getDOMPoint(dom) {
    var t = 0;
    var l = 0;
    //判断是否有父容器，如果存在则累加其边距
    while (dom !== document.body) {
        t += dom.offsetTop; //叠加父容器的上边距
        l += dom.offsetLeft; //叠加父容器的左边距
        //if(dom.style.borderLeftWidth) l += Number(dom.style.borderLeftWidth);
        //if(dom.style.borderTopWidth) t += Number(dom.style.borderTopWidth);
        dom = dom.parentNode;
    }
    return { x: l, y: t };
}
/**
 * @description 查看当前的鼠标位置是否在父元素和绝对定位的子元素的组合范围内，如果超出则返回false
 * @param parent
 * @param topChild
 * @param pageX
 * @param pageY
 * @returns {boolean}
 */
function checkIsMouseInRange(parent, topChild, pageX, pageY) {
    let { x, y } = getDOMPoint(parent);
    let allTop = y - parseInt(topChild.style.bottom) - topChild.clientHeight;
    let allBottom = y + parent.clientHeight;
    let allLeft = x + Math.round(parent.clientWidth / 2) - Math.round(topChild.clientWidth / 2);
    let allRight = x + Math.round(parent.clientWidth / 2) + Math.round(topChild.clientWidth / 2);
    let parentLeft = x;
    let parentRight = x + parent.clientWidth;
    if (pageX >= allLeft && pageX <= allRight && pageY <= y && pageY >= allTop)
        return true;
    if (pageX >= parentLeft - 5 && pageX <= parentRight + 5 && pageY >= y && pageY <= allBottom)
        return true;
    return false;
}
// 用于匹配 HTML/CSS 类选择器的模式 匹配 element #id .class element#id element.class element#id.class
const SELECTOR_REG = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/;
/**
 * @description 根据desc的标签描述和props的属性描述来创建一个DOM对象，并且在实例上挂载各种属性
 * @param {string} desc
 * @param {DOMProps} props
 * @param {Node[]} children
 * @returns
 */
function $(desc, props, children) {
    let match = [];
    let regArray = SELECTOR_REG.exec(desc);
    match[0] = regArray[1] || undefined; // element
    match[1] = regArray[2] || undefined; // #
    match[2] = regArray[3] || undefined; // .
    let el = match[0] ? document.createElement(match[0]) : document.createElement("div");
    if (match[1]) {
        el.id = match[1];
    }
    match[2] && addClass(el, [match[2]]);
    // 添加属性， 对象先考虑是 style的情况
    for (let key in props) {
        if (typeof props[key] === "object") {
            if (key === "style") {
                let str = "";
                let styles = props[key];
                for (let k in styles) {
                    str += `${k}: ${styles[k]};`;
                }
                el.setAttribute("style", str);
            }
        }
        else {
            el.setAttribute(key, String(props[key]));
        }
    }
    // 如果child是 string 一般是文本节点 
    if (typeof children === "string") {
        el.innerHTML += children;
    }
    else if (children) {
        for (let child of children) {
            el.appendChild(child.el);
        }
    }
    return el;
}
function addClass(dom, classNames) {
    let classList = dom.classList;
    for (let name of classNames) {
        if (!includeClass(dom, name)) {
            classList.add(name);
        }
    }
}
function includeClass(dom, className) {
    let classList = dom.classList;
    for (let key in classList) {
        if (classList[key] === className)
            return true;
    }
    return false;
}
function removeClass(dom, classNames) {
    let classList = dom.classList;
    classList.remove(...classNames);
}
function getElementSize(dom) {
    // 深度克隆，连带子节点
    const clone = dom.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.opacity = '0';
    clone.removeAttribute('hidden');
    const parent = dom.parentNode || document.body;
    parent.appendChild(clone);
    // 用于获取指定元素相对于视口（viewport）的位置信息。它返回一个 DOMRect 对象，其中包含了元素的位置、尺寸和其他相关信息。 rect.x, y , width. height ,right , bottom
    const rect = clone.getBoundingClientRect();
    parent.removeChild(clone);
    return rect;
}
// SVG相关
const svgNS = 'http://www.w3.org/2000/svg';
function createSvg(d, viewBox = '0 0 1024 1024') {
    // NS代表XML结构的 命名空间 xmlns="http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    if (d) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttributeNS(null, 'd', d);
        svg.appendChild(path);
    }
    return svg;
}
function createSvgs(d, viewBox = '0 0 1024 1024') {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    for (let str of d) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttributeNS(null, 'd', str);
        svg.appendChild(path);
    }
    return svg;
}

/**
 *
 * @description 创建dom并挂载到container
 * @export
 * @class Component
 * @extends {BaseEvent}
 */
class Component extends BaseEvent {
    constructor(container, desc, props, children) {
        super();
        let dom = $(desc, props, children);
        this.el = dom;
        // 用于向指定元素的子节点列表末尾添加一个或多个节点对象或文本节点。
        container.append(dom);
    }
}

// 音乐播放器的工具栏组件 ( progress + controller )
// export class ToolBar extends Component implements ComponentItem {
//     private template_!: HTMLElement;
//     private progress!: Progress;
//     private controller!: Controller;
//     private container!: HTMLElement;
//     private video!: HTMLVideoElement;
//     private timer!: null | number
//     constructor(container: HTMLElement) {
//         super()
//         this.container = container
//         this.init();
//         this.initComponent();
//         this.initTemplate();
//         this.initEvent();
//     }
//     get template(): HTMLElement {
//         return this.template_
//     };
//     init(): void { }
//     // 注册 进度条 和 控制器
//     initComponent() {
//         this.progress = new Progress(this.container) // 进度条
//         this.controller = new Controller(this.container) //下面的控制器
//     }
//     // 组合 进度条 和 控制器的template
//     initTemplate() {
//         let div = document.createElement("div")
//         div.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
//         div.innerHTML += this.progress.template as string;
//         div.innerHTML += this.controller.template as string;
//         this.template_ = div
//     }
//     // 显示和隐藏toolbar
//     showToolBar(e: MouseEvent) {
//         //工具栏的总容器
//         this.container.querySelector(
//             `.${styles["video-controls"]}`
//         )!.className = `${styles["video-controls"]}`;
//         if (e.target !== this.video) {
//             // do nothing
//         } else {
//             // 一个防抖
//             this.timer = window.setTimeout(() => {
//                 this.hideToolBar()
//             }, 3000)
//         }
//     }
//     hideToolBar() {
//         this.container.querySelector(
//             `.${styles["video-controls"]}`
//         )!.className = `${styles["video-controls"]} ${styles["video-controls-hidden"]}`;
//     }
//     initEvent() {
//         this.on("showtoolbar", (e: MouseEvent) => {
//             // 防抖
//             if (this.timer) {
//                 clearTimeout(this.timer);
//                 this.timer = null
//             }
//             this.showToolBar(e)
//         });
//         this.on("hidetoolbar", () => {
//             this.hideToolBar()
//         });
//         this.on("loadedmetadata", (summary: number) => {
//             this.controller.emit("loadedmetadata", summary);
//             this.progress.emit("loadedmetadata", summary);
//         });
//         this.on("timeupdate", (current: number) => {
//             this.controller.emit("timeupdate", current);
//             this.progress.emit("timeupdate", current);
//         });
//         this.on("mounted", () => {
//             this.video = this.container.querySelector("video")!;
//             this.controller.emit("mounted");
//             this.progress.emit("mounted")
//         });
//         this.on("play", () => {
//             this.controller.emit("play")
//         })
//         this.on("pause", () => {
//             this.controller.emit("pause")
//         })
//     }
// }
class ToolBar extends Component {
    // 先初始化播放器的默认样式，暂时不考虑用户的自定义样式
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Toolbar";
        this.timer = 0;
        this.player = player;
        this.props = props;
        this.init();
    }
    init() {
        this.initTemplate();
        this.initComponent();
        this.initEvent();
    }
    /**
    * @description 需要注意的是此处元素的class名字是官方用于控制整体toolbar一栏的显示和隐藏
    */
    initTemplate() {
        addClass(this.el, ["video-controls", "video-controls-hidden"]);
    }
    initEvent() {
        this.player.on("showtoolbar", (e) => {
            this.onShowToolBar(e);
        });
        this.player.on("hidetoolbar", (e) => {
            this.onHideToolBar(e);
        });
    }
    initComponent() {
        this.progress = new Progress(this.player, this.el, "div.video-progress");
        this.controller = new Controller(this.player, this.el, "div.video-play");
    }
    hideToolBar() {
        if (!includeClass(this.el, "video-controls-hidden")) {
            addClass(this.el, ["video-controls-hidden"]);
        }
    }
    showToolBar(e) {
        if (includeClass(this.el, "video-controls-hidden")) {
            removeClass(this.el, ["video-controls-hidden"]);
        }
        if (e.target === this.player.video) {
            this.timer = window.setTimeout(() => {
                this.hideToolBar();
            }, 3000);
        }
    }
    onShowToolBar(e) {
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
        this.showToolBar(e);
    }
    onHideToolBar(e) {
        this.hideToolBar();
    }
}

class Dot extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Dot";
        this.props = props;
        this.player = player;
        this.init();
    }
    init() {
        addClass(this.el, ["video-dot", "video-dot-hidden"]);
        this.initEvent();
    }
    initEvent() {
        this.player.on("progress-mouseenter", (e) => {
            this.onShowDot(e);
        });
        this.player.on("progress-mouseleave", (e) => {
            this.onHideDot(e);
        });
        this.player.on("progress-click", (e, ctx) => {
            this.onChangePos(e, ctx);
        });
    }
    onShowDot(e) {
        if (includeClass(this.el, "video-dot-hidden")) {
            removeClass(this.el, ["video-dot-hidden"]);
        }
    }
    onHideDot(e) {
        if (!includeClass(this.el, "video-dot-hidden")) {
            addClass(this.el, ["video-dot-hidden"]);
        }
    }
    onChangePos(e, ctx) {
        e.offsetX / ctx.el.offsetWidth;
        this.el.style.left = e.offsetX - getElementSize(this.el).width / 2 + 'px';
    }
}

// 经过的进度条
class CompletedProgress extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "CompletedProgress";
        this.props = props;
        this.player = player;
        this.init();
    }
    init() {
        this.initEvent();
    }
    initEvent() {
        this.player.on("progress-click", (e, ctx) => {
            this.onChangeSize(e, ctx);
        });
    }
    onChangeSize(e, ctx) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        }
        else if (scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }
}

class BufferedProgress extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "BufferedProgress";
        this.props = props;
        this.player = player;
        this.init();
    }
    init() {
        this.initEvent();
    }
    initEvent() {
        this.player.on("progress-click", (e, ctx) => {
            this.onChangeWidth(e, ctx);
        });
    }
    onChangeWidth(e, ctx) {
        let scale = e.offsetX / ctx.el.offsetWidth;
        if (scale < 0) {
            scale = 0;
        }
        else if (scale > 1) {
            scale = 1;
        }
        this.el.style.width = scale * 100 + "%";
    }
}

// id 和 el是必须的元素
class Progress extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Progress";
        this.mouseDown = false;
        this.player = player;
        this.init();
    }
    init() {
        this.initComponent();
        this.initEvent();
    }
    initComponent() {
        this.dot = new Dot(this.player, this.el, "div");
        this.completedProgress = new CompletedProgress(this.player, this.el, "div.video-completed");
        this.bufferedProgress = new BufferedProgress(this.player, this.el, "div.video-buffered");
    }
    initEvent() {
        this.el.onmouseenter = (e) => {
            this.player.emit("progress-mouseenter", e, this);
        };
        this.el.onmouseleave = (e) => {
            this.player.emit("progress-mouseleave", e, this);
        };
        this.el.onclick = (e) => {
            this.player.emit("progress-click", e, this);
        };
    }
}

class Player extends Component {
    constructor(options) {
        super(options.container, "div.video-wrapper");
        this.id = "Player";
        this.playerOptions = {
            url: "",
            autoplay: false,
            width: "100%",
            height: "100%",
        };
        this.playerOptions = Object.assign(this.playerOptions, options);
        this.container = options.container;
        console.log("playerOptions", this.playerOptions);
        options.container.className = "video-container";
        options.container.style.width = this.playerOptions.width + "px";
        options.container.style.height = this.playerOptions.height + "px";
        this.init();
    }
    init() {
        this.video = $("video");
        this.video.src = this.playerOptions.url || "";
        this.el.appendChild(this.video);
        this.toolBar = new ToolBar(this, this.el, "div");
        this.initEvent();
    }
    initEvent() {
        this.el.onmousemove = (e) => {
            this.emit("showtoolbar", e);
        };
        this.el.onmouseenter = (e) => {
            this.emit("showtoolbar", e);
        };
        this.el.onmouseleave = (e) => {
            this.emit("hidetoolbar", e);
        };
        this.video.onloadedmetadata = (e) => {
            this.emit("loadedmetadata", e);
        };
        this.video.ontimeupdate = (e) => {
            this.emit("timeupdate", e);
        };
        this.video.onplay = (e) => {
            this.emit("play", e);
        };
        this.video.onpause = (e) => {
            this.emit("pause", e);
        };
        this.on("progress-click", (e, ctx) => {
            let scale = e.offsetX / ctx.el.offsetWidth;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            this.video.currentTime = Math.floor(scale * this.video.duration);
            this.video.paused && this.video.play();
        });
    }
    attendSource(url) {
        this.video.src = url;
    }
}

// SVG相关path
const playPath = "M254.132978 880.390231c-6.079462 0-12.155854-1.511423-17.643845-4.497431-11.828396-6.482645-19.195178-18.85851-19.195178-32.341592L217.293955 180.465165c0-13.483082 7.366781-25.898857 19.195178-32.346709 11.787464-6.483668 26.226315-5.928013 37.57478 1.363044L789.797957 481.028615c10.536984 6.77531 16.908088 18.456351 16.908088 30.979572 0 12.523221-6.371104 24.203238-16.908088 30.982642L274.063913 874.53385C267.983427 878.403994 261.060761 880.390231 254.132978 880.390231L254.132978 880.390231zM254.132978 880.390231";
const pausePath = "M304 176h80v672h-80zM712 176h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z";
const volumePath$1 = "M318.577778 352.711111h-156.444445c-31.288889 0-56.888889 25.6-56.888889 56.888889v206.222222c0 31.288889 25.6 56.888889 56.888889 56.888889h156.444445L512 866.133333c27.022222 27.022222 72.533333 8.533333 72.533333-29.866666V187.733333c0-38.4-45.511111-56.888889-72.533333-29.866666L318.577778 352.711111z m210.488889 448L359.822222 631.466667c-11.377778-11.377778-25.6-17.066667-39.822222-17.066667h-156.444444V409.6h156.444444c15.644444 0 29.866667-5.688889 39.822222-17.066667l169.244445-169.244444v577.422222zM642.844444 341.333333v8.533334c0 7.111111 4.266667 14.222222 9.955556 19.911111 41.244444 34.133333 66.844444 85.333333 66.844444 142.222222s-25.6 108.088889-66.844444 142.222222c-5.688889 4.266667-9.955556 11.377778-9.955556 19.911111v8.533334c0 21.333333 24.177778 32.711111 41.244445 19.911111 56.888889-44.088889 92.444444-112.355556 92.444444-190.577778 0-76.8-35.555556-145.066667-92.444444-190.577778-17.066667-12.8-41.244444-1.422222-41.244445 19.911111z";
const volumePath$2 = "M642.844444 183.466667c0 11.377778 7.111111 21.333333 17.066667 25.6 118.044444 49.777778 201.955556 166.4 201.955556 301.511111 0 136.533333-83.911111 253.155556-201.955556 301.511111-9.955556 4.266667-17.066667 14.222222-17.066667 25.6 0 19.911111 21.333333 34.133333 39.822223 25.6 137.955556-58.311111 236.088889-194.844444 236.088889-354.133333S822.044444 213.333333 682.666667 155.022222c-18.488889-5.688889-39.822222 8.533333-39.822223 28.444445z";
const fullscreenPath = "M290 236.4l43.9-43.9c4.7-4.7 1.9-12.8-4.7-13.6L169 160c-5.1-0.6-9.5 3.7-8.9 8.9L179 329.1c0.8 6.6 8.9 9.4 13.6 4.7l43.7-43.7L370 423.7c3.1 3.1 8.2 3.1 11.3 0l42.4-42.3c3.1-3.1 3.1-8.2 0-11.3L290 236.4zM642.7 423.7c3.1 3.1 8.2 3.1 11.3 0l133.7-133.6 43.7 43.7c4.7 4.7 12.8 1.9 13.6-4.7L863.9 169c0.6-5.1-3.7-9.5-8.9-8.9L694.8 179c-6.6 0.8-9.4 8.9-4.7 13.6l43.9 43.9L600.3 370c-3.1 3.1-3.1 8.2 0 11.3l42.4 42.4zM845 694.9c-0.8-6.6-8.9-9.4-13.6-4.7l-43.7 43.7L654 600.3c-3.1-3.1-8.2-3.1-11.3 0l-42.4 42.3c-3.1 3.1-3.1 8.2 0 11.3L734 787.6l-43.9 43.9c-4.7 4.7-1.9 12.8 4.7 13.6L855 864c5.1 0.6 9.5-3.7 8.9-8.9L845 694.9zM381.3 600.3c-3.1-3.1-8.2-3.1-11.3 0L236.3 733.9l-43.7-43.7c-4.7-4.7-12.8-1.9-13.6 4.7L160.1 855c-0.6 5.1 3.7 9.5 8.9 8.9L329.2 845c6.6-0.8 9.4-8.9 4.7-13.6L290 787.6 423.7 654c3.1-3.1 3.1-8.2 0-11.3l-42.4-42.4z";
const fullscreenExitPath = "M391 240.9c-0.8-6.6-8.9-9.4-13.6-4.7l-43.7 43.7L200 146.3c-3.1-3.1-8.2-3.1-11.3 0l-42.4 42.3c-3.1 3.1-3.1 8.2 0 11.3L280 333.6l-43.9 43.9c-4.7 4.7-1.9 12.8 4.7 13.6L401 410c5.1 0.6 9.5-3.7 8.9-8.9L391 240.9zM401.1 614.1L240.8 633c-6.6 0.8-9.4 8.9-4.7 13.6l43.9 43.9L146.3 824c-3.1 3.1-3.1 8.2 0 11.3l42.4 42.3c3.1 3.1 8.2 3.1 11.3 0L333.7 744l43.7 43.7c4.7 4.7 12.8 1.9 13.6-4.7l18.9-160.1c0.6-5.1-3.7-9.4-8.8-8.8zM622.9 409.9L783.2 391c6.6-0.8 9.4-8.9 4.7-13.6L744 333.6 877.7 200c3.1-3.1 3.1-8.2 0-11.3l-42.4-42.3c-3.1-3.1-8.2-3.1-11.3 0L690.3 279.9l-43.7-43.7c-4.7-4.7-12.8-1.9-13.6 4.7L614.1 401c-0.6 5.2 3.7 9.5 8.8 8.9zM744 690.4l43.9-43.9c4.7-4.7 1.9-12.8-4.7-13.6L623 614c-5.1-0.6-9.5 3.7-8.9 8.9L633 783.1c0.8 6.6 8.9 9.4 13.6 4.7l43.7-43.7L824 877.7c3.1 3.1 8.2 3.1 11.3 0l42.4-42.3c3.1-3.1 3.1-8.2 0-11.3L744 690.4z";

class PlayButton extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "PlayButton";
        this.player = player;
        this.init();
    }
    init() {
        this.initTemplate();
        this.initEvent();
    }
    initTemplate() {
        this.pauseIcon = createSvg(pausePath);
        this.playIcon = createSvg(playPath);
        this.button = this.playIcon;
        this.el.appendChild(this.button);
    }
    initEvent() {
        // 触发播放，暂停 以及图标变换
        this.player.on("play", (e) => {
            this.el.removeChild(this.button);
            this.button = this.pauseIcon;
            this.el.appendChild(this.button);
        });
        this.player.on("pause", (e) => {
            this.el.removeChild(this.button);
            this.button = this.playIcon;
            this.el.appendChild(this.button);
        });
        this.el.onclick = (e) => {
            if (this.player.video.paused) {
                this.player.video.play();
            }
            else {
                this.player.video.pause();
            }
        };
    }
}

// 
/**
 *
 * @description 分辨率和音量需要用到的 options列表，这个类做了初始化大小和隐藏显示的功能，是两个的通用部分
 * @export
 * @class Options
 * @extends {Component}
 * @implements {ComponentItem}
 */
class Options extends Component {
    constructor(player, container, hideWidth, hideHeight, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Options";
        this.player = player;
        props ? (this.props = props) : (this.props = null);
        this.hideHeight = hideHeight;
        this.hideWidth = hideWidth;
        this.initBase();
    }
    initBase() {
        this.initBaseTemplate();
        this.initBaseEvent();
    }
    initBaseTemplate() {
        this.hideBox = $("div", { style: { display: "none" } });
        if (this.hideHeight && this.hideHeight > 0) {
            this.hideBox.style.height = this.hideHeight + 'px';
        }
        if (this.hideWidth && this.hideWidth > 0) {
            this.hideBox.style.width = this.hideWidth + 'px';
        }
        this.el.appendChild(this.hideBox);
        this.iconBox = $("div");
        this.el.appendChild(this.iconBox);
    }
    initBaseEvent() {
        this.el.onmouseenter = (e) => {
            let ctx = this;
            ctx.hideBox.style.display = "";
            document.body.onmousemove = ctx.handleMouseMove.bind(this);
        };
    }
    handleMouseMove(e) {
        let pX = e.pageX, pY = e.pageY;
        let ctx = this;
        if (!checkIsMouseInRange(ctx.el, ctx.hideBox, pX, pY)) {
            ctx.hideBox.style.display = "none";
            document.body.onmousemove = null;
        }
    }
}

class Volume extends Options {
    constructor(player, container, desc, props, children) {
        super(player, container, 0, 0, desc);
        this.id = "Volume";
        this.init();
    }
    init() {
        this.initTemplate();
        this.initEvent();
    }
    initTemplate() {
        this.el["aria-label"] = "音量";
        this.hideBox.style.bottom = "41px";
        addClass(this.hideBox, ["video-volume-set"]);
        // 进度条
        this.volumeProgress = $("div.video-volume-progress", { style: { height: "70px" } });
        this.volumeShow = $("div.video-volume-show");
        // 音量高度
        this.volumeShow.innerText = "50";
        this.volumeCompleted = new CompletedProgress(this.player, this.volumeProgress, "div.video-volume-completed");
        this.hideBox.appendChild(this.volumeShow);
        this.hideBox.appendChild(this.volumeProgress);
        addClass(this.iconBox, ["video-icon"]);
        let svg = createSvgs([volumePath$1, volumePath$2]);
        this.iconBox.appendChild(svg);
    }
    initEvent() {
        this.player.on("volume-progress-click", (e, ctx) => {
            // console.log("volumeProgress.clientHeight", this.volumeProgress.clientHeight)
            // console.log("e.pageY", e.pageY);
            // console.log("getDOMPoint(this.volumeProgress).y", getDOMPoint(this.volumeProgress).y);
            // console.log("e.offsetY", e.offsetY);
            let eoffsetY = e.pageY - getDOMPoint(this.volumeProgress).y;
            let offsetY = this.volumeProgress.clientHeight - eoffsetY;
            let scale = offsetY / this.volumeProgress.clientHeight;
            if (scale < 0) {
                scale = 0;
            }
            else if (scale > 1) {
                scale = 1;
            }
            this.volumeCompleted.el.style.height = scale * 100 + "%";
        });
        this.volumeProgress.onclick = (e) => {
            this.player.emit("volume-progress-click", e, this);
        };
    }
}

class FullScreen extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, children);
        this.id = "FullScreen";
        this.player = player;
        this.init();
    }
    init() {
        this.initTemplate();
        this.initEvent();
    }
    initTemplate() {
        addClass(this.el, ["video-fullscreen", "video-controller"]);
        this.iconBox = $("div.video-icon");
        this.icon = createSvg(fullscreenPath);
        this.iconBox.appendChild(this.icon);
        this.el.appendChild(this.iconBox);
    }
    initEvent() {
        this.el.onclick = this.onClick.bind(this);
        // addClass(this.el, ["video-fullscreen", "video-controller"]);
        // this.iconBox = $("div.video-icon");
        // this.icon = createSvg(fullscreenPath);
        // this.iconBox.appendChild(this.icon);
        // this.el.appendChild(this.iconBox);
    }
    onClick(e) {
        // document.fullscreenElement 返回当前全屏的元素
        if (this.player.container.requestFullscreen && !document.fullscreenElement) {
            this.player.container.requestFullscreen(); //该函数请求全屏
            this.iconBox.removeChild(this.icon);
            this.icon = createSvg(fullscreenExitPath);
            this.iconBox.appendChild(this.icon);
        }
        else if (document.fullscreenElement) {
            document.exitFullscreen(); //退出全屏函数仅仅绑定在document对象上，该点需要切记！！！
            this.iconBox.removeChild(this.icon);
            this.icon = createSvg(fullscreenPath);
            this.iconBox.appendChild(this.icon);
        }
    }
}

/**
 * @description 播放速率的类
 */
class Playrate extends Options {
    constructor(player, container, desc, props, children) {
        super(player, container, 0, 0, desc);
        this.id = "Playrate";
        this.init();
    }
    init() {
        this.initTemplate();
    }
    initTemplate() {
        this.el["aria-label"] = "播放倍速";
        addClass(this.el, ["video-playrate", "video-controller"]);
        this.el.removeChild(this.iconBox);
        this.iconBox = $("span", null, "倍速");
        this.el.appendChild(this.iconBox);
        this.el.removeChild(this.hideBox);
        this.hideBox = $("ul", { style: { bottom: "41px" }, "aria-label": "播放速度调节" });
        addClass(this.hideBox, ["video-playrate-set"]);
        this.el.appendChild(this.hideBox);
        for (let i = 0; i < 6; i++) {
            let li = $("li");
            li.innerText = "2.0x";
            this.hideBox.appendChild(li);
        }
    }
}

class Controller extends Component {
    constructor(player, container, desc, props, children) {
        super(container, desc, props, children);
        this.id = "Controller";
        this.player = player;
        this.init();
    }
    init() {
        this.initTemplate();
        this.initComponent();
    }
    initTemplate() {
        this.subPlay = $("div.video-subplay");
        this.settings = $("div.video-settings");
        this.el.appendChild(this.subPlay);
        this.el.appendChild(this.settings);
    }
    initComponent() {
        // 按钮挂在到了 sub-play下面
        this.playButton = new PlayButton(this.player, this.subPlay, "div.video-start-pause");
        // 按钮挂在到了 setting 下面
        this.volume = new Volume(this.player, this.settings, "div");
        this.playrate = new Playrate(this.player, this.settings, "div");
        this.fullscreen = new FullScreen(this.player, this.settings, "div");
        addClass(this.volume.el, ["video-volume", "video-controller"]);
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
    if (!pt) {
        return null;
    }
    console.log(pt);
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
function checkMpd(s) {
    if (s.tag === "MPD")
        return true;
    return false;
}
function checkPeriod(s) {
    return s.tag === "Period";
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
// export let checkUtils = {
//     checkMediaType,
//     checkBaseURL,
//     checkAdaptationSet,
//     checkSegmentTemplate,
//     checkRepresentation,
//     checkSegmentList,
//     checkInitialization,
//     checkSegmentURL,
//     checkSegmentBase
// }
// // 如果是上面的类型的标签返回true，否则返回false
// export function findSpecificType(array: Array<unknown>, type: string): boolean {
//     array.forEach(item => {
//         if (checkUtils[`check${type}`] && checkUtils[`check${type}`].call(this, item)) {
//             return true
//         }
//     })
//     return false
// }

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

console.log('hello');

export { $warn, BaseEvent, Controller, Player, Progress, ToolBar, addZero, checkAdaptationSet, checkBaseURL, checkInitialization, checkMediaType, checkMpd, checkPeriod, checkRepresentation, checkSegmentBase, checkSegmentList, checkSegmentTemplate, checkSegmentURL, formatTime, parseDuration, string2boolean, string2number, switchToSeconds };
