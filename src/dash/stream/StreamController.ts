import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd } from "../../types/dash/MpdFile";
import { AdaptationSetAudioSegmentRequest, AdaptationSetVideoSegmentRequest, MpdSegmentRequest, PeriodSegmentRequest } from "../../types/dash/Net";
import FactoryMaker from "../FactoryMaker";
import BaseURLParserFactory, { BaseURLParser, URLNode } from "../parser/BaseURLParser";
import URLUtilsFactory, { URLUtils } from "../utils/URLUtils";
import EventBusFactory, { EventBus } from "../event/EventBus";
import { EventConstants } from "../event/EventConstants";
import URLLoaderFactory, { URLLoader } from "../net/URLLoader";


// StreamController  构建请求的结构体
class StreamController {
    private config: FactoryObject = {};
    private baseURLParser: BaseURLParser;
    private baseURLPath: URLNode;
    private URLUtils: URLUtils;
    // 视频分辨率 音频采样率
    private videoResolvePower: string = "1920*1080";
    private audioResolvePower: string = "48000";
    private eventBus: EventBus;
    private urlLoader: URLLoader;
    //整个MPD文件所需要发送请求的结构体对象
    private segmentRequestStruct: MpdSegmentRequest;

    constructor(ctx: FactoryObject, ...args: any[]) {
        this.config = ctx.factory;
        console.log("StreamControllerConfig", this.config)
        this.setup();
        this.initialEvent();
    }

    setup() {
        this.baseURLParser = BaseURLParserFactory().getInstance();
        this.URLUtils = URLUtilsFactory().getInstance();
        this.eventBus = EventBusFactory().getInstance();
        this.urlLoader = URLLoaderFactory().getInstance();
    }

    initialEvent() {
        // 当 Mpd 文件解析完毕之后，回来调用这个函数
        this.eventBus.on(EventConstants.MANIFEST_PARSE_COMPLETED, this.onManifestParseCompleted, this);
    }

    /**
     * @description 根据处理好的 mainifest 构建出 请求的结构体
     * @param {Mpd} mainifest
     * @memberof StreamController
     */
    onManifestParseCompleted(mainifest: Mpd) {
        this.segmentRequestStruct = this.generateSegmentRequestStruct(mainifest);
        console.log("segmentRequestStruct", this.segmentRequestStruct);
        this.startStream(mainifest)
    }

    generateBaseURLPath(Mpd: Mpd) {
        this.baseURLPath = this.baseURLParser.parseManifestForBaseURL(Mpd as Mpd)
        console.log("parseManifestForBaseURL 返回的 URLNode", this.baseURLPath)
    }

    /**
     * @description 根据处理好的 mainifest 构建出 请求的结构体， 返回 MpdSegmentRequest
     *
     * @param {Mpd} Mpd
     * @return {*}  {(MpdSegmentRequest | void)}
     * @memberof StreamController
     */
    generateSegmentRequestStruct(Mpd: Mpd): MpdSegmentRequest {
        this.generateBaseURLPath(Mpd);  // URLNode
        console.log("parseManifestForBaseURL后的MPD", Mpd)

        // 拿到之前 dashparse中 mpd上的baseURL
        let baseURL = Mpd["baseURL"] || "";

        let mpdSegmentRequest: MpdSegmentRequest = {
            type: "MpdSegmentRequest",
            request: []
        }

        for (let i = 0; i < Mpd["Period_asArray"].length; i++) {
            let Period = Mpd["Period_asArray"][i];
            let periodSegmentRequest: PeriodSegmentRequest = {
                VideoSegmentRequest: [],
                AudioSegmentRequest: []  // 根据语言区分
            };
            for (let j = 0; j < Period["AdaptationSet_asArray"].length; j++) {
                let AdaptationSet = Period["AdaptationSet_asArray"][j];
                // 拿到的这个res 是  AdaptationSet 下 所有Representation的 resolvePower:[initializationURL,mediaURL] 组成的 对象
                let res = this.generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet, baseURL, i, j)
                if (AdaptationSet.mimeType === "video/mp4") {
                    periodSegmentRequest.VideoSegmentRequest.push({
                        type: "video",
                        video: res
                    })
                } else if (AdaptationSet.mimeType === "audio/mp4") {
                    periodSegmentRequest.AudioSegmentRequest.push({
                        lang: AdaptationSet.lang || "en",
                        audio: res
                    })
                }
            }
            mpdSegmentRequest.request.push(periodSegmentRequest);
        }
        return mpdSegmentRequest
    }

    /**
     *
     * @description 得到 AdaptationSet 下 所有Representation的 resolvePower:[initializationURL,mediaURL] 组成的 对象
     * @param {AdaptationSet} AdaptationSet
     * @return {*}  {(AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest)}
     * @memberof StreamController
     */
    generateAdaptationSetVideoOrAudioSegmentRequest(AdaptationSet: AdaptationSet, baseURL: string, i: number, j: number): AdaptationSetVideoSegmentRequest | AdaptationSetAudioSegmentRequest {
        // i j k 分别对应 Period AdaptionSet Representation 的索引
        let result = {}
        for (let k = 0; k < AdaptationSet["Representation_asArray"].length; k++) {
            let Representation = AdaptationSet["Representation_asArray"][k];
            // 合并这几个url

            let url = this.URLUtils.
                resolve(baseURL, this.baseURLParser.getBaseURLByPath([i, j, k], this.baseURLPath)); // this.baseURLPath 是那个全是null的遍历结构 
            console.log(url) // 目前这部分返回的就是 baseURL

            // 键名是对应的分辨率
            result[Representation.resolvePower] = [];
            // push 第一项就是 initailURL
            result[Representation.resolvePower].push(this.URLUtils.resolve(url, Representation.initializationURL))
            // 之后的会构成一个数组，存放的是 MediaURl
            result[Representation.resolvePower].push(Representation.mediaURL.map(item => {
                return this.URLUtils.resolve(url, item);
            }))

            // result[Representation.resolvePower] = [Representation.initializationURL, Representation.mediaURL];
        }
        return result;
    }

    startStream(Mpd: Mpd) {
        Mpd["Period_asArray"].forEach(async (p, pid) => {
            // 请求结构是按照索引顶的，就可以拿index进行请求
            let ires = await this.loadInitialSegment(pid);
            this.eventBus.tigger(EventConstants.SEGEMTN_LOADED, ires);
            // 拿到media url 的数量
            let number = this.segmentRequestStruct.request[pid].VideoSegmentRequest[0].video[this.videoResolvePower][1].length;
            for (let i = 0; i < number; i++) {
                let mres = await this.loadMediaSegment(pid, i);
                this.eventBus.tigger(EventConstants.SEGEMTN_LOADED, mres);
            }
        })
    }

    //此处的streamId标识具体的Period对象
    loadInitialSegment(streamId) {
        let stream = this.segmentRequestStruct.request[streamId]
        // 先默认选择音视频的第一个版本
        let audioRequest = stream.AudioSegmentRequest[0].audio;
        let videoRequest = stream.VideoSegmentRequest[0].video;
        return this.loadSegment(videoRequest[this.videoResolvePower][0], audioRequest[this.audioResolvePower][0])
    }

    loadMediaSegment(streamId, mediaId) {
        let stream = this.segmentRequestStruct.request[streamId];
        // 莫仍选择音视频的第一个版本
        let audioRequest = stream.AudioSegmentRequest[0].audio;
        let videoRequest = stream.VideoSegmentRequest[0].video;
        return this.loadSegment(videoRequest[this.videoResolvePower][1][mediaId], audioRequest[this.audioResolvePower][1][mediaId])
    }

    loadSegment(videoURL, audioURL) {
        let p1 = this.urlLoader.load({ url: videoURL, responseType: "arraybuffer" }, "Segment") as Promise<any>;
        let p2 = this.urlLoader.load({ url: audioURL, responseType: "arraybuffer" }, "Segment") as Promise<any>;
        return Promise.all([p1, p2]);
    }


}

const factory = FactoryMaker.getClassFactory(StreamController);
export default factory;
export { StreamController };