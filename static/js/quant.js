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

function getRestrictPool() {
    var restrictPool = null;
    $.ajax({
        url: 'get_restrict_stocks',
        type: 'get',
        async: false,
        success: function (data) {
            restrictPool = data;
        },
        error: function (data) {
            console.log('fail');
        }
    });
    return restrictPool;
}

function initializeStockPool(stockPool) {
    for (var key in stockPool) {
        $('#unselected-stockPool').append('<option value="' + key + '">' + key + '</option>');
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
    var index = unselectedStocks.selectedIndex;
    if (index !== -1) {
        var value = unselectedStocks.options[index].value;
        var text = unselectedStocks.options[index].text;
        selectedStocks.add(new Option(text, value));
        unselectedStocks.options.remove(index);

        sortSelect("unselected-stocks");
        sortSelect("selected-stocks");
    }
}

function selectAllStocks() {
    var unselectedStocks = getAllOptions("unselected-stocks");
    var selectedStocks = getAllOptions("selected-stocks");

    removeAllOptions("unselected-stocks");
    addOptions("selected-stocks", unselectedStocks);
    sortSelect("selected-stocks");

}

function removeOneStock() {
    var unselectedStocks = document.getElementById("unselected-stocks");
    var selectedStocks = document.getElementById("selected-stocks");
    var index = selectedStocks.selectedIndex;
    if (index !== -1) {
        var value = selectedStocks.options[index].value;
        var text = selectedStocks.options[index].text;
        unselectedStocks.add(new Option(text, value));
        selectedStocks.options.remove(index);

        sortSelect("unselected-stocks");
        sortSelect("selected-stocks");
    }

}

function removeAllStocks() {
    var unselectedStocks = getAllOptions("unselected-stocks");
    var selectedStocks = getAllOptions("selected-stocks");
    console.log(selectedStocks);

    removeAllOptions("selected-stocks");
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

function removeAllOptions(elementID) {
    $("#" + elementID).find('option').remove();
}

function addOptions(elementID, pairs) {
    var obj = document.getElementById(elementID);
    for (var value in pairs) {
        if(pairs.hasOwnProperty(value)) {
            obj.options.add(new Option(pairs[value], value));
        }
    }
}

function getAllOptions(elementID) {
    var obj = document.getElementById(elementID);
    var options = {};
    for (var i=0;i<obj.options.length;i++) {
        var text = obj.options[i].text;
        var value = obj.options[i].value;
        options[value] = text;
    }
    return options;
}

function sortSelect(elementID) {
    var obj = document.getElementById(elementID);
    var tmpAry = [];
    for (var i=0;i<obj.options.length;i++) {
        tmpAry[i] = [];
        tmpAry[i][0] = obj.options[i].text;
        tmpAry[i][1] = obj.options[i].value;
    }
    tmpAry.sort();
    while (obj.options.length > 0) {
        obj.options[0] = null;
    }
    for (i=0;i<tmpAry.length;i++) {
        obj.options[i] = new Option(tmpAry[i][0], tmpAry[i][1]);
    }
}

function renderParameters(model) {
    var obj = document.getElementById("model-parameters");
    if (model === "均值方差模型") {
        var content = '<h7 style=\"margin-top: 5px;\">风险厌恶系数：</h7> <input type=\"number\" step=\"0.01\" class=\"col-md-1 form-control\" style=\"margin-right: 50px;\"> <h7 style=\"margin-top: 5px;\">预期收益率计算方法：</h7> <div class=\"dropdown mb-4\"> <button class=\"btn btn-secondary btn-sm dropdown-toggle\" type=\"button\" id=\"expected-benefit\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\" value=\"历史收益率均值法\"> 历史收益率均值法 </button> <ul class=\"dropdown-menu animated--fade-in\" aria-labelledby=\"expected-benefit\" id=\"calculation\"> <li><a class=\"dropdown-item\">历史收益率均值法</a></li> <li><a class=\"dropdown-item\">市场指数模型法</a></li> </ul> </div>';
        obj.innerHTML = content;

    }
    else {
        obj.innerHTML = '';
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
    console.log(selectedStocks);

    removeAllOptions("selected-restrict-stocks");
    addOptions("unselected-restrict-stocks", selectedStocks);
    sortSelect("unselected-restrict-stocks");
}