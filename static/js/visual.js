/**
 * 如何绘制一个音乐频谱
 * 首先得到一个音乐文件
 * 将文件变成 arraybuffer 的形式
 * 建立播放的节点
 * 根据 buffer 绘制频谱同时播放
 * 音乐结束时关闭画布
 */
window.onload = function() {
     new Visualizer().ini()
}
var Visualizer = function() {
    this.audioContext = null,
    this.source = null, // 音频源
    this.animationId = null,
    this.status = 0, // 没声音 0 有 1
    this.forceStop = false,
    this.allCapsReachBottom = false
}
 Visualizer.prototype = {
        // 初始化函数 检测是否支持 API
        // 添加事件监听器
        ini: function() {
            this._prepareAPI()
            this._addEventListner()
        },
        // 检查浏览器是否支持 AudioContext
        _prepareAPI: function() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame
        try {
         this.audioContext = new AudioContext()
        } catch (error) {
                console.log(error)
            }
        },
        _addEventListner: function() {
        var that = this,
         dropContainer = document.getElementsByTagName("canvas")[0]
        that.forceStop = true
        that._start()
        },
        _start: function() {
            var that = this
            var dogBarkingBuffer = null
            window.AudioContext = window.AudioContext || window.webkitAudioContext
            ajaxMusic(that)
        },
        _visualize: function(audioContext, buffer) {
            var audioBufferSouceNode = audioContext.createBufferSource(),
                analyser = audioContext.createAnalyser(),
                that = this
            audioBufferSouceNode.connect(analyser)
            analyser.connect(audioContext.destination)
            audioBufferSouceNode.buffer = buffer
            if (!audioBufferSouceNode.start) {
                audioBufferSouceNode.start = audioBufferSouceNode.noteOn // 老浏览器支持
                audioBufferSouceNode.stop = audioBufferSouceNode.noteOff // 老浏览器支持
            }
            if (this.animationId !== null) {
                cancelAnimationFrame(this.animationId)
            }
            if (this.source !== null) {
                this.source.stop(0)
            }
            audioBufferSouceNode.start(0)
            this.status = 1
            this.source = audioBufferSouceNode
            audioBufferSouceNode.onended = function() {
                that._audioEnd(that)
            }
            this.info = 'Playing ' + this.fileName
            this._drawSpectrum(analyser)
        },
        _drawSpectrum: function(analyser) {
            var that = this,
                canvas = document.getElementById('canvas'),
                cwidth = canvas.width,
                cheight = canvas.height - 2,
                meterWidth = 10,
                gap = 2,
                capHeight = 2,
                capStyle = 'red',
                meterNum = 900 / (10 + 2),
                capYPositionArray = []
                ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 300)
            gradient.addColorStop(1, '#00ffff')
            gradient.addColorStop(0.5, '#ff0')
            gradient.addColorStop(0, '#f00')
            var drawMeter = function() {
                var array = new Uint8Array(analyser.frequencyBinCount)
                analyser.getByteFrequencyData(array)
                if (that.status === 0) {
                for (var i = array.length - 1; i >= 0; i--) {
                 array[i] = 0
                }
                allCapsReachBottom = true
                for (var i = capYPositionArray.length - 1; i >= 0; i--) {
                    allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0)
                }
                if (allCapsReachBottom) {
                    cancelAnimationFrame(that.animationId) //since the sound is top and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                    return
                }
            }
            var step = Math.round(array.length / meterNum) //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, cheight)
            for (var i = 0; i < meterNum; i++) {
                var value = array[i * step]
                if (capYPositionArray.length < Math.round(meterNum)) {
                    capYPositionArray.push(value)
                }
                ctx.fillStyle = capStyle
                // 画布和效果
                if (value < capYPositionArray[i]) {
                 ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight)
                } else {
                 ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight)
                 capYPositionArray[i] = value
                }
                ctx.fillStyle = gradient
                ctx.fillRect(i * 12 /*宽*/ , cheight - value + capHeight, meterWidth, cheight)
            }
            that.animationId = requestAnimationFrame(drawMeter)
        }
        this.animationId = requestAnimationFrame(drawMeter)
     },
     _audioEnd: function() {
         if (this.forceStop) {
             this.forceStop = false
             this.status = 1
             return
         }
         this.status = 0
     }
 }
 var ajaxMusic = function(that) {
     // var url = "http://m2.music.126.net/-BQcSG5fAqw3tsCGXkDCWQ==/5505254720365750.mp3"
     var url = "./static/music/.mp3"
     var request = createCORSRequest("GET", url)
     var context = new AudioContext()
     request.responseType = 'arraybuffer'
     request.onload = function() {
         context.decodeAudioData(request.response, function(buffer) {
         dogBarkingBuffer = buffer
         var audioContext = that.audioContext
         that._visualize(audioContext, dogBarkingBuffer)
         }, function(e) {
                console.log(e)
            })
     }
    request.send()
 }

var createCORSRequest = function(method, url) {
    var xhr = new XMLHttpRequest()
    if("withCredentials" in xhr) {
        xhr.open(method, url, true)
    } else if(typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest()
        xhr.open(method, url)
    } else {
        xhr = null
    }
    return xhr
}
