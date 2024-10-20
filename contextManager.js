let context = {};

function setContext(key, value) {
    context[key] = value;
}

function getContext(key) {
    return context[key] || null;
}

function clearContext() {
    context = {};
}

module.exports = { setContext, getContext, clearContext };
