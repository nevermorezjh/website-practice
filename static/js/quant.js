function initialize() {
    var unselected_stockpool = document.getElementById("unselected-stockpool");
    unselected_stockpool.options.add(new Option("ni", "xxx"));
    unselected_stockpool.options.add(new Option("wo", "yyy"));
    console.log(unselected_stockpool);
}