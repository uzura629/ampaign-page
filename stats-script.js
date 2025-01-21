function calculateStats(month) {
    const savedResults = JSON.parse(localStorage.getItem('savedResults')) || [];
    const currentYear = new Date().getFullYear();
    
    // 指定された月のデータをフィルタリング
    const monthlyResults = savedResults.filter(result => {
        const date = new Date(result.date);
        return date.getFullYear() === currentYear && 
               date.getMonth() === (month - 1);
    });

    // 月別の統計情報を計算
    const stats = {
        totalPurchase: 0,
        totalSales: 0,
        totalProfit: 0,
        totalParts: 0,
        count: monthlyResults.length,
        highProfitCount: 0 // 20%以上の取引数
    };

    monthlyResults.forEach(result => {
        stats.totalPurchase += Number(result.purchasePrice) || 0;
        stats.totalSales += Number(result.sellingPrice) || 0;
        stats.totalProfit += Number(result.profit) || 0;
        stats.totalParts += (Number(result.partsCost1) || 0) +
                           (Number(result.partsCost2) || 0) +
                           (Number(result.partsCost3) || 0);
        
        // 利益率20%以上の取引をカウント
        const profitRate = (result.profit / result.sellingPrice * 100);
        if (profitRate >= 20) {
            stats.highProfitCount++;
        }
    });

    // 利益率の計算
    stats.profitRate = stats.totalSales > 0 
        ? (stats.totalProfit / stats.totalSales * 100).toFixed(1) 
        : 0;

    updateStatsDisplay(stats, month);
}

function updateStatsDisplay(stats, month) {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stats-item">
                <h4>${month}月の総仕入れ額</h4>
                <p>${stats.totalPurchase.toLocaleString()}円</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の総販売額</h4>
                <p>${stats.totalSales.toLocaleString()}円</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の総利益</h4>
                <p>${stats.totalProfit.toLocaleString()}円</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の平均利益率</h4>
                <p>${stats.profitRate}%</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の取扱台数</h4>
                <p>${stats.count}台</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の総パーツ代</h4>
                <p>${stats.totalParts.toLocaleString()}円</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の高利益率取引</h4>
                <p>${stats.highProfitCount}件</p>
                <span class="sub-text">(利益率20%以上)</span>
            </div>
        </div>
    `;
}

// 履歴表示用の関数を更新
function updateResultsList() {
    const resultsList = document.getElementById('resultsList');
    const selectedMonth = document.getElementById('historyMonth').value;
    const currentYear = new Date().getFullYear();
    let savedResults = JSON.parse(localStorage.getItem('savedResults')) || [];
    
    // 選択された月のデータをフィルタリング
    const filteredResults = savedResults.filter(result => {
        const date = new Date(result.date);
        return date.getFullYear() === currentYear && 
               (date.getMonth() + 1) === Number(selectedMonth);
    });

    // 日付順（新しい順）にソート
    filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 履歴リストのHTML生成
    resultsList.innerHTML = `
        <div class="month-results">
            ${filteredResults.map(result => {
                const date = new Date(result.date);
                const formattedDate = `${date.getDate()}日`;
                const profitRate = (result.profit / result.sellingPrice * 100).toFixed(1);
                
                return `
                    <div class="result-item">
                        <div class="result-info">
                            <span class="result-date">${formattedDate}</span>
                            <span>${result.productName} ${result.storage}GB</span>
                            <span>仕入: ${Number(result.purchasePrice).toLocaleString()}円</span>
                            <span>販売: ${Number(result.sellingPrice).toLocaleString()}円</span>
                            <span>利益: ${Number(result.profit).toLocaleString()}円</span>
                            <span class="profit-rate">利益率: ${profitRate}%</span>
                        </div>
                        <div class="result-actions">
                            <button onclick="deleteResult('${result.id}')" class="delete-button">削除</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 結果を月別にグループ化する関数
function groupResultsByMonth(results) {
    return results.reduce((groups, result) => {
        const date = new Date(result.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!groups[monthKey]) {
            groups[monthKey] = [];
        }
        groups[monthKey].push(result);
        return groups;
    }, {});
}

// 月ヘッダーのフォーマット
function formatMonthHeader(monthKey) {
    const [year, month] = monthKey.split('-');
    return `${year}年${Number(month)}月`;
}

// 月ごとの結果リストを生成
function generateResultsList(results) {
    return results
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(result => {
            const profitRate = (result.profit / result.sellingPrice * 100).toFixed(1);
            const highProfitClass = profitRate >= 20 ? 'high-profit' : '';
            
            return `
                <div class="result-item ${highProfitClass}">
                    <div class="result-info">
                        <span class="result-date">${formatDate(result.date)}</span>
                        <span class="product-name">${result.productName} ${result.storage}GB</span>
                        <span class="price">仕入: ${Number(result.purchasePrice).toLocaleString()}円</span>
                        <span class="price">販売: ${Number(result.sellingPrice).toLocaleString()}円</span>
                        <span class="profit">利益: ${Number(result.profit).toLocaleString()}円</span>
                        <span class="profit-rate">利益率: ${profitRate}%</span>
                    </div>
                    <div class="result-actions">
                        <button onclick="deleteResult(${index})" class="delete-button">削除</button>
                    </div>
                </div>
            `;
        }).join('');
}

// DOMContentLoaded時に1回だけ実行
document.addEventListener('DOMContentLoaded', function() {
    updateResultsList();
});

function updateStats() {
    const currentMonth = new Date().getMonth() + 1;
    calculateStats(currentMonth);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 履歴タブ初期化時の処理
document.addEventListener('DOMContentLoaded', function() {
    const historyMonth = document.getElementById('historyMonth');
    if (historyMonth) {
        // 現在の月を設定
        const currentMonth = new Date().getMonth() + 1;
        historyMonth.value = currentMonth;
        // 初期表示
        updateResultsList();
    }
});