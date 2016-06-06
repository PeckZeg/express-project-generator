const SWIG_FILTERS = {
    return: (cond, val1, val2) => {
        return cond ? val1 : val2
    },

    test: (val, pattern) => {
        return RegExp(pattern).test(val);
    },

    format: require('util').format,
};

module.exports = function(swig) {
    _.each(SWIG_FILTERS, (filter, filterName) => {
        swig.setFilter(filterName, filter);
    });

    return SWIG_FILTERS;
};