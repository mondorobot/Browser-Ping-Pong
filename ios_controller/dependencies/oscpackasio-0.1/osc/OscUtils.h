//
//  OscUtils.h
//  Hydrogen_OscOsxReceiver
//
//  Created by Rick Boykin on 11/28/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __Hydrogen_OscOsxReceiver__OscUtils__
#define __Hydrogen_OscOsxReceiver__OscUtils__

#include <iostream>
#include "OscTypes.h"

namespace osc
{
    const char* FindStr4End( const char *p );
    const char* FindStr4End( const char *p, const char *end );

    int32 ToInt32( const char *p );
    uint32 ToUInt32( const char *p );
    int64 ToInt64( const char *p );
    uint64 ToUInt64( const char *p );
    
    void FromInt32( char *p, int32 x );
    void FromUInt32( char *p, uint32 x );
    void FromInt64( char *p, int64 x );
    void FromUInt64( char *p, uint64 x );
}

#endif /* defined(__Hydrogen_OscOsxReceiver__OscUtils__) */
