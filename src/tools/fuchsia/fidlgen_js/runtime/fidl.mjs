// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This is the JS runtime support library for code generated by fidlgen_js. It
// mostly consists of helpers to facilitate encoding and decoding of FIDL
// messages.

const $fidl_kInitialBufferSize = 1024;

const $fidl_kMessageHeaderSize = 16;
const $fidl_kMessageTxidOffset = 0;
const $fidl_kMessageOrdinalOffset = 12;

const $fidl__kAlignment = 8;
const $fidl__kAlignmentMask = 0x7;

const $fidl__kLE = true;

const $fidl__kUserspaceTxidMask = 0x7fffffff;
var $fidl__nextTxid = 1;

function $fidl__align(size) {
  return size + (($fidl__kAlignment - (size & $fidl__kAlignmentMask)) &
                 $fidl__kAlignmentMask);
}

/**
 * @constructor
 * @param {number} ordinal
 */
function $fidl_Encoder(ordinal) {
  var buf = new ArrayBuffer($fidl_kInitialBufferSize);
  this.data = new DataView(buf);
  this.extent = 0;
  this.handles = [];
  this.outOfLine = [];
  this._encodeMessageHeader(ordinal);
}

/**
 * @param {number} ordinal
 */
$fidl_Encoder.prototype._encodeMessageHeader = function(ordinal) {
  this.alloc($fidl_kMessageHeaderSize);
  var txid = $fidl__nextTxid++ & $fidl__kUserspaceTxidMask;
  this.data.setUint32($fidl_kMessageTxidOffset, txid, $fidl__kLE);
  this.data.setUint32($fidl_kMessageOrdinalOffset, ordinal, $fidl__kLE);
};

/**
 * @param {number} size
 */
$fidl_Encoder.prototype.alloc = function(size) {
  var offset = this.extent;
  this._claimMemory($fidl__align(size));
  return offset;
};

/**
 * @param {number} claimSize
 */
$fidl_Encoder.prototype._claimMemory = function(claimSize) {
  this.extent += claimSize;
  if (this.extent > this.data.byteLength) {
    var newSize = this.data.byteLength + claimSize;
    newSize += newSize * 2;
    this._grow(newSize);
  }
};

/**
 * @param {number} newSize
 */
$fidl_Encoder.prototype._grow = function(newSize) {
  var newBuffer = new ArrayBuffer(newSize);
  new Uint8Array(newBuffer).set(new Uint8Array(this.data.buffer));
  this.data = new DataView(newBuffer);
};

$fidl_Encoder.prototype.messageData = function() {
  // Add all out of line data.
  var len = this.outOfLine.length;
  for (var i = 0; i < len; i++) {
    this.outOfLine[i][0](this, this.outOfLine[i][1]);
  }

  // Return final result.
  return new DataView(this.data.buffer, 0, this.extent);
};

$fidl_Encoder.prototype.messageHandles = function() {
  return this.handles;
};


/**
 * @constructor
 * @param {Array} data
 * @param {Array} handles
 */
function $fidl_Decoder(data, handles) {
  this.data = data;
  this.handles = handles;
  this.nextOffset = 0;
  this.nextHandle = 0;
  this.claimMemory($fidl_kMessageHeaderSize);
}

/**
 * @param {number} size
 */
$fidl_Decoder.prototype.claimMemory = function(size) {
  var result = this.nextOffset;
  this.nextOffset = $fidl__align(this.nextOffset + size);
  return result;
}

$fidl_Decoder.prototype.claimHandle = function() {
  return this.handles[this.nextHandle++];
}


// Type tables and encoding helpers for generated Proxy code.
const _kTT_bool = {
  enc: function(e, o, v) { e.data.setInt8(o, v ? 1 : 0); },
  dec: function(d, o) { return d.data.getInt8(o) != 0; },
};

const _kTT_int8 = {
  enc: function(e, o, v) { e.data.setInt8(o, v); },
  dec: function(d, o) { return d.data.getInt8(o); },
};

const _kTT_int16 = {
  enc: function(e, o, v) { e.data.setInt16(o, v, $fidl__kLE); },
  dec: function(d, o) { return d.data.getInt16(o, $fidl__kLE); },
};

const _kTT_int32 = {
  enc: function(e, o, v) { e.data.setUint32(o, v, $fidl__kLE); },
  dec: function(d, o) { return d.data.getInt32(o, $fidl__kLE); },
};

const _kTT_uint8 = {
  enc: function(e, o, v) { e.data.setUint8(o, v); },
  dec: function(d, o) { return d.data.getUint8(o); },
};

const _kTT_uint16 = {
  enc: function(e, o, v) { e.data.setUint16(o, v, $fidl__kLE); },
  dec: function(d, o) { return d.data.getUint16(o, $fidl__kLE); },
};

const _kTT_uint32 = {
  enc: function(e, o, v) { e.data.setUint32(o, v, $fidl__kLE); },
  dec: function(d, o) { return d.data.getUint32(o, $fidl__kLE); },
};

const _kTT_String_Nonnull = {
  enc: function(e, o, v) {
    if (v === null || v === undefined) throw "non-null string required";
    // Both size and data are uint64, but that's awkward in JS, so for now only
    // support a maximum of 32b lengths.
    var asUtf8 = zx.strToUtf8Array(v);
    e.data.setUint32(o, asUtf8.length, $fidl__kLE);
    e.data.setUint32(o + 4, 0, $fidl__kLE);
    e.data.setUint32(o + 8, 0xffffffff, $fidl__kLE);
    e.data.setUint32(o + 12, 0xffffffff, $fidl__kLE);
    e.outOfLine.push([$fidl_OutOfLineStringEnc, asUtf8]);
  },
  dec: function(d, o) {
    var len = d.data.getUint32(o, $fidl__kLE);
    var pointer = d.data.getUint32(o + 8, $fidl__kLE);
    if (pointer === 0) throw "non-null string required";
    var dataOffset = d.claimMemory(len);
    return zx.utf8ArrayToStr(new DataView(d.data.buffer, dataOffset, len));
  }
};

function $fidl_OutOfLineStringEnc(e, strAsUtf8Array) {
  var start = e.alloc(strAsUtf8Array.length);
  for (var i = 0; i < strAsUtf8Array.length; i++) {
    e.data.setUint8(start + i, strAsUtf8Array[i], $fidl__kLE);
  }
}
