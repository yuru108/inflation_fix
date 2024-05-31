document.addEventListener('DOMContentLoaded', function() {
    const startYearInput = document.getElementById('startYear');
    const endYearInput = document.getElementById('endYear');
    const queryButton = document.getElementById('queryButton');
    const yearRangeDisplay = document.getElementById('yearRangeDisplay');
    const oilButton = document.getElementById('oilButton');
    const gasButton = document.getElementById('gasButton');
    const coalButton = document.getElementById('coalButton');
    const totalButton = document.getElementById('totalButton');
    const tableContainer = document.getElementById('tableContainer'); // 表格的容器
    let selectedType = 'total';

    // 初始設定選擇的按鈕
    totalButton.classList.add("selected");

    // 按鈕點擊事件處理
    oilButton.addEventListener('click', () => {
        selectedType = 'Oil';
        handleButtonSelection(oilButton);
        updateData();
    });

    gasButton.addEventListener('click', () => {
        selectedType = 'Gas';
        handleButtonSelection(gasButton);
        updateData();
    });

    coalButton.addEventListener('click', () => {
        selectedType = 'Coal';
        handleButtonSelection(coalButton);
        updateData();
    });

    totalButton.addEventListener('click', () => {
        selectedType = 'total';
        handleButtonSelection(totalButton);
        updateData();
    });

    // 點擊按鈕後更新選擇狀態
    function handleButtonSelection(button) {
        [oilButton, gasButton, coalButton, totalButton].forEach(btn => {
            if (btn === button) {
                btn.classList.add("selected");
            } else {
                btn.classList.remove("selected");
            }
        });
    }

    // 查詢按鈕點擊事件處理
    queryButton.addEventListener('click', updateData);
    startYearInput.addEventListener('input', updateYearRange);
    endYearInput.addEventListener('input', updateYearRange);

    updateData(); // 初始更新資料

    // 更新範圍顯示
    function updateYearRange() {
        const startYear = startYearInput.value;
        endYearInput.min = parseInt(startYear) + 1; // End 年份最小值為 start 年份 + 1
    }

    // 更新資料函數
    function updateData() {
        const startYear = parseInt(startYearInput.value);
        const endYear = parseInt(endYearInput.value);

        updateYearRange(); // 更新範圍顯示

        if (selectedType === 'total') {
            tableContainer.style.display = 'none'; // 隱藏表格
            updateTotalData(startYear, endYear); // 更新總覽資料
            return;
        } else {
            tableContainer.style.display = 'block'; // 顯示表格
        }

        // 根據選擇的類型從服務器獲取資料並更新表格和圖表
        fetch(`/prices/${selectedType}`)
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter(row => row.Year >= startYear && row.Year <= endYear);

                updateTable(filteredData); // 更新表格
                updateChart(filteredData); // 更新圖表
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // 更新總覽資料
    function updateTotalData(startYear, endYear) {
        const fetchData = (type) => {
            return fetch(`/prices/${type}`)
                .then(response => response.json())
                .then(data => {
                    return data.filter(row => row.Year >= startYear && row.Year <= endYear);
                })
                .catch(error => console.error(`Error fetching ${type} data:`, error));
        };

        Promise.all([fetchData('Oil'), fetchData('Gas'), fetchData('Coal')])
            .then(([oilData, gasData, coalData]) => {
                const oilPrices = oilData.map(row => row.Price);
                const gasPrices = gasData.map(row => row.Price);
                const coalPrices = coalData.map(row => row.Price);
                const years = oilData.map(row => row.Year); // 假設所有資料都有相同的年份

                // 清除已存在的圖表
                const existingChart = Chart.getChart('priceChart');
                if (existingChart) {
                    existingChart.destroy();
                }

                // 創建新的總覽圖表
                const ctx = document.getElementById('priceChart').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: years,
                        datasets: [{
                            label: 'Oil Price',
                            data: oilPrices,
                            fill: false,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1
                        }, {
                            label: 'Natural Gas Price',
                            data: gasPrices,
                            fill: false,
                            borderColor: 'rgb(54, 162, 235)',
                            tension: 0.1
                        }, {
                            label: 'Coal Price',
                            data: coalPrices,
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: `Total Prices Trend: ${startYear}~${endYear}`,
                                font: {
                                    size: 18
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Year'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Price'
                                }
                            }
                        }
                    }
                });
            });
    }

    // 更新表格
    function updateTable(filteredData) {
        const tableBody = document.getElementById('pricesTableBody');
        tableBody.innerHTML = ''; // 清空當前表格
        filteredData.forEach(row => {
            const tr = document.createElement('tr');
            const yearTd = document.createElement('td');
            const priceTd = document.createElement('td');

            yearTd.textContent = row.Year;
            priceTd.textContent = row.Price;

            tr.appendChild(yearTd);
            tr.appendChild(priceTd);

            tableBody.appendChild(tr);
        });
    }

    // 更新圖表
    function updateChart(filteredData) {
        const years = filteredData.map(row => row.Year);
        const prices = filteredData.map(row => row.Price);

        // 清除已存在的圖表
        const existingChart = Chart.getChart('priceChart');
        if (existingChart) {
            existingChart.destroy();
        }

        // 創建新的圖表
        const ctx = document.getElementById('priceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Price Trend',
                    data: prices,
                    fill: false,
                    borderColor: 'rgb(100, 149, 237)',
                    tension: 0.1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `${selectedType}: ${startYearInput.value}~${endYearInput.value}`,
                        font: {
                            size: 18
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price'
                        }
                    }
                }
            }
        });
    }

    // 初始更新範圍顯示
    updateYearRange();
});