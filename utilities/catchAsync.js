// This function takes in a function
// But then return a same function that catch an error, and passing it onto next
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}