function getData(start_date, end_date) {
    var ret = null;
    var post_data = {
        'start_date': start_date,
        'end_date': end_date
    };
    $('#content').waitMe({
        effect: 'bounce',
        text: '',
        bg: "rgba(255, 255, 255, 0.7)",
        color: "#000"
    });
    $.ajax({
        url: 'get_data',
        type: 'post',
        async: false,
        data: post_data,
        success: function (data) {
            ret = data;
            var tradePool = data['industryPool'];
            var unselectedRestrictTrades = $("#unselected-restrict-trade");
            var unselectedhangye = $("#unselected-hangye");
            var trades = tradePool;
            for (var idx in trades) {
                // unselectedTrades.append('<option value="' + trades[idx] + '">' + trades[idx] + '</option>');
                unselectedRestrictTrades.append('<option value="' + trades[idx] + '">' + trades[idx] + '</option>');
                unselectedhangye.append('<option value="' + trades[idx] + '">' + trades[idx] + '</option>');
            }

            var dapanPool = data['indexPool'];
            var unselecteddapan = $("#unselected-dapan");
            for (var idx in dapanPool) {
                unselecteddapan.append('<option value="' + dapanPool[idx] + '">' + dapanPool[idx] + '</option>');
            }
            $('#content').waitMe('hide');
        },
        error: function (data) {
            $('#content').waitMe('hide');
        }
    });
    return ret;
}

function initializePool(pool, divid) {
    removeAllOptions(divid.substring(1));
    for (var key in pool) {
        $(divid).append('<option value="' + key + '">' + key + '</option>');
    }
}

function selectOne(unselected, selected, unselected_restrict) {
    var unselectedStocks = document.getElementById(unselected);
    var selectedStocks = document.getElementById(selected);
    var restrictStockspool = document.getElementById(unselected_restrict);
    var index = unselectedStocks.selectedIndex;
    if (index !== -1) {
        var value = unselectedStocks.options[index].value;
        var text = unselectedStocks.options[index].text;
        selectedStocks.add(new Option(text, value));
        restrictStockspool.add(new Option(text, value));
        unselectedStocks.options.remove(index);

        sortSelect(unselected);
        sortSelect(selected);
    }
}

function selectAll(unselected, selected, unselected_restrict) {
    var unselectedStocks = getAllOptions(unselected);

    removeAllOptions(unselected);
    addOptions(selected, unselectedStocks);
    addOptions(unselected_restrict, unselectedStocks);
    sortSelect(selected);
}

function removeOne(unselected, selected, unselected_restrict, selected_restrict) {
    var unselectedStocks = document.getElementById(unselected);
    var selectedStocks = document.getElementById(selected);
    var un_restrictStockspool = document.getElementById(unselected_restrict);
    var restrictStockspool = document.getElementById(selected_restrict);
    var index = selectedStocks.selectedIndex;
    if (index !== -1) {
        var value = selectedStocks.options[index].value;
        var text = selectedStocks.options[index].text;
        unselectedStocks.add(new Option(text, value));


        var temp = un_restrictStockspool.options;
        for (var i = 0; i < temp.length; i++) {
            if (un_restrictStockspool.options[i].text === text) {
                un_restrictStockspool.options.remove(i);
                break;
            }
        }

        selectedStocks.options.remove(index);

        temp = restrictStockspool.options;
        for (var i = 0; i < temp.length; i++) {
            if (restrictStockspool.options[i].text === text) {
                restrictStockspool.options.remove(i);
                break;
            }
        }

        sortSelect(unselected);
        sortSelect(selected);
    }
}

function removeAll(unselected, selected, unselected_restrict, selected_restrict) {
    var selectedStocks = getAllOptions(selected);
    removeAllOptions(selected);
    removeAllOptions(unselected_restrict);
    removeAllOptions(selected_restrict);
    addOptions(unselected, selectedStocks);
    sortSelect(unselected);
}

function unselectedPoolOnChange(widget, stockPool, unselected, selected) {
    var unselectedStocks = $(unselected);
    var index = widget.selectedIndex;
    var value = widget.options[index].value;
    unselectedStocks.find('option').remove();
    var stocks = stockPool[value];

    var selectedStocks = [];
    var temp = $(selected)[0];
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
    sortSelect(unselected.substring(1));
}

//

function selectOneTrade(unselected, selected) {
    var unselectedTrades = document.getElementById(unselected);
    var selectedTrades = document.getElementById(selected);
    var index = unselectedTrades.selectedIndex;
    if (index !== -1) {
        var value = unselectedTrades.options[index].value;
        var text = unselectedTrades.options[index].text;
        selectedTrades.add(new Option(text, value));
        unselectedTrades.options.remove(index);

        sortSelect(unselected);
        sortSelect(selected);
    }
}

function selectAllTrade(unselected, selected) {
    var unselectedTrades = getAllOptions(unselected);

    removeAllOptions(unselected);
    addOptions(selected, unselectedTrades);
    sortSelect(selected);
}

function removeOneTrade(unselected, selected) {
    var unselectedTrades = document.getElementById(unselected);
    var selectedTrades = document.getElementById(selected);
    var index = selectedTrades.selectedIndex;
    if (index !== -1) {
        var value = selectedTrades.options[index].value;
        var text = selectedTrades.options[index].text;
        unselectedTrades.add(new Option(text, value));
        selectedTrades.options.remove(index);

        sortSelect(unselected);
        sortSelect(selected);
    }
}

function removeAllTrade(unselected, selected) {
    var selectedTrades = getAllOptions(selected);
    removeAllOptions(selected);
    addOptions(unselected, selectedTrades);
    sortSelect(unselected);
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

function selectOneRestrict(unselect, select) {
    var unselectedStocks = document.getElementById(unselect);
    var selectedStocks = document.getElementById(select);
    var index = unselectedStocks.selectedIndex;
    if (index !== -1) {
        var value = unselectedStocks.options[index].value;
        var text = unselectedStocks.options[index].text;
        selectedStocks.add(new Option(text, value));
        unselectedStocks.options.remove(index);

        sortSelect(unselect);
        sortSelect(select);
    }
}

function selectAllRestrict(unselect, select) {
    var unselectedStocks = getAllOptions(unselect);

    removeAllOptions(unselect);
    addOptions(select, unselectedStocks);
    sortSelect(select);

}

function removeOneRestrict(unselect, select) {
    var unselectedStocks = document.getElementById(unselect);
    var selectedStocks = document.getElementById(select);
    var index = selectedStocks.selectedIndex;
    if (index !== -1) {
        var value = selectedStocks.options[index].value;
        var text = selectedStocks.options[index].text;
        unselectedStocks.add(new Option(text, value));
        selectedStocks.options.remove(index);

        sortSelect(unselect);
        sortSelect(select);
    }

}

function removeAllRestrict(unselect, select) {
    var selectedStocks = getAllOptions(select);

    removeAllOptions(select);
    addOptions(unselect, selectedStocks);
    sortSelect(unselect);
}

function buildTradeTable(first, names) {
    if (!first) {
        $("#trade-table").DataTable().clear().destroy();
        $("#trade-table").empty();
    }
    var columns = new Array();
    var data = new Array();
    for (var i = 0; i < names.length; i++) {
        columns.push({"title": names[i], "orderable": false,});
        data.push(0);
    }
    columns.push({"title": '预期收益'});
    data.push(0);
    tradeTable = $('#trade-table').removeAttr('width').DataTable({
        "data": [data],
        "columns": columns,
        searching: false,
        paging: false,
        bPaginate: false,
        bLengthChange: false,
        bFilter: true,
        bInfo: false,
        bAutoWidth: false,
        aaSorting: []
    });
    tradeTable.MakeCellsEditable({
        "onUpdate": myCallbackFunction
    });
    return tradeTable;
}

function myCallbackFunction() {

}

function buildTable(id, dataset, columns) {
    tablecolumns = [];
    for (var key in columns) {
        tablecolumns.push({title: columns[key], orderable: false,});
    }
    $(id).DataTable({
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

    var options = {
        responsive: true,
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true,
                    // max: 1,
                    min: 0
                }
            }]
        },
        legend: {
            display: false
        },
        title: {
            display: false,
            text: name
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },

    };


    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: barNames,
            datasets: [{
                data: barValues,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: options,
        plugins: [{
            beforeInit: function (chart) {
                chart.data.labels.forEach(function (e, i, a) {
                    if (/\n/.test(e)) {
                        a[i] = e.split(/\n/);
                    }
                });
            }
        }]
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
                point: {
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
                point: {
                    radius: 0
                }
            }
        }
    };

    var relativeLine = new Chart(ctx, config);

    return relativeLine;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [month, day, year].join('/');
}