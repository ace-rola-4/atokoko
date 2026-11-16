// 1. 地図の初期化（渋谷周辺）
const map = L.map('map').setView([35.658034, 139.701636], 14);

// 国土地理院（淡色）タイル
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
  attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
  maxZoom: 18
}).addTo(map);

// マーカーを保持する配列
let markers = [];

// 追加待ちの一時データを保持する変数
let pendingSpotData = null;

// 初期データ
let spots = [
  { id: 1, name: "アトココカフェ 渋谷", category: "カフェ", lat: 35.658034, lng: 139.701636 },
  { id: 2, name: "SNSで話題のラーメン店", category: "ラーメン", lat: 35.662000, lng: 139.703000 }
];

// 2. 画面描画関数
function render() {
  // 既存のピンをクリア
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const listEl = document.getElementById('spot-list');
  listEl.innerHTML = '';

  spots.forEach(spot => {
    // 地図にピン追加
    const marker = L.marker([spot.lat, spot.lng])
      .addTo(map)
      .bindPopup(`<b>${spot.name}</b><br>${spot.category}`);
    markers.push(marker);

    // リストにカード追加
    const card = document.createElement('div');
    card.className = 'spot-card';
    card.innerHTML = `
      <div class="spot-info">
        <h3>${spot.name}</h3>
        <span class="spot-tag">${spot.category}</span>
      </div>
      <button class="delete-btn" onclick="deleteSpot(${spot.id})">削除</button>
    `;
    listEl.appendChild(card);
  });
}

// 3. 「追加」ボタンを押したときの処理
document.getElementById('add-btn').addEventListener('click', () => {
  const nameInput = document.getElementById('input-name');
  const categoryInput = document.getElementById('input-category');

  if (!nameInput.value.trim()) {
    return alert('店名を入力してください');
  }

  // 入力された情報を一次保持する
  pendingSpotData = {
    name: nameInput.value,
    category: categoryInput.value || '未分類'
  };

  // カーソルを十字に変更してユーザーに案内
  document.getElementById('map').style.cursor = 'crosshair';
  alert('地図上の追加したい場所をクリックしてください！');
});

// 4. 地図がクリックされたときの処理
map.on('click', (e) => {
  // 「追加」ボタンが押されて待機状態のときだけ実行
  if (!pendingSpotData) return;

  // クリックされた位置の緯度・経度を取得
  const newSpot = {
    id: Date.now(),
    name: pendingSpotData.name,
    category: pendingSpotData.category,
    lat: e.latlng.lat,
    lng: e.latlng.lng
  };

  spots.push(newSpot);

  // フォームと待機状態のクリア
  document.getElementById('input-name').value = '';
  document.getElementById('input-category').value = '';
  document.getElementById('map').style.cursor = '';
  pendingSpotData = null;

  render();
});

// 5. スポット削除処理
function deleteSpot(id) {
  spots = spots.filter(s => s.id !== id);
  render();
}

// 初回描画
render();

// 6. SNS共有から受け取ったデータの処理
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedText = urlParams.get('text') || urlParams.get('title') || urlParams.get('url');

  if (sharedText) {
    // 共有されたテキストから店名っぽところを仮でセット（またはそのままセット）
    document.getElementById('input-name').value = sharedText.substring(0, 30);
    document.getElementById('input-category').value = 'SNS保存';

    // 自動でピン立てモードに入る
    pendingSpotData = {
      name: document.getElementById('input-name').value,
      category: 'SNS保存'
    };

    document.getElementById('map').style.cursor = 'crosshair';
    alert(`SNSからの共有を受け取りました！\n「${document.getElementById('input-name').value}」をピン留めしたい地図上の場所をクリックしてください。`);
  }
});