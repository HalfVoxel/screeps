  /**
   * @author bhouston / http://exocortex.com/
   * Original source from: 2013, April 22: https://github.com/niklasvh/base64-arraybuffer (MIT-LICENSED)
   */
  
  var THREE = function() {};
  /**
   * @author bhouston / http://exocortex.com/
   * Original source from: 2013, April 22: https://github.com/niklasvh/base64-arraybuffer (MIT-LICENSED)
   */
  
  THREE.Base64 = function () {
  };
  
  // Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
  // use window.btoa' step. According to my tests, this appears to be a faster approach:
  // http://jsperf.com/encoding-xhr-image-data/5
  // source: https://gist.github.com/jonleighton/958841
  THREE.Base64.fromArrayBuffer = function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
      i, len = bytes.buffer.byteLength, base64 = "";
    

    for (i = 0; i < len; i+=3) {
      base64 += THREE.Base64.base64String[bytes[i] >> 2];
      base64 += THREE.Base64.base64String[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += THREE.Base64.base64String[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += THREE.Base64.base64String[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }
  
    return base64;
  };
  
  THREE.Base64.fromArrayBuffer = function ( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa( binary );
};

  THREE.Base64.base64String = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  
  THREE.Base64.base64ToIndexSlow = function( c ) {
    return THREE.Base64.base64String.indexOf( c );
  };
  
  THREE.Base64.base64ToIndex = function() {
    var indexOfA = "A".charCodeAt(0);
    var indexOfZ = "Z".charCodeAt(0);
    var indexOfa = "a".charCodeAt(0);
    var indexOfz = "z".charCodeAt(0);
    var indexOf0 = "0".charCodeAt(0);
    var indexOf9 = "9".charCodeAt(0);
    var indexOfSlash = "/".charCodeAt(0);
    var indexOfPlus = "+".charCodeAt(0);
  
    return function( index ) {
      if( index < indexOfA ) {
        if( index >= indexOf0 ) {
          // 0-9
          return 52 + index - indexOf0;
        }
        if( index === indexOfPlus ) {
          // +
          return 62
        }
        // /
        return 63;
      }
      if( index <= indexOfZ ) {
        // A-Z
        return index - indexOfA;      
      }
      // a-z
      return 26 + index - indexOfa;
    };
  
  }();
  
  
  THREE.Base64.base64ToIndexNew = function() {
    var test = {};
    for(var i = 0;i< THREE.Base64.base64String.length;i++){
      
      test[THREE.Base64.base64String[i]] = i;
  
    };
  
    /*return function(index){
      return test[index];
    };*/
    return test;

  }();
  
  THREE.Base64.toArrayBuffer = function() {
  
    var base64ToIndex = THREE.Base64.base64ToIndex;
    //var arraybuffer = new ArrayBuffer (50000);

    return function(base64) {
  
      var bufferLength = base64.length * 0.75,
        len = base64.length, i, p = 0,
        encoded1, encoded2, encoded3, encoded4;
  
      if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
          bufferLength--;
        }
      }

      //if (arraybuffer.byteLength < bufferLength) {
        var arraybuffer = new ArrayBuffer(bufferLength);
      //}
      var bytes = new Uint8Array(arraybuffer);
  
      for (i = 0; i < len; i+=4) {
        encoded1 = THREE.Base64.base64ToIndexNew[base64[i]];
        encoded2 = THREE.Base64.base64ToIndexNew[base64[i+1]];
        encoded3 = THREE.Base64.base64ToIndexNew[base64[i+2]];
        encoded4 = THREE.Base64.base64ToIndexNew[base64[i+3]];
  
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
      }
  
      //return {data: arraybuffer, length: bufferLength};
      return arraybuffer;
    };
  
  }();
  
  

  THREE.Base64.toArrayOfFloats = function( base64 ) {
    
    var arrayBuffer = THREE.Base64.toArrayBuffer( base64 );
    var floatArray = new Float32Array( arrayBuffer );
    var length = floatArray.length;

    var arrayOfFloats = [];
    for( var i = 0; i < length; i ++ ) {
      arrayOfFloats.push( floatArray[i] );
    }
  
    return arrayOfFloats;
  
  };