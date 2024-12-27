// カウントダウンタイマーの設定
function updateTimer() {
    // 現在の日時を取得
    const now = new Date().getTime();
    
    // ユーザーごとの開始時間を取得（ローカルストレージから）
    let startTime = localStorage.getItem('campaignStartTime');
    
    // 開始時間が設定されていない場合は現在時刻を設定
    if (!startTime) {
        startTime = now;
        localStorage.setItem('campaignStartTime', startTime);
    }
    
    // 72時間（3日）をミリ秒で計算
    const duration = 72 * 60 * 60 * 1000;
    
    // 終了時刻を計算
    const endTime = parseInt(startTime) + duration;
    
    // 残り時間を計算
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) {
        // 時間切れの場合
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        
        // ビデオセクションを非表示にする
        document.querySelector('.video-section').style.display = 'none';
        document.querySelector('.campaign-details').style.display = 'none';
        
        // メッセージを表示
        const message = document.createElement('div');
        message.className = 'expired-message';
        message.innerHTML = `
            <h2>キャンペーン期間が終了しました</h2>
            <p>申し訳ございませんが、このキャンペーンは終了いたしました。</p>
        `;
        document.querySelector('.countdown-section').appendChild(message);
        
        return;
    }
    
    // 残り時間を日、時、分、秒に変換
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // 表示を更新
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// 1秒ごとにタイマーを更新
setInterval(updateTimer, 1000);

// 初回実行
updateTimer();

// 期限切れ時のスタイル
const styles = `
.expired-message {
    text-align: center;
    padding: 2rem;
    margin: 2rem 0;
    background: #fff3f3;
    border-radius: 10px;
}

.expired-message h2 {
    color: #ff4444;
    margin-bottom: 1rem;
}

.expired-message p {
    color: #666;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// YouTube Player APIの読み込み
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// YouTubeプレーヤーの初期化
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

// 動画の状態が変更されたときの処理
function onPlayerStateChange(event) {
    // 動画が終了したとき
    if (event.data == YT.PlayerState.ENDED) {
        // ダウンロードセクションを表示
        document.getElementById('download-section').style.display = 'block';
        // 視聴通知を非表示
        document.getElementById('watch-notice').style.display = 'none';
        // LocalStorageに視聴完了を記録
        localStorage.setItem('videoWatched', 'true');
    }
}

// ページ読み込み時に視聴済みかチェック
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('videoWatched') === 'true') {
        document.getElementById('download-section').style.display = 'block';
        document.getElementById('watch-notice').style.display = 'none';
    }
}); 