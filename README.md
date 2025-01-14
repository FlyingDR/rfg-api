# rfg-api

Implementation of the [RealFaviconGenerator API](http://realfavicongenerator.net/api)
for [Node.js](https://nodejs.org).

## Getting Started

This plugin implements the
[non-interactive API of RealFaviconGenerator.net](https://realfavicongenerator.net/api/non_interactive_api).
This API lets you create favicons for all platforms: desktop browsers, iOS, Android, etc.

To install it:

```shell
npm install rfg-api --save
```

## Release History

### 0.5.2

- Update dependencies to fix vulnerabilities, see https://github.com/RealFaviconGenerator/rfg-api/pull/23, https://github.com/RealFaviconGenerator/rfg-api/pull/22 and https://github.com/RealFaviconGenerator/rfg-api/pull/21
- Merge https://github.com/RealFaviconGenerator/rfg-api/pull/26 to fix https://github.com/RealFaviconGenerator/realfavicongenerator/issues/267, https://github.com/RealFaviconGenerator/gulp-real-favicon/issues/21 and https://github.com/RealFaviconGenerator/grunt-real-favicon/issues/43
- Merge https://github.com/RealFaviconGenerator/rfg-api/pull/24 to fix https://github.com/RealFaviconGenerator/realfavicongenerator/issues/449 and https://github.com/RealFaviconGenerator/realfavicongenerator/issues/458

### 0.5.1

- Update dependencies to fix vulnerabilities, see https://github.com/RealFaviconGenerator/rfg-api/pull/18, https://github.com/RealFaviconGenerator/rfg-api/pull/19, https://github.com/RealFaviconGenerator/rfg-api/pull/20 and https://github.com/RealFaviconGenerator/rfg-api/pull/21

### 0.5.0

- Switch from `unzip2` to `node-unzip-2`. See https://github.com/RealFaviconGenerator/rfg-api/pull/15

### 0.4.0

- Switch from `node-rest-client` to `axios` in order to fix vulnerabilities introduced by `node-rest-client` dependencies. See https://github.com/RealFaviconGenerator/rfg-api/issues/14

### 0.3.0

- Accept both base64 and file name for the "inline" type. See https://github.com/RealFaviconGenerator/rfg-api/issues/10

### 0.2.0

- Switch from `unzip` to `unzip2`. See https://github.com/RealFaviconGenerator/rfg-api/issues/8

### 0.1.7

- `injectFaviconMarkups` supports a `keep` option.

### 0.1.6

- Fix for `existing_manifest`.

### 0.1.5

- Add `escapeJSONSpecialChars`.

### 0.1.4

- Switch to HTTPS.

### 0.1.3

- Existing `rel=mask-icon` markups are filtered-out.

### 0.1.2

- Improvement in `normalizeMasterPicture`.

### 0.1.1

- `changeLog` added.

### 0.1.0

- `injectFaviconMarkups` now takes the HTML content directly, not a file name.

### 0.0.3

- In case of API invocation error, the error is transmitted to the callback
(instead of being thrown).

### 0.0.2

- Refactoring

### 0.0.1

- Initial release
