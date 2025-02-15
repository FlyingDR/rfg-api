/*
 * rfg-api.js
 * https://github.com/RealFaviconGenerator/rfg-api.js
 *
 * Copyright (c) 2014 Philippe Bernard & Hayden Bleasel
 * Licensed under the MIT license.
 */

/*jslint node:true*/
module.exports.init = function() {

  'use strict';

  var exports = {};
  var https = require('https');
  var fs = require('fs');
  var unzip = require('node-unzip-2');
  var metaparser = require('metaparser');
  var fstream = require('fstream');
  var mkdirp = require('mkdirp');
  var axios = require('axios');

  exports.fileToBase64 = function(file, callback) {
    fs.readFile(file, { encoding: null }, function(error, file) {
      if (error) {
        callback(error);
      }
      else {
        callback(undefined, file.toString('base64'));
      }
    });
  };

  exports.fileToBase64Sync = function(file) {
    return fs.readFileSync(file, { encoding: null }).toString('base64');
  };

  exports.generateFavicon = function(request, dest, callback) {
    mkdirp(dest, function() {
      axios.post(
        "https://realfavicongenerator.net/api/favicon", {
          "favicon_generation": request
        }
      )
      .then(function(response) {
        var data = response.data;

        var writeStream = fstream.Writer(dest);
        writeStream.on('close', function() {
          callback(undefined, data.favicon_generation_result);
        });

        var parserStream = unzip.Parse();
        var request = https.get(data.favicon_generation_result.favicon.package_url, function (response) {
          response.pipe(parserStream).pipe(writeStream);
        });
      })
      .catch(function(error) {
        var err = (
          error &&
          error.data &&
          error.data.favicon_generation_result &&
          error.data.favicon_generation_result.result &&
          error.data.favicon_generation_result.result.error_message)
          ? error.data.favicon_generation_result.result.error_message
          : error;
        callback(err);
      });
    });
  };

  exports.injectFaviconMarkups = function(fileContent, htmlCode, opts, callback) {
    var defaultRemove = [
      'link[rel="mask-icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="icon"]',
      'link[rel^="apple-touch-icon"]',
      'link[rel="manifest"]',
      'link[rel="yandex-tableau-widget"]',
      'meta[name^="msapplication"]',
      'meta[name="mobile-web-app-capable"]',
      'meta[name="theme-color"]',
      'meta[property="og:image"]'
    ];
    var add = typeof html_code === 'string' ? [htmlCode] : htmlCode;
    var remove = defaultRemove;

    if (opts) {
      if (opts.add) {
        add = add.concat(typeof opts.add === 'string' ? [opts.add] : opts.add);
      }
      if (opts.remove) {
        remove = remove.concat(typeof opts.remove === 'string' ? [opts.remove] : opts.remove);
      }
      if (opts.keep) {
        if (typeof opts.keep === 'string') {
          opts.keep = [opts.keep];
        }
        for (var m in opts.keep) {
          var idx = remove.indexOf(opts.keep[m]);
          if (idx >= 0) {
            remove.splice(idx, 1);
          }
        }
      }
    }

    metaparser({
      data: fileContent,
      add: add,
      remove: remove,
      callback: function(error, html) {
        return callback(error, html);
      }
    });
  };

  exports.camelCaseToUnderscore = function(s) {
    // Regex will also insert an underscore before a digit if that digit is preceded by a lowercase letter and followed
    //  by one or more additional digits, so it will insert an underscore before the "8" and the "1" in
    //  "windows80Ie10Tile" (yielding "windows_80_ie_10_tile", but NOT before the "6" in "ios6AndPriorIcons" (yielding
    //  "ios6_and_prior_icons").
    return s.replace(/(?:^|\.?)([A-Z]|(?<=[a-z])\d(?=\d+))/g, function(x,y) {
      return "_" + y.toLowerCase()
    }).replace(/^_/, "");
  }

  exports.camelCaseToUnderscoreRequest = function(request) {
    if (request === undefined) {
      return undefined;
    }
    if (request.constructor === Array) {
      for (var i = 0; i < request.length; i++) {
        request[i] = exports.camelCaseToUnderscoreRequest(request[i]);
      }
    }
    else if (request.constructor === String) {
      return exports.camelCaseToUnderscore(request);
    }
    else if (request.constructor === Object) {
      var keys = Object.keys(request);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var uKey = exports.camelCaseToUnderscore(keys[j]);

        // Special case for some keys: content should be passed as is
        var keysToIgnore = [
          'scaling_algorithm',
          'name',
          'content',
          'param_name',
          'param_value',
          'description',
          'app_description',
          'developer_name',
          'app_name',
          'existing_manifest',
          'background_color',
          'theme_color',
          'desktop_browser'
        ];
        var newContent = (keysToIgnore.indexOf(uKey) >= 0)
          ? request[key]
          : exports.camelCaseToUnderscoreRequest(request[key]);

        if (key !== uKey) {
          request[uKey] = newContent;
          delete request[key];
        }
        else {
          request[key] = newContent;
        }
      }
    }

    return request;
  }

  function startsWith(str, prefix) {
    return str.lastIndexOf(prefix, 0) === 0;
  }

  exports.isUrl = function(urlOrPath) {
    return startsWith(urlOrPath, 'http://') ||
      startsWith(urlOrPath, 'https://') ||
      startsWith(urlOrPath, '//');
  }

  exports.isBase64 = function(content) {
    return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(content);
  }

  exports.normalizeMasterPicture = function(masterPicture) {
    var masterPictureObject = {};
    if (masterPicture.constructor === Object) {
      if ((masterPicture.type === 'inline') || (masterPicture.content !== undefined)) {
        masterPictureObject.type = 'inline';
        masterPictureObject.content =
          exports.isBase64(masterPicture.content)
            ? masterPicture.content
            : exports.fileToBase64Sync(masterPicture.content);
      }
      else if (masterPicture.url) {
        masterPictureObject.type = 'url';
        masterPictureObject.url = masterPicture.url;
      }
    }
    else if (exports.isUrl(masterPicture)) {
      masterPictureObject.type = 'url';
      masterPictureObject.url = masterPicture;
    }
    else {
      masterPictureObject.type = 'inline';
      masterPictureObject.content = exports.fileToBase64Sync(masterPicture);
    }
    return masterPictureObject;
  }

  exports.normalizeAllMasterPictures = function(request) {
    if (request.constructor === Array) {
      for (var i = 0; i < request.length; i++) {
        request[i] = exports.normalizeAllMasterPictures(request[i]);
      }
      return request;
    }
    else if (request.constructor === Object) {
      var keys = Object.keys(request);
      for (var j = 0; j < keys.length; j++) {
        if (keys[j] === 'master_picture') {
          request[keys[j]] = exports.normalizeMasterPicture(request[keys[j]]);
        }
        else {
          request[keys[j]] = exports.normalizeAllMasterPictures(request[keys[j]]);
        }
      }
      return request;
    }
    else {
      return request;
    }
  }

  // opts should contain:
  // - apiKey
  // - masterPicture (can be a URL or a path to a local file)
  // - iconsPath (or undefined if the files are in the root)
  // - design
  // - settings
  // - versioning
  exports.createRequest = function(opts) {
    // Build favicon generation request
    var request = {};
    request.api_key = opts.apiKey;
    // Master picture
    request.master_picture = exports.normalizeMasterPicture(opts.masterPicture);
    // Path
    request.files_location = {};
    if (opts.iconsPath === undefined) {
      request.files_location.type = 'root';
    }
    else {
      request.files_location.type = 'path';
      request.files_location.path = opts.iconsPath;
    }
    // Design
    request.favicon_design = exports.normalizeAllMasterPictures(
      exports.camelCaseToUnderscoreRequest(opts.design));

    // Settings
    if (opts.settings) {
      request.settings = exports.camelCaseToUnderscoreRequest(opts.settings);
    }

    // Versioning
    if (opts.versioning) {
      request.versioning = exports.camelCaseToUnderscoreRequest(opts.versioning);
    }

    return request;
  };

  exports.changeLog = function(sinceVersion, callback) {
    var versionParam = (sinceVersion == undefined) ? '' : "?since=" + sinceVersion;
    axios.get("https://realfavicongenerator.net/api/versions" + versionParam)
    .then(function(response) {
      callback(undefined, response.data);
    })
    .catch(function(error) {
      callback(error);
    });
  };

  exports.escapeJSONSpecialChars = function(json) {
    return json
      .replace(/\\n/g, "\\n")
      .replace(/\\'/g, "\\'")
      .replace(/\\"/g, '\\"')
      .replace(/\\&/g, "\\&")
      .replace(/\\r/g, "\\r")
      .replace(/\\t/g, "\\t")
      .replace(/\\b/g, "\\b")
      .replace(/\\f/g, "\\f");
  };

  return exports;
};
