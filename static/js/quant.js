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
    var unselectedStocks = getAllOptions("unselected-stocks");
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
    var unselectedTrades = getAllOptions("unselected-trades");
    var selectedTrades = getAllOptions("selected-trades");
    console.log(selectedTrades);

    removeAllOptions("selected-trades");
    addOptions("unselected-trades", selectedTrades);
    sortSelect("unselected-trades");
}

function unselectedTradePoolOnChange(widget, tradePool) {
    var unselectedTrades = $("#unselected-trades");
    var index = widget.selectedIndex;
    var value = widget.options[index].value;
    unselectedTrades.find('option').remove();
    var trades = tradePool[value];

    var selectedTrades = [];
    var temp = $("#selected-trades")[0];
    if (temp.options !== null) {
        for (var i = 0; i < temp.options.length; i++) {
            selectedTrades[i] = temp.options[i].value;
        }
    }
    for (idx in trades) {
        var trade = trades[idx];
        if (!selectedTrades.includes(trade)) {
            unselectedTrades.append('<option value="' + trades[idx] + '">' + trades[idx] + '</option>');
        }
    }

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
    var selectedStocks = getAllOptions("selected-restrict-stocks");

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
    var unselectedStocks = getAllOptions("unselected-restrict-stocks");
    var selectedStocks = getAllOptions("selected-restrict-stocks");

    removeAllOptions("selected-restrict-stocks");
    addOptions("unselected-restrict-stocks", selectedStocks);
    sortSelect("unselected-restrict-stocks");
}

function myCallbackFunction(updatedCell, updatedRow, oldValue) {

}


function buildTradeTable(first) {
    if (!first) {
        $("#trade-table").DataTable().clear().destroy();
        $("#trade-table").empty();
        console.log('clear');
    }
    var options = getAllOptions("selected-trades");
    columns = new Array();
    data = new Array();
    for (var key in options) {
        console.log({"title": key});
        columns.push({"title": key, "orderable": false});
        data.push(1.0);
    }
    console.log(data);
    console.log(columns);
    tradeTable = $('#trade-table').DataTable( {
        "data": [data],
        "columns": columns,
        searching: false, paging: false, info: false
    });
    tradeTable.MakeCellsEditable({
        "onUpdate": myCallbackFunction
    });
}