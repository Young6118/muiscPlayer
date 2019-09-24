// 音乐播放器
/*
    1. 初始音乐 状态暂停
    2. 播放按钮
    3. 下一首 上一首
    4. 音量按钮
    5.
*/
function musicInit() {
    var music = e('#id-music-player')
    var a = musicList()
    var initNum = 0
    music.volume = 0.2
    var s = a[initNum].url
    music.src = s
    showTime()
    showName(a[initNum])
    music.dataset.list = initNum
}

//计算时间
function time(t) {
	var sec = Math.floor(t % 60)
	var min = Math.floor(t / 60)
	if(sec < 10) {
		sec = '0' + sec
	}
	if(min < 10) {
		min = '0' + min
	}
	return `${min}:${sec}`
}

function showTime() {
    var music = e('#id-music-player')
    var durationTime = e('#id-music-duration')
    var currentTime = e('#id-music-current-time')
    music.show = null
	clearInterval(music.show)
	music.show = setInterval(function() {
        var duration = music.duration
        var current = music.currentTime
        if(duration > 0 && duration < 120*60) {
            currentTime.innerHTML = time(current)
            durationTime.innerHTML = time(duration)
        }
	}, 100)
}

function showName(obj) {
    var s = obj.name + ' - ' + obj.artist
    var name = e('#id-music-name')
    name.innerHTML = s
}

function play() {
    var music = e('#id-music-player')
    var playBtn = e('#id-music-play')
    playBtn.src = './static/img/stop2.png'
    setTimeout(p, 500)
    setTimeout(state, 3000)
}

function p() {
    var music = e('#id-music-player')
    music.play()
}

function pause() {
    var music = e('#id-music-player')
    var playBtn = e('#id-music-play')
    playBtn.src = './static/img/play2.png'
    music.pause()
}

function nextMusic() {
    var music = e('#id-music-player')
    var cur = parseInt(music.dataset.list)
    var a = musicList()
    var len = a.length
    var nextIndex = (cur + 1) % len
    music.dataset.list = nextIndex
    music.src = a[nextIndex].url
    showName(a[nextIndex])
    play()
}
function state() {
    var music = e('#id-music-player')
    if(music.readyState != '0') {
        return;
    }
    setTimeout(checked, 1000)
}
function checked() {
    var music = e('#id-music-player')
    if(music.readyState == '0') {
        log("收费歌曲，无法试听！")
        nextMusic()
    }
}

function lastMusic() {
    var music = e('#id-music-player')
    var cur = parseInt(music.dataset.list)
    var a = musicList()
    var len = a.length
    var lastIndex = (len + cur - 1) % len
    music.dataset.list = lastIndex
    music.src = a[lastIndex].url
    showName(a[lastIndex])
    play()
}

function randomMusic() {
    var arr = musicList()
    var music = e('#id-music-player')
    var cur = parseInt(music.dataset.list)
    var len = arr.length
    var nextIndex = Math.floor(Math.random() * len)
	while(nextIndex == cur) {
		nextIndex = Math.floor(Math.random() * len)
	}
    music.src = arr[nextIndex].url
	music.dataset.list = nextIndex
	play()
}

function repeatMusic() {
    setTimeout(play, 500)
}

function autoPlay() {
    var musicOrder = e('#id-music-order')
    var order = musicOrder.dataset.order
    if(order == '0') {
        nextMusic()
    }
    if(order == '1') {
        randomMusic()
    }
    if(order == '2') {
        repeatMusic()
    }
}

function bindEventToggleMusic() {
    var last = e('#id-music-last')
    var next = e('#id-music-next')
    bindEvent(last, 'click', lastMusic)
    bindEvent(next, 'click', nextMusic)
}

function bindEventPlayMusic() {
    var p = e('#id-music-play')
    var music = e('#id-music-player')
    bindEvent(p, 'click', event => {
        if(music.paused) {
            play()
        } else {
            pause()
        }
    })
}

function bindAutoPlay() {
    var music = e('#id-music-player')
    bindEvent(music, 'ended', event => {
        pause()
        setTimeout(autoPlay, 500)
    })
}

//绑定 改变进度
var bindEventPlayProgress = function() {
	var pointer = e('#id-music-progress-point')
	bindEventProgress(pointer, changeProgress, endChangeProgress)
}

var endChangeProgress = function() {
	var music = e('#id-music-player')
	if(music.changeProgress == true) {
		music.currentTime = music.current
	}
	music.changeProgress = false
}

var showProgrss = function() {
	var music = e('#id-music-player')
	var duration = music.duration
	var currentTime = music.currentTime
	var len = currentTime / duration * 100
	if(music.changeProgress == undefined) {
		music.changeProgress = false
	}
	if(music.changeProgress == false) {
		setProgress(len)
	}
}


var changeProgress = function() {
	var music = e('#id-music-player')
	music.changeProgress = true
	music.current = 0
	var progressSection = e('#id-progress')
	var duration = e('#id-music-duration')
	var d = event.clientX - progressSection.offsetLeft
	var width = duration.offsetLeft - progressSection.offsetLeft
	if(d <= 0) {
		d = 0
	}
	if(d >= width) {
		d = width - 1
	}
	var len = Math.floor(d * 100 / width)
	var duration = music.duration
	var currentTime = music.currentTime
	music.current = duration * len / 100
	setProgress(len)
}

var setProgress = function(len) {
	var progressSection = e('#id-progress')
	var duration = e('#id-music-duration')
	var width = duration.offsetLeft - progressSection.offsetLeft
	var pointer = e('#id-music-progress-point')
	var px = len * width / 100
	pointer.style.left = px +'px'
	var currentProgress = e('#id-current-progress')
	currentProgress.style.width = len + '%'
}

var bindEventProgress = function(pointer, classback, endCallback) {
	var body = e('body')
 	pointer.move = false
	bindEvent(pointer, 'mousedown', function() {
		pointer.move = true
	})
	bindEvent(body, 'mousemove', function(e) {
		if(pointer.move == true) {
			classback(e)
		}
	})
	bindEvent(body, 'mouseup', function() {
		pointer.move = false
		if(endCallback != undefined) {
			endCallback()
		}
	})
	bindEvent(body, 'mouseleave', function() {
		pointer.move = false
		if(endCallback != undefined) {
			endCallback()
		}
	})
}


//绑定音量按钮
var bindEventVol = function() {
	var pointer = e('#id-music-vol-point')
	bindEventProgress(pointer, changeVol)
}

//调节音量
var changeVol = function(event) {
	var volSection = e('#id-vol')
	var d = event.clientX - volSection.offsetLeft
	if(d <= 100) {
		d = 100
	}
	if(d >= 200) {
		d = 200
	}
	//改变圆点 及 进度条
	var volWidth = d - 100
	var volume = volWidth / 100
	var pointer = e('#id-music-vol-point')
	pointer.style.left = d +'px'
	var vol = e('#id-music-vol')
	vol.style.width = volWidth + 'px'
	//改变音量
	var music = e('#id-music-player')
	music.volume = volume
}


// function ajaxJson() {
//     ajax('./src.json', 'GET', null, '', r=>{log(r)})
// }


function init() {
    musicInit()
    bindEventToggleMusic()
    bindEventPlayMusic()
    bindAutoPlay()
    bindEventVol()
	bindEventPlayProgress()
}

init()
