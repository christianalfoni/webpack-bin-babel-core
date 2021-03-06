"use strict";

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

exports.__esModule = true;
exports.ExportDeclaration = ExportDeclaration;
exports.Scope = Scope;

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

var ModuleDeclaration = {
  enter: function enter(path, file) {
    var node = path.node;

    if (node.source) {
      node.source.value = file.resolveModuleSource(node.source.value);
    }
  }
};

exports.ModuleDeclaration = ModuleDeclaration;
var ImportDeclaration = {
  exit: function exit(path, file) {
    var node = path.node;

    var specifiers = [];
    var imported = [];
    file.metadata.modules.imports.push({
      source: node.source.value,
      imported: imported,
      specifiers: specifiers
    });

    for (var _iterator = (path.get("specifiers") /*: Array<Object>*/), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var specifier = _ref;

      var local = specifier.node.local.name;

      if (specifier.isImportDefaultSpecifier()) {
        imported.push("default");
        specifiers.push({
          kind: "named",
          imported: "default",
          local: local
        });
      }

      if (specifier.isImportSpecifier()) {
        var importedName = specifier.node.imported.name;
        imported.push(importedName);
        specifiers.push({
          kind: "named",
          imported: importedName,
          local: local
        });
      }

      if (specifier.isImportNamespaceSpecifier()) {
        imported.push("*");
        specifiers.push({
          kind: "namespace",
          local: local
        });
      }
    }
  }
};

exports.ImportDeclaration = ImportDeclaration;

function ExportDeclaration(path, file) {
  var node = path.node;

  var source = node.source ? node.source.value : null;
  var exports = file.metadata.modules.exports;

  // export function foo() {}
  // export let foo = "bar";
  var declar = path.get("declaration");
  if (declar.isStatement()) {
    var bindings = declar.getBindingIdentifiers();

    for (var _name in bindings) {
      exports.exported.push(_name);
      exports.specifiers.push({
        kind: "local",
        local: _name,
        exported: path.isExportDefaultDeclaration() ? "default" : _name
      });
    }
  }

  if (path.isExportNamedDeclaration() && node.specifiers) {
    for (var _iterator2 = (node.specifiers /*: Array<Object>*/), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _getIterator(_iterator2);;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var specifier = _ref2;

      var exported = specifier.exported.name;
      exports.exported.push(exported);

      // export foo from "bar";
      if (t.isExportDefaultSpecifier(specifier)) {
        exports.specifiers.push({
          kind: "external",
          local: exported,
          exported: exported,
          source: source
        });
      }

      // export * as foo from "bar";
      if (t.isExportNamespaceSpecifier(specifier)) {
        exports.specifiers.push({
          kind: "external-namespace",
          exported: exported,
          source: source
        });
      }

      var local = specifier.local;
      if (!local) continue;

      // export { foo } from "bar";
      // export { foo as bar } from "bar";
      if (source) {
        exports.specifiers.push({
          kind: "external",
          local: local.name,
          exported: exported,
          source: source
        });
      }

      // export { foo };
      // export { foo as bar };
      if (!source) {
        exports.specifiers.push({
          kind: "local",
          local: local.name,
          exported: exported
        });
      }
    }
  }

  // export * from "bar";
  if (path.isExportAllDeclaration()) {
    exports.specifiers.push({
      kind: "external-all",
      source: source
    });
  }
}

function Scope(path) {
  path.skip();
}