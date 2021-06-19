"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var Fade_1 = __importDefault(require("react-reveal/Fade"));
var axios_1 = __importDefault(require("axios"));
var react_bootstrap_1 = require("react-bootstrap");
// Icons
var react_fontawesome_1 = require("@fortawesome/react-fontawesome");
var faRetweet_1 = require("@fortawesome/free-solid-svg-icons/faRetweet");
var Home = function () {
    var swapSVG = react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: faRetweet_1.faRetweet, size: "2x" });
    var API_USERNAME = process.env.REACT_APP_API_USERNAME;
    var API_PASSWORD = process.env.REACT_APP_API_PASSWORD;
    // List of currencies and their ISO, fetched from XE API
    var _a = react_1.useState([]), currencies = _a[0], setCurrencies = _a[1];
    // Amount to be converted stored in state
    var _b = react_1.useState(''), amount = _b[0], setAmount = _b[1];
    // The pair to be converted at any given moment, stored as two objects in state
    var _c = react_1.useState(), pair = _c[0], setPair = _c[1];
    // Loader to be displayed before axios realises the fetch from the API's
    var _d = react_1.useState(false), loaded = _d[0], setLoaded = _d[1];
    // The output from the conversion stored in state
    var _e = react_1.useState(), output = _e[0], setOutput = _e[1];
    // Fetch the initial list of currencies that are available to convert. Only on initial render.
    react_1.useEffect(function () {
        axios_1.default.get('https://xecdapi.xe.com/v1/currencies', {
            auth: {
                username: API_USERNAME,
                password: API_PASSWORD
            }
        })
            .then(function (resp) {
            var currencies = resp.data.currencies;
            // Fetch flags for each country from REST countries API (not all flags are available)
            axios_1.default.get('https://restcountries.eu/rest/v2/all')
                .then(function (resp) {
                console.log(resp.data);
                var countries = resp.data;
                // Map over the currencies, and match their respective ISO code to the country ISO in the REST Countries API,
                // then return the currency object along with the flag image url. No flag means a placeholder is added.
                var currenciesWithFlags = currencies.map(function (obj) {
                    var flagFound = countries.find(function (country) { return country.currencies[0].code === obj.iso; });
                    if (obj.currency_name === 'US Dollar')
                        return __assign(__assign({}, obj), { flag: 'https://restcountries.eu/data/usa.svg' });
                    else if (!flagFound)
                        return __assign(__assign({}, obj), { flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1200px-Blue_question_mark_icon.svg.png' });
                    else if (flagFound)
                        return __assign(__assign({}, obj), { flag: flagFound.flag });
                });
                // Set the initial pair of currencies, I've chosen USD and PLN
                setPair({ from: __assign({}, currenciesWithFlags[149]), to: __assign({}, currenciesWithFlags[115]) });
                // Set the currency list for the user to chose from
                setCurrencies(currenciesWithFlags);
                setLoaded(true);
            })
                .catch(function (err) {
                console.log(err);
            });
        })
            .catch(function (err) {
            console.log(err);
        });
    }, []);
    // Axios request to make the conversion, based on data from the pair state
    function convert(event) {
        event.preventDefault();
        if (amount) {
            axios_1.default.get("https://xecdapi.xe.com/v1/convert_from.json/?from=" + pair.from.iso + "&to=" + pair.to.iso + "&amount=" + amount + "&decimal_places=2", {
                auth: {
                    username: API_USERNAME,
                    password: API_PASSWORD
                }
            })
                .then(function (resp) {
                setOutput({ from: pair.from.currency_name, to: pair.to.currency_name, amount: numberWithCommas(amount), result: numberWithCommas(resp.data.to[0].mid) });
            })
                .catch(function (err) {
                console.log(err);
            });
        }
    }
    // Add commas to output digits
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    // When currrency is changed, update the pair state. First find all the needed information using .find.
    //  The pair state information on each currency is needed for the select and the output.
    function handlePair(iso, fromTo) {
        var currency = currencies.find(function (curr) { return curr.iso === iso; });
        if (fromTo === 'from')
            setPair(__assign(__assign({}, pair), { from: __assign({}, currency) }));
        if (fromTo === 'to')
            setPair(__assign(__assign({}, pair), { to: __assign({}, currency) }));
    }
    // Check if object is empty by looking at its properties, needed to only display output when necessary.
    function isEmpty(obj) {
        if (!output)
            return true;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }
    console.log(currencies);
    console.log(pair);
    return (react_1.default.createElement("main", null,
        loaded && react_1.default.createElement("div", { className: "cc-container" },
            react_1.default.createElement(Fade_1.default, null,
                react_1.default.createElement(react_bootstrap_1.Form, null,
                    react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "formBasicNumber" },
                        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Amount"),
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", value: amount, size: "lg", min: '0', onChange: function (e) { return setAmount(e.target.value); } })),
                    react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "select-custom1" },
                        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "From"),
                        react_1.default.createElement(react_bootstrap_1.InputGroup, { className: "mb-2" },
                            react_1.default.createElement(react_bootstrap_1.InputGroup.Prepend, null,
                                react_1.default.createElement(react_bootstrap_1.InputGroup.Text, null,
                                    react_1.default.createElement("img", { style: { width: '30px' }, "aria-label": "Flag", src: pair.from.flag }))),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", value: pair.from.iso, size: "lg", custom: true, onChange: function (e) { return handlePair(e.target.value, 'from'); } }, currencies.map(function (currency, index) {
                                return react_1.default.createElement("option", { key: index, value: currency.iso, label: currency.currency_name }, currency.currency_name);
                            })))),
                    react_1.default.createElement(react_bootstrap_1.Button, { id: "btn-swap", "aria-label": "Swap", onClick: function () { return setPair({ from: pair.to, to: pair.from }); } }, swapSVG),
                    react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "select-custom2" },
                        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "To"),
                        react_1.default.createElement(react_bootstrap_1.InputGroup, { className: "mb-2" },
                            react_1.default.createElement(react_bootstrap_1.InputGroup.Prepend, null,
                                react_1.default.createElement(react_bootstrap_1.InputGroup.Text, null,
                                    react_1.default.createElement("img", { style: { width: '30px' }, alt: "Flag", src: pair.to.flag }))),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select", value: pair.to.iso, size: "lg", custom: true, onChange: function (e) { return handlePair(e.target.value, 'to'); } }, currencies.map(function (currency, index) {
                                return react_1.default.createElement("option", { key: index, value: currency.iso, label: currency.currency_name }, currency.currency_name);
                            })))),
                    !isEmpty(output) && react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
                        output.amount,
                        " ",
                        output.from,
                        " =",
                        react_1.default.createElement("br", null),
                        react_1.default.createElement("span", null,
                            output.result,
                            " ",
                            output.to)),
                    react_1.default.createElement(react_bootstrap_1.Button, { onClick: convert, disabled: !amount ? true : false, style: { width: '100%' }, variant: "primary", type: "submit" }, "Convert")))),
        !loaded && react_1.default.createElement(react_bootstrap_1.Spinner, { id: "custom-spinner", animation: "grow" })));
};
exports.default = Home;
