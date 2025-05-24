"use strict";
// src/lib/summarizer.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeText = summarizeText;
var ts = __importStar(require("typescript"));
var summary = require('node-summary');
var cache = new Map();
function codeSignatureSummary(text) {
    var _a;
    var sf = ts.createSourceFile('x.ts', text, ts.ScriptTarget.Latest, true);
    for (var _i = 0, _b = sf.statements; _i < _b.length; _i++) {
        var stmt = _b[_i];
        if (ts.isFunctionDeclaration(stmt) && stmt.name) {
            var name_1 = stmt.name.text;
            var params = stmt.parameters.map(function (p) { return p.name.getText(); }).join(', ');
            return "Function ".concat(name_1, "(").concat(params, ")");
        }
        if (ts.isClassDeclaration(stmt) && stmt.name) {
            var methods = stmt.members
                .filter(ts.isMethodDeclaration)
                .map(function (m) { return m.name.text + '(' +
                ((m.parameters || []).map(function (p) { return p.name.getText(); }).join(', ')) +
                ')'; });
            return "Class ".concat(stmt.name.text, " with methods: ").concat(methods.join(', '));
        }
        if (ts.isVariableStatement(stmt) && ((_a = stmt.modifiers) === null || _a === void 0 ? void 0 : _a.some(function (m) { return m.kind === ts.SyntaxKind.ExportKeyword; }))) {
            for (var _c = 0, _d = stmt.declarationList.declarations; _c < _d.length; _c++) {
                var decl = _d[_c];
                if (ts.isIdentifier(decl.name) &&
                    decl.initializer && ts.isArrowFunction(decl.initializer)) {
                    var name_2 = decl.name.text;
                    var params = decl.initializer.parameters.map(function (p) { return p.name.getText(); }).join(', ');
                    return "Function ".concat(name_2, "(").concat(params, ")");
                }
            }
        }
    }
    return null;
}
/**
* Summarize a block of text extractively.
* @param key  Unique cache key (e.g. file path)
* @param text Raw code or concatenated summaries
* @returns abbreviated summary
*/
function summarizeText(key, text) {
    return __awaiter(this, void 0, void 0, function () {
        var sig, out;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (cache.has(key))
                        return [2 /*return*/, cache.get(key)];
                    sig = codeSignatureSummary(text);
                    if (sig) {
                        cache.set(key, sig);
                        return [2 /*return*/, sig];
                    }
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            summary.summarize('doc', text, function (err, s) {
                                if (err)
                                    reject(err);
                                else
                                    resolve(s);
                            });
                        })];
                case 1:
                    out = _a.sent();
                    cache.set(key, out);
                    return [2 /*return*/, out];
            }
        });
    });
}
