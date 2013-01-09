// osc parser. parses basic osc, 


var LibOSC = (function()
{
    if (!window.BlobBuilder && window.WebKitBlobBuilder)
        window.BlobBuilder = window.WebKitBlobBuilder;

    var instantiated;

    function init()
    {
        var KOMMA = 44;
        var ZERO = 0;

        //
        // Byte Utils
        //
        function int32BitToByte(value)
        {
            var array = [];
            for(var j = 3; j >= 0; --j)
            {
                temp = (value & 255);
                value = value >> 8;
                array[j] = temp;
            }
            return array;
        }

        function int32BitFromByte(message,offset)
        {
            var result = 0;
            for (var i = offset; i < offset + 4;i++)
            {        
                //result += message[i];     
                result += message.getUint8(i);  

                if (i < offset + 3) 
                {
                    result = result << 8;
                }
            }
            return result;
        }

        function float_to_bits(f)
        {
            var sign_bit = (f < 0) ? 1 : 0;
            var exp_temp = 0;
            var exponent = 0;
            var mantissa = 0;
            var man_temp = 0;
            var bits_as_int = 0;

            f = Math.abs(f);

            if (f >= 1) {
                exp_temp = Math.log(f) / Math.log(2);
                exp_temp = Math.floor(exp_temp);
            } 
            else
            {
                exp_temp = Math.log(1/f) / Math.log(2);
                exp_temp = - Math.floor(exp_temp);
            }

            exponent = exp_temp + 127;
            man_temp = f * (1 << (23 - exp_temp));
            mantissa = Math.floor(man_temp);

            bits_as_int = (sign_bit << 31) |(exponent << 23)| (mantissa & ((1 << 23) - 1));

            return bits_as_int;
        }

        function stringToByte(string)
        {
            var array = [];
            for(var i = 0; i < string.length; i++)
            {
                array.push(string.charCodeAt(i));
            }
            return array;
        }

        function int32ToByte(value)
        {
            return int32BitToByte(value);
        }

        function int64ToByte(number)
        {
            var result = int32BitToByte(number.highWord);
            result = result.concat(int32BitToByte(number.lowWord));

            return result;
        }

        function float32ToByte(value)
        {
            return int32BitToByte(float_to_bits(value));
        }

        function stringFromBytes(message,offset) // Message is ArrayBuffer
        {
            var result = "";
            var currentChar;
            var max = message.byteLength;

            while(offset < max)
            {
                currentChar = message.getUint8(offset);

                if(currentChar == ZERO)
                    break;

                offset += 1;
                result += String.fromCharCode(currentChar);
            }
            return {
                "result" : result, 
                "index" : offset
            };
        }

        function int32FromBytes(message,offset)
        {
            return message.getInt32(offset);
        }

        function int64FromBytes(message,offset)
        {
            if(offset == undefined)
            {
                offset = 0;
            }
            var result = new LibOSC.BigInt();

            result.highWord = message.getInt32(offset);
            result.lowWord =  message.getInt32(offset + 4); // CHECK INDEX!

            return result;
        }

        function float32FromBytes(message,offset)
        {
            return message.getFloat32(offset);
        }

        //
        //  OSC Utils
        //
        function align(index)
        {
            return index + 4 - (index %4);
        }

        function concatAndAlign(baseArray,scndArray)
        {
            baseArray = baseArray.concat(scndArray);
            return fillToFour(baseArray);
        }

        function fillToFour(array)
        {
            for(var needPadding = array.length % 4;needPadding < 4; needPadding++)
            {
                array.push(0);
            }
            return array;
        }

        function parseNullTerminatedString(message, offset)
        {
            return stringFromBytes(message,offset);
        }

        function parseTypeFlags(message, offset)
        {
            var result = new Array();
            var currentChar = message.getUint8(offset);
            var max = message.byteLength;
                    
            if(currentChar == KOMMA)
            {
                offset += 1;

                while(offset < max)
                {
                    currentChar = message.getUint8(offset);
                    if(currentChar == ZERO)
                        break;
                    
                    result.push(String.fromCharCode(currentChar));
                    offset += 1;
                }
                
                return {"typeFlags" : result, "index" : offset};
            }
            
            return null;
        }

        function parseValues (message,offset,typeFlags)
        {
            var results =  new Array(typeFlags.length);
            var currentChar = -1;

            for(var i = 0; i < typeFlags.length; i++)
            {
                var flag = typeFlags[i];

                if(flag == "i")
                { // 32 bit int
                    results[i] = int32FromBytes(message,offset);
                     offset = offset + 4;

                } 
                else if(flag == "s")
                {// string
                    var tempStringResult = stringFromBytes(message,offset);
                    results[i] = tempStringResult.result;
                    offset = tempStringResult.index;
                    offset = align(offset);

                } 
                else if(flag == "S")
                {// string
                    tempStringResult = stringFromBytes(message,offset);
                    results[i] = new LibOSC.Symbol(tempStringResult.result);
                    offset = tempStringResult.index;
                    offset = align(offset);
                } 
                else if(flag == "f")
                { // 32 bit float
                    results[i] = float32FromBytes(message,offset);
                    offset = offset + 4;
                    
                } 
                else if(flag == "h")
                { // 64 Bit int
                    results[i] = int64FromBytes(message,offset);
                    offset = offset + 8;
                }
                else if(flag == "T")
                { // 64 Bit int
                    results[i] = true;
                }
                else if(flag == "F")
                { // 64 Bit int
                    results[i] = false;
                }
                else if(flag == "N")
                { // 64 Bit int
                    results[i] = null;
                }
                else if(flag == "c")
                { // 64 Bit int
                    results[i] = String.fromCharCode(int32FromBytes(message,offset));
                    offset = offset + 4;
                }
                else if(flag == "r")
                {
                    results[i] = new LibOSC.Rgba(
                        message.getUint8(offset++),
                        message.getUint8(offset++),
                        message.getUint8(offset++),
                        message.getUint8(offset++)
                    );
                }
                else if(flag == "m")
                {
                    results[i] = new LibOSC.Midi(
                        message.getUint8(offset++),
                        message.getUint8(offset++),
                        message.getUint8(offset++),
                        message.getUint8(offset++)
                    );
                }
                else if(flag == "b")
                {
                    var size = int32FromBytes(message,offset);
                    offset = offset + 4;
                   
                    var slice = message.buffer.slice(offset, offset + size);
                    
                    var blob_builder = new BlobBuilder();
                    blob_builder.append(slice);
                    var blob = blob_builder.getBlob();
                    results[i] = blob;
                    offset += size - 1;
                    offset = align(offset);
                }
                else
                {
                    console.log(flag);
                    //TODO 
                    //rest of parsing see specifications on osc website
                }
            }   
            return results;
        }

        // PUBLIC FUNCTIONS
        return {

            createOSCMsg : function(address, typeArray, valueArray)
            {
                var byteArray = [];

                byteArray = concatAndAlign(byteArray, stringToByte(address));
                byteArray.push(KOMMA);
                byteArray = concatAndAlign(byteArray, stringToByte(typeArray.join("")));

                for(var i = 0; i < typeArray.length; i++)
                {
                    if(typeArray[i] == "i")
                    {
                        // 32 bit int
                        byteArray = byteArray.concat(int32ToByte(valueArray[i]));
                    } 
                    else if(typeArray[i] == "f")
                    {
                        // 32 bit float
                        byteArray = byteArray.concat(float32ToByte(valueArray[i]));
                    } 
                    else if(typeArray[i] == "s")
                    {
                        // string
                        byteArray = concatAndAlign(byteArray, stringToByte(valueArray[i]));
                    } 
                    else if(typeArray[i] == "h")
                    {
                        // BigInt
                        byteArray = byteArray.concat(int64ToByte(valueArray[i]));
                    }
                }
                return byteArray;
            },
            
            parseOSCMsg : function(message)
            {
                // initiliaze result & index offset
                var result = {};
                var offset = 0;

                var tempResult = parseNullTerminatedString(message, offset);
                var bundle = tempResult.result;
                offset = align(tempResult.index);
                
                if(bundle != "#bundle")
                {
                    // error
                }
                
                // timestamp
                result.time = int64FromBytes(message,offset);
                offset += 8;
                
                // bundle element size
                var size = int32FromBytes(message,offset);
                offset += 4;
                
                // read in address pattern
                tempResult = parseNullTerminatedString(message, offset);

                offset = align(tempResult.index);
                result.address = tempResult.result;

                // read in typeflags
                tempResult = parseTypeFlags(message,offset);

                offset = align(tempResult.index);
                result.typeFlags = tempResult.typeFlags;

                // read in values
                tempResult = parseValues(message,offset,result.typeFlags);

                result.values = tempResult;

                return result;    
            }
        }
    }

    return {
        // singleton
        getInstance : function()
        {
            if (!instantiated)
            {
                instantiated = init();
            }
            return instantiated; 
        },
        
        //
        // Classes in the LibOSC namespace
        //
        Symbol : function(value)
        {
            if(value)
                this.value = value;
            else
                this.value = "";
            
            this.toString = function()
            {
                return this.value;
            };
        },

        Rgba : function(r, g, b, a)
        {
            if(r)
                this.r = r;
            else
                this.r = 0;

            if(g)
                this.g = g;
            else
                this.g = 0;

            if(b)
                this.b = b;
            else
                this.b = 0;

            if(a)
                this.a = a;
            else
                this.a = 0;
            
            this.toString = function()
            {
                return "{" + this.r + "," + this.g + "," + this.b + "," + this.a + "}";
            };
        },

        Midi : function(id, status, data1, data2)
        {
            if(id)
                this.id = id;
            else
                this.id = 0;

            if(status)
                this.status = status;
            else
                this.status = 0;

            if(data1)
                this.data1 = data1;
            else
                this.data1 = 0;

            if(data2)
                this.data2 = data2;
            else
                this.data2 = 0;
            
            this.toString = function()
            {
                return "{" + this.id + "," + this.status + "," + this.data1 + "," + this.data2 + "}";
            };
        },
        BigIntFill: ["","0","00","000","0000","00000","0000000","0000000"],
        BigInt: function()
        {
            // 64 bit integer for JavaScript.
            this.highWord = 0;
            this.lowWord = 0;
            // used for hex printing

            this.toString = function()
            {
                var string = this.highWord + ":" + this.lowWord;
                return string;
            };

            this.toHex = function()
            {
                var highHex = this.highWord.toString(16);
                var lowHex = this.lowWord.toString(16);

                return "0x" + fill[8 - highHex.length] + highHex + LibOSC.BigIntFill[8 - lowHex.length] + lowHex;
            };

            this.isEqual = function(number)
            {
                if(number.highWord == this.highWord && number.lowWord == this.lowWord){
                    return true;
                }
                return false;
            };

        }
    }
})();