function getStockPool() {
    var stockPool = null;
    $.ajax({
        url: 'get_stocks',
        type: 'get',
        async: false,
        success: function (data) {
            stockPool = data;
        },
        error: function (data) {
            console.log('fail');
        }
    });
    return stockPool;
}

function getTradesPool() {
    var tradePool = null;
    $.ajax({
        url: 'get_trades',
        type: 'get',
        async: false,
        success: function (data) {
            tradePool = data;
            var unselectedTrades = $("#unselected-trades");
            var unselectedRestrictTrades = $("#unselected-restrict-trades");
            var trades = tradePool['申万一级行业'];
            for (var idx in trades) {
                unselectedTrades.append('<option value="' + trades[idx] + '">' + trades[idx] + '</option>');
                unselectedRestrictTrades.append('<option value="' + trades[idx] + '">' + trades[idx] + '</option>');
            }
        },
        error: function (data) {
            console.log('fail');
        }
    });
    return tradePool;
}

function initializePool(stockPool, divid) {
    for (var key in stockPool) {
        $(divid).append('<option value="' + key + '">' + key + '</option>');
    }
}

function initializeRestrictPool(restrictPool) {
    for (var key in restrictPool) {
        $('#unselected-restrict-stocks').append('<option value="' + key + '">' + key + '</option>');
    }
}

function selectOneStock() {
    var unselectedStocks = document.getElementById("unselected-stocks");
    var selectedStocks = document.getElementById("selected-stocks");
    var restrictStockspool = document.getElementById("unselected-restrict-stocks");
    var index = unselectedStocks.selectedIndex;
    if (index !== -1) {
        var value = unselectedStocks.options[index].value;
        var text = unselectedStocks.options[index].text;
        selectedStocks.add(new Option(text, value));
        restrictStockspool.add(new Option(text, value));
        unselectedStocks.options.remove(index);

        sortSelect("unselected-stocks");
        sortSelect("selected-stocks");
    }
}

function selectAllStocks() {
    var unselectedStocks = getAllOptions("unselected-stocks");

    removeAllOptions("unselected-stocks");
    addOptions("selected-stocks", unselectedStocks);
    addOptions("unselected-restrict-stocks", unselectedStocks);
    sortSelect("selected-stocks");

}

function removeOneStock() {
    var unselectedStocks = document.getElementById("unselected-stocks");
    var selectedStocks = document.getElementById("selected-stocks");
    var restrictStockspool = document.getElementById("unselected-restrict-stocks");
    var index = selectedStocks.selectedIndex;
    if (index !== -1) {
        var value = selectedStocks.options[index].value;
        var text = selectedStocks.options[index].text;
        unselectedStocks.add(new Option(text, value));
        selectedStocks.options.remove(index);
        restrictStockspool.options.remove(index);

        sortSelect("unselected-stocks");
        sortSelect("selected-stocks");
    }

}

function removeAllStocks() {
    var selectedStocks = getAllOptions("selected-stocks");
    console.log(selectedStocks);

    removeAllOptions("selected-stocks");
    removeAllOptions("unselected-restrict-stocks");
    addOptions("unselected-stocks", selectedStocks);
    sortSelect("unselected-stocks");
}

function unselectedStockPoolOnChange(widget, stockPool) {
    var unselectedStocks = $("#unselected-stocks");
    var index = widget.selectedIndex;
    var value = widget.options[index].value;
    unselectedStocks.find('option').remove();
    var stocks = stockPool[value];

    var selectedStocks = [];
    var temp = $("#selected-stocks")[0];
    if (temp.options !== null) {
        for (var i = 0; i < temp.options.length; i++) {
            selectedStocks[i] = temp.options[i].value;
        }
    }
    for (idx in stocks) {
        var stock = stocks[idx];
        if (!selectedStocks.includes(stock)) {
            unselectedStocks.append('<option value="' + stocks[idx] + '">' + stocks[idx] + '</option>');
        }
    }

    sortSelect("unselected-stocks");
}

//

function selectOneTrade() {
    var unselectedTrades = document.getElementById("unselected-trades");
    var selectedTrades = document.getElementById("selected-trades");
    var index = unselectedTrades.selectedIndex;
    if (index !== -1) {
        var value = unselectedTrades.options[index].value;
        var text = unselectedTrades.options[index].text;
        selectedTrades.add(new Option(text, value));
        unselectedTrades.options.remove(index);

        sortSelect("unselected-trades");
        sortSelect("selected-trades");
    }
}

function selectAllTrades() {
    var unselectedTrades = getAllOptions("unselected-trades");

    removeAllOptions("unselected-trades");
    addOptions("selected-trades", unselectedTrades);
    sortSelect("selected-trades");
}

function removeOneTrade() {
    var unselectedTrades = document.getElementById("unselected-trades");
    var selectedTrades = document.getElementById("selected-trades");
    var index = selectedTrades.selectedIndex;
    if (index !== -1) {
        var value = selectedTrades.options[index].value;
        var text = selectedTrades.options[index].text;
        unselectedTrades.add(new Option(text, value));
        selectedTrades.options.remove(index);

        sortSelect("unselected-trades");
        sortSelect("selected-trades");
    }
}

function removeAllTrades() {
    var selectedTrades = getAllOptions("selected-trades");
    console.log(selectedTrades);

    removeAllOptions("selected-trades");
    addOptions("unselected-trades", selectedTrades);
    sortSelect("unselected-trades");
}

//

function removeAllOptions(elementID) {
    $("#" + elementID).find('option').remove();
}

function addOptions(elementID, pairs) {
    var obj = document.getElementById(elementID);
    for (var value in pairs) {
        if (pairs.hasOwnProperty(value)) {
            obj.options.add(new Option(pairs[value], value));
        }
    }
}

function getAllOptions(elementID) {
    var obj = document.getElementById(elementID);
    var options = {};
    for (var i = 0; i < obj.options.length; i++) {
        var text = obj.options[i].text;
        var value = obj.options[i].value;
        options[value] = text;
    }
    return options;
}

function sortSelect(elementID) {
    var obj = document.getElementById(elementID);
    var tmpAry = [];
    for (var i = 0; i < obj.options.length; i++) {
        tmpAry[i] = [];
        tmpAry[i][0] = obj.options[i].text;
        tmpAry[i][1] = obj.options[i].value;
    }
    // tmpAry.sort();
    while (obj.options.length > 0) {
        obj.options[0] = null;
    }
    for (i = 0; i < tmpAry.length; i++) {
        obj.options[i] = new Option(tmpAry[i][0], tmpAry[i][1]);
    }
}

function selectOneStockRestrict() {
    var unselectedStocks = document.getElementById("unselected-restrict-stocks");
    var selectedStocks = document.getElementById("selected-restrict-stocks");
    var index = unselectedStocks.selectedIndex;
    if (index !== -1) {
        var value = unselectedStocks.options[index].value;
        var text = unselectedStocks.options[index].text;
        selectedStocks.add(new Option(text, value));
        unselectedStocks.options.remove(index);

        sortSelect("unselected-restrict-stocks");
        sortSelect("selected-restrict-stocks");
    }
}

function selectAllStocksRestrict() {
    var unselectedStocks = getAllOptions("unselected-restrict-stocks");

    removeAllOptions("unselected-restrict-stocks");
    addOptions("selected-restrict-stocks", unselectedStocks);
    sortSelect("selected-restrict-stocks");

}

function removeOneStockRestrict() {
    var unselectedStocks = document.getElementById("unselected-restrict-stocks");
    var selectedStocks = document.getElementById("selected-restrict-stocks");
    var index = selectedStocks.selectedIndex;
    if (index !== -1) {
        var value = selectedStocks.options[index].value;
        var text = selectedStocks.options[index].text;
        unselectedStocks.add(new Option(text, value));
        selectedStocks.options.remove(index);

        sortSelect("unselected-restrict-stocks");
        sortSelect("selected-restrict-stocks");
    }

}

function removeAllStocksRestrict() {
    var selectedStocks = getAllOptions("selected-restrict-stocks");

    removeAllOptions("selected-restrict-stocks");
    addOptions("unselected-restrict-stocks", selectedStocks);
    sortSelect("unselected-restrict-stocks");
}

function myCallbackFunction(updatedCell, updatedRow, oldValue) {

}


//

function selectOneRestrictTrade() {
    var unselectedTrades = document.getElementById("unselected-restrict-trades");
    var selectedTrades = document.getElementById("selected-restrict-trades");
    var index = unselectedTrades.selectedIndex;
    if (index !== -1) {
        var value = unselectedTrades.options[index].value;
        var text = unselectedTrades.options[index].text;
        selectedTrades.add(new Option(text, value));
        unselectedTrades.options.remove(index);

        sortSelect("unselected-restrict-trades");
        sortSelect("selected-restrict-trades");
    }
}

function selectAllRestrictTrades() {
    var unselectedTrades = getAllOptions("unselected-restrict-trades");

    removeAllOptions("unselected-restrict-trades");
    addOptions("selected-restrict-trades", unselectedTrades);
    sortSelect("selected-restrict-trades");
}

function removeOneRestrictTrade() {
    var unselectedTrades = document.getElementById("unselected-restrict-trades");
    var selectedTrades = document.getElementById("selected-restrict-trades");
    var index = selectedTrades.selectedIndex;
    if (index !== -1) {
        var value = selectedTrades.options[index].value;
        var text = selectedTrades.options[index].text;
        unselectedTrades.add(new Option(text, value));
        selectedTrades.options.remove(index);

        sortSelect("unselected-restrict-trades");
        sortSelect("selected-restrict-trades");
    }
}

function removeAllRestrictTrades() {
    var selectedTrades = getAllOptions("selected-restrict-trades");

    removeAllOptions("selected-restrict-trades");
    addOptions("unselected-restrict-trades", selectedTrades);
    sortSelect("unselected-restrict-trades");
}

//

function buildTradeTable(first) {
    if (!first) {
        $("#trade-table").DataTable().clear().destroy();
        $("#trade-table").empty();
    }
    var options = getAllOptions("selected-trades");
    var columns = new Array();
    var data = new Array();
    // cd = [];
    for (var key in options) {
        columns.push({"title": key, "orderable": false,});
        data.push(1.0);
    }
    tradeTable = $('#trade-table').removeAttr('width').DataTable({
        "data": [data],
        "columns": columns,
        searching: false, paging: false, info: false,
    });
    tradeTable.MakeCellsEditable({
        "onUpdate": myCallbackFunction
    });
}


function buildGeguTable(dataset, columns) {

    tablecolumns = [];
    for (var key in columns) {
        tablecolumns.push({title: columns[key], orderable: false,});
    }
    $('#gegu').DataTable({
        "sDom": '<"toolbar">frtip',
        data: dataset,
        columns: tablecolumns,
        searching: false,
        paging: false,
        bPaginate: false,
        bLengthChange: false,
        bFilter: true,
        bInfo: false,
        bAutoWidth: false,
        aaSorting: []
    });
    $("div.toolbar").html('<b>个股表格</b>');
}

function buildPerformTable(id, dataset, columns, title) {
    tablecolumns = [];
    for (var key in columns) {
        tablecolumns.push({title: columns[key], orderable: false,});
    }
    $(id).DataTable({
        data: dataset,
        columns: tablecolumns,
        searching: false,
        paging: false,
        bPaginate: false,
        bLengthChange: false,
        bFilter: true,
        bInfo: false,
        bAutoWidth: false,
        aaSorting: []
    });
}

function buildBarGraph(id, barNames, barValues) {
    var ctx = document.getElementById(id).getContext('2d');

    const defaultColors = [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    var colors = [];
    for (var i = 0; i < barValues.length; i++) {
        colors.push(defaultColors[i % 6]);
    }

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: barNames,
            datasets: [{
                label: '市值权重',
                data: barValues,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
    return myChart;
}

function buildAbsoluteChart(timestamps, absolute_values, benchmark_values, benchmark) {
    var ctx = document.getElementById('absoluteLine').getContext('2d');

    var config = {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'my_portfolio',
                backgroundColor: 'rgba(255,99,132,1)',
                borderColor: 'rgba(255,99,132,1)',
                data: absolute_values,
                fill: false,
            }, {
                label: benchmark,
                fill: false,
                backgroundColor: 'rgba(54, 162, 235, 1)',
                borderColor: 'rgba(54, 162, 235, 1)',
                data: benchmark_values,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: '绝对表现'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: '日期'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                    point:{
                        radius: 0
                    }
                }
        }
    };

    var absoluteLine = new Chart(ctx, config);

    return absoluteLine;
}


function buildRelativeChart(timestamps, relative_values) {
    var ctx = document.getElementById('relativeLine').getContext('2d');

    var config = {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'my_portfolio',
                backgroundColor: 'rgba(255,99,132,1)',
                borderColor: 'rgba(255,99,132,1)',
                data: relative_values,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: '相对表现'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: '日期'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                    point:{
                        radius: 0
                    }
                }
        }
    };

    var relativeLine = new Chart(ctx, config);

    return relativeLine;
}