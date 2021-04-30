// module.exports = func => {
//     return (req, res, next) => {
//         func(req, res, next).catch(e => next(e));
//     }
// }

// function catchAsync(func) {
//     return function(req, res, next) {
//         func(req, res, next).catch(e => next(e));
//     }
// }

const catchAsync = func => {
    return function(req, res, next) {
        func(req, res, next).catch(e => next(e));
    }
}

module.exports = catchAsync;