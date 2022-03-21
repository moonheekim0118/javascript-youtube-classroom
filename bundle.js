/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js ***!
  \*********************************************************************************/
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/@babel/runtime/node_modules/regenerator-runtime/runtime.js");


/***/ }),

/***/ "./src/js/Store/LibraryStore.js":
/*!**************************************!*\
  !*** ./src/js/Store/LibraryStore.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Storage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Storage */ "./src/js/storage/index.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");




var _reducer;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }



var libraryStorage = new _Storage__WEBPACK_IMPORTED_MODULE_3__["default"]('YOUTUBE_CLASSROOM_LIBRARY');
var initialState = {
  videoList: libraryStorage.read()
};
var reducer = (_reducer = {}, (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_4__.LIBRARY_ACTION.TOGGLE_WATCH_STATUS, function (state, id) {
  var originItem = state.videoList.find(function (_ref) {
    var videoId = _ref.id;
    return videoId === id;
  });

  var updatedItem = _objectSpread(_objectSpread({}, originItem), {}, {
    watched: !originItem.watched
  });

  libraryStorage.update(id, updatedItem);
  return _objectSpread(_objectSpread({}, state), {}, {
    videoList: libraryStorage.read()
  });
}), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_4__.LIBRARY_ACTION.SAVE_VIDEO, function (state, item) {
  if (state.videoList.length >= _Constants__WEBPACK_IMPORTED_MODULE_4__.YOUTUBE_SETTING.MAX_SAVE_NUMBER) {
    throw new Error(_Constants__WEBPACK_IMPORTED_MODULE_4__.MESSAGE.MAX_SAVE_VIDEO);
  }

  libraryStorage.create(item);
  return _objectSpread(_objectSpread({}, state), {}, {
    videoList: libraryStorage.read()
  });
}), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_4__.LIBRARY_ACTION.REMOVE_VIDEO, function (state, id) {
  libraryStorage["delete"](id);
  return _objectSpread(_objectSpread({}, state), {}, {
    videoList: libraryStorage.read()
  });
}), _reducer);

var LibraryStore = /*#__PURE__*/function () {
  function LibraryStore(initialState, reducer) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, LibraryStore);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "state", {});

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "subscribers", []);

    this.state = initialState;
    this.reducer = reducer;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(LibraryStore, [{
    key: "getState",
    value: function getState() {
      return this.state;
    }
  }, {
    key: "setState",
    value: function setState(newState) {
      this.state = newState;
      this.subscribers.forEach(function (subscriber) {
        return subscriber();
      });
    }
  }, {
    key: "dispatch",
    value: function dispatch(type, payload) {
      if (!this.reducer[type]) return;
      this.setState(this.reducer[type](this.state, payload));
    }
  }, {
    key: "addSubscriber",
    value: function addSubscriber(subscriber) {
      this.subscribers.push(subscriber);
    }
  }]);

  return LibraryStore;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new LibraryStore(initialState, reducer));

/***/ }),

/***/ "./src/js/Store/UIStore.js":
/*!*********************************!*\
  !*** ./src/js/Store/UIStore.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");




var _reducer;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }


var initialState = {
  isModalOpened: false,
  selectedTab: _Constants__WEBPACK_IMPORTED_MODULE_3__.NAVIGATION.WATCH_LATER
};
var reducer = (_reducer = {}, (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_3__.UI_ACTION.OPEN_MODAL, function (state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    isModalOpened: true
  });
}), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_3__.UI_ACTION.CLOSE_MODAL, function (state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    isModalOpened: false
  });
}), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_3__.UI_ACTION.SELECT_PAGE, function (state, page) {
  return _objectSpread(_objectSpread({}, state), {}, {
    selectedTab: page
  });
}), _reducer);

var isStateChanged = function isStateChanged(_ref) {
  var dependedStates = _ref.dependedStates,
      beforeState = _ref.beforeState,
      newState = _ref.newState;
  return dependedStates.length === 0 || dependedStates.some(function (state) {
    return beforeState[state] !== newState[state];
  });
};

var UIStore = /*#__PURE__*/function () {
  function UIStore(_ref2) {
    var initialState = _ref2.initialState,
        reducer = _ref2.reducer;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, UIStore);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "state", {});

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "subscribers", []);

    this.state = initialState;
    this.reducer = reducer;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(UIStore, [{
    key: "getState",
    value: function getState() {
      return this.state;
    }
  }, {
    key: "setState",
    value: function setState(newState) {
      var beforeState = this.state;
      this.state = newState;
      this.subscribers.forEach(function (_ref3) {
        var subscriber = _ref3.subscriber,
            dependedStates = _ref3.dependedStates;

        if (isStateChanged({
          dependedStates: dependedStates,
          beforeState: beforeState,
          newState: newState
        })) {
          subscriber();
        }
      });
    }
  }, {
    key: "dispatch",
    value: function dispatch(type, payload) {
      var _this$reducer$type;

      if (!this.reducer[type]) return;
      this.setState((_this$reducer$type = this.reducer[type](this.state, payload)) !== null && _this$reducer$type !== void 0 ? _this$reducer$type : this.state);
    }
  }, {
    key: "addSubscriber",
    value: function addSubscriber(subscriber) {
      var dependedStates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.subscribers.push({
        subscriber: subscriber,
        dependedStates: dependedStates
      });
    }
  }]);

  return UIStore;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new UIStore({
  initialState: initialState,
  reducer: reducer
}));

/***/ }),

/***/ "./src/js/Store/YoutubeSearchStore.js":
/*!********************************************!*\
  !*** ./src/js/Store/YoutubeSearchStore.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");
/* harmony import */ var _Utils_dataManager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Utils/dataManager */ "./src/js/utils/dataManager.js");
/* harmony import */ var _Api__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @Api */ "./src/js/api.js");






var _reducer;



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }




var initialState = {
  searchKeyword: '',
  isLoading: false,
  isLoaded: false,
  items: [],
  nextPageToken: '',
  error: false,
  isEnded: false
};
var reducer = (_reducer = {}, (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_6__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_KEYWORD, function (state, searchKeyword) {
  return _objectSpread(_objectSpread({}, state), {}, {
    searchKeyword: searchKeyword,
    isLoading: true,
    isLoaded: false,
    items: [],
    nextPageToken: '',
    error: false
  });
}), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_6__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_RESULT_REQUEST, function (state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    isLoading: true,
    isLoaded: false,
    error: false
  });
}), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_6__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_RESULT_SUCCESS, function (state, _ref) {
  var items = _ref.items,
      nextPageToken = _ref.nextPageToken,
      pageInfo = _ref.pageInfo;
  return _objectSpread(_objectSpread({}, state), {}, {
    items: [].concat((0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_3__["default"])(state.items), (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_3__["default"])((0,_Utils_dataManager__WEBPACK_IMPORTED_MODULE_7__.getParsedVideoItems)(items))),
    nextPageToken: nextPageToken,
    isEnded: pageInfo.totalResults <= items.length || !nextPageToken,
    isLoading: false,
    isLoaded: true,
    error: false
  });
}), (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(_reducer, _Constants__WEBPACK_IMPORTED_MODULE_6__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_RESULT_FAIL, function (state) {
  return _objectSpread(_objectSpread({}, state), {}, {
    isLoading: false,
    isLoaded: true,
    error: true
  });
}), _reducer);

var middleware = (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])({}, _Constants__WEBPACK_IMPORTED_MODULE_6__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_RESULT_REQUEST, function () {
  var _ref2 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_2__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_5___default().mark(function _callee(state) {
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_5___default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0,_Api__WEBPACK_IMPORTED_MODULE_8__.requestYoutubeSearch)(state.searchKeyword, state.nextPageToken);

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}());

var YoutubeSearchStore = /*#__PURE__*/function () {
  function YoutubeSearchStore(_ref3) {
    var initialState = _ref3.initialState,
        reducer = _ref3.reducer,
        middleware = _ref3.middleware;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, YoutubeSearchStore);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "state", {});

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "subscribers", []);

    this.state = initialState;
    this.reducer = reducer;
    this.middleware = middleware;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(YoutubeSearchStore, [{
    key: "getState",
    value: function getState() {
      return this.state;
    }
  }, {
    key: "setState",
    value: function setState(newState) {
      this.state = newState;
      this.subscribers.forEach(function (subscriber) {
        return subscriber();
      });
    }
  }, {
    key: "dispatch",
    value: function dispatch(type, payload) {
      var _this$reducer$type;

      if (!this.reducer[type]) return;
      this.setState((_this$reducer$type = this.reducer[type](this.state, payload)) !== null && _this$reducer$type !== void 0 ? _this$reducer$type : this.state);
      this.middleware[type] && this.middleware[type](this.state, payload);
    }
  }, {
    key: "addSubscriber",
    value: function addSubscriber(subscriber) {
      this.subscribers.push(subscriber);
    }
  }]);

  return YoutubeSearchStore;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new YoutubeSearchStore({
  initialState: initialState,
  reducer: reducer,
  middleware: middleware
}));

/***/ }),

/***/ "./src/js/api.js":
/*!***********************!*\
  !*** ./src/js/api.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "requestYoutubeSearch": () => (/* binding */ requestYoutubeSearch)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");
/* harmony import */ var _Utils_dataManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Utils/dataManager */ "./src/js/utils/dataManager.js");
/* harmony import */ var _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Store/YoutubeSearchStore */ "./src/js/Store/YoutubeSearchStore.js");




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }




var controller = new AbortController();
var signal = controller.signal;
var timeout = 8000;

var request = /*#__PURE__*/function () {
  var _ref = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_2___default().mark(function _callee(uri, options) {
    var timer, response, data;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_2___default().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            timer = setTimeout(function () {
              return controller.abort();
            }, timeout);
            _context.next = 3;
            return fetch(uri, _objectSpread(_objectSpread({}, options), {}, {
              signal: signal
            }));

          case 3:
            response = _context.sent;

            if (response.ok) {
              _context.next = 6;
              break;
            }

            throw new Error('서버 오류');

          case 6:
            _context.next = 8;
            return response.json();

          case 8:
            data = _context.sent;
            clearTimeout(timer);
            return _context.abrupt("return", data);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function request(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var requestYoutubeSearch = /*#__PURE__*/function () {
  var _ref2 = (0,_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_2___default().mark(function _callee2() {
    var keyword,
        pageToken,
        uri,
        response,
        _args2 = arguments;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_2___default().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            keyword = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : '';
            pageToken = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : '';
            _context2.prev = 2;
            uri = (0,_Utils_dataManager__WEBPACK_IMPORTED_MODULE_4__.uriBuilder)(_Constants__WEBPACK_IMPORTED_MODULE_3__.YOUTUBE_SETTING.URI, {
              part: 'snippet',
              type: 'video',
              q: keyword,
              maxResults: _Constants__WEBPACK_IMPORTED_MODULE_3__.YOUTUBE_SETTING.MAX_VIDEO_NUMBER,
              key: "AIzaSyB77_WyZvKvxR9pkS_JVEHk83Cr-JoHTGY",
              pageToken: pageToken
            });
            _context2.next = 6;
            return request(uri, {
              method: 'GET'
            });

          case 6:
            response = _context2.sent;
            return _context2.abrupt("return", _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_5__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_3__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_RESULT_SUCCESS, response));

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](2);
            return _context2.abrupt("return", _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_5__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_3__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_RESULT_FAIL));

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 10]]);
  }));

  return function requestYoutubeSearch() {
    return _ref2.apply(this, arguments);
  };
}();

/***/ }),

/***/ "./src/js/constants.js":
/*!*****************************!*\
  !*** ./src/js/constants.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EVENT_TYPE": () => (/* binding */ EVENT_TYPE),
/* harmony export */   "LIBRARY_ACTION": () => (/* binding */ LIBRARY_ACTION),
/* harmony export */   "MESSAGE": () => (/* binding */ MESSAGE),
/* harmony export */   "NAVIGATION": () => (/* binding */ NAVIGATION),
/* harmony export */   "SNACKBAR_CONSIST_TIME": () => (/* binding */ SNACKBAR_CONSIST_TIME),
/* harmony export */   "SNACKBAR_TYPE": () => (/* binding */ SNACKBAR_TYPE),
/* harmony export */   "UI_ACTION": () => (/* binding */ UI_ACTION),
/* harmony export */   "YOUTUBE_SEARCH_ACTION": () => (/* binding */ YOUTUBE_SEARCH_ACTION),
/* harmony export */   "YOUTUBE_SETTING": () => (/* binding */ YOUTUBE_SETTING)
/* harmony export */ });
var YOUTUBE_SEARCH_ACTION = {
  UPDATE_SEARCH_KEYWORD: 'UPDATE_SEARCH_KEYWORD',
  UPDATE_SEARCH_RESULT_REQUEST: 'UPDATE_SEARCH_RESULT_REQUEST',
  UPDATE_SEARCH_RESULT_SUCCESS: 'UPDATE_SEARCH_RESULT_SUCCESS',
  UPDATE_SEARCH_RESULT_FAIL: 'UPDATE_SEARCH_RESULT_FAIL'
};
var UI_ACTION = {
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  SELECT_PAGE: 'SELECT_PAGE'
};
var LIBRARY_ACTION = {
  TOGGLE_WATCH_STATUS: 'TOGGLE_WATCH_STATUS',
  SAVE_VIDEO: 'SAVE_VIDEO',
  REMOVE_VIDEO: 'REMOVE_VIDEO'
};
var NAVIGATION = {
  WATCH_LATER: 'watchLater',
  WATCHED: 'watched',
  SEARCH_MODAL: 'searchModal'
};
var MESSAGE = {
  SERVER_ERROR: '서버에서 에러가 발생했어요!',
  EMPTY_SEARCH_KEYWORD: '검색어를 입력해주세요!',
  MAX_SAVE_VIDEO: '동영상은 최대 100개까지 저장할 수 있습니다.💦',
  SAVE_COMPLETE: '성공적으로 저장되었습니다!🥳',
  CONFIRM_REMOVE_VIDEO: '정말 삭제하시겠습니까?',
  REMOVE_COMPLETE: '동영상이 삭제되었습니다.👻'
};
var YOUTUBE_SETTING = {
  URI: 'https://www.googleapis.com/youtube/v3/search',
  MAX_VIDEO_NUMBER: 10,
  MAX_SAVE_NUMBER: 100
};
var EVENT_TYPE = {
  CLICK: 'click',
  INPUT: 'input',
  SUBMIT: 'submit'
};
var SNACKBAR_TYPE = {
  ERROR: 'ERROR',
  ALERT: 'ALERT'
};
var SNACKBAR_CONSIST_TIME = 4000;

/***/ }),

/***/ "./src/js/display/Share/SnackBar.js":
/*!******************************************!*\
  !*** ./src/js/display/Share/SnackBar.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Utils_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Utils/dom */ "./src/js/utils/dom.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");





var SnackBar = /*#__PURE__*/function () {
  function SnackBar() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, SnackBar);

    this.container = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_2__.$)('#snackbar-container');
    this.timer;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(SnackBar, [{
    key: "open",
    value: function open(message, type) {
      var _this = this;

      if (this.container.childElementCount >= 3) {
        this.close();
      }

      var snackbar = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_2__.createElement)('DIV', {
        className: "snackbar show ".concat(type === _Constants__WEBPACK_IMPORTED_MODULE_3__.SNACKBAR_TYPE.ERROR ? 'error' : 'primary'),
        textContent: message
      });
      this.container.append(snackbar);
      this.timer = setTimeout(function () {
        _this.close();
      }, _Constants__WEBPACK_IMPORTED_MODULE_3__.SNACKBAR_CONSIST_TIME);
    }
  }, {
    key: "close",
    value: function close() {
      this.container.children[0].remove();
    }
  }]);

  return SnackBar;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new SnackBar());

/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/MainContents.js":
/*!*********************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/MainContents.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MainContents)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Utils_dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Utils/dom */ "./src/js/utils/dom.js");
/* harmony import */ var _Utils_dataManager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Utils/dataManager */ "./src/js/utils/dataManager.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");
/* harmony import */ var _Store_LibraryStore__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Store/LibraryStore */ "./src/js/Store/LibraryStore.js");
/* harmony import */ var _Store_UIStore__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @Store/UIStore */ "./src/js/Store/UIStore.js");
/* harmony import */ var _Images_not_saved_jpeg__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @Images/not_saved.jpeg */ "./src/assets/images/not_saved.jpeg");
/* harmony import */ var _Share_SnackBar__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../Share/SnackBar */ "./src/js/display/Share/SnackBar.js");












var MainContents = /*#__PURE__*/function () {
  function MainContents() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, MainContents);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__["default"])(this, "handleClickRemoveButton", function (_ref) {
      var $target = _ref.target;
      var videoId = $target.closest('.list-item').dataset.videoId;

      if (confirm(_Constants__WEBPACK_IMPORTED_MODULE_6__.MESSAGE.CONFIRM_REMOVE_VIDEO)) {
        _Store_LibraryStore__WEBPACK_IMPORTED_MODULE_7__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_6__.LIBRARY_ACTION.REMOVE_VIDEO, videoId);
        _Share_SnackBar__WEBPACK_IMPORTED_MODULE_10__["default"].open(_Constants__WEBPACK_IMPORTED_MODULE_6__.MESSAGE.REMOVE_COMPLETE, _Constants__WEBPACK_IMPORTED_MODULE_6__.SNACKBAR_TYPE.ALERT);
      }
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__["default"])(this, "handleToggleWatched", function (_ref2) {
      var $target = _ref2.target;
      var videoId = $target.closest('.list-item').dataset.videoId;
      _Store_LibraryStore__WEBPACK_IMPORTED_MODULE_7__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_6__.LIBRARY_ACTION.TOGGLE_WATCH_STATUS, videoId);
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__["default"])(this, "render", function () {
      _this.container.replaceChildren();

      _this.$videoList.replaceChildren();

      var _UIStore$getState = _Store_UIStore__WEBPACK_IMPORTED_MODULE_8__["default"].getState(),
          selectedTab = _UIStore$getState.selectedTab;

      var _LibraryStore$getStat = _Store_LibraryStore__WEBPACK_IMPORTED_MODULE_7__["default"].getState(),
          videoList = _LibraryStore$getStat.videoList;

      var isWatched = selectedTab === _Constants__WEBPACK_IMPORTED_MODULE_6__.NAVIGATION.WATCHED;
      var filteredVideoList = (0,_Utils_dataManager__WEBPACK_IMPORTED_MODULE_5__.filterVideoByStatus)(videoList, isWatched);
      var $fragment = document.createDocumentFragment();
      filteredVideoList.length === 0 ? $fragment.append(_this.getNoResults()) : $fragment.append(_this.getVideoList(filteredVideoList, isWatched));

      _this.container.append($fragment);
    });

    this.container = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.$)('#main-contents');
    this.$videoList = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('UL', {
      className: 'classroom-main__list',
      id: 'saved-video-list'
    });
    _Store_UIStore__WEBPACK_IMPORTED_MODULE_8__["default"].addSubscriber(this.render, ['selectedTab']);
    _Store_LibraryStore__WEBPACK_IMPORTED_MODULE_7__["default"].addSubscriber(this.render);
    this.bindEvents();
    this.render();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(MainContents, [{
    key: "bindEvents",
    value: function bindEvents() {
      (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.addEvent)(this.container, {
        eventType: _Constants__WEBPACK_IMPORTED_MODULE_6__.EVENT_TYPE.CLICK,
        selector: '#remove-video-button',
        handler: this.handleClickRemoveButton
      });
      (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.addEvent)(this.container, {
        eventType: _Constants__WEBPACK_IMPORTED_MODULE_6__.EVENT_TYPE.CLICK,
        selector: '#toggle-watched-button',
        handler: this.handleToggleWatched
      });
    }
  }, {
    key: "getVideoList",
    value: function getVideoList(videos, isWatched) {
      var _this$$videoList;

      var $listElements = videos.map(function (_ref3) {
        var id = _ref3.id,
            videoData = _ref3.videoData;
        var videoTitle = videoData.videoTitle,
            videoChanneltitle = videoData.videoChanneltitle,
            videoPublishtime = videoData.videoPublishtime,
            videoThumbnail = videoData.videoThumbnail;
        return (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('LI', {
          dataset: {
            'video-id': id
          },
          className: 'list-item',
          innerHTML: "<img\n        src=\"".concat(videoThumbnail, "\"\n        alt=\"video-item-thumbnail\" class=\"list-item__thumbnail\"\n        loading=\"lazy\"\n        >\n      <h4 class=\"list-item__title\">").concat(videoTitle, "</h4>\n      <p class=\"list-item__channel-name\">").concat(videoChanneltitle, "</p>\n      <p class=\"list-item__published-date\">").concat((0,_Utils_dataManager__WEBPACK_IMPORTED_MODULE_5__.getParsedTime)(videoPublishtime), "</p>\n      <button id=\"toggle-watched-button\" class=\"list-item__toggle-button ").concat(isWatched ? 'watched' : '', "\" type=\"button\"\n      aria-label=\"toggle watch status\"\n      >\u2705</button>\n      <button id=\"remove-video-button\" class=\"list-item__remove-button\" type=\"button\" aria-label=\"delete video\">\uD83D\uDDD1\uFE0F</button>\n     ")
        });
      });

      (_this$$videoList = this.$videoList).append.apply(_this$$videoList, (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])($listElements));

      return this.$videoList;
    }
  }, {
    key: "getNoResults",
    value: function getNoResults() {
      return (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('IMG', {
        className: 'no-save__image',
        alt: 'no save image',
        src: _Images_not_saved_jpeg__WEBPACK_IMPORTED_MODULE_9__["default"]
      });
    }
  }]);

  return MainContents;
}();



/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/Modal.js":
/*!**************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/Modal.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Modal)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Utils_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Utils/dom */ "./src/js/utils/dom.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");
/* harmony import */ var _Store_UIStore__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Store/UIStore */ "./src/js/Store/UIStore.js");







var Modal = /*#__PURE__*/function () {
  function Modal() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Modal);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleCloseModal", function () {
      _Store_UIStore__WEBPACK_IMPORTED_MODULE_5__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_4__.UI_ACTION.CLOSE_MODAL);
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "render", function () {
      var _UIStore$getState = _Store_UIStore__WEBPACK_IMPORTED_MODULE_5__["default"].getState(),
          isModalOpened = _UIStore$getState.isModalOpened;

      if (isModalOpened) {
        _this.container.classList.remove('hide');

        _this.$modal.classList.add('show');

        return;
      }

      _this.container.classList.add('hide');

      _this.$modal.classList.remove('show');
    });

    this.container = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.$)('#modal');
    this.$modal = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.$)('#search-modal');
    this.bindEvents();
    _Store_UIStore__WEBPACK_IMPORTED_MODULE_5__["default"].addSubscriber(this.render, ['isModalOpened']);
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Modal, [{
    key: "bindEvents",
    value: function bindEvents() {
      (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.addEvent)(this.container, {
        eventType: _Constants__WEBPACK_IMPORTED_MODULE_4__.EVENT_TYPE.CLICK,
        selector: '.dimmer',
        handler: this.handleCloseModal
      });
    }
  }]);

  return Modal;
}();



/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/Navigation.js":
/*!*******************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/Navigation.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Navigation)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Utils_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Utils/dom */ "./src/js/utils/dom.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");
/* harmony import */ var _Store_UIStore__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Store/UIStore */ "./src/js/Store/UIStore.js");







var Navigation = /*#__PURE__*/function () {
  function Navigation() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Navigation);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleClickNavigation", function (_ref) {
      var $target = _ref.target;
      var navigation = $target.dataset.navigation;
      if (!navigation) return;

      if (navigation === _Constants__WEBPACK_IMPORTED_MODULE_4__.NAVIGATION.SEARCH_MODAL) {
        _Store_UIStore__WEBPACK_IMPORTED_MODULE_5__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_4__.UI_ACTION.OPEN_MODAL);
        return;
      }

      _this.selectNavigation(navigation);

      _Store_UIStore__WEBPACK_IMPORTED_MODULE_5__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_4__.UI_ACTION.SELECT_PAGE, navigation);
    });

    this.container = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.$)('#classroom-navigation');
    this.$watchLaterNavigation = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.$)('#watch-later-list-button', this.container);
    this.$watchedNavigation = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.$)('#watched-list-button', this.container);
    this.bindEvents();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Navigation, [{
    key: "bindEvents",
    value: function bindEvents() {
      (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.addEvent)(this.container, {
        eventType: _Constants__WEBPACK_IMPORTED_MODULE_4__.EVENT_TYPE.CLICK,
        selector: '#classroom-navigation',
        handler: this.handleClickNavigation
      });
    }
  }, {
    key: "selectNavigation",
    value: function selectNavigation(navigation) {
      if (navigation === _Constants__WEBPACK_IMPORTED_MODULE_4__.NAVIGATION.WATCH_LATER) {
        this.$watchedNavigation.classList.remove('selected');
        this.$watchLaterNavigation.classList.add('selected');
        return;
      }

      this.$watchLaterNavigation.classList.remove('selected');
      this.$watchedNavigation.classList.add('selected');
    }
  }]);

  return Navigation;
}();



/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/SearchForm.js":
/*!*******************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/SearchForm.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SearchForm)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Utils_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Utils/dom */ "./src/js/utils/dom.js");
/* harmony import */ var _Utils_validator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Utils/validator */ "./src/js/utils/validator.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");
/* harmony import */ var _Utils_elementController__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Utils/elementController */ "./src/js/utils/elementController.js");
/* harmony import */ var _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Store/YoutubeSearchStore */ "./src/js/Store/YoutubeSearchStore.js");









var SearchForm = /*#__PURE__*/function () {
  function SearchForm() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, SearchForm);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleInputValue", function (_ref) {
      var $target = _ref.target;
      var $searchButton = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.$)('#search-button', _this.container);
      (0,_Utils_elementController__WEBPACK_IMPORTED_MODULE_6__.onEnableButton)($searchButton, function () {
        return $target.value.length > 0;
      });
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "handleSubmitForm", function (event) {
      event.preventDefault();
      var newKeyword = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.$)('#search-input-keyword', _this.container).value.trim();

      var _YoutubeSearchStore$g = _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_7__["default"].getState(),
          isLoading = _YoutubeSearchStore$g.isLoading,
          beforeKeyword = _YoutubeSearchStore$g.keyword;

      if ((0,_Utils_validator__WEBPACK_IMPORTED_MODULE_4__.isEmptyString)(newKeyword)) {
        alert(_Constants__WEBPACK_IMPORTED_MODULE_5__.MESSAGE.EMPTY_SEARCH_KEYWORD);
        return;
      }

      if ((0,_Utils_validator__WEBPACK_IMPORTED_MODULE_4__.isSameKeyword)(beforeKeyword, newKeyword) || isLoading) {
        return;
      }

      _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_7__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_5__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_KEYWORD, newKeyword);
      _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_7__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_5__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_RESULT_REQUEST);
    });

    this.container = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.$)('#search-form');
    this.bindEvents();
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(SearchForm, [{
    key: "bindEvents",
    value: function bindEvents() {
      (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.addEvent)(this.container, {
        eventType: _Constants__WEBPACK_IMPORTED_MODULE_5__.EVENT_TYPE.INPUT,
        selector: '#search-input-keyword',
        handler: this.handleInputValue
      });
      (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_3__.addEvent)(this.container, {
        eventType: _Constants__WEBPACK_IMPORTED_MODULE_5__.EVENT_TYPE.SUBMIT,
        selector: '#search-form',
        handler: this.handleSubmitForm
      });
    }
  }]);

  return SearchForm;
}();



/***/ }),

/***/ "./src/js/display/YoutubeClassRoom/SearchResult.js":
/*!*********************************************************!*\
  !*** ./src/js/display/YoutubeClassRoom/SearchResult.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SearchResult)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Utils_dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Utils/dom */ "./src/js/utils/dom.js");
/* harmony import */ var _Utils_dataManager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Utils/dataManager */ "./src/js/utils/dataManager.js");
/* harmony import */ var _Utils_elementController__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Utils/elementController */ "./src/js/utils/elementController.js");
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Constants */ "./src/js/constants.js");
/* harmony import */ var _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @Store/YoutubeSearchStore */ "./src/js/Store/YoutubeSearchStore.js");
/* harmony import */ var _Store_LibraryStore__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @Store/LibraryStore */ "./src/js/Store/LibraryStore.js");
/* harmony import */ var _Images_not_found_jpeg__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @Images/not_found.jpeg */ "./src/assets/images/not_found.jpeg");
/* harmony import */ var _Share_SnackBar__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../Share/SnackBar */ "./src/js/display/Share/SnackBar.js");













var SearchResult = /*#__PURE__*/function () {
  function SearchResult() {
    var _this = this;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, SearchResult);

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__["default"])(this, "handleClickSaveButton", function (_ref) {
      var $target = _ref.target;

      try {
        var _$target$closest$data = $target.closest('.list-item').dataset,
            videoId = _$target$closest$data.videoId,
            videoTitle = _$target$closest$data.videoTitle,
            videoChanneltitle = _$target$closest$data.videoChanneltitle,
            videoPublishtime = _$target$closest$data.videoPublishtime,
            videoThumbnail = _$target$closest$data.videoThumbnail;
        _Store_LibraryStore__WEBPACK_IMPORTED_MODULE_9__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_7__.LIBRARY_ACTION.SAVE_VIDEO, {
          id: videoId,
          videoData: {
            videoTitle: videoTitle,
            videoChanneltitle: videoChanneltitle,
            videoPublishtime: videoPublishtime,
            videoThumbnail: videoThumbnail
          },
          watched: false
        });
        $target.classList.add('hide');
        _Share_SnackBar__WEBPACK_IMPORTED_MODULE_11__["default"].open(_Constants__WEBPACK_IMPORTED_MODULE_7__.MESSAGE.SAVE_COMPLETE, _Constants__WEBPACK_IMPORTED_MODULE_7__.SNACKBAR_TYPE.ALERT);
      } catch (error) {
        _Share_SnackBar__WEBPACK_IMPORTED_MODULE_11__["default"].open(error, _Constants__WEBPACK_IMPORTED_MODULE_7__.SNACKBAR_TYPE.ERROR);
      }
    });

    (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__["default"])(this, "render", function () {
      var _YoutubeSearchStore$g = _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__["default"].getState(),
          isLoading = _YoutubeSearchStore$g.isLoading,
          isLoaded = _YoutubeSearchStore$g.isLoaded,
          items = _YoutubeSearchStore$g.items,
          isEnded = _YoutubeSearchStore$g.isEnded,
          error = _YoutubeSearchStore$g.error;

      _this.$videoList.replaceChildren();

      if (error) {
        _Share_SnackBar__WEBPACK_IMPORTED_MODULE_11__["default"].open(_Constants__WEBPACK_IMPORTED_MODULE_7__.MESSAGE.SERVER_ERROR, _Constants__WEBPACK_IMPORTED_MODULE_7__.SNACKBAR_TYPE.ERROR);
      }

      if (items.length <= 0 && isLoaded) {
        _this.$videoList.append(_this.getResultNotFound());

        return;
      }

      var $fragment = document.createDocumentFragment();

      if (items.length > 0) {
        $fragment.append.apply($fragment, (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_this.getVideoList(items)));
      }

      if (isLoading && !isEnded && !error) {
        $fragment.append.apply($fragment, (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_this.$skeleton));
      }

      $fragment.append(_this.$scrollObserver);

      _this.$videoList.append($fragment);
    });

    this.container = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.$)('#search-result');
    this.$videoList = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.$)('#video-list', this.container);
    this.$tempFragment = document.createDocumentFragment();
    this.$scrollObserver = (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('DIV', {
      id: 'search-result-scroll-observer'
    });
    this.$skeleton = Array.from({
      length: _Constants__WEBPACK_IMPORTED_MODULE_7__.YOUTUBE_SETTING.MAX_VIDEO_NUMBER
    }).map(function () {
      return (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('DIV', {
        className: 'skeleton',
        innerHTML: "\n        <div class=\"image\"></div>\n        <p class=\"line\"></p>\n        <p class=\"line\"></p>\n      "
      });
    });
    this.bindEvents();
    _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__["default"].addSubscriber(this.render);
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(SearchResult, [{
    key: "bindEvents",
    value: function bindEvents() {
      (0,_Utils_elementController__WEBPACK_IMPORTED_MODULE_6__.onObserveElement)(this.$scrollObserver, function () {
        var _YoutubeSearchStore$g2 = _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__["default"].getState(),
            isLoading = _YoutubeSearchStore$g2.isLoading,
            isEnded = _YoutubeSearchStore$g2.isEnded,
            error = _YoutubeSearchStore$g2.error;

        if (isLoading || isEnded || error) return;
        _Store_YoutubeSearchStore__WEBPACK_IMPORTED_MODULE_8__["default"].dispatch(_Constants__WEBPACK_IMPORTED_MODULE_7__.YOUTUBE_SEARCH_ACTION.UPDATE_SEARCH_RESULT_REQUEST);
      });
      (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.addEvent)(this.container, {
        eventType: _Constants__WEBPACK_IMPORTED_MODULE_7__.EVENT_TYPE.CLICK,
        selector: '.list-item__save-button',
        handler: this.handleClickSaveButton
      });
    }
  }, {
    key: "getResultNotFound",
    value: function getResultNotFound() {
      return (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('IMG', {
        className: 'no-result__image',
        alt: 'no result image',
        src: _Images_not_found_jpeg__WEBPACK_IMPORTED_MODULE_10__["default"]
      });
    }
  }, {
    key: "getVideoList",
    value: function getVideoList(items) {
      return items.map(function (_ref2) {
        var videoId = _ref2.videoId,
            title = _ref2.title,
            channelTitle = _ref2.channelTitle,
            publishTime = _ref2.publishTime,
            thumbnails = _ref2.thumbnails;

        var _LibraryStore$getStat = _Store_LibraryStore__WEBPACK_IMPORTED_MODULE_9__["default"].getState(),
            videoList = _LibraryStore$getStat.videoList;

        var isSaved = videoList.some(function (_ref3) {
          var id = _ref3.id;
          return id === videoId;
        });
        return (0,_Utils_dom__WEBPACK_IMPORTED_MODULE_4__.createElement)('LI', {
          dataset: {
            'video-id': videoId,
            'video-title': title,
            'video-channelTitle': channelTitle,
            'video-publishTime': publishTime,
            'video-thumbnail': thumbnails
          },
          className: 'list-item',
          innerHTML: "<img\n          src=\"".concat(thumbnails, "\"\n          alt=\"video-item-thumbnail\" class=\"list-item__thumbnail\"\n          loading=\"lazy\"\n          >\n        <h4 class=\"list-item__title\">").concat(title, "</h4>\n        <p class=\"list-item__channel-name\">").concat(channelTitle, "</p>\n        <p class=\"list-item__published-date\">").concat((0,_Utils_dataManager__WEBPACK_IMPORTED_MODULE_5__.getParsedTime)(publishTime), "</p>\n        ").concat(isSaved ? '' : '<button class="list-item__save-button button" type="button" aria-label="save video">⬇ 저장</button>')
        });
      });
    }
  }]);

  return SearchResult;
}();



/***/ }),

/***/ "./src/js/display/index.js":
/*!*********************************!*\
  !*** ./src/js/display/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _YoutubeClassRoom_Navigation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./YoutubeClassRoom/Navigation */ "./src/js/display/YoutubeClassRoom/Navigation.js");
/* harmony import */ var _YoutubeClassRoom_Modal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./YoutubeClassRoom/Modal */ "./src/js/display/YoutubeClassRoom/Modal.js");
/* harmony import */ var _YoutubeClassRoom_SearchForm__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./YoutubeClassRoom/SearchForm */ "./src/js/display/YoutubeClassRoom/SearchForm.js");
/* harmony import */ var _YoutubeClassRoom_SearchResult__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./YoutubeClassRoom/SearchResult */ "./src/js/display/YoutubeClassRoom/SearchResult.js");
/* harmony import */ var _YoutubeClassRoom_MainContents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./YoutubeClassRoom/MainContents */ "./src/js/display/YoutubeClassRoom/MainContents.js");






var initDisplays = function initDisplays() {
  new _YoutubeClassRoom_Modal__WEBPACK_IMPORTED_MODULE_1__["default"]();
  new _YoutubeClassRoom_MainContents__WEBPACK_IMPORTED_MODULE_4__["default"]();
  new _YoutubeClassRoom_Navigation__WEBPACK_IMPORTED_MODULE_0__["default"]();
  new _YoutubeClassRoom_SearchForm__WEBPACK_IMPORTED_MODULE_2__["default"]();
  new _YoutubeClassRoom_SearchResult__WEBPACK_IMPORTED_MODULE_3__["default"]();
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (initDisplays);

/***/ }),

/***/ "./src/js/storage/index.js":
/*!*********************************!*\
  !*** ./src/js/storage/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Storage)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");





function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

var _set = /*#__PURE__*/new WeakSet();

var Storage = /*#__PURE__*/function () {
  function Storage(key) {
    var storage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : localStorage;

    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__["default"])(this, Storage);

    _classPrivateMethodInitSpec(this, _set);

    this.key = key;
    this.storage = storage;
  }

  (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__["default"])(Storage, [{
    key: "create",
    value: function create(item) {
      var items = this.read();

      _classPrivateMethodGet(this, _set, _set2).call(this, [].concat((0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__["default"])(items), [item]));
    }
  }, {
    key: "read",
    value: function read() {
      var _this$storage$getItem;

      var items = (_this$storage$getItem = this.storage.getItem(this.key)) !== null && _this$storage$getItem !== void 0 ? _this$storage$getItem : '[]';
      return JSON.parse(items);
    }
  }, {
    key: "update",
    value: function update(id, newItem) {
      var updatedItems = this.read().map(function (item) {
        if (item.id === id) {
          return _objectSpread({
            id: id
          }, newItem);
        }

        return item;
      });

      _classPrivateMethodGet(this, _set, _set2).call(this, updatedItems);
    }
  }, {
    key: "delete",
    value: function _delete(targetId) {
      _classPrivateMethodGet(this, _set, _set2).call(this, this.read().filter(function (_ref) {
        var id = _ref.id;
        return targetId !== id;
      }));
    }
  }]);

  return Storage;
}();

function _set2(items) {
  this.storage.setItem(this.key, JSON.stringify(items));
}



/***/ }),

/***/ "./src/js/utils/dataManager.js":
/*!*************************************!*\
  !*** ./src/js/utils/dataManager.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filterVideoByStatus": () => (/* binding */ filterVideoByStatus),
/* harmony export */   "getParsedTime": () => (/* binding */ getParsedTime),
/* harmony export */   "getParsedVideoItems": () => (/* binding */ getParsedVideoItems),
/* harmony export */   "uriBuilder": () => (/* binding */ uriBuilder)
/* harmony export */ });
var getParsedTime = function getParsedTime(timeString) {
  var time = new Date(timeString);
  return "".concat(time.getFullYear(), "\uB144 ").concat(time.getMonth() + 1, "\uC6D4 ").concat(time.getDate(), "\uC77C");
};
var uriBuilder = function uriBuilder(endPoint, params) {
  return "".concat(endPoint, "?").concat(new URLSearchParams(params).toString());
};
var filterVideoByStatus = function filterVideoByStatus(videos, status) {
  return videos.filter(function (_ref) {
    var watched = _ref.watched;
    return watched === status;
  });
};
var getParsedVideoItems = function getParsedVideoItems(items) {
  return items.map(function (item) {
    var videoId = item.id.videoId;
    var _item$snippet = item.snippet,
        title = _item$snippet.title,
        channelTitle = _item$snippet.channelTitle,
        publishTime = _item$snippet.publishTime,
        thumbnails = _item$snippet.thumbnails;
    return {
      videoId: videoId,
      title: title,
      channelTitle: channelTitle,
      publishTime: publishTime,
      thumbnails: thumbnails.medium.url
    };
  });
};

/***/ }),

/***/ "./src/js/utils/dom.js":
/*!*****************************!*\
  !*** ./src/js/utils/dom.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "$": () => (/* binding */ $),
/* harmony export */   "$$": () => (/* binding */ $$),
/* harmony export */   "addEvent": () => (/* binding */ addEvent),
/* harmony export */   "createElement": () => (/* binding */ createElement)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");


var $ = function $(selector) {
  var parentElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  return parentElement.querySelector(selector);
};
var $$ = function $$(selector) {
  var parentElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  return parentElement.querySelectorAll(selector);
};
var addEvent = function addEvent(container, _ref) {
  var eventType = _ref.eventType,
      selector = _ref.selector,
      handler = _ref.handler;

  var children = (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__["default"])($$(selector, container));

  var isTarget = function isTarget(target) {
    return children.includes(target) || target.closest(selector);
  };

  container.addEventListener(eventType, function (event) {
    if (!isTarget(event.target)) return;
    handler(event);
  });
};
var createElement = function createElement(tagName) {
  var property = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var $create = document.createElement(tagName);
  Object.entries(property).forEach(function (_ref2) {
    var _ref3 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref2, 2),
        key = _ref3[0],
        value = _ref3[1];

    if (key === 'dataset') {
      Object.entries(value).forEach(function (_ref4) {
        var _ref5 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref4, 2),
            datasetId = _ref5[0],
            datasetValue = _ref5[1];

        return $create.setAttribute("data-".concat(datasetId), datasetValue);
      });
    }

    if (typeof $create[key] === 'string') {
      $create[key] = value;
    }
  });
  return $create;
};

/***/ }),

/***/ "./src/js/utils/elementController.js":
/*!*******************************************!*\
  !*** ./src/js/utils/elementController.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "onEnableButton": () => (/* binding */ onEnableButton),
/* harmony export */   "onObserveElement": () => (/* binding */ onObserveElement)
/* harmony export */ });
var isNotHTMLElement = function isNotHTMLElement($element) {
  return $element instanceof HTMLElement === false;
};

var onEnableButton = function onEnableButton($eventTarget, condition) {
  if (isNotHTMLElement($eventTarget)) {
    return;
  }

  $eventTarget.disabled = !condition($eventTarget);
};
var onObserveElement = function onObserveElement($element, handler) {
  var scrollObserver = new IntersectionObserver(function (entry) {
    if (entry[0].isIntersecting) {
      handler();
    }
  }, {
    threshold: 0.5
  });
  scrollObserver.observe($element);
};

/***/ }),

/***/ "./src/js/utils/validator.js":
/*!***********************************!*\
  !*** ./src/js/utils/validator.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isEmptyString": () => (/* binding */ isEmptyString),
/* harmony export */   "isSameKeyword": () => (/* binding */ isSameKeyword)
/* harmony export */ });
var isEmptyString = function isEmptyString(value) {
  return value.length === 0;
};
var isSameKeyword = function isSameKeyword(beforeKeyword, newKeyword) {
  return beforeKeyword === newKeyword;
};

/***/ }),

/***/ "./src/assets/images/not_found.jpeg":
/*!******************************************!*\
  !*** ./src/assets/images/not_found.jpeg ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "187c4faa75a364aa2f11b2bce8f50def.jpeg");

/***/ }),

/***/ "./src/assets/images/not_saved.jpeg":
/*!******************************************!*\
  !*** ./src/assets/images/not_saved.jpeg ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "7b96566343731de932b5fa1973343d55.jpeg");

/***/ }),

/***/ "./src/css/index.css":
/*!***************************!*\
  !*** ./src/css/index.css ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayLikeToArray)
/* harmony export */ });
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithHoles)
/* harmony export */ });
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithoutHoles)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _asyncToGenerator)
/* harmony export */ });
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classCallCheck)
/* harmony export */ });
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/createClass.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _createClass)
/* harmony export */ });
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/defineProperty.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _defineProperty)
/* harmony export */ });
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArray)
/* harmony export */ });
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArrayLimit)
/* harmony export */ });
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableRest)
/* harmony export */ });
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableSpread)
/* harmony export */ });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _slicedToArray)
/* harmony export */ });
/* harmony import */ var _arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js");
/* harmony import */ var _iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableRest.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js");




function _slicedToArray(arr, i) {
  return (0,_arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr, i) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr, i) || (0,_nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _toConsumableArray)
/* harmony export */ });
/* harmony import */ var _arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(arr) {
  return (0,_arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr) || (0,_nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _unsupportedIterableToArray)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Display__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Display */ "./src/js/display/index.js");
/* harmony import */ var _css_index_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../css/index.css */ "./src/css/index.css");


(0,_Display__WEBPACK_IMPORTED_MODULE_0__["default"])();
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map